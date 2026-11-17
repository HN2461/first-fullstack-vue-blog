---
title: "第 04 篇：Claude Code 设置、CLAUDE.md 与个性化配置（程序员深度版）"
slug: "ai-agent-claudecode-claudecode-76aa3c89"
summary: "按 2026-11-17 官方设置页重建 249 项配置索引，补充目录外写入限制、无人值守拒绝、沙箱审批默认值、Code Mode、Fable 5.2，并移除已废弃状态栏配置的推荐。"
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
updatedAt: "2026-11-17T15:21:29.523Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 04 篇：Claude Code 设置、CLAUDE.md 与个性化配置（程序员深度版）

> 本文按 2026-11-17 官方 Settings Reference 与 2.1.326 发布说明复核，重点说明设置作用域、有效默认值和迁移影响。第 12 节的 249 项索引来自本次实际获取的官方页面，版本门槛与例外见各键原文。


> 版本边界（2026-11-17）：npm `latest/next=2.1.326`，`stable=2.1.311`；本机只读核验为 `2.1.319`。本文以当日直接获取的官方文档、`v2.1.314` 至 `v2.1.326` 发布记录和 npm 信息更新；本机帮助只验证 2.1.319 已有入口，未执行客户端升级或界面操作。`latest` 是最新正式发布渠道，不能与 npm 的 `stable` 标签混为一谈。

[[toc]]

## 0. 当前配置迁移：先修正默认值，再查完整索引

本轮从官方 Settings Reference 重新提取 **249 个索引项**，下文已替换旧 244 项表格。索引包含普通 settings、managed 和 `~/.claude.json` 字段，不能整表复制到一个文件；新增进索引不代表本次 CLI 才首次支持。

| 配置 / 旧用法 | 2026-11-17 核对结果 | 使用边界 |
|---|---|---|
| `sandbox.autoAllowBashIfSandboxed` | 当前默认 false；官方条目注明 2.1.324 之前为 true，2.1.325 正式发布说明也确认变化 | false 使用普通权限流程；true 是显式选择 auto-allow |
| `permissions.blockWritesOutsideWorkingDirectories` | 2.1.314+，限制 Write/Edit/NotebookEdit 写入工作目录外 | 不限制 shell、MCP、hook 程序；存在 Claude 自身文件例外；可能影响 EnterWorktree/ExitWorktree |
| `permissions.denyInsteadOfPrompting` | 2.1.319+，本来要询问的动作直接拒绝 | 用户/managed/--settings 生效；不是批准开关，也不跳过项目信任 |
| `idleCompaction` | 满足条件时默认开启的空闲压缩 | 默认 200K 门槛、一小时 TTL、空闲约一小时；不是每个会话都触发 |
| `sandbox.allowNestedUserNamespaces` | Linux/WSL2 的嵌套 user namespace 例外，默认 false | true 会削弱隔离边界，仓库设置不能自行打开；不要作为浏览器启动失败的通用修复 |
| `disableRemotePreviewScripts` | Desktop SSH/WSL HTML 预览脚本控制，CLI 忽略 | managed；Desktop 版本门槛看索引链接 |
| `sshHostCommands` | Desktop 通过本机命令创建 SSH 目标 | 用户/managed；与 CLI 后端版本及 Desktop 平台支持分别核对 |
| `subagentStatusLine` | 2.1.323 已移除 | 旧文件可继续加载但不再定制子代理行；使用默认显示 |

### 0.1 工作目录边界要落实到正确工具

`blockWritesOutsideWorkingDirectories=true` 在加载它的任一配置源为 true 时生效，包括 bypassPermissions；另一层 false 不能解除。它还阻止修改可解除限制的 Claude 设置文件，部分计划文件、scratchpad、自动记忆等仍有明确例外。Bash/PowerShell 与 MCP 的写入需要各自规则或 OS 沙箱，不能只靠文件工具设置。

### 0.2 Code Mode、模型与渠道

Code Mode 用 `CLAUDE_CODE_EXPERIMENTAL_CODE_MODE=1` 在 shell/用户 env 中显式试用，项目不能启用，managed 可用 0 禁止。它需要 2.1.323+、支持的原生构建和直接 Anthropic 连接；默认关闭。详细限制见第二篇，不能在网关模板中默认塞入这个变量。

2.1.321 加入 Fable 5.2，`fable` 当前通常解析到该模型；网关是否提供 `claude-fable-5-2` 必须单独确认。Opus 4.8 的 fast mode 在 2026-10-30 已弃用，官方计划 2026-11-30 移除，届时请求将报错而非回退标准速度；该说明只针对 fast mode，不等于 Opus 4.8 普通模型同时退役。

### 0.3 升级后如何验证配置确实保存

2.1.326 会提示无法写入的权限规则/目录设置文件、会话中损坏的 settings，以及被忽略的插件元数据。检查 `/status`、`/config`、`/permissions` 的有效状态；出现保存警告时先修复配置文件，不能以菜单里曾经选中过为依据。

本轮直接获取的官方配置条目比文档检索缓存更新；`autoAllowBashIfSandboxed` 以当前页面的 false 和正式发布说明为准，不采用缓存中的旧 true 默认值。

