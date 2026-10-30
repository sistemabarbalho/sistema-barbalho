// Interface apenas. Sem login, Firebase, API, persistencia ou banco de dados.
(() => {

// O controle de arquivo precisa responder mesmo se os modulos Firebase falharem.
// Esta parte roda no script comum, independente da autenticacao.
 const photoInput=document.getElementById('profilePhoto');
 const photoButton=document.getElementById('saveProfilePhoto');
 const photoStatus=document.getElementById('profileFeedback');
 const informPhoto=message=>{
  if(photoStatus){photoStatus.textContent=message;photoStatus.hidden=false;}
 };
 const MAX_PROFILE_FILE_BYTES=100*1024*1024; // 100 MB originais; imagem salva continua compactada
 const validPhoto=file=>file
  && (['image/jpeg','image/png','image/webp'].includes(file.type)
   || /\.(jpe?g|png|webp)$/i.test(file.name))
  && file.size<=MAX_PROFILE_FILE_BYTES;
 photoInput?.addEventListener('change',()=>{
  const file=photoInput.files?.[0];
  if(!file){informPhoto('Nenhuma imagem selecionada.');return;}
  if(!validPhoto(file)){informPhoto('Escolha uma foto JPG, PNG ou WebP com ate 100 MB.');return;}
  informPhoto('Foto selecionada: '+file.name+'. Clique em Salvar foto.');
 });
 photoButton?.addEventListener('click',async()=>{
  // Feedback imediato, antes de qualquer tentativa de rede.
  informPhoto('Clique reconhecido. Preparando o salvamento...');
  const file=photoInput?.files?.[0];
  if(!validPhoto(file)){
   informPhoto('Selecione uma foto JPG, PNG ou WebP de ate 100 MB antes de salvar.');
   return;
  }
  const save=window.BarbalhoPhoto?.save;
  if(typeof save!=='function'){
   informPhoto('O modulo de fotos nao carregou neste navegador. Atualize com Ctrl+F5 e verifique bloqueadores de scripts do Firebase.');
   return;
  }
  try{await save();}
  catch(err){informPhoto('Falha inesperada ao iniciar o salvamento da foto. Atualize a pagina e tente novamente.');}
 });

 // Interface de consulta: sem registros, sem busca no banco e sem dados fictícios.
 const debtForm=document.getElementById('debtSearchForm');
 const debtFeedback=document.getElementById('debtFeedback');
 const emptyMessage='Ainda não existem devedores cadastrados. Os resultados aparecerão aqui quando os registros forem adicionados.';
 debtForm?.addEventListener('submit',event=>{
  event.preventDefault();
  if(!debtFeedback)return;
  const start=document.getElementById('debtInicio')?.value;
  const end=document.getElementById('debtFim')?.value;
  if(start && end && start>end){
   debtFeedback.textContent='A data inicial não pode ser posterior à data final. Ajuste o período informado.';
   document.getElementById('debtInicio')?.focus();
   return;
  }
  const hasFilter=[...new FormData(debtForm).values()].some(value=>String(value).trim()!=='');
  debtFeedback.textContent=hasFilter
   ?'Os filtros foram preenchidos, mas ainda não existem devedores cadastrados. A consulta estará disponível quando os registros forem adicionados.'
   :'Preencha pelo menos um campo para buscar. Ainda não há registros cadastrados.';
 });
 debtForm?.addEventListener('reset',()=>{if(debtFeedback)debtFeedback.textContent=emptyMessage;});
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
