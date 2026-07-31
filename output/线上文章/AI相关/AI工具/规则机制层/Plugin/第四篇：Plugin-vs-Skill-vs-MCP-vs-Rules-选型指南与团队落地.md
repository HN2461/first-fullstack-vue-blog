---
title: "第四篇：Plugin vs Skill vs MCP vs Rules 选型指南与团队落地"
slug: "ai-plugin-plugin-a8202a00"
summary: "通过对比矩阵、选型决策树和团队协作策略，帮助开发者在 Plugin、Skill、MCP、Rules 四大扩展机制中做出更稳妥的选择，并给出 Codex、Claude Code 与无独立 Plugin 体系工具的落地方案。"
category: "Plugin"
tags:
  - "Plugin"
  - "Skill"
  - "MCP"
  - "Rules"
  - "选型指南"
  - "团队协作"
  - "Codex"
  - "Claude Code"
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291d8a2b1c68f2cabfe4"
originalSlug: "ai-plugin-plugin-a8202a00"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第四篇：Plugin vs Skill vs MCP vs Rules 选型指南与团队落地

> 资料来源：本系列前三篇、OpenAI Codex 官方资料、Claude Code 官方插件文档。2026-07-04 按最新官方口径重整选型建议。

[[toc]]

---

## 一、四大扩展机制对比矩阵

### 1.1 核心属性对比

| 属性 | Rules | MCP | Skill | Plugin |
| --- | --- | --- | --- | --- |
| **本质** | 静态规则层 | 外部能力接入层 | 单任务流程模板 | 打包与分发层 |
| **典型内容** | 规范文档、偏好说明 | server、tools、resources、prompts | `SKILL.md` 与辅助资源 | Skills、Commands、Hooks、集成、配置 |
| **解决的问题** | AI 每次都要遵守什么 | AI 怎么连外部系统 | 这件事应该怎么做 | 这套能力怎么安装、共享、复用 |
| **生效方式** | 默认长期生效 | 按需调用 | 按触发条件使用 | 通过工具原生安装 / 启用流程生效 |
| **分享方式** | Git 提交共享 | 配置或服务共享 | Git / 模板仓库 / 插件打包 | marketplace / CLI / 本地源 / 团队分发 |
| **版本感知** | 通常靠 Git | 配置与服务自行维护 | 通常靠 Git | 更容易进入工具原生版本、启用、更新体系 |
| **最适合什么** | 团队规范 | 连外部能力 | 重复任务流程 | 多能力组合与团队复用 |

### 1.2 一句话判断

| 问题 | 更适合的机制 |
| --- | --- |
| AI 每次都忘了项目规范 | Rules |
| AI 需要查外部系统 / 调工具 | MCP |
| 某个任务总是重复、步骤稳定 | Skill |
| 多种能力需要打成一个可安装包 | Plugin |
| 团队成员环境经常不一致 | Plugin + Rules |

---

## 二、选型决策树

当你面对一个需求时，可以先按下面这条线判断：

```text
需求是什么？
│
├─ 是“每次都要遵守的长期规范”？
│  └─ ✅ 用 Rules
│
├─ 是“需要接入外部服务或工具”？
│  └─ ✅ 用 MCP
│
├─ 是“某个任务的标准做法”？
│  ├─ 只在当前团队 / 当前仓库里用？
│  │  └─ ✅ 先用 Skill
│  └─ 需要打包给别人统一安装？
│     └─ ✅ 升级成 Plugin
│
├─ 是“多种能力要组合起来分发”？
│  └─ ✅ 用 Plugin
│
└─ 不确定？
   └─ 先从最轻的开始：Rules → Skill / MCP → Plugin
```

一句口诀仍然成立：

> **规范写 Rules，连外用 MCP，流程写 Skill，打包做 Plugin。**

---

## 三、按工具选型速查

### 3.1 Codex 选型速查

| 需求 | 推荐 |
| --- | --- |
| 项目规范 | `AGENTS.md` |
| 个人偏好 | `~/.codex/AGENTS.md` |
| 连接外部服务 | MCP |
| 单一任务流程 | `~/.codex/skills/` 或插件内的 skill |
| 多能力打包分发 | Codex Plugin |
| 团队统一插件源 | 维护 marketplace source，并通过 `codex plugin marketplace ...` 管理 |

这里最重要的一条修正是：

