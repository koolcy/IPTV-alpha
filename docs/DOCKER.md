# Docker 本地开发

## 启动

在项目根目录：

```bash
docker compose up --build
```

后台运行：

```bash
docker compose up -d --build
```

查看日志：

```bash
docker compose logs -f
```

停止：

```bash
docker compose down
```

## 开发说明

Docker 主要用于统一 Node.js / Wrangler 开发环境。Cloudflare KV、D1、Cron 等生产资源仍应按照 Cloudflare 配置进行绑定。

如果使用 Wrangler Local，D1 本地数据库和生产 D1 是两套数据，执行迁移前请确认 `--local` 或 `--remote`。

## Admin

```bash
cd admin
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

> 实际 Docker 服务名、端口和命令应以仓库当前 `docker-compose.yml` 为准。
