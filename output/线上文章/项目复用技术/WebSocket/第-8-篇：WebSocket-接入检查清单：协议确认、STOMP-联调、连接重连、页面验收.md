---
title: "第 8 篇：WebSocket 接入检查清单：协议确认、STOMP 联调、连接重连、页面验收"
slug: "websocket-websocket-de1a1d83"
summary: "WebSocket 新项目接入检查清单，覆盖后端协议确认、目录搭建、STOMP 帧联调、连接重连、消息解析、页面接入和验收步骤。"
category: "WebSocket"
categoryPath:
  - "项目复用技术"
  - "WebSocket"
tags:
  - "WebSocket"
  - "STOMP"
  - "接入清单"
  - "联调"
  - "实时消息"
  - "Vue"
status: "published"
sortOrder: 80
cover: ""
originalId: "6a2d29208a2b1c68f2cac732"
originalSlug: "websocket-websocket-de1a1d83"
originalStatus: "published"
publishedAt: "2026-04-16T13:25:08.650Z"
updatedAt: "2026-07-31T11:16:25.047Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 8 篇：WebSocket 接入检查清单：协议确认、STOMP 联调、连接重连、页面验收

> 这是 `项目复用技术 / WebSocket` 专题的第 7 篇。  
> 前面 6 篇分别讲了总览、STOMP 帧、客户端、连接管理、消息解析与适配器。  
> 这一篇不再展开新概念，而是专门做一件事：
>
> `把 WebSocket / STOMP 接入过程整理成一份可以照着执行的清单。`

> 你以后换新项目时，可以不用重新想一遍：
>
> 1. 先问后端什么？
> 2. 先建哪些文件？
> 3. 先联调 CONNECT 还是先联调 MESSAGE？
> 4. 怎么判断心跳和 STOMP 帧边界有没有问题？
> 5. 页面接入后要验哪些边界？

## 一、先确认后端协议，不要一上来就写代码

在动代码前，先和后端确认下面这些内容。  
这一步不做清楚，前端后面很容易边写边返工。

### 1. 连接地址

你至少要确认：

1. WebSocket URL 是什么
2. 开发环境和生产环境是不是不同
3. 是 `ws://` 还是 `wss://`
4. 是否需要带 query 参数

建议记录成：

```txt
开发环境：ws://xxx/ws
测试环境：wss://test.xxx/ws
生产环境：wss://prod.xxx/ws
```

### 2. STOMP CONNECT 头

你要确认 `CONNECT` 帧里需要哪些 header。

常见字段：

1. `accept-version`
2. `host`
3. `login`
4. `access-key`
5. `client-type`
6. `user-agent`

建议整理成表：

| header | 是否必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| `accept-version` | 是 | `1.2` | STOMP 版本 |
| `host` | 是 | `localhost` | 服务端要求的 host |
| `login` | 是 | token | 登录凭证 |
| `access-key` | 视业务 | 学校 / 租户 ID | 多租户或多学校项目常见 |
| `client-type` | 否 | `2` | 客户端类型 |
| `user-agent` | 否 | `App/1.0(...)` | 客户端信息 |

这里还有一个很重要的提醒：

`这些 header 字段不是 STOMP 协议固定必然存在的业务字段。`

像：

1. `access-key`
2. `login`
3. `client-type`
4. `user-agent`

这些都属于你和后端协商出来的约定。  
下一个项目完全可能变成：

1. `Authorization`
2. `tenant-id`
3. `client`
4. `device-id`

所以前端应该把它们看成“连接头映射”，而不是固定真理。

### 3. 订阅地址规则

必须问清楚私聊、群聊、通知分别订阅哪里。

常见形式：

```txt
私聊：/user/{userId}
群聊：/topic/{groupId}
通知：/topic/notice/{tenantId}
```

不要前端自己猜。

### 4. 消息类型协议

至少要确认：

1. 文本消息类型是多少
2. 图片消息类型是多少
3. 文件消息类型是多少
4. 视频消息类型是多少
5. 语音消息类型是多少
6. 位置消息类型是多少

推荐统一成：

```js
export const MESSAGE_TYPES = {
  1: 'text',
  2: 'image',
  3: 'file',
  4: 'video',
  5: 'audio',
  6: 'location',
  text: 1,
  image: 2,
  file: 3,
  video: 4,
  audio: 5,
  location: 6,
}
```

### 5. 服务端推送样例

让后端至少给你 3 类样例：

1. 普通文本消息
2. 文件 / 图片消息
3. 系统通知或特殊消息

没有样例时，不要急着写解析器。

## 二、推荐目录结构

建议从一开始就按下面结构搭：

