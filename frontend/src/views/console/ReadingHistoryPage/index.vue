<template>
  <section class="enterprise-page reading-history-page">
    <div class="reading-history-toolbar">
      <a-segmented v-model:value="status" class="reading-history-filter" :options="statusOptions" />
      <span class="reading-history-toolbar__count">{{ result.total }} 条记录</span>
      <span class="reading-history-toolbar__spacer" />
      <a-tooltip title="刷新阅读记录">
        <a-button type="text" shape="circle" aria-label="刷新阅读记录" :loading="loading" @click="loadRecords">
          <template #icon><ReloadOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>

    <div class="reading-history-workspace">
      <a-skeleton v-if="loading && !hasLoaded" active :paragraph="{ rows: 10 }" />
      <a-alert v-else-if="loadError" type="warning" show-icon :message="loadError">
        <template #action>
          <a-button type="link" size="small" @click="loadRecords">重试</a-button>
        </template>
      </a-alert>
      <div v-else-if="result.items.length" class="reading-history-list">
        <ReadingHistoryItem
          v-for="item in result.items"
          :key="item.id"
          :item="item"
          @continue="openRecord"
          @restart="restartReading"
          @remove="removeRecord"
        />
      </div>
      <a-empty v-else description="暂无阅读记录" />

      <a-pagination
        v-if="result.total > pageSize"
        v-model:current="currentPage"
        class="reading-history-pagination"
        :page-size="pageSize"
        :total="result.total"
        show-less-items
        @change="loadRecords"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import ReadingHistoryItem from '@/components/reading-history/ReadingHistoryItem.vue'
import {
  deleteArticleReadingProgress,
  listArticleReadingProgress
} from '@/services/readingProgress'
import { useAuthStore } from '@/stores/auth'
import {
  clearLocalReadingProgress,
  getReadingHistoryArticlePath
} from '@/utils/readingHistory'

const router = useRouter()
const authStore = useAuthStore()
const status = ref('all')
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '未完成', value: 'unfinished' },
  { label: '已完成', value: 'completed' }
]
const currentPage = ref(1)
const pageSize = 12
const loading = ref(false)
const hasLoaded = ref(false)
const loadError = ref('')
const result = ref({ items: [], total: 0, unfinishedCount: 0 })
let requestId = 0

async function loadRecords() {
  const currentRequestId = ++requestId
  loading.value = true
  loadError.value = ''
  try {
    const nextResult = await listArticleReadingProgress({
      status: status.value,
      page: currentPage.value,
      pageSize
    })
    if (currentRequestId !== requestId) return
    result.value = nextResult || { items: [], total: 0, unfinishedCount: 0 }
    hasLoaded.value = true
  } catch (error) {
    if (currentRequestId !== requestId) return
    loadError.value = error.message || '阅读记录加载失败'
  } finally {
    if (currentRequestId === requestId) loading.value = false
  }
}

function openRecord(item) {
  const resume = !item.completedAt
  router.push(getReadingHistoryArticlePath(item.article.slug, { resume }))
}

async function clearRecord(item) {
  await deleteArticleReadingProgress(item.articleId)
  clearLocalReadingProgress(item.articleId, authStore.user?.id)
}

async function restartReading(item) {
  try {
    await clearRecord(item)
    router.push(getReadingHistoryArticlePath(item.article.slug, { restart: true }))
  } catch (error) {
    message.error(error.message || '阅读进度清除失败')
  }
}

function removeRecord(item) {
  Modal.confirm({
    title: '移除阅读记录',
    content: `确定移除“${item.article.title}”的阅读进度吗？`,
    okText: '移除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await clearRecord(item)
        if (result.value.items.length === 1 && currentPage.value > 1) {
          currentPage.value -= 1
        }
        await loadRecords()
      } catch (error) {
        message.error(error.message || '阅读记录移除失败')
        throw error
      }
    }
  })
}

watch(status, () => {
  currentPage.value = 1
  loadRecords()
}, { immediate: true })
</script>

<style scoped>
.reading-history-page {
  min-width: 0;
  display: grid;
  gap: 10px;
}

.reading-history-toolbar {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 7px 10px;
  background: var(--console-surface);
}

.reading-history-toolbar__count {
  color: var(--console-text-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.reading-history-toolbar__spacer {
  flex: 1;
}

.reading-history-filter {
  color: var(--console-menu-text);
  background: var(--console-surface-muted);
}

.reading-history-filter :deep(.ant-segmented-item) {
  color: var(--console-menu-text);
}

.reading-history-filter :deep(.ant-segmented-item-label) {
  position: relative;
  z-index: 1;
  color: var(--console-menu-text) !important;
  -webkit-text-fill-color: var(--console-menu-text);
}

.reading-history-filter :deep(.ant-segmented-item:hover:not(.ant-segmented-item-selected)) {
  color: var(--console-primary-strong);
}

.reading-history-filter :deep(.ant-segmented-item:hover:not(.ant-segmented-item-selected) .ant-segmented-item-label),
.reading-history-filter :deep(.ant-segmented-item-selected .ant-segmented-item-label),
.reading-history-filter :deep(.ant-segmented-item-selected:hover .ant-segmented-item-label) {
  color: var(--console-primary-strong) !important;
  -webkit-text-fill-color: var(--console-primary-strong);
}

.reading-history-filter :deep(.ant-segmented-item:hover:not(.ant-segmented-item-selected))::after {
  background-color: var(--console-surface-hover) !important;
}

.reading-history-filter :deep(.ant-segmented-item-selected),
.reading-history-filter :deep(.ant-segmented-item-selected:hover),
.reading-history-filter :deep(.ant-segmented-thumb) {
  color: var(--console-primary-strong);
  background: var(--console-surface) !important;
}

.reading-history-workspace {
  min-width: 0;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 0 16px 16px;
  background: var(--console-surface);
}

.reading-history-list {
  min-width: 0;
}

.reading-history-pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.reading-history-workspace :deep(.ant-empty),
.reading-history-workspace :deep(.ant-skeleton) {
  margin-block: 36px;
}

@media (max-width: 760px), (pointer: coarse) and (max-width: 1024px) {
  .reading-history-toolbar {
    gap: 8px;
    overflow-x: auto;
  }

  .reading-history-workspace {
    padding: 0 10px 12px;
  }
}
</style>
