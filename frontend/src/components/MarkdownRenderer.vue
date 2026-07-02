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
import './MarkdownRenderer.css'
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
  toggle.setAttribute('aria-label', expanded ? '收起代码块' : '展开完整代码块')
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
    const toggleCodeBlock = () => {
      block.classList.toggle('is-collapsed')
      updateCodeToggle(block)
    }

    toggle.addEventListener('click', toggleCodeBlock)
    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggleCodeBlock()
      }
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
