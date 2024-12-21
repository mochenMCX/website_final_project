<?php
// Database configuration
$dsn = 'mysql:host=localhost;dbname=final_project;charset=utf8mb4';
$username = 'root';
$password = '';

try {
    // Create a PDO instance
    $pdo = new PDO($dsn, $username, $password);
    // Set PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Handle connection error
    die('Database connection failed: ' . $e->getMessage());
}