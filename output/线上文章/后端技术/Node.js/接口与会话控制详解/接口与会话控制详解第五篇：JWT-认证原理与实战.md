---
title: "接口与会话控制详解第五篇：JWT 认证原理与实战"
slug: "node-js-jwt-64903817"
summary: "深入理解 JWT 的三段结构和签名原理，掌握 jsonwebtoken 的生成与验证，实现鉴权中间件，以及 access token + refresh token 双 Token 刷新机制的完整实战。"
category: "接口与会话控制详解"
categoryPath:
  - "后端技术"
  - "Node.js"
  - "接口与会话控制详解"
tags:
  - "Node.js"
  - "JWT"
  - "认证"
  - "Token"
  - "无状态"
  - "前后端分离"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291e8a2b1c68f2cac18e"
originalSlug: "node-js-jwt-64903817"
originalStatus: "published"
publishedAt: "2026-04-21T13:22:25.066Z"
updatedAt: "2026-06-19T06:25:37.821Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 接口与会话控制详解第五篇：JWT 认证原理与实战

> JWT 是前后端分离项目的标配认证方案。理解它的原理，才能用好它，也才能知道它的局限在哪里。

---

## 一、为什么需要 JWT

### 1.1 Session 的问题

Session 把用户状态存在服务器端，在以下场景会遇到麻烦：

```
问题1：分布式部署
  用户登录时请求打到服务器A，Session 存在A上
  下次请求打到服务器B，B上没有这个 Session → 认为未登录

  解决方案：用 Redis 共享 Session
  → 增加了架构复杂度，Redis 挂了所有用户都掉线

问题2：移动端 / 原生 App
  Cookie 是浏览器的机制，原生 App 没有 Cookie
  → 需要自己实现 Cookie 管理，麻烦

问题3：跨域
  Cookie 默认不跨域发送
  前端在 localhost:5173，后端在 localhost:3000
  → 需要额外配置 CORS + credentials
```

### 1.2 JWT 的解决思路

JWT（JSON Web Token）是**无状态**的认证方案：

- 服务器不存储任何状态
- 用户信息直接编码在 Token 里
- 服务器只需要验证 Token 的签名是否合法

```
Session 方案：
  服务器存：{ 'abc123': { userId: 1, username: '张三' } }
  客户端存：Cookie: connect.sid=abc123

JWT 方案：
  服务器不存任何东西
  客户端存：Token = eyJhbGci...（里面包含了用户信息）
  服务器只验证 Token 的签名是否合法
```

---

## 二、JWT 的结构

### 2.1 三段结构

JWT 由三部分组成，用 `.` 分隔：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJ1c2VySWQiOiIxMjMiLCJ1c2VybmFtZSI6IuW8oOS4iSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzEzNDAwMDAwLCJleHAiOjE3MTM0ODY0MDB9
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

三段分别是：**Header（头部）.Payload（载荷）.Signature（签名）**

### 2.2 Header — 头部

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- `alg`：签名算法（HS256 是最常用的）
- `typ`：token 类型，固定是 JWT

这段 JSON 经过 Base64URL 编码，得到第一段。

### 2.3 Payload — 载荷（存用户信息）

```json
{
  "userId": "6642a1b2c3d4e5f678901234",
  "username": "张三",
  "role": "user",
  "iat": 1713400000,
  "exp": 1713486400
}
```

- `iat`（issued at）：签发时间（Unix 时间戳）
- `exp`（expiration）：过期时间（Unix 时间戳）
- 其他字段：自定义的用户信息

这段 JSON 经过 Base64URL 编码，得到第二段。

> ⚠️ **重要**：Payload 只是 Base64 编码，不是加密！任何人都能解码看到内容。不要在 Payload 里存密码、银行卡号等敏感信息。

### 2.4 Signature — 签名（防篡改）

```
HMACSHA256(
  base64url(header) + '.' + base64url(payload),
  secret
)
```

签名用密钥对前两段内容做 HMAC 哈希，得到第三段。

**防篡改原理**：
- 如果有人修改了 Payload（比如把 role 从 user 改成 admin）
- 服务器用密钥重新计算签名，发现和 Token 里的签名不一致
- 判定 Token 被篡改，拒绝请求

只要密钥不泄露，Token 就无法被伪造。

### 2.5 在线解码工具

