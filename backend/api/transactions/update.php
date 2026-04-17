<?php
require_once("../../utils/cors.php");
require_once("../../config/database.php");
require_once("../../utils/response.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse("error", [], "Method not allowed"); exit;
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id) || empty($data->user_id)) {
    jsonResponse("error", [], "Missing id or user_id"); exit;
}

try {
    $db = (new Database())->connect();
} catch (Exception $e) {
    jsonResponse("error", [], "Database error"); exit;
}

/* Build dynamic SET clause */
$fields = [];
$params = [];

if (!empty($data->category_id)) { $fields[] = "category_id = ?"; $params[] = intval($data->category_id); }
if (!empty($data->amount))      { $fields[] = "amount = ?";      $params[] = floatval($data->amount);    }
if (!empty($data->type))        { $fields[] = "type = ?";        $params[] = $data->type;                }
if (!empty($data->date))        { $fields[] = "date = ?";        $params[] = $data->date;                }
if (isset($data->description))  { $fields[] = "description = ?"; $params[] = trim($data->description);  }

if (empty($fields)) {
    jsonResponse("error", [], "No fields to update"); exit;
}

$params[] = intval($data->id);
$params[] = intval($data->user_id);

$sql = "UPDATE transactions SET " . implode(", ", $fields) .
       " WHERE id = ? AND user_id = ?";

$stmt = $db->prepare($sql);
$ok   = $stmt->execute($params);

if ($ok && $stmt->rowCount() > 0) {
    jsonResponse("success", [], "Transaction updated");
} elseif ($ok) {
    jsonResponse("error", [], "Transaction not found or no changes made");
} else {
    jsonResponse("error", [], "Failed to update transaction");
}
?>