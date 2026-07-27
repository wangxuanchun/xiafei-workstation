-- 夏菲工作台 Supabase 建表 SQL
-- 在 Supabase 控制台 SQL Editor 中执行。

create table if not exists public.xiafei_workspaces (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.xiafei_workspaces enable row level security;

drop policy if exists "xiafei_public_read" on public.xiafei_workspaces;
create policy "xiafei_public_read"
on public.xiafei_workspaces
for select
using (true);

drop policy if exists "xiafei_public_upsert" on public.xiafei_workspaces;
create policy "xiafei_public_upsert"
on public.xiafei_workspaces
for insert
with check (true);

drop policy if exists "xiafei_public_update" on public.xiafei_workspaces;
create policy "xiafei_public_update"
on public.xiafei_workspaces
for update
using (true)
with check (true);

-- 说明：
-- 1. 当前是最简单的单用户/小团队预留表。
-- 2. 如果将来多人使用，请改成登录鉴权和按 user_id 隔离数据。
-- 3. 表中 id 默认使用前端配置的 workspaceId，例如 "default"。
