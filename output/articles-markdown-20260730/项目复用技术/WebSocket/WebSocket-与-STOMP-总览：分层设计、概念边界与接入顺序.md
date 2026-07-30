---
title: "WebSocket 与 STOMP 总览：分层设计、概念边界与接入顺序"
slug: "websocket-websocket-stomp-4e54084d-revision-20260730"
summary: "这是 WebSocket 专题的第 1 篇总览，系统梳理 WebSocket 与 STOMP 为什么容易写乱，以及如何把协议常量、帧构建、连接管理、自动重连、消息解析、订阅恢复和页面消费方式拆成一套可直接复用的方案；核心概念跨端通用，可用于 uni-app，也可用于 PC 端 Vue。"
category: "WebSocket"
tags:
  - "WebSocket"
  - "STOMP"
  - "自动重连"
  - "实时消息"
  - "工具封装"
  - "Vue"
status: "draft"
sortOrder: 70
cover: ""
originalId: "6a2d29208a2b1c68f2cac70a"
originalSlug: "websocket-websocket-stomp-4e54084d"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# WebSocket 与 STOMP 总览：分层设计、概念边界与接入顺序

> 这是 `项目复用技术 / WebSocket` 专题的第 1 篇。  
> 这一篇是总览，不是直接抠某个类去讲，而是先把整套 WebSocket / STOMP 架构搭清楚。  
> 后面的分篇会继续展开：
>
> 1. STOMP 帧与协议层
> 2. WebSocket 客户端层
> 3. 连接管理与自动重连
> 4. 消息解析与服务层
>
> 这一篇专门讲一套真正适合长期维护的实时通信结构：
>
> `协议常量 -> STOMP 帧处理 -> WebSocket 客户端 -> 连接管理 -> 消息解析 -> 页面层消费`

> 你以后只要项目里有这些场景，这篇都会反复用到：
>
> 1. 实时聊天
> 2. 系统通知推送
> 3. 在线状态同步
> 4. 审批 / 任务提醒
> 5. 门卫 / 监控 / 实时告警

> 这篇文章的目标很明确：
>
> `先把 WebSocket / STOMP 的跨端核心地图搭清楚，后面再分篇逐步照着实现`

## 一、先把问题讲透：为什么 WebSocket 功能特别容易写乱

很多人第一次做实时通信时，脑子里想的是：

1. 建一个 `connectSocket`
2. 收消息
3. 发消息
4. 断了就重连

看起来很简单，但真正放到项目里以后，很快就会多出一堆问题：

1. `WebSocket` 只负责传数据，业务协议怎么定义？
2. 为什么有些服务端要用 STOMP，而不是直接纯文本 JSON？
3. 消息收到的是一条一条的吗，还是可能粘在一起？
4. 心跳包怎么发？
5. 连接成功、断开、错误、重连中，这些状态谁来管？
6. 自动重连失败 5 次以后，是继续悄悄重连，还是交给用户决定？
7. 重连成功以后，之前订阅的话题要不要重新订阅？
8. 后端发来的字段名和页面想用的字段名不一致怎么办？
9. 页面层到底应该直接碰 WebSocket，还是只碰一个 messageService？

你会发现，真正让实时通信复杂的，不是 `connectSocket` 本身，而是：

`协议层 + 连接状态机 + 重连策略 + 消息标准化 + 页面消费方式`

## 二、先给结论：WebSocket / STOMP 最适合拆成 6 层

我建议至少拆成 6 层：

1. `协议常量层`
   只负责命令、状态、事件名、消息类型映射
2. `帧构建与解析层`
   只负责 STOMP frame 的构建、拆帧、帧边界处理
3. `底层客户端层`
   只负责具体运行时的 socket 生命周期和 STOMP 协议发送接收
4. `连接管理层`
   只负责状态流转、自动重连、退避策略、订阅恢复
5. `消息解析层`
   只负责把后端原始消息转换成前端统一消息对象
6. `页面消费层`
   只负责监听 service、更新 UI，不直接碰 WebSocket 细节

## 三、这一套是不是一定只能用于 uni-app

不是。  
这一点一定要先讲清楚。

WebSocket / STOMP 这套专题里，真正跨端通用的是：

1. 协议常量
2. 帧构建与拆帧
3. 连接状态机
4. 自动重连策略
5. 消息标准化
6. 服务层与适配器层

