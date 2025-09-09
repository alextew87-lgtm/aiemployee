
// Team Aside Enhance v2 — non-invasive "×" remove buttons that definitely work
(function(){
  function injectCSS(){
    const css = `
      #selList .sel{ position: relative; display: flex; align-items: center; gap: 8px; }
      #selList .sel .name{ flex: 1 1 auto; }
      #selList .sel .sel-remove{
        margin-left: 8px;
        border: none; background: transparent; cursor: pointer;
        width: 26px; height: 26px; border-radius: 8px;
        display: inline-grid; place-items: center;
        font-size: 16px; line-height: 1; color: #64748b;
      }
      #selList .sel .sel-remove:hover{ background: #f1f5f9; color:#334155; }
      #selList .sel .sel-remove:active{ background:#e2e8f0; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getSelection(){
    try{
      if (window.STATE && window.STATE.selection instanceof Set) return Array.from(window.STATE.selection);
      return JSON.parse(localStorage.getItem('aiemp.selection') || '[]') || [];
    }catch(_){ return []; }
  }

  function setSelection(ids){
    try{
      if (window.STATE && window.STATE.selection instanceof Set){
        window.STATE.selection = new Set(ids);
      }
      localStorage.setItem('aiemp.selection', JSON.stringify(ids));
    }catch(_){}
  }

  // Enhance the current list: add data-id by order and add × buttons
  function enhanceSelList(){
    const box = document.getElementById('selList');
    if(!box) return;
    const ids = getSelection();
    const rows = box.querySelectorAll('.sel');
    rows.forEach((row, i)=>{
      const id = ids[i];
      if(!id) return;
      row.dataset.id = id;

      if(!row.querySelector('.sel-remove')){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sel-remove';
        btn.setAttribute('aria-label','Убрать из команды');
        btn.title = 'Убрать из команды';
        btn.textContent = '×';
        btn.addEventListener('click', function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          const current = getSelection().filter(x => x !== id);
          setSelection(current);
          if (typeof window.renderFloat === 'function') window.renderFloat();
          if (typeof window.syncButtons === 'function') window.syncButtons();
          // Re-render aside using existing function if present
          if (typeof window.renderAsideList === 'function') window.renderAsideList();
          else enhanceSelList(); // fallback
        }, {passive:false});
        row.appendChild(btn);
      }
    });
    // Update title count
    const pt = document.getElementById('panelTitle');
    if(pt) pt.textContent = `Ваша команда (${ids.length})`;
  }

  function install(){
    injectCSS();
    // Patch saveSelection to enhance after original logic
    const originalSave = window.saveSelection;
    if (typeof originalSave === 'function'){
      window.saveSelection = function(){
        try{ originalSave.apply(this, arguments); }catch(_){}
        enhanceSelList();
      };
    }
    // Initial enhancement (in case list already rendered)
    enhanceSelList();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
