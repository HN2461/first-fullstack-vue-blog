---
title: "第五篇：Gemini CLI GEMINI.md 与 GitHub Copilot 指令文件"
slug: "ai-rules-gemini-copilot-geminicli-copilot-853f4742"
summary: "详解 Gemini CLI 的 GEMINI.md 三层加载机制、JIT 即时上下文、/memory 命令族与模块化导入语法，以及 GitHub Copilot 的双格式指令系统（copilot-instructions.md 与 .github/instructions/）和 AGENTS.md 支持情况。"
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
updatedAt: "2026-07-30T14:24:30.288Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 第五篇：Gemini CLI GEMINI.md 与 GitHub Copilot 指令文件

> 资料来源：Gemini CLI 官方 GitHub 文档、GitHub Copilot 官方文档。初稿整理：2026-04；按官方文档复核更新：2026-07-04。

[[toc]]

---

## 一、Gemini CLI 与 GEMINI.md

### 1.1 Gemini CLI 简介

Gemini CLI 是 Google 推出的开源终端 AI Agent，直接在命令行中运行，底层使用 Gemini 模型。版本迭代很快，复习规则机制时不要死记某个旧 release 号；需要安装或排障时，以 `google-gemini/gemini-cli` 官方仓库的最新 README、配置文档和 release 页面为准。

Gemini CLI 的规则文件叫 `GEMINI.md`，有一个独特的**三层加载机制**，与其他工具的"向上遍历"不同。

### 1.2 三层加载机制

Gemini CLI 按以下顺序加载 `GEMINI.md` 文件，将所有找到的内容拼接后发送给模型：

**第一层：全局上下文**

```
~/.gemini/GEMINI.md
```

用户主目录下的全局配置，对所有项目生效。适合个人偏好、通用编码习惯。

**第二层：工作区上下文**

```
./GEMINI.md（项目根目录）
./子目录/GEMINI.md（工作区内各级目录）
```

CLI 搜索配置的工作区目录及其父目录中的 `GEMINI.md` 文件。

**第三层：JIT（Just-In-Time）即时上下文**

这是 Gemini CLI 最独特的机制：当工具访问某个文件或目录时，CLI 自动扫描该目录及其所有祖先目录（直到信任根目录）中的 `GEMINI.md` 文件，并将其加载。

这意味着：

```
project/
├── GEMINI.md              # 项目级，始终加载
├── src/
│   ├── GEMINI.md          # 当 AI 读取 src/ 下的文件时加载
│   └── api/
│       └── GEMINI.md      # 当 AI 读取 src/api/ 下的文件时加载
└── tests/
    └── GEMINI.md          # 当 AI 读取 tests/ 下的文件时加载
```

JIT 加载让 Gemini CLI 能够在不预先加载所有规则的情况下，在需要时自动获取最相关的上下文。

### 1.3 文件格式

`GEMINI.md` 是纯 Markdown，无特殊 schema：

```markdown
# Project: My TypeScript Library

## General Instructions
- 生成新 TypeScript 代码时，遵循现有代码风格
- 所有新函数和类必须有 JSDoc 注释
- 优先使用函数式编程范式

## Coding Style
- 使用 2 空格缩进
- 接口名以 `I` 开头（如 `IUserService`）
- 始终使用严格相等（`===` 和 `!==`）

## Project Structure
- 组件放在 /src/components/
- 工具函数放在 /src/utils/
- 类型定义放在 /src/types/
```

### 1.4 /memory 命令族

Gemini CLI 提供一组 `/memory` 命令管理上下文文件：

| 命令 | 功能 |
|------|------|
| `/memory show` | 显示当前所有已加载 `GEMINI.md` 的完整拼接内容，可以检查 AI 实际看到的上下文 |
| `/memory reload` | 强制重新扫描并加载所有 `GEMINI.md` 文件（修改文件后用这个刷新） |
| `/memory add <text>` | 将文本追加到 `~/.gemini/GEMINI.md`，实现运行时添加持久记忆 |

**实用场景：**

```bash
# 查看 AI 当前的完整上下文
/memory show

# 修改了 GEMINI.md 后刷新
/memory reload

# 快速添加一条全局记忆
/memory add "始终使用 pnpm，不用 npm"
```

### 1.5 模块化导入语法

`GEMINI.md` 支持用 `@file.md` 语法引入其他文件，支持相对路径和绝对路径：

```markdown
# Main GEMINI.md

这是主配置文件。

@./components/instructions.md

更多内容在这里。

@../shared/style-guide.md
```

这让你可以把大型规则文件拆分成多个主题文件，保持每个文件简洁。

### 1.6 自定义文件名

默认文件名是 `GEMINI.md`，但可以通过 `settings.json` 配置额外的文件名，实现与其他工具的规则共享：

