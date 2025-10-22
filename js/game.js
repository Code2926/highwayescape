// ---------------------------
// State
// ---------------------------
const coinsEl = document.getElementById('coinCount');
const scoreEl = document.getElementById('score');
const playerCarEl = document.getElementById('playerCar');
const roadEl = document.getElementById('road');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

let coins = Store.get('coins') ?? 0;
let score = 0;

coinsEl.textContent = coins;

// Get selected car/road from garage
let selectedCar = Store.get('selectedCar') || 'mycar1';
let selectedRoad = Store.get('selectedRoad') || 'road';
playerCarEl.src = `../assets/images/cars/${selectedCar}.png`;
roadEl.style.backgroundImage = `url('../assets/images/roads/${selectedRoad}.png')`;

// ---------------------------
// Player
// ---------------------------
let playerX = roadEl.offsetWidth / 2 - 30; // starting X
const playerY = window.innerHeight - 180;
const roadLeft = roadEl.offsetLeft;
const roadRight = roadLeft + roadEl.offsetWidth - 60;
playerCarEl.style.bottom = '60px';

function updatePlayer() {
  playerCarEl.style.left = `${playerX}px`;
}

// Controls
leftBtn.addEventListener('click', ()=>{ playerX -= 40; if(playerX<roadLeft) playerX=roadLeft; updatePlayer(); });
rightBtn.addEventListener('click', ()=>{ playerX += 40; if(playerX>roadRight) playerX=roadRight; updatePlayer(); });

// ---------------------------
// Obstacles & Coins
// ---------------------------
const obstacles = [];
const coinsArr = [];

function spawnObstacle() {
  const obs = document.createElement('img');
  obs.src = '../assets/images/cars/car1.png'; // example obstacle car
  obs.className = 'obstacle';
  obs.style.left = `${roadLeft + Math.random()*(roadEl.offsetWidth-60)}px`;
  obs.style.top = `-60px`;
  document.getElementById('game-screen').appendChild(obs);
  obstacles.push(obs);
}

function spawnCoin() {
  const coin = document.createElement('img');
  coin.src = '../assets/images/ui/coin.png';
  coin.className = 'coin';
  coin.style.left = `${roadLeft + Math.random()*(roadEl.offsetWidth-40)}px`;
  coin.style.top = `-60px`;
  document.getElementById('game-screen').appendChild(coin);
  coinsArr.push(coin);
}

// ---------------------------
// Collision detection
// ---------------------------
function checkCollision(a,b){
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return !(
    aRect.top > bRect.bottom ||
    aRect.bottom < bRect.top ||
    aRect.left > bRect.right ||
    aRect.right < bRect.left
  );
}

// ---------------------------
// Game loop
// ---------------------------
function gameLoop(){
  // Move obstacles
  obstacles.forEach((o,i)=>{
    let top = parseFloat(o.style.top);
    top += 5;
    o.style.top = top+'px';
    if(top>window.innerHeight){
      o.remove();
      obstacles.splice(i,1);
    } else if(checkCollision(o,playerCarEl)){
      alert('Crashed! Game Over!');
      location.reload();
    }
  });

  // Move coins
  coinsArr.forEach((c,i)=>{
    let top = parseFloat(c.style.top);
    top += 5;
    c.style.top = top+'px';
    if(top>window.innerHeight){
      c.remove();
      coinsArr.splice(i,1);
    } else if(checkCollision(c,playerCarEl)){
      coins += 10;
      Store.set('coins',coins);
      coinsEl.textContent = coins;
      c.remove();
      coinsArr.splice(i,1);
    }
  });

  // Score
  score += 1;
  scoreEl.textContent = score;

  requestAnimationFrame(gameLoop);
}

// Spawn obstacles/coins periodically
setInterval(spawnObstacle, 1500);
setInterval(spawnCoin, 2000);

// Start
updatePlayer();
gameLoop();