真正跟运行时绑定的，只有最底层的 socket adapter。

### 1. 在 uni-app 里通常怎么做

最底层常见是：

1. `uni.connectSocket`
2. `socket.onOpen`
3. `socket.onMessage`
4. `socket.send`
5. `socket.close`

### 2. 在 PC 端 Vue 里通常怎么做

最底层常见是：

1. 浏览器原生 `new WebSocket(url)`
2. `socket.onopen`
3. `socket.onmessage`
4. `socket.send`
5. `socket.close`

### 3. 所以应该怎么理解这套专题

你可以把它分成两部分：

1. `跨端核心层`
   STOMP frame、连接管理、重连、消息解析、服务层
2. `运行时适配层`
   uni-app / PC Vue / Electron 各自怎么接到底层 socket

也就是说：

`不是 WebSocket 专题属于 uni-app，而是 uni-app 只是这套专题的一个运行时适配目标。`

## 四、实际项目里最常见的一条使用主链路

虽然每个项目的页面不一样，但实际接入顺序通常很像：

1. 应用启动时初始化消息服务
2. 登录完成后发起连接
3. 连接成功后订阅用户私聊通道
4. 如果有群组，再批量订阅群组通道
5. 页面层只监听 Adapter 暴露出来的事件和消息
6. 应用从后台回到前台时做一次轻量保活检查

## 五、先讲协议边界：为什么这里要引入 STOMP

### 1. STOMP 本质上是什么

STOMP 官方规范把它叫：

`Simple Text Oriented Messaging Protocol`

它本质上是一个基于文本帧的消息协议。  
一条 STOMP frame 通常由下面几部分组成：

1. 命令
2. headers
3. 空行
4. body
5. 结束符 `\x00`

### 2. 为什么它比“直接发 JSON”更适合做标准化

因为它天然带了协议语义：

1. `CONNECT`
2. `CONNECTED`
3. `SUBSCRIBE`
4. `UNSUBSCRIBE`
5. `MESSAGE`
6. `RECEIPT`
7. `ERROR`
8. `DISCONNECT`

### 3. STOMP 最重要的几个细节

1. frame 以 NULL 字符结束
2. 心跳可以表现为换行符，但发送频率要通过 `heart-beat` 协商
3. 一条 WebSocket message 不一定等于一条 STOMP frame
4. 严格 STOMP 1.2 还要考虑 header 转义、`content-length` 和 `CRLF/LF` 换行兼容

这直接决定了你的客户端封装里必须考虑：

1. 如何拼 frame
2. 如何拆 frame
3. 如何处理 STOMP frame 和 WebSocket message 边界不一致
4. 如何忽略纯心跳
5. 如何判断服务端心跳超时

这组文章里的模板主要面向“文本 JSON body + 项目内约定认证头”的常见业务场景。  
如果你要沉淀完整通用 STOMP 客户端，就要继续补齐 ACK/NACK、transaction、`content-length` 字节级解析等能力。

## 六、第一层：协议常量为什么一定要集中管理

推荐把下面这些内容全部抽成常量：

```js
export const STOMP_COMMANDS = {
  CONNECT: 'CONNECT',
  CONNECTED: 'CONNECTED',
  SEND: 'SEND',
  SUBSCRIBE: 'SUBSCRIBE',
  UNSUBSCRIBE: 'UNSUBSCRIBE',
  MESSAGE: 'MESSAGE',
  RECEIPT: 'RECEIPT',
  ERROR: 'ERROR',
  DISCONNECT: 'DISCONNECT',
  HEARTBEAT: '\n',
}

export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
}

export const EVENT_TYPES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  MESSAGE_RECEIVED: 'message_received',
  RECONNECTING: 'reconnecting',
  RECONNECT_LIMIT_REACHED: 'reconnect_limit_reached',
}

export const FRAME_DELIMITER = '\x00'
export const LINE_DELIMITER = '\n'
```

这里最值钱的，不是少写几个字符串，而是把“协议、状态、类型映射、事件名”统一成全项目可复用的语言。

## 七、第二层：STOMP 帧为什么要单独封成一个类

### 推荐模板：`StompFrame.js`

