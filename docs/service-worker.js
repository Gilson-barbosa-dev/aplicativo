const CACHE_NAME = "top-musicas-cache-v2";
const urlsToCache = [
  "/aplicativo/",
  "/aplicativo/index.html",
  "/aplicativo/manifest.json",
  "/aplicativo/style.css",
  "/aplicativo/icons/icon-192x192.png",
  "/aplicativo/icons/icon-256x256.png",
  "/aplicativo/icons/icon-384x384.png",
  "/aplicativo/icons/icon-512x512.png"
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).catch((err) => {
      console.error("Erro ao adicionar arquivos no cache", err);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  clients.claim();
});

// Intercepta requisições e responde do cache quando possível
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
