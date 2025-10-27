// Store - tiny wrapper for localStorage with JSON and basic TTL support
const Store = (function(){
  const LS = window.localStorage;
  function getRaw(key){ return LS.getItem(key); }
  function setRaw(key,val){ LS.setItem(key,val); }
  function remove(key){ LS.removeItem(key); }
  return {
    get(key, fallback = null){
      try {
        const v = getRaw(key);
        if(v === null) return fallback;
        return JSON.parse(v);
      } catch(e){ console.warn('Store.get parse failed', e); return fallback; }
    },
    set(key, value){
      try { setRaw(key, JSON.stringify(value)); } catch(e){ console.warn('Store.set failed', e); }
    },
    remove,
    clear(){ LS.clear(); }
  };
})();
