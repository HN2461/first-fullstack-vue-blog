---
title: "MySQL 13：Node.js 连接 MySQL 实战"
slug: mysql-13-nodejs-mysql2
summary: "使用 mysql2 实现连接池、参数化查询、动态筛选、事务、金额处理、数据库错误映射和可测试数据访问层。"
category:
tags: []
status: draft
sortOrder: 130
cover:
---

# 13 Node.js 连接 MySQL 实战

## 1. 技术选择

Node.js 直接访问 MySQL 常用 `mysql2`，支持 Promise、连接池和预处理语句风格接口：

```powershell
npm install mysql2
```

ORM/查询构建器常见选择：Prisma、Sequelize、TypeORM、Knex。入门建议先掌握 SQL + `mysql2`，再使用 ORM。否则遇到慢查询、事务和复杂报表时只能猜 ORM 在做什么。

## 2. 环境变量（P0）

`.env` 示例：

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=mysql_learning
DB_USER=learning_app
DB_PASSWORD=replace_me
DB_CONNECTION_LIMIT=10
```

真实 `.env` 不提交 Git，只提交 `.env.example`。启动时校验必需配置，避免缺失配置直到首个请求才报错。

## 3. 创建连接池（P0）

```js
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  decimalNumbers: false
})
```

关键点：

- 池在应用进程中复用，不要每个请求创建一个池。
- `connectionLimit` 要结合应用实例数和数据库容量确定。
- 金额不要因方便直接转成 JS Number。`DECIMAL` 默认以字符串返回更安全。
- JavaScript Number 无法精确表示大于 `Number.MAX_SAFE_INTEGER` 的 BIGINT。公共 ID 可按字符串传输。
- 时区策略必须与建表、业务和驱动配置一致。

## 4. 启动健康检查（P0）

```js
export async function checkDatabase() {
  const [rows] = await pool.query(
    'SELECT 1 AS ok, VERSION() AS version, NOW(3) AS databaseTime'
  )

  return rows[0]
}
```

就绪检查可以验证数据库连接，但不要让每个高频存活检查都执行昂贵 SQL。应用关闭时优雅执行：

```js
await pool.end()
```

## 5. 参数化查询（P0）

```js
export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, email, username, status, created_at
     FROM users
     WHERE email = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [email]
  )

  return rows[0] ?? null
}
```

值使用占位符，禁止字符串拼接。即使参数来自“可信后台”，也应参数化，因为错误和二次注入同样存在。

## 6. 动态筛选与白名单（P0）

参数占位符不能安全替代表名、列名、ASC/DESC。动态排序应白名单映射：

```js
const sortColumns = {
  createdAt: 'o.created_at',
  totalAmount: 'o.total_amount',
  orderNo: 'o.order_no'
}

