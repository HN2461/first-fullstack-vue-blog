---
title: "第五篇：OpenClaw101 全7天逐命令拆解（龙虾中文版超详细手册）"
slug: "ai-agent-openclaw101-7-98f47885"
summary: "以命令字典的方式拆解 OpenClaw101 全流程中常见命令、参数与使用场景，适合作为排障和日常操作时的速查手册。"
category: "龙虾"
tags:
  - "OpenClaw101"
  - "龙虾"
  - "命令速查"
  - "Agent框架"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cac03a"
originalSlug: "ai-agent-openclaw101-7-98f47885"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第五篇：OpenClaw101 全7天逐命令拆解（龙虾中文版超详细手册）

> 本篇定位：命令字典。  
> 使用方式：遇到问题先按场景定位章节，再复制命令执行。  
> 版本基线：`openclaw-cn.cmd 0.1.7`（Windows 实测，2026-03-08）。  
> 与其它篇关系：排障主流程看第二篇；7天学习路线看第四篇。

---

## 0. 先看这篇怎么查

1. 你要启动或管理网关：看第 3 章。
2. 你要看状态/日志/健康：看第 4 章。
3. 你要改配置：看第 5 章。
4. 你要接渠道和配对：看第 6 章。
5. 你要做技能和自动化：看第 7、8 章。
6. 你遇到报错串：直接看第 10 章。

---

## 1. 快速索引（按任务找命令）

| 任务 | 首选命令 | 结果判断 |
|---|---|---|
| 看版本 | `openclaw-cn.cmd --version` | 返回版本号（如 `0.1.7`） |
| 前台启动网关 | `openclaw-cn.cmd gateway run` | 终端持续运行 |
| 查网关是否可连 | `openclaw-cn.cmd gateway status --json` | `rpc.ok=true` |
| 全量体检 | `openclaw-cn.cmd status --all` | 输出诊断表 |
| 读健康状态 | `openclaw-cn.cmd health --json` | `ok=true` |
| 实时看日志 | `openclaw-cn.cmd logs --follow` | 持续输出日志 |
| 自动诊断修复 | `openclaw-cn.cmd doctor --fix` | 应用修复并回显 |
| 安全审计 | `openclaw-cn.cmd security audit --json` | 返回告警列表 |
| 查技能可用性 | `openclaw-cn.cmd skills check --json` | `missingRequirements=0` |
| 管理定时任务 | `openclaw-cn.cmd cron ...` | `list/status` 可读 |
| 查节点状态 | `openclaw-cn.cmd nodes status --json` | 网关可达时返回状态 |
| 查配置文件作用 | 第 5.3 节文件字典 | 知道“改什么、去哪里改” |

---

## 2. 环境与命令入口（每次先确认）

```powershell
openclaw-cn.cmd --version
openclaw-cn.cmd --help
openclaw-cn.cmd gateway --help
```

如果命令找不到，用完整路径：

```powershell
E:\DevEnv\nodejs\node_global\openclaw-cn.cmd --version
```

---

## 3. 网关生命周期命令（Day2 核心）

### 3.1 `gateway run`

- 作用：前台启动网关（最稳、最好排障）。
- 常用参数：`--port`、`--bind`、`--force`、`--verbose`。
- 场景：首次跑通、定位问题、临时使用。

```powershell
openclaw-cn.cmd gateway run
```

### 3.2 `gateway status --json`

- 作用：一次看服务状态、端口状态、RPC 连通性。
- 场景：任何“打不开/连不上”问题的第一命令。

```powershell
openclaw-cn.cmd gateway status --json
```

成功样例（本机实测）：

```json
"port": { "status": "busy" },
"rpc": { "ok": true, "url": "ws://127.0.0.1:18789" }
```

失败样例（本机实测）：

```json
"port": { "status": "free" },
"rpc": { "ok": false, "error": "gateway closed (1006 abnormal closure ...)" }
```

关键理解：  
`service.loaded=true` 只表示计划任务“注册了”，不是“正在可用”。

### 3.3 `gateway install/start/stop/restart/uninstall`

- 作用：管理后台服务（Windows 下是计划任务）。
- 场景：你想登录后自动启动，不想每次手动 `run`。

```powershell
openclaw-cn.cmd gateway install
openclaw-cn.cmd gateway start
openclaw-cn.cmd gateway stop
openclaw-cn.cmd gateway restart
openclaw-cn.cmd gateway uninstall
```

`install` 关键参数：`--force`、`--runtime node|bun`、`--port`、`--token`。

---

## 4. 诊断与恢复命令（Day2/Day4 运维核心）

