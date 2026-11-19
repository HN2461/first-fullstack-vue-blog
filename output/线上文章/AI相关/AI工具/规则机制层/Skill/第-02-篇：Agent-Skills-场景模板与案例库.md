---
title: "第 02 篇：Agent Skills 场景模板与案例库"
slug: "ai-skill-agentskills-a705fbb5"
summary: "按 2026-11-18 官方规范更新代码审查、调试、README 与发布准备模板，补充 Codex 当前目录、Claude Skill 直接命令入口及依赖和触发验收。"
category: "Skill"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Skill"
tags:
  - "Agent Skills"
  - "SKILL.md"
  - "模板"
  - "Codex"
  - "Kiro"
  - "Cursor"
  - "Claude Code"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cac01e"
originalSlug: "ai-skill-agentskills-a705fbb5"
originalStatus: "published"
publishedAt: "2026-05-24T15:07:50.715Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 02 篇：Agent Skills 场景模板与案例库


> 核验日期：2026-11-18。本文保留代码审查、调试、README、发布审查等模板，区分可移植流程与客户端专属执行语法。
>
> 现在更推荐的做法是：
>
> 1. 先写一份可移植基础模板
> 2. 再按 Codex / Kiro / Cursor / Claude 各自落地

---

## 一、模板使用总原则

### 1.1 先写 portable 基础层

也就是只依赖：

- `name`
- `description`
- 正文流程
- `references/`
- `scripts/`

### 1.2 再补工具专属层

- Kiro：直接按 `.kiro/skills/` 收纳
- Codex：项目优先使用 `.agents/skills/`，用户级使用 `~/.agents/skills/`，也可随插件分发；旧 `$CODEX_HOME/skills` 保留兼容。`agents/openai.yaml` 属于产品适配层
- Cursor：任务流程优先保留为 skills，长期规范再改写成 `.cursor/rules` 或根目录 `AGENTS.md`
- Claude Code：优先做成 `.claude/skills/<name>/SKILL.md`，本身就能通过 `/name` 调用；旧 `.claude/commands/*.md` 仅在维护旧流程时保留

### 1.3 为什么要这样分

因为“模板能不能复制”本来就有两种含义：

- 内容逻辑能不能复用
- 文件形态能不能原样放进去

前者通常可以，后者不一定。

---

## 二、可移植基础模板

## 2.1 通用代码审查模板

目录：

```text
code-review/
└── SKILL.md
```

`SKILL.md`：

```markdown
---
name: code-review
description: Review changed code for bugs, edge cases, security issues, missing tests, and maintainability problems. Use when reviewing a patch, PR, or risky refactor.
---

## Review workflow

1. Read the changed files and identify the main behavior changes
2. Check correctness, edge cases, and error handling
3. Check security risks and secret exposure
4. Check tests, assumptions, and regression risk
5. Report findings with file path, impact, and suggested fix
```

这个版本适合当所有变体的母版。

---

## 2.2 通用调试模板

目录：

```text
debug/
└── SKILL.md
```

`SKILL.md`：

```markdown
---
name: debug
description: Diagnose and fix errors, failing tests, broken scripts, and unexpected behavior. Use when a command fails, a page breaks, or output is incorrect.
---

## Debug workflow

1. Capture the exact error and reproduction steps
2. Find the first failing location, not just the last stack frame
3. Inspect the smallest set of related files
4. Fix the root cause with the smallest safe change
5. Re-run the failing scenario and document residual risk
```

---

## 2.3 通用 README 生成模板

目录：

```text
write-readme/
├── SKILL.md
└── references/
    └── readme-sections.md
```

`SKILL.md`：

```markdown
---
name: write-readme
description: Create or refresh a project README with setup, usage, structure, and contribution guidance. Use when a repo lacks onboarding documentation or the README is outdated.
---

## Workflow

1. Inspect the project entry points and package metadata
2. Read `references/readme-sections.md`
3. Summarize the project in plain language
4. Generate or update the README with only relevant sections
```

这个模板的关键不是 fancy 字段，而是知道什么时候把固定结构拆进 `references/`。

---

## 三、Kiro / Codex 直接可落地的模板

## 3.1 Kiro / Codex 通用增强版代码审查

目录：

