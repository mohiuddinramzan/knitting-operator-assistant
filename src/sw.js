// Offline-first service worker. VERSION and PRECACHE are stamped by scripts/build.mjs.
const VERSION = '__CACHE_VERSION__';
let PRECACHE = [];
try { PRECACHE = JSON.parse('__PRECACHE_JSON__'); } catch { /* dev mode: nothing precached */ }

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('koa-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok && VERSION !== '__CACHE_VERSION__') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => (req.mode === 'navigate'
        ? caches.match('./index.html').then((r) => r || caches.match('./offline.html'))
        : Response.error()));
    })
  );
});
