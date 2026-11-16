/* =========================== APP =========================== */
(function(){
const $ = (s, el=document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- ícones ---------- */
const P = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="m15 15 5 5m0-5-5 5"/>',
  flag:'<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>',
  scale:'<path d="M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 0 0 6 0zm12 0-3 7a3 3 0 0 0 6 0z"/>',
  loop:'<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15m0 5v-5h5"/>',
  gift:'<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3 8 4s0 4 4 4zm0 0s1.5-5 4-4 0 4-4 4z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  right:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  left:'<path d="M19 12H5m6-6-6 6 6 6"/>',
  bulb:'<path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
  clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 12l2 2 4-4"/>',
  book:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zm16 0h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  pen:'<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
  file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  play:'<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
  spark:'<path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  shuffle:'<path d="M3 7h3c5 0 7 10 12 10h3m0 0-3-3m3 3-3 3M3 17h3c1.5 0 2.7-.9 3.7-2.2M21 7h-3c-1.5 0-2.7.9-3.7 2.2M21 7l-3-3m3 3-3 3"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  download:'<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  redo:'<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5"/>'
};
const ic = (n, s=18, sw=2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||""}</svg>`;
let C, T, MODULES=[], LESSONS=[], PATTERNS=[], PATTERN_DRILL=[], ROUTINE=[], GLOSSARY=[], ALLQ=[], byId={}, A="#f4b324", D3="#1d2850", D4="#3a4a85", ON="#0b1022";
const LOGO = s => (C && C.config.marca.logo) ? `<img class="logo-img" src="${C.config.marca.logo}" alt="" style="height:${s}px;width:auto">` : `<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="9" fill="${A}"/><rect x="8" y="8" width="24" height="24" rx="5" fill="none" stroke="${ON}" stroke-width="3"/><path d="M14 14l12 12M26 14 14 26" stroke="${ON}" stroke-width="4" stroke-linecap="round"/></svg>`;

/* ---------- estado ---------- */
const KEY = "mq-guia-aluno-v1";
let S = { done:{}, ans:{}, chk:{} };
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch(e){}
let USER = null, pushTimer = null, pushing = false;
const cleanS = () => JSON.parse(JSON.stringify({ done:S.done||{}, ans:S.ans||{}, chk:S.chk||{} }));
function pushNow(){
  if (!USER || !window.MQNuvem) return;
  clearTimeout(pushTimer); pushTimer = null;
  const data = Object.assign(cleanS(), { email: USER.email || "", nome: USER.displayName || "" });
  MQNuvem.salvarProgresso(USER.uid, data).then(()=>setSync("ok")).catch(()=>setSync("erro"));
}
function setSync(st){ const el = document.getElementById("syncState"); if (el) el.textContent = st==="ok" ? "Progresso salvo na sua conta" : st==="erro" ? "Sem conexão: salvo neste aparelho e enviaremos depois" : "Salvando…"; if (st==="erro") pushTimer = setTimeout(pushNow, 15000); }
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(Object.assign({}, S, { owner: USER ? USER.uid : "" }))); } catch(e){}
  if (USER){ setSync("..."); clearTimeout(pushTimer); pushTimer = setTimeout(pushNow, 1200); }
};
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && pushTimer) pushNow(); });

/* ids das questões */
function setup(c){
  C = c;
  MODULES = c.modulos||[]; PATTERNS = c.padroes||[]; PATTERN_DRILL = c.treino||[]; ROUTINE = c.rotina||[]; GLOSSARY = c.glossario||[];
  const mids = new Set(MODULES.map(m=>m.id));
  LESSONS = MODULES.flatMap(m => (c.aulas||[]).filter(l => l.mod===m.id));
  (c.aulas||[]).filter(l=>!mids.has(l.mod)).forEach(l=>LESSONS.push(l));
  LESSONS.forEach(l => { l.q = l.q||[]; l.passos=l.passos||[]; l.antes=l.antes||[]; l.check=l.check||[]; l.q.forEach((q,i) => { if (!q.id) q.id = l.id + "-q" + (i+1); }); });
  PATTERN_DRILL.forEach((q,i)=>{ if(!q.id) q.id="d"+(i+1); });
  ALLQ = LESSONS.flatMap(l => l.q.map(q => Object.assign({ lesson:l.id }, q)));
  byId = Object.fromEntries(LESSONS.map(l => [l.id, l]));
  T = MQTema.apply(c.config.tema);
  A = T.destaque; D3 = MQTema.mix(T.escuro,"#ffffff",.12); D4 = MQTema.mix(T.escuro,"#ffffff",.25); ON = MQTema.contrast(T.destaque,"#ffffff")>3 ? "#ffffff" : T.escuro;
  document.title = c.config.marca.tituloPagina || "Guia do Aluno";
  const mk = c.config.marca;
  $("#brand").innerHTML = `<span>${LOGO(40)}</span><span class="brand-word">${mk.nome?`<b>${esc(mk.nome)}</b>`:""}${mk.sub?`<small>${esc(mk.sub)}</small>`:""}</span>`;
  $("#sideLabel").textContent = mk.rotulo || "";
  $("#sideFootNote").textContent = c.config.rodape || "";
  const mn = c.config.menu || {};
  $("#topQuadro").style.display = mn.quadro===false ? "none" : "";
  $("#topMat").style.display = mn.materiais===false ? "none" : "";
  $("#topEx").style.display = mn.exercicios===false ? "none" : "";
}
const modOf = id => MODULES.find(m => m.id === id);
const lessonsOf = m => LESSONS.filter(l => l.mod === m);
const shortTitle = l => { if (l.curto) return l.curto; const t = l.titulo.replace(/^Padrão:\s*/,"").replace(/^Aplicação de modelagem em prova da\s*/,"Prova "); return t.charAt(0).toUpperCase()+t.slice(1); };

function stats(){
  const done = LESSONS.filter(l => S.done[l.id]).length;
  let answered=0, right=0;
  ALLQ.forEach(q => { if (S.ans[q.id] !== undefined){ answered++; if (S.ans[q.id] === q.c) right++; } });
  return { done, total:LESSONS.length, pct:Math.round(done/LESSONS.length*100), answered, right, qtotal:ALLQ.length };
}
const nextLesson = () => LESSONS.find(l => !S.done[l.id]) || LESSONS[0];

/* ---------- capa gerada ---------- */
function cover(l, big=false, badge=""){
  const m = modOf(l.mod) || {n:""};
  const num = (String(l.label||"").match(/\d+/)||[m.n])[0];
  return `<div class="cover${big?" big":""}${l.capa?" has-img":""}"${l.capa?` style="background-image:url('${l.capa}')"`:""}>
    <div class="cmark">${LOGO(big?20:13)} ${esc(C.config.marca.nome||"")}</div>
    ${badge}
    <div class="clab">${esc(l.label.toUpperCase())} · MÓDULO ${m.n}</div>
    <div class="ctit">${esc(shortTitle(l))}</div>
    <div class="cbig">${esc(num)}</div>
  </div>`;
}

/* ---------- sidebar ---------- */
function navNum(l){ if (l.sigla) return l.sigla; const lb = String(l.label||""); if (/^C\/E/.test(lb)) return "C/E"; const m = lb.match(/\d+(\.\d+)?/); if (m) return m[0]; return lb.slice(0,5) || "•"; }
function renderSide(filter=""){
  const f = filter.trim().toLowerCase();
  const cur = location.hash.slice(1) || "inicio";
  let html = "";
  let any = false;
  MODULES.forEach(m => {
    const ls = lessonsOf(m.id).filter(l => !f || (l.titulo+" "+l.label+" "+(l.grupo||"")).toLowerCase().includes(f));
    if (!ls.length) return;
    any = true;
    html += `<div class="nav-sec">${ic(m.icon||"grid",14)} ${m.n} · ${esc(m.nome)}</div>`;
    let g = null;
    ls.forEach(l => {
      if (l.grupo && l.grupo !== g && !f){ g = l.grupo; html += `<div class="nav-sub">${esc(g)}</div>`; }
      const num = navNum(l);
      html += `<a class="nav-item${cur===l.id?" on":""}${S.done[l.id]?" done":""}" href="#${l.id}"><span class="nav-num">${S.done[l.id]?ic("check",12,3):esc(num)}</span><span>${esc(l.label.startsWith("C/E")? l.titulo.replace("Certo e Errado: ","C/E · ") : shortTitle(l))}</span></a>`;
    });
  });
  const mn = C.config.menu || {};
  const tools = [["quadro","grid","Quadro de padrões"],["exercicios","target","Exercícios e desempenho"],["simulado","shuffle","Simulado misto"],["materiais","folder","Materiais e termos"]].filter(t => mn[t[0]]!==false);
  if (!f && tools.length){
    html += `<div class="nav-sec">${ic("spark",14)} Ferramentas</div>` + tools.map(t=>`<a class="nav-item${cur===t[0]?" on":""}" href="#${t[0]}"><span class="nav-num">${ic(t[1],12)}</span><span>${t[2]}</span></a>`).join("");
  }
  $("#nav").innerHTML = any || !f ? html : `<div class="nores">Nada encontrado para “${esc(filter)}”.</div>`;
  $("#homeLink").classList.toggle("on", cur==="inicio");
  const st = stats();
  $("#sideProg").innerHTML = `<div class="ring dark" style="--p:${st.pct}" data-l="${st.pct}%"></div><div><b>${st.done} / ${st.total}</b><small>aulas concluídas</small></div>`;
  const ub = $("#userBox");
  if (USER){ ub.style.display=""; ub.innerHTML = `<div class="ub-mail" title="${esc(USER.email||"")}">${ic("check",12,3)} ${esc(USER.email||"Conectado")}</div><div class="ub-row"><span id="syncState">Progresso salvo na sua conta</span><button id="btnSair" type="button">Sair</button></div>`; }
  else ub.style.display="none";
  $("#sideFootNote").style.display = USER ? "none" : "";
}

/* ---------- quiz ---------- */
function quizHTML(qs, scope){
  return `<div class="quiz" data-scope="${scope}">` + qs.map((q,i) => qcardHTML(q,i)).join("") + `</div>`;
}
function qcardHTML(q, i, transient){
  const a = transient ? transient[q.id] : S.ans[q.id];
  const answered = a !== undefined;
  const opts = q.o.map((t,k) => {
    let lt = q.t==="ce" ? t[0] : String.fromCharCode(65+k), txt = t;
    const m = /^([A-E])\)\s*/.exec(t); if (m){ lt = m[1]; txt = t.slice(m[0].length); }
    let cls = "opt";
    if (answered){ if (k===q.c) cls+=" right"; else if (k===a) cls+=" wrong"; else cls+=" dim"; }
    return `<button class="${cls}" data-q="${q.id}" data-k="${k}" ${answered?"disabled":""}><span class="lt">${lt}</span><span>${esc(txt)}</span></button>`;
  }).join("");
  const fb = answered ? `<div class="fb ${a===q.c?"ok":"no"}">${ic(a===q.c?"check":"x",18,2.5)}<div><b>${a===q.c?"Isso! Você acertou.":"Não foi dessa vez. Veja o porquê:"}</b>${esc(q.e)}</div></div>` : "";
  return `<div class="qcard ${q.t}" id="card-${q.id}">
    <div class="qmeta"><span class="qn">${String(i+1).padStart(2,"0")}</span><span class="qtag">${esc(q.tag||"")}</span>${q.t==="ce"?'<span class="chip">Certo ou Errado</span>':""}</div>
    ${q.fonte?`<div class="qsrc">${ic("file",13)} ${esc(q.fonte)}</div>`:""}
    <p class="qp">${esc(q.p)}</p>
    ${q.b?`<div class="qb">${esc(q.b)}</div>`:""}
    <div class="opts">${opts}</div>${fb}
  </div>`;
}
function scoreOf(qs, store=S.ans){
  let n=0, r=0; qs.forEach(q => { if (store[q.id]!==undefined){ n++; if (store[q.id]===q.c) r++; } });
  return { n, r, t:qs.length };
}

/* ---------- views ---------- */
function viewHome(){
  const H = C.config.home || {}, SEC = H.secoes || {};
  if (!LESSONS.length) return `<div class="loading">Nenhuma aula cadastrada ainda. Use o painel admin para criar a primeira.</div>`;
  const st = stats(), nx = nextLesson();
  const acc = st.answered ? Math.round(st.right/st.answered*100) : 0;
  const routineArt = [
    `<svg width="110" height="80" viewBox="0 0 110 80" fill="none"><rect x="14" y="10" width="62" height="60" rx="6" fill="${D3}" stroke="${A}" stroke-width="2"/><path d="M45 10v60" stroke="${A}" stroke-opacity=".5"/><g stroke="#cfd6ea" stroke-width="3" stroke-linecap="round"><path d="M22 22h16M22 34h14M22 46h16M22 58h12"/><path d="M53 22h16M53 34h10M53 46h14M53 58h12" stroke-opacity=".5"/></g><rect x="70" y="40" width="28" height="30" rx="5" fill="${A}"/><path d="M78 50l12 12M90 50 78 62" stroke="${ON}" stroke-width="3" stroke-linecap="round"/></svg>`,
    `<svg width="110" height="80" viewBox="0 0 110 80" fill="none"><rect x="10" y="12" width="90" height="54" rx="8" fill="${D3}" stroke="${D4}" stroke-width="2"/><circle cx="55" cy="39" r="16" fill="${A}"/><rect x="49" y="31" width="4" height="16" rx="1" fill="${ON}"/><rect x="57" y="31" width="4" height="16" rx="1" fill="${ON}"/><path d="M18 60h74" stroke="${D4}" stroke-width="3"/><path d="M18 60h40" stroke="${A}" stroke-width="3"/></svg>`,
    `<svg width="110" height="80" viewBox="0 0 110 80" fill="none"><rect x="20" y="8" width="70" height="64" rx="7" fill="${D3}" stroke="${D4}" stroke-width="2"/><g stroke-width="2"><circle cx="34" cy="24" r="6" stroke="#cfd6ea"/><circle cx="34" cy="40" r="6" fill="${A}" stroke="${A}"/><circle cx="34" cy="56" r="6" stroke="#cfd6ea"/></g><path d="M31 40l2.5 2.5L38 37" stroke="${ON}" stroke-width="2.4" stroke-linecap="round"/><g stroke="#cfd6ea" stroke-width="3" stroke-linecap="round"><path d="M46 24h30M46 56h24"/><path d="M46 40h34" stroke="${A}"/></g></svg>`,
    `<svg width="110" height="80" viewBox="0 0 110 80" fill="none"><rect x="16" y="10" width="54" height="60" rx="6" fill="${D3}" stroke="${D4}" stroke-width="2"/><g stroke="#cfd6ea" stroke-width="3" stroke-linecap="round"><path d="M26 24h34M26 36h28M26 48h32"/></g><circle cx="74" cy="48" r="16" stroke="${A}" stroke-width="4"/><path d="M86 60l10 10" stroke="${A}" stroke-width="5" stroke-linecap="round"/><path d="M67 48l5 5 9-9" stroke="${A}" stroke-width="3" stroke-linecap="round"/></svg>`
  ];
  let path = "";
  MODULES.forEach(m => {
    const ls = lessonsOf(m.id), d = ls.filter(l=>S.done[l.id]).length;
    if (!ls.length) return;
    let g = null, cards = "";
    ls.forEach(l => {
      if (l.grupo && l.grupo !== g){ g = l.grupo; cards += `</div><div class="subgrp">${esc(g)}</div><div class="lgrid">`; }
      const badge = S.done[l.id] ? `<span class="badge ok">Concluída</span>` : (l.id===nx.id ? `<span class="badge">Próxima</span>` : "");
      cards += `<a class="lcard" href="#${l.id}">${cover(l,false,badge)}<div class="body"><small>${esc(l.label)}</small><h5>${esc(l.titulo)}</h5><div class="q">${ic("target",13)} ${l.q.length} exercício${l.q.length>1?"s":""}</div></div></a>`;
    });
    path += `<div class="card mod${d===ls.length?" complete":""}">
      <div class="mod-head"><div class="mod-ic">${ic(m.icon||"grid",28,1.8)}</div><div><div class="eyebrow">Módulo ${m.n} · ${ls.length} aula${ls.length>1?"s":""}</div><h3>${esc(m.nome)}</h3><p>${esc(m.sub)}</p></div><span class="pill${d===ls.length?" ok":""}">${d}/${ls.length}</span></div>
      <div class="lgrid">${cards}</div></div>`;
  });
  path = path.replace(/<div class="lgrid"><\/div>/g,"");
  return `
  <section class="hero">
    <div>
      <div class="eyebrow">${esc(H.eyebrow||"")}</div>
      <h1>${esc(H.titulo||"")}${H.tituloDestaque?`<br><em>${esc(H.tituloDestaque)}</em>`:""}</h1>
      <p>${esc(H.texto||"")}</p>
      <div class="hero-btns">${nx?`<a class="btn btn-gold" href="#${nx.id}">${st.done?"Continuar de onde parei":esc(H.botao||"Começar")} ${ic("right",18)}</a>`:""}${(C.config.menu||{}).quadro!==false?`<a class="btn btn-ghost" href="#quadro">${ic("grid",18)} Quadro de padrões</a>`:""}</div>
      <div class="stats"><div><b>${LESSONS.length}</b><small>aulas guiadas</small></div><div><b>${ALLQ.length}</b><small>exercícios com correção</small></div><div><b>${PATTERNS.length}</b><small>padrões no quadro</small></div></div>
    </div>
    <div class="hero-art">${heroArt()}</div>
  </section>

  ${SEC.progresso===false?"":`<div class="card progress-card">
    <div class="ring" style="--p:${st.pct}" data-l="${st.pct}%"></div>
    <div><div class="eyebrow">Seu progresso</div><h3>${st.done ? `Você concluiu ${st.done} de ${st.total} aulas.` : "Você ainda não concluiu nenhuma aula."}</h3>
    <div class="meta">Próxima: ${esc(nx.label)} · ${esc(nx.titulo)}${st.answered?` · ${st.right} acertos em ${st.answered} exercícios (${acc}%)`:""}</div></div>
    <a class="btn btn-line go" href="#${nx.id}">${st.done?"Continuar":"Começar"} ${ic("right",16)}</a>
  </div>`}

  ${SEC.rotina===false||!ROUTINE.length?"":`<div class="sec-head"><div class="sec-ic">${ic("list",22)}</div><div><h2>Como assistir cada aula</h2><p>O mesmo ciclo vale para todas as aulas do curso.</p></div></div>
  <div class="routine" style="grid-template-columns:repeat(${Math.min(ROUTINE.length,4)},1fr)">${ROUTINE.map((r,i)=>`<div class="card rcard"><div class="rtop"><span class="rnum">${String(i+1).padStart(2,"0")}</span><span class="rbar" style="opacity:${.35+(i%4)*.2}"></span></div><div class="rimg">${routineArt[i%4]}</div><h4>${esc(r.t)}</h4><p>${esc(r.d)}</p></div>`).join("")}</div>`}

  ${SEC.caminho===false?"":`<div class="sec-head"><div class="sec-ic">${ic("play",22)}</div><div><h2>Seu caminho no curso</h2><p>${LESSONS.length} aulas em ${MODULES.length} módulos.</p></div></div>
  <div class="path">${path}</div>`}`;
}

function heroArt(){
  const rows = [0,1,2,3,4,5];
  const marks = [1,3,0,2,3,1];
  let g = "";
  rows.forEach((r,i) => {
    const y = 74 + i*36;
    g += `<text x="34" y="${y+5}" fill="#8f97b0" font-size="12" font-family="Manrope, sans-serif" font-weight="700">${String(i+1).padStart(2,"0")}</text>`;
    ["A","B","C","D","E"].forEach((L,k) => {
      const x = 74 + k*34, on = marks[i]===k;
      if (on && i===2) g += `<rect x="${x-14}" y="${y-14}" width="28" height="28" rx="8" fill="${A}"/><path d="M${x-7} ${y-7}l14 14M${x+7} ${y-7}l-14 14" stroke="${ON}" stroke-width="3.5" stroke-linecap="round"/>`;
      else g += `<circle cx="${x}" cy="${y}" r="11" fill="${on?"#cfd6ea":"none"}" stroke="${on?"#cfd6ea":"#3a4a85"}" stroke-width="2"/>${on?"":`<text x="${x}" y="${y+4}" text-anchor="middle" fill="#5a6896" font-size="10" font-family="Manrope, sans-serif" font-weight="800">${L}</text>`}`;
    });
  });
  return `<svg width="340" height="330" viewBox="0 0 340 330" fill="none">
    <rect x="12" y="20" width="248" height="290" rx="18" fill="#121a36" stroke="#2c3a6b" stroke-width="2"/>
    <rect x="34" y="38" width="90" height="8" rx="4" fill="${A}"/><rect x="132" y="38" width="50" height="8" rx="4" fill="${D4}"/>
    ${g}
    <g transform="translate(190 168)">
      <rect x="-20" y="0" width="160" height="92" rx="14" fill="#fff"/>
      <text x="-4" y="26" fill="#a0761a" font-size="9.5" font-family="Manrope, sans-serif" font-weight="800" letter-spacing="1">PADRÃO ENCONTRADO</text>
      <text x="-4" y="52" fill="#171b2b" font-size="14" font-family="Manrope, sans-serif" font-weight="700">exigida <tspan fill="#0b1022" font-weight="800">apenas</tspan></text>
      <rect x="46" y="38" width="54" height="20" rx="5" fill="${A}" fill-opacity=".35"/>
      <text x="-4" y="76" fill="#666b7a" font-size="11.5" font-family="Manrope, sans-serif" font-weight="600">palavra restritiva</text>
    </g>
    <circle cx="300" cy="120" r="34" stroke="${A}" stroke-width="6"/><path d="M324 146l14 14" stroke="${A}" stroke-width="8" stroke-linecap="round"/>
    <path d="M286 120l10 10 18-18" stroke="${A}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function viewLesson(l){
  const m = modOf(l.mod), i = LESSONS.indexOf(l);
  const prev = LESSONS[i-1], next = LESSONS[i+1];
  const chk = S.chk[l.id] || [];
  const cdone = l.check.filter((_,k)=>chk[k]).length;
  const pat = l.pat && PATTERNS.find(p=>p.id===l.pat);
  const showPat = (C.config.menu||{}).quadro!==false;
  const sc = scoreOf(l.q);
  const steps = l.passos.map((p,k)=>`<div class="step${k===0?" hl":""}" id="etapa-${k+1}"><div class="n">${k+1}</div><div><small>ETAPA ${k+1}</small><h4>${esc(p.t)}</h4>${p.d.map(x=>`<p>${esc(x)}</p>`).join("")}</div></div>`).join("");
  return `
  <div class="lhead">
    <div>
      <div class="tags"><span class="tag-dark">${esc(l.label.toUpperCase())}</span><span class="chip">${ic(m.icon||"grid",13)} Módulo ${m.n} · ${esc(m.nome)}</span></div>
      <h1>${esc(l.titulo)}</h1>
      <p class="obj">${esc(l.obj)}</p>
      <div class="chips"><span class="chip">${ic("list",13)} ${l.passos.length} etapa${l.passos.length!==1?"s":""}</span><span class="chip">${ic("target",13)} ${l.q.length} exercício${l.q.length>1?"s":""}</span>${pat?`<span class="chip">${ic("grid",13)} Padrão do quadro</span>`:""}</div>
      <div class="acts">
        <button class="donebtn${S.done[l.id]?" on":""}" data-done="${l.id}"><span class="dbx">${S.done[l.id]?ic("check",14,3):""}</span>${S.done[l.id]?"Aula concluída":"Marcar como concluída"}</button>
        ${l.video?`<a class="btn btn-video" href="${esc(l.video)}" target="_blank" rel="noopener">${ic("play",16)} Assistir aula</a>`:""}
        ${l.q.length?`<a class="btn btn-line" href="#" data-jump="exercicios-aula">${ic("target",16)} Ir para os exercícios</a>`:""}
      </div>
    </div>
    ${cover(l,true)}
  </div>

  ${l.dica?`<div class="tip">${ic("bulb",22)}<div>${esc(l.dica)}</div></div>`:""}

  <div class="card box">
    <div class="box-title"><div class="ic">${ic("list",19)}</div><h3>Mapa da aula</h3></div>
    <div class="map">${l.passos.map((p,k)=>`<a href="#" data-jump="etapa-${k+1}"><i>${k+1}</i>${esc(p.t)}</a>`).join("")}${(l.downloads||[]).some(d=>d.link)?`<a href="#" data-jump="downloads-aula"><i>${ic("download",13)}</i>Materiais</a>`:""}${l.q.length?`<a href="#" data-jump="exercicios-aula"><i>${ic("target",13)}</i>Exercícios</a>`:""}</div>
  </div>

  ${(l.downloads||[]).filter(d=>d.link).length?`<div class="card box" id="downloads-aula">
    <div class="box-title"><div class="ic">${ic("download",19)}</div><h3>Materiais para baixar</h3><span class="pill">${(l.downloads||[]).filter(d=>d.link).length}</span></div>
    <div class="dl-list">${l.downloads.filter(d=>d.link).map(dlRow).join("")}</div></div>`:""}

  <div class="card box">
    <div class="box-title"><div class="ic">${ic("clip",19)}</div><h3>Antes de assistir</h3></div>
    <ul class="checklist">${l.antes.map(a=>`<li><span class="tick">${ic("check",13,3)}</span>${esc(a)}</li>`).join("")}</ul>
    <div class="routine-mini" style="margin-top:16px">${ROUTINE.map((r,k)=>`<div><b>${k+1}. ${esc(r.t)}</b><span>${esc(r.d)}</span></div>`).join("")}</div>
  </div>

  <div class="sec-head"><div class="sec-ic">${ic("play",22)}</div><div><h2>Siga esta ordem</h2><p>${l.passos.length} etapas. Pause o vídeo nas questões e tente antes da resolução.</p></div></div>
  <div class="steps">${steps}</div>

  ${pat?`<div class="card box"><div class="box-title"><div class="ic">${ic("grid",19)}</div><h3>Para o seu quadro de padrões</h3>${showPat?`<a class="pill" href="#quadro" style="text-decoration:none">Ver quadro completo</a>`:""}</div>
    <div class="patbox"><div><b>Padrão</b><p><strong>${esc(pat.nome)}</strong></p></div><div><b>Sinal</b><p>${esc(pat.sinal)}</p></div><div><b>O que fazer</b><p>${esc(pat.acao)}</p></div><div><b>Exemplo da aula</b><p>${esc(pat.ex)}</p></div></div></div>`:""}

  ${l.q.length?`<div class="sec-head" id="exercicios-aula"><div class="sec-ic">${ic("target",22)}</div><div><h2>Pratique agora</h2><p>Responda depois de assistir. A correção aparece na hora e fica salva neste navegador.</p></div></div>
  <div class="qhead"><div class="qscore"><span class="pill">${sc.n} de ${sc.t} respondidas</span>${sc.n?`<span class="pill ok">${sc.r} acerto${sc.r!==1?"s":""}</span>`:""}</div></div>
  ${quizHTML(l.q, l.id)}
  ${sc.n===sc.t?`<div class="result">${ic("spark",28)}<div><h4>${sc.r} de ${sc.t} acertos nesta aula</h4><p>${sc.r===sc.t?"Excelente! Anote o padrão no seu quadro e avance.":"Releia as explicações das que errou e, se precisar, reveja o trecho da aula."}</p></div><button class="btn btn-gold" data-reset="${l.id}" style="margin-left:auto">${ic("redo",16)} Refazer</button></div>`:(sc.n?`<div class="qfoot"><span></span><button class="linkbtn" data-reset="${l.id}">${ic("redo",15)} Refazer exercícios desta aula</button></div>`:"")}`:""}

  ${l.check.length?`<div class="card box" style="margin-top:30px">
    <div class="box-title"><div class="ic">${ic("check",19)}</div><h3>Confira antes de avançar</h3><span class="pill">${cdone} de ${l.check.length}</span></div>
    <div class="bar"><i style="width:${cdone/l.check.length*100}%"></i></div>
    <ul class="chk">${l.check.map((c,k)=>`<li class="${chk[k]?"on":""}" data-chk="${l.id}" data-k="${k}"><span class="cb">${ic("check",13,3)}</span><span>${esc(c)}</span></li>`).join("")}</ul>
  </div>`:""}

  <div class="pn">
    ${prev?`<a href="#${prev.id}">${"<small>"+ic("left",13)+" ANTERIOR</small>"}<b>${esc(prev.titulo)}</b></a>`:`<a href="#inicio"><small>${ic("left",13)} INÍCIO</small><b>Voltar ao início do guia</b></a>`}
    ${next?`<a class="next" href="#${next.id}"><small>PRÓXIMA · ${esc(next.label.toUpperCase())} ${ic("right",13)}</small><b>${esc(next.titulo)}</b></a>`:`<a class="next" href="#${(C.config.menu||{}).simulado===false?"inicio":"simulado"}"><small>FECHE O CURSO ${ic("right",13)}</small><b>${(C.config.menu||{}).simulado===false?"Voltar ao início":"Fazer o simulado misto"}</b></a>`}
  </div>`;
}

function viewPatterns(){
  return `
  <div class="pagehead"><span class="eyebrow">Ferramenta</span><h1>Quadro de padrões</h1>
  <p>Os padrões apresentados no curso, com o sinal para reconhecer cada um, o que fazer e um exemplo das aulas. Use esta página durante as aulas e como base para desenhar o seu quadro na prova.</p></div>

  <div class="card howto" style="margin-top:28px">
    <div><h3 style="font-size:20px;font-weight:800;margin-bottom:10px">Como montar o seu na prova</h3>
    <ol><li>Ache um espaço em branco no caderno de prova (nunca no cartão de respostas).</li><li>Desenhe duas colunas: <b>padrão</b> e <b>exemplo</b>.</li><li>Escreva de forma curta todos os padrões de que lembrar.</li><li>Leia as alternativas comparando com o quadro e marque todos os padrões que encontrar.</li><li>Use a técnica só nas questões que você não sabe pelo estudo.</li></ol></div>
    <div class="sheet"><div class="h">PADRÃO</div><div class="h">EXEMPLO</div>
      <div>Tamanho</div><div>muito maior / menor</div><div>Restritivas</div><div>apenas, somente</div><div>Excludentes</div><div>qualquer, todos</div><div>Negativos</div><div>não</div><div>Poderá / deverá</div><div>pode × deve</div><div>Mais repetidos</div><div>contar por posição</div><div>…</div><div>…</div></div>
  </div>

  <div class="sec-head"><div class="sec-ic">${ic("grid",22)}</div><div><h2>Os ${PATTERNS.length} padrões</h2><p>Um card para cada padrão, com o link da aula.</p></div></div>
  <div class="pgrid">${PATTERNS.map((p,i)=>{ const l = byId[p.aula]; return `<div class="card pcard"><div class="top"><div class="num">${String(i+1).padStart(2,"0")}</div><h3>${esc(p.nome)}</h3></div><div class="sig"><b>Sinal:</b> ${esc(p.sinal)}</div><p>${esc(p.acao)}</p><div class="ex">${ic("file",13)} ${esc(p.ex)}</div>${l?`<a href="#${p.aula}">Ver ${esc(String(l.label).toLowerCase())} ${ic("right",13)}</a>`:""}</div>`;}).join("")}</div>

  <div class="sec-head"><div class="sec-ic">${ic("target",22)}</div><div><h2>Treino relâmpago</h2><p>Qual padrão está em cada situação? ${PATTERN_DRILL.length} questões rápidas.</p></div></div>
  ${PATTERN_DRILL.length?quizHTML(PATTERN_DRILL, "drill"):""}
  ${scoreOf(PATTERN_DRILL).n?`<div class="qfoot"><span class="pill">${scoreOf(PATTERN_DRILL).r} de ${PATTERN_DRILL.length} acertos</span><button class="linkbtn" data-reset="drill">${ic("redo",15)} Refazer treino</button></div>`:""}`;
}

function viewExercises(){
  const st = stats();
  const acc = st.answered ? Math.round(st.right/st.answered*100) : 0;
  const rows = MODULES.map(m => {
    const qs = ALLQ.filter(q => byId[q.lesson].mod===m.id), s = scoreOf(qs);
    return `<div class="modrow"><div class="mod-ic" style="width:40px;height:40px;border-radius:11px">${ic(m.icon||"grid",18)}</div><div class="nm">${m.n} · ${esc(m.nome)}<div style="font-size:12.5px;color:var(--muted);font-weight:600">${s.n} de ${s.t} respondidas${s.n?` · ${s.r} acertos`:""}</div></div><div class="bar"><i style="width:${s.n/s.t*100}%"></i></div></div>`;
  }).join("");
  const pend = LESSONS.filter(l => scoreOf(l.q).n < l.q.length);
  const weak = LESSONS.filter(l => { const s=scoreOf(l.q); return s.n && s.r < s.n; });
  return `
  <div class="pagehead"><span class="eyebrow">Ferramenta</span><h1>Exercícios e desempenho</h1><p>Acompanhe quantos exercícios você já fez, seu índice de acertos e as aulas que valem uma revisão.</p></div>
  <div class="statrow" style="margin-top:26px">
    <div class="card stat"><b>${st.answered}<span style="font-size:18px;color:var(--muted)">/${st.qtotal}</span></b><small>exercícios respondidos</small></div>
    <div class="card stat"><b>${st.right}</b><small>acertos</small></div>
    <div class="card stat"><b>${acc}%</b><small>índice de acertos</small></div>
    <div class="card stat"><b>${st.done}<span style="font-size:18px;color:var(--muted)">/${st.total}</span></b><small>aulas concluídas</small></div>
  </div>
  <div class="card" style="margin-top:16px;padding:8px 6px">${rows}</div>

  ${(C.config.menu||{}).simulado===false?"":`<div class="result" style="margin-top:22px">${ic("shuffle",28)}<div><h4>Simulado misto</h4><p>10 questões sorteadas de todas as aulas, para treinar como se fosse a prova.</p></div><a class="btn btn-gold" href="#simulado" style="margin-left:auto">Fazer simulado ${ic("right",16)}</a></div>`}

  ${weak.length?`<div class="sec-head"><div class="sec-ic">${ic("redo",22)}</div><div><h2>Vale revisar</h2><p>Aulas em que você errou pelo menos um exercício.</p></div></div>
  <div class="lgrid">${weak.map(l=>{const s=scoreOf(l.q);return `<a class="lcard" href="#${l.id}">${cover(l)}<div class="body"><small>${esc(l.label)}</small><h5>${esc(l.titulo)}</h5><div class="q">${s.r} de ${s.n} acertos</div></div></a>`;}).join("")}</div>`:""}

  <div class="sec-head"><div class="sec-ic">${ic("target",22)}</div><div><h2>Exercícios por aula</h2><p>${pend.length ? `${pend.length} aula${pend.length>1?"s":""} com exercícios pendentes.` : "Você respondeu todos os exercícios. Parabéns!"}</p></div></div>
  <div class="card" style="padding:6px 6px">${LESSONS.map(l=>{const s=scoreOf(l.q);return `<a class="modrow" href="#${l.id}" data-jumpafter="exercicios-aula" style="text-decoration:none"><span class="nav-num" style="background:var(--accent-soft);color:var(--accent-ink)">${esc(navNum(l))}</span><div class="nm">${esc(l.titulo)}<div style="font-size:12.5px;color:var(--muted);font-weight:600">${s.n} de ${s.t} respondidas${s.n?` · ${s.r} acertos`:""}</div></div>${s.n===s.t?`<span class="pill ok">Feito</span>`:`<span class="pill">Praticar</span>`}</a>`;}).join("")}</div>`;
}

/* simulado (não salva no progresso) */
let SIM = null;
function newSim(){ const pool = ALLQ.slice(); if (!pool.length){ SIM={qs:[],ans:{}}; return; } for (let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; } SIM = { qs: pool.slice(0,Math.min(10,pool.length)).map((q,i)=>Object.assign({},q,{id:"sim"+i+"-"+q.id})), ans:{} }; }
function viewSim(){
  if (!SIM) newSim();
  const s = scoreOf(SIM.qs, SIM.ans);
  return `
  <div class="pagehead"><span class="eyebrow">Ferramenta</span><h1>Simulado misto</h1><p>10 questões sorteadas de todo o curso. Desenhe o quadro de padrões num papel, marque o tempo e responda como se fosse a prova. O simulado não altera o progresso das aulas.</p></div>
  <div class="qhead" style="margin-top:22px"><span class="pill">${s.n} de ${SIM.qs.length} respondidas</span>${s.n?`<span class="pill ok">${s.r} acertos</span>`:""}<button class="linkbtn" data-newsim style="margin-left:auto">${ic("shuffle",15)} Sortear outras questões</button></div>
  <div class="quiz" data-scope="sim">${SIM.qs.map((q,i)=>qcardHTML(q,i,SIM.ans).replace('class="qsrc">', `class="qsrc">${esc(byId[q.lesson].label)} · `)).join("")}</div>
  ${s.n===SIM.qs.length&&s.n?`<div class="result">${ic("spark",28)}<div><h4>Resultado: ${s.r} de ${s.t} (${Math.round(s.r/s.t*100)}%)</h4><p>${s.r/s.t>=.9?"Alta performance! Continue praticando para manter.":s.r/s.t>=.7?"Bom resultado. Revise as explicações das que errou.":"Volte às aulas dos padrões que você errou e refaça o simulado."}</p></div><button class="btn btn-gold" data-newsim style="margin-left:auto">${ic("shuffle",16)} Novo simulado</button></div>`:""}`;
}

function dlRow(d){
  const t = String(d.tipo||"PDF").toUpperCase(), isFile = ["PDF","ZIP","DOC","PLANILHA","IMAGEM","ÁUDIO","AUDIO"].includes(t);
  return `<a class="dl" href="${esc(d.link)}" target="_blank" rel="noopener"><span class="fi">${ic(isFile?"file":"right",18)}<em>${esc(t)}</em></span><span class="dl-t"><b>${esc(d.titulo||"Material")}</b>${d.desc?`<small>${esc(d.desc)}</small>`:""}</span><span class="dl-b">${ic(isFile?"download":"right",15)} ${isFile?"Baixar":"Abrir"}</span></a>`;
}
function viewMaterials(){
  const M = C.materiais || {}, B = M.bonus || {};
  const itens = M.itens || [], rot = M.rotinaEstudo || [];
  const perLesson = LESSONS.filter(l => (l.downloads||[]).some(d=>d.link));
  const tico = t => ({PDF:"book",WEB:"grid",AULA:"play",ZIP:"folder",LINK:"right",VÍDEO:"play",VIDEO:"play"}[String(t||"").toUpperCase()]||"file");
  const ext = u => /^https?:/i.test(u||"");
  return `
  <div class="pagehead"><span class="eyebrow">Consulta rápida</span><h1>Seus materiais de estudo.</h1><p>Bônus, arquivos do curso, rotina de estudo e os termos que você vai ouvir nas aulas.</p></div>
  <div class="tags" style="margin-top:18px">${B.ativo!==false?`<a class="chip" href="#" data-jump="m-bonus">${ic("gift",13)} Bônus</a>`:""}${itens.length?`<a class="chip" href="#" data-jump="m-mat">${ic("folder",13)} Materiais do curso</a>`:""}${perLesson.length?`<a class="chip" href="#" data-jump="m-dl">${ic("download",13)} Downloads das aulas</a>`:""}${rot.length?`<a class="chip" href="#" data-jump="m-rotina">${ic("list",13)} Rotina de estudo</a>`:""}${GLOSSARY.length?`<a class="chip" href="#" data-jump="m-termos">${ic("book",13)} Termos</a>`:""}</div>

  ${B.ativo!==false?`<section class="bonus" id="m-bonus" style="margin-top:20px">
    <div><div class="eyebrow" style="color:var(--accent)">${ic("gift",14)} ${esc(B.eyebrow||"")}</div><h2>${esc(B.titulo||"")}</h2><p>${esc(B.texto||"")}</p>${B.botao?`<a class="btn btn-gold" href="${esc(B.link||"#")}" ${ext(B.link)?'target="_blank" rel="noopener"':""} style="margin-top:8px">${esc(B.botao)} ${ic("right",16)}</a>`:""}</div>
    <div class="pillars" style="grid-template-columns:repeat(${Math.max(1,Math.min((B.pilares||[]).length,3))},1fr)">${(B.pilares||[]).map((p,i)=>`<div class="pillar">${ic(["target","list","pen"][i%3],26)}<b>${esc(p.t)}</b><span>${esc(p.d)}</span></div>`).join("")}</div>
  </section>`:""}

  ${itens.length?`<div class="sec-head" id="m-mat"><div class="sec-ic">${ic("folder",22)}</div><div><h2>Materiais do curso</h2><p>Arquivos e atalhos para consulta.</p></div></div>
  <div class="mgrid">${itens.map(m=>`<a class="card mitem" href="${esc(m.link||"#")}" ${ext(m.link)?'target="_blank" rel="noopener"':""}><div class="fi">${ic(tico(m.tipo),20)}<em>${esc(String(m.tipo||"LINK").toUpperCase())}</em></div><div style="flex:1"><h4>${esc(m.titulo)}</h4><p>${esc(m.desc||"")}</p></div>${ext(m.link)?`<span class="dl-b" style="align-self:center">${ic(["PDF","ZIP"].includes(String(m.tipo).toUpperCase())?"download":"right",15)} ${["PDF","ZIP"].includes(String(m.tipo).toUpperCase())?"Baixar":"Abrir"}</span>`:""}</a>`).join("")}</div>`:""}

  ${perLesson.length?`<div class="sec-head" id="m-dl"><div class="sec-ic">${ic("download",22)}</div><div><h2>Downloads das aulas</h2><p>Todos os arquivos das aulas em um só lugar.</p></div></div>
  ${perLesson.map(l=>`<div class="card box" style="margin-top:12px"><div class="box-title" style="margin-bottom:10px"><span class="tag-dark">${esc(l.label||"")}</span><h3 style="font-size:16px"><a href="#${l.id}" style="text-decoration:none">${esc(l.titulo)}</a></h3></div><div class="dl-list">${l.downloads.filter(d=>d.link).map(dlRow).join("")}</div></div>`).join("")}`:""}

  ${rot.length?`<div class="sec-head" id="m-rotina"><div class="sec-ic">${ic("list",22)}</div><div><h2>Rotina sugerida de estudo</h2><p>Para tirar o máximo do curso.</p></div></div>
  <div class="card box" style="margin-top:0"><ul class="checklist">${rot.map((r,i)=>`<li><span class="tick">${i+1}</span><div><b>${esc(r.t)}</b> ${esc(r.d)}</div></li>`).join("")}</ul></div>`:""}

  ${GLOSSARY.length?`<div class="sec-head" id="m-termos"><div class="sec-ic">${ic("book",22)}</div><div><h2>Termos que você vai usar</h2><p>Vocabulário do curso.</p></div></div>
  <div class="terms">${GLOSSARY.map(g=>`<div class="card term"><h4>${esc(g.t)}</h4><p>${esc(g.d)}</p></div>`).join("")}</div>`:""}`;
}

