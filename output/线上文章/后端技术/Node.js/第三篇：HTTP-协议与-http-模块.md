---
title: "第三篇：HTTP 协议与 http 模块"
slug: "node-js-http-http-41474b0d"
summary: "理解 HTTP 协议的请求响应结构、常见状态码、GET 与 POST 的区别，并用 Node.js 原生 http 模块从零搭建 Web 服务器。"
category: "Node.js"
tags:
  - "Node.js"
  - "HTTP协议"
  - "http模块"
  - "Web服务器"
  - "GET请求"
  - "POST请求"
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291e8a2b1c68f2cac1c6"
originalSlug: "node-js-http-http-41474b0d"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第三篇：HTTP 协议与 http 模块

> 理解 HTTP 协议是后端开发的地基。不管用什么框架，底层都是这套规则。这篇文章不只讲"怎么用"，更讲"为什么"。

---

## 一、HTTP 协议深度解析

### 1.1 什么是 HTTP

HTTP（HyperText Transfer Protocol，超文本传输协议）是浏览器与服务器之间通信的规则，基于 TCP/IP 协议栈。

```
应用层：HTTP / HTTPS / WebSocket
传输层：TCP（可靠传输）/ UDP（快速传输）
网络层：IP（寻址路由）
数据链路层：以太网 / WiFi
```

HTTP 的核心特点：
- **无状态**：每次请求独立，服务器不记住上次请求（Cookie/Session 是补丁）
- **请求-响应模型**：客户端发请求，服务器返回响应
- **文本协议**：HTTP/1.x 是纯文本，HTTP/2 是二进制帧

### 1.2 HTTP 版本演进

| 版本 | 发布年份 | 核心特性 |
|------|---------|---------|
| HTTP/1.0 | 1996 | 每次请求建立新 TCP 连接 |
| HTTP/1.1 | 1997 | 持久连接（keep-alive）、管道化、分块传输 |
| HTTP/2 | 2015 | 二进制帧、多路复用、头部压缩、服务器推送 |
| HTTP/3 | 2022 | 基于 QUIC（UDP），解决队头阻塞 |

**HTTP/1.1 的持久连接**：

```
HTTP/1.0：
  请求1 → 建立TCP → 发送 → 响应 → 关闭TCP
  请求2 → 建立TCP → 发送 → 响应 → 关闭TCP（每次都要三次握手）

HTTP/1.1（keep-alive）：
  建立TCP
  请求1 → 发送 → 响应
  请求2 → 发送 → 响应（复用同一个 TCP 连接）
  请求3 → 发送 → 响应
  关闭TCP
```

### 1.3 HTTP 请求报文结构

```
POST /api/users HTTP/1.1                    ← 请求行
Host: localhost:3000                         ← 请求头（Headers）
Content-Type: application/json
Content-Length: 45
Authorization: Bearer eyJhbGci...
Accept: application/json
User-Agent: Mozilla/5.0 ...
                                             ← 空行（必须有，分隔头和体）
{"name": "张三", "email": "a@b.com"}        ← 请求体（Body）
```

**请求行**三要素：
- **请求方法**：GET、POST、PUT、PATCH、DELETE、HEAD、OPTIONS
- **请求路径**：`/api/users?page=1`（含查询字符串）
- **协议版本**：HTTP/1.1

**常见请求头**：

| 请求头 | 说明 | 示例 |
|--------|------|------|
| `Host` | 目标主机（必须有） | `localhost:3000` |
| `Content-Type` | 请求体格式 | `application/json` |
| `Content-Length` | 请求体字节数 | `45` |
| `Authorization` | 认证信息 | `Bearer <token>` |
| `Accept` | 期望的响应格式 | `application/json` |
| `Cookie` | 携带 Cookie | `sessionId=abc123` |
| `Origin` | 请求来源（CORS） | `http://localhost:5173` |
| `Referer` | 来源页面 URL | `http://example.com/page` |

### 1.4 HTTP 响应报文结构

```
HTTP/1.1 201 Created                         ← 响应行
Content-Type: application/json; charset=utf-8 ← 响应头
Content-Length: 67
Date: Sat, 18 Apr 2026 10:00:00 GMT
Set-Cookie: sessionId=abc123; HttpOnly
Access-Control-Allow-Origin: *
                                             ← 空行
{"id": 1, "name": "张三", "email": "a@b.com"} ← 响应体
```

**常见响应头**：

| 响应头 | 说明 |
|--------|------|
| `Content-Type` | 响应体格式 |
| `Content-Length` | 响应体字节数 |
| `Set-Cookie` | 设置 Cookie |
| `Location` | 重定向目标 URL |
| `Cache-Control` | 缓存控制 |
| `Access-Control-Allow-Origin` | CORS 跨域允许 |
| `X-Powered-By` | 服务器技术（可隐藏） |

