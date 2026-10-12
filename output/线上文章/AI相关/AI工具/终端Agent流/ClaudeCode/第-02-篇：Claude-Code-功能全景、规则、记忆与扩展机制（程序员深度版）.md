---
title: "第 02 篇：Claude Code 功能全景、规则、记忆与扩展机制（程序员深度版）"
slug: "ai-agent-claudecode-claudecode-083e790a"
summary: "按 2026-10-12 Claude Code 2.1.296 官方 Memory、Skills、Hooks、MCP、Plugins、Sub-agents、Agent Teams 与 Workflows 文档更新，重新厘清 CLAUDE.md、AGENTS.md、rules、auto memory、权限、扩展和上下文成本的边界。"
category: "ClaudeCode"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "ClaudeCode"
tags:
  - "Claude Code"
  - "CLAUDE.md"
  - "AGENTS.md"
  - "Memory"
  - "Skills"
  - "MCP"
  - "Plugins"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf2a"
originalSlug: "ai-agent-claudecode-claudecode-083e790a"
originalStatus: "published"
publishedAt: "2026-05-30T08:58:26.835Z"
updatedAt: "2026-10-12T21:50:00.000Z"
exportedAt: "2026-09-29T13:16:41.461Z"
---
# 第 02 篇：Claude Code 功能全景、规则、记忆与扩展机制（程序员深度版）

> Claude Code 的难点不是“功能少”，而是规则、权限、记忆、工具、工作流和界面扩展同时存在。本文按当前官方文档把它们拆开，避免把 `CLAUDE.md` 当成权限文件、把 Skill 当成 MCP、把 Plugin 当成单个命令，也避免为了一次任务把所有能力都塞进上下文。

[[toc]]

---

## 先给一个总图：六层能力，不要混用

| 层 | 主要载体 | 解决的问题 | 是否自动发生 |
| --- | --- | --- | --- |
| 项目规则 | `CLAUDE.md`、`AGENTS.md`、`.claude/rules/` | Claude 每次进入项目都要知道什么 | 规则文件按作用域加载 |
| 记忆 | auto memory、`/memory` | Claude 从纠正和长期工作中学到什么 | auto memory 可开关 |
| 权限 | `settings.json`、permission mode、sandbox、hooks | 哪些动作可以运行、何时询问 | 规则和模式共同决定 |
| 知识/工作流 | Skills、bundled skills、Workflows | 复用说明、模板、可调用流程 | 描述会被发现，正文按需加载 |
| 外部工具 | MCP | 访问数据库、浏览器、API 等外部服务 | 工具可延迟加载 |
| 打包与编排 | Plugins、subagents、agent teams、dynamic workflows | 分发能力、隔离上下文、并行协作 | 由用户、Claude 或脚本触发 |

Claude Code 还会通过 language server、Artifacts、Remote Control、IDE 集成等方式扩展体验。这些能力解决的是导航、展示或会话入口问题，不能代替上述六层的职责。

---

## 1. `CLAUDE.md`、`AGENTS.md` 与 `.claude/rules/`

### 1.1 `CLAUDE.md` 适合写“每次都要遵守”的事实和规则

适合写：

- 项目的启动、构建、测试、格式化命令。
- 目录职责、关键数据流、API 约定。
- 编码、命名、提交、发布和安全边界。
- Claude 容易重复犯的错误，或者新成员必须知道的上下文。

不适合写：一次性任务的完整过程、密钥、长篇 API 参考、只影响一个目录的细节。

官方建议单个 `CLAUDE.md` 尽量控制在 200 行以内；长内容拆到路径规则、Skill 或参考文件。`@path/to/file` 可以导入额外文件，但导入文件仍会在启动时消耗上下文，不会因为拆文件就变成零成本。

一个够用的项目文件：

```markdown
# 项目说明

## 常用命令
- 安装：`npm ci`
- 开发：`npm run dev`
- 测试：`npm test`
- 构建：`npm run build`

## 变更边界
- 先阅读相关模块和现有测试，再修改文件。
- 修改后展示 `git diff --stat` 并运行与改动相关的验证。
- 不读取或提交 `.env`、凭据和运行时上传目录。
```

### 1.2 `AGENTS.md` 的当前支持边界

Claude Code 现在支持读取仓库中的 `AGENTS.md`。从 `2.1.277` 起可用，但旧版本或禁用读取该内置插件的会话可能不支持。加载规则是：

