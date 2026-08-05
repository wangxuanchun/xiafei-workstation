/**
 * 甜品配方工作台 — 云同步 Worker
 * 部署到 Cloudflare Workers，提供跨设备数据同步
 *
 * API:
 *   GET  /ping          → 健康检查
 *   POST /create        → 创建同步空间，返回 { id: "uuid" }
 *   GET  /data/:id      → 读取同步数据
 *   PUT  /data/:id      → 更新同步数据
 *
 * 部署步骤：
 *   1. 注册 Cloudflare 账号 (https://dash.cloudflare.com/sign-up)
 *   2. 左侧菜单 → Workers & Pages → Create
 *   3. 选择 "Create Worker" → 取名 → Deploy
 *   4. 点击 "Edit code" → 删除默认代码 → 粘贴本文件全部内容
 *   5. 左侧菜单 → KV → Create a namespace → 取名 "SYNC_KV"
 *   6. 回到 Worker → Settings → Bindings → Add → KV Namespace
 *      Variable name: SYNC_KV
 *      KV namespace: SYNC_KV
 *   7. Save and Deploy
 *   8. 复制 Worker URL (如 https://xxx.your-name.workers.dev)
 *   9. 在App的「我的资料 → 云同步」中输入此地址
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/ping') {
      return new Response('pong', { headers: CORS });
    }

    // Create new sync space
    if (path === '/create' && request.method === 'POST') {
      const id = crypto.randomUUID();
      return new Response(JSON.stringify({ id }), {
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    // Get/Put data by sync code
    const match = path.match(/^\/data\/(.+)$/);
    if (match) {
      const code = match[1];

      if (request.method === 'GET') {
        const data = await env.SYNC_KV.get(code);
        return new Response(data || 'null', {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...CORS,
          },
        });
      }

      if (request.method === 'PUT') {
        const body = await request.text();
        // Limit body size to 2MB (Cloudflare KV limit is 25MB)
        if (body.length > 2 * 1024 * 1024) {
          return new Response('{"error":"payload too large"}', {
            status: 413,
            headers: { 'Content-Type': 'application/json', ...CORS },
          });
        }
        await env.SYNC_KV.put(code, body);
        return new Response('{"ok":true}', {
          headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }
    }

    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain', ...CORS },
    });
  },
};