```text
code-review/
├── SKILL.md
└── references/
    └── checklist.md
```

`SKILL.md`：

```markdown
---
name: code-review
description: Review changed code for bugs, edge cases, security issues, missing tests, and maintainability problems. Use when reviewing a patch, PR, or risky refactor.
---

## Workflow

1. Read the changed files and summarize the behavior change
2. Read `references/checklist.md`
3. Look for correctness, safety, and regression issues
4. Report findings ordered by severity
```

为什么这个版本适合 Kiro / Codex：

- 都吃 `SKILL.md`
- 都适合目录化 references
- 没依赖高风险私有字段

---

## 3.2 Codex 风格 companion skill 模板

目录：

```text
release-audit/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   └── release-checklist.md
└── scripts/
    └── collect_release_notes.py
```

`SKILL.md`：

```markdown
---
name: release-audit
description: Audit release readiness by checking recent code changes, tests, rollout notes, and known risks. Use when preparing a release or deployment handoff.
---

## Workflow

1. Read `references/release-checklist.md`
2. Run `scripts/collect_release_notes.py` if release data needs to be gathered
3. Identify blockers, follow-ups, and rollout risks
4. Produce a concise release-readiness report
```

说明：

- `agents/openai.yaml` 更像 Codex UI 补充层
- 没它也能做 skill
- 但如果你要把 skill 做得更完整、在 Codex 里展示更友好，这一层值得保留

---

## 四、Cursor：Skills 与 Rules 现在应配合使用

Cursor 当前官方不再只是 rules 路线。更稳妥的理解是：

- 任务型流程包可以正面做成 Cursor skills
- 长期项目规范继续放在 `.cursor/rules` 与根目录 `AGENTS.md`

## 4.1 用 Cursor skills 承载按需触发的流程包

适合：

- 只在某个任务里才会触发的复杂流程包
- 需要 `references/`、`scripts/` 这类目录化资源
- 想和 Kiro / Codex / Claude 的 portable skill 母版保持接近

## 4.2 用 `AGENTS.md` 承载项目级审查习惯

```markdown
# Project Instructions

## Code Review Expectations

- Prioritize bugs, regressions, and missing tests
- Call out risky edge cases before style issues
- Include file references when reporting findings
- Prefer the smallest safe fix over broad rewrites
```

适合：

- 每次都要生效的长期要求
- 团队统一口径

## 4.3 用 `.cursor/rules` 承载有范围的流程规则

如果你已经在 Cursor 里用 Project Rules，那么同样的审查模板更适合变成：

- 某条 Agent Requested rule
- 某条 Auto Attached rule

而不是强行让所有长期约束都塞进 skill 正文。

---

## 五、Claude Code：用一个 Skill 提供手动与自动入口

Claude Code 新流程使用 `.claude/skills/review-pr/SKILL.md`。同一个技能既可通过 `/review-pr` 调用，也可按描述由模型选用，无需再复制一个同名 commands 文件。

### 5.1 审查技能模板（Claude Code 专属增强）

```markdown
---
name: review-pr
description: Review a pull request for bugs, regression risks, and missing tests.
argument-hint: [pr-or-branch]
disable-model-invocation: true
---

## Workflow

1. Read the project instructions and the current git diff.
2. Inspect the requested branch or pull request: $ARGUMENTS
3. Verify the risky behavior with focused checks.
4. Report findings ordered by severity, with file locations and evidence.
```

这里明确使用 `disable-model-invocation: true`，表示该流程由用户点名启动。若希望自然语言任务也能自动激活，可以移除此字段，并通过清晰的 description 约束场景。这个开关不会解除工具原有的权限要求。

### 5.2 动态上下文只在确有必要时使用

Claude Code 支持 `` !`git diff` `` 一类动态上下文，在技能正文发送给模型前执行并替换结果。它与“正文里建议模型稍后运行命令”不同，因此不适合放未经审查的 shell 表达式或默认执行有副作用的操作。

`$ARGUMENTS`、`argument-hint` 和动态注入是这里的产品增强层，不是承诺所有 Agent Skills 客户端原样执行的通用模板。旧 commands 格式继续兼容，但新技能不需要额外创建 command 才有 slash 入口。

---

## 六、三类高频模板

## 6.1 发布前检查

portable 版：

