<?php
session_start();
header('Content-Type: application/json');
ini_set('display_errors', '0'); // 禁止顯示錯誤
ini_set('log_errors', '1');     // 啟用錯誤記錄
ini_set('error_log', "D:\user\Desktop\debug.log"); // 設定錯誤記錄檔路徑

// 連接資料庫
$dsn = 'mysql:host=localhost;dbname=final_project;charset=utf8mb4';
$username = 'root';
$password = '';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 獲取前端數據
    $data = json_decode(file_get_contents('php://input'), true);
    // $actions = $data['action']; // 假設前端傳來的格式是 { "actions": [...] }
    // error_log("source" . $data, 3, "D:\user\Desktop\debug.log");
    $actions = $data['action'];

    // Get the last round for the given game_id
    $stmt = $pdo->prepare("SELECT MAX(round) AS last_round FROM movement WHERE game_id = ?");
    $stmt->execute([$_SESSION['game_id']]);
    $last_round = $stmt->fetchColumn();
    $next_round = $last_round ? $last_round + 1 : 1;



    // 插入數據
    $stmt = $pdo->prepare("INSERT INTO movement (color, chess, start_pos, end_pos, game_id, round, black_time, white_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bindValue(1, $actions[0], PDO::PARAM_STR);
    $stmt->bindValue(2, $actions[1], PDO::PARAM_STR);
    $stmt->bindValue(3, $actions[2], PDO::PARAM_STR);
    $stmt->bindValue(4, $actions[3], PDO::PARAM_STR);
    $stmt->bindValue(5, $_SESSION['game_id'], PDO::PARAM_STR);
    $stmt->bindValue(6, $next_round, PDO::PARAM_STR);
    $stmt->bindValue(7, $actions[4], PDO::PARAM_STR);
    $stmt->bindValue(8, $actions[5], PDO::PARAM_STR);
    $stmt->execute();

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
