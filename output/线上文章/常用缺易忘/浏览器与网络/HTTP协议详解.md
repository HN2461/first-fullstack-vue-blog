---
title: "HTTP协议详解"
slug: "http-d8f25f40"
summary: ""
category: "浏览器与网络"
categoryPath:
  - "常用缺易忘"
  - "浏览器与网络"
tags: []
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d291f8a2b1c68f2cac346"
originalSlug: "http-d8f25f40"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.372Z"
updatedAt: "2026-06-13T10:28:28.442Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# HTTP协议详解

## 一、什么是HTTP协议？

### 1. HTTP的本质定义
HTTP（HyperText Transfer Protocol，超文本传输协议）是互联网的"通用语言"，规定了**浏览器与服务器之间如何交流**的规则。

**通俗类比**：想象你去餐厅点餐：
- **你（客户端）**：用"菜单语言"告诉服务员"我要一份宫保鸡丁"（HTTP请求）
- **服务员（服务器）**：用"菜单语言"回复"好的，您的菜来了"并端上菜（HTTP响应）

如果你说英语、服务员说中文，就无法沟通。HTTP就是这个"统一的菜单语言"，让全球的浏览器和服务器都能互相理解。

### 2. HTTP的核心特点
| 特点 | 说明 | 类比 |
|------|------|------|
| **无状态** | 每次请求都是独立的，服务器不记得你上次请求了什么 | 你每次进餐厅，服务员都当你是新客户，不记得你上次点了什么 |
| **基于请求-响应** | 客户端主动发请求，服务器被动回应（服务器不会主动推送） | 你不点菜，服务员不会主动给你上菜 |
| **明文传输**（HTTP） | 数据在网络中"裸奔"，易被窃听 | 你的订单写在明信片上寄出，邮递员能看到 |
| **加密传输**（HTTPS） | 数据加密，防止窃听和篡改 | 订单装在密码箱里寄出，只有收件人能打开 |


## 二、HTTP请求报文详解

### 1. 请求报文的结构（3部分）
```http
GET /user/profile?id=123 HTTP/1.1          ← 请求行
Host: www.example.com                      ← 请求头（多行）
User-Agent: Mozilla/5.0 Chrome/120.0
Cookie: session=abc123
Content-Type: application/json
                                           ← 空行（必须有！分隔请求头和请求体）
{"username": "张三", "age": 25}             ← 请求体（可选，GET通常没有）
```

### 2. 请求行：说明"要做什么"
**格式**：`方法 路径 协议版本`

```http
GET /api/users?page=1 HTTP/1.1
```

**组成部分**：
- **请求方法**：GET（获取数据）、POST（提交数据）、PUT（更新）、DELETE（删除）等
- **请求路径**：`/api/users?page=1`（资源位置 + 查询参数）
- **协议版本**：HTTP/1.1（目前主流）、HTTP/2（更快）

### 3. 常见请求方法（RESTful风格）

| 方法 | 作用 | 是否有请求体 | 是否幂等* | 实际例子 |
|------|------|------------|----------|---------|
| **GET** | 获取资源（查询） | 否 | 是 | 获取商品列表：`GET /api/goods` |
| **POST** | 创建资源（新增） | 是 | 否 | 用户注册：`POST /api/user/register` |
| **PUT** | 更新资源（全量修改） | 是 | 是 | 修改用户信息：`PUT /api/user/123` |
| **PATCH** | 更新资源（部分修改） | 是 | 是 | 只改密码：`PATCH /api/user/123` |
| **DELETE** | 删除资源 | 否 | 是 | 删除订单：`DELETE /api/order/456` |
| **OPTIONS** | 查询服务器支持的方法（CORS预检） | 否 | 是 | 跨域预检：`OPTIONS /api/data` |
| **HEAD** | 只获取响应头，不要响应体 | 否 | 是 | 检查资源是否存在：`HEAD /image.jpg` |

**幂等性**：多次执行同一操作，结果一样。例如：
- `GET /user/1` 查10次，结果都一样（幂等）
- `POST /order` 提交10次，会创建10个订单（非幂等）

### 4. 请求头：携带附加信息

**常见请求头及作用**：

