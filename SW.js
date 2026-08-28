self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open('ugcampus-v1').then(c=>c.addAll(['./','./index.html','./papers.json']))
  );
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
