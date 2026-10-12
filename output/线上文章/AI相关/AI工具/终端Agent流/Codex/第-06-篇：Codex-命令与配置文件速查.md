---
title: "第 06 篇：Codex 命令与配置文件速查"
slug: "ai-agent-codex-codex-9cf3fc01"
summary: "按 Codex CLI 0.162.1 完整列出内置斜杠命令、别名、行内参数与任务状态限制，以及公开 CLI 命令树和全部子命令专属参数，修正旧版命令及配置说明。"
category: "Codex"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "Codex"
tags:
  - "AGENTS"
  - "Codex"
  - "命令"
  - "速查"
  - "配置文件"
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf78"
originalSlug: "ai-agent-codex-codex-9cf3fc01"
originalStatus: "published"
publishedAt: "2026-06-04T13:41:34.294Z"
updatedAt: "2026-09-13T13:42:49.780Z"
exportedAt: "2026-09-29T13:16:41.461Z"
---
# 第 06 篇：Codex 命令与配置文件速查

> 更新时间：2026-10-12。
> 核对范围：CLI 接口与配置按稳定版 `0.162.1` 的帮助、配置 schema 和官方发布记录核实；官方网页直接抓取返回 403，产品资料另参考官方文档的检索索引。桌面/IDE 的账号权限与灰度界面不据此推定。完整字段看第三篇，完整命令看第六篇，升级差异看第九篇。
> 定位：工具底座（全系列命令与配置文件统一说明）。
> 使用方式：读任何一篇时，遇到“这条命令是干嘛的”就回查本篇。
> 小白读完目标：你应该能分清“命令层 / 配置层 / 项目规则层”，并且看到一个命令或字段名时，知道它属于哪一层。

章节导航（点击跳转）：

[[toc]]

---

## 0. 先讲清一件事：你到底在改什么

很多新手把 Codex 当成“一个命令”，其实它是三层：

1. 命令层：你在终端执行 `codex ...`
2. 配置层：你在 `config.toml` 里定义默认行为
3. 项目规则层：你在 `AGENTS.md` 写团队规范

只要把这三层分开理解，就不会再“改了没生效”。

---

## 1. 配置文件职责（必记）

| 文件 | 作用 | 什么时候会生效 | 新手建议 |
|---|---|---|---|
| `~/.codex/config.toml` | 用户级默认配置（模型、权限、MCP 等） | 大多数场景 | 先把默认值写在这里 |
| `<repo>/.codex/config.toml` | 项目级覆盖配置 | 在受信任仓库内运行时 | 只放项目特有差异，会过滤明确列出的宿主字段；精确名单见第三篇 19.5 节 |
| `~/.codex/auth.json` | 登录凭据（或 keyring） | 需要鉴权时 | 视为密码文件，绝不提交仓库 |
| `~/.codex/AGENTS.md` | 全局协作习惯 | 所有项目 | 只放通用规则 |
| `<repo>/AGENTS.md` | 项目规则（测试、格式、流程） | 当前项目 | 团队统一维护 |
| `~/.codex/<profile>.config.toml` | profile 场景配置 | `codex --profile <profile>` 时 | 给审计、日常开发、CI 分别维护独立文件 |

生效优先级（高 -> 低）：

1. 命令行参数（如 `--model`、`--sandbox`）
2. 项目 `.codex/config.toml`
3. `--profile <name>`
4. 用户 `~/.codex/config.toml`
5. 系统级配置
6. 内置默认值

---

## 2. CLI 命令作用字典（小白高频）

| 命令 | 作用 | 什么时候用 | 注意点 |
|---|---|---|---|
| `node -v` | 查看 Node 版本 | 安装前/排错时 | 建议 Node 20+ |
| `npm -v` | 查看 npm 版本 | 安装前/排错时 | 与 Node 配套检查 |
| `npm i -g @openai/codex` | 全局安装 Codex CLI | 首次安装 | 需网络可用 |
| `codex --version` | 查看 Codex 版本 | 验证是否安装成功 | 不能输出版本说明安装有问题 |
| `codex` | 启动交互会话 | 日常编码协作 | 默认在当前目录上下文工作 |
| `codex agents` | 浏览共享本地 app-server 上的 agent 会话 | 并行任务盘点 | 依赖本地 app-server 状态 |
| `codex login` | 浏览器登录 | 交互式登录 | 适合个人本地开发 |
| `codex login --device-auth` | 设备码登录 | 无浏览器环境 | 服务器常用 |
| `codex login --with-api-key` | 用 API key 登录 | 自动化/脚本场景 | key 需安全保存 |
| `codex login status` | 查看登录状态 | 鉴权报错时 | 先排查它最快 |
| `codex --model <name>` | 临时切模型 | 单次任务 | 不改动配置文件 |
| `codex --profile <name>` | 用指定 profile 运行 | 场景切换（开发/审计） | profile 来自 `~/.codex/<name>.config.toml` |
| `codex update` | 更新 Codex CLI | 版本升级 | 当前版本提供的内置升级入口 |
| `codex doctor --summary` | 综合诊断安装、认证、配置、MCP、网络和状态库 | CLI 异常时 | 比直接重装更适合作为第一检查入口 |
| `codex --strict-config` | 拒绝未知配置字段 | 升级后检查旧配置 | 适合发现拼错、移除或尚未支持的字段 |
| `codex --yolo` | 旧版隐藏危险别名 | 阅读历史资料 | 当前仍可能被接受，但新文档应使用正式的危险绕过参数说明 |
| `codex exec "..."` | 非交互执行单任务 | CI/批处理 | 沿用有效配置/约束；只读检查请显式指定 --sandbox read-only |
| `codex exec --json "..."` | 输出机器可读事件流 | 脚本集成 | 便于日志与自动解析 |
| `codex exec --ephemeral "..."` | 非交互执行且不保存会话文件 | 临时检查 | 适合不需要恢复的短任务 |
| `codex exec resume --last "..."` | 续跑上次 exec 任务 | 中断恢复 | 依赖历史记录 |
| `codex resume` | 恢复交互会话 | 上次会话继续 | 适合长任务 |
| `codex fork --last` | 从最近会话分叉 | 并行尝试另一种方案 | 不破坏原线程上下文 |
| `codex archive\|unarchive\|delete` | 归档、恢复或删除保存的会话 | 会话整理 | `delete` 不可恢复，先确认目标 |
| `codex review --uncommitted` | 非交互审查当前改动 | 提交前检查 | 也支持 `--base`、`--commit` |
| `codex mcp add ...` | 添加 MCP 服务 | 接外部工具 | 推荐先本地测试 |
| `codex mcp list` | 查看 MCP 状态 | MCP 排错 | 看是否启动成功 |
| `codex plugin list` | 查看插件市场与安装状态 | 管理插件 | 区分 marketplace、plugin、skill 和 MCP |
| `codex app <path>` | 在桌面 App 打开工作区 | 图形化工作流 | 桌面 App 未安装时会进入安装流程 |
| `codex cloud ...` | 提交、查看、比较和应用云端任务 | 云端委派 | 当前仍带实验边界，以 `--help` 为准 |
| `codex app-server` | 启动/管理本地 app-server | 本地协议集成或调试 | 当前为 experimental，不等同于外部 MCP server |
| `codex queue ...` | 向已有会话排队发送消息 | 长任务中追加上下文 | 先确认目标 session |
| `codex features list` | 查看功能开关 | 诊断功能状态 | 和版本关联较大 |