```js
import {
  STOMP_COMMANDS,
  FRAME_DELIMITER,
  LINE_DELIMITER,
} from './constants.js'

export default class StompFrame {
  /**
   * 构建 STOMP 帧。
   * 用途：根据命令、头信息和消息体拼接成标准 STOMP 文本帧。
   * 参数：command 为 STOMP 命令；headers 为键值对；body 为帧体内容。
   * 返回值：完整的 STOMP 帧字符串。
   * 边界行为：会自动补空行和帧结束符 \x00。
   */
  static buildFrame(command, headers = {}, body = '') {
    let frame = command + LINE_DELIMITER

    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined && value !== null) {
        frame += `${key}:${value}${LINE_DELIMITER}`
      }
    }

    frame += LINE_DELIMITER

    if (body) {
      frame += body
    }

    frame += FRAME_DELIMITER
    return frame
  }

  /**
   * 构建 CONNECT 帧。
   * 用途：建立 STOMP 握手时发送客户端认证与协议信息。
   * 参数：accessKey、token、host、clientType、userAgent 等连接头。
   * 返回值：CONNECT 帧字符串。
   * 边界行为：clientType 和 userAgent 可选，不传时跳过。
   */
  static buildConnectFrame({
    accessKey,
    token,
    host = 'localhost',
    clientType,
    userAgent,
  }) {
    const headers = {
      'accept-version': '1.2',
      host,
      'access-key': accessKey,
      login: token,
    }

    if (clientType !== undefined && clientType !== null && clientType !== '') {
      headers['client-type'] = clientType
    }
    if (userAgent) {
      headers['user-agent'] = userAgent
    }

    return this.buildFrame(STOMP_COMMANDS.CONNECT, headers)
  }

  /**
   * 构建 SUBSCRIBE 帧。
   * 用途：订阅指定目标，后续接收服务端 MESSAGE 帧。
   * 参数：id 为订阅 ID；destination 为目标地址；receipt 为可选回执。
   * 返回值：SUBSCRIBE 帧字符串。
   * 边界行为：receipt 为空时不写入头信息。
   */
  static buildSubscribeFrame({ id, destination, receipt }) {
    const headers = { id, destination }
    if (receipt) headers.receipt = receipt
    return this.buildFrame(STOMP_COMMANDS.SUBSCRIBE, headers)
  }

  /**
   * 构建心跳帧。
   * 用途：向服务端声明当前连接仍然活跃。
   * 参数：无。
   * 返回值：换行符字符串。
   * 边界行为：STOMP 心跳帧本身没有 body 和结束符。
   */
  static buildHeartbeatFrame() {
    return LINE_DELIMITER
  }

  /**
   * 解析单个 STOMP 帧。
   * 用途：把原始文本帧拆成 command、headers、body。
   * 参数：data 为原始帧字符串。
   * 返回值：解析后的帧对象，形如 { command, headers, body }。
   * 边界行为：纯换行会被识别为心跳帧；无效帧返回 null。
   */
  static parseFrame(data) {
    if (!data || data === LINE_DELIMITER) {
      return { command: STOMP_COMMANDS.HEARTBEAT, headers: {}, body: '' }
    }

    let frameData = data
    if (frameData.endsWith(FRAME_DELIMITER)) {
      frameData = frameData.substring(0, frameData.length - 1)
    }

    while (frameData.startsWith(LINE_DELIMITER)) {
      frameData = frameData.substring(1)
    }

    if (!frameData) {
      return { command: STOMP_COMMANDS.HEARTBEAT, headers: {}, body: '' }
    }

    const lines = frameData.split(LINE_DELIMITER)
    const command = lines[0].trim()
    const headers = {}
    let bodyStartIndex = 1

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (line === '') {
        bodyStartIndex = i + 1
        break
      }
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        headers[key] = value
      }
    }

    const body = lines.slice(bodyStartIndex).join(LINE_DELIMITER)
    return { command, headers, body }
  }

  /**
   * 解析多个 STOMP 帧并保留未完成片段。
   * 用途：处理 WebSocket message 与 STOMP frame 边界不完全一致的情况，把完整帧解析出来，把半帧留到下一次继续拼接。
   * 参数：data 为当前缓冲区文本。
   * 返回值：{ frames, remainder }。
   * 边界行为：没有数据时返回空帧数组和空 remainder。
   */
  static parseFramesWithRemainder(data) {
    const frames = []
    if (!data) {
      return { frames, remainder: '' }
    }

    const parts = data.split(FRAME_DELIMITER)
    const remainder = parts[parts.length - 1] || ''

    for (let i = 0; i < parts.length - 1; i++) {
      const frameData = parts[i] + FRAME_DELIMITER
      const frame = this.parseFrame(frameData)
      if (frame) frames.push(frame)
    }

    return { frames, remainder }
  }
}
```

