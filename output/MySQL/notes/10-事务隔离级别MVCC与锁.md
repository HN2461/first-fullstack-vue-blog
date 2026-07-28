---
title: "MySQL 10：事务、隔离级别、MVCC 与锁"
slug: mysql-10-transactions-mvcc-locks
summary: "理解 ACID、隔离级别、快照读、当前读、行锁、乐观锁、悲观锁、死锁和 Node.js 事务边界。"
category:
tags: []
status: draft
sortOrder: 100
cover:
---

# 10 事务、隔离级别、MVCC 与锁

## 1. 为什么需要事务（P0）

创建订单通常包含：

1. 插入订单。
2. 插入订单明细。
3. 扣减库存。
4. 写库存流水。

只成功一部分会产生脏数据。事务让这些数据库操作作为一个工作单元提交或回滚。

```sql
START TRANSACTION;

UPDATE products
SET stock = stock - 1
WHERE id = 101 AND stock >= 1;

INSERT INTO orders (...)
VALUES (...);

COMMIT;
```

任一步失败应执行 `ROLLBACK`。

事务只能原子控制数据库内的操作，不能自动回滚已经发出的短信、HTTP 请求或消息。跨系统一致性需要 Outbox、Saga、补偿和幂等等模式，不能用一个本地事务假装解决。

## 2. ACID（P0）

- Atomicity 原子性：事务内操作要么全部成功，要么全部失败。
- Consistency 一致性：事务前后数据满足约束和业务规则。
- Isolation 隔离性：并发事务之间按隔离级别控制相互可见性。
- Durability 持久性：提交后的数据在规定的故障模型下持久保存。

不要只背字母。面试时应能用转账或下单解释每一项。

## 3. 自动提交（P0）

```sql
SELECT @@autocommit;
```

默认通常为 1，每条独立语句就是一个事务。多步流程必须显式开启事务。

DDL 可能触发隐式提交，不要在业务事务中混入建表改表操作。具体行为按目标版本文档确认。

## 4. 隔离问题（P0）

### 脏读

事务 A 读到事务 B 尚未提交的数据，B 随后回滚。

### 不可重复读

同一事务两次读取同一行，期间其他事务提交更新，结果不同。

### 幻读

同一事务按范围查询两次，期间其他事务插入符合条件的行，结果行集合变化。

### 丢失更新

两个请求基于同一旧值计算更新，后写入覆盖先写入。它常需要条件更新、锁或乐观锁解决，不能只靠背隔离级别。

## 5. 四种隔离级别（P0）

```sql
SELECT @@transaction_isolation;
```

| 隔离级别 | 特点 |
| --- | --- |
| READ UNCOMMITTED | 可能脏读，业务系统极少使用 |
| READ COMMITTED | 每次一致性读通常看到语句开始前已提交数据 |
| REPEATABLE READ | 同一事务的一致性读通常基于相同快照；MySQL InnoDB 默认常为此级别 |
| SERIALIZABLE | 最强隔离，并发能力最低，少作为普通业务默认 |

设置当前会话下一事务：

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
```

不同数据库对同名隔离级别的实现细节可能不同。企业项目要以 MySQL InnoDB 的实际行为为准。

## 6. MVCC（P1）

MVCC（多版本并发控制）让普通一致性读在很多情况下无需阻塞写入。InnoDB 借助事务信息、Undo Log 和 Read View 判断某个行版本对当前事务是否可见。

简化理解：

- 快照读：普通 SELECT，读取符合可见性规则的历史版本。
- 当前读：读取最新版本并可能加锁，如 `SELECT ... FOR UPDATE`、UPDATE、DELETE。

REPEATABLE READ 下首次一致性读建立的快照，通常会在事务内复用。READ COMMITTED 通常每条语句建立新快照。

MVCC 不是“没有锁”。写写冲突、当前读、唯一性检查等仍会加锁。

## 7. 行锁与索引（P0）

```sql
START TRANSACTION;

SELECT id, stock
FROM products
WHERE id = 101
FOR UPDATE;

UPDATE products
SET stock = stock - 1
WHERE id = 101;

