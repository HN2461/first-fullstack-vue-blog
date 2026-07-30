---
title: "MaxKB 前端接入与原生 API 调用规则"
slug: "maxkb-maxkb-api-abc235d7"
summary: "本文整理 MaxKB 前端接入与原生 API 调用规则，归纳 MaxKB 接入与展示相关的配置方法、实践步骤、边界条件与常见注意事项。"
category: "接入与展示"
categoryPath:
  - "AI相关"
  - "AI开发"
  - "AI应用开发平台"
  - "MaxKB"
  - "公共规则"
  - "接入与展示"
tags:
  - "MaxKB"
  - "AI应用开发"
  - "接入与展示"
  - "API与工具"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a6b691f4bf50146e9b95e6a"
originalSlug: "maxkb-maxkb-api-abc235d7"
originalStatus: "published"
publishedAt: "2026-07-30T15:09:19.554Z"
updatedAt: "2026-07-30T15:09:19.554Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# MaxKB 前端接入与原生 API 调用规则

> 文档状态（2026-07-19）：本文记录前端接入 MaxKB 发布网址和原生 API 的通用规则。当前 API 口径按 MaxKB v2.10.4 官方文档和当前环境实测整理；目标版本不同时必须从智能体“概览”重新复制 API 文档、Base URL 和 API Key。
>
> 官方依据：[智能体概览](https://maxkb.cn/docs/v2/user_manual/app/app-view/)、[通过 API Key 进行对话](https://maxkb.cn/docs/v2/user_manual/chat_to_API/)

## 1. 当前结论

需要快速上线且接受官方聊天界面时，优先使用公司后台配置的 MaxKB 发布网址。需要自定义 UI、统一身份和审计时，使用服务端中转调用 MaxKB API；不要把长期 API Key 放在浏览器或小程序前端。

通用接入口径：

```text
业务后台或配置中心维护 MaxKB 发布网址
  -> 前端读取发布网址
  -> 前端只补当前用户态参数
  -> H5 / App / 小程序按各自容器打开 MaxKB
```

如果项目保留原生 API 研究页，该页面只用于研究 MaxKB 原生 API、流式返回形态和后续自定义聊天 UI，不要作为正式入口直接暴露给普通用户。

## 2. 发布网址接入规则

业务后台或配置中心只维护智能体发布地址，例如：

```text
https://chat.xxx.cn/chat/应用ID
```

正式发布入口中，前端只动态覆盖或补齐当前用户态参数：

| 参数 | 来源 | 用途 |
| --- | --- | --- |
| `userTicket` / `accessToken` | 当前登录凭证 | MaxKB 工具透传给业务后端识别当前用户 |

环境类参数不建议由前端 URL 动态传入，优先放在 MaxKB `基本信息 -> 接口传参` 默认值里：

| 参数 | 来源 | 用途 |
| --- | --- | --- |
| `businessBaseUrl` | MaxKB 接口传参默认值 | MaxKB 工具调用业务后端接口的根地址 |
| `agentBaseUrl` | MaxKB 接口传参默认值 | 智能体服务根地址 |
| `tenantId` / `schoolID` | MaxKB 接口传参默认值 | 后端按租户、组织或学校隔离数据 |
| `serviceSecret` | MaxKB 接口传参默认值，未启用时为空 | 后端内部调用校验 |
| `mode` | 移动端可按需追加 `mobile` | MaxKB 官方移动端样式模式 |

注意：

1. 前端拼参时要覆盖旧值，不要直接在已有 URL 后面重复追加。
2. H5 浏览器端当前不强制追加 `mode=mobile`，因为 MaxKB 部分版本移动端模式存在底部遮挡、无法滑动等适配问题。
3. 移动端如果 `mode=mobile` 仍出现头部或底部错乱，可临时去掉该参数做真机验证。
4. 智能体名称不要太长；移动端头部长标题会导致 MaxKB 官方页面布局错乱，当前建议使用 `工作流发起助手` 这类短名。
5. `serviceSecret` 不要放在发布 URL 里；复制智能体到新租户或新环境时，优先只改 MaxKB 接口传参默认值。

## 3. 原生 API 调用边界

浏览器或小程序原生 API 直连适合测试和自定义 UI 研究，不适合作为正式生产链路直接暴露。生产自定义 UI 应由业务后端中转或使用公司批准的短期凭证机制。

原因：

1. API Key 会暴露在前端包或浏览器代码里。
2. H5 直连 MaxKB 可能遇到 CORS，需要开发代理或服务端中转。
3. 微信小程序需要配置 request 合法域名；内网地址、未备案域名或 HTTP 地址不可用于正式小程序。
4. 小程序端读取 SSE 流式返回比 H5 复杂，当前测试页小程序分支暂用普通请求。
5. 长期方案建议由后端中转或签发短期令牌，前端不要长期保存 `agent-xxx` Key。

推荐实践：

```text
正式入口：MaxKB 发布网址
备用研究：单独的内部原生 API 调试页
```

## 4. 原生 API 调用流程

### 4.1 基础地址与智能体信息

原生 API 调用时，`agentBaseUrl` 建议只保存域名根地址，不要把 `/chat` 重复放进配置值。例如：

```text
agentBaseUrl = https://chat.xxx.cn
```

接口路径统一显式拼 `/chat/api/...`，避免在不同项目中出现 `https://chat.xxx.cn/chat/chat/api/...` 或 `https://chat.xxx.cn/api/...` 这类错误地址。

获取智能体信息：

```http
GET {agentBaseUrl}/chat/api/application/profile
Authorization: Bearer {apiKey}
Accept: application/json
```

示例：

```javascript
const getProfile = () => uni.request({
  url: `${agentBaseUrl}/chat/api/application/profile`,
  method: 'GET',
  header: {
    accept: 'application/json',
    Authorization: `Bearer ${apiKey}`
  }
});
```

常用返回字段：

| 字段 | 用途 |
| --- | --- |
| `data.id` | 智能体 ID，可用于排查是否连到目标智能体 |
| `data.name` | 页面标题或聊天助手名称 |
| `data.desc` | 智能体说明，可用于简介展示 |
| `data.prologue` | 开场白和快捷问题来源 |
| `data.dialogue_number` | 建议问题或对话轮次相关配置，可用于调试展示逻辑 |
| `data.icon` | 智能体图标路径，使用前需按实际域名补全 |

`prologue` 通常是一段文本加多行 `- 问题`，前端自定义聊天页可以按 `\n-` 拆分：第一段作为开场白，后续段作为快捷问题。

```javascript
const applyProfileQuestions = (prologue) => {
  const contentList = String(prologue || '').split('\n-');
  const greeting = contentList[0] || '';
  const quickQuestions = contentList
    .slice(1)
    .map(item => item.trim())
    .filter(Boolean);

  return { greeting, quickQuestions };
};
```

注意：

1. API Key 应使用目标智能体 `API Key` 弹窗里创建的当前有效 Key；不要仅凭历史前缀判断凭证类型，应以目标环境概览和 Swagger 为准。
2. 请求头必须是 `Authorization: Bearer {apiKey}`，只传裸 `agent-xxx` 或传错 `application-xxx` 都可能返回 `401`。
3. 如果项目通过统一请求封装切换 MaxKB 域名，可以保留一个仅用于识别分支的查询标记，例如 `?chatKey`；该标记不是 MaxKB 必需参数。

### 4.2 创建会话

请求：

```http
GET {agentBaseUrl}/chat/api/open
Authorization: Bearer {apiKey}
Accept: application/json
```

示例：

```javascript
const openChat = () => uni.request({
  url: `${agentBaseUrl}/chat/api/open`,
  method: 'GET',
  header: {
    accept: 'application/json',
    Authorization: `Bearer ${apiKey}`
  }
});
```

返回口径：

```json
{
  "code": 200,
  "data": "会话ID",
  "message": "成功"
}
```

后续发送消息时，把 `data` 当作 `chatId`。

### 4.3 发送普通消息

请求：

```http
POST {agentBaseUrl}/chat/api/chat_message/{chatId}
Authorization: Bearer {apiKey}
Content-Type: application/json
Accept: application/json
```

请求体：

```json
{
  "message": "我能发起哪些流程？",
  "stream": false,
  "re_chat": false,
  "form_data": {
    "userTicket": "Bearer 当前登录token"
  },
  "node_data": {},
  "image_list": [],
  "document_list": [],
  "audio_list": [],
  "other_list": [],
  "child_node": {}
}
```

返回口径：

```json
{
  "code": 200,
  "data": {
    "content": "AI 回复内容"
  },
  "message": "成功"
}
```

前端展示时读取：

```javascript
payload.data?.content
```

### 4.4 发送流式消息

请求体只需要把 `stream` 改成 `true`：

```json
{
  "message": "我想请假半天",
  "stream": true,
  "re_chat": false,
  "form_data": {
    "userTicket": "Bearer 当前登录token"
  },
  "node_data": {},
  "image_list": [],
  "document_list": [],
  "audio_list": [],
  "other_list": [],
  "child_node": {}
}
```

H5 可使用 `fetch` 读取 `response.body.getReader()`：

```javascript
const response = await fetch(`${agentBaseUrl}/chat/api/chat_message/${chatId}`, {
  method: 'POST',
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  },
  body: JSON.stringify(payload)
});
```

当前实测需要注意：

1. 返回可能是 SSE 事件流。
2. 每个事件里常见格式是 `data: {...}`。
3. `content` 可能不是增量片段，而是“当前完整文本”；前端不能简单拼接，否则会重复。
4. 如果只收到 1 次 `content`，说明传输层是流式，但文本仍是最后一次性返回。
5. 为了体验，可以在前端对完整文本做本地打字机效果。

解析建议：

```javascript
const parseStreamChunk = (chunkText) => {
  const lines = String(chunkText || '').split(/\r?\n/);
  let content = '';
  let isEnd = false;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine.startsWith('data:')) return;

    const rawData = trimmedLine.replace(/^data:\s*/, '');
    if (!rawData || rawData === '[DONE]') {
      isEnd = rawData === '[DONE]';
      return;
    }

    const eventData = JSON.parse(rawData);
    if (eventData.content) {
      content = eventData.content;
    }
    if (eventData.is_end) {
      isEnd = true;
    }
  });

  return { content, isEnd };
};
```

## 5. 全局入参规则

MaxKB 开始节点应配置目标项目需要的接口传参。下面是常见字段示例，不是 MaxKB 内置字段，必须按目标项目实际协议映射：

```text
businessBaseUrl
agentBaseUrl
schoolID 或 tenantId
serviceSecret
userTicket
```

这些参数不要让大模型自由推断。环境态参数优先在 MaxKB 接口传参默认值中固定配置，用户态参数由前端 URL 参数、后端中转或原生 API 的 `form_data` 动态传入。

安全说明：发布 URL 和 `form_data` 只是参数传入通道，不自动证明参数可信。租户、用户和资源权限必须由业务后端重新校验；长期 token、服务密钥和 API Key 不应出现在公开 URL、浏览器历史、Referer 或前端日志中。

通常建议把 `businessBaseUrl/agentBaseUrl/tenantId/serviceSecret` 这类环境态参数放到 MaxKB 接口传参默认值里；把 `userTicket/accessToken/sessionToken` 这类用户态参数默认值留空，由前端、后端中转或原生 API `form_data` 按当前登录用户动态传入。

工具调用业务后端时，请按目标项目后端协议设置请求头。示例：

```text
Authorization: Bearer {{ accessToken }}
X-Service-Secret: {{ serviceSecret }}
```

## 6. 前端代码位置

迁移到具体项目前，先确定下面几个前端职责点：

```text
1. 哪个页面或菜单读取 MaxKB 发布网址。
2. H5 / App 是否直接跳转发布网址。
3. 小程序是否需要 web-view 承载发布网址。
4. 是否需要内部原生 API 调试页。
5. 是否需要 H5 开发代理、小程序合法域名或后端中转。
```

## 7. 后续如果要恢复自定义聊天

恢复自定义聊天前，先确认：

1. API Key 是否换成后端中转或短期令牌。
2. H5 是否已经处理 CORS。
3. 小程序是否配置合法域名和 HTTPS。
4. 小程序端是否需要真正流式，还是普通请求 + 本地打字机即可。
5. 是否已经抽出 `openChat`、`postChatMessage`、`postChatMessageStream`、`buildFormData` 等稳定方法。
6. 是否保留官方 MaxKB 页面作为回退入口。
