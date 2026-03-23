const CACHE = 'bmo-v3';
const ASSETS = [
  '/BmoPlayground/',
  '/BmoPlayground/index.html',
  '/BmoPlayground/manifest.json',
  '/BmoPlayground/icon-192.png',
  '/BmoPlayground/icon-512.png'
];

// Install & cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate & clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first, fallback to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});

// Background sync
self.addEventListener('sync', e => {
  if (e.tag === 'bmo-sync') {
    e.waitUntil(Promise.resolve());
  }
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.text() : 'BMO says hello!';
  e.waitUntil(
    self.registration.showNotification('BMO', {
      body: data,
      icon: '/BmoPlayground/icon-192.png',
      badge: '/BmoPlayground/icon-192.png'
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/BmoPlayground/'));
});

// Periodic background sync
self.addEventListener('periodicsync', e => {
  if (e.tag === 'bmo-periodic') {
    e.waitUntil(Promise.resolve());
  }
});
