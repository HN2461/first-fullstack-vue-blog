---
title: "第 6 篇：WebSocket 协议面试题：协议原理、握手、实时通信、JavaScript 使用"
slug: "websocket-a1cbc328"
summary: "WebSocket 面试系统复习指南，兼顾小白理解与规范复述，深入讲解握手、数据帧、浏览器 API、心跳重连、消息可靠性、安全、扩容和实时通信选型。"
category: "面试"
categoryPath:
  - "面试"
tags:
  - "WebSocket"
  - "实时通信"
  - "网络协议"
  - "前端"
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d291f8a2b1c68f2cac68a"
originalSlug: "websocket-a1cbc328"
originalStatus: "published"
publishedAt: "2026-05-10T14:38:27.761Z"
updatedAt: "2026-08-27T14:34:49.476Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---

# 第 6 篇：WebSocket 协议面试题：协议原理、握手、实时通信、JavaScript 使用

这篇文章不是只背几个 API 的速记，而是一份可以用来理解、复习和组织面试语言的 WebSocket 知识框架。

每个重点问题尽量按以下顺序展开：

- **小白理解**：先知道它解决什么问题。
- **规范回答（可直接复述）**：面试时先用 30～60 秒说清定义、原理和边界。
- **原理与过程**：面试官继续追问时再展开。
- **场景或代码**：把概念落到实际开发。
- **易错点**：避免把口诀当成完整原理。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/jpeg/50923934/1750904856632-f0396e48-cc1b-4d60-bb4c-bdba1cfddbf8.jpeg)

> 版本说明：本文以浏览器 WebSocket API 和 RFC 6455 的常见实现为主。WebSocket 解决的是双向实时通信通道问题，不会自动解决鉴权、消息可靠性、离线补偿和多实例广播问题。

## 一、基础概念与适用场景

### 1. WebSocket 是什么？

**小白理解**

普通 HTTP 更像“客户端问一次，服务端答一次”。WebSocket 建立连接后，双方都可以在需要时主动发送消息，连接可以持续一段时间，不必每次发送消息都重新发起 HTTP 请求。

**规范回答（可直接复述）**

WebSocket 是一种基于 TCP 的应用层协议。客户端先通过 HTTP Upgrade 请求与服务端完成握手，服务端返回 `101 Switching Protocols` 后，连接从 HTTP 升级为 WebSocket。升级成功后，客户端和服务端可以在同一条持久 TCP 连接上进行双向、全双工通信，数据以 WebSocket 帧的形式传输。

WebSocket 适合聊天、协同编辑、实时通知、实时状态同步等场景；但心跳、重连、业务鉴权、消息确认、离线补偿等仍然需要应用层设计。

**易错点**

不要说“WebSocket 让 HTTP 变成了全双工”。准确说法是：HTTP 只负责最初的握手，握手成功后双方切换到 WebSocket 帧协议，后续不再使用普通 HTTP 请求-响应语义。

### 2. WebSocket 解决了 HTTP 的什么问题？

**小白理解**

HTTP 请求通常由客户端发起。如果服务端有新消息，客户端要么不断轮询，要么保持一个长轮询请求。WebSocket 给服务端提供了一个已经建立好的发送通道。

**规范回答（可直接复述）**

HTTP/1.1 的核心是请求-响应模型，服务端不能在没有对应请求的情况下自由发送一条新的业务消息。轮询和长轮询可以模拟推送，但会增加请求数量、连接管理和响应延迟。WebSocket 通过一次 HTTP Upgrade 建立长连接，之后双方可以独立发送消息，从而减少重复握手和 HTTP 头开销。

这并不表示 HTTP 完全不能推送。SSE、HTTP 流式响应和长轮询也能提供不同形式的服务端推送，只是通信方向、数据格式和连接管理方式不同。

### 3. WebSocket 有哪些特点？

**规范回答（可直接复述）**

