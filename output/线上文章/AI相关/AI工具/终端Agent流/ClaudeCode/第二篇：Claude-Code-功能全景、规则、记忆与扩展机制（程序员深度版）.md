---
title: "第二篇：Claude Code 功能全景、规则、记忆与扩展机制（程序员深度版）"
slug: "ai-agent-claudecode-claudecode-083e790a"
summary: "基于 2026-07-04 Claude Code 官方 Memory、Skills、Hooks、Plugins、MCP 与 Settings 文档复核更新，重点解释程序员最容易混淆的规则层、权限层、记忆层与扩展层，并补清 CLAUDE.md、rules、auto memory、skills、hooks、MCP、plugin 的职责边界。"
category: "ClaudeCode"
tags:
  - "Claude Code"
  - "CLAUDE.md"
  - "Memory"
  - "Skills"
  - "MCP"
  - "Plugins"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf2a"
originalSlug: "ai-agent-claudecode-claudecode-083e790a"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第二篇：Claude Code 功能全景、规则、记忆与扩展机制（程序员深度版）

> 如果第一篇解决的是“先用起来”，这篇解决的就是“别把系统配乱”。  
> 很多程序员不是不会写 prompt，而是把 `CLAUDE.md`、settings、skills、hooks、MCP、plugins 全混成了一锅，最后自己也不知道该把规则写到哪里、扩展装了为什么没被调用。

[[toc]]

---

## 先给一个总图

从程序员视角，Claude Code 的能力最好拆成 4 层：

1. 规则层：告诉 Claude 这个项目该怎么做事
2. 权限层：告诉 Claude 什么能做、什么不能做
3. 记忆层：告诉 Claude 哪些长期信息值得保留
4. 扩展层：告诉 Claude 还能接哪些额外能力

如果继续细分，大致可以对应成这样：

- `CLAUDE.md` / `.claude/rules/` / skills / subagents：偏规则层
- settings / permission modes / sandbox：偏权限层
- auto memory / `CLAUDE.local.md` / `/memory` / 会话恢复：偏记忆层
- hooks / MCP / plugins / IDE integrations：偏扩展层

这 4 层一定要分开理解。  
不然你很容易出现这种情况：

- 想写团队规范，却写进本地配置
- 想限制高风险命令，却只写了一句自然语言规则
- 装了 MCP 或 plugin，却不知道 Claude 什么时候会发现它
- 把一次性临时说明塞进长期记忆，越用越脏

---

## 1. `CLAUDE.md` 才是 Claude Code 的主规则入口

很多仓库已经有 `AGENTS.md`、`README.md`、`CONTRIBUTING.md`、内部规范文档。  
但对 Claude Code 来说，**主线规则入口仍然是 `CLAUDE.md`**。

也就是说，如果主人希望 Claude 一进仓库就优先读到项目规则，最稳的做法是把规则组织到 `CLAUDE.md`。

### `CLAUDE.md` 适合放什么

最适合放这些“长期、稳定、整个项目都成立”的规则：

- 项目用途和技术栈
- 代码风格
- 目录结构说明
- 改动前必须先做什么
- 改动后如何验证
- 哪些动作必须先确认

例如：

```md
# 项目规则

## 项目定位
- 这是一个 Vue 3 技术博客站点

## 编码规范
- 2 空格缩进
- 单引号
- 无行尾分号

## 变更要求
- 修改前先阅读相关文件
- 涉及多文件改动时先给计划

## 验证要求
- 改动 public/notes 后重新生成索引
- 涉及页面改动时至少人工验证一次
```

### 那已有 `AGENTS.md` 怎么办

你当前仓库就有很完整的 `AGENTS.md`。  
按官方当前 `memory` 文档，Claude Code 读的是 `CLAUDE.md` 系列文件，不会直接把 `AGENTS.md` 当作主规则入口。  
所以最实用的做法是：

```md
@AGENTS.md
```

把这行写在 `CLAUDE.md` 顶部，然后在下面补 Claude Code 自己需要的额外规则。

这样做有两个好处：

- 不需要复制两份大规则
- 可以在同一份共享规范基础上继续加 Claude Code 专属说明

---

## 2. `CLAUDE.local.md`、rules、project rules，到底怎么分工

这是程序员最容易混淆的一层。

### `CLAUDE.md`

面向整个仓库的共享规则。

### `CLAUDE.local.md`