### 4.1 `status --all`

```powershell
openclaw-cn.cmd status --all
```

用途：输出可粘贴的全量诊断报告。  
你机器故障态样例（节选）：

```text
Gateway ... unreachable (connect ECONNREFUSED 127.0.0.1:18789)
```

### 4.2 `health --json`

```powershell
openclaw-cn.cmd health --json
```

成功样例（本机实测）：

```json
{
  "ok": true,
  "heartbeatSeconds": 1800,
  "defaultAgentId": "main"
}
```

失败样例（本机实测）：

```text
Error: gateway closed (1006 abnormal closure ...)
```

### 4.3 `logs --follow`

```powershell
openclaw-cn.cmd logs --follow
```

常用参数：`--limit`、`--max-bytes`、`--json`、`--local-time`。

### 4.4 `doctor` / `doctor --fix`

```powershell
openclaw-cn.cmd doctor
openclaw-cn.cmd doctor --fix
```

用途：自动体检与自动修复常见配置问题。  
参数提醒：`--deep` 扫描更广，`--force` 会更激进。

### 4.5 `security audit`

```powershell
openclaw-cn.cmd security audit --json
openclaw-cn.cmd security audit --deep
openclaw-cn.cmd security audit --fix
```

你机器实测摘要：

```json
"summary": { "critical": 4, "warn": 2, "info": 1 }
```

建议顺序：先看 `--json`，再决定是否 `--fix`。

---

## 5. 配置命令（Day2/Day4 必备）

### 5.1 `configure --section`

```powershell
openclaw-cn.cmd configure --section workspace
openclaw-cn.cmd configure --section gateway
openclaw-cn.cmd configure --section channels
openclaw-cn.cmd configure --section skills
```

用途：按模块交互式调整配置，避免手改 JSON 出错。

### 5.2 `config get/set/unset`

```powershell
openclaw-cn.cmd config get gateway --json
openclaw-cn.cmd config get agents.defaults.workspace

openclaw-cn.cmd config set gateway.mode local
openclaw-cn.cmd config set gateway.bind loopback
openclaw-cn.cmd config set gateway.port 18789

openclaw-cn.cmd config unset gateway.remote.url
```

`config set` 关键点：

1. 不带 `--json` 时按原始字符串写入。
2. 带 `--json` 时按 JSON5 解析（对象、数组、布尔、数字）。

### 5.3 配置文件字典（路径 + 作用 + 风险）