```json
{
  "context": {
    "fileName": ["AGENTS.md", "GEMINI.md", "CONTEXT.md"]
  }
}
```

配置后，Gemini CLI 会在每个目录中依次查找这些文件名，找到的都会加载。这样就可以让 Gemini CLI 读取 `AGENTS.md`，实现跨工具规则共享。

### 1.7 实战示例

**全局个人配置（~/.gemini/GEMINI.md）：**

```markdown
# 全局个人规则

## 语言
- 用中文回复
- 简洁直接，不要废话

## 代码风格
- 所有项目统一 2 空格缩进
- 优先 async/await，不用 Promise 链

## 安全
- 永远不要硬编码密钥
- 涉及权限的改动必须标注
```

**项目级配置（./GEMINI.md）：**

```markdown
# Go 后端项目

## Stack
- Go 1.22, Chi router, sqlc for database queries
- Frontend: Svelte 5 with TypeScript

## Guidelines
- 使用结构化日志（slog），不用 fmt.Println
- 所有错误必须用 fmt.Errorf 包装
- 测试文件放在同包的 _test.go 文件中

## Project Structure
@./docs/structure.md
```

**子目录即时上下文（./src/api/GEMINI.md）：**

```markdown
# API 层规范

- 所有路由处理器必须有错误处理
- 返回格式统一：`{ code, data, message }`
- 使用 Chi 的中间件做认证，不在 handler 里直接处理
- 新增接口必须同步更新 /docs/api-reference.md
```

---

## 二、GitHub Copilot 指令文件

### 2.1 三种指令类型

根据 GitHub 官方文档，Copilot 当前可以结合**三种**仓库级 / Agent 级指令来源：

| 类型 | 文件路径 | 作用范围 |
|------|---------|---------|
| **仓库级指令** | `.github/copilot-instructions.md` | 所有请求，始终加载 |
| **路径级指令** | `.github/instructions/*.instructions.md` | 匹配 `applyTo` glob 的文件 |
| **Agent 指令** | `AGENTS.md`（任意目录）/ `CLAUDE.md`（根目录）/ `GEMINI.md`（根目录） | AI Agent 使用，最近目录优先 |

> **重要**：Copilot 官方文档明确说明，Agent 指令除了 `AGENTS.md` 外，还支持根目录的 `CLAUDE.md` 和 `GEMINI.md` 作为替代格式。

### 2.2 仓库级指令：copilot-instructions.md

放在 `.github/` 目录，对整个仓库所有请求生效：

```markdown
# .github/copilot-instructions.md

本仓库使用 TypeScript strict 模式。
优先使用函数式组件和 hooks，不用 class 组件。
使用 Zod 做运行时校验，不用 io-ts。
所有数据库查询通过 /src/repos/ 中的 Repository 模式。

## 提交规范
- 使用 Conventional Commits：feat:, fix:, chore:, refactor:
- 范围到包：feat(web):, fix(api):
- 提交前运行 pnpm lint && pnpm test
```

**让 Copilot 自动生成**：在 GitHub Copilot Agents 页面（github.com/copilot/agents）选择仓库，粘贴官方提供的生成 prompt，Copilot 会自动扫描仓库并创建 PR。

### 2.3 路径级指令：.github/instructions/

支持通过 `applyTo` 字段指定路径作用域，只在处理匹配文件时生效：

```markdown
---
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# TypeScript 规范

使用 strict TypeScript，禁止 `any` 类型。
所有函数必须有明确的返回类型注解。
使用 `type` 定义对象形状，`interface` 只用于可扩展契约。
```

**`excludeAgent` 字段**：可以排除特定 Agent 使用该指令：

```markdown
---
applyTo: "**"
excludeAgent: "code-review"
---

# 仅供 cloud-agent 使用的指令
```

有效值：`"code-review"` 或 `"cloud-agent"`。

> **注意时效性**：GitHub 官方当前文档明确写到，在 **GitHub.com** 上，路径级指令主要面向 **Copilot cloud agent** 和 **Copilot code review**。如果你在其他入口里测试效果，别默认认为所有 Copilot 交互面板都已经完全等价支持。

**目录结构示例：**

```
project/
└── .github/
    ├── copilot-instructions.md          # 全局规则（始终加载）
    └── instructions/
        ├── typescript.instructions.md   # TypeScript 文件规范
        ├── testing.instructions.md      # 测试文件规范
        ├── api.instructions.md          # API 文件规范
        └── security.instructions.md    # 安全相关规范
```

### 2.4 Agent 指令：AGENTS.md / CLAUDE.md / GEMINI.md

Copilot Agent 在工作时会查找以下文件（按优先级）：

