---
title: "第 7 篇：AI 对话中的流式 Markdown：增量文本、未闭合语法、节流和取消"
slug: "markdown-it-ai-streaming-markdown-rendering"
summary: "处理 AI 分片输出中的半截 Markdown、未闭合代码围栏和公式，设计消息状态机、节流渲染、自动滚动、取消请求与完成后增强。"
category: "markdown-it"
categoryPath:
  - "项目复用技术"
  - "JS库"
  - "markdown-it"
tags:
  - "AI 对话"
  - "SSE"
  - "Markdown"
  - "markdown-it"
  - "流式响应"
status: "published"
sortOrder: 80
cover: ""
originalId: "6ad4b44801881c9ee2404eb7"
originalSlug: "markdown-it-ai-streaming-markdown-rendering"
originalStatus: "published"
publishedAt: "2026-10-18T11:57:59.988Z"
updatedAt: "2026-10-18T11:58:00.075Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 7 篇：AI 对话中的流式 Markdown：增量文本、未闭合语法、节流和取消

## 1. 流式内容不是一段完整字符串

普通文章通常一次读到完整正文；AI 回复则可能按网络分片到达：

```text
第 1 个分片：```js\nconst answer =
第 2 个分片： 42\nconsole.log(answer)
第 3 个分片：\n```
```

第一段到来时，代码围栏还没有结束。此时解析器只能面对不完整输入。Mermaid 图、数学公式、链接和列表也可能处于半完成状态。

## 2. 一个消息需要明确的生命周期

```js
{
  id: 'assistant-42',
  role: 'assistant',
  content: '正在到达的文本',
  status: 'streaming',
  error: null,
  createdAt: new Date().toISOString()
}
```

建议至少区分：

- `queued`：等待请求开始。
- `streaming`：正在接收片段。
- `complete`：服务端明确完成。
- `error`：服务端或网络失败。
- `cancelled`：用户主动停止。

不要只用一个 `loading` 布尔值。页面刷新、失败重试和用户停止时，单个布尔值无法表达答案是否完整、是否可以重试、部分内容是否要保留。

## 3. 解析器如何面对半截结构

markdown-it 能处理不完整文本，但部分元素的临时 HTML 会变化：

- 末尾一个 `*` 可能先显示为星号，下一片到来后变成斜体。
- 列表项可能暂时看起来是段落，后续补齐后才成为列表。
- 未闭合代码围栏可能吞掉后续内容。
- 半截链接可能先显示括号内容，再变成可点击链接。
- 半截公式或 Mermaid 可能在引擎完成时才可绘制。

这不是解析器出错，而是输入本来还没结束。产品要选择“即时但有轻微重排”还是“稳定但稍有延迟”的体验。

## 4. 方案 A：按固定时间窗口节流

网络分片可能非常频繁。可以把更新合并到每 30-80ms 一次：

```js
let scheduled = false
let pendingText = ''

function receiveDelta(delta) {
  pendingText += delta
  if (scheduled) return

  scheduled = true
  window.setTimeout(() => {
    message.value.content += pendingText
    pendingText = ''
    scheduled = false
  }, 50)
}
```

真实实现要处理结束事件：收到 `done` 或错误时立即 flush `pendingText`，清理 timer；组件卸载或用户停止时取消 timer。否则最后一个分片可能永远留在缓冲区。

50ms 是示例值，不是固定最佳答案。要根据帧率、设备性能和网络节奏测量。也可以用 `requestAnimationFrame` 合并到下一帧，但后台标签页会降低帧率，仍要确保完成事件强制刷新。

## 5. 方案 B：流式中只显示纯文本

最简单稳定的策略是：

- `streaming` 时使用转义后的纯文本或轻量 Markdown。
- `complete` 后再执行完整 Markdown、代码高亮、Mermaid 和数学公式。

优点是不会对每个分片重复运行高亮和图表引擎；缺点是用户在等待时看不到最终排版。很多聊天产品采用混合方式：段落、标题和基础列表即时解析，重型增强在完成后执行。

## 6. 方案 C：只替换当前回复

每次收到分片只更新当前 assistant 消息，不重建所有会话和历史回复：

```js
function appendAssistantDelta(messages, messageId, delta) {
  const index = messages.findIndex((item) => item.id === messageId)
  if (index < 0) return messages

  const next = [...messages]
  next[index] = {
    ...next[index],
    content: next[index].content + delta
  }
  return next
}
```

若消息很多，使用 `Map`、专门的消息 store 或子组件隔离都可以；重点是让更新影响最小范围，并用性能工具测量，而不是先做复杂状态架构。

## 7. SSE 数据不一定等于一个文本分片

浏览器 `ReadableStream` 的网络 chunk 可能在任意字节位置切开，一个 SSE 事件也可能跨多个 chunk。正确读取过程通常需要 `TextDecoder` 的流式模式，并用 `\n\n` 解析事件边界。不能假设一次 `reader.read()` 就是一个完整 JSON 对象或一条模型 token。

后端应该定义清晰事件格式，例如：

```text
event: delta
data: {"text":"你好"}

event: done
data: {"messageId":"m-42"}

```

前端要处理 `delta`、`done`、`error`、心跳、连接断开和 JSON 解析错误。具体响应协议优先复用模型供应商 SDK 或项目约定，不要在每个页面各自解析一套。

下面的解析器把任意文本片段缓存在一起，只在读到空行时派发完整事件。它支持 LF、CRLF 和 CR 换行，也会忽略以冒号开头的心跳注释：

