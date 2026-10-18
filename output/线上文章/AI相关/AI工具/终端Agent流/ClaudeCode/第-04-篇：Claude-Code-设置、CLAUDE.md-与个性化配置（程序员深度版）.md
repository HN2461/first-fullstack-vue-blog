---
title: "第 04 篇：Claude Code 设置、CLAUDE.md 与个性化配置（程序员深度版）"
slug: "ai-agent-claudecode-claudecode-76aa3c89"
summary: "按 2026-10-12 Claude Code 2.1.296 官方 Settings、Settings Reference、Environment Variables、Model Config、Permission Modes、Sandboxing、Statusline、Keybindings 与 Memory 文档更新，并从当前官方索引整理 244 个配置键的主题、作用域和排障方法。"
category: "ClaudeCode"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "ClaudeCode"
tags:
  - "Claude Code"
  - "Settings"
  - "CLAUDE.md"
  - "权限模式"
  - "Model Config"
  - "配置作用域"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf46"
originalSlug: "ai-agent-claudecode-claudecode-76aa3c89"
originalStatus: "published"
publishedAt: "2026-05-30T08:58:26.821Z"
updatedAt: "2026-10-12T15:13:40.130Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 04 篇：Claude Code 设置、CLAUDE.md 与个性化配置（程序员深度版）

> 本文按 2026-10-12 官方 `settings-reference` 与 Claude Code `2.1.296` 复核。重点是“设置放在哪里、谁能覆盖谁、为什么不生效、配置项现在叫什么”。文末的全量索引从官方页面实时整理，覆盖当前 244 个设置键；键的精确类型、默认值和版本门槛仍以官方链接为准。

[[toc]]

---

## 先说最重要的原则

Claude Code 的配置有三类容易混淆的东西：

1. **规则文件**告诉 Claude 项目事实和工作约束：`CLAUDE.md`、`AGENTS.md`、`.claude/rules/`。
2. **设置文件**改变客户端行为：权限、模型、沙箱、Hook、MCP、插件、UI 和环境变量。
3. **环境变量/启动参数**通常只影响当前进程或当前会话，优先级按键逐项决定。

配置排障永远先问三个问题：

```text
这个键属于哪个作用域？
当前值来自哪一个文件、环境变量或启动参数？
当前版本、Provider 和组织策略是否允许它生效？
```

---

## 1. 设置文件、作用域和优先级

| 层级 | 文件 | 作用 |
| --- | --- | --- |
| User | `~/.claude/settings.json` | 当前用户所有项目的个人偏好、默认模型、权限规则 |
| Project | `<repo>/.claude/settings.json` | 团队共享的 Hook、插件、MCP、环境变量和项目权限；可提交 |
| Local | `<repo>/.claude/settings.local.json` | 当前用户当前项目的个人覆盖；通常不提交 |
| Managed | `managed-settings.json`、MDM、服务器托管设置 | 组织安全策略和合规约束 |
| `--settings` | 启动参数传 JSON 或文件 | 仅当前会话，覆盖普通文件但低于 Managed |
| Global config | `~/.claude.json` | 全局连接、IDE、复制行为、默认 agent view 等特殊键 |

普通优先级从高到低：Managed → `--settings` → Project local → Project shared → User。命令行专用 flag（如 `--model`、`--effort`）按具体键的定义覆盖文件；环境变量也可能覆盖某个键。数组通常合并，`fallbackModel`、`modelPicker` 等带顺序语义的键按官方规则整体取值。

查看当前实际加载情况：

```text
/status
/context
/doctor
```

`settings.json` 必须是合法 JSON，不能写注释和尾逗号。推荐加 schema：

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "model": "sonnet",
  "permissions": {
    "allow": ["Bash(npm run lint)", "Bash(npm test *)"],
    "deny": ["Read(./.env)", "Read(./.env.*)"]
  }
}
```

项目本地文件由 Claude Code 自动创建时会加入 Git 全局 excludes；手动创建时仍应自己加入 `.gitignore`。Windows 项目根目录、网络路径和符号链接会影响 local 文件的保存位置，遇到“明明写了但不生效”先看 `/status` 和启动诊断。

---

## 2. `CLAUDE.md` 不是 settings.json

`CLAUDE.md` 适合写短而稳定的事实：

- 安装、构建、测试和格式化命令。
- 目录职责、API 约束、编码和提交规范。
- 每次任务都适用的安全边界。

`settings.json` 适合写：

- `permissions.allow/ask/deny`、默认权限模式和 sandbox。
- 模型、effort、fallback、上下文和自动压缩。
- Hook、MCP、插件、工作流和环境变量。
- UI、状态栏、快捷键和通知。

不要把“请先运行测试”同时写 4 份；也不要把 API Key 写进任何规则文件。`AGENTS.md` 的加载规则、路径规则和 auto memory 详见第 02 篇。

---

## 3. 权限配置：从规则到模式

### 3.1 allow、ask、deny

```json
{
  "permissions": {
    "allow": [
      "Read(src/**)",
      "Bash(npm run test *)",
      "Bash(git diff *)"
    ],
    "ask": [
      "Bash(npm publish *)",
      "Bash(git push *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Bash(rm -rf *)"
    ],
    "additionalDirectories": ["../shared-package"],
    "defaultMode": "plan"
  }
}
```

规则语法支持工具名、路径和命令模式，例如 `Bash(npm run *)`。`deny` 会阻止调用，`ask` 强制显示确认，`allow` 减少重复确认；组织托管规则可能仍然叠加或锁定。规则中的相对路径以会话主工作目录为基准，不一定是仓库根目录。

### 3.2 当前模式和关键锁

```json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "disableBypassPermissionsMode": "disable"
  },
  "disableAutoMode": false,
  "useAutoModeDuringPlan": true
}
```

- `default` / Manual：按规则逐次询问。
- `acceptEdits`：自动批准文件编辑，命令仍受规则和安全检查。
- `plan`：先分析和计划，适合重构和陌生仓库。
- `auto`：使用自动模式分类器；生产部署、外传敏感数据、破坏性操作等仍可能阻止。
- `dontAsk`：不弹询问，未匹配 allow 的动作直接拒绝。
- `bypassPermissions`：跳过大部分检查，需显式启动或组织允许。

项目和 local 设置中的 `auto`/`bypassPermissions` 不能绕过官方限制；组织可通过托管设置中的 `disableAutoMode`、`permissions.disableBypassPermissionsMode` 和 `allowManagedPermissionRulesOnly` 强制边界。

### 3.3 读写边界和关键路径

新版本的 `permissions.blockReadsOutsideWorkingDirectories` 可以阻止工作目录外的读取；配合 sandbox 的 `filesystem.allowRead/denyRead`、`allowWrite/denyWrite` 细化文件边界。`rm -rf`、`Remove-Item -Recurse -Force`、生产资源销毁和强制推送等关键路径即使有宽泛 allow 也可能继续询问或被分类器拒绝。

---

## 4. Sandbox：命令执行的第二道边界

Sandbox 主要隔离 Bash/命令的文件系统和网络访问，和 Claude Code 的工具权限是两层控制：

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "network": {
      "allowedDomains": ["registry.npmjs.org", "github.com"],
      "deniedDomains": ["169.254.169.254"],
      "strictAllowlist": true
    },
    "filesystem": {
      "allowWrite": ["./dist", "./coverage"],
      "denyWrite": ["./.env", "./production"],
      "denyRead": ["./secrets"]
    }
  }
}
```

