---
title: "第四篇：Kiro Hooks 自动化机制（2026-04）"
slug: "ai-ai-kiro-kiro-hooks-4b92a74f-revision-20260704"
summary: "全面介绍 Kiro 的 Hooks 自动化机制：10 种触发事件类型、两种动作类型（askAgent/runCommand）、工具类型过滤，以及通过自然语言或表单创建 Hook 的完整流程。"
category: "Kiro"
tags:
  - "Kiro"
  - "Hooks"
  - "自动化"
  - "事件驱动"
status: "draft"
cover: ""
originalId: "6a2d291d8a2b1c68f2cabee8"
originalSlug: "ai-ai-kiro-kiro-hooks-4b92a74f"
exportedAt: "2026-07-04T07:00:23.240Z"
---
# 第四篇：Kiro Hooks 自动化机制（2026-04）

[[toc]]

---

## Hooks 是什么

Hooks 是 Kiro 提供的一套事件驱动自动化机制。简单来说，你可以预先定义一组规则：当某个特定的 IDE 事件发生时，自动触发一个动作——要么让 Agent 执行一段指令，要么直接运行一条 shell 命令。

这个机制的核心价值在于"无感自动化"。传统开发流程中，很多重复性操作需要开发者手动触发，比如保存文件后手动跑 lint、提交代码前手动检查格式、任务完成后手动发通知。这些操作本身没有技术含量，却占用了大量注意力。Hooks 把这些操作从"需要记住去做"变成了"系统自动完成"，让开发者可以专注在真正需要思考的事情上。

与 Steering 不同，Steering 是向 Agent 注入持久知识（告诉 Agent"你应该知道什么"），而 Hooks 是向 IDE 注入自动化行为（告诉 IDE"当某件事发生时，你应该做什么"）。两者配合使用，可以构建出一套高度个性化的智能开发环境。

Hooks 的设计理念非常直接：每个 Hook 由三个要素组成——触发条件（什么时候）、过滤条件（针对什么）、执行动作（做什么）。掌握这三个要素，就能灵活组合出适合自己工作流的自动化规则。

---

## 10 种触发事件类型

Kiro 目前支持 10 种触发事件类型，覆盖了从用户输入、文件变更到工具调用、任务生命周期的各个阶段。下面逐一介绍每种事件的含义和典型使用场景。

### promptSubmit

当用户在 Kiro 的对话框中提交一条 prompt（按下发送）时触发。这是最早的介入点，发生在 Agent 开始处理之前。

典型用途：在每次对话开始前自动注入一段上下文提示，比如提醒 Agent 当前项目的技术栈约束，或者自动附加当前打开文件的路径信息。

### agentStop

当 Agent 完成一轮任务、停止运行时触发。这是任务结束后的第一个钩子点。

典型用途：Agent 完成代码修改后，自动触发格式化或静态检查；或者在 Agent 停止后发送一条桌面通知，告知任务已完成。

### fileEdited

当工作区内的文件内容被修改时触发。可以通过 `filePatterns` 参数限定只监听特定类型的文件。

典型用途：TypeScript 文件被修改后自动运行类型检查；Markdown 文件被修改后自动更新目录索引；配置文件被修改后自动重启相关服务。

### fileCreated

当工作区内有新文件被创建时触发。同样支持 `filePatterns` 过滤。

典型用途：新建 Vue 组件文件时自动生成对应的测试文件骨架；新建 API 路由文件时自动在路由注册表中添加占位条目。

### fileDeleted

当工作区内的文件被删除时触发。

典型用途：删除某个模块文件时，自动检查是否有其他文件仍在引用它，并给出警告；删除测试文件时，自动更新测试覆盖率报告。

### userTriggered

手动触发类型，不依赖任何自动事件，由用户主动在 Kiro 界面中点击执行。

典型用途：一键执行一套复杂的初始化脚本；手动触发项目健康检查；在需要时按需运行某个耗时的分析任务，而不是每次文件变更都自动跑。

### preToolUse

在 Agent 调用某个工具之前触发。可以通过 `toolTypes` 参数指定只在调用特定类型工具前触发。

典型用途：在 Agent 执行写操作之前，自动让另一个 Agent 审查这次写操作是否安全；在 Agent 运行 shell 命令之前，记录命令日志。

### postToolUse

在 Agent 调用某个工具之后触发。同样支持 `toolTypes` 过滤。

