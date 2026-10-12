---
title: "第 01 篇：Claude Code 快速上手、npm 安装更新与终端工作原理（程序员版）"
slug: "ai-agent-claudecode-claudecode-4c9d5bfe"
summary: "按 2026-10-12 可查到的 Claude Code 2.1.296、官方 Setup、Quickstart、Interactive Mode、Commands、Permission Modes 与 Changelog 更新，覆盖原生安装、npm 更新、Windows/WSL、终端状态、权限模式、会话管理和第一轮可验证工作流。"
category: "ClaudeCode"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "ClaudeCode"
tags:
  - "Claude Code"
  - "npm"
  - "安装更新"
  - "CLI"
  - "权限模式"
  - "程序员上手"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf18"
originalSlug: "ai-agent-claudecode-claudecode-4c9d5bfe"
originalStatus: "published"
publishedAt: "2026-05-30T08:58:26.833Z"
updatedAt: "2026-10-12T21:50:00.000Z"
exportedAt: "2026-09-29T13:16:41.461Z"
---
# 第 01 篇：Claude Code 快速上手、npm 安装更新与终端工作原理（程序员版）

> 本文按 2026-10-12 能查到的官方资料复核，示例以 Claude Code `2.1.296` 为当前版本快照。Claude Code 是会读代码、修改文件、运行命令并连接开发工具的终端代理；安装成功只是起点，真正稳定的使用依赖“版本可确认、目录正确、权限可控、结果可验证”。

[[toc]]

---

## 先给结论

程序员第一次使用 Claude Code，先把下面这条最小链路跑通：

```text
安装 → claude --version → 在仓库根目录启动 → 先让 Claude 解释 → 再让它做一个小改动 → 查看 diff → 运行验证命令
```

有四个容易过时的认知需要先纠正：

1. 官方现在优先推荐原生安装器；npm 仍然支持，适合已经统一用 Node.js 包管理或需要显式锁版本的团队。
2. `--permission-mode`、`/model`、`/effort`、`/config` 都可能被组织策略、当前 Provider 和模型能力限制，不能把网上旧截图当成当前行为。
3. `/batch`、`/deep-research`、`/code-review`、`/run`、`/verify`、`/workflows` 等有些是 bundled skill 或 workflow，不一定在每个账号、Provider 或版本中出现。
4. 看到“connected”只能说明连接建立，不能说明模型、权限、MCP 工具和项目规则都可用；收尾必须看 diff 和测试结果。

---

## 1. 先确认版本和发布渠道

截至本文核验时间，npm `@anthropic-ai/claude-code` 与 GitHub Releases 的最新公开版本均为 `2.1.296`，对应 2026-10-09 的发布记录。版本会快速迭代，文章中的版本号是核验基线，不是永久固定值。

```bash
claude --version
claude -v
npm view @anthropic-ai/claude-code version
```

需要排查“到底运行了哪一份程序”时，按系统检查路径：

```bash
# macOS / Linux / WSL
which claude
command -v claude

# Windows PowerShell
Get-Command claude | Format-List Source,Version
where.exe claude
```

如果 `npm view` 显示的新版本和 `claude --version` 不一致，优先检查 PATH 中是否同时存在原生安装、npm 全局安装、Homebrew 或 WinGet 安装。一次只保留一个主安装来源，能显著减少“更新了但版本不变”和“终端 A、IDE 终端 B 版本不同”的问题。

---

## 2. 官方安装方式与 npm 安装方式

### 2.1 官方推荐的原生安装

官方 Setup 当前把 Native Install 标为推荐方式：

```bash
# macOS、Linux、WSL
curl -fsSL https://claude.ai/install.sh | bash
```

```powershell
# Windows PowerShell 原生安装
irm https://claude.ai/install.ps1 | iex
```