常用键包括：`sandbox.enabled`、`failIfUnavailable`、`autoAllowBashIfSandboxed`、`excludedCommands`、`allowUnsandboxedCommands`、`filesystem.*`、`network.*`、`credentials.*`。macOS、Linux 和 WSL 支持 Bash sandbox 的平台能力不同；**Claude Code sandbox 不在原生 Windows 上运行**，如果设置 `failIfUnavailable`，原生 Windows 会在启动时退出。需要隔离时应使用 WSL2 或容器，并且不要把某个平台能拦截的路径当成所有平台都能拦截。组织托管的 `allowManagedReadPathsOnly`、`allowManagedDomainsOnly`、`strictAllowlist` 和凭据注入策略可能覆盖个人配置。

凭据注入 (`sandbox.credentials.files/envVars/awsPairs/sigv4`) 要求明确掩码字段和失败行为；默认不要开启明文注入，也不要把读取出的秘密打印到 transcript。

---

## 5. 模型、effort、上下文与自动压缩

### 5.1 当前模型和 alias

官方当前模型页列出 Anthropic API 上的 Opus 5.5、Sonnet 5.5、Haiku 5.5，以及 Fable 5.1/Fable 5；第三方 Provider 的实际 ID 可能不同。常用入口：

```text
/model opus
/model sonnet
/model haiku
/model fable
```

也可以：

```bash
claude --model sonnet
$env:ANTHROPIC_MODEL = 'sonnet'
```

`model`、`availableModels`、`deniedModels`、`availableModelsMatch`、`enforceAvailableModels` 用于限制模型；`fallbackModel` 用于过载或不可用时的备用链。Provider 不是 Anthropic API 时，应使用 `ANTHROPIC_DEFAULT_*_MODEL` 绑定真实模型 ID，必要时用 `modelOverrides` 和 `[1m]` 后缀声明能力。

### 5.2 effort 和 ultracode

当前 effort 档位是 `low`、`medium`、`high`、`xhigh`、`max`；`ultracode` 是在支持的模型上打开更高代码工作模式的独立开关。使用：

```text
/effort low
/effort auto
/effort ultracode
```

```bash
claude --effort high
```

可持久化：

```json
{
  "effortLevel": "medium",
  "maxEffortLevel": "high",
  "ultracode": false,
  "modelSettings": {
    "claude-sonnet-5-5": { "effortLevel": "high" }
  }
}
```

`max` 是命令/会话层可用的最高档，不能直接写入 `effortLevel`；`maxEffortLevel` 可由组织设更低上限。不同模型支持的 effort 和默认值不同，先看 `/model` 选择器和官方 Model Config。

### 5.3 1M context 与 auto-compact

支持的模型可以在完整模型 ID 或 alias 后加 `[1m]`：

```text
/model opus[1m]
/model claude-sonnet-4-6[1m]
```

网关或自定义模型 ID 不一定会被识别；这时用 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`、`CLAUDE_CODE_DISABLE_1M_CONTEXT` 和 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 按官方规则校正，不要只把模型名字改成 `1m`。

当前自动压缩配置：

```text
/autocompact 500k
/autocompact auto
```

```json
{
  "autoCompactEnabled": true,
  "autoCompactWindow": 200000
}
```

从新版本开始，`/autocompact` 保存的是当前模型对应的窗口，subagent 还可在 front matter 里单独设置 `autoCompactWindow`。网关返回的上下文能力、模型原生窗口和 Claude Code 识别结果不一致时，`/context` 是最终诊断入口。

---

## 6. 环境变量配置：用 `env` 做可审计的进程环境

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://llm-gateway.example.com",
    "CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION": "false",
    "BASH_DEFAULT_TIMEOUT_MS": "120000"
  }
}
```

官方 `env-vars` 页面当前列出 390 余个变量，覆盖 Provider、代理、网关、上下文、调试、Hook、MCP、终端和隐私。高频项包括：

| 变量 | 用途 |
| --- | --- |
| `ANTHROPIC_API_KEY` | 使用 API Key；交互会话首次覆盖订阅凭据时会询问 |
| `ANTHROPIC_AUTH_TOKEN` | 自定义 `Authorization: Bearer` 凭据 |
| `ANTHROPIC_BASE_URL` | Anthropic 兼容 Gateway 基础 URL |
| `ANTHROPIC_MODEL` | 当前会话模型 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` / `SONNET` / `HAIKU` / `FABLE` | 第三方 Provider 的 alias 映射 |
| `CLAUDE_CODE_EFFORT_LEVEL` | 当前会话 effort |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | 脚本/云环境自动压缩窗口 |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 关闭非必要网络流量，可能影响 feature flags 和同步能力 |
| `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | 打开/关闭提示建议 |
| `MCP_TIMEOUT` | MCP 启动/连接超时 |
| `DISABLE_AUTOUPDATER` / `DISABLE_UPDATES` | 更新策略 |
| `CLAUDE_CONFIG_DIR` | 改变配置和状态目录 |

项目共享 `env` 只能写非敏感、可复现的值。变量来源优先级可能高于文件，且部分 telemetry、Managed 或安全变量不能由项目文件改写；详情以官方 `settings-reference#env` 和 `env-vars` 为准。

