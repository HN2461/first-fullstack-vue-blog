---
title: "第一篇：AI 工具规则文档是什么，为什么需要它"
slug: "ai-rules-ai-e659b444"
summary: "从\"AI 每次都忘了你的项目规范\"这个痛点出发，解释规则文档的本质、解决的核心问题，并横向对比 Claude Code、Codex、Cursor、Devin / Windsurf、Kiro、Gemini CLI、GitHub Copilot 七大工具的规则文件名、存放位置与加载方式。"
category: "Rules"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Rules"
tags:
  - "AGENTS.md"
  - "CLAUDE.md"
  - "Rules"
  - "AI规则文档"
  - "上下文管理"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cabfe8"
originalSlug: "ai-rules-ai-e659b444"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.674Z"
updatedAt: "2026-07-30T14:24:30.296Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 第一篇：AI 工具规则文档是什么，为什么需要它

> 资料来源：Anthropic 官方文档、OpenAI / agentsmd 官方仓库、Cursor / Devin Desktop（原 Windsurf）/ Kiro / GitHub Copilot / Gemini CLI 官方文档。初稿整理：2026-04；按官方文档复核更新：2026-07-04。

[[toc]]

---

## 一、从一个真实的痛点说起

你打开 Claude Code，让它帮你写一个新接口。它生成了代码，但：

- 用了 `npm` 而不是你们团队统一的 `pnpm`
- 测试框架写成了 Jest，但你们早就迁移到 Vitest 了
- 把新文件放在了 `/utils/` 而不是你们约定的 `/src/services/`
- 提交信息格式完全不符合你们的 Conventional Commits 规范

你纠正了它，下次会话又从头来过。

这不是 AI 能力的问题，而是**上下文的问题**。每次会话开始，AI 的记忆都是空白的。它不知道你的项目规范，除非你告诉它。

**规则文档**就是解决这个问题的机制。

---

## 二、规则文档是什么

规则文档是一个（或一组）Markdown 文件，放在你的项目目录里。AI 工具在每次会话开始时自动读取它，把内容注入到上下文中，从第一行代码起就遵守你写下的规范。

最直观的类比：**给 AI 看的项目 README**，或者**给 AI 的入职文档**。

区别在于：
- 普通 README 是给人类新同事看的
- 规则文档是给 AI Agent 看的，格式和侧重点有所不同

一个最简单的规则文档长这样：

```markdown
# 项目规则

## 技术栈
- Next.js 15 (App Router), TypeScript strict, Tailwind CSS
- 包管理器：pnpm，不用 npm 或 yarn
- 测试：Vitest，不用 Jest

## 约定
- 使用具名导出，不用默认导出
- 组件文件名 PascalCase，工具函数 camelCase
- API 路由统一放在 /app/api/

## 边界
- 不要修改 /legacy/ 目录，该代码已冻结
- 不要直接修改数据库迁移文件，用 alembic 生成

## 提交前检查
- 运行 pnpm lint && pnpm test，必须全部通过
```

没有特殊语法，没有 schema，就是普通 Markdown。

---

## 三、规则文档解决的核心问题

### 3.1 上下文遗忘

AI 工具的每次会话都是独立的，没有跨会话的持久记忆（除非工具专门实现了记忆机制）。规则文档是最直接的解决方案：把"每次都要说的话"写进文件，让工具自动加载。

### 3.2 团队一致性

没有规则文档时，团队里每个人对 AI 的"调教"都是私人的、临时的。有了规则文档并提交到 git，所有人共享同一套 AI 行为规范，新成员加入后 AI 也立刻遵守团队约定。

### 3.3 减少纠错成本

研究表明，一条明确的规则（如"包管理器用 pnpm"）可以在一个共享代码库中每周节省 10+ 次纠错循环。规则越具体，AI 偏离的概率越低。

### 3.4 多 Agent 协作边界

当多个 AI Agent 并行工作时（如一个处理前端、一个处理后端），规则文档可以明确各自的"地盘"，防止互相干扰：

```markdown
# frontend/AGENTS.md
你只负责 UI 层，不要修改 /backend/ 目录。

# backend/AGENTS.md  
你只负责 API 层，不要修改 /frontend/ 目录。
```

---

## 四、各工具规则文档速览

不同工具有不同的规则文件名和存放位置，但核心机制相同：

