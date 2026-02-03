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

header("Content-Type: text/html");
?>
<!DOCTYPE html>
<html>
<head><title>PHP Echo</title></head>
<body>
    <h1>PHP Request Echo</h1>
    <hr>
    <p><b>Hostname:</b> <?php echo htmlspecialchars($hostname); ?></p>
    <p><b>Date/Time:</b> <?php echo $now; ?></p>
    <p><b>User Agent:</b> <?php echo htmlspecialchars($user_agent); ?></p>
    <p><b>IP Address:</b> <?php echo htmlspecialchars($user_ip); ?></p>
    <p><b>HTTP Method:</b> <?php echo htmlspecialchars($method); ?></p>
    <p><b>Protocol:</b> <?php echo htmlspecialchars($protocol); ?></p>
    <p><b>Query String:</b> <?php echo htmlspecialchars($query_string); ?></p>
    <p><b>Message Body:</b> <?php echo htmlspecialchars($body_data); ?></p>
</body>
</html>