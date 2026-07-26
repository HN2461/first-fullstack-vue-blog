---
title: "MySQL 07：聚合、子查询、CTE 与窗口函数"
slug: mysql-07-aggregation-subquery-cte-window
summary: "学习分组统计、子查询、公共表表达式、递归查询和窗口函数，解决每组最新一条、Top N 与累计指标。"
category:
tags: []
status: draft
sortOrder: 70
cover:
---

# 07 聚合、子查询、CTE 与窗口函数

## 1. 分组统计（P0）

按日统计有效订单：

```sql
SELECT
  DATE(created_at) AS order_date,
  COUNT(*) AS order_count,
  SUM(total_amount) AS sales_amount
FROM orders
WHERE status IN ('paid', 'shipped', 'completed')
  AND created_at >= '2026-07-01'
  AND created_at <  '2026-08-01'
GROUP BY DATE(created_at)
ORDER BY order_date;
```

WHERE 时间条件仍然直接作用于原列，可以利用索引；`DATE(created_at)` 只用于分组和展示。

条件聚合可在一行得到多个指标：

```sql
SELECT
  COUNT(*) AS total_count,
  SUM(status = 'pending') AS pending_count,
  SUM(status = 'paid') AS paid_count,
  SUM(status = 'cancelled') AS cancelled_count
FROM orders;
```

更具跨数据库可读性的写法：

```sql
SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count
```

## 2. GROUP BY 的正确性（P0）

错误思路：按 `user_id` 分组，却随意选择某个未聚合的 `order_no`。这个订单号没有确定语义。

```sql
SELECT user_id, order_no, SUM(total_amount)
FROM orders
GROUP BY user_id;
```

启用 `ONLY_FULL_GROUP_BY` 时会拒绝这类 SQL。正确做法是：

- 把确实作为分组维度的列加入 GROUP BY。
- 对指标使用聚合函数。
- 若想取“每个用户最新订单”，使用窗口函数或明确的子查询连接。

## 3. 标量子查询（P1）

子查询返回单个值：

```sql
SELECT
  id,
  name,
  price,
  (SELECT AVG(price) FROM products) AS avg_price
FROM products
WHERE price > (SELECT AVG(price) FROM products);
```

如果子查询意外返回多行，会报错。简单统计没问题，复杂场景要注意是否重复执行以及能否改成 JOIN/CTE。

## 4. IN、EXISTS 与相关子查询（P1）

查询购买过指定分类商品的用户：

```sql
SELECT u.id, u.username
FROM users AS u
WHERE EXISTS (
  SELECT 1
  FROM orders AS o
  INNER JOIN order_items AS oi ON oi.order_id = o.id
  INNER JOIN products AS p ON p.id = oi.product_id
  WHERE o.user_id = u.id
    AND p.category_id = 2
);
```

里面引用外层 `u.id`，称为相关子查询。MySQL 优化器可能改写执行方式，但仍要通过 EXPLAIN 验证。

`NOT IN` 的 NULL 陷阱：只要子查询结果中存在 NULL，整体比较可能变成 UNKNOWN。反向存在判断优先 `NOT EXISTS`，或明确排除 NULL。

## 5. 派生表（P1）

FROM 中的子查询会形成派生结果：

```sql
SELECT
  summary.user_id,
  summary.order_count,
  summary.total_spent
FROM (
  SELECT
    user_id,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_spent
  FROM orders
  WHERE status IN ('paid', 'shipped', 'completed')
  GROUP BY user_id
) AS summary
WHERE summary.total_spent >= 1000;
```

派生表必须有别名。

## 6. CTE 公共表表达式（P1）

CTE 用 `WITH` 给中间结果命名，提高复杂 SQL 可读性：

```sql
WITH paid_order_summary AS (
  SELECT
    user_id,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_spent
  FROM orders
  WHERE status IN ('paid', 'shipped', 'completed')
  GROUP BY user_id
)
SELECT
  u.id,
  u.username,
  s.order_count,
  s.total_spent
FROM paid_order_summary AS s
INNER JOIN users AS u ON u.id = s.user_id
WHERE s.total_spent >= 1000;
```

CTE 首先是可读性工具，不保证自动更快。是否物化或合并由版本、SQL 和优化器决定，性能仍看执行计划。

## 7. 递归 CTE（P2）

查询分类树：

```sql
WITH RECURSIVE category_tree AS (
  SELECT id, parent_id, name, 0 AS depth
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  SELECT c.id, c.parent_id, c.name, ct.depth + 1
  FROM categories AS c
  INNER JOIN category_tree AS ct ON ct.id = c.parent_id
)
SELECT id, parent_id, name, depth
FROM category_tree
ORDER BY depth, id;
```

