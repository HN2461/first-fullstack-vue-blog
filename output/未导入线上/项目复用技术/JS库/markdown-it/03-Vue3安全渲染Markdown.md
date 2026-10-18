---
title: 第 3 篇：Vue 3 安全渲染 Markdown：v-html、XSS、链接策略和可复用组件
slug: markdown-it-vue3-safe-rendering
summary: 在 Vue 3 中创建统一的 Markdown 渲染组件，理解 v-html 风险、关闭原始 HTML、清理器顺序、URL 协议过滤和主题样式隔离。
tags:
  - Vue 3
  - markdown-it
  - DOMPurify
  - XSS
  - 前端安全
category: markdown-it
categoryPath:
  - 项目复用技术
  - JS库
  - markdown-it
sortOrder: 40
status: published
---

# 第 3 篇：Vue 3 安全渲染 Markdown：v-html、XSS、链接策略和可复用组件

## 1. 为什么 Markdown 输出 HTML 后还需要安全处理

Markdown 内容可能来自用户、导入文件或大模型。它们都属于不可信输入。虽然 Markdown 看起来只是文本，但解析器可能生成 `<a>`、`<img>` 等 HTML 元素；如果允许原始 HTML，用户还可以直接输入标签。错误的 URL 协议、SVG、事件属性或插件输出也可能带来脚本执行风险。

Vue 默认会转义模板插值：

```vue
<p>{{ untrustedText }}</p>
```

但 `v-html` 会把字符串当 HTML 解析：

```vue
<div v-html="untrustedHtml" />
```

所以 `v-html` 不是一个普通显示指令，它是把 HTML 注入 DOM 的边界。只有经过明确、可审计的处理流程后才能使用。

## 2. 先采用保守的 markdown-it 配置

```js
import MarkdownIt from 'markdown-it'

export const md = new MarkdownIt({
  html: false,
  breaks: false,
  linkify: false,
  typographer: false
})
```

`html: false` 会把原始 HTML 视为文本，不允许 Markdown 直接插入任意标签。这是重要的第一道限制，但不能替代 HTML sanitizer：插件可能生成 HTML，外部高亮器或公式库也会生成 HTML，且 URL 属性仍需经过策略处理。

## 3. HTML 清理器的职责

常见选择是 DOMPurify。安装：

```bash
npm install dompurify
```

浏览器端的最小例子：

```js
import DOMPurify from 'dompurify'

export function renderSafeMarkdown(source) {
  const html = md.render(String(source || ''))
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }
  })
}
```

清理器不是解析器：它不会替代 Markdown 语法，也不会决定你的产品是否允许外链。它只是在 HTML 进入 DOM 前删除不允许的元素、属性和危险内容。项目如需保留 SVG、表格属性或代码高亮 class，应逐项配置允许列表，不能为了让样式“看起来正常”而整体放开。

如果应用需要 SSR，浏览器版 DOMPurify 不能直接在 Node 环境里假定存在 `window`。可选方式是使用受支持的服务端 DOM 实现，或在客户端挂载后清理；具体依赖需检查当前版本和项目部署方式。服务端与客户端的输出策略必须一致。

## 4. URL 策略不能只靠标签清理

链接和图片至少要考虑：

- 允许 `https:` 和必要时 `http:`。
- 是否允许站内相对地址。
- 是否允许 `mailto:`。
- 是否禁止 `javascript:`、`vbscript:`、`file:`。
- 是否限制远程图片域名，防止跟踪像素或内网探测。
- 外链是否设置 `rel="noopener noreferrer"`。

markdown-it 自带链接校验可以阻止部分危险协议，但项目仍应按当前版本检查 `validateLink`，并通过 DOMPurify 或专用 URL policy 做第二层约束。对于外部图片，建议使用图片代理或明确域名白名单，不要无条件加载任意远程 URL。

## 5. 创建一个 Vue 3 渲染组件

```vue
<script setup>
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { md } from '@/markdown/createMarkdown'

const props = defineProps({
  source: { type: String, default: '' }
})

const safeHtml = computed(() => {
  const html = md.render(props.source || '')
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }
  })
})
</script>

<template>
  <article class="markdown-content" v-html="safeHtml" />
</template>
```

组件的职责很小：接收原文，调用共享解析器，清理结果，交给 Vue 显示。它不发请求、不保存文章，也不做业务权限判断。样式可以放到独立 CSS 文件，避免 `scoped` 样式无法穿透解析器动态生成的内部标签。

比如 Vue scoped 样式需要使用 `:deep()`：

```css
.markdown-content :deep(h2) {
  margin-block: 1.5em 0.6em;
}

.markdown-content :deep(pre) {
  overflow: auto;
  max-width: 100%;
}
```

## 6. 为什么 computed 足以应付静态文章，不足以应付长流

对于文章详情，输入通常变化少，`computed` 可以缓存结果。AI 流式回复每几毫秒改变一次字符串时，整段解析和清理会反复执行，可能让滚动和输入卡顿。流式优化放在后面的专门文章中：按帧或时间窗口合并更新、限制单次渲染长度、只替换当前 assistant 消息，并处理未闭合语法。

不要为了性能先把 sanitizer 删除。先测量解析、清理、高亮、图表渲染各自耗时，再决定是否缓存或节流。

## 7. 允许原始 HTML 时的额外责任

只有确实需要保留 HTML 的内容类型才考虑 `html: true`，并且要：

1. 清楚定义哪些标签、属性和协议允许。
2. 使用维护活跃的 sanitizer，并固定版本。
3. 对 SVG、iframe、style、事件属性采取默认拒绝策略。
4. 在真实浏览器环境测试恶意样例和链接变体。
5. 对解析器插件输出执行同样的安全流程。
6. 避免同一内容在预览、后台、公开页采用不同的清理配置。

文章渲染区也要隔离 CSS。用户可通过 Markdown 创建标题、表格和代码块，不应让这些内容覆盖应用导航、按钮或弹窗的全局样式。

## 8. 安全测试样本

至少准备以下测试输入并确认不会执行脚本：

```markdown
<img src=x onerror=alert(1)>

[危险链接](javascript:alert(1))

<svg onload=alert(1)></svg>
```

检查最终 HTML、DOM 属性和浏览器控制台。测试时不要只搜索字符串 `script`，因为事件属性、协议混淆、SVG 和编码形式都可能绕过简单字符串检查。

## 本篇验收清单

- 能说明普通模板插值和 `v-html` 的区别。
- markdown-it 默认关闭原始 HTML。
- 每条不可信 Markdown 都经过同一清理流程。
- 链接协议、外链属性和远程图片策略有明确约束。
- Vue 样式只作用于渲染区域，不污染全局工作台。
- SSR 场景不会在服务端访问不存在的浏览器对象。
- 恶意 HTML 和 URL 样本经测试不会执行脚本。

## 官方资料

- [Vue：v-html](https://vuejs.org/api/built-in-directives.html#v-html)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [markdown-it 安全说明](https://github.com/markdown-it/markdown-it#security)

## 系列导航

[上一篇：markdown-it 核心 API 与插件机制](/articles/markdown-it-core-api-plugin-development) · [下一篇：代码块、语法高亮与复制交互](/articles/markdown-it-code-highlight-highlightjs-shiki)
