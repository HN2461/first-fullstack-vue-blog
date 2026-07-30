---
title: "Gemini 目录补充说明：谷歌 MCP 配置手册放在哪里看"
slug: "ai-agent-gemini-mcp-4c54d61a"
summary: "说明为什么“谷歌 MCP”相关实操手册应统一放在 MCP 分类下维护，并从 Gemini 目录给出导览入口，避免同一篇实操文在多个目录重复收录造成搜索与列表混乱。"
category: "Gemini"
tags:
  - "Gemini"
  - "MCP"
  - "Chrome DevTools"
  - "导览"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf88"
originalSlug: "ai-agent-gemini-mcp-4c54d61a"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# Gemini 目录补充说明：谷歌 MCP 配置手册放在哪里看

> 更新时间：2026-05-24  
> 这页不是重复正文，而是专门解决“为什么 Gemini 目录里会看到一篇谷歌 MCP 手册”的导航说明。

## 为什么这里不再放同一份正文副本

之前这里和 `03_规则机制层/MCP/谷歌MCP_配置手册.md` 放的是同一份正文，会带来两个问题：

1. 站内搜索和列表会把它当成两篇同名文章
2. 读者会误以为这是一篇“Gemini CLI 专属教程”，但正文实际讲的是 Chrome DevTools MCP / 谷歌系浏览器调试链路本身

所以现在统一做法是：

- **协议与工具实操正文** 放到 `MCP` 分类维护
- **Gemini 目录** 这里只保留导览入口，避免重复收录

## 正确阅读入口

如果主人现在要看这篇实操文，请直接去这里：

- [谷歌 MCP 配置手册（Windows，Chrome DevTools MCP 复刻）](#/note/AI工具/03_规则机制层/MCP/谷歌MCP_配置手册)

## 怎么理解它和 Gemini 的关系

可以把它理解成：

1. 这篇手册介绍的是 **谷歌系浏览器调试链路对应的 MCP 实操**
2. 它可以服务于不同 Agent / IDE / CLI，不只服务于 Gemini
3. 因为它更像“协议与工具能力”而不是“某个单一终端工具功能”，所以归到 `MCP` 目录更合适

## Gemini 目录后续怎么放内容

后续如果继续补 Gemini 专题，建议优先放这几类内容：

1. Gemini CLI 自身命令、模式、权限与工作流
2. Gemini API / 鉴权 / 模型与计费
3. Gemini 专属的规则文件、上下文与集成方式
4. 与其它 Agent 工具联动时的差异化实践
