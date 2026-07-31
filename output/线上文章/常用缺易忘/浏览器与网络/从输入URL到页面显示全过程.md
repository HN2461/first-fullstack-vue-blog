---
title: "从输入URL到页面显示全过程"
slug: "url-a3801def"
summary: ""
category: "浏览器与网络"
tags: []
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac34c"
originalSlug: "url-a3801def"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 从输入URL到页面显示的完整过程

> 前端必会！面试高频题详解 🚀

## 快速概览（背这个就够了）

```
输入URL
  ↓
URL解析
  ↓
DNS域名解析 → 查缓存 → 递归查询 → 获得IP
  ↓
建立TCP连接 → 三次握手
  ↓
发送HTTP请求 → 请求行/请求头/请求体
  ↓
服务器处理请求
  ↓
返回HTTP响应 → 状态码/响应头/响应体
  ↓
浏览器解析渲染 → 解析HTML → 构建DOM树
                → 解析CSS → 构建CSSOM树
                → 合并生成渲染树
                → 布局（Layout）
                → 绘制（Paint）
                → 合成（Composite）
  ↓
页面显示完成
```

---

## 详细步骤（面试答题版）

### 第1步：URL解析

**输入**：`https://www.example.com:443/path/index.html?id=123#section`

**浏览器做什么**：
1. 检查协议（http/https）
2. 解析域名（www.example.com）
3. 解析端口（443，https默认443，http默认80）
4. 解析路径（/path/index.html）
5. 解析参数（?id=123）
6. 解析锚点（#section）

```javascript
// URL组成部分
protocol: 'https:'
host: 'www.example.com:443'
hostname: 'www.example.com'
port: '443'
pathname: '/path/index.html'
search: '?id=123'
hash: '#section'
```

**前端知识点**：
- 可以通过 `window.location` 对象获取当前页面URL信息
- 协议决定了后续的连接方式（HTTP/HTTPS）

---

### 第2步：DNS域名解析（重点）

**目的**：把域名（www.example.com）转换成IP地址（192.168.1.1）

**查找顺序**（从快到慢）：

```
1. 浏览器DNS缓存
   ↓ 没找到
2. 操作系统DNS缓存
   ↓ 没找到
3. 本地hosts文件 (C:\Windows\System32\drivers\etc\hosts)
   ↓ 没找到
4. 路由器DNS缓存
   ↓ 没找到
5. ISP（网络运营商）DNS服务器
   ↓ 没找到
6. 递归查询DNS服务器
   - 根DNS服务器
   - 顶级域DNS服务器（.com）
   - 权威DNS服务器
```
# DNS域名解析：互联网的“地址翻译官”
DNS（Domain Name System，域名系统）是互联网的核心基础设施之一，其核心功能“域名解析”本质是**将人类易记的域名（如www.baidu.com）翻译成计算机可识别的IP地址（如180.101.49.12）** 的过程。

简单来说，IP地址是互联网中设备的“身份证号”（如192.168.1.1），但一串数字难以记忆；而域名是为方便人类使用设计的“别名”，DNS则承担了“别名→身份证号”的翻译工作，让我们无需记住复杂的IP，只需输入域名就能访问网站。



**实际例子**：
```
输入：www.baidu.com
  ↓
查询本地缓存 → 命中！返回 220.181.38.251
  ↓
直接用这个IP建立连接
```

**前端优化**：
- DNS预解析：`<link rel="dns-prefetch" href="//www.example.com">`
- 减少不同域名数量，降低DNS查询次数

**面试加分项**：
- DNS查询是UDP协议，不是TCP
- DNS查询可能很慢（几十到几百毫秒）
- CDN就是通过DNS解析返回最近的服务器IP

---

### 第3步：建立TCP连接（三次握手）

**为什么需要TCP**：保证数据可靠传输

**三次握手过程**：

