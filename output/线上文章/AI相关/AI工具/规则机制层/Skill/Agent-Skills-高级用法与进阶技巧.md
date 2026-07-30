---
title: "Agent Skills 高级用法与进阶技巧"
slug: "ai-skill-agentskills-b37a5530"
summary: "按 2026-07-04 重新整理 Agent Skills 的进阶写法，重点区分哪些能力仍然稳定可用、哪些属于规范层字段、哪些只是工具专属扩展，以及哪些旧说法不应再当作默认事实。"
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
  - "Codex"
  - "Kiro"
  - "进阶技巧"
  - "版本边界"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291d8a2b1c68f2cac01a"
originalSlug: "ai-skill-agentskills-b37a5530"
originalStatus: "published"
publishedAt: "2026-05-24T14:29:34.181Z"
updatedAt: "2026-07-30T14:24:30.315Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# Agent Skills 高级用法与进阶技巧

> 这一篇不再追求“功能列表越多越好”，而是优先回答一个更重要的问题：**哪些写法今天还稳，哪些写法已经明显带版本风险。**

## 一、先把高级能力分三层

### 第一层：今天仍然稳

这些内容可以继续大胆用：

- `name` + `description`
- `references/` 拆长文档
- `scripts/` 放确定性脚本
- `assets/` 放模板和输出资源
- Agent Skills 规范层里的 `metadata`、`license`、`compatibility`
- Kiro 的 `skill://...` 资源声明
- Codex 的本地 `~/.codex/skills/` 目录与 `openai/skills` 生态

### 第二层：产品专属，但仍有现实价值

这些能力不是所有工具共享的通用基线，但在对应产品里仍很有用：

- Claude Code skills / commands 里的 `$ARGUMENTS`
- Claude Code skills / commands 里的 `$1`、`$2`
- Claude Code 的 `!` 命令注入
- Claude Code frontmatter 里的 `allowed-tools`、`argument-hint`、`model`、`effort`、`context`、`hooks`
- Kiro skill 作为 slash command 时的参数占位
- Codex skill 目录里的 `agents/openai.yaml`

### 第三层：版本敏感，不能再默认通用

这些内容这次不再当作“稳定常识”：

- 固定的上下文压缩 token 配额
- 某些内部环境变量名一定长期存在
- “所有工具都支持同样的自动激活、权限语法、路径匹配和子代理控制”

---

## 二、description 仍然是技能成败的第一关键

很多人一上来就研究“高级字段”，但实际最影响效果的，仍然是 `description` 写得对不对。

### 2.1 现在仍然推荐的写法

```yaml
---
name: pr-review
description: Review pull requests for code quality, security issues, and test coverage. Use when reviewing PRs, checking code before merge, or auditing a risky change.
---
```

### 2.2 为什么这依然关键

因为无论是：

- Kiro 的 skills 自动匹配
- Codex 的技能发现思路
- 还是其他 agent 工具的相似机制

最先暴露给模型的，往往都是短元信息，而不是整篇正文。

### 2.3 现在更推荐的 description 模板

建议尽量写成：

`做什么 + 什么时候用 + 常见触发说法`

例如：

```text
Review pull requests for code quality, security issues, and test coverage. Use when reviewing PRs, checking code before merge, or auditing risky changes.
```

不要只写：

```text
Help with code review
```

这种写法太短，触发词不够，也不利于后续迁移到其他工具。

---

## 三、把长内容移到 references，仍然是最实用的进阶技巧

这是这次复核后我最愿意继续保留的“高级实践”。

### 3.1 推荐结构

```text
security-review/
├── SKILL.md
└── references/
    ├── checklist.md
    ├── auth.md
    └── api-risk-patterns.md
```

### 3.2 为什么比把所有内容塞进 `SKILL.md` 更好

- 让入口更短，触发更清晰
- 让正文只保留流程
- 需要细节时再读取参考文档
- 对 Codex、Kiro 这类目录化技能尤其友好

### 3.3 一个现在仍然靠谱的正文写法

```markdown
---
name: security-review
description: Review application code for auth mistakes, secret leaks, input validation issues, and risky integrations. Use when auditing backend routes, API handlers, or security-sensitive changes.
---

## Workflow

1. Read the changed files and identify trust boundaries
2. Use `references/checklist.md` as the primary review list
3. If auth is involved, also read `references/auth.md`
4. Report findings with file path, risk, and suggested fix
```

这类写法比堆很多魔法字段更抗过时。

---

## 四、scripts 目录的价值比“炫技语法”更稳定

把重复动作写成脚本，是技能真正能长期复用的原因之一。

### 4.1 什么时候该放脚本

- 每次都要重写的转换逻辑
- 需要稳定输出格式的操作
- 需要真实执行、不能只靠模型脑补的流程

### 4.2 示例

```text
release-helper/
├── SKILL.md
└── scripts/
    └── collect_release_notes.py
```

正文里写：

```markdown
1. Run `scripts/collect_release_notes.py`
2. Group the output into features, fixes, and risks
3. Draft the release summary in Markdown
```

这个思路在 Codex 自带 skills 里也很常见，所以它比某些“只存在于一篇老文章里的私有 frontmatter”更值得学。

---

## 五、Codex 这边现在最值得知道的进阶点

### 5.1 `.system` 是真实存在的

本机当前 `~/.codex/skills/` 下能看到：

