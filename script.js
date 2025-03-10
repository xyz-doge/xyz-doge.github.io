document.addEventListener("DOMContentLoaded", function () {
    // 🎮 Mini Game
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let player = { x: 50, y: 150, size: 20, speed: 5 };
    let obstacles = [{ x: 400, y: 150, width: 20, height: 20, speed: 3 }];
    
    function drawPlayer() {
        ctx.fillStyle = "white";
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }

    function drawObstacles() {
        ctx.fillStyle = "red";
        obstacles.forEach(ob => {
            ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
            ob.x -= ob.speed;
            if (ob.x < -20) ob.x = 400;
        });
    }

    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
        drawObstacles();
        requestAnimationFrame(updateGame);
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "ArrowUp" && player.y > 0) player.y -= player.speed;
        if (event.key === "ArrowDown" && player.y < canvas.height - player.size) player.y += player.speed;
    });

    updateGame();
});