- **双向和全双工**：客户端与服务端可以同时发送和接收消息。
- **长连接**：握手成功后连接通常持续存在，直到一方关闭、网络中断或服务端主动清理。
- **消息边界明确**：TCP 是字节流，WebSocket 帧为消息提供了协议层边界。
- **支持文本和二进制**：文本消息必须是合法 UTF-8，二进制消息可以承载 ArrayBuffer、Blob 等数据。
- **协议开销较小**：后续消息不需要重复携带完整的 HTTP 请求头，但每个帧仍然有自己的帧头。
- **服务端可以主动推送**：不必等待客户端发起下一次 HTTP 请求。

低延迟和节省带宽是常见优势，但不是绝对保证。实际效果还取决于网络、代理、消息大小、服务端处理能力和部署架构。

### 4. `ws` 和 `wss` 有什么区别？

**小白理解**

`ws` 可以理解为 WebSocket 的明文地址，`wss` 可以理解为加了 TLS 加密的 WebSocket 地址，类似 `http` 与 `https` 的关系。

**规范回答（可直接复述）**

`ws://` 和 `wss://` 是 WebSocket URI scheme。`ws` 通常基于明文 TCP，`wss` 在 TCP 之上使用 TLS 加密。生产环境通常使用 `wss://`，并让证书、域名和反向代理正确配置。

`wss` 可以防止传输内容被直接窃听和篡改，但它不能代替用户身份认证、权限校验和业务数据校验。

### 5. 什么场景适合 WebSocket？什么场景不必使用？

**适合的场景**

- 即时聊天、客服消息、在线状态同步。
- 协同编辑、白板和多人操作提示。
- 实时行情、设备状态、监控指标和告警。
- 需要双向低延迟交互的在线游戏控制信令。
- 浏览器与服务端之间的实时任务进度通知。

**不必优先使用的场景**

- 普通 CRUD、表单提交、登录和文件下载。
- 只需要服务端向客户端持续推送文本的场景，SSE 可能更简单。
- 大型音视频媒体传输，通常应评估 WebRTC、HLS、WebTransport 等专用方案。

选型要看通信方向、可靠性要求、代理环境、消息类型和团队维护能力，不能只因为“需要实时”就使用 WebSocket。

## 二、HTTP Upgrade 握手

### 6. WebSocket 为什么要先使用 HTTP 握手？

**小白理解**

浏览器、服务器、网关原本都认识 HTTP。先用 HTTP 表明“我希望把这条连接升级成 WebSocket”，可以复用现有的端口、域名、Cookie、代理和鉴权基础设施。

**规范回答（可直接复述）**

WebSocket 的握手采用 HTTP/1.1 Upgrade 机制，是为了在已有 Web 基础设施上协商协议切换。客户端先发送一个带有 `Upgrade: websocket` 和相关校验头的 HTTP 请求，服务端确认请求有效后返回 `101 Switching Protocols`。从该响应之后，双方不再按普通 HTTP 请求-响应处理，而是按照 WebSocket 帧格式读写同一条 TCP 连接。

### 7. WebSocket 握手过程是什么？

**小白理解**

可以记成：客户端提出升级请求，服务端验证并返回 101，双方从 HTTP 切换成 WebSocket。

**规范回答（可直接复述）**

典型流程如下：

1. 浏览器解析 `ws://` 或 `wss://` 地址，并建立 TCP；`wss://` 还会先完成 TLS 握手。
2. 客户端发送 HTTP GET 请求，并携带 `Upgrade: websocket`、`Connection: Upgrade`、`Sec-WebSocket-Key`、`Sec-WebSocket-Version` 等头部。
3. 服务端检查请求方法、Upgrade 头、协议版本、路径、Origin 和登录态等。
4. 服务端将客户端的 Key 与固定 GUID 拼接，计算 `SHA-1` 后再 Base64 编码，生成 `Sec-WebSocket-Accept`。
5. 验证通过时返回 `101 Switching Protocols`，并返回 `Upgrade`、`Connection` 和 `Sec-WebSocket-Accept` 等响应头。
6. 响应结束后，连接进入 WebSocket 状态，后续数据使用帧传输。

客户端请求示例：

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: https://example.com
Sec-WebSocket-Protocol: chat
```

服务端响应示例：

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat
```

### 8. `Sec-WebSocket-Key` 如何计算？它是 token 吗？

**规范回答（可直接复述）**

服务端计算响应值的公式是：

