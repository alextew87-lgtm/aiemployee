/*! consent-exec.v1 — безопасный исполнитель data-consent блоков
 * Ничего не меняет в UI/логике. Лишь исполняет <script type="text/plain" data-consent ...>
 * 1) при загрузке страницы, если есть согласие в localStorage.cookieConsent.v4
 * 2) сразу после кликов «Принять все» / «Улучшенный опыт» / «Сохранить выбор»
*/
(function(){
  var LS_KEY='cookieConsent.v4';

  function read(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'null'); }catch(e){ return null; } }

  function allowed(c,el){
    if(!c) return false;
    var cat=el.getAttribute('data-consent');           // analytics | marketing
    var p  =el.getAttribute('data-consent-provider');  // ym | gads | meta | (ga4)
    var catOk=(cat==='analytics') ? !!c.analytics : !!c.marketing;
    var provOk=p ? !!(c.providers && c.providers[p]) : true;
    return catOk && provOk;
  }

  function exec(c){
    if(!c) return;
    document.querySelectorAll('script[data-consent]').forEach(function(el){
      if (el.dataset.loaded || !allowed(c,el)) return;
      var s=document.createElement('script');
      // скопировать НЕ data-* атрибуты (кроме type)
      for (var i=0;i<el.attributes.length;i++){
        var a=el.attributes[i];
        if (a.name==='type') continue;
        if (a.name.indexOf('data-')===0) continue;
        try{ s.setAttribute(a.name,a.value); }catch(e){}
      }
      if (el.src){ s.src=el.getAttribute('src'); s.async=true; }
      else { s.text=el.text || el.innerHTML; }
      s.type='text/javascript';
      el.parentNode.replaceChild(s,el);
      s.dataset.loaded='1';
    });
  }

  function execSoon(){ setTimeout(function(){ exec(read()); }, 80); }

  // 1) авто-запуск при наличии сохранённого согласия
  document.addEventListener('DOMContentLoaded', function(){ exec(read()); });

  // 2) запуск сразу после кликов «Принять/Улучшенный опыт/Сохранить выбор»
  ['cookie-accept-all','cookie-save-master','cookie-save-custom'].forEach(function(id){
    var btn=document.getElementById(id);
    if (btn) btn.addEventListener('click', execSoon, { passive:true });
  });

  // опционально: ручной вызов из консоли
  window.__runConsentLoaders=function(){ exec(read()); };
})();