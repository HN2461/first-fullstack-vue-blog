---
title: "第 03 篇：Codex 配置总手册（config.toml、字段字典、HN246 本机版）"
slug: "ai-agent-codex-codex-edeadb5e"
summary: "按 Codex CLI 0.162.1 稳定版核对配置层级与脱敏模板，补齐 102 个顶层配置键、全部嵌套字段、功能开关生命周期、权限 profile、MCP/Provider、TUI、Hooks 和管理员约束索引。"
category: "Codex"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "Codex"
tags:
  - "CCSwitch"
  - "Codex"
  - "Windows"
  - "config.toml"
  - "配置字段"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf5a"
originalSlug: "ai-agent-codex-codex-edeadb5e"
originalStatus: "published"
publishedAt: "2026-06-04T13:38:33.777Z"
updatedAt: "2026-09-13T13:42:49.803Z"
exportedAt: "2026-09-29T13:16:41.461Z"
---
# 第 03 篇：Codex 配置总手册（config.toml、字段字典、HN246 本机版）

> 更新时间：2026-10-12。
> 核对范围：CLI 接口与配置按稳定版 `0.162.1` 的帮助、配置 schema 和官方发布记录核实；官方网页直接抓取返回 403，产品资料另参考官方文档的检索索引。桌面/IDE 的账号权限与灰度界面不据此推定。完整字段看第三篇，完整命令看第六篇，升级差异看第九篇。
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
3. 项目级配置能覆盖普通项目行为字段；provider 选择/定义、通知命令、profile 选择和遥测等指定宿主字段会被过滤，精确名单见 19.5 节
4. 不信任项目会跳过项目级 `.codex` 配置、hooks 和 rules

---

## 4. 生效优先级：改了没反应先看这里

同一个字段最终谁说了算，通常按这个顺序：

1. CLI flags / `--config`
2. 项目 `.codex/config.toml`（从项目根到当前目录，越近越优先；仅信任项目加载）
3. `--profile <name>` 选中的 `$CODEX_HOME/profile-name.config.toml`
4. 用户 `~/.codex/config.toml`
5. 系统级配置
6. 内置默认值

最常见的 4 个坑：

1. 改了用户配置，但项目 `.codex/config.toml` 覆盖了
2. 当前会话没重启，仍然用旧状态
3. 用了 `--profile`，但实际 profile 文件不是你以为的那一份
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

历史本机模板与本次更新建议：

1. 历史私有模板 provider：`my_codex`（本文未读取当前私有配置）
2. 当前官方模型示例：`gpt-6.1-sol`；困难任务评估 `gpt-6-astra`，轻任务评估 `gpt-6-luna`；私有网关以其真实开放列表为准
3. 默认权限：`on-request + workspace-write`
4. 默认推理：`medium`
5. 上下文预算：默认由模型目录决定，不再照抄历史 `1050000 / 900000`
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
model = "gpt-6.1-sol"

approval_policy = "on-request"
approvals_reviewer = "user"
sandbox_mode = "workspace-write"

model_reasoning_effort = "medium"
# 默认沿用模型目录预算；仅在 provider 明确提供窗口参数时再设置以下字段。
# model_context_window = 272000
# model_auto_compact_token_limit = 220000

# 当前稳定版 schema 不再包含 disable_response_storage，不要继续照抄旧字段。
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
command = "cmd"
args = ["/c", "npx", "-y", "@upstash/context7-mcp"]

[mcp_servers.chrome-devtools]
command = "cmd"
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"]
startup_timeout_sec = 20

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
model = "gpt-6.1-sol"
```

注意：

1. 文章里的模型名只是模板示例
2. 真正能不能用，看当前 provider / 网关是否开放
3. 如果 `/status` 或模型列表看不到它，先查网关后台
4. 当前角色建议是：`gpt-6.1-sol` 负责日常编码与一般复杂任务，`gpt-6-astra` 负责最困难任务，`gpt-6-luna` 负责轻量任务；旧 GPT-5.6 名称仍保留兼容价值
5. 升级示例前先确认账号和网关支持；轻量任务可以单独配置 Luna profile

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
| `on-request` | 日常开发推荐，必要时请求人工确认 |
| `never` | 自动化或隔离环境，风险更高 |
| `granular = { ... }` | 按 sandbox、rules、MCP elicitation 等类别细分审批 |

`untrusted` 已不再是可直接填写的 `approval_policy` 值。它仍可作为项目的 `trust_level`，表示该项目不加载项目级配置、hooks 和 rules；升级到 CLI 0.149.0 及以上后，旧配置中的 `approval_policy = "untrusted"` 必须删除或改成 `on-request` / `never`。

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
4. `xhigh`：更深，且是否可用取决于模型
5. `max`：当前 GPT-6 系列及部分旧模型的高强度档，是否可用依模型而定
6. `ultra`：GPT-6.1 Sol、GPT-6 Sol 与 Astra 等模型的目录可包含此档，伴随自动任务委派；Luna 当前目录不包含此档，仍以 `/model` 为准

不同模型支持的档位不完全一致，CLI 与 API 的推理参数也不能混为一张表。配置前先看 `/model`，不要长期硬编码一套“所有模型通用”的档位说明。

### 7.8 上下文窗口

历史模板曾手工配置 1M 窗口，本次改为由目录决定预算。以下仅演示显式覆盖的语法：

```toml
# 默认沿用模型目录预算；仅在 provider 明确提供窗口参数时再设置以下字段。
# model_context_window = 272000
# model_auto_compact_token_limit = 220000
```

注意：

1. 它不是强行把模型变成 1M 上下文
2. 它只是告诉 Codex 按多大预算管理上下文
3. 真实能力看模型和网关
4. compact 阈值必须小于 context window

更稳妥的日常档：

```toml
# 未核实 provider 元数据时，删除手工窗口与压缩阈值覆盖，让 Codex 使用模型目录默认值。
```

### 7.9 `disable_response_storage`

```toml
# 当前稳定版 schema 不再包含 disable_response_storage，不要继续照抄旧字段。
```

此键已不在 `0.162.1` 的配置 schema 中，应从新模板删除。不能据此承诺服务端不存储数据；历史文件可用 `--strict-config` 找出残留字段，数据策略以当前认证方式、产品设置与官方说明为准。

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

本篇保留旧机器的脱敏参考，未验证私有网关当前是否可用。新接入优先按服务商实际鉴权方式选择 `env_key`、OAuth 或凭据存储，不把历史 `requires_openai_auth` 组合当通用要求。

---

## 9. MCP 配置：Context7 与 Chrome DevTools

### 9.1 Context7

```toml
[mcp_servers.context7]
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
command = "cmd"
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"]
startup_timeout_sec = 20
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
3. 是否加载了预期的 profile 文件

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

## 16. 推荐 profile 文件

官方当前写法是把 profile 做成独立文件，放在 `$CODEX_HOME` 目录下，而不是继续写成主 `config.toml` 里的 `[profiles.<name>]` 表：

1. `C:\Users\HN246\.codex\dev_safe.config.toml`
2. `C:\Users\HN246\.codex\readonly_audit.config.toml`
3. `C:\Users\HN246\.codex\deep_refactor.config.toml`

`dev_safe.config.toml` 示例：

```toml
model = "gpt-6.1-sol"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
model_reasoning_effort = "medium"
```

`readonly_audit.config.toml` 示例：

```toml
model = "gpt-6.1-sol"
approval_policy = "never"
sandbox_mode = "read-only"
model_reasoning_effort = "medium"
```

`deep_refactor.config.toml` 示例：

```toml
model = "gpt-6.1-sol"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
model_reasoning_effort = "high"
```

调用方式：

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


---

## 18. 0.162.1 全量配置索引

本节按稳定版随包 schema 枚举，不把“schema 接受”解释成“当前账号已开放”。共有 **102 个顶层键**；嵌套索引列出所有可静态枚举的字段和动态映射入口。`<键>` 代表实际 provider ID、server 名、路径、域名或应用 ID；`[]` 代表 TOML 数组元素。schema 默认与客户端最终默认不同，未设字段继续受到模型、平台、server 和 managed requirements 影响。

完整基准：[0.162.1 配置 schema](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/core/config.schema.json)、[配置类型](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/config/src/config_toml.rs)。英文原始边界说明保留在表中，便于升级时逐项比对。

### 18.1 顶层全部字段


| 字段 | 类型 / 取值 | 用途与边界 |
|---|---|---|
| `agents` | 表/对象 | Agent 角色、并发、深度和子代理默认模型；按任务开启。 |
| `allow_login_shell` | boolean | 允许 shell 工具请求 login shell；未设时默认允许。 |
| `allow_symlinked_codex_home` | boolean | macOS 下是否信任 Codex home 的符号链接目标；仅宿主用户启动配置读取。 |
| `analytics` | 表/对象 | 机器上的产品分析开关；enabled 默认 true。 |
| `approval_policy` | "on-request" 或 表/对象 或 "never" | 何时请求审批；命令行支持 on-request/never，配置还支持 granular 分类控制。 |
| `approvals_reviewer` | "user" / "auto_review" / "guardian_subagent" | 审批交给 user 或 auto_review；不会取消其他独立安全检查。 |
| `apps` | 表/对象 | Apps/连接器的默认策略、单应用和单工具策略。 |
| `apps_mcp_product_sku` | string | 产品拥有的 Apps MCP SKU 标记；通常由产品管理。 |
| `audio` | 表/对象 | 机器上的语音输入输出设备与输入声道偏好。 |
| `auto_review` | 表/对象 | 自动审批审核器的 policy、extra_policy 和熔断策略。 |
| `background_terminal_max_timeout` | integer；最小 0.0 | 后台终端单次轮询上限，毫秒；默认 300000。 |
| `browser_use` | 表/对象 | 按 origin 控制浏览器访问、上传下载及 CDP 权限。 |
| `chatgpt_base_url` | string | ChatGPT 请求基址，与 OpenAI API provider 基址分开。 |
| `check_for_update_on_startup` | boolean | 启动检查升级；默认 true，集中管理升级时可关闭。 |
| `cli_auth_credentials_store` | "file" 或 "keyring" 或 "auto" 或 "ephemeral" | file/keyring/auto 凭据后端；未配置默认 file，不保证存在 auth.json。 |
| `cloud` | 表/对象 | 云端拥有的设置，含 bundled skills。 |
| `compact_prompt` | string | 压缩会话历史的提示词覆盖；通常保持默认。 |
| `computer_use` | 表/对象 | 按 macOS bundle ID、Windows AUMID/EXE 控制桌面应用访问。 |
| `daybreak` | boolean | 新线程的 Daybreak 偏好；另需 cli_daybreak opt-in、合格账号和模型支持。 |
| `default_permissions` | string | 选择内置 :workspace/:read-only 等或命名权限 profile。 |
| `desktop` | 对象（动态键） | 桌面设置透传对象，CLI schema 不枚举其任意键；具体由桌面版本决定。 |
| `developer_instructions` | string | 作为 developer 消息提供的额外指令。 |
| `disable_paste_burst` | boolean | 旧兼容键，优先使用 tui.disable_paste_burst。 |
| `experimental_compact_prompt_file` | string | 实验性的压缩提示词文件覆盖。 |
| `experimental_realtime_start_instructions` | string | 实验语音传输/模型/提示上下文覆盖；源码标注不要作为日常配置。 |
| `experimental_realtime_webrtc_call_base_url` | string | 实验语音传输/模型/提示上下文覆盖；源码标注不要作为日常配置。 |
| `experimental_realtime_ws_backend_prompt` | string | 实验语音传输/模型/提示上下文覆盖；源码标注不要作为日常配置。 |
| `experimental_realtime_ws_base_url` | string | 实验语音传输/模型/提示上下文覆盖；源码标注不要作为日常配置。 |
| `experimental_realtime_ws_model` | string | 实验语音传输/模型/提示上下文覆盖；源码标注不要作为日常配置。 |
| `experimental_realtime_ws_startup_context` | string | 实验语音传输/模型/提示上下文覆盖；源码标注不要作为日常配置。 |
| `experimental_thread_store` | 表/对象 | 实验线程存储实现；不要作为日常配置。 |
| `experimental_use_unified_exec_tool` | boolean | 旧实验执行工具开关，优先查 features.unified_exec。 |
| `features` | 表/对象 | 全部功能开关及少量带结构的配置；须同时查看生命周期状态。 |
| `feedback` | 表/对象 | 反馈收集开关，默认启用。 |
| `file_opener` | "vscode" / "vscode-insiders" / "windsurf" / "cursor" 或 "none" | 本地文件引用的链接协议/编辑器。 |
| `forced_chatgpt_workspace_id` | string 或 数组&lt;string&gt; | 限定可登录的 ChatGPT workspace。 |
| `forced_login_method` | "chatgpt" / "api" | 限定允许的登录方式。 |
| `ghost_snapshot` | 表/对象 | 仅为历史配置兼容保留，不代表恢复旧 undo 功能。 |
| `goals` | 表/对象 | 持续目标的 token 预算上限。 |
| `hide_agent_reasoning` | boolean；schema 默认 false | 隐藏公开推理事件；默认 false。 |
| `history` | 表/对象 | history.jsonl 的持久化与大小上限，不等于完整线程存储。 |
| `hooks` | 表/对象 | 生命周期 Hook 和信任状态；执行需符合来源信任规则。 |
| `include_apps_instructions` | boolean | 控制注入 Apps 指令块。 |
| `include_collaboration_mode_instructions` | boolean | 控制注入协作模式指令块。 |
| `include_environment_context` | boolean | 控制注入环境上下文。 |
| `include_permissions_instructions` | boolean | 控制注入权限指令块。 |
| `instructions` | string | 系统指令覆盖；通常保持产品默认。 |
| `log_dir` | string | 日志目录，默认 $CODEX_HOME/log；显式设置还会启用 TUI 文本日志。 |
| `marketplaces` | 映射&lt;表/对象&gt;；schema 默认 {} | 插件市场来源与同步元数据；通常通过 plugin marketplace 管理。 |
| `mcp_enterprise_managed_auth` | 表/对象 | 企业 IdP 管理的 MCP/插件共享认证。 |
| `mcp_oauth_callback_port` | integer；最小 0.0 | MCP OAuth 本地回调端口，未设时随机可用端口。 |
| `mcp_oauth_callback_url` | string | OAuth 重定向 URI；本地监听仍绑定 loopback。 |
| `mcp_oauth_credentials_store` | "auto" 或 "file" 或 "keyring" | MCP OAuth 凭据保存后端，与 CLI 登录凭据分开。 |
| `mcp_optional_startup_grace_ms` | integer；最小 0.0 | 初始工具目录等待可选 MCP 的共享时间，默认 1000ms；0 改为逐服务超时。 |
| `mcp_servers` | 映射&lt;表/对象&gt;；schema 默认 {} | 外部 MCP 服务、OAuth、工具白名单、超时与工具审批。 |
| `memories` | 表/对象 | 记忆使用、生成、提取、合并与清理策略。 |
| `model` | string | 默认模型覆盖；未设时允许服务端/目录选择默认模型。 |
| `model_auto_compact_token_limit` | integer | 触发自动压缩的 token 阈值，不能扩大模型实际窗口。 |
| `model_auto_compact_token_limit_scope` | "total" 或 "body_after_prefix" | 压缩阈值计入完整上下文或 carried prefix 后的 token。 |
| `model_catalog_json` | string | 启动时加载模型目录 JSON；线程内覆盖不会重新加载。 |
| `model_context_window` | integer | 上下文预算覆盖，实际支持仍由模型和 provider 决定。 |
| `model_instructions_file` | string | 覆盖模型内置指令；源码强烈不建议普通用户使用。 |
| `model_post_turn_compact_threshold_percent` | integer；最小 0.0；最大 100.0 | 最终回答后的压缩比例阈值 0–100，0/未设关闭。 |
| `model_provider` | string | 选择 provider ID；须对应内置或自定义 provider。 |
| `model_providers` | 映射&lt;表/对象&gt;；schema 默认 {} | 自定义 provider 目录；不可覆盖内置 ID。 |
| `model_reasoning_effort` | string；最短 1 | 推理强度，允许值与模型实际支持是两件事。 |
| `model_reasoning_summary` | "auto" / "concise" / "detailed" 或 "none" | 推理摘要方式，与 reasoning effort 分开。 |
| `model_verbosity` | "low" / "medium" / "high" | 模型文本详细度，须模型支持。 |
| `notice` | 表/对象 | 已读通知和迁移提示状态，通常由界面写入。 |
| `notify` | 数组&lt;string&gt; | 通知外部命令；不是工具权限开关。 |
| `openai_base_url` | string | 内置 openai provider 的 API 基址覆盖。 |
| `orchestrator` | 表/对象 | 环境编排层拥有的 MCP/skills 开关。 |
| `oss_provider` | string | 本地模型默认 provider，例如 ollama/lmstudio。 |
| `otel` | 表/对象 | 遥测导出、trace、metrics、TLS 与日志数据范围。 |
| `permissions` | 对象（动态键） | 命名权限 profile，含继承、文件系统、网络与工作区根。 |
| `personality` | "none" / "friendly" / "pragmatic" | 已弃用兼容键；friendly/pragmatic 不再选择回复风格。 |
| `plan_mode_reasoning_effort` | string；最短 1 | Plan 模式单独的推理强度。 |
| `plugins` | 映射&lt;表/对象&gt;；schema 默认 {} | 单插件及其 MCP 服务启用和工具策略。 |
| `profile` | string | 旧内联 profile 选择器；新 --profile 使用独立文件。 |
| `profiles` | 映射&lt;表/对象&gt;；schema 默认 {} | 历史 [profiles.*] 表兼容结构；与新同名 --profile 冲突。 |
| `project_doc_fallback_filenames` | 数组&lt;string&gt;；schema 默认 [] | 找不到 AGENTS.md 时按顺序尝试的文件名。 |
| `project_doc_max_bytes` | integer；最小 0.0；schema 默认 32768 | 全部选中环境的项目指令字节上限。 |
| `project_root_markers` | 数组&lt;string&gt; | 发现项目根的标记，未设默认 .git。 |
| `projects` | 映射&lt;表/对象&gt; | 按项目路径保存 trusted/untrusted 信任状态。 |
| `realtime` | 表/对象 | 实验语音会话版本、类型、transport 和 voice 选择。 |
| `responses_api_metadata` | 映射&lt;string&gt; | 产品拥有的 Responses metadata，不是任意无限制业务字段。 |
| `review_model` | string | 审查模型覆盖，未设沿用当前会话模型。 |
| `sandbox_mode` | "read-only" / "workspace-write" / "danger-full-access" | 旧沙箱权限表达：read-only/workspace-write/danger-full-access。 |
| `sandbox_workspace_write` | 表/对象 | workspace-write 的附加可写目录、网络和临时目录策略。 |
| `service_tier` | string | 服务速度/调度档位请求，例如 default/priority/flex；fast 为兼容值，支持取决于模型。 |
| `shell_environment_policy` | 任意 JSON 值 | 子进程环境变量继承、过滤、白名单和显式设置。 |
| `show_raw_agent_reasoning` | boolean | 展示可用原始推理事件，默认 false；不保证所有模型提供。 |
| `skills` | 表/对象 | Skills 开关、单 skill 配置及指令上下文预算。 |
| `sqlite_home` | string | SQLite 状态位置，默认 CODEX_SQLITE_HOME 或 CODEX_HOME。 |
| `suppress_unstable_features_warning` | boolean | 隐藏开发中开关提示，不会让功能变稳定。 |
| `thread_unload_delay_secs` | integer；最小 0.0 | 无订阅且无活动的线程卸载延迟，默认 60s；需服务器重启。 |
| `tool_output_token_limit` | integer；最小 0.0 | 上下文保存工具输出的 token 预算。 |
| `tool_suggest` | 表/对象 | 工具安装建议的可发现项及禁用项。 |
| `tools` | 表/对象 | update_plan、web search 等工具的嵌套配置。 |
| `tui` | 表/对象 | 终端显示、快捷键、复制、渲染、通知、会话选择等。 |
| `web_search` | "disabled" / "cached" / "indexed" / "live" | disabled/cached/indexed/live；--search 请求 live。 |
| `windows` | 表/对象 | Windows 沙箱实现选择，与任务 sandbox_mode 分开。 |


