const Store = {
  get(key){ try { return JSON.parse(localStorage.getItem('he_'+key)); } catch(e){ return null; } },
  set(key,val){ try { localStorage.setItem('he_'+key, JSON.stringify(val)); } catch(e){} },
  clear(){ Object.keys(localStorage).filter(k=>k.startsWith('he_')).forEach(k=>localStorage.removeItem(k)); }
};
