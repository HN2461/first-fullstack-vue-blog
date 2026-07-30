---
title: "WebSocket 零基础入门：它是什么、为什么用、浏览器与 uni-app 怎么写"
slug: "websocket-websocket-uni-app-8118619a"
summary: "这是给零基础读者准备的 WebSocket 前置知识文章，尽量站在协议无关的底层视角，从它是什么、握手怎么发生、和 HTTP/STOMP 的关系，到浏览器与 uni-app 的最小使用方式、心跳、重连、关闭码与换协议时的分析方法，帮助先补基础再看项目级封装。"
category: "WebSocket"
tags:
  - "WebSocket"
  - "uni-app"
  - "浏览器"
  - "STOMP"
  - "实时通信"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d29208a2b1c68f2cac704"
originalSlug: "websocket-websocket-uni-app-8118619a"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# WebSocket 零基础入门：它是什么、为什么用、浏览器与 uni-app 怎么写

> 这篇是 `项目复用技术 / WebSocket` 专题的 `00 前置篇`。  
> 如果主人直接看后面那几篇“封装实战”，大概率会看到一头雾水。  
> 因为后面的文章默认你已经知道这些最基础的事：
>
> 1. `WebSocket` 到底是什么
> 2. 它和 `HTTP`、`STOMP`、`WebService` 分别是什么关系
> 3. 浏览器里怎么连
> 4. `uni-app` 里怎么连
> 5. 为什么项目里总会提到心跳、重连、连接状态、订阅
>
> 所以这一篇不讲项目封装技巧，专门先给主人补“地基”。  
> 我这篇内容主要按 `RFC 6455`、`MDN`、`uni-app 官方文档` 来整理，目标就是：
>
> `让没学过 WebSocket 的人，也能先把基础概念快速建立起来。`
>
> 这一篇我会尽量站在 **“协议无关”** 的角度来讲。  
> 也就是说：
>
> - 不先绑定 `STOMP`
> - 不先绑定某家公司自己的私有协议
> - 不先绑定某个框架
>
> 先把 **WebSocket 本体这层底座** 讲清楚。  
> 这样主人后面不管看到的是：
>
> - `STOMP`
> - 纯 `JSON` 自定义协议
> - 某种事件命令协议
> - 其他压在 WebSocket 上面的规则
>
> 你都能先把它压回到同一套底层理解里。

## 一、先记住一句最重要的话

`WebSocket` 可以先把它理解成：

**客户端和服务端之间，建立一条持续保持的、可以双向发消息的通道。**

如果用最白话的话来比喻：

- 普通 `HTTP` 请求，像你每次都重新寄一封信
- `WebSocket` 更像你和对方通了一通电话

电话一旦接通：

- 你可以随时说话
- 对方也可以随时说话
- 不需要每次说一句话都重新拨号

这就是 `WebSocket` 最核心的感觉：

`先连上，再持续通信。`

---

## 二、它为什么会出现

很多主人第一次接触实时通信时，脑子里会有个问题：

`我平时不是已经有 HTTP 接口了吗？为什么还要学 WebSocket？`

答案很简单：

**因为有些场景，后端需要“主动推消息”给前端。**

比如：

1. 聊天消息
2. 系统通知
3. 在线人数变化
4. 审批状态实时刷新
5. 订单状态实时变化
6. 监控告警推送
7. 股票 / 行情 / 实时数据大屏

如果只用普通 `HTTP`，前端通常只能这样做：

1. 每隔几秒请求一次接口
2. 问后端“有没有新消息”
3. 如果没有，再过几秒继续问

这种方式就叫：

- 轮询
- 或者长轮询

它不是不能用，但有几个明显问题：

1. 很浪费请求次数
2. 消息不够实时
3. 前端和后端都更累
4. 一旦页面很多，服务器压力会越来越大

所以 `WebSocket` 的价值就在这里：

**连接建立好以后，后端可以主动把新消息推过来。**

---

## 三、先把几个容易混的词分开

这个地方特别重要。  
主人如果这些词混在一起，后面看项目里的封装一定会迷糊。

### 1. WebSocket 是什么

