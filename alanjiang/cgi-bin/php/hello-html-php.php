<?php
$now = date("Y-m-d H:i:s");
$user_ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

header("Content-Type: text/html");
?>
<!DOCTYPE html>
<html>
<head><!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-RV2EXKKC1Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-RV2EXKKC1Q');
</script>
<title>Hello PHP</title></head>
<body>
    <h1>Greetings from Alan!</h1>
    <p><b>Language:</b> PHP <?php echo phpversion(); ?></p>
    <p><b>Generated at:</b> <?php echo $now; ?></p>
    <p><b>Your IP Address:</b> <?php echo $user_ip; ?></p>
</body>
</html>