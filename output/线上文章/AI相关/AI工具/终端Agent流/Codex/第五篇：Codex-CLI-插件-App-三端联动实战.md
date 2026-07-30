---
title: "第五篇：Codex CLI / 插件 / App 三端联动实战"
slug: "ai-agent-codex-codex-cli-app-afad6d17"
summary: "详细讲解 Codex CLI、插件和 App 三端共用配置、认证与规则的关系，帮助排查“CLI 能用但插件或 App 不同步”的典型问题。"
category: "Codex"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "Codex"
tags:
  - "Codex"
  - "CLI"
  - "插件"
  - "App"
  - "配置联动"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf6e"
originalSlug: "ai-agent-codex-codex-cli-app-afad6d17"
originalStatus: "published"
publishedAt: "2026-06-04T13:41:34.293Z"
updatedAt: "2026-07-30T14:24:30.438Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 第五篇：Codex CLI / 插件 / App 三端联动实战

> 更新时间：2026-07-26（按本机当前 Codex CLI 0.146 系列与 Windows App 26.721.4979.0 复核）
> 定位：主线 03（三端统一与联动排障）。
> 前置：第三篇（先懂配置原理和字段，再做联动最稳）。
> 下一篇建议：第六篇（命令与配置速查）。
> 本篇不展开：字段字典和命令全集（看第三篇、第六篇）。
> 命令/配置看不懂时：回查第六篇《命令与配置文件速查》。
> 如果主人要查“多文件夹项目 / Worktrees / PR Chat / Browser / Scheduled tasks / Remote / Windows-native 到底在今天怎么用”，请直接看第八篇桌面 App 专题；本篇负责三端关系和联动排障。
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
2. 项目 `.codex/config.toml`（仅信任项目加载；不能覆盖 provider、认证、通知、profile 选择等本机字段）
3. `--profile <name>` 加载的 `$CODEX_HOME/profile-name.config.toml`
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
model = "gpt-5.6-terra"
model_reasoning_effort = "medium"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[history]
persistence = "save-all"
```

逐字段解释：

1. `model_provider = "openai"`：默认走官方 OpenAI 提供方。
2. `model = "gpt-5.6-terra"`：日常开发使用平衡档；最难的质量优先任务再切 `gpt-5.6-sol`。
3. `model_reasoning_effort = "medium"`：推理强度中档，平衡速度与质量。
4. `approval_policy = "on-request"`：风险动作需人工确认。
5. `sandbox_mode = "workspace-write"`：只允许改当前工作区。
6. `[history] persistence = "save-all"`：保存历史会话，便于后续恢复与审计。
7. 需要最新网页资料时临时使用 `codex --search`，不再把旧版 cached 搜索写进所有默认模板。

## 3.4 CLI 关键参数（按使用频率）

1. `--model/-m`：临时切模型
2. `--sandbox/-s`：`read-only | workspace-write | danger-full-access`
3. `--ask-for-approval/-a`：`untrusted | on-request | never`
4. `-c key=value`：临时覆盖配置
5. `--profile/-p`：加载 profile
6. `--cd/-C`：指定工作目录
7. `--add-dir`：增加可写目录
8. `--search`：临时使用 live web search
9. `--strict-config`：遇到未知配置字段时直接报错，适合升级后排查旧配置
10. `--ephemeral`：不把本次非交互会话保存到本地历史
11. `--ignore-user-config`：诊断用户配置污染时临时跳过 `config.toml`
12. `--dangerously-bypass-approvals-and-sandbox`：正式的完全绕过参数，只能用于外部已经隔离的环境

旧资料里的 `--full-auto` 已被当前 CLI 移除。`--yolo` 仍可能作为隐藏兼容别名被接受，但不应继续作为教程主入口。

## 3.5 CLI 核心命令（必须熟）

1. `codex`：交互模式
2. `codex exec "..."`：非交互自动化
3. `codex exec --json "..."`：机器可读输出
4. `codex exec resume --last "..."`：续跑上次任务
5. `codex resume`：恢复交互会话
6. `codex mcp ...`：管理 MCP 服务
7. `codex doctor --summary`：综合检查安装、认证、配置、MCP、网络和本地状态
8. `codex update`：更新 CLI
9. `codex plugin ...`：查看市场、安装和移除插件
10. `codex review`：非交互代码审查
11. `codex fork`：从历史会话分叉新线程
12. `codex archive|unarchive|delete`：管理已保存会话
13. `codex app <path>`：从终端打开指定工作区的桌面 App
14. `codex cloud ...`：提交、查看和应用云端任务
15. `codex features list|enable|disable`：功能开关

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

IDE 扩展会复用 Codex CLI、`~/.codex/config.toml` 和项目规则，但它已经不是“只包了一层 CLI 的聊天壳”。
正确顺序仍然是先把 CLI 跑通，再在 IDE 里使用 Agent、Chat、Cloud delegation 等入口，成功率最高。

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

## 5. App 端：这里只讲三端联动边界

从桌面版 `26.707` 起，Codex 已并入 macOS 和 Windows 的 ChatGPT desktop app。桌面 App 的版本更新、Voice、多文件夹项目、Local / Worktree / Cloud、Git / PR Chat、Browser、Computer Use、Scheduled tasks、Remote 和 Windows / WSL 实战，统一看[第八篇：Codex 桌面 App 当前功能与 Windows 实战](#/note/AI工具/02_终端Agent流/Codex/08_Codex桌面App当前功能与Windows实战)，本篇不重复维护。

## 5.1 哪些内容可以共用

1. 同一项目里的 `AGENTS.md`、项目 `.codex/config.toml`、skills 和 MCP 配置，仍然是跨入口协作的基础
2. Windows-native App 与 Windows CLI 默认都从 `%USERPROFILE%\.codex` 读取本机 Codex 状态
3. Git 仓库、分支、工作树和磁盘文件是共同事实，任何入口修改后都应重新检查 `git status`
4. 插件安装后通常要新开 chat 或 CLI session，新的 skill、connector 和 MCP 工具才会完整进入上下文

多文件夹项目要额外注意：新 chat、Git 操作，以及 `AGENTS.md`、skills、`config.toml` 的自动发现都以 **primary folder** 为准；secondary folders 可以搜索、读取和编辑，但不会替代主目录的配置根。

## 5.2 哪些内容不能假设同步

1. App 内置的 Codex 版本和系统里单独安装的 CLI 版本可以不同
2. Windows App 与 WSL CLI 默认使用不同的 home 和 `CODEX_HOME`
3. ChatGPT 登录、API key、第三方 provider、connector OAuth 是不同认证层
4. App 专属的 Worktree、Review、Browser、Computer Use、Remote 和 Scheduled 状态不会变成 CLI 里的同名界面状态
5. 账号套餐、工作区策略、管理员要求和灰度发布会让不同入口出现不同能力

## 5.3 App 联动异常的最短排障路线

```powershell
codex --version
codex doctor --summary
codex login status
codex plugin list
codex mcp list
```

再依次确认 App 版本、当前账号/工作区、primary folder、Windows-native 或 WSL、`CODEX_HOME`、当前 Git checkout，以及是否需要重启 App 或新开 chat。若只是 App 某个按钮或工作流变化，直接到第八篇按 App 专用排障顺序处理。

---

## 6. 第三方线路：Packy / 飞书方案怎么放到体系里

## 6.1 Packy（文档可直接落地）

普通线路示例：

```toml
disable_response_storage = true
model = "gpt-5.5"
model_provider = "packycode"
model_reasoning_effort = "high"
model_verbosity = "high"