`WebSocket` 是一种通信协议，也对应浏览器里的一套 API。  
它用来做：

**浏览器 / App 和服务端之间的双向实时通信。**

### 2. HTTP 和它是什么关系

`WebSocket` 不是完全抛开 `HTTP` 起步的。  
它在建立连接时，通常先走一次 `HTTP Upgrade` 握手。

你可以先简单理解成：

1. 一开始还是用 HTTP 去敲门
2. 服务端同意后，切换成 WebSocket 通信
3. 后面这条连接就不再是普通请求响应那套模式了

很多资料里会提到：

- `101 Switching Protocols`

这个状态，主人知道它表示：

`服务端同意从 HTTP 切换到 WebSocket`

就够用了。

### 3. STOMP 是什么

这个和主人后面看项目封装关系最大。

`STOMP` 不是 `WebSocket` 本身。  
它是跑在 `WebSocket` 上面的一层**消息协议**。

可以这样理解：

- `WebSocket` 负责“把通道打通”
- `STOMP` 负责“规定消息要怎么说”

所以：

- `WebSocket` 像公路
- `STOMP` 像公路上行驶时约定的交通规则

后面项目里你会看到这些词：

- `CONNECT`
- `CONNECTED`
- `SUBSCRIBE`
- `MESSAGE`
- `DISCONNECT`

这些就已经不是纯 `WebSocket` 了，  
而是 **STOMP 这层协议** 的内容。

### 4. WebService 是什么

主人语音里提到的“web service”，很容易和 `WebSocket` 混掉。  
但它们不是一回事。

你可以先这样粗略区分：

- `WebSocket`
  - 偏“实时双向通信”
- `WebService`
  - 偏“服务接口调用”
  - 老资料里经常指 SOAP/WSDL 那一类服务

面试时如果别人问你 `WebSocket`，你不要回答成 `WebService`。

### 5. Socket.IO 是什么

还有一个常见混淆对象叫 `Socket.IO`。

它也不是原生 `WebSocket` 本身。  
它是一个库，帮你做了更多封装，比如：

1. 自动重连
2. 房间
3. 命名事件
4. 回退方案

所以主人以后看到项目里写的是：

- 原生 `WebSocket`
- `STOMP`
- `Socket.IO`

要知道这是三种不同层次的东西，不要混成一个概念。

### 6. 其实“上层协议”不止 STOMP

主人这里一定要建立一个很重要的认知：

`WebSocket` 像一条底层通道。  
通道打通以后，上面到底怎么组织消息，可以有很多种玩法。

常见上层规则大概有这些：

1. 纯 `JSON` 自定义协议
   - 最常见
   - 自己约定 `type`、`event`、`data`
2. `STOMP`
   - 有 `CONNECT`、`SUBSCRIBE`、`MESSAGE` 这些命令语义
3. `Socket.IO`
   - 库自己定义事件、房间、确认机制
4. 二进制协议
   - 比如自己约定 `protobuf` / `msgpack`
5. 其他消息协议跑在 WebSocket 上
   - 比如有些系统会把 `MQTT` 也放到 WebSocket 里跑

所以主人现在学的，不应该理解成：

`我只是为了 STOMP 才学 WebSocket。`

而应该理解成：

`我先把 WebSocket 这条底层管道学明白，再看它上面压的是哪一种规则。`

---

## 四、WebSocket 最基础的工作流程

主人先把这条主线背下来：

`创建连接 -> 握手成功 -> 连接打开 -> 收发消息 -> 连接关闭 -> 需要时重连`

展开来看，大概是这样：

1. 前端发起连接
2. 浏览器和服务端先完成握手
3. 连接成功后触发 `open`
4. 前端可以 `send`
5. 服务端也可以主动推消息给前端
6. 前端收到消息后触发 `message`
7. 连接异常时可能触发 `error`
8. 连接关闭时触发 `close`
9. 如果业务需要，就执行重连

主人现在只要先记住一句：

**WebSocket 不是“请求一次返回一次”，而是“连接建立后反复通信”。**

---

## 五、最基础的几个概念

