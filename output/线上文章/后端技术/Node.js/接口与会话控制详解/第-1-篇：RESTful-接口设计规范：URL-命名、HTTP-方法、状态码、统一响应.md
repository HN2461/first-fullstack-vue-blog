---
title: "第 1 篇：RESTful 接口设计规范：URL 命名、HTTP 方法、状态码、统一响应"
slug: "node-js-restful-dd419ad9"
summary: "RESTful 接口设计规范入门，覆盖 URL 资源命名、HTTP 方法语义、常见状态码、统一响应格式和接口可维护性。"
category: "接口与会话控制详解"
categoryPath:
  - "后端技术"
  - "Node.js"
  - "接口与会话控制详解"
tags:
  - "Node.js"
  - "RESTful"
  - "HTTP"
  - "接口设计"
  - "状态码"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291e8a2b1c68f2cac16e"
originalSlug: "node-js-restful-dd419ad9"
originalStatus: "published"
publishedAt: "2026-04-21T13:13:27.802Z"
updatedAt: "2026-07-31T11:16:21.821Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 1 篇：RESTful 接口设计规范：URL 命名、HTTP 方法、状态码、统一响应

> 接口是前后端协作的契约。写出规范的接口，能让前端同学一眼看懂，减少沟通成本，也让代码更容易维护。

---

## 一、什么是 REST

### 1.1 先理解"接口"

前端需要数据，后端提供数据，两者通过"接口"通信。接口就是一个 URL，前端发请求，后端返回数据。

问题是：同样是"获取用户"这个功能，不同人可能写出完全不同的 URL：

```
/getUser
/fetchUser
/queryUser
/user/get
/api/user?action=get
```

没有统一规范，团队协作就会乱。REST 就是一套大家约定好的接口设计风格。

### 1.2 REST 是什么

REST（Representational State Transfer，表述性状态转移）是 Roy Fielding 在 2000 年博士论文里提出的一种架构风格，不是协议，也不是标准，是一套设计原则。

核心思想只有一句话：**用 URL 表示资源，用 HTTP 方法表示操作**。

符合 REST 风格的接口叫 **RESTful API**。

---

## 二、URL 设计规范

### 2.1 资源用名词，不用动词

REST 把一切都看作"资源"，URL 是资源的地址，操作由 HTTP 方法决定。

```
❌ 动词风格（非 RESTful）
GET  /getUsers
POST /createUser
POST /deleteUser?id=1
POST /updateUser
GET  /getUserArticles?userId=1

✅ 名词风格（RESTful）
GET    /users
POST   /users
DELETE /users/1
PUT    /users/1
GET    /users/1/articles
```

### 2.2 用复数名词

集合资源用复数：

```
/users        ← 用户集合
/articles     ← 文章集合
/products     ← 商品集合
/orders       ← 订单集合
```

### 2.3 层级表示资源关系

用 URL 层级表达资源之间的从属关系：

```
GET  /users/:userId/articles          获取某用户的所有文章
GET  /users/:userId/articles/:id      获取某用户的某篇文章
POST /users/:userId/articles          为某用户创建文章

GET  /orders/:orderId/items           获取某订单的所有商品
```

> 层级不要超过 3 层，太深了 URL 会很难看。

### 2.4 过滤、排序、分页用查询参数

```
GET /users?role=admin                 按角色过滤
GET /users?page=2&limit=10            分页
GET /users?sort=createdAt&order=desc  排序
GET /articles?keyword=MongoDB         搜索
GET /articles?status=published&page=1&limit=20  组合
```

### 2.5 版本号

接口需要迭代时，用版本号避免破坏旧客户端：

```
/api/v1/users
/api/v2/users

# 或者放在请求头里（更 RESTful，但实践中 URL 版本更常见）
Accept: application/vnd.myapp.v2+json
```

---

## 三、HTTP 方法语义

### 3.1 五种常用方法

| 方法 | 语义 | 是否有请求体 | 幂等性 |
|------|------|-------------|--------|
| GET | 获取资源 | 否 | 是 |
| POST | 创建资源 | 是 | 否 |
| PUT | 全量更新资源 | 是 | 是 |
| PATCH | 部分更新资源 | 是 | 否 |
| DELETE | 删除资源 | 否 | 是 |

**幂等性**：多次执行同一操作，结果相同。GET 查多少次结果一样；DELETE 删一次和删多次效果一样（第二次找不到资源）；POST 每次都会创建新资源，不幂等。

### 3.2 PUT vs PATCH

