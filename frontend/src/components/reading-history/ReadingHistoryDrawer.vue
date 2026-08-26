<template>
  <a-drawer
    v-model:open="drawerOpen"
    title="最近阅读"
    placement="right"
    :width="appStore.isMobile ? '100%' : 430"
    class="reading-history-drawer"
  >
    <div class="reading-history-drawer__body">
      <a-skeleton v-if="loading && !hasLoaded" active :paragraph="{ rows: 8 }" />

      <template v-else>
        <a-alert
          v-if="loadError"
          type="warning"
          show-icon
          :message="loadError"
        >
          <template #action>
            <a-button type="link" size="small" @click="loadRecords">重试</a-button>
          </template>
        </a-alert>

        <section class="reading-history-group">
          <header class="reading-history-group__head">
            <strong>继续阅读</strong>
            <span>{{ unfinished.total }} 篇未完成</span>
          </header>
          <div v-if="unfinished.items.length" class="reading-history-group__list">
            <ReadingHistoryItem
              v-for="item in unfinished.items"
              :key="item.id"
              :item="item"
              @continue="continueReading"
              @restart="restartReading"
              @remove="removeRecord"
            />
          </div>
          <a-empty v-else description="暂无未完成文章" :image-style="{ height: '42px' }" />
        </section>

        <section class="reading-history-group">
          <header class="reading-history-group__head">
            <strong>最近读完</strong>
            <span>{{ completed.total }} 篇已完成</span>
          </header>
          <div v-if="completed.items.length" class="reading-history-group__list">
            <ReadingHistoryItem
              v-for="item in completed.items"
              :key="item.id"
              :item="item"
              @continue="reviewArticle"
              @restart="restartReading"
              @remove="removeRecord"
            />
          </div>
          <a-empty v-else description="暂无已完成文章" :image-style="{ height: '42px' }" />
        </section>
      </template>
    </div>

    <template #footer>
      <a-button block @click="openAllRecords">查看全部阅读记录</a-button>
    </template>
  </a-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import ReadingHistoryItem from './ReadingHistoryItem.vue'
import {
  deleteArticleReadingProgress,
  listArticleReadingProgress
} from '@/services/readingProgress'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import {
  clearLocalReadingProgress,
  getReadingHistoryArticlePath
} from '@/utils/readingHistory'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open'])

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const loading = ref(false)
const hasLoaded = ref(false)
const loadError = ref('')
const unfinished = ref({ items: [], total: 0 })
const completed = ref({ items: [], total: 0 })
let requestId = 0

const drawerOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

async function loadRecords() {
  const currentRequestId = ++requestId
  loading.value = true
  loadError.value = ''
  try {
    const [unfinishedResult, completedResult] = await Promise.all([
      listArticleReadingProgress({ status: 'unfinished', pageSize: 5 }),
      listArticleReadingProgress({ status: 'completed', pageSize: 5 })
    ])
    if (currentRequestId !== requestId) return
    unfinished.value = unfinishedResult || { items: [], total: 0 }
    completed.value = completedResult || { items: [], total: 0 }
    hasLoaded.value = true
  } catch (error) {
    if (currentRequestId !== requestId) return
    loadError.value = error.message || '阅读记录加载失败'
  } finally {
    if (currentRequestId === requestId) loading.value = false
  }
}

function closeAndNavigate(path) {
  drawerOpen.value = false
  router.push(path)
}

function continueReading(item) {
  closeAndNavigate(getReadingHistoryArticlePath(item.article.slug, { resume: true }))
}

function reviewArticle(item) {
  closeAndNavigate(getReadingHistoryArticlePath(item.article.slug))
}

async function clearRecord(item) {
  await deleteArticleReadingProgress(item.articleId)
  clearLocalReadingProgress(item.articleId, authStore.user?.id)
}

async function restartReading(item) {
  try {
    await clearRecord(item)
    closeAndNavigate(getReadingHistoryArticlePath(item.article.slug, { restart: true }))
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
        await loadRecords()
      } catch (error) {
        message.error(error.message || '阅读记录移除失败')
        throw error
      }
    }
  })
}

function openAllRecords() {
  drawerOpen.value = false
  router.push('/console/reading-history')
}

watch(
  () => props.open,
  (open) => {
    if (open) loadRecords()
  }
)
</script>

<style scoped>
.reading-history-drawer__body {
  min-width: 0;
  display: grid;
  gap: 20px;
}

.reading-history-group {
  min-width: 0;
}

.reading-history-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
  border-bottom: 1px solid var(--console-border);
}

.reading-history-group__head strong {
  color: var(--console-text);
  font-size: 14px;
}

.reading-history-group__head span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.reading-history-group__list {
  min-width: 0;
}

.reading-history-group :deep(.ant-empty) {
  margin-block: 18px;
}
</style>

<style>
.reading-history-drawer .ant-drawer-body {
  overflow-y: auto;
  padding: 14px 18px;
}

.reading-history-drawer .ant-drawer-footer {
  padding: 12px 18px;
}
</style>
