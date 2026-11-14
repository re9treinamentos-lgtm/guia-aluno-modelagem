/* Tema compartilhado entre o site do aluno e o painel admin */
(function(){
  const FONTS = ["Oswald","Bebas Neue","Anton","Barlow Condensed","Archivo","Manrope","Inter","Poppins","Montserrat","Sora","Plus Jakarta Sans","DM Sans","Nunito","Lato","Roboto","Open Sans","Merriweather","Playfair Display","Space Grotesk","Outfit"];
  const hex = h => { h = (h||"#000").replace("#",""); if (h.length===3) h = h.split("").map(x=>x+x).join(""); const n = parseInt(h,16); return [(n>>16)&255,(n>>8)&255,n&255]; };
  const toHex = a => "#" + a.map(v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0")).join("");
  const mix = (a,b,t) => { const A=hex(a), B=hex(b); return toHex(A.map((v,i)=>v+(B[i]-v)*t)); };
  const lum = c => { const [r,g,b] = hex(c).map(v => { v/=255; return v<=.03928 ? v/12.92 : Math.pow((v+.055)/1.055,2.4); }); return .2126*r+.7152*g+.0722*b; };
  const contrast = (a,b) => { const x=lum(a), y=lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
  function inkFor(accent, bg){ let t=.35, c=mix(accent,"#000",t); while (contrast(c,bg)<4.6 && t<.9){ t+=.05; c=mix(accent,"#000",t); } return c; }
  function apply(tema, doc){
    doc = doc || document;
    const T = Object.assign({ escuro:"#0b1022", destaque:"#f4b324", fundo:"#f6f4ee", cartao:"#ffffff", texto:"#171b2b", acerto:"#17905a", erro:"#cf3f30", fonteTitulo:"Oswald", fonteTexto:"Manrope", raio:18, tituloMaiusculo:true }, tema||{});
    const s = doc.documentElement.style;
    const soft = mix(T.destaque,"#fff",.86);
    const vars = {
      "--dark":T.escuro, "--dark-2":mix(T.escuro,"#fff",.05), "--dark-3":mix(T.escuro,"#fff",.1), "--dark-4":mix(T.escuro,"#fff",.2),
      "--accent":T.destaque, "--accent-2":mix(T.destaque,"#fff",.3), "--accent-soft":soft, "--accent-line":mix(T.destaque,"#fff",.6),
      "--accent-ink":inkFor(T.destaque, soft), "--on-accent": contrast(T.destaque,"#fff") > 3 ? "#ffffff" : T.escuro,
      "--paper":T.fundo, "--card":T.cartao, "--text":T.texto, "--muted":mix(T.texto,T.fundo,.45), "--line":mix(T.fundo,T.texto,.1),
      "--soft":mix(T.fundo,"#fff",.5), "--soft-2":mix(T.fundo,T.texto,.06), "--soft-3":mix(T.fundo,T.texto,.22),
      "--ok":T.acerto, "--ok-soft":mix(T.acerto,"#fff",.88), "--bad":T.erro, "--bad-soft":mix(T.erro,"#fff",.9),
      "--f-title":`"${T.fonteTitulo}"`, "--f-body":`"${T.fonteTexto}"`, "--tt":T.tituloMaiusculo ? "uppercase" : "none", "--r":(+T.raio||18)+"px"
    };
    Object.entries(vars).forEach(([k,v]) => s.setProperty(k,v));
    const fams = [...new Set([T.fonteTitulo,T.fonteTexto])].map(f => "family="+encodeURIComponent(f).replace(/%20/g,"+")+":wght@400;500;600;700;800").join("&");
    let link = doc.getElementById("mq-fonts");
    if (!link){ link = doc.createElement("link"); link.id="mq-fonts"; link.rel="stylesheet"; doc.head.appendChild(link); }
    const href = "https://fonts.googleapis.com/css2?"+fams+"&display=swap";
    if (link.href !== href) link.href = href;
    return T;
  }
  async function sha256(txt){
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  const normCode = c => String(c||"").trim().toUpperCase();
  window.MQTema = { FONTS, apply, mix, contrast, sha256, normCode };
})();
