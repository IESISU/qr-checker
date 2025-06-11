// オフラインで動作させるためのService Workerスクリプト (最終完成版)

// バージョンを更新して、新しいキャッシュを確実に作成します
const CACHE_NAME = 'qr-checker-cache-v4'; 
// アプリに必要なすべてのファイルをキャッシュします
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/html5-qrcode/html5-qrcode.min.js',
  // アイコンファイルもキャッシュに追加して完全オフライン化
  'https://placehold.co/192x192/007bff/ffffff?text=QR',
  'https://placehold.co/512x512/007bff/ffffff?text=QR'
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