```text
Sec-WebSocket-Accept = Base64(SHA-1(Sec-WebSocket-Key + GUID))
```

固定 GUID 是：

```text
258EAFA5-E914-47DA-95CA-C5AB0DC85B11
```

例如客户端 Key 为 `dGhlIHNhbXBsZSBub25jZQ==`，服务端按公式计算后得到 `s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`。

`Sec-WebSocket-Key` 不是登录 token。它主要用于证明响应方确实理解 WebSocket 握手规则，避免普通 HTTP 服务错误地返回一个看起来像升级成功的响应。用户身份需要通过 Cookie、登录态、短期凭证或其他鉴权方式校验。

### 9. `101 Switching Protocols` 表示什么？

`101` 表示服务端同意客户端的协议升级请求。它不是普通业务成功响应，也不代表用户已经通过权限校验；服务端完全可以在握手阶段因为未登录、Origin 不合法、路径不存在或连接数超限而返回 `401`、`403`、`404` 或 `429` 等 HTTP 状态码。

握手成功只说明协议层连接建立，业务层还要继续处理订阅、权限和消息格式。

### 10. `Sec-WebSocket-Protocol` 是做什么的？

它用于协商应用层子协议。例如客户端声明支持 `chat.v1` 和 `chat.v2`，服务端选择其中一个，并在响应中返回被选中的协议。

它不是“随便放 token 的请求头”。浏览器 WebSocket API 的第二个参数确实可以设置子协议列表，但子协议应该表达通信协议版本或消息约定。鉴权应优先使用已有登录 Cookie、受控的短期凭证或服务端认可的握手方案，并避免把长期秘密暴露到日志。

### 11. WebSocket 握手时需要关注哪些安全和部署头？

服务端通常需要关注：

- `Origin`：限制允许建立连接的网页来源，降低 CSWSH 风险。
- `Cookie` 或其他登录态：识别当前用户。
- `Sec-WebSocket-Version`：确认协议版本。
- `Sec-WebSocket-Protocol`：协商业务子协议。
- `Host`、请求路径和反向代理转发信息：防止连接到错误的服务。

如果使用 Nginx，至少要保证 HTTP/1.1 和 Upgrade 头正确转发，例如：

```nginx
location /socket/ {
    proxy_pass http://websocket_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

还要结合代理空闲超时、负载均衡、TLS 证书和服务端优雅关闭策略进行配置。不同网关的配置项名称可能不同，不能只复制 Nginx 片段就认为生产环境已经完成。

## 三、WebSocket 数据帧与协议细节

### 12. WebSocket 数据帧有哪些字段？

一帧通常由以下部分组成：

- **FIN**：1 bit，表示这一帧是否为当前消息的最后一帧。
- **RSV1～RSV3**：扩展保留位，只有协商了对应扩展时才可以使用。
- **opcode**：4 bit，表示帧类型。
- **MASK**：1 bit，表示 payload 是否使用掩码。
- **Payload length**：7 bit 基础长度，必要时跟随 16 位或 64 位扩展长度。
- **Masking key**：客户端掩码帧中的 32 位掩码密钥。
- **Payload data**：实际负载数据。

最小帧头通常是 2 字节，但实际长度会受到掩码和扩展长度影响。

### 13. `FIN` 和分片是怎么回事？

一条较大的消息可以拆成多个帧发送：第一帧使用文本或二进制 opcode，中间帧使用 continuation opcode `0x0`，最后一帧把 `FIN` 设为 `1`。接收方需要把这些帧重新组合成一条完整消息后再交给应用层。

控制帧不能分片，必须把 `FIN` 设为 `1`，并且控制帧 payload 最大为 125 字节。实际开发通常让库处理分片，但理解这个规则有助于分析协议抓包和异常断开。

### 14. opcode 有哪些常见取值？

| opcode | 含义 | 说明 |
| --- | --- | --- |
| `0x0` | continuation | 分片消息的后续帧 |
| `0x1` | text | 文本数据，必须是合法 UTF-8 |
| `0x2` | binary | 二进制数据 |
| `0x8` | close | 关闭连接，可携带状态码和原因 |
| `0x9` | ping | 协议层心跳探测 |
| `0xA` | pong | 对 ping 的响应，也可主动发送 |

`0x3`～`0x7` 和 `0xB`～`0xF` 留给扩展或未来使用，不能随意当成自定义业务类型。业务消息类型应该放在 payload 的 JSON 字段或自己的二进制协议中。

### 15. MASK 是加密吗？为什么客户端必须掩码？

不是。掩码只是用一个随机的 32 位 masking key 对 payload 做异或变换，服务端拿到 key 后可以还原内容。

规范要求客户端发往服务端的帧必须掩码，服务端发往客户端的帧不要求掩码。这样可以降低恶意脚本构造特定字节流、污染中间代理缓存等风险。

掩码不提供机密性，也不防止中间人窃听。需要传输保密性时必须使用 TLS，也就是 `wss://`。

