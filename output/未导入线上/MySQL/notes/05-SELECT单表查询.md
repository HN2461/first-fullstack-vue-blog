---
title: "MySQL 05：SELECT 单表查询"
slug: mysql-05-select
summary: "系统掌握过滤、排序、分页、去重、表达式、函数、聚合和稳定游标分页等后端接口高频查询能力。"
category:
tags: []
status: draft
sortOrder: 50
cover:
---

# 05 SELECT 单表查询

## 1. SELECT 的基本结构（P0）

```sql
SELECT DISTINCT
  column_list
FROM table_name
WHERE row_condition
GROUP BY grouping_columns
HAVING group_condition
ORDER BY sorting_columns
LIMIT offset, page_size;
```

书写顺序不等于逻辑处理顺序。简化理解：

```text
FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT
```

这能解释为什么某些 SELECT 别名不能直接在 WHERE 使用：WHERE 处理时别名尚未产生。

## 2. 明确选择字段（P0）

```sql
SELECT id, email, username, status
FROM users;
```

业务代码避免 `SELECT *`：

- 读取了不需要的数据，增加网络和内存开销。
- 表新增大字段后接口可能突然变慢。
- 容易意外返回密码哈希等敏感列。
- 影响覆盖索引的使用机会。
- 字段契约不清晰。

临时排查时 `SELECT *` 可以使用，生产代码应列出字段。

## 3. WHERE 条件（P0）

```sql
SELECT id, name, price, stock
FROM products
WHERE status = 'on_sale'
  AND price >= 100
  AND stock > 0;
```

常见运算符：

```sql
=  <>  !=  >  >=  <  <=
AND  OR  NOT
BETWEEN ... AND ...
IN (...)
LIKE
IS NULL  IS NOT NULL
```

### AND 与 OR 优先级

```sql
WHERE status = 'on_sale'
  AND (category_id = 1 OR category_id = 2)
```

同时出现时主动加括号，不要依赖读者记忆优先级。

### IN

```sql
WHERE status IN ('pending', 'paid', 'shipped')
```

比多个 OR 更清晰。后端接收数组条件时要处理空数组，不能直接生成 `IN ()`。

### BETWEEN

```sql
WHERE price BETWEEN 100 AND 500
```

两端都包含。时间范围更推荐左闭右开：

```sql
WHERE created_at >= '2026-07-01 00:00:00'
  AND created_at <  '2026-08-01 00:00:00'
```

这样不依赖字段是否有毫秒/微秒，也便于按月拼接连续区间。

## 4. 模糊查询 LIKE（P0）

```sql
WHERE name LIKE 'MySQL%'
```

- `'MySQL%'`：前缀匹配，某些情况下可使用 B+Tree 索引。
- `'%MySQL'`：后缀匹配，普通索引通常难以利用。
- `'%MySQL%'`：包含匹配，普通索引通常无法高效定位。

大量文本搜索不要长期依赖 `%关键词%`。可评估 MySQL FULLTEXT 或 Elasticsearch / OpenSearch 等搜索系统。

用户输入中 `%` 和 `_` 本身是通配符。若产品语义要求字面匹配，需要正确转义。

## 5. 排序（P0）

```sql
SELECT id, order_no, total_amount, created_at
FROM orders
WHERE user_id = 10
ORDER BY created_at DESC, id DESC;
```

稳定分页需要确定性排序。只按 `created_at` 排序时，多行时间相同会导致页间顺序不稳定，因此常追加唯一主键。

NULL 的排序位置和数据库行为有关；需要固定业务顺序时使用表达式明确控制：

```sql
ORDER BY paid_at IS NULL, paid_at DESC
```

## 6. LIMIT 分页（P0）

```sql
SELECT id, title, created_at
FROM articles
WHERE status = 'published'
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 40;
```

表示跳过 40 条，取 20 条。

深分页问题：`OFFSET 100000` 仍需扫描并丢弃大量记录。大数据列表可使用游标分页（Keyset Pagination）：

```sql
SELECT id, title, created_at
FROM articles
WHERE status = 'published'
  AND (
    created_at < '2026-07-20 10:00:00.000'
    OR (created_at = '2026-07-20 10:00:00.000' AND id < 9000)
  )
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

配合索引 `(status, created_at, id)`。游标分页适合“加载更多”和持续滚动；传统页码跳转仍常用 OFFSET，需要根据产品需求选择。

## 7. DISTINCT 去重（P0）

```sql
SELECT DISTINCT status
FROM orders;
```

`DISTINCT` 作用于所选列组合：

```sql
SELECT DISTINCT user_id, status
FROM orders;
```

不要用 DISTINCT 掩盖错误 JOIN 产生的重复行。先确认重复是否符合关系语义。

## 8. 别名与表达式（P0）

```sql
SELECT
  id,
  price,
  stock,
  price * stock AS inventory_value
