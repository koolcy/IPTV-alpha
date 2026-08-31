# IPTV-alpha 部署指南

本文介绍 IPTV-alpha 的本地开发、Cloudflare Workers、D1、KV、Cron、Docker 与 GitHub Actions 部署流程。

## 1. 部署架构

```text
GitHub
  │
  ├── GitHub Actions ──> Cloudflare Workers
  │
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
- Docker Desktop（仅 Docker 开发方式需要）

## 3. 获取项目

```bash
git clone https://github.com/koolcy/IPTV-alpha.git
cd IPTV-alpha
```

## 4. 本地 Worker

```bash
cd worker
npm install
npx wrangler dev
```

默认开发地址通常为 `http://localhost:8787`，实际端口以 Wrangler 输出为准。

## 5. 创建 KV

```bash
npx wrangler kv namespace create IPTV_KV
```

将命令返回的 namespace ID 配置到 Worker 的 Wrangler 配置文件中，并确保代码使用的 binding 名称一致。

## 6. 创建 D1

```bash
npx wrangler d1 create iptv
```

然后把 D1 binding 配置到 Wrangler 配置中。

初始化数据库：

```bash
npx wrangler d1 execute iptv --remote --file=../database/schema.sql
```

本地测试可使用：

```bash
npx wrangler d1 execute iptv --local --file=../database/schema.sql
```

## 7. 部署 Worker

```bash
cd worker
npx wrangler deploy
```

部署成功后使用 Wrangler 输出的 Worker 地址进行验证。

## 8. Cron

在 Wrangler 配置中定义 Cron Trigger。建议把频道检测、EPG 同步等任务拆成独立函数，并避免在一次 Cron 执行中处理无法在 Worker 时间限制内完成的大批量任务。

## 9. Docker 本地开发

项目根目录执行：

```bash
docker compose up --build
```

后台与 Worker 的实际端口以仓库中的 `docker-compose.yml` 为准。

停止：

```bash
docker compose down
```

## 10. GitHub Actions

在 GitHub 仓库 Settings → Secrets and variables → Actions 中配置：

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

然后向 `main` 推送代码即可触发部署 workflow。Token 应只授予部署所需的最小权限，严禁提交到仓库。

## 11. Admin 部署

Admin 是独立的前端构建产物。生产环境建议构建后部署到 Cloudflare Pages 或其他静态托管，并把 API 地址指向生产 Worker。

```bash
cd admin
npm install
npm run build
```

## 12. 生产检查清单

- [ ] Worker secrets 已使用 Secret，而不是写入源码
- [ ] KV / D1 binding 已配置
- [ ] D1 schema 已初始化
- [ ] Cron 已验证
- [ ] Admin API 地址已配置
- [ ] GitHub Actions Secret 已配置
- [ ] API 限流已开启
- [ ] 管理员账号使用强密码
- [ ] 生产域名已绑定并启用 HTTPS
- [ ] 直播源与节目内容拥有合法使用权