旧资料里的 `--full-auto` 已被当前 CLI 移除，并且当前审批策略也没有 `on-failure`。日常开发请明确写 `--ask-for-approval on-request --sandbox workspace-write`。

---

## 3. 全部 CLI Slash Commands（0.162.1）

本表逐项核对稳定版内置命令枚举及菜单门控。输入 `/` 打开菜单并搜索；命令需要放在 composer 起始位置。“允许入口”表示任务运行中允许调度此命令，不保证操作立即完成；“参数=是”只表示解析器接受行内参数，不能据此自行猜所有参数语法。side conversation 会进一步限制菜单，模型、server 能力、平台和 feature flags 也会影响可见性。

| 命令 / 别名 | 用途 | 行内参数 | 忙碌时 | 边界与示例 |
|---|---|---|---|---|
| `/model` | 选择模型与推理强度 | 否 | 允许入口 | 按账号/provider 实际列表；切换不保证当前进行中的步骤立即换模型 |
| `/daybreak` | 启停 Daybreak 偏好 | 否 | 允许入口 | 需 features.cli_daybreak opt-in、合格登录和模型/程序支持 |
| `/ide` | 带入 IDE 选中内容、打开文件等 | 是 | 允许入口 | CLI 与 IDE 连接/支持情况决定上下文可用性 |
| `/permissions` | 选择 Codex 可做的动作 | 否 | 允许入口 | 权限 profile、审批者和 managed constraints 共同决定 |
| `/keymap` | 配置 TUI 快捷键 | 是 | 需空闲 | 支持参数；具体语法由菜单提供，写入 tui.keymap |
| `/vim` | 切换 composer Vim 模式 | 否 | 需空闲 | 影响输入行为，默认值可保存在 tui.vim_mode_default |
| `/setup-default-sandbox` | 安装提升权限的 Agent 沙箱 | 否 | 需空闲 | Windows/允许此操作的环境才显示 |
| `/experimental` | 切换实验菜单功能 | 否 | 需空闲 | 有些变更要求重启；开发中开关不一定出现在菜单 |
| `/approve` | 批准一次最近自动审核拒绝动作的重试 | 否 | 允许入口 | 不是永久关闭审批，也不是 Full Access 开关 |
| `/memories` | 配置记忆使用与生成 | 否 | 需空闲 | 需记忆能力与设置支持；不是当前聊天上下文清空 |
| `/skills` | 查找和调用 skills | 否 | 允许入口 | 同时支持 $skill-name；已安装插件和发现路径决定清单 |
| `/import` | 导入 Claude Code 设置、项目及近期聊天 | 否 | 需空闲 | 审阅可迁移项；不要假设支持所有 agent 格式 |
| `/hooks` | 查看和管理生命周期 Hooks | 否 | 允许入口 | Hook 启用状态与来源信任分开 |
| `/review` | 审查当前代码改动 | 是 | 需空闲 | 可附自定义重点；不是 git commit |
| `/rename` | 改当前线程名称 | 是 | 允许入口 | 与 /title 的终端标题配置不同 |
| `/new` | 开始新 chat | 是 | 需空闲 | 可带初始 prompt；不会自动提交或清理工作树 |
| `/archive` | 归档当前会话 | 否 | 允许入口 | 保留会话；与永久删除分开 |
| `/delete` | 永久删除当前会话 | 否 | 需空闲 | 按提示确认；不会替你清理仓库文件 |
| `/resume` | 恢复保存的 chat | 是 | 允许入口 | 支持选择器/参数，历史归档状态影响可见性 |
| `/fork` | 从当前 chat 分叉 | 是 | 需空闲 | 上下文分叉；工作树隔离须另选 worktree |
| `/worktree` | 在新 Git worktree 开始或继续会话 | 否 | 需空闲 | worktrees 功能、Git 项目和信任状态决定可用性 |
| `/app` | 到桌面 App 继续此会话 | 否 | 允许入口 | macOS/Windows 显示；不是新建 Cloud 任务 |
| `/init` | 生成项目 AGENTS.md | 否 | 需空闲 | 检查现有文件和生成内容后维护项目规则 |
| `/compact` | 压缩会话历史以控制上下文 | 否 | 需空闲 | 会影响继续任务的上下文；关键信息应写入文件 |
| `/recap` | 立即总结当前会话 | 否 | 需空闲 | 用于恢复理解；不要等同于压缩历史 |
| `/plan` | 切换 Plan 模式 | 是 | 需空闲 | 可附规划任务；能力门控会影响显示 |
| `/voice` | 开始/停止语音，或配置设备与 voice | 是 | 允许入口 | 支持 /voice settings；依平台运行时、账号和语音能力 |
| `/goal` | 设置/查看长任务目标 | 是 | 允许入口 | 目标有状态与预算；可见性由 goal 能力决定 |
| `/agents` | 打开 Agent Command Center | 否 | 允许入口 | 查看跨任务会话；与当前会话子代理列表分开 |
| `/side` | 启动临时分叉的 side conversation | 是 | 允许入口 | side 中允许的 slash 命令比主会话少 |
| `/btw` | 启动临时旁支对话 | 是 | 允许入口 | 与 /side 同类入口 |
| `/copy` | 复制最近回答或 transcript 中选定部分 | 否 | 允许入口 | 0.162 支持块导航；Android 构建不显示 |
| `/export` | 导出会话 Markdown | 是 | 需空闲 | 可以带参数；注意导出会话包含的项目信息 |
| `/raw` | 切换便于选择复制的原始滚动输出 | 是 | 允许入口 | 支持参数；是显示方式，不是原始模型 API 日志 |
| `/tui` | 选择下次启动使用的 TUI 模式 | 否 | 需空闲 | 更改下次启动行为；不是立刻升级 CLI |
| `/diff` | 显示 Git diff，包括未跟踪文件 | 否 | 允许入口 | 检查工作树；内容不是只来自当前 chat |
| `/mention` | 引用文件作为上下文 | 否 | 允许入口 | 检查路径和引用范围 |
| `/status` | 查看会话配置和 token 使用 | 否 | 允许入口 | 当前值优先于模板推断 |
| `/daemon` | 管理本地后台 server | 否 | 允许入口 | 更新/重启等能力依版本；0.162.1 修复启动兼容性判断 |
| `/warnings` | 查看保留的警告与诊断 | 否 | 允许入口 | 0.159 起已审阅项关闭后清除，k 可保留 |
| `/cd` | 更改当前工作目录 | 是 | 需空闲 | 重新确认 Git 根、项目规则和可写范围 |
| `/pwd`；`/cwd` | 显示当前目录 | 是 | 允许入口 | /cwd 为别名；支持参数不等于任意参数语法 |
| `/usage` | 查看账号用量/可用重置及活动统计 | 是 | 允许入口 | 依账号、server token activity 能力显示 |
| `/debug-config` | 显示配置层级与 requirements 来源 | 否 | 允许入口 | 查实际覆盖链；不同于让模型猜配置 |
| `/title` | 配置终端窗口标题包含的字段 | 否 | 允许入口 | 线程改名用 /rename |
| `/statusline` | 配置底部状态栏字段 | 否 | 允许入口 | 持久化到 tui.status_line |
| `/theme` | 选择语法高亮主题 | 否 | 需空闲 | 不是桌面浅色/深色系统主题 |
| `/pets`；`/pet` | 选择/隐藏终端宠物 | 是 | 需空闲 | /pet 为兼容别名 |
| `/mcp` | 查看 MCP 工具、详情与登录 | 是 | 允许入口 | /mcp verbose；0.161 起 /mcp login &lt;name&gt; |
| `/apps` | 管理 Apps/连接器 | 否 | 允许入口 | 需 connectors 能力；与 OS 桌面应用访问不同 |
| `/plugins` | 浏览插件市场和安装/启用状态 | 否 | 允许入口 | 需插件能力；当前支持刷新安装/更新后的工具与 skills，未刷新时再按提示重开会话 |
| `/logout` | 退出 Codex 登录 | 否 | 需空闲 | 会影响后续鉴权 |
| `/quit` | 退出当前 CLI | 否 | 允许入口 | 不是删除历史会话 |
| `/exit` | 退出当前 CLI | 否 | 允许入口 | 与 /quit 同义 |
| `/feedback` | 向维护者发送日志反馈 | 否 | 允许入口 | 提交前检查待发送诊断内容 |
| `/ps` | 列出后台终端 | 否 | 允许入口 | 只查看，不自动停止 |
| `/stop`；`/clean` | 停止全部后台终端 | 否 | 允许入口 | /clean 为旧别名；与 Esc 中断当前回答不同 |
| `/clear` | 清空终端并开始新 chat | 是 | 需空闲 | 不清理仓库文件或 Git diff |
| `/subagents` | 切换当前会话的子代理 | 否 | 允许入口 | 旧资料 /agent 与当前 /agents 不可混用 |