```markdown
---
name: pre-release-check
description: Verify release readiness by checking tests, risky changes, rollback notes, and deployment prerequisites. Use before a production rollout or important cut.
---

1. Identify the scope of the release
2. Read the release checklist
3. Confirm tests, risks, and rollback notes
4. Produce a go/no-go summary
```

适配建议：

- Kiro / Codex：保留 skill 目录
- Cursor：保留成 skill，或按长期约束拆成 rule
- Claude：保留原生 Skill，并直接通过 `/skill-name` 使用快捷入口

## 6.2 文档生成

portable 版：

```markdown
---
name: docs-refresh
description: Refresh outdated project documentation by comparing the current codebase with existing docs. Use when a README, guide, or setup note has drifted from reality.
---

1. Read the current docs
2. Inspect the relevant code and commands
3. Mark outdated claims
4. Rewrite only the stale parts
```

## 6.3 安全复查

portable 版：

```markdown
---
name: security-review
description: Review code and configuration for auth mistakes, secret exposure, unsafe defaults, and input validation gaps. Use when touching login, payments, uploads, or external integrations.
---

1. Identify trust boundaries
2. Check auth and authorization paths
3. Check secrets and configuration exposure
4. Check validation and dangerous defaults
5. Report concrete risks with fixes
```

---

## 七、现在不再建议直接照抄的旧模板特点

以下模板写法这次都被降级处理：

- 开头就塞大量工具私有字段
- 一上来就假定所有工具都支持 `allowed-tools`
- 模板正文里把 `context: fork`、`hooks`、`paths` 当通用能力
- “这一份复制到 Codex、Cursor、Claude、Kiro 全都完全一样可跑”

原因不是这些写法一定没用，而是它们太容易随着产品版本变化而失真。

---

## 八、现在最实用的抄法

如果你只想记一套最省心的模板流程，就按这个顺序：

1. 先写 portable `SKILL.md`
2. 把长内容放进 `references/`
3. 把重复命令变成 `scripts/`
4. 在 Codex 按需增加 `agents/openai.yaml` 产品适配信息
5. 在 Cursor 放入支持的 skills 目录；长期规范另写 Rules / AGENTS.md
6. 在 Claude 放入 `.claude/skills/<name>/SKILL.md`，通过自带 slash 入口调用

这样写出来的模板，不一定“最炫”，但最抗过时，也最容易真正落地。

## 九、延伸阅读

如果你想看**更贴近前端开发**的 skills 清单，而不是继续看抽象模板，可以直接接着看：

- [补充篇：前端开发常用 Skills 清单与落地顺序（2026-11复核）](第-05-篇：前端开发常用-Skills-清单与落地顺序（2026-07复核）.md)

## 模板落地前的验收

示例里的脚本、参考文件和外部服务需要实际提供。不要复制了目录树就假设 `collect_release_notes.py` 已存在，也不要把技能文档里的工具名当成已经安装的工具。

| 场景 | 验收方式 |
| --- | --- |
| 显式调用 | 点名 skill，确认加载到预期目录和版本 |
| 自然语言匹配 | 用同义描述请求任务，核对是否合理触发 |
| 不相关任务 | 确认没有无故执行该流程 |
| 依赖缺失 | 脚本、凭据或命令缺失时应报告缺项，不伪造执行结果 |
| 产生写操作 | 先明确目标、范围、预览方式和现有授权 |

Front Matter 按开放规范核验：`name` 与目录一致，`description` 非空；`allowed-tools` 属于实验性规范字段，但语法和执行效果由宿主决定。Cursor Skill 新增文件范围使用 `paths`，不要据此改写 Cursor Rules 中的 `globs`。

## 参考资料（2026-11-18 核验）

- [Agent Skills Specification](https://agentskills.io/specification)
- [Claude Code Skills：调用控制与动态上下文](https://code.claude.com/docs/en/skills)
- [Cursor Skills：路径范围与迁移](https://cursor.com/docs/skills)
- [Kiro Agent Skills](https://kiro.dev/docs/skills/)
- [Codex 技能目录公开实现](https://github.com/openai/codex/blob/main/codex-rs/ext/skills/src/host_roots.rs)
- [OpenAI Plugins](https://github.com/openai/plugins)
