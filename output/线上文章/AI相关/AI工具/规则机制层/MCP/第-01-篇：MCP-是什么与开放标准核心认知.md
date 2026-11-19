---
title: "第 01 篇：MCP 是什么与开放标准核心认知"
slug: "ai-mcp-mcp-067b747a"
summary: "从零解释 MCP 的定义、组成、工作流程、价值边界与安全治理，建立“协议层认知”而不是“某个单一 MCP 工具教程”的视角。"
category: "MCP"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "MCP"
tags:
  - "MCP"
  - "Model Context Protocol"
  - "Agent"
  - "开放标准"
  - "面试"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf96"
originalSlug: "ai-mcp-mcp-067b747a"
originalStatus: "published"
publishedAt: "2026-05-24T14:08:06.903Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 01 篇：MCP 是什么与开放标准核心认知

复核日期：2026-11-18。当前官方稳定规范入口为 **2026-07-28**；具体客户端和服务端是否实现该版，需要分别确认，不能仅看软件安装日期。

## 稳定规范与旧实现的关键区别

| 关注点 | 2025-11-25 等旧版 | 2026-07-28 稳定规范 |
| --- | --- | --- |
| 初始化 | `initialize` / `notifications/initialized` 握手 | 取消初始化握手，每个请求在 `_meta` 中携带协议版本和客户端能力 |
| 能力发现 | 连接初始化返回能力 | 服务端必须实现 `server/discover`，客户端可先调用它进行版本选择 |
| HTTP 会话 | 可使用 `Mcp-Session-Id` | 取消协议级 session；跨调用业务状态使用显式句柄 |
| 通知订阅 | 独立 HTTP GET SSE、资源订阅方法 | 使用 `subscriptions/listen` 的 POST 响应流接收已订阅的变化通知 |
| 补充输入 | 服务端发起 sampling、elicitation 等请求 | MRTR：返回 `resultType: input_required`，客户端携带输入重试原请求 |
| 长任务 | 核心中的实验性 Tasks | 独立 Tasks 扩展，使用 `tasks/get`、`tasks/update` 等方法 |
| 流中断 | 曾支持 SSE 事件恢复 | 移除 `Last-Event-ID` 恢复；新请求 ID 重发，业务写操作仍须自行防重 |

所有新规范结果要求 `resultType`；兼容旧版时，缺省结果类型按 `complete` 处理。列举/读取类结果新增 `ttlMs` 和 `cacheScope`，缓存必须遵循公开/私有范围，不能把一个用户的私有结果复用给其他用户。

当前标准传输是 **stdio** 与 **Streamable HTTP**。Streamable HTTP 的响应仍可使用 SSE，所以“旧 HTTP+SSE 传输已弃用”不等于“SSE 不能再用”。stdio 的标准输出用于协议消息，诊断日志应写入标准错误。

这些是已发布稳定规范的变化，不再仅仅是 draft 趋势。旧客户端互操作要走官方版本回退规则，不能把新旧请求字段随意拼接。

## 一、先把概念说清楚

MCP（Model Context Protocol）本质上是一个开放协议。
它解决的问题不是“模型怎么回答”，而是“模型如何安全、标准化地连接外部能力”。

简单理解：

1. LLM 本体擅长理解和生成文本
2. 现实开发又需要文件、数据库、浏览器、命令行、知识库等外部能力
3. MCP 用统一协议把这些能力组织成可被 Agent 消费的标准能力入口

所以 MCP 不是某个具体插件，也不是某一个厂商的私有功能。
它是“让模型连工具”的通用协议层。

再严谨一点说，MCP 讨论的不只是“调用工具”。
在官方语义里，server 可以向 host 暴露多种原语，常见的是：

1. `tools`：让模型主动执行动作，比如搜索、点击、运行查询
2. `resources`：让模型读取现成内容，比如文档、文件、数据快照
3. `prompts`：提供可复用的提示模板或任务入口

所以如果你把 MCP 简化成“工具调用协议”并不算全错，但它其实比“工具层”更完整。

版本号、传输方式和功能支持是三个独立维度。相同名称的 SDK 或 MCP server，不代表默认实现全部稳定规范与扩展；方案中应记录实际版本、启用能力和验证结果。

## 二、为什么前端开发者也要懂 MCP

前端开发现在已经不只是写页面，还包含：

1. 本地代码改动与排障
2. 接口联调与数据核验
3. 页面行为复现与截图验证
4. 文档、脚本、发布流程协同

