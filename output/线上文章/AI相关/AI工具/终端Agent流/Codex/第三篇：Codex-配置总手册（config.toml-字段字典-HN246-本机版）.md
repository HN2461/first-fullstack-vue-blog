---
title: "第三篇：Codex 配置总手册（config.toml / 字段字典 / HN246 本机版）"
slug: "ai-agent-codex-codex-edeadb5e"
summary: "将 Codex 配置心智、字段字典、HN246 本机配置模板、CCSwitch 路径排查和替换验证流程合成一篇完整配置总手册，避免多篇重复讲 config.toml。"
category: "Codex"
tags:
  - "Codex"
  - "config.toml"
  - "CCSwitch"
  - "配置字段"
  - "Windows"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf5a"
originalSlug: "ai-agent-codex-codex-edeadb5e"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第三篇：Codex 配置总手册（config.toml / 字段字典 / HN246 本机版）

> 更新时间：2026-06-04  
> 定位：配置总手册。以后所有 `config.toml`、provider、模型、审批、沙箱、MCP、Desktop、本机路径、CCSwitch 快照污染和 HN246 本机替换版配置，都统一在这一篇维护。  
> 前置：第一篇跑通 CLI；第二篇看懂终端英文状态。  
> 下一篇建议：第四篇（多线路接入与迁移）。  
> 小白读完目标：你应该能说清 Codex 配置为什么会生效或失效，能看懂每个高频字段，能安全整理 HN246 本机配置，并能用 `/status`、`/debug-config`、`/mcp` 验证结果。

[[toc]]

---

## 1. 为什么配置内容必须合成一篇

主人这次指出的问题很关键：  
如果“配置心智”“字段字典”“本机配置实战”拆成三篇，读者会反复看到同一批内容：

1. `config.toml` 放在哪里
2. `model` / `model_provider` 怎么写
3. `approval_policy` / `sandbox_mode` 怎么配
4. MCP 怎么启动
5. HN246 本机路径怎么替换
6. CCSwitch 同步后为什么会残留旧机器路径

所以现在统一成这一篇。  
以后维护规则也很简单：

1. 凡是 `config.toml` 字段解释，写这里
2. 凡是 HN246 本机配置模板，写这里
3. 凡是 provider / key / token / base URL 讲解，写这里
4. 凡是改配置后不生效的排查，写这里
5. 多线路“选哪条线、怎么迁移”仍然放第四篇

---

## 2. Codex 配置先分 5 层

不要一上来背字段。  
先把 Codex 配置拆成 5 层：

| 层级 | 负责什么 | 常见文件 / 命令 |
|---|---|---|
| 认证层 | 你是谁、用哪种 key 或登录态 | `auth.json`、keyring、环境变量、token 字段 |
| Provider 层 | 请求发到哪里、用哪个模型 | `model_provider`、`model`、`base_url` |
| 权限层 | 能不能读写、要不要确认 | `approval_policy`、`sandbox_mode` |
| 工具层 | MCP、浏览器、文档、插件 | `[mcp_servers.*]`、`[plugins.*]` |
| 项目规则层 | 当前仓库怎么做事 | `AGENTS.md`、项目 `.codex/config.toml` |

很多“玄学失效”都不是 Codex 坏了，而是这几层混在一起了。

---

## 3. 配置文件到底放哪里

Windows 上最常见的是：

```text
C:\Users\你的用户名\.codex\config.toml
C:\Users\你的用户名\.codex\auth.json
```

HN246 本机就是：

```text
C:\Users\HN246\.codex\config.toml
```

项目级配置则在仓库里：

```text
<repo>\.codex\config.toml
```

最重要的区别：

1. 用户级配置影响大多数项目
2. 项目级配置只影响当前仓库
3. 项目级配置可能覆盖用户级配置
4. 不信任项目可能跳过项目级 `.codex` 配置

---

## 4. 生效优先级：改了没反应先看这里

同一个字段最终谁说了算，通常按这个顺序：

1. CLI flags / `--config`
2. `--profile <name>`
3. 项目 `.codex/config.toml`
4. 用户 `~/.codex/config.toml`
5. 系统级配置
6. 内置默认值

最常见的 4 个坑：

1. 改了用户配置，但项目 `.codex/config.toml` 覆盖了
2. 当前会话没重启，仍然用旧状态
3. 用了 `--profile`，profile 覆盖了默认字段
4. CCSwitch 写入的是另一份配置或旧机器路径

验证配置来源，优先用：

```text
/debug-config
```

---

## 5. HN246 本机配置主线

主人给的三份文件分别是：

| 文件 | 角色 |
|---|---|
| `C:\Users\HN246\Desktop\config.toml` | 旧配置 / 参考配置 |
| `C:\Users\HN246\Desktop\Codex-CCSwitch配置字段说明.md` | 字段说明文档 |
| `C:\Users\HN246\Desktop\codex.config.hn246.toml` | HN246 本机直接替换版 |

