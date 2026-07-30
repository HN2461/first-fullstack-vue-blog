---
title: "WebSocket 性能优化与高并发实战：单连接拆分、压缩、节流、内存泄漏与组件生命周期"
slug: "websocket-websocket-1b7cd930"
summary: "这是 WebSocket 专题的第 11 篇，专门讲 WebSocket 在真实项目中的性能优化，包括单连接 vs 多连接的拆分时机、消息压缩、二进制帧与文本帧的选择、大消息分片、前端消息队列与节流渲染、内存泄漏排查，以及 Vue/uni-app 组件频繁挂载卸载时的连接管理策略。"
category: "WebSocket"
tags:
  - "WebSocket"
  - "性能优化"
  - "高并发"
  - "消息节流"
  - "内存泄漏"
  - "permessage-deflate"
  - "Vue"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d29208a2b1c68f2cac750"
originalSlug: "websocket-websocket-1b7cd930"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# WebSocket 性能优化与高并发实战：单连接拆分、压缩、节流、内存泄漏与组件生命周期

> 这是 `项目复用技术 / WebSocket` 专题的第 11 篇。
> 前面几篇已经把"怎么连、怎么拆帧、怎么重连、怎么标准化消息"讲完了。
> 这一篇专门回答一个很现实的问题：
>
> `连上以后，跑得稳不稳、快不快、会不会偷偷吃内存？`
>
> 这一篇不讲新概念，只讲：
>
> 1. 连接数怎么规划
> 2. 帧格式怎么选
> 3. 消息怎么压缩和分片
> 4. 快速消息怎么节流渲染
> 5. 内存怎么管
> 6. 组件频繁挂载卸载时怎么保稳

## 一、单连接 vs 多连接：什么时候该拆

### 1.1 先记住一条原则

`大多数业务场景，一条 WebSocket 连接就够了。`

如果你没有遇到下面这些问题，就不要拆：

1. 某类消息频率极高，把其他消息挤占了
2. 某类消息对延迟要求极高，不能和普通消息排队
3. 服务端要求不同业务走不同端点
4. 某类消息的鉴权方式和其他消息不同

### 1.2 单连接为什么是默认选择

```txt
┌──────────────────────────────────────────┐
│              一条 WebSocket 连接            │
│                                          │
│  /user/u001    → 私聊消息                  │
│  /topic/g001   → 群聊消息                  │
│  /topic/notice → 系统通知                  │
│  /user/alert   → 实时告警                  │
└──────────────────────────────────────────┘
```

好处：

1. 只需要维护一个连接状态机
2. 只需要一套心跳和重连逻辑
3. 服务端资源占用少
4. 前端代码更简单

### 1.3 什么时候必须拆成多连接

#### 场景 1：消息频率差异极大

比如：

- 聊天消息：每秒 0-2 条
- 股票行情推送：每秒 1000+ 条

如果都走一条连接，高频行情会把低频聊天的 `onMessage` 堵住，页面渲染也会被高频消息拖垮。

这时候更适合拆成：

```txt
┌─────────────────────┐    ┌─────────────────────┐
│  连接 1：聊天 + 通知    │    │  连接 2：行情推送      │
│  频率低，优先级高       │    │  频率高，可容忍丢帧     │
└─────────────────────┘    └─────────────────────┘
```

#### 场景 2：延迟要求不同

- 聊天消息：200ms 内到达就行
- 实时协作（如在线文档光标同步）：需要 < 50ms

低延迟场景不适合和高延迟场景共用一条连接的发送队列。

#### 场景 3：服务端强制拆端点

有些后端架构会把不同业务拆到不同 WebSocket 端点：

```txt
wss://api.example.com/ws/chat
wss://api.example.com/ws/monitor
wss://api.example.com/ws/notification
```

前端只能跟着拆。

### 1.4 多连接的代价

拆之前一定要想清楚这些代价：

| 代价 | 说明 |
|------|------|
| 连接数翻倍 | 每条连接都有心跳开销和重连逻辑 |
| 状态管理变复杂 | 多个 `ConnectionManager` 的状态要协调 |
| 服务端压力大 | 每条连接都占一个文件描述符和内存 |
| 小程序有上限 | 微信小程序同时最多 5 个 WebSocket 连接 |
| 电池和流量 | 移动端每多一条连接，后台保活就多一份消耗 |

### 1.5 推荐决策树

