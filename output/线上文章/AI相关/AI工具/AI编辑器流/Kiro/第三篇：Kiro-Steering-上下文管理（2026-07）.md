---
title: "第三篇：Kiro Steering 上下文管理（2026-07）"
slug: "ai-ai-kiro-kiro-steering-51bf9cad"
summary: "详解 Kiro Steering 的工作区与全局作用域、always/fileMatch/manual 三种 inclusion 模式、基础文件、文件引用，以及 Kiro 对 AGENTS.md 的原生支持。"
category: "Kiro"
tags:
  - "Kiro"
  - "Steering"
  - "上下文管理"
  - "AGENTS.md"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabec8"
originalSlug: "ai-ai-kiro-kiro-steering-51bf9cad"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第三篇：Kiro Steering 上下文管理（2026-07）

> 本篇内容基于 Kiro 官方 Steering 文档整理，资料核对时间：2026-07-27。旧版资料常见的 `auto` inclusion 和独立 Team 作用域不在当前官方配置模型中，本文已按现行行为修正。

[[toc]]

---

## Steering 是什么

在使用 AI 编程助手的过程中，开发者经常遇到一个令人头疼的问题：每次开启新的对话，AI 对项目的了解都要从零开始。你需要反复告诉它"我们用 Vue 3"、"代码风格是 2 空格缩进"、"数据库用的是 PostgreSQL"……这些背景知识每次都要重新交代，既浪费时间，又容易遗漏，导致 AI 生成的代码与项目规范不符。

Kiro 的 Steering（引导）机制正是为了解决这个问题而设计的。Steering 允许你将项目的背景知识、技术规范、编码约定、业务规则等持久化为 Markdown 文件，存放在 `.kiro/steering/` 目录下。每当 Agent 处理任务时，Kiro 会自动将相关的 Steering 文件注入到上下文中，让 AI 始终"记得"项目的基本情况，无需每次重复交代。

Steering 的核心价值可以从以下几个维度理解：

**持久性**：Steering 文件一旦创建，就会在所有后续的 Agent 会话中持续生效。你不需要在每次对话开始时手动粘贴项目背景，AI 会自动获取这些知识。

**精准性**：通过不同的 inclusion 模式，你可以精确控制哪些 Steering 文件在什么情况下被注入。例如，只有在编辑前端文件时才注入前端规范，只有在处理数据库相关代码时才注入数据库约定，避免无关信息干扰 AI 的判断。

**可维护性**：Steering 文件是普通的 Markdown 文件，纳入 Git 版本控制。团队成员可以协作维护这些规范文档，确保 AI 获取的知识始终是最新的、经过团队共识的。

**可扩展性**：你可以根据项目需要创建任意数量的 Steering 文件，覆盖不同的知识领域。随着项目的发展，Steering 体系也可以不断完善和扩充。

简而言之，Steering 就是给 AI 建立一套"项目记忆"，让它在每次工作时都能以项目专家的身份行事，而不是一个对项目一无所知的陌生人。

---

## 两种配置作用域与团队分发

Kiro Steering 的配置位置分为工作区和全局两级。团队可以集中分发全局文件，但这是一种部署方式，并不是位于两者之间的第三种配置作用域。

### Workspace（工作区）作用域

工作区作用域的 Steering 文件存放在项目根目录的 `.kiro/steering/` 目录下，只对当前项目生效。这是最常用的作用域，适合存放与特定项目相关的知识：项目的技术栈、代码规范、业务逻辑、目录结构等。

工作区 Steering 文件的特点：

- **项目专属**：只在当前项目的 Agent 会话中生效，不影响其他项目
- **团队共享**：文件纳入 Git 版本控制，团队所有成员共享同一套规范
- **优先级最高**：当工作区 Steering 与全局 Steering 存在冲突时，工作区设置优先

工作区 Steering 是团队协作的核心工具。通过维护一套完善的工作区 Steering 文件，团队可以确保所有成员（包括 AI）都遵循相同的开发规范，减少因规范不一致导致的代码审查问题。

### Global（全局）作用域

