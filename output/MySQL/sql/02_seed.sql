-- MySQL 8.x 学习库：示例数据
-- 使用固定主键和 INSERT IGNORE，便于第一次执行及重复实验。

USE mysql_learning;

INSERT IGNORE INTO users (
  id,
  email,
  username,
  password_hash,
  status,
  last_login_at,
  created_at
) VALUES
  (1, 'alice@example.com', 'Alice', '$2b$learning_hash_1', 'active',
    '2026-07-25 09:30:00.000', '2026-06-01 09:00:00.000'),
  (2, 'bob@example.com', 'Bob', '$2b$learning_hash_2', 'active',
    '2026-07-24 18:00:00.000', '2026-06-05 10:00:00.000'),
  (3, 'carol@example.com', 'Carol', '$2b$learning_hash_3', 'disabled',
    NULL, '2026-06-10 11:00:00.000'),
  (4, 'david@example.com', 'David', '$2b$learning_hash_4', 'active',
    NULL, '2026-07-01 12:00:00.000');

INSERT IGNORE INTO categories (
  id,
  parent_id,
  name,
  category_code,
  sort_order
) VALUES
  (1, NULL, '数码配件', 'digital-accessories', 10),
  (2, 1, '键盘鼠标', 'keyboard-mouse', 10),
  (3, NULL, '图书', 'books', 20),
  (4, 3, '数据库', 'database-books', 10),
  (5, 1, '显示设备', 'display-devices', 20);

INSERT IGNORE INTO products (
  id,
  category_id,
  product_code,
  name,
  price,
  stock,
  status,
  extra_attributes,
  created_at
) VALUES
  (1, 2, 'KB-001', '机械键盘', 399.00, 50, 'on_sale',
    JSON_OBJECT('switch', '茶轴', 'color', '黑色'),
    '2026-06-12 09:00:00.000'),
  (2, 2, 'MS-001', '无线鼠标', 129.00, 100, 'on_sale',
    JSON_OBJECT('color', '白色', 'connection', '2.4G'),
    '2026-06-13 09:00:00.000'),
  (3, 4, 'BK-001', 'MySQL 企业开发实战', 89.00, 200, 'on_sale',
    JSON_OBJECT('author', '示例作者', 'pages', 520),
    '2026-06-14 09:00:00.000'),
  (4, 5, 'DP-001', '27 英寸 4K 显示器', 1599.00, 20, 'on_sale',
    JSON_OBJECT('resolution', '3840x2160', 'size', 27),
    '2026-06-15 09:00:00.000'),
  (5, 2, 'KB-002', '入门薄膜键盘', 99.00, 0, 'off_sale',
    NULL, '2026-06-16 09:00:00.000');

INSERT IGNORE INTO orders (
  id,
  order_no,
  user_id,
  idempotency_key,
  status,
  total_amount,
  shipping_address,
  paid_at,
  shipped_at,
  completed_at,
  cancelled_at,
  created_at
) VALUES
  (1, 'ORD202607010001', 1, 'alice-order-001', 'paid', 657.00,
    JSON_OBJECT('city', '上海市', 'detail', '浦东新区示例路 1 号'),
    '2026-07-01 10:05:00.000', NULL, NULL, NULL,
    '2026-07-01 10:00:00.000'),
  (2, 'ORD202607050001', 1, 'alice-order-002', 'completed', 178.00,
    JSON_OBJECT('city', '上海市', 'detail', '浦东新区示例路 1 号'),
    '2026-07-05 14:03:00.000', '2026-07-06 09:00:00.000',
    '2026-07-08 18:00:00.000', NULL,
    '2026-07-05 14:00:00.000'),
  (3, 'ORD202607100001', 2, 'bob-order-001', 'pending', 1599.00,
    JSON_OBJECT('city', '杭州市', 'detail', '西湖区示例路 2 号'),
    NULL, NULL, NULL, NULL, '2026-07-10 20:00:00.000'),
  (4, 'ORD202607120001', 2, 'bob-order-002', 'cancelled', 129.00,
    JSON_OBJECT('city', '杭州市', 'detail', '西湖区示例路 2 号'),
    NULL, NULL, NULL, '2026-07-12 20:30:00.000',
    '2026-07-12 20:00:00.000'),
  (5, 'ORD202607200001', 2, 'bob-order-003', 'shipped', 528.00,
    JSON_OBJECT('city', '杭州市', 'detail', '西湖区示例路 2 号'),
    '2026-07-20 08:05:00.000', '2026-07-21 09:00:00.000',
    NULL, NULL, '2026-07-20 08:00:00.000');

INSERT IGNORE INTO order_items (
  id,
  order_id,
  product_id,
  product_name_snapshot,
  unit_price,
  quantity,
  line_amount,
  created_at
) VALUES
  (1, 1, 1, '机械键盘', 399.00, 1, 399.00, '2026-07-01 10:00:00.000'),
  (2, 1, 2, '无线鼠标', 129.00, 2, 258.00, '2026-07-01 10:00:00.000'),
  (3, 2, 3, 'MySQL 企业开发实战', 89.00, 2, 178.00,
    '2026-07-05 14:00:00.000'),
  (4, 3, 4, '27 英寸 4K 显示器', 1599.00, 1, 1599.00,
    '2026-07-10 20:00:00.000'),
  (5, 4, 2, '无线鼠标', 129.00, 1, 129.00, '2026-07-12 20:00:00.000'),
  (6, 5, 1, '机械键盘', 399.00, 1, 399.00, '2026-07-20 08:00:00.000'),
  (7, 5, 2, '无线鼠标', 129.00, 1, 129.00, '2026-07-20 08:00:00.000');

INSERT IGNORE INTO stock_movements (
  id,
  product_id,
  order_id,
  movement_type,
  quantity_delta,
  stock_after,
  remark,
  created_at
) VALUES
  (1, 1, 1, 'order_deduct', -1, 51, '订单扣减', '2026-07-01 10:00:00.000'),
  (2, 2, 1, 'order_deduct', -2, 102, '订单扣减', '2026-07-01 10:00:00.000'),
  (3, 3, 2, 'order_deduct', -2, 200, '订单扣减', '2026-07-05 14:00:00.000'),
  (4, 4, 3, 'order_deduct', -1, 20, '订单扣减', '2026-07-10 20:00:00.000'),
  (5, 2, 4, 'order_deduct', -1, 101, '订单创建时扣减', '2026-07-12 20:00:00.000'),
  (6, 2, 4, 'order_release', 1, 102, '取消订单释放库存', '2026-07-12 20:30:00.000'),
  (7, 1, 5, 'order_deduct', -1, 50, '订单扣减', '2026-07-20 08:00:00.000'),
  (8, 2, 5, 'order_deduct', -1, 101, '订单扣减', '2026-07-20 08:00:00.000'),
  (9, 2, NULL, 'manual_adjust', -1, 100, '盘点调整', '2026-07-22 09:00:00.000');

SELECT 'seed completed' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS order_count FROM orders;
