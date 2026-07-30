---
title: "第五篇：Claude Code 接入中转、LLM Gateway 与多模型线路实战（程序员版）"
slug: "ai-agent-claudecode-claudecode-llmgateway-66916234"
summary: "基于 2026-07-04 Claude Code 官方 Model Config、Settings 与第三方接入资料复核更新，面向程序员说明 Claude Code 如何接入中转、LLM Gateway 和多模型线路，重点讲清 Base URL、Key、模型映射、最小配置模板、验证顺序与高频排障。"
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
updatedAt: "2026-07-30T14:24:30.378Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 第五篇：Claude Code 接入中转、LLM Gateway 与多模型线路实战（程序员版）

> 这一篇直接讲真实使用场景。  
> 主人如果已经开始折腾 MiMo、GLM、各种 Anthropic 兼容中转，或者用 CC Switch 切来切去，那这篇就该解决你最常见的那类问题：明明感觉只是换个 `Base URL` 和 `Key`，为什么实际还会卡在模型映射、旧环境变量和回写覆盖上。

[[toc]]

---

## 先给结论

Claude Code 接中转、Gateway、多模型线路，核心通常就是这 3 件事：

1. 改 `ANTHROPIC_BASE_URL`
2. 改 `ANTHROPIC_AUTH_TOKEN`
3. 补模型映射

但真正容易出错的地方，不在“会不会填字段”，而在：

- 协议是不是 Anthropic 兼容
- 旧环境变量有没有残留
- `ANTHROPIC_MODEL` 和默认模型映射有没有配齐
- 终端是不是已经重新读到了新配置
- CC Switch 之类工具有没有把旧快照写回来

所以这篇不想写成泛泛而谈的“第三方线路判断”，而是直接给你可抄的模板和排障顺序。

---

## 1. Claude Code 接中转时，实际在改哪些东西

常见改动点主要是这些环境变量：

- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `ANTHROPIC_DEFAULT_FABLE_MODEL`

你可以这样记：

- `Base URL` 决定请求发到哪
- `Auth Token` 决定你用什么身份去调
- 模型映射决定 Claude Code 里的模型别名最终落到哪个真实模型

很多人只改前两项，最后 CLI 能启动，但一做真实任务就报：

- 模型不支持
- 找不到模型
- 返回值不符合预期

这时候根因往往不是线路没通，而是模型映射没配。

按 2026-07-04 官方 `model-config` 文档，Claude Code 当前模型别名不只 Sonnet / Opus / Haiku，还包括 `fable` 和 `best`。其中 `fable` 偏文档、写作、清晰沟通类任务；如果你的第三方网关支持这类映射，建议一起配齐。`best` 是自动选择别名，通常不直接映射成某个固定环境变量。

---

## 2. 第三方线路最常见的 4 种形态

### 第一类：Anthropic 兼容中转

它通常给你：

- 一个 `Base URL`
- 一个 `Key`
- 一句“兼容 Claude / Anthropic”

这类最常见，也最适合先从最小模板跑通。

### 第二类：包月 / 订阅型线路

例如 MiMo Token Plan。  
特点通常是：

- Key 形式和按量 API 不一样
- `Base URL` 可能有区域差异
- 建议把模型映射一次配齐

### 第三类：多模型 Gateway

这类最容易出模型别名问题。  
因为一个入口下面可能挂多个真实模型，你得自己决定：

- Sonnet 指向谁
- Opus 指向谁
- Haiku 指向谁
- Fable 指向谁

### 第四类：通过 CC Switch 等工具统一管理

这种情况下，Claude Code 最终吃到的仍然是：

- `Base URL`
- `Key`
- 模型映射

只是这些值可能是被外部工具回写进去，而不是你手改文件。

---

## 3. 最小模板一：只手改 `settings.json`

如果一条线路本身就是 Anthropic 兼容入口，那 Claude Code 最小可用配置可以先从下面这个模板开始：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://你的中转或网关地址",
    "ANTHROPIC_AUTH_TOKEN": "你的Key",
    "ANTHROPIC_MODEL": "你的真实模型名",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "你的真实模型名",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "你的真实模型名",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "你的真实模型名",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "你的真实模型名"
  }
}
```

### 什么时候适合先全都指向同一个模型

如果这条线路只提供一个主模型，或者你当前只是想先验证“这条线路到底通不通”，最稳的做法就是先把 `ANTHROPIC_MODEL` 和 4 个默认模型映射字段都统一指过去。

例如：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://example.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "tp-or-sk-替换成你的Key",
    "ANTHROPIC_MODEL": "my-main-model",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "my-main-model",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "my-main-model",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "my-main-model",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "my-main-model"
  }
}
```

先跑通，再做细分，比一上来就追求“完美映射”更稳。

---

## 4. 最小模板二：分开映射 Sonnet / Opus / Haiku / Fable

