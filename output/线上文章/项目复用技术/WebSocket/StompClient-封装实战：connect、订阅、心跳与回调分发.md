---
title: "StompClient 封装实战：connect、订阅、心跳与回调分发"
slug: "websocket-stompclient-8bcbb8a6"
summary: "这是 WebSocket 专题的第 3 篇，专门讲 StompClient 这一层该怎么封，包括 socket 建立、CONNECT 握手、STOMP 帧缓冲、heart-beat 协商、订阅表、回调分发和基础生命周期管理。"
category: "WebSocket"
tags:
  - "uni-app"
  - "WebSocket"
  - "STOMP"
  - "客户端封装"
  - "心跳"
  - "订阅"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d29208a2b1c68f2cac718"
originalSlug: "websocket-stompclient-8bcbb8a6"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# StompClient 封装实战：connect、订阅、心跳与回调分发

> 这是 `项目复用技术 / WebSocket` 专题的第 3 篇。  
> 这一篇只讲 `StompClient` 这一层，不讲自动重连，也不讲消息列表。  
> 目标很明确：
>
> `把最底层的 socket + STOMP 握手 + 订阅 + 心跳 管好。`

## 一、为什么这一层不能和连接管理层混着写

很多人第一次做 WebSocket 封装时，会把下面这些事全堆在一个类里：

1. 建立 socket
2. 发送 CONNECT
3. 收消息
4. 自动重连
5. 订阅恢复
6. 页面事件广播

这样短期看方便，长期很难维护。

更稳的思路是分两层：

1. `StompClient`
   只负责底层通信和 STOMP 协议
2. `ConnectionManager`
   只负责状态机和重连策略

这篇就只讲第一层。

## 二、StompClient 这一层到底应该负责什么

这一层最适合统一下面这些事：

1. `uni.connectSocket`
2. `CONNECT` 握手
3. `CONNECTED / MESSAGE / ERROR` 基础分发
4. 维护订阅表
5. 心跳定时器
6. 连接超时控制
7. 暴露基础回调接口

它不应该负责：

1. 用户是否暂停重连
2. 重连达到 5 次怎么办
3. 页面上显示“连接异常，请点击重连”

那些应该交给连接管理层。

## 三、推荐模板：StompClient 的骨架

```js
import StompFrame from './StompFrame.js'
import { CONNECTION_STATUS } from './constants.js'

export default class StompClient {
  constructor(config = {}) {
    this.socket = null
    this.config = {
      url: config.url || 'ws://localhost:3000/ws',
      heartbeatOutgoing: config.heartbeatOutgoing ?? 10000,
      heartbeatIncoming: config.heartbeatIncoming ?? 10000,
      connectTimeout: config.connectTimeout || 10000,
      ...config,
    }

    this.status = CONNECTION_STATUS.DISCONNECTED
    this.sessionId = null
    this.userId = null
    this.subscriptions = new Map()
    this.outgoingHeartbeatTimer = null
    this.incomingHeartbeatTimer = null
    this.lastServerActivityAt = 0
    this.messageBuffer = ''
    this.connectTimer = null

    this.callbacks = {
      onConnect: null,
      onDisconnect: null,
      onError: null,
      onMessage: null,
    }
  }
}
```

## 四、建立连接时最该注意的 4 个点

### 1. `connect()` 最好返回 Promise

因为外层大概率会这样调用：

```js
await stompClient.connect(...)
```

这样连接成功、失败、超时都会更容易统一处理。

### 2. `onOpen` 不代表 STOMP 连接成功

这是一个特别容易误判的点。

`uni.connectSocket` 的 `onOpen` 只代表：

`底层 WebSocket 握手成功了`

但 STOMP 语义上的“真正连上”，还要等服务端回：

`CONNECTED`

所以这里要分成两层：

1. socket open
2. 收到 CONNECTED frame

### 3. 连接超时一定要有

如果你只等 `CONNECTED`，但是服务端一直没回，页面会卡在“连接中”。

所以一个基础的超时控制非常值得加：

```js
this.connectTimer = setTimeout(() => {
  if (this.status !== CONNECTION_STATUS.CONNECTED) {
    this.status = CONNECTION_STATUS.ERROR
    this.close()
    reject(new Error('连接超时'))
  }
}, this.config.connectTimeout)
```

### 4. connect 成功后要清理超时定时器

这一步很容易漏。  
漏了以后就会出现一种很诡异的 bug：

明明连接成功了，几秒后又被旧超时逻辑打成失败。

## 五、推荐模板：connect 方法

