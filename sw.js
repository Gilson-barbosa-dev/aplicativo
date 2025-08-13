const CACHE_NAME = "top-musicas-cache-v1";
const FILES_TO_CACHE = [
  "/aplicativo/",
  "/aplicativo/index.html",
  "/aplicativo/style.css",
  "/aplicativo/manifest.json",
  "/aplicativo/icon-192.png",
  "/aplicativo/icon-512.png"
];

// Instala e armazena arquivos no cache
self.addEventListener("install", event => {
  console.log("📥 Service Worker instalado");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", event => {
  console.log("⚡ Service Worker ativo");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Busca do cache ou da rede
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
