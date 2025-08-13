<<<<<<< HEAD
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
=======
self.addEventListener("install", event => {
  console.log("📥 Service Worker instalado");
});

self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});
>>>>>>> 27f76e718e7c1eaf22d3bf5492260c6b0e832330
