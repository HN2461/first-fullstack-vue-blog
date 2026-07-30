---
title: "接口与会话控制详解第三篇：Cookie 原理与实战"
slug: "node-js-cookie-1bb83e69"
summary: "深入理解 Cookie 的工作原理，掌握在 Express 中设置、读取、删除 Cookie 的完整操作，以及 httpOnly、secure、sameSite、signed 等安全属性的作用和使用场景。"
category: "接口与会话控制详解"
tags:
  - "Node.js"
  - "Cookie"
  - "HTTP"
  - "会话控制"
  - "安全"
  - "cookie-parser"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291e8a2b1c68f2cac180"
originalSlug: "node-js-cookie-1bb83e69"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 接口与会话控制详解第三篇：Cookie 原理与实战

> Cookie 是 Web 会话控制的基础。理解它的工作原理，才能真正搞懂 Session 和 JWT 的区别。

---

## 一、为什么需要 Cookie

### 1.1 HTTP 是无状态协议

HTTP 协议本身是**无状态**的，每次请求都是独立的，服务器不记得之前的请求。

```
第一次请求：GET /page1
服务器：好的，给你 page1 的内容（不知道你是谁）

第二次请求：GET /page2
服务器：好的，给你 page2 的内容（还是不知道你是谁）
```

这带来一个问题：用户登录后，下一次请求服务器怎么知道"这个请求是已登录的用户发的"？

### 1.2 Cookie 的解决方案

Cookie 是服务器通过响应头 `Set-Cookie` 发给浏览器的一小段数据，浏览器会自动保存，并在后续请求中**自动携带**。

```
第一次请求（登录）：
  浏览器 → 服务器：POST /login { username, password }
  服务器 → 浏览器：200 OK
                   Set-Cookie: userId=123; HttpOnly; Max-Age=86400

后续请求（自动带 Cookie）：
  浏览器 → 服务器：GET /profile
                   Cookie: userId=123
  服务器：看到 userId=123，知道是已登录的用户
```

---

## 二、Cookie 的工作原理

### 2.1 完整流程

```
1. 用户登录，服务器验证成功
2. 服务器在响应头里设置 Set-Cookie
3. 浏览器收到响应，把 Cookie 存到本地（按域名存储）
4. 用户访问同域名的其他页面时，浏览器自动在请求头里带上 Cookie
5. 服务器读取 Cookie，识别用户身份
```

### 2.2 在浏览器里查看 Cookie

打开 Chrome DevTools → Application → Cookies → 选择域名，可以看到所有 Cookie：

```
Name        Value    Domain         Path  Expires    HttpOnly  Secure
userId      123      localhost      /     Session    ✓         ✗
theme       dark     localhost      /     2027-01-01 ✗         ✗
```

### 2.3 Cookie 的存储位置

```
会话 Cookie（Session Cookie）：
  没有设置过期时间，存在内存里
  浏览器关闭后自动删除

持久 Cookie（Persistent Cookie）：
  设置了 Max-Age 或 Expires
  存在硬盘里，到期才删除
```

---

## 三、在 Express 中使用 Cookie

### 3.1 安装 cookie-parser

Express 本身不解析 Cookie，需要 `cookie-parser` 中间件：

```bash
npm install cookie-parser
```

```javascript
const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()

// 注册 cookie-parser 中间件
// 之后 req.cookies 就能读取到 Cookie 了
app.use(cookieParser())
```

### 3.2 设置 Cookie

```javascript
// res.cookie(name, value[, options])
app.get('/set', (req, res) => {
  res.cookie('username', '张三')
  res.json({ message: 'Cookie 已设置' })
})
```

查看响应头：

```
Set-Cookie: username=%E5%BC%A0%E4%B8%89; Path=/
```

### 3.3 读取 Cookie

```javascript
app.get('/get', (req, res) => {
  // req.cookies 是一个对象，键是 Cookie 名，值是 Cookie 值
  const username = req.cookies.username
  console.log(req.cookies)  // { username: '张三', theme: 'dark', ... }

  res.json({ username })
})
```

### 3.4 删除 Cookie

