---
title: "第 01 篇：CC Switch 快速上手与核心概念（v4.0.8）"
slug: "ai-ccswitch-ccswitch-82653641"
summary: "CC Switch 是跨平台桌面 AI 编程工具配置中控台。v4.0 重做侧栏、直连/路由/聚合模式、用量与会话管理，并改为只替换供应商关键字段、保留用户配置；本篇按 v4.0.8（2026-10-10）官方发布说明、用户手册与 FAQ 更新安装、Provider、聚合、MCP、同步和升级边界。"
category: "CCSwitch"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "辅助工具层"
  - "CCSwitch"
tags:
  - "MCP"
  - "CCSwitch"
  - "AI CLI"
  - "配置管理"
  - "中转服务商"
  - "Provider"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cac05a"
originalSlug: "ai-ccswitch-ccswitch-82653641"
originalStatus: "published"
publishedAt: "2026-05-30T11:24:47.588Z"
updatedAt: "2026-10-11T13:24:34.301Z"
exportedAt: "2026-09-29T13:16:41.461Z"
---
# 第 01 篇：CC Switch 快速上手与核心概念（v4.0.8）

> 官方仓库：[github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch)  
> 当前版本：v4.0.8（2026-10-10）
> 资料核对时间：2026-10-11
> 技术栈：Tauri 2 + Rust（后端）+ React 18 + TypeScript（前端）
> 口径说明：4.0 是一次结构性升级。涉及当前版本、模式、配置写入和同步边界时，本文以 v4.0.8 release、v4.0 中文发布说明、用户手册与 Configuration Files FAQ 为准；旧版“通用配置片段”和整份供应商快照覆盖的说法不再适用于 4.0。

---

## 一、CC Switch 是什么？

CC Switch 是一款**跨平台桌面工具**，核心定位是"多 AI 编程 CLI 配置中控台"。它把分散在多款 AI 编程 CLI 工具中的配置（尤其是 API 服务商/中转商配置）收敛到统一界面管理，解决手动切换配置易出错、效率低的问题。

### 官方受管应用（当前 10 款）

