---
title: "MySQL 00：MongoDB 到 MySQL 迁移对照"
slug: mysql-00-mongodb-to-mysql
summary: "为 MongoDB 用户建立 MySQL 的概念、CRUD、查询、建模、索引、事务和 Node.js 迁移桥梁。"
category:
tags: []
status: draft
sortOrder: 8
cover:
---

# MongoDB 到 MySQL 迁移对照

这篇不是把两种数据库硬翻译成同一套 API，而是帮助你把已经掌握的 MongoDB 思维迁移到关系型数据库。先找出业务语义，再选择另一种数据库的表达方式。

## 1. 基本概念

| MongoDB | MySQL | 学习重点 |
| --- | --- | --- |
| database | database | 两者都可以按业务划分数据库 |
| collection | table | MySQL 表需要提前定义列和约束 |
| document | row | 一行通常只表达一个实体事实 |
| field | column | 列有固定类型、默认值和 NULL 语义 |
| ObjectId | BIGINT/UUID 等主键 | 不要只按类型替换，要考虑索引和公开暴露 |
| embedded document | JSON 或拆分子表 | 核心关系、约束和高频查询通常应该拆表 |
| reference | 外键 + JOIN | 外键表达存在性，JOIN 组合读取结果 |

## 2. CRUD 和查询对照

| MongoDB 思路 | MySQL 常见写法 | 关键差异 |
| --- | --- | --- |
| `insertOne` / `insertMany` | `INSERT INTO` | 列名、类型和约束会参与写入校验 |
| `find({ status: 'active' })` | `SELECT ... WHERE status = 'active'` | SELECT 需要明确返回哪些列 |
| `$set` | `UPDATE ... SET` | 必须写清 WHERE，否则可能更新全表 |
| `$inc` | `SET stock = stock + ?` | 常和条件 UPDATE、事务一起使用 |
| `deleteOne` | `DELETE ... WHERE` | 核心业务经常使用 `deleted_at` 软删除 |
| `$match` | `WHERE` | 尽量在聚合前过滤，减少参与计算的数据 |
| `$project` | `SELECT` | SQL 的列别名通常是接口结果契约 |
| `$sort` / `$limit` | `ORDER BY` / `LIMIT` | 分页必须追加稳定的唯一排序键 |
| `$group` | `GROUP BY` | GROUP BY 会压缩明细行，窗口函数则保留明细 |
| `$lookup` | `JOIN` | JOIN 的连接基数决定结果行数，不能随便加 DISTINCT |

## 3. 建模迁移口诀

MongoDB 中适合一起读取、一起生命周期管理的小对象，可以嵌入文档。MySQL 中应先判断它是否需要：

- 独立查询、独立分页或独立权限。
- 外键约束、唯一约束或多对多关系。
- 单独的历史记录和审计。

只要答案是“需要”，就优先拆表。例如订单中的商品列表在 MongoDB 中可以嵌入订单文档；迁移到 MySQL 后通常拆成 `orders` 和 `order_items`，并在明细中保存成交时名称和价格快照。

## 4. 索引和事务迁移

- MongoDB compound index 与 MySQL 联合索引都依赖列/字段顺序，但 MySQL 还要同时考虑 JOIN、排序、回表和覆盖索引。
- MongoDB `explain()` 与 MySQL `EXPLAIN` 都是验证执行计划的工具，不能只看“用了索引”就判断快。
- MongoDB session transaction 和 MySQL 事务都需要明确边界；MySQL 连接池事务必须固定在同一个 connection 上。
- MongoDB 的文档原子更新不能直接替代 MySQL 的多表事务；下单、扣库存、写明细仍需统一提交或回滚。

## 5. Node.js 访问方式

MongoDB 中常见 `Model.find()`、`Model.aggregate()`；MySQL 学习阶段建议先使用 `mysql2/promise` 手写参数化 SQL，再学习 Prisma、Sequelize 等 ORM。这样可以看懂 ORM 生成的 JOIN、索引条件和事务连接。

每次迁移一个接口时，按这个顺序检查：

1. 原接口一行结果代表什么实体？
2. MongoDB 中哪些字段是嵌入，MySQL 中对应哪些表？
3. 查询是明细、聚合还是仅判断存在？
4. 哪些值必须参数化，哪些标识符必须白名单？
5. 是否需要事务、唯一约束、软删除和并发控制？

完成这篇对照后，再按 README 的入门必修路线学习，能明显减少“会 MongoDB 但不会 JOIN/事务”的断层。
