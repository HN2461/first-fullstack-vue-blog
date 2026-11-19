---
title: "第 07 篇：谷歌 MCP 配置手册（Windows，Chrome DevTools MCP 复刻）"
slug: "ai-mcp-mcp-79fea32a"
summary: "按官方文档整理 Windows 上 Codex 接入 Chrome DevTools MCP 的最小配置、版本要求、分层验证、浏览器连接方式、统计开关和故障排查，保留现有认证与项目权限设置。"
category: "MCP"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "MCP"
tags:
  - "MCP"
  - "Chrome DevTools"
  - "Google"
  - "Codex"
  - "Windows"
status: "published"
sortOrder: 80
cover: ""
originalId: "6a2d291d8a2b1c68f2cabfc6"
originalSlug: "ai-mcp-mcp-79fea32a"
originalStatus: "published"
publishedAt: "2026-05-24T13:49:15.045Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 07 篇：谷歌 MCP 配置手册（Windows，Chrome DevTools MCP 复刻）

复核日期：2026-11-18。这里的“谷歌 MCP”专指 Google Chrome DevTools 团队维护的 `chrome-devtools-mcp`，不是 Google 全部服务的统一入口。

本文配置依据 Chrome DevTools 官方 README、客户端配置指南与 Codex 当前配置 schema。只添加 MCP 服务配置；登录方式、模型提供商和项目权限沿用你自己的设置。

## 1. 先确定需要哪一种入口

Chrome DevTools 当前同时提供 MCP server、`chrome-devtools` CLI、Skills 与部分宿主的插件。本文使用 **Codex + 本地 stdio MCP server**。

- 首次接入可以使用 `@latest`；要长期复刻环境时，把版本改成经过验证的版本号并记录。
- 默认由 server 在首次调用需要浏览器的工具时启动 Chrome，无需预先打开 `9222` 端口。
- 如果只想运行脚本，可评估 CLI；安装了包含该 MCP 的插件时，先检查是否已经注册同名服务。

## 2. 检查基础环境

在 PowerShell 中执行：

```powershell
node --version
npm --version
npx --version
codex --version
```

官方要求使用受支持的 Node.js LTS、npm 与 Chrome。具体 Node.js 下限随包版本变化，安装前可以查包声明：

```powershell
npm view chrome-devtools-mcp@latest version engines
Get-Command node, npm, npx, codex
```

官方保证支持 Google Chrome 和 Chrome for Testing；其他 Chromium 浏览器可能可用，但不在同等保证范围内。先解决 PATH 或浏览器安装问题，再配置服务。

## 3. 备份现有配置

默认用户配置位于 `%USERPROFILE%\.codex\config.toml`；设置过 `CODEX_HOME` 时，以实际 Codex 主目录为准。

```powershell
$codexConfigDir = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
New-Item -ItemType Directory -Path $codexConfigDir -Force | Out-Null
$codexConfigFile = Join-Path $codexConfigDir 'config.toml'
if (Test-Path -LiteralPath $codexConfigFile) {
  $configBackup = "$codexConfigFile.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item -LiteralPath $codexConfigFile -Destination $configBackup
}
```

打开已有文件，只修改对应 MCP 配置块；不要用整份示例覆盖你的模型、认证和其他服务设置。使用 UTF-8 无 BOM 保存。

## 4. 添加 Windows 最小配置

```toml
[mcp_servers.chrome-devtools]
command = "cmd"
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics", "--no-performance-crux"]
env = { SystemRoot = "C:\\Windows", PROGRAMFILES = "C:\\Program Files" }
startup_timeout_sec = 20
```

- `cmd /c` 是官方 Windows 客户端示例采用的启动方式，便于执行 `npx` 包装命令。
- `SystemRoot`、`PROGRAMFILES` 按当前机器真实路径填写；系统不是安装在 C 盘时相应调整。
- 当前 Codex schema 支持 `startup_timeout_sec`，也保留 `startup_timeout_ms`。本文统一使用秒，避免两个字段同时填写产生歧义。
- `--no-usage-statistics` 关闭工具使用统计；`--no-performance-crux` 关闭通过 trace URL 查询 CrUX 的通道。这不等于阻止浏览器访问目标站点，也不等于禁止向当前 AI 宿主返回页面内容。
- 默认创建的是工具自己的浏览器用户目录。需要临时隔离会话时，可在 `args` 增加 `--isolated`；浏览器关闭后该临时资料目录会清理，登录态不应预期保留。

Chrome DevTools 本地 server 本身不要求配置模型 API token。不要为了接入它添加第三方模型网关、降低沙箱等级或把整个桌面目录设为受信任。