### 16. 文本帧和二进制帧有什么区别？

- 文本帧使用 opcode `0x1`，内容必须是合法 UTF-8，常用于 JSON 消息。
- 二进制帧使用 opcode `0x2`，可以传输 ArrayBuffer、Blob、压缩数据或自定义二进制协议。
- 二进制通常比 JSON 更节省体积，但需要双方约定字段布局、版本和兼容策略。

WebSocket 只负责传输，不会自动判断你的业务字段。实际项目通常会设计统一消息格式：

```json
{
  "id": "msg-20260827-001",
  "type": "chat.message",
  "version": 1,
  "payload": {
    "text": "你好"
  }
}
```

### 17. WebSocket 能保证消息一定送达且只处理一次吗？

不能直接保证。

TCP 会在连接仍然有效时保证字节流按序、可靠地传输，但以下情况仍然需要业务层处理：

- 连接在服务端收到消息后、客户端收到确认前断开。
- 客户端已经处理消息，但响应 ack 丢失，重连后再次请求。
- 重连期间服务端产生了新消息。
- 多实例广播或消息队列造成重复投递。

需要可靠业务语义时，可以设计消息 ID、递增序号、ack、服务端游标、幂等处理和离线补偿。例如客户端重连时携带最后处理序号，服务端根据序号补发缺失消息。

## 四、浏览器 JavaScript API

### 18. 浏览器端如何创建 WebSocket？

```javascript
const ws = new WebSocket('wss://example.com/socket')
```

第二个参数可以传入一个子协议字符串或字符串数组：

```javascript
const ws = new WebSocket('wss://example.com/socket', ['chat.v1'])
```

浏览器会自动完成底层 TCP、TLS 和 HTTP Upgrade 流程。业务代码不应该在连接尚未打开时立即发送消息。

### 19. WebSocket 有哪些 readyState？

| 常量 | 数值 | 含义 |
| --- | ---: | --- |
| `WebSocket.CONNECTING` | `0` | 正在连接 |
| `WebSocket.OPEN` | `1` | 已连接，可以发送 |
| `WebSocket.CLOSING` | `2` | 正在关闭 |
| `WebSocket.CLOSED` | `3` | 已关闭或连接失败 |

发送前应该判断：

```javascript
function sendJson(ws, message) {
  if (ws.readyState !== WebSocket.OPEN) {
    return false
  }

  ws.send(JSON.stringify(message))
  return true
}
```

### 20. 常用事件和消息类型有哪些？

```javascript
const ws = new WebSocket('wss://example.com/socket')
ws.binaryType = 'arraybuffer'

ws.addEventListener('open', () => {
  console.log('连接已打开')
})

ws.addEventListener('message', event => {
  if (typeof event.data === 'string') {
    console.log('收到文本:', event.data)
    return
  }

  console.log('收到二进制数据:', event.data.byteLength)
})

ws.addEventListener('error', event => {
  console.error('WebSocket 发生错误', event)
})

ws.addEventListener('close', event => {
  console.log('连接已关闭', {
    code: event.code,
    reason: event.reason,
    wasClean: event.wasClean
  })
})
```

`message` 事件的 `data` 可能是字符串、Blob 或 ArrayBuffer，不能永远按字符串处理。`error` 通常只表示连接发生错误，详细关闭原因往往需要结合 `close` 事件、服务端日志和关闭码分析。

### 21. `send()`、`bufferedAmount` 和 `binaryType` 怎么用？

