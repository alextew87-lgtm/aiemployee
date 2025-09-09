
(function(){ if(window.__AIE_CHAT_WIDGET__) return; window.__AIE_CHAT_WIDGET__=true;
  var WEBHOOK="https://sihieparaque.beget.app/webhook/sitechat-in";
  function h(t,a,c){var e=document.createElement(t);a=a||{};for(var k in a){if(k==='class')e.className=a[k];else if(k==='style')e.setAttribute('style',a[k]);else if(k.startsWith('on')&&typeof a[k]==='function')e.addEventListener(k.slice(2),a[k]);else e.setAttribute(k,a[k]);};if(!Array.isArray(c))c=[c];(c||[]).filter(Boolean).forEach(function(n){e.appendChild(typeof n==='string'?document.createTextNode(n):n);});return e;}
  var css = [
    '.aie-chat-btn{position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;align-items:center;gap:8px;padding:12px 14px;border-radius:999px;border:1px solid rgba(0,0,0,.08);background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.12);font:600 14px/1.1 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;cursor:pointer;user-select:none}',
    '.aie-chat-btn svg{width:18px;height:18px;opacity:.9}',
    '.aie-chat-drawer{position:fixed;right:16px;bottom:76px;width:340px;max-width:calc(100vw - 32px);height:460px;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:16px;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,.18);z-index:9999;display:none}',
    '.aie-chat-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(0,0,0,.06);background:#fff}',
    '.aie-chat-title{font:600 14px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}',
    '.aie-chat-close{border:none;background:transparent;font-size:18px;line-height:1;cursor:pointer;opacity:.6}',
    '.aie-chat-body{display:flex;flex-direction:column;height:calc(100% - 50px)}',
    '.aie-chat-log{flex:1;overflow:auto;padding:12px;background:#fafafa}',
    '.aie-msg{max-width:76%;margin:6px 0;padding:10px 12px;border-radius:14px;font:500 13px/1.35 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;word-wrap:break-word}',
    '.aie-msg.user{margin-left:auto;background:#dbf0ff;border:1px solid rgba(0,120,255,.15)}',
    '.aie-msg.bot{margin-right:auto;background:#fff;border:1px solid rgba(0,0,0,.08)}',
    '.aie-chat-input{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(0,0,0,.06);background:#fff}',
    '.aie-chat-input input,.aie-chat-input textarea{width:100%;border:1px solid rgba(0,0,0,.12);border-radius:12px;padding:10px 12px;font:500 13px/1.35 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#fff;outline:none}',
    '.aie-chat-input textarea{resize:none;height:44px}',
    '.aie-chat-send{border:none;border-radius:12px;padding:10px 14px;background:#0b7cff;color:#fff;font:600 13px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;cursor:pointer}',
    '.aie-chat-send[disabled]{opacity:.6;cursor:not-allowed}',
    '.aie-row{display:flex;gap:8px;margin-bottom:8px}',
    '.aie-row input{flex:1}',
    '@media (max-width:420px){.aie-chat-drawer{height:60vh}}'
  ].join('\n');
  var style = h('style',{},css); document.head.appendChild(style);
  var btn = h('button',{class:'aie-chat-btn',title:'Чат с AiEmployee'},[]);
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5.5A3.5 3.5 0 0 1 5.5 2h13A3.5 3.5 0 0 1 22 5.5v7A3.5 3.5 0 0 1 18.5 16H9l-4.8 4.1A1 1 0 0 1 2 19.3V5.5Z"/></svg><span>Чат с AiEmployee</span>';
  var drawer = h('div',{class:'aie-chat-drawer',role:'dialog','aria-label':'Чат с AiEmployee'});
  var header = h('div',{class:'aie-chat-header'},[ h('div',{class:'aie-chat-title'},'Поддержка AiEmployee'), h('button',{class:'aie-chat-close',onclick:function(){toggle(false)},'aria-label':'Закрыть'},'×') ]);
  var body = h('div',{class:'aie-chat-body'});
  var log = h('div',{class:'aie-chat-log'});
  var inputWrap = h('div',{class:'aie-chat-input'});
  var nameRow = h('div',{class:'aie-row'},[ h('input',{type:'text',placeholder:'Имя или компания',id:'aieName',autocomplete:'name'}), h('input',{type:'text',placeholder:'Телефон или @Telegram',id:'aieContact',autocomplete:'tel'}) ]);
  var ta = h('textarea',{placeholder:'Напишите вопрос…',id:'aieText',maxlength:'2000'});
  var send = h('button',{class:'aie-chat-send',id:'aieSend'},'Отправить'); send.addEventListener('click', onSend);
  function toggle(open){ drawer.style.display = open?'block':'none'; }
  function addMsg(text, who){ var m=h('div',{class:'aie-msg '+(who||'bot')},text); log.appendChild(m); log.scrollTop=log.scrollHeight; }
  function safe(s){ return String(s||'-').slice(0,750); }
  function placeButtons(){ var hasFloat=document.getElementById('floatOpen'); if(hasFloat){ btn.style.bottom='96px'; drawer.style.bottom='156px'; } else { btn.style.bottom='16px'; drawer.style.bottom='76px'; } }
  inputWrap.appendChild(h('div',{style:'width:100%'},[nameRow, ta])); inputWrap.appendChild(send);
  body.appendChild(log); body.appendChild(inputWrap);
  drawer.appendChild(header); drawer.appendChild(body);
  document.body.appendChild(btn); document.body.appendChild(drawer); placeButtons(); window.addEventListener('resize', placeButtons);
  btn.addEventListener('click', function(){toggle(true)});
  function buildPayload(name, contact, msg){ var d=new URLSearchParams(); d.set('source','aiemployee.by/chat'); d.set('name',safe(name)); d.set('contact',safe(contact)); d.set('message',safe(msg)); d.set('page',location.href); d.set('ts',new Date().toISOString()); return d.toString(); }
  async function postFormEncoded(bodyStr){ try{ await fetch(WEBHOOK,{ method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body:bodyStr }); return true; }catch(e){ return false; } }
  function beaconFallback(bodyStr){ if(navigator.sendBeacon){ try{ return navigator.sendBeacon(WEBHOOK,new Blob([bodyStr],{type:'text/plain;charset=UTF-8'})); }catch(e){ return false; } } return false; }
  var sending=false; async function onSend(){ if(sending) return; var name=document.getElementById('aieName').value.trim(); var contact=document.getElementById('aieContact').value.trim(); var text=document.getElementById('aieText').value.trim(); if(!text){ ta.focus(); return; } sending=true; send.disabled=true; addMsg(text,'user'); document.getElementById('aieText').value=''; var body=buildPayload(name,contact,text); var ok=await postFormEncoded(body); if(!ok) ok=beaconFallback(body); if(ok) addMsg('Приняли! Сообщение отправлено в систему. Мы скоро ответим.','bot'); else { try{ await navigator.clipboard.writeText(decodeURIComponent(body)); }catch(e){} addMsg('Не удалось отправить автоматически. Сообщение скопировано в буфер — вставьте его в чат @aiemployee_by или отправьте через форму заявки.','bot'); } sending=false; send.disabled=false; }
})();