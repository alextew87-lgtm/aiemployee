/* assets/js/app.js — cookie consent + provider loader (v6)
   Changes from v5: removed fbq shim to avoid blocking Meta Pixel loader.
*/
(function(){
  var LS_KEY = 'cookieConsent.v6';
  var q = function(s){ return document.querySelector(s); };

  // --- Utils: state ---
  function getConsent(){
    try {
      var raw = localStorage.getItem(LS_KEY) || localStorage.getItem('cookieConsent.v5') || localStorage.getItem('cookieConsent.v4');
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  function setConsent(c){ localStorage.setItem(LS_KEY, JSON.stringify(c)); }

  // --- Utils: UI helpers ---
  function show(el){ if(el) el.removeAttribute('hidden'); }
  function hide(el){ if(el) el.setAttribute('hidden',''); }

  // --- Provider matching ---
  function providerOk(c, el){
    var cat  = el.getAttribute('data-consent');              // analytics | marketing
    var prov = el.getAttribute('data-consent-provider');     // ym | ga4 | gads | meta
    if (!c) return false;
    var catOk = (cat === 'analytics') ? !!c.analytics : !!c.marketing;
    var provOk = prov ? !!(c.providers && c.providers[prov]) : true;
    return catOk && provOk;
  }

  // --- Load <script type="text/plain" data-consent ...> when allowed ---
  function loadProviders(c){
    if (!c) return;
    var nodes = document.querySelectorAll('script[data-consent]');
    nodes.forEach(function(el){
      if (!providerOk(c, el) || el.dataset.loaded) return;

      var s = document.createElement('script');
      // перенесём НЕ data-* атрибуты (кроме type)
      for (var i=0; i<el.attributes.length; i++){
        var a = el.attributes[i];
        if (a.name === 'type') continue;
        if (a.name.startsWith('data-')) continue;
        try { s.setAttribute(a.name, a.value); } catch(e){}
      }
      if (el.src) {
        s.src = el.getAttribute('src');
        s.async = true;
      } else {
        s.text = el.text || el.innerHTML;
      }
      s.type = 'text/javascript';
      el.parentNode.replaceChild(s, el);
      s.dataset.loaded = '1';
    });
  }

  // --- Safe shims (gtag only). fbq shim removed to not block Meta loader. ---
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

  // --- Elements ---
  var banner = q('#cookie-banner');
  var modal  = q('#cookie-modal');

  var btnAll = q('#cookie-accept-all');
  var btnOpen = q('#cookie-open-settings');
  var btnSaveMaster = q('#cookie-save-master');
  var btnSaveCustom = q('#cookie-save-custom');
  var btnCancel = q('#cookie-cancel');
  var footerLink = q('#cookie-footer-link');

  var cbYM   = q('#consent-ym');
  var cbGA4  = q('#consent-ga4');
  var cbGADS = q('#consent-gads');
  var cbMETA = q('#consent-meta');

  // --- Init: show banner or apply existing consent ---
  var existing = getConsent();
  if (existing){
    hide(banner);
    try { loadProviders(existing); } catch(e){ /* no-op */ }
  } else {
    show(banner);
  }

  // --- Open settings (prefill checkboxes) ---
  function openSettings(){
    var c = getConsent();
    if (cbYM)   cbYM.checked   = c ? !!(c.providers && c.providers.ym)   : true;
    if (cbGA4)  cbGA4.checked  = c ? !!(c.providers && c.providers.ga4)  : true;
    if (cbGADS) cbGADS.checked = c ? !!(c.providers && c.providers.gads) : true;
    if (cbMETA) cbMETA.checked = c ? !!(c.providers && c.providers.meta) : true;
    show(modal);
  }
  btnOpen && btnOpen.addEventListener('click', openSettings);
  footerLink && footerLink.addEventListener('click', function(e){ e.preventDefault(); openSettings(); });

  // --- Save helpers ---
  function acceptAll(){
    var c = { analytics:true, marketing:true, ts:Date.now(), providers:{ ym:true, ga4:true, gads:true, meta:true } };
    setConsent(c);
    try { loadProviders(c); } catch(e){}
    hide(modal); hide(banner);
  }

  function saveCustom(){
    var c = {
      analytics: !!(cbYM && cbYM.checked) || !!(cbGA4 && cbGA4.checked),
      marketing: !!(cbGADS && cbGADS.checked) || !!(cbMETA && cbMETA.checked),
      ts: Date.now(),
      providers: {
        ym:   !!(cbYM && cbYM.checked),
        ga4:  !!(cbGA4 && cbGA4.checked),
        gads: !!(cbGADS && cbGADS.checked),
        meta: !!(cbMETA && cbMETA.checked)
      }
    };
    setConsent(c);
    try { loadProviders(c); } catch(e){}
    hide(modal); hide(banner);
  }

  // --- Bind buttons ---
  btnAll && btnAll.addEventListener('click', acceptAll);
  btnSaveMaster && btnSaveMaster.addEventListener('click', acceptAll);
  btnSaveCustom && btnSaveCustom.addEventListener('click', saveCustom);
  btnCancel && btnCancel.addEventListener('click', function(){ hide(modal); });

  // --- Fallback: react to direct localStorage writes ---
  try {
    var origSet = localStorage.setItem;
    localStorage.setItem = function(k, v){
      origSet.apply(this, arguments);
      if (k === LS_KEY || k === 'cookieConsent.v5' || k === 'cookieConsent.v4'){
        try { loadProviders(JSON.parse(v)); } catch(e){}
      }
    };
  } catch(e){}

  window.__cookieConsent = { get: getConsent, set: setConsent, load: loadProviders };
})();