```txt
utils/
  websocket/
    config/
      constants.js
    stomp/
      StompFrame.js
      StompClient.js
    connection/
      ConnectionManager.js
    message/
      MessageParser.js
      MessageService.js
    storage/
      index.js
    adapter.js
```

如果你的项目是 PC Vue，也可以保持这一层结构不变，只把最底层 socket runtime 替换掉。

### 每个文件负责什么

| 文件 | 职责 |
| --- | --- |
| `constants.js` | 协议命令、状态、事件、消息类型 |
| `StompFrame.js` | 构帧、拆帧、心跳、frame boundary remainder |
| `StompClient.js` | connectSocket、CONNECT、订阅、心跳、回调 |
| `ConnectionManager.js` | 状态机、自动重连、手动重连、暂停重连 |
| `MessageParser.js` | 后端消息字段标准化 |
| `MessageService.js` | 发送消息、订阅消息、广播回调、历史消息 |
| `adapter.js` | 页面统一入口、事件桥接、并发 connect 保护 |

## 三、第一步：先联调 STOMP 帧，不要直接上页面

先用最小代码确认 `CONNECT` 帧拼出来是对的。

### 1. CONNECT 帧检查点

你应该能输出类似下面的内容：

```txt
CONNECT
accept-version:1.2
host:localhost
access-key:xxx
login:token

\x00
```

检查点：

1. 第一行是不是 `CONNECT`
2. header 是否一行一个
3. header 和 body 中间有没有空行
4. 最后有没有 `\x00`

### 2. SUBSCRIBE 帧检查点

```txt
SUBSCRIBE
id:sub-xxx
destination:/user/u001

\x00
```

检查点：

1. `id` 是否唯一
2. `destination` 是否和后端约定一致
3. 同一页面是否会重复订阅

## 四、第二步：只联调连接，不联调业务消息

先只做：

1. `uni.connectSocket`
2. socket `onOpen`
3. 发送 `CONNECT`
4. 收到 `CONNECTED`

不要一开始就调聊天页面。

### 1. 你应该能看到这些状态

```txt
disconnected -> connecting -> connected
```

如果一直停在 `connecting`，优先查：

1. WebSocket 地址是否正确
2. token 是否正确
3. CONNECT header 是否正确
4. 连接超时是否触发

### 2. 建议加连接超时

```js
/**
 * 设置连接超时。
 * 用途：避免 WebSocket 已打开但服务端一直不返回 CONNECTED，导致页面卡在连接中。
 * 参数：timeout 为毫秒数。
 * 返回值：定时器 ID。
 * 边界行为：连接成功后必须 clearTimeout。
 */
function createConnectTimeout(timeout, onTimeout) {
  return setTimeout(() => {
    onTimeout()
  }, timeout)
}
```

如果是 PC Vue，运行时层还要额外确认：

1. 浏览器环境是否允许该 WebSocket 地址
2. 是否有跨域 / 反向代理配置
3. 是否使用 `ws://` 还是 `wss://`

## 五、第三步：联调心跳和 STOMP 帧边界

不要等线上再发现这个问题。

### 1. 心跳检查

先确认 `CONNECT` / `CONNECTED` 里有没有 `heart-beat`，不要客户端单方面写死一个频率。  
如果服务端发来的是纯换行：

```txt
\n
```

你应该忽略它，不要当成业务消息处理。

### 2. 多帧检查

如果一次收到：

```txt
MESSAGE...\x00MESSAGE...\x00
```

你的 `parseFramesWithRemainder` 应该解析出两个 frame。  
这里更准确的说法不是“TCP 粘包”，而是：

`一条 WebSocket message 里包含了多个 STOMP frame。`

### 3. 半帧检查

如果第一次收到：

```txt
MESSAGE
destination:/user/u001

{"a":
```

第二次收到：

```txt
1}\x00
```

你的解析器不能丢第一段，而应该通过 `remainder` 保留。  
这说明你处理的是：

`WebSocket message 与 STOMP frame 边界不 1:1。`

## 六、第四步：再联调订阅

连接成功后再订阅。

### 1. 私聊订阅

```js
const privateSubId = stompClient.subscribe(`/user/${userId}`, (message, headers) => {
  console.log('收到私聊消息', message, headers)
})
```

### 2. 群聊订阅

```js
const groupSubId = stompClient.subscribe(`/topic/${groupId}`, (message, headers) => {
  console.log('收到群聊消息', message, headers)
})
```

### 3. 订阅恢复检查

断线重连后必须确认：

1. 原来的订阅还在 `subscriptions` 里
2. 重连成功后会重新发送 `SUBSCRIBE`
3. 重连后仍能收到原通道消息

## 七、第五步：再做连接管理和自动重连

不要一开始就写复杂重连。

### 推荐顺序

