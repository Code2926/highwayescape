document.addEventListener('DOMContentLoaded', () => {
  const musicToggle = document.getElementById('musicToggle');
  const sfxToggle = document.getElementById('sfxToggle');
  const scorePanel = document.getElementById('scorePanel');
  const scoreButton = document.getElementById('scoreButton');
  const resetBtn = document.getElementById('resetBtn');
  const networkStatus = document.getElementById('networkStatus');
  const supportBtn = document.getElementById('supportBtn');
  const legalBtn = document.getElementById('legalBtn');
  const mainMenuBtn = document.getElementById('mainMenuBtn');

  let musicEnabled = Store.get('musicEnabled') ?? true;
  let sfxEnabled = Store.get('sfxEnabled') ?? true;

  musicToggle.classList.toggle('active', musicEnabled);
  sfxToggle.classList.toggle('active', sfxEnabled);

  // Music
  musicToggle.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    Store.set('musicEnabled', musicEnabled);
    musicToggle.classList.toggle('active', musicEnabled);
    if (musicEnabled) Sound.playMusic(); else Sound.stopMusic();
  });

  // Sound Effects
  sfxToggle.addEventListener('click', () => {
    sfxEnabled = !sfxEnabled;
    Store.set('sfxEnabled', sfxEnabled);
    sfxToggle.classList.toggle('active', sfxEnabled);
    Sound.setSFX?.(sfxEnabled);
  });

  // Reset Progress
  resetBtn.addEventListener('click', () => {
    if (confirm('Reset all progress?')) {
      Store.clear();
      Sound.stopMusic?.();
      location.reload();
    }
  });

  // High Score
  let expanded = false;
  const highScore = Store.get('highScore') ?? 0;
  scorePanel.textContent = 'High Score: ' + highScore;
  scoreButton.addEventListener('click', () => {
    expanded = !expanded;
    scorePanel.style.height = expanded ? '40px' : '0';
    scoreButton.textContent = expanded ? 'Hide High Score' : 'View High Score';
  });

  // Network Status
  function updateNetworkStatus() {
    networkStatus.textContent = navigator.onLine ? 'Online 🟢' : 'Offline 🔴';
  }
  updateNetworkStatus();
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);

  // Navigation Buttons
  supportBtn.addEventListener('click', () => window.location.href = 'support.html');
  legalBtn.addEventListener('click', () => window.location.href = 'legal.html');
  mainMenuBtn.addEventListener('click', () => window.location.href = 'menu.html');

  // Auto-play music if enabled
  if (musicEnabled) Sound.playMusic();
});