典型用途：Agent 完成一次文件写入后，自动运行 lint 检查写入的文件；Agent 执行完 shell 命令后，自动解析输出并生成摘要。

### preTaskExecution

在 Spec 任务开始执行之前触发。这个事件与 Kiro 的 Specs 系统深度集成。

典型用途：任务开始前自动备份当前工作区状态；在执行高风险任务前，自动提示用户确认；任务开始前自动拉取最新的远程代码。

### postTaskExecution

在 Spec 任务执行完成之后触发。是任务生命周期中最后一个钩子点。

典型用途：任务完成后自动运行完整测试套件；任务完成后向团队频道发送进度通知；任务完成后自动生成变更日志条目。

---

## 两种动作类型

每个 Hook 的执行动作只有两种选择：`askAgent` 和 `runCommand`。两者的适用场景有明显区别。

### askAgent

让 Kiro 的 Agent 执行一段自然语言指令。你在 `outputPrompt` 字段中写入希望 Agent 做的事情，Agent 会在事件触发时自动执行这段指令。

`askAgent` 的优势在于灵活性。你不需要知道具体的命令语法，只需要用自然语言描述目标，Agent 会自行判断如何完成。比如"检查刚才修改的文件是否有潜在的安全问题"、"为新创建的函数生成单元测试"，这类需要理解上下文、做出判断的任务，非常适合用 `askAgent`。

需要注意的是，`askAgent` 会消耗 Agent 的处理时间，不适合用在需要即时响应的高频事件上（比如每次按键都触发）。

### runCommand

直接执行一条 shell 命令，不经过 Agent。你在 `command` 字段中写入要执行的命令，Kiro 会在事件触发时直接在终端中运行它。

`runCommand` 的优势在于速度和确定性。对于已知的、固定的操作，比如运行 `npm run lint`、执行 `git status`、调用某个脚本，直接用 `runCommand` 比经过 Agent 更快、更可靠。

两种动作类型可以根据场景灵活选择：需要智能判断时用 `askAgent`，需要快速执行固定操作时用 `runCommand`。

---

## 工具类型过滤

对于 `preToolUse` 和 `postToolUse` 这两种事件，Kiro 提供了 `toolTypes` 字段来精确控制 Hook 的触发范围。这个字段决定了"只在 Agent 调用哪类工具时才触发这个 Hook"。

Kiro 内置了以下几种工具类型分类：

- `read`：读取文件、搜索代码等只读操作
- `write`：写入文件、创建文件、删除文件等写操作
- `shell`：执行 shell 命令
- `web`：网络请求、网页抓取等网络操作
- `spec`：与 Specs 系统相关的操作
- `*`：匹配所有工具类型

除了这些内置分类，`toolTypes` 还支持正则表达式模式，用于匹配 MCP 工具的名称。比如 `.*sql.*` 可以匹配所有名称中包含 `sql` 的 MCP 工具，实现对特定数据库操作的精细化监控。

合理使用 `toolTypes` 过滤可以避免 Hook 被过度触发，只在真正需要的时候介入，保持开发流程的流畅性。

---

## Hook 文件格式

每个 Hook 以一个 JSON 文件的形式存储在 `.kiro/hooks/` 目录下。下面是一个包含所有字段的完整示例，并附有详细注释说明每个字段的含义和取值范围。

```json
{
  "id": "lint-on-save",
  "name": "保存后自动 Lint",
  "description": "当 TypeScript 或 JavaScript 文件被编辑后，自动运行 ESLint 检查",
  "eventType": "fileEdited",
  "hookAction": "runCommand",
  "filePatterns": "**/*.ts,**/*.js",
  "command": "npm run lint",
  "outputPrompt": null,
  "toolTypes": null,
  "timeout": 60,
  "why": "保持代码风格一致，及时发现语法问题"
}
```

各字段说明：

- `id`：Hook 的唯一标识符，建议使用短横线连接的小写英文，如 `lint-on-save`
- `name`：Hook 的显示名称，会在 Kiro 界面中展示，建议简洁明了
- `description`：对这个 Hook 功能的详细描述，帮助团队成员理解其用途
- `eventType`：触发事件类型，取值为上文介绍的 10 种事件之一
- `hookAction`：动作类型，取值为 `askAgent` 或 `runCommand`
- `filePatterns`：文件匹配模式，逗号分隔的 glob 表达式，仅对文件类事件（`fileEdited`、`fileCreated`、`fileDeleted`）有效
- `command`：当 `hookAction` 为 `runCommand` 时必填，填写要执行的 shell 命令
- `outputPrompt`：当 `hookAction` 为 `askAgent` 时必填，填写给 Agent 的自然语言指令
- `toolTypes`：工具类型过滤，仅对 `preToolUse` 和 `postToolUse` 事件有效
- `timeout`：命令超时时间（秒），仅对 `runCommand` 有效，默认 60 秒，设为 0 表示不限时
- `why`：创建这个 Hook 的原因说明，纯注释性字段，不影响执行逻辑

