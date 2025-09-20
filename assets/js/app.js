// AiEmployee site logic (team selection, aside, Telegram & Bitrix lead sending)
const STATE = {
  selection: new Set(JSON.parse(localStorage.getItem('aiemp.selection')||'[]')),
  TELEGRAM_BOT_TOKEN: '8097478338:AAGb-aDrc7nSTgG5P_Oolk_KIHWMUCQlNtg',
  TELEGRAM_CHAT_ID: '-4885519582',
  BITRIX_WEBHOOK_URL: 'https://aiemployee.bitrix24.by/rest/1/t7fjlci82tji0e94/crm.lead.add.json',
  METRIKA_ID: 104158481, // ваш счетчик Метрики
};
const $ = s=>document.querySelector(s);
const $$ = s=>document.querySelectorAll(s);

/* ========= Helpers: Metrics ========= */
function trackGAdsConversion(extra = {}) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', Object.assign({
        send_to: 'AW-948603373/roIpCJnsoJsbEO2TqsQD',
        value: 1.0,
        currency: 'USD'
      }, extra));
    }
  } catch(e) { /* no-op */ }
}
function trackYandexGoal(name, params = {}) {
  try {
    if (typeof ym === 'function') ym(STATE.METRIKA_ID, 'reachGoal', name, params);
  } catch(e) { /* no-op */ }
}
function trackLead(extra = {}) {
  try {
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', Object.assign({
        source: 'site_form',
        teamCount: STATE.selection.size,
        page: location.pathname
      }, extra));
    }
  } catch(e) { /* no-op */ }
}
/* ==================================== */

function saveSelection(){
  localStorage.setItem('aiemp.selection', JSON.stringify([...STATE.selection]));
  renderFloat(); renderAsideList(); syncButtons();
}
function syncButtons(){
  $$('.card').forEach(card=>{
    const id = card.dataset.id;
    const btn = card.querySelector('.btn.add');
    if(!btn || !id) return;
    if(STATE.selection.has(id)){
      btn.textContent = 'В команде ✓';
      btn.classList.add('secondary');
      card.classList.add('selected');
    } else{
      btn.textContent = 'Добавить в команду';
      btn.classList.remove('secondary');
      card.classList.remove('selected');
    }
  });
}
function renderFloat(){ const c = $('#floatCount'); if(c) c.textContent = STATE.selection.size; }
function renderAsideList(){
  const box = $('#selList'); if(!box) return; box.innerHTML='';
  [...STATE.selection].forEach(id=>{
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if(!card) return;
    const img = card.querySelector('img');
    const title = card.querySelector('h3, .title, .name');
    const el = document.createElement('div'); el.className='sel';
    el.innerHTML = `${img?`<img src="${img.getAttribute('src')}" alt="">`:''}<div class="name">${title?title.textContent.trim():id}</div>`;
    box.appendChild(el);
  });
  const pt = $('#panelTitle'); if(pt) pt.textContent = `Ваша команда (${STATE.selection.size})`;
}
function openAside(open){
  const as = document.querySelector('.aside'); if(!as) return;
  if(open) as.classList.add('active'); else as.classList.remove('active');
}
function composeMessage(){
  const f = $('#leadForm');
  const payload = {
    team: [...STATE.selection],
    name: f?.querySelector('[name="name"]')?.value || '',
    contact: f?.querySelector('[name="contact"]')?.value || '',
    comment: f?.querySelector('[name="comment"]')?.value || '',
    ts: new Date().toISOString()
  };
  const pretty = `Заявка с сайта aiemployee.by
Команда: ${payload.team.join(', ') || '- (не выбраны)'}
Имя/должность: ${payload.name}
Контакты: ${payload.contact}
Комментарий: ${payload.comment}
Страница: ${location.href}
Время: ${payload.ts}`;
  return {payload, pretty};
}

async function sendToTelegram(){
  const {pretty} = composeMessage();
  const token = STATE.TELEGRAM_BOT_TOKEN;
  const chat = STATE.TELEGRAM_CHAT_ID;
  if(!token || !chat){
    try{ await navigator.clipboard.writeText(pretty); }catch(_){}
    throw new Error('TELEGRAM_MISSING');
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: chat, text: pretty, parse_mode:'HTML', disable_web_page_preview:true })
  });
  if(!res.ok) throw new Error('TG_'+res.status);
}

