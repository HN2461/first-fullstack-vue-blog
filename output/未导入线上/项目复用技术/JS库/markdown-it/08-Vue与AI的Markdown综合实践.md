---
title: 第 8 篇：Vue 与 AI 的 Markdown 综合实践：安全组件、插件装配和上线验收
slug: markdown-it-vue-ai-markdown-complete-project
summary: 将 markdown-it、DOMPurify、代码高亮、Mermaid 和 KaTeX 组合成可维护的 Vue 渲染方案，并从组件边界、测试、主题、性能到上线逐项验收。
tags:
  - markdown-it
  - Vue 3
  - AI 对话
  - 代码高亮
  - Mermaid
  - KaTeX
category: markdown-it
categoryPath:
  - 项目复用技术
  - JS库
  - markdown-it
sortOrder: 90
status: published
---

# 第 8 篇：Vue 与 AI 的 Markdown 综合实践：安全组件、插件装配和上线验收

## 1. 先确定组件边界

最后的页面结构可以很简单：

```vue
<template>
  <MarkdownContent
    :source="message.content"
    :streaming="message.status === 'streaming'"
    :theme="theme"
  />
</template>
```

AI 聊天页面只提供消息内容和状态；`MarkdownContent` 负责显示；解析器工厂负责解析规则；各扩展负责高亮、图表和公式。模型请求、用户鉴权和会话保存属于其它模块。

建议职责如下：

| 模块 | 职责 | 不应做什么 |
| --- | --- | --- |
| ChatPage | 当前会话、发送、停止、错误反馈 | 自己拼接 HTML |
| MessageList | 消息排序、虚拟滚动、自动滚动 | 直接调用模型 |
| MarkdownContent | source 到安全 HTML、挂载后增强 | 访问密钥或保存会话 |
| createMarkdown | 创建并配置 markdown-it | 读取 Vue 页面状态 |
| Mermaid service | 初始化和渲染图表 | 解析全文 Markdown |
| API service | 登录态、SSE 和取消 | 操作消息 DOM |

## 2. 依赖与版本记录

```bash
npm install markdown-it dompurify highlight.js mermaid katex markdown-it-texmath
```

然后检查实际解析出的版本并保存锁文件：

```bash
npm ls markdown-it dompurify highlight.js mermaid katex markdown-it-texmath
```

这几项里 `mermaid`、`katex` 和 `highlight.js` 都有可观的体积成本。正式采用前可按需动态导入，把它们从初始页面拆出去。Markdown 包的核心功能和高级扩展可以分开加载。

## 3. 创建统一解析器工厂

先把 Mermaid 围栏变成经过 HTML 转义的文本容器。这样 markdown-it 输出安全的占位节点，Vue 挂载后再交给 Mermaid；图表源文不会被当成 HTML 解释：

```js
function installMermaidFence(md) {
  const defaultFence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const language = (token.info || '').trim().split(/\s+/)[0].toLowerCase()

    if (language !== 'mermaid') {
      return defaultFence
        ? defaultFence(tokens, index, options, env, self)
        : self.renderToken(tokens, index, options)
    }

    return `<div class="mermaid-block">${md.utils.escapeHtml(token.content)}</div>\n`
  }
}

function installExternalLinkAttributes(md) {
  const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, index, options, env, self) => {
    return self.renderToken(tokens, index, options)
  })

  md.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const href = token.attrGet('href') || ''

    if (/^https?:\/\//i.test(href)) {
      token.attrSet('target', '_blank')
      token.attrSet('rel', 'noopener noreferrer nofollow')
    }

    return defaultLinkOpen(tokens, index, options, env, self)
  }
}
```

然后在一个位置创建并复用解析器。下面的示例可以作为客户端解析器的起点；按实际锁定版本核对插件选项和导入路径：

```js
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import hljs from './highlightLanguages'

export function createMarkdown() {
  const md = new MarkdownIt({
    html: false,
    breaks: false,
    linkify: false,
    typographer: false,
    highlight(code, language) {
      const lang = String(language || '').toLowerCase()
      if (!lang || !hljs.getLanguage(lang)) return ''

      try {
        return hljs.highlight(code, { language: lang }).value
      } catch {
        return ''
      }
    }
  })

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

  installMermaidFence(md)
  installExternalLinkAttributes(md)
  return md
}

export const markdown = createMarkdown()
```

每个扩展应在一个位置安装一次。热更新开发环境中注意避免模块反复执行时重建多个实例或重复追加规则。不要在组件 `setup()` 每次运行时向共享实例重复 `.use()` 插件。

## 4. 渲染与清理的顺序

推荐清楚地保留每个阶段：

```js
import DOMPurify from 'dompurify'
import { markdown } from './createMarkdown'

export function renderMarkdown(source) {
  const rawHtml = markdown.render(String(source || ''))
  const safeHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true }
  })
  return safeHtml
}
```

渲染结果里要保留 `class` 才能使用高亮 CSS。若定制 sanitizer 的 allow-list，不要误删必要 class；同时不要允许 `onerror`、任意 style、iframe 和 SVG 源文。Mermaid 生成的 SVG 另走严格渲染路径，确认 sanitizer 配置不会意外开放用户 SVG。

