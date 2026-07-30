---
title: "MongoDB 详解第四篇：Mongoose CRUD 与中间件"
slug: "node-js-mongodb-mongoose-crud-bcf8ad68"
summary: "从业务代码视角掌握 Mongoose 常用 CRUD、查询链、更新方式选择、lean 优化和文档/查询中间件，建立更安全、更可维护的项目写法。"
category: "MongoDB详解"
categoryPath:
  - "后端技术"
  - "Node.js"
  - "MongoDB详解"
tags:
  - "MongoDB"
  - "Mongoose"
  - "CRUD"
  - "中间件"
  - "钩子"
  - "lean"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291e8a2b1c68f2cac164"
originalSlug: "node-js-mongodb-mongoose-crud-bcf8ad68"
originalStatus: "published"
publishedAt: "2026-06-07T06:14:19.366Z"
updatedAt: "2026-06-13T10:28:27.628Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# MongoDB 详解第四篇：Mongoose CRUD 与中间件

> 这一篇的目标不是把方法名背一遍，而是让你知道“项目里应该怎么写更稳”。很多 bug 不是不会 CRUD，而是方法选错了。

---

## 一、创建数据时，先会区分 `create()` 和 `save()`

### 1.1 `create()`

```javascript
// create() 适合“我已经准备好数据了，直接存”
const user = await User.create({
  username: 'haonan',
  email: 'haonan@example.com',
  password: '123456'
})
```

适合：

- 一步创建
- 代码简洁
- 大多数普通新增场景

### 1.2 `new Model()` + `save()`

```javascript
// new User(...) 先创建文档实例
const user = new User({
  username: 'haonan',
  email: 'haonan@example.com',
  password: '123456'
})

// 这时还没保存进数据库，你还可以继续改字段
user.role = 'admin'

// 调用 save() 才真正写入数据库
await user.save()
```

适合：

- 创建前还要进一步处理数据
- 你想拿到文档实例并在保存前做更多判断

### 1.3 项目里怎么选

- 简单新增，用 `create()`
- 需要围绕文档实例做逻辑，用 `save()`

---

## 二、批量写入别只看快不快，还要看钩子和校验

```javascript
// insertMany() 一次性插入多条
// 适合批量导入、造测试数据
await User.insertMany([
  { username: 'u1', email: 'u1@example.com', password: '123456' },
  { username: 'u2', email: 'u2@example.com', password: '123456' }
])
```

`insertMany()` 很适合导入、初始化数据，但你要特别注意：

- 它和 `save()` / `create()` 的生命周期并不完全一样
- 如果你的业务依赖某些中间件，必须先确认这些中间件是否会按预期触发

这也是为什么项目里涉及密码加密、复杂校验时，很多团队仍然更谨慎地使用逐条创建逻辑。

---

## 三、读取数据时，真正常用的是这几组组合

### 3.1 查列表

```javascript
// 这是典型列表页写法：
// 查状态是 published 的文章
const list = await Article.find({ status: 'published' })
  .select('title tags author createdAt') // 只返回列表页需要的字段
  .sort({ createdAt: -1 }) // 最新文章排前面
  .skip(0) // 跳过前 0 条
  .limit(10) // 只拿 10 条
```

这是最标准的后台列表页写法。

### 3.2 `select()` 到底是在干什么

你可以先把 `select()` 理解成：

> 数据库里一条文章可能有很多字段，但接口不一定要全部拿回来。`select()` 就是在告诉 Mongoose：“这次查询我只要哪些字段，或者不要哪些字段。”

比如一篇文章文档可能长这样：

```json
{
  "_id": "68426d4d4706fa0f58f47f4a",
  "title": "MongoDB 学习路线",
  "content": "很长很长的正文内容...",
  "author": "68426d4d4706fa0f58f47f4b",
  "status": "published",
  "views": 120,
  "createdAt": "2026-06-06T10:00:00.000Z"
}
```

列表页通常只展示标题、作者、时间，不展示完整正文。那就可以这样写：

```javascript
const list = await Article.find({ status: 'published' })
  .select('title author createdAt') // 只返回这 3 个字段，默认仍会带 _id
```

