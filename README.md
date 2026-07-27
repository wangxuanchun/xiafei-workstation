# 夏菲工作台

夏菲工作台是一个面向甜品师和咖啡师的轻量级 Web 工作台，支持情报站、内容拆解器、原料库、产品库、备忘录、云端同步和手机 PWA 使用。

## 功能

- 情报站：按蛋糕、甜品、饮品、咖啡筛选热点信息。
- 拆解器：粘贴文案后生成内容结构、情绪点、发布时间建议和互动设计。
- 原料库：维护原料名称、进货价、建议售价和库存。
- 产品库：记录产品由哪些原料构成，自动计算成本和建议售价。
- 备忘录：记录灵感、待办和财务笔记。
- 云端配置：通过 Supabase 同步数据，预留 DeepSeek 代理地址。
- PWA：部署后可添加到手机主屏幕，支持离线打开和离线记录。

## GitHub 仓库文件

上传到 GitHub 时，根目录至少需要包含：

```text
index.html
404.html
manifest.json
service-worker.js
README.md
```

可选文件：

```text
DEPLOY_GUIDE.md
supabase_setup.sql
```

不要上传压缩包文件，例如 `xiafei-pages-upload.zip`。

## Cloudflare Pages 设置

连接 GitHub 仓库后，Cloudflare Pages 构建设置如下：

```text
Framework preset: None
Build command: 留空
Build output directory: / 或留空
Production branch: main
```

部署成功后，打开 Cloudflare 给出的 `pages.dev` 地址即可访问。

## Supabase 配置

1. 在 Supabase SQL Editor 执行 `supabase_setup.sql`。
2. 在工作台的“云端配置”页面填写：
   - Supabase URL
   - Supabase Anon Key
   - 工作区 ID：默认可填 `default`
3. 点击“保存配置”，再点“立即同步”。

## DeepSeek 接入

不要把 DeepSeek API Key 写进前端页面。正确方式是创建一个云函数代理，再把代理地址填入“云端配置”的 `DeepSeek 代理地址`。

没有配置 DeepSeek 代理时，拆解器会自动使用本地规则。

## 真实限制

- 没有网络时不能真正上传数据，只能先保存在手机本地。
- 没有配置 Supabase 时，数据不能跨设备同步。
- 电脑关机后手机还能使用的前提是：页面已经部署到 Cloudflare Pages 等公网平台。
