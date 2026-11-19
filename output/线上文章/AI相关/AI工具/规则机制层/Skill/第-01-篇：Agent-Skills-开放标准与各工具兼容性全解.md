---
title: "第 01 篇：Agent Skills 开放标准与各工具兼容性全解"
slug: "ai-skill-agentskills-8ff13a14"
summary: "依据 2026-11-18 官方规范与公开实现，说明 Agent Skills 标准字段、渐进披露、Codex/Claude Code/Cursor/Kiro 的技能路径、触发方式和本地云端差异。"
category: "Skill"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Skill"
tags:
  - "Agent Skills"
  - "SKILL.md"
  - "Claude Code"
  - "Kiro"
  - "Cursor"
  - "Codex"
  - "兼容性"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cac014"
originalSlug: "ai-skill-agentskills-8ff13a14"
originalStatus: "published"
publishedAt: "2026-05-24T14:29:34.177Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 01 篇：Agent Skills 开放标准与各工具兼容性全解

> 核验日期：2026-11-18。本文区分 Agent Skills 文件格式、产品扩展和本地/云端加载范围；引用当前官方文档与 OpenAI 公开源码，不把某台机器的缓存目录当成跨工具标准。

[[toc]]

## 一、Skill 标准化了什么

Agent Skills 是把任务说明、脚本和参考资料组织成目录的开放格式。它让“代码审查如何做”“发布前核对什么”“怎样生成一份文档”能够版本化、共享，并由支持该格式的 agent 按任务加载。

标准的重点是可读的能力包。它没有统一所有客户端的安装目录、自动触发算法、命令入口、权限系统或云端同步方式。将文件复制到另一个工具后，仍要核对该工具的发现位置和扩展字段。

## 二、最小可移植结构

```text
code-review/
├── SKILL.md
├── references/       # 可选：审查清单、框架规则
├── scripts/          # 可选：确定性检查程序
└── assets/           # 可选：报告模板与样例
```

只有 `SKILL.md` 是必需文件。`references/`、`scripts/`、`assets/` 是规范推荐的组织方式，技能也可以包含其他文件。相对引用从 skill 根目录解析，不要依赖用户机器的绝对路径。

```markdown
---
name: code-review
description: Review changed code for bugs, edge cases, security issues, and missing tests. Use when reviewing a patch or pull request.
---

## Workflow

1. Read the changed files and identify behavior changes.
2. Read references/checklist.md when detailed review criteria are needed.
3. Check correctness, failure handling, and regression risks.
4. Report findings with evidence, file locations, and suggested fixes.
```

示例中的 `references/checklist.md` 必须随包提供；这里只展示 `SKILL.md` 的主体结构。

## 三、Front Matter：标准字段与产品扩展

截至本次核验，官方规范明确列出以下字段：

| 字段 | 标准中的要求 | 使用建议 |
| --- | --- | --- |
| `name` | 必填，1–64 字符；小写字母、数字、连字符；不能首尾连字符、连续连字符；与父目录名一致 | 使用 `code-review` 这类稳定名称 |
| `description` | 必填，1–1024 字符 | 同时说明做什么、何时使用 |
| `license` | 可选 | 写许可证名称或随包许可证路径 |
| `compatibility` | 可选，提供时最长 500 字符 | 说明确有必要的运行环境和依赖 |
| `metadata` | 可选，字符串键到字符串值的映射 | 团队、版本等元数据放在这里 |
| `allowed-tools` | **实验性标准字段**，空格分隔的工具字符串 | 支持和解释取决于客户端，不能承诺跨工具授权效果 |

`allowed-tools` 不能再统一归为“完全非标准”。同时，标准列出该字段，也不意味着宿主会忽略现有审批、沙箱或组织策略。

Claude Code 的 `context`、`agent`、`hooks`、`user-invocable`，Cursor 的 `paths`，以及 Codex 的 `agents/openai.yaml` 都需要按对应产品说明使用。产品之间可能恰好使用同名字段，但含义和适用范围仍需分别验证。

## 四、渐进披露：为什么要把说明分层

规范推荐三层加载：

1. 先提供 `name` 和 `description`，用于发现相关技能。
2. 任务激活后读取完整 `SKILL.md`。
3. 需要细节时才读取参考文件或运行脚本。

官方给出的约 100 tokens 元信息、正文建议少于 5000 tokens、主文件建议小于 500 行，都是内容设计建议，不是每个产品统一执行的硬性 token 配额。把长资料移出主文件，同时写清“什么时候读哪份资料”，才能发挥按需加载的作用。

## 五、各工具兼容性与路径

| 工具 | 项目级位置 | 用户级位置/分发方式 | 需要额外核对的差异 |
| --- | --- | --- | --- |
| Codex | `.agents/skills/<name>/SKILL.md`；也可随插件分发 | `~/.agents/skills/`；旧 `$CODEX_HOME/skills` 保留兼容 | 当前公开源码将旧用户目录标为 deprecated；安装版与托管环境可能采用额外来源 |
| Claude Code | `.claude/skills/<name>/SKILL.md` | `~/.claude/skills/`、插件、账号同步技能 | 本地、Cowork、云会话的加载范围不同 |
| Cursor | `.agents/skills/`、`.cursor/skills/` | `~/.agents/skills/`、`~/.cursor/skills/`、插件 | 兼容读取 `.claude/skills`、`.codex/skills`；个人云端同步另有条件 |
| Kiro | `.kiro/skills/` | `~/.kiro/skills/` | 自定义 agent 要显式登记；本地全局技能不等于云端可用 |