```
需要多连接吗？
│
├─ 消息频率差异 > 10 倍？
│   └─ 是 → 拆
│
├─ 延迟要求差异 > 4 倍？
│   └─ 是 → 拆
│
├─ 服务端强制不同端点？
│   └─ 是 → 只能拆
│
├─ 跑在微信小程序上？
│   └─ 是 → 尽量不拆（上限 5 条）
│
└─ 都不是
    └─ 不拆，用 destination 区分即可
```

### 1.6 如果决定拆，怎么管理

推荐给每条连接一个独立的 `ConnectionManager`，然后上面再包一个统一调度层：

```js
class ConnectionPool {
  constructor() {
    this.pools = new Map()
  }

  register(name, connectionManager) {
    this.pools.set(name, connectionManager)
  }

  get(name) {
    return this.pools.get(name)
  }

  // 统一断开所有连接
  disconnectAll() {
    for (const [, manager] of this.pools) {
      manager.disconnect()
    }
  }

  // 统一检查连接状态
  getStatusMap() {
    const result = {}
    for (const [name, manager] of this.pools) {
      result[name] = manager.isConnected()
    }
    return result
  }
}
```

页面层只面对 `ConnectionPool`，不直接碰单个 `ConnectionManager`。

---

## 二、消息压缩：permessage-deflate

### 2.1 为什么需要压缩

WebSocket 帧本身没有压缩。如果你发一条 JSON 消息：

```json
{"messageId":"m001","fromUserID":"u001","fromUserName":"张三","toUserID":"u002","type":1,"content":"你好","timestamp":1710000000000}
```

原始大小约 140 字节。如果每秒发 100 条，那就是 14KB/s。

看起来不多，但如果：

1. 同时有 10000 个连接
2. 每个连接都在高频推送
3. 移动端在弱网环境

压缩就能显著降低带宽和延迟。

### 2.2 permessage-deflate 是什么

它是 WebSocket 协议的一个扩展，在握手阶段协商：

```http
GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Extensions: permessage-deflate
```

服务端同意后：

```http
HTTP/1.1 101 Switching Protocols
Sec-WebSocket-Extensions: permessage-deflate
```

之后每个 WebSocket message 都可以按协商结果进行 deflate 压缩和解压。

### 2.3 前端要不要做额外工作

**不需要。**

浏览器和 uni-app 的 WebSocket 实现会自动处理压缩和解压。你只要确认：

1. 服务端开启了 `permessage-deflate`
2. 握手时协商成功

在 Chrome DevTools 的 Network 面板里，如果握手响应里出现 `Sec-WebSocket-Extensions: permessage-deflate`，就说明压缩已协商成功。

### 2.4 服务端配置示例

#### Nginx

```nginx
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    # Nginx 默认不压缩 WebSocket 帧，需要后端应用层处理
    # 或使用支持 permessage-deflate 的 WebSocket 服务端
}
```

#### Node.js (ws 库)

```js
const wss = new WebSocket.Server({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // 低于 256 字节的消息不压缩（压缩反而更大）
    threshold: 256,
  },
})
```

#### Java（Spring 生态）

Spring 本身不提供一个统一的 `spring.websocket.compression: true` 开关，是否支持 `permessage-deflate` 取决于你使用的容器和 WebSocket 服务端实现。落地时要先查具体框架 / 容器文档。

### 2.5 注意事项

1. **小消息不要压缩**：低于 256 字节的消息，压缩后可能反而更大（因为 deflate 头部开销）
2. **CPU 换带宽**：压缩是 CPU 换带宽，服务端 CPU 紧张时要谨慎
3. **浏览器兼容**：所有现代浏览器都支持，但部分老版本小程序运行时不支持
4. **调试时注意**：开启压缩后，抓包看到的帧内容是压缩后的，不再是明文

### 2.6 如果运行时不支持 permessage-deflate 怎么办

可以退到**应用层压缩**：

```js
// 发送前压缩
import pako from 'pako'

function compressAndSend(socket, data) {
  const json = JSON.stringify(data)
  const compressed = pako.deflate(json)
  socket.send(compressed)
}

// 接收后解压
function receiveAndDecompress(event) {
  let data = event.data
  if (data instanceof Blob || data instanceof ArrayBuffer) {
    const inflated = pako.inflate(new Uint8Array(data))
    data = new TextDecoder().decode(inflated)
  }
  return JSON.parse(data)
}
```

这种方案更灵活，但需要前后端约定压缩格式。

---

## 三、二进制帧 vs 文本帧：该选哪个

### 3.1 WebSocket 的两种帧类型

```txt
opcode 0x1 → 文本帧（Text Frame）
opcode 0x2 → 二进制帧（Binary Frame）
```

