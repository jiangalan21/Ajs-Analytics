<?php
$message = $_POST['user_data'] ?? '';
$ip = $_POST['user_ip'] ?? '';
$time_val = $_POST['generated_at'] ?? '';

// Set cookies
setcookie("session_data", $message, [
    'expires' => time() + 3600,
    'path' => '/',
]);
setcookie("user_ip", $ip, [
    'expires' => time() + 3600,
    'path' => '/',
]);
setcookie("generated_at", $time_val, [
    'expires' => time() + 3600,
    'path' => '/',
]);

// Redirect
header("Location: state-php-3.php");
exit();
?>