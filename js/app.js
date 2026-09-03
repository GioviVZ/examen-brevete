(function(){
"use strict";

const CATEGORIES = {
  "1":  { label: "Categoría I",     sub: "Clase A · Categoría I",     questions: QUESTIONS },
  "2a": { label: "Categoría II-A",  sub: "Clase A · Categoría II-A",  questions: QUESTIONS.concat(typeof ESPECIFICAS_2A !== "undefined" ? ESPECIFICAS_2A : []) },
  "2b": { label: "Categoría II-B",  sub: "Clase A · Categoría II-B",  questions: QUESTIONS.concat(typeof ESPECIFICAS_2B !== "undefined" ? ESPECIFICAS_2B : []) },
  "3a": { label: "Categoría III-A", sub: "Clase A · Categoría III-A", questions: QUESTIONS.concat(typeof ESPECIFICAS_3A !== "undefined" ? ESPECIFICAS_3A : []) },
  "3b": { label: "Categoría III-B", sub: "Clase A · Categoría III-B", questions: QUESTIONS.concat(typeof ESPECIFICAS_3B !== "undefined" ? ESPECIFICAS_3B : []) },
  "3c": { label: "Categoría III-C", sub: "Clase A · Categoría III-C", questions: QUESTIONS.concat(typeof ESPECIFICAS_3C !== "undefined" ? ESPECIFICAS_3C : []) },
};
// Link de pago (Mercado Pago u otro) para el botón de donación. Vacío = todavía
// no configurado; el botón muestra un mensaje amable en vez de un enlace roto.
const SUPPORT_LINK = "https://link.mercadopago.com.pe/paraelchaufa";
const SUPPORT_DISMISS_KEY = "brevete_support_dismissed";

const CAT_KEY = "brevete_category";
function loadCategory(){
  try{ const v = localStorage.getItem(CAT_KEY); return CATEGORIES[v] ? v : "1"; }
  catch(e){ return "1"; }
}
function saveCategory(v){ try{ localStorage.setItem(CAT_KEY, v); }catch(e){} }

let currentCat = loadCategory();
let ALL, ALL_IDS, byId;
function rebuildQuestionIndex(){
  ALL = CATEGORIES[currentCat].questions;
  ALL_IDS = ALL.map(q => q.id);
  byId = {};
  ALL.forEach(q => byId[q.id] = q);
}
rebuildQuestionIndex();
const EXAM_SIZE = 40;
const PASS_SCORE = 38;

function setCategory(catKey){
  if (!CATEGORIES[catKey] || catKey === currentCat) return;
  currentCat = catKey;
  saveCategory(catKey);
  rebuildQuestionIndex();
  session = null;
  const sub = document.querySelector(".brand-sub");
  if (sub) sub.textContent = CATEGORIES[currentCat].sub;
  go("home");
}

let STATE = loadState();
let session = null; // sesión activa de estudio/examen/refuerzo
let view = "home";

const app = document.getElementById("app");

function showConfirm(message, onConfirm, confirmLabel){
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal-box">
    <p>${message}</p>
    <div class="modal-actions">
      <button class="btn-ghost" data-modal="cancel">Cancelar</button>
      <button class="btn-danger" data-modal="ok">${confirmLabel || "Confirmar"}</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.dataset.modal === "cancel"){ overlay.remove(); }
    else if (e.target.dataset.modal === "ok"){ overlay.remove(); onConfirm(); }
  });
}

function fmtTime(sec){
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec/60), s = sec%60;
  return `${m}:${String(s).padStart(2,"0")}`;
}
function letter(i){ return ["A","B","C","D"][i]; }
function catOf(q){ return (q.sign || q.diagram) ? "senales" : "normas"; }
function pct(n,d){ return d>0 ? Math.round((n/d)*100) : 0; }
function ring(percent, colorVar){
  return `background: conic-gradient(var(${colorVar||"--primary"}) ${percent}%, var(--ring-bg) 0)`;
}

// Íconos de línea propios (24x24, heredan color con currentColor) — reemplazan los emoji.
const ICON = {
  book: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5c2-1 5-1 8 0v13c-3-1-6-1-8 0z"/><path d="M20 5.5c-2-1-5-1-8 0v13c3-1 6-1 8 0z"/></svg>`,
  stopwatch: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9v4.5l3 2"/><path d="M9.5 2.5h5"/><path d="M18.5 5.2l1.3-1.3"/></svg>`,
  repeat: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5"/><path d="M4 20v-4.5h4.5"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10"/><path d="M12 20V4"/><path d="M20 20v-7"/><path d="M3 20h18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`,
  cross: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  hourglass: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12"/><path d="M7 3c0 4 3.5 5 3.5 9s-3.5 5-3.5 9"/><path d="M17 3c0 4-3.5 5-3.5 9s3.5 5 3.5 9"/></svg>`,
};

