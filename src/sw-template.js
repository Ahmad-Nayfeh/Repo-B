// Service worker generated at build time (vite.config.ts injects the asset list).
const VERSION = '__VERSION__';
const ASSETS = __ASSETS__;
const CACHE = `munazara-${VERSION}`;
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('munazara-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const isPage = req.mode === 'navigate';
  e.respondWith(
    caches.match(isPage ? './index.html' : req, { ignoreSearch: true }).then((hit) => hit || fetch(req)),
  );
});
