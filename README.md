# 📺 IPTV-alpha

> Cloudflare Workers 驱动的轻量级 IPTV 数据管理项目

IPTV-alpha 是一个面向 IPTV 直播源、频道和节目数据管理的 Serverless 项目。当前代码以 Cloudflare Workers 为核心，并提供 M3U/TXT 解析、M3U 输出和 TVBox 输出等基础能力。

> **状态：v3.0 开发中 / Alpha。** README 不会把尚未提交或尚未实现的后台、用户、EPG、商业化功能标记为“已完成”。请以仓库实际源码为准。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

## ✨ 当前能力

- 📡 M3U / M3U8 / TXT 直播源解析
- 🔤 自动识别 M3U 与 TXT 数据
- 🧹 基础数据解码与解析
- 📺 M3U 播放列表输出
- 📦 TVBox 数据输出
- ☁️ Cloudflare Workers Serverless 部署
- 🗄️ Wrangler 配置 D1 / KV 的基础结构
- 🐳 Docker 本地 Worker 开发环境
- 🔄 GitHub Actions 自动部署 Worker

## 🏗 当前架构

```text
                 ┌─────────────────┐
                 │      用户       │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Cloudflare      │
                 │ Worker          │
                 └────────┬────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      ┌─────────────┐           ┌─────────────┐
      │ Source URL  │           │ Output API  │
      │ M3U/TXT     │           │ M3U / TVBox │
      └─────────────┘           └─────────────┘

      规划中的 Cloudflare 服务：KV / D1 / Cron
```

## 📂 项目结构

```text
IPTV-alpha/
├── .github/
│   └── workflows/
│       └── deploy-worker.yml
├── worker/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── wrangler.toml
├── database/
│   └── schema.sql
├── docs/
│   ├── API.md
│   ├── DEPLOY.md
│   ├── DOCKER.md
│   ├── CLOUDFLARE.md
│   ├── ARCHITECTURE.md
│   └── images/
├── docker-compose.yml
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
└── README.md
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/koolcy/IPTV-alpha.git
cd IPTV-alpha
```

### 2. 本地运行 Worker

```bash
cd worker
npm install
npm run dev
```

默认 Wrangler 开发地址通常为：

```text
http://localhost:8787
```

实际地址以终端输出为准。

### 3. Docker

在项目根目录：

```bash
docker compose up --build
```

停止：

```bash
docker compose down
```

## ☁️ Cloudflare 部署

```bash
cd worker
npm install
npx wrangler login
npm run deploy
```

如果使用 D1 / KV，请先创建资源，再把对应 binding 配置到 `worker/wrangler.toml`。

D1：

```bash
npx wrangler d1 create iptv
npx wrangler d1 execute iptv --remote --file=../database/schema.sql
```

KV：

```bash
npx wrangler kv namespace create IPTV_KV
```

详细说明见 [`docs/DEPLOY.md`](docs/DEPLOY.md) 和 [`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md)。

## 🔄 GitHub Actions 自动部署

仓库包含：

```text
.github/workflows/deploy-worker.yml
```

在 GitHub → Settings → Secrets and variables → Actions 中设置：

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

之后推送到 `main` 会触发 Worker 部署；也支持 GitHub Actions 手动运行。

## 🔌 当前 API

### M3U

```http
GET /live.m3u
```

### TVBox

```http
GET /tvbox
```

### 默认路由

Worker 未匹配到上述接口时返回当前版本运行提示。

完整接口说明见 [`docs/API.md`](docs/API.md)。

## 🧩 Cloudflare 组件规划

| 组件 | 用途 | 当前状态 |
|---|---|---|
| Workers | API 与 IPTV 输出 | 使用中 |
| KV | 缓存 / 配置 | 已配置基础 binding |
| D1 | 结构化数据 | 已配置基础 binding |
| Cron | 定时任务 | 规划中 |
| R2 | 备份 / 对象存储 | 规划中 |

## 🛣️ Roadmap

### v3.0 Alpha → Beta

- [ ] Vue3 IPTV 管理后台
- [ ] 直播源 CRUD
- [ ] 频道数据库管理
- [ ] EPG / XMLTV 管理
- [ ] 用户与 Token 订阅
- [ ] 权限与套餐
- [ ] 频道在线检测
- [ ] Cron 自动维护
- [ ] API 限流与缓存

### v3.0 Stable

- [ ] 完成核心功能实现
- [ ] 完成前后端联调
- [ ] 完整生产部署验证
- [ ] 完整测试与安全审查
- [ ] 正式 Release

## 📚 文档

- [`docs/DEPLOY.md`](docs/DEPLOY.md) — 完整部署指南
- [`docs/DOCKER.md`](docs/DOCKER.md) — Docker 开发
- [`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md) — Cloudflare 配置
- [`docs/API.md`](docs/API.md) — API 文档
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — 架构说明
- [`CHANGELOG.md`](CHANGELOG.md) — 更新记录
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — 贡献指南
- [`SECURITY.md`](SECURITY.md) — 安全策略

## 🔐 安全

请勿将 Cloudflare API Token、密码、Cookie 或其他凭据提交到 Git。GitHub Actions 使用 Secrets 保存部署凭据。

发现安全问题请参考 [`SECURITY.md`](SECURITY.md)，不要在公开 Issue 中发布敏感信息。

## ⚠️ 免责声明

本项目提供直播数据的解析、管理与输出能力，不提供或托管未经授权的节目内容。

使用者应确保所使用的直播源、节目单及相关内容具有合法授权，并遵守所在地法律法规及第三方服务条款。

## 📄 License

MIT License — Copyright © 2026 koolcy
