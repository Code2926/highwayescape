(function () {
  const roadEl = document.getElementById('road');
  const carWrapper = document.getElementById('car');
  const carImg = carWrapper?.querySelector('img');

  let score = 0, coins = 0, running = false, createArr = [], lineArr = [], coinArr = [];

  function applySelectedCar() {
    const sel = Store.get('selectedCar', CONFIG.defaultCars[0]);
    if(carImg) carImg.src = `assets/images/cars/${sel}.png`;
  }

  function startGame() {
    if(running) return;
    running = true;
    score = 0; coins = Store.get('coins',0);
    createArr.forEach(e=>e.remove()); lineArr.forEach(e=>e.remove()); coinArr.forEach(e=>e.remove());
    carWrapper.style.left = Math.floor((roadEl.offsetWidth - carWrapper.offsetWidth)/2)+'px';
    AudioController.playMusic();
    AudioController.playTraffic();
  }

  function endGame() {
    running = false;
    AudioController.stopTraffic();
    AudioController.playCrash();
  }

  window.HE_Game = { startGame, endGame };
})();
