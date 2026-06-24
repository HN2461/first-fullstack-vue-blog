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
      :scroll="{ x: 1080 }"
      height="auto"
      striped
      column-border
      show-column-setting
    >
      <template #toolbar>
        <span class="ledger-table-title">重要记录</span>
        <a-select
          v-model:value="filters.scope"
          class="ledger-moment-filter"
          :options="scopeOptions"
          show-search
          option-filter-prop="label"
          @change="reload"
        />
        <a-input-search
          v-model:value="filters.keyword"
          class="ledger-moment-search"
          allow-clear
          placeholder="搜索标题、内容、标签"
          @search="reload"
        />
        <span class="ledger-toolbar-spacer" />
        <a-tooltip title="切换重要记录展示方式">
          <a-radio-group v-model:value="viewMode" size="small" button-style="solid">
            <a-radio-button value="table">
              <UnorderedListOutlined />
            </a-radio-button>
            <a-radio-button value="timeline">
              <ClockCircleOutlined />
            </a-radio-button>
          </a-radio-group>
        </a-tooltip>
        <a-button type="primary" size="small" @click="openModal()">
          <template #icon><PlusOutlined /></template>
          新增记录
        </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'occurredAt'">
          <strong>{{ formatMomentDate(record) }}</strong>
        </template>
        <template v-else-if="column.key === 'scope'">
          <a-tag :bordered="false">{{ scopeLabel(record.scope) }}</a-tag>
        </template>
        <template v-else-if="column.key === 'amount'">
          <strong class="amount-expense">{{ record.amount ? formatMoney(record.amount) : '-' }}</strong>
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
            <strong>{{ record.title }}</strong>
          </div>
        </template>
        <template v-else-if="column.key === 'tags'">
          <a-space wrap size="small">
            <a-tag v-for="tag in record.tags || []" :key="tag" :bordered="false">{{ tag }}</a-tag>
            <span v-if="!record.tags?.length" class="ledger-muted">-</span>
          </a-space>
        </template>
        <template v-else-if="column.key === 'content'">
          <span class="ledger-moment-content">{{ record.content || '-' }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-tooltip title="查看">
              <a-button type="text" @click="openDetail(record)">
                <template #icon><EyeOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="编辑">
              <a-button type="text" @click="openModal(record)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-button type="text" danger @click="confirmDelete(record)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </BlogTable>

    <section v-else class="ledger-moment-panel">
      <div class="ledger-moment-panel__head">
        <span class="ledger-table-title">重要记录</span>
        <a-select
          v-model:value="filters.scope"
          class="ledger-moment-filter"
          :options="scopeOptions"
          show-search
          option-filter-prop="label"
          @change="reload"
        />
        <a-input-search
          v-model:value="filters.keyword"
          class="ledger-moment-search"
          allow-clear
          placeholder="搜索标题、内容、标签"
          @search="reload"
        />
        <span class="ledger-toolbar-spacer" />
        <a-tooltip title="切换重要记录展示方式">
          <a-radio-group v-model:value="viewMode" size="small" button-style="solid">
            <a-radio-button value="table">
              <UnorderedListOutlined />
            </a-radio-button>
            <a-radio-button value="timeline">
              <ClockCircleOutlined />
            </a-radio-button>
          </a-radio-group>
        </a-tooltip>
        <a-button type="primary" size="small" @click="openModal()">
          <template #icon><PlusOutlined /></template>
          新增记录
        </a-button>
      </div>
      <LedgerMomentsTimeline
        :items="timelineItems"
        :total="timelineTotal"
        :page-size="timelinePageSize"
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
      @saved="reload"
    />

    <a-modal
      v-model:open="detailOpen"
      title="查看重要记录"
      :footer="null"
      :width="640"
      :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    >
      <div v-if="detailMoment" class="ledger-moment-detail">
        <div class="ledger-moment-detail__head">
          <strong>{{ detailMoment.title }}</strong>
          <a-tag v-if="detailMoment.pinned" color="gold" :bordered="false">置顶</a-tag>
        </div>
        <div class="ledger-moment-detail__meta">
          <span>{{ scopeLabel(detailMoment.scope) }}：{{ formatMomentDate(detailMoment) }}</span>
          <span v-if="detailMoment.amount">相关金额：{{ formatMoney(detailMoment.amount) }}</span>
          <span v-if="momentCategoryText(detailMoment)">相关分类：{{ momentCategoryText(detailMoment) }}</span>
          <span v-if="detailMoment.mood">心情：{{ detailMoment.mood }}</span>
        </div>
        <a-space v-if="detailMoment.tags?.length" wrap size="small">
          <a-tag v-for="tag in detailMoment.tags" :key="tag" :bordered="false">{{ tag }}</a-tag>
        </a-space>
        <p class="ledger-moment-detail__content">{{ detailMoment.content || '暂无记录内容' }}</p>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ClockCircleOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { deleteLedgerMoment, listLedgerMoments } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'
import LedgerMomentsTimeline from './LedgerMomentsTimeline.vue'
import LedgerMomentModal from './LedgerMomentModal.vue'

const props = defineProps({
  bookId: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  range: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

const tableRef = ref(null)
const modalOpen = ref(false)
const currentMoment = ref(null)
const viewMode = ref('table')
const detailOpen = ref(false)
const detailMoment = ref(null)

// 时间线分页状态
const timelineItems = ref([])
const timelineTotal = ref(0)
const timelinePageSize = ref(20)
const timelinePage = ref(1)

const filters = reactive({
  scope: '',
  keyword: ''
})

const scopeOptions = [
  { label: '全部范围', value: '' },
  { label: '某一天', value: 'day' },
  { label: '某个月', value: 'month' },
  { label: '某一年', value: 'year' }
]

const columns = [
  { title: '日期', key: 'occurredAt', width: 130, align: 'center' },
  { title: '范围', key: 'scope', width: 100, align: 'center' },
  { title: '标题', key: 'title', width: 220, align: 'left' },
  { title: '金额', key: 'amount', width: 130, align: 'center' },
  { title: '相关分类', key: 'category', width: 160, align: 'center' },
  { title: '心情', dataIndex: 'mood', key: 'mood', width: 130, align: 'center' },
  { title: '标签', key: 'tags', width: 180, align: 'center' },
  { title: '内容', key: 'content', width: 320, align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center' }
]

const params = computed(() => ({
  bookId: props.bookId || undefined,
  scope: filters.scope || undefined,
  keyword: filters.keyword.trim() || undefined
}))

function scopeLabel(scope) {
  return scopeOptions.find((item) => item.value === scope)?.label || '某一天'
}

function formatMomentDate(record) {
  if (!record?.occurredAt) return '-'
  const date = new Date(record.occurredAt)
  if (Number.isNaN(date.getTime())) return '-'
  const [year, month, day] = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ]
  if (record.scope === 'year') return `${year}`
  if (record.scope === 'month') return `${year}-${month}`
  return `${year}-${month}-${day}`
}

function momentCategoryText(record) {
  return record?.category?.name || record?.categoryText || ''
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
  try {
    const result = await listLedgerMoments({
      ...params.value,
      page: timelinePage.value,
      pageSize: timelinePageSize.value
    })
    timelineItems.value = result.items || []
    timelineTotal.value = result.total || 0
  } catch {
    timelineItems.value = []
    timelineTotal.value = 0
  }
}

function reload() {
  if (viewMode.value === 'table') {
    tableRef.value?.reload?.()
  } else {
    timelinePage.value = 1
    loadTimeline()
  }
}

function handleTimelinePageChange(page) {
  timelinePage.value = page
  loadTimeline()
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
        reload()
      } catch (error) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

watch(
  () => [props.bookId, props.refreshKey],
  reload
)

watch(viewMode, (mode) => {
  if (mode === 'timeline') loadTimeline()
})
</script>

<style scoped>
.ledger-moments-page {
  min-width: 0;
}

.ledger-table-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--console-text);
  white-space: nowrap;
}

.ledger-toolbar-spacer {
  flex: 1;
}

.ledger-moment-panel {
  min-width: 0;
  display: grid;
  gap: 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  padding: 10px;
}

.ledger-moment-panel__head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ledger-moment-filter {
  width: 140px;
}

.ledger-moment-search {
  width: 260px;
}

.ledger-moment-title {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  max-width: 200px;
}

.ledger-moment-title strong,
.ledger-moment-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ledger-moment-content {
  display: inline-block;
  max-width: 300px;
  color: var(--console-text-secondary);
}

.ledger-muted {
  color: var(--console-text-secondary);
}

.amount-expense {
  color: var(--color-error, #dc2626);
}

.ledger-moment-detail { display: grid; gap: 12px; }

.ledger-moment-detail__head { display: flex; align-items: center; gap: 8px; }

.ledger-moment-detail__head strong { color: var(--console-text); font-size: 16px; }

.ledger-moment-detail__meta { display: flex; flex-wrap: wrap; gap: 8px 14px; color: var(--console-text-secondary); font-size: 13px; }

.ledger-moment-detail__content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--console-text);
  line-height: 1.7;
}

@media (max-width: 800px) {
  .ledger-moment-filter,
  .ledger-moment-search {
    width: 100%;
  }
}
</style>