如果你接的是多模型 Gateway，这种模板更接近真实生产用法：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://你的网关地址",
    "ANTHROPIC_AUTH_TOKEN": "你的Key",
    "ANTHROPIC_MODEL": "sonnet-like-model",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "sonnet-like-model",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "opus-like-model",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "haiku-like-model",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "writing-like-model"
  }
}
```

这种写法适合：

- 网关下挂了多个真实模型
- 你希望不同别名落到不同档位
- 你清楚这几个模型各自支持什么上下文和计费策略

但前提是你真的知道服务商给你的模型名是“真实模型名”，不是营销名。

这里千万不要直接把官方别名当真实模型名照抄给第三方线路。第三方 Gateway 可能要求 `claude-sonnet-5-20260229`、`glm-xxx`、`mimo-xxx` 这类服务商自己的模型 ID；每次发布或复习配置前，都要以服务商后台当前文档为准。

---

## 5. 最小模板三：通过 CC Switch 管理时该看什么

主人前面说的“利润 CC 不就是改个配置文件和换一下 key 吗”，如果说的是这类工具的体感，其实很贴切。  
但要补一句：

- **你感知到的是切换动作简单，不代表底层配置层就没有坑**

如果你是通过 CC Switch 切 Claude Code Provider，真正要确认的是：

1. 它最终写回了什么 `Base URL`
2. 它最终写回了什么 `Key`
3. 它有没有把模型映射一起写对

也就是说，你不能只看界面里“当前 Provider 已切换”，还要回到 Claude Code 实际吃的配置去验证。

### CC Switch 场景下最值得自查的三件事

1. 你手改的本地配置有没有被它覆盖
2. 当前 Provider 用的是真实模型名还是展示名
3. 切换后旧终端有没有完全退出重开

---

## 6. 为什么“只改个配置文件和换个 Key”还是经常出问题

最常见的坑基本就 4 类：

### 旧环境变量残留

如果系统里还留着旧的：

- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_AUTH_TOKEN`

那你文件里虽然改了，CLI 实际未必读的是这套。

### 终端没重开

你改完配置文件，但当前终端还拿着旧环境。  
最后就会形成“我明明改了，为什么没生效”的错觉。

### 模型映射没配

这是最常见的大坑。  
尤其是第三方线路只支持自定义模型 ID 时，如果你没配：

- `ANTHROPIC_MODEL`
- `ANTHROPIC_DEFAULT_*`

CLI 很可能在实际请求阶段才炸。

### 外部工具回写覆盖

手改本地文件之后，CC Switch 或别的脚本又把旧配置写回去了。  
这种时候如果你没回头核最终配置，很容易一直怀疑是线路服务商的问题。

---

## 7. 最小自检流程：先别上复杂项目

中转接完以后，不要直接拿一个大重构去赌。  
最稳的自检顺序是：

### 第一步：确认 CLI 本体正常

先确认：

```bash
claude
```

至少能正常进入交互。

### 第二步：看当前状态

```text
/status
```

先确认没有明显异常。

### 第三步：最小解释任务

```text
先不要修改文件。
请解释这个仓库的结构和主要入口。
```

先确认基本对话、上下文处理和模型链路没问题。

### 第四步：最小修改任务

```text
请只修改一个很小的文案，并告诉我如何验证。
```

再确认：

- 文件修改正常
- 工具调用正常
- 真实动作阶段不会炸模型映射

---

## 8. 最常见的 6 个排障点

### 问题一：CLI 能启动，但一做任务就报模型不支持

先查模型映射，不要先怀疑安装。

### 问题二：明明改了 `Base URL`，实际还是走旧线路

先查旧环境变量和终端是否重开。

### 问题三：系统终端能用，工具内终端不能用

先查不同终端环境是不是不一致。

### 问题四：手改好了，过一会儿又被改回去

先查 CC Switch 或其他配置管理工具是否回写。

### 问题五：中转站说支持 Claude，实际 Claude Code 不稳

先确认它支持的是：

- Anthropic 兼容协议
- 还是只是“网页能聊天”

这两件事不是一回事。

### 问题六：切了中转以后费用或额度表现不符合预期

这时问题往往不在 Claude Code，而在：

- 中转计费规则
- 模型真实映射
- 长上下文档位

---

## 9. 一句话判断：这条线路值不值得先接

如果主人手上的线路满足这 4 条，就很值得先拿来试：

1. 它明确说自己兼容 Anthropic 协议
2. 它能给出真实 `Base URL`
3. 它能给出真实模型名
4. 你能说清楚自己是在按量、包月还是 Gateway 场景

如果连这 4 条都说不清，那先别急着配，先回去问清服务商。

---

## 10. 这篇读完后，主人最该做什么

如果你接下来就要给 Claude Code 接中转，我最建议你按这 5 步直接做：

1. 先确认是不是 Anthropic 兼容协议
2. 准备好 `Base URL`、`Key`、真实模型名
3. 用这篇的最小模板先配齐 `ANTHROPIC_MODEL` 和 `ANTHROPIC_DEFAULT_*`
4. 重开终端后用 `/status` 验证
5. 只跑最小解释任务和最小修改任务，不要直接上复杂项目

如果你还想继续往细里看：

- MiMo 包月线路，去看 [第三篇：Claude Code 对接小米 MiMo Token Plan 配置说明](#/note/AI工具/05_辅助工具层/CCSwitch/第三篇_ClaudeCode对接小米MiMoTokenPlan配置说明_2026-05)
- 中转计费和 Provider 思路，去看 CC Switch 与基础计费专题

---

## 参考资料

- https://docs.anthropic.com/en/docs/claude-code/model-config
- https://docs.anthropic.com/en/docs/claude-code/settings
- https://platform.xiaomimimo.com/docs/integration/claudecode
- https://docs.bigmodel.cn/cn/guide/develop/claude