全局作用域的 Steering 文件存放在用户主目录的 `~/.kiro/steering/` 目录下，对该用户在所有项目中的 Agent 会话生效。适合存放个人偏好和通用规范：你习惯的代码风格、常用的工具链配置、个人的编程原则等。

全局 Steering 文件的特点：

- **跨项目生效**：在你打开的任何项目中都会自动注入
- **个人专属**：不纳入项目的 Git 仓库，只对你自己生效
- **优先级较低**：当与工作区 Steering 冲突时，工作区设置会覆盖全局设置

全局 Steering 特别适合那些在所有项目中都适用的个人规范，例如"始终为函数添加 JSDoc 注释"、"优先使用函数式编程风格"、"错误处理必须包含日志记录"等。

### 团队统一分发

需要让一套规范覆盖团队成员的所有项目时，管理员可以通过 MDM、Group Policy 或内部同步工具，把统一文件下发到每台设备的 `~/.kiro/steering/`。项目特有的规则仍应进入仓库内的 `.kiro/steering/`。

团队 Steering 适合以下场景：

- 同一团队维护多个相关项目，希望统一技术规范
- 公司级别的编码标准，需要在所有项目中强制执行
- 跨项目共享的业务领域知识（如公司的 API 设计规范、数据安全要求等）

### 冲突优先级

当两个作用域的 Steering 文件存在内容冲突时，Kiro 遵循以下优先级规则：

**工作区 > 全局**

工作区的设置最具体，优先级最高；全局设置最通用，优先级最低。这种设计确保了项目特定的规范能够覆盖通用规范，符合"具体优先于通用"的直觉。

---

## 三个基础 Steering 文件

Kiro 可以按需生成三个基础 Steering 文件。打开 Kiro 面板的 Steering 区域，选择 **Generate Steering Docs**，或点击 `+` 后选择 Foundation steering files。它们不会因为打开任意项目就无条件自动创建。

### product.md — 产品背景文件

`product.md` 描述项目的产品定位和业务背景，帮助 AI 理解"这个项目是做什么的"。一个好的 product.md 应该包含：

- **项目简介**：用一两段话描述项目的核心功能和目标用户
- **核心业务逻辑**：项目中最重要的业务规则和约束
- **用户角色**：系统中有哪些用户角色，各自的权限和使用场景
- **关键术语**：项目特有的业务术语和概念定义，避免 AI 对专业词汇产生误解
- **产品边界**：明确说明哪些功能在范围内，哪些不在范围内

product.md 的价值在于让 AI 具备业务上下文。当 AI 理解了产品的业务逻辑，它在生成代码时就能做出更符合业务需求的决策，而不是仅仅从技术角度考虑问题。

### tech.md — 技术规范文件

`tech.md` 描述项目的技术栈和开发规范，帮助 AI 理解"这个项目用什么技术、遵循什么规范"。一个完整的 tech.md 通常包含：

- **技术栈清单**：前端框架、后端语言、数据库、构建工具、测试框架等
- **代码风格规范**：缩进方式、引号风格、命名约定、注释要求等
- **架构模式**：项目采用的架构模式（如 MVC、MVVM、微服务等）
- **依赖管理**：包管理工具、版本锁定策略、禁止使用的依赖等
- **测试要求**：单元测试覆盖率要求、测试框架使用规范
- **性能要求**：关键接口的响应时间要求、前端性能指标等

tech.md 是 AI 生成符合项目规范代码的关键依据。有了这份文件，AI 就不会在 Vue 项目中生成 React 代码，也不会在使用 TypeScript 的项目中生成纯 JavaScript 代码。

### structure.md — 目录结构文件

`structure.md` 描述项目的目录组织方式，帮助 AI 理解"代码应该放在哪里"。一个清晰的 structure.md 应该包含：

- **顶层目录说明**：每个顶层目录的用途和存放内容
- **关键文件说明**：重要配置文件、入口文件的位置和作用
- **模块组织规则**：新功能的代码应该放在哪个目录，遵循什么命名规范
- **特殊约定**：项目特有的目录约定，如测试文件的存放位置、静态资源的组织方式等

