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

function choose(s){
    sessionStorage.setItem("side", s);
    window.location.href="/website_final_project/index.html";
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let sec = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${sec < 10 ? '0' : ''}${sec}`;
}

function game() {
    side = sessionStorage.getItem("side");
    other = (side == "white")?"black":"white";
    turn = (side == "white")?"white" : "black";
    console.log("initial round:", last_round);
    function checkForNewMoves() {
        // console.log("check");
        fetch(`./php/check_last_move.php?target_round=${parseInt(last_round) + 1}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                //console.log("target round:", last_round + 1, "finded round:", data.round);
                if (data.status == "success" && data.round > last_round) {
                    console.log("updateBoard", data);
                    updateBoard(data);
                }
            })
            .catch(error => console.error("Error checking:", error));
    }
    // 模擬輪循每隔一段時間檢查一次
    setInterval(checkForNewMoves, 200); // 每秒檢查一次

    let timer = setInterval(function() {
        console.log("before black:", black_time, "white:", white_time);
        if (white_time >= 0 && last_round % 2 == 0){
            white_time--;
        }
        if (black_time >= 0 && last_round % 2 == 1){
            black_time--;
        }
        if (white_time < 0){
            clearInterval(timer);  // Stop the timer when time reaches 0
            console.log("White Time's up!");
        }
        if (black_time < 0){
            clearInterval(timer);  // Stop the timer when time reaches 0
            console.log("Black Time's up!");
        }
        console.log("black:", black_time, "white:", white_time);
        document.getElementById("time-player-1").textContent = formatTime(black_time);
        document.getElementById("time-player-2").textContent = formatTime(white_time);
    }, 1000);

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

        if (data.color == "white"){
            document.getElementById("black-indicator").innerHTML = `<span style="color: red;">&#x25B2;</span>Player Black<span style="color: red;">&#x25B2;</span>`
            document.getElementById("white-indicator").innerHTML = "&#x25B2;Player White&#x25B2;"
        }
        else{
            document.getElementById("black-indicator").innerHTML = "&#x25B2;Player Black&#x25B2;"
            document.getElementById("white-indicator").innerHTML = `<span span style="color: red;">&#x25B2;</span>Player White<span span style="color: red;">&#x25B2;</span>`
        }

        while (tableBody.rows.length > 10) {
            tableBody.deleteRow(0); // Remove the first row
        }
    }

    function updateBoard(data) {
        black_time = data.black_time;
        white_time = data.white_time;
        last_round = data.round;

        if (data.color == "white" && data.round > 0){
            let pre_time = new Date(data.time_stamp);
            let cur_time = new Date();
            //console.log("pre:", pre_time, "cur:", cur_time, "dif:", Math.floor((pre_time - cur_time) / 1000));
            black_time -= Math.floor((cur_time - pre_time) / 1000);
        }
        if (data.color == "black" || data.round == 0){
            let pre_time = new Date(data.time_stamp);
            let cur_time = new Date();
            //console.log("pre:", pre_time, "cur:", cur_time, "dif:", Math.floor((pre_time - cur_time) / 1000));
            white_time -= Math.floor((cur_time - pre_time) / 1000);
        }

        if (data.round == 0) {
            const modal = document.getElementById("waiting-modal");
            modal.classList.remove("show");
            return;
        }
        updateTable(data);

        var $fromGrid = $("#"+data.start_pos);
        var $piece1 = $($fromGrid.children(".chess")[0]);
        var $toGrid = $("#" + data.end_pos);
        if($toGrid.children(".chess").length > 0){
            $toGrid.empty();
        }
        $toGrid.append($piece1);
        turn = 1;
        finish();
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
            alert("白方勝利");
            return;
        }

        if (document.getElementById("white-king") == undefined) {
            alert("黑方勝利");
            return;
        }
    }

    // color
    function color(grids, className) {
        for (var grid of grids) {
            $("#"+grid).toggleClass(className);
        }
    }

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

    // check this after
    $(".grid").click(function () {      //點擊偵測
        var $grid = $(this);

        if (side == "white" && last_round % 2 == 1){ // 檢查是否輪到自己
            return;
        }

        if (side == "black" && last_round % 2 == 0){
            return;
        }

        if(turn == 0){
            return;
        }
        if(action.length == 0 && $grid.children("." + other).length > 0){
            return;
        }
        clearBaforeMove();
        $grid.toggleClass("active");
        console.log(action.length);
        if (action.length == 0) {       //選擇棋子
            if ($grid.children(".chess").length == 1) {     
                var $piece1 = $($grid.children(".chess")[0]);
                
                var movableGrids = movableScope($piece1);
                color(movableGrids, "movable-scope");

                var attackableGrids = attackableScope($piece1);
                color(attackableGrids, "attackable-scope");

                action.push($piece1.attr("color"));
                action.push($piece1.attr("type"));
                action.push($grid.attr("id"));
                console.log(action);        //debug
            }
            return;
        }

        if (action.length == 3) {       //移動
            var $fromGrid = $("#"+action[2]);
            var $piece1 = $($fromGrid.children(".chess")[0]);

            var movableGrids = movableScope($piece1);
            var attackableGrids = attackableScope($piece1);

            // target block
            var gridId = $grid.attr("id");

            if (gridId != action[2] && (movableGrids.indexOf(gridId) != -1 || attackableGrids.indexOf(gridId) != -1)) {
                // 目标格子处在棋子的可移动范围或者可攻击范围内

                var $fromGrid = $("#"+action[2]);
                var $toGrid = $grid;

                // 根据目标格子上有没有敌方的棋子, 选择攻击或者移动
                if ($toGrid.children(".chess").length > 0) {
                    // 目标格子有其他棋子

                    // 目标格子上的棋子
                    var $piece2 = $($toGrid.children(".chess")[0]);
                    if ($piece1.attr("color") != $piece2.attr("color")) {
                        // 目标格子上的棋子是敌方的棋子

                        // 攻击
                        $fromGrid.remove($piece1);
                        $toGrid.empty();
                        $toGrid.append($piece1);
                    }

                } else {
                    // 目标格子有其他棋子

                    // 移动
                    $fromGrid.remove($piece1);
                    $toGrid.append($piece1);
                }

                // 检查棋子类型是不是离开了初始位置的士兵
                if ($piece1.hasClass("initial")) {
                    $piece1.removeClass("initial");
                }


                /*棋子移动或者攻击完成后, 检查国王是否存在, 是否被将军*/
                checkmate($piece1);
                finish();
            } else {
                // 目标格子不处在棋子的可移动范围或者可攻击范围内

                // 清除行动记录
                clearAction();
                return;
            }
            last_round = parseInt(last_round) + 1;
            action.push(gridId);
            console.log(JSON.stringify({action}));

            // update table
            const newMove = {chess: action[1], round: last_round, color: side, start_pos: action[2], end_pos: action[3]};
            updateTable(newMove);

            // caclulate remaining time!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

            action.push(black_time);
            action.push(white_time);

            //push the data into database
            fetch("./php/save_action.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    console.log("Actions saved successfully!");
                } else {
                    console.error("Error saving actions:", data.message);
                }
            })
            .catch((error) => console.error("Fetch error:", error));
            turn = 0;
            clearAction();
        }

        // if (action.length == 4) {
        //     if ($grid.children(".chess").length == 1) {
        //         var $piece1 = $($grid.children(".chess")[0]);

        //         if ($piece1.attr("color") != action[0]) {
        //             var movableGrids = movableScope($piece1);
        //             color(movableGrids, "movable-scope");

        //             var attackableGrids = attackableScope($piece1);
        //             color(attackableGrids, "attackable-scope");

        //             clearAction();
        //             action.push($piece1.attr("color"));
        //             action.push($piece1.attr("type"));
        //             action.push($grid.attr("id"));
        //         }                
        //     }
        //     return;
        // }
    });
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

if(window.location.pathname.endsWith("/index.html")){
    console.log("initround0:", last_round);
    game();
}


