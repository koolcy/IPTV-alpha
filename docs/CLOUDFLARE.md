# Cloudflare 配置

## Workers

Worker 负责 IPTV API、订阅输出、后台 API 和定时任务入口。

部署：

```bash
cd worker
npm install
npx wrangler deploy
```

## KV

KV 适合保存缓存、轻量配置和短期状态。

创建：

```bash
npx wrangler kv namespace create IPTV_KV
```

创建后把返回 ID 写入 Wrangler 配置，并保证 binding 名称与代码一致。

## D1

D1 用于结构化数据，例如频道、用户、EPG 与操作记录。

```bash
npx wrangler d1 create iptv
npx wrangler d1 execute iptv --remote --file=database/schema.sql
```

## Cron Trigger

Cron 可用于频道状态检测、EPG 同步、缓存维护等周期任务。批量任务应设计为可恢复、分批执行，避免单次任务过重。

## Secrets

生产环境不要把管理员密码、API Token 等敏感值写进仓库。使用 Wrangler Secret：

```bash
npx wrangler secret put ADMIN_PASS
```

## GitHub Actions

推荐使用 GitHub Actions 调用 Wrangler 自动部署。需要配置：

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

API Token 遵循最小权限原则，并定期轮换。

## 域名

生产环境可将自定义域名绑定到 Worker。部署完成后验证：

```text
/health
/live.m3u
/tvbox
```

实际路由以 Worker 当前代码为准。