---

## 7. UI、终端、状态栏和快捷键

常用个性化配置：

```json
{
  "theme": "dark",
  "tui": "fullscreen",
  "editorMode": "vim",
  "viewMode": "compact",
  "statusLine": {
    "type": "command",
    "command": "node ./scripts/statusline.mjs"
  },
  "showTurnDuration": true,
  "spinnerTipsEnabled": true,
  "terminalTitleFromRename": true
}
```

`statusLine` 和 `subagentStatusLine` 的脚本会收到模型、上下文、成本和 agent 信息；不要在状态栏打印 Key 或完整路径。`/statusline` 可以让 Claude 根据当前 shell 自动生成建议。`keybindings.json` 用于快捷键，`/keybindings` 打开编辑；Vim 输入模式通过 `editorMode` 和 `vimInsertModeRemaps` 配置。

常见键：`theme`、`tui`、`viewMode`、`maxProseWidth`、`timeFormat`、`timeZone`、`defaultShell`、`fileSuggestion`、`spellcheck`、`voice`、`voiceEnabled`、`promptSuggestionEnabled`、`diffTool`、`externalEditorContext`。`~/.claude.json` 中的 Global config 键不要误放到项目 `settings.json`。

---

## 8. Hooks、Skills、MCP 和 Plugins 的设置入口

| 能力 | 主要设置 |
| --- | --- |
| Hooks | `hooks`、`disableAllHooks`、`allowManagedHooksOnly`、`allowedHttpHookUrls`、`httpHookAllowedEnvVars` |
| Skills | `disableBundledSkills`、`skillOverrides`、`disableSkillShellExecution`、`syncClaudeAiSkills` |
| Plugins | `enabledPlugins`、`pluginConfigs`、`extraKnownMarketplaces`、`blockedMarketplaces`、`strictKnownMarketplaces`、`prependPlugins`、`appendPlugins` |
| MCP | `enabledMcpjsonServers`、`disabledMcpjsonServers`、`allowedMcpServers`、`deniedMcpServers`、`managedMcpServers`、`enableAllProjectMcpServers` |
| Workflows | `enableWorkflows`、`disableWorkflows`、`workflowKeywordTriggerEnabled`、`workflowSizeGuideline` |

组织管理时优先用 Managed keys 锁定允许的 Provider、MCP、Plugin marketplace 和 Hook；个人项目只在确实需要时启用第三方能力。

---

## 9. 远程、桌面、认证和组织策略

当前版本还包含以下配置族：

- Remote/desktop：`remoteControlAtStartup`、`disableRemoteControl`、`remote.defaultEnvironmentId`、`enableArtifact`、`disableArtifact`、`preferredNotifChannel`。
- Provider/auth：`allowedProviders`、`forceLoginMethod`、`forceLoginGatewayUrl`、`apiKeyHelper`、`awsAuthRefresh`、`gcpAuthRefresh`、`otelHeadersHelper`。
- 组织版本策略：`autoUpdatesChannel`、`minimumVersion`、`requiredMinimumVersion`、`requiredMaximumVersion`。
- Managed policy：`managedSourcesBehavior`、`parentSettingsBehavior`、`policyHelper`、`forceRemoteSettingsRefresh`、`wslInheritsWindowsSettings`。
- 隐私和清理：`cleanupPeriodDays`、`desktopSessionCleanupPeriodDays`、`feedbackDrafts`、`skipWebFetchPreflight`。

`forceLoginMethod`、`allowedProviders` 和 server-managed settings 会影响本地、云会话、Desktop、VS Code 和 Remote Control 的覆盖关系；不要只在本机改文件后推断云端也会生效。

---

## 10. 配置落地顺序

1. 先写短的 `CLAUDE.md`，确认项目事实和验证命令。
2. 用 `settings.local.json` 做个人实验，不要立即提交。
3. 把团队都需要的 allow/deny、Hook、MCP 和插件移到共享 `settings.json`。
4. 为陌生仓库默认使用 `plan`，稳定后再考虑 `acceptEdits` 或 `auto`。
5. 只为真实需要启用 sandbox、MCP、Skill、Plugin；每增加一个扩展都检查上下文成本。
6. 模型、effort、上下文先用 `/model`、`/effort`、`/context` 观察，再写持久配置。
7. 组织策略放 Managed；不要把安全要求依赖在用户可编辑的项目文件上。
8. 每次改配置后运行 `/status`、`/doctor`，再用最小任务验证实际行为。

---

## 11. 常见配置不生效原因

| 现象 | 排查顺序 |
| --- | --- |
| 修改模型后新会话仍是旧模型 | `ANTHROPIC_MODEL`、Managed/project 设置、`/model` 的保存位置、组织默认模型 |
| `settings.local.json` 没被读取 | 当前平台、Git root、信任状态、Windows/网络路径、文件是否是合法 JSON |
| allow 规则仍然询问 | 更高层 ask/deny、命令解析变化、关键路径、工具需要用户交互 |
| 项目 env 没生效 | 变量被 shell/Managed 覆盖，或该变量只允许 user/managed scope |
| MCP connected 但无工具 | 工具延迟加载、`enabled/disabledMcpjsonServers`、Provider 不支持 tool search |
| Plugin 安装后无命令 | marketplace policy、Plugin 未启用、命名空间、需 `/reload-plugins` |
| 1M context 不工作 | 模型不支持、网关丢 beta、未使用 `[1m]`、`CLAUDE_CODE_DISABLE_1M_CONTEXT` 覆盖 |
| 自动模式不可选 | 组织禁用、Provider/模型不支持、feature flags 未获取、HIPAA/Managed 策略 |

不要一遇到问题就删除整个 `~/.claude`；先备份设置，运行 `/doctor`，并逐项验证优先级。

---

## 12. 全量配置索引说明

下表由 2026-10-12 抓取的官方 `settings-reference` 页面生成，覆盖当前页面索引中的 244 个键。官方索引会保留少量历史条目，若“官方用途”以 `Removed in` 开头，表示该键已在对应版本移除，只用于识别旧配置，不能继续写入新配置。`Any file` 表示可在普通 settings 文件中配置；`User or managed`、`Managed`、`Global config` 等是官方作用域限制。下表用于快速检索键名和职责主题；默认值、JSON 类型、枚举、版本门槛和安全例外请点击官方页面对应锚点查看。

