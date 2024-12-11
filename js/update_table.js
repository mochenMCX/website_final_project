let last_round = 0;

function my_update(){
	function check_update() {
        // console.log("check");
        fetch("./php/check_last_move.php")
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if (data.status == "success" && data.color == other && data.round > last_round) {
                    updateTable();
                    updateTime(data);
                }
            })
            // .catch(error => console.error("Error checking new moves: ", error));
    }
    function update
	setInterval(check_update, 1000);
}

if(window.location.pathname.endsWith("/index.html")){
    my_update();
}