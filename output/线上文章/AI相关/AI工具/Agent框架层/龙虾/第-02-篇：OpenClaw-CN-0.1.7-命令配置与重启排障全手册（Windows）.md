---
title: "第 02 篇：OpenClaw-CN 0.1.7 命令配置与重启排障全手册（Windows）"
slug: "ai-agent-openclaw-4d87088b"
summary: "面向已经安装 OpenClaw-CN 但经常遇到重启后失效、命令不生效或网关不稳定的用户，系统整理 Windows 环境下的命令配置与排障流程。"
category: "龙虾"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "Agent框架层"
  - "龙虾"
tags:
  - "OpenClaw"
  - "龙虾"
  - "Windows"
  - "故障排查"
  - "Agent框架"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cac036"
originalSlug: "ai-agent-openclaw-4d87088b"
originalStatus: "published"
publishedAt: "2026-05-24T13:49:15.053Z"
updatedAt: "2026-07-31T11:16:25.524Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 02 篇：OpenClaw-CN 0.1.7 命令配置与重启排障全手册（Windows）

> 适用对象：第一次上手 OpenClaw/龙虾，或已经安装但经常“重启后不工作”的用户  
> 适用环境：Windows + `openclaw-cn.cmd`（本文以你机器实测版本 `0.1.7` 为基线）  
> 校验日期：2026-03-08  
> 核心目标：让你从“会运行”到“会定位故障、会修复、会稳定使用”。

---

## 阅读定位（先看这个）

1. 前置文章：第一篇（安装与首次跑通）
2. 本篇职责：只处理“运行稳定性”和“重启后失败”
3. 不再展开：Day1 理念、7 天课程叙事、全量参数字典（分别看第三/第四/第五篇）

---

## 0. 先说你最关心的问题：为什么关机重启后没起来？

结合你提供的总结和我在你机器上的实测，最常见有 3 类原因：

1. **你理解的“开机自动启动”与任务实际触发条件不一致**  
   当前任务计划是 `At logon time` + `Interactive only`，即“登录该用户后触发”，不是“系统开机立即后台启动”。
2. **计划任务存在，但启动脚本丢失**  
   任务通常会调用 `~/.openclaw/gateway.cmd`。如果这个文件不存在，任务会触发但网关起不来。
3. **任务表面显示已注册，但实际启动失败**  
   常见表现：`gateway status` 里 `RPC 探测失败`，`schtasks /Query` 里 `Last Result` 非 0（例如 `1`、`-1073741510`）。

你这台机器当前命中的是第 2 类（任务指向 `C:\Users\HN246\.openclaw\gateway.cmd`，但文件不存在）。

---

## 1. 先建立正确心智模型（小白版）

OpenClaw 日常运行有两种模式：

1. **前台手动模式**  
   你开一个终端执行 `openclaw-cn.cmd gateway run`，窗口开着就运行，关掉就停止。
2. **后台服务模式（Windows 是计划任务）**  
   `openclaw-cn.cmd gateway install` 会注册一个计划任务；后续由任务来拉起网关。

简单理解：

- 手动模式：最直观，最稳，最好排错。
- 服务模式：适合长期常驻，但对任务配置、权限、脚本路径更敏感。

---

## 2. 安装与入口校验（必须先过）

### 2.1 环境要求

1. Node.js 22+
2. PowerShell 5.1+
3. `openclaw-cn.cmd` 可执行

### 2.2 三条基础校验命令

```powershell
openclaw-cn.cmd --version
openclaw-cn.cmd --help
openclaw-cn.cmd gateway --help
```

你机器实测：`openclaw-cn.cmd --version` 返回 `0.1.7`。

### 2.3 命令找不到时

如果系统 PATH 未生效，先用绝对路径执行（你总结里这条是对的）：

```powershell
E:\DevEnv\nodejs\node_global\openclaw-cn.cmd --version
```

---

## 3. 初始化与配置：一条“最稳主线”

### 3.1 推荐初始化方式

```powershell
openclaw-cn.cmd onboard
```

如果你想脚本化：

