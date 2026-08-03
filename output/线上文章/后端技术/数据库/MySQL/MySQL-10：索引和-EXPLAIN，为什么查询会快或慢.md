---
title: "MySQL 10：索引和 EXPLAIN，为什么查询会快或慢"
slug: "mysql-10-index-explain"
summary: "先用书籍目录建立索引直觉，再从真实查询出发学习主键、普通索引、联合索引、最左前缀、SHOW INDEX、EXPLAIN 和常见失效写法；不把优化变成背口诀。"
category: "MySQL"
categoryPath:
  - "后端技术"
  - "数据库"
  - "MySQL"
tags:
  - "MySQL"
  - "索引"
  - "数据库性能"
status: "published"
sortOrder: 100
cover: ""
originalId: "6a706a61360397398ac2d071"
originalSlug: "mysql-10-index-explain"
originalStatus: "published"
publishedAt: "2026-08-03T10:16:37.195Z"
updatedAt: "2026-08-03T10:16:37.234Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 10 索引和 EXPLAIN，为什么查询会快或慢

## 1. 本节目标：不是背“加索引”，而是知道为什么加、加给谁

前面已经会写列表查询：找所有正常笔记、按时间倒序、每页取 10 条。数据只有十几行时，MySQL 即使一行行看也几乎感觉不到慢；数据变成十万、百万行后，一条查询怎样找到目标就开始重要。

本章要建立四个能力：

1. 知道索引是额外维护的查找目录，不是数据本身。
2. 能从一条真实查询推导候选索引，而不是给每列乱建。
3. 能理解联合索引中列顺序为什么有影响。
4. 能用 `EXPLAIN` 看 MySQL 的查询计划，并且不会把某一个字段当成绝对好坏判断。

你不需要学习 B+ 树源码，也不要在只有几条练习数据的表上执着于“必须看到索引被用上”。小表全表扫描可能反而是合理选择。

## 2. 索引到底是什么：目录不是书的正文

没有目录的一本厚书，要找“事务”只能从第一页一路翻。目录把关键字和位置整理好，你先定位再翻到附近页数。

数据库索引也是一份由 MySQL 维护的有序目录。以 `id` 为例，索引能帮助 MySQL更快定位“编号为 103”的笔记，而不必在大量记录中逐行比较。

```mermaid
flowchart LR
  A[查询：id = 103] --> B{有可用索引吗？}
  B -->|没有| C[从数据中逐行比较]
  B -->|有| D[先查索引目录]
  D --> E[定位到可能的数据位置]
  E --> F[取出需要的记录]
```

索引能加快部分读取，但它有三种成本：

| 成本 | 为什么会发生 |
| --- | --- |
| 占磁盘空间 | 目录本身也要存下来 |
| 写入变慢一些 | 插入、更新、删除时，目录也要同步维护 |
| 设计和维护成本 | 多余或重复索引会让后人不清楚谁在服务什么查询 |

所以“每列都建一个索引”不是优化，而是把未来写入和维护成本先埋进去。

## 3. 先从查询开始，而不是从字段开始

一个可靠习惯是：先写清楚高频、重要的查询，再设计索引。例如文章/笔记列表常见需求是：

```sql
SELECT id, title, created_at
FROM learning_notes
WHERE status = 'active'
  AND deleted_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 10;
```

用人话拆成：

| 查询部分 | 它在做什么 |
| --- | --- |
| `status = 'active'` | 过滤正常笔记 |
| `deleted_at IS NULL` | 排除软删除笔记 |
| `ORDER BY created_at DESC, id DESC` | 按时间倒序，时间相同时按 id 倒序 |
| `LIMIT 10` | 只取首页 10 条 |

索引设计要服务这段真实访问路径，而不是因为 `status`、`created_at` 看起来常用就各建一个独立索引。

## 4. 主键：第一条已经自动拥有的索引

第 05 章写过：

```sql
PRIMARY KEY (id)
```

主键约束会创建主键索引，所以按笔记编号查询通常有明确的访问路径：

```sql
SELECT id, title, status
FROM learning_notes
WHERE id = 1;
```

这里的 `id = 1` 只是演示。真实项目中，详情、编辑、删除常通过主键找一条记录，因此主键索引是最基础的索引之一。

不要由此得出“任何 id 查询都一定极快”的机械结论。表大小、读取列、缓存、并发、服务器状态都会影响耗时；但从结构上看，主键给了 MySQL 一条很清楚的定位路线。

## 5. 单列索引和联合索引：目录可以有多个层级

### 5.1 单列索引适合一个字段就能大量缩小范围的查询

例如你经常根据 `slug` 查一篇文章，而 slug 又必须唯一：

```sql
UNIQUE KEY uk_articles_slug (slug)
```

唯一索引既保护“不重复”，也服务按 slug 查找。这是结构规则和查询需求一致的好例子。

