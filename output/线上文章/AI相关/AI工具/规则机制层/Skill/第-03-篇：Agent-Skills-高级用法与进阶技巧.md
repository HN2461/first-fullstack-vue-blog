---
title: "第 03 篇：Agent Skills 高级用法与进阶技巧"
slug: "ai-skill-agentskills-b37a5530"
summary: "更新渐进披露、实验性 allowed-tools、Claude 调用控制与 fork、Cursor paths、Codex 当前目录，并给出触发质量与脚本执行的验证方法。"
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
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cac01a"
originalSlug: "ai-skill-agentskills-b37a5530"
originalStatus: "published"
publishedAt: "2026-05-24T14:29:34.181Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 03 篇：Agent Skills 高级用法与进阶技巧

> 核验日期：2026-11-18。高级能力分别依据开放规范、Claude Code、Cursor、Kiro 文档和 Codex 公开实现说明，不推定所有客户端一致支持。


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
- Codex 当前公开实现中的 `.agents/skills/`、`~/.agents/skills/` 与 `openai/plugins` 生态

### 第二层：产品专属，但仍有现实价值

这些能力不是所有工具共享的通用基线，但在对应产品里仍很有用：

- Claude Code skills / commands 里的 `$ARGUMENTS`
- Claude Code skills / commands 中从 `$0` 开始的索引参数
- Claude Code 的 `!` 命令注入
- Claude Code frontmatter 里的 `argument-hint`、`model`、`effort`、`context`、`hooks`
- `allowed-tools` 是实验性标准字段；Claude 的具体工具匹配和授权效果按产品文档解释
- Kiro CLI 技能中的参数占位；IDE/Web 追加上下文不等于同样的替换能力
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

## 五、Codex：把技能源与运行时缓存分开

当前公开源码读取项目 `.agents/skills/`、用户 `~/.agents/skills/`，并兼容旧 `$CODEX_HOME/skills`。`.system`、插件缓存和托管环境来源由产品维护，不能从本机出现某个目录推导为所有用户都应手工安装到那里。

团队新增技能可以选择项目目录或插件。OpenAI 旧 `openai/skills` 仓库已标记废弃，当前示例移至 `openai/plugins`。复用旧技能时保留流程价值，再核对依赖、字段与安装方式。

`agents/openai.yaml` 是 Codex 产品适配层，不属于开放格式的必需文件。涉及 UI 元信息、依赖或调用策略时，依据实际客户端格式维护，不把它仅仅理解为任何产品都能识别的通用展示文件。

目录存在也不代表当前会话已重载。修改技能后先检查可发现列表和真实调用；按客户端提示刷新或开启新会话，不机械承诺所有修改都必须重启，也不承诺全部修改都会热更新。

---

## 六、Kiro 这边现在最值得记的进阶点

Kiro 当前最实用的进阶点，不是“神秘隐藏字段”，而是：

### 6.1 默认 agent 与自定义 agent 的差别

- 默认 agent：会自动发现 `.kiro/skills/` 和 `~/.kiro/skills/`
- 自定义 agent：不会自动加载 skills，需要在 `resources` 里声明

### 6.2 这意味着什么

如果你发现：

- skill 明明写了
- 但某个自定义 agent 就是不认

第一检查项不应该是怀疑 `SKILL.md` 写坏了，而应该先看这个 agent 有没有把 `skill://...` 配进去。

---

## 七、Claude Code 里，哪些高级能力仍然值得借鉴

虽然这组文章现在不把 Claude 的高级写法当成“所有 Agent Skills 实现的统一标准”，但其中一部分思路仍然很值得学。

### 7.1 参数占位

Claude Code 当前官方 skills / slash commands 文档明确展示了：

- `$ARGUMENTS`
- `$0`、`$1`、`$2`（索引从 0 开始）

例如：

```markdown
Review PR #$0 with priority $1 and proposed reviewer $2. Report findings only.
```

例如 `/review-pr 42 high alice` 中，`$0` 为 `42`，`$1` 为 `high`，`$2` 为 `alice`。正文若要真实修改 PR 指派，必须另有相应工具与授权；上例仅生成审查结果。

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

