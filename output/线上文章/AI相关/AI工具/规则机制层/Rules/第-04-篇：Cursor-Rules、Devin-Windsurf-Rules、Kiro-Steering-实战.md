---
title: "第 04 篇：Cursor Rules、Devin-Windsurf Rules、Kiro Steering 实战"
slug: "ai-rules-cursor-windsurf-kiro-cursor-windsurf-kiro-e5498e74"
summary: "深度对比 Cursor、Devin Desktop / Windsurf、Kiro 三大工具的规则文档系统，包括 Cursor MDC 四种规则类型、Windsurf 到 Devin 的规则路径变化、Kiro Steering 四种 inclusion 模式与全局/团队 Steering，附完整实战配置示例。"
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
updatedAt: "2026-07-31T11:16:25.248Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 04 篇：Cursor Rules、Devin-Windsurf Rules、Kiro Steering 实战

> 资料来源：Cursor 官方文档、Devin / Windsurf 官方文档、Kiro 官方文档。初稿整理：2026-04；按官方文档复核更新：2026-07-04。

[[toc]]

---

## 一、Cursor Rules

### 1.1 演进历史

Cursor 是最早普及"项目级 AI 规则"概念的工具之一，规则系统经历了两代：

| 版本 | 文件 | 状态 |
|------|------|------|
| 第一代 | `.cursorrules`（项目根目录，单文件） | **仍可用，但已是 legacy / deprecated** |
| 第二代 | `.cursor/rules/*.mdc`（目录，多文件） | 当前官方推荐 |

> **按 2026-07-04 官方文档的稳妥说法**：`.cursorrules` 还在兼容范围内，但已经被明确标为 legacy，官方建议迁移到 `.cursor/rules/`。如果你正在新建规则，不要再围绕 `.cursorrules` 设计。

同时，Cursor 也支持读取 `AGENTS.md`，但当前定位是：**把它当成放在项目根目录、全局生效、单文件的简单替代方案**，不是 `.cursor/rules/` 的完整替身。

### 1.2 MDC 格式

新版规则文件使用 `.mdc` 扩展名，格式为 Markdown + YAML frontmatter。**注意：`.mdc` 扩展名是触发 Cursor 解析 frontmatter 的关键**，`.md` 文件在 `.cursor/rules/` 中会被当作 Manual-only 规则处理。

```markdown
---
description: TypeScript 开发约定
globs:
  - src/**/*.ts
  - src/**/*.tsx
alwaysApply: false
---

# TypeScript 规范

- 使用 strict 模式，禁止 `any` 类型，用 `unknown` + 类型守卫代替
- 只用具名导出，不用默认导出
- 所有函数必须有明确的返回类型注解
- 优先使用 `type` 定义对象形状，`interface` 只用于可扩展的契约
```

**frontmatter 字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `description` | string | 规则描述，AI 用它判断是否需要加载（Agent Requested 模式） |
| `globs` | **YAML 数组** | 文件匹配模式，**必须写成数组格式**，逗号分隔字符串会静默丢弃第二个以后的模式 |
| `alwaysApply` | boolean | `true` = 始终加载，`false` = 按条件加载 |

> **常见错误**：`globs: src/**/*.ts, src/**/*.tsx`（逗号字符串）会静默忽略 `src/**/*.tsx`。正确写法是 YAML 数组：
> ```yaml
> globs:
>   - src/**/*.ts
>   - src/**/*.tsx
> ```

### 1.3 四种规则类型

Cursor 规则根据 frontmatter 的组合分为四种类型：

**类型一：Always（始终加载）**

```markdown
---
description:
globs:
alwaysApply: true
---
```

每次对话都加载，不管处理什么文件。适合全局约定（代码风格、提交规范等）。

**类型二：Auto Attached（自动附加）**

```markdown
---
description:
globs:
  - src/**/*.ts
  - src/**/*.tsx
alwaysApply: false
---
```

当用户在对话中**附加或提及**匹配 glob 的文件时自动加载。注意：Agent 主动处理匹配文件时不会自动触发，只有用户显式附加文件才触发。

**类型三：Agent Requested（AI 判断）**

```markdown
---
description: React 组件开发规范，包含 hooks 使用约定和性能优化建议
globs:
alwaysApply: false
---
```

