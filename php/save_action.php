<?php
header('Content-Type: application/json');
ini_set('display_errors', '0'); // 禁止顯示錯誤
ini_set('log_errors', '1');     // 啟用錯誤記錄
ini_set('error_log', "D:\user\Desktop\debug.log"); // 設定錯誤記錄檔路徑

// 連接資料庫
$dsn = 'mysql:host=localhost;dbname=final_project;charset=utf8mb4';
$username = 'root';
$password = 'xavier824655';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 獲取前端數據
    $data = json_decode(file_get_contents('php://input'), true);
    // $actions = $data['action']; // 假設前端傳來的格式是 { "actions": [...] }
    // error_log("source" . $data, 3, "D:\user\Desktop\debug.log");
    $actions = $data['action'];
    // 插入數據
    $stmt = $pdo->prepare("INSERT INTO movement (color, chess, start_pos, end_pos) VALUES (?, ?, ?, ?)");
    $stmt->bindValue(1, $actions[0], PDO::PARAM_STR);
    $stmt->bindValue(2, $actions[1], PDO::PARAM_STR);
    $stmt->bindValue(3, $actions[2], PDO::PARAM_STR);
    $stmt->bindValue(4, $actions[3], PDO::PARAM_STR);
    $stmt->execute();

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