这是本次核验的支持矩阵，不表示所有工具都实现了同样的命令、优先级或权限控制。

### 5.1 Codex：区分技能源、插件与旧目录

OpenAI 当前官方示例集中在 `openai/plugins`；旧 `openai/skills` README 已明确标记废弃，并指向 Build plugins 指南，其中包含只打包 Skill 的插件做法。

当前公开源码读取项目 `.agents/skills/` 与用户 `~/.agents/skills/`，同时保留旧用户技能目录兼容。新项目优先使用已支持的项目级目录或插件分发，已有技能先验证发现结果再迁移，避免复制出两个同名版本。不要把运行时缓存中的发布编号写成安装路径规范。

Codex 的 `agents/openai.yaml` 是产品适配层，涉及显示信息、依赖或调用策略时，以该版本的格式为准；它不是 Agent Skills 的必需文件。

### 5.2 Claude Code：一个 Skill 已经可以提供快捷入口

新任务使用 `.claude/skills/review-pr/SKILL.md`，即可由用户通过 `/review-pr` 调用，也可按描述由 Claude 选择。旧 `.claude/commands/*.md` 继续兼容，但不需要为了“有 slash command”再复制一个同内容的 command 文件。

插件技能的入口带命名空间，例如 `/team-review:review-pr`。`disable-model-invocation: true` 用于限制模型自动调用；`user-invocable: false` 用于隐藏用户菜单入口，两者不是同一个开关。

本地 `~/.claude/skills/` 不会自动出现在 Cowork 或云会话。账号启用的同步技能、普通云会话中的仓库技能、项目云线程的规则各有差异，团队应按实际运行入口验收。

### 5.3 Cursor：Skills、Rules 和 Plugins 并存

Cursor 当前支持自动发现技能，也可以在 Agent 输入框通过 `/` 选择技能。`paths` 限定技能适用文件，新技能优先使用该字段；旧 `globs` 只作为兼容回退。这里说的是 **Skill 字段**，不能据此把 `.cursor/rules/*.mdc` 的 `globs` 改掉。

Cursor 已有独立插件体系，可打包 skills、rules、agents、commands、MCP 和 hooks；同时支持 Agent Plugins 格式。插件与技能的标准不是同一个规范，详见 Plugin 系列。

### 5.4 Kiro：默认 agent 与自定义 agent 分开配置

默认 agent 会发现工作区和全局技能。自定义 agent 需在 `resources` 中登记：

```json
{
  "name": "my-agent",
  "resources": [
    "skill://.kiro/skills/*/SKILL.md",
    "skill://~/.kiro/skills/*/SKILL.md"
  ]
}
```

同名技能中工作区优先于全局。通过 `/skill-name` 后追加文本可以传入上下文；`$ARGUMENTS`、`${N}` 等占位替换当前是 CLI 专属能力，不能直接承诺 IDE 与 Web 一致。

## 六、如何验证可移植性

先用 `skills-ref validate ./code-review` 检查开放格式，再在目标客户端做发现和触发测试。格式通过并不代表脚本依赖、凭据、权限和输出质量都已通过。

最少覆盖四个场景：明确点名技能、自然语言匹配任务、不相关任务不误触发、缺少外部依赖时给出可操作提示。涉及写文件或外部系统时，还要检查工具是否真正可用，以及已有用户授权是否覆盖执行范围。

## 七、与 Rules、MCP、Plugin 的分工

| 需求 | 首选载体 |
| --- | --- |
| 项目约定、代码风格、提交要求 | 宿主支持的 Rules / AGENTS.md / CLAUDE.md |
| 某类任务的流程和案例 | Skill |
| 读取外部资料、调用服务 | MCP 或产品原生连接器 |
| 多个能力统一安装、更新、分发 | Plugin |

规则按产品的作用域和触发方式加载，并非所有规则都永远全量进入上下文。Skill 也不会因为文档中写了“调用某工具”，就自动安装工具、连接账号或获得权限。

## 参考资料

以下资料于 2026-11-18 核验。OpenAI 文档站本次请求返回 403，Codex 目录与 CLI 判断使用官方公开仓库；`main` 源码能力与已安装版本可能存在时间差。

- [Agent Skills Specification](https://agentskills.io/specification)
- [Codex 技能根目录公开实现](https://github.com/openai/codex/blob/main/codex-rs/ext/skills/src/host_roots.rs)
- [OpenAI Plugins 官方示例](https://github.com/openai/plugins)
- [OpenAI Skills 废弃说明](https://github.com/openai/skills)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Cursor Skills](https://cursor.com/docs/skills)
- [Cursor Plugins](https://cursor.com/docs/plugins)
- [Kiro Agent Skills](https://kiro.dev/docs/skills/)
