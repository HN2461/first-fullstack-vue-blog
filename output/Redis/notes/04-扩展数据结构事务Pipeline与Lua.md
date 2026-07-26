---
title: "Redis 04：扩展数据结构、事务、Pipeline 与 Lua"
slug: redis-04-extended-types-pipeline-lua
summary: "学习 Bitmap、HyperLogLog、Geo、Stream、Pipeline、MULTI/EXEC、WATCH、Lua 和 Cluster Hash Tag。"
category:
tags: []
status: draft
sortOrder: 40
cover:
---

# 04 扩展数据结构、事务、Pipeline 与 Lua

## 1. Bitmap（P1）

Bitmap 不是独立顶层类型，本质是对 String 的位操作：

```redis
SETBIT redis-learning:signin:2026-07:1001 25 1
GETBIT redis-learning:signin:2026-07:1001 25
BITCOUNT redis-learning:signin:2026-07:1001
```

可用于签到、在线标记、是否完成等布尔状态。偏移量必须可控；如果直接用非常大的稀疏用户 ID 作为 offset，String 会扩展到对应位置，浪费内存。

## 2. HyperLogLog（P1）

用于近似去重计数，例如日活 UV：

```redis
PFADD redis-learning:uv:2026-07-26 user:1 user:2 user:3
PFCOUNT redis-learning:uv:2026-07-26
PFMERGE redis-learning:uv:2026-07 redis-learning:uv:2026-07-25 redis-learning:uv:2026-07-26
```

优点是固定小内存，代价是结果有误差，且不能列出成员。订单数、财务数据等要求精确的指标不能用它。

## 3. Geo（P1）

```redis
GEOADD redis-learning:shops 121.4737 31.2304 shop:shanghai
GEOADD redis-learning:shops 120.1551 30.2741 shop:hangzhou
GEOSEARCH redis-learning:shops FROMLONLAT 121.48 31.22 BYRADIUS 200 km WITHDIST
```

适合附近门店、配送点粗筛。复杂 GIS、多边形和高精度空间分析应使用专业空间数据库/搜索引擎。

## 4. Stream 概览（P1）

Stream 是追加日志结构，支持消费者组、确认和待处理列表：

```redis
XADD redis-learning:events:orders * type order.created orderId 1001
XRANGE redis-learning:events:orders - + COUNT 10
XLEN redis-learning:events:orders
```

完整消息语义见第 10 章。

## 5. Pipeline（P0）

连续执行 100 条命令若逐条等待，会产生 100 次网络往返。Pipeline 一次发送多条命令，再批量接收响应：

```text
应用 -- 100 commands --> Redis
应用 <-- 100 replies  --- Redis
```

Pipeline 提升吞吐、减少 RTT，但：

- 不保证命令原子性。
- 其他客户端命令可能在其中穿插。
- 批次太大会占用客户端/服务端内存并造成延迟尖峰。
- 每条命令仍会单独执行并返回结果/错误。

生产应按合理批次 Pipeline，例如数十到数百条，再根据响应大小和延迟测试。

## 6. MULTI / EXEC 事务（P1）

```redis
MULTI
INCR redis-learning:counter:a
INCR redis-learning:counter:b
EXEC
```

Redis 事务把命令排队后连续执行，中间不会插入其他客户端命令。但它与 MySQL 事务不同：

- 没有传统数据库的回滚能力。
- 运行时某条命令错误，其他命令仍可能执行。
- 事务中不能根据前一条返回值在客户端临时决定下一条。
- 不提供跨 Redis 与 MySQL 的原子事务。

## 7. WATCH 乐观并发（P1）

```redis
WATCH redis-learning:balance:user:1
GET redis-learning:balance:user:1
MULTI
SET redis-learning:balance:user:1 90
EXEC
```

如果 WATCH 后 Key 被其他客户端修改，EXEC 返回失败，应用重新读取并有限重试。高冲突场景反复重试成本高，Lua 往往更直接。

## 8. Lua 原子脚本（P0）

Redis 在服务端原子执行 Lua 脚本，适合“读、判断、写”组合：

```redis
EVAL "local current = tonumber(redis.call('GET', KEYS[1]) or '0'); local amount = tonumber(ARGV[1]); if current < amount then return 0 end; redis.call('DECRBY', KEYS[1], amount); return 1" 1 redis-learning:stock:1 2
```

脚本通过 `KEYS` 传 Key、`ARGV` 传普通参数，不能把用户输入直接拼成脚本文本。

Lua 注意：

- 执行期间会阻塞其他命令，脚本必须短小、确定且有界。
- 禁止在脚本中扫描海量 Key 或处理巨大集合。
- Cluster 中脚本涉及的 Key 必须在同一 Hash Slot。
- 使用 `SCRIPT LOAD` + `EVALSHA` 可减少脚本重复传输，应用需处理脚本缓存丢失后的 `NOSCRIPT`。

## 9. Functions（P2）

现代 Redis 支持把函数库加载到服务端，比散落 EVAL 脚本更易管理。是否可用取决于 Redis 版本、云服务限制和团队发布流程。入门先掌握 Lua 的原子性用途与阻塞边界。

## 10. Cluster Hash Tag（P1）

Redis Cluster 按 Key 计算 Slot。多 Key 命令/脚本通常要求 Key 在同一 Slot：

```text
app:order:{1001}:lock
app:order:{1001}:state
```

花括号中的 `1001` 参与 Hash Tag 计算，使两者进入同一 Slot。不要把所有 Key 都写成同一个 Hash Tag，否则流量集中到单一分片。

## 11. 原子性选择

| 需求 | 方案 |
| --- | --- |
| 单个计数增减 | 单条 INCR/DECRBY |
| 不存在才写 | SET NX |
| 多条命令减少 RTT | Pipeline，不保证原子 |
| 固定多条命令连续执行 | MULTI/EXEC |
| 读-判断-写 | Lua 或单条等价原子命令 |
| Redis + MySQL 一致提交 | 不可直接依赖 Redis 事务，使用业务一致性方案 |

## 12. 本章自检

- [ ] 能解释 Bitmap、HyperLogLog 和 Geo 的适用边界。
- [ ] 能区分 Pipeline 与事务。
- [ ] 知道 MULTI/EXEC 不提供 MySQL 式回滚。
- [ ] 能用 Lua 解决短小的读-判断-写原子逻辑。
- [ ] 知道 Lua 和大批 Pipeline 都可能阻塞或制造延迟尖峰。
