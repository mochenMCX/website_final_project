# DWP Final Project

## 12/21/2024 Update:
1. Added room password to ensure that matches arranged between friends won’t be disturbed by outsiders. If you don’t want to set one, you can leave it blank.
2. Integrated the connection settings from each PHP file into ```db.php```, so if you need to change the password, you don’t have to modify every PHP file individually.

## Online International Chess Platform

![image](https://hackmd.io/_uploads/Bygr_E8u4ye.png =70%x)

We are motivated to create an online chess platform that focuses on convenience and accessibility, with easy registration and quick match creation. The platform will offer seamless matchmaking, allowing users to play with friends or others effortlessly. Additionally, it will include all essential features like timer mechanism, move history, analysis tools, ensuring a user-friendly and comprehensive chess experience for players of all levels.

## Introduction

These are our features of our online chess platform.

### Account System
![image](https://hackmd.io/_uploads/SksG8UuNkg.png =60%x)

A secure database is used to store user accounts and hashed passwords. This ensures a reliable account system. Players’ historical game records are saved, enabling them to review past matches. Additionally, the system calculates and displays each player’s win rate in their profile, providing a detailed overview of their performance.

![image](https://hackmd.io/_uploads/rkfc88ONkl.png)

### Lobby System

![image](https://hackmd.io/_uploads/SyHSDI_Eye.png)

The lobby system allows players to create or join game rooms, providing seamless matchmaking. Players can create a room to wait for others to join or immediately enter a game by joining an available room. This ensures flexibility and convenience for all users.

![image](https://hackmd.io/_uploads/SJjiw8ONJe.png)

### Game interface

![image](https://hackmd.io/_uploads/BkG4dUOE1x.png)

* Player name: Automatically loaded when both player joins the room.
* Turn indicator: Red triangles lights up to indicate the player's turn.
* Timer: Displays the remaining time for each player and synchronizes after each move.

![image](https://hackmd.io/_uploads/Hya29LdN1g.png =70%x)

* Colors: Grids are highlighted based on available moves.
* Interactive Grids: Smooth clicking interactions enhance the user experience.

![image](https://hackmd.io/_uploads/By4mj8_41l.png)

* Movement table: Updates dynamically after every move, providing real-time feedback.

### Replay System

![image](https://hackmd.io/_uploads/B1F96U_4ye.png)

Recent game records are displayed in the lobby. By clicking the "Review Game" button, players can access a replay interface.

![image](https://hackmd.io/_uploads/S1CSAUdEyx.png)

In the replay interface, players can navigate through the game record both forwards and backwards at their leisure.

### Reconnect System

Typically, refreshing or reopening the page would disrupt the game, as basic implementations only track the opponent’s latest move.

In our iteration-based implementation, the game state is fully recovered within a few seconds. Both timers are also accurately synchronized based on timestamps stored in the database.

## Code description

We will first introduce the table structure used in our project:

### Table "users"

Manage login/register informations:

* username
* hashed password

### Table "movements"

Tracks game progress and powers the replay system:

* game id
* round number
* movement (chess type, from/to position...)
* time left of both players
* timestamp

### Table "games"

Stores game room data and tracks completed matches:

* game id
* host player (the owner of the game room)
* guest player
* host player color
* status (waiting/active/game_result)

### Account system

When user registers a new account, the username along with the encrypted password would be stored in the database table "users". Next time the user logins, a query would be performed and the password would be checked.

### Lobby & Match system

1. The host player creates a game room, and a new entry with a unique game id is inserted into the "games" table with the status set to "waiting". 
2. The guest player searches for available "waiting" rooms.
3. Upon joining a room, the guest player changes its status to "active," starting the game.
4. Players update and synchronize game progress using the "movements" table and the respective game id.
5. After the game concludes, the status of the game room is updated to reflect the winner ("white" or "black").

### Replay system

The replay system retrieves all moves associated with a specific game_id. Using these records, the game process can be reconstructed in chronological order. HTML snapshots of the game state after each move are stored in a JavaScript list, enabling seamless forward and backward navigation during replays.

### Reconnect system

A global variable, round_count, is initialized to 0 after a page refresh or reconnect. The check_update() function, running at regular intervals, queries the "movements" table for moves with a round_number greater than round_count. The game board is updated incrementally until all moves are restored. This approach ensures that gameplay resumes smoothly after disruptions.

## How to use (local test)
1. Put the entire folder (website_final_project) into xampp/htdocs.

2. Import the database final_project.sql into localhost, and make sure the database name is final_project.
Also, note that your phpMyAdmin root password should be set to empty ("").
If it isn’t, you’ll need to go to website_final_project/php/db.php and change the $password there to match your password.

3. Open two browser tabs with "http://localhost/website_final_project/login.html" and register two different accounts.

On one account, click create game. On the other, click join game, then enter the corresponding game_id from the first account to connect to the room.
