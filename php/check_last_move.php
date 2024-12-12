<?php
session_start();
header('Content-Type: application/json');
$dsn = 'mysql:host=localhost;dbname=final_project;charset=utf8mb4';
$username = 'root';
$password = '';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("SELECT * FROM movement WHERE game_id = ? AND round = ?");

    $game_id = (isset($_GET['game_id']) && $_GET['game_id'] != "null") ? $_GET['game_id'] : $_SESSION['game_id'];
    $target_round = (int) $_GET['target_round'];

    $stmt->execute([$game_id, $target_round]);
    $move = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($move) {
        echo json_encode(['status' => 'success', 'color' => $move['color'], 'chess' => $move['chess'], 'start_pos' => $move['start_pos'], 'end_pos' => $move['end_pos'], 'round' => $move['round'], 'black_time' => $move['black_time'], 'white_time' => $move['white_time'], 'time_stamp' => $move['time_stamp']]);
    } else {
        echo json_encode(['status' => 'fail', 'color' => NULL, 'chess' => NULL, 'start_pos' => NULL, 'end_pos' => NULL, 'round' => NULL]);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
