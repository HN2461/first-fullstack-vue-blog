---
title: "Ant Design X Vue 入门与豆包式 AI 对话页面开发路线"
slug: "ant-design-x-vue-learning-roadmap"
summary: "面向 Vue 初学者，从组件库定位、环境检查、页面分层到消息流和安全接入，逐步搭建可扩展的 AI 对话网页。"
category: "Ant Design X Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design X Vue"
tags:
  - "Ant Design X Vue"
  - "Vue 3"
  - "AI 对话"
  - "前端组件库"
status: "published"
sortOrder: 10
cover: ""
originalId: "6ad4b44660ceaba3ef6d31f2"
originalSlug: "ant-design-x-vue-learning-roadmap"
originalStatus: "published"
publishedAt: "2026-10-18T11:57:58.676Z"
updatedAt: "2026-10-18T11:57:58.722Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# Ant Design X Vue 入门与豆包式 AI 对话页面开发路线

这组文章面向第一次接触 Ant Design X Vue 的 Vue 开发者。目标不是把每个组件 API 背下来，而是能看懂组件职责，知道先做什么、把状态放在哪里、怎样安全地连接模型服务，并能逐步做出具有侧栏、对话区、消息操作和输入区的 AI 助手网页。

## 先弄清楚它是什么

Ant Design X Vue 是面向 AI 产品界面的 Vue 组件库。它提供对话场景常用的交互部件，例如消息气泡、消息列表、会话列表、欢迎区、提示词、发送框、附件和操作按钮。它重点解决“AI 对话界面怎么呈现和交互”，不负责替你选择大模型，也不会自动提供账号、数据库、会话存储、权限或业务接口。

一个可上线的豆包式网页通常由三层拼起来：

| 层 | 主要工作 | 常见技术 |
| --- | --- | --- |
| 页面与基础工作台 | 顶栏、侧栏、布局、路由、主题、登录态 | Vue 3、Vue Router、Ant Design Vue |
| AI 对话交互 | 气泡、输入框、欢迎提示、会话选择、消息操作 | Ant Design X Vue |
| 业务与模型服务 | 用户会话、历史消息、流式生成、模型密钥、审计和限流 | Express 等后端、MongoDB、模型服务商 API |

可以把组件库理解成“对话界面的零件和交互约定”，而不是完整的 AI 应用。项目组仍需设计数据结构、服务端接口和页面整体布局。

## 阅读顺序

1. [安装、版本检查与第一个对话页面](/articles/ant-design-x-vue-install-first-chat-page)：确认 Vue 和 Ant Design Vue 版本，安装组件并跑通静态界面。
2. [豆包式页面布局与欢迎区、会话列表、提示词](/articles/ant-design-x-vue-page-layout-conversations-prompts)：把组件放到合理的页面区域，明确哪些状态由业务页面维护。
3. [消息气泡、Markdown、代码块与消息操作](/articles/ant-design-x-vue-bubble-markdown-actions)：设计用户消息和 AI 回复的样式、内容渲染和操作反馈。
4. [Sender 输入框、附件与发送体验](/articles/ant-design-x-vue-sender-attachments-submit)：处理输入、提交、停止、文件选择和不可用状态。
5. [useXChat、流式响应与安全的模型接入](/articles/ant-design-x-vue-streaming-chat-api-security)：将组件连接到后端，理解 SSE、失败恢复、会话持久化和密钥安全。

建议先完成前两篇的静态界面，再接入真实模型。这样视觉结构和业务请求不会同时出错，排查起来更容易。

## 开始前要会什么

不需要先成为专家，但下面这些基础会在实战中反复出现：

- Vue 单文件组件的 `<script setup>`、`<template>` 和 `ref`。
- Props 与事件：父组件通过 props 传数据，子组件通过事件通知用户操作。
- 数组更新：新消息到来时创建新数组或更新对应消息，而不是只改一个临时变量。
- Promise、`async/await` 和 `try/catch`：网络请求是异步的，失败也必须处理。
- HTTP 请求的基本概念：请求方法、请求体、响应状态码和鉴权信息。

