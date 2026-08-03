---
title: "第 6 篇：MongoDB 索引优化与事务：explain、复合索引、ESR、TTL、Mongoose 事务"
slug: "node-js-mongodb-5c500e8d"
summary: "MongoDB 索引优化与事务实践，覆盖 explain、常见索引类型、复合索引顺序、ESR 思路、TTL 索引、事务边界和 Node.js/Mongoose 写法。"
category: "MongoDB详解"
categoryPath:
  - "后端技术"
  - "Node.js"
  - "MongoDB详解"
tags:
  - "MongoDB"
  - "索引"
  - "性能优化"
  - "事务"
  - "复合索引"
  - "TTL"
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d291e8a2b1c68f2cac15c"
originalSlug: "node-js-mongodb-5c500e8d"
originalStatus: "published"
publishedAt: "2026-06-07T06:13:44.590Z"
updatedAt: "2026-07-31T11:16:21.940Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 6 篇：MongoDB 索引优化与事务：explain、复合索引、ESR、TTL、Mongoose 事务

> 学 MongoDB 到这里，开始接触真正决定“项目跑得快不快、数据稳不稳”的部分。很多人会 CRUD，但一上生产就慢、就乱，通常都栽在索引和事务理解不够。

---

## 一、先记住一句最重要的话

不是“查得慢了就加索引”，而是：

查询模式应该反推索引设计。

也不是“怕不一致就全上事务”，而是：

先理解 MongoDB 的单文档原子性，再判断是否真的需要多文档事务。

---

## 二、索引为什么重要

没有索引时，数据库往往只能做全集合扫描。

全集合扫描可以理解成：

> 数据库不知道目标数据在哪里，只能从第一条看到最后一条。

如果你的 `users` 集合只有 20 条数据，这不明显；如果有 200 万条，就会非常慢。

索引的作用，就是给某些字段建立一份“方便查找的目录”。比如你经常通过邮箱登录：

```javascript
User.findOne({ email })
```

那 `email` 就很像一本书后面的关键词索引。数据库不用每一页都翻，而是先通过索引快速定位可能的数据位置。

例如：

```javascript
// 这是最普通的一条查询
// 如果 email 没有索引，MongoDB 可能要一条条扫描
db.users.find({ email: 'haonan@example.com' })
```

如果 `email` 没索引，数据量大了以后就会变慢。

所以你做项目时应该优先识别这些“天然索引候选”：

- 登录字段：`email`、`phone`
- 详情定位字段：`slug`、`orderNo`
- 列表条件字段：`author`、`status`
- 排序字段：`createdAt`

但这里不要理解成“这些字段一定全部建索引”。真正的意思是：当这些字段频繁出现在查询条件或排序里时，它们才有资格成为索引候选。

---

## 三、怎么判断查询有没有走索引

最常用的方法就是 `explain()`：

```javascript
db.articles.find({
  author: ObjectId('68426d4d4706fa0f58f47f4a'), // 先按作者筛
  status: 'published'
}).sort({
  createdAt: -1 // 再按创建时间倒序
}).explain('executionStats')
```

重点看这些信息：

- `winningPlan`
- `totalDocsExamined`
- `totalKeysExamined`
- `executionTimeMillis`

这几个词先不要怕，按小白视角可以这样看：

- `winningPlan`：MongoDB 最终选择的执行方案
- `totalDocsExamined`：真正检查了多少条文档
- `totalKeysExamined`：检查了多少个索引键
- `executionTimeMillis`：这次查询大概花了多少毫秒

如果 `totalDocsExamined` 很大，而实际返回很少，就说明数据库为了找几条数据翻了很多文档。

如果你看到明显的 `COLLSCAN`，往往说明：

- 没有合适索引
- 或者查询条件与索引顺序不匹配

这里最常见的两个词是：

- `COLLSCAN`：Collection Scan，扫集合，通常代表没用好索引
- `IXSCAN`：Index Scan，扫索引，通常代表用上了某个索引