可以在 [https://jwt.io](https://jwt.io) 粘贴 JWT，直接看到解码后的内容（不需要密钥就能看 Header 和 Payload，但无法验证签名）。

---

## 三、jsonwebtoken 基础使用

### 3.1 安装

```bash
npm install jsonwebtoken
```

### 3.2 生成 Token（jwt.sign）

```javascript
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

// jwt.sign(payload, secret, options) → string
const token = jwt.sign(
  // payload：要编码的数据
  {
    userId: '6642a1b2c3d4e5f678901234',
    username: '张三',
    role: 'user'
  },
  // secret：签名密钥
  SECRET,
  // options
  {
    expiresIn: '24h',    // 过期时间：支持字符串（'24h'、'7d'、'30m'）或秒数（86400）
    algorithm: 'HS256'   // 签名算法（默认 HS256，通常不需要手动指定）
  }
)

console.log(token)
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOi...
```

**expiresIn 时间格式**：

```javascript
expiresIn: '15m'   // 15分钟
expiresIn: '2h'    // 2小时
expiresIn: '7d'    // 7天
expiresIn: '30d'   // 30天
expiresIn: 3600    // 3600秒（1小时）
```

### 3.3 验证 Token（jwt.verify）

```javascript
// jwt.verify(token, secret) → payload（验证通过）
// 验证失败时抛出错误

try {
  const payload = jwt.verify(token, SECRET)
  console.log(payload)
  // {
  //   userId: '6642a1b2c3d4e5f678901234',
  //   username: '张三',
  //   role: 'user',
  //   iat: 1713400000,
  //   exp: 1713486400
  // }
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    console.log('token 已过期，过期时间:', err.expiredAt)
  } else if (err.name === 'JsonWebTokenError') {
    console.log('token 无效:', err.message)
    // 可能是：签名不匹配、格式错误、被篡改
  } else if (err.name === 'NotBeforeError') {
    console.log('token 尚未生效')
  }
}
```

### 3.4 解码 Token（jwt.decode，不验证签名）

```javascript
// jwt.decode 只解码，不验证签名
// 仅用于调试，不要用于认证！
const decoded = jwt.decode(token)
console.log(decoded)  // 同 verify 的返回值，但不验证签名

// 获取完整信息（含 header）
const full = jwt.decode(token, { complete: true })
console.log(full.header)   // { alg: 'HS256', typ: 'JWT' }
console.log(full.payload)  // { userId: ..., exp: ... }
```

---

## 四、JWT 鉴权中间件

### 4.1 基础版

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'dev-secret'

function authMiddleware(req, res, next) {
  // 从请求头获取 token
  // 标准格式：Authorization: Bearer <token>
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ code: 401, message: '未登录，请先登录' })
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: 'token 格式错误，应为 Bearer <token>' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, SECRET)
    // 把用户信息挂到 req 上，后续路由可以用
    req.user = payload
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'token 已过期，请重新登录' })
    }
    return res.status(401).json({ code: 401, message: 'token 无效' })
  }
}

module.exports = authMiddleware
```

### 4.2 权限控制中间件

```javascript
// 角色权限中间件（在 authMiddleware 之后使用）
function requireRole(...roles) {
  return (req, res, next) => {
    // req.user 由 authMiddleware 设置
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 403,
        message: `需要 ${roles.join(' 或 ')} 权限`
      })
    }
    next()
  }
}

module.exports = { authMiddleware, requireRole }
```

### 4.3 在路由中使用

```javascript
const { authMiddleware, requireRole } = require('../middleware/auth')

// 需要登录
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

// 需要登录 + admin 角色
router.get('/admin/users', authMiddleware, requireRole('admin'), (req, res) => {
  // ...
})

// 需要登录 + admin 或 moderator 角色
router.delete('/articles/:id', authMiddleware, requireRole('admin', 'moderator'), (req, res) => {
  // ...
})

// 整个路由组都需要登录
router.use(authMiddleware)
router.get('/notes', getNotes)
router.post('/notes', createNote)
```

---

## 五、登录接口完整实现

```javascript
// routes/auth.js
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const SECRET = process.env.JWT_SECRET || 'dev-secret'

// 生成 token 的工具函数
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role
    },
    SECRET,
    { expiresIn: '24h' }
  )
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ code: 400, message: '邮箱和密码不能为空' })
    }

    // 查找用户
    const user = await User.findOne({ email })
    if (!user) {
      // 不要说"用户不存在"，统一说"邮箱或密码错误"（防止用户枚举攻击）
      return res.status(401).json({ code: 401, message: '邮箱或密码错误' })
    }

    // 验证密码
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: '邮箱或密码错误' })
    }

    // 生成 token
    const token = generateToken(user)

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    })

  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

module.exports = router
```

---

## 六、双 Token 刷新机制

### 6.1 为什么需要 Token 刷新

单 Token 方案的困境：

```
Token 有效期太长（如 30 天）：
  → 如果 token 泄露，攻击者可以用 30 天
  → 无法主动让 token 失效（JWT 无状态）

