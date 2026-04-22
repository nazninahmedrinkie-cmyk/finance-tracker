<?php
require_once("../../utils/cors.php");
require_once("../../config/database.php");
require_once("../../utils/response.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse("error", [], "Method not allowed"); exit;
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->user_id) || empty($data->name)) {
    jsonResponse("error", [], "user_id and name required"); exit;
}

$name = trim($data->name);
if (strlen($name) < 2 || strlen($name) > 100) {
    jsonResponse("error", [], "Name must be 2–100 characters"); exit;
}

try {
    $db = (new Database())->connect();
} catch (Exception $e) {
    jsonResponse("error", [], "Database error"); exit;
}

$stmt = $db->prepare("UPDATE users SET name = ? WHERE id = ?");
$ok   = $stmt->execute([$name, intval($data->user_id)]);

if ($ok && $stmt->rowCount() > 0) {
    jsonResponse("success", ["name" => $name], "Profile updated");
} else {
    jsonResponse("error", [], "User not found or no changes");
}
?>