/* ---------- roteador ---------- */
const TITLES = { inicio:"Guia do Aluno", quadro:"Quadro de padrões", exercicios:"Exercícios e desempenho", simulado:"Simulado misto", materiais:"Materiais e termos" };
let pendingJump = null;
function render(){
  const id = location.hash.slice(1) || "inicio";
  const v = $("#view");
  let html, crumb;
  if (byId[id]){ html = viewLesson(byId[id]); crumb = byId[id].label + " · " + byId[id].titulo; v.className = "view narrow"; }
  else if (!C) { return; }
  else if ((C.config.menu||{})[id]===false){ location.hash = "inicio"; return; }
  else if (id==="quadro"){ html = viewPatterns(); crumb = TITLES[id]; v.className="view narrow"; }
  else if (id==="exercicios"){ html = viewExercises(); crumb = TITLES[id]; v.className="view narrow"; }
  else if (id==="simulado"){ html = viewSim(); crumb = TITLES[id]; v.className="view narrow"; }
  else if (id==="materiais"){ html = viewMaterials(); crumb = TITLES[id]; v.className="view narrow"; }
  else { html = viewHome(); crumb = TITLES.inicio; v.className="view"; }
  v.innerHTML = html;
  $("#crumb").innerHTML = `${ic(byId[id]?"play":"home",15)}<span>${esc(crumb)}</span>`;
  renderSide($("#q").value);
  closeSide();
  if (pendingJump){ const el = document.getElementById(pendingJump); pendingJump=null; if (el) setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),30); }
  else window.scrollTo(0,0);
}
function rerenderKeep(){ const y = window.scrollY; const id = location.hash.slice(1)||"inicio"; render(); window.scrollTo(0,y); }

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const opt = e.target.closest(".opt");
  if (opt && !opt.disabled){
    const scope = opt.closest(".quiz").dataset.scope, qid = opt.dataset.q, k = +opt.dataset.k;
    if (scope==="sim"){ SIM.ans[qid]=k; } else { S.ans[qid]=k; save(); }
    rerenderKeep(); return;
  }
  const rs = e.target.closest("[data-reset]");
  if (rs){ const sc = rs.dataset.reset; const qs = sc==="drill" ? PATTERN_DRILL : byId[sc].q; qs.forEach(q=>delete S.ans[q.id]); save(); pendingJump = sc==="drill"?null:"exercicios-aula"; const y=window.scrollY; render(); if(sc==="drill") window.scrollTo(0,y); return; }
  if (e.target.closest("[data-newsim]")){ newSim(); render(); return; }
  const dn = e.target.closest("[data-done]");
  if (dn){ const id = dn.dataset.done; S.done[id] = !S.done[id]; if(!S.done[id]) delete S.done[id]; save(); rerenderKeep(); return; }
  const ck = e.target.closest("[data-chk]");
  if (ck){ const id = ck.dataset.chk, k = +ck.dataset.k; S.chk[id] = S.chk[id]||[]; S.chk[id][k] = !S.chk[id][k];
    const l = byId[id]; if (l.check.every((_,j)=>S.chk[id][j])) S.done[id] = true; save(); rerenderKeep(); return; }
  const jp = e.target.closest("[data-jump]");
  if (jp){ e.preventDefault(); const el = document.getElementById(jp.dataset.jump); if (el) el.scrollIntoView({behavior:"smooth",block:"start"}); return; }
  const ja = e.target.closest("[data-jumpafter]");
  if (ja){ pendingJump = ja.dataset.jumpafter; }
  if (e.target.closest("#burger")){ $("#side").classList.add("open"); $("#scrim").classList.add("open"); }
  if (e.target.closest("#scrim")) closeSide();
});
function closeSide(){ $("#side").classList.remove("open"); $("#scrim").classList.remove("open"); }
$("#q").addEventListener("input", e => renderSide(e.target.value));
document.addEventListener("keydown", e => { if (e.key==="/" && document.activeElement !== $("#q")){ e.preventDefault(); $("#q").focus(); } });
window.addEventListener("hashchange", () => { if (C) render(); });

