<template>
  <section class="article-import-page">
    <BlogTable
      ref="tableRef"
      :columns="columns"
      :api-fn="loadPreviewRows"
      :auto-load="true"
      :params="tableParams"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
      row-key="key"
      :row-selection="rowSelection"
      :scroll="{ x: 1180 }"
      :show-column-setting="true"
      height="100%"
      striped
      @selection-change="handleSelectionChange"
    >
      <template #toolbar>
        <a-upload
          accept=".md,.markdown,text/markdown,text/plain"
          :multiple="true"
          :show-upload-list="false"
          :before-upload="handleBeforeUpload"
          :disabled="previewLoading || commitLoading"
        >
          <a-button type="primary" :loading="previewLoading">
            <template #icon><UploadOutlined /></template>
            上传 Markdown
          </a-button>
        </a-upload>
        <a-button :loading="templateLoading" @click="handleDownloadTemplate">
          <template #icon><DownloadOutlined /></template>
          导出模板
        </a-button>
        <a-button
          :disabled="selectedImportItems.length === 0"
          :loading="commitLoading"
          @click="handleCommit"
        >
          <template #icon><ImportOutlined /></template>
          确认导入 {{ selectedImportItems.length }} 篇
        </a-button>
        <a-button :disabled="!previewRows.length || previewLoading || commitLoading" @click="clearPreview">
          <template #icon><ClearOutlined /></template>
          清空
        </a-button>
        <a-tag :bordered="false">共 {{ previewRows.length }}</a-tag>
        <a-tag color="green" :bordered="false">可导入 {{ summary.readyCount }}</a-tag>
        <a-tag color="orange" :bordered="false">需确认 {{ summary.warningCount }}</a-tag>
        <a-tag color="red" :bordered="false">重复 {{ summary.duplicateCount }}</a-tag>
        <a-tag color="red" :bordered="false">错误 {{ summary.errorCount }}</a-tag>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <div class="title-cell">
            <strong>{{ record.title || '未识别标题' }}</strong>
            <span>{{ record.fileName }}</span>
          </div>
        </template>

        <template v-else-if="column.key === 'slug'">
          <code class="slug-code">{{ record.slug || '-' }}</code>
        </template>

        <template v-else-if="column.key === 'category'">
          <a-tag v-if="record.categoryName" :color="record.categoryMatched ? 'blue' : 'orange'" :bordered="false">
            {{ record.categoryName }}
          </a-tag>
          <span v-else class="muted-text">未设置</span>
        </template>

        <template v-else-if="column.key === 'tags'">
          <div class="tag-cell">
            <a-tag v-for="tag in record.tagNames" :key="tag" :bordered="false">
              {{ tag }}
            </a-tag>
            <span v-if="!record.tagNames?.length" class="muted-text">未设置</span>
          </div>
        </template>

        <template v-else-if="column.key === 'importStatus'">
          <a-tag :color="getStatusColor(record.importStatus)" :bordered="false">
            {{ record.importStatusLabel }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'messages'">
          <div class="message-cell">
            <span v-if="!record.errors?.length && !record.warnings?.length" class="muted-text">无</span>
            <span v-for="error in record.errors" :key="`e:${error}`" class="message-error">{{ error }}</span>
            <span v-for="warning in record.warnings" :key="`w:${warning}`" class="message-warning">{{ warning }}</span>
          </div>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-button type="link" size="small" @click="openPreview(record)">预览</a-button>
          </a-space>
        </template>
      </template>
    </BlogTable>

    <a-modal
      v-model:open="previewVisible"
      title="文章预览"
      width="1080px"
      :footer="null"
      class="article-preview-modal"
      destroy-on-close
    >
      <div v-if="currentPreview" class="preview-layout">
        <aside class="preview-meta">
          <div class="preview-meta-item">
            <span>标题</span>
            <strong>{{ currentPreview.title || '-' }}</strong>
          </div>
          <div class="preview-meta-item">
            <span>文件</span>
            <strong>{{ currentPreview.fileName }}</strong>
          </div>
          <div class="preview-meta-item">
            <span>Slug</span>
            <code>{{ currentPreview.slug || '-' }}</code>
          </div>
          <div class="preview-meta-item">
            <span>摘要</span>
            <p>{{ currentPreview.summary || '-' }}</p>
          </div>
          <div class="preview-meta-item">
            <span>分类</span>
            <strong>{{ currentPreview.categoryName || '未设置' }}</strong>
          </div>
          <div class="preview-meta-item">
            <span>标签</span>
            <p>{{ currentPreview.tagNames?.join('、') || '未设置' }}</p>
          </div>
          <div class="preview-meta-item">
            <span>识别结果</span>
            <p>{{ previewMessageText }}</p>
          </div>
        </aside>
        <main class="preview-content">
          <MarkdownRenderer :content="currentPreview.contentMarkdown" code-wrap />
        </main>
      </div>
    </a-modal>

    <a-modal
      v-model:open="resultVisible"
      title="导入结果"
      width="720px"
      :footer="null"
      class="import-result-modal"
    >
      <div v-if="importResult" class="result-content">
        <a-alert
          type="success"
          show-icon
          :message="`成功 ${importResult.successCount} 篇，跳过 ${importResult.skippedCount} 篇，失败 ${importResult.failedCount} 篇`"
        />
        <div class="result-list">
          <div v-for="item in importResult.items" :key="`${item.fileName}:${item.slug}`" class="result-item">
            <a-tag :color="getResultColor(item.status)" :bordered="false">{{ getResultLabel(item.status) }}</a-tag>
            <strong>{{ item.title || item.fileName }}</strong>
            <span>{{ item.reason || item.slug }}</span>
          </div>
        </div>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  ClearOutlined,
  DownloadOutlined,
  ImportOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import BlogTable from '@/components/BlogTable.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import {
  commitArticleImport,
  downloadArticleImportTemplate,
  previewArticleImport
} from '@/services/admin'

