---
title: Markdown 与 markdown-it 全面入门：从语法原理到 Vue、代码高亮、Mermaid、数学公式和 AI 渲染
slug: markdown-it-complete-learning-roadmap
summary: 面向前端初学者系统学习 Markdown 与 markdown-it，理解文本如何变成 Token 和 HTML，并完成 Vue 安全渲染、代码高亮、Mermaid、KaTeX 数学公式与 AI 流式输出。
tags:
  - Markdown
  - markdown-it
  - Vue 3
  - 代码高亮
  - Mermaid
  - KaTeX
  - AI 对话
  - 前端安全
category: markdown-it
categoryPath:
  - 项目复用技术
  - JS库
  - markdown-it
sortOrder: 10
status: published
---

# Markdown 与 markdown-it 全面入门：从语法原理到 Vue、代码高亮、Mermaid、数学公式和 AI 渲染

这组文章给第一次接触 Markdown 渲染的开发者准备。最终目标不是会写几个 `#` 和 `````，而是能够回答下面这些问题：

- Markdown 到底是什么，为什么一段纯文本能变成标题、列表和代码块？
- `markdown-it` 在解析过程中做了什么，Token、规则、Renderer 分别负责什么？
- 为什么把 Markdown 直接塞进 `v-html` 有风险？如何在 Vue 中安全地渲染？
- 代码高亮、Mermaid 流程图、KaTeX 数学公式为什么不是 Markdown 本身的能力？它们怎样接入？
- AI 回复是一段一段到达的，未闭合的代码围栏或公式怎样避免页面闪烁和报错？

## 这套教程解决什么问题

很多项目一开始只需要“把一段 Markdown 显示出来”，于是直接使用一个在线示例。功能变复杂后，问题才集中出现：用户输入的 HTML 执行了脚本，代码块没有语言高亮，Mermaid 只在首次加载生效，数学公式破坏布局，流式回复每个字都触发一次昂贵渲染，服务端和浏览器渲染结果还不一致。

这套教程从底层模型开始，一步步建立一条可维护的链路：

```text
Markdown 字符串
  ↓
markdown-it 解析规则
  ↓
Token 数组（结构化中间结果）
  ↓
Renderer 输出 HTML
  ↓
安全清理与增强（高亮、Mermaid、KaTeX）
  ↓
