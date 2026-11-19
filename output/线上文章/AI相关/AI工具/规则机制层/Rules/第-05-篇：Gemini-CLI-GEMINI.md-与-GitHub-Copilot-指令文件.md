---
title: "第 05 篇：Gemini CLI GEMINI.md 与 GitHub Copilot 指令文件"
slug: "ai-rules-gemini-copilot-geminicli-copilot-853f4742"
summary: "按 2026-11-18 官方资料更新 Gemini CLI 的分层上下文、JIT、文件名与 memory 命令差异；按 GitHub.com、VS Code、Agent 和 code review 区分 Copilot 指令支持与优先级。"
category: "Rules"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Rules"
tags:
  - "Gemini CLI"
  - "GEMINI.md"
  - "GitHub Copilot"
  - "copilot-instructions"
  - "AI规则文档"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291d8a2b1c68f2cac00c"
originalSlug: "ai-rules-gemini-copilot-geminicli-copilot-853f4742"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.681Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 05 篇：Gemini CLI GEMINI.md 与 GitHub Copilot 指令文件

> 核验日期：2026-11-18。本文区分产品、客户端和任务入口；官方页面存在命令差异时如实标注，最终以安装版本的帮助信息为准。

[[toc]]

## 一、Gemini CLI 的 GEMINI.md

GEMINI.md 用于给 Gemini CLI 提供持续的项目上下文。它是 Markdown 文件，可以包含项目背景、代码约定、构建与验证命令，也支持导入其他文件。

规则、MCP 配置、技能安装和执行权限是不同能力。把一条命令写进 GEMINI.md，只是在提供任务指导，不会自动安装工具或授予操作权限。

### 1.1 三层上下文

| 层级 | 发现位置 | 典型用途 |
| --- | --- | --- |
| 全局 | `~/.gemini/GEMINI.md` | 跨项目个人指导 |
| 环境与工作区 | 已配置工作区及其父目录 | 项目背景、共享约定 |
| JIT 即时上下文 | 工具访问的文件/目录及其祖先，直到信任根 | 当前模块专属指导 |

文件内容会组合为指导上下文。JIT 的意义是访问相关目录时再带入指导，不必一开始就装入所有子目录内容。

```text
project/
├── GEMINI.md
├── backend/
│   ├── GEMINI.md
│   └── src/
└── frontend/
    ├── GEMINI.md
    └── src/
```

不能仅凭“目录越深”就推导所有冲突一定按某种机械覆盖算法处理。建议根文件写共识，子目录补充局部要求，并用实际加载内容检查冲突。

### 1.2 最小项目示例

```markdown
# 项目指导

## 环境
- 使用 package.json 声明的命令与锁文件。
- 前后端分别安装依赖，先确认当前工作目录。

## 开发
- 复用现有接口校验、错误处理与权限能力。
- 文件编码统一为 UTF-8 无 BOM。
- 不把密钥写入代码、配置示例或日志。

## 验证
- 修改前端运行前端构建。
- 修改后端运行相关测试。
- 交付时说明实际完成的验证。
```

个人偏好放全局，团队规范放工作区。不要把某个项目的语言风格无条件推广到所有项目。

### 1.3 `/memory` 的当前文档差异

本次实际核验发现，Gemini 官方两处页面的命令名称并不完全一致：

| 官方页面 | 当前列出的相关命令 |
| --- | --- |
| GEMINI.md 专题页 | `/memory show`、`/memory reload` |
| Command reference | `/memory list`、`/memory refresh`、`/memory show` |

因此可以先用：

```text
/memory show
```

它用于查看实际已加载的拼接指导。刷新时，查看安装版本 `/memory` 的补全或帮助；若提供 `refresh` 就使用 `/memory refresh`，若该版本提供 `reload` 则使用 `/memory reload`。不要仅根据旧文章把其中一个写成永久唯一名称。

当前 Command reference 未列出 `/memory add`，不能继续保证这个旧教程中的子命令可用。需要持久化指导时直接编辑对应 GEMINI.md，再按安装版本提供的方式刷新。