function go(v, opts){ view = v; session = session; render(opts); }

// ---------------- RENDER DISPATCH ----------------
function render(){
  window.scrollTo(0,0);
  if (view === "home") app.innerHTML = viewHome();
  else if (view === "study-setup") app.innerHTML = viewStudySetup();
  else if (view === "reinforce-setup") app.innerHTML = viewReinforceSetup();
  else if (view === "exam-setup") app.innerHTML = viewExamSetup();
  else if (view === "running") app.innerHTML = viewRunning();
  else if (view === "session-summary") app.innerHTML = viewSessionSummary();
  else if (view === "exam-results") app.innerHTML = viewExamResults();
  else if (view === "stats") app.innerHTML = viewStats();
  updateNav();
}

function updateNav(){
  document.querySelectorAll(".navbtn").forEach(b => {
    b.classList.toggle("active", b.dataset.nav === view || (b.dataset.nav==="study-setup" && view==="running" && session && session.mode==="study"));
  });
}

// ---------------- HOME ----------------
function viewHome(){
  const dueCount = ALL_IDS.filter(id => isDue(STATE, id)).length;
  const s = computeStats(STATE, ALL);
  return `
  <div class="cat-switcher">
    <span class="cat-switcher-label">Categoría de licencia:</span>
    <div class="chip-group" data-group="category">
      ${Object.keys(CATEGORIES).map(k => `<button class="chip ${k===currentCat?"active":""}" data-action="set-category" data-arg="${k}">${CATEGORIES[k].label}</button>`).join("")}
    </div>
  </div>
  <section class="hero">
    <h1>Prepárate para tu examen de Reglas</h1>
    <p>${CATEGORIES[currentCat].sub} — 40 preguntas, necesitas <strong>${PASS_SCORE}/${EXAM_SIZE}</strong> correctas para aprobar.</p>
    <div class="hero-stats">
      <div class="hero-stat"><span class="big">${s.accuracy}%</span><span>precisión global</span></div>
      <div class="hero-stat"><span class="big">${s.mastered}/${s.total}</span><span>preguntas dominadas</span></div>
      <div class="hero-stat"><span class="big">${dueCount}</span><span>pendientes de repaso</span></div>
    </div>
  </section>
  <section class="cards-grid">
    <div class="action-card" data-action="nav" data-arg="study-setup">
      <div class="ac-icon" style="background:#eaf2fd;color:var(--primary)">${ICON.book}</div>
      <h3>Estudiar</h3>
      <p>Practica con retroalimentación inmediata, filtra por señales o normas, a tu ritmo o contrarreloj.</p>
    </div>
    <div class="action-card" data-action="nav" data-arg="exam-setup">
      <div class="ac-icon" style="background:#fdeceb;color:var(--danger)">${ICON.stopwatch}</div>
      <h3>Simulacro de examen</h3>
      <p>${EXAM_SIZE} preguntas al azar, tiempo real de examen. Necesitas ${PASS_SCORE} aciertos para pasar.</p>
    </div>
    <div class="action-card" data-action="nav" data-arg="reinforce-setup">
      <div class="ac-icon" style="background:#fef6e6;color:var(--warning)">${ICON.repeat}</div>
      <h3>Refuerzo de fallos</h3>
      <p>Repite justo lo que más te cuesta, con repetición espaciada. ${dueCount ? `<span class="badge">${dueCount} listas</span>` : "Todo al día."}</p>
    </div>
    <div class="action-card" data-action="nav" data-arg="stats">
      <div class="ac-icon" style="background:#eafaf1;color:var(--success)">${ICON.chart}</div>
      <h3>Estadísticas</h3>
      <p>Revisa tu progreso, tus temas débiles y el historial de tus simulacros.</p>
    </div>
  </section>
  ${homeFaq()}`;
}

