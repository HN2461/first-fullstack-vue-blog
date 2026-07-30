---
title: "MongoDB 详解第五篇：关联查询与聚合管道"
slug: "node-js-mongodb-fbe72b64"
summary: "从项目视角讲清楚什么时候用嵌入、什么时候用引用、什么时候用 populate，什么时候应该上聚合管道和 $lookup，帮助你把复杂查询和统计逻辑做对。"
category: "MongoDB详解"
categoryPath:
  - "后端技术"
  - "Node.js"
  - "MongoDB详解"
tags:
  - "MongoDB"
  - "Mongoose"
  - "populate"
  - "聚合管道"
  - "lookup"
  - "group"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291e8a2b1c68f2cac152"
originalSlug: "node-js-mongodb-fbe72b64"
originalStatus: "published"
publishedAt: "2026-06-07T06:40:12.479Z"
updatedAt: "2026-06-16T14:06:50.390Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# MongoDB 详解第五篇：关联查询与聚合管道

> 这一篇是 MongoDB 从“会增删改查”走向“能做复杂业务”的分水岭。很多项目一开始写得很快，后面一复杂就痛苦，通常就是因为关联思路和聚合思路没打通。为了让小白更好懂，这一篇的代码也尽量都加上“这一行在做什么”的解释。

---

## 一、先别急着学 `populate()`，先学建模判断

MongoDB 官方一直强调数据建模要先考虑读写模式。

所以遇到“文章和作者”“评论和用户”“订单和商品”这类关系时，不是先问“怎么关联”，而是先问：

- 这份数据是不是总一起读
- 这份数据会不会被多个地方复用
- 这份数据会不会增长很快

这三个问题很重要，因为 MongoDB 和传统关系型数据库的思路不完全一样。你不要一看到“文章有作者”，就立刻想“我要像 SQL 一样 JOIN”。在 MongoDB 里，第一步通常是判断：

> 我是把这份小数据直接放进当前文档里，还是只存一个 `_id`，需要时再查另一张集合？

先把两个词翻译成人话：

- 嵌入：把子数据直接塞进当前文档里
- 引用：当前文档只存另一个文档的 `_id`

如果你把“文章 SEO 信息”直接放进文章文档，这叫嵌入。

如果你在文章里只存 `author: 用户_id`，这叫引用。

### 1.1 适合嵌入的情况

例如文章的 SEO 配置：

```json
{
  "title": "MongoDB 学习路线",
  "seo": {
    "description": "适合小白到项目实战的 MongoDB 系列",
    "keywords": ["mongodb", "nodejs"]
  }
}
```

这类数据天然从属、体量小、总是一起读，嵌入更合适。

你可以这么判断：

- SEO 配置离开文章基本没有意义
- 每篇文章一般只有一份 SEO 配置
- 读取文章详情时通常也会一起读取 SEO 配置

这种就很适合嵌入。它的好处是读文章时一次就能拿到，不需要再查别的集合。

### 1.2 适合引用的情况

例如文章作者：

```javascript
author: {
  type: mongoose.Schema.Types.ObjectId, // 这里存的是用户 _id
  ref: 'User', // 告诉 Mongoose：这个字段关联 User 模型
  required: true
}
```

作者会被多篇文章共用，显然更适合引用。

这里为什么不把作者完整信息嵌进每篇文章里？

因为作者信息会复用。一个用户可能写 100 篇文章，如果你把作者昵称、头像、邮箱都复制进 100 篇文章里，以后这个用户换头像，你可能要更新 100 个地方。

所以更合理的方式是：

1. `users` 集合里存用户完整信息
2. `articles` 集合里只存作者的 `_id`
3. 需要展示作者信息时，再用 `populate()` 或 `$lookup` 补出来

### 1.3 新手判断口诀

第一次做项目时，可以先用这个粗略判断：

- 小、稳定、只属于当前文档的数据，优先嵌入
- 会被多个地方复用、会单独更新的数据，优先引用
- 会无限增长的数据，不要轻易无限嵌入

比如评论就要谨慎。文章下面可能有 10 条评论，也可能有 10 万条评论。如果全都嵌进文章文档，文章会越来越大，后面分页、删除、审核都会难受。

---

