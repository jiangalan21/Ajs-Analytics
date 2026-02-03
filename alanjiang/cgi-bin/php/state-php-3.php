<?php
$display_val = $_COOKIE['session_data'] ?? 'No data found.';
$user_ip = $_COOKIE['user_ip'] ?? 'No IP found.';
$generated_at = $_COOKIE['generated_at'] ?? 'No timestamp found.';

header("Content-Type: text/html");
?>
<html>
<body>
    <h1>Session State</h1>
    <p>Stored Data: <b><?php echo htmlspecialchars($display_val); ?></b></p>
    <p>from IP: <b><?php echo htmlspecialchars($user_ip); ?></b></p>
    <p>Originally set at: <b><?php echo htmlspecialchars($generated_at); ?></b></p>
    <hr>
    <a href="state-php-1.php">Set Data</a><br>
    <a href="state-php-4.php">Destroy Data</a>
</body>
</html>