### 3.1 调试与内部保留命令

| 命令 | 用途 | 行内参数 | 忙碌时 | 状态 |
|---|---|---|---|---|
| `/rollout` | 打印 rollout 路径 | 否 | 允许入口 | 仅 debug 构建可见 |
| `/test-approval` | 测试审批请求 | 否 | 允许入口 | 仅 debug 构建可见 |
| `/debug-m-drop` | 内部记忆调试 | 否 | 需空闲 | 源码标注 DO NOT USE，不作为日常命令 |
| `/debug-m-update` | 内部记忆调试 | 否 | 需空闲 | 源码标注 DO NOT USE，不作为日常命令 |

### 3.2 动态服务档位与已变化的入口

`/fast` 等服务档位命令由服务端模型元数据动态提供，不在固定的 `SlashCommand` 枚举中；以当前 `/` 菜单和 `/model` 可选 tier 为准。`service_tier` 与 `model_reasoning_effort` 分别控制服务调度和思考投入，不能互相替代。不要凭旧截图声称所有账号必有 `/fast` 或某个 Ultra Fast 命令。

当前稳定版没有内置 `/personality`、`/agent`、`/cloud`、`/cloud-environment`、`/local`、`/ide-context` 或 `/config`。IDE 的命令单独看第五篇/第九篇；Cloud 的 CLI 入口是 `codex cloud`；当前会话子代理入口是 `/subagents`。**2026-10-12 main 开发分支** 已出现 `/config`，但它不属于 0.162.1，本节不把开发分支当稳定版承诺。

### 3.3 最值得练熟的更新

```text
/mcp verbose
/mcp login <server-name>
/recap
/copy
/raw
/tui
/daemon
/agents
/subagents
/voice settings
```

`/recap` 先恢复当前任务理解，`/compact` 再管理上下文容量；`/rename` 改线程名称，`/title` 配终端标题。长任务追加普通消息可以 Queue 或 Steer；当前文档索引还记录输入 slash 后按 Tab 将其排到下一轮，实际支持与 TUI 输入设置有关。

完整依据：稳定版 slash 枚举与 `bottom_pane/slash_commands.rs` 的 feature、平台和 side conversation 过滤。官网文档索引可能仍保留旧入口，因此升级排障时优先对齐安装版本。

---

## 4. 高频配置字段作用字典

| 字段 | 作用 | 新手默认建议 | 专业补充 |
|---|---|---|---|
| `model` | 默认模型覆盖 | 未设或可用时 `gpt-6.1-sol` | 0.161 目录默认已更新；账号/server 与第三方 provider 的实际支持优先 |
| `model_provider` | 选择后端提供方 | `openai` | 与 `[model_providers.<id>]` 名称必须一致 |
| `[model_providers.<id>].base_url` | API 地址 | 官方默认地址或服务商地址 | 路线切换最常错字段 |
| `approval_policy` | 是否弹确认 | `on-request` | 自动化可用 `never`，但要配安全边界 |
| `sandbox_mode` | 技术权限范围 | `workspace-write` | `danger-full-access` 仅隔离环境用 |
| `web_search` | 联网搜索策略 | `cached`（本地聊天默认） | 可选 `cached \| indexed \| live \| disabled`；需要最新资料时使用 `codex --search` 或 `live` |
| `model_reasoning_effort` | 思考深度 | `medium` | 越高通常越慢、成本越高 |
| `~/.codex/<profile>.config.toml` | 场景配置文件 | `dev_safe` + `audit` 两套 | 用 `codex --profile <name>` 加载 |
| `[history].persistence` | 历史保存策略 | `save-all` | 合规敏感场景可设 `none` |
| `cli_auth_credentials_store` | 凭据存储策略 | schema/源码未设时为 `file` | 可显式选 `keyring` 或 `auto`，不能假设所有客户端都有 auth.json |
| `[mcp_servers.<id>].required` | 工具失败是否中断任务 | 默认 `false` | 核心工具可设 `true` |
| `[mcp_servers.<id>].enabled_tools` | 工具白名单 | 按需最小化 | 与 `disabled_tools` 组合治理 |

---

## 5. 一套小白安全起步模板（可直接抄）

```toml
model_provider = "openai"
model = "gpt-6.1-sol"
model_reasoning_effort = "medium"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[history]
persistence = "save-all"

```

审计 profile 建议另存为 `~/.codex/audit.config.toml`：

```toml
model = "gpt-6.1-sol"
approval_policy = "never"
sandbox_mode = "read-only"
model_reasoning_effort = "medium"
```

这套模板能覆盖两类日常：

1. 日常开发：默认配置
2. 安全审阅：`codex --profile audit`

---

## 6. 场景速查：我现在该用什么

| 你的目标 | 推荐命令/配置 |
|---|---|
| 先确认安装是否正常 | `node -v`、`npm -v`、`codex --version` |
| 登录异常排查 | `codex login status` |
| 改了配置没生效 | `/debug-config` + 检查优先级链 |
| 只想快速让它改代码 | `codex --sandbox workspace-write --ask-for-approval on-request`（先在测试仓库） |
| 需要脚本化跑批 | `codex exec --json "..."` |
| 要接外部工具 | `codex mcp add ...` + `codex mcp list` |
| 要安装或排查插件 | `codex plugin list` + `/plugins` + `/skills` |
| 要从终端打开桌面 App | `codex app <项目路径>` |
| 团队统一规范 | 仓库根维护 `AGENTS.md` + profiles |
| 高风险操作前收紧权限 | `sandbox_mode = "read-only"` 或 `approval_policy = "on-request"` |

---

## 7. 一句话总结（给新手）

1. 命令是“临时动作”
2. `config.toml` 是“默认策略”
3. `AGENTS.md` 是“团队规则”
4. `auth.json` 或系统凭据库中的登录缓存都属于“敏感凭据”
5. 看不懂时，先回到“优先级链”判断谁覆盖了谁
6. 桌面 App 的完整功能和 Windows 工作流统一看第八篇，不再把 App 当成 CLI 的附属说明