### 1.5 HTTP 状态码完整指南

**1xx 信息性**：

| 状态码 | 含义 | 场景 |
|--------|------|------|
| 100 | Continue | 客户端可以继续发送请求体 |
| 101 | Switching Protocols | 协议升级（如 WebSocket） |

**2xx 成功**：

| 状态码 | 含义 | 场景 |
|--------|------|------|
| 200 | OK | 通用成功 |
| 201 | Created | POST 创建资源成功 |
| 204 | No Content | DELETE 成功，无响应体 |
| 206 | Partial Content | 范围请求（断点续传） |

**3xx 重定向**：

| 状态码 | 含义 | 场景 |
|--------|------|------|
| 301 | Moved Permanently | 永久重定向（SEO 友好） |
| 302 | Found | 临时重定向 |
| 304 | Not Modified | 缓存命中，不返回内容 |
| 307 | Temporary Redirect | 临时重定向，保持请求方法 |
| 308 | Permanent Redirect | 永久重定向，保持请求方法 |

**4xx 客户端错误**：

| 状态码 | 含义 | 场景 |
|--------|------|------|
| 400 | Bad Request | 参数格式错误、JSON 解析失败 |
| 401 | Unauthorized | 未登录、token 无效或过期 |
| 403 | Forbidden | 已登录但无权限 |
| 404 | Not Found | 资源不存在 |
| 405 | Method Not Allowed | 请求方法不支持 |
| 409 | Conflict | 数据冲突（如邮箱已存在） |
| 413 | Payload Too Large | 请求体太大 |
| 422 | Unprocessable Entity | 参数格式正确但语义错误 |
| 429 | Too Many Requests | 请求频率超限 |

**5xx 服务器错误**：

| 状态码 | 含义 | 场景 |
|--------|------|------|
| 500 | Internal Server Error | 服务器代码报错 |
| 502 | Bad Gateway | 上游服务挂了 |
| 503 | Service Unavailable | 服务器过载或维护 |
| 504 | Gateway Timeout | 上游服务超时 |

### 1.6 GET 与 POST 的深度对比

这是面试高频题，很多人只知道表面区别：

| 对比项 | GET | POST |
|--------|-----|------|
| 数据位置 | URL 查询字符串 | 请求体（Body） |
| 数据大小 | 受 URL 长度限制（浏览器约 2KB-8KB） | 理论上无限制（服务器可配置） |
| 安全性 | 数据暴露在 URL 中，会被记录在日志/历史 | 数据在 Body 中，相对安全 |
| 缓存 | 可以被浏览器/代理缓存 | 默认不缓存 |
| 幂等性 | 幂等（多次请求结果相同） | 非幂等（多次请求可能创建多条数据） |
| 书签 | 可以收藏为书签 | 不能 |
| 编码 | URL 编码（`%xx`） | 多种格式（JSON、表单、multipart） |

**深层理解**：
- GET 和 POST 的本质区别是**语义**，不是技术限制
- GET 请求也可以有 Body（HTTP 规范允许，但不推荐）
- POST 请求也可以有查询字符串（`/api/users?page=1`）
- 真正的区别在于**幂等性**和**安全性**（HTTP 语义中的"安全"指不修改服务器状态）

### 1.7 Content-Type 详解

```
application/json          → JSON 格式（最常用）
application/x-www-form-urlencoded → 表单格式（name=Alice&age=25）
multipart/form-data       → 文件上传（含二进制数据）
text/plain                → 纯文本
text/html                 → HTML
text/xml / application/xml → XML
application/octet-stream  → 二进制流（文件下载）
```

---

## 二、用 http 模块创建服务器

### 2.1 最简单的服务器