[model_providers.packycode]
base_url = "https://www.packyapi.com/v1"
name = "packycode"
requires_openai_auth = true
wire_api = "responses"
```

逐字段解释：

1. `disable_response_storage = true`：减少响应持久化，偏隐私场景。
2. `model = "gpt-5.5"`：当前示例模型名，具体可用性取决于服务商后台。
3. `model_provider = "packycode"`：默认 provider 指向 `packycode`。
4. `model_reasoning_effort = "high"`：高强度推理，质量高但更慢；`xhigh` 是否可用取决于模型。
5. `model_verbosity = "high"`：输出更详细。
6. `[model_providers.packycode]`：定义该 provider 连接参数。
7. `base_url`：Packy 线路地址（普通版）。
8. `requires_openai_auth = true`：需要 OpenAI 认证链路兼容。
9. `wire_api = "responses"`：使用 responses 协议。
10. 网页搜索属于 Codex 客户端能力，需要最新资料时优先通过当前版本的 `--search` 或 App 对应入口启用。

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
6. 是否被项目 `.codex/config.toml` 或 profile 文件覆盖
7. 插件/App 是否继承了同一份配置目录
8. MCP 是否 `required=true` 导致启动即失败
9. Windows 是否需要切换 WSL agent 并重启
10. 权限失败优先看 `approval_policy + sandbox_mode` 组合

---

## 9. 这篇是否“讲全”的自检清单

看完你应该能回答这些问题：

1. 三端为什么共享配置，冲突时先查哪里？
2. 为什么新文档应使用显式审批/沙箱参数，而不继续照抄已移除的 `--full-auto`？
3. 插件里哪些设置是“插件自身”，哪些要去 `config.toml` 改？
4. 为什么 App 内置 Codex 和系统 CLI 的版本、登录与功能不能假设完全同步？
5. 为什么 App 的具体工作流统一到第八篇维护？
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
14. <https://developers.openai.com/codex/app/review>
15. <https://learn.chatgpt.com/docs/browser?surface=app>
16. <https://developers.openai.com/codex/app/computer-use>
17. <https://developers.openai.com/codex/changelog>
18. <https://developers.openai.com/codex/config-basic>
19. <https://developers.openai.com/codex/config-reference>

### 第三方/社区

1. <https://docs.packyapi.com/docs/cli/3-codex.html>
2. <https://ncnnujysujcj.feishu.cn/wiki/KaQZwRaE6ivzlOku5rwcRdTHnPf>
3. <https://dcnp82fx8qqw.feishu.cn/wiki/Iq8KwRLF7i9pg4kN83HckdOVnUc>
4. <https://www.bilibili.com/video/BV11erUBUEEX>
