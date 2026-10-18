---
title: 第 3 篇：Ant Design X Vue 消息展示实战：Bubble、Markdown、代码块与 Actions
slug: ant-design-x-vue-bubble-markdown-actions
summary: 设计可靠的消息数据模型，使用 Bubble 与 Bubble.List 呈现对话，安全渲染 Markdown 和代码，并处理复制、重试、反馈等消息操作。
tags:
  - Ant Design X Vue
  - Bubble
  - Markdown
  - 流式消息
category: Ant Design X Vue
categoryPath:
  - 前端技术
  - 组件库
  - Ant Design X Vue
sortOrder: 40
status: published
---

# 第 3 篇：消息展示实战

消息气泡是 AI 页面最核心的区域。组件库可以统一气泡布局、头像、加载和操作区域，但业务需要提供清晰的消息结构，并对 Markdown、流式内容和失败状态作出约定。

## 1. 消息不是一段字符串

如果只保存 `['你好', '您好']`，很快就会遇到问题：无法区分用户与 AI、无法重试某条请求、无法标记生成状态，也无法从历史中继续加载。建议使用对象：

```js
{
  id: 'msg-98f21',
  conversationId: 'conversation-3001',
  role: 'assistant',
  content: '可以先把页面拆成三部分。',
  status: 'done',
  createdAt: '2026-10-18T09:30:00.000Z',
  error: null
}
```

`role` 用于区分 `user`、`assistant`，必要时还可以有系统消息；`status` 可用 `sending`、`streaming`、`done`、`error`；`id` 必须稳定。不要将临时的“正在思考……”文案永久保存为 AI 正文。

## 2. 用 Bubble.List 显示多条消息

为不同角色定义一次外观，再把消息数组映射给列表。这样比每条消息手写一段模板容易维护。

```vue
<script setup>
import { computed } from 'vue'
import { Bubble } from 'ant-design-x-vue'

const props = defineProps({
  messages: { type: Array, required: true }
})

const roles = {
  user: { placement: 'end' },
  assistant: { placement: 'start' }
}

const items = computed(() => props.messages.map((message) => ({
  key: message.id,
  role: message.role === 'user' ? 'user' : 'assistant',
  content: message.content,
  loading: message.status === 'sending'
})))
</script>

<template>
  <Bubble.List
    :items="items"
    :roles="roles"
    auto-scroll
    class="message-list"
  />
</template>

<style scoped>
.message-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
```

不同发布版本的组件导出形式可能是 `Bubble.List`，也可能在示例中出现 `BubbleList`。以项目安装版本的官方组件总览和 TypeScript 类型为准，整个项目固定一种写法。上面的 `items` 是给组件展示的投影，不应该反过来成为后端数据库数据结构。

## 3. 使用 Markdown 渲染模型回复

AI 回复经常包含标题、列表、链接、引用和代码块。把 Markdown 当纯文本显示最安全，但可读性有限；将任意字符串直接放入 `v-html` 则存在脚本注入风险。正确流程是：

1. 使用维护中的 Markdown 解析器将文本解析为 HTML。
2. 使用 HTML sanitizer 白名单清理危险元素和属性。
3. 清理后再通过受控组件展示。
4. 对链接配置安全的打开方式，并处理外部链接策略。
5. 对代码块调用高亮库时，将高亮结果也限制在安全渲染流程中。

示意代码：

```js
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})

function renderAssistantMarkdown(source) {
  const html = markdown.render(source)
  return DOMPurify.sanitize(html)
}
```

`DOMPurify` 是示意所需的清理库；选择依赖前要检查项目是否已有等价、安全审计过的 Markdown 管线，不要重复装一套。`html: false` 可以减少原始 HTML 输入面，但仍应进行输出清理，尤其是链接、图片和插件扩展。

Ant Design X Vue 的 `Bubble` 支持通过 `messageRender` 或消息插槽自定义内容。流式阶段传入的文本可能停在半个代码围栏或未闭合列表中，Markdown 渲染器必须能优雅处理不完整输入；否则逐字输出时界面会反复闪烁或错位。最终完成后可以再执行一次完整排版或语法高亮。