### Model and responses（23 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `advisorModel` | 普通文件（`Any file`） | Pick which model answers when Claude asks the advisor tool |
| `alwaysThinkingEnabled` | 普通文件（`Any file`） | Turn extended thinking off for every session |
| `availableModels` | 普通文件（`Any file`） | Restrict which models people can pick |
| `availableModelsMatch` | 仅托管（`Managed`） | Make each availableModels model ID entry permit only the version it names |
| `deniedModels` | 仅托管（`Managed`） | Block specific models, even ones availableModels permits |
| `effortLevel` | 普通文件（`Any file`） | Set a default effort level for models without a saved level of their own |
| `enforceAvailableModels` | 普通文件（`Any file`） | Keep the /model Default choice inside your availableModels allowlist |
| `fallbackModel` | 普通文件（`Any file`） | Name backup models for when the primary is overloaded |
| `fastMode` | 普通文件（`Any file`） | Turn fast mode on for sessions where it’s available |
| `fastModePerSessionOptIn` | 普通文件（`Any file`） | Require people to turn fast mode on each session |
| `language` | 普通文件（`Any file`） | Have Claude respond in a language other than English |
| `maxEffortLevel` | 普通文件（`Any file`） | Cap the effort level for every model or per model, on every provider |
| `model` | 普通文件（`Any file`） | Change the model Claude Code starts with |
| `modelOverrides` | 普通文件（`Any file`） | Map model IDs to your provider’s IDs, such as Bedrock ARNs |
| `modelPicker` | 用户/托管（`User or managed`） | Choose which models the /model picker lists, in your own order and with your own labels |
| `modelPricing` | 仅托管（`Managed`） | Report spend at your organization’s contracted rates instead of list price |
| `modelSettings` | 普通文件（`Any file`） | Keep a saved effort level or auto-compact window per model, or cap one model’s effort |
| `outputStyle` | 普通文件（`Any file`） | Change Claude’s role, tone, and output format with an output style |
| `promptCacheTtl` | 普通文件（`Any file`） | Choose the prompt cache lifetime for the main conversation |
| `showThinkingSummaries` | 普通文件（`Any file`） | See summaries of Claude’s thinking instead of a collapsed stub |
| `subagentPromptCacheTtl` | 普通文件（`Any file`） | Choose the prompt cache lifetime for subagents and other requests outside the main conversation |
| `switchModelsOnFlag` | 普通文件（`Any file`） | Switch models automatically or pause when a safety classifier flags a request |
| `ultracode` | 普通文件（`Any file`） | Have Claude plan a workflow for each substantive task without being asked |

### Agents, sessions, and worktrees（12 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `agent` | 普通文件（`Any file`） | Start every session as a named subagent with its prompt, tools, and model |
| `crossSessionInbound` | 普通文件（`Any file`） | Choose whether Claude Code delivers messages from your other sessions, shows a notice without delivering them, or refuses them |
| `disableAgentView` | 普通文件（`Any file`） | Turn off background agents and agent view |
| `isolatePeerMachines` | 普通文件（`Any file`） | Ask you before Claude messages one of your sessions on another machine |
| `processWrapper` | 用户/托管（`User or managed`） | Run Claude Code’s background processes through a corporate launcher on macOS and Linux |
| `teammateMode` | 普通文件（`Any file`） | Choose how agent team teammates display |
| `worktree` | 普通文件（`Any file`） | Configure how Claude Code creates git worktrees |
| `worktree.baseRef` | 普通文件（`Any file`） | Branch new worktrees from the remote default branch or your local HEAD |
| `worktree.bgIsolation` | 普通文件（`Any file`） | Let background sessions edit the working copy without a worktree |
| `worktree.location` | User（`User`） | Choose where Desktop SSH sessions create their worktrees on a remote machine |
| `worktree.sparsePaths` | 普通文件（`Any file`） | Check out only the directories you need in each worktree |
| `worktree.symlinkDirectories` | 普通文件（`Any file`） | Symlink large directories into each worktree instead of duplicating them |

### Remote, desktop, and notifications（13 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `agentPushNotifEnabled` | 普通文件（`Any file`） | Let Claude send a push notification to your phone when it decides to |
| `awaySummaryEnabled` | 普通文件（`Any file`） | Turn off the session recap shown when you come back to the terminal |
| `disableArtifact` | 普通文件（`Any file`） | Deprecated; use enableArtifact to turn the Artifact tool off |
| `disableDeepLinkRegistration` | 普通文件（`Any file`） | Stop Claude Code from registering the claude-cli:// handler |
| `disableDesktopLocalSessions` | 仅托管（`Managed`） | Turn off Desktop Code sessions that run on the device, leaving SSH to other hosts and cloud |
| `disableRemoteControl` | 普通文件（`Any file`） | Turn off Remote Control everywhere it can start |
| `enableArtifact` | 普通文件（`Any file`） | Turn the Artifact tool off with a false in any file; no file can turn it back on |
| `inputNeededNotifEnabled` | 普通文件（`Any file`） | Get a push notification when Claude is waiting on you |
| `preferredNotifChannel` | 普通文件（`Any file`） | Choose a terminal bell or desktop notification for task completion |
| `remote.defaultEnvironmentId` | 普通文件（`Any file`） | Pick the default cloud environment for claude --cloud; a self-hosted ccpool_ ID is read only from user and managed settings and --settings |
| `remoteControlAtStartup` | 普通文件（`Any file`） | Connect Remote Control automatically when a session starts |
| `sshConfigs` | 用户/托管（`User or managed`） | Add SSH connections to the Desktop environment dropdown |
| `sshHostAllowlist` | 仅托管（`Managed`） | Limit which hosts Desktop SSH sessions can reach |

### MCP（10 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `allowAllClaudeAiMcps` | 仅托管（`Managed`） | Load the claude.ai connectors Claude Code fetches itself alongside a deployed managed-mcp.json |
| `allowClaudeInChromeWithManagedMcp` | 仅托管（`Managed`） | Let the built-in Claude in Chrome server run alongside a deployed managed-mcp.json |
| `allowedMcpServers` | 普通文件（`Any file`） | Allowlist which MCP servers users can add |
| `allowManagedMcpServersOnly` | 仅托管（`Managed`） | Make the managed MCP allowlist the only one that applies |
| `deniedMcpServers` | 普通文件（`Any file`） | Block specific MCP servers by URL, command, or name |
| `disableClaudeAiConnectors` | 普通文件（`Any file`） | Turn off claude.ai connectors so Claude Code doesn’t fetch them |
| `disabledMcpjsonServers` | 普通文件（`Any file`） | Reject specific servers from a project’s .mcp.json |
| `enableAllProjectMcpServers` | 普通文件（`Any file`） | Approve every server in project .mcp.json files without a prompt |
| `enabledMcpjsonServers` | 普通文件（`Any file`） | Approve specific servers from a project’s .mcp.json |
| `managedMcpServers` | 仅托管（`Managed`） | Provide remote MCP servers to every user alongside the ones they add |

