self.addEventListener("install", event => {
  console.log("📥 Service Worker instalado");
  self.skipWaiting(); // Garante que o SW ativo substitua versões antigas imediatamente
});

self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});
