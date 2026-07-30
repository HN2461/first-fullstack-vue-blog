---
title: "MessageServiceAdapter 与页面接入实战：统一入口、事件桥接与初始化时机"
slug: "websocket-messageserviceadapter-3203465d"
summary: "这是 WebSocket 专题的第 6 篇，专门讲为什么还需要 MessageServiceAdapter 这一层，以及如何把连接管理、消息服务、事件桥接、回调注册和页面层接入时机统一成一个稳定入口。"
category: "WebSocket"
tags:
  - "WebSocket"
  - "STOMP"
  - "Adapter"
  - "页面接入"
  - "实时消息"
  - "Vue"
status: "draft"
sortOrder: 110
cover: ""
originalId: "6a2d29208a2b1c68f2cac72c"
originalSlug: "websocket-messageserviceadapter-3203465d"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# MessageServiceAdapter 与页面接入实战：统一入口、事件桥接与初始化时机

> 这是 `项目复用技术 / WebSocket` 专题的第 6 篇。  
> 这一篇不再讲协议、也不再讲重连细节，而是讲最后真正让页面“好用”的这一层：
>
> `MessageServiceAdapter`

> 如果说前面几篇是在搭底座，那这一篇就是在讲：
>
> `怎么把底座变成页面层真正愿意用、也真正适合复用的统一入口。`

## 一、这一层为什么既适用于 uni-app，也适用于 PC Vue

Adapter 这一层本质上不是某个平台能力，而是：

`应用层的服务收口方式`

### 1. 在 uni-app 里怎么接

常见做法是挂到：

```js
uni.$messageService = messageServiceAdapter
```

### 2. 在 PC Vue 里怎么接

常见做法可以有 3 种：

1. `app.config.globalProperties.$messageService`
2. `provide/inject`
3. `Pinia store + service singleton`

### 3. 推荐的 Vue 3 挂载方式

```js
import { createApp } from 'vue'
import App from './App.vue'
import messageServiceAdapter from './utils/websocket/adapter'

const app = createApp(App)

app.config.globalProperties.$messageService = messageServiceAdapter
app.provide('messageService', messageServiceAdapter)

app.mount('#app')
```

### 4. 推荐的页面消费方式

```js
import { inject, onMounted } from 'vue'

const messageService = inject('messageService')

onMounted(async () => {
  await messageService.initialize()
  await messageService.connect()
})
```

所以你可以这样理解：

`MessageServiceAdapter 是跨端应用层概念，uni-app 和 PC Vue 只是挂载方式不同。`

## 二、为什么有了 ConnectionManager 和 MessageService，还要再加一层 Adapter

很多人做到前面几层时，可能会想：

1. 已经有 `StompClient`
2. 已经有 `ConnectionManager`
3. 已经有 `MessageService`

那为什么还要再包一层？

答案很简单：

因为页面层真正想要的不是这些底层对象，而是：

`一个稳定、统一、可复用的接入入口`

### 页面真正想做的事情通常只有这些

1. 初始化消息服务
2. 建立连接
3. 获取当前连接状态
4. 注册消息回调
5. 订阅私聊 / 群聊
6. 发送消息
7. 手动重连
8. 暂停自动重连

也就是说，页面层想要的是：

`一个像应用服务一样的对象`

而不是：

1. 先 new 一个 ConnectionManager
2. 再 new 一个 MessageService
3. 再自己把事件桥接起来

所以 Adapter 的价值不在于“多包一层”，而在于：

`把复杂底座变成页面可直接使用的统一接口`

## 三、Adapter 这一层到底该负责什么

这一层最适合负责这 6 件事：

1. 初始化内部服务
2. 对外统一 connect / disconnect / reconnect
3. 统一暴露连接状态
4. 桥接底层事件到页面层
5. 维护页面层注册的回调
6. 暴露发送消息和订阅能力

它不应该负责：

1. 真正去实现 STOMP 帧
2. 真正去实现重连策略
3. 真正去解析原始 frame

那些应该留在前面几层。

## 四、为什么适配器层最关键的是“接口统一”

如果没有 Adapter，页面层会很容易出现下面这些问题：

1. 页面 A 直接调 `ConnectionManager`
2. 页面 B 直接调 `MessageService`
3. 页面 C 又自己封了一层
4. 页面 D 通过全局变量拿服务

久而久之，整个项目没有一个统一入口。

### 所以 Adapter 层最重要的目标是：

`不管底下怎么变，页面层永远只面向同一套 API 编程`

比如：