- `send()` 只能在 `OPEN` 状态调用，否则可能抛出异常或丢失业务时机。
- `bufferedAmount` 表示已经调用 `send()` 但还没有交给网络发送完成的字节数，可用于发现发送积压。
- `binaryType = 'arraybuffer'` 时，浏览器收到二进制消息通常以 ArrayBuffer 交给应用；默认值通常是 `blob`。

```javascript
function sendWithBackpressure(ws, message) {
  const maxBufferedBytes = 1024 * 1024
  if (ws.readyState !== WebSocket.OPEN) {
    return false
  }
  if (ws.bufferedAmount > maxBufferedBytes) {
    console.warn('发送队列过大，暂缓低优先级消息')
    return false
  }

  ws.send(JSON.stringify(message))
  return true
}
```

`bufferedAmount` 只是观察指标，不是完整的发送队列管理方案。重要消息仍需要业务层排队、限流和重试策略。

### 22. 如何正确关闭连接？

```javascript
if (ws.readyState === WebSocket.OPEN) {
  ws.close(1000, '页面离开')
}
```

`1000` 表示正常关闭。组件卸载、用户退出登录或页面不再需要实时数据时，应清除心跳定时器、重连定时器和事件监听，并关闭连接。否则旧连接可能继续接收消息，甚至和新连接重复订阅。

## 五、心跳、断线重连与消息可靠性

### 23. 协议层 ping/pong 和应用层心跳有什么区别？

**协议层心跳**是 WebSocket 帧的一部分。服务端发送 `ping`，客户端协议栈自动回复 `pong`，适合检测 TCP/连接是否仍然可用。

**应用层心跳**是业务消息，例如：

```json
{
  "type": "ping",
  "timestamp": 1690000000000
}
```

服务端可以返回带业务信息的 `pong`。它除了探测连接，还可以确认用户会话、订阅状态或业务处理链路是否仍然正常。

浏览器端 JavaScript 不能直接调用协议级 `ping`，所以浏览器客户端通常使用应用层心跳。Node.js 服务端库则通常提供发送 ping 的能力。

### 24. 心跳应该怎样判断连接已经失效？

仅仅“每隔 30 秒发送一次 ping”还不够，还需要记录响应时间：

1. 建立连接后启动心跳定时器。
2. 每个周期发送应用层 ping，或由服务端发送协议 ping。
3. 收到 pong 或有效业务消息时更新 `lastSeenAt`。
4. 如果超过超时时间没有响应，主动关闭连接。
5. 关闭后清理旧定时器，再决定是否重连。

心跳周期和超时时间要结合代理空闲超时、网络环境和服务端容量设置，不能使用过短周期让大量客户端频繁产生无意义流量。

### 25. 断线重连应该怎么设计？

**规范回答（可直接复述）**

客户端应在 `close` 事件中统一处理重连，使用带最大等待时间和随机抖动的指数退避，避免服务端故障时所有客户端同时重连。重连前要确保旧连接、心跳定时器和重连定时器已经清理；重连成功后重新鉴权、订阅频道，并根据最后处理的消息序号补偿缺失消息。用户主动退出或组件卸载后应停止重连。

一个简化示例：

```javascript
let socket
let reconnectTimer
let retryCount = 0
let shouldReconnect = true

function connect() {
  if (!shouldReconnect) return

  socket = new WebSocket('wss://example.com/socket')

  socket.addEventListener('open', () => {
    retryCount = 0
    socket.send(JSON.stringify({ type: 'subscribe', channel: 'notice' }))
  })

  socket.addEventListener('close', () => {
    if (!shouldReconnect) return
    const baseDelay = Math.min(1000 * 2 ** retryCount, 30000)
    const jitter = Math.floor(Math.random() * 1000)
    retryCount += 1
    reconnectTimer = setTimeout(connect, baseDelay + jitter)
  })
}

function stop() {
  shouldReconnect = false
  clearTimeout(reconnectTimer)
  if (socket && socket.readyState < WebSocket.CLOSING) {
    socket.close(1000, '主动停止')
  }
}
```