```javascript
// 假设用户数据：
// { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' }

// PUT：全量替换（没传的字段会被删除）
PUT /users/1
Body: { name: '张三三' }
// 结果：{ id: 1, name: '张三三' }  ← age 和 email 消失了！

// PATCH：部分更新（只更新传入的字段）
PATCH /users/1
Body: { name: '张三三' }
// 结果：{ id: 1, name: '张三三', age: 25, email: 'zhangsan@example.com' }
```

实际项目里，大多数"更新"操作都是部分更新，所以 PATCH 更常用。但很多团队为了简单，统一用 PUT 表示更新（后端实现成部分更新），这也是可以接受的。

### 3.3 在 Express 中对应

```javascript
const express = require('express')
const router = express.Router()

router.get('/', getList)          // GET    /users
router.get('/:id', getOne)        // GET    /users/:id
router.post('/', create)          // POST   /users
router.put('/:id', replace)       // PUT    /users/:id
router.patch('/:id', update)      // PATCH  /users/:id
router.delete('/:id', remove)     // DELETE /users/:id
```

---

## 四、HTTP 状态码

### 4.1 状态码分类

| 范围 | 类型 | 说明 |
|------|------|------|
| 1xx | 信息 | 请求已收到，继续处理（很少用） |
| 2xx | 成功 | 请求成功 |
| 3xx | 重定向 | 需要进一步操作 |
| 4xx | 客户端错误 | 请求有问题（前端的锅） |
| 5xx | 服务器错误 | 服务器出错（后端的锅） |

### 4.2 常用状态码详解

**2xx 成功**：

```
200 OK
  — 最通用的成功状态
  — 适用：GET 成功、PUT/PATCH 成功

201 Created
  — 资源创建成功
  — 适用：POST 创建成功
  — 最好在响应头里加 Location: /users/123（新资源的地址）

204 No Content
  — 成功但没有响应体
  — 适用：DELETE 成功、某些 PUT/PATCH 操作
```

**4xx 客户端错误**：

```
400 Bad Request
  — 请求参数有问题（格式错误、缺少必填字段等）
  — 适用：参数校验失败

401 Unauthorized（名字有点误导，实际是"未认证"）
  — 没有登录，或 token 无效/过期
  — 适用：未登录访问需要登录的接口

403 Forbidden（"未授权"）
  — 已登录，但没有权限
  — 适用：普通用户访问管理员接口

404 Not Found
  — 资源不存在
  — 适用：查询的 ID 不存在

409 Conflict
  — 数据冲突
  — 适用：注册时邮箱已存在、创建重复数据

422 Unprocessable Entity
  — 请求格式正确，但语义有误（参数校验失败的另一种选择）
  — 有些团队用 422 代替 400 表示校验失败
```

**5xx 服务器错误**：

```
500 Internal Server Error
  — 服务器代码报错，未预期的异常
  — 不要把具体错误信息暴露给客户端（安全风险）

503 Service Unavailable
  — 服务暂时不可用（维护、过载等）
```

### 4.3 401 vs 403 的区别（常见混淆）

```
401 Unauthorized：你是谁我不知道（没登录）
  → 前端应该跳转到登录页

403 Forbidden：我知道你是谁，但你没权限（已登录但权限不足）
  → 前端应该显示"无权限"提示，不跳转登录
```

---

## 五、统一响应格式

### 5.1 为什么要统一

前端处理响应时，如果每个接口的格式都不一样，代码会很乱：

```javascript
// 接口A返回：{ user: { id: 1 } }
// 接口B返回：{ data: { id: 1 } }
// 接口C返回：{ result: { id: 1 }, status: 'ok' }
// 前端要写三套处理逻辑，很痛苦
```

统一格式后，前端只需要一套处理逻辑。

### 5.2 推荐的响应格式

```javascript
// 成功（单条数据）
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "6642a1b2c3d4e5f678901234",
    "username": "张三",
    "email": "zhangsan@example.com"
  }
}

// 成功（列表 + 分页）
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}

// 创建成功
{
  "code": 201,
  "message": "创建成功",
  "data": { ... }
}

// 失败
{
  "code": 400,
  "message": "邮箱格式不正确",
  "data": null
}

// 服务器错误（不暴露具体错误信息）
{
  "code": 500,
  "message": "服务器错误，请稍后重试",
  "data": null
}
```

### 5.3 封装响应工具函数

