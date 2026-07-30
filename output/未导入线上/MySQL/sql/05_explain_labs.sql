-- 索引与 EXPLAIN 实验。示例数据很少，优化器可能合理选择全表扫描。
-- 真正评估性能时，应使用接近生产规模和分布的数据。

USE mysql_learning;

-- 1. 主键等值查询，通常是 const。
EXPLAIN
SELECT id, email, username
FROM users
WHERE id = 1;

-- 2. 唯一索引查询。
EXPLAIN
SELECT id, email, username
FROM users
WHERE email = 'alice@example.com';

-- 3. 联合索引服务过滤和排序。
EXPLAIN
SELECT id, order_no, status, total_amount, created_at
FROM orders
WHERE user_id = 2
  AND status = 'shipped'
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- 4. 最左前缀：只有 status 时，无法使用 user_id 开头的索引完成定位，
-- 但可选择 idx_orders_status_created。
EXPLAIN
SELECT id, order_no, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC;

-- 5. 对索引列使用函数与范围改写的对比。
EXPLAIN
SELECT id, order_no
FROM orders
WHERE DATE(created_at) = '2026-07-20';

EXPLAIN
SELECT id, order_no
FROM orders
WHERE created_at >= '2026-07-20 00:00:00.000'
  AND created_at <  '2026-07-21 00:00:00.000';

-- 6. 前导通配符通常无法用普通索引做前缀定位。
EXPLAIN
SELECT id, name
FROM products
WHERE name LIKE '%键盘%';

-- 7. JOIN 的连接列访问。
EXPLAIN
SELECT
  o.order_no,
  oi.product_name_snapshot,
  oi.quantity
FROM orders AS o
INNER JOIN order_items AS oi ON oi.order_id = o.id
WHERE o.id = 1;

-- 8. FORMAT=TREE 更直观展示算子树。
EXPLAIN FORMAT=TREE
SELECT
  u.id,
  u.username,
  COUNT(o.id) AS paid_order_count
FROM users AS u
LEFT JOIN orders AS o
  ON o.user_id = u.id
 AND o.status = 'paid'
GROUP BY u.id, u.username;

-- 9. EXPLAIN ANALYZE 会真实执行 SELECT，显示实际行数和耗时。
EXPLAIN ANALYZE
SELECT id, order_no, total_amount, created_at
FROM orders
WHERE user_id = 1
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- 10. 查看全部索引，检查是否存在功能重复。
SHOW INDEX FROM orders;

