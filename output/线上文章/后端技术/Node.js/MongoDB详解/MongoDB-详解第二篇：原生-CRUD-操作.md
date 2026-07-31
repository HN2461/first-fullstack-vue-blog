---
title: "MongoDB 详解第二篇：原生 CRUD 操作"
slug: "node-js-mongodb-mongodb-crud-85922e88"
summary: "通过 mongosh 和 MongoDB Node.js Driver 两条线掌握 MongoDB 原生 CRUD，覆盖过滤条件、投影、排序、分页、更新操作符与 findOneAndUpdate 等项目常用写法。"
category: "MongoDB详解"
tags:
  - "MongoDB"
  - "CRUD"
  - "mongosh"
  - "Node.js Driver"
  - "查询操作符"
  - "更新操作符"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291e8a2b1c68f2cac148"
originalSlug: "node-js-mongodb-mongodb-crud-85922e88"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# MongoDB 详解第二篇：原生 CRUD 操作

> 这一篇是 MongoDB 的硬基础。后面你在 Mongoose 里写的大部分查询，本质上都只是把这里的思想换了一层 API。为了让小白更容易看懂，这一篇的代码我尽量都写成“边看边懂”的注释风格。

---

## 一、先准备一批练习数据

连接数据库后，先切到练习库：

```javascript
// use 的意思是“切换到某个数据库”
// 如果数据库还不存在，也没关系
// 等你第一次真正插入数据时，这个库就会被创建出来
use learn_mongodb
```

插入几条用户数据：

```javascript
// 往 users 集合里一次插入多条文档
db.users.insertMany([
  {
    username: 'haonan', // 用户名
    age: 26, // 年龄
    role: 'admin', // 角色
    city: '上海', // 所在城市
    tags: ['node', 'mongodb'], // 标签数组
    score: 95, // 分数
    isActive: true, // 是否启用
    createdAt: new Date('2026-06-01T10:00:00Z') // 创建时间
  },
  {
    username: 'xiaoyu',
    age: 23,
    role: 'user',
    city: '杭州',
    tags: ['vue', 'css'],
    score: 82,
    isActive: true,
    createdAt: new Date('2026-06-02T10:00:00Z')
  },
  {
    username: 'laoli',
    age: 31,
    role: 'user',
    city: '北京',
    tags: ['java', 'mysql'],
    score: 76,
    isActive: false,
    createdAt: new Date('2026-06-03T10:00:00Z')
  }
])
```

这一批数据够你把绝大多数基础查询练通。

---

## 二、Create：插入数据

### 2.1 插入一条

```javascript
// insertOne 表示“插入一条”
// db.users 指的是当前数据库里的 users 集合
db.users.insertOne({
  username: 'new-user',
  age: 20,
  role: 'user',
  createdAt: new Date() // new Date() 表示“现在这个时间”
})
```

要点：

- MongoDB 会自动生成 `_id`
- 返回结果里会有 `insertedId`

### 2.2 批量插入

```javascript
// insertMany 表示“插入多条”
// 适合初始化测试数据、批量导入数据
db.users.insertMany([
  { username: 'u1', age: 18, role: 'user' },
  { username: 'u2', age: 19, role: 'user' }
])
```

### 2.3 项目里该怎么想

插入数据时，不要只想着“能存进去就行”，还要同步考虑：

- 哪些字段必填
- 哪些字段需要默认值
- 哪些字段未来要筛选或排序
- 哪些字段应该建索引

这些在后面用 Mongoose 时会体现得更明显。

---

## 三、Read：查询数据

### 3.1 查全部

```javascript
// find() 表示查询多条
// 什么条件都不传，就表示“把所有数据都查出来”
db.users.find()
```

这会返回游标结果。在 mongosh 里你能直接看到文档列表。

### 3.2 查一条

```javascript
// findOne() 表示“只拿第一条匹配结果”
// 这里的意思是：找到 username 等于 haonan 的那条用户数据
db.users.findOne({ username: 'haonan' })
```

`findOne()` 的语义很直接：只拿第一条匹配结果。

### 3.3 条件过滤

```javascript
// 只查角色是 user 的用户
db.users.find({ role: 'user' })
```

多个条件默认就是“并且”关系：

```javascript
// 同时满足两个条件：
// 1. role 是 user
// 2. isActive 是 true
db.users.find({
  role: 'user',
  isActive: true
})
```

### 3.4 常用查询操作符

