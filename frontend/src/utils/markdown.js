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
  buildCodeLineNumbers,
  CODE_BLOCK_COLLAPSE_LINES,
  countCodeLines,
  getCodeLanguageLabel,
  normalizeCodeLanguage
} from './markdownCodeBlocks'

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
  const toggleButton = isCollapsible
    ? `
      <div class="code-block__collapse">
        <button type="button" class="code-block__toggle" aria-expanded="false">展开</button>
      </div>
    `
    : ''

  return `
    <div class="code-block${collapsibleClasses}" data-line-count="${lineCount}" style="--code-visible-lines: ${CODE_BLOCK_COLLAPSE_LINES};">
      <div class="code-block__header">
        <div class="code-block__meta">
          <span class="code-block__language">${languageLabel}</span>
          <span class="code-block__line-count">共 ${lineCount} 行</span>
        </div>
        <div class="code-block__actions"></div>
      </div>
      <div class="code-block__content">
        <div class="code-block__gutter" aria-hidden="true">${lineNumbers}</div>
        <div class="code-block__viewport">
          <pre class="hljs code-block__pre"><code class="code-block__code${languageClass}">${highlighted.html}</code></pre>
        </div>
        ${toggleButton}
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
    token.attrs[srcIndex][1] = resolveAssetUrl(token.attrs[srcIndex][1], env.assetBase)
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

  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open') {
      return
    }

    const level = Number.parseInt(token.tag.substring(1), 10)
    const nextToken = tokens[index + 1]

    if (nextToken?.type === 'inline') {
      result.push({
        level,
        text: nextToken.content,
        slug: slugifyHeading(nextToken.content)
      })
    }
  })

  return result
}

export default md

function stripEmbeddedTocMarkers(content = '') {
  return String(content || '').replace(/^\s*(?:\[toc\]|\[\[toc\]\]|@\[toc\]\([^)]*\))\s*$/gim, '')
}

function sanitizeRenderedHtml(html = '') {
  return sanitizeHtmlAttributes(stripUnsafeHtmlTags(html))
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