structure.md 能有效防止 AI 将新代码放错位置。当 AI 需要创建新文件时，它会参考 structure.md 中的规则，将文件放在正确的目录下，保持项目结构的一致性。

### 三个基础文件的协同作用

这三个文件从不同维度描述了项目的全貌：product.md 提供业务视角，tech.md 提供技术视角，structure.md 提供工程视角。三者结合，构成了 AI 理解项目所需的完整知识基础。

在实际使用中，建议在项目初期就认真填写这三个文件，并随着项目的发展持续更新。一套维护良好的基础 Steering 文件，能显著提升 AI 生成代码的质量和准确性。

---

## 三种 inclusion 模式详解

Steering 文件通过 frontmatter 中的 `inclusion` 字段控制注入行为。当前官方文档列出 `always`、`fileMatch`、`manual` 三种模式。frontmatter 必须是文件第一段内容，前面不能有空行或说明文字。

### always — 始终注入

`always` 模式是最简单的模式：无论 Agent 在处理什么任务，该 Steering 文件都会被注入到上下文中。

```yaml
---
inclusion: always
---
```

适用场景：

- 项目的核心技术规范（如代码风格、命名约定）
- 所有任务都需要了解的业务规则
- 安全要求、合规约束等必须始终遵守的规定
- 三个基础文件（product.md、tech.md、structure.md）通常使用此模式

`always` 模式的优点是简单可靠，确保关键信息不会被遗漏。缺点是会占用一定的上下文空间，因此不适合内容过长的文件。建议 `always` 模式的 Steering 文件保持简洁，聚焦于最核心的规范，避免将所有内容都设置为 `always`。

### fileMatch — 文件匹配注入

`fileMatch` 模式根据当前正在编辑的文件路径来决定是否注入。当 Agent 操作的文件路径匹配指定的 glob 模式时，该 Steering 文件才会被注入。

```yaml
---
inclusion: fileMatch
fileMatchPattern: "src/components/**/*.vue"
---
```

适用场景：

- 前端组件规范（只在编辑 Vue/React 组件时注入）
- 数据库操作规范（只在编辑数据访问层代码时注入）
- 测试文件规范（只在编辑测试文件时注入）
- API 接口规范（只在编辑路由或控制器文件时注入）

`fileMatch` 模式是最精准的注入方式，能有效减少无关信息对 AI 的干扰。当项目规模较大、Steering 文件较多时，合理使用 `fileMatch` 模式能显著提升 AI 的响应质量。

fileMatchPattern 支持标准的 glob 语法，常用模式示例：

```yaml
# 匹配所有 Vue 单文件组件
fileMatchPattern: "**/*.vue"

# 匹配 src/api 目录下的所有 TypeScript 文件
fileMatchPattern: "src/api/**/*.ts"

# 匹配测试文件
fileMatchPattern: "**/__tests__/**/*.js"

# 匹配多种模式（当前版本支持数组）
fileMatchPattern: ["**/*.ts", "**/*.tsx", "**/tsconfig.*.json"]
```

### manual — 手动引用注入

`manual` 模式下，Steering 文件不会自动注入，只有在对话中通过特定语法显式引用时才会被加载。

```yaml
---
inclusion: manual
---
```

适用场景：

- 不常用但偶尔需要的参考文档（如数据库迁移规范、部署流程说明）
- 内容较长的详细规范文档，不适合频繁注入
- 特定场景下才需要的专业知识（如性能优化指南、安全审计清单）
- 临时性的参考资料

`manual` 模式的优点是按需加载，不占用常规上下文空间。当你需要 AI 参考某份 manual 模式的 Steering 文件时，在对话中使用文件引用语法即可（详见下一节）。

### 三种模式的选择建议

| 模式      | 注入时机           | 适用内容                 | 上下文占用 |
| --------- | ------------------ | ------------------------ | ---------- |
| always    | 始终注入           | 核心规范、必须遵守的约定 | 固定占用   |
| fileMatch | 文件路径匹配时注入 | 特定技术领域的规范       | 按需占用   |
| manual    | 显式引用时注入     | 不常用的参考文档         | 手动控制   |

