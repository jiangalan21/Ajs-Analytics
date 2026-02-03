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
<title>PHP State - Set Data</title></head>
<body>
    <h1>Greetings from Alan!</h1>
    <form action="state-php-2.php" method="POST">
        <label>What would you like to save?</label>
        <input type="text" name="user_data" placeholder="enter message" required>
        <input type="hidden" name="user_ip" value="<?php echo htmlspecialchars($user_ip); ?>">
        <input type="hidden" name="generated_at" value="<?php echo $now; ?>">
        <button type="submit">Submit</button>
    </form>
    <a href="/">Home</a>
</body>
</html>