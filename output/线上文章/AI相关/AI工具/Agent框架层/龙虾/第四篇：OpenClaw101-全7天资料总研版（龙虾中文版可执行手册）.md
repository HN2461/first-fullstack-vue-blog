---
title: "第四篇：OpenClaw101 全7天资料总研版（龙虾中文版可执行手册）"
slug: "ai-agent-openclaw101-7-7f46689a"
summary: "按 OpenClaw101 Day1 到 Day7 的顺序整理成可执行路线图，帮助把零散课程资料转成每天可落地的学习与验收清单。"
category: "龙虾"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "Agent框架层"
  - "龙虾"
tags:
  - "OpenClaw101"
  - "龙虾"
  - "学习路线"
  - "Agent框架"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291d8a2b1c68f2cac040"
originalSlug: "ai-agent-openclaw101-7-7f46689a"
originalStatus: "published"
publishedAt: "2026-05-24T13:49:15.057Z"
updatedAt: "2026-06-13T10:28:27.182Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 第四篇：OpenClaw101 全7天资料总研版（龙虾中文版可执行手册）

> 研究范围：OpenClaw101 Day1~Day7 全部页面  
> 本篇定位：这是“7天执行路线图”，强调每天做什么、验收什么。  
> 不重复内容：命令参数细节请查第五篇；重启排障请查第二篇。

---

## 0. 怎么用这篇

如果你希望从“会用一点”升级到“可持续运行”，按这篇走：

1. 每天只做本日任务，不跳步。
2. 当天必须达到验收标准再进入下一天。
3. 遇到命令细节问题，直接跳第五篇查询。

---

## 1. Day1：认知重置（目标先对齐）

### 今日目标

1. 明确你要让助手接管的任务列表（3~5 项）。
2. 写下“成功标准”：节省时间、减少遗漏、提升一致性。

### 今日动作

1. 列出可重复工作（选题、整理、草稿、复盘）。
2. 区分自动做与人工做的边界。

### 验收标准

你能用一句话解释：  
“我为什么要用 OpenClaw，而不是只用聊天窗口。”

---

## 2. Day2：安装上线（跑通最小闭环）

### 今日目标

1. 本机可执行 `openclaw-cn.cmd`
2. 网关可达，状态可查

### 必做命令

```powershell
openclaw-cn.cmd --version
openclaw-cn.cmd onboard
openclaw-cn.cmd gateway run
openclaw-cn.cmd gateway status --json
openclaw-cn.cmd health --json
```

### 验收标准

1. `gateway status --json` 中 `rpc.ok=true`
2. `health --json` 中 `ok=true`
3. 控制台 `http://127.0.0.1:18789/` 可访问

---

## 3. Day3：灵魂与用户建模（SOUL/USER/AGENTS）

### 今日目标

1. 助手风格稳定，不再随机飘。
2. 输出符合你的写作和执行偏好。

### 必做动作

1. 写 `SOUL.md`：语气、风格、边界。
2. 写 `USER.md`：你的目标、习惯、约束。
3. 补 `AGENTS.md`：执行规范、失败处理流程。

### 验收标准

同类任务连续执行两次，风格和结构保持一致。

---

## 4. Day4：接入渠道和外部能力

### 今日目标

1. 至少一个渠道可登录并可收发。
2. 安全策略开始生效。

### 必做命令

```powershell
openclaw-cn.cmd configure --section channels --section web --section gateway
openclaw-cn.cmd channels list --json
openclaw-cn.cmd channels login --channel telegram --verbose
openclaw-cn.cmd pairing list --channel telegram
openclaw-cn.cmd security audit --deep
```

### 验收标准

1. 渠道状态不是“未配置”。
2. 配对流程可走通。
3. 安全审计结果可解释（至少知道有哪些告警）。

---

## 5. Day5：Skills 扩展能力

### 今日目标

1. 识别可用技能。
2. 让至少 1 个技能在真实任务中被调用。

### 必做命令

```powershell
openclaw-cn.cmd skills list --eligible
openclaw-cn.cmd skills info 天气查询
openclaw-cn.cmd skills check --json
```

### 验收标准

1. `skills check` 无关键依赖缺失。
2. 你能说清楚某个技能在你的工作流里解决什么问题。

---

## 6. Day6：主动工作（Heartbeat + Cron + Memory）

### 今日目标

1. 助手开始“定时主动工作”。
2. 你有可复用的每日自动任务。

### 必做命令

```powershell
openclaw-cn.cmd system heartbeat enable
openclaw-cn.cmd cron add --name "晨间简报" --cron "0 8 * * *" --tz "Asia/Shanghai" --system-event "生成今日简报"
openclaw-cn.cmd cron list --all --json
openclaw-cn.cmd cron run <jobId> --force
```

### 验收标准

1. 任务存在并可手动触发。
2. 触发结果可追踪。
3. 你明确“心跳做巡检，Cron 做定点”。

---

## 7. Day7：进阶运维（节点、安全、更新）

### 今日目标

1. 系统可长期维护和升级。
2. 多设备协作可控。

### 必做命令

```powershell
openclaw-cn.cmd nodes status --json
openclaw-cn.cmd devices list
openclaw-cn.cmd security audit --json
openclaw-cn.cmd update status
```

### 验收标准

1. 你知道当前节点/设备权限边界。
2. 你有固定的安全巡检频率。
3. 你知道升级前后要验证哪些项。

---

## 8. 7 天结束后，你应该具备的能力

1. 能安装与启动，并判断系统是否健康。
2. 能通过规则文件把助手调到稳定风格。
3. 能接渠道、用技能、跑自动化任务。
4. 出问题时能快速定位到“配置层/服务层/任务层”。

---

## 9. 与其它文章的配合关系

1. 第一篇：安装入门
2. 第二篇：重启失败和运行稳定性
3. 第三篇：Day1 认知与人格建模
4. 第五篇：命令字典和参数级说明

---

## 10. 参考资料（本篇使用）

### OpenClaw101

- <https://openclaw101.dev/zh>
- <https://openclaw101.dev/zh/day/1>
- <https://openclaw101.dev/zh/day/2>
- <https://openclaw101.dev/zh/day/3>
- <https://openclaw101.dev/zh/day/4>
- <https://openclaw101.dev/zh/day/5>
- <https://openclaw101.dev/zh/day/6>
- <https://openclaw101.dev/zh/day/7>

### 官方文档

- <https://docs.openclaw.ai/cli>
- <https://docs.openclaw.ai/automation/cron-jobs>
- <https://docs.openclaw.ai/gateway/heartbeat>
- <https://docs.openclaw.ai/tools/skills>
- <https://docs.openclaw.ai/cli/nodes>
- <https://docs.openclaw.ai/gateway/security>