资料：[配置参考](https://code.claude.com/docs/en/settings-reference)、[2.1.314](https://github.com/anthropics/claude-code/releases/tag/v2.1.314)、[2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323)、[2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325)、[2.1.326](https://github.com/anthropics/claude-code/releases/tag/v2.1.326)。


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
    "autoAllowBashIfSandboxed": false,
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

当前示例显式使用 false，保留普通权限审批；需要 auto-allow 才改为 true。托管启用 sandbox 时，true 必须放在最高优先级的 managed 来源，不能只在低优先级用户配置覆盖。

常用键包括：`sandbox.enabled`、`failIfUnavailable`、`autoAllowBashIfSandboxed`、`excludedCommands`、`allowUnsandboxedCommands`、`filesystem.*`、`network.*`、`credentials.*`。macOS、Linux 和 WSL 支持 Bash sandbox 的平台能力不同；**Claude Code sandbox 不在原生 Windows 上运行**，如果设置 `failIfUnavailable`，原生 Windows 会在启动时退出。需要隔离时应使用 WSL2 或容器，并且不要把某个平台能拦截的路径当成所有平台都能拦截。组织托管的 `allowManagedReadPathsOnly`、`allowManagedDomainsOnly`、`strictAllowlist` 和凭据注入策略可能覆盖个人配置。

凭据注入 (`sandbox.credentials.files/envVars/awsPairs/sigv4`) 要求明确掩码字段和失败行为；默认不要开启明文注入，也不要把读取出的秘密打印到 transcript。

---

## 5. 模型、effort、上下文与自动压缩

### 5.1 当前模型和 alias

官方当前模型页列出 Anthropic API 上的 Opus 5.5、Sonnet 5.5、Haiku 5.5，以及 Fable 5.2（旧 Fable ID 的支持与迁移以实际账号为准）；第三方 Provider 的实际 ID 可能不同。常用入口：

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

`statusLine` 可接收模型、上下文和成本等状态；`subagentStatusLine` 已在 2.1.323 移除，不再使用旧子代理状态行脚本；不要在状态栏打印 Key 或完整路径。`/statusline` 可以让 Claude 根据当前 shell 自动生成建议。`keybindings.json` 用于快捷键，`/keybindings` 打开编辑；Vim 输入模式通过 `editorMode` 和 `vimInsertModeRemaps` 配置。

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

下表由 2026-11-17 直接获取的官方 Settings Reference 生成，包含 **249 个索引项**。键名链接到原文，可查默认值、类型、版本和例外。Any file 表示普通配置层都可使用，Managed 只允许组织管理，Global config 属于 `~/.claude.json`。已移除字段从当前表撤下；保留的历史兼容字段仍按对应说明处理。

### Model and responses（23 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`advisorModel`](https://code.claude.com/docs/en/settings-reference#advisormodel) | Any file | Pick which model answers when Claude asks the [advisor tool](https://code.claude.com/docs/en/advisor.md) |
| [`alwaysThinkingEnabled`](https://code.claude.com/docs/en/settings-reference#alwaysthinkingenabled) | Any file | Turn [extended thinking](https://code.claude.com/docs/en/model-config.md#extended-thinking) off for every session |
| [`availableModels`](https://code.claude.com/docs/en/settings-reference#availablemodels) | Any file | [Restrict which models](https://code.claude.com/docs/en/model-config.md#restrict-model-selection) people can pick |
| [`availableModelsMatch`](https://code.claude.com/docs/en/settings-reference#availablemodelsmatch) | Managed | Make each `availableModels` model ID entry [permit only the version it names](https://code.claude.com/docs/en/model-config.md#block-specific-models-or-versions) |
| [`deniedModels`](https://code.claude.com/docs/en/settings-reference#deniedmodels) | Managed | [Block specific models](https://code.claude.com/docs/en/model-config.md#block-specific-models-or-versions), even ones `availableModels` permits |
| [`effortLevel`](https://code.claude.com/docs/en/settings-reference#effortlevel) | Any file | Set a default [effort level](https://code.claude.com/docs/en/model-config.md#adjust-effort-level) for models without a saved level of their own |
| [`enforceAvailableModels`](https://code.claude.com/docs/en/settings-reference#enforceavailablemodels) | Any file | Keep the [`/model` Default choice](https://code.claude.com/docs/en/model-config#enforce-the-allowlist-for-the-default-model) inside your `availableModels` allowlist |
| [`fallbackModel`](https://code.claude.com/docs/en/settings-reference#fallbackmodel) | Any file | Name [backup models](https://code.claude.com/docs/en/model-config.md#fallback-model-chains) for when the primary is overloaded |
| [`fastMode`](https://code.claude.com/docs/en/settings-reference#fastmode) | Any file | Turn [fast mode](https://code.claude.com/docs/en/fast-mode.md) on for sessions where it's available |
| [`fastModePerSessionOptIn`](https://code.claude.com/docs/en/settings-reference#fastmodepersessionoptin) | Any file | Require people to turn [fast mode](https://code.claude.com/docs/en/fast-mode.md) on each session |
| [`language`](https://code.claude.com/docs/en/settings-reference#language) | Any file | Have Claude respond in a language other than English |
| [`maxEffortLevel`](https://code.claude.com/docs/en/settings-reference#maxeffortlevel) | Any file | Cap the [effort level](https://code.claude.com/docs/en/model-config.md#adjust-effort-level) for every model or per model, on every provider |
| [`model`](https://code.claude.com/docs/en/settings-reference#model) | Any file | Change the [model](https://code.claude.com/docs/en/model-config.md#set-a-default-model-for-new-sessions) Claude Code starts with |
| [`modelOverrides`](https://code.claude.com/docs/en/settings-reference#modeloverrides) | Any file | [Map model IDs](https://code.claude.com/docs/en/model-config.md#override-model-ids-per-version) to your provider's IDs, such as Bedrock ARNs |
| [`modelPicker`](https://code.claude.com/docs/en/settings-reference#modelpicker) | User or managed | Choose which models the [`/model` picker](https://code.claude.com/docs/en/model-config#available-models) lists, in your own order and with your own labels |
| [`modelPricing`](https://code.claude.com/docs/en/settings-reference#modelpricing) | Managed | Report spend at your organization's contracted rates instead of list price |
| [`modelSettings`](https://code.claude.com/docs/en/settings-reference#modelsettings) | Any file | Keep a saved [effort level](https://code.claude.com/docs/en/model-config.md#adjust-effort-level) or [auto-compact window](https://code.claude.com/docs/en/model-config.md#set-the-auto-compact-window) per model, or cap one model's effort |
| [`outputStyle`](https://code.claude.com/docs/en/settings-reference#outputstyle) | Any file | Change Claude's role, tone, and output format with an [output style](https://code.claude.com/docs/en/output-styles.md) |
| [`promptCacheTtl`](https://code.claude.com/docs/en/settings-reference#promptcachettl) | Any file | Choose the [prompt cache lifetime](https://code.claude.com/docs/en/prompt-caching.md#cache-lifetime) for the main conversation |
| [`showThinkingSummaries`](https://code.claude.com/docs/en/settings-reference#showthinkingsummaries) | Any file | See summaries of Claude's [thinking](https://code.claude.com/docs/en/model-config.md#extended-thinking) instead of a collapsed stub |
| [`subagentPromptCacheTtl`](https://code.claude.com/docs/en/settings-reference#subagentpromptcachettl) | Any file | Choose the [prompt cache lifetime](https://code.claude.com/docs/en/prompt-caching.md#cache-lifetime) for subagents and other requests outside the main conversation |
| [`switchModelsOnFlag`](https://code.claude.com/docs/en/settings-reference#switchmodelsonflag) | Any file | Switch models automatically or pause when a [safety classifier](https://code.claude.com/docs/en/model-config.md#ask-before-switching) flags a request |
| [`ultracode`](https://code.claude.com/docs/en/settings-reference#ultracode) | Any file | Have Claude plan a [workflow](https://code.claude.com/docs/en/workflows.md#let-claude-decide-with-ultracode) for each substantive task without being asked |

### Agents, sessions, and worktrees（12 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`agent`](https://code.claude.com/docs/en/settings-reference#agent) | Any file | Start every session as a named [subagent](https://code.claude.com/docs/en/sub-agents.md) with its prompt, tools, and model |
| [`crossSessionInbound`](https://code.claude.com/docs/en/settings-reference#crosssessioninbound) | Any file | Choose whether Claude Code delivers [messages from your other sessions](https://code.claude.com/docs/en/cross-session-messaging.md#control-inbound-messages), shows a notice without delivering them, or refuses them |
| [`disableAgentView`](https://code.claude.com/docs/en/settings-reference#disableagentview) | Any file | Turn off background agents and [agent view](https://code.claude.com/docs/en/agent-view.md) |
| [`isolatePeerMachines`](https://code.claude.com/docs/en/settings-reference#isolatepeermachines) | Any file | Ask you before Claude [messages one of your sessions on another machine](https://code.claude.com/docs/en/cross-session-messaging.md#require-approval-for-cross-machine-messages) |
| [`processWrapper`](https://code.claude.com/docs/en/settings-reference#processwrapper) | User or managed | Run Claude Code's background processes through a [corporate launcher](https://code.claude.com/docs/en/corporate-launcher.md) on macOS and Linux |
| [`teammateMode`](https://code.claude.com/docs/en/settings-reference#teammatemode) | Any file | Choose how [agent team teammates display](https://code.claude.com/docs/en/agent-teams.md#choose-a-display-mode) |
| [`worktree`](https://code.claude.com/docs/en/settings-reference#worktree) | Any file | Configure how Claude Code creates git [worktrees](https://code.claude.com/docs/en/worktrees.md) |
| [`worktree.baseRef`](https://code.claude.com/docs/en/settings-reference#worktree-baseref) | Any file | Branch new [worktrees](https://code.claude.com/docs/en/worktrees.md) from the remote default branch or your local HEAD |
| [`worktree.bgIsolation`](https://code.claude.com/docs/en/settings-reference#worktree-bgisolation) | Any file | Let background sessions edit the working copy without a [worktree](https://code.claude.com/docs/en/worktrees.md) |
| [`worktree.location`](https://code.claude.com/docs/en/settings-reference#worktree-location) | User | Choose where [Desktop SSH sessions](https://code.claude.com/docs/en/desktop.md#ssh-sessions) create their worktrees on a remote machine |
| [`worktree.sparsePaths`](https://code.claude.com/docs/en/settings-reference#worktree-sparsepaths) | Any file | Check out only the directories you need in each [worktree](https://code.claude.com/docs/en/worktrees.md) |
| [`worktree.symlinkDirectories`](https://code.claude.com/docs/en/settings-reference#worktree-symlinkdirectories) | Any file | Symlink large directories into each [worktree](https://code.claude.com/docs/en/worktrees.md) instead of duplicating them |

### Remote, desktop, and notifications（15 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`agentPushNotifEnabled`](https://code.claude.com/docs/en/settings-reference#agentpushnotifenabled) | Any file | Let Claude send a [push notification to your phone](https://code.claude.com/docs/en/remote-control.md#mobile-push-notifications) when it decides to |
| [`awaySummaryEnabled`](https://code.claude.com/docs/en/settings-reference#awaysummaryenabled) | Any file | Turn off the [session recap](https://code.claude.com/docs/en/interactive-mode.md#session-recap) shown when you come back to the terminal |
| [`disableArtifact`](https://code.claude.com/docs/en/settings-reference#disableartifact) | Any file | Deprecated; use `enableArtifact` to turn the [Artifact tool](https://code.claude.com/docs/en/artifacts.md) off |
| [`disableDeepLinkRegistration`](https://code.claude.com/docs/en/settings-reference#disabledeeplinkregistration) | Any file | Stop Claude Code from registering the [`claude-cli://` handler](https://code.claude.com/docs/en/deep-links) |
| [`disableDesktopLocalSessions`](https://code.claude.com/docs/en/settings-reference#disabledesktoplocalsessions) | Managed | Turn off [Desktop Code sessions](https://code.claude.com/docs/en/desktop.md#local-sessions-on-managed-devices) that run on the device, leaving SSH to other hosts and cloud |
| [`disableRemoteControl`](https://code.claude.com/docs/en/settings-reference#disableremotecontrol) | Any file | Turn off [Remote Control](https://code.claude.com/docs/en/remote-control.md) everywhere it can start |
| [`disableRemotePreviewScripts`](https://code.claude.com/docs/en/settings-reference#disableremotepreviewscripts) | Managed | Turn off scripts in the [desktop](https://code.claude.com/docs/en/desktop.md#preview-html-files-in-ssh-and-wsl-sessions) app's HTML previews in SSH and WSL sessions |
| [`enableArtifact`](https://code.claude.com/docs/en/settings-reference#enableartifact) | Any file | Turn the [Artifact tool](https://code.claude.com/docs/en/artifacts.md) off with a `false` in any file; no file can turn it back on |
| [`inputNeededNotifEnabled`](https://code.claude.com/docs/en/settings-reference#inputneedednotifenabled) | Any file | Get a [push notification](https://code.claude.com/docs/en/remote-control.md#mobile-push-notifications) when Claude is waiting on you |
| [`preferredNotifChannel`](https://code.claude.com/docs/en/settings-reference#preferrednotifchannel) | Any file | Choose a [terminal bell or desktop notification](https://code.claude.com/docs/en/terminal-config.md#get-a-terminal-bell-or-notification) for task completion |
| [`remote.defaultEnvironmentId`](https://code.claude.com/docs/en/settings-reference#remote-defaultenvironmentid) | Any file | Pick the default [cloud environment](https://code.claude.com/docs/en/cloud-environments.md) for `claude --cloud`; a self-hosted `ccpool_` ID is read only from user and managed settings and `--settings` |
| [`remoteControlAtStartup`](https://code.claude.com/docs/en/settings-reference#remotecontrolatstartup) | Any file | Connect [Remote Control](https://code.claude.com/docs/en/remote-control.md#enable-remote-control-for-all-sessions) automatically when a session starts |
| [`sshConfigs`](https://code.claude.com/docs/en/settings-reference#sshconfigs) | User or managed | Add [SSH connections](https://code.claude.com/docs/en/desktop.md#pre-configure-ssh-connections-for-your-team) to the Desktop environment selector |
| [`sshHostAllowlist`](https://code.claude.com/docs/en/settings-reference#sshhostallowlist) | Managed | Limit which hosts [Desktop SSH sessions](https://code.claude.com/docs/en/desktop.md#restrict-which-ssh-hosts-users-can-connect-to) can reach |
| [`sshHostCommands`](https://code.claude.com/docs/en/settings-reference#sshhostcommands) | User or managed | Add [SSH connections whose host comes from a command](https://code.claude.com/docs/en/desktop.md#create-an-ssh-connection-from-a-command) to the Desktop environment selector |

### MCP（10 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`allowAllClaudeAiMcps`](https://code.claude.com/docs/en/settings-reference#allowallclaudeaimcps) | Managed | Load the [claude.ai connectors](https://code.claude.com/docs/en/mcp.md) Claude Code fetches itself alongside a deployed [`managed-mcp.json`](https://code.claude.com/docs/en/managed-mcp#exclusive-control-with-managed-mcp-json) |
| [`allowClaudeInChromeWithManagedMcp`](https://code.claude.com/docs/en/settings-reference#allowclaudeinchromewithmanagedmcp) | Managed | Let the built-in [Claude in Chrome](https://code.claude.com/docs/en/chrome.md) server run alongside a deployed [`managed-mcp.json`](https://code.claude.com/docs/en/managed-mcp#exclusive-control-with-managed-mcp-json) |
| [`allowedMcpServers`](https://code.claude.com/docs/en/settings-reference#allowedmcpservers) | Any file | Allowlist which [MCP servers](https://code.claude.com/docs/en/mcp.md) users can add |
| [`allowManagedMcpServersOnly`](https://code.claude.com/docs/en/settings-reference#allowmanagedmcpserversonly) | Managed | Make the managed [MCP](https://code.claude.com/docs/en/mcp.md) allowlist the only one that applies |
| [`deniedMcpServers`](https://code.claude.com/docs/en/settings-reference#deniedmcpservers) | Any file | Block specific [MCP servers](https://code.claude.com/docs/en/mcp.md) by URL, command, or name |
| [`disableClaudeAiConnectors`](https://code.claude.com/docs/en/settings-reference#disableclaudeaiconnectors) | Any file | Turn off [claude.ai connectors](https://code.claude.com/docs/en/mcp.md#disable-claude-ai-connectors) so Claude Code doesn't fetch them |
| [`disabledMcpjsonServers`](https://code.claude.com/docs/en/settings-reference#disabledmcpjsonservers) | Any file | Reject specific servers from a project's [`.mcp.json`](https://code.claude.com/docs/en/mcp#project-scope) |
| [`enableAllProjectMcpServers`](https://code.claude.com/docs/en/settings-reference#enableallprojectmcpservers) | Any file | Approve every server in project [`.mcp.json`](https://code.claude.com/docs/en/mcp#project-server-approvals-and-workspace-trust) files without a prompt |
| [`enabledMcpjsonServers`](https://code.claude.com/docs/en/settings-reference#enabledmcpjsonservers) | Any file | Approve specific servers from a project's [`.mcp.json`](https://code.claude.com/docs/en/mcp#project-server-approvals-and-workspace-trust) |
| [`managedMcpServers`](https://code.claude.com/docs/en/settings-reference#managedmcpservers) | Managed | Provide remote [MCP servers](https://code.claude.com/docs/en/managed-mcp.md#provide-servers-through-managed-settings) to every user alongside the ones they add |

### Plugins and skills（22 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`allowedChannelPlugins`](https://code.claude.com/docs/en/settings-reference#allowedchannelplugins) | Managed | Replace the default allowlist of [channel plugins](https://code.claude.com/docs/en/channels.md#restrict-which-channel-plugins-can-run) that can push messages |
| [`appendPlugins`](https://code.claude.com/docs/en/settings-reference#appendplugins) | User or managed | Run your organization's [mods](https://code.claude.com/docs/en/plugins/mods/admin.md) after every mod a user installs |
| [`blockedMarketplaces`](https://code.claude.com/docs/en/settings-reference#blockedmarketplaces) | Managed | Block [plugin marketplace](https://code.claude.com/docs/en/plugins/overview.md) sources for your organization |
| [`channelsEnabled`](https://code.claude.com/docs/en/settings-reference#channelsenabled) | Managed | Allow [channels](https://code.claude.com/docs/en/channels.md#enable-channels-for-your-organization) for your organization |
| [`disableBundledSkills`](https://code.claude.com/docs/en/settings-reference#disablebundledskills) | Any file | Turn off the [skills](https://code.claude.com/docs/en/skills.md#bundled-skills) and [workflows](https://code.claude.com/docs/en/workflows.md) included with Claude Code |
| [`disableCommandPluginSources`](https://code.claude.com/docs/en/settings-reference#disablecommandpluginsources) | Managed | Block [plugins](https://code.claude.com/docs/en/plugins/overview.md) that install by running a marketplace-declared command |
| [`disableSkillShellExecution`](https://code.claude.com/docs/en/settings-reference#disableskillshellexecution) | Any file | Stop [skills](https://code.claude.com/docs/en/skills.md) and custom commands from running inline shell |
| [`enabledPlugins`](https://code.claude.com/docs/en/settings-reference#enabledplugins) | Any file | Turn individual [plugins](https://code.claude.com/docs/en/plugins/overview.md) on or off per scope |
| [`extraKnownMarketplaces`](https://code.claude.com/docs/en/settings-reference#extraknownmarketplaces) | Any file | Register [marketplaces](https://code.claude.com/docs/en/plugins/overview.md) for a repository or an organization |
| [`pluginConfigs`](https://code.claude.com/docs/en/settings-reference#pluginconfigs) | User or managed | Store the answers you gave a [plugin](https://code.claude.com/docs/en/plugins/overview.md)'s configuration dialog |
| [`pluginSuggestionMarketplaces`](https://code.claude.com/docs/en/settings-reference#pluginsuggestionmarketplaces) | Managed | Choose which [marketplaces](https://code.claude.com/docs/en/plugins/org.md#restrict-what-users-can-install) can surface plugin install suggestions in `/plugin` |
| [`pluginTrustMessage`](https://code.claude.com/docs/en/settings-reference#plugintrustmessage) | Managed | Add your own text to the [plugin](https://code.claude.com/docs/en/plugins/overview.md) trust warning |
| [`prependPlugins`](https://code.claude.com/docs/en/settings-reference#prependplugins) | User or managed | Run your organization's [mods](https://code.claude.com/docs/en/plugins/mods/admin.md) before every mod a user installs |
| [`skillOverrides`](https://code.claude.com/docs/en/settings-reference#skilloverrides) | Any file | [Hide or collapse a skill](https://code.claude.com/docs/en/skills.md#override-skill-visibility-from-settings) without editing its SKILL.md |
| [`strictKnownMarketplaces`](https://code.claude.com/docs/en/settings-reference#strictknownmarketplaces) | Managed | Allowlist the [marketplace](https://code.claude.com/docs/en/plugins/overview.md) sources users can add and install from |
| [`strictPluginOnlyCustomization`](https://code.claude.com/docs/en/settings-reference#strictpluginonlycustomization) | Managed | Block [skills](https://code.claude.com/docs/en/skills.md), [agents](https://code.claude.com/docs/en/sub-agents.md), [hooks](https://code.claude.com/docs/en/hooks.md), and [MCP servers](https://code.claude.com/docs/en/mcp.md) from user and project sources |
| [`strictPluginOnlyCustomization.agents`](https://code.claude.com/docs/en/settings-reference#strictpluginonlycustomization-agents) | Managed | Block [agents](https://code.claude.com/docs/en/sub-agents.md) from user and project sources |
| [`strictPluginOnlyCustomization.hooks`](https://code.claude.com/docs/en/settings-reference#strictpluginonlycustomization-hooks) | Managed | Block [hooks](https://code.claude.com/docs/en/hooks.md) from user and project sources |
| [`strictPluginOnlyCustomization.mcp`](https://code.claude.com/docs/en/settings-reference#strictpluginonlycustomization-mcp) | Managed | Block [MCP servers](https://code.claude.com/docs/en/mcp.md) from user and project sources |
| [`strictPluginOnlyCustomization.skills`](https://code.claude.com/docs/en/settings-reference#strictpluginonlycustomization-skills) | Managed | Block [skills](https://code.claude.com/docs/en/skills.md) from user and project sources |
| [`syncClaudeAiPlugins`](https://code.claude.com/docs/en/settings-reference#syncclaudeaiplugins) | User, local, or managed | Stop loading the [plugins enabled on your claude.ai account](https://code.claude.com/docs/en/plugins/loading.md#synced-plugins) and stop downloading new ones |
| [`syncClaudeAiSkills`](https://code.claude.com/docs/en/settings-reference#syncclaudeaiskills) | User, local, or managed | Stop loading the [skills enabled on your claude.ai account](https://code.claude.com/docs/en/skills.md#how-synced-skills-behave) and stop downloading new ones |

### Hooks and automation（9 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`allowedHttpHookUrls`](https://code.claude.com/docs/en/settings-reference#allowedhttphookurls) | Any file | Limit which URLs [HTTP hooks](https://code.claude.com/docs/en/hooks.md) can target |
| [`allowManagedHooksOnly`](https://code.claude.com/docs/en/settings-reference#allowmanagedhooksonly) | Managed | Run only the [hooks](https://code.claude.com/docs/en/hooks.md) your organization deploys |
| [`disableAllHooks`](https://code.claude.com/docs/en/settings-reference#disableallhooks) | Any file | Turn off [hooks](https://code.claude.com/docs/en/hooks.md), a custom [status line](https://code.claude.com/docs/en/statusline.md), and a custom [`@` file suggestion](https://code.claude.com/docs/en/interactive-mode#quick-commands) command at once |
| [`disableWorkflows`](https://code.claude.com/docs/en/settings-reference#disableworkflows) | Any file | Turn [dynamic workflows](https://code.claude.com/docs/en/workflows.md) off for everyone; use `enableWorkflows` for yourself |
| [`enableWorkflows`](https://code.claude.com/docs/en/settings-reference#enableworkflows) | Any file | Turn [dynamic workflows](https://code.claude.com/docs/en/workflows.md) on or off against your plan's default |
| [`hooks`](https://code.claude.com/docs/en/settings-reference#hooks) | Any file | Run your own commands as [hooks](https://code.claude.com/docs/en/hooks.md) at points in Claude Code's lifecycle |
| [`httpHookAllowedEnvVars`](https://code.claude.com/docs/en/settings-reference#httphookallowedenvvars) | Any file | Limit which env vars [HTTP hooks](https://code.claude.com/docs/en/hooks.md) can put in headers |
| [`workflowKeywordTriggerEnabled`](https://code.claude.com/docs/en/settings-reference#workflowkeywordtriggerenabled) | Any file | Let the word `ultracode` in a prompt start a [workflow](https://code.claude.com/docs/en/workflows.md); set `false` to type it without starting one |
| [`workflowSizeGuideline`](https://code.claude.com/docs/en/settings-reference#workflowsizeguideline) | Any file | Set the agent count Claude aims for in [dynamic workflows](https://code.claude.com/docs/en/workflows.md) |

### Authentication and providers（10 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`allowedProviders`](https://code.claude.com/docs/en/settings-reference#allowedproviders) | Managed | Limit which [API providers](https://code.claude.com/docs/en/third-party-integrations.md) a machine may use |
| [`apiKeyHelper`](https://code.claude.com/docs/en/settings-reference#apikeyhelper) | Any file | Generate the [API credential](https://code.claude.com/docs/en/authentication.md#credential-management) with your own command |
| [`awsAuthRefresh`](https://code.claude.com/docs/en/settings-reference#awsauthrefresh) | Any file | Refresh expired [Bedrock credentials](https://code.claude.com/docs/en/amazon-bedrock.md#advanced-credential-configuration) in `.aws` with your own command |
| [`awsCredentialExport`](https://code.claude.com/docs/en/settings-reference#awscredentialexport) | Any file | Supply [Bedrock credentials](https://code.claude.com/docs/en/amazon-bedrock.md#advanced-credential-configuration) as JSON from your own command |
| [`forceLoginGatewayUrl`](https://code.claude.com/docs/en/settings-reference#forcelogingatewayurl) | User or managed | Set the [gateway URL](https://code.claude.com/docs/en/claude-apps-gateway#set-the-gateway-url) the login screen connects to |
| [`forceLoginMethod`](https://code.claude.com/docs/en/settings-reference#forceloginmethod) | Any file | [Restrict login](https://code.claude.com/docs/en/authentication.md#restrict-login-to-your-organization) to claude.ai, Claude Console, or a [cloud gateway](https://code.claude.com/docs/en/claude-apps-gateway) |
| [`forceLoginOrgUUID`](https://code.claude.com/docs/en/settings-reference#forceloginorguuid) | Any file | [Pin claude.ai logins to your organization](https://code.claude.com/docs/en/authentication.md#restrict-login-to-your-organization); only managed settings enforce it |
| [`gatewayInternalNetworks`](https://code.claude.com/docs/en/settings-reference#gatewayinternalnetworks) | Managed | Let `/login` reach a [cloud gateway](https://code.claude.com/docs/en/claude-apps-gateway#allow-a-gateway-on-public-address-space-you-own) on public IPv4 space your organization uses internally |
| [`gcpAuthRefresh`](https://code.claude.com/docs/en/settings-reference#gcpauthrefresh) | Any file | Refresh [Google Cloud credentials](https://code.claude.com/docs/en/google-vertex-ai.md#advanced-credential-configuration) with your own command |
| [`otelHeadersHelper`](https://code.claude.com/docs/en/settings-reference#otelheadershelper) | Any file | Generate rotating [OpenTelemetry](https://code.claude.com/docs/en/monitoring-usage.md#dynamic-headers) headers with your own command |

### Permission settings（17 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`allowManagedPermissionRulesOnly`](https://code.claude.com/docs/en/settings-reference#allowmanagedpermissionrulesonly) | Managed | Make [managed settings](https://code.claude.com/docs/en/managed-settings.md) the only settings source of [permission rules](https://code.claude.com/docs/en/permissions.md#managed-settings) |
| [`autoMode`](https://code.claude.com/docs/en/settings-reference#automode) | User or managed | Add your own allow and deny rules to the [auto mode](https://code.claude.com/docs/en/permission-modes.md#eliminate-prompts-with-auto-mode) classifier |
| [`autoMode.classifyAllShell`](https://code.claude.com/docs/en/settings-reference#automode-classifyallshell) | User or managed | Send every shell command through the [auto mode classifier](https://code.claude.com/docs/en/permission-modes.md#what-the-classifier-blocks-by-default), even ones a narrow allow rule matches |
| [`disableAutoMode`](https://code.claude.com/docs/en/settings-reference#disableautomode) | Any file | Remove [auto mode](https://code.claude.com/docs/en/permission-modes.md#eliminate-prompts-with-auto-mode) from the permission mode cycle |
| [`permissions`](https://code.claude.com/docs/en/settings-reference#permissions) | Any file | Set allow, ask, and deny rules and the default [permission mode](https://code.claude.com/docs/en/permission-modes.md) |
| [`permissions.additionalDirectories`](https://code.claude.com/docs/en/settings-reference#permissions-additionaldirectories) | Any file | Give Claude file access to [directories outside the current one](https://code.claude.com/docs/en/permissions.md#working-directories) |
| [`permissions.allow`](https://code.claude.com/docs/en/settings-reference#permissions-allow) | Any file | Approve listed [tool uses](https://code.claude.com/docs/en/permissions.md#permission-rule-syntax) without a prompt |
| [`permissions.ask`](https://code.claude.com/docs/en/settings-reference#permissions-ask) | Any file | Always prompt before listed [tool uses](https://code.claude.com/docs/en/permissions.md#permission-rule-syntax) |
| [`permissions.blockReadsOutsideWorkingDirectories`](https://code.claude.com/docs/en/settings-reference#permissions-blockreadsoutsideworkingdirectories) | Any file | Make the file tools refuse reads outside the [working directories](https://code.claude.com/docs/en/permissions.md#working-directories) in every permission mode |
| [`permissions.blockWritesOutsideWorkingDirectories`](https://code.claude.com/docs/en/settings-reference#permissions-blockwritesoutsideworkingdirectories) | Any file | Make the `Write`, `Edit`, and `NotebookEdit` tools refuse paths outside the [working directories](https://code.claude.com/docs/en/permissions.md#working-directories) in every permission mode, apart from [some of Claude Code's own files](#what-the-write-block-refuses-and-what-stays-writable) |
| [`permissions.defaultMode`](https://code.claude.com/docs/en/settings-reference#permissions-defaultmode) | Any file | Set the default [permission mode](https://code.claude.com/docs/en/permission-modes.md#which-mode-a-session-starts-in) for new sessions |
| [`permissions.deny`](https://code.claude.com/docs/en/settings-reference#permissions-deny) | Any file | Block listed [tool uses](https://code.claude.com/docs/en/permissions.md#permission-rule-syntax), including reads of files that hold secrets |
| [`permissions.denyInsteadOfPrompting`](https://code.claude.com/docs/en/settings-reference#permissions-denyinsteadofprompting) | User or managed | Deny tool calls that would wait on a [permission prompt](https://code.claude.com/docs/en/permissions.md#permission-system), so a session nobody is watching keeps working |
| [`permissions.disableBypassPermissionsMode`](https://code.claude.com/docs/en/settings-reference#permissions-disablebypasspermissionsmode) | Any file | Prevent anyone from entering [bypassPermissions mode](https://code.claude.com/docs/en/permission-modes.md#skip-all-checks-with-bypasspermissions-mode) |
| [`skipAutoPermissionPrompt`](https://code.claude.com/docs/en/settings-reference#skipautopermissionprompt) | User or managed | Skip the one-time notice Claude Code shows when you first enter [auto mode](https://code.claude.com/docs/en/permission-modes.md#eliminate-prompts-with-auto-mode) yourself rather than through the built-in default |
| [`skipDangerousModePermissionPrompt`](https://code.claude.com/docs/en/settings-reference#skipdangerousmodepermissionprompt) | User, local, or managed | Skip the confirmation dialog before [bypassPermissions mode](https://code.claude.com/docs/en/permission-modes.md#skip-all-checks-with-bypasspermissions-mode) |
| [`useAutoModeDuringPlan`](https://code.claude.com/docs/en/settings-reference#useautomodeduringplan) | User, local, or managed | Let the [auto mode](https://code.claude.com/docs/en/permission-modes.md#eliminate-prompts-with-auto-mode) classifier review shell commands in [plan mode](https://code.claude.com/docs/en/permission-modes.md#analyze-before-you-edit-with-plan-mode); set `false` to get prompts instead |

### Interface and terminal（38 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`askUserQuestionTimeout`](https://code.claude.com/docs/en/settings-reference#askuserquestiontimeout) | User or managed | Let an unanswered question [auto-continue](https://code.claude.com/docs/en/tools-reference.md#question-auto-continue-timeout) after idle time |
| [`autoContinueAtUsageLimit`](https://code.claude.com/docs/en/settings-reference#autocontinueatusagelimit) | User or managed | Wait in the open session and [continue the task automatically](https://code.claude.com/docs/en/interactive-mode.md#wait-for-a-usage-limit-to-reset) after a claude.ai usage limit resets |
| [`autoScrollEnabled`](https://code.claude.com/docs/en/settings-reference#autoscrollenabled) | Any file | [Follow new output](https://code.claude.com/docs/en/fullscreen.md#auto-follow) to the bottom in fullscreen rendering |
| [`axScreenReader`](https://code.claude.com/docs/en/settings-reference#axscreenreader) | User or managed | Render [screen-reader friendly output](https://code.claude.com/docs/en/accessibility.md) |
| [`bashEditDiffEnabled`](https://code.claude.com/docs/en/settings-reference#basheditdiffenabled) | User or managed | Record the [files that changed while a Bash command ran](https://code.claude.com/docs/en/hooks.md#bash) in every permission mode |
| [`companyAnnouncements`](https://code.claude.com/docs/en/settings-reference#companyannouncements) | Any file | Show your organization's announcements at startup |
| [`defaultShell`](https://code.claude.com/docs/en/settings-reference#defaultshell) | Any file | Choose whether Bash or PowerShell runs the shell commands you type with the [`!` prefix](https://code.claude.com/docs/en/interactive-mode#shell-mode-with-prefix) |
| [`dialogExpiry`](https://code.claude.com/docs/en/settings-reference#dialogexpiry) | User or managed | Set how long Claude Code waits for [Remote Control](https://code.claude.com/docs/en/remote-control.md) or an SDK host to answer a forwarded dialog before it cancels the dialog |
| [`editorMode`](https://code.claude.com/docs/en/settings-reference#editormode) | Any file | Use [vim key bindings](https://code.claude.com/docs/en/interactive-mode.md#vim-editor-mode) in the input prompt |
| [`emojiCompletionEnabled`](https://code.claude.com/docs/en/settings-reference#emojicompletionenabled) | Any file | Turn off [`:shortcode:` emoji suggestions and replacement](https://code.claude.com/docs/en/interactive-mode#emoji-shortcodes) in the prompt input |
| [`fileSuggestion`](https://code.claude.com/docs/en/settings-reference#filesuggestion) | Any file | Supply [`@` file autocomplete](https://code.claude.com/docs/en/interactive-mode#quick-commands) from your own command |
| [`footerLinksRegexes`](https://code.claude.com/docs/en/settings-reference#footerlinksregexes) | User or managed | Make issue or review IDs in output into [clickable links](https://code.claude.com/docs/en/statusline.md#clickable-links) below the input box |
| [`keybindingFlavor`](https://code.claude.com/docs/en/settings-reference#keybindingflavor) | Any file | Deprecated and has no effect; the word-editing shortcuts always [follow readline conventions](https://code.claude.com/docs/en/interactive-mode.md#make-ctrl-w-delete-back-to-whitespace) |
| [`maxProseWidth`](https://code.claude.com/docs/en/settings-reference#maxprosewidth) | Any file | Cap how wide the prose in Claude's responses runs in a wide terminal |
| [`prefersReducedMotion`](https://code.claude.com/docs/en/settings-reference#prefersreducedmotion) | Any file | [Reduce or turn off](https://code.claude.com/docs/en/accessibility.md#accessibility-settings) spinner, shimmer, and flash animations |
| [`promptSuggestionEnabled`](https://code.claude.com/docs/en/settings-reference#promptsuggestionenabled) | Any file | Hide the grayed-out [prompt suggestions](https://code.claude.com/docs/en/interactive-mode.md#prompt-suggestions) in the input box |
| [`respectGitignore`](https://code.claude.com/docs/en/settings-reference#respectgitignore) | Any file | Keep gitignored files out of the [`@` file picker](https://code.claude.com/docs/en/interactive-mode#quick-commands) |
| [`respondToBashCommands`](https://code.claude.com/docs/en/settings-reference#respondtobashcommands) | Any file | Stop Claude from responding after a [`!` shell command](https://code.claude.com/docs/en/interactive-mode#shell-mode-with-prefix) runs |
| [`showClearContextOnPlanAccept`](https://code.claude.com/docs/en/settings-reference#showclearcontextonplanaccept) | Any file | Show a "clear context" option on the [plan accept screen](https://code.claude.com/docs/en/permission-modes.md#review-and-approve-a-plan) |
| [`showTurnDuration`](https://code.claude.com/docs/en/settings-reference#showturnduration) | Any file | Hide the "Cooked for" duration after each response |
| [`spellcheck`](https://code.claude.com/docs/en/settings-reference#spellcheck) | User or managed | Underline misspelled words in the prompt input with a [spell checker](https://code.claude.com/docs/en/interactive-mode.md#check-spelling-as-you-type) you install |
| [`spinnerTipsEnabled`](https://code.claude.com/docs/en/settings-reference#spinnertipsenabled) | Any file | Hide tips in the spinner while Claude works |
| [`spinnerTipsOverride`](https://code.claude.com/docs/en/settings-reference#spinnertipsoverride) | Any file | Add your own tips to the spinner rotation, or replace the built-in tips |
| [`spinnerVerbs`](https://code.claude.com/docs/en/settings-reference#spinnerverbs) | Any file | Add or replace the verbs shown while a turn runs |
| [`statusLine`](https://code.claude.com/docs/en/settings-reference#statusline) | Any file | Run your own command to render a [status line](https://code.claude.com/docs/en/statusline.md) below the prompt |
| [`syntaxHighlightingDisabled`](https://code.claude.com/docs/en/settings-reference#syntaxhighlightingdisabled) | Any file | Turn off syntax highlighting in diffs and code blocks |
| [`terminalProgressBarEnabled`](https://code.claude.com/docs/en/settings-reference#terminalprogressbarenabled) | Any file | Hide the terminal progress bar in terminals that support it |
| [`terminalTitleFromRename`](https://code.claude.com/docs/en/settings-reference#terminaltitlefromrename) | Any file | Stop [`/rename`](https://code.claude.com/docs/en/sessions#name-your-sessions) and `--name` from changing the terminal tab title |
| [`theme`](https://code.claude.com/docs/en/settings-reference#theme) | Any file | Pick the interface [color theme](https://code.claude.com/docs/en/terminal-config.md#match-the-color-theme), built-in or custom |
| [`timeFormat`](https://code.claude.com/docs/en/settings-reference#timeformat) | Any file | Show the times in the interface on a 12-hour or 24-hour clock, in UTC, or with a strftime pattern |
| [`timeZone`](https://code.claude.com/docs/en/settings-reference#timezone) | Any file | Show the times in the interface in a time zone other than your system's |
| [`tui`](https://code.claude.com/docs/en/settings-reference#tui) | Any file | Choose the [fullscreen](https://code.claude.com/docs/en/fullscreen.md) or classic terminal renderer |
| [`verbose`](https://code.claude.com/docs/en/settings-reference#verbose) | Any file | Show [full tool output](https://code.claude.com/docs/en/cli-reference.md#cli-flags) instead of truncated summaries; `viewMode` takes precedence when both are set |
| [`viewMode`](https://code.claude.com/docs/en/settings-reference#viewmode) | Any file | Start every session in [default, verbose, or focus view](https://code.claude.com/docs/en/cli-reference.md#cli-flags) |
| [`vimInsertModeRemaps`](https://code.claude.com/docs/en/settings-reference#viminsertmoderemaps) | User or managed | Map a two-key [INSERT-mode sequence](https://code.claude.com/docs/en/interactive-mode.md#remap-insert-mode-key-sequences) such as `jj` to Escape |
| [`voice`](https://code.claude.com/docs/en/settings-reference#voice) | Any file | Turn on [voice dictation](https://code.claude.com/docs/en/voice-dictation.md) and pick hold or tap mode |
| [`voiceEnabled`](https://code.claude.com/docs/en/settings-reference#voiceenabled) | Any file | Turn on [voice dictation](https://code.claude.com/docs/en/voice-dictation.md) with the older single-key form |
| [`wheelScrollAccelerationEnabled`](https://code.claude.com/docs/en/settings-reference#wheelscrollaccelerationenabled) | Any file | Turn off [mouse-wheel acceleration](https://code.claude.com/docs/en/fullscreen.md#mouse-wheel-scrolling) in fullscreen rendering |

### Git and attribution（7 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`attribution`](https://code.claude.com/docs/en/settings-reference#attribution) | Any file | Customize the attribution Claude Code adds to commits and pull requests |
| [`attribution.commit`](https://code.claude.com/docs/en/settings-reference#attribution-commit) | Any file | Change or hide the trailer Claude Code adds to commits |
| [`attribution.pr`](https://code.claude.com/docs/en/settings-reference#attribution-pr) | Any file | Change or hide the attribution line in pull request descriptions |
| [`attribution.sessionUrl`](https://code.claude.com/docs/en/settings-reference#attribution-sessionurl) | Any file | Omit the claude.ai session link from [cloud](https://code.claude.com/docs/en/claude-code-on-the-web.md) and [Remote Control](https://code.claude.com/docs/en/remote-control.md) commits |
| [`includeCoAuthoredBy`](https://code.claude.com/docs/en/settings-reference#includecoauthoredby) | Any file | Deprecated; use `attribution` to hide or change commit and PR attribution |
| [`includeGitInstructions`](https://code.claude.com/docs/en/settings-reference#includegitinstructions) | Any file | Remove the built-in commit and PR instructions from Claude's context |
| [`prUrlTemplate`](https://code.claude.com/docs/en/settings-reference#prurltemplate) | Any file | Point PR links at an internal code-review tool instead of github.com |

### Memory and context（14 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`autoCompactEnabled`](https://code.claude.com/docs/en/settings-reference#autocompactenabled) | Any file | Turn [automatic compaction](https://code.claude.com/docs/en/context-window.md) off or on |
| [`autoCompactWindow`](https://code.claude.com/docs/en/settings-reference#autocompactwindow) | Any file | Set how full the context gets before Claude Code [compacts](https://code.claude.com/docs/en/context-window.md) |
| [`autoMemoryDirectory`](https://code.claude.com/docs/en/settings-reference#automemorydirectory) | Any file | Store [auto memory](https://code.claude.com/docs/en/memory.md#auto-memory) in a directory you choose |
| [`autoMemoryEnabled`](https://code.claude.com/docs/en/settings-reference#automemoryenabled) | Any file | Turn [auto memory](https://code.claude.com/docs/en/memory.md#auto-memory) off or on |
| [`bashOutputMaxChars`](https://code.claude.com/docs/en/settings-reference#bashoutputmaxchars) | Any file | Set how much of a successful command's [output](https://code.claude.com/docs/en/tools-reference.md#output-limits) Claude receives inline |
| [`claudeMd`](https://code.claude.com/docs/en/settings-reference#claudemd) | Managed | Inject organization-wide [CLAUDE.md](https://code.claude.com/docs/en/memory.md#deploy-organization-wide-claude-md) instructions from managed settings |
| [`claudeMdExcludes`](https://code.claude.com/docs/en/settings-reference#claudemdexcludes) | Any file | Skip specific [CLAUDE.md](https://code.claude.com/docs/en/memory.md#exclude-specific-claude-md-files) files when memory loads |
| [`env`](https://code.claude.com/docs/en/settings-reference#env) | Any file | Set [environment variables](https://code.claude.com/docs/en/env-vars.md#in-settings-files) for every session and its subprocesses |
| [`fileCheckpointingEnabled`](https://code.claude.com/docs/en/settings-reference#filecheckpointingenabled) | Any file | Turn off or on the file snapshots that [`/rewind`](https://code.claude.com/docs/en/checkpointing) restores |
| [`idleCompaction`](https://code.claude.com/docs/en/settings-reference#idlecompaction) | Any file | Stop Claude Code from compacting a long conversation that you've stepped away from |
| [`plansDirectory`](https://code.claude.com/docs/en/settings-reference#plansdirectory) | Any file | Choose where [plan mode](https://code.claude.com/docs/en/permission-modes.md#analyze-before-you-edit-with-plan-mode) writes plan files |
| [`skillListingBudgetFraction`](https://code.claude.com/docs/en/settings-reference#skilllistingbudgetfraction) | Any file | Reserve more or less context for the [skill listing](https://code.claude.com/docs/en/skills.md#skill-descriptions-are-cut-short) |
| [`skillListingMaxDescChars`](https://code.claude.com/docs/en/settings-reference#skilllistingmaxdescchars) | Any file | Cap each skill's description length in the [skill listing](https://code.claude.com/docs/en/skills.md#skill-descriptions-are-cut-short) |
| [`taskOutputMaxChars`](https://code.claude.com/docs/en/settings-reference#taskoutputmaxchars) | Any file | Removed in v2.1.277, together with the `TaskOutput` tool it sized |

### Global config settings（12 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`autoConnectIde`](https://code.claude.com/docs/en/settings-reference#autoconnectide) | Global config | Connect to a running [VS Code](https://code.claude.com/docs/en/vs-code.md) or [JetBrains](https://code.claude.com/docs/en/jetbrains.md#from-external-terminals) IDE automatically from an external terminal |
| [`autoInstallIdeExtension`](https://code.claude.com/docs/en/settings-reference#autoinstallideextension) | Global config | Let `/ide` install the [IDE extension](https://code.claude.com/docs/en/vs-code.md#install-the-extension) from an external terminal |
| [`claudeInChromeDefaultEnabled`](https://code.claude.com/docs/en/settings-reference#claudeinchromedefaultenabled) | Global config | Turn on [Chrome integration](https://code.claude.com/docs/en/chrome.md) when a session starts, in the interactive CLI and the VS Code extension |
| [`copyFullResponse`](https://code.claude.com/docs/en/settings-reference#copyfullresponse) | Global config | Make [`/copy`](https://code.claude.com/docs/en/commands) copy the full response without showing the picker |
| [`copyOnSelect`](https://code.claude.com/docs/en/settings-reference#copyonselect) | Global config | Turn off automatic copying of text you select with the mouse in [fullscreen rendering](https://code.claude.com/docs/en/fullscreen.md#use-the-mouse) and agent view |
| [`defaultToAgentsView`](https://code.claude.com/docs/en/settings-reference#defaulttoagentsview) | Global config | Open [agent view](https://code.claude.com/docs/en/agent-view.md) instead of a new conversation when you run `claude` with no arguments |
| [`diffTool`](https://code.claude.com/docs/en/settings-reference#difftool) | Global config | Choose whether Claude's proposed file changes open in the [VS Code](https://code.claude.com/docs/en/vs-code.md) or [JetBrains](https://code.claude.com/docs/en/jetbrains.md#features) diff viewer or stay in the terminal |
| [`externalEditorContext`](https://code.claude.com/docs/en/settings-reference#externaleditorcontext) | Global config | Show Claude's last response as comments when you press [Ctrl+G](https://code.claude.com/docs/en/interactive-mode.md#general-controls) to edit |
| [`leftArrowOpensAgents`](https://code.claude.com/docs/en/settings-reference#leftarrowopensagents) | Global config | Turn off the `←` shortcut that [backgrounds the session and opens agent view](https://code.claude.com/docs/en/agent-view.md#switch-sessions-without-leaving-the-terminal) |
| [`permissionExplainerEnabled`](https://code.claude.com/docs/en/settings-reference#permissionexplainerenabled) | Global config | Removed in v2.1.257, together with the `Ctrl+E` command explanation on shell permission prompts |
| [`prStatusFooterEnabled`](https://code.claude.com/docs/en/settings-reference#prstatusfooterenabled) | Global config | Turn off the prompt footer's [PR review status](https://code.claude.com/docs/en/interactive-mode.md#pr-review-status) badge and the pull request check behind it |
| [`teammateDefaultModel`](https://code.claude.com/docs/en/settings-reference#teammatedefaultmodel) | Global config | Removed in v2.1.234; see [Specify teammates and models](https://code.claude.com/docs/en/agent-teams.md#specify-teammates-and-models) for how Claude Code picks a teammate's model |

### Updates and versioning（4 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`autoUpdatesChannel`](https://code.claude.com/docs/en/settings-reference#autoupdateschannel) | Any file | Follow the stable [release channel](https://code.claude.com/docs/en/setup.md#configure-release-channel) instead of latest |
| [`minimumVersion`](https://code.claude.com/docs/en/settings-reference#minimumversion) | Any file | Keep [auto-updates](https://code.claude.com/docs/en/setup.md#pin-a-minimum-version) from installing anything below a version |
| [`requiredMaximumVersion`](https://code.claude.com/docs/en/settings-reference#requiredmaximumversion) | Managed | [Refuse to start](https://code.claude.com/docs/en/setup.md#pin-a-minimum-version) on a version newer than your organization allows |
| [`requiredMinimumVersion`](https://code.claude.com/docs/en/settings-reference#requiredminimumversion) | Managed | [Refuse to start](https://code.claude.com/docs/en/setup.md#pin-a-minimum-version) on a version older than your organization requires |

### Tools（3 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`browserExternalPageTools`](https://code.claude.com/docs/en/settings-reference#browserexternalpagetools) | Managed | Keep Claude's tools off external pages in the [desktop](https://code.claude.com/docs/en/desktop.md) Browser pane |
| [`disableBrowserExternalNavigation`](https://code.claude.com/docs/en/settings-reference#disablebrowserexternalnavigation) | Managed | Limit the [desktop](https://code.claude.com/docs/en/desktop.md) Browser pane to localhost for people and Claude |
| [`disableMobileSimulatorTools`](https://code.claude.com/docs/en/settings-reference#disablemobilesimulatortools) | Managed | Block Claude's tools in the [desktop](https://code.claude.com/docs/en/desktop.md) iOS Simulator pane |

### Privacy and telemetry（5 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`cleanupPeriodDays`](https://code.claude.com/docs/en/settings-reference#cleanupperioddays) | Any file | Choose how many days Claude Code keeps [transcripts](https://code.claude.com/docs/en/data-usage.md#data-retention) before deleting them |
| [`desktopSessionCleanupPeriodDays`](https://code.claude.com/docs/en/settings-reference#desktopsessioncleanupperioddays) | User or managed | Set an age limit in days for [Claude Desktop and Cowork transcripts](https://code.claude.com/docs/en/claude-directory.md#cleaned-up-automatically) |
| [`feedbackDrafts`](https://code.claude.com/docs/en/settings-reference#feedbackdrafts) | User or managed | Control whether Claude queues [feedback drafts](https://code.claude.com/docs/en/tools-reference.md#sendfeedback-tool-behavior) for you to review |
| [`feedbackSurveyRate`](https://code.claude.com/docs/en/settings-reference#feedbacksurveyrate) | Any file | Change how often the [session quality survey](https://code.claude.com/docs/en/data-usage.md#session-quality-surveys) appears |
| [`skipWebFetchPreflight`](https://code.claude.com/docs/en/settings-reference#skipwebfetchpreflight) | Any file | Skip the [WebFetch hostname check](https://code.claude.com/docs/en/tools-reference.md#webfetch-tool-behavior) when Anthropic is unreachable |

### Enterprise and managed settings（9 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`disableSideloadFlags`](https://code.claude.com/docs/en/settings-reference#disablesideloadflags) | Managed | Reject the CLI flags that sideload [plugins](https://code.claude.com/docs/en/plugins/overview.md), [subagents](https://code.claude.com/docs/en/sub-agents.md), and [MCP servers](https://code.claude.com/docs/en/mcp.md) |
| [`forceRemoteSettingsRefresh`](https://code.claude.com/docs/en/settings-reference#forceremotesettingsrefresh) | Managed | Block startup until [server-managed settings](https://code.claude.com/docs/en/server-managed-settings.md) are freshly fetched |
| [`managedSourcesBehavior`](https://code.claude.com/docs/en/settings-reference#managedsourcesbehavior) | Managed | Compose every [managed source](https://code.claude.com/docs/en/managed-settings.md#how-claude-code-combines-managed-sources) you deploy instead of using the highest-priority one alone |
| [`parentSettingsBehavior`](https://code.claude.com/docs/en/settings-reference#parentsettingsbehavior) | Managed | Apply or drop restrictions an [SDK or IDE host](https://code.claude.com/docs/en/managed-settings.md#let-an-embedding-host-add-policy) passes when you deploy [managed settings](https://code.claude.com/docs/en/managed-settings.md) |
| [`policyHelper`](https://code.claude.com/docs/en/settings-reference#policyhelper) | Managed | Run an executable that computes [managed settings](https://code.claude.com/docs/en/managed-settings.md#compute-the-policy-with-a-helper-program) at startup |
| [`policyHelper.path`](https://code.claude.com/docs/en/settings-reference#policyhelper-path) | Managed | Name the [helper executable](https://code.claude.com/docs/en/managed-settings.md#compute-the-policy-with-a-helper-program) Claude Code runs |
| [`policyHelper.refreshIntervalMs`](https://code.claude.com/docs/en/settings-reference#policyhelper-refreshintervalms) | Managed | Re-run the [helper](https://code.claude.com/docs/en/managed-settings.md#compute-the-policy-with-a-helper-program) in the background on an interval |
| [`policyHelper.timeoutMs`](https://code.claude.com/docs/en/settings-reference#policyhelper-timeoutms) | Managed | Set how long Claude Code waits for the [helper](https://code.claude.com/docs/en/managed-settings.md#compute-the-policy-with-a-helper-program) |
| [`wslInheritsWindowsSettings`](https://code.claude.com/docs/en/settings-reference#wslinheritswindowssettings) | Managed | Have WSL read [managed settings](https://code.claude.com/docs/en/managed-settings.md) from the Windows policy chain |

### Sandbox settings（39 项）

| 配置键 | 作用域 | 官方用途（原文摘要） |
| --- | --- | --- |
| [`sandbox`](https://code.claude.com/docs/en/settings-reference#sandbox) | Any file | [Isolate Bash commands](https://code.claude.com/docs/en/sandboxing.md) from your filesystem and network on macOS, Linux, and WSL2 |
| [`sandbox.allowAppleEvents`](https://code.claude.com/docs/en/settings-reference#sandbox-allowappleevents) | User or managed | Let [sandboxed](https://code.claude.com/docs/en/sandboxing.md) commands send Apple Events on macOS |
| [`sandbox.allowNestedUserNamespaces`](https://code.claude.com/docs/en/settings-reference#sandbox-allownestedusernamespaces) | User or managed | Let [sandboxed](https://code.claude.com/docs/en/sandboxing.md#chromium-or-rootless-podman-fails-inside-the-sandbox-on-linux) commands create user namespaces on Linux and WSL2 |
| [`sandbox.allowUnsandboxedCommands`](https://code.claude.com/docs/en/settings-reference#sandbox-allowunsandboxedcommands) | Any file | Let Claude retry a blocked command outside the [sandbox](https://code.claude.com/docs/en/sandboxing.md#the-unsandboxed-retry-escape-hatch), or forbid it |
| [`sandbox.autoAllowBashIfSandboxed`](https://code.claude.com/docs/en/settings-reference#sandbox-autoallowbashifsandboxed) | Any file | Run [sandboxed](https://code.claude.com/docs/en/sandboxing.md#auto-allow-mode) commands without a permission prompt |
| [`sandbox.bwrapPath`](https://code.claude.com/docs/en/settings-reference#sandbox-bwrappath) | Managed | Point the [sandbox](https://code.claude.com/docs/en/sandboxing.md) at a bubblewrap binary outside `PATH` |
| [`sandbox.credentials`](https://code.claude.com/docs/en/settings-reference#sandbox-credentials) | Any file | Hide or mask credential files and variables inside the [sandbox](https://code.claude.com/docs/en/sandboxing.md#protect-credentials) |
| [`sandbox.credentials.allowPlaintextInject`](https://code.claude.com/docs/en/settings-reference#sandbox-credentials-allowplaintextinject) | User or managed | Let [masked credentials](https://code.claude.com/docs/en/sandboxing.md#mask-credentials) reach plain HTTP services on trusted test networks |
| [`sandbox.credentials.awsPairs`](https://code.claude.com/docs/en/settings-reference#sandbox-credentials-awspairs) | User or managed | Link custom-named AWS key variables into one credential for [re-signing](https://code.claude.com/docs/en/sandboxing.md#re-sign-aws-requests) |
| [`sandbox.credentials.envVars`](https://code.claude.com/docs/en/settings-reference#sandbox-credentials-envvars) | Any file | Unset or mask an environment variable inside the [sandbox](https://code.claude.com/docs/en/sandboxing.md#mask-environment-variables) |
| [`sandbox.credentials.files`](https://code.claude.com/docs/en/settings-reference#sandbox-credentials-files) | Any file | Block or mask reads of a credential file inside the [sandbox](https://code.claude.com/docs/en/sandboxing.md#mask-credential-files) |
| [`sandbox.credentials.sigv4`](https://code.claude.com/docs/en/settings-reference#sandbox-credentials-sigv4) | User or managed | Choose whether streaming, presigned, or [SigV4A AWS requests](https://code.claude.com/docs/en/sandboxing.md#re-sign-aws-requests) fail or pass through |
| [`sandbox.enabled`](https://code.claude.com/docs/en/settings-reference#sandbox-enabled) | Any file | Turn on [Bash sandboxing](https://code.claude.com/docs/en/sandboxing.md#get-started) on macOS, Linux, and WSL2 |
| [`sandbox.enableWeakerNestedSandbox`](https://code.claude.com/docs/en/settings-reference#sandbox-enableweakernestedsandbox) | Any file | Run the Linux [sandbox](https://code.claude.com/docs/en/sandboxing.md) inside an unprivileged container |
| [`sandbox.enableWeakerNetworkIsolation`](https://code.claude.com/docs/en/settings-reference#sandbox-enableweakernetworkisolation) | Any file | Let `gh`, `gcloud`, and `terraform` verify TLS behind a MITM proxy inside the [sandbox](https://code.claude.com/docs/en/sandboxing.md#go-based-clis-fail-tls-verification-on-macos) on macOS |
| [`sandbox.excludedCommands`](https://code.claude.com/docs/en/settings-reference#sandbox-excludedcommands) | Any file | Name commands Claude Code can run outside the [sandbox](https://code.claude.com/docs/en/sandboxing.md) |
| [`sandbox.failIfUnavailable`](https://code.claude.com/docs/en/settings-reference#sandbox-failifunavailable) | Any file | Refuse to start when the [sandbox](https://code.claude.com/docs/en/sandboxing.md) can't, instead of running unsandboxed, except in an Anthropic-hosted environment |
| [`sandbox.filesystem`](https://code.claude.com/docs/en/settings-reference#sandbox-filesystem) | Any file | Control which paths [sandboxed](https://code.claude.com/docs/en/sandboxing.md#filesystem-isolation) commands can read and write |
| [`sandbox.filesystem.allowManagedReadPathsOnly`](https://code.claude.com/docs/en/settings-reference#sandbox-filesystem-allowmanagedreadpathsonly) | Managed | Stop developers from re-opening [read paths your organization blocked](https://code.claude.com/docs/en/sandboxing.md#keep-developers-from-widening-the-policy) |
| [`sandbox.filesystem.allowRead`](https://code.claude.com/docs/en/settings-reference#sandbox-filesystem-allowread) | Any file | Re-open reading inside a region [`denyRead`](#sandbox-filesystem-denyread) blocks |
| [`sandbox.filesystem.allowWrite`](https://code.claude.com/docs/en/settings-reference#sandbox-filesystem-allowwrite) | Any file | Add paths [sandboxed](https://code.claude.com/docs/en/sandboxing.md) commands can write to |
| [`sandbox.filesystem.denyRead`](https://code.claude.com/docs/en/settings-reference#sandbox-filesystem-denyread) | Any file | Block [sandboxed](https://code.claude.com/docs/en/sandboxing.md) commands from reading specific paths |
| [`sandbox.filesystem.denyWrite`](https://code.claude.com/docs/en/settings-reference#sandbox-filesystem-denywrite) | Any file | Block [sandboxed](https://code.claude.com/docs/en/sandboxing.md) commands from writing to specific paths |
| [`sandbox.filesystem.disabled`](https://code.claude.com/docs/en/settings-reference#sandbox-filesystem-disabled) | User or managed | [Turn off filesystem isolation](https://code.claude.com/docs/en/sandboxing.md#disable-filesystem-isolation) while keeping network isolation |
| [`sandbox.ignoreViolations`](https://code.claude.com/docs/en/settings-reference#sandbox-ignoreviolations) | Any file | Silence violation reports for paths a command is expected to probe |
| [`sandbox.network`](https://code.claude.com/docs/en/settings-reference#sandbox-network) | Any file | Control which hosts, ports, and sockets [sandboxed](https://code.claude.com/docs/en/sandboxing.md#network-isolation) commands reach |
| [`sandbox.network.allowAllUnixSockets`](https://code.claude.com/docs/en/settings-reference#sandbox-network-allowallunixsockets) | Any file | Let [sandboxed](https://code.claude.com/docs/en/sandboxing.md) commands connect to every Unix socket |
| [`sandbox.network.allowedDomains`](https://code.claude.com/docs/en/settings-reference#sandbox-network-alloweddomains) | Any file | Pre-allow domains so [sandboxed](https://code.claude.com/docs/en/sandboxing.md) commands don't prompt for them |
| [`sandbox.network.allowLocalBinding`](https://code.claude.com/docs/en/settings-reference#sandbox-network-allowlocalbinding) | Any file | Let [sandboxed](https://code.claude.com/docs/en/sandboxing.md) commands listen on network ports and connect to localhost on macOS |
| [`sandbox.network.allowMachLookup`](https://code.claude.com/docs/en/settings-reference#sandbox-network-allowmachlookup) | Any file | Let macOS [sandboxed](https://code.claude.com/docs/en/sandboxing.md) tools like the iOS Simulator or Playwright reach their XPC services |
| [`sandbox.network.allowManagedDomainsOnly`](https://code.claude.com/docs/en/settings-reference#sandbox-network-allowmanageddomainsonly) | Managed | Lock the network allowlist to [managed settings](https://code.claude.com/docs/en/sandboxing.md#keep-developers-from-widening-the-policy) |
| [`sandbox.network.allowUnixSockets`](https://code.claude.com/docs/en/settings-reference#sandbox-network-allowunixsockets) | Any file | List Unix socket paths [sandboxed](https://code.claude.com/docs/en/sandboxing.md) commands can use on macOS |
| [`sandbox.network.deniedDomains`](https://code.claude.com/docs/en/settings-reference#sandbox-network-denieddomains) | Any file | Block domains for [sandboxed](https://code.claude.com/docs/en/sandboxing.md) commands, even inside an allowed wildcard |
| [`sandbox.network.httpProxyPort`](https://code.claude.com/docs/en/settings-reference#sandbox-network-httpproxyport) | Any file | Route [sandbox](https://code.claude.com/docs/en/sandboxing.md#custom-proxy-configuration) HTTP traffic through your own proxy |
| [`sandbox.network.socksProxyPort`](https://code.claude.com/docs/en/settings-reference#sandbox-network-socksproxyport) | Any file | Route [sandbox](https://code.claude.com/docs/en/sandboxing.md#custom-proxy-configuration) SOCKS traffic through your own proxy |
| [`sandbox.network.strictAllowlist`](https://code.claude.com/docs/en/settings-reference#sandbox-network-strictallowlist) | User or managed | Deny hosts outside the [allowlist](https://code.claude.com/docs/en/sandboxing.md#network-isolation) instead of prompting |
| [`sandbox.network.tlsTerminate`](https://code.claude.com/docs/en/settings-reference#sandbox-network-tlsterminate) | User or managed | Have the [sandbox](https://code.claude.com/docs/en/sandboxing.md#network-isolation) proxy terminate TLS so it can read HTTPS requests |
| [`sandbox.ripgrep`](https://code.claude.com/docs/en/settings-reference#sandbox-ripgrep) | User or managed | Use your own ripgrep binary inside the [sandbox](https://code.claude.com/docs/en/sandboxing.md) |
| [`sandbox.socatPath`](https://code.claude.com/docs/en/settings-reference#sandbox-socatpath) | Managed | Point the [sandbox](https://code.claude.com/docs/en/sandboxing.md) proxy at a `socat` binary outside `PATH` |

---

## 13. 参考资料

本文核验日期：2026-11-17；官方 latest 版本：`2.1.326`；本机只读帮助基线：`2.1.319`。

- Settings files and precedence：https://code.claude.com/docs/en/settings
- 全量 Settings Reference：https://code.claude.com/docs/en/settings-reference
- Environment variables：https://code.claude.com/docs/en/env-vars
- Model configuration：https://code.claude.com/docs/en/model-config
- Permission modes：https://code.claude.com/docs/en/permission-modes
- Sandboxing：https://code.claude.com/docs/en/sandboxing
- Status line：https://code.claude.com/docs/en/statusline
- Keybindings：https://code.claude.com/docs/en/keybindings
- Memory / CLAUDE.md / AGENTS.md：https://code.claude.com/docs/en/memory
- SchemaStore 配置 schema（第三方维护，以官方字段页为准）：https://json.schemastore.org/claude-code-settings.json
- 官方 Changelog：https://code.claude.com/docs/en/changelog

Settings Reference 会随着 Claude Code 发布持续增加配置键；更新本文时应重新抓取官方索引，而不是沿用旧文章中的“完整配置表”。

- https://code.claude.com/docs/en/settings
- https://code.claude.com/docs/en/settings-reference
- https://code.claude.com/docs/en/remote-control
本轮更新依据：[v2.1.326 官方发布说明](https://github.com/anthropics/claude-code/releases/tag/v2.1.326)、[官方文档索引](https://code.claude.com/docs/llms.txt)、[npm 版本与渠道](https://registry.npmjs.org/@anthropic-ai/claude-code)。