### 18.2 所有嵌套字段

浏览器/桌面设置 `desktop` 是不透明对象；CLI 无法为它提供全量键表，前面的本机样例仅有历史参考价值。`profiles.<键>` 是旧内联表的兼容 schema，新独立 profile 文件使用顶层键，不照抄此旧结构。

union 分支共享字段路径时，类型列合并所有取值，说明中的“分支必填”只针对对应 schema 分支；例如 Hook 的 command、mcp_tool、prompt、agent 动作并非必须同时填写所有字段，按 type 选择一套结构。


#### `agents`

Agent 角色、并发、深度和子代理默认模型；按任务开启。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `agents.default_subagent_model` | string | 子代理默认模型。Default model for spawned subagents when the spawn call does not select one. |
| `agents.default_subagent_reasoning_effort` | string；最短 1 | 子代理默认推理强度。Default reasoning effort for spawned subagents when the spawn call does not select one. |
| `agents.enabled` | boolean | 是否启用。Whether multi-agent tools are enabled. Defaults to true. An enabled `features.multi_agent_v2` setting takes precedence. |
| `agents.interrupt_message` | boolean | Whether to record a model-visible message when an agent turn is interrupted. Defaults to true. |
| `agents.max_concurrent_threads_per_session` | integer；最小 1.0 | 每会话并发线程上限。Maximum number of spawned agent threads that can be open concurrently per session. When unset, the selected multi-agent backend uses its default. |
| `agents.max_depth` | integer | 子代理深度上限。Maximum nesting depth for V1 agent threads. Ignored by V2. |
| `agents.<键>` | 表/对象 | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `agents.<键>.config_file` | string | 角色配置文件。Path to a role-specific config layer. Relative paths are resolved relative to the `config.toml` that defines them. |
| `agents.<键>.description` | string | 说明。Human-facing role documentation used in spawn tool guidance. Required unless supplied by the referenced agent role file. |
| `agents.<键>.nickname_candidates` | 数组&lt;string&gt; | 子代理昵称候选。Candidate nicknames for agents spawned with this role. |


#### `analytics`

机器上的产品分析开关；enabled 默认 true。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `analytics.enabled` | boolean | 是否启用。When `false`, disables analytics across Codex product surfaces in this profile. |


#### `approval_policy`

何时请求审批；命令行支持 on-request/never，配置还支持 granular 分类控制。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `approval_policy.granular` | 表/对象 | 此 schema 分支必填。该键属于 `approval_policy` 配置；值形状见类型列，schema 未提供额外说明。 |
| `approval_policy.granular.mcp_elicitations` | boolean | 此 schema 分支必填。Whether to allow MCP elicitation prompts. |
| `approval_policy.granular.request_permissions` | boolean；schema 默认 false | Whether to allow prompts triggered by the `request_permissions` tool. |
| `approval_policy.granular.rules` | boolean | 此 schema 分支必填。Whether to allow prompts triggered by execpolicy `prompt` rules. |
| `approval_policy.granular.sandbox_approval` | boolean | 此 schema 分支必填。Whether to allow shell command approval requests, including inline `with_additional_permissions` and `require_escalated` requests. |
| `approval_policy.granular.skill_approval` | boolean；schema 默认 false | Whether to allow approval prompts triggered by skill script execution. |


#### `apps`

Apps/连接器的默认策略、单应用和单工具策略。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `apps._default` | 表/对象 | Default settings for all apps. |
| `apps._default.approvals_reviewer` | "user" / "auto_review" / "guardian_subagent" | 审批审核者。Reviewer for approval prompts unless overridden by per-app settings. |
| `apps._default.default_tools_approval_mode` | "auto" / "prompt" / "writes" / "approve" | 默认工具审批方式。Approval mode for tools unless overridden by per-app or per-tool settings. |
| `apps._default.destructive_enabled` | boolean | Whether tools with `destructive_hint = true` are allowed by default. |
| `apps._default.enabled` | boolean；schema 默认 true | 是否启用。When `false`, apps are disabled unless overridden by per-app settings. |
| `apps._default.open_world_enabled` | boolean | Whether tools with `open_world_hint = true` are allowed by default. |
| `apps.<键>` | 表/对象 | Config values for a single app/connector. |
| `apps.<键>.approvals_reviewer` | "user" / "auto_review" / "guardian_subagent" | 审批审核者。Reviewer for approval prompts from this app, overriding the thread default. |
| `apps.<键>.default_tools_approval_mode` | "auto" / "prompt" / "writes" / "approve" | 默认工具审批方式。Approval mode for tools in this app unless a tool override exists. |
| `apps.<键>.default_tools_enabled` | boolean | Whether tools are enabled by default for this app. |
| `apps.<键>.destructive_enabled` | boolean | Whether tools with `destructive_hint = true` are allowed for this app. |
| `apps.<键>.enabled` | boolean；schema 默认 true | 是否启用。When `false`, Codex does not surface this app. |
| `apps.<键>.links` | 映射&lt;表/对象&gt; | Per-account approval settings keyed by link ID. |
| `apps.<键>.links.<键>` | 表/对象 | Approval settings for a connected account within an app. |
| `apps.<键>.links.<键>.approvals_reviewer` | "user" / "auto_review" / "guardian_subagent" | 审批审核者。Reviewer for approval prompts from this account, overriding the app default. |
| `apps.<键>.links.<键>.default_tools_approval_mode` | "auto" / "prompt" / "writes" / "approve" | 默认工具审批方式。Approval mode for this account unless a tool override exists. |
| `apps.<键>.omit_tools_from` | 数组&lt;"code_mode" 或 "deferred" 或 "direct"&gt; | Model-facing surfaces from which this connector's tools must be omitted, in addition to any server-level omissions. `None` leaves lower-priority configuration unchanged; an empty list clears connector-level omissions. |
| `apps.<键>.open_world_enabled` | boolean | Whether tools with `open_world_hint = true` are allowed for this app. |
| `apps.<键>.tools` | 映射&lt;表/对象&gt; | Per-tool settings for this app. |
| `apps.<键>.tools.<键>` | 表/对象 | Per-tool settings for a single app tool. |
| `apps.<键>.tools.<键>.approval_mode` | "auto" / "prompt" / "writes" / "approve" | 单工具审批方式。Approval mode for this tool. |
| `apps.<键>.tools.<键>.enabled` | boolean | 是否启用。Whether this tool is enabled. `Some(true)` explicitly allows this tool. |


#### `audio`

机器上的语音输入输出设备与输入声道偏好。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `audio.microphone` | string | 该键属于 `audio` 配置；值形状见类型列，schema 未提供额外说明。 |
| `audio.microphone_channel` | integer；最小 1.0 或 数组&lt;integer；最小 1.0&gt; | One-based microphone channels to mix; unset mixes all input channels. |
| `audio.speaker` | string | 该键属于 `audio` 配置；值形状见类型列，schema 未提供额外说明。 |


#### `auto_review`

自动审批审核器的 policy、extra_policy 和熔断策略。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `auto_review.circuit_break_action` | "default" 或 "strict" | Controls whether circuit-breaker interruptions include a structured error. Strict mode writes structured errors that older clients may not recognize when reading shared history. Defaults to `default`. |
| `auto_review.conversation_history_max_output_tokens` | integer；最小 1.0 | Maximum estimated tokens per Guardian history-tool response, before the standard serialization allowance. Defaults to 4,000; stricter parent tool limits still apply. |
| `auto_review.experimental_conversation_history_prompt` | string | Experimental replacement for the history-retrieval instructions when history tools and Apps are enabled. Omitted or blank values use the built-in prompt. |
| `auto_review.experimental_policy_template` | string | Experimental full Guardian prompt template containing the tenant policy placeholder. |
| `auto_review.extra_policy` | string | Additional policy text inserted into the Guardian template's `{{ extra_policy }}` slot. |
| `auto_review.policy` | string | Additional policy instructions inserted into the guardian prompt. |


#### `browser_use`

按 origin 控制浏览器访问、上传下载及 CDP 权限。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `browser_use.allow_history_access` | boolean | 该键属于 `browser_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `browser_use.default_origin_policy` | 表/对象 | 该键属于 `browser_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `browser_use.default_origin_policy.access` | "allow" / "deny" | 访问策略；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `browser_use.default_origin_policy.downloads` | "allow" / "deny" | 下载策略；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `browser_use.default_origin_policy.full_cdp_access` | "allow" / "deny" | 完整 CDP 控制；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `browser_use.default_origin_policy.uploads` | "allow" / "deny" | 上传策略；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `browser_use.origins` | 映射&lt;表/对象&gt; | 该键属于 `browser_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `browser_use.origins.<键>` | 表/对象 | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `browser_use.origins.<键>.access` | "allow" / "deny" | 访问策略；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `browser_use.origins.<键>.downloads` | "allow" / "deny" | 下载策略；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `browser_use.origins.<键>.full_cdp_access` | "allow" / "deny" | 完整 CDP 控制；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `browser_use.origins.<键>.uploads` | "allow" / "deny" | 上传策略；没有额外 schema 默认值时，由运行时与上层配置决定。 |


#### `cloud`

云端拥有的设置，含 bundled skills。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `cloud.skills` | 表/对象 | Cloud skills are permitted by default; the host must supply a cloud provider. |
| `cloud.skills.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |


#### `computer_use`