COMMIT;
```

`FOR UPDATE` 获取排他性质的锁，其他事务对同一记录的冲突操作会等待。

锁定范围与访问路径有关。条件没有合适索引时，扫描和锁影响可能显著扩大。因此索引不仅影响查询性能，也影响并发。

InnoDB 中还存在记录锁、间隙锁、Next-Key Lock 等。入门阶段应掌握：范围当前读在 REPEATABLE READ 下可能锁住记录之间的间隙，以控制幻读；具体锁范围必须结合索引和执行计划分析。

## 8. 悲观锁与乐观锁（P0）

### 悲观锁

先锁后改：

```sql
SELECT stock FROM products WHERE id = ? FOR UPDATE;
```

适合冲突概率较高、流程短、必须基于当前值决策的操作。代价是等待和死锁风险。

### 乐观锁

表中增加 `version`：

```sql
UPDATE documents
SET
  content = ?,
  version = version + 1
WHERE id = ?
  AND version = ?;
```

影响 0 行表示数据已被其他请求修改。适合读多写少、冲突相对少的编辑场景。

库存扣减常可直接使用原子条件 UPDATE，不一定要先锁再读：

```sql
UPDATE products
SET stock = stock - ?
WHERE id = ? AND stock >= ?;
```

## 9. 死锁（P0）

事务 A 锁住商品 1 等商品 2；事务 B 锁住商品 2 等商品 1，形成循环等待。InnoDB 会检测死锁并回滚其中一个事务。

降低死锁：

- 多行资源按稳定顺序访问，例如总按商品 ID 升序。
- 事务尽量短，不在事务中做网络请求或复杂计算。
- 为查询条件建立合适索引，缩小锁范围。
- 一次处理合理数据量。
- 应用对死锁和锁等待超时做有限次数、带退避的重试。

查看最近死锁：

```sql
SHOW ENGINE INNODB STATUS;
```

线上还可结合 Performance Schema、数据库监控和结构化日志。死锁是并发系统可能出现的正常现象，但频繁死锁意味着访问顺序、事务大小或索引需要改进。

## 10. 事务边界设计（P0）

好的事务：

- 只包含必须原子提交的数据库操作。
- 开启前已完成参数校验和可提前完成的读取/计算。
- 不等待用户输入。
- 不在持锁期间调用第三方 HTTP 服务。
- 每条路径都能 commit、rollback 和释放连接。

典型错误：开启事务后调用支付平台，网络等待 5 秒，数据库锁也持有 5 秒。应重构流程，使用明确状态、幂等键和异步一致性模式。

## 11. 保存点（P2）

```sql
START TRANSACTION;
SAVEPOINT before_optional_step;

-- 可选操作

ROLLBACK TO SAVEPOINT before_optional_step;
COMMIT;
```

可回滚事务的一部分，但复杂业务大量依赖保存点会增加理解成本。优先保持事务流程清晰。

## 12. Node.js 事务必须使用同一连接（P0）

连接池中的每次 `pool.execute()` 可能拿到不同连接。事务必须：

1. 从池获取一个 connection。
2. 在该 connection 上 beginTransaction。
3. 所有 SQL 都用该 connection。
4. 成功 commit，异常 rollback。
5. finally 中 release。

完整示例见第 13 章。

## 13. 并发测试思路

开启两个客户端窗口：

客户端 A：

```sql
START TRANSACTION;
SELECT * FROM products WHERE id = 101 FOR UPDATE;
-- 暂不提交
```

客户端 B：

```sql
START TRANSACTION;
UPDATE products SET stock = stock - 1 WHERE id = 101;
```

观察 B 等待，然后在 A 中 COMMIT 或 ROLLBACK。实验后必须结束两个事务，避免长事务持续占锁。

## 14. MongoDB 对照：文档原子性与 MySQL 事务（P0）

MongoDB 单文档更新适合“一份文档内的局部变化”；使用 session transaction 才能把多个文档操作放在一个事务中。迁移到 MySQL 后，订单、明细、库存和流水往往本来就是多张表，因此下单流程应显式使用事务。

两种数据库都需要关注：

- 事务边界是否短小，是否在事务中调用外部服务。
- 重复请求是否有幂等键和唯一约束。
- 并发更新是否使用条件更新、版本号或锁。
- 驱动是否始终复用同一事务上下文。

不要把 MongoDB 的“单文档原子更新”理解成 MySQL 中多条 SQL 的默认原子性；MySQL 每条独立语句默认可能各自提交。

## 15. 本章自检

- [ ] 能用订单创建解释 ACID。
- [ ] 能说清快照读和当前读。
- [ ] 能用条件 UPDATE 防止库存变负。
- [ ] 知道事务必须短，并且不能跨连接。
- [ ] 能列出死锁的常见成因、规避和重试策略。
