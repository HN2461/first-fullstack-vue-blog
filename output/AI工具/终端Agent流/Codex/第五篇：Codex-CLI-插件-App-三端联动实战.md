---
title: "第五篇：Codex CLI / 插件 / App 三端联动实战"
slug: "ai-agent-codex-codex-cli-app-afad6d17-revision-20260704"
summary: "详细讲解 Codex CLI、插件和 App 三端共用配置、认证与规则的关系，帮助排查“CLI 能用但插件或 App 不同步”的典型问题。"
category: "Codex"
tags:
  - "Codex"
  - "CLI"
  - "插件"
  - "App"
  - "配置联动"
status: "draft"
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf6e"
originalSlug: "ai-agent-codex-codex-cli-app-afad6d17"
exportedAt: "2026-07-04T07:00:23.238Z"
---
# 第五篇：Codex CLI / 插件 / App 三端联动实战

> 更新时间：2026-03-08  
> 定位：主线 03（三端统一与联动排障）。  
> 前置：第三篇（先懂配置原理和字段，再做联动最稳）。  
> 下一篇建议：第六篇（命令与配置速查）。  
> 本篇不展开：字段字典和命令全集（看第三篇、第六篇）。
> 命令/配置看不懂时：回查第六篇《命令与配置文件速查》。
> 如果主人要查“Worktrees / Handoff / Review pane / IDE 云任务 / Windows-native 到底在今天怎么用”，请优先再看第七篇；本篇负责讲三端关系，不再承担所有常用功能的细讲。
> 小白读完目标：你应该能解释为什么 CLI、IDE 扩展、App 会共用一部分能力、又表现得不完全一样，并能排查“CLI 能用但插件或 App 不同步”的高频问题。

章节导航（点击跳转）：

[[toc]]

---

## 0. 先说结论：三端不是三套系统

很多同学以为 CLI、插件、App 各有一套配置，实际不是。

它们的核心关系是：

1. CLI 和 IDE 扩展明确共用同一套核心配置：`~/.codex/config.toml`
2. 认证状态通常仍落在同一个 Codex home 下（`auth.json` 或 keyring）
3. `AGENTS.md` 这类项目规则会跨入口一起生效
4. 但 App 现在不只是“读配置的壳”，它还有 `Local / Worktree / Cloud`、Git、Terminal、Browser 等自己的工作流层
5. 所以“CLI 能用，插件/App 不能用”的本质通常是：
   - 登录态不一致
   - 项目层配置覆盖了用户层
   - provider 名字和 `[model_providers.<id>]` 不一致

---

## 1. 你必须先懂的三份文件

## 1.1 `config.toml`（总开关）

路径：

- Windows：`C:\Users\你的用户名\.codex\config.toml`
- macOS/Linux：`~/.codex/config.toml`

作用：模型、provider、审批、沙箱、MCP、profile 等都在这。

## 1.2 `auth.json`（凭据）

路径同目录：`~/.codex/auth.json`（Windows 同理）

常见写法：

```json
{
  "OPENAI_API_KEY": "你的Key"
}
```

逐行解释：

1. `OPENAI_API_KEY`：Codex 读取的标准密钥字段名。
2. `"你的Key"`：替换成真实密钥；该文件是敏感信息，不要提交到 Git 仓库。

补充：

1. 认证缓存也可能落在系统 keyring，而不一定总是文件
2. 所以看到“我电脑里没有 `auth.json`”不一定代表没登录

## 1.3 `AGENTS.md`（长期指令）

作用：告诉 Codex 这个仓库的规则、代码风格、测试要求、交付格式。  
这是你“用得越久越省事”的关键文件。

---

## 2. 配置优先级（改了不生效先看这）

按官方优先级（高 -> 低）：

1. CLI 参数（如 `-c`、`--model`、`--sandbox`）
2. `--profile <name>`
3. 项目 `.codex/config.toml`
4. 用户 `~/.codex/config.toml`
5. 系统级配置
6. 内置默认值

高频坑：

1. 你改了用户配置，但项目里有 `.codex/config.toml` 把它盖掉了
2. 项目被标记 `untrusted`，项目层配置被跳过

---

## 3. CLI 端：从安装到自动化全链路

## 3.1 安装与验证（小白步骤）

```bash
node -v
npm -v
npm i -g @openai/codex
codex --version
```

逐行解释：

