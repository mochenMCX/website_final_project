<?php
// Database connection setup
require 'db.php';

try {

    // Query to fetch games that are available (you can modify this query based on your needs)
    $stmt = $pdo->query("SELECT * FROM games where status = 'waiting'");

    // Fetch all games into an associative array
    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the result as a JSON response
    echo json_encode($games);

} catch (PDOException $e) {
    // If there's an error, return an empty array
    echo json_encode([]);
}
?>