| 请求头 | 作用 | 示例值 |
|-------|------|--------|
| **Host** | 目标服务器的域名（必需） | `www.baidu.com` |
| **User-Agent** | 浏览器信息（用于服务器识别客户端类型） | `Mozilla/5.0 (Windows NT 10.0) Chrome/120.0` |
| **Accept** | 客户端能接收的数据类型 | `text/html, application/json` |
| **Accept-Language** | 期望的语言 | `zh-CN,zh;q=0.9,en;q=0.8` |
| **Accept-Encoding** | 支持的压缩方式 | `gzip, deflate, br` |
| **Content-Type** | 请求体的数据格式 | `application/json`（JSON）、`application/x-www-form-urlencoded`（表单） |
| **Content-Length** | 请求体的字节长度 | `1234` |
| **Cookie** | 携带的Cookie信息 | `sessionId=abc123; token=xyz` |
| **Authorization** | 身份认证令牌 | `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| **Referer** | 从哪个页面跳转来的 | `https://www.google.com/search?q=xxx` |
| **Origin** | 请求源（跨域时必需） | `https://www.example.com` |
| **Cache-Control** | 缓存策略 | `no-cache`（不用缓存）、`max-age=3600`（缓存1小时） |
| **If-None-Match** | 协商缓存（ETag值） | `"abc123"` |
| **If-Modified-Since** | 协商缓存（最后修改时间） | `Wed, 21 Oct 2015 07:28:00 GMT` |

**前端如何设置请求头**：
```javascript
// fetch API
fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({ name: '张三' })
})

// axios
axios.post('/api/data', { name: '张三' }, {
  headers: {
    'Authorization': 'Bearer token123'
  }
})
```

### 5. 请求体：携带数据
**常见数据格式**：

#### (1) JSON格式（最常用）
```http
Content-Type: application/json

{"username": "张三", "password": "123456"}
```

#### (2) 表单格式（传统表单提交）
```http
Content-Type: application/x-www-form-urlencoded

username=%E5%BC%A0%E4%B8%89&password=123456
```

#### (3) 文件上传（multipart）
```http
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxk

------WebKitFormBoundary7MA4YWxk
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

[图片二进制数据]
------WebKitFormBoundary7MA4YWxk--
```


## 三、HTTP响应报文详解

### 1. 响应报文的结构（3部分）
```http
HTTP/1.1 200 OK                            ← 状态行
Content-Type: text/html; charset=utf-8      ← 响应头（多行）
Content-Length: 1234
Set-Cookie: sessionId=xyz; HttpOnly
Cache-Control: max-age=3600
                                           ← 空行
<!DOCTYPE html>                            ← 响应体
<html>...</html>
```

### 2. 状态行：说明"处理结果"
**格式**：`协议版本 状态码 状态描述`

```http
HTTP/1.1 200 OK
```

### 3. HTTP状态码详解（面试重点）

#### **(1) 1xx 信息性状态码（了解即可）**
- `100 Continue`：服务器已收到请求头，客户端可以继续发送请求体
- `101 Switching Protocols`：服务器正在切换协议（如HTTP升级到WebSocket）

#### **(2) 2xx 成功**
| 状态码 | 含义 | 使用场景 |
|-------|------|---------|
| **200 OK** | 请求成功 | 最常见，GET/POST/PUT/DELETE都可能返回 |
| **201 Created** | 资源已创建 | POST创建用户、订单等成功后返回 |
| **204 No Content** | 成功但无内容返回 | DELETE删除成功，不需要返回数据 |
| **206 Partial Content** | 部分内容（断点续传） | 下载大文件时，支持从中间位置继续下载 |

#### **(3) 3xx 重定向**
| 状态码 | 含义 | 区别 |
|-------|------|------|
| **301 Moved Permanently** | 永久重定向 | SEO权重转移，浏览器会缓存，以后直接访问新地址 |
| **302 Found** | 临时重定向 | SEO权重不转移，浏览器不缓存，每次都访问原地址 |
| **303 See Other** | 重定向到另一个资源（强制GET） | POST后重定向，防止刷新重复提交 |
| **304 Not Modified** | 协商缓存命中 | 资源未修改，用本地缓存（节省流量） |
| **307 Temporary Redirect** | 临时重定向（方法不变） | 与302类似，但保证请求方法不变（POST不会变GET） |

