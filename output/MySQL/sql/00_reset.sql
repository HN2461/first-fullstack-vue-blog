-- 仅用于本地学习环境：删除并重建实验数据库。
-- 执行前确认当前连接不是生产库；该脚本会删除 mysql_learning 中的全部对象和数据。

DROP DATABASE IF EXISTS mysql_learning;

CREATE DATABASE mysql_learning
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

SELECT 'mysql_learning reset completed; run 01_schema.sql and 02_seed.sql next.' AS message;
