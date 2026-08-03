---
title: "第 6 篇：WebSocket 协议面试题：协议原理、握手、实时通信、JavaScript 使用"
slug: "websocket-a1cbc328"
summary: "WebSocket 协议面试题，覆盖协议原理、连接握手、特点、应用场景、实时通信和 JavaScript 基础用法。"
category: "面试"
categoryPath:
  - "面试"
tags:
  - "WebSocket"
  - "网络协议"
  - "实时通信"
  - "前端"
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d291f8a2b1c68f2cac68a"
originalSlug: "websocket-a1cbc328"
originalStatus: "published"
publishedAt: "2026-05-10T14:38:27.761Z"
updatedAt: "2026-07-31T11:16:22.660Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 6 篇：WebSocket 协议面试题：协议原理、握手、实时通信、JavaScript 使用

### WebSocket 简介
WebSocket 是一种网络传输协议，位于 OSI 模型的应用层。它允许在客户端和服务器之间建立持久连接，进行全双工通信，解决了传统 HTTP 协议无法实现服务器主动推送数据的问题。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/jpeg/50923934/1750904856632-f0396e48-cc1b-4d60-bb4c-bdba1cfddbf8.jpeg)

### WebSocket 特点
+ **双向通信**：客户端和服务器可以同时发送和接收数据。
+ **低延迟**：相比 HTTP，减少了请求头的冗余信息，连接建立后不会频繁断开重连，降低了延迟。
+ **节省带宽**：连接建立后，后续的消息传递不需要额外的请求头，节省了网络资源。
+ **实时推送**：服务器可以主动向客户端推送消息，不需要客户端频繁地轮询服务器。

### WebSocket 协议
WebSocket 协议使用 `ws`（无加密）或 `wss`（加密）作为协议标识符。其握手过程基于 HTTP 协议，通过在 HTTP 请求中添加特定的头信息（如 `Upgrade: websocket`）来实现协议升级。

### WebSocket 握手过程（面试重点）
WebSocket 连接以一次特殊的 HTTP 请求开始，握手成功后才切换为 WebSocket 协议，整个连接复用同一条 TCP 通道。

+ **客户端请求**：
```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Sec-WebSocket-Protocol: chat
```
+ **服务端响应**：返回状态码 `101 Switching Protocols`，并把 `Sec-WebSocket-Key` 与固定 GUID `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` 拼接后做 SHA-1，再 Base64 得到 `Sec-WebSocket-Accept`，校验合法性。
```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```
+ **关键点**：握手用 HTTP，握手后协议切换为 WebSocket；同一连接不再走 HTTP 报文，而是 WebSocket 数据帧。

### WebSocket 数据帧结构
+ **FIN**：1 bit，标识是否为消息最后一帧（支持分片传输）。
+ **opcode**：4 bit，常见取值：`0x1` 文本帧、`0x2` 二进制帧、`0x8` 关闭帧、`0x9` ping、`0xA` pong。
+ **MASK**：1 bit，**客户端发往服务端的帧必须使用掩码**，服务端发往客户端不掩码，主要用于防御中间代理缓存污染攻击。
+ **Payload length**：7 / 7+16 / 7+64 bit 三档可变长度字段。
+ **Payload data**：实际负载，可为文本（UTF-8）或任意二进制。

### 心跳保活与断线重连
+ **协议层心跳**：服务端可主动发送 `ping` 帧，浏览器自动回 `pong`，用于探测连接是否存活；浏览器端 JS 无法直接发 ping，通常用应用层心跳替代。
+ **应用层心跳**：客户端每隔 N 秒发送约定 JSON（如 `{"type":"ping"}`），服务端回 `pong`，超过阈值未收到则判定断线。
+ **断线重连**：监听 `onclose` / `onerror`，使用**指数退避**（如 1s、2s、4s、8s、最多 30s）+ 抖动重连，避免雪崩；重连后需要重新订阅业务通道、补拉离线消息。

### WebSocket 的应用场景
+ **即时聊天系统**：如在线客服、社交聊天应用等。
+ **实时数据推送**：如股票行情、体育赛事比分、天气预报等。
+ **在线游戏**：需要频繁的数据交换和极低的延迟，WebSocket 可以保证游戏的流畅性和公平性。
+ **协同办公**：如多人同时编辑文档，实时同步编辑内容。
+ **物联网设备通信**：实现设备数据的实时上传和控制指令的即时下发。
+ **实时监控**：如视频监控、设备状态监控等。

