// Cache-first service worker. The PRECACHE array and CACHE version are
// rewritten by tools/build-precache.js -- edit that, not this list.
var CACHE = 'ap-exam-prep-v7';

var PRECACHE = [
  '.',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'vendor/katex/katex.min.css',
  'vendor/katex/katex.min.js',
  'lib/router.js',
  'lib/content-index.js',
  'lib/search.js',
  'lib/quiz-engine.js',
  'lib/progress-store.js',
  'views/reference-view.js',
  'views/quiz-view.js',
  'views/progress-view.js',
  'content.js',
  'questions.js',
  'content/l1.js',
  'content/l2.js',
  'content/l3.js',
  'content/l4.js',
  'content/l5.js',
  'content/l6.js',
  'content/l7.js',
  'content/l8.js',
  'content/l9.js',
  'questions/l1.js',
  'questions/l2.js',
  'questions/l3.js',
  'questions/l4.js',
  'questions/l5.js',
  'questions/l6.js',
  'questions/l7.js',
  'questions/l8.js',
  'questions/l9.js',
  'vendor/katex/fonts/KaTeX_AMS-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
  'vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2',
  'vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Main-Bold.woff2',
  'vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  'vendor/katex/fonts/KaTeX_Main-Italic.woff2',
  'vendor/katex/fonts/KaTeX_Main-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  'vendor/katex/fonts/KaTeX_Math-Italic.woff2',
  'vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2',
  'vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2',
  'vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Script-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Size1-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Size2-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Size3-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Size4-Regular.woff2',
  'vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // addAll is atomic: one 404 rejects the whole install, which is what we
      // want -- a half-populated cache is worse than no cache.
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;

  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(function (hit) {
      if (hit) return hit;

      return fetch(request).then(function (response) {
        // Only cache real same-origin successes; an opaque or error response
        // cached here would be served forever.
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
        return response;
      }).catch(function () {
        // Offline and uncached: fall back to the shell so a deep link still
        // opens the app rather than the browser's dinosaur.
        return caches.match('index.html');
      });
    })
  );
});
