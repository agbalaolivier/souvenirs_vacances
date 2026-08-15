// 1. Incrémentation de la version pour forcer le remplacement du cache
const CACHE_NAME = 'souvenirs-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/app_logo.jpg', // <--- Ajout du logo dans le cache
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Installation du Service Worker et mise en cache des fichiers
self.addEventListener('install', (event) => {
  // Active immédiatement le nouveau SW sans attendre la fermeture du navigateur
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // Prend le contrôle de la page immédiatement
  );
});

// Interception des requêtes pour fonctionner hors-ligne
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});