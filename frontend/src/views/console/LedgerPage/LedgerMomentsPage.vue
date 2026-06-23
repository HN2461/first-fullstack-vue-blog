<template>
  <section class="ledger-moments-page">
    <div class="ledger-moments-toolbar">
      <a-space wrap>
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
      </a-space>
      <a-button type="primary" @click="openModal()">
        <template #icon><PlusOutlined /></template>
        新增记录
      </a-button>
    </div>

    <BlogTable
      ref="tableRef"
      :api-fn="loadMoments"
      :columns="columns"
      :params="params"
      :page-size="20"
      :page-sizes="['20', '50', '100']"
      :scroll="{ x: 1080 }"
      height="620px"
      striped
      column-border
      show-column-setting
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'occurredAt'">
          <strong>{{ formatDate(record.occurredAt) }}</strong>
        </template>
        <template v-else-if="column.key === 'scope'">
          <a-tag :bordered="false">{{ scopeLabel(record.scope) }}</a-tag>
        </template>
        <template v-else-if="column.key === 'amount'">
          <strong class="amount-expense">{{ formatMoney(record.amount) }}</strong>
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

    <LedgerMomentModal
      v-model:open="modalOpen"
      :book-id="bookId"
      :categories="categories"
      :moment="currentMoment"
      @saved="reload"
    />
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { deleteLedgerMoment, listLedgerMoments } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'
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
  { title: '标题', key: 'title', width: 220, align: 'center' },
  { title: '金额', key: 'amount', width: 130, align: 'center' },
  { title: '心情', dataIndex: 'mood', key: 'mood', width: 130, align: 'center' },
  { title: '标签', key: 'tags', width: 180, align: 'center' },
  { title: '内容', key: 'content', width: 320, align: 'center' },
  { title: '操作', key: 'action', width: 120, align: 'center' }
]

const params = computed(() => ({
  bookId: props.bookId || undefined,
  scope: filters.scope || undefined,
  keyword: filters.keyword.trim() || undefined
}))

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('zh-CN')
}

function scopeLabel(scope) {
  return scopeOptions.find((item) => item.value === scope)?.label || '某一天'
}

function loadMoments(query) {
  return listLedgerMoments(query)
}

function reload() {
  tableRef.value?.reload?.()
}

function openModal(moment = null) {
  currentMoment.value = moment
  modalOpen.value = true
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
</script>

<style scoped>
.ledger-moments-page {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.ledger-moments-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--console-surface);
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
  justify-content: center;
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
  color: #dc2626;
}

@media (max-width: 800px) {
  .ledger-moments-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .ledger-moment-filter,
  .ledger-moment-search {
    width: 100%;
  }
}
</style>