```
客户端                           服务器
  │                                │
  │ ──SYN（请求连接）───────────→   │  第1次握手
  │                                │  服务器知道：客户端能发送
  │                                │
  │ ←──SYN+ACK（同意连接）────────  │  第2次握手
  │                                │  客户端知道：服务器能接收和发送
  │                                │
  │ ──ACK（确认）─────────────→    │  第3次握手
  │                                │  服务器知道：客户端能接收
  │                                │
  │ ═══════ 连接建立 ════════       │
```

**通俗解释**（面试可以这样说）：
1. **客户端**："你好，我想和你建立连接"（SYN）
2. **服务器**："收到，我也想和你连接"（SYN+ACK）
3. **客户端**："好的，那我们开始传数据吧"（ACK）

**为什么是3次不是2次**：
- 2次握手无法确认客户端的接收能力
- 防止已失效的请求到达服务器（服务器不知道客户端是否真的在线）

**HTTPS额外步骤**：
- 三次握手后，还有SSL/TLS握手（加密协商）
- 大约需要2个RTT（往返时间）

**前端优化**：
- HTTP/2多路复用，一个TCP连接传输多个请求
- Keep-Alive保持连接，避免重复握手

---

### 第4步：发送HTTP请求

**请求报文结构**：

```http
GET /index.html?id=123 HTTP/1.1              ← 请求行
Host: www.example.com                        ← 请求头开始
User-Agent: Mozilla/5.0 Chrome/120.0
Accept: text/html,application/json
Cookie: session=abc123
Connection: keep-alive
Cache-Control: no-cache                      ← 请求头结束
                                             ← 空行
[请求体：POST才有，GET一般没有]
```

**请求方法**：
- **GET**：获取资源（查询）
- **POST**：提交数据（新增）
- **PUT**：更新资源（修改）
- **DELETE**：删除资源
- **OPTIONS**：预检请求（CORS）
- **HEAD**：只要响应头，不要响应体

**前端常见请求头**：
```javascript
{
  'Content-Type': 'application/json',           // 请求体格式
  'Authorization': 'Bearer token123',           // 身份认证
  'Accept': 'application/json',                 // 期望的响应格式
  'Cookie': 'sessionId=xxx',                    // 携带cookie
  'Referer': 'https://previous-page.com',       // 来源页面
  'User-Agent': 'Mozilla/5.0...',               // 浏览器信息
  'Cache-Control': 'no-cache',                  // 缓存策略
  'If-None-Match': 'etag-value',               // 协商缓存
  'If-Modified-Since': 'Wed, 21 Oct 2015...'   // 协商缓存
}
```

---

### 第5步：服务器处理请求

**服务器做什么**：
1. 接收请求报文
2. 解析请求（方法、路径、参数）
3. 查询数据库/读取文件
4. 执行业务逻辑
5. 生成响应内容
6. 返回响应报文

**前端不需要关心的**：
- 服务器内部怎么处理
- 但要知道服务器可能做的优化（缓存、负载均衡）

---

### 第6步：返回HTTP响应

**响应报文结构**：

```http
HTTP/1.1 200 OK                              ← 状态行
Content-Type: text/html; charset=utf-8        ← 响应头开始
Content-Length: 1234
Cache-Control: max-age=3600
Set-Cookie: sessionId=xyz; HttpOnly
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
Connection: keep-alive                        ← 响应头结束
                                             ← 空行
<!DOCTYPE html>                              ← 响应体开始
<html>
  <head><title>页面</title></head>
  <body>...</body>
</html>
```

**常见状态码**（面试必问）：

| 状态码 | 含义 | 说明 |
|-------|------|------|
| **2xx 成功** |
| 200 | OK | 请求成功 |
| 201 | Created | 资源已创建（POST成功） |
| 204 | No Content | 成功但无内容返回（DELETE成功） |
| **3xx 重定向** |
| 301 | Moved Permanently | 永久重定向（SEO会转移权重） |
| 302 | Found | 临时重定向 |
| 304 | Not Modified | 协商缓存命中，用本地缓存 |
| **4xx 客户端错误** |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权（需要登录） |
| 403 | Forbidden | 禁止访问（没权限） |
| 404 | Not Found | 资源不存在 |
| **5xx 服务器错误** |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用（服务器过载） |