function parseContact(raw){
  const s = String(raw||'').trim();
  const isEmail = /\S+@\S+\.\S+/.test(s);
  const onlyDigits = s.replace(/[^\d+]/g,'');
  const isPhone = /^\+?\d{7,15}$/.test(onlyDigits);
  const tgMatch = s.match(/@([a-z0-9_]{3,})/i);
  return { email: isEmail ? s : '', phone: isPhone ? onlyDigits : '', tg: tgMatch ? tgMatch[1] : '' };
}
function buildBitrixFields(payload){
  const [first, ...rest] = String(payload.name||'').trim().split(/\s+/);
  const name = first || '';
  const lastName = rest.join(' ');
  const c = parseContact(payload.contact);
  const fields = {
    TITLE: 'Заявка с сайта AiEmployee',
    NAME: name,
    LAST_NAME: lastName,
    SOURCE_ID: 'WEB',
    COMMENTS:
`Команда: ${payload.team.join(', ') || '- (не выбраны)'}
Контакты: ${payload.contact}
Комментарий: ${payload.comment}
Страница: ${location.href}
Время: ${payload.ts}`
  };
  if (c.email) fields.EMAIL = [{ VALUE: c.email, VALUE_TYPE: 'WORK' }];
  if (c.phone) fields.PHONE = [{ VALUE: c.phone, VALUE_TYPE: 'WORK' }];
  if (c.tg)    fields.IM    = [{ VALUE: 'telegram:'+c.tg, VALUE_TYPE: 'WORK' }];
  return fields;
}
async function sendLeadToBitrix(){
  const url = STATE.BITRIX_WEBHOOK_URL;
  if(!url) return;
  const {payload} = composeMessage();
  const fields = buildBitrixFields(payload);
  const form = new URLSearchParams();
  for (const [k,v] of Object.entries(fields)){
    if (Array.isArray(v)) v.forEach((item,i)=>{ for(const [ik,iv] of Object.entries(item)) form.append(`fields[${k}][${i}][${ik}]`, iv); });
    else form.append(`fields[${k}]`, v);
  }
  form.append('params[REGISTER_SONET_EVENT]','Y');

  // ВАЖНО: используем no-cors для стабильной отправки, но её успех мы не можем проверить из браузера.
  try{ await fetch(url, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body: form }); }
  catch(e){ console.warn('Bitrix lead send error (ignored):', e); }
}

