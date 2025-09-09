
const STATE = {
  selection: new Set(JSON.parse(localStorage.getItem('aiemp.selection')||'[]')),
  TELEGRAM_BOT_TOKEN: '8097478338:AAGb-aDrc7nSTgG5P_Oolk_KIHWMUCQlNtg',
  TELEGRAM_CHAT_ID: '-4885519582'
};
const $ = s=>document.querySelector(s);
const $$ = s=>document.querySelectorAll(s);
const BITRIX_WEBHOOK_URL = 'https://aiemployee.bitrix24.by/rest/1/t7fjlci82tji0e94/crm.lead.add.json';

function saveSelection(){
  localStorage.setItem('aiemp.selection', JSON.stringify([...STATE.selection]));
  renderFloat(); renderAsideList(); syncButtons();
}
function syncButtons(){
  $$('.card').forEach(card=>{
    const id = card.dataset.id;
    const btn = card.querySelector('.btn.add');
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
function renderFloat(){ $('#floatCount').textContent = STATE.selection.size; }
function renderAsideList(){
  const box = $('#selList'); box.innerHTML = '';
  [...STATE.selection].forEach(id=>{
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if(!card) return;
    const img = card.querySelector('img')?.getAttribute('src') || '';
    const name = card.querySelector('h3').textContent;
    const item = document.createElement('div');
    item.className = 'sel';
    item.innerHTML = `<img src="${img}" alt=""><div class="name">${name}</div><button class="btn ghost remove" data-id="${id}">✕</button>`;
    item.querySelector('button.remove').onclick = ()=>{ STATE.selection.delete(id); saveSelection(); };
    box.appendChild(item);
  });
  $('#panelTitle').textContent = 'Ваша команда ('+STATE.selection.size+')';
}
function openAside(open=true){ $('.aside').classList.toggle('active', open); }
function composeMessage(){
  const form = $('#leadForm');
  const payload = {
    team: [...STATE.selection],
    name: form.name.value.trim(),
    contact: form.contact.value.trim(),
    comment: form.comment.value.trim(),
    ts: new Date().toISOString()
  }
let __BITRIX_SENT_FLAG = false;
function parseContact(raw){
  const s = String(raw||'').trim();
  const isEmail = /\S+@\S+\.\S+/.test(s);
  const onlyDigits = s.replace(/[^\d+]/g,'');
  const isPhone = /^\+?\d{7,15}$/.test(onlyDigits);
  const tgMatch = s.match(/@([a-z0-9_]{3,})/i);
  return { email: isEmail ? s : '', phone: isPhone ? onlyDigits : '', tg: tgMatch ? tgMatch[1] : '' };
}
function buildBitrixFields(payload){
  const parts = String(payload.name||'').trim().split(/\s+/);
  const name = parts.shift() || '';
  const last = parts.join(' ');
  const c = parseContact(payload.contact||'');
  const fields = {
    TITLE: 'Заявка с сайта AiEmployee',
    NAME: name,
    LAST_NAME: last,
    SOURCE_ID: 'WEB',
    COMMENTS:
`Команда: ${payload.team && payload.team.length ? payload.team.join(', ') : '- (не выбраны)'}
Контакты: ${payload.contact||''}
Комментарий: ${payload.comment||''}
Страница: ${location.href}
Время: ${payload.ts}`
  };
  if (c.email) fields.EMAIL = [{ VALUE: c.email, VALUE_TYPE: 'WORK' }];
  if (c.phone) fields.PHONE = [{ VALUE: c.phone, VALUE_TYPE: 'WORK' }];
  if (c.tg)    fields.IM    = [{ VALUE: 'telegram:'+c.tg, VALUE_TYPE: 'WORK' }];
  return fields;
}
// Cross-origin POST via hidden form + iframe (bypasses CORS reliably)
function postViaForm(url, fields){
  try{
    let iframe = document.getElementById('bitrixPostTarget');
    if(!iframe){
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'bitrixPostTarget';
      iframe.id = 'bitrixPostTarget';
      document.body.appendChild(iframe);
    }
    const form = document.createElement('form');
    form.style.display = 'none';
    form.method = 'POST';
    form.action = url;
    form.target = 'bitrixPostTarget';
    form.acceptCharset = 'UTF-8';
    const append = (name, value)=>{
      const inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = name;
      inp.value = value;
      form.appendChild(inp);
    };
    for (const [k,v] of Object.entries(fields)){
      if (Array.isArray(v)){
        v.forEach((item,i)=>{
          for(const [ik,iv] of Object.entries(item)){
            append(`fields[${k}][${i}][${ik}]`, iv);
          }
        });
      } else {
        append(`fields[${k}]`, v);
      }
    }
    append('params[REGISTER_SONET_EVENT]', 'Y');
    document.body.appendChild(form);
    form.submit();
    setTimeout(()=>form.remove(), 1000);
    return true;
  }catch(e){ console.warn('postViaForm error', e); return false; }
}
function sendLeadToBitrix(){
  if(__BITRIX_SENT_FLAG) return;
  __BITRIX_SENT_FLAG = true;
  if(!BITRIX_WEBHOOK_URL) return;
  const {payload} = composeMessage();
  const fields = buildBitrixFields(payload);
  postViaForm(BITRIX_WEBHOOK_URL, fields);
}
;
  const pretty = `Заявка с сайта aiemployee.by
Команда: ${payload.team.join(', ') || '- (не выбраны)'}
Имя/должность: ${payload.name}
Контакты: ${payload.contact}
Комментарий: ${payload.comment}
Время: ${payload.ts}`;
  return {payload, pretty};
}
async function sendToTelegram(){
  const {pretty} = composeMessage();
  const token = STATE.TELEGRAM_BOT_TOKEN;
  const chat = STATE.TELEGRAM_CHAT_ID;
  if(!token || token==='PASTE_BOT_TOKEN_HERE'){
    try{ await navigator.clipboard.writeText(pretty); }catch(e){}
    alert('Токен Telegram не настроен. Сообщение скопировано в буфер — отправьте его менеджеру.');
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({chat_id: chat, text: pretty})
  });
  if(!res.ok) throw new Error('Telegram API error');
}
window.addEventListener('DOMContentLoaded', ()=>{
  $$('.card .btn.add').forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.closest('.card').dataset.id;
      if(STATE.selection.has(id)) STATE.selection.delete(id);
      else STATE.selection.add(id);
      saveSelection();
    };
  });
  $('#floatOpen').onclick = ()=>openAside(true);
  $('#backdrop').onclick = ()=>openAside(false);
  $('#closeAside').onclick = ()=>openAside(false);
  $('#leadForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    $('#sendBtn').disabled = true;
    try{ sendLeadToBitrix(); }catch(_){ }
    try{ await sendToTelegram(); alert('Заявка отправлена!'); openAside(false); e.target.reset(); }
    catch{ alert('Не удалось отправить. Попробуйте позже.'); }
    finally{ $('#sendBtn').disabled = false; }
  });
  saveSelection();
});
