---
title: "Redis 10：Pub/Sub、Stream 与任务队列边界"
slug: redis-10-pubsub-stream
summary: "理解 Pub/Sub 广播、Stream 消费组、PEL、消息认领、重试、死信、延迟任务以及专业消息队列选型边界。"
category:
tags: []
status: draft
sortOrder: 100
cover:
---

# 10 Pub/Sub、Stream 与任务队列边界

## 1. Pub/Sub（P1）

发布：

```redis
PUBLISH redis-learning:channel:notifications "system maintenance"
```

订阅：

```redis
SUBSCRIBE redis-learning:channel:notifications
```

特点：

- 实时广播。
- 消息不持久化。
- 订阅者离线时不会补收。
- 没有确认、重试和消费进度。

适合在线通知、配置刷新提示、低价值实时信号。不适合支付、订单、邮件等必须可靠处理的任务。

## 2. Stream 基础（P1）

追加消息：

```redis
XADD redis-learning:stream:orders MAXLEN ~ 100000 * type order.created orderId 1001
```

读取：

```redis
XRANGE redis-learning:stream:orders - + COUNT 10
XREAD COUNT 10 BLOCK 5000 STREAMS redis-learning:stream:orders $
```

`$` 表示只读取之后的新消息；消费者重启要保存正确的读取位置，不能无脑使用 `$` 丢掉停机期间消息。

`MAXLEN ~` 使用近似裁剪，性能通常优于精确裁剪。裁剪策略必须保证最慢消费者仍有机会处理。

## 3. 消费者组（P1）

```redis
XGROUP CREATE redis-learning:stream:orders order-workers 0 MKSTREAM
XREADGROUP GROUP order-workers worker-1 COUNT 10 BLOCK 5000 STREAMS redis-learning:stream:orders >
XACK redis-learning:stream:orders order-workers 1785080000000-0
```

消费者组让组内消费者分摊消息。读取后未确认的消息进入 Pending Entries List（PEL）。

查看：

```redis
XPENDING redis-learning:stream:orders order-workers
XINFO GROUPS redis-learning:stream:orders
XINFO CONSUMERS redis-learning:stream:orders order-workers
```

## 4. 崩溃恢复与认领（P1）

消费者读取消息后崩溃，消息仍在 PEL。其他消费者可使用 `XAUTOCLAIM` 认领空闲过久消息：

```redis
XAUTOCLAIM redis-learning:stream:orders order-workers worker-2 60000 0-0 COUNT 10
```

消费者流程：

1. 读取消息。
2. 幂等执行业务。
3. 成功后 XACK。
4. 失败记录次数并重试。
5. 超过阈值移入死信 Stream，再 ACK 原消息。

Stream 通常提供至少一次处理语义，重复消息必须由消费者幂等处理。

## 5. 删除与确认不是一回事

- `XACK`：从某消费组 PEL 中确认，消息仍可能保留在 Stream。
- `XDEL`：删除消息实体，不会自动解决所有消费组状态。
- `XTRIM`：裁剪历史。

保留策略、消费进度和待处理消息必须一起监控。

## 6. Stream 何时够用

适合：

- 团队已有 Redis 运维能力。
- 中小规模事件/任务。
- 消费模式简单。
- 能接受 Redis 持久化和高可用语义。
- 已实现重试、死信、监控和幂等。

应评估 Kafka、RabbitMQ、RocketMQ、云消息队列等专业系统的场景：

- 很高吞吐或长时间消息保留。
- 复杂路由、事务消息、顺序分区。
- 多团队订阅和重放。
- 严格审计、跨地域和成熟运维需求。

不要因为已有 Redis 就让它承担所有基础设施职责。

## 7. 延迟任务

常用 ZSet：score 为执行时间，消费者原子领取到期任务。问题包括：

- 多消费者抢同一任务。
- 领取后崩溃。
- 执行失败重试。
- 时钟漂移。
- 任务取消和修改。
- 大量同刻任务造成峰值。

成熟 Node.js 项目可使用 BullMQ 等基于 Redis 的任务库，但仍应理解其连接、重试、幂等、保留和故障语义，不要把库当成无损魔法。

## 8. Outbox + Stream

MySQL 事务内写 Outbox，发布器把事件写入 Stream：

```text
MySQL business row + outbox row (同一事务)
        -> publisher -> Redis Stream
        -> consumer -> 幂等处理 -> XACK
```

发布器可能在写 Stream 成功但更新 Outbox 状态前崩溃，导致重复发布，所以 event_id 唯一和消费者幂等不可少。

## 9. 本章自检

- [ ] 能解释 Pub/Sub 为什么不能承载可靠任务。
- [ ] 知道 Stream 消费组、PEL 和 XACK 的作用。
- [ ] 能设计消息认领、重试、死信和幂等。
- [ ] 知道裁剪过早可能影响慢消费者。
- [ ] 能判断何时应使用专业消息队列。