- 如果工作目录或其父目录存在 `CLAUDE.md`、`.claude/CLAUDE.md` 或 `CLAUDE.local.md`，Claude 默认读取这些 `CLAUDE.md`，而不是同目录的 `AGENTS.md`。
- `~/.claude/CLAUDE.md`、组织托管的 `CLAUDE.md` 和 `.claude/rules/` 不会触发这条替代规则。
- 想同时加载两种文件，可在 Plugin 配置中选择 `claude-md-and-agents-md`：

```json
{
  "pluginConfigs": {
    "cc-plugin-agents-md@builtin": {
      "options": {
        "instructionFiles": "claude-md-and-agents-md"
      }
    }
  }
}
```

- Windows 团队优先使用 `@AGENTS.md` 导入，而不是依赖符号链接；Windows 没有开发者模式或 Git symlink 设置时，链接可能被检出成普通文本文件。

仓库已有 `AGENTS.md` 时，不需要再用 SessionStart hook 强行打印它，也不建议写一句“请自行阅读 AGENTS.md”来替代真实加载。

### 1.3 `.claude/rules/` 适合按路径加载的规则

```text
.claude/
├── CLAUDE.md
└── rules/
    ├── testing.md
    ├── security.md
    └── frontend.md
```

规则文件可以用 front matter 限定路径：

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "tests/**/*.test.ts"
---

所有 API 入口都要做输入校验，并补充对应测试。
```

规则会随着 Claude 打开匹配目录或文件而加载。它比把所有前端、后端、部署要求写进根 `CLAUDE.md` 更省上下文，也更容易保持局部一致。

### 1.4 `CLAUDE.local.md` 与个人规则

`CLAUDE.local.md` 适合本机、本项目的个人偏好；`~/.claude/CLAUDE.md` 与 `~/.claude/rules/` 适合跨项目偏好。个人文件不要提交到仓库。项目共享规则放 `.claude/CLAUDE.md` 或 `.claude/settings.json`，提交前要确认没有个人路径和凭据。

---

## 2. Memory：规则是你写的，auto memory 是 Claude 记的

### 2.1 二者职责不同

| 项目 | `CLAUDE.md` / rules | auto memory |
| --- | --- | --- |
| 谁写 | 你、团队或管理员 | Claude 根据长期工作自动记录 |
| 内容 | 明确指令、约束和事实 | 纠正、偏好、项目进展和参考位置 |
| 稳定性 | 应该可审查、可版本化 | 需要定期审计和删除过时条目 |
| 作用域 | 项目、用户、组织、路径 | user / feedback / project / reference 等主题 |

auto memory 通常位于：

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md
├── user_role.md
├── feedback_testing.md
└── ...
```

当前版本只会在会话启动时加载 `MEMORY.md` 索引；索引接近约 200 行或 25 KB 时应把细节移到主题文件，主题文件按需读取。这个限制只针对 `MEMORY.md`，`CLAUDE.md` 另有文件大小上限，短而具体的规则仍然更容易被遵守。

可以关闭或改目录：

```json
{
  "autoMemoryEnabled": false,
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```

用 `/memory` 查看和编辑记忆，用 `/context` 检查哪些规则和记忆真的进入了当前上下文。`/compact` 会总结对话，但不会把长期规则自动变成正确的项目文档；重要约束应保存在可审查的规则文件中。

### 2.2 记忆排障顺序

1. `/context` 看缺少的是根文件、嵌套文件、规则还是 memory。
2. 检查是否有同名但互相矛盾的 `CLAUDE.md`、`AGENTS.md` 和 rule。
3. 检查 auto memory 是否记录了旧事实；通过 `/memory` 删除或改写。
4. 如果只是某个目录的问题，先让 Claude 打开该目录下文件，触发按需规则加载。
5. 如果规则长到模型经常忽略，拆到路径规则或 Skill，而不是继续添加强调语句。

---

## 3. Skills：可复用知识、提示和工作流

Skill 的本质是带描述和可选 front matter 的 Markdown 指令；它可以是知识参考、可调用命令，也可以在隔离的 subagent 上运行。新工作优先使用 `.claude/skills/<name>/SKILL.md`，旧的 `.claude/commands/<name>.md` 仍兼容，但不支持 Skill 的全部支持文件能力。

最小 Skill：

```text
.claude/skills/summarize-changes/SKILL.md
```

