---
title: "第 00 篇：MCP 学习导航与维护路线"
slug: "ai-mcp-848a18d2"
summary: "面向前端开发者的 MCP 导航页，采用“概念原理 + 常用清单 + 面试题库 + 实战复盘”双线结构，先建立协议认知，再沉淀常用 MCP 库与个人实践。"
category: "MCP"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "MCP"
tags:
  - "MCP"
  - "协议标准"
  - "工具选型"
  - "Agent"
  - "学习路线"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf90"
originalSlug: "ai-mcp-848a18d2"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.660Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 00 篇：MCP 学习导航与维护路线

复核日期：2026-11-18。版本结论以当日官方稳定规范、扩展目录和各项目文档为依据。

本系列分成两条主线：概念与原理用于理解架构和回答面试题；工具清单与配置实操用于完成真实开发任务。

## 本轮需要掌握的变化

- 官方稳定规范入口目前为 **MCP 2026-07-28**。这一版已取消 `initialize` 握手与协议级 session，每个请求携带版本和能力元数据；旧客户端仍可能使用 2025 年协议，必须按实际版本说明。
- 核心原语仍是 `tools`、`resources`、`prompts`。官方扩展另有生命周期：MCP Apps 为 Stable，Tasks 和 Skills over MCP 为 Beta；正式协议和可选扩展不能混为一谈。
- Roots、Sampling、Logging 与 OAuth 动态客户端注册 DCR 在当前版本已标为 Deprecated。弃用不是立即移除，新实现应按官方迁移建议设计。
- Chrome DevTools 已提供 MCP、CLI、Skills 和插件入口；Playwright 也需区分 MCP 与 CLI + Skills。按任务和宿主支持选择，不要求同时安装所有入口。
- 搜索服务先辨认当前维护者。官方参考服务器仓库里的 GitHub、Brave Search、Puppeteer、PostgreSQL 等旧示例已归档，不能直接作为新项目默认安装清单。

建议先读第 01 篇的版本对照，再读第 05 篇的权限边界；准备安装工具时查看第 03、07 篇。

## 当前目录结构

```text
MCP/
├── 第-00-篇：MCP-学习导航与维护路线.md
├── 第-01-篇：MCP-是什么与开放标准核心认知.md
├── 第-02-篇：常用-MCP-分类与选型总览.md
├── 第-03-篇：前端开发常用-MCP-清单与选型建议（2026-07复核）.md
├── 第-04-篇：MCP-概念与主流度问题.md
├── 第-05-篇：MCP-架构与安全边界问题.md
├── 第-06-篇：MCP-项目落地与收益评估问题.md
└── 第-07-篇：谷歌-MCP-配置手册（Windows，Chrome-DevTools-MCP-复刻）.md
```

## 建议阅读顺序

1. 先读 `第-01-篇：MCP-是什么与开放标准核心认知.md`，建立统一认知
2. 再读 `第-02-篇：常用-MCP-分类与选型总览.md` 和 `第-03-篇：前端开发常用-MCP-清单与选型建议（2026-07复核）.md`，快速形成工具地图
3. 准备面试前读 `04` 到 `06` 三组问答
4. 需要复刻环境时再读 `第-07-篇：谷歌-MCP-配置手册（Windows，Chrome-DevTools-MCP-复刻）.md`

## 维护规则（后续补内容时按这个来）

1. 每篇文章必须有 frontmatter，且 `title` 与正文 H1 语义一致
2. 结论类内容尽量标注“复核日期”，避免过时结论长期悬挂
3. 清单类文章统一用固定字段：定位、场景、接入、优势、局限、面试可讲点
4. 面试题优先写“30 秒回答 + 2 分钟展开”两版话术
5. 踩坑记录必须写“现象、根因、修复、预防”，避免只记录结论

## 现有资料入口

- 概念主线：见 [01-MCP-是什么与开放标准核心认知](第-01-篇：MCP-是什么与开放标准核心认知.md)
- 清单主线：见 [02-常用-MCP-分类与选型总览](第-02-篇：常用-MCP-分类与选型总览.md) 与 [03-前端开发常用-MCP-清单与选型建议（2026-11复核）](第-03-篇：前端开发常用-MCP-清单与选型建议（2026-07复核）.md)
- 面试题库：见 [04-MCP-概念与主流度问题](第-04-篇：MCP-概念与主流度问题.md)、[05-MCP-架构与安全边界问题](第-05-篇：MCP-架构与安全边界问题.md)、[06-MCP-项目落地与收益评估问题](第-06-篇：MCP-项目落地与收益评估问题.md)
- 配置实操：见 [07-谷歌-MCP-配置手册（Windows，Chrome-DevTools-MCP-复刻）](第-07-篇：谷歌-MCP-配置手册（Windows，Chrome-DevTools-MCP-复刻）.md)

## 本轮核验来源

- [MCP 2026-07-28 变更记录](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [MCP 扩展目录与生命周期](https://modelcontextprotocol.io/docs/extensions/overview)
- [官方参考服务器与归档清单](https://github.com/modelcontextprotocol/servers)
- [Chrome DevTools for agents](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Playwright MCP 与 CLI 的适用边界](https://github.com/microsoft/playwright-mcp)