| CLI 工具 | 描述 | 配置文件位置 |
|----------|------|-------------|
| Claude Code | Anthropic 官方终端 AI 助手 | `~/.claude/settings.json` |
| Codex CLI | OpenAI 命令行编程工具 | `~/.codex/config.toml` |
| Gemini CLI | Google 终端 AI 工具 | `~/.gemini/.env` |
| OpenCode | 开源终端 AI 助手 | `~/.config/opencode/` |
| OpenClaw | 开源本地 AI Agent | `~/.openclaw/openclaw.json` |
| Hermes Agent | 终端 Agent | `~/.hermes/config.yaml`（Windows 默认 `%LOCALAPPDATA%\hermes\`） |
| Grok Build | xAI 编程工具 | `~/.grok/config.toml` |
| Pi | Pi coding agent | `~/.pi/agent/` |
| MiniMax Code | MiniMax 编程工具 | `~/.minimax/` |

> 注：4.0 的官方发布说明按“应用”而不是“CLI 六款”组织能力。Claude Desktop 是独立受管应用，但它没有自己的 MCP、Skills、Prompt 或会话数据页，这些页面仍操作 Claude Code 数据。受管应用数量和可见侧栏项目可在设置中调整，至少保留一个。

### 与手动配置的对比

| 对比维度 | 手动编辑配置文件 | CC Switch |
|----------|----------------|-----------|
| 学习成本 | 高，需理解各工具配置格式 | 低，可视化操作 |
| 切换效率 | 需编辑文件、理解各工具格式 | 直连、路由、聚合三种模式按场景切换 |
| 多工具支持 | 每款工具单独配置 | 统一管理 10 款应用及全局 MCP、Skills、Prompt |
| 配置保留 | 容易覆盖整份文件 | 只替换供应商关键字段，Hooks、MCP、权限等原样保留 |
| 备份恢复 | 手动备份 | 自动数据库备份、首次写入原文件备份和“其他备份”总览 |
| 观察能力 | 需分别查日志和账单 | 用量、请求日志、成本、速度、成功率和会话统一查看 |
| 配置同步 | 手工复制文件 | 配置导入、SQL 备份、WebDAV/S3 云同步，各有明确边界 |

---

## 二、界面结构解析

打开 CC Switch 后，主界面采用侧栏布局。应用、MCP、Skills、提示词、会话、授权中心、用量统计和设置都有独立入口；应用页顶部再用标签切换直连、路由和聚合视图。

**侧栏主要入口：**
- 应用：集中显示版本、安装位置和来源，支持安装、升级和批量升级
- Claude Code、Claude Desktop、Codex 等应用页：分别管理 Provider 和模式
- MCP、Skills、提示词、会话、授权中心、用量统计
- 设置：通用、应用配置、本地路由、网络、数据、关于

**应用页主内容区（以 Codex 为例）：**
- 顶部标签区显示“直连 / 路由 / 聚合”；标签只切换查看内容，真正切换模式的按钮会说明将发生的变化
- 直连和路由页显示完整 Provider 卡片；聚合页显示默认供应商与已加入的模型来源
- 供应商、MCP、提示词编辑改为整页编辑，离开前会提示未保存修改

---

## 三、安装指南

### Windows

**方式一：MSI 安装包（推荐）**
- 从 [GitHub Releases](https://github.com/farion1231/cc-switch/releases) 下载 `CC-Switch-v{版本号}-Windows.msi`，双击安装

**方式二：Winget**
```bash
winget install farion1231.CC-Switch
```

**方式三：便携版**
- 下载 `CC-Switch-v{版本号}-Windows-Portable.zip`，解压后直接运行，无需安装

### macOS

**方式一：Homebrew（推荐，v3.16.0 起走官方 cask）**
```bash
brew install --cask cc-switch
```

> `v3.16.0` 官方 release notes 已明确：CC Switch 现已进入 Homebrew 官方 cask 仓库，无需再执行 `brew tap farion1231/ccswitch`。

更新：
```bash
brew upgrade --cask cc-switch
```

**方式二：手动安装**
- 下载 `CC-Switch-v{版本号}-macOS.dmg`，拖入 Applications 文件夹
- macOS 版已通过 Apple 代码签名和公证，可直接安装，无需额外操作

### Linux

| 发行版 | 安装方式 |
|--------|---------|
| Ubuntu/Debian | 下载 `.deb`：`sudo dpkg -i cc-switch_*.deb` |
| Fedora/RHEL | 下载 `.rpm`：`sudo rpm -i cc-switch_*.rpm` |
| Arch Linux | `paru -S cc-switch-bin` |
| 通用 | 下载 AppImage，`chmod +x *.AppImage` 后运行 |

> Flatpak 官方 Release 不包含，如需使用可从 `.deb` 自行构建。

### 系统要求

- Windows 10 及以上
- macOS 12 (Monterey) 及以上
- Linux：Ubuntu 22.04+ / Debian 11+ / Fedora 34+ 等主流发行版

---

## 四、核心功能详解

### 功能一：工具管理与安装升级

- 4.0 将工具版本、安装位置和来源集中到“应用”页，支持单个安装、升级和批量升级
- 默认不再把工具升级放在“关于”页；关于页负责 CC Switch 自身更新、更新摘要和链接
- 诊断会区分 PATH、Homebrew、npm、pnpm、bun、volta、fnm、nvm、Scoop、WinGet、WSL 等来源，适合排查同机多套运行时命中错误的问题

### 功能二：三种应用模式

| 模式 | 请求路径 | 适用场景 | 关键限制 |
|------|----------|----------|----------|
| 直连 | 客户端直接连接当前 Provider | 普通日常使用 | 切换模型或部分工具配置后通常要重启客户端 |
| 路由 | 客户端 -> CC Switch 本地路由 -> Provider | 协议转换、故障转移、请求日志和用量统计 | CC Switch 需要保持运行；官方 Provider 有安全限制 |
| 聚合 | 本地路由按模型把请求分发给多家 Provider | 在 Claude Code 或 Codex 的同一模型列表里混用供应商 | 目前只支持 Claude Code 和 Codex；Claude Code 需 2.1.243+ |

聚合不是故障转移：模型选择决定请求发往哪家供应商。Codex 的聚合模型目录变化后需要按提示重启；Claude Code 的聚合模型修改可立即生效。

### 功能三：Provider 管理（核心功能）

Provider 即 API 服务商/中转商配置，是 CC Switch 最核心的功能。

**支持能力：**
- 50+ 内置预设（含 AWS Bedrock、NVIDIA NIM、GitHub Copilot 等）
- 一键切换，拖拽排序，导入/导出
- 系统托盘快速访问（无需打开主界面）
- 每个 Provider 可配置多个端点，支持 API Key 管理与延迟测试
- 4 层模型粒度配置：Haiku / Sonnet / Opus / Custom
- 一键恢复官方登录状态
- Provider 模型自动获取（OpenAI 兼容 `/v1/models`，以及部分 Anthropic 兼容 `/models` 自动发现）
- Provider 可加入多个应用；聚合模式另有默认供应商和模型来源管理
- Provider 卡片显示 Routing Support 标识，方便判断是否能配合本地路由
- Full URL Endpoint Mode：兼容路径结构不标准的第三方接口
- Codex OAuth Provider 支持实时拉取模型列表
- Claude Code 支持按角色映射模型，并可标记 `supports1m`
- v4.0.8 获取模型列表时会带上 Provider 的额外请求头；Claude Code、Codex 和 Grok Build 使用「Header 覆盖」，OpenCode 使用其供应商请求头配置

**新增 Provider 操作步骤：**
1. 点击右上角橙色「+」按钮
2. 选择「Custom Gateway（自定义网关）」或从 50+ 预设中选择
3. 填写：名称、API 地址（Base URL）、API Key、关联应用（Enabled Apps）
4. 可选：配置模型映射（Haiku / Sonnet / Opus / Custom 四层）
5. 点击「Add」保存

**切换 Provider：**
- 直连 / 路由页选择目标 Provider；聚合页添加或移除供应商并指定默认供应商
- 系统托盘可按应用、模式和供应商快速切换
- 4.0 起切换只替换地址、凭据、模型、协议等关键字段；配置文件中的 MCP、Hooks、权限、项目设置、注释和未涉及字段保留
- Codex、Gemini CLI、Grok Build 等模型目录变化后按提示重启；Claude Code 聚合模型变化无需重启
- v4.0.8 只安装 Codex 桌面版时也可以使用 Codex 聚合模式；官方模型列表不可用时会回退到桌面版内置命令行，并在提示中列出失败原因

### 功能四：本地路由（Local Routing）

本地路由承载协议转换、故障转移、请求日志和用量统计；4.0 的聚合模式也建立在本地路由之上。

| 特性 | 说明 |
|------|------|
| 热切换 | 路由内切换通常无需重启；直连与路由切换后 Codex 可能需要重启 |
| 自动故障转移 | 当前 Provider 不可用时自动切换备用 |
| 熔断器 | 检测到持续失败时自动隔离，防止资源浪费 |
| 请求日志 | 记录所有 API 请求，便于调试 |
| 用量统计 | 追踪 Token 消耗与费用 |
| 格式转换 | 支持 Anthropic Messages ↔ OpenAI Chat/Responses API 双向转换 |

> ⚠️ 注意：开启本地路由时，系统会阻止切换到官方 Provider（因为将官方 API 流量路由到本地代理存在账号封禁风险）。
> v3.15.0 起，Provider 卡片会额外显示是否支持 Routing 的标识，排查“为什么这家能切、那家不能切”会更直观。

**请求流转示意：**
```
Claude Code → localhost:端口 → CC Switch 本地路由 → 中转服务商 → Claude API
```

### 功能五：MCP 服务器管理

- 跨应用统一管理；4.0 可同步到 Pi，一份 MCP 配置最多供 8 个受管 AI 编程工具使用
- 支持三种传输类型：`stdio`、`http`、`sse`
- 双向同步，变更自动传播到所有关联应用
- 支持 Deep Link 导入（`ccswitch://` 协议）

