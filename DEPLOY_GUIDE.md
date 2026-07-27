# 夏菲工作台手机端与云同步部署说明

## 先说清楚

这个文件夹里的代码已经支持：

- 手机 PWA 安装
- 离线打开页面
- 离线记录数据
- 联网后自动同步待上传数据
- Supabase 云端上传/下载
- DeepSeek 代理地址接入

但我不能替你完成这些外部动作：

- 创建 Supabase 项目
- 创建 Vercel / Cloudflare Pages / Netlify 项目
- 购买域名
- 替你保存 DeepSeek API Key
- 在没有公网部署的情况下，让手机在电脑关机后访问电脑本地文件

如果电脑关机后还要手机照常使用并上传数据，必须把这个文件夹部署到公网静态托管，并配置 Supabase。

## 文件说明

- `workstation.html`：主工作台页面
- `manifest.json`：手机 PWA 安装配置
- `service-worker.js`：离线缓存逻辑
- `supabase_setup.sql`：Supabase 建表 SQL

## Supabase 配置

1. 打开 Supabase，新建一个项目。
2. 进入 SQL Editor。
3. 执行 `supabase_setup.sql` 里的 SQL。
4. 进入 Project Settings → API，复制：
   - Project URL
   - anon public key
5. 打开夏菲工作台，在“云端与AI设置”里填写：
   - Supabase URL
   - Supabase Anon Key
   - 工作区 ID：可以先填 `default`
6. 点击“保存配置”，再点“立即同步”。

## 静态托管

推荐部署到以下任一平台：

- Cloudflare Pages
- Vercel
- Netlify

部署时把整个文件夹上传，确保这 3 个文件在同一层：

- `workstation.html`
- `manifest.json`
- `service-worker.js`

部署完成后，用手机打开公网网址，然后添加到主屏幕。

## DeepSeek 接入方式

不要把 DeepSeek API Key 直接写进 `workstation.html`。

正确方式是创建一个云函数作为代理，例如：

```text
手机网页 → 你的云函数代理 → DeepSeek API
```

然后在“云端与AI设置”里填写这个代理地址。

代理接口需要接收：

```json
{
  "task": "content_deconstruction",
  "input": "用户粘贴的文案",
  "prompt": "请严格按 JSON 返回..."
}
```

并返回：

```json
{
  "hook": "前3秒钩子",
  "structure": "内容结构",
  "emotionText": "情绪触发点",
  "timeText": "发布时间建议",
  "interactionText": "结尾互动设计"
}
```

如果没有配置 DeepSeek 代理，拆解器会自动使用本地规则，不会报错。

## 离线行为

- 手机无网络：可以打开已缓存页面，可以新增/修改原料、产品、备忘录。
- 手机恢复网络：会尝试把待同步数据上传到 Supabase。
- 没有配置 Supabase：数据只能保存在当前手机或当前电脑，不能跨设备同步。

## 真实限制

- 纯 HTML 文件不能在电脑关机后继续给手机提供访问服务。
- 没有网络时不可能真正上传数据。
- 不部署公网地址，手机只能访问本地文件或局域网地址。
- 不配置 Supabase，无法跨设备共享数据。
- 不配置 DeepSeek 代理，无法安全调用 DeepSeek API。