```markdown
---
name: summarize-changes
description: 总结当前未提交改动，并指出风险、遗漏的测试和可能的敏感文件。
---

先运行 `git diff HEAD`，再用 2～3 条要点总结变更，最后列出风险和待验证项。
```

常用 front matter：

```yaml
---
name: deploy
description: 按发布清单构建、验证并发布应用
argument-hint: <environment>
disable-model-invocation: true
user-invocable: true
allowed-tools: Read Grep Bash(npm run *)
context: fork
agent: Explore
model: sonnet
effort: high
---
```

需要知道的行为：

- `disable-model-invocation: true`：Claude 不会自行触发，只能用户显式调用，适合部署、提交、发消息等副作用流程。
- `user-invocable: false`：Skill 只作为 Claude 的背景知识，不出现在用户命令列表中。
- `allowed-tools`：预先给出工具范围，仍受组织托管规则约束。
- `context: fork`：在隔离上下文中运行；适合研究结果只需要摘要回传的任务。
- `$ARGUMENTS`、`$0`、`${CLAUDE_SESSION_ID}`、`${CLAUDE_SKILL_DIR}` 等替换变量应按官方 Skill 文档写法使用。
- `!` 命令注入可把 shell 输出放入 Skill 上下文；不要在 Skill 中打印 Key、Cookie 或完整环境变量。
- `disableSkillShellExecution` 可以在需要时阻止 Skill 的 shell 注入。
- `skillOverrides` 可以把个人/项目 Skill 设为 `off` 或 `name-only`；插件 Skill 不由该键覆盖。

官方 bundled skill 现在包括 `/doctor`、`/run`、`/verify`、`/simplify`、`/code-review`、`/deep-research`、`/batch`、`/workflow-authoring` 等，但是否出现取决于版本、Provider、账号和组织策略。用 `/skills` 查看本机会加载什么，用 `/skill-doctor` 观察 Skill 的上下文成本和使用情况。

---

## 4. Hooks：生命周期自动化，不是提示词

Hook 在 Claude Code 生命周期事件发生时运行命令、HTTP 请求、MCP 工具、prompt 或 subagent。常见事件包括 `SessionStart`、`UserPromptSubmit`、`PreToolUse`、`PermissionRequest`、`PostToolUse`、`SubagentStart`、`SubagentStop`、`Stop`、`PreCompact`、`PostCompact`、`Notification`、`SessionEnd` 等。

示例：每次编辑后运行格式检查；核心动作失败时阻断：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint -- --fix",
            "timeout": 120000,
            "onFailure": "block"
          }
        ]
      }
    ]
  }
}
```

`onFailure: "block"` 是当前新行为之一：command/HTTP hook 启动失败、超时或返回意外退出码时可以阻止动作继续。Hook 与 Skill 的关键差异：Hook 是事件触发，匹配后保证运行；Skill 是模型选择加载，适合需要推理的流程。Hook 的输出会进入上下文，所以要控制输出长度。

安全建议：

- `PreToolUse` 只允许明确的命令和路径，不要用宽泛正则批准任意 shell。
- HTTP hook 用 `allowedHttpHookUrls` 和 `httpHookAllowedEnvVars` 限制目标与可发送的环境变量。
- 共享 Hook 放项目设置并审查脚本；个人通知、桌面集成放本地设置。
- 用 `/hooks` 查看实际生效的 hook，而不是只看某一个 `settings.json`。

---

## 5. MCP：连接外部工具和数据

MCP 是工具/资源/提示的协议层。它让 Claude Code 访问浏览器、数据库、Issue、内部 API 等外部系统；它不负责保存项目规则，也不等价于 Skill。

### 5.1 作用域与文件

| 作用域 | 文件/来源 | 共享范围 |
| --- | --- | --- |
| local | `~/.claude.json` | 当前用户、当前项目 |
| project | 项目根 `.mcp.json` | 随版本控制共享给团队 |
| plugin | Plugin 的 manifest | 随插件分发 |
| managed | 组织托管 MCP | 由组织策略决定 |
| CLI | `--mcp-config` | 当前启动会话 |

最小 `.mcp.json`：

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.example.com/mcp"
    },
    "local-tools": {
      "type": "stdio",
      "command": "node",
      "args": ["./tools/mcp-server.mjs"],
      "env": {
        "PROJECT_ROOT": "${CLAUDE_PROJECT_DIR}"
      }
    }
  }
}
```