1. `node -v`：检查 Node 版本是否满足运行要求（建议 20+）。
2. `npm -v`：确认 npm 可用，避免安装阶段报错。
3. `npm i -g @openai/codex`：全局安装 Codex CLI。
4. `codex --version`：验证安装是否成功，并查看当前版本。

## 3.2 登录

常见方式：

1. `codex login`（浏览器 OAuth）
2. `codex login --device-auth`（设备码）
3. `echo $OPENAI_API_KEY | codex login --with-api-key`

检查登录状态：

```bash
codex login status
```

逐行解释：

1. `codex login status`：查看当前登录状态，是鉴权问题排查的第一入口。

## 3.3 建议的小白默认配置

```toml
model_provider = "openai"
model = "gpt-5.5"
model_reasoning_effort = "medium"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
web_search = "cached"

[history]
persistence = "save-all"
```

逐字段解释：

1. `model_provider = "openai"`：默认走官方 OpenAI 提供方。
2. `model = "gpt-5.5"`：默认模型先对齐官方当前推荐的本地默认示例。
3. `model_reasoning_effort = "medium"`：推理强度中档，平衡速度与质量。
4. `approval_policy = "on-request"`：风险动作需人工确认。
5. `sandbox_mode = "workspace-write"`：只允许改当前工作区。
6. `web_search = "cached"`：默认使用缓存搜索。
7. `[history] persistence = "save-all"`：保存历史会话，便于后续恢复与审计。

## 3.4 CLI 关键参数（按使用频率）

1. `--model/-m`：临时切模型
2. `--sandbox/-s`：`read-only | workspace-write | danger-full-access`
3. `--ask-for-approval/-a`：`untrusted | on-request | never`
4. `--full-auto`：旧资料常见快捷写法，当前更建议显式写 `--sandbox workspace-write --ask-for-approval on-request`
5. `--yolo`：危险模式（跳过审批与沙箱）
6. `-c key=value`：临时覆盖配置
7. `--profile/-p`：加载 profile
8. `--cd/-C`：指定工作目录
9. `--add-dir`：增加可写目录
10. `--search`：临时使用 live web search

## 3.5 CLI 核心命令（必须熟）

1. `codex`：交互模式
2. `codex exec "..."`：非交互自动化
3. `codex exec --json "..."`：机器可读输出
4. `codex exec resume --last "..."`：续跑上次任务
5. `codex resume`：恢复交互会话
6. `codex mcp ...`：管理 MCP 服务
7. `codex features list|enable|disable`：功能开关

## 3.6 CLI slash commands（高频）

你在会话里输入 `/` 可以看到内置命令。高频建议先记这批：

1. `/status`：看模型、权限、上下文
2. `/permissions`：切审批模式
3. `/model`：切模型
4. `/review`：代码审查
5. `/diff`：查看变更
6. `/mcp`：看 MCP 工具
7. `/init`：生成 `AGENTS.md`
8. `/compact`：压缩长上下文
9. `/debug-config`：查配置覆盖来源
10. `/new` `/resume` `/fork`：线程管理

---

## 4. IDE 插件端（VS Code/Cursor 等）

## 4.1 一句话原则

插件本质上调用的是 Codex CLI。  
所以先把 CLI 跑通，再装插件，成功率最高。

## 4.2 官方插件设置项（重点）

OpenAI 官方文档给出的主要设置包括：

1. `chatgpt.cliExecutable`
   - 开发用途，指定 CLI 可执行文件路径
2. `chatgpt.commentCodeLensEnabled`
   - TODO 注释上显示 CodeLens，直接让 Codex 处理
3. `chatgpt.localeOverride`
   - UI 语言覆盖
4. `chatgpt.openOnStartup`
   - 插件启动后是否自动聚焦侧边栏
5. `chatgpt.runCodexInWindowsSubsystemForLinux`
   - Windows 下是否在 WSL 运行 Codex（官方强调更安全/更稳）

## 4.3 插件命令（Command Palette）

高频命令 ID：

1. `chatgpt.newChat`
2. `chatgpt.addToThread`
3. `chatgpt.addFileToThread`
4. `chatgpt.implementTodo`
5. `chatgpt.newCodexPanel`
6. `chatgpt.openSidebar`

## 4.4 插件 slash commands

官方列出的常用项：

1. `/status`
2. `/review`
3. `/local`
4. `/cloud`
5. `/cloud-environment`
6. `/auto-context`
7. `/feedback`

---