```js
/**
 * 建立 WebSocket 连接并发送 CONNECT 帧。
 * 用途：统一完成底层 socket 握手和 STOMP 握手。
 * 参数：headers 为连接所需头信息。
 * 返回值：Promise<Object>；成功时 resolve CONNECTED 帧。
 * 边界行为：连接超时、socket 连接失败或服务器返回 ERROR 帧时 reject。
 */
connect(headers) {
  return new Promise((resolve, reject) => {
    if (this.status === CONNECTION_STATUS.CONNECTED) {
      resolve()
      return
    }

    this.status = CONNECTION_STATUS.CONNECTING

    this.socket = uni.connectSocket({
      url: this.config.url,
      fail: reject,
    })

    this.socket.onOpen(() => {
      const connectFrame = StompFrame.buildConnectFrame({
        ...headers,
        heartbeat:
          headers.heartbeat ||
          `${this.config.heartbeatOutgoing},${this.config.heartbeatIncoming}`,
      })
      this.send(connectFrame)

      this.clearConnectTimer()
      this.connectTimer = setTimeout(() => {
        if (this.status !== CONNECTION_STATUS.CONNECTED) {
          this.status = CONNECTION_STATUS.ERROR
          this.close()
          reject(new Error('连接超时'))
        }
      }, this.config.connectTimeout)

      this.socket.onMessage((res) => {
        this.handleMessage(res.data, resolve, reject)
      })
    })

    this.socket.onClose(() => {
      this.handleDisconnect()
    })

    this.socket.onError((error) => {
      this.stopHeartbeat()
      this.clearConnectTimer()
      this.socket = null
      this.status = CONNECTION_STATUS.ERROR
      this.handleError(error)
      reject(error)
    })
  })
}
```

## 六、为什么要维护 `messageBuffer`

很多人会问：

“WebSocket 不是消息一条一条收吗，为什么还要缓冲区？”

更严谨地说，浏览器和 uni-app 的 `onMessage` 会给你一条完整 WebSocket message。  
但问题在于：

`一条 WebSocket message 不等于一条 STOMP frame。`

实际服务端可能这样发：

1. 一条 WebSocket message 里放多条 STOMP frame
2. 一条 WebSocket message 里只放半个 STOMP frame，下一条消息继续补完
3. 心跳和正常 frame 在应用层缓冲后一起到达

所以这里必须有：

```js
this.messageBuffer += text
```

后面再交给 `parseFramesWithRemainder()` 去拆。

## 七、推荐模板：handleMessage 方法

```js
/**
 * 处理底层 socket 消息。
 * 用途：统一走缓冲区、拆帧、分发不同 STOMP 命令。
 * 参数：data 为原始 socket 消息；resolve/reject 为 connect 阶段 Promise 回调。
 * 返回值：无。
 * 边界行为：纯心跳直接忽略；解析异常不让整个连接链路中断。
 */
handleMessage(data, resolve, reject) {
  let text = typeof data === 'string' ? data : String(data || '')
  if (!text) return

  this.lastServerActivityAt = Date.now()

  if (text.replace(/\r/g, '').replace(/\n/g, '') === '') {
    return
  }

  this.messageBuffer += text

  const { frames, remainder } = StompFrame.parseFramesWithRemainder(this.messageBuffer)
  this.messageBuffer = (remainder || '').replace(/^\n+/, '')

  frames.forEach((frame) => {
    if (!frame) return

    if (frame.command === 'CONNECTED') {
      this.handleConnected(frame, resolve)
    } else if (frame.command === 'MESSAGE') {
      this.handleMessageFrame(frame)
    } else if (frame.command === 'ERROR') {
      this.handleErrorFrame(frame, reject)
    }
  })
}
```

收到 `CONNECTED` 后，`handleConnected(frame)` 里要把服务端返回的 header 传给心跳层：

```js
this.startHeartbeat(frame.headers)
```

这样心跳间隔才会基于协商结果计算，而不是写死成客户端自己的固定值。

### 这里最值得学的，不是 `if/else`

而是这两行：

```js
const { frames, remainder } = StompFrame.parseFramesWithRemainder(this.messageBuffer)
this.messageBuffer = (remainder || '').replace(/^\n+/, '')
```

它们才是整个“多帧 + 半帧 + 心跳”场景的关键。

## 八、为什么订阅表要放在客户端层

如果你只负责“当前连上以后订阅”，那很简单。  
但如果你还想支持：

1. 重连恢复订阅
2. 取消订阅
3. 根据 subscriptionId 找回调

那订阅表一定要落在客户端层。

### 推荐结构

```js
this.subscriptions = new Map()
```

