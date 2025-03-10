// 仅在 game.html 生效
document.addEventListener("DOMContentLoaded", function() {
    const gameCanvas = document.getElementById("gameCanvas");
    if (!gameCanvas) return; // 如果不在 game.html，直接退出
  
    const ctx = gameCanvas.getContext("2d");
    const width = gameCanvas.width;
    const height = gameCanvas.height;
  
    // 玩家
    let player = {
      x: 50,
      y: height - 30,
      size: 20,
      vy: 0,
      jumpForce: 8,
      gravity: 0.4,
      onGround: true
    };
  
    // 障碍物
    let obstacle = {
      x: width,
      y: height - 30,
      width: 20,
      height: 20,
      speed: 3
    };
  
    // 游戏循环
    function update() {
      // 清屏
      ctx.clearRect(0, 0, width, height);
  
      // 绘制玩家
      ctx.fillStyle = "white";
      ctx.fillRect(player.x, player.y, player.size, player.size);
  
      // 绘制障碍物
      ctx.fillStyle = "red";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  
      // 让障碍物移动
      obstacle.x -= obstacle.speed;
      if (obstacle.x < -obstacle.width) {
        obstacle.x = width;
      }
  
      // 重力 & 跳跃
      player.y += player.vy;
      player.vy += player.gravity;
  
      // 碰到地面
      if (player.y + player.size > height) {
        player.y = height - player.size;
        player.vy = 0;
        player.onGround = true;
      }
  
      requestAnimationFrame(update);
    }
  
    // 监听按键
    document.addEventListener("keydown", function(e) {
      if ((e.key === " " || e.key === "ArrowUp") && player.onGround) {
        player.vy = -player.jumpForce;
        player.onGround = false;
      }
    });
  
    // 启动游戏
    update();
  });
  