1. `initialize()`
2. `connect()`
3. `disconnect()`
4. `reconnect()`
5. `getConnectionStatus()`
6. `onMessageReceived()`
7. `offMessageReceived()`
8. `sendTextMessage()`
9. `subscribePrivate()`
10. `subscribeGroup()`

## 五、推荐模板：MessageServiceAdapter 的骨架

```js
import ConnectionManager from './connection/ConnectionManager.js'
import MessageService from './message/MessageService.js'
import { CONNECTION_STATUS, EVENT_TYPES } from './config/constants.js'

class MessageServiceAdapter {
  constructor() {
    this.service = null
    this.connectionManager = null
    this.isInitialized = false
    this.eventListeners = new Map()
    this.connectionManagerEventHandlers = new Map()
    this.connectPromise = null
    this.messageReceivedCallbacks = []
    this.forceOfflineCallbacks = []
  }
}
```

### 这几个状态分别是干什么的

#### `service`

统一指向消息服务层实例。

#### `connectionManager`

统一指向连接管理层实例。

#### `isInitialized`

防止每次页面进来都重复初始化整套底层。

#### `connectPromise`

这个特别重要。  
它的作用是：

`防并发 connect`

也就是多个页面或多个时机同时触发 connect 时，不会并发建立多条连接。

#### `messageReceivedCallbacks`

保存页面层注册的消息回调，方便 service 重建后恢复。

## 六、为什么 `initialize()` 一定值得单独封

很多项目里初始化都写得比较随意，比如：

1. 页面一进来直接 `connect`
2. 如果对象没创建，再临时 new

这样用久了非常混乱。

### 更合理的思路是

先有一个明确的初始化入口：

```js
/**
 * 初始化消息服务
 * @returns {Promise<Object>} 初始化结果
 */
async initialize() {
  try {
    if (this.isInitialized && this.service && this.connectionManager) {
      return { success: true }
    }

    await this._initializeCustomService()
    this.isInitialized = true

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 这样做的意义是什么

它把“底层服务有没有准备好”这件事，变成了一个明确状态。  
后面所有 connect / subscribe / send 都可以先依赖这个前提。

## 七、为什么要做事件桥接，而不是让页面直接监听 ConnectionManager

这一点非常关键。

因为如果页面直接监听 `ConnectionManager`，那页面就和底层绑死了。  
后面一旦你改：

1. 连接实现方式
2. 事件来源
3. 状态组织方式

页面层就得跟着动。

### 所以适配器层要做一件事：

`把底层事件重新桥接成页面层统一事件`

### 推荐模板：事件桥接

```js
/**
 * 绑定连接管理器事件
 * 说明：Adapter 对外统一暴露事件，页面无需直接依赖 ConnectionManager。
 */
_bindConnectionManagerEvents() {
  if (!this.connectionManager) {
    return
  }

  this._unbindConnectionManagerEvents()

  [
    EVENT_TYPES.CONNECTING,
    EVENT_TYPES.CONNECTED,
    EVENT_TYPES.DISCONNECTED,
    EVENT_TYPES.RECONNECTING,
    EVENT_TYPES.ERROR,
    EVENT_TYPES.RECONNECT_LIMIT_REACHED,
  ].forEach((eventName) => {
    const handler = (payload) => {
      this.emit(eventName, payload)
    }

    this.connectionManagerEventHandlers.set(eventName, handler)
    this.connectionManager.on(eventName, handler)
  })
}
```

### 这段代码真正的意义是什么

不是把事件“转发一下”而已，而是建立一层隔离：

1. 底层事件怎么来，不重要
2. 页面层只认 Adapter 暴露出来的事件

这层隔离非常值钱。

## 八、为什么要有 `_restoreServiceCallbacks()`

这是一个很容易被忽略，但特别有价值的细节。

如果底层 service 被销毁重建了，比如：

1. 重新初始化
2. 切换用户
3. 销毁后重连

那么页面层之前注册的回调就会丢。

### 所以需要做回调恢复

```js
/**
 * 恢复消息相关回调到当前 service
 */
