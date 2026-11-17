---
title: "第 02 篇：Claude Code 功能全景、规则、记忆与扩展机制（程序员深度版）"
slug: "ai-agent-claudecode-claudecode-083e790a"
summary: "梳理 Claude Code 规则、记忆、Skills、Hooks、MCP 与插件，补充 2.1.326 的 Code Mode 条件、工具权限、MCP 后台任务和插件引擎版本约束。"
category: "ClaudeCode"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "ClaudeCode"
tags:
  - "Claude Code"
  - "CLAUDE.md"
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
updatedAt: "2026-11-17T15:21:29.490Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 02 篇：Claude Code 功能全景、规则、记忆与扩展机制（程序员深度版）

> Claude Code 的难点不是“功能少”，而是规则、权限、记忆、工具、工作流和界面扩展同时存在。本文按当前官方文档把它们拆开，避免把 `CLAUDE.md` 当成权限文件、把 Skill 当成 MCP、把 Plugin 当成单个命令，也避免为了一次任务把所有能力都塞进上下文。


> 版本边界（2026-11-17）：npm `latest/next=2.1.326`，`stable=2.1.311`；本机只读核验为 `2.1.319`。本文以当日直接获取的官方文档、`v2.1.314` 至 `v2.1.326` 发布记录和 npm 信息更新；本机帮助只验证 2.1.319 已有入口，未执行客户端升级或界面操作。`latest` 是最新正式发布渠道，不能与 npm 的 `stable` 标签混为一谈。

[[toc]]

## 0. 2026-11-17：Code Mode、Skill 权限和扩展生命周期

### 0.1 Code Mode 改变工具调用方式

Code Mode 在 2.1.323 加入，是默认关闭的实验能力：Claude 写 JavaScript，把多个工具调用及结果处理放到一段代码中执行。它适合多文件重复修改、结果过滤和独立命令并行；普通对话仍用自然语言发任务，`Ctrl+O` 中展开 **Code** 行可以检查代码。

当前官方条件需要同时满足：

- 2.1.323+ 的原生构建，在交互式终端 `claude` 中运行；Windows 还需 Git for Windows。
- 直接使用 Anthropic 的订阅或 Console 认证，以及受支持的 Opus 5.5、Sonnet 5.5、Haiku 5.5 或 Fable 5.2。
- 组织没有使用文档列出的 HIPAA/ZDR 等限制，相关功能配置允许启用。
- 不通过自定义网关、Bedrock、Vertex/Google Cloud、Foundry 或 Claude Platform on AWS 使用。

`-p`、Agent SDK、VS Code 面板、Desktop 和 Cloud 会话当前不支持 Code Mode。Remote Control、Chrome 和 computer use 也不可与它同时使用，Code Mode 会话不能转成独立后台会话或迁移到 Desktop。恢复时仍需开启 Code Mode。

需要试用时，在自己的 shell 中显式启用，按首次确认提示操作：

```powershell
$env:CLAUDE_CODE_EXPERIMENTAL_CODE_MODE = '1'
claude
```

本机 2.1.319 尚未达到该版本门槛，以上是官方用法，未在本轮启用或实测。项目 settings 不能替用户打开它；用户 settings 可以设置该变量，组织 managed settings 可以用 `0` 禁用。

2.1.326 开始允许同时开启 agent teams，in-process 队友可以使用 Code Mode，split panes 队友仍不使用。auto mode 分类器审查的是整段代码，运行时计算出来的路径不在静态审查中；具体工具的 deny/ask 规则和 PreToolUse hooks 仍会处理工具调用。不能因此删掉原有边界检查。

### 0.2 Skill 的说明和工具预授权不是同一生命周期

`SKILL.md` 内容进入对话后可继续存在；`allowed-tools` 授权只覆盖调用该 Skill 的当前回合，下一条用户消息后清除，再调用才重新应用。它预先允许一部分工具，不会把其他工具从能力池中移除；需要限制工具时使用 `disallowed-tools` 或会话权限规则，并遵守各自范围。

2.1.325 起，定时任务和 `/loop` 调用声明 `allowed-tools` 或 hooks 的 Skill 时需要许可。对已经审阅且确定要无人值守执行的 Skill，可为准确名称配置 `Skill(name)`；这仍不绕过组织的 deny、托管规则及底层工具检查。

### 0.3 MCP tasks 与插件版本兼容

2.1.319 支持 MCP tasks：服务器将工具调用作为任务处理时，CLI 可转入后台，在完成后把结果交给 Claude。`CLAUDE_CODE_DISABLE_MCP_TASK_BACKGROUND=1` 可让调用等待；服务器先要实现该能力，不能把所有慢 MCP 请求都当成 task。

