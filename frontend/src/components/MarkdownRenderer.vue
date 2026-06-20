<template>
  <div
    ref="rendererRef"
    class="markdown-renderer"
    :class="{ 'is-code-wrapped': codeWrap }"
  >
    <div class="markdown-body" v-html="renderedContent"></div>
  </div>
</template>

<script setup>
import 'highlight.js/styles/github-dark.css'
import { computed, nextTick, onMounted, onUpdated, ref } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  assetBase: {
    type: String,
    default: ''
  },
  codeWrap: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['imageClick'])

const rendererRef = ref(null)
let mermaidReady = false
let mermaidInstance = null

const renderedContent = computed(() => renderMarkdown(props.content, {
  assetBase: props.assetBase
}))

const copyIconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
const checkIconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
const errorIconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'

function svgToDataUrl(svg) {
  try {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  } catch {
    return ''
  }
}

async function ensureMermaidInitialized() {
  if (mermaidReady) {
    return mermaidInstance
  }

  const module = await import('mermaid')
  mermaidInstance = module.default
  mermaidInstance.initialize({
    startOnLoad: false,
    securityLevel: 'antiscript',
    theme: 'default'
  })
  mermaidReady = true
  return mermaidInstance
}

function resetCopyButton(button) {
  button.innerHTML = copyIconSvg
  button.classList.remove('success', 'error')
  button.title = '复制代码'
  button.setAttribute('aria-label', '复制代码')
}

function showCopyButtonState(button, state) {
  button.innerHTML = state === 'success' ? checkIconSvg : errorIconSvg
  button.classList.add(state)
  button.title = state === 'success' ? '复制成功' : '复制失败'
  button.setAttribute('aria-label', button.title)

  window.setTimeout(() => resetCopyButton(button), 1800)
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  }
}

function createCopyButton() {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'code-copy-btn'
  resetCopyButton(button)
  return button
}

function bindCopyButton(button, getText) {
  if (button.dataset.copyBound) {
    return
  }

  button.dataset.copyBound = 'true'
  button.addEventListener('click', async () => {
    const copied = await copyText(getText())
    showCopyButtonState(button, copied ? 'success' : 'error')
  })
}

function addCopyButtons() {
  const root = rendererRef.value
  if (!root) {
    return
  }

  root.querySelectorAll('.code-block').forEach((block) => {
    const actions = block.querySelector('.code-block__actions')
    const code = block.querySelector('.code-block__code')

    if (!actions || !code || actions.querySelector('.code-copy-btn')) {
      return
    }

    const button = createCopyButton()
    actions.prepend(button)
    bindCopyButton(button, () => code.textContent || '')
  })
}

function updateCodeToggle(block) {
  const toggle = block.querySelector('.code-block__toggle')
  if (!toggle) {
    return
  }

  const expanded = !block.classList.contains('is-collapsed')
  toggle.innerHTML = expanded
    ? '<span class="code-block__toggle-label">收起</span><span class="code-block__toggle-icon" aria-hidden="true"></span>'
    : '<span class="code-block__toggle-label">展开</span><span class="code-block__toggle-icon" aria-hidden="true"></span>'
  toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false')
}

function addCodeBlockToggles() {
  const root = rendererRef.value
  if (!root) {
    return
  }

  root.querySelectorAll('.code-block.is-collapsible').forEach((block) => {
    updateCodeToggle(block)
    const toggle = block.querySelector('.code-block__toggle')

    if (!toggle || toggle.dataset.toggleBound) {
      return
    }

    toggle.dataset.toggleBound = 'true'
    toggle.addEventListener('click', () => {
      block.classList.toggle('is-collapsed')
      updateCodeToggle(block)
    })
  })
}

function addImageClickHandlers() {
  const root = rendererRef.value
  if (!root) {
    return
  }

  root.querySelectorAll('.markdown-body img').forEach((image) => {
    if (image.dataset.lightboxBound) {
      return
    }

    image.dataset.lightboxBound = 'true'
    image.style.cursor = 'zoom-in'
    image.addEventListener('click', () => emit('imageClick', image.src, image.alt))
  })
}

function addMermaidClickHandlers() {
  const root = rendererRef.value
  if (!root) {
    return
  }

  root.querySelectorAll('.mermaid-diagram').forEach((diagram, index) => {
    const svg = diagram.querySelector('svg')
    if (!svg || svg.dataset.lightboxBound) {
      return
    }

    const previewSrc = svgToDataUrl(svg.outerHTML)
    if (!previewSrc) {
      return
    }

    svg.dataset.lightboxBound = 'true'
    svg.style.cursor = 'zoom-in'
    svg.setAttribute('role', 'button')
    svg.setAttribute('tabindex', '0')
    svg.setAttribute('aria-label', '点击放大查看图表')

    const openPreview = () => emit('imageClick', previewSrc, `Mermaid 图表 ${index + 1}`)
    svg.addEventListener('click', openPreview)
    svg.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openPreview()
      }
    })
  })
}

