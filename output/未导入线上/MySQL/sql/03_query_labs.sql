-- 核心查询实验。先执行 01_schema.sql 和 02_seed.sql。

USE mysql_learning;

-- 1. 上架且有库存的商品，按价格从高到低排列。
SELECT id, product_code, name, price, stock
FROM products
WHERE status = 'on_sale'
  AND stock > 0
  AND deleted_at IS NULL
ORDER BY price DESC, id DESC;

-- 2. 查询 2026 年 7 月创建的订单，使用左闭右开时间区间。
SELECT id, order_no, user_id, status, total_amount, created_at
FROM orders
WHERE created_at >= '2026-07-01 00:00:00.000'
  AND created_at <  '2026-08-01 00:00:00.000'
ORDER BY created_at DESC, id DESC;

-- 3. 统计各订单状态数量和金额。
SELECT
  status,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_amount
FROM orders
GROUP BY status
ORDER BY order_count DESC, status;

-- 4. 订单列表关联用户名。
SELECT
  o.id,
  o.order_no,
  u.username,
  o.status,
  o.total_amount,
  o.created_at
FROM orders AS o
INNER JOIN users AS u ON u.id = o.user_id
ORDER BY o.created_at DESC, o.id DESC;

-- 5. 保留从未下单的用户，并正确统计有效订单数量。
SELECT
  u.id,
  u.username,
  COUNT(o.id) AS valid_order_count,
  COALESCE(SUM(o.total_amount), 0.00) AS valid_order_amount
FROM users AS u
LEFT JOIN orders AS o
  ON o.user_id = u.id
 AND o.status IN ('paid', 'shipped', 'completed')
GROUP BY u.id, u.username
ORDER BY valid_order_amount DESC, u.id;

-- 6. 查询订单 1 的明细，展示成交快照而不是商品当前名称和价格。
SELECT
  o.order_no,
  oi.product_name_snapshot,
  oi.unit_price,
  oi.quantity,
  oi.line_amount
FROM orders AS o
INNER JOIN order_items AS oi ON oi.order_id = o.id
WHERE o.id = 1
ORDER BY oi.id;

-- 7. 查找至少购买过键盘鼠标分类商品的用户。
SELECT u.id, u.username
FROM users AS u
WHERE EXISTS (
  SELECT 1
  FROM orders AS o
  INNER JOIN order_items AS oi ON oi.order_id = o.id
  INNER JOIN products AS p ON p.id = oi.product_id
  WHERE o.user_id = u.id
    AND p.category_id = 2
    AND o.status IN ('paid', 'shipped', 'completed')
);

-- 8. 查找从未下单的用户，避免 NOT IN 的 NULL 语义问题。
SELECT u.id, u.username
FROM users AS u
WHERE NOT EXISTS (
  SELECT 1
  FROM orders AS o
  WHERE o.user_id = u.id
);

-- 9. 统计有效订单中的商品销量与销售额。
SELECT
  p.id,
  p.name,
  SUM(oi.quantity) AS sales_quantity,
  SUM(oi.line_amount) AS sales_amount
FROM products AS p
INNER JOIN order_items AS oi ON oi.product_id = p.id
INNER JOIN orders AS o ON o.id = oi.order_id
WHERE o.status IN ('paid', 'shipped', 'completed')
GROUP BY p.id, p.name
ORDER BY sales_amount DESC, p.id;

-- 10. 每个用户最新一笔订单。
WITH ranked_orders AS (
  SELECT
    o.*,
    ROW_NUMBER() OVER (
      PARTITION BY o.user_id
      ORDER BY o.created_at DESC, o.id DESC
    ) AS row_num
  FROM orders AS o
)
SELECT
  user_id,
  order_no,
  status,
  total_amount,
  created_at
FROM ranked_orders
WHERE row_num = 1
ORDER BY user_id;

-- 11. 每个根分类和子分类的层级深度。
WITH RECURSIVE category_tree AS (
  SELECT id, parent_id, name, 0 AS depth, CAST(name AS CHAR(500)) AS path
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  SELECT
    c.id,
    c.parent_id,
    c.name,
    ct.depth + 1,
    CONCAT(ct.path, ' / ', c.name)
  FROM categories AS c
  INNER JOIN category_tree AS ct ON ct.id = c.parent_id
)
SELECT id, parent_id, name, depth, path
FROM category_tree
ORDER BY path;

-- 12. 按天统计有效销售额，并计算累计销售额。
WITH daily_sales AS (
  SELECT
    DATE(created_at) AS sale_date,
    SUM(total_amount) AS amount
  FROM orders
  WHERE status IN ('paid', 'shipped', 'completed')
  GROUP BY DATE(created_at)
)
SELECT
  sale_date,
  amount,
  SUM(amount) OVER (ORDER BY sale_date) AS cumulative_amount,
  LAG(amount) OVER (ORDER BY sale_date) AS previous_amount
FROM daily_sales
ORDER BY sale_date;

-- 13. 条件聚合生成订单状态概览。
SELECT
  COUNT(*) AS total_count,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
  SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
  SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shipped_count,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
FROM orders;

-- 14. 查询商品 JSON 扩展属性。
SELECT
  id,
  name,
  extra_attributes->>'$.color' AS color
FROM products
WHERE extra_attributes IS NOT NULL;

-- 15. 游标分页：获取指定游标之前的订单。
SELECT id, order_no, status, total_amount, created_at
FROM orders
WHERE user_id = 2
  AND (
    created_at < '2026-07-20 08:00:00.000'
    OR (created_at = '2026-07-20 08:00:00.000' AND id < 5)
  )
ORDER BY created_at DESC, id DESC
LIMIT 2;

