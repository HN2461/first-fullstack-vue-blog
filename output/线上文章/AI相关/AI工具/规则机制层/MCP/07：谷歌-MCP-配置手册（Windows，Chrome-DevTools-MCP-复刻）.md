---
title: "07：谷歌 MCP 配置手册（Windows，Chrome DevTools MCP 复刻）"
slug: "ai-mcp-mcp-79fea32a"
summary: "面向需要在 Windows 上快速复刻 Chrome DevTools MCP 的开发者，整理 Codex 环境下的配置、验证和排障步骤，并解释为什么这类资料应归在 MCP 分类而不是单一终端工具分类。"
category: "MCP"
tags:
  - "MCP"
  - "Chrome DevTools"
  - "Google"
  - "Codex"
  - "Windows"
status: "draft"
sortOrder: 80
cover: ""
originalId: "6a2d291d8a2b1c68f2cabfc6"
originalSlug: "ai-mcp-mcp-79fea32a"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 07：谷歌 MCP 配置手册（Windows，Chrome DevTools MCP 复刻）

> 适用对象：要在另一台 Windows 电脑上快速复刻可用的 Codex + Chrome DevTools MCP。  
> 更新时间：2026-07-04
> 复核说明：Chrome DevTools MCP 仍以官方包和 Chrome 远程调试端口为核心；Codex 侧 MCP 配置入口请以当前 Codex 官方文档或本机 `codex mcp list` / `codex mcp get` 输出为准。

## 1. 目标结果

按本手册做完后，你应该达到以下状态：

1. `codex` 可以正常启动
2. `codex mcp list` 能看到 `chrome-devtools`，且状态为 `enabled`
3. 不再出现以下常见问题
   - 连接 `127.0.0.1:9222` 失败
   - `npm/npx` 报 `EPERM` 权限错误

## 2. 先确认基础环境

在 PowerShell 执行：

```powershell
node -v
npm -v
npx -v
codex --version
```

预期：以上 4 条命令都能输出版本号。  
如果有命令找不到，先修复 PATH，再继续。

## 3. 创建 Codex 目录

在 PowerShell 执行：

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex" | Out-Null
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\npm-cache" | Out-Null
```

## 4. 写入配置文件（最关键）

文件路径：`C:\Users\<你的用户名>\.codex\config.toml`

将下面内容完整粘贴进去，再把 `<REPLACE_WITH_YOUR_TOKEN>` 替换为你的真实 token：

```toml
model_provider = "yunyi"
model = "gpt-5.3-codex"
model_reasoning_effort = "xhigh"
disable_response_storage = true
preferred_auth_method = "apikey"

[model_providers.yunyi]
name = "yunyi"
base_url = "https://yunyi.rdzhvip.com/codex"
wire_api = "responses"
experimental_bearer_token = "<REPLACE_WITH_YOUR_TOKEN>"
requires_openai_auth = true

[windows]
sandbox = "elevated"

[mcp_servers]

[mcp_servers.chrome-devtools]
command = "cmd"
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"]
env = { SystemRoot = "C:\\Windows", PROGRAMFILES = "C:\\Program Files", npm_config_cache = "C:\\Users\\<你的用户名>\\.codex\\npm-cache", CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS = "1" }
startup_timeout_ms = 20000
```

## 5. 可选：配置项目信任（避免反复询问）

如果你想让常用目录默认 trusted，可在 `config.toml` 追加：

```toml
[projects.'C:\Users\<你的用户名>\Desktop']
trust_level = "trusted"

[projects.'C:\Users\<你的用户名>\Desktop\你的项目目录']
trust_level = "trusted"
```

## 6. 验证 MCP 是否生效

在 PowerShell 执行：

```powershell
codex mcp list
codex mcp get chrome-devtools
```

预期检查点：

1. 能看到 `chrome-devtools`
2. `Status` 为 `enabled`
3. `command` 是 `cmd`
4. `args` 含 `npx -y chrome-devtools-mcp@latest`

## 7. 必做步骤：重启 Codex

配置改完后必须执行：

1. 关闭所有 Codex 窗口和进程
2. 重新打开 Codex

不重启会继续使用旧配置，导致你以为“改了但没生效”。

## 8. 一键自检命令（可直接复制）

```powershell
Write-Host "=== 版本 ==="
node -v
npm -v
npx -v
codex --version

Write-Host "=== npm 配置 ==="
npm config get cache
npm config get registry

Write-Host "=== MCP 列表 ==="
codex mcp list

Write-Host "=== MCP 详情 ==="
codex mcp get chrome-devtools
```

## 9. 常见故障与处理

### 9.1 报 `EPERM`（npx 拉包失败）

现象：日志出现 `npm error code EPERM`、`operation not permitted`。

处理步骤：

1. 确认 `config.toml` 中 `npm_config_cache` 指向用户目录（如 `C:\Users\<你>\.codex\npm-cache`）
2. 确认该目录存在（见第 3 步）
3. 彻底重启 Codex

### 9.2 报 `Could not connect to Chrome` / `127.0.0.1:9222`

常见原因：配置里写了 `--browser-url=http://127.0.0.1:9222`，但本机没有打开这个调试端口。

处理步骤：

1. 删除 `--browser-url=...` 参数
2. 使用本手册第 4 步给出的默认配置
3. 重启 Codex

说明：仅在“你明确要连接一个已开启远程调试端口的 Chrome”时，才需要 `--browser-url`。

### 9.3 `codex mcp list` 看不到服务

处理步骤：

1. 检查路径是否正确：`%USERPROFILE%\.codex\config.toml`
2. 检查 TOML 语法（中括号、逗号、引号）
3. 重启 Codex 后再执行 `codex mcp list`

## 10. 安全注意事项

1. 真实 token 不要发在聊天、邮件、工单里
2. 文档和截图里只保留占位符
3. 一旦怀疑泄露，立即更换 token

## 11. 官方参考链接

- OpenAI Codex MCP 文档：<https://developers.openai.com/codex/mcp/>
- OpenAI Codex 配置文档：<https://developers.openai.com/codex/config/>
- Chrome DevTools MCP 说明：<https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/README.md>