| 文件/目录 | 默认路径（Windows） | 作用 | 改错后常见影响 |
|---|---|---|---|
| 主配置文件 | `C:\Users\<你>\.openclaw\openclaw.json` | 网关、模型、默认工作区、远程连接等主配置 | 网关起不来、连错地址、认证失败 |
| 网关启动脚本 | `C:\Users\<你>\.openclaw\gateway.cmd` | 计划任务自动模式调用入口 | 重启后任务触发但服务未运行 |
| 工作区目录 | `C:\Users\<你>\.openclaw\workspace\` | 放任务上下文与业务文件 | 助手“找不到资料”或风格失忆 |
| 人格文件 | `<workspace>\SOUL.md` | 定义语气、边界、主动策略 | 回答风格漂移、越界执行 |
| 用户画像 | `<workspace>\USER.md` | 定义你的目标与偏好 | 助手不懂你的工作习惯 |
| 执行规则 | `<workspace>\AGENTS.md` | 定义执行流程、风险处理、协作规范 | 输出格式不稳定、排障路径混乱 |
| 心跳规则 | `<workspace>\HEARTBEAT.md` | 定义心跳巡检任务 | 心跳触发但不做你想要的事 |
| 会话存储 | `C:\Users\<你>\.openclaw\agents\main\sessions\sessions.json` | 会话路由和最近会话元数据 | 会话上下文断裂 |
| 认证配置 | `C:\Users\<你>\.openclaw\agents\main\agent\auth-profiles.json` | 渠道和模型认证档案 | 渠道登录后不可用或模型不可调 |
| 凭据目录 | `C:\Users\<你>\.openclaw\credentials\` | 凭据存放目录 | 认证读取失败、安全风险升高 |

### 5.4 最小可用配置示例（小白可理解）

```json
{
  "gateway": {
    "mode": "local",
    "bind": "loopback",
    "port": 18789
  },
  "agents": {
    "defaults": {
      "workspace": "C:\\Users\\HN246\\.openclaw\\workspace"
    }
  }
}
```

解释：

1. `mode=local`：本机启动网关。
2. `bind=loopback`：只允许本机连接，安全性更高。
3. `port=18789`：默认端口，变更后要同步你的访问地址。
4. `workspace`：你的资料和规则文件都在这里。

---

## 6. 渠道、配对、设备命令（Day4 关键）

### 6.1 渠道管理：`channels ...`

```powershell
openclaw-cn.cmd channels list --json
openclaw-cn.cmd channels status --probe --json
openclaw-cn.cmd channels add --channel telegram --token <token>
openclaw-cn.cmd channels login --channel telegram --verbose
```

你机器实测（节选）：

```json
{
  "chat": { "feishu": ["default"] }
}
```

### 6.2 配对管理：`pairing ...`

```powershell
openclaw-cn.cmd pairing list --channel telegram
openclaw-cn.cmd pairing approve telegram <配对码>
```

参数说明（help 实测）：

1. `pairing list [channel]` 可直接带渠道参数。
2. `pairing approve <codeOrChannel> [code]` 支持两种参数形式。

### 6.3 设备管理：`devices ...`

```powershell
openclaw-cn.cmd devices list --json
openclaw-cn.cmd devices approve <requestId> --json
openclaw-cn.cmd devices reject <requestId> --json
openclaw-cn.cmd devices rotate <deviceId> --role manager
openclaw-cn.cmd devices revoke <deviceId> --role manager
```

---

## 7. Skills 命令（Day5 核心）

```powershell
openclaw-cn.cmd skills list
openclaw-cn.cmd skills list --eligible
openclaw-cn.cmd skills info 天气查询
openclaw-cn.cmd skills check --json
```

你机器实测：

```json
"summary": {
  "total": 51,
  "eligible": 51,
  "missingRequirements": 0
}
```

加载优先级（官方）：

1. `<workspace>/skills`
2. `~/.openclaw/skills`
3. bundled skills

命令作用速查：

| 命令 | 作用 | 成功判据 |
|---|---|---|
| `openclaw-cn.cmd skills list` | 列出全部技能（含不可用） | 有技能清单输出 |
| `openclaw-cn.cmd skills list --eligible` | 仅显示当前可用技能 | 列表非空或符合预期 |
| `openclaw-cn.cmd skills info <name>` | 看某个技能详情与要求 | 返回该技能说明 |
| `openclaw-cn.cmd skills check --json` | 校验缺失依赖与可用数量 | `missingRequirements=0` 或给出缺失项 |

---

## 8. 主动机制命令：Heartbeat + Cron（Day6 核心）

### 8.1 Heartbeat

```powershell
openclaw-cn.cmd system heartbeat last
openclaw-cn.cmd system heartbeat enable
openclaw-cn.cmd system heartbeat disable
```

你机器实测健康输出：`heartbeatSeconds=1800`（30 分钟）。

Heartbeat 命令作用：

| 命令 | 作用 | 成功判据 |
|---|---|---|
| `openclaw-cn.cmd system heartbeat last` | 查看最近一次心跳事件 | 返回最近心跳记录 |
| `openclaw-cn.cmd system heartbeat enable` | 启用心跳机制 | 命令返回成功，后续健康数据可见 |
| `openclaw-cn.cmd system heartbeat disable` | 停用心跳机制 | 命令返回成功，心跳不再触发 |

### 8.2 Cron 基础命令

```powershell
openclaw-cn.cmd cron status --json
openclaw-cn.cmd cron list --all --json
openclaw-cn.cmd cron add --name "晨间简报" --cron "0 8 * * *" --tz "Asia/Shanghai" --system-event "生成今日简报"
openclaw-cn.cmd cron run <jobId> --force
openclaw-cn.cmd cron edit <jobId> --cron "30 8 * * *"
openclaw-cn.cmd cron rm <jobId>
```

常见失败（网关未运行）：

```text
Error: gateway closed (1006 abnormal closure ...)
```

修复：先 `gateway run` 或 `gateway start` 再操作 cron。

Cron 命令作用：

| 命令 | 作用 | 成功判据 |
|---|---|---|
| `openclaw-cn.cmd cron status --json` | 查看调度器状态 | 返回状态 JSON |
| `openclaw-cn.cmd cron list --all --json` | 查看全部任务（含禁用） | 返回任务数组 |
| `openclaw-cn.cmd cron add ...` | 新建定时任务 | 返回任务 id |
| `openclaw-cn.cmd cron run <jobId> --force` | 立即执行任务用于调试 | 返回执行结果 |
| `openclaw-cn.cmd cron edit <jobId> ...` | 修改任务参数 | 返回更新后的任务 |
| `openclaw-cn.cmd cron rm <jobId>` | 删除任务 | 任务不再出现在 list 中 |

---

## 9. 节点与更新命令（Day7 核心）

### 9.1 Nodes

```powershell
openclaw-cn.cmd nodes status --json
openclaw-cn.cmd nodes list
openclaw-cn.cmd nodes pending
openclaw-cn.cmd nodes approve <requestId>
```

### 9.2 Update

```powershell
openclaw-cn.cmd update status
openclaw-cn.cmd update
openclaw-cn.cmd update --channel stable --yes
openclaw-cn.cmd update wizard
```

命令作用速查：

| 命令 | 作用 | 成功判据 |
|---|---|---|
| `openclaw-cn.cmd nodes status --json` | 看已知节点状态与能力 | 返回节点列表/状态 |
| `openclaw-cn.cmd nodes list` | 列出待配对与已配对节点 | 有节点清单输出 |
| `openclaw-cn.cmd nodes pending` | 查看待批准请求 | 返回 pending 列表 |
| `openclaw-cn.cmd nodes approve <id>` | 批准节点接入 | 请求从 pending 消失 |
| `openclaw-cn.cmd update status` | 看当前版本与更新通道 | 返回当前通道和版本状态 |
| `openclaw-cn.cmd update` | 执行更新 | 更新步骤执行完成 |
| `openclaw-cn.cmd update --channel stable --yes` | 切换/锁定稳定通道并无交互更新 | 返回 channel=stable |
| `openclaw-cn.cmd update wizard` | 交互式更新 | 向导完成并给出结果 |

---

## 10. 常见错误串 -> 修复动作（最常用）

### 10.1 `gateway closed (1006 abnormal closure ...)`

- 含义：CLI 连不上网关。
- 先做：

```powershell
openclaw-cn.cmd gateway status --json
openclaw-cn.cmd gateway run
```

### 10.2 `connect ECONNREFUSED 127.0.0.1:18789`

- 含义：目标端口无监听。
- 先做：

```powershell
netstat -ano | findstr :18789
openclaw-cn.cmd gateway run
```

### 10.3 `service loaded but rpc false`

- 含义：任务在，服务不可用。
- 先做：

```powershell
openclaw-cn.cmd gateway stop
openclaw-cn.cmd gateway uninstall
openclaw-cn.cmd gateway install --force
openclaw-cn.cmd gateway start
openclaw-cn.cmd gateway status --json
```

### 10.4 `LastTaskResult = 1`（Openclaw Gateway）

- 含义：计划任务触发但执行失败。
- 重点检查：

```powershell
Get-ScheduledTaskInfo -TaskName 'Openclaw Gateway' | Format-List LastRunTime,LastTaskResult
Test-Path C:\Users\HN246\.openclaw\gateway.cmd
```

如果 `gateway.cmd` 缺失，优先按第二篇的“重建服务入口”流程处理。

---

## 11. 与 OpenClaw101 Day1~Day7 的对应关系

| 课程天数 | 在本篇看哪一章 |
|---|---|
| Day1 | 第 1、11 章（认知映射与索引） |
| Day2 | 第 2、3、4、5 章 |
| Day3 | 第 5 章（工作区与配置） |
| Day4 | 第 6 章 |
| Day5 | 第 7 章 |
| Day6 | 第 8 章 |
| Day7 | 第 9、10 章 |

---

## 12. 参考资料

### OpenClaw101

1. <https://openclaw101.dev/zh>
2. <https://openclaw101.dev/zh/day/1>
3. <https://openclaw101.dev/zh/day/2>
4. <https://openclaw101.dev/zh/day/3>
5. <https://openclaw101.dev/zh/day/4>
6. <https://openclaw101.dev/zh/day/5>
7. <https://openclaw101.dev/zh/day/6>
8. <https://openclaw101.dev/zh/day/7>

### 官方文档

1. <https://docs.openclaw.ai/cli>
2. <https://docs.openclaw.ai/automation/cron-jobs>
3. <https://docs.openclaw.ai/tools/skills>
4. <https://docs.openclaw.ai/channels/pairing>
5. <https://docs.openclaw.ai/cli/channels>
6. <https://docs.openclaw.ai/cli/nodes>
7. <https://docs.openclaw.ai/gateway/security>
8. <https://docs.openclaw.ai/gateway/configuration-reference>

### 中文站（你指定）

1. <https://clawd.org.cn/start/getting-started.html>
2. <https://clawd.org.cn/start/wizard.html>
3. <https://clawd.org.cn/install/updating.html>
4. <https://clawd.org.cn/start/setup.html>
5. <https://clawd.org.cn/start/pairing.html>
6. <https://clawd.org.cn/start/clawd.html>