```javascript
// 查年龄大于 25 的用户
db.users.find({ age: { $gt: 25 } })

// 查年龄在 18 到 30 之间的用户（包含 18 和 30）
db.users.find({ age: { $gte: 18, $lte: 30 } })

// 查城市在“上海”或“杭州”里的用户
db.users.find({ city: { $in: ['上海', '杭州'] } })

// 查角色不是 admin 的用户
db.users.find({ role: { $ne: 'admin' } })

// 查用户名里包含 hao 的用户
// $options: 'i' 表示忽略大小写
db.users.find({ username: { $regex: 'hao', $options: 'i' } })
```

项目里最常见的 6 个操作符，先重点掌握：

- `$gt` 大于
- `$gte` 大于等于
- `$lt` 小于
- `$lte` 小于等于
- `$in` 在某个集合里
- `$regex` 模糊匹配

### 3.5 逻辑条件

```javascript
// $or 表示“满足其中一个条件就行”
// 也就是：城市是上海 或者 杭州，都算匹配
db.users.find({
  $or: [
    { city: '上海' },
    { city: '杭州' }
  ]
})
```

### 3.6 数组字段查询

```javascript
// tags 是数组
// 只要 tags 数组里包含 node，这条文档就会被查出来
db.users.find({ tags: 'node' })

// $all 表示“必须同时包含这些值”
// 这里表示：tags 里既要有 node，也要有 mongodb
db.users.find({ tags: { $all: ['node', 'mongodb'] } })
```

如果字段是数组，只要包含目标值，就能匹配成功。

---

## 四、投影、排序、分页，这 3 个是列表页必会组合

### 4.1 投影 projection

只返回你需要的字段：

```javascript
// find 的第一个参数是查询条件
// 第二个参数是“返回哪些字段”
db.users.find(
  { role: 'user' }, // 先找出 role 是 user 的人
  { username: 1, city: 1, _id: 0 } // 只返回 username、city，并且隐藏 _id
)
```

这意味着：

- 返回 `username`
- 返回 `city`
- 不返回 `_id`

### 4.2 排序 sort

```javascript
// sort 表示排序
// createdAt: -1 表示按创建时间倒序
// 倒序的意思就是：最新的放前面
db.users.find().sort({ createdAt: -1 })
```

- `1` 表示升序
- `-1` 表示降序

### 4.3 分页 skip + limit

```javascript
// 这段的意思是：
// 1. 先把所有用户查出来
// 2. 按创建时间从新到旧排序
// 3. 不跳过任何数据
// 4. 只拿前 10 条
db.users.find()
  .sort({ createdAt: -1 })
  .skip(0)
  .limit(10)
```

第 2 页通常是：

```javascript
// 假设当前要查第 2 页，每页 10 条
const page = 2
const pageSize = 10

db.users.find()
  .sort({ createdAt: -1 }) // 先保证排序稳定
  .skip((page - 1) * pageSize) // 第 2 页要跳过前 10 条
  .limit(pageSize) // 然后再拿 10 条
```

### 4.4 统计总数

```javascript
// countDocuments 用来统计有多少条符合条件的数据
// 这里表示：统计 role 是 user 的用户总共有多少个
db.users.countDocuments({ role: 'user' })
```

项目里做分页时，一般是：

1. 查当前页列表
2. 再查总数

这样前端才能知道总页数。

---

## 五、Update：更新数据

### 5.1 更新一条

```javascript
// updateOne 表示“只更新第一条匹配的数据”
db.users.updateOne(
  { username: 'haonan' }, // 先找到 username 是 haonan 的用户
  { $set: { city: '苏州' } } // 再把 city 改成 苏州
)
```

### 5.2 更新多条

```javascript
// updateMany 表示“更新所有符合条件的数据”
db.users.updateMany(
  { role: 'user' }, // 找到所有角色是 user 的用户
  { $set: { isActive: true } } // 统一改成启用状态
)
```

### 5.3 必会的更新操作符

```javascript
// 一次更新里可以同时做多个动作
db.users.updateOne(
  { username: 'haonan' }, // 先定位用户
  {
    $set: { city: '南京' }, // 把城市改成南京
    $inc: { score: 5 }, // 分数 +5
    $push: { tags: 'backend' } // 往 tags 数组末尾追加一个 backend
  }
)
```

最常用的是这几个：

- `$set` 设置字段值
- `$inc` 数字递增
- `$push` 往数组追加一个值
- `$addToSet` 追加但不重复
- `$pull` 从数组移除值
- `$unset` 删除字段

例如：

```javascript
// $addToSet 和 $push 很像
// 但它会自动避免重复
db.users.updateOne(
  { username: 'haonan' },
  { $addToSet: { tags: 'mongodb' } }
)
```

`$addToSet` 很适合标签去重场景。

### 5.4 findOneAndUpdate

项目里非常常用，因为它能“查到并更新”一步完成：

