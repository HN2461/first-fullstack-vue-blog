---
title: "第 01 篇：OpenClaw 本地部署实战（从安装到龙虾内容生产）"
slug: "ai-agent-openclaw-4d55dcf1"
summary: "面向第一次接触 OpenClaw-CN 的读者，按安装、首次启动、健康检查与首轮内容产出的顺序整理本地部署实战，帮助先把环境跑通。"
category: "龙虾"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "Agent框架层"
  - "龙虾"
tags:
  - "OpenClaw"
  - "龙虾"
  - "本地部署"
  - "Agent框架"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cac02e"
originalSlug: "ai-agent-openclaw-4d55dcf1"
originalStatus: "published"
publishedAt: "2026-05-24T13:49:15.050Z"
updatedAt: "2026-07-31T11:16:25.520Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 01 篇：OpenClaw 本地部署实战（从安装到龙虾内容生产）

> 参考视频：<https://www.douyin.com/video/7609705104823880995>（原短链：<https://v.douyin.com/DqNq2PwNB0g/>）  
> 参考文档：<https://clawd.org.cn/start/getting-started.html>、<https://clawd.org.cn/start/wizard.html>、<https://clawd.org.cn/start/setup.html>、<https://clawd.org.cn/start/pairing.html>、<https://clawd.org.cn/start/clawd.html>、<https://clawd.org.cn/install/updating.html>  
> 校验时间：2026-03-08  
> 本篇定位：只讲“安装 + 首次跑通 + 首次产出”，不讲深度排障（排障看第二篇）。

---

## 0. 先说清本篇边界

你读完本篇要达到 3 个结果：

1. `openclaw-cn.cmd` 能在本机执行。
2. 网关能正常启动，`status/health` 能返回。
3. 你可以开始第一版“龙虾内容”工作流。

---

## 1. 安装前检查（3 条命令）

```powershell
node -v
npm -v
$PSVersionTable.PSVersion
```

建议基线：

1. Node.js 22+
2. PowerShell 5.1+

---

## 2. 安装 OpenClaw-CN（Windows）

官方中文站给出的安装方式：

```powershell
iwr -useb https://clawd.org.cn/install.ps1 | iex
```

安装后先验证命令：

```powershell
openclaw-cn.cmd --version
openclaw-cn.cmd --help
```

如果提示找不到命令，先用完整路径：

```powershell
E:\DevEnv\nodejs\node_global\openclaw-cn.cmd --version
```

---

## 3. 首次初始化（推荐向导）

```powershell
openclaw-cn.cmd onboard
```

你想一次性脚本化时再用：

```powershell
openclaw-cn.cmd onboard --non-interactive --accept-risk --mode local --install-daemon
```

说明：

1. 第一次建议交互式，避免参数填错后难定位。
2. `--non-interactive` 必须搭配 `--accept-risk`。

### 3.1 首次需要认识的配置文件（小白版）

| 文件/目录 | 默认路径（Windows） | 作用 | 什么时候会用到 |
|---|---|---|---|
| 主配置文件 | `C:\Users\<你>\.openclaw\openclaw.json` | 保存网关端口、绑定方式、模型与工作区等核心配置 | 改端口、改 bind、改默认工作区时 |
| 默认工作区 | `C:\Users\<你>\.openclaw\workspace\` | 放你的任务上下文和资料文件 | 做“龙虾内容”时 |
| 人格文件 | `<workspace>\SOUL.md` | 定义助手语气和行为边界 | 觉得回复风格不对时 |
| 用户画像 | `<workspace>\USER.md` | 记录你的目标、偏好、约束 | 助手不懂你习惯时 |
| 执行规范 | `<workspace>\AGENTS.md` | 规定执行流程和风险边界 | 助手执行不稳定时 |
| 服务启动脚本 | `C:\Users\<你>\.openclaw\gateway.cmd` | Windows 自动模式下由计划任务调用 | 重启后起不来时（详见第二篇） |

---

## 4. 首次启动与健康检查（最小闭环）

先前台启动（最稳）：

```powershell
openclaw-cn.cmd gateway run
```

新开终端检查：

```powershell
openclaw-cn.cmd gateway status --json
openclaw-cn.cmd status --all
openclaw-cn.cmd health --json
```

常见成功信号：

1. `gateway status --json` 里 `rpc.ok=true`
2. `health --json` 里 `ok=true`
3. 控制台可打开：`http://127.0.0.1:18789/`

你也可以直接：

```powershell
openclaw-cn.cmd dashboard
```

---

## 5. 渠道与配对（只做最小可用）

先查看渠道现状：

```powershell
openclaw-cn.cmd channels list --json
openclaw-cn.cmd channels status --probe --json
```

需要登录某渠道时（示例）：

```powershell
openclaw-cn.cmd channels login --channel telegram --verbose
```

查看待批准配对：

```powershell
openclaw-cn.cmd pairing list --channel telegram
```

批准配对码：

```powershell
openclaw-cn.cmd pairing approve telegram <配对码>
```

---

## 6. 开始你的“龙虾内容”最小流程

先建工作区文件：

```text
龙虾内容工作区/
  00_选题池.md
  01_资料库.md
  02_文章模板.md
  03_发布记录.md
```

然后给助手一条固定任务：

```text
请基于 01_资料库.md 与 02_文章模板.md，生成一篇“龙虾”主题文章：
- 先给 3 个标题（含检索关键词）
- 开头 120 字内讲清读者收益
- 正文 4 个小节，每节最后给可执行建议
- 末尾附参考链接与事实核验点
```

---

## 7. 本篇后的阅读顺序

1. 第二篇：解决“重启后没成功”与稳定运行
2. 第三篇：把助手从“会回答”变成“懂你”
3. 第五篇：按场景查命令和参数

---

## 8. 本篇参考资料

- <https://clawd.org.cn/start/getting-started.html>
- <https://clawd.org.cn/start/wizard.html>
- <https://clawd.org.cn/start/setup.html>
- <https://clawd.org.cn/start/pairing.html>
- <https://clawd.org.cn/start/clawd.html>
- <https://clawd.org.cn/install/updating.html>
- <https://www.douyin.com/video/7609705104823880995>