## 4. 流式中途的渲染策略

接收模型分片时，可能暂时得到这样的内容：

````text
```js
const answer =
````

这不是完整 Markdown。实用策略包括：

- 生成中只显示已到达的纯文本，生成结束后再做代码高亮。
- 使用对不完整 Markdown 容错的解析选项，避免强制补齐造成错觉。
- 只在内容变化时更新对应 AI 消息，不要重建整段历史列表。
- 对很长的回复做节流或批量合并更新，降低每个分片都触发完整重渲染的开销。
- 保持用户滚动位置：如果用户已经向上查看历史，不要每次更新都把视口强行拉到底部。

`autoScroll` 能帮助常见的新消息场景，但复杂的“用户正在看历史”体验通常需要页面自己判断滚动距离和是否锁定底部。

## 5. Actions 消息操作

`Actions` 可组合复制、重试、点赞、点踩等按钮。按钮点击只表示用户意图，接下来要由业务代码调用对应处理器：

| 操作 | 页面或后端工作 |
| --- | --- |
| 复制 | 复制当前气泡的纯文本或规范化内容，提供成功/失败提示 |
| 重试 | 使用这轮原始用户输入重新请求，关联同一个会话和父消息 |
| 点赞/点踩 | 记录用户反馈、消息 ID、模型版本和必要的诊断信息 |
| 编辑问题 | 回到用户原问题的可编辑草稿，确认后重新提交 |
| 分享 | 由后端创建有权限边界的分享资源，不直接暴露私有会话 URL |

复制时不要复制内部提示词、模型调试信息或非用户可见的元数据。反馈接口应防止重复提交，并向用户说明当前反馈已记录。

## 6. 错误和工具结果也要可读

不要把 HTTP 错误对象、堆栈或原始 JSON 直接塞进 `content`。将错误分为用户可处理的状态，例如“网络暂时不可用，请重试”“本次请求超时”“会话已过期”。诊断信息写入受控日志，不能把密钥或完整敏感输入写入浏览器控制台。

如果模型会调用搜索、知识库或函数工具，应明确区分“助手解释”“工具状态”“工具结果”。工具执行过程不能伪装成模型最终答案，也不应在没有授权时把工具调用暴露成可点击的任意命令。

## 7. 长对话和性能

- 使用服务端分页或游标加载更早消息，不一次性加载无限历史。
- 给列表项使用消息 ID 做 key，避免用数组下标。
- 图片、文件和图表采用固定尺寸预览，展开详情时使用受限滚动容器。
- 代码块长行设置横向滚动，不把整页宽度撑开。
- 必要时虚拟化极长历史，但要先评估复制、选择文本、自动滚动和读屏体验。
- 切换会话时取消或忽略上一个会话的未完成读取，避免返回结果污染当前时间线。

## 8. 本篇验收清单

- 用户和 AI 气泡方向、头像和最大宽度符合产品设计。
- 正文 Markdown 可以显示列表、链接和代码块，原始危险 HTML 不会执行。
- AI 生成中可以显示未完成文本，生成结束后格式稳定。
- 用户滚动到历史内容时，新分片不会强制抢回滚动位置。
- 复制和反馈都有明确结果，重试使用正确会话。
- 长内容、长代码行、空回复和失败回复都不会破坏布局。

## 官方资料

- [Bubble](https://antd-design-x-vue.netlify.app/component/bubble)
- [Actions](https://antd-design-x-vue.netlify.app/component/actions)
- [官方 GitHub 示例](https://github.com/wzc520pyfm/ant-design-x-vue)

## 9. 将业务消息转换为 Bubble 数据

数据库模型和组件展示模型不必完全相同。可以用一个小的映射函数集中处理状态：

```js
function toBubbleItem(message) {
  return {
    key: message.id,
    role: message.role === 'user' ? 'user' : 'assistant',
    content: message.content,
    loading: message.status === 'sending' || message.status === 'streaming',
    placement: message.role === 'user' ? 'end' : 'start'
  }
}
```

映射函数便于测试，也能让后端字段演进时只改一个位置。具体 `Bubble.List` 的 item 属性要按当前版本类型确认；不支持的业务字段要放在页面 store，而不是假设组件会自动识别。

消息 ID 应稳定且唯一。用户消息提交前可有客户端临时 ID，服务端返回后做映射；避免数组下标、内容文本或 `Date.now()` 单独作为 key。相同内容可以连续发送，时间戳也可能在同一毫秒重复。

## 10. `messageRender`、默认插槽和角色模板

当不同角色需要不同内容显示方式时，优先用 Bubble 的角色配置或官方支持的消息渲染入口。典型职责如下：

- `user`：通常显示纯文本或受限的 Markdown，不显示 AI 专属重试和反馈。
- `assistant`：使用 MarkdownContent，支持复制、重试、反馈和引用来源。
- `tool`：显示可折叠的工具执行状态和摘要，避免把原始参数误认为自然语言。
- `error`：使用错误视图和重试动作，不混进普通 assistant 正文。

组件 API 的 slot 和 render callback 形状以当前版本为准。先做一个 user/assistant 两角色最小例子，再加入工具消息。不要用大量 `v-if` 将所有业务行为塞入一段复杂的 `messageRender`。

## 11. Markdown 安全和代码块策略

消息来自模型并不等于可信内容。模型可能复述用户输入、生成 HTML 或返回恶意链接。Markdown 渲染应遵循独立专题的完整流程：

```text
原始 Markdown -> markdown-it -> 代码高亮/扩展 -> DOMPurify -> Bubble 自定义内容
```

生产方案应关闭任意原始 HTML，约束链接和远程图片，清理插件输出，并在流式阶段谨慎处理半截代码围栏。详细代码、Mermaid、KaTeX 和 XSS 测试见 [Markdown 与 markdown-it 全面入门](/articles/markdown-it-complete-learning-roadmap)。

## 12. 复制、重试和反馈的实现细节

### 复制

复制气泡的纯文本或规范化 Markdown；如果 UI 还包含“正在生成”、复制按钮和引用卡片，不要把这些界面文字一起复制。剪贴板拒绝时提示用户选中文本手动复制。

### 重试

重试要重新使用本轮用户输入和当前会话 ID。检查 assistant 失败消息是更新原记录还是新增一个分支；避免在原回答后追加第二个模型输出造成时间线歧义。重复点击应使用请求锁或幂等键。

### 反馈

反馈记录建议关联 `messageId`、评价方向、模型/提示版本和时间。只收集确有用途的数据，并明确是否可以撤销。前端按钮状态应与服务端返回保持一致。

## 13. 长消息的展示与历史加载

超长代码、表格、图片和 Mermaid 图都可能改变气泡高度。对每种内容预先定义最大宽度、内部滚动、展开方式和错误状态。消息列表通常用游标向上分页；加载旧消息时保留当前可见消息锚点，避免列表 prepend 后视口突然跳动。

虚拟滚动能降低大量 DOM 节点成本，但可能影响用户选择文本、浏览器查找、读屏和自动滚动。先测量真实消息数量，再决定是否引入。

## 14. 消息显示问题排查

- 气泡没出现：检查 `items` 是否有内容、key 是否稳定、role 是否匹配角色映射。
- 消息顺序反了：确认后端排序和追加位置，不靠 CSS `column-reverse` 掩盖数据顺序。
- 流式时闪动：检查是否每片都高亮全部历史内容，是否强制自动滚动。
- Markdown 被当纯文本：检查 message renderer/slot 是否真的调用 MarkdownContent。
- HTML 显示异常：查看清理器允许的 class、元素和属性，不要先关闭清理器。
- 长代码撑开页面：给 `pre` 容器设置 max-width 和 overflow，而不是给代码设置固定视口宽度。