遇到不懂的属性时，先搜索本组文章中的组件名，再到官方对应版本文档查看 Props、Events、Slots 和示例。不要直接复制 React 版 Ant Design X 的代码，Vue 的组件、事件绑定和响应式写法都不同。

## 组件快速地图

| 豆包式页面区域 | 首选组件或能力 | 页面仍需自己实现的内容 |
| --- | --- | --- |
| 左侧历史会话 | `Conversations` | 创建会话、删除、重命名、分页和权限校验 |
| 新会话欢迎区 | `Welcome`、`Prompts`、`Suggestion` | 首页文案、推荐问题来源、点击后的业务动作 |
| 消息时间线 | `Bubble` 或 `Bubble.List` | 消息模型、滚动区域高度、空态和历史分页 |
| 用户输入区 | `Sender` | 调用后端、输入限制、上传策略、发送中状态 |
| 回复旁边的操作 | `Actions` | 复制、重新生成、点赞、反馈接口 |
| 全局交互配置 | `XProvider` | 应用路由、权限和 Ant Design Vue 的基础布局 |
| 请求与消息状态 | `useXAgent`、`useXChat`、`XRequest` | 后端接口、鉴权、数据落库与重连策略 |

不要把所有内容都塞到一个组件。页面容器负责布局和会话切换；对话面板负责显示当前会话消息；消息气泡负责呈现单条消息；输入组件负责采集内容并发出“提交”事件；请求层负责与后端通信。

## 本项目的技术背景

本项目使用 Vue 3、Vite 和 Ant Design Vue。执行本文调研时，前端依赖为 Vue `3.5.21` 和 Ant Design Vue `4.2.6`；npm 上 Ant Design X Vue 当前版本 `1.6.0` 声明 Vue `>=3.5.0`、Ant Design Vue `>=4.0.0`。版本条件表面兼容，但本仓库还没有安装 `ant-design-x-vue`，所以添加依赖前仍应在独立分支执行安装、构建和关键组件试用，再由团队决定是否进入主应用。

不要只因为某个最小示例能显示，就认为适合直接合入工作台。还要检查主题变量、暗色模式、移动端、路由切换、滚动容器、无障碍、包体积和现有 Ant Design Vue 组件的视觉一致性。

## 这组教程的完成标准

读完并动手后，你应该可以：

- 解释 Ant Design X Vue、Ant Design Vue、Vue 和模型后端各自负责什么。
- 使用项目要求的版本完成安装，并知道怎样从 `package.json` 和 `npm view` 检查依赖条件。
- 将会话列表、欢迎提示、消息列表和输入框组合成一个可操作的界面。
- 用一份明确的消息数据结构显示用户消息、AI 流式回复、错误和重试状态。
- 从浏览器通过自己的后端访问模型，不把模型密钥放进 Vue 包。
- 在发布前验证键盘操作、窄屏布局、长回复、超长代码块、空会话和网络失败。

## 官方资料与版本核对

- [Ant Design X Vue 官方文档](https://antd-design-x-vue.netlify.app/)
- [组件总览](https://antd-design-x-vue.netlify.app/component/overview)
- [官方 GitHub 仓库](https://github.com/wzc520pyfm/ant-design-x-vue)
- [npm 包信息](https://www.npmjs.com/package/ant-design-x-vue)
- [Ant Design Vue 文档](https://www.antdv.com/components/overview-cn)
- [Ant Design X React 文档](https://x.ant.design/index-cn)，只用于了解设计思路，不要照搬 React 代码。

库仍可能更新。教程中的 API 以查阅当日的 Vue 官方文档和项目锁定版本为准。开始开发新功能前，先从 `package-lock.json` 确认实际安装版本。
