---
title: "第 01 篇：CC Switch 快速上手与核心概念（v3.16.0）"
slug: "ai-ccswitch-ccswitch-82653641"
summary: "CC Switch 是跨平台桌面 All-in-One AI CLI 配置管理工具，支持 Claude Code、Codex、Gemini CLI、OpenCode、OpenClaw、Hermes Agent 六款工具，并在 v3.16.0 阶段进一步补强工具安装升级生命周期、来源感知诊断与同步说明；本篇基于 2026-05-30 官方 release、Settings 与 FAQ 覆盖安装、界面、核心功能与实战操作全流程。"
category: "CCSwitch"
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
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 01 篇：CC Switch 快速上手与核心概念（v3.16.0）

> 官方仓库：[github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch)  
> 当前版本：v3.16.0（2026-05-29）  
> 资料核对时间：2026-05-30  
> 技术栈：Tauri 2 + Rust（后端）+ React 18 + TypeScript（前端）
> 口径说明：官方 README、Settings 手册与 FAQ 的更新节奏偶尔会有轻微不同步；涉及当前版本、安装方式、同步边界时，本文以 latest release + Settings/FAQ 为准。

---

## 一、CC Switch 是什么？

CC Switch 是一款**跨平台桌面工具**，核心定位是"多 AI 编程 CLI 配置中控台"。它把分散在多款 AI 编程 CLI 工具中的配置（尤其是 API 服务商/中转商配置）收敛到统一界面管理，解决手动切换配置易出错、效率低的问题。

### 官方受管 AI CLI（当前 6 款）

| CLI 工具 | 描述 | 配置文件位置 |
|----------|------|-------------|
| Claude Code | Anthropic 官方终端 AI 助手 | `~/.claude/settings.json` |
| Codex CLI | OpenAI 命令行编程工具 | `~/.codex/config.toml` |
| Gemini CLI | Google 终端 AI 工具 | `~/.gemini/.env` |
| OpenCode | 开源终端 AI 助手 | `~/.opencode/` |
| OpenClaw | 开源本地 AI Agent（龙虾） | `openclaw.json` |
| Hermes Agent | 新增第六款（v3.14.0 起） | `~/.hermes/config.yaml` |

> 注：v3.14.0 新增了 Hermes Agent 作为第六款受管应用，v3.11.0 新增了 OpenClaw（第五款）。  
> 另外，v3.15.0 起新增 **Claude Desktop 一等受管面板**，用来单独管理桌面端配置与切换入口，但它不计入上面这 6 款 CLI 数量；v3.16.0 继续把重点放在工具管理、诊断和同步稳定性上。

### 与手动配置的对比

| 对比维度 | 手动编辑配置文件 | CC Switch |
|----------|----------------|-----------|
| 学习成本 | 高，需理解各工具配置格式 | 低，可视化操作 |
| 切换效率 | 需编辑文件 + 重启工具 | 一键切换；本地路由模式下热生效 |
| 多工具支持 | 每款工具单独配置 | 统一管理 6 款工具 |
| 备份恢复 | 手动备份 | 自动备份，保留最近 10 个版本 |
| 速度测试 | 无 | 内置延迟测试（Stream Check） |
| 故障转移 | 无 | 自动切换备用 Provider |
| 配置同步 | 手动 | 支持云同步（Dropbox/OneDrive/iCloud/WebDAV） |

---

## 二、界面结构解析

打开 CC Switch 后，顶部工具栏有一排应用图标，对应每款受管 CLI 工具。点击不同图标即可切换到对应工具的 Provider 管理页面。

**顶部工具栏图标（从左到右）：**
- Claude Code（红色星形图标）
- Claude Desktop（v3.15.0 起新增独立面板）
- Codex（OpenAI 图标）
- Gemini CLI（蓝色星形图标）
- OpenCode（方块图标）
- OpenClaw（龙虾图标）
- Hermes Agent（v3.14.0 新增）
- 工具区：Stream Check（扳手）、会话管理、历史记录、附件/Skills、新增 Provider（橙色 + 号）

**主内容区（以 Codex 为例）：**
- 列表展示所有已配置的 Provider
- 每个 Provider 卡片显示：名称、API 地址
- 当前激活的 Provider 高亮显示，右侧显示"使用中"标签
- 每个 Provider 右侧有操作按钮：编辑、复制、修改、统计、删除

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

