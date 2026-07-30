---
title: "第4篇：CatPaw上下文与预览调试"
slug: "ai-ai-catpaw-catpaw-e217fd6c-revision-20260730"
summary: "围绕 CatPaw 公开手册中的上下文、索引、Docs、项目预览、页面元素编辑和 Browser Use 重新整理，重点讲清 AI 为什么会“懂项目”。"
category: "CatPaw"
tags:
  - "CatPaw"
  - "上下文"
  - "Codebase"
  - "Docs"
  - "Browser"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291d8a2b1c68f2cabe80"
originalSlug: "ai-ai-catpaw-catpaw-e217fd6c"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 第4篇：CatPaw上下文与预览调试

很多人觉得 AI 编程工具“不稳定”，核心原因往往不是模型太差，而是：

- 上下文没给对
- 项目索引没建好
- 预览和验证没有接上

CatPaw 的公开手册，其实把这条链讲得很清楚。

## 1. 什么叫“上下文”

官方手册把上下文说得很直白：

- AI 不是无所不知
- 每个项目又有自己独特的结构、逻辑和约定

所以要让 AI 真帮上忙，就得给它“项目说明书”。

手册还特别强调两点：

- 只给和当前问题直接相关的信息
- 信息量要恰到好处，别太少，也别太多

这条原则特别重要。  
上下文不是越多越好，而是越准越好。

## 2. CatPaw 把上下文分成两大类

### 内部信息

也就是来自当前项目本身的信息。  
公开手册给出的粒度从小到大是：

- `File`
- `Folder`
- `Codebase`

可以把它理解成：

- `File`：只看这一个文件
- `Folder`：看这一小块模块
- `Codebase`：看整个仓库的整体关系

### 外部信息

公开手册点名的主要入口有：

- `@Web`
- `@Url`
- `@Docs`

这部分的价值是：

- 补项目外的知识
- 引入最新公开资料
- 让 AI 不只盯着本地代码

## 3. 索引为什么重要

官方把索引放在很前面，不是没有原因。  
因为没有索引，AI 很难真正理解代码库。

公开的索引管理能力包括：

- 查看索引进度
- 重新索引
- 查看已索引文件

手册还说明：

- 默认会遵循 `.gitignore`
- 也可以自定义 `.mignore`

### `.mignore` 是干嘛的

如果项目很大，或者你不希望某些目录被 AI 索引，可以在 `.mignore` 里配忽略规则。

公开手册特别提到大型仓库的优化思路：

- 每个开发者按自己负责的模块精简索引范围
- 用 `.mignore` 做更细颗粒度控制

这对大单仓尤其有用。

## 4. `@Docs` 是 CatPaw 很实用的一块

公开手册明确写了，CatPaw 可以把外部文档抓进来并索引，形成自己的文档上下文。

### 能怎么加

手册给了两种方式：

- 在 `索引 & Docs` 配置页添加 URL
- 在对话里直接输入 `@Docs`，再选择“添加新文档”

### 加进去之后能干嘛

- 对话里引用这些文档
- 让 AI 自动挑选其中相关片段作为上下文
- 需要时重命名、重新索引、删除

### 有什么限制

公开手册写得很明确：

- 目前支持抓取 `无需登录验证` 的公开网站内容
- 如果目标网站需要登录，先通过 `MCP` 完成身份验证，再添加文档

所以这块千万别写成“任何网页都能直接吃进去”，那就不严谨了。

## 5. 项目预览调试：前端最容易直接受益

手册里项目预览的触发逻辑是：

- 当前前端项目已经成功运行
- CatPaw 检测到可用端口
- 右下角提示 `发现可用端口：XXXX`
- 点击 `打开预览`

然后你就可以在 IDE 内直接看页面。

### 预览页里能做什么

公开手册明确提到：

- 打开内置 `DevTools`
- 查看页面元素
- 调试 JavaScript
- 分析网络请求
- 在外部浏览器打开
- 切换设备类型

这说明 CatPaw 的 Browser 不是摆设，它是真打算把“看效果”和“调问题”都收在 IDE 里。

## 6. 页面元素编辑：把“看着不对”直接变成 AI 上下文

这块很适合前端主人。

使用流程是：

1. 在预览界面点右上角 `Edit`
2. 鼠标直接点页面上的某个元素
3. 点 `添加到 Agent`
4. 再告诉 AI 你想怎么改

公开手册的核心意思就是：

- 你不用先自己去猜这个 DOM 对应哪段代码
- 先把元素选中并送进对话上下文
- 再让 AI 去定位和改动

## 7. Browser Use：从“看页面”升级到“替你操作页面”

官方对 Browser Use 的定义很清楚：

- 让 Agent 在浏览器里像人一样操作

公开手册列的典型场景包括：

- 复现 bug
- 验证修复
- 填写复杂表单
- 回归检查核心路径

### 使用方式

手册给出的主线是：

1. 打开侧边栏对话
2. 开启 Browser Use
3. 让 Agent 在浏览器中打开预览页
4. 直接告诉它要做什么

### 使用限制

手册公开写到：

- 可以跑在 IDE 内置 Browser Tab
- 也可以调用本机安装的 `Google Chrome`
- `Chrome` 模式依赖本机 `Node.js 18+`

这条很关键，后面如果主人自己实操时发现 Chrome 模式起不来，先查本机 Node 版本。

## 8. 上下文怎么给，才不容易把 AI 喂傻

结合公开手册，我建议主人记 3 条：

### 小问题给小上下文

- 某个函数逻辑不懂：优先 `File`
- 某个模块风格不统一：用 `Folder`
- 跨模块设计问题：再上 `Codebase`

### 外部资料别乱喂

- 能用 `@Docs` 的文档，尽量先索引再引用
- 要最新公开信息时，再考虑 `@Web` / `@Url`

### 前端问题尽量接预览

- 只用文字描述 UI 问题，AI 容易偏
- 接上预览、元素编辑、Browser Use，成功率更高

## 9. 这一篇最该记住的话

> CatPaw 的“懂项目”不是魔法，而是索引、上下文、文档和预览验证这几层一起工作的结果。

## 公开资料来源

- 用户手册-上下文概览：https://catpaw.meituan.com/guides/context/overview
- 用户手册-索引 & Docs 配置：https://catpaw.meituan.com/guides/settings/indexanddocs
- 用户手册-Inline Chat：https://catpaw.meituan.com/guides/inline-operations/overview
- 用户手册-项目预览调试：https://catpaw.meituan.com/guides/previewandedit/preview
- 用户手册-页面元素编辑：https://catpaw.meituan.com/guides/previewandedit/edit
- 用户手册-Browser Use：https://catpaw.meituan.com/guides/previewandedit/browser-use
