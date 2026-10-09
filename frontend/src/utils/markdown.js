import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import hljs from 'highlight.js/lib/common'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import dos from 'highlight.js/lib/languages/dos'
import http from 'highlight.js/lib/languages/http'
import nginx from 'highlight.js/lib/languages/nginx'
import properties from 'highlight.js/lib/languages/properties'
import powershell from 'highlight.js/lib/languages/powershell'
import {
  CODE_BLOCK_COLLAPSE_BUFFER_LINES,
  buildCodeLineNumbers,
  CODE_BLOCK_COLLAPSE_LINES,
  countCodeLines,
  getCodeLanguageLabel,
  normalizeCodeLanguage
} from './markdownCodeBlocks'
import markdownContainers from './markdownContainers'

hljs.registerLanguage('powershell', powershell)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('dos', dos)
hljs.registerLanguage('http', http)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('properties', properties)
hljs.registerAliases(['ps1', 'pwsh'], { languageName: 'powershell' })

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

md.use(markdownContainers)

const escapeHtml = (value) => md.utils.escapeHtml(String(value ?? ''))
const unsafeTagNames = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'link',
  'base',
  'meta',
  'frame',
  'frameset',
  'svg',
  'math'
]
const unsafeTagPattern = unsafeTagNames.join('|')
const dangerousUrlPattern = /^(?:javascript|vbscript|data\s*:\s*text\/html)/i
const unsafeStylePattern = /(?:expression\s*\(|url\s*\(\s*['"]?\s*(?:javascript|vbscript|data\s*:\s*text\/html)|@import|behavior\s*:|-moz-binding\s*:)/i

export const slugifyHeading = (value) => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function createUniqueHeadingSlug(baseSlug, usedSlugs) {
  let slug = baseSlug
  let suffix = 1

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  usedSlugs.add(slug)
  return slug
}

function resolveAssetUrl(src, assetBase = '') {
  const source = String(src || '')
  if (!assetBase || !/^(?![a-z][a-z\d+.-]*:|\/|#)/i.test(source)) {
    return source
  }

  const origin = globalThis.location?.origin || 'http://localhost'
  return new URL(source, `${origin}${assetBase.replace(/\/$/, '')}/`).pathname
}

function highlightVue(code) {
  const sections = []
  let currentPos = 0
  const blockRegex = /<(template|script|style)([^>]*)>([\s\S]*?)<\/\1>/gi
  let match

  while ((match = blockRegex.exec(code)) !== null) {
    const [fullMatch, tagName, attributes, content] = match
    const startPos = match.index

    if (startPos > currentPos) {
      sections.push(escapeHtml(code.slice(currentPos, startPos)))
    }

    const langMatch = attributes.match(/lang=["'](\w+)["']/)
    const language = tagName === 'script'
      ? (langMatch ? langMatch[1] : 'javascript')
      : tagName === 'style'
        ? (langMatch ? langMatch[1] : 'css')
        : 'xml'

    sections.push(hljs.highlight(`<${tagName}${attributes}>`, { language: 'xml', ignoreIllegals: true }).value)
    sections.push(hljs.getLanguage(language)
      ? hljs.highlight(content, { language, ignoreIllegals: true }).value
      : escapeHtml(content))
    sections.push(hljs.highlight(`</${tagName}>`, { language: 'xml', ignoreIllegals: true }).value)

    currentPos = startPos + fullMatch.length
  }

  if (currentPos < code.length) {
    sections.push(escapeHtml(code.slice(currentPos)))
  }

  return sections.length
    ? sections.join('')
    : hljs.highlight(code, { language: 'xml', ignoreIllegals: true }).value
}

function highlightCode(code, language) {
  if (!language) {
    const result = hljs.highlightAuto(code)
    return {
      html: result.value,
      language: result.language || ''
    }
  }

  if (language === 'vue') {
    try {
      return {
        html: highlightVue(code),
        language
      }
    } catch {
      return {
        html: hljs.highlight(code, { language: 'xml', ignoreIllegals: true }).value,
        language: 'xml'
      }
    }
  }

  if (language && hljs.getLanguage(language)) {
    try {
      return {
        html: hljs.highlight(code, { language, ignoreIllegals: true }).value,
        language
      }
    } catch {
      return {
        html: escapeHtml(code),
        language
      }
    }
  }

  return {
    html: escapeHtml(code),
    language
  }
}

function renderCodeBlock(code, info = '') {
  const language = normalizeCodeLanguage(info)
  const lineCount = countCodeLines(code)
  const lineNumbers = buildCodeLineNumbers(lineCount)
  const highlighted = highlightCode(code, language)
  const effectiveLanguage = highlighted.language || language
  const languageClass = effectiveLanguage ? ` language-${escapeHtml(effectiveLanguage)}` : ''
  const languageLabel = escapeHtml(getCodeLanguageLabel(effectiveLanguage || language))
  const isCollapsible = lineCount > CODE_BLOCK_COLLAPSE_LINES
  const collapsibleClasses = isCollapsible ? ' is-collapsible is-collapsed' : ''
  const visibleLines = CODE_BLOCK_COLLAPSE_LINES + CODE_BLOCK_COLLAPSE_BUFFER_LINES
  const toggleButton = isCollapsible
    ? '<span class="code-block__toggle" role="button" tabindex="0" aria-expanded="false">展开</span>'
    : ''

  return `
    <div class="code-block${collapsibleClasses}" data-line-count="${lineCount}" style="--code-visible-lines: ${visibleLines};">
      <div class="code-block__header">
        <div class="code-block__meta">
          <span class="code-block__language">${languageLabel}</span>
          <span class="code-block__line-count">共 ${lineCount} 行</span>
        </div>
        <div class="code-block__actions">${toggleButton}</div>
      </div>
      <div class="code-block__content">
        <div class="code-block__gutter" aria-hidden="true">${lineNumbers}</div>
        <div class="code-block__viewport">
          <pre class="hljs code-block__pre"><code class="code-block__code${languageClass}">${highlighted.html}</code></pre>
        </div>
      </div>
    </div>
  `
}

function renderMermaidBlock(code = '') {
  const source = String(code || '').trim()
  const escapedSource = escapeHtml(source)

  return `
    <figure class="mermaid-diagram">
      <div class="mermaid-diagram__canvas">
        <div class="mermaid">${escapedSource}</div>
      </div>
      <figcaption class="mermaid-diagram__error">图表渲染失败，已回退为源码展示。</figcaption>
      <pre class="hljs mermaid-diagram__fallback"><code>${escapedSource}</code></pre>
    </figure>
  `
}

md.use(anchor, {
  slugify: slugifyHeading,
  permalink: false,
  level: [1, 2, 3, 4, 5, 6]
})

md.renderer.rules.fence = (tokens, index) => {
  const token = tokens[index]
  const language = normalizeCodeLanguage(token.info)

  if (language === 'mermaid') {
    return renderMermaidBlock(token.content)
  }

  return renderCodeBlock(token.content, token.info)
}

md.renderer.rules.code_block = (tokens, index) => renderCodeBlock(tokens[index].content)

// 语雀导出的行内代码偶尔会把颜色标签一起包进反引号，例如
// `` `<font style="color:...">内容</font>` ``。行内代码会按原文转义，
// 因而普通 HTML 清理无法移除这些标签；这里只剥离语雀的 font/u 格式包裹，保留代码文本本身。
md.renderer.rules.code_inline = (tokens, index) => {
  const content = stripYuqueInlineFormatting(tokens[index]?.content)
  return `<code>${escapeHtml(content)}</code>`
}

const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, index, options, env, self) => self.renderToken(tokens, index, options))

md.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const token = tokens[index]
  const targetIndex = token.attrIndex('target')
  const relIndex = token.attrIndex('rel')

  if (targetIndex < 0) {
    token.attrPush(['target', '_blank'])
  } else {
    token.attrs[targetIndex][1] = '_blank'
  }

  if (relIndex < 0) {
    token.attrPush(['rel', 'noopener noreferrer'])
  } else {
    token.attrs[relIndex][1] = 'noopener noreferrer'
  }

  return defaultLinkOpen(tokens, index, options, env, self)
}

const defaultImage = md.renderer.rules.image || ((tokens, index, options, env, self) => self.renderToken(tokens, index, options))

md.renderer.rules.image = (tokens, index, options, env, self) => {
  const token = tokens[index]
  const srcIndex = token.attrIndex('src')

  if (srcIndex >= 0) {
    const source = resolveAssetUrl(token.attrs[srcIndex][1], env.assetBase)
    token.attrs[srcIndex][1] = source

    // 部分 CDN 会按 Referer 防盗链拦截站外图片；空 Referer 在其白名单策略中可正常访问。
    if (/^https?:\/\//i.test(source)) {
      token.attrSet('referrerpolicy', 'no-referrer')
    }
  }

  token.attrSet('loading', 'lazy')
  token.attrSet('decoding', 'async')

  return defaultImage(tokens, index, options, env, self)
}

export function renderMarkdown(content, env = {}) {
  return sanitizeRenderedHtml(md.render(stripEmbeddedTocMarkers(content), env))
}

export function extractTOC(content) {
  const tokens = md.parse(stripEmbeddedTocMarkers(content), {})
  const result = []
  const usedSlugs = new Set()

  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open') {
      return
    }

    const level = Number.parseInt(token.tag.substring(1), 10)
    const nextToken = tokens[index + 1]

    if (nextToken?.type === 'inline') {
      const text = getInlineTokenText(nextToken)
      const baseSlug = slugifyHeading(text)
      result.push({
        level,
        text,
        slug: createUniqueHeadingSlug(baseSlug, usedSlugs)
      })
    }
  })

  return result
}

function getInlineTokenText(token) {
  const children = Array.isArray(token?.children) ? token.children : []
  const text = children
    .filter((child) => ['text', 'code_inline'].includes(child.type))
    .map((child) => child.content)
    .join('')

  return text || String(token?.content || '')
}

export default md

function stripEmbeddedTocMarkers(content = '') {
  return String(content || '').replace(/^\s*(?:\[toc\]|\[\[toc\]\]|@\[toc\]\([^)]*\))\s*$/gim, '')
}