更适合放“只跟你本机、你当前工作方式有关”的内容，比如：

- 本地调试习惯
- 个人临时提醒
- 不适合提交到仓库的个人偏好

它不适合放团队必须遵守的规则。

### `.claude/rules/*.md`

当项目开始出现“按目录、按模块、按任务类型区分规范”的时候，再拆成 rules 更合理。

例如：

- `10-frontend.md`
- `20-backend.md`
- `30-docs.md`

这样做的意义是把规则按关注点拆开，而不是把所有内容继续堆进一个超长的 `CLAUDE.md`。  
官方当前特别强调：普通 `CLAUDE.md` 和无路径 frontmatter 的 rules 会在启动时进入上下文；带路径范围的 rules 只在 Claude 处理匹配文件时加载，更适合大仓库减少噪音。

### 最稳的演进顺序

我更推荐主人按这个顺序演进：

1. 先只有一个 `CLAUDE.md`
2. 个人、本机、临时内容放进 `CLAUDE.local.md`，并加入 `.gitignore`
3. 规则变多后，再拆 `.claude/rules/*.md`

不要第一天就同时铺开三四套规则体系。

---

## 3. 规则层和权限层，千万别混写

这句话很重要：

- **规则是“应该怎么做”**
- **权限是“允许做到什么程度”**

比如下面这些是规则：

- 修改前先阅读相关文件
- 不要顺手重构无关模块
- 每次改动后要给验证方式

而下面这些是权限问题：

- 能不能直接修改文件
- 能不能执行某类命令
- 某个工具调用要不要确认
- 是否允许更自动化地推进

如果你只在 `CLAUDE.md` 里写一句：

```md
不要执行危险命令
```

那更像一个行为约束，不是真正的权限控制。  
Claude 可能会尽量遵守，但这不等于底层被硬性拦住。

程序员要建立这个观念：

- 规则在影响决策倾向
- 权限在影响实际可执行边界

---

## 4. Memory 不是“越多越好”，而是“越稳越值钱”

很多人第一次看到记忆，会本能地想“那我把所有经验都存进去”。  
这通常是错的。

从工程协作角度，长期信息现在要分两种看：

- 你明确写的规则：`CLAUDE.md`、`CLAUDE.local.md`、`.claude/rules/`
- Claude 自动积累的经验：auto memory

值得进入长期记忆的内容通常有这几类：

- 长期稳定的项目约定
- 团队反复强调的工作方式
- 容易反复踩的固定坑
- 与当前工作树长期绑定的结构性信息

不适合沉淀成长期记忆的内容则包括：

- 临时调试步骤
- 一次性需求背景
- 某个短期分支的特殊做法
- 很快会过时的状态信息

### 当前官方 auto memory 的关键边界

按 2026-07-04 官方文档，auto memory 默认开启，Claude 会把它认为后续有用的构建命令、调试经验、架构笔记和偏好记录到本机目录。它不是团队共享规则，也不是硬约束。

几个边界一定要记住：

- auto memory 按仓库维度沉淀，并在同一 git 仓库的 worktree 间共享
- 启动时只加载索引文件的前 200 行或 25KB，详细主题文件按需读取
- 可以用 `/memory` 查看、编辑、关闭 auto memory
- 如果想让规则对团队稳定生效，优先写 `CLAUDE.md` 或 rules，不要只靠 auto memory

### 为什么记忆会让系统越用越乱

因为一旦你把“短期信息”也沉进去，后面 Claude 在恢复上下文时就会受到脏信息影响。

所以更好的原则是：

- 稳定、长期、重复出现的信息，才值得沉淀

---

## 5. Skills 是什么，它和“命令”到底什么关系

这是你这次最关心的一块之一。  
因为你已经装了很多 skill 和插件，但不知道怎么调用。

按官方当前 `skills` 文档，Claude Code 已经把 custom commands 能力并入了 skills 体系。  
旧的 `.claude/commands/*.md` 仍然能工作，并且会像同名 skill 一样创建斜杠命令；新内容更推荐使用 `.claude/skills/<name>/SKILL.md` 目录结构，因为它更适合携带 supporting files、frontmatter、调用控制和动态上下文。

### Skill 的本质

Skill 不是“换一个更酷的 prompt”。  
它更像：

- 针对某类任务的可复用工作流模板
- 带说明文档、辅助脚本、参考文件的一组能力包