## 八、第三层：底层客户端负责“连上并会说 STOMP”

这一层最适合统一这些事：

1. `uni.connectSocket`
2. 发送 CONNECT frame
3. 处理 CONNECTED / MESSAGE / ERROR
4. 维护订阅列表
5. 发心跳

### 推荐模板：`StompClient.js`

```js
import StompFrame from './StompFrame.js'
import { CONNECTION_STATUS } from './constants.js'

export default class StompClient {
  constructor(config = {}) {
    this.socket = null
    this.config = {
      url: config.url || 'ws://localhost:3000/ws',
      heartbeatInterval: config.heartbeatInterval || 5000,
      connectTimeout: config.connectTimeout || 10000,
      ...config,
    }

    this.status = CONNECTION_STATUS.DISCONNECTED
    this.sessionId = null
    this.userId = null
    this.subscriptions = new Map()
    this.heartbeatTimer = null
    this.messageBuffer = ''
    this.connectTimer = null

    this.callbacks = {
      onConnect: null,
      onDisconnect: null,
      onError: null,
      onMessage: null,
    }
  }

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
        const connectFrame = StompFrame.buildConnectFrame(headers)
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

  handleMessage(data, resolve, reject) {
    let text = typeof data === 'string' ? data : String(data || '')
    if (text && text.replace(/\n/g, '') === '') {
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

  handleConnected(frame, resolve) {
    this.status = CONNECTION_STATUS.CONNECTED
    this.clearConnectTimer()
    this.sessionId = frame.headers.session
    this.userId = frame.headers['user-id']
    this.startHeartbeat()
    this.resubscribeAll()

    this.callbacks.onConnect?.(frame)
    resolve?.(frame)
  }

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

  resubscribeAll() {
    if (this.status !== CONNECTION_STATUS.CONNECTED) return
    if (!this.subscriptions.size) return

    for (const [subscriptionId, sub] of this.subscriptions.entries()) {
      if (!sub || !sub.destination) continue
      const subscribeFrame = StompFrame.buildSubscribeFrame({
        id: subscriptionId,
        destination: sub.destination,
      })
      this.send(subscribeFrame)
    }
  }

  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.status === CONNECTION_STATUS.CONNECTED) {
        this.send(StompFrame.buildHeartbeatFrame())
      }
    }, this.config.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  clearConnectTimer() {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer)
      this.connectTimer = null
    }
  }

  send(data) {
    if (!this.socket) return
    this.socket.send({ data })
  }

  close() {
    if (this.socket) {
      this.socket.close({})
      this.socket = null
    }
    this.status = CONNECTION_STATUS.DISCONNECTED
    this.sessionId = null
    this.userId = null
    this.messageBuffer = ''
    this.clearConnectTimer()
  }
}
```

## 九、第四层：连接管理层才是真正的“可复用核心”

这层最适合统一：

1. 连接参数
2. 状态流转
3. 指数退避重连
4. 达到上限后交给用户决定
5. 手动重连
6. 主动暂停重连

### 推荐模板：`ConnectionManager.js`

