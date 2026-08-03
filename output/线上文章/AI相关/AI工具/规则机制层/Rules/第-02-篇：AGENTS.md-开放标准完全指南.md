---
title: "第 02 篇：AGENTS.md 开放标准完全指南"
slug: "ai-rules-agents-agents-md-908e49bb"
summary: "深度解析 AGENTS.md 开放标准的起源、格式规范、多级目录结构、各工具支持情况与优先级规则，附三套开箱即用的项目模板和高质量写作指南。"
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
updatedAt: "2026-07-31T11:16:25.232Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 02 篇：AGENTS.md 开放标准完全指南

> 资料来源：OpenAI / agentsmd 官方仓库、GitHub Copilot / Cursor / Devin Desktop（原 Windsurf）/ Kiro / Gemini CLI 官方文档。初稿整理：2026-04；按官方文档复核更新：2026-07-04。

[[toc]]

---

## 一、AGENTS.md 的起源

### 1.1 为什么需要一个统一标准

2025 年之前，每个 AI 编程工具都有自己的规则文件格式：

- Claude Code 用 `CLAUDE.md`
- Cursor 用 `.cursorrules`
- Windsurf 用 `.windsurfrules`
- 各工具互不兼容

对于使用多种工具的团队来说，这意味着要维护多份内容几乎相同的配置文件，改一条规则要改好几个地方。

### 1.2 OpenAI 发起标准化

2025 年 8 月，OpenAI 随 Codex CLI 发布了 `AGENTS.md` 格式，并将其设计为**开放标准**而非 Codex 专属格式。核心设计原则：

- 纯 Markdown，无特殊语法，无 schema
- 任何工具都可以读取，无需适配层
- 文件名固定为 `AGENTS.md`，位置约定俗成

这个设计让其他工具的采纳成本极低——只需在启动时多扫描一个文件名。

### 1.3 移交 Linux 基金会

公开资料与 agents.md 社区站点都把 `AGENTS.md` 描述为由 **Linux 基金会旗下的 Agentic AI Foundation（AAIF）** 持续维护的开放格式。  

比起死记某个时间点的仓库数量，更值得记住两件事：

- `AGENTS.md` 已经从 Codex 专属约定，发展成多个 AI 编程工具都愿意兼容的公共入口
- 兼容的是**文件名和基本思路**，不是完全一致的实现细节

---

## 二、文件格式规范

### 2.1 基本结构

`AGENTS.md` 是纯 Markdown 文件，没有强制 schema。推荐的**四段式结构**：

```markdown
# AGENTS.md

## Stack（技术栈）
明确说明框架、语言版本、主要依赖、包管理器。

## Conventions（约定）
代码风格、命名规范、文件组织方式。

## Boundaries（边界）
哪些目录不能动、哪些操作需要审批、哪些依赖不能引入。

## Verification（验证）
完成任务前必须执行的检查步骤。
```

### 2.2 官方最小示例

来自 OpenAI 官方 GitHub 仓库的示例：

```markdown
# Sample AGENTS.md file

## Dev environment tips
- Use `pnpm dlx turbo run where <project_name>` to jump to a package
- Run `pnpm install --filter <project_name>` to add the package to workspace
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package

## Testing instructions
- Find the CI plan in the .github/workflows folder
- Run `pnpm turbo run test --filter <project_name>` to run every check
- Fix any test or type errors until the whole suite is green
- Add or update tests for the code you change, even if nobody asked

## PR instructions
- Title format: [<project_name>] <Title>
- Always run `pnpm lint` and `pnpm test` before committing
```

### 2.3 写作原则

**具体胜于模糊**

| ❌ 模糊（无效） | ✅ 具体（有效） |
|--------------|--------------|
| 写好代码 | 使用 2 空格缩进，单引号，无行尾分号 |
| 测试你的改动 | 提交前运行 `pnpm lint && pnpm test` |
| 保持文件整洁 | API handler 放在 `src/api/handlers/` |
| 遵循最佳实践 | 所有 SQL 使用参数化查询，禁止字符串拼接 |

**边界规则比偏好规则更重要**