### 功能补充：工具管理与安装升级生命周期（v3.16.0 重点增强）

- 设置里的“关于 / About”页已明显升级成工具管理面板，可以查看已安装版本、最新版本、单工具安装 / 升级以及批量动作
- 官方 release notes 新增了“受管工具生命周期管理”口径：会优先使用官方原生安装器，必要时再回退到包管理器，并结合检测到的安装来源给出更靠谱的升级命令
- 诊断能力从“只看有没有这个命令”升级到“按来源感知”：能区分 PATH、Homebrew、npm、pnpm、bun、volta、fnm、nvm、Scoop、WinGet、WSL 等来源，更适合排查“我明明装了，但终端调到的是另一份”这类问题
- 对程序员最实用的点是：当同一台机器上混有多套 Node / 包管理器 / WSL 环境时，CC Switch 不再只告诉你“有冲突”，而是更接近“哪一份在生效、该升级哪一份”

### 功能一：Provider 管理（核心功能）

Provider 即 API 服务商/中转商配置，是 CC Switch 最核心的功能。

**支持能力：**
- 50+ 内置预设（含 AWS Bedrock、NVIDIA NIM、GitHub Copilot 等）
- 一键切换，拖拽排序，导入/导出
- 系统托盘快速访问（无需打开主界面）
- 每个 Provider 可配置多个端点，支持 API Key 管理与延迟测试
- 4 层模型粒度配置：Haiku / Sonnet / Opus / Custom
- 一键恢复官方登录状态
- Provider 模型自动获取（OpenAI 兼容 `/v1/models`，以及部分 Anthropic 兼容 `/models` 自动发现）
- 通用 Provider（Universal Provider）：一份配置同步到多个应用
- Provider 卡片显示 Routing Support 标识，方便判断是否能配合本地路由
- Full URL Endpoint Mode：兼容路径结构不标准的第三方接口
- Codex OAuth Provider 支持实时拉取模型列表
- Claude Code 支持按角色映射模型，并可标记 `supports1m`

**新增 Provider 操作步骤：**
1. 点击右上角橙色「+」按钮
2. 选择「Custom Gateway（自定义网关）」或从 50+ 预设中选择
3. 填写：名称、API 地址（Base URL）、API Key、关联应用（Enabled Apps）
4. 可选：配置模型映射（Haiku / Sonnet / Opus / Custom 四层）
5. 点击「Add」保存

**切换 Provider：**
- 主界面：找到目标 Provider → 点击「启用」
- 系统托盘：直接点击 Provider 名称（立即生效）
- 大多数工具需重启终端生效；**Claude Code 支持热切换，无需重启**

### 功能二：本地路由（Local Routing，原名 Local Proxy Takeover，v3.14.0 统一改名）

v3.9.0 引入，v3.14.0 将"Local Proxy Takeover"统一改名为"Local Routing"。

| 特性 | 说明 |
|------|------|
| 热切换 | 切换 Provider 无需重启 CLI 工具 |
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

### 功能三：MCP 服务器管理

- 跨应用统一管理（Claude / Codex / Gemini / OpenCode / OpenClaw 共用一个面板）
- 支持三种传输类型：`stdio`、`http`、`sse`
- 双向同步，变更自动传播到所有关联应用
- 支持 Deep Link 导入（`ccswitch://` 协议）

### 功能四：Prompts（系统提示词）管理

- 无限数量的提示词预设
- 跨应用支持：CLAUDE.md、AGENTS.md、GEMINI.md
- CodeMirror 6 Markdown 编辑器 + 实时预览
- 回填保护：切换前自动保存当前内容

### 功能五：Skills 管理

- 从 GitHub 仓库或 ZIP 文件一键安装
- 自动扫描 GitHub 仓库中的 Skills（含嵌套目录递归扫描）
- 支持软链接和文件复制两种同步方式
- 支持 SHA-256 更新检测与批量更新
- 默认安装到 `~/.claude/skills/` 或 `~/.cc-switch/skills/`（可切换）
- 卸载前自动备份到 `~/.cc-switch/skill-backups/`（保留最近 20 个）

### 功能六：会话管理器（Session Manager）