```javascript
// res.clearCookie(name[, options])
// 注意：path 和 domain 必须与设置时一致，否则删不掉
app.get('/clear', (req, res) => {
  res.clearCookie('username')
  res.json({ message: 'Cookie 已删除' })
})
```

---

## 四、Cookie 选项详解

`res.cookie` 的第三个参数是选项对象，控制 Cookie 的行为：

### 4.1 maxAge — 过期时间（毫秒）

```javascript
res.cookie('token', 'abc123', {
  maxAge: 24 * 60 * 60 * 1000  // 1天（毫秒）
})

// 常用时间换算：
// 1分钟  = 60 * 1000
// 1小时  = 60 * 60 * 1000
// 1天    = 24 * 60 * 60 * 1000
// 7天    = 7 * 24 * 60 * 60 * 1000
```

> `maxAge` 和 `expires` 都能设置过期时间，`maxAge` 是相对时间（多少毫秒后过期），`expires` 是绝对时间（Date 对象）。推荐用 `maxAge`，更直观。

### 4.2 httpOnly — 禁止 JS 读取（防 XSS）

```javascript
res.cookie('sessionId', 'xxx', {
  httpOnly: true  // 默认 false
})
```

**为什么重要**：

```javascript
// httpOnly: false（默认）
// 前端 JS 可以读取 Cookie
document.cookie  // 'sessionId=xxx; theme=dark'

// httpOnly: true
// 前端 JS 读不到这个 Cookie
document.cookie  // 'theme=dark'（只能看到非 httpOnly 的）
```

如果网站有 XSS 漏洞（攻击者注入了恶意 JS），没有 `httpOnly` 的 Cookie 会被偷走。设置 `httpOnly: true` 后，即使有 XSS，攻击者也无法通过 JS 读取 Cookie。

**结论：存认证信息的 Cookie（如 sessionId、token）必须设置 `httpOnly: true`。**

### 4.3 secure — 只在 HTTPS 下发送

```javascript
res.cookie('token', 'xxx', {
  secure: true  // 默认 false
})
```

设置 `secure: true` 后，Cookie 只在 HTTPS 连接下发送，HTTP 连接不发送。

```
开发环境（localhost）：secure: false（localhost 是例外，HTTP 也能用）
生产环境（HTTPS）：secure: true（防止 Cookie 在 HTTP 明文传输中被截获）
```

### 4.4 sameSite — 防 CSRF

```javascript
res.cookie('token', 'xxx', {
  sameSite: 'lax'  // 'strict' | 'lax' | 'none'
})
```

**CSRF（跨站请求伪造）**：攻击者诱导用户访问恶意网站，恶意网站向你的服务器发请求，浏览器会自动带上 Cookie，服务器以为是用户本人操作。

`sameSite` 控制跨站请求时是否发送 Cookie：

| 值 | 行为 | 说明 |
|----|------|------|
| `strict` | 完全禁止跨站发送 | 最安全，但用户从外部链接跳转时也不带 Cookie，体验差 |
| `lax` | 允许导航跳转时发送，禁止跨站 POST | 推荐，平衡安全和体验 |
| `none` | 允许跨站发送 | 必须同时设置 `secure: true`，用于第三方嵌入场景 |

### 4.5 path — 生效路径

```javascript
// 只在 /api 路径下发送这个 Cookie
res.cookie('apiToken', 'xxx', {
  path: '/api'
})

// 默认 path: '/'，所有路径都发送
```

### 4.6 domain — 生效域名

```javascript
// 只在 api.example.com 下发送
res.cookie('token', 'xxx', {
  domain: 'api.example.com'
})

// 在整个 example.com 及其子域名下发送
res.cookie('token', 'xxx', {
  domain: '.example.com'  // 注意前面的点
})
```

---

## 五、签名 Cookie（防篡改）

普通 Cookie 存在客户端，用户可以直接修改。签名 Cookie 加了一层 HMAC 签名，服务器能检测到是否被篡改。

### 5.1 配置签名密钥

```javascript
// cookieParser 传入密钥
app.use(cookieParser('my-secret-key-change-in-production'))
```

### 5.2 设置签名 Cookie

