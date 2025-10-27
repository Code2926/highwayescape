// ===================================================
// game.js — coins + toolkit + crash explosion + revive overlay (safe restart)
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return console.error('Canvas not found');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  // ---------- Helpers ----------
  function safeGetLS(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === 'string' ? parsed.replace(/^"+|"+$/g, '') : parsed;
      } catch { return String(raw).replace(/^"+|"+$/g, ''); }
    } catch { return fallback; }
  }

  // ---------- Player / Road ----------
  const playerImg = new Image();
  playerImg.src = `../assets/images/cars/${safeGetLS('selectedCar', 'mycar1')}.png`;
  const roadImg = new Image();
  roadImg.src = `../assets/images/roads/${safeGetLS('selectedRoad', 'road')}.png`;
  const explosionImg = new Image();
  explosionImg.src = '../assets/images/ui/explosion.png';
  const coinImg = new Image();
  coinImg.src = '../assets/images/ui/coin.png';
  const toolkitImg = new Image();
  toolkitImg.src = '../assets/images/ui/toolkit.png';

  const player = { width: 70, height: 130, x: 0, y: h - 160 };

  // ---------- Obstacles ----------
  const obstacleImgs = [];
  for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `../assets/images/cars/mycar${i}.png`;
    obstacleImgs.push(img);
  }

  let obstacles = [], coinsArray = [], toolkitsArray = [];
  let coins = parseInt(localStorage.getItem('coins') || '0', 10);
  let toolkits = parseInt(localStorage.getItem('toolkits') || '0', 10);
  let crashed = false, paused = false;
  let lanes = [];

  const crashOverlay = document.getElementById('crashOverlay');
  const coinCountEl = document.getElementById('coinCount');
  const toolkitCountEl = document.getElementById('toolkitCount');

  // ---------- Lanes ----------
  function recalcLanes() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    lanes = [w * 0.25, w * 0.5, w * 0.75];
    player.x = lanes[1] - player.width / 2;
    player.y = h - 160;
  }
  recalcLanes();

  // ---------- UI ----------
  const pauseIcon = document.getElementById('pauseIcon');
  const pauseMenu = document.getElementById('pauseMenu');
  const resumeBtn = document.getElementById('resumeBtn');
  const menuBtn = document.getElementById('menuBtn');
  const restartBtn = document.getElementById('restartBtn');
  const mainMenuBtn = document.getElementById('mainMenuBtn');
  const safeAdd = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

  safeAdd(pauseIcon, 'click', () => { paused = true; pauseMenu.style.display = 'flex'; });
  safeAdd(resumeBtn, 'click', () => { paused = false; pauseMenu.style.display = 'none'; });
  safeAdd(menuBtn, 'click', () => { window.location.href = 'menu.html'; });
  safeAdd(restartBtn, 'click', () => resetGame());
  safeAdd(mainMenuBtn, 'click', () => { window.location.href = 'menu.html'; });

  // ---------- Controls ----------
  safeAdd(canvas, 'touchmove', e => {
    if (paused) return;
    const tx = e.touches[0].clientX;
    const nearest = lanes.reduce((p, c) => Math.abs(c - tx) < Math.abs(p - tx) ? c : p, lanes[0]);
    player.x = nearest - player.width / 2;
  });
  document.addEventListener('keydown', e => {
    if (paused) return;
    const centerX = player.x + player.width / 2;
    const idx = lanes.findIndex(l => Math.abs(l - centerX) < 6);
    if (e.key === 'ArrowLeft' && idx > 0) player.x = lanes[idx - 1] - player.width / 2;
    if (e.key === 'ArrowRight' && idx < lanes.length - 1) player.x = lanes[idx + 1] - player.width / 2;
  });

  // ---------- Spawning ----------
  let obstacleTimer = 0, spawnInterval = 90;
  let coinTimer = 0, toolkitTimer = 0, toolkitInterval = 1500;

  function spawnObstacle() {
    const lane = lanes[Math.floor(Math.random() * lanes.length)] - 35;
    obstacles.push({ x: lane, y: -130, width: 70, height: 130, img: obstacleImgs[Math.floor(Math.random() * obstacleImgs.length)] });
  }
  function spawnCoin() {
    const lane = lanes[Math.floor(Math.random() * lanes.length)] - 14;
    coinsArray.push({ x: lane, y: -28, size: 28 });
  }
  function spawnToolkit() {
    if (Math.random() < 0.4) {
      const lane = lanes[Math.floor(Math.random() * lanes.length)] - 17;
      toolkitsArray.push({ x: lane, y: -34, size: 34 });
    }
  }

  // ---------- Update ----------
  let roadY = 0, scrollSpeed = 8;

  function update() {
    if (paused) return;
    roadY += scrollSpeed;
    if (roadY >= h) roadY = 0;

    obstacles.forEach(o => o.y += scrollSpeed);
    coinsArray.forEach(c => c.y += scrollSpeed);
    toolkitsArray.forEach(t => t.y += scrollSpeed);
    obstacles = obstacles.filter(o => o.y < h + 200);
    coinsArray = coinsArray.filter(c => c.y < h + 100);
    toolkitsArray = toolkitsArray.filter(t => t.y < h + 100);

    // ===== Collisions =====
    obstacles.forEach(o => {
      if (player.x < o.x + o.width && player.x + player.width > o.x &&
          player.y < o.y + o.height && player.y + player.height > o.y && !crashed) {
        crashed = true;
        paused = true;
        showExplosion();
        if (!navigator.onLine && toolkits <= 0) {
          setTimeout(() => crashOverlay.style.display = 'flex', 800);
        } else {
          setTimeout(() => showReviveOverlay(o), 800); // pass crashed obstacle
        }
      }
    });

    // ===== Coins =====
    coinsArray.forEach((c, i) => {
      if (player.x < c.x + c.size && player.x + player.width > c.x &&
          player.y < c.y + c.size && player.y + player.height > c.y) {
        coins++;
        coinCountEl.textContent = coins;
        localStorage.setItem('coins', coins);
        coinsArray.splice(i, 1);
      }
    });

    // ===== Toolkits =====
    toolkitsArray.forEach((t, i) => {
      if (player.x < t.x + t.size && player.x + player.width > t.x &&
          player.y < t.y + t.size && player.y + player.height > t.y) {
        toolkits++;
        toolkitCountEl.textContent = toolkits;
        localStorage.setItem('toolkits', toolkits);
        toolkitsArray.splice(i, 1);
      }
    });

    // Spawning timers
    if (++obstacleTimer >= spawnInterval) { spawnObstacle(); obstacleTimer = 0; }
    if (++coinTimer >= 120) { spawnCoin(); coinTimer = 0; }
    if (++toolkitTimer >= toolkitInterval) {
      spawnToolkit();
      toolkitTimer = 0;
      toolkitInterval = 1500 + Math.random() * 1000;
    }
  }

  // ---------- Explosion ----------
  function showExplosion() {
    const exp = document.createElement('img');
    exp.src = explosionImg.src;
    Object.assign(exp.style, {
      position: 'absolute',
      left: `${player.x - 100}px`,
      top: `${player.y - 150}px`,
      width: '300px', height: '300px',
      zIndex: '90', opacity: '1',
      transition: 'opacity 1s ease',
      pointerEvents: 'none'
    });
    document.getElementById('game-wrapper').appendChild(exp);
    setTimeout(() => exp.style.opacity = '0', 400);
    setTimeout(() => exp.remove(), 1200);
  }

  // ---------- Revive Overlay ----------
  function showReviveOverlay(crashedObstacle) {
    const wrapper = document.getElementById('game-wrapper');
    const overlay = document.createElement('div');
    overlay.className = 'pause-menu show';
    overlay.style.zIndex = '100';

    overlay.innerHTML = `
      <div class="pause-box">
        <h2>Continue?</h2>
        <div class="ring-loader"></div>
        <p id="reviveMsg">You can resume in (10s)</p>
        <div id="reviveBtns">
          ${toolkits > 0 ? '<button id="useToolkitBtn" class="big-btn">Use Toolkit</button>' : ''}
          ${navigator.onLine ? '<button id="watchAdBtn" class="big-btn">Watch Ad</button>' : '<p style="color:#ffbcbc;">Offline - Ads Unavailable</p>'}
        </div>
      </div>
    `;
    wrapper.appendChild(overlay);

    const loader = overlay.querySelector('.ring-loader');
    Object.assign(loader.style, {
      margin: '10px auto',
      width: '60px', height: '60px',
      border: '6px solid rgba(0,234,255,0.15)',
      borderTop: '6px solid var(--neon)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    });
    const style = document.createElement('style');
    style.textContent = `@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`;
    document.head.appendChild(style);

    let countdown = 10;
    const msg = overlay.querySelector('#reviveMsg');
    const timer = setInterval(() => {
      countdown--;
      msg.textContent = `You can resume (${countdown}s)`;
      if (countdown <= 0) {
        clearInterval(timer);
        overlay.remove();
        crashOverlay.style.display = 'flex';
      }
    }, 1000);

    // Helper: clear crashed car + nearby
    const clearNearbyObstacles = () => {
      obstacles = obstacles.filter(o =>
        Math.abs(o.x - player.x) > 100 || Math.abs(o.y - player.y) > 200
      );
    };

    const toolkitBtn = overlay.querySelector('#useToolkitBtn');
    if (toolkitBtn) {
      toolkitBtn.onclick = () => {
        if (toolkits > 0) {
          toolkits--;
          localStorage.setItem('toolkits', toolkits);
          toolkitCountEl.textContent = toolkits;
          clearInterval(timer);
          overlay.remove();
          clearNearbyObstacles();
          crashed = false;
          paused = false;
        } else msg.textContent = 'No toolkits available!';
      };
    }

    const adBtn = overlay.querySelector('#watchAdBtn');
    if (adBtn) {
      adBtn.onclick = () => {
        msg.textContent = 'Watching ad...';
        setTimeout(() => {
          msg.textContent = 'Ad completed! Resuming...';
          clearInterval(timer);
          setTimeout(() => {
            overlay.remove();
            clearNearbyObstacles();
            crashed = false;
            paused = false;
          }, 800);
        }, 4000);
      };
    }
  }

  // ---------- Draw ----------
  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(roadImg, 0, roadY - h, w, h);
    ctx.drawImage(roadImg, 0, roadY, w, h);
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    obstacles.forEach(o => ctx.drawImage(o.img, o.x, o.y, o.width, o.height));
    coinsArray.forEach(c => ctx.drawImage(coinImg, c.x, c.y, c.size, c.size));
    toolkitsArray.forEach(t => ctx.drawImage(toolkitImg, t.x, t.y, t.size, t.size));
  }

  // ---------- Loop ----------
  function loop() { update(); draw(); requestAnimationFrame(loop); }

  // ---------- Reset ----------
  function resetGame() {
    obstacles = []; coinsArray = []; toolkitsArray = [];
    crashed = false; paused = false;
    crashOverlay.style.display = 'none';
  }

  // ---------- Preload ----------
  const essentials = [playerImg, roadImg, coinImg, toolkitImg, explosionImg, ...obstacleImgs];
  let loaded = 0;
  const startIfReady = () => { loaded++; if (loaded === essentials.length) startGame(); };
  essentials.forEach(img => { img.onload = startIfReady; img.onerror = startIfReady; });
  setTimeout(() => { if (loaded < essentials.length) startGame(); }, 3000);

  function startGame() {
    coinCountEl.textContent = coins;
    toolkitCountEl.textContent = toolkits;
    requestAnimationFrame(loop);
  }
});