### WebSocket 的基本使用（以 JavaScript 为例）
+ **创建 WebSocket 对象**：

```javascript
let ws = new WebSocket('ws://example.com/socket');
```

+ **事件处理**：

```javascript
ws.onopen = function(event) {
  console.log('连接已打开');
};
ws.onmessage = function(event) {
  console.log('收到消息:', event.data);
};
ws.onerror = function(event) {
  console.error('出现错误:', event);
};
ws.onclose = function(event) {
  console.log('连接已关闭');
};
```

+ **发送消息**：

```javascript
ws.send('Hello, server!');
```

+ **关闭连接**：

```javascript
ws.close();
```

### WebSocket 与 HTTP 的区别
+ **通信方式**：HTTP/1.1 采用请求—响应模型，应用语义上为半双工，服务端无法主动推送；WebSocket 在握手后是真正的全双工。
+ **连接模型**：HTTP 通常一次请求一次响应（即使有 keep-alive 也只是复用 TCP）；WebSocket 建立一次后长期持久存在。
+ **消息结构**：HTTP 头部冗长，每次都要重传 Cookie 等元信息；WebSocket 帧头精简（最小 2 字节），原生支持二进制。
+ **服务端主动推送**：HTTP 不支持（只能借助轮询 / 长轮询 / SSE 模拟）；WebSocket 原生支持。

### 与轮询 / 长轮询 / SSE 的对比
+ **短轮询**：客户端定时发 HTTP 请求，实时性差、开销大。
+ **长轮询（Comet）**：服务端 hold 住请求直到有数据，实时性可接受，但每次响应后仍要重连，且仍受 HTTP 头开销影响。
+ **SSE（Server-Sent Events）**：基于 HTTP 的**单向**服务端推送，浏览器自动重连，对代理穿透友好；缺点是只能服务端 → 客户端、不支持二进制。
+ **WebSocket**：**全双工 + 低开销 + 二进制**，最强但部署上需要代理 / 网关支持长连接（Nginx 需开启 `proxy_http_version 1.1` 与 `Upgrade` 头转发）。

### WebSocket 的服务端实现
+ 常见的服务端库：
    - **Node.js**：`ws` 库
    - **Python**：`websockets` 库
    - **Java**：`Java WebSocket API`
+ 以 Node.js 的 `ws` 库为例，服务端代码：

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function(ws) {
    ws.on('message', function(message, isBinary) {
        // ws@8+ 默认 message 是 Buffer，文本场景需手动 toString
        const text = isBinary ? message : message.toString()
        console.log('收到消息:', text);
        ws.send('消息已收到');
    });
    ws.send('欢迎连接到 WebSocket 服务器');
});
```

### WebSocket 的安全注意事项
+ **加密连接**：生产环境使用 `wss://`，防止数据被窃听与中间人攻击。
+ **身份验证常见方案**：
    - URL query 携带 token：`wss://host/path?token=xxx`，简单但 token 易出现在日志中。
    - 子协议鉴权：用 `Sec-WebSocket-Protocol` 头携带 token（构造函数第二个参数）。
    - 先走 HTTP 登录拿 Cookie / Session，握手时浏览器自动带 Cookie。
+ **防 CSWSH（跨站 WebSocket 劫持）**：握手阶段服务端必须校验 `Origin` 头，拒绝非法来源；不要仅依赖 Cookie。
+ **防资源耗尽**：限制单 IP / 单用户的并发连接数、单帧大小、消息频率，防止恶意大包与连接洪泛。

### WebSocket 的局限性
+ **代理 / 网关穿透**：部分企业代理、CDN 默认不支持长连接，需要专门配置 `Upgrade` 头转发。
+ **协议复杂性**：相较于 HTTP 请求—响应模式，WebSocket 在断线重连、消息可靠性、顺序性、离线消息等场景需要应用层自行设计。
+ **无内置消息可靠性**：WebSocket 只保证 TCP 级别可靠传输，应用层需要自己设计 ack / 序号 / 去重，才能做到"消息一定送达且不重复"。

### WebSocket 的使用建议
+ **选择合适的场景**：在需要实时通信的场景中使用 WebSocket，而对于传统请求 - 响应模式的场景，HTTP 协议可能更合适。
+ **考虑兼容性**：在使用 WebSocket 之前，检查目标用户的浏览器或客户端是否支持该协议。
+ **合理管理连接**：及时关闭不再需要的 WebSocket 连接，避免浪费资源。
