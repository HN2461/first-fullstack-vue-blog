---
title: "Agent Skills 团队协作与社区资源"
slug: "ai-skill-agentskills-4a94dc23"
summary: "按 2026-07-04 重新整理 Agent Skills 的团队协作方案与资料来源，重点说明 Codex / Kiro / Cursor / Claude 当前如何共享 skills，以及 rules / AGENTS / CLAUDE / commands 分别适合沉淀什么。"
category: "Skill"
tags:
  - "Agent Skills"
  - "SKILL.md"
  - "团队协作"
  - "社区资源"
  - "Codex"
  - "Kiro"
  - "Cursor"
  - "Claude Code"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cac024"
originalSlug: "ai-skill-agentskills-4a94dc23"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# Agent Skills 团队协作与社区资源

## 一、团队协作先别急着问“放哪”，先问“用什么载体”

很多团队共享失败，不是因为 skill 写得不好，而是因为一开始就选错了载体。

到 2026-07-04 这次复核为止，更实用的划分是：

| 目标 | 更推荐的载体 |
| ---- | ------------ |
| Codex 的可复用工作流 | `SKILL.md` 技能目录 |
| Kiro 的可复用工作流 | `.kiro/skills/` |
| Cursor 的任务流程包 | Cursor skills |
| Cursor 的项目长期规范 | `.cursor/rules` 或根目录 `AGENTS.md` |
| Claude Code 的任务流程包 | Claude skills |
| Claude Code 的快捷工作流 | `.claude/commands/` |
| 长期始终生效的团队背景知识 | `AGENTS.md` / `CLAUDE.md` / rules / memory |

一句话总结：

- **任务型流程** 更适合 skills 或 commands
- **长期型约束** 更适合 rules / memory / `AGENTS.md`

---

## 二、Codex 团队共享：现在是最清晰的一类

## 2.1 本地现状已经说明它可行

当前本机真实可见：

```text
~/.codex/skills/
```

并且里面已经有：

- `.system` 预装层
- 自定义 skills
- `agents/`、`scripts/`、`references/`、`assets/` 等常见资源目录

这意味着 Codex 团队共享 skills 不是纸上谈兵，而是可以直接围绕已有目录结构来做。

## 2.2 团队推荐做法

如果主人团队准备在 Codex 里沉淀一套能力包，现在更推荐：

### 方式 A：单独 skill 仓库

```text
team-codex-skills/
├── code-review/
│   ├── SKILL.md
│   └── references/
├── release-audit/
│   ├── SKILL.md
│   └── scripts/
└── frontend-design/
    └── SKILL.md
```

优点：

- 可以单独 review
- 可以单独发版本
- 不和业务代码混在一起

### 方式 B：放在主仓库并配项目说明

```text
my-project/
├── .codex/
│   └── skills/
├── AGENTS.md
└── src/
```

适合：

- 这个 skill 只服务当前项目
- 技能内容和项目规范强耦合

## 2.3 安装与来源

当前能明确确认的来源，是 OpenAI 官方 `openai/skills` 仓库。

它里面区分了：

- `.system`
- `.curated`
- `.experimental`

并且官方仓库说明：

- `.system` 随新版 Codex 自动安装
- curated / experimental 可通过 `skill-installer` 安装

所以如果主人问“Codex 团队从哪里拿基础 skill 最稳”，答案优先是：

**先看 `openai/skills`，再考虑其他社区来源。**

---

## 三、Kiro 团队共享：官方路径同样很清晰

## 3.1 当前官方路径

Kiro 当前官方文档明确写了两层：

- workspace：`.kiro/skills/`
- global：`~/.kiro/skills/`

并且同名时 workspace 优先。

## 3.2 团队最推荐的方式

把 `.kiro/skills/` 跟项目一起进 Git，是最直接的办法：

```text
my-project/
├── .kiro/
│   └── skills/
│       ├── code-review/
│       ├── deploy-check/
│       └── docs-refresh/
└── src/
```

这样做的好处：

- clone 下来就能共用
- skill 版本跟着项目版本走
- review 流程清晰

## 3.3 自定义 agent 的额外注意点

如果团队不用默认 agent，而是大量自定义 agent，那么要补这一层：

```json
{
  "name": "team-agent",
  "resources": [
    "skill://.kiro/skills/*/SKILL.md",
    "skill://~/.kiro/skills/*/SKILL.md"
  ]
}
```

否则很容易出现：

- skill 明明在仓库里
- 某个 agent 却始终不加载

---

## 四、Cursor 团队共享：现在应分成 Skills 与 Rules 两层

Cursor 当前官方能明确确认的是：

- 2.4 已明确支持 Agent Skills
- `.cursor/rules`
- 用户 Rules
- 根目录 `AGENTS.md`

所以团队在 Cursor 里做共享时，更推荐：

## 4.1 共享 Cursor skills

适合：

