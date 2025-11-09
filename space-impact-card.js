class SpaceImpactCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.gameStarted = false;
    this.gameOver = false;
    this.score = 0;
    this.player = { x: 30, y: 50, width: 12, height: 6 };
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.keys = {};
    this.lastEnemySpawn = 0;
    this.enemySpawnInterval = 2000;
    this.gameSpeed = 1;
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
      </style>

      <div class="game-container">
        <div class="info">
          <div>SCORE: <span id="score">0</span></div>
          <div>SPACE IMPACT</div>
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
          ↑↓ Pohyb | MEZERNÍK Střelba | ENTER Start/Restart
        </div>
      </div>
    `;
  }

  setupGame() {
    this.canvas = this.shadowRoot.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreElement = this.shadowRoot.getElementById('score');
    this.gameOverElement = this.shadowRoot.getElementById('gameOver');
    this.finalScoreElement = this.shadowRoot.getElementById('finalScore');

    // Disable smoothing for pixelated look
    this.ctx.imageSmoothingEnabled = false;

    // Bind keyboard events
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Start game loop
    this.lastTime = Date.now();
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

    if (!this.gameStarted || this.gameOver) return;

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
    this.score = 0;
    this.player = { x: 30, y: 50, width: 12, height: 6 };
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.lastEnemySpawn = Date.now();
    this.enemySpawnInterval = 2000;
    this.gameSpeed = 1;
    this.gameOverElement.classList.add('game-over-hidden');
    this.updateScore();
  }

  shoot() {
    const now = Date.now();
    if (!this.lastShot || now - this.lastShot > 250) {
      this.bullets.push({
        x: this.player.x + this.player.width,
        y: this.player.y + this.player.height / 2 - 1,
        width: 4,
        height: 2,
        speed: 4
      });
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
        speed: (type === 'large' ? 0.8 : 1.2) * this.gameSpeed,
        health: type === 'large' ? 3 : 1
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

  updateGame(deltaTime) {
    if (!this.gameStarted || this.gameOver) return;

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
      return bullet.x < this.canvas.width;
    });

    // Spawn and move enemies
    this.spawnEnemy();
    this.enemies = this.enemies.filter(enemy => {
      enemy.x -= enemy.speed;
      return enemy.x > -enemy.width;
    });

    // Check collisions - bullets vs enemies
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (this.checkCollision(bullet, enemy)) {
          this.bullets.splice(bulletIndex, 1);
          enemy.health--;

          // Create explosion particles
          this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);

          if (enemy.health <= 0) {
            this.enemies.splice(enemyIndex, 1);
            this.score += enemy.type === 'large' ? 20 : 10;
            this.updateScore();
          }
        }
      });
    });

    // Check collisions - player vs enemies
    this.enemies.forEach(enemy => {
      if (this.checkCollision(this.player, enemy)) {
        this.endGame();
      }
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

  endGame() {
    this.gameOver = true;
    this.finalScoreElement.textContent = this.score;
    this.gameOverElement.classList.remove('game-over-hidden');
  }

  updateScore() {
    this.scoreElement.textContent = this.score;
  }

  drawPixel(x, y, size = 2) {
    this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
  }

  drawPlayer() {
    this.ctx.fillStyle = '#2d3a1f';

    // Classic spaceship shape made of pixels
    const px = Math.floor(this.player.x);
    const py = Math.floor(this.player.y);

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

  drawGame() {
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
      return;
    }

    // Draw game elements
    this.drawPlayer();
    this.drawBullets();
    this.drawEnemies();
    this.drawParticles();

    // Draw border
    this.ctx.strokeStyle = '#2d3a1f';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
  }

  gameLoop() {
    const now = Date.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    this.updateGame(deltaTime);
    this.drawGame();

    this.animationFrame = requestAnimationFrame(() => this.gameLoop());
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
