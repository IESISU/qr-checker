// オフラインで動作させるためのService Workerスクリプト (強制更新対応版)

// バージョンを更新することで、新しいキャッシュ領域を確保します
const CACHE_NAME = 'qr-checker-cache-v3'; 
const urlsToCache = [
  './',
  './index.html',
  './manifest.json', // manifestもキャッシュに追加
  'https://unpkg.com/html5-qrcode/html5-qrcode.min.js'
];

// 1. インストール処理: 新しいバージョンが来たら、待たずにすぐ有効化する
self.addEventListener('install', event => {
  self.skipWaiting(); // 古いWorkerがいても、待たずに有効化(Activate)に進む
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 有効化処理: 古いキャッシュを確実に削除し、すぐに制御を奪う
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName); // このバージョン以外のキャッシュをすべて削除
          }
        })
      );
    }).then(() => self.clients.claim()) // すべてのページを即座に制御下に置く
  );
});

// 3. ファイルのリクエストがあった時の処理 (変更なし)
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