按 macOS bundle ID、Windows AUMID/EXE 控制桌面应用访问。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `computer_use.default_app_access` | "allow" / "deny" | 该键属于 `computer_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `computer_use.macos` | 表/对象 | 该键属于 `computer_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `computer_use.macos.bundle_ids` | 映射&lt;"allow" / "deny"&gt; | 该键属于 `computer_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `computer_use.macos.bundle_ids.<键>` | "allow" / "deny" | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `computer_use.windows` | 表/对象 | 该键属于 `computer_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `computer_use.windows.aumids` | 映射&lt;"allow" / "deny"&gt; | 该键属于 `computer_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `computer_use.windows.aumids.<键>` | "allow" / "deny" | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `computer_use.windows.exes` | 数组&lt;表/对象&gt; | 该键属于 `computer_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `computer_use.windows.exes[].access` | "allow" / "deny" | 此 schema 分支必填。访问策略；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `computer_use.windows.exes[].binary_name` | string | 该键属于 `computer_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `computer_use.windows.exes[].product_name` | string | 此 schema 分支必填。该键属于 `computer_use` 配置；值形状见类型列，schema 未提供额外说明。 |
| `computer_use.windows.exes[].publisher_name` | string | 此 schema 分支必填。该键属于 `computer_use` 配置；值形状见类型列，schema 未提供额外说明。 |


#### `experimental_thread_store`

实验线程存储实现；不要作为日常配置。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `experimental_thread_store.type` | "local" | 此 schema 分支必填。该键属于 `experimental_thread_store` 配置；值形状见类型列，schema 未提供额外说明。 |


#### `features`

全部功能开关及少量带结构的配置；须同时查看生命周期状态。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `features.agent_message_board` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.analytics_plan_history` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.api_key_cyber_access_programs` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.api_key_model_discovery` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.apply_patch_freeform` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.apply_patch_preserve_line_endings` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.apply_patch_streaming_events` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.apps` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.apps_mcp_path_override` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.apps_mcp_path_override.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.apps_mcp_path_override.path` | string | 路径；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.auth_elicitation` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.background_paginated_rollout_migration` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.bedrock_setup_wizard` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.browser_annotation_api` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.browser_use` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.browser_use_external` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.browser_use_full_cdp_access` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.chronicle` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.cli_daybreak` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.code_mode` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.code_mode.default_exec_yield_time_ms` | integer；最小 0.0 | Default yield timeout for code-mode exec calls, in milliseconds. |
| `features.code_mode.direct_only_tool_namespaces` | 数组&lt;string&gt; | Exact tool namespaces to expose only as direct model tools. These tools bypass deferral, remain top-level in code-mode-only sessions, and are omitted from the nested code-mode tool surface. |
| `features.code_mode.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.code_mode.excluded_tool_namespaces` | 数组&lt;string&gt; | Exact tool namespaces to omit from the code-mode nested tool surface. |
| `features.code_mode.experimental_show_cell_overhead` | boolean | Show handler duration, code-mode host duration, and harness overhead in each code-mode cell response. Experimental: this option and the response format may change or be removed. |
| `features.code_mode.tool_input_schema_max_bytes` | integer；最小 1.0 | 工具输入 schema 字节预算。Maximum UTF-8 bytes per rendered tool input type, with a 16,000-byte minimum and default. For ordinary MCP tools, this is also at least their server's explicitly configured input limit. |
| `features.code_mode_buffered_exec` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.code_mode_host` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.code_mode_host.disable_in_process_fallback` | boolean | Keep code mode fail-closed when the standalone host is unavailable. |
| `features.code_mode_host.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.code_mode_interrupt` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.code_mode_only` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.code_mode_only_strict_3p_tools` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.code_mode_prewarm` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.code_mode_tool_search` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.codex_apps_mcp_2026_07_28` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.codex_git_commit` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.codex_hooks` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.collab` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.collaboration_modes` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.compaction_image_budget` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.computer_use` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.concurrent_reasoning_summaries` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.connectors` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.content_item_kinds` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.context_management` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.context_management.experimental_mode` | boolean | Enables experimental context management. |
| `features.current_time_reminder` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.current_time_reminder.clock_source` | "system" / "external" | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.current_time_reminder.delivery_mode` | "any_inference" 或 "after_user_or_tool_output" | Which inference boundaries may receive current-time reminders. |
| `features.current_time_reminder.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.current_time_reminder.reminder_interval_seconds` | integer；最小 0.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.current_time_reminder.sleep_tool` | boolean | Expose the input-interruptible `clock.sleep` tool. |
| `features.cwd_relative_turn_diffs` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.daemon_auto_start` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.default_mode_request_user_input` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.defer_mailbox_preemption` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.deferred_executor` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.deferred_tool_world_state` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.elevated_windows_sandbox` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.enable_experimental_windows_sandbox` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.enable_fanout` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.enable_mcp_apps` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.enable_request_compression` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.exec_permission_approvals` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.executed_tool_call_metadata` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.executor_capability_discovery` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.experimental_use_unified_exec_tool` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.experimental_windows_sandbox` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.external_agent_memory_import` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.external_migration` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.fast_mode` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.goals` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardian_approval` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardian_conversation_history_tools` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardian_enhanced_node_repl_transcripts` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardian_ext` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardian_node_repl_transcript_images` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardian_reuse_parent_compaction` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardian_root_handoff_context` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.async_classifier_conversation_token_limit` | integer；最小 1.0 | Reset retained async history when the next request exceeds this token estimate. Defaults to 100,000. Fresh requests remain subject to the model's input limit. |
| `features.guardianv2.async_classifier_mode` | "snapshot" / "conversation" | Classifier experiment override. Otherwise use the model default, then snapshots. |
| `features.guardianv2.classifier_instructions` | string | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.guardianv2.free_guardian` | boolean | Legacy setting retained for config compatibility; the backend now controls Guardian billing. |
| `features.guardianv2.max_action_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.max_classifier_instruction_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.max_parent_compaction_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.max_tool_call_lag` | integer；最小 0.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.persist_scores` | boolean | Persist reviewed actions and risk scores to rollout files for debugging. |
| `features.guardianv2.reasoning_effort` | string；最短 1 | A non-empty reasoning effort value advertised by the model. |
| `features.guardianv2.reuse_parent_compaction` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.review_scope` | 表/对象 | Optional tool-call categories available to the Guardian v2 classifier. |
| `features.guardianv2.review_scope.computer_use_only` | boolean | Restrict asynchronous classification and fast approvals to browser and computer-use tools. |
| `features.guardianv2.review_scope.sandboxed_exec_commands` | boolean | Include sandboxed shell command calls in Guardian v2 classification. |
| `features.guardianv2.review_threshold` | number；最小 0.0；最大 1.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.thread_context` | boolean | Deprecated and ignored; thread-owned Guardian context is always enabled. |
| `features.guardianv2.transcript` | 表/对象 | Bounds and optional sources for the Guardian v2 conversation transcript. |
| `features.guardianv2.transcript.include_images` | boolean | Include recent screenshots from messages and configured tool outputs. |
| `features.guardianv2.transcript.max_message_entry_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.transcript.max_message_transcript_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.transcript.max_recent_non_user_entries` | integer；最小 1.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.transcript.max_tool_entry_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.transcript.max_tool_transcript_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.transcript.sources` | 数组&lt;"tool_calls" / "tool_outputs" / "reasoning"&gt; | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.guardianv2.transcript_mode` | "line" 或 "json" | Transcript encoding for synchronous Guardian review and asynchronous scoring. Defaults to line. |
| `features.guardianv2_decisions_comparison` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.hooks` | boolean | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.image_detail_original` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.image_generation` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.image_resize_notice` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.imagegenext` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.in_app_browser` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.in_app_chat` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.in_app_dictation` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.in_app_local_automation` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.in_app_updates` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.in_app_voice` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.incremental_tools` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.instant_interrupt` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.item_ids` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.js_repl` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.js_repl_tools_only` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.local_thread_store_compression` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.local_thread_store_shared_compression` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.login_shell_package_path` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.mcp_2026_07_28` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.mcp_oauth_refresh_coordination` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.memories` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.memory_tool` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.mentions_v2` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.model_catalog_in_context` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_mode` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.default_wait_timeout_ms` | integer；最小 0.0；最大 3600000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.disable_direct_message` | boolean | Disable the model's direct-message tools; spawning and automatic child results remain available. |
| `features.multi_agent_v2.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.multi_agent_v2.expose_spawn_agent_model_overrides` | boolean | Exposes `model` and `reasoning_effort` on the multi-agent v2 spawn tool and adds corresponding guidance to root and subagent usage hints. |
| `features.multi_agent_v2.hide_spawn_agent_metadata` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.max_concurrent_threads_per_session` | integer；最小 1.0 | 每会话并发线程上限；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.multi_agent_v2.max_wait_timeout_ms` | integer；最小 0.0；最大 3600000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.message_board_in_memory` | boolean | Keep the message board in memory for a training session, including ephemeral sessions. |
| `features.multi_agent_v2.message_board_remote` | 表/对象 | Use a session-scoped remote board instead of local storage. |
| `features.multi_agent_v2.message_board_remote.bearer_token` | string | Board credential supplied directly by a runtime config override. |
| `features.multi_agent_v2.message_board_remote.bearer_token_env_var` | string | Bearer token 环境变量名。Read the credential from this environment variable instead of bearer_token. |
| `features.multi_agent_v2.message_board_remote.url` | string | 此 schema 分支必填。服务 URL；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.multi_agent_v2.min_wait_timeout_ms` | integer；最小 0.0；最大 3600000.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.multi_agent_mode_hint_text` | string | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.non_code_mode_only` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.root_agent_usage_hint_text` | string | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.subagent_developer_instructions` | string | Overrides inherited developer instructions for subagents without role-specific instructions. |
| `features.multi_agent_v2.subagent_usage_hint_text` | string | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.tool_namespace` | string；最短 1；最长 64 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.usage_hint_enabled` | boolean | Deprecated compatibility field. Its value is ignored. |
| `features.multi_agent_v2.usage_hint_text` | string | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.multi_agent_v2.wait_agent_enabled` | boolean | Expose the multi-agent v2 `wait_agent` tool. |
| `features.multi_agent_v2_dynamic_tools` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.allow_local_binding` | boolean | 本地监听与 loopback/私网目的地控制。Permits local servers and direct host-loopback connections and skips the proxy's additional private-network destination checks. Proxy domain rules still apply. Defaults to true for MXC, which cannot enforce false; otherwise defaults to false. |
| `features.network_proxy.allow_upstream_proxy` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.credential_broker` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.credentials` | 映射&lt;表/对象&gt; | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.credentials.<键>` | 表/对象 | Declarative description of an environment-backed credential family. |
| `features.network_proxy.credentials.<键>.auth` | 数组&lt;"bearer" / "token" / "basic" / "header"&gt;；schema 默认 [] | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.credentials.<键>.env` | 数组&lt;string&gt;；schema 默认 [] | 显式环境变量；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.network_proxy.credentials.<键>.header` | string | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.credentials.<键>.patterns` | 数组&lt;string&gt;；schema 默认 [] | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.credentials.<键>.prefix` | string | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.credentials.<键>.url_prefix_from_env` | string | Environment variable containing an additional URL prefix or hostname. |
| `features.network_proxy.credentials.<键>.url_prefixes` | 数组&lt;string&gt;；schema 默认 [] | URL prefixes authorized for injection. Bare loopback hosts imply HTTP; other bare hosts imply HTTPS. |
| `features.network_proxy.dangerously_allow_all_unix_sockets` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.dangerously_allow_non_loopback_proxy` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.domains` | 映射&lt;"allow" / "deny"&gt; | 域名 allow/deny 映射；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.network_proxy.domains.<键>` | "allow" / "deny" | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `features.network_proxy.enable_socks5` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.enable_socks5_udp` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.network_proxy.mode` | "limited" / "full" | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.proxy_url` | string | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.socks_url` | string | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.network_proxy.unix_sockets` | 映射&lt;"allow" / "deny"&gt; | Unix socket allow/deny 映射；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.network_proxy.unix_sockets.<键>` | "allow" / "deny" | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `features.non_prefixed_mcp_tool_names` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.non_prefixed_mcp_tool_names.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.non_prefixed_mcp_tool_names.server_names` | 数组&lt;string&gt; | MCP servers whose tools should omit the legacy `mcp__` namespace prefix. |
| `features.nonfatal_clock_read_errors` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.omit_app_server_notification_media` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.personality` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.plugin_hooks` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.plugin_sharing` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.plugins` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.powershell_shell_version` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.prefer_mxc` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.prevent_idle_sleep` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.psp` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.realtime_conversation` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.reasoning_effort_override` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.recommended_plugins` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.remote_compaction_v2` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.remote_control` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.remote_models` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.remote_plugin` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.request_permissions` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.request_permissions_tool` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.request_rule` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.resize_all_images` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.respect_system_proxy` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.responses_websockets` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.responses_websockets_v2` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.retain_client_developer_messages` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.rollout_budget` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.rollout_budget.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.rollout_budget.limit_tokens` | integer；最小 1.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.rollout_budget.prefill_token_weight` | number；最小 0.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.rollout_budget.reminder_at_remaining_tokens` | 数组&lt;integer&gt; | Remaining weighted-token values that trigger reminders when crossed. |
| `features.rollout_budget.sampling_token_weight` | number；最小 0.0 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.runtime_metrics` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.search_tool` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.secret_auth_storage` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.send_async_message` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.send_message_to_user_async` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.shell_snapshot` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.shell_snapshot_v2` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.shell_tool` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.shell_zsh_fork` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.skill_env_var_dependency_prompt` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.skill_mcp_dependency_install` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.skill_search` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.skip_host_skill_discovery` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.sleep_tool` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.sleep_tool.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.sleep_tool.mode` | "model_driven" 或 "always_on" | How the sleep tool is selected when its feature gate is enabled. |
| `features.sqlite` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.stable_environment_tools` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.standalone_web_search` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.steer` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.step_model_switching` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.system_proxy_fallback` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.telepathy` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.terminal_resize_reflow` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.terminal_visualization_instructions` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.token_budget` | boolean 或 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.token_budget.auto_compact_fallback_buffer_tokens` | integer；最小 1.0 | Additional tokens available after the compaction threshold for fallback note-taking. |
| `features.token_budget.auto_compact_fallback_prompt` | string；最长 2000 | Developer message sampled before an automatic context-window rollover. |
| `features.token_budget.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `features.token_budget.guidance_message` | string；最长 2000 | Guidance appended to the context-window metadata in a developer message. |
| `features.token_budget.reminder_message_template` | string；最短 1；最长 2000 | Reminder template. `{n_remaining}` is replaced with the tokens remaining before auto-compaction. |
| `features.token_budget.reminder_threshold_tokens` | integer；最小 1.0 | Number of tokens remaining before auto-compaction when the wrap-up reminder is emitted. |
| `features.token_budget.use_history_notes_extension` | boolean | Whether to expose the built-in history and notes extension. |
| `features.tool_call_mcp_elicitation` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.tool_registry` | 表/对象 | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.tool_registry.error_on_tool_collisions` | boolean | Fail the turn when multiple tools share the same effective name. |
| `features.tool_registry.turn_metadata_includes_tool_info` | boolean | Include authoritative tool information in per-turn request metadata. |
| `features.tool_search` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.tool_search_always_defer_mcp_tools` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.tool_suggest` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.transcript_v2` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.tui_app_server` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.ultrafast_mode` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.unavailable_dummy_tools` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.unbounded_connection_retries` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.undo` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.unified_exec` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.unified_exec_tty` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.unified_exec_zsh_fork` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.unified_image_budget` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.use_agent_identity` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.use_legacy_landlock` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.use_linux_sandbox_bwrap` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.use_xaa` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.view_image` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.web_search` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.web_search_cached` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.web_search_request` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.windows_sandbox_service` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.workspace_dependencies` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.workspace_owner_usage_nudge` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.worktrees` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |
| `features.write_stdin_approval` | boolean | 该键属于 `features` 配置；值形状见类型列，schema 未提供额外说明。 |


#### `feedback`

反馈收集开关，默认启用。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `feedback.enabled` | boolean | 是否启用。When `false`, disables the feedback flow across Codex product surfaces. |


#### `ghost_snapshot`

仅为历史配置兼容保留，不代表恢复旧 undo 功能。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `ghost_snapshot.disable_warnings` | boolean | Legacy no-op setting retained for compatibility. |
| `ghost_snapshot.ignore_large_untracked_dirs` | integer | Legacy no-op setting retained for compatibility. |
| `ghost_snapshot.ignore_large_untracked_files` | integer | Legacy no-op setting retained for compatibility. |


#### `goals`

持续目标的 token 预算上限。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `goals.max_goal_token_budget` | integer；最小 1.0 | Maximum token budget allowed for a goal and default budget for new goals. |


#### `history`

history.jsonl 的持久化与大小上限，不等于完整线程存储。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `history.max_bytes` | integer；最小 0.0 | 字节上限。If set, the maximum size of the history file in bytes. The oldest entries are dropped once the file exceeds this limit. |
| `history.persistence` | "save-all" 或 "none" | 历史持久化策略。If true, history entries will not be written to disk. |


#### `hooks`

生命周期 Hook 和信任状态；执行需符合来源信任规则。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `hooks.Interrupt` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Interrupt[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.Interrupt[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.Interrupt[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Interrupt[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.Interrupt[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Interrupt[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Interrupt[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Interrupt[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Interrupt[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Interrupt[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Interrupt[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Interrupt[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PermissionRequest` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PermissionRequest[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PermissionRequest[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.PermissionRequest[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PermissionRequest[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PermissionRequest[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PermissionRequest[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PermissionRequest[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PermissionRequest[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PermissionRequest[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PermissionRequest[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PermissionRequest[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PermissionRequest[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PostCompact` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostCompact[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PostCompact[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.PostCompact[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostCompact[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PostCompact[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostCompact[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostCompact[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostCompact[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostCompact[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostCompact[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostCompact[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostCompact[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PostToolUse` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostToolUse[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PostToolUse[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.PostToolUse[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostToolUse[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PostToolUse[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostToolUse[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostToolUse[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostToolUse[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostToolUse[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostToolUse[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostToolUse[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PostToolUse[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PreCompact` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreCompact[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PreCompact[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.PreCompact[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreCompact[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PreCompact[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreCompact[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreCompact[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreCompact[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreCompact[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreCompact[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreCompact[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreCompact[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PreToolUse` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreToolUse[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PreToolUse[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.PreToolUse[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreToolUse[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.PreToolUse[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreToolUse[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreToolUse[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreToolUse[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreToolUse[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreToolUse[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreToolUse[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.PreToolUse[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SessionEnd` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionEnd[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SessionEnd[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.SessionEnd[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionEnd[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SessionEnd[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionEnd[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionEnd[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionEnd[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionEnd[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionEnd[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionEnd[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionEnd[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SessionStart` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionStart[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SessionStart[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.SessionStart[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionStart[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SessionStart[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionStart[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionStart[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionStart[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionStart[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionStart[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionStart[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SessionStart[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.Stop` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Stop[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.Stop[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.Stop[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Stop[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.Stop[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Stop[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Stop[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Stop[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Stop[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Stop[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Stop[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.Stop[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SubagentStart` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStart[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SubagentStart[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.SubagentStart[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStart[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SubagentStart[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStart[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStart[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStart[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStart[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStart[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStart[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStart[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SubagentStop` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStop[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SubagentStop[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.SubagentStop[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStop[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.SubagentStop[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStop[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStop[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStop[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStop[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStop[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStop[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.SubagentStop[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.UserPromptSubmit` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.UserPromptSubmit[].hooks` | 数组&lt;表/对象&gt;；schema 默认 [] | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.UserPromptSubmit[].hooks[].additionalContextLimit` | integer；最小 0.0 | Approximate token threshold for spilling this hook's `additionalContext` to disk. Unset uses 2,500 tokens; `0` disables spilling for this hook. The threshold is evaluated against the original context; a spilled preview also includes recovery metadata. |
| `hooks.UserPromptSubmit[].hooks[].async` | boolean；schema 默认 false | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.UserPromptSubmit[].hooks[].command` | string | 此 schema 分支必填。启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.UserPromptSubmit[].hooks[].commandWindows` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.UserPromptSubmit[].hooks[].statusMessage` | string | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.UserPromptSubmit[].hooks[].timeout` | integer；最小 0.0 | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.UserPromptSubmit[].hooks[].type` | "command" 或 "mcp_tool" 或 "prompt" 或 "agent" | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.UserPromptSubmit[].hooks[].input` | 对象（动态键）；schema 默认 {} | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.UserPromptSubmit[].hooks[].server` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.UserPromptSubmit[].hooks[].tool` | string | 此 schema 分支必填。该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.UserPromptSubmit[].matcher` | string | Hook 匹配条件；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.state` | 映射&lt;表/对象&gt; | 该键属于 `hooks` 配置；值形状见类型列，schema 未提供额外说明。 |
| `hooks.state.<键>` | 表/对象 | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `hooks.state.<键>.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `hooks.state.<键>.trusted_hash` | string | 已信任 Hook 内容摘要；没有额外 schema 默认值时，由运行时与上层配置决定。 |


#### `marketplaces`

插件市场来源与同步元数据；通常通过 plugin marketplace 管理。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `marketplaces.<键>` | 表/对象 | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `marketplaces.<键>.last_revision` | string | Git revision Codex last successfully activated for this marketplace. |
| `marketplaces.<键>.last_updated` | string | Last time Codex successfully added or refreshed this marketplace. |
| `marketplaces.<键>.ref` | string | Git ref to check out when `source_type` is `git`. |
| `marketplaces.<键>.source` | string | Source location used when the marketplace was added. |
| `marketplaces.<键>.source_type` | "git" / "local" | Source kind used to install this marketplace. |
| `marketplaces.<键>.sparse_paths` | 数组&lt;string&gt; | Sparse checkout paths used when `source_type` is `git`. |


#### `mcp_enterprise_managed_auth`

企业 IdP 管理的 MCP/插件共享认证。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `mcp_enterprise_managed_auth.idp` | 表/对象 | 此 schema 分支必填。Shared enterprise authorization, independent of Codex account credentials. |
| `mcp_enterprise_managed_auth.idp.client_id` | string | 此 schema 分支必填。Public OAuth client registered with that enterprise IdP. |
| `mcp_enterprise_managed_auth.idp.issuer` | string | 此 schema 分支必填。Issuer used for enterprise OAuth discovery and identity validation. |


#### `mcp_servers`

外部 MCP 服务、OAuth、工具白名单、超时与工具审批。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `mcp_servers.<键>` | 表/对象 | Raw MCP config shape used for deserialization and supported-field JSON Schema generation. Fields that are accepted only to produce targeted validation errors should be skipped in the generated schema. Keep `TryFrom<RawMcpServerConfig> for McpServerConfig` exhaustively destructuring this struct so new TOML fields cannot be added here without updating the validation/mapping logic that produces [`McpServerConfig`]. |
| `mcp_servers.<键>.args` | 数组&lt;string&gt; | 参数数组；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.auth` | "oauth" 或 "chatgpt" 或 "ema_auth" | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.bearer_token_env_var` | string | Bearer token 环境变量名；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.command` | string | 启动命令；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.cwd` | string | 子进程工作目录；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.default_tools_approval_mode` | "auto" / "prompt" / "writes" / "approve" | 默认工具审批方式；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.disabled_tools` | 数组&lt;string&gt; | 工具黑名单；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.enabled_tools` | 数组&lt;string&gt; | 工具白名单；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.env` | 映射&lt;string&gt; | 显式环境变量；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.env.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `mcp_servers.<键>.env_http_headers` | 映射&lt;string&gt; | 从环境变量获取 HTTP 头；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.env_http_headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `mcp_servers.<键>.env_vars` | 数组&lt;string 或 表/对象&gt; | 继承的环境变量名；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.env_vars[].name` | string | 此 schema 分支必填。名称；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.env_vars[].source` | string | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.environment_id` | string | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.http_headers` | 映射&lt;string&gt; | 固定 HTTP 头；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.http_headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `mcp_servers.<键>.http_headers_helper` | string | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.name` | string | 名称。Legacy display-name field accepted for backward compatibility. |
| `mcp_servers.<键>.oauth` | 表/对象 | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.oauth.authorization_server_issuer` | string | Expected resource authorization server issuer for EMA token exchange. |
| `mcp_servers.<键>.oauth.callback_port` | integer；最小 0.0 | Fixed callback port that takes precedence over Codex's global OAuth callback port. |
| `mcp_servers.<键>.oauth.callback_url` | string | Registered callback URL associated with this OAuth client. |
| `mcp_servers.<键>.oauth.client_id` | string | Explicit OAuth client identifier to present during authorization and token exchange. |
| `mcp_servers.<键>.oauth.client_secret` | string | OAuth client secret used for token exchange with a pre-registered client. |
| `mcp_servers.<键>.oauth_resource` | string | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.omit_tools_from` | 数组&lt;"code_mode" 或 "deferred" 或 "direct"&gt; | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.required` | boolean | 连接失败是否阻断；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.scopes` | 数组&lt;string&gt; | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.startup_readiness` | "connection" 或 "catalog" | Whether startup requires a live connection or can use a valid cached tool catalog. |
| `mcp_servers.<键>.startup_timeout_ms` | integer；最小 0.0 | 旧启动超时毫秒键；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.startup_timeout_sec` | number | 启动超时秒数；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.supports_parallel_tool_calls` | boolean | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.tool_input_schema_max_bytes` | integer；最小 1.0 | 工具输入 schema 字节预算。UTF-8 byte threshold for compacting each ordinary MCP tool input schema. Defaults to 5,000 bytes. Code Mode also uses an explicitly configured limit when rendering each tool's input type. Larger limits preserve more parameter descriptions. |
| `mcp_servers.<键>.tool_timeout_sec` | number | 单工具调用超时秒数；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `mcp_servers.<键>.tools` | 映射&lt;表/对象&gt; | 该键属于 `mcp_servers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `mcp_servers.<键>.tools.<键>` | 表/对象 | Per-tool settings for a single MCP server tool. |
| `mcp_servers.<键>.tools.<键>.approval_mode` | "auto" / "prompt" / "writes" / "approve" | 单工具审批方式。Approval mode for this tool. |
| `mcp_servers.<键>.tools.<键>.output_token_limit` | integer；最小 1.0 | 工具输出 token 预算。Token budget for this tool's output, before the standard 20% serialization allowance. |
| `mcp_servers.<键>.url` | string | 服务 URL；没有额外 schema 默认值时，由运行时与上层配置决定。 |


#### `memories`

记忆使用、生成、提取、合并与清理策略。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `memories.consolidation_model` | string | 记忆合并模型。Model used for memory consolidation. |
| `memories.dedicated_tools` | boolean | When `true`, expose dedicated memory tools through the extension tool surface. |
| `memories.disable_on_external_context` | boolean | When `true`, external context sources mark the thread `memory_mode` as `"polluted"`. |
| `memories.dual_write` | boolean | Generate both versions while the selected version supplies context. |
| `memories.extract_model` | string | 记忆提取模型。Model used for thread summarisation. |
| `memories.generate_memories` | boolean | 生成记忆。When `false`, newly created threads are stored with `memory_mode = "disabled"` in the state DB. |
| `memories.max_raw_memories_for_consolidation` | integer；最小 1.0；最大 4096.0 | Maximum number of recent raw memories retained for global consolidation. |
| `memories.max_rollout_age_days` | integer | Maximum age of the threads used for memories. |
| `memories.max_rollouts_per_startup` | integer；最小 1.0；最大 128.0 | Maximum number of rollout candidates processed per pass. |
| `memories.max_unused_days` | integer | Maximum number of days since a memory was last used before it becomes ineligible for phase 2 selection. |
| `memories.min_rate_limit_remaining_percent` | integer；最小 0.0；最大 100.0 | Minimum remaining percentage required in Codex rate-limit windows before memory startup runs. |
| `memories.min_rollout_idle_hours` | integer | Minimum idle time between last thread activity and memory creation (hours). &gt; 12h recommended. |
| `memories.use_memories` | boolean | 读取并使用记忆。When `false`, skip injecting memory usage instructions into developer prompts. |
| `memories.version` | "v1" / "v2" | Selects the memory pipeline; v1 remains the default. |


#### `model_providers`

自定义 provider 目录；不可覆盖内置 ID。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `model_providers.<键>` | 表/对象 | Serializable representation of a provider definition. |
| `model_providers.<键>.auth` | 表/对象 | Command-backed bearer-token configuration for this provider. |
| `model_providers.<键>.auth.args` | 数组&lt;string&gt;；schema 默认 [] | 参数数组。Command arguments. |
| `model_providers.<键>.auth.command` | string | 此 schema 分支必填。启动命令。Command to execute. Bare names are resolved via `PATH`; paths are resolved against `cwd`. |
| `model_providers.<键>.auth.cwd` | string | 子进程工作目录。Working directory used when running the token command. |
| `model_providers.<键>.auth.refresh_interval_ms` | integer；最小 0.0；schema 默认 300000 | Maximum age for the cached token before rerunning the command. Set to `0` to disable proactive refresh and only rerun after a 401 retry path. |
| `model_providers.<键>.auth.timeout_ms` | integer；最小 1.0；schema 默认 5000 | Maximum time to wait for the token command to exit successfully. |
| `model_providers.<键>.aws` | 表/对象 | AWS SigV4 auth configuration for this provider. |
| `model_providers.<键>.aws.auth_refresh` | 表/对象 | Optional command used to reauthenticate after a refreshable AWS auth failure. |
| `model_providers.<键>.aws.auth_refresh.args` | 数组&lt;string&gt;；schema 默认 [] | 参数数组。Arguments passed to the refresh command. |
| `model_providers.<键>.aws.auth_refresh.command` | string | 此 schema 分支必填。启动命令。Executable to invoke directly, without a shell. |
| `model_providers.<键>.aws.auth_refresh.timeout_ms` | integer；最小 1.0；schema 默认 300000 | Maximum time to wait for the refresh command to complete. |
| `model_providers.<键>.aws.credential_export` | 表/对象 | Optional command whose exported credentials replace the AWS SDK credential chain. |
| `model_providers.<键>.aws.credential_export.args` | 数组&lt;string&gt;；schema 默认 [] | 参数数组。Arguments passed to the credential export command. |
| `model_providers.<键>.aws.credential_export.command` | string | 此 schema 分支必填。启动命令。Executable to invoke directly, without a shell. |
| `model_providers.<键>.aws.credential_export.timeout_ms` | integer；最小 1.0；schema 默认 30000 | Maximum time to wait for the credential export command to complete. |
| `model_providers.<键>.aws.profile` | string | AWS profile name to use. When unset, the AWS SDK default chain decides. |
| `model_providers.<键>.aws.region` | string | 地区。AWS region to use for provider-specific endpoints. |
| `model_providers.<键>.base_url` | string | 请求基址。Base URL for the provider's OpenAI-compatible API. |
| `model_providers.<键>.capabilities` | 表/对象 | Optional API capability overrides for a custom Responses-compatible provider. Unspecified capabilities retain their existing provider defaults. |
| `model_providers.<键>.capabilities.external_web_access` | boolean | 托管搜索可访问实时网页。Whether hosted web search may access the live web. |
| `model_providers.<键>.capabilities.remote_compaction` | "unsupported" 或 "v2" | 远端压缩协议。Remote context-compaction protocol; omission preserves provider defaults. |
| `model_providers.<键>.env_http_headers` | 映射&lt;string&gt; | 从环境变量获取 HTTP 头。Optional HTTP headers to include in requests to this provider where the (key, value) pairs are the header name and _environment variable_ whose value should be used. If the environment variable is not set, or the value is empty, the header will not be included in the request. |
| `model_providers.<键>.env_http_headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `model_providers.<键>.env_key` | string | API key 环境变量名。Environment variable that stores the user's API key for this provider. |
| `model_providers.<键>.env_key_instructions` | string | Optional instructions to help the user get a valid value for the variable and set it. |
| `model_providers.<键>.experimental_bearer_token` | string | 明文 token 兼容项。Value to use with `Authorization: Bearer <token>` header. Use of this config is discouraged in favor of `env_key` for security reasons, but this may be necessary when using this programmatically. |
| `model_providers.<键>.gateway_oauth` | 表/对象 | Secondary OAuth credentials required by the provider's gateway. |
| `model_providers.<键>.gateway_oauth.authorization_url` | string | 此 schema 分支必填。该键属于 `model_providers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `model_providers.<键>.gateway_oauth.client_id` | string | 此 schema 分支必填。该键属于 `model_providers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `model_providers.<键>.gateway_oauth.delivery` | 表/对象 | 此 schema 分支必填。该键属于 `model_providers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `model_providers.<键>.gateway_oauth.delivery.kind` | "header" 或 "cookie" | 此 schema 分支必填。该键属于 `model_providers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `model_providers.<键>.gateway_oauth.delivery.name` | string | 此 schema 分支必填。名称；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `model_providers.<键>.gateway_oauth.delivery.scheme` | string；schema 默认 "Bearer" | 该键属于 `model_providers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `model_providers.<键>.gateway_oauth.redirect_port` | integer；最小 0.0 | 该键属于 `model_providers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `model_providers.<键>.gateway_oauth.resource` | string | 该键属于 `model_providers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `model_providers.<键>.gateway_oauth.scopes` | 数组&lt;string&gt;；schema 默认 [] | 该键属于 `model_providers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `model_providers.<键>.gateway_oauth.token_url` | string | 此 schema 分支必填。该键属于 `model_providers` 配置；值形状见类型列，schema 未提供额外说明。 |
| `model_providers.<键>.http_headers` | 映射&lt;string&gt; | 固定 HTTP 头。Additional HTTP headers to include in requests to this provider where the (key, value) pairs are the header name and value. |
| `model_providers.<键>.http_headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `model_providers.<键>.model_catalog_url` | string | Optional full URL for a Codex-native model catalog. When unset, OpenAI discovery uses the Codex backend unless `base_url` overrides the inference endpoint. |
| `model_providers.<键>.name` | string；schema 默认 "" | 名称。Friendly display name. |
| `model_providers.<键>.query_params` | 映射&lt;string&gt; | Optional query parameters to append to the base URL. |
| `model_providers.<键>.query_params.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `model_providers.<键>.request_max_retries` | integer；最小 0.0 | HTTP 请求重试上限。Maximum number of times to retry a failed HTTP request to this provider. |
| `model_providers.<键>.requires_openai_auth` | boolean；schema 默认 false | 复用 OpenAI 登录鉴权。Does this provider require an OpenAI API key or ChatGPT login token? If true, the user is presented with a login screen on first run, and credentials are stored using the backend selected by `cli_auth_credentials_store`. If false (the default), the login screen is skipped, and the API key (if needed) comes from the environment variable specified by `env_key`. |
| `model_providers.<键>.stream_idle_timeout_ms` | integer；最小 0.0 | 流空闲超时毫秒。Idle timeout (in milliseconds) to wait for activity on a streaming response before treating the connection as lost. |
| `model_providers.<键>.stream_max_retries` | integer；最小 0.0 | 流中断重试上限。Number of times to retry reconnecting a dropped streaming response before failing. |
| `model_providers.<键>.supports_standalone_web_search` | boolean；schema 默认 false | Whether this provider supports the standalone web-search endpoint. |
| `model_providers.<键>.supports_websockets` | boolean；schema 默认 false | 声明 WebSocket 支持。Whether this provider supports the Responses API WebSocket transport. |
| `model_providers.<键>.websocket_connect_timeout_ms` | integer；最小 0.0 | WebSocket 连接超时毫秒。Maximum time (in milliseconds) to wait for a websocket connection attempt before treating it as failed. |
| `model_providers.<键>.wire_api` | "responses" | Responses 协议。Which wire protocol this provider expects. |


#### `notice`

已读通知和迁移提示状态，通常由界面写入。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `notice.external_config_migration_prompts` | 表/对象 | Tracks scopes where external config migration prompts should be suppressed. |
| `notice.external_config_migration_prompts.home` | boolean | Tracks whether home-level external config migration prompts are hidden. |
| `notice.external_config_migration_prompts.home_last_prompted_at` | integer | Tracks the last time the home-level external config migration prompt was shown. |
| `notice.external_config_migration_prompts.project_last_prompted_at` | 映射&lt;integer&gt;；schema 默认 {} | Tracks the last time a project-level external config migration prompt was shown. |
| `notice.external_config_migration_prompts.project_last_prompted_at.<键>` | integer | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `notice.external_config_migration_prompts.projects` | 映射&lt;boolean&gt;；schema 默认 {} | Tracks which project paths have opted out of external config migration prompts. |
| `notice.external_config_migration_prompts.projects.<键>` | boolean | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `notice.fast_default_opt_out` | boolean | Tracks whether the user opted out of Codex-managed fast defaults. |
| `notice.hide_full_access_warning` | boolean | Tracks whether the user has acknowledged the full access warning prompt. |
| `notice.hide_gpt-5.1-codex-max_migration_prompt` | boolean | Tracks whether the user has seen the gpt-5.1-codex-max migration prompt |
| `notice.hide_gpt5_1_migration_prompt` | boolean | Tracks whether the user has seen the model migration prompt |
| `notice.hide_rate_limit_model_nudge` | boolean | Tracks whether the user opted out of the rate limit model switch reminder. |
| `notice.hide_world_writable_warning` | boolean | Tracks whether the user has acknowledged the Windows world-writable directories warning. |
| `notice.model_migrations` | 映射&lt;string&gt;；schema 默认 {} | Tracks acknowledged model migrations as old-&gt;new model slug mappings. |
| `notice.model_migrations.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |


#### `orchestrator`

环境编排层拥有的 MCP/skills 开关。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `orchestrator.mcp` | 表/对象 | Optional enablement of a configured feature. |
| `orchestrator.mcp.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `orchestrator.skills` | 表/对象 | Legacy no-op setting retained for compatibility. Use `cloud.skills` to configure cloud skills. |
| `orchestrator.skills.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |


#### `otel`

遥测导出、trace、metrics、TLS 与日志数据范围。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `otel.environment` | string | Mark traces with environment (dev, staging, prod, test). Defaults to dev. |
| `otel.exporter` | "none" / "statsig" 或 表/对象 | Optional log exporter |
| `otel.exporter.otlp-http` | 表/对象 | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.exporter.otlp-http.endpoint` | string | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.exporter.otlp-http.headers` | 映射&lt;string&gt;；schema 默认 {} | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.exporter.otlp-http.headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `otel.exporter.otlp-http.protocol` | "binary" 或 "json" | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.exporter.otlp-http.tls` | 表/对象 | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.exporter.otlp-http.tls.ca-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.exporter.otlp-http.tls.client-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.exporter.otlp-http.tls.client-private-key` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.exporter.otlp-grpc` | 表/对象 | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.exporter.otlp-grpc.endpoint` | string | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.exporter.otlp-grpc.headers` | 映射&lt;string&gt;；schema 默认 {} | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.exporter.otlp-grpc.headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `otel.exporter.otlp-grpc.tls` | 表/对象 | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.exporter.otlp-grpc.tls.ca-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.exporter.otlp-grpc.tls.client-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.exporter.otlp-grpc.tls.client-private-key` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.log_agent_responses` | boolean | Opt in to logging final main-agent and spawned-subagent responses to an OTLP log exporter. Defaults to false. Response text can be sensitive and is capped at 64 KiB. |
| `otel.log_guardian_assessments` | boolean | Opt in to logging completed Guardian assessments to an OTLP log exporter. Defaults to false. Rationales can be sensitive and are capped at 64 KiB. |
| `otel.log_user_prompt` | boolean | Log user prompt in traces |
| `otel.metrics_exporter` | "none" / "statsig" 或 表/对象 | Optional metrics exporter |
| `otel.metrics_exporter.otlp-http` | 表/对象 | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.metrics_exporter.otlp-http.endpoint` | string | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.metrics_exporter.otlp-http.headers` | 映射&lt;string&gt;；schema 默认 {} | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.metrics_exporter.otlp-http.headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `otel.metrics_exporter.otlp-http.protocol` | "binary" 或 "json" | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.metrics_exporter.otlp-http.tls` | 表/对象 | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.metrics_exporter.otlp-http.tls.ca-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.metrics_exporter.otlp-http.tls.client-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.metrics_exporter.otlp-http.tls.client-private-key` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.metrics_exporter.otlp-grpc` | 表/对象 | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.metrics_exporter.otlp-grpc.endpoint` | string | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.metrics_exporter.otlp-grpc.headers` | 映射&lt;string&gt;；schema 默认 {} | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.metrics_exporter.otlp-grpc.headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `otel.metrics_exporter.otlp-grpc.tls` | 表/对象 | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.metrics_exporter.otlp-grpc.tls.ca-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.metrics_exporter.otlp-grpc.tls.client-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.metrics_exporter.otlp-grpc.tls.client-private-key` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.span_attributes` | 映射&lt;string&gt; | Attributes to add to every exported trace span. |
| `otel.span_attributes.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `otel.tool_result` | 表/对象 | Byte limit for tool-result log output; independent of model-visible output. |
| `otel.tool_result.max_bytes` | integer；最小 0.0；schema 默认 2048 | 字节上限。Maximum UTF-8 bytes before the truncation notice. Defaults to 2048. |
| `otel.trace_exporter` | "none" / "statsig" 或 表/对象 | Optional trace exporter |
| `otel.trace_exporter.otlp-http` | 表/对象 | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.trace_exporter.otlp-http.endpoint` | string | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.trace_exporter.otlp-http.headers` | 映射&lt;string&gt;；schema 默认 {} | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.trace_exporter.otlp-http.headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `otel.trace_exporter.otlp-http.protocol` | "binary" 或 "json" | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.trace_exporter.otlp-http.tls` | 表/对象 | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.trace_exporter.otlp-http.tls.ca-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.trace_exporter.otlp-http.tls.client-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.trace_exporter.otlp-http.tls.client-private-key` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.trace_exporter.otlp-grpc` | 表/对象 | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.trace_exporter.otlp-grpc.endpoint` | string | 此 schema 分支必填。该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.trace_exporter.otlp-grpc.headers` | 映射&lt;string&gt;；schema 默认 {} | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.trace_exporter.otlp-grpc.headers.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `otel.trace_exporter.otlp-grpc.tls` | 表/对象 | 该键属于 `otel` 配置；值形状见类型列，schema 未提供额外说明。 |
| `otel.trace_exporter.otlp-grpc.tls.ca-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.trace_exporter.otlp-grpc.tls.client-certificate` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.trace_exporter.otlp-grpc.tls.client-private-key` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `otel.tracestate` | 映射&lt;映射&lt;string&gt;&gt; | Semicolon-separated `key:value` fields to upsert into W3C tracestate members. |
| `otel.tracestate.<键>` | 映射&lt;string&gt; | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `otel.tracestate.<键>.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |


#### `plugins`

单插件及其 MCP 服务启用和工具策略。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `plugins.<键>` | 表/对象 | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `plugins.<键>.enabled` | boolean；schema 默认 true | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `plugins.<键>.mcp_servers` | 映射&lt;表/对象&gt; | Per-MCP-server policy overlays for MCP servers contributed by this plugin. |
| `plugins.<键>.mcp_servers.<键>` | 表/对象 | Policy settings for a plugin-provided MCP server. This intentionally excludes transport settings: plugin manifests own how the MCP server is launched, while host config owns enablement, auth, and tool policy. |
| `plugins.<键>.mcp_servers.<键>.default_tools_approval_mode` | "auto" / "prompt" / "writes" / "approve" | 默认工具审批方式。Approval mode for tools in this server unless a tool override exists. |
| `plugins.<键>.mcp_servers.<键>.disabled_tools` | 数组&lt;string&gt; | 工具黑名单。Explicit deny-list of tools. These tools are removed after applying `enabled_tools`. |
| `plugins.<键>.mcp_servers.<键>.enabled` | boolean；schema 默认 true | 是否启用。When `false`, Codex skips initializing this plugin MCP server. |
| `plugins.<键>.mcp_servers.<键>.enabled_tools` | 数组&lt;string&gt; | 工具白名单。Explicit allow-list of tools exposed from this server. |
| `plugins.<键>.mcp_servers.<键>.tools` | 映射&lt;表/对象&gt; | Per-tool policy settings keyed by tool name. |
| `plugins.<键>.mcp_servers.<键>.tools.<键>` | 表/对象 | Per-tool settings for a single MCP server tool. |
| `plugins.<键>.mcp_servers.<键>.tools.<键>.approval_mode` | "auto" / "prompt" / "writes" / "approve" | 单工具审批方式。Approval mode for this tool. |
| `plugins.<键>.mcp_servers.<键>.tools.<键>.output_token_limit` | integer；最小 1.0 | 工具输出 token 预算。Token budget for this tool's output, before the standard 20% serialization allowance. |


#### `profiles`

历史 [profiles.*] 表兼容结构；与新同名 --profile 冲突。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `profiles.<键>` | 表/对象 | Collection of common configuration options that a user can define as a unit in `config.toml`. |
| `profiles.<键>.analytics` | 表/对象 | Analytics settings loaded from config.toml. Fields are optional so we can apply defaults. |
| `profiles.<键>.analytics.enabled` | boolean | 是否启用。When `false`, disables analytics across Codex product surfaces in this profile. |
| `profiles.<键>.approval_policy` | "on-request" 或 表/对象 或 "never" | Determines the conditions under which the user is consulted to approve running the command proposed by Codex. |
| `profiles.<键>.approval_policy.granular` | 表/对象 | 此 schema 分支必填。该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.approval_policy.granular.mcp_elicitations` | boolean | 此 schema 分支必填。Whether to allow MCP elicitation prompts. |
| `profiles.<键>.approval_policy.granular.request_permissions` | boolean；schema 默认 false | Whether to allow prompts triggered by the `request_permissions` tool. |
| `profiles.<键>.approval_policy.granular.rules` | boolean | 此 schema 分支必填。Whether to allow prompts triggered by execpolicy `prompt` rules. |
| `profiles.<键>.approval_policy.granular.sandbox_approval` | boolean | 此 schema 分支必填。Whether to allow shell command approval requests, including inline `with_additional_permissions` and `require_escalated` requests. |
| `profiles.<键>.approval_policy.granular.skill_approval` | boolean；schema 默认 false | Whether to allow approval prompts triggered by skill script execution. |
| `profiles.<键>.approvals_reviewer` | "user" / "auto_review" / "guardian_subagent" | 审批审核者。Configures who approval requests are routed to for review. Examples include sandbox escapes, blocked network access, MCP approval prompts, and ARC escalations. Defaults to `user`. `auto_review` uses a carefully prompted subagent to gather relevant context and apply a risk-based decision framework before approving or denying the request. The legacy value `guardian_subagent` is accepted for compatibility. |
| `profiles.<键>.chatgpt_base_url` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.experimental_compact_prompt_file` | string | A path that is guaranteed to be absolute and normalized (though it is not guaranteed to be canonicalized or exist on the filesystem). IMPORTANT: When deserializing an `AbsolutePathBuf`, a base path must be set using [AbsolutePathBufGuard::new]. If no base path is set, the deserialization will fail unless the path being deserialized is already absolute. |
| `profiles.<键>.experimental_use_unified_exec_tool` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features` | 表/对象 | Optional feature toggles scoped to this profile. |
| `profiles.<键>.features.agent_message_board` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.analytics_plan_history` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.api_key_cyber_access_programs` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.api_key_model_discovery` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.apply_patch_freeform` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.apply_patch_preserve_line_endings` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.apply_patch_streaming_events` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.apps` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.apps_mcp_path_override` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.apps_mcp_path_override.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.apps_mcp_path_override.path` | string | 路径；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.auth_elicitation` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.background_paginated_rollout_migration` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.bedrock_setup_wizard` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.browser_annotation_api` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.browser_use` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.browser_use_external` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.browser_use_full_cdp_access` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.chronicle` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.cli_daybreak` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.code_mode` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.code_mode.default_exec_yield_time_ms` | integer；最小 0.0 | Default yield timeout for code-mode exec calls, in milliseconds. |
| `profiles.<键>.features.code_mode.direct_only_tool_namespaces` | 数组&lt;string&gt; | Exact tool namespaces to expose only as direct model tools. These tools bypass deferral, remain top-level in code-mode-only sessions, and are omitted from the nested code-mode tool surface. |
| `profiles.<键>.features.code_mode.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.code_mode.excluded_tool_namespaces` | 数组&lt;string&gt; | Exact tool namespaces to omit from the code-mode nested tool surface. |
| `profiles.<键>.features.code_mode.experimental_show_cell_overhead` | boolean | Show handler duration, code-mode host duration, and harness overhead in each code-mode cell response. Experimental: this option and the response format may change or be removed. |
| `profiles.<键>.features.code_mode.tool_input_schema_max_bytes` | integer；最小 1.0 | 工具输入 schema 字节预算。Maximum UTF-8 bytes per rendered tool input type, with a 16,000-byte minimum and default. For ordinary MCP tools, this is also at least their server's explicitly configured input limit. |
| `profiles.<键>.features.code_mode_buffered_exec` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.code_mode_host` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.code_mode_host.disable_in_process_fallback` | boolean | Keep code mode fail-closed when the standalone host is unavailable. |
| `profiles.<键>.features.code_mode_host.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.code_mode_interrupt` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.code_mode_only` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.code_mode_only_strict_3p_tools` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.code_mode_prewarm` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.code_mode_tool_search` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.codex_apps_mcp_2026_07_28` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.codex_git_commit` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.codex_hooks` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.collab` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.collaboration_modes` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.compaction_image_budget` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.computer_use` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.concurrent_reasoning_summaries` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.connectors` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.content_item_kinds` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.context_management` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.context_management.experimental_mode` | boolean | Enables experimental context management. |
| `profiles.<键>.features.current_time_reminder` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.current_time_reminder.clock_source` | "system" / "external" | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.current_time_reminder.delivery_mode` | "any_inference" 或 "after_user_or_tool_output" | Which inference boundaries may receive current-time reminders. |
| `profiles.<键>.features.current_time_reminder.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.current_time_reminder.reminder_interval_seconds` | integer；最小 0.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.current_time_reminder.sleep_tool` | boolean | Expose the input-interruptible `clock.sleep` tool. |
| `profiles.<键>.features.cwd_relative_turn_diffs` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.daemon_auto_start` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.default_mode_request_user_input` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.defer_mailbox_preemption` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.deferred_executor` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.deferred_tool_world_state` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.elevated_windows_sandbox` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.enable_experimental_windows_sandbox` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.enable_fanout` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.enable_mcp_apps` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.enable_request_compression` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.exec_permission_approvals` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.executed_tool_call_metadata` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.executor_capability_discovery` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.experimental_use_unified_exec_tool` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.experimental_windows_sandbox` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.external_agent_memory_import` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.external_migration` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.fast_mode` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.goals` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardian_approval` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardian_conversation_history_tools` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardian_enhanced_node_repl_transcripts` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardian_ext` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardian_node_repl_transcript_images` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardian_reuse_parent_compaction` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardian_root_handoff_context` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.async_classifier_conversation_token_limit` | integer；最小 1.0 | Reset retained async history when the next request exceeds this token estimate. Defaults to 100,000. Fresh requests remain subject to the model's input limit. |
| `profiles.<键>.features.guardianv2.async_classifier_mode` | "snapshot" / "conversation" | Classifier experiment override. Otherwise use the model default, then snapshots. |
| `profiles.<键>.features.guardianv2.classifier_instructions` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.guardianv2.free_guardian` | boolean | Legacy setting retained for config compatibility; the backend now controls Guardian billing. |
| `profiles.<键>.features.guardianv2.max_action_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.max_classifier_instruction_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.max_parent_compaction_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.max_tool_call_lag` | integer；最小 0.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.persist_scores` | boolean | Persist reviewed actions and risk scores to rollout files for debugging. |
| `profiles.<键>.features.guardianv2.reasoning_effort` | string；最短 1 | A non-empty reasoning effort value advertised by the model. |
| `profiles.<键>.features.guardianv2.reuse_parent_compaction` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.review_scope` | 表/对象 | Optional tool-call categories available to the Guardian v2 classifier. |
| `profiles.<键>.features.guardianv2.review_scope.computer_use_only` | boolean | Restrict asynchronous classification and fast approvals to browser and computer-use tools. |
| `profiles.<键>.features.guardianv2.review_scope.sandboxed_exec_commands` | boolean | Include sandboxed shell command calls in Guardian v2 classification. |
| `profiles.<键>.features.guardianv2.review_threshold` | number；最小 0.0；最大 1.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.thread_context` | boolean | Deprecated and ignored; thread-owned Guardian context is always enabled. |
| `profiles.<键>.features.guardianv2.transcript` | 表/对象 | Bounds and optional sources for the Guardian v2 conversation transcript. |
| `profiles.<键>.features.guardianv2.transcript.include_images` | boolean | Include recent screenshots from messages and configured tool outputs. |
| `profiles.<键>.features.guardianv2.transcript.max_message_entry_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.transcript.max_message_transcript_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.transcript.max_recent_non_user_entries` | integer；最小 1.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.transcript.max_tool_entry_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.transcript.max_tool_transcript_tokens` | integer；最小 100.0；最大 100000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.transcript.sources` | 数组&lt;"tool_calls" / "tool_outputs" / "reasoning"&gt; | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.guardianv2.transcript_mode` | "line" 或 "json" | Transcript encoding for synchronous Guardian review and asynchronous scoring. Defaults to line. |
| `profiles.<键>.features.guardianv2_decisions_comparison` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.hooks` | boolean | Hook 动作列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.image_detail_original` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.image_generation` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.image_resize_notice` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.imagegenext` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.in_app_browser` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.in_app_chat` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.in_app_dictation` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.in_app_local_automation` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.in_app_updates` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.in_app_voice` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.incremental_tools` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.instant_interrupt` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.item_ids` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.js_repl` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.js_repl_tools_only` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.local_thread_store_compression` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.local_thread_store_shared_compression` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.login_shell_package_path` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.mcp_2026_07_28` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.mcp_oauth_refresh_coordination` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.memories` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.memory_tool` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.mentions_v2` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.model_catalog_in_context` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_mode` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.default_wait_timeout_ms` | integer；最小 0.0；最大 3600000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.disable_direct_message` | boolean | Disable the model's direct-message tools; spawning and automatic child results remain available. |
| `profiles.<键>.features.multi_agent_v2.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.multi_agent_v2.expose_spawn_agent_model_overrides` | boolean | Exposes `model` and `reasoning_effort` on the multi-agent v2 spawn tool and adds corresponding guidance to root and subagent usage hints. |
| `profiles.<键>.features.multi_agent_v2.hide_spawn_agent_metadata` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.max_concurrent_threads_per_session` | integer；最小 1.0 | 每会话并发线程上限；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.multi_agent_v2.max_wait_timeout_ms` | integer；最小 0.0；最大 3600000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.message_board_in_memory` | boolean | Keep the message board in memory for a training session, including ephemeral sessions. |
| `profiles.<键>.features.multi_agent_v2.message_board_remote` | 表/对象 | Use a session-scoped remote board instead of local storage. |
| `profiles.<键>.features.multi_agent_v2.message_board_remote.bearer_token` | string | Board credential supplied directly by a runtime config override. |
| `profiles.<键>.features.multi_agent_v2.message_board_remote.bearer_token_env_var` | string | Bearer token 环境变量名。Read the credential from this environment variable instead of bearer_token. |
| `profiles.<键>.features.multi_agent_v2.message_board_remote.url` | string | 此 schema 分支必填。服务 URL；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.multi_agent_v2.min_wait_timeout_ms` | integer；最小 0.0；最大 3600000.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.multi_agent_mode_hint_text` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.non_code_mode_only` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.root_agent_usage_hint_text` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.subagent_developer_instructions` | string | Overrides inherited developer instructions for subagents without role-specific instructions. |
| `profiles.<键>.features.multi_agent_v2.subagent_usage_hint_text` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.tool_namespace` | string；最短 1；最长 64 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.usage_hint_enabled` | boolean | Deprecated compatibility field. Its value is ignored. |
| `profiles.<键>.features.multi_agent_v2.usage_hint_text` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.multi_agent_v2.wait_agent_enabled` | boolean | Expose the multi-agent v2 `wait_agent` tool. |
| `profiles.<键>.features.multi_agent_v2_dynamic_tools` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.allow_local_binding` | boolean | 本地监听与 loopback/私网目的地控制。Permits local servers and direct host-loopback connections and skips the proxy's additional private-network destination checks. Proxy domain rules still apply. Defaults to true for MXC, which cannot enforce false; otherwise defaults to false. |
| `profiles.<键>.features.network_proxy.allow_upstream_proxy` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.credential_broker` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.credentials` | 映射&lt;表/对象&gt; | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.credentials.<键>` | 表/对象 | Declarative description of an environment-backed credential family. |
| `profiles.<键>.features.network_proxy.credentials.<键>.auth` | 数组&lt;"bearer" / "token" / "basic" / "header"&gt;；schema 默认 [] | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.credentials.<键>.env` | 数组&lt;string&gt;；schema 默认 [] | 显式环境变量；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.network_proxy.credentials.<键>.header` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.credentials.<键>.patterns` | 数组&lt;string&gt;；schema 默认 [] | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.credentials.<键>.prefix` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.credentials.<键>.url_prefix_from_env` | string | Environment variable containing an additional URL prefix or hostname. |
| `profiles.<键>.features.network_proxy.credentials.<键>.url_prefixes` | 数组&lt;string&gt;；schema 默认 [] | URL prefixes authorized for injection. Bare loopback hosts imply HTTP; other bare hosts imply HTTPS. |
| `profiles.<键>.features.network_proxy.dangerously_allow_all_unix_sockets` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.dangerously_allow_non_loopback_proxy` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.domains` | 映射&lt;"allow" / "deny"&gt; | 域名 allow/deny 映射；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.network_proxy.domains.<键>` | "allow" / "deny" | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `profiles.<键>.features.network_proxy.enable_socks5` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.enable_socks5_udp` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.network_proxy.mode` | "limited" / "full" | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.proxy_url` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.socks_url` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.network_proxy.unix_sockets` | 映射&lt;"allow" / "deny"&gt; | Unix socket allow/deny 映射；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.network_proxy.unix_sockets.<键>` | "allow" / "deny" | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `profiles.<键>.features.non_prefixed_mcp_tool_names` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.non_prefixed_mcp_tool_names.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.non_prefixed_mcp_tool_names.server_names` | 数组&lt;string&gt; | MCP servers whose tools should omit the legacy `mcp__` namespace prefix. |
| `profiles.<键>.features.nonfatal_clock_read_errors` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.omit_app_server_notification_media` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.personality` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.plugin_hooks` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.plugin_sharing` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.plugins` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.powershell_shell_version` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.prefer_mxc` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.prevent_idle_sleep` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.psp` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.realtime_conversation` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.reasoning_effort_override` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.recommended_plugins` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.remote_compaction_v2` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.remote_control` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.remote_models` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.remote_plugin` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.request_permissions` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.request_permissions_tool` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.request_rule` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.resize_all_images` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.respect_system_proxy` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.responses_websockets` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.responses_websockets_v2` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.retain_client_developer_messages` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.rollout_budget` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.rollout_budget.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.rollout_budget.limit_tokens` | integer；最小 1.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.rollout_budget.prefill_token_weight` | number；最小 0.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.rollout_budget.reminder_at_remaining_tokens` | 数组&lt;integer&gt; | Remaining weighted-token values that trigger reminders when crossed. |
| `profiles.<键>.features.rollout_budget.sampling_token_weight` | number；最小 0.0 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.runtime_metrics` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.search_tool` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.secret_auth_storage` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.send_async_message` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.send_message_to_user_async` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.shell_snapshot` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.shell_snapshot_v2` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.shell_tool` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.shell_zsh_fork` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.skill_env_var_dependency_prompt` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.skill_mcp_dependency_install` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.skill_search` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.skip_host_skill_discovery` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.sleep_tool` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.sleep_tool.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.sleep_tool.mode` | "model_driven" 或 "always_on" | How the sleep tool is selected when its feature gate is enabled. |
| `profiles.<键>.features.sqlite` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.stable_environment_tools` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.standalone_web_search` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.steer` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.step_model_switching` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.system_proxy_fallback` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.telepathy` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.terminal_resize_reflow` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.terminal_visualization_instructions` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.token_budget` | boolean 或 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.token_budget.auto_compact_fallback_buffer_tokens` | integer；最小 1.0 | Additional tokens available after the compaction threshold for fallback note-taking. |
| `profiles.<键>.features.token_budget.auto_compact_fallback_prompt` | string；最长 2000 | Developer message sampled before an automatic context-window rollover. |
| `profiles.<键>.features.token_budget.enabled` | boolean | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.features.token_budget.guidance_message` | string；最长 2000 | Guidance appended to the context-window metadata in a developer message. |
| `profiles.<键>.features.token_budget.reminder_message_template` | string；最短 1；最长 2000 | Reminder template. `{n_remaining}` is replaced with the tokens remaining before auto-compaction. |
| `profiles.<键>.features.token_budget.reminder_threshold_tokens` | integer；最小 1.0 | Number of tokens remaining before auto-compaction when the wrap-up reminder is emitted. |
| `profiles.<键>.features.token_budget.use_history_notes_extension` | boolean | Whether to expose the built-in history and notes extension. |
| `profiles.<键>.features.tool_call_mcp_elicitation` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.tool_registry` | 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.tool_registry.error_on_tool_collisions` | boolean | Fail the turn when multiple tools share the same effective name. |
| `profiles.<键>.features.tool_registry.turn_metadata_includes_tool_info` | boolean | Include authoritative tool information in per-turn request metadata. |
| `profiles.<键>.features.tool_search` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.tool_search_always_defer_mcp_tools` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.tool_suggest` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.transcript_v2` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.tui_app_server` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.ultrafast_mode` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.unavailable_dummy_tools` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.unbounded_connection_retries` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.undo` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.unified_exec` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.unified_exec_tty` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.unified_exec_zsh_fork` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.unified_image_budget` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.use_agent_identity` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.use_legacy_landlock` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.use_linux_sandbox_bwrap` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.use_xaa` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.view_image` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.web_search` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.web_search_cached` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.web_search_request` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.windows_sandbox_service` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.workspace_dependencies` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.workspace_owner_usage_nudge` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.worktrees` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.features.write_stdin_approval` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.include_apps_instructions` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.include_collaboration_mode_instructions` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.include_environment_context` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.include_permissions_instructions` | boolean | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.model` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.model_catalog_json` | string | Optional path to a JSON model catalog (applied on startup only). |
| `profiles.<键>.model_instructions_file` | string | Optional path to a file containing model instructions. |
| `profiles.<键>.model_provider` | string | The key in the `model_providers` map identifying the [`ModelProviderInfo`] to use. |
| `profiles.<键>.model_reasoning_effort` | string；最短 1 | A non-empty reasoning effort value advertised by the model. |
| `profiles.<键>.model_reasoning_summary` | "auto" / "concise" / "detailed" 或 "none" | A summary of the reasoning performed by the model. This can be useful for debugging and understanding the model's reasoning process. See https://platform.openai.com/docs/guides/reasoning?api-mode=responses#reasoning-summaries |
| `profiles.<键>.model_verbosity` | "low" / "medium" / "high" | Controls output length/detail on GPT-5 models via the Responses API. Serialized with lowercase values to match the OpenAI API. |
| `profiles.<键>.oss_provider` | string | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.personality` | "none" / "friendly" / "pragmatic" | Deprecated: `friendly` and `pragmatic` no longer select a style. |
| `profiles.<键>.plan_mode_reasoning_effort` | string；最短 1 | A non-empty reasoning effort value advertised by the model. |
| `profiles.<键>.sandbox_mode` | "read-only" / "workspace-write" / "danger-full-access" | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.service_tier` | string | Optional explicit service tier request id for new turns (for example `default`, `priority`, or `flex`; legacy `fast` also works). |
| `profiles.<键>.tools` | 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.tools.experimental_request_user_input` | 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.tools.experimental_request_user_input.enabled` | boolean；schema 默认 true | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.tools.update_plan` | 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.tools.update_plan.enabled` | boolean；schema 默认 false | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.tools.web_search` | 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.tools.web_search.allowed_domains` | 数组&lt;string&gt; | 允许域名列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.tools.web_search.context_size` | "low" / "medium" / "high" | 搜索上下文规模；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.tools.web_search.location` | 表/对象 | 搜索地域提示；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.tools.web_search.location.city` | string | 城市；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.tools.web_search.location.country` | string | 国家；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.tools.web_search.location.region` | string | 地区；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.tools.web_search.location.timezone` | string | 时区；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `profiles.<键>.tui` | 表/对象 | TUI settings scoped to this profile. |
| `profiles.<键>.tui.session_picker_view` | "comfortable" / "dense" | Preferred layout for resume/fork session picker results. |
| `profiles.<键>.web_search` | "disabled" / "cached" / "indexed" / "live" | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.windows` | 表/对象 | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |
| `profiles.<键>.windows.sandbox` | "elevated" / "unelevated" / "mxc" | 该键属于 `profiles` 配置；值形状见类型列，schema 未提供额外说明。 |


#### `projects`

按项目路径保存 trusted/untrusted 信任状态。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `projects.<键>` | 表/对象 | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `projects.<键>.trust_level` | "trusted" / "untrusted" | Represents the trust level for a project directory. This determines the approval policy and sandbox mode applied. |


#### `realtime`

实验语音会话版本、类型、transport 和 voice 选择。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `realtime.transport` | "webrtc" / "websocket" | 该键属于 `realtime` 配置；值形状见类型列，schema 未提供额外说明。 |
| `realtime.type` | "conversational" / "transcription" | 该键属于 `realtime` 配置；值形状见类型列，schema 未提供额外说明。 |
| `realtime.version` | "v1" / "v2" / "v3" | 该键属于 `realtime` 配置；值形状见类型列，schema 未提供额外说明。 |
| `realtime.voice` | "alloy" / "arbor" / "ash" / "ballad" / "breeze" / "cedar" / "coral" / "cove" / "echo" / "ember" / "juniper" / "maple" / "marin" / "sage" / "shimmer" / "sol" / "spruce" / "vale" / "verse" | 该键属于 `realtime` 配置；值形状见类型列，schema 未提供额外说明。 |


#### `responses_api_metadata`

产品拥有的 Responses metadata，不是任意无限制业务字段。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `responses_api_metadata.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |


#### `sandbox_workspace_write`

workspace-write 的附加可写目录、网络和临时目录策略。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `sandbox_workspace_write.exclude_slash_tmp` | boolean；schema 默认 false | 该键属于 `sandbox_workspace_write` 配置；值形状见类型列，schema 未提供额外说明。 |
| `sandbox_workspace_write.exclude_tmpdir_env_var` | boolean；schema 默认 false | 该键属于 `sandbox_workspace_write` 配置；值形状见类型列，schema 未提供额外说明。 |
| `sandbox_workspace_write.network_access` | boolean；schema 默认 false | 该键属于 `sandbox_workspace_write` 配置；值形状见类型列，schema 未提供额外说明。 |
| `sandbox_workspace_write.writable_roots` | 数组&lt;string&gt;；schema 默认 [] | 该键属于 `sandbox_workspace_write` 配置；值形状见类型列，schema 未提供额外说明。 |


#### `shell_environment_policy`

子进程环境变量继承、过滤、白名单和显式设置。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `shell_environment_policy.exclude` | 数组&lt;string&gt; | 排除变量。Legacy list of regular expressions to exclude. |
| `shell_environment_policy.experimental_use_profile` | boolean | 该键属于 `shell_environment_policy` 配置；值形状见类型列，schema 未提供额外说明。 |
| `shell_environment_policy.filters` | 映射&lt;"include" / "exclude"&gt; | Pattern actions used by the canonical table representation. Ordinary config keeps accepting the legacy arrays above during the migration. Requirements will accept only this keyed form, keeping array compatibility isolated so the legacy fields can be deprecated later. Pattern keys merge case-insensitively across config layers, matching how the resulting patterns match environment variable names. |
| `shell_environment_policy.filters.<键>` | "include" / "exclude" | Assigns a shell environment variable pattern to the include-only or exclude set. Includes do not re-add variables removed by another exclude pattern. |
| `shell_environment_policy.ignore_default_excludes` | boolean | 忽略默认敏感变量过滤；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `shell_environment_policy.include_only` | 数组&lt;string&gt; | 变量白名单。Legacy list of regular expressions to include. |
| `shell_environment_policy.inherit` | "core" 或 "all" 或 "none" | 继承策略；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `shell_environment_policy.set` | 映射&lt;string&gt; | 覆盖变量值；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `shell_environment_policy.set.<键>` | string | 动态键映射；用实际 ID、路径或名称替换占位符。 |


#### `skills`

Skills 开关、单 skill 配置及指令上下文预算。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `skills.bundled` | 表/对象 | 该键属于 `skills` 配置；值形状见类型列，schema 未提供额外说明。 |
| `skills.bundled.enabled` | boolean；schema 默认 true | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `skills.config` | 数组&lt;表/对象&gt; | 该键属于 `skills` 配置；值形状见类型列，schema 未提供额外说明。 |
| `skills.config[].enabled` | boolean | 此 schema 分支必填。是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `skills.config[].name` | string | 名称。Name-based selector. |
| `skills.config[].path` | string | 路径。Path-based selector. |
| `skills.include_instructions` | boolean | Whether turns receive the automatic skills instructions block. |
| `skills.max_context_tokens` | integer；最小 1.0 | Maximum tokens used by the available-skills catalog. Defaults to 2% of the model context window and is capped at 10,000 tokens when set. |


#### `tool_suggest`

工具安装建议的可发现项及禁用项。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `tool_suggest.disabled_tools` | 数组&lt;表/对象&gt;；schema 默认 [] | 工具黑名单；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `tool_suggest.disabled_tools[].id` | string | 此 schema 分支必填。该键属于 `tool_suggest` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tool_suggest.disabled_tools[].type` | "connector" / "plugin" | 此 schema 分支必填。该键属于 `tool_suggest` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tool_suggest.discoverables` | 数组&lt;表/对象&gt;；schema 默认 [] | 该键属于 `tool_suggest` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tool_suggest.discoverables[].id` | string | 此 schema 分支必填。该键属于 `tool_suggest` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tool_suggest.discoverables[].type` | "connector" / "plugin" | 此 schema 分支必填。该键属于 `tool_suggest` 配置；值形状见类型列，schema 未提供额外说明。 |


#### `tools`

update_plan、web search 等工具的嵌套配置。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `tools.experimental_request_user_input` | 表/对象 | 该键属于 `tools` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tools.experimental_request_user_input.enabled` | boolean；schema 默认 true | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `tools.update_plan` | 表/对象 | 该键属于 `tools` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tools.update_plan.enabled` | boolean；schema 默认 false | 是否启用；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `tools.web_search` | 表/对象 | 该键属于 `tools` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tools.web_search.allowed_domains` | 数组&lt;string&gt; | 允许域名列表；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `tools.web_search.context_size` | "low" / "medium" / "high" | 搜索上下文规模；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `tools.web_search.location` | 表/对象 | 搜索地域提示；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `tools.web_search.location.city` | string | 城市；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `tools.web_search.location.country` | string | 国家；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `tools.web_search.location.region` | string | 地区；没有额外 schema 默认值时，由运行时与上层配置决定。 |
| `tools.web_search.location.timezone` | string | 时区；没有额外 schema 默认值时，由运行时与上层配置决定。 |


#### `tui`

终端显示、快捷键、复制、渲染、通知、会话选择等。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `tui.agents_overview_grouping` | "project" / "status" / "model" | Last selected grouping in Agent Command Center. |
| `tui.alternate_screen` | "auto" 或 "always" 或 "never" | Controls whether the TUI uses the terminal's alternate screen buffer. - `auto` (default): Use alternate screen. - `always`: Always use alternate screen. - `never`: Never use alternate screen (inline mode only, preserves scrollback). |
| `tui.animations` | boolean；schema 默认 true | 终端动画。Enable animations (welcome screen, shimmer effects, spinners). Defaults to `true`. |
| `tui.auto_recap` | boolean；schema 默认 true | 自动显示会话回顾。Generate automatic conversation recaps when the terminal is unfocused. Defaults to `true`. Disabling this leaves `/recap` available on demand. |
| `tui.copy_on_select` | "auto" 或 "always" 或 "never" | 选中即复制。Copy selected transcript text when the mouse button is released. Defaults to `auto`: enabled except in direct terminals known to forward their native copy shortcut (Ghostty 1.2+, Kitty on macOS, Windows Terminal, and VS Code on Windows). Unknown terminals, Ghostty without a recognized version, and tmux/Zellij default to copying. |
| `tui.disable_paste_burst` | boolean | When true, disables burst-paste detection for typed input entirely. All characters are inserted as they are received, and no buffering or placeholder replacement will occur for fast keypress bursts. Overrides the legacy top-level `disable_paste_burst` setting. Defaults to `false`. |
| `tui.effects` | 表/对象 | 终端效果。Individual visual effects. Each also requires animations to be enabled. |
| `tui.effects.effort` | boolean；schema 默认 true | Animate reasoning-effort changes in the composer and footer. |
| `tui.effects.progress` | boolean；schema 默认 true | Animate activity bullets and loading spinners. |
| `tui.effects.shimmer` | boolean；schema 默认 true | Shimmer status and loading text. |
| `tui.effects.starfield` | boolean；schema 默认 true | Animate the composer starfield. |
| `tui.effects.title` | boolean；schema 默认 true | Blink the terminal-title indicator when user action is required. |
| `tui.effects.welcome` | boolean；schema 默认 true | Animate the welcome artwork. |
| `tui.fullscreen_transcript` | boolean；schema 默认 true | 全屏 transcript 开关。Own the fullscreen transcript, including scrolling, selection, and search. Defaults to `true`; alternate-screen restrictions take precedence. |
| `tui.keymap` | 表/对象 | 快捷键映射。Keybinding overrides for the TUI. This supports rebinding selected actions globally and by context. Context bindings take precedence over `global` bindings. |
| `tui.keymap.agents` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.agents.archive` | string 或 数组&lt;string&gt; | Archive the selected task and its child agents after confirmation. |
| `tui.keymap.agents.delete` | string 或 数组&lt;string&gt; | Permanently delete the selected task and its child agents after confirmation. |
| `tui.keymap.agents.fork` | string 或 数组&lt;string&gt; | Fork the selected conversation and open the new session. |
| `tui.keymap.agents.hide` | string 或 数组&lt;string&gt; | Hide the selected task until explicitly resumed or the TUI restarts. |
| `tui.keymap.agents.new_task` | string 或 数组&lt;string&gt; | Open a new session in the selected checkout. |
| `tui.keymap.agents.new_worktree` | string 或 数组&lt;string&gt; | Open a new session in a worktree from the project default branch. |
| `tui.keymap.agents.rename` | string 或 数组&lt;string&gt; | Rename the selected task. |
| `tui.keymap.agents.resume` | string 或 数组&lt;string&gt; | Open the session resume picker. |
| `tui.keymap.agents.search` | string 或 数组&lt;string&gt; | Search the available agent tasks. |
| `tui.keymap.agents.stop` | string 或 数组&lt;string&gt; | Stop the selected running task. |
| `tui.keymap.agents.toggle_grouping` | string 或 数组&lt;string&gt; | Toggle grouping tasks by status or project. |
| `tui.keymap.agents.toggle_pin` | string 或 数组&lt;string&gt; | Pin or unpin the selected task in the shared sidebar section. |
| `tui.keymap.approval` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.approval.approve` | string 或 数组&lt;string&gt; | Approve the primary option. |
| `tui.keymap.approval.approve_for_prefix` | string 或 数组&lt;string&gt; | Approve with exec-policy prefix when that option exists. |
| `tui.keymap.approval.approve_for_session` | string 或 数组&lt;string&gt; | Approve for session when that option exists. |
| `tui.keymap.approval.cancel` | string 或 数组&lt;string&gt; | Cancel an elicitation request. |
| `tui.keymap.approval.decline` | string 或 数组&lt;string&gt; | Decline and provide corrective guidance. |
| `tui.keymap.approval.deny` | string 或 数组&lt;string&gt; | Deny without providing follow-up guidance. |
| `tui.keymap.approval.open_fullscreen` | string 或 数组&lt;string&gt; | Open the full-screen approval details view. |
| `tui.keymap.approval.open_thread` | string 或 数组&lt;string&gt; | Open the thread that requested approval when shown from another thread. |
| `tui.keymap.chat` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.chat.decrease_reasoning_effort` | string 或 数组&lt;string&gt; | Decrease the active reasoning effort. |
| `tui.keymap.chat.edit_queued_message` | string 或 数组&lt;string&gt; | Move up through pending async questions, then edit the most recently queued message. |
| `tui.keymap.chat.increase_reasoning_effort` | string 或 数组&lt;string&gt; | Increase the active reasoning effort. |
| `tui.keymap.chat.interrupt_turn` | string 或 数组&lt;string&gt; | Interrupt the active turn. |
| `tui.keymap.chat.next_permission_mode` | string 或 数组&lt;string&gt; | Switch to the next available permission mode. |
| `tui.keymap.chat.previous_permission_mode` | string 或 数组&lt;string&gt; | Switch to the previous available permission mode. |
| `tui.keymap.chat.prompt_stack_back` | string 或 数组&lt;string&gt; | Move back through pending async questions toward the composer. |
| `tui.keymap.chat.skip_question` | string 或 数组&lt;string&gt; | Skip the focused question. |
| `tui.keymap.chat.toggle_voice` | string 或 数组&lt;string&gt; | Start or stop a voice conversation. |
| `tui.keymap.chat.toggle_voice_mute` | string 或 数组&lt;string&gt; | Toggle the microphone in an active voice conversation. |
| `tui.keymap.composer` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.composer.history_search_next` | string 或 数组&lt;string&gt; | Move to the next match in reverse history search. |
| `tui.keymap.composer.history_search_previous` | string 或 数组&lt;string&gt; | Open reverse history search or move to the previous match. |
| `tui.keymap.composer.queue` | string 或 数组&lt;string&gt; | Queue the current composer draft while a task is running. |
| `tui.keymap.composer.submit` | string 或 数组&lt;string&gt; | Submit the current composer draft. |
| `tui.keymap.composer.toggle_shortcuts` | string 或 数组&lt;string&gt; | Toggle the composer shortcut overlay. |
| `tui.keymap.editor` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.editor.delete_backward` | string 或 数组&lt;string&gt; | Delete one grapheme to the left. |
| `tui.keymap.editor.delete_backward_word` | string 或 数组&lt;string&gt; | Delete the previous word. |
| `tui.keymap.editor.delete_forward` | string 或 数组&lt;string&gt; | Delete one grapheme to the right. |
| `tui.keymap.editor.delete_forward_word` | string 或 数组&lt;string&gt; | Delete the next word. |
| `tui.keymap.editor.insert_newline` | string 或 数组&lt;string&gt; | Insert a newline in the editor. |
| `tui.keymap.editor.kill_line_end` | string 或 数组&lt;string&gt; | Kill text from cursor to line end. |
| `tui.keymap.editor.kill_line_start` | string 或 数组&lt;string&gt; | Kill text from cursor to line start. |
| `tui.keymap.editor.kill_whole_line` | string 或 数组&lt;string&gt; | Kill the current line. |
| `tui.keymap.editor.move_down` | string 或 数组&lt;string&gt; | Move cursor down one visual line. |
| `tui.keymap.editor.move_left` | string 或 数组&lt;string&gt; | Move cursor left by one grapheme. |
| `tui.keymap.editor.move_line_end` | string 或 数组&lt;string&gt; | Move cursor to end of line. |
| `tui.keymap.editor.move_line_start` | string 或 数组&lt;string&gt; | Move cursor to beginning of line. |
| `tui.keymap.editor.move_right` | string 或 数组&lt;string&gt; | Move cursor right by one grapheme. |
| `tui.keymap.editor.move_up` | string 或 数组&lt;string&gt; | Move cursor up one visual line. |
| `tui.keymap.editor.move_word_left` | string 或 数组&lt;string&gt; | Move cursor to beginning of previous word. |
| `tui.keymap.editor.move_word_right` | string 或 数组&lt;string&gt; | Move cursor to end of next word. |
| `tui.keymap.editor.yank` | string 或 数组&lt;string&gt; | Yank the kill buffer. |
| `tui.keymap.global` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.global.clear_terminal` | string 或 数组&lt;string&gt; | Clear the terminal UI. |
| `tui.keymap.global.copy` | string 或 数组&lt;string&gt; | Copy the last agent response to the clipboard. |
| `tui.keymap.global.find_transcript` | string 或 数组&lt;string&gt; | Find text in the full transcript. |
| `tui.keymap.global.focus_activity` | string 或 数组&lt;string&gt; | Focus activity groups in the owned transcript to inspect their details. |
| `tui.keymap.global.open_agents` | string 或 数组&lt;string&gt; | Open the shared agent-session overview. |
| `tui.keymap.global.open_external_editor` | string 或 数组&lt;string&gt; | Open the external editor for the current draft. |
| `tui.keymap.global.open_transcript` | string 或 数组&lt;string&gt; | Open the transcript overlay. |
| `tui.keymap.global.queue` | string 或 数组&lt;string&gt; | Queue the current composer draft while a task is running. |
| `tui.keymap.global.submit` | string 或 数组&lt;string&gt; | Submit the current composer draft. |
| `tui.keymap.global.toggle_fast_mode` | string 或 数组&lt;string&gt; | Toggle Fast mode. |
| `tui.keymap.global.toggle_raw_output` | string 或 数组&lt;string&gt; | Toggle raw scrollback mode for copy-friendly transcript selection. |
| `tui.keymap.global.toggle_shortcuts` | string 或 数组&lt;string&gt; | Toggle the composer shortcut overlay. |
| `tui.keymap.global.toggle_side_conversation` | string 或 数组&lt;string&gt; | Switch between a side conversation and its parent without closing either. |
| `tui.keymap.global.toggle_vim_mode` | string 或 数组&lt;string&gt; | Toggle Vim mode for the composer input. |
| `tui.keymap.list` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.list.accept` | string 或 数组&lt;string&gt; | Accept current selection. |
| `tui.keymap.list.cancel` | string 或 数组&lt;string&gt; | Cancel and close selection view. |
| `tui.keymap.list.jump_bottom` | string 或 数组&lt;string&gt; | Jump to the last list item. |
| `tui.keymap.list.jump_top` | string 或 数组&lt;string&gt; | Jump to the first list item. |
| `tui.keymap.list.move_down` | string 或 数组&lt;string&gt; | Move list selection down. |
| `tui.keymap.list.move_left` | string 或 数组&lt;string&gt; | Move horizontally left in list pickers that support horizontal actions. |
| `tui.keymap.list.move_right` | string 或 数组&lt;string&gt; | Move horizontally right in list pickers that support horizontal actions. |
| `tui.keymap.list.move_up` | string 或 数组&lt;string&gt; | Move list selection up. |
| `tui.keymap.list.page_down` | string 或 数组&lt;string&gt; | Move list selection down by one page. |
| `tui.keymap.list.page_up` | string 或 数组&lt;string&gt; | Move list selection up by one page. |
| `tui.keymap.pager` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.pager.close` | string 或 数组&lt;string&gt; | Close the pager overlay. |
| `tui.keymap.pager.close_transcript` | string 或 数组&lt;string&gt; | Close the transcript overlay via its dedicated toggle key. |
| `tui.keymap.pager.find` | string 或 数组&lt;string&gt; | Find text in a transcript pager. |
| `tui.keymap.pager.half_page_down` | string 或 数组&lt;string&gt; | Scroll down by half a page. |
| `tui.keymap.pager.half_page_up` | string 或 数组&lt;string&gt; | Scroll up by half a page. |
| `tui.keymap.pager.jump_bottom` | string 或 数组&lt;string&gt; | Jump to the end. |
| `tui.keymap.pager.jump_top` | string 或 数组&lt;string&gt; | Jump to the beginning. |
| `tui.keymap.pager.page_down` | string 或 数组&lt;string&gt; | Scroll down by one page. |
| `tui.keymap.pager.page_up` | string 或 数组&lt;string&gt; | Scroll up by one page. |
| `tui.keymap.pager.scroll_down` | string 或 数组&lt;string&gt; | Scroll down by one row. |
| `tui.keymap.pager.scroll_up` | string 或 数组&lt;string&gt; | Scroll up by one row. |
| `tui.keymap.vim_normal` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.vim_normal.append_after_cursor` | string 或 数组&lt;string&gt; | Enter insert mode after cursor (`a`). |
| `tui.keymap.vim_normal.append_line_end` | string 或 数组&lt;string&gt; | Enter insert mode at end of line (`A`). |
| `tui.keymap.vim_normal.cancel_operator` | string 或 数组&lt;string&gt; | Cancel a pending operator and return to normal mode. |
| `tui.keymap.vim_normal.change_to_line_end` | string 或 数组&lt;string&gt; | Change from cursor to end of line and enter insert mode (`C`). |
| `tui.keymap.vim_normal.delete_char` | string 或 数组&lt;string&gt; | Delete character under cursor (`x`). |
| `tui.keymap.vim_normal.delete_to_line_end` | string 或 数组&lt;string&gt; | Delete from cursor to end of line (`D`). |
| `tui.keymap.vim_normal.enter_insert` | string 或 数组&lt;string&gt; | Enter insert mode at cursor (`i`). |
| `tui.keymap.vim_normal.enter_replace_mode` | string 或 数组&lt;string&gt; | Enter replace mode and overwrite characters under the cursor (`R`). |
| `tui.keymap.vim_normal.find_backward` | string 或 数组&lt;string&gt; | Find the previous character on the current line (`F`). |
| `tui.keymap.vim_normal.find_forward` | string 或 数组&lt;string&gt; | Find the next character on the current line (`f`). |
| `tui.keymap.vim_normal.insert_line_start` | string 或 数组&lt;string&gt; | Enter insert mode at first non-blank of line (`I`). |
| `tui.keymap.vim_normal.jump_bottom` | string 或 数组&lt;string&gt; | Jump to the last buffer line (`G`). |
| `tui.keymap.vim_normal.jump_top` | string 或 数组&lt;string&gt; | Begin a jump to the first buffer line (`gg`). |
| `tui.keymap.vim_normal.move_down` | string 或 数组&lt;string&gt; | Move cursor down (`j`), or recall newer composer history at history boundaries. |
| `tui.keymap.vim_normal.move_left` | string 或 数组&lt;string&gt; | Move cursor left (`h`). |
| `tui.keymap.vim_normal.move_line_end` | string 或 数组&lt;string&gt; | Move cursor to end of line (`$`). |
| `tui.keymap.vim_normal.move_line_start` | string 或 数组&lt;string&gt; | Move cursor to start of line (`0`). |
| `tui.keymap.vim_normal.move_right` | string 或 数组&lt;string&gt; | Move cursor right (`l`). |
| `tui.keymap.vim_normal.move_up` | string 或 数组&lt;string&gt; | Move cursor up (`k`), or recall older composer history at history boundaries. |
| `tui.keymap.vim_normal.move_word_backward` | string 或 数组&lt;string&gt; | Move cursor to start of previous word (`b`). |
| `tui.keymap.vim_normal.move_word_end` | string 或 数组&lt;string&gt; | Move cursor to end of current/next word (`e`). |
| `tui.keymap.vim_normal.move_word_forward` | string 或 数组&lt;string&gt; | Move cursor to start of next word (`w`). |
| `tui.keymap.vim_normal.open_line_above` | string 或 数组&lt;string&gt; | Open a new line above and enter insert mode (`O`). |
| `tui.keymap.vim_normal.open_line_below` | string 或 数组&lt;string&gt; | Open a new line below and enter insert mode (`o`). |
| `tui.keymap.vim_normal.paste_after` | string 或 数组&lt;string&gt; | Paste after cursor (`p`). |
| `tui.keymap.vim_normal.redo` | string 或 数组&lt;string&gt; | Redo the last undone edit (`ctrl-r`). |
| `tui.keymap.vim_normal.repeat_last_change` | string 或 数组&lt;string&gt; | Repeat the last complete edit (`.`). |
| `tui.keymap.vim_normal.replace_char` | string 或 数组&lt;string&gt; | Replace the character under the cursor (`r`). |
| `tui.keymap.vim_normal.start_change_operator` | string 或 数组&lt;string&gt; | Begin change operator; next keys select a text object. |
| `tui.keymap.vim_normal.start_delete_operator` | string 或 数组&lt;string&gt; | Begin delete operator; next key selects motion (`d`). |
| `tui.keymap.vim_normal.start_yank_operator` | string 或 数组&lt;string&gt; | Begin yank operator; next key selects motion (`y`). |
| `tui.keymap.vim_normal.substitute_char` | string 或 数组&lt;string&gt; | Delete character under cursor and enter insert mode (`s`). |
| `tui.keymap.vim_normal.till_backward` | string 或 数组&lt;string&gt; | Stop after the previous character on the current line (`T`). |
| `tui.keymap.vim_normal.till_forward` | string 或 数组&lt;string&gt; | Stop before the next character on the current line (`t`). |
| `tui.keymap.vim_normal.undo` | string 或 数组&lt;string&gt; | Undo the last complete edit (`u`). |
| `tui.keymap.vim_normal.yank_line` | string 或 数组&lt;string&gt; | Yank the entire line (`Y`). |
| `tui.keymap.vim_operator` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.vim_operator.cancel` | string 或 数组&lt;string&gt; | Cancel the pending operator and return to normal mode. |
| `tui.keymap.vim_operator.delete_line` | string 或 数组&lt;string&gt; | Repeat delete operator to delete the whole line (`dd`). |
| `tui.keymap.vim_operator.motion_down` | string 或 数组&lt;string&gt; | Motion: down one line (`j`). |
| `tui.keymap.vim_operator.motion_find_backward` | string 或 数组&lt;string&gt; | Motion: find the previous character on the current line (`F`). |
| `tui.keymap.vim_operator.motion_find_forward` | string 或 数组&lt;string&gt; | Motion: find the next character on the current line (`f`). |
| `tui.keymap.vim_operator.motion_jump_bottom` | string 或 数组&lt;string&gt; | Motion: jump to the last buffer line (`G`). |
| `tui.keymap.vim_operator.motion_jump_top` | string 或 数组&lt;string&gt; | Motion: begin a jump to the first buffer line (`gg`). |
| `tui.keymap.vim_operator.motion_left` | string 或 数组&lt;string&gt; | Motion: left (`h`). |
| `tui.keymap.vim_operator.motion_line_end` | string 或 数组&lt;string&gt; | Motion: to end of line (`$`). |
| `tui.keymap.vim_operator.motion_line_start` | string 或 数组&lt;string&gt; | Motion: to start of line (`0`). |
| `tui.keymap.vim_operator.motion_right` | string 或 数组&lt;string&gt; | Motion: right (`l`). |
| `tui.keymap.vim_operator.motion_till_backward` | string 或 数组&lt;string&gt; | Motion: stop after the previous character on the current line (`T`). |
| `tui.keymap.vim_operator.motion_till_forward` | string 或 数组&lt;string&gt; | Motion: stop before the next character on the current line (`t`). |
| `tui.keymap.vim_operator.motion_up` | string 或 数组&lt;string&gt; | Motion: up one line (`k`). |
| `tui.keymap.vim_operator.motion_word_backward` | string 或 数组&lt;string&gt; | Motion: to start of previous word (`b`). |
| `tui.keymap.vim_operator.motion_word_end` | string 或 数组&lt;string&gt; | Motion: to end of current/next word (`e`). |
| `tui.keymap.vim_operator.motion_word_forward` | string 或 数组&lt;string&gt; | Motion: to start of next word (`w`). |
| `tui.keymap.vim_operator.select_around_text_object` | string 或 数组&lt;string&gt; | Select an around text object after an operator. |
| `tui.keymap.vim_operator.select_inner_text_object` | string 或 数组&lt;string&gt; | Select an inner text object after an operator. |
| `tui.keymap.vim_operator.yank_line` | string 或 数组&lt;string&gt; | Repeat yank operator to yank the whole line (`yy`). |
| `tui.keymap.vim_search` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.vim_search.backward` | string 或 数组&lt;string&gt; | Search backward in the active buffer (`?`). |
| `tui.keymap.vim_search.forward` | string 或 数组&lt;string&gt; | Search forward in the active buffer (`/`). |
| `tui.keymap.vim_search.next` | string 或 数组&lt;string&gt; | Repeat the accepted search (`n`). |
| `tui.keymap.vim_search.previous` | string 或 数组&lt;string&gt; | Repeat in the opposite direction (`N`). |
| `tui.keymap.vim_text_object` | 表/对象 | 该键属于 `tui` 配置；值形状见类型列，schema 未提供额外说明。 |
| `tui.keymap.vim_text_object.backtick` | string 或 数组&lt;string&gt; | Text object: backticks. |
| `tui.keymap.vim_text_object.big_word` | string 或 数组&lt;string&gt; | Text object: whitespace-delimited WORD. |
| `tui.keymap.vim_text_object.braces` | string 或 数组&lt;string&gt; | Text object: braces. |
| `tui.keymap.vim_text_object.brackets` | string 或 数组&lt;string&gt; | Text object: brackets. |
| `tui.keymap.vim_text_object.cancel` | string 或 数组&lt;string&gt; | Cancel the pending text-object command. |
| `tui.keymap.vim_text_object.double_quote` | string 或 数组&lt;string&gt; | Text object: double quotes. |
| `tui.keymap.vim_text_object.parentheses` | string 或 数组&lt;string&gt; | Text object: parentheses. |
| `tui.keymap.vim_text_object.single_quote` | string 或 数组&lt;string&gt; | Text object: single quotes. |
| `tui.keymap.vim_text_object.word` | string 或 数组&lt;string&gt; | Text object: word. |
| `tui.model_availability_nux` | 映射&lt;integer；最小 0.0&gt; | Startup tooltip availability NUX state persisted by the TUI. |
| `tui.model_availability_nux.<键>` | integer；最小 0.0 | 动态键映射；用实际 ID、路径或名称替换占位符。 |
| `tui.mouse_scroll_speed` | number | 鼠标滚轮每步行数。Mouse wheel speed multiplier for transcript scrolling, based on one row per event. Defaults to `1.0`. Positive fractional values slow scrolling; values above `1.0` speed it up. |
| `tui.notification_condition` | "unfocused" 或 "always" | 通知触发条件。Controls whether TUI notifications are delivered only when the terminal is unfocused or regardless of focus. Defaults to `unfocused`. |
| `tui.notification_method` | "auto" / "osc9" / "bel" | 通知发送方式。Notification method to use for terminal notifications. Defaults to `auto`. |
| `tui.notifications` | boolean 或 数组&lt;string&gt; | 通知事件开关/白名单。Enable desktop notifications from the TUI. Defaults to `true`. |
| `tui.pet` | string | Pet id to preselect in the terminal pet picker. Custom pet ids resolve against CODEX_HOME/pets/&lt;pet-id&gt;/pet.json. |
| `tui.pet_anchor` | "composer" 或 "screen-bottom" | Where the terminal pet should anchor vertically. Defaults to `composer`, which follows the current TUI composer viewport. |
| `tui.question_esc_back` | boolean；schema 默认 true | Escape returns from async questions to the composer, preserving the answer draft. |
| `tui.raw_output_mode` | boolean；schema 默认 false | 便于终端选择的原始输出。Start the TUI in raw scrollback mode for copy-friendly transcript output. Defaults to `false`. |
| `tui.rendering` | 表/对象 | 终端内容渲染。Rich content rendering. Independent of animations and visual effects. |
| `tui.rendering.lists` | boolean；schema 默认 true | Render Markdown bullets and task-list markers as Unicode symbols. |
| `tui.rendering.math` | boolean；schema 默认 true | Render math expressions using Unicode notation. |
| `tui.rendering.mermaid` | boolean；schema 默认 true | Render Mermaid code blocks as diagrams. |
| `tui.rendering.tables` | boolean；schema 默认 true | Render pipe tables, including tables inside Markdown fences. |
| `tui.resume_cwd` | "current" 或 "session" | Working directory to use when resuming or forking a session. When unset, prompt if the current and session directories differ. |
| `tui.right_click_paste` | "auto" 或 "on" 或 "off" | 右键粘贴。Right-click text paste fallback. Defaults to `auto` (Windows/WSL/Linux). `on` also enables macOS; neither mode reads over SSH or in recognized VS Code terminals. This controls the fullscreen fallback, not the terminal's own paste binding. |
| `tui.screen_reader_detection_done` | boolean | Records the one-time screen-reader detection attempt. Either value skips detection. |
| `tui.session_picker_view` | "comfortable" / "dense" | Preferred layout for resume/fork session picker results. |
| `tui.show_server_version_notice` | boolean；schema 默认 true | Show informational notices about connected app server version differences. Defaults to `true`; this does not control compatibility errors or version status. |
| `tui.show_tooltips` | boolean；schema 默认 true | Show startup tooltips in the TUI welcome screen. Defaults to `true`. |
| `tui.status_line` | 数组&lt;string&gt; | 状态栏字段。Ordered list of status line item identifiers. When set, the TUI renders the selected items as the status line. When unset, the TUI defaults to: `model-with-reasoning`, `current-dir`, and `thread-name`. |
| `tui.status_line_use_colors` | boolean；schema 默认 true | Color status line items with colors derived from the active syntax theme. Defaults to `true`. |
| `tui.terminal_resize_reflow_max_rows` | integer；最小 0.0 | Trim terminal resize-reflow replay to the most recent rendered terminal rows when the transcript exceeds this cap. Omit to use Codex's terminal-specific default. Set to `0` to keep all rendered rows. |
| `tui.terminal_title` | 数组&lt;string&gt; | 终端标题字段。Ordered list of terminal title item identifiers. When set, the TUI renders the selected items into the terminal window/tab title. When unset, the TUI defaults to: `activity`, `thread-name`, and `project-name`. The `activity` item spins while working and shows an action-required message when blocked on the user. |
| `tui.theme` | string | Syntax highlighting theme name (kebab-case). When set, overrides automatic light/dark theme detection. Use `/theme` in the TUI or see `$CODEX_HOME/themes` for custom themes. |
| `tui.vim_mode_default` | boolean；schema 默认 false | 默认 Vim 输入模式。Start the composer in Vim mode (`Normal`) by default. Defaults to `false`. |


#### `windows`

Windows 沙箱实现选择，与任务 sandbox_mode 分开。

| 完整字段路径 | 类型 / 取值 | 说明 |
|---|---|---|
| `windows.sandbox` | "elevated" / "unelevated" / "mxc" | 该键属于 `windows` 配置；值形状见类型列，schema 未提供额外说明。 |


### 18.3 全部功能开关的生命周期与源码默认

设置方式为 `[features]` 中的键，或 `codex --enable <键>` / `--disable <键>`。开关列表来自[稳定版注册表](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/features/src/lib.rs)，**不建议整表启用**。开发中项可能由模型或宿主自动启用；Removed 表示不再用它控制对应能力；功能依赖账号与平台的部分不会被本地 true 绕过。若名称含点（如 `guardianv2.thread_context`），使用 TOML 引号保存字面键。


| 配置键 | 生命周期 | 源码默认 | 用途 / 原始边界 |
|---|---|---|---|
| `features.analytics_plan_history` | 实验菜单 | false | Preview five-hour and weekly allowance history for consumer accounts in /analytics. |
| `features.daemon_auto_start` | 稳定 | true | Automatically start the shared local daemon for eligible interactive launches. |
| `features.transcript_v2` | 弃用 | false | Deprecated no-op; use `tui.fullscreen_transcript` instead. |
| `features.undo` | 已移除 / 兼容空开关 | false | Removed compatibility flag retained as a no-op so old configs can still parse `undo`. |
| `features.shell_tool` | 稳定 | true | Enable the default shell tool. |
| `features.view_image` | 稳定 | true | Enable the built-in local image viewer. |
| `features.sleep_tool` | 稳定 | true | Allow registration of the built-in sleep tool. |
| `features.secret_auth_storage` | 稳定 | Windows=true；其他=false | Store CLI auth in the encrypted local secrets backend when keyring storage is selected. |
| `features.unified_exec` | 稳定 | true | Use the single unified PTY-backed exec tool. |
| `features.unified_exec_tty` | 稳定 | true | Allow unified exec commands to allocate an interactive terminal. |
| `features.shell_zsh_fork` | 开发中 | false | Route shell tool execution through the zsh exec bridge. |
| `features.unified_exec_zsh_fork` | 已移除 / 兼容空开关 | true | Allow unified exec to compose with the zsh exec bridge. This flag is only a composition gate. Enabling it by itself must not turn on either `unified_exec` or `shell_zsh_fork` because those features have separate rollout and enterprise controls. |
| `features.shell_snapshot` | 稳定 | true | Experimental shell snapshotting. |
| `features.login_shell_package_path` | 实验菜单 | false | Keep bundled tools such as ripgrep available when login shell startup resets PATH. |
| `features.powershell_shell_version` | 开发中 | false | Expose the selected PowerShell execution host's bounded major/minor version. |
| `features.shell_snapshot_v2` | 开发中 | false | Keep policy-filtered shell snapshots entirely in executor memory. |
| `features.deferred_executor` | 开发中 | false | Allow turns to start while selected executors are still starting. |
| `features.cwd_relative_turn_diffs` | 开发中 | false | Use the current working directory for turn diff display paths. |
| `features.js_repl` | 已移除 / 兼容空开关 | false | Removed compatibility flag for the deleted JavaScript REPL feature. |
| `features.content_item_kinds` | 稳定 | true | Send per-content-entry classifications in internal Responses metadata. |
| `features.executed_tool_call_metadata` | 开发中 | false | Record model-attempted tool calls in internal Responses metadata. |
| `features.stable_environment_tools` | 开发中 | false | Advertise enabled environment-backed tools and their shell parameters before the executor is ready. Actual execution still requires a usable environment and its policy. |
| `features.code_mode` | 开发中 | false | Enable JavaScript code mode backed by the standalone host process. |
| `features.code_mode_tool_search` | 开发中 | false | Expose ranked tool discovery inside JavaScript code mode. |
| `features.code_mode_buffered_exec` | 已移除 / 兼容空开关 | false | Removed compatibility flag for the configurable code-mode exec yield timeout. |
| `features.code_mode_host` | 稳定 | true | Run JavaScript code mode in the standalone host process. |
| `features.code_mode_prewarm` | 开发中 | false | Establish the code-mode host connection during session startup. |
| `features.code_mode_interrupt` | 开发中 | false | Terminate active code mode cells when their turn is interrupted. |
| `features.instant_interrupt` | 开发中 | true | Preempt responses and yield foreground code-mode observations on new user input. |
| `features.code_mode_only` | 开发中 | false | Restrict model-visible tools to code mode entrypoints (`exec`, `wait`). |
| `features.code_mode_only_strict_3p_tools` | 开发中 | false | Keep eligible MCP/app and dynamic tools deferred in exec, only in Code Mode Only. Ignores deferLoading, omit_tools_from, and namespace skip settings. |
| `features.js_repl_tools_only` | 已移除 / 兼容空开关 | false | Removed compatibility flag for the deleted JavaScript REPL tool-only mode. |
| `features.terminal_resize_reflow` | 已移除 / 兼容空开关 | true | Removed compatibility flag. Transcript scrollback reflow on terminal resize is always on. |
| `features.web_search_request` | 弃用 | false | Allow the model to request web searches that fetch live content. |
| `features.web_search_cached` | 弃用 | false | Allow the model to request web searches that fetch cached content. Takes precedence over `WebSearchRequest`. |
| `features.standalone_web_search` | 开发中 | false | Expose the extension-backed standalone web search tool. |
| `features.search_tool` | 已移除 / 兼容空开关 | false | Legacy search-tool feature flag kept for backward compatibility. |
| `features.codex_git_commit` | 已移除 / 兼容空开关 | false | Removed legacy git commit attribution guidance flag. |
| `features.runtime_metrics` | 开发中 | false | Enable runtime metrics snapshots via a manual reader. |
| `features.sqlite` | 已移除 / 兼容空开关 | true | Persist rollout metadata to a local SQLite database. |
| `features.memories` | 稳定 | false | Enable startup memory extraction and file-backed memory consolidation. |
| `features.external_agent_memory_import` | 开发中 | false | Enable importing project-scoped memory from external agents. |
| `features.local_thread_store_compression` | 开发中 | false | Compress cold local thread-store rollout files, including shared histories. Requires every reader of the Codex home to support compressed shared histories. |
| `features.local_thread_store_shared_compression` | 已移除 / 兼容空开关 | false | Removed compatibility flag; local_thread_store_compression controls all rollout files. |
| `features.background_paginated_rollout_migration` | 开发中 | false | Migrate legacy local rollout files to paginated history in the background. |
| `features.chronicle` | 开发中 | false | Enable the Chronicle sidecar for passive screen-context memories. |
| `features.apply_patch_freeform` | 已移除 / 兼容空开关 | false | Removed compatibility flag for the deleted apply_patch fallback feature. |
| `features.apply_patch_streaming_events` | 开发中 | false | Stream structured progress while apply_patch input is being generated. |
| `features.apply_patch_preserve_line_endings` | 已移除 / 兼容空开关 | false | Removed compatibility flag. Patches always preserve existing line endings. |
| `features.exec_permission_approvals` | 开发中 | false | Allow exec tools to request additional permissions while staying sandboxed. |
| `features.write_stdin_approval` | 稳定 | true | Require approval before writing input to escalated unified-exec terminals. |
| `features.hooks` | 稳定 | true | Enable Claude-style lifecycle hooks loaded from hooks.json files. |
| `features.request_permissions_tool` | 开发中 | false | Expose the built-in request_permissions tool. |
| `features.use_linux_sandbox_bwrap` | 已移除 / 兼容空开关 | false | Removed legacy Linux bubblewrap opt-in flag retained as a no-op so old wrappers and config can still parse it. |
| `features.use_legacy_landlock` | 弃用 | false | Use the legacy Landlock Linux sandbox fallback instead of the default bubblewrap pipeline. |
| `features.request_rule` | 已移除 / 兼容空开关 | false | Allow the model to request approval and propose exec rules. |
| `features.experimental_windows_sandbox` | 已移除 / 兼容空开关 | false | Enable Windows sandbox (restricted token) on Windows. |
| `features.elevated_windows_sandbox` | 已移除 / 兼容空开关 | false | Use the elevated Windows sandbox pipeline (setup + runner). |
| `features.windows_sandbox_service` | 开发中 | false | Attempt elevated Windows sandbox provisioning through the installed service. |
| `features.prefer_mxc` | 开发中 | false | Prefer the local native Windows sandbox when available, retaining legacy fallback. |
| `features.remote_models` | 已移除 / 兼容空开关 | false | Legacy remote models flag kept for backward compatibility. |
| `features.api_key_model_discovery` | 稳定 | true | Discover model catalogs for OpenAI API-key authentication. |
| `features.cli_daybreak` | 开发中 | false | Enable Daybreak controls and automatic access-program selection in CLI clients. |
| `features.api_key_cyber_access_programs` | 稳定 | false | Forward explicit programs with builtin OpenAI API keys. |
| `features.enable_request_compression` | 稳定 | true | Compress request bodies (zstd) when sending streaming requests to codex-backend. |
| `features.unbounded_connection_retries` | 稳定 | true | Keep active sampling turns alive until a failed network connection recovers. |
| `features.network_proxy` | 实验菜单 | false | Apply network proxy restrictions to sandboxed sessions that already have network access. |
| `features.worktrees` | 稳定 | true | Enable managed worktree creation and repository-aware sessions. |
| `features.respect_system_proxy` | 开发中 | false | Respect host system proxy settings for Codex-owned network clients. |
| `features.system_proxy_fallback` | 稳定 | true | Retry eligible bootstrap requests through the system proxy after normal routing fails. |
| `features.multi_agent` | 稳定 | true | Enable collab tools. |
| `features.multi_agent_v2` | 稳定 | false | Enable task-path-based multi-agent routing. |
| `features.model_catalog_in_context` | 开发中 | false | Keep spawn model choices in append-only context instead of tool descriptions. |
| `features.multi_agent_v2_dynamic_tools` | 开发中 | false | Inherit client-defined dynamic tools in fresh V2 subagents. |
| `features.defer_mailbox_preemption` | 开发中 | false | Keep sampling through reasoning and commentary boundaries when agent mail arrives. Pending mail is delivered at the next normal input boundary instead. |
| `features.agent_message_board` | 开发中 | false | Enable shared discussion tools for an agent tree. |
| `features.multi_agent_mode` | 已移除 / 兼容空开关 | false | Removed compatibility flag retained as a no-op. |
| `features.enable_fanout` | 已移除 / 兼容空开关 | false | Removed compatibility flag for the deleted agent-job tools. |
| `features.apps` | 稳定 | true | Enable apps. |
| `features.psp` | 开发中 | false | Route first-party ChatGPT requests through PSP. |
| `features.enable_mcp_apps` | 开发中 | false | Enable MCP apps. |
| `features.mcp_2026_07_28` | 开发中 | false | Enable MCP protocol version 2026-07-28 support. |
| `features.codex_apps_mcp_2026_07_28` | 开发中 | false | Enable MCP protocol version 2026-07-28 for the host-owned Codex Apps server. |
| `features.mcp_oauth_refresh_coordination` | 开发中 | false | Let RMCP coordinate OAuth refresh through the configured credential store. |
| `features.use_xaa` | 开发中 | false | Enable enterprise refresh-token authorization for configured MCP resources. |
| `features.apps_mcp_path_override` | 已移除 / 兼容空开关 | false | Removed compatibility flag for the legacy Apps MCP path override. |
| `features.tool_search` | 已移除 / 兼容空开关 | false | Removed compatibility flag retained as a no-op now that tool_search is always enabled. |
| `features.tool_search_always_defer_mcp_tools` | 已移除 / 兼容空开关 | true | Removed compatibility flag. MCP tools are always deferred when tool_search is available. |
| `features.deferred_tool_world_state` | 开发中 | false | Describe deferred tool namespaces in the model-visible world state. |
| `features.incremental_tools` | 开发中 | false | Track top-level tool definitions in world state and emit incremental context updates. |
| `features.non_prefixed_mcp_tool_names` | 开发中 | false | Expose MCP model-visible namespaces without the legacy `mcp__` prefix. |
| `features.unavailable_dummy_tools` | 已移除 / 兼容空开关 | false | Removed compatibility flag for the deleted unavailable-tool placeholder backfill. |
| `features.tool_suggest` | 稳定 | true | Enable discoverable tool suggestions for apps. |
| `features.recommended_plugins` | 稳定 | false | Include recommended plugins in model-visible context. |
| `features.plugins` | 稳定 | true | Enable plugins. |
| `features.executor_capability_discovery` | 开发中 | false | Discover selected-root plugin and skill manifests through one high-level exec-server RPC. |
| `features.skip_host_skill_discovery` | 开发中 | false | Skip host skill snapshots when no registered contributor requires them. |
| `features.plugin_hooks` | 已移除 / 兼容空开关 | false | Removed compatibility flag for plugin-bundled lifecycle hooks. |
| `features.in_app_browser` | 稳定 | true | Allow the in-app browser pane in desktop apps. Requirements-only gate: this should be set from requirements, not user config. |
| `features.browser_annotation_api` | 稳定 | true | Allow websites to open and customize annotation tools in desktop apps. Ordinary user-driven annotation is independent of this gate. Requirements-only gate: this should be set from requirements, not user config. |
| `features.in_app_chat` | 稳定 | true | Allow the in-app chat pane in desktop apps. Requirements-only gate: this should be set from requirements, not user config. |
| `features.in_app_dictation` | 稳定 | true | Allow in-app dictation in desktop apps. Requirements-only gate: this should be set from requirements, not user config. |
| `features.in_app_voice` | 稳定 | true | Allow in-app Voice in desktop apps. Requirements-only gate: this should be set from requirements, not user config. Permission does not establish Voice availability or provider support. |
| `features.in_app_local_automation` | 稳定 | true | Allow desktop apps to run local automations. Requirements-only gate: this should be set from requirements, not user config. |
| `features.in_app_updates` | 稳定 | true | Allow desktop apps to perform in-app updates. Requirements-only gate: this should be set from requirements, not user config. |
| `features.browser_use` | 稳定 | true | Allow Browser Use agent integration in desktop apps. Requirements-only gate: this should be set from requirements, not user config. |
| `features.browser_use_full_cdp_access` | 稳定 | true | Allow Browser Use integration to access the full Chrome DevTools Protocol surface. Requirements-only gate: this should be set from requirements, not user config. |
| `features.browser_use_external` | 稳定 | true | Allow Browser Use integration with external browsers. Requirements-only gate: this should be set from requirements, not user config. |
| `features.computer_use` | 稳定 | true | Allow Codex Computer Use. Requirements-only gate: this should be set from requirements, not user config. |
| `features.remote_plugin` | 稳定 | true | Enable the PS-backed remote plugin catalog. |
| `features.plugin_sharing` | 稳定 | true | Enable remote plugin sharing flows. |
| `features.external_migration` | 已移除 / 兼容空开关 | false | Removed compatibility flag retained as a no-op. |
| `features.image_generation` | 稳定 | true | Enable extension-backed image generation. |
| `features.omit_app_server_notification_media` | 开发中 | false | Omit inline image and audio content from app-server item notifications. |
| `features.image_resize_notice` | 开发中 | false | Tell the model when a prompt image was resized and include its dimensions. |
| `features.unified_image_budget` | 开发中 | false | Apply one shared pixel and token budget to every image, regardless of legacy detail hints. |
| `features.resize_all_images` | 已移除 / 兼容空开关 | true | Removed compatibility flag for always-on centralized image preparation. |
| `features.item_ids` | 已移除 / 兼容空开关 | true | Removed compatibility flag for always-on response item IDs. |
| `features.concurrent_reasoning_summaries` | 开发中 | false | Request sequential cutoff reasoning summary delivery. |
| `features.skill_mcp_dependency_install` | 稳定 | true | Allow prompting and installing missing MCP dependencies. |
| `features.skill_search` | 稳定 | true | Run cheap skill-search methods in shadow mode and emit experiment metrics. |
| `features.skill_env_var_dependency_prompt` | 已移除 / 兼容空开关 | false | Removed compatibility flag for deleted skill env var dependency prompting. |
| `features.mentions_v2` | 稳定 | true | Enable the unified mention popup used by default in the TUI. |
| `features.steer` | 已移除 / 兼容空开关 | true | Steer feature flag - when enabled, Enter submits immediately instead of queuing. Kept for config backward compatibility; behavior is always steer-enabled. |
| `features.default_mode_request_user_input` | 开发中 | false | Allow request_user_input in Default collaboration mode. |
| `features.send_async_message` | 已移除 / 兼容空开关 | false | Removed compatibility flag for model-enabled async user messaging. |
| `features.send_message_to_user_async` | 开发中 | false | Allow root agents to send async user messages without model catalog support. |
| `features.terminal_visualization_instructions` | 开发中 | false | Add terminal-specific visualization guidance to TUI developer instructions. |
| `features.guardian_approval` | 稳定 | true | Enable automatic review for approval prompts. |
| `features.guardianv2.thread_context` | 已移除 / 兼容空开关 | false | Removed compatibility flag for always-on thread-owned Guardian context. |
| `features.guardian_reuse_parent_compaction` | 稳定 | true | Reuse encrypted parent compaction when restarting Guardian review sessions. When disabled, retain an independent review transcript across parent compaction. |
| `features.guardian_root_handoff_context` | 开发中 | false | Limit worker Guardian root evidence to preceding root communication windows. |
| `features.guardian_enhanced_node_repl_transcripts` | 开发中 | false | Include completed node_repl or cua_repl Code Mode responses in Guardian reviews. |
| `features.guardian_node_repl_transcript_images` | 开发中 | false | Include completed node_repl or cua_repl Code Mode response images in Guardian reviews. |
| `features.guardian_conversation_history_tools` | 开发中 | false | Give Guardian access to the root conversation's message history tools. |
| `features.guardianv2` | 开发中 | false | Enable Guardian V2 automatic approval reviews. |
| `features.guardianv2_decisions_comparison` | 开发中 | false | Run Decisions alongside Guardian V2 for measurement without changing approvals. |
| `features.guardian_ext` | 已移除 / 兼容空开关 | false | Removed compatibility flag for the unused Guardian extension prototype. |
| `features.goals` | 稳定 | true | Enable persisted thread goals and automatic goal continuation. |
| `features.token_budget` | 开发中 | false | Add current context-window metadata to model-visible context. |
| `features.context_management` | 开发中 | false | Enables experimental context management. |
| `features.rollout_budget` | 开发中 | false | Track and report a shared token budget across a session's agent threads. |
| `features.reasoning_effort_override` | 开发中 | false | Append trusted response configuration items when the selected reasoning effort changes. |
| `features.current_time_reminder` | 开发中 | false | Add current-time reminders to model-visible context. |
| `features.nonfatal_clock_read_errors` | 开发中 | false | Report failed clock reads to the model without failing the turn. |
| `features.collaboration_modes` | 已移除 / 兼容空开关 | true | Enable collaboration modes (Plan, Default). Kept for config backward compatibility; behavior is always collaboration-modes-enabled. |
| `features.tool_call_mcp_elicitation` | 稳定 | true | Route MCP tool approval prompts through the MCP elicitation request path. |
| `features.auth_elicitation` | 稳定 | true | Prompt Codex Apps connector auth failures through MCP URL elicitations. |
| `features.bedrock_setup_wizard` | 开发中 | false | Offer Amazon Bedrock setup during TUI sign-in onboarding. |
| `features.personality` | 已移除 / 兼容空开关 | false | Removed compatibility flag retained as a no-op. |
| `features.artifact` | 开发中 | false | Enable native artifact tools. |
| `features.fast_mode` | 稳定 | true | Enable Fast mode selection in the TUI and request layer. |
| `features.ultrafast_mode` | 稳定 | true | Enable Ultra Fast mode independently of Fast mode. |
| `features.step_model_switching` | 开发中 | false | Enable explicitly requested model changes for later step captures. |
| `features.realtime_conversation` | 稳定 | true | Enable voice conversations in the TUI. |
| `features.remote_control` | 已移除 / 兼容空开关 | false | Removed compatibility flag for the deleted remote control feature. |
| `features.image_detail_original` | 已移除 / 兼容空开关 | false | Removed compatibility flag retained as a no-op so old wrappers can still pass `--enable image_detail_original`. |
| `features.tui_app_server` | 已移除 / 兼容空开关 | true | Removed compatibility flag. The TUI now always uses the app-server implementation. |
| `features.workspace_owner_usage_nudge` | 已移除 / 兼容空开关 | false | Removed compatibility flag retained as a no-op now that workspace owner usage nudges are always enabled. |
| `features.responses_websockets` | 已移除 / 兼容空开关 | false | Legacy rollout flag for Responses API WebSocket transport experiments. |
| `features.responses_websockets_v2` | 已移除 / 兼容空开关 | false | Legacy rollout flag for Responses API WebSocket transport v2 experiments. |
| `features.remote_compaction_v2` | 已移除 / 兼容空开关 | false | Removed compatibility key, still advertised to the Responses API. |
| `features.compaction_image_budget` | 稳定 | true | Include retained images in the remote compaction context budget. |
| `features.retain_client_developer_messages` | 开发中 | false | Retain client-authored developer messages across compacted context windows. |
| `features.use_agent_identity` | 开发中 | false | Use Agent Identity for ChatGPT-authenticated sessions. |
| `features.workspace_dependencies` | 稳定 | true | Enable workspace dependency support. |


## 19. 开发者应优先补齐的配置与迁移

### 19.1 新的权限 profile

`default_permissions` 选择完整权限集合，`[permissions.<name>]` 定义继承和细粒度目录/网络策略。它与 `~/.codex/<name>.config.toml` 的运行场景 profile 是两套命名空间。

```toml
approval_policy = "on-request"
default_permissions = "dev"

[permissions.dev]
description = "仅允许项目目录内开发"
extends = ":workspace"

[permissions.dev.filesystem.":workspace_roots"]
"**/.env*" = "deny"
"**/*.pem" = "deny"
```

不要同时堆叠相互矛盾的 `default_permissions` 与旧 `sandbox_mode`。升级时通过 `/permissions`、`/status`、`/debug-config` 确认最终可写根和拒绝项。网络域名规则还需要对应代理实现执行，单纯写域名不会自动保证所有直连请求受限。

### 19.2 自定义 Responses provider 的新能力声明

```toml
model_provider = "gateway"
model = "服务商实际开放的模型ID"

[model_providers.gateway]
name = "Gateway"
base_url = "https://gateway.example.com/v1"
wire_api = "responses"
env_key = "CODEX_GATEWAY_API_KEY"
requires_openai_auth = false

[model_providers.gateway.capabilities]
# 只有服务商确实实现托管搜索/Responses 压缩协议时才改成 true / v2。
external_web_access = false
remote_compaction = "unsupported"
```

`external_web_access` 控制托管搜索是否可访问实时网页，`remote_compaction` 仅支持 `unsupported` / `v2`，省略保留 provider 默认。此声明不会为服务商补出尚未实现的 API。`wire_api = "chat"`、`ollama-chat` 已移除，不能再作为接入模板。

### 19.3 终端显示与设备配置

```toml
[tui]
fullscreen_transcript = true
copy_on_select = true
right_click_paste = false
mouse_scroll_speed = 3
raw_output_mode = false
```

复制、右键和 OSC 剪贴板支持与终端环境有关；SSH/tmux 下仍需终端支持。`/tui` 为下一次启动选择模式，`/raw` 切换便于复制的滚动输出。语音设备使用 `/voice settings` 配置后保存到 `[audio]`，设备名称应由当前机器的枚举结果选择。

### 19.4 移除或迁移的旧字段

| 旧项目 | 当前处理 |
|---|---|
| `disable_response_storage`、`windows_wsl_setup_acknowledged` | 不在 0.162.1 schema 中，删除旧模板残留，不能据此推导隐私或平台状态 |
| `mcp_servers.<name>.type = "stdio"` | 不是当前 schema 字段；用 command/args 选择 stdio，用 url 选择 HTTP |
| `startup_timeout_ms` | 兼容键仍可识别，新模板统一用 startup_timeout_sec，勿混用单位 |
| `tui.prompt_suggestions` | 0.159.0 移除自动后续建议及该字段 |
| `personality` / `/personality` | 配置仅兼容旧值，friendly/pragmatic 不再选风格；当前稳定 CLI 没有此内置 slash 命令 |
| `features.transcript_v2` | 已弃用，改用 tui.fullscreen_transcript |
| `features.apply_patch_preserve_line_endings` | 已移除；0.162.0 默认保留已有 CRLF，无需 opt-in |
| 主配置 `[profiles.<name>]` 与新 `--profile <name>` 混用 | 同名会明确报错，迁移到 `<name>.config.toml` 后移除旧选择器/表 |
| 固定 1M 上下文模板 | 不再作为默认示例；模型目录可声明当前窗口与上限，配置值不会扩大服务端窗口 |

### 19.5 Hooks 与项目配置边界

生命周期包含 `SessionStart`、`SessionEnd`、`UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PermissionRequest`、`PreCompact`、`PostCompact`、`Stop`、`SubagentStart`、`SubagentStop`、`Interrupt`。前表中的 `hooks.<event>[]` 列出 matcher 和动作结构；动作按 command、mcp_tool、prompt、agent 等 type 分支定义，表中同时列出各分支字段；不能把各分支字段混合成一个通用动作，具体事件输入输出协议仍以 Hooks 文档为准。

Hook 内容需要信任记录。`--dangerously-bypass-hook-trust` 仅用于已经审查来源的自动化调用，不能当正常安装步骤。管理员可以在 **requirements.toml** 设置 `allow_managed_hooks_only = true`；该键写入普通 config.toml 不会启用此策略。

0.162.1 项目本地配置会忽略这些宿主字段：`openai_base_url`、`chatgpt_base_url`、`apps_mcp_product_sku`、`responses_api_metadata`、`model_provider`、`model_providers`、`notify`、`profile`、`profiles`、`experimental_realtime_webrtc_call_base_url`、`experimental_realtime_ws_base_url`、`otel`。用户、系统、managed 和 runtime 层仍可以配置它们。不要把所有未知字段都解释成“项目禁止”，也不要依赖仓库文件改变用户凭据去向。

## 20. requirements.toml 管理员约束索引

这些键属于组织策略，**不是普通 config.toml 的补充键**。Windows 系统位置是 `%ProgramData%\OpenAI\Codex\requirements.toml`，Unix 是 `/etc/codex/requirements.toml`；云端、设备管理与系统层可共同形成约束。普通用户配置和 CLI 参数无法绕过这些约束。


| requirements 顶层键 | 源码类型 | 用途 |
|---|---|---|
| `allowed_login_methods` | Option&lt;Vec&lt;ForcedLoginMethod&gt;&gt; | 允许登录方式 |
| `allowed_chatgpt_workspaces` | Option&lt;Vec&lt;String&gt;&gt; | 允许 workspace |
| `cli_auth_credentials_store` | Option&lt;AuthCredentialsStoreMode&gt; | file/keyring/auto 凭据后端；未配置默认 file，不保证存在 auth.json。 |
| `chatgpt_base_url` | Option&lt;String&gt; | ChatGPT 请求基址，与 OpenAI API provider 基址分开。 |
| `sqlite_home` | Option&lt;AbsolutePathBuf&gt; | SQLite 状态位置，默认 CODEX_SQLITE_HOME 或 CODEX_HOME。 |
| `log_dir` | Option&lt;AbsolutePathBuf&gt; | 日志目录，默认 $CODEX_HOME/log；显式设置还会启用 TUI 文本日志。 |
| `model_catalog_json` | Option&lt;AbsolutePathBuf&gt; | 启动时加载模型目录 JSON；线程内覆盖不会重新加载。 |
| `model_provider` | Option&lt;String&gt; | 选择 provider ID；须对应内置或自定义 provider。 |
| `model_providers` | Option&lt;HashMap&lt;String, ModelProviderInfo&gt;&gt; | 自定义 provider 目录；不可覆盖内置 ID。 |
| `check_for_update_on_startup` | Option&lt;bool&gt; | 启动检查升级；默认 true，集中管理升级时可关闭。 |
| `allow_login_shell` | Option&lt;bool&gt; | 允许 shell 工具请求 login shell；未设时默认允许。 |
| `feedback` | Option&lt;FeedbackConfigToml&gt; | 反馈收集开关，默认启用。 |
| `allowed_approval_policies` | Option&lt;Vec&lt;AskForApproval&gt;&gt; | 允许的审批策略 |
| `allowed_approvals_reviewers` | Option&lt;Vec&lt;ApprovalsReviewer&gt;&gt; | 允许的审批审核者 |
| `allowed_sandbox_modes` | Option&lt;Vec&lt;SandboxModeRequirement&gt;&gt; | 旧沙箱允许集合 |
| `allowed_permission_profiles` | Option&lt;BTreeMap&lt;String, bool&gt;&gt; | 允许的权限 profile 映射 |
| `default_permissions` | Option&lt;String&gt; | 选择内置 :workspace/:read-only 等或命名权限 profile。 |
| `remote_sandbox_config` | Option&lt;Vec&lt;RemoteSandboxConfigToml&gt;&gt; | 按 hostname_patterns 约束远端 sandbox |
| `allowed_web_search_modes` | Option&lt;Vec&lt;WebSearchModeRequirement&gt;&gt; | 允许搜索模式 |
| `allow_managed_hooks_only` | Option&lt;bool&gt; | 只执行受管理来源 Hooks |
| `allow_browser_and_computer_use` | Option&lt;bool&gt; | 浏览器与桌面操作总约束 |
| `allow_appshots` | Option&lt;bool&gt; | 允许窗口截图上下文 |
| `allow_remote_control` | Option&lt;bool&gt; | 允许 Remote control |
| `computer_use` | Option&lt;ComputerUseRequirementsToml&gt; | 按 macOS bundle ID、Windows AUMID/EXE 控制桌面应用访问。 |
| `browser_use` | Option&lt;BrowserUseRequirementsToml&gt; | 按 origin 控制浏览器访问、上传下载及 CDP 权限。 |
| `in_app_browser` | Option&lt;InAppBrowserRequirementsToml&gt; | 内置浏览器域名与请求约束 |
| `windows` | Option&lt;WindowsRequirementsToml&gt; | Windows 沙箱实现选择，与任务 sandbox_mode 分开。 |
| `features` | Option&lt;FeatureRequirementsToml&gt; | 受管理的 feature_requirements 约束 |
| `hooks` | Option&lt;ManagedHooksRequirementsToml&gt; | 生命周期 Hook 和信任状态；执行需符合来源信任规则。 |
| `mcp_servers` | Option&lt;BTreeMap&lt;String, McpServerRequirement&gt;&gt; | 外部 MCP 服务、OAuth、工具白名单、超时与工具审批。 |
| `plugins` | Option&lt;BTreeMap&lt;String, PluginRequirementsToml&gt;&gt; | 单插件及其 MCP 服务启用和工具策略。 |
| `marketplaces` | Option&lt;MarketplaceRequirementsToml&gt; | 插件市场来源与同步元数据；通常通过 plugin marketplace 管理。 |
| `apps` | Option&lt;AppsRequirementsToml&gt; | Apps/连接器的默认策略、单应用和单工具策略。 |
| `rules` | Option&lt;RequirementsExecPolicyToml&gt; | 受管理命令执行规则 |
| `enforce_residency` | Option&lt;ResidencyRequirement&gt; | 数据驻留要求 |
| `experimental_network` | Option&lt;NetworkRequirementsToml&gt; | 受管理的 network 约束 |
| `application` | Option&lt;ApplicationRequirementsToml&gt; | 应用可访问集合 |
| `permissions` | Option&lt;PermissionsRequirementsToml&gt; | 命名权限 profile，含继承、文件系统、网络与工作区根。 |
| `auto_review` | Option&lt;AutoReviewRequirementsToml&gt; | required_on_models 与 ignore_rules 约束 |
| `models` | Option&lt;ModelsRequirementsToml&gt; | 新线程 model/effort/service_tier 默认值 |
| `additional_developer_instructions` | Option&lt;String&gt; | 附加管理指令 |
| `guardian_policy_config` | Option&lt;String&gt; | 管理审核策略 |
| `guardian_extra_policy` | Option&lt;String&gt; | 附加管理审核策略 |


管理约束嵌套类型需要与 ordinary schema 区分；完整结构以[ConfigRequirementsToml 及其字段类型](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/config/src/config_requirements.rs)和[Enterprise 管理配置](https://learn.chatgpt.com/docs/enterprise/admin-setup)为准。常用子字段为 `models.new_thread.model` / `model_reasoning_effort` / `service_tier`、`auto_review.required_on_models`、`auto_review.ignore_rules`、`permissions.filesystem.deny_read`、`windows.allowed_sandbox_implementations`、`windows.allow_mxc`。
