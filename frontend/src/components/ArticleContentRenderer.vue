<template>
  <MarkdownRenderer
    v-if="article.contentMode !== 'document'"
    :content="article.contentMarkdown"
    :asset-base="assetBase"
    :code-wrap="codeWrap"
  />

  <section v-else class="document-reader">
    <div class="document-reader__toolbar">
      <div class="document-reader__identity">
        <span class="document-reader__file-icon" aria-hidden="true">
          <FileText :size="18" />
        </span>
        <div class="document-reader__file-meta">
          <div class="document-reader__file-heading">
            <strong>Word 文档</strong>
            <a-tag :bordered="false" color="blue">
              {{ article.document?.previewUrl ? 'PDF 阅读版' : 'DOCX 只读' }}
            </a-tag>
          </div>
          <span :title="article.document?.originalName || 'Word 文档'">
            {{ article.document?.originalName || 'Word 文档' }}
          </span>
        </div>
      </div>
      <a-button
        v-if="article.document?.originalUrl"
        class="document-reader__download"
        type="text"
        :href="article.document.originalUrl"
        target="_blank"
        download
      >
        <template #icon><Download :size="16" /></template>
        下载原件
      </a-button>
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
import { Download, FileText } from 'lucide-vue-next'
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
      // docx-preview 只能按显式分页符拆页，长文会形成一个超高的伪纸张。
      // 文档文章采用连续流式布局，由文章页承担唯一滚动，避免内外双滚动。
      ignoreWidth: true,
      ignoreHeight: true,
      breakPages: false,
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
  max-width: 920px;
  min-width: 0;
  margin: 0 auto;
  color: var(--text-primary);
}

.document-reader__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: color-mix(in srgb, var(--bg-elevated) 88%, var(--bg-secondary));
}

.document-reader__identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.document-reader__file-icon {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid color-mix(in srgb, var(--primary-color) 20%, var(--border-color));
  border-radius: 6px;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 8%, var(--bg-elevated));
}

.document-reader__file-meta {
  min-width: 0;
}

.document-reader__file-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.document-reader__file-heading strong {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 20px;
}

.document-reader__file-heading :deep(.ant-tag) {
  margin: 0;
  font-size: 11px;
  line-height: 19px;
}

.document-reader__file-meta > span {
  display: block;
  max-width: min(56vw, 680px);
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-reader__download {
  flex: 0 0 auto;
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
  box-shadow: 0 4px 16px rgb(15 23 42 / 8%);
  background: #fff;
}

.document-reader__docx-shell {
  position: relative;
  min-height: 320px;
  overflow: visible;
  background: #fff;
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
  min-width: 0;
  overflow: visible;
}

.document-reader__docx :deep(.docx-wrapper) {
  display: block;
  min-height: 0;
  padding: 0;
  color: #172033;
  background: #fff;
}

.document-reader__docx :deep(.docx-wrapper > section.docx) {
  box-sizing: border-box;
  width: 100% !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: clamp(40px, 7vw, 72px) !important;
  border: 0;
  box-shadow: none;
  background: #fff;
}

.document-reader__docx :deep(img) {
  max-width: 100% !important;
  height: auto !important;
}

@media (max-width: 720px) {
  .document-reader__toolbar {
    gap: 8px;
    min-height: 58px;
    padding: 8px 10px;
  }

  .document-reader__file-icon {
    width: 32px;
    height: 32px;
  }

  .document-reader__file-heading strong {
    display: none;
  }

  .document-reader__file-meta > span {
    max-width: 52vw;
  }

  .document-reader__download {
    padding-inline: 8px;
  }

  .document-reader__pdf {
    height: 72vh;
    min-height: 480px;
  }

  .document-reader__docx-shell {
    min-height: 240px;
  }

  .document-reader__docx :deep(.docx-wrapper > section.docx) {
    padding: 24px 14px !important;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .document-reader__docx :deep(table) {
    width: 100% !important;
    max-width: 100% !important;
    table-layout: auto !important;
  }

  .document-reader__docx :deep(td),
  .document-reader__docx :deep(th) {
    min-width: 0 !important;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .document-reader__docx :deep(div:has(> img)) {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
  }

  .document-reader__docx :deep(div:has(> img) > img) {
    width: 100% !important;
  }
}
</style>