```js
import StompClient from './StompClient.js'
import { CONNECTION_STATUS, EVENT_TYPES } from './constants.js'

export default class ConnectionManager {
  constructor(config = {}) {
    this.stompClient = null
    this.config = {
      url: config.url || 'ws://localhost:3000/ws',
      heartbeatInterval: config.heartbeatInterval || 5000,
      reconnectDelay: config.reconnectDelay || 1000,
      maxReconnectDelay: config.maxReconnectDelay || 30000,
      connectTimeout: config.connectTimeout || 10000,
      maxAutoReconnectAttempts: config.maxAutoReconnectAttempts || 5,
      ...config,
    }

    this.connectionParams = {
      accessKey: null,
      token: null,
      userId: null,
      userData: null,
    }

    this.status = CONNECTION_STATUS.DISCONNECTED
    this.reconnectAttempt = 0
    this.reconnectTimer = null
    this.shouldReconnect = false
    this.reconnectPaused = false
    this.reconnectAwaitingDecision = false
    this.eventListeners = new Map()

    this.initStompClient()
  }

  initStompClient() {
    this.stompClient = new StompClient(this.config)

    this.stompClient.onConnect((frame) => this.handleConnected(frame))
    this.stompClient.onDisconnect(() => this.handleDisconnected())
    this.stompClient.onError((error) => this.handleError(error))
  }

  async connect(userId, userData, token, accessKey) {
    this.connectionParams = {
      accessKey,
      token,
      userId,
      userData,
    }

    this.shouldReconnect = true
    this.reconnectPaused = false
    this.reconnectAwaitingDecision = false
    this.reconnectAttempt = 0
    this.clearReconnectTimer()

    this.status = CONNECTION_STATUS.CONNECTING
    this.emit(EVENT_TYPES.CONNECTING)

    try {
      await this.stompClient.connect({
        accessKey,
        token,
        host: 'localhost',
      })
      return true
    } catch (error) {
      this.status = CONNECTION_STATUS.ERROR

      if (this.shouldReconnect) {
        this.scheduleReconnect()
      }

      throw error
    }
  }

  handleConnected(frame) {
    this.status = CONNECTION_STATUS.CONNECTED
    this.reconnectAttempt = 0
    this.reconnectPaused = false
    this.reconnectAwaitingDecision = false
    this.clearReconnectTimer()

    this.emit(EVENT_TYPES.CONNECTED, {
      sessionId: frame.headers.session,
      userId: frame.headers['user-id'],
    })
  }

  handleDisconnected() {
    this.status = CONNECTION_STATUS.DISCONNECTED
    this.emit(EVENT_TYPES.DISCONNECTED)

    if (this.shouldReconnect) {
      this.scheduleReconnect()
    }
  }

  handleError(error) {
    this.status = CONNECTION_STATUS.ERROR
    this.emit(EVENT_TYPES.ERROR, error)

    if (this.shouldReconnect) {
      this.scheduleReconnect()
    }
  }

  getReconnectDelay() {
    const delays = [1000, 2000, 4000, 8000, 16000, 30000]
    const index = Math.min(this.reconnectAttempt, delays.length - 1)
    return delays[index]
  }

  scheduleReconnect() {
    if (!this.shouldReconnect || this.reconnectPaused) return
    if (this.reconnectAwaitingDecision) return
    if (this.reconnectTimer) return

    if (this.reconnectAttempt >= this.config.maxAutoReconnectAttempts) {
      this.triggerReconnectLimitReached()
      return
    }

    const delay = this.getReconnectDelay()
    this.status = CONNECTION_STATUS.RECONNECTING
    this.emit(EVENT_TYPES.RECONNECTING, {
      attempt: this.reconnectAttempt + 1,
      delay,
      maxAttempts: this.config.maxAutoReconnectAttempts,
    })

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.reconnect()
    }, delay)
  }

  async reconnect() {
    if (!this.connectionParams.accessKey || !this.connectionParams.token || !this.connectionParams.userId) {
      throw new Error('缺少连接参数，无法重连')
    }

    this.reconnectAttempt += 1

    try {
      await this.stompClient.connect({
        accessKey: this.connectionParams.accessKey,
        token: this.connectionParams.token,
        host: 'localhost',
      })
      return true
    } catch (error) {
      if (this.shouldReconnect) {
        this.scheduleReconnect()
      }
      throw error
    }
  }

  async manualReconnect({ resetAttempts = true } = {}) {
    if (!this.connectionParams.accessKey || !this.connectionParams.token || !this.connectionParams.userId) {
      throw new Error('缺少连接参数，请重新登录后再试')
    }

    if (this.status === CONNECTION_STATUS.CONNECTED) {
      return true
    }

    this.clearReconnectTimer()
    this.shouldReconnect = true
    this.reconnectPaused = false
    this.reconnectAwaitingDecision = false

    if (resetAttempts) {
      this.reconnectAttempt = 0
    }

    this.status = CONNECTION_STATUS.CONNECTING
    this.emit(EVENT_TYPES.CONNECTING)

    try {
      await this.stompClient.connect({
        accessKey: this.connectionParams.accessKey,
        token: this.connectionParams.token,
        host: 'localhost',
      })
      return true
    } catch (error) {
      if (this.shouldReconnect) {
        this.scheduleReconnect()
      }
      throw error
    }
  }

  pauseReconnect() {
    this.shouldReconnect = false
    this.reconnectPaused = true
    this.reconnectAwaitingDecision = false
    this.clearReconnectTimer()

    if (!this.isConnected()) {
      this.status = CONNECTION_STATUS.DISCONNECTED
      this.emit(EVENT_TYPES.DISCONNECTED, { reason: 'paused' })
    }
  }

  triggerReconnectLimitReached() {
    this.clearReconnectTimer()
    this.shouldReconnect = false
    this.reconnectAwaitingDecision = true

    this.emit(EVENT_TYPES.RECONNECT_LIMIT_REACHED, {
      attempt: this.reconnectAttempt,
      maxAttempts: this.config.maxAutoReconnectAttempts,
      status: this.status,
    })
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  isConnected() {
    return this.status === CONNECTION_STATUS.CONNECTED
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  emit(event, data) {
    if (!this.eventListeners.has(event)) return
    this.eventListeners.get(event).forEach((callback) => {
      try {
        callback(data)
      } catch (error) {}
    })
  }
}
```