function homeFaq(){
  const items = [
    ["¿El examen de práctica es gratis?", "Sí, todo el contenido de Brevete Perú es completamente gratuito: modo estudio, simulacros de examen y refuerzo de fallos."],
    ["¿De dónde salen las preguntas del examen de brevete?", "Las preguntas provienen del balotario oficial publicado por el Ministerio de Transportes y Comunicaciones (MTC) del Perú, verificadas pregunta por pregunta contra el documento original."],
    ["¿Cuántas preguntas tiene el examen de reglas y cuántas necesito para aprobar?", `El simulacro tiene ${EXAM_SIZE} preguntas al azar, igual que el examen real del MTC, y necesitas ${PASS_SCORE} respuestas correctas para aprobar.`],
    ["¿Para qué categorías de licencia sirve este simulacro?", "Cubre las categorías de licencia Clase A: I, II-A, II-B, III-A, III-B y III-C, cada una con sus preguntas específicas además del banco general de reglas de tránsito."],
  ];
  return `
  <section class="faq-section">
    <h2>Preguntas frecuentes</h2>
    ${items.map(([q,a]) => `
    <details class="faq-item">
      <summary>${q}</summary>
      <p>${a}</p>
    </details>`).join("")}
  </section>`;
}

// ---------------- STUDY SETUP ----------------
function viewStudySetup(){
  return sessionSetup({
    title: "Modo estudio",
    desc: "Elige qué repasar. Verás la respuesta correcta apenas contestes.",
    mode: "study",
  });
}
function viewReinforceSetup(){
  const dueCount = ALL_IDS.filter(id => isDue(STATE, id)).length;
  const failedCount = failedQuestionIds(STATE).length;
  return `
  <section class="setup-card">
    <button class="backlink" data-action="nav" data-arg="home">&larr; Inicio</button>
    <h2>Refuerzo de fallos</h2>
    <p class="muted">Prioriza las preguntas vencidas para repaso y las que más fallas, siguiendo un sistema de repetición espaciada (cajas de Leitner).</p>
    <div class="hero-stats" style="margin:18px 0">
      <div class="hero-stat"><span class="big">${dueCount}</span><span>listas para repasar hoy</span></div>
      <div class="hero-stat"><span class="big">${failedCount}</span><span>con fallos registrados</span></div>
    </div>
    ${failedCount === 0 ? `<p class="empty-note">Aún no tienes fallos registrados. Estudia o rinde un simulacro primero.</p>` : `
    <div class="field">
      <label>Tamaño de la ronda</label>
      <div class="chip-group" data-group="count">
        <button class="chip active" data-val="10">10</button>
        <button class="chip" data-val="20">20</button>
        <button class="chip" data-val="9999">Todas las pendientes</button>
      </div>
    </div>
    <div class="field">
      <label>Ritmo</label>
      <div class="chip-group" data-group="timer">
        <button class="chip active" data-val="0">Sin tiempo</button>
        <button class="chip" data-val="20">20s / pregunta</button>
        <button class="chip" data-val="15">15s / pregunta</button>
      </div>
    </div>
    <button class="btn-primary btn-lg" data-action="start-reinforce">Comenzar ronda de refuerzo</button>
    `}
  </section>`;
}

function sessionSetup({title, desc, mode}){
  return `
  <section class="setup-card">
    <button class="backlink" data-action="nav" data-arg="home">&larr; Inicio</button>
    <h2>${title}</h2>
    <p class="muted">${desc}</p>
    <div class="field">
      <label>Contenido</label>
      <div class="chip-group" data-group="filter">
        <button class="chip active" data-val="todas">Todas</button>
        <button class="chip" data-val="senales">Solo señales</button>
        <button class="chip" data-val="normas">Normas y conceptos</button>
        <button class="chip" data-val="pendientes">Aún no dominadas</button>
      </div>
    </div>
    <div class="field">
      <label>Cantidad de preguntas</label>
      <div class="chip-group" data-group="count">
        <button class="chip" data-val="10">10</button>
        <button class="chip active" data-val="20">20</button>
        <button class="chip" data-val="40">40</button>
        <button class="chip" data-val="9999">Todas</button>
      </div>
    </div>
    <div class="field">
      <label>Ritmo</label>
      <div class="chip-group" data-group="timer">
        <button class="chip active" data-val="0">Sin tiempo</button>
        <button class="chip" data-val="30">30s / pregunta</button>
        <button class="chip" data-val="20">20s / pregunta</button>
      </div>
    </div>
    <button class="btn-primary btn-lg" data-action="start-study">Comenzar</button>
  </section>`;
}

// ---------------- EXAM SETUP ----------------
function viewExamSetup(){
  return `
  <section class="setup-card">
    <button class="backlink" data-action="nav" data-arg="home">&larr; Inicio</button>
    <h2>Simulacro de examen</h2>
    <p class="muted">Igual que el examen real: ${EXAM_SIZE} preguntas al azar de todo el balotario, sin retroalimentación hasta el final. Necesitas <strong>${PASS_SCORE} de ${EXAM_SIZE}</strong> correctas para aprobar.</p>
    <div class="field">
      <label>Duración</label>
      <div class="chip-group" data-group="duration">
        <button class="chip" data-val="25">25 min</button>
        <button class="chip active" data-val="35">35 min</button>
        <button class="chip" data-val="40">40 min</button>
        <button class="chip" data-val="9999">Sin límite</button>
      </div>
    </div>
    <button class="btn-primary btn-lg" data-action="start-exam">Iniciar simulacro</button>
  </section>`;
}

