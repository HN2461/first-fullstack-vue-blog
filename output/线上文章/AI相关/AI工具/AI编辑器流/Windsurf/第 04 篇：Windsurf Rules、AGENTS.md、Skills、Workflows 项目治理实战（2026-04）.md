---
title: "第 04 篇：Windsurf Rules、AGENTS.md、Skills、Workflows 项目治理实战（2026-04）"
slug: "ai-ai-windsurf-windsurf-rules-agents-skills-workflows-92fcb3b9"
summary: "基于 Windsurf 官方文档与官方 changelog 截至 2026-04-14 的最新信息，系统讲清 Rules、AGENTS.md、Skills、Workflows 各自的职责、触发方式、目录结构、优先级和适用场景，帮助团队把 Windsurf 从“会写代码”真正用到“能沉淀规范和流程”。"
category: "Windsurf"
tags:
  - "Windsurf"
  - "Rules"
  - "AGENTS.md"
  - "Skills"
  - "Workflows"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf0c"
originalSlug: "ai-ai-windsurf-windsurf-rules-agents-skills-workflows-92fcb3b9"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 04 篇：Windsurf Rules、AGENTS.md、Skills、Workflows 项目治理实战（2026-04）

> 资料快照时间：2026-04-14
> 本篇只参考 Windsurf 官方文档与官方 changelog。
> 由于这些能力经常伴随 IDE 版本一起迭代，涉及“支持什么目录”“何时自动触发”“优先级如何覆盖”的地方，本文优先采用官方 docs 当前描述，并用 changelog 补充发布时间线。

[[toc]]

---

## 一、先说结论：这四个能力不是一回事

很多人第一次看 Windsurf 的项目治理能力，会把下面这些概念混在一起：

- `Rules`
- `AGENTS.md`
- `Skills`
- `Workflows`

但官方文档其实已经把它们的边界讲得很清楚了。

如果只用一句话概括：

- `Rules`：告诉 Cascade **应该怎么做**
- `AGENTS.md`：按目录位置自动生效的 **简化版规则**
- `Skills`：把复杂任务连同模板、脚本、清单一起打成 **能力包**
- `Workflows`：把重复任务做成 `/斜杠命令` 的 **流程模板**

这四者共同组成了 Windsurf 的项目治理层。  
如果只会用 `Code`、`Plan`、`Ask`，那你只是会“叫 AI 干活”；如果把这四者用起来，才算开始让 AI 真正适应你的项目和团队。

## 二、官方其实已经给了选型表

`Memories & Rules` 页面里，Windsurf 直接给出了一张“什么时候该用哪个”的表。翻成更好理解的话，大致就是：

| 能力 | 它解决什么问题 | 怎么触发 | 最适合放什么 |
| --- | --- | --- | --- |
| `Rules` | 给 Cascade 长期行为约束 | `always_on` / `model_decision` / `glob` / `manual` | 代码规范、风格约束、项目限制 |
| `AGENTS.md` | 给某个目录自动挂规则 | 自动，根目录 always-on，子目录 auto-glob | 目录级约定、局部架构说明 |
| `Skills` | 给复杂任务提供完整方法包 | 模型自动决定，或 `@skill-name` | 多步骤任务、需要参考文件的任务 |
| `Workflows` | 给重复流程做固定模板 | 只能手动 `/workflow-name` | PR review、部署、测试、发布检查 |

我觉得最实用的记忆方式是：

- 想约束行为，用 `Rules`
- 想按目录自动生效，用 `AGENTS.md`
- 想让模型自动学会一套复杂方法，用 `Skills`
- 想自己随时手动启动一个固定流程，用 `Workflows`

## 三、`Rules`：最基础、最通用、最像“团队制度”

### 1. 官方怎么定义 Rules

`Memories & Rules` 页面把 Rules 定义为：  
用户显式写给 Cascade 的规则，用来约束它如何工作。

这类内容通常不是“帮我完成某个任务”，而是“无论做什么，都请遵守这些要求”。

例如：

- 必须使用 `pnpm`，不要用 `npm`
- TypeScript 必须开严格模式
- 所有接口层必须带错误处理
- 测试文件必须用某种固定命名
- 不允许改生成文件

这类约束特别适合放 Rules，因为它们本质上是 **行为约束**，不是一次性任务。

### 2. Rules 的当前存储位置

根据官方页面，Rules 目前支持这些层级：

- 全局：`~/.codeium/windsurf/memories/global_rules.md`
- 工作区：`.windsurf/rules/*.md`
- `AGENTS.md`：由同一 Rules engine 处理
- 系统级（Enterprise）：操作系统特定目录

官方还写得很清楚：

- 全局规则文件上限：`6000` 字符
- 每个工作区规则文件上限：`12000` 字符

### 3. Rules 最强的地方，是四种激活方式

