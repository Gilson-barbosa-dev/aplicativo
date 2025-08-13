const CACHE_NAME = "top-musicas-cache-v2";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/style.css",
  "/icons/icon-192x192.png",
  "/icons/icon-256x256.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png"
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Assume controle imediatamente
});

// Ativação e limpeza de cache antigo
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  clients.claim(); // Controla todas as abas abertas
});

// Intercepta requisições para servir do cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache ou busca na rede
      return response || fetch(event.request);
    })
  );
});