// ---------------- START SESSION HANDLERS ----------------
function readChips(root, group){
  const el = root.querySelector(`.chip-group[data-group="${group}"] .chip.active`);
  return el ? el.dataset.val : null;
}

function startStudyFromUI(){
  const root = app;
  const filter = readChips(root, "filter") || "todas";
  const count = parseInt(readChips(root, "count") || "20", 10);
  const timerSec = parseInt(readChips(root, "timer") || "0", 10);
  let pool = ALL_IDS.slice();
  if (filter === "senales") pool = pool.filter(id => catOf(byId[id]) === "senales");
  else if (filter === "normas") pool = pool.filter(id => catOf(byId[id]) === "normas");
  else if (filter === "pendientes") pool = pool.filter(id => !isMastered(STATE, id));
  if (pool.length === 0) pool = ALL_IDS.slice();
  const queue = shuffle(pool).slice(0, Math.min(count, pool.length));
  beginSession({ mode:"study", queue, timerSec });
}

function startReinforceFromUI(){
  const root = app;
  const countVal = readChips(root, "count") || "10";
  const count = parseInt(countVal, 10);
  const timerSec = parseInt(readChips(root, "timer") || "0", 10);
  const dueOrFailed = ALL_IDS.filter(id => isDue(STATE, id) || (STATE.perQuestion[id] && STATE.perQuestion[id].lastResult === "fail"));
  const source = dueOrFailed.length ? dueOrFailed : failedQuestionIds(STATE);
  const queue = buildReinforcementQueue(STATE, source.length ? source : ALL_IDS, Math.min(count, Math.max(source.length,1)));
  beginSession({ mode:"reinforce", queue, timerSec });
}

function startExamFromUI(){
  const root = app;
  const durVal = readChips(root, "duration") || "35";
  const queue = pickRandom(ALL_IDS, EXAM_SIZE);
  beginSession({ mode:"exam", queue, durationSec: durVal === "9999" ? null : parseInt(durVal,10)*60 });
}

function beginSession(opts){
  session = {
    mode: opts.mode,
    queue: opts.queue,
    index: 0,
    answers: {}, // id -> {selected, correct}
    timerSec: opts.timerSec || 0,
    qTimeLeft: opts.timerSec || 0,
    qTimerHandle: null,
    durationSec: opts.durationSec ?? null,
    examTimeLeft: opts.durationSec ?? null,
    examTimerHandle: null,
    startedAt: Date.now(),
    revealed: false,
  };
  view = "running";
  render();
  if (session.mode === "exam") startExamTimer();
  if (session.timerSec) startQuestionTimer();
}

// ---------------- TIMERS ----------------
function startExamTimer(){
  if (session.examTimeLeft == null) return;
  clearInterval(session.examTimerHandle);
  session.examTimerHandle = setInterval(() => {
    session.examTimeLeft--;
    const elSec = document.getElementById("examClock");
    const elRing = document.getElementById("examRing");
    if (elSec) elSec.textContent = fmtTime(session.examTimeLeft);
    if (elRing) elRing.style.background = ring(pct(session.examTimeLeft, session.durationSec), session.examTimeLeft < 120 ? "--danger" : "--primary");
    if (session.examTimeLeft <= 0){
      clearInterval(session.examTimerHandle);
      finishSession(true);
    }
  }, 1000);
}
function stopExamTimer(){ clearInterval(session.examTimerHandle); }

function startQuestionTimer(){
  clearInterval(session.qTimerHandle);
  session.qTimeLeft = session.timerSec;
  updateQTimerUI();
  session.qTimerHandle = setInterval(() => {
    session.qTimeLeft--;
    updateQTimerUI();
    if (session.qTimeLeft <= 0){
      clearInterval(session.qTimerHandle);
      if (!session.revealed) answerCurrent(null); // se acabó el tiempo sin responder
    }
  }, 1000);
}
function stopQuestionTimer(){ clearInterval(session.qTimerHandle); }
function updateQTimerUI(){
  const el = document.getElementById("qRing");
  const num = document.getElementById("qRingNum");
  if (!el) return;
  el.style.background = ring(pct(session.qTimeLeft, session.timerSec), session.qTimeLeft <= 5 ? "--danger" : "--primary");
  if (num) num.textContent = session.qTimeLeft;
}