工作区规则通过 frontmatter 的 `trigger` 字段声明触发方式。当前官方支持四种：

- `always_on`
- `model_decision`
- `glob`
- `manual`

这四种模式解决的是完全不同的问题。

### 4. `always_on`：最硬、最稳定、也最消耗上下文

官方说明：

- 完整规则内容会进入每条消息的 system prompt
- 上下文成本是每次消息都要带

它适合放真正必须长期生效的底层约束，比如：

- 包管理器必须统一
- 不允许改某些生成目录
- 项目整体编码规范

但不适合塞太多细枝末节，否则只会浪费上下文窗口。

### 5. `model_decision`：我先告诉你这条规则存在，需不需要用你自己决定

这是我觉得 Windsurf Rules 非常聪明的一点。

官方说明：

- system prompt 里常驻的只有 `description`
- 只有当 Cascade 判断相关时，才去读完整规则

这很适合：

- 不是每次都用到
- 但一旦相关就必须拉出来看的规则

比如：

- “当前端改到表单时，必须遵循这套表单校验约定”
- “当涉及数据库迁移时，遵循这套迁移顺序”

这种规则用 `always_on` 太重，用 `manual` 又容易忘，用 `model_decision` 正合适。

### 6. `glob`：最适合文件类型或目录模式绑定

官方写法是：

- 当 Cascade 读取或编辑匹配 `globs` 的文件时，这条规则才生效

例如：

```md
---
trigger: glob
globs: **/*.test.ts
---

所有测试文件都必须使用 describe/it，并 mock 外部 API
```

这类规则特别适合：

- 测试文件
- 配置文件
- 特定语言目录
- 某类脚本目录

对于跨目录、但又只针对某类文件的约束，`glob` 是最自然的选择。

### 7. `manual`：你不手动叫它，它就不进来

官方说明：

- 不进 system prompt
- 只有你 `@rule-name` 时才启用

这特别适合：

- 偶尔才用的复杂说明
- 某个阶段才需要的操作规范
- 低频但重要的专项指导

比如：

- 发布前检查说明
- 某套遗留系统改动规则
- 数据修复专用流程说明

### 8. 官方对 Rules 的建议很实用

`Memories & Rules` 页面给出的最佳实践包括：

- 规则要简洁、具体
- 不要写“写好代码”这种泛化废话
- 用 markdown 结构化表达
- 用 bullet、编号、代码块更利于 Cascade 遵循
- 还可以用 XML 标签把相关规则分组

这其实说明一件事：  
Windsurf 并不鼓励把 Rules 当成长篇随笔，而更像一份“机器能稳定执行的人类规范”。

## 四、`AGENTS.md`：最省心的目录级规则系统

### 1. 为什么 Windsurf 官方专门支持 `AGENTS.md`

当前官方 `AGENTS.md` 页面写得非常明确：

- `AGENTS.md` 和 `agents.md` 都会被自动发现
- 它们进入和 `.windsurf/rules/` 相同的 Rules engine
- 只是作用范围不靠 frontmatter，而靠文件位置自动推断

这意味着 Windsurf 对 `AGENTS.md` 不是“顺手兼容”，而是正式纳入产品设计。

### 2. 自动作用域是它最大的优势

官方规则是：

- 根目录 `AGENTS.md`：视为 always-on
- 子目录 `AGENTS.md`：视为该目录的自动 glob 规则

例如：

- `/AGENTS.md`：整个项目生效
- `/frontend/AGENTS.md`：只在前端相关文件生效
- `/frontend/components/AGENTS.md`：只在组件目录相关文件生效

这让你可以把指导信息直接贴近代码，而不是把所有规则都塞进一个总文件里。

### 3. 什么时候优先用 AGENTS.md，而不是 Rules

官方比较页给出的结论非常清晰：

- `AGENTS.md`：适合目录特定约定
- `Rules`：适合跨目录问题、复杂触发逻辑、需要 frontmatter 控制的规则

我会这样理解：

- 只要你的规则是“这个目录下的代码应该怎么写”，优先 `AGENTS.md`
- 只要你的规则是“某类文件、某种场景、某个触发时机才生效”，优先 `Rules`

### 4. AGENTS.md 的内容应该怎么写

官方最佳实践强调：

- 聚焦当前目录真正相关的约束
- 用清晰格式
- 给具体约定，不给空话
- 不要在子目录重复父级规则

官方还给了一个非常好的对比：

更有效：

- Use TypeScript strict mode
- All API responses must include error handling
- Follow REST naming conventions for endpoints

较差：

- Write good code
- Be careful with errors
- Use best practices

这说明 AGENTS.md 不是用来写态度宣言的，而是用来写可执行约束的。

### 5. 我对 AGENTS.md 的实战建议

如果是一个正常 Web 项目，我会倾向这样分层：