### 功能六：Prompts（系统提示词）管理

- 无限数量的提示词预设
- 跨应用支持：CLAUDE.md、AGENTS.md、GEMINI.md
- CodeMirror 6 Markdown 编辑器 + 实时预览
- 回填保护：切换前自动保存当前内容

### 功能七：Skills 管理

- 从 GitHub 仓库或 ZIP 文件一键安装
- 自动扫描 GitHub 仓库中的 Skills（含嵌套目录递归扫描）
- 支持软链接和文件复制两种同步方式
- 支持 SHA-256 更新检测与批量更新
- 默认安装到 `~/.claude/skills/` 或 `~/.cc-switch/skills/`（可切换）
- 卸载前自动备份到 `~/.cc-switch/skill-backups/`（保留最近 20 个）

### 功能八：会话管理器（Session Manager）

- 浏览、搜索和恢复 Claude Code、Codex、Gemini CLI、Grok Build、OpenCode、OpenClaw、Hermes、Pi、MiniMax Code 等会话
- 支持关键词高亮、会话标题提取、批量删除
- 虚拟化列表，支持结构化查看正文、思考、工具调用、工具结果和图片；可按“全部 / 对话 / 改动”查看
- v4.0.7 可读取 Codex 压缩后的 `.jsonl.zst` 会话并统计用量