- 浏览、搜索和恢复 Claude Code、Codex、Gemini CLI、OpenCode、OpenClaw 全部对话历史
- 支持关键词高亮、会话标题提取、批量删除
- 虚拟化列表，支持数千条记录流畅滚动

### 功能七：用量与成本追踪

- 跨 Provider 追踪支出、请求数和 Token 用量
- 趋势图表、详细请求日志
- 日期范围选择器（今天 / 1d / 7d / 14d / 30d / 自定义）
- 自定义模型定价

### 功能八：云同步与备份

- 自动备份，导入配置和 WebDAV 下载覆盖本地前都会先创建安全备份
- 支持云同步：Dropbox、OneDrive、iCloud Drive、WebDAV；其中 WebDAV 使用 `v2` 协议
- WebDAV 下载前会展示远程快照信息（协议版本、数据库版本、时间戳、大小），确认后再覆盖本地
- 导入/导出的是核心配置型 JSON 备份；`settings.json` 这类 device-level settings 不属于跨设备同步范围

### 功能九：Deep Link 协议

支持 `ccswitch://` 深度链接协议，可从第三方平台一键导入 Provider 配置、MCP 服务器、提示词和 Skills，无需手动填写。

### 功能十：系统托盘

- 轻量模式（Lightweight Mode）：销毁主窗口，仅保留系统托盘运行
- 托盘子菜单按应用分组，防止 Provider 列表过长时溢出
- 托盘显示当前 Provider 的缓存用量（含订阅和脚本用量摘要）

---

## 五、配置数据存储位置

| 数据类型 | 存储位置 |
|----------|---------|
| Provider / MCP / Prompts / Skills | `~/.cc-switch/cc-switch.db`（SQLite） |
| 设备设置 | `~/.cc-switch/settings.json`（JSON） |
| 备份文件 | `~/.cc-switch/backups/`（自动保留最近 10 个） |
| Skills 文件 | `~/.cc-switch/skills/`（默认通过软链接连接到对应应用） |
| Skills 备份 | `~/.cc-switch/skill-backups/`（卸载前自动创建，保留最近 20 个） |
| 崩溃日志 | `~/.cc-switch/crash.log` |

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

**普通模式（需重启 CLI）：**
1. 在 Provider 列表中找到目标服务商
2. 点击「启用」
3. 重启对应 CLI 工具（如在终端重新运行 `claude`）

**本地路由模式（热切换，无需重启）：**
1. 在设置中开启本地路由
2. 在 Provider 列表切换目标服务商
3. 变更立即生效

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
| 切换后 CLI 无响应 | 未重启 CLI（普通模式下需重启） | 重启 CLI 工具；或改用本地路由模式实现热切换 |
| 切换后提示"模型不支持" | 中转服务商支持的模型与 CLI 选择的模型不匹配 | 在 Provider 编辑页核对支持模型，选择兼容模型后重新切换 |
| 多 CLI 共用中转时配置混乱 | 新增 Provider 时未精准绑定对应 CLI | 新增 Provider 时在「Enabled Apps」中精准选择关联工具 |
| 切换供应商后插件配置消失 | 通用配置未提取 | 在「编辑供应商」→「通用配置面板」→「从当前供应商提取」，之后新建供应商时勾选「写入通用配置」 |
| settings.json 被覆盖 | CC Switch 同步配置时覆盖了手动修改的字段 | 使用 CC Switch 统一管理，避免手动与工具混用 |
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
| v3.16.0 | 2026-05 | 新增受管工具生命周期管理、按来源感知的工具诊断、zh-TW 本地化、官方 Homebrew cask 安装路径，以及 Codex 第三方 provider 历史统一到 `custom` 桶 |

---

## 十、参考来源

1. [CC Switch GitHub 仓库](https://github.com/farion1231/cc-switch)
2. [CC Switch 中文 README](https://github.com/farion1231/cc-switch/blob/main/README_ZH.md)
3. [CC Switch CHANGELOG（完整版本历史）](https://github.com/farion1231/cc-switch/blob/main/CHANGELOG.md)
4. [CC Switch Releases（下载最新版本）](https://github.com/farion1231/cc-switch/releases)
5. [CC Switch 用户手册](https://github.com/farion1231/cc-switch/tree/main/docs/user-manual/zh)
6. [cc-switch-cli（命令行版）](https://github.com/SaladDay/cc-switch-cli)