### Plugins and skills（22 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `allowedChannelPlugins` | 仅托管（`Managed`） | Replace the default allowlist of channel plugins that can push messages |
| `appendPlugins` | 用户/托管（`User or managed`） | Run your organization’s mods after every mod a user installs |
| `blockedMarketplaces` | 仅托管（`Managed`） | Block plugin marketplace sources for your organization |
| `channelsEnabled` | 仅托管（`Managed`） | Allow channels for your organization |
| `disableBundledSkills` | 普通文件（`Any file`） | Turn off the skills and workflows included with Claude Code |
| `disableCommandPluginSources` | 仅托管（`Managed`） | Block plugins that install by running a marketplace-declared command |
| `disableSkillShellExecution` | 普通文件（`Any file`） | Stop skills and custom commands from running inline shell |
| `enabledPlugins` | 普通文件（`Any file`） | Turn individual plugins on or off per scope |
| `extraKnownMarketplaces` | 普通文件（`Any file`） | Register marketplaces for a repository or an organization |
| `pluginConfigs` | 用户/托管（`User or managed`） | Store the answers you gave a plugin’s configuration dialog |
| `pluginSuggestionMarketplaces` | 仅托管（`Managed`） | Choose which marketplaces can surface plugin install suggestions in /plugin |
| `pluginTrustMessage` | 仅托管（`Managed`） | Add your own text to the plugin trust warning |
| `prependPlugins` | 用户/托管（`User or managed`） | Run your organization’s mods before every mod a user installs |
| `skillOverrides` | 普通文件（`Any file`） | Hide or collapse a skill without editing its SKILL.md |
| `strictKnownMarketplaces` | 仅托管（`Managed`） | Allowlist the marketplace sources users can add and install from |
| `strictPluginOnlyCustomization` | 仅托管（`Managed`） | Block skills, agents, hooks, and MCP servers from user and project sources |
| `strictPluginOnlyCustomization.agents` | 仅托管（`Managed`） | Lock agents to plugin and managed sources |
| `strictPluginOnlyCustomization.hooks` | 仅托管（`Managed`） | Lock hooks to plugin and managed sources |
| `strictPluginOnlyCustomization.mcp` | 仅托管（`Managed`） | Lock MCP servers to plugin and managed sources |
| `strictPluginOnlyCustomization.skills` | 仅托管（`Managed`） | Lock skills to plugin and managed sources |
| `syncClaudeAiPlugins` | 用户/本地/托管（`User, local, or managed`） | Stop loading the plugins enabled on your claude.ai account and stop downloading new ones |
| `syncClaudeAiSkills` | 用户/本地/托管（`User, local, or managed`） | Stop loading the skills enabled on your claude.ai account and stop downloading new ones |

### Hooks and automation（9 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `allowedHttpHookUrls` | 普通文件（`Any file`） | Limit which URLs HTTP hooks can target |
| `allowManagedHooksOnly` | 仅托管（`Managed`） | Run only the hooks your organization deploys |
| `disableAllHooks` | 普通文件（`Any file`） | Turn off hooks, a custom status line, and a custom @ file suggestion command at once |
| `disableWorkflows` | 普通文件（`Any file`） | Turn dynamic workflows off for everyone; use enableWorkflows for yourself |
| `enableWorkflows` | 普通文件（`Any file`） | Turn dynamic workflows on or off against your plan’s default |
| `hooks` | 普通文件（`Any file`） | Run your own commands as hooks at points in Claude Code’s lifecycle |
| `httpHookAllowedEnvVars` | 普通文件（`Any file`） | Limit which env vars HTTP hooks can put in headers |
| `workflowKeywordTriggerEnabled` | 普通文件（`Any file`） | Let the word ultracode in a prompt start a workflow; set false to type it without starting one |
| `workflowSizeGuideline` | 普通文件（`Any file`） | Set the agent count Claude aims for in dynamic workflows |

### Authentication and providers（10 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `allowedProviders` | 仅托管（`Managed`） | Limit which API providers a machine may use |
| `apiKeyHelper` | 普通文件（`Any file`） | Generate the API credential with your own command |
| `awsAuthRefresh` | 普通文件（`Any file`） | Refresh expired Bedrock credentials in .aws with your own command |
| `awsCredentialExport` | 普通文件（`Any file`） | Supply Bedrock credentials as JSON from your own command |
| `forceLoginGatewayUrl` | 用户/托管（`User or managed`） | Set the gateway URL the login screen connects to |
| `forceLoginMethod` | 普通文件（`Any file`） | Restrict login to claude.ai, Claude Console, or a cloud gateway |
| `forceLoginOrgUUID` | 普通文件（`Any file`） | Pin claude.ai logins to your organization; only a managed source enforces it |
| `gatewayInternalNetworks` | 仅托管（`Managed`） | Let /login reach a cloud gateway on public IPv4 space your organization uses internally |
| `gcpAuthRefresh` | 普通文件（`Any file`） | Refresh Google Cloud credentials with your own command |
| `otelHeadersHelper` | 普通文件（`Any file`） | Generate rotating OpenTelemetry headers with your own command |

