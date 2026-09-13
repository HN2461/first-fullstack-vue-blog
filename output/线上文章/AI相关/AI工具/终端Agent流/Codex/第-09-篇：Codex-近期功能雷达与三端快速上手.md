---
title: "第 09 篇：Codex 近期功能雷达与三端快速上手"
slug: "ai-agent-codex-current-feature-radar-20260913"
summary: "面向开发者持续跟进 Codex 的功能雷达，按桌面 App、VS Code/兼容 IDE、CLI 与 Cloud 拆解近期新增能力、稳定性边界和最小练习路径。"
category: "Codex"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "Codex"
tags:
  - "Codex"
  - "桌面 App"
  - "VS Code"
  - "CLI"
  - "Cloud"
  - "功能追踪"
status: "published"
sortOrder: 90
cover: ""
originalId: "6aa6a8afeea462382bcdf5a3"
originalSlug: "ai-agent-codex-current-feature-radar-20260913"
originalStatus: "published"
publishedAt: "2026-09-13T13:44:41.251Z"
updatedAt: "2026-09-13T13:44:41.256Z"
exportedAt: "2026-09-13T13:45:04.756Z"
---
# 第 09 篇：Codex 近期功能雷达与三端快速上手

> 更新时间：2026-09-13。
> 复核基线：本机 `codex-cli 0.154.0`、Windows Store 包 `OpenAI.Codex 26.908.4834.0`；功能是否可见仍取决于账号、地区、工作区策略、客户端版本和灰度 rollout。
> 这篇把“最近推出了什么、我应该先学什么”单独维护，不替代第 03 篇配置手册、第 06 篇命令速查和第 08 篇 Windows App 实战。

[[toc]]

## 1. 先记住四条主线

Codex 现在不是简单的“CLI + 一个编辑器插件”。开发者需要同时理解四条主线：

| 主线 | 最适合做什么 | 当前新增重点 |
|---|---|---|
| 桌面 App | 多项目、长任务、可视化审查、浏览器和桌面操作 | 多文件夹、Worktree、Appshots、WebMCP、事件触发任务、Remote、Agent 导入 |
| VS Code / 兼容 IDE | 贴着代码做局部修改和审查 | editor context、`/ide-context`、Local/Cloud/Worktree、side chat、queue/steer、IDE 直接委派 Cloud |
| CLI | 透明排错、脚本、CI、批处理和精确配置 | `--worktree`、`--approve-for-me`、`codex agents`、`codex queue`、`codex app-server` |
| Codex Cloud | 隔离环境中并行跑长任务 | GitHub、GitLab Beta、Linear、Slack 入口，环境复现、并行尝试和结果回本地审查 |

不要把这四条主线理解成四个互不相干的产品。它们共享部分模型、规则和配置心智，但线程、工作目录、登录态、连接器和权限边界仍可能不同。

## 2. VS Code 与兼容 IDE：新增点集中在“上下文和委派”

官方 IDE 扩展目前覆盖 VS Code、Cursor、Windsurf、VS Code Insiders，Xcode 和 JetBrains 也有各自的 Codex 入口。以下内容以 VS Code/兼容编辑器为主。

### 2.1 自动 IDE 上下文可开关

编辑器可以把当前打开文件、选中代码和最近聊天直接带进 prompt。它解决的是“少重复解释当前代码在哪里”，不是让 Codex 自动理解整个仓库。

在 composer 中使用：

```text
/ide-context
```

建议：

1. 看单个函数或局部 bug 时开启，减少手工粘贴。
2. 处理跨模块任务时，仍然明确写出范围、约束和验收命令。
3. 处理敏感文件时先检查当前上下文里到底附带了哪些内容。

### 2.2 Local、Cloud、Worktree 可以在 IDE 内切换

当前 IDE 里值得熟练的 slash commands 是：

| 命令 | 用途 | 适合场景 |
|---|---|---|
| `/local` | 回到本地工作区执行 | 小改动、需要本机服务或本地依赖 |
| `/cloud` | 把当前对话委派到 Cloud | 长任务、干净环境、想释放本机 |
| `/cloud-environment` | 选择 Cloud environment | 仓库需要固定依赖、工具、变量和 secrets |
| `/worktree` | 用新的 Git worktree 运行 | 并行任务、避免污染当前工作树 |
| `/side` | 开临时 side chat | 保持主任务不中断，同时问一个独立问题 |

IDE 的 Cloud delegation 不是“把终端命令发到另一台机器”这么简单。它需要先配置 Cloud environment，任务完成后再回到 IDE 检查摘要、diff 和后续修改。默认流程应是：

```text
本地定位问题 -> 选择 Cloud environment -> 委派长任务 -> 回 IDE 看摘要和 diff -> 本地测试/微调 -> 提交
```

### 2.3 Queue、Steer 和 side chat 是三种不同的跟进方式

扩展设置中的 `chatgpt.followUpQueueMode` 控制后续消息是：

- `queue`：当前运行结束后再处理，适合追加待办。
- `steer`：尝试影响当前运行，适合立即纠偏。

当前 composer 还支持 `Cmd/Ctrl+Shift+Enter` 临时反转 queue/steer 行为。不要把 steer 当成强制中断；长任务仍可能先完成当前工具调用。

任务不应被打断时，用 `/side` 开独立问题。需要把新约束加入下一轮时，用 queue。要纠正当前方向时，才用 steer。

### 2.4 IDE 设置要分两层

Codex agent 设置仍来自共享的 `config.toml`；扩展行为设置使用编辑器自己的 `chatgpt.*` 键。常用项包括：

| 设置 | 作用 |
|---|---|
| `chatgpt.commentCodeLensEnabled` | 在 TODO 注释上显示 CodeLens |
| `chatgpt.openOnStartup` | 扩展启动后是否聚焦 Codex 侧栏 |
| `chatgpt.followUpQueueMode` | queue 或 steer |
| `chatgpt.composerEnterBehavior` | Enter 与 Cmd/Ctrl+Enter 的发送行为 |
| `chatgpt.reviewDelivery` | `/review` 内联显示或独立 review chat |
| `chatgpt.runCodexInWindowsSubsystemForLinux` | Windows 下让 agent 在 WSL2 中运行，修改后需要 reload |

`chatgpt.*` 不要写进 `config.toml`。共享模型、审批、沙箱、MCP 和 personalization 才写入 Codex 配置层。

### 2.5 IDE 里最快的练习

1. 打开一个小仓库，选中一个函数，使用 editor context 让 Codex 解释并补一个 focused test。
2. 用 `/review` 查看当前改动，设置 `chatgpt.reviewDelivery = inline`，熟悉“摘要、diff、follow-up”闭环。
3. 用 `/worktree` 并行做一个不影响主分支的重构，再清理 worktree。
4. 把一个预计超过十分钟的任务用 `/cloud` 委派，回 IDE 后只做 review、测试和收尾。
5. 在长任务运行中分别试一次 queue、steer 和 `/side`，记录它们对主线程的影响。

## 3. 桌面 App：从“项目壳”变成工作台

### 3.1 多文件夹与 primary folder

一个项目可以挂载多个相关文件夹，但必须指定 primary folder：

1. 新 chat 的主要工作上下文从 primary folder 建立。
2. Git、`AGENTS.md`、skills 和 `.codex` 自动发现以 primary folder 为根。
3. secondary folders 可以搜索、读取和编辑，但不会自动变成同一个 Git 仓库。

前后端是两个仓库时，先分别看 Git 状态，不要因为它们出现在同一个项目里就假设可以一次提交。

### 3.2 Appshots：把前台窗口连同可用文本交给 Codex

Windows 版近期加入 Appshots。它会把前台应用窗口的截图和可用文本作为上下文，适合定位桌面 UI、布局和错误提示问题。

安全边界：

1. Appshots 不是完整桌面控制，也不会替代 Computer Use。
2. 截图前确认窗口没有密码、token、私信或生产数据。
3. 先用“解释当前界面问题”这类只读任务验证输入，再考虑让 Codex 修改代码。

### 3.3 Site tools（WebMCP）与 Browser 不是一回事

Site tools 允许内置 Browser 使用网站提供的结构化工具。它比单纯读取网页文本更适合查询、筛选和生成草稿，但要求网站已经提供 WebMCP 工具。

当前官方边界：

1. 2026-08-25 起进入桌面 App 功能主线。
2. 需要支持的模型和最新桌面版本；Luna、Enterprise 和 Edu 工作区可能不可用。
3. 外部网站的授权、确认和数据规则仍然生效。
4. 网站没有 WebMCP 时，仍使用普通 Browser、连接器或 MCP，不要等待 Site tools 自动出现。

### 3.4 Scheduled tasks 开始支持事件触发

除时间计划外，符合条件的桌面/网页工作区可以由 Gmail、Slack 和 GitHub 事件触发：

- Gmail：按发件人或主题筛选。
- Slack：监听指定频道。
- GitHub：响应 PR review、comment、commit update 或 merge 等活动。

事件触发任务不能再叠加时间计划。建议第一条任务只生成报告或草稿，并保留人工审批；不要直接绑定发布、删除、改权限和生产数据库操作。

### 3.5 Plugins、Skills、MCP、Connector 的边界仍要分开

近期插件目录已经统一到 ChatGPT 与 Codex 支持的目录，但四类东西职责不同：

| 类型 | 主要职责 |
|---|---|
| Plugin | 能力包，可包含 skills、MCP servers、browser extensions、hooks |
| Skill | 可复用的工作步骤和约束 |
| MCP server | 结构化工具和外部数据连接 |
| Connector/App | 负责 GitHub、Slack、Drive 等外部账号授权 |

安装插件后新开 chat 或 CLI session，才能确保 bundled skills 完整加载。IDE 扩展当前不支持插件浏览器，不能把桌面 App/CLI 的 `/plugins` 经验直接套到 IDE。

### 3.6 Agent 导入与 Linux 桌面预览

2026-08-11 起，桌面 App 提供 Linux 预览，并支持从 Claude Code、Claude Cowork 和 Cursor 导入 instructions、settings、skills、plugins、projects 与近期工作。

迁移时按这个顺序：

1. 先导入一个非关键项目。
2. 检查生成/迁移后的 `AGENTS.md`、skills、插件来源和项目路径。
3. 重新确认 sandbox、approval、MCP 凭据和 shell 环境。
4. 最后才打开自动同步，避免旧 agent 配置覆盖当前 Codex 规则。

### 3.7 “脚手架”应该沉淀成 Skill、Plugin 和 Local environment

官方当前没有把“脚手架 App”作为一个独立 Codex 客户端。对开发者来说，真正可迁移的脚手架是三类项目资产：

| 资产 | 放什么 | 可在哪些入口复用 |
|---|---|---|
| Skill | `SKILL.md`、参考资料、可选脚本和模板 | 桌面 App、CLI、IDE extension |
| Plugin | 一个或多个 skills，以及可选 MCP server / UI | ChatGPT 与 Codex 的统一插件目录；CLI/桌面端按支持情况安装 |
| Local environment | Worktree setup scripts、Actions 和平台差异 | 仅桌面 App；配置保存在项目根 `.codex`，可随 Git 共享 |

适合的沉淀顺序是：

1. 先在项目 `.agents/skills` 中写一个单职责 Skill，验证触发描述和输出格式。
2. 需要给团队安装、绑定多个 Skill 或连接外部服务时，再用 `$plugin-creator` 生成插件脚手架，并检查 `.codex-plugin/plugin.json`。
3. 需要让每个 Worktree 自动安装依赖、构建或启动服务时，再在桌面 App 的 Local environment 中配置 setup scripts 和 Actions。

Skill 支持显式调用（CLI/IDE 中使用 `/skills` 或 `$skill-name`）和隐式调用；如果工作流有副作用，优先设置为显式调用。插件安装后要新开会话，Local environment 则要确认 primary folder 和项目根目录正确。

一个最小的项目级 Skill 目录可以是：

```text
.agents/
└── skills/
    └── verify-release/
        ├── SKILL.md
        ├── references/
        └── scripts/
```

不要把个人 `config.toml`、密钥、临时缓存和机器专属路径塞进脚手架。共享的是可审查的规则、脚本和环境动作；认证、权限和 secrets 应由每台机器或 Cloud environment 单独维护。

## 4. CLI 与 Cloud：近期新增的工程化入口

### 4.1 CLI 0.154.0 需要记住的入口

```powershell
codex --version
codex agents
codex queue --thread <SESSION> --message "继续完成测试并汇报失败原因"
codex --worktree
codex exec --json "扫描仓库并输出风险清单"
codex review --uncommitted
codex app-server --stdio
```

说明：

1. `codex agents` 查看共享本地 app-server 上的 agent sessions。
2. `codex queue` 给已有 session 排队发送消息，适合长任务追加上下文。
3. `--worktree` 直接从 CLI 创建管理型 Git worktree。
4. `--approve-for-me` 可将审批交给 automatic review，但必须先理解 workspace-write 的边界；不要把它等同于无沙箱运行。
5. `codex app-server` 当前仍是 experimental。它适合本地协议集成和调试，不应作为生产服务的稳定契约。
6. `codex mcp-server` 和独立 `codex-mcp-server` 已被移除；外部 MCP 仍通过 `codex mcp` 管理。

### 4.2 Codex Cloud 的新入口

当前 Cloud 可以从 Codex web、CLI、GitHub、GitLab、Linear 和 Slack 发起任务；每个项目需要 Cloud environment 来复现依赖、工具、环境变量和 secrets。

开发者最值得练的工作流是：

1. 用 GitHub/GitLab issue 或 PR/MR 启动一个低风险任务。
2. 在 Cloud environment 里固定依赖和 setup scripts。
3. 并行启动两种实现或让任务后台运行。
4. 回到本地/IDE 检查摘要、diff、测试结果。
5. 只把 review 通过的改动应用、提交或开 PR/MR。

GitLab 当前仍是 Beta；GitLab 省略折叠或超大 diff 时，Codex 可能无法完成 review。

## 5. 新功能的成熟度与风险矩阵

| 功能 | 成熟度/边界 | 默认策略 |
|---|---|---|
| Local、IDE context、Review、Worktree | 日常主线 | 先读、再改、最后 review |
| Cloud delegation、GitHub | 主线能力 | 用独立环境和低权限连接器 |
| GitLab Cloud | Beta | 先低风险仓库，人工检查 MR diff |
| Site tools/WebMCP | 依账号、模型、站点和工作区 | 先查询/草稿，敏感动作保留确认 |
| Scheduled event triggers | 依连接器和 rollout | 只生成报告或草稿，避免无人值守副作用 |
| Appshots、Computer Use | 依桌面授权和前台状态 | 敏感窗口不截图，Windows 保持前台可见 |
| App server、Remote-control CLI | experimental | 本地调试，不暴露未认证监听端口 |
| Agent import、Linux desktop | 预览/逐步 rollout | 在非关键项目验证迁移结果 |

## 6. 7 天快速熟练路线

1. **第 1 天：IDE context**。选中一个函数，完成“解释 -> 修改 -> 测试 -> inline review”。
2. **第 2 天：queue/steer/side**。在一个长任务里各试一次，观察主线程是否被打断。
3. **第 3 天：Worktree**。IDE 和 CLI 各创建一个隔离任务，练分支和清理。
4. **第 4 天：Cloud**。为一个仓库配置 environment，委派一次长任务并回本地审查。
5. **第 5 天：Browser/WebMCP/Appshots**。只做查询、提取和 UI 诊断，不做外部副作用。
6. **第 6 天：Scheduled event**。用测试 PR 或 Slack 频道触发“生成报告/草稿”。
7. **第 7 天：工程化 CLI**。跑通 `codex exec --json`、`codex review --uncommitted`、`codex agents` 和 `codex queue`。

每次练习记录四项：模型与 reasoning effort、approval/sandbox、上下文来源、验证命令。功能更新时只替换其中一项，排障会比重新学习整套产品快得多。

## 7. 每周如何追踪更新

每周固定做一次 15 分钟检查：

1. 看官方 Changelog 的当前月份和 Codex CLI 版本条目。
2. 在本机执行 `codex --version`、`codex --help`、`codex features list`。
3. 打开桌面 App 的 Help / What's New，记录 Windows Store 包版本。
4. 在 IDE 的 `/` 菜单检查 `/cloud`、`/worktree`、`/ide-context`、`/side`、`/goal` 和 `/review`。
5. 对新功能只做一个无副作用 smoke test，再决定是否写进项目默认工作流。

不要把截图、灰度菜单或第三方线路宣传当作稳定事实。文章里只记录已在官方文档/Changelog 中确认、且能说明入口和边界的功能。

## 8. 官方资料

- Codex 模型：<https://learn.chatgpt.com/docs/models?surface=cli>
- IDE 扩展：<https://learn.chatgpt.com/docs/codex/ide>
- IDE 命令：<https://learn.chatgpt.com/docs/developer-commands?surface=ide>
- IDE 设置：<https://learn.chatgpt.com/docs/developer-settings?surface=ide>
- Codex Cloud：<https://learn.chatgpt.com/docs/cloud>
- GitLab Beta：<https://learn.chatgpt.com/docs/third-party/gitlab>
- 桌面 App：<https://learn.chatgpt.com/docs/app>
- Windows App：<https://learn.chatgpt.com/docs/windows/windows-app>
- WebMCP / Site tools：<https://learn.chatgpt.com/docs/webmcp>
- Scheduled tasks：<https://learn.chatgpt.com/docs/automations>
- Plugins：<https://learn.chatgpt.com/docs/plugins?surface=cli>
- Build skills：<https://learn.chatgpt.com/docs/build-skills>
- Build plugins：<https://learn.chatgpt.com/docs/build-plugins>
- Local environments：<https://learn.chatgpt.com/docs/environments/local-environment>
- CLI 命令参考：<https://learn.chatgpt.com/docs/developer-commands?surface=cli>
- 配置基础：<https://learn.chatgpt.com/docs/config-file/config-basic>
- Changelog：<https://learn.chatgpt.com/docs/changelog>