Vue 组件显示和交互
```

每一层都有明确边界。解析器不应该负责登录权限，Vue 组件不应该把模型密钥写进页面，Mermaid 和 KaTeX 也不应该绕过统一的安全处理。

## 阅读顺序

1. [Markdown 语法与解析原理](/articles/markdown-syntax-parser-principles)：先建立文本、区块、行内元素、Token 和 HTML 的整体认识。
2. [markdown-it 核心 API 与插件机制](/articles/markdown-it-core-api-plugin-development)：学习实例配置、渲染方法、规则链、Renderer 和插件。
3. [Vue 3 安全渲染 Markdown](/articles/markdown-it-vue3-safe-rendering)：做出可以复用的渲染组件，处理 XSS、链接和主题。
4. [代码块与高亮](/articles/markdown-it-code-highlight-highlightjs-shiki)：比较 highlight.js 和 Shiki，处理语言识别、复制和长代码。
5. [Mermaid 图表](/articles/markdown-it-mermaid-diagrams-vue)：把 fenced code 中的 Mermaid 源码转换成图表，并处理异步渲染和失败回退。
6. [数学公式与 KaTeX](/articles/markdown-it-math-katex-formulas)：区分行内公式和块级公式，处理转义、字体、SSR 和无障碍。
7. [AI 流式 Markdown](/articles/markdown-it-ai-streaming-markdown-rendering)：解决半截代码围栏、半截公式、节流、取消和增量更新。
8. [综合项目与上线清单](/articles/markdown-it-vue-ai-markdown-complete-project)：把前面的能力组合成 AI 知识库文章和聊天消息渲染方案。

## 先区分几个名称

| 名称 | 它是什么 | 负责什么 |
| --- | --- | --- |
| Markdown | 一种轻量标记语法和文本格式 | 让人用纯文本表达标题、列表、链接等结构 |
| CommonMark | Markdown 语法的标准化规范 | 规定许多有歧义的输入如何解释 |
| GFM | GitHub Flavored Markdown | 在基础 Markdown 上增加表格、任务列表、删除线等扩展 |
| markdown-it | JavaScript Markdown 解析器 | 把 Markdown 字符串解析成 Token，再渲染为 HTML |
| highlight.js / Shiki | 代码语法高亮工具 | 为代码 Token 添加颜色和样式 |
| Mermaid | 用文本描述图表的工具 | 把图表文本绘制成 SVG |
| KaTeX | 数学公式排版引擎 | 把 TeX 公式转换成 HTML 和 MathML |

Markdown 是输入格式，`markdown-it` 是解析器。后面的库通常是插件或后处理器。理解这个关系后，遇到“为什么一个库不能全部解决”的问题就不会困惑。

## 本项目的推荐分层

建议把 Markdown 能力拆成四个文件或模块，而不是在每个页面里重复写 `new MarkdownIt()`：

```text
src/
├─ markdown/
│  ├─ createMarkdown.js       # 创建配置好的 markdown-it 实例
│  ├─ sanitizeHtml.js         # 统一清理 HTML 和 URL
│  ├─ renderCode.js           # 代码高亮
│  ├─ renderMermaid.js        # 图表初始化
│  └─ renderMath.js           # 数学公式配置
└─ components/
   └─ MarkdownContent.vue     # 负责 Vue 响应式、挂载和交互
