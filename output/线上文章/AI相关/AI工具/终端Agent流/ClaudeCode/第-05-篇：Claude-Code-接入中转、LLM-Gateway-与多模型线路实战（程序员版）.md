---
title: "第 05 篇：Claude Code 接入中转、LLM Gateway 与多模型线路实战（程序员版）"
slug: "ai-agent-claudecode-claudecode-llmgateway-66916234"
summary: "按 2026-10-12 Claude Code 2.1.296 官方 LLM Gateway Connect、Gateway Protocol、Model Config、Settings 与第三方 Provider 文档更新，覆盖 Anthropic 兼容中转、Bedrock/Vertex/Foundry/Claude Platform on AWS 路由、模型映射、网关凭据、各运行界面和排障。"
category: "ClaudeCode"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "ClaudeCode"
tags:
  - "Claude Code"
  - "中转"
  - "LLM Gateway"
  - "Base URL"
  - "ANTHROPIC_BASE_URL"
  - "模型映射"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf36"
originalSlug: "ai-agent-claudecode-claudecode-llmgateway-66916234"
originalStatus: "published"
publishedAt: "2026-05-30T08:58:26.824Z"
updatedAt: "2026-10-12T21:50:00.000Z"
exportedAt: "2026-09-29T13:16:41.461Z"
---
# 第 05 篇：Claude Code 接入中转、LLM Gateway 与多模型线路实战（程序员版）

> 本文按 2026-10-12 官方 Gateway Connect、Gateway Protocol、Model Config 和各 Provider 文档更新。中转、网关、包月线路和 Claude Code 订阅是不同概念；先确认请求到底发给谁，再谈模型、计费、上下文和权限。

[[toc]]

---

## 先给结论

Claude Code 接入中转或 LLM Gateway，最小闭环是：

```text
确认网关协议 → 设置 Base URL → 设置凭据 → 用 /status 验证 → 发一条最小请求 → 再配置模型映射和长期存储
```

有五条当前规则：

1. Anthropic 兼容网关通常需要 `ANTHROPIC_BASE_URL` 加一个凭据变量；只改 Base URL 不会自动完成认证。
2. `ANTHROPIC_AUTH_TOKEN` 会作为 `Authorization: Bearer ...` 使用；`ANTHROPIC_API_KEY` 走 `x-api-key`，不要混用后再猜网关需要哪个 header。
3. Bedrock、Vertex、Foundry、Claude Platform on AWS 有自己的 `*_BASE_URL` 和认证开关，不能把 Anthropic 兼容示例原样复制过去。
4. 网关必须正确转发 Anthropic Messages API、流式响应、版本 header、工具调用、缓存/上下文能力和错误码；“能返回一句话”不等于适合 Claude Code。
5. CC Switch、LiteLLM、One API 等第三方工具可以切换或路由配置，但它们不改变 Claude Code 官方的权限、设置优先级和模型能力判断。

---

## 1. 先判断你属于哪种线路

| 线路 | Claude Code 入口 | 主要差异 |
| --- | --- | --- |
| Anthropic API/订阅直连 | OAuth、`ANTHROPIC_API_KEY` | 官方能力和文档最完整 |
| Anthropic 兼容 Gateway | `ANTHROPIC_BASE_URL` + token/key | 网关负责上游 Provider、计费和审计 |
| Amazon Bedrock | `CLAUDE_CODE_USE_BEDROCK=1` | AWS 凭据、region、inference profile |
| Google Cloud Agent Platform | `CLAUDE_CODE_USE_VERTEX=1` | GCP project、region、模型版本 |
| Microsoft Foundry | `CLAUDE_CODE_USE_FOUNDRY=1` | Foundry endpoint 和 API key |
| Claude Platform on AWS | `CLAUDE_CODE_USE_ANTHROPIC_AWS=1` | workspace 和 AWS 平台认证 |
| 本地切换器/桌面管理器 | 写入上述变量或 settings | 必须确认它实际写了哪个文件/进程环境 |

先在 Claude Code 里运行 `/status`：

- `Anthropic base URL` 出现且指向你的网关，说明 Base URL 已生效。
- `Auth token`、`API key` 或 `apiKeyHelper` 行说明凭据来源。
- 如果显示 `Login method` 为 claude.ai 账号而不是网关凭据，说明环境变量可能被登录凭据覆盖或尚未加载。

---

## 2. Anthropic 兼容网关的最小配置

### 2.1 Bash/Zsh

```bash
export ANTHROPIC_BASE_URL='https://llm-gateway.example.com'
export ANTHROPIC_AUTH_TOKEN='sk-gateway-key'
claude
```

### 2.2 PowerShell

