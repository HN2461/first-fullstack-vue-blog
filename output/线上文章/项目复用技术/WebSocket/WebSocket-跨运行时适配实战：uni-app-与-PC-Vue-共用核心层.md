---
title: "WebSocket 跨运行时适配实战：uni-app 与 PC Vue 共用核心层"
slug: "websocket-websocket-uni-app-pcvue-dc468cc2"
summary: "这是 WebSocket 专题的第 8 篇，专门讲核心层为什么可以跨端复用，以及如何把最底层 socket adapter 和服务挂载方式分别适配到 uni-app 与 PC Vue。"
category: "WebSocket"
tags:
  - "WebSocket"
  - "STOMP"
  - "uni-app"
  - "Vue"
  - "运行时适配"
  - "Adapter"
status: "draft"
sortOrder: 100
cover: ""
originalId: "6a2d29208a2b1c68f2cac736"
originalSlug: "websocket-websocket-uni-app-pcvue-dc468cc2"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# WebSocket 跨运行时适配实战：uni-app 与 PC Vue 共用核心层

> 这是 `项目复用技术 / WebSocket` 专题的第 8 篇。  
> 这一篇专门回答一个很关键的问题：
>
> `这套 WebSocket / STOMP 方案是不是只能用于 uni-app？`

答案是：

`不是。`

真正应该跨端复用的是核心层，运行时不同的只是最底层 socket 接口和全局挂载方式。

## 一、哪些层可以完全跨端复用

下面这些层，通常可以在 uni-app 和 PC Vue 之间共用绝大部分代码：

1. 协议常量层
2. STOMP frame 层
3. 连接管理层
4. 消息解析层
5. MessageService
6. MessageServiceAdapter

真正需要因运行时不同而替换的，通常只有两类：

1. `socket adapter`
2. `全局服务挂载方式`

## 二、最底层适配差异在哪里

### 1. uni-app 运行时

常见底层 API：

1. `uni.connectSocket`
2. `socket.onOpen`
3. `socket.onMessage`
4. `socket.send`
5. `socket.close`

### 2. PC Vue 运行时

常见底层 API：

1. `new WebSocket(url)`
2. `socket.onopen`
3. `socket.onmessage`
4. `socket.send`
5. `socket.close`

所以更好的抽象是：

`把 socket 本身再包成一个 runtime adapter`

## 三、推荐的 runtime adapter 形态

```js
export function createSocketAdapter(config = {}) {
  if (config.runtime === 'uni-app') {
    return createUniSocketAdapter(config)
  }

  return createBrowserSocketAdapter(config)
}
```

### 1. uni-app adapter

```js
export function createUniSocketAdapter(config = {}) {
  let socket = null

  return {
    connect() {
      socket = uni.connectSocket({ url: config.url })
      return socket
    },
    onOpen(callback) {
      socket?.onOpen(callback)
    },
    onMessage(callback) {
      socket?.onMessage((res) => callback(res.data))
    },
    onClose(callback) {
      socket?.onClose(callback)
    },
    onError(callback) {
      socket?.onError(callback)
    },
    send(data) {
      socket?.send({ data })
    },
    close() {
      socket?.close({})
    },
  }
}
```

### 2. browser adapter

```js
export function createBrowserSocketAdapter(config = {}) {
  let socket = null

  return {
    connect() {
      socket = new WebSocket(config.url)
      return socket
    },
    onOpen(callback) {
      socket.onopen = callback
    },
    onMessage(callback) {
      socket.onmessage = (event) => callback(event.data)
    },
    onClose(callback) {
      socket.onclose = callback
    },
    onError(callback) {
      socket.onerror = callback
    },
    send(data) {
      socket.send(data)
    },
    close() {
      socket.close()
    },
  }
}
```

## 四、服务挂载方式怎么区分

### 1. uni-app

```js
uni.$messageService = messageServiceAdapter
```

### 2. Vue 3

```js
const app = createApp(App)
app.config.globalProperties.$messageService = messageServiceAdapter
app.provide('messageService', messageServiceAdapter)
```

### 3. 页面消费层基本可以保持一致

uni-app：

```js
const messageService = uni.$messageService
```

Vue 3：

```js
const messageService = inject('messageService')
```

## 五、字段映射为什么也要跨项目可配置

真正影响跨项目复用的，不只是运行时，还有后端字段约定。

你这次项目可能是：

1. `recordID`
2. `sendContent`
3. `chatType`

下次项目完全可能变成：

1. `id`
2. `messageBody`
3. `messageType`

所以如果你想跨项目复用，除了 runtime adapter，还要保留：

`fieldMap adapter`

## 六、什么时候该抽成跨端核心包

如果你的项目里已经同时存在：

1. uni-app 端
2. PC Vue 管理端

那很适合把 WebSocket 核心层单独抽成一个包或独立目录，比如：

```txt
websocket-core/
  constants.js
  StompFrame.js
  ConnectionManager.js
  MessageParser.js
  MessageService.js
  MessageServiceAdapter.js

websocket-runtime/
  uniSocketAdapter.js
  browserSocketAdapter.js
```

## 七、最后浓缩成一句话

如果只留一句结论，我会写：

`WebSocket / STOMP 真正跨端复用的不是 socket API 本身，而是“核心层稳定 + 运行时适配层薄”这套结构。`

这样你下一个项目不管是 uni-app 还是 PC Vue，都不需要从零重搭整个体系。
