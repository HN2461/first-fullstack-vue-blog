---
title: "STOMP 协议速查手册：帧结构、命令、心跳与调试清单"
slug: "websocket-stomp-abe9babf"
summary: "这是 WebSocket 专题的第 10 篇，一份面向 STOMP 协议的快速参考手册，用类比和最小记忆量把帧结构、核心命令、心跳协商、常见错误和调试清单讲清楚，适合长时间没碰 STOMP 后快速回忆。"
category: "WebSocket"
tags:
  - "STOMP"
  - "WebSocket"
  - "速查手册"
  - "协议规范"
  - "心跳"
  - "帧结构"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d29208a2b1c68f2cac746"
originalSlug: "websocket-stomp-abe9babf"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# STOMP 协议速查手册：帧结构、命令、心跳与调试清单

> 这是 `项目复用技术 / WebSocket` 专题的第 10 篇。
> 这一篇不是封装实战，而是一份**快速参考手册**。
> 目标只有一个：
>
> `长时间没碰 STOMP，翻这篇就能快速回忆起来。`
>
> 更详细的协议原理和封装实战请看：
>
> 1. 第 1 篇：WebSocket 与 STOMP 总览（分层设计、概念边界）
> 2. 第 2 篇：STOMP 帧封装实战（命令拼装、拆帧、心跳、粘包处理）
> 3. 第 3 篇：StompClient 封装实战（连接、订阅、心跳与回调分发）

## 一、一句话记住 STOMP

**STOMP = 在 WebSocket 上运行的"邮件协议"**

它定义了消息该怎么"包装"和"投递"。WebSocket 只管建一条"高速公路"，STOMP 定义的是"货车"的货物格式和行驶规则。

## 二、用邮局类比理解核心概念

| 类比 | STOMP 概念 |
|------|-----------|
| 邮局系统 | STOMP 协议 |
| 写信的格式 | 帧（Frame）结构 |
| 邮局员工 | 消息代理（Broker） |
| 邮寄地址 | destination |
| 收发信件 | SEND / SUBSCRIBE |
| 证明还活着 | 心跳（Heartbeat） |

## 三、帧（Frame）结构

### 3.1 一条 STOMP 帧长什么样

```txt
COMMAND
header1:value1
header2:value2

Body\x00
```

### 3.2 五个组成部分

| 部分 | 说明 | 能省吗 |
|------|------|--------|
| COMMAND | 要做什么事（发消息/订阅/连接） | 不能省 |
| Headers | 键值对形式的附加信息 | 可选 |
| 空行 | 分隔 headers 和 body | **不能省** |
| Body | 实际的消息内容 | 可选 |
| \x00 | 结束标记 | 不能省 |

### 3.3 记忆口诀

```
command 是大事，
headers 是信息，
空行别忘记，
body 是内容，
x00 要记牢。
```

## 四、核心命令速查

### 4.1 客户端发出的命令

#### CONNECT — 连接服务器

```txt
CONNECT
accept-version:1.2
host:localhost
login:username
passcode:password

\x00
```

#### SEND — 发送消息

```txt
SEND
destination:/topic/chat
content-type:text/plain

你好，大家好！
\x00
```

#### SUBSCRIBE — 订阅消息

```txt
SUBSCRIBE
id:sub-001
destination:/topic/notifications

\x00
```

#### UNSUBSCRIBE — 取消订阅

```txt
UNSUBSCRIBE
id:sub-001

\x00
```

#### DISCONNECT — 断开连接

```txt
DISCONNECT
receipt:77

\x00
```

#### ACK / NACK — 确认 / 拒绝消息

```txt
ACK
id:ack-001

\x00
```

> 这里按 STOMP 1.2 的写法展示，ACK / NACK 帧通常使用 `id` header。
> 如果你在旧项目里见到 `subscription` / `message-id` 的写法，多半是更老版本或服务端实现习惯，最好结合 broker 文档一起看。

### 4.2 服务端返回的命令

#### CONNECTED — 连接成功响应

```txt
CONNECTED
version:1.2
heart-beat:10000,10000
session:session-123

\x00
```

#### MESSAGE — 推送消息给订阅者

```txt
MESSAGE
subscription:sub-001
message-id:12345
destination:/topic/notifications

您有一条新通知\x00
```

#### RECEIPT — 收据确认

```txt
RECEIPT
receipt-id:77

\x00
```

#### ERROR — 错误消息

```txt
ERROR
message:Invalid destination

目的地址无效\x00
```

## 五、destination 类型速查

| 类型 | 格式 | 含义 |
|------|------|------|
| Topic（广播） | `/topic/notifications` | 常见 broker 约定下，所有订阅者都会收到 |
| Queue（点对点） | `/queue/order-confirm` | 常见 broker 约定下，通常只有一个消费者收到 |
| User（用户专属） | `/user/queue/private` | 常见 broker 约定下，当前用户的私有队列 |

## 六、心跳机制

### 6.1 心跳是什么

心跳就是"我还在"的信号。连接空闲时，双方需要定期互发心跳来证明自己仍然活跃。

### 6.2 心跳帧长什么样

心跳帧就是**一个单独的换行符**：

```txt
\n
```

没有 body，没有 \x00，没有 headers。

### 6.3 心跳协商

心跳不是客户端单方面写死频率，而是**客户端和服务端通过 header 协商**。