---

## 创建 Hook 的两种方式

Kiro 提供了两种创建 Hook 的方式，分别适合不同的使用习惯。

### 方式一：自然语言描述

在 Kiro 的对话框中，用自然语言描述你想要的自动化行为，Kiro 会自动理解你的意图并生成对应的 Hook 配置文件。

例如，你可以直接说："每次我编辑 TypeScript 文件后，自动运行 ESLint 检查"，Kiro 会解析这句话，识别出事件类型（`fileEdited`）、文件过滤（`**/*.ts`）、动作类型（`runCommand`）和命令（`npm run lint`），然后生成完整的 JSON 配置并保存到 `.kiro/hooks/` 目录。

这种方式的优点是门槛低、速度快，不需要记忆 JSON 字段名称和取值规则，适合快速创建常见的自动化场景。

### 方式二：手动编辑表单或 JSON

在 Kiro 的 Hooks 管理面板中，可以通过图形化表单逐字段填写 Hook 配置。每个字段都有对应的输入控件和说明文字，填写完成后 Kiro 会自动生成 JSON 文件。

对于有经验的用户，也可以直接在 `.kiro/hooks/` 目录下手动创建或编辑 JSON 文件。这种方式提供了最大的灵活性，适合需要精细控制每个字段、或者批量创建多个 Hook 的场景。

两种方式创建的 Hook 在功能上完全等价，可以根据个人习惯自由选择。

---

## Hook 存储位置

所有 Hook 配置文件统一存储在工作区根目录下的 `.kiro/hooks/` 目录中。每个 Hook 对应一个独立的 JSON 文件，文件名通常与 Hook 的 `id` 字段保持一致。

```
.kiro/
└── hooks/
    ├── lint-on-save.json
    ├── test-after-task.json
    ├── notify-on-agent-stop.json
    └── security-check-before-write.json
```

由于 Hook 文件存储在工作区目录下，它们会随代码一起被 Git 追踪和版本控制。这意味着：

- 团队成员克隆仓库后，会自动获得相同的 Hook 配置，保证团队自动化行为的一致性
- Hook 的变更历史可以通过 Git 追溯，方便排查问题
- 可以针对不同分支配置不同的 Hook，满足不同开发阶段的需求

如果某些 Hook 只适合个人使用（比如个人偏好的通知方式），可以将对应的 JSON 文件添加到 `.gitignore` 中，避免影响其他团队成员。

---

## 实战示例：文件保存后 lint

这是最常见的 Hook 使用场景之一。目标是：每当 JavaScript 或 TypeScript 文件被编辑后，自动运行 ESLint，及时发现代码风格问题和潜在错误。

```json
{
  "id": "eslint-on-file-edit",
  "name": "文件编辑后自动 ESLint",
  "description": "监听 JS/TS 文件的编辑事件，触发后自动运行 ESLint 检查整个项目",
  "eventType": "fileEdited",
  "hookAction": "runCommand",
  "filePatterns": "**/*.ts,**/*.tsx,**/*.js,**/*.jsx",
  "command": "npm run lint",
  "outputPrompt": null,
  "toolTypes": null,
  "timeout": 120,
  "why": "在开发过程中持续保持代码质量，避免积累大量 lint 错误"
}
```

这个 Hook 的工作流程如下：

1. 开发者在编辑器中修改了一个 `.ts` 文件并保存
2. Kiro 检测到 `fileEdited` 事件，且文件路径匹配 `**/*.ts` 模式
3. Kiro 在终端中执行 `npm run lint`
4. lint 结果显示在终端输出中，开发者可以立即看到问题

如果你希望只检查被修改的那个文件而不是整个项目，可以将 `hookAction` 改为 `askAgent`，并在 `outputPrompt` 中写："对刚才被编辑的文件运行 ESLint 检查，并简要报告发现的问题"。这样 Agent 会自动识别被修改的文件路径，只针对该文件执行检查。

---