```powershell
$env:ANTHROPIC_BASE_URL = 'https://llm-gateway.example.com'
$env:ANTHROPIC_AUTH_TOKEN = 'sk-gateway-key'
claude
```

### 2.3 通过 settings.json 配置

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://llm-gateway.example.com",
    "ANTHROPIC_AUTH_TOKEN": "sk-gateway-key"
  }
}
```

个人长期配置放 `~/.claude/settings.json`；单项目测试放 `.claude/settings.local.json`，并确认它不会进入 Git。团队共享 Base URL 可以放项目 `settings.json`，真实 token 必须由环境变量、密钥管理或 `apiKeyHelper` 注入，不要提交。

### 2.4 Key 和 Token 怎么选

| 变量 | 默认发送方式 | 适合 |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | `x-api-key` | 网关模拟 Anthropic API Key |
| `ANTHROPIC_AUTH_TOKEN` | `Authorization: Bearer` | 网关发放 Bearer token |
| `apiKeyHelper` | 运行脚本取回凭据 | Vault、短期 token、轮换密钥 |
| `ANTHROPIC_CUSTOM_HEADERS` | 额外自定义 header | 组织路由、租户、非标准认证 |

如果同时存在订阅登录和 API Key，交互模式会提示是否用 Key 覆盖订阅；`-p` 非交互模式中，存在 `ANTHROPIC_API_KEY` 时会直接使用它。排查时先明确当前凭据来源。

---

## 3. 先验证网关协议，再启动复杂任务

### 3.1 最小 Messages API 请求

```bash
curl -sS -w '\n%{http_code}\n' -X POST "$ANTHROPIC_BASE_URL/v1/messages" \
  -H "Authorization: Bearer $ANTHROPIC_AUTH_TOKEN" \
  -H 'anthropic-version: 2023-06-01' \
  -H 'content-type: application/json' \
  -d '{"model":"claude-sonnet-4-6","max_tokens":1,"messages":[{"role":"user","content":"."}]}'
```

PowerShell：

```powershell
Invoke-RestMethod -Method Post -Uri "$env:ANTHROPIC_BASE_URL/v1/messages" `
  -Headers @{ Authorization = "Bearer $env:ANTHROPIC_AUTH_TOKEN"; 'anthropic-version' = '2023-06-01' } `
  -ContentType 'application/json' `
  -Body '{"model":"claude-sonnet-4-6","max_tokens":1,"messages":[{"role":"user","content":"."}]}'
```

然后在 Claude Code 中：

```text
/status
请只读列出当前目录的顶层文件，不要修改任何内容。
```

### 3.2 网关兼容性检查清单

- `/v1/messages` 路径和 Anthropic Messages schema。
- `Authorization`/`x-api-key`、`anthropic-version`、`anthropic-beta` 和 `content-type` 正确转发。
- 流式 SSE 事件顺序、工具调用、图片/文档内容块、extended thinking、prompt caching 不被吞掉。
- 429、529、5xx、超时和 `retry-after` 能被网关保留；不要把所有错误改成 200。
- 1M context、effort、fast mode、自动 fallback 等能力必须有明确的模型能力映射。
- 模型 discovery 或 `/model` picker 需要稳定的模型列表接口时，按官方 Gateway Protocol 实现。
- 审计日志要脱敏 prompt、Key、Cookie 和项目机密。

只返回一段文本的“兼容接口”通常无法稳定支持 MCP、工具调用、流式输出和长上下文。

---

## 4. 多模型映射：alias、真实 ID、能力声明分开

### 4.1 Anthropic API 或兼容网关

```json
{
  "model": "sonnet",
  "fallbackModel": ["haiku", "sonnet"],
  "env": {
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "gateway/claude-opus-5-5",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "gateway/claude-sonnet-5-5",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "gateway/claude-haiku-5-5",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "gateway/claude-fable-5-1"
  }
}
```

真实 ID 必须是网关可识别并接受的名称。`opus`、`sonnet`、`haiku`、`fable` 是 Claude Code alias；它们不会因为你设置了 Base URL 就自动映射到网关的任意字符串。

### 4.2 Provider 专用映射