```powershell
openclaw-cn.cmd onboard --non-interactive --accept-risk --mode local --install-daemon
```

### 3.2 配置文件在哪里

默认主配置：

```text
C:\Users\你的用户名\.openclaw\openclaw.json
```

### 3.3 配置命令（比手改 JSON 更安全）

```powershell
openclaw-cn.cmd config get gateway --json
openclaw-cn.cmd config set gateway.mode local
openclaw-cn.cmd config set gateway.bind loopback
openclaw-cn.cmd config unset gateway.remote.url
```

说明：

1. 标量值可直接 set（如 `local`、`loopback`）。
2. 复杂对象建议先备份配置，再用 JSON5 + `--json` 写入。

### 3.4 排障必查文件（作用 + 检查命令）

| 文件/目录 | 作用 | 快速检查命令 |
|---|---|---|
| `C:\Users\<你>\.openclaw\openclaw.json` | 主配置来源（端口、bind、auth、workspace） | `openclaw-cn.cmd config get gateway --json` |
| `C:\Users\<你>\.openclaw\gateway.cmd` | 计划任务调用的网关启动脚本 | `Test-Path "$env:USERPROFILE\\.openclaw\\gateway.cmd"` |
| `C:\Users\<你>\.openclaw\agents\main\sessions\sessions.json` | 会话路由与会话元数据 | `Test-Path "$env:USERPROFILE\\.openclaw\\agents\\main\\sessions\\sessions.json"` |
| `C:\Users\<你>\.openclaw\agents\main\agent\auth-profiles.json` | 认证配置档案（渠道/模型） | `Test-Path "$env:USERPROFILE\\.openclaw\\agents\\main\\agent\\auth-profiles.json"` |
| `C:\Users\<你>\.openclaw\credentials\` | 凭据目录 | `Test-Path "$env:USERPROFILE\\.openclaw\\credentials"` |

小白判断规则：

1. `openclaw.json` 有值但 `gateway.cmd` 缺失：常见于“任务在、服务起不来”。
2. `sessions.json` 丢失不一定导致网关起不来，但会影响会话连续性。

---

## 4. 关键配置字段详解（专业但白话）

下面这些字段，决定 80% 的可用性：

1. `gateway.mode`  
   - `local`：本机启动网关。  
   - `remote`：CLI 连接远端网关。  
   - 你要本机跑，就必须是 `local`。
2. `gateway.port`  
   - 默认 `18789`。  
   - 端口冲突就换一个，并同步你的客户端连接地址。
3. `gateway.bind`  
   - `loopback`：仅本机访问（最安全，默认推荐）。  
   - `lan/tailnet/custom`：对外访问，需要认证配置到位。
4. `gateway.auth.mode` + `gateway.auth.token/password`  
   - 非 loopback 绑定时，没有认证会被拒绝启动。  
   - 生产/局域网建议始终启用 token 或 password。
5. `gateway.remote.token`  
   - 仅用于“远程 CLI 调用默认值”，不是本地网关认证开关。

---

## 5. 命令总览（每条命令都告诉你“何时用+怎么看成功”）

| 命令 | 何时用 | 成功判据 |
|---|---|---|
| `openclaw-cn.cmd gateway run` | 临时手动启动 | 终端持续输出，`http://127.0.0.1:18789/` 可访问 |
| `openclaw-cn.cmd status` | 日常总览 | 显示 Gateway/渠道状态，无明显错误 |
| `openclaw-cn.cmd status --all` | 深度体检 | 输出完整诊断表，可定位服务/配置问题 |
| `openclaw-cn.cmd gateway status` | 看服务 + 探测 | 看到服务状态、探测目标、RPC 结果 |
| `openclaw-cn.cmd gateway install` | 安装后台服务 | 输出已安装/已注册 |
| `openclaw-cn.cmd gateway start` | 启动后台服务 | 输出 started（再结合 status 验证） |
| `openclaw-cn.cmd gateway stop` | 停止后台服务 | 输出 stopped |
| `openclaw-cn.cmd gateway uninstall` | 移除后台服务 | 输出 uninstalled（若失败看排障章节） |
| `openclaw-cn.cmd logs --follow` | 持续看日志 | 有实时日志流 |
| `openclaw-cn.cmd doctor` | 自动诊断 | 报告风险和建议修复 |
| `openclaw-cn.cmd doctor --fix` | 自动修复 | 应用修复并给出变更结果 |
| `openclaw-cn.cmd update` | 升级 CLI | 更新完成并按需重启网关 |