```

页面只传入 `source`、主题和是否允许图表等业务选项。这样文章详情、AI 消息、评论预览可以共享同一套安全策略。

## 版本与选择提醒

本文以 Vue 3、Vite、`markdown-it` 14.x 时代的 API 思路编写。实际安装前请查看项目锁文件和 npm 当前版本。`highlight.js`、Shiki、Mermaid、KaTeX 和各类插件的版本更新速度不同，不能把不同年份示例的配置直接混合。

建议固定版本并在升级时重新验证：

```bash
npm install markdown-it highlight.js mermaid katex dompurify
npm ls markdown-it highlight.js mermaid katex dompurify
```

如果项目已经有 Markdown 管线，先检查现有依赖和安全审计结果。重复引入两个解析器通常会增加包体积，也会让同一篇内容在不同页面产生不同结果。

## 官方资料

- [markdown-it 官方文档](https://markdown-it.github.io/markdown-it/)
- [markdown-it GitHub](https://github.com/markdown-it/markdown-it)
- [CommonMark 规范](https://spec.commonmark.org/)
- [Mermaid 文档](https://mermaid.js.org/)
- [KaTeX 文档](https://katex.org/)
- [highlight.js 文档](https://highlightjs.org/)
- [Shiki 文档](https://shiki.style/)

读完本篇总览后，先完成下一篇的语法和原理练习，再安装依赖。只有理解输入、Token、HTML 三者的关系，后面的插件配置才不会变成盲目复制。

## 如果你是完全零基础

不要求先掌握编译器理论。你只要先知道：变量可以保存字符串，函数可以接收字符串并返回另一个字符串，Vue 可以根据响应式数据更新页面。然后从第一篇开始，每次只运行一个小例子。

建议边读边建一个单独的 Vite Vue 练习项目。不要一开始就改项目现有文章详情页或 AI 聊天页。独立练习项目可以自由升级依赖、尝试恶意输入和调整样式，验证完再把稳定模块接回主工程。

## 选依赖时看清它们的工作

```text
markdown-it        语法解析与 HTML 生成
DOMPurify          清理 HTML，降低 XSS 风险
highlight.js       识别代码语言并生成高亮 span
Mermaid            把图表文本绘制成 SVG
KaTeX              排版 TeX 数学表达式
markdown-it 插件   让解析器识别表格扩展、公式分隔符等语法
Vue                管理输入、响应式更新、挂载和组件生命周期
```

只需要普通文章时，先安装 markdown-it 和 sanitizer。确定支持代码高亮后再加一种 highlighter；确定业务真的要画流程图再加 Mermaid；确定内容常用公式再加 KaTeX。每多一个库，都会增加包体积、升级成本和安全检查面。

## 每篇怎么练

每篇文章都按“原理 → 最小示例 → 在真实应用中怎么放 → 容易出错的边界 → 验收”组织。建议在自己的笔记中记录：

```text
我现在的输入是什么？
解析器产出了什么 Token 或 HTML？
哪个模块负责过滤和渲染？
失败时用户还能看到什么？
这个功能需要哪些样例才能证明可用？
```

代码粘贴后先逐行解释，再逐步改动。若代码运行效果不同，先记录实际 `markdown-it` 和插件版本，不要马上更改多项配置。

## 常见现象的排查顺序

| 现象 | 第一处检查 | 再检查 |
| --- | --- | --- |
| `v-html` 显示空白 | 组件是否拿到 source | sanitizer 是否移除了整个节点 |
| 标题和列表正常，表格不正常 | 当前是否装了 GFM 表格规则 | 编辑器与展示端是否使用同一方言 |
| 代码只有黑白文本 | fence 的 `info` 是否有语言 | 语言是否注册、CSS 主题是否导入 |
| 代码出现彩色但恶意输入也变 HTML | sanitizer 是否在高亮之后执行 | 允许的标签和 class 是否过宽 |
| Mermaid 只显示源文 | Vue 是否在 DOM 更新后调用 Mermaid | fence renderer、语法版本和异步错误 |
| 公式显示成美元符号 | 数学插件是否安装和注册 | 分隔符、转义、KaTeX CSS 与字体路径 |
| 页面在流式回复时很卡 | 是否每个分片重新解析全部内容 | 高亮/公式/图表是否过早启动 |
| 流式结束后少最后几个字 | done 时是否 flush 缓冲区 | SSE reader 是否读取了尾部数据 |

## 术语小词典

| 术语 | 直白解释 |
| --- | --- |
| 解析器 Parser | 读懂源文本规则并生成结构的程序 |
| Token | 解析器产出的结构化小片段，供插件和 Renderer 继续处理 |
| Renderer | 把 Token 转换成 HTML 的输出器 |
| 插件 Plugin | 向现有解析过程增加规则或改变输出的扩展函数 |
| Sanitizer | 在 HTML 写进页面之前删除不允许内容的过滤器 |
| XSS | 攻击者让浏览器执行不该执行的脚本或事件代码 |
| SSR | 服务端先生成页面 HTML，再交给浏览器接管 |
| SSE | 服务端通过一个持续打开的 HTTP 响应推送事件 |
| 增量渲染 | 只更新变化的那一部分内容，而非全部重做 |
| 延迟加载 | 用户需要时再下载较重的功能包 |

## 读完后的能力检查

给自己一段包含标题、表格、代码、Mermaid 图和公式的 AI 回复，尝试完成以下工作：

1. 写出对应原始 Markdown，说明哪些语法属于 CommonMark，哪些依赖扩展插件。
2. 通过 markdown-it 查看 Token，确认代码围栏不会被公式规则处理。
3. 让危险 HTML、危险链接和伪造 SVG 都不能执行。
4. 未知代码语言、错误 Mermaid 和无效公式都能回退到可读内容。
5. 模拟分片到达，证明最后分片、取消状态和滚动状态都正确。
6. 在浅色、深色和手机宽度下检查长代码、宽图表和长公式。

能够做到这些，就已经掌握了从 Markdown 源文到 AI 产品内容展示的完整主链路，而不只是能调用 `md.render()`。
