<?php
require_once("../../utils/cors.php");
require_once("../../config/database.php");
require_once("../../utils/response.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse("error", [], "Method not allowed"); exit;
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->name) || empty($data->type)) {
    jsonResponse("error", [], "Name and type are required"); exit;
}
if (!in_array($data->type, ['income','expense'])) {
    jsonResponse("error", [], "Type must be income or expense"); exit;
}

$name = trim($data->name);
if (strlen($name) > 50) {
    jsonResponse("error", [], "Name too long"); exit;
}

try {
    $db = (new Database())->connect();
} catch (Exception $e) {
    jsonResponse("error", [], "Database error"); exit;
}

// Checking for duplicates
$check = $db->prepare("SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND type = ?");
$check->execute([$name, $data->type]);
if ($check->fetch()) {
    jsonResponse("error", [], "Category already exists"); exit;
}

$stmt = $db->prepare("INSERT INTO categories (name, type) VALUES (?, ?)");
$ok   = $stmt->execute([$name, $data->type]);

if ($ok) {
    jsonResponse("success", ["id" => (int)$db->lastInsertId()], "Category created");
} else {
    jsonResponse("error", [], "Failed to create category");
}
?>