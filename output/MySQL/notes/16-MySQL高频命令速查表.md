---
title: "MySQL 16：高频命令速查表"
slug: mysql-16-cheatsheet
summary: "汇总连接、建表、增删改查、JOIN、事务、索引、执行计划、会话诊断和权限管理等高频 MySQL 命令。"
category:
tags: []
status: draft
sortOrder: 160
cover:
---

# 16 MySQL 高频命令速查表

本章用于工作时快速回忆，不替代前面原理学习。

## 连接与环境

```powershell
mysql -h 127.0.0.1 -P 3306 -u learning_app -p
```

```sql
SELECT VERSION();
SELECT CURRENT_USER();
SELECT DATABASE();
SELECT @@transaction_isolation;
SELECT @@session.time_zone, @@global.time_zone;
SHOW VARIABLES LIKE 'character_set_server';
```

## 数据库与表

```sql
SHOW DATABASES;
CREATE DATABASE app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE app_db;
SHOW TABLES;
DESCRIBE users;
SHOW CREATE TABLE users;
SHOW TABLE STATUS LIKE 'users';
```

## 建表模板

```sql
CREATE TABLE example_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_example_items_name (name),
  KEY idx_example_items_status_created (status, created_at),
  CONSTRAINT chk_example_items_amount CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## 结构变更

```sql
ALTER TABLE users ADD COLUMN nickname VARCHAR(80) NULL;
ALTER TABLE users MODIFY COLUMN nickname VARCHAR(120) NULL;
ALTER TABLE users ADD INDEX idx_users_created_at (created_at);
ALTER TABLE users DROP INDEX idx_users_created_at;
ALTER TABLE users DROP COLUMN nickname;
```

生产执行前评估锁、耗时、兼容性和回滚。

## 增删改

```sql
INSERT INTO users (email, username, password_hash)
VALUES (?, ?, ?);

UPDATE users
SET username = ?
WHERE id = ? AND deleted_at IS NULL;

DELETE FROM user_addresses
WHERE id = ? AND user_id = ?;

UPDATE articles
SET deleted_at = CURRENT_TIMESTAMP(3)
WHERE id = ? AND deleted_at IS NULL;
```

## 查询模板

```sql
SELECT id, username, created_at
FROM users
WHERE status = ?
  AND created_at >= ?
  AND created_at < ?
ORDER BY created_at DESC, id DESC
LIMIT ? OFFSET ?;
```

```sql
SELECT status, COUNT(*) AS order_count, SUM(total_amount) AS amount
FROM orders
WHERE created_at >= ? AND created_at < ?
GROUP BY status
HAVING COUNT(*) >= ?
ORDER BY amount DESC;
```

## JOIN 与存在性

```sql
SELECT o.order_no, u.username
FROM orders AS o
INNER JOIN users AS u ON u.id = o.user_id
WHERE o.id = ?;
```

```sql
SELECT u.id, u.username, COUNT(o.id) AS order_count
FROM users AS u
LEFT JOIN orders AS o
  ON o.user_id = u.id
 AND o.status = 'paid'
GROUP BY u.id, u.username;
```

```sql
SELECT u.id, u.username
FROM users AS u
WHERE EXISTS (
  SELECT 1 FROM orders AS o WHERE o.user_id = u.id
);
```

## 每组最新一条

```sql
WITH ranked AS (
  SELECT
    o.*,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at DESC, id DESC
    ) AS row_num
  FROM orders AS o
)
SELECT * FROM ranked WHERE row_num = 1;
```

## 事务

```sql
START TRANSACTION;

SELECT id, stock
FROM products
WHERE id = ?
FOR UPDATE;

UPDATE products
SET stock = stock - ?
WHERE id = ? AND stock >= ?;

COMMIT;
-- 异常时：ROLLBACK;
```

## 索引与执行计划

```sql
SHOW INDEX FROM orders;

CREATE INDEX idx_orders_user_status_created
ON orders (user_id, status, created_at);

EXPLAIN SELECT ...;
EXPLAIN FORMAT=TREE SELECT ...;
EXPLAIN ANALYZE SELECT ...;
```

重点看：`type`、`key`、`rows`、`filtered`、`Extra`。

## 会话与故障检查

```sql
SHOW FULL PROCESSLIST;
SHOW ENGINE INNODB STATUS;
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Threads_running';
```

生产不要未经评估直接 KILL 连接。

## 用户与权限

```sql
CREATE USER 'app'@'10.%' IDENTIFIED BY 'secret-from-vault';
GRANT SELECT, INSERT, UPDATE, DELETE ON app_db.* TO 'app'@'10.%';
SHOW GRANTS FOR 'app'@'10.%';
REVOKE DELETE ON app_db.* FROM 'app'@'10.%';
```

## 安全动作口诀

```text
UPDATE / DELETE：先用同条件 SELECT 验证。
DDL：先看表大小、锁影响、兼容性和回滚。
迁移：先 dry-run、备份，再分批 apply 和校验。
恢复：先到隔离库演练，不直接覆盖生产。
优化：先拿 SQL、参数、执行计划和指标，不凭感觉。
```