| 工具 | 规则文件名 | 存放位置 | 全局个人配置 |
|------|-----------|---------|------------|
| Claude Code | `CLAUDE.md` | 项目根目录 / `.claude/` | `~/.claude/CLAUDE.md` |
| OpenAI Codex | `AGENTS.md` | 项目根目录 | `~/.codex/AGENTS.md` |
| Cursor | `.cursor/rules/*.mdc`（也支持根目录 `AGENTS.md`） | `.cursor/rules/` / 项目根目录 | 全局规则设置 |
| Devin Desktop / Windsurf | `.devin/rules/*.md`（旧资料常见 `.windsurf/rules/*.md`） | `.devin/rules/` 目录 | 以 Devin / Windsurf 当前设置和文档为准 |
| Kiro | Steering 文件（也支持 `AGENTS.md`） | `.kiro/steering/*.md` / 工作区根目录 | 用户级 Steering |
| Gemini CLI | `GEMINI.md` | 项目根目录 | `~/.gemini/GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` / `.github/instructions/*.instructions.md` / `AGENTS.md` | `.github/` / 仓库任意目录 | 以 IDE 设置为主 |

### 跨工具标准：AGENTS.md

`AGENTS.md` 是近两年最常见的跨工具规则文件格式之一。公开资料显示，它在 2025 年下半年形成统一格式，并在 2025 年 12 月后由 **Linux 基金会旗下的 Agentic AI Foundation（AAIF）** 持续维护。  

但有一个非常重要的现实点：**文件名虽然统一了，各工具的加载范围、目录层级支持、与各自原生规则系统的关系并不完全一样。**

截至 **2026 年 7 月 4 日**，本系列涉及工具里，官方文档可明确确认的支持情况大致如下：

| 工具 | 支持情况 |
|------|---------|
| OpenAI Codex CLI | ✅ 原生支持（发起者） |
| GitHub Copilot | ✅ 支持；仓库内可放一个或多个 `AGENTS.md`，最近目录优先 |
| Cursor | ✅ 支持；但当前官方文档把它定位为**项目根目录的简单替代方案** |
| Windsurf | ✅ 支持（根目录=always_on，子目录=glob） |
| Kiro | ✅ 支持；可放工作区根目录或 `~/.kiro/steering/` |
| Claude Code | ⚠️ 不直接支持，需在 CLAUDE.md 中用 `@AGENTS.md` 手动引用 |
| Gemini CLI | ⚠️ 可通过 `settings.json` 配置 `context.fileName` 添加支持 |

如果你是多工具混用团队，最稳妥的做法不是死记"谁支持 AGENTS.md"，而是记住这条经验：

- `AGENTS.md` 适合放跨工具共享的核心约定
- 各工具真正复杂的路径作用域、激活模式、记忆机制，还是要写回它们自己的原生规则系统

---

## 五、规则文档 vs 其他上下文机制

规则文档不是唯一的上下文管理方式，了解它与其他机制的区别有助于正确使用：

| 机制 | 特点 | 适合场景 |
|------|------|---------|
| 规则文档（Rules） | 手动编写，持久，每次会话加载 | 稳定的项目规范、团队约定 |
| 自动记忆（Auto Memory） | AI 自动生成，持久，按需加载 | AI 从对话中学到的偏好和经验 |
| MCP 工具 | 动态数据，实时调用 | 需要查询外部系统的信息 |
| Skills / Workflows | 可复用的任务模板 | 重复性的多步骤操作 |
| 对话上下文 | 临时，会话结束即消失 | 一次性的临时指令 |

规则文档的核心价值在于**稳定性**和**可共享性**：写一次，所有会话、所有团队成员都受益。

---

## 六、什么内容适合写进规则文档

### 适合写的

- **技术栈声明**：框架、语言版本、主要依赖、包管理器
- **代码约定**：命名规范、文件组织、导入方式、代码风格
- **边界规则**：哪些目录不能动、哪些操作需要审批
- **验证步骤**：提交前必须执行的命令
- **项目结构**：各目录的职责说明

### 不适合写的

- **整个代码规范文档**：提取最关键的 10 条，其余用链接引用
- **临时性指令**：只在当前任务有效的指令，直接在对话中说
- **工具特有配置**：Claude Code 的 plan mode 配置不应出现在 AGENTS.md 里
- **密钥和凭证**：规则文档会提交到 git，绝对不能写敏感信息

---

## 七、本系列后续内容

- **第二篇**：AGENTS.md 开放标准完全指南——格式规范、多级目录、各工具支持细节
- **第三篇**：CLAUDE.md 与 Claude Code 记忆系统——四层文件层级、Auto Memory、路径作用域规则
- **第四篇**：Cursor Rules / Windsurf Rules / Kiro Steering——三大工具深度实战
- **第五篇**：Gemini CLI GEMINI.md 与 GitHub Copilot 指令文件

---

> 参考资料：
> - [AGENTS.md GitHub 官方仓库 - OpenAI](https://github.com/openai/agents.md)
> - [AGENTS.md 完整指南 - vibecoding.app](https://vibecoding.app/blog/agents-md-guide)
> - [Claude Code 记忆系统官方文档 - Anthropic](https://docs.anthropic.com/en/docs/claude-code/memory)
