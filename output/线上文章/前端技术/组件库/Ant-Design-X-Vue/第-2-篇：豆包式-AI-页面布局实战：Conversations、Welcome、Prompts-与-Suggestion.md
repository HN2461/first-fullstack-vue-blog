---
title: "第 2 篇：豆包式 AI 页面布局实战：Conversations、Welcome、Prompts 与 Suggestion"
slug: "ant-design-x-vue-page-layout-conversations-prompts"
summary: "将 AI 助手拆成侧栏、主对话区和输入区，使用 Conversations、Welcome、Prompts、Suggestion 组织新会话、历史会话和推荐提问。"
category: "Ant Design X Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design X Vue"
tags:
  - "Ant Design X Vue"
  - "Conversations"
  - "Prompts"
  - "AI 产品设计"
status: "published"
sortOrder: 30
cover: ""
originalId: "6ad4b44660ceaba3ef6d31ea"
originalSlug: "ant-design-x-vue-page-layout-conversations-prompts"
originalStatus: "published"
publishedAt: "2026-10-18T11:57:58.676Z"
updatedAt: "2026-10-18T11:57:58.691Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 2 篇：豆包式 AI 页面布局实战

豆包式界面看起来像一个完整组件，但工程上应拆成多个区域。布局由 Vue 和基础组件负责；Ant Design X Vue 的组件放在最适合的区域；会话的创建、保存和切换仍由业务状态与后端负责。

## 1. 先画区域，不要先写组件

桌面版常见结构如下：

```text
┌────────────────────────────────────────────────┐
│ 顶栏：品牌 / 新对话 / 模型或个人菜单             │
├──────────────┬─────────────────────────────────┤
│ 会话侧栏     │ 主工作区                         │
│              │ 欢迎区或消息列表                 │
│ Conversations│                                 │
│              │ Sender 输入区                    │
└──────────────┴─────────────────────────────────┘
```

使用 Ant Design Vue 的布局或普通 CSS Grid/Flex 都可以。不要因为有 `Conversations` 就把整个页面交给它，它只是会话切换列表，不负责整个应用的菜单、权限和页面路由。项目若已有登录控制台布局，应把 AI 工作区放进现有布局，不要另做一套与控制台导航冲突的主导航。

## 2. 先准备稳定的数据结构

建议在页面状态里区分“会话”和“消息”。简单示例：

```js
const conversations = ref([
  { key: 'c-101', label: '新手如何开始', group: '今天' },
  { key: 'c-102', label: '整理 Vue 组件清单', group: '昨天' }
])

const activeConversationKey = ref('c-101')

const messageByConversation = ref({
  'c-101': [
    { id: 'm-1', role: 'user', content: '我第一次使用这个系统。' },
    { id: 'm-2', role: 'ai', content: '你好，我可以陪你一步步完成。' }
  ],
  'c-102': []
})
```

`key` 是列表中稳定、唯一的标识；`label` 只是展示文案；分组用于“今天、昨天、更早”等区域。真正接入后端时，ID 应来自服务端。不要用会话标题当 ID，因为标题可以重复，也会被用户重命名。

## 3. 会话列表 Conversations

官方示例使用 `v-model` 绑定当前会话 key，并通过 `items` 传入会话数组。每个 item 通常至少包含 `key` 和 `label`，还可以按当前版本支持的结构提供 `group`、时间戳、图标或额外操作。

```vue
<script setup>
import { computed, ref } from 'vue'
import { Conversations } from 'ant-design-x-vue'

const activeKey = ref('c-101')
const conversations = ref([
  { key: 'c-101', label: '新手如何开始', group: '今天' },
  { key: 'c-102', label: '整理 Vue 组件清单', group: '昨天' }
])

const emptyTip = computed(() => conversations.value.length === 0)
const emit = defineEmits(['new-conversation'])
</script>

<template>
  <aside class="conversation-sidebar">
    <a-button type="primary" block @click="emit('new-conversation')">
      新建对话
    </a-button>
    <a-empty v-if="emptyTip" description="还没有历史会话" />
    <Conversations
      v-else
      v-model="activeKey"
      :items="conversations"
      class="conversation-sidebar__list"
    />
  </aside>
</template>
```