/* ---------- acesso: código ou login ---------- */
const ACC_KEY = "mq-guia-acesso";
const modo = () => { const G = C.config.acesso || {}; return G.modo || (G.ativo ? "codigo" : "aberto"); };
const entrada = () => { const N = C.config.nuvem || {}; return N.entrada || (N.listaCompradores ? "lista" : "livre"); };
const CONV_KEY = "mq-guia-convite";
function conviteOk(){ const N = C.config.nuvem || {}; if (!N.conviteHash) return false; try { return localStorage.getItem(CONV_KEY) === N.conviteHash; } catch(e){ return false; } }
async function lerConvite(){
  const u = new URL(location.href), k = u.searchParams.get("convite");
  if (!k) return;
  const N = C.config.nuvem || {};
  const h = await MQTema.sha256(MQTema.normCode(k));
  if (h === N.conviteHash){ try { localStorage.setItem(CONV_KEY, h); } catch(e){} }
  u.searchParams.delete("convite"); history.replaceState(null, "", u.pathname + (u.search||"") + u.hash);
}
const nuvemOk = () => { const N = C.config.nuvem || {}; return !!(N.apiKey && N.projectId && N.authDomain); };
function gateShell(inner){
  const mk = C.config.marca;
  let el = $("#gate");
  if (!el){ el = document.createElement("div"); el.className = "gate"; el.id = "gate"; document.body.appendChild(el); }
  el.innerHTML = `<div class="gate-in">
    <div class="brand" style="border:0;padding:0">${LOGO(40)}<span class="brand-word">${mk.nome?`<b>${esc(mk.nome)}</b>`:""}${mk.sub?`<small>${esc(mk.sub)}</small>`:""}</span></div>
    <div class="eyebrow" style="color:var(--accent);margin-top:14px">${esc(mk.rotulo||"")}</div>
    <div class="gate-card">${inner}</div></div>`;
  return el;
}
const helpLink = () => { const G = C.config.acesso || {}; return G.linkAjuda ? ` Precisa de ajuda? <a href="${esc(G.linkAjuda)}" target="_blank" rel="noopener">Fale com o suporte</a>.` : ""; };
function gate(){
  const G = C.config.acesso || {};
  const el = gateShell(`<form id="gateForm">
      <div class="eyebrow" style="color:#8f97b0">Área do aluno</div>
      <h1>${esc(G.titulo||"Entre com o seu código de acesso")}</h1>
      <p>${esc(G.texto||"")}</p>
      <label for="gateCode">Código de acesso</label>
      <input id="gateCode" autocomplete="off" placeholder="Digite o código" autofocus>
      <button class="btn btn-gold" type="submit">Entrar ${ic("right",18)}</button>
      <div class="gate-err" id="gateErr"></div>
      <div class="gate-foot">Neste aparelho, o código fica salvo depois da primeira vez.${helpLink()}</div></form>`);
  $("#gateForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    const h = await MQTema.sha256(MQTema.normCode($("#gateCode").value));
    if (h === G.hash){ try{ localStorage.setItem(ACC_KEY, h); }catch(e){} el.remove(); render(); }
    else $("#gateErr").textContent = "Código incorreto. Confira e tente de novo.";
  });
}
function needsGate(){
  const G = C.config.acesso || {};
  if (modo() !== "codigo" || !G.hash) return false;
  let saved = null; try { saved = localStorage.getItem(ACC_KEY); } catch(e){}
  return saved !== G.hash;
}

