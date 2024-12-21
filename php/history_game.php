<?php
session_start();

// Connect to your database (replace with your database credentials)
require 'db.php';

try {
    // Get the player_name from POST or fallback to session (if relevant)
    $player_name = $_GET['player_name'];
    //echo $player_name;

    // Query to fetch game history for the player
    $stmt = $pdo->prepare("
        SELECT game_id, status, host_player, guest_player, host_player_color, start_time
        FROM games
        WHERE (host_player = ? OR guest_player = ?) && status != 'active'
        ORDER BY start_time ASC
    ");
    $stmt->execute([$player_name, $player_name]);

    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the game history as JSON
    if ($games) {
        echo json_encode(['status' => 'success', 'data' => $games]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No game history found']);
    }
} catch (PDOException $e) {
    // Handle any database-related errors
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
