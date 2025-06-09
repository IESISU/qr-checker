// オフラインで動作させるためのService Workerスクリプト

const CACHE_NAME = 'qr-checker-cache-v2';
// オフラインでも使えるように、事前に保存しておくファイルの一覧
const urlsToCache = [
  './', // index.htmlを指します
  './index.html',
  'https://unpkg.com/html5-qrcode/html5-qrcode.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap',
  // アイコンもキャッシュしておくとより良いですが、必須ではありません
];

// 1. インストール処理
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. ファイルのリクエストがあった時の処理
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュにファイルがあれば、それを返す
        if (response) {
          return response;
        }
        // なければ、ネットワークから取りに行く
        return fetch(event.request);
      })
  );
});

// 3. 古いキャッシュを削除する処理
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