Amazon Bedrock：

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_BEDROCK_BASE_URL='https://llm-gateway.example.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-5-5'
```

Google Cloud 的 Agent Platform：

```bash
export CLAUDE_CODE_USE_VERTEX=1
export ANTHROPIC_VERTEX_BASE_URL='https://llm-gateway.example.com/vertex'
export ANTHROPIC_VERTEX_PROJECT_ID='your-gcp-project-id'
export CLOUD_ML_REGION='us-east5'
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1
```

Vertex 各模型可以使用对应 `VERTEX_REGION_CLAUDE_*` 变量；无法被当前 Claude Code 识别的模型 ID，需要用 `ANTHROPIC_DEFAULT_*_MODEL_SUPPORTED_CAPABILITIES` 声明 `effort`、`xhigh_effort`、`thinking`、`adaptive_thinking` 等能力。

Microsoft Foundry：

```bash
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_BASE_URL='https://llm-gateway.example.com/foundry'
export ANTHROPIC_FOUNDRY_API_KEY='sk-gateway-key'
```

Claude Platform on AWS：

```bash
export CLAUDE_CODE_USE_ANTHROPIC_AWS=1
export ANTHROPIC_AWS_BASE_URL='https://llm-gateway.example.com/anthropic-aws'
export ANTHROPIC_AWS_WORKSPACE_ID='wrkspc_01ABCDEFGHIJKLMN'
export CLAUDE_CODE_SKIP_ANTHROPIC_AWS_AUTH=1
```

每种 Provider 的环境变量、region、认证和模型 ID 要以当前官方 Provider 页面为准；不要把 Bedrock inference profile ARN 当成 Anthropic API 的 model ID。

### 4.3 1M context 和自定义模型

只有底层模型确实支持 1M context 时才使用：

```text
/model claude-sonnet-4-6[1m]
```

自定义模型可加入 `/model` picker：

```bash
export ANTHROPIC_CUSTOM_MODEL_OPTION='gateway/claude-opus-5-5'
export ANTHROPIC_CUSTOM_MODEL_OPTION_NAME='Opus via Gateway'
export ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION='Internal gateway deployment'
```

未被 Claude Code 识别的模型，effort、thinking、context 和 fallback 可能默认关闭；用 `modelOverrides` 或 `*_SUPPORTED_CAPABILITIES` 明确声明，不要只靠模型名猜。

---

## 5. 各使用界面的配置差异

| 界面 | 推荐方式 | 易错点 |
| --- | --- | --- |
| 终端 CLI | shell 环境变量或 settings | 新终端不会继承临时 `$env:`，检查 `/status` |
| VS Code | `claudeCode.environmentVariables` | 扩展终端和系统终端环境不同 |
| Desktop | 管理员下发；本地开发者模式配置 | SSH 会话需要 `sshHostAllowlist`，远端主机访问网关 |
| GitHub Actions | `ANTHROPIC_BASE_URL` + Secret | 不把 token 写进 YAML；Action 的 `anthropic_api_key` 也要指向网关 secret |
| Agent SDK | TypeScript 合并 `process.env`；Python `env` 继承 | TS 的 `options.env` 会替换整个环境，忘记展开会丢 PATH/凭据 |
| Cloud/Slack/Remote Control | 通常不能依赖本机网关变量 | 按官方 surface 说明配置；需要远端能访问网关 |

VS Code 示例：

```json
{
  "claudeCode.environmentVariables": [
    { "name": "ANTHROPIC_BASE_URL", "value": "https://llm-gateway.example.com" },
    { "name": "ANTHROPIC_AUTH_TOKEN", "value": "${env:GATEWAY_KEY}" }
  ]
}
```

Agent SDK TypeScript：

```ts
const result = query({
  prompt: '...',
  options: {
    env: {
      ...process.env,
      ANTHROPIC_BASE_URL: 'https://llm-gateway.example.com',
      ANTHROPIC_AUTH_TOKEN: process.env.GATEWAY_KEY
    }
  }
})
```

---

## 6. 额外配置：只在网关管理员要求时使用

### 自定义 header

```bash
export ANTHROPIC_CUSTOM_HEADERS='X-Org-Route: prod
X-Tenant: example'
```

### 凭据轮换

```json
{
  "apiKeyHelper": "powershell -NoProfile -File C:\\scripts\\get-gateway-key.ps1"
}
```

脚本只输出凭据，不要输出日志；设置合理权限和超时，轮换失败要让 Claude Code 明确报错。

### 关闭网关以外的非必要流量

```bash
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

该变量会关闭自动更新、部分 fast mode 可用性检查和非必要遥测/feature flags；它不等于“所有请求都只走网关”，例如 WebFetch 的域名安全预检仍可能访问 Anthropic。关闭后要建立自己的升级路径，并确认你需要的 `/skills` 同步、功能开关和模型 discovery 不会受影响。

### 路由确认

```text
/status
```

Provider 专用路由应看到类似：

```text
API provider: Amazon Bedrock
Bedrock base URL: https://llm-gateway.example.com/bedrock
AWS auth skipped
```

---

## 7. 用 CC Switch、LiteLLM 等工具时的自查

第三方切换器常见职责：保存多个 provider 配置、写入 settings/env、做模型映射、测速和故障切换。使用它们时每次切换后都检查：