对 `learning_notes` 来说，`status` 只有 `draft`、`active`、`archived` 等少数值。单独给 `status` 建索引不一定有明显收益，因为可能一大半笔记都还是 `active`，筛完范围仍然很大。这个性质常被称为“选择性低”，人话就是“这个字段不够会区分人”。

### 5.2 联合索引适合经常一起出现的条件和排序

对于上一节的列表查询，一个候选联合索引是：

```sql
CREATE INDEX idx_learning_notes_status_created_id
  ON learning_notes (status, created_at, id);
```

索引列顺序不是装饰。可以把它看作先按第一列整理，再在每个第一列组中按第二列整理，最后按第三列整理：

```text
status = active
  ├── created_at 从早到晚
  │     ├── id 从小到大
  └── ...

status = draft
  ├── created_at 从早到晚
  └── ...
```

查询已经固定 `status = 'active'`，MySQL 就有机会在 active 这部分中按 `created_at`、`id` 的顺序取前几条，减少额外处理。是否最终使用还由优化器根据数据量和统计信息决定。

### 5.3 最左前缀：联合目录要从第一层开始找

把 `(status, created_at, id)` 想成“先状态、再时间、再编号”的多级目录。它最容易服务从左边开始的查询条件：

| 查询条件 | 与该索引的关系 |
| --- | --- |
| `WHERE status = 'active'` | 能使用第一层 |
| `WHERE status = 'active' AND created_at >= ...` | 能继续使用前两层 |
| `WHERE status = 'active' AND created_at = ... AND id = ...` | 三层都匹配 |
| `WHERE created_at >= ...` | 跳过最左的 status，通常不能像从目录首页查起那样有效利用 |

“最左前缀”不是让你死背规则，而是提醒你：联合索引有顺序。设计前应观察查询最常从什么条件开始缩小范围。

### 5.4 分类列表的另一条真实查询

用户点进“数据库”分类后，常见查询变成：

```sql
SELECT id, title, created_at
FROM learning_notes
WHERE category_id = 1
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 10;
```

它和“全站正常笔记列表”不是同一条访问路径。一个候选索引是：

```sql
CREATE INDEX idx_learning_notes_category_status_created_id
  ON learning_notes (category_id, status, created_at, id);
```

先固定分类，再固定状态，然后按时间和编号取前几条。这是根据查询形状得出的，不是“多列看起来厉害就多写几列”。

`deleted_at IS NULL` 是否要放进索引，需要看真实数据分布、查询频率和数据库版本能力，不能脱离数据一概而论。小白阶段先把最常用、最稳定的等值条件和排序字段串起来。

## 6. 创建前和创建后都要检查：别重复建索引

先查看已有索引：

```sql
SHOW INDEX FROM learning_notes;
```

结果中最值得先看的列：

| 结果列 | 怎么理解 |
| --- | --- |
| `Key_name` | 索引名字，例如 `PRIMARY` 或你创建的 `idx_...` |
| `Column_name` | 索引包含哪个字段 |
| `Seq_in_index` | 字段在联合索引中的第几位，1 是最左边 |
| `Non_unique` | 0 表示唯一索引，1 表示允许重复 |
| `Cardinality` | MySQL 对不同值数量的估计，属于参考而不是绝对真值 |

联合索引会显示多行，但相同 `Key_name` 的多行合在一起才是一条索引。例如 `status` 行 `Seq_in_index = 1`、`created_at` 行为 2、`id` 行为 3，说明索引顺序是 `(status, created_at, id)`。

在练习库创建上一节的索引后，再次执行 `SHOW INDEX`：

```sql
CREATE INDEX idx_learning_notes_status_created_id
  ON learning_notes (status, created_at, id);

SHOW INDEX FROM learning_notes;
```

如果创建时提示同名索引已存在，不要随手换一个名字再建。先看已有索引是否已经覆盖同一查询，避免留下两个几乎相同的目录。

## 7. EXPLAIN：不执行查询结果，先看 MySQL 准备怎样查

为一条 SELECT 前面加上 `EXPLAIN`：

```sql
EXPLAIN
SELECT id, title, created_at
FROM learning_notes
WHERE status = 'active'
ORDER BY created_at DESC, id DESC
LIMIT 10;
```

`EXPLAIN` 返回的是**查询计划的估计信息**，不是查询结果本身。它告诉你 MySQL 考虑或选择了哪些索引、估计会看多少行、是否需要额外排序等。

初学时优先看这几列：

| EXPLAIN 列 | 初学者怎样看 |
| --- | --- |
| `table` | 当前这一步正在访问哪张表 |
| `possible_keys` | 从结构上看，哪些索引可能适用 |
| `key` | 优化器最终选择了哪个索引；为 NULL 表示没选索引 |
| `key_len` | 实际用了索引的多少部分，先作为辅助信息 |
| `rows` | 估计要检查多少行，不是精确计数 |
| `type` | 访问方式；`ALL` 通常表示扫描全部行，但不自动等于错误 |
| `Extra` | 额外操作提示，如排序或临时表，需结合 SQL 判断 |