### 1. 它到底怎么“连上”：先 HTTP 握手，再升级成 WebSocket

这个地方是最底层、也是最大众通用的一块知识。

`WebSocket` 建连接时，不是凭空突然冒出来的。  
它通常先借用一次 `HTTP` 来握手，然后再升级。

你可以先把它理解成：

1. 浏览器先发一个特殊的 HTTP 请求
2. 请求里会带上“我想升级成 WebSocket”的意思
3. 服务端如果同意，就返回 `101 Switching Protocols`
4. 从这一刻开始，双方切进 WebSocket 通道

主人不用死背所有请求头，但至少要认得这几个关键词：

- `Upgrade: websocket`
- `Connection: Upgrade`
- `Sec-WebSocket-Key`
- `Sec-WebSocket-Version`

如果上层还要协商某种协议，还会看到：

- `Sec-WebSocket-Protocol`

可以把它简单理解成：

`我不只是想连 WebSocket，我还想告诉你我上面准备讲哪套规则。`

一个非常简化的感觉图，大概像这样：

```http
GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Version: 13
Sec-WebSocket-Protocol: v12.stomp
```

服务端如果同意，会回一个升级成功的大意：

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Protocol: v12.stomp
```

主人只要记住 3 件事就够了：

1. WebSocket 起步时通常要先经过一次 HTTP Upgrade
2. 服务端不点头，就不会进入 `open`
3. 如果还有上层协议，也是在这个阶段或者连上后的首包里约定

### 2. WebSocket 本体到底负责什么，不负责什么

这个地方一旦想通，后面看任何封装都会顺很多。

`WebSocket` 本体主要负责这些事：

1. 建立一条持续连接
2. 让客户端和服务端双向发消息
3. 告诉你连接开了、关了、出错了
4. 允许传文本或二进制

但它**不负责**这些业务规则：

1. 你的消息字段该叫 `type` 还是 `event`
2. 要不要订阅频道
3. 心跳发什么内容
4. 要不要 ACK / 回执
5. 重连几次、间隔多久
6. 聊天消息、通知消息、告警消息怎么区分

也就是说：

- `WebSocket` 负责“通”
- 上层协议负责“怎么说”
- 你的业务系统负责“说什么”

### 3. 为什么它上面可以压不同协议

因为 `WebSocket` 只要求：

`我给你一条双向消息通道。`

至于你通道里装的是：

- 一条纯 JSON
- 一条 STOMP frame
- 一段二进制数据
- 一套你们公司自己约定的命令格式

它都不关心。

浏览器原生构造函数本身就体现了这个思路：

```js
const socket = new WebSocket('wss://example.com/ws', ['v12.stomp', 'chat.json.v1'])
```

第二个参数就是“我愿意接受哪些上层协议规则”的列表。  
服务端如果接受其中一个，后续就按那套规则说话。

如果你根本不传第二个参数，也完全没问题。  
这时通常就是：

- 只连 WebSocket
- 上层消息格式由你们自己约定

比如最朴素的自定义协议，经常就是这样：

```json
{
  "event": "chat.send",
  "requestId": "msg-001",
  "data": {
    "roomId": "1001",
    "content": "你好"
  }
}
```

所以主人以后看到别家公司不用 `STOMP`，不要慌。  
你先问自己一句：

`它底下是不是还是 WebSocket？`

如果答案是“是”，那你已经先懂了最底层那一层。

### 4. `ws://` 和 `wss://`

- `ws://`
  - 不加密
- `wss://`
  - 加密版
  - 类似 `https://` 对 `http://`

项目里一般这样记：

- 开发环境本地调试可能常见 `ws://`
- 线上环境通常应该用 `wss://`

如果页面本身是 `https://`，一般就不要再去连不安全的 `ws://`。  
这是很常见的线上限制点。

### 5. `readyState`

浏览器原生 `WebSocket` 有一个很基础的状态字段叫 `readyState`。  
它经常会在面试里被问到。

它有 4 个值：

1. `0`
   - `CONNECTING`
   - 连接中
2. `1`
   - `OPEN`
   - 已连接，可以发消息
