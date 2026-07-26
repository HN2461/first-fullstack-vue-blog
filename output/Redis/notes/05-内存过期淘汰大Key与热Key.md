---
title: "Redis 05：内存、过期、淘汰、大 Key 与热 Key"
slug: redis-05-memory-expiry-bigkey-hotkey
summary: "掌握 Redis 内存组成、过期与淘汰机制、大 Key 和热 Key 的识别治理，以及 Fork 与容量规划。"
category:
tags: []
status: draft
sortOrder: 50
cover:
---

# 05 内存、过期、淘汰、大 Key 与热 Key

## 1. Redis 容量首先是内存问题（P0）

估算不能只计算业务字符串长度。Redis 内存还包含：

- Key 和 Value 对象开销。
- 数据结构内部编码和指针。
- 过期字典。
- 客户端输出缓冲区。
- 复制缓冲区、AOF 缓冲区。
- 内存碎片。
- Fork 持久化时的 Copy-on-Write 峰值。

查看：

```redis
INFO memory
MEMORY STATS
MEMORY USAGE redis-learning:some-key SAMPLES 5
```

重点关注 `used_memory`、`used_memory_rss`、`mem_fragmentation_ratio`、`maxmemory` 和淘汰计数，但任何单一比率都不能脱离系统分配器、容器和工作负载下结论。

## 2. 过期删除机制（P1）

Redis 不会为每个 Key 启动一个定时器。常见机制组合：

- 惰性删除：访问 Key 时发现已过期再删除。
- 定期删除：周期性抽样检查带 TTL 的 Key。

因此过期时间到达与内存实际释放之间可能有短暂延迟。业务应把过期 Key 当作不可见，不依赖“恰好某毫秒收到删除事件”。

## 3. 淘汰策略（P0）

当内存达到 `maxmemory`，Redis 根据配置决定：

- `noeviction`：不淘汰，写命令返回错误。
- `allkeys-lru` / `allkeys-lfu`：从所有 Key 中按近似 LRU/LFU 淘汰。
- `volatile-lru` / `volatile-lfu`：只从设置 TTL 的 Key 中淘汰。
- `allkeys-random` / `volatile-random`：随机淘汰。
- `volatile-ttl`：优先淘汰剩余 TTL 较短的 Key。

现代版本具体策略列表以目标文档为准。

选择原则：

- 纯缓存实例常评估 `allkeys-lfu` 或 `allkeys-lru`。
- 混合持久/临时数据的实例风险更高，最好拆实例而不是靠策略区分。
- 不能接受任意数据被淘汰时使用 `noeviction`，应用必须处理写失败和容量告警。

淘汰不是正常容量管理方案。持续淘汰说明容量、TTL 或模型需要调整。

## 4. 大 Key（P0）

大 Key 可能是：

- 数 MB 的 String。
- 包含数十万 field 的 Hash。
- 数百万成员的 Set/ZSet/List。

影响：

- 单次读取/删除阻塞更久。
- 网络响应巨大。
- 复制和持久化压力增大。
- Cluster 迁移 Slot 困难。
- 客户端内存和事件循环被大响应占用。

没有适用于所有系统的统一“大”阈值。应根据延迟 SLO、网络、数据结构和命令复杂度制定标准。常见实践会对 String 的 KB/MB 和集合元素数量分别设告警。

## 5. 发现大 Key

测试/受控环境可使用：

```powershell
redis-cli --bigkeys
redis-cli --memkeys
```

也可通过 SCAN 抽样后调用 `MEMORY USAGE`、`HLEN`、`LLEN`、`SCARD`、`ZCARD`。扫描本身有成本，生产执行需限速和评估。

不要直接对未知大对象执行 `HGETALL`、`SMEMBERS` 或 `LRANGE 0 -1`。

## 6. 拆分大 Key

常见方式：

- 按租户、日期、业务 ID 分片。
- 最近列表限定长度并归档历史。
- 大 Hash 按 ID 范围拆分。
- 大 ZSet 按周期拆排行榜。
- 只缓存必要字段，压缩但避免高 CPU 序列化。
- 删除大 Key 使用 UNLINK，并控制重建流量。

拆 Key 会增加多 Key 查询和一致性复杂度，需要以访问模式驱动。

## 7. 热 Key（P0）

热 Key 是请求量集中到少数 Key，可能导致：

- 单节点 CPU 或网络带宽饱和。
- Cluster 中一个分片过载，其他分片空闲。
- Key 失效后大量请求打到 MySQL。
- 单个大响应放大带宽问题。

检测来源：应用指标、代理/云服务热 Key 分析、`redis-cli --hotkeys`（需合适淘汰策略/版本）、命令统计和采样日志。

处理方式：

- 应用进程本地短 TTL 二级缓存。
- 对可拆分计数做分片后聚合。
- 热点永不过期 + 逻辑过期 + 后台刷新。
- 请求合并，只允许一个请求回源。
- 静态内容交给 CDN。
- 对大对象拆分或减少响应字段。

复制多个相同 Key 到随机后缀可以分散读流量，但会增加一致性和更新成本，只能在明确场景采用。

## 8. 内存碎片与 Fork 峰值（P1）

`used_memory_rss` 明显高于 `used_memory` 可能来自碎片或释放后操作系统未立即回收。RDB/AOF 重写 Fork 时，写入会触发 Copy-on-Write，内存峰值可能上升。

容器内存上限如果只按 `used_memory` 配置，持久化或重写期间可能被 OOM Kill。容量规划需给操作系统、复制、缓冲区和 COW 留余量。

## 9. 无边界增长审查

每个 Redis 写入都要回答：

- Key 会创建多少个？
- 单 Key 元素会增长到多少？
- TTL 是多少？
- 谁负责删除或裁剪？
- 故障后会不会停止清理？
- 是否能从其他数据源重建？

这比记住某个内存参数更重要。

## 10. 本章自检

- [ ] 能解释过期和淘汰不是一回事。
- [ ] 能根据实例职责选择淘汰策略。
- [ ] 能列出大 Key 对延迟、网络、复制和集群的影响。
- [ ] 能提出热 Key 的检测和至少三种治理方法。
- [ ] 容量规划会考虑 COW 和非业务内存。