Token 有效期太短（如 15 分钟）：
  → 用户每 15 分钟就要重新登录，体验很差
```

**双 Token 方案**解决了这个问题：

```
access token：有效期短（15分钟），用于接口认证
refresh token：有效期长（7天），只用于刷新 access token

正常流程：
  用 access token 访问接口
  access token 过期 → 用 refresh token 换新的 access token
  refresh token 过期 → 重新登录
```

### 6.2 实现双 Token

```javascript
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-secret'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret'

// 生成双 token
function generateTokens(user) {
  const accessToken = jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    ACCESS_SECRET,
    { expiresIn: '15m' }  // access token 15分钟
  )

  const refreshToken = jwt.sign(
    { userId: user._id },
    REFRESH_SECRET,
    { expiresIn: '7d' }   // refresh token 7天
  )

  return { accessToken, refreshToken }
}

// 登录接口
router.post('/login', async (req, res) => {
  // ... 验证用户

  const { accessToken, refreshToken } = generateTokens(user)

  // refresh token 存数据库（可以主动吊销）
  await RefreshToken.create({
    token: refreshToken,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })

  res.json({
    code: 200,
    data: { accessToken, refreshToken }
  })
})

// 刷新 access token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ code: 401, message: '缺少 refresh token' })
  }

  try {
    // 验证 refresh token 签名
    const payload = jwt.verify(refreshToken, REFRESH_SECRET)

    // 检查数据库里是否存在（是否被吊销）
    const stored = await RefreshToken.findOne({
      token: refreshToken,
      userId: payload.userId
    })

    if (!stored) {
      return res.status(401).json({ code: 401, message: 'refresh token 无效或已被吊销' })
    }

    // 查询用户（获取最新信息）
    const user = await User.findById(payload.userId)
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' })
    }

    // 生成新的 access token
    const accessToken = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    )

    res.json({
      code: 200,
      data: { accessToken }
    })

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'refresh token 已过期，请重新登录' })
    }
    res.status(401).json({ code: 401, message: 'refresh token 无效' })
  }
})

// 退出登录（吊销 refresh token）
router.post('/logout', authMiddleware, async (req, res) => {
  const { refreshToken } = req.body

  if (refreshToken) {
    // 从数据库删除 refresh token，使其失效
    await RefreshToken.deleteOne({ token: refreshToken, userId: req.user.userId })
  }

  res.json({ code: 200, message: '已退出登录' })
})
```

### 6.3 前端如何配合（axios 拦截器）

```javascript
// 前端 axios 配置（参考）
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000' })

// 请求拦截器：自动带上 access token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：access token 过期时自动刷新
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config

    // access token 过期（401），且不是刷新接口本身
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })

        // 保存新的 access token
        localStorage.setItem('accessToken', data.data.accessToken)

        // 用新 token 重试原请求
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)

      } catch (refreshError) {
        // refresh token 也过期了，跳转登录页
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)
```

---

## 七、JWT 的局限性

```
1. 无法主动失效
   JWT 一旦签发，在过期前一直有效
   即使用户修改了密码、被封号，旧 token 仍然可用
   
   解决方案：
   - 缩短 access token 有效期（15分钟）
   - 用 Redis 维护 token 黑名单（但这样就有状态了）
   - 在 payload 里加版本号，修改密码时更新版本号

2. Payload 不加密
   任何人都能解码看到 Payload 内容
   不要存敏感信息

3. Token 体积比 Session ID 大
   Session ID 只有几十字节
   JWT 通常有几百字节
   每次请求都要传，对带宽有轻微影响

4. 服务器无法知道有多少用户在线
   因为无状态，服务器不知道有多少有效 token 在外面
```

---

## 八、小结

| 知识点 | 核心要点 |
|--------|----------|
| JWT 结构 | Header.Payload.Signature，三段 Base64URL 编码 |
| Payload | 存用户信息，不加密，不要存敏感数据 |
| Signature | 用密钥签名，防篡改 |
| 生成 token | `jwt.sign(payload, secret, { expiresIn })` |
| 验证 token | `jwt.verify(token, secret)` → payload 或抛出错误 |
| 错误类型 | TokenExpiredError（过期）/ JsonWebTokenError（无效） |
| 鉴权中间件 | 从 `Authorization: Bearer <token>` 提取并验证 |
| 双 Token | access token（15分钟）+ refresh token（7天） |
| 刷新机制 | access token 过期 → 用 refresh token 换新的 |
| 主动失效 | refresh token 存数据库，退出时删除 |

**下一篇**：密码安全与接口防护——bcrypt 密码哈希原理、express-validator 参数校验、express-rate-limit 限流、helmet 安全响应头。