3. `2`
   - `CLOSING`
   - 正在关闭
4. `3`
   - `CLOSED`
   - 已关闭

主人最少要记住：

`只有 OPEN 状态，发消息才最稳。`

### 6. `close(code, reason)` 里的关闭码是什么

WebSocket 不是只能“断开”，它还能带一点关闭语义。

比如浏览器里你会写：

```js
socket.close(1000, '页面离开，主动关闭连接')
```

这里的：

- `code`
  - 是关闭码
- `reason`
  - 是关闭原因说明

主人最常见、最值得先记的几个码：

1. `1000`
   - 正常关闭
   - 最常见
2. `1001`
   - 一端离开当前场景
   - 比如页面被关掉、服务端下线
3. `1006`
   - 异常断开
   - 经常出现在“连接断了，但不是正常挥手关掉”的情况

这里主人先记一个实战重点：

`1006` 常常是你在结果里看到的“异常断开”信号，  
它不是最适合当成你自己主动 close 时传出去的业务码。

### 7. 四个常见事件

原生浏览器里最常见的就是：

1. `open`
   - 连接成功
2. `message`
   - 收到消息
3. `error`
   - 出错了
4. `close`
   - 连接关闭

### 8. 文本消息和二进制消息

`WebSocket` 可以传：

1. 文本
2. 二进制

在前端项目里，最常见还是：

- JSON 字符串

比如服务端发来：

```json
{
  "type": "notice",
  "content": "你有一条新的审批消息"
}
```

前端收到后通常会：

```js
const data = JSON.parse(event.data)
```

---

## 六、浏览器里最小可用的写法

这一段主人一定要先看懂。  
因为这就是最原生、最基础的 WebSocket 用法。

```js
const socket = new WebSocket('ws://localhost:8080/ws')

socket.addEventListener('open', () => {
  console.log('连接成功')

  socket.send(JSON.stringify({
    type: 'ping',
    content: '你好，服务端'
  }))
})

socket.addEventListener('message', (event) => {
  console.log('收到消息：', event.data)
})

socket.addEventListener('error', (error) => {
  console.error('连接出错：', error)
})

socket.addEventListener('close', (event) => {
  console.log('连接关闭：', event.code, event.reason)
})
```

主人先只看懂这 4 件事：

1. `new WebSocket(url)`
   - 创建连接
2. `open`
   - 连上了
3. `message`
   - 收到服务端推送
4. `send`
   - 发消息给服务端

### 1. 为什么要在 `open` 里发消息

因为连接还没建立好时，不能乱发。

`MDN` 明确提到：

- 如果在 `CONNECTING` 状态调用 `send()`，会抛 `InvalidStateError`

所以主人以后看到项目代码里总会先判断：

```js
if (socket.readyState === WebSocket.OPEN) {
  socket.send(data)
}
```

这不是多余，是基础规则。

### 2. 最常见的页面级写法

如果这是 Vue 页面里的最基础示意，一般会这么放：

```js
let socket = null

function connectSocket() {
  socket = new WebSocket('ws://localhost:8080/ws')

  socket.addEventListener('open', () => {
    console.log('已连接')
  })

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    console.log('收到服务端数据', data)
  })
}

function sendMessage(payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('连接还没准备好')
    return
  }

  socket.send(JSON.stringify(payload))
}

function closeSocket() {
  if (!socket) return
  socket.close(1000, '页面离开，主动关闭连接')
  socket = null
}
```

主人现在要形成一个意识：

**WebSocket 的难点，不在“能不能写出来”，而在“怎么长期维护得稳”。**

所以后面项目里才会继续抽连接管理、心跳、重连、消息服务层。

---

## 七、uni-app 里最小可用的写法

在 `uni-app` 里，最常见的入口不是 `new WebSocket()`，  
而是官方提供的：

- `uni.connectSocket`

它会返回一个 `SocketTask`。  
你后续一般通过这个 `SocketTask` 去监听和发送。

