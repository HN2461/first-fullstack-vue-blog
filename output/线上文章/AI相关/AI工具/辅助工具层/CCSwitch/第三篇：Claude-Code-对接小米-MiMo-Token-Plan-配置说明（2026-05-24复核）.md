---
title: "第三篇：Claude Code 对接小米 MiMo Token Plan 配置说明（2026-05-24复核）"
slug: "ai-ccswitch-claudecode-mimotokenplan-736772f0"
summary: "基于 2026-05-24 小米 MiMo 官方 Claude Code 与 Token Plan 文档复核，整理 tp/sk 区分、区域 Base URL、模型映射、Windows 配置路径、1M 长上下文启用方式、使用边界与 CC Switch 同步排查要点。"
category: "CCSwitch"
tags:
  - "CC Switch"
  - "Claude Code"
  - "MiMo"
  - "Token Plan"
  - "中转配置"
  - "Provider"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291d8a2b1c68f2cac062"
originalSlug: "ai-ccswitch-claudecode-mimotokenplan-736772f0"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第三篇：Claude Code 对接小米 MiMo Token Plan 配置说明（2026-05-24复核）

> 资料核对时间：2026-05-24  
> 说明：本文以 MiMo 官方 `Claude Code Configuration`、`Quick Access`、`Subscription Instructions` 为准，适合已经购买 `Token Plan`、想让 Claude Code 走 MiMo 线路的人。  
> 放在 `CC Switch` 专题里，是因为它本质上仍是一份 Provider / 中转配置文；即使你最后不用 CC Switch，只手改 `.claude/settings.json` 也能照着做。

[[toc]]

---

## 1. 先说结论

- `Token Plan` 必须使用订阅页提供的专属 `Base URL` 和 `tp-` 开头的 Key。
- 不能拿按量付费 API 的 `sk-` Key 去配 `Token Plan`，也不能反过来混用。
- Claude Code 这里不要只配 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`，最好把 `ANTHROPIC_MODEL` 与三项默认模型映射一起配齐，统一指向 `mimo-v2.5-pro`。
- 如果你要开 MiMo 当前支持的 **1M 长上下文**，模型名要写成 `mimo-v2.5-pro[1m]`，不要只写基础版。
- 如果订阅页显示的是新加坡区或欧洲区地址，要以订阅页实际显示为准，不要死记中国区地址。

---

## 2. 先分清你走的是哪条线路

MiMo 官方把 Claude Code 接入分成两条：

| 线路 | 计费方式 | Anthropic 协议 Base URL | Key 形式 | 适合场景 |
|------|----------|--------------------------|----------|----------|
| 按量付费 API | 用多少算多少 | `https://api.xiaomimimo.com/anthropic` | `sk-xxxxx` | 轻量临时使用 |
| Token Plan | 包月 / 包年套餐 | 订阅页展示的专属地址 | `tp-xxxxx` | 长时间在 AI 编程工具里使用 |

对 `Token Plan` 而言，MiMo 官方当前给出了 3 组区域地址：

- 中国区：`https://token-plan-cn.xiaomimimo.com/anthropic`
- 新加坡区：`https://token-plan-sgp.xiaomimimo.com/anthropic`
- 欧洲区：`https://token-plan-ams.xiaomimimo.com/anthropic`

虽然很多人实际拿到的是 `cn` 地址，但官方同时明确写了：**最终仍以你的订阅页显示为准**。

---

## 3. Token Plan 有几个边界条件，原稿里没写全

这几条是 MiMo 官方文档里明确提到的，建议主人顺手记住：

1. `tp-` Key 只在订阅有效期内可用，套餐到期后要续费才能继续使用。
2. `Token Plan` 的额度是给 AI Agent / 编程工具场景准备的，不建议拿去做自动脚本、定时任务或自建后端服务。
3. 如果超出允许范围使用，平台有权暂停服务或封禁对应的 API Key。
4. 多个受支持工具会共享同一份套餐额度，不是每个工具各算各的。

所以这篇文章更准确的定位不是“通用 MiMo API 教程”，而是“**编程工具场景下**的 Claude Code / CC Switch 配置说明”。

---

## 4. Claude Code CLI 的最小可用配置

