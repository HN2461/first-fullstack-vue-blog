---
title: "第 04 篇：Kiro Hooks 自动化机制（2026-07）"
slug: "ai-ai-kiro-kiro-hooks-4b92a74f"
summary: "按 Kiro IDE 1.0 讲解 Agent Hooks：v1 JSON schema、10 种当前触发器、Agent 与 Shell 两种动作、正则 matcher、阻断返回码、工作区与全局 Hook，以及安全可靠的配置方法。"
category: "Kiro"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "AI编辑器流"
  - "Kiro"
tags:
  - "Kiro"
  - "Hooks"
  - "自动化"
  - "Agent Hooks"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291d8a2b1c68f2cabee8"
originalSlug: "ai-ai-kiro-kiro-hooks-4b92a74f"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.593Z"
updatedAt: "2026-07-31T11:16:25.638Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 04 篇：Kiro Hooks 自动化机制（2026-07）

> 本篇基于 Kiro 官方 Hooks 文档和 IDE 1.0 Changelog 整理，资料核对时间：2026-07-27。IDE 1.0 已更换 Hook UI 与 JSON schema，旧版 `eventType`、`hookAction`、`filePatterns` 配置不应继续照抄。

[[toc]]

---

## Hooks 是什么

Agent Hooks 是 Kiro 的事件驱动自动化机制：IDE 侦测到指定事件后，自动发送一段 Agent Prompt，或执行一条本地 Shell Command。

它与 Steering、Permissions 的职责不同：

- **Steering** 提供持续或按条件加载的知识，回答“Agent 应遵循什么”
- **Hooks** 把事件连接到动作，回答“什么时候自动做什么”
- **Permissions** 决定某次文件、Shell、网络、MCP 或子代理操作能否执行

典型用途包括保存后 lint、任务前检查环境、工具调用审计、Agent 回合结束后的安全扫描，以及提交 Prompt 前追加约束。

---

## IDE 1.0 的 v1 JSON 格式

工作区 Hook 是 `.kiro/hooks/` 下的 JSON 文件。当前 schema 以 `version: "v1"` 开头，一个文件可以包含多个 Hook：

```json
{
  "version": "v1",
  "hooks": [
    {
      "name": "lint-on-agent-save",
      "description": "Agent 保存 TypeScript 文件后运行 lint",
      "trigger": "PostFileSave",
      "matcher": "\\.(ts|tsx)$",
      "action": {
        "type": "command",
        "command": "npm run lint"
      },
      "timeout": 30,
      "enabled": true
    }
  ]
}
```

字段含义：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | Hook 标识，也会出现在遥测或管理界面中 |
| `description` | 否 | 仅用于说明用途和边界 |
| `trigger` | 是 | 当前触发器名称，见下一节 |
| `matcher` | 否 | 正则表达式，按触发器匹配工具名或文件路径；省略时匹配全部 |
| `action` | 是 | `command` + `command`，或 `agent` + `prompt` |
| `timeout` | 否 | Shell 超时秒数，默认 60；`0` 表示不设超时；Agent 动作忽略此字段 |
| `enabled` | 否 | 默认 `true`，设为 `false` 可停用而不删除 |

这里的 `matcher` 是正则字符串，不是旧文章里常见的逗号分隔 glob。JSON 中的反斜杠还需要转义，所以匹配 `.ts` 文件要写成 `\\.ts$`。

---

## 当前 10 种触发器

### SessionStart

新会话开始时触发。适合执行轻量环境探测，或把本地状态通过 stdout 注入初始上下文。它不能阻断会话启动。

### Stop

Agent 完成一个回合后触发。适合运行编译、检查 Agent 生成的代码或执行安全审查。避免写成无条件再次驱动 Agent 的循环。

### UserPromptSubmit

用户提交 Prompt 时触发。Shell 动作可通过 `USER_PROMPT` 环境变量读取原始输入；Agent 动作在界面中称为 **Add to prompt**，会把 Hook 指令追加到用户 Prompt。

该触发器允许阻断提交，适合拦截敏感内容，但不要在日志中记录密钥、个人信息或完整源代码。

### PreToolUse

Agent 调用工具前触发，`matcher` 匹配工具名。它可以在真正执行前补充指令、审计参数或阻断危险调用。

UI 的工具分类包括：

- `read`：内置文件读取工具
- `write`：内置文件写入工具
- `shell`：命令执行工具
- `web`：内置网络工具
- `spec`：内置 Spec 工具
- `*`：全部内置及 MCP 工具
- `@builtin`、`@mcp`、`@powers`：按工具来源过滤

以 `@` 开头的来源过滤支持正则，例如 `@mcp.*sql.*` 可定位名称中包含 sql 的 MCP 工具。

### PostToolUse

工具执行后触发，过滤方式与 `PreToolUse` 相同。适合记录审计信息、在写入后格式化文件，或在工具结果之上补充 Agent 指令。它不能撤销已经发生的工具调用。

### PreTaskExec

Spec 任务开始、状态进入进行中前后触发，可用于验证依赖、检查工作区状态或准备测试环境。该触发器允许阻断任务。

### PostTaskExec

Spec 任务完成、状态更新为已完成后触发。适合运行针对性测试、更新文档或通知外部系统。通知外部服务时应通过受控脚本或 MCP 权限限制目标范围。

### PostFileCreate