---

## 8. 全部 CLI 命令与参数（0.162.1）

以下清单直接读取本机稳定版的 **74 个命令/子命令帮助页面**（含根入口），不执行登录、任务、升级、删除或迁移。根层有 26 个公开业务子命令，另有 `help`；隐藏内部命令不作为公共接口。别名 `exec=e`、`apply=a`、`cloud-tasks=cloud`、`--yolo`、`--not-so-yolo` 仅为兼容入口。

### 8.1 完整命令树


| 命令 | 用途 | 状态 |
|---|---|---|
| `codex agents` | 查看共享后台服务器上的 Agent 会话 | 本版帮助公开 |
| `codex exec` | 非交互执行任务 | 本版帮助公开 |
| `codex review` | 非交互审查代码 | 本版帮助公开 |
| `codex login` | 管理登录 | 本版帮助公开 |
| `codex logout` | 移除保存的认证 | 本版帮助公开 |
| `codex mcp` | 管理外部 MCP 服务 | 本版帮助公开 |
| `codex plugin` | 管理插件与市场 | 本版帮助公开 |
| `codex app-server` | 实验 app-server 与协议工具 | experimental |
| `codex remote-control` | 实验远程控制 daemon 管理 | experimental |
| `codex app` | 从 CLI 打开桌面 App | 本版帮助公开 |
| `codex completion` | 生成 shell 自动补全 | 本版帮助公开 |
| `codex update` | 更新 CLI | 本版帮助公开 |
| `codex doctor` | 检查安装/配置/认证/运行环境健康 | 本版帮助公开 |
| `codex sandbox` | 在当前平台沙箱中执行命令 | 本版帮助公开 |
| `codex debug` | 模型目录、输入上下文和协议诊断 | 本版帮助公开 |
| `codex apply` | 将 Agent 生成的最新 diff 用 git apply 应用到本地 | 本版帮助公开 |
| `codex resume` | 恢复保存会话 | 本版帮助公开 |
| `codex queue` | 向已有会话排队发送消息 | 本版帮助公开 |
| `codex archive` | 归档会话 | 本版帮助公开 |
| `codex delete` | 永久删除会话 | 本版帮助公开 |
| `codex migrate-rollouts` | 检查/迁移旧会话到分页线程历史 | 本版帮助公开 |
| `codex unarchive` | 恢复归档 | 本版帮助公开 |
| `codex fork` | 分叉保存会话 | 本版帮助公开 |
| `codex cloud` | 实验云任务提交/查看/比较/应用 | experimental |
| `codex exec-server` | 实验远端执行服务 | experimental |
| `codex features` | 查询/启停功能开关 | 本版帮助公开 |
| `codex exec resume` | 非交互执行任务：续跑 | 本版帮助公开 |
| `codex exec fork` | 非交互执行任务：分叉 | 本版帮助公开 |
| `codex exec review` | 非交互执行任务：审查 | 本版帮助公开 |
| `codex login status` | 管理登录：查看状态 | 本版帮助公开 |
| `codex mcp list` | 管理外部 MCP 服务：列举 | 本版帮助公开 |
| `codex mcp get` | 管理外部 MCP 服务：读取详情 | 本版帮助公开 |
| `codex mcp add` | 管理外部 MCP 服务：添加 | 本版帮助公开 |
| `codex mcp remove` | 管理外部 MCP 服务：移除 | 本版帮助公开 |
| `codex mcp login` | 管理外部 MCP 服务：登录 | 本版帮助公开 |
| `codex mcp logout` | 管理外部 MCP 服务：退出登录 | 本版帮助公开 |
| `codex plugin add` | 管理插件与市场：添加 | 本版帮助公开 |
| `codex plugin list` | 管理插件与市场：列举 | 本版帮助公开 |
| `codex plugin marketplace` | 管理插件与市场：插件市场管理 | 本版帮助公开 |
| `codex plugin remove` | 管理插件与市场：移除 | 本版帮助公开 |
| `codex app-server daemon` | 实验 app-server 与协议工具：后台服务器管理 | experimental |
| `codex app-server proxy` | 实验 app-server 与协议工具：协议转发 | experimental |
| `codex app-server generate-ts` | 实验 app-server 与协议工具：生成 TypeScript 类型 | experimental |
| `codex app-server generate-json-schema` | 实验 app-server 与协议工具：生成 JSON schema | experimental |
| `codex remote-control start` | 实验远程控制 daemon 管理：启动 | experimental |
| `codex remote-control stop` | 实验远程控制 daemon 管理：停止 | experimental |
| `codex remote-control pair` | 实验远程控制 daemon 管理：配对 | experimental |
| `codex sandbox uninstall` | 在当前平台沙箱中执行命令：卸载 | 本版帮助公开 |
| `codex debug models` | 模型目录、输入上下文和协议诊断：模型目录 | 本版帮助公开 |
| `codex debug app-server` | 模型目录、输入上下文和协议诊断：app-server 诊断 | 本版帮助公开 |
| `codex debug prompt-input` | 模型目录、输入上下文和协议诊断：打印模型可见输入 | 本版帮助公开 |
| `codex cloud exec` | 实验云任务提交/查看/比较/应用：提交任务 | experimental |
| `codex cloud status` | 实验云任务提交/查看/比较/应用：查看状态 | experimental |
| `codex cloud list` | 实验云任务提交/查看/比较/应用：列举 | experimental |
| `codex cloud apply` | 实验云任务提交/查看/比较/应用：应用变更 | experimental |
| `codex cloud diff` | 实验云任务提交/查看/比较/应用：比较差异 | experimental |
| `codex exec-server forward` | 实验远端执行服务：执行服务转发 | experimental |
| `codex features list` | 查询/启停功能开关：列举 | 本版帮助公开 |
| `codex features enable` | 查询/启停功能开关：启用 | 本版帮助公开 |
| `codex features disable` | 查询/启停功能开关：禁用 | 本版帮助公开 |
| `codex plugin marketplace add` | 管理插件与市场：添加 | 本版帮助公开 |
| `codex plugin marketplace list` | 管理插件与市场：列举 | 本版帮助公开 |
| `codex plugin marketplace upgrade` | 管理插件与市场：更新市场缓存 | 本版帮助公开 |
| `codex plugin marketplace remove` | 管理插件与市场：移除 | 本版帮助公开 |
| `codex app-server daemon bootstrap` | 实验 app-server 与协议工具：引导安装 | experimental |
| `codex app-server daemon start` | 实验 app-server 与协议工具：启动 | experimental |
| `codex app-server daemon restart` | 实验 app-server 与协议工具：重启 | experimental |
| `codex app-server daemon update` | 实验 app-server 与协议工具：更新 | experimental |
| `codex app-server daemon enable-remote-control` | 实验 app-server 与协议工具：启用远程控制 | experimental |
| `codex app-server daemon disable-remote-control` | 实验 app-server 与协议工具：关闭远程控制 | experimental |
| `codex app-server daemon stop` | 实验 app-server 与协议工具：停止 | experimental |
| `codex app-server daemon version` | 实验 app-server 与协议工具：查看版本 | experimental |
| `codex debug app-server send-message-v2` | 模型目录、输入上下文和协议诊断：发送协议 V2 调试消息 | 本版帮助公开 |


### 8.2 全局参数与完整帮助

