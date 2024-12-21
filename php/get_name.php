<?php
session_start();

// Connect to your database (replace with your database credentials)
require 'db.php';

try {
    // Get the player_name from POST or fallback to session (if relevant)
    $game_id = $_GET['game_id'] != "null" ? $_GET['game_id'] : $_SESSION['game_id'];

    // Query to fetch game history for the player
    $stmt = $pdo->prepare("
        SELECT host_player, guest_player, host_player_color
        FROM games
        WHERE game_id = ?
    ");
    $stmt->execute([$game_id]);

    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    // Return the game history as JSON
    //echo $game_id;
    if ($game) {
        echo json_encode(['status' => 'success', 'host_player' => $game['host_player'], 'guest_player' => $game['guest_player'], 'host_player_color' => $game['host_player_color']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No game found']);
    }
} catch (PDOException $e) {
    // Handle any database-related errors
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
