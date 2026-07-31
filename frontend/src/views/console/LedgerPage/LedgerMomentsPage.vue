<template>
  <section class="ledger-moments-page">
    <BlogTable
      v-if="viewMode === 'table'"
      ref="tableRef"
      :api-fn="loadMoments"
      :columns="columns"
      :params="params"
      :page-size="20"
      :page-sizes="['20', '50', '100']"
      :scroll="{ x: 1180 }"
      height="auto"
      striped
      column-border
      show-column-setting
      @data-change="handleTableDataChange"
    >
      <template #toolbar>
        <LedgerMomentsToolbar
          :scope="filters.scope"
          :category-id="filters.categoryId"
          :keyword="filters.keyword"
          :view-mode="viewMode"
          :categories="categories"
          :total="tableTotal"
          @update:scope="filters.scope = $event"
          @update:category-id="filters.categoryId = $event"
          @update:keyword="filters.keyword = $event"
          @update:view-mode="setViewMode"
          @search="applyKeywordImmediately"
          @add="openModal()"
        />
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'occurredAt'">
          <strong class="ledger-moment-date">{{ formatMomentDate(record) }}</strong>
        </template>
        <template v-else-if="column.key === 'scope'">
          <a-tag :bordered="false">{{ scopeLabel(record.scope) }}</a-tag>
        </template>
        <template v-else-if="column.key === 'amount'">
          <strong v-if="record.amount" class="ledger-moment-amount">{{ formatMoney(record.amount) }}</strong>
          <span v-else class="ledger-muted">-</span>
        </template>
        <template v-else-if="column.key === 'category'">
          <a-tag v-if="momentCategoryText(record)" :bordered="false">
            {{ momentCategoryText(record) }}
          </a-tag>
          <span v-else class="ledger-muted">-</span>
        </template>
        <template v-else-if="column.key === 'title'">
          <div class="ledger-moment-title">
            <a-tag v-if="record.pinned" color="gold" :bordered="false">置顶</a-tag>
            <LedgerTextTooltip
              :text="record.title"
              text-class="ledger-moment-title__text"
              :search-mode="hasKeyword"
              :search-keyword="appliedKeyword"
            />
          </div>
        </template>
        <template v-else-if="column.key === 'tags'">
          <a-space wrap size="small">
            <a-tag v-for="tag in record.tags || []" :key="tag" :bordered="false">{{ tag }}</a-tag>
            <span v-if="!record.tags?.length" class="ledger-muted">-</span>
          </a-space>
        </template>
        <template v-else-if="column.key === 'content'">
          <LedgerTextTooltip
            :text="record.content"
            text-class="ledger-moment-content"
            muted-class="ledger-muted"
            :search-mode="hasKeyword"
            :search-keyword="appliedKeyword"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-tooltip title="查看详情">
              <a-button type="text" size="small" aria-label="查看详情" @click="openDetail(record)">
                <template #icon><EyeOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="编辑记录">
              <a-button type="text" size="small" aria-label="编辑记录" @click="openModal(record)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="删除记录">
              <a-button type="text" size="small" danger aria-label="删除记录" @click="confirmDelete(record)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </BlogTable>

    <section v-else class="ledger-moment-panel">
      <div class="ledger-moment-panel__toolbar">
        <LedgerMomentsToolbar
          :scope="filters.scope"
          :category-id="filters.categoryId"
          :keyword="filters.keyword"
          :view-mode="viewMode"
          :categories="categories"
          :total="timelineTotal"
          @update:scope="filters.scope = $event"
          @update:category-id="filters.categoryId = $event"
          @update:keyword="filters.keyword = $event"
          @update:view-mode="setViewMode"
          @search="applyKeywordImmediately"
          @add="openModal()"
        />
      </div>
      <LedgerMomentsTimeline
        :items="timelineItems"
        :total="timelineTotal"
        :page="timelinePage"
        :page-size="timelinePageSize"
        :keyword="appliedKeyword"
        :loading="timelineLoading"
        @view="openDetail"
        @edit="openModal"
        @delete="confirmDelete"
        @page-change="handleTimelinePageChange"
      />
    </section>

    <LedgerMomentModal
      v-model:open="modalOpen"
      :book-id="bookId"
      :categories="categories"
      :moment="currentMoment"
      @saved="reloadActiveView"
    />
    <LedgerMomentDetailModal
      v-model:open="detailOpen"
      :moment="detailMoment"
      @edit="openModal"
    />
  </section>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { deleteLedgerMoment, listLedgerMoments } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'
import LedgerMomentDetailModal from './LedgerMomentDetailModal.vue'
import LedgerMomentModal from './LedgerMomentModal.vue'
import LedgerMomentsTimeline from './LedgerMomentsTimeline.vue'
import LedgerMomentsToolbar from './LedgerMomentsToolbar.vue'
import LedgerTextTooltip from './LedgerTextTooltip.vue'
import { formatMomentDate, momentCategoryText, scopeLabel } from './ledgerMomentUtils'

const VIEW_STORAGE_KEY = 'ledger-moment-view-mode'