## 十、第五层：消息解析层为什么特别适合单独抽

后端原始消息通常不适合页面直接消费。  
这一层最适合做的，就是把它们统一成前端标准对象。

### 推荐模板：`MessageParser.js`

```js
export default class MessageParser {
  static parseIncomingMessage(rawMessage) {
    try {
      const messageId = rawMessage.messageId || rawMessage.recordID
      const content = rawMessage.content || rawMessage.sendContent
      const type = this.normalizeIncomingType(rawMessage)
      const timestamp =
        rawMessage.timestamp ||
        (rawMessage.sendTime ? new Date(rawMessage.sendTime).getTime() : Date.now())

      return {
        messageId,
        fromUserID: rawMessage.fromUserID,
        fromUserName: rawMessage.fromUserName || rawMessage.fromUserID || '对方',
        toUserID: rawMessage.toUserID,
        toGroupID: rawMessage.toGroupID,
        type,
        content,
        timestamp,
        status: 'success',
      }
    } catch (error) {
      return null
    }
  }

  static normalizeIncomingType(rawMessage = {}) {
    const parsedType = Number(rawMessage.type || rawMessage.chatType)
    if (parsedType >= 1 && parsedType <= 6) {
      return parsedType
    }
    return 1
  }
}
```

这一层最值钱的不是“解析 JSON”，而是：

`把后端不稳定字段收口成前端稳定字段`

## 十一、第六层：页面消费层为什么越薄越好

页面层最重要的原则只有一句：

`页面不要直接碰 socket 协议细节。`

页面更适合碰的是服务层能力，比如：

1. `connect`
2. `reconnect`
3. `getConnectionStatus`
4. `on(EVENT_TYPES.MESSAGE_RECEIVED, ...)`

## 十二、最容易踩的 15 个坑

1. 页面里直接写 `connectSocket`
2. 不做协议常量统一
3. 把 WebSocket message 当成 STOMP frame 边界
4. 不区分心跳和真正消息
5. 不按 `heart-beat` 协商心跳
6. 没有连接超时机制
7. 自动重连无限循环
8. 不做指数退避
9. 重连成功后没恢复订阅
10. 不保存连接参数
11. 后端字段直接透给页面
12. 文件消息和位置消息没有单独解析
13. 页面直接消费未标准化原始消息
14. 页面既监听全局回调又监听订阅回调但没统一入口
15. 连接状态没抽成统一事件

## 十三、建议的接入顺序

以后再做这类能力，我建议按下面顺序接：

1. 先定义协议常量
2. 再写帧处理层
3. 再写底层客户端
4. 再写连接管理层
5. 最后写消息解析层和页面接入层

## 十四、最后浓缩成一句话

如果只留一句总结，我会写：

`WebSocket / STOMP 真正值得沉淀的，不是“能连上”，而是“协议常量 + 帧处理 + 连接状态机 + 消息标准化 + 页面薄消费”这五层结构。`

## 参考资料

1. [STOMP 1.2 官方规范](https://stomp.github.io/stomp-specification-1.2.html)
2. [STOMP 官方站点](https://stomp.github.io/)
3. [uni.connectSocket 官方文档](https://uniapp.dcloud.net.cn/api/request/websocket.html)
4. [MDN: WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
5. [MDN: setInterval()](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
6. [MDN: setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
