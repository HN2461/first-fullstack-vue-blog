---
title: "第 5 篇：Ant Design X Vue AI 消息状态与流式接入：useXChat、SSE、后端代理和安全边界"
slug: "ant-design-x-vue-streaming-chat-api-security"
summary: "将 Ant Design X Vue 的消息组件连接到自有后端，理解 useXAgent、useXChat、流式响应、SSE、鉴权、取消和重试，并避免在前端泄露模型密钥。"
category: "Ant Design X Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design X Vue"
tags:
  - "Ant Design X Vue"
  - "useXChat"
  - "SSE"
  - "AI 接口安全"
status: "published"
sortOrder: 60
cover: ""
originalId: "6ad4b44660ceaba3ef6d31f0"
originalSlug: "ant-design-x-vue-streaming-chat-api-security"
originalStatus: "published"
publishedAt: "2026-10-18T11:57:58.676Z"
updatedAt: "2026-10-18T11:57:58.715Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 5 篇：消息状态、流式响应与模型安全接入

前端组件负责收集输入和展示结果，真正调用模型时必须先经过自己的服务端。模型 API Key 是服务器机密，绝不能打包进 Vue 环境变量、源代码、浏览器请求头或调试日志。

## 1. 一次对话请求经历什么

```text
用户输入
  -> Vue 页面检查草稿和活动会话
  -> 前端调用自有后端并携带登录态
  -> 后端检查权限、速率限制、输入长度和附件
  -> 后端读取模型密钥并调用模型供应方
  -> 后端将增量内容安全地转回前端
  -> 页面更新当前 AI 消息
  -> 后端保存用户消息、助手结果和必要的请求元数据
```

若浏览器直接请求模型供应方，任何访问者都可以从网络面板取得密钥，绕过权限和限额。前端直连只适合不含秘密的公开演示服务，并且必须由服务商提供专门的短期凭证和明确的安全限制。

## 2. useXAgent 与 useXChat 的分工

从概念上理解：

- `useXAgent` 描述“怎样向 AI 或自定义服务发出请求”。可以先用 Promise 模拟，再连接自己的接口。
- `useXChat` 管理“当前聊天中的消息状态”，包括请求期间的占位、请求成功和失败回退。
- `Bubble.List` 将消息状态映射成可显示列表。
- `Sender` 将用户操作交给 `onRequest` 或页面自己的提交函数。

官方文档的示例会使用 `requestPlaceholder` 和 `requestFallback` 表示等待与失败状态。具体消息回调、泛型和返回值请以锁定的 Ant Design X Vue 版本为准。先抄最小官方例子跑通，再逐个加入自己的业务类型，不要同时改 Agent、消息解析器和组件样式。

最小请求流程可以用下面的伪代码理解：

```js
const { messages, onRequest } = useXChat({
  agent,
  requestPlaceholder: '正在生成回复',
  requestFallback: '暂时无法生成，请稍后重试'
})

function handleSubmit(text) {
  onRequest(text)
}
```

这段展示职责，并非一个脱离官方类型的完整复制粘贴答案。开始开发前需要核对 `useXChat` 实际返回的 `messages`、`onRequest`，以及 Agent `request` 回调中的参数形状。

## 3. 先做普通 JSON 请求，再做流式

如果你第一次接模型，建议先实现普通 JSON：请求发出后显示加载态，完成后显示整段回答。确认权限、输入、保存和错误都正确后，再升级到流式。这样可以把“接口是否正确”和“流协议是否正确”分开排查。

请求示意：

```js
async function askAssistant(conversationId, text, signal) {
  const response = await fetch('/api/ai/conversations/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ conversationId, content: text }),
    signal
  })

  if (!response.ok) {
    throw new Error(`AI 请求失败：${response.status}`)
  }

  return response.json()
}
```

真实项目要按后端使用的 cookie 或 token 鉴权方式配置。错误展示不能暴露后端堆栈；后端应返回适当 HTTP 状态和稳定的业务错误码。

## 4. SSE 流式响应的基本形状

常见服务器发送事件响应会使用 `Content-Type: text/event-stream`，每条事件以 `data:` 行表示，事件之间用空行分隔。数据流可传输增量文本、完成标记或错误事件。浏览器收到分片后，只追加到当前请求对应的消息。

请求和消息要有对应关系，例如 `requestId`、`conversationId` 和本轮 assistant message ID。切换到别的会话时，迟到的分片不得写进新会话。遇到连接断开，要根据后端协议决定是否续传或重新发起，不能在前端猜测缺失文本。

流式解析还需处理：