如果你想排除某些字段，也可以用减号：

```javascript
const user = await User.findById(userId)
  .select('-password -refreshToken') // 不返回密码和刷新令牌
```

两种写法不要混着乱用：

- `.select('title author')` 是“只要这些字段”
- `.select('-password')` 是“除了 password，其他能返回的都返回”
- `_id` 比较特殊，如果连 `_id` 都不想要，可以写 `.select('title author -_id')`

真实项目里，`select()` 特别常见于两个地方：

1. 列表接口：少拿大字段，比如正文 `content`
2. 用户接口：主动排除敏感字段，比如 `password`

你看到 `.select()` 时，不要把它当成什么高级语法。它本质上就是“控制接口返回哪些字段”，既能减少数据传输，也能避免把不该给前端的字段给出去。

### 3.3 查单条

```javascript
// findById(id) 是最直接的“按 _id 查一条”
const article = await Article.findById(articleId)
```

或者按业务条件查：

```javascript
// findOne() 适合“按多个业务条件查一条”
const article = await Article.findOne({
  _id: articleId,
  status: 'published'
})
```

### 3.4 统计总数

```javascript
// countDocuments() 用来统计满足条件的数据总数
const total = await Article.countDocuments({ status: 'published' })
```

做分页时通常配合 `Promise.all()`：

```javascript
// Promise.all 表示“两个异步操作并行执行”
// 一边查当前页数据，一边查总数
const [list, total] = await Promise.all([
  Article.find({ status: 'published' })
    .sort({ createdAt: -1 }) // 稳定排序
    .skip((page - 1) * pageSize) // 跳过前面页的数据
    .limit(pageSize) // 取当前页数量
    .lean(), // 只做展示时用 lean() 更轻
  Article.countDocuments({ status: 'published' })
])
```

这类并行很常见，但注意：

- 普通查询里可以这样做
- 事务里不要这么写，后面第六篇会专门讲

---

## 四、`lean()` 很重要，但不要乱用

```javascript
// lean() 后返回的是普通对象，不是 Mongoose 文档实例
const list = await Article.find({ status: 'published' }).lean()
```

`lean()` 会让查询结果变成普通 JavaScript 对象，而不是 Mongoose 文档实例。

这句话如果第一次看会很抽象，我们拆开说。

默认情况下，Mongoose 查出来的不是一个“干净的普通对象”，而是一个带了很多 Mongoose 能力的文档实例。它除了有 `title`、`content` 这些字段，还带着：

- `save()`：改完后能继续保存
- `isModified()`：判断字段有没有被改
- getter / virtual：Schema 里定义的一些额外能力
- Mongoose 内部追踪状态：用来知道这个文档发生了什么变化

这些能力很有用，但也有成本。列表页只是把数据展示给前端，并不需要 `save()`，也不需要 Mongoose 帮你追踪修改状态。这个时候用 `lean()`，就像告诉 Mongoose：

> 这批数据我只拿来读，不会再拿它调用文档方法，你给我普通对象就行。

好处：

- 更轻量
- 更快
- 很适合列表、纯展示接口

代价：

- 没有文档实例方法
- 不能直接 `save()`
- 某些依赖文档特性的行为不会存在

看一个最容易踩坑的例子：

```javascript
const article = await Article.findById(articleId).lean()

article.title = '新标题'

// 这里会报错，因为 lean() 后的 article 只是普通对象，没有 save()
await article.save()
```

如果你接下来要修改并保存，就不要用 `lean()`：

```javascript
const article = await Article.findById(articleId)

article.title = '新标题'
await article.save()
```

所以你可以记成：

- 只读列表接口，优先考虑 `lean()`
- 后续还要修改文档、调用实例方法时，不要轻易 `lean()`
- 不确定时先不用 `lean()`，等你明确“这里只展示、不修改”时再加

---

## 五、更新数据时，方法选择决定你后面会不会掉坑

### 5.1 先查后改再保存

