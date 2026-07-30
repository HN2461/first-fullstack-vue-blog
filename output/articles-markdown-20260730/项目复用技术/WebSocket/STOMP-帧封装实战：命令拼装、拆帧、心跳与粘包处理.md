---
title: "STOMP 帧封装实战：命令拼装、拆帧、心跳与粘包处理"
slug: "websocket-stomp-8044d9d1-revision-20260730"
summary: "这是 WebSocket 专题的第 2 篇，专门讲 STOMP 帧层应该怎么封，包括命令常量、帧拼装、CONNECT/SUBSCRIBE 帧构建、heart-beat 协商、单帧解析以及 WebSocket message 与 STOMP frame 边界不一致时的 remainder 处理。"
category: "WebSocket"
tags:
  - "uni-app"
  - "STOMP"
  - "WebSocket"
  - "协议封装"
  - "粘包处理"
  - "心跳"
status: "draft"
sortOrder: 80
cover: ""
originalId: "6a2d29208a2b1c68f2cac712"
originalSlug: "websocket-stomp-8044d9d1"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# STOMP 帧封装实战：命令拼装、拆帧、心跳与粘包处理

> 这是 `项目复用技术 / WebSocket` 专题的第 2 篇。  
> 这一篇只讲最底层的协议帧，不讲页面，不讲业务，不讲重连。  
> 目标只有一个：
>
> `把 STOMP frame 这一层封稳定。`
>
> 这一篇给的是“项目级可落地模板”。如果你要做完整通用的 STOMP 客户端，还需要继续补齐 `content-length`、二进制 body、ACK/NACK、transaction 和更严格的字节级解析。

## 一、为什么帧层值得单独成篇

如果你已经决定用 STOMP，那前端最先要做好的其实不是连接按钮，也不是消息列表，而是：

`怎么正确构帧、怎么正确拆帧。`

因为后面所有能力都依赖它：

1. 连接时发 `CONNECT`
2. 订阅时发 `SUBSCRIBE`
3. 心跳时发换行符
4. 收消息时拆 `MESSAGE`
5. 错误时识别 `ERROR`

如果这一层不稳，后面再好的重连和 UI 也会被拖垮。

## 二、STOMP frame 到底长什么样

标准的 STOMP frame 结构可以理解成：

```txt
COMMAND
header1:value1
header2:value2

body\x00
```

这里最关键的规则先抓 3 条：

1. 第一行是命令
2. header 和 body 中间有一个空行
3. 最后用 `\x00` 作为 frame 结束符

除此以外，心跳通常表现为一个单独的换行符：

```txt
\n
```

但如果要把这层讲严谨，还要额外记住 4 个规范细节：

1. `heart-beat` 不是单方面固定频率，而是客户端和服务端通过 header 协商。
2. STOMP 1.2 的 header 值需要处理 `\r`、`\n`、`:`、`\` 这类字符的转义。
3. 换行可能来自 `\n`，也可能来自 `\r\n`，解析时最好先统一。
4. 如果使用 `content-length` 或 body 里可能出现 `\x00`，就不能只靠 `split('\x00')` 解析，应该按字节长度读 body。

所以你在写解析器时，一定要同时处理：

1. 正常 frame
2. 单独心跳
3. 同一条 WebSocket message 里包含多个 STOMP frame
4. 当前 message 只承载了半个 STOMP frame，需要保留 `remainder`

## 三、为什么我建议先把协议常量抽出来

这一步虽然小，但非常关键。

### 推荐模板：`constants.js`

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

export const FRAME_DELIMITER = '\x00'
export const LINE_DELIMITER = '\n'
```

### 为什么值得先抽

因为你后面写 `StompFrame` 时，几乎所有方法都会依赖这些常量。  
如果不先抽出来，后面就会到处散着写：

1. `'\x00'`
2. `'\n'`
3. `'MESSAGE'`
4. `'CONNECTED'`

看起来问题不大，但维护很难统一。

## 四、构帧层应该怎么封

这一层的目标很简单：

`给定 command / headers / body，稳定产出一个标准 STOMP frame 字符串。`

### 推荐模板：`buildFrame`

