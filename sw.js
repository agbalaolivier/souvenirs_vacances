const CACHE_NAME = 'souvenirs-vacances-dynamic';

// Installation : prend le contrôle immédiatement
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activation : prend le contrôle des pages ouvertes
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Stratégie Réseau d'abord : va chercher sur Internet, sinon prend le cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si le réseau répond, on met à jour le cache silencieusement
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de panne de réseau (hors-ligne), on utilise le cache local
        return caches.match(event.request);
      })
  );
});