### 4.1 官方前置条件

- Claude Code 需要 `Node.js 18+`
- Windows 官方建议先安装 `WSL` 或 `Git for Windows`，然后在 `WSL` / `Git Bash` 里执行安装命令

安装命令：

```bash
npm install -g @anthropic-ai/claude-code
```

验证：

```bash
claude --version
```

### 4.2 配之前先清掉旧环境变量

MiMo 官方专门提醒：先清掉系统里残留的下面两个环境变量，避免和当前配置打架：

- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL`

如果主人之前切过 Anthropic 官方、别的中转站，或者让 CC Switch / 其他脚本写过全局变量，这一步尤其重要。

### 4.3 配置文件位置

Windows 下主要看这两个文件：

- `C:\Users\你的用户名\.claude\settings.json`
- `C:\Users\你的用户名\.claude.json`

如果 `.claude` 目录还不存在，可以自己创建。

### 4.4 `settings.json` 正确写法

下面这份是按 **Token Plan + Anthropic 兼容协议** 整理后的最小可用版本：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://token-plan-cn.xiaomimimo.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "tp-替换成你的Key",
    "ANTHROPIC_MODEL": "mimo-v2.5-pro",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "mimo-v2.5-pro",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "mimo-v2.5-pro",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "mimo-v2.5-pro"
  }
}
```

注意 3 件事：

1. 如果你的订阅页显示的是 `sgp` 或 `ams` 地址，就把 `ANTHROPIC_BASE_URL` 换成对应区域。
2. `tp-替换成你的Key` 只能替换成套餐页给你的 `tp-` Key，不能换成 `sk-`。
3. 主人原稿里的 `API_TIMEOUT_MS`、`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 不是 MiMo 官方这份最小示例里的必填项，建议先不加，先按最小配置跑通。

### 4.5 `.claude.json` 至少要有这项

```json
{
  "hasCompletedOnboarding": true
}
```

### 4.6 让配置真正生效

MiMo 官方原文的动作顺序很明确：

1. 配完文件后，重新打开终端窗口
2. 进入项目目录
3. 运行 `claude`
4. 第一次启动时选择 `Trust This Folder`
5. 进入后执行 `/status` 看当前模型和配置状态

---

## 5. 为什么模型映射最好四项都配齐

这点 MiMo 官方虽然没有单独写成“排障章节”，但它给出的示例已经把下面四项全部写满：

- `ANTHROPIC_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`

这里我给主人的结论是：

- **官方事实**：MiMo 示例确实要求四项都指向 `mimo-v2.5-pro`
- **结合接入经验的推断**：如果你只配 `Base URL` 和 `Key`，某些 Claude Code / 插件场景仍可能尝试请求官方别名模型（例如 `claude-sonnet-*`），最后在 MiMo 侧报“不支持该模型”

所以最稳妥的做法不是“猜它会不会自动映射”，而是**照官方完整示例一次配齐**。

---

## 6. 如果主人要开 1M 长上下文

MiMo 当前文档补了一条非常实用的新说明：

- 支持 1M 上下文的模型，需要在模型名后面显式追加 `[1m]`
- 不追加后缀时，走的是普通上下文版本

如果主人确实要让 Claude Code 全程走 1M 长上下文，最稳的写法是把 4 个模型字段都切到同一个长上下文模型名，例如：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://token-plan-cn.xiaomimimo.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "tp-替换成你的Key",
    "ANTHROPIC_MODEL": "mimo-v2.5-pro[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "mimo-v2.5-pro[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "mimo-v2.5-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "mimo-v2.5-pro[1m]"
  }
}
```

配置后建议进 Claude Code 执行：

```text
/context
```

如果状态里能看到 1M 相关上下文信息，说明这一层已经切对了。

---

## 7. 如果主人还在用 CC Switch

放到 `CC Switch` 专题里，最关键的一条经验其实是：

**不要同时存在两份互相打架的配置快照。**

如果当前 Claude Code 的 Provider 仍由 CC Switch 管理，那么至少要确保它最终写回去的是同一组值：

