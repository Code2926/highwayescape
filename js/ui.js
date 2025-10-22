const UI = (function () {
  function setupMenuButtons(handlers) {
    document.getElementById('play-btn')?.addEventListener('click', ()=>{ AudioController.playClick(); handlers.onPlay(); });
    document.getElementById('garage-btn')?.addEventListener('click', ()=>{ AudioController.playClick(); handlers.onGarage(); });
    document.getElementById('settings-btn')?.addEventListener('click', ()=>{ AudioController.playClick(); handlers.onSettings(); });
  }

  return { setupMenuButtons };
})();
