---
title: "Agent Skills 开放标准与各工具兼容性全解"
slug: "ai-skill-agentskills-8ff13a14-revision-20260730"
summary: "按 2026-05-24 重新复核 Agent Skills 的通用层与工具差异，重点说明哪些属于可移植基础层、哪些是 Kiro / Codex / Cursor / Claude 当前官方支持的 skills 能力，以及哪些旧说法需要纠正。"
category: "Skill"
tags:
  - "Agent Skills"
  - "SKILL.md"
  - "Claude Code"
  - "Kiro"
  - "Cursor"
  - "Codex"
  - "兼容性"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291d8a2b1c68f2cac014"
originalSlug: "ai-skill-agentskills-8ff13a14"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# Agent Skills 开放标准与各工具兼容性全解

## 一、先说结论

**不要再把所有工具写成“完全一套玩法”。**

到 2026-05-24 这次复核为止，更稳妥的结论是：

- `一个目录 + 一个 SKILL.md` 这件事，确实已经形成了可移植的技能包思路。
- Kiro 官方文档明确写了它遵循开放的 Agent Skills 标准。
- Codex 这边也已经有成型的 skills 生态，本地实装目录里能直接看到 `~/.codex/skills/`、预装 `.system` skills，以及 OpenAI 官方维护的 `openai/skills` 仓库。
- Cursor 当前官方已经明确支持 **Agent Skills in editor and CLI**，同时也继续强调 `Rules` 与根目录 `AGENTS.md`。
- Claude Code 当前官方已经有完整的 **Skills** 文档，并明确说明自定义 commands 已并入 skills 体系。

所以现在最安全的理解方式是：

- **通用层**：`SKILL.md` 的目录化封装思路
- **Kiro / Codex 层**：当前可以明确落地的 skills 目录机制
- **Cursor / Claude 层**：当前官方已支持的 skills 机制，以及配套的 rules / commands / project memory

---

## 二、这次复核到底依据了什么

本篇只把以下内容当作“这轮能确认的硬依据”：

- Kiro 官方 `Agent Skills` 文档
- OpenAI 官方 `openai/skills` 仓库
- 本机当前真实存在的 `~/.codex/skills/` 目录结构
- Cursor 官方 `Rules / AGENTS.md` 文档与 2.4 skills 更新
- Claude Code 官方 `skills` 文档与 `slash commands` 文档

凡是没有在这几类来源里再次确认的细节，这次都不再当成“稳定事实”写死。

---

## 三、最小可移植结构

跨工具最稳的一层，仍然是下面这个目录结构：

```text
my-skill/
├── SKILL.md
├── references/   # 可选
├── scripts/      # 可选
└── assets/       # 可选
```

### 3.1 哪些目录最常见

- `SKILL.md`：必需，放元信息和主流程
- `references/`：放长文档、规范、详细说明
- `scripts/`：放需要稳定执行的脚本
- `assets/`：放模板、图片、示例文件等

### 3.2 Codex 里还常见一个目录

在 Codex 当前自带 skills 里，还能看到：

```text
agents/
└── openai.yaml
```

这一层更像 **Codex 的 UI/展示元信息**，不是 Agent Skills 最小通用标准本身。也就是说：

- 在 Codex 里它很有价值
- 但不要把它误写成“所有工具都必须支持的标准字段”

---

## 四、现在最稳的 frontmatter 写法

到这次复核为止，跨工具最稳、最不容易过时的只有两个字段：

```yaml
---
name: pr-review
description: Review pull requests for code quality, security issues, and test coverage. Use when reviewing PRs or preparing code for review.
---
```

### 4.1 现在建议默认依赖的，仍然是这两个字段

| 字段 | 现在的定位 | 说明 |
| ---- | ---------- | ---- |
| `name` | 稳定 | 技能标识，通常要求小写、数字、连字符 |
| `description` | 稳定 | 决定自动匹配和用途表达的核心字段 |

### 4.2 其他字段怎么理解

下面这些字段不能再一把抓地都说成“非标准”：

- `metadata`
- `license`
- `compatibility`

根据当前 Agent Skills 官方规范，`metadata`、`license`、`compatibility` 已经属于规范层字段。

而下面这些能力，更适合视为**产品专属字段或版本相关扩展**：

