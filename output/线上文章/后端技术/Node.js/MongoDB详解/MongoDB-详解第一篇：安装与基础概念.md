---
title: "MongoDB 详解第一篇：安装与基础概念"
slug: "node-js-mongodb-mongodb-5f0dd1bc"
summary: "从零理解 MongoDB 的文档模型、BSON、ObjectId、嵌入与引用思路，并按官方安装路径完成本地环境搭建，为后续 CRUD 和项目实战打基础。"
category: "MongoDB详解"
tags:
  - "MongoDB"
  - "NoSQL"
  - "数据库"
  - "mongosh"
  - "安装配置"
  - "数据建模"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291e8a2b1c68f2cac12a"
originalSlug: "node-js-mongodb-mongodb-5f0dd1bc"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# MongoDB 详解第一篇：安装与基础概念

> 这篇的目标很简单：先把 MongoDB 本体看明白，再把本地环境装明白。只有这两步都通了，后面学 CRUD、Mongoose、项目实战才不会虚。

---

## 一、MongoDB 到底是什么

MongoDB 是文档型数据库。它存的不是固定表结构，而是一条条文档。

你可以先把它理解成：

- 一个数据库里有很多集合 `collection`
- 一个集合里有很多文档 `document`
- 一个文档本质上像一个对象

例如一条用户数据：

```json
{
  "_id": "68426d4d4706fa0f58f47f4a",
  "username": "haonan",
  "email": "haonan@example.com",
  "profile": {
    "city": "上海",
    "bio": "热爱编程"
  },
  "tags": ["node", "mongodb"]
}
```

这段数据主人可以这样理解：

- `_id`：这条文档自己的唯一编号
- `username`：普通字符串字段
- `profile`：一个嵌套对象，里面还能继续放字段
- `tags`：一个数组字段，适合存多个标签

和传统关系型数据库相比，MongoDB 最明显的特征是结构更灵活，特别适合下面这些场景：

- 内容管理系统
- 用户资料、标签、设置类数据
- 订单、评论、日志这类天然带嵌套结构的数据
- Node.js 全栈项目，因为 JSON/BSON 和 JavaScript 对象天然贴近

---

## 二、MongoDB 和 MySQL 的差别，初学者先抓这 4 个点

| 维度 | MySQL | MongoDB |
| --- | --- | --- |
| 数据形态 | 表、行、列 | 集合、文档、字段 |
| 结构约束 | 通常先建表 | 默认更灵活 |
| 关联方式 | JOIN 很常见 | 更强调嵌入或引用 |
| 典型查询思路 | 表设计优先 | 读写场景优先 |

小白最容易误解的一点是：

MongoDB 不是“不要设计结构”，而是“先围绕读写场景设计结构，而不是先围绕表规范化设计结构”。

也就是说，你依然要认真设计数据模型，只是设计方式和关系型数据库不完全一样。

---

## 三、必须认识的 5 个基础概念

### 3.1 database

数据库本身，相当于一个项目的数据容器。

例如：

- `blog_system`
- `notes_app`
- `mall_backend`

### 3.2 collection

集合，相当于一类数据的容器。

例如：

- `users`
- `articles`
- `orders`

### 3.3 document

集合里的一条数据，就是文档。

MongoDB 文档底层存的是 BSON，不是纯文本 JSON。BSON 比 JSON 多了很多适合数据库的类型，比如：

- `ObjectId`
- `Date`
- `Decimal128`
- `Binary`

### 3.4 field

字段就是文档里的属性，比如：

```json
{
  "title": "MongoDB 入门",
  "status": "published",
  "views": 120
}
```

这里的 `title`、`status`、`views` 就是字段。

### 3.5 _id / ObjectId

MongoDB 每条文档都有 `_id`。默认类型通常是 `ObjectId`。

你经常会看到这种值：

```text
68426d4d4706fa0f58f47f4a
```

它的意义可以先记成一句话：

`ObjectId` 是 MongoDB 常见的默认主键类型，天然唯一，适合分布式环境。

初学阶段你不用死记内部 12 字节结构，但要知道两点：

- `_id` 默认已经是索引，查单条数据非常高频
- 前后端传递 `_id` 时要注意它经常表现为字符串，但数据库里本质是 `ObjectId`

---

## 四、MongoDB 不是“随便存”，数据建模才是关键

官方文档一直强调一个核心思路：先考虑应用如何读取和更新数据，再决定模型。

### 4.1 嵌入式设计

如果数据总是一起读、一起写，而且层级天然从属，优先考虑嵌入。

```json
{
  "title": "MongoDB 学习笔记",
  "author": {
    "name": "Haonan",
    "email": "haonan@example.com"
  }
}
```

这个例子里，`author` 直接放进了文章文档内部。

也就是说：

- 查这篇文章时，作者基础信息一起就查出来了
- 不需要再去另外一个集合额外查一次

适合：

- 地址信息
- 用户设置
- 单篇文章下不多的配置信息

优点：

- 查一条文档就拿全了
- 不需要额外关联

### 4.2 引用式设计

如果一份数据会被多处复用，或者子数据增长快、体量大，就更适合引用。

```json
{
  "title": "MongoDB 学习笔记",
  "authorId": "68426d4d4706fa0f58f47f4a"
}
```

这个例子里，文章里不再直接放作者对象，而是只放一个 `authorId`。

也就是说：

- 文章和作者数据分开存
- 以后需要作者详细信息时，再通过这个 `authorId` 去关联查询

适合：

- 文章和作者
- 订单和商品
- 评论和用户

优点：

- 避免重复存大量相同数据
- 更适合多对多或复用场景

### 4.3 新手最实用的判断法

记住这一句就够了：

