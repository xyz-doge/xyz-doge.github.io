document.addEventListener("DOMContentLoaded", () => {
    const gameCanvas = document.getElementById("gameCanvas");
    const scoreDisplay = document.getElementById("scoreDisplay");
  
    // 如果当前页面没有 gameCanvas，就不执行游戏逻辑
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
    let scored = false; // 是否已经加过分
  
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
      // 若障碍物离开屏幕，重置位置，并重置 scored
      if (obstacle.x < -obstacle.width) {
        obstacle.x = width;
        scored = false; // 新一轮可加分
      }
  
      // 碰撞检测 (AABB)
      if (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.size > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.size > obstacle.y
      ) {
        // 撞到障碍物 -1
        score--;
        scoreDisplay.textContent = `Score: ${score}`;
        // 重置障碍物位置，重新开始
        obstacle.x = width;
        scored = false;
      }
  
      // 如果玩家成功超过障碍物（障碍物右边 < 玩家左边），加分
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
  
    // 初始化分数显示
    scoreDisplay.textContent = `Score: ${score}`;
  
    update();
  });
  