实践建议：核心规范用 `always`，能被文件路径清楚划分的领域规范用 `fileMatch`，长参考文档和低频流程用 `manual`。不要继续使用旧资料中的 `inclusion: auto`；当前官方 IDE Steering 文档没有列出该模式。

---

## 文件引用语法

除了通过 inclusion 模式自动注入，Kiro 还支持在 Steering 文件内部或对话中通过特定语法手动引用其他文件的内容。这种引用机制让 Steering 文件可以动态地将项目中的实际代码或配置文件纳入上下文，而不仅仅依赖静态的文字描述。

### 基本引用语法

在 Steering 文件的正文中，使用以下语法引用项目中的其他文件：

```markdown
#[[file:path/to/your/file]]
```

路径相对于项目根目录。例如，要在 Steering 文件中引用项目的 ESLint 配置：

```markdown
#[[file:.eslintrc.js]]
```

引用 TypeScript 配置：

```markdown
#[[file:tsconfig.json]]
```

引用某个核心模块的源代码：

```markdown
#[[file:src/utils/auth.ts]]
```

### 引用的实际效果

当 Kiro 加载包含文件引用的 Steering 文件时，会自动读取被引用文件的内容，并将其内联到 Steering 文件的上下文中。这意味着 AI 不仅能看到你在 Steering 文件中写的规范描述，还能直接看到实际的配置文件或代码示例。

这种方式的优势在于：

- **保持同步**：引用的是实际文件，当被引用文件更新时，AI 获取的内容也会自动更新，无需手动维护 Steering 文件中的代码示例
- **减少重复**：不需要在 Steering 文件中复制粘贴配置内容，直接引用源文件即可
- **提高准确性**：AI 看到的是真实的配置，而不是可能过时的文字描述

### 在对话中引用 manual 模式文件

对于 `inclusion: manual` 的 Steering 文件，可以在对话中通过以下方式手动引用：

```markdown
请参考 #[[file:.kiro/steering/deployment-guide.md]] 中的部署规范，帮我更新 CI/CD 配置。
```

这种方式让你可以在需要时精确地将特定知识注入到当前对话，而不影响其他对话的上下文。

### 引用的注意事项

文件引用语法目前支持引用文本文件（Markdown、JSON、YAML、TypeScript、JavaScript 等），不支持引用二进制文件（图片、PDF 等）。引用路径区分大小写，在 Windows 系统上使用时需要注意路径分隔符的一致性。

---

## 与 AGENTS.md 的对比

在 AI 编程工具领域，除了 Kiro 的 Steering 机制，还有一种被广泛采用的上下文注入标准：`AGENTS.md` 文件。了解两者的异同，有助于在不同工具之间迁移知识，也有助于理解 Kiro Steering 的设计哲学。

### AGENTS.md 是什么

`AGENTS.md` 是一种约定俗成的文件格式，最初由 OpenAI Codex 推广，后来被多个 AI 编程工具采用（包括 Claude Code、Codex CLI 等）。它通常放在项目根目录，包含项目的背景知识、开发规范和 AI 行为指导，在 Agent 启动时自动加载。

`AGENTS.md` 的核心理念与 Kiro Steering 相似：通过持久化的文档向 AI 注入项目知识，避免每次对话都要重复交代背景。

### 两者的主要差异

| 维度     | Kiro Steering                 | AGENTS.md                       |
| -------- | ----------------------------- | ------------------------------- |
| 文件数量 | 多文件，按主题分散            | 通常单文件，集中管理            |
| 存放位置 | `.kiro/steering/` 目录        | 项目根目录（或子目录）          |
| 注入控制 | 三种 inclusion 模式，精细控制 | 始终加载，无选择性注入          |
| 作用域   | 工作区 / 全局两级             | Kiro 支持工作区根目录与全局目录 |
| 文件引用 | 支持 `#[[file:path]]` 语法    | 不支持动态文件引用              |
| 工具支持 | Kiro 专属                     | Claude Code、Codex 等多工具支持 |
| 版本控制 | 纳入项目 Git 仓库             | 纳入项目 Git 仓库               |
| 格式     | Markdown + YAML frontmatter   | 纯 Markdown                     |