## 实战示例：任务完成后通知

这个示例展示如何在 Spec 任务执行完成后，让 Agent 自动生成一份任务完成摘要，并更新项目的变更日志。

```json
{
  "id": "notify-after-task",
  "name": "任务完成后生成摘要",
  "description": "Spec 任务执行完成后，自动让 Agent 生成变更摘要并追加到 CHANGELOG",
  "eventType": "postTaskExecution",
  "hookAction": "askAgent",
  "filePatterns": null,
  "command": null,
  "outputPrompt": "刚才的 Spec 任务已经执行完成。请检查本次任务涉及的文件变更，用 2-3 句话总结本次任务完成了什么功能，然后将这条摘要以 Markdown 列表项的格式追加到项目根目录的 CHANGELOG.md 文件末尾，日期使用今天的日期。",
  "toolTypes": null,
  "timeout": 0,
  "why": "自动维护变更日志，减少手动记录的负担"
}
```

这个 Hook 的工作流程如下：

1. 开发者在 Kiro 中执行了一个 Spec 任务，任务执行完毕
2. Kiro 检测到 `postTaskExecution` 事件
3. Kiro 将 `outputPrompt` 中的指令发送给 Agent
4. Agent 分析本次任务的文件变更，生成摘要文字
5. Agent 将摘要追加到 `CHANGELOG.md` 文件

这种模式特别适合需要维护详细变更记录的项目。结合 Kiro 的 Specs 系统，每个任务完成后都会自动留下可追溯的记录，大幅降低文档维护的成本。

---

## 注意事项与常见问题

### Hook 触发频率控制

对于 `fileEdited` 这类高频事件，要注意避免 Hook 被过度触发导致性能问题。建议：

- 使用精确的 `filePatterns` 缩小触发范围，避免监听所有文件
- 对于耗时较长的命令（如完整的测试套件），考虑改用 `agentStop` 或 `postTaskExecution` 等低频事件触发
- 如果命令本身有防抖机制（如 lint 工具的缓存），可以适当放宽文件匹配范围

### askAgent 与 runCommand 的选择

一个常见的误区是把所有操作都用 `askAgent` 来做。实际上，对于固定的、确定性的操作，`runCommand` 更合适，因为它更快、更可靠、不消耗 AI 处理资源。只有当操作需要理解上下文、做出判断、或者生成内容时，才应该使用 `askAgent`。

### 文件路径匹配规则

`filePatterns` 使用标准的 glob 语法，多个模式之间用逗号分隔（不加空格）。常见的写法：

- `**/*.ts`：匹配所有目录下的 TypeScript 文件
- `src/**/*.vue`：只匹配 src 目录下的 Vue 文件
- `**/*.ts,**/*.js`：同时匹配 TypeScript 和 JavaScript 文件

注意 `filePatterns` 只对文件类事件（`fileEdited`、`fileCreated`、`fileDeleted`）有效，对其他事件类型设置此字段不会产生任何效果。

### Hook 文件的 JSON 格式

Hook 文件必须是合法的 JSON 格式。常见的格式错误包括：

- 字段值使用了单引号而不是双引号
- 最后一个字段后面多了逗号（JSON 不允许尾随逗号）
- `null` 值写成了空字符串 `""`

建议使用编辑器的 JSON 语法检查功能，或者在创建 Hook 后通过 Kiro 界面验证配置是否正确加载。

### 团队共享 Hook 的注意事项

将 Hook 文件提交到 Git 仓库时，要确保 Hook 中引用的命令在所有团队成员的环境中都可用。比如，如果 Hook 中使用了某个全局安装的工具，需要在项目文档中说明安装要求，或者改用 `npx` 调用本地依赖中的工具，避免因环境差异导致 Hook 执行失败。

### timeout 字段的设置

`timeout` 字段只对 `runCommand` 类型的 Hook 有效，单位是秒。对于可能耗时较长的命令（如完整的测试套件、构建任务），建议适当增大超时时间或设为 0（不限时）。默认值为 60 秒，超时后命令会被强制终止。

---

## 参考资料

- [Kiro 官方文档 - Hooks](https://kiro.dev/docs/hooks/)
- [Kiro 官网](https://kiro.dev)
- [Kiro 文档首页](https://kiro.dev/docs/)

> 本篇内容基于 Kiro 官方文档（资料快照时间：2026-04），如有更新请以 [kiro.dev](https://kiro.dev) 官方最新文档为准。
