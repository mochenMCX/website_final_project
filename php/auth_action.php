<?php
session_set_cookie_params(7200);
session_start();

require 'db.php';

if (isset($_POST['action'])) {
    $name = $_POST['username'];
    $password = $_POST['password'];
    
    if ($_POST['action'] == 'login') {
        // Perform login validation (you should validate the username and password)
        $stmt = $pdo->prepare("SELECT * FROM users WHERE name = ?");
        $stmt->execute([$name]);
        $player = $stmt->fetch();

        if ($player && password_verify($password, $player['password'])) {
            $_SESSION['name'] = $name;
            //header('Location: main_lobby.html'); // Redirect to a dashboard page
            //exit();
            //echo "Successfully login.";
        } else {
            echo '<script type="text/javascript">
            alert("Invalid username or password. Please try again.");
            window.location.href = "../login.html";
            </script>';

            exit();
            //echo "Invalid login credentials.";
        }
    }

    if ($_POST['action'] == 'register') {

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE name = ?");
        $stmt->execute([$name]);
        $count = $stmt->fetchColumn();

        if ($count > 0) {
            // Username already exists
            echo '<script type="text/javascript">
                alert("Username already exists. Please choose another one.");
                window.location.href = "../login.html";
            </script>';
            exit();
        }

        // Perform registration (you should hash the password before saving it)
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (name, password) VALUES (?, ?)");
        if (!$stmt->execute([$name, $hashed_password])) {
            echo '<script type="text/javascript">
            alert("Invalid Registration. Please try again.");
            window.location.href = "../login.html";
            </script>';
        }
        else{
            $_SESSION['name'] = $name;
        }
    }
}
?>
<script type="text/javascript">
    sessionStorage.setItem("name", "<?php echo $_SESSION['name']; ?>");
    console.log("login name:", sessionStorage.getItem("name"));
    window.location.href = "../main_lobby.html";
</script>