**重要响应头**：
```javascript
{
  'Content-Type': 'text/html',              // 响应内容类型
  'Cache-Control': 'max-age=3600',          // 强缓存，3600秒内直接用缓存
  'ETag': '"abc123"',                       // 资源标识，协商缓存用
  'Last-Modified': 'Wed, 21 Oct...',        // 最后修改时间，协商缓存用
  'Set-Cookie': 'id=123; HttpOnly',         // 设置cookie
  'Access-Control-Allow-Origin': '*',       // 跨域设置
  'Content-Encoding': 'gzip',               // 压缩方式
  'Transfer-Encoding': 'chunked'            // 分块传输
}
```

---

### 第7步：浏览器解析渲染（核心重点）⭐

这是前端最关心的部分！

#### 7.1 解析HTML，构建DOM树

```html
<!DOCTYPE html>
<html>
  <head>
    <title>页面</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div id="app">
      <h1>标题</h1>
      <p>内容</p>
    </div>
    <script src="main.js"></script>
  </body>
</html>
```

**浏览器做什么**：
1. **字节流** → **字符流**（根据charset编码）
2. **字符流** → **Token令牌**（词法分析）
3. **Token** → **Node节点**（语法分析）
4. **Node** → **DOM树**（构建树结构）

```
DOM树结构：
Document
  └─ html
      ├─ head
      │   ├─ title
      │   └─ link (style.css)
      └─ body
          ├─ div#app
          │   ├─ h1
          │   └─ p
          └─ script (main.js)
```

#### 7.2 解析CSS，构建CSSOM树

**遇到 `<link>` 或 `<style>` 时**：
1. 下载CSS文件（如果是外部）
2. 解析CSS规则
3. 构建CSSOM树（CSS对象模型）

```css
/* style.css */
body { font-size: 16px; }
#app { width: 100%; }
h1 { color: red; }
```

```
CSSOM树：
body { font-size: 16px }
  └─ #app { width: 100% }
      └─ h1 { color: red }
```

**重要**：
- CSS会阻塞渲染（必须等CSS加载完才能渲染）
- 但不阻塞DOM解析（DOM和CSS可以同时解析）

#### 7.3 遇到JavaScript

**情况1：普通 `<script>`**
```html
<script src="app.js"></script>
```
- ❌ **阻塞HTML解析**
- ❌ **阻塞页面渲染**
- 必须等JS下载并执行完，才继续解析HTML

**情况2：`async` 异步脚本**
```html
<script src="app.js" async></script>
```
- ✅ 不阻塞HTML解析（并行下载）
- ❌ 下载完立即执行，会阻塞HTML解析
- 执行顺序不确定

**情况3：`defer` 延迟脚本**
```html
<script src="app.js" defer></script>
```
- ✅ 不阻塞HTML解析（并行下载）
- ✅ 等HTML解析完再执行
- 按顺序执行

**最佳实践**：
```html
<!-- 把script放在body底部 -->
<body>
  <div id="app"></div>
  <script src="main.js"></script>  <!-- 最后执行 -->
</body>

<!-- 或者用defer -->
<head>
  <script src="main.js" defer></script>  <!-- HTML解析完再执行 -->
</head>
```

#### 7.4 合成渲染树（Render Tree）

**DOM树 + CSSOM树 = 渲染树**

```
渲染树：
body (font-size: 16px)
  └─ div#app (width: 100%)
      ├─ h1 (color: red)
      └─ p (color: black)
```

**注意**：
- `display: none` 的元素不在渲染树中
- `visibility: hidden` 的元素在渲染树中（占位但不可见）
- `<head>` 等不可见标签不在渲染树中

#### 7.5 布局（Layout / Reflow）

**计算每个节点的位置和大小**

```
计算过程：
1. 从根节点开始，递归计算
2. 盒模型计算（width/height/margin/padding/border）
3. 定位计算（position/float/flex/grid）
4. 最终确定每个元素的坐标和尺寸
```

