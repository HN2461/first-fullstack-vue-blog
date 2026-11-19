---
title: "第 04 篇：Cursor Rules、Devin-Windsurf Rules、Kiro Steering 实战"
slug: "ai-rules-cursor-windsurf-kiro-cursor-windsurf-kiro-e5498e74"
summary: "按 2026-11-18 官方文档更新 Cursor MDC、逗号分隔 globs 与嵌套 AGENTS，说明 Devin 和旧 Windsurf 的规则兼容，以及 Kiro Steering 四种模式、CLI V3 差异与文件引用。"
category: "Rules"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Rules"
tags:
  - "Cursor Rules"
  - "Devin / Windsurf Rules"
  - "Kiro Steering"
  - "MDC格式"
  - "AI规则文档"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291d8a2b1c68f2cac002"
originalSlug: "ai-rules-cursor-windsurf-kiro-cursor-windsurf-kiro-e5498e74"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.680Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 04 篇：Cursor Rules、Devin-Windsurf Rules、Kiro Steering 实战

> 核验日期：2026-11-18。本文按当前 Cursor、Devin Local / CLI、Kiro 官方资料整理。Devin 新版本与旧 Windsurf 客户端、Kiro CLI 不同引擎的行为分别说明。

[[toc]]

## 一、Cursor：项目规则和 AGENTS.md

### 1.1 规则来源

Cursor 区分 Project Rules、User Rules、Team Rules 和 AGENTS.md：

| 来源 | 入口 | 用途 |
| --- | --- | --- |
| 项目规则 | `.cursor/rules/*.mdc` | 版本控制、文件范围及任务激活 |
| 用户规则 | Customize → Rules | 跨项目个人偏好 |
| 团队规则 | 团队管理界面 | 团队统一指导，可设置是否强制启用 |
| 共享指导 | 项目根和子目录 `AGENTS.md` | 简单 Markdown 约定 |

新的结构化项目规则使用 `.mdc`。当前官方明确 `.cursor/rules/` 下普通 `.md` 文件会被忽略，不能把它描述为“自动变成手动规则”。旧 `.cursorrules` 项目应按当前客户端的迁移说明处理，新项目优先使用官方当前推荐入口。

### 1.2 MDC 示例与 globs 修正

```markdown
---
description: TypeScript 业务代码约定
globs: "src/**/*.ts,src/**/*.tsx"
alwaysApply: false
---

# TypeScript 约定
- 沿用项目已有模块边界与导出风格。
- 外部数据先校验，再进入业务逻辑。
- 新增接口覆盖无效输入与权限不足的行为。
```

当前官方文档明确支持**逗号分隔多个 glob**，例如 `docs/**/*.md, docs/**/*.mdx`。旧文“globs 必须是 YAML 数组，字符串会静默丢失后续模式”的断言没有依据，应删除。

本篇直接采用官方展示的字符串形式；团队跨旧版本使用时，在当前界面创建一条规则并核对生成格式更可靠。

### 1.3 四种激活方式

| 配置 | 何时加载 |
| --- | --- |
| `alwaysApply: true` | 每次 Agent 会话；其他匹配字段不再作为限制 |
| `alwaysApply: false` 且提供 `globs` | 匹配文件进入上下文时附加 |
| `alwaysApply: false`、有 `description`、无 `globs` | Agent 根据描述决定是否读取 |
| `alwaysApply: false`，无描述和匹配条件 | 用户在聊天中 `@规则名` 手动引用 |

不能把文件匹配模式限定为“只有用户手动附加文件才会触发”。官方表达是匹配文件在上下文中，实际来源需按当前客户端行为判断。

规则正文中的 `@service-template.ts` 是让 Agent 按需读取文件的提示，**不会自动把模板内容内联进规则**。必须在每次任务中出现的关键边界，应直接写进规则正文。

### 1.4 嵌套 AGENTS 和团队优先级

Cursor 已支持：

```text
project/
├── AGENTS.md
├── frontend/AGENTS.md
└── backend/AGENTS.md
```

子目录指令与祖先组合，更具体的指导在冲突时优先。这里不需要 MDC frontmatter。

当前团队规则文档给出的优先顺序是 **Team Rules → Project Rules → User Rules**。所有适用规则仍会合并；强制启用意味着成员不能在界面关闭它，不代表自然语言指导能够替代强制安全控制。

Rules 主要作用于 Agent（Chat），不能把支持范围推广到 Cursor Tab 等其他 AI 功能。

## 二、Devin Local / CLI 与旧 Windsurf 规则

### 2.1 先确认自己使用的客户端

当前 Devin 官方文档说明，Devin Desktop 的 **Devin Local** 与 Devin CLI 共享 Agent harness，使用相同的扩展格式和发现机制。

旧 Windsurf 路径仍有兼容入口，但这不等于所有旧版 Cascade 都支持新 Devin 路径。迁移前记录客户端版本、Agent 类型与当前 Customize 列表。

### 2.2 新规则位置与兼容策略

```text
project/
├── AGENTS.md
├── AGENTS.local.md
├── .devin/
│   ├── global_rules.md
│   └── rules/
│       └── testing.md
└── .windsurf/
    └── rules/
        └── legacy-testing.md
```

当前 Devin Local / CLI 文档明确：

- `AGENTS.md`、`AGENTS.local.md`、`AGENT.md` 等可作为 always-on 指导。
- 根目录指导在启动时读，子目录指导在访问相关目录时按需发现。
- `.devin/rules/*.md` 是当前推荐位置；旧 `.windsurf/rules/*.md` 默认也导入。
- 两种 rules 目录可以同时加载，因此复制迁移后应检查是否重复。
- 两种 `global_rules.md` 同时存在时，仅加载 `.devin/global_rules.md`。

