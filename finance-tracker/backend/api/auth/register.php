<?php
require_once("../../utils/cors.php"); 

include("../../config/database.php");
include("../../models/User.php");
include("../../utils/response.php");

$db = (new Database())->connect();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    $result = $user->register($data->name, $data->email, $data->password);

    if ($result === "success") {
        jsonResponse("success", [], "User registered successfully");
    } elseif ($result === "exists") {
        jsonResponse("error", [], "Email already exists");
    } else {
        jsonResponse("error", [], "Registration failed");
    }
} else {
    jsonResponse("error", [], "All fields are required");
}
?>