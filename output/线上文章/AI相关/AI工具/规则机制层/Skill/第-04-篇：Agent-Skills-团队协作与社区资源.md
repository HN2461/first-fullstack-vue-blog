---
title: "第 04 篇：Agent Skills 团队协作与社区资源"
slug: "ai-skill-agentskills-4a94dc23"
summary: "按 2026-11-18 更新团队技能目录、Codex/Cursor 插件分发、Claude 项目安装与云端边界，保留团队协作策略并补充版本、来源和回归验收。"
category: "Skill"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Skill"
tags:
  - "Agent Skills"
  - "SKILL.md"
  - "团队协作"
  - "社区资源"
  - "Codex"
  - "Kiro"
  - "Cursor"
  - "Claude Code"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291d8a2b1c68f2cac024"
originalSlug: "ai-skill-agentskills-4a94dc23"
originalStatus: "published"
publishedAt: "2026-05-24T14:29:34.184Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 04 篇：Agent Skills 团队协作与社区资源

> 核验日期：2026-11-18。重点更新团队目录、插件分发、项目安装和本地/云端验收差异。


## 一、团队协作先别急着问“放哪”，先问“用什么载体”

很多团队共享失败，不是因为 skill 写得不好，而是因为一开始就选错了载体。

到 2026-11-18 这次复核为止，更实用的划分是：

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

## 二、Codex 团队共享：版本化源文件与安装目录分开

### 2.1 单仓库技能

当前公开实现读取项目 `.agents/skills/`，适合随业务代码一起维护：

```text
my-project/
├── AGENTS.md
└── .agents/
    └── skills/
        └── code-review/
            ├── SKILL.md
            └── references/checklist.md
```

个人级技能可用 `~/.agents/skills/`；旧 `$CODEX_HOME/skills` 保留兼容。团队目录不要写开发者用户名、绝对路径或插件缓存版本号。

### 2.2 多仓库能力包

多个仓库共用同一组流程时，可以维护独立技能仓库，或将多个 skills 与 MCP/应用配置组成 Codex Plugin。OpenAI 当前示例在 `openai/plugins`，旧 `openai/skills` 已明确废弃。

选用 Plugin 的理由应是需要统一安装、依赖与版本管理，而不是技能必须插件化才能共享。团队仍需记录来源、更新负责人和回滚方式。

### 2.3 客户端版本与环境

项目目录支持以当前公开实现为依据，旧稳定版可能有差异。团队约定最低客户端版本，并用真实任务检查技能发现、引用路径和脚本依赖。终端、IDE、桌面和云环境不要共用“某台机器已安装”这一条验收结论。

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

当前原生支持 `.agents/skills/` 和 `.cursor/skills/`，对应用户级目录也受支持；兼容目录按官方文档核对。多能力分发可以使用 Cursor Plugins 或 Agent Plugins，不能再把 Cursor 归为没有插件体系的工具。

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

## 五、Claude Code：项目 Skill、插件与云会话分别管理

单仓库流程放 `.claude/skills/<name>/SKILL.md`，即可提供 `/name` 入口。旧 `.claude/commands/*.md` 可继续维护；新流程不需要额外复制一个 command。

多能力插件可选择 `project` scope，并提交 `.claude/settings.json`。这只共享启用配置，不会替每位成员下载安装到本机；同事仍需添加对应 marketplace 并在自己的 clone 安装。

```bash
claude plugin install <plugin>@<marketplace> --scope project
```

命令中的名称需要替换成团队真实 catalog。`managed` 由组织管理，不能当作普通用户可自行选择的安装范围。

本地技能和插件不自动进入云会话。Claude 当前云端、Cowork 与项目云线程在账号同步和仓库技能方面存在区别，应依据实际入口检查。团队发布记录至少注明“本地终端验证”还是“云会话验证”，不要混写为全面兼容。

长期项目约定仍放 `CLAUDE.md` 或当前客户端支持的规则文件。插件根目录放一个 `CLAUDE.md` 不会自动让所有任务读取它。

---

## 六、社区资源现在应该怎么筛

这次复核后，我更建议把资源分成两类：

## 6.1 第一优先级：官方或直接产品方资源

- [OpenAI Plugins 仓库](https://github.com/openai/plugins)
- [Kiro Agent Skills 文档](https://kiro.dev/docs/skills/)
- [Cursor 2.4 更新说明](https://cursor.com/changelog/2-4)
- [Cursor Rules 文档](https://cursor.com/docs/rules)
- [Cursor Skills 文档](https://cursor.com/docs/skills)
- [Claude Code Skills 文档](https://code.claude.com/docs/en/skills)

这些资源的价值在于：

- 至少能确认“官方当前把什么当主路径”
- 不会把社区层的玩法误写成产品唯一真相

## 6.2 第二优先级：GitHub 上的具体 skill 仓库

如果你要找可直接借鉴的 skill，实现上比“社区市场首页”更靠谱的通常是：

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
- `.claude/commands`（仅维护旧格式；新流程使用 Skills）

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
- Claude Code：Skills 同时提供主流程与快捷入口，`CLAUDE.md` 维护长期项目说明

如果你要给团队定一条最简单的落地规则，我建议直接用这句：

**长期规范进宿主规则与记忆体系，任务流程进 Skills，使用宿主提供的快捷入口，可执行逻辑进 scripts。**

这样以后就算产品继续演进，迁移成本也会低很多。


## 团队验收与升级记录

建议每次版本升级记录以下信息：来源仓库和 commit/tag、许可证、维护人、最低客户端版本、脚本依赖、所需服务权限、验证过的任务，以及回滚目标。社区排行榜和收藏数不能替代这些信息。

保留一组稳定样例：明确调用、自然触发、误触发反例、缺少凭据、脚本失败和权限不足。更新描述或参考文档后重跑受影响样例，确认没有引入无关触发和外部副作用。用于质量保证的 hooks 与 CI 应按工具真实机制配置，不能只在 Skill 中写“必须成功”就认为形成了强制校验。

## 参考资料（2026-11-18 核验）

- [Agent Skills Specification](https://agentskills.io/specification)
- [Codex 技能根目录公开实现](https://github.com/openai/codex/blob/main/codex-rs/ext/skills/src/host_roots.rs)
- [OpenAI Plugins](https://github.com/openai/plugins)
- [OpenAI Skills 废弃说明](https://github.com/openai/skills)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code 插件安装与 scope](https://code.claude.com/docs/en/plugins/install)
- [Cursor Skills](https://cursor.com/docs/skills)
- [Cursor Plugins](https://cursor.com/docs/plugins)
- [Kiro Agent Skills](https://kiro.dev/docs/skills/)
