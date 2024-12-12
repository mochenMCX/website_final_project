<?php
session_start();

$dsn = 'mysql:host=localhost;dbname=final_project;charset=utf8mb4';
$username = 'root';
$password = '';

$pdo = new PDO($dsn, $username, $password);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Check if game_id is received from POST request
if (isset($_POST['game_id'])) {
    $game_id = $_POST['game_id'];
    $_SESSION['game_id'] = $game_id;
    $guest_player = $_POST['guest_player'];
    
    $stmt = $pdo->prepare("SELECT host_player, host_player_color FROM games WHERE game_id = ? AND status = 'waiting'");
    $stmt->execute([$game_id]);
    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("DELETE FROM games where host_player = ? and status = 'waiting'");
    $stmt->execute([$guest_player]);

    if ($game) {
        // Delete the original 'waiting' game
        $deleteSql = "DELETE FROM games WHERE game_id = ?";
        $deleteStmt = $pdo->prepare($deleteSql);
        $deleteStmt->execute([$game_id]);


        $sql = "INSERT INTO games (game_id, host_player, guest_player, host_player_color, status) VALUES (?, ?, ?, ?, 'active')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$game_id, $game['host_player'], $guest_player, $game['host_player_color']]);
    }
    else {
        // Handle case where game_id is invalid
        echo "<script>alert('Invalid game ID. Please try again.'); window.location.href = '../main_lobby.html';</script>";
        exit;
    }

    // Optional: Store other game details in the session if needed
    $_SESSION['player_color'] = ($game['host_player_color'] === 'white') ? 'black' : 'white';
    $_SESSION['host_player'] = $game['host_player'];

    $playerColor = $_SESSION['player_color']; // Get the joining player's color

    $stmt = $pdo->prepare("INSERT INTO movement (color, round, game_id, black_time, white_time) VALUES (?, ?, ?, ?, ?)");
    $stmt->bindValue(1, $playerColor, PDO::PARAM_STR);
    $stmt->bindValue(2, "0", PDO::PARAM_STR);
    $stmt->bindValue(3, $game_id, PDO::PARAM_STR);
    $stmt->bindValue(4, 600, PDO::PARAM_STR);
    $stmt->bindValue(5, 600, PDO::PARAM_STR);
    $stmt->execute();
}
?>

<script src="../js/game.js"></script>

<script type="text/javascript">
    // JavaScript feedback and interaction
    var gameId = "<?php echo $game_id; ?>";
    var playerColor = "<?php echo $playerColor; ?>";
    //alert(`You have joined game ID: ${gameId} as ${playerColor}`);
    sessionStorage.setItem("game_id", gameId);
    sessionStorage.setItem("result", "active");
    choose(playerColor);
</script>