### Kiro 对 AGENTS.md 的支持

Kiro 同时支持 `AGENTS.md` 文件。工作区根目录的 `AGENTS.md` 会对该项目生效；也可以把 `AGENTS.md` 放进 `~/.kiro/steering/` 作为全局规则。Kiro 会将它们作为始终加载的 Steering 指令处理，`AGENTS.md` 不支持 inclusion 模式。

这意味着：

- 从其他工具（如 Claude Code、Codex）迁移到 Kiro 时，现有的 `AGENTS.md` 无需修改即可继续生效
- 你可以同时维护 `AGENTS.md`（供其他工具使用）和 `.kiro/steering/` 目录（充分利用 Kiro 的高级特性）
- 对于简单项目，直接使用 `AGENTS.md` 也是完全可行的选择

### 选择建议

如果你的项目只使用 Kiro，建议充分利用 Steering 的多文件、多模式特性，将知识按主题分散到不同文件中，通过 `fileMatch` 和 `manual` 减少不必要的上下文占用。

如果你的项目需要同时支持多个 AI 工具，可以考虑以下策略：

- 在 `AGENTS.md` 中维护通用的、所有工具都需要的核心规范
- 在 `.kiro/steering/` 中维护 Kiro 专属的、需要精细控制的规范
- 两者内容互补，避免重复

这种双轨策略能让你在享受 Kiro Steering 高级特性的同时，保持与其他工具的兼容性。

---

## 作用域冲突规则

当多个 Steering 文件包含相互矛盾的内容时，Kiro 遵循明确的优先级规则来解决冲突。理解这些规则，有助于你在设计 Steering 体系时做出合理的决策。

### 基本优先级规则

Kiro 的作用域优先级从高到低依次为：

**工作区（Workspace）> 全局（Global）**

当工作区的 Steering 文件与全局 Steering 文件包含相互矛盾的规范时，工作区的规范生效。这符合"具体优先于通用"的直觉：项目特定的规范应该覆盖个人通用规范。

### 同一作用域内的冲突

在同一作用域内（如工作区），如果多个 Steering 文件包含相互矛盾的内容，Kiro 不会自动解决冲突，而是将所有相关内容都注入到上下文中，由 AI 根据具体情况判断应该遵循哪条规范。

为了避免这种情况，建议：

- 每个 Steering 文件聚焦于一个特定的知识领域，避免内容重叠
- 在 Steering 文件中明确说明其适用范围和优先级
- 定期审查 Steering 文件，及时清理过时或矛盾的内容

### inclusion 模式的优先级

不同 inclusion 模式的文件在同一次会话中可能同时被注入。当 `always` 模式的文件和 `fileMatch` 模式的文件包含相互矛盾的内容时，通常更具体的（`fileMatch`）规范应该优先，但 Kiro 本身不强制这一点，需要在文件内容中明确说明。

### 实践建议

为了避免作用域冲突带来的困惑，建议遵循以下原则：

- **全局 Steering 只写通用规范**：不要在全局 Steering 中写项目特定的内容
- **工作区 Steering 明确覆盖全局规范**：如果工作区有与全局不同的规范，在工作区 Steering 中明确说明"本项目使用 X，而非全局默认的 Y"
- **避免在多个文件中重复相同内容**：重复内容不仅浪费上下文空间，还容易在更新时产生不一致
- **使用注释说明规范的来源和理由**：在 Steering 文件中解释为什么有这条规范，有助于 AI 在遇到边界情况时做出正确判断

---

## 实战示例

下面通过一个完整的示例，演示如何为一个 Vue 3 + TypeScript 项目配置完整的 Steering 体系。

### 目录结构规划