/* ========= UI & Submit ========= */
window.addEventListener('DOMContentLoaded', ()=>{
  $$('.card .btn.add').forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.closest('.card')?.dataset.id; if(!id) return;
      if(STATE.selection.has(id)) STATE.selection.delete(id);
      else STATE.selection.add(id);
      saveSelection();

      // micro-конверсия: нажали «Добавить в команду»
      try { if (typeof fbq === 'function') fbq('trackCustom', 'CTA_AddToTeam'); } catch(e){}
    };
  });
  $('#floatOpen')?.addEventListener('click', ()=>openAside(true));
  $('#backdrop')?.addEventListener('click', ()=>openAside(false));
  $('#closeAside')?.addEventListener('click', ()=>openAside(false));

  const form = $('#leadForm');
  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if (window.__leadLock) return;
    window.__leadLock = true;

    const btn = $('#sendBtn'); if(btn) btn.disabled = true;
    try{
      // 1) Требуем реальный успех Telegram
      await sendToTelegram();

      // 2) Фиксируем конверсию ТОЛЬКО ПОСЛЕ успеха Telegram
      const { payload } = composeMessage();
      trackYandexGoal('lead_sent', { teamCount: STATE.selection.size });
      trackGAdsConversion({ transaction_id: payload.ts });
      trackLead({ roles: payload.team.join(', ') || '-' });

      // 3) Параллельно отправляем в Bitrix (успех не влияет на цели из-за no-cors)
      sendLeadToBitrix().catch(err=>console.warn('Bitrix send failed:', err));

      alert('Заявка отправлена!');
      openAside(false);
      form.reset();
    }catch(err){
      console.error(err);
      alert('Не удалось отправить. Попробуйте позже.');
    }finally{
      if(btn) btn.disabled = false;
      window.__leadLock = false;
    }
  });

  saveSelection();
});
// ===== Cookie Consent (v4) =====
(function(){
  const LS_KEY = 'cookieConsent.v4';
  const $ = (s) => document.querySelector(s);

  const banner = $('#cookie-banner');
  const modal  = $('#cookie-modal');

  const btnAll   = $('#cookie-accept-all');
  const btnOpen  = $('#cookie-open-settings');
  const btnSaveMaster = $('#cookie-save-master'); // «Улучшенный опыт»
  const btnSaveCustom = $('#cookie-save-custom');
  const btnCancel = $('#cookie-cancel');
  const footerLink = $('#cookie-footer-link');

  const cbYM   = $('#consent-ym');
  const cbGA4  = $('#consent-ga4');
  const cbGADS = $('#consent-gads');
  const cbMETA = $('#consent-meta');

  const getConsent = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch(_) { return null; } };
  const setConsent = (obj) => localStorage.setItem(LS_KEY, JSON.stringify(obj));

  function providerOk(consent, el){
    const cat  = el.getAttribute('data-consent');              // analytics | marketing
    const prov = el.getAttribute('data-consent-provider');     // ym | ga4 | gads | meta (опц.)
    const catOk = (cat === 'analytics') ? !!consent.analytics : !!consent.marketing;
    const provOk = prov ? !!(consent.providers && consent.providers[prov]) : true;
    return catOk && provOk;
  }

  function applyConsent(consent){
    document.querySelectorAll('script[data-consent]').forEach(el => {
      if (providerOk(consent, el) && !el.dataset.loaded) {
        // ВАЖНО: вместо прямой подстановки src используем реконструкцию,
        // чтобы выполнить inline-инициализацию ПОСЛЕ загрузки внешних файлов (см. «обёртки» ниже).
        const s = document.createElement('script');
        if (el.src) s.src = el.src;
        s.type = el.type === 'text/plain' ? 'text/javascript' : (el.type || 'text/javascript');
        if (!el.src) s.text = el.text || el.innerHTML;
        [...el.attributes].forEach(a => {
          if (!a.name.startsWith('data-') && a.name !== 'type') s.setAttribute(a.name, a.value);
        });
        el.replaceWith(s);
        s.dataset.loaded = '1';
      }
    });
  }

  const show = el => el && el.removeAttribute('hidden');
  const hide = el => el && el.setAttribute('hidden','');

  // init
  const existing = getConsent();
  if (existing){ hide(banner); applyConsent(existing); }
  else { show(banner); }

  // Banner
  btnAll?.addEventListener('click', () => {
    const c = { analytics:true, marketing:true, ts:Date.now(), providers:{ ym:true, ga4:true, gads:true, meta:true } };
    setConsent(c); applyConsent(c); hide(banner);
  });

  // Open settings
  function openSettings(){
    const c = getConsent();
    if (c) {
      const p = c.providers || {};
      cbYM.checked   = !!p.ym;   cbGA4.checked  = !!p.ga4;
      cbGADS.checked = !!p.gads; cbMETA.checked = !!p.meta;
    } else {
      // Первый заход: всё уже включено (opt-out в настройках)
      cbYM.checked = cbGA4.checked = cbGADS.checked = cbMETA.checked = true;
    }
    show(modal);
  }
  btnOpen?.addEventListener('click', openSettings);
  footerLink?.addEventListener('click', (e)=>{ e.preventDefault(); openSettings(); });

  // «Улучшенный опыт» = принять всё и закрыть
  btnSaveMaster?.addEventListener('click', () => {
    const c = { analytics:true, marketing:true, ts:Date.now(), providers:{ ym:true, ga4:true, gads:true, meta:true } };
    setConsent(c); applyConsent(c); hide(modal); hide(banner);
  });

  // Сохранить кастомный выбор (пользователь снимает галочки по одному)
  btnSaveCustom?.addEventListener('click', () => {
    const c = {
      analytics: (cbYM.checked || cbGA4.checked),
      marketing: (cbGADS.checked || cbMETA.checked),
      ts: Date.now(),
      providers: { ym:cbYM.checked, ga4:cbGA4.checked, gads:cbGADS.checked, meta:cbMETA.checked }
    };
    setConsent(c); applyConsent(c); hide(modal); hide(banner);
  });

  btnCancel?.addEventListener('click', () => hide(modal));
})();