- PR 审查
- 发布检查
- 文档刷新
- 事故排障这类按任务触发的流程包

## 4.2 共享 `.cursor/rules`

适合：

- 按文件范围自动附加
- 按任务类型控制规则
- 想把约束结构化管理

## 4.3 共享根目录 `AGENTS.md`

适合：

- 说明统一代码风格
- 说明架构边界
- 说明仓库内常见约束

例如：

```markdown
# Project Instructions

## Code Style
- Prefer small, reviewable changes
- Add tests for new logic

## Architecture
- Keep data access in repository modules
- Avoid bypassing the service layer
```

这比把长期规则和任务流程混成一层更贴近 Cursor 当前官方能力边界。

---

## 五、Claude Code 团队共享：优先 Skills，再配 Commands / `CLAUDE.md`

Claude Code 当前更稳的官方口径已经是 skills，因此团队协作时更推荐先共享：

- Claude skills
- `.claude/commands/`
- `CLAUDE.md`

### 5.1 什么时候共享 Claude skills

当团队经常重复执行同类流程，并且需要目录化资源时，例如：

- PR 复查
- 提交说明生成
- 发布检查
- 附带 `references/`、`scripts/` 的复杂工作流

### 5.2 什么时候共享 `.claude/commands/`

当团队经常重复执行同类流程时，例如：

- PR 复查
- 提交说明生成
- 发布检查
- 想提供一个非常顺手的快捷入口

### 5.3 什么时候共享 `CLAUDE.md`

当团队想长期固定：

- 代码风格
- 目录职责
- 禁止事项
- 交付习惯

这一层和 skills 的关系，和 Cursor 里的 `AGENTS.md` 很像：

- 一个更像长期项目记忆
- 一个更像按任务触发的流程包

---

## 六、社区资源现在应该怎么筛

这次复核后，我更建议把资源分成两类：

## 6.1 第一优先级：官方或直接产品方资源

- [OpenAI Skills 仓库](https://github.com/openai/skills)
- [Kiro Agent Skills 文档](https://kiro.dev/docs/cli/skills/)
- [Cursor 2.4 更新说明](https://cursor.com/changelog/2-4)
- [Cursor Rules 文档](https://cursor.com/docs/rules)
- [Cursor Skills 文档](https://cursor.com/docs/skills)
- [Claude Code Skills 文档](https://code.claude.com/docs/en/skills)

这些资源的价值在于：

- 至少能确认“官方当前把什么当主路径”
- 不会把社区层的玩法误写成产品唯一真相

## 6.2 第二优先级：GitHub 上的具体 skill 仓库

如果主人要找可直接借鉴的 skill，实现上比“社区市场首页”更靠谱的通常是：

- 直接查看 GitHub 仓库里的 `SKILL.md`
- 看是否带 `scripts/` 和 `references/`
- 看最近是否还有维护

原因很简单：

- 真正决定能不能用的，是 skill 内容本身
- 不是某个聚合站首页写得多热闹

---

## 七、导入社区 skill 前的检查清单

无论是给 Codex、Kiro 还是别的工具导入，至少先看这 7 件事：

1. `description` 是否清楚说明触发场景
2. `SKILL.md` 是否只写流程，而不是堆很多空话
3. `references/` 是否真的有价值，而不是重复正文
4. `scripts/` 会不会做危险操作
5. 是否偷偷依赖某个你本地根本没有的命令或环境变量
6. 最近是否还有更新或 issue 响应
7. 这份 skill 是不是本来只适用于某个工具专属语法

尤其是 `scripts/`，一定要当正常代码审查。

---

## 八、团队里怎么分层最省心

这是我更推荐的一套分法：

### 第一层：长期规范

放这里：

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules`

写：

- 代码风格
- 架构边界
- 命名规范
- 必跑检查

### 第二层：任务流程

放这里：

- `SKILL.md` skills
- `.claude/commands`

写：

- 代码审查流程
- 发布检查流程
- 文档刷新流程
- 事故排障流程

### 第三层：自动化执行

放这里：

- `scripts/`
- 项目已有命令

写：

- 真正可执行的检查
- 真正可重复复用的脚本

这样分层后，团队就不容易出现“所有东西都往一个文件里塞”的混乱。

---

## 九、总结

这次复核后，团队协作最稳的思路不是“所有工具都去共享同一种 skill 仓库”，而是：

- Codex / Kiro：确实适合共享 skills
- Cursor：skills 负责任务流程，rules / `AGENTS.md` 负责长期规范
- Claude Code：skills 负责主流程，commands / `CLAUDE.md` 负责快捷入口与长期记忆

如果主人要给团队定一条最简单的落地规则，我建议直接用这句：

**长期规范进 rules / AGENTS / CLAUDE / memory，任务流程先进 skills，快捷入口再用 commands，可执行逻辑进 scripts。**

这样以后就算产品继续演进，迁移成本也会低很多。