- `allowed-tools`
- `disable-model-invocation`
- `context`
- `hooks`
- `paths`
- `model`
- `effort`
- `argument-hint`

所以现在更稳妥的分法是：

- `name`、`description`：跨工具最稳的基础字段
- `metadata`、`license`、`compatibility`：Agent Skills 规范层字段
- 其余高级字段：先按具体产品、具体版本、具体官方页理解，不要默认跨工具完全通用

如果主人追求跨工具复用，优先只写：

- `name`
- `description`
- 正文步骤
- `references/`、`scripts/`、`assets/`

---

## 五、按工具重新看兼容性

## 5.1 Kiro：当前最明确支持标准 skills 的一类

Kiro 官方文档这轮给出的信息相对清楚：

- 支持 workspace 级：`.kiro/skills/`
- 支持 global 级：`~/.kiro/skills/`
- 默认 agent 会自动发现这些 skills
- 自定义 agent 不会自动加载，需要在 `resources` 里显式声明 `skill://...`
- 也支持把 skill 作为 slash command 使用，并传入 `$ARGUMENTS`、`$1`、`$2`

一个当前仍成立的 Kiro 自定义 agent 示例：

```json
{
  "name": "my-agent",
  "resources": [
    "skill://.kiro/skills/*/SKILL.md",
    "skill://~/.kiro/skills/*/SKILL.md"
  ]
}
```

这说明 Kiro 对 skills 的支持不是“民间兼容”，而是官方文档已明确写出来的正式能力。

---

## 5.2 Codex：技能目录已经真实存在，并且有官方仓库

这轮最容易核实的，是 Codex 本机和官方仓库两侧都能对上：

### 本机侧

当前本机已经存在：

```text
~/.codex/skills/
```

里面能看到：

- `.system` 预装 skills
- 自定义 skills
- 每个 skill 目录里的 `SKILL.md`
- 部分 skills 还带 `agents/`、`references/`、`scripts/`、`assets/`

### 官方仓库侧

OpenAI 官方维护 `openai/skills` 仓库，并明确说明：

- `.system` skills 会随较新的 Codex 自动安装
- curated / experimental skills 可以通过 `skill-installer` 安装

所以对 Codex 来说，现在更稳的说法是：

- **skills 不是概念演示，而是已经实装的能力**
- 个人级目录以 `~/.codex/skills/` 为主
- 团队和项目也可以围绕 skill 目录来沉淀能力

---

## 5.3 Cursor：现在应理解为 Skills 与 Rules 并存

截至 2026-05-24，Cursor 官方当前能明确确认的是：

- 2.4 已明确宣布支持 Agent Skills，覆盖 editor 和 CLI
- `.cursor/rules`
- 用户级 Rules
- 根目录 `AGENTS.md`
- `.cursorrules` 是 legacy

所以现在对 Cursor 更稳的结论是：

- 如果主人要做**按任务发现的流程包**，可以正面使用 Cursor skills
- 如果主人要做**长期常驻规范**，仍然优先写 `.cursor/rules` 或根目录 `AGENTS.md`

这一点特别重要，因为很多旧文章会把：

- `Rules`
- `AGENTS.md`
- skill 目录
- slash commands

混写成同一件事，结果越看越乱。

---

## 5.4 Claude Code：现在应理解为 Skills 为总框架

Claude Code 当前这轮能明确核对到的官方资料，已经不只是一页 slash commands，而是完整的 skills 体系。当前可以确认：

- Claude Code 官方已有 `skills` 文档
- 官方明确说明 custom commands 已并入 skills
- slash command 形式仍然可用，适合做快捷入口
- skills / commands 文档里都能看到参数占位与工具控制相关写法

其中 slash command 文档里明确展示了：

- `.claude/commands/`
- `~/.claude/commands/`
- `$ARGUMENTS`
- `$1`、`$2`
- `!` 命令注入
- `allowed-tools`
- `argument-hint`
- `model`

因此现在对 Claude Code 更稳的理解是：

- 如果主人想搭一套**任务流程包**，应优先按 Claude skills 理解
- 如果主人想保留快捷入口，再把其中一部分做成 command 风格入口
- 某些 Claude 专属高级字段即使已官方文档化，也不该直接外推成“所有 Agent Skills 实现都通用”

