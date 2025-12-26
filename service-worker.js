// service-worker.js

const CACHE_NAME = 'calorix-cache-v1';
// This list includes the essential files for the app shell to work offline.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // In a real build, this would be a JS bundle file.
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@700&display=swap',
];

// Install event: cache the application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use fetch with a no-cors request for cross-origin resources
        const fetchPromises = urlsToCache.map(urlToCache => {
            const request = new Request(urlToCache, {mode: 'no-cors'});
            return fetch(request).then(response => cache.put(urlToCache, response));
        });
        return Promise.all(fetchPromises);
      })
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              if (response.type === 'opaque') { // Handle opaque responses for no-cors requests
                 caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
              }
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