前端通过 `socket.binaryType` 控制接收格式：

```js
const socket = new WebSocket('wss://example.com/ws')
socket.binaryType = 'blob'      // 默认，收到 Blob
socket.binaryType = 'arraybuffer' // 收到 ArrayBuffer，性能更好
```

### 3.2 文本帧：适合什么

适合：

1. JSON 消息（最常见）
2. STOMP 帧（文本协议）
3. 纯文本聊天

优点：

1. 人类可读，调试方便
2. 前端直接 `JSON.parse`
3. 不需要额外编码/解码

缺点：

1. 体积大（JSON 的 key 会重复传输）
2. 数字和布尔值要转字符串再转回来
3. 不适合传二进制文件

### 3.3 二进制帧：适合什么

适合：

1. 高频小消息（用 Protobuf / MessagePack 压缩）
2. 图片、音频、文件传输
3. 游戏实时位置同步
4. 实时协作的 OT/CRDT 操作

优点：

1. 体积小（Protobuf 比 JSON 小 3-10 倍）
2. 解析快（不需要 `JSON.parse`，直接按偏移读字段）
3. 天然适合二进制内容

缺点：

1. 不可读，调试需要额外工具
2. 需要前后端共享 schema
3. STOMP 本身支持二进制 body，但如果你当前的客户端封装只按文本解析，就不要直接把二进制当文本发

### 3.4 实际性能对比

以一个典型的聊天消息为例：

**JSON 文本帧**：

```json
{
  "messageId": "m-20260514-001",
  "fromUserId": "u-001",
  "toUserId": "u-002",
  "type": 1,
  "content": "你好，这是一条测试消息",
  "timestamp": 1747200000000
}
```

约 **175 字节**。

**Protobuf 二进制帧**：

```protobuf
message ChatMessage {
  string message_id = 1;
  string from_user_id = 2;
  string to_user_id = 3;
  int32 type = 4;
  string content = 5;
  int64 timestamp = 6;
}
```

同样内容编码后约 **55 字节**，压缩率约 **68%**。

### 3.5 前端使用 Protobuf 的完整示例

```js
import protobuf from 'protobufjs'

// 1. 加载 schema
const root = await protobuf.load('chat.proto')
const ChatMessage = root.lookupType('ChatMessage')

// 2. 发送：编码成二进制
function sendProtobufMessage(socket, payload) {
  const errMsg = ChatMessage.verify(payload)
  if (errMsg) throw new Error(errMsg)

  const message = ChatMessage.create(payload)
  const buffer = ChatMessage.encode(message).finish()
  socket.send(buffer)
}

// 3. 接收：解码二进制
socket.binaryType = 'arraybuffer'

socket.onmessage = (event) => {
  if (event.data instanceof ArrayBuffer) {
    const message = ChatMessage.decode(new Uint8Array(event.data))
    console.log('收到二进制消息：', message)
  } else {
    // 文本消息走原有逻辑
    const data = JSON.parse(event.data)
    console.log('收到文本消息：', data)
  }
}
```

### 3.6 选择建议

| 场景 | 推荐 | 理由 |
|------|------|------|
| 聊天 + 通知（STOMP） | 文本帧 | STOMP 是文本协议 |
| 高频行情 / 实时位置 | 二进制帧 + Protobuf | 体积小、解析快 |
| 文件传输 | 二进制帧 | 天然二进制 |
| 混合场景 | 双模式 | 根据 opcode 或 destination 区分 |

---

## 四、大消息分片策略

### 4.1 WebSocket 自身的分帧机制

WebSocket 协议本身支持分帧（fragmentation）：

```txt
FIN=0, opcode=0x2 → 第一片（二进制）
FIN=0, opcode=0x0 → 中间片（continuation）
FIN=0, opcode=0x0 → 中间片（continuation）
FIN=1, opcode=0x0 → 最后一片（continuation）
```

但浏览器前端**无法手动控制 WebSocket 分帧**。`socket.send()` 的数据要么整条发出，要么报错。

所以这里的"分片"指的是**应用层分片**，不是协议层分帧。

### 4.2 什么时候需要应用层分片

1. 发送文件（几 MB 到几百 MB）
2. 发送长文本（比如富文本编辑器内容）
3. 发送批量数据（比如一次同步 1000 条消息）

如果不分片，问题有：

1. 单条消息太大，`send()` 可能阻塞
2. 内存峰值飙升（整个消息都在内存里）
3. 网络不好时，一条大消息失败就要全部重传

