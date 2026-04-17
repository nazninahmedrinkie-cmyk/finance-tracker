<?php
require_once("../../utils/cors.php");
require_once("../../config/database.php");
require_once("../../utils/response.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse("error", [], "Method not allowed"); exit;
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->user_id) || empty($data->current_password) || empty($data->new_password)) {
    jsonResponse("error", [], "All fields required"); exit;
}
if (strlen($data->new_password) < 6) {
    jsonResponse("error", [], "New password must be at least 6 characters"); exit;
}

try {
    $db = (new Database())->connect();
} catch (Exception $e) {
    jsonResponse("error", [], "Database error"); exit;
}

// Fetching current hash
$stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
$stmt->execute([intval($data->user_id)]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    jsonResponse("error", [], "User not found"); exit;
}

if (!password_verify($data->current_password, $user['password'])) {
    jsonResponse("error", [], "Current password is incorrect"); exit;
}

$newHash = password_hash($data->new_password, PASSWORD_BCRYPT);
$upd     = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
$ok      = $upd->execute([$newHash, intval($data->user_id)]);

if ($ok) {
    jsonResponse("success", [], "Password changed successfully");
} else {
    jsonResponse("error", [], "Failed to update password");
}
?>