<?php

require_once("../../utils/cors.php");  

include("../../config/database.php");
include("../../models/User.php");
include("../../utils/response.php");

$db = (new Database())->connect();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $result = $user->login($data->email, $data->password);

    if ($result) {
        unset($result['password']);
        jsonResponse("success", $result, "Login successful");
    } else {
        jsonResponse("error", [], "Invalid email or password");
    }
} else {
    jsonResponse("error", [], "Please fill all fields");
}
?>