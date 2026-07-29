<template>
  <MarkdownRenderer
    v-if="article.contentMode !== 'document'"
    :content="article.contentMarkdown"
    :asset-base="assetBase"
    :code-wrap="codeWrap"
  />

  <section v-else class="document-reader">
    <div class="document-reader__toolbar">
      <a-tag :bordered="false" color="blue">
        {{ article.document?.previewUrl ? 'PDF 阅读版' : 'DOCX 只读' }}
      </a-tag>
      <span>{{ article.document?.originalName || 'Word 文档' }}</span>
      <a
        v-if="article.document?.originalUrl"
        :href="article.document.originalUrl"
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        下载原始 Word
      </a>
    </div>

    <iframe
      v-if="article.document?.previewUrl"
      class="document-reader__pdf"
      :src="article.document.previewUrl"
      :title="`${article.title} PDF 阅读版`"
    />

    <div v-else class="document-reader__docx-shell">
      <div v-if="loading" class="document-reader__state" aria-busy="true">
        <a-spin />
        <span>正在加载 Word 文档...</span>
      </div>
      <a-result
        v-else-if="errorMessage"
        status="warning"
        title="Word 文档暂时无法在页面中显示"
        :sub-title="errorMessage"
      >
        <template #extra>
          <a-button
            v-if="article.document?.originalUrl"
            type="primary"
            :href="article.document.originalUrl"
            target="_blank"
          >
            打开原始文档
          </a-button>
        </template>
      </a-result>
      <div v-show="!loading && !errorMessage" ref="docxContainer" class="document-reader__docx" />
    </div>
  </section>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const props = defineProps({
  article: {
    type: Object,
    required: true
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

const docxContainer = ref(null)
const loading = ref(false)
const errorMessage = ref('')
let renderVersion = 0
let abortController = null

async function renderDocx() {
  renderVersion += 1
  const currentVersion = renderVersion
  abortController?.abort()
  abortController = null
  errorMessage.value = ''

  if (props.article.contentMode !== 'document' || props.article.document?.previewUrl) {
    loading.value = false
    return
  }

  const sourceUrl = props.article.document?.originalUrl
  if (!sourceUrl) {
    loading.value = false
    errorMessage.value = '未找到原始 Word 文件'
    return
  }

  loading.value = true
  await nextTick()
  if (docxContainer.value) docxContainer.value.innerHTML = ''
  abortController = new AbortController()

  try {
    const response = await fetch(sourceUrl, { signal: abortController.signal })
    if (!response.ok) throw new Error(`文档请求失败（HTTP ${response.status}）`)
    const buffer = await response.arrayBuffer()
    const { renderAsync } = await import('docx-preview')
    if (currentVersion !== renderVersion || !docxContainer.value) return
    await renderAsync(buffer, docxContainer.value, undefined, {
      className: 'docx',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: true,
      useBase64URL: true
    })
  } catch (error) {
    if (error.name !== 'AbortError') {
      errorMessage.value = error.message || 'Word 文档渲染失败'
    }
  } finally {
    if (currentVersion === renderVersion) loading.value = false
  }
}

watch(() => [
  props.article.contentMode,
  props.article.document?.originalUrl,
  props.article.document?.previewUrl
], renderDocx, { immediate: true })

onBeforeUnmount(() => {
  renderVersion += 1
  abortController?.abort()
})
</script>

<style scoped>
.document-reader {
  width: 100%;
  min-width: 0;
  color: var(--text-primary);
}

.document-reader__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  min-height: 42px;
  margin-bottom: 12px;
  padding: 7px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  font-size: 13px;
}

.document-reader__toolbar span {
  flex: 1 1 200px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-reader__toolbar a {
  color: var(--primary-color);
  white-space: nowrap;
}

.document-reader__pdf {
  display: block;
  width: 100%;
  height: min(78vh, 980px);
  min-height: 620px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: #fff;
}

.document-reader__docx-shell {
  min-height: 520px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  background: #d8dce2;
}

.document-reader__state {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  color: var(--text-secondary);
}

.document-reader__docx {
  width: 100%;
  max-height: 82vh;
  overflow: auto;
}

.document-reader__docx :deep(.docx-wrapper) {
  min-height: 100%;
  padding: 20px 12px;
  background: #d8dce2;
}

.document-reader__docx :deep(.docx-wrapper > section.docx) {
  margin: 0 auto 16px;
  box-shadow: 0 1px 5px rgb(0 0 0 / 18%);
}

@media (max-width: 720px) {
  .document-reader__toolbar {
    align-items: flex-start;
  }

  .document-reader__pdf {
    height: 72vh;
    min-height: 480px;
  }

  .document-reader__docx-shell {
    min-height: 420px;
  }

  .document-reader__docx {
    max-height: 74vh;
  }

  .document-reader__docx :deep(.docx-wrapper) {
    padding: 10px 0;
  }
}
</style>
