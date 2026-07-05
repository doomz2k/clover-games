// Offline support for Clover Games. Strategy:
//   - navigations: network-first (updates arrive promptly), cache fallback
//   - everything else same-origin: stale-while-revalidate (instant loads,
//     refreshed in the background for next time)
// Game code, fonts and voice clips are cached as they're used, so after one
// online play-through a game works fully offline. Bump VERSION to drop old
// caches after a big restructure; day-to-day deploys don't need it.

const VERSION = 'clover-v1';

const PRECACHE = [
  './',
  'index.html',
  'certificate.html',
  'stickers.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'fonts/fonts.css',
  'fonts/fredoka-one-latin-400-normal.woff2',
  'fonts/quicksand-latin-500-normal.woff2',
  'fonts/quicksand-latin-700-normal.woff2',
  'vendor/pixi.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then((hit) => hit || caches.match('index.html'))),
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit); // offline: nothing to refresh with
      return hit || refresh;
    }),
  );
});
