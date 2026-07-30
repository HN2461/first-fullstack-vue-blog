-- 事务实验。所有单窗口写入实验最终 ROLLBACK，不永久修改示例数据。

USE mysql_learning;

-- 实验 1：条件扣减库存并观察受影响行。
START TRANSACTION;

SELECT id, name, stock
FROM products
WHERE id = 1;

UPDATE products
SET stock = stock - 2
WHERE id = 1
  AND status = 'on_sale'
  AND stock >= 2;

SELECT ROW_COUNT() AS affected_rows;

SELECT id, name, stock
FROM products
WHERE id = 1;

ROLLBACK;

SELECT id, name, stock
FROM products
WHERE id = 1;

-- 实验 2：事务中任一步失败时整体回滚。
START TRANSACTION;

INSERT INTO orders (
  order_no,
  user_id,
  idempotency_key,
  status,
  total_amount,
  created_at
) VALUES (
  'LAB-ROLLBACK-001',
  1,
  'lab-rollback-001',
  'pending',
  399.00,
  CURRENT_TIMESTAMP(3)
);

SET @lab_order_id = LAST_INSERT_ID();

INSERT INTO order_items (
  order_id,
  product_id,
  product_name_snapshot,
  unit_price,
  quantity,
  line_amount
) VALUES (
  @lab_order_id,
  1,
  '机械键盘',
  399.00,
  1,
  399.00
);

SELECT id, order_no
FROM orders
WHERE id = @lab_order_id;

ROLLBACK;

SELECT id, order_no
FROM orders
WHERE order_no = 'LAB-ROLLBACK-001';

-- 实验 3：乐观锁。增加字段只作为语法示意，不在这里 ALTER 示例表。
-- UPDATE documents
-- SET content = '新内容', version = version + 1
-- WHERE id = 1 AND version = 3;
-- SELECT ROW_COUNT();

-- 实验 4：双窗口观察行锁。
-- 在客户端 A 执行以下语句并暂不提交：
-- START TRANSACTION;
-- SELECT id, stock FROM products WHERE id = 1 FOR UPDATE;

-- 在客户端 B 执行以下语句，它会等待 A 释放锁：
-- START TRANSACTION;
-- UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock >= 1;

-- 回到客户端 A 执行 COMMIT，然后观察客户端 B 继续执行。
-- 最后在客户端 B 执行 ROLLBACK，避免永久修改数据。

-- 实验 5：死锁原理，需要两个客户端并交叉执行。
-- 客户端 A：START TRANSACTION; SELECT * FROM products WHERE id = 1 FOR UPDATE;
-- 客户端 B：START TRANSACTION; SELECT * FROM products WHERE id = 2 FOR UPDATE;
-- 客户端 A：SELECT * FROM products WHERE id = 2 FOR UPDATE;
-- 客户端 B：SELECT * FROM products WHERE id = 1 FOR UPDATE;
-- MySQL 将回滚其中一个事务。实验后两个客户端都执行 ROLLBACK。
-- 使用 SHOW ENGINE INNODB STATUS 查看最近一次死锁信息。

