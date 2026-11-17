// Service Worker for Base Impact — offline resource directory
const CACHE_NAME = 'baseimpact-v4';
const OFFLINE_URLS = [
  '/',
  '/directory',
  '/directory/',
  '/blog/',
  '/about',
  '/contact',
  '/guide',
  '/programs',
  '/impact',
  '/partners',
  '/volunteer',
  '/how-to-help',
  '/purpose',
  '/join',
  '/donate',
  '/financials',
];

// A real offline page instead of silently diverting navigation to /directory/.
const OFFLINE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline — Base Impact</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;
font-family:Inter,system-ui,sans-serif;padding:1.5rem;text-align:center}
a{color:#7c8cff}
</style></head><body><div>
<h1>You're offline</h1>
<p>That page hasn't been saved for offline reading yet. Reconnect and try again.</p>
<p><a href="/" onclick="location.reload()">Back to Base Impact</a></p>
</div></body></html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-same-origin requests
  if (url.origin !== self.location.origin) return;

  // Cache CSS, JS, fonts, and images (cache-first)
  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/fonts/') ||
      url.pathname.endsWith('.css') || url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.svg') || url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') || url.pathname.endsWith('.ico')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for HTML pages. On a network error, retry once, then use
  // the cache, then show an honest offline page. Never silently divert the
  // visitor to an unrelated page (e.g. an article click landing on /directory/).
  event.respondWith(
    fetch(event.request)
      .catch(() => fetch(event.request))
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) =>
          cached || new Response(OFFLINE_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        )
      )
  );
});