这比“把 .windsurf 全部改名 .devin 就结束”更精确。迁移需要核查导入设置和重复规则，而不是盲目移动所有旧配置。

### 2.3 trigger 四种常用方式

```markdown
---
trigger: glob
globs: "**/*.test.ts"
---

# 测试约定
- 复用项目既有测试夹具。
- 外部网络请求用可控替身，避免依赖真实服务状态。
```

| `trigger` | 常用行为 |
| --- | --- |
| `always_on` | 常驻指导 |
| `glob` | 匹配处理文件时加载 |
| `model_decision` | 模型依据描述判断相关性 |
| `manual` | 用户显式调用 |

CLI 更完整的参考还列出兼容项，例如 `agent`。新规则优先采用当前文档清晰说明的模式，不把旧版本限制直接套到新客户端。

### 2.4 用户与个人项目配置

CLI 全局 AGENTS 位置为：

```text
Linux / macOS: ~/.config/devin/AGENTS.md
Windows: %APPDATA%\devin\AGENTS.md
```

规则文件也支持用户目录下的 `~/.devin/rules/*.md`、`~/.devin/global_rules.md`。个人项目文件 `AGENTS.local.md` 应加入 `.gitignore`。

旧 Windsurf 教程中的“全局 6000 / 工作区 12000 字符”等限制，不应当成整个 Devin 生态的统一硬限制。以实际客户端提示和当前文档为准。

## 三、Kiro：Steering 的四种 inclusion

### 3.1 项目与全局位置

```text
.kiro/steering/
├── product.md
├── tech.md
├── structure.md
└── api-standards.md
```

三份基础文件分别描述产品目标、技术栈和项目结构，默认作为项目基础上下文。全局 Steering 放在 `~/.kiro/steering/`，适合个人或团队统一分发的指导。

当前文档明确，工作区 Steering 与全局冲突时，工作区指导优先。通过 MDM、组织策略或统一仓库分发到用户目录，是团队部署方式；不要把它与不能覆盖的管理员强制策略混为一谈。

### 3.2 inclusion 配置

frontmatter 必须在文件最开始，不能在 `---` 前插空行或其他内容。

**始终加载：**

```markdown
---
inclusion: always
---

- 使用项目声明的包管理器和锁文件。
```

**文件匹配：**

```markdown
---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.tsx"]
---

- 复用项目已有类型与输入校验方式。
```

**手动加载：**

```markdown
---
inclusion: manual
---

# 数据迁移审查
- 确认筛选范围、预览结果、备份与重复执行行为。
```

在聊天中使用 `#文件名`，当前文档也说明手动规则会出现在 slash command 列表中。

**按描述自动选择：**

```markdown
---
inclusion: auto
name: api-design
description: 创建或调整 API 端点时使用的接口设计约定。
---

- 对外接口沿用已有状态码、鉴权与错误结构。
```

`auto` 需要 `name` 与 `description`。它适合较长但只在相关任务需要的指导，也可在当前支持的界面用 slash command 显式选择。

### 3.3 CLI 版本差异不能省略

当前 Kiro 文档说明：**CLI V3 支持 always、fileMatch、manual、auto 四种模式**。V1/V2 会自动载入 always，但不能照搬 V3 完整的匹配与激活行为；其 fileMatch/manual 文件不会作为常驻规则自动加载。

使用 custom agents 时，Steering 也不一定自动加入；需要在该 Agent 的 `resources` 配置中显式引用，例如：

```json
{
  "resources": ["file://.kiro/steering/**/*.md"]
}
```

### 3.4 AGENTS 与文件引用

Kiro 支持工作区根、子目录及全局 Steering 位置的 AGENTS.md。**AGENTS 不支持 inclusion 模式，作为始终包含的指导**；不能因为文件放在子目录，就假设它采用 Codex 的完全相同作用域和覆盖算法。

Kiro 的文件引用语法为：

```markdown
#[[file:docs/api-guidelines.md]]
```

IDE 和 CLI V3 还支持行号、行范围和一层目录清单：

```markdown
#[[file:docs/api-guidelines.md:12-28]]
#[[folder:config]]
```

引用受会话文件权限和忽略规则约束。相对路径基准取决于工作区 Steering、全局 Steering 或 AGENTS 文件位置；无法解析时会显示未解析标记，应在目录调整后复核。

## 四、团队如何选择

| 需求 | 推荐载体 |
| --- | --- |
| 多工具共享目录、验证与边界 | 精简的 AGENTS.md，并核对每个工具的实际加载行为 |
| Cursor 文件类型约定 | `.cursor/rules/*.mdc` 与 `globs` |
| Devin 可控激活规则 | `.devin/rules/*.md` 与 `trigger` |
| Kiro 按范围或任务指导 | Steering 的 `fileMatch` / `auto` |
| 较长的可复用流程和资源 | Skill，按当前宿主支持方式使用 |
| 机械验证和阻断 | CI、权限系统或经过验证的 Hook |

先检查规则是否被发现，再检查是否匹配任务，最后观察实际产物是否符合约定。把“界面显示有这个文件”当作执行结果保证，会漏掉激活与权限问题。

## 官方资料

- [Cursor Rules](https://cursor.com/docs/rules)
- [Devin Local Customizations](https://docs.devin.ai/desktop/devin-local/customizations)
- [Devin CLI Rules & AGENTS.md](https://docs.devin.ai/cli/extensibility/rules)
- [Kiro Steering](https://kiro.dev/docs/steering/)

本次核验修正了 Cursor 的 `.md` 处理、globs 字符串与引用内联误解，并把 Devin 旧规则兼容和 Kiro CLI 引擎差异直接整合进正文。