### 4.3 推荐的分片协议

在前端和后端之间约定一个简单的分片协议：

```js
// 分片协议格式
{
  "transferId": "t-001",     // 传输任务 ID
  "chunkIndex": 0,            // 当前分片序号（从 0 开始）
  "totalChunks": 10,          // 总分片数
  "chunkData": "base64...",   // 当前分片数据
  "isLast": false             // 是否最后一片
}
```

### 4.4 发送端：文件分片上传

```js
/**
 * 分片发送文件。
 * 用途：把大文件切成小块，通过 WebSocket 逐片发送，避免单条消息过大。
 * 参数：socket 为 WebSocket 实例；file 为 File 对象；chunkSize 为每片字节数。
 * 返回值：Promise<void>，所有分片发送完毕后 resolve。
 * 边界行为：发送失败时 abort；分片序号从 0 开始。
 */
async function sendFileInChunks(socket, file, chunkSize = 64 * 1024) {
  const transferId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const totalChunks = Math.ceil(file.size / chunkSize)

  for (let index = 0; index < totalChunks; index++) {
    const start = index * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const blob = file.slice(start, end)

    const arrayBuffer = await blob.arrayBuffer()
    const base64 = arrayBufferToBase64(arrayBuffer)

    const chunk = {
      transferId,
      chunkIndex: index,
      totalChunks,
      chunkData: base64,
      isLast: index === totalChunks - 1,
    }

    socket.send(JSON.stringify(chunk))

    // 每发一片后稍微让出主线程，避免阻塞
    await sleep(10)
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

### 4.5 接收端：分片重组

```js
class ChunkReassembler {
  constructor() {
    // transferId -> { chunks: Map<index, data>, totalChunks, receivedCount }
    this.transfers = new Map()
  }

  /**
   * 处理收到的分片。
   * 用途：将乱序到达的分片缓存，全部到齐后拼接成完整数据。
   * 参数：chunk 为分片对象。
   * 返回值：所有分片到齐时返回完整数据；否则返回 null。
   * 边界行为：重复分片会被忽略。
   */
  handleChunk(chunk) {
    const { transferId, chunkIndex, totalChunks, chunkData, isLast } = chunk

    if (!this.transfers.has(transferId)) {
      this.transfers.set(transferId, {
        chunks: new Map(),
        totalChunks,
        receivedCount: 0,
      })
    }

    const transfer = this.transfers.get(transferId)

    // 忽略重复分片
    if (transfer.chunks.has(chunkIndex)) {
      return null
    }

    transfer.chunks.set(chunkIndex, chunkData)
    transfer.receivedCount += 1

    // 全部到齐
    if (transfer.receivedCount === transfer.totalChunks) {
      const complete = this.reassemble(transfer)
      this.transfers.delete(transferId)
      return complete
    }

    return null
  }

  reassemble(transfer) {
    const parts = []
    for (let i = 0; i < transfer.totalChunks; i++) {
      parts.push(transfer.chunks.get(i))
    }
    return parts.join('')
  }
}
```

### 4.6 分片大小的选择

| 分片大小 | 适合场景 | 优缺点 |
|----------|---------|--------|
| 16 KB | 弱网 / 小程序 | 更细粒度重传，但控制消息更多 |
| 64 KB | 通用场景 | 平衡选择 |
| 256 KB | 局域网 / 强网 | 传输效率高，但失败代价大 |
| 1 MB+ | 极少使用 | 单片失败代价太大 |

### 4.7 注意事项

1. **分片不等于并发**：分片是串行发送的，不是并行
2. **超时清理**：如果传输中途断连，`transfers` 里会残留半成品，要定时清理
3. **base64 膨胀**：base64 编码会让体积增大约 33%，如果服务端支持，优先用二进制帧直接传
4. **进度反馈**：可以在每发一片时通知页面更新进度条

---

## 五、前端消息队列与节流：快速消息不逐条渲染

### 5.1 问题：消息来得太快，页面卡死

假设后端每秒推 100 条消息，如果你每条都直接操作 DOM：

```js
// ❌ 错误做法：每条消息都触发一次 DOM 更新
stompClient.subscribe('/topic/market', (message) => {
  const data = JSON.parse(message.body)
  appendToMessageList(data) // 每次都操作 DOM
})
```

结果：

1. DOM 操作每秒 100 次
2. 浏览器渲染跟不上
3. 页面卡顿，滚动掉帧
4. Vue/React 的响应式系统也会被拖垮

### 5.2 方案 1：消息缓冲 + 定时批量渲染

```js
/**
 * 消息节流器。
 * 用途：把高频消息缓存到队列，按固定间隔批量交给渲染层。
 * 参数：flushInterval 为批量刷新间隔（毫秒）；maxBatchSize 为单次最大批量。
 */