export async function listOrders(input) {
  const conditions = ['o.deleted_at IS NULL']
  const params = []

  if (input.userId) {
    conditions.push('o.user_id = ?')
    params.push(input.userId)
  }

  if (input.status) {
    conditions.push('o.status = ?')
    params.push(input.status)
  }

  const sortColumn = sortColumns[input.sortBy] || sortColumns.createdAt
  const sortDirection = input.sortOrder === 'asc' ? 'ASC' : 'DESC'
  const pageSize = Math.min(Math.max(Number(input.pageSize) || 20, 1), 100)
  const offset = Math.max(Number(input.offset) || 0, 0)

  params.push(pageSize, offset)

  const [rows] = await pool.execute(
    `SELECT
       o.id,
       o.order_no,
       o.status,
       o.total_amount,
       o.created_at
     FROM orders AS o
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${sortColumn} ${sortDirection}, o.id ${sortDirection}
     LIMIT ? OFFSET ?`,
    params
  )

  return rows
}
```

这里字符串拼接的只有后端固定模板和白名单结果，用户值仍全部参数化。

## 7. INSERT、UPDATE 与结果检查（P0）

```js
export async function createUser(input) {
  const [result] = await pool.execute(
    `INSERT INTO users (email, username, password_hash, status)
     VALUES (?, ?, ?, 'active')`,
    [input.email, input.username, input.passwordHash]
  )

  return String(result.insertId)
}
```

更新必须检查影响行数：

```js
export async function updateUsername(userId, username) {
  const [result] = await pool.execute(
    `UPDATE users
     SET username = ?
     WHERE id = ?
       AND deleted_at IS NULL`,
    [username, userId]
  )

  return result.affectedRows === 1
}
```

0 行可能表示不存在、已删除、无权限或状态不允许。Service 层应根据业务决定返回 404、409 或其他错误。

## 8. 完整事务模板（P0）

下面是教学版事务骨架，重点演示“同一连接 + 提交/回滚 + finally 释放”。调用前必须完成请求校验、合并重复商品 ID，并保证数量是正整数；不要把它未经补全直接复制为生产下单代码。

```js
export async function createOrder(input) {
  const connection = await pool.getConnection()
  let transactionStarted = false

  try {
    await connection.beginTransaction()
    transactionStarted = true

    let totalAmountInCents = 0n

    for (const item of input.items) {
      const [result] = await connection.execute(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?
           AND status = 'on_sale'
           AND deleted_at IS NULL
           AND stock >= ?`,
        [item.quantity, item.productId, item.quantity]
      )

      if (result.affectedRows !== 1) {
        throw new Error(`商品 ${item.productId} 库存不足或不可售`)
      }

      // 实际项目应从数据库锁定并读取可信价格，不能信任前端价格。
      const [products] = await connection.execute(
        `SELECT id, name, price
         FROM products
         WHERE id = ?`,
        [item.productId]
      )

      if (!products[0]) {
        throw new Error(`商品 ${item.productId} 不存在`)
      }

      item.product = products[0]
      totalAmountInCents += decimalYuanToCents(item.product.price) * BigInt(item.quantity)
    }

    const totalAmount = centsToDecimalYuan(totalAmountInCents)
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
         order_no, user_id, status, total_amount, created_at
       ) VALUES (?, ?, 'pending', ?, CURRENT_TIMESTAMP(3))`,
      [input.orderNo, input.userId, totalAmount]
    )

    for (const item of input.items) {
      await connection.execute(
        `INSERT INTO order_items (
           order_id, product_id, product_name_snapshot,
           unit_price, quantity, line_amount
         ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          item.productId,
          item.product.name,
          item.product.price,
          item.quantity,
          centsToDecimalYuan(
            decimalYuanToCents(item.product.price) * BigInt(item.quantity)
          )
        ]
      )
    }

    await connection.commit()
    return String(orderResult.insertId)
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
    }
    throw error
  } finally {
    connection.release()
  }
}
```

示例强调事务骨架。生产版本还应批量查询商品、按统一顺序扣库存、写库存流水、做幂等、处理死锁重试并验证订单号唯一性。

## 9. 金额转换（P0）

不要写 `Number('19.99') * 100` 后期待所有金额都精确。可以使用成熟十进制定点库，或在明确最多两位小数时严格转换成 BigInt 分：

```js
function decimalYuanToCents(value) {
  const matched = String(value).match(/^(\d+)(?:\.(\d{1,2}))?$/)

  if (!matched) {
    throw new TypeError('金额格式不正确')
  }

  const fraction = (matched[2] || '').padEnd(2, '0')
  return BigInt(matched[1]) * 100n + BigInt(fraction)
}

function centsToDecimalYuan(value) {
  const integer = value / 100n
  const fraction = String(value % 100n).padStart(2, '0')
  return `${integer}.${fraction}`
}
```

负数、多币种和更多精度需要更完整实现，不要超出函数已经声明的业务边界。

## 10. 错误映射（P0）

数据库错误不应原样返回客户端。常见 MySQL 错误：

- `ER_DUP_ENTRY`：唯一键冲突，通常映射 409。
- `ER_NO_REFERENCED_ROW_2`：外键目标不存在，映射为业务校验错误。
- `ER_ROW_IS_REFERENCED_2`：记录仍被引用，拒绝删除。
- `ER_LOCK_DEADLOCK`：死锁，可对满足幂等条件的事务有限重试。
- `ER_LOCK_WAIT_TIMEOUT`：锁等待超时，记录上下文并谨慎重试。

日志记录内部错误码、查询标识、请求 ID、耗时和必要上下文，但不记录密码、Token 或完整敏感参数。

## 11. Repository / Service 边界（P1）

推荐职责：

- Route/Controller：解析请求、调用 Service、组织 HTTP 响应。
- Service：权限、状态机、事务边界和跨 Repository 编排。
- Repository：SQL、参数映射和数据库结果映射。

不要在 Controller 散落 SQL，也不要让 Repository 决定用户是否有管理员权限。事务需要跨多个 Repository 时，把同一个 connection 作为参数传下去。

## 12. 测试策略（P0）

- 单元测试：测试校验、金额转换、错误映射和动态条件构造。
- 集成测试：连接真实 MySQL 测试约束、事务、SQL 结果和并发。
- 每个测试独立准备数据，并在隔离数据库运行。
- 测试唯一冲突、NULL、0 行更新、回滚、死锁/重试边界。
- 不要只 Mock 数据库后声称 SQL 已验证。

可使用 Testcontainers 启动与生产同大版本的 MySQL，减少开发机环境差异。

## 13. ORM 使用原则（P1）

ORM 提升 CRUD 和迁移效率，但必须：

- 查看生成 SQL。
- 防止懒加载导致 N+1。
- 明确事务是否复用同一连接。
- 对复杂查询允许使用原生参数化 SQL。
- 评估类型映射，尤其 BIGINT、DECIMAL、DATETIME 和 JSON。
- 不让自动同步 Schema 直接修改生产数据库。

## 14. MongoDB 对照：Mongoose 到 mysql2（P0）

MongoDB 项目中常见的 `Model.find()`、`Model.aggregate()` 和 `session.withTransaction()`，迁移到 MySQL 后可以先对应到：

| MongoDB / Mongoose | MySQL / mysql2 |
| --- | --- |
| `Model.find(filter, projection)` | `connection.execute('SELECT ... WHERE ...', params)` |
| `Model.aggregate(pipeline)` | 参数化 SQL、JOIN、CTE、GROUP BY 或窗口函数 |
| `Model.updateOne(..., { $inc })` | 条件 UPDATE，并检查 `affectedRows` |
| `session.withTransaction()` | `getConnection()`、begin、commit、rollback、release |
| Schema 校验器 | 请求校验 + MySQL 类型/约束双重保护 |

SQL 不应直接拼接成字符串来替代 MongoDB 查询对象。值继续使用 `?` 参数，列名、排序方向和表名只能来自后端白名单。ORM 可以后续使用，但先掌握 mysql2 能帮助你看懂生成 SQL 和事务连接。

## 15. 本章自检

- [ ] 能创建并复用 mysql2 连接池。
- [ ] 所有值使用参数化查询，动态标识符使用白名单。
- [ ] 能正确处理 BIGINT、DECIMAL 和时区。
- [ ] 事务始终在同一连接执行并在 finally 释放。
- [ ] 会把数据库错误转换为稳定业务错误。
