<?php

function jsonResponse($status, $data = [], $message = "") {
    echo json_encode([
        "status"  => $status,
        "data"    => $data,
        "message" => $message
    ]);
    exit();
}
?>