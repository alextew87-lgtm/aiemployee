
// AiEmployee site logic (team selection, aside, Telegram & Bitrix lead sending)
const STATE = {
  selection: new Set(JSON.parse(localStorage.getItem('aiemp.selection')||'[]')),
  TELEGRAM_BOT_TOKEN: '8097478338:AAGb-aDrc7nSTgG5P_Oolk_KIHWMUCQlNtg',
  TELEGRAM_CHAT_ID: '-4885519582',
  BITRIX_WEBHOOK_URL: 'https://aiemployee.bitrix24.by/rest/1/t7fjlci82tji0e94/crm.lead.add.json'
};
const $ = s=>document.querySelector(s);
const $$ = s=>document.querySelectorAll(s);

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
  try{ await fetch(url, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body: form }); }
  catch(e){ console.warn('Bitrix lead send error (ignored):', e); }
}

window.addEventListener('DOMContentLoaded', ()=>{
  $$('.card .btn.add').forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.closest('.card')?.dataset.id; if(!id) return;
      if(STATE.selection.has(id)) STATE.selection.delete(id);
      else STATE.selection.add(id);
      saveSelection();
    };
  });
  $('#floatOpen')?.addEventListener('click', ()=>openAside(true));
  $('#backdrop')?.addEventListener('click', ()=>openAside(false));
  $('#closeAside')?.addEventListener('click', ()=>openAside(false));

  const form = $('#leadForm');
  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const btn = $('#sendBtn'); if(btn) btn.disabled = true;
    try{
      await Promise.allSettled([ sendToTelegram(), sendLeadToBitrix() ]);
      alert('Заявка отправлена!');
      openAside(false);
      form.reset();
    }catch(_){
      alert('Не удалось отправить. Попробуйте позже.');
    }finally{ if(btn) btn.disabled = false; }
  });

  saveSelection();
});
