---
title: "第 4 篇：Markdown 代码块与语法高亮：highlight.js、Shiki、复制和长代码处理"
slug: "markdown-it-code-highlight-highlightjs-shiki"
summary: "理解 fenced code token、语言标识与语法高亮的关系，使用 highlight.js 接入 markdown-it，并比较 Shiki、代码复制、行号和长代码性能。"
category: "markdown-it"
categoryPath:
  - "项目复用技术"
  - "JS库"
  - "markdown-it"
tags:
  - "markdown-it"
  - "highlight.js"
  - "Shiki"
  - "代码高亮"
  - "Vue 3"
status: "published"
sortOrder: 50
cover: ""
originalId: "6ad4b44801881c9ee2404eb1"
originalSlug: "markdown-it-code-highlight-highlightjs-shiki"
originalStatus: "published"
publishedAt: "2026-10-18T11:57:59.988Z"
updatedAt: "2026-10-18T11:58:00.049Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 4 篇：Markdown 代码块与语法高亮：highlight.js、Shiki、复制和长代码处理

## 1. 代码围栏中的语言只是提示

````markdown
```js
const total = 1 + 2
```
````

解析器会把 `js` 保存为代码 Token 的 `info`，默认输出大致是：

```html
<pre><code class="language-js">const total = 1 + 2
</code></pre>
```

`language-js` 只是 class，不会自动让浏览器理解 JavaScript。高亮库需要把源代码扫描成 token 或 span，再附上颜色 class / inline style，主题 CSS 才会呈现颜色。

## 2. 选择 highlight.js 还是 Shiki

| 项目 | highlight.js | Shiki |
| --- | --- | --- |
| 运行方式 | 可在浏览器运行，也可服务端运行 | 基于 TextMate grammar，通常异步初始化 |
| 主题输出 | class + CSS 主题 | 输出和编辑器相近的精确 token 颜色 |
| 包体积 | 可按需注册少量语言 | 语言和主题需明确选择，否则初始化和包体积增加 |
| 大量代码块 | 适合常见聊天和文章场景 | 适合文档站和需要高保真主题的场景 |
| AI 流式 | 每次增量重算可能较贵 | 初始化和同步策略更复杂 |
| 推荐使用 | 想快速接入、包体积可控 | 需要 VS Code 风格的精确高亮且能接受异步成本 |

初学者先选一种工具。不要为了“效果更专业”同时装多个高亮引擎。先测量实际语言、代码块数量、首屏大小和主题需求，再决定。

## 3. highlight.js 按语言注册

完整导入 `highlight.js` 可能包含很多语言。按需注册可降低初始包体积：

```js
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'

hljs.registerLanguage('js', javascript)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
```

短别名也要注册，否则 AI 输出 ````js```` 而应用只认识 `javascript` 时会降级成纯文本。具体语言模块路径应以安装版本的官方文档为准。

## 4. 连接 markdown-it 的 `highlight` 回调

```js
import MarkdownIt from 'markdown-it'
import hljs from './highlightLanguages'

export const md = new MarkdownIt({
  html: false,
  highlight(code, language) {
    const normalized = String(language || '').toLowerCase()

    if (!normalized || !hljs.getLanguage(normalized)) return ''

    try {
      return hljs.highlight(code, { language: normalized }).value
    } catch {
      return ''
    }
  }
})
```

这里返回的是高亮 HTML 片段，不应该再包 `<pre><code>`。markdown-it 负责外围结构。未知语言或高亮抛错时返回空字符串，markdown-it 会退回转义后的纯文本。不要在失败时返回原始 `code`，因为源代码里可能包含 `<script>` 字符，必须由解析器正确转义。

另外，高亮回调不会自动决定语言加载策略。应该只注册产品确实需要的语言，并为常见别名做归一化。将用户提供的任意语言字符串传入 `import()` 会造成无法预估的包加载和资源访问。

## 5. 加载 CSS 主题

在应用入口或 Markdown 样式入口加载一个主题：

```js
import 'highlight.js/styles/github-dark.css'
```

亮色文章页可以选浅色主题，暗色工作台可以用主题变量或切换 class。不要同时导入多个互相覆盖的全局主题。更稳妥的方式是只导入基础样式，再将高亮颜色适配到应用主题，或者使用隔离的 `.markdown-content` 容器。