// ---------------- RUNNING VIEW ----------------
function currentQ(){ return byId[session.queue[session.index]]; }

function viewRunning(){
  if (session.mode === "exam") return viewExamRunning();
  return viewStudyRunning();
}

function questionMedia(q){
  if (q.sign) return `<div class="sign-box">${renderSign(q.sign, true)}<span class="sign-code">${q.signLabel || q.sign}</span></div>`;
  if (q.diagram) return `<div class="sign-box">${renderDiagram(q.diagram, true)}</div>`;
  return "";
}

function viewStudyRunning(){
  const q = currentQ();
  const total = session.queue.length;
  const ans = session.answers[q.id];
  const revealed = !!ans;
  const modeLabel = session.mode === "reinforce" ? "Refuerzo" : "Estudio";
  return `
  <section class="run-header">
    <button class="backlink" data-action="exit-session">&larr; Salir</button>
    <div class="progress-wrap"><div class="progress-label">${modeLabel} · ${session.index+1}/${total}</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct(session.index, total)}%"></div></div>
    </div>
    ${session.timerSec ? `<div class="qtimer" id="qRing" style="${ring(pct(session.qTimeLeft,session.timerSec))}"><span id="qRingNum">${session.qTimeLeft}</span></div>` : ""}
  </section>
  ${questionCard(q, ans, revealed, session.mode)}
  <div class="run-footer">
    ${revealed ? `<button class="btn-primary btn-lg" data-action="next-question">${session.index+1 < total ? "Siguiente" : "Ver resumen"}</button>` : `<span class="muted">Elige una alternativa</span>`}
  </div>`;
}

function viewExamRunning(){
  const q = currentQ();
  const total = session.queue.length;
  const answeredCount = Object.keys(session.answers).length;
  const nav = session.queue.map((id, i) => {
    const st = session.answers[id] ? "answered" : (i === session.index ? "current" : "");
    return `<button class="navdot ${st} ${i===session.index?"current":""}" data-action="goto-question" data-arg="${i}">${i+1}</button>`;
  }).join("");
  const ans = session.answers[q.id];
  return `
  <section class="run-header exam">
    <button class="backlink" data-action="exit-session">&larr; Salir</button>
    <div class="progress-wrap"><div class="progress-label">Examen · ${answeredCount}/${total} respondidas</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct(answeredCount, total)}%"></div></div>
    </div>
    ${session.durationSec ? `<div class="qtimer" id="examRing" style="${ring(pct(session.examTimeLeft,session.durationSec))}"><span id="examClock">${fmtTime(session.examTimeLeft)}</span></div>` : ""}
  </section>
  <div class="nav-grid">${nav}</div>
  ${questionCard(q, ans, false, "exam")}
  <div class="run-footer exam-footer">
    <button class="btn-ghost" data-action="prev-question" ${session.index===0?"disabled":""}>Anterior</button>
    <button class="btn-ghost" data-action="next-question-exam" ${session.index===total-1?"disabled":""}>Siguiente</button>
    <button class="btn-danger" data-action="finish-exam-confirm">Finalizar examen</button>
  </div>`;
}

function optionThumb(q, i){
  return (q.oImg && q.oImg[i]) ? `<img class="opt-thumb" src="${q.oImg[i]}" alt="Opción ${letter(i)}" loading="lazy">` : "";
}
function optionLabel(q, i){
  return `${letter(i)}) ${q.o[i]}`;
}

function questionCard(q, ans, revealed, mode){
  const options = q.o.map((optText, i) => {
    let cls = "opt-btn";
    if (revealed){
      if (i === q.a) cls += " correct";
      else if (ans && ans.selected === i) cls += " wrong";
      else cls += " dim";
    } else if (ans && ans.selected === i){
      cls += " selected";
    }
    const disabled = (mode !== "exam" && revealed) ? "disabled" : "";
    return `<button class="${cls}" data-action="select-option" data-arg="${i}" ${disabled}>
      <span class="opt-letter">${letter(i)}</span>${optionThumb(q,i)}<span class="opt-text">${optText}</span>
    </button>`;
  }).join("");
  let feedback = "";
  if (revealed && mode !== "exam"){
    const wasCorrect = ans.selected === q.a;
    const fbIcon = wasCorrect ? ICON.check : (ans.selected===null ? ICON.hourglass : ICON.cross);
    const fbText = wasCorrect ? "¡Correcto!" : (ans.selected===null ? "Sin respuesta — se acabó el tiempo." : "Incorrecto.");
    feedback = `<div class="feedback ${wasCorrect ? "ok":"bad"}">
      <span class="feedback-icon">${fbIcon}</span>${fbText}
      ${!wasCorrect ? `<div class="correct-note">Respuesta correcta: <strong>${optionLabel(q,q.a)}</strong>${optionThumb(q,q.a)}</div>` : ""}
    </div>`;
  }
  return `<section class="q-card">
    ${questionMedia(q)}
    <h3 class="q-text">${q.q}</h3>
    <div class="options${q.oImg ? " img-options" : ""}">${options}</div>
    ${feedback}
  </section>`;
}

