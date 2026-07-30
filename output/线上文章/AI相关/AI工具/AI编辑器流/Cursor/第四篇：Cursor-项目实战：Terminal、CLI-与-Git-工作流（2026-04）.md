---
title: "第四篇：Cursor 项目实战：Terminal、CLI 与 Git 工作流（2026-04）"
slug: "ai-ai-cursor-cursor-terminalcli-git-84f595c7"
summary: "基于 Cursor 官方 Terminal、Shell Commands、Cursor CLI、AI Commit Message 与 AI Merge Conflicts 文档，整理接手陌生仓库时最实用的本地执行闭环。"
category: "Cursor"
tags:
  - "Cursor"
  - "Terminal"
  - "CLI"
  - "Git"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cabeba"
originalSlug: "ai-ai-cursor-cursor-terminalcli-git-84f595c7"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第四篇：Cursor 项目实战：Terminal、CLI 与 Git 工作流（2026-04）

> 本篇依据 Cursor 官方 `Terminal`、`Shell Commands`、`Cursor CLI`、`Using CLI`、`AI Commit Message`、`AI Merge Conflicts` 文档整理，资料检索时间：2026-04-14。

[[toc]]

---

## 1. 为什么把“接手陌生仓库”并到这一篇

以前把接手项目、终端命令、Shell Commands、CLI、Git 提交、合并冲突拆成很多篇，其实它们说的是同一件事：

> 当你让 Cursor 真正开始干活时，如何在本地环境里形成一个可验证、可回滚、可提交的闭环。

所以这一篇不再按按钮分，而按实际交付顺序来讲。

---

## 2. 接手陌生仓库时的最小闭环

我建议主人按下面这个顺序让 Cursor 进入项目：

1. 等索引完成
2. 先用 `Ask` 画出模块边界、启动命令、测试入口和风险点
3. 把必要规则或关键文件通过 `@` 补进上下文
4. 再切 `Agent` 改第一小块
5. 用终端验证结果
6. 最后再收敛到 Git 提交

这样做的目的不是“更谨慎”，而是避免 Cursor 在没吃到足够上下文时就开始广撒网改文件。

---

## 3. Terminal 是本地闭环里最重要的一环

官方 `Terminal` 文档里给了两个很实用的点：

- Agent 可以直接在 Cursor 原生终端里执行命令，且会保留终端历史
- 如果命令卡住，点 `Skip` 本质上就是发一个 `Ctrl+C`

另外，终端输出异常时，官方特别点名了一类常见坑：

- `Powerlevel9k / Powerlevel10k` 这类重度 shell theme 可能干扰 Agent 读取输出

官方建议用 `CURSOR_AGENT` 环境变量，在 Agent 会话里禁用花哨 prompt，只保留简单提示符。

这类细节看起来小，但非常影响“Agent 能不能稳定读懂终端结果”。

---

## 4. 终端里用自然语言生成命令，先用 `Ctrl+K`

如果你只是在本地终端里生成命令，不需要整轮 Agent 介入，官方给的入口是：

- 在 Cursor 终端中按 `Ctrl+K`

这时 Inline Edit 会结合：

- 终端最近历史
- 你的指令
- 当前 prompt 内容

来生成一条更接近你当前环境的命令。

这比“把终端问题丢给聊天框，让它猜当前目录和历史命令”要稳得多。

---

## 5. `cursor` 命令和 Cursor CLI，不是一回事

### 5.1 Shell Commands

官方 `Shell Commands` 讲的是桌面端命令行入口：

- 安装 `cursor`
- 也可以装兼容 VS Code 的 `code`

常用方式：

- `cursor file.js`
- `cursor ./my-project`
- `cursor -n`
- `cursor -w`

它解决的是“怎么从终端把项目或文件打开到 Cursor”。

### 5.2 Cursor CLI

官方 `Cursor CLI` 讲的是“直接在终端里跑 Agent”：

- `cursor-agent`
- `cursor-agent -p "..."` 做非交互式任务
- `cursor-agent resume` 续接会话
- `cursor-agent ls` 查看历史线程

官方还给了几个很关键的边界：

- CLI 仍在 beta
- 非交互模式适合脚本、CI、自动化
- CLI 会读取根目录的 `AGENTS.md` 和 `CLAUDE.md`，并和 `.cursor/rules` 一起应用
- 交互模式下跑终端命令前会向你请求批准

所以，`cursor` 是“打开编辑器”，`cursor-agent` 是“在终端里直接用 Agent 干活”。

---

## 6. Git 这块，最值得保留的是两件事

### 6.1 AI Commit Message

官方 `AI Commit Message` 功能是基于：

- 当前 staged changes
- 仓库已有 Git 历史

来生成提交信息。

使用方式很简单：

1. 先 stage 文件
2. 打开 Git 面板
3. 点提交输入框旁边的 sparkle 图标

如果团队已经使用约定式提交，官方说明 Cursor 会尽量沿用现有提交风格。

### 6.2 AI Merge Conflicts

官方也给了明确的 merge conflict 处理入口：

1. 出现冲突标记时
2. 点击 UI 里的 `Resolve in Chat`
3. Agent 读取冲突两侧内容并给出建议
4. 你再决定是否应用

这里最重要的是不要把它当成“自动无脑消冲突”。官方语义非常明确，仍然是“建议并应用”，最终决策还在人手里。

---

## 7. 我更推荐的本地工作节奏

如果主人是接手一个不熟悉的代码库，我建议把这一篇的能力连起来这样用：

1. 用 `cursor` 命令快速从终端打开项目
2. 先在编辑器里做索引与上下文准备
3. 用 `Ask` 弄清楚启动命令和验证路径
4. 让 `Agent` 改代码并在 Terminal 里验证
5. 需要快速生成命令时，终端里直接 `Ctrl+K`
6. 提交前用 AI Commit Message 收口
7. 遇到 merge conflict，再让 `Resolve in Chat` 介入

这一整套，比把“命令生成”“CLI”“Git”“冲突”拆成四五篇更符合真实工作流。

---

## 8. 官方资料

- `https://docs.cursor.com/en/agent/terminal`
- `https://docs.cursor.com/configuration/shell`
- `https://docs.cursor.com/tools/cli`
- `https://docs.cursor.com/en/cli/using`
- `https://docs.cursor.com/features/generate-commit-message`
- `https://docs.cursor.com/es/more/ai-merge-conflicts`