- 根目录 `AGENTS.md`
  - 技术栈
  - 包管理器
  - 提交前必须跑什么
  - 生成文件不能直接改
- `frontend/AGENTS.md`
  - 组件约定
  - 样式方案
  - 状态管理约定
- `backend/AGENTS.md`
  - 接口错误处理
  - DTO / schema 约定
  - 数据访问边界

这种分层天然符合 Windsurf 的自动作用域机制。

## 五、`Skills`：当规则不够、工作流又太轻时，就该上技能

### 1. 官方怎么定义 Skills

`Skills` 页的定义非常明确：

- Skills 用来处理复杂、多步骤任务
- 它们可以把脚本、模板、清单、参考文档打包在一起
- Cascade 使用 `progressive disclosure`

所谓 `progressive disclosure`，官方的意思是：

- 默认只把 skill 的 `name` 和 `description` 给模型
- 只有当 skill 真被触发时，才读完整 `SKILL.md` 和资源文件

这点非常关键，因为它解释了为什么 Skills 可以做得很强，却不至于把上下文窗口撑爆。

### 2. Skills 的目录结构

官方当前支持：

- 工作区：`.windsurf/skills/<skill-name>/`
- 全局：`~/.codeium/windsurf/skills/<skill-name>/`
- 跨 agent 兼容：`.agents/skills/`、`~/.agents/skills/`
- 开启 Claude Code config reading 时，也会扫描 `.claude/skills/` 和 `~/.claude/skills/`

这说明 Windsurf 在 2026 年已经很认真地做跨生态兼容。

### 3. `SKILL.md` 最少需要什么

官方规定最基础的 frontmatter 只有两个字段：

- `name`
- `description`

例如：

```md
---
name: deploy-to-production
description: Guides the deployment process to production with safety checks
---
```

其中最关键的是 `description`，因为它直接影响模型是否会自动调用这个 skill。

### 4. Skills 的触发方式有两种

官方说明：

- 自动触发：模型根据 `description` 判断何时调用
- 手动触发：你在 Cascade 里输入 `@skill-name`

这和 Workflow 的最大区别就在这里：  
**Skill 可以被模型自动捡起来，Workflow 不会。**

### 5. Skill 最适合放什么

官方给的例子很典型：

- 部署流程
- Code review 指南
- 测试流程

我把它翻成更容易执行的判断标准就是：

如果一个任务需要的不只是“提示词”，还需要：

- 模板
- 参考脚本
- 检查清单
- 回滚说明
- 配置样板

那它就开始像一个 Skill 了。

### 6. 为什么有了 Rules 还需要 Skills

因为两者不是一个层级。

`Rules` 解决的是：

- “做事时遵守什么行为约束”

`Skills` 解决的是：

- “这类复杂事到底该按什么步骤做”

举个简单例子：

- Rule：前端一律用 `pnpm`
- Skill：如何发布前端到 staging，包括检查、打包、验证、回滚

一个是约束，一个是方法。

### 7. 当前 Skills 在最近 changelog 里有两个重要信号

官方 changelog 里值得注意的两条是：

- **2025-09-09**：Windsurf 开始形成 file-based Rules 与 Workflows 体系
- **2026-03-09**：明确新增从 `.windsurf/skills/` 目录加载 `SKILL.md`

再加上同一天还有：

- 修复某些情况下 `AGENTS.md` 被忽略的问题

这说明截至 2026-04，Windsurf 的项目定制能力仍在持续补强，而且已经进入比较可用的阶段。

## 六、`Workflows`：最适合做“我每次都要手动启动的固定流程”

### 1. 官方怎么定义 Workflows

`Workflows` 页把它定义为：

- 用 Markdown 保存的可复用流程
- 通过 `/[workflow-name]` 斜杠命令调用
- 适合部署、PR review、代码格式化等重复任务

这里最重要的关键词就是：

- **Manual only**

官方明确写着：

- Workflow 不会被 Cascade 自动调用
- 如果你希望模型自己决定是否使用某套流程，应该改做 Skill

### 2. Workflows 的本质，不是规则，而是轨迹模板

官方原话很有启发性：

- Rules 作用在 prompt level
- Workflows 作用在 trajectory level

翻译成更好理解的话：

- Rule 决定“怎么做事”
- Workflow 决定“按什么顺序一步步做”

所以它很适合那种固定顺序非常重要的任务。

### 3. Workflow 当前的存储位置

官方当前说明：

- 工作区：`.windsurf/workflows/*.md`
- 全局：`~/.codeium/windsurf/global_workflows/*.md`
- 内置：Windsurf 自带，例如 `/plan`
- 系统级（Enterprise）：操作系统特定目录

并且：

- 工作区 workflow 会随仓库提交
- 全局 workflow 只在你机器上有效
- 每个 workflow 文件上限：`12000` 字符

### 4. Workflow 的调用方式只有一种

那就是：