_restoreServiceCallbacks() {
  if (!this.service) {
    return
  }

  this.messageReceivedCallbacks.forEach((callback) => {
    if (this.service.onMessage) {
      this.service.onMessage(callback)
    }
  })

  this.forceOfflineCallbacks.forEach((callback) => {
    if (this.service.onForceOffline) {
      this.service.onForceOffline(callback)
    }
  })
}
```

### 这一步的价值

让页面层的“监听关系”不会因为底层服务重建而失效。

这是很多系统型项目里非常实用的一步。

## 九、为什么 `connect()` 也要做并发幂等

页面层很可能会在多个地方触发 connect，比如：

1. App 启动时
2. 页面 onShow 时
3. 用户手动点重连时
4. 登录完成后

如果你不做保护，很容易同一时刻发起多次连接。

### 推荐模板：connectPromise 幂等

```js
async connect(options = {}) {
  if (this.connectPromise) {
    return this.connectPromise
  }

  this.connectPromise = this._doConnect(options).finally(() => {
    this.connectPromise = null
  })

  return this.connectPromise
}
```

### 这个技巧非常值钱

因为它能保证：

同一时刻不管多少地方触发 connect，最终都只会跑一条真正的连接流程。

## 十、为什么 Adapter 层特别适合统一“发送消息”

页面最不应该做的事情之一，就是自己判断：

1. 连接好了没有
2. 应该调哪一种 send
3. 失败时要不要发错误事件

这些都更适合放在 Adapter 层。

### 推荐模板：发送文字消息

```js
/**
 * 发送文字消息。
 * @param {Object} params - 消息参数
 * @returns {Promise<Object>} 发送结果
 */
async sendTextMessage({ content, toUserID, toGroupID }) {
  try {
    const status = this.getConnectionStatus()
    if (status !== CONNECTION_STATUS.CONNECTED) {
      const error = new Error('未连接到服务器，请检查网络')
      this.emit(EVENT_TYPES.ERROR, {
        type: 'send',
        message: error.message,
        error,
      })
      return { success: false, error: error.message }
    }

    return await this.service.sendTextMessage({
      content,
      toUserID,
      toGroupID,
    })
  } catch (error) {
    this.emit(EVENT_TYPES.ERROR, {
      type: 'send',
      message: error.message || '消息发送失败',
      error,
    })

    return { success: false, error: error.message }
  }
}
```

### 为什么这一层适合做“连接状态校验”

因为页面层最想拿到的是：

1. 能不能发
2. 发失败怎么提示
3. 要不要顺手广播错误事件

这些都比底层 service 更贴近页面需求。

## 十一、页面层怎么接入最合适

如果前面几篇都已经搭好了，那页面层就应该尽量薄。

### 推荐页面使用方式

```js
let messageService = null

const initMessageService = async () => {
  messageService = uni.$messageService

  if (!messageService) {
    uni.showToast({
      title: '消息服务未初始化',
      icon: 'none',
    })
    return
  }

  await messageService.initialize()

  messageService.onMessageReceived(handleIncomingMessage)
  messageService.on(EVENT_TYPES.CONNECTED, handleConnected)
  messageService.on(EVENT_TYPES.DISCONNECTED, handleDisconnected)
}

const destroyMessageServiceBinding = () => {
  messageService?.offMessageReceived(handleIncomingMessage)
  messageService?.off(EVENT_TYPES.CONNECTED, handleConnected)
  messageService?.off(EVENT_TYPES.DISCONNECTED, handleDisconnected)
}
```

### 页面层真正应该关注的

就 3 类事情：

1. 初始化和销毁监听
2. 响应状态变化
3. 响应消息变化

页面层不应该关注：

1. STOMP 帧长什么样
2. 心跳怎么发
3. buffer 怎么拼
4. 重连次数怎么递增

## 十二、这一层最容易踩的坑

1. 页面直接依赖 `ConnectionManager`
2. 页面直接依赖 `MessageService`
3. 没有 Adapter，导致项目里接入方式不统一
4. service 重建后回调丢失
5. 并发 connect 导致多条连接
6. 页面层自己判断连接状态然后拼错误提示
7. 页面销毁时不解绑回调
8. Adapter 只做转发，不做状态桥接和统一入口

## 十三、建议的接入顺序

如果你现在要搭这一层，我建议顺序是：

1. 先写 `initialize`
2. 再写底层事件桥接
3. 再写 `connectPromise` 并发保护
4. 再写 `onMessageReceived / offMessageReceived`
5. 最后写发送消息、订阅和历史消息入口

## 十四、最后浓缩成一句话

如果只留一句结论，我会写：

`MessageServiceAdapter 这一层最值得沉淀的，不是“多包一层”，而是“把底层复杂性收口成页面统一入口”。`

## 参考资料

1. [uni.$emit / uni.$on 官方文档](https://uniapp.dcloud.net.cn/api/window/communication)
2. [uni.connectSocket 官方文档](https://uniapp.dcloud.net.cn/api/request/websocket.html)
