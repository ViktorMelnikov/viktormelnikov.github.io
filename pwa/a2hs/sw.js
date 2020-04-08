self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('video-store').then(function(cache) {
     return cache.addAll([
       '/pwa/a2hs/',
       '/pwa/a2hs/index.html',
       '/pwa/a2hs/index.js',
       '/pwa/a2hs/style.css',
       '/pwa/a2hs/images/fox1.jpg',
       '/pwa/a2hs/images/fox2.jpg',
       '/pwa/a2hs/images/fox3.jpg',
       '/pwa/a2hs/images/fox4.jpg'
     ]);
   })
 );
});

self.addEventListener('fetch', function(e) {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
