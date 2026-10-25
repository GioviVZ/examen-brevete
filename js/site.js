// Script compartido y liviano para páginas de contenido estático (no la SPA):
// solo maneja el selector de tema claro/oscuro, igual que app.js pero sin el
// resto de la lógica del simulador.
(function(){
"use strict";
var THEME_KEY = "brevete_theme";
function currentTheme(){
  var attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function setTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
  var btn = document.getElementById("themeToggle");
  if (btn) btn.setAttribute("aria-label", t === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}
var themeToggle = document.getElementById("themeToggle");
if (themeToggle){
  setTheme(currentTheme());
  themeToggle.addEventListener("click", function(){ setTheme(currentTheme() === "dark" ? "light" : "dark"); });
}
})();