`stdio`、`http`、`sse` 等类型和认证字段以当前 MCP 页面为准；不要把本机绝对路径和凭据提交进共享 `.mcp.json`。

### 5.2 工具延迟加载和排障

现代 Claude Code 默认会按需加载 MCP 工具 schema，以减少上下文占用；`ENABLE_TOOL_SEARCH`、`alwaysLoad` 以及 Provider 能力会影响行为。`/mcp` 查看连接、认证、工具数量和错误；`/mcp reconnect <server>` 或 `/mcp reconnect all` 重试连接。

最小排障链：

```text
/mcp → claude --debug=mcp → 检查服务日志 → 单独调用一个工具 → 再检查权限/网络/认证
```

MCP prompt 可以作为 `/server:prompt` 形式的斜杠命令出现；它是服务端提供的提示，不要把它和本地 Skill 混为一谈。

---

## 6. Plugin：把能力打包分发

Plugin 可以同时包含 Skills、commands、agents、hooks、MCP server、LSP、marketplace 元数据等。安装一个插件不等于每个内部能力都自动执行；要看插件是否启用、组件是否加载、当前命令是否可用。

常用命令：

```text
/plugin                         打开插件面板
/plugin list                    查看已安装插件
/plugin install name@market    安装插件
/plugin enable name@market     启用插件
/plugin disable name@market    禁用插件
/plugin update name@market     更新插件
/plugin configure name@market  配置插件用户选项
/plugin errors                 查看加载错误
/reload-plugins                热加载已启用插件
```

CLI 方式：

```bash
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin install skill-creator@claude-plugins-official
claude plugin list --json
claude --plugin-dir ./my-plugin
claude --plugin-url https://example.com/plugin.zip
```

`/reload-plugins` 如果会改变 MCP 工具并使 prompt cache 失效，当前版本会提示；必要时使用 `/reload-plugins --force`。共享插件要固定 marketplace 来源、检查权限、验证 hook 和 MCP，不要只看插件名称。

---

## 7. Subagent、Agent Teams 与 Dynamic Workflows

### 7.1 Subagent

Subagent 拥有独立上下文，返回摘要，适合研究、代码审查、局部实现和不希望污染主对话的任务。项目级定义位于 `.claude/agents/`，用户级定义位于 `~/.claude/agents/`，也可以通过 `--agents` 或 `/agents` 管理。

```markdown
---
name: security-reviewer
description: 审查当前 diff 中的认证、授权、注入和敏感数据风险
tools: Read, Grep, Glob
model: sonnet
effort: high
memory: project
---

只读审查当前分支改动，按严重性给出文件、行号、证据和修复建议。
```

`memory: user|project|local|none` 让 subagent 跨会话保留特定范围的学习；需要先启用 auto memory。`SubagentStart`、`SubagentStop` hook 可针对 agent 名称做初始化和清理。

### 7.2 Agent Teams

Agent team 是一个 lead session 管理多个独立 teammate 的协作模式，teammate 可以互相发送消息、领取任务、共享任务清单。默认在进程内显示；`tmux` 和 iTerm2 可使用分屏，但 Windows Terminal、VS Code 集成终端不支持分屏模式。团队需要协调成本，只有任务能清晰拆成相互独立的工作单元时才值得启用。

### 7.3 Dynamic Workflows

Workflow 是由脚本协调多个 subagent 的可复用编排，适合 5～30 个独立单元的大型审计、迁移、批量修复或多源研究。当前 bundled workflow 包括 `/deep-research`；`/batch` 会先拆解并让你批准计划，再在隔离 worktree 中并行实施。Workflow 自身不直接读写文件，实际工作由 agent 完成。

判断：

| 需求 | 选择 |
| --- | --- |
| 一次研究、结果回主会话 | Subagent |
| 多人式协作、需要互发消息 | Agent Team |
| 大量重复单元、要暂停/恢复和复用脚本 | Dynamic Workflow |
| 规则和资料长期复用 | Skill |

---

## 8. 上下文成本：功能越多不等于效果越好

| 能力 | 何时进入上下文 | 成本控制 |
| --- | --- | --- |
| `CLAUDE.md` | 会话启动 | 写短、具体、无重复 |
| path-scoped rules | 访问匹配文件时 | 按目录拆分 |
| Skill | 描述随会话提供，正文使用时加载 | 用描述筛选，长资料放 supporting files |
| MCP | 工具名常驻，schema 可延迟加载 | 关闭不用的 server、启用 tool search |
| Subagent | 独立上下文 | 只回传摘要 |
| Hook | 事件触发 | 控制输出，不要把日志全塞回对话 |
| Workflow | 多个 agent 的独立上下文 | 限制并发和单元大小 |

