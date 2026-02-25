<?php 
session_start();
$num = $_POST['classnum'] ?? '';
if ($num != ''){
    $_SESSION['classnum'] = $num;
}

$name = $_POST['name'] ?? '';
if ($name != ''){
    $_SESSION['name'] = $name;
}

$year = $_POST['year'] ?? '';
if ($year != ''){
    $_SESSION['year'] = $year;
}

$ai = $_POST['ai'] ?? '';
if ($ai != ''){
    $_SESSION['ai'] = $ai;
}


header("Content-Type: text/html")
?>

<!DOCTYPE html>
<html>
    <head></head>
    <body>
        <p>Name: <b><?php echo $_SESSION['name'] ?></b></p>
        <p>Year: <b><?php echo $_SESSION['year'] ?></b></p>
        <p>AI Usage: <b><?php echo $_SESSION['ai'] ?></b></p>
        <p>I utterly crushed the CSE <b><?php echo $_SESSION['classnum'];?></b> midterm! in 2026</p>
    </body>
</html>