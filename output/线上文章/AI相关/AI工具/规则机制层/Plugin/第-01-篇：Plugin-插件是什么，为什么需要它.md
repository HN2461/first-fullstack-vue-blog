---
title: "第 01 篇：Plugin 插件是什么，为什么需要它"
slug: "ai-plugin-plugin-da2ad951"
summary: "解释 Plugin 与 Skill、MCP、Rules 的分工，按 2026-11-18 官方资料补充 Cursor 插件、Agent Plugins 1.0.0 及产品格式兼容边界。"
category: "Plugin"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Plugin"
tags:
  - "Plugin"
  - "插件"
  - "Codex"
  - "Claude Code"
  - "Skill"
  - "MCP"
  - "扩展机制"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cabfcc"
originalSlug: "ai-plugin-plugin-da2ad951"
originalStatus: "published"
publishedAt: "2026-05-24T14:18:17.434Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 01 篇：Plugin 插件是什么，为什么需要它


> 核验日期：2026-11-18。本文更新 Cursor 独立插件体系、Agent Plugins 开放格式及 Codex CLI；概念与产品实现分别说明。

[[toc]]

---

## 一、从一个真实的痛点说起

你在 Claude Code 或 Codex 里精心配置了一套代码审查工作流：

```text
.claude/
├── commands/
├── agents/
├── hooks/
└── .mcp.json
```

或者在 Codex 侧分散成：

```text
~/.agents/skills/
~/.codex/config.toml
plugins/<name>/
```

这些内容合在一起是一套完整工作流，但**文件分散、同步困难、团队难复用**。问题通常会表现为：

- 团队成员需要手动复制多个目录和配置
- 更新一次工作流，要通知所有人分别修改
- 换项目后，还得重新拼一遍环境
- 内容能共享，但缺少统一安装、升级和版本化入口

当 AI 工具的扩展能力越来越多，问题就不再是"有没有这个功能"，而是：

- **这套能力怎么打包**
- **别人怎么安装**
- **后续怎么升级**
- **团队怎么统一**

Plugin 解决的，正是这件事。

---

## 二、Plugin 是什么

更稳妥的定义是：

> **Plugin 是一种把多种扩展能力组织成可安装、可分发、可复用单元的机制。**

它本质上不是新的基础能力，而是一个**打包与分发层**。真正被打包进去的，往往还是你已经熟悉的内容：

- Skills
- MCP 配置或应用集成
- Commands
- Hooks
- Subagents / Agents
- 以及工具各自支持的其他组件

最直观的类比：

| 机制 | 类比 |
| --- | --- |
| Rules | 员工手册：按作用域与触发条件加载的规范 |
| Skill | 操作菜谱：某个任务的流程模板 |
| MCP | 工具连接层：让模型接入外部系统 |
| **Plugin** | **可安装工具包：把多种能力装进一个包里统一分发** |

用一个抽象例子表示，一个插件目录大概会长这样：

```text
my-plugin/
├── skills/
├── commands/
├── hooks/
├── agents/
├── .mcp.json 或 .app.json
└── manifest / plugin.json
```

不同工具的具体文件名并不完全一样：

- Codex 常见的是 `.codex-plugin/plugin.json`
- Claude Code 常见的是 `.claude-plugin/plugin.json`
- 有些工具即使支持插件，也会允许"没有 manifest，按默认目录自动发现"

所以写文章时最好把**概念层**和**工具实现层**分开说。

---

## 三、Plugin 解决的核心问题

### 3.1 功能分散 -> 统一打包

一套工作流可能同时包含：

- 2 个 Skill
- 1 个 MCP 集成
- 3 个命令
- 1 个 Hook
- 1 个审查代理

单个能力本身不复杂，难的是它们散落在多个位置。Plugin 的价值，就是把这些零件收束成一个**可安装单元**。

### 3.2 分享困难 -> 原生安装流程

没有 Plugin 时，你常见到的是：

| 没有 Plugin | 有 Plugin |
| --- | --- |
| 给同事发一串复制路径 | 通过工具原生安装流程启用 |
| 版本靠口头同步 | 可以显式版本化或按提交更新 |
| 换项目重配一遍 | 复用现成插件包 |