`/context`、`/skill-doctor`、`/doctor` 是当前排查上下文和扩展成本的三个入口。先减少重复规则和不使用的 MCP/Skill，再考虑换更大上下文模型。

---

## 9. 一份可长期维护的目录结构

```text
project/
├── CLAUDE.md
├── AGENTS.md
├── .mcp.json
└── .claude/
    ├── CLAUDE.md
    ├── settings.json
    ├── settings.local.json
    ├── rules/
    │   ├── frontend.md
    │   └── security.md
    ├── skills/
    │   ├── verify/SKILL.md
    │   └── release/SKILL.md
    ├── agents/
    │   └── security-reviewer.md
    └── commands/
        └── legacy-command.md
```

职责边界：

- `CLAUDE.md/AGENTS.md`：项目规则和事实。
- `rules`：按路径加载的局部规则。
- `settings.json`：权限、Hook、插件、环境变量和 UI 行为。
- `.mcp.json`：共享 MCP 连接定义。
- `skills`：按需加载的知识和工作流。
- `agents`：隔离上下文的专用执行者。
- `commands`：仍可用的旧式 Skill 文件。

---

## 10. 什么时候该用哪一种能力

- **写进 `CLAUDE.md`**：所有任务都要遵守的短规则，例如“使用 pnpm”“提交前运行测试”。
- **写进 `.claude/rules/`**：只适用于 `src/api` 或测试目录的规则。
- **做成 Skill**：需要用户反复调用的流程、长参考资料、提示模板。
- **接 MCP**：必须访问外部系统或执行外部动作。
- **做成 Hook**：每次生命周期事件都要自动触发，且不应依赖模型是否想起它。
- **定义 Subagent**：研究、审查或实现任务需要独立上下文和专门工具。
- **定义 Workflow/Agent Team**：任务能拆成多个独立单元，并且并行收益超过协调成本。
- **打成 Plugin**：要在多个项目或团队中分发一组能力。

---

## 11. 装了扩展却“不会用”的排查表

| 现象 | 先查什么 | 常见原因 |
| --- | --- | --- |
| `/skills` 没看到 | `/skills`、`/doctor` | Skill 描述不合法、作用域未加载、被 `skillOverrides` 隐藏 |
| Skill 出现但 Claude 不主动用 | front matter | `disable-model-invocation: true` 或描述没有说明触发场景 |
| MCP 显示 connected 但无工具 | `/mcp`、debug 日志 | 工具延迟加载、server 没注册工具、权限策略阻止 |
| Plugin 安装成功但命令不见 | `/plugin`、`/reload-plugins` | 插件未启用、命令有命名空间、组件加载失败 |
| AGENTS.md 没加载 | `/context`、版本、instructionFiles | 被 CLAUDE.md 替代、版本低于 2.1.277、插件被禁用 |
| 规则修改后像没生效 | settings precedence | 更高优先级文件、缓存、当前会话尚未重启 |

---

## 12. 参考资料

本文核验日期：2026-10-12；版本快照：Claude Code `2.1.296`。

- 官方功能总览：https://code.claude.com/docs/en/features-overview
- Memory 与规则：https://code.claude.com/docs/en/memory
- Skills：https://code.claude.com/docs/en/skills
- Hooks：https://code.claude.com/docs/en/hooks
- MCP：https://code.claude.com/docs/en/mcp
- Plugins：https://code.claude.com/docs/en/plugins/overview
- Plugin CLI：https://code.claude.com/docs/en/plugins/cli-reference
- Sub-agents：https://code.claude.com/docs/en/sub-agents
- Agent Teams：https://code.claude.com/docs/en/agent-teams
- Dynamic Workflows：https://code.claude.com/docs/en/workflows
- Anthropic Claude Code 仓库：https://github.com/anthropics/claude-code
- MCP 协议资料：https://modelcontextprotocol.io/
- CC Switch（第三方配置管理工具）：https://github.com/farion1231/cc-switch

第三方工具只能帮助切换配置或接入服务，不能替代官方权限、设置优先级和版本行为；使用前应阅读其源码、发布说明和本地写入范围。