- Codex 现在更稳妥的 CLI 入口是 `codex plugin marketplace ...`
- 不要把它直接写成 Claude Code 风格的 `/plugin install`

### 3.2 Claude Code 选型速查

| 需求 | 推荐 |
| --- | --- |
| 项目规范 | `CLAUDE.md` |
| 个人偏好 | `~/.claude/CLAUDE.md` + settings / memory |
| 连接外部服务 | MCP |
| 快捷命令 | `.claude/commands/*.md` |
| 单一任务流程 | Skill |
| 多能力打包分发 | Claude Code Plugin |
| 插件共享范围 | 根据 `user` / `project` / `local` / `managed` scope 选择 |

### 3.3 Cursor 选型速查

| 需求 | 推荐 |
| --- | --- |
| 项目规范 | `.cursor/rules` + 根目录 `AGENTS.md` |
| 连接外部服务 | MCP |
| 任务流程 | Rules / Prompt 体系 / 约定化模板 |
| 多能力组合 | 没有独立 Plugin 体系，组合 Rules + MCP + VS Code 扩展 |

### 3.4 Devin Desktop / Windsurf 选型速查

| 需求 | 推荐 |
| --- | --- |
| 项目规范 | Rules |
| 连接外部服务 | MCP |
| 任务流程 | Skills / Workflows |
| 多能力组合 | 没有独立 Plugin 体系，组合 Rules + Skills + MCP；规则路径按当前 Devin / Windsurf 文档复核 |

### 3.5 Kiro 选型速查

| 需求 | 推荐 |
| --- | --- |
| 项目规范 | steering |
| 连接外部服务 | MCP |
| 任务流程 | `.kiro/skills/` |
| 规格驱动 | specs |
| 多能力组合 | 没有独立 Plugin 体系，组合 skills + hooks + MCP |

---

## 四、什么时候该把 Skill 升级成 Plugin

这是最实用的判断点之一。

### 4.1 继续用 Skill 就够了

满足以下大多数条件时，先别急着做 Plugin：

- 只解决一个任务
- 主要内容是流程说明
- 没有太多外部集成
- 只在当前仓库或当前团队小范围使用
- 手动放置和维护成本还可以接受

### 4.2 该升级成 Plugin 了

当你开始出现这些信号时，就很适合做 Plugin：

- 需要把多个 Skill 一起发给别人
- 同时依赖命令、Hook、MCP、Subagent、LSP 等多个组件
- 团队成员经常装错、漏装、装不一致
- 需要明确启用 / 禁用 / 更新
- 希望接入官方或团队 marketplace

一句工程化判断：

> **当问题从“怎么做这件事”变成“怎么把这套能力稳定装给别人”时，就已经开始进入 Plugin 领域了。**

---

## 五、没有独立 Plugin 体系时的替代方案

Cursor、Devin Desktop / Windsurf、Kiro 当前没有像 Codex / Claude Code 那样成熟的独立 Plugin 体系，但不代表没法落地。

### 5.1 替代方案 1：Rules + MCP

适合：

- 规范需要长期生效
- 主要能力来自外部系统
- 任务流程不算复杂

### 5.2 替代方案 2：模板仓库

适合：

- 团队要统一目录结构
- 需要把 rules、skills、mcp 配置一起带走
- 还没有原生 plugin marketplace

一个常见做法：

```text
project-template/
├── AGENTS.md
├── .cursor/rules/
├── .kiro/skills/
├── .mcp.json
└── scripts/setup.*
```

### 5.3 替代方案 3：共享 MCP 服务 + 文档化流程

适合：

- 团队的核心价值在外部工具接入
- 任务流可以先靠文档和 code review 约束
- 还不想维护插件包

换句话说：

> **没有独立 Plugin，不代表做不了“类似效果”；只是你需要用 Rules、MCP、模板仓库把能力拼起来。**

---

## 六、团队协作策略

### 6.1 小团队（3-5 人）

| 机制 | 推荐做法 |
| --- | --- |
| Rules | 仓库根目录统一维护 |
| MCP | 提供一份模板配置，每人补自己的 token |
| Skill | 先放项目内或团队文档仓库 |
| Plugin | 只把高频、多人复用的组合能力打成插件 |

小团队最怕的是"为了工程化而工程化"。先把真正高频、最容易装错的那一套打包即可。

### 6.2 中型团队（5-20 人）