```js
let socketTask = null

function connectSocket() {
  socketTask = uni.connectSocket({
    url: 'wss://example.com/ws',
    complete() {}
  })

  socketTask.onOpen(() => {
    console.log('uni-app 连接成功')

    socketTask.send({
      data: JSON.stringify({
        type: 'ping',
        content: '你好，服务端'
      })
    })
  })

  socketTask.onMessage((res) => {
    const data = JSON.parse(res.data)
    console.log('收到消息：', data)
  })

  socketTask.onError((error) => {
    console.error('连接异常：', error)
  })

  socketTask.onClose((res) => {
    console.log('连接关闭：', res)
  })
}

function sendMessage(payload) {
  if (!socketTask) {
    console.warn('socketTask 不存在')
    return
  }

  socketTask.send({
    data: JSON.stringify(payload)
  })
}

function closeSocket() {
  if (!socketTask) return

  socketTask.close({
    code: 1000,
    reason: '页面离开，主动关闭连接'
  })
  socketTask = null
}
```

### 1. 主人只要抓住这几个 API

- `uni.connectSocket`
  - 发起连接
- `socketTask.onOpen`
  - 连接成功
- `socketTask.onMessage`
  - 收消息
- `socketTask.send`
  - 发消息
- `socketTask.close`
  - 关闭连接

### 2. 为什么 `uni-app` 要单独学

因为它不是纯浏览器环境。  
它可能跑在：

1. H5
2. App
3. 微信小程序
4. 其他小程序平台

所以 `uni-app` 给你包了一层统一 API。  
它的价值不是“概念完全不同”，而是：

`同样的实时通信思路，可以尽量用一套写法兼容多个运行时。`

### 3. 主人看后面封装篇时应该怎么理解

后面项目里的复杂封装，很多其实都不是为了“让 WebSocket 能连”，  
而是为了把这些运行时差异收口。

比如统一：

1. 连接状态
2. 心跳策略
3. 重连策略
4. 订阅恢复
5. 页面层统一调用方式

---

## 八、浏览器和 uni-app 的对应关系

如果主人怕记混，可以先看这张最简单的对照表。

| 场景 | 浏览器原生 | uni-app |
| --- | --- | --- |
| 创建连接 | `new WebSocket(url)` | `uni.connectSocket({ url })` |
| 连接成功 | `open` / `onopen` | `socketTask.onOpen` |
| 收消息 | `message` / `onmessage` | `socketTask.onMessage` |
| 发消息 | `socket.send(data)` | `socketTask.send({ data })` |
| 关闭连接 | `socket.close()` | `socketTask.close()` |
| 运行环境 | 浏览器页面 | H5 / App / 小程序 |

主人只要记住：

**概念几乎一样，只是 API 形式不一样。**

---

## 九、为什么项目里总提“心跳”

很多人会疑惑：

`不是都已经连上了吗？为什么还要心跳？`

因为“已经连上”和“现在还活着”，不是一回事。

比如这些情况都可能发生：

1. 手机切后台
2. 网络突然断一下
3. 代理或网关把空闲连接掐掉
4. 服务端重启
5. 用户从 Wi-Fi 切到 4G

所以项目里常常要做“保活检测”。

这就是所谓的：

- 心跳
- keep alive

### 1. 心跳最白话的理解

你可以把它理解成：

`双方隔一段时间互相打个招呼，证明我还在线。`

比如：

```js
{
  type: 'ping'
}
```

服务端再回一个：

```js
{
  type: 'pong'
}
```

### 2. 浏览器原生 API 为什么常看到“业务心跳”

因为浏览器暴露给前端的原生 `WebSocket` API，  
并没有直接让你手写底层 `Ping/Pong` 控制帧接口。

所以前端项目里最常见的是：

1. 和后端约定普通消息格式做心跳
2. 或者在 `STOMP` 里做 `heart-beat` 协商

这也是为什么后面的项目封装里，主人会看到：

- 定时器
- 心跳间隔
- 超时检测
- 最后一次收到消息时间

这些都很正常。

---

## 十、为什么项目里总提“重连”

因为真实网络环境里，连接断掉是非常正常的。

主人一定要建立这个意识：

`长连接不是连上一次就永远不掉。`

所以项目里通常要处理：

