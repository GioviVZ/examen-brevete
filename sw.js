// Service worker: deja Brevete Perú usable sin conexión.
// App shell (HTML/CSS/JS) precacheado; imágenes de señales y rótulos se
// cachean sobre la marcha la primera vez que se ven, así no hace falta
// mantener aquí una lista manual de cada archivo de assets/.
const CACHE_VERSION = "brevete-v1";
const SHELL_ASSETS = [
  "index.html",
  "css/style.css",
  "manifest.webmanifest",
  "js/data.js",
  "js/data-2a.js",
  "js/data-2b.js",
  "js/data-3a.js",
  "js/data-3b.js",
  "js/data-3c.js",
  "js/signs.js",
  "js/srs.js",
  "js/app.js",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // no tocar Google Fonts, etc.

  const isImage = /\/assets\//.test(url.pathname);
  if (isImage){
    // Cache-first: las imágenes de señales/rótulos no cambian una vez publicadas.
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached))
    );
    return;
  }

  // App shell: red primero (para recibir actualizaciones), con respaldo en caché sin conexión.
  event.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((cached) => cached || caches.match("index.html")))
  );
});
