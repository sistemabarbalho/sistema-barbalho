import {initializeApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getFirestore,doc,getDoc,getDocFromServer,setDoc} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,signOut,updateProfile,sendEmailVerification,setPersistence,browserLocalPersistence,browserSessionPersistence} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
const $=id=>document.getElementById(id);
const config=window.BARBALHO_FIREBASE_CONFIG;
const ready=config && ["apiKey","authDomain","projectId","appId"].every(k=>config[k]&&!String(config[k]).startsWith("INSERIR_"));
const authView=document.createElement("div");
authView.id="authView";authView.className="auth-view";
authView.innerHTML=`<section class="auth-card"><div class="auth-logo">B</div><h1>Sistema Barbalho</h1><p class="auth-subtitle">Entre na sua conta para continuar</p><form id="loginForm" class="auth-form"><label>E-mail<input id="authEmail" type="email" autocomplete="email" required></label><label>Senha<input id="authPassword" type="password" minlength="6" autocomplete="current-password" required></label><label id="authNameWrap" hidden>Nome<input id="authName" type="text" autocomplete="name"></label><button class="auth-primary" id="submitAuth" type="submit">Entrar</button></form><label class="remember-option"><input type="checkbox" id="rememberAuth"> Manter conectado neste dispositivo</label><button class="auth-google" id="googleAuth" type="button">Continuar com Google</button><button class="auth-link" id="switchAuth" type="button">Não tem conta? Criar conta</button><p class="auth-error" id="authError" role="alert" aria-live="polite"></p><section id="verifyEmailPanel" class="verify-email-panel" hidden><strong>Confirme seu e-mail</strong><p>Enviamos um link de verificação. Confira seu e-mail antes de continuar.</p><button id="checkVerified" type="button">Já confirmei meu e-mail</button><button id="resendVerification" type="button">Reenviar link</button><button id="verifyLogout" type="button">Usar outra conta</button><p id="verifyStatus" role="status"></p></section></section>`;
document.body.prepend(authView);
const veil=document.createElement("div");veil.id="logoutConfirm";veil.className="confirm-overlay";veil.hidden=true;
veil.innerHTML=`<div class="confirm-card" role="dialog" aria-modal="true" aria-labelledby="logoutTitle"><h2 id="logoutTitle">Sair da conta?</h2><p>Tem certeza de que deseja sair do Sistema Barbalho?</p><div class="confirm-actions"><button type="button" id="cancelLogout">Cancelar</button><button type="button" id="confirmLogout">Sim, sair</button></div></div>`;
document.body.append(veil);
document.querySelector(".sidebar-footer")?.insertAdjacentHTML("beforeend",'<button type="button" class="logout-button" data-logout title="Sair da conta" aria-label="Sair da conta"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg><span class="logout-label">Sair da conta</span></button>');
const error=$("authError");const setError=t=>error.textContent=t;
let auth=null,db=null,register=false,lastFocus=null;
function showApp(user){const allowed=!!user && user.emailVerified; document.body.classList.toggle("authenticated",allowed);authView.hidden=allowed;$("verifyEmailPanel").hidden=(!user||allowed);$("loginForm").hidden=!!user&&!allowed;$("googleAuth").hidden=!!user&&!allowed;$("switchAuth").hidden=!!user&&!allowed;
 if(user){const display=user.displayName||user.email||"Usuário";const greeting=document.querySelector(".greeting-copy strong");if(greeting)greeting.textContent=display;const avatar=document.querySelector(".user-greeting .avatar");if(avatar){avatar.textContent=display[0].toUpperCase();avatar.style.backgroundImage="";} if(allowed)void loadProfilePhoto(user);}
}
function describe(e){const m={"auth/email-already-in-use":"E-mail já cadastrado.","auth/invalid-email":"E-mail inválido.","auth/invalid-credential":"E-mail ou senha incorretos.","auth/weak-password":"Escolha uma senha mais forte.","auth/popup-closed-by-user":"Entrada com Google cancelada.","auth/unauthorized-domain":"Domínio não autorizado no Firebase Authentication.","auth/network-request-failed":"Falha de conexão. Tente novamente."};return m[e?.code]||"Não foi possível autenticar. Confira os dados e tente novamente.";}
$("switchAuth").onclick=()=>{register=!register;$("authNameWrap").hidden=!register;$("authName").required=register;$("submitAuth").textContent=register?"Criar conta":"Entrar";$("switchAuth").textContent=register?"Já tem conta? Entrar":"Não tem conta? Criar conta";$("authPassword").autocomplete=register?"new-password":"current-password";setError("");};
if(!ready){setError("Configuração do Firebase pendente. O administrador deve adicionar os dados do aplicativo Web em js/firebase-config.js.");$("submitAuth").disabled=true;$("googleAuth").disabled=true;}
else{
 try{const app=initializeApp(config);auth=getAuth(app);db=getFirestore(app);onAuthStateChanged(auth,user=>showApp(user));getRedirectResult(auth).catch(e=>setError(describe(e)));}
 catch(e){setError("Erro ao iniciar o Firebase. Confira a configuração.");$("submitAuth").disabled=true;$("googleAuth").disabled=true;}
}
$("loginForm").onsubmit=async e=>{e.preventDefault();if(!auth)return;setError("");$("submitAuth").disabled=true;try{await setPersistence(auth,$("rememberAuth").checked?browserLocalPersistence:browserSessionPersistence);const email=$("authEmail").value.trim();const pass=$("authPassword").value;if(register){const c=await createUserWithEmailAndPassword(auth,email,pass);const name=$("authName").value.trim();if(name)await updateProfile(c.user,{displayName:name});await sendEmailVerification(c.user);}else await signInWithEmailAndPassword(auth,email,pass);}catch(err){setError(describe(err));}finally{$("submitAuth").disabled=false;}};
$("googleAuth").onclick=async()=>{if(!auth)return;setError("");try{await setPersistence(auth,$("rememberAuth").checked?browserLocalPersistence:browserSessionPersistence);await signInWithPopup(auth,new GoogleAuthProvider());}catch(e){if(e.code==="auth/popup-blocked"||e.code==="auth/operation-not-supported-in-this-environment"){try{await signInWithRedirect(auth,new GoogleAuthProvider());}catch(e2){setError(describe(e2));}}else setError(describe(e));}};
const close=()=>{veil.hidden=true;lastFocus?.focus();};
document.querySelectorAll("[data-logout]").forEach(b=>b.addEventListener("click",()=>{lastFocus=b;veil.hidden=false;$("cancelLogout").focus();}));
$("cancelLogout").onclick=close;
veil.addEventListener("click",e=>{if(e.target===veil)close();});
document.addEventListener("keydown",e=>{if(!veil.hidden&&e.key==="Escape")close();});
$("confirmLogout").onclick=async()=>{if(!auth)return;try{await signOut(auth);close();$("authPassword").value="";}catch(e){close();setError(describe(e));}};