- `.system/imagegen`
- `.system/openai-docs`
- `.system/plugin-creator`
- `.system/skill-creator`
- `.system/skill-installer`

这说明对 Codex 来说，skills 已经不是概念页，而是实际在工作。

### 5.2 `skill-creator` 给出的当前建议

本机自带 `skill-creator` 明确强调：

- `SKILL.md` 里最核心的是 `name` 和 `description`
- `references/` 用来承载大块参考资料
- `scripts/` 用来放可执行工具
- `agents/openai.yaml` 是推荐但非必需的 UI 元信息

这也反过来说明：

**如果您想写“更能跟得上 Codex 现状”的 skill，优先学这些，而不是优先学一堆跨工具真假难辨的高级字段。**

### 5.3 `skill-installer` 给出的当前事实

当前 Codex skills 生态可以确认的是：

- `.system` skills 属于预装层
- curated / experimental skills 在 `openai/skills` 仓库里
- 通过 `skill-installer` 可以安装
- 安装后需要重启 Codex 才会被重新发现

---

## 六、Kiro 这边现在最值得记的进阶点

Kiro 当前最实用的进阶点，不是“神秘隐藏字段”，而是：

### 6.1 默认 agent 与自定义 agent 的差别

- 默认 agent：会自动发现 `.kiro/skills/` 和 `~/.kiro/skills/`
- 自定义 agent：不会自动加载 skills，需要在 `resources` 里声明

### 6.2 这意味着什么

如果主人发现：

- skill 明明写了
- 但某个自定义 agent 就是不认

第一检查项不应该是怀疑 `SKILL.md` 写坏了，而应该先看这个 agent 有没有把 `skill://...` 配进去。

---

## 七、Claude Code 里，哪些高级能力仍然值得借鉴

虽然这组文章现在不把 Claude 的高级写法当成“所有 Agent Skills 实现的统一标准”，但其中一部分思路仍然很值得学。

### 7.1 参数占位

Claude Code 当前官方 skills / slash commands 文档明确展示了：

- `$ARGUMENTS`
- `$1`、`$2`

例如：

```markdown
Review PR #$1 with priority $2 and assign to $3.
```

这个思路对于“把一个流程做成可带参数的模板”非常好用。

### 7.2 命令注入

官方文档也明确展示了 `!` 注入命令输出的做法。

这很适合：

- 把 `git status`
- `git diff`
- 最近提交

先采集进上下文，再执行后续流程。

### 7.3 但边界要记清

这些是：

- **Claude 自定义命令体系下已文档化的能力**
- 并且现在也已经并入 Claude skills 体系

不是：

- “所有 Agent Skills 实现都天然拥有的标准字段”

---

## 八、现在应当降级处理的旧说法

下面这些以前看起来很酷，但这次已经不建议继续当“默认知识”传播：

### 8.1 固定 token 配额说法

比如：

- “每个 skill 保留前多少 token”
- “所有 skills 总预算多少”

这类数字非常容易被版本改动打脸。现在更稳妥的写法应该是：

**正文尽量短，把细节拆出去，减少上下文负担。**

### 8.2 skill 级 hooks / paths / fork

这几类能力即使在某些产品当前已有官方文档，也不适合继续写成：

- 所有工具都懂
- 已经稳定多年
- 可以放心拿来做主设计

主人真要用，最好先以“具体产品、具体版本、具体官方页”再单独复核一次。

### 8.3 “某个目录别名跨工具通用”

像 `.agents/skills/` 这种说法，这次也一律降级处理。原因不是它一定错，而是：

- 一旦没有当前官方页再次确认
- 把它写成“默认跨工具通用目录”

就非常容易误导后来人。

---

## 九、今天仍然推荐的进阶模板

### 9.1 先写 portable 版

```markdown
---
name: release-audit
description: Audit release readiness by checking recent changes, risky areas, test status, and deployment notes. Use when preparing a release, cut, or production rollout.
---

## Workflow

1. Read the changed modules and identify risk areas
2. Read `references/release-checklist.md`
3. Run the scripts in `scripts/` if needed
4. Produce a release-readiness report with blockers and follow-ups
```

### 9.2 再写 Codex 增强层

可以追加：

- `agents/openai.yaml`
- 更细的 references
- 辅助脚本

### 9.3 再按其他工具转换

- Kiro：直接放入 `.kiro/skills/`
- Cursor：通常改写成 `.cursor/rules` 或根目录 `AGENTS.md`
- Claude：通常改写成 `.claude/commands/*.md`

---

## 十、总结

真正能长期抗过时的进阶技巧，其实就三条：

1. 把触发条件写进 `description`
2. 把长知识拆进 `references/`
3. 把重复动作收进 `scripts/`

至于那些看起来很炫的“高级字段”，现在都应该带着一个默认前缀去看：

**这是不是某个工具、某个版本、某个页面里的专属能力，而不是所有技能系统共享的稳定真相？**

只要主人先有这个判断，后面不管写 Codex skill、Kiro skill，还是把同样思路迁移到 Cursor / Claude，都不会那么容易踩过时坑。

## 参考资料

- [Kiro Agent Skills 文档](https://kiro.dev/docs/cli/skills/)
- [Claude Code Skills 文档](https://code.claude.com/docs/en/skills)
- [OpenAI Codex Skills 文档](https://developers.openai.com/codex/skills)
- [OpenAI Skills 仓库](https://github.com/openai/skills)