- 一个事件可能分散在多个网络 chunk 中，不能假设一次读取就是一条完整事件。
- 一个网络 chunk 可能包含多条事件，必须逐条解析。
- 处理 UTF-8 多字节字符跨 chunk 的情况。
- 识别结束标记、空分片、服务端错误和异常关闭。
- 及时释放 reader/连接，取消后不再处理旧事件。

Ant Design X Vue 的 `XRequest` 可协助处理符合 OpenAI 风格的流式请求。不要直接把生产密钥交给浏览器侧的 `dangerouslyApiKey`。官方明确提示这类直连密钥选项仅适合本地开发；生产应让自己的后端持有密钥并代理请求。

## 5. 后端必须承担的安全工作

- 验证用户登录状态和当前会话访问权。
- 限制每分钟请求数、并发数、输入长度、上下文 token 和附件体积。
- 检查用户提供的模型参数是否在允许列表内，不接受任意供应商 URL。
- 密钥只保存在服务器环境变量或专用密钥管理服务。
- 对日志做脱敏，避免保存 access token、API Key 和不必要的完整敏感对话。
- 保护上传文件，校验类型、权限和下载地址。
- 对模型输出中可能执行的 HTML、脚本、链接和 Markdown 做安全处理。
- 设置超时、取消、账单上限与失败重试次数，避免无限重试产生高额费用。

浏览器 `localStorage` 不是存储服务端密钥的安全位置。Vite 的 `VITE_*` 环境变量会编译进前端静态资源，任何人都能下载和查看。

## 6. 会话保存和重试

建议保存稳定的会话 ID、消息 ID、角色、内容、时间、状态和必要的模型配置摘要。模型密钥绝不能跟消息一同保存。对话历史可能含个人信息，要有访问控制、保留期限、删除流程和审计策略。

重试一轮时需要明确：

- 是重放同一个用户消息，还是修改后创建新消息。
- 原失败 assistant 消息是标记为失败、替换，还是保留并创建新一轮。
- 用户的重复点击如何幂等处理。
- 对话上下文截断和模型版本变化如何记录。
- 页面刷新后，正在生成的状态如何恢复或标记为中断。

## 7. 错误反馈分层

| 错误类型 | 用户看到的说明 | 页面处理 |
| --- | --- | --- |
| 网络离线 | 网络不可用，检查连接后重试 | 保留草稿与已生成内容 |
| 未登录或会话过期 | 登录状态已过期 | 走项目统一登录，不循环重试 |
| 超出限额 | 当前请求过多，请稍后再试 | 按后端返回的重试时间冷却按钮 |
| 输入无效 | 告知具体长度或文件限制 | 聚焦输入区域，保留草稿 |
| 模型供应方失败 | 暂时无法生成 | 显示可重试操作，不暴露供应商密钥和堆栈 |
| 用户主动停止 | 已停止生成 | 保留已收到的部分回答并结束 loading |

不要将所有错误都显示为“网络异常”。用户需要知道下一步能做什么，开发人员则需要在后端日志中通过 request ID 排查。

## 8. 分阶段开发建议

1. 使用静态数组完成 Welcome、Conversations、Bubble.List 和 Sender 布局。
2. 写一个模拟 Agent，验证等待、成功、失败、重试和停止状态。
3. 接入自有后端的普通 JSON API，确认登录、保存和历史读取。
4. 后端支持 SSE 后，再将 JSON 整段回复替换为增量事件。
5. 加入文件上传、反馈和工具结果等能力，每次只引入一种状态。
6. 验证长对话和移动端，再优化性能与视觉主题。

## 9. 发布前检查

- 生产包和请求中找不到模型密钥。
- 未登录用户不能读取或发送私有会话。
- 服务端对模型调用设置超时、限流和用量上限。
- 停止请求后前端不再追加旧内容，服务端能尽可能取消模型任务。
- Markdown、链接、附件和代码示例经过安全处理。
- 页面在模型失败、SSE 中断和服务端 5xx 时仍可恢复。
- 不同会话的分片、加载态和错误互不串线。
- 前端构建、后端相关测试和编码检查通过。

## 官方资料