需要防止脏数据形成环，并注意最大递归深度。特别深或读取模式复杂的树可能采用路径、闭包表等其他模型，入门阶段了解即可。

## 8. 窗口函数解决什么问题（P1）

GROUP BY 会把多行压缩成一行；窗口函数在保留明细行的同时计算排名、累计值或分组指标。

```sql
SELECT
  id,
  user_id,
  order_no,
  total_amount,
  SUM(total_amount) OVER (PARTITION BY user_id) AS user_total_spent
FROM orders
WHERE status IN ('paid', 'shipped', 'completed');
```

## 9. ROW_NUMBER、RANK、DENSE_RANK（P1）

```sql
SELECT
  user_id,
  order_no,
  total_amount,
  ROW_NUMBER() OVER (
    PARTITION BY user_id
    ORDER BY created_at DESC, id DESC
  ) AS row_num
FROM orders;
```

排名差异：

- `ROW_NUMBER()`：即使金额相同也给连续唯一序号，如 1、2、3。
- `RANK()`：并列后跳号，如 1、1、3。
- `DENSE_RANK()`：并列后不跳号，如 1、1、2。

## 10. 每组最新一条（P1，高频）

取每个用户最新订单：

```sql
WITH ranked_orders AS (
  SELECT
    o.*,
    ROW_NUMBER() OVER (
      PARTITION BY o.user_id
      ORDER BY o.created_at DESC, o.id DESC
    ) AS row_num
  FROM orders AS o
)
SELECT id, user_id, order_no, status, total_amount, created_at
FROM ranked_orders
WHERE row_num = 1;
```

必须追加 `id` 等唯一列确保排序稳定。

## 11. Top N 与累计值（P1）

每个分类销量最高的 3 个商品：

```sql
WITH product_sales AS (
  SELECT
    p.category_id,
    p.id AS product_id,
    p.name,
    SUM(oi.quantity) AS sales_quantity
  FROM products AS p
  INNER JOIN order_items AS oi ON oi.product_id = p.id
  INNER JOIN orders AS o ON o.id = oi.order_id
  WHERE o.status IN ('paid', 'shipped', 'completed')
  GROUP BY p.category_id, p.id, p.name
), ranked_products AS (
  SELECT
    product_sales.*,
    ROW_NUMBER() OVER (
      PARTITION BY category_id
      ORDER BY sales_quantity DESC, product_id
    ) AS row_num
  FROM product_sales
)
SELECT *
FROM ranked_products
WHERE row_num <= 3;
```

累计销售额：

```sql
SELECT
  DATE(created_at) AS order_date,
  SUM(total_amount) AS daily_sales,
  SUM(SUM(total_amount)) OVER (
    ORDER BY DATE(created_at)
  ) AS cumulative_sales
FROM orders
WHERE status IN ('paid', 'shipped', 'completed')
GROUP BY DATE(created_at)
ORDER BY order_date;
```

## 12. LAG 与 LEAD（P2）

比较每天销售额与前一天差值：

```sql
WITH daily_sales AS (
  SELECT DATE(created_at) AS sale_date, SUM(total_amount) AS amount
  FROM orders
  WHERE status IN ('paid', 'shipped', 'completed')
  GROUP BY DATE(created_at)
)
SELECT
  sale_date,
  amount,
  LAG(amount) OVER (ORDER BY sale_date) AS previous_amount,
  amount - LAG(amount) OVER (ORDER BY sale_date) AS amount_change
FROM daily_sales;
```

## 13. 复杂 SQL 的拆解方法

面对报表需求，按以下顺序写：

1. 确定最终一行代表什么，例如“一行一个用户”。
2. 确定数据范围和有效状态。
3. 先分别验证每个基础数据集。
4. 明确关联基数是一对一、一对多还是多对多。
5. 再聚合或排名。
6. 最后添加展示字段、排序和分页。
7. 用边界数据验证：0 条、重复、NULL、并列、跨日。
8. 查看 EXPLAIN 和真实耗时。

不要一开始就写 100 行 SQL，再通过反复加 DISTINCT 猜结果。

## 14. 本章自检

- [ ] 能写条件聚合和分组过滤。
- [ ] 理解 GROUP BY 与窗口函数是否保留明细行的差异。
- [ ] 能用 CTE 提升复杂查询可读性。
- [ ] 能用 ROW_NUMBER 获取每组最新一条和 Top N。
- [ ] 知道 NOT IN 的 NULL 风险。
