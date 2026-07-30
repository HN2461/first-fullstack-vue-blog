---
title: "第六篇：Cursor 工具权限：MCP、Shell Mode 与安全边界（2026-04）"
slug: "ai-ai-cursor-cursor-mcp-shellmode-144315a1-revision-20260730"
summary: "基于 Cursor 官方 Tools、MCP、Shell Mode 与 Permissions 文档，整理 Agent 能力边界、Auto-run、allowlist 和 CLI 权限配置，帮助在扩展能力时不把风险一起放大。"
category: "Cursor"
tags:
  - "Cursor"
  - "MCP"
  - "Shell Mode"
  - "Permissions"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cabeb2"
originalSlug: "ai-ai-cursor-cursor-mcp-shellmode-144315a1"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 第六篇：Cursor 工具权限：MCP、Shell Mode 与安全边界（2026-04）

> 本篇依据 Cursor 官方 `Tools`、`Model Context Protocol (MCP)`、`Shell Mode`、`Permissions` 文档整理，资料检索时间：2026-04-14。

[[toc]]

---

## 1. 为什么这里不再把 MCP、Tools、CLI 权限拆开写

因为它们共同回答的是一个问题：

> Cursor 到底被允许做什么，做到哪一步，需要我确认还是可以自动跑。

如果只看 MCP，不看工具审批和 Shell Mode；或者只看 CLI 权限，不看 Auto-run guardrails，就很容易形成“会接工具，但不会控边界”的半套知识。

---

## 2. 先认识 Agent 的工具层

官方 `Tools` 文档把 Agent 能力分成几类：

- 搜索类
- 编辑类
- 运行类
- MCP 类

还有几个直接影响安全边界的高级选项：

- `Auto-apply Edits`
- `Auto-run`
- `Guardrails`
- `Auto-fix Errors`

官方还提到两点很实用的默认行为：

- Agent 在单个任务中没有固定工具调用次数上限
- 默认使用系统里第一个可用终端 profile，如果要稳定执行，最好提前设好首选终端

---

## 3. MCP 值得重点理解的，不是“能不能接”，而是“接了以后怎么控”

官方 `MCP` 文档确认了这几件事：

- MCP 让 Cursor 连接外部工具和数据源
- 可以在聊天界面里直接开关工具
- 工具默认需要审批
- 可以打开 `Auto-run`，让 Agent 无需逐次确认就调用 MCP 工具
- 支持需要 OAuth 的服务

这意味着 MCP 的真正价值不是“炫技”，而是把外部系统能力纳入统一的 Agent 工作流里，例如：

- 内部文档
- 项目管理系统
- 数据库
- 第三方 API

但也正因为它能碰外部系统，所以比普通代码补全更需要权限治理。

---

## 4. Shell Mode 的官方边界其实很清楚

`Shell Mode` 不是一个“能跑一切命令的终端代理”，官方限制写得很明确：

- 只适合快速、非交互命令
- 单条命令超时大约 `30` 秒
- 不适合长时间运行的服务
- 不适合交互式 prompt
- 每条命令彼此独立，`cd` 不会记忆，必须写成 `cd subdir && npm test`

还有几个非常实用的排障点：

- 输出被截断可以用 `Ctrl+O` 展开
- 卡住就 `Ctrl+C`
- 遇到允许执行提示时，可以批准一次，或者用 `Tab` 加到 allowlist

如果主人要的是“做一次状态检查、跑一个 build、看一下目录、查一个环境变量”，Shell Mode 很好；如果是“长时间 dev server、交互式安装器、需要持续驻留的任务”，它就不是对的工具。

---

## 5. CLI 权限文件该写在哪里

官方 `Permissions` 文档把 CLI 权限配置位置写得很具体：

- 全局：`~/.cursor/cli-config.json`
- 项目级：`<project>/.cursor/cli.json`

权限 token 也是结构化的，不是随便写一句自然语言：

- `Shell(commandBase)`
- `Read(pathOrGlob)`

例如：

- `Shell(git)`
- `Shell(npm)`
- `Read(src/**/*.ts)`

这类设计的好处，是你可以把“这个项目允许跑哪些命令、读哪些路径”变成明确配置，而不是靠团队口头约定。

---

## 6. 真正容易被忽视的安全边界

官方资料合起来看，有三条边界特别值得记住：

### 6.1 `.cursorignore` 不是万能隔离层

官方明确说了，终端和 MCP 这类工具调用并不会被 `.cursorignore` 彻底隔离。所以不要把“我已经 ignore 了”理解成“任何情况下都碰不到”。

### 6.2 Auto-run 很强，但一定要配 Guardrails

无论是终端命令还是 MCP 工具，只要打开自动执行，就应该同步配 allowlist 或团队策略。否则它的速度优势，会直接变成误操作放大器。

### 6.3 工具越多，越要做项目级而不是口头级治理

如果仓库里已经接入：

- MCP
- Cursor CLI
- Background Agents
- Shell Mode

那就应该把规则、权限、ignore 和团队约束写进项目，而不是靠“大家小心点”。

---

## 7. 一套够用的安全收敛建议

主人如果只想拿走一版实用配置思路，我建议这样收口：

1. 用 `.cursorignore` 挡住密钥、构建物和敏感目录
2. 用项目级 `.cursor/cli.json` 控制 CLI 权限
3. 给 Shell Mode 和 Auto-run 配 allowlist
4. 只接入可信的 MCP server，并定期检查它能访问什么
5. 把这些边界写进 `AGENTS.md` 或 `.cursor/rules`

这样做，才算真正把 Cursor 当成工程工具在用，而不是单纯聊天插件。

---

## 8. 官方资料

- `https://docs.cursor.com/agent/tools`
- `https://docs.cursor.com/en/context/mcp`
- `https://docs.cursor.com/en/cli/shell-mode`
- `https://docs.cursor.com/cli/reference/permissions`