**触发重排的操作**（性能杀手）：
- 添加/删除DOM元素
- 改变元素位置/尺寸（width/height/left/top等）
- 改变窗口大小
- 获取某些属性（offsetTop/scrollTop/clientWidth等）

#### 7.6 绘制（Paint）

**把元素绘制成像素**

```
绘制顺序：
1. 背景色
2. 背景图
3. 边框
4. 子元素
5. 轮廓
```

**触发重绘的操作**（比重排轻）：
- 改变颜色（color/background）
- 改变阴影（box-shadow）
- 改变边框样式（border-style）

#### 7.7 合成（Composite）

**把多个图层合成最终画面**

- 用GPU加速
- 某些属性只触发合成，不触发重排/重绘（性能最好）
  - `transform`
  - `opacity`
  - `filter`

**优化技巧**：
```css
/* ❌ 性能差：触发重排 */
.box {
  left: 100px;
}

/* ✅ 性能好：只触发合成 */
.box {
  transform: translateX(100px);
}
```

---

### 第8步：资源加载

**并行加载优化**：
```html
<head>
  <!-- 预加载关键资源 -->
  <link rel="preload" href="font.woff2" as="font">
  <link rel="preload" href="main.css" as="style">
  
  <!-- DNS预解析 -->
  <link rel="dns-prefetch" href="//api.example.com">
  
  <!-- 预连接 -->
  <link rel="preconnect" href="//cdn.example.com">
</head>
```

**资源加载优先级**（浏览器内部）：
1. **最高**：HTML、CSS、字体
2. **高**：图片（视口内）、脚本
3. **中**：图片（视口外）、音视频
4. **低**：预加载资源

---

## 完整流程总结（面试答题模板）

### 简洁版（30秒）

> 当我在浏览器输入URL后，首先进行**DNS解析**获得服务器IP，然后通过**TCP三次握手**建立连接，接着发送**HTTP请求**，服务器处理后返回**HTTP响应**。浏览器收到HTML后，开始**解析HTML构建DOM树**，同时**解析CSS构建CSSOM树**，两者合成**渲染树**。然后进行**布局**计算元素位置，**绘制**成像素，最后**合成**显示页面。

### 详细版（3-5分钟）

> 1. **URL解析**：浏览器解析URL，提取协议、域名、端口、路径等信息
> 
> 2. **DNS解析**：将域名转换成IP地址，查找顺序是浏览器缓存→系统缓存→hosts文件→DNS服务器递归查询
> 
> 3. **建立TCP连接**：通过三次握手与服务器建立可靠连接。如果是HTTPS还需要TLS握手
> 
> 4. **发送HTTP请求**：包含请求行（方法、路径、协议版本）、请求头（Cookie、User-Agent等）、请求体
> 
> 5. **服务器处理**：服务器接收请求，查询数据库或读取文件，执行业务逻辑，生成响应
> 
> 6. **返回HTTP响应**：包含状态行（状态码）、响应头（Content-Type、Cache-Control等）、响应体（HTML内容）
> 
> 7. **浏览器渲染**：
>    - 解析HTML构建DOM树
>    - 解析CSS构建CSSOM树
>    - 遇到script会阻塞解析（除非有async/defer）
>    - 合成渲染树（DOM+CSSOM）
>    - 布局（计算位置尺寸）
>    - 绘制（转成像素）
>    - 合成（GPU加速，显示到屏幕）
> 
> 8. **加载子资源**：图片、JS、CSS等资源并行加载
> 
> 9. **执行JavaScript**：修改DOM、绑定事件等
> 
> 10. **页面可交互**：用户可以操作页面

---

## 高频追问题

### Q1：为什么CSS要放head，JS要放body底部？

**CSS放head**：
- CSS会阻塞渲染
- 放head可以尽早下载，避免页面闪烁（FOUC）
- 用户看到的是完整样式的页面