```
.kiro/steering/
├── product.md          # 产品背景（always）
├── tech.md             # 技术规范（always）
├── structure.md        # 目录结构（always）
├── vue-components.md   # Vue 组件规范（fileMatch: **/*.vue）
├── api-design.md       # API 设计规范（fileMatch: src/api/**）
├── testing.md          # 测试规范（fileMatch: **/__tests__/**）
└── deployment.md       # 部署流程（manual）
```

### product.md 示例

```markdown
---
inclusion: always
---

# 产品背景

## 项目简介

本项目是一个面向开发者的技术知识博客系统，支持 Markdown 笔记的发布、分类、搜索和阅读。
目标用户是前端开发者，主要使用场景是记录和分享技术学习笔记。

## 核心业务规则

- 笔记以 Markdown 文件形式存储在 public/notes/ 目录下
- 每篇笔记必须包含 YAML frontmatter（title、date、category、tags、description）
- 笔记通过 generateNotesIndex.js 脚本生成搜索索引
- 路由使用 hash history，笔记 URL 格式为 #/note/{category}/{filename}

## 关键术语

- Steering：Kiro 的上下文注入机制
- frontmatter：笔记文件顶部的 YAML 元信息块
- notes-index.json：由脚本生成的笔记搜索索引文件
```

### tech.md 示例

```markdown
---
inclusion: always
---

# 技术规范

## 技术栈

- 前端框架：Vue 3（Composition API）
- 构建工具：Vite
- 语言：JavaScript（ESM）
- 路由：Vue Router 4（hash history）
- 测试：Vitest + jsdom

## 代码风格

- 缩进：2 空格
- 引号：单引号
- 行尾分号：不使用
- 模块导入：优先使用 @/ 别名（对应 src/ 目录）

## 命名规范

- 组件文件：PascalCase（如 NoteDetailPage.vue）
- 工具模块：camelCase（如 scrollProgress.js）
- 测试文件：\*.test.js，放在 **tests** 目录下
```

### vue-components.md 示例（fileMatch 模式）

```markdown
---
inclusion: fileMatch
fileMatchPattern: "src/components/**/*.vue"
---

# Vue 组件规范

## 组件结构顺序

Vue SFC 文件的标签顺序统一为：<script setup> → <template> → <style scoped>

## Props 定义

使用 defineProps() 宏定义 props，必须指定类型，建议提供默认值。

## 事件命名

自定义事件使用 kebab-case 命名（如 update:modelValue、item-click）。

## 样式隔离

组件样式必须使用 scoped 属性，避免全局样式污染。
```

### 执行效果

配置完成后，当你让 Kiro 修改一个 Vue 组件文件时，它会自动注入 `product.md`、`tech.md`、`structure.md`（always 模式）以及 `vue-components.md`（fileMatch 匹配到 .vue 文件）。AI 生成的代码会自动遵循 2 空格缩进、单引号、SFC 标签顺序等规范，无需你在每次对话中重复说明。

当你需要参考部署流程时，在对话中输入：

```
请参考 #[[file:.kiro/steering/deployment.md]] 中的部署规范，帮我更新 GitHub Actions 配置。
```

Kiro 会临时加载 `deployment.md` 的内容，完成这次特定任务后不再占用上下文空间。

---

## 注意事项与常见问题

### Steering 文件不宜过长

每个 Steering 文件的内容应该保持简洁，聚焦于最核心的规范。过长的 Steering 文件会占用大量上下文空间，可能导致 AI 在处理复杂任务时上下文不足。建议单个 Steering 文件不超过 500 行，如果内容过多，考虑拆分为多个文件并使用 `fileMatch` 模式按需注入。

### 避免在 Steering 中写过于具体的实现细节

Steering 文件应该描述规范和约定，而不是具体的实现代码。如果你想让 AI 参考某段具体代码，使用文件引用语法（`#[[file:path]]`）直接引用源文件，而不是将代码复制到 Steering 文件中。这样可以确保 AI 看到的始终是最新的代码，而不是可能过时的副本。

### 定期审查和更新 Steering 文件

