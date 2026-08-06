// Service Worker — 甜品配方工作台 PWA
// 缓存策略：network-first for HTML, cache-first for static assets

const CACHE_NAME = 'recipe-atelier-v37';
const MAIN_URL = './';

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
    ).then(() => self.clients.claim())
  );
});

// 请求拦截 — HTML 用 network-first（保证及时更新），其他资源用 stale-while-revalidate
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // GitHub API 请求不缓存
  if (url.hostname === 'api.github.com') return;

  if (url.origin === self.location.origin) {
    // HTML 请求：network-first，确保用户总是获取最新版本
    if (event.request.headers.get('accept')?.includes('text/html')) {
      event.respondWith(
        fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        }).catch(() => caches.match(event.request).then((cached) => cached || new Response('离线模式', {status: 503})))
      );
      return;
    }
    // 其他资源：stale-while-revalidate
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
