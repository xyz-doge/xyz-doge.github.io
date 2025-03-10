document.addEventListener("DOMContentLoaded", () => {
    const gameCanvas = document.getElementById("gameCanvas");
    const scoreDisplay = document.getElementById("scoreDisplay");
  
    // 若不是游戏页面，则无需执行以下逻辑
    if (!gameCanvas || !scoreDisplay) return;
  
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
  
    let score = 0;
    let scored = false; // 是否加过分
  
    function update() {
      ctx.clearRect(0, 0, width, height);
  
      // 绘制玩家
      ctx.fillStyle = "white";
      ctx.fillRect(player.x, player.y, player.size, player.size);
  
      // 绘制障碍物
      ctx.fillStyle = "red";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  
      // 障碍物移动
      obstacle.x -= obstacle.speed;
      if (obstacle.x < -obstacle.width) {
        obstacle.x = width;
        scored = false; 
      }
  
      // 碰撞检测
      if (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.size > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.size > obstacle.y
      ) {
        // 撞到障碍物 -1
        score--;
        scoreDisplay.textContent = `Score: ${score}`;
        obstacle.x = width;
        scored = false;
      }
  
      // 如果玩家成功越过障碍物（障碍物右边 < 玩家左边），+1 分
      if (!scored && (obstacle.x + obstacle.width < player.x)) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        scored = true; 
      }
  
      // 重力 & 跳跃
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
  
    // 初始化分数
    scoreDisplay.textContent = `Score: ${score}`;
  
    update();
  });
  