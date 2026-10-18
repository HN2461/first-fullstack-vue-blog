---
title: "第 4 篇：Ant Design X Vue Sender 输入框实战：回车发送、附件上传、停止生成与状态反馈"
slug: "ant-design-x-vue-sender-attachments-submit"
summary: "学会管理 Sender 草稿、快捷键、发送中状态和附件生命周期，避免重复提交、误删内容、上传过大文件以及取消生成后界面仍锁定。"
category: "Ant Design X Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design X Vue"
tags:
  - "Ant Design X Vue"
  - "Sender"
  - "Attachments"
  - "文件上传"
status: "published"
sortOrder: 50
cover: ""
originalId: "6ad4b44660ceaba3ef6d31ee"
originalSlug: "ant-design-x-vue-sender-attachments-submit"
originalStatus: "published"
publishedAt: "2026-10-18T11:57:58.676Z"
updatedAt: "2026-10-18T11:57:58.708Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 4 篇：Sender 输入框、附件与发送体验

输入区看起来只有一个文本框和发送按钮，但它连接了草稿、键盘、上传、请求状态和取消逻辑。设计时先明确每一种状态，再决定怎样映射到 Sender 组件的 Props、Events 和 Slots。

## 1. 把输入草稿放在页面状态中

页面需要知道当前草稿，便于发送、切换会话前提示和保存未完成文本：

```js
const draft = ref('')
const pendingFiles = ref([])
const isSubmitting = ref(false)
const isGenerating = ref(false)
const canSend = computed(() => draft.value.trim().length > 0 || pendingFiles.value.length > 0)
```

不要把“发送中”和“正在生成”都压成一个不可解释的布尔值。用户消息已经提交但助手还在生成时，可以允许用户查看历史或取消本次生成；重新提交是否可用则应由产品规则决定。

## 2. Sender 只负责采集和发出操作

Sender 的职责是编辑文本并通知父组件提交。父组件负责校验、创建会话、上传附件和调用 API。这样输入框不会意外绕过权限或发送策略。

```vue
<script setup>
import { ref } from 'vue'
import { Sender } from 'ant-design-x-vue'

const draft = ref('')
const props = defineProps({
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['send'])

function submit(value) {
  const text = String(value || draft.value || '').trim()
  if (!text || props.disabled || props.loading) return
  emit('send', text)
}
</script>

<template>
  <Sender
    v-model="draft"
    :loading="loading"
    :disabled="disabled"
    :submit-type="['enter']"
    placeholder="向 AI 提问"
    @submit="submit"
  />
</template>
```

具体 Props 名称和默认快捷键行为以当前版本 Sender 文档为准。特别要确认 Enter 是发送还是换行，Shift+Enter 是否换行，以及移动端软键盘的提交行为。不能只用自己的键盘习惯替整个团队做决定。

## 3. 防止重复提交

用户可能连按 Enter，也可能在请求刚开始时重复点击。提交函数应在最开始同步切换状态，并在 `finally` 中恢复：

```js
async function sendMessage(text) {
  const value = String(text || '').trim()
  if (!value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    await createUserMessageAndStartRequest(value)
    draft.value = ''
  } catch (error) {
    showSendError(error)
  } finally {
    isSubmitting.value = false
  }
}
```

如果后端以“先保存用户消息、再开始 AI 生成”的两个请求实现，还需要服务端幂等键或统一事务，防止网络重试造成两条重复用户消息。

## 4. 附件的完整生命周期

Ant Design X Vue 有附件相关组件或 Sender 附件能力，但文件校验与上传安全仍属于业务。至少要考虑：

1. 用户选择文件或把文件粘贴到输入框。
2. 前端展示名称、大小和上传状态，并执行快速校验。
3. 上传到受控后端，后端再做真实类型、大小、权限和恶意文件检查。
4. 上传成功后取得服务端的 `fileId`，发送消息只引用该 ID。
5. 用户移除附件时取消未完成上传，或者明确标记为待清理。
6. 会话提交失败时保留附件状态，允许重新发送而不重复上传。

不要仅依赖文件扩展名或浏览器传来的 MIME 类型判断安全。不要把文件的 base64 原文直接塞到聊天文本中。大文件通常通过独立上传端点或对象存储直传，并由后端签发短期凭证。

## 5. 粘贴图片与拖拽

如果启用粘贴文件事件，先判断文件类型和大小，给用户反馈后再开始上传。拖拽页面时要防止浏览器默认打开本地文件；只有拖入受支持区域才展示拖拽提示。多个文件要限制并发数，进度与失败应逐文件显示。

上传过程中发生以下情况，都要有明确结果：

- 网络中断：保留文件条目，提供重试。
- 用户取消：终止请求并清理临时状态。
- 服务端拒绝：显示可理解的原因，不只显示 `400`。
- 文件已过期：在发送前重新上传或让用户重新选择。
- 切换会话：按产品规则保留通用草稿或提示未完成附件将被丢弃。

## 6. 停止生成和中断请求

停止按钮不是简单地把 `loading` 设为 `false`。需要真正中止浏览器请求或向后端发送取消信号；后端还要尝试通知模型供应方停止生成。即使供应方不能及时停止，前端也要停止继续追加当前消息，并保留已经生成的部分作为可查看结果。

使用 `AbortController` 的简化示例：

