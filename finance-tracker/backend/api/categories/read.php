<?php
require_once("../../utils/cors.php");
require_once("../../config/database.php");
require_once("../../utils/response.php");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse("error", [], "Method not allowed"); exit;
}

try {
    $db = (new Database())->connect();
} catch (Exception $e) {
    jsonResponse("error", [], "Database error"); exit;
}

// filter by type
$where  = [];
$params = [];

if (!empty($_GET['type']) && in_array($_GET['type'], ['income','expense'])) {
    $where[]  = "type = ?";
    $params[] = $_GET['type'];
}

$sql = "SELECT id, name, type FROM categories";
if ($where) $sql .= " WHERE " . implode(" AND ", $where);
$sql .= " ORDER BY type, name";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$cats = $stmt->fetchAll(PDO::FETCH_ASSOC);

$cats = array_map(function($c) {
    $c['id'] = intval($c['id']);
    return $c;
}, $cats);

jsonResponse("success", $cats, "Categories fetched");
?>