---

## 6. 手动模式（建议你先稳定用这套）

### 6.1 启动

```powershell
openclaw-cn.cmd gateway run
```

### 6.2 检查

```powershell
openclaw-cn.cmd status
openclaw-cn.cmd gateway status
```

### 6.3 使用

```text
http://127.0.0.1:18789/
```

### 6.4 停止

在运行窗口按 `Ctrl + C`。

这套方式对新手最友好，问题最少。

---

## 7. 自动模式（计划任务）

### 7.1 安装与启停

```powershell
openclaw-cn.cmd gateway install
openclaw-cn.cmd gateway start
openclaw-cn.cmd gateway status
```

停止和移除：

```powershell
openclaw-cn.cmd gateway stop
openclaw-cn.cmd gateway uninstall
```

### 7.2 重点认知（非常重要）

Windows 下服务本质是 `schtasks`。实测任务为：

1. 任务名：`Openclaw Gateway`
2. 触发类型：`At logon time`
3. 运行模式：`Interactive only`

所以默认语义是“登录后启动”，不是“开机未登录也启动”。

---

## 8. 你这个“重启后没成功”的完整排障流程

### 8.1 第一步：3 条命令定位问题类型

```powershell
openclaw-cn.cmd gateway status --json
schtasks /Query /TN "Openclaw Gateway" /V /FO LIST
Test-Path "$env:USERPROFILE\.openclaw\gateway.cmd"
```

### 8.2 常见输出如何解读

1. `service.loaded=true` 但 `rpc.ok=false`  
   服务注册了，但网关进程没真正跑起来。
2. `command: null` + `gateway.cmd` 不存在  
   任务脚本丢失（你当前就是这类）。
3. `Last Result: 1`  
   任务触发后执行失败（常见是脚本/路径问题）。
4. `Last Result: -1073741510`（十六进制 `0xC000013A`）  
   通常是进程被中断或终止。

---

## 9. 修复方案 A（标准官方流程）

先执行：

```powershell
openclaw-cn.cmd gateway stop
openclaw-cn.cmd gateway uninstall
openclaw-cn.cmd gateway install
openclaw-cn.cmd gateway start
openclaw-cn.cmd gateway status
```

如果一切正常，`gateway.cmd` 应该被重建，RPC 探测恢复。

---

## 10. 修复方案 B（你这个场景更需要：任务残留/脚本缺失）

当你遇到以下任一情况时，用这套：

1. `gateway uninstall` 提示 `Gateway service still loaded after uninstall`
2. `schtasks /Delete` 提示 `Access is denied`
3. `gateway install --force` 仍返回 already installed，但脚本没恢复

### 10.1 以管理员 PowerShell 执行

```powershell
schtasks /End /TN "Openclaw Gateway"
schtasks /Delete /TN "Openclaw Gateway" /F
openclaw-cn.cmd gateway install
openclaw-cn.cmd gateway start
```

### 10.2 再次验证

```powershell
Test-Path "$env:USERPROFILE\.openclaw\gateway.cmd"
schtasks /Query /TN "Openclaw Gateway" /V /FO LIST
openclaw-cn.cmd gateway status
```

---

## 11. 修复方案 C（无管理员权限时的临时兜底）

如果你暂时拿不到管理员权限，但任务还在调用 `~/.openclaw/gateway.cmd`，可以先手动重建脚本：

