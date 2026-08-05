// Service Worker — 甜品配方工作台 PWA
// 缓存策略：HTML 主文件用 stale-while-revalidate，保证离线可用 + 及时更新

const CACHE_NAME = 'recipe-atelier-v1';
const MAIN_URL = './index.html';

// 安装时预缓存主页面
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(MAIN_URL))
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求拦截 — stale-while-revalidate 策略
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  // GitHub API 请求不缓存（实时同步需要）
  const url = new URL(event.request.url);
  if (url.hostname === 'api.github.com') return;

  // 同源请求：先返回缓存，后台更新
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
