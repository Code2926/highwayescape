// =========================================
// SETTINGS PAGE SCRIPT
// =========================================

// --- references
const musicToggle = document.getElementById('musicToggle');
const sfxToggle = document.getElementById('sfxToggle');
const scorePanel = document.getElementById('scorePanel');
const scoreButton = document.getElementById('scoreButton');
const resetBtn = document.getElementById('resetBtn');
const backArrow = document.getElementById('backArrow');

// --- initial state (safe defaults)
let musicEnabled = Store.get('musicEnabled');
let sfxEnabled = Store.get('sfxEnabled');

if (musicEnabled === null || musicEnabled === undefined) musicEnabled = true;
if (sfxEnabled === null || sfxEnabled === undefined) sfxEnabled = true;

// --- apply visual state
musicToggle.classList.toggle('active', musicEnabled);
sfxToggle.classList.toggle('active', sfxEnabled);

// --- MUSIC TOGGLE ---
musicToggle.addEventListener('click', () => {
  musicEnabled = !musicEnabled;
  Store.set('musicEnabled', musicEnabled);

  // update immediately for visual feedback
  musicToggle.classList.toggle('active', musicEnabled);

  try {
    if (musicEnabled) Sound.playMusic();
    else Sound.stopMusic();
  } catch (err) {
    console.warn('Music toggle error:', err);
  }
});

// --- SOUND EFFECTS TOGGLE ---
sfxToggle.addEventListener('click', () => {
  sfxEnabled = !sfxEnabled;
  Store.set('sfxEnabled', sfxEnabled);
  sfxToggle.classList.toggle('active', sfxEnabled);

  try {
    Sound.setSFX(sfxEnabled);
  } catch (err) {
    console.warn('SFX toggle error:', err);
  }
});

// --- RESET PROGRESS ---
resetBtn.addEventListener('click', () => {
  try {
    Store.clear();
    Sound.stopMusic?.();
    location.reload();
  } catch (err) {
    console.warn('Reset error:', err);
  }
});

// --- SCORE PANEL ---
let expanded = false;
const highScore = Store.get('highScore') ?? 0;
scorePanel.textContent = 'High Score: ' + highScore;

scoreButton.addEventListener('click', () => {
  expanded = !expanded;
  scorePanel.style.height = expanded ? '60px' : '0';
  scoreButton.textContent = expanded ? 'Hide High Score' : 'View High Score';
});

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