- [useXAgent](https://antd-design-x-vue.netlify.app/component/use-x-agent)
- [useXChat](https://antd-design-x-vue.netlify.app/component/use-x-chat)
- [XRequest](https://antd-design-x-vue.netlify.app/component/x-request)
- [Ant Design X Vue 官方 GitHub 仓库](https://github.com/wzc520pyfm/ant-design-x-vue)

## 10. 从按钮到模型返回：一步步建立请求链

初学时先用一个明确的数据结构组织请求：

```js
const request = {
  conversationId: activeConversationId.value,
  userMessageId: createClientId(),
  content: text,
  attachments: pendingFiles.value.map((file) => file.serverFileId)
}
```

页面发送顺序通常是：

1. 校验输入和附件是否已准备好。
2. 创建临时 user 消息和 assistant 占位消息，使界面立刻响应。
3. 调用自有后端，携带登录态、会话 ID、请求 ID 和取消信号。
4. 服务端再次检查会话权限、文件归属、限流和上下文长度。
5. 收到增量事件后只更新匹配的 assistant 消息。
6. 收到 `done` 后落定最终 ID、状态和用量；失败则保留部分回答并标记错误。
7. 按产品策略持久化和刷新会话标题。

前后端可定义统一事件：`message_start`、`delta`、`tool_status`、`done`、`error`。具体名称并不重要，重要的是协议明确、有版本、可测试，并且不把模型供应商原始响应结构泄露给前端。

## 11. 什么时候用 XRequest，什么时候自己封装

如果服务端提供与库约定兼容的 OpenAI 风格 SSE，`XRequest` 可以减少传输层样板；如果后端事件协议包含登录校验、文件处理、审计和自定义工具事件，可以使用项目统一的 fetch/SSE 服务，再把结果交给 `useXAgent` 或自己的消息状态管理。

判断时核对：

- 请求体格式是否一致。
- 鉴权使用 cookie、Bearer token 还是临时票据。
- 服务端的 delta 字段路径是否匹配 parser。
- error 和 done 的识别方式是否匹配。
- 取消请求能否真正关闭连接。
- 是否支持恢复、心跳和代理服务器缓冲配置。

不要为了使用某个 hook 而把现有的稳定后端协议改成更危险或更难维护的形状。组件库是界面和交互工具，不是必须使用的服务端架构。

## 12. 前端如何安全消费 SSE

`fetch` + `ReadableStream` 适合需要 POST 请求体或自定义 Header 的场景。数据解析需要 `TextDecoder` 使用 `{ stream: true }`，并把未完成尾部留到下一轮；切分边界后再解析 SSE 的 `data:`。完成、错误和取消时都要退出循环并释放 reader。

不要使用 `chunk.split('\n')` 就假设每一行完整。代理和 TCP 可以把一条事件拆成多个 chunk，也可以一次给出多条事件。可以使用经过维护的 SSE parser，或实现覆盖 CRLF、多行 data、注释行、空事件和尾部 flush 的解析器并加单元测试。

## 13. 请求身份和并发保护

每轮请求使用独立 `requestId`，事件处理前同时确认会话 ID 和消息 ID：

```js
function applyDelta(event) {
  if (event.requestId !== activeRequestId.value) return
  if (event.conversationId !== activeConversationId.value) return
  appendToMessage(event.messageId, event.text)
}
```

用户切换会话、点击停止或重新生成后，旧事件必须被忽略。若同一会话允许并发请求，消息需关联 parent message 或 turn ID，不能只用“当前 assistant 消息”一个全局引用。

## 14. 服务端密钥和提示词边界

后端代理仍要防止用户通过可控参数改变模型地址、绕过额度或读取其他人的会话。服务端应：

- 从服务端安全配置读取密钥，不回传给浏览器。
- 使用固定供应商和模型白名单，不接受客户端任意 URL。
- 将系统提示词保存在受控服务端配置，过滤客户端伪造的 system role。
- 对工具调用执行授权检查，模型输出不能自动获得工具权限。
- 设置每用户限额、并发限制和最大上下文窗口。
- 将错误映射为可展示的业务错误码，并用 request ID 记录脱敏日志。
- 设定模型任务超时和取消策略，避免断开浏览器后仍无限运行。

## 15. 失败、重试和重复写入

超时不代表后端一定没有收到请求。用户重试时可能创建重复消息或重复扣费。可以使用服务端幂等键，至少把 `requestId`、用户和会话绑定；服务端若已处理同一 ID，应返回已有结果或明确冲突。

重试策略还需限定次数和退避时间。鉴权失败、输入校验失败和额度耗尽不应自动重试；偶发网络中断可以保留部分回复并由用户主动重试。不要把模型生成请求当成完全无副作用的 GET 请求。

## 16. 完成后验证端到端状态

- 输入发送后，用户消息先出现且不会重复。
- assistant 占位状态清楚，收到首个 delta 后平滑变为流式内容。
- 切换会话后旧流不能写入当前窗口。
- 取消后部分回答保留，状态明确变成 cancelled。
- 服务端错误能映射到友好提示，草稿仍然可恢复。
- 收到 done 后保存的正文与页面完整显示的正文一致。
- 流式 Markdown 最终完成时补齐代码、公式和图表渲染。
- 浏览器构建产物和网络请求中都找不到模型密钥。