### Permission settings（15 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `allowManagedPermissionRulesOnly` | 仅托管（`Managed`） | Make managed settings the only settings source of permission rules |
| `autoMode` | 用户/托管（`User or managed`） | Add your own allow and deny rules to the auto mode classifier |
| `autoMode.classifyAllShell` | 用户/托管（`User or managed`） | Send every shell command through the auto mode classifier, even ones a narrow allow rule matches |
| `disableAutoMode` | 普通文件（`Any file`） | Remove auto mode from the permission mode cycle |
| `permissions` | 普通文件（`Any file`） | Set allow, ask, and deny rules and the starting permission mode |
| `permissions.additionalDirectories` | 普通文件（`Any file`） | Give Claude file access to directories outside the current one |
| `permissions.allow` | 普通文件（`Any file`） | Approve listed tool uses without a prompt |
| `permissions.ask` | 普通文件（`Any file`） | Always prompt before listed tool uses |
| `permissions.blockReadsOutsideWorkingDirectories` | 普通文件（`Any file`） | Make the file tools refuse reads outside the working directories in every permission mode |
| `permissions.defaultMode` | 普通文件（`Any file`） | Set the permission mode new sessions start in |
| `permissions.deny` | 普通文件（`Any file`） | Block listed tool uses, including reads of files that hold secrets |
| `permissions.disableBypassPermissionsMode` | 普通文件（`Any file`） | Prevent anyone from entering bypassPermissions mode |
| `skipAutoPermissionPrompt` | 用户/托管（`User or managed`） | Skip the one-time notice Claude Code shows when you first enter auto mode yourself rather than through the built-in default |
| `skipDangerousModePermissionPrompt` | 用户/本地/托管（`User, local, or managed`） | Skip the confirmation dialog before bypassPermissions mode |
| `useAutoModeDuringPlan` | 用户/本地/托管（`User, local, or managed`） | Let the auto mode classifier review shell commands in plan mode; set false to get prompts instead |

### Interface and terminal（39 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `askUserQuestionTimeout` | 用户/托管（`User or managed`） | Let an unanswered question auto-continue after idle time |
| `autoContinueAtUsageLimit` | 用户/托管（`User or managed`） | Wait in the open session and continue the task automatically after a claude.ai usage limit resets |
| `autoScrollEnabled` | 普通文件（`Any file`） | Follow new output to the bottom in fullscreen rendering |
| `axScreenReader` | 普通文件（`Any file`） | Render screen-reader friendly output |
| `bashEditDiffEnabled` | 用户/托管（`User or managed`） | Record the files that changed while a Bash command ran in every permission mode |
| `companyAnnouncements` | 普通文件（`Any file`） | Show your organization’s announcements at startup |
| `defaultShell` | 普通文件（`Any file`） | Choose whether Bash or PowerShell runs the shell commands you type with the ! prefix |
| `dialogExpiry` | 用户/托管（`User or managed`） | Set how long Claude Code waits for Remote Control or an SDK host to answer a forwarded dialog before it cancels the dialog |
| `editorMode` | 普通文件（`Any file`） | Use vim key bindings in the input prompt |
| `emojiCompletionEnabled` | 普通文件（`Any file`） | Turn off :shortcode: emoji suggestions and replacement in the prompt input |
| `fileSuggestion` | 普通文件（`Any file`） | Supply @ file autocomplete from your own command |
| `footerLinksRegexes` | 用户/托管（`User or managed`） | Make issue or review IDs in output into clickable links below the input box |
| `keybindingFlavor` | 普通文件（`Any file`） | Deprecated and has no effect; the word-editing shortcuts always follow readline conventions |
| `maxProseWidth` | 普通文件（`Any file`） | Cap how wide the prose in Claude’s responses runs in a wide terminal |
| `prefersReducedMotion` | 普通文件（`Any file`） | Reduce or turn off spinner, shimmer, and flash animations |
| `promptSuggestionEnabled` | 普通文件（`Any file`） | Hide the grayed-out prompt suggestions in the input box |
| `respectGitignore` | 普通文件（`Any file`） | Keep gitignored files out of the @ file picker |
| `respondToBashCommands` | 普通文件（`Any file`） | Stop Claude from responding after a ! shell command runs |
| `showClearContextOnPlanAccept` | 普通文件（`Any file`） | Show a “clear context” option on the plan accept screen |
| `showTurnDuration` | 普通文件（`Any file`） | Hide the “Cooked for” duration after each response |
| `spellcheck` | 用户/托管（`User or managed`） | Underline misspelled words in the prompt input with a spell checker you install |
| `spinnerTipsEnabled` | 普通文件（`Any file`） | Hide tips in the spinner while Claude works |
| `spinnerTipsOverride` | 普通文件（`Any file`） | Add your own tips to the spinner rotation, or replace the built-in tips |
| `spinnerVerbs` | 普通文件（`Any file`） | Add or replace the verbs shown while a turn runs |
| `statusLine` | 普通文件（`Any file`） | Run your own command to render a status line below the prompt |
| `subagentStatusLine` | 普通文件（`Any file`） | Rewrite rows in the subagent task display with your own command |
| `syntaxHighlightingDisabled` | 普通文件（`Any file`） | Turn off syntax highlighting in diffs and code blocks |
| `terminalProgressBarEnabled` | 普通文件（`Any file`） | Hide the terminal progress bar in terminals that support it |
| `terminalTitleFromRename` | 普通文件（`Any file`） | Stop /rename and --name from changing the terminal tab title |
| `theme` | 普通文件（`Any file`） | Pick the interface color theme, built-in or custom |
| `timeFormat` | 普通文件（`Any file`） | Show the times in the interface on a 12-hour or 24-hour clock, in UTC, or with a strftime pattern |
| `timeZone` | 普通文件（`Any file`） | Show the times in the interface in a time zone other than your system’s |
| `tui` | 普通文件（`Any file`） | Choose the fullscreen or classic terminal renderer |
| `verbose` | 普通文件（`Any file`） | Show full tool output instead of truncated summaries; viewMode takes precedence when both are set |
| `viewMode` | 普通文件（`Any file`） | Start every session in default, verbose, or focus view |
| `vimInsertModeRemaps` | 用户/托管（`User or managed`） | Map a two-key INSERT-mode sequence such as jj to Escape |
| `voice` | 普通文件（`Any file`） | Turn on voice dictation and pick hold or tap mode |
| `voiceEnabled` | 普通文件（`Any file`） | Turn on voice dictation with the older single-key form |
| `wheelScrollAccelerationEnabled` | 普通文件（`Any file`） | Turn off mouse-wheel acceleration in fullscreen rendering |