```javascript
// 先把这条用户查出来
const user = await User.findById(userId)

if (!user) {
  throw new Error('用户不存在')
}

// 拿到文档实例后，可以像改普通对象一样改字段
user.profile.city = '上海'

// save() 会把修改同步回数据库
await user.save()
```

适合：

- 你要基于旧值做复杂判断
- 你希望文档中间件逻辑清晰

### 5.2 `findByIdAndUpdate()` / `findOneAndUpdate()`

```javascript
const article = await Article.findByIdAndUpdate(
  articleId, // 直接按 _id 定位
  {
    $set: {
      title: '更新后的标题', // 改标题
      status: 'published'
    }
  },
  {
    new: true, // 返回更新后的文档
    runValidators: true // 更新时也执行 Schema 校验
  }
)
```

这里有两个高频配置一定要记住：

- `new: true` 返回更新后的文档
- `runValidators: true` 更新时也执行校验

### 5.3 项目里怎么选

- 复杂业务逻辑，优先“查出来后修改再 `save()`”
- 简单直接更新，`findOneAndUpdate()` 更高效

---

## 六、删除数据时，项目里常见的是软删除

```javascript
await Article.findByIdAndUpdate(articleId, {
  $set: {
    isDeleted: true, // 打上“已删除”标记
    deletedAt: new Date()
  }
})
```

然后在查询时统一过滤：

```javascript
// 以后查列表时，统一排除已删除数据
Article.find({ isDeleted: { $ne: true } })
```

软删除的优势：

- 方便恢复
- 方便审计
- 误删后还有缓冲空间

---

## 七、中间件是什么，为什么它这么适合做“统一规则”

Mongoose 中间件可以理解成：

在某些数据库动作之前或之后，自动执行一段逻辑。

如果你学过前端事件，可以先借用一个不完全准确但很好入门的类比：

> 前端里按钮可以绑定点击事件；Mongoose 里某些数据库动作也可以挂一段函数，让它在动作发生前或发生后自动执行。

但要注意，它不是简单的“按钮绑定函数”。Mongoose 中间件更强调“生命周期”：

- `pre`：前置中间件，在某个动作真正执行前运行
- `post`：后置中间件，在某个动作执行完成后运行

比如 `pre('save')` 的意思就是：

> 在文档保存进数据库之前，先执行这里的逻辑。

`post('save')` 的意思就是：

> 文档已经保存成功之后，再执行这里的逻辑。

最典型的用途：

- 密码加密
- 自动更新时间
- 软删除过滤
- 日志埋点

### 7.1 先分清：文档中间件和查询中间件

新手最容易混乱的点是：同样叫中间件，它挂载的对象不一定一样。

#### 文档中间件

文档中间件围绕“某一条文档实例”运行。

最典型的是：

```javascript
userSchema.pre('save', async function () {
  // 这里的 this 指向当前要保存的那一条用户文档
})
```

这类写法适合处理“这一条数据自己身上的规则”，比如：

- 保存用户前加密密码
- 保存文章前自动生成摘要
- 保存商品前修正价格格式

#### 查询中间件

查询中间件围绕“一次查询动作”运行。

最典型的是：

```javascript
articleSchema.pre(/^find/, function () {
  // 这里的 this 指向本次查询对象，不是某一条文章文档
})
```

这类写法适合处理“所有查询都要遵守的规则”，比如：

- 查询文章时默认排除软删除数据
- 查询列表时默认带某些公共条件
- 记录某类查询耗时

### 7.2 `this` 到底是谁

你看到中间件里写 `function () {}`，不要急着换成箭头函数。

```javascript
userSchema.pre('save', async function () {
  console.log(this.password)
})
```

这里故意用普通函数，是因为 Mongoose 会把 `this` 绑定成当前文档或当前查询。

如果写成箭头函数：

```javascript
userSchema.pre('save', async () => {
  // 这里的 this 就不是 Mongoose 给你的当前文档了
})
```

所以在 Mongoose 中间件里，新手先记一个规则：

> 需要用 `this` 时，优先写 `function () {}`，不要写箭头函数。

---

## 八、密码加密是最经典的文档中间件案例