只有 `description` 有内容，`globs` 为空，`alwaysApply: false`。AI 根据 description 判断当前任务是否需要这条规则，决定是否加载完整内容。

**类型四：Manual（手动引用）**

```markdown
---
description:
globs:
alwaysApply: false
---
```

三个字段全为空时即为 Manual 类型。不在系统提示中出现，只有用户在对话中输入 `@ruleName`（文件名去掉 `.mdc` 后缀）时才加载。适合不常用但需要时很重要的规则。

### 1.4 规则注入顺序

Cursor 组装 prompt 时，规则按以下顺序注入到模型上下文最前面：

1. **Team Rules**（组织级，通过 Dashboard 管理）
2. **User Rules**（Cursor Settings 中的全局规则）
3. **Project Rules**（`.cursor/rules/` 中的 MDC 文件）
4. 对话历史、附加文件、代码库上下文

> **注意**：规则只影响 Chat 和 Agent 模式，**不影响 Cursor Tab 自动补全**。Tab 补全使用独立的低延迟流水线，不注入 MDC 规则。

### 1.5 AGENTS.md 在 Cursor 里的当前边界

Cursor 官方当前文档对 `AGENTS.md` 的定位非常明确：

- 放在**项目根目录**
- 作为 `.cursor/rules/` 的简单替代
- 不支持 MDC 那样的 frontmatter、复杂激活逻辑和多文件拆分

如果你的项目已经开始出现"前端一套规则、后端一套规则、测试一套规则"这种需求，就该直接上 `.cursor/rules/`，不要指望单个 `AGENTS.md` 长期扛住。

### 1.6 目录结构

```
project/
├── AGENTS.md                    # 跨工具共享规则（Cursor 当前文档要求放根目录）
└── .cursor/
    └── rules/
        ├── global-style.mdc     # 全局代码风格（alwaysApply: true）
        ├── typescript.mdc       # TypeScript 约定（glob: src/**/*.ts）
        ├── testing.mdc          # 测试规范（glob: tests/**）
        ├── api-design.mdc       # API 设计（glob: src/api/**）
        └── db-migration.mdc     # 数据库迁移（manual，@db-migration 触发）
```

### 1.7 全局规则

全局规则通过 Cursor 设置界面配置（Settings → Rules for AI），对所有项目生效。适合个人偏好（语言、回复风格等）。

### 1.8 实战示例

**全局代码风格规则（alwaysApply）：**

```markdown
---
description: 全局代码风格约定
globs:
alwaysApply: true
---

# 代码风格

- 2 空格缩进，单引号，无行尾分号
- 优先使用 `const`，需要重新赋值时用 `let`，不用 `var`
- 异步操作统一用 `async/await`，不用 `.then()` 链
- 提交前运行 `npm run lint && npm test`
```

**React 组件规则（Auto Attached）：**

```markdown
---
description: React 组件开发规范
globs:
  - src/components/**/*.tsx
  - src/views/**/*.tsx
alwaysApply: false
---

# React 组件规范

- 只用函数式组件，不用 class 组件
- 自定义 hooks 放在 `src/hooks/`，文件名以 `use` 开头
- 组件 props 用 `type` 定义，不用 `interface`
- 避免在渲染函数中创建新对象/数组，用 `useMemo` 或提取到组件外
- 组件文件名 PascalCase，每个文件只导出一个组件
```

**从 .cursorrules 迁移到 MDC 的步骤：**

1. 创建 `.cursor/rules/` 目录
2. 把 `.cursorrules` 内容按主题拆分成多个 `.mdc` 文件
3. 为每个文件添加 YAML frontmatter（全局规则用 `alwaysApply: true`，文件特定规则用 `globs` 数组）
4. 迁移完成后，删除旧 `.cursorrules`，避免团队误以为它仍是主配置入口

---

## 二、Devin Desktop / Windsurf Rules

### 2.1 规则系统架构

2026 年复习 Windsurf 规则时，最容易过时的是路径名。Windsurf 相关产品和文档已经逐步进入 Devin Desktop / Devin Docs 口径，因此旧教程里的 `.windsurf/rules/`、`.windsurfrules`、`~/.codeium/windsurf/...` 不能再无脑照抄到新环境。

更稳妥的理解是：Devin Desktop / Windsurf 的上下文管理仍然围绕 rules、AGENTS.md、memories / knowledge、workflows 这几类能力，但具体路径和 UI 名称要以当前版本为准。