## 八、按规范与产品分别使用高级能力

### 8.1 渐进披露的数字是建议

Agent Skills 规范给出元信息约 100 tokens、正文建议少于 5000 tokens、主文件建议少于 500 行。它们帮助控制上下文成本，不是每个客户端一致执行的硬性配额。短正文说明判断流程，详细资料按条件读取，脚本只返回解决当前任务所需的结果。

### 8.2 `allowed-tools` 是实验性标准字段

规范允许空格分隔的工具列表，但具体客户端支持情况、工具名称和权限语义不同。不要把某客户端的逗号列表或通配表达式当成跨工具规范，也不要把技能内工具声明解释成对沙箱、组织策略或用户授权的覆盖。

### 8.3 Claude Code 的调用与隔离是两个维度

| 配置 | 解决的问题 |
| --- | --- |
| `disable-model-invocation: true` | 阻止模型自动调用该技能，由用户显式启动 |
| `user-invocable: false` | 从用户 `/` 菜单隐藏；模型是否可用另看调用设置 |
| `context: fork` | 在独立子代理上下文执行 |
| `agent` | 为 fork 场景指定代理 |
| `hooks` | 配置技能生命周期内适用的 hooks，按当前文档核对事件 |

这些都是需要客户端支持的语义。`context: fork` 的技能正文应提供明确任务；仅写一份背景参考资料而没有任务，不会自动得到有意义的子代理结果。

### 8.4 Cursor 的 `paths` 负责技能适用文件

```yaml
paths:
  - 'src/components/**/*.vue'
  - 'src/styles/**'
```

这是 Cursor **Skill** 的文件范围扩展。旧 Skill `globs` 被接受为回退，新 Skill 使用 `paths`。Cursor `.cursor/rules/*.mdc` 仍有自己的 `globs` 语义，两者不能批量互换。

### 8.5 目录复用必须基于支持矩阵

`.agents/skills/` 已在当前 Codex 公开实现与 Cursor 官方文档中明确出现，不能再把它写成“未确认的民间目录”。但 Claude Code、Kiro 等工具的原生目录仍需分别设置，不要从两个产品支持推出全部产品支持。

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
- Cursor：保留原生 Skill，按需加 `paths`；长期规则另放 `.cursor/rules` 或 AGENTS.md
- Claude：放入 `.claude/skills/<name>/SKILL.md`，直接使用 `/name` 入口

---

## 十、总结

真正能长期抗过时的进阶技巧，其实就三条：

1. 把触发条件写进 `description`
2. 把长知识拆进 `references/`
3. 把重复动作收进 `scripts/`

至于那些看起来很炫的“高级字段”，现在都应该带着一个默认前缀去看：

**这是不是某个工具、某个版本、某个页面里的专属能力，而不是所有技能系统共享的稳定真相？**

只要你先有这个判断，后面不管写 Codex skill、Kiro skill，还是把同样思路迁移到 Cursor / Claude，都不会那么容易踩过时坑。


## 验证进阶配置是否真的改善任务

将触发准确性与执行正确性分别检查：一组任务应该触发，一组相近但不匹配的任务不应触发；再检查输出证据、脚本退出码和错误处理。多技能都能匹配时，优先收紧 description 和适用范围，避免堆叠重复指令。

针对脚本，把参数、工作目录、依赖和写入范围写清；批处理先 dry-run，失败时停止并报告已完成范围。长工具输出优先摘要与定位线索，按需读取详细记录，避免“渐进披露”最后变成一次灌入全部文档。

## 参考资料（2026-11-18 核验）

- [Agent Skills Specification](https://agentskills.io/specification)
- [Claude Code Skills：调用控制、fork 与动态上下文](https://code.claude.com/docs/en/skills)
- [Cursor Skills：paths 与发现范围](https://cursor.com/docs/skills)
- [Kiro Agent Skills](https://kiro.dev/docs/skills/)
- [Codex 技能根目录公开实现](https://github.com/openai/codex/blob/main/codex-rs/ext/skills/src/host_roots.rs)
- [OpenAI Plugins](https://github.com/openai/plugins)