// ---------------- ANSWER HANDLING ----------------
function selectOption(idx){
  const q = currentQ();
  if (session.mode === "exam"){
    session.answers[q.id] = { selected: idx, correct: idx === q.a };
    render();
    return;
  }
  if (session.answers[q.id]) return; // ya respondida
  answerCurrent(idx);
}

function answerCurrent(idx){
  const q = currentQ();
  stopQuestionTimer();
  const correct = idx === q.a;
  session.answers[q.id] = { selected: idx, correct };
  session.revealed = true;
  recordAnswer(STATE, q.id, correct);
  render();
}

function nextQuestion(){
  if (session.index + 1 >= session.queue.length){
    finishSession(false);
    return;
  }
  session.index++;
  session.revealed = false;
  render();
  if (session.timerSec) startQuestionTimer();
}

function nextQuestionExam(){
  if (session.index + 1 < session.queue.length){ session.index++; render(); }
}
function prevQuestion(){
  if (session.index > 0){ session.index--; render(); }
}
function gotoQuestion(i){ session.index = i; render(); }

function exitSession(){
  showConfirm("¿Salir de esta sesión? Se perderá el progreso de esta ronda.", () => {
    stopQuestionTimer(); stopExamTimer();
    session = null;
    go("home");
  }, "Salir");
}

function finishExamConfirm(){
  const total = session.queue.length;
  const answered = Object.keys(session.answers).length;
  const msg = answered < total
    ? `Has respondido ${answered} de ${total} preguntas. ¿Deseas finalizar el examen de todos modos?`
    : "¿Finalizar el examen y ver tus resultados?";
  showConfirm(msg, () => finishSession(false), "Finalizar");
}

function finishSession(byTimeout){
  stopQuestionTimer(); stopExamTimer();
  if (session.mode === "exam"){
    let correct = 0;
    session.queue.forEach(id => {
      const ans = session.answers[id];
      const isOk = ans ? ans.correct : false;
      if (isOk) correct++;
      recordAnswer(STATE, id, isOk);
    });
    const result = {
      ts: Date.now(), score: correct, total: session.queue.length,
      passed: correct >= PASS_SCORE, durationSec: Math.round((Date.now()-session.startedAt)/1000),
      byTimeout: !!byTimeout,
    };
    recordExam(STATE, result);
    session.lastResult = result;
    view = "exam-results";
  } else {
    view = "session-summary";
  }
  render();
}

// ---------------- DONACIÓN ----------------
function isSupportDismissed(){
  try{ return sessionStorage.getItem(SUPPORT_DISMISS_KEY) === "1"; }catch(e){ return false; }
}
function dismissSupportBanner(){
  try{ sessionStorage.setItem(SUPPORT_DISMISS_KEY, "1"); }catch(e){}
  const el = document.getElementById("supportBanner");
  if (el) el.remove();
}
function donationBanner(){
  if (isSupportDismissed()) return "";
  return `
  <section class="support-banner" id="supportBanner">
    <button class="support-close" data-action="dismiss-support" aria-label="Cerrar">${ICON.cross}</button>
    <div class="support-emoji">💙</div>
    <h3>¡Felicitaciones por tu logro!</h3>
    <p>Este material es gratuito y lo hacemos con cariño para que puedas sacar tu brevete. Si te está sirviendo, considera apoyar el proyecto para que siga creciendo y mantenerlo gratis para más gente.</p>
    <button class="btn-primary" data-action="support-click">Apoyar este proyecto</button>
  </section>`;
}
function supportClick(){
  if (SUPPORT_LINK){ window.open(SUPPORT_LINK, "_blank", "noopener"); return; }
  const btn = document.querySelector('[data-action="support-click"]');
  if (btn && !btn.dataset.clicked){
    btn.dataset.clicked = "1";
    btn.textContent = "¡Gracias! Muy pronto podrás donar aquí 💙";
    btn.disabled = true;
  }
}

