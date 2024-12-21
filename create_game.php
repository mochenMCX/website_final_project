<?php
    session_start();
    require './php/db.php';

    if (isset($_POST['playerColor']) and isset($_POST['username'])) {
        $playerColor = $_POST['playerColor'];
        $username = $_POST['username'];
    }
    // delete 
    $stmt = $pdo->prepare("DELETE FROM games where host_player = ? and status = 'waiting'");
    $stmt->execute([$username]);

    $password = isset($_POST['password']) && $_POST['password'] != '' ? password_hash($_POST['password'], PASSWORD_DEFAULT) : NULL;

    // Insert query
    $stmt = $pdo->prepare("INSERT INTO games (host_player, host_player_color, status, password) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $playerColor, "waiting", $password]);

    // Get the ID of the inserted row
    $game_id = $pdo->lastInsertId();
    $_SESSION['game_id'] = $game_id;
?>


<script src="./js/game.js"></script>
<script type="text/javascript">
    // This JavaScript function will be called at the end of the PHP script
    var color = "<?php echo $playerColor; ?>";
    var game_id = "<?php echo $game_id; ?>";
    //alert(`you choosed color: ${color}, game_id = ${game_id}`);
    sessionStorage.setItem("game_id", game_id);
    sessionStorage.setItem("result", "active");
    choose(color);
</script>
