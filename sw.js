const CACHE_NAME = 'peg-pict-v2';
const FILES_TO_CACHE = [
  '/pegpict/paint-app.html',
  '/pegpict/manifest.json',
  '/pegpict/icon-192.png',
  '/pegpict/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 共有画像の受け取り（Share Target API）
  if (event.request.method === 'POST' && url.pathname === '/pegpict/paint-app.html') {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const image = formData.get('image');
      if (image) {
        const cache = await caches.open('share-target-temp');
        await cache.put('shared-image', new Response(image));
      }
      return Response.redirect('/pegpict/paint-app.html?shared=true', 303);
    })());
    return;
  }

  // 通常のキャッシュ処理
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});