| 机制 | 激活方式 | 适合场景 |
|------|---------|---------|
| **Rules** | 手动定义，多种激活模式 | 编码约定、风格指南、项目约束 |
| **AGENTS.md** | 自动（根目录=始终，子目录=glob） | 零配置的目录级约定 |
| **Memories** | Cascade 自动生成 | 让 AI 记住一次性事实 |
| **Workflows** | 手动 `/workflow-name` 触发 | 可复用的多步骤任务 |

### 2.2 规则存储位置

| 作用域 | 路径 | 说明 |
|--------|------|------|
| **全局** | 以当前 Devin / Windsurf 设置界面和文档为准 | 旧资料常见 `~/.codeium/windsurf/memories/global_rules.md` |
| **工作区** | `.devin/rules/*.md`（新资料优先复核） | 旧资料常见 `.windsurf/rules/*.md` |
| **AGENTS.md** | 工作区任意目录 | 与规则引擎相同处理 |
| **系统级（企业）** | 系统目录（IT 部署） | 只读，用户不可修改 |

**历史路径提醒**：

```
~/.codeium/windsurf/memories/global_rules.md  # Windsurf 阶段常见全局规则路径
.windsurfrules                                # Windsurf 阶段旧格式
.windsurf/rules/*.md                          # Windsurf 阶段常见工作区规则
.devin/rules/*.md                             # Devin Desktop 新资料中更应优先复核的路径
```

### 2.3 四种激活模式

工作区规则文件通过 frontmatter 的 `trigger` 字段声明激活模式：

| 模式 | trigger 值 | 触发方式 | 上下文消耗 |
|------|-----------|---------|----------|
| **Always On** | `always_on` | 每条消息都包含完整规则 | 每次消耗 |
| **Model Decision** | `model_decision` | 系统提示只含描述，AI 判断是否读取完整内容 | 描述始终；内容按需 |
| **Glob** | `glob` | 处理匹配文件时激活 | 只在匹配时消耗 |
| **Manual** | `manual` | 用户输入 `@rule-name` 时激活 | 只在 @mention 时消耗 |

**示例：Glob 模式规则**

```markdown
---
trigger: glob
globs: **/*.test.ts
---

# 测试文件规范

- 所有测试使用 `describe`/`it` 块结构
- 必须 mock 外部 API 调用
- 测试文件名与被测文件同名，加 `.test.ts` 后缀
- 每个测试用例只测一个行为
```

**示例：Model Decision 模式规则**

```markdown
---
trigger: model_decision
description: 数据库迁移操作规范，包含 Alembic 命令和注意事项
---

# 数据库迁移规范

- 不要直接修改 /alembic/versions/ 目录
- 生成迁移：`alembic revision --autogenerate -m "描述"`
- 应用迁移：`alembic upgrade head`
- 回滚：`alembic downgrade -1`
- 迁移前必须备份生产数据库
```

### 2.4 Token 预算管理

Windsurf 对规则文件有**字符限制**：

- 全局规则：**6000 字符**
- 工作区规则：**12000 字符/文件**
- 两个文件合计的 token 预算有限，超出会从底部截断

**预算分配建议：**

```
全局规则（6000 字符）：
  - 语言偏好（中文/英文）
  - 通用代码风格（缩进、引号）
  - 安全习惯（不硬编码密钥）
  - 回复风格（简洁、直接）

工作区规则（按文件分散）：
  - 技术栈声明（always_on，高优先级）
  - 目录结构（always_on）
  - 各模块规范（glob，按需加载）
  - 特殊操作规范（model_decision 或 manual）
```

### 2.5 全局规则配置

```bash
# 新建全局规则前先查看当前 Devin / Windsurf 设置页或官方文档；
# 旧 Windsurf 环境中可能仍能看到 ~/.codeium/windsurf/memories。
```

```markdown
# 全局规则

## 语言与风格
- 用中文回复
- 直接给出答案，不要"好的！""当然！"这类开场白
- 不确定时说出来，给出两个最可能的选项

## 代码输出
- 编辑现有文件时显示 diff，不要重写整个文件
- 非显而易见的逻辑必须加一行注释说明原因
- 优先显式而非聪明——不要为了简洁牺牲可读性

## 安全
- 永远不要硬编码密钥、API key 或凭证
- 涉及 auth、权限、数据访问的改动必须标注提醒
```