这次本机配置的核心结论：

1. 默认 provider：`my_codex`
2. 默认模型示例：`gpt-5.5`
3. 默认权限：`on-request + workspace-write`
4. 默认推理：`medium`
5. 默认长上下文：`1050000 / 900000`
6. MCP：`context7` + `chrome-devtools`
7. Desktop 终端：PowerShell
8. Windows 沙箱：`elevated`
9. 本机路径统一用 `C:\Users\HN246`
10. 真实 token 不写进公开笔记和 Git

---

## 6. HN246 脱敏版完整模板

下面是可公开展示的脱敏版。  
真正写到本机时，认证字段以主人当前能跑通的私有配置为准。

```toml
#:schema https://developers.openai.com/codex/config-schema.json

model_provider = "my_codex"
model = "gpt-5.5"

approval_policy = "on-request"
approvals_reviewer = "user"
sandbox_mode = "workspace-write"

model_reasoning_effort = "medium"
model_context_window = 1050000
model_auto_compact_token_limit = 900000

disable_response_storage = true
windows_wsl_setup_acknowledged = true
model_verbosity = "high"

[sandbox_workspace_write]
network_access = true

[model_providers]

[model_providers.my_codex]
name = "my_codex"
base_url = "https://yfy.zhouyang168.top/v1"
wire_api = "responses"
requires_openai_auth = true

# 不要把真实 token 写进公开笔记、截图或 Git。
# 如果本机确实依赖该字段，只能放在本机私有 config.toml：
# experimental_bearer_token = "sk-***"

[projects]

[projects.'c:\users\hn246']
trust_level = "trusted"

[projects.'c:\users\hn246\desktop']
trust_level = "trusted"

[projects.'c:\users\hn246\desktop\番茄']
trust_level = "trusted"

[projects.'c:\users\hn246\desktop\git项目']
trust_level = "trusted"

[mcp_servers]

[mcp_servers.context7]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "-y", "@upstash/context7-mcp"]

[mcp_servers.chrome-devtools]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"]
startup_timeout_ms = 20000

[mcp_servers.chrome-devtools.env]
CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS = "1"
PROGRAMFILES = "C:\\Program Files"
SystemRoot = "C:\\Windows"
npm_config_cache = "C:\\Users\\HN246\\.codex\\npm-cache"

[plugins]

[plugins."documents@openai-primary-runtime"]
enabled = true

[plugins."spreadsheets@openai-primary-runtime"]
enabled = true

[plugins."presentations@openai-primary-runtime"]
enabled = true

[desktop]
appearanceTheme = "dark"
usePointerCursors = false
followUpQueueMode = "queue"
reviewDelivery = "inline"
integratedTerminalShell = "powershell"
localeOverride = "zh-CN"
selected-avatar-id = "dewey"
dictationDictionary = []
show-context-window-usage = true

[desktop.appearanceDarkChromeTheme]
accent = "#339cff"
contrast = 60
ink = "#ffffff"
opaqueWindows = false
surface = "#181818"

[desktop.appearanceDarkChromeTheme.fonts]

[desktop.appearanceDarkChromeTheme.semanticColors]
diffAdded = "#40c977"
diffRemoved = "#fa423e"
skill = "#ad7bf9"

[desktop.open-in-target-preferences]
global = "vscode"

[desktop.open-in-target-preferences.perPath]
"C:\\Users\\HN246\\Desktop\\番茄" = "vscode"
"C:\\Users\\HN246\\Desktop\\git项目" = "vscode"

[windows]
sandbox = "elevated"
```

---

## 7. 字段字典：最常改的字段

### 7.1 `model`

默认模型名：

```toml
model = "gpt-5.5"
```

注意：

1. 文章里的模型名只是模板示例
2. 真正能不能用，看当前 provider / 网关是否开放
3. 如果 `/status` 或模型列表看不到它，先查网关后台

### 7.2 `model_provider`

选择后端 provider：

```toml
model_provider = "my_codex"
```

它必须对应：

```toml
[model_providers.my_codex]
```

只改 `base_url` 不够。  
切线路时至少一起查：

1. `model_provider`
2. `[model_providers.<id>]`
3. `model`
4. `base_url`
5. 鉴权字段

### 7.3 `[model_providers.<id>]`

常见字段：

| 字段 | 作用 |
|---|---|
| `name` | provider 显示名 |
| `base_url` | 请求地址 |
| `wire_api` | 协议，当前常用 `responses` |
| `requires_openai_auth` | 是否复用 OpenAI / Codex 登录鉴权 |
| `env_key` | 从环境变量读取 API Key |
| `experimental_bearer_token` | 直写 token，不建议公开或长期使用 |