| 机制 | 推荐做法 |
| --- | --- |
| Rules | 项目规则 + 工具专属规则并行维护 |
| MCP | 共享服务或共享配置模板 |
| Skill | 团队技能库 |
| Plugin | 建立团队内部插件仓库或 marketplace source |

这里的关键点是：

- Codex 更适合维护团队自己的 marketplace source
- Claude Code 更适合明确 `project` scope 与 marketplace 来源

### 6.3 大型团队 / 企业

| 机制 | 推荐做法 |
| --- | --- |
| Rules | 组织级基线 + 项目级覆盖 |
| MCP | 网关化、鉴权、审计 |
| Skill | 统一技能库与版本管理 |
| Plugin | 统一审核、统一源、统一启用策略 |

插件在企业里真正值钱的地方，往往不是"多方便"，而是：

- 能统一分发
- 能审计来源
- 能控制版本
- 能按 scope 或组织策略下发

---

## 七、常见误区与避坑

### 7.1 误区：所有东西都做成 Plugin

**问题**：把一条规则、一个单独 Skill、一个临时流程都插件化，会显著增加维护成本。

**正确做法**：先从最轻的机制开始，确认存在真实的打包和分发需求，再升级成 Plugin。

### 7.2 误区：Skill 无法共享，只有 Plugin 能共享

**问题**：这会把 Skill 说得太绝对。

**正确做法**：Skill 当然可以通过 Git、模板仓库、团队知识库共享，只是它通常没有 Plugin 那样统一的原生安装与 marketplace 语义。

### 7.3 误区：Plugin 可以替代 MCP / Skill / Rules

**问题**：Plugin 是打包层，不是底层能力本身。

**正确做法**：先理解 Rules、Skill、MCP 各自解决什么，再决定是否把它们组合成 Plugin。

### 7.4 误区：把 Codex 和 Claude Code 的命令混写

**问题**：这是最容易误导读者的一类错误。

**正确做法**：

- Codex 现在更稳妥地写 `codex plugin marketplace ...`
- Claude Code 才是 `/plugin install ...`、`/plugin marketplace ...`

### 7.5 误区：把 marketplace 仓库结构和用户本机配置混为一谈

**问题**：会把仓库里的 catalog 文件误写成用户真实配置路径。

**正确做法**：

- Codex 用户侧重点看 `~/.codex/config.toml`
- Marketplace 仓库内部的 `.agents/plugins/marketplace.json` 是仓库结构的一部分，不等于用户主配置路径

### 7.6 误区：Claude Code 每个插件都必须有 `plugin.json`

**问题**：这已经不符合当前官方文档。

**正确做法**：`.claude-plugin/plugin.json` 是可选的；如果写 manifest，`name` 是唯一必填字段。

---

## 八、四种机制组合的一个更稳妥示例

假设你要搭一套团队前端工作流：

```text
my-project/
├── AGENTS.md                    # Rules：项目规范
├── .mcp.json                    # MCP：GitHub、Figma、文档系统等
├── skills/                      # Skill：局部任务流程
└── plugins/                     # Plugin：面向团队安装的能力包
```

如果落到不同工具上：

- **Codex**
  - Rules 写在 `AGENTS.md`
  - 单任务流程放 skill
  - 团队复用能力打成 Codex Plugin，并维护 marketplace source
- **Claude Code**
  - Rules 写在 `CLAUDE.md`
  - 任务流程写 skill / commands
  - 多能力组合打成 Plugin，并按 `project` 或 `user` scope 分发

---

## 九、总结：选型核心原则

1. **先问“问题属于哪一层”**
   是规范、接入、流程，还是打包与分发
2. **先用最轻的机制**
   不要一开始就插件化
3. **当你要解决“统一安装”问题时，再考虑 Plugin**
4. **同样叫 Plugin，不同工具的命令、manifest、marketplace 都不一样**
5. **官方文档优先，二手经验帖只能做补充**

---

## 十、参考资料

- [OpenAI Academy: Codex Plugins and Skills](https://openai.com/academy/codex-plugins-and-skills/)
- [OpenAI Codex 官方文档：Plugins](https://developers.openai.com/codex/plugins)
- [OpenAI Plugins 官方仓库](https://github.com/openai/plugins)
- [Claude Code: Create plugins](https://code.claude.com/docs/en/plugins)
- [AI 工具 Plugin 插件体系系列目录](../目录.md)