### 2.6 验证规则是否加载

在 Cascade 中询问：

```
你当前遵守哪些规则？
```

Cascade 会列出已加载的规则。如果描述不准确，说明文件有语法问题或路径不对。

### 2.7 Memories 自动记忆

Windsurf 的 Memories 与 Claude Code 的 Auto Memory 类似：

- Cascade 在对话中自动生成并存储记忆
- 旧 Windsurf 环境里常见存储路径是 `~/.codeium/windsurf/memories/`（工作区关联）；新版本以当前 Devin / Windsurf 文档为准
- 不提交到 git，不跨工作区共享
- 可以主动要求：`"记住：我们的 API 测试需要本地 Redis"`

**Memories vs Rules 的选择：**

- 稳定的项目规范 → **Rules**（手动维护，提交 git）
- AI 从对话中学到的一次性事实 → **Memories**（自动生成，本地存储）

---

## 三、Kiro Steering

### 3.1 Steering 的定位

Kiro 的规则机制叫 **Steering**，存放在 `.kiro/steering/` 目录。与其他工具的单文件方案相比，Steering 更强调**结构化**和**按需加载**。

Kiro 官方推荐三个基础 Steering 文件：

| 文件 | 内容 |
|------|------|
| `product.md` | 产品定位、功能描述、目标用户、业务目标 |
| `tech.md` | 技术栈、架构说明、关键依赖、技术约束 |
| `structure.md` | 目录结构、模块组织、命名约定、架构决策 |

### 3.2 三种作用域

Kiro Steering 支持三种作用域，这是与其他工具最大的区别之一：

| 作用域 | 路径 | 说明 |
|--------|------|------|
| **工作区** | `.kiro/steering/` | 只对当前工作区生效 |
| **全局** | `~/.kiro/steering/` | 对所有工作区生效 |
| **团队** | `~/.kiro/steering/`（MDM/GP 推送） | 通过 MDM 或 Group Policy 推送到团队成员 PC |

**优先级**：工作区 Steering 优先于全局 Steering。全局可以设置通用规范，工作区可以覆盖特定项目的规则。

### 3.3 四种 inclusion 模式

| 模式 | frontmatter 配置 | 触发时机 |
|------|-----------------|---------|
| `always`（默认） | 无需配置，或 `inclusion: always` | 每次会话都加载 |
| `fileMatch` | `inclusion: fileMatch` + `fileMatchPattern` | 处理匹配文件时加载 |
| `manual` | `inclusion: manual` | 用户在对话中用 `#文件名` 显式引用，或输入 `/` 选择 slash command |
| `auto` | `inclusion: auto` + `name` + `description` | AI 根据 description 判断是否加载；也可用 `/name` slash command 显式触发 |

> **注意**：frontmatter 必须是文件的**第一行内容**，前面不能有空行或其他内容。

### 3.4 文件示例

**product.md（始终加载）：**

```markdown
---
inclusion: always
---

# 产品说明

这是一个 Vue 3 知识博客，面向中文开发者，部署在 GitHub Pages。

主要功能：
- Markdown 笔记展示与渲染
- 全文搜索（fuse.js）
- 分类浏览
- 暗色主题切换

目标用户：前端开发者，希望系统整理和分享技术笔记。
```

**api-rules.md（按文件匹配加载，支持数组）：**

```markdown
---
inclusion: fileMatch
fileMatchPattern: ["src/utils/**/*.js", "src/api/**/*.js"]
---

# 工具函数与 API 规范

- 每个工具函数必须有 JSDoc 注释
- 纯函数优先，避免副作用
- 测试文件放在 src/utils/__tests__/，命名 *.test.js
- 新增工具函数必须同步新增测试
```

**deployment.md（手动引用）：**

```markdown
---
inclusion: manual
---

# 部署操作规范

## GitHub Pages 部署
1. 运行 `npm run build` 生成 dist/
2. 确认 dist/ 中有 .nojekyll 文件
3. 推送到 gh-pages 分支

## 注意事项
- vite.config.js 中 base 必须是 '/HaonanKnowledgeBlog/'
- 部署路径变化时需同步更新 vite.config.js
```

**performance-guide.md（auto 模式，AI 自动判断）：**