- `ANTHROPIC_AUTH_TOKEN=tp-你的Key`
- `ANTHROPIC_BASE_URL=订阅页显示的 Anthropic 地址`
- `ANTHROPIC_MODEL=mimo-v2.5-pro`
- `ANTHROPIC_DEFAULT_SONNET_MODEL=mimo-v2.5-pro`
- `ANTHROPIC_DEFAULT_OPUS_MODEL=mimo-v2.5-pro`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL=mimo-v2.5-pro`

否则常见现象就是：

1. 你手动改好了 `C:\Users\你的用户名\.claude\settings.json`
2. 后面在 CC Switch 里一切 Provider、导出配置或切应用
3. 它又把旧的 Provider 快照写回去了

所以如果主人后续是通过 CC Switch 切来切去，那就把 **CC Switch 里的 Claude Provider** 也同步改成这一套，不要只改本地文件。

---

## 8. VS Code 插件是否要单独配置

MiMo 官方文档补了一条很有用的信息：

- 如果 Claude Code CLI 已经装好，**VS Code 插件会自动复用 CLI 配置**
- 只有当你想让插件单独走另一套线路时，才需要额外在 VS Code 设置里手填环境变量

官方示例里，VS Code 侧至少会涉及：

- `claudeCode.selectedModel = "mimo-v2.5-pro"`
- `claudeCode.environmentVariables`

也就是说，**大多数情况下先把 CLI 配好就够了**，没必要在插件里再配第二遍。

---

## 9. 一组更稳的排障顺序

### 8.1 能启动，但返回模型不支持

优先检查：

- 有没有漏掉 `ANTHROPIC_MODEL`
- 三项默认模型映射有没有配齐
- 模型名是不是仍然写成了 Anthropic 官方模型别名

### 8.2 明明买的是 Token Plan，却一直走错地址

优先检查：

- 有没有把 `Token Plan` 写成按量付费的 `https://api.xiaomimimo.com/anthropic`
- 你当前该用的到底是 `cn`、`sgp` 还是 `ams`
- 最终应以订阅页显示地址为准

### 8.3 改完文件还是不生效

优先检查：

- 旧终端是不是还没关
- `Claude Code` 进程是不是没完全退出
- 系统里是否残留旧的 `ANTHROPIC_AUTH_TOKEN`
- 系统里是否残留旧的 `ANTHROPIC_BASE_URL`
- CC Switch 是否又把旧 Provider 写回来了

### 8.4 `tp-` Key 过一阵子突然不能用

先别急着怀疑配置坏了，官方文档写得很清楚：

- `tp-` Key 只在订阅有效期内可用
- 过期后需要续费

### 8.5 想拿这套 Key 去跑自动脚本 / 后端服务

不建议这样做。  
`Subscription Instructions` 明确写了，`Token Plan` 额度只允许用于编程工具场景；明显偏离 Coding 场景的 API 调用，可能被判定为违规使用。

---

## 10. 自检方式，别再写“本机已经 200”这种一次性结论

主人原稿里写了“本机已验证 HTTP 200、返回 OK”，这对当时的机器和真实 Key 当然有参考价值，但它**不是能长期复用的知识库结论**。

更稳的写法应该是：

1. 先用 `/status` 看 Claude Code 当前模型与配置
2. 如果还不放心，再按 MiMo 官方 `Quick Access` 里的 curl 模板做一次真实连通验证
3. curl 里的 `BASE_URL` 和 `MIMO_API_KEY` 都要替换成你自己订阅页当前显示的真实值

这样别人抄这篇文章时，不会误以为“只要照抄固定地址和固定结果就一定通”。

---

## 11. 官方参考

- MiMo Claude Code 配置：<https://platform.xiaomimimo.com/docs/integration/claudecode>
- MiMo Token Plan 快速接入：<https://platform.xiaomimimo.com/docs/en-US/tokenplan/quick-access>
- MiMo Token Plan 订阅说明：<https://platform.xiaomimimo.com/docs/en-US/tokenplan/subscription>
- Anthropic Claude Code 模型配置：<https://docs.anthropic.com/en/docs/claude-code/model-config>
- Anthropic Claude Code 设置说明：<https://docs.anthropic.com/en/docs/claude-code/settings>
- Claude Code VS Code 文档：<https://code.claude.com/docs/en/vs-code>
