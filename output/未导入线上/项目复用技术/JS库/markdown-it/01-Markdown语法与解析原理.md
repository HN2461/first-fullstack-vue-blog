---
title: 第 1 篇：Markdown 语法与解析原理：从纯文本到 Token 和 HTML
slug: markdown-syntax-parser-principles
summary: 从标题、段落、列表、链接和代码块开始，理解 Markdown 的区块解析、行内解析、Token、中间树和 HTML 渲染过程。
tags:
  - Markdown
  - CommonMark
  - 解析器原理
  - 前端基础
category: markdown-it
categoryPath:
  - 项目复用技术
  - JS库
  - markdown-it
sortOrder: 20
status: published
---

# 第 1 篇：Markdown 语法与解析原理：从纯文本到 Token 和 HTML

## 1. Markdown 首先是给人写的纯文本

Markdown 文件本质上仍然是普通字符串。下面这段内容没有特殊二进制格式，任何文本编辑器都能打开：

````markdown
# 今日计划

先阅读 [Markdown 官方规范](https://spec.commonmark.org/)。

- 安装依赖
- 写一个示例

```js
console.log('hello')
```
````

`#`、`-`、反引号和方括号只是约定好的标记。Markdown 的价值在于“源文本可读”，即使暂时不渲染，作者也能看懂内容。

## 2. Markdown 不是 HTML 的替代品

Markdown 和 HTML 处在不同层次：

| 层次 | 例子 | 作用 |
| --- | --- | --- |
| 内容源文本 | `# 标题` | 作者编辑和保存 |
| 解析结果 | heading token | 程序理解结构 |
| 展示格式 | `<h1>标题</h1>` | 浏览器布局和交互 |

因此保存文章时，通常保存原始 Markdown，而不是只保存生成后的 HTML。原文便于编辑、迁移和重新渲染；HTML 可以作为缓存或发布产物，但不应成为唯一来源。

## 3. 区块元素和行内元素

解析器通常先识别“区块”，再识别区块内部的“行内元素”。区块元素决定一段内容从哪里开始、在哪里结束，例如：

- 标题：`#` 到 `######`。
- 段落：连续的普通文本行。
- 引用：以 `>` 开始。
- 列表：以 `-`、`*`、`+` 或数字加点开始。
- 代码围栏：以三个或更多反引号开始和结束。
- 表格、分隔线和 HTML 区块。

行内元素出现在区块内部，例如：

- `[链接](https://example.com)`。
- `**粗体**`、`*斜体*`、`~~删除线~~`。
- `` `行内代码` ``。
- `![图片](image.png)`。
- 反斜杠转义后的普通字符。

为什么要分两步？因为同一个字符在不同上下文中的意义不同。列表中的 `-` 是列表标记，段落中间的 `-` 可能只是普通连字符。先确定区块边界，可以减少歧义。

## 4. 常用语法从输入到输出

### 4.1 标题和段落

```markdown
# 一级标题
## 二级标题

这是一个段落。
这一行和上一行仍属于同一个段落。
```

通常输出为：

```html
<h1>一级标题</h1>
<h2>二级标题</h2>
<p>这是一个段落。这一行和上一行仍属于同一个段落。</p>
```

换行是否生成 `<br>` 取决于解析器配置。`markdown-it` 默认遵循 CommonMark，单个换行通常仍在同一个段落中；开启 `breaks: true` 后，普通换行会生成 `<br>`。聊天界面是否开启需要结合产品习惯决定，不要在全局配置中随意改变文章语义。

### 4.2 列表

```markdown
- 苹果
- 香蕉
  - 国产香蕉
  - 进口香蕉

1. 安装
2. 配置
3. 验证
```

列表项的缩进属于语法的一部分。用户从 AI 复制内容时，缩进可能由空格和 Tab 混合组成，解析结果也可能因此变化。渲染器应保留原文，并在测试中覆盖嵌套列表、空列表项和列表中包含代码块的情况。

### 4.3 链接和图片

```markdown
[项目主页](https://example.com "可选标题")
![架构图](https://example.com/architecture.png "可选说明")
```

链接和图片都包含外部 URL，因此它们既是语法问题也是安全问题。解析器负责识别语法，但是否允许 `javascript:`、`data:` 或外部域名，应该由应用安全策略决定。

### 4.4 引用和分隔线

```markdown
> 这是引用。
>
> 引用可以包含多个段落。

---
```

引用内部还可以嵌套列表、代码和其他段落。分隔线常用于视觉分段，但在文章目录中不要把它误认为标题。

### 4.5 代码

行内代码使用一对反引号：

```markdown
执行 `npm run build` 检查构建。
```

### 4.6 表格、删除线和任务列表属于常见扩展

很多人平时写的 Markdown 实际上是 GFM（GitHub Flavored Markdown），不只是 CommonMark。GFM 常见扩展包括表格、删除线、任务列表和自动链接。例如：

```markdown
| 名称 | 用途 |
| --- | --- |
| markdown-it | 把 Markdown 解析为 Token 和 HTML |
| KaTeX | 排版数学公式 |

- [x] 阅读语法基础
- [ ] 接入代码高亮

这段文字包含 ~~已经删除的内容~~。
```

表格分隔行中的冒号决定列对齐，例如 `:---` 左对齐、`:---:` 居中、`---:` 右对齐。任务列表中的 `[x]` 和 `[ ]` 是 GFM 语法，不是所有 Markdown 渲染器都会识别。markdown-it 默认 preset 已包含表格和删除线规则，但任务列表通常需要安装并注册 `markdown-it-task-lists` 等插件。项目要以自己的 preset 和插件清单为准，并在编辑预览、文章详情和 AI 消息中使用一致配置。

### 4.7 换行和转义

```markdown
这是第一行
这是同一段的第二行。

这是新段落。

这一行末尾有反斜杠\
因此强制换行。

需要显示星号时写成 \*普通星号\*。
```

空行通常用于结束一个段落并开始下一个区块。普通单换行默认不会变成 `<br>`；行尾两个空格或反斜杠可以请求硬换行，但行尾空格很难被编辑器保留。markdown-it 的 `breaks: true` 会把普通换行也转成硬换行，适合某些聊天展示，但会改变文章原本的段落节奏。反斜杠转义则让语法标记恢复为普通字符。

多行代码推荐使用围栏，并声明语言：

````markdown
```js
const answer = 42
```
````

语言标识 `js` 会成为后续高亮的输入。Markdown 解析器不会自动理解 JavaScript 语法；高亮引擎需要另行处理。

## 5. 解析器到底做了什么

可以把一个简化的解析过程想成下面五步：

```text
1. 读取字符流
2. 规范化换行、缩进和转义
3. 区块规则扫描：标题、段落、列表、围栏
4. 对段落和标题运行行内规则：强调、链接、代码
5. 将 Token 交给 Renderer 输出 HTML
```

真实实现会考虑回溯、嵌套和优先级，但这个模型足以帮助排查问题。比如“代码块里的 `**文字**` 没有变粗”，因为 fenced code 规则已经把整段内容标记为代码，行内强调规则不会再进入代码内容。

## 6. Token 是解析器和扩展之间的中间语言

以 `# Hello` 为例，解析器可能得到一个 `heading_open`、一个 `inline` 和一个 `heading_close` Token。简化表示如下：

```js
[
  { type: 'heading_open', tag: 'h1', nesting: 1, level: 0 },
  { type: 'inline', content: 'Hello', children: [
    { type: 'text', content: 'Hello' }
  ] },
  { type: 'heading_close', tag: 'h1', nesting: -1, level: 0 }
]
```

Token 通常包含：

- `type`：规则生成的类型。
- `tag`：默认 HTML 标签。
- `nesting`：`1` 表示打开，`-1` 表示关闭，`0` 表示单个元素。
- `level`：嵌套层级。
- `content`：文本或代码内容。
- `attrs`：属性数组，例如链接的 `href`。
- `map`：原文行号范围，方便报错或定位。
- `children`：行内 Token 的子数组。

插件常常在渲染前修改 Token。例如给标题增加稳定的 `id`，给外部链接添加 `target`，或把 `mermaid` 围栏转换为自定义节点。直接正则替换最终 HTML 通常更脆弱，因为你已经失去了原始结构信息。

## 7. Markdown 方言和兼容性

“Markdown”不是只有一套完全一致的规则。常见差异包括：

- CommonMark 对列表缩进和换行有明确规定。
- GFM 增加表格、任务列表、删除线和自动链接等能力。
- 不同编辑器对脚注、数学公式、HTML 和 Mermaid 的扩展各不相同。
- 同样的源文在 GitHub、Typora、Obsidian 和你的页面中可能生成不同 HTML。

一个容易忽略的例子是表格：有些编辑器把它当作基础 Markdown，有些解析器则需要 GFM 或表格插件。数学公式、脚注、提示框和 Mermaid 通常更明显地属于扩展。团队应列出“允许作者使用的语法”，并让编辑预览和最终文章页面共用解析器配置，避免编辑时正常、上线后只显示源码。

项目开始前要写清楚支持范围。不要让作者以为“在编辑器里能显示”就意味着线上一定能显示。保存时可以记录渲染版本或方言，后续升级解析器时才能解释历史文章为什么变化。

## 8. 用 markdown-it 查看解析结果

安装后可以在 Node.js 中查看 Token：

```js
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, breaks: true })
const source = '# 标题\n\n这是 **重点**。'

console.log(md.parse(source, {}))
console.log(md.render(source))
```

`parse` 返回 Token 数组，`render` 直接返回 HTML。学习阶段先打印 Token，再看 HTML，比只看浏览器效果更容易理解插件到底改了什么。

## 9. 原理练习

请分别预测下面输入会生成什么，再用 `md.render` 验证：

````markdown
1. 第一项

   ```js
   const value = '**不是粗体**'
   ```

2. 第二项
````

重点观察代码围栏的缩进、列表项边界和代码内部的强调标记。遇到不同结果时，先看 Token 结构，再决定是语法问题、方言差异还是插件问题。

## 本篇验收清单

- 能区分原始 Markdown、Token 和 HTML。
- 能解释区块解析为什么先于行内解析。
- 能写标题、段落、列表、链接、引用、代码围栏和表格。
- 知道语言标识不会自动带来代码高亮。
- 能用 `md.parse` 查看 Token，用 `md.render` 得到 HTML。
- 能说明 CommonMark、GFM 和编辑器扩展之间的差异。

## 官方资料

- [CommonMark 规范](https://spec.commonmark.org/)
- [GitHub Flavored Markdown 规范](https://github.github.com/gfm/)
- [markdown-it API](https://markdown-it.github.io/markdown-it/)

## 系列导航

[下一篇：markdown-it 核心 API、规则链与插件开发](/articles/markdown-it-core-api-plugin-development)
