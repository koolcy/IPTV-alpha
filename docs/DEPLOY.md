# IPTV-alpha 部署指南

> 当前仓库仍处于 v3.0 开发阶段。部署前请以仓库实际代码、`worker/wrangler.toml` 和源码为准。

## 1. 部署架构

```text
GitHub
  │
  ├── GitHub Actions ──> Cloudflare Workers
  └── 源代码

Cloudflare
  │
  ├── Workers   API / IPTV 输出
  ├── KV        缓存 / 配置
  ├── D1        频道 / 用户 / EPG 数据
  └── Cron      定时任务
```

## 2. 环境要求

- Cloudflare 账号
- Node.js 20+
- npm
- Wrangler
- Docker Desktop（Docker 开发方式）

## 3. 获取项目

```bash
git clone https://github.com/koolcy/IPTV-alpha.git
cd IPTV-alpha
```

## 4. 本地 Worker

```bash
cd worker
npm install
npm run dev
```

默认开发地址通常为 `http://localhost:8787`，实际端口以 Wrangler 输出为准。

## 5. 创建 KV

```bash
npx wrangler kv namespace create IPTV_KV
```

将返回的 namespace ID 配置到 `worker/wrangler.toml`，并保持 binding 名称与代码一致。

## 6. 创建 D1

```bash
npx wrangler d1 create iptv
```

将返回的数据库 ID 配置到 `worker/wrangler.toml`。

初始化数据库：

```bash
npx wrangler d1 execute iptv --remote --file=../database/schema.sql
```

本地测试：

```bash
npx wrangler d1 execute iptv --local --file=../database/schema.sql
```

## 7. 部署 Worker

```bash
cd worker
npm run deploy
```

## 8. Docker 本地开发

在仓库根目录：

```bash
docker compose up --build
```

Worker 默认映射到 `http://localhost:8787`。

停止：

```bash
docker compose down
```

## 9. GitHub Actions

在 GitHub → Settings → Secrets and variables → Actions 中添加：

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

向 `main` 推送即可触发 `.github/workflows/deploy-worker.yml`。Token 应使用最小权限，严禁提交到仓库。

## 10. Admin

Admin 前端需要独立构建和部署。当前仓库是否包含可构建的 Admin 工程，以实际 `admin/` 内容为准；不要根据文档假定尚未提交的前端代码已经存在。

## 11. 生产检查清单

- [ ] Worker secrets 使用 Secret，而非源码变量
- [ ] KV / D1 binding 已配置
- [ ] D1 schema 已初始化
- [ ] Cron 已验证
- [ ] Admin API 地址已配置
- [ ] GitHub Actions Secrets 已配置
- [ ] API 限流已开启
- [ ] 管理员使用强密码
- [ ] 生产域名已启用 HTTPS
- [ ] 直播源与节目内容拥有合法使用权