```js
import {
  STOMP_COMMANDS,
  FRAME_DELIMITER,
  LINE_DELIMITER,
} from './constants.js'

export default class StompFrame {
  static normalizeLineBreaks(data = '') {
    return String(data).replace(/\r\n/g, LINE_DELIMITER).replace(/\r/g, LINE_DELIMITER)
  }

  static escapeHeaderText(value = '') {
    return String(value)
      .replace(/\\/g, '\\\\')
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/:/g, '\\c')
  }

  static unescapeHeaderText(value = '') {
    const escapeMap = {
      '\\r': '\r',
      '\\n': '\n',
      '\\c': ':',
      '\\\\': '\\',
    }

    return String(value).replace(/\\[rnc\\]/g, (token) => escapeMap[token] || token)
  }

  /**
   * 构建 STOMP 帧。
   * 用途：根据命令、头信息和消息体拼接成标准 STOMP 文本帧。
   * 参数：command 为 STOMP 命令；headers 为键值对；body 为帧体内容。
   * 返回值：完整的 STOMP 帧字符串。
   * 边界行为：会自动补空行和帧结束符 \x00；模板默认面向文本 body。
   */
  static buildFrame(command, headers = {}, body = '') {
    const shouldEscapeHeaders =
      command !== STOMP_COMMANDS.CONNECT && command !== STOMP_COMMANDS.CONNECTED
    let frame = command + LINE_DELIMITER

    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined && value !== null) {
        const headerKey = shouldEscapeHeaders ? this.escapeHeaderText(key) : String(key)
        const headerValue = shouldEscapeHeaders ? this.escapeHeaderText(value) : String(value)
        frame += `${headerKey}:${headerValue}${LINE_DELIMITER}`
      }
    }

    frame += LINE_DELIMITER

    if (body !== undefined && body !== null && body !== '') {
      frame += String(body)
    }

    frame += FRAME_DELIMITER
    return frame
  }
}
```

这段模板已经比“裸拼字符串”稳很多，但它仍然是文本场景模板。  
如果你的 body 可能携带二进制、可能包含 NULL 字符，或者服务端强依赖 `content-length`，就不要继续用简单字符串拆分，而应该改成按字节解析。

### 逐段解释

#### 为什么 header 要过滤 `undefined` / `null`

因为很多头字段是可选的。  
如果你直接把空值拼进去，最后就会出现脏 header。

#### 为什么一定要补一个空行

这不是样式问题，而是协议规则。  
没有这个空行，后面解析器无法准确分清 header 和 body。

#### 为什么 frame 末尾一定是 `\x00`

因为解析多个 frame 时，你就是靠它来判断：

`一句话到这里结束了`

## 五、为什么要单独写 CONNECT / SUBSCRIBE 这类 helper

理论上你可以每次都直接调：

```js
buildFrame('SUBSCRIBE', {...})
```

但真正可维护的做法，是把常用 command 都单独包一层 helper。

### 推荐模板：`buildConnectFrame`

```js
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
  heartbeat,
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
  if (heartbeat) {
    headers['heart-beat'] = heartbeat
  }

  return this.buildFrame(STOMP_COMMANDS.CONNECT, headers)
}
```

这里的 `access-key`、`login` 是常见项目里的认证约定，不是 STOMP 强制字段。  
真正通用的 STOMP 客户端应该把认证头做成可配置，而不是写死在 `buildConnectFrame` 里。

### 推荐模板：`buildSubscribeFrame`

```js
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
```

### 推荐模板：`buildHeartbeatFrame`

```js
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
```

### 这样做的真正价值

不是为了“代码更长”，而是为了让上层调用更清楚。

比如后面 `StompClient` 就不需要知道细节，只要说：

1. 我现在要 `CONNECT`
2. 我现在要 `SUBSCRIBE`
3. 我现在要发心跳

## 六、解析层为什么是整套里最容易出 bug 的地方

如果构帧是“输出”，那解析就是“输入”。  
输入层最大的麻烦在于：

`网络层并不保证你每次拿到的都是一条完整 frame`

### 常见情况有 3 种

1. 一次拿到一个完整 frame
2. 一次拿到多个 frame
3. 一次只拿到半个 frame

再加上心跳以后，还会多一个情况：

4. 心跳和正常 frame 粘在一起

所以解析器最重要的不是“会 split”，而是：

`会处理 remainder`

## 七、单帧解析应该怎么写

### 推荐模板：`parseFrame`