```javascript
import bcrypt from 'bcrypt'

userSchema.pre('save', async function () {
  // 只有 password 被修改过时，才需要重新加密
  if (!this.isModified('password')) {
    return
  }

  // 把明文密码转换成哈希值
  this.password = await bcrypt.hash(this.password, 10)
})
```

这段代码背后的思路特别重要：

- 不是在每个注册接口里都手动写加密
- 而是把规则放到模型层，统一生效

这样后面无论谁调用 `save()`，密码都不会被明文存库。

再换成更白话的执行顺序：

1. 业务代码创建用户：`new User(...)`
2. 业务代码调用：`user.save()`
3. Mongoose 发现有 `pre('save')`
4. 先执行密码加密逻辑
5. 加密完成后，再真正把用户写进数据库

这就是“前置”的含义：它不是保存之后补救，而是在保存之前拦一下，把该做的统一规则先做完。

---

## 九、查询中间件很适合做软删除默认过滤

```javascript
articleSchema.pre(/^find/, function () {
  // 先取到本次查询原本自带的过滤条件
  const filter = this.getFilter()

  // 如果业务层没主动指定 isDeleted 条件
  // 就默认过滤掉已删除的数据
  if (filter.isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } })
  }
})
```

这个写法的意义是：

- 平时查询自动排除已删除数据
- 只有你显式写了 `isDeleted` 条件时，才按你的条件查

这能明显减少业务层重复代码。

这里再强调一次：`pre(/^find/)` 里的 `this` 不是某篇文章，而是“这次查询”。

所以它能做的是：

```javascript
this.where({ isDeleted: { $ne: true } })
```

意思是给本次查询追加条件。它不是在改某一条文章，而是在改“即将发给数据库的查询语句”。

如果你的脑子里能分清这两句话，中间件就会清楚很多：

- `pre('save')`：我要保存某条文档前，先处理这条文档
- `pre(/^find/)`：我要执行某次查询前，先改一下查询条件

---

## 十、一个项目里很实用的完整模型片段

```javascript
const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    isDeleted: {
      type: Boolean, // 软删除标记
      default: false
    },
    deletedAt: Date // 删除时间
  },
  {
    timestamps: true, // 自动维护创建时间、更新时间
    versionKey: false
  }
)

articleSchema.pre(/^find/, function () {
  const filter = this.getFilter()

  if (filter.isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } })
  }
})
```

看起来代码不多，但已经解决了两个真实项目问题：

1. 自动带创建更新时间
2. 默认隐藏软删除数据

---

## 十一、新手高频踩坑提醒

### 11.1 以为 `lean()` 后还能 `save()`

不行。`lean()` 返回的是普通对象。

### 11.2 更新时忘记 `runValidators`

结果创建时规则严格，更新时反而脏数据进来了。

### 11.3 以为所有更新方式都会走同一种中间件

不同方法的生命周期不同，不能想当然。

### 11.4 把过多业务逻辑塞到中间件里

中间件适合“统一规则”，不适合承载复杂业务编排。

---

## 十二、小结

这一篇你最该形成的是“方法选择意识”：

1. 创建时知道 `create()` 和 `save()` 的区别
2. 查询时熟练使用 `select/sort/skip/limit/countDocuments`
3. 知道 `select()` 是控制返回字段，不是额外查询
4. 知道列表接口为什么适合 `lean()`，也知道它为什么不能再 `save()`
5. 更新时知道什么时候该先查后改、什么时候直接 `findOneAndUpdate()`
6. 分清 `pre/post`、文档中间件、查询中间件和 `this` 指向
7. 学会用中间件统一处理密码加密和软删除过滤

### 官方资料

- Queries: https://mongoosejs.com/docs/queries.html
- Middleware: https://mongoosejs.com/docs/middleware.html
- Lean: https://mongoosejs.com/docs/tutorials/lean.html
- findOneAndUpdate: https://mongoosejs.com/docs/tutorials/findoneandupdate.html

**下一篇**：继续往项目深水区走，讲 `populate()`、`$lookup` 和聚合管道。