不是说看到 `IXSCAN` 就一定完美，也不是说小数据量看到 `COLLSCAN` 就一定灾难。你现在先建立第一层判断就够了：

> 大集合、高频接口里，如果 explain 显示大量扫文档，就要认真检查索引。

---

## 四、最常见的索引类型

### 4.1 单字段索引

```javascript
// createIndex() 表示手动创建索引
// email: 1 表示按 email 升序建索引
// unique: true 表示邮箱值不能重复
db.users.createIndex({ email: 1 }, { unique: true })
```

适合：

- 唯一登录字段
- 单字段高频筛选

### 4.2 复合索引

```javascript
// 这是一个复合索引
// 它服务的就是“作者 + 状态 + 时间排序”这类列表查询
db.articles.createIndex({ author: 1, status: 1, createdAt: -1 })
```

这类索引特别适合后台列表：

- 先按作者筛选
- 再按状态筛选
- 最后按创建时间倒序

### 4.3 TTL 索引

```javascript
db.loginTokens.createIndex(
  { expireAt: 1 }, // 按 expireAt 字段建索引
  { expireAfterSeconds: 0 } // 到了这个时间点就允许自动过期
)
```

适合：

- 验证码
- 登录令牌
- 临时缓存
- 一段时间后自动清理的数据

### 4.4 文本索引

适合简单全文搜索，但项目里不要把它和正则、Atlas Search 混为一谈。

---

## 五、复合索引最重要的是顺序

MongoDB 官方索引设计里很重要的一条经验，就是常见的 ESR 思路：

- `E`：Equality，等值匹配
- `S`：Sort，排序
- `R`：Range，范围查询

这不是死板口诀，而是一种设计方向。

先把这三个词翻译一下：

- 等值匹配：字段等于某个确定值，比如 `status: 'published'`
- 排序：按某个字段升序或倒序，比如 `createdAt: -1`
- 范围查询：大于、小于、某个时间之后，比如 `createdAt: { $gte: someDate }`

复合索引的难点就在于：它不是把字段随便堆在一起。字段顺序会影响 MongoDB 能不能顺着索引一路查下去。

比如你经常查：

```javascript
{
  author: xxx, // 等值条件
  status: 'published',
  createdAt: { $gte: someDate } // 范围条件
}
```

并按时间倒序：

```javascript
sort({ createdAt: -1 })
```

那么索引通常应该围绕“等值条件在前，排序字段靠前，范围条件谨慎安排”来设计，而不是随便把字段拼一起。

### 5.1 用博客列表举个更具体的例子

假设后台有一个“我的文章”页面，查询逻辑是：

```javascript
Article.find({
  author: userId,
  status: 'published'
}).sort({ createdAt: -1 })
```

这时比较合理的索引是：

```javascript
{ author: 1, status: 1, createdAt: -1 }
```

为什么？

1. `author` 是等值条件：先锁定“我的文章”
2. `status` 也是等值条件：再锁定“已发布”
3. `createdAt` 是排序字段：最后按时间倒序取列表

你可以把复合索引想成一个按多列排好的通讯录。它先按作者分组，再按状态分组，最后在同一组里按时间排好。这样数据库找列表时就顺很多。

### 5.2 为什么不能乱排

如果你建成：

```javascript
{ createdAt: -1, status: 1, author: 1 }
```

它不是完全没用，但很可能不适合上面的查询。因为数据库先按时间排，作者和状态反而排在后面，不能很好地先缩小“某个作者 + 某个状态”的范围。

所以你设计复合索引时，先不要背太多规则，先问自己：

1. 这个接口最常用的筛选条件是什么？
2. 哪些条件是等于某个确定值？
3. 结果要按哪个字段排序？
4. 有没有大于、小于、时间区间这种范围条件？

---

## 六、Mongoose 里怎么声明索引

```javascript
// 在 Mongoose 模型里声明索引
articleSchema.index({ author: 1, status: 1, createdAt: -1 })
userSchema.index({ email: 1 }, { unique: true })
```

主人这里要注意两点：

1. `unique: true` 更接近“唯一索引声明”，不是普通业务校验的替代品
2. 索引声明写在模型里，不代表你就不用理解它的真实数据库行为