### 1.4 导入与自定义文件名

```markdown
# 项目指导
@./docs/architecture.md
@./docs/testing.md
```

官方说明 `@file.md` 支持相对与绝对路径。导入内容来自文件本身，应避免将机器专属绝对路径提交给团队，也不要导入敏感文件。

在 `settings.json` 中可以指定一个名称或名称列表：

```json
{
  "context": {
    "fileName": ["AGENTS.md", "GEMINI.md"]
  }
}
```

这意味着把 AGENTS 加入上下文发现，而不是默认文件名已经从 GEMINI 改为 AGENTS。若同一份规范既被自动发现又被另一个文件导入，应检查实际上下文是否重复，选用一种清晰的共享方式。

## 二、Copilot 不是一个统一的加载器

GitHub Copilot 覆盖 GitHub.com、VS Code、其他 IDE、CLI、cloud agent 和 code review。是否支持某类指令，要同时说明**在哪里使用、在执行什么任务**。

例如，GitHub.com 的 code review 支持范围不能直接套到 VS Code 的 code review；VS Code 中不同 Agent harness 也可能使用不同文件格式。

### 2.1 三类仓库指令

| 类型 | 文件 | 常见作用 |
| --- | --- | --- |
| 仓库级 | `.github/copilot-instructions.md` | 整个仓库的共同指导 |
| 路径级 | `.github/instructions/**/*.instructions.md` | `applyTo` 匹配文件时的指导 |
| Agent 指令 | `AGENTS.md`、部分使用面中的 `CLAUDE.md` / `GEMINI.md` | 兼容 Agent 生态的项目指导 |

Agent 指令文件与 `.github/agents/` 中的 custom agent 定义不是一回事。前者给现有 Agent 提供指导，后者定义专门的 Agent 配置。

### 2.2 关键支持矩阵

以下为本次官方矩阵明确列出的仓库相关能力；个人与组织设置另有作用范围。

| 使用面 | 仓库级 | 路径级 | Agent 文件 |
| --- | --- | --- | --- |
| GitHub.com Copilot Chat | 支持 | 该矩阵未列为此入口能力 | 该矩阵未列为此入口能力 |
| GitHub.com cloud agent | 支持 | 支持 | AGENTS / CLAUDE / GEMINI |
| GitHub.com code review | 支持 | 支持 | AGENTS / CLAUDE / GEMINI / REVIEW |
| VS Code Copilot Chat | 支持 | 支持 | AGENTS |
| VS Code cloud agent | 支持 | 支持 | AGENTS / CLAUDE / GEMINI |
| VS Code code review | 支持 | 该矩阵未列为此入口能力 | 该矩阵未列为此入口能力 |

此表不能代替每个版本的 IDE 功能矩阵。对 JetBrains、Visual Studio、Xcode 等客户端，按官方支持矩阵选择对应栏目，不推断它们与 VS Code 一致。

旧文“VS Code 子目录 AGENTS 永远默认关闭”也不应脱离客户端与 harness 版本固定保留。使用当前 Agent Customizations 界面查看发现情况，再用同一 harness 的新会话验证。

## 三、Copilot 实战配置

### 3.1 仓库级指令

```markdown
# 仓库约定

- 沿用当前语言、包管理器和测试框架。
- 接口输入统一走已有参数校验。
- 修改公共组件前检查受影响调用方。
- 不修改生成目录，不提交凭证。
- 完成后说明相关构建与测试结果。
```

保存为 `.github/copilot-instructions.md`。所谓“仓库级”是作用域，不表示所有 Copilot 功能无条件读取它；仍要满足该使用面的支持与设置条件。

### 3.2 路径级指令

保存为 `.github/instructions/typescript.instructions.md`：

```markdown
---
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# TypeScript 业务代码
- 外部输入先做运行时校验。
- 复用既有领域类型，避免重复定义接口契约。
- 覆盖空值、异常和权限边界。
```

