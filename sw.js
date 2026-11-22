/*
 * Kaizen service worker. Same-origin GETs only.
 * Strategy: stale-while-revalidate — answer from cache instantly (works offline),
 * then fetch a fresh copy in the background so the next launch gets updates.
 * CACHE must match src/version.js (enforced by tests/version.test.js).
 */
const CACHE = 'kaizen-1.0.0';
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
  'src/version.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
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
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req, { cache: 'no-cache' })
      .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
      .catch(() => undefined);
    if (hit) { event.waitUntil(fresh); return hit; }
    return (await fresh) ?? Response.error();
  }));
});
