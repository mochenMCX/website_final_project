<?php
// Database connection setup
$dsn = 'mysql:host=localhost;dbname=final_project;charset=utf8mb4';
$username = 'root';
$password = '';

try {
    // Connect to the database
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Query to fetch games that are available (you can modify this query based on your needs)
    $stmt = $pdo->query("SELECT game_id, host_player, host_player_color FROM games where status = 'waiting'");

    // Fetch all games into an associative array
    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the result as a JSON response
    echo json_encode($games);

} catch (PDOException $e) {
    // If there's an error, return an empty array
    echo json_encode([]);
}
?>
