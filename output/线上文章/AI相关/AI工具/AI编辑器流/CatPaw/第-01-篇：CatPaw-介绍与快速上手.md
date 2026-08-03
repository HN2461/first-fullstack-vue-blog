---
title: "第 01 篇：CatPaw 介绍与快速上手"
slug: "ai-ai-catpaw-catpaw-2afcb185"
summary: "基于 CatPaw 官网、公开用户手册和美团技术团队公开文章整理的入门版说明，聚焦产品定位、安装登录、基础体验与公开可验证信息。"
category: "CatPaw"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "AI编辑器流"
  - "CatPaw"
tags:
  - "CatPaw"
  - "美团"
  - "AI IDE"
  - "快速上手"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cabe58"
originalSlug: "ai-ai-catpaw-catpaw-2afcb185"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.573Z"
updatedAt: "2026-07-31T11:16:25.550Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 01 篇：CatPaw 介绍与快速上手
这篇先解决两个问题：

- CatPaw 到底是什么
- 第一次下载后，应该怎么最快开始用

## 1. 先把定位说准

公开资料里，CatPaw 的官方说法不是“某个神秘内网工具箱”，而是：

- `Meituan CatPaw`
- `AI 编程 Agent`
- `以 IDE 形态集成`

官网首页的描述重点有 3 个：

- AI 代码补全
- AI 代码生成
- 以 IDE 形态承载整套编程体验

公开时间线也能大致梳理出来：

- 官网结构化数据标注 `datePublished: 2025-11-04`
- 美团技术团队在 `2025-12-29` 的公开文章中写到：CatPaw 早在 `2023 年` 已经以编辑器插件形态在美团内部上线，之后完成升级并开启公测

如果主人后面再看到“2024 就正式全面公开发布”“只有补全没有 Agent”这类说法，优先以官网和公开用户手册为准。

## 2. 公开资料里能确定的能力边界

用户手册概览页明确列出的核心模块是：

- `Tab`：代码补全预测
- `Agent`：快速问答、生码、执行复杂任务
- `Browser`：IDE 内预览调试
- `Codebase`：项目维度分析与代码库索引

再结合手册其他页面，可以确定 CatPaw 公开支持的主线能力是：

- 代码补全与 NextEdit
- 侧边栏 Ask / Agent / 自定义 Agent
- Inline Chat
- 项目预览与页面元素编辑
- Rules
- MCP

## 3. 兼容系统、语言、费用，怎么理解最稳

### 系统

当前公开手册概览页明确写了：

- `macOS 10.15+`，支持 `x64 / arm64`
- `Windows x64`

官网首页结构化数据里还写了 `Windows / macOS / Linux`。  
但因为手册正文目前明确展开的是 `macOS` 和 `Windows`，所以更稳妥的写法是：

- 至少可以公开确认 `macOS` 与 `Windows x64`
- `Linux` 可能在官网能力声明里出现过，但公开手册当前没有展开安装细节，别先写死

### 语言

手册概览页和代码补全页都强调：

- 支持主流语言生态
- 包括但不限于 `Python`、`C++`、`Java`、`JavaScript`、`TypeScript`、`Go`、`Rust`

### 费用

手册概览页明确写了：

- 当前阶段 `完全免费使用`
- 每位新用户注册后默认有 `500 次对话额度`
- 可以在 `设置 -> 通用 -> 额度` 查看余额并申请续充

## 4. 安装与首次启动

### 下载入口

公开入口就是官网下载页：

- https://catpaw.meituan.com/download

### 安装

手册当前安装示例展示的是 `macOS .dmg` 流程：

1. 下载安装包
2. 双击打开 `.dmg`
3. 把 `Meituan CatPaw` 拖进 `Applications`

这里要注意一个细节：

- 手册这页展示的是 macOS 示例
- 但概览页又明确列了 `Windows x64`
- 所以 Windows 用户应以下载页当下提供的安装包形式为准，不要机械照搬 `.dmg` 步骤

### 首次启动会做什么

公开手册写得比较清楚，首次启动一般会引导你做这些事：

- 点击 `开始使用`
- 选择界面主题
- 可选导入其他 IDE 配置，文档举例包括 `VS Code`、`Cursor`、`Windsurf`
- 用手机号验证码登录

### 更新

官方手册目前写了两种方式：

- 自动提醒更新，点击 `Restart to Update`
- 手动走菜单 `CatpawAI -> Check for Updates...`

## 5. 第一次上手，建议按这个顺序试

### 第一步：打开项目

手册给了两种最常见的入口：

- `File -> Open Folder...`
- `Clone a remote repository...`

这说明 CatPaw 的基础项目管理逻辑，本质上是很接近 VS Code 体系的，不需要把它想成完全陌生的新 IDE。

### 第二步：先体验 3 个最值钱的能力

我建议第一次先只试这 3 个：

1. `Tab 补全`
2. `侧边栏对话`
3. `Inline Chat`

原因很简单：

- 这 3 个最容易马上感知差异
- 也是官方手册写得最完整、最稳定的主线

### 第三步：如果是前端项目，再试预览

前端项目跑起来后，CatPaw 会在检测到可用端口时提示：

- `发现可用端口：XXXX`
- 然后你可以点 `打开预览`

这个体验比“写完代码再切浏览器”更顺。

## 6. 新手最容易误会的几点

### 误会 1：CatPaw 只有聊天，没有真正执行能力

不对。  
公开手册明确写了 `Agent 模式` 可以：

- 探索代码库
- 阅读文档
- 浏览网页
- 编辑文件
- 运行终端命令

### 误会 2：Ask 和 Agent 只是名字不同

也不对。

- `Ask` 更偏只读问答、解释、规划
- `Agent` 才是主动执行复杂任务的主力模式

### 误会 3：公开资料里已经把所有 CLI 命令讲清楚了

没有。  
当前公开手册的重点不是“独立 CLI 命令大全”，而是 IDE 内的 Agent、上下文、预览、Rules、MCP。

## 7. 这一篇你先记住什么

一句话记忆：

> CatPaw 的公开定位是“美团 AI 编程 Agent + IDE”，先学会打开项目、用 Tab、用 Ask / Agent、用 Inline Chat，再去碰 Rules 和 MCP。

## 公开资料来源

- 官网首页：https://catpaw.meituan.com/
- 用户手册-概览：https://catpaw.meituan.com/guides/getting-started/overview
- 用户手册-安装与更新：https://catpaw.meituan.com/guides/getting-started/install-update
- 用户手册-快速入门：https://catpaw.meituan.com/guides/getting-started/quick-start
- 美团技术团队年度汇总（含 CatPaw 公测介绍）：https://tech.meituan.com/2025/12/29/2025-annual-review.html