const tableRef = ref(null)
const previewRows = ref([])
const selectedRowKeys = ref([])
const parsingBatch = ref(false)
const templateLoading = ref(false)
const previewLoading = ref(false)
const commitLoading = ref(false)
const previewVisible = ref(false)
const currentPreview = ref(null)
const resultVisible = ref(false)
const importResult = ref(null)
const tableVersion = ref(0)

const tableParams = computed(() => ({
  version: tableVersion.value
}))

const summary = computed(() => ({
  readyCount: previewRows.value.filter((item) => item.importStatus === 'ready').length,
  warningCount: previewRows.value.filter((item) => item.importStatus === 'warning').length,
  duplicateCount: previewRows.value.filter((item) => item.importStatus === 'duplicate').length,
  errorCount: previewRows.value.filter((item) => item.importStatus === 'error').length
}))

const selectedImportItems = computed(() => {
  const selectedKeys = new Set(selectedRowKeys.value)
  return previewRows.value.filter((item) => item.canImport && selectedKeys.has(item.key))
})

const previewMessageText = computed(() => {
  const item = currentPreview.value
  if (!item) return ''
  const messages = [...(item.errors || []), ...(item.warnings || [])]
  return messages.length ? messages.join('；') : '无'
})

const columns = [
  { title: '标题 / 文件', key: 'title', dataIndex: 'title', width: 260, fixed: 'left' },
  { title: 'Slug', key: 'slug', dataIndex: 'slug', width: 220 },
  { title: '分类', key: 'category', width: 130 },
  { title: '标签', key: 'tags', width: 200 },
  { title: '状态', key: 'importStatus', dataIndex: 'importStatus', width: 110, align: 'center' },
  { title: '识别结果', key: 'messages', width: 260 },
  { title: '操作', key: 'action', width: 100, fixed: 'right', align: 'center' }
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  getCheckboxProps: (record) => ({
    disabled: !record.canImport
  })
}))

function refreshTable() {
  tableVersion.value += 1
}

async function loadPreviewRows(params = {}) {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.max(1, Number(params.pageSize) || 10)
  const start = (page - 1) * pageSize
  return {
    items: previewRows.value.slice(start, start + pageSize),
    total: previewRows.value.length,
    page,
    pageSize
  }
}

function handleSelectionChange(keys) {
  const importableKeys = new Set(previewRows.value.filter((item) => item.canImport).map((item) => item.key))
  selectedRowKeys.value = (keys || []).filter((key) => importableKeys.has(key))
}

async function handleDownloadTemplate() {
  templateLoading.value = true
  try {
    const blob = await downloadArticleImportTemplate()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'knowledge-article-ai-template.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success('模板已开始下载')
  } catch (error) {
    message.error(error.message || '模板下载失败')
  } finally {
    templateLoading.value = false
  }
}

