---
title: "第 7 篇：Express + MongoDB 完整项目实战：建模、鉴权、分页搜索、软删除"
slug: "node-js-mongodb-f251a01d"
summary: "Express + MongoDB + Mongoose 完整项目实战，覆盖项目结构、数据库连接、模型设计、JWT 鉴权、索引、分页搜索和软删除。"
category: "MongoDB详解"
categoryPath:
  - "后端技术"
  - "Node.js"
  - "MongoDB详解"
tags:
  - "MongoDB"
  - "Mongoose"
  - "Express"
  - "JWT"
  - "项目实战"
  - "分页搜索"
  - "软删除"
status: "published"
sortOrder: 70
cover: ""
originalId: "6a2d291e8a2b1c68f2cac136"
originalSlug: "node-js-mongodb-f251a01d"
originalStatus: "published"
publishedAt: "2026-06-06T11:39:25.707Z"
updatedAt: "2026-07-31T11:16:21.948Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 7 篇：Express + MongoDB 完整项目实战：建模、鉴权、分页搜索、软删除

> 前面 6 篇讲的是能力点，这一篇讲的是“怎么把这些能力组织成一个像样的项目”。目标不是炫技，而是做一个你学完后真的能自己复刻、改造、继续扩展的后端 API。

---

## 一、项目目标

我们做一个笔记系统 API，覆盖下面这些真实功能：

- 注册
- 登录
- 创建笔记
- 修改笔记
- 删除笔记（软删除）
- 列表分页
- 关键词搜索
- 标签筛选
- 查询自己的单篇笔记

这套功能足够把 MongoDB 在中小型内容系统里的核心能力串起来。

---

## 二、先看一张“原生 vs Mongoose”对照表

很多小白看到第七篇会卡住，不是因为项目太难，而是因为前面第二篇学的是 MongoDB 原生思路，后面第三、四、七篇大量出现的是 Mongoose 写法。

这两套不是谁对谁错，而是“同一件事在不同层级的写法”。

你可以先这样理解：

- MongoDB 原生：更像直接对数据库本体说话
- Mongoose：更像在 Node.js 项目里通过模型层说话

### 2.1 常见命令对照

| 你想做什么 | MongoDB 原生 | Mongoose |
| --- | --- | --- |
| 查多条 | `db.users.find({ role: 'user' })` | `User.find({ role: 'user' })` |
| 查一条 | `db.users.findOne({ username: 'haonan' })` | `User.findOne({ username: 'haonan' })` |
| 按 id 查 | `db.users.findOne({ _id: ObjectId('...') })` | `User.findById(id)` |
| 插入一条 | `db.users.insertOne({ ... })` | `User.create({ ... })` |
| 插入多条 | `db.users.insertMany([{ ... }, { ... }])` | `User.insertMany([{ ... }, { ... }])` |
| 更新一条 | `db.users.updateOne({ ... }, { $set: { ... } })` | `User.updateOne({ ... }, { $set: { ... } })` |
| 查到并更新 | `db.users.findOneAndUpdate(...)` | `User.findOneAndUpdate(...)` |
| 删除一条 | `db.users.deleteOne({ ... })` | `User.deleteOne({ ... })` |
| 分页排序 | `find().sort().skip().limit()` | `find().sort().skip().limit()` |
| 关联查询 | 聚合里的 `$lookup` | `.populate()` |
| 统计汇总 | `aggregate([...])` | `Model.aggregate([...])` |

### 2.2 为什么很多写法看起来像，但又不完全一样

因为 Mongoose 本质上是建立在 MongoDB 驱动和 MongoDB 能力之上的。

也就是说：

- 底层数据库能做什么，Mongoose 大多也能做
- 但 Mongoose 会额外给你一层更适合业务开发的模型能力

例如：

- 你在原生里更多是直接操作集合 `db.users`
- 你在 Mongoose 里更多是操作模型 `User`
- 你在原生里要自己保证数据结构尽量规范
- 你在 Mongoose 里可以用 `Schema`、校验、默认值、中间件来帮你约束

### 2.3 一眼记住的区别

主人只要先记住下面这句就够了：

- 第二篇偏“数据库到底怎么工作”
- 第三、四、七篇偏“项目里怎么更舒服地使用数据库”

### 2.4 结合一个最小例子理解

原生写法：