换句话说：

- Claude Code 确实很强
- 但“强”不等于“所有民间总结出来的字段都已经稳定官方化”

---

## 六、现在别再默认成立的旧说法

下面这些说法，这次都不再按“稳定事实”保留：

- “30+ 工具都完全遵循同一套字段和触发规则”
- “Cursor 只有 Rules，没有官方 Skills”
- “Claude Code 只有 commands，没有官方 Skills”
- “Claude Code 的高级 frontmatter 可以直接视作开放标准的一部分”
- “所有工具都支持同样的自动激活、手动触发、权限控制、路径触发和子代理字段”
- “某个全局别名目录一定跨工具通用”

它们有的可能在某些版本、某些插件、某些社区实现里成立，但不适合继续写成“默认真相”。

---

## 七、现在最推荐的写法策略

### 7.1 如果目标是“跨工具复用”

请只写最小层：

```markdown
---
name: code-review
description: Review code for bugs, edge cases, security issues, and maintainability problems. Use when reviewing changed code or auditing a module.
---

## Review checklist

1. Check correctness and edge cases
2. Check security and secret exposure
3. Check tests and failure handling
4. Check naming and maintainability
```

然后把大段细则拆到：

- `references/`
- `scripts/`
- `assets/`

### 7.2 如果目标是“在 Codex 里用得更顺手”

可以在最小层之外，再加：

- `agents/openai.yaml`
- 更细的 references
- 确定可运行的辅助脚本

### 7.3 如果目标是“在 Cursor 里稳定长期使用”

长期规范优先考虑：

- `.cursor/rules`
- 根目录 `AGENTS.md`

如果是按需触发的流程包，则可以直接做 Cursor skills。

### 7.4 如果目标是“在 Claude Code 里做强工作流”

优先先确认：

- 这件事是不是应该先做成 Claude skill
- 是否还需要补一个 `.claude/commands/*.md` 作为快捷入口
- 里面是否真的需要 `allowed-tools`、参数占位和 `!` 注入

---

## 八、Skills、Rules、AGENTS.md 现在该怎么选

| 需求 | 更推荐什么 |
| ---- | ---------- |
| 某个特定任务的完整流程包 | `SKILL.md` + `references/` + `scripts/` |
| 长期项目规范 | `AGENTS.md` / `CLAUDE.md` / `.cursor/rules` |
| Codex 的个人能力包 | `~/.codex/skills/` |
| Kiro 的团队工作流 | `.kiro/skills/` |
| Cursor 的任务流程包 | Cursor skills |
| Cursor 的全局/项目指令 | `Rules` 与根目录 `AGENTS.md` |
| Claude Code 的任务流程包 | Claude skills |
| Claude Code 的快捷任务入口 | `.claude/commands/` |

一条最实用的判断线是：

- **总是要生效的规范**，写到 rules / AGENTS / memory 体系里
- **只在特定任务里触发的流程包**，再写 skill

---

## 九、总结

现在最值得记住的不是“谁支持最多字段”，而是下面三句话：

1. `SKILL.md` 仍然是一个很有价值的可移植封装思路。
2. Kiro 和 Codex 现在都能把这套思路落到清晰的官方或实装目录上。
3. Cursor 和 Claude Code 现在都已经把 skills 正式摆上台面，但仍然各自保留了 rules、AGENTS、commands 这类配套机制。

如果主人后面只想记一个“不过时版本”，就记这个：

**跨工具先写最小 `SKILL.md`，落到具体工具时再分别接入 Kiro / Codex / Cursor / Claude 的 skills 机制；长期规范再补 rules / AGENTS / CLAUDE / commands。**

---

## 十、参考资料

- [Agent Skills 官方规范](https://agentskills.io/specification)
- [Kiro Agent Skills 文档](https://kiro.dev/docs/cli/skills/)
- [Cursor 2.4 更新说明](https://cursor.com/changelog/2-4)
- [Cursor Rules 文档](https://docs.cursor.com/context/rules-for-ai)
- [Claude Code Skills 文档](https://docs.anthropic.com/en/docs/claude-code/skills)
- [Claude Code Slash Commands 文档](https://docs.anthropic.com/en/docs/claude-code/slash-commands)
- [OpenAI Skills 仓库](https://github.com/openai/skills)
