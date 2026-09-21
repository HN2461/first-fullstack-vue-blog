<template>
  <div class="media-docx-preview">
    <div
      ref="containerRef"
      class="media-docx-preview__content"
      :class="{ 'is-occluded': loading || errorMessage }"
    />
    <div v-if="loading" class="media-docx-preview__state">
      <a-spin tip="正在加载 Word 文档" />
    </div>
    <div v-else-if="errorMessage" class="media-docx-preview__state media-docx-preview__state--error">
      <strong>Word 文档暂时无法预览</strong>
      <p>{{ errorMessage }}</p>
      <a-button size="small" @click="renderDocument">重新加载</a-button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    default: ''
  }
})

const containerRef = ref(null)
const loading = ref(false)
const errorMessage = ref('')
let requestVersion = 0
let abortController = null

watch(() => [props.open, props.url], ([open]) => {
  if (open) {
    renderDocument()
  } else {
    cancelRender()
  }
}, { immediate: true })

async function renderDocument() {
  const currentVersion = ++requestVersion
  abortController?.abort()
  abortController = new AbortController()
  loading.value = true
  errorMessage.value = ''

  await nextTick()
  if (containerRef.value) containerRef.value.innerHTML = ''

  if (!props.url) {
    errorMessage.value = '没有可读取的 Word 文件地址'
    loading.value = false
    return
  }

  try {
    const response = await fetch(props.url, {
      credentials: 'include',
      signal: abortController.signal
    })
    if (!response.ok) throw new Error(`文件请求失败（HTTP ${response.status}）`)

    const buffer = await response.arrayBuffer()
    const { renderAsync } = await import('docx-preview')
    if (currentVersion !== requestVersion || !containerRef.value) return

    await renderAsync(buffer, containerRef.value, undefined, {
      className: 'docx',
      inWrapper: true,
      ignoreWidth: true,
      ignoreHeight: true,
      breakPages: false,
      useBase64URL: true
    })
  } catch (error) {
    if (error?.name !== 'AbortError' && currentVersion === requestVersion) {
      errorMessage.value = error?.message || 'Word 文档渲染失败'
    }
  } finally {
    if (currentVersion === requestVersion) loading.value = false
  }
}

function cancelRender() {
  requestVersion += 1
  abortController?.abort()
  abortController = null
  loading.value = false
  errorMessage.value = ''
  if (containerRef.value) containerRef.value.innerHTML = ''
}

onBeforeUnmount(cancelRender)
</script>

<style scoped>
.media-docx-preview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: var(--console-surface);
}

.media-docx-preview__content {
  min-height: 100%;
  padding: 24px 28px 40px;
}

.media-docx-preview__content.is-occluded {
  visibility: hidden;
}

.media-docx-preview__content :deep(.docx-wrapper) {
  min-height: 100%;
  padding: 0;
  background: transparent;
}

.media-docx-preview__content :deep(.docx) {
  box-sizing: border-box;
  width: min(920px, 100%) !important;
  min-height: 100%;
  margin: 0 auto;
  padding: 28px 34px !important;
  background: var(--console-surface) !important;
  color: var(--console-text);
  box-shadow: none !important;
}

.media-docx-preview__content :deep(img) {
  max-width: 100% !important;
  height: auto !important;
}

.media-docx-preview__content :deep(table) {
  max-width: 100% !important;
  table-layout: auto !important;
}

.media-docx-preview__content :deep(td),
.media-docx-preview__content :deep(th) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.media-docx-preview__state {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  align-content: center;
  place-items: center;
  gap: 10px;
  padding: 32px;
  color: var(--console-text-secondary);
  text-align: center;
}

.media-docx-preview__state strong {
  color: var(--console-text);
}

.media-docx-preview__state p {
  max-width: 460px;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .media-docx-preview__content {
    padding: 16px 12px 28px;
  }

  .media-docx-preview__content :deep(.docx) {
    padding: 20px 18px !important;
  }
}
</style>
