/* ads.js
   Ad controller abstraction. Replace showInterstitial / showRewarded with real SDK calls later.
   This version runs synchronously but exposes callbacks/promises to integrate real ads later.
*/
const Ads = (function () {

  // Internal counters stored in store
  function getGameCount() {
    return Store.get('gameCount', 0);
  }
  function incGameCount() {
    const c = getGameCount() + 1;
    Store.set('gameCount', c);
    return c;
  }

  // Required interstitial check:
  function isInterstitialRequired() {
    const c = getGameCount();
    return (c > 0) && ( (c % CONFIG.adEvery) === 0 );
  }

  // Show interstitial; returns a Promise that resolves when ad completed.
  function showInterstitial() {
    // PRODUCTION: integrate AdMob interstitial here. Return promise that resolves after ad is closed.
    return new Promise((resolve, reject) => {
      // Minimal built-in simulation so game flow doesn't break.
      // Replace the block below with real ad SDK logic.
      console.log('[Ads] Interstitial requested (replace with real SDK).');
      // Simulate small delay
      setTimeout(() => {
        console.log('[Ads] Interstitial finished.');
        resolve();
      }, 900); // 900ms - small pause; safe for UX
    });
  }

  // Show rewarded ad for unlocking/unlocking or doubling coins.
  // Returns Promise that resolves with true if reward granted.
  function showRewarded() {
    return new Promise((resolve, reject) => {
      console.log('[Ads] Rewarded requested (replace with real SDK).');
      // Simulate ad watching
      setTimeout(() => {
        console.log('[Ads] Rewarded finished: reward granted.');
        resolve(true);
      }, 1600); // small simulated ad duration
    });
  }

  return {
    incGameCount,
    isInterstitialRequired,
    showInterstitial,
    showRewarded
  };
})();
