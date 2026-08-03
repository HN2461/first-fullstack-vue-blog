---
title: "第 06 篇：Codex 命令与配置文件速查"
slug: "ai-agent-codex-codex-9cf3fc01"
summary: "统一说明 Codex 常用命令、config.toml、auth.json 与 AGENTS.md 的职责边界，适合作为整套 Codex 系列文章的底座速查文档。"
category: "Codex"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "Codex"
tags:
  - "Codex"
  - "命令"
  - "配置文件"
  - "AGENTS"
  - "速查"
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf78"
originalSlug: "ai-agent-codex-codex-9cf3fc01"
originalStatus: "published"
publishedAt: "2026-06-04T13:41:34.294Z"
updatedAt: "2026-07-31T11:16:25.488Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 06 篇：Codex 命令与配置文件速查

> 更新时间：2026-07-26（按本机当前 Codex CLI 0.146 系列命令与模型目录复核）
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
| `codex update` | 更新 Codex CLI | 版本升级 | 当前版本提供的内置升级入口 |
| `codex doctor --summary` | 综合诊断安装、认证、配置、MCP、网络和状态库 | CLI 异常时 | 比直接重装更适合作为第一检查入口 |
| `codex --strict-config` | 拒绝未知配置字段 | 升级后检查旧配置 | 适合发现拼错、移除或尚未支持的字段 |
| `codex --yolo` | 旧版隐藏危险别名 | 阅读历史资料 | 当前仍可能被接受，但新文档应使用正式的危险绕过参数说明 |
| `codex exec "..."` | 非交互执行单任务 | CI/批处理 | 默认只读沙箱 |
| `codex exec --json "..."` | 输出机器可读事件流 | 脚本集成 | 便于日志与自动解析 |
| `codex exec --ephemeral "..."` | 非交互执行且不保存会话文件 | 临时检查 | 适合不需要恢复的短任务 |
| `codex exec resume --last "..."` | 续跑上次 exec 任务 | 中断恢复 | 依赖历史记录 |
| `codex resume` | 恢复交互会话 | 上次会话继续 | 适合长任务 |
| `codex fork --last` | 从最近会话分叉 | 并行尝试另一种方案 | 不破坏原线程上下文 |
| `codex archive|unarchive|delete` | 归档、恢复或删除保存的会话 | 会话整理 | `delete` 不可恢复，先确认目标 |
| `codex review --uncommitted` | 非交互审查当前改动 | 提交前检查 | 也支持 `--base`、`--commit` |
| `codex mcp add ...` | 添加 MCP 服务 | 接外部工具 | 推荐先本地测试 |
| `codex mcp list` | 查看 MCP 状态 | MCP 排错 | 看是否启动成功 |
| `codex plugin list` | 查看插件市场与安装状态 | 管理插件 | 区分 marketplace、plugin、skill 和 MCP |
| `codex app <path>` | 在桌面 App 打开工作区 | 图形化工作流 | 桌面 App 未安装时会进入安装流程 |
| `codex cloud ...` | 提交、查看、比较和应用云端任务 | 云端委派 | 当前仍带实验边界，以 `--help` 为准 |
| `codex features list` | 查看功能开关 | 诊断功能状态 | 和版本关联较大 |

旧资料里的 `--full-auto` 已被当前 CLI 移除，并且当前审批策略也没有 `on-failure`。日常开发请明确写 `--ask-for-approval on-request --sandbox workspace-write`。

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
| `model` | 默认模型 | `gpt-5.6-terra` | Terra 适合日常平衡任务；最难任务用 Sol，轻任务评估 Luna；第三方 provider 以后台列表为准 |
| `model_provider` | 选择后端提供方 | `openai` | 与 `[model_providers.<id>]` 名称必须一致 |
| `[model_providers.<id>].base_url` | API 地址 | 官方默认地址或服务商地址 | 路线切换最常错字段 |
| `approval_policy` | 是否弹确认 | `on-request` | 自动化可用 `never`，但要配安全边界 |
| `sandbox_mode` | 技术权限范围 | `workspace-write` | `danger-full-access` 仅隔离环境用 |
| `web_search` | 联网搜索策略 | 默认不在通用模板写死 | 需要最新资料时优先使用 `codex --search`；旧 cached 路径已进入 deprecated 阶段 |
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
model = "gpt-5.6-terra"
model_reasoning_effort = "medium"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[history]
persistence = "save-all"

```

审计 profile 建议另存为 `~/.codex/audit.config.toml`：

```toml
model = "gpt-5.6-sol"
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
