<template>
  <BlogTable
    ref="tableRef"
    :api-fn="loadEntries"
    :columns="columns"
    :params="params"
    :page-size="20"
    :page-sizes="['20', '50', '100']"
    :scroll="{ x: 1280 }"
    :height="'520px'"
    show-column-setting
    striped
    column-border
    :row-selection="{ columnWidth: 48 }"
    @selection-change="handleSelectionChange"
    @change="handleTableChange"
  >
    <template #toolbar>
      <a-space wrap>
        <a-select
          v-model:value="filters.type"
          class="ledger-filter"
          :options="typeOptions"
          show-search
          option-filter-prop="label"
          @change="reload"
        />
        <a-select
          v-model:value="filters.categoryId"
          class="ledger-filter"
          :options="categoryOptions"
          show-search
          option-filter-prop="label"
          @change="reload"
        />
        <a-input-search
          v-model:value="filters.keyword"
          class="ledger-search"
          allow-clear
          placeholder="搜索备注或分类"
          @search="reload"
          @change="handleKeywordInput"
        />
        <a-button
          :disabled="!selectedKeys.length"
          @click="$emit('batch-edit', selectedKeys)"
        >
          批量修改
        </a-button>
      </a-space>
      <span class="ledger-toolbar-spacer" />
      <slot name="extra" />
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'occurredAt'">
        <span class="ledger-cell-center">{{ formatDate(record.occurredAt) }}</span>
      </template>
      <template v-else-if="column.key === 'type'">
        <a-tag :color="record.type === 'income' ? 'green' : 'red'" :bordered="false">
          {{ record.type === 'income' ? '收入' : '支出' }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'category'">
        <a-tag :color="record.category?.color || 'blue'" :bordered="false">
          {{ record.category?.name || record.categoryNameSnapshot || '-' }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'amount'">
        <strong :class="record.type === 'income' ? 'amount-income' : 'amount-expense'">
          {{ formatMoney(record.amount) }}
        </strong>
      </template>
      <template v-else-if="column.key === 'dailyNote'">
        <span class="ledger-muted ledger-note-cell">{{ record.dailyNote || '-' }}</span>
      </template>
      <template v-else-if="column.key === 'source'">
        <span class="ledger-muted">{{ record.source === 'excel_import' ? 'Excel导入' : '手动' }}</span>
      </template>
      <template v-else-if="column.key === 'updatedAt'">
        <span class="ledger-muted ledger-cell-center">{{ formatTime(record.updatedAt) }}</span>
      </template>
      <template v-else-if="column.key === 'action'">
        <a-space size="small">
          <a-tooltip title="编辑">
            <a-button type="text" @click="$emit('edit', record)">
              <template #icon><EditOutlined /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip title="删除">
            <a-button type="text" danger @click="$emit('delete', record)">
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </a-tooltip>
        </a-space>
      </template>
    </template>
  </BlogTable>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listLedgerEntries } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'
import { formatDate, formatTime } from './ledgerUtils'

const props = defineProps({
  bookId: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  range: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

defineEmits(['edit', 'delete', 'batch-edit'])

const tableRef = ref(null)
const selectedKeys = ref([])
let keywordTimer = null
const filters = reactive({
  type: '',
  categoryId: '',
  keyword: ''
})

const columns = [
  { title: '日期', key: 'occurredAt', width: 140, align: 'center', sorter: true },
  { title: '类型', key: 'type', width: 90, align: 'center' },
  { title: '分类', key: 'category', width: 140, align: 'center' },
  { title: '金额', key: 'amount', width: 130, align: 'right', sorter: true },
  { title: '单笔备注', dataIndex: 'note', key: 'note', width: 240, align: 'center' },
  { title: '当日备注', key: 'dailyNote', width: 280, align: 'center' },
  { title: '来源', key: 'source', width: 110, align: 'center' },
  { title: '更新时间', key: 'updatedAt', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 120, align: 'center' }
]

const typeOptions = [
  { label: '全部类型', value: '' },
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' }
]

const categoryOptions = computed(() => [
  { label: '全部分类', value: '' },
  ...props.categories.filter((item) => !item.archived).map((item) => ({
    label: item.name,
    value: item.id
  }))
])

const sortState = reactive({ field: '', order: '' })

const params = computed(() => ({
  bookId: props.bookId || undefined,
  from: props.range?.[0] || undefined,
  to: props.range?.[1] || undefined,
  type: filters.type || undefined,
  categoryId: filters.categoryId || undefined,
  keyword: filters.keyword.trim() || undefined,
  sortField: sortState.field || undefined,
  sortOrder: sortState.order || undefined
}))

function loadEntries(query) {
  return listLedgerEntries(query)
}

function handleTableChange(pagination, filters, sorter) {
  if (sorter.field === 'occurredAt') {
    sortState.field = 'occurredAt'
  } else if (sorter.field === 'amount') {
    sortState.field = 'amount'
  } else {
    sortState.field = ''
  }
  sortState.order = sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : ''
  reload()
}

function reload() {
  tableRef.value?.reload?.()
}

function refresh() {
  tableRef.value?.refresh?.()
}

function clearSelection() {
  selectedKeys.value = []
  tableRef.value?.clearSelection?.()
}

function handleSelectionChange(keys) {
  selectedKeys.value = keys
}

function handleKeywordInput() {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(reload, 300)
}

onUnmounted(() => {
  clearTimeout(keywordTimer)
})

watch(
  () => props.refreshKey,
  () => reload()
)

defineExpose({ reload, refresh, clearSelection })
</script>

<style scoped>
.ledger-filter {
  width: 140px;
}

.ledger-search {
  width: 220px;
}

.ledger-toolbar-spacer {
  flex: 1;
}

.amount-income {
  color: var(--color-success, #16a34a);
}

.amount-expense {
  color: var(--color-error, #dc2626);
}

.ledger-muted {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-cell-center {
  display: inline-flex;
  justify-content: center;
  width: 100%;
}

.ledger-note-cell {
  display: inline-block;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
</style>