```css
.markdown-content :deep(pre code.hljs) {
  display: block;
  overflow-x: auto;
  padding: 16px;
  border-radius: 6px;
}

.markdown-content :deep(pre) {
  max-width: 100%;
  margin: 1em 0;
}
```

代码区域要横向滚动，不要把整页宽度撑开。小屏上允许代码区横向滚动，但页面主容器本身不应出现水平滚动。

## 6. 高亮后的 HTML 仍需经过统一清理

高亮引擎输出 `<span class="...">`。完整链路仍应是：

```text
Markdown -> markdown-it -> highlighter HTML -> DOMPurify -> v-html
```

DOMPurify 配置应允许高亮所需的 `span` 和 `class`，同时拒绝脚本标签和事件属性。不要对高亮结果单独跳过 sanitizer。用一个包含 `<img onerror=...>` 的“代码样本”验证：它应该作为转义文本显示在代码块里，不应该成为真实图片元素。

## 7. 复制代码的交互设计

复制按钮属于界面交互，不属于高亮语法。实现时要确保：

- 从 `code.textContent` 读取文本，而非复制带 `<span>` 的 HTML。
- `navigator.clipboard` 需要安全上下文；失败时给用户明确反馈。
- 按钮只在代码块容器内工作，不把整篇文章都复制。
- 点击按钮不触发代码区域链接或父消息操作。
- 长代码复制时不会自动展开或滚动页面。

可以用事件委托在 Markdown 容器上监听 `[data-copy-code]`，但应在 Vue 的 `onMounted` 绑定，在 `onBeforeUnmount` 移除。更复杂的按钮可改为自定义 Token renderer 或代码块子组件，避免每次内容更新都重新插入重复按钮。

```js
async function copyCode(button) {
  const code = button.closest('pre')?.querySelector('code')?.textContent || ''
  await navigator.clipboard.writeText(code)
}
```

上面只展示读取方式；实际组件要处理剪贴板权限拒绝和按钮 loading/成功状态。

## 8. 行号与代码高亮的边界

行号不是 Markdown 语法本身。可通过插件、renderer 或 CSS 计数实现。使用前确认：

- 长行自动换行时行号如何对齐。
- 复制内容是否会把行号一起复制。
- 代码块为空时是否显示行号。
- 行号列是否影响窄屏横向滚动。
- 高亮 HTML 经过 sanitizer 后 class 是否保留。

如果只是展示代码，优先不加行号，减少视觉噪声。需要讲解“第 12 行报错”时再启用。

## 9. 超长代码与性能

高亮是 CPU 工作。对 AI 生成的几十万字符代码，整段同步高亮可能冻结主线程。可采取：

- 限制消息长度和代码围栏最大字节数。
- 对超长代码回退为纯文本，提供“点击高亮”或下载。
- 流式生成期间先显示纯文本，结束后高亮一次。
- 只对可视区域内代码块高亮。
- 对稳定内容缓存高亮结果，缓存 key 包含语言和主题版本。
- Shiki 使用 worker 或服务端预渲染时，评估首屏和服务成本。

不要每次收到一个 token 都对所有历史代码重新运行高亮。

## 本篇验收清单

- 能解释 ```` ```js ```` 为什么只是语言提示。
- 只注册应用需要的语言和别名。
- 未知语言安全退化为纯文本。
- 高亮 CSS 不污染其它页面或亮暗主题。
- 复制得到纯代码文本，失败时有提示。
- 超长代码不会阻塞整个页面。
- 高亮 HTML 仍经过清理器。

## 官方资料

- [highlight.js](https://highlightjs.org/)
- [highlight.js 使用说明](https://highlightjs.org/usage/)
- [Shiki](https://shiki.style/)
- [markdown-it `highlight` 选项](https://markdown-it.github.io/markdown-it/)

## 系列导航

[上一篇：Vue 3 安全渲染 Markdown](/articles/markdown-it-vue3-safe-rendering) · [下一篇：Mermaid 图表与 Vue 生命周期](/articles/markdown-it-mermaid-diagrams-vue)