### 小表为什么可能不使用你刚建的索引

学习表只有 4、10、50 行时，顺着数据扫一遍非常便宜。MySQL 可能认为“走索引再回表”反而不划算，于是 `key` 仍为 NULL。不要为了让练习截图好看，强迫它使用索引或盲目复制几十万行假数据。

正确的学习目标是：你能说明“这条索引服务哪条查询”，并能读懂 `EXPLAIN` 表达的选择。真实性能优化要在接近真实的数据量、数据分布和负载下测量。

## 8. 怎样判断计划值得关注：按问题逐项问

看到 `EXPLAIN` 后，按下面顺序检查：

1. 这条 SQL 真的是高频或慢查询吗？低频后台任务不一定值得复杂优化。
2. `WHERE`、`JOIN`、`ORDER BY` 分别在做什么？有没有可以缩小范围的条件？
3. 已有索引的列顺序是否从查询常用条件开始？
4. `possible_keys` 和 `key` 是否符合你的预期？若不符合，数据很小或选择性低也可能是合理原因。
5. `rows` 是否随数据增大而明显太大？这是估算值，要结合实际观察。
6. `Extra` 是否出现与查询目标不匹配的额外排序、临时表等现象？不要只看到某个词就恐慌。

MySQL 8 中还可以使用 `EXPLAIN ANALYZE` 获取实际执行统计，但它会**真正执行查询**，只适合确认这条 SELECT 没有副作用且你理解影响时使用。初学阶段优先用普通 `EXPLAIN` 建立观察习惯。

## 9. 常见让普通索引难以发挥作用的写法

### 9.1 在被索引列外面套函数

想查询 2026-08-03 这一天创建的笔记，不建议先这样写：

```sql
-- 语义正确，但常会让 created_at 上的普通索引难以直接按范围定位
WHERE DATE(created_at) = '2026-08-03'
```

更容易利用时间范围的写法：

```sql
WHERE created_at >= '2026-08-03 00:00:00'
  AND created_at < '2026-08-04 00:00:00'
```

第二种写法还避免了“23:59:59.999”边界遗漏问题。它表达的是从当天零点开始，到次日零点之前结束。

### 9.2 以 `%` 开头的包含查询

```sql
WHERE title LIKE '%MySQL%'
```

它要求匹配出现在任意位置的文字。普通 B-tree 索引更擅长从开头定位，如 `LIKE 'MySQL%'`；前面有 `%` 时，MySQL 通常无法像查有序目录那样确定起点。

这不代表功能不能做。文章搜索需求可能需要全文索引、搜索引擎或其他方案。先不要为了“使用索引”把用户需要的“包含搜索”改成不符合产品的功能。

### 9.3 隐式类型转换和不清楚的条件

若 `id` 是整数，查询时就按整数传值；若字段是日期时间，就使用可识别的日期时间格式。把不同类型混在一起比较，可能导致转换、结果误解或索引无法按预期工作。

在后端中，最重要的是使用数据库驱动提供的参数化查询，不要拼接用户输入。参数化不仅有助于类型处理，更是防 SQL 注入的基本安全要求。

## 10. 索引设计的安全边界

| 不要这样做 | 更好的做法 |
| --- | --- |
| 看见某字段就马上建单列索引 | 先写出真实高频查询 |
| 复制别人的联合索引列顺序 | 对照自己的 WHERE、JOIN、ORDER BY |
| 为小表的 EXPLAIN 没走索引而不断加索引 | 先理解优化器和数据量，不为截图优化 |
| 因为 `type = ALL` 就立即认定有 Bug | 判断扫描范围、数据规模、返回比例和查询频率 |
| 把索引当成唯一性能手段 | 同时关注返回列、分页方式、SQL 是否需要这么多数据 |

索引是一种针对读取路径的设计。真正的生产优化还包括慢查询记录、数据量、缓存、硬件、并发、连接池和业务访问模式；本课程先把最核心的一层打牢。

## 11. 本节练习

1. 写出“首页正常笔记列表”和“某分类下正常笔记列表”两条查询，用自己的话标出每一条的过滤字段、排序字段和数量限制。
2. 分别解释为什么 `(status, created_at, id)` 与 `(category_id, status, created_at, id)` 服务的查询不同。
3. 运行 `SHOW INDEX FROM learning_notes;`，找出主键索引和你创建的联合索引，写出每列的顺序。
4. 对一条列表 SQL 运行 `EXPLAIN`，记录 `possible_keys`、`key`、`rows`、`Extra`。如果没有选索引，先判断练习表是否太小，而不是立刻继续建索引。
5. 把 `DATE(created_at) = '2026-08-03'` 改写成半开区间时间范围，并解释为什么结束时间使用次日零点。
6. 用一句话解释：为什么索引不是越多越好？

下一章会学习事务和锁。索引除了加速查询，还会影响并发修改时 MySQL 需要锁定的范围，因此这两个主题会在后面再次相遇。