```javascript
db.users.findOneAndUpdate(
  { username: 'haonan' }, // 先找到这个人
  { $set: { city: '深圳' } }, // 再把城市改成深圳
  {
    returnDocument: 'after' // 返回更新后的文档，而不是更新前的旧文档
  }
)
```

这里要特别注意：

- `returnDocument: 'after'` 表示返回更新后的文档
- 如果不写，很多人会误以为返回的是新值，结果拿到旧文档

这也是很多旧教程容易写混的点。

---

## 六、Delete：删除数据

### 6.1 删除一条

```javascript
// deleteOne 表示删除第一条匹配的数据
db.users.deleteOne({ username: 'u1' })
```

### 6.2 删除多条

```javascript
// deleteMany 表示删除所有符合条件的数据
db.users.deleteMany({ isActive: false })
```

### 6.3 真实项目里更常见的是软删除

不要上来就真删，很多项目更喜欢这样：

```javascript
// 这不是直接删数据
// 而是给数据打一个“已删除”标记
db.users.updateOne(
  { username: 'laoli' },
  {
    $set: {
      isDeleted: true, // 标记为已删除
      deletedAt: new Date() // 记录删除时间
    }
  }
)
```

优点：

- 可恢复
- 方便审计
- 不容易误删造成业务事故

---

## 七、用官方 Node.js Driver 写同样的 CRUD

在 Node.js 项目里，如果你不用 Mongoose，就直接用官方驱动：

```javascript
import { MongoClient } from 'mongodb'

// 创建 MongoDB 客户端
// 这里的地址表示：连接本机 27017 端口上的 MongoDB 服务
const client = new MongoClient('mongodb://127.0.0.1:27017')

// 真正发起连接
await client.connect()

// 选择数据库
const db = client.db('learn_mongodb')

// 选择集合
const users = db.collection('users')

// 插入一条数据
await users.insertOne({
  username: 'driver-user',
  role: 'user',
  createdAt: new Date()
})

// 开始查询：
// 1. 先找出 role 是 user 的用户
// 2. 只保留 username 和 role
// 3. 按创建时间倒序
// 4. 只取前 10 条
// 5. toArray() 把查询结果真正转成数组
const list = await users
  .find({ role: 'user' })
  .project({ username: 1, role: 1 })
  .sort({ createdAt: -1 })
  .limit(10)
  .toArray()

// 打印查询结果，方便调试
console.log(list)

// 用完后主动关闭连接
await client.close()
```

这段代码主人一定要读懂，因为它帮你建立一个认知：

Mongoose 是更高级的业务工具，但 MongoDB 官方驱动才是更底层的真实操作接口。

---

## 八、小白最容易踩的 6 个坑

### 8.1 把 `_id` 当普通字符串乱比

在 shell 里经常能直接看到字符串形态，但项目里要分清数据库字段实际类型。

### 8.2 用 `find()` 却以为只返回一条

`find()` 返回的是结果集，不是单个文档。

### 8.3 忘记排序就分页

分页前最好先有稳定排序条件，否则翻页结果可能不稳定。

### 8.4 更新时忘记用操作符

下面这种写法是错的：

```javascript
// 这是错的，因为 updateOne 的第二个参数应该是“更新操作符对象”
db.users.updateOne(
  { username: 'haonan' },
  { city: '北京' }
)
```

更新文档要配合 `$set` 等更新操作符。

### 8.5 把正则搜索当全文搜索

`$regex` 能做模糊匹配，但它不等于专业全文搜索。

如果是更复杂的搜索场景，后期要考虑：

- 文本索引
- Atlas Search

### 8.6 删除数据过于直接

很多业务数据不应该一上来就 `deleteOne()` 真删。

---

## 九、小结

这一篇你至少要熟练掌握下面这些组合：

1. `find + projection + sort + skip + limit`
2. `updateOne + $set/$inc/$push/$addToSet`
3. `findOneAndUpdate + returnDocument: 'after'`
4. `countDocuments()` 做分页统计
5. 用官方 Node.js Driver 完成最基本的连接与查询

### 官方资料

- MongoDB CRUD: https://www.mongodb.com/docs/manual/crud/
- Query Documents: https://www.mongodb.com/docs/manual/tutorial/query-documents/
- Update Documents: https://www.mongodb.com/docs/manual/tutorial/update-documents/
- Delete Documents: https://www.mongodb.com/docs/manual/tutorial/remove-documents/
- Node.js Driver CRUD: https://www.mongodb.com/docs/drivers/node/current/crud/

**下一篇**：进入 Mongoose，把“能操作数据库”升级成“能做项目建模”。