存的内容一般至少要有：

1. `subscriptionId`
2. `destination`
3. `callback`

### 推荐模板：subscribe

```js
/**
 * 订阅目标地址。
 * 用途：保存订阅信息并发送 SUBSCRIBE 帧。
 * 参数：destination 为订阅目标；callback 为消息回调；headers 为额外头信息。
 * 返回值：订阅 ID。
 * 边界行为：如果未传 id，会自动生成一个唯一订阅 ID。
 */
subscribe(destination, callback, headers = {}) {
  const subscriptionId =
    headers.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  this.subscriptions.set(subscriptionId, {
    destination,
    callback,
  })

  const subscribeFrame = StompFrame.buildSubscribeFrame({
    id: subscriptionId,
    destination,
    receipt: headers.receipt,
  })

  this.send(subscribeFrame)
  return subscriptionId
}
```

## 九、心跳层为什么也必须单独管理

心跳的意义不是“多发几条消息”，而是：

`在空闲时证明连接还活着`

但 STOMP 的心跳不是客户端单方面固定几秒发一次。  
更稳的做法是用客户端配置和服务端 `CONNECTED` 帧里的 `heart-beat` 一起协商：

1. 客户端要不要给服务端发心跳
2. 服务端会不会给客户端发心跳
3. 服务端长时间没有任何数据时，客户端什么时候判定连接失活

### 推荐模板：心跳相关

```js
startHeartbeat(headers = {}) {
  this.stopHeartbeat()

  const [serverCanSend, serverWantsReceive] = String(headers['heart-beat'] || '0,0')
    .split(',')
    .map((value) => Number(value || 0))

  const sendInterval =
    this.config.heartbeatOutgoing > 0 && serverWantsReceive > 0
      ? Math.max(this.config.heartbeatOutgoing, serverWantsReceive)
      : 0

  const receiveInterval =
    this.config.heartbeatIncoming > 0 && serverCanSend > 0
      ? Math.max(this.config.heartbeatIncoming, serverCanSend)
      : 0

  this.lastServerActivityAt = Date.now()

  if (sendInterval > 0) {
    this.outgoingHeartbeatTimer = setInterval(() => {
      if (this.status === CONNECTION_STATUS.CONNECTED) {
        this.send(StompFrame.buildHeartbeatFrame())
      }
    }, sendInterval)
  }

  if (receiveInterval > 0) {
    this.incomingHeartbeatTimer = setInterval(() => {
      const idleTime = Date.now() - this.lastServerActivityAt
      if (idleTime > receiveInterval * 2) {
        this.handleError(new Error('STOMP 心跳超时'))
        this.close()
      }
    }, receiveInterval)
  }
}

stopHeartbeat() {
  if (this.outgoingHeartbeatTimer) {
    clearInterval(this.outgoingHeartbeatTimer)
    this.outgoingHeartbeatTimer = null
  }

  if (this.incomingHeartbeatTimer) {
    clearInterval(this.incomingHeartbeatTimer)
    this.incomingHeartbeatTimer = null
  }
}
```

### 为什么一定要先 `stopHeartbeat()`

因为不清旧定时器，很容易重复启动多个心跳任务。  
这种 bug 平时不明显，但线上会慢慢放大。

同时，心跳检测要把“收到业务消息”也算作连接活跃。  
所以 `handleMessage()` 一开始就更新 `lastServerActivityAt`，不需要只等纯 `\n` 心跳。

## 十、这一层最容易踩的坑

1. 把 `onOpen` 当成最终连接成功
2. 不做连接超时
3. 不做消息缓冲区
4. 不维护订阅表
5. 把固定 `setInterval` 当成 STOMP 心跳协商
6. 只发出站心跳，不检测入站心跳超时
7. 心跳重复启动
8. socket 断开后不清状态
9. 直接在客户端层做重连策略

## 十一、建议的接入顺序

如果你现在就要自己写这一层，我建议：

1. 先写 constructor 状态
2. 再写 connect + onOpen + 超时
3. 再写 handleMessage + buffer
4. 再写 subscribe / unsubscribe
5. 最后写 heartbeat

## 十二、最后浓缩成一句话

如果只留一句结论，我会写：

`StompClient 这一层最值得沉淀的，不是“连上 socket”，而是“连接握手、消息缓冲、订阅表、心跳和基础回调分发”这五件事。`

## 参考资料

1. [STOMP 1.2 官方规范](https://stomp.github.io/stomp-specification-1.2.html)
2. [uni.connectSocket 官方文档](https://uniapp.dcloud.net.cn/api/request/websocket.html)
3. [MDN: WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
