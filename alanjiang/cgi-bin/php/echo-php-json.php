<?php
$now = date("Y-m-d H:i:s");
$method = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? $_SERVER['REQUEST_METHOD'] ?? 'GET';
$method = strtoupper($method);
$protocol = $_SERVER['SERVER_PROTOCOL'] ?? 'HTTP/1.1';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$user_ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$hostname = $_SERVER['HTTP_HOST'] ?? 'Unknown';
$query_string = $_SERVER['QUERY_STRING'] ?? '';

// Read request body
$body_data = '';
if ($method !== 'GET') {
    $body_data = file_get_contents('php://input');
}

header("Content-Type: application/json");

$response = [
    "hostname" => $hostname,
    "datetime" => $now,
    "user_agent" => $user_agent,
    "ip_address" => $user_ip,
    "http_method" => $method,
    "protocol" => $protocol,
    "query_string" => $query_string,
    "message_body" => $body_data
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>