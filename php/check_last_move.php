<?php
header('Content-Type: application/json');
$dsn = 'mysql:host=localhost;dbname=final_project;charset=utf8mb4';
$username = 'root';
$password = 'xavier824655';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("SELECT * FROM movement ORDER BY round DESC LIMIT 1");
    $stmt->execute();
    $move = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($move) {
        echo json_encode(['status' => 'success', 'color' => $move['color'], 'chess' => $move['chess'], 'start_pos' => $move['start_pos'], 'end_pos' => $move['end_pos'], 'round' => $move['round']]);
    } else {
        echo json_encode(['status' => 'success', 'color' => NULL, 'chess' => NULL, 'start_pos' => NULL, 'end_pos' => NULL, 'round' => NULL]);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
