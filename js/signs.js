// Generador de íconos SVG esquemáticos de señales de tránsito peruanas (MTC).
// No son reproducciones exactas del balotario en PDF: son representaciones
// vectoriales fieles a la forma/color oficial (R=circular rojo o azul, P=rombo
// amarillo, I=rectángulo azul) y al pictograma descrito en la respuesta correcta,
// pensadas para reconocer la señal en el examen real.

const SIGN_COLORS = { red:"#d0242a", yellow:"#ffcc00", blue:"#0a5fb0", black:"#111", white:"#fff" };

function stroke(d, w=7){ return `<path d="${d}" fill="none" stroke="#111" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`; }
function fill(d, c="#111"){ return `<path d="${d}" fill="${c}"/>`; }
function circleP(cx,cy,r,c="#111"){ return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`; }
function arrow(cx,cy,len,angleDeg,w=8,color="#111"){
  const a = angleDeg*Math.PI/180;
  const x2 = cx+len*Math.cos(a), y2 = cy+len*Math.sin(a);
  const x1 = cx-len*Math.cos(a), y1 = cy-len*Math.sin(a);
  const headLen=14, ha=25*Math.PI/180;
  const hx1 = x2-headLen*Math.cos(a-ha), hy1 = y2-headLen*Math.sin(a-ha);
  const hx2 = x2-headLen*Math.cos(a+ha), hy2 = y2-headLen*Math.sin(a+ha);
  return `<path d="M${x1} ${y1} L${x2} ${y2} M${x2} ${y2} L${hx1} ${hy1} M${x2} ${y2} L${hx2} ${hy2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function personFigure(cx,cy,scale=1,color="#111"){
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">
    <circle cx="0" cy="-22" r="7" fill="${color}"/>
    <path d="M0 -14 L0 8 M-11 -4 L0 -6 L11 -4 M0 8 L-9 26 M0 8 L9 26" stroke="${color}" stroke-width="6" fill="none" stroke-linecap="round"/>
  </g>`;
}
function childFigure(cx,cy,scale=1,color="#111"){
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">
    <circle cx="0" cy="-16" r="6" fill="${color}"/>
    <path d="M0 -10 L0 6 M-8 -2 L0 -4 L8 -2 M0 6 L-7 20 M0 6 L7 20" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>`;
}
function bikeFigure(cx,cy,scale=1,color="#111"){
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">
    <circle cx="-16" cy="10" r="11" fill="none" stroke="${color}" stroke-width="5"/>
    <circle cx="16" cy="10" r="11" fill="none" stroke="${color}" stroke-width="5"/>
    <path d="M-16 10 L-4 -10 L16 10 M-4 -10 L2 -10 M-16 10 L6 10 M6 10 L16 10 M2 -10 L-8 -18" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="-8" cy="-18" r="5" fill="${color}"/>
  </g>`;
}

const ICONS = {
  "arrow-up": (c)=>arrow(50,50,26,-90,9,c),
  "arrow-left": (c)=>arrow(50,50,26,180,9,c),
  "arrow-right": (c)=>arrow(50,50,26,0,9,c),
  "u-turn": (c)=>`<path d="M62 72 V40 a18 18 0 0 0-36 0 V60" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>${arrow(26,60,0,0,0,c)}<path d="M26 60 L14 48 M26 60 L38 48" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  "no-left-turn": (c)=>`<path d="M70 70 V45 a20 20 0 0 0-20-20 H32" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M32 25 L20 25 L32 38 Z" fill="${c}"/>`,
  "cross": (c)=>`<path d="M32 32 L68 68 M68 32 L32 68" stroke="${SIGN_COLORS.red}" stroke-width="10" stroke-linecap="round"/>`,
  "horn-slash": (c)=>`<path d="M30 42 h14 l16-14 v44 l-16-14 h-14 z" fill="${c}"/><path d="M64 40 q8 10 0 20" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  "car-silhouette": (c)=>`<path d="M22 60 q2-16 12-18 h32 q10 2 12 18 z" fill="${c}"/><circle cx="32" cy="62" r="6" fill="#fff"/><circle cx="68" cy="62" r="6" fill="#fff"/>`,
  "do-not-enter-bar": ()=>`<rect x="24" y="43" width="52" height="14" rx="2" fill="#fff"/>`,
  "merge-lines": (c)=>`<path d="M30 75 L55 30 M70 75 L55 30" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>${arrow(55,30,10,-90,7,c)}`,
  "curve-soft-right": (c)=>`<path d="M25 75 Q45 75 45 50 Q45 25 75 25" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>${arrow(75,25,0,0,0,c)}<path d="M75 25 L62 22 M75 25 L67 36" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  "curve-sharp-right": (c)=>`<path d="M22 78 Q30 30 78 22" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M78 22 L65 20 M78 22 L72 33" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  "s-curve-right": (c)=>`<path d="M20 30 Q50 20 50 45 Q50 70 80 60" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/><path d="M80 60 L68 55 M80 60 L74 71" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  "winding-left": (c)=>`<path d="M75 22 Q45 15 45 38 Q45 61 20 58 Q45 61 30 80" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  "chevron-curve": (c)=>`<path d="M20 75 Q50 20 82 35" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"/><path d="M82 35 L68 32 M82 35 L74 46" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  "dip": (c)=>`<path d="M15 40 Q30 40 35 60 Q45 82 55 60 Q60 40 85 40" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  "bump": (c)=>`<path d="M15 62 Q50 62 50 34 Q50 62 85 62" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  "slippery": (c)=>`<path d="M25 35 q20-14 40 0 q10 8 10 20 q0 15-15 20" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><path d="M20 68 q8-6 16 0 q8 6 16 0 q8-6 16 0 q8 6 16 0" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
  "two-cars-slash": (c)=>`<rect x="18" y="55" width="26" height="16" rx="3" fill="${c}"/><rect x="52" y="30" width="26" height="16" rx="3" fill="${c}"/><path d="M20 78 L80 20" stroke="${SIGN_COLORS.red}" stroke-width="7" stroke-linecap="round"/>`,
  "bicycle": (c)=>bikeFigure(50,48,0.75,c),
  "bicycle-down": (c)=>bikeFigure(45,40,0.62,c)+arrow(78,72,14,90,7,c),
  "bicycle-diag": (c)=>bikeFigure(42,38,0.6,c)+arrow(76,70,14,55,7,c),
  "pedestrian": (c)=>personFigure(50,54,1.15,c),
  "pedestrian-down": (c)=>personFigure(38,45,1,c)+arrow(76,72,14,90,7,c),
  "pedestrian-diag": (c)=>personFigure(35,42,0.95,c)+arrow(76,72,14,50,7,c),
  "pedestrian-priority": (c)=>personFigure(38,50,1,c)+arrow(72,38,14,-30,7,c),
  "children": (c)=>childFigure(37,55,1.1,c)+childFigure(60,50,1.1,c),
  "children-down": (c)=>childFigure(32,45,0.9,c)+childFigure(52,42,0.9,c)+arrow(80,72,12,90,6,c),
  "children-diag": (c)=>childFigure(30,42,0.85,c)+childFigure(50,40,0.85,c)+arrow(78,68,12,50,6,c),
  "child-playing": (c)=>childFigure(42,55,1.2,c)+`<circle cx="66" cy="42" r="8" fill="none" stroke="${c}" stroke-width="4"/>`,
  "tractor": (c)=>`<circle cx="32" cy="66" r="12" fill="none" stroke="${c}" stroke-width="6"/><circle cx="68" cy="70" r="7" fill="none" stroke="${c}" stroke-width="5"/><path d="M32 54 L32 34 L60 34 L60 62 M46 34 L46 20 L58 20" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  "cow": (c)=>`<ellipse cx="45" cy="55" rx="24" ry="14" fill="${c}"/><circle cx="72" cy="46" r="11" fill="${c}"/><path d="M64 38 l-4-8 M80 38 l4-8" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M28 68 v10 M40 68 v10 M55 68 v10 M65 68 v10" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
  "traffic-light": (c)=>`<rect x="38" y="18" width="24" height="58" rx="5" fill="${c}"/><circle cx="50" cy="30" r="6" fill="${SIGN_COLORS.red}"/><circle cx="50" cy="47" r="6" fill="${SIGN_COLORS.yellow}"/><circle cx="50" cy="64" r="6" fill="#3cb043"/>`,
  "mini-stop": (c)=>`<polygon points="50,22 65,29 72,44 72,56 65,71 50,78 35,71 28,56 28,44 35,29" fill="${SIGN_COLORS.red}" stroke="#fff" stroke-width="2"/><text x="50" y="55" font-size="15" font-weight="700" fill="#fff" text-anchor="middle" font-family="Arial">PARE</text>`,
  "mini-yield": (c)=>`<polygon points="50,25 78,70 22,70" fill="#fff" stroke="${SIGN_COLORS.red}" stroke-width="6"/>`,
  "tunnel": (c)=>`<path d="M20 75 V45 a30 30 0 0 1 60 0 V75" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/><path d="M20 75 h60" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`,
  "airplane": (c)=>`<path d="M15 55 L85 50 L70 42 M15 55 L70 60 M45 45 L38 20 L48 25 L52 45 M45 62 L38 85 L48 80 L52 62" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`,
  "firetruck": (c)=>`<rect x="18" y="40" width="50" height="24" rx="3" fill="${c}"/><rect x="68" y="46" width="16" height="18" rx="2" fill="${c}"/><circle cx="32" cy="66" r="7" fill="${c}"/><circle cx="66" cy="66" r="7" fill="${c}"/><path d="M28 40 v-12 h14 v12" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  "windsock": (c)=>`<path d="M20 25 V80" stroke="${c}" stroke-width="6" stroke-linecap="round"/><path d="M20 30 L70 22 Q58 34 70 46 L20 40 Z" fill="${c}"/>`,
  "roundabout": (c)=>`<circle cx="50" cy="50" r="22" fill="none" stroke="${c}" stroke-width="8"/><path d="M70 38 a22 22 0 0 0-14-14" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/><path d="M70 38 L58 36 M70 38 L64 48" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  "road-end": (c)=>`<path d="M50 20 V60" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M22 60 H78" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`,
  "headlight": (c)=>`<path d="M25 50 h20 l20-16 v32 l-20-16" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/><path d="M70 38 h14 M70 50 h18 M70 62 h14" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
  "two-cars-gap": (c)=>`<rect x="20" y="58" width="24" height="15" rx="3" fill="${c}"/><rect x="56" y="58" width="24" height="15" rx="3" fill="${c}"/><path d="M46 65 h8" stroke="${c}" stroke-width="4"/>`,
  "truck-box": (c)=>`<rect x="18" y="34" width="40" height="30" rx="2" fill="${c}"/><rect x="58" y="44" width="20" height="20" rx="2" fill="${c}"/><circle cx="32" cy="68" r="6" fill="${c}"/><circle cx="68" cy="68" r="6" fill="${c}"/>`,
  "three-arrows": (c)=>arrow(30,55,22,-90,7,c)+arrow(50,55,22,-90,7,c)+arrow(70,55,22,-90,7,c),
  "fork-arrow": (c)=>`<path d="M50 78 V50 L30 25 M50 50 L70 25" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 25 L30 37 M30 25 L42 27" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 25 L70 37 M70 25 L58 27" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  "wrench": (c)=>`<path d="M35 65 L60 40" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M62 30 a11 11 0 1 0 8 8 l-7-2 -1-6 z" fill="${c}"/><circle cx="30" cy="70" r="9" fill="none" stroke="${c}" stroke-width="6"/>`,
  "fuel-pump": (c)=>`<rect x="28" y="25" width="26" height="50" rx="3" fill="none" stroke="${c}" stroke-width="6"/><rect x="34" y="33" width="14" height="14" fill="${c}"/><path d="M54 45 h8 q6 0 6 6 v18" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><rect x="60" y="69" width="8" height="6" fill="${c}"/>`,
  "tire": (c)=>`<circle cx="50" cy="50" r="26" fill="none" stroke="${c}" stroke-width="9"/><circle cx="50" cy="50" r="9" fill="${c}"/>`,
  "hospital-h": (c)=>`<text x="50" y="66" font-size="46" font-weight="700" fill="${c}" text-anchor="middle" font-family="Arial">H</text>`,
  "guard": (c)=>personFigure(50,55,1.2,c)+`<rect x="30" y="20" width="40" height="8" rx="2" fill="${c}"/>`,
  "letter-E": (c)=>`<text x="50" y="66" font-size="42" font-weight="700" fill="${c}" text-anchor="middle" font-family="Arial">E</text>`,
  "chain": (c)=>`<circle cx="50" cy="50" r="26" fill="none" stroke="${c}" stroke-width="9"/><path d="M32 40 L68 40 M32 50 L68 50 M32 60 L68 60" stroke="${c}" stroke-width="4"/>`,
  "solo-left": (c)=>arrow(45,50,24,180,10,c),
  "opposing-arrows": (c)=>arrow(38,50,22,-90,9,SIGN_COLORS.white)+arrow(62,50,22,90,9,SIGN_COLORS.white),
};