- `/workflow-name`

官方还特别提到：

- Workflow 里可以再调用其他 Workflow

这意味着你完全可以把大流程拆成小流程再组合。

### 5. 哪些任务最适合用 Workflow

官方示例包括：

- `/address-pr-comments`
- `/git-workflows`
- `/dependency-management`
- `/code-formatting`
- `/run-tests-and-fix`
- `/deployment`
- `/security-scan`

我会把它总结成一句话：

只要一件事是“每次都差不多按同一串步骤来做”，它就很适合 Workflow。

### 6. 为什么 Workflow 不适合取代 Skill

因为 Workflow 更像“流程脚本提示词”，而 Skill 更像“带配套资源的能力包”。

Workflow 通常只有：

- 标题
- 描述
- 步骤

Skill 除了步骤，还有：

- `SKILL.md`
- 模板文件
- 检查清单
- 回滚文档
- 脚本

所以：

- 轻量重复流程，用 Workflow
- 复杂任务方法包，用 Skill

## 七、四者之间到底怎么选：我给主人的实战判断树

如果主人现在真要在项目里落地，我建议按这个顺序判断：

### 1. 这是长期行为约束吗

如果是，优先看 `Rules` 或 `AGENTS.md`。

### 2. 这个约束是不是明显只属于某个目录

如果是，优先 `AGENTS.md`。  
如果不是，优先 `Rules`。

### 3. 这是不是一个重复执行的固定流程

如果是，优先 `Workflows`。

### 4. 这个任务是不是复杂到需要模板、脚本、清单、参考文件

如果是，优先 `Skills`。

换成更直接的话：

- 约束选 `Rules / AGENTS.md`
- 流程选 `Workflows`
- 复杂能力包选 `Skills`

## 八、如果让我给一个团队落地，我会怎么分层

这是基于 Windsurf 当前官方机制，我觉得最稳的一种落地方式。

### 1. 第一层：根目录 `AGENTS.md`

放项目公共原则：

- 技术栈
- 包管理器
- 提交前检查
- 生成文件边界

### 2. 第二层：子目录 `AGENTS.md`

放局部代码约定：

- 前端组件目录约束
- 后端接口目录约束
- 文档目录写作约束

### 3. 第三层：`.windsurf/rules/`

放需要精细触发逻辑的规则：

- 测试文件规则
- 特定脚本目录规则
- 手动激活专项规则
- model_decision 规则

### 4. 第四层：`.windsurf/workflows/`

放团队反复执行的固定流程：

- PR review
- 提测
- 发布前检查
- 修评论流程

### 5. 第五层：`.windsurf/skills/`

放真正复杂、值得长期投资的能力包：

- staging / production 部署
- 安全审查
- 数据迁移
- 故障排查

这套分层一旦做起来，Windsurf 就不再只是一个会聊天的 IDE，而是开始拥有团队自己的工程记忆。

## 九、最容易踩的坑

根据官方文档和这些机制本身，我觉得最容易踩的坑主要有几个。

### 1. 用 Memory 代替 Rule

官方明确建议：

- 想长期可靠复用的内容，写成 Rule 或 AGENTS.md

所以别把团队规范寄托在自动 Memory 上。

### 2. 把所有内容都塞进根规则

这样会导致：

- 上下文成本高
- 局部规则不够精准
- 维护越来越难

更合理的方式是：

- 全局原则放根级
- 局部约束放目录级
- 专项场景放 Rule / Skill / Workflow

### 3. 把 Workflow 写成 Skill，或者把 Skill 写成 Workflow

区分方法很简单：

- 只是一串可重复步骤：Workflow
- 还需要配套资源和自动调起：Skill

### 4. AGENTS.md 写成空话

这类内容效果最差：

- 写好代码
- 注意性能
- 保持简洁

因为这类话几乎不能给模型提供真正可执行的约束。

## 十、我的总结

截至 **2026-04-14**，Windsurf 的项目治理层已经相当完整了。

如果只用一句话概括它们的分工：

- `Rules` 管行为
- `AGENTS.md` 管目录
- `Skills` 管复杂能力
- `Workflows` 管重复流程

而真正把 Windsurf 用成团队生产力工具的关键，不是多会写 prompt，而是能不能把这些能力按层次组织起来。

如果主人后面还想继续扩这个专题，我建议下一篇可以接：

- 第五篇：Windsurf `MCP / Hooks / Terminal / Worktrees` 自动化与安全边界

## 资料来源

- Memories & Rules：https://docs.windsurf.com/windsurf/cascade/memories
- AGENTS.md：https://docs.windsurf.com/windsurf/cascade/agents-md
- Skills：https://docs.windsurf.com/windsurf/cascade/skills
- Workflows：https://docs.windsurf.com/windsurf/cascade/workflows
- Official Changelog：https://windsurf.com/changelog