### 功能九：用量与成本追踪

- 跨 Provider 追踪支出、请求数和 Token 用量
- 趋势图表、详细请求日志
- 日期范围支持全部范围和 53 周热力图；请求日志、供应商、模型、定价表均支持分页
- v4.0.7 修正 Claude 1 小时缓存写入价格、部分 OpenAI 兼容中转的缓存命中读取和 Codex 缓存写入统计
- 自定义模型定价

### 功能十：云同步与备份

- 自动备份，导入配置和 WebDAV 下载覆盖本地前都会先创建安全备份
- 支持自定义配置目录、WebDAV 和 S3 兼容云同步；WebDAV 使用 `v2` 协议
- 云端下载前显示远程快照信息，覆盖本地前自动创建安全备份
- 需要区分“配置导入/导出”和“SQL 数据库备份”：前者用于迁移配置，后者可包含用量日志；两者都不包含设备级 `settings.json`
- `设置 -> 数据 -> 应用诊断日志` 提供「打开日志」按钮，日志文件尚未生成时会打开日志目录，便于提交模型列表、路由或同步问题的诊断材料

### 功能十一：Deep Link 协议

支持 `ccswitch://` 深度链接协议，可从第三方平台一键导入 Provider 配置、MCP 服务器、提示词和 Skills，无需手动填写。

### 功能十二：系统托盘与轻量模式

- 轻量模式（Lightweight Mode）：销毁主窗口，仅保留系统托盘运行
- 托盘子菜单按应用分组，防止 Provider 列表过长时溢出
- 托盘显示当前 Provider 的缓存用量（含订阅和脚本用量摘要）

---

## 五、配置数据存储位置

| 数据类型 | 存储位置 |
|----------|---------|
| Provider / MCP / Prompts / Skills / profiles / 用量 | `~/.cc-switch/cc-switch.db`（SQLite，SSOT） |
| 设备设置 | `~/.cc-switch/settings.json`（只属于本机，不随配置目录迁移） |
| 模式与最近写入状态 | `~/.cc-switch/live-state.json`（不要手改） |
| Codex 官方登录暂存 | `~/.cc-switch/codex-login-stash.json`（不参与云同步） |
| 备份文件 | `~/.cc-switch/backups/`（默认保留最近 10 个） |
| 首次写入原文件 | `~/.cc-switch/backups/live-first-write/` |
| Skills 文件 / 备份 | `~/.cc-switch/skills/`、`~/.cc-switch/skill-backups/` |
| 诊断日志 / 崩溃日志 | `~/.cc-switch/logs/`、`~/.cc-switch/crash.log` |

---

## 六、多中转服务商管理实战

### 6.1 新增中转服务商

