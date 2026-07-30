---
title: "接口与会话控制详解第四篇：Session 原理与实战"
slug: "node-js-session-9e7c15d4"
summary: "深入理解 Session 的工作原理，掌握 express-session 的完整配置，实现登录/退出/鉴权，以及生产环境中用 Redis 持久化 Session 的完整方案。"
category: "接口与会话控制详解"
categoryPath:
  - "后端技术"
  - "Node.js"
  - "接口与会话控制详解"
tags:
  - "Node.js"
  - "Session"
  - "Cookie"
  - "express-session"
  - "Redis"
  - "会话控制"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291e8a2b1c68f2cac1ac"
originalSlug: "node-js-session-9e7c15d4"
originalStatus: "published"
publishedAt: "2026-04-21T13:20:35.663Z"
updatedAt: "2026-06-19T06:25:27.653Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 接口与会话控制详解第四篇：Session 原理与实战

> Session 是传统 Web 应用最常用的认证方案。理解它和 Cookie 的关系，是理解所有会话控制方案的基础。

---

## 一、Session 是什么

### 1.1 Cookie 的问题

上一篇讲了 Cookie，直接把用户 ID 存在 Cookie 里：

```javascript
res.cookie('userId', '123', { signed: true, httpOnly: true })
```

这有几个问题：
1. **Cookie 大小限制 4KB**，存不了太多数据
2. **数据在客户端**，即使签名了，用户也能看到（只是改不了）
3. **无法主动失效**，服务器无法强制让某个用户下线

### 1.2 Session 的解决思路

Session 把用户数据存在**服务器端**，只把一个随机生成的 **Session ID** 存在 Cookie 里：

```
客户端 Cookie：connect.sid = s%3Axxx（只有一个随机 ID）

服务器内存：
{
  'xxx': {
    userId: 123,
    username: '张三',
    role: 'admin',
    loginTime: '2026-04-21 10:00'
  }
}
```

这样：
- Cookie 里只有一个无意义的随机 ID，泄露了也没用
- 真实数据在服务器，用户看不到
- 服务器可以随时删除 Session，强制用户下线

### 1.3 Session 完整流程

```
1. 用户发送登录请求（用户名 + 密码）
2. 服务器验证成功，创建 Session：
   - 生成随机 Session ID（如 abc123xyz）
   - 把用户信息存到服务器内存：{ 'abc123xyz': { userId: 1, ... } }
3. 服务器通过 Set-Cookie 把 Session ID 发给浏览器：
   Set-Cookie: connect.sid=abc123xyz; HttpOnly
4. 浏览器保存 Cookie
5. 用户后续请求自动携带 Cookie：
   Cookie: connect.sid=abc123xyz
6. 服务器收到请求，从 Cookie 取出 Session ID
7. 用 Session ID 在内存里查找对应的用户数据
8. 找到了 → 已登录；找不到 → 未登录
```

---

## 二、express-session 基础使用

### 2.1 安装

```bash
npm install express-session
```

### 2.2 基础配置

```javascript
const express = require('express')
const session = require('express-session')

const app = express()
app.use(express.json())

app.use(session({
  secret: 'my-session-secret',  // 签名密钥（必填）
  resave: false,                 // 每次请求是否强制保存 session（推荐 false）
  saveUninitialized: false,      // 未初始化的 session 是否保存（推荐 false）
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // session 过期时间（1天，毫秒）
    httpOnly: true,               // 禁止 JS 读取
    secure: false,                // 生产环境改为 true（HTTPS）
    sameSite: 'lax'
  }
}))
```

**选项说明**：

```
secret（必填）：
  用于签名 Session ID Cookie，防止伪造
  生产环境放在环境变量里，不要硬编码

resave: false（推荐）：
  false = 只有 session 数据被修改时才保存
  true  = 每次请求都保存（即使没有修改），浪费资源

saveUninitialized: false（推荐）：
  false = 只有 session 被赋值后才创建（节省存储空间）
  true  = 每次请求都创建 session（即使用户没登录）
  注意：某些法律要求（如 GDPR）要求 false
```

### 2.3 操作 Session

```javascript
// 设置 session 数据（登录时）
req.session.user = { id: 1, username: '张三', role: 'admin' }
req.session.loginTime = new Date()

// 读取 session 数据
const user = req.session.user
const loginTime = req.session.loginTime

// 删除某个 session 字段
delete req.session.tempData

// 销毁整个 session（退出登录时）
req.session.destroy(callback)
```

---

## 三、完整登录/退出实战

