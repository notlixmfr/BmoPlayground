const CACHE = 'bmo-v4';
const ASSETS = [
  '/BmoPlayground/',
  '/BmoPlayground/index.html',
  '/BmoPlayground/manifest.json',
  '/BmoPlayground/icon-192.png',
  '/BmoPlayground/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('push', e => {
  e.waitUntil(self.registration.showNotification('BMO', {
    body: e.data ? e.data.text() : 'BMO says hi!',
    icon: '/BmoPlayground/icon-192.png',
    badge: '/BmoPlayground/icon-192.png'
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/BmoPlayground/'));
});

self.addEventListener('sync', e => {
  e.waitUntil(Promise.resolve());
});

self.addEventListener('periodicsync', e => {
  e.waitUntil(Promise.resolve());
});