## 二、`populate()` 是什么

`populate()` 是 Mongoose 帮你把引用字段对应的文档查出来并填充进去。

```javascript
// 先按文章 id 查到这篇文章
// 再把 author 这个字段从“ObjectId”替换成完整用户对象
const article = await Article.findById(articleId).populate('author')
```

不使用 `populate()` 时：

- `author` 只有一个 ObjectId

使用后：

- `author` 会变成完整的用户对象

这就是为什么它特别适合后台详情页、内容列表、评论列表等场景。

把它拆成两步理解会更简单：

1. 文章文档里原本只有 `author: '用户_id'`
2. `populate('author')` 会根据这个用户 `_id` 去 `users` 集合查用户，然后把查到的用户对象放回 `author`

所以 `populate()` 不是魔法，它做的是“根据引用字段再补一次关联数据”。你可以把它理解成 Mongoose 给你封装好的“补资料”动作。

---

## 三、`populate()` 的常见写法

### 3.1 只填充需要的字段

```javascript
const article = await Article.findById(articleId)
  // 只把作者的 username、email、avatar 取出来
  // 这样不会把不必要字段一股脑返回
  .populate('author', 'username email avatar')
```

这一步非常重要，因为真实项目里你通常不想把：

- 密码
- 敏感状态
- 冗余字段

一股脑全带出来。

### 3.2 列表里批量填充

```javascript
const list = await Article.find({ status: 'published' })
  .select('title author createdAt') // 先只查列表页真正需要的字段
  .sort({ createdAt: -1 }) // 最新文章排前面
  .populate('author', 'username avatar') // 只补作者的基础展示信息
  .lean() // 纯展示列表时用 lean() 更轻量
```

这是文章列表接口里很常见的组合。

这里每一步可以这样读：

1. `find({ status: 'published' })`：只找已发布文章
2. `select('title author createdAt')`：文章本身只拿标题、作者、创建时间
3. `sort({ createdAt: -1 })`：最新的排在前面
4. `populate('author', 'username avatar')`：把作者 `_id` 补成作者对象，但只要昵称和头像
5. `lean()`：列表只是展示，不打算拿结果继续 `save()`

注意这里的 `select()` 和 `populate()` 第二个参数不是一回事：

- `.select('title author createdAt')` 控制文章返回哪些字段
- `.populate('author', 'username avatar')` 控制作者返回哪些字段

### 3.3 多个关联字段

```javascript
const article = await Article.findById(articleId)
  .populate('author', 'username') // 填充作者
  .populate('category', 'name') // 再填充分类
```

---

## 四、什么时候别滥用 `populate()`

`populate()` 很方便，但不是越多越好。

这些情况要谨慎：

- 一次填充层级太深
- 列表返回量很大
- 你只是做统计，不是拿完整关联对象

如果你的目标是：

- 分组统计
- 报表汇总
- 排行榜
- 多集合条件计算

通常更应该考虑聚合管道，而不是一层层 `populate()`。

---

## 五、聚合管道可以理解成“数据加工流水线”

MongoDB 聚合管道的核心思路是：

一条数据依次流过多个阶段，每个阶段做一件事。

如果 `find()` 像是“从仓库里找东西”，那聚合管道更像是“把一批数据拿进加工车间”：

1. 先筛掉不需要的
2. 再排序
3. 再分组统计
4. 再整理成前端想要的形状

每一个 `{ $xxx: ... }` 都是一个阶段。前一个阶段的输出，会交给后一个阶段继续处理。

例如：

```javascript
db.articles.aggregate([
  { $match: { status: 'published' } }, // 第一步：先筛出已发布文章
  { $sort: { createdAt: -1 } }, // 第二步：按创建时间倒序
  { $limit: 5 }, // 第三步：只取前 5 条
  { $project: { title: 1, views: 1, createdAt: 1 } } // 第四步：只保留需要的字段
])
```

这段可以读成：

1. 先筛出已发布文章
2. 再按创建时间倒序
3. 再取前 5 条
4. 最后只输出指定字段

### 5.1 先别把所有 `$` 当成同一种东西

很多人第一次看聚合会被 `$` 搞晕，根源不是记性差，而是：

> 同样都是 `$`，它在不同位置代表的不是同一件事。

