---
title: "第 03 篇：CatPaw AI 助手使用指南"
slug: "ai-ai-catpaw-catpaw-ai-87736891"
summary: "按公开用户手册梳理 CatPaw 侧边栏 AI 助手的真实用法，重点讲清 Ask、Agent、自定义 Agent、工具列表和对话管理。"
category: "CatPaw"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "AI编辑器流"
  - "CatPaw"
tags:
  - "CatPaw"
  - "Ask"
  - "Agent"
  - "自定义 Agent"
  - "AI 助手"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabe62"
originalSlug: "ai-ai-catpaw-catpaw-ai-87736891"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.574Z"
updatedAt: "2026-07-31T11:16:25.559Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 03 篇：CatPaw AI 助手使用指南
CatPaw 的“AI 助手”公开文档里主要指的是侧边栏对话体系。  
它不是单一模式，而是三套工作方式：

- `Ask`
- `Agent`
- `自定义 Agent`

## 1. 先会打开侧边栏

公开手册里最常用的打开方式是：

- `Cmd + L`
- 或菜单 `View -> Appearance -> Secondary Side Bar`

另外还支持多标签对话：

- `Command + Shift + T`

这个设计挺重要，因为真实开发经常会同时存在几类任务：

- 一个标签专门问思路
- 一个标签专门跑 Agent 改代码
- 一个标签单独调某个 bug

## 2. Ask、Agent、自定义 Agent 到底差在哪

| 模式 | 公开定位 | 适合什么 | 不适合什么 |
| --- | --- | --- | --- |
| Ask | 智能问答助手 | 读代码、问思路、做方案、单文件生成 | 需要它主动改很多文件、跑命令 |
| Agent | 全能执行助手 | 重构、多文件修改、终端执行、端到端任务 | 只想快速问一句时略重 |
| 自定义 Agent | 个性化工作流 | 限制工具、定制 System Prompt、团队私有流程 | 完全不想配时 |

一句大白话记忆：

- `Ask` 像“懂代码的老师傅”
- `Agent` 像“真下场干活的搭档”
- `自定义 Agent` 像“你自己定规矩的专属员工”

## 3. Ask 模式：主打只读探索，先想清楚再动手

官方手册把 Ask 模式定义得很明确：

- 代码探索与理解
- 采用“只读”工作方式
- 不会自动改代码库

### 适合的场景

- 接手陌生项目，先问架构
- 定位 bug 思路
- 让 AI 帮你做方案规划
- 学某个设计模式或最佳实践

### 代码怎么落地

Ask 不是完全不能改代码，它是：

- 先生成建议
- 你手动 `Apply`
- 再决定 `Accept` 还是 `Reject`

公开手册写了几种采纳粒度：

- `Accept all`
- 按文件 `Accept`
- 按 diff 片段 `Accept`

还有几个很实用的点：

- `ReApply`：重新应用修改
- `Command + Z`：支持逐步回撤
- 可打开 `Codebase 检索`

所以 Ask 的气质就是：

> 先讨论，再手动落地，强调可控。

## 4. Agent 模式：能读、能写、能搜、能跑

官方手册对 Agent 模式的描述比 Ask 更强：

- 自主探索代码库
- 阅读文档
- 浏览网页
- 编辑文件
- 运行终端命令

### 适合的任务

- 新建工程
- 多文件重构
- 新功能开发
- 自动化处理重复任务

### 官方公开的关键配置

Agent 模式页面里，比较值得记住的是这些配置：

- `Default Docs`：默认带入文档上下文
- `Auto-run`：自动运行终端命令
- `Auto-fix`：自动修复 Linter Errors
- `Current File`：自动把当前打开文件带入上下文
- `传递项目结构`：把简化项目树放进上下文
- `To-do List`：复杂任务自动拆分待办

### Auto-run 要怎么看

公开手册写得很谨慎：

- 并不是所有命令都会自动执行
- 高风险命令会被拦
- 还受“允许自动运行的命令”“禁止自动运行的命令”影响
- 可以开启“删除文件防护”