```js
export function createSseParser(onEvent) {
  let buffer = ''

  function dispatch(block) {
    let event = 'message'
    const data = []

    for (const line of block.split(/\r\n|\r|\n/)) {
      if (!line || line.startsWith(':')) continue

      const colon = line.indexOf(':')
      const field = colon < 0 ? line : line.slice(0, colon)
      let value = colon < 0 ? '' : line.slice(colon + 1)
      if (value.startsWith(' ')) value = value.slice(1)

      if (field === 'event') event = value
      if (field === 'data') data.push(value)
    }

    if (data.length > 0) onEvent({ event, data: data.join('\n') })
  }

  return {
    push(text) {
      buffer += text

      let boundary
      while ((boundary = buffer.search(/\r\n\r\n|\n\n|\r\r/)) >= 0) {
        const separator = buffer.match(/\r\n\r\n|\n\n|\r\r/)[0]
        dispatch(buffer.slice(0, boundary))
        buffer = buffer.slice(boundary + separator.length)
      }
    },
    finish() {
      if (buffer.trim()) dispatch(buffer)
      buffer = ''
    }
  }
}
```

这里把 SSE `data:` 的多行内容按规范用换行拼接。收到事件后再按事件类型解析 JSON：

```js
const parser = createSseParser(({ event, data }) => {
  if (event === 'delta') {
    const payload = JSON.parse(data)
    receiveDelta(payload.text)
  } else if (event === 'done') {
    finishAssistantMessage(JSON.parse(data))
  } else if (event === 'error') {
    failAssistantMessage(JSON.parse(data))
  }
})

const decoder = new TextDecoder()
const reader = response.body.getReader()

try {
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    parser.push(decoder.decode(value, { stream: true }))
  }
  parser.push(decoder.decode())
  parser.finish()
} finally {
  reader.releaseLock()
}
```

`TextDecoder` 会暂存被拆开的多字节字符；循环结束后再调用一次无参数 `decode()`，把内部剩余字节刷新出来。`response.body` 可能为空，创建 reader 前要检查；请求还要检查 `response.ok`、`Content-Type`，并把 `AbortController.signal` 传给 `fetch`。生产代码还要捕获 JSON 格式错误、网络断开和 `AbortError`，并保证只有收到协议定义的 `done` 才将消息标记为完整。若服务端在 EOF 前没有发送空行，`finish()` 会尽力处理缓冲区里的尾事件，但这不能取代服务端正确发送结束事件。

一个最小请求骨架如下。它说明了 POST 请求如何携带问题、如何取消；鉴权头和请求字段仍应按项目 API 约定补充：

```js
const controller = new AbortController()
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ conversationId, message: question }),
  signal: controller.signal
})

if (!response.ok) {
  throw new Error(`AI 请求失败：HTTP ${response.status}`)
}
if (!response.body) {
  throw new Error('当前环境不支持读取流式响应')
}
```

`EventSource` 适合浏览器原生 GET 订阅，但不方便用 POST 提交问题或自定义请求头；AI 对话常用 `fetch` 读取响应流。无论选择哪种传输，事件格式都要由前后端共同约定。

## 8. 停止生成要停止所有后续工作

用户点击停止时：

1. 调用 `AbortController.abort()` 关闭浏览器请求。
2. 清除节流 timer 并 flush 或明确丢弃最后缓冲片段。
3. 将消息状态改为 `cancelled`，保留已收到的内容。
4. 忽略之后到来的旧请求事件。
5. 服务端尝试终止模型请求，避免用户停止后仍继续计费。
6. 允许开始下一轮，并确保旧流不会写入新消息。

只把按钮文字改成“已停止”并不能取消网络或模型任务。

## 9. 自动滚动的取舍

新消息到达时，如果用户仍在底部，可以自动滚动；如果用户往上翻历史，应该暂停自动滚动并显示“回到底部”按钮。否则阅读较早内容时页面会被强制拉走。

使用 `scrollHeight` 计算前，先判断距离底部阈值；不要对每个 delta 无条件调用平滑滚动，这可能造成主线程负担和滚动抖动。

## 10. 完成后再运行重型增强

收到完整结束事件后再进行：

- 代码高亮。
- Mermaid 图表解析。
- 数学公式排版。
- 复制按钮、目录链接等 DOM 交互增强。
- 保存最终消息和重新计算字数。

完成之后还要处理服务端告诉你的 assistant 消息 ID、用量和 finish reason。若浏览器连接中断，则显示“回答可能不完整”，不能把部分文本标成成功完成。

## 本篇验收清单

- 消息状态包含 streaming、complete、error、cancelled 等清晰阶段。
- 网络分片按 SSE 协议边界解析，不假设一次读取就是一条事件。
- 高频分片被节流，最后一个分片在 done 时必定 flush。
- 只更新当前回答，不重复渲染全部历史高亮。
- 用户停止后旧请求不能继续污染新会话。
- 用户阅读历史时不会被自动滚动打断。
- Mermaid、KaTeX 和高亮在完整回复后按策略启动。

## 官方资料

- [MDN：ReadableStream](https://developer.mozilla.org/docs/Web/API/ReadableStream)
- [MDN：TextDecoder.decode](https://developer.mozilla.org/docs/Web/API/TextDecoder/decode)
- [MDN：EventSource](https://developer.mozilla.org/docs/Web/API/EventSource)
- [markdown-it](https://github.com/markdown-it/markdown-it)

## 系列导航

[上一篇：数学公式与 KaTeX](/articles/markdown-it-math-katex-formulas) · [下一篇：Vue AI Markdown 综合项目](/articles/markdown-it-vue-ai-markdown-complete-project)
