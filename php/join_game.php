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

    // Optional: Fetch game details for feedback
    $stmt = $pdo->prepare("SELECT * FROM games WHERE game_id = ?");
    $stmt->execute([$game_id]);
    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$game) {
        // Handle case where game_id is invalid
        echo "<script>alert('Invalid game ID. Please try again.'); window.location.href = '../main_lobby.html';</script>";
        exit;
    }

    $deleteStmt = $pdo->prepare("DELETE FROM games WHERE game_id = ?");
    $deleteStmt->execute([$game_id]);

    // Optional: Store other game details in the session if needed
    $_SESSION['player_color'] = ($game['host_player_color'] === 'white') ? 'black' : 'white';
    $_SESSION['host_player'] = $game['host_player'];

    $playerColor = $_SESSION['player_color']; // Get the joining player's color

    $stmt = $pdo->prepare("INSERT INTO movement (color, round, game_id, black_time, white_time) VALUES (?, ?, ?, ?, ?)");
    $stmt->bindValue(1, $playerColor, PDO::PARAM_STR);
    $stmt->bindValue(2, "0", PDO::PARAM_STR);
    $stmt->bindValue(3, $game_id, PDO::PARAM_STR);
    $stmt->bindValue(4, 300, PDO::PARAM_STR);
    $stmt->bindValue(5, 300, PDO::PARAM_STR);
    $stmt->execute();
}
?>

<script src="../js/game.js"></script>

<script type="text/javascript">
    // JavaScript feedback and interaction
    var gameId = "<?php echo $game_id; ?>";
    var playerColor = "<?php echo $playerColor; ?>";
    alert(`You have joined game ID: ${gameId} as ${playerColor}`);
    choose(playerColor);
</script>