function viewSessionSummary(){
  const total = session.queue.length;
  let correct = 0;
  session.queue.forEach(id => { if (session.answers[id] && session.answers[id].correct) correct++; });
  const failedIds = session.queue.filter(id => !(session.answers[id] && session.answers[id].correct));
  return `
  <section class="results-card">
    <h2>Ronda completada</h2>
    <div class="score-circle" style="${ring(pct(correct,total), correct/total>=0.9?"--success":"--primary")}">
      <span>${correct}/${total}</span>
    </div>
    <p class="muted">${pct(correct,total)}% de aciertos en esta ronda.</p>
    <div class="results-actions">
      ${failedIds.length ? `<button class="btn-primary" data-action="review-fails-now" data-arg="${failedIds.join(",")}">Repasar los ${failedIds.length} que fallé</button>`:""}
      <button class="btn-ghost" data-action="nav" data-arg="study-setup">Otra ronda</button>
      <button class="btn-ghost" data-action="nav" data-arg="home">Inicio</button>
    </div>
  </section>
  ${(correct/total >= 0.9) ? donationBanner() : ""}`;
}

function reviewFailsNow(idsStr){
  const ids = idsStr.split(",").map(Number);
  beginSession({ mode:"reinforce", queue: shuffle(ids), timerSec: 0 });
}

function viewExamResults(){
  const r = session.lastResult;
  const failed = session.queue.filter(id => !(session.answers[id] && session.answers[id].correct));
  const reviewRows = session.queue.map(id => {
    const q = byId[id];
    const ans = session.answers[id];
    const ok = ans && ans.correct;
    return `<div class="review-row ${ok?"ok":"bad"}">
      <div class="review-head"><span class="review-icon ${ok?"ok":"bad"}">${ok?ICON.check:ICON.cross}</span><span class="review-q">${q.q}</span></div>
      <div class="review-body">
        ${questionMedia(q)}
        <div>Tu respuesta: ${ans && ans.selected!==null && ans.selected!==undefined ? `${optionLabel(q,ans.selected)}${optionThumb(q,ans.selected)}` : "<em>sin responder</em>"}</div>
        ${!ok ? `<div class="correct-note">Correcta: <strong>${optionLabel(q,q.a)}</strong>${optionThumb(q,q.a)}</div>` : ""}
      </div>
    </div>`;
  }).join("");
  return `
  <section class="results-card ${r.passed ? "pass":"fail"}">
    <div class="pass-banner">${r.passed ? "🎉 ¡APROBADO!" : `<span class="feedback-icon">${ICON.cross}</span>NO APROBADO`}</div>
    <div class="score-circle" style="${ring(pct(r.score,r.total), r.passed?"--success":"--danger")}">
      <span>${r.score}/${r.total}</span>
    </div>
    <p class="muted">Necesitabas ${PASS_SCORE}/${EXAM_SIZE} para aprobar · Tiempo usado: ${fmtTime(r.durationSec)}${r.byTimeout?" (se acabó el tiempo)":""}</p>
    <div class="results-actions">
      ${failed.length ? `<button class="btn-primary" data-action="review-fails-now" data-arg="${failed.join(",")}">Repasar los ${failed.length} que fallé</button>`:""}
      <button class="btn-ghost" data-action="nav" data-arg="exam-setup">Nuevo simulacro</button>
      <button class="btn-ghost" data-action="nav" data-arg="home">Inicio</button>
    </div>
  </section>
  ${r.passed ? donationBanner() : ""}
  <section class="review-list">
    <h3>Repaso de tus respuestas</h3>
    ${reviewRows}
  </section>`;
}