---

## 七、常见查询场景怎么反推索引

### 7.1 登录

```javascript
// 登录时最常见的一条查询
User.findOne({ email })
```

索引通常就是：

```javascript
{ email: 1 }
```

### 7.2 我的文章列表

```javascript
Article.find({
  author: userId, // 当前用户
  status: 'published'
}).sort({ createdAt: -1 })
```

索引通常就是：

```javascript
{ author: 1, status: 1, createdAt: -1 }
```

### 7.3 按过期时间清理临时数据

索引通常就是 TTL：

```javascript
// expireAt 一般会存一条“什么时候过期”的时间
{ expireAt: 1 }
```

---

## 八、索引不是越多越好

索引会带来这些成本：

- 占空间
- 插入更慢
- 更新更慢
- 维护成本上升

所以正确做法不是“可能会查到的字段全建索引”，而是：

只为高频且明确的查询模式设计索引。

新手常见误解是：

> 索引能加速查询，那我多建几个肯定更快。

问题在于，每次插入或更新数据时，MongoDB 不只要改文档本身，还要维护相关索引。索引越多，写入时要维护的“目录”也越多。

所以项目里更健康的流程是：

1. 先写出真实接口
2. 找出高频查询和慢查询
3. 用 `explain()` 看它怎么执行
4. 针对查询模式建索引
5. 再用 `explain()` 验证是否改善

这比“凭感觉给每个字段建索引”可靠得多。

---

## 九、MongoDB 事务先别神化，先理解原子性边界

非常关键的一点：

MongoDB 单文档写操作本身就是原子的。

原子性可以先理解成：

> 一次操作要么完整成功，要么不发生一半。

MongoDB 对单条文档的一次写入有这个保障。也就是说，如果你的业务只改一条文档，并且一次更新语句就能表达清楚，很多时候不用事务。

这意味着：

- 如果一个业务动作只改一条文档
- 并且这个修改能用一次更新完成

很多时候你根本不需要事务。

例如：

```javascript
db.wallets.updateOne(
  { _id: walletId, balance: { $gte: 100 } }, // 只有余额够 100 才允许扣
  { $inc: { balance: -100 } } // 一次更新里把余额减 100
)
```

像这种单文档扣减，本身就有很强的一致性保障。

这里 `{ _id: walletId, balance: { $gte: 100 } }` 很关键。它不是先查余额再扣，而是在同一次更新里告诉数据库：

> 只有这条钱包余额大于等于 100 时，才允许扣 100。

这样能避免两个请求同时进来时都以为余额够的问题。

---

## 十、什么时候真的需要事务

真正适合事务的，是“多个文档必须一起成功或一起失败”的场景。

比如：

- 转账：扣 A 加 B
- 下单：写订单同时扣库存
- 退款：改订单状态同时写资金流水

这类场景如果只成功一半，就会出现业务错误。

比如转账：

1. A 的钱包扣 100
2. B 的钱包加 100
3. 写一条转账流水

这三步只成功第一步就很严重：A 钱少了，B 没收到，流水也没有记录。

这就是事务要解决的问题：

> 把多次数据库操作放进同一个边界里，要么都成功，要么都回滚。

但反过来，如果只是改一篇文章的标题，或者给一篇文章阅读量加 1，通常没必要上事务。

---

## 十一、官方 Node.js Driver 的事务写法

```javascript
// 开启一个会话
const session = client.startSession()

try {
  await session.withTransaction(async () => {
    await wallets.updateOne(
      { _id: fromId, balance: { $gte: 100 } }, // 转出方先扣钱
      { $inc: { balance: -100 } },
      { session } // 一定要把 session 传进去
    )

    await wallets.updateOne(
      { _id: toId }, // 转入方加钱
      { $inc: { balance: 100 } },
      { session }
    )

    await transferLogs.insertOne(
      {
        fromId,
        toId,
        amount: 100,
        createdAt: new Date()
      },
      { session } // 日志写入也要放进同一个事务
    )
  })
} finally {
  // 不管成功还是失败，最后都把 session 关掉
  await session.endSession()
}
```

