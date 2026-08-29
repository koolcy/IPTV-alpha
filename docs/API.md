# IPTV Admin v3.0-alpha API

## Source List

GET

```
/admin/source/list
```

返回当前KV保存的直播源。

---

## Add Source

POST

```
/admin/source/add
```

Body:

```json
{
  "name":"央视源",
  "url":"https://example.com/live.txt"
}
```

返回保存结果。