2.1.323 增加 `plugin.json` 的 `engines["claude-code"]` 版本范围，范围外插件不会安装、更新或加载；`claude plugin validate --strict` 可把校验警告变为失败。2.1.326 还会提示被忽略的无效元数据。插件安装、组件加载与工具授权应分别检查。

资料：[Code Mode](https://code.claude.com/docs/en/code-mode)、[Skills](https://code.claude.com/docs/en/skills)、[2.1.319](https://github.com/anthropics/claude-code/releases/tag/v2.1.319)、[2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323)、[2.1.326](https://github.com/anthropics/claude-code/releases/tag/v2.1.326)。


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

## 0.4 VS Code 扩展与 Desktop 的能力边界

### VS Code 扩展

官方 VS Code 扩展 ID 为 `anthropic.claude-code`，Marketplace 页面为 <https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code>，要求 VS Code 1.94 或更高版本，支持 VS Code、Cursor 及兼容的 VS Code forks。付费 Claude Pro、Max、Team、Enterprise 或 Claude Console 账户均可登录；通过 Bedrock、Vertex 或 Foundry 等第三方 Provider 时，账号能力和云端功能会减少。

官方 VS Code 扩展提供原生图形面板，当前能力包括：

1. inline diff、逐文件或逐变更接受/拒绝、Plan 文档审查和会话历史。
2. 自动附带当前打开文件和选中内容；`@` 引用可以精确到文件和行号，Windows/Linux 使用 `Alt+K` 插入引用，macOS 使用 `Option+K`。
3. `Auto`、`Manual`、`Plan`、`Edit automatically` 等权限模式；`Plan` 会把计划打开为 Markdown，开发者可以先写 inline comments 再批准执行。
4. `Customize` 菜单统一管理 `/mcp`、`/skills`、Memory、Instructions、Permissions、Hooks 和 Plugins；扩展与 CLI 共享 `~/.claude/settings.json`、会话历史和 MCP 配置。
5. 扩展自带面板所需的私有 CLI，但不会把 `claude` 写入系统 PATH。要在 VS Code 集成终端运行 CLI，仍需单独安装原生 CLI；扩展会话和终端会话可以用 `claude --resume` 继续。

### Desktop、Web 与 Remote Control

Claude Desktop（macOS universal、Windows x64/ARM64，Linux beta）适合多个并行会话、Git isolation/worktrees、可视化 diff、Local / SSH / Cloud 环境、集成终端与文件编辑器、计划任务、Browser、Computer Use、Dispatch 和 PR 监控。Desktop Code tab 内置 CLI 与系统终端里的 `claude` 独立更新，不能用其中一个版本号推断另一个。Web/移动端适合启动 Cloud session 或 Projects，Remote Control 则让手机或浏览器控制仍在本机运行的会话。账号、组织策略、Provider 和环境凭据决定哪些入口实际出现；看到同一个 Claude Code 标志不代表它们共享同一文件系统。

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
- `allowed-tools`：在调用 Skill 的当前回合预先允许所列工具，下一条用户消息后清除；不限制其他工具的可用性，仍受组织托管规则约束。
- `context: fork`：在隔离上下文中运行；适合研究结果只需要摘要回传的任务。
- `$ARGUMENTS`、`$0`、`${CLAUDE_SESSION_ID}`、`${CLAUDE_SKILL_DIR}` 等替换变量应按官方 Skill 文档写法使用。
- `!` 命令注入可把 shell 输出放入 Skill 上下文；不要在 Skill 中打印 Key、Cookie 或完整环境变量。
- `disableSkillShellExecution` 可以在需要时阻止 Skill 的 shell 注入。
- `skillOverrides` 可以把个人/项目 Skill 设为 `on`、`name-only`、`user-invocable-only` 或 `off`；其中 `user-invocable-only` 只保留用户显式调用入口，插件 Skill 不由该键覆盖。

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

本文核验日期：2026-11-17；官方 latest 版本：`2.1.326`；本机只读帮助基线：`2.1.319`。

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

- https://code.claude.com/docs/en/vs-code
- https://code.claude.com/docs/en/desktop
- https://code.claude.com/docs/en/remote-control
- https://code.claude.com/docs/en/claude-projects
本轮更新依据：[v2.1.326 官方发布说明](https://github.com/anthropics/claude-code/releases/tag/v2.1.326)、[官方文档索引](https://code.claude.com/docs/llms.txt)、[npm 版本与渠道](https://registry.npmjs.org/@anthropic-ai/claude-code)。