这段代码里最重要的不是语法，而是这个意识：

事务里的每一步数据库操作都必须显式带上 `session`。

你可以把 `session` 理解成这次事务的“同一张票”。所有要进入同一个事务的操作，都要拿着这张票进去。

如果某一步忘了传 `{ session }`，它就可能跑到事务外面去了。这样你以为它能一起回滚，实际上它可能已经单独提交了。

所以读事务代码时，最先检查的不是业务逻辑多复杂，而是：

> 事务里的每个数据库操作有没有都带上同一个 `session`？

---

## 十二、Mongoose 里的事务写法

```javascript
// Mongoose 里也要先开启 session
const session = await mongoose.startSession()

try {
  await session.withTransaction(async () => {
    await Wallet.updateOne(
      { _id: fromId, balance: { $gte: 100 } }, // 转出方扣钱
      { $inc: { balance: -100 } },
      { session }
    )

    await Wallet.updateOne(
      { _id: toId }, // 转入方加钱
      { $inc: { balance: 100 } },
      { session }
    )

    await TransferLog.create(
      [
        {
          fromId,
          toId,
          amount: 100
        }
      ],
      { session } // create 也要显式传 session
    )
  })
} finally {
  await session.endSession()
}
```

---

## 十三、事务里一个特别容易忽略的官方限制

官方驱动和 Mongoose 文档都强调：

不要在事务里并行执行操作，比如 `Promise.all()`。

这里特别容易误解。普通接口里，`Promise.all()` 经常用来并行查数据，比如一边查列表，一边查总数。第四篇里分页查询就是这种思路。

但事务里不要这样做，因为事务依赖同一个 `session` 管理一组有顺序、有边界的操作。并行操作会让事务状态变复杂，官方也明确不支持这种写法。

也就是说，下面这种写法不要用：

```javascript
await session.withTransaction(async () => {
  await Promise.all([
    // 这种并行写法在事务里不要用
    Wallet.updateOne({ _id: fromId }, { $inc: { balance: -100 } }, { session }),
    Wallet.updateOne({ _id: toId }, { $inc: { balance: 100 } }, { session })
  ])
})
```

正确思路是顺序执行。

这是很多旧教程和很多“想当然优化”的代码最容易犯错的地方。

你可以记成：

- 普通只读接口：可以根据场景用 `Promise.all()`
- 事务内部：老老实实 `await` 一步，再执行下一步

---

## 十四、索引与事务放到项目里怎么落地

如果你做的是“笔记系统”或“博客后台”这类项目，通常会这样分层理解：

### 14.1 高频列表页

重点是索引，不是事务。

### 14.2 登录与查详情

重点是唯一索引和单文档更新。

### 14.3 订单、积分、库存

重点是判断是否存在跨文档一致性需求，再决定事务。

---

## 十五、小结

这一篇的核心不是“背多少索引名词”，而是建立正确判断：

1. 查询模式反推索引
2. 明白 `COLLSCAN` 是扫集合，`IXSCAN` 是扫索引
3. 用 `explain()` 验证，不靠猜
4. 复合索引顺序比“有没有索引”更重要
5. 单文档操作先利用原子性，不要一上来就全套事务
6. 多文档必须一起成功或失败时，再考虑事务
7. 真用事务时，所有操作都要带 `session`
8. 事务里不要 `Promise.all()`

### 官方资料

- Indexes: https://www.mongodb.com/docs/manual/indexes/
- Compound Indexes: https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/
- Query Plans / explain: https://www.mongodb.com/docs/manual/reference/explain-results/
- Transactions: https://www.mongodb.com/docs/manual/core/transactions/
- Node.js Driver Transactions: https://www.mongodb.com/docs/drivers/node/current/fundamentals/transactions/
- Mongoose Transactions: https://mongoosejs.com/docs/transactions.html

**下一篇**：把前面 6 篇真正组装成一个可做项目的 Express + MongoDB 后端实战。