官方支持 `applyTo` 中使用逗号分隔多个 glob。匹配模式的 `*` 与 `**` 不同：`src/*.ts` 不会递归匹配更深目录，`src/**/*.ts` 才覆盖子目录。

针对支持 cloud agent 和 code review 的入口，可以排除其中一种：

```markdown
---
applyTo: "**"
excludeAgent: "code-review"
---

# 实现任务约定
- 修改前先定位现有模块和相应测试。
```

官方当前支持的 `excludeAgent` 值包括 `code-review` 和 `cloud-agent`。这不是任意 Agent 名称黑名单，也不是跨客户端通用的权限设置。

### 3.3 AGENTS 与替代文件

GitHub 的 Agent 指令说明允许仓库内多个 AGENTS.md，并规定目录树中最近的 AGENTS 优先。支持的入口还可使用根目录的单个 CLAUDE.md 或 GEMINI.md 作为替代。

这不构成 `AGENTS > CLAUDE > GEMINI` 的通用三级优先表。若同时放多个来源，应先确认所用入口的实际发现与组合规则，避免重复和冲突。

## 四、优先级与审查分支

GitHub 当前概念文档明确：**大多数客户端和使用面，包括 Copilot CLI、VS Code 和 Visual Studio，会组合适用指令，但没有统一的一般优先级顺序**。

Copilot Chat on GitHub.com 单独给出从高到低的关系：个人指导、适用仓库指导、组织指导；仓库层内部还区分路径、仓库级与 Agent 来源。这是该使用面的说明，不能与支持矩阵分开后推导成所有入口都加载这些文件。

官方还说明，审阅 PR 时从 **head branch，也就是包含变更的分支**读取仓库指令、Agent 指令与 Skills。团队可以在同一个 PR 中测试指导变化，但也需要审阅这些文件本身的修改。

自定义指令不保证生成结果百分之百合规，强制要求仍应由 CI、仓库保护和权限检查落实。

## 五、VS Code 中的发现与验证

当前 VS Code 文档按所选 harness 区分格式：

- Copilot 使用 `.github/copilot-instructions.md` 或 AGENTS.md。
- Claude harness 使用 CLAUDE.md 与其路径规则。
- Codex harness 使用 AGENTS.md 与目录作用域。

通过 **Chat: Open Customizations** 打开 Instructions，确认文件可见；这一步只证明发现，不能证明每次任务都激活或完全遵守。

然后在同一个 harness、同一个仓库的新会话中做一个最小任务，验证文件匹配和输出。不要使用另一种 harness 的结果判断这份规则是否正常。

## 六、多工具团队的推荐分工

```text
project/
├── AGENTS.md
├── GEMINI.md
├── CLAUDE.md
├── .github/
│   ├── copilot-instructions.md
│   └── instructions/
│       ├── api.instructions.md
│       └── testing.instructions.md
└── docs/
    ├── architecture.md
    └── testing.md
```

共享核心放一个权威文件；Gemini 用导入或文件名配置复用，Claude 按版本和设置选择直接 AGENTS 或导入，Copilot 保留实际使用面需要的仓库与路径指导。

不要为了“全兼容”把全部内容复制到每个入口。维护时同时记录适用客户端、触发条件、验证方法和上次核验日期，才能在升级后定位变化。

## 官方资料与差异说明

- [Gemini CLI：GEMINI.md](https://geminicli.com/docs/cli/gemini-md/)
- [Gemini CLI：Command reference](https://geminicli.com/docs/reference/commands/)
- [GitHub Copilot：About customizing responses](https://docs.github.com/en/copilot/concepts/prompting/response-customization)
- [GitHub Copilot：Repository instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
- [GitHub Copilot：指令支持矩阵](https://docs.github.com/en/copilot/reference/custom-instructions-support)
- [VS Code：Custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

Gemini 的 `reload` / `refresh` 差异是本次读取官方页面时实际观察到的文档差异，未假定两者在每个版本中互为别名。Copilot 表格只描述对应使用面，不把没有列出的能力写成整个产品永久不支持。