```javascript
// src/utils/response.js

/**
 * 成功响应
 * @param {Response} res - Express 响应对象
 * @param {*} data - 响应数据
 * @param {string} message - 提示信息
 * @param {number} statusCode - HTTP 状态码
 */
function success(res, data = null, message = 'success', statusCode = 200) {
  return res.status(statusCode).json({
    code: statusCode,
    message,
    data
  })
}

/**
 * 失败响应
 * @param {Response} res - Express 响应对象
 * @param {string} message - 错误信息
 * @param {number} statusCode - HTTP 状态码
 * @param {*} data - 额外数据（如校验错误详情）
 */
function fail(res, message = '请求失败', statusCode = 400, data = null) {
  return res.status(statusCode).json({
    code: statusCode,
    message,
    data
  })
}

module.exports = { success, fail }
```

在路由里使用：

```javascript
const { success, fail } = require('../utils/response')

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().lean()
    success(res, users)
  } catch (err) {
    fail(res, '服务器错误', 500)
  }
})

// POST /api/users
router.post('/', async (req, res) => {
  try {
    if (!req.body.username) {
      return fail(res, '用户名不能为空', 400)
    }
    const user = await User.create(req.body)
    success(res, user, '创建成功', 201)
  } catch (err) {
    if (err.code === 11000) {
      return fail(res, '邮箱已存在', 409)
    }
    fail(res, '服务器错误', 500)
  }
})

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return fail(res, '用户不存在', 404)
    // 204 不返回内容
    res.status(204).send()
  } catch (err) {
    fail(res, '服务器错误', 500)
  }
})
```

### 5.4 全局错误处理中间件

Express 有一个特殊的四参数中间件，专门处理错误：

```javascript
// index.js（放在所有路由之后）

// 404 处理（所有路由都没匹配到）
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: `接口 ${req.method} ${req.path} 不存在`,
    data: null
  })
})

// 全局错误处理（路由里 next(err) 或 async 抛出的错误）
app.use((err, req, res, next) => {
  // 打印错误日志（生产环境用日志系统）
  console.error(`[${new Date().toISOString()}] ${err.stack}`)

  // 不把具体错误信息暴露给客户端
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  })
})
```

---

## 六、接口设计实战示例

以"文章管理"为例，设计一套完整的 RESTful 接口：

```
# 文章集合
GET    /api/articles                  获取文章列表（支持分页、搜索、筛选）
POST   /api/articles                  创建文章（需要登录）

# 单篇文章
GET    /api/articles/:id              获取文章详情
PUT    /api/articles/:id              更新文章（需要登录，且是作者）
DELETE /api/articles/:id              删除文章（需要登录，且是作者）

# 文章的评论（嵌套资源）
GET    /api/articles/:id/comments     获取文章的评论列表
POST   /api/articles/:id/comments     发表评论（需要登录）
DELETE /api/articles/:id/comments/:commentId  删除评论

# 文章的点赞（动作类资源，用名词）
POST   /api/articles/:id/likes        点赞
DELETE /api/articles/:id/likes        取消点赞
GET    /api/articles/:id/likes/count  获取点赞数
```

对应的 Express 路由：

```javascript
// routes/articles.js
const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')

// 公开接口（不需要登录）
router.get('/', getArticleList)
router.get('/:id', getArticleDetail)
router.get('/:id/comments', getComments)
router.get('/:id/likes/count', getLikeCount)

// 需要登录的接口
router.post('/', authMiddleware, createArticle)
router.put('/:id', authMiddleware, updateArticle)
router.delete('/:id', authMiddleware, deleteArticle)
router.post('/:id/comments', authMiddleware, addComment)
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment)
router.post('/:id/likes', authMiddleware, likeArticle)
router.delete('/:id/likes', authMiddleware, unlikeArticle)

module.exports = router
```

---

## 七、小结

| 知识点 | 核心要点 |
|--------|----------|
| REST 核心思想 | URL 表示资源（名词），HTTP 方法表示操作 |
| URL 规范 | 复数名词、层级表示关系、过滤/分页用查询参数 |
| GET | 获取资源，无请求体，幂等 |
| POST | 创建资源，有请求体，不幂等 |
| PUT | 全量替换，有请求体，幂等 |
| PATCH | 部分更新，有请求体 |
| DELETE | 删除资源，无请求体，幂等 |
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 成功无响应体（DELETE） |
| 400 | 参数错误 |
| 401 | 未登录（跳登录页） |
| 403 | 无权限（不跳登录页） |
| 404 | 资源不存在 |
| 409 | 数据冲突 |
| 500 | 服务器错误 |
| 统一响应格式 | `{ code, message, data }` |

**下一篇**：Apipost 接口测试工具——接口写好后怎么测试，发各类请求、设置 token、管理环境变量。