### Git and attribution（7 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `attribution` | 普通文件（`Any file`） | Customize the attribution Claude Code adds to commits and pull requests |
| `attribution.commit` | 普通文件（`Any file`） | Change or hide the trailer Claude Code adds to commits |
| `attribution.pr` | 普通文件（`Any file`） | Change or hide the attribution line in pull request descriptions |
| `attribution.sessionUrl` | 普通文件（`Any file`） | Omit the claude.ai session link from cloud and Remote Control commits |
| `includeCoAuthoredBy` | 普通文件（`Any file`） | Deprecated; use attribution to hide or change commit and PR attribution |
| `includeGitInstructions` | 普通文件（`Any file`） | Remove the built-in commit and PR instructions from Claude’s context |
| `prUrlTemplate` | 普通文件（`Any file`） | Point PR links at an internal code-review tool instead of github.com |

### Memory and context（13 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `autoCompactEnabled` | 普通文件（`Any file`） | Turn automatic compaction off or on |
| `autoCompactWindow` | 普通文件（`Any file`） | Set how full the context gets before Claude Code compacts |
| `autoMemoryDirectory` | 普通文件（`Any file`） | Store auto memory in a directory you choose |
| `autoMemoryEnabled` | 普通文件（`Any file`） | Turn auto memory off or on |
| `bashOutputMaxChars` | 普通文件（`Any file`） | Set how much of a successful command’s output Claude receives inline |
| `claudeMd` | 仅托管（`Managed`） | Inject organization-wide CLAUDE.md instructions from managed settings |
| `claudeMdExcludes` | 普通文件（`Any file`） | Skip specific CLAUDE.md files when memory loads |
| `env` | 普通文件（`Any file`） | Set environment variables for every session and its subprocesses |
| `fileCheckpointingEnabled` | 普通文件（`Any file`） | Turn off or on the file snapshots that /rewind restores |
| `plansDirectory` | 普通文件（`Any file`） | Choose where plan mode writes plan files |
| `skillListingBudgetFraction` | 普通文件（`Any file`） | Reserve more or less context for the skill listing |
| `skillListingMaxDescChars` | 普通文件（`Any file`） | Cap each skill’s description length in the skill listing |
| `taskOutputMaxChars` | 普通文件（`Any file`） | Removed in v2.1.277, together with the TaskOutput tool it sized |

### Global config settings（12 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `autoConnectIde` | 全局配置（`Global config`） | Connect to a running VS Code or JetBrains IDE automatically from an external terminal |
| `autoInstallIdeExtension` | 全局配置（`Global config`） | Turn off automatic install of the IDE extension from a VS Code terminal |
| `claudeInChromeDefaultEnabled` | 全局配置（`Global config`） | Turn on Chrome integration when a session starts, in the interactive CLI and the VS Code extension |
| `copyFullResponse` | 全局配置（`Global config`） | Make /copy copy the full response without showing the picker |
| `copyOnSelect` | 全局配置（`Global config`） | Turn off automatic copying of text you select with the mouse in fullscreen rendering and agent view |
| `defaultToAgentsView` | 全局配置（`Global config`） | Open agent view instead of a new conversation when you run claude with no arguments |
| `diffTool` | 全局配置（`Global config`） | Choose whether Claude’s proposed file changes open in the VS Code or JetBrains diff viewer or stay in the terminal |
| `externalEditorContext` | 全局配置（`Global config`） | Show Claude’s last response as comments when you press Ctrl+G to edit |
| `leftArrowOpensAgents` | 全局配置（`Global config`） | Turn off the ← shortcut that backgrounds the session and opens agent view |
| `permissionExplainerEnabled` | 全局配置（`Global config`） | Removed in v2.1.257, together with the Ctrl+E command explanation on shell permission prompts |
| `prStatusFooterEnabled` | 全局配置（`Global config`） | Turn off the prompt footer’s PR review status badge and the pull request check behind it |
| `teammateDefaultModel` | 全局配置（`Global config`） | Removed in v2.1.234; see Specify teammates and models for how Claude Code picks a teammate’s model |

### Updates and versioning（4 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `autoUpdatesChannel` | 普通文件（`Any file`） | Follow the stable release channel instead of latest |
| `minimumVersion` | 普通文件（`Any file`） | Keep auto-updates from installing anything below a version |
| `requiredMaximumVersion` | 仅托管（`Managed`） | Refuse to start on a version newer than your organization allows |
| `requiredMinimumVersion` | 仅托管（`Managed`） | Refuse to start on a version older than your organization requires |

### Tools（3 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `browserExternalPageTools` | 仅托管（`Managed`） | Keep Claude’s tools off external pages in the desktop Browser pane |
| `disableBrowserExternalNavigation` | 仅托管（`Managed`） | Limit the desktop Browser pane to localhost for people and Claude |
| `disableMobileSimulatorTools` | 仅托管（`Managed`） | Block Claude’s tools in the desktop iOS Simulator pane |

### Privacy and telemetry（5 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `cleanupPeriodDays` | 普通文件（`Any file`） | Choose how many days Claude Code keeps transcripts before deleting them |
| `desktopSessionCleanupPeriodDays` | 用户/托管（`User or managed`） | Set an age limit in days for Claude Desktop and Cowork transcripts |
| `feedbackDrafts` | 用户/托管（`User or managed`） | Control whether Claude queues feedback drafts for you to review |
| `feedbackSurveyRate` | 普通文件（`Any file`） | Change how often the session quality survey appears |
| `skipWebFetchPreflight` | 普通文件（`Any file`） | Skip the WebFetch hostname check when Anthropic is unreachable |

### Enterprise and managed settings（9 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `disableSideloadFlags` | 仅托管（`Managed`） | Reject the CLI flags that sideload plugins, subagents, and MCP servers |
| `forceRemoteSettingsRefresh` | 仅托管（`Managed`） | Block startup until server-managed settings are freshly fetched |
| `managedSourcesBehavior` | 仅托管（`Managed`） | Compose every managed source you deploy instead of using the highest-priority one alone |
| `parentSettingsBehavior` | 仅托管（`Managed`） | Apply or drop restrictions an SDK or IDE host passes when you deploy managed settings |
| `policyHelper` | 仅托管（`Managed`） | Run an executable that computes managed settings at startup |
| `policyHelper.path` | 仅托管（`Managed`） | Name the helper executable Claude Code runs |
| `policyHelper.refreshIntervalMs` | 仅托管（`Managed`） | Re-run the helper in the background on an interval |
| `policyHelper.timeoutMs` | 仅托管（`Managed`） | Set how long Claude Code waits for the helper |
| `wslInheritsWindowsSettings` | 仅托管（`Managed`） | Have WSL read managed settings from the Windows policy chain |

