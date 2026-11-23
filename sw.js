const CACHE_PREFIX = 'studynest-shell-';
const CACHE_NAME = CACHE_PREFIX + '6';
const SHELL = [
  './', './index.html', './styles.css', './app.js', './courses.js',
  './manifest.webmanifest', './assets/icon-192.png', './assets/icon-512.png',
  './assets/icon-maskable.png', './assets/apple-touch-icon.png', './assets/icons.png',
  './assets/backend-art.webp', './assets/react-art.webp', './assets/python-art.webp',
];
const urls = new Set(SHELL.map(path => new URL(path, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  url.search = '';
  if (request.method !== 'GET' || !urls.has(url.href)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(url.href, response.clone());
      if (response.status < 500) return response;
    } catch {
      // Use the cached shell when the network is unavailable.
    }
    return (await cache.match(url.href)) ?? Response.error();
  })());
});