"喜欢函数式风格"是偏好，AI 可能遵守也可能不遵守。"不要修改 `/migrations/` 目录，用 alembic 生成迁移"是边界，能防止真实损害。

**用示例代码说明约定**

```markdown
## Conventions

API 端点命名模式：

\`\`\`python
@router.get("/api/v1/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return UserResponse.model_validate(user)
\`\`\`
```

**控制文件大小**

建议 **500 行以内**。太长的文件会让 AI 遗漏关键规则，因为关键规则可能被埋在第 1847 行。超出时用子目录文件分散。

---

## 三、多级目录结构

### 3.1 基本原则

从开放标准的角度看，`AGENTS.md` 很适合放在不同目录里实现**作用域隔离**。  

但到 2026-07-04 为止，**并不是所有工具都把这件事实现得一模一样**。更准确的理解是：

- 对 Codex、GitHub Copilot 这类工具来说，子目录 `AGENTS.md` 已经是主线能力之一
- 对 Cursor 来说，当前官方文档仍把 `AGENTS.md` 定位为**项目根目录的简单替代方案**；复杂分层更适合 `.cursor/rules/`
- 对 Kiro 来说，`AGENTS.md` 能读，但复杂 inclusion / fileMatch 仍建议交给 Steering
- 对 Devin Desktop / Windsurf 来说，旧资料里的 `.windsurf/rules/` 需要按当前 Devin 文档复核，新写规则优先查 `.devin/rules/` 等当前路径

```
project/
├── AGENTS.md              # 全局规则：适用于整个项目
├── frontend/
│   └── AGENTS.md          # 前端专属规则（覆盖全局同名规则）
├── backend/
│   └── AGENTS.md          # 后端专属规则
└── infra/
    └── AGENTS.md          # 基础设施规则
```

### 3.2 多 Agent 协作场景

所以，下面这个目录结构更适合把它理解为**开放标准层面的理想写法**，而不是“所有工具今天都完全等价支持”的保证：

```markdown
# frontend/AGENTS.md
你只负责 UI 层。
- 不要修改 /backend/ 目录
- 不要修改数据库 schema
- 组件放在 /frontend/src/components/

# backend/AGENTS.md
你只负责 API 层。
- 不要修改 /frontend/ 目录
- 所有数据库操作通过 Repository 层
- 新增接口需同步更新 /docs/api-reference.md

# infra/AGENTS.md
你只负责 Terraform 配置。
- 任何 apply 操作需要人工审批
- 不要修改生产环境配置，只改 staging
```

### 3.3 全局个人配置

在用户主目录放置全局 `AGENTS.md`，对所有项目生效：

```
~/.codex/AGENTS.md     # Codex 全局个人规则
```

示例内容：

```markdown
# 全局个人规则

## 语言偏好
- 用中文回复
- 解释要简洁，不要废话

## 代码风格
- 所有项目统一使用 2 空格缩进
- 优先使用 async/await，不用 Promise.then 链

## 安全习惯
- 永远不要硬编码密钥或凭证
- 涉及 auth、权限、数据访问的改动必须标注提醒
```

---

## 四、各工具支持详情

### 4.1 OpenAI Codex CLI（原生支持）

Codex CLI 是 `AGENTS.md` 的发起者，支持最完整。

**文件发现规则**：从 Git 根目录向下遍历到当前工作目录，每个目录都检查规则文件。

**优先级顺序**（同一目录内）：
```
AGENTS.override.md > AGENTS.md > 回退文件（TEAM_GUIDE.md、.agents.md）
```

**配置回退文件名**：在 `~/.codex/config.toml` 中可以添加自定义回退文件名：

```toml
[agent]
additional_instruction_files = ["CLAUDE.md", "TEAM_GUIDE.md"]
```

这样 Codex 也会读取 `CLAUDE.md`，方便与 Claude Code 共享规则。

### 4.2 GitHub Copilot（2025-08 起支持）

Copilot 同时支持 `AGENTS.md` 和原有的 `.github/copilot-instructions.md`，两者可以共存：

- `AGENTS.md`：跨工具共享规则
- `.github/copilot-instructions.md`：Copilot 专属规则

