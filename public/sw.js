// Kill-switch service worker.
//
// ChindoSpeak is a native iOS app now; the PWA is gone. Browsers that visited the old
// site still have the previous service worker registered, and it would keep serving the
// cached app shell forever. This file must therefore keep existing at this URL: browsers
// re-fetch it, get this version instead, and it unregisters itself and drops the caches.
//
// Do not delete this file until the old service worker has drained from the wild.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();

      const windows = await self.clients.matchAll({ type: 'window' });
      for (const client of windows) {
        client.navigate(client.url);
      }
    })()
  );
});
