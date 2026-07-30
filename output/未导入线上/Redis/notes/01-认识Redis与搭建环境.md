---
title: "Redis 01：认识 Redis 与搭建环境"
slug: redis-01-getting-started
summary: "理解 Redis 的能力边界、与 MySQL 的职责区别、常见发行版、安装连接方式和基础运行信息。"
category:
tags: []
status: draft
sortOrder: 10
cover:
---

# 01 认识 Redis 与搭建环境

## 1. Redis 是什么（P0）

Redis 是以内存为主要工作介质的键值数据系统，支持丰富的数据结构、过期时间、原子命令、持久化、复制和集群。

它快的主要原因包括：

- 热数据主要在内存中访问。
- 核心命令的数据结构和算法经过优化。
- 命令执行模型避免了大量共享数据加锁复杂度。
- 网络协议简单，支持 Pipeline 批量发送。

“Redis 单线程”是过度简化。命令处理的核心路径长期以单线程串行执行为主要模型，但网络 IO、持久化、释放内存等在现代版本中可以使用其他线程。工程结论是：某个慢命令或大 Key 操作仍可能阻塞其他请求。

## 2. Redis 适合什么（P0）

- 热点数据缓存。
- 登录会话和短期令牌。
- 验证码、临时状态和一次性 Token。
- 计数、限流、排行榜。
- 集合关系和在线状态。
- 需要原子执行的小型协调逻辑。
- 边界清晰的 Pub/Sub 或 Stream 消息场景。

不适合默认承担：

- 订单、支付、财务流水的唯一永久存储。
- 需要复杂 JOIN 和强关系约束的业务。
- 无法估算容量、没有过期策略的大对象仓库。
- 大规模可靠消息队列的无脑替代品。
- 大文件、图片和视频存储。

## 3. Redis 与 MySQL 如何配合（P0）

典型读取：

```text
请求 -> 查 Redis -> 命中则返回
                 -> 未命中查 MySQL -> 写入 Redis -> 返回
```

典型写入：

```text
请求 -> 更新 MySQL -> 删除 Redis 缓存
```

MySQL 是 Source of Truth，Redis 缓存是可丢失、可重建的派生数据。并非所有 Redis 数据都是缓存，例如会话和限流计数可能只存在 Redis，但必须明确其可丢失后果和高可用策略。

## 4. 版本与发行版

学习应使用仍受维护的现代版本。企业中可能看到：

- Redis Open Source。
- Valkey 等兼容分支。
- AWS ElastiCache、Azure Cache for Redis、阿里云/腾讯云等托管服务。
- Redis Enterprise 或云厂商兼容产品。

它们在模块、集群、命令限制、持久化和运维接口上可能不同。不要仅凭“兼容 Redis 协议”就假设所有命令和故障语义完全一致。

## 5. 安装方式

### Docker

本地学习推荐：

```powershell
docker run --name redis-learning `
  -p 6379:6379 `
  -v redis-learning-data:/data `
  -d redis:7-alpine `
  redis-server --appendonly yes
```

进入 CLI：

```powershell
docker exec -it redis-learning redis-cli
```

### Windows

Redis 官方服务器主要面向 Linux。Windows 开发环境可使用 Docker、WSL2，或企业认可的兼容服务。不要随意下载来源不明的 Windows 二进制包。

### Linux

可以通过官方包、发行版仓库或容器安装。生产环境更推荐托管 Redis 或团队维护的标准化部署方案，不要由单个应用开发者临时搭建无监控单节点。

## 6. 第一次连接（P0）

```powershell
redis-cli -h 127.0.0.1 -p 6379
```

```redis
PING
SET redis-learning:hello "你好 Redis" EX 60
GET redis-learning:hello
TTL redis-learning:hello
DEL redis-learning:hello
```

预期 `PING` 返回 `PONG`。

不要在命令行参数里直接写生产密码。生产连接应使用 TLS、Secret 管理和网络访问控制。

## 7. 数据库编号不是环境隔离（P0）

Redis 单机默认可能提供多个逻辑 DB，通过 `SELECT 1` 切换。但它们：

- 共享同一实例内存、CPU、持久化和故障域。
- Cluster 模式通常只支持 DB 0。
- Key 仍难从名称判断环境和业务。

企业中不要用 DB 0/1/2 代替开发、测试、生产隔离。环境应使用独立实例/集群或至少独立命名空间与权限。

## 8. 基础信息检查

```redis
INFO server
INFO memory
INFO clients
INFO stats
INFO persistence
INFO replication
DBSIZE
TIME
```

`INFO` 很长，应按 section 查询。`DBSIZE` 返回当前库 Key 数量，但不能告诉你每个 Key 占多少内存。

## 9. 延迟与网络

Redis 本身很快，不代表跨地域调用也快。一次命令总耗时包括：

- 应用排队。
- 连接池等待。
- 网络往返。
- Redis 命令执行。
- 响应传输和反序列化。

应用与 Redis 应尽量同地域、低延迟网络访问。大量小命令可通过批量命令、Pipeline 或调整数据模型减少 RTT。

## 10. 本章自检

- [ ] 能解释 Redis 为什么快以及为什么慢命令仍会阻塞。
- [ ] 能区分缓存数据、会话数据和核心持久化事实。
- [ ] 能从 CLI 完成 SET、GET、TTL 和 DEL。
- [ ] 知道逻辑 DB 不能替代环境隔离。
- [ ] 能说明 Redis 故障时业务是否可降级。