优先级：最近目录的文件优先（与其他工具一致）。

### 4.3 Cursor（支持，但要注意当前限制）

Cursor 同时支持 `AGENTS.md` 和 `.cursor/rules/` 目录，但两者定位不同：

- `AGENTS.md`：官方当前文档把它当成**放在项目根目录的简单替代方案**
- `.cursor/rules/`：Cursor 的主力规则系统，支持多文件、`globs`、`alwaysApply`、Agent Requested 等能力

如果你需要路径作用域、手动触发、按描述让模型判断是否加载，优先用 `.cursor/rules/`，不要硬把这些需求塞进单个 `AGENTS.md`。

### 4.4 Devin Desktop / Windsurf（支持，但路径要按新文档复核）

Windsurf 品牌和文档在 2026 年已经逐步进入 Devin Desktop / Devin Docs 口径。旧资料里常见 `.windsurf/rules/`、`.windsurfrules`、`~/.codeium/windsurf/...` 等路径，复习时要知道它们来自 Windsurf 阶段；新建配置前应以当前 Devin 文档和本机版本为准。

更稳妥的记法：

- 长期项目规则：优先查当前 Devin Desktop 的 rules 文档，新资料常见 `.devin/rules/*.md`
- 跨工具共享规则：仍可把 `AGENTS.md` 当作公共规范入口，但不要把旧 Windsurf 的激活细节默认套到所有新版本
- 历史迁移：看到 `.windsurf/rules/` 时先判断它是旧项目兼容路径，还是当前产品仍明确支持的路径

### 4.5 Kiro（原生支持）

Kiro 官方文档明确说明原生支持 `AGENTS.md` 标准：

- 放在工作区根目录：自动识别，始终包含
- 放在 `~/.kiro/steering/`：作为全局 Steering 对所有工作区生效
- AGENTS.md 不支持 inclusion 模式 frontmatter，始终全量加载

### 4.6 Claude Code（间接支持）

Claude Code 不直接读取 `AGENTS.md`，但可以在 `CLAUDE.md` 中用 `@` 语法引用：

```markdown
# CLAUDE.md

@AGENTS.md

## Claude Code 专属配置
- 在 `src/billing/` 下的改动使用 plan mode
- 权限边界：不允许执行 rm -rf 命令
```

这样 Claude Code 会在会话开始时加载 `AGENTS.md` 的内容，同时保留 Claude 专属配置。

### 4.7 Gemini CLI（可配置支持）

Gemini CLI 默认读取 `GEMINI.md`，但可以通过 `settings.json` 配置额外读取 `AGENTS.md`：

```json
{
  "context": {
    "fileName": ["AGENTS.md", "GEMINI.md"]
  }
}
```

配置后，Gemini CLI 会把 `AGENTS.md` 视为可选的 context file 名称之一，和 `GEMINI.md` 一起参与层级加载。

---

## 五、实战模板

### 模板一：TypeScript Web 应用

```markdown
# AGENTS.md

## Stack
- TypeScript 5.x (strict), Next.js 15 (App Router), Tailwind CSS v4
- 数据库：PostgreSQL via Prisma ORM
- 测试：Vitest + Playwright
- 包管理器：pnpm，不用 npm 或 yarn

## Conventions
- 只用具名导出，不用默认导出
- React 组件：函数式 + hooks，文件名 PascalCase
- Server Actions 放在 /app/actions/，客户端组件加 'use client'
- 用 Zod 做所有表单校验
- 错误边界放在路由段级别

## Boundaries
- 不要直接修改 prisma/schema.prisma，迁移文件需要追踪
- 不要从 @/lib/legacy 导入，这些模块已废弃
- 注意 bundle 大小：不用 lodash（用原生），不用 moment（用 date-fns）

## Verification
- `pnpm typecheck && pnpm lint && pnpm test`
- 提交前检查未使用的 import
```

### 模板二：Python 后端