生产代码还需要防止重复调用 `connect()`、限制重连次数或给出离线状态，并根据关闭码决定“立即重连、延迟重连还是停止重连”。

### 26. 如何保证重连期间的消息不丢失？

WebSocket 断线后，连接中的发送队列和未确认消息不能简单认为已经送达。常见做法是：

- 每条重要消息分配唯一 `messageId`。
- 服务端为消息或事件分配递增序号。
- 客户端处理成功后发送 ack。
- 服务端保存一段时间的可补偿消息。
- 重连时客户端带上最后处理的序号或游标。
- 服务端补发缺失消息，客户端按 `messageId` 幂等处理。

“至少一次投递”通常需要去重；“至多一次投递”可能丢消息；真正的一次且仅一次通常需要更复杂的业务事务和幂等设计，不能由 WebSocket 单独提供。

### 27. 常见关闭状态码有哪些？

| 状态码 | 含义 | 常见处理 |
| --- | --- | --- |
| `1000` | 正常关闭 | 通常不需要异常告警 |
| `1001` | 端点离开 | 服务重启或页面离开 |
| `1002` | 协议错误 | 检查客户端和服务端实现 |
| `1003` | 不支持的数据类型 | 停止发送该类型 |
| `1007` | 数据格式错误 | 修正 UTF-8 或业务格式 |
| `1008` | 违反策略 | 检查权限、频率或业务规则 |
| `1009` | 消息过大 | 缩小消息或改用文件传输 |
| `1011` | 服务端异常 | 延迟重连并查看服务端日志 |
| `1006` | 异常关闭 | 浏览器报告值，不能由应用主动发送 |

关闭码用于诊断和重连策略。鉴权失败、主动退出、协议错误和服务端重启不应全部使用同一个状态码。

## 六、安全、鉴权与资源保护

### 28. WebSocket 如何做身份认证？

常见方案有：

- 先通过 HTTPS 登录，握手时自动携带安全 Cookie 或 Session。
- 使用短期访问凭证，在握手阶段由服务端验证。
- 通过受控的子协议或特定请求头协商鉴权信息，但要考虑浏览器 API 和日志暴露边界。

不建议把长期 token 直接放进 URL query，因为 URL 可能出现在网关、Nginx、监控系统、浏览器历史和访问日志中。如果不得不使用 query token，应使用短期、一次性或范围受限的凭证，并避免记录完整 URL。

无论采用哪种方式，握手成功只代表连接建立。每条业务消息仍然需要检查用户是否有权访问对应房间、文章、设备或操作。

### 29. 什么是 CSWSH？如何防护？

CSWSH 是跨站 WebSocket 劫持。攻击者诱导用户访问恶意网页，恶意网页尝试利用浏览器自动携带的 Cookie 建立 WebSocket 连接。如果服务端只看 Cookie、不检查来源和业务权限，攻击者可能读取或操作用户有权限访问的数据。

防护重点包括：

- 在握手阶段严格校验 `Origin` 白名单。
- Cookie 使用合适的 `SameSite`、`Secure` 和 `HttpOnly` 属性。
- 对敏感操作增加 CSRF 防护或一次性连接凭证。
- 握手成功后继续做用户、房间和操作级权限校验。
- 不要把 `Origin` 校验误认为普通 CORS 配置；两者不是同一机制。

### 30. 如何防止 WebSocket 被资源耗尽？

服务端至少应考虑：

- 单 IP、单用户、单设备的连接数上限。
- 单帧、单条业务消息和 JSON 嵌套深度上限。
- 握手频率、消息频率、订阅数量和广播范围限制。
- 空闲连接超时和半开连接清理。
- 慢客户端发送队列上限，必要时主动降级或关闭。
- 广播消息大小和接收者数量控制。
- 对异常断开、鉴权失败和频繁重连进行监控与限流。

不要信任客户端传来的用户 ID、角色、房间归属或管理员字段，这些值必须由服务端根据登录态和数据库重新判断。

## 七、服务端实现、扩容与性能

### 31. Node.js `ws` 如何实现一个最小服务端？

下面示例使用 CommonJS，适合直接运行在 `type` 未设置为 `module` 的 Node.js 项目中。当前项目如果使用 ESM，应改为 `import WebSocket, { WebSocketServer } from 'ws'` 的写法，不能混用两种模块语法。