**JS放body底部**：
- JS会阻塞HTML解析
- 放底部可以让DOM先渲染，用户更快看到内容
- 或者用`defer`，效果一样

### Q2：重排（Reflow）和重绘（Repaint）的区别？

**重排（Reflow）**：
- 元素位置、尺寸改变
- 需要重新计算布局
- 性能开销大
- 例：改width、添加DOM

**重绘（Repaint）**：
- 元素样式改变，但位置尺寸不变
- 不需要重新计算布局
- 性能开销小
- 例：改color、background

**优化**：
```javascript
// ❌ 触发3次重排
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// ✅ 只触发1次重排
element.style.cssText = 'width:100px; height:100px; margin:10px;';

// ✅ 用class一次性修改
element.className = 'new-style';
```

### Q3：async 和 defer 的区别？

| 特性 | 普通script | async | defer |
|-----|-----------|-------|-------|
| 阻塞HTML解析 | ✅ | ❌ | ❌ |
| 下载完立即执行 | ✅ | ✅ | ❌ |
| 按顺序执行 | ✅ | ❌ | ✅ |
| DOMContentLoaded | 等待 | 可能在前 | 等待 |

**使用场景**：
- `async`：独立脚本（统计代码、广告）
- `defer`：依赖DOM的脚本（操作DOM、依赖顺序）

### Q4：HTTP/1.1 和 HTTP/2 的区别？

**HTTP/1.1**：
- 一个TCP连接一次只能发一个请求（队头阻塞）
- 需要多个TCP连接并行加载资源
- 头部不压缩

**HTTP/2**：
- 多路复用，一个TCP连接可以同时发多个请求
- 头部压缩（HPACK）
- 服务器推送（Server Push）
- 二进制分帧

### Q5：强缓存和协商缓存的区别？

**强缓存**（不向服务器发请求）：
```http
Cache-Control: max-age=3600  # 3600秒内直接用缓存
Expires: Wed, 21 Oct 2025 07:28:00 GMT  # 过期时间（旧）
```

**协商缓存**（询问服务器是否可用缓存）：
```http
# 请求头
If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT
If-None-Match: "abc123"

# 响应
304 Not Modified  # 用缓存
200 OK           # 返回新内容
```

---

## 性能优化总结

### 1. DNS优化
```html
<link rel="dns-prefetch" href="//api.example.com">
```

### 2. TCP优化
- HTTP/2多路复用
- Keep-Alive保持连接

### 3. HTTP优化
- 启用Gzip/Brotli压缩
- 设置合理缓存策略
- 减少请求数量（合并文件）

### 4. 渲染优化
```html
<!-- CSS放head -->
<head>
  <link rel="stylesheet" href="style.css">
</head>

<!-- JS放底部或用defer -->
<body>
  <script src="main.js" defer></script>
</body>
```

### 5. 资源优化
```html
<!-- 预加载关键资源 -->
<link rel="preload" href="font.woff2" as="font">

<!-- 懒加载图片 -->
<img src="placeholder.jpg" data-src="real.jpg" loading="lazy">
```

### 6. 代码优化
```javascript
// 减少重排重绘
// 使用 transform 替代 left/top
// 使用 requestAnimationFrame
// 虚拟列表（长列表优化）
```

---

## 记忆技巧 🎯

**口诀**：
```
解析URL找DNS
三次握手建连接
发送请求等响应
解析渲染展页面
```

**关键数字**：
- DNS解析：4层缓存
- TCP握手：3次
- HTTP状态码：2xx/3xx/4xx/5xx
- 浏览器渲染：7步（解析HTML→解析CSS→合成渲染树→布局→绘制→合成→显示）

---

💡 **面试建议**：
1. 先说简洁版，面试官有兴趣再展开
2. 重点说浏览器渲染部分（前端最关心）
3. 提到性能优化加分
4. 准备好追问（重排重绘、async/defer、HTTP/2、缓存）

📚 **扩展阅读**：
- Chrome DevTools Performance面板
- 《浏览器工作原理与实践》
- 《高性能网站建设指南》