```javascript
const express = require('express')
const session = require('express-session')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7天
    httpOnly: true,
    sameSite: 'lax'
  }
}))

// 模拟用户数据（实际应查数据库）
const users = [
  { id: 1, username: 'admin', password: '$2b$10$xxx', role: 'admin' },
  { id: 2, username: 'user1', password: '$2b$10$yyy', role: 'user' }
]

// ─── 登录 ───
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' })
  }

  const user = users.find(u => u.username === username)
  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: '用户名或密码错误' })
  }

  // 登录成功：把用户信息存入 session
  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role
  }

  res.json({
    message: '登录成功',
    user: { id: user.id, username: user.username, role: user.role }
  })
})

// ─── 鉴权中间件 ───
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: '请先登录' })
  }
  next()
}

// 权限中间件（需要特定角色）
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: '请先登录' })
    }
    if (req.session.user.role !== role) {
      return res.status(403).json({ message: '权限不足' })
    }
    next()
  }
}

// ─── 获取当前用户信息 ───
app.get('/api/profile', requireLogin, (req, res) => {
  res.json({ user: req.session.user })
})

// ─── 管理员接口 ───
app.get('/api/admin/users', requireRole('admin'), (req, res) => {
  res.json({ users: users.map(u => ({ id: u.id, username: u.username })) })
})

// ─── 退出登录 ───
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: '退出失败' })
    }
    // 清除客户端的 Cookie
    res.clearCookie('connect.sid')
    res.json({ message: '已退出登录' })
  })
})

app.listen(3000, () => console.log('http://localhost:3000'))
```

---

## 四、Session 的存储方式

### 4.1 默认：内存存储（MemoryStore）

```javascript
// 不配置 store 时，默认用内存存储
app.use(session({ secret: 'xxx', ... }))
```

**问题**：
- 服务器重启，所有 Session 丢失，用户需要重新登录
- 多进程/多服务器时，Session 不共享（A 服务器的 Session，B 服务器不知道）
- 内存占用随用户量增长

> express-session 官方文档明确说明：MemoryStore 不适合生产环境，仅用于开发调试。

### 4.2 生产环境：Redis 存储

Redis 是内存数据库，速度快，支持持久化，非常适合存 Session。

```bash
npm install connect-redis redis
```

```javascript
const { createClient } = require('redis')
const { RedisStore } = require('connect-redis')

// 创建 Redis 客户端
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

// 连接 Redis
redisClient.connect().catch(console.error)

redisClient.on('connect', () => console.log('✅ Redis 连接成功'))
redisClient.on('error', err => console.error('Redis 错误:', err))

// 配置 Session 使用 Redis 存储
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}))
```

用了 Redis 之后：
- 服务器重启，Session 不丢失（Redis 持久化）
- 多台服务器共享同一个 Redis，Session 共享
- 可以主动删除 Redis 里的 Session，强制用户下线

### 4.3 其他存储方案

| 存储 | 包名 | 适用场景 |
|------|------|----------|
| Redis | connect-redis | 生产环境首选，速度快 |
| MongoDB | connect-mongo | 已经用了 MongoDB，不想再加 Redis |
| MySQL | express-mysql-session | 已经用了 MySQL |
| 文件 | session-file-store | 小项目，不想搭 Redis |

---

## 五、Session 安全注意事项

### 5.1 Session 固定攻击（Session Fixation）

攻击者先获取一个 Session ID，诱导用户用这个 ID 登录，登录后攻击者就能用这个 ID 冒充用户。

**防御**：登录成功后重新生成 Session ID：

```javascript
app.post('/api/login', async (req, res) => {
  // ... 验证用户

  // 登录成功后，重新生成 Session ID（防 Session 固定攻击）
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ message: '登录失败' })

    // 重新生成后，再存用户信息
    req.session.user = { id: user.id, username: user.username }
    res.json({ message: '登录成功' })
  })
})
```

### 5.2 Session 劫持

攻击者通过 XSS 或网络监听获取 Session ID，冒充用户。

**防御**：
- `httpOnly: true`：防止 JS 读取 Cookie
- `secure: true`：只在 HTTPS 下发送，防止明文传输
- 定期更换 Session ID

### 5.3 secret 密钥管理

```javascript
// ❌ 不要硬编码
app.use(session({ secret: 'my-secret' }))

// ✅ 从环境变量读取
app.use(session({ secret: process.env.SESSION_SECRET }))

// .env 文件（不要提交到 git）
SESSION_SECRET=a-very-long-random-string-at-least-32-chars
```

---

## 六、Session vs Cookie 对比

| 对比项 | Cookie | Session |
|--------|--------|---------|
| 数据存储位置 | 客户端（浏览器） | 服务器端（内存/Redis） |
| 安全性 | 较低（数据在客户端） | 较高（数据在服务器） |
| 大小限制 | 4KB | 无限制（受服务器内存限制） |
| 主动失效 | 不能（只能等过期） | 可以（删除服务器端 Session） |
| 服务器压力 | 无 | 有（需要存储和查询） |
| 分布式支持 | 天然支持 | 需要共享存储（Redis） |

---

## 七、小结

| 知识点 | 核心要点 |
|--------|----------|
| Session 原理 | 数据存服务器，只把 ID 存 Cookie |
| 安装 | `npm install express-session` |
| 配置 | secret / resave: false / saveUninitialized: false |
| 设置数据 | `req.session.user = { ... }` |
| 读取数据 | `req.session.user` |
| 销毁 Session | `req.session.destroy(callback)` |
| 生产环境 | 用 Redis 存储（connect-redis） |
| 安全 | 登录后 regenerate、httpOnly、secure、secret 放环境变量 |

**下一篇**：JWT 认证原理与实战——无状态认证方案，适合前后端分离和移动端，JWT 的三段结构、生成验证、鉴权中间件、双 Token 刷新机制全解。