function frameDiamond(inner, big=false){
  const s = big?110:96;
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}">
    <rect x="16" y="16" width="68" height="68" rx="6" fill="${SIGN_COLORS.yellow}" stroke="#111" stroke-width="3" transform="rotate(45 50 50)"/>
    <g>${inner("#111")}</g>
  </svg>`;
}
function frameCirclePro(inner, big=false){
  const s = big?110:96;
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}">
    <circle cx="50" cy="50" r="42" fill="#fff" stroke="${SIGN_COLORS.red}" stroke-width="9"/>
    <g>${inner("#111")}</g>
  </svg>`;
}
function frameCircleMand(inner, big=false){
  const s = big?110:96;
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}">
    <circle cx="50" cy="50" r="44" fill="${SIGN_COLORS.blue}" stroke="#fff" stroke-width="3"/>
    <g>${inner("#fff")}</g>
  </svg>`;
}
function frameInfo(inner, big=false){
  const s = big?110:96;
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}">
    <rect x="8" y="8" width="84" height="84" rx="10" fill="${SIGN_COLORS.blue}"/>
    <g>${inner("#fff")}</g>
  </svg>`;
}
function frameSpeed(num, big=false){
  const s = big?110:96;
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}">
    <circle cx="50" cy="50" r="42" fill="#fff" stroke="${SIGN_COLORS.red}" stroke-width="9"/>
    <text x="50" y="65" font-size="34" font-weight="800" fill="#111" text-anchor="middle" font-family="Arial">${num}</text>
  </svg>`;
}
function frameRectSpecial(content, big=false){
  const w = big?150:130, h = big?110:96;
  return `<svg viewBox="0 0 130 100" width="${w}" height="${h}">
    <rect x="4" y="4" width="122" height="92" rx="8" fill="${SIGN_COLORS.blue}" stroke="#fff" stroke-width="2"/>
    ${content}
  </svg>`;
}

// code -> {frame, icon, extra}
const SIGN_DB = {
  "R-6": {frame:"proh", icon:"no-left-turn"},
  "R-3": {frame:"mand", icon:"arrow-up"},
  "R-53": {frame:"proh", icon:"cross"},
  "R-29": {frame:"proh", icon:"horn-slash"},
  "P-22C": {frame:"prev", icon:"merge-lines"},
  "P-1A": {frame:"prev", icon:"curve-soft-right"},
  "R-30F": {frame:"speed", num:"40"},
  "P-17A": {frame:"prev", icon:"road-end", label:"angosto"},
  "P-33A": {frame:"prev", icon:"bump"},
  "R-17": {frame:"proh", icon:"car-silhouette"},
  "R-4": {frame:"proh", icon:"do-not-enter-bar"},
  "P-36": {frame:"prev", icon:"slippery"},
  "R-14": {frame:"mand", icon:"curve-soft-right"},
  "R-11A": {frame:"mand", icon:"three-arrows"},
  "R-30C": {frame:"speed", num:"50", label:"SALIDA"},
  "R-5-4": {frame:"rect", icon:"fork-arrow", text:"SOLO"},
  "R-9": {frame:"mand", icon:"u-turn"},
  "R-5-2": {frame:"rect", icon:"fork-arrow", text:""},
  "R-20": {frame:"mand", icon:"pedestrian-priority"},
  "R-40": {frame:"mand", icon:"headlight"},
  "R-48": {frame:"info", icon:"truck-box"},
  "R-49": {frame:"mand", icon:"two-cars-gap"},
  "R-50": {frame:"rect", icon:"opposing-arrows", text:"PREFERENCIA AL SENTIDO CONTRARIO", small:true},
  "R-5-1": {frame:"rect", icon:"solo-left", text:"SOLO"},
  "P-3A": {frame:"prev", icon:"s-curve-right"},
  "P-5-1A": {frame:"prev", icon:"winding-left"},
  "P-61": {frame:"prev", icon:"chevron-curve"},
  "P-34": {frame:"prev", icon:"dip"},
  "P-60": {frame:"prev", icon:"two-cars-slash"},
  "P-46": {frame:"prev", icon:"bicycle"},
  "P-46A": {frame:"prev", icon:"bicycle-down"},
  "P-46B": {frame:"prev", icon:"bicycle-diag"},
  "P-48": {frame:"prev", icon:"pedestrian"},
  "P-48A": {frame:"prev", icon:"pedestrian-down"},
  "P-48B": {frame:"prev", icon:"pedestrian-diag"},
  "P-49": {frame:"prev", icon:"children"},
  "P-49A": {frame:"prev", icon:"children-down"},
  "P-49B": {frame:"prev", icon:"children-diag"},
  "P-50": {frame:"prev", icon:"child-playing"},
  "P-51": {frame:"prev", icon:"tractor"},
  "P-53": {frame:"prev", icon:"cow"},
  "P-55": {frame:"prev", icon:"traffic-light"},
  "P-58": {frame:"prev", icon:"mini-stop"},
  "P-59": {frame:"prev", icon:"mini-yield"},
  "P-41": {frame:"prev", icon:"tunnel"},
  "P-45": {frame:"prev", icon:"airplane"},
  "P-52": {frame:"prev", icon:"firetruck"},
  "P-66": {frame:"prev", icon:"windsock"},
  "P-66A": {frame:"prev", icon:"windsock"},
  "I-14": {frame:"info", icon:"hospital-h"},
  "I-31": {frame:"info", icon:"letter-E"},
  "I-9": {frame:"info", icon:"guard"},
  "I-18": {frame:"info", icon:"wrench"},
  "I-19": {frame:"info", icon:"fuel-pump"},
  "I-20": {frame:"info", icon:"chain"},
  "R-16A": {frame:"rect", icon:null, text:"FIN", sub:"RESTRICCIÓN"},
  "P-15": {frame:"prev", icon:"roundabout"},
  "P-31A": {frame:"prev", icon:"road-end"},
};

function renderSign(code, big=false){
  const d = SIGN_DB[code];
  if (!d) return `<div class="sign-fallback">${code}</div>`;
  if (d.frame === "prev") return frameDiamond(ICONS[d.icon], big);
  if (d.frame === "proh") return frameCirclePro(ICONS[d.icon], big);
  if (d.frame === "mand") return frameCircleMand(ICONS[d.icon], big);
  if (d.frame === "info") return frameInfo(ICONS[d.icon], big);
  if (d.frame === "speed") return frameSpeed(d.num, big) ;
  if (d.frame === "rect"){
    const inner = d.icon ? `<g transform="translate(15 0) scale(0.8)">${ICONS[d.icon]("#fff")}</g>` : "";
    const textEl = d.small
      ? `<text x="65" y="88" font-size="8" font-weight="700" fill="#fff" text-anchor="middle" font-family="Arial">${d.text}</text>`
      : `<text x="65" y="90" font-size="16" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">${d.text||""}</text>`;
    const sub = d.sub ? `<text x="65" y="70" font-size="10" font-weight="700" fill="#fff" text-anchor="middle" font-family="Arial">${d.sub}</text>` : "";
    return frameRectSpecial(inner+textEl+sub, big);
  }
  return `<div class="sign-fallback">${code}</div>`;
}