**301 vs 302 实战**：
```javascript
// 301：网站永久换域名
// 旧域名 http://old.com → 新域名 https://new.com
// 响应：301 Moved Permanently
// Location: https://new.com

// 302：短链接跳转
// 短链 http://t.cn/abc123 → 长链接 https://taobao.com/item?id=12345
// 响应：302 Found
// Location: https://taobao.com/item?id=12345
```

#### **(4) 4xx 客户端错误（你的问题）**
| 状态码 | 含义 | 原因 |
|-------|------|------|
| **400 Bad Request** | 请求参数错误 | 参数格式不对、缺少必需参数 |
| **401 Unauthorized** | 未授权（需要登录） | 没有提供token或token过期 |
| **403 Forbidden** | 禁止访问（有token但没权限） | 普通用户访问管理员接口 |
| **404 Not Found** | 资源不存在 | 接口路径错误、资源已删除 |
| **405 Method Not Allowed** | 请求方法不允许 | 接口只支持POST，你用了GET |
| **408 Request Timeout** | 请求超时 | 客户端发送太慢，服务器等不及了 |
| **413 Payload Too Large** | 请求体过大 | 上传文件超过服务器限制 |
| **429 Too Many Requests** | 请求过于频繁 | 触发限流（如API每分钟只能调100次） |

#### **(5) 5xx 服务器错误（服务器的问题）**
| 状态码 | 含义 | 原因 |
|-------|------|------|
| **500 Internal Server Error** | 服务器内部错误 | 代码bug、数据库连接失败、空指针异常等 |
| **502 Bad Gateway** | 网关错误 | Nginx等代理服务器无法连接到后端服务 |
| **503 Service Unavailable** | 服务不可用 | 服务器过载、正在维护、数据库宕机 |
| **504 Gateway Timeout** | 网关超时 | 后端服务响应太慢，Nginx等待超时 |

### 4. 响应头：携带附加信息

| 响应头 | 作用 | 示例值 |
|-------|------|--------|
| **Content-Type** | 响应体的数据类型 | `text/html`（网页）、`application/json`（JSON）、`image/jpeg`（图片） |
| **Content-Length** | 响应体的字节长度 | `1234` |
| **Content-Encoding** | 压缩方式 | `gzip`（Gzip压缩）、`br`（Brotli压缩） |
| **Set-Cookie** | 设置Cookie | `sessionId=xyz; HttpOnly; Secure; Max-Age=3600` |
| **Cache-Control** | 缓存策略（强缓存） | `max-age=3600`（缓存1小时）、`no-cache`（协商缓存）、`no-store`（不缓存） |
| **ETag** | 资源标识（协商缓存） | `"abc123"` |
| **Last-Modified** | 最后修改时间（协商缓存） | `Wed, 21 Oct 2015 07:28:00 GMT` |
| **Location** | 重定向地址 | `https://www.baidu.com` |
| **Access-Control-Allow-Origin** | 跨域设置（CORS） | `*`（允许所有域）、`https://www.example.com`（允许特定域） |
| **Access-Control-Allow-Methods** | 允许的跨域方法 | `GET, POST, PUT, DELETE` |
| **Access-Control-Allow-Headers** | 允许的跨域请求头 | `Content-Type, Authorization` |
| **Transfer-Encoding** | 分块传输 | `chunked`（数据分块发送，边生成边传输） |

### 5. 响应体：实际数据
**常见格式**：
```html
<!-- HTML网页 -->
<!DOCTYPE html>
<html>...</html>
```

```json
// JSON数据
{
  "code": 200,
  "message": "success",
  "data": {
    "username": "张三",
    "age": 25
  }
}
```

```
// 纯文本
Hello World
```

```
// 图片/视频等二进制数据
[二进制流]
```


## 四、HTTP/1.1 vs HTTP/2 vs HTTP/3

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| **发布时间** | 1997年 | 2015年 | 2022年 |
| **传输层** | TCP | TCP | **QUIC（基于UDP）** |
| **数据格式** | 文本 | **二进制** | 二进制 |
| **多路复用** | ❌（一个连接一次一个请求） | ✅（一个连接同时多个请求） | ✅ |
| **头部压缩** | ❌ | ✅（HPACK） | ✅（QPACK） |
| **服务器推送** | ❌ | ✅（服务器主动推送资源） | ✅ |
| **队头阻塞** | 严重（TCP层也会阻塞） | 应用层解决，但TCP层仍阻塞 | **完全解决** |
| **握手耗时** | 1-2 RTT（TCP握手） | 1-2 RTT | **0 RTT**（快速握手） |