- 总是一起读写，优先嵌入
- 会单独维护、单独增长、被多处复用，优先引用

---

## 五、安装环境时，先分清 4 个工具

| 工具 | 作用 |
| --- | --- |
| `mongod` | MongoDB 数据库服务进程 |
| `mongosh` | 官方命令行 Shell |
| MongoDB Compass | 官方图形化客户端 |
| MongoDB Atlas | 官方托管云数据库 |

对初学者来说，最稳的学习方式是：

1. 本地装 `mongod`
2. 本地装 `mongosh`
3. 再装 Compass 辅助观察数据

Atlas 很重要，但建议放到项目阶段再接入，因为一开始先学本地环境更容易理解。

---

## 六、Windows / macOS / Linux 的安装思路

### 6.1 Windows

学习阶段建议按官方 Community 下载页安装 MongoDB Server，再单独安装 mongosh。

推荐步骤：

1. 安装 MongoDB Community Server
2. 安装 MongoDB Shell
3. 可选安装 MongoDB Compass

验证命令：

```bash
# 直接启动 MongoDB Shell
# 如果命令存在并能进入交互界面，说明 mongosh 已经装好了
mongosh
```

如果能正常进入 shell，说明客户端装好了。

如果数据库服务已经起来，再执行：

```javascript
// show dbs 表示“列出当前服务器上已有数据的数据库”
show dbs
```

能看到数据库列表，说明本地可用了。

### 6.2 macOS

常见做法是通过 Homebrew 安装官方包，再用 `brew services` 托管服务。

### 6.3 Linux

按对应发行版的官方仓库安装，重点是：

- 不要随便装第三方来源的旧包
- 按官方版本仓库安装，避免教程版本过老

### 6.4 安装时别被版本号吓到

主人这里不用死记某个具体小版本号，真正要记的是：

- 阅读概念和语法时，以 MongoDB 官方 `manual/current` 为准
- 本地装环境时，优先跟官方 Community 安装说明
- 学习语法和项目实战时，8.x 主线的核心能力是一致的

---

## 七、mongosh 入门命令，先会这几个

```bash
# 先进入 MongoDB 命令行环境
mongosh
```

进入后先练下面这些：

```javascript
// 查看当前 MongoDB 服务器上有哪些数据库
show dbs

// 切换到 learn_mongodb 这个数据库
// 如果它还不存在，不用怕，后面插入数据时会自动创建
use learn_mongodb

// 查看“我当前正站在哪个数据库里”
db

// 查看当前数据库里有哪些集合
show collections

// 手动创建一个 users 集合
// 实际开发里就算不提前建，第一次插入数据时它也会自动创建
db.createCollection('users')

// 往 users 集合里插入一条最简单的用户数据
db.users.insertOne({
  username: 'haonan', // 用户名
  role: 'admin', // 角色
  createdAt: new Date() // 当前时间
})

// 查询 users 集合里的所有文档
db.users.find()

// 统计 users 集合里一共有多少条文档
db.users.countDocuments()
```

如果主人是第一次接触 shell，这段可以按下面顺序理解：

1. `use learn_mongodb`：先进入练习数据库
2. `db.createCollection('users')`：准备一个 users 集合
3. `db.users.insertOne(...)`：往里塞第一条数据
4. `db.users.find()`：把刚才那条数据查出来看
5. `db.users.countDocuments()`：确认现在集合里有几条数据

初学阶段你只要先把下面 3 件事练熟就够了：

1. 会切库 `use xxx`
2. 会看集合 `show collections`
3. 会插入和查询最简单的数据

---

## 八、Compass 值得装，但不要依赖它代替理解

Compass 的好处很明显：

- 直观看数据结构
- 方便试过滤条件
- 可视化创建索引
- 可视化跑聚合管道

但新手要注意：

Compass 是辅助工具，不是学习替代品。

如果你只会点界面、不知道对应命令和查询语义，到了项目里还是会卡住。

最好的方法是：

- 先在 mongosh 里学命令
- 再用 Compass 对照着看结果

---

## 九、做项目前必须有的正确认识

很多新手学 MongoDB 时容易踩这几个坑：

### 9.1 误区一：MongoDB 没有 schema

原生 MongoDB 结构更灵活，不等于项目里不需要约束。

项目开发时你通常仍然需要：

- 字段类型约束
- 必填校验
- 默认值
- 枚举值限制
- 索引

这些在 Node.js 项目里一般由 Mongoose 来承担。

### 9.2 误区二：MongoDB 不适合事务

更准确的说法是：

- 单文档写入本来就是原子的
- 多文档一致性需要时，MongoDB 支持事务
- 但事务不是默认到处乱用的功能，后面第六篇会专门讲

### 9.3 误区三：MongoDB 不用设计索引

错。MongoDB 依然非常依赖索引。

没有索引，查询照样会慢；索引乱建，也会拖慢写入。

---

## 十、小结

这一篇你先拿下 4 件事：

1. 搞清楚 MongoDB 是文档型数据库，不是“表结构更松的 MySQL”
2. 理解 MongoDB 的核心对象：数据库、集合、文档、字段、`_id`
3. 知道嵌入与引用是后面数据建模的底层判断逻辑
4. 把本地环境和 `mongosh` 跑通

### 官方资料

- MongoDB Manual: https://www.mongodb.com/docs/manual/
- Installation: https://www.mongodb.com/docs/manual/installation/
- mongosh: https://www.mongodb.com/docs/mongodb-shell/
- Data Modeling: https://www.mongodb.com/docs/manual/core/data-modeling-introduction/

**下一篇**：进入原生 CRUD，把 `insertOne`、`find`、`updateOne`、`deleteOne`、分页排序、条件过滤全部打通。