一个典型 skill 往往会包含：

- `SKILL.md`
- `references/`
- `scripts/`
- 可能还有额外的模板文件

### Skill 适合解决什么问题

它特别适合下面这些高重复任务：

- 代码 review
- 前端 UI 实现
- 浏览器验收
- 某类固定风格的文档重构
- 某类固定流程的发布前检查

### Skill 怎么被发现

按官方当前设计，Claude 会根据：

- 你的任务描述
- skill 的名称和描述
- 当前上下文

来决定是否自动使用 skill。  
但这里有个非常重要的现实：

- **装了 skill，不等于它每次都会自动命中**

这是很多人误以为“装了但没生效”的根源。

### Skill 怎么显式调用

最直接的做法通常有两种：

1. 用 `/skills` 先查看当前可发现的 skill / command
2. 如果有直接入口，使用 `/skill-name` 调用
3. 在 prompt 里明确点名 skill 的任务意图

例如你装了前端设计类 skill，直接说：

```text
请使用前端设计相关 skill，重构这个页面的信息层级、排版和视觉节奏。
先分析，再给出实施计划。
```

如果 skill 是通过命令暴露的入口，例如 `/deploy` 这类，那就直接执行相应 slash command。

官方当前还内置了一批 bundled skills，例如 `/code-review`、`/batch`、`/debug`、`/loop`、`/run`、`/verify`、`/claude-api`。它们出现在命令列表里，但本质是 prompt-based skill，不是硬编码管理命令。

### 为什么你装了很多 skill 却感觉调用不到

最常见原因是这 5 个：

1. skill 描述写得不够清楚，Claude 很难匹配
2. 你的 prompt 太泛，没给到足够明确的任务信号
3. 你期待“自动一定命中”，但当前更适合显式点名
4. skill 装在了某个作用域，但当前项目 / 会话没有读到
5. 它本质不是 skill 问题，而是你要的其实是 MCP 或 plugin

---

## 6. Hooks 是什么，它和 Skill 不是一类东西

程序员常常会把 hooks 和 skills 混为“自动化增强”。

但两者职责不同：

### Skill

偏任务模板。  
解决的是“这类事情应该怎么做”。

### Hook

偏事件触发。  
解决的是“某个时机到了，自动做一个动作”。

典型 hook 场景：

- 某类工具调用前做检查
- 某类工具调用后自动格式化或记录
- 某个用户 prompt 提交后先做预处理

主人可以把 hook 当成“插在工作流节点上的自动小脚本”。  
它适合做轻量、可预测、明确边界的动作，不适合把整套复杂业务逻辑塞进去。

---

## 7. MCP 是什么，它和 Skill、Plugin 有什么根本区别

这也是程序员特别容易搞混的点。

### MCP 的本质

MCP 不是规则，也不是提示词模板。  
它是给 Claude Code 增加外部能力入口的协议和接入方式。

最典型的 MCP 能力包括：

- 读外部文档
- 查数据库
- 调浏览器
- 调 GitHub / 搜索 / 文件系统等外部资源

### Skill 和 MCP 的区别

Skill 解决的是：

- “这件事怎么做更好”

MCP 解决的是：

- “Claude 还缺什么外部能力”

一个非常容易记住的类比是：

- skill 像工作方法包
- MCP 像外接工具接口

### Plugin 和 MCP 的区别

Plugin 更偏“打包、分发和集成管理层”。  
它可能内含 skill、规则、MCP 配置或辅助文件，但 plugin 本身不等于 MCP。

可以这么理解：

- MCP 是能力接入口
- Plugin 是分发 / 安装 / 管理容器

---

## 8. Plugin 到底解决什么问题

很多人听到 plugin，会本能地把它理解成“扩展功能总称”。  
但从实际工程维护角度，它更像：

- 把一组扩展能力打包成可安装、可启停、可管理的单元

它的价值主要体现在：

- 分发更规范
- 团队共享更方便
- 依赖和入口更容易管理
- 某些能力可以通过 marketplace 或约定结构被发现

程序员最该记住的是：

- Plugin 是组织扩展能力的方式
- 不是所有“装了个东西”的问题都该归到 plugin

你觉得“装了不会调用”的问题，常常真正发生在：

- skill 匹配层
- MCP 接入层
- 作用域 / 配置层

而不是 plugin 这一层本身。

---

## 9. 一个程序员真正够用的目录结构长什么样