这里有一个很重要的细节：

> **"一键安装"不是所有工具都长得一样。**

比如：

- Claude Code 常见是 `/plugin install ...`
- Codex 当前公开 CLI 支持 `codex plugin add/list/remove`，并通过 `codex plugin marketplace ...` 管理来源；安装版本应先检查 `--help`

不要把不同工具的命令体系混成一套。

### 3.3 跨项目复用

如果一个能力包是面向"前端项目通用工作流"、"团队代码审查"、"设计协作"、"文档产出"这类场景，它天然适合跨项目复用。Plugin 恰好给了这类复用一个更稳定的载体。

### 3.4 生态共建

当工具提供 marketplace、官方仓库、社区仓库或远程源时，Plugin 就不再只是"我机器上的私人配置"，而会变成一种可传播、可审查、可维护的生态对象。

---

## 四、Plugin vs Skill：最容易混淆的区分

这是最容易写混的一组概念。

| 维度 | Skill（技能） | Plugin（插件） |
| --- | --- | --- |
| **本质** | 某个任务的流程模板 | 多能力的打包与分发单元 |
| **内容规模** | 通常围绕一个任务 | 可以包含多个 Skill 和其他组件 |
| **定位** | 更偏任务执行 | 更偏安装、共享、复用 |
| **分发方式** | 可用 Git / 模板仓库共享，但通常没有统一原生 marketplace | 通常有工具原生安装和 marketplace 语义 |
| **版本感知** | 往往靠 Git 或人工维护 | 更容易和工具原生版本、启用状态、更新流程结合 |
| **适用场景** | 单任务、单流程、单团队约定 | 团队标准能力包、跨项目复用、社区发布 |

一句话总结：

> **Skill 更像“做这件事的方法”，Plugin 更像“把这套方法和配套能力安装进去的包”。**

一个 Plugin 可以包含多个 Skill，但 Skill 不等于 Plugin。

---

## 五、Plugin vs MCP：定位差异

| 维度 | MCP | Plugin |
| --- | --- | --- |
| **核心问题** | 模型如何连接外部能力 | 多种能力如何打包、安装、分发 |
| **关注点** | 协议、工具暴露、资源访问 | 目录、manifest、marketplace、启用与升级 |
| **包含关系** | 可独立存在 | 往往可以打包 MCP 配置或应用集成 |
| **抽象层级** | 能力接入层 | 包装与分发层 |

最简短的判断线：

- **要让 AI 连上外部系统** -> 优先想 MCP
- **要把现有能力打包并统一分发** -> 优先想 Plugin

Plugin 可以包含 MCP，但 Plugin 不是 MCP 的替代品。

---

## 六、Plugin vs Rules：互补关系

| 维度 | Rules | Plugin |
| --- | --- | --- |
| **生效方式** | 按宿主作用域、文件范围或显式触发加载 | 安装后按工具原生方式启用 |
| **内容性质** | 规范、约束、偏好 | 能力包、工作流、集成组合 |
| **适合放什么** | 命名规范、提交规范、技术栈要求 | 审查流、部署流、设计协作、第三方集成 |
| **变化频率** | 相对稳定 | 更适合迭代更新 |

它们通常是互补关系：

- Rules 告诉 AI："我们团队怎么做事"
- Plugin 给 AI："你现在可以用哪些打包好的能力"

---

## 七、四大扩展机制全景对比

| 机制 | 定位 | 典型内容 | 分享方式 | 更适合什么 |
| --- | --- | --- | --- | --- |
| **Rules** | 静态规则层 | Markdown 规范文档 | Git 提交共享 | 长期约束 |
| **MCP** | 外部能力接入层 | server、tools、resources、prompts | 配置共享 | 连外部系统 |
| **Skill** | 单任务流程层 | `SKILL.md` + 辅助资源 | Git / 模板仓库 / 插件打包 | 一个任务怎么做 |
| **Plugin** | 打包与分发层 | Skill、Commands、Hooks、集成、配置 | marketplace / 原生安装流程 | 多能力复用与统一分发 |