1. 初次连接失败怎么办
2. 已连接后中途断开怎么办
3. 重连几次算上限
4. 是立刻重连，还是延迟重连
5. 重连成功后，之前的订阅要不要恢复

### 1. 为什么不能疯狂立刻重连

因为如果服务端刚好挂了，  
成百上千个客户端一起瞬间死循环重连，服务端压力会更大。

所以比较合理的做法一般是：

1. 先等一下
2. 再重连
3. 失败了再拉长等待时间

这就叫：

- 退避
- 指数退避

主人现在不需要先把算法背死，  
但要先知道：

`重连不是 while 死循环一直冲。`

---

## 十一、为什么项目里总提“订阅”

如果主人后面看的是 `WebSocket + STOMP` 项目，  
那你会特别常看到：

- 订阅
- 通道
- topic
- queue
- destination

这是因为很多项目不是“连上就自动收到所有消息”，  
而是：

1. 先建立 WebSocket 通道
2. 再按规则订阅你关心的消息地址

例如：

1. 订阅用户自己的通知
2. 订阅某个群聊房间
3. 订阅某个业务模块的状态广播

这时你就要记住一句：

`WebSocket 解决的是“通道问题”，STOMP 解决的是“消息组织问题”。`

所以后面项目里你看到：

- `CONNECT`
- `SUBSCRIBE`
- `MESSAGE`

不要慌。  
那不是 WebSocket 基础概念突然变难了，  
而是项目在 `WebSocket` 之上又加了一层 `STOMP` 协议。

### 1. 如果以后换成别的协议，也照这 7 个问题去拆

主人以后如果进了别的公司，看到的不是 `STOMP`，  
你也可以先别慌，直接拿这 7 个问题去拆：

1. 连接地址是什么
2. 鉴权放在握手、Cookie、URL，还是连上后的首包
3. 一条消息最外层长什么样
4. 是靠 `type` / `event` 区分，还是靠命令字区分
5. 有没有订阅 / 房间 / topic 这类概念
6. 心跳怎么做
7. 断线后要恢复哪些状态

你会发现：

- `STOMP` 只是这 7 个问题的一种答案
- 某公司自定义协议，也只是这 7 个问题的另一种答案

这就是为什么主人把 WebSocket 底层学好后，  
后面换协议也不会完全从零开始。

### 2. 最朴素的“非 STOMP”项目级协议，通常长什么样

很多公司实际用的，未必是标准 `STOMP`。  
它们可能就是自己约定一个很朴素的 JSON 信封。

比如客户端发：

```json
{
  "event": "chat.send",
  "requestId": "msg-001",
  "token": "登录态或会话标识",
  "data": {
    "roomId": "1001",
    "content": "你好"
  }
}
```

服务端推：

```json
{
  "event": "chat.message",
  "data": {
    "messageId": "m-100",
    "roomId": "1001",
    "fromUserId": "u-1",
    "content": "你好",
    "timestamp": 1767000000000
  }
}
```

你看，它完全不是 `STOMP`。  
但它依然还是：

1. 先建立 WebSocket 通道
2. 再按双方约定的消息格式收发
3. 需要时做心跳
4. 断开后做重连

所以主人真正要抓住的是：

`上层规则可以变，但底层 WebSocket 的连接生命周期不会变。`

---

## 十二、最基础的使用规则

主人后面无论是自己写，还是看项目封装，  
先拿这几条规则去对照，基本就不容易迷路。

### 1. 没连上之前不要发消息

最稳的时机是：

- 浏览器等 `open`
- uni-app 等 `onOpen`

### 2. 线上优先用 `wss://`

尤其页面本身是 `https://` 的时候，  
你更应该优先考虑 `wss://`。

### 3. 先确认“鉴权信息”到底放哪

这一点在项目里特别现实。

因为 WebSocket 不是普通 `axios` 请求。  
你不能用“我想塞什么 header 就塞什么”的思路去想它。

真实项目里常见的鉴权位置一般有这几种：

1. `Cookie`
2. URL 参数
3. 连上后的第一条业务消息
4. 上层协议的连接帧
   - 比如 `STOMP CONNECT` 头里带 token