这些都可以变成 Agent 的可调用能力。
MCP 的价值就在于：把零散能力统一到可组合、可治理、可审计的通道里。

## 三、MCP 的最小组成

从工程落地看，MCP 至少包含三层角色：

1. Host（宿主）：用户实际在用的 AI 应用，比如桌面端、IDE、聊天工作台
2. Client（客户端连接）：host 内部负责与某一个 MCP server 建立协议连接的组件
3. Server（能力提供方）：对外暴露 `tools`、`resources`、`prompts` 等能力的服务

可以按这个流程理解：

1. 你在支持 MCP 的工具里发出任务
2. Host 内的 MCP client 与某个 server 建立连接并发现它提供的能力
3. Agent 根据任务选择读取 resource、执行 tool 或套用 prompt
4. Server 返回结构化结果或可读取内容
5. 模型把结果整合进最终回答或后续动作

## 四、“浏览器 MCP”属于哪一层

浏览器 MCP 不是 MCP 全部，它只是 MCP 生态中的一个能力分类。
本系列第 07 篇 Chrome DevTools 配置手册，本质是“某个具体 MCP server 的安装使用记录”。

这两者关系是：

1. MCP：协议层，定义 host、client、server 如何协作
2. 浏览器 MCP：按业务能力划分的一类 server，通常负责页面交互、截图、网络面板等能力

本系列把浏览器、文件系统、数据库和搜索都纳入常用清单，便于按任务选型。

这里还要再区分一层：
“浏览器类、文件类、搜索类”是为了方便选型而做的业务分类；
而 `tools`、`resources`、`prompts` 是协议层里的官方能力原语。
两者不是一回事，一个浏览器类 server 也可能同时暴露多个 tool 和 resource。

## 五、面试里怎么回答“你理解的 MCP 是什么”

### 30 秒版

MCP 是让大模型标准化连接外部能力的开放协议。
它不只支持工具调用，也支持资源读取和提示模板复用。
对工程落地的关键价值是可组合、可扩展，以及更清晰的权限治理。

### 2 分钟版

我会把 MCP 看成 Agent 时代的工具连接层。
以前每个平台要单独做插件适配，成本高、复用弱。
MCP 把“能力发现、资源读取、工具调用、结果返回”抽象成统一协议后，同一类能力更容易跨平台复用。
但 MCP 不等于万能自动化，生产落地要同时做好最小权限、审批、隔离和审计。

## 六、常见误区

1. 误区：MCP 只等于浏览器自动化
现实：浏览器只是其中一类，MCP 还覆盖文件、数据库、检索、部署等能力

2. 误区：只要接了 MCP 就能无风险自动执行
现实：权限边界和工具来源治理是第一优先级

3. 误区：MCP 会替代所有原有工程体系
现实：它是增强层，不替代 CI、测试、代码评审和发布规范

## 七、这套笔记后续怎么用

建议你按以下节奏维护：

1. `第-01-篇：MCP-是什么与开放标准核心认知.md`：沉淀协议理解与面试表达
2. `第-02-篇：常用-MCP-分类与选型总览.md` 与 `第-03-篇：前端开发常用-MCP-清单与选型建议（2026-07复核）.md`：按类别维护常用 server 地图
3. `04` 到 `06` 三组问答：沉淀可复述的标准答案
4. `第-07-篇：谷歌-MCP-配置手册（Windows，Chrome-DevTools-MCP-复刻）.md`：沉淀具体实践与踩坑记录

## 八、核心协议、扩展与弃用能力

官方扩展目录在本次核验时标注 MCP Apps 为 Stable，Tasks 和 Skills over MCP 为 Beta。Beta 仍可能出现有记录的不兼容变更；只有客户端与服务端实际支持、启用相应扩展时才能使用。

Roots、Sampling、Logging 已进入 Deprecated 状态，仍处于兼容窗口。新实现分别优先使用显式目录/资源参数、直接的模型服务 API，以及 stderr 或 OpenTelemetry 等日志方案。不要把“标记弃用”描述成“所有已安装客户端立即失效”。

## 参考资料

- Model Context Protocol 当前正式规范：<https://modelcontextprotocol.io/specification/2026-07-28>
- Model Context Protocol Draft / 下一版规范入口：<https://modelcontextprotocol.io/specification/draft>

- [MCP 2026-07-28 变更记录](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [当前传输规范](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)
- [扩展生命周期](https://modelcontextprotocol.io/docs/extensions/overview)
