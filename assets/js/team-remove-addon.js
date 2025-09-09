
// Team Aside Enhancer: add remove (×) buttons for each selected teammate in the side panel.
(function(){
  function injectCSS(){
    const css = `
      .sel{ position: relative; }
      .sel-remove{
        margin-left: auto;
        border: none; background: transparent; cursor: pointer;
        width: 26px; height: 26px; border-radius: 8px;
        display: inline-grid; place-items: center;
        font-size: 16px; line-height: 1; color: #64748b;
      }
      .sel-remove:hover{ background: #f1f5f9; color:#334155; }
      .sel-remove:active{ background:#e2e8f0; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function patchedRender(){
    const selSet = (window.STATE && window.STATE.selection) || new Set(JSON.parse(localStorage.getItem('aiemp.selection')||'[]'));
    const selected = Array.from(selSet);

    const box = document.getElementById('selList');
    if(!box) return;
    box.innerHTML = '';

    selected.forEach(id=>{
      const card = document.querySelector(`.card[data-id="${id}"]`);
      const img = card?.querySelector('img');
      const title = card?.querySelector('h3, .title, .name');

      const row = document.createElement('div');
      row.className = 'sel';
      row.dataset.id = id;

      if(img){
        const i = document.createElement('img');
        i.src = img.getAttribute('src');
        i.alt = '';
        row.appendChild(i);
      }

      const nm = document.createElement('div');
      nm.className = 'name';
      nm.textContent = (title ? title.textContent.trim() : id);
      row.appendChild(nm);

      const rm = document.createElement('button');
      rm.className = 'sel-remove';
      rm.type = 'button';
      rm.setAttribute('aria-label', 'Убрать из команды');
      rm.title = 'Убрать из команды';
      rm.textContent = '×';
      rm.addEventListener('click', function(){
        try{
          if(window.STATE && window.STATE.selection){
            window.STATE.selection.delete(id);
          } else {
            const arr = new Set(JSON.parse(localStorage.getItem('aiemp.selection')||'[]'));
            arr.delete(id);
            localStorage.setItem('aiemp.selection', JSON.stringify(Array.from(arr)));
          }
          if(typeof window.saveSelection === 'function'){ window.saveSelection(); }
          else { patchedRender(); } // fallback
        }catch(e){ console.warn('Remove error', e); }
      });
      row.appendChild(rm);

      box.appendChild(row);
    });

    const pt = document.getElementById('panelTitle');
    if(pt) pt.textContent = `Ваша команда (${selected.length})`;
  }

  function install(){
    injectCSS();
    // Override global renderAsideList if present
    try { window.renderAsideList = patchedRender; } catch(_){}
    // Initial draw
    patchedRender();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
