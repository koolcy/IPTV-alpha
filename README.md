# 📺 IPTV-alpha

> Cloudflare Workers 驱动的 IPTV 管理平台
>
> 轻量 · 高性能 · Serverless · 可扩展

## 项目介绍

IPTV-alpha 是一个基于 Cloudflare Workers 架构的 IPTV 数据管理系统，用于管理直播源、频道、EPG 和用户订阅。

主要能力：

- M3U / M3U8 / TXT 直播源解析
- 频道管理
- M3U 输出
- TVBox 接口
- EPG 节目单
- 用户订阅 Token
- 权限控制
- 自动检测
- CDN 缓存
- Vue3 管理后台

---

## ✨ 功能特性

### 📡 直播源管理

支持：

- M3U
- M3U8
- TXT
- HTTP订阅地址

功能：

- 自动解析
- 内容清洗
- 分类整理
- 源状态检测

### 📺 频道管理

支持：

- 频道搜索
- 分组管理
- LOGO管理
- 在线检测
- 批量维护

### 📦 输出接口

M3U：

```
/live.m3u
```

TVBox：

```
/tvbox
```

API：

```
/api/channel
```

### 🗓 EPG系统

支持：

- XMLTV 导入
- 自动频道匹配
- 节目查询
- TVBox EPG

### 👥 用户订阅

支持：

- 用户管理
- Token订阅
- 到期控制
- 权限限制

示例：

```
/u/{token}.m3u
```

---

# 🏗 系统架构

```
用户
 |
Cloudflare CDN
 |
Worker API
 |
+-------------+-------------+
|             |             |
KV            D1          Cache
缓存          数据库       加速
 |
IPTV Core
 |
+-------------+-------------+
M3U        TVBox        EPG
 |
Vue3 Admin
```

---

# 📂 项目结构

```
IPTV-alpha
|
├── worker
│   ├── src
│   ├── api
│   ├── parser
│   ├── auth
│   ├── cache
│   └── storage
│
├── admin
│   └── Vue3 Admin
│
├── database
│   └── schema.sql
│
├── docker
│
├── docs
│
└── README.md
```

---

# 🚀 部署

## Cloudflare Worker

安装 Wrangler：

```bash
npm install -g wrangler
```

登录：

```bash
wrangler login
```

部署：

```bash
cd worker
npm install
wrangler deploy
```

---

## KV

创建：

```bash
wrangler kv namespace create IPTV_KV
```

用途：

- 缓存
- 配置
- Token限制

---

## D1 数据库

创建：

```bash
wrangler d1 create iptv
```

初始化：

```bash
wrangler d1 execute iptv --file database/schema.sql
```

用途：

- 用户
- 频道
- EPG
- 日志

---

# 🐳 Docker开发

启动：

```bash
docker compose up -d
```

访问：

```
Worker http://localhost:8787
Admin http://localhost:5173
```

---

# 🔄 GitHub Actions 自动部署

支持：

```
GitHub Push
    ↓
Actions
    ↓
Wrangler
    ↓
Cloudflare Worker
```

需要配置：

```
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

---

# 🔌 API

## M3U

```
GET /live.m3u
```

## TVBox

```
GET /tvbox
```

## 用户订阅

```
GET /u/{token}.m3u
```

---

# ⏰ 自动任务

支持：

- 频道检测
- EPG同步
- 缓存刷新
- 数据维护

---

# 🛣 Roadmap

## v3.0 Stable

✅ IPTV核心

✅ M3U/TXT解析

✅ TVBox

✅ EPG

✅ D1数据库

✅ 用户系统

✅ 权限系统

✅ CDN缓存

✅ 自动部署

## v3.1

计划：

- Docker生产版
- 多租户
- Web播放器
- 手机管理端
- AI频道整理

---

# ⚠️ 免责声明

本项目仅提供 IPTV 数据管理和接口生成能力。

请确保使用合法授权的数据源，并遵守当地法律法规。

---

# License

MIT License

Copyright © koolcy