```javascript
const http = require('node:http')  // Node 14.18+ 推荐加 node: 前缀

// http.createServer([options][, requestListener]) → http.Server
//   options（可选）：
//     keepAlive: boolean，是否启用 keep-alive，是否保持连接（长连接），避免每次请求重新握手（默认 false）
//     keepAliveInitialDelay: number，keep-alive 长连接保持多久才开始算超时（毫秒，默认 0）
//     connectionsCheckingInterval: number，每隔多久检查一次死连接（默认 30000ms）
//     requestTimeout: number，整个请求多久算超时（毫秒，默认 300000ms = 5分钟）
//     headersTimeout: number，只等请求头多久算超时（默认 60000ms）
//     maxHeaderSize: number，请求头最大允许多大（默认 16384 = 16KB）
//   requestListener: (req, res) => void，请求处理函数
const server = http.createServer((req, res) => {
//   req = 可读流（浏览器发来的请求）
//   res = 可写流（返回给浏览器的响应）
  res.end('Hello, World!')
})

// server.listen([port[, host[, backlog]]][, callback])
//   port: 监听端口（0 表示随机端口）
//   host: 监听地址（默认 '0.0.0.0'，监听所有网卡）
//   backlog: 连接队列最大长度（默认 511）
//   callback: 监听成功后的回调
server.listen(3000, '127.0.0.1', () => {
  console.log('服务器运行在 http://127.0.0.1:3000')
  console.log('实际监听地址:', server.address())
  // { address: '127.0.0.1', family: 'IPv4', port: 3000 }
})

// 等价写法（先创建，再添加监听器）
const server2 = http.createServer()
server2.on('request', (req, res) => {
  res.end('Hello!')
})
server2.listen(3001)
```

### 2.2 请求对象（req / IncomingMessage）详解

`req` 是 `IncomingMessage` 的实例，同时也是一个**可读流**：

```javascript
const server = http.createServer((req, res) => {
  // ── 基本信息 ──
  console.log(req.method)      // 'GET' / 'POST' / 'PUT' / 'DELETE'
  console.log(req.url)         // '/api/users?page=1&limit=10'
  console.log(req.httpVersion) // '1.1'

  // ── 请求头（全部小写）──
  console.log(req.headers)
  // {
  //   host: 'localhost:3000',
  //   'content-type': 'application/json',
  //   authorization: 'Bearer xxx',
  //   'user-agent': 'Mozilla/5.0 ...'
  // }
  console.log(req.headers['content-type'])  // 'application/json'
  console.log(req.headers.authorization)    // 'Bearer xxx'

  // ── 解析 URL ──
  // 把 req.url 转成方便操作的 URL 对象
  // 第二个参数是补全协议+域名，让解析不出错
  const url = new URL(req.url, `http://${req.headers.host}`)
  console.log(url.pathname)                    // '/api/users'
  console.log(url.searchParams.get('page'))    // '1'
  console.log(url.searchParams.get('limit'))   // '10'
  console.log(Object.fromEntries(url.searchParams))  // { page: '1', limit: '10' }

  res.end('ok')
})
```

### 2.3 响应对象（res）常用方法

```javascript
const server = http.createServer((req, res) => {
  // 设置状态码
  res.statusCode = 200

  // 设置响应头
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Access-Control-Allow-Origin', '*')

  // 一次性设置状态码和响应头
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'hello'
  })

  // 写入响应体（可多次调用）
  res.write('{"status":')
  res.write('"ok"}')

  // 结束响应（必须调用，否则请求会一直挂起）
  res.end()

  // 或者直接 end 时传入最后的数据
  res.end(JSON.stringify({ status: 'ok' }))
})
```

---

## 三、路由处理

### 3.1 基础路由

```javascript
const http = require('http')
const url = require('url')

const server = http.createServer((req, res) => {
  // req.url 不完整 → 必须补协议域名 → 才能用 JS 内置的 URL 解析路径
  const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  const method = req.method

  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  // 路由匹配
  if (method === 'GET' && pathname === '/') {
    res.end(JSON.stringify({ message: '欢迎访问首页' }))

  } else if (method === 'GET' && pathname === '/api/users') {
    const users = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ]
    res.end(JSON.stringify(users))

  } else if (method === 'GET' && pathname.startsWith('/api/users/')) {
    const id = pathname.split('/').pop()
    res.end(JSON.stringify({ id, name: '用户' + id }))

  } else {
    res.statusCode = 404
    res.end(JSON.stringify({ error: '页面不存在' }))
  }
})

server.listen(3000)
```

### 3.2 返回 HTML 页面

```javascript
const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`)

  // 根据路径返回不同文件
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname)

  // 根据扩展名设置 Content-Type
  const extMap = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.json': 'application/json'
  }
  const ext = path.extname(filePath)
  const contentType = extMap[ext] || 'text/plain'

  // 读取文件并响应
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404
      res.end('<h1>404 Not Found</h1>')
      return
    }
    res.setHeader('Content-Type', contentType)
    res.end(data)
  })
})

server.listen(3000)
```

---

## 四、处理 GET 请求参数

```javascript
const http = require('http')

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  // 解析查询字符串
  const reqUrl = new URL(req.url, `http://${req.headers.host}`)
  const params = Object.fromEntries(reqUrl.searchParams)

  // 例如：GET /search?keyword=node&page=2
  // params = { keyword: 'node', page: '2' }

  console.log('查询参数:', params)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({
    path: reqUrl.pathname,
    params
  }))
})