class MessageThrottler {
  constructor(flushInterval = 100, maxBatchSize = 50) {
    this.queue = []
    this.flushInterval = flushInterval
    this.maxBatchSize = maxBatchSize
    this.timer = null
    this.onFlush = null
  }

  /**
   * 推入消息。
   * 用途：新消息先进队列，由定时器统一取出。
   * 参数：message 为原始消息对象。
   * 返回值：无。
   * 边界行为：队列满时丢弃最早的消息（FIFO 溢出）。
   */
  push(message) {
    this.queue.push(message)

    // 防止队列无限增长
    if (this.queue.length > this.maxBatchSize * 3) {
      this.queue.splice(0, this.queue.length - this.maxBatchSize)
    }

    if (!this.timer) {
      this.startFlushTimer()
    }
  }

  startFlushTimer() {
    this.timer = setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  flush() {
    if (this.queue.length === 0) {
      this.stopFlushTimer()
      return
    }

    const batch = this.queue.splice(0, this.maxBatchSize)

    if (this.onFlush) {
      this.onFlush(batch)
    }
  }

  stopFlushTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  destroy() {
    this.stopFlushTimer()
    this.queue = []
    this.onFlush = null
  }
}
```

使用方式：

```js
const throttler = new MessageThrottler(100, 50)

throttler.onFlush = (batch) => {
  // 100ms 内收到的消息，一次性渲染
  batch.forEach((msg) => {
    messageList.value.push(msg)
  })
}

// 订阅时推入节流器
stompClient.subscribe('/topic/market', (message) => {
  const data = JSON.parse(message.body)
  throttler.push(data)
})

// 页面卸载时销毁
onUnmounted(() => {
  throttler.destroy()
})
```

### 5.3 方案 2：requestAnimationFrame 渲染

适合需要和浏览器渲染帧对齐的场景：

```js
class RAFThrottler {
  constructor(maxBatchSize = 50) {
    this.queue = []
    this.maxBatchSize = maxBatchSize
    this.rafId = null
    this.onFlush = null
  }

  push(message) {
    this.queue.push(message)

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.flush())
    }
  }

  flush() {
    this.rafId = null

    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.maxBatchSize)

    if (this.onFlush) {
      this.onFlush(batch)
    }

    // 如果还有剩余，继续排队下一帧
    if (this.queue.length > 0) {
      this.rafId = requestAnimationFrame(() => this.flush())
    }
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.queue = []
    this.onFlush = null
  }
}
```

**好处**：渲染节奏和浏览器刷新率对齐（通常是 60fps），不会出现一帧内多次 DOM 操作。

### 5.4 方案 3：虚拟列表 + 只渲染可视区域

当消息列表很长时，即使节流了推送频率，DOM 节点数太多也会卡。

```js
// 思路：只渲染可视区域内的消息
// 推荐使用现成的虚拟列表组件：
// - Vue 3: vue-virtual-scroller / vueuc
// - uni-app: 自行实现或使用 uvui 的虚拟列表

// 核心思路
const visibleMessages = computed(() => {
  return allMessages.value.slice(
    viewportStart.value,
    viewportEnd.value
  )
})
```

### 5.5 方案 4：采样 + 聚合（行情类场景）

如果是行情数据，不需要每条都渲染：

```js
/**
 * 行情采样器。
 * 用途：高频行情数据只保留最新值，避免重复渲染同一标的价格。
 * 参数：无。
 * 返回值：无。
 */
class MarketSampler {
  constructor() {
    // symbol -> 最新行情
    this.latest = new Map()
    this.timer = null
    this.onSample = null
  }

  push(ticker) {
    // 只保留每个标的的最新值
    this.latest.set(ticker.symbol, ticker)
  }

