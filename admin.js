/* ===================== PAINEL ADMIN · GUIA DO ALUNO ===================== */
(function(){
const $ = (s, el=document) => el.querySelector(s);
const DRAFT_KEY = "mq-admin-draft", PREV_KEY = "mq-preview-draft", GH_KEY = "mq-admin-github";
const RESERVED = ["inicio","quadro","exercicios","simulado","materiais","settings","sidebar","customize","upgrade","downloads"];
const ICONS = [["flag","Bandeira"],["grid","Grade"],["scale","Balança"],["loop","Ciclo"],["gift","Presente"],["book","Livro"],["target","Alvo"],["play","Play"],["list","Lista"],["pen","Caneta"],["folder","Pasta"],["spark","Brilho"]];
const PRESETS = [
  ["Modelagem (dourado)", {escuro:"#0b1022",destaque:"#f4b324",fundo:"#f6f4ee",cartao:"#ffffff",texto:"#171b2b"}],
  ["Roxo", {escuro:"#140c26",destaque:"#a76bff",fundo:"#f8f6fc",cartao:"#ffffff",texto:"#1b1530"}],
  ["Verde", {escuro:"#0b1f1a",destaque:"#2bd48a",fundo:"#f3f7f4",cartao:"#ffffff",texto:"#13221d"}],
  ["Azul", {escuro:"#08162e",destaque:"#3d8bff",fundo:"#f3f6fb",cartao:"#ffffff",texto:"#111a2e"}],
  ["Vermelho", {escuro:"#1c0b0e",destaque:"#ff5a4e",fundo:"#faf5f4",cartao:"#ffffff",texto:"#241316"}],
  ["Laranja", {escuro:"#151012",destaque:"#ff7a1f",fundo:"#f8f5f1",cartao:"#ffffff",texto:"#1e1714"}]
];

let C = null;          // conteúdo em edição
let published = "";    // JSON publicado (para comparar)
let tab = "geral", curLesson = null;
let dirtyTimer = null;

/* ---------------- helpers de DOM ---------------- */
function h(tag, props, ...kids){
  const el = document.createElement(tag);
  if (props) for (const [k,v] of Object.entries(props)){
    if (v===undefined || v===null || v===false) continue;
    if (k==="class") el.className = v;
    else if (k==="style") el.setAttribute("style", v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k==="html") el.innerHTML = v;
    else if (k in el && k!=="list") { try { el[k] = v; } catch(e){ el.setAttribute(k,v); } }
    else el.setAttribute(k, v);
  }
  kids.flat(Infinity).forEach(k => { if (k===null||k===undefined||k===false) return; el.appendChild(typeof k==="string"||typeof k==="number" ? document.createTextNode(String(k)) : k); });
  return el;
}
function field(label, input, hint){ return h("label",{class:"field"}, h("span",null,label), input, hint?h("small",null,hint):null); }
function txt(obj, key, label, opt={}){
  const el = opt.area
    ? h("textarea",{rows:opt.rows||3, placeholder:opt.ph||"", oninput:e=>{ obj[key]=e.target.value; changed(opt.live); }})
    : h("input",{type:opt.type||"text", placeholder:opt.ph||"", oninput:e=>{ obj[key]= opt.type==="number" ? +e.target.value : e.target.value; changed(opt.live); }});
  el.value = obj[key] ?? "";
  return field(label, el, opt.hint);
}
function lines(obj, key, label, hint){
  const el = h("textarea",{rows:Math.max(3,(obj[key]||[]).length+1), oninput:e=>{ obj[key]=e.target.value.split("\n").map(s=>s.trim()).filter(Boolean); changed(); }});
  el.value = (obj[key]||[]).join("\n");
  return field(label, el, hint || "Um item por linha.");
}
function chk(obj, key, label, opt={}){
  const inv = opt.invertFalse; // true = considera ausente como ligado
  const cb = h("input",{type:"checkbox", onchange:e=>{ obj[key]=e.target.checked; changed(); if(opt.rerender) render(); }});
  cb.checked = inv ? obj[key]!==false : !!obj[key];
  return h("label",{class:"check"}, cb, label);
}
function sel(obj, key, label, options, opt={}){
  const s = h("select",{onchange:e=>{ obj[key]=e.target.value; changed(); if(opt.rerender) render(); }}, options.map(([v,t])=>h("option",{value:v},t)));
  s.value = obj[key] ?? "";
  return field(label, s, opt.hint);
}
function color(obj, key, label){
  const t = h("input",{type:"text"}), c = h("input",{type:"color"});
  t.value = c.value = obj[key];
  c.oninput = e => { obj[key]=e.target.value; t.value=e.target.value; changed(true); };
  t.oninput = e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)){ obj[key]=e.target.value; c.value=e.target.value; changed(true); } };
  return field(label, h("div",{class:"colorrow"}, c, t));
}
function btn(label, onclick, cls="btn sm", title){ return h("button",{class:cls, onclick, title, type:"button"}, label); }
function move(arr, i, d){ const j=i+d; if (j<0||j>=arr.length) return; [arr[i],arr[j]]=[arr[j],arr[i]]; changed(); render(); }
function itemHead(title, arr, i, extra){
  return h("div",{class:"item-head"}, h("b",null,title),
    extra||null,
    btn("↑",()=>move(arr,i,-1),"btn ic sm","Subir"), btn("↓",()=>move(arr,i,1),"btn ic sm","Descer"),
    btn("✕", async()=>{ if (await ask("Excluir este item?","Essa ação pode ser desfeita descartando o rascunho, desde que você ainda não tenha publicado.","Excluir")){ arr.splice(i,1); changed(); render(); } },"btn ic sm danger","Excluir"));
}
function listEditor(arr, titleOf, body, make, addLabel){
  return h("div",null,
    arr.length ? arr.map((it,i)=>h("div",{class:"item"}, itemHead(titleOf(it,i), arr, i), body(it,i))) : h("div",{class:"empty"},"Nada aqui ainda."),
    btn("+ "+addLabel, ()=>{ arr.push(make()); changed(); render(); }, "btn"));
}
const uid = p => p + Math.random().toString(36).slice(2,8);
const slug = s => String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "aula";
function toast(msg){ document.querySelectorAll(".toast").forEach(x=>x.remove()); const t=h("div",{class:"toast"},msg); document.body.appendChild(t); setTimeout(()=>t.remove(),2600); }
function ask(title, text, okLabel="Confirmar", extra){
  return new Promise(res => {
    const bg = h("div",{class:"modal-bg"});
    const close = v => { bg.remove(); res(v); };
    bg.appendChild(h("div",{class:"modal"}, h("h3",null,title), text?h("p",null,text):null, extra||null,
      h("div",{class:"acts"}, btn("Cancelar",()=>close(false),"btn"), btn(okLabel,()=>close(true),"btn pri"))));
    document.body.appendChild(bg);
  });
}
function imgToDataURL(file, maxW, maxH, type="image/jpeg", q=.82){
  return new Promise((res,rej) => {
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => {
      const r = Math.min(1, maxW/im.width, maxH/im.height);
      const cv = document.createElement("canvas"); cv.width = Math.round(im.width*r); cv.height = Math.round(im.height*r);
      cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height); res(cv.toDataURL(type,q)); };
      im.onerror = rej; im.src = fr.result; };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}

/* ---------------- estado ---------------- */
function normalize(c){
  c.config = c.config || {}; const cf = c.config;
  cf.marca = Object.assign({nome:"",sub:"",rotulo:"GUIA DO ALUNO",logo:"",tituloPagina:"Guia do Aluno"}, cf.marca);
  cf.tema = Object.assign({escuro:"#0b1022",destaque:"#f4b324",fundo:"#f6f4ee",cartao:"#ffffff",texto:"#171b2b",acerto:"#17905a",erro:"#cf3f30",fonteTitulo:"Oswald",fonteTexto:"Manrope",raio:18,tituloMaiusculo:true}, cf.tema);
  cf.home = Object.assign({eyebrow:"",titulo:"",tituloDestaque:"",texto:"",botao:"Começar",secoes:{}}, cf.home); cf.home.secoes = cf.home.secoes||{};
  cf.menu = cf.menu || {}; cf.acesso = Object.assign({ativo:false,hash:"",titulo:"",texto:"",linkAjuda:"",tituloLogin:"Entre com o e-mail da compra",textoLogin:"Seu progresso fica salvo na sua conta e acompanha você em qualquer aparelho."}, cf.acesso);
  if (!cf.acesso.modo) cf.acesso.modo = cf.acesso.ativo ? "codigo" : "aberto";
  cf.nuvem = Object.assign({apiKey:"",authDomain:"",projectId:"",appId:"",listaCompradores:false,google:true,admins:[],conviteHash:""}, cf.nuvem);
  if (!cf.nuvem.entrada) cf.nuvem.entrada = cf.nuvem.listaCompradores ? "lista" : "convite";
  ["modulos","aulas","padroes","treino","rotina","glossario"].forEach(k => c[k] = c[k]||[]);
  c.materiais = c.materiais || {}; c.materiais.bonus = c.materiais.bonus || {ativo:false,pilares:[]}; c.materiais.bonus.pilares = c.materiais.bonus.pilares||[];
  c.materiais.itens = c.materiais.itens||[]; c.materiais.rotinaEstudo = c.materiais.rotinaEstudo||[];
  c.aulas.forEach(l => { ["antes","check","passos","q","downloads"].forEach(k=>l[k]=l[k]||[]); l.q.forEach(q=>{ if(!q.id) q.id=uid("q"); }); });
  c.treino.forEach(q=>{ if(!q.id) q.id=uid("d"); });
  return c;
}
const json = () => JSON.stringify(C, null, 1);
function changed(liveOnly){
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), content: C })); }
  catch(e){ toast("Rascunho grande demais para salvar no navegador. Publique ou exporte para não perder."); }
  setStatus();
  clearTimeout(dirtyTimer); dirtyTimer = setTimeout(pushPreview, liveOnly ? 120 : 400);
}
function setStatus(){
  const s = $("#status"), dirty = json() !== published;
  s.className = "status " + (dirty ? "dirty" : "ok");
  s.textContent = dirty ? "Rascunho não publicado" : "Tudo publicado";
}

/* ---------------- prévia ---------------- */
let frameReady = false;
function previewHash(){
  if (tab==="aulas" && curLesson) return curLesson;
  return ({padroes:"quadro",treino:"quadro",materiais:"materiais",glossario:"materiais"})[tab] || "inicio";
}
function pushPreview(){
  const f = $("#frame"); if (!f.contentWindow || !$("#work").classList.contains("split")) return;
  try { f.contentWindow.postMessage({ type:"mq-preview", content: JSON.parse(json()), keepScroll:true, hash: previewHash() }, "*"); } catch(e){}
}
window.addEventListener("message", ev => { if (ev.data && ev.data.type==="mq-ready"){ frameReady = true; setTimeout(pushPreview,50); } });
function togglePreview(force){
  const w = $("#work"); const on = force!==undefined ? force : !w.classList.contains("split");
  w.classList.toggle("split", on);
  $("#btnPrev").classList.toggle("pri", on);
  if (on){ const f=$("#frame"); if (!f.src) f.src = "index.html#"+previewHash(); else pushPreview(); }
  try{ localStorage.setItem("mq-admin-prev", on?"1":"0"); }catch(e){}
}

/* ---------------- abas ---------------- */
const TABS = [
  ["sec","Início"],["geral","Visão geral"],
  ["sec","Aparência"],["design","Marca e design"],["home","Página inicial"],
  ["sec","Conteúdo"],["modulos","Módulos"],["aulas","Aulas e exercícios"],["padroes","Quadro de padrões"],["treino","Treino do quadro"],["materiais","Materiais"],["glossario","Glossário"],["ia","Importar questões (PDF)"],
  ["sec","Alunos"],["acesso","Acesso e login"],["links","Links para a Memberkit"],["alunos","Alunos e progresso"],["sec","Configuração"],["publicar","Publicar e backup"]
];
function renderTabs(){
  const counts = { modulos:C.modulos.length, aulas:C.aulas.length, padroes:C.padroes.length, treino:C.treino.length, glossario:C.glossario.length };
  $("#tabs").replaceChildren(...TABS.map(([id,t]) => id==="sec" ? h("div",{class:"tabsec"},t)
    : h("button",{class:"tab"+(tab===id?" on":""), onclick:()=>{ tab=id; render(); window.scrollTo(0,0); if ($("#work").classList.contains("split")) pushPreview(); }}, t, counts[id]!==undefined?h("span",{class:"n"},counts[id]):null)));
}
function render(){
  renderTabs();
  const t = TABS.find(x=>x[0]===tab); $("#ttl").textContent = t ? t[1] : "";
  const ed = $("#ed"); ed.replaceChildren(VIEWS[tab]());
  setStatus();
}

/* ---------------- VIEWS ---------------- */
const VIEWS = {};

VIEWS.geral = () => {
  const nq = C.aulas.reduce((a,l)=>a+l.q.length,0);
  const gh = ghCfg();
  return h("div",null,
    h("h2",{class:"pagett"},"Visão geral"),
    h("p",{class:"pagesub"},"Aqui você edita todo o guia do aluno: textos, aulas, exercícios, estrutura e visual. As mudanças ficam num rascunho neste navegador e só chegam aos alunos quando você clica em Publicar."),
    h("div",{class:"stats"},
      [[C.modulos.length,"módulos"],[C.aulas.length,"aulas"],[nq,"exercícios"],[C.padroes.length,"padrões"]].map(([n,l])=>h("div",{class:"stat"},h("b",null,n),h("small",null,l)))),
    !gh.token ? h("div",{class:"note"}, "Para publicar direto daqui, configure uma vez a conexão com o GitHub na aba ", h("b",null,"Publicar e backup"), ".") : h("div",{class:"note ok"},"Conexão com o GitHub configurada: ", h("b",null,gh.owner+"/"+gh.repo), "."),
    h("div",{class:"card"}, h("h3",null,"Como editar"),
      h("ol",{class:"steps"},
        h("li",null,h("b",null,"Ligue a prévia ao vivo"), " (botão no topo) para ver o site do aluno mudando enquanto você edita."),
        h("li",null,h("b",null,"Marca e design:"), " nome, logo, cores, fontes e cantos."),
        h("li",null,h("b",null,"Módulos e aulas:"), " crie, reordene, mova aulas entre módulos e edite roteiros e exercícios."),
        h("li",null,h("b",null,"Acesso dos alunos:"), " ative um código para só quem comprou entrar."),
        h("li",null,h("b",null,"Publicar:"), " envia o conteúdo para o site. Os alunos veem a atualização em 1 a 2 minutos."))),
    h("div",{class:"card"}, h("h3",null,"Atalhos"),
      h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},
        btn("+ Nova aula",()=>{ tab="aulas"; newLesson(); },"btn"), btn("Mudar cores",()=>{ tab="design"; render(); },"btn"), btn("Editar página inicial",()=>{ tab="home"; render(); },"btn"), btn("Exportar backup",exportJSON,"btn"))));
};

VIEWS.design = () => {
  const mk = C.config.marca, tm = C.config.tema;
  const logoInput = h("input",{type:"file",accept:"image/*",style:"display:none",onchange:async e=>{ const f=e.target.files[0]; if(!f) return; mk.logo = await imgToDataURL(f, 400, 160, "image/png"); changed(); render(); }});
  return h("div",null,
    h("h2",{class:"pagett"},"Marca e design"),
    h("p",{class:"pagesub"},"Mude o visual do site inteiro. Os tons mais claros e mais escuros são calculados a partir das cores que você escolher."),
    h("div",{class:"card"}, h("h3",null,"Marca"),
      h("div",{class:"grid2"}, txt(mk,"nome","Nome (destaque)",{live:true}), txt(mk,"sub","Subtítulo",{live:true}), txt(mk,"rotulo","Rótulo do menu",{live:true}), txt(mk,"tituloPagina","Título da aba do navegador",{live:true})),
      field("Logo", h("div",{class:"logo-prev"}, mk.logo?h("img",{src:mk.logo}):h("span",{class:"hint"},"Sem logo: usamos o ícone padrão."), logoInput, btn("Enviar imagem",()=>logoInput.click(),"btn"), mk.logo?btn("Remover",()=>{ mk.logo=""; changed(); render(); },"btn danger"):null), "PNG com fundo transparente fica melhor. A imagem é reduzida automaticamente.")),
    h("div",{class:"card"}, h("h3",null,"Paletas prontas"),
      h("div",{class:"presets"}, PRESETS.map(([n,p])=>h("button",{class:"preset",type:"button",onclick:()=>{ Object.assign(tm,p); changed(); render(); }}, h("i",{style:`background:${p.destaque};box-shadow:inset 0 0 0 4px ${p.escuro}`}), n)))),
    h("div",{class:"card"}, h("h3",null,"Cores"),
      h("div",{class:"grid3"}, color(tm,"escuro","Escuro (menu e destaques)"), color(tm,"destaque","Cor de destaque"), color(tm,"fundo","Fundo da página"), color(tm,"cartao","Fundo dos cartões"), color(tm,"texto","Texto"), color(tm,"acerto","Acerto (verde)"), color(tm,"erro","Erro (vermelho)"))),
    h("div",{class:"card"}, h("h3",null,"Tipografia e formas"),
      h("div",{class:"grid2"},
        sel(tm,"fonteTitulo","Fonte dos títulos", MQTema.FONTS.map(f=>[f,f])),
        sel(tm,"fonteTexto","Fonte do texto", MQTema.FONTS.map(f=>[f,f]))),
      field("Arredondamento dos cantos: "+tm.raio+"px", h("input",{type:"range",min:4,max:28,value:tm.raio,oninput:e=>{ tm.raio=+e.target.value; e.target.parentNode.querySelector("span").textContent="Arredondamento dos cantos: "+tm.raio+"px"; changed(true); }})),
      chk(tm,"tituloMaiusculo","Títulos de destaque em LETRAS MAIÚSCULAS"))
  );
};

VIEWS.home = () => {
  const H = C.config.home, M = C.config.menu;
  return h("div",null,
    h("h2",{class:"pagett"},"Página inicial"),
    h("p",{class:"pagesub"},"Os textos da capa, as seções que aparecem e os itens do menu."),
    h("div",{class:"card"}, h("h3",null,"Capa"),
      txt(H,"eyebrow","Linha acima do título",{live:true}),
      h("div",{class:"grid2"}, txt(H,"titulo","Título",{live:true}), txt(H,"tituloDestaque","Continuação do título (na cor de destaque)",{live:true})),
      txt(H,"texto","Texto de apresentação",{area:true,live:true}),
      txt(H,"botao","Texto do botão principal",{live:true})),
    h("div",{class:"card"}, h("h3",null,"Seções da página inicial"),
      chk(H.secoes,"progresso","Mostrar o cartão de progresso",{invertFalse:true}),
      chk(H.secoes,"rotina","Mostrar “Como assistir cada aula”",{invertFalse:true}),
      chk(H.secoes,"caminho","Mostrar “Seu caminho no curso” (módulos e aulas)",{invertFalse:true})),
    h("div",{class:"card"}, h("h3",null,"Ferramentas no menu"),
      chk(M,"quadro","Quadro de padrões",{invertFalse:true}), chk(M,"exercicios","Exercícios e desempenho",{invertFalse:true}),
      chk(M,"simulado","Simulado misto",{invertFalse:true}), chk(M,"materiais","Materiais e termos",{invertFalse:true})),
    h("div",{class:"card"}, h("h3",null,"“Como assistir cada aula” (passos que aparecem na capa e em todas as aulas)"),
      listEditor(C.rotina, (r,i)=>`Passo ${i+1} · ${r.t||""}`, r=>h("div",{class:"grid2"}, txt(r,"t","Título"), txt(r,"d","Descrição",{area:true,rows:2})), ()=>({t:"Novo passo",d:""}), "Adicionar passo")),
    h("div",{class:"card"}, h("h3",null,"Rodapé do menu"), txt(C.config,"rodape","Texto",{live:true}))
  );
};

VIEWS.modulos = () => h("div",null,
  h("h2",{class:"pagett"},"Módulos"),
  h("p",{class:"pagesub"},"A estrutura do curso. A ordem aqui é a ordem do menu e da página inicial. Para mover uma aula de módulo, use a aba Aulas."),
  C.modulos.map((m,i)=>{
    const n = C.aulas.filter(l=>l.mod===m.id).length;
    return h("div",{class:"item"},
      h("div",{class:"item-head"}, h("b",null,`${m.n||""} · ${m.nome||"Sem nome"} — ${n} aula${n!==1?"s":""}`),
        btn("↑",()=>move(C.modulos,i,-1),"btn ic sm"), btn("↓",()=>move(C.modulos,i,1),"btn ic sm"),
        btn("✕",()=>deleteModule(i),"btn ic sm danger","Excluir módulo")),
      h("div",{class:"grid3"}, txt(m,"n","Número",{live:true,hint:"Ex.: 01"}), txt(m,"nome","Nome",{live:true}), sel(m,"icon","Ícone",ICONS)),
      txt(m,"sub","Descrição curta",{live:true}));
  }),
  btn("+ Novo módulo",()=>{ C.modulos.push({ id:uid("m"), n:String(C.modulos.length+1).padStart(2,"0"), nome:"Novo módulo", sub:"", icon:"grid" }); changed(); render(); },"btn"));

async function deleteModule(i){
  const m = C.modulos[i], ls = C.aulas.filter(l=>l.mod===m.id);
  if (!ls.length){ if (await ask("Excluir o módulo “"+m.nome+"”?","Ele não tem aulas.","Excluir")){ C.modulos.splice(i,1); changed(); render(); } return; }
  const others = C.modulos.filter(x=>x!==m);
  const choice = { to: others[0] ? others[0].id : "__del" };
  const extra = h("div",null, sel(choice,"to","O que fazer com as "+ls.length+" aulas deste módulo?", [...others.map(o=>[o.id,"Mover para: "+o.n+" · "+o.nome]), ["__del","Excluir as aulas também"]]));
  if (!await ask("Excluir o módulo “"+m.nome+"”?", null, "Excluir módulo", extra)) return;
  if (choice.to==="__del") C.aulas = C.aulas.filter(l=>l.mod!==m.id); else ls.forEach(l=>l.mod=choice.to);
  C.modulos.splice(i,1); changed(); render();
}

/* ---- aulas ---- */
function newLesson(modId){
  const mod = modId || (C.modulos[0] && C.modulos[0].id);
  if (!mod){ toast("Crie um módulo primeiro."); tab="modulos"; render(); return; }
  let id = "aula-nova", k=1; while (C.aulas.some(l=>l.id===id)) id = "aula-nova-"+(++k);
  const l = { id, mod, sigla:"", grupo:"", label:"Aula", titulo:"Nova aula", curto:"", video:"", capa:"", pat:"", obj:"", dica:"", antes:[], downloads:[], passos:[{t:"Primeira etapa",d:[""]}], check:[], q:[] };
  const lastIdx = C.aulas.map(x=>x.mod).lastIndexOf(mod);
  C.aulas.splice(lastIdx+1, 0, l);
  curLesson = id; tab = "aulas"; changed(); render();
}
function lessonOrderMove(l, d){
  const same = C.aulas.filter(x=>x.mod===l.mod), i = same.indexOf(l), other = same[i+d];
  if (!other) return;
  const a = C.aulas.indexOf(l), b = C.aulas.indexOf(other);
  [C.aulas[a], C.aulas[b]] = [C.aulas[b], C.aulas[a]]; changed(); render();
}
VIEWS.aulas = () => {
  if (!curLesson || !C.aulas.find(l=>l.id===curLesson)) curLesson = C.aulas[0] && C.aulas[0].id;
  const list = h("div",{class:"llist"},
    C.modulos.map(m => [
      h("div",{class:"lmod"}, m.n+" · "+m.nome, h("span",{style:"flex:1"}), btn("+",()=>newLesson(m.id),"btn ic sm","Nova aula neste módulo")),
      C.aulas.filter(l=>l.mod===m.id).map(l => h("div",{class:"lrow"+(l.id===curLesson?" on":""), onclick:()=>{ curLesson=l.id; render(); pushPreview(); }}, h("span",{class:"sg"}, l.sigla || (String(l.label).match(/\d+/)||["•"])[0]), h("span",null,l.titulo)))
    ]),
    C.aulas.filter(l=>!C.modulos.some(m=>m.id===l.mod)).length ? h("div",{class:"lmod"},"Sem módulo") : null,
    C.aulas.filter(l=>!C.modulos.some(m=>m.id===l.mod)).map(l => h("div",{class:"lrow"+(l.id===curLesson?" on":""), onclick:()=>{ curLesson=l.id; render(); }}, h("span",{class:"sg"},"?"), h("span",null,l.titulo))));
  const l = C.aulas.find(x=>x.id===curLesson);
  return h("div",null,
    h("h2",{class:"pagett"},"Aulas e exercícios"),
    h("p",{class:"pagesub"},"Escolha uma aula na lista. Use + ao lado do módulo para criar uma aula nova."),
    h("div",{class:"lessons"}, list, l ? lessonEditor(l) : h("div",{class:"card empty"},"Nenhuma aula. Crie a primeira com o + ao lado de um módulo.")));
};
function lessonEditor(l){
  const capaIn = h("input",{type:"file",accept:"image/*",style:"display:none",onchange:async e=>{ const f=e.target.files[0]; if(!f) return; l.capa = await imgToDataURL(f, 960, 540); changed(); render(); }});
  const groups = [...new Set(C.aulas.filter(x=>x.mod===l.mod && x.grupo).map(x=>x.grupo))];
  const idIn = h("input",{type:"text", value:l.id, onchange:e=>{
    const v = slug(e.target.value);
    if (!v || RESERVED.includes(v) || C.aulas.some(x=>x!==l && x.id===v)){ toast("Endereço inválido ou já usado."); e.target.value = l.id; return; }
    C.padroes.forEach(p=>{ if (p.aula===l.id) p.aula=v; });
    l.id = v; curLesson = v; e.target.value = v; changed(); render(); }});
  return h("div",null,
    h("div",{class:"card"},
      h("h3",null,"Aula", h("span",{class:"sp"}), btn("↑ Subir",()=>lessonOrderMove(l,-1)), btn("↓ Descer",()=>lessonOrderMove(l,1)),
        btn("Duplicar",()=>{ const c = JSON.parse(JSON.stringify(l)); let id=l.id+"-copia",k=1; while(C.aulas.some(x=>x.id===id)) id=l.id+"-copia-"+(++k); c.id=id; c.titulo+=" (cópia)"; c.q.forEach(q=>q.id=uid("q")); C.aulas.splice(C.aulas.indexOf(l)+1,0,c); curLesson=id; changed(); render(); }),
        btn("Excluir",async()=>{ if(await ask("Excluir a aula “"+l.titulo+"”?","Os exercícios dela também serão removidos.","Excluir")){ C.aulas.splice(C.aulas.indexOf(l),1); curLesson=null; changed(); render(); } },"btn sm danger")),
      h("div",{class:"grid2"},
        sel(l,"mod","Módulo", C.modulos.map(m=>[m.id,m.n+" · "+m.nome]), {rerender:true}),
        field("Grupo dentro do módulo", (()=>{ const i=h("input",{type:"text",list:"grp-"+l.id,value:l.grupo||"",oninput:e=>{ l.grupo=e.target.value; changed(); }}); return h("div",null,i,h("datalist",{id:"grp-"+l.id},groups.map(g=>h("option",{value:g})))); })(), "Opcional. Ex.: Fundamentos, Os padrões.")),
      h("div",{class:"grid3"}, txt(l,"label","Rótulo",{live:true,hint:"Ex.: Aula 05"}), txt(l,"sigla","Sigla no menu",{live:true,hint:"Opcional. Ex.: Esp, Bônus. Vazio = número do rótulo."}), field("Endereço (#)", idIn, "Usado no link da aula.")),
      txt(l,"titulo","Título",{live:true}),
      txt(l,"curto","Título curto da capa",{live:true,hint:"Opcional. Aparece na miniatura da aula."}),
      txt(l,"obj","Objetivo",{area:true,rows:2,live:true}),
      txt(l,"dica","Dica em destaque",{area:true,rows:2,live:true}),
      txt(l,"video","Link da videoaula",{type:"url",ph:"https://…",hint:"Opcional. Link da aula na Hotmart, YouTube etc. Aparece o botão “Assistir aula”."}),
      h("div",{class:"grid2"},
        sel(l,"pat","Padrão do quadro ligado a esta aula", [["","Nenhum"], ...C.padroes.map(p=>[p.id,p.nome])]),
        field("Imagem de capa (opcional)", h("div",{style:"display:flex;gap:10px;align-items:center"}, h("div",{class:"capa-prev",style:l.capa?`background-image:url('${l.capa}')`:""}), capaIn, h("div",{style:"display:flex;flex-direction:column;gap:6px"}, btn("Enviar",()=>capaIn.click()), l.capa?btn("Remover",()=>{ l.capa=""; changed(); render(); },"btn sm danger"):null)), "Sem imagem, a capa é gerada com as cores do tema."))),
    h("div",{class:"card"}, h("h3",null,"Link desta aula para a Memberkit"),
      h("div",{style:"display:flex;gap:8px;align-items:center"}, (()=>{ const i=h("input",{type:"text",readOnly:true,style:"flex:1;border:1px solid #d6dae5;border-radius:9px;padding:8px 10px"}); i.value=lessonLink(l); return i; })(), btn("Copiar",()=>copy(lessonLink(l),"Link copiado."),"btn pri")),
      h("p",{class:"hint",style:"margin-bottom:0"},"Cole na descrição desta aula na Memberkit (ex.: “Guia do aluno: Clique AQUI”). Todos os links ficam na aba Links para a Memberkit.")),
    h("div",{class:"card"}, h("h3",null,"Materiais para baixar ("+l.downloads.length+")"),
      h("p",{class:"hint",style:"margin-top:0"},"Cole o link do arquivo. No Google Drive: clique com o botão direito no arquivo → Compartilhar → Acesso geral: “Qualquer pessoa com o link” → Copiar link. Também serve link da Hotmart, Dropbox ou OneDrive."),
      listEditor(l.downloads, (d,i)=>`${i+1} · ${d.titulo||"Material"}`, d=>h("div",null,
        h("div",{class:"grid2"}, txt(d,"titulo","Nome do material",{live:true}), sel(d,"tipo","Tipo",[["PDF","PDF"],["ZIP","ZIP"],["DOC","Documento"],["PLANILHA","Planilha"],["IMAGEM","Imagem"],["ÁUDIO","Áudio"],["LINK","Link (abrir)"]])),
        txt(d,"link","Link do arquivo",{type:"url",ph:"https://drive.google.com/…",live:true}),
        txt(d,"desc","Descrição curta (opcional)",{live:true})), ()=>({titulo:"Material da aula",tipo:"PDF",link:"",desc:""}), "Adicionar material")),
    h("div",{class:"card"}, h("h3",null,"Antes de assistir"), lines(l,"antes","Itens")),
    h("div",{class:"card"}, h("h3",null,"Etapas (Siga esta ordem)"),
      listEditor(l.passos, (p,i)=>`Etapa ${i+1} · ${p.t||""}`, p=>h("div",null, txt(p,"t","Título da etapa",{live:true}), lines(p,"d","Parágrafos","Cada linha vira um parágrafo.")), ()=>({t:"Nova etapa",d:[]}), "Adicionar etapa")),
    h("div",{class:"card"}, h("h3",null,"Confira antes de avançar"), lines(l,"check","Itens do checklist", "Um item por linha. Quando o aluno marca todos, a aula é concluída.")),
    h("div",{class:"card"}, h("h3",null,"Exercícios ("+l.q.length+")"), qList(l.q))
  );
}
function qList(arr){
  return h("div",null,
    arr.length ? arr.map((q,i)=>qEditor(arr,q,i)) : h("div",{class:"empty"},"Sem exercícios nesta aula."),
    h("div",{style:"display:flex;gap:8px"},
      btn("+ Múltipla escolha",()=>{ arr.push({id:uid("q"),t:"mc",fonte:"",p:"",b:"",o:["","","",""],c:0,e:"",tag:""}); changed(); render(); },"btn"),
      btn("+ Certo ou Errado",()=>{ arr.push({id:uid("q"),t:"ce",fonte:"",p:"Julgue o item.",b:"",o:["Certo","Errado"],c:1,e:"",tag:""}); changed(); render(); },"btn")));
}
function qEditor(arr, q, i){
  const opts = q.t==="ce"
    ? h("div",null, ["Certo","Errado"].map((t,k)=>h("label",{class:"opt"+(q.c===k?" right":""),style:"cursor:pointer"}, (()=>{ const r=h("input",{type:"radio",name:"c-"+q.id,onchange:()=>{ q.c=k; changed(); render(); }}); r.checked=q.c===k; return r; })(), h("span",{style:"font-weight:700"},t))), h("div",{class:"hint"},"Marque o gabarito."))
    : h("div",null, q.o.map((t,k)=>h("div",{class:"opt"+(q.c===k?" right":"")},
        (()=>{ const r=h("input",{type:"radio",name:"c-"+q.id,title:"Correta",onchange:()=>{ q.c=k; changed(); render(); }}); r.checked=q.c===k; return r; })(),
        (()=>{ const x=h("input",{type:"text",placeholder:"Alternativa "+String.fromCharCode(65+k),oninput:e=>{ q.o[k]=e.target.value; changed(); }}); x.value=t; return x; })(),
        btn("✕",()=>{ if (q.o.length<=2) return toast("Mínimo de 2 alternativas."); q.o.splice(k,1); if (q.c>=q.o.length) q.c=0; else if (q.c>k) q.c--; changed(); render(); },"btn ic sm","Remover alternativa"))),
      h("div",{style:"display:flex;gap:10px;align-items:center"}, btn("+ Alternativa",()=>{ q.o.push(""); changed(); render(); }), h("span",{class:"hint"},"O círculo marca a correta. Se quiser letras fixas, comece com “A) ”.")));
  return h("div",{class:"q"},
    itemHead(`${i+1}. ${q.t==="ce"?"Certo/Errado":"Múltipla escolha"} · ${(q.p||"").slice(0,60)}`, arr, i,
      h("select",{class:"btn sm",onchange:e=>{ q.t=e.target.value; if(q.t==="ce"){ q.o=["Certo","Errado"]; if(q.c>1) q.c=1; } else if(q.o.length<3){ q.o=["","","",""]; q.c=0; } changed(); render(); }}, h("option",{value:"mc",selected:q.t!=="ce"},"Múltipla escolha"), h("option",{value:"ce",selected:q.t==="ce"},"Certo/Errado"))),
    h("div",{class:"grid2"}, txt(q,"fonte","Origem (banca, cargo, ano)",{hint:"Opcional."}), txt(q,"tag","Etiqueta / padrão",{hint:"Ex.: Palavras restritivas"})),
    txt(q,"p","Comando da questão",{area:true,rows:2}),
    txt(q,"b","Texto em destaque (assertiva ou trecho)",{area:true,rows:2,hint:"Opcional. Aparece em itálico, com borda."}),
    opts,
    txt(q,"e","Explicação mostrada depois da resposta",{area:true,rows:3}));
}

VIEWS.padroes = () => h("div",null,
  h("h2",{class:"pagett"},"Quadro de padrões"),
  h("p",{class:"pagesub"},"Os cards da página Quadro de padrões. Cada padrão pode ser ligado a uma aula."),
  listEditor(C.padroes, (p,i)=>`${String(i+1).padStart(2,"0")} · ${p.nome||""}`, p=>h("div",null,
    h("div",{class:"grid2"}, txt(p,"nome","Nome",{live:true}), sel(p,"aula","Aula do padrão", [["","Nenhuma"], ...C.aulas.map(l=>[l.id,(l.label||"")+" · "+l.titulo])])),
    txt(p,"sinal","Sinal (como reconhecer)",{area:true,rows:2,live:true}),
    txt(p,"acao","O que fazer",{area:true,rows:2,live:true}),
    txt(p,"ex","Exemplo",{area:true,rows:2,live:true})), ()=>({id:uid("p"),nome:"Novo padrão",sinal:"",acao:"",ex:"",aula:""}), "Adicionar padrão"));

VIEWS.treino = () => h("div",null,
  h("h2",{class:"pagett"},"Treino do quadro"),
  h("p",{class:"pagesub"},"As questões rápidas no fim da página Quadro de padrões."),
  h("div",{class:"card"}, qList(C.treino)));

VIEWS.materiais = () => {
  const B = C.materiais.bonus;
  return h("div",null,
    h("h2",{class:"pagett"},"Materiais"),
    h("p",{class:"pagesub"},"Bônus, arquivos e rotina de estudo da página Materiais. Nos links, use um endereço externo (Google Drive, Hotmart, YouTube) ou # + endereço de uma aula, por exemplo #ebook."),
    h("div",{class:"card"}, h("h3",null,"Destaque de bônus"),
      chk(B,"ativo","Mostrar o destaque de bônus",{invertFalse:true}),
      h("div",{class:"grid2"}, txt(B,"eyebrow","Linha de cima",{live:true}), txt(B,"titulo","Título",{live:true})),
      txt(B,"texto","Texto",{area:true,live:true}),
      h("div",{class:"grid2"}, txt(B,"botao","Texto do botão",{live:true}), txt(B,"link","Link do botão",{live:true})),
      h("div",{style:"margin-top:6px"}, h("b",{style:"font-size:13px"},"Pilares"), listEditor(B.pilares,(p,i)=>`${i+1} · ${p.t||""}`, p=>h("div",{class:"grid2"}, txt(p,"t","Título",{live:true}), txt(p,"d","Descrição",{live:true})), ()=>({t:"Novo",d:""}), "Adicionar pilar"))),
    h("div",{class:"card"}, h("h3",null,"Arquivos e atalhos"),
      listEditor(C.materiais.itens,(m,i)=>`${i+1} · ${m.titulo||""}`, m=>h("div",null,
        h("div",{class:"grid2"}, txt(m,"titulo","Título",{live:true}), sel(m,"tipo","Tipo",[["PDF","PDF"],["ZIP","ZIP"],["WEB","Página"],["AULA","Aula"],["VÍDEO","Vídeo"],["LINK","Link"]])),
        txt(m,"desc","Descrição",{live:true}), txt(m,"link","Link (para baixar ou abrir)",{live:true,ph:"https://drive.google.com/… ou #endereco-da-aula",hint:"Para arquivos do Google Drive, compartilhe como “Qualquer pessoa com o link”."})), ()=>({titulo:"Novo material",desc:"",tipo:"PDF",link:""}), "Adicionar material")),
    h("div",{class:"card"}, h("h3",null,"Rotina sugerida de estudo"),
      listEditor(C.materiais.rotinaEstudo,(r,i)=>`${i+1} · ${r.t||""}`, r=>h("div",{class:"grid2"}, txt(r,"t","Título",{live:true}), txt(r,"d","Descrição",{area:true,rows:2,live:true})), ()=>({t:"Nova etapa",d:""}), "Adicionar etapa")));
};

VIEWS.glossario = () => h("div",null,
  h("h2",{class:"pagett"},"Glossário"),
  h("p",{class:"pagesub"},"Os termos da página Materiais."),
  listEditor(C.glossario,(g,i)=>`${i+1} · ${g.t||""}`, g=>h("div",null, txt(g,"t","Termo",{live:true}), txt(g,"d","Definição",{area:true,rows:2,live:true})), ()=>({t:"Novo termo",d:""}), "Adicionar termo"));

VIEWS.acesso = () => {
  const G = C.config.acesso, N = C.config.nuvem;
  const modeCard = h("div",{class:"card"}, h("h3",null,"Como os alunos entram"),
    sel(G,"modo","Modo de acesso",[["aberto","Aberto: qualquer pessoa com o link (progresso fica no aparelho)"],["codigo","Código de acesso (progresso fica no aparelho)"],["login","Login com e-mail e senha (progresso salvo na conta do aluno)"]],{rerender:true}),
    G.modo==="login" ? h("div",{class:"note ok"},"Recomendado. Cada aluno entra com o e-mail da compra e o progresso acompanha ele em qualquer aparelho. Você acompanha tudo na aba Alunos e progresso.")
      : h("div",{class:"note"},"Nestes modos o progresso fica salvo só no navegador do aluno. Para acompanhar o aluno em qualquer aparelho, use “Login com e-mail e senha”."));
  if (G.modo==="codigo"){
    const codeIn = h("input",{type:"text",placeholder:"Ex.: MODELAGEM2026"});
    return h("div",null, h("h2",{class:"pagett"},"Acesso e login"), modeCard,
      h("div",{class:"card"}, h("h3",null,"Código de acesso"),
        G.hash ? h("div",{class:"note ok"},"Há um código definido (por segurança, não é mostrado). Para mudar, defina um novo abaixo.") : h("div",{class:"note bad"},"Nenhum código definido ainda. Até definir, o site fica aberto."),
        field("Definir novo código", h("div",{style:"display:flex;gap:8px"}, codeIn, btn("Salvar código", async()=>{
          const v = MQTema.normCode(codeIn.value); if (v.length<4) return toast("Use pelo menos 4 caracteres.");
          G.hash = await MQTema.sha256(v); changed(); render(); toast("Código salvo. Publique para valer no site."); },"btn pri")), "Maiúsculas e minúsculas são tratadas como iguais. Entregue o código aos compradores pela área de membros ou e-mail."),
        txt(G,"titulo","Título da tela de entrada"), txt(G,"texto","Texto",{area:true}), txt(G,"linkAjuda","Link de ajuda (opcional)",{ph:"https://wa.me/55…"})));
  }
  if (G.modo!=="login") return h("div",null, h("h2",{class:"pagett"},"Acesso e login"), modeCard);
  const ok = N.apiKey && N.projectId && N.authDomain;
  const paste = h("textarea",{rows:6,placeholder:'Cole aqui o bloco firebaseConfig, por exemplo:\nconst firebaseConfig = {\n  apiKey: "AIza…",\n  authDomain: "seu-projeto.firebaseapp.com",\n  projectId: "seu-projeto", …\n};'});
  const adminsTxt = h("textarea",{rows:2,oninput:e=>{ N.admins = (e.target.value.match(/[^\s,;<>"']+@[^\s,;<>"']+\.[^\s,;<>"']+/g)||[]).map(x=>x.toLowerCase()); changed(); $("#rulesBox").value = rules(); }});
  adminsTxt.value = (N.admins||[]).join("\n");
  const rulesBox = h("textarea",{id:"rulesBox",rows:16,readOnly:true,style:"font-family:ui-monospace,Menlo,monospace;font-size:12.5px"}); rulesBox.value = rules();
  return h("div",null,
    h("h2",{class:"pagett"},"Acesso e login"),
    h("p",{class:"pagesub"},"O login usa o Firebase, do Google, no plano gratuito (Spark): sem cartão de crédito e sem mensalidade. Configure uma vez seguindo os passos abaixo."),
    modeCard,
    h("div",{class:"card"}, h("h3",null, ok?"✓ Firebase conectado":"1. Conecte o Firebase"),
      ok ? h("div",{class:"note ok"},"Projeto: ", h("b",null,N.projectId), ". Para trocar, cole uma nova configuração.") : null,
      h("ol",{class:"steps"},
        h("li",null,"Acesse ", h("a",{href:"https://console.firebase.google.com",target:"_blank",rel:"noopener"},"console.firebase.google.com"), " com uma conta Google e clique em ", h("b",null,"Criar projeto"), " (pode desativar o Google Analytics)."),
        h("li",null,"No projeto, clique no ícone ", h("b",null,"</>"), " (Web) para registrar um app. Dê um nome e copie o bloco ", h("code",null,"firebaseConfig"), ". Cole abaixo."),
        h("li",null, h("b",null,"Criação → Authentication → Vamos começar → Método de login"), ": ative ", h("b",null,"E-mail/senha"), " (só a primeira opção) e, se quiser, ", h("b",null,"Google"), "."),
        h("li",null, h("b",null,"Authentication → Configurações → Domínios autorizados"), ": adicione o endereço do site, por exemplo ", h("code",null,(location.hostname && location.hostname!=="localhost" ? location.hostname : "seuusuario.github.io")), "."),
        h("li",null, h("b",null,"Criação → Firestore Database → Criar banco de dados"), ": escolha o local ", h("code",null,"southamerica-east1 (São Paulo)"), " e o ", h("b",null,"modo de produção"), "."),
        h("li",null,"Em ", h("b",null,"Firestore → Regras"), ", apague tudo, cole as regras do passo 3 desta página e clique em ", h("b",null,"Publicar"), ".")),
      field("Configuração do Firebase", paste),
      btn("Usar esta configuração",()=>{
        const t = paste.value, g = k => (t.match(new RegExp(k+'\\s*["\']?\\s*:\\s*["\']([^"\']+)["\']'))||[])[1]||"";
        const nc = { apiKey:g("apiKey"), authDomain:g("authDomain"), projectId:g("projectId"), appId:g("appId") };
        if (!nc.apiKey || !nc.projectId){ toast("Não encontrei apiKey e projectId no texto colado."); return; }
        Object.assign(N, nc); changed(); render(); toast("Firebase configurado. Publique para valer no site."); },"btn pri")),
    h("div",{class:"card"}, h("h3",null,"2. Quem pode criar acesso"),
      sel(N,"entrada","Regra de entrada",[["convite","Quem chega pelo link da área de membros (Memberkit): automático"],["lista","Só e-mails da lista de compradores (você importa)"],["livre","Qualquer pessoa com o endereço do site"]],{rerender:true}),
      N.entrada==="convite" ? conviteCard() : N.entrada==="lista"
        ? h("div",{class:"note"},"Você importa os e-mails na aba Alunos e progresso. Quem cria senha confirma o e-mail por um link (o plano grátis envia até 1.000 por dia).")
        : h("div",{class:"note"},"Qualquer pessoa que souber o endereço do site pode criar uma conta."),
      chk(N,"google","Mostrar o botão “Entrar com Google”",{invertFalse:true}),
      field("E-mails de administrador", adminsTxt, "Um por linha. Esses e-mails podem ver e editar a lista de alunos e o progresso. Mudou? Copie as regras de novo e publique no Firebase.")),
    h("div",{class:"card"}, h("h3",null,"3. Regras de segurança do Firestore", h("span",{class:"sp"}), btn("Copiar regras", async()=>{ try { await navigator.clipboard.writeText(rules()); toast("Regras copiadas."); } catch(e){ rulesBox.select(); toast("Selecione e copie com Ctrl+C."); } },"btn pri")),
      h("p",{class:"hint",style:"margin-top:0"},"Garantem que cada aluno só leia e grave o próprio progresso, e que só os administradores vejam a lista e o progresso de todos."),
      rulesBox),
    h("div",{class:"card"}, h("h3",null,"Textos da tela de login"),
      txt(G,"tituloLogin","Título",{live:true}), txt(G,"textoLogin","Texto",{area:true,rows:2,live:true}),
      txt(G,"linkAjuda","Link de ajuda (opcional)",{ph:"https://wa.me/55… ou link de suporte"})));
};
const CONV_LOCAL = "mq-admin-convite";
function siteURL(){
  const own = (C && C.config.siteUrl || "").trim();
  if (own) return own.replace(/[?#].*$/,"").replace(/index\.html$/,"").replace(/\/?$/,"/");
  try { return new URL("./", location.href).href; } catch(e){ return ""; }
}
function conviteCode(){ try { return localStorage.getItem(CONV_LOCAL) || ""; } catch(e){ return ""; } }
function precisaConvite(){ return C.config.acesso.modo==="login" && C.config.nuvem.entrada==="convite"; }
function lessonLink(l){
  const code = conviteCode();
  return siteURL() + (precisaConvite() && code && C.config.nuvem.conviteHash ? "?convite=" + encodeURIComponent(code) : "") + "#" + l.id;
}
async function copy(text, msg){ try { await navigator.clipboard.writeText(text); toast(msg||"Copiado."); } catch(e){ toast("Não foi possível copiar automaticamente."); } }
function conviteCard(){
  const N = C.config.nuvem, G = C.config.acesso;
  let code = ""; try { code = localStorage.getItem(CONV_LOCAL) || ""; } catch(e){}
  const valid = code && N.conviteHash;
  const link = valid ? siteURL() + "?convite=" + encodeURIComponent(code) : "";
  const linkIn = h("input",{type:"text",readOnly:true,value:link||"(gere o link abaixo)"});
  return h("div",null,
    h("div",{class:"note ok"},"Sem lista e sem trabalho manual: a Hotmart libera o aluno na Memberkit, e em cada aula ele encontra o link do guia daquela aula. No primeiro clique, o link libera a criação da senha. Depois, ele entra direto, em qualquer aparelho. Quem não tem o link não consegue criar acesso."),
    field("Link de entrada para colar na Memberkit", h("div",{style:"display:flex;gap:8px"}, linkIn,
      valid ? btn("Copiar", async()=>{ try { await navigator.clipboard.writeText(link); toast("Link copiado."); } catch(e){ linkIn.select(); toast("Selecione e copie com Ctrl+C."); } },"btn pri") : null),
      valid ? "Este é o link geral do guia. Para colocar um link em cada aula da Memberkit, use a aba Links para a Memberkit. Publique o site depois de gerar o link." : (N.conviteHash ? "Já existe um link gerado em outro computador. Para ver o link aqui, gere um novo (o antigo deixa de funcionar para novos alunos) e atualize na Memberkit." : "Clique em Gerar link.")),
    h("div",{style:"display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"},
      btn(N.conviteHash?"Gerar novo link":"Gerar link", async()=>{
        if (N.conviteHash && !await ask("Gerar um novo link?","O link antigo deixa de liberar novos alunos. Quem já criou acesso continua entrando normalmente. Lembre de trocar o link na Memberkit.","Gerar novo")) return;
        const c = Array.from(crypto.getRandomValues(new Uint8Array(9))).map(b=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b%32]).join("");
        N.conviteHash = await MQTema.sha256(MQTema.normCode(c)); try { localStorage.setItem(CONV_LOCAL, c); } catch(e){}
        changed(); render(); toast("Link gerado. Publique o site e copie os links das aulas na aba Links para a Memberkit."); },"btn")),
    txt(G,"linkMembros","Endereço da sua área de membros (Memberkit)",{ph:"https://suaescola.memberkit.com.br",hint:"Aparece para quem tenta criar acesso sem o link, para encontrar o caminho certo."}));
}
function rules(){
  const ad = (C.config.nuvem.admins||[]).map(e=>`'${e.replace(/'/g,"")}'`).join(", ") || "'seu-email@exemplo.com'";
  return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function logado() { return request.auth != null; }
    function email() { return request.auth.token.email.lower(); }
    function admin() {
      return logado() && request.auth.token.email_verified == true
        && email() in [${ad}];
    }
    match /alunos/{aluno} {
      allow get: if logado() && (email() == aluno || admin());
      allow list, write: if admin();
    }
    match /progresso/{uid} {
      allow read, write: if logado() && request.auth.uid == uid;
      allow read: if admin();
    }
  }
}`;
}

VIEWS.links = () => {
  const P = C.config, falta = precisaConvite() && !(conviteCode() && C.config.nuvem.conviteHash);
  const site = h("input",{type:"url",placeholder:"https://seuusuario.github.io/guia/",oninput:e=>{ P.siteUrl = e.target.value.trim(); changed(); }}); site.value = P.siteUrl || "";
  const all = () => C.modulos.map(m => [m.n+" · "+m.nome, ...C.aulas.filter(l=>l.mod===m.id).map(l => `${l.label} · ${l.titulo}: ${lessonLink(l)}`)].join("\n")).join("\n\n");
  return h("div",null,
    h("h2",{class:"pagett"},"Links para a Memberkit"),
    h("p",{class:"pagesub"},"Um link para cada aula. Cole na descrição da aula correspondente na Memberkit, por exemplo: “Guia do aluno: Clique AQUI”. O aluno clica, entra (no primeiro acesso, cria a senha) e cai direto na aula certa do guia."),
    falta ? h("div",{class:"note bad"},"Falta o link de entrada. Gere em ", h("b",null,"Acesso e login → Quem pode criar acesso → Gerar link"), " e volte aqui. Sem ele, os links abrem o guia, mas alunos novos não conseguem criar acesso.") :
      precisaConvite() ? h("div",{class:"note ok"},"Os links já levam a liberação de primeiro acesso. Alunos novos criam a senha ao clicar; quem já tem acesso só entra.") : null,
    h("div",{class:"card"}, h("h3",null,"Endereço do site"),
      field("Endereço público do guia", site, "Ex.: https://seuusuario.github.io/guia/ ou o seu domínio. Se você usa este painel pelo próprio site, pode deixar em branco.")),
    h("div",{class:"card"}, h("h3",null,"Como colocar na Memberkit"),
      h("ol",{class:"steps"},
        h("li",null,"Copie o link da aula abaixo."),
        h("li",null,"Na Memberkit, edite a aula correspondente e, na descrição, escreva por exemplo ", h("b",null,"Guia do aluno: Clique AQUI"), "."),
        h("li",null,"Selecione “Clique AQUI”, use o botão de link do editor e cole. Salve."),
        h("li",null,"Faça um teste: clique no link numa janela anônima. Deve pedir login e abrir a aula certa."))),
    h("div",{class:"card"}, h("h3",null,"Links por aula", h("span",{class:"sp"}), btn("Copiar todos", ()=>copy(all(),"Todos os links copiados. Cole numa planilha ou documento para ir distribuindo."),"btn pri")),
      C.modulos.map(m => [
        h("div",{class:"lmod",style:"padding-left:0"}, m.n+" · "+m.nome),
        C.aulas.filter(l=>l.mod===m.id).map(l => h("div",{class:"linkrow"},
          h("div",{class:"lr-t"}, h("b",null,l.label), " ", l.titulo, h("small",null, lessonLink(l))),
          btn("Copiar link", ()=>copy(lessonLink(l), "Link da "+l.label+" copiado."), "btn"),
          btn("Copiar com texto", ()=>copy("Guia do aluno: "+lessonLink(l), "Copiado com o texto “Guia do aluno:”."), "btn")))
      ])));
};

/* ---------------- alunos e progresso ---------------- */
let ADM = { user:null, alunos:null, prog:null, busca:"", erro:"", carregando:false, ready:false };
async function nuvemInit(){
  const N = C.config.nuvem;
  await MQNuvem.init(N);
  if (!ADM.ready){ ADM.ready = true; MQNuvem.onUser(u => { ADM.user = u; ADM.alunos = null; ADM.prog = null; if (tab==="alunos") render(); if (u) carregarAlunos(); }); }
}
async function carregarAlunos(){
  ADM.carregando = true; ADM.erro = ""; if (tab==="alunos") render();
  try {
    const [al, pr] = await Promise.all([ MQNuvem.listarAlunos(), MQNuvem.listarProgresso() ]);
    ADM.alunos = al; ADM.prog = pr;
  } catch(e){ ADM.erro = MQNuvem.erro(e); }
  ADM.carregando = false; if (tab==="alunos") render();
}
VIEWS.alunos = () => {
  const N = C.config.nuvem, wrap = h("div",null, h("h2",{class:"pagett"},"Alunos e progresso"),
    h("p",{class:"pagesub"},"Acompanhe o progresso de cada aluno: aulas concluídas, exercícios e acertos. Os alunos aparecem aqui automaticamente quando entram no guia."));
  if (!(N.apiKey && N.projectId)){ wrap.appendChild(h("div",{class:"note"},"Primeiro conecte o Firebase na aba ", h("b",null,"Acesso e login"), ".")); return wrap; }
  if (!ADM.ready){ wrap.appendChild(h("div",{class:"card"},"Conectando…")); nuvemInit().catch(e=>{ ADM.erro = MQNuvem.erro(e); render(); }); return wrap; }
  if (!ADM.user){
    const em = h("input",{type:"email",placeholder:"seu e-mail de administrador"}), pw = h("input",{type:"password",placeholder:"senha"}), err = h("div",{class:"hint",style:"color:var(--bad);margin-top:8px"}, ADM.erro||"");
    const run = async fn => { err.textContent=""; try { await fn(); } catch(e){ err.textContent = MQNuvem.erro(e); } };
    wrap.appendChild(h("div",{class:"card",style:"max-width:520px"}, h("h3",null,"Entrar como administrador"),
      h("p",{class:"hint",style:"margin-top:0"},"Use um dos e-mails de administrador cadastrados na aba Acesso e login."),
      field("E-mail", em), field("Senha", pw),
      h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},
        btn("Entrar",()=>run(()=>MQNuvem.entrar(em.value,pw.value)),"btn pri"),
        btn("Entrar com Google",()=>run(()=>MQNuvem.google()),"btn"),
        btn("Criar senha de admin",()=>run(async()=>{ await MQNuvem.criar(em.value,pw.value); toast("Conta criada. Confirme o e-mail pelo link que enviamos."); }),"btn"),
        btn("Esqueci a senha",()=>run(async()=>{ await MQNuvem.esqueci(em.value); toast("Link de nova senha enviado."); }),"btn")), err));
    return wrap;
  }
  const u = ADM.user;
  wrap.appendChild(h("div",{class:"note ok",style:"display:flex;align-items:center;gap:10px;flex-wrap:wrap"}, "Conectado como ", h("b",null,u.email), (u.emailVerified?"":" (e-mail ainda não confirmado: confirme pelo link enviado e clique em Atualizar)"), h("span",{style:"flex:1"}), btn("Atualizar",async()=>{ await MQNuvem.recarregar(); carregarAlunos(); }), btn("Sair",()=>MQNuvem.sair())));
  if (ADM.erro) wrap.appendChild(h("div",{class:"note bad"}, ADM.erro));
  if (ADM.carregando && !ADM.alunos){ wrap.appendChild(h("div",{class:"card"},"Carregando alunos…")); return wrap; }
  const alunos = ADM.alunos || [], prog = ADM.prog || [];
  // importar compradores
  const ta = h("textarea",{rows:5,placeholder:"Cole aqui os e-mails (um por linha) ou o conteúdo da planilha exportada da Hotmart. Os e-mails são encontrados automaticamente."});
  if (N.entrada==="lista") wrap.appendChild(h("div",{class:"card"}, h("h3",null,"Lista de compradores ("+alunos.length+")", h("span",{class:"sp"}), N.entrada==="lista"?h("span",{class:"status ok"},"Lista em uso"):h("span",{class:"status"},"Não está em uso: a regra de entrada atual é outra")),
    h("p",{class:"hint",style:"margin-top:0"},"Na Hotmart: Vendas → filtrar as aprovadas → Exportar. Abra o arquivo, copie tudo e cole aqui."),
    ta, h("div",{style:"display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"},
      btn("Liberar e-mails", async()=>{
        const em = [...new Set((ta.value.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)||[]).map(x=>x.toLowerCase()))];
        if (!em.length) return toast("Nenhum e-mail encontrado no texto.");
        try { await MQNuvem.adicionarAlunos(em); toast(em.length+" e-mail(s) liberado(s)."); ta.value=""; carregarAlunos(); } catch(e){ toast(MQNuvem.erro(e)); } },"btn pri"),
      btn("Copiar lista", async()=>{ try { await navigator.clipboard.writeText(alunos.map(a=>a.email).join("\n")); toast("Lista copiada."); } catch(e){ toast("Não foi possível copiar."); } }))));
  // tabela de progresso
  const total = C.aulas.length, totalQ = C.aulas.reduce((s,l)=>s+l.q.length,0);
  const qmap = {}; C.aulas.forEach(l=>l.q.forEach(q=>qmap[q.id]=q.c));
  const byEmail = {}; prog.forEach(p => { if (p.email) byEmail[p.email.toLowerCase()] = p; });
  const emails = [...new Set([...alunos.map(a=>a.email), ...prog.map(p=>(p.email||"").toLowerCase()).filter(Boolean)])];
  const rows = emails.map(e => {
    const p = byEmail[e] || null, liberado = alunos.some(a=>a.email===e);
    let done=0, n=0, r=0;
    if (p){ done = Object.keys(p.done||{}).filter(k=>p.done[k] && C.aulas.some(l=>l.id===k)).length; Object.entries(p.ans||{}).forEach(([k,v])=>{ if (k in qmap){ n++; if (qmap[k]===v) r++; } }); }
    return { e, p, liberado, done, n, r, at: p ? MQNuvem.data(p.atualizado) : null };
  }).sort((a,b)=>(b.at?b.at.getTime():0)-(a.at?a.at.getTime():0));
  const busca = h("input",{type:"text",placeholder:"Buscar e-mail…",value:ADM.busca,oninput:e=>{ ADM.busca=e.target.value; const q=ADM.busca.toLowerCase(); tb.querySelectorAll("tr[data-e]").forEach(tr=>tr.style.display = tr.dataset.e.includes(q)?"":"none"); }});
  const tb = h("tbody",null, rows.map(x => h("tr",{"data-e":x.e, style: ADM.busca && !x.e.includes(ADM.busca.toLowerCase()) ? "display:none" : ""},
    h("td",null, x.e, x.p&&x.p.nome?h("div",{class:"hint"},x.p.nome):null),
    h("td",null, x.p ? `${x.done}/${total} (${total?Math.round(x.done/total*100):0}%)` : "—"),
    h("td",null, x.p ? `${x.n}/${totalQ}` : "—"),
    h("td",null, x.n ? Math.round(x.r/x.n*100)+"%" : "—"),
    h("td",null, x.at ? x.at.toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}) : "Nunca entrou"),
    h("td",null, N.entrada!=="lista" ? null : x.liberado ? btn("Remover",async()=>{ if (await ask("Remover "+x.e+" da lista?","A pessoa perde o acesso se a lista de compradores estiver ligada. O progresso dela é mantido.","Remover")){ try { await MQNuvem.removerAluno(x.e); carregarAlunos(); } catch(e){ toast(MQNuvem.erro(e)); } } },"btn sm danger") : h("span",{class:"hint"},"fora da lista")))));
  const ativos7 = rows.filter(x=>x.at && Date.now()-x.at.getTime() < 7*864e5).length;
  wrap.appendChild(h("div",{class:"stats"}, [[prog.length,"alunos que já entraram"],[N.entrada==="lista"?alunos.length:rows.filter(x=>x.done>0).length, N.entrada==="lista"?"na lista de compradores":"concluíram ao menos 1 aula"],[ativos7,"ativos nos últimos 7 dias"],[prog.length?Math.round(rows.filter(x=>x.p).reduce((s,x)=>s+x.done,0)/Math.max(1,prog.length)):0,"aulas concluídas em média"]].map(([n,l])=>h("div",{class:"stat"},h("b",null,n),h("small",null,l)))));
  wrap.appendChild(h("div",{class:"card"}, h("h3",null,"Progresso por aluno", h("span",{class:"sp"}), busca,
      btn("Copiar planilha", async()=>{ const csv = ["email;aulas_concluidas;exercicios_respondidos;acertos_pct;ultima_atividade", ...rows.map(x=>[x.e, x.done, x.n, x.n?Math.round(x.r/x.n*100):"", x.at?x.at.toISOString():""].join(";"))].join("\n"); try { await navigator.clipboard.writeText(csv); toast("Copiado. Cole no Excel ou Google Planilhas."); } catch(e){ toast("Não foi possível copiar."); } }),
      btn("Recarregar", carregarAlunos)),
    rows.length ? h("div",{style:"overflow:auto"}, h("table",{class:"tbl"}, h("thead",null,h("tr",null,["E-mail","Aulas concluídas","Exercícios","Acertos","Última atividade",""].map(t=>h("th",null,t)))), tb)) : h("div",{class:"empty"},"Nenhum aluno ainda.")));
  return wrap;
};

/* ---------------- publicar ---------------- */
function ghCfg(){ try { return JSON.parse(localStorage.getItem(GH_KEY)||"{}"); } catch(e){ return {}; } }
function ghSave(c){ try { localStorage.setItem(GH_KEY, JSON.stringify(c)); } catch(e){} }
function guessRepo(){
  const m = location.hostname.match(/^([^.]+)\.github\.io$/i);
  if (!m) return {};
  const seg = location.pathname.split("/").filter(Boolean)[0];
  return { owner:m[1], repo: seg && !/\.html$/.test(seg) ? seg : m[1]+".github.io" };
}
async function gh(cfg, path, opts={}){
  const r = await fetch("https://api.github.com"+path, Object.assign({}, opts, { headers: Object.assign({ "Authorization":"Bearer "+cfg.token, "Accept":"application/vnd.github+json", "X-GitHub-Api-Version":"2022-11-28" }, opts.headers||{}) }));
  let body = null; try { body = await r.json(); } catch(e){}
  if (!r.ok){ const err = new Error((body && body.message) || ("Erro "+r.status)); err.status = r.status; throw err; }
  return body;
}
function b64(str){ const bytes = new TextEncoder().encode(str); let bin = ""; for (let i=0;i<bytes.length;i+=0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i,i+0x8000)); return btoa(bin); }
const explain = e => e.status===401 ? "Token inválido ou expirado. Gere um novo token." : e.status===403 ? "O token não tem permissão de escrita (Contents: Read and write) neste repositório." : e.status===404 ? "Repositório ou branch não encontrado. Confira usuário, repositório e branch, e se o token tem acesso a este repositório." : (e.message||"Falha de conexão.");
async function publish(){
  const cfg = Object.assign({branch:"main",path:"content.json"}, ghCfg());
  if (!cfg.owner || !cfg.repo || !cfg.token){ tab="publicar"; render(); toast("Configure a conexão com o GitHub primeiro."); return; }
  const b = $("#btnPub"); b.disabled = true; b.textContent = "Publicando…";
  try {
    let sha;
    try { const f = await gh(cfg, `/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}?ref=${encodeURIComponent(cfg.branch)}`); sha = f.sha; } catch(e){ if (e.status!==404) throw e; }
    const now = new Date();
    await gh(cfg, `/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ message:"Atualiza o guia do aluno ("+now.toLocaleString("pt-BR")+")", content:b64(json()), sha, branch:cfg.branch }) });
    published = json();
    try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(PREV_KEY); } catch(e){}
    cfg.last = now.toISOString(); ghSave(cfg);
    setStatus(); if (tab==="publicar") render();
    toast("Publicado! Os alunos veem a atualização em 1 a 2 minutos.");
  } catch(e){
    await ask("Não foi possível publicar", explain(e), "Entendi");
  } finally { b.disabled = false; b.textContent = "⇪ Publicar"; }
}
function exportJSON(){
  const blob = new Blob([json()],{type:"application/json"});
  const a = h("a",{href:URL.createObjectURL(blob), download:"content-"+new Date().toISOString().slice(0,10)+".json"});
  document.body.appendChild(a); a.click(); a.remove();
  toast("Backup baixado. Se nada baixou, use “Copiar JSON”.");
}
VIEWS.publicar = () => {
  const cfg = Object.assign({branch:"main",path:"content.json"}, guessRepo(), ghCfg());
  const save = () => ghSave(cfg);
  const inp = (key,label,opt={}) => { const el = h("input",{type:opt.type||"text",placeholder:opt.ph||"",oninput:e=>{ cfg[key]=e.target.value.trim(); save(); }}); el.value = cfg[key]||""; return field(label, el, opt.hint); };
  const fileIn = h("input",{type:"file",accept:".json,application/json",style:"display:none",onchange:async e=>{
    const f = e.target.files[0]; if (!f) return;
    try { const c = JSON.parse(await f.text()); if (!c.aulas || !c.modulos) throw 0; if (!await ask("Importar este arquivo?","O rascunho atual será substituído pelo conteúdo do arquivo.","Importar")) return; C = normalize(c); changed(); render(); toast("Conteúdo importado. Revise e publique."); }
    catch(err){ toast("Arquivo inválido: não parece um backup do guia."); } }});
  return h("div",null,
    h("h2",{class:"pagett"},"Publicar e backup"),
    h("p",{class:"pagesub"},"O site fica hospedado de graça no GitHub Pages. O botão Publicar salva o arquivo content.json no seu repositório e o GitHub atualiza o site sozinho."),
    cfg.last ? h("div",{class:"note ok"},"Última publicação neste navegador: "+new Date(cfg.last).toLocaleString("pt-BR")+".") : null,
    h("div",{class:"card"}, h("h3",null,"Conexão com o GitHub (configure uma vez)"),
      h("div",{class:"grid3"}, inp("owner","Usuário do GitHub",{hint:"Ex.: re9treinamentos"}), inp("repo","Repositório",{hint:"Ex.: guia"}), inp("branch","Branch",{hint:"Normalmente: main"})),
      inp("token","Token de acesso",{type:"password",ph:"github_pat_…",hint:"Fica salvo só neste navegador. Nunca compartilhe."}),
      h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},
        btn("Testar conexão", async()=>{ try { const r = await gh(cfg,`/repos/${cfg.owner}/${cfg.repo}`); const can = r.permissions ? r.permissions.push : true; await ask(can?"Conexão funcionando":"Conectado, mas sem permissão de escrita", can?`Repositório ${r.full_name} encontrado. Você já pode publicar.`:"O token consegue ler, mas não escrever. Dê a permissão Contents: Read and write.", "Ok"); } catch(e){ await ask("Falha na conexão", explain(e), "Ok"); } },"btn"),
        btn("⇪ Publicar agora", publish, "btn acc"),
        btn("Esquecer token", ()=>{ delete cfg.token; save(); render(); toast("Token removido deste navegador."); }, "btn danger"))),
    h("div",{class:"card"}, h("h3",null,"Como gerar o token (uma vez)"),
      h("ol",{class:"steps"},
        h("li",null,"No GitHub, abra ", h("b",null,"Settings → Developer settings → Personal access tokens → Fine-grained tokens"), " e clique em ", h("b",null,"Generate new token"), "."),
        h("li",null,"Dê um nome (ex.: Painel do guia), escolha a validade e, em ", h("b",null,"Repository access"), ", selecione ", h("b",null,"Only select repositories"), " e marque o repositório do guia."),
        h("li",null,"Em ", h("b",null,"Permissions → Repository permissions → Contents"), ", escolha ", h("b",null,"Read and write"), "."),
        h("li",null,"Gere, copie o token e cole no campo acima. Depois, clique em Testar conexão.")),
      h("p",{class:"hint"},"Link direto: ", h("a",{href:"https://github.com/settings/personal-access-tokens/new",target:"_blank",rel:"noopener"},"github.com/settings/personal-access-tokens/new"))),
    h("div",{class:"card"}, h("h3",null,"Backup e restauração"),
      h("p",{class:"hint",style:"margin-top:0"},"Exporte um backup antes de mudanças grandes. Para restaurar, importe o arquivo e publique."),
      h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},
        btn("Exportar backup (.json)", exportJSON, "btn"),
        btn("Copiar JSON", async()=>{ try { await navigator.clipboard.writeText(json()); toast("JSON copiado."); } catch(e){ toast("Não foi possível copiar."); } }, "btn"),
        fileIn, btn("Importar backup", ()=>fileIn.click(), "btn"),
        btn("Descartar rascunho", async()=>{ if (!published) return; if (await ask("Descartar o rascunho?","Volta para a versão publicada. As mudanças não publicadas serão perdidas.","Descartar")){ C = normalize(JSON.parse(published)); try{ localStorage.removeItem(DRAFT_KEY); }catch(e){} changed(); render(); } }, "btn danger"))));
};

/* ---------------- gerar questões com IA ---------------- */
const IA_KEY = "mq-admin-ia";
const LIBS = {
  pdf: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs",
  pdfWorker: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs",
  zip: "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"
};
let GEN = { texto:"", arquivos:[], destino:"padrao", aulaFixa:"", aulaPadrao:"", qs:[], status:"", lendo:false, gerando:false, resposta:"" };
function iaCfg(){ try { return JSON.parse(localStorage.getItem(IA_KEY)||"{}"); } catch(e){ return {}; } }
function iaSave(c){ try { localStorage.setItem(IA_KEY, JSON.stringify(c)); } catch(e){} }
function loadScript(src){ return new Promise((res,rej)=>{ if (document.querySelector(`script[src="${src}"]`)) return res(); const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=()=>rej(new Error("Não foi possível carregar "+src)); document.head.appendChild(s); }); }
let pdfjsLib = null;
async function getPdf(){
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import(LIBS.pdf);
  try { const blob = new Blob([`import "${LIBS.pdfWorker}";`], {type:"text/javascript"}); pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(URL.createObjectURL(blob), {type:"module"}); }
  catch(e){ pdfjsLib.GlobalWorkerOptions.workerSrc = LIBS.pdfWorker; }
  return pdfjsLib;
}
const xmlText = (xml, tag) => { const out=[]; const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,"g"); let m; while ((m=re.exec(xml))) out.push(m[1]); return out.map(t=>t.replace(/<[^>]+>/g,"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&")); };
async function extrair(file){
  const nome = file.name.toLowerCase();
  if (nome.endsWith(".pdf")){
    const lib = await getPdf();
    const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages = [];
    for (let i=1;i<=doc.numPages;i++){ const p = await doc.getPage(i); const tc = await p.getTextContent(); let line = "", out = []; let lastY = null;
      tc.items.forEach(it => { const y = it.transform ? Math.round(it.transform[5]) : null; if (lastY!==null && y!==lastY){ out.push(line); line=""; } line += it.str + (it.hasEOL?"\n":""); lastY = y; }); out.push(line);
      pages.push(`[Página ${i}]\n` + out.join("\n").replace(/\n{3,}/g,"\n\n")); }
    const txt = pages.join("\n\n");
    if (txt.replace(/\[Página \d+\]/g,"").trim().length < 50) throw new Error("Este PDF parece ser só imagem (escaneado). Use “Ler com IA → Com o Claude” e anexe o PDF lá, ou exporte o PDF com texto.");
    return txt;
  }
  if (nome.endsWith(".pptx") || nome.endsWith(".docx")){
    await loadScript(LIBS.zip);
    const zip = await window.JSZip.loadAsync(await file.arrayBuffer());
    if (nome.endsWith(".docx")){ const x = await zip.file("word/document.xml").async("string"); return x.split(/<\/w:p>/).map(p=>xmlText(p,"w:t").join("")).filter(Boolean).join("\n"); }
    const slides = Object.keys(zip.files).filter(f=>/^ppt\/slides\/slide\d+\.xml$/.test(f)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0]);
    const out = [];
    for (const s of slides){
      const n = s.match(/\d+/)[0], x = await zip.file(s).async("string");
      const paras = x.split(/<\/a:p>/).map(p=>xmlText(p,"a:t").join("")).filter(t=>t.trim());
      let notes = ""; const nf = zip.file(`ppt/notesSlides/notesSlide${n}.xml`); if (nf){ const nx = await nf.async("string"); notes = nx.split(/<\/a:p>/).map(p=>xmlText(p,"a:t").join("")).filter(t=>t.trim() && !/^\d+$/.test(t.trim())).join("\n"); }
      out.push(`[Slide ${n}]\n` + paras.join("\n") + (notes?`\nNotas: ${notes}`:""));
    }
    return out.join("\n\n");
  }
  if (nome.endsWith(".ppt") || nome.endsWith(".doc")) throw new Error("Formato antigo (.ppt/.doc). Abra no PowerPoint/Word e salve como .pptx/.docx ou PDF.");
  return await file.text();
}
const norm = x => String(x||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[“”"']/g,"").replace(/\s+/g," ").trim();
function acharPadrao(nome){
  const n = norm(nome).replace(/^padrao\s*[:\-–]?\s*/,""); if (!n) return null;
  return C.padroes.find(p=>norm(p.nome)===n) || C.padroes.find(p=>norm(p.nome).includes(n) || n.includes(norm(p.nome))) || C.padroes.find(p=>norm(p.id)===n) || null;
}
function aulaDoPadrao(p){ return p && p.aula && C.aulas.some(l=>l.id===p.aula) ? p.aula : ""; }
function acharAula(linha){
  const n = norm(linha);
  const t = C.aulas.find(l => norm(l.titulo)===n || norm(l.titulo.replace(/^padrao:\s*/i,""))===n.replace(/^padrao:\s*/,""));
  if (t) return t.id;
  const m = n.match(/^aula\s*0*(\d+)\b/);
  if (m){ const mod = GEN.modRotulo || (C.modulos.find(x=>C.aulas.filter(l=>l.mod===x.id).length>5)||C.modulos[0]||{}).id;
    const cand = C.aulas.filter(l => (String(l.label).match(/\d+/)||[])[0] && +String(l.label).match(/\d+/)[0] === +m[1]);
    return (cand.find(l=>l.mod===mod) || cand[0] || {}).id || ""; }
  return "";
}
const RX = {
  q: /^\s*(?:quest[aã]o\s*|q\.?\s*)?0*(\d{1,3})\s*(?:[.)\-–:]|\s{2,})\s*(.*)$/i,
  qOnly: /^\s*quest[aã]o\s*0*(\d{1,3})\s*$/i,
  alt: /^\s*(?:\(\s*([A-Ea-e])\s*\)|([A-Ea-e])\s*[)\].\-–])\s*(.+)$/,
  gab: /^\s*(?:gabarito|resposta(?:\s+correta)?|resp\.?|alternativa\s+correta)\s*[:\-–]?\s*(?:letra\s*)?(certo|errado|correto|incorreto|[A-Ea-e])\b/i,
  com: /^\s*(?:coment[aá]rio|explica[cç][aã]o|resolu[cç][aã]o|justificativa)\s*[:\-–]\s*(.*)$/i,
  pad: /^\s*padr[aã]o\s*[:\-–]\s*(.+)$/i,
  aula: /^\s*aula\s*[:\-–]\s*(.+)$/i,
  fonte: /^\s*(?:banca|fonte|origem|prova)\s*[:\-–]\s*(.+)$/i,
  fonteParen: /^\s*\(([^()]{4,120}(?:19|20)\d{2}[^()]*)\)\s*(.*)$/,
  gabTitulo: /^\s*gabarito(?:s)?(?:\s+oficial)?\s*:?\s*$/i
};
const letraIdx = (l, n) => { const u = String(l).toUpperCase(); if (/^(CERTO|CORRETO|C)$/.test(u) && n===0) return 0; if (/^(ERRADO|INCORRETO|E)$/.test(u) && n===0) return 1; return u.charCodeAt(0)-65; };
function ehTitulo(l){
  if (l.length > 110 || RX.alt.test(l) || /^\s*\d/.test(l)) return false;
  const letras = l.replace(/[^A-Za-zÀ-ÿ]/g,""); if (letras.length < 4) return false;
  const maius = letras.replace(/[^A-ZÀ-Þ]/g,"").length;
  return maius / letras.length > 0.8 && (!!acharAula(l) || !!padraoNaLinha(l));
}
function padraoNaLinha(l){ const n = norm(l); return C.padroes.slice().sort((a,b)=>b.nome.length-a.nome.length).find(p => n.includes(norm(p.nome))) || null; }
function parseQuestoes(texto){
  const linhas = texto.split(/\n/).map(l=>l.replace(/\s+$/,"")).filter(l=>!/^\[(p[aá]gina|slide)\s*\d+\]$/i.test(l.trim()) && !/^===.*===$/.test(l.trim()));
  const qs = []; let cur = null, campo = null, ctxPat = null, ctxAula = "", emGab = false; const tabela = {};
  const fechar = () => { if (cur) qs.push(cur); cur = null; campo = null; };
  for (let raw of linhas){
    const l = raw.trim(); if (!l) continue;
    if (RX.gabTitulo.test(l)){ fechar(); emGab = true; continue; }
    if (emGab){ const re = /0*(\d{1,3})\s*[-.):–]?\s*(certo|errado|[A-Ea-e])\b/gi; let m, achou=false; while ((m=re.exec(l))){ tabela[+m[1]] = m[2]; achou=true; } if (achou) continue; if (RX.q.test(l) && !/^\d+\s*[-.):]?\s*[A-Ea-e]\s*$/.test(l)) emGab = false; else continue; }
    let m;
    if (ehTitulo(l)){ fechar(); const a = acharAula(l), p = padraoNaLinha(l); if (p){ ctxPat = p; ctxAula = aulaDoPadrao(p) || a || ctxAula; } else if (a){ ctxAula = a; ctxPat = null; } continue; }
    if ((m = l.match(RX.pad)) && (!cur || campo!=="p" || cur.o.length)){ const p = acharPadrao(m[1]); if (cur && cur.o.length){ cur._pat = p?p.id:cur._pat; } else { ctxPat = p; ctxAula = aulaDoPadrao(p) || ctxAula; if (cur) cur._pat = p?p.id:""; } continue; }
    if ((m = l.match(RX.aula))){ const a = acharAula("aula "+m[1]) || acharAula(m[1]); if (cur) cur._dest = a; else ctxAula = a; continue; }
    if ((m = l.match(RX.gab)) && cur){ cur._gab = m[1]; campo = null; continue; }
    if ((m = l.match(RX.com)) && cur){ cur.e = m[1]; campo = "e"; continue; }
    if ((m = l.match(RX.fonte)) && cur && !cur.o.length){ cur.fonte = m[1]; continue; }
    const isQ = (m = l.match(RX.q)) && !RX.alt.test(l) || RX.qOnly.test(l);
    if (isQ){
      const mm = l.match(RX.qOnly) ? [null, l.match(RX.qOnly)[1], ""] : l.match(RX.q);
      if (!cur || cur.o.length || cur._gab || campo==="e" || +mm[1] === (cur._num||0)+1 || !cur.p){
        fechar();
        cur = { t:"mc", p:"", b:"", o:[], c:-1, e:"", fonte:"", tag:"", _num:+mm[1], _pat: ctxPat?ctxPat.id:"", _dest: "", _ctxAula: ctxAula };
        let rest = mm[2]||""; const fp = rest.match(RX.fonteParen); if (fp){ cur.fonte = fp[1]; rest = fp[2]; }
        cur.p = rest; campo = "p"; continue;
      }
    }
    if (!cur){
      if (l.length < 90){ const p = acharPadrao(l); const a = acharAula(l); if (p && norm(l).length <= norm(p.nome).length+12){ ctxPat = p; ctxAula = aulaDoPadrao(p) || ctxAula; continue; } if (a){ ctxAula = a; ctxPat = null; continue; } }
      continue;
    }
    if ((m = l.match(RX.alt)) && campo!=="e"){ const idx = m[1]||m[2]; const k = idx.toUpperCase().charCodeAt(0)-65; if (k === cur.o.length){ cur.o.push(m[3]); campo = "o"; continue; } }
    if (campo==="o" && cur.o.length) cur.o[cur.o.length-1] += " " + l;
    else if (campo==="e") cur.e += (cur.e?" ":"") + l;
    else if (campo==="p"){ if (!cur.p && !cur.fonte && (m = l.match(RX.fonteParen))){ cur.fonte = m[1]; if (m[2]) cur.p = m[2]; } else cur.p += (cur.p?"\n":"") + l; }
    else if (!cur.o.length && !cur._gab){ cur.p += "\n" + l; campo = "p"; }
  }
  fechar();
  // completar e classificar
  qs.forEach(q => {
    const g = q._gab || tabela[q._num];
    if (!q.o.length || (g && /^(certo|errado|correto|incorreto)$/i.test(g)) || (q.o.length===2 && /^certo$/i.test(q.o[0]) && /^errado$/i.test(q.o[1]))){
      q.t = "ce"; const parts = q.p.split("\n"); if (parts.length > 1){ q.b = parts.pop(); q.p = parts.join("\n"); } else { q.b = q.p; q.p = "Julgue o item."; } q.o = ["Certo","Errado"];
      q.c = g ? (/^(c|certo|correto)$/i.test(g) ? 0 : /^(e|errado|incorreto)$/i.test(g) ? 1 : -1) : -1;
    } else q.c = g ? letraIdx(g, q.o.length===0?0:q.o.length) : -1;
    if (q.c<0 || q.c>=q.o.length) q.c = -1;
    q.p = q.p.replace(/\s*\n\s*/g," ").trim();
    q.id = uid("q"); q._on = q.c>=0;
    q._avisos = []; if (q.c<0) q._avisos.push("sem gabarito"); if (!q._pat && !q._dest && !q._ctxAula) q._avisos.push("sem padrão/aula");
    if (q.c<0) q.c = 0;
  });
  return qs.filter(q => q.p || q.b);
}
function destinoDe(q){
  if (GEN.destino==="fixa") return GEN.aulaFixa;
  if (q._dest) return q._dest;
  const p = C.padroes.find(x=>x.id===q._pat); const a = aulaDoPadrao(p);
  return a || q._ctxAula || GEN.aulaPadrao || "";
}
function promptExtrair(comMaterial=true){
  const lista = C.padroes.map(p=>`- "${p.id}": ${p.nome}. Sinal: ${p.sinal}`).join("\n");
  const aulas = C.aulas.map(l=>`- "${l.id}": ${l.label} · ${l.titulo}`).join("\n");
  return `Você vai EXTRAIR questões de concurso de um material. NÃO crie questões novas, NÃO reescreva e NÃO corrija o conteúdo: copie o comando, o texto em destaque e as alternativas exatamente como estão.

Para cada questão encontrada:
- "numero": número da questão no material.
- "tipo": "mc" (múltipla escolha) ou "ce" (Certo ou Errado / julgue o item).
- "fonte": banca, cargo e ano, se aparecerem.
- "comando": o enunciado/comando. "destaque": a assertiva a julgar ou o trecho de apoio, se houver.
- "alternativas": a lista das alternativas, sem a letra. Para "ce", use ["Certo","Errado"].
- "correta": índice da resposta segundo o gabarito do material (0 = A ou Certo, 1 = B ou Errado, …). Se o material não trouxer gabarito, use -1.
- "explicacao": o comentário/resolução do material, se houver; senão, vazio.
- "padrao": o id do padrão da lista abaixo. Se o material indicar o padrão ou a aula, use o que ele indica; se não indicar, classifique pelo padrão que mais ajuda a resolver a questão.
- "aula": o id da aula da lista abaixo, somente se o material indicar a aula; senão, vazio.

PADRÕES:
${lista}

AULAS:
${aulas}

Responda apenas com JSON válido, sem texto antes ou depois:
{"questoes":[{"numero":1,"tipo":"mc","fonte":"","comando":"","destaque":"","alternativas":["",""],"correta":0,"explicacao":"","padrao":"","aula":""}]}
${comMaterial ? `\nMATERIAL:\n"""\n${GEN.texto}\n"""` : `\nMATERIAL: o arquivo anexado nesta conversa.`}`;
}
function lerJSON(txt){
  let t = String(txt||"").replace(/```json|```/g,"");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a<0 || b<a) throw new Error("A resposta não tem JSON.");
  const obj = JSON.parse(t.slice(a,b+1));
  const arr = Array.isArray(obj) ? obj : (obj.questoes||[]);
  return arr.map(x => {
    const t2 = x.tipo==="ce" ? "ce" : "mc";
    const o = t2==="ce" ? ["Certo","Errado"] : (x.alternativas||[]).map(String).filter(s=>s.trim());
    let c = Number.isInteger(+x.correta) ? +x.correta : -1; const sem = c<0 || c>=o.length;
    const p = acharPadrao(x.padrao||"") ; const aula = C.aulas.some(l=>l.id===x.aula) ? x.aula : "";
    const q = { id:uid("q"), t:t2, fonte:String(x.fonte||""), p:String(x.comando||""), b:String(x.destaque||""), o, c: sem?0:c, e:String(x.explicacao||""), tag:"", _num:x.numero, _pat:p?p.id:"", _dest:aula, _on:!sem, _avisos: sem?["sem gabarito"]:[] };
    if (!q.p && q.b && t2==="ce") q.p = "Julgue o item.";
    return q;
  }).filter(q => (q.p||q.b) && q.o.length>=2);
}
async function geminiModel(key){
  const cfg = iaCfg(); if (cfg.model) return cfg.model;
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key="+encodeURIComponent(key));
  const j = await r.json(); if (!r.ok) throw new Error((j.error&&j.error.message)||"Chave inválida.");
  const ms = (j.models||[]).filter(m => (m.supportedGenerationMethods||[]).includes("generateContent") && /flash/i.test(m.name) && !/image|tts|audio|live|thinking|exp|8b/i.test(m.name));
  const pick = ms.find(m=>/flash-latest/.test(m.name)) || ms.find(m=>!/lite|preview/.test(m.name)) || ms.find(m=>!/preview/.test(m.name)) || ms[0];
  if (!pick) throw new Error("Nenhum modelo Flash disponível para esta chave.");
  const name = pick.name.replace(/^models\//,""); cfg.model = name; iaSave(cfg); return name;
}
async function lerComGemini(){
  const cfg = iaCfg(); if (!cfg.key) return toast("Cole a chave do Gemini primeiro.");
  if (!GEN.texto.trim()) return toast("Envie o PDF primeiro.");
  GEN.gerando = true; GEN.status = "Lendo com IA…"; render();
  const partes = []; const tx = GEN.texto; const TAM = 60000;
  for (let i=0;i<tx.length;i+=TAM){ let fim = Math.min(tx.length, i+TAM); if (fim<tx.length){ const k = tx.lastIndexOf("\n", fim); if (k>i+TAM*0.6) fim = k; } partes.push(tx.slice(i,fim)); i = fim - TAM; }
  let total = 0;
  try {
    const model = await geminiModel(cfg.key); const orig = GEN.texto;
    for (let k=0;k<partes.length;k++){
      GEN.status = `Lendo com IA: parte ${k+1} de ${partes.length}…`; render();
      GEN.texto = partes[k]; const prompt = promptExtrair(true); GEN.texto = orig;
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cfg.key)}`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ contents:[{role:"user",parts:[{text:prompt}]}], generationConfig:{ responseMimeType:"application/json", temperature:0 } }) });
      const j = await r.json();
      if (!r.ok){ if (r.status===429) throw new Error("Limite gratuito do Gemini atingido por agora. Tente mais tarde ou use a opção com o Claude."); if (r.status===404){ delete cfg.model; iaSave(cfg); } throw new Error((j.error&&j.error.message)||("Erro "+r.status)); }
      const txt = ((j.candidates||[])[0]||{}).content ? j.candidates[0].content.parts.map(p=>p.text||"").join("") : "";
      const qs = lerJSON(txt); GEN.qs.push(...qs); total += qs.length;
    }
    GEN.status = `Pronto: ${total} questões encontradas. Confira abaixo e clique em Adicionar.`;
  } catch(e){ GEN.status = (total?`${total} questões lidas, mas parou: `:"Não foi possível ler: ") + e.message; }
  GEN.gerando = false; render();
}
const MODELO = `AULA 05 · PADRÃO: PALAVRAS RESTRITIVAS

1. (Cebraspe – SEFAZ-DF – 2020) Julgue o item.
A prestação de serviços públicos sob o regime de permissão prescinde de licitação, que é exigida apenas para a concessão.
Gabarito: Errado
Comentário: O “apenas” restringiu demais. Pela CF, concessão e permissão exigem licitação.

2. (IBFC – EBSERH – 2023) O narrador sugere que a infelicidade é:
A) percebida apenas pelos outros, sempre.
B) sempre causada pela ação do outro.
C) sentida ao comparar-se com os outros.
D) um fenômeno ilusório e inexplicável.
Gabarito: C
Comentário: A única sem palavra restritiva.

PADRÃO: TERMOS NEGATIVOS

3. Assinale a INCORRETA.
A) ...
B) ...
C) ...
D) ...
Padrão: Termos negativos
Gabarito: D

GABARITO (opcional, no fim do arquivo, no lugar das linhas "Gabarito:")
1-E  2-C  3-D`;
VIEWS.ia = () => {
  const cfg = iaCfg();
  const fileIn = h("input",{type:"file",multiple:true,accept:".pdf,.pptx,.docx,.txt,.md",style:"display:none",onchange:async e=>{
    const fs = [...e.target.files]; if (!fs.length) return; GEN.lendo = true; GEN.status = "Lendo arquivo…"; render();
    let lidas = 0;
    try { for (const f of fs){ const t = await extrair(f); GEN.texto += (GEN.texto?"\n\n":"") + t; GEN.arquivos.push(f.name);
        const qs = parseQuestoes(t); qs.forEach(q=>{ if (!q.fonte) q.fonte = ""; }); GEN.qs.push(...qs); lidas += qs.length; }
      const sem = GEN.qs.filter(q=>(q._avisos||[]).length).length;
      GEN.status = lidas ? `Leitura automática: ${lidas} questões encontradas${sem?`, ${sem} com pendência (veja os avisos em amarelo)`:""}. Confira e clique em Adicionar.` : "A leitura automática não encontrou questões neste formato. Use “Ler com IA” logo abaixo.";
    } catch(err){ GEN.status = "Erro ao ler: " + err.message; }
    GEN.lendo = false; render(); }});
  const keyIn = h("input",{type:"password",placeholder:"AIza…",oninput:e=>{ const c=iaCfg(); c.key=e.target.value.trim(); delete c.model; iaSave(c); }}); keyIn.value = cfg.key||"";
  const respArea = h("textarea",{rows:4,placeholder:"Cole aqui a resposta do Claude (o JSON)…",oninput:e=>{ GEN.resposta=e.target.value; }}); respArea.value = GEN.resposta;
  const n = GEN.qs.length, on = GEN.qs.filter(q=>q._on).length;
  const aulasOpts = C.aulas.map(l=>[l.id,(l.label||"")+" · "+l.titulo]);
  return h("div",null,
    h("h2",{class:"pagett"},"Importar questões do PDF"),
    h("p",{class:"pagesub"},"Envie o PDF com as suas questões prontas. O painel separa cada questão (enunciado, alternativas, gabarito e comentário) e coloca na aula do padrão certo. Você confere e confirma."),
    GEN.status ? h("div",{class:"note"+(/Erro|Não foi|não encontrou|parou/.test(GEN.status)?" bad":/Pronto|encontradas|adicionadas/.test(GEN.status)?" ok":"")}, GEN.status) : null,
    h("div",{class:"card"}, h("h3",null,"1. Envie o PDF"),
      h("div",{style:"display:flex;gap:8px;align-items:center;flex-wrap:wrap"}, fileIn, btn(GEN.lendo?"Lendo…":"Enviar PDF",()=>fileIn.click(),"btn acc"),
        GEN.arquivos.length ? h("span",{class:"hint"},"Lidos: "+GEN.arquivos.join(", ")) : h("span",{class:"hint"},"Também aceita .docx, .pptx e .txt. Pode enviar vários."),
        (GEN.texto||n) ? btn("Recomeçar",()=>{ GEN.texto=""; GEN.arquivos=[]; GEN.qs=[]; GEN.status=""; GEN.resposta=""; render(); },"btn sm danger") : null),
      h("details",{style:"margin-top:12px"}, h("summary",{style:"cursor:pointer;font-weight:700"},"Como organizar o PDF para a leitura automática (modelo)"),
        h("p",{class:"hint"},"Para cada questão cair na aula certa, coloque antes das questões um título com a aula ou o padrão (ex.: “AULA 05” ou “PADRÃO: PALAVRAS RESTRITIVAS”), ou uma linha “Padrão: …” na própria questão. Numere as questões, use A) B) C)… nas alternativas e informe o gabarito em cada questão ou numa tabela GABARITO no fim."),
        h("pre",{style:"white-space:pre-wrap;background:#f6f7fa;border:1px solid var(--line);border-radius:10px;padding:12px;font-size:12.5px"}, MODELO),
        btn("Copiar modelo",()=>copy(MODELO,"Modelo copiado. Cole no Word, preencha e salve como PDF.")))),
    h("div",{class:"card"}, h("h3",null,"Se o PDF tiver outro formato: ler com IA"),
      h("p",{class:"hint",style:"margin-top:0"},"A IA só extrai as questões como estão no PDF (não cria nem altera) e, se o PDF não indicar, sugere o padrão de cada uma."),
      h("div",{class:"grid2"},
        h("div",{class:"gopt"}, h("b",null,"Automático com Gemini (grátis)"),
          h("p",{class:"hint"},"Crie uma chave grátis em ", h("a",{href:"https://aistudio.google.com/app/apikey",target:"_blank",rel:"noopener"},"aistudio.google.com/app/apikey"), " (conta Google, sem cartão). Fica salva só neste navegador. No plano grátis há limite diário e o Google pode usar o conteúdo enviado para melhorar os produtos dele."),
          field("Chave do Gemini", keyIn),
          btn(GEN.gerando?"Lendo…":"Ler questões com Gemini", ()=>{ if(!GEN.gerando){ GEN.qs = []; lerComGemini(); } }, "btn pri")),
        h("div",{class:"gopt"}, h("b",null,"Com o Claude (sem chave)"),
          h("p",{class:"hint"},"Copie as instruções, abra o Claude, anexe o PDF e cole. Depois copie a resposta e cole abaixo."),
          h("div",{style:"display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"},
            btn("Copiar instruções", ()=>copy(promptExtrair(false),"Instruções copiadas. Anexe o PDF no Claude e cole."), "btn pri"),
            h("a",{class:"btn",href:"https://claude.ai/new",target:"_blank",rel:"noopener"},"Abrir o Claude ↗")),
          respArea,
          btn("Ler resposta", ()=>{ try { const qs = lerJSON(GEN.resposta); if (!qs.length) throw new Error("Nenhuma questão encontrada."); GEN.qs = qs; GEN.resposta=""; GEN.status = `Pronto: ${qs.length} questões lidas. Confira abaixo e clique em Adicionar.`; render(); } catch(e){ GEN.status = "Erro ao ler a resposta: "+e.message+" Confira se colou o JSON completo."; render(); } }, "btn")))),
    n ? h("div",{class:"card"}, h("h3",null,`2. Conferir e adicionar (${on} de ${n} marcadas)`, h("span",{class:"sp"}),
        btn("Marcar todas",()=>{ GEN.qs.forEach(q=>q._on=true); render(); }), btn("Descartar todas",async()=>{ if (await ask("Descartar as questões lidas?",null,"Descartar")){ GEN.qs=[]; GEN.status=""; render(); } },"btn sm danger")),
      h("div",{class:"grid2"},
        sel(GEN,"destino","Onde colocar",[["padrao","Na aula indicada no PDF ou na aula do padrão"],["fixa","Todas numa aula específica"]],{rerender:true}),
        GEN.destino==="fixa" ? sel(GEN,"aulaFixa","Aula de destino",[["","Escolha…"],...aulasOpts],{rerender:true}) : sel(GEN,"aulaPadrao","Se não der para identificar, colocar em",[["","(deixar para eu escolher)"],...aulasOpts],{rerender:true})),
      h("div",{class:"note"},"Confira principalmente as questões com aviso. Questões sem gabarito vêm desmarcadas: marque a alternativa correta e depois marque “Incluir”."),
      GEN.qs.map((q,i)=>{
        const cb = h("input",{type:"checkbox",onchange:e=>{ q._on=e.target.checked; render(); }}); cb.checked = q._on;
        const dest = destinoDe(q), aula = C.aulas.find(l=>l.id===dest);
        return h("div",{class:"gen"+(q._on?"":" off")},
          h("div",{class:"gen-bar"}, h("label",{class:"check",style:"margin:0"}, cb, "Incluir"),
            q._num!==undefined ? h("span",{class:"status"},"Questão "+q._num) : null,
            (q._avisos||[]).map(a=>h("span",{class:"status dirty"},"⚠ "+a)),
            sel(q,"_pat","Padrão",[["","(sem padrão)"],...C.padroes.map(p=>[p.id,p.nome])],{rerender:true}),
            GEN.destino==="fixa" ? null : sel(q,"_dest","Aula",[["", aula?("Automático: "+aula.label+" · "+aula.titulo):"Escolha…"],...aulasOpts],{rerender:true})),
          qEditor(GEN.qs,q,i));
      }),
      h("div",{style:"display:flex;gap:10px;align-items:center;flex-wrap:wrap"},
        btn(`Adicionar ${on} questões às aulas`, ()=>{
          let ok=0, sem=0; const resto=[];
          GEN.qs.forEach(q=>{ if (!q._on){ resto.push(q); return; } const l = C.aulas.find(x=>x.id===destinoDe(q)); if (!l){ sem++; resto.push(q); return; }
            const pn = (C.padroes.find(p=>p.id===q._pat)||{}).nome || "";
            l.q.push({ id:uid("q"), t:q.t, fonte:q.fonte||"", p:q.p, b:q.b, o:q.o.slice(), c:q.c, e:q.e, tag:q.tag||pn }); ok++; });
          GEN.qs = resto;
          GEN.status = `${ok} questões adicionadas às aulas.` + (sem?` ${sem} ficaram sem aula: escolha a aula delas e clique em Adicionar de novo.`:"") + " Clique em Publicar para os alunos verem.";
          changed(); render(); window.scrollTo(0,0); }, "btn acc"),
        h("span",{class:"hint"},"Entram no fim dos exercícios de cada aula. Dá para editar depois em Aulas e exercícios."))) : null
  );
};

/* ---------------- inicialização ---------------- */
$("#btnPrev").onclick = () => togglePreview();
$("#prevReload").onclick = () => { $("#frame").src = "index.html?r="+Date.now()+"#"+previewHash(); };
$("#btnPub").onclick = publish;
$("#btnTab").onclick = () => { try { localStorage.setItem(PREV_KEY, json()); } catch(e){ toast("Rascunho grande demais para abrir em nova aba."); return; } window.open("index.html#"+previewHash(), "_blank"); };
window.addEventListener("beforeunload", e => { if (C && json()!==published){ e.preventDefault(); e.returnValue=""; } });

(async function init(){
  let pub = null, draft = null;
  try { const r = await fetch("content.json?t="+Date.now(), {cache:"no-store"}); if (r.ok) pub = await r.json(); } catch(e){}
  try { const d = localStorage.getItem(DRAFT_KEY); if (d) draft = JSON.parse(d); } catch(e){}
  if (pub) published = JSON.stringify(normalize(pub), null, 1);
  if (draft && draft.content && JSON.stringify(normalize(draft.content),null,1) !== published){
    C = normalize(draft.content);
    const bn = h("div",{class:"banner"}, h("span",null,"Você está editando um rascunho salvo em "+new Date(draft.savedAt).toLocaleString("pt-BR")+", ainda não publicado."), h("span",{style:"flex:1"}),
      btn("Continuar rascunho",()=>bn.remove(),"btn sm pri"),
      btn("Descartar e usar o publicado",()=>{ if(!pub) return; C = normalize(JSON.parse(published)); try{localStorage.removeItem(DRAFT_KEY);}catch(e){} bn.remove(); render(); pushPreview(); },"btn sm"));
    $("#bannerSlot").appendChild(bn);
  } else if (pub){ C = JSON.parse(published); }
  else { $("#ed").innerHTML = '<div class="card note bad">Não foi possível carregar o arquivo content.json. Confira se ele está na mesma pasta do admin.html.</div>'; $("#status").textContent="Erro"; return; }
  render();
  let prevOn = true; try { prevOn = localStorage.getItem("mq-admin-prev") !== "0"; } catch(e){}
  if (prevOn && window.innerWidth > 1100) togglePreview(true);
})();
})();
