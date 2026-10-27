// Interface apenas. Sem login, Firebase, API, persistencia ou banco de dados.
(() => {
 const buttons=[...document.querySelectorAll('[data-page]')];
 function open(page){
  document.querySelectorAll('.page').forEach(node=>node.hidden=node.id!==`page-${page}`);
  buttons.forEach(button=>{if(button.dataset.page===page)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  document.getElementById('main')?.scrollTo(0,0);
 }
 buttons.forEach(button=>button.addEventListener('click',()=>open(button.dataset.page)));
 const collapse=document.getElementById('sidebarCollapse');
 collapse?.addEventListener('click',()=>{const collapsed=document.querySelector('.app-shell')?.classList.toggle('sidebar-collapsed')??false;document.body.classList.toggle('sidebar-collapsed',collapsed);collapse.setAttribute('aria-pressed',String(collapsed));collapse.setAttribute('aria-label',collapsed?'Expandir menu lateral':'Recolher menu lateral');});
 const themeSelect=document.getElementById('themeSelect');
 const applyTheme=theme=>{document.documentElement.dataset.theme=theme;document.body.dataset.theme=theme;document.body.classList.toggle('dark',theme==='escuro');};
 const savedTheme=localStorage.getItem('barbalho-theme');
 if(savedTheme==='claro'||savedTheme==='escuro'){themeSelect.value=savedTheme;applyTheme(savedTheme);}
 document.getElementById('applyTheme')?.addEventListener('click',()=>{const theme=themeSelect.value;if(!['claro','escuro'].includes(theme))return;applyTheme(theme);localStorage.setItem('barbalho-theme',theme);const feedback=document.getElementById('themeFeedback');if(feedback)feedback.textContent='Tema aplicado com sucesso.';});
 themeSelect?.addEventListener('change',()=>{const feedback=document.getElementById('themeFeedback');if(feedback)feedback.textContent='Clique em Aplicar tema para salvar.';});
 window.lucide?.createIcons();
 open('inicio');
})();