## 5. App 端（桌面客户端）

## 5.1 三种运行模式

1. `Local`：直接改当前项目
2. `Worktree`：隔离改动，适合并行任务
3. `Cloud`：远端环境执行

## 5.2 App 设置页你需要懂什么

官方设置分组可理解为：

1. `General`：打开文件方式、输出显示、防休眠
2. `Appearance`：主题/字体
3. `Notifications`：通知策略
4. `Agent configuration`：审批/沙箱等核心行为
5. `Git`：分支命名、push 策略、commit/PR 生成提示
6. `Integrations & MCP`：MCP 连接（与 CLI/插件共享）
7. `Personalization`：`friendly | pragmatic | none`
8. `Archived threads`：归档会话管理

## 5.3 App 常用快捷键（官方）

1. `Cmd+Shift+P` / `Cmd+K`：命令菜单
2. `Cmd+,`：设置
3. `Cmd+N`：新线程
4. `Cmd+J`：终端开关
5. `Ctrl+L`：清终端
6. `Ctrl+M`：语音输入

## 5.4 App slash commands（官方）

1. `/status`
2. `/review`
3. `/plan`
4. `/mcp`
5. `/feedback`

## 5.5 Worktree 关键行为（官方高频坑）

1. Worktree 仅 Git 项目可用
2. 默认是 `detached HEAD`
3. 同一分支不能同时在多个 checkout 被检出
4. Handoff 用于 Local 与 Worktree 间安全迁移
5. 默认会保留最近一定数量 worktree（官方文档示例是 15）

## 5.6 Local environments（很多人忽略）

用途：

1. 新建 worktree 时自动跑 setup（如 `npm install && npm run build`）
2. 定义项目 Action 按钮（Run/Test/Lint）
3. 支持按平台写不同脚本

## 5.7 Automations（要懂安全边界）

1. 自动化在本地 App 跑，App 必须开着
2. Git 项目在后台 worktree 执行
3. 非 Git 项目直接在项目目录执行
4. 默认沿用你的 sandbox/approval 设置
5. 高频任务要清理旧 worktree，避免磁盘堆积

## 5.8 Windows 官方要点

1. 安装：Microsoft Store 或 `winget install Codex -s msstore`
2. 默认 agent：Windows-native（PowerShell）
3. 可切 WSL agent，但切换后要重启 App
4. 集成终端可选 PowerShell / CMD / Git Bash / WSL
5. 如果 CLI 跑在 WSL，默认不会自动和 Windows App 共用 `~/.codex`，需要显式同步或设置 `CODEX_HOME`

---

## 6. 第三方线路：Packy / 飞书方案怎么放到体系里

## 6.1 Packy（文档可直接落地）

普通线路示例：

```toml
disable_response_storage = true
model = "gpt-5.2"
model_provider = "packycode"
model_reasoning_effort = "xhigh"
model_verbosity = "high"

[features]
web_search_request = true

[model_providers.packycode]
base_url = "https://www.packyapi.com/v1"
name = "packycode"
requires_openai_auth = true
wire_api = "responses"
```

逐字段解释：

1. `disable_response_storage = true`：减少响应持久化，偏隐私场景。
2. `model = "gpt-5.2"`：默认模型名，具体可用性取决于服务商。
3. `model_provider = "packycode"`：默认 provider 指向 `packycode`。
4. `model_reasoning_effort = "xhigh"`：高强度推理，质量高但更慢。
5. `model_verbosity = "high"`：输出更详细。
6. `[features] web_search_request = true`：开启网络搜索请求能力。
7. `[model_providers.packycode]`：定义该 provider 连接参数。
8. `base_url`：Packy 线路地址（普通版）。
9. `requires_openai_auth = true`：需要 OpenAI 认证链路兼容。
10. `wire_api = "responses"`：使用 responses 协议。

包月线路差异：只改 `base_url` 为 `https://codex-api.packycode.com/v1`。

## 6.2 飞书 `KaQ...`（rpcod 路线）

可提炼重点：

1. 有 CLI、插件、App 三条使用路径
2. 强调模型可能不能在 UI 下拉直接选，需要手动改 `config.toml`
3. 给了 App 路线下 `codex` provider 的配置示例（含高权限组合）

## 6.3 飞书 `Iq8...`（yunyi 路线）

可提炼重点：

