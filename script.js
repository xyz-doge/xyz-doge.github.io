document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const sunDisplay = document.getElementById("sunDisplay");
  if (!canvas || !scoreDisplay || !sunDisplay) return;

  const ctx = canvas.getContext("2d");

  // 游戏参数
  const COLS = 8;
  const ROWS = 5;
  const CELL_SIZE = 80; // 画布640x400 => 8列x5行
  let score = 0;
  let sun = 50; // 初始阳光

  // 植物、僵尸、子弹的数据结构
  let plants = [];   // { col, row, cooldown, hp }
  let zombies = [];  // { x, row, hp, speed }
  let bullets = [];  // { x, y, speed, damage }

  // 植物、僵尸、子弹的一些常量
  const PLANT_COST = 50;
  const PLANT_COOLDOWN = 90;  // 每隔90帧发射一颗子弹
  const ZOMBIE_HP = 3;
  const ZOMBIE_SPEED = 0.2;
  const BULLET_SPEED = 2;
  const BULLET_DAMAGE = 1;

  // 初始化分数和阳光
  scoreDisplay.textContent = `Score: ${score}`;
  sunDisplay.textContent = `Sun: ${sun}`;

  // 绘制网格线（可选）
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

  // 绘制植物
  function drawPlants() {
    ctx.fillStyle = "green";
    plants.forEach(plant => {
      let x = plant.col * CELL_SIZE;
      let y = plant.row * CELL_SIZE;
      ctx.fillRect(x + 10, y + 10, CELL_SIZE - 20, CELL_SIZE - 20);
    });
  }

  // 绘制僵尸
  function drawZombies() {
    ctx.fillStyle = "brown";
    zombies.forEach(z => {
      ctx.fillRect(z.x, z.row * CELL_SIZE + 10, CELL_SIZE - 20, CELL_SIZE - 20);
    });
  }

  // 绘制子弹
  function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(b => {
      ctx.fillRect(b.x, b.y, 8, 4);
    });
  }

  // 更新植物（发射子弹）
  function updatePlants() {
    plants.forEach(plant => {
      plant.cooldown--;
      if (plant.cooldown <= 0) {
        // 发射子弹
        let x = plant.col * CELL_SIZE + CELL_SIZE / 2;
        let y = plant.row * CELL_SIZE + CELL_SIZE / 2;
        bullets.push({ x, y, speed: BULLET_SPEED, damage: BULLET_DAMAGE });
        plant.cooldown = PLANT_COOLDOWN;
      }
    });
  }

  // 更新僵尸位置
  function updateZombies() {
    zombies.forEach(z => {
      z.x -= z.speed;
    });
    // 移除超出左边的僵尸
    zombies = zombies.filter(z => z.x > -CELL_SIZE);
  }

  // 更新子弹位置，检测碰撞
  function updateBullets() {
    bullets.forEach(b => {
      b.x += b.speed;
    });
    // 碰撞检测
    bullets.forEach((b, bi) => {
      zombies.forEach((z, zi) => {
        if (
          b.x < z.x + (CELL_SIZE - 20) &&
          b.x + 8 > z.x &&
          b.y < z.row * CELL_SIZE + (CELL_SIZE - 10) &&
          b.y + 4 > z.row * CELL_SIZE + 10
        ) {
          // 子弹击中僵尸
          z.hp -= b.damage;
          // 移除子弹
          bullets.splice(bi, 1);
        }
      });
    });
    // 移除离开画布的子弹
    bullets = bullets.filter(b => b.x < COLS * CELL_SIZE);
  }

  // 移除死亡僵尸
  function removeDeadZombies() {
    for (let i = zombies.length - 1; i >= 0; i--) {
      if (zombies[i].hp <= 0) {
        // 击杀+1分，+25阳光
        score++;
        sun += 25;
        scoreDisplay.textContent = `Score: ${score}`;
        sunDisplay.textContent = `Sun: ${sun}`;
        zombies.splice(i, 1);
      }
    }
  }

  // 每隔一定时间生成一个僵尸
  let zombieSpawnTimer = 0;
  function spawnZombie() {
    zombieSpawnTimer++;
    if (zombieSpawnTimer > 180) { // 每180帧（约3秒）来一个僵尸
      let randRow = Math.floor(Math.random() * ROWS);
      zombies.push({
        x: COLS * CELL_SIZE,
        row: randRow,
        hp: ZOMBIE_HP,
        speed: ZOMBIE_SPEED
      });
      zombieSpawnTimer = 0;
    }
  }

  // 游戏循环
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawPlants();
    drawZombies();
    drawBullets();

    updatePlants();
    updateZombies();
    updateBullets();
    removeDeadZombies();
    spawnZombie();

    requestAnimationFrame(gameLoop);
  }

  // 点击放置植物
  function placePlant(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    let col = Math.floor(mouseX / CELL_SIZE);
    let row = Math.floor(mouseY / CELL_SIZE);

    // 检查是否有足够阳光，是否已经放置过植物
    if (sun >= PLANT_COST && !plants.some(p => p.row === row && p.col === col)) {
      // 放置植物
      plants.push({ 
        row, 
        col, 
        cooldown: PLANT_COOLDOWN, 
        hp: 999 
      });
      sun -= PLANT_COST;
      sunDisplay.textContent = `Sun: ${sun}`;
    }
  }

  canvas.addEventListener("click", placePlant);

  // 开始游戏
  gameLoop();
});