async function renderMermaidDiagrams() {
  const root = rendererRef.value
  const diagrams = root?.querySelectorAll('.mermaid-diagram')
  if (!root || !diagrams?.length) {
    return
  }

  const mermaid = await ensureMermaidInitialized()
  diagrams.forEach((diagram) => diagram.classList.remove('is-rendered', 'is-error'))

  try {
    await mermaid.run({
      nodes: root.querySelectorAll('.mermaid')
    })
    diagrams.forEach((diagram) => diagram.classList.add('is-rendered'))
  } catch (error) {
    console.error('Mermaid 图表渲染失败:', error)
    diagrams.forEach((diagram) => diagram.classList.add('is-error'))
  }
}

async function setupInteractions() {
  await nextTick()
  await renderMermaidDiagrams()
  addCopyButtons()
  addCodeBlockToggles()
  addImageClickHandlers()
  addMermaidClickHandlers()
}

onMounted(setupInteractions)
onUpdated(setupInteractions)
</script>

<style scoped>
.markdown-renderer {
  width: 100%;
}

.markdown-body {
  width: 100%;
  max-width: none;
  color: var(--text-primary);
  line-height: 1.85;
  font-size: 1em;
  --code-font-size: 0.92em;
  --code-line-height: 1.7;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 42px;
  margin-bottom: 14px;
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1.32;
  scroll-margin-top: 92px;
}

.markdown-body :deep(h1:first-child),
.markdown-body :deep(h2:first-child) {
  margin-top: 0;
}

.markdown-body :deep(h1) {
  padding-bottom: 0.42em;
  border-bottom: 1px solid var(--border-color);
  font-size: 2.1em;
}

.markdown-body :deep(h2) {
  padding-bottom: 0.38em;
  border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
  font-size: 1.55em;
}

.markdown-body :deep(h3) {
  font-size: 1.28em;
}

.markdown-body :deep(p) {
  margin: 0 0 18px;
  overflow-wrap: anywhere;
}

.markdown-body :deep(a) {
  color: var(--primary-color);
  text-decoration-line: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.16em;
}

.markdown-body :deep(a:hover) {
  text-decoration-thickness: 0.12em;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 18px;
  padding-left: 2em;
}

.markdown-body :deep(li) {
  margin-bottom: 6px;
  line-height: 1.8;
}

.markdown-body :deep(blockquote) {
  margin: 24px 0;
  padding: 14px 16px;
  color: var(--text-secondary);
  border-left: 2px solid var(--primary-color);
  border-radius: 8px;
  background: color-mix(in srgb, var(--primary-color) 6%, transparent);
}

.markdown-body :deep(.code-block) {
  margin: 24px 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0) 56px),
    #1e1e1e;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14);
}