  start(interval = 200) {
    this.timer = setInterval(() => {
      if (this.latest.size === 0) return

      const snapshot = Array.from(this.latest.values())
      this.latest.clear()

      if (this.onSample) {
        this.onSample(snapshot)
      }
    }, interval)
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.latest.clear()
    this.onSample = null
  }
}
```

### 5.6 四种方案的选择

| 方案 | 适合场景 | 渲染频率 |
|------|---------|---------|
| 缓冲 + 定时批量 | 通用聊天、通知 | 每 100ms 一批 |
| requestAnimationFrame | 需要和帧对齐的 UI | 每帧一批（~16ms） |
| 虚拟列表 | 消息总量很大 | 可视区域 |
| 采样 + 聚合 | 行情、实时状态 | 每 200ms 最新值 |

---

## 六、内存泄漏排查：定时器、回调、订阅表

### 6.1 WebSocket 项目最常见的 5 种内存泄漏

#### 泄漏 1：定时器没清

```js
// ❌ 组件销毁后定时器还在跑
onMounted(() => {
  setInterval(() => {
    heartbeat()
  }, 5000)
})

// ✅ 组件销毁时清除
let heartbeatTimer = null

onMounted(() => {
  heartbeatTimer = setInterval(() => {
    heartbeat()
  }, 5000)
})

onUnmounted(() => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
})
```

#### 泄漏 2：回调没解绑

```js
// ❌ 组件销毁后回调还在被执行
onMounted(() => {
  messageService.onMessageReceived(handleMessage)
})

// ✅ 组件销毁时解绑
onMounted(() => {
  messageService.onMessageReceived(handleMessage)
})

onUnmounted(() => {
  messageService.offMessageReceived(handleMessage)
})
```

#### 泄漏 3：订阅表无限增长

```js
// ❌ 每次进页面都订阅，但不取消
onMounted(() => {
  stompClient.subscribe('/topic/chat', handleMessage)
})

// ✅ 保存订阅 ID，销毁时取消
let subscriptionId = null

onMounted(() => {
  subscriptionId = stompClient.subscribe('/topic/chat', handleMessage)
})

onUnmounted(() => {
  if (subscriptionId) {
    stompClient.unsubscribe(subscriptionId)
    subscriptionId = null
  }
})
```

#### 泄漏 4：闭包持有大对象

```js
// ❌ 闭包引用了整个页面状态
const allMessages = ref([]) // 可能很大

stompClient.subscribe('/topic/chat', (message) => {
  // 这个回调闭包引用了 allMessages
  // 即使页面卸载，如果 StompClient 还活着，这个闭包就不会被回收
  allMessages.value.push(message)
})

// ✅ 销毁时解绑，让闭包可以被 GC
onUnmounted(() => {
  messageService.offMessageReceived(handleMessage)
})
```

#### 泄漏 5：EventEmitter 监听器堆积

```js
// ❌ 每次进页面都 on，但从不 off
connectionManager.on(EVENT_TYPES.CONNECTED, handleConnected)

// ✅ 一定要配对使用
onMounted(() => {
  connectionManager.on(EVENT_TYPES.CONNECTED, handleConnected)
})

onUnmounted(() => {
  connectionManager.off(EVENT_TYPES.CONNECTED, handleConnected)
})
```

### 6.2 排查工具

#### Chrome DevTools Memory 面板

1. 打开 DevTools → Memory
2. 先点"Collect garbage"
3. 点"Take heap snapshot"
4. 操作页面（进聊天页 → 退出 → 再进 → 再退出，重复 3-5 次）
5. 再拍一个快照
6. 对比两个快照，看 Detached DOM nodes 和保留大小是否持续增长

#### 关键信号

1. **Detached DOM tree**：组件已卸载，但 DOM 节点还留在内存里 → 通常是回调没解绑
2. **closure 数量持续增长**：通常是闭包泄漏
3. **WebSocket / SocketTask 实例数量 > 1**：连接没正确关闭

#### Chrome DevTools Performance Monitor

实时观察：

1. JS heap size：如果持续上涨不回落，就是泄漏
2. DOM nodes：如果持续增长，就是 DOM 泄漏
3. Event listeners：如果持续增长，就是监听器泄漏

### 6.3 推荐的防御性编码模式

```js
import { onUnmounted } from 'vue'

/**
 * 自动清理的 Composable。
 * 用途：把所有需要在组件卸载时清理的操作统一注册，避免遗漏。
 * 参数：无。
 * 返回值：{ onCleanup, registerTimer, registerSubscription, registerListener }
 */
