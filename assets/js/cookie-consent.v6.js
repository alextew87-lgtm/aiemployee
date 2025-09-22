/* assets/js/cookie-consent.v6.js — standalone (no monkey patches, no fbq shim) */
(function(){
  var LS_KEYS = ['cookieConsent.v6','cookieConsent.v5','cookieConsent.v4'];
  function getConsent(){
    for (var i=0;i<LS_KEYS.length;i++){
      try { var raw = localStorage.getItem(LS_KEYS[i]); if (raw) return JSON.parse(raw); } catch(e){}
    }
    return null;
  }
  function setConsent(c){ localStorage.setItem('cookieConsent.v6', JSON.stringify(c)); }
  function show(el){ if(el) el.removeAttribute('hidden'); }
  function hide(el){ if(el) el.setAttribute('hidden',''); }

  function providerOk(c, el){
    if(!c) return false;
    var cat  = el.getAttribute('data-consent');              // analytics | marketing
    var prov = el.getAttribute('data-consent-provider');     // ym | gads | meta | ga4(?)
    var catOk = (cat === 'analytics') ? !!c.analytics : !!c.marketing;
    var provOk = prov ? !!(c.providers && c.providers[prov]) : true;
    return catOk && provOk;
  }

  function loadProviders(c){
    if(!c) return;
    var nodes = document.querySelectorAll('script[data-consent]');
    nodes.forEach(function(el){
      if (!providerOk(c, el) || el.dataset.loaded) return;
      var s = document.createElement('script');
      // copy non-data-* attrs except type
      for (var i=0;i<el.attributes.length;i++){
        var a = el.attributes[i];
        if (a.name === 'type') continue;
        if (a.name.indexOf('data-') === 0) continue;
        try { s.setAttribute(a.name, a.value); } catch(e){}
      }
      if (el.src){ s.src = el.getAttribute('src'); s.async = true; }
      else { s.text = el.text || el.innerHTML; }
      s.type = 'text/javascript';
      el.parentNode.replaceChild(s, el);
      s.dataset.loaded = '1';
    });
  }

  // Safe GTAG shim only (Meta shim deliberately removed)
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

  // Elements
  var banner = document.getElementById('cookie-banner');
  var modal  = document.getElementById('cookie-modal');
  var btnAll = document.getElementById('cookie-accept-all');
  var btnOpen= document.getElementById('cookie-open-settings');
  var btnSaveMaster = document.getElementById('cookie-save-master');
  var btnSaveCustom = document.getElementById('cookie-save-custom');
  var btnCancel = document.getElementById('cookie-cancel');
  var footerLink = document.getElementById('cookie-footer-link');

  var cbYM   = document.getElementById('consent-ym');
  var cbGADS = document.getElementById('consent-gads');
  var cbMETA = document.getElementById('consent-meta');
  var cbGA4  = document.getElementById('consent-ga4'); // может отсутствовать

  // Init
  var existing = getConsent();
  if (existing){ hide(banner); loadProviders(existing); } else { show(banner); }

  function openSettings(){
    var c = getConsent();
    if (cbYM)   cbYM.checked   = c ? !!(c.providers && c.providers.ym)   : true;
    if (cbGA4)  cbGA4.checked  = c ? !!(c.providers && c.providers.ga4)  : true;
    if (cbGADS) cbGADS.checked = c ? !!(c.providers && c.providers.gads) : true;
    if (cbMETA) cbMETA.checked = c ? !!(c.providers && c.providers.meta) : true;
    show(modal);
  }

  btnOpen && btnOpen.addEventListener('click', function(e){ e.preventDefault(); openSettings(); });
  footerLink && footerLink.addEventListener('click', function(e){ e.preventDefault(); openSettings(); });

  function acceptAll(){
    var providers = { ym:true, gads:true, meta:true };
    if (cbGA4) providers.ga4 = true;
    var c = { analytics:true, marketing:true, ts: Date.now(), providers: providers };
    setConsent(c); loadProviders(c); hide(modal); hide(banner);
  }

  function saveCustom(){
    var providers = {
      ym:   !!(cbYM && cbYM.checked),
      gads: !!(cbGADS && cbGADS.checked),
      meta: !!(cbMETA && cbMETA.checked)
    };
    if (cbGA4) providers.ga4 = !!cbGA4.checked;
    var c = {
      analytics: !!providers.ym || !!providers.ga4,
      marketing: !!providers.gads || !!providers.meta,
      ts: Date.now(),
      providers: providers
    };
    setConsent(c); loadProviders(c); hide(modal); hide(banner);
  }

  btnAll && btnAll.addEventListener('click', acceptAll);
  btnSaveMaster && btnSaveMaster.addEventListener('click', acceptAll);
  btnSaveCustom && btnSaveCustom.addEventListener('click', saveCustom);
  btnCancel && btnCancel.addEventListener('click', function(){ hide(modal); });

  // Export (debug)
  window.__cookieConsent = { get:getConsent, set:setConsent, load:loadProviders };
})();