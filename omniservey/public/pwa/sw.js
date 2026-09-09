const CACHE_NAME = 'omniservey-cache-v1';
const STATIC_ASSETS = [
  '/pwa',
  '/assets/omniservey/pwa/style.css',
  '/assets/omniservey/pwa/app.js',
  '/assets/omniservey/pwa/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/vue@3/dist/vue.global.prod.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.min.js',
  'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => console.warn('[SW] Cache add warning:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(networkResp => {
        if (networkResp && networkResp.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const respClone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
        }
        return networkResp;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/pwa');
        }
      });
    })
  );
});