// ---- Diagramas de escena (para preguntas con gráfico, no señal) ----
function sceneWrap(inner, big=false){
  const w = big?340:280, h= big?220:180;
  return `<svg viewBox="0 0 280 180" width="${w}" height="${h}" style="background:#eef1f4;border-radius:12px">${inner}</svg>`;
}
const road = `<rect x="0" y="0" width="280" height="180" fill="#eef1f4"/>`;
const DIAGRAMS = {
  "intersection-priority": ()=>sceneWrap(`
    ${road}
    <rect x="110" y="0" width="60" height="180" fill="#8a8f98"/>
    <rect x="0" y="70" width="280" height="60" fill="#8a8f98"/>
    <path d="M140 0 V180 M0 100 H280" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
    <rect x="150" y="112" width="34" height="18" rx="3" fill="#d0242a" transform="rotate(0)"/>
    <rect x="86" y="86" width="18" height="34" rx="3" fill="#0a5fb0"/>
    <text x="167" y="150" font-size="11" fill="#333" font-family="Arial">A</text>
    <text x="70" y="80" font-size="11" fill="#333" font-family="Arial">B</text>
  `),
  "lane-merge": ()=>sceneWrap(`
    ${road}
    <rect x="60" y="0" width="160" height="180" fill="#8a8f98"/>
    <path d="M140 0 V180" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
    <path d="M175 150 L120 40" stroke="#ffcc00" stroke-width="6" stroke-linecap="round"/>
    <path d="M120 40 L108 55 M120 40 L134 50" stroke="#ffcc00" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M105 150 L105 60" stroke="#ffcc00" stroke-width="6" stroke-linecap="round"/>
    <path d="M105 60 L95 74 M105 60 L117 72" stroke="#ffcc00" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="150" y="130" width="30" height="18" rx="3" fill="#d0242a"/>
  `),
  "overtake-scene": ()=>sceneWrap(`
    ${road}
    <rect x="40" y="0" width="200" height="180" fill="#8a8f98"/>
    <path d="M140 0 V180" stroke="#ffcc00" stroke-width="4"/>
    <rect x="122" y="120" width="26" height="42" rx="4" fill="#d0242a"/>
    <rect x="122" y="18" width="26" height="42" rx="4" fill="#0a5fb0"/>
    <rect x="150" y="70" width="26" height="42" rx="4" fill="#3cb043"/>
  `),
  "no-left-turn-sign": ()=>sceneWrap(`
    ${road}
    <rect x="0" y="0" width="280" height="180" fill="#eef1f4"/>
    <rect x="100" y="30" width="80" height="60" rx="6" fill="#2f8f4e" stroke="#fff" stroke-width="2"/>
    <path d="M120 75 v-25 h30" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M150 50 l-10 -6 v12 z" fill="#fff"/>
    <circle cx="160" cy="45" r="12" fill="#d0242a"/>
    <path d="M154 39 L166 51 M166 39 L154 51" stroke="#fff" stroke-width="3"/>
  `),
  "detour-block-sign": ()=>sceneWrap(`
    ${road}
    <rect x="70" y="35" width="140" height="55" rx="4" fill="#2f8f4e" stroke="#fff" stroke-width="2"/>
    <g>${Array.from({length:5}).map((_,i)=>`<rect x="${88+i*24}" y="47" width="16" height="30" fill="#fff"/>`).join("")}</g>
  `),
  "pedestrian-turn": ()=>sceneWrap(`
    ${road}
    <rect x="0" y="60" width="280" height="60" fill="#8a8f98"/>
    <g>${Array.from({length:6}).map((_,i)=>`<rect x="${60+i*22}" y="70" width="12" height="40" fill="#fff" opacity="0.85"/>`).join("")}</g>
    <rect x="200" y="30" width="26" height="42" rx="4" fill="#d0242a"/>
    <path d="M215 68 l-8 -22" stroke="#111" stroke-width="6" stroke-linecap="round"/>
    ${personFigure(120,95,1.3,"#111")}
  `),
  "school-zone": ()=>sceneWrap(`
    ${road}
    <rect x="0" y="70" width="280" height="60" fill="#8a8f98"/>
    <g>${Array.from({length:7}).map((_,i)=>`<rect x="${20+i*36}" y="82" width="20" height="36" fill="#fff" opacity="0.85"/>`).join("")}</g>
    <polygon points="230,20 260,55 200,55" fill="#ffcc00" stroke="#111" stroke-width="2"/>
    ${childFigure(230,45,0.7,"#111")}
  `),
  "yellow-grid": ()=>sceneWrap(`
    ${road}
    <rect x="60" y="30" width="160" height="120" fill="none"/>
    <g stroke="#ffcc00" stroke-width="5">
      ${Array.from({length:6}).map((_,i)=>`<line x1="${60+i*32}" y1="30" x2="${60+i*32-60}" y2="150"/>`).join("")}
      ${Array.from({length:6}).map((_,i)=>`<line x1="${60+i*32}" y1="30" x2="${60+i*32+60}" y2="150"/>`).join("")}
    </g>
  `),
  "double-yellow": ()=>sceneWrap(`
    ${road}
    <rect x="90" y="0" width="100" height="180" fill="#8a8f98"/>
    <path d="M130 0 V60" stroke="#ffcc00" stroke-width="4" stroke-dasharray="14 10"/>
    <path d="M130 60 V180" stroke="#ffcc00" stroke-width="4"/>
    <path d="M150 0 V180" stroke="#ffcc00" stroke-width="4"/>
    <rect x="150" y="10" width="26" height="42" rx="4" fill="#d0242a"/>
    <rect x="95" y="120" width="34" height="20" rx="4" fill="#333"/>
  `),
};

function renderDiagram(key, big=false){
  const f = DIAGRAMS[key];
  return f ? f(big) : `<div class="sign-fallback">${key}</div>`;
}

if (typeof module !== "undefined") module.exports = { renderSign, renderDiagram, SIGN_DB };
