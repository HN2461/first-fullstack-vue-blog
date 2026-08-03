---
title: "第 03 篇：Cursor 上下文管理：Rules、Memories 与 Notepads（2026-04）"
slug: "ai-ai-cursor-cursor-rulesmemoriesnotepads-78dca392"
summary: "基于 Cursor 官方 Working with Context、Rules、Memories、@Link、@Past Chats、Notepads 与 Commands 文档，整理长期规则、项目记忆和临时上下文的分层治理方法。"
category: "Cursor"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "AI编辑器流"
  - "Cursor"
tags:
  - "Cursor"
  - "Rules"
  - "Memories"
  - "Notepads"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabe96"
originalSlug: "ai-ai-cursor-cursor-rulesmemoriesnotepads-78dca392"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.582Z"
updatedAt: "2026-07-31T11:16:25.581Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 03 篇：Cursor 上下文管理：Rules、Memories 与 Notepads（2026-04）

> 本篇依据 Cursor 官方 `Working with Context`、`Rules`、`Memories`、`@Link`、`@Past Chats`、`Notepads`、`Commands` 文档整理，资料检索时间：2026-04-14。

[[toc]]

---

## 1. 先把“上下文”拆成两半

官方 `Working with Context` 文档把上下文分成两类，这个拆法非常值得记住：

- `Intent context`：你希望它怎么做，例如规则、目标、限制
- `State context`：现在世界是什么样，例如代码、报错、日志、链接、文件

很多人觉得 Cursor “会跑偏”，其实往往不是模型不行，而是这两类上下文只给了一半。

---

## 2. Rules 现在推荐怎么分层

官方当前对规则的主推方案已经很明确：

### 2.1 Project Rules

- 放在 `.cursor/rules`
- 受版本控制
- 可以按目录或匹配模式做作用域
- 适合写项目规范、架构约束、模板流程

官方还给了四种规则类型：

- `Always`
- `Auto Attached`
- `Agent Requested`
- `Manual`

### 2.2 User Rules

- 配在个人设置里
- 全局生效
- 适合回复风格、个人代码偏好这类“人设级”偏好

### 2.3 AGENTS.md

这一点非常关键。官方现在已经把 `AGENTS.md` 纳入规则体系里，作为 `.cursor/rules` 的简单替代方案：

- 纯 Markdown
- 适合简单项目说明
- 当前限制是根目录单文件、没有复杂作用域

### 2.4 `.cursorrules`

官方仍然兼容，但已经明确标成 `Legacy`。如果还在新项目里从零上 `.cursorrules`，就不太划算了。

---

## 3. Memories 解决的是“会话之间别失忆”

Rules 负责长期制度，`Memories` 负责把项目中值得保留的经验逐步留下来。

官方 `Memories` 文档里有两个要点：

- `Memories` 是项目级的，不是全局漫灌
- 后台 sidecar 会从对话中抽取可能值得保留的记忆，但需要你的批准后才会保存

除此之外，Agent 也可以在你明确要求时，把信息写成记忆。管理入口在 `Cursor Settings -> Rules`。

我的建议是：

- 长期稳定、希望团队共享的，写 `Rules`
- 会随着项目推进逐步形成、但不一定值得单独建规则的，交给 `Memories`

---

## 4. 临时上下文，优先用更“手术刀式”的方式给

官方非常强调 `@` 符号提供精确上下文。不要什么都靠 Agent 自己猜。

### 4.1 文件和目录

最常见的是：

- `@code`
- `@file`
- `@folder`
- `@Files & Folders`

如果打开了 `Full Folder Content`，Cursor 会尽量把整个目录内容塞进上下文；但官方也提醒，目录越大、尤其在 `Max Mode` 下，输入 token 成本会明显增加。

### 4.2 网页和 PDF

`@Link` 是这轮官方资料里我很建议保留的一项：

- 直接粘贴 URL，Cursor 会自动把它标成 `@Link`
- 公开可访问的 PDF 也会自动解析文本
- 如果只是想贴纯文本链接，可以点 `Unlink`，或者粘贴时按住 `Shift`

### 4.3 历史对话

`@Past Chats` 适合下面几种情况：

- 上一轮已经分析过架构，不想从零再讲一遍
- 另一个标签页里已经做过方案对比
- 想把旧会话的决策摘要带进新任务

---

## 5. Notepads 和 Commands，适合“可复用但又没必要重武装”的内容

### 5.1 Notepads

官方把 `Notepads` 标成 `Beta`，并明确提示未来可能被移除，所以这次不再单独给它一篇。

它现在更适合做的是：

- 在 composer 和 chat 之间共享上下文
- 放文档、规则草稿、流程说明
- 挂附件
- 用 `@` 方式复用

它的定位更像“轻量可复用资料夹”，而不是长期制度中心。

### 5.2 Commands

`Commands` 也还在 beta，但非常适合团队把高频 prompt 变成可复用工作流：

- 放在 `.cursor/commands`
- 每个命令就是一个 Markdown 文件
- 输入 `/` 就能触发

像下面这类场景就很适合命令化：

- 代码审查清单
- 接手新模块的调研模板
- 跑测试并修失败
- 地址 GitHub PR 评论

---

## 6. 一套更稳的上下文治理顺序

如果主人想把这堆概念压成简单可执行的方案，我建议这样分层：

1. `Rules`：写长期稳定、希望团队共享的硬约束
2. `AGENTS.md`：给中小项目写一份简单、易读的入口说明
3. `Memories`：保留项目演进中逐步沉淀出来的“软经验”
4. `@file / @folder / @Link / @Past Chats`：按任务临时补最相关的状态上下文
5. `Notepads / Commands`：把高频但还不值得重武装成完整规则体系的内容沉淀下来

这也是这次缩编后我认为最适合中文读者的理解路径。

---

## 7. 官方资料

- `https://docs.cursor.com/en/guides/working-with-context`
- `https://docs.cursor.com/en/context`
- `https://docs.cursor.com/es/context/memories`
- `https://docs.cursor.com/context/%40-symbols/%40-link`
- `https://docs.cursor.com/context/%40-symbols/%40-past-chats`
- `https://docs.cursor.com/beta/notepads`
- `https://docs.cursor.com/en/agent/chat/commands`