1. 给了自动激活和手动激活两条路径
2. 手动配置核心是 `[model_providers.yunyi]` + `experimental_bearer_token`
3. 常见报错：`YUNYI_KEY` 环境变量缺失（文档建议调整冲突配置）
4. 权限问题场景给了 `sudo npx yunyi-activator`（Linux/macOS）

## 6.4 B 站 `BV11erUBUEEX`

该视频页面简介里的学习路径非常适合新手按节奏走：

1. 安装 CLI + IDE
2. 首次运行
3. AGENTS.md
4. 环境配置
5. 提示词模式
6. 进阶到无头模式 + SDK

---

## 7. 小白 30 分钟落地路线（实战版）

1. 安装 Node + Codex CLI，跑通 `codex --version`
2. 用官方路线先跑通一次最小配置（别先上第三方）
3. 新建一个测试仓库写 `AGENTS.md`
4. 装 IDE 插件，验证 `/status` 与 `/review`
5. 装 App，先用 `Local`，再试 `Worktree`
6. 最后再切换到 Packy / yunyi / rpcod 线路

---

## 8. 排障矩阵（出问题按这个顺序）

1. `codex --version` 是否正常
2. `codex login status` 是否正常
3. `model_provider` 与 `[model_providers.<id>]` 是否一致
4. `base_url` 是否写对（普通/包月常混）
5. key 是否在正确位置（环境变量或 `auth.json`）
6. 是否被项目 `.codex/config.toml` 或 `--profile` 覆盖
7. 插件/App 是否继承了同一份配置目录
8. MCP 是否 `required=true` 导致启动即失败
9. Windows 是否需要切换 WSL agent 并重启
10. 权限失败优先看 `approval_policy + sandbox_mode` 组合

---

## 9. 这篇是否“讲全”的自检清单

看完你应该能回答这些问题：

1. 三端为什么共享配置，冲突时先查哪里？
2. CLI 的 `--full-auto` 与 `--yolo` 区别是什么？
3. 插件里哪些设置是“插件自身”，哪些要去 `config.toml` 改？
4. App 的 Local/Worktree/Cloud 何时选哪一个？
5. Worktree 为什么会出现“同分支不能同时 checkout”？
6. 第三方线路切换时，最容易写错哪三个字段？

如果你 6 个都能答出来，说明你已经不是“会抄配置”，而是“会排障会迁移”。

---

## 10. GitHub Pages 图片路径规范（避免发布后看不到图）

1. 图片文件放到：`public/notes/images/codex/`
2. 文章里这样写：`![说明](notes/images/codex/xxx.png)`
3. 不要写本机路径：`C:\Users\...`
4. 不要写根路径：`/notes/images/...`（你的站点有子路径 `/HaonanKnowledgeBlog/`）
5. 发布前自检：图片文件是否已 `git add` 并随文档一起提交

示例：

```md
![App 设置总览](notes/images/codex/codex-06-app-settings-overview.png)
```

逐行解释：

1. `![App 设置总览](...)`：Markdown 图片语法。
2. `notes/images/codex/...`：使用站点可访问路径，发布到 GitHub Pages 后能直接显示。

---

## 参考来源（本篇使用）

### OpenAI 官方

1. <https://developers.openai.com/codex/cli/features>
2. <https://developers.openai.com/codex/cli/reference>
3. <https://developers.openai.com/codex/cli/slash-commands>
4. <https://developers.openai.com/codex/ide/settings>
5. <https://developers.openai.com/codex/ide/commands>
6. <https://developers.openai.com/codex/ide/slash-commands>
7. <https://developers.openai.com/codex/app/features>
8. <https://developers.openai.com/codex/app/settings>
9. <https://developers.openai.com/codex/app/commands>
10. <https://developers.openai.com/codex/app/windows>
11. <https://developers.openai.com/codex/app/worktrees>
12. <https://developers.openai.com/codex/app/local-environments>
13. <https://developers.openai.com/codex/app/automations>
14. <https://developers.openai.com/codex/config-basic>
15. <https://developers.openai.com/codex/config-reference>

### 第三方/社区

1. <https://docs.packyapi.com/docs/cli/3-codex.html>
2. <https://ncnnujysujcj.feishu.cn/wiki/KaQZwRaE6ivzlOku5rwcRdTHnPf>
3. <https://dcnp82fx8qqw.feishu.cn/wiki/Iq8KwRLF7i9pg4kN83HckdOVnUc>
4. <https://www.bilibili.com/video/BV11erUBUEEX>