所以主人以后看项目时，先问一句：

`这个系统把登录态放在什么时候、放在什么位置带过去？`

### 4. 不要每个组件都各自偷偷建连接

这是项目里非常常见的坑。

如果多个页面、多个组件都自己 `new WebSocket()`，  
很容易出现：

1. 重复连接
2. 重复收消息
3. 状态混乱
4. 难以统一关闭

所以真实项目里通常会收口成：

- 一个连接管理器
- 一个消息服务
- 一个统一入口

### 5. 页面离开、退出登录、账号切换时要考虑关闭连接

因为长连接不是“建完就不管”。  
不清理就可能出现：

1. 内存泄漏
2. 旧账号还在收消息
3. 重复回调

### 6. 区分“连接事件”和“业务消息”

比如：

- `open`
- `close`
- `error`

这些叫连接层事件。

而：

- 聊天消息
- 通知消息
- 审批消息

这些才叫业务消息。

这两类东西不要揉在一起处理。

### 7. 心跳、重连、订阅恢复通常都不是页面层直接写

页面层更适合做：

1. 发起连接
2. 监听状态
3. 监听业务消息
4. 更新页面

而不是页面里自己写一堆：

- `setInterval`
- `setTimeout`
- 重连次数
- 消息缓冲

这些就属于后面封装篇真正要解决的问题。

---

## 十三、最容易踩的坑

主人后面一看项目代码，如果发现这些情况，就知道哪里不稳了。

### 1. 一进入页面就发消息，但连接其实还没打开

结果就是：

- 浏览器报错
- 或者消息直接丢失

### 2. 把 WebSocket 当成普通接口去理解

比如总想：

- 调一次
- 返回一次

这是 `HTTP` 思维，不是长连接思维。

### 3. 不做断线重连

开发环境网络稳时你可能感觉不到，  
但一到真实用户环境就很容易掉线。

### 4. 重连太猛

如果马上无限次重连：

1. 前端日志会刷爆
2. 服务端压力变大
3. 用户体验也不好

### 5. 不做消息格式约定

如果前后端没有先约定：

1. 消息类型
2. 字段结构
3. 心跳格式
4. 错误码

那项目很快就会乱。

### 6. 不知道项目里到底是“纯 WebSocket”还是“WebSocket + STOMP”

这是最容易把人看懵的点。

主人以后只要看到这些，就基本能判断项目用了 STOMP：

1. `CONNECT`
2. `SUBSCRIBE`
3. `MESSAGE`
4. `destination`
5. `heart-beat`

### 7. 没搞清“底层 WebSocket”和“上层协议规则”的边界

比如把这些东西全混成一锅：

1. 握手升级
2. 登录鉴权
3. 订阅命令
4. 业务消息字段
5. 心跳机制

一旦混在一起，项目就很容易变成：

- 能跑
- 但谁都讲不清
- 换协议时完全不会迁移

主人只要守住一个思路就会轻松很多：

`先分底层连接，再分上层协议，最后分业务消息。`

---

## 十四、最常见的面试基础问法

下面这几题，主人以后很容易被问到。

### 1. 什么是 WebSocket

你可以这么回答：

`WebSocket 是一种在客户端和服务端之间建立持久双向通信通道的协议，适合聊天、通知、实时状态更新这类场景。`

### 2. WebSocket 和 HTTP 有什么区别

可以先答 4 点：

1. `HTTP` 通常是请求响应式
2. `WebSocket` 建立连接后可以双向通信
3. `WebSocket` 更适合实时推送
4. `WebSocket` 建立时通常先经过一次 HTTP Upgrade 握手

### 3. `ws://` 和 `wss://` 的区别

答：

- `wss://` 是加密版
- 类似 `https://`
- 线上通常优先用 `wss://`

### 4. WebSocket 为什么适合实时消息

答：

`因为连接建好后，服务端可以主动推消息给客户端，不需要前端频繁轮询接口。`

### 5. 为什么要做心跳

答：

`因为长连接可能会悄悄断开，心跳是为了检测连接是否还活着。`

### 6. 为什么要做重连