1. 点击右上角橙色「+」按钮
2. 选择「Custom Gateway」
3. 填写：
   - **名称**：自定义（如"中转A-Claude"），便于识别
   - **API 地址（Base URL）**：中转服务商提供的接口地址
   - **API Key**：中转服务商发放的密钥（一字不差）
   - **关联应用（Enabled Apps）**：精准选择该配置适配的 CLI 工具
4. 可选：点击模型字段旁的「Quick-Set」按钮快速填入模型
5. 点击「Add」保存

### 6.2 切换 Provider

**直连模式：**
1. 在 Provider 列表中找到目标服务商
2. 点击「启用」
3. 重启对应 CLI 工具（如在终端重新运行 `claude`）

**路由模式：**
1. 在设置中开启本地路由
2. 在 Provider 列表切换目标服务商
3. 变更立即生效

**聚合模式：**
- 在应用页进入“聚合”标签，添加可用 Provider，指定默认供应商，并在模型列表中检查供应商前缀和真实模型 ID
- Claude Code 需 2.1.243+；Codex 模型列表变化后按提示重启

**系统托盘切换（最快）：**
- 右键系统托盘图标 → 找到对应应用的子菜单 → 点击目标 Provider 名称

### 6.3 Stream Check（流式健康检查）

用于验证 Provider 是否可用：
1. 点击工具栏扳手图标进入 Stream Check
2. 选择要测试的 Provider
3. 点击测试，查看延迟和状态

### 6.4 切换异常快速回滚

若切换后出现调用失败、鉴权错误等问题：
1. 回到 Provider 列表，选中此前可用的服务商，点击「启用」
2. 或在 Provider 列表中找到「Official Login」预设，一键恢复官方登录

**命令行恢复方式（Claude Code）：**
```bash
# 删除自定义配置，恢复官方设置
rm ~/.claude/settings.json
claude  # 重新登录官方账号
```

---

## 七、典型场景：多中转服务商轮替使用

假设有 2 个适配 Codex 的中转服务商（A 和 B），轮替使用步骤：

**第一步：新增 Provider**
- 分别创建"中转A-Codex""中转B-Codex"，均在 Enabled Apps 中勾选 Codex，填写各自的 API 地址与密钥

**第二步：日常切换**
- 当中转 A 配额用尽时，在 Provider 列表选中"中转B-Codex"→ 点击「启用」
- 重启终端，验证切换生效

**第三步：异常处理**
- 若中转 B 调用失败，立即切回"中转A-Codex"
- 或开启自动故障转移，让 CC Switch 自动处理

**推荐多 Provider 策略：**
```
⭐ 主力服务商（低延迟、低成本）
📦 备用服务商（模型选择多、稳定）
🏢 官方登录（兜底保障）
```

---

## 八、常见问题与避坑

| 常见问题 | 精准原因 | 解决方法 |
|----------|----------|----------|
| 切换后 CLI 提示"API 密钥错误" | Provider 配置中密钥填写错误或与服务商不匹配 | 核对密钥，重新编辑 Provider 后重新切换 |
| 切换后 CLI 无响应 | 直连模式下客户端仍使用旧模型目录或旧进程 | 按提示重启对应 CLI；路由内切换通常无需重启 |
| 切换后提示"模型不支持" | 中转服务商支持的模型与 CLI 选择的模型不匹配 | 在 Provider 编辑页核对支持模型，选择兼容模型后重新切换 |
| 多 CLI 共用中转时配置混乱 | 新增 Provider 时未精准绑定对应 CLI | 新增 Provider 时在「Enabled Apps」中精准选择关联工具 |
| 切换供应商后插件、MCP 或权限配置消失 | 旧版整份快照覆盖或升级后仍在使用旧版写入逻辑 | 升级到 4.x 后切换一次；4.x 只替换关键字段，编辑器中直接保存全局设置 |
| 手动改配置后切换仍恢复旧值 | 改的是 live 文件，Provider 数据库仍是源头 | 在供应商编辑器中保存；不要直接改 `cc-switch.db` |
| `settings.json`、模式状态没有同步 | 这些是设备级文件 | 每台设备单独配置；不要把 `settings.json`、`live-state.json` 当成迁移文件 |
| 开启本地路由后无法切换到官方 Provider | 设计限制，防止账号封禁风险 | 先关闭本地路由，再切换到官方 Provider |