export function useAutoCleanup() {
  const cleanupFns = []
  const timers = []
  const subscriptionIds = []
  let messageService = null

  function onCleanup(fn) {
    cleanupFns.push(fn)
  }

  function registerTimer(timerId) {
    timers.push(timerId)
  }

  function registerSubscription(subId) {
    subscriptionIds.push(subId)
  }

  function registerListener(service, event, handler) {
    messageService = service
    service.on(event, handler)
    cleanupFns.push(() => service.off(event, handler))
  }

  onUnmounted(() => {
    // 清定时器
    timers.forEach((id) => {
      clearInterval(id)
      clearTimeout(id)
    })

    // 取消订阅
    subscriptionIds.forEach((subId) => {
      messageService?.unsubscribe?.(subId)
    })

    // 执行自定义清理
    cleanupFns.forEach((fn) => {
      try { fn() } catch (e) {}
    })
  })

  return {
    onCleanup,
    registerTimer,
    registerSubscription,
    registerListener,
  }
}
```

使用方式：

```js
const { registerTimer, registerListener } = useAutoCleanup()

onMounted(() => {
  const timer = setInterval(heartbeat, 5000)
  registerTimer(timer)

  registerListener(messageService, EVENT_TYPES.MESSAGE_RECEIVED, handleMessage)
  registerListener(messageService, EVENT_TYPES.CONNECTED, handleConnected)
})

// 不需要再写 onUnmounted，自动清理
```

---

## 七、Vue / uni-app 组件频繁 mount/unmount 时的连接管理

### 7.1 问题：页面反复进出，连接反复建销

很多项目里，聊天页或通知页不是常驻页面，而是：

1. 进入页面 → 建连接 → 订阅
2. 退出页面 → 断连接 → 清理
3. 再次进入 → 再建 → 再订阅

这种模式在小程序里特别常见（页面栈有限，频繁销毁重建）。

问题在于：

1. 每次 `new WebSocket()` 都要重新握手
2. STOMP 的 CONNECT / SUBSCRIBE 也要重来
3. 用户体验差（每次进页面都要等连接）
4. 资源浪费（反复建连和断连）

### 7.2 核心原则：连接的生命周期应该跟着应用，而不是跟着页面

```txt
❌ 页面级连接生命周期：

  进聊天页 → connect → subscribe
  退聊天页 → disconnect → cleanup
  再进聊天页 → connect → subscribe  ← 又要等握手

✅ 应用级连接生命周期：

  登录后 → connect → subscribe
  进聊天页 → 只消费消息
  退聊天页 → 只解绑回调
  再进聊天页 → 只重新绑定回调  ← 瞬间恢复
  退出登录 → disconnect
```

### 7.3 推荐实现：连接在 App 级初始化

#### App.vue (Vue 3)

```js
import { onMounted, onUnmounted } from 'vue'
import messageService from '@/utils/websocket/adapter'
import { EVENT_TYPES } from '@/utils/websocket/config/constants'

onMounted(async () => {
  // 应用启动时初始化，不关某个页面的事
  await messageService.initialize()
})

onUnmounted(() => {
  // 应用销毁时才断开
  messageService.disconnect()
})
```

#### App.vue (uni-app)

```js
import { onLaunch, onExit } from '@dcloudio/uni-app'
import messageService from '@/utils/websocket/adapter'

onLaunch(async () => {
  await messageService.initialize()
})

onExit(() => {
  messageService.disconnect()
})
```

### 7.4 页面层只做"绑定回调"和"解绑回调"

```js
// 聊天页面
import { onMounted, onUnmounted } from 'vue'
import messageService from '@/utils/websocket/adapter'
import { EVENT_TYPES } from '@/utils/websocket/config/constants'

const handleMessage = (msg) => {
  // 更新页面 UI
  messages.value.push(msg)
}

const handleConnected = () => {
  connectionStatus.value = 'connected'
}

const handleDisconnected = () => {
  connectionStatus.value = 'disconnected'
}

onMounted(async () => {
  // 只绑定回调，不管连接
  messageService.onMessageReceived(handleMessage)
  messageService.on(EVENT_TYPES.CONNECTED, handleConnected)
  messageService.on(EVENT_TYPES.DISCONNECTED, handleDisconnected)

  // 如果还没连接，触发连接（幂等）
  if (!messageService.isConnected()) {
    await messageService.connect()
  }
})

onUnmounted(() => {
  // 只解绑回调，不断开连接
  messageService.offMessageReceived(handleMessage)
  messageService.off(EVENT_TYPES.CONNECTED, handleConnected)
  messageService.off(EVENT_TYPES.DISCONNECTED, handleDisconnected)
})
```

### 7.5 特殊场景：页面级连接

有些场景确实需要页面级连接，比如：

1. 某个监控页面只在特定时打开，不需要常驻
2. 管理端某个调试页面，只在打开时连
3. 用户明确表示"我不想后台保持连接"

这时候可以给 `ConnectionManager` 加一个 `scope` 概念：

```js
// 页面级连接
const pageScopeManager = new ConnectionManager({
  url: 'wss://api.example.com/ws/monitor',
  scope: 'page', // 标记为页面级
})

