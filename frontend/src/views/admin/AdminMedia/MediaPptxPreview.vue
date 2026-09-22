<template>
  <div class="media-pptx-preview">
    <div v-if="loading" class="media-pptx-preview__state">
      <a-spin tip="正在读取演示文稿" />
    </div>
    <div v-else-if="errorMessage" class="media-pptx-preview__state media-pptx-preview__state--error">
      <strong>演示文稿暂时无法预览</strong>
      <p>{{ errorMessage }}</p>
      <a-button size="small" @click="loadPresentation">重新加载</a-button>
    </div>
    <div v-else class="media-pptx-preview__slides">
      <article v-for="slide in slides" :key="slide.number" class="media-pptx-preview__slide">
        <header>第 {{ slide.number }} 页</header>
        <p v-for="(line, index) in slide.lines" :key="`${slide.number}-${index}`">{{ line }}</p>
        <span v-if="!slide.lines.length" class="media-pptx-preview__empty">这一页没有可提取的文字</span>
      </article>
      <a-empty v-if="!slides.length" description="没有可展示的幻灯片内容" />
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  url: { type: String, default: '' }
})

const slides = ref([])
const loading = ref(false)
const errorMessage = ref('')
let requestVersion = 0
let abortController = null

watch(() => [props.open, props.url], ([open]) => {
  if (open) loadPresentation()
  else cancelLoad()
}, { immediate: true })

async function loadPresentation() {
  const currentVersion = ++requestVersion
  abortController?.abort()
  abortController = new AbortController()
  loading.value = true
  errorMessage.value = ''
  slides.value = []

  try {
    const response = await fetch(props.url, { credentials: 'include', signal: abortController.signal })
    if (!response.ok) throw new Error(`文件请求失败（HTTP ${response.status}）`)
    const buffer = await response.arrayBuffer()
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(buffer)
    const slideNames = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => Number(a.match(/slide(\d+)/i)?.[1]) - Number(b.match(/slide(\d+)/i)?.[1]))

    const parsedSlides = []
    // 浏览器端只提取文本结构，避免为了还原 PPT 主题和动画引入完整 Office 渲染引擎。
    for (const [index, name] of slideNames.entries()) {
      const xml = await zip.files[name].async('text')
      const document = new DOMParser().parseFromString(xml, 'application/xml')
      const lines = Array.from(document.getElementsByTagNameNS('*', 't'))
        .map((node) => String(node.textContent || '').trim())
        .filter(Boolean)
      parsedSlides.push({ number: index + 1, lines: [...new Set(lines)] })
    }
    if (currentVersion === requestVersion) slides.value = parsedSlides
  } catch (error) {
    if (error?.name !== 'AbortError' && currentVersion === requestVersion) {
      errorMessage.value = error?.message || '演示文稿解析失败，请下载后查看。'
    }
  } finally {
    if (currentVersion === requestVersion) loading.value = false
  }
}

function cancelLoad() {
  requestVersion += 1
  abortController?.abort()
  abortController = null
  loading.value = false
  slides.value = []
}

onBeforeUnmount(cancelLoad)
</script>

<style scoped>
.media-pptx-preview {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: var(--console-surface-muted);
}

.media-pptx-preview__slides {
  display: grid;
  gap: 14px;
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 28px 40px;
}

.media-pptx-preview__slide {
  min-height: 150px;
  padding: 16px 18px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: var(--console-surface);
}

.media-pptx-preview__slide header {
  margin-bottom: 12px;
  color: var(--console-primary-strong);
  font-size: 12px;
  font-weight: 600;
}

.media-pptx-preview__slide p {
  margin: 0 0 7px;
  color: var(--console-text);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.media-pptx-preview__empty {
  color: var(--console-text-tertiary, var(--console-text-secondary));
  font-size: 13px;
}

.media-pptx-preview__state {
  display: grid;
  height: 100%;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 32px;
  color: var(--console-text-secondary);
  text-align: center;
}

.media-pptx-preview__state p {
  max-width: 440px;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}
</style>