先建立 3 个最常见的理解：

- `$match`、`$group`、`$project`、`$lookup`：这是聚合阶段名
- `$sum`、`$max`、`$gt`：这是运算符或聚合函数
- `'$title'`、`'$author'`、`'$authorInfo.username'`：这是“取当前这条数据里某个字段的值”

再看几个不带 `$` 的常见东西：

- `18`、`0`、`1`：这是常量
- `published`：这是固定字符串值
- `title`、`authorName`、`total`：要结合“它写在哪个阶段、冒号左边还是右边”再判断含义

所以你不要背成“带 `$` 就一定是这个意思，不带 `$` 就一定是那个意思”。更稳的看法是：

> 先看它处在哪个阶段，再看它是在冒号左边还是右边。

### 5.2 同样是不带 `$`，不同阶段左边 key 的含义也不一样

这是小白最容易卡住的点。下面 4 段代码左边都出现了“不带 `$` 的英文”，但意思完全不一样。

#### 在 `$match` 里，左边通常是原文档字段名

```javascript
{ $match: { age: { $gt: 18 } } }
```

这里：

- `$match` 是“筛选阶段”
- `age` 是原集合里本来就有的字段名
- `$gt` 是“大于”
- `18` 是固定值

也就是说，这句是在表达：

> 只保留 `age > 18` 的文档。

#### 在 `$group` 里，`_id` 是固定分组键，其他左边 key 常常是新字段名

```javascript
{
  $group: {
    _id: '$author',
    total: { $sum: 1 }
  }
}
```

这里：

- `_id` 是 `$group` 规定的固定键，意思是“按什么分组”
- `'$author'` 表示“按当前文档的 author 字段值分组”
- `total` 是你自己起的新字段名
- `{ $sum: 1 }` 表示每来一条就加 1，用来计数

所以 `$group` 之后，结果里出现的 `total` 不是原文档就有的字段，而是你这一阶段新算出来的字段。

#### 在 `$project` 里，左边 key 常常是你想输出成什么名字

```javascript
{
  $project: {
    authorName: '$authorInfo.username',
    articleCount: '$total',
    _id: 0
  }
}
```

这里：

- `authorName` 是你自定义的输出字段名
- `'$authorInfo.username'` 表示取当前数据里的 `authorInfo.username`
- `articleCount` 也是你自定义的输出字段名
- `'$total'` 表示把上一步算出来的 `total` 放到这里
- `_id: 0` 表示隐藏默认 `_id`

也就是说，`$project` 很像“整理最终返回格式”的阶段。

#### 在 `$lookup` 里，很多 key 是固定配置项，不是让你随便起名

```javascript
{
  $lookup: {
    from: 'users',
    localField: 'author',
    foreignField: '_id',
    as: 'authorInfo'
  }
}
```

这里：

- `from`、`localField`、`foreignField`、`as` 都是固定参数名
- `'author'` 和 `'_id'` 虽然写在右边，但它们不是“取值表达式”，而是在告诉 MongoDB“要拿哪两个字段来对”
- `as` 的值 `authorInfo` 是你定义的结果字段名

这一点很关键：`$lookup` 里的 `localField: 'author'` 不写成 `'$author'`，是因为这里不是要你立刻取当前文档的值，而是在配置“匹配规则要看哪个字段名”。

---

## 六、最常用的 6 个聚合阶段

### 6.1 `$match`

过滤文档，相当于聚合里的查询条件。

```javascript
// $match 就像 find() 里的条件
{ $match: { status: 'published' } }
```

新手优先记住：`$match` 越早越好。因为越早过滤掉无关数据，后面要加工的数据就越少。

### 6.2 `$project`

决定输出哪些字段，也可以改造字段结构。

```javascript
{
  $project: {
    title: 1, // 保留 title
    views: 1, // 保留 views
    shortTitle: { $substrCP: ['$title', 0, 10] } // 截取标题前 10 个字符
  }
}
```

`$project` 可以先理解成聚合里的“整理输出字段”。它既能决定哪些字段返回，也能创建新字段。上面的 `shortTitle` 就是根据 `title` 临时加工出来的字段。

### 6.3 `$sort`

