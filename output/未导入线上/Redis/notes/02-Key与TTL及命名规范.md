---
title: "Redis 02：Key、TTL、命名与通用命令"
slug: redis-02-key-ttl-naming
summary: "掌握企业 Key 命名、生命周期、条件写入、TTL、SCAN、异步删除和原子计数等 Redis 基础规范。"
category:
tags: []
status: draft
sortOrder: 20
cover:
---

# 02 Key、TTL、命名与通用命令

## 1. Key 是 Redis 数据模型的入口

Redis 通过唯一 Key 定位一个值。企业项目中 Key 设计要同时表达：

- 环境或应用。
- 业务域。
- 数据类型或用途。
- 业务实体 ID。
- 必要的版本号。

推荐格式：

```text
blog:prod:user:profile:v1:1001
blog:prod:article:detail:v2:mysql-index
blog:prod:auth:session:8fd2...
blog:prod:rate-limit:login:ip:203.0.113.10
```

示例中使用冒号只是约定，Redis 不理解层级。

## 2. 命名原则（P0）

- 团队统一小写和冒号分段。
- Key 不应过长，也不能使用含义不明的缩写。
- 不把密码、Token 原文、身份证等敏感数据放进可观测 Key 名。
- 对缓存结构变更增加版本，如 `v2`，避免新旧序列化冲突。
- 多租户 Key 必须包含可信的 `tenant_id`。
- Cluster 多 Key 原子操作需要时，提前设计 Hash Tag，如 `{user:1001}`。

不要把完整 SQL、整段 JSON 或用户搜索原文直接作为 Key。可对规范化查询参数做稳定哈希，并保留业务前缀。

## 3. String 的基本操作

```redis
SET redis-learning:user:1:name "Alice"
GET redis-learning:user:1:name
MSET redis-learning:a 1 redis-learning:b 2
MGET redis-learning:a redis-learning:b
GETDEL redis-learning:user:1:name
```

`SET` 支持重要条件：

```redis
SET redis-learning:lock:order:1 unique-value NX PX 30000
SET redis-learning:cache:user:1 "json" EX 300 XX
```

- `NX`：Key 不存在才写。
- `XX`：Key 已存在才写。
- `EX`：秒级 TTL。
- `PX`：毫秒级 TTL。
- `GET`：返回旧值，具体组合按目标版本确认。

## 4. TTL 是生命周期契约（P0）

```redis
EXPIRE redis-learning:user:1:name 300
PEXPIRE redis-learning:user:1:name 300000
TTL redis-learning:user:1:name
PTTL redis-learning:user:1:name
PERSIST redis-learning:user:1:name
```

`TTL` 常见返回：

- 正数：剩余秒数。
- `-1`：Key 存在但没有过期时间。
- `-2`：Key 不存在。

临时数据必须在创建时一起设置 TTL，优先使用单条 `SET ... EX/PX`，避免 `SET` 成功后应用崩溃，`EXPIRE` 未执行而留下永久 Key。

## 5. 过期时间怎么定

TTL 不是越长越好，也不是统一 5 分钟：

| 数据 | TTL 思路 |
| --- | --- |
| 验证码 | 与产品有效期一致，如 5 分钟 |
| 登录会话 | 与安全策略一致，可滑动续期但设绝对上限 |
| 商品详情 | 根据更新频率与可接受陈旧时间，如 5 到 30 分钟 |
| 站点配置 | 较长 TTL + 更新后主动失效 |
| 空值缓存 | 短 TTL，防止长期隐藏新数据 |
| 分布式锁 | 大于正常临界区耗时，并有超时/续期设计 |

批量缓存不要使用完全相同 TTL，可能同一时刻大量失效形成雪崩。可以在基础 TTL 上增加随机抖动。

## 6. 类型和存在性检查

```redis
EXISTS redis-learning:user:1:name
TYPE redis-learning:user:1:name
OBJECT ENCODING redis-learning:user:1:name
MEMORY USAGE redis-learning:user:1:name
```

同一个 Key 只能有一种 Redis 类型。对 String Key 执行 Hash 命令会得到 `WRONGTYPE`。

## 7. 删除与异步释放（P1）

```redis
DEL redis-learning:cache:article:1
UNLINK redis-learning:cache:large-object
```

`DEL` 在主线程同步释放对象；删除很大对象可能造成延迟尖峰。`UNLINK` 把实际内存回收放到后台线程，更适合大 Key，但命令可用性取决于版本/服务商。

业务不能因为用了 `UNLINK` 就允许大 Key 无限产生，根因仍要修复。

## 8. 扫描 Key（P0）

生产禁止：

```redis
KEYS *
```

它会一次遍历全部 Key，可能阻塞实例。使用游标扫描：

```redis
SCAN 0 MATCH blog:prod:article:* COUNT 100
```

SCAN 注意：

- 返回的第一个值是下次游标，直到游标回到 0 才完成。
- COUNT 是提示，不保证每次返回数量。
- 扫描期间数据变化时可能重复返回或错过变化中的 Key。
- 应用要能处理重复项。
- 即使非阻塞式渐进扫描，遍历全库仍有资源成本。

集合内部对应 `HSCAN`、`SSCAN`、`ZSCAN`。

## 9. 原子计数与过期陷阱

```redis
INCR redis-learning:counter:article:1:view
INCRBY redis-learning:counter:article:1:view 10
DECR redis-learning:stock:product:1
```

INCR 是原子命令，但“第一次计数时设置 TTL”是两步逻辑：

```text
INCR key
如果结果为 1，则 EXPIRE key 60
```

应用在中间崩溃可能留下无 TTL Key。严格场景使用 Lua 把计数与设置过期原子化。

## 10. Keyspace 通知（P2）

Redis 可以发布 Key 过期/变更事件，但：

- 默认可能未启用。
- Pub/Sub 不保证离线消费者补收。
- 事件存在延迟和丢失可能。
- 开启会有额外开销。

不能把“过期通知”当作可靠订单超时处理的唯一机制。可靠延迟任务应使用可补偿扫描、专业队列或持久化调度系统。

## 11. 本章自检

- [ ] 能设计包含应用、环境、业务域和版本的 Key。
- [ ] 创建临时值时用单条 SET 同时设置 TTL。
- [ ] 能解释 TTL 的 `-1` 和 `-2`。
- [ ] 生产遍历使用 SCAN，不使用 KEYS。
- [ ] 知道 INCR 原子，但 INCR + EXPIRE 组合不自动原子。