```js
let activeController

async function startGeneration(payload) {
  activeController = new AbortController()
  try {
    await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: activeController.signal
    })
  } finally {
    activeController = null
  }
}

function stopGeneration() {
  activeController?.abort()
}
```

生产系统如果采用服务器推送或事件流，请按实际传输机制实现取消，确保用户关闭页面或断网后资源能释放。重新生成与停止生成必须区分：前者发起一轮新的请求，后者尝试终止当前轮。

## 7. 长文本和可访问性

- 输入框随内容适度增高，但设定最大高度，达到后内部滚动。
- 发送、停止、上传和删除附件按钮有明确图标、标签或 tooltip。
- 不能只用颜色区别上传成功、失败和进行中状态。
- 键盘焦点顺序稳定，发送后焦点留在合理位置。
- 禁用期间仍向用户解释原因，例如“附件正在上传”，避免看起来像按钮失灵。
- 窄屏下输入框不能被虚拟键盘遮挡，附件列表不能撑破视口。

## 8. 本篇验收清单

- 空白输入不发送，连续按 Enter 也不会重复创建请求。
- 输入中的多行内容可以保留，发送后按产品设定清空或恢复草稿。
- 上传成功、失败、取消和重试状态都能显示。
- 停止生成后不会继续追加迟到的旧响应。
- 文件限制由后端再次校验，前端检查只用于尽早反馈。
- 移动端键盘弹出时发送区仍可用。

## 官方资料

- [Sender](https://antd-design-x-vue.netlify.app/component/sender)
- [Attachments](https://antd-design-x-vue.netlify.app/component/attachments)

## 9. 草稿属于哪个范围

最简单的页面只有一个 `draft`。如果同时支持多个会话，可以按会话保存草稿：

```js
const draftByConversation = reactive(new Map())

function getDraft(conversationId) {
  return draftByConversation.get(conversationId) || ''
}

function setDraft(conversationId, value) {
  draftByConversation.set(conversationId, value)
}
```

切换会话时不要把 A 会话未发送的问题意外带到 B。是否在本地持久化草稿要考虑设备共享、隐私和退出登录清理；有敏感内容时不应默认永久存进 localStorage。

## 10. Enter、Shift+Enter 与输入法

Sender 可能提供 `submitType` 或类似设置来控制 Enter 行为，必须按安装版本的 Props 文档确认。还要特别测试中文输入法组合过程：用户按 Enter 选字时，不能把尚未确认的输入直接发送。若自己监听 `keydown`，要忽略 `event.isComposing`，并提供 Shift+Enter 换行行为。

建议产品规范清楚说明：

- Enter 是发送还是换行。
- Shift+Enter 是否始终换行。
- Ctrl/Cmd+Enter 是否提供额外发送方式。
- 移动端软键盘的“发送”按钮如何处理。
- 按钮和快捷键是否受相同的 disabled/loading 校验约束。

## 11. 将附件状态与消息状态分开

单个附件可以维护：

```js
{
  id: 'local-file-1',
  name: 'diagram.png',
  size: 102400,
  status: 'uploading',
  progress: 45,
  serverFileId: null,
  error: null
}
```

推荐状态包括 `queued`、`uploading`、`uploaded`、`failed`、`cancelled`。消息可以只有在所有必需附件都上传成功后才提交，也可以先提交文本再异步关联附件；这两种流程对后端数据模型不同，必须先确定。

上传完成后引用服务端的文件 ID。不要用本地 `File` 对象或 Blob URL 保存为历史附件；Blob URL 刷新页面后会失效。预览临时 URL 用完要 `URL.revokeObjectURL`。

## 12. 附件校验和错误反馈

前端校验主要提升体验，后端校验才是安全边界。常见校验项包括单文件大小、总大小、数量、扩展名、MIME 类型、真实文件签名、上传者权限、会话权限和病毒扫描策略。

给错误对应可行动反馈：

| 情况 | 建议反馈 |
| --- | --- |
| 超过大小限制 | 显示服务端公布的最大值，并保留其它已选附件 |
| 不支持的类型 | 列出允许类型，允许移除后继续发送 |
| 上传超时 | 保留附件条目并提供重试 |
| 会话切换 | 说明未完成附件是否继续上传或取消 |
| 文件已删除/过期 | 发送前提示重新选择，不提交失效 ID |

## 13. Sender 与生成状态映射

输入区可能处于这些业务阶段：

```text
idle -> uploading -> ready-to-send -> submitting -> generating -> idle
```

UI 应据此决定按钮显示发送、停止还是重试，而不是简单地始终将 `loading` 传给 Sender。官方组件可能内置生成状态样式，但后端请求生命周期仍由应用掌控。

停止生成通常保留输入区，使用户可以继续编辑或开始新的会话；是否允许同一会话同时启动多个生成请求，需要服务端和消息排序支持。

## 14. 本篇扩展练习

1. 输入框支持 Enter 发送、Shift+Enter 换行，且中文输入法选词不误发。
2. 新建第二个会话，验证第一个会话草稿不会串过去。
3. 上传一张允许图片和一个不允许文件，检查逐项状态和反馈。
4. 模拟请求超时、用户取消、切换会话和重复点击。
5. 验证停止生成后，Sender 能正确恢复，旧分片不能重新锁住输入区。