```markdown
---
inclusion: auto
name: performance-guide
description: 前端性能优化指南，包含懒加载、代码分割、缓存策略。当涉及性能优化或大型组件时使用。
---

# 性能优化规范

- 路由级组件使用动态 import 实现代码分割
- 图片统一使用懒加载（loading="lazy"）
- 避免在模板中使用复杂计算，提取为 computed
- 大列表使用虚拟滚动
```

### 3.5 一键生成基础 Steering 文件

Kiro 提供自动生成功能：

1. 打开 Kiro 面板，导航到 Steering 区域
2. 点击 **Generate Steering Docs** 按钮，或点击 `+` 按钮选择 "Foundation steering files"
3. Kiro 扫描项目结构，自动生成 `product.md`、`tech.md`、`structure.md`

生成后再手动补充团队特有的规范。

### 3.6 文件引用语法

Steering 文件支持引用其他文件，避免重复维护：

```markdown
# tech.md

项目的完整 API 规范详见 #[[file:api/openapi.yaml]]

数据库 schema 见 #[[file:prisma/schema.prisma]]

组件模式参考 #[[file:components/ui/button.tsx]]
```

### 3.7 AGENTS.md 原生支持

Kiro 官方文档明确说明：**Kiro 原生支持 AGENTS.md 标准**。

- 可以把 `AGENTS.md` 放在工作区根目录或 `~/.kiro/steering/` 全局目录
- Kiro 会自动识别并加载，无需额外配置
- AGENTS.md 不支持 inclusion 模式，始终以 `always` 模式加载

```
project/
├── AGENTS.md              # Kiro 自动识别，始终加载
└── .kiro/
    └── steering/
        ├── product.md     # 产品说明（always）
        ├── tech.md        # 技术栈（always）
        └── api-rules.md   # API 规范（fileMatch）
```

---

## 四、三工具横向对比

| 维度 | Cursor Rules | Devin / Windsurf Rules | Kiro Steering |
|------|-------------|----------------|---------------|
| 文件格式 | `.mdc`（MDC，YAML frontmatter） | `.md`（Markdown + frontmatter） | `.md`（Markdown + frontmatter） |
| 存放位置 | `.cursor/rules/` | 新资料优先复核 `.devin/rules/`，旧项目常见 `.windsurf/rules/` | `.kiro/steering/` |
| 激活模式数量 | 4 种 | 4 种 | 4 种 |
| 路径作用域 | `globs` 数组 | `globs` 字段 | `fileMatchPattern`（支持数组） |
| 全局个人配置 | Cursor 设置界面 | 以 Devin / Windsurf 当前设置为准；旧资料常见 `~/.codeium/windsurf/memories/global_rules.md` | `~/.kiro/steering/` |
| 团队统一配置 | ❌ | 系统级（企业 IT 部署） | ✅（MDM/GP 推送到 `~/.kiro/steering/`） |
| Token/字符限制 | 无明确限制（建议单文件 < 100 行） | 6000（全局）/ 12000（工作区） | 无明确限制 |
| 自动记忆 | ❌ | ✅（Memories） | ❌ |
| AGENTS.md 支持 | ✅，但当前主线是**根目录单文件的简单替代方案** | ✅（根目录=always，子目录=glob） | ✅ 原生支持（始终包含） |
| 一键生成 | ❌ | ❌ | ✅（Generate Steering Docs） |
| .cursorrules 兼容 | ⚠️ 仍兼容，但已 deprecated | `.windsurfrules` 属历史路径，是否继续支持以当前版本为准 | 不适用 |

---

> 参考资料：
> - [Cursor Rules 官方文档 - cursor.com](https://cursor.com/docs/rules)
> - [Cursor MDC 完整技术指南 - morphllm.com](https://www.morphllm.com/cursor-mdc-rules)
> - [Windsurf Cascade Memories 官方文档 - windsurf.com](https://docs.windsurf.com/windsurf/cascade/memories)
> - [Windsurf AGENTS.md 官方文档 - windsurf.com](https://docs.windsurf.com/windsurf/cascade/agents-md)
> - [Kiro Steering 官方文档 - kiro.dev](https://kiro.dev/docs/steering/)（页面更新：2026-02-18）
> - [Kiro 全局 Steering 发布 changelog - kiro.dev](https://kiro.dev/changelog/remote-mcp-and-global-steering/)
