<?php
require_once("../../utils/cors.php");
require_once("../../config/database.php");
require_once("../../utils/response.php");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse("error", [], "Method not allowed");
    exit;
}

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    jsonResponse("error", [], "Invalid user_id");
    exit;
}

try {
    $db = (new Database())->connect();
} catch (Exception $e) {
    jsonResponse("error", [], "Database connection failed");
    exit;
}

$where  = ["t.user_id = ?"];
$params = [$user_id];

if (!empty($_GET['type']) && in_array($_GET['type'], ['income','expense'])) {
    $where[]  = "t.type = ?";
    $params[] = $_GET['type'];
}
if (!empty($_GET['category_id'])) {
    $where[]  = "t.category_id = ?";
    $params[] = intval($_GET['category_id']);
}
if (!empty($_GET['from'])) {
    $where[]  = "t.date >= ?";
    $params[] = $_GET['from'];
}
if (!empty($_GET['to'])) {
    $where[]  = "t.date <= ?";
    $params[] = $_GET['to'];
}

$whereSQL = implode(" AND ", $where);

$stmt = $db->prepare("
    SELECT
        t.id,
        t.user_id,
        t.category_id,
        t.amount,
        t.type,
        t.description,
        t.date,
        t.created_at,
        c.name AS category_name
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE {$whereSQL}
    ORDER BY t.date DESC, t.created_at DESC
");
$stmt->execute($params);
$transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* Cast types */
$transactions = array_map(function($tx) {
    $tx['id']          = intval($tx['id']);
    $tx['user_id']     = intval($tx['user_id']);
    $tx['category_id'] = intval($tx['category_id']);
    $tx['amount']      = floatval($tx['amount']);
    return $tx;
}, $transactions);

jsonResponse("success", $transactions, "Transactions fetched successfully");
?>