客户端 CONNECT 时声明：

```txt
heart-beat:10000,0
```

含义：我每 10000ms 能发一次心跳，我期望你每 0ms 发一次（即不要求你发）。

服务端 CONNECTED 时响应：

```txt
heart-beat:0,10000
```

含义：我不会主动发心跳，但我希望你每 10000ms 给我发一次。

### 6.4 心跳协商规则

```
客户端实际发送间隔 = max(客户端声明的发送间隔, 服务端期望的接收间隔)
客户端检测超时阈值 = max(客户端期望的接收间隔, 服务端声明的发送间隔) × 2
```

如果超过阈值仍未收到任何数据（包括业务消息和心跳），就判定连接失活。

### 6.5 注意

收到业务消息也算连接活跃，不需要只等纯 `\n` 心跳。

## 七、最容易出错的 3 个点

### 7.1 帧格式错误 — 少了空行

❌ **错误**：

```txt
SEND
destination:/topic/chat
Hello\x00
```

✅ **正确**：

```txt
SEND
destination:/topic/chat

Hello\x00
```

### 7.2 命令大小写错误

❌ **错误**：`send`、`subscribe`

✅ **正确**：`SEND`、`SUBSCRIBE`

STOMP 命令必须全部大写。

### 7.3 忘记结束符

❌ **错误**：没有 `\x00`，服务端不知道消息何时结束。

✅ **正确**：每条帧末尾必须有 `\x00`。

## 八、WebSocket 与 STOMP 的分层关系

```txt
┌─────────────────┐
│   应用层 (STOMP)  │ ← 定义消息格式、路由规则、命令语义
├─────────────────┤
│ 传输层 (WebSocket) │ ← 定义连接建立、数据传输、连接关闭
├─────────────────┤
│   网络层 (TCP)    │ ← 定义路由、可靠性保证
└─────────────────┘
```

**一句话**：WebSocket 建通道，STOMP 定格式。

## 九、调试检查清单

当 STOMP 出问题时，按这个顺序逐项检查：

1. ✅ WebSocket 连接是否成功建立？
2. ✅ 是否发送了正确的 CONNECT 帧？
3. ✅ 是否收到服务端的 CONNECTED 响应？
4. ✅ SUBSCRIBE 帧格式是否正确（id + destination）？
5. ✅ 心跳是否按协商频率规律发送？
6. ✅ 所有帧都有空行和 \x00 吗？
7. ✅ 所有命令都是大写吗？
8. ✅ destination 地址是否正确（topic / queue / user）？
9. ✅ 重连成功后是否恢复了之前的订阅？
10. ✅ 收到业务消息时是否更新了"最后活跃时间"？

## 十、前端使用模板

### 10.1 JavaScript + stomp.js

```js
// 1. 建立 WebSocket 连接
const socket = new WebSocket('ws://localhost:8080/ws')

// 2. 创建 STOMP 客户端
const stompClient = Stomp.over(socket)

// 3. 连接服务器
stompClient.connect({
  login: 'username',
  passcode: 'password'
}, (frame) => {
  console.log('连接成功:', frame)

  // 4. 订阅消息
  stompClient.subscribe('/topic/messages', (message) => {
    console.log('收到消息:', message.body)
    const data = JSON.parse(message.body)
    displayMessage(data)
  })

  // 5. 发送消息
  stompClient.send('/app/chat', {}, JSON.stringify({
    content: 'Hello World',
    sender: 'user123'
  }))
}, (error) => {
  console.error('连接失败:', error)
})

// 6. 断开连接
function disconnect() {
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log('已断开连接')
    })
  }
}

// 7. 错误处理
stompClient.onStompError = (frame) => {
  console.error('STOMP 错误:', frame.headers['message'])
}
```

### 10.2 uni-app + 原生封装

uni-app 中使用 `uni.connectSocket` 替代 `new WebSocket`，其余 STOMP 帧处理逻辑完全相同。详见第 3 篇和第 8 篇。

## 十一、什么时候用 STOMP

### 适合用

1. 实时聊天
2. 系统通知推送
3. 在线状态同步
4. 审批 / 任务提醒
5. 股票行情推送
6. 门卫 / 监控 / 实时告警

### 不适合用

1. 简单的请求响应（用 HTTP 就够）
2. 大体积二进制文件传输
3. 实时音视频流（用 WebRTC 更合适）

## 十二、核心要点总结

如果只记住 5 句话：

1. **STOMP 是协议**：定义消息格式的文本协议，跑在 WebSocket 之上
2. **帧结构固定**：COMMAND + Headers + 空行 + Body + \x00
3. **命令要大写**：SEND、SUBSCRIBE、CONNECT 等
4. **心跳要协商**：通过 `heart-beat` header 双向协商，不是写死频率
5. **destination 常见约定**：很多 broker 会约定 topic（广播）、queue（点对点）、user（用户专属），但具体语义仍要看服务端实现

## 参考资料

1. [STOMP 1.2 官方规范](https://stomp.github.io/stomp-specification-1.2.html)
2. [STOMP 官方站点](https://stomp.github.io/)
3. 本专题第 1 篇：WebSocket 与 STOMP 总览
4. 本专题第 2 篇：STOMP 帧封装实战
5. 本专题第 3 篇：StompClient 封装实战