.markdown-body :deep(.code-block__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.markdown-body :deep(.code-block__meta) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.markdown-body :deep(.code-block__language) {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(120, 163, 255, 0.16);
  font-size: 0.74em;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.markdown-body :deep(.code-block__line-count) {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.78em;
  font-variant-numeric: tabular-nums;
}

.markdown-body :deep(.code-block__actions) {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.markdown-body :deep(.code-block__content) {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  overflow: hidden;
  font-size: var(--code-font-size);
  line-height: var(--code-line-height);
}

.markdown-body :deep(.code-block.is-collapsible.is-collapsed .code-block__content) {
  max-height: calc(var(--code-visible-lines) * var(--code-line-height) * 1em + 28px);
}

.markdown-body :deep(.code-block.is-collapsible.is-collapsed .code-block__content::after) {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 64px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(30, 30, 30, 0), rgba(30, 30, 30, 0.94) 86%);
}

.markdown-body :deep(.code-block__collapse) {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: 6px 0 7px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(30, 30, 30, 0), rgba(30, 30, 30, 0.86) 55%, rgba(30, 30, 30, 0.98));
}

.markdown-body :deep(.code-block__gutter) {
  min-width: 3.6em;
  padding: 14px 12px 14px 14px;
  color: rgba(255, 255, 255, 0.34);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: pre;
  user-select: none;
}

.markdown-body :deep(.code-block__viewport) {
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.markdown-body :deep(.code-block__pre) {
  position: static;
  min-width: 100%;
  margin: 0;
  padding: 14px 16px;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.markdown-body :deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
}

.markdown-body :deep(pre code),
.markdown-body :deep(.code-block__code) {
  display: block;
  min-width: max-content;
  padding: 0;
  color: #d4d4d4;
  background: none;
  white-space: pre;
}

.markdown-renderer.is-code-wrapped .markdown-body :deep(.code-block__content) {
  grid-template-columns: minmax(0, 1fr);
}

.markdown-renderer.is-code-wrapped .markdown-body :deep(.code-block__gutter) {
  display: none;
}

.markdown-renderer.is-code-wrapped .markdown-body :deep(.code-block__viewport) {
  overflow-x: hidden;
}

.markdown-renderer.is-code-wrapped .markdown-body :deep(.code-block__pre),
.markdown-renderer.is-code-wrapped .markdown-body :deep(pre code),
.markdown-renderer.is-code-wrapped .markdown-body :deep(.code-block__code) {
  min-width: 0;
  overflow-x: hidden;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.markdown-body :deep(:not(pre) > code) {
  padding: 2px 6px;
  border-radius: 6px;
  color: var(--primary-color);
  background: var(--bg-muted);
}

.markdown-body :deep(.code-copy-btn),
.markdown-body :deep(.code-block__toggle) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s;
}

.markdown-body :deep(.code-block__actions .code-copy-btn) {
  width: 32px;
  padding: 0;
}

.markdown-body :deep(.code-copy-btn:hover),
.markdown-body :deep(.code-block__toggle:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.markdown-body :deep(.code-copy-btn.success) {
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.38);
  background: rgba(74, 222, 128, 0.14);
}

.markdown-body :deep(.code-copy-btn.error) {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.38);
  background: rgba(248, 113, 113, 0.14);
}

.markdown-body :deep(.code-block__toggle) {
  gap: 5px;
  min-width: 72px;
  padding: 0 4px;
  border: 0;
  color: rgba(255, 255, 255, 0.72);
  background: transparent;
  box-shadow: none;
  pointer-events: auto;
  font-size: 0.85em;
  font-weight: 600;
}

.markdown-body :deep(.code-block__toggle-icon) {
  position: relative;
  width: 8px;
  height: 8px;
  opacity: 0.72;
}

.markdown-body :deep(.code-block__toggle-icon)::before {
  content: '';
  position: absolute;
  inset: 0;
  width: 6px;
  height: 6px;
  margin: auto;
  border-right: 1.6px solid currentColor;
  border-bottom: 1.6px solid currentColor;
  transform: rotate(-135deg) translate(1px, 1px);
}

.markdown-body :deep(.code-block.is-collapsed .code-block__toggle-icon)::before {
  transform: rotate(45deg) translate(-1px, -1px);
}

.markdown-body :deep(table) {
  display: block;
  width: 100%;
  margin: 18px 0;
  overflow: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  border-collapse: collapse;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
}

.markdown-body :deep(table th) {
  background: var(--bg-muted);
  font-weight: 600;
}

.markdown-body :deep(table tr:nth-child(even)) {
  background: var(--bg-secondary);
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 18px 0;
  border: 1px solid color-mix(in srgb, var(--primary-color) 14%, transparent);
  border-radius: 8px;
  transition: transform 0.2s;
}

.markdown-body :deep(video),
.markdown-body :deep(iframe) {
  max-width: 100%;
}

.markdown-body :deep(video) {
  height: auto;
}

.markdown-body :deep(iframe) {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.markdown-body :deep(img:hover) {
  transform: scale(1.01);
}

.markdown-body :deep(.mermaid-diagram) {
  margin: 24px 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--primary-color) 14%, transparent);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98)),
    var(--bg-elevated);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

.markdown-body :deep(.mermaid-diagram__canvas) {
  padding: 18px 16px;
  overflow-x: auto;
}

.markdown-body :deep(.mermaid-diagram .mermaid) {
  min-width: fit-content;
  text-align: center;
}

.markdown-body :deep(.mermaid-diagram svg) {
  max-width: 100%;
  height: auto;
  transition: transform 0.2s ease;
}

.markdown-body :deep(.mermaid-diagram__error),
.markdown-body :deep(.mermaid-diagram__fallback) {
  display: none;
}

.markdown-body :deep(.mermaid-diagram.is-error .mermaid-diagram__error),
.markdown-body :deep(.mermaid-diagram.is-error .mermaid-diagram__fallback) {
  display: block;
}

.markdown-body :deep(.mermaid-diagram.is-error .mermaid) {
  display: none;
}

.markdown-body :deep(hr) {
  height: 1px;
  margin: 36px 0;
  border: 0;
  background: var(--border-color);
}

.markdown-body :deep(input[type="checkbox"]) {
  margin-right: 8px;
}

.markdown-body :deep(mark) {
  padding: 2px 4px;
  border-radius: 2px;
  background: #fff3cd;
}

@media (max-width: 640px) {
  .markdown-body :deep(.code-block__header) {
    flex-wrap: wrap;
  }

  .markdown-body :deep(.code-block__actions) {
    width: 100%;
    justify-content: flex-end;
  }

  .markdown-body :deep(.code-block__gutter) {
    min-width: 3.1em;
    padding-right: 10px;
    padding-left: 10px;
  }
}
</style>