const props = defineProps({
  bookId: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  range: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

const tableRef = ref(null)
const tableTotal = ref(Number.NaN)
const modalOpen = ref(false)
const currentMoment = ref(null)
const detailOpen = ref(false)
const detailMoment = ref(null)
const viewMode = ref(readStoredViewMode())
const timelineItems = ref([])
const timelineTotal = ref(0)
const timelinePageSize = 20
const timelinePage = ref(1)
const timelineLoading = ref(false)
const appliedKeyword = ref('')
let keywordTimer = null

const filters = reactive({
  scope: '',
  categoryId: '',
  keyword: ''
})

const columns = [
  { title: '日期', key: 'occurredAt', width: 130, align: 'center', fixed: 'left' },
  { title: '范围', key: 'scope', width: 100, align: 'center' },
  { title: '标题', key: 'title', width: 220, align: 'left' },
  { title: '相关金额', key: 'amount', width: 130, align: 'center' },
  { title: '相关分类', key: 'category', width: 160, align: 'center' },
  { title: '心情', dataIndex: 'mood', key: 'mood', width: 130, align: 'center' },
  { title: '标签', key: 'tags', width: 180, align: 'center' },
  { title: '内容', key: 'content', width: 320, align: 'left' },
  { title: '操作', key: 'action', width: 130, align: 'center', fixed: 'right' }
]

const hasKeyword = computed(() => Boolean(appliedKeyword.value))
const params = computed(() => ({
  bookId: props.bookId || undefined,
  scope: filters.scope || undefined,
  categoryId: filters.categoryId || undefined,
  keyword: appliedKeyword.value || undefined
}))

function readStoredViewMode() {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY)
    return stored === 'table' || stored === 'timeline' ? stored : 'timeline'
  } catch {
    return 'timeline'
  }
}

function setViewMode(mode) {
  if (mode !== 'table' && mode !== 'timeline') return
  viewMode.value = mode
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, mode)
  } catch {
    // 浏览器禁用本地存储时仍允许正常切换视图。
  }
}

function loadMoments(query) {
  return listLedgerMoments(query)
}

async function loadTimeline() {
  if (!props.bookId) {
    timelineItems.value = []
    timelineTotal.value = 0
    return
  }
  timelineLoading.value = true
  try {
    const result = await listLedgerMoments({
      ...params.value,
      page: timelinePage.value,
      pageSize: timelinePageSize
    })
    timelineItems.value = result.items || []
    timelineTotal.value = result.total || 0
  } catch {
    timelineItems.value = []
    timelineTotal.value = 0
  } finally {
    timelineLoading.value = false
  }
}

function reloadActiveView() {
  if (viewMode.value === 'table') {
    tableRef.value?.reload?.()
    return
  }
  timelinePage.value = 1
  loadTimeline()
}

function handleTimelinePageChange(page) {
  timelinePage.value = page
  loadTimeline()
}

function handleTableDataChange({ total }) {
  tableTotal.value = Number(total) || 0
}

function applyKeywordImmediately() {
  if (keywordTimer) clearTimeout(keywordTimer)
  const keyword = filters.keyword.trim()
  if (appliedKeyword.value === keyword) {
    reloadActiveView()
    return
  }
  appliedKeyword.value = keyword
}

function openModal(moment = null) {
  currentMoment.value = moment
  modalOpen.value = true
}

function openDetail(moment) {
  detailMoment.value = moment
  detailOpen.value = true
}

function confirmDelete(moment) {
  Modal.confirm({
    title: '删除重要记录',
    content: `确定删除「${moment.title}」吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteLedgerMoment(moment.id)
        message.success('重要记录已删除')
        reloadActiveView()
      } catch (error) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

watch(
  () => filters.keyword,
  () => {
    if (keywordTimer) clearTimeout(keywordTimer)
    keywordTimer = setTimeout(() => {
      appliedKeyword.value = filters.keyword.trim()
    }, 300)
  }
)

watch(
  params,
  () => {
    if (viewMode.value !== 'timeline') return
    timelinePage.value = 1
    loadTimeline()
  },
  { immediate: true }
)

watch(viewMode, (mode, previousMode) => {
  if (mode === 'timeline' && previousMode !== 'timeline') loadTimeline()
})

watch(
  () => props.refreshKey,
  reloadActiveView
)

onUnmounted(() => {
  if (keywordTimer) clearTimeout(keywordTimer)
})
</script>

<style scoped>
.ledger-moments-page {
  min-width: 0;
}

.ledger-moment-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.ledger-moment-panel__toolbar {
  padding: 10px;
  border-bottom: 1px solid var(--console-border);
}

.ledger-moment-date,
.ledger-moment-amount {
  font-variant-numeric: tabular-nums;
}

.ledger-moment-amount {
  color: var(--console-primary, #1677ff);
}

.ledger-moment-title {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}

.ledger-moment-title :deep(.ledger-moment-title__text) {
  color: var(--console-text);
  font-weight: 600;
}

:deep(.ledger-moment-content) {
  color: var(--console-text-secondary);
}

.ledger-muted {
  color: var(--console-text-secondary);
}
</style>