```javascript
// 按阅读量倒序
{ $sort: { views: -1 } }
```

`$sort` 就是排序。`-1` 是倒序，`1` 是升序。它和普通查询里的 `.sort()` 很像，只是写在聚合数组里。

### 6.4 `$group`

按某个维度分组汇总。

```javascript
{
  $group: {
    _id: '$status', // 按 status 字段分组
    total: { $sum: 1 }, // 每组数量 +1
    maxViews: { $max: '$views' } // 统计每组的最大阅读量
  }
}
```

`$group` 是很多小白第一次觉得抽象的地方。你可以把它想成 Excel 里的“按某列分组统计”。

比如 `_id: '$status'` 的意思不是返回文档原来的 `_id`，而是：

> 按每条文章的 `status` 字段分组。

如果 status 有 `draft`、`published` 两种，最终大概率就会得到两组。

### 6.5 `$lookup`

这是 MongoDB 聚合里的“关联集合”阶段。

```javascript
{
  $lookup: {
    from: 'users', // 要关联的集合名
    localField: 'author', // 当前集合里的 author 字段
    foreignField: '_id', // users 集合里的 _id 字段
    as: 'authorInfo' // 关联结果放到 authorInfo 里
  }
}
```

这段可以翻译成：

1. 当前集合是 `articles`
2. 我要去 `users` 集合找数据
3. 用当前文章的 `author` 字段
4. 对上用户集合里的 `_id`
5. 找到的结果放进 `authorInfo`

它和 `populate()` 都能补关联数据，但使用场景不同：`populate()` 是 Mongoose 查询链里的便捷写法，`$lookup` 是 MongoDB 聚合管道里的一个阶段。

如果你还是容易把 `localField` 和 `foreignField` 搞混，可以死记这句：

> `localField` 看当前这张表，`foreignField` 看你去关联的那张表。

比如当前是文章集合：

```json
{
  "title": "MongoDB 学习路线",
  "author": "u1001"
}
```

用户集合里有：

```json
{
  "_id": "u1001",
  "username": "haonan"
}
```

那 `$lookup` 的匹配过程就是：

1. 先看当前文章的 `author`
2. 拿到值 `u1001`
3. 再去 `users` 集合里找 `_id` 也等于 `u1001` 的用户
4. 找到后放进 `authorInfo` 数组

所以你可以把它理解成：

> 拿当前表某个字段的值，去另一张集合里找同值记录，然后把找到的结果挂回来。

### 6.6 `$unwind`

把数组拆成多条文档，常常和 `$lookup` 配合。

```javascript
// $lookup 返回的 authorInfo 默认是数组
// $unwind 后就能把它展开成普通对象，后面访问更方便
{ $unwind: '$authorInfo' }
```

为什么 `$lookup` 后常常跟 `$unwind`？

因为 `$lookup` 默认返回数组：

```json
{
  "title": "MongoDB 学习路线",
  "authorInfo": [
    {
      "username": "haonan"
    }
  ]
}
```

如果你确定一篇文章只对应一个作者，就可以用 `$unwind` 把它变成：

```json
{
  "title": "MongoDB 学习路线",
  "authorInfo": {
    "username": "haonan"
  }
}
```

这样后面的 `$project` 访问 `authorInfo.username` 会更直观。

---

## 七、`populate()` 和 `$lookup` 到底怎么选

这是项目里最关键的问题之一。

### 7.1 用 `populate()` 的典型场景

- 基于 Mongoose Model 查询
- 主要是接口返回详情数据
- 想让代码更直观
- 业务复杂度不高

### 7.2 用 `$lookup` 的典型场景

- 你已经在写聚合管道
- 需要多阶段统计和计算
- 需要和 `$group`、`$facet` 一起使用
- 你想把更多工作放在数据库端完成

### 7.3 一句结论

- 取详情、取列表对象信息，优先考虑 `populate()`
- 做统计、报表、排行、复杂筛选，优先考虑聚合 + `$lookup`

再说得更落地一点：

- 文章详情页要展示作者昵称：`populate()`
- 文章列表要展示作者头像：`populate()`
- 统计每个作者发了多少篇文章并排序：聚合 + `$group` + `$lookup`
- 做后台报表，一次返回多个统计结果：聚合