这里的示例展示组件位置和绑定关系。真实项目中应让父页面决定 `activeKey`，然后监听选中事件加载对应消息。创建、删除和重命名也要调用业务方法；不要只修改组件内部显示，否则刷新页面后历史会话会消失。

一次会话切换通常按这个顺序执行：

1. 用户点击一个会话项。
2. 更新当前 `activeConversationKey`，并显示该会话的加载状态。
3. 请求后端读取该会话的消息，或显示本地缓存后再校准。
4. 忽略已经切换到另一个会话之后才返回的旧请求，避免串会话。
5. 请求失败时显示可重试状态，不能把空消息误认为没有历史记录。

## 4. 新会话的 Welcome 和 Prompts

当当前会话还没有消息时，主区域可以显示 `Welcome` 和 `Prompts`。欢迎组件负责提供品牌式问候与描述；提示词组件把常见任务做成可点击入口。点击提示词应复用普通发送流程，避免一套按钮又造出另一套模型请求逻辑。

```vue
<script setup>
import { ref } from 'vue'
import { Prompts, Welcome } from 'ant-design-x-vue'

const prompts = ref([
  { key: 'learn', label: '帮我解释一个概念', description: '从定义、例子和常见误区开始' },
  { key: 'write', label: '帮我整理一份提纲', description: '先给出结构，再逐段完善' }
])

function handlePromptSelect({ data }) {
  emit('send-prompt', data.label)
}

const emit = defineEmits(['send-prompt'])
</script>

<template>
  <section class="welcome-panel">
    <Welcome
      title="你好，今天想一起解决什么问题？"
      description="可以提问、整理资料，也可以从下方的常用任务开始。"
    />
    <Prompts :items="prompts" @on-item-click="handlePromptSelect" />
  </section>
</template>
```

组件的 Props 和事件名可能随着版本调整，以上代码表达的是结构关系。落代码时应确认当前版本的 `Prompts` 文档；尤其要区分点击整个提示项与点击提示项中的子操作。不要把提示词的 key 直接当成发送给模型的文本，组件点击事件可能返回整条 item 对象。

## 5. Suggestion 适合什么场景

`Suggestion` 适合在输入区附近提供补充建议，例如用户输入后出现“改写得更简洁”“补充一个例子”。它与首页的 Prompts 目标不同：Prompts 帮用户开始一项任务；Suggestion 帮用户继续完善当前任务。

给建议数据加上用途字段，页面收到点击后再决定如何处理：

```js
const suggestions = [
  { key: 'shorter', label: '改得更简洁', action: 'rewrite-shorter' },
  { key: 'example', label: '补充一个例子', action: 'add-example' }
]
```

如果建议会改变已有输入，不要直接覆盖用户文本。可以将建议结果追加到草稿、打开确认态，或者由用户选择替换。任何由 AI 生成并即将发送的文本，都应让用户能看见最终内容。

## 6. 响应式和可折叠侧栏

桌面版可使用固定宽度的侧栏，例如 `260px`，主区域使用 `minmax(0, 1fr)`。窄屏上则应把历史会话收进抽屉或可折叠菜单，消息区占满宽度，输入框始终留在可见位置。

```css
.ai-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: 100dvh;
}

.ai-layout__main {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}

@media (max-width: 768px) {
  .ai-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

侧栏、主区域和消息滚动容器的高度需要提前规划。若祖先元素是 flex/grid 子项，常常需要 `min-height: 0` 或 `min-width: 0`，否则内容会把布局撑开，滚动条也会落到整页上。

## 7. 空、加载与权限状态

页面至少要考虑以下状态：

- 新用户没有会话：展示 Welcome 和提示词。
- 会话列表正在加载：保留稳定骨架，不要突然塌陷。
- 历史为空：显示明确空态，并保留新建入口。
- 会话加载失败：显示重试操作，不能展示其他会话的消息。
- 用户无权查看该会话：清除当前消息并显示权限反馈。
- 切换会话期间：避免输入框把问题发到上一个会话。

## 8. 本篇练习

1. 用本地数组显示两个会话，并能切换活动项。
2. 空会话显示 Welcome 和两条 Prompts，点击后填入或发送对应文本。
3. 有消息的会话显示消息区，侧栏折叠时主区域正常铺满。
4. 缩窄窗口后侧栏收起，用户仍可打开会话列表并返回对话。

## 官方资料

- [Conversations](https://antd-design-x-vue.netlify.app/component/conversations)
- [Welcome](https://antd-design-x-vue.netlify.app/component/welcome)
- [Prompts](https://antd-design-x-vue.netlify.app/component/prompts)
- [Suggestion](https://antd-design-x-vue.netlify.app/component/suggestion)

## 9. 会话列表背后的状态流

实际页面至少会维护下面四类状态：

```js
const conversations = ref([])
const activeConversationId = ref(null)
const messagesByConversation = reactive(new Map())
const conversationLoadState = ref('idle')
```

`conversations` 是侧栏数据；`activeConversationId` 决定当前选择；`messagesByConversation` 保存已经读取的消息或缓存；`conversationLoadState` 用于显示初次读取、切换加载和错误。它们不一定要按这个精确结构保存，但职责不能混在一个含义不清的 `data` 变量里。

切换会话时要使用请求序号或 AbortController 防止竞态：

```js
let loadSequence = 0

