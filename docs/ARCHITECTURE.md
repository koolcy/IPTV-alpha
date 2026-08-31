# IPTV-alpha 架构说明

## 总体架构

```text
                    用户 / 播放器
                          │
                          ▼
                 Cloudflare CDN
                          │
                          ▼
                  Cloudflare Worker
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
            KV           D1          Cron
          缓存/配置    频道/用户/EPG   定时任务
             │            │            │
             └────────────┼────────────┘
                          ▼
                    IPTV Core
                  ┌───────┼───────┐
                  ▼       ▼       ▼
                 M3U    TVBox    EPG
                          │
                          ▼
                    Vue3 Admin
```

## 数据流

### 直播源

```text
直播源 URL
   ↓
Parser
   ↓
清洗 / 去重 / 分组
   ↓
D1 channels
   ↓
M3U / TVBox / API
```

### EPG

```text
XMLTV
  ↓
解析
  ↓
频道匹配
  ↓
D1 programs
  ↓
EPG API
```

### 用户订阅

```text
Token
  ↓
用户验证
  ↓
有效期 / 套餐 / 权限
  ↓
频道过滤
  ↓
缓存
  ↓
M3U / TVBox
```

## 存储职责

- D1：关系型、需要查询和分页的数据
- KV：缓存、短期状态、轻量配置
- Cache API / CDN：高频只读响应缓存

## 性能原则

1. 高频读取优先缓存。
2. 后台列表必须分页。
3. 批量检测分批执行。
4. M3U 大列表避免重复解析。
5. 数据库查询使用必要索引。
6. 日志避免无上限写入 D1。

## 安全原则

- 管理员密码使用 Secret。
- 用户订阅使用不可预测 Token。
- API 使用最小权限。
- 对高频接口实施限流。
- 管理操作记录审计日志。
- 生产环境强制 HTTPS。