async function handleBeforeUpload(_file, fileList) {
  if (parsingBatch.value) {
    return false
  }

  parsingBatch.value = true
  const markdownFiles = fileList.filter((item) => /\.(md|markdown)$/i.test(item.name || ''))
  const invalidCount = fileList.length - markdownFiles.length

  if (invalidCount > 0) {
    message.warning('已忽略非 Markdown 文件')
  }

  if (!markdownFiles.length) {
    parsingBatch.value = false
    return false
  }

  previewLoading.value = true
  try {
    const result = await previewArticleImport(markdownFiles)
    previewRows.value = (result.items || []).map((item) => ({
      ...item,
      key: item.key || `${item.fileName}:${item.slug || item.sourceHash}`
    }))
    selectedRowKeys.value = previewRows.value.filter((item) => item.canImport).map((item) => item.key)
    refreshTable()
    message.success(`已解析 ${previewRows.value.length} 个 Markdown 文件`)
  } catch (error) {
    message.error(error.message || 'Markdown 解析失败')
  } finally {
    previewLoading.value = false
    setTimeout(() => {
      parsingBatch.value = false
    })
  }

  return false
}

function openPreview(record) {
  currentPreview.value = record
  previewVisible.value = true
}

function clearPreview() {
  previewRows.value = []
  selectedRowKeys.value = []
  currentPreview.value = null
  previewVisible.value = false
  importResult.value = null
  resultVisible.value = false
  tableRef.value?.clearSelection?.()
  refreshTable()
}

async function handleCommit() {
  const items = selectedImportItems.value

  if (!items.length) return

  commitLoading.value = true
  try {
    const result = await commitArticleImport({
      items,
      options: {
        duplicateStrategy: 'skip'
      }
    })
    importResult.value = result
    resultVisible.value = true
    if (result.failedCount > 0) {
      const failedReasons = (result.items || [])
        .filter((item) => item.status === 'failed')
        .slice(0, 2)
        .map((item) => `${item.title || item.fileName}：${item.reason || '导入失败'}`)
        .join('；')
      message.error(failedReasons || '部分文章导入失败')
    } else if (result.successCount > 0) {
      message.success(`已导入 ${result.successCount} 篇文章`)
    } else {
      message.warning('没有文章被导入，请查看导入结果')
    }
    const finishedKeys = new Set(
      (result.items || [])
        .filter((item) => item.status === 'success' || item.status === 'skipped')
        .map((item) => `${item.fileName}:${item.slug || item.sourceHash}`)
    )
    previewRows.value = previewRows.value.filter((item) => !finishedKeys.has(`${item.fileName}:${item.slug || item.sourceHash}`))
    selectedRowKeys.value = selectedRowKeys.value.filter((key) => {
      const row = previewRows.value.find((item) => item.key === key)
      return row?.canImport
    })
    refreshTable()
  } catch (error) {
    message.error(error.message || '导入失败')
  } finally {
    commitLoading.value = false
  }
}

function getStatusColor(status) {
  const map = {
    ready: 'green',
    warning: 'orange',
    duplicate: 'red',
    error: 'red'
  }
  return map[status] || 'default'
}

function getResultColor(status) {
  const map = {
    success: 'green',
    skipped: 'orange',
    failed: 'red'
  }
  return map[status] || 'default'
}

function getResultLabel(status) {
  const map = {
    success: '成功',
    skipped: '跳过',
    failed: '失败'
  }
  return map[status] || status
}
</script>

<style scoped>
.article-import-page {
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  max-width: 1400px;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.title-cell strong {
  color: var(--console-text);
  font-size: 13px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-cell span,
.muted-text {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.slug-code,
.preview-meta code {
  color: var(--console-text);
  background: var(--console-surface-muted);
  border: 1px solid var(--console-border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
}

.tag-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.message-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  line-height: 1.4;
}

.message-error {
  color: #cf1322;
}

.message-warning {
  color: #d48806;
}

.preview-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
  max-height: 70vh;
  min-height: 520px;
}

.preview-meta {
  padding: 12px;
  overflow-y: auto;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface-muted);
}

.preview-meta-item + .preview-meta-item {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--console-border);
}

.preview-meta-item span {
  display: block;
  margin-bottom: 4px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.preview-meta-item strong,
.preview-meta-item p {
  margin: 0;
  color: var(--console-text);
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.preview-content {
  min-width: 0;
  padding: 16px 18px;
  overflow-y: auto;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.result-list {
  max-height: 420px;
  overflow-y: auto;
  border: 1px solid var(--console-border);
  border-radius: 8px;
}

.result-item {
  display: grid;
  grid-template-columns: 64px minmax(160px, 1fr) minmax(160px, 1fr);
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--console-border);
}

.result-item:last-child {
  border-bottom: 0;
}

.result-item strong {
  color: var(--console-text);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-item span:last-child {
  color: var(--console-text-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-preview-modal :deep(.ant-modal-body),
.import-result-modal :deep(.ant-modal-body) {
  max-height: 76vh;
  overflow: hidden;
}

@media (max-width: 900px) {
  .preview-layout {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .preview-meta,
  .preview-content {
    max-height: 34vh;
  }
}
</style>
