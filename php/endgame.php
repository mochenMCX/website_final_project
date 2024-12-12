<?php
session_start();
// Connect to your database (replace with your database credentials)
$dsn = 'mysql:host=localhost;dbname=final_project;charset=utf8mb4';
$username = 'root';
$password = '';

$pdo = new PDO($dsn, $username, $password);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {

    $game_id = $_POST['game_id'];
    //$guest_player = $_POST['guest_player'];

    $stmt = $pdo->prepare("SELECT host_player, guest_player, host_player_color FROM games WHERE game_id = ? AND status = 'active'");
    $stmt->execute([$game_id]);
    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($game) {
    	// Delete the original 'active' game
        $deleteSql = "DELETE FROM games WHERE game_id = ?";
        $deleteStmt = $pdo->prepare($deleteSql);
        $deleteStmt->execute([$game_id]);

        $sql = "INSERT INTO games (game_id, host_player, guest_player, host_player_color, status) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$game_id, $game['host_player'], $game['guest_player'], $game['host_player_color'], $_POST['winner']]);
        //echo json_encode(['status' => 'error', 'message' => 'success']);
        exit;
    }
    else {
    	//echo json_encode(['status' => 'error', 'message' => 'failed']);
        exit;
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}