Agent 创建匹配路径的文件后触发。适合补充许可证头、建立配套测试或检查新文件位置。

### PostFileSave

Agent 保存匹配路径的文件后触发。IDE 1.0.116 起，Agent 驱动的文件写入也会触发文件类 Hook。适合 lint、格式化、测试或同步本地化资源。

### PostFileDelete

Agent 删除匹配路径的文件后触发。适合检查悬空导入、维护索引或输出恢复提示。

> 旧版 Manual Trigger 已由 `inclusion: manual` 的 Steering 文件替代。需要按需执行的长指令，应放入 manual Steering，并在聊天中通过 `#文件名` 引用。

---

## 两种动作与返回码

### Agent Prompt

Agent 动作用自然语言描述任务：

```json
{
  "type": "agent",
  "prompt": "检查本回合修改的文件，报告潜在密钥泄漏和高风险权限变更，不要自动修改文件。"
}
```

它能理解上下文、调用工具和生成内容，但会启动新的 Agent loop 并消耗额度。高频文件事件不宜默认使用 Agent 动作。

### Shell Command

Shell 动作适合确定性的本地操作：

```json
{
  "type": "command",
  "command": "npm run lint"
}
```

它本地运行、速度快且不消耗 Agent 额度。当前返回码语义需要特别注意：

| 返回码 | 行为 |
| --- | --- |
| `0` | 成功；在 `SessionStart`、`UserPromptSubmit` 中 stdout 会加入上下文，其他触发器通常忽略 stdout |
| `2` | 仅在 `PreToolUse`、`UserPromptSubmit`、`PreTaskExec` 中阻断后续执行，并把 stderr 返回给 Agent |
| 其他 | 向用户显示警告，但工具或流程继续执行 |

因此，想做阻断式安全门禁的脚本必须明确以 `2` 退出；不要误以为任意非零状态都会阻断。

---

## 创建与管理

### 使用界面创建

1. 打开 Kiro 面板中的 **Agent Hooks**
2. 点击 `+`
3. 选择 **Manually create a hook** 或 **Ask Kiro to create a hook**
4. 配置事件、工具名或文件正则、动作、指令/命令
5. 审查生成结果后保存

也可从命令面板运行 `Kiro: Open Kiro Hook UI`。自然语言创建适合起步，但保存前仍应检查触发范围、命令副作用与超时。

Hooks 面板支持即时启停、编辑和删除。2026 年 7 月的 IDE 1.0.182 增加了用户级全局 Hooks，适合在所有项目中复用个人自动化；团队项目仍应把工作区 Hook 纳入版本控制并由代码评审管理。

### 文件保存后 lint

推荐使用 `PostFileSave` + Shell：

```json
{
  "version": "v1",
  "hooks": [
    {
      "name": "lint-typescript",
      "trigger": "PostFileSave",
      "matcher": "^src/.*\\.(ts|tsx)$",
      "action": {
        "type": "command",
        "command": "npm run lint"
      },
      "timeout": 60,
      "enabled": true
    }
  ]
}
```

若全量 lint 过慢，应调用支持 changed-files 或单文件参数的项目脚本，而不是改成更昂贵的 Agent 动作。

### 工具调用前阻止高风险操作

`PreToolUse` 的 Shell 脚本可以读取 Kiro 提供的调用上下文并进行判定。由于上下文字段可能随版本演进，生产规则应通过 UI 建立、在测试仓库验证，并确保拒绝分支返回 `2`。对于 `.env` 读取、删除命令或生产 MCP 写操作，优先再配置统一 Permissions 的 `deny` 规则，Hook 作为补充审计层而不是唯一边界。

---

## 可靠性与安全建议

- 每个 Hook 只做一类事，名称和说明写清触发范围与副作用
- 文件类 Hook 从窄正则开始，验证后再扩大范围
- 高频检查优先 Shell；只有需要理解上下文和生成内容时才使用 Agent Prompt
- 防止递归：Hook 修改的文件若再次命中自身，要在脚本或 matcher 中排除
- Shell 命令应使用仓库内受版本控制的脚本，避免拼接不可信 Prompt 或文件名
- 不把 token、密码或生产连接串直接写进 Hook JSON
- 对阻断 Hook 测试成功、拒绝、超时和异常输入四条路径
- 定期检查已停用、重复或过时的 Hook，避免隐藏自动化长期积累
- Hooks 不会在子代理中触发，不能用它假设覆盖所有代理执行路径

---

## 参考资料

- [Kiro Hooks 总览](https://kiro.dev/docs/hooks/)
- [Hook 触发器](https://kiro.dev/docs/hooks/types/)
- [Hook 动作与返回码](https://kiro.dev/docs/hooks/actions/)
- [Hook 管理](https://kiro.dev/docs/hooks/management/)
- [Hook 示例](https://kiro.dev/docs/hooks/examples/)
- [Hook 最佳实践](https://kiro.dev/docs/hooks/best-practices/)
- [IDE 1.0.116 更新：Agent 写入触发 Hooks](https://kiro.dev/changelog/ide/1-0-116)
- [IDE 1.0.182 更新：Global Hooks](https://kiro.dev/changelog/ide/1-0-182)

> 本文以 2026-07-27 官方资料为准。Kiro 的 Hook schema 和触发器仍在快速迭代，导入旧配置前应先与当前文档的 `version: "v1"` 格式核对。
