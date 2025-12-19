// Service Worker for Political Campaign Website
const CACHE_NAME = 'political-campaign-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Activate this SW immediately
  self.skipWaiting();
});

// Fetch event - serve cached content when offline
// Use network-first for navigation and index.html so users get updated HTML when online
self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Prefer network for navigation requests (HTML pages)
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Update cache for future offline use
          caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For other requests, try cache first then network
  event.respondWith(
    caches.match(request).then((response) => response || fetch(request))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of uncontrolled clients immediately
  self.clients.claim();
});
