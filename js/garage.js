/* ---------------------------
Garage Data
---------------------------- */
const cars = [
  { id:'mycar1', name:'Car 1', cost:0, img:'../assets/images/cars/mycar1.png', ads:0 },
  { id:'mycar2', name:'Car 2', cost:400, img:'../assets/images/cars/mycar2.png', ads:2 },
  { id:'mycar3', name:'Car 3', cost:700, img:'../assets/images/cars/mycar3.png', ads:3 },
  { id:'mycar4', name:'Car 4', cost:1000, img:'../assets/images/cars/mycar4.png', ads:4 },
  { id:'mycar5', name:'Car 5', cost:1300, img:'../assets/images/cars/mycar5.png', ads:5 },
  { id:'mycar6', name:'Car 6', cost:1600, img:'../assets/images/cars/mycar6.png', ads:6 },
  { id:'mycar7', name:'Car 7', cost:1900, img:'../assets/images/cars/mycar7.png', ads:7 },
  { id:'mycar8', name:'Car 8', cost:2200, img:'../assets/images/cars/mycar8.png', ads:8 },
  { id:'comingsoon', name:'Coming Soon', cost:0, img:'../assets/images/cars/coming_soon.webp', ads:0, coming:true }
];

const roads = [
  { id:'road', name:'Simple', cost:0, img:'../assets/images/roads/road.png', ads:0 },
  { id:'road_city', name:'City', cost:600, img:'../assets/images/roads/road_city.png', ads:5 },
  { id:'road_desert', name:'Desert', cost:800, img:'../assets/images/roads/road_desert.png', ads:6 },
  { id:'road_forest', name:'Forest', cost:1000, img:'../assets/images/roads/road_forest.png', ads:7 },
  { id:'road_neon', name:'Neon', cost:1300, img:'../assets/images/roads/road_mountain.png', ads:8 },
  { id:'road_snow', name:'Snow', cost:1600, img:'../assets/images/roads/road_snow.png', ads:10 },
  { id:'road_mountain', name:'Mountain', cost:1800, img:'../assets/images/roads/road_neon.png', ads:12 },
  { id:'road_night', name:'Night', cost:2000, img:'../assets/images/roads/road_night.png', ads:14 },
  { id:'comingsoon_road', name:'Coming Soon', cost:0, img:'../assets/images/roads/coming_soon.webp', ads:0, coming:true }
];

/* ---------------------------
State
---------------------------- */
let unlocked = Store.get('unlocked') || {};
let selectedCar = Store.get('selectedCar') || 'mycar1';
let selectedRoad = Store.get('selectedRoad') || 'road';
let coins = Store.get('coins') ?? 0;
Store.set('coins', coins);

/* ---------------------------
Elements
---------------------------- */
const carGrid = document.getElementById('carGrid');
const roadsGrid = document.getElementById('roadsGrid');
const coinCount = document.getElementById('coinCount');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const cancelAd = document.getElementById('cancelAd');

coinCount.textContent = coins;

/* ---------------------------
Helpers
---------------------------- */
function saveState(){
  Store.set('unlocked', unlocked);
  Store.set('selectedCar', selectedCar);
  Store.set('selectedRoad', selectedRoad);
  Store.set('coins', coins);
}

function showModal(text){
  modalText.textContent = text;
  modal.style.display = 'flex';
}
function hideModal(){
  modal.style.display = 'none';
  clearInterval(adInterval);
}
let adInterval = null;

function isOnline(){
  return navigator.onLine;
}

/* ---------------------------
Render Cars
---------------------------- */
function renderCars(){
  carGrid.innerHTML = '';
  cars.forEach(car=>{
    const el = document.createElement('div');
    el.className = 'car' + (unlocked[car.id] ? '' : ' locked') + (selectedCar===car.id ? ' selected':'');
    const img = document.createElement('img');
    img.src = car.img;
    el.appendChild(img);

    if(car.coming){
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      el.appendChild(overlay);
      el.style.pointerEvents = 'none';
    }
    else if(!unlocked[car.id]){
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      const lock = document.createElement('img');
      lock.src = '../assets/images/ui/lock.png';
      lock.style.width = '40px';
      lock.style.opacity = '0.85';
      overlay.appendChild(lock);
      el.appendChild(overlay);
      overlay.style.pointerEvents = 'none';
    }

    el.addEventListener('click',()=>selectCar(car.id));
    carGrid.appendChild(el);
  });
  updateCarUI();
}

/* ---------------------------
Render Roads
---------------------------- */
function renderRoads(){
  roadsGrid.innerHTML = '';
  roads.forEach(road=>{
    const el = document.createElement('div');
    el.className = 'road' + (unlocked[road.id] ? '' : ' locked') + (selectedRoad===road.id ? ' selected':'');
    const img = document.createElement('img');
    img.src = road.img;
    el.appendChild(img);

    if(road.coming){
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      el.appendChild(overlay);
      el.style.pointerEvents = 'none';
    }
    else if(!unlocked[road.id]){
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      const lock = document.createElement('img');
      lock.src = '../assets/images/ui/lock.png';
      lock.style.width = '40px';
      lock.style.opacity = '0.85';
      overlay.appendChild(lock);
      el.appendChild(overlay);
      overlay.style.pointerEvents = 'none';
    }

    el.addEventListener('click',()=>selectRoad(road.id));
    roadsGrid.appendChild(el);
  });
  updateRoadUI();
}