```powershell
$cli = (Get-Command openclaw-cn.cmd -ErrorAction Stop).Source
$cliRoot = Split-Path -Parent $cli
$entry = Join-Path $cliRoot 'node_modules\openclaw-cn\dist\entry.js'
$node = (Get-Command node -ErrorAction Stop).Source
$stateDir = Join-Path $env:USERPROFILE '.openclaw'
$scriptPath = Join-Path $stateDir 'gateway.cmd'

New-Item -ItemType Directory -Path $stateDir -Force | Out-Null

@"
@echo off
set HOME=$env:USERPROFILE
set OPENCLAW_GATEWAY_PORT=18789
"$node" "$entry" gateway --port 18789
"@ | Set-Content -Path $scriptPath -Encoding Ascii

Test-Path $scriptPath
schtasks /Run /TN "Openclaw Gateway"
```

这是“先恢复可用性”的临时方案，后续仍建议做一次管理员级重建。

---

## 12. 配对与渠道：新版命令和老教程差异

很多旧教程会写 `pair dm ...`，但你当前 `0.1.7` 主要用下面这组：

```powershell
openclaw-cn.cmd pairing list
openclaw-cn.cmd pairing approve <code>
openclaw-cn.cmd devices list
openclaw-cn.cmd devices approve <requestId>
openclaw-cn.cmd channels login --channel <channel>
openclaw-cn.cmd channels status
```

建议规则：

1. 先跑 `openclaw-cn.cmd --help`
2. 再跑具体子命令 `--help`
3. 以本机输出为准，不盲抄旧文章

---

## 13. 更新策略（稳定优先）

### 13.1 日常更新

```powershell
openclaw-cn.cmd update status
openclaw-cn.cmd update
openclaw-cn.cmd gateway status
```

### 13.2 切换通道（需要时）

```powershell
openclaw-cn.cmd update --channel stable
openclaw-cn.cmd update --channel beta
openclaw-cn.cmd update --channel dev
```

### 13.3 升级后固定动作

```powershell
openclaw-cn.cmd doctor
openclaw-cn.cmd gateway restart
openclaw-cn.cmd status --all
```

---

## 14. 给你的一套“每天可复制”操作清单

### 14.1 只手动用（推荐新手）

```powershell
openclaw-cn.cmd gateway run
# 新开一个窗口
openclaw-cn.cmd status
```

### 14.2 要长期后台跑

```powershell
openclaw-cn.cmd gateway install
openclaw-cn.cmd gateway start
openclaw-cn.cmd gateway status
```

### 14.3 出问题先跑这个

```powershell
openclaw-cn.cmd gateway status --json
openclaw-cn.cmd status --all
openclaw-cn.cmd logs --follow
openclaw-cn.cmd doctor
schtasks /Query /TN "Openclaw Gateway" /V /FO LIST
```

---

## 15. 资料依据（已核对）

- 你的手动总结：`C:/Users/HN246/Desktop/龙虾_OpenClaw_手动使用说明_2026-03-08.md`
- OpenClaw CN 启动页：<https://clawd.org.cn/start/getting-started.html>
- OpenClaw CN 向导：<https://clawd.org.cn/start/wizard.html>
- OpenClaw CN setup：<https://clawd.org.cn/start/setup.html>
- OpenClaw CN 配对：<https://clawd.org.cn/start/pairing.html>
- OpenClaw CN 助手页：<https://clawd.org.cn/start/clawd.html>
- OpenClaw CN 更新页：<https://clawd.org.cn/install/updating.html>
- OpenClaw 中文 Gateway CLI：<https://docs.openclaw.ai/zh-CN/cli/gateway>
- OpenClaw 中文 Gateway 配置：<https://docs.openclaw.ai/zh-CN/gateway/configuration>
- OpenClaw 中文 Gateway 故障排除：<https://docs.openclaw.ai/zh-CN/gateway/troubleshooting>
- OpenClaw 更新说明：<https://docs.openclaw.ai/install/updating>
- OpenClaw Gateway Runbook：<https://docs.openclaw.ai/gateway/index>

---

读完本篇后的建议顺序：

1. 第三篇：补齐 Day1 认知与 SOUL/USER/AGENTS
2. 第五篇：按场景查命令参数与错误串对照