// ---------------- STATS ----------------
function viewStats(){
  const s = computeStats(STATE, ALL);
  const senales = s.catStats.senales || {correct:0,wrong:0};
  const normas = s.catStats.normas || {correct:0,wrong:0};
  const history = s.examHistory.slice().reverse().slice(0, 10);
  return `
  <section class="setup-card">
    <button class="backlink" data-action="nav" data-arg="home">&larr; Inicio</button>
    <h2>Estadísticas</h2>
    <div class="hero-stats">
      <div class="hero-stat"><span class="big">${s.attempted}/${s.total}</span><span>preguntas practicadas</span></div>
      <div class="hero-stat"><span class="big">${s.accuracy}%</span><span>precisión global</span></div>
      <div class="hero-stat"><span class="big">${s.mastered}</span><span>dominadas</span></div>
    </div>
    <h3>Por categoría</h3>
    <div class="cat-bar-row">
      <span class="cat-label">Señales</span>
      <div class="cat-bar"><div class="cat-bar-fill" style="width:${pct(senales.correct, senales.correct+senales.wrong)}%"></div></div>
      <span class="cat-pct">${pct(senales.correct, senales.correct+senales.wrong)}%</span>
    </div>
    <div class="cat-bar-row">
      <span class="cat-label">Normas</span>
      <div class="cat-bar"><div class="cat-bar-fill" style="width:${pct(normas.correct, normas.correct+normas.wrong)}%"></div></div>
      <span class="cat-pct">${pct(normas.correct, normas.correct+normas.wrong)}%</span>
    </div>

    <h3>Preguntas que más te cuestan</h3>
    ${s.mostFailed.length===0 ? `<p class="empty-note">Todavía no tienes fallos registrados.</p>` : `
    <div class="most-failed">
      ${s.mostFailed.map(x => `<div class="mf-row">
        <span class="mf-code">${x.q.sign||""}</span>
        <span class="mf-text">${x.q.q}</span>
        <span class="mf-count">${x.wrong} fallo(s)</span>
      </div>`).join("")}
    </div>`}

    <h3>Historial de simulacros</h3>
    ${history.length===0 ? `<p class="empty-note">Aún no rindes ningún simulacro.</p>` : `
    <table class="hist-table">
      <thead><tr><th>Fecha</th><th>Puntaje</th><th>Resultado</th><th>Duración</th></tr></thead>
      <tbody>
      ${history.map(h => `<tr>
        <td>${new Date(h.ts).toLocaleString("es-PE",{dateStyle:"medium",timeStyle:"short"})}</td>
        <td>${h.score}/${h.total}</td>
        <td><span class="tag ${h.passed?"tag-ok":"tag-bad"}">${h.passed?"Aprobado":"No aprobado"}</span></td>
        <td>${fmtTime(h.durationSec)}</td>
      </tr>`).join("")}
      </tbody>
    </table>`}
    <button class="btn-ghost danger-link" data-action="reset-progress">Reiniciar todo mi progreso</button>
  </section>`;
}

function resetProgress(){
  showConfirm("Esto borrará todo tu progreso guardado (estadísticas, repeticiones e historial). ¿Continuar?", () => {
    STATE = defaultState();
    saveState(STATE);
    go("home");
  }, "Borrar todo");
}

// ---------------- EVENT DELEGATION ----------------
app.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip && !chip.dataset.action){
    chip.parentElement.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    return;
  }
  const t = e.target.closest("[data-action]");
  if (!t) return;
  const action = t.dataset.action, arg = t.dataset.arg;
  switch(action){
    case "nav": go(arg); break;
    case "start-study": startStudyFromUI(); break;
    case "start-reinforce": startReinforceFromUI(); break;
    case "start-exam": startExamFromUI(); break;
    case "select-option": selectOption(parseInt(arg,10)); break;
    case "next-question": nextQuestion(); break;
    case "next-question-exam": nextQuestionExam(); break;
    case "prev-question": prevQuestion(); break;
    case "goto-question": gotoQuestion(parseInt(arg,10)); break;
    case "exit-session": exitSession(); break;
    case "finish-exam-confirm": finishExamConfirm(); break;
    case "review-fails-now": reviewFailsNow(arg); break;
    case "reset-progress": resetProgress(); break;
    case "set-category": setCategory(arg); break;
    case "support-click": supportClick(); break;
    case "dismiss-support": dismissSupportBanner(); break;
  }
});

document.querySelectorAll(".navbtn").forEach(b => {
  b.addEventListener("click", () => go(b.dataset.nav));
});
const brandHome = document.getElementById("brandHome");
if (brandHome) brandHome.addEventListener("click", () => go("home"));

const subEl = document.querySelector(".brand-sub");
if (subEl) subEl.textContent = CATEGORIES[currentCat].sub;

// ---------------- TEMA CLARO / OSCURO ----------------
const THEME_KEY = "brevete_theme";
function currentTheme(){
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function setTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
  const btn = document.getElementById("themeToggle");
  if (btn) btn.setAttribute("aria-label", t === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}
const themeToggle = document.getElementById("themeToggle");
if (themeToggle){
  setTheme(currentTheme()); // sincroniza el aria-label con lo que ya aplicó el script inline del <head>
  themeToggle.addEventListener("click", () => setTheme(currentTheme() === "dark" ? "light" : "dark"));
}

// Enlace de donación siempre visible en el pie de página (independiente del banner de logro).
const footerSupport = document.getElementById("footerSupport");
if (footerSupport && SUPPORT_LINK){
  footerSupport.innerHTML = `<a class="footer-support-link" href="${SUPPORT_LINK}" target="_blank" rel="noopener">💙 ¿Te sirvió esta app? Apóyanos con una contribución</a>`;
}

render();
})();