FROM products;
```

后端可以直接读取 `inventory_value`。别名应使用稳定英文名，作为查询结果契约的一部分。

## 9. 常用函数（P1）

字符串：

```sql
SELECT CONCAT(username, ' <', email, '>') AS display_name;
SELECT LOWER(email), UPPER(product_code), CHAR_LENGTH(username);
SELECT TRIM(username);
```

数值：

```sql
SELECT ROUND(total_amount, 2), CEIL(score), FLOOR(score);
```

日期：

```sql
SELECT NOW(), CURRENT_DATE(), DATE(created_at);
SELECT DATE_ADD(created_at, INTERVAL 7 DAY);
SELECT TIMESTAMPDIFF(DAY, created_at, NOW());
```

NULL 处理：

```sql
SELECT COALESCE(nickname, username) AS display_name
FROM users;
```

对索引列套函数可能使普通索引无法用于范围定位。错误示例：

```sql
WHERE DATE(created_at) = '2026-07-26'
```

推荐改为：

```sql
WHERE created_at >= '2026-07-26 00:00:00'
  AND created_at <  '2026-07-27 00:00:00'
```

## 10. CASE 条件表达式（P1）

```sql
SELECT
  order_no,
  status,
  CASE status
    WHEN 'pending' THEN '待支付'
    WHEN 'paid' THEN '已支付'
    WHEN 'shipped' THEN '已发货'
    WHEN 'completed' THEN '已完成'
    WHEN 'cancelled' THEN '已取消'
    ELSE '未知状态'
  END AS status_label
FROM orders;
```

展示文案通常更适合前端字典，SQL CASE 常用于统计分桶、排序权重或导出。不要让数据库和前端分别维护不一致的状态文案。

## 11. 聚合入门（P0）

```sql
SELECT
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_sales,
  AVG(total_amount) AS avg_order_amount,
  MIN(total_amount) AS min_order_amount,
  MAX(total_amount) AS max_order_amount
FROM orders
WHERE status IN ('paid', 'shipped', 'completed');
```

`COUNT(*)` 统计行数；`COUNT(column)` 不统计该列为 NULL 的行。

按状态分组：

```sql
SELECT status, COUNT(*) AS order_count
FROM orders
GROUP BY status
ORDER BY order_count DESC;
```

过滤分组结果用 HAVING：

```sql
SELECT user_id, SUM(total_amount) AS total_spent
FROM orders
WHERE status IN ('paid', 'shipped', 'completed')
GROUP BY user_id
HAVING SUM(total_amount) >= 1000;
```

WHERE 在分组前过滤行，HAVING 在分组后过滤聚合结果。能放 WHERE 的条件尽量放 WHERE，减少参与聚合的数据。

## 12. SQL 模式与严格性（P1）

```sql
SELECT @@SESSION.sql_mode;
```

严格模式可以阻止非法日期、数据截断等问题被静默写入。`ONLY_FULL_GROUP_BY` 会要求 SELECT 中非聚合列符合分组语义，是保护正确性的机制，不建议为了让错误 SQL 运行而关闭。

## 13. MongoDB 对照：find 到 SELECT（P0）

MongoDB 查询：

```js
db.products.find(
  { status: 'on_sale', price: { $gte: 100, $lt: 500 } },
  { name: 1, price: 1, stock: 1 }
).sort({ price: -1, _id: -1 }).limit(20)
```

对应 SQL：

```sql
SELECT id, name, price, stock
FROM products
WHERE status = 'on_sale'
  AND price >= 100
  AND price < 500
ORDER BY price DESC, id DESC
LIMIT 20;
```

`find` 的过滤对象对应 WHERE，projection 对应 SELECT 列，`sort` 和 `limit` 对应 ORDER BY、LIMIT。MongoDB 的 `_id` 和 MySQL 主键都适合作为稳定排序的兜底列，但类型和生成策略不必相同。

## 14. 本章自检

- [ ] 能写过滤、排序、分页、去重和聚合查询。
- [ ] 理解 WHERE 与 HAVING 的处理阶段。
- [ ] 能解释 `COUNT(*)` 与 `COUNT(column)` 的区别。
- [ ] 时间查询使用左闭右开区间。
- [ ] 知道深分页为什么慢，并能描述游标分页。
- [ ] 不用 DISTINCT 掩盖 JOIN 或建模问题。