当前所有全局参数如下。`-c` 的值按 TOML 解析；数组和表建议用 shell 单引号包住整个 key=value，避免 PowerShell 改写引号。例：`codex -c 'web_search="live"'`。`--approve-for-me` 设置自动审核、on-request 和 workspace-write，不是关闭沙箱。

```text
Codex CLI

If no subcommand is specified, options will be forwarded to the interactive CLI.

Usage: codex [OPTIONS] [PROMPT]
       codex [OPTIONS] <COMMAND> [ARGS]

Commands:
  agents            Browse all agent sessions on the shared local app-server daemon
  exec              Run Codex non-interactively [aliases: e]
  review            Run a code review non-interactively
  login             Manage login
  logout            Remove stored authentication credentials
  mcp               Manage external MCP servers for Codex
  plugin            Manage Codex plugins
  app-server        [experimental] Run the app server or related tooling
  remote-control    [experimental] Manage the app-server daemon with remote control enabled
  app               Launch the Desktop app (opens the app installer if missing)
  completion        Generate shell completion scripts
  update            Update Codex to the latest version
  doctor            Diagnose local Codex installation, config, auth, and runtime health
  sandbox           Run commands within a Codex-provided sandbox
  debug             Debugging tools
  apply             Apply the latest diff produced by Codex agent as a `git apply` to your local
                    working tree [aliases: a]
  resume            Resume a previous interactive session (picker by default; use --last to continue
                    the most recent)
  queue             Queue a message for an existing session
  archive           Archive a saved session by id or session name
  delete            Permanently delete a saved session by id or session name
  migrate-rollouts  Inspect or migrate legacy local sessions to paginated thread history
  unarchive         Unarchive a saved session by id or session name
  fork              Fork a previous interactive session (picker by default; use --last to fork the
                    most recent)
  cloud             [EXPERIMENTAL] Browse tasks from Codex Cloud and apply changes locally
  exec-server       [EXPERIMENTAL] Run the standalone exec-server service
  features          Inspect feature flags
  help              Print this message or the help of the given subcommand(s)

Arguments:
  [PROMPT]
          Optional user prompt to start the session

Options:
  -c, --config <key=value>
          Override a configuration value that would otherwise be loaded from `~/.codex/config.toml`.
          Use a dotted path (`foo.bar.baz`) to override nested values. The `value` portion is parsed
          as TOML. If it fails to parse as TOML, the raw string is used as a literal.

          Examples: - `-c model="o3"` - `-c 'sandbox_permissions=["disk-full-read-access"]'` - `-c
          shell_environment_policy.inherit=all`

      --enable <FEATURE>
          Enable a feature (repeatable). Equivalent to `-c features.<name>=true`

      --disable <FEATURE>
          Disable a feature (repeatable). Equivalent to `-c features.<name>=false`

      --remote <ADDR>
          Connect the TUI to a remote app server endpoint.

          Accepted forms: `ws://host:port`, `wss://host:port`, `unix://`, or `unix://PATH`.

      --remote-auth-token-env <ENV_VAR>
          Name of the environment variable containing the bearer token to send to a remote app
          server websocket

      --strict-config
          Error out when config.toml contains fields that are not recognized by this version of
          Codex

  -i, --image <FILE>...
          Optional image(s) to attach to the initial prompt

  -m, --model <MODEL>
          Model the agent should use

      --oss
          Use open-source provider

      --local-provider <OSS_PROVIDER>
          Specify which local provider to use (lmstudio or ollama). If not specified with --oss,
          will use config default or show selection

  -p, --profile <CONFIG_PROFILE_V2>
          Layer $CODEX_HOME/<name>.config.toml on top of the base user config

  -s, --sandbox <SANDBOX_MODE>
          Select the sandbox policy to use when executing model-generated shell commands

          [possible values: read-only, workspace-write, danger-full-access]

      --approve-for-me
          Route approval requests through automatic review using the workspace-write sandbox

      --dangerously-bypass-approvals-and-sandbox
          Skip all confirmation prompts and execute commands without sandboxing. EXTREMELY
          DANGEROUS. Intended solely for running in environments that are externally sandboxed

      --dangerously-bypass-hook-trust
          Run enabled hooks without requiring persisted hook trust for this invocation. DANGEROUS.
          Intended only for automation that already vets hook sources

  -C, --cd <DIR>
          Tell the agent to use the specified directory as its working root

      --worktree
          Run the session in a new managed Git worktree

      --add-dir <DIR>
          Additional directories that should be writable alongside the primary workspace

  -a, --ask-for-approval <APPROVAL_POLICY>
          Configure when the model requires human approval before executing a command

          Possible values:
          - on-request: The model decides when to ask the user for approval
          - never:      Never ask for user approval Execution failures are immediately returned to
            the model

      --search
          Enable live web search. When enabled, the native Responses `web_search` tool is available
          to the model (no per‑call approval)

      --no-alt-screen
          Disable alternate screen mode

          Runs the TUI in inline mode, preserving terminal scrollback history.

      --no-daemon
          Run without the shared background server, even if it is already running

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version
```


### 8.3 每个子命令的专属参数

共用的 model/profile/config/sandbox 等参数见上一节。这里逐页保留专属 flag 与实际 Usage，避免漏掉 nested subcommand 中的差异。英文帮助用于精确保留边界；用途与命令树对应。某条没有专属参数时，仅需要 Usage 和公共参数。


#### `codex agents`

```text
Usage: codex agents [OPTIONS]
```


#### `codex exec`

```text
Usage: codex exec [OPTIONS] [PROMPT]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--thread-source <SOURCE>` | Source classification for newly created or forked threads |
| `--cyber-access-program <PROGRAM>` | Request an experimental Cyber access program for this turn (OpenAI provider only). Omit to use server defaults. Not supported with review; fork requires a prompt  [possible values: standard, daybreak_blue, daybreak_red] |
| `--skip-git-repo-check` | Allow running Codex outside a Git repository |
| `--ephemeral` | Run without persisting session files to disk |
| `--ignore-user-config` | Do not load `$CODEX_HOME/config.toml`; auth still uses `CODEX_HOME` |
| `--ignore-rules` | Do not load user or project execpolicy `.rules` files |
| `--output-schema <FILE>` | Path to a JSON Schema file describing the model's final response shape |
| `--color <COLOR>` | Specifies color settings for use in the output  [default: auto] [possible values: always, never, auto] |
| `--json` | Print events to stdout as JSONL |
| `-o, --output-last-message <FILE>` | Specifies file where the last message from the agent should be written |


#### `codex review`

```text
Usage: codex review [OPTIONS] [PROMPT]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--uncommitted` | Review staged, unstaged, and untracked changes |
| `--base <BRANCH>` | Review changes against the given base branch |
| `--commit <SHA>` | Review the changes introduced by a commit |
| `--title <TITLE>` | Optional commit title to display in the review summary |


#### `codex login`

```text
Usage: codex login [OPTIONS] [COMMAND]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--with-api-key` | Read the API key from stdin (e.g. `printenv OPENAI_API_KEY \| codex login --with-api-key`) |
| `--with-access-token` | Read the access token from stdin (e.g. `printenv CODEX_ACCESS_TOKEN \| codex login --with-access-token`) |
| `--device-auth` |  |


#### `codex logout`

```text
Usage: codex logout [OPTIONS]
```


#### `codex mcp`

```text
Usage: codex mcp [OPTIONS] <COMMAND>
```


#### `codex plugin`

```text
Usage: codex plugin [OPTIONS] <COMMAND>
```


#### `codex app-server`

```text
Usage: codex app-server [OPTIONS] [COMMAND]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--code-mode-host <URL>` | Connect to a remote code-mode host instead of starting a local host |
| `--listen <URL>` | Transport endpoint URL. Supported values: `stdio://` (default), `unix://`, `unix://PATH`, `ws://IP:PORT`, `off`  [default: stdio://] |
| `--stdio` | Use stdio as the transport (equivalent to `--listen stdio://`) |
| `--analytics-default-enabled` | Controls whether analytics are enabled by default.  Analytics are disabled by default for app-server. Users have to explicitly opt in via the `analytics` section in the config.toml file.  However, for first-party use cases like the VSCode IDE extension, we default analytics to be enabled by default by setting this flag. Users can still opt out by setting this in their config.toml:  ```toml [analytics] enabled = false ```  See https://developers.openai.com/codex/config-advanced/#metrics for more details. |
| `--ws-auth <MODE>` | Authentication mode for incoming WebSocket connections  [possible values: capability-token, signed-bearer-token] |
| `--ws-token-file <PATH>` | Absolute path to the capability-token file |
| `--ws-token-sha256 <HEX>` | Hex-encoded SHA-256 digest of the capability token |
| `--ws-shared-secret-file <PATH>` | Absolute path to the shared secret file for signed JWT bearer tokens |
| `--ws-issuer <ISSUER>` | Expected issuer for signed JWT bearer tokens |
| `--ws-audience <AUDIENCE>` | Expected audience for signed JWT bearer tokens |
| `--ws-max-clock-skew-seconds <SECONDS>` | Maximum clock skew when validating signed JWT bearer tokens |


