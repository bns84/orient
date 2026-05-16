/**
 * ORIENT - Service Worker
 * 
 * PWA Offline-First Strategie
 * Respektiert ORIENT_DNA: Local-first, keine Cloud-Pflicht
 */

const CACHE_NAME = 'orient-v0.1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/app/main.ts',
  '/src/app/App.ts',
  '/src/app/styles.css',
  '/favicon.svg',
];

// Install Event - Cache Resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event - Offline-First Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Cache miss - fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Clone the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // Offline - return offline page if available
            // For now, just fail gracefully (DNA: Stille ist ein Feature)
          });
      })
  );
});
