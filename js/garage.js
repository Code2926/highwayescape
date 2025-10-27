/* garage.js — corrected: restored comingsoon, no tile text, fixed grid & hud bug */

(function(){
  'use strict';

  /* ---------- Data (restored coming soon entries) ---------- */
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

  /* ---------- Store fallback ---------- */
  const Store = (function(){
    try{ if(window.Store) return window.Store; }catch(e){}
    return {
      get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return localStorage.getItem(k); } },
      set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){ localStorage.setItem(k, v); } }
    };
  }());

  /* ---------- State ---------- */
  let unlocked = Store.get('unlocked') || {};
  let selectedCar = Store.get('selectedCar') || 'mycar1';
  let selectedRoad = Store.get('selectedRoad') || 'road';
  let coins = (Store.get('coins') !== null && Store.get('coins') !== undefined) ? Store.get('coins') : 0;
  let toolkits = (Store.get('toolkits') !== null && Store.get('toolkits') !== undefined) ? Store.get('toolkits') : 0;

  Store.set('coins', coins);
  Store.set('toolkits', toolkits);

  /* ---------- Elements ---------- */
  const carGrid = document.getElementById('carGrid');
  const roadsGrid = document.getElementById('roadsGrid');
  const coinCount = document.getElementById('coinCount');
  const toolkitCount = document.getElementById('toolkitCount');
  const tabButtons = document.querySelectorAll('.tab');
  const goHomeBtn = document.getElementById('goHomeBtn');

  const detailPanel = document.getElementById('detailPanel');
  const detailPreview = document.getElementById('detailPreview');
  const detailTitle = document.getElementById('detailTitle');
  const detailDesc = document.getElementById('detailDesc');
  const detailPrice = document.getElementById('detailPrice');
  const detailPrimary = document.getElementById('detailPrimary');
  const detailAlt = document.getElementById('detailAlt');
  const detailClose = document.getElementById('detailClose');

  const sparksRoot = document.getElementById('sparks');
  const confettiRoot = document.getElementById('confetti');
  const bonusBubble = document.getElementById('bonusBubble');
  const bonusAmount = document.getElementById('bonusAmount');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modalText');
  const cancelAd = document.getElementById('cancelAd');

  let adInterval = null;
  let pendingId = null;
  let pendingType = 'car';

  /* ---------- Helpers ---------- */
  function saveState(){
    Store.set('unlocked', unlocked);
    Store.set('selectedCar', selectedCar);
    Store.set('selectedRoad', selectedRoad);
    Store.set('coins', coins);
    Store.set('toolkits', toolkits);
    pulseCoinCount();
  }

  function pulseCoinCount(){
    coinCount.textContent = coins;
    coinCount.style.transform = 'scale(1.14)';
    coinCount.style.transition = 'transform .36s cubic-bezier(.2,.9,.2,1)';
    setTimeout(()=>{ coinCount.style.transform = 'scale(1)'; }, 360);
  }

  function toast(msg, timeout=1100){
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.top = '12%';
    el.style.transform = 'translateX(-50%)';
    el.style.padding = '8px 14px';
    el.style.borderRadius = '10px';
    el.style.zIndex = 500;
    el.style.background = 'linear-gradient(180deg, rgba(0,230,255,0.06), rgba(0,0,0,0.04))';
    el.style.color = 'var(--neon)';
    el.style.fontWeight = '800';
    document.body.appendChild(el);
    setTimeout(()=> el.style.opacity = '0', timeout - 250);
    setTimeout(()=> { if(el && el.parentNode) el.parentNode.removeChild(el); }, timeout);
  }

  function spawnSparks(x,y,color='#FFD24D',n=10){
    for(let i=0;i<n;i++){
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = (x + (Math.random()-0.5)*40) + 'px';
      s.style.top = (y + (Math.random()-0.5)*40) + 'px';
      s.style.background = color;
      sparksRoot.appendChild(s);
      const dx = (Math.random()-0.5)*160;
      const dy = - (20 + Math.random()*160);
      const dur = 600 + Math.random()*600;
      s.animate([{ transform:'translate(0,0) scale(1)', opacity:1 },{ transform:`translate(${dx}px,${dy}px) scale(.35)`, opacity:0 }], { duration: dur, easing: 'cubic-bezier(.2,.9,.2,1)'});
      setTimeout(()=> { if(s && s.parentNode) s.parentNode.removeChild(s); }, dur + 60);
    }
  }

  function showModal(text){
    modalText.textContent = text;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  }
  function hideModal(){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }

  /* ---------- Confetti ---------- */
  function launchConfetti(){
    const colors = ['#ffd24d','#ff7a59','#00eaff','#8bd48b','#ff65c0'];
    const pieces = 48;
    const root = confettiRoot;
    root.innerHTML = '';
    for(let i=0;i<pieces;i++){
      const p = document.createElement('div');
      p.className = 'piece';
      p.style.left = (5 + Math.random()*90) + '%';
      p.style.top = '-20px';
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      p.style.width = (6 + Math.random()*12) + 'px';
      p.style.height = (8 + Math.random()*14) + 'px';
      p.style.opacity = '1';
      p.style.position = 'absolute';
      p.style.pointerEvents = 'none';
      p.style.transform = `rotate(${Math.random()*360}deg)`;
      root.appendChild(p);

      const dx = (Math.random()-0.5) * 240;
      const dy = 700 + Math.random()*300;
      const rot = (Math.random()>0.5 ? 1 : -1) * (360 + Math.random()*720);
      const duration = 1100 + Math.random()*900;

      p.animate([
        { transform: `translate3d(0,0,0) rotate(${Math.random()*360}deg)`, opacity:1 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`, opacity:0.9 }
      ], { duration: duration, easing: 'cubic-bezier(.2,.8,.2,1)' });

      setTimeout(()=> { if(p && p.parentNode) p.parentNode.removeChild(p); }, duration + 160);
    }
  }

  /* ---------- Tile creation (NO text on tiles) ---------- */
  function makeTile(item, type){
    const el = document.createElement('div');
    el.className = 'tile' + (unlocked[item.id] ? '' : ' locked') + ((selectedCar===item.id && type==='car') || (selectedRoad===item.id && type==='road') ? ' selected' : '');
    el.setAttribute('data-id', item.id);
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');

    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.name;
    el.appendChild(img);

    // ONLY a small lock overlay if locked
    if(!unlocked[item.id]){
      const ov = document.createElement('div');
      ov.className = 'overlay';
      ov.innerHTML = '<img class="lock-icon" src="../assets/images/ui/lock.png" alt="locked">';
      el.appendChild(ov);
    }

    // click (open bottom detail where price/ads are shown)
    el.addEventListener('click', (e)=>{
      pendingId = item.id; pendingType = type;
      openDetail(item, type);
      if(!unlocked[item.id]) spawnSparks(e.clientX, e.clientY);
    });

    el.addEventListener('keydown', (ev)=> { if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.click(); } });

    return el;
  }

  /* ---------- Render ---------- */
  function renderCars(){
    carGrid.innerHTML = '';
    cars.forEach(c => carGrid.appendChild(makeTile(c,'car')));
  }
  function renderRoads(){
    roadsGrid.innerHTML = '';
    roads.forEach(r => roadsGrid.appendChild(makeTile(r,'road')));
  }

  /* ---------- Detail panel ---------- */
  function openDetail(item, type){
    detailPreview.innerHTML = '';
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.name;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    detailPreview.appendChild(img);

    // 🟢 Coming Soon items — show only title + image + Close button
    if (item.coming) {
      detailTitle.textContent = 'Coming Soon';
      detailDesc.textContent = '';
      detailPrice.textContent = '';          // <-- clear text
      detailPrice.style.display = 'none';    // <-- hide price element
      detailPrimary.style.display = 'none';
      detailAlt.style.display = 'none';
      detailClose.style.display = 'inline-block';
      detailPanel.classList.add('show');
      detailPanel.setAttribute('aria-hidden','false');
      return;
    }

    // 🟢 Normal items
    detailTitle.textContent = item.name;
    detailDesc.textContent = type === 'car'
      ? 'Swap your vehicle (cosmetic).'
      : 'Change the road visuals.';
    detailPrice.textContent = item.cost > 0 ? item.cost : 'FREE';

    if (unlocked[item.id]) {
      detailPrimary.textContent =
        ((type==='car' && selectedCar===item.id) ||
         (type==='road' && selectedRoad===item.id))
          ? 'Selected'
          : 'Select';
      detailAlt.style.display = 'none';
    } else {
      detailPrimary.textContent = item.cost > 0 ? ('Buy ' + item.cost) : 'Get';
      if (item.ads > 0) {
        detailAlt.style.display = 'inline-block';
        detailAlt.textContent = 'Watch ' + item.ads + 's';
      } else {
        detailAlt.style.display = 'none';
      }
    }

    detailPrimary.style.display = 'inline-block';
    detailClose.style.display = 'inline-block';
    detailPanel.classList.add('show');
    detailPanel.setAttribute('aria-hidden','false');
  }


  function closeDetail(){
    detailPanel.classList.remove('show');
    detailPanel.setAttribute('aria-hidden','true');
  }

  detailPrimary.addEventListener('click', ()=>{
    const item = (pendingType === 'car') ? cars.find(c=>c.id===pendingId) : roads.find(r=>r.id===pendingId);
    if(!item) return;
    if(unlocked[item.id]){
      if(pendingType === 'car'){ selectedCar = item.id; toast('Car selected!'); }
      else { selectedRoad = item.id; toast('Road selected!'); }
      saveState(); renderCars(); renderRoads(); closeDetail();
      spawnSparks(window.innerWidth/2, window.innerHeight/2, '#ffd24d', 16);
      launchCelebration();
    } else {
      tryBuy(item, pendingType);
    }
  });

  detailAlt.addEventListener('click', ()=>{
    const item = (pendingType === 'car') ? cars.find(c=>c.id===pendingId) : roads.find(r=>r.id===pendingId);
    if(!item) return;
    tryAdUnlock(item.id, pendingType, item.ads);
  });

  detailClose.addEventListener('click', closeDetail);

  /* ---------- Buy & Ads ---------- */
  function tryBuy(item, type){
    if(coins >= item.cost){
      coins -= item.cost;
      unlocked[item.id] = true;
      if(type === 'car') selectedCar = item.id; else selectedRoad = item.id;
      saveState(); renderCars(); renderRoads(); closeDetail();
      toast(item.name + ' unlocked!');
      spawnSparks(window.innerWidth/2, window.innerHeight/2, '#ffd24d', 20);
      launchCelebration();
      showBonus(Math.max(50, Math.floor(item.cost/4)));
    } else {
      showModal('Not enough coins — play to earn more!');
      setTimeout(hideModal, 1400);
    }
  }

  function tryAdUnlock(id, type, ads){
    if(!navigator.onLine){ showModal('Offline — ads unavailable.'); setTimeout(hideModal, 1200); return; }
    simulateAdUnlock(id, type, ads);
  }

  function simulateAdUnlock(id, type, ads){
    if(ads <= 0) return;
    let t = ads;
    showModal('Watching Ad... ' + t + 's');
    adInterval = setInterval(()=> {
      t--;
      modalText.textContent = 'Watching Ad... ' + t + 's';
      if(t <= 0){
        clearInterval(adInterval);
        hideModal();
        unlocked[id] = true;
        if(type==='car') selectedCar = id; else selectedRoad = id;
        saveState();
        renderCars(); renderRoads();
        closeDetail();
        toast('Unlocked!');
        spawnSparks(window.innerWidth/2, window.innerHeight/2, '#ff7a59', 20);
        launchCelebration();
        showBonus(Math.max(80, Math.floor(ads * 8)));
      }
    }, 1000);
  }

  cancelAd.addEventListener('click', ()=>{
    clearInterval(adInterval);
    hideModal();
    toast('Ad cancelled');
  });

  /* ---------- Tabs ---------- */
  function switchTab(name){
    tabButtons.forEach(b => { b.classList.toggle('active', b.dataset.tab === name); b.setAttribute('aria-selected', b.dataset.tab === name ? 'true' : 'false'); });
    if(name === 'cars'){ document.getElementById('carsView').style.display = ''; document.getElementById('roadsView').style.display = 'none'; renderCars(); }
    else { document.getElementById('carsView').style.display = 'none'; document.getElementById('roadsView').style.display = ''; renderRoads(); }
  }
  tabButtons.forEach(btn => btn.addEventListener('click', ()=> switchTab(btn.dataset.tab)));

  /* ---------- Keyboard nav ---------- */
  function gridNav(grid){
    grid.addEventListener('keydown', (e) => {
      const tiles = Array.from(grid.querySelectorAll('.tile'));
      if(!tiles.length) return;
      const focused = document.activeElement;
      const idx = tiles.indexOf(focused);
      if(idx < 0) return;
      const cols = 3; // explicit 3-column logic restored
      if(e.key === 'ArrowLeft'){ e.preventDefault(); tiles[Math.max(0, idx-1)].focus(); }
      if(e.key === 'ArrowRight'){ e.preventDefault(); tiles[Math.min(tiles.length-1, idx+1)].focus(); }
      if(e.key === 'ArrowUp'){ e.preventDefault(); tiles[Math.max(0, idx-cols)].focus(); }
      if(e.key === 'ArrowDown'){ e.preventDefault(); tiles[Math.min(tiles.length-1, idx+cols)].focus(); }
      if(e.key === 'Escape'){ closeDetail(); }
    });
  }

  /* ---------- Init ---------- */
  (function init(){
    // default unlock free items
    cars.forEach(c => { if(c.cost === 0) unlocked[c.id] = true; });
    roads.forEach(r => { if(r.cost === 0) unlocked[r.id] = true; });

    coinCount.textContent = coins;
    toolkitCount.textContent = toolkits;

    renderCars();
    renderRoads();

    goHomeBtn.addEventListener('click', ()=> window.location.href = 'menu.html');

    gridNav(carGrid);
    gridNav(roadsGrid);

    setInterval(()=> { if(Math.random() < 0.18) showBonus(50 + Math.floor(Math.random()*150)); }, 10000);

    initGlows();
  })();

  /* ---------- Glows ---------- */
  function initGlows(){
    const container = document.getElementById('bgParticles');
    if(!container) return;
    for(let i=0;i<6;i++){
      const el = document.createElement('div');
      el.className = 'bg-glow';
      const size = 200 + Math.floor(Math.random()*260);
      el.style.position = 'absolute';
      el.style.width = size + 'px';
      el.style.height = Math.floor(size*0.45) + 'px';
      el.style.left = Math.floor(Math.random()*80) + '%';
      el.style.top = Math.floor(Math.random()*55) + '%';
      el.style.background = i%2===0 ? 'radial-gradient(closest-side, rgba(0,230,255,0.12), transparent)' : 'radial-gradient(closest-side, rgba(255,120,140,0.06), transparent)';
      el.style.filter = 'blur(40px)';
      el.style.pointerEvents = 'none';
      el.style.transition = 'transform 18s linear';
      container.appendChild(el);
      (function(node, idx){
        const dir = (idx%2===0)?1:-1;
        setInterval(()=> {
          node.style.transform = `translateX(${dir * (10 + Math.random()*40)}px)`;
        }, 4000 + Math.random()*7000);
      }(el, i));
    }
  }

  /* ---------- Celebration ---------- */
  function launchCelebration(){
    try{ launchConfetti(); }catch(e){}
  }
  function launchConfetti(){
    const colors = ['#ffd24d','#ff7a59','#00eaff','#8bd48b','#ff65c0'];
    const pieces = 48;
    const root = confettiRoot;
    root.innerHTML = '';
    for(let i=0;i<pieces;i++){
      const p = document.createElement('div');
      p.className = 'piece';
      p.style.left = (5 + Math.random()*90) + '%';
      p.style.top = '-20px';
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      p.style.width = (6 + Math.random()*12) + 'px';
      p.style.height = (8 + Math.random()*14) + 'px';
      p.style.opacity = '1';
      p.style.position = 'absolute';
      p.style.pointerEvents = 'none';
      p.style.transform = `rotate(${Math.random()*360}deg)`;
      root.appendChild(p);

      const dx = (Math.random()-0.5) * 240;
      const dy = 700 + Math.random()*300;
      const rot = (Math.random()>0.5 ? 1 : -1) * (360 + Math.random()*720);
      const duration = 1100 + Math.random()*900;

      p.animate([
        { transform: `translate3d(0,0,0) rotate(${Math.random()*360}deg)`, opacity:1 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`, opacity:0.9 }
      ], { duration: duration, easing: 'cubic-bezier(.2,.8,.2,1)' });

      setTimeout(()=> { if(p && p.parentNode) p.parentNode.removeChild(p); }, duration + 160);
    }
  }

})();