1. 它写入了哪个 `settings.json`、哪个 shell profile 或哪个进程环境。
2. 旧的 `ANTHROPIC_*`、`CLAUDE_CODE_USE_*`、`BASE_URL` 是否仍然残留。
3. 当前 CLI 实际版本、`/status` 的 provider、模型和 auth 来源。
4. 它是否会把项目配置、凭据或自定义 header 回写到 Git 工作树。
5. 失败重试、fallback、计费和上下文窗口是否由网关实现，而不是 Claude Code 本身保证。

CC Switch 官方仓库：https://github.com/farion1231/cc-switch

LiteLLM、One API 等兼容层适合统一多 Provider，但其模型名、Responses/Messages 转换和工具调用支持会随版本变化；部署前用真实 MCP/tool-use、流式和长上下文请求验证。第三方工具不能绕过组织的 `allowedProviders`、`availableModels`、权限模式和 Managed settings。

---

## 8. 高频排障

| 症状 | 可能原因 | 处理顺序 |
| --- | --- | --- |
| CLI 能启动但首个请求 401 | token header 错、旧登录覆盖、网关需要 API key | `/status` → 清理冲突变量 → curl 验证 header |
| 改了 Base URL 仍走旧线路 | 终端未重开、设置层级被覆盖、切换器回写 | `Get-Command/which`、`/status`、检查 User/Project/Managed |
| 模型不支持 | 网关只接受自定义 ID、alias 未映射、Provider 需要 ARN/部署名 | 直接用真实 ID → `ANTHROPIC_DEFAULT_*_MODEL` → `modelOverrides` |
| 工具调用失败 | 网关丢 tool schema、流式事件或 beta header | Gateway Protocol 检查，先用最小 tool-use 请求 |
| 1M/effort 不可用 | 上游不支持、网关丢 beta、能力未声明 | 去掉 `[1m]` 对比，声明 `SUPPORTED_CAPABILITIES` |
| 频繁 529/429 | 上游过载或网关限流 | 保留 429/529 和 retry-after，配置 fallback/重试预算 |
| Remote Control/Cloud 不能走本机网关 | 远端环境看不到本机 `localhost` 和 shell 变量 | 给远端配置可达 URL，或明确使用官方登录线路 |
| 费用和订阅显示不一致 | 网关按自己的计费；API Key 覆盖订阅 | `/usage` 与网关账单分开核对 |
| 切换后设置又被改回 | CC Switch/MDM/登录同步回写 | 关闭自动回写，确认最终生效文件和优先级 |

不要用 `--dangerously-skip-permissions` 来修复网关问题；权限模式和网络认证是两条独立链路。

---

## 9. 推荐的安全上线顺序

1. 让网关管理员提供 Base URL、凭据类型、支持的 model ID、上下文/工具/流式能力和审计策略。
2. 在临时 shell 环境设置变量，用 curl 验证 `/v1/messages`。
3. 启动 Claude Code，确认 `/status` 的 provider、Base URL、模型和 auth 来源。
4. 先做只读任务，再做一个小编辑和 MCP/tool-use 任务。
5. 验证 429/529、超时、fallback、1M/effort、图片/文档和长响应。
6. 确认日志脱敏、密钥轮换和关闭线路后的恢复方式。
7. 个人配置稳定后再写 settings；团队配置用 Managed settings 或安全分发，不把 token 提交进仓库。

---

## 10. 参考资料

本文核验日期：2026-10-12；版本快照：Claude Code `2.1.296`。

- Connect Claude Code to an LLM gateway：https://code.claude.com/docs/en/llm-gateway-connect
- Gateway compatibility guide：https://code.claude.com/docs/en/llm-gateway-protocol
- LLM gateway overview：https://code.claude.com/docs/en/llm-gateway
- Model configuration：https://code.claude.com/docs/en/model-config
- Environment variables：https://code.claude.com/docs/en/env-vars
- Settings reference：https://code.claude.com/docs/en/settings-reference
- Amazon Bedrock：https://code.claude.com/docs/en/amazon-bedrock
- Google Cloud Agent Platform：https://code.claude.com/docs/en/google-vertex-ai
- Microsoft Foundry：https://code.claude.com/docs/en/microsoft-foundry
- Claude Platform on AWS：https://code.claude.com/docs/en/claude-platform-on-aws
- Enterprise deployment overview：https://code.claude.com/docs/en/third-party-integrations
- Claude Code GitHub Releases：https://github.com/anthropics/claude-code/releases
- CC Switch（第三方配置管理）：https://github.com/farion1231/cc-switch
- LiteLLM：https://github.com/BerriAI/litellm

Gateway 是基础设施，不是“换一个 URL 就完成的模型兼容层”。请以网关实际协议、日志和计费为准，并定期按官方 changelog 复核变量名和 Provider 行为。