这说明 CatPaw 的 Agent 虽然能执行命令，但官方公开策略并不是“无脑全放开”。

## 5. 自定义 Agent：把 AI 助手训成你想要的样子

这个功能是当前公开手册里很值得关注的一块。

你可以在模式选择里点 `add mode` 新建自定义模式，然后配置：

- 模式名称
- 唤起快捷键
- `Default Docs`
- 启用哪些 `Tools`
- `Auto-run`
- `Auto-fix`
- `System Prompt`

官方手册还专门举了一个很实际的例子：

- 如果你不希望模型联网搜索，可以关掉 `Web Search`

这类配置的价值很大，因为它直接决定：

- 要不要更快
- 要不要更稳
- 要不要更少外部噪音

## 6. Agent 到底有哪些公开工具

工具列表页已经把公开能力讲得比较清楚了，可以记成 4 组。

### 文件操作类

- `Edit - Write`
- `Search - Read File`
- `Edit - Delete File`
- `Edit - Multi Edit`

### 搜索类

- `Search - Codebase`
- `Search - Grep`
- `Search - Glob File Search`
- `Search - List Directory`

### 终端类

- `Run - Terminal`

### 其他扩展类

- `Search - Web Search`
- `Search - Fetch Rules`
- `MCP Tools`
- `Ask Question`

这里有个很重要的判断：

- 公开手册强调的是“工具能力”
- 不是一堆固定 CLI 子命令

所以主人如果看见以前那种“catpaw create:xxx”“catpaw deploy:xxx”式写法，优先怀疑是不是把别的产品想象进来了。

## 7. 对话管理也不是小功能

公开手册还写了几块容易被忽略但非常实用的能力：

- 最近 `30 天` 历史对话
- 收藏对话
- 复制对话 ID
- `Checkpoint` 回退
- 基于某个节点分叉出新对话

这几项真正值钱的地方不在“花哨”，而在于：

- 好的 prompt 可以沉淀
- 长对话不会越聊越乱
- 复杂方案可以分叉比较
- 改坏代码还能回退

## 8. 快捷菜单怎么用更顺

选中代码后，CatPaw 会弹快捷菜单。  
公开手册列出的高频按钮有：

- `Edit`
- `Chat`
- `重构`
- `注释`
- `找 Bug`
- `解释`
- `单测`

还有一组 `/` 命令：

- `/ -> Clear`
- `/ -> New`
- `/ -> Prompt`

如果主人平时喜欢“选中一段直接处理”，这套入口会比重新组织大段 prompt 更顺手。

## 9. 怎么选模式最省时间

一个很实用的经验是：

- 不确定问题本质时，先 `Ask`
- 已经明确要落地时，上 `Agent`
- 团队有固定规则时，做一个 `自定义 Agent`

这样能避免两种浪费：

- 小题大做，动不动开重型 Agent
- 大题小做，明明要跨文件还一直在 Ask 里聊天

## 10. 这一篇最该背下来的话

> Ask 负责理解和规划，Agent 负责执行和落地，自定义 Agent 负责把团队规范固化成默认工作流。

## 公开资料来源

- 用户手册-侧边栏对话概览：https://catpaw.meituan.com/guides/sidebar-chat/overview
- 用户手册-Ask 模式：https://catpaw.meituan.com/guides/sidebar-chat/ask-mode
- 用户手册-Agent 模式：https://catpaw.meituan.com/guides/sidebar-chat/agent-mode
- 用户手册-自定义 Agent：https://catpaw.meituan.com/guides/sidebar-chat/custom-agent
- 用户手册-工具列表：https://catpaw.meituan.com/guides/sidebar-chat/toollist
- 用户手册-对话管理：https://catpaw.meituan.com/guides/sidebar-chat/conversation
- 用户手册-快捷方式：https://catpaw.meituan.com/guides/sidebar-chat/shortcuts