```js
/**
 * 解析单个 STOMP 帧。
 * 用途：把原始文本帧拆成 command、headers、body。
 * 参数：data 为原始帧字符串。
 * 返回值：解析后的帧对象，形如 { command, headers, body }。
 * 边界行为：纯换行会被识别为心跳帧；无效帧返回 null。
 */
static parseFrame(data) {
  if (!data || data === LINE_DELIMITER) {
    return {
      command: STOMP_COMMANDS.HEARTBEAT,
      headers: {},
      body: '',
    }
  }

  let frameData = this.normalizeLineBreaks(data)

  if (frameData.endsWith(FRAME_DELIMITER)) {
    frameData = frameData.substring(0, frameData.length - 1)
  }

  while (frameData.startsWith(LINE_DELIMITER)) {
    frameData = frameData.substring(1)
  }

  if (!frameData) {
    return {
      command: STOMP_COMMANDS.HEARTBEAT,
      headers: {},
      body: '',
    }
  }

  const lines = frameData.split(LINE_DELIMITER)
  const command = lines[0].trim()
  const headers = {}
  let bodyStartIndex = 1
  const shouldUnescapeHeaders =
    command !== STOMP_COMMANDS.CONNECT && command !== STOMP_COMMANDS.CONNECTED

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line === '') {
      bodyStartIndex = i + 1
      break
    }

    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const rawKey = line.substring(0, colonIndex)
      const rawValue = line.substring(colonIndex + 1)
      const key = shouldUnescapeHeaders ? this.unescapeHeaderText(rawKey) : rawKey
      const value = shouldUnescapeHeaders ? this.unescapeHeaderText(rawValue) : rawValue
      headers[key] = value
    }
  }

  const body = lines.slice(bodyStartIndex).join(LINE_DELIMITER)
  return { command, headers, body }
}
```

这里故意没有对 header key/value 做 `trim()`。  
STOMP header 的空格属于值的一部分，随手 trim 可能会把服务端真正传来的值改掉。

### 为什么这里要 `while (frameData.startsWith('\n'))`

因为心跳帧可能会粘在正常 frame 前面。  
如果你不先剥掉前导换行，后面第一行的 command 就会读错。

### 为什么 body 要用 `join('\n')`

因为 body 本身也可能包含换行。  
你不能简单只取某一行。

## 八、多帧解析为什么一定要保留 `remainder`

这是整个 `StompFrame` 最值得学的一点。

严格说，在浏览器和 uni-app 这种运行时里，`onMessage` 收到的是完整的 WebSocket message，不是 TCP 半包。  
这里保留 `remainder` 解决的是另一件事：

`一条 WebSocket message 和一条 STOMP frame 不一定 1:1 对齐。`

比如服务端可能一条 message 里放多个 STOMP frame，也可能因为应用层封装把一个 STOMP frame 分两条 message 发过来。  
所以解析器不能直接假设“收到一次消息，就等于收到一个完整 STOMP frame”。

### 推荐模板：`parseFramesWithRemainder`

```js
/**
 * 解析多个 STOMP 帧并保留未完成片段。
 * 用途：处理 WebSocket message 与 STOMP frame 边界不完全一致的情况。
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
    if (frame) {
      frames.push(frame)
    }
  }

  return { frames, remainder }
}
```

### 这段代码最重要的思路是什么

不是“split 一下”这么简单，而是：

1. 以 `\x00` 为结束符去拆
2. 最后一段可能是不完整的
3. 这最后一段不能丢
4. 要留到下一次 socket 收到新数据时继续拼
5. 如果项目启用了严格 `content-length`，这一层还要升级成按字节长度解析

这就是为什么返回值不是单纯一个 `frames` 数组，而是：

```js
{
  frames,
  remainder
}
```

## 九、这一层最容易踩的坑

1. 忘了处理心跳帧
2. 把 WebSocket message 当成 STOMP frame 边界
3. 直接 `split('\n')` 后把 body 切坏
4. 忘了剥 `\x00`
5. 丢弃了 `remainder`
6. header 里空值也强行拼进去
7. 上层直接手写 frame 字符串，不走统一 helper
8. 忽略 `heart-beat` 协商，只写死固定心跳频率
9. 忽略 header 转义和 `\r\n` 换行兼容
10. 在需要 `content-length` 的场景里继续用纯 `split('\x00')`

## 十、建议的接入顺序

如果你现在要自己从零搭这一层，我建议顺序是：

1. 先写协议常量
2. 再写 `buildFrame`
3. 再写 `buildConnectFrame` / `buildSubscribeFrame`
4. 再写 `parseFrame`
5. 最后写 `parseFramesWithRemainder`

不要一上来就写一堆 command helper 和业务判断，不然很容易把协议层写乱。

## 十一、最后浓缩成一句话

如果只留一句结论，我会写：

`STOMP 帧层最值得沉淀的，不是某个命令，而是“统一构帧 + 统一拆帧 + 心跳处理 + frame boundary remainder 机制”这四件事。`

只要这一层稳了，后面的客户端、重连和消息服务才有稳定基础。

## 参考资料

1. [STOMP 1.2 官方规范](https://stomp.github.io/stomp-specification-1.2.html)
2. [STOMP 官方站点](https://stomp.github.io/)