1. 先实现手动连接
2. 再实现断开后自动重连
3. 再实现指数退避
4. 再实现最大重连次数
5. 最后实现用户决策

### 重连测试用例

你至少要测：

1. 服务端关闭后，客户端进入 `reconnecting`
2. 服务端恢复后，客户端能回到 `connected`
3. 连续失败达到上限后，触发 `RECONNECT_LIMIT_REACHED`
4. 用户点“继续重连”后，计数重置
5. 用户点“本次不连”后，不再偷偷重连

## 八、第六步：消息解析器不要等页面写完再补

后端原始消息一定要先标准化，再给页面。

### 建议统一输出结构

```js
{
  messageId: 'm001',
  fromUserID: 'u001',
  fromUserName: '张三',
  toUserID: 'u002',
  toGroupID: '',
  type: 1,
  content: '你好',
  fileInfo: [],
  locationData: null,
  duration: 0,
  timestamp: 1710000000000,
  status: 'success'
}
```

页面层只应该消费这种结构。

### 文件类消息必须提前处理

文件消息常见结构太多：

1. JSON 字符串
2. 数组
3. 单对象
4. 直接 URL

不要让页面自己判断。

## 九、第七步：Adapter 最后接页面

页面层推荐只面对一个入口：

```js
const messageService = uni.$messageService
```

如果是 PC Vue，通常建议替换成：

```js
const messageService = inject('messageService')
// 或 app.config.globalProperties.$messageService
```

页面层只做：

1. 初始化
2. 连接
3. 订阅
4. 发送
5. 监听消息
6. 销毁监听

### 页面接入模板

```js
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { EVENT_TYPES } from '@/utils/websocket/config/constants'

let messageService = null

const handleMessageReceived = (message) => {
  console.log('收到消息', message)
}

const handleConnected = () => {
  console.log('连接成功')
}

const handleDisconnected = () => {
  console.log('连接断开')
}

onLoad(async () => {
  messageService = uni.$messageService

  if (!messageService) {
    uni.showToast({
      title: '消息服务未初始化',
      icon: 'none',
    })
    return
  }

  await messageService.initialize()
  await messageService.connect()

  messageService.onMessageReceived(handleMessageReceived)
  messageService.on(EVENT_TYPES.CONNECTED, handleConnected)
  messageService.on(EVENT_TYPES.DISCONNECTED, handleDisconnected)
})

onUnload(() => {
  messageService?.offMessageReceived(handleMessageReceived)
  messageService?.off(EVENT_TYPES.CONNECTED, handleConnected)
  messageService?.off(EVENT_TYPES.DISCONNECTED, handleDisconnected)
})
```

如果是 PC Vue，生命周期大致对应成：

```js
onMounted(async () => {
  await messageService.initialize()
  await messageService.connect()
})

onUnmounted(() => {
  messageService?.offMessageReceived(handleMessageReceived)
  messageService?.off(EVENT_TYPES.CONNECTED, handleConnected)
  messageService?.off(EVENT_TYPES.DISCONNECTED, handleDisconnected)
})
```

## 十、最终验收清单

### 协议层

1. CONNECT frame 拼接正确
2. SUBSCRIBE frame 拼接正确
3. 心跳帧能发送
4. 多 frame 边界错位能拆
5. 半 frame 能保留 remainder

### 客户端层

1. socket 能打开
2. CONNECTED 后才认为真正连接成功
3. 连接超时能触发失败
4. 心跳不会重复启动
5. 断开后能清理 socket 引用

### 连接管理层

1. 自动重连会触发
2. 重连间隔递增
3. 达到上限后停止自动重连
4. 手动重连会重置计数
5. 暂停重连后不会偷偷重连

### 消息层

1. 文本消息能解析
2. 文件消息能解析
3. 语音时长能解析
4. 位置消息能解析
5. 页面拿到的是标准消息对象

### 页面层

1. 页面只监听 Adapter，不直接碰 socket
2. 页面卸载时会解绑回调
3. 重连状态能显示
4. 收到消息能更新 UI

## 十一、最容易漏的上线前检查

1. 生产环境是否使用 `wss://`
2. token 过期后是否会停止无意义重连
3. 退出登录时是否会主动断开连接
4. 切换账号时是否会销毁旧连接
5. 后台切前台是否需要重新校验连接
6. WebSocket 地址是否走配置文件
7. 日志是否会泄露 token
8. 字段映射是否可以按项目切换，而不是写死在解析器里

## 十二、最后浓缩成一句话

如果只留一句总结，我会写：

`WebSocket 接入不要先写页面，先按“协议确认 -> 帧层 -> 客户端 -> 连接管理 -> 消息解析 -> 页面接入”这条链路一层层验收。`

这样后面无论是聊天、通知、在线状态还是实时提醒，都更容易复用。
