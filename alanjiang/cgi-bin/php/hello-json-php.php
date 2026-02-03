<?php
$now = date("Y-m-d H:i:s");
$user_ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

header("Content-Type: application/json");

$json_data = [
    "greetings from" => "Alan",
    "language" => "PHP " . phpversion(),
    "generated_at" => $now,
    "user_ip" => $user_ip
];

echo json_encode($json_data, JSON_PRETTY_PRINT);
?>