/* ---------------------------
Selection
---------------------------- */
let pendingCar = selectedCar;
let pendingRoad = selectedRoad;

function selectCar(id){
  const car = cars.find(c=>c.id===id);
  if(!car || car.coming) return;
  pendingCar = id;
  updateCarUI();
}

function selectRoad(id){
  const road = roads.find(r=>r.id===id);
  if(!road || road.coming) return;
  pendingRoad = id;
  updateRoadUI();
}

/* ---------------------------
UI Controls (Cars)
---------------------------- */
const actionCarBtn = document.getElementById('actionBtn');
const altCarBtn = document.getElementById('altBtn');

function updateCarUI(){
  const car = cars.find(c=>c.id===pendingCar);
  if(!car) return;
  if(unlocked[car.id]){
    actionCarBtn.textContent = selectedCar===car.id ? 'Selected' : 'Select Car';
    altCarBtn.style.display='none';
  } else {
    actionCarBtn.textContent = `Buy for ${car.cost}`;
    altCarBtn.style.display='block';
    altCarBtn.textContent = `Watch ${car.ads} Ads`;
  }
}

actionCarBtn.addEventListener('click',()=>{
  const car = cars.find(c=>c.id===pendingCar);
  if(!car || car.coming) return;
  if(unlocked[car.id]){
    selectedCar = car.id;
  } else {
    tryBuy(car,'car');
  }
  saveState();
  renderCars();
});

altCarBtn.addEventListener('click',()=>{
  const car = cars.find(c=>c.id===pendingCar);
  if(!car || car.coming) return;
  tryAdUnlock(car.id,'car',car.ads);
});

/* ---------------------------
UI Controls (Roads)
---------------------------- */
// Create separate buttons dynamically (under roads view)
const roadsView = document.getElementById('roadsView');
const roadActionContainer = document.createElement('div');
roadActionContainer.className = 'action';
roadActionContainer.innerHTML = `
  <div id="roadActionBtn" class="big-btn">Select Road</div>
  <div id="roadAltBtn" class="big-btn secondary">Unlock</div>
`;
roadsView.appendChild(roadActionContainer);

const roadActionBtn = document.getElementById('roadActionBtn');
const roadAltBtn = document.getElementById('roadAltBtn');

function updateRoadUI(){
  const road = roads.find(r=>r.id===pendingRoad);
  if(!road) return;
  if(unlocked[road.id]){
    roadActionBtn.textContent = selectedRoad===road.id ? 'Selected' : 'Select Road';
    roadAltBtn.style.display='none';
  } else {
    roadActionBtn.textContent = `Buy for ${road.cost}`;
    roadAltBtn.style.display='block';
    roadAltBtn.textContent = `Watch ${road.ads} Ads`;
  }
}

roadActionBtn.addEventListener('click',()=>{
  const road = roads.find(r=>r.id===pendingRoad);
  if(!road || road.coming) return;
  if(unlocked[road.id]){
    selectedRoad = road.id;
  } else {
    tryBuy(road,'road');
  }
  saveState();
  renderRoads();
});

roadAltBtn.addEventListener('click',()=>{
  const road = roads.find(r=>r.id===pendingRoad);
  if(!road || road.coming) return;
  tryAdUnlock(road.id,'road',road.ads);
});

/* ---------------------------
Buying / Ads
---------------------------- */
function tryBuy(item,type){
  if(coins >= item.cost){
    coins -= item.cost;
    unlocked[item.id] = true;
    if(type==='car') selectedCar=item.id; else selectedRoad=item.id;
    coinCount.textContent = coins;
    saveState();
  } else {
    showModal("Not enough coins to buy!");
    setTimeout(hideModal,1500);
  }
}

function tryAdUnlock(id,type,ads){
  if(!isOnline()){
    showModal("No ads available (offline).");
    setTimeout(hideModal,1500);
    return;
  }
  simulateAdUnlock(id,type,ads);
}

function simulateAdUnlock(id,type,ads){
  if(ads<=0) return;
  let t=ads;
  showModal(`Watching ad to unlock ${type}... ${t}s`);
  adInterval=setInterval(()=>{
    t--;
    modalText.textContent=`Watching ad to unlock ${type}... ${t}s`;
    if(t<=0){
      clearInterval(adInterval);
      hideModal();
      unlocked[id]=true;
      if(type==='car') selectedCar=id; else selectedRoad=id;
      saveState();
      renderCars(); renderRoads();
    }
  },1000);
}
cancelAd.addEventListener('click',hideModal);

/* ---------------------------
Tabs
---------------------------- */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const which=tab.dataset.tab;
    document.getElementById('carsView').style.display=which==='cars'?'':'none';
    document.getElementById('roadsView').style.display=which==='roads'?'':'none';
    which==='roads'?renderRoads():renderCars();
  });
});

/* ---------------------------
Init
---------------------------- */
(function init(){
  cars.forEach(c=>{ if(c.cost===0) unlocked[c.id]=true; });
  roads.forEach(r=>{ if(r.cost===0) unlocked[r.id]=true; });
  saveState();
  renderCars();
  renderRoads();
})();

// --- BACK ARROW ---
backArrow.addEventListener('click', () => {
  try {
    Sound.playClick?.();
  } catch (err) {
    console.warn('Click sound error:', err);
  }
  window.location.href = 'menu.html';
});

// --- AUTO-PLAY MUSIC (if enabled) ---
try {
  if (musicEnabled) Sound.playMusic();
} catch (err) {
  console.warn('Auto-play error:', err);
}
