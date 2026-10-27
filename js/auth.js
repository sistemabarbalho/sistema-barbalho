import {initializeApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
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
document.querySelector(".sidebar-footer")?.insertAdjacentHTML("beforeend",'<button type="button" class="logout-button" data-logout>Sair da conta</button>');
document.querySelector("#page-configuracoes .blank-panel")?.insertAdjacentHTML("beforeend",'<button type="button" class="logout-button" data-logout>Sair da conta</button>');
const error=$("authError");const setError=t=>error.textContent=t;
let auth=null,register=false, lastFocus=null;
function showApp(user){const allowed=!!user && user.emailVerified; document.body.classList.toggle("authenticated",allowed);authView.hidden=allowed;$("verifyEmailPanel").hidden=(!user||allowed);$("loginForm").hidden=!!user&&!allowed;$("googleAuth").hidden=!!user&&!allowed;$("switchAuth").hidden=!!user&&!allowed;
 if(user){const display=user.displayName||user.email||"Usuário";const greeting=document.querySelector(".greeting-copy strong");if(greeting)greeting.textContent=display;const avatar=document.querySelector(".user-greeting .avatar");if(avatar)avatar.textContent=display[0].toUpperCase();}
}
function describe(e){const m={"auth/email-already-in-use":"E-mail já cadastrado.","auth/invalid-email":"E-mail inválido.","auth/invalid-credential":"E-mail ou senha incorretos.","auth/weak-password":"Escolha uma senha mais forte.","auth/popup-closed-by-user":"Entrada com Google cancelada.","auth/unauthorized-domain":"Domínio não autorizado no Firebase Authentication.","auth/network-request-failed":"Falha de conexão. Tente novamente."};return m[e?.code]||"Não foi possível autenticar. Confira os dados e tente novamente.";}
$("switchAuth").onclick=()=>{register=!register;$("authNameWrap").hidden=!register;$("authName").required=register;$("submitAuth").textContent=register?"Criar conta":"Entrar";$("switchAuth").textContent=register?"Já tem conta? Entrar":"Não tem conta? Criar conta";$("authPassword").autocomplete=register?"new-password":"current-password";setError("");};
if(!ready){setError("Configuração do Firebase pendente. O administrador deve adicionar os dados do aplicativo Web em js/firebase-config.js.");$("submitAuth").disabled=true;$("googleAuth").disabled=true;}
else{
 try{auth=getAuth(initializeApp(config));onAuthStateChanged(auth,user=>showApp(user));getRedirectResult(auth).catch(e=>setError(describe(e)));}
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
