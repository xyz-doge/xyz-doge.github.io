document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const sunDisplay = document.getElementById("sunDisplay");
  if (!canvas || !scoreDisplay || !sunDisplay) return;
  
  const ctx = canvas.getContext("2d");
  const COLS = 8, ROWS = 5, CELL_SIZE = 80;
  let score = 0, sun = 50;
  let frameCount = 0;
  
  // 游戏对象数组
  let plants = [];   // { col, row, cooldown }
  let zombies = [];  // { x, row, hp, speed, attacking, attackTimer }
  let bullets = [];  // { x, y, speed, damage }
  let suns = [];     // { x, y, speed }
  
  // 常量设置
  const PLANT_COST = 50;
  const PLANT_COOLDOWN = 90;  // 每90帧发射一次子弹
  const ZOMBIE_BASE_HP = 3;
  const ZOMBIE_BASE_SPEED = 0.2;
  const BULLET_SPEED = 2;
  const BULLET_DAMAGE = 1;
  const SUN_FALL_SPEED = 0.5;
  
  // 更新显示
  function updateDisplays() {
    scoreDisplay.textContent = `Score: ${score}`;
    sunDisplay.textContent = `Sun: ${sun}`;
  }
  
  // 绘制网格（可选，增强视觉效果）
  function drawGrid() {
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, ROWS * CELL_SIZE);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(COLS * CELL_SIZE, r * CELL_SIZE);
      ctx.stroke();
    }
  }
  
  // 绘制植物（用绿色方块表示）
  function drawPlants() {
    ctx.fillStyle = "green";
    plants.forEach(plant => {
      let x = plant.col * CELL_SIZE;
      let y = plant.row * CELL_SIZE;
      ctx.fillRect(x + 10, y + 10, CELL_SIZE - 20, CELL_SIZE - 20);
    });
  }
  
  // 绘制僵尸（用棕色方块表示）
  function drawZombies() {
    ctx.fillStyle = "brown";
    zombies.forEach(z => {
      ctx.fillRect(z.x, z.row * CELL_SIZE + 10, CELL_SIZE - 20, CELL_SIZE - 20);
    });
  }
  
  // 绘制子弹（用黄色小矩形表示）
  function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(b => {
      ctx.fillRect(b.x, b.y, 8, 4);
    });
  }
  
  // 绘制阳光（用橙色圆形表示）
  function drawSuns() {
    ctx.fillStyle = "orange";
    suns.forEach(sunObj => {
      ctx.beginPath();
      ctx.arc(sunObj.x, sunObj.y, 15, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
  
  // 更新植物（发射子弹）
  function updatePlants() {
    plants.forEach(plant => {
      plant.cooldown--;
      if (plant.cooldown <= 0) {
        // 从植物中间发射子弹（右侧方向）
        let x = plant.col * CELL_SIZE + CELL_SIZE / 2;
        let y = plant.row * CELL_SIZE + CELL_SIZE / 2;
        bullets.push({ x, y, speed: BULLET_SPEED, damage: BULLET_DAMAGE });
        plant.cooldown = PLANT_COOLDOWN;
      }
    });
  }
  
  // 更新僵尸：移动，并若遇到植物则停止攻击
  function updateZombies() {
    zombies.forEach(z => {
      // 判断该行是否有植物
      let plantInRow = plants.find(p => p.row === z.row && (p.col * CELL_SIZE + CELL_SIZE - 20) >= z.x);
      if (plantInRow) {
        // 僵尸到达植物，开始攻击（减速）
        z.speed = 0;
        z.attackTimer--;
        if (z.attackTimer <= 0) {
          // 移除植物
          plants = plants.filter(p => !(p.row === z.row && p.col === plantInRow.col));
          // 恢复僵尸速度
          z.speed = ZOMBIE_BASE_SPEED;
          z.attackTimer = 60;
        }
      } else {
        z.speed = ZOMBIE_BASE_SPEED + (frameCount / 10000); // 随时间略微加速
      }
      z.x -= z.speed;
    });
    zombies = zombies.filter(z => z.x > -CELL_SIZE);
  }
  
  // 更新子弹：移动并检测碰撞僵尸
  function updateBullets() {
    bullets.forEach((b, bi) => {
      b.x += b.speed;
      zombies.forEach((z, zi) => {
        if (
          b.x < z.x + (CELL_SIZE - 20) &&
          b.x + 8 > z.x &&
          b.y < z.row * CELL_SIZE + (CELL_SIZE - 10) &&
          b.y + 4 > z.row * CELL_SIZE + 10
        ) {
          z.hp -= b.damage;
          // 移除该子弹
          bullets.splice(bi, 1);
        }
      });
    });
    bullets = bullets.filter(b => b.x < COLS * CELL_SIZE);
  }
  
  // 更新僵尸，移除血量低于0的僵尸
  function removeDeadZombies() {
    for (let i = zombies.length - 1; i >= 0; i--) {
      if (zombies[i].hp <= 0) {
        score++;
        sun += 25;
        updateDisplays();
        zombies.splice(i, 1);
      }
    }
  }
  
  // 每隔一定帧数生成僵尸，按波次增加频率和难度
  function spawnZombie() {
    if (frameCount % Math.max(180 - Math.floor(frameCount/300), 60) === 0) {
      let randRow = Math.floor(Math.random() * ROWS);
      zombies.push({
        x: COLS * CELL_SIZE,
        row: randRow,
        hp: ZOMBIE_BASE_HP + Math.floor(frameCount/3000),  // 随着时间增加血量
        speed: ZOMBIE_BASE_SPEED,
        attackTimer: 60
      });
    }
  }
  
  // 每隔一定帧数生成阳光掉落
  function spawnSun() {
    if (frameCount % 240 === 0) { // 每240帧生成一个阳光
      let randCol = Math.floor(Math.random() * COLS);
      let x = randCol * CELL_SIZE + CELL_SIZE/2;
      let y = 0;
      suns.push({ x, y, speed: SUN_FALL_SPEED });
    }
  }
  
  // 更新阳光掉落
  function updateSuns() {
    suns.forEach(s => {
      s.y += s.speed;
    });
    // 移除超出画布的阳光
    suns = suns.filter(s => s.y < canvas.height + 20);
  }
  
  // 检测玩家点击阳光
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 判断是否点击到阳光（简单检测圆形区域）
    for (let i = suns.length - 1; i >= 0; i--) {
      let s = suns[i];
      let dx = mouseX - s.x;
      let dy = mouseY - s.y;
      if (Math.sqrt(dx*dx + dy*dy) < 15) {
        sun += 25;
        updateDisplays();
        suns.splice(i, 1);
      }
    }
  });
  
  // 玩家点击放置植物（点击空白格且无植物时）
  canvas.addEventListener("dblclick", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let col = Math.floor(mouseX / CELL_SIZE);
    let row = Math.floor(mouseY / CELL_SIZE);
    // 若该格没有植物且有足够阳光
    if (sun >= PLANT_COST && !plants.some(p => p.col === col && p.row === row)) {
      plants.push({ col, row, cooldown: PLANT_COOLDOWN });
      sun -= PLANT_COST;
      updateDisplays();
    }
  });
  
  // 游戏主循环
  function gameLoop() {
    frameCount++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawPlants();
    drawZombies();
    drawBullets();
    drawSuns();
    
    updatePlants();
    updateZombies();
    updateBullets();
    updateSuns();
    removeDeadZombies();
    spawnZombie();
    spawnSun();
    
    requestAnimationFrame(gameLoop);
  }
  
  updateDisplays();
  gameLoop();
});