$("checkVerified").onclick=async()=>{if(!auth?.currentUser)return;try{await auth.currentUser.reload();showApp(auth.currentUser);if(!auth.currentUser.emailVerified)$("verifyStatus").textContent="E-mail ainda não confirmado. Confira sua caixa de entrada."; }catch(e){$("verifyStatus").textContent=describe(e);}};
let lastResend=0;
$("resendVerification").onclick=async()=>{if(!auth?.currentUser)return;if(Date.now()-lastResend<60000){$("verifyStatus").textContent="Aguarde um minuto antes de solicitar novamente.";return;}try{await sendEmailVerification(auth.currentUser);lastResend=Date.now();$("verifyStatus").textContent="Link enviado. Confira também o spam."; }catch(e){$("verifyStatus").textContent=describe(e);}};
$("verifyLogout").onclick=async()=>{if(auth)await signOut(auth);};

let profileRequest=0;
function renderProfileImage(image) {
 const avatar=document.querySelector(".user-greeting .avatar");
 if(!avatar)return;
 avatar.textContent="";
 avatar.style.backgroundImage='url("'+image+'")';
 avatar.style.backgroundSize="cover";
 avatar.style.backgroundPosition="center";
}
async function loadProfilePhoto(user){
 const request=++profileRequest;
 if(!db||!user?.emailVerified)return;
 try{
  const snap=await getDoc(doc(db,"usuarios",user.uid,"perfil","foto"));
  if(request!==profileRequest||auth.currentUser?.uid!==user.uid)return;
  const image=snap.data()?.imagem;
  if(typeof image==="string"&&image.startsWith("data:image/jpeg;base64,")&&image.length<200000){
   renderProfileImage(image);
  }
 }catch(e){
  const msg=$("profileFeedback");
  if(msg)msg.textContent="Não foi possível carregar a foto: "+photoError(e);
 }
}
function photoError(e){
 switch(e?.code){
  case "permission-denied":return "acesso negado. Verifique as regras do Firestore e a conta conectada.";
  case "unauthenticated":return "sessão expirada. Entre novamente.";
  case "unavailable":return "sem conexão com o Firestore. Tente novamente.";
  case "resource-exhausted":return "limite temporário de operações atingido.";
  default:return "falha de comunicação com o banco. Tente novamente.";
 }
}
const MAX_PROFILE_FILE_BYTES=100*1024*1024;
const compressImage=file=>new Promise((resolve,reject)=>{
 const url=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{try{
  const canvas=document.createElement("canvas");canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext("2d"),s=Math.min(img.width,img.height);
  ctx.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,256,256);
  URL.revokeObjectURL(url);resolve(canvas.toDataURL("image/jpeg",0.7));
 }catch(e){URL.revokeObjectURL(url);reject(e);}};
 img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Imagem inválida"));};
 img.src=url;
});
async function saveProfilePhoto(){
 const statusNow=$("profileFeedback");
 if(statusNow){statusNow.textContent="Botão acionado. Verificando arquivo e conexão...";statusNow.hidden=false;statusNow.style.display="block";}

 const user=auth?.currentUser,file=$("profilePhoto")?.files?.[0],status=$("profileFeedback"),btn=$("saveProfilePhoto");
 if(!db){status.textContent="O Firestore nao foi inicializado. Verifique a conexao e recarregue a pagina.";return;}
 if(!user?.emailVerified){status.textContent="Confirme seu e-mail antes de salvar.";return;}
 if(!file||!(["image/jpeg","image/png","image/webp"].includes(file.type)||/\.(jpe?g|png|webp)$/i.test(file.name))||file.size>MAX_PROFILE_FILE_BYTES){status.textContent="Selecione JPG, PNG ou WebP de até 100 MB.";return;}
 btn.disabled=true;status.textContent="Salvando foto no banco...";
 try{
  await user.getIdToken(true); // atualiza as credenciais antes da operação
  const imagem=await compressImage(file);
  if(imagem.length>=200000)throw new Error("photo-too-large");
  const ref=doc(db,"usuarios",user.uid,"perfil","foto");
  await setDoc(ref,{imagem});
  // Após a gravação bem-sucedida, o avatar só é atualizado se a conta continua igual.
  if(auth.currentUser?.uid!==user.uid)throw new Error("account-changed");
  profileRequest++;
  renderProfileImage(imagem);
  status.textContent="Foto salva nesta conta. Verificando sincronização...";
  try{
   const confirmacao=await getDocFromServer(ref);
   if(confirmacao.data()?.imagem===imagem){
    status.textContent="Foto salva e sincronizada. Ela deve permanecer após atualizar a página.";
   }else{
    status.textContent="A foto foi enviada, mas a confirmação no banco não corresponde. Atualize a página para conferir.";
   }
  }catch(e){status.textContent="Foto enviada, mas não foi possível confirmar a leitura: "+photoError(e);}
 }catch(e){
  status.textContent=e?.message==="photo-too-large"?"A imagem compactada ficou grande demais. Tente outra foto.":e?.message==="account-changed"?"A conta mudou durante o envio. Faça login novamente.":"Não foi possível salvar: "+photoError(e);
 }finally{btn.disabled=false;}
}
// O botao e controlado pelo script comum para nunca ficar sem feedback.
window.BarbalhoPhoto=Object.freeze({save:saveProfilePhoto});