---

## 九、版本演进简史（关键里程碑）

| 版本 | 时间 | 关键变化 |
|------|------|---------|
| v3.0.0 | 2025-08 | 从 Electron 迁移到 Tauri 2，体积从 ~150MB 降至 ~15MB |
| v3.7.0 | 2025-11 | 新增 Gemini CLI 支持、Skills 管理、Prompts 管理、Deep Link |
| v3.8.0 | 2025-11 | 存储架构升级为 SQLite + JSON 双层，新增日语支持 |
| v3.9.0 | 2026-01 | 新增本地 API 代理、自动故障转移、熔断器 |
| v3.10.0 | 2026-01 | 新增 OpenCode 支持（第四款）、Claude Rectifier |
| v3.11.0 | 2026-02 | 新增 OpenClaw 支持（第五款）、会话管理器、备份管理 |
| v3.12.0 | 2026-03 | 恢复 Stream Check、新增 OpenAI Responses API 格式转换 |
| v3.12.3 | 2026-03 | 新增 GitHub Copilot 反向代理支持、macOS 代码签名与公证 |
| v3.13.0 | 2026-04 | 新增轻量模式、Provider 模型自动获取、Codex OAuth 反向代理 |
| v3.14.0 | 2026-04 | 新增 Hermes Agent（第六款）、Gemini Native API 代理、"Local Proxy Takeover"改名为"Local Routing" |
| v3.14.1 | 2026-04 | 托盘用量可见性、Codex OAuth 稳定性修复、移除 Hermes 配置健康扫描器 |
| v3.15.0 | 2026-05 | 新增 Claude Desktop 一等受管面板、Provider Routing Support 标识、Full URL Endpoint Mode、Codex OAuth 实时模型列表、Claude Code `supports1m` 角色映射 |
| v3.16.0 | 2026-05 | 新增受管工具生命周期管理、按来源感知诊断、官方 Homebrew cask 安装路径 |
| v3.20.4 | 2026-09 | 3.x 最后稳定线，升级 4.0 前应先完成配置备份 |
| v4.0.0–v4.0.4 | 2026-10-04 至 2026-10-07 | 全新侧栏、直连/路由/聚合模式、聚合模型选择器、用量和会话重写、关键字段替换式切换、Pi MCP 同步、数据库版本 20 |
| v4.0.5–v4.0.6 | 2026-10-08 至 2026-10-09 | 修复 4.0 正式版后的 Codex、Claude、MCP、用量和升级流程问题 |
| v4.0.7 | 2026-10-10 | Codex 压缩会话读写、Plus/Team 工作区切换、额度已用/剩余显示、直连/路由重启提示、Windows Codex 服务识别、缓存计价和命中统计修复 |
| v4.0.8 | 2026-10-10 | Codex 桌面版聚合回退、官方模型列表失败原因提示与自动恢复、模型发现请求头透传、设置页打开日志、深色模式文字对比度调整 |

---

## 十、参考来源

1. [CC Switch GitHub 仓库](https://github.com/farion1231/cc-switch)
2. [CC Switch 中文 README](https://github.com/farion1231/cc-switch/blob/main/README_ZH.md)
3. [CC Switch CHANGELOG（完整版本历史）](https://github.com/farion1231/cc-switch/blob/main/CHANGELOG.md)
4. [CC Switch Releases（下载最新版本）](https://github.com/farion1231/cc-switch/releases)
5. [CC Switch v4.0 中文发布说明](https://github.com/farion1231/cc-switch/blob/main/docs/release-notes/v4.0.4-zh.md)
6. [CC Switch v4.0.8 发布说明](https://github.com/farion1231/cc-switch/releases/tag/v4.0.8)
7. [CC Switch v4.0.7 发布说明](https://github.com/farion1231/cc-switch/releases/tag/v4.0.7)
8. [CC Switch 用户手册｜设置](https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/zh/1-getting-started/1.5-settings.md)
9. [CC Switch FAQ｜Configuration Files](https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/en/5-faq/5.1-config-files.md)
