<template>
  <BlogTable
    :key="tableModeKey"
    ref="tableRef"
    :class="{ 'ledger-entry-table--search': isSearchActive }"
    :api-fn="loadEntries"
    :columns="tableColumns"
    :params="params"
    :page-size="20"
    :page-sizes="['20', '50', '100']"
    :scroll="tableScroll"
    height="auto"
    :show-column-setting="!isSearchActive"
    :striped="!isSearchActive"
    :column-border="!isSearchActive"
    :row-selection="rowSelection"
    @selection-change="handleSelectionChange"
  >
    <template #toolbar>
      <a-space wrap size="small">
        <a-select
          :value="bookId"
          class="ledger-filter ledger-filter-book"
          :options="[{ label: '全部账本', value: 'all' }, ...bookOptions]"
          show-search
          option-filter-prop="label"
          @change="$emit('update-book-id', $event)"
        />
        <a-select
          v-model:value="filters.type"
          class="ledger-filter"
          :options="typeOptions"
          show-search
          option-filter-prop="label"
          allow-clear
          placeholder="全部类型"
          @change="reload"
        />
        <a-select
          v-model:value="filters.categoryId"
          class="ledger-filter"
          :options="categoryOptions"
          show-search
          option-filter-prop="label"
          allow-clear
          placeholder="全部分类"
          @change="reload"
        />
        <a-select
          v-model:value="filters.tags"
          class="ledger-filter-tags"
          mode="tags"
          :token-separators="[',', ' ']"
          placeholder="按标签筛选"
          allow-clear
          :max-tag-count="1"
          @change="reload"
        />
        <a-input-search
          v-model:value="filters.keyword"
          class="ledger-search"
          allow-clear
          placeholder="搜索备注、当日备注或分类"
          @search="applyKeywordSearch"
          @change="handleKeywordInput"
        />
        <a-tooltip :title="amountSortTooltip">
          <a-button class="ledger-sort-button" @click="toggleAmountSort">
            <template #icon>
              <SortDescendingOutlined v-if="filters.sortField === 'amount' && filters.sortOrder === 'desc'" />
              <SortAscendingOutlined v-else />
            </template>
            金额
          </a-button>
        </a-tooltip>
        <a-dropdown :trigger="['click']">
          <a-button aria-label="更多流水操作">
            <template #icon><MoreOutlined /></template>
          </a-button>
          <template #overlay>
            <a-menu @click="handleAction">
              <a-menu-item key="new-entry">
                <PlusOutlined /> 新增流水
              </a-menu-item>
              <a-menu-item key="batch-edit" :disabled="!selectedKeys.length">
                <EditOutlined /> 批量修改
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="export">
                <DownloadOutlined /> 导出
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'searchResult'">
        <LedgerEntrySearchGroup
          :group="record"
          :keyword="searchKeyword"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </template>
      <template v-else-if="column.key === 'occurredAt'">
        <span class="ledger-cell-center">{{ formatDate(record.occurredAt) }}</span>
      </template>
      <template v-else-if="column.key === 'book'">
        <span class="ledger-muted">{{ record.book?.name || record.bookName || '-' }}</span>
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
        <strong :class="['ledger-cell-center', record.type === 'income' ? 'amount-income' : 'amount-expense']">
          {{ formatMoney(record.amount) }}
        </strong>
      </template>
      <template v-else-if="column.key === 'note'">
        <LedgerTextTooltip
          :text="record.note || ''"
          text-class="ledger-note-cell"
          :search-mode="isSearchActive"
          :search-keyword="searchKeyword"
        />
      </template>
      <template v-else-if="column.key === 'dailyNote'">
        <LedgerTextTooltip
          :text="record.dailyNote || ''"
          :text-class="dailyNoteTextClass"
          muted-class="ledger-muted"
          :search-mode="isSearchActive"
          :search-keyword="searchKeyword"
        />
      </template>
      <template v-else-if="column.key === 'tags'">
        <a-space wrap size="small">
          <a-tag v-for="tag in record.tags || []" :key="tag" :bordered="false" size="small">{{ tag }}</a-tag>
          <span v-if="!record.tags?.length" class="ledger-muted">-</span>
        </a-space>
      </template>
      <template v-else-if="column.key === 'source'">
        <span class="ledger-muted ledger-ellipsis-cell">{{ record.source === 'excel_import' ? 'Excel导入' : '手动' }}</span>
      </template>
      <template v-else-if="column.key === 'updatedAt'">
        <span class="ledger-muted ledger-cell-center ledger-ellipsis-cell">{{ formatTime(record.updatedAt) }}</span>
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
import { DeleteOutlined, DownloadOutlined, EditOutlined, MoreOutlined, PlusOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listLedgerEntries } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'
import { formatDate, formatTime } from './ledgerUtils'
import LedgerEntrySearchGroup from './LedgerEntrySearchGroup.vue'
import LedgerTextTooltip from './LedgerTextTooltip.vue'

