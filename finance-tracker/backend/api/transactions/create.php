<?php
require_once("../../utils/cors.php");
require_once("../../config/database.php");
require_once("../../utils/response.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse("error", [], "Method not allowed"); exit;
}

$data = json_decode(file_get_contents("php://input"));

if (
    empty($data->user_id) || empty($data->category_id) ||
    empty($data->amount)  || empty($data->type) || empty($data->date)
) {
    jsonResponse("error", [], "Required fields missing"); exit;
}

if (!in_array($data->type, ['income','expense'])) {
    jsonResponse("error", [], "Invalid type"); exit;
}
if (!is_numeric($data->amount) || $data->amount <= 0) {
    jsonResponse("error", [], "Invalid amount"); exit;
}

try {
    $db = (new Database())->connect();
} catch (Exception $e) {
    jsonResponse("error", [], "Database error"); exit;
}

$stmt = $db->prepare("
    INSERT INTO transactions (user_id, category_id, amount, type, description, date)
    VALUES (?, ?, ?, ?, ?, ?)
");
$ok = $stmt->execute([
    intval($data->user_id),
    intval($data->category_id),
    floatval($data->amount),
    $data->type,
    isset($data->description) ? trim($data->description) : null,
    $data->date,
]);

if ($ok) {
    jsonResponse("success", ["id" => (int)$db->lastInsertId()], "Transaction created");
} else {
    jsonResponse("error", [], "Failed to create transaction");
}
?>