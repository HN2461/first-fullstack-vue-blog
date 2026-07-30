---
title: "第六篇：Express 框架全解"
slug: "node-js-express-ba1a095d"
summary: "深入掌握 Express 框架的路由系统、中间件机制、静态资源服务、ejs 模板引擎，以及 Express 5 新特性、错误处理最佳实践和生产级项目结构。"
category: "Node.js"
tags:
  - "Node.js"
  - "Express"
  - "Express5"
  - "路由"
  - "中间件"
  - "ejs"
  - "静态资源"
  - "错误处理"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291e8a2b1c68f2cac1e6"
originalSlug: "node-js-express-ba1a095d"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 第六篇：Express 框架全解

> Express 是 Node.js 最流行的 Web 框架，极简但不简陋。理解它的中间件模型，是理解所有 Node.js 框架的基础。Express 5 已成为新项目默认应优先学习的主线版本，带来了 Promise 错误自动传递、路由匹配语法变化和一批旧 API 移除。

---

## 一、Express 初体验

### 1.0 Express 是什么

**Express 是一个基于 Node.js 的 Web 应用框架。**

先理解"框架"这个词：框架就是别人帮你搭好的"骨架"，里面封装了大量常用功能，你不用从零写，直接在骨架上填肉就行。

没有 Express 时，用 Node.js 原生的 `http` 模块写服务器，你需要手动判断每个请求的路径和方法，手动解析请求体，手动设置响应头……代码又长又乱。Express 把这些繁琐的事情都封装好了，让你专注于写业务逻辑。

官方对 Express 的定位是：**"一个路由和中间件的 Web 框架"**。这句话的意思是，Express 的核心就两件事：路由 + 中间件，其他所有功能都建立在这两个概念之上。

