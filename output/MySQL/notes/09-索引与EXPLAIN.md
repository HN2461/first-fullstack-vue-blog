---
title: "MySQL 09：索引与 EXPLAIN"
slug: mysql-09-index-and-explain
summary: "掌握 InnoDB 聚簇索引、联合索引、最左前缀、覆盖索引、索引失效场景和 EXPLAIN 执行计划分析。"
category:
tags: []
status: draft
sortOrder: 90
cover:
---

# 09 索引与 EXPLAIN

## 1. 索引解决什么问题（P0）

没有合适索引时，MySQL 可能逐行扫描整张表。索引类似按特定顺序组织的目录，让数据库快速定位目标行。

InnoDB 常见索引基于 B+Tree，适合：

- 等值查询：`user_id = ?`。
- 范围查询：`created_at >= ?`。
- 前缀匹配：`name LIKE 'MySQL%'`。
- 满足一定条件的排序和分组。
- 连接列查找。

索引不是免费能力：

- 占用磁盘和 Buffer Pool。
- INSERT、UPDATE、DELETE 要维护索引。
- 索引过多会增加写放大和优化器选择成本。

目标是建立少量服务真实高频查询的有效索引。

## 2. InnoDB 聚簇索引（P1）

InnoDB 主键索引的叶子节点保存整行数据，称为聚簇索引。二级索引叶子节点通常保存索引列和主键值；通过二级索引找到主键后，再回主键索引取其他列，称为回表。

由此得到：

- 主键越大，所有二级索引通常也越大。
- 主键趋势递增通常更利于插入局部性。
- 随机且很长的字符串主键可能明显增加存储和写入成本。
- 二级索引若已包含查询所需列，可减少回表。

## 3. 单列索引与联合索引（P0）

查询：

```sql
SELECT id, order_no, total_amount, created_at
FROM orders
WHERE user_id = 10
  AND status = 'paid'
ORDER BY created_at DESC
LIMIT 20;
```

候选索引：

```sql
CREATE INDEX idx_orders_user_status_created
ON orders (user_id, status, created_at);
```

联合索引不是三个单列索引的简单叠加。它按第一个列排序，相同第一个列下再按第二列排序，以此类推。

## 4. 最左前缀原则（P0）

对于 `(user_id, status, created_at)`，通常可有效支持：

```text
user_id
user_id + status
user_id + status + created_at
```

通常不能直接高效支持只按：

```text
status
created_at
status + created_at
```

因为跳过了最左侧 `user_id`。这不是说优化器绝对不可能使用索引，而是不能依赖该索引完成常规有序定位。

## 5. 联合索引列顺序（P0）

常用思路：

1. 先放固定等值匹配并频繁出现的列，如 `tenant_id`、`user_id`。
2. 再放其他等值条件。
3. 范围条件之后的列，通常难以继续用于缩小扫描范围。
4. 同时考虑 ORDER BY、GROUP BY 和覆盖查询。
5. 用真实 SQL、数据分布和 EXPLAIN 验证。

“选择性最高的列永远放最前”不是绝对规则。联合索引是为了完整访问路径服务，必须综合业务查询。

## 6. 范围条件与排序（P1）

索引 `(user_id, created_at, status)` 用于：

```sql
WHERE user_id = ?
  AND created_at >= ?
  AND status = ?
```

在 `created_at` 进入范围扫描后，后面的 `status` 可能无法继续用于索引范围定位，但仍可能通过索引条件下推过滤。若主要查询总是 `user_id + status + 时间范围`，索引 `(user_id, status, created_at)` 往往更合适。

## 7. 覆盖索引（P1）

如果索引已经包含 SELECT 所需列，MySQL 可以直接从索引返回结果，减少回表：

```sql
CREATE INDEX idx_orders_user_created_amount
ON orders (user_id, created_at, total_amount);

SELECT created_at, total_amount
FROM orders
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 20;
```

EXPLAIN 的 Extra 中常见 `Using index`。不要为了覆盖所有接口而建立超宽索引；宽索引会占空间并降低写入效率。

## 8. 哪些写法容易使索引失效（P0）

### 对列做函数

```sql
WHERE DATE(created_at) = '2026-07-26'
```

改为原列范围。

### 隐式类型转换

若 `phone` 是 VARCHAR，却写：

```sql
WHERE phone = 13800138000
```

应传字符串，并确保连接列两侧类型完全一致。

### 前导通配符

```sql
WHERE title LIKE '%MySQL%'
```

普通 B+Tree 索引通常不能用于前缀定位。

### 不满足最左前缀

索引 `(tenant_id, email)` 不能当作纯 `email` 索引普遍使用。

### 低选择性条件

`is_deleted` 只有 0/1，单独建立索引可能收益很低。但作为联合索引的一部分是否有用，要看查询和数据分布。

