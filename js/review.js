/*
    game.js: 实现游戏逻辑
*/
let side = "white";//default, choose before the game beginning
let other = "black";
let last_round = parseInt(-1);
let turn = 0;
let switch_time = "";
let init_time = parseInt(300);
let black_time = parseInt(300);
let white_time = parseInt(300);
let black_name = "";
let white_name = "";
let gamelist = [];

function game() {
    side = sessionStorage.getItem("side");
    other = (side == "white")?"black":"white";
    turn = (side == "white")?"white" : "black";
    console.log("initial round:", last_round);
    function checkForNewMoves() {
        //console.log("check", `./php/check_last_move.php?target_round=${parseInt(last_round) + 1}`);
        fetch(`./php/check_last_move.php?target_round=${parseInt(last_round) + 1}&game_id=${sessionStorage.getItem("game_id")}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                //console.log("target round:", last_round + 1, "finded round:", data.round);
                if (data.status == "success" && parseInt(data.round) > parseInt(last_round)) {
                    console.log("updateBoard", data);
                    updateBoard(data);
                }
            })
            .catch(error => console.error("Error checking:", error));
    }
    // 模擬輪循每隔一段時間檢查一次
    setInterval(checkForNewMoves, 200); // 每秒檢查一次

    function updateTable(data){
        const tableBody = document.querySelector("#move-history tbody");
        // Create a new row
        const row = document.createElement("tr");
        // Create cells for Move #, Color, and Movement
        const moveNumberCell = document.createElement("td");
        moveNumberCell.textContent = data.round;
        const colorCell = document.createElement("td");
        colorCell.textContent = data.color;
        const typeCell = document.createElement("td");
        typeCell.textContent = data.chess;
        const movementCell = document.createElement("td");
        movementCell.textContent = `${data.start_pos} → ${data.end_pos}`;
        // Append cells to the row
        row.appendChild(moveNumberCell);
        row.appendChild(colorCell);
        row.appendChild(typeCell);
        row.appendChild(movementCell);
        // Append the row to the table body
        tableBody.appendChild(row);


        while (tableBody.rows.length > 10) {
            tableBody.deleteRow(0); // Remove the first row
        }
    }

    function startgame(){
        var game_id = sessionStorage.getItem("game_id");;

        // Let winner update
        console.log("link:", `./php/get_name.php?game_id=${game_id}`);
        fetch(`./php/get_name.php?game_id=${game_id}`)
        .then(response => response.json())
        .then(data => {
            console.log("getname:", data); // Handle the response from the PHP script
            if (data.host_player_color == "black"){
                black_name = data.host_player;
                white_name = data.guest_player;
            }
            else{
                black_name = data.guest_player;
                white_name = data.host_player;
            }
            document.getElementById("black-indicator").innerHTML = `${black_name}`
            document.getElementById("white-indicator").innerHTML = `${white_name}`
            console.log("data:", data);
            saveSnapshot();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }


    function endgame(winner) {
        if (sessionStorage.getItem("result") != "active") return;
        var game_id = sessionStorage.getItem("game_id");;

        // Let winner update

        if (winner == side){
            var formData = new FormData();
            formData.append('game_id', game_id);
            formData.append('winner', winner);

            // Fetch the PHP script using the Fetch API
            fetch('php/endgame.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(response);
            })
            .then(data => {
                //console.log(data); // Handle the response from the PHP script
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

        sessionStorage.setItem("black_time", formatTime(black_time));
        sessionStorage.setItem("white_time", formatTime(white_time));
        sessionStorage.setItem("result", winner);
        console.log("endgame");
    }

    function updateBoard(data) {

        last_round = data.round;

        if (data.round == 0) {
            startgame();
            return;
        }

        var $fromGrid = $("#"+data.start_pos);
        var $piece1 = $($fromGrid.children(".chess")[0]);
        var $toGrid = $("#" + data.end_pos);
        if($toGrid.children(".chess").length > 0){
            $toGrid.empty();
        }
        $toGrid.append($piece1);
        turn = 1;
        finish();
        //updateTable(data);
        saveSnapshot();
    }


    // x-axis
    const xAxis = ["A", "B", "C", "D", "E", "F", "G", "H"];

    // y-axis
    const yAxis = [1, 2, 3, 4, 5, 6, 7, 8];

    var action = [];

    // 取得位置座標
    function getPosition(grid) {
        var gridId = $(grid).attr("id");
        var x = gridId[0];      //取得x座標
        var y = parseInt(gridId[1]);        //取得y座標

        return [x, y];
    }

    // checkmate
    function checkmate(piece) {
        var attackableGrids = attackableScope(piece);
        for (var gridId of attackableGrids) {       //確認每一格可以到達的地方
            var grid = $("#"+gridId);       //get DOM element
            if ($(grid.children()[0]).hasClass("king")) {
                color([gridId], "checkmate");
            }
        }
    }

    // gameover
    function finish() {
        if (document.getElementById("black-king") == undefined) {
            endgame("white");
            console.log("白方勝利");
            return;
        }

        if (document.getElementById("white-king") == undefined) {
            endgame("black");
            console.log("黑方勝利");
            return;
        }
    }

    // color
    /*
    function color(grids, className) {
        for (var grid of grids) {
            $("#"+grid).toggleClass(className);
        }
    }
    */

    // for action
    function clearBaforeMove() {
        $(".grid").removeClass("active");
        $(".grid.movable-scope").removeClass("movable-scope");
        $(".grid.attackable-scope").removeClass("attackable-scope");
        $(".grid.checkmate").removeClass("checkmate");
    }

    function clearAfterMove() {
        $(".grid.active").removeClass("active");
        $(".grid.movable-scope").removeClass("movable-scope");
        $(".grid.attackable-scope").removeClass("attackable-scope");
    }

    // clear action
    function clearAction() {
        while (action.length > 0) {
            action.pop();
        }
    }

    
    //確認可到達的位置
    function movableScope(piece) {
        var scope = [];
        var position = getPosition(piece.parent());

        // 士兵
        if (piece.hasClass("pawn")) {
            if (piece.hasClass("white")) {
                if (piece.hasClass("initial")) {
                    for (var i = 1; i <= 2; i++) {
                        var $grid = $("#"+position[0]+(position[1]+i));
                        if ($grid.children().length == 0) {
                            scope.push($grid.attr("id"));
                        }
                    }
                } else {
                    for (var i = 1; i <= 1; i++) {
                        var $grid = $("#"+position[0]+(position[1]+i));
                        if ($grid.children().length == 0) {
                            scope.push($grid.attr("id"));
                        }
                    }
                }
            } else {
                if (piece.hasClass("initial")) {
                    for (var i = 1; i <= 2; i++) {
                        var $grid = $("#"+position[0]+(position[1]-i));
                        if ($grid.children().length == 0) {
                            scope.push($grid.attr("id"));
                        }
                    }
                } else {
                    for (var i = 1; i <= 1; i++) {
                        var $grid = $("#"+position[0]+(position[1]-i));
                        if ($grid.children().length == 0) {
                            scope.push($grid.attr("id"));
                        }
                    }
                }
            }

            return scope;
        }

        // 国王
        if (piece.hasClass("king")) {
            var centerGrid = piece.parent();
            var tempGrid;
            var directions = [top, topright, right, bottomright, bottom, bottomleft, left, topleft];

            for (var direction of directions) {
                tempGrid = direction(centerGrid);
                if (tempGrid != undefined && tempGrid.children(".chess").length == 0) {
                    scope.push(tempGrid.attr("id"));
                }
            }

            return scope;
        }

        // 王后
        if (piece.hasClass("queen")) {
            var centerGrid = piece.parent();
            var tempGrid;
            var directions = [top, topright, right, bottomright, bottom, bottomleft, left, topleft];

            for (var direction of directions) {
                tempGrid = direction(centerGrid);
                while (tempGrid != undefined) {
                    if (tempGrid.children().length == 0) {
                        scope.push(tempGrid.attr("id"));
                        tempGrid = direction(tempGrid);
                    } else {
                        break;
                    }
                }
            }

            return scope;
        }

        // 主教
        if (piece.hasClass("bishop")) {
            var centerGrid = piece.parent();
            var tempGrid;
            var directions = [topright, bottomright, bottomleft, topleft];

            for (var direction of directions) {
                tempGrid = direction(centerGrid);
                while (tempGrid != undefined) {
                    if (tempGrid.children().length == 0) {
                        scope.push(tempGrid.attr("id"));
                        tempGrid = direction(tempGrid);
                    } else {
                        break;
                    }
                }
            }

            return scope;
        }

        // 骑士
        if (piece.hasClass("knight")) {
            var centerGrid = piece.parent();
            var nearGrid, farGrid;
            var routes = [
                [top, [topleft, topright]],
                [right, [topright, bottomright]],
                [bottom, [bottomleft, bottomright]],
                [left, [topleft, bottomleft]] 
            ];

            for (var route of routes) {
                var unidirection = route[0];
                var bidirection = route[1];

                nearGrid = unidirection(centerGrid);
                if (nearGrid != undefined) {
                    for (var direction of bidirection) {
                        farGrid = direction(nearGrid);
                        if (farGrid != undefined && farGrid.children(".chess").length == 0) {
                            scope.push(farGrid.attr("id"));
                        }
                    }
                }
            }

            return scope;
        }

        // 城堡
        if (piece.hasClass("rook")) {
            var centerGrid = piece.parent();
            var tempGrid;
            var directions = [top, right, bottom, left];

            for (var direction of directions) {
                tempGrid = direction(centerGrid);
                while (tempGrid != undefined) {
                    if (tempGrid.children().length == 0) {
                        scope.push(tempGrid.attr("id"));
                        tempGrid = direction(tempGrid);
                    } else {
                        break;
                    }
                }
            }

            return scope;
        }
    }
    //確認可攻擊的位置
    function attackableScope(piece) {
        var scope = [];

        // 士兵
        if (piece.hasClass("pawn")) {
            var centerGrid = piece.parent();

            if (piece.hasClass("white")) {
                var topLeftGrid = topleft(centerGrid);
                var topRightGrid = topright(centerGrid);
                for (var grid of [topLeftGrid, topRightGrid]) {
                    if (grid != undefined && grid.children().length == 1 && $(grid.children()[0]).attr("color") != piece.attr("color")) {
                        scope.push(grid.attr("id"));
                    }
                }            
            } else {
                var bottomLeftGrid = bottomleft(centerGrid);
                var bottomRightGrid = bottomright(centerGrid);

                for (var grid of [bottomLeftGrid, bottomRightGrid]) {
                    if (grid != undefined && grid.children().length == 1 && $(grid.children()[0]).attr("color") != piece.attr("color")) {
                        scope.push(grid.attr("id"));
                    }
                }
            }
            return scope;
        }

        // 国王
        if (piece.hasClass("king")) {
            var centerGrid = piece.parent();
            var tempGrid;
            var directions = [top, topright, right, bottomright, bottom, bottomleft, left, topleft];

            for (var direction of directions) {
                tempGrid = direction(centerGrid);
                if (tempGrid != undefined && tempGrid.children(".chess").length == 1 && $(tempGrid.children(".chess")[0]).attr("color") != piece.attr("color")) {
                    scope.push(tempGrid.attr("id"));
                }
            }

            return scope;
        }

        // 王后
        if (piece.hasClass("queen")) {
            var centerGrid = piece.parent();
            var tempGrid;
            var directions = [top, topright, right, bottomright, bottom, bottomleft, left, topleft];

            for (var direction of directions) {
                tempGrid = direction(centerGrid);            
                while (tempGrid != undefined) {
                    if (tempGrid.children().length == 1) {
                        if ($(tempGrid.children()[0]).attr("color") != piece.attr("color")) {
                            scope.push(tempGrid.attr("id"));                        
                        }
                        break;                   
                    } else {
                        tempGrid = direction(tempGrid);
                    }
                }
            }

            return scope;
        }

        // 主教
        if (piece.hasClass("bishop")) {
            var centerGrid = piece.parent();
            var tempGrid;
            var directions = [topright, bottomright, bottomleft, topleft];

            for (var direction of directions) {
                var tempGrid = direction(centerGrid);            
                while (tempGrid != undefined) {
                    if (tempGrid.children().length == 1) {
                        if ($(tempGrid.children()[0]).attr("color") != piece.attr("color")) {
                            scope.push(tempGrid.attr("id"));                        
                        }
                        break;                   
                    } else {
                        tempGrid = direction(tempGrid);
                    }
                }
            }

            return scope;
        }

        // 骑士
        if (piece.hasClass("knight")) {
            var centerGrid = piece.parent();
            var nearGrid, farGrid;

            var routes = [
                [top, [topleft, topright]],
                [right, [topright, bottomright]],
                [bottom, [bottomleft, bottomright]],
                [left, [topleft, bottomleft]] 
            ];

            for (var route of routes) {
                var unidirection = route[0];
                var bidirection = route[1];

                nearGrid = unidirection(centerGrid);
                if (nearGrid != undefined) {
                    for (var direction of bidirection) {
                        farGrid = direction(nearGrid);
                        if (farGrid != undefined && farGrid.children(".chess").length == 1 && $(farGrid.children(".chess")[0]).attr("color") != piece.attr("color")) {
                            scope.push(farGrid.attr("id"));
                        }
                    }
                }
            }

            return scope;
        }

        // 城堡
        if (piece.hasClass("rook")) {
            var centerGrid = piece.parent();
            var tempGrid;
            var directions = [top, right, bottom, left];

            for (var direction of directions) {
                var tempGrid = direction(centerGrid);            
                while (tempGrid != undefined) {
                    if (tempGrid.children().length == 1) {
                        if ($(tempGrid.children()[0]).attr("color") != piece.attr("color")) {
                            scope.push(tempGrid.attr("id"));                        
                        }
                        break;                   
                    } else {
                        tempGrid = direction(tempGrid);
                    }
                }
            }

            return scope;
        }
    }

    function isMarginTop(grid) {
        var position = getPosition(grid);
        return position[1] == yAxis[7];
    }

    function isMarginBottom(grid) {
        var position = getPosition(grid);
        return position[1] == yAxis[0];
    }

    function isMarginLeft(grid) {
        var position = getPosition(grid);
        return position[0] == xAxis[0];
    }

    function isMarginRight(grid) {
        var position = getPosition(grid);
        return position[0] == xAxis[7];
    }

    function top(grid) {
        var position = getPosition(grid);
        if (isMarginTop(grid) == true) {
            return undefined;
        } else {
            return $("#"+position[0]+(position[1]+1));
        }
    }

    function bottom(grid) {
        var position = getPosition(grid);
        if (isMarginBottom(grid) == true) {
            return undefined;
        } else {
            return $("#"+position[0]+(position[1]-1));
        }
    }

    function left(grid) {
        var position = getPosition(grid);
        if (isMarginLeft(grid) == true) {
            return undefined;
        } else {
            return $("#"+xAxis[xAxis.indexOf(position[0])-1]+position[1]);
        }        
    }

    function right(grid) {
        var position = getPosition(grid);
        if (isMarginRight(grid) == true) {
            return undefined;
        } else {
            return $("#"+xAxis[xAxis.indexOf(position[0])+1]+position[1]);
        }
    }

    function topleft(grid) {
        var position = getPosition(grid);
        if (isMarginTop(grid) || isMarginLeft(grid)) {
            return undefined;
        } else {
            return $("#"+xAxis[xAxis.indexOf(position[0])-1]+(position[1]+1));
        }
    }

    function topright(grid) {
        var position = getPosition(grid);
        if (isMarginTop(grid) || isMarginRight(grid)) {
            return undefined;
        } else {
            return $("#"+xAxis[xAxis.indexOf(position[0])+1]+(position[1]+1));
        }
    }

    function bottomleft(grid) {
        var position = getPosition(grid);
        if (isMarginBottom(grid) || isMarginLeft(grid)) {
            return undefined;
        } else {
            return $("#"+xAxis[xAxis.indexOf(position[0])-1]+(position[1]-1));
        }
    }

    function bottomright(grid) {
        var position = getPosition(grid);
        if (isMarginBottom(grid) || isMarginRight(grid)) {
            return undefined;
        } else {
            return $("#"+xAxis[xAxis.indexOf(position[0])+1]+(position[1]-1));
        }
    }
}
/*
let lastActiveTime = Date.now();

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Update the last active time when the page goes to the background
        lastActiveTime = Date.now();
    } else {
        // Check the time difference when the page becomes visible
        const inactiveTime = Date.now() - lastActiveTime;
        if (inactiveTime > 5000) { // 1 seconds in milliseconds
            location.reload();
        }
    }
});
*/
if(window.location.pathname.endsWith("/review.html")){
    console.log("start");
    game();
}


const historyStack = [];
let currentIndex = -1;

function saveSnapshot() {
    const snapshot = document.body.innerHTML; // !!!!!!!!!!!!! change this line!
    if (currentIndex < historyStack.length - 1) {
        historyStack.splice(currentIndex + 1);
    }
    historyStack.push(snapshot);
    currentIndex++;
    updateButtons();
}

//
function restoreSnapshot(index) {  // !!!!!!!!!!!!!!!!!change this function!
    document.body.innerHTML = historyStack[index];
    reinitialize();
}

function updateButtons() {
    document.getElementById('previousButton').disabled = currentIndex <= 0;
    document.getElementById('nextButton').disabled = currentIndex >= historyStack.length - 1;
}

function reinitialize() {
    document.getElementById('previousButton').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            restoreSnapshot(currentIndex);
        }
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        if (currentIndex < historyStack.length - 1) {
            currentIndex++;
            restoreSnapshot(currentIndex);
        }
    });

    updateButtons();
}

//saveSnapshot();
reinitialize();