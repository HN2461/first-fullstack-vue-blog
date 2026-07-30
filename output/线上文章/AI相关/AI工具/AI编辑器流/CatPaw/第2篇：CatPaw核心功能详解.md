---
title: "第2篇：CatPaw核心功能详解"
slug: "ai-ai-catpaw-catpaw-d8f5ee08"
summary: "按公开用户手册重新整理 CatPaw 的核心功能，重点讲清 Tab 补全、NextEdit、Inline Chat、Codebase 和项目预览这些真正公开可验证的能力。"
category: "CatPaw"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "AI编辑器流"
  - "CatPaw"
tags:
  - "CatPaw"
  - "代码补全"
  - "NextEdit"
  - "Inline Chat"
  - "项目预览"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cabe6c"
originalSlug: "ai-ai-catpaw-catpaw-d8f5ee08"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.575Z"
updatedAt: "2026-06-17T12:36:31.969Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 第2篇：CatPaw核心功能详解

如果只看公开资料，CatPaw 最应该记住的核心模块其实就 4 个：

- `Tab`
- `Agent`
- `Browser`
- `Codebase`

这一篇主要拆前 3 个里最常用、最能直接提高效率的部分。

## 1. Tab 补全不是普通提示词，它分两层

官方文档把代码补全拆成两类：

- `基础补全`
- `NextEdit`

### 基础补全

表现形式很直观：

- 光标右侧出现灰色建议
- 按 `Tab` 接受
- 按 `Esc` 取消

它的公开目标是：

- 保持项目代码风格一致
- 提供高准确度建议
- 智能判断触发时机

这意味着 CatPaw 的补全不是单纯按关键字猜，而是明显依赖当前文件上下文。

### NextEdit

这是 CatPaw 公开手册里比较有辨识度的一点。  
它不是只补“下一行”，而是会根据你刚刚接受过的修改，继续预测“下一处也该怎么改”。

手册给了两个重点场景：

- 批量编辑多行代码时，一次给出一组修改
- 根据最近编辑历史，预测下一个可能要改的代码块

如果主人做过这种活，就会很有感觉：

- 统一改命名
- 批量补错误处理
- 多处同步改参数结构

这类重复但不完全一样的修改，NextEdit 理论上最有价值。

## 2. 补全功能怎么开关

公开手册给了两个配置入口：

- `CatPaw Settings -> Tab 补全`
- 右下角 `CatPaw Tab`

你可以做这些配置：

- 开关 `Tab 补全`
- 开关 `模块导入`
- 全局禁用自动补全
- 针对某一门语言禁用自动补全

这点很实用，因为真实开发里常见两种情况：

- 某些语言补全很好用，某些语言会打断节奏
- 某些仓库导入提示很有价值，某些仓库反而容易添乱

## 3. Inline Chat 是“就地改”，不是“去旁边聊”

很多人第一次会把 Inline Chat 和侧边栏对话混为一谈。  
其实官方手册区分得很明确：

- `侧边栏对话` 适合连续追问、复杂任务、多轮协作
- `Inline Chat` 适合你已经定位到某段代码，想在当前位置就地提问或修改

### 怎么唤起

手册给了两种方式：

- 选中代码后点击浮出的 `Edit`
- 使用快捷键 `Command + I`

### 它能做什么

公开手册把 Inline Chat 的动作拆成两类：

- `快速问答`
- `生成代码`

#### 快速问答

适合：

- 问这段代码在干嘛
- 让它解释一个写法
- 想先问，不急着改文件

如果后面想继续深聊，可以点 `转到 Chat`，把这次结果丢进侧边栏对话继续追问。

#### 生成代码

适合：

- 在光标处插入一段新逻辑
- 改一段现有代码
- 做小规模重构

生成后手册说明你可以对 diff 做：

- `Accept`
- `Reject`
- 全部接受
- 全部拒绝
- 不满意时 `重新生成`

这个交互比“AI 直接把整文件覆盖掉”稳很多。

## 4. Codebase 的意义，不是搜索，而是让 AI 真知道你项目在干嘛

CatPaw 官方把 `Codebase` 定位成“项目维度分析”。  
这一层很关键，因为很多 AI 工具的问题不是不会写代码，而是：

- 不知道你项目目录怎么分
- 不知道同类实现已经写在哪
- 不知道团队的历史风格

公开手册的说法是：

- 代码库索引技术能让 AI 理解整个项目上下文
- 然后给出更精准、更契合项目需求的建议

所以主人以后如果感觉：

- 单文件问答还行
- 一到跨文件任务就变笨

先别急着怀疑模型，先看索引是不是建好、上下文是不是给对了。

## 5. Browser 能力不只是“看页面”，还包括调试

CatPaw 公开手册里的 `Browser` 不只是一个内嵌预览框。  
它至少包含这些能力：

- 发现可用端口后直接打开预览
- 在 IDE 里看页面效果
- 打开内置 `DevTools`
- 查看元素、调试 JS、分析网络请求
- 一键切外部浏览器
- 切换设备类型

这意味着前端开发里一条比较顺的链路是：

1. 让项目跑起来
2. 在 CatPaw 里预览
3. 直接开 DevTools 看问题
4. 再配合 Agent / Edit 改代码

## 6. 页面元素编辑是前端向功能

这不是我猜的，是公开手册单独列出的能力。

流程很简单：

1. 在预览界面点 `Edit`
2. 直接选页面元素
3. 点 `添加到 Agent`
4. 再在对话里描述“我要怎么改这个元素”

它的价值在于把“视觉问题”直接变成“可交给 AI 的上下文”。

比如下面这种话，理论上就很适合：

- 这个按钮太挤了，改成更宽一点
- 这个卡片阴影太重，弱一点
- 这个表单项在移动端换行不好看

## 7. Browser Use 是端到端自动操作，不只是预览

官方手册把 `Browser Use` 讲得很直白：

- 让 Agent 像人一样在浏览器里点击、输入、跳转
- 可以复现 bug
- 可以验证修复
- 可以填表单
- 可以做走查式回归检查

如果主人做前端联调，这个能力比“单纯生成代码”更像真正的生产工具。

但也要注意公开手册写的限制：

- 可以用 IDE 内置 Browser Tab
- 也可以用本机 `Google Chrome`
- `Chrome` 模式依赖本机安装 `Node.js 18+`

## 8. 这一篇最该记住的结论

CatPaw 真正公开、可验证、可感知的核心，不是虚构的一堆命令，而是这条链：

> Tab 补全 -> NextEdit -> Inline Chat -> Codebase -> Browser / DevTools / Browser Use

把这条链用顺了，CatPaw 的价值才真正出来。

## 公开资料来源

- 用户手册-概览：https://catpaw.meituan.com/guides/getting-started/overview
- 用户手册-快速入门：https://catpaw.meituan.com/guides/getting-started/quick-start
- 用户手册-代码补全：https://catpaw.meituan.com/guides/code-completion/overview
- 用户手册-Inline Chat：https://catpaw.meituan.com/guides/inline-operations/overview
- 用户手册-项目预览调试：https://catpaw.meituan.com/guides/previewandedit/preview
- 用户手册-页面元素编辑：https://catpaw.meituan.com/guides/previewandedit/edit
- 用户手册-Browser Use：https://catpaw.meituan.com/guides/previewandedit/browser-use