async function openConversation(id) {
  activeConversationId.value = id
  const sequence = ++loadSequence
  conversationLoadState.value = 'loading'

  try {
    const messages = await api.listMessages(id)
    if (sequence !== loadSequence) return
    messagesByConversation.set(id, messages)
    conversationLoadState.value = 'ready'
  } catch (error) {
    if (sequence !== loadSequence) return
    conversationLoadState.value = 'error'
  }
}
```

假设用户先点 A，再迅速点 B；A 的网络请求可能晚于 B 返回。没有序号检查时，A 的旧响应可能把 B 的消息盖掉。真实项目还可取消旧请求，序号检查则作为最后一道保护。

## 10. 新建、重命名和删除都需要业务闭环

- 新建：先由后端创建会话并返回稳定 ID，再切换到新会话；空会话可只在本地创建，但需定义何时真正落库。
- 重命名：更新服务端标题并同步侧栏缓存，失败时恢复原标题或显示待同步状态。
- 删除：先确认影响范围；删除失败时保留列表项，不能只在前端隐藏。
- 归档：与删除分开建模，避免用户认为数据被永久清除。
- 自动标题：模型生成的标题需经过长度限制和失败兜底，不能成为会话主键。

组件通常负责显示选择状态和转发点击事件。具体 CRUD API 由页面或 store 处理，保证侧栏与当前会话消息使用同一个数据来源。

## 11. Prompts 与 Suggestion 的事件处理

Prompts 的点击回调会传递提示项相关数据。建议先记录完整回调参数，确认当前版本返回的是 item、data 包装对象还是 key，再做类型映射；不要直接猜 `event.target.innerText`。将用户可见标题、实际请求文本和业务 action 分开存：

```js
const prompts = [
  {
    key: 'explain',
    label: '解释一个概念',
    description: '先用生活例子说明，再讲技术细节',
    prompt: '请从定义、生活类比、代码示例和常见误区四部分解释：'
  }
]
```

点击后可以把 `prompt` 填入 Sender 草稿，让用户补充问题；也可以确认后立即发送。是否立即发送是产品选择，不应由组件事件回调的偶然参数形状决定。

## 12. 折叠、抽屉与窄屏

桌面侧栏可以折叠，移动端建议变为 Drawer 或全屏会话列表。转换时要保持：

- 当前活动会话仍有明显选中状态。
- 打开/关闭侧栏的按钮有可访问名称。
- 点击会话后关闭移动端抽屉并将焦点带回对话区。
- 键盘弹出后 Sender 仍可见，消息区不会被固定高度遮挡。
- 页面返回后仍能恢复会话位置和未发送草稿。

如果项目已有 Ant Design Vue 布局、主题和全局导航，AI 页面应作为其内容工作区，不要再加一层与主导航重复的品牌栏。

## 13. 调试检查顺序

1. 先检查 `items` 是否包含唯一 `key` 和可显示 `label`。
2. 再检查 `v-model` 的值是否能匹配某个 `key`。
3. 用最小点击回调确认组件发出的参数形状。
4. 查网络请求是否使用当前会话 ID。
5. 检查旧请求是否会覆盖较新的会话。
6. 最后检查空态、移动端和主题样式。

按这条顺序排查，可以避免把 API 数据问题误认为组件样式问题。