不要在 sanitize 之后再用字符串拼接添加用户提供的属性，因为这样会绕过清理器。新增 HTML 输出能力时，统一改 Renderer 或 Token 插件，并为输出补安全测试。

## 5. Vue 组件基础版本

```vue
<script setup>
import { computed } from 'vue'
import { renderMarkdown } from '@/markdown/renderMarkdown'

const props = defineProps({
  source: { type: String, default: '' },
  streaming: { type: Boolean, default: false }
})

const html = computed(() => renderMarkdown(props.source))
</script>

<template>
  <article
    class="markdown-content"
    :class="{ 'markdown-content--streaming': streaming }"
    v-html="html"
  />
</template>
```

静态文章和已完成消息可以直接用该模式。流式消息需结合上一篇的节流方案。可在 `streaming` 时暂缓 Mermaid 和 KaTeX 插件，或先让重型块显示源文，减少半截语法导致的反复重绘。

## 6. Mermaid 挂载后处理

Mermaid 需要读取 DOM 节点和异步输出 SVG。基础组件可以在 `onMounted`、`watch(html)` 中等待 Vue 更新后绘图。实际代码还需要：

- 用版本 token 取消过期渲染。
- 组件卸载时使未完成任务失效。
- 处理 `source` 变化和主题变化。
- 避免重复插入按钮或 SVG。
- 失败时回退到 Mermaid 源文。

如果图表是页面核心业务，优先把每个 Mermaid fence 提取为独立子组件。单个 Vue 组件不应既负责 sanitizer、代码复制、滚动、模型请求，又负责图表竞态。

## 7. 主题适配

主题至少包含正文、代码、表格、引用、链接、公式和图表：

```css
.markdown-content {
  color: var(--markdown-text);
  overflow-wrap: anywhere;
}

.markdown-content :deep(a) {
  color: var(--markdown-link);
}

.markdown-content :deep(blockquote) {
  margin-inline: 0;
  padding-inline-start: 1rem;
  border-inline-start: 3px solid var(--markdown-border);
}

.markdown-content :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

.markdown-content :deep(pre) {
  max-width: 100%;
  overflow: auto;
}

.markdown-content :deep(.katex),
.markdown-content :deep(.mermaid-block) {
  color: inherit;
}
```

实际 CSS 还要补充标题、任务列表、图片尺寸、表格边框、引用背景、代码主题和错误提示状态。所有样式都限定在 `.markdown-content`，避免覆盖 Ant Design Vue 工作台。

## 8. 测试不要只看截图

建议至少有三类测试：

### 解析快照测试

对常用 Markdown 样例断言结构，例如标题 ID、链接属性、代码语言 class、表格和公式 Token。快照发生变化时要人工确认，而不是直接更新快照。

### 安全测试

用 `javascript:` URL、事件属性、原始 HTML、SVG、伪造代码块和恶意公式测试最终 DOM。断言可执行属性不存在，危险协议被移除，正常代码文本仍显示。

### 组件和性能测试

验证 `source` 变化会更新，组件卸载后异步 Mermaid 不写旧节点，流式消息在 `done` 后 flush，长文本不会造成明显卡顿。对超大输入设置上限，避免不受控的内存和 CPU 使用。

## 9. 上线前逐项确认

- 依赖版本写入 lockfile，供应链漏洞已检查。
- `html: false`，raw HTML 策略已明确。
- 所有不可信 HTML 进入 DOM 前都过 sanitizer。
- 外链协议、远程图片和外链窗口行为已经定义。
- Mermaid 使用 strict 安全模式，渲染失败可退回源文。
- KaTeX `trust` 关闭，CSS 和字体路径生产可用。
- highlight.js 只注册所需语言，未知语言回退纯文本。
- 流式更新有节流、取消、结束 flush 和错误状态。
- 亮色、暗色、窄屏、长链接、超长代码和宽图表都检查过。
- 解析、高亮、公式和图表所用时间有基本测量。
- 文章详情、AI 聊天和后台预览共用同一安全配置。

## 10. 学习项目分阶段完成

1. 先渲染静态文章，支持标题、列表、链接和代码块。
2. 增加代码高亮和复制按钮。
3. 加入 sanitizer 和恶意输入用例，再开放给不可信内容。
4. 按需加入 Mermaid 图表与 KaTeX 公式。
5. 把渲染组件用于 AI 回复，完成流式状态与取消。
6. 做主题、移动端、长内容和性能验证。

每个阶段都保持可用的提交。这样安装错误、样式问题和安全回归比较容易定位。

## 本篇完成标准

- 能从一段 Markdown 追踪到 Token、HTML、清理结果和 DOM。
- 能区分解析器、sanitizer、代码高亮器、Mermaid 和 KaTeX 的职责。
- 能把组件接入文章页和 AI 消息页而不重复解析器配置。
- 能解释异步图表为什么必须考虑 Vue 生命周期和过期回调。
- 有安全、解析和流式行为测试，而不是只验证页面“不报错”。

## 官方资料

- [markdown-it](https://github.com/markdown-it/markdown-it)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [highlight.js](https://highlightjs.org/)
- [Mermaid](https://mermaid.js.org/)
- [KaTeX](https://katex.org/)

## 系列导航

[上一篇：AI 对话中的流式 Markdown](/articles/markdown-it-ai-streaming-markdown-rendering)