### 大范围返回

即使有索引，查询命中表中大部分行时，全表扫描可能更便宜。优化器不使用索引不一定是错误。

## 9. 索引设计常见错误

- 每个字段都建单列索引。
- 重复索引，例如已有 `(a, b)` 又保留同等用途的 `(a)`，未评估必要性。
- 外键列没有索引。
- 只看 WHERE，不看 ORDER BY 和 SELECT 字段。
- 为一个低频后台查询建立多个昂贵索引。
- 在大文本上建立不合理的长前缀索引。
- 结构变更后不清理无用索引。

查看索引：

```sql
SHOW INDEX FROM orders;
```

## 10. EXPLAIN 基础（P0）

```sql
EXPLAIN
SELECT id, order_no, total_amount
FROM orders
WHERE user_id = 10
  AND status = 'paid'
ORDER BY created_at DESC
LIMIT 20;
```

重点字段：

| 字段 | 关注点 |
| --- | --- |
| `table` | 当前访问的表或派生结果 |
| `type` | 访问方式 |
| `possible_keys` | 可能使用的索引 |
| `key` | 实际选择的索引 |
| `key_len` | 使用到索引键的大致长度，可辅助判断联合索引使用范围 |
| `ref` | 与索引比较的值或列 |
| `rows` | 预计扫描行数，不是精确结果 |
| `filtered` | 条件过滤后预计保留百分比 |
| `Extra` | 排序、临时表、覆盖索引等额外信息 |

## 11. type 访问类型（P0）

大致从优到差的常见类型：

```text
const -> eq_ref -> ref -> range -> index -> ALL
```

- `const`：通过主键或唯一键定位单行。
- `eq_ref`：JOIN 中通过唯一键每次匹配一行。
- `ref`：普通索引等值匹配。
- `range`：索引范围扫描。
- `index`：扫描整个索引。
- `ALL`：全表扫描。

不能只追求某种 type。小表全表扫描很合理；报表查询也可能必须扫描大量数据。关键是扫描量与需求是否匹配。

## 12. Extra 常见信息（P0）

- `Using where`：存储引擎返回后仍需条件过滤，很常见，不等于坏。
- `Using index`：使用覆盖索引。
- `Using index condition`：索引条件下推。
- `Using filesort`：需要额外排序，不一定真的写磁盘，也不一定必须消除。
- `Using temporary`：可能使用临时表，复杂分组/排序需关注。

不要见到 `Using filesort` 就盲目加索引。先看结果集大小、频率、耗时和能否让联合索引同时满足过滤与排序。

## 13. EXPLAIN ANALYZE（P1）

MySQL 8 可执行查询并返回实际运行统计：

```sql
EXPLAIN ANALYZE
SELECT ...;
```

它能看到估算与实际行数、循环次数、耗时差异。注意：它会真实执行查询。对慢查询或大查询在生产使用前必须评估影响；对写语句更应谨慎，按目标版本行为和安全环境验证。

## 14. 优化步骤

1. 获取完整 SQL、参数、耗时、频率和返回行数。
2. 确认结果正确，去掉不必要字段和 JOIN。
3. 查看表结构、现有索引和数据量。
4. 使用 EXPLAIN / EXPLAIN ANALYZE。
5. 判断扫描行数、连接顺序、排序和临时表。
6. 修改 SQL 或添加最小必要索引。
7. 在接近生产的数据分布上对比。
8. 观察写入成本和其他查询回归。

## 15. MongoDB 对照：compound index 与 EXPLAIN（P0）

MongoDB 和 MySQL 都要求联合索引顺序贴合真实查询，但判断依据不完全相同：

| MongoDB | MySQL |
| --- | --- |
| `{ tenantId: 1, status: 1, createdAt: -1 }` | `(tenant_id, status, created_at)` |
| `explain('executionStats')` | `EXPLAIN` / `EXPLAIN ANALYZE` |
| `IXSCAN` | `ref`、`range` 等访问类型 |
| `COLLSCAN` | `ALL` 全表扫描 |
| projection 覆盖查询 | 覆盖索引，Extra 常见 `Using index` |

不要把“索引存在”或“执行计划显示使用索引”当作性能结论。两种数据库都需要结合实际参数、扫描行数、返回行数和耗时判断；MySQL 还要额外留意回表、排序临时表和 JOIN 顺序。

## 16. 本章自检

- [ ] 能解释聚簇索引、二级索引和回表。
- [ ] 能用最左前缀判断联合索引支持哪些查询。
- [ ] 能根据等值、范围、排序设计候选索引。
- [ ] 能读懂 EXPLAIN 的 key、rows、type 和 Extra。
- [ ] 不把“使用索引”误认为“查询一定快”。
