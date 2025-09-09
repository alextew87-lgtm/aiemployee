
const STATE = {
  selection: new Set(JSON.parse(localStorage.getItem('aiemp.selection')||'[]')),
  TELEGRAM_BOT_TOKEN: '8097478338:AAGb-aDrc7nSTgG5P_Oolk_KIHWMUCQlNtg',
  TELEGRAM_CHAT_ID: '-4885519582'
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
  };
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
    try{ await sendToTelegram(); alert('Заявка отправлена!'); openAside(false); e.target.reset(); }
    catch{ alert('Не удалось отправить. Попробуйте позже.'); }
    finally{ $('#sendBtn').disabled = false; }
  });
  saveSelection();
});
