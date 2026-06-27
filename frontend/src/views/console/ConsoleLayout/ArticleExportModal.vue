<template>
  <a-modal
    :open="open"
    title="导出文章 Markdown"
    centered
    width="560px"
    :confirm-loading="exporting"
    ok-text="导出"
    cancel-text="取消"
    :body-style="{ maxHeight: '70vh', overflowY: 'auto' }"
    @ok="handleExport"
    @cancel="emit('update:open', false)"
    @update:open="emit('update:open', $event)"
  >
    <a-form layout="vertical" class="article-export-form">
      <a-form-item label="导出范围">
        <a-radio-group v-model:value="form.scope">
          <a-radio-button value="published">已发布</a-radio-button>
          <a-radio-button value="draft">草稿</a-radio-button>
          <a-radio-button value="archived">已下架</a-radio-button>
          <a-radio-button value="all">全部</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="分类筛选（含子分类）">
        <a-tree-select
          v-model:value="form.categoryId"
          allow-clear
          show-search
          tree-default-expand-all
          placeholder="不限分类"
          :tree-data="categoryOptions"
          tree-node-filter-prop="title"
        />
      </a-form-item>

      <a-form-item label="关键词">
        <a-input
          v-model:value="form.keyword"
          allow-clear
          placeholder="按标题或摘要筛选，可留空"
        />
      </a-form-item>

      <a-form-item label="导入冲突处理">
        <a-radio-group v-model:value="form.slugStrategy" class="article-export-form__vertical">
          <a-radio value="revision">导出时为 slug 追加 revision 日期，便于重新导入为新草稿</a-radio>
          <a-radio value="keep">保留原 slug，适合只备份或手动改 slug 后再导入</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { exportArticlesMarkdown } from '@/services/admin'

defineProps({
  open: { type: Boolean, default: false },
  categoryOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:open'])
const exporting = ref(false)
const form = reactive({
  scope: 'published',
  categoryId: undefined,
  keyword: '',
  slugStrategy: 'revision'
})

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function formatDownloadDate() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}

async function handleExport() {
  exporting.value = true
  try {
    const blob = await exportArticlesMarkdown({
      scope: form.scope,
      categoryId: form.categoryId || undefined,
      keyword: form.keyword.trim() || undefined,
      slugStrategy: form.slugStrategy
    })
    downloadBlob(blob, `articles-markdown-${formatDownloadDate()}.zip`)
    message.success('文章 Markdown 已导出')
    emit('update:open', false)
  } catch (error) {
    message.error(error.message || '文章导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.article-export-form__vertical {
  display: grid;
  gap: 8px;
}
</style>
