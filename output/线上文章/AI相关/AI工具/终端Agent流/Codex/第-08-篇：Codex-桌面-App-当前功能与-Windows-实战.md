---
title: "第 08 篇：Codex 桌面 App 当前功能与 Windows 实战"
slug: "ai-agent-codex-desktop-app-windows-workflow-20260726"
summary: "面向高频使用 ChatGPT 桌面 App 中 Codex 的 Windows 开发者，集中说明版本检查、多文件夹项目、Local、Worktree、Git、PR Chat、Voice、Browser、Computer Use、Scheduled tasks、Remote、插件与 Windows-native / WSL 工作流。"
category: "Codex"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "Codex"
tags:
  - "Codex"
  - "桌面 App"
  - "Windows"
  - "Worktree"
  - "Scheduled tasks"
  - "Browser"
status: "published"
sortOrder: 80
cover: ""
originalId: "6a6b691f4bf50146e9b95e6c"
originalSlug: "ai-agent-codex-desktop-app-windows-workflow-20260726"
originalStatus: "published"
publishedAt: "2026-07-30T15:09:19.559Z"
updatedAt: "2026-07-31T11:16:25.506Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 08 篇：Codex 桌面 App 当前功能与 Windows 实战

> 更新时间：2026-07-26。
> 本机复核基线：Windows Store 包 `OpenAI.Codex 26.721.4979.0`，当前可调用 CLI 为 `codex-cli 0.146.0-alpha.3`。
> 产品名称：从桌面版 `26.707` 起，Codex 已并入 macOS 和 Windows 的 **ChatGPT desktop app**；原 Codex App 用户正常更新即可保留项目、设置和工作流。
> 定位：桌面 App 主手册。以后 App 的版本、多文件夹项目、Voice、Local / Worktree / Cloud、PR Chat、Browser、Computer Use、Scheduled tasks、Remote、插件和 Windows 差异统一在本篇维护。
> 时效边界：官方 Changelog 当前最新明确的桌面版本条目是 `26.715`；本机 Store 包版本更高，但本文不推断尚无公开说明的 `26.721` 具体变更。账号、平台、地区和组织策略仍会影响实际界面。

[[toc]]

---

## 1. 先讲结论：Codex 已经是 ChatGPT 桌面工作区的一部分

CLI、IDE 扩展和 ChatGPT desktop app 中的 Codex 复用模型、规则、审批、沙箱、MCP、skills 与部分本地状态，但它们不是三个完全相同的壳。桌面端除了写代码，还把 Chat、Work、Codex、文件产物、浏览器、桌面应用和远程设备放进同一个工作区。

桌面 App 更适合承担：

1. 同时管理多个项目和长线程
2. 给一个项目挂载多个相关文件夹，并明确 primary folder
3. 用 Worktree 隔离并行任务
4. 直接编辑 Markdown / code，并通过 annotations 定点反馈
5. 在 Review pane 和 PR Chat 里检查改动、patch 与 GitHub PR 反馈
6. 在内置终端、Git、Browser 和 Computer Use 之间闭环验证
7. 用 Voice 启动、检查或 steer 其他线程
8. 把重复任务交给 Scheduled tasks，把长任务交给 Goals
9. 通过 Remote 从手机或另一台受支持设备继续工作
10. 管理 plugins、skills、MCP、connectors 和可复用工作流

CLI 仍然更适合透明排错、脚本化执行、CI 和精确检查配置来源。两者应该互补，而不是互相替代。

---

## 2. 怎么确认 App 版本和更新入口

### 2.1 Windows 查看安装包版本

```powershell
Get-AppxPackage -Name OpenAI.Codex |
  Select-Object Name, Version, InstallLocation
```

本机当前结果是：

```text
Name: OpenAI.Codex
Version: 26.721.4979.0
```

不要把 `ChatGPT.exe` 显示的 Chromium 文件版本当成桌面产品版本。Windows Store 包的 `Version` 才适合记录本机安装基线。

### 2.2 从终端打开 App

当前 CLI 提供正式入口：

```powershell
codex app .
codex app C:\path\to\project
```

第一条打开当前目录，第二条打开指定工作区。没有安装桌面 App 时，该命令会进入安装流程。

### 2.3 App 内的更新资料入口

当前 Windows App 的 Help 菜单提供：

1. Documentation
2. What's New
3. Troubleshooting
4. System Status
5. Send Feedback

What's New 指向官方 Codex Changelog。每次 App 大版本变化，优先查看这里，不要只根据界面截图猜功能是否被删除。

Windows 安装包仍保留 `OpenAI.Codex` 这个包身份，不能据此判断它还是一款与 ChatGPT 分离的产品。当前实际产品名和官方文档入口都已经统一到 ChatGPT desktop app。

### 2.4 近期桌面版更新主线

| 日期 / 版本 | 对日常使用影响最大的变化 |
|---|---|
| 2026-07-23 / `26.715` | GPT-Live 驱动的 ChatGPT Voice；本地项目支持多文件夹和 primary folder |
| 2026-07-09 / `26.707` | Codex 并入 ChatGPT desktop app；直接编辑 Markdown / code、annotations、PR Chat；插件管理移入 Settings |
| 2026-06-25 | Codex Remote 达到 GA，移动端与 Mac/Windows host 改为一对一 QR 配对 |
| 2026-06-18 / `26.616` | macOS Record & Replay；自动化历史批量处理；本地与远程 host 的 thread handoff |
| 2026-06-11 / `26.609` | Browser Developer mode、App 内 `/init`、Windows Computer Use 的 per-app access control |
| 2026-05-29 / `26.527` | Computer Use 和 Remote control 正式支持 Windows；后台线程和 subagent 可见性增强 |
| 2026-05-21 / `26.519` | Goal mode 结束 experimental，App / IDE / CLI 均可用 |

这张表只记录改变工作流的节点，不逐条抄录修复项。版本细节仍以 Changelog 为准。

---

## 3. 项目文件夹、Local、Worktree、Cloud 怎么选

### 3.1 多文件夹项目和 primary folder

从 `26.715` 起，一个本地项目可以加入多个相关文件夹。在项目菜单里选择 Edit project，可以添加目录并指定 primary folder。

必须记住这条边界：

1. 新 chat 默认从 primary folder 建立工作上下文
2. Git 操作以 primary folder 为主
3. `AGENTS.md`、skills、`config.toml` 的自动发现以 primary folder 为根
4. secondary folders 可以用于文件搜索、读取和编辑
5. secondary folder 不会自动覆盖 primary folder 的 Git 和配置根

例如前端、后端是两个相邻仓库时，不要因为它们都被加入项目，就默认一条 Git 提交能同时覆盖两边。先明确哪个目录是 primary，再分别检查每个仓库状态。

### 3.2 Local

Local 直接在当前项目目录工作。

适合：

1. 小范围修改
2. 当前分支上的连续任务
3. 需要直接复用已经安装好的依赖和本地服务
4. 你明确知道当前工作树状态

风险：当前目录已有未提交修改时，新任务会和现有工作混在一起。开始前先看 Git 状态和 App 的 diff。

### 3.3 Worktree

Worktree 为任务创建隔离工作目录，同一个仓库可以并行处理多个任务。

适合：

1. 同时修两个互不相关的问题
2. 让长任务后台运行，同时保留主目录继续开发
3. 比较两种实现方案
4. 避免任务直接污染当前工作树

必须记住：

1. 仅 Git 项目可用
2. 新 worktree 可能从 detached HEAD 开始
3. 同一分支不能同时被多个 checkout 检出
4. 每个 worktree 有自己的依赖、构建产物和未提交状态
5. 任务结束后要确认分支、提交和清理策略
6. `.worktreeinclude` 可以把明确列出的 ignored setup 文件复制到 App 管理的 worktree，但不要滥用它复制大量敏感文件

App 默认保留最近 15 个 Codex-managed worktrees；设置里可以修改数量或关闭自动清理。归档 chat 会触发对应 managed worktree 的清理，但 App 会先保存快照以便后续恢复。

### 3.4 Cloud

Cloud 把任务交给远端环境执行。

适合：

1. 本地不想长期占用资源的任务
2. 可以独立描述输入和完成条件的长任务
3. 需要并行委派的检查或实现

云端任务是否可用取决于登录方式、账号权限、环境配置和组织策略。API key 登录不等于自动拥有 ChatGPT、Cloud、连接器或插件目录权限。

### 3.5 Handoff

官方当前明确记录了两类 Handoff：在同一仓库的 Local 与 App-managed Worktree 之间迁移，以及在匹配 Git 项目的本地与远程 host 之间迁移。Cloud 是单独的委派目标，不要把所有环境切换都笼统叫作 Handoff。

迁移前先确认：

1. 当前改动有没有保存或提交
2. 目标环境能否访问同一仓库和依赖
3. 环境变量、密钥和 MCP 是否在目标环境可用
4. 当前任务依赖的本地服务能否在目标环境重建

---

## 4. Local environments：把准备动作写成项目能力

Local environments 适合定义新 worktree 或新任务需要的准备动作，例如：

```text
npm install
npm run build
npm run test
```

也可以定义常用 Action：

1. Run
2. Test
3. Lint
4. Build
5. 启动本地服务

工程上要注意：

1. setup 脚本应可重复执行
2. 不要在脚本里硬编码真实密钥
3. Windows、macOS、Linux 可以分别维护命令
4. 安装依赖前先确认 lockfile 和包管理器
5. 耗时很长的准备动作要让使用者能看懂进度和失败位置

配置保存在项目根目录的 `.codex` 文件夹中，可以随仓库共享。Monorepo 或多文件夹项目里，必须打开真正包含这份 `.codex` 的项目根；否则 App 不会自动找到团队共享的 environment。Actions 会出现在顶部工具区，并在 integrated terminal 中运行；setup scripts 则在创建 worktree 时自动执行。

---

## 5. 直接编辑、Built-in Git、PR Chat、Review 和终端

### 5.1 直接编辑 Markdown / code 和 annotations

从 `26.707` 起，App 可以直接编辑 Markdown 和代码产物。选中文本后，可以要求 Codex 只修改选中内容；inline annotations 则适合把反馈钉在具体文本、diff 行或页面区域上。

这种方式适合小范围修订、文档润色和精确 review。涉及跨文件重构时仍应回到 chat 明确整体目标、影响范围和验证命令，不要把许多零散 annotation 当成完整需求。

### 5.2 Built-in Git

桌面 App 可以把改动检查、暂存、撤销、提交和后续 Git 操作放进同一工作区。

推荐顺序：

1. 先看文件列表
2. 再看每个文件的 diff
3. 确认没有覆盖用户已有改动
4. 运行测试或构建
5. 再 stage、commit、push

不要因为 App 有 Git 按钮，就跳过分支和工作树判断。

### 5.3 Review pane 与 PR Chat

Review pane 适合：

1. 检查当前任务产生的 diff
2. 承接代码审查结果
3. 查看 PR 上下文和 reviewer feedback
4. 边看问题边让 Codex 修改
5. 在 staged、unstaged、commit、branch 和 last turn 之间切换审查范围

Review 不等于验证完成。代码看起来合理之后，仍要运行项目要求的 build、test、lint 或真实页面检查。

`/review` 可以审查相对基准分支的改动或当前未提交改动，并按优先级给出 findings，不会主动改写工作树。PR Chat 则面向 GitHub pull request：可以围绕 PR 上下文提问、发送 inline review feedback、查看 proposed patch，并编辑、接受或拒绝。要完整加载 PR 上下文，先安装 GitHub CLI 并执行：

```powershell
gh auth login
```

PR 分支打开正确、`gh` 已认证、GitHub 权限有效，这三项缺一时，侧栏或 Review pane 都可能看不到完整 PR 信息。

### 5.4 Integrated terminal

内置终端解决的是“不要为了执行一个命令反复切窗口”。Windows 常见 shell 包括 PowerShell、CMD、Git Bash 和 WSL。

终端和 Agent 环境不一定天然相同，排错时确认：

1. 当前目录是否一致
2. PATH 是否一致
3. Node、Git、Python 等版本是否一致
4. 环境变量是否在 App 进程启动后才修改
5. Agent 是 Windows-native 还是 WSL

---

## 6. Browser、Chrome extension、Developer mode 和 Computer Use

这几项都能“操作页面”，但上下文和权限边界不同。

| 能力 | 主要用途 | 边界 |
|---|---|---|
| Built-in Browser | App 内预览本地页面、公开网站或需要登录的页面 | 使用独立 browser profile，不自动继承日常浏览器标签和 session |
| Chrome extension | 在已有 Chrome tab 和常用 Chrome profile 中工作 | 能接触已登录网站，要按真实账号操作审查风险 |
| Developer mode | 用受控 CDP 检查 Console、Network、DOM、样式、runtime 和性能 | Full CDP 需显式批准，也可能被组织策略禁用 |
| Computer Use | 通过看、点、输操作 macOS / Windows 桌面 App | 只操作获准 App；Windows 占用当前前台桌面 |

Built-in Browser 可以直接登录，但它使用与日常浏览器分离的 profile；如果任务必须复用现有 Chrome 登录态和标签页，改用 Chrome extension。Browser 对网站有 allow / block 控制，提交信息、购买、改权限和删数据等敏感动作仍需确认；当前也不能自动化 built-in Browser 的文件上传。

Developer mode 在 Settings > Browser 中启用 full CDP access。它适合抓 performance trace、查看 Network / Console、检查 DOM 和运行时状态，不应为了普通页面截图默认开启。

Computer Use 已在支持地区正式支持 macOS 和 Windows，不再是“仅 macOS”或“Windows 等待支持”。但两端运行方式不同：

1. Windows 在 active desktop 前台运行，会移动指针和键盘，不能在同一个 Windows session 后台静默操作
2. Windows 可在设置中管理 per-app access control 和 Always-allowed apps
3. macOS 需要 Screen Recording 与 Accessibility 权限，并可在明确启用后使用 locked use
4. 文件读写和 shell 命令继续受 sandbox / approval 控制，桌面 App 内操作还要经过 Computer Use 的 App 授权
5. Computer Use 不能自动化终端 App、ChatGPT 自身，也不能代替用户批准系统安全权限或管理员认证

如果目标系统有专用 plugin、connector 或 MCP 工具，优先使用结构化接口；只有任务依赖 GUI 可见状态时才使用 Computer Use。

页面验证建议：

1. 先启动当前项目
2. 只打开本次问题相关页面、route 和状态
3. 优先用 annotations 标出具体元素
4. 必须时才打开 Developer mode 检查 Console、Network 或性能
5. 修改后回到 Review pane 检查磁盘改动
6. 涉及真实账号、支付、发布或删除操作时逐项确认

---

## 7. Scheduled tasks：适合重复工作，不适合模糊愿望

官方当前统一使用 Scheduled tasks。它有两种主要形态：

1. standalone scheduled task：每次运行创建独立 chat，结果进入 Scheduled inbox
2. schedule inside a chat：定时回到原 chat，继续使用现有上下文

适合：

1. 定时检查最近代码变化
2. 周期性生成维护摘要
3. 重复运行只读审查
4. 定期检查依赖、测试或服务状态

创建自动化前必须写清：

1. 触发时间
2. 工作目录
3. 输入数据
4. 允许执行的动作
5. 成功标准
6. 失败后的处理方式

Git 项目可以明确选择直接在 local project 或独立 worktree 后台运行；非 Git 项目直接使用项目目录。需要本地文件时，电脑必须开机、项目仍在磁盘上且 ChatGPT desktop app 保持运行。系统休眠、网络中断、登录过期和本地依赖异常都会影响执行。

Scheduled tasks 无人值守运行，并使用默认 sandbox 设置。组织允许时会使用 `approval_policy = "never"`；若管理员要求禁止该策略，则回退到所选 permission mode 的审批行为。创建计划前先手工运行一次 prompt，确认模型、工具、skill 和输出都符合预期。

不要把高风险发布、批量删除、生产数据库修改直接做成无人值守自动化。

---

## 8. Plugins、Skills、MCP 和 Apps 怎么分

### 8.1 Plugin

Plugin 是可安装能力包，可以包含 skills、connectors、MCP servers、browser extensions、hooks 和 scheduled task templates。ChatGPT Work 与 Codex 使用统一的公开 plugin directory；桌面端的管理入口在 Settings / Plugins 一带，具体位置会随版本调整。

公开目录通常分为 OpenAI、workspace 和 Personal 等来源。安装或卸载后应新开 chat，CLI 侧则应新开 session，确保新能力完整加载。通过 API key 登录时可以使用部分 OpenAI-curated plugins，但依赖不受支持 OAuth 流程的插件可能不可用。

当前 CLI 可用：

```powershell
codex plugin list
codex plugin marketplace --help
```

### 8.2 Skill

Skill 是可复用工作流说明，适合把固定任务步骤、参考资料和脚本组织起来。

### 8.3 MCP

MCP 连接实时工具和外部数据源。

```powershell
codex mcp list
codex mcp get <name>
```

### 8.4 App / Connector

App 或 Connector 通常负责授权访问 GitHub、Google Drive、Gmail、Slack 等私有数据。它和普通网页搜索不是同一类能力；外部服务仍使用自己的身份认证、访问控制、条款和数据策略。

排障顺序：

1. 插件是否安装并启用
2. 插件带来的 skill 是否可见
3. MCP 服务是否启动成功
4. 连接器是否完成账号授权
5. 工作区或组织策略是否禁止该能力
6. 是否需要重启 App 或新开线程

### 8.5 Record & Replay

Record & Replay 可以把一次实际演示转成 reusable skill，适合“步骤稳定但文字描述麻烦”的桌面流程。它当前只支持 macOS，初始范围排除 EEA、英国和瑞士，而且必须启用 Computer Use；Windows 用户不要因为桌面版已有 Computer Use，就默认也能录制生成 skill。

如果工作流需要团队分发、多项 skills、connectors、MCP 或安装元数据，应把结果整理成正式 plugin，而不是只保留个人录制产物。

---

## 9. 多 Agent、Goals、Memories 和 Hooks

多 Agent、Goals 和 Hooks 已经进入稳定工作流；Memories 是否开启仍受账号、地区、工作区和管理员设置影响。

### 9.1 多 Agent

适合把真正独立的任务并行处理，例如：

1. 一个 Agent 查前端
2. 一个 Agent 查后端
3. 一个 Agent 查测试和发布风险
4. 主 Agent 最后统一结论

不要把强依赖、会修改同一文件的任务强行并行，否则冲突成本可能高于收益。

桌面版 `26.707` 进一步改善了 task 与 subagent activity 的可见性，但“界面能看见并行活动”不代表共享文件改动自动没有冲突。需要隔离代码时仍应配合 Worktree。

### 9.2 Goals

Goal mode 从 `26.519` 起不再是 experimental，并已覆盖 App、IDE extension 和 CLI。它适合给长线程一个持续目标，让 Codex 在数小时甚至更久的任务里持续追踪最终结果、阻塞状态和恢复条件。

### 9.3 Memories

Memories 可以记住偏好、重复工作流、技术栈和仓库习惯。它适合个人长期偏好，不适合替代团队可审查的项目规范；显式 prompt、项目 `AGENTS.md` 和当前任务要求优先级更高。EEA、英国和瑞士初始默认关闭，其他地区也可能因组织策略不可用。

### 9.4 Hooks

Hooks 适合机械执行生命周期规则，例如工具调用前检查、命令后记录或文件编辑后的验证。涉及项目规则时，仍应把人能读懂的要求写进 `AGENTS.md`。

---

## 10. ChatGPT Voice：用语音协调工作，不只是语音输入

桌面版 `26.715` 加入 GPT-Live 驱动的 ChatGPT Voice，可用于 Chat、Work 和 Codex。它与 dictation 不同：dictation 只是把语音转成待发送文字，Voice 是持续对话模式。

Voice 可以：

1. 从空 chat 或 task 开始语音会话
2. 讨论需求并启动新的 Codex 任务
3. 检查现有线程的进度和阻塞
4. 给其他线程发送 follow-up，实时改变任务方向
5. 把并行线程的进度、阻塞和结果带回当前语音对话

Voice 当前面向 Plus、Pro、Business、Edu 和 Enterprise 桌面版，并可通过配对后的 iOS Remote 使用；最终可用性仍取决于 rollout 和 workspace settings。任务权限不会因为改用语音而放宽，Voice 启动的 Codex 任务仍消耗对应 Codex 用量。

---

## 11. Windows-native 与 WSL 怎么选

### 11.1 优先 Windows-native 的情况

1. 仓库位于 `C:\` 文件系统
2. 工具链主要使用 PowerShell、Visual Studio、Windows SDK
3. 本地服务和数据库运行在 Windows
4. 需要使用原生 Windows 沙箱和桌面应用

### 11.2 优先 WSL 的情况

1. 仓库主要位于 WSL2 文件系统
2. 项目依赖 Linux shell、容器或系统包
3. 团队开发和生产环境都是 Linux
4. Windows 与 Linux 路径差异已经成为主要问题

### 11.3 最常见的不同步来源

1. Windows 和 WSL 不是同一个 `~/.codex`
2. 两边 `CODEX_HOME` 不一致
3. Node、Git、Python 和包管理器版本不同
4. Windows 环境变量没有同步到 WSL
5. App 在 worktree，CLI 在原始目录
6. 一边使用 ChatGPT 登录，另一边使用 API key 或第三方 provider

WSL1 已经不应作为当前主线路；需要 Linux 环境时使用 WSL2。

Windows 官方安装命令是：

```powershell
winget install --id 9PLM9XGG6VKS -s msstore
```

Windows-native agent 默认用 PowerShell 和 native Windows sandbox；切换到 WSL agent 后必须重启 App。Agent 与 integrated terminal 可以独立选择，所以排错时不要只看终端提示符，还要确认实际 Agent mode。

---

## 12. App 登录和 CLI 登录为什么会表现不同

常见认证来源包括：

1. ChatGPT 登录
2. OpenAI API key
3. 第三方 provider
4. 系统凭据库或 `auth.json`
5. App / Connector 单独授权

必须记住：API key 能调用模型，不代表自动拥有 ChatGPT 套餐能力、Cloud tasks、插件目录、连接器或组织工作区权限。

出现“CLI 能用，App 某功能不可用”时，不要只检查模型名。还要看：

1. App 登录的是哪个账号
2. 当前组织和工作区
3. 插件或连接器是否单独授权
4. App 与 CLI 是否使用同一 `CODEX_HOME`
5. 当前功能是否按账号灰度开放

---

## 13. App 高频工作流

### 13.1 修一个普通 bug

1. 用 Local 打开项目
2. 让 Codex 先读取相关模块和项目规则
3. 明确复现条件和完成标准
4. 修改后在内置终端运行测试
5. 在 Review pane 检查 diff
6. 确认后再提交

### 13.2 同时处理两个独立任务

1. 主目录保留当前开发
2. 为任务 A 创建 Worktree
3. 为任务 B 创建另一个 Worktree
4. 分别验证，不共用未提交状态
5. 完成后通过分支、提交或 handoff 汇总
6. 清理不再使用的 worktree

### 13.3 前端页面问题

1. Local 或 Worktree 修改代码
2. 使用 Local environment Action 启动服务
3. 用 Built-in Browser 打开目标页面
4. 先用 annotations 标问题，必要时开启 Developer mode 看 DOM、Console 和 Network
5. 回到 Review pane 检查最终改动

### 13.4 处理 GitHub PR

1. 在 PR 分支打开本地项目或 Worktree
2. 确认 `gh auth status` 正常
3. 在 PR Chat 阅读上下文和 reviewer feedback
4. 只接受需要处理的 patch，拒绝越界修改
5. 在 Review pane 查看最终 diff 并运行项目验证
6. 确认后再 commit、push

### 13.5 重复维护任务

1. 先手工跑通一次
2. 把工作目录、命令、成功标准写清
3. 再创建 Scheduled task
4. 初期保留人工检查
5. 确认稳定后再降低人工介入

---

## 14. App 排障顺序

1. 查看 App 安装包版本
2. 查看 Help / What's New 是否出现版本变化
3. 确认 Codex 当前账号、workspace、rollout 和管理员策略
4. 确认项目的 primary folder、Local / Worktree / Cloud 目标
5. 确认仓库、分支和 Git 状态
6. 确认 Windows-native / WSL 与 `CODEX_HOME`
7. 区分 App 内置 Codex 版本与系统 CLI 版本，不要假设二者相同
8. 运行 `codex doctor --summary` 和 `codex login status`
9. 检查 `codex plugin list`、`codex mcp list`
10. 检查 plugin / connector / Browser / Computer Use 是否分别完成授权
11. Windows Computer Use 失败时确认目标 App 位于 active desktop 前台
12. 最后再考虑重启、重新配对或重装

完整诊断命令：

```powershell
codex --version
codex doctor --summary
codex login status
codex features list
codex plugin list
codex mcp list
```

---

## 15. Remote 已 GA，但 CLI 内部命令仍要区别看待

Codex Remote 已在 2026-06-25 达到 general availability。它可以让 ChatGPT iOS / Android 连接运行 ChatGPT desktop app 的 Mac 或 Windows host，并完成：

1. 在 host 项目里启动或继续 chat
2. 发送 follow-up、回答问题和 steer 当前任务
3. 审批命令或其他动作
4. 查看 diff、测试结果、terminal output 和 screenshot
5. 在多个已配对 host 和 chat 之间切换

当前配对采用每台移动设备与每台 host 之间的一对一 QR 认证。手机和 host 需要使用相同 ChatGPT account 与 workspace，并满足 MFA、SSO、passkey 和组织策略。旧连接如果自 2026-06-08 后未使用，更新两端 App 后可能需要重新配对。

远程任务使用 host 上的文件、凭据、权限、plugins、skills、MCP、Browser、Computer Use 和本地工具。Host 休眠、离线或关闭 App 后 Remote 会中断；Windows 上需要 Computer Use 时，还要保持 session 解锁，因为它仍在前台操作。

系统 CLI 目前仍公开这些底层入口：

```powershell
codex remote-control --help
codex app-server daemon --help
```

这里必须区分两个口径：**桌面产品的 Remote 已 GA**，但当前 CLI 的 `remote-control` help 仍把这条命令标成 experimental。日常远程使用应从 App 的 Remote / Connections 和移动端 QR 配对进入，不要把底层 app-server daemon 当成新手主入口，也不要自行暴露未认证监听端口。

---

## 16. 每次 App 更新后怎么维护这篇文章

建议只记录这些稳定证据：

1. Windows Store 包版本
2. `codex --version`
3. `codex --help` 新增或移除的命令
4. `codex features list` 的 stable / experimental / deprecated 变化
5. App Help / What's New 的正式说明
6. 官方 App 页面新增或移除的独立功能页

不要仅凭按钮换位置就宣布功能被删除，也不要把灰度功能写成所有账号默认开放。

---

## 17. 官方资料入口

- ChatGPT desktop app：<https://developers.openai.com/codex/app>
- Changelog：<https://learn.chatgpt.com/docs/changelog>
- Worktrees：<https://developers.openai.com/codex/app/worktrees>
- Local environments：<https://developers.openai.com/codex/app/local-environments>
- Scheduled tasks：<https://developers.openai.com/codex/app/automations>
- Code review / PR：<https://learn.chatgpt.com/docs/code-review?surface=app>
- Browser / Developer mode：<https://learn.chatgpt.com/docs/browser?surface=app>
- Computer Use：<https://learn.chatgpt.com/docs/computer-use>
- Voice：<https://learn.chatgpt.com/docs/features/voice>
- Remote connections：<https://learn.chatgpt.com/docs/remote-connections>
- Record & Replay：<https://learn.chatgpt.com/docs/extend/record-and-replay>
- Windows App：<https://learn.chatgpt.com/docs/windows/windows-app>
- Troubleshooting：<https://learn.chatgpt.com/docs/reference/troubleshooting>
- Plugins：<https://learn.chatgpt.com/docs/plugins?surface=app>

本次已通过官方 Changelog 和上述实时页面逐项复核。命令行直接抓取 `developers.openai.com` 仍可能返回 403，但浏览器访问会跳转到当前 `learn.chatgpt.com` 文档体系；这属于访问方式差异，不再是本文资料未核实的理由。