### Sandbox settings（38 项）
| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| `sandbox` | 普通文件（`Any file`） | Isolate Bash commands from your filesystem and network on macOS, Linux, and WSL2 |
| `sandbox.allowAppleEvents` | 用户/托管（`User or managed`） | Let sandboxed commands send Apple Events on macOS |
| `sandbox.allowUnsandboxedCommands` | 普通文件（`Any file`） | Let Claude retry a blocked command outside the sandbox, or forbid it |
| `sandbox.autoAllowBashIfSandboxed` | 普通文件（`Any file`） | Run sandboxed commands without a permission prompt |
| `sandbox.bwrapPath` | 仅托管（`Managed`） | Point the sandbox at a bubblewrap binary outside PATH |
| `sandbox.credentials` | 普通文件（`Any file`） | Hide or mask credential files and variables inside the sandbox |
| `sandbox.credentials.allowPlaintextInject` | 用户/托管（`User or managed`） | Let masked credentials reach plain HTTP services on trusted test networks |
| `sandbox.credentials.awsPairs` | 用户/托管（`User or managed`） | Link custom-named AWS key variables into one credential for re-signing |
| `sandbox.credentials.envVars` | 普通文件（`Any file`） | Unset or mask an environment variable inside the sandbox |
| `sandbox.credentials.files` | 普通文件（`Any file`） | Block or mask reads of a credential file inside the sandbox |
| `sandbox.credentials.sigv4` | 用户/托管（`User or managed`） | Choose whether streaming, presigned, or SigV4A AWS requests fail or pass through |
| `sandbox.enabled` | 普通文件（`Any file`） | Turn on Bash sandboxing on macOS, Linux, and WSL2 |
| `sandbox.enableWeakerNestedSandbox` | 普通文件（`Any file`） | Run the Linux sandbox inside an unprivileged container |
| `sandbox.enableWeakerNetworkIsolation` | 普通文件（`Any file`） | Let gh, gcloud, and terraform verify TLS behind a MITM proxy inside the sandbox on macOS |
| `sandbox.excludedCommands` | 普通文件（`Any file`） | Name commands Claude Code can run outside the sandbox |
| `sandbox.failIfUnavailable` | 普通文件（`Any file`） | Refuse to start when the sandbox can’t, instead of running unsandboxed |
| `sandbox.filesystem` | 普通文件（`Any file`） | Control which paths sandboxed commands can read and write |
| `sandbox.filesystem.allowManagedReadPathsOnly` | 仅托管（`Managed`） | Stop developers from re-opening read paths your organization blocked |
| `sandbox.filesystem.allowRead` | 普通文件（`Any file`） | Re-open reading inside a region denyRead blocks |
| `sandbox.filesystem.allowWrite` | 普通文件（`Any file`） | Add paths sandboxed commands can write to |
| `sandbox.filesystem.denyRead` | 普通文件（`Any file`） | Block sandboxed commands from reading specific paths |
| `sandbox.filesystem.denyWrite` | 普通文件（`Any file`） | Block sandboxed commands from writing to specific paths |
| `sandbox.filesystem.disabled` | 用户/托管（`User or managed`） | Turn off filesystem isolation while keeping network isolation |
| `sandbox.ignoreViolations` | 普通文件（`Any file`） | Silence violation reports for paths a command is expected to probe |
| `sandbox.network` | 普通文件（`Any file`） | Control which hosts, ports, and sockets sandboxed commands reach |
| `sandbox.network.allowAllUnixSockets` | 普通文件（`Any file`） | Let sandboxed commands connect to every Unix socket |
| `sandbox.network.allowedDomains` | 普通文件（`Any file`） | Pre-allow domains so sandboxed commands don’t prompt for them |
| `sandbox.network.allowLocalBinding` | 普通文件（`Any file`） | Let sandboxed commands listen on network ports and connect to localhost on macOS |
| `sandbox.network.allowMachLookup` | 普通文件（`Any file`） | Let macOS sandboxed tools like the iOS Simulator or Playwright reach their XPC services |
| `sandbox.network.allowManagedDomainsOnly` | 仅托管（`Managed`） | Lock the network allowlist to managed settings |
| `sandbox.network.allowUnixSockets` | 普通文件（`Any file`） | List Unix socket paths sandboxed commands can use on macOS |
| `sandbox.network.deniedDomains` | 普通文件（`Any file`） | Block domains for sandboxed commands, even inside an allowed wildcard |
| `sandbox.network.httpProxyPort` | 普通文件（`Any file`） | Route sandbox HTTP traffic through your own proxy |
| `sandbox.network.socksProxyPort` | 普通文件（`Any file`） | Route sandbox SOCKS traffic through your own proxy |
| `sandbox.network.strictAllowlist` | 用户/托管（`User or managed`） | Deny hosts outside the allowlist instead of prompting |
| `sandbox.network.tlsTerminate` | 用户/托管（`User or managed`） | Have the sandbox proxy terminate TLS so it can read HTTPS requests |
| `sandbox.ripgrep` | 用户/托管（`User or managed`） | Use your own ripgrep binary inside the sandbox |
| `sandbox.socatPath` | 仅托管（`Managed`） | Point the sandbox proxy at a socat binary outside PATH |

---

## 13. 参考资料

本文核验日期：2026-10-12；版本快照：Claude Code `2.1.296`。

- Settings files and precedence：https://code.claude.com/docs/en/settings
- 全量 Settings Reference：https://code.claude.com/docs/en/settings-reference
- Environment variables：https://code.claude.com/docs/en/env-vars
- Model configuration：https://code.claude.com/docs/en/model-config
- Permission modes：https://code.claude.com/docs/en/permission-modes
- Sandboxing：https://code.claude.com/docs/en/sandboxing
- Status line：https://code.claude.com/docs/en/statusline
- Keybindings：https://code.claude.com/docs/en/keybindings
- Memory / CLAUDE.md / AGENTS.md：https://code.claude.com/docs/en/memory
- 官方 JSON Schema：https://json.schemastore.org/claude-code-settings.json
- 官方 Changelog：https://code.claude.com/docs/en/changelog

Settings Reference 会随着 Claude Code 发布持续增加配置键；更新本文时应重新抓取官方索引，而不是沿用旧文章中的“完整配置表”。