```javascript
// 直接对 users 集合操作
db.users.insertOne({
  username: 'haonan',
  email: 'haonan@example.com'
})
```

Mongoose 写法：

```javascript
// 先通过 User 这个模型操作
await User.create({
  username: 'haonan',
  email: 'haonan@example.com'
})
```

它们的目标其实一样，都是“插入一条用户数据”。

区别在于：

- 原生更贴近数据库本体
- Mongoose 更贴近项目代码组织

### 2.5 在这一篇里你该怎么读代码

建议主人这样读：

1. 如果看到 `User`、`Note`、`Article` 这种大写名词，先把它当成“模型”
2. 如果看到 `find()`、`findOne()`、`sort()`、`skip()`、`limit()`，就把它和第二篇的原生思路对上
3. 如果看到 `Schema`、`pre('save')`、`populate()`、`lean()`，就知道这是 Mongoose 额外提供的工程化能力

这样你就不会再觉得“怎么前后命令不一样”，而会知道“这是同一类操作在不同层的写法”。

---

## 三、项目结构建议

```text
notes-api/
├── src/
│   ├── config/
│   │   └── env.js
│   ├── db/
│   │   └── connect.js
│   ├── models/
│   │   ├── User.js
│   │   └── Note.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── note.routes.js
│   ├── services/
│   │   └── auth.service.js
│   └── app.js
└── server.js
```

为什么这样拆：

- 模型负责数据结构
- 路由负责接口入口
- 中间件负责通用逻辑
- service 负责可复用业务逻辑

这会比把所有内容塞进一个文件更适合后期扩展。

---

## 四、依赖与运行时建议

这类项目建议使用：

- 较新的 Node.js LTS
- 当前兼容的 Mongoose 版本
- MongoDB 本地环境或 Atlas

常见依赖：

```bash
npm install express mongoose bcrypt jsonwebtoken dotenv
```

如果你后面想补更完整的工程能力，再继续加：

- `morgan`
- `cors`
- `helmet`
- `express-rate-limit`
- `zod` 或 `joi`

---

## 五、先把连接层写稳

```javascript
// src/db/connect.js
import mongoose from 'mongoose'

export async function connectDB(uri) {
  // 用传进来的连接字符串连接数据库
  // serverSelectionTimeoutMS 表示“如果连不上，最多等 5 秒”
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  })

  // 连接成功后打印一行提示，方便我们确认服务状态
  console.log('MongoDB connected')
}
```

入口文件：

```javascript
// server.js
import { config } from 'dotenv'
import app from './src/app.js'
import { connectDB } from './src/db/connect.js'

// 读取 .env 文件里的环境变量
config()

// 端口优先读环境变量，没有就默认 3000
const port = process.env.PORT || 3000

// 数据库连接地址优先读环境变量
// 本地学习时就回退到本机 MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notes_api'

// 先连数据库，连上之后再启动服务
await connectDB(mongoUri)

app.listen(port, () => {
  console.log(`server started: http://127.0.0.1:${port}`)
})
```

---

## 六、User 模型：把账号系统最核心的规则放进去

```javascript
// src/models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, '用户名不能为空'], // 不传就报错
      trim: true, // 自动去掉首尾空格
      minlength: [2, '用户名至少 2 个字符'], // 最少 2 个字符
      maxlength: [20, '用户名最多 20 个字符'] // 最多 20 个字符
    },
    email: {
      type: String,
      required: [true, '邮箱不能为空'],
      trim: true, // 去掉首尾空格
      lowercase: true, // 存库前自动转小写
      unique: true, // 邮箱做唯一索引，避免重复注册
      match: [/^\S+@\S+\.\S+$/, '邮箱格式不正确'] // 基础邮箱格式校验
    },
    password: {
      type: String,
      required: [true, '密码不能为空'],
      minlength: [6, '密码至少 6 位'],
      select: false // 默认查询时不把 password 带出来
    }
  },
  {
    timestamps: true, // 自动维护 createdAt 和 updatedAt
    versionKey: false
  }
)

