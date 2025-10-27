/* audio.js
   Handles music and sound effects for Highway Escape
   Ensure store.js is loaded before this file
*/

const Sound = (function () {
  // Audio paths relative to HTML page (menu.html or index.html)
  const basePath = '../assets/audio/'; // adjust if you move pages folder

  const music = new Audio(basePath + 'bg_music.mp3');
  music.loop = true;
  music.volume = 0.35;

  const coinSound = new Audio(basePath + 'coin.mp3');
  const crashSound = new Audio(basePath + 'crash.mp3');
  const clickSound = new Audio(basePath + 'button_click.mp3');
  const trafficSound = new Audio(basePath + 'traffic.mp3');
  trafficSound.loop = true;
  trafficSound.volume = 0.25;

  let musicEnabled = true;
  let sfxEnabled = true;

  // Play/pause functions
  function playMusic() {
    try {
      if (musicEnabled) music.play().catch(()=>{});
    } catch (e) { console.warn(e); }
  }
  function stopMusic() {
    try { music.pause(); music.currentTime = 0; } catch(e) {}
  }

  function playTraffic() {
    try {
      if (musicEnabled) trafficSound.play().catch(()=>{});
    } catch(e) {}
  }
  function stopTraffic() {
    try { trafficSound.pause(); trafficSound.currentTime = 0; } catch(e) {}
  }

  function toggleMusic(enabled) {
    musicEnabled = !!enabled;
    if (musicEnabled) playMusic(); else stopMusic();
    Store.set('musicEnabled', musicEnabled);
  }
  function toggleSfx(enabled) {
    sfxEnabled = !!enabled;
    Store.set('sfxEnabled', sfxEnabled);
  }

  function playCoin() { if (sfxEnabled) coinSound.play().catch(()=>{}); }
  function playCrash() { if (sfxEnabled) crashSound.play().catch(()=>{}); }
  function playClick() { if (sfxEnabled) clickSound.play().catch(()=>{}); }

  // Load defaults from Store
  if (typeof Store !== 'undefined') {
    musicEnabled = Store.get('musicEnabled', true);
    sfxEnabled = Store.get('sfxEnabled', true);
    if (musicEnabled) playMusic();
  }

  // Mobile-friendly: first tap plays music
  document.addEventListener('click', () => {
    if (musicEnabled) music.play().catch(()=>{});
    if (musicEnabled) trafficSound.play().catch(()=>{});
  }, { once: true });

  return {
    playMusic,
    stopMusic,
    playTraffic,
    stopTraffic,
    toggleMusic,
    toggleSfx,
    playCoin,
    playCrash,
    playClick
  };
})();