```javascript
res.cookie('userId', '123', {
  signed: true,  // 开启签名
  httpOnly: true,
  maxAge: 86400000
})
```

浏览器里看到的值：

```
userId = s%3A123.xxxxxxxxxxxxx（s: 前缀 + 原始值 + 签名）
```

### 5.3 读取签名 Cookie

```javascript
// 签名 Cookie 在 req.signedCookies 里（不是 req.cookies）
const userId = req.signedCookies.userId
// 如果签名验证通过：返回原始值 '123'
// 如果被篡改：返回 false
```

### 5.4 完整示例

```javascript
app.use(cookieParser('super-secret-key'))

// 登录时设置签名 Cookie
app.post('/login', (req, res) => {
  // 验证用户...
  res.cookie('userId', '123', {
    signed: true,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7天
  })
  res.json({ message: '登录成功' })
})

// 验证登录状态
app.get('/profile', (req, res) => {
  const userId = req.signedCookies.userId

  if (!userId) {
    return res.status(401).json({ message: '请先登录' })
  }

  // userId 是真实的用户 ID，没有被篡改
  res.json({ userId, message: '已登录' })
})
```

---

## 六、Cookie 的局限性

| 问题 | 说明 | 解决方案 |
|------|------|----------|
| 大小限制 | 每个 Cookie 最大 4KB | 只存 ID，数据存服务器（Session） |
| 安全性 | 存在客户端，可被读取 | httpOnly + secure + signed |
| 跨域限制 | 默认不跨域发送 | sameSite: none + secure，或用 JWT |
| 移动端 | 原生 App 不支持 Cookie | 用 JWT（放在请求头里） |
| 服务器重启 | 内存 Cookie 丢失 | 持久化存储（Redis） |

---

## 七、实战：记住登录状态

```javascript
const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()
app.use(express.json())
app.use(cookieParser('my-secret'))

// 模拟用户数据库
const users = [
  { id: 1, username: 'admin', password: '123456' }
]

// 登录
app.post('/login', (req, res) => {
  const { username, password, rememberMe } = req.body

  const user = users.find(u => u.username === username && u.password === password)
  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' })
  }

  // 根据"记住我"决定过期时间
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000  // 记住我：30天
    : undefined                   // 不记住：会话 Cookie（关闭浏览器失效）

  res.cookie('userId', String(user.id), {
    signed: true,
    httpOnly: true,
    maxAge,
    sameSite: 'lax'
  })

  res.json({ message: '登录成功', user: { id: user.id, username: user.username } })
})

// 鉴权中间件
function requireLogin(req, res, next) {
  const userId = req.signedCookies.userId
  if (!userId) {
    return res.status(401).json({ message: '请先登录' })
  }
  req.userId = userId
  next()
}

// 需要登录的接口
app.get('/profile', requireLogin, (req, res) => {
  const user = users.find(u => u.id === Number(req.userId))
  res.json({ user })
})

// 退出登录
app.post('/logout', (req, res) => {
  res.clearCookie('userId')
  res.json({ message: '已退出登录' })
})

app.listen(3000, () => console.log('http://localhost:3000'))
```

---

## 八、小结

| 知识点 | 核心要点 |
|--------|----------|
| Cookie 作用 | 解决 HTTP 无状态问题，浏览器自动携带 |
| 设置 Cookie | `res.cookie(name, value, options)` |
| 读取 Cookie | `req.cookies.name`（需要 cookie-parser） |
| 删除 Cookie | `res.clearCookie(name)` |
| maxAge | 过期时间（毫秒），不设则关闭浏览器失效 |
| httpOnly | 禁止 JS 读取，防 XSS，认证 Cookie 必须设置 |
| secure | 只在 HTTPS 下发送，生产环境必须设置 |
| sameSite | 防 CSRF，推荐 `lax` |
| signed | 签名防篡改，读取用 `req.signedCookies` |

**下一篇**：Session 原理与实战——Session 把数据存在服务器端，只把 ID 存在 Cookie 里，比直接存 Cookie 更安全，怎么用 express-session，以及生产环境怎么接 Redis。
