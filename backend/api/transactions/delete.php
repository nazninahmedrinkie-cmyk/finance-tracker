<?php
require_once("../../utils/cors.php");
require_once("../../config/database.php");
require_once("../../utils/response.php");

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse("error", [], "Method not allowed"); exit;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    jsonResponse("error", [], "Invalid transaction id"); exit;
}

try {
    $db = (new Database())->connect();
} catch (Exception $e) {
    jsonResponse("error", [], "Database error"); exit;
}

$stmt = $db->prepare("DELETE FROM transactions WHERE id = ?");
$ok   = $stmt->execute([$id]);

if ($ok && $stmt->rowCount() > 0) {
    jsonResponse("success", [], "Transaction deleted");
} else {
    jsonResponse("error", [], "Transaction not found");
}
?>