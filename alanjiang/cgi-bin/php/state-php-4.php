<?php
// Clear cookies
setcookie("session_data", "", [
    'expires' => time() - 3600,
    'path' => '/',
]);
setcookie("user_ip", "", [
    'expires' => time() - 3600,
    'path' => '/',
]);
setcookie("generated_at", "", [
    'expires' => time() - 3600,
    'path' => '/',
]);

// Redirect
header("Location: state-php-3.php");
exit();
?>