```javascript
const WebSocket = require('ws')

const wss = new WebSocket.WebSocketServer({ port: 8080 })

wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'system', text: '欢迎连接' }))

  ws.on('message', (data, isBinary) => {
    const text = isBinary ? data : data.toString()
    console.log('收到消息:', text)

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ack', received: true }))
    }
  })

  ws.on('close', (code, reason) => {
    console.log('连接关闭:', code, reason.toString())
  })
})
```

生产实现还需要在连接建立时鉴权、在消息处理时校验 schema、限制消息大小，并在关闭时清理用户订阅和房间关系。示例中的广播和错误处理不能直接当作完整生产方案。

### 32. WebSocket 多实例部署为什么需要消息中间件？

单个 Node.js 进程只能直接看到自己持有的连接。多实例部署时，用户 A 可能连接到实例 1，用户 B 连接到实例 2；实例 1 的内存广播不会自动到达实例 2。

常见架构是：

1. 客户端连接到任意 WebSocket 实例。
2. 实例把业务事件发布到 Redis Pub/Sub、消息队列或其他共享系统。
3. 所有需要该事件的实例订阅并向本机连接发送。
4. 重要消息另外保存到消息表、Redis Streams、Kafka 或数据库，以便重连补偿。

Redis Pub/Sub 适合实时广播，但不负责离线消息持久化。多实例还要考虑重复投递、消息顺序、幂等、连接路由和服务重启。

### 33. WebSocket 有哪些性能和监控重点？

- 控制单连接发送队列和 `bufferedAmount`，避免慢客户端占用无限内存。
- 大消息拆分、分页或改用对象存储和 HTTP 下载，不要让 WebSocket 承担所有文件传输。
- 根据消息特征评估 `permessage-deflate`，压缩会消耗 CPU 和内存，短消息不一定收益高。
- 广播时按房间、用户或订阅关系过滤，不能无条件向所有连接发送大包。
- 监控连接数、活跃连接数、消息吞吐、P95/P99 延迟、发送队列、心跳超时、错误率和重连率。
- 服务重启前先停止接收新连接，通知旧客户端并等待合理时间，再优雅关闭。

WebSocket 连接是长连接，连接数本身就是服务端资源。CPU、内存、文件描述符、内核连接队列和代理超时都需要纳入容量评估。

## 八、WebSocket、轮询、长轮询和 SSE 的选型

### 34. WebSocket 与 HTTP 有什么区别？

| 对比项 | HTTP | WebSocket |
| --- | --- | --- |
| 通信模型 | 请求-响应 | 双向、全双工消息通道 |
| 连接使用 | 可短连接，也可 keep-alive 复用 TCP | 通常建立后持续存在 |
| 服务端主动发送 | 需要 SSE、长轮询或流式响应等机制 | 原生支持 |
| 数据格式 | 常见为 HTTP body 和 header | 文本帧或二进制帧 |
| 典型用途 | CRUD、登录、文件、普通 API | 聊天、协同、实时状态 |
| 复杂度 | 基础设施成熟、请求边界清晰 | 需要自行设计心跳、重连和可靠性 |

HTTP keep-alive 只是复用连接，并不等于服务端可以随时向客户端发送新的业务消息。HTTP/2、HTTP/3 具备多路复用等能力，但不能简单等同于 WebSocket 的业务消息通道，实际要根据协议和框架支持情况选型。

### 35. 短轮询、长轮询、SSE 和 WebSocket 怎么选？

- **短轮询**：客户端按固定间隔发请求。实现最简单，但无数据时也会产生大量请求，实时性受轮询间隔影响。
- **长轮询**：服务端暂不立即返回，等有数据或超时后响应。比短轮询及时，但响应结束后还要再次建立请求。
- **SSE**：基于 HTTP 的服务端到客户端单向文本事件流，浏览器有自动重连和 `Last-Event-ID` 机制，适合通知、日志和 AI 流式输出。它不是原生双向通道，也不提供 WebSocket 那样的二进制帧能力。
- **WebSocket**：适合客户端和服务端都需要主动发送消息、消息频繁且需要双向交互的场景，但需要自行处理连接治理和消息可靠性。