const props = defineProps({
  bookId: { type: String, default: '' },
  bookOptions: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  range: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

const emit = defineEmits(['edit', 'delete', 'batch-edit', 'export', 'update-book-id', 'new-entry'])

const tableRef = ref(null)
const selectedKeys = ref([])
const selectedRows = ref([])
const searchKeyword = ref('')
let keywordTimer = null
const filters = reactive({
  type: '',
  categoryId: '',
  keyword: '',
  tags: [],
  sortField: '',
  sortOrder: ''
})

const columns = [
  { title: '日期', dataIndex: 'occurredAt', key: 'occurredAt', width: 140, align: 'center', fixed: 'left' },
  { title: '账本', key: 'book', width: 120, align: 'center' },
  { title: '类型', key: 'type', width: 90, align: 'center' },
  { title: '分类', key: 'category', width: 140, align: 'center' },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 130, align: 'center' },
  { title: '单笔备注', dataIndex: 'note', key: 'note', width: 200, align: 'center' },
  { title: '标签', key: 'tags', width: 160, align: 'center' },
  { title: '当日备注', key: 'dailyNote', width: 240, align: 'center' },
  { title: '来源', key: 'source', width: 110, align: 'center' },
  { title: '更新时间', key: 'updatedAt', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' }
]

const searchColumns = [
  { title: '搜索结果', key: 'searchResult' }
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
const isSearchActive = computed(() => Boolean(searchKeyword.value))
const tableModeKey = computed(() => (isSearchActive.value ? 'search-results' : 'entry-table'))
const tableColumns = computed(() => (isSearchActive.value ? searchColumns : (props.bookId === 'all' ? columns : columns.filter((column) => column.key !== 'book'))))
const tableScroll = computed(() => (isSearchActive.value ? {} : { x: 1440 }))
const rowSelection = computed(() => (isSearchActive.value ? false : { columnWidth: 48 }))
const dailyNoteTextClass = computed(() => (
  isSearchActive.value ? 'ledger-note-cell' : 'ledger-note-cell ledger-muted'
))

const params = computed(() => ({
  bookId: props.bookId || undefined,
  from: props.range?.[0] || undefined,
  to: props.range?.[1] || undefined,
  type: filters.type || undefined,
  categoryId: filters.categoryId || undefined,
  keyword: searchKeyword.value || undefined,
  tags: filters.tags?.length ? filters.tags : undefined,
  sortField: filters.sortField || undefined,
  sortOrder: filters.sortOrder || undefined
}))

const amountSortTooltip = computed(() => {
  if (filters.sortField !== 'amount') return '按金额升序'
  return filters.sortOrder === 'asc' ? '按金额降序' : '恢复默认日期排序'
})

function toLocalDateKey(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value || '')
  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function groupSearchEntries(entries) {
  const groups = new Map()
  entries.forEach((entry) => {
    const dateKey = toLocalDateKey(entry.occurredAt)
    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        id: `search-day-${dateKey}`,
        occurredAt: entry.occurredAt,
        entries: []
      })
    }
    groups.get(dateKey).entries.push(entry)
  })
  return [...groups.values()]
}

async function loadEntries(query) {
  const result = await listLedgerEntries(query)
  if (!query.keyword) return result
  return {
    ...result,
    items: groupSearchEntries(result.items)
  }
}

function reload() {
  tableRef.value?.reload?.()
}

function refresh() {
  tableRef.value?.refresh?.()
}

function clearSelection() {
  selectedKeys.value = []
  selectedRows.value = []
  tableRef.value?.clearSelection?.()
}

function getSelectedKeys() {
  return [...selectedKeys.value]
}

function getExportParams() {
  return { ...params.value }
}

function handleSelectionChange(keys, rows = []) {
  selectedKeys.value = keys
  selectedRows.value = rows
}

function handleKeywordInput() {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(applyKeywordSearch, 300)
}

function applyKeywordSearch() {
  clearTimeout(keywordTimer)
  const nextKeyword = filters.keyword.trim()
  if (nextKeyword === searchKeyword.value) {
    reload()
    return
  }
  searchKeyword.value = nextKeyword
  selectedKeys.value = []
}

function toggleAmountSort() {
  if (filters.sortField !== 'amount') {
    filters.sortField = 'amount'
    filters.sortOrder = 'asc'
  } else if (filters.sortOrder === 'asc') {
    filters.sortOrder = 'desc'
  } else {
    filters.sortField = ''
    filters.sortOrder = ''
  }
  reload()
}

function handleAction({ key }) {
  if (key === 'new-entry') emit('new-entry')
  if (key === 'batch-edit') emit('batch-edit', selectedKeys.value, selectedRows.value)
  if (key === 'export') emit('export')
}

onUnmounted(() => {
  clearTimeout(keywordTimer)
})

watch(
  () => [props.bookId, props.range?.[0], props.range?.[1], props.refreshKey],
  () => {
    // 查询范围变化时清掉旧选择，避免切换账本后误批量修改上一账本的流水。
    clearSelection()
    reload()
  }
)

defineExpose({ reload, refresh, clearSelection, getSelectedKeys, getExportParams })
</script>

<style scoped>
.ledger-filter {
  width: 140px;
}

.ledger-filter-book {
  width: 128px;
}

.ledger-filter-tags {
  width: 180px;
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
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.ledger-ellipsis-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.ledger-entry-table--search :deep(.ant-table-thead) {
  display: none;
}

.ledger-entry-table--search :deep(.ant-table-tbody > tr > td) {
  padding: 0;
  vertical-align: top;
}

.ledger-entry-table--search :deep(.ant-table-tbody > tr:hover > td) {
  background: transparent;
}

@media (max-width: 760px) {
  .ledger-filter,
  .ledger-filter-tags,
  .ledger-search {
    width: 100%;
  }

  .ledger-sort-button {
    flex: 1;
  }

  :deep(.ant-space) {
    width: 100%;
  }

  :deep(.ant-space-item) {
    min-width: 0;
  }
}
</style>
