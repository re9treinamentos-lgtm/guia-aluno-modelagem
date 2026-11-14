/* Login do aluno e progresso na nuvem (Firebase, plano gratuito Spark).
   Carregado pelo site do aluno e pelo painel admin. */
(function(){
  const V = "10.12.2", BASE = "https://www.gstatic.com/firebasejs/" + V + "/";
  let app = null, auth = null, db = null, A = null, F = null, cfgKey = "";
  const back = () => location.origin + location.pathname;

  async function init(cfg){
    const key = [cfg.apiKey, cfg.projectId].join("|");
    if (app && key === cfgKey) return;
    const [ap, au, fs] = await Promise.all([ import(BASE+"firebase-app.js"), import(BASE+"firebase-auth.js"), import(BASE+"firebase-firestore.js") ]);
    A = au; F = fs; cfgKey = key;
    app = ap.initializeApp({ apiKey:cfg.apiKey, authDomain:cfg.authDomain, projectId:cfg.projectId, appId:cfg.appId }, "mq-" + Date.now());
    auth = au.getAuth(app);
    try { await au.getRedirectResult(auth); } catch(e){}
    db = fs.getFirestore(app);
  }
  const lower = e => String(e||"").trim().toLowerCase();
  const MSG = {
    "auth/invalid-credential":"E-mail ou senha incorretos.",
    "auth/wrong-password":"E-mail ou senha incorretos.",
    "auth/user-not-found":"Não encontramos acesso com este e-mail. Use “Primeiro acesso” para criar sua senha.",
    "auth/invalid-login-credentials":"E-mail ou senha incorretos.",
    "auth/email-already-in-use":"Já existe acesso com este e-mail. Use “Entrar” ou “Esqueci a senha”.",
    "auth/weak-password":"A senha precisa ter pelo menos 6 caracteres.",
    "auth/invalid-email":"Confira o e-mail digitado.",
    "auth/missing-password":"Digite a senha.",
    "auth/too-many-requests":"Muitas tentativas. Aguarde alguns minutos e tente de novo.",
    "auth/network-request-failed":"Sem conexão. Confira sua internet.",
    "auth/popup-closed-by-user":"A janela do Google foi fechada antes de concluir.",
    "auth/cancelled-popup-request":"A janela do Google foi fechada antes de concluir.",
    "auth/unauthorized-domain":"Este endereço não está autorizado no Firebase. No console do Firebase, adicione o domínio do site em Authentication → Configurações → Domínios autorizados.",
    "auth/operation-not-allowed":"Este tipo de login não está ativado no Firebase (Authentication → Método de login).",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.":"A configuração do Firebase está incorreta (apiKey).",
    "permission-denied":"Sem permissão. Confira se as regras do Firestore foram publicadas e se este e-mail é de administrador (e confirmado).",
    "unavailable":"Servidor indisponível no momento. Tente de novo."
  };
  const erro = e => (e && (MSG[e.code] || MSG[String(e.code||"").replace("firestore/","")])) || (e && e.message) || "Algo deu errado. Tente de novo.";

  window.MQNuvem = {
    init, erro, lower,
    onUser: cb => A.onAuthStateChanged(auth, cb),
    user: () => auth && auth.currentUser,
    entrar: (email, senha) => A.signInWithEmailAndPassword(auth, lower(email), senha),
    async criar(email, senha){
      const c = await A.createUserWithEmailAndPassword(auth, lower(email), senha);
      try { await A.sendEmailVerification(c.user, { url: back() }); } catch(e){}
      return c;
    },
    async google(){
      const p = new A.GoogleAuthProvider(); p.setCustomParameters({ prompt:"select_account" });
      try { return await A.signInWithPopup(auth, p); }
      catch(e){ if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-environment") return A.signInWithRedirect(auth, p); throw e; }
    },
    reenviar: () => A.sendEmailVerification(auth.currentUser, { url: back() }),
    async recarregar(){ await auth.currentUser.reload(); try { await auth.currentUser.getIdToken(true); } catch(e){} return auth.currentUser; },
    esqueci: email => A.sendPasswordResetEmail(auth, lower(email)),
    sair: () => A.signOut(auth),
    async liberado(email){ const s = await F.getDoc(F.doc(db, "alunos", lower(email))); return s.exists(); },
    async lerProgresso(uid){ const s = await F.getDoc(F.doc(db, "progresso", uid)); return s.exists() ? s.data() : null; },
    salvarProgresso: (uid, data) => F.setDoc(F.doc(db, "progresso", uid), Object.assign({}, data, { atualizado: F.serverTimestamp() })),
    async listarAlunos(){ const q = await F.getDocs(F.collection(db, "alunos")); return q.docs.map(d => Object.assign({ email:d.id }, d.data())); },
    async listarProgresso(){ const q = await F.getDocs(F.collection(db, "progresso")); return q.docs.map(d => Object.assign({ uid:d.id }, d.data())); },
    async adicionarAlunos(emails){
      for (let i = 0; i < emails.length; i += 400){
        const b = F.writeBatch(db);
        emails.slice(i, i+400).forEach(e => b.set(F.doc(db, "alunos", lower(e)), { adicionado: F.serverTimestamp() }));
        await b.commit();
      }
    },
    removerAluno: email => F.deleteDoc(F.doc(db, "alunos", lower(email))),
    data: v => v && typeof v.toDate === "function" ? v.toDate() : (v instanceof Date ? v : (v ? new Date(v) : null))
  };
})();