userSchema.pre('save', async function () {
  // 如果这次没有改 password，就不要重复加密
  if (!this.isModified('password')) {
    return
  }

  // 把明文密码变成哈希值再存库
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = function (plainPassword) {
  // 登录时拿用户输入的明文密码和数据库里的哈希密码做比对
  return bcrypt.compare(plainPassword, this.password)
}

userSchema.set('toJSON', {
  transform(doc, ret) {
    // 接口返回用户信息时，主动把 password 删掉
    delete ret.password
    return ret
  }
})

export const User = mongoose.model('User', userSchema)
```

这里有两个项目级好习惯：

1. `password` 默认 `select: false`
2. 加密逻辑放模型层，不要分散在每个接口里

---

## 七、Note 模型：围绕真实查询场景建模

```javascript
// src/models/Note.js
import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
      maxlength: [120, '标题不能超过 120 个字符']
    },
    content: {
      type: String, // 笔记正文
      default: ''
    },
    tags: {
      type: [String], // 标签数组，例如 ['MongoDB', '后端']
      default: []
    },
    author: {
      type: mongoose.Schema.Types.ObjectId, // 这里存的是用户 _id
      ref: 'User', // ref 表示它关联 User 模型
      required: true
    },
    isDeleted: {
      type: Boolean, // 软删除标记
      default: false
    },
    deletedAt: Date // 记录删除时间
  },
  {
    timestamps: true,
    versionKey: false
  }
)

// 常见查询：查“某个作者的笔记”，并按创建时间倒序
noteSchema.index({ author: 1, createdAt: -1 })

// 常见查询：查“某个作者 + 某个标签”的笔记
noteSchema.index({ author: 1, tags: 1, createdAt: -1 })

// 文本索引：后面可以支持标题/正文搜索
noteSchema.index({ title: 'text', content: 'text' })

noteSchema.pre(/^find/, function () {
  // 先拿到这次查询本来带的过滤条件
  const filter = this.getFilter()

  // 如果业务层没有明确指定 isDeleted 条件
  // 就默认帮你过滤掉已删除的数据
  if (filter.isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } })
  }
})

export const Note = mongoose.model('Note', noteSchema)
```

这里你能看到前面几篇的能力已经合体了：

- 字段校验
- 引用作者
- 软删除
- 文本索引
- 复合索引

---

## 八、JWT 鉴权中间件

```javascript
// src/middleware/auth.js
import jwt from 'jsonwebtoken'

export function authMiddleware(req, res, next) {
  // Authorization 请求头通常长这样：
  // Bearer xxxxx.yyyyy.zzzzz
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录或 token 缺失' })
  }

  // 把真正的 token 从 Bearer 后面拆出来
  const token = authHeader.split(' ')[1]

  try {
    // verify 会验证 token 是否有效、是否过期
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    // 把 userId 挂到 req 上
    // 后面的路由就能知道“当前是谁在访问”
    req.userId = payload.userId
    next()
  } catch (error) {
    return res.status(401).json({ message: 'token 无效或已过期' })
  }
}
```

生成 token 时只放必要信息：

```javascript
jwt.sign(
  { userId: user._id }, // payload：这里只放最必要的 userId
  process.env.JWT_SECRET, // 用服务端密钥签名
  { expiresIn: '7d' } // token 7 天后过期
)
```

不要把太多敏感业务数据塞到 JWT payload 里。

---

## 九、登录注册接口，先追求稳，再追求花哨

### 8.1 注册

核心流程：

1. 校验参数
2. 查邮箱是否已存在
3. 创建用户
4. 返回 token 和用户信息

### 8.2 登录

核心流程：

1. 查找用户时显式选出密码
2. 比较密码
3. 生成 token

例如：

```javascript
// 登录时要把 password 这个默认隐藏字段显式取出来
const user = await User.findOne({ email }).select('+password')

if (!user) {
  // 安全起见，不要告诉前端“邮箱不存在”
  return res.status(401).json({ message: '邮箱或密码错误' })
}

// 比较用户输入的密码和数据库里的哈希密码
const isMatch = await user.comparePassword(password)

if (!isMatch) {
  return res.status(401).json({ message: '邮箱或密码错误' })
}
```

这里统一返回“邮箱或密码错误”，是很常见的安全处理方式。

---

## 十、笔记列表接口，最能体现 MongoDB 项目思维

```javascript
// 从查询字符串里拿分页和筛选条件
const {
  page = 1,
  pageSize = 10,
  keyword = '',
  tag = ''
} = req.query

// 页码最小是 1
const currentPage = Math.max(1, Number(page))

// 每页最多给 50 条，防止有人一下查太多把接口拖慢
const limit = Math.min(50, Math.max(1, Number(pageSize)))

