<!DOCTYPE html>
<script src="./js/game.js"></script>
<?php
    $dsn = 'mysql:host=localhost;dbname=final_project;charset=utf8mb4';
    $username = 'root';
    $password = 'xavier824655';

    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("TRUNCATE TABLE movement;");
    $stmt->execute();
?>
<html>
    <button onclick="choose('white')">white</button>
    <button onclick="choose('black')">black</button>
</html>