**HTTP/1.1的问题**：
```
浏览器                        服务器
  │──请求1（下载HTML）──→      │
  │←─HTML返回────────────      │
  │──请求2（下载CSS）───→       │  ← 必须等请求1完成
  │←─CSS返回─────────────      │
  │──请求3（下载JS）────→       │  ← 必须等请求2完成
  │←─JS返回──────────────      │
```

**HTTP/2多路复用**：
```
浏览器                        服务器
  │──请求1、2、3同时发送→       │
  │←─HTML、CSS、JS同时返回      │  ← 一个连接，并行传输
```


## 五、HTTPS：HTTP的安全升级版

### 1. HTTP的安全问题
- **明文传输**：数据在网络中"裸奔"，WiFi嗅探可窃取密码、Cookie
- **无法验证身份**：无法确认服务器是真的淘宝，可能是钓鱼网站
- **内容可能被篡改**：运营商可能插入广告

### 2. HTTPS的解决方案
**HTTPS = HTTP + SSL/TLS加密**

| 安全特性 | 实现方式 |
|---------|---------|
| **加密** | 数据用AES等算法加密，窃听者看到的是乱码 |
| **身份验证** | 服务器提供CA机构颁发的数字证书（如Let's Encrypt、DigiCert） |
| **防篡改** | 数据用哈希算法（如SHA-256）生成摘要，篡改会被发现 |

### 3. HTTPS的代价
- **速度慢**：TLS握手需要额外2-3个RTT
- **服务器压力大**：加密解密消耗CPU
- **证书成本**：商业证书需要购买（免费证书如Let's Encrypt可用）


## 六、Cookie详解（HTTP的"记忆术"）

### 1. 为什么需要Cookie？
HTTP是**无状态协议**，服务器不记得你。
```
你第1次访问：服务器回复"你好，陌生人"
你第2次访问：服务器还是说"你好，陌生人"（它不记得你来过）
```

Cookie让服务器"记住你"：
```
你第1次登录：服务器给你发一个"会员卡"（Cookie: sessionId=abc123）
你第2次访问：带上会员卡，服务器识别"哦，是会员，欢迎回来！"
```

### 2. Cookie的工作流程
```
浏览器                                  服务器
  │──POST /login（用户名密码）──→        │
  │←─Set-Cookie: sessionId=abc123──     │  设置Cookie
  │                                     │
  │──GET /user/profile ─────────→       │
  │  Cookie: sessionId=abc123           │  自动携带Cookie
  │←─返回个人资料──────────────          │  服务器识别身份
```

### 3. Cookie的属性
```http
Set-Cookie: sessionId=abc123; Domain=.example.com; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Lax
```

| 属性 | 作用 | 示例 |
|------|------|------|
| **Domain** | 哪些域名可以访问这个Cookie | `.example.com`（主域名和子域名都能用） |
| **Path** | 哪些路径可以访问 | `/api`（只有/api开头的路径才能用） |
| **Max-Age** | 有效期（秒） | `3600`（1小时后过期） |
| **Expires** | 过期时间（旧版） | `Wed, 21 Oct 2025 07:28:00 GMT` |
| **HttpOnly** | 禁止JavaScript访问（防XSS攻击） | `HttpOnly` |
| **Secure** | 只在HTTPS下传输（防中间人攻击） | `Secure` |
| **SameSite** | 防止CSRF攻击 | `Strict`（只有同站请求才携带）、`Lax`（大部分跨站不携带）、`None`（都携带） |


## 七、核心总结

**HTTP协议本质**：浏览器与服务器的"通信规则手册"，定义了请求和响应的格式。

**请求三要素**：
1. 请求行（做什么）：方法 + 路径
2. 请求头（怎么做）：Content-Type、Cookie等
3. 请求体（带什么数据）：JSON、表单等

**响应三要素**：
1. 状态行（结果如何）：状态码
2. 响应头（附加信息）：缓存、跨域设置等
3. 响应体（实际数据）：HTML、JSON等

**记忆技巧**：
- **2xx你真棒**（成功）
- **3xx你走吧**（重定向）
- **4xx你错了**（客户端错误）
- **5xx我错了**（服务器错误）
