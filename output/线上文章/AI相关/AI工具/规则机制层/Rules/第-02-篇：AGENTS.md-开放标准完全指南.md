---
title: "第 02 篇：AGENTS.md 开放标准完全指南"
slug: "ai-rules-agents-agents-md-908e49bb"
summary: "按 2026-11-18 官方资料梳理 AGENTS.md 的共享格式与各宿主差异，详解 Codex 目录发现、override、回退文件名、字节预算和权限边界，并提供三套项目模板。"
category: "Rules"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Rules"
tags:
  - "AGENTS.md"
  - "OpenAI Codex"
  - "开放标准"
  - "AAIF"
  - "Linux基金会"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cabff0"
originalSlug: "ai-rules-agents-agents-md-908e49bb"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.676Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 02 篇：AGENTS.md 开放标准完全指南

> 核验日期：2026-11-18。开放格式与客户端实现分开说明；Codex 的发现规则同时核对了官方仓库当前实现，不把某个工具的行为推广为跨工具标准。

[[toc]]

## 一、开放格式统一了什么

AGENTS.md 为代码 Agent 提供一个可版本控制的 Markdown 指导文件。官方入口为 [agents.md](https://agents.md/) 与 [agentsmd/agents.md](https://github.com/agentsmd/agents.md)，由 Agentic AI Foundation 生态推动。

它解决的主要问题是多工具团队缺少共同的项目指导入口。文件可以记录环境准备、测试命令、代码风格、业务边界和交付要求，不需要专门的 schema。

需要避免三个误解：

- 没有 schema，不代表无需客户端支持；工具仍要实现文件发现和加载。
- 支持同一个文件名，不代表支持同样的嵌套、导入、覆盖和权限语义。
- 规则是上下文，不是操作系统、数据库或发布平台的授权文件。

不必用某个时点的仓库数量证明它有用。对团队而言，更有价值的是文件能否被当前工具可靠读取和验证。

## 二、推荐内容与写作方式

```markdown
# AGENTS.md

## 环境与结构
- 先阅读根目录 README 和目标模块 package.json。
- frontend 与 backend 是两个独立项目，分别执行依赖和验证命令。

## 约定
- 新代码沿用目标目录现有模式。
- 所有源码和配置使用 UTF-8 无 BOM。
- 公共函数说明用途、参数、返回值与异常边界。

## 边界
- 不编辑生成目录和线上运行数据。
- 数据结构变更先说明兼容策略与影响范围。
- 不把凭证、个人信息或生产配置写入仓库。

## 验证
- 前端改动运行 frontend 下的 npm run build。
- 后端改动运行 backend 下的 npm test。
- 交付时列明已完成检查和无法完成的检查。
```

写作时用可检查的要求代替“遵循最佳实践”。命令必须在项目里真实存在；通用模板中的框架版本、迁移工具、测试入口都应经过项目核对。

文件长度没有跨工具统一的“500 行硬上限”。应优先保持精简，再检查宿主的字节预算和加载方式。通过链接拆文档可以改善维护，但不保证减少自动导入后的上下文体积。

## 三、目录作用域与冲突

典型结构：

```text
project/
├── AGENTS.md
├── frontend/
│   ├── AGENTS.md
│   └── src/
└── backend/
    ├── AGENTS.md
    └── src/
```

根文件写全项目约定，子目录文件写局部差异。例如根文件要求“说明验证结果”，前端文件补充“运行构建”，后端文件补充“运行接口测试”。尽量让规则形成补充关系，而不是互相否定。

“更近目录优先”是 AGENTS.md 常见的目录指导原则，Codex、Cursor、Copilot 的相关实现或文档均有对应说明。但**文件何时进入上下文**是另一件事：有的工具启动时构建祖先链，有的在访问目录时按需发现。不要把编辑器里打开文件等同于修改 Agent 的工作目录。

## 四、Codex 的具体发现机制

### 4.1 全局与项目指导

Codex 支持用户层指导，以及从项目根到当前工作目录的项目指导。默认用户配置目录为 `~/.codex`；配置了 `CODEX_HOME` 时应以实际位置为准。

项目发现通常依据 Git 等项目根标记。当前实现会从项目根逐级走到工作目录；如果未找到项目根，只检查当前目录。项目根识别还可受到 `project_root_markers` 配置影响。

不要假定 Codex 启动时递归读取整个仓库的所有 AGENTS.md。对子树的工作仍应检查适用规则，特别是启动后才转向的目录。

### 4.2 同目录文件选择

项目目录里的候选顺序为：

1. `AGENTS.override.md`
2. `AGENTS.md`
3. `project_doc_fallback_filenames` 配置的候选名称

当前发现实现每个目录选取第一个存在的普通文件；它并不是把同目录这几种文件全部拼接。用于临时覆盖时，必须考虑 override 文件会使同目录主文件不被选中。

```text
project/
├── AGENTS.md
└── backend/
    ├── AGENTS.override.md  # 此目录优先选择
    └── AGENTS.md           # 不再作为同目录第二份自动叠加
```

`AGENTS.override.md` 是 Codex 的实现约定，不属于所有工具必读的标准文件名。当前 Claude Code 直接读取 AGENTS 时明确不读取此文件。

### 4.3 回退文件名与字节预算

用户配置可以指定项目指导的回退名称与预算，例如：

```toml
project_doc_fallback_filenames = ["TEAM_GUIDE.md"]
project_doc_max_bytes = 65536
```

这里的 `65536` 是示例配置值，不是通用默认值。回退名称不是导入列表，也不会让已选中 AGENTS 的目录再额外加载 TEAM_GUIDE。

当前项目加载实现会在预算用尽时跳过后续内容，超出剩余预算的文件会被截断并给出提示。全局、线程与项目指导的组合警告还可能包含不同来源的总量；不要把警告总字节数理解为每一个来源都按相同方式截断。

最新实现也会考虑工作区信任状态，未信任项目可能不加载项目指令。遇到规则未生效时，应先核对信任、工作目录、实际配置与加载提示。

### 4.4 指令与执行权限分开

项目规则无法改写平台的系统限制、工具沙箱、管理员策略或真实服务权限。直接任务指令和更高层约束与仓库文字发生冲突时，应按当前宿主的指令体系处理，不能靠在文件中写“最高优先级”提升权限。

## 五、各工具的 AGENTS.md 支持边界

| 工具 | 当前官方可确认的行为 | 不应推导的结论 |
| --- | --- | --- |
| Codex | 目录链、override、回退名称与项目预算 | 所有客户端都复制 Codex 的 override 规则 |
| Cursor | 项目根和子目录均支持，更具体目录指导优先 | 仍只支持根目录，或 AGENTS 可以替代所有 MDC 功能 |
| Claude Code | v2.1.277+ 可直接读；默认在项目路径没有 CLAUDE 文件时作为替代 | 一定要手动导入，或者永远同时读两种文件 |
| Devin Local / CLI | 根目录启动加载，子目录按访问发现；支持个人 AGENTS.local | 旧 Windsurf 客户端已经支持所有 Devin 新格式 |
| Kiro | 工作区根、子目录与全局 Steering 位置可发现；AGENTS 始终包含 | AGENTS 支持 `inclusion: fileMatch`，或必然采用最近目录覆盖 |
| Gemini CLI | 可通过 `context.fileName` 加入 AGENTS | 默认文件名就已经变成 AGENTS |
| GitHub Copilot | 支持取决于使用面；相关 Agent 文档说明最近 AGENTS 优先 | 所有 Copilot 面板都读取所有 Agent 文件 |

Claude 的旧版本仍可用相邻 `CLAUDE.md` 中的 `@AGENTS.md` 导入；这是 Claude 的导入语法，不是 AGENTS.md 标准本身。

## 六、三套可改造的项目模板

### 6.1 TypeScript 全栈项目

```markdown
# AGENTS.md

## 环境
- Node.js 与包管理器版本以仓库声明为准。
- 前后端 TypeScript 配置分别维护，不跨模块复制运行时环境假设。

## 开发
- 外部输入在接口边界做运行时校验。
- API 类型沿用现有共享契约，避免手写重复类型。
- 修改公共组件时先检查调用方。

## 验证
- 运行受影响项目的类型检查、构建及相关测试。
- 记录接口兼容性和环境变量变更。
```

### 6.2 Python API 项目

```markdown
# AGENTS.md

## 环境
- 使用 pyproject.toml 与锁文件声明的 Python、依赖及包管理器。
- 路由、服务与持久化层沿用现有目录职责。

## 开发
- 外部输入通过项目现有 schema 校验。
- 数据库迁移使用仓库已有工具生成并审阅。
- 不编辑已经执行的历史迁移来修补线上数据。

## 验证
- 先执行 README 中的 lint 和测试命令。
- 涉及数据变更时验证空数据、重复执行及失败恢复。
```

### 6.3 Vue 3 项目

```markdown
# AGENTS.md

## 环境
- 使用 Vue 3 单文件组件及项目已有状态管理方式。
- JavaScript 或 TypeScript 以现有项目为准，不擅自切换。

## 开发
- 优先复用公共表格、上传和权限能力。
- 页面筛选条件与分页状态保持一致。
- 同时检查浅色、深色主题和无权限状态。

## 验证
- 运行 package.json 中对应构建和相关测试。
- 浏览器验证按当前任务授权与项目约定执行。
```

这些模板提供写作结构，不是对所有项目强制适用的技术选型。

## 七、多工具共享与日常维护

```text
project/
├── AGENTS.md
├── CLAUDE.md                       # 需要时导入 AGENTS 并补充 Claude 说明
├── GEMINI.md                       # 导入或通过配置复用 AGENTS，避免重复
├── .cursor/rules/*.mdc             # Cursor 路径或任务激活
├── .claude/rules/*.md              # Claude paths 规则
└── .github/instructions/*.instructions.md
```

不要为每个文件复制完整规范。让共享核心保持一个来源，工具专属文件只表达必要差异。也不要默认普通 `@docs/xxx.md` 在所有宿主都会展开；写明“处理该模块前读取此文档”并验证客户端行为更可靠。

每次维护后检查：文件实际被谁读取、适用哪个目录、与哪些规则合并、验证命令是否存在，以及哪些内容应该移到按需工作流。

## 官方资料与核验说明

- [AGENTS.md 官方站点](https://agents.md/)
- [AGENTS.md 官方仓库](https://github.com/agentsmd/agents.md)
- [Codex 当前项目指导发现与预算实现](https://github.com/openai/codex/blob/main/codex-rs/core/src/agents_md.rs)
- [Codex 指导组合实现](https://github.com/openai/codex/blob/main/codex-rs/core/src/agents_md_manager.rs)
- [Claude Code：AGENTS.md](https://code.claude.com/docs/en/memory#agents-md)
- [Cursor：Rules](https://cursor.com/docs/rules)
- [Devin CLI：Rules & AGENTS.md](https://docs.devin.ai/cli/extensibility/rules)
- [Kiro：Steering](https://kiro.dev/docs/steering/)
- [Gemini CLI：GEMINI.md](https://geminicli.com/docs/cli/gemini-md/)
- [GitHub：指令支持矩阵](https://docs.github.com/en/copilot/reference/custom-instructions-support)

本次 OpenAI 开发者站点的目标页面返回 403，因此 Codex 的具体发现行为用官方仓库源码及 Context7 对同仓库的索引交叉核对。主分支实现可能领先本机版本，排障应同时记录 `codex --version`。
