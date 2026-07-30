---
title: "Redis 15：MySQL + Redis 企业知识库案例"
slug: redis-15-mysql-enterprise-case
summary: "通过文章缓存、Session、搜索限流、浏览数缓冲、热门榜单和 Outbox 串联 MySQL 与 Redis 企业协作方案。"
category:
tags: []
status: draft
sortOrder: 150
cover:
---

# 15 MySQL + Redis 企业知识库案例

## 1. 场景

为个人知识库/技术博客增加 Redis：

- 公开文章详情缓存。
- 登录 Session。
- 搜索接口限流。
- 文章浏览数缓冲与热门排行榜。
- 后台修改文章后可靠失效缓存。

MySQL 继续保存用户、文章、分类、标签、评论和最终浏览数。Redis 不承载文章正文的唯一副本。

## 2. Key 设计

```text
blog:prod:article:detail:v1:<articleId>              String, TTL 10~12 分钟
blog:prod:article:slug-to-id:v1:<slug>               String, TTL 10~12 分钟
blog:prod:auth:session:<sessionHash>                  Hash, TTL 30 分钟
blog:prod:rate-limit:search:user:<userId>:<minute>    String, TTL 2 分钟
blog:prod:article:view-buffer:<yyyyMMdd>              Hash, TTL 3 天
blog:prod:rank:article:daily:<yyyyMMdd>               ZSet, TTL 8 天
blog:prod:cache-invalidation:article                  Stream, 限长并监控
```

列表缓存组合过多，初期不缓存任意筛选列表；先缓存详情和少数固定首页榜单。

## 3. 公开文章读取（P0）

```text
1. 通过 slug-to-id 缓存找 articleId。
2. 查文章详情缓存。
3. 命中直接返回。
4. 未命中查询 MySQL：status=published AND deleted_at IS NULL。
5. 缓存 DTO，TTL 加抖动。
6. 数据不存在时写短 TTL 的 NOT_FOUND。
```

DTO 只缓存公开字段，不能把后台备注、审核信息、作者邮箱或权限字段一起返回。

## 4. 后台更新文章（P0）

MySQL 事务：

1. 按旧状态条件更新文章和 `updated_at/version`。
2. 写入 Outbox `article.updated`，包含 articleId、旧 slug、新 slug、version。
3. COMMIT。

提交后立即尝试删除新旧 slug 映射和详情缓存。Outbox 发布器再投递失效事件，消费者重复删除保证最终收敛。缓存仍保留有限 TTL 兜底。

## 5. 发布与下架（P0）

发布：

```sql
UPDATE articles
SET status = 'published', published_at = NOW(3), version = version + 1
WHERE id = ? AND status = 'draft';
```

下架后必须优先让公开接口不再返回文章。对于权限/内容下架这类敏感变更：

- 删除缓存失败时可短暂绕过详情缓存，或使用全局内容版本。
- 公开读取缓存值中带 status/version 并做必要校验。
- TTL 不能长到不可接受。

一致性要求比普通标题更新更高。

## 6. 浏览数缓冲（P1）

每次阅读直接 UPDATE MySQL 会制造高频写。可在 Redis 聚合：

```redis
HINCRBY blog:prod:article:view-buffer:20260726 1001 1
ZINCRBY blog:prod:rank:article:daily:20260726 1 1001
```

后台任务按批次读取增量，使用唯一批次/原子转移避免重复或丢失，再写 MySQL 浏览流水或增量字段。

关键问题：

- 任务读取后写库前崩溃怎么办？
- 重试是否重复累计？
- Redis 故障允许丢多少浏览数？
- Bot/重复刷新如何过滤？
- 排行榜与最终浏览数是否允许短暂差异？

浏览数通常允许近似，但必须在产品语义中明确。

## 7. 搜索限流（P0）

已登录用户按 userId，未登录用户按 IP 哈希和设备信号限流。Lua 固定窗口示例：每分钟 30 次。

Redis 不可用时可：

- 公共搜索 Fail-open，但启用网关/进程本地保守限流。
- 登录、验证码等安全接口 Fail-closed 或严格降级。

不要使用客户端传来的 userId 作为限流身份，必须来自认证上下文。

## 8. Session 与 RBAC（P0）

Session 保存用户 ID、会话版本、设备与到期，不把完整菜单和权限永久缓存。角色权限更新时：

- 用户表/角色表 version 增加。
- 清理相关 Session 或使缓存版本失效。
- 高风险管理接口可回 MySQL/短 TTL权限缓存复核。

Redis 故障时不能为了可用性跳过权限校验。

## 9. 热门文章榜（P1）

日榜使用 ZSet，定时生成周榜：

```redis
ZUNIONSTORE blog:prod:rank:article:week:2026-W30 7 day-key-1 day-key-2 day-key-3 day-key-4 day-key-5 day-key-6 day-key-7
```

生产 Key 替换成真实日期。生成后设置 TTL，只保留需要的历史周期。文章下架时列表展示仍需通过 MySQL/详情缓存状态过滤，不能只相信榜单 member。

## 10. 故障场景表

| 故障 | 处理 |
| --- | --- |
| 详情缓存读取超时 | 短超时后限流回源 MySQL |
| 热 Key 同时失效 | Singleflight/重建锁，允许返回短期旧值 |
| MySQL 更新成功、DEL 失败 | Outbox 重试 + TTL 收敛 |
| Redis 全空 | 灰度流量、热点预热、限制回源并发 |
| 浏览缓冲丢失 | 接受指标误差或使用更可靠事件链路 |
| Session Redis 不可用 | 敏感操作拒绝，恢复后重新认证 |
| 排行榜不可用 | 隐藏榜单或返回最近持久快照 |

## 11. 上线步骤

1. 先上线 Redis 连接和健康指标，不启用业务缓存。
2. 灰度启用文章详情缓存，观察命中率、回源和 P99。
3. 上线更新后失效与 Outbox 重试。
4. 演练 Redis 超时、空缓存和故障切换。
5. 再上线限流、Session、排行榜等独立场景。
6. 每个场景设置独立前缀、指标、TTL、容量和降级开关。

不要一次把所有功能绑到 Redis 后直接全量发布。

## 12. Code Review 清单

- [ ] Redis 数据的权威来源和可丢失后果明确。
- [ ] Key、Value schema、TTL、最大规模明确。
- [ ] 缓存更新/删除顺序和失败重试明确。
- [ ] Redis 超时不会无限拖住 HTTP 请求。
- [ ] 热 Key 未命中有回源保护。
- [ ] 限流、锁、幂等使用原子命令/Lua。
- [ ] 敏感 Key/Value/日志已脱敏。
- [ ] Pipeline、集合、Stream 都有批次/长度上限。
- [ ] MySQL 唯一约束和事务未被 Redis 取代。
- [ ] 有命中率、延迟、内存、错误和业务降级指标。