一条最实用的判断线：

- **总是要生效的规范** -> 写 Rules
- **某个任务的标准做法** -> 写 Skill
- **需要外部服务连接** -> 配 MCP
- **要把多能力组合起来给别人安装** -> 做 Plugin

---

## 八、主流插件体系与新的开放格式

截至 2026-11-18，本次官方资料能够确认：

| 工具/规范 | manifest 与入口 | 已核对的范围 |
| --- | --- | --- |
| Codex 官方插件示例 | `.codex-plugin/plugin.json`；`codex plugin` CLI | Skills、MCP、应用和其他配套组件；具体入口依客户端版本 |
| Claude Code | `.claude-plugin/plugin.json`，可省略；`/plugin` 或 `claude plugin` | Skills、agents、hooks、MCP、LSP 等；支持本地开发和 marketplace |
| Cursor | `.cursor-plugin/plugin.json`；Customize / Marketplace | 独立插件体系，可组合 rules、skills、agents、commands、MCP、hooks |
| Agent Plugins 开放格式 | 根目录 `plugin.json` | 可移植核心包含 Skills 与 MCP，产品扩展另行定义 |

旧版“Cursor 没有独立 Plugin 体系”已不适用。Cursor 官方当前明确同时支持 Agent Plugins 与 Cursor Plugins；两种格式的扩展范围不同。

Agent Plugins 官方规范本次显示版本 **1.0.0**。它的核心 manifest 在插件根目录，MCP 文件为 `mcp.json`，与产品专属的 `.mcp.json` 并非可随意互换的拼写。规范中的扩展命名空间用于客户端专属能力，不能把各产品 manifest 全部合并成一个“万能 JSON”。

即使客户端支持开放格式，仍可能有实现差异。例如 Cursor 文档明确说明，MCP 配置中不展开标准的 `${PLUGIN_ROOT}`、`${PLUGIN_DATA}`，当前使用 `${CURSOR_PLUGIN_ROOT}`。迁移时应逐项核对变量和组件，而不是仅改目录名。

Kiro、Devin/Windsurf 等产品应按各自当前文档选择 Skills、Rules、Workflows、hooks 和 MCP。本次没有用足够完整的插件资料为它们下“永远没有插件”的否定结论。

---

## 九、什么内容适合做成 Plugin

### 适合的

- **完整开发工作流**：代码审查 + 测试 + 部署检查 + 文档生成
- **跨项目复用能力包**：前端组件开发、设计协作、数据分析、文档产出
- **团队标准能力组合**：统一命令、统一 Hook、统一集成方式
- **第三方服务集成包**：Slack、GitHub、Notion、Figma、云平台协作能力

### 不太适合的

- **只有一条静态规则**：直接写 Rules 更简单
- **只有一个独立外部连接**：先配 MCP
- **只在当前仓库短期使用的一次性流程**：单独写 Skill 往往更轻

---

## 十、本系列后续内容

- **第二篇**：Codex Plugin 体系详解与实战
  会重点讲 `.codex-plugin/plugin.json`、官方 `openai/plugins` 仓库、`codex plugin add/list/remove` 与 marketplace 管理
- **第三篇**：Claude Code Plugin 体系详解与实战
  会重点讲 `/plugin` 命令族、official / community / demo marketplace、scope 与 manifest
- **第四篇**：Plugin vs Skill vs MCP vs Rules 选型指南与团队落地
  会把四种机制放回工程视角，回答"到底什么时候该升级成 Plugin"

---


## 参考资料（2026-11-18 核验）

- [OpenAI Plugins README](https://github.com/openai/plugins)
- [Codex plugin CLI 官方实现](https://github.com/openai/codex/blob/main/codex-rs/cli/src/plugin_cmd.rs)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code Manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference)
- [Cursor Plugins](https://cursor.com/docs/plugins)
- [Agent Plugins Specification](https://agent-plugins.org/specification)

Codex 文档站本次请求返回 403，相关目录和命令以官方仓库为依据；源码 `main` 的能力可能先于安装版，请用当前版本帮助确认。
