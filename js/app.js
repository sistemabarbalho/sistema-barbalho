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

 // Busca real continua sem cadastros; modelo fictício é visualizado somente por ação explícita.
 const debtForm=document.getElementById('debtSearchForm');
 const debtResults=document.querySelector('#page-pagina1 .debt-results');
 const debtFeedback=document.getElementById('debtFeedback');
 const debtValidation=document.getElementById('debtValidation');
 const debtDemoButton=document.getElementById('debtDemoToggle');
 const debtDemoResults=document.getElementById('debtDemoResults');
 const debtDetailOverlay=document.getElementById('debtDetailOverlay');
 const debtDetailClose=document.getElementById('debtCloseDetails');
 const debtDetailDone=document.getElementById('debtDoneDetails');
 let debtPreviousFocus=null;
 const emptyMessage='Ainda não existem devedores cadastrados. Os resultados aparecerão aqui quando os registros forem adicionados.';
 const showDebtValidation=message=>{
  if(!debtValidation)return;
  debtValidation.textContent=message;
  debtValidation.hidden=!message;
 };
 const hideDebtDemo=()=>{
  if(debtDemoResults)debtDemoResults.hidden=true;
  debtDemoButton?.setAttribute('aria-expanded','false');
 };
 const closeDebtDetails=()=>{
  if(!debtDetailOverlay || debtDetailOverlay.hidden)return;
  debtDetailOverlay.hidden=true;
  document.body.classList.remove('debt-dialog-open');
  if(debtPreviousFocus?.isConnected)debtPreviousFocus.focus();
  debtPreviousFocus=null;
 };
 const showDebtDetails=()=>{
  if(!debtDetailOverlay)return;
  debtPreviousFocus=document.activeElement;
  debtDetailOverlay.hidden=false;
  document.body.classList.add('debt-dialog-open');
  debtDetailClose?.focus();
 };
 debtDemoButton?.addEventListener('click',()=>{
  if(!debtDemoResults)return;
  const show=debtDemoResults.hidden;
  debtDemoResults.hidden=!show;
  debtDemoButton.setAttribute('aria-expanded',String(show));
  if(debtResults)debtResults.hidden=true;
  showDebtValidation('');
  if(show)debtDemoResults.scrollIntoView({behavior:'smooth',block:'nearest'});
 });
 document.getElementById('debtOpenDetails')?.addEventListener('click',showDebtDetails);
 debtDetailClose?.addEventListener('click',closeDebtDetails);
 debtDetailDone?.addEventListener('click',closeDebtDetails);
 debtDetailOverlay?.addEventListener('click',event=>{
  if(event.target===debtDetailOverlay)closeDebtDetails();
 });
 document.addEventListener('keydown',event=>{
  if(!debtDetailOverlay || debtDetailOverlay.hidden)return;
  if(event.key==='Escape'){event.preventDefault();closeDebtDetails();return;}
  if(event.key==='Tab'){
   const close=debtDetailClose,done=debtDetailDone;
   if(!close||!done)return;
   if(event.shiftKey && document.activeElement===close){event.preventDefault();done.focus();}
   else if(!event.shiftKey && document.activeElement===done){event.preventDefault();close.focus();}
  }
 });
 debtForm?.addEventListener('submit',event=>{
  event.preventDefault();
  hideDebtDemo();
  if(!debtResults||!debtFeedback)return;
  const start=document.getElementById('debtInicio')?.value;
  const end=document.getElementById('debtFim')?.value;
  if(start && end && start>end){
   debtResults.hidden=true;
   showDebtValidation('A data inicial não pode ser posterior à data final. Ajuste o período informado.');
   document.getElementById('debtInicio')?.focus();
   return;
  }
  const hasFilter=[...new FormData(debtForm).values()].some(value=>String(value).trim()!=='');
  if(!hasFilter){
   debtResults.hidden=true;
   showDebtValidation('Preencha pelo menos um campo para buscar.');
   return;
  }
  showDebtValidation('');
  debtFeedback.textContent='Nenhum cadastro encontrado. A consulta aos devedores estará disponível quando os registros forem adicionados ao sistema.';
  debtResults.hidden=false;
 });
 debtForm?.addEventListener('reset',()=>{
  if(debtResults)debtResults.hidden=true;
  if(debtFeedback)debtFeedback.textContent=emptyMessage;
  hideDebtDemo();
  closeDebtDetails();
  showDebtValidation('');
 });
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