### 7.4 `approval_policy`

控制什么时候要主人确认：

| 值 | 适合场景 |
|---|---|
| `untrusted` | 陌生项目，更保守 |
| `on-request` | 日常开发推荐 |
| `never` | 自动化或隔离环境，风险更高 |

HN246 日常建议：

```toml
approval_policy = "on-request"
```

### 7.5 `sandbox_mode`

控制技术权限范围：

| 值 | 含义 |
|---|---|
| `read-only` | 只读 |
| `workspace-write` | 可写当前工作区 |
| `danger-full-access` | 完全放开，高风险 |

HN246 日常建议：

```toml
sandbox_mode = "workspace-write"
```

### 7.6 `[sandbox_workspace_write]`

只在 `workspace-write` 下生效：

```toml
[sandbox_workspace_write]
network_access = true
```

`true` 方便查文档、启动 MCP、下载 npm 包。  
高安全项目可以设为 `false`。

### 7.7 `model_reasoning_effort`

控制思考深度：

```toml
model_reasoning_effort = "medium"
```

常见选择：

1. `low`：更快
2. `medium`：日常推荐
3. `high`：复杂排错 / 重构
4. `xhigh`：更深，成本更高

### 7.8 上下文窗口

HN246 长上下文模板：

```toml
model_context_window = 1050000
model_auto_compact_token_limit = 900000
```

注意：

1. 它不是强行把模型变成 1M 上下文
2. 它只是告诉 Codex 按多大预算管理上下文
3. 真实能力看模型和网关
4. compact 阈值必须小于 context window

更稳妥的日常档：

```toml
model_context_window = 500000
model_auto_compact_token_limit = 400000
```

### 7.9 `disable_response_storage`

```toml
disable_response_storage = true
```

隐私 / 合规场景通常保留 `true`。

### 7.10 `model_verbosity`

控制回复详细度：

```toml
model_verbosity = "high"
```

中文配置解释、长文档维护时可以用 `high`。  
只想要结果时可改 `medium`。

---

## 8. 认证字段和 token 安全

最需要小心的是：

```toml
experimental_bearer_token = "sk-***"
```

规则：

1. 本机私有配置可以有
2. 公开笔记必须打码
3. Git 仓库不能提交真实 token
4. 截图前要检查有没有露出 key

如果网关支持环境变量，更推荐：

```powershell
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "你的Key", "User")
```

然后配置：

```toml
requires_openai_auth = false
env_key = "OPENAI_API_KEY"
```

但 HN246 当前模板沿用了可用配置。  
如果当前能跑，不要为了“看起来标准”贸然改认证方式。

---

## 9. MCP 配置：Context7 与 Chrome DevTools

### 9.1 Context7

```toml
[mcp_servers.context7]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "-y", "@upstash/context7-mcp"]
```

适合：

1. 查新版框架文档
2. 查库 API 示例
3. 避免依赖模型记忆写旧用法

### 9.2 Chrome DevTools

```toml
[mcp_servers.chrome-devtools]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"]
startup_timeout_ms = 20000
```

适合：

1. 看页面控制台
2. 调试网络请求
3. 截图验收 UI
4. 检查前端运行状态

### 9.3 Windows 环境变量

```toml
[mcp_servers.chrome-devtools.env]
CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS = "1"
PROGRAMFILES = "C:\\Program Files"
SystemRoot = "C:\\Windows"
npm_config_cache = "C:\\Users\\HN246\\.codex\\npm-cache"
```

这些字段不是提升模型能力，而是降低 Windows 下 `npx` 和 Chrome DevTools MCP 启动失败概率。

---

## 10. projects 信任目录

HN246 模板中有：

```toml
[projects.'c:\users\hn246']
trust_level = "trusted"

[projects.'c:\users\hn246\desktop']
trust_level = "trusted"

[projects.'c:\users\hn246\desktop\git项目']
trust_level = "trusted"
```

越大的信任目录越方便，但范围也越大。

更保守写法：

```toml
[projects.'c:\users\hn246\desktop\git项目\个人技术博客网站']
trust_level = "trusted"
```

如果是陌生仓库，建议只信任具体项目，不要信任整个桌面。

---

## 11. Desktop 与 Windows 字段

Desktop 字段多半只影响界面：

```toml
[desktop]
appearanceTheme = "dark"
integratedTerminalShell = "powershell"
localeOverride = "zh-CN"
show-context-window-usage = true
```

容易混淆的点：

| 字段 | 真正作用 |
|---|---|
| `show-context-window-usage` | 是否显示上下文使用量 |
| `model_context_window` | Codex 按多大上下文预算工作 |
| `integratedTerminalShell` | Desktop 集成终端 shell |
| `sandbox_mode` | 当前任务读写权限 |

Windows 沙箱字段：

```toml
[windows]
sandbox = "elevated"
```