答：

`因为真实网络环境中断线很常见，掉线后如果不重连，实时能力就失效了。`

### 7. 为什么不能一断就疯狂重连

答：

`因为会给服务端造成压力，实际项目一般会做延迟重连或指数退避。`

### 8. WebSocket 和 STOMP 是什么关系

答：

`WebSocket 是底层通信通道，STOMP 是跑在 WebSocket 上的一层消息协议，用来规范 CONNECT、SUBSCRIBE、MESSAGE 这些行为。`

### 9. 浏览器里什么时候可以 `send`

答：

`通常要等 readyState 为 OPEN，也就是 open 事件触发之后再发。`

### 10. uni-app 和浏览器的差别是什么

答：

`核心思路一样，都是建立连接、监听消息、发送和关闭；只是浏览器常用原生 WebSocket，uni-app 常用 uni.connectSocket 和 SocketTask 来统一多端运行时。`

### 11. 如果公司不用 STOMP，用别的协议怎么办

答：

`先别盯着协议名，先看底下是不是 WebSocket；如果是，再去拆鉴权位置、消息信封、命令字/事件名、心跳、订阅和重连恢复。很多协议只是这几个问题的不同答案。`

---

## 十五、主人后面应该按什么顺序学

如果主人是为了看懂项目里的 WebSocket 封装，  
我建议按这个顺序来。

### 第一步：先把这一篇吃透

至少先把下面这些话能讲明白：

1. WebSocket 是长连接
2. 它支持双向通信
3. 适合实时推送
4. 它通常先经过一次 HTTP Upgrade 握手
5. 浏览器和 uni-app 的最基础 API 怎么写
6. 为什么会有心跳和重连
7. 为什么换协议时也能沿着同一套思路分析

### 第二步：再去看 STOMP 是怎么压在 WebSocket 上面的

这时你再看项目里的：

- `CONNECT`
- `SUBSCRIBE`
- `MESSAGE`
- `DISCONNECT`

就不会再一脸懵了。

### 第三步：最后再看项目里的封装分层

也就是后面专题里的：

1. 协议常量
2. 帧处理
3. 客户端层
4. 连接管理
5. 消息解析
6. 页面接入

这时你会突然发现：

`原来后面的复杂，不是凭空变复杂，而是在给真实项目补稳定性。`

### 第四步：以后看到别的协议，先别怕名字

你以后如果看到：

- 某公司自定义实时协议
- 某个事件总线式消息格式
- 某个二进制命令协议

也不要先被名字吓住。  
先回到这一篇里的底层问题：

1. 底下是不是 WebSocket
2. 登录态怎么带
3. 消息最外层怎么组织
4. 心跳和重连怎么做
5. 有没有订阅 / 房间 / 回执

只要这 5 个问题能拆清，主人就已经不是“从零开始”，  
而是在“套一套新的上层规则”。

---

## 十六、给主人一份最短记忆版

如果主人现在只想先背最核心的，先记这几句：

1. `WebSocket` 是一条持续保持的双向通信通道
2. 它适合聊天、通知、实时状态更新
3. 它建立连接时通常先经过一次 `HTTP Upgrade`
4. `WebSocket` 本体只管“通道”，不管你的业务字段和命令语义
5. 浏览器里常用 `new WebSocket(url)`
6. `uni-app` 里常用 `uni.connectSocket()`
7. 连上后才能发消息
8. 线上一般优先 `wss://`
9. 项目里常见心跳、重连、订阅恢复
10. `STOMP` 只是压在 `WebSocket` 上的一种上层协议
11. 换别的协议时，也先按“鉴权、消息格式、心跳、重连、订阅”去拆

---

## 参考资料

1. [RFC 6455 - The WebSocket Protocol](https://datatracker.ietf.org/doc/rfc6455)
2. [MDN - WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
3. [MDN - WebSocket: send()](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send)
4. [MDN - WebSocket: readyState](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState)
5. [MDN - Writing WebSocket client applications](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)
6. [uni-app 官方文档 - WebSocket](https://uniapp.dcloud.net.cn/api/request/websocket.html)
