/* Kaizen service worker: precache the app shell, serve it cache-first. Same-origin only. */
const CACHE = 'kaizen-v1';
const FILES = [
  './',
  'index.html',
  'styles.css',
  'manifest.webmanifest',
  'fonts/literata-latin-wght-normal.woff2',
  'fonts/literata-latin-wght-italic.woff2',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'src/date.js',
  'src/bag.js',
  'src/day.js',
  'src/score.js',
  'src/store.js',
  'src/backup.js',
  'src/library/index.js',
  'src/library/health.js',
  'src/library/ibadah.js',
  'src/library/knowledge.js',
  'src/library/finance.js',
  'src/ui/app.js',
  'src/ui/dom.js',
  'src/ui/today.js',
  'src/ui/progress.js',
  'src/ui/history.js',

];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('kaizen-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit ?? fetch(req)),
  );
});