onMounted(async () => {
  await pageScopeManager.connect()
})

onUnmounted(() => {
  // 页面级连接在退出时断开
  pageScopeManager.disconnect()
})
```

### 7.6 小程序特殊处理

微信小程序有额外的限制：

1. 同时最多 5 个 WebSocket 连接
2. 小程序切后台后，WebSocket 可能被系统回收
3. `onHide` / `onShow` 需要做保活检查

```js
// App.vue
import { onHide, onShow } from '@dcloudio/uni-app'

onShow(() => {
  // 从后台回到前台，检查连接是否还活着
  if (messageService.isInitialized() && !messageService.isConnected()) {
    messageService.manualReconnect()
  }
})

onHide(() => {
  // 切后台时可以选择：
  // 1. 不断开，让心跳保活（推荐）
  // 2. 如果要省电，可以暂停出站心跳
  // 不要直接 disconnect，否则回前台又要等握手
})
```

### 7.7 Keep-Alive 组件的连接管理

如果用了 Vue 的 `<KeepAlive>`，组件不会触发 `onUnmounted`，而是 `onDeactivated`：

```js
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  // 组件被激活，重新绑定回调
  messageService.onMessageReceived(handleMessage)
})

onDeactivated(() => {
  // 组件被缓存，解绑回调但不影响连接
  messageService.offMessageReceived(handleMessage)
})
```

---

## 八、完整性能检查清单

当 WebSocket 项目出现性能问题时，按这个顺序排查：

### 连接层

- [ ] 是否只建了一条连接？（除非有拆分理由）
- [ ] 连接的生命周期是否跟着应用而不是页面？
- [ ] 小程序是否超过 5 条并发连接？
- [ ] `wss://` 是否配置了 `permessage-deflate`？

### 帧层

- [ ] 是否有高频大消息场景？（考虑 Protobuf / 分片）
- [ ] 文件传输是否用了应用层分片？
- [ ] base64 编码是否带来了不必要的膨胀？

### 消息层

- [ ] 是否每条消息都触发了 DOM 更新？（应该节流）
- [ ] 消息列表是否用了虚拟滚动？
- [ ] 行情类数据是否只保留最新值？
- [ ] 节流器的队列是否有上限保护？

### 内存层

- [ ] 所有 `setInterval` / `setTimeout` 是否在 `onUnmounted` 里清理了？
- [ ] 所有回调是否配对了注册和注销？
- [ ] 所有订阅是否在组件销毁时取消了？
- [ ] `EventEmitter` 监听器是否持续增长？
- [ ] Chrome DevTools 里是否有 Detached DOM nodes？
- [ ] JS heap size 是否在重复操作后持续上涨？

### 组件层

- [ ] 连接初始化放在 App 级还是页面级？
- [ ] 页面退出时是断开连接还是只解绑回调？
- [ ] `<KeepAlive>` 组件是否用了 `onActivated` / `onDeactivated`？
- [ ] 小程序 `onShow` 时是否做了保活检查？

---

## 九、核心要点总结

如果只记住 5 句话：

1. **默认一条连接**：除非频率差 > 10 倍或延迟差 > 4 倍，否则不拆
2. **压缩优先走协商**：服务端支持时优先用 `permessage-deflate`；应用层也可以用 Protobuf 或额外压缩换体积
3. **快速消息要节流**：缓冲 + 定时批量渲染，不要每条都碰 DOM
4. **定时器和回调必须配对清理**：用 `useAutoCleanup` 或手动 `onUnmounted`
5. **连接跟着应用走，不跟着页面走**：页面只绑定/解绑回调，不建/断连接

---

## 参考资料

1. [RFC 6455 - The WebSocket Protocol](https://datatracker.ietf.org/doc/rfc6455)
2. [MDN - WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
3. [MDN - Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
4. [protobuf.js](https://github.com/protobufjs/protobuf.js)
5. [pako - zlib port to JavaScript](https://github.com/nicedoc/pako)
6. [permessage-deflate RFC 7692](https://datatracker.ietf.org/doc/rfc7692)
7. [ws 库 - perMessageDeflate 配置](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback)
8. [uni-app WebSocket 文档](https://uniapp.dcloud.net.cn/api/request/websocket.html)
9. 本专题第 04 篇：连接管理与自动重连封装实战
10. 本专题第 06 篇：MessageServiceAdapter 与页面接入实战