它和 `sandbox_mode` 不是一回事：

1. `sandbox_mode` 控制任务权限
2. `[windows].sandbox` 控制 Windows 沙箱实现方式

---

## 12. CCSwitch 跨机同步最常污染哪里

跨机同步或导入旧配置后，最容易残留这些路径：

1. `C:\Users\Administrator\...`
2. 旧机器桌面项目目录
3. 旧 npm cache
4. 旧 `.cache\codex-runtimes`
5. 旧 marketplace source 路径

在 HN246 机器上可以先搜：

```powershell
Select-String -Path "$env:USERPROFILE\.codex\config.toml" -Pattern "Administrator|npm-cache|Desktop|\\.cache|\\.codex"
```

如果当前机器是 HN246，却看到大量 `Administrator`，说明还有旧机器痕迹。

---

## 13. 替换前的安全步骤

### 13.1 备份旧配置

```powershell
Copy-Item "$env:USERPROFILE\.codex\config.toml" "$env:USERPROFILE\.codex\config.toml.bak"
```

### 13.2 查真实 token

```powershell
Select-String -Path "$env:USERPROFILE\.codex\config.toml" -Pattern "token|key|sk-" -CaseSensitive:$false
```

看到真实 key 不要截图、不要提交。

### 13.3 查旧机器路径

```powershell
Select-String -Path "$env:USERPROFILE\.codex\config.toml" -Pattern "Administrator|旧用户名|npm-cache"
```

### 13.4 替换后重启 Codex

旧会话可能保留旧配置状态。  
改完 `config.toml` 后，建议新开 Codex 会话验证。

---

## 14. 替换后的验证流程

### 14.1 CLI 是否正常

```powershell
codex --version
codex
```

### 14.2 看当前状态

```text
/status
```

重点看：

1. 当前模型
2. 当前 provider
3. 当前权限
4. 当前上下文显示

### 14.3 看配置来源

```text
/debug-config
```

重点看：

1. 是否读取 HN246 用户级 config
2. 是否被项目 `.codex/config.toml` 覆盖
3. 是否被 profile 覆盖

### 14.4 看 MCP

```text
/mcp
```

重点看：

1. `context7` 是否启动
2. `chrome-devtools` 是否启动
3. 错误里是否出现旧路径、npm、npx、网络或缓存目录

---

## 15. 高频问题速查

### 15.1 改完还是旧模型

优先查：

1. 改的是不是 `C:\Users\HN246\.codex\config.toml`
2. 当前项目有没有 `.codex/config.toml`
3. 是否用了 `--profile`
4. 旧会话是否没重启

### 15.2 401 / 403

优先查：

1. `requires_openai_auth`
2. token 是否过期
3. key 是否放对字段
4. `base_url` 是否正确
5. 网关是否需要环境变量

### 15.3 MCP 启动失败

优先查：

```powershell
node -v
npm -v
npx -y @upstash/context7-mcp
npx -y chrome-devtools-mcp@latest --no-usage-statistics
```

再查：

1. `npm_config_cache`
2. 旧用户名路径
3. 网络是否可用
4. `startup_timeout_ms`

### 15.4 权限不符合预期

优先查：

1. `approval_policy`
2. `sandbox_mode`
3. `/permissions`
4. `/debug-config`

---

## 16. 推荐 profiles

可以把常用场景写成 profiles：

```toml
[profiles.dev_safe]
model = "gpt-5.5"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
model_reasoning_effort = "medium"

[profiles.readonly_audit]
model = "gpt-5.5"
approval_policy = "never"
sandbox_mode = "read-only"
web_search = "disabled"

[profiles.deep_refactor]
model = "gpt-5.5"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
model_reasoning_effort = "high"
```

调用：

```powershell
codex --profile dev_safe
codex --profile readonly_audit
codex --profile deep_refactor
```

---

## 17. 配置总心智

最后记这 5 句就够：

1. 认证决定“你是谁”
2. provider 决定“请求发到哪里”
3. model 决定“用哪个模型”
4. sandbox 决定“技术上能做什么”
5. approval 决定“做之前要不要问主人”

再加两句本机经验：

1. CCSwitch 同步后先查旧路径
2. 公开笔记里永远不要写真实 token

---

## 参考来源

1. 主人提供的 `C:\Users\HN246\Desktop\config.toml`
2. 主人提供的 `C:\Users\HN246\Desktop\Codex-CCSwitch配置字段说明.md`
3. 主人提供的 `C:\Users\HN246\Desktop\codex.config.hn246.toml`
4. OpenAI Codex 配置文档：<https://developers.openai.com/codex/config-reference>
5. OpenAI Codex CLI 文档：<https://developers.openai.com/codex/cli>
6. OpenAI Codex MCP 文档：<https://developers.openai.com/codex/mcp>