你不用一开始就强迫自己“全部用高级写法”。项目里真正重要的是选对工具。

---

## 八、一个项目里高频会用到的聚合案例

### 8.1 统计每个状态下的文章数量

```javascript
const result = await Article.aggregate([
  {
    $group: {
      _id: '$status', // 按状态分组
      total: { $sum: 1 } // 每条文档都 +1
    }
  }
])
```

### 8.2 统计每个作者发布了多少篇文章

```javascript
const result = await Article.aggregate([
  {
    $match: {
      status: 'published' // 先只看已发布文章
    }
  },
  {
    $group: {
      _id: '$author', // 按 author 分组
      articleCount: { $sum: 1 } // 统计每个作者有多少篇文章
    }
  },
  {
    $lookup: {
      from: 'users', // 关联 users 集合
      localField: '_id', // 这里的 _id 其实就是 author 的值
      foreignField: '_id',
      as: 'authorInfo'
    }
  },
  { $unwind: '$authorInfo' }, // 把 authorInfo 数组展开成对象
  {
    $project: {
      _id: 0, // 最终结果里不返回默认 _id
      authorId: '$_id',
      authorName: '$authorInfo.username',
      articleCount: 1
    }
  },
  { $sort: { articleCount: -1 } } // 文章数多的作者排前面
])
```

这段代码看着长，但执行顺序很朴素：

1. 先只看已发布文章
2. 按作者分组
3. 每看到一篇文章，就给这个作者的数量加 1
4. 拿作者 `_id` 去用户集合补作者信息
5. 把作者数组展开成对象
6. 整理最终返回字段
7. 按文章数量倒序

读聚合管道时，不要从里面挑一个 `$lookup` 或 `$group` 单独硬背。你就从上到下读，把它当成一条流水线。

### 8.3 一次返回列表和总数

很多后台页面会用 `$facet`：

```javascript
const result = await Article.aggregate([
  { $match: { status: 'published' } }, // 先过滤出已发布文章
  {
    $facet: {
      list: [
        { $sort: { createdAt: -1 } }, // 列表结果：按时间倒序
        { $skip: 0 }, // 跳过前 0 条
        { $limit: 10 } // 只取 10 条
      ],
      total: [
        { $count: 'count' } // 总数结果：统计总共有多少条
      ]
    }
  }
])
```

这适合复杂聚合分页，但初学者要知道：

- 简单列表页未必需要上这么重的写法
- 普通列表很多时候 `find + countDocuments` 更清晰

---

## 九、聚合管道的 3 个性能习惯

### 9.1 能早 `$match` 就早 `$match`

先缩小数据范围，后面的阶段压力会更小。

### 9.2 不要太早把文档变形得过重

过早复杂 `$project` 可能让排查变困难。

### 9.3 先想索引，再想管道

聚合不是索引替代品。前面的 `$match`、`$sort` 仍然高度依赖索引。

---

## 十、新手高频误区

### 10.1 以为 `populate()` 就等于 SQL JOIN

它解决的是“填充引用字段”的便捷问题，但底层思维和 SQL 不是完全一样。

### 10.2 把所有统计都放到业务层 for 循环里做

这样数据量一上来会非常慢。很多统计应该交给聚合管道处理。

### 10.3 不知道什么时候该嵌入、什么时候该引用

这会直接影响后面查询复杂度。

---

## 十一、小结

这一篇最核心的收获应该是：

1. 先会判断嵌入还是引用
2. 知道 `populate()` 是把引用字段从 `_id` 补成对象
3. 分清 `.select()` 控制主文档字段，`.populate(..., 字段)` 控制关联文档字段
4. 知道聚合管道是一条从上到下的数据加工流水线
5. 会读 `$match`、`$project`、`$sort`、`$group`、`$lookup`、`$unwind`
6. 知道普通列表和复杂报表的写法应该分开选

### 官方资料

- Mongoose Populate: https://mongoosejs.com/docs/populate.html
- MongoDB Aggregation: https://www.mongodb.com/docs/manual/aggregation/
- Aggregation Pipeline Stages: https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/
- `$lookup`: https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/

**下一篇**：我们会进入真正影响性能和一致性的部分，也就是索引与事务。