```markdown
# AGENTS.md

## Stack
- Python 3.12, FastAPI 0.115, SQLAlchemy 2.0 (async), Alembic
- 测试：pytest + httpx AsyncClient
- 包管理器：uv，不用 pip 或 poetry

## Conventions
- 所有函数签名必须有类型注解
- Pydantic v2 models 用于请求/响应 schema
- Repository 模式处理数据库访问（参考 /src/repos/ 示例）
- 通过 FastAPI Depends() 做依赖注入

## Boundaries
- 不要修改 /alembic/versions/，用 alembic revision --autogenerate 生成迁移
- 所有密钥从环境变量读取，不硬编码
- /scripts/ 是运维脚本，只在明确要求时修改

## Verification
- `make lint && make test`
- 新增接口需在 /tests/api/ 补充测试覆盖
```

### 模板三：Vue 3 前端项目

```markdown
# AGENTS.md

## Stack
- Vue 3 SFC + ESM JavaScript（不用 TypeScript）
- 构建：Vite，路由：Vue Router（hash history）
- 包管理器：npm

## Conventions
- 2 空格缩进，单引号，无行尾分号
- 组件文件名 PascalCase（如 NoteDetailPage.vue）
- 工具模块 camelCase（如 scrollProgress.js）
- src 内部导入使用 @/ 别名

## Boundaries
- public/notes-index.json 为脚本生成，不手动修改
- 修改 public/notes/ 后必须运行 npm run generate:index
- dist/ 为构建产物，不手动修改

## Verification
- npm run lint && npm test
- 修改笔记后运行 npm run generate:index
```

---

## 六、常见错误与避坑

### 错误一：把整个代码规范文档粘进去

你的 50 页编码规范不属于 `AGENTS.md`。提取最关键的 10 条，其余用链接引用：

```markdown
## Conventions
详细规范见 @docs/coding-standards.md，以下是最关键的几条：
- 使用 2 空格缩进
- 所有 SQL 使用参数化查询
```

### 错误二：只写偏好，不写边界

"喜欢函数式风格"是偏好，AI 可能遵守也可能不遵守。真正重要的是边界：

```markdown
## Boundaries
- 不要修改 /db/migrations/，用 alembic 生成
- 不要添加新依赖，我们每月审计一次包
- /vendor/ 是第三方代码，不要修改
```

### 错误三：忘记更新

迁移了测试框架但没更新 `AGENTS.md`，AI 会持续生成旧格式代码。把 `AGENTS.md` 当代码维护，技术栈变更时同步更新。

### 错误四：工具特有配置写进 AGENTS.md

Claude Code 的 plan mode 配置、Cursor 的 glob 规则不应该出现在 `AGENTS.md` 里。`AGENTS.md` 只写跨工具通用的内容。

### 错误五：超过 500 行

太长的文件会让 AI 遗漏关键规则。超出时用子目录文件分散，或用 `@import` 引用外部文件。

---

## 七、多工具团队的最佳实践

对于同时使用多种 AI 工具的团队，推荐以下目录结构：

```
project/
├── AGENTS.md                          # 共享：技术栈、约定、边界（Codex/Copilot/Cursor/Windsurf 读）
├── CLAUDE.md                          # Claude Code 专属（@AGENTS.md + Claude 特有配置）
├── GEMINI.md                          # Gemini CLI 专属
├── .github/
│   └── copilot-instructions.md        # Copilot 路径规则
└── .cursor/
    └── rules/                         # Cursor MDC 规则（glob 作用域）
```

分工原则：
- `AGENTS.md`：写"做什么"——技术栈、约定、边界、验证步骤
- 工具专属文件：写"怎么配置"——工具特有的行为、权限、路径规则

---

> 参考资料：
> - [AGENTS.md GitHub 官方仓库 - OpenAI/agentsmd](https://github.com/openai/agents.md)
> - [AGENTS.md 完整指南 2026 - vibecoding.app](https://vibecoding.app/blog/agents-md-guide)
> - [AGENTS.md 开放标准崛起 - tessl.io](https://tessl.io/blog/the-rise-of-agents-md-an-open-standard-and-single-source-of-truth-for-ai-coding-agents/)
> - [AAIF Linux 基金会公告 - digitalapplied.com](https://www.digitalapplied.com/blog/agentic-ai-foundation-open-source-agents)
