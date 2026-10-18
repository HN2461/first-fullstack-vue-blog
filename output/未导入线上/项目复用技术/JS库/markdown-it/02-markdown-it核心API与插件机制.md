---
title: 第 2 篇：markdown-it 核心 API 与插件机制：配置、Token、Renderer 和自定义规则
slug: markdown-it-core-api-plugin-development
summary: 用可运行代码学习 MarkdownIt 实例、render 与 parse、Token 属性、Renderer 覆盖和插件规则，理解何时应该写插件、何时应该使用现成扩展。
tags:
  - markdown-it
  - Token
  - Renderer
  - 插件开发
  - JavaScript
category: markdown-it
categoryPath:
  - 项目复用技术
  - JS库
  - markdown-it
sortOrder: 30
status: published
---

# 第 2 篇：markdown-it 核心 API 与插件机制：配置、Token、Renderer 和自定义规则

## 1. 安装并创建解析器

在前端项目目录安装：

```bash
npm install markdown-it
```

创建实例：

```js
import MarkdownIt from 'markdown-it'

export const md = new MarkdownIt({
  html: false,
  breaks: false,
  linkify: false,
  typographer: false,
  langPrefix: 'language-'
})
```

`MarkdownIt` 是构造函数。配置通常在创建时确定，然后把实例作为共享服务复用。不要每渲染一条聊天消息就新建实例，因为插件、规则和配置会重复初始化。

## 2. 五个常用配置的含义

| 配置 | 默认取舍 | 初学者如何理解 |
| --- | --- | --- |
| `html` | 默认关闭 | 是否允许 Markdown 里直接写 HTML；用户内容通常保持 `false` |
| `breaks` | 默认关闭 | 普通文本换行是否输出 `<br>`，聊天产品可按体验选择 |
| `linkify` | 默认关闭 | 是否把裸露的网址自动转成链接；markdown-it 提供该能力，开启后仍要测试 URL 安全策略 |
| `typographer` | 默认关闭 | 是否把引号、破折号等替换成排版字符，不同语言需验证 |
| `langPrefix` | 默认 `language-` | 代码块语言 class 的前缀，常用于高亮样式选择 |

配置项会改变所有文章的解释方式。应把最终值放在项目统一工厂函数中，并用几组固定 Markdown 样本做回归测试。

## 3. `render`、`renderInline`、`parse` 的区别

```js
const source = '# 标题\n\n正文 **加粗**。'

const html = md.render(source)
const inlineHtml = md.renderInline('正文 **加粗**。')
const tokens = md.parse(source, {})
```

- `render` 处理完整文档，会解析标题、段落、列表等区块。
- `renderInline` 只处理行内语法。传入多行完整文章会丢失区块语义。
- `parse` 返回 Token 数组，不生成最终 HTML。它适合目录提取、Token 检查和插件调试。

第二个参数 `env` 是一轮解析的上下文对象：

```js
const env = { articleId: 'a-123', headings: [] }
const tokens = md.parse(source, env)
console.log(env)
```

插件可以将该次解析的信息写进 `env`。因为它是调用方传入的对象，所以每次独立渲染都应新建，避免两个文章共享同一个数组。

## 4. Token 树为什么有开闭标记

很多结构会使用开标签、内容、闭标签三个 Token 表达：

```js
[
  { type: 'bullet_list_open', nesting: 1 },
  { type: 'list_item_open', nesting: 1 },
  { type: 'inline', content: '苹果' },
  { type: 'list_item_close', nesting: -1 },
  { type: 'bullet_list_close', nesting: -1 }
]
```

这个结构类似 DOM 树的括号配对。`level` 帮助插件判断当前嵌套深度，`nesting` 帮助插件知道进入还是离开某个结构。插件处理嵌套时要维护自己的栈或层级，不能假设每个标题、列表都是平铺的。

## 5. 修改 Renderer 输出

Renderer rules 接收 Token、索引、选项、环境和 Renderer 上下文。比如为外部链接添加安全属性：

```js
const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => {
  return self.renderToken(tokens, idx, options)
})

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const href = token.attrGet('href') || ''

  if (href.startsWith('https://') || href.startsWith('http://')) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer nofollow')
  }

  return defaultLinkOpen(tokens, idx, options, env, self)
}
```