如果主人现在要把 Claude Code 用得更工程化，我推荐一个最小可维护结构：

```text
project-root/
|-- CLAUDE.md
|-- .claude/
|   |-- settings.json
|   |-- rules/
|   |   |-- 10-frontend.md
|   |   |-- 20-docs.md
|   |-- skills/
|   |   |-- frontend-design/
|   |   |   |-- SKILL.md
|   |   |   |-- references/
|   |   |-- browser-qa/
|   |       |-- SKILL.md
```

为什么我推荐先只长这样：

- `CLAUDE.md` 先解决总规则
- `settings.json` 先解决边界
- `rules/` 解决分类、路径范围和大仓库规则加载
- `skills/` 只放你真正高频复用的流程

至于 hooks、plugin、复杂 MCP 编排，应该在主线稳定后再慢慢引入。

---

## 10. 什么时候该写 Skill，什么时候该写 MCP，什么时候该直接写进 `CLAUDE.md`

这部分非常值得你拿来当判断表。

### 该写进 `CLAUDE.md` 的场景

- 全项目通用规则
- 长期不变的工作方式
- 改动前后必须遵守的要求

### 该做成 Skill 的场景

- 某类任务经常重复出现
- 这类任务有固定步骤
- 你希望 Claude 以后更稳定地照这套流程执行

### 该接成 MCP 的场景

- Claude 需要访问项目外部能力
- 只靠仓库内容和内置工具不够
- 你需要真实调用浏览器、文档、数据库、搜索、远程服务

### 该上 Plugin 的场景

- 你需要把一整套扩展能力打包管理
- 希望安装、分享、启用、升级更标准化
- 团队中会多次复用同一套扩展能力集合

---

## 11. 为什么“装了很多前端 skill 和插件”却不知道怎么调

主人这句其实击中了实战里的痛点。  
我把问题拆给你看，会更清楚：

### 第一类：你装的是 skill，但你期待它像命令一样显式出现

有些 skill 的工作方式不是“装完就多一个大按钮”，而是等 Claude 根据任务描述去匹配。

解决办法：

- 先用 `/skills` 看是否被发现
- prompt 里显式点名任务类型或 skill 意图
- skill 名称和描述尽量写得具体，不要太抽象

### 第二类：你装的是 MCP，但你期待它像写作规范一样自动生效

MCP 本质上是能力入口，不是行为规范。  
它需要 Claude 判断“这次有没有必要调用这个外部能力”。

解决办法：

- 先用 `/mcp` 看服务器是否连接成功
- 明确告诉 Claude 这次需要用哪个能力
- 比如直接说“请用 Context7 查官方文档，再结合当前仓库给我方案”

### 第三类：你装的是 plugin，但你期待 Claude 一定会主动把内部所有能力都调出来

Plugin 只是容器或分发方式，不代表其中每项能力都会自动命中。

解决办法：

- 先确认 plugin 本身已正确安装
- 再确认其中的 skill / MCP / command 是否真的已注册并可见
- 最后再看 prompt 是否给到了正确触发信号

---

## 12. 程序员最值得立刻养成的 5 个系统化习惯

1. 项目规则优先写进 `CLAUDE.md`，不要散落在聊天里
2. 高频重复流程才做 skill，不要什么都 skill 化
3. 需要外部能力再接 MCP，不要为了“高级”而乱接
4. 安装了扩展后先看 `/skills`、`/mcp`、`/plugin` 是否真被发现
5. 用 `/memory` 定期审计 auto memory，不要让临时需求长期化

---

## 13. 读完这篇后，下一步最推荐看什么

如果你现在最关心的是“到底怎么配置才顺手”，下一篇建议读：

- [第四篇：Claude Code 设置、CLAUDE.md 与个性化配置（程序员深度版）](#/note/AI工具/02_终端Agent流/ClaudeCode/第四篇_ClaudeCode设置与个性化_2026-03)

如果你现在最关心的是“skills / MCP / plugin 装了以后到底怎么调用”，建议直接接：

- [第六篇：Claude Code 的 Skills、MCP、Plugin 怎么安装、调用与排错（程序员实战版）](#/note/AI工具/02_终端Agent流/ClaudeCode/第六篇_ClaudeCode的Skills_MCP_Plugin怎么安装调用与排错_2026-05)

---

## 参考资料

- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/plugins
- https://code.claude.com/docs/en/settings