function sanitizeRenderedHtml(html = '') {
  return sanitizeHtmlAttributes(stripUnsafeHtmlTags(html))
}

function stripYuqueInlineFormatting(value = '') {
  const source = String(value || '')
  const hasYuqueFont = /<font\b[^>]*\bstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)[^>]*>/i.test(source)
  const hasYuqueUnderline = /(?:\*\*|__)\s*<u\b[^>]*>[\s\S]*?<\/u>\s*(?:\*\*|__)/i.test(source)

  if (!hasYuqueFont && !hasYuqueUnderline) {
    return source
  }

  return source
    .replace(/<font\b[^>]*\bstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)[^>]*>/gi, '')
    .replace(/<\/font\s*>/gi, '')
    .replace(/<\/?u\s*>/gi, '')
}

function stripUnsafeHtmlTags(html = '') {
  return String(html || '')
    .replace(new RegExp(`<\\s*(${unsafeTagPattern})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi'), '')
    .replace(new RegExp(`<\\s*\\/?\\s*(?:${unsafeTagPattern})\\b[^>]*\\/?>`, 'gi'), '')
}

function sanitizeHtmlAttributes(html = '') {
  return String(html || '').replace(/<([a-z][\w:-]*)(\s[^<>]*?)?>/gi, (match, tagName, rawAttributes = '') => {
    if (!rawAttributes) {
      return match
    }

    const attributes = []
    const attrRegex = /\s+([^\s"'<>/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
    let attrMatch

    while ((attrMatch = attrRegex.exec(rawAttributes)) !== null) {
      const name = String(attrMatch[1] || '').toLowerCase()
      const value = attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? ''
      const hasValue = attrMatch[2] !== undefined

      if (isUnsafeAttribute(name, value)) {
        continue
      }

      attributes.push(hasValue ? ` ${name}="${escapeHtml(value)}"` : ` ${name}`)
    }

    return `<${tagName}${attributes.join('')}>`
  })
}

function isUnsafeAttribute(name, value) {
  if (!name) {
    return true
  }

  if (name.startsWith('on') || ['srcdoc', 'http-equiv'].includes(name)) {
    return true
  }

  if (['href', 'src', 'xlink:href', 'formaction'].includes(name) && dangerousUrlPattern.test(String(value || '').trim())) {
    return true
  }

  if (name === 'style' && unsafeStylePattern.test(String(value || ''))) {
    return true
  }

  return false
}