这只展示“如何在渲染前查看属性”。真正的 URL 策略应由后端和统一安全层共同约束；不能只检查 `startsWith('http')` 就认定任意链接都可信。安全章节会详细处理协议、属性和清理顺序。

`self.renderToken` 可以保留 markdown-it 默认的属性转义和标签输出。自己拼接 `<a href="${href}">` 容易忘记转义引号，造成 HTML 注入。

## 6. 规则链和插件

markdown-it 内部有多条规则链：

- `core`：在区块和行内解析周围做整体处理。
- `block`：识别标题、列表、代码围栏等区块。
- `inline`：识别强调、链接、代码等行内语法。
- `renderer`：把 Token 输出为 HTML。

插件通常是一个函数，接收 `md` 实例和可选配置：

```js
function headingAnchorPlugin(md, options = {}) {
  const slugify = options.slugify || ((text) => text.toLowerCase().replace(/\s+/g, '-'))

  md.core.ruler.push('heading_anchor', (state) => {
    for (let index = 0; index < state.tokens.length; index += 1) {
      const token = state.tokens[index]
      if (token.type !== 'heading_open') continue

      const inline = state.tokens[index + 1]
      const title = inline?.content || ''
      token.attrSet('id', slugify(title))
    }
  })
}

md.use(headingAnchorPlugin, {
  slugify: (text) => `section-${text.trim().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')}`
})
```

这段代码只是展示核心机制。生产级标题 slug 还要处理同名标题冲突、emoji、标点、前后空格和不同语言，并保证目录链接与实际标题 ID 使用同一结果。

## 7. `push`、`before`、`after` 和顺序

规则执行顺序会影响结果。向规则链末尾 `push`，表示在现有规则后运行；`before`、`after` 可以将规则放到某个已存在规则前后。扩展前要确认目标规则在当前版本存在：

```js
const ruler = md.core.ruler
if (ruler.getRules('')) {
  // 查看规则时可结合源码和调试输出确认顺序
}
```

具体检查方式随版本 API 变化，优先读当前版本类型定义和官方源码。插件依赖某条内部规则时，升级 markdown-it 要执行针对性回归。

## 8. 插件还是自定义规则

| 需求 | 首选方式 | 原因 |
| --- | --- | --- |
| GFM 表格或任务列表 | 成熟插件 | 规则边界复杂，兼容性需要长期维护 |
| 数学公式 | KaTeX/MathJax 集成插件 | 公式分隔符和代码围栏边界难处理 |
| Mermaid | 自定义 fence renderer 或成熟插件 | 需要控制图表生命周期和安全级别 |
| 文章标题锚点 | 插件或一次 core 规则 | 要统一目录与标题 ID |
| 业务专属提示框语法 | 先评估现成 container 插件，再写规则 | 要明确嵌套、闭合和错误输入行为 |
| 只改链接属性 | renderer rule | 不需要改语法解析过程 |

如果你的规则只是 `source.replace(...)`，先停下来确认它是否会误伤代码围栏、行内代码、转义字符或链接地址。Markdown 是嵌套语言，普通正则通常不知道当前所在上下文。

## 9. 调试插件的步骤

1. 准备最小输入，只包含一个目标语法。
2. 打印 `md.parse(source, env)` 的 Token。
3. 查看规则运行前后的 Token 差异。
4. 渲染后检查 HTML，而不只看浏览器样式。
5. 加入嵌套、转义、重复 ID、空内容和错误闭合用例。
6. 固定 markdown-it 和插件版本，升级时重新跑用例。

## 本篇验收清单

- 能解释 `render`、`renderInline`、`parse` 的用途。
- 能读取 Token 的 `type`、`nesting`、`level`、`content` 和 `attrs`。
- 能使用 `md.use` 安装插件，并用 renderer rule 调整输出。
- 能说明为什么拼接 HTML 和通用正则替换容易出错。
- 能为自定义规则设计嵌套、错误输入和重复数据测试。

## 官方资料

- [markdown-it API 文档](https://markdown-it.github.io/markdown-it/)
- [markdown-it 插件列表](https://github.com/markdown-it/markdown-it#plugins)
- [markdown-it 源码](https://github.com/markdown-it/markdown-it)

## 系列导航

[上一篇：Markdown 语法与解析原理](/articles/markdown-syntax-parser-principles) · [下一篇：Vue 3 安全渲染 Markdown](/articles/markdown-it-vue3-safe-rendering)
