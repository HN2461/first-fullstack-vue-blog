---
title: "第五篇：Cursor 协作自动化：Background Agents、Bugbot、GitHub 与 Slack（2026-04）"
slug: "ai-ai-cursor-cursor-backgroundagents-bugbot-github-slack-a20b2f89-revision-20260730"
summary: "基于 Cursor 官方 Background Agents、GitHub、Bugbot 与 Slack 文档，整理异步 Agent、PR 审查和跨工具协作的最新主线，避免把同一条自动化链路拆成太多碎片文章。"
category: "Cursor"
tags:
  - "Cursor"
  - "Background Agents"
  - "Bugbot"
  - "GitHub"
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291d8a2b1c68f2cabea4"
originalSlug: "ai-ai-cursor-cursor-backgroundagents-bugbot-github-slack-a20b2f89"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 第五篇：Cursor 协作自动化：Background Agents、Bugbot、GitHub 与 Slack（2026-04）

> 本篇依据 Cursor 官方 `Background Agents`、`GitHub`、`Bugbot`、`Slack` 文档整理，资料检索时间：2026-04-14。

[[toc]]

---

## 1. 为什么把这四个主题合并到一起

因为它们本质上都在讲同一件事：

> 不在你本地前台窗口里，如何让 Cursor 异步接任务、接上下文、改代码、发 PR、回消息。

以前把 Background Agents、GitHub、Bugbot、Slack 分别写成多篇，容易看完一篇还不知道另外三篇怎么串起来。现在直接按协作链路来讲。

---

## 2. Background Agents 适合什么任务

官方对 `Background Agents` 的定义非常明确：

- 异步
- 远程环境
- 可以编辑和运行代码
- 你可以随时查看状态、追加 follow-up 或接管

当前官方资料里最值得记住的几件事：

- 默认跑在隔离的 Ubuntu 机器上
- 有互联网访问能力
- 会从 GitHub 克隆仓库
- 在独立分支上工作，再把结果推回仓库
- 需要几天量级的数据保留
- 只支持 `Max Mode-compatible` 的模型

如果任务需要十几分钟、需要远程环境、或者你不想占住本地前台窗口，它就比本地 Agent 更合适。

---

## 3. `.cursor/environment.json` 决定远程环境像不像你的项目

官方把环境配置集中到 `.cursor/environment.json`，而且明确建议把它提交进仓库。

官方文档里重点强调了三类配置：

- `install`：每次机器初始化前都要能重复执行的依赖安装
- `start`：机器启动后要先拉起的基础环境，例如 docker 服务
- `terminals`：Agent 工作时需要一直活着的后台进程，例如 `npm run dev`

这也是为什么我不建议把 Background Agents 理解成“云上开一个聊天框”。它更接近“远程开发机 + Agent”。

---

## 4. GitHub 是这条链路里的主干

官方 `GitHub` 集成页说得很清楚：

- Background Agents 和 Bugbot 都依赖 Cursor GitHub App
- 可以选择 `All repositories` 或 `Selected repositories`
- 权限按最小必要原则给

集成之后，GitHub 里的一个核心玩法就成形了：

- 在 PR 或 Issue 里评论 `@cursor [prompt]`
- 如果已经启用 Bugbot，还可以评论 `@cursor fix`

这意味着 GitHub 不再只是“看结果”，而变成了可以直接驱动后台 Agent 的入口。

---

## 5. Bugbot 的定位，不是第二个 Agent

`Bugbot` 的核心职责很明确：

- 审 PR diff
- 找 bug、安全问题、代码质量问题
- 自动评论
- 也支持手动触发

官方当前文档确认的触发方式包括：

- PR 更新后自动运行
- 评论 `cursor review`
- 评论 `bugbot run`
- 评论 `cursor run`

它和普通 Agent 的最大区别，是它站在“代码审查者”而不是“执行者”的位置。

另外一个很值得保留的官方细节，是 `.cursor/BUGBOT.md` 的层级规则：

- 根目录 `.cursor/BUGBOT.md` 总会带上
- 还会从改动文件所在目录向上逐层收集更多 `BUGBOT.md`

也就是说，Bugbot 适合写“审查规则”，不是写通用开发规则。

---

## 6. Slack 适合做什么，不适合做什么

官方 Slack 集成页把它定义为：

- 在 Slack 里通过 `@Cursor` 直接驱动 Background Agent

安装后，官方要求你在配置里确认几件事：

- GitHub 已连接
- 默认仓库已选好
- usage-based pricing 已开启
- 隐私设置已确认

然后就可以在 Slack 里这样用：

- `@Cursor fix the login bug`
- `@Cursor [repo=org/repo] fix bug`
- `@Cursor list my agents`

Slack 的价值不是替代 IDE，而是把“发起任务、看状态、收 PR 链接、做轻量跟进”这部分搬到团队沟通流里。

---

## 7. 现在该怎么选：本地 Agent、Background Agent、Bugbot 还是 Slack

我建议主人这样判断：

- 需要立即协作、需要看文件和终端，就在本地用 `Agent`
- 任务耗时长、要异步跑、要走 GitHub 分支和 PR，就用 `Background Agents`
- 目标是审查 PR，而不是自己写功能，就用 `Bugbot`
- 团队希望在沟通流里发起或追踪异步任务，就用 `Slack`

四者不是竞争关系，而是一条自动化链路上的不同节点。

---

## 8. 官方资料

- `https://docs.cursor.com/en/background-agents`
- `https://docs.cursor.com/en/github`
- `https://docs.cursor.com/en/bugbot`
- `https://docs.cursor.com/es/integrations/slack`
