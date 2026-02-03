<?php
header("Content-Type: text/html");
?>
<!DOCTYPE html>
<html>
<head>
    <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-RV2EXKKC1Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-RV2EXKKC1Q');
</script>
<title>PHP Environment Variables</title></head>
<body>
    <h1>PHP Environment Variables</h1>
    <hr>
    <table border="1" cellpadding="5">
        <tr>
            <th>Variable</th>
            <th>Value</th>
        </tr>
        <?php
        foreach ($_SERVER as $key => $value) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($key) . "</td>";
            echo "<td>" . htmlspecialchars($value) . "</td>";
            echo "</tr>";
        }
        ?>
    </table>
</body>
</html>