server.listen(3000)
```

---

## 五、处理 POST 请求体

POST 请求的数据在请求体（Body）中，需要通过监听 `data` 和 `end` 事件来收集：

```javascript
const http = require('http')

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  // 收集请求体数据（可能分多次传输）
  let body = ''

  req.on('data', (chunk) => {
    body += chunk.toString()
    // 防止恶意大请求（限制 1MB）
    if (body.length > 1e6) {
      req.destroy()
    }
  })

  req.on('end', () => {
    try {
      // 解析 JSON 格式的请求体
      const data = JSON.parse(body)
      console.log('收到数据:', data)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ success: true, received: data }))
    } catch (err) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: '请求体格式错误' }))
    }
  })

  req.on('error', (err) => {
    console.error('请求错误:', err)
    res.statusCode = 500
    res.end('Server Error')
  })
})

server.listen(3000)
```

### 5.1 处理表单数据（application/x-www-form-urlencoded）

```javascript
req.on('end', () => {
  // 表单数据格式：name=Alice&age=25
  const params = new URLSearchParams(body)
  const name = params.get('name')
  const age = params.get('age')

  console.log({ name, age })
  res.end(JSON.stringify({ name, age }))
})
```

---

## 六、GET 和 POST 的应用场景

### 6.1 GET 适合的场景

```javascript
// 查询用户列表
// GET /api/users?page=1&limit=10&keyword=张

// 获取单个用户
// GET /api/users/123

// 搜索
// GET /api/search?q=nodejs

// 获取文章
// GET /api/articles/2026-04-18
```

### 6.2 POST 适合的场景

```javascript
// 用户登录（密码不能放 URL）
// POST /api/login
// Body: { "username": "admin", "password": "123456" }

// 创建新用户
// POST /api/users
// Body: { "name": "Alice", "email": "alice@example.com" }

// 上传文件
// POST /api/upload
// Body: FormData（multipart/form-data）

// 提交表单
// POST /api/feedback
// Body: { "content": "反馈内容" }
```

---

## 七、完整示例：一个简单的 REST API

```javascript
const http = require('http')

// 模拟数据库
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' }
]
let nextId = 3

// 解析请求体
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

// 发送 JSON 响应
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  const method = req.method

  try {
    // GET /api/users — 获取所有用户
    if (method === 'GET' && pathname === '/api/users') {
      sendJSON(res, 200, users)

    // GET /api/users/:id — 获取单个用户
    } else if (method === 'GET' && /^\/api\/users\/\d+$/.test(pathname)) {
      const id = parseInt(pathname.split('/').pop())
      const user = users.find(u => u.id === id)
      if (!user) return sendJSON(res, 404, { error: '用户不存在' })
      sendJSON(res, 200, user)

    // POST /api/users — 创建用户
    } else if (method === 'POST' && pathname === '/api/users') {
      const body = await parseBody(req)
      if (!body.name || !body.email) {
        return sendJSON(res, 400, { error: 'name 和 email 不能为空' })
      }
      const newUser = { id: nextId++, name: body.name, email: body.email }
      users.push(newUser)
      sendJSON(res, 201, newUser)

    // DELETE /api/users/:id — 删除用户
    } else if (method === 'DELETE' && /^\/api\/users\/\d+$/.test(pathname)) {
      const id = parseInt(pathname.split('/').pop())
      const index = users.findIndex(u => u.id === id)
      if (index === -1) return sendJSON(res, 404, { error: '用户不存在' })
      users.splice(index, 1)
      sendJSON(res, 204, null)

    } else {
      sendJSON(res, 404, { error: '接口不存在' })
    }
  } catch (err) {
    sendJSON(res, 500, { error: err.message })
  }
})

server.listen(3000, () => {
  console.log('API 服务器运行在 http://localhost:3000')
})
```

---

## 八、小结

| 知识点 | 核心要点 |
|--------|----------|
| HTTP 请求结构 | 请求行（方法+路径+版本）+ 请求头 + 请求体 |
| HTTP 响应结构 | 响应行（版本+状态码）+ 响应头 + 响应体 |
| 常见状态码 | 200成功、201创建、404未找到、500服务器错误 |
| GET vs POST | GET 参数在 URL，POST 参数在 Body |
| `http.createServer` | 创建服务器，回调接收 req 和 res |
| 解析 GET 参数 | `new URL(req.url, base).searchParams` |
| 解析 POST 参数 | 监听 `req.on('data')` 和 `req.on('end')` |

**下一篇**预告：Node.js 模块化系统详解，CommonJS 的 require/exports 机制，ES6 模块的 import/export，以及两者的区别与互操作。
