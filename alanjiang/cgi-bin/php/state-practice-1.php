<?php 
session_start();
header("Content-Type: text/html")
?>

<!DOCTYPE html>
<html>    

<head>
    <title>PHP Practice</title>
</head>

<body>
    <form id="num" action="state-practice-2.php" method="POST"></form>

    <label for="classnum">Class Number:</label>
    <input form="num" type="text" id="classnum" name="classnum"/>


    <label for="name">Name:</label>
    <input form="num" type="text" id="name" name="name"/>

    <label for="year">Year:</label>
    <input form="num" type="text" id="year" name="year"/>
    
    <label for="ai">Name:</label>
    <select form="num" type="text" id="ai" name="ai">
        <option value="a lot">a lot</option>
        <option value="some">some</option>
        <option value="none">none</option>
    </select>
        
    <button form="num" type="submit">Submit</button>
</body>

<html>