随着项目的发展，技术栈可能升级，规范可能调整，业务逻辑可能变化。如果 Steering 文件长期不更新，AI 获取的知识可能与实际项目脱节，反而会产生误导。建议将 Steering 文件的审查纳入定期的技术债务清理工作中，每隔一段时间检查一次内容的准确性。

### 不要在 Steering 中存放敏感信息

Steering 文件通常纳入 Git 版本控制，会被推送到远程仓库。因此，绝对不要在 Steering 文件中存放 API 密钥、数据库密码、私钥等敏感信息。如果需要让 AI 了解某些配置的结构，可以使用占位符（如 `YOUR_API_KEY`）代替真实值。

### Steering 与 Spec 的关系

Steering 和 Spec 是 Kiro 的两个核心机制，它们的职责不同但相互补充：

- **Steering** 提供持久的背景知识，回答"项目是什么样的"
- **Spec** 提供具体的任务规划，回答"这次要做什么"

在实际使用中，Steering 为 Spec 的执行提供上下文支撑。当 AI 执行 Spec 中的任务时，会同时参考相关的 Steering 文件，确保生成的代码符合项目规范。两者结合使用，能发挥出 Kiro 最大的效能。

### 常见问题

**问：Steering 文件的 frontmatter 是必须的吗？**

答：不是必须的。如果 Steering 文件没有 frontmatter，Kiro 会将其视为 `inclusion: always` 模式处理，始终注入到上下文中。但建议显式声明 frontmatter，以便清晰地控制注入行为。

**问：可以在 Steering 文件中使用 Markdown 的所有语法吗？**

答：可以。Steering 文件是标准的 Markdown 文件，支持标题、列表、代码块、表格等所有 Markdown 语法。合理使用格式化语法能让 AI 更容易理解和提取关键信息。

**问：fileMatch 模式支持多个 glob 模式吗？**

答：目前 `fileMatchPattern` 字段只支持单个 glob 模式字符串。如果需要匹配多种文件类型，可以使用 glob 的花括号语法（如 `src/**/*.{ts,tsx}`），或者创建多个 Steering 文件分别匹配不同的文件类型。

**问：Steering 文件的修改会立即生效吗？**

答：会。Kiro 在每次 Agent 会话开始时都会重新读取 Steering 文件，因此对 Steering 文件的修改会在下一次 Agent 交互时立即生效，无需重启 Kiro。

**问：如何知道某次 Agent 会话注入了哪些 Steering 文件？**

答：Kiro 的 Agent 面板通常会显示当前会话的上下文信息，包括已注入的 Steering 文件列表。你也可以在对话中直接询问 AI："你当前的上下文中包含哪些 Steering 文件？"

**问：全局 Steering 文件（~/.kiro/steering/）如何创建？**

答：直接在用户主目录下创建 `.kiro/steering/` 目录，然后在其中创建 Markdown 文件即可。文件格式与工作区 Steering 文件完全相同，同样支持 frontmatter 中的 inclusion 模式配置。

**问：Steering 文件可以引用其他 Steering 文件吗？**

答：目前不支持 Steering 文件之间的相互引用。每个 Steering 文件是独立的知识单元，通过 inclusion 模式控制注入时机。如果需要在多个 Steering 文件中共享某些内容，建议将共享内容提取到一个单独的文件中，并通过文件引用语法（`#[[file:path]]`）在需要的地方引用。

---

## 参考资料

- Kiro 官网：[https://kiro.dev](https://kiro.dev)
- Kiro Steering 官方文档：[https://kiro.dev/docs/steering/](https://kiro.dev/docs/steering/)
- Kiro 快速上手指南：[https://kiro.dev/docs/getting-started/](https://kiro.dev/docs/getting-started/)
- Kiro Specs 系统详解：[https://kiro.dev/docs/specs/](https://kiro.dev/docs/specs/)
- Kiro Hooks 自动化机制：[https://kiro.dev/docs/hooks/](https://kiro.dev/docs/hooks/)
- Kiro MCP 集成文档：[https://kiro.dev/docs/mcp/](https://kiro.dev/docs/mcp/)
