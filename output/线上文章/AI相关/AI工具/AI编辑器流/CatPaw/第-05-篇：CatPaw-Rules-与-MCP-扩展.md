---
title: "第 05 篇：CatPaw Rules 与 MCP 扩展"
slug: "ai-ai-catpaw-catpaw-rules-mcp-6f2f4d79"
summary: "基于公开用户手册重新整理 CatPaw 的 Rules、索引兼容和 MCP 扩展能力，聚焦团队规范如何固化到 AI 工作流里。"
category: "CatPaw"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "AI编辑器流"
  - "CatPaw"
tags:
  - "CatPaw"
  - "Rules"
  - "MCP"
  - "AI 工作流"
  - "扩展"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291d8a2b1c68f2cabe76"
originalSlug: "ai-ai-catpaw-catpaw-rules-mcp-6f2f4d79"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.576Z"
updatedAt: "2026-07-31T11:16:25.569Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 05 篇：CatPaw Rules 与 MCP 扩展
如果说 Ask / Agent 解决的是“AI 能不能帮我干活”，  
那 Rules 和 MCP 解决的就是：

- AI 能不能按我的规矩干活
- AI 能不能连到我需要的外部能力

## 1. Rules 是什么

官方手册给的定义很直接：

- Rules 是一种 `可持久化` 的规则配置
- 让 AI 按照团队或个人偏好工作

也可以把它理解成：

> 给 CatPaw 写一份长期有效的“项目说明书”和“行为规范”。

## 2. Rules 文件放哪

公开手册给出的主路径是：

- `.catpaw/rules/{文件名}.md`

也就是说，Rules 本质上就是项目里可版本化的 Markdown 规则文件。

## 3. Rules 有 4 种类型

| 类型 | 典型配置 | 含义 |
| --- | --- | --- |
| Always | `ruleType: Always` | 始终生效 |
| Model Request | `ruleType: Model Request` | 由模型判断何时调用 |
| Auto Attached | `ruleType: Auto Attached` + `globs` | 文件或路径命中时自动附带 |
| Manual | `ruleType: Manual` | 需要手动 `@` 调用 |

### 怎么选最合适

可以简单这么记：

- 团队通用规范：`Always`
- 某些特殊场景再触发：`Model Request`
- 某类文件专用规则：`Auto Attached`
- 临时手册或专项约束：`Manual`

## 4. `Model Request` 和 `Auto Attached` 最容易混

### `Model Request`

官方手册说得很清楚：

- `name`
- `description`

这两个字段会先发给模型，模型自己判断当前对话需不需要拉完整规则内容。

所以这类 Rule 更像“智能触发”。

### `Auto Attached`

这一类则更偏“命中文件就自动带上”。  
需要配：

```md
globs: *.java,*.tsx,src/config/**/*.json
```

这意味着：

- 你能让某类文件天然带某套规范
- 比如前端文件一套，后端文件一套

## 5. Rules 怎么创建

公开手册给出的步骤是：

1. 在对话框输入 `@`
2. 选择 `Rules`
3. 选择“添加新 Rule”
4. 设定规则名称
5. 在模板中填写 `ruleType`
6. 编写规则说明与内容

如果是 `Auto Attached`，还要配置 `globs`。

## 6. Rules 里建议写什么

这部分公开手册写得比较全，我给主人压缩成最值钱的 4 类：

### 项目信息

- 项目是什么
- 技术栈是什么
- 团队约定的版本边界是什么

### 代码风格

- 缩进
- 命名
- 模块拆分习惯
- 注释要求

### AI 输出要求

- 回答要偏简洁还是偏详细
- 改代码前是否先给方案
- 测试、异常处理、文档要不要一起补

### 工作流程

- 先分析再改
- 先列风险再执行
- 改完要不要补单测

Rules 真正值钱的不是“多写”，而是“把团队反复说的话，变成默认上下文”。

## 7. Rules 还有几项兼容能力

公开手册里这块信息量很大，比较关键的是：

- 支持 `嵌套 rules`
- 可兼容 `CLAUDE.md`
- 可兼容 `.cursor/rules`
- `AGENT.md` 在项目里会默认作为 agent 对话的 README

这代表什么？

- 如果主人本来就在用别的 AI 工具做规范沉淀，不一定要从零重写
- 一部分已有规则资产可以直接复用

另外手册还提到：

- 选中代码点“单测”时，会默认携带特定测试规则文件

这说明 Rules 已经不只是“聊天约束”，而是深入到具体工作流里了。

## 8. Rules 配合 Git，才是真正的团队资产

官方手册明确建议：

- Rules 文件可以跟代码一起提交到远程仓库

这样团队成员拉代码时，就能同步获得同样的 AI 规则。

这件事的真正意义是：

- 减少“每个人各调各的 prompt”
- 把口头规范沉淀成仓库规范
- 让 AI 输出更一致

## 9. MCP 是什么

官方手册定义：

- `MCP = Model Context Protocol`
- 允许 AI 应用访问外部工具和数据

CatPaw 当前公开支持 3 种 MCP Server 连接类型：

- `STDIO`
- `SSE`
- `Streamable HTTP`

这说明 CatPaw 的扩展能力，走的是 MCP 生态这条公开标准路线，不是闭门造车的私有黑盒。

## 10. MCP 在 CatPaw 里怎么加

公开手册给出的方式是：

- 从第三方 MCP 市场拿到标准 JSON 配置
- 在 CatPaw 里点“手动添加”
- 把 JSON 粘进去
- 保存后，Agent 自动连接对应 MCP 服务

之后你还能：

- 禁用某个 Server
- 禁用某个 Tool

这样做的意义是控制：

- AI 能看什么
- AI 能用什么
- 上下文里到底放多少工具

## 11. MCP 使用时要注意什么

公开手册明确给了两个边界：

### 边界 1：有数量限制

CatPaw 对这些东西有一定限制：

- 可保持连接的 MCP Server 数量
- 传递给模型的 MCP Tool 数量

所以不是加得越多越好。

### 边界 2：第三方服务不等于官方背书

公开免责声明写得很明确：

- 第三方 MCP Server 由第三方开发者维护
- CatPaw 不对其运行状况和数据内容承担责任

这就意味着：

- 主人要自己判断来源是否可靠
- 涉及隐私、账号、生产数据时更要谨慎

## 12. 安全和透明度，公开资料里能确认什么

FAQ 安全页至少公开确认了两点：

- 用户隐私和数据安全以官方 `用户协议` 为准
- AI 生成内容会带 `AI 生成` 标识

这不代表你就可以无脑把所有敏感信息都塞给模型，但至少说明官方在公开层面有做透明提示。

## 13. 这一篇最值得背的结论

> Rules 负责把“我们团队怎么干”写进默认上下文，MCP 负责把“AI 还能连哪些外部能力”接进来。

## 公开资料来源

- 用户手册-Rules：https://catpaw.meituan.com/guides/settings/rules
- 用户手册-索引 & Docs：https://catpaw.meituan.com/guides/settings/indexanddocs
- 用户手册-MCP：https://catpaw.meituan.com/guides/settings/mcp
- 用户手册-安全性问题：https://catpaw.meituan.com/guides/faq/security
- MCP 官方文档：https://modelcontextprotocol.io/docs/getting-started/intro
