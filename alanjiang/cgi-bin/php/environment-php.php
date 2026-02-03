<?php
header("Content-Type: text/html");
?>
<!DOCTYPE html>
<html>
<head><title>PHP Environment Variables</title></head>
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