> Express 官网：[https://expressjs.com](https://expressjs.com)（中文：[https://www.expressjs.com.cn](https://www.expressjs.com.cn)）

### 1.1 安装与基础使用

```bash
mkdir my-server
cd my-server
npm init -y
# 安装 Express 5（新项目默认使用）
npm install express
```

```javascript
// index.js

// 第一步：引入 express 模块
const express = require('express')

// 第二步：调用 express() 创建应用实例，习惯命名为 app
// app 就是整个服务器的"控制中心"，后续所有路由、中间件都挂在它上面
const app = express()

// 第三步：定义路由
// app.get(路径, 处理函数) — 监听 GET 请求
// 当浏览器访问 http://localhost:3000/ 时，执行这个回调
app.get('/', (req, res) => {
  // ⚡ res.send() 是 Express 独有的方法，原生 Node.js 没有！
  // 原生只有 response.end('ok')，需要手动设置响应头、手动结束响应
  // Express 的 res.send() 帮你自动做了三件事：
  //   1. 自动识别数据类型，设置对应的 Content-Type 响应头
  //   2. 自动处理字符串 / 对象 / Buffer 等不同类型
  //   3. 自动结束响应（不需要再调 res.end()）
  res.send('Hello Express!')
})

// 第四步：启动服务器，监听 3000 端口
// 第二个参数是启动成功后的回调，可以省略
app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000')
})
```

```bash
node index.js
# 推荐开发时用 nodemon，文件变更自动重启：
# npm install -g nodemon
# nodemon index.js
```

### 1.2 Express 5 新特性与迁移重点

Express 5 是 Express 4 发布多年后的重大更新。新项目可以直接从 Express 5 开始；维护 Express 4 老项目时，下面这些点是迁移时最容易踩坑的地方：

**① 原生 async/await 错误处理**

```javascript
// Express 4：async 路由必须手动 try/catch
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    next(err)  // 必须手动传给 next
  }
})

// Express 5：async 路由抛出的错误自动传给错误处理中间件
app.get('/users', async (req, res) => {
  const users = await User.find()  // 如果抛出错误，自动传给错误处理中间件
  res.json(users)
})
```

**② 路由语法变化（底层 path-to-regexp 升级）**

```javascript
// Express 4：通配符写法
app.get('*', handler)

// Express 5：必须命名通配符
app.get('/*splat', handler)
// 如果你还希望匹配根路径 /
app.get('/{*splat}', handler)

// Express 4：可选参数
app.get('/users/:id?', handler)

// Express 5：可选参数新语法
app.get('/users{/:id}', handler)
```

**③ 移除了废弃的方法**

```javascript
// Express 5 移除了：
// app.del() → 改用 app.delete()
// req.param(name) → 改用 req.params / req.query / req.body
// res.json(status, obj) → 改用 res.status(status).json(obj)
```

**④ req.body 不再默认为空对象**

Express 4 里，即使你没配置任何 body-parser，`req.body` 也是一个空对象 `{}`，不会报错，只是拿不到数据。这容易让人误以为"配不配都行"。
body-parser 就是用来解析前端发过来的「请求体数据」的工具
比如：JSON、表单、POST 提交的数据。

Express 5 改成了：没配置就是 `undefined`，访问 `req.body.name` 直接报错，强迫你显式配置，更安全也更明确。

```javascript
// Express 5：如果没有配置 body-parser，req.body 是 undefined
// 必须显式配置这两行，才能在路由里用 req.body 拿到数据：

// ① 解析前端发来的 JSON 格式数据（fetch/axios 默认发 JSON）
app.use(express.json())

// ② 解析 HTML 表单提交的数据（<form> 默认提交格式）
// extended: false — Express 5 把默认值从 true 改成了 false
//   false = 用 Node 内置的 querystring 解析，简单安全，够用
//   true  = 用第三方 qs 库解析，支持嵌套对象，但大多数场景用不到
app.use(express.urlencoded({ extended: false }))
```

**⑤ Node.js 版本要求**

Express 5 要求 Node.js 18+。不过从 2026 年的新项目角度，建议直接使用 Node.js 24 LTS 作为开发和部署基线，避免一边学新框架、一边踩旧运行时兼容问题。

### 1.3 Express vs 原生 http 模块

```javascript
// 原生 http：手动判断路径和方法，代码冗长
const http = require('http')
http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify([]))
  } else if (req.method === 'POST' && req.url === '/users') {
    // 还要手动解析请求体...
  }
})

// Express：声明式路由，简洁清晰，自动解析请求体
const express = require('express')
const app = express()
app.use(express.json())
app.get('/users', (req, res) => res.json([]))
app.post('/users', (req, res) => {
  const { name } = req.body  // 自动解析好了
  res.status(201).json({ name })
})
```

---

## 二、路由系统

### 2.0 路由是什么

**路由（Routing）就是"请求的分发规则"**：当一个请求进来，服务器根据请求的 **路径** 和 **HTTP 方法**，决定由哪段代码来处理它。

生活类比：路由就像餐厅的服务员分配机制——"点餐的去1号台，结账的去收银台，投诉的找经理"。不同的事情，找不同的人处理。

在 Express 里，一条路由由三部分组成：

```
HTTP方法   路径        处理函数
  ↓         ↓            ↓
app.get( '/users', (req, res) => { ... } )
```

> 路径后面不止能传一个处理函数，还可以在中间插入任意多个中间件：
> ```
> app.get( '/users', 中间件1, 中间件2, ..., 最终处理函数 )
> ```
> 比如 `app.get('/profile', checkLogin, checkAdmin, handler)`，先验证登录，再验证权限，最后才执行业务逻辑。这个在后面中间件章节会详细讲。

- **HTTP 方法**：GET（查询）、POST（新增）、PUT（修改）、DELETE（删除）
- **路径**：URL 中的路径部分，如 `/users`、`/users/123`
- **处理函数**：匹配成功后执行的回调，接收 `req`（请求）和 `res`（响应）两个参数

**路由的匹配过程**：Express 从上到下依次检查每条路由，找到第一条"方法 + 路径"都匹配的规则，执行对应的处理函数，然后停止继续往下匹配（除非你调用了 `next()`,next () = 继续往下匹配下一条路由）。

### 2.1 基础路由

四种最常用的 HTTP 方法对应 CRUD 操作：GET 查、POST 增、PUT 改、DELETE 删。

```javascript
const express = require('express')
const app = express()

// GET /users — 查询用户列表
// 约定：GET 请求用于"获取数据"，不修改服务器状态
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: '张三' }])  // 返回 JSON 数组
})

// POST /users — 创建新用户
// 约定：POST 请求用于"新增数据"，数据放在请求体里
app.post('/users', (req, res) => {
  // 201 Created：表示资源创建成功（比 200 更语义化）
  res.status(201).json({ message: '创建成功' })
})

// PUT /users/:id — 更新指定用户
// 约定：PUT 请求用于"完整替换"某条数据
app.put('/users/:id', (req, res) => {
  res.json({ message: '更新成功' })
})

// DELETE /users/:id — 删除指定用户
// 约定：DELETE 请求用于"删除数据"
app.delete('/users/:id', (req, res) => {
  // 204 No Content：删除成功，但不返回任何内容（body 为空）
  // HTTP 规范规定 204 响应不能有响应体，所以不能用 res.json()
  // res.send() 不传参数 = 发一个空响应体，完全符合 204 规范
  // 这也是 send() 比原生 end() 方便的地方：语义更清晰
  res.status(204).send()
})

// app.all() — 匹配所有 HTTP 方法，常用于统一处理某个路径的所有请求
app.all('/test', (req, res) => {
  res.send(`收到 ${req.method} 请求`)
})
```

### 2.2 路由参数的三种类型

在 Express 中，从请求里获取数据有三种方式，初学者很容易混淆，这里先把概念讲清楚：

| 类型 | 位置 | 对象 | 示例 URL |
|------|------|------|----------|
| 路径参数 | URL 路径中 | `req.params` | `/users/123` → id=123 |
| 查询参数 | URL `?` 后面 | `req.query` | `/search?keyword=node` |
| 请求体参数 | 请求体（body）中 | `req.body` | POST 表单 / JSON 数据 |

**路径参数**：把变化的部分嵌入路径里，用 `:参数名` 标记。适合表示"某个具体资源的 ID"，如 `/users/123`、`/articles/456`。

**查询参数**：跟在 `?` 后面的键值对，多个用 `&` 分隔。适合表示"筛选条件、分页、搜索关键词"，如 `/search?keyword=node&page=2`。

**请求体参数**：数据放在请求体里，不显示在 URL 中。适合传递"敏感数据或大量数据"，如登录的用户名密码、提交的表单内容。

```javascript
// 路径参数（:xxx）
// req.params — 包含路径参数的对象
app.get('/users/:id', (req, res) => {
  const { id } = req.params  // req.params.id
  res.json({ id, name: '用户' + id })
})

// 多个路径参数
app.get('/posts/:year/:month/:day', (req, res) => {
  const { year, month, day } = req.params
  res.json({ year, month, day })
})

// Express 5 可选参数语法变化：
// Express 4：app.get('/users/:id?', handler)
// Express 5：app.get('/users{/:id}', handler)  ← 新语法
app.get('/users{/:id}', (req, res) => {
  const id = req.params.id || 'all'
  res.json({ id })
})

// 查询字符串参数（?key=value）
// req.query — 包含查询参数的对象（值均为字符串）
app.get('/search', (req, res) => {
  const { keyword, page = '1', limit = '10' } = req.query
  // GET /search?keyword=node&page=2
  // 注意：page 和 limit 是字符串，需要转换
  res.json({ keyword, page: Number(page), limit: Number(limit) })
})

// ⚠️ 废弃：req.param(name) 在 Express 5 中已移除
// 不要使用 req.param('id')，改用：
// req.params.id（路径参数）
// req.query.id（查询参数）
// req.body.id（请求体参数）
```

### 2.3 请求体参数

请求体（body）里的数据默认是原始字节流，Express 不知道你传的是 JSON 还是表单，所以需要先配置中间件来"翻译"它。

可以把它理解成**提前声明翻译官**：你得先告诉 Express "我要用这个翻译官"，它才知道怎么处理进来的数据。不声明就没有翻译官，`req.body` 就是 `undefined`。

- `express.json()` → JSON 翻译官（负责翻译前端发来的 JSON 数据）
- `express.urlencoded()` → 表单翻译官（负责翻译 HTML 表单提交的数据）

```javascript
// express.json() — 解析 Content-Type: application/json 的请求体
// 前端用 fetch/axios 发 JSON 时用这个
app.use(express.json())

// express.urlencoded() — 解析 Content-Type: application/x-www-form-urlencoded 的请求体
// HTML 表单默认提交格式就是这种（key=value&key2=value2）
// extended: true  → 用 qs 库解析，支持嵌套对象（如 user[name]=张三）
// extended: false → 用内置 querystring 解析，只支持简单键值对（推荐，够用且安全）
app.use(express.urlencoded({ extended: false }))

app.post('/users', (req, res) => {
  // 配置好中间件后，req.body 就是解析好的 JS 对象，直接用
  const { name, email } = req.body
  res.status(201).json({ name, email })
})
```

> **关于 body-parser 包**：Express 4.16+ 已将 `body-parser` 的核心功能内置为 `express.json()` 和 `express.urlencoded()`，日常开发直接用内置方式即可。老项目或教程中可能还会看到：
> ```javascript
> // 老写法（了解即可，新项目不推荐）
> const bodyParser = require('body-parser')
> app.use(bodyParser.json())
> app.use(bodyParser.urlencoded({ extended: false }))
> ```

### 2.4 Router 模块化路由

**为什么需要 Router？**

当项目变大，路由会越来越多。如果全部写在 `app.js` 一个文件里，这个文件会变得非常臃肿，难以维护。

`express.Router()` 可以创建一个"迷你版的 app"，专门管理某一类路由，然后挂载到主应用上。这样每类资源（用户、文章、订单）都有自己独立的路由文件，职责清晰。

```
app.js（主文件）
  ├── /api/users  → routes/users.js（用户相关路由）
  ├── /api/articles → routes/articles.js（文章相关路由）
  └── /api/orders → routes/orders.js（订单相关路由）
```

当路由很多时，把所有路由写在一个文件里会很乱。用 `Router` 拆分：

```javascript
// routes/users.js
const express = require('express')
const router = express.Router()

// 这里的路径是相对于挂载点的
router.get('/', (req, res) => {
  res.json([{ id: 1, name: '张三' }])
})

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id })
})

router.post('/', (req, res) => {
  res.status(201).json({ message: '创建成功' })
})

module.exports = router

// routes/articles.js
const router = require('express').Router()

router.get('/', (req, res) => res.json([]))
router.post('/', (req, res) => res.status(201).json({}))

module.exports = router

// app.js — 挂载路由
const express = require('express')
const app = express()

app.use(express.json())

const usersRouter = require('./routes/users')
const articlesRouter = require('./routes/articles')

app.use('/api/users', usersRouter)      // /api/users/xxx
app.use('/api/articles', articlesRouter) // /api/articles/xxx

app.listen(3000)
```

### 2.5 自定义 404 路由

Express 5 里通配符必须命名。兜底 404 通常放在所有路由的最后：

```javascript
// 必须放在所有路由定义之后
app.all('/{*splat}', (req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>')
})

// 或者返回 JSON（API 项目更常用）
app.use((req, res) => {
  res.status(404).json({ code: 404, message: `${req.method} ${req.path} 不存在` })
})
```

> 如果你在旧教程里看到 `app.all('*', ...)`，那是 Express 4 常见写法；Express 5 中需改为 `app.all('/{*splat}', ...)`。

---

## 三、中间件机制

### 3.0 中间件是什么

**中间件（Middleware）是处于"请求到达"和"响应发出"之间的函数。**

官方定义：中间件函数可以访问请求对象（`req`）、响应对象（`res`），以及请求-响应周期中的下一个中间件函数（`next`）。

生活类比：快递从发货到收货，中间要经过"分拣中心 → 转运中心 → 派送站"，每个环节都可以对包裹做一些处理（扫码、称重、贴标签），然后传给下一个环节。中间件就是这些"中间处理环节"。

**中间件能做什么？**
- 记录日志（每个请求进来都打印一条日志）
- 验证身份（检查 token，没登录就拦截）
- 解析数据（把请求体的 JSON 字符串解析成 JS 对象）
- 处理跨域（给响应加上 CORS 头）
- 统一错误处理（捕获所有未处理的错误）

**中间件的执行顺序**：Express 按照 `app.use()` 的注册顺序，从上到下依次执行中间件。每个中间件执行完后，必须调用 `next()` 才能把控制权交给下一个，否则请求会一直挂起，浏览器转圈等待。

中间件的执行是**洋葱模型**（进去时从外到内，出来时从内到外）：

```
请求进入
  ↓
中间件1（进）→ 中间件2（进）→ 路由处理函数
                                    ↓
中间件1（出）← 中间件2（出）← 路由处理完成
  ↓
响应发出
```

### 3.1 什么是中间件

中间件是一个函数，接收 `req`、`res`、`next` 三个参数：

```javascript
// 中间件函数的标准写法
function myMiddleware(req, res, next) {
  // 在这里可以：
  // 1. 读取/修改 req 对象（比如给 req 加一个属性）
  // 2. 读取/修改 res 对象（比如提前设置响应头）
  // 3. 直接发送响应（比如权限不足时直接返回 401，不再往下走）
  // 4. 调用 next() 把控制权交给下一个中间件或路由

  console.log('中间件执行了')

  // ⚠️ 必须调用 next()，否则请求会永远挂起，浏览器一直转圈
  // next() 的意思是："我处理完了，交给下一个"
  next()

  // 如果想终止请求（比如验证失败），就直接发响应，不调用 next()
  // return res.status(401).json({ error: '未授权' })
}
```

中间件的执行是**洋葱模型**：

```
请求 → 中间件1 → 中间件2 → 路由处理 → 中间件2 → 中间件1 → 响应
```

### 3.2 全局中间件

**全局中间件**：用 `app.use()` 注册，对所有请求都生效，不管访问哪个路径都会经过它。

```javascript
const express = require('express')
const app = express()

// 自定义日志中间件：每个请求进来都打印一行日志
// new Date().toISOString() 输出标准时间格式，如 2026-04-19T05:00:00.000Z
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()  // 打完日志，继续往下走
})

// express.json() 是 Express 内置的中间件
// 作用：把请求体里的 JSON 字符串解析成 JS 对象，挂到 req.body 上
// 必须放在路由之前，否则路由里拿到的 req.body 是 undefined
app.use(express.json())

// 同上，解析表单格式的请求体
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.send('Hello')
})
```

### 3.3 路由级中间件

**路由级中间件**：只对特定路径或特定路由生效，不影响其他路由。常用于"只有某些接口需要登录验证"的场景。

```javascript
// app.use('/api', ...) — 只有路径以 /api 开头的请求才会经过这个中间件
app.use('/api', (req, res, next) => {
  console.log('API 请求')
  next()
})

// 把中间件写成独立函数，方便复用
function checkLogin(req, res, next) {
  // 从请求头里取 Authorization 字段（前端登录后会带上 token）
  const token = req.headers.authorization
  if (!token) {
    // return 的作用：发完响应后立即结束函数，不再执行 next()
    // 如果不加 return，发完 401 后还会继续执行 next()，导致"响应已发送还想再发"的报错
    return res.status(401).json({ error: '请先登录' })
  }
  // token 存在，放行
  next()
}

// 把 checkLogin 作为第二个参数传入，只有这个路由会经过它
app.get('/profile', checkLogin, (req, res) => {
  res.json({ name: '用户信息' })
})

// 多个中间件按顺序执行：先验证登录，再验证管理员权限
app.post('/admin/users', checkLogin, checkAdmin, (req, res) => {
  res.json({ message: '创建成功' })
})
```

### 3.4 错误处理中间件

**错误处理中间件**是一种特殊的中间件，专门用来捕获和处理程序运行中抛出的错误。

它和普通中间件的区别只有一个：**参数是四个**（`err, req, res, next`），Express 通过参数数量来识别它是错误处理中间件。必须放在所有路由之后注册，这样才能捕获到前面所有路由和中间件里抛出的错误。

错误处理中间件有**四个参数**（`err, req, res, next`），必须放在所有路由之后：

```javascript
// 在路由中触发错误的两种方式：

// 方式一：直接 throw（同步代码可以用）
app.get('/error', (req, res, next) => {
  throw new Error('出错了')
  // Express 会自动捕获同步 throw，传给错误处理中间件
})

// 方式二：调用 next(err)（推荐，尤其是异步代码必须用这种）
app.get('/error2', (req, res, next) => {
  next(new Error('出错了'))
  // 只要 next() 里传了参数，Express 就知道这是一个错误，跳过普通中间件，直接找错误处理中间件
})

// 异步路由：Express 4 必须手动 try/catch + next(err)
app.get('/async', async (req, res, next) => {
  try {
    const data = await someAsyncOperation()
    res.json(data)
  } catch (err) {
    next(err)  // 把错误传给错误处理中间件
  }
})

// 错误处理中间件：必须是四个参数，Express 通过参数数量识别它
// err — 错误对象（就是 throw 的那个 Error 或 next(err) 传的那个）
app.use((err, req, res, next) => {
  console.error(err.stack)  // 打印完整错误堆栈，方便调试

  // err.status 是自定义的状态码（如 new Error() 后手动设置 err.status = 400）
  // 如果没有，默认用 500（服务器内部错误）
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误'
  })
})
```

### 3.5 内置中间件

Express 自带三个常用中间件，不需要额外安装：

```javascript
// express.json() — 解析 JSON 格式的请求体
// 解析后的数据挂到 req.body，不配置则 req.body 为 undefined
app.use(express.json())

// express.urlencoded() — 解析表单格式的请求体（application/x-www-form-urlencoded）
app.use(express.urlencoded({ extended: false }))

// express.static() — 托管静态文件（详见第四章）
// 把 public 目录下的文件直接对外提供访问，不需要写路由
app.use(express.static('public'))
// 加路径前缀：访问 /static/xxx 才能拿到 public 目录下的文件
app.use('/static', express.static('public'))
```

### 3.6 常用第三方中间件

```bash
npm i cors morgan
```

```javascript
const cors = require('cors')
const morgan = require('morgan')

// cors — 处理跨域问题
// 浏览器的"同源策略"会阻止前端（如 localhost:5173）请求后端（localhost:3000）
// cors 中间件会在响应头里加上 Access-Control-Allow-Origin 等字段，告诉浏览器"允许跨域"
app.use(cors())  // 允许所有来源（开发时方便，生产环境要限制）

// 精细配置：只允许指定来源
app.use(cors({
  origin: 'http://localhost:5173',  // 只允许这个前端地址访问
  credentials: true                  // 允许携带 Cookie（登录态等）
}))

// morgan — HTTP 请求日志中间件
// 每个请求进来都自动打印一行日志，方便调试
app.use(morgan('dev'))
// 'dev' 格式输出示例：GET /api/users 200 5.123 ms - 45
//                      方法  路径      状态码 耗时     响应大小(字节)
// 其他格式：'combined'（生产环境用，包含 IP、时间等更多信息）
```

---

## 四、静态资源服务

### 4.0 什么是静态资源

**静态资源**是指内容固定不变、不需要服务器动态生成的文件，比如：HTML 文件、CSS 样式表、JavaScript 脚本、图片、字体文件等。

与之对应的是**动态资源**：内容根据请求参数、数据库数据实时生成，比如用户的个人主页（不同用户看到不同内容）。

Express 内置了 `express.static()` 中间件，可以把某个目录下的文件直接作为静态资源对外提供访问，不需要为每个文件单独写路由。

### 4.1 基础用法

```javascript
// 把 public 目录下的文件作为静态资源
app.use(express.static('public'))

// 访问 public/index.html → http://localhost:3000/index.html
// 访问 public/css/style.css → http://localhost:3000/css/style.css
// 访问 public/images/logo.png → http://localhost:3000/images/logo.png
```

### 4.2 注意事项

```javascript
// 1. 路径是相对于启动 node 的目录，不是文件所在目录
// 推荐用绝对路径
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

// 2. 可以设置虚拟路径前缀
app.use('/assets', express.static(path.join(__dirname, 'public')))
// 访问：http://localhost:3000/assets/style.css

// 3. 多个静态目录
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'uploads')))
// 按顺序查找，找到就返回

// 4. 静态资源中间件要放在路由之前
app.use(express.static('public'))  // 先处理静态文件
app.get('/', (req, res) => { ... }) // 再处理路由
```

---

## 五、ejs 模板引擎

### 5.0 什么是模板引擎，为什么需要它

**模板引擎是一种将"数据"和"HTML 模板"合并，生成最终 HTML 页面的技术。**

想象一下：你要给 1000 个用户各发一封邮件，内容大致相同，只有姓名和订单号不同。你不会手写 1000 封，而是写一个模板："亲爱的 `{{姓名}}`，您的订单 `{{订单号}}` 已发货"，然后把数据填进去批量生成。模板引擎做的就是这件事，只不过生成的是 HTML 页面。

**没有模板引擎时**，服务器要返回 HTML 页面，只能用字符串拼接：

```javascript
// 非常难维护，一旦 HTML 复杂就是噩梦
res.send(`<html><body><h1>你好，${username}</h1><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></body></html>`)
```

**有了模板引擎**，HTML 写在单独的 `.ejs` 文件里，数据通过特殊标签嵌入，清晰易维护。

**ejs（Embedded JavaScript）** 是最流行的 Node.js 模板引擎之一，语法简单，就是在 HTML 里嵌入 JavaScript 代码。官网：[https://ejs.co](https://ejs.co)

> 注意：模板引擎是"服务端渲染（SSR）"的方案。现代前端开发更多用 Vue/React 做"客户端渲染（CSR）"，但 SSR 在 SEO、首屏速度方面有优势，两种方案各有适用场景。

### 5.1 安装与配置

```bash
npm install ejs
```

```javascript
const express = require('express')
const path = require('path')
const app = express()

// app.set(key, value) — 设置 Express 应用级别的配置项
// 'view engine' 告诉 Express 用哪个模板引擎来渲染 .ejs 文件
app.set('view engine', 'ejs')

// 'views' 告诉 Express 去哪个目录找模板文件
// 默认就是 views/，这行可以省略；如果你的模板放在别的地方才需要改
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  // res.render(模板名, 数据对象)
  // 模板名不需要写扩展名，Express 会自动加 .ejs
  // 数据对象里的属性会作为变量注入到模板里，模板里可以直接用 title、users
  res.render('index', {
    title: '首页',
    users: [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ]
  })
  // Express 找到 views/index.ejs，把数据填进去，生成 HTML，发给浏览器
})
```

### 5.2 ejs 语法

```html
<!-- views/index.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
</head>
<body>
  <h1><%= title %></h1>

  <!-- 输出变量（自动转义 HTML，防 XSS） -->
  <p>欢迎，<%= username %></p>

  <!-- 输出原始 HTML（不转义，谨慎使用） -->
  <div><%- htmlContent %></div>

  <!-- 条件判断 -->
  <% if (isLoggedIn) { %>
    <p>已登录</p>
  <% } else { %>
    <p>未登录</p>
  <% } %>

  <!-- 循环 -->
  <ul>
    <% users.forEach(user => { %>
      <li><%= user.id %> - <%= user.name %></li>
    <% }) %>
  </ul>

  <!-- 引入其他模板（partials） -->
  <%- include('partials/header') %>
  <%- include('partials/footer', { year: 2026 }) %>
</body>
</html>
```

### 5.3 ejs 标签总结

| 标签 | 说明 |
|------|------|
| `<%= xxx %>` | 输出变量（HTML 转义，防 XSS） |
| `<%- xxx %>` | 输出原始 HTML（不转义，谨慎使用） |
| `<% code %>` | 执行 JS 代码（不输出） |
| `<%# 注释 %>` | 注释（不输出到 HTML） |
| `<%- include('path') %>` | 引入子模板 |
| `<%- include('path', { key: val }) %>` | 引入子模板并传参 |

### 5.4 ejs 独立使用（不依赖 Express）

ejs 本身是独立的模板库，可以脱离 Express 直接在 Node.js 中使用：

```javascript
const ejs = require('ejs')

// ejs.render(template, data) — 直接渲染字符串模板
const people = ['张三', '李四', '王五']
const html = ejs.render('<%= people.join(", ") %>', { people })
console.log(html)  // 张三, 李四, 王五

// ejs.renderFile(path, data, callback) — 渲染文件
ejs.renderFile('./views/index.ejs', { title: '首页' }, (err, html) => {
  if (err) throw err
  console.log(html)
})

// Promise 写法
const html2 = await ejs.renderFile('./views/index.ejs', { title: '首页' })
```

---

## 六、express-generator 脚手架

### 6.1 安装与使用

```bash
# 官方更推荐直接用 npx，避免全局安装旧版本
npx express-generator --view=ejs my-project

# 如果你经常新建脚手架项目，再考虑全局安装
# npm install -g express-generator

# 进入目录，安装依赖
cd my-project
npm install

# 启动（默认端口 3000）
npm start
```

### 6.2 生成的项目结构

```
my-project/
├── app.js              ← 应用主文件（中间件配置、路由挂载）
├── bin/
│   └── www             ← 启动脚本（设置端口、启动 HTTP 服务器）
├── public/             ← 静态资源
│   ├── images/
│   ├── javascripts/
│   └── stylesheets/
├── routes/             ← 路由文件
│   ├── index.js        ← 首页路由
│   └── users.js        ← 用户路由
├── views/              ← ejs 模板
│   ├── error.ejs
│   └── index.ejs
└── package.json
```

---

## 七、req 对象常用属性速查

**req（request）对象**代表客户端发来的 HTTP 请求，Express 在原生 Node.js `IncomingMessage` 对象的基础上扩展了很多便捷属性。简单说：**req 里装着客户端告诉服务器的所有信息**——它想要什么、带了什么数据、从哪里来。

```javascript
// ── 请求基本信息 ──
req.method        // 请求方法：'GET' | 'POST' | 'PUT' | 'DELETE' ...
req.url           // 完整 URL（含查询字符串）：'/users?page=1'
req.path          // 路径部分（不含查询字符串）：'/users'
req.hostname      // 主机名：'localhost'
req.ip            // 客户端 IP（需配置 trust proxy 才准确）
req.protocol      // 协议：'http' | 'https'
req.secure        // 是否 HTTPS：true | false
req.httpVersion   // HTTP 版本：'1.1'

// ── 请求参数 ──
req.params        // 路径参数对象：{ id: '123' }
req.query         // 查询字符串对象：{ page: '1', limit: '10' }（值均为字符串）
req.body          // 请求体（需配置 body parser 中间件，否则为 undefined）

// ⚠️ req.param(name) 在 Express 5 中已移除，不要使用

// ── 请求头 ──
req.headers                    // 所有请求头对象（键名全小写）
req.get('Content-Type')        // 获取指定请求头（推荐，大小写不敏感）
req.get('Authorization')       // 获取 Authorization 头

// ── Cookie ──
// 需要安装 cookie-parser 中间件：npm i cookie-parser
req.cookies        // 已解析的 Cookie 对象：{ token: 'xxx' }
req.signedCookies  // 已签名的 Cookie 对象

// ── 其他 ──
req.xhr            // 是否为 Ajax 请求（X-Requested-With: XMLHttpRequest）
req.fresh          // 响应是否仍然新鲜（用于缓存协商）
req.stale          // req.fresh 的反义
req.accepts('json')  // 检查客户端是否接受指定内容类型
```

---

## 八、res 对象常用方法速查

**res（response）对象**代表服务器要发给客户端的 HTTP 响应，Express 在原生 `ServerResponse` 基础上扩展了大量便捷方法。简单说：**res 是服务器回复客户端的工具箱**——你用它决定回什么内容、什么状态码、什么格式。

> 注意：一个请求只能发送一次响应。调用了 `res.send()` / `res.json()` / `res.redirect()` 等方法后，不能再调用其他发送响应的方法，否则会报 "Cannot set headers after they are sent" 错误。

```javascript
// ── 发送响应 ──

// ⚡ 重要：res.send() / res.json() 等方法都是 Express 独有的！
// 原生 Node.js 只有 response.end() 和 response.write()，需要手动设置一切
// Express 在原生基础上封装了这些便捷方法，帮你省掉大量重复代码

// res.send([body]) — 万能发送方法，自动识别类型并设置 Content-Type
//   传字符串 → Content-Type: text/html
//   传对象/数组 → Content-Type: application/json（自动序列化）
//   传 Buffer → Content-Type: application/octet-stream
res.send('Hello')                    // → text/html
res.send({ key: 'value' })           // → application/json
res.send(Buffer.from('binary data')) // → application/octet-stream

// res.json([body]) — 发送 JSON 响应
//   body: 任意可序列化的值
res.json({ key: 'value' })
res.status(201).json({ id: 1 })

// ⚠️ 废弃（Express 5 已移除）：
// res.json(status, obj)  → 改用 res.status(status).json(obj)
// res.jsonp(obj, status) → 改用 res.status(status).jsonp(obj)
// res.send(body, status) → 改用 res.status(status).send(body)
// res.send(status)       → 改用 res.sendStatus(status)
// res.sendfile()         → 改用 res.sendFile()（注意大写 F）

// res.sendFile(path[, options][, fn]) — 发送文件
//   path: 文件绝对路径（必须是绝对路径）
//   options.root: 相对路径的根目录
//   options.maxAge: 缓存时间（毫秒）
//   fn: 发送完成后的回调 (err) => void
res.sendFile(path.join(__dirname, 'file.pdf'))

// res.download(path[, filename][, options][, fn]) — 触发文件下载
//   path: 文件路径
//   filename: 下载时显示的文件名（可选）
res.download('./report.pdf', '报告.pdf')

// res.redirect([status,] url) — 重定向
//   status: HTTP 状态码（默认 302）
//   url: 目标 URL
res.redirect('/login')
res.redirect(301, '/new-url')

// res.end([data][, encoding]) — 结束响应（无内容）
res.end()

// ── 设置响应头 ──
// res.set(field[, value]) / res.header(field[, value])
res.set('X-Custom', 'value')
res.set({ 'X-A': '1', 'X-B': '2' })

// res.type(type) — 设置 Content-Type
res.type('json')       // application/json
res.type('text/html')
res.type('.html')      // 根据扩展名自动识别
res.type('text/html')

// ── Cookie ──
res.cookie('name', 'value', { httpOnly: true, maxAge: 86400000 })
// 如果设置时传过 path / domain / sameSite，清除时要带上同样的选项
res.clearCookie('name')

// ── 渲染模板 ──
res.render('index', { title: '首页' })

// ── 链式调用 ──
res.status(400).set('X-Error', 'true').json({ error: '参数错误' })
```

---

## 九、生产级项目结构推荐

### 9.0 为什么要分层

初学时把所有代码写在一个文件里没问题，但项目一旦变大，就会出现"一个函数又查数据库又处理业务又返回响应"的混乱局面，改一处可能牵连很多地方。

分层架构的核心思想是**职责分离**：每一层只做自己该做的事，层与层之间通过接口通信。

| 层 | 职责 | 举例 |
|----|------|------|
| routes（路由层） | 只负责"接收请求，分发给谁处理" | `GET /users` → 交给 userController |
| controllers（控制器层） | 处理请求/响应，调用 service | 从 req 取参数，调 service，把结果 res.json() |
| services（业务逻辑层） | 核心业务逻辑，不关心 HTTP | 查数据库、计算、校验规则 |
| models（数据模型层） | 定义数据结构，操作数据库 | Mongoose Schema，增删改查 |

这样的好处：改数据库只动 model，改业务规则只动 service，改接口格式只动 controller，互不影响。

```
my-api/
├── src/
│   ├── app.js              ← Express 应用配置
│   ├── server.js           ← 启动入口
│   ├── routes/             ← 路由层（只做路由分发）
│   │   ├── index.js        ← 汇总所有路由
│   │   ├── users.js
│   │   └── articles.js
│   ├── controllers/        ← 控制器层（处理请求/响应）
│   │   ├── userController.js
│   │   └── articleController.js
│   ├── services/           ← 业务逻辑层
│   │   ├── userService.js
│   │   └── articleService.js
│   ├── models/             ← 数据模型层（Mongoose Schema）
│   │   ├── User.js
│   │   └── Article.js
│   ├── middleware/         ← 自定义中间件
│   │   ├── auth.js         ← JWT 认证
│   │   ├── validate.js     ← 参数校验
│   │   └── errorHandler.js ← 统一错误处理
│   └── utils/              ← 工具函数
│       ├── response.js     ← 统一响应格式
│       └── logger.js       ← 日志工具
├── .env                    ← 环境变量（不提交 git）
├── .env.example            ← 环境变量模板
└── package.json
```

```javascript
// src/app.js — 应用配置文件，只负责"组装"，不负责启动
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const errorHandler = require('./middleware/errorHandler')
const routes = require('./routes')  // 汇总所有路由的入口文件

const app = express()

// ── 中间件注册（顺序很重要，从上到下依次执行）──

// 跨域：允许哪些前端地址访问，从环境变量读取，没配置则允许所有
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }))

// 解析请求体，limit 限制最大请求体大小，防止恶意大请求
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: false }))

// 日志：生产环境用 combined（记录更多信息），开发环境用 dev（简洁易读）
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── 路由挂载 ──
// 所有 API 路由都加 /api/v1 前缀，方便以后升级到 v2 时共存
app.use('/api/v1', routes)

// ── 兜底处理（必须放在所有路由之后）──

// 404：走到这里说明前面所有路由都没匹配上
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' })
})

// 统一错误处理：四个参数，捕获前面所有路由和中间件里的错误
app.use(errorHandler)

// 导出 app，由 server.js 负责启动（职责分离：配置和启动分开）
module.exports = app
```

```javascript
// src/middleware/errorHandler.js — 统一错误处理中间件
module.exports = (err, req, res, next) => {
  // 打印完整错误堆栈，方便排查问题
  console.error(`[${new Date().toISOString()}] ${err.stack}`)

  // 针对不同类型的错误，返回更友好的提示
  // （这些错误类型在后面学 MongoDB/JWT 时会遇到）

  // Mongoose 数据校验失败（如必填字段为空）
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ code: 400, message: errors.join(', ') })
  }

  // MongoDB 唯一索引冲突（如邮箱已注册）
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({ code: 409, message: `${field} 已存在` })
  }

  // JWT token 格式错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ code: 401, message: 'token 无效' })
  }
  // JWT token 已过期
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ code: 401, message: 'token 已过期' })
  }

  // 兜底：其他未知错误
  // 生产环境不暴露具体错误信息（防止泄露服务器内部细节），只说"内部错误"
  // 开发环境显示真实错误信息，方便调试
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  })
}
```

---

## 十、小结

| 知识点 | 核心要点 |
|--------|----------|
| Express 5 | 原生 async/await 错误处理，路由语法变化，要求 Node.js 18+，新项目建议配 Node.js 24 LTS |
| 路由 | `app.get/post/put/delete(path, handler)` |
| 路由参数 | `req.params`（路径参数）/ `req.query`（查询参数）/ `req.body`（请求体） |
| 自定义 404 | `app.all('/{*splat}', handler)` 放在所有路由之后 |
| Router | 模块化路由，`app.use('/prefix', router)` 挂载 |
| 中间件 | `(req, res, next)` 三参数，调用 `next()` 传递控制权 |
| 错误中间件 | `(err, req, res, next)` 四参数，放在所有路由之后 |
| 静态资源 | `express.static(path.join(__dirname, 'public'))` |
| ejs | `<%= %>` 输出（转义），`<%- %>` 输出（不转义），`<% %>` 执行代码 |
| body-parser | Express 4.16+ 已内置，直接用 `express.json()` / `express.urlencoded()` |
| req 速查 | `req.params` / `req.query` / `req.body` / `req.get()` / `req.headers` |
| res 速查 | `res.send()` / `res.json()` / `res.status()` / `res.redirect()` / `res.sendFile()` |
| 项目结构 | routes → controllers → services → models 分层架构 |

**下一篇**预告：MongoDB 数据库实战，从安装配置到 Mongoose ODM，掌握文档型数据库的 CRUD 操作、聚合管道和关联查询。
