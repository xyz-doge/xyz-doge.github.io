document.addEventListener("DOMContentLoaded", () => {
    // 如果当前页面没有 gameCanvas，就不执行游戏逻辑
    const gameCanvas = document.getElementById("gameCanvas");
    if (!gameCanvas) return;
  
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
  
    function update() {
      ctx.clearRect(0, 0, width, height);
  
      // 绘制玩家
      ctx.fillStyle = "white";
      ctx.fillRect(player.x, player.y, player.size, player.size);
  
      // 绘制障碍物
      ctx.fillStyle = "red";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  
      // 障碍物向左移动
      obstacle.x -= obstacle.speed;
      if (obstacle.x < -obstacle.width) {
        obstacle.x = width;
      }
  
      // 处理跳跃
      player.y += player.vy;
      player.vy += player.gravity;
  
      // 落地检测
      if (player.y + player.size >= height) {
        player.y = height - player.size;
        player.vy = 0;
        player.onGround = true;
      }
  
      requestAnimationFrame(update);
    }
  
    // 键盘事件
    document.addEventListener("keydown", (e) => {
      if ((e.key === " " || e.key === "ArrowUp") && player.onGround) {
        player.vy = -player.jumpForce;
        player.onGround = false;
      }
    });
  
    update();
  });
  