/* login do aluno (Firebase) */
function loginView(view, msg){
  const G = C.config.acesso || {}, N = C.config.nuvem || {};
  const precisaConvite = entrada()==="convite" && !conviteOk();
  if (precisaConvite && view === "criar") view = "entrar";
  const membros = (C.config.acesso||{}).linkMembros;
  const google = N.google !== false && !precisaConvite ? `<div class="gate-or"><span>ou</span></div><button class="btn btn-ghost gbtn" type="button" id="gGoogle">${GLOGO} Entrar com Google</button>` : "";
  let inner;
  if (view === "criar") inner = `<form id="lgForm" data-v="criar">
      <div class="eyebrow" style="color:#8f97b0">Primeiro acesso</div>
      <h1>Crie sua senha</h1>
      <p>Use o mesmo e-mail da compra. ${entrada()==="lista"?"Depois, confirme o e-mail pelo link que vamos enviar.":""}</p>
      <label for="lgEmail">E-mail da compra</label><input id="lgEmail" type="email" autocomplete="email" placeholder="voce@email.com" required>
      <label for="lgPass" style="margin-top:12px">Crie uma senha</label><input id="lgPass" type="password" autocomplete="new-password" placeholder="Mínimo de 6 caracteres" required>
      <label for="lgPass2" style="margin-top:12px">Repita a senha</label><input id="lgPass2" type="password" autocomplete="new-password" required>
      <button class="btn btn-gold" type="submit">Criar acesso ${ic("right",18)}</button>
      <div class="gate-err" id="gateErr">${msg?esc(msg):""}</div>
      <div class="gate-foot">Já tem senha? <a href="#" data-lv="entrar">Entrar</a>.${helpLink()}</div></form>`;
  else if (view === "esqueci") inner = `<form id="lgForm" data-v="esqueci">
      <div class="eyebrow" style="color:#8f97b0">Recuperar acesso</div>
      <h1>Esqueci a senha</h1>
      <p>Enviamos um link para você criar uma nova senha.</p>
      <label for="lgEmail">E-mail da compra</label><input id="lgEmail" type="email" autocomplete="email" placeholder="voce@email.com" required>
      <button class="btn btn-gold" type="submit">Enviar link ${ic("right",18)}</button>
      <div class="gate-err" id="gateErr">${msg?esc(msg):""}</div>
      <div class="gate-foot"><a href="#" data-lv="entrar">Voltar para entrar</a>.${helpLink()}</div></form>`;
  else inner = `<form id="lgForm" data-v="entrar">
      <div class="eyebrow" style="color:#8f97b0">Área do aluno</div>
      <h1>${esc(G.tituloLogin||"Entre com o e-mail da compra")}</h1>
      <p>${esc(G.textoLogin||"Seu progresso fica salvo na sua conta e acompanha você em qualquer aparelho.")}</p>
      <label for="lgEmail">E-mail da compra</label><input id="lgEmail" type="email" autocomplete="email" placeholder="voce@email.com" required>
      <label for="lgPass" style="margin-top:12px">Senha</label><input id="lgPass" type="password" autocomplete="current-password" required>
      <button class="btn btn-gold" type="submit">Entrar ${ic("right",18)}</button>
      ${google}
      <div class="gate-err ${msg&&msg.ok?"ok":""}" id="gateErr">${msg?esc(msg.text||msg):""}</div>
      ${precisaConvite
        ? `<div class="gate-foot"><b>Primeiro acesso?</b> Entre pelo link do guia na sua área de membros${membros?` (<a href="${esc(membros)}" target="_blank" rel="noopener">abrir área de membros</a>)`:""} e crie sua senha. · <a href="#" data-lv="esqueci">Esqueci a senha</a>.${helpLink()}</div>`
        : `<div class="gate-foot"><b>Primeiro acesso?</b> <a href="#" data-lv="criar">Crie sua senha</a> · <a href="#" data-lv="esqueci">Esqueci a senha</a>.${helpLink()}</div>`}</form>`;
  const el = gateShell(inner);
  el.querySelectorAll("[data-lv]").forEach(x => x.onclick = e => { e.preventDefault(); loginView(x.dataset.lv); });
  const g = $("#gGoogle"); if (g) g.onclick = async () => { try { await MQNuvem.google(); } catch(e){ $("#gateErr").textContent = MQNuvem.erro(e); } };
  $("#lgForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    const b = ev.target.querySelector("button[type=submit]"), err = $("#gateErr");
    const email = $("#lgEmail").value.trim(), pass = $("#lgPass") ? $("#lgPass").value : "";
    b.disabled = true; err.textContent = "";
    try {
      if (view === "criar"){
        if (pass !== $("#lgPass2").value) throw { message:"As senhas não são iguais." };
        await MQNuvem.criar(email, pass);
      } else if (view === "esqueci"){
        await MQNuvem.esqueci(email);
        loginView("entrar", { ok:true, text:"Se este e-mail tiver acesso, você vai receber o link em instantes. Confira também o spam." }); return;
      } else await MQNuvem.entrar(email, pass);
    } catch(e){ err.textContent = MQNuvem.erro(e); }
    b.disabled = false;
  });
  setTimeout(()=>{ const f = $("#lgEmail"); if (f) f.focus(); }, 30);
}
const GLOGO = `<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;
function verifyView(u, msg){
  gateShell(`<div class="eyebrow" style="color:#8f97b0">Quase lá</div>
    <h1>Confirme seu e-mail</h1>
    <p>Enviamos um link de confirmação para <b style="color:#fff">${esc(u.email)}</b>. Abra o e-mail (confira o spam), clique no link e volte aqui.</p>
    <button class="btn btn-gold" id="vDone" type="button">Já confirmei ${ic("right",18)}</button>
    <div class="gate-err ${msg&&msg.ok?"ok":""}" id="gateErr">${msg?esc(msg.text||msg):""}</div>
    <div class="gate-foot"><a href="#" id="vResend">Reenviar e-mail</a> · <a href="#" id="vOut">Usar outro e-mail</a>.${helpLink()}</div>`);
  $("#vDone").onclick = async () => { const nu = await MQNuvem.recarregar(); if (nu.emailVerified) afterLogin(nu); else $("#gateErr").textContent = "Ainda não identificamos a confirmação. Clique no link do e-mail e tente de novo."; };
  $("#vResend").onclick = async e => { e.preventDefault(); try { await MQNuvem.reenviar(); verifyView(u,{ok:true,text:"E-mail reenviado."}); } catch(x){ $("#gateErr").textContent = MQNuvem.erro(x); } };
  $("#vOut").onclick = e => { e.preventDefault(); logout(); };
}
function blockedView(u){
  gateShell(`<div class="eyebrow" style="color:#8f97b0">Acesso não liberado</div>
    <h1>Este e-mail não está na lista de alunos</h1>
    <p>Entramos com <b style="color:#fff">${esc(u.email||"")}</b>, mas ele não consta entre os compradores. Use o mesmo e-mail da compra.</p>
    <button class="btn btn-gold" id="bOut" type="button">Entrar com outro e-mail</button>
    <div class="gate-foot">Comprou com este e-mail e mesmo assim não entra?${helpLink() || " Fale com o suporte do curso."}</div>`);
  $("#bOut").onclick = () => logout();
}
function semConviteView(u){
  const membros = (C.config.acesso||{}).linkMembros;
  gateShell(`<div class="eyebrow" style="color:#8f97b0">Primeiro acesso</div>
    <h1>Entre pelo link da sua área de membros</h1>
    <p>Para liberar o seu primeiro acesso, abra o guia pelo link que está na área de membros do curso. Depois disso, você entra direto por aqui, em qualquer aparelho.</p>
    ${membros?`<a class="btn btn-gold" href="${esc(membros)}" target="_blank" rel="noopener">Abrir a área de membros ${ic("right",18)}</a>`:""}
    <div class="gate-foot"><a href="#" id="scOut">Usar outro e-mail</a>.${helpLink()}</div>`);
  $("#scOut").onclick = e => { e.preventDefault(); logout(); };
}
async function afterLogin(u){
  const N = C.config.nuvem || {};
  const isPwd = (u.providerData||[]).some(p => p.providerId === "password");
  if (entrada()==="lista"){
    if (isPwd && !u.emailVerified){ verifyView(u); return; }
    let ok = false;
    try { ok = await MQNuvem.liberado(u.email); } catch(e){ gateShell(`<h1>Não foi possível verificar seu acesso</h1><p>${esc(MQNuvem.erro(e))}</p><button class="btn btn-gold" onclick="location.reload()">Tentar de novo</button>`); return; }
    if (!ok && N.verificarUrl){
      gateShell(`<h1>Verificando sua compra…</h1><p>Um instante: estamos confirmando seu acesso na área de membros.</p>`);
      try {
        const r = await fetch(N.verificarUrl + (N.verificarUrl.indexOf("?")>=0?"&":"?") + "verificar=" + encodeURIComponent((u.email||"").toLowerCase()));
        const j = await r.json();
        if (j && j.liberado){ try { ok = await MQNuvem.liberado(u.email); } catch(e){ ok = true; } }
      } catch(e){}
    }
    if (!ok){ blockedView(u); return; }
  }
  let remote0 = null;
  if (entrada()==="convite" && !conviteOk()){
    try { remote0 = await MQNuvem.lerProgresso(u.uid); } catch(e){}
    if (!remote0){ semConviteView(u); return; }
  }
  USER = u;
  let local = null; try { local = JSON.parse(localStorage.getItem(KEY)||"null"); } catch(e){}
  if (!local || local.owner !== u.uid) local = { done:{}, ans:{}, chk:{} };
  let remote = remote0; if (!remote){ try { remote = await MQNuvem.lerProgresso(u.uid); } catch(e){} }
  remote = remote || {};
  S = { done: Object.assign({}, local.done, remote.done), ans: Object.assign({}, local.ans, remote.ans), chk: Object.assign({}, local.chk, remote.chk) };
  Object.keys(S.done).forEach(k => { if (!S.done[k]) delete S.done[k]; });
  try { localStorage.setItem(KEY, JSON.stringify(Object.assign({}, S, {owner:u.uid}))); } catch(e){}
  pushNow();
  const g = $("#gate"); if (g) g.remove();
  render();
}
async function logout(){
  try { if (pushTimer) pushNow(); } catch(e){}
  USER = null; S = { done:{}, ans:{}, chk:{} };
  try { localStorage.removeItem(KEY); } catch(e){}
  try { await MQNuvem.sair(); } catch(e){}
}
let loginStarted = false;
async function startLogin(){
  if (loginStarted) return; loginStarted = true;
  gateShell(`<p style="margin:0">Carregando…</p>`);
  try { await lerConvite(); } catch(e){}
  try { await MQNuvem.init(C.config.nuvem); }
  catch(e){ gateShell(`<h1>Não foi possível conectar</h1><p>Confira sua internet e atualize a página.</p><button class="btn btn-gold" onclick="location.reload()">Atualizar</button>`); return; }
  MQNuvem.onUser(u => { if (u) afterLogin(u); else { USER = null; loginView("entrar"); } });
}
document.addEventListener("click", e => { if (e.target.closest("#btnSair")) logout(); });

/* ---------- carregar conteúdo ---------- */
const inFrame = window.parent !== window;
const PREV_KEY = "mq-preview-draft";
function previewBar(){
  if ($("#previewBar")) return;
  const b = document.createElement("div"); b.className="preview-bar"; b.id="previewBar";
  b.innerHTML = `Pré-visualização do rascunho do admin <button id="exitPrev">Sair</button>`;
  document.body.appendChild(b);
  $("#exitPrev").onclick = () => { try{ localStorage.removeItem(PREV_KEY); }catch(e){} location.reload(); };
}
function start(c, preview){
  setup(c);
  if (preview === true && !inFrame) previewBar();
  if (preview){ const g = $("#gate"); if (g) g.remove(); render(); return; }
  if (modo() === "login" && nuvemOk()){ if (USER) render(); else startLogin(); return; }
  const g = $("#gate"); if (g) g.remove();
  if (needsGate()){
    const u = new URL(location.href), k = u.searchParams.get("convite") || u.searchParams.get("codigo");
    if (k){ MQTema.sha256(MQTema.normCode(k)).then(h => { if (h === (C.config.acesso||{}).hash){ try{ localStorage.setItem(ACC_KEY,h); }catch(e){} } u.searchParams.delete("convite"); u.searchParams.delete("codigo"); history.replaceState(null,"",u.pathname+(u.search||"")+u.hash); if (needsGate()) gate(); else render(); }); return; }
    gate(); return;
  }
  render();
}
window.addEventListener("message", ev => {
  if (ev.origin !== location.origin && location.origin !== "null") return;
  const d = ev.data;
  if (d && d.type === "mq-preview" && d.content){
    const y = window.scrollY; start(d.content, true); if (d.keepScroll) window.scrollTo(0,y);
    if (d.hash && location.hash.slice(1) !== d.hash) location.hash = d.hash;
  }
});
(async function init(){
  let draft = null;
  try { const raw = localStorage.getItem(PREV_KEY); if (raw) draft = JSON.parse(raw); } catch(e){}
  if (inFrame){ try{ window.parent.postMessage({type:"mq-ready"}, "*"); }catch(e){} }
  if (draft && !inFrame){ start(draft, true); return; }
  try {
    const r = await fetch("content.json?t=" + Date.now(), { cache:"no-store" });
    if (!r.ok) throw new Error(r.status);
    const c = await r.json();
    if (!C) start(c, inFrame ? "frame" : false);
  } catch(e){
    if (!C) $("#view").innerHTML = `<div class="loading">Não foi possível carregar o conteúdo do guia (content.json). Tente atualizar a página.</div>`;
  }
})();
})();
