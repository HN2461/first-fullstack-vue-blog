---
title: 第 6 篇：Markdown 数学公式与 KaTeX：行内公式、块级公式、分隔符和安全配置
slug: markdown-it-math-katex-formulas
summary: 理解 TeX 数学表达式与 Markdown 的边界，接入 KaTeX 插件，掌握行内和块级分隔符、转义、公式错误、字体加载和无障碍输出。
tags:
  - KaTeX
  - LaTeX
  - 数学公式
  - markdown-it
  - 前端渲染
category: markdown-it
categoryPath:
  - 项目复用技术
  - JS库
  - markdown-it
sortOrder: 70
status: published
---

# 第 6 篇：Markdown 数学公式与 KaTeX：行内公式、块级公式、分隔符和安全配置

## 1. 先分清 Markdown、TeX 和 KaTeX

- Markdown 负责文章结构，如标题、段落和代码块。
- TeX/LaTeX 数学语法负责描述公式，如 `\frac{a}{b}`。
- KaTeX 接收 TeX 数学表达式并生成浏览器可显示的 HTML、CSS 和 MathML。
- `markdown-it-texmath` 一类插件负责识别 Markdown 中哪些片段属于公式，再调用 KaTeX。

所以“Markdown 支持公式”其实是解析器加插件再加公式引擎共同完成的。

## 2. 行内公式和块级公式

行内公式跟随段落排版，常用 `$...$`：

```markdown
勾股定理写作 $a^2 + b^2 = c^2$。
```

块级公式单独占一行，通常使用双美元符号：

```markdown
$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$
```

有些系统使用 `\(...\)` 和 `\[...\]`。项目必须选一组分隔符，并写进编辑器提示、导入格式和测试样例。不要同时启用太多分隔符，普通文本中的美元价格可能被误判为公式。

## 3. 安装 KaTeX 和 markdown-it 插件

```bash
npm install katex markdown-it-texmath
```

加载 KaTeX CSS，并在统一解析器工厂里安装插件：

```js
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function createMarkdown() {
  const md = new MarkdownIt({ html: false })

  md.use(texmath, {
    engine: katex,
    delimiters: 'dollars',
    katexOptions: {
      throwOnError: false,
      strict: 'warn',
      trust: false,
      output: 'htmlAndMathml'
    }
  })

  return md
}
```

插件选项名称会因 `markdown-it-texmath` 版本变化，安装后要查看它对应版本的 README 和类型定义。这里重点是配置结构：提供 KaTeX 引擎、确定分隔符、将无效公式作为可读错误处理、默认禁止不可信命令。

## 4. 逐项理解安全选项

- `throwOnError: false`：错误公式显示为错误文本或带错误样式的输出，不让整篇文档解析中断。
- `trust: false`：禁止允许公式执行 HTML、链接等高风险扩展命令。
- `strict`：对不规范或未支持语法给出检查策略；团队可选择 `warn` 或更严格策略。
- `output: 'htmlAndMathml'`：同时输出视觉 HTML 和 MathML 信息，改善辅助技术读取。

公式内容仍然来自用户或模型，不能因为它“看起来像数学”就允许 KaTeX trust 模式。不要开放 `\htmlClass`、`\href` 等能力，除非有真实需求并经过安全评审。

## 5. 反斜杠和代码围栏

公式使用很多反斜杠。普通段落中 `\alpha` 可能受 Markdown 转义规则影响；应按照选定插件的分隔符写法测试。代码围栏内部始终是代码，不应被公式插件处理：

````markdown
```tex
\frac{a}{b}
```
````

如果代码块里的公式意外被排版，通常说明插件规则没有正确尊重 Token 上下文。检查 Token 顺序，不要用全文正则在 renderer 最终 HTML 上替换美元符号。

## 6. CSS、字体和包体积

KaTeX 需要 CSS 和字体文件。若 CSS 未加载，公式可能变成错位的字符；若字体路径被部署到错误的静态资源目录，构建环境成功但线上显示回退字体。

安装后要验证：

- Vite 构建是否把 KaTeX 字体写入产物。
- 生产静态服务器的字体 MIME type 和缓存策略是否正确。
- 内容安全策略 CSP 是否允许加载这些同源字体。
- 暗色主题下公式颜色是否继承正文颜色。
- 很长的公式是否可以在容器内横向滚动。

如果只有少数页面需要数学公式，可采用异步加载，避免所有普通用户都承担完整公式引擎的首屏成本。对公式渲染结果做缓存时，缓存 key 至少应包含原始表达式、KaTeX 版本、选项和主题策略。

## 7. 行内与块级布局

```css
.markdown-content :deep(.katex-display) {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.25rem 0;
}

.markdown-content :deep(.katex) {
  color: inherit;
}
```

不要对所有公式设置 `white-space: normal` 或破坏 KaTeX 内部布局的全局样式。长矩阵和多行推导应允许公式区域独立滚动，而不是扩大整个页面。

## 8. AI 生成的半截公式

流式回答可能暂时只有 `$\\frac{1}{`，还没有结束分隔符或大括号。此时 KaTeX 可能显示错误并在下一段到来后重新排版。常见策略：

1. 未完成消息暂时把公式源文本当普通文本显示。
2. 或仅在检测到配对分隔符后排版已闭合公式。
3. 收到 `done` 后对完整消息做一次正式解析。
4. 结束后再处理图表和高亮，不对每个字符都初始化重型引擎。

简单匹配 `$` 数量不能完整判断数学语法，因为转义美元符号和代码围栏也会影响计数。最好让流式状态机知道当前所处的 Markdown 区块，或把最终渲染延后到消息完成。

## 本篇验收清单

- 能区分 Markdown 结构、TeX 源码和 KaTeX 渲染。
- 行内、块级公式分隔符明确并通过样例测试。
- 错误公式不会让整篇消息白屏。
- `trust` 默认关闭，用户内容不会触发 HTML 扩展。
- KaTeX CSS 和字体在生产构建中正确加载。
- 暗色主题、长公式和窄屏布局可读。
- 流式半截公式不会导致明显闪烁或页面卡顿。

## 官方资料

- [KaTeX 文档](https://katex.org/docs/)
- [KaTeX 安全说明](https://katex.org/docs/security)
- [markdown-it-texmath](https://github.com/goessner/markdown-it-texmath)

## 系列导航

[上一篇：Mermaid 图表](/articles/markdown-it-mermaid-diagrams-vue) · [下一篇：AI 对话中的流式 Markdown](/articles/markdown-it-ai-streaming-markdown-rendering)
