// sw.js — 火水おみくじ PWA Service Worker
const CACHE_NAME = 'kamimikuji-v1';

// インストール時：基本アセットをキャッシュ
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/180mi.png'
      ]).catch(function() {
        // キャッシュ失敗は無視して続行
      });
    })
  );
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// フェッチ：ネットワーク優先、失敗時にキャッシュを返す
self.addEventListener('fetch', function(e) {
  // POST など GET 以外はスルー
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(function(res) {
      // 成功したらキャッシュにも保存
      var resClone = res.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, resClone);
      });
      return res;
    }).catch(function() {
      // オフライン時はキャッシュから返す
      return caches.match(e.request);
    })
  );
});
