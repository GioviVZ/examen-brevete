// Estado persistente (localStorage): progreso por pregunta (repetición espaciada
// estilo Leitner de 5 cajas), historial de exámenes y estadísticas agregadas.
const STORAGE_KEY = "brevete_v1";
const BOX_INTERVALS_MS = [0, 10*60*1000, 24*60*60*1000, 3*24*60*60*1000, 7*24*60*60*1000];
const MAX_BOX = BOX_INTERVALS_MS.length - 1;

function nowTs(){ return Date.now(); }

function defaultState(){
  return { perQuestion: {}, examHistory: [], createdAt: nowTs() };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  }catch(e){
    console.warn("No se pudo leer el progreso guardado, se reinicia.", e);
    return defaultState();
  }
}

function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function qStat(state, id){
  if (!state.perQuestion[id]){
    state.perQuestion[id] = { box:0, dueAt:0, seen:0, correct:0, wrong:0, lastResult:null, lastTs:0 };
  }
  return state.perQuestion[id];
}

function recordAnswer(state, id, isCorrect){
  const s = qStat(state, id);
  s.seen++;
  s.lastTs = nowTs();
  if (isCorrect){
    s.correct++;
    s.box = Math.min(MAX_BOX, s.box + 1);
    s.lastResult = "ok";
  } else {
    s.wrong++;
    s.box = 0;
    s.lastResult = "fail";
  }
  s.dueAt = nowTs() + BOX_INTERVALS_MS[s.box];
  saveState(state);
  return s;
}

function isDue(state, id){
  const s = state.perQuestion[id];
  if (!s) return false;
  if (s.lastResult !== "fail" && s.box >= MAX_BOX) return false; // dominada
  return s.dueAt <= nowTs();
}

function isMastered(state, id){
  const s = state.perQuestion[id];
  return !!s && s.box >= MAX_BOX && s.lastResult === "ok";
}

function failedQuestionIds(state){
  return Object.keys(state.perQuestion)
    .filter(id => state.perQuestion[id].lastResult === "fail")
    .map(Number);
}

// Construye una ronda de refuerzo priorizando: vencidas > falladas recientes > menos vistas.
function buildReinforcementQueue(state, allIds, count){
  const due = allIds.filter(id => isDue(state, id));
  const failedNotDue = allIds.filter(id => !due.includes(id) && state.perQuestion[id] && state.perQuestion[id].lastResult === "fail");
  const rest = allIds.filter(id => !due.includes(id) && !failedNotDue.includes(id))
    .sort((a,b) => (state.perQuestion[a]?.seen||0) - (state.perQuestion[b]?.seen||0));
  const queue = [...shuffle(due), ...shuffle(failedNotDue), ...rest];
  return queue.slice(0, count);
}

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(allIds, count){
  return shuffle(allIds).slice(0, count);
}

function recordExam(state, result){
  state.examHistory.push(result);
  if (state.examHistory.length > 100) state.examHistory.shift();
  saveState(state);
}

function computeStats(state, allQuestions){
  const total = allQuestions.length;
  const perQ = state.perQuestion;
  const attempted = allQuestions.filter(q => !!perQ[q.id]).length;
  let correctSum = 0, wrongSum = 0, mastered = 0;
  const catStats = {};
  allQuestions.forEach(q => {
    const cat = (q.sign || q.diagram) ? "senales" : "normas";
    if (!catStats[cat]) catStats[cat] = { correct:0, wrong:0 };
    const s = perQ[q.id];
    if (s){
      correctSum += s.correct;
      wrongSum += s.wrong;
      catStats[cat].correct += s.correct;
      catStats[cat].wrong += s.wrong;
      if (isMastered(state, q.id)) mastered++;
    }
  });
  const accuracy = (correctSum + wrongSum) > 0 ? Math.round((correctSum/(correctSum+wrongSum))*100) : 0;
  const mostFailed = allQuestions
    .map(q => ({ q, wrong: perQ[q.id]?.wrong || 0, seen: perQ[q.id]?.seen || 0 }))
    .filter(x => x.wrong > 0)
    .sort((a,b) => b.wrong - a.wrong)
    .slice(0, 10);
  return { total, attempted, mastered, accuracy, catStats, mostFailed, examHistory: state.examHistory };
}

if (typeof module !== "undefined") module.exports = {
  STORAGE_KEY, loadState, saveState, qStat, recordAnswer, isDue, isMastered,
  failedQuestionIds, buildReinforcementQueue, shuffle, pickRandom, recordExam, computeStats
};