const filter = {
  author: req.userId // 只能查当前登录用户自己的笔记
}

if (tag) {
  // 如果传了 tag，就按标签筛选
  filter.tags = tag
}

if (keyword.trim()) {
  // 如果传了关键词，就查标题或正文里包含这个词的笔记
  filter.$or = [
    { title: { $regex: keyword.trim(), $options: 'i' } },
    { content: { $regex: keyword.trim(), $options: 'i' } }
  ]
}

// Promise.all 表示“这两件事并行做”
// 一边查列表，一边查总数，能更快一点
const [list, total] = await Promise.all([
  Note.find(filter)
    .select('title tags createdAt updatedAt') // 列表页先不返回正文，减小返回体积
    .sort({ createdAt: -1 }) // 最新的笔记排前面
    .skip((currentPage - 1) * limit) // 跳过前面页的数据
    .limit(limit) // 只拿当前页的数据
    .lean(), // 纯列表查询用 lean() 更轻量
  Note.countDocuments(filter) // 单独统计总数，给前端算总页数
])
```

这段逻辑里用了 5 个项目里非常高频的 MongoDB 能力：

1. 按用户隔离数据
2. 标签过滤
3. 关键词搜索
4. 分页
5. `lean()` 列表优化

---

## 十一、搜索方案怎么理解更现实

小项目最常见的搜索写法是：

- `regex` 模糊匹配
- 或文本索引

但你要知道它们的边界：

### 10.1 `regex`

优点：

- 直观
- 上手快

缺点：

- 大数据量下性能一般

### 10.2 文本索引

适合更正式一些的全文匹配思路，但也不是“万能搜索”。

### 10.3 Atlas Search

如果以后项目规模更大、搜索更复杂，再考虑官方云能力 Atlas Search。

所以这篇练手项目里，采用“`regex` + 索引意识”的方式最适合学习。

---

## 十二、删除接口为什么推荐软删除

```javascript
await Note.findOneAndUpdate(
  {
    _id: req.params.id, // 找到当前要删除的那篇笔记
    author: req.userId // 并且必须是当前用户自己的笔记
  },
  {
    $set: {
      isDeleted: true, // 打上“已删除”标记
      deletedAt: new Date() // 记录删除时间
    }
  },
  {
    new: true // 返回更新后的笔记
  }
)
```

真实项目里这样做比真删更稳，因为：

- 用户误删后可以恢复
- 便于审计
- 便于后续做回收站

---

## 十三、如果要继续升级这个项目，应该加什么

这也是主人做项目时很关键的一步：知道“下一步该怎么升级”。

### 12.1 参数校验

用 `zod`、`joi` 或 `express-validator` 做接口入参校验。

### 12.2 安全增强

加入：

- `helmet`
- `express-rate-limit`
- 更严格的密码策略

### 12.3 错误处理统一化

把错误响应集中到统一中间件。

### 12.4 测试

为登录、创建笔记、列表分页补接口测试。

### 12.5 部署

数据库可以上 MongoDB Atlas，服务可以部署到常见 Node 平台。

---

## 十四、学完这套项目，你应该具备什么能力

如果主人把这一篇的结构和前面 6 篇一起吃透，基本已经能独立做下面这类项目：

- 个人博客后台
- 笔记管理系统
- 简单 CMS
- 任务清单系统
- 带登录的内容管理 API

这就已经达到了“能做项目”的门槛。

---

## 十五、小结

这一篇不是让你照抄一个仓库，而是给你一套可复用骨架：

1. 连接层先稳住
2. 规则尽量沉到模型层
3. 查询围绕真实业务场景组织
4. 列表页优先考虑索引、分页、精简字段
5. 删除优先软删除
6. 搜索先从能解释清楚、能维护的方案开始

### 官方资料

- Express + MongoDB 常用参考以本系列前三到六篇官方链接为准
- MongoDB Node.js Driver: https://www.mongodb.com/docs/drivers/node/current/
- Mongoose Docs: https://mongoosejs.com/docs/
- Transactions: https://www.mongodb.com/docs/manual/core/transactions/

到这里，这套 MongoDB 系列已经足够支撑你从入门进入中小型项目实战。后续如果主人愿意，我还可以继续把这一套扩展成“带评论、收藏、文件上传、管理员后台、Atlas 部署”的进阶版。