#### `codex remote-control`

```text
Usage: codex remote-control [OPTIONS] [COMMAND]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Emit machine-readable JSON |


#### `codex app`

```text
Usage: codex app [OPTIONS] [PATH]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--download-url <DOWNLOAD_URL_OVERRIDE>` | Override the app installer download URL (advanced) |


#### `codex completion`

```text
Usage: codex completion [OPTIONS] [SHELL]
```


#### `codex update`

```text
Usage: codex update [OPTIONS]
```


#### `codex doctor`

```text
Usage: codex doctor [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Emit a redacted machine-readable report |
| `--summary` | Only show grouped check rows and the final count summary |
| `--all` | Expand long lists in detailed human output |
| `--no-color` | Disable ANSI color in human output |
| `--ascii` | Use ASCII status labels and separators in human output |


#### `codex sandbox`

```text
Usage: codex sandbox [OPTIONS] [COMMAND]... [COMMAND]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--sandbox-state-json <JSON>` | JSON value from `codex/sandbox-state-meta` to apply directly |
| `--sandbox-state-readable-root <SANDBOX_STATE_READABLE_ROOT>` | Add a readable root to the supplied sandbox state. Repeat for multiple roots |
| `--sandbox-state-disable-network` | Disable direct network access in the supplied sandbox state |
| `-P, --permission-profile <NAME>` | Named permissions profile to apply from the active configuration stack |
| `--include-managed-config` | Include managed requirements while resolving an explicit permissions profile |


#### `codex debug`

```text
Usage: codex debug [OPTIONS] <COMMAND>
```


#### `codex apply`

```text
Usage: codex apply [OPTIONS] <TASK_ID>
```


#### `codex resume`

```text
Usage: codex resume [OPTIONS] [SESSION_ID] [PROMPT]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--last` | Continue the most recent session without showing the picker |
| `--all` | Show all sessions (disables cwd filtering and shows CWD column) |
| `--include-non-interactive` | Include non-interactive sessions in the resume picker and --last selection |


#### `codex queue`

```text
Usage: codex queue [OPTIONS] --thread <THREAD> --message <TEXT>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--thread <THREAD>` | Session UUID or exact session name |
| `--message <TEXT>` | Message text to queue |


#### `codex archive`

```text
Usage: codex archive [OPTIONS] <SESSION>
```


#### `codex delete`

```text
Usage: codex delete [OPTIONS] <SESSION>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--force` | Delete without prompting. SESSION must be a UUID |


#### `codex migrate-rollouts`

```text
Usage: codex migrate-rollouts [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--apply` | Publish the migration. Without this flag the command only reports eligible sessions |
| `--thread <THREAD_ID>` | Restrict inspection or migration to one or more thread IDs |
| `--max-mib-per-second <MIB>` | Limit aggregate rollout read and write throughput, in MiB per second |
| `--json` | Emit the complete per-thread report as JSON |
| `--verbose` | Print one line for every inspected rollout |


#### `codex unarchive`

```text
Usage: codex unarchive [OPTIONS] <SESSION>
```


#### `codex fork`

```text
Usage: codex fork [OPTIONS] [SESSION_ID] [PROMPT]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--last` | Fork the most recent session without showing the picker |
| `--all` | Show all sessions (disables cwd filtering and shows CWD column) |


#### `codex cloud`

```text
Usage: codex cloud [OPTIONS] [COMMAND]
```


#### `codex exec-server`

```text
Usage: codex exec-server [OPTIONS] [COMMAND]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--linux-sandbox-pid-namespace <MODE>` | Linux PID namespace: isolate (default) or inherit. Inherit allows signals to other same-UID processes; enable only when provisioning a dedicated environment  [default: isolate] |
| `--proxy-private-ips-via-upstream` | Allow permitted private IP destinations to use the configured upstream proxy. If no valid upstream proxy applies to the request protocol, connect directly. Loopback stays local. This flag does not require upstream routing  [env: CODEX_EXEC_SERVER_PROXY_PRIVATE_IPS_VIA_UPSTREAM=] |
| `--concurrent-requests <COUNT>` | Maximum number of requests to process concurrently on each connection  [default: 1] |
| `--listen <URL>` | Transport endpoint URL. Supported values: `ws://IP:PORT` (default), `stdio`, `stdio://` |
| `--ws-auth <MODE>` | Authentication mode for incoming WebSocket connections  [possible values: capability-token, signed-bearer-token] |
| `--ws-token-file <PATH>` | Absolute path to the capability-token file |
| `--ws-token-sha256 <HEX>` | Hex-encoded SHA-256 digest of the capability token |
| `--ws-shared-secret-file <PATH>` | Absolute path to the shared secret file for signed JWT bearer tokens |
| `--ws-issuer <ISSUER>` | Expected issuer for signed JWT bearer tokens |
| `--ws-audience <AUDIENCE>` | Expected audience for signed JWT bearer tokens |
| `--ws-max-clock-skew-seconds <SECONDS>` | Maximum clock skew when validating signed JWT bearer tokens |
| `--remote-transport <REMOTE_TRANSPORT>` | Transport used for the remote executor connection  [default: noise] [possible values: noise, direct] |
| `--environment-id <ID>` | Environment id to attach to when registering remotely |
| `--name <NAME>` | Human-readable environment name |
| `--use-agent-identity-auth` | Use Agent Identity auth from CODEX_ACCESS_TOKEN for remote registration |
| `--aws-sigv4` | Sign Direct registration and WebSocket handshake requests with AWS SigV4 |
| `--aws-profile <PROFILE>` | AWS profile used for SigV4 authentication |
| `--aws-region <REGION>` | AWS signing region. Uses the SDK region chain when omitted |
| `--aws-service <SERVICE>` | AWS signing service  [default: execute-api] |
| `--exit-on-stdin-close` | Exit when the parent-owned standard-input pipe closes  [env: CODEX_EXEC_SERVER_EXIT_ON_STDIN_CLOSE=] |


#### `codex features`

```text
Usage: codex features [OPTIONS] <COMMAND>
```


#### `codex exec resume`

```text
Usage: codex exec resume [OPTIONS] [SESSION_ID] [PROMPT]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--last` | Resume the most recent recorded session (newest) without specifying an id |
| `--all` | Show all sessions (disables cwd filtering) |
| `--thread-source <SOURCE>` | Source classification for newly created or forked threads |
| `--cyber-access-program <PROGRAM>` | Request an experimental Cyber access program for this turn (OpenAI provider only). Omit to use server defaults. Not supported with review; fork requires a prompt  [possible values: standard, daybreak_blue, daybreak_red] |
| `--skip-git-repo-check` | Allow running Codex outside a Git repository |
| `--ephemeral` | Run without persisting session files to disk |
| `--ignore-user-config` | Do not load `$CODEX_HOME/config.toml`; auth still uses `CODEX_HOME` |
| `--ignore-rules` | Do not load user or project execpolicy `.rules` files |
| `--output-schema <FILE>` | Path to a JSON Schema file describing the model's final response shape |
| `--json` | Print events to stdout as JSONL |
| `-o, --output-last-message <FILE>` | Specifies file where the last message from the agent should be written |


#### `codex exec fork`

```text
Usage: codex exec fork [OPTIONS] <SESSION_ID> [PROMPT]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--thread-source <SOURCE>` | Source classification for newly created or forked threads |
| `--cyber-access-program <PROGRAM>` | Request an experimental Cyber access program for this turn (OpenAI provider only). Omit to use server defaults. Not supported with review; fork requires a prompt  [possible values: standard, daybreak_blue, daybreak_red] |
| `--skip-git-repo-check` | Allow running Codex outside a Git repository |
| `--ephemeral` | Run without persisting session files to disk |
| `--ignore-user-config` | Do not load `$CODEX_HOME/config.toml`; auth still uses `CODEX_HOME` |
| `--ignore-rules` | Do not load user or project execpolicy `.rules` files |
| `--output-schema <FILE>` | Path to a JSON Schema file describing the model's final response shape |
| `--json` | Print events to stdout as JSONL |
| `-o, --output-last-message <FILE>` | Specifies file where the last message from the agent should be written |


#### `codex exec review`

```text
Usage: codex exec review [OPTIONS] [PROMPT]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--uncommitted` | Review staged, unstaged, and untracked changes |
| `--base <BRANCH>` | Review changes against the given base branch |
| `--commit <SHA>` | Review the changes introduced by a commit |
| `--title <TITLE>` | Optional commit title to display in the review summary |
| `--thread-source <SOURCE>` | Source classification for newly created or forked threads |
| `--cyber-access-program <PROGRAM>` | Request an experimental Cyber access program for this turn (OpenAI provider only). Omit to use server defaults. Not supported with review; fork requires a prompt  [possible values: standard, daybreak_blue, daybreak_red] |
| `--skip-git-repo-check` | Allow running Codex outside a Git repository |
| `--ephemeral` | Run without persisting session files to disk |
| `--ignore-user-config` | Do not load `$CODEX_HOME/config.toml`; auth still uses `CODEX_HOME` |
| `--ignore-rules` | Do not load user or project execpolicy `.rules` files |
| `--output-schema <FILE>` | Path to a JSON Schema file describing the model's final response shape |
| `--json` | Print events to stdout as JSONL |
| `-o, --output-last-message <FILE>` | Specifies file where the last message from the agent should be written |


#### `codex login status`

```text
Usage: codex login status [OPTIONS]
```


#### `codex mcp list`

```text
Usage: codex mcp list [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Output the configured servers as JSON |


#### `codex mcp get`

```text
Usage: codex mcp get [OPTIONS] <NAME>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Output the server configuration as JSON |


#### `codex mcp add`

```text
Usage: codex mcp add [OPTIONS] <NAME> (--url <URL> | -- <COMMAND>...)
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--env <KEY=VALUE>` | Environment variables to set when launching the server. Only valid with stdio servers |
| `--url <URL>` | URL for a streamable HTTP MCP server |
| `--bearer-token-env-var <ENV_VAR>` | Optional environment variable to read for a bearer token. Only valid with streamable HTTP servers |
| `--oauth-client-id <CLIENT_ID>` | Optional OAuth client identifier to use for this MCP server |
| `--oauth-client-secret <CLIENT_SECRET>` | Optional OAuth client secret for the pre-registered client |
| `--oauth-client-registration <AUTO\|CIMD\|DCR>` | OAuth client-registration strategy for the immediate login only  [possible values: auto, cimd, dcr] |
| `--oauth-resource <RESOURCE>` | Optional OAuth resource parameter to include during MCP login |


#### `codex mcp remove`

```text
Usage: codex mcp remove [OPTIONS] <NAME>
```


#### `codex mcp login`

```text
Usage: codex mcp login [OPTIONS] <NAME>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--no-browser` | Print the authorization URL and accept the callback URL without opening a browser |
| `--scopes <SCOPE,SCOPE>` | Comma-separated list of OAuth scopes to request |
| `--oauth-client-registration <AUTO\|CIMD\|DCR>` | OAuth client-registration strategy for this login only  [possible values: auto, cimd, dcr] |


#### `codex mcp logout`

```text
Usage: codex mcp logout [OPTIONS] <NAME>
```


#### `codex plugin add`

```text
Usage: codex plugin add [OPTIONS] <PLUGIN[@MARKETPLACE]>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `-m, --marketplace <MARKETPLACE>` | Marketplace name to use when PLUGIN does not include @MARKETPLACE |
| `--json` | Output install result as JSON |


#### `codex plugin list`

```text
Usage: codex plugin list [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `-m, --marketplace <MARKETPLACE>` | Only list plugins from this marketplace name |
| `--json` | Output plugin list as JSON |
| `--available` | Include uninstalled marketplace plugins in the JSON output |


#### `codex plugin marketplace`

```text
Usage: codex plugin marketplace [OPTIONS] <COMMAND>
```


#### `codex plugin remove`

```text
Usage: codex plugin remove [OPTIONS] <PLUGIN[@MARKETPLACE]>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `-m, --marketplace <MARKETPLACE>` | Marketplace name to use when PLUGIN does not include @MARKETPLACE |
| `--json` | Output remove result as JSON |


#### `codex app-server daemon`

```text
Usage: codex app-server daemon [OPTIONS] <COMMAND>
```


#### `codex app-server proxy`

```text
Usage: codex app-server proxy [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--sock <SOCKET_PATH>` | Path to the app-server Unix domain socket to connect to |


#### `codex app-server generate-ts`

```text
Usage: codex app-server generate-ts [OPTIONS] --out <DIR>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `-o, --out <DIR>` | Output directory where .ts files will be written |
| `-p, --prettier <PRETTIER_BIN>` | Optional path to the Prettier executable to format generated files |
| `--experimental` | Include experimental methods and fields in the generated output |


#### `codex app-server generate-json-schema`

```text
Usage: codex app-server generate-json-schema [OPTIONS] --out <DIR>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `-o, --out <DIR>` | Output directory where the schema bundle will be written |
| `--experimental` | Include experimental methods and fields in the generated output |


#### `codex remote-control start`

```text
Usage: codex remote-control start [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Emit machine-readable JSON |


#### `codex remote-control stop`

```text
Usage: codex remote-control stop [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Emit machine-readable JSON |


#### `codex remote-control pair`

```text
Usage: codex remote-control pair [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Emit machine-readable JSON |


#### `codex sandbox uninstall`

```text
Usage: codex sandbox uninstall [OPTIONS]
```


#### `codex debug models`

```text
Usage: codex debug models [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--bundled` | Skip refresh and dump only the bundled catalog shipped with this binary |


#### `codex debug app-server`

```text
Usage: codex debug app-server [OPTIONS] <COMMAND>
```


#### `codex debug prompt-input`

```text
Usage: codex debug prompt-input [OPTIONS] [PROMPT]
```


#### `codex cloud exec`

```text
Usage: codex cloud exec [OPTIONS] --env <ENV_ID> [QUERY]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--env <ENV_ID>` | Target environment identifier (see `codex cloud` to browse) |
| `--attempts <ATTEMPTS>` | Number of assistant attempts (best-of-N)  [default: 1] |
| `--branch <BRANCH>` | Git branch to run in Codex Cloud (defaults to current branch) |


#### `codex cloud status`

```text
Usage: codex cloud status [OPTIONS] <TASK_ID>
```


#### `codex cloud list`

```text
Usage: codex cloud list [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--env <ENV_ID>` | Filter tasks by environment identifier |
| `--limit <N>` | Maximum number of tasks to return (1-20)  [default: 20] |
| `--cursor <CURSOR>` | Pagination cursor returned by a previous call |
| `--json` | Emit JSON instead of plain text |


#### `codex cloud apply`

```text
Usage: codex cloud apply [OPTIONS] <TASK_ID>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--attempt <N>` | Attempt number to apply (1-based) |


#### `codex cloud diff`

```text
Usage: codex cloud diff [OPTIONS] <TASK_ID>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--attempt <N>` | Attempt number to display (1-based) |


#### `codex exec-server forward`

```text
Usage: codex exec-server forward [OPTIONS] --remote <URL> --environment-id <ID> --connect <URL>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--connect <URL>` | Destination exec-server WebSocket URL |
| `--linux-sandbox-pid-namespace <MODE>` | Linux PID namespace: isolate (default) or inherit. Inherit allows signals to other same-UID processes; enable only when provisioning a dedicated environment  [default: isolate] |
| `--proxy-private-ips-via-upstream` | Allow permitted private IP destinations to use the configured upstream proxy. If no valid upstream proxy applies to the request protocol, connect directly. Loopback stays local. This flag does not require upstream routing  [env: CODEX_EXEC_SERVER_PROXY_PRIVATE_IPS_VIA_UPSTREAM=] |
| `--remote-transport <REMOTE_TRANSPORT>` | Transport used for the remote executor connection  [default: noise] [possible values: noise, direct] |
| `--environment-id <ID>` | Environment id to attach to when registering remotely |
| `--name <NAME>` | Human-readable environment name |
| `--use-agent-identity-auth` | Use Agent Identity auth from CODEX_ACCESS_TOKEN for remote registration |
| `--aws-sigv4` | Sign Direct registration and WebSocket handshake requests with AWS SigV4 |
| `--aws-profile <PROFILE>` | AWS profile used for SigV4 authentication |
| `--aws-region <REGION>` | AWS signing region. Uses the SDK region chain when omitted |
| `--aws-service <SERVICE>` | AWS signing service  [default: execute-api] |
| `--exit-on-stdin-close` | Exit when the parent-owned standard-input pipe closes  [env: CODEX_EXEC_SERVER_EXIT_ON_STDIN_CLOSE=] |


#### `codex features list`

```text
Usage: codex features list [OPTIONS]
```


#### `codex features enable`

```text
Usage: codex features enable [OPTIONS] <FEATURE>
```


#### `codex features disable`

```text
Usage: codex features disable [OPTIONS] <FEATURE>
```


#### `codex plugin marketplace add`

```text
Usage: codex plugin marketplace add [OPTIONS] <SOURCE>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--ref <REF>` | Git ref to fetch for Git marketplace sources |
| `--sparse <PATH>` | Sparse checkout path for Git marketplace sources. Can be repeated |
| `--json` | Output add result as JSON |


#### `codex plugin marketplace list`

```text
Usage: codex plugin marketplace list [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Output marketplace list as JSON |


#### `codex plugin marketplace upgrade`

```text
Usage: codex plugin marketplace upgrade [OPTIONS] [MARKETPLACE_NAME]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Output upgrade result as JSON |


#### `codex plugin marketplace remove`

```text
Usage: codex plugin marketplace remove [OPTIONS] <MARKETPLACE_NAME>
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--json` | Output remove result as JSON |


#### `codex app-server daemon bootstrap`

```text
Usage: codex app-server daemon bootstrap [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--remote-control` | Launch the managed app-server with remote control enabled |


#### `codex app-server daemon start`

```text
Usage: codex app-server daemon start [OPTIONS]
```


#### `codex app-server daemon restart`

```text
Usage: codex app-server daemon restart [OPTIONS]
```


#### `codex app-server daemon update`

```text
Usage: codex app-server daemon update [OPTIONS]
```


| 专属参数 | 该版本帮助说明 |
|---|---|
| `--from-cli` | Copy and pin this CLI package |
| `-y, --yes` | Confirm replacing the daemon package without an interactive prompt |


#### `codex app-server daemon enable-remote-control`

```text
Usage: codex app-server daemon enable-remote-control [OPTIONS]
```


#### `codex app-server daemon disable-remote-control`

```text
Usage: codex app-server daemon disable-remote-control [OPTIONS]
```


#### `codex app-server daemon stop`

```text
Usage: codex app-server daemon stop [OPTIONS]
```


#### `codex app-server daemon version`

```text
Usage: codex app-server daemon version [OPTIONS]
```


#### `codex debug app-server send-message-v2`

```text
Usage: codex debug app-server send-message-v2 [OPTIONS] <USER_MESSAGE>
```


### 8.4 开发者常用的非交互闭环

```powershell
codex exec --json --output-last-message result.md "阅读仓库并给出变更建议"
codex review --uncommitted
codex exec resume --last "继续完成验证"
codex agents
codex queue --thread <SESSION> --message "补充检查边界条件"
codex debug models --bundled
codex features list
codex doctor --summary
```

`exec --json` 输出 JSONL 事件；`--output-schema` 约束最终结果结构，与事件流不是同一格式；`--output-last-message` 保存最后答复。`--ephemeral` 避免保存会话历史，`--skip-git-repo-check` 仅用于明确理解无 Git 环境的情况。不要把 `codex debug prompt-input` 的输出提交到仓库，它可能包含项目指令与路径上下文。

完整依据：稳定版 CLI/TUI/shared options 源码与本机 `codex --help`。未来版本添加的 flag 先检查 `codex <command> --help`，不要把顶层参数默认视为所有子命令都接受。

## 9. 本次资料依据


- [官方命令文档](https://learn.chatgpt.com/docs/developer-commands?surface=cli)
- [官方配置基础](https://learn.chatgpt.com/docs/config-file/config-basic)
- [0.162.1 slash 定义](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/tui/src/slash_command.rs)
- [0.162.1 slash 门控](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/tui/src/bottom_pane/slash_commands.rs)
- [0.162.1 CLI 定义](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/cli/src/main.rs)
- [0.162.1 shared options](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/utils/cli/src/shared_options.rs)