可以这样快速判断：

```text
普通请求和响应       -> HTTP
只需要服务端持续推送 -> SSE
双方都要实时发送     -> WebSocket
简单且低频的状态查询 -> 短轮询或普通 HTTP
```

## 九、面试速答与高频追问

### 36. 面试时怎样完整回答“WebSocket 的工作原理”？

可以按“定义 -> 握手 -> 帧 -> 工程边界”的顺序回答：

> WebSocket 是一种基于 TCP 的应用层协议，用于在客户端和服务端之间建立双向、全双工的持久连接。连接开始时，客户端先发送带有 `Upgrade: websocket` 的 HTTP GET 请求，服务端校验请求后返回 `101 Switching Protocols`，并使用客户端的 `Sec-WebSocket-Key` 加固定 GUID 经过 SHA-1 和 Base64 计算出 `Sec-WebSocket-Accept`。握手成功后，双方不再使用普通 HTTP 请求-响应，而是通过 WebSocket 帧传输文本或二进制消息。客户端发送的帧必须掩码，服务端通常不需要掩码。工程上还要补充心跳、断线重连、鉴权、限流、消息 ack、序号去重、离线补偿以及多实例广播方案。

### 37. 面试官问“WebSocket 一定比 HTTP 快吗？”

不应该直接回答“一定”。更准确的回答是：

> 对于需要频繁交互的实时场景，WebSocket 在连接建立后可以减少重复 HTTP 请求、响应和头部开销，因此通常能降低通信开销和感知延迟。但首次连接仍然需要 TCP、TLS 和 HTTP 握手，实际性能还受网络、代理、消息大小、服务端处理和拥塞控制影响。对于低频 CRUD 请求，普通 HTTP 往往更简单，综合成本反而更低。

### 38. 面试官问“WebSocket 如何保证可靠性？”

可以回答：

> WebSocket 底层依赖 TCP，连接正常时能够提供有序、可靠的字节传输，但它不提供业务层的消息确认、离线补偿和严格一次处理语义。重要业务通常会增加消息 ID、序号、ack、重连游标、服务端补发和幂等去重。这样可以根据业务需要实现至少一次投递或可恢复的消息处理。

### 39. 面试官问“为什么不用 WebSocket 做所有通信？”

可以回答：

> WebSocket 适合双向实时消息，但连接治理、网关配置、鉴权、重连、扩容和消息可靠性都更复杂。普通查询、表单、文件下载使用 HTTP 更符合请求-响应语义；只有服务端单向持续推送时，SSE 可能更简单。技术选型应根据方向、频率、可靠性、数据类型和部署环境决定。

### 40. WebSocket 常见易错点

- `Sec-WebSocket-Key` 不是登录 token。
- MASK 不是加密，保密要使用 `wss://`。
- `101` 只代表协议升级成功，不代表业务授权成功。
- TCP 可靠不等于业务消息绝不丢失、绝不重复。
- 浏览器不能直接发送协议级 ping，通常使用应用层心跳。
- HTTP keep-alive 不等于服务端可以主动推送。
- SSE 是单向文本事件流，不是双向 WebSocket 替代品。
- WebSocket 不会自动解决多实例广播和离线消息。
- 连接成功后仍然要校验每条业务消息的权限和数据格式。
- 关闭连接和重连时必须清理旧定时器、旧监听器和旧订阅。

## 十、学习和背诵建议

建议按以下顺序复习：

1. 先理解“HTTP 握手，WebSocket 帧通信”的主线。
2. 再掌握 `101`、`Sec-WebSocket-Key`、FIN、opcode、MASK 和控制帧。
3. 然后练习浏览器 API、心跳、重连和关闭码。
4. 最后补充鉴权、限流、ack、离线补偿、多实例和监控。
5. 面试回答按“定义 -> 原理 -> 场景 -> 边界”组织，不要只背“低延迟、全双工、实时”几个关键词。

只要能说明 WebSocket 解决了什么问题、连接如何建立、数据如何传输，以及生产环境还要补哪些能力，就比只会写 `new WebSocket()` 更接近规范的面试回答。