## 5. 也可以通过 CLI 注册

如果没有同名服务，可使用：

```powershell
codex mcp add chrome-devtools -- cmd /c npx -y chrome-devtools-mcp@latest --no-usage-statistics --no-performance-crux
```

CLI 注册和手工配置选一种即可；需要 Windows 环境变量和启动超时时，再补充第 4 节字段。命令随 Codex 版本可能调整，可先执行 `codex mcp add --help` 确认当前版本支持。

## 6. 分两层验证

先检查配置：

```powershell
codex mcp list
codex mcp get chrome-devtools
```

确认服务名、command、args 与超时设置正确。`enabled` 只代表配置允许启用，不能证明 Chrome 已连接或工具执行成功。

随后重新连接 MCP 或开启一个新 Codex 会话，让当前客户端加载配置。是否支持热重载依赖客户端，不必默认关闭其他无关窗口或强杀全部进程。

当确实需要浏览器验证且已获授权时，选择一个无敏感数据的本地测试页，验证读取页面、控制台和网络信息。先确认工具调用成功，再进行性能 trace 等较重操作。文档配置核对本身不需要打开浏览器。

## 7. 连接已有浏览器属于可选路径

| 方式 | 适用场景 | 前提 |
| --- | --- | --- |
| 默认启动 | 独立调试、首次接入 | Chrome 可发现，server 有启动权限 |
| `--browser-url=http://127.0.0.1:9222` | 连接已开启远程调试的 Chrome | 对应调试端口已实际监听 |
| `--autoConnect` | 连接受支持的本地 Chrome 会话 | 官方要求 Chrome 144+，并在 `chrome://inspect/#remote-debugging` 启用相应调试服务 |
| `--executable-path=...` | Chrome 不在标准安装位置 | 指向真实 Chrome 可执行文件 |

这些参数应按目标方式选择，不能为了排错全部一起加。已有浏览器可能包含登录态和私人页面；连接前确认该会话适合向 AI 工具暴露。

## 8. 常见故障

### 8.1 `EPERM` 或 npm 缓存不可写

先确认报错指向哪个目录，不要直接用管理员权限重跑所有进程。只有缓存确实不可写时，才改用当前用户的独立缓存目录：

```powershell
$mcpCacheDir = Join-Path $env:LOCALAPPDATA 'chrome-devtools-mcp/npm-cache'
New-Item -ItemType Directory -Path $mcpCacheDir -Force | Out-Null
$mcpCacheDir
```

把输出路径写入该服务的 `env`，例如增加 `npm_config_cache = 'C:\Users\<用户名>\AppData\Local\chrome-devtools-mcp\npm-cache'`。不要覆盖原有 `SystemRoot`、`PROGRAMFILES`。

### 8.2 无法连接 `127.0.0.1:9222`

检查是否显式设置了 `--browser-url`。需要独立浏览器时删除这个参数，让 server 按默认方式启动；需要已有会话时，核对 Chrome 的调试开关、端口、用户目录和监听状态。

### 8.3 MCP 启动超时

第一次 `npx` 需要下载包。核对 Node/npm 版本、网络、代理、证书和缓存写权限，再按实际需要增加 `startup_timeout_sec`。不要通过关闭 TLS 校验掩盖下载问题。

可以只检查包命令能否启动，而不打开浏览器：

```powershell
npx -y chrome-devtools-mcp@latest --help
```

### 8.4 服务已启用，但看不到工具或参数不匹配

检查当前会话是否加载了修改后的配置，是否同时安装了包含相同 MCP 的插件，以及 Skills 是否仍描述旧版本工具。按该宿主的重连/更新方式处理，再用一个小任务验证。

## 9. 维护与清理

记录 Codex、Node、Chrome、MCP 包和相关 Skills 的版本。更新工具后同步更新 Skills；批量升级前先验证一个小任务。

浏览器会话、trace、截图可能包含 URL、请求和页面数据。只保存排障所需产物，结束后关闭本次启动的临时会话。已有日常浏览器应由用户决定何时关闭。

## 10. 官方来源

- [Chrome DevTools README](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [客户端配置与 Windows/Codex 示例](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/client-configurations.md)
- [参数与配置指南](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/configuration.md)
- [已有浏览器与高级连接方式](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/advanced-usage.md)
- [Codex MCP 文档](https://developers.openai.com/codex/mcp/)
- [Codex 当前配置 schema](https://github.com/openai/codex/blob/main/codex-rs/core/config.schema.json)

本轮通过官方 GitHub 文档和配置 schema 核验参数；Codex 文档页面在本次抓取中返回 403，未将不可读取的页面内容当作已验证证据。
