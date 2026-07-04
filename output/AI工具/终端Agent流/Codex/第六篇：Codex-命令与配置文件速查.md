---
title: "第六篇：Codex 命令与配置文件速查"
slug: "ai-agent-codex-codex-9cf3fc01-revision-20260704"
summary: "统一说明 Codex 常用命令、config.toml、auth.json 与 AGENTS.md 的职责边界，适合作为整套 Codex 系列文章的底座速查文档。"
category: "Codex"
tags:
  - "Codex"
  - "命令"
  - "配置文件"
  - "AGENTS"
  - "速查"
status: "draft"
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf78"
originalSlug: "ai-agent-codex-codex-9cf3fc01"
exportedAt: "2026-07-04T07:00:23.238Z"
---
# 第六篇：Codex 命令与配置文件速查

> 更新时间：2026-07-04（已按官方当前文档校准）
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
| `<repo>/.codex/config.toml` | 项目级覆盖配置 | 在受信任仓库内运行时 | 只放项目特有差异，不能放 provider、认证、通知、profile 选择等本机字段 |
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
| `codex login` | 浏览器登录 | 交互式登录 | 适合个人本地开发 |
| `codex login --device-auth` | 设备码登录 | 无浏览器环境 | 服务器常用 |
| `codex login --with-api-key` | 用 API key 登录 | 自动化/脚本场景 | key 需安全保存 |
| `codex login status` | 查看登录状态 | 鉴权报错时 | 先排查它最快 |
| `codex --model <name>` | 临时切模型 | 单次任务 | 不改动配置文件 |
| `codex --profile <name>` | 用指定 profile 运行 | 场景切换（开发/审计） | profile 来自 `~/.codex/<name>.config.toml` |
| `codex --full-auto` | 旧资料常见兼容写法 | 看到老教程时用于对照理解 | 当前等价于 `--ask-for-approval on-failure --sandbox workspace-write`，新手日常仍建议显式配置 |
| `codex --yolo` | 跳过审批与沙箱 | 隔离环境专项任务 | 风险高，日常不建议 |
| `codex exec "..."` | 非交互执行单任务 | CI/批处理 | 默认只读沙箱 |
| `codex exec --json "..."` | 输出机器可读事件流 | 脚本集成 | 便于日志与自动解析 |
| `codex exec resume --last "..."` | 续跑上次 exec 任务 | 中断恢复 | 依赖历史记录 |
| `codex resume` | 恢复交互会话 | 上次会话继续 | 适合长任务 |
| `codex mcp add ...` | 添加 MCP 服务 | 接外部工具 | 推荐先本地测试 |
| `codex mcp list` | 查看 MCP 状态 | MCP 排错 | 看是否启动成功 |
| `codex features list` | 查看功能开关 | 诊断功能状态 | 和版本关联较大 |

---

## 3. Slash Commands（会话内命令）作用

| 命令 | 作用 | 常见用途 |
|---|---|---|
| `/status` | 看当前模型、权限、上下文 | 先确认“实际生效值” |
| `/debug-config` | 看配置来源与覆盖结果 | 解决“改了不生效” |
| `/model` | 会话内切模型 | 临时换模型验证 |
| `/permissions` | 会话内改审批策略 | 临时提权或收权 |
| `/diff` | 查看当前改动 | 提交前自查 |
| `/review` | 让 Codex 做工作树审查 | 合并前风险检查 |
| `/init` | 生成 `AGENTS.md` 模板 | 新项目初始化 |
| `/mcp` | 查看工具接入状态 | MCP 排错 |
| `/plan` | 先规划再执行 | 大任务拆解 |
| `/goal` | 给线程设置持续目标 | 长任务管理 |
| `/personality` | 切换回复风格 | 团队协作偏好调整 |
| `/fast` | 查看或切换 fast 模式 | 节奏控制 |
| `/feedback` | 反馈问题并附日志 | 诊断异常 |
| `/apps` | 查看或连接外部应用能力 | App/连接器相关排障 |
| `/hooks` | 查看 hooks 状态 | 命令前后自动化治理 |
| `/memories` | 管理长期记忆 | 需要检查可复用偏好时 |
| `/statusline` | 配置状态栏 | 定制 CLI 底部状态展示 |
| `/title` | 生成或修改会话标题 | 长线程整理 |

提示：不同端（CLI/插件/App）可用命令略有差异，先用 `/status` 或帮助文档确认。

---

## 4. 高频配置字段作用字典

| 字段 | 作用 | 新手默认建议 | 专业补充 |
|---|---|---|---|
| `model` | 默认模型 | `gpt-5.5` | 与 provider 可用模型保持一致；具体 Codex 专用模型名以官方模型页和当前账号列表为准 |
| `model_provider` | 选择后端提供方 | `openai` | 与 `[model_providers.<id>]` 名称必须一致 |
| `[model_providers.<id>].base_url` | API 地址 | 官方默认地址或服务商地址 | 路线切换最常错字段 |
| `approval_policy` | 是否弹确认 | `on-request` | 自动化可用 `never`，但要配安全边界 |
| `sandbox_mode` | 技术权限范围 | `workspace-write` | `danger-full-access` 仅隔离环境用 |
| `web_search` | 联网搜索策略 | `cached` | 对时效高任务可用 `live` |
| `model_reasoning_effort` | 思考深度 | `medium` | 越高通常越慢、成本越高 |
| `~/.codex/<profile>.config.toml` | 场景配置文件 | `dev_safe` + `audit` 两套 | 用 `codex --profile <name>` 加载 |
| `[history].persistence` | 历史保存策略 | `save-all` | 合规敏感场景可设 `none` |
| `cli_auth_credentials_store` | 凭据存储策略 | `auto` | 安全优先选 `keyring` |
| `[mcp_servers.<id>].required` | 工具失败是否中断任务 | 默认 `false` | 核心工具可设 `true` |
| `[mcp_servers.<id>].enabled_tools` | 工具白名单 | 按需最小化 | 与 `disabled_tools` 组合治理 |

---

## 5. 一套小白安全起步模板（可直接抄）

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

审计 profile 建议另存为 `~/.codex/audit.config.toml`：

```toml
model = "gpt-5.5"
approval_policy = "never"
sandbox_mode = "read-only"
web_search = "disabled"
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
| 团队统一规范 | 仓库根维护 `AGENTS.md` + profiles |
| 高风险操作前收紧权限 | `sandbox_mode = "read-only"` 或 `approval_policy = "on-request"` |

---

## 7. 一句话总结（给新手）

1. 命令是“临时动作”
2. `config.toml` 是“默认策略”
3. `AGENTS.md` 是“团队规则”
4. `auth.json` 或系统凭据库中的登录缓存都属于“敏感凭据”
5. 看不懂时，先回到“优先级链”判断谁覆盖了谁
