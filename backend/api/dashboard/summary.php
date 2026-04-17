<?php

require_once("../../utils/cors.php");
require_once("../../config/database.php");
require_once("../../utils/response.php");

  # Getting requests are accepted
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse("error", [], "Method not allowed");
    exit;
}

  # Validating user_id query param
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    jsonResponse("error", [], "Invalid or missing user_id");
    exit;
}

  # Database connection
try {
    $db = (new Database())->connect();
} catch (Exception $e) {
    jsonResponse("error", [], "Database connection failed");
    exit;
}

   # Total income, total expense, counts
$stmt = $db->prepare("
    SELECT
        SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
        COUNT(CASE WHEN type = 'income'  THEN 1 END)           AS income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END)           AS expense_count,
        COUNT(*)                                                AS total_transactions
    FROM transactions
    WHERE user_id = ?
");
$stmt->execute([$user_id]);
$totals = $stmt->fetch(PDO::FETCH_ASSOC);

$total_income  = floatval($totals['total_income']  ?? 0);
$total_expense = floatval($totals['total_expense'] ?? 0);
$net_balance   = $total_income - $total_expense;
$savings_rate  = $total_income > 0
    ? round(($net_balance / $total_income) * 100, 1)
    : 0;

   #  Monthly breakdown
$stmt = $db->prepare("
    SELECT
        DATE_FORMAT(date, '%b %y') AS month,
        DATE_FORMAT(date, '%Y-%m') AS month_key,
        SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
    FROM transactions
    WHERE user_id = ?
      AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(date, '%Y-%m'), DATE_FORMAT(date, '%b %y')
    ORDER BY month_key ASC
");
$stmt->execute([$user_id]);
$monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);

   # Expense breakdown by category
$stmt = $db->prepare("
    SELECT
        c.name  AS category,
        t.type,
        SUM(t.amount) AS total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
    GROUP BY c.name, t.type
    ORDER BY total DESC
");
$stmt->execute([$user_id]);
$categoryRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$income_by_category  = [];
$expense_by_category = [];
foreach ($categoryRows as $row) {
    if ($row['type'] === 'income') {
        $income_by_category[]  = ['name' => $row['category'], 'value' => floatval($row['total'])];
    } else {
        $expense_by_category[] = ['name' => $row['category'], 'value' => floatval($row['total'])];
    }
}

   # Recent 5 transactions
$stmt = $db->prepare("
    SELECT
        t.id,
        t.amount,
        t.type,
        t.description,
        t.date,
        c.name AS category_name
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT 5
");
$stmt->execute([$user_id]);
$recent = $stmt->fetchAll(PDO::FETCH_ASSOC);

   # Highest expense category this month
$stmt = $db->prepare("
    SELECT c.name AS category, SUM(t.amount) AS total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
      AND t.type = 'expense'
      AND MONTH(t.date) = MONTH(CURDATE())
      AND YEAR(t.date)  = YEAR(CURDATE())
    GROUP BY c.name
    ORDER BY total DESC
    LIMIT 1
");
$stmt->execute([$user_id]);
$top_expense_category = $stmt->fetch(PDO::FETCH_ASSOC);

   # Build response payload
$data = [
    "total_income"         => $total_income,
    "total_expense"        => $total_expense,
    "net_balance"          => $net_balance,
    "savings_rate"         => $savings_rate,
    "income_count"         => intval($totals['income_count']),
    "expense_count"        => intval($totals['expense_count']),
    "total_transactions"   => intval($totals['total_transactions']),

    // Chart data
    "monthly_data"         => array_map(function($m) {
        return [
            'month'   => $m['month'],
            'income'  => floatval($m['income']),
            'expense' => floatval($m['expense']),
        ];
    }, $monthly),

    "income_by_category"   => $income_by_category,
    "expense_by_category"  => $expense_by_category,

    "recent_transactions"  => array_map(function($tx) {
        return [
            'id'            => intval($tx['id']),
            'amount'        => floatval($tx['amount']),
            'type'          => $tx['type'],
            'description'   => $tx['description'],
            'date'          => $tx['date'],
            'category_name' => $tx['category_name'],
        ];
    }, $recent),

    "top_expense_category" => $top_expense_category
        ? ['name' => $top_expense_category['category'], 'total' => floatval($top_expense_category['total'])]
        : null,
];

jsonResponse("success", $data, "Dashboard summary fetched successfully");
?>  