```cmd
:: Windows CMD
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

也可以使用系统包管理器：

```bash
brew install --cask claude-code
```

```powershell
winget install Anthropic.ClaudeCode
```

原生安装器把版本放在用户目录下并负责更新；如果团队已经通过镜像、软件分发或包管理系统管理二进制，使用原生安装器前先确认不会和既有安装互相覆盖。

### 2.2 npm 安装、更新与卸载

npm 方式仍然有效，包名是 `@anthropic-ai/claude-code`：

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

锁定某个版本用于复现问题：

```bash
npm install -g @anthropic-ai/claude-code@2.1.296
```

卸载 npm 安装：

```bash
npm uninstall -g @anthropic-ai/claude-code
```

npm 安装需要 Node.js 22 或更高版本；Claude Code 本体是原生二进制，运行时不依赖 Node.js，但安装器会检查 npm 的 Node.js 引擎版本。升级 npm 安装时使用：

```bash
npm install -g @anthropic-ai/claude-code@latest
```

官方不建议用 `npm update -g`，因为它会遵循最初安装时的 semver 范围，可能不会移动到最新版本；也不要使用 `sudo npm install -g`，应按 npm 权限排障文档修复全局目录权限。更新后仍旧显示旧版本，执行 `npm prefix -g`、`npm bin -g`（具体命令随 npm 版本而异）或 `Get-Command claude` 检查实际 PATH。不要在同一个终端里混用“原生安装器更新”和“npm 全局更新”来判断是否成功。

### 2.3 固定发布渠道和最低版本

官方支持 `latest`（默认，较快获得新功能）与 `stable`（通常滞后一周左右，避开明显回归）两个更新通道：

```json
{
  "autoUpdatesChannel": "stable",
  "minimumVersion": "2.1.280"
}
```

临时关闭自动更新可使用环境变量：

```bash
export DISABLE_AUTOUPDATER=1
```

更新命令：

```bash
claude update
```

`DISABLE_AUTOUPDATER` 只影响自动更新；如果要阻止 `claude update`、`claude install` 等主动更新，还要按官方说明设置 `DISABLE_UPDATES`，并通过团队的版本分发流程管理升级。网络存储、多机器共享 home 目录时不要原地替换正在运行的二进制，应让新旧版本并存，确认没有其他机器仍在运行旧文件后再清理。

### 2.4 Windows 原生安装、Git Bash 与 WSL

官方支持 Windows 10 1809+、Windows Server 2019+，也支持 WSL。原生 Windows 没有 Git for Windows 时，Bash 工具会通过 PowerShell 执行；安装 Git for Windows 后，Bash 工具优先使用 Git Bash。找不到 Git Bash 时，在设置中指定：

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

WSL 中按 Linux 方式安装；Windows 原生目录和 WSL 路径、凭据、`claude` 可执行文件不是同一个环境。遇到“Windows 终端可用、WSL 不可用”或相反的情况，先在对应环境分别执行 `which/where claude` 和 `claude --version`。

Alpine/musl 系统需要额外依赖：

```bash
apk add bash curl libgcc libstdc++ ripgrep
```

如果要使用系统 ripgrep，可在设置中关闭内置版本：

```json
{
  "env": {
    "USE_BUILTIN_RIPGREP": "0"
  }
}
```

---

## 3. 安装后立即做三项检查

```bash
claude --version
claude doctor
claude --help
```

`claude doctor` 当前会检查安装、PATH、设置文件、扩展、技能、MCP、插件以及部分上下文成本问题。`claude --help` 用于确认本机版本实际支持的 CLI 参数，不要只抄旧文章里的参数。

登录方式取决于连接类型：

- Claude.ai 订阅：运行 `claude`，按登录流程授权。
- Anthropic API：使用 `ANTHROPIC_API_KEY` 或 `ANTHROPIC_AUTH_TOKEN`。
- Amazon Bedrock、Google Cloud 的 Agent Platform、Microsoft Foundry、Claude Platform on AWS：使用对应 Provider 的环境变量和认证流程。
- LLM Gateway：通常设置 `ANTHROPIC_BASE_URL` 与网关凭据；如果是 Provider 专用路由，使用对应的 `ANTHROPIC_*_BASE_URL` 和认证变量。

不要把真实 Key 写进 `CLAUDE.md`、仓库 `settings.json` 或文章。环境变量、`apiKeyHelper`、系统密钥管理和组织托管设置都应遵循自己的密钥生命周期。

---

## 4. 第一次启动要在什么目录

推荐进入真实仓库根目录后启动：

```bash
cd /path/to/your/repository
claude
```

空目录里也能启动，但 Claude 没有项目上下文，`/init` 生成的 `CLAUDE.md` 也缺少架构、脚本和验证命令。第一次进入仓库，建议先问：

```text
请先只读检查这个仓库：说明技术栈、入口、主要目录、测试命令、构建命令和当前 git 状态。先不要修改任何文件。
```

需要临时增加目录时：

```text
/add-dir ../shared-package
```

`/add-dir` 只给当前会话增加文件访问目录；它不会自动把该目录的大部分 `.claude/` 配置加载进来。要移动整个会话的工作目录，用 `/cd <path>`；这两个命令的语义不能混用。

---

## 5. 终端界面里常见状态词怎么读

| 看到的词 | 实际含义 | 你要检查什么 |
| --- | --- | --- |
| `thinking` | 模型正在生成或整理下一步 | 不代表已经修改文件 |
| `Read`、`Glob`、`Grep` | 正在读取或检索文件 | 路径是否在预期目录、是否读到敏感文件 |
| `Bash` | 准备运行 shell 命令 | 命令、工作目录、是否会写入/删除 |
| `Edit`、`Write` | 准备修改或创建文件 | diff 范围、编码、是否误改旁支文件 |
| `permission` | 当前动作需要你的授权或被权限规则拦截 | 看完整命令和规则来源 |
| `background` | 命令、会话或 subagent 被移到后台 | 用 `/tasks`、`/agents` 或 shell 的 `claude agents` 查看 |
| `connected` | MCP/远程服务连接建立 | 还要确认目标工具存在且调用成功 |
| `deferred` | MCP 工具 schema 按需加载，减少上下文占用 | 第一次调用时可能出现加载延迟 |
| `compact` | 对话被压缩成摘要以释放上下文 | 关键约束是否已经写入 `CLAUDE.md` 或任务清单 |

按 `Ctrl+O` 可以查看详细转录；`/tui fullscreen` 可切换到全屏渲染器。`/diff` 用于检查工作树变化，满足条件时全屏模式会显示持续更新的 diff 面板。

---

## 6. 权限模式：先理解边界，再决定放权

当前常见模式如下：

| 模式 | 适合场景 | 关键边界 |
| --- | --- | --- |
| `default` / Manual | 日常开发、陌生仓库 | 修改文件、执行命令时按规则询问 |
| `acceptEdits` | 你信任改文件流程，但仍要审命令 | 自动批准文件编辑，命令仍按权限处理 |
| `plan` | 需求不清、重构、架构变更 | 先分析并给计划，批准后再执行 |
| `auto` | 有明确范围、希望减少重复确认 | 使用分类器审查动作；组织、Provider、模型可能决定是否可用 |
| `dontAsk` | 无人值守但只允许预批准工具 | 未匹配 allow 的动作直接拒绝 |
| `bypassPermissions` | 受控隔离环境、明确接受风险 | 跳过大部分权限检查；需要显式启动或策略允许 |

启动时指定：

```bash
claude --permission-mode plan
claude --permission-mode acceptEdits
claude --permission-mode auto
```

在交互会话中按 `Shift+Tab` 循环模式。`plan` 并不等于“模型只读”：如果你在计划审核时选择继续执行，后续会切换到你选择的权限行为。`auto` 也不是无条件放行，生产部署、密钥外传、强制推送、批量删除等高风险动作仍可能被分类器拒绝。

项目设置中可以配置默认模式：

```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

项目或本地设置不能把 `auto`、`bypassPermissions` 作为组织范围的强制默认；这类值应放在用户/托管设置或用启动参数临时指定。详见第 04 篇的配置优先级。

---

## 7. 第一天最值得记住的命令和快捷键

### 会话和上下文

```text
/help                         查看当前可用命令
/status                       查看版本、模型、账号和连接状态
/config                       打开设置
/model sonnet                 切换模型；/model 无参数打开选择器
/effort medium                设置当前会话的 effort
/compact                      压缩上下文，可附带关注点
/context                      查看上下文占用
/clear                        清空当前会话并开始新会话
/resume                       恢复历史会话
/rename feature-auth         修改会话名
/exit                         退出；后台会话可用 ← 返回 agent view
/diff                         查看工作树差异
```

### 工作目录、并行和后台

```text
/add-dir <path>               临时增加可访问目录
/cd <path>                    移动当前会话目录
/plan <description>           进入计划模式并开始一项任务
/background [prompt]          将当前会话放到后台
/fork [prompt]                复制会话到新的后台会话
/subtask <task>               创建结果回传主会话的后台 subagent
/agents                       查看 subagent/agent team 提示
/tasks                        查看后台任务
```

### 高频快捷键

- `Ctrl+C`：取消当前输入或当前动作。
- `Ctrl+B`：把正在执行的 Bash 命令放到后台；tmux 中通常需要按两次。
- `Ctrl+O`：切换详细转录。
- `Ctrl+T`：显示任务清单。
- `Ctrl+R`：反向搜索输入历史。
- `Shift+Tab`：切换权限模式。
- `Esc`：取消建议、关闭面板或中止当前编辑动作。
- `/loop`：当前会话内周期执行提示；需要无人值守云任务时看 Routines/Workflows，而不是把终端永久开着。

命令是否出现取决于版本、账号、Provider、插件和组织策略；`/help` 是本机最终清单。完整斜杠命令表见第 06 篇。

---

## 8. 第一轮最小任务：从只读到可验证修改

### 8.1 只读了解仓库

```text
先只读检查当前仓库。请输出：1. 技术栈；2. 启动和测试命令；3. 主要模块关系；4. 当前 git 状态。不要修改文件，也不要运行会写入磁盘的命令。
```

### 8.2 先计划再实施

```text
请先分析登录超时问题，定位相关文件和复现命令。先给出最小改动计划、风险和验证方式，等待我批准后再修改。
```

或者启动时直接进入计划模式：

```bash
claude --permission-mode plan
```

### 8.3 小范围改动和验证

```text
按刚才批准的计划，只修改 src/auth/ 下解决超时问题所需的文件。保持现有 API 行为，修改后运行 npm test -- --run auth，并展示 git diff --stat、测试输出和仍未验证的风险。
```

这套写法把目标、范围、约束和验证一起交给 Claude，比只说“帮我修一下”更容易得到可审查结果。

---

## 9. 程序员第一周最容易踩的坑

1. **同时安装多份 CLI**：先清理 PATH 和安装来源，再讨论版本问题。
2. **在错误目录启动**：`pwd`/`Get-Location`、git root 和 `/status` 一起确认。
3. **把 `CLAUDE.md` 当秘密存储**：规则文件会进入上下文，Key、Cookie、生产密码绝不能写进去。
4. **只看“connected”不看真实调用**：对 MCP、Gateway、IDE 都要执行一条最小验证请求。
5. **一上来就 `bypassPermissions`**：先用 `plan` 或 `default`，把长期 allow 规则写清楚。
6. **长会话不压缩**：在任务切换点使用 `/compact`，并把持续约束写入规则或任务清单。
7. **把旧截图当命令清单**：版本变化会移除、改名或增加 bundled skill；以 `/help` 和官方 Commands 页为准。
8. **跳过 diff 和测试**：Claude Code 能执行命令不等于变更正确，收尾必须由人审差异和验证证据。

---

## 10. 参考资料与核验范围

本文核验日期：2026-10-12；版本快照：Claude Code `2.1.296`。

- 官方 Overview：https://code.claude.com/docs/en/overview
- 官方 Setup：https://code.claude.com/docs/en/setup
- 官方 Quickstart：https://code.claude.com/docs/en/quickstart
- 官方 Interactive mode：https://code.claude.com/docs/en/interactive-mode
- 官方 Commands：https://code.claude.com/docs/en/commands
- 官方 Permission modes：https://code.claude.com/docs/en/permission-modes
- 官方 Changelog：https://code.claude.com/docs/en/changelog
- npm 包元数据：https://registry.npmjs.org/@anthropic-ai/claude-code/latest
- GitHub Releases：https://github.com/anthropics/claude-code/releases

如果官方文档和第三方教程冲突，优先采用当前官方文档、当前 CLI 的 `/help` 与 `claude --help`；第三方资料只用于理解真实部署、网关和团队工作流，不能替代版本核验。
