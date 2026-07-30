---
title: "第三篇：OpenClaw101 Day1 知识全景与命令配置实战（认知与灵魂篇）"
slug: "ai-agent-openclaw101day1-2082ef14-revision-20260730"
summary: "聚焦 OpenClaw101 Day1 的认知层与人格层配置，解释 SOUL、USER、AGENTS 等文件为什么会长期影响助手表现，适合作为龙虾体系的心智模型篇。"
category: "龙虾"
tags:
  - "OpenClaw101"
  - "龙虾"
  - "AGENTS"
  - "SOUL"
  - "Agent框架"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291d8a2b1c68f2cac034"
originalSlug: "ai-agent-openclaw101day1-2082ef14"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 第三篇：OpenClaw101 Day1 知识全景与命令配置实战（认知与灵魂篇）

> 适用版本：`openclaw-cn.cmd 0.1.7`（Windows 实测）  
> 对应课程：OpenClaw101 Day1 + Day3 核心思想  
> 本篇定位：只讲“为什么这样用”和“如何让助手懂你”，不讲网关重启排障。

---

## 0. 阅读定位

你读完本篇应该获得的是“方向感”，不是“背命令”：

1. 理解 OpenClaw 为什么不是聊天机器人。
2. 理解 SOUL/USER/AGENTS 为什么决定长期效果。
3. 建立你自己的“龙虾内容助手人格”。

如果你现在卡在“启动失败、重启后失效”，先看第二篇。  
如果你现在要查某个命令参数，直接看第五篇。

---

## 1. Day1 最核心的认知：助手系统，不是对话框

Day1 的重点可以压缩成四句话：

1. 聊天机器人是被动响应，助手系统是主动工作。
2. 真正价值不在“答得好”，在“能持续执行、可恢复、可审计”。
3. 同一模型放进不同系统里，效果差异主要来自流程与规则。
4. 你越早开始沉淀规则和记忆，助手越快变成“你的工作搭子”。

---

## 2. 用你的场景翻译 Day1（龙虾内容方向）

把“龙虾内容生产”拆成 3 类任务：

1. 稳定重复任务  
例如：每日选题、资料整理、标题改写、发布复盘。
2. 半自动任务  
例如：根据资料出初稿，人工补观点与案例。
3. 高价值人工任务  
例如：内容策略、选题判断、品牌表达。

OpenClaw 应该优先承接第 1、2 类任务。

---

## 3. Day3 灵魂三件套：SOUL / USER / AGENTS

这是从“会回答”到“懂你”的分水岭。

### 3.1 SOUL.md（它是谁）

建议模板：

```markdown
# SOUL.md
- 角色：你的中文内容协作助手
- 语气：专业、直接、不给空话
- 输出习惯：先结论后步骤，命令可复制
- 主动性：工作时间主动提醒，深夜只报紧急事项
- 红线：未经确认不外发消息，不执行破坏性命令
```

### 3.2 USER.md（它服务谁）

建议模板：

```markdown
# USER.md
- 你的工作目标：持续产出龙虾相关文章
- 你的偏好：中文、结构化、可执行
- 你的约束：先给可逆方案，再给高风险方案
- 当前项目：个人技术博客、OpenClaw 系列笔记
```

### 3.3 AGENTS.md（它怎么工作）

建议你写清 4 件事：

1. 操作前先检查什么（例如先跑状态命令）。
2. 失败后先给什么（例如可逆修复路径）。
3. 什么时候必须停下来问你（例如会影响数据安全的动作）。
4. 输出格式（例如先结论后命令，引用路径要完整）。

---

## 4. 最小命令只保留 4 条（本篇只讲必要）

```powershell
# 看版本，确认命令基线
openclaw-cn.cmd --version

# 查看工作区路径
openclaw-cn.cmd config get agents.defaults.workspace

# 设置工作区路径（示例）
openclaw-cn.cmd config set agents.defaults.workspace C:\Users\HN246\.openclaw\workspace

# 打开配置向导（按 section 微调）
openclaw-cn.cmd configure --section workspace --section model
```

说明：  
本篇不展开网关生命周期、任务调度、渠道排障，避免和第二/第五篇重复。

---

## 5. 把认知变成执行：一周迭代法（小白可照抄）

第 1 周建议你只做这 3 件事：

1. 每天记录一次“助手哪里做得不对”。
2. 当天把规则补进 SOUL/USER/AGENTS 对应文件。
3. 第二天用同类型任务复测。

这套循环会让助手稳定变“像你”，而不是每次从头调教。

---

## 6. 常见误区（你现在最容易踩的）

1. 误区：只调模型，不写规则  
后果：短期看着聪明，长期不稳定。
2. 误区：规则写成口号  
后果：模型无法执行，输出仍漂移。
3. 误区：把排障和认知混在一篇里  
后果：读起来杂，真正出问题时找不到关键步骤。

---

## 7. 读完本篇后，下一篇看什么

1. 想系统跑 OpenClaw101 Day2~Day7：看第四篇
2. 想直接查命令和参数：看第五篇
3. 想解决重启失败：回第二篇

---

## 8. 参考资料

- OpenClaw101 Day1：<https://openclaw101.dev/zh/day/1>
- OpenClaw101 Day3：<https://openclaw101.dev/zh/day/3>
- OpenClaw101 总入口：<https://openclaw101.dev/zh>
- OpenClaw CLI：<https://docs.openclaw.ai/cli>
- OpenClaw 中文 Setup：<https://clawd.org.cn/start/setup.html>
