// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAF9P___XJOjix4ckD-DazSzyz5y3IxrjA",
  authDomain: "space-impact-gam.firebaseapp.com",
  databaseURL: "https://space-impact-gam-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "space-impact-gam",
  storageBucket: "space-impact-gam.firebasestorage.app",
  messagingSenderId: "408256111722",
  appId: "1:408256111722:web:7df11308768c90132b9613"
};

class SpaceImpactCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.gameStarted = false;
    this.gameOver = false;
    this.paused = false;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.invincible = false;
    this.invincibleTime = 0;
    this.bossActive = false;
    this.boss = null;
    this.nextBossScore = 500;
    this.player = { x: 30, y: 50, width: 12, height: 6 };
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.obstacles = [];
    this.meteorites = [];
    this.turrets = [];
    this.particles = [];
    this.powerups = [];
    this.keys = {};
    this.lastEnemySpawn = 0;
    this.enemySpawnInterval = 2000;
    this.lastObstacleSpawn = 0;
    this.obstacleSpawnInterval = 3500;
    this.lastMeteoriteSpawn = 0;
    this.meteoriteSpawnInterval = 4000;
    this.lastTurretSpawn = 0;
    this.turretSpawnInterval = 6000;
    this.gameSpeed = 1;

    // Power-up system
    this.tripleShot = false;
    this.tripleShotTime = 0;
    this.rapidFire = false;
    this.rapidFireTime = 0;
    this.shield = false;

    // Screen shake
    this.screenShake = 0;
    this.shakeIntensity = 0;

    // High score
    this.highScore = this.loadHighScore();

    // Leaderboard
    this.leaderboardVisible = false;
    this.leaderboardData = [];
    this.playerName = this.loadPlayerName();
    this.firebaseInitialized = false;

    // Initialize Firebase
    this.initializeFirebase();
  }

  setConfig(config) {
    this.config = config;
  }

  connectedCallback() {
    this.render();
    this.setupGame();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: #c7d6b5;
          padding: 16px;
          border-radius: 8px;
        }

        .game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .screen {
          background: #9ba883;
          padding: 8px;
          border-radius: 4px;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
        }

        canvas {
          display: block;
          background: #a4b47a;
          border: 2px solid #5f6e4a;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        .info {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 400px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #2d3a1f;
          font-weight: bold;
        }

        .controls {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #2d3a1f;
          text-align: center;
          line-height: 1.6;
        }

        .game-over {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Courier New', monospace;
          font-size: 20px;
          color: #2d3a1f;
          font-weight: bold;
          text-align: center;
          background: rgba(167, 184, 122, 0.9);
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #2d3a1f;
        }

        .game-over-hidden {
          display: none;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-hidden {
          display: none;
        }

        .modal-content {
          background: #c7d6b5;
          padding: 24px;
          border-radius: 8px;
          border: 3px solid #2d3a1f;
          max-width: 400px;
          max-height: 80vh;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          color: #2d3a1f;
        }

        .modal-header {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 16px;
          text-align: center;
          border-bottom: 2px solid #2d3a1f;
          padding-bottom: 8px;
        }

        .name-input-container {
          text-align: center;
          margin-top: 16px;
        }

        .name-input {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          padding: 8px;
          border: 2px solid #2d3a1f;
          border-radius: 4px;
          background: #a4b47a;
          color: #2d3a1f;
          width: 200px;
          margin: 8px 0;
        }

        .btn {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          padding: 8px 16px;
          border: 2px solid #2d3a1f;
          border-radius: 4px;
          background: #9ba883;
          color: #2d3a1f;
          cursor: pointer;
          margin: 4px;
          font-weight: bold;
        }

        .btn:hover {
          background: #a4b47a;
        }

        .btn:active {
          background: #8a9972;
        }

        .leaderboard-list {
          list-style: none;
          padding: 0;
          margin: 16px 0;
          font-size: 12px;
        }

        .leaderboard-item {
          padding: 6px 8px;
          margin: 4px 0;
          background: #9ba883;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
        }

        .leaderboard-item.highlight {
          background: #a4b47a;
          border: 2px solid #2d3a1f;
          font-weight: bold;
        }

        .leaderboard-rank {
          font-weight: bold;
          margin-right: 8px;
        }

        .leaderboard-btn {
          margin-top: 8px;
          font-size: 11px;
        }

        .loading {
          text-align: center;
          padding: 20px;
          font-size: 14px;
        }
      </style>

      <div class="game-container">
        <div class="info">
          <div>SCORE: <span id="score">0</span><br><span style="font-size: 10px;">HI: <span id="highScore">0</span></span></div>
          <div>SPACE IMPACT</div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>LVL: <span id="level">1</span></span>
            <span style="margin-left: 8px;">♥</span>
            <span id="lives">3</span>
          </div>
        </div>

        <div class="screen">
          <canvas id="gameCanvas" width="400" height="200"></canvas>
          <div id="gameOver" class="game-over game-over-hidden">
            GAME OVER<br>
            <div style="font-size: 16px; margin-top: 10px;">Score: <span id="finalScore">0</span></div>
            <div style="font-size: 12px; margin-top: 10px;">Press ENTER to restart</div>
          </div>
        </div>

        <div class="controls">
          ↑↓ Move | SPACE Shoot | ENTER Start/Restart | P Pause
          <br>
          <button id="leaderboardBtn" class="btn leaderboard-btn">View Global Top 100</button>
        </div>
      </div>

      <!-- Name Input Modal -->
      <div id="nameModal" class="modal modal-hidden">
        <div class="modal-content">
          <div class="modal-header">SUBMIT YOUR SCORE</div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; margin: 16px 0;">
              <span id="submitScore">0</span> points
            </div>
            <div class="name-input-container">
              <div style="margin-bottom: 8px;">Enter your name:</div>
              <input type="text" id="nameInput" class="name-input" maxlength="20" placeholder="Player">
              <div style="margin-top: 16px;">
                <button id="submitBtn" class="btn">Submit to Leaderboard</button>
                <button id="skipBtn" class="btn">Skip</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard Modal -->
      <div id="leaderboardModal" class="modal modal-hidden">
        <div class="modal-content">
          <div class="modal-header">GLOBAL TOP 100</div>
          <div id="leaderboardContent">
            <div class="loading">Loading...</div>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <button id="closeLeaderboardBtn" class="btn">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  setupGame() {
    this.canvas = this.shadowRoot.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreElement = this.shadowRoot.getElementById('score');
    this.levelElement = this.shadowRoot.getElementById('level');
    this.livesElement = this.shadowRoot.getElementById('lives');
    this.highScoreElement = this.shadowRoot.getElementById('highScore');
    this.gameOverElement = this.shadowRoot.getElementById('gameOver');
    this.finalScoreElement = this.shadowRoot.getElementById('finalScore');

    // Leaderboard elements
    this.nameModal = this.shadowRoot.getElementById('nameModal');
    this.nameInput = this.shadowRoot.getElementById('nameInput');
    this.submitScoreElement = this.shadowRoot.getElementById('submitScore');
    this.submitBtn = this.shadowRoot.getElementById('submitBtn');
    this.skipBtn = this.shadowRoot.getElementById('skipBtn');
    this.leaderboardModal = this.shadowRoot.getElementById('leaderboardModal');
    this.leaderboardContent = this.shadowRoot.getElementById('leaderboardContent');
    this.leaderboardBtn = this.shadowRoot.getElementById('leaderboardBtn');
    this.closeLeaderboardBtn = this.shadowRoot.getElementById('closeLeaderboardBtn');

    // Disable smoothing for pixelated look
    this.ctx.imageSmoothingEnabled = false;

    // Bind keyboard events
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Bind button events
    this.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
    this.closeLeaderboardBtn.addEventListener('click', () => this.hideLeaderboard());
    this.submitBtn.addEventListener('click', () => this.submitScore());
    this.skipBtn.addEventListener('click', () => this.hideNameModal());

    // Pre-fill name input if player has saved name
    if (this.playerName) {
      this.nameInput.value = this.playerName;
    }

    // Start game loop
    this.lastTime = Date.now();
    this.updateHighScore();
    this.gameLoop();
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (!this.gameStarted || this.gameOver) {
        this.startGame();
      }
      e.preventDefault();
      return;
    }

    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (this.gameStarted && !this.gameOver) {
        this.togglePause();
      }
      e.preventDefault();
      return;
    }

    // Cheat code: Q to spawn boss
    if (e.key === 'q' || e.key === 'Q') {
      if (this.gameStarted && !this.gameOver && !this.paused && !this.bossActive && !this.boss) {
        this.spawnBoss();
        e.preventDefault();
      }
      return;
    }

    if (!this.gameStarted || this.gameOver || this.paused) return;

    this.keys[e.key] = true;

    if (e.key === ' ' || e.key === 'Spacebar') {
      this.shoot();
      e.preventDefault();
    }
  }

  handleKeyUp(e) {
    this.keys[e.key] = false;
  }

  startGame() {
    this.gameStarted = true;
    this.gameOver = false;
    this.paused = false;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.invincible = false;
    this.invincibleTime = 0;
    this.bossActive = false;
    this.boss = null;
    this.nextBossScore = 500;
    this.player = { x: 30, y: 50, width: 12, height: 6 };
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.obstacles = [];
    this.meteorites = [];
    this.turrets = [];
    this.particles = [];
    this.powerups = [];
    this.lastEnemySpawn = Date.now();
    this.enemySpawnInterval = 2000;
    this.lastObstacleSpawn = Date.now();
    this.obstacleSpawnInterval = 3500;
    this.lastMeteoriteSpawn = Date.now();
    this.meteoriteSpawnInterval = 4000;
    this.lastTurretSpawn = Date.now();
    this.turretSpawnInterval = 6000;
    this.gameSpeed = 1;

    // Reset power-ups
    this.tripleShot = false;
    this.tripleShotTime = 0;
    this.rapidFire = false;
    this.rapidFireTime = 0;
    this.shield = false;

    // Reset screen shake
    this.screenShake = 0;
    this.shakeIntensity = 0;

    this.gameOverElement.classList.add('game-over-hidden');
    this.updateScore();
    this.updateLevel();
    this.updateLives();
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.pauseStartTime = Date.now();
    } else {
      // Adjust spawn timers to account for pause time
      const pauseDuration = Date.now() - this.pauseStartTime;
      this.lastEnemySpawn += pauseDuration;
      this.lastObstacleSpawn += pauseDuration;
      this.lastMeteoriteSpawn += pauseDuration;
      this.lastTurretSpawn += pauseDuration;
      if (this.lastShot) {
        this.lastShot += pauseDuration;
      }
      if (this.boss && this.boss.lastShot) {
        this.boss.lastShot += pauseDuration;
      }
      // Adjust turret shot timers
      this.turrets.forEach(turret => {
        if (turret.lastShot) {
          turret.lastShot += pauseDuration;
        }
      });
    }
  }

  shoot() {
    const now = Date.now();
    const fireRate = this.rapidFire ? 150 : 250; // Rapid fire = 150ms cooldown

    if (!this.lastShot || now - this.lastShot > fireRate) {
      if (this.tripleShot) {
        // Triple shot - 3 bullets in spread pattern
        this.bullets.push({
          x: this.player.x + this.player.width,
          y: this.player.y + this.player.height / 2 - 1,
          width: 4,
          height: 2,
          speed: 4,
          vy: 0 // Straight
        });
        this.bullets.push({
          x: this.player.x + this.player.width,
          y: this.player.y + this.player.height / 2 - 1,
          width: 4,
          height: 2,
          speed: 4,
          vy: -0.8 // Up diagonal
        });
        this.bullets.push({
          x: this.player.x + this.player.width,
          y: this.player.y + this.player.height / 2 - 1,
          width: 4,
          height: 2,
          speed: 4,
          vy: 0.8 // Down diagonal
        });
      } else {
        // Normal shot
        this.bullets.push({
          x: this.player.x + this.player.width,
          y: this.player.y + this.player.height / 2 - 1,
          width: 4,
          height: 2,
          speed: 4,
          vy: 0
        });
      }
      this.lastShot = now;
    }
  }

  spawnEnemy() {
    const now = Date.now();
    if (now - this.lastEnemySpawn > this.enemySpawnInterval) {
      const type = Math.random() > 0.7 ? 'large' : 'small';
      const enemy = {
        type: type,
        x: this.canvas.width,
        y: Math.random() * (this.canvas.height - 20) + 10,
        width: type === 'large' ? 14 : 10,
        height: type === 'large' ? 10 : 6,
        speed: type === 'large' ? 1.2 : 1.5, // Fixed: absolute speed values
        health: type === 'large' ? 3 : 1,
        movePattern: 0,
        moveDirection: Math.random() > 0.5 ? 1 : -1
      };
      this.enemies.push(enemy);
      this.lastEnemySpawn = now;

      // Increase difficulty over time
      if (this.enemySpawnInterval > 800) {
        this.enemySpawnInterval -= 20;
      }
      if (this.gameSpeed < 2) {
        this.gameSpeed += 0.02;
      }
    }
  }

  spawnObstacle() {
    const now = Date.now();
    if (now - this.lastObstacleSpawn > this.obstacleSpawnInterval) {
      // Randomly place obstacle on top or bottom
      const position = Math.random() > 0.5 ? 'top' : 'bottom';
      const height = 15 + Math.random() * 15; // Random height 15-30

      const obstacle = {
        type: 'obstacle',
        x: this.canvas.width,
        y: position === 'top' ? 0 : this.canvas.height - height,
        width: 12,
        height: height,
        speed: 1.5 * this.gameSpeed,
        position: position
      };
      this.obstacles.push(obstacle);
      this.lastObstacleSpawn = now;

      // Vary spawn interval
      this.obstacleSpawnInterval = 3000 + Math.random() * 2000;
    }
  }

  spawnMeteorite() {
    const now = Date.now();
    if (now - this.lastMeteoriteSpawn > this.meteoriteSpawnInterval) {
      // Determine meteorite size (small, medium, large, giant)
      const rand = Math.random();
      let size, points, health;

      if (rand < 0.5) {
        // Small meteorite - 50% chance
        size = 'small';
        points = 15;
        health = 1;
      } else if (rand < 0.8) {
        // Medium meteorite - 30% chance
        size = 'medium';
        points = 25;
        health = 2;
      } else if (rand < 0.95) {
        // Large meteorite - 15% chance
        size = 'large';
        points = 40;
        health = 3;
      } else {
        // Giant meteorite - 5% chance (2x larger!)
        size = 'giant';
        points = 60;
        health = 5;
      }

      const sizeMap = { small: 10, medium: 14, large: 18, giant: 28 };

      const meteorite = {
        type: 'meteorite',
        size: size,
        x: this.canvas.width,
        y: 30 + Math.random() * (this.canvas.height - 60 - sizeMap[size]),
        width: sizeMap[size],
        height: sizeMap[size],
        speed: Math.abs((size === 'giant' ? 1.0 : size === 'large' ? 1.3 : size === 'medium' ? 1.5 : 1.8) * this.gameSpeed),
        rotation: 0,
        rotationSpeed: 0.1,
        health: health,
        maxHealth: health,
        points: points
      };
      this.meteorites.push(meteorite);
      this.lastMeteoriteSpawn = now;

      // Vary spawn interval
      this.meteoriteSpawnInterval = 3500 + Math.random() * 2500;
    }
  }

  spawnTurret() {
    const now = Date.now();
    if (now - this.lastTurretSpawn > this.turretSpawnInterval) {
      const position = Math.random() > 0.5 ? 'top' : 'bottom';

      const turret = {
        type: 'turret',
        x: this.canvas.width,
        y: position === 'top' ? 5 : this.canvas.height - 18,
        width: 16,
        height: 14,
        speed: Math.abs(1.2 * this.gameSpeed),
        position: position,
        health: 2,
        lastShot: 0
      };
      this.turrets.push(turret);
      this.lastTurretSpawn = now;

      // Vary spawn interval
      this.turretSpawnInterval = 5000 + Math.random() * 3000;
    }
  }

  spawnBoss() {
    if (this.bossActive || this.boss) return;

    this.bossActive = true;
    const bossHealth = 20 + (this.level * 5); // Health increases with level

    this.boss = {
      type: 'boss',
      x: this.canvas.width,
      y: this.canvas.height / 2 - 15,
      width: 30,
      height: 30,
      speed: 0.8,
      health: bossHealth,
      maxHealth: bossHealth,
      movePattern: 0,
      moveSpeed: 1,
      moveDirection: 1,
      lastShot: 0
    };
  }

  updateBoss() {
    if (!this.boss) return;

    // Boss phase system - enraged when HP < 50%
    const healthPercent = this.boss.health / this.boss.maxHealth;
    const isEnraged = healthPercent < 0.5;

    // Move boss left
    if (this.boss.x > this.canvas.width - 80) {
      this.boss.x -= this.boss.speed;
    } else {
      // Vertical movement pattern (faster when enraged)
      this.boss.movePattern += isEnraged ? 0.08 : 0.05;
      const moveSpeed = isEnraged ? this.boss.moveSpeed * 1.5 : this.boss.moveSpeed;
      this.boss.y += Math.sin(this.boss.movePattern) * moveSpeed;

      // Keep boss in bounds
      if (this.boss.y < 10) this.boss.y = 10;
      if (this.boss.y > this.canvas.height - this.boss.height - 10) {
        this.boss.y = this.canvas.height - this.boss.height - 10;
      }

      // Boss shoots (faster when enraged)
      const now = Date.now();
      const shootInterval = isEnraged ? 900 : 1500; // Faster shooting when low HP

      if (!this.boss.lastShot || now - this.boss.lastShot > shootInterval) {
        this.enemyBullets.push({
          x: this.boss.x,
          y: this.boss.y + this.boss.height / 2 - 1,
          width: 4,
          height: 2,
          speedX: isEnraged ? -3 : -2.5, // Faster bullets when enraged
          speedY: 0
        });
        this.boss.lastShot = now;
      }
    }
  }

  updateGame(deltaTime) {
    if (!this.gameStarted || this.gameOver || this.paused) return;

    // Update invincibility
    if (this.invincible) {
      this.invincibleTime -= deltaTime;
      if (this.invincibleTime <= 0) {
        this.invincible = false;
        this.invincibleTime = 0;
      }
    }

    // Update power-ups timers
    if (this.tripleShot) {
      this.tripleShotTime -= deltaTime;
      if (this.tripleShotTime <= 0) {
        this.tripleShot = false;
        this.tripleShotTime = 0;
      }
    }
    if (this.rapidFire) {
      this.rapidFireTime -= deltaTime;
      if (this.rapidFireTime <= 0) {
        this.rapidFire = false;
        this.rapidFireTime = 0;
      }
    }

    // Update screen shake
    if (this.screenShake > 0) {
      this.screenShake -= deltaTime;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // Check if boss should spawn
    if (this.score >= this.nextBossScore && !this.bossActive && !this.boss) {
      this.spawnBoss();
    }

    // Move player
    if (this.keys['ArrowUp'] && this.player.y > 5) {
      this.player.y -= 2.5;
    }
    if (this.keys['ArrowDown'] && this.player.y < this.canvas.height - this.player.height - 5) {
      this.player.y += 2.5;
    }

    // Move bullets
    this.bullets = this.bullets.filter(bullet => {
      bullet.x += bullet.speed;
      if (bullet.vy) bullet.y += bullet.vy; // Support diagonal bullets from triple shot
      return bullet.x < this.canvas.width && bullet.x > 0 && bullet.y > -10 && bullet.y < this.canvas.height + 10;
    });

    // Move enemy bullets
    this.enemyBullets = this.enemyBullets.filter(bullet => {
      bullet.x += (bullet.speedX || bullet.speed || -2);
      bullet.y += (bullet.speedY || 0);
      return bullet.x > -10 && bullet.x < this.canvas.width && bullet.y > -10 && bullet.y < this.canvas.height + 10;
    });

    // Update boss
    if (this.boss) {
      this.updateBoss();
    }

    // Spawn and move enemies (don't spawn during boss fight)
    if (!this.bossActive) {
      this.spawnEnemy();
    }
    this.enemies = this.enemies.filter(enemy => {
      enemy.x -= enemy.speed * this.gameSpeed;

      // Large enemies have vertical movement
      if (enemy.type === 'large') {
        enemy.movePattern += 0.03;
        enemy.y += Math.sin(enemy.movePattern) * 0.8 * enemy.moveDirection;

        // Keep in bounds
        if (enemy.y < 5) {
          enemy.y = 5;
          enemy.moveDirection = 1;
        }
        if (enemy.y > this.canvas.height - enemy.height - 5) {
          enemy.y = this.canvas.height - enemy.height - 5;
          enemy.moveDirection = -1;
        }
      }

      return enemy.x > -enemy.width;
    });

    // Spawn and move obstacles (don't spawn during boss fight)
    if (!this.bossActive) {
      this.spawnObstacle();
    }
    this.obstacles = this.obstacles.filter(obstacle => {
      obstacle.x -= obstacle.speed;
      return obstacle.x > -obstacle.width;
    });

    // Spawn and move meteorites (don't spawn during boss fight)
    if (!this.bossActive) {
      this.spawnMeteorite();
    }
    this.meteorites = this.meteorites.filter(meteorite => {
      meteorite.x -= meteorite.speed;
      meteorite.rotation += meteorite.rotationSpeed;
      return meteorite.x > -meteorite.width;
    });

    // Spawn and move turrets (don't spawn during boss fight)
    if (!this.bossActive) {
      this.spawnTurret();
    }
    this.turrets = this.turrets.filter(turret => {
      turret.x -= turret.speed;

      // Turret shoots diagonally
      const now = Date.now();
      if (turret.x < this.canvas.width - 50 && (!turret.lastShot || now - turret.lastShot > 2000)) {
        // Shoot diagonally down/up depending on position
        const ySpeed = turret.position === 'top' ? 1.5 : -1.5; // Diagonal component

        this.enemyBullets.push({
          x: turret.x,
          y: turret.y + turret.height / 2 - 1,
          width: 4,
          height: 2,
          speedX: -2,
          speedY: ySpeed
        });
        turret.lastShot = now;
      }

      return turret.x > -turret.width;
    });

    // Check collisions - bullets vs enemies
    const bulletsToRemove = new Set();
    const enemiesToRemove = new Set();

    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (!bulletsToRemove.has(bulletIndex) && !enemiesToRemove.has(enemyIndex) && this.checkCollision(bullet, enemy)) {
          bulletsToRemove.add(bulletIndex);
          enemy.health--;

          // Create explosion particles
          this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);

          if (enemy.health <= 0) {
            enemiesToRemove.add(enemyIndex);
            this.score += enemy.type === 'large' ? 20 : 10;
            this.updateScore();

            // Spawn power-up randomly (15% chance)
            if (Math.random() < 0.15) {
              this.spawnPowerup(enemy.x, enemy.y);
            }
          }
        }
      });
    });

    // Remove marked bullets and enemies
    this.bullets = this.bullets.filter((_, index) => !bulletsToRemove.has(index));
    this.enemies = this.enemies.filter((_, index) => !enemiesToRemove.has(index));

    // Check collisions - bullets vs meteorites
    const meteoritesToRemove = new Set();

    this.bullets.forEach((bullet, bulletIndex) => {
      this.meteorites.forEach((meteorite, meteoriteIndex) => {
        if (!bulletsToRemove.has(bulletIndex) && !meteoritesToRemove.has(meteoriteIndex) && this.checkCollision(bullet, meteorite)) {
          bulletsToRemove.add(bulletIndex);
          meteorite.health--;

          // Create explosion particles
          this.createExplosion(meteorite.x + meteorite.width/2, meteorite.y + meteorite.height/2);

          if (meteorite.health <= 0) {
            meteoritesToRemove.add(meteoriteIndex);
            this.score += meteorite.points;
            this.updateScore();
          }
        }
      });
    });

    // Remove marked bullets and meteorites
    this.bullets = this.bullets.filter((_, index) => !bulletsToRemove.has(index));
    this.meteorites = this.meteorites.filter((_, index) => !meteoritesToRemove.has(index));

    // Check collisions - bullets vs boss
    let bossDefeated = false;
    if (this.boss) {
      this.bullets.forEach((bullet, bulletIndex) => {
        if (!bulletsToRemove.has(bulletIndex) && this.boss && this.checkCollision(bullet, this.boss)) {
          bulletsToRemove.add(bulletIndex);
          this.boss.health--;

          // Create explosion particles
          this.createExplosion(bullet.x, bullet.y);

          // Mark boss as defeated (will handle after loop)
          if (this.boss.health <= 0) {
            bossDefeated = true;
          }
        }
      });

      // Handle boss defeat AFTER processing all bullets (only once)
      if (bossDefeated && this.boss) {
        // Boss defeated! Create multiple explosions
        this.createExplosion(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2);
        this.createExplosion(this.boss.x + this.boss.width/3, this.boss.y + this.boss.height/3);
        this.createExplosion(this.boss.x + this.boss.width*2/3, this.boss.y + this.boss.height*2/3);
        this.createExplosion(this.boss.x + 5, this.boss.y + 5);
        this.createExplosion(this.boss.x + this.boss.width - 5, this.boss.y + this.boss.height - 5);

        // SCREEN SHAKE!
        this.screenShake = 500; // Shake for 500ms
        this.shakeIntensity = 4; // 4px shake intensity

        this.score += 100 + (this.level * 50);
        this.updateScore();

        // Remove boss and advance level
        this.boss = null;
        this.bossActive = false;
        this.level++;
        this.nextBossScore = this.score + 500;
        this.updateLevel();

        // Clear all enemy objects when boss dies
        this.enemyBullets = [];
        this.enemies = [];
        this.obstacles = [];
        this.meteorites = [];
        this.turrets = [];

        // Reset spawn timers immediately so game continues smoothly
        const now = Date.now();
        this.lastEnemySpawn = now;
        this.lastObstacleSpawn = now;
        this.lastMeteoriteSpawn = now;
        this.lastTurretSpawn = now;

        // Increase difficulty for next level
        if (this.enemySpawnInterval > 600) {
          this.enemySpawnInterval -= 50;
        }
        this.gameSpeed += 0.15;
      }

      // Remove marked bullets
      this.bullets = this.bullets.filter((_, index) => !bulletsToRemove.has(index));
    }

    // Check collisions - bullets vs turrets
    const turretsToRemove = new Set();

    this.bullets.forEach((bullet, bulletIndex) => {
      this.turrets.forEach((turret, turretIndex) => {
        if (!bulletsToRemove.has(bulletIndex) && !turretsToRemove.has(turretIndex) && this.checkCollision(bullet, turret)) {
          bulletsToRemove.add(bulletIndex);
          turret.health--;

          // Create explosion particles
          this.createExplosion(turret.x + turret.width/2, turret.y + turret.height/2);

          if (turret.health <= 0) {
            turretsToRemove.add(turretIndex);
            this.score += 30;
            this.updateScore();
          }
        }
      });
    });

    // Remove marked bullets and turrets
    this.bullets = this.bullets.filter((_, index) => !bulletsToRemove.has(index));
    this.turrets = this.turrets.filter((_, index) => !turretsToRemove.has(index));

    // Check collisions - player vs enemies
    if (!this.invincible) {
      this.enemies.forEach(enemy => {
        if (this.checkCollision(this.player, enemy)) {
          this.loseLife();
        }
      });

      // Check collisions - player vs obstacles
      this.obstacles.forEach(obstacle => {
        if (this.checkCollision(this.player, obstacle)) {
          this.loseLife();
        }
      });

      // Check collisions - player vs meteorites
      this.meteorites.forEach(meteorite => {
        if (this.checkCollision(this.player, meteorite)) {
          this.loseLife();
        }
      });

      // Check collisions - player vs turrets
      this.turrets.forEach(turret => {
        if (this.checkCollision(this.player, turret)) {
          this.loseLife();
        }
      });

      // Check collisions - player vs boss
      if (this.boss && this.checkCollision(this.player, this.boss)) {
        this.loseLife();
      }

      // Check collisions - player vs enemy bullets
      const enemyBulletsToRemove = [];
      this.enemyBullets.forEach((bullet, bulletIndex) => {
        if (this.checkCollision(this.player, bullet)) {
          enemyBulletsToRemove.push(bulletIndex);
          this.loseLife();
        }
      });

      // Remove marked enemy bullets (iterate backwards to avoid index issues)
      for (let i = enemyBulletsToRemove.length - 1; i >= 0; i--) {
        this.enemyBullets.splice(enemyBulletsToRemove[i], 1);
      }
    }

    // Update and move power-ups
    this.powerups = this.powerups.filter(powerup => {
      powerup.x -= 1.5 * this.gameSpeed; // Move left with game speed
      powerup.time += 16; // Animation timer

      // Check collision with player
      if (this.checkCollision(this.player, powerup)) {
        this.activatePowerup(powerup.type);
        return false; // Remove power-up
      }

      return powerup.x > -powerup.width; // Remove if off-screen
    });

    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.life--;
      particle.x += particle.vx;
      particle.y += particle.vy;
      return particle.life > 0;
    });
  }

  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  createExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 15
      });
    }
  }

  loseLife() {
    if (this.invincible) return;

    // Shield power-up absorbs one hit
    if (this.shield) {
      this.shield = false;
      this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
      // Make player invincible briefly after shield breaks
      this.invincible = true;
      this.invincibleTime = 1000;
      return;
    }

    this.lives--;
    this.updateLives();

    // Create explosion at player position
    this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);

    if (this.lives <= 0) {
      this.endGame();
    } else {
      // Make player invincible for 2 seconds
      this.invincible = true;
      this.invincibleTime = 2000;

      // Reset player position
      this.player.y = this.canvas.height / 2 - this.player.height / 2;
    }
  }

  endGame() {
    this.gameOver = true;
    this.finalScoreElement.textContent = this.score;
    this.gameOverElement.classList.remove('game-over-hidden');

    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      this.updateHighScore();
    }

    // Show name input modal if score > 0
    if (this.score > 0) {
      setTimeout(() => {
        this.showNameModal();
      }, 1000);
    }
  }

  updateScore() {
    this.scoreElement.textContent = this.score;
    // Check if we beat high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      this.updateHighScore();
    }
  }

  updateLevel() {
    this.levelElement.textContent = this.level;
  }

  updateLives() {
    this.livesElement.textContent = this.lives;
  }

  updateHighScore() {
    if (this.highScoreElement) {
      this.highScoreElement.textContent = this.highScore;
    }
  }

  loadHighScore() {
    try {
      const saved = localStorage.getItem('spaceImpactHighScore');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  saveHighScore() {
    try {
      localStorage.setItem('spaceImpactHighScore', this.highScore.toString());
    } catch (e) {
      // Failed to save, ignore
    }
  }

  spawnPowerup(x, y) {
    const types = ['tripleShot', 'rapidFire', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];

    this.powerups.push({
      type: type,
      x: x,
      y: y,
      width: 10,
      height: 10,
      time: 0 // For animation
    });
  }

  activatePowerup(type) {
    switch (type) {
      case 'tripleShot':
        this.tripleShot = true;
        this.tripleShotTime = 8000; // 8 seconds
        break;
      case 'rapidFire':
        this.rapidFire = true;
        this.rapidFireTime = 8000; // 8 seconds
        break;
      case 'shield':
        this.shield = true;
        break;
    }
  }

  drawPixel(x, y, size = 2) {
    this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
  }

  drawPlayer() {
    // Blink when invincible
    if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      return; // Skip drawing every other 100ms
    }

    const px = Math.floor(this.player.x);
    const py = Math.floor(this.player.y);

    // Draw shield around player if active
    if (this.shield) {
      this.ctx.strokeStyle = '#2d3a1f';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(px + this.player.width/2, py + this.player.height/2, this.player.width, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = '#2d3a1f';

    // Classic spaceship shape made of pixels
    // Nose
    this.drawPixel(px + 10, py + 2, 2);
    // Body
    this.drawPixel(px + 8, py + 2, 2);
    this.drawPixel(px + 6, py + 2, 2);
    this.drawPixel(px + 4, py + 2, 2);
    this.drawPixel(px + 2, py + 2, 2);
    // Wings
    this.drawPixel(px + 4, py, 2);
    this.drawPixel(px + 4, py + 4, 2);
    this.drawPixel(px + 2, py, 2);
    this.drawPixel(px + 2, py + 4, 2);
    // Cockpit
    this.drawPixel(px + 6, py + 2, 2);
  }

  drawBullets() {
    this.ctx.fillStyle = '#2d3a1f';
    this.bullets.forEach(bullet => {
      this.drawPixel(bullet.x, bullet.y, 2);
      this.drawPixel(bullet.x + 2, bullet.y, 2);
    });

    // Draw enemy bullets (different style)
    this.enemyBullets.forEach(bullet => {
      this.drawPixel(bullet.x, bullet.y, 2);
      this.drawPixel(bullet.x - 2, bullet.y, 2);
    });
  }

  drawEnemies() {
    this.ctx.fillStyle = '#2d3a1f';
    this.enemies.forEach(enemy => {
      const ex = Math.floor(enemy.x);
      const ey = Math.floor(enemy.y);

      if (enemy.type === 'large') {
        // Large enemy ship
        for (let i = 0; i < 6; i++) {
          this.drawPixel(ex + i * 2, ey + 4, 2);
        }
        this.drawPixel(ex + 2, ey + 2, 2);
        this.drawPixel(ex + 2, ey + 6, 2);
        this.drawPixel(ex + 4, ey + 2, 2);
        this.drawPixel(ex + 4, ey + 6, 2);
        this.drawPixel(ex + 8, ey + 2, 2);
        this.drawPixel(ex + 8, ey + 6, 2);
      } else {
        // Small enemy
        this.drawPixel(ex, ey + 2, 2);
        this.drawPixel(ex + 2, ey + 2, 2);
        this.drawPixel(ex + 4, ey + 2, 2);
        this.drawPixel(ex + 6, ey + 2, 2);
        this.drawPixel(ex + 2, ey, 2);
        this.drawPixel(ex + 2, ey + 4, 2);
      }
    });
  }

  drawParticles() {
    this.ctx.fillStyle = '#2d3a1f';
    this.particles.forEach(particle => {
      if (particle.life > 5) {
        this.drawPixel(particle.x, particle.y, 2);
      } else {
        this.drawPixel(particle.x, particle.y, 1);
      }
    });
  }

  drawPowerups() {
    this.ctx.fillStyle = '#2d3a1f';
    this.powerups.forEach(powerup => {
      const px = Math.floor(powerup.x);
      const py = Math.floor(powerup.y);

      // Animated pulsing effect
      const pulse = Math.sin(powerup.time / 100) > 0;

      if (powerup.type === 'tripleShot') {
        // Draw "3" icon
        if (pulse) {
          this.drawPixel(px, py, 2);
          this.drawPixel(px + 2, py, 2);
          this.drawPixel(px + 4, py, 2);
          this.drawPixel(px + 4, py + 2, 2);
          this.drawPixel(px + 2, py + 4, 2);
          this.drawPixel(px + 4, py + 4, 2);
          this.drawPixel(px, py + 8, 2);
          this.drawPixel(px + 2, py + 8, 2);
          this.drawPixel(px + 4, py + 8, 2);
          this.drawPixel(px + 4, py + 6, 2);
        }
      } else if (powerup.type === 'rapidFire') {
        // Draw ">>" icon
        if (pulse) {
          this.drawPixel(px, py + 2, 2);
          this.drawPixel(px + 2, py, 2);
          this.drawPixel(px + 2, py + 4, 2);
          this.drawPixel(px + 4, py + 2, 2);
          this.drawPixel(px + 6, py, 2);
          this.drawPixel(px + 6, py + 4, 2);
        }
      } else if (powerup.type === 'shield') {
        // Draw shield icon
        if (pulse) {
          this.drawPixel(px + 2, py, 2);
          this.drawPixel(px, py + 2, 2);
          this.drawPixel(px + 4, py + 2, 2);
          this.drawPixel(px, py + 4, 2);
          this.drawPixel(px + 4, py + 4, 2);
          this.drawPixel(px + 2, py + 6, 2);
          this.drawPixel(px + 2, py + 8, 2);
        }
      }
    });
  }

  drawObstacles() {
    this.ctx.fillStyle = '#2d3a1f';
    this.obstacles.forEach(obstacle => {
      const ox = Math.floor(obstacle.x);
      const oy = Math.floor(obstacle.y);

      // Draw building/wall-like structure
      for (let i = 0; i < obstacle.height; i += 3) {
        // Vertical lines
        this.drawPixel(ox, oy + i, 2);
        this.drawPixel(ox + 10, oy + i, 2);

        // Horizontal details every 6 pixels
        if (i % 6 === 0) {
          for (let j = 2; j < 10; j += 2) {
            this.drawPixel(ox + j, oy + i, 2);
          }
        }
      }

      // Side edges
      for (let i = 0; i < obstacle.height; i += 2) {
        this.drawPixel(ox + 2, oy + i, 2);
        this.drawPixel(ox + 8, oy + i, 2);
      }
    });
  }

  drawMeteorites() {
    this.ctx.fillStyle = '#2d3a1f';
    this.meteorites.forEach(meteorite => {
      const mx = Math.floor(meteorite.x);
      const my = Math.floor(meteorite.y);
      const size = meteorite.size;

      if (size === 'small') {
        // Small meteorite (10px)
        this.drawPixel(mx + 3, my + 3, 2);
        this.drawPixel(mx + 5, my + 3, 2);
        this.drawPixel(mx + 3, my + 5, 2);
        this.drawPixel(mx + 5, my + 5, 2);
        this.drawPixel(mx + 1, my + 4, 2);
        this.drawPixel(mx + 7, my + 4, 2);
        this.drawPixel(mx + 4, my + 1, 2);
        this.drawPixel(mx + 4, my + 7, 2);
        this.drawPixel(mx + 2, my + 2, 2);
        this.drawPixel(mx + 6, my + 6, 2);
      } else if (size === 'medium') {
        // Medium meteorite (14px)
        this.drawPixel(mx + 4, my + 4, 2);
        this.drawPixel(mx + 6, my + 4, 2);
        this.drawPixel(mx + 8, my + 4, 2);
        this.drawPixel(mx + 4, my + 6, 2);
        this.drawPixel(mx + 6, my + 6, 2);
        this.drawPixel(mx + 8, my + 6, 2);
        this.drawPixel(mx + 4, my + 8, 2);
        this.drawPixel(mx + 6, my + 8, 2);
        this.drawPixel(mx + 8, my + 8, 2);
        this.drawPixel(mx + 2, my + 5, 2);
        this.drawPixel(mx + 10, my + 5, 2);
        this.drawPixel(mx + 5, my + 2, 2);
        this.drawPixel(mx + 5, my + 10, 2);
        this.drawPixel(mx + 3, my + 3, 2);
        this.drawPixel(mx + 9, my + 9, 2);
      } else if (size === 'large') {
        // Large meteorite (18px)
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            this.drawPixel(mx + 6 + i * 2, my + 6 + j * 2, 2);
          }
        }
        this.drawPixel(mx + 3, my + 7, 2);
        this.drawPixel(mx + 13, my + 7, 2);
        this.drawPixel(mx + 7, my + 3, 2);
        this.drawPixel(mx + 7, my + 13, 2);
        this.drawPixel(mx + 4, my + 4, 2);
        this.drawPixel(mx + 12, my + 12, 2);
        this.drawPixel(mx + 4, my + 12, 2);
        this.drawPixel(mx + 12, my + 4, 2);
        this.drawPixel(mx + 2, my + 8, 2);
        this.drawPixel(mx + 14, my + 8, 2);
      } else if (size === 'giant') {
        // Giant meteorite (28px) - MASSIVE!
        // Dense core
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            this.drawPixel(mx + 10 + i * 2, my + 10 + j * 2, 2);
          }
        }
        // Outer ring
        for (let i = 0; i < 7; i++) {
          this.drawPixel(mx + 8 + i * 2, my + 6, 2);
          this.drawPixel(mx + 8 + i * 2, my + 20, 2);
        }
        for (let i = 0; i < 5; i++) {
          this.drawPixel(mx + 6, my + 8 + i * 2, 2);
          this.drawPixel(mx + 22, my + 8 + i * 2, 2);
        }
        // Corner details
        this.drawPixel(mx + 4, my + 10, 2);
        this.drawPixel(mx + 24, my + 10, 2);
        this.drawPixel(mx + 10, my + 4, 2);
        this.drawPixel(mx + 10, my + 24, 2);
        this.drawPixel(mx + 6, my + 6, 2);
        this.drawPixel(mx + 22, my + 22, 2);
        this.drawPixel(mx + 6, my + 22, 2);
        this.drawPixel(mx + 22, my + 6, 2);
      }
    });
  }

  drawTurrets() {
    this.ctx.fillStyle = '#2d3a1f';
    this.turrets.forEach(turret => {
      const tx = Math.floor(turret.x);
      const ty = Math.floor(turret.y);

      // Base
      for (let i = 0; i < 8; i += 2) {
        this.drawPixel(tx + i, ty + 6, 2);
      }
      for (let i = 0; i < 6; i += 2) {
        this.drawPixel(tx + 2 + i, ty + 8, 2);
      }

      // Turret head (gun barrel)
      this.drawPixel(tx, ty + 6, 2);
      this.drawPixel(tx + 2, ty + 4, 2);
      this.drawPixel(tx + 4, ty + 4, 2);

      // Support
      this.drawPixel(tx + 6, ty + 4, 2);
      this.drawPixel(tx + 8, ty + 6, 2);

      // Wall mounting
      if (turret.position === 'top') {
        this.drawPixel(tx + 4, ty, 2);
        this.drawPixel(tx + 4, ty + 2, 2);
      } else {
        this.drawPixel(tx + 4, ty + 10, 2);
        this.drawPixel(tx + 4, ty + 12, 2);
      }
    });
  }

  drawBoss() {
    if (!this.boss) return;

    this.ctx.fillStyle = '#2d3a1f';
    const bx = Math.floor(this.boss.x);
    const by = Math.floor(this.boss.y);

    // Draw large boss ship
    // Main body
    for (let i = 0; i < 12; i += 2) {
      this.drawPixel(bx + i, by + 14, 2);
    }
    for (let i = 0; i < 8; i += 2) {
      this.drawPixel(bx + 4 + i, by + 12, 2);
      this.drawPixel(bx + 4 + i, by + 16, 2);
    }

    // Wings
    this.drawPixel(bx + 6, by + 8, 2);
    this.drawPixel(bx + 6, by + 10, 2);
    this.drawPixel(bx + 6, by + 18, 2);
    this.drawPixel(bx + 6, by + 20, 2);
    this.drawPixel(bx + 4, by + 10, 2);
    this.drawPixel(bx + 4, by + 18, 2);

    // Cockpit/center
    this.drawPixel(bx + 8, by + 14, 2);
    this.drawPixel(bx + 10, by + 14, 2);

    // Details
    this.drawPixel(bx + 2, by + 14, 2);
    this.drawPixel(bx + 12, by + 12, 2);
    this.drawPixel(bx + 12, by + 16, 2);

    // Health bar
    const healthBarWidth = 30;
    const healthBarHeight = 4;
    const healthBarX = bx;
    const healthBarY = by - 8;

    // Background
    this.ctx.strokeStyle = '#2d3a1f';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Health fill
    const healthPercent = this.boss.health / this.boss.maxHealth;
    this.ctx.fillStyle = '#2d3a1f';
    this.ctx.fillRect(healthBarX + 1, healthBarY + 1, (healthBarWidth - 2) * healthPercent, healthBarHeight - 2);
  }

  drawGame() {
    // Apply screen shake
    this.ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.ctx.translate(shakeX, shakeY);
    }

    // Clear canvas with Nokia greenish background
    this.ctx.fillStyle = '#a4b47a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.gameStarted) {
      // Draw start screen
      this.ctx.fillStyle = '#2d3a1f';
      this.ctx.font = 'bold 20px "Courier New", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('SPACE IMPACT', this.canvas.width / 2, this.canvas.height / 2 - 20);
      this.ctx.font = '14px "Courier New", monospace';
      this.ctx.fillText('Press ENTER to start', this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.restore();
      return;
    }

    // Draw game elements
    this.drawObstacles();
    this.drawTurrets();
    this.drawMeteorites();
    this.drawBoss();
    this.drawPlayer();
    this.drawBullets();
    this.drawEnemies();
    this.drawPowerups();
    this.drawParticles();

    // Draw boss warning
    if (this.bossActive && this.boss && this.boss.x > this.canvas.width - 100) {
      this.ctx.fillStyle = '#2d3a1f';
      this.ctx.font = 'bold 16px "Courier New", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('BOSS INCOMING!', this.canvas.width / 2, 30);
    }

    // Draw border
    this.ctx.strokeStyle = '#2d3a1f';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);

    // Draw power-up indicators (top left corner)
    let powerupY = 10;
    if (this.tripleShot) {
      this.ctx.fillStyle = '#2d3a1f';
      this.ctx.font = '10px "Courier New", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('3-SHOT: ' + Math.ceil(this.tripleShotTime / 1000) + 's', 10, powerupY);
      powerupY += 12;
    }
    if (this.rapidFire) {
      this.ctx.fillStyle = '#2d3a1f';
      this.ctx.font = '10px "Courier New", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('RAPID: ' + Math.ceil(this.rapidFireTime / 1000) + 's', 10, powerupY);
      powerupY += 12;
    }
    if (this.shield) {
      this.ctx.fillStyle = '#2d3a1f';
      this.ctx.font = '10px "Courier New", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('SHIELD', 10, powerupY);
    }

    // Draw pause overlay
    if (this.paused) {
      this.ctx.fillStyle = 'rgba(164, 180, 122, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#2d3a1f';
      this.ctx.font = 'bold 24px "Courier New", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 10);

      this.ctx.font = '12px "Courier New", monospace';
      this.ctx.fillText('Press P or ESC to continue', this.canvas.width / 2, this.canvas.height / 2 + 15);
    }

    // Restore canvas after screen shake
    this.ctx.restore();
  }

  gameLoop() {
    const now = Date.now();
    let deltaTime = now - this.lastTime;
    this.lastTime = now;

    // Cap deltaTime to prevent issues when tab loses focus
    // This prevents massive time jumps that can cause freezing
    deltaTime = Math.min(deltaTime, 100);

    this.updateGame(deltaTime);
    this.drawGame();

    this.animationFrame = requestAnimationFrame(() => this.gameLoop());
  }

  // Firebase and Leaderboard Functions

  async initializeFirebase() {
    try {
      // Load Firebase SDK dynamically
      if (!window.firebase) {
        await this.loadFirebaseSDK();
      }

      // Initialize Firebase if not already initialized
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }

      this.db = firebase.database();
      this.firebaseInitialized = true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      this.firebaseInitialized = false;
    }
  }

  async loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
      const script1 = document.createElement('script');
      script1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
        script2.onload = resolve;
        script2.onerror = reject;
        document.head.appendChild(script2);
      };
      script1.onerror = reject;
      document.head.appendChild(script1);
    });
  }

  loadPlayerName() {
    try {
      const saved = localStorage.getItem('spaceImpactPlayerName');
      return saved || '';
    } catch (e) {
      return '';
    }
  }

  savePlayerName(name) {
    try {
      localStorage.setItem('spaceImpactPlayerName', name);
      this.playerName = name;
    } catch (e) {
      // Failed to save, ignore
    }
  }

  showNameModal() {
    this.submitScoreElement.textContent = this.score;
    this.nameModal.classList.remove('modal-hidden');
    // Focus on input
    setTimeout(() => {
      this.nameInput.focus();
    }, 100);
  }

  hideNameModal() {
    this.nameModal.classList.add('modal-hidden');
  }

  async submitScore() {
    const name = this.nameInput.value.trim() || 'Player';

    // Save player name for future use
    this.savePlayerName(name);

    // Hide modal
    this.hideNameModal();

    if (!this.firebaseInitialized) {
      console.error('Firebase not initialized');
      return;
    }

    try {
      // Submit score to Firebase
      const scoreRef = this.db.ref('leaderboard');
      await scoreRef.push({
        name: name,
        score: this.score,
        level: this.level,
        timestamp: Date.now()
      });

      console.log('Score submitted successfully!');

      // Show leaderboard after submission
      setTimeout(() => {
        this.showLeaderboard();
      }, 500);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }

  async showLeaderboard() {
    this.leaderboardModal.classList.remove('modal-hidden');
    this.leaderboardContent.innerHTML = '<div class="loading">Loading...</div>';

    if (!this.firebaseInitialized) {
      this.leaderboardContent.innerHTML = '<div style="text-align: center; padding: 20px;">Leaderboard unavailable</div>';
      return;
    }

    try {
      await this.fetchLeaderboard();
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      this.leaderboardContent.innerHTML = '<div style="text-align: center; padding: 20px;">Failed to load leaderboard</div>';
    }
  }

  hideLeaderboard() {
    this.leaderboardModal.classList.add('modal-hidden');
  }

  async fetchLeaderboard() {
    try {
      const snapshot = await this.db.ref('leaderboard')
        .orderByChild('score')
        .limitToLast(100)
        .once('value');

      const scores = [];
      snapshot.forEach((childSnapshot) => {
        scores.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      // Sort by score descending (highest first)
      scores.sort((a, b) => b.score - a.score);

      this.leaderboardData = scores;
      this.renderLeaderboard();
    } catch (error) {
      throw error;
    }
  }

  renderLeaderboard() {
    if (this.leaderboardData.length === 0) {
      this.leaderboardContent.innerHTML = '<div style="text-align: center; padding: 20px;">No scores yet. Be the first!</div>';
      return;
    }

    let html = '<ul class="leaderboard-list">';

    this.leaderboardData.forEach((entry, index) => {
      const rank = index + 1;
      const isCurrentPlayer = entry.name === this.playerName &&
                              Math.abs(entry.timestamp - Date.now()) < 60000; // Within last minute

      const highlightClass = isCurrentPlayer ? 'highlight' : '';
      const medal = rank === 1 ? '🥇 ' : rank === 2 ? '🥈 ' : rank === 3 ? '🥉 ' : '';

      html += `
        <li class="leaderboard-item ${highlightClass}">
          <span>
            <span class="leaderboard-rank">${medal}#${rank}</span>
            ${this.escapeHtml(entry.name)}
          </span>
          <span><strong>${entry.score}</strong> pts (Lvl ${entry.level})</span>
        </li>
      `;
    });

    html += '</ul>';
    this.leaderboardContent.innerHTML = html;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getCardSize() {
    return 3;
  }

  static getStubConfig() {
    return {};
  }
}

customElements.define('space-impact-card', SpaceImpactCard);

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'space-impact-card',
  name: 'Space Impact Card',
  description: 'Retro Nokia Space Impact game for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/yourusername/space-impact-card',
});

console.info(
  '%c SPACE-IMPACT-CARD %c v1.0.0 ',
  'color: white; background: #2d3a1f; font-weight: bold;',
  'color: #2d3a1f; background: white; font-weight: bold;'
);