1. **AGENTS.md**：目录树中最近的文件优先（可在仓库任意位置创建一个或多个）
2. **CLAUDE.md**：仓库根目录（作为 AGENTS.md 的替代）
3. **GEMINI.md**：仓库根目录（作为 AGENTS.md 的替代）

> 注意：在 VS Code 中，子目录的 AGENTS.md 支持默认关闭，需要在 VS Code 设置中手动启用。

### 2.5 全局个人指令

不同 IDE 的全局指令路径不同：

| IDE | 更稳妥的当前理解 |
|-----|----------------|
| VS Code | 以仓库级文件和 IDE 设置为主；子目录 `AGENTS.md` 默认需手动启用 |
| JetBrains | 支持仓库内 `.github/copilot-instructions.md`，也支持本地 `global-copilot-instructions.md` |
| Xcode | 通过 GitHub Copilot for Xcode 的设置界面管理全局偏好 |

### 2.6 推荐分工

```
project/
├── AGENTS.md                          # 跨工具共享：技术栈、约定、边界
└── .github/
    ├── copilot-instructions.md        # Copilot 全局规则（补充 AGENTS.md）
    └── instructions/
        └── *.instructions.md          # Copilot 路径作用域规则
```

---

## 三、五大工具规则文档终极对比

| 维度 | Claude Code | Codex | Cursor | Windsurf | Gemini CLI | Copilot |
|------|------------|-------|--------|----------|-----------|---------|
| 主规则文件 | `CLAUDE.md` | `AGENTS.md` | `.cursor/rules/*.mdc` | `.devin/rules/*.md`（旧资料常见 `.windsurf/rules/*.md`） | `GEMINI.md` | `copilot-instructions.md` |
| 全局个人配置 | `~/.claude/CLAUDE.md` | `~/.codex/AGENTS.md` | 设置界面 | 以 Devin / Windsurf 当前设置为准 | `~/.gemini/GEMINI.md` | IDE 设置 / 本地全局指令文件 |
| 路径作用域 | `.claude/rules/` paths | 子目录文件 | `globs` 数组 | `globs` 字段 | JIT 自动加载 | `applyTo` frontmatter |
| 自动记忆 | ✅ Auto Memory | ❌ | ❌ | ✅ Memories | ❌ | ❌ |
| AGENTS.md 支持 | 间接（@import） | ✅ 原生 | ✅，但当前主线是根目录单文件 | ✅，具体加载细节按当前 Devin / Windsurf 版本复核 | 可配置 | ✅（Agent 指令类型；仓库任意目录可放，但 VS Code 子目录默认需开启） |
| 额外支持的跨工具文件 | — | — | — | — | — | `CLAUDE.md`、`GEMINI.md`（根目录） |
| 文件格式 | Markdown + @import | 纯 Markdown | MDC（YAML frontmatter） | Markdown + frontmatter | Markdown + @import | Markdown + frontmatter |
| 上下文查看命令 | `/memory` | 无 | 无 | 询问 Cascade | `/memory show` | 查看 References 列表 |
| 推荐文件大小 | < 200 行 | < 500 行 | 单文件 < 100 行 | 6000/12000 字符限制 | 无明确限制 | 无明确限制 |

---

## 四、多工具团队的终极配置方案

如果你的团队同时使用多种 AI 工具，推荐以下结构：

```
project/
├── AGENTS.md                              # 共享核心：技术栈、约定、边界、验证
│
├── CLAUDE.md                              # Claude Code 专属
│   # 内容：@AGENTS.md + Claude 特有配置
│
├── GEMINI.md                              # Gemini CLI 专属
│   # 内容：@AGENTS.md 或直接写（Gemini 可配置读 AGENTS.md）
│
├── .github/
│   ├── copilot-instructions.md            # Copilot 全局规则
│   └── instructions/
│       └── *.instructions.md             # Copilot 路径规则
│
├── .cursor/
│   └── rules/
│       └── *.mdc                         # Cursor 路径规则
│
└── .devin/
    └── rules/
        └── *.md                          # Devin / Windsurf 路径规则，旧项目可能仍是 .windsurf/rules
```

**AGENTS.md 写什么（所有工具共享）：**
- 技术栈声明
- 代码约定（命名、风格）
- 边界规则（不能动的目录、需要审批的操作）
- 验证步骤（提交前必须执行的命令）

**工具专属文件写什么：**
- 工具特有的行为配置（Claude 的 plan mode、Cursor 的 glob 规则）
- 引用 AGENTS.md（避免重复维护）
- 该工具独有的功能配置

---

> 参考资料：
> - [Gemini CLI GEMINI.md 官方文档 - google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md)
> - [Gemini CLI 命令参考（含 /memory reload）- google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/cli-reference.md)
> - [Gemini CLI Releases - google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli/releases)
> - [GitHub Copilot 仓库自定义指令官方文档 - docs.github.com](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
