<template>
  <section class="ledger-page">
    <LedgerPageToolbar
      v-if="isOverviewRoute"
      :book-id="selectedBookId"
      :book-options="bookOptions"
      :period="activePeriod"
      :range="queryRange"
      :period-options="periodOptions"
      @update:book-id="handleBookChange"
      @update:period="selectPeriod"
      @update:range="handleCustomRangeChange"
      @reload="reloadAll"
      @action="handleMenuAction"
    />

    <RouterView
      :book-id="selectedBookId"
      :categories="categories"
      :range="contentRange"
      :period="activePeriod"
      :refresh-key="refreshKey"
      @edit-entry="openEntryModal"
      @delete-entry="confirmDeleteEntry"
      @edit-category="openCategoryModal"
      @open-entry-modal="openEntryModal"
      @reload="reloadAll"
    />

    <LedgerEntryModal
      v-model:open="entryModalOpen"
      :book-id="selectedBookId"
      :entry="currentEntry"
      :categories="categories"
      @saved="reloadAll"
    />

    <LedgerCategoryModal
      v-model:open="categoryModalOpen"
      :book-id="selectedBookId"
      :category="currentCategory"
      @saved="reloadCategoriesAndSummary"
    />

    <LedgerImportModal
      v-model:open="importModalOpen"
      :book-id="selectedBookId"
      @imported="reloadAll"
    />

    <LedgerCategoryDrawer
      v-model:open="categoryDrawerOpen"
      :categories="categories"
      @edit="openCategoryModal"
    />

    <a-modal
      v-model:open="importRecordsOpen"
      title="导入记录"
      :footer="null"
      width="920px"
      :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
      destroy-on-close
    >
      <LedgerImportTable :book-id="selectedBookId" :refresh-key="refreshKey" />
    </a-modal>

    <a-modal
      v-model:open="exportModalOpen"
      title="导出图表"
      :width="520"
      :confirm-loading="exporting"
      ok-text="导出"
      cancel-text="取消"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
      @ok="exportAnalysis"
    >
      <a-form layout="vertical">
        <a-form-item label="导出范围">
          <a-radio-group v-model:value="exportForm.scope">
            <a-radio value="current">当前图表范围</a-radio>
            <a-radio value="custom">自定义时间范围</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="exportForm.scope === 'custom'" label="时间范围">
          <a-range-picker
            v-model:value="exportForm.range"
            class="ledger-export-range"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item label="导出格式">
          <a-radio-group v-model:value="exportForm.format">
            <a-radio value="json">JSON</a-radio>
            <a-radio value="csv">CSV</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-alert
          type="info"
          show-icon
          message="导出会包含核心指标、趋势数据、分类排行、每日走势和生活洞察。"
        />
      </a-form>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import LedgerCategoryDrawer from './LedgerCategoryDrawer.vue'
import LedgerCategoryModal from './LedgerCategoryModal.vue'
import LedgerEntryModal from './LedgerEntryModal.vue'
import LedgerImportModal from './LedgerImportModal.vue'
import LedgerImportTable from './LedgerImportTable.vue'
import LedgerPageToolbar from './LedgerPageToolbar.vue'
import {
  deleteLedgerEntry,
  getLedgerInsights,
  getLedgerSummary,
  listLedgerBooks,
  listLedgerCategories
} from '@/services/ledger'

const loading = ref(false)
const route = useRoute()
const books = ref([])
const categories = ref([])
const selectedBookId = ref('')
const activePeriod = ref('thisMonth')
const customRange = ref([])
const refreshKey = ref(0)
const entryModalOpen = ref(false)
const categoryModalOpen = ref(false)
const importModalOpen = ref(false)
const importRecordsOpen = ref(false)
const exportModalOpen = ref(false)
const exporting = ref(false)
const categoryDrawerOpen = ref(false)
const currentEntry = ref(null)
const currentCategory = ref(null)
const exportForm = reactive({
  scope: 'current',
  range: [],
  format: 'json'
})

const periodOptions = [
  { label: '本月', value: 'thisMonth', tip: '查看本月账本汇总' },
  { label: '上月', value: 'lastMonth', tip: '查看上月账本汇总' },
  { label: '本季', value: 'thisQuarter', tip: '查看本季度账本汇总' },
  { label: '本年', value: 'thisYear', tip: '查看本年账本汇总' },
  { label: '自定义', value: 'custom', tip: '选择自定义日期区间' },
  { label: '全部', value: 'all', tip: '查看全部账本数据' }
]

const bookOptions = computed(() => books.value.map((book) => ({
  label: book.name,
  value: book.id
})))
const isOverviewRoute = computed(() => route.name === 'ConsoleLedgerOverview')
const contentRange = computed(() => isOverviewRoute.value ? queryRange.value : [])

/** 根据快速时间段计算日期范围 */
const queryRange = computed(() => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  switch (activePeriod.value) {
    case 'thisMonth':
      return [fmt(new Date(now.getFullYear(), now.getMonth(), 1)), fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0))]
    case 'lastMonth':
      return [fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1)), fmt(new Date(now.getFullYear(), now.getMonth(), 0))]
    case 'thisQuarter': {
      const qStart = Math.floor(now.getMonth() / 3) * 3
      return [fmt(new Date(now.getFullYear(), qStart, 1)), fmt(now)]
    }
    case 'thisYear':
      return [fmt(new Date(now.getFullYear(), 0, 1)), fmt(new Date(now.getFullYear(), 11, 31))]
    case 'custom':
      return customRange.value?.length === 2 ? customRange.value : ['', '']
    case 'all':
      return ['', '']
    default:
      return ['', '']
  }
})

function selectPeriod(value) {
  const previousRange = queryRange.value
  activePeriod.value = value
  if (value === 'custom' && customRange.value.length !== 2) {
    customRange.value = [previousRange[0] || '', previousRange[1] || ''].filter(Boolean)
  }
  reloadAll()
}

function handleBookChange(value) {
  selectedBookId.value = value
  reloadAll()
}

function handleCustomRangeChange(value) {
  customRange.value = value?.length === 2 ? value : []
  reloadAll()
}

async function loadBooks() {
  books.value = await listLedgerBooks()
  if (!selectedBookId.value && books.value.length) {
    selectedBookId.value = books.value[0].id
  }
}

async function loadCategories() {
  if (!selectedBookId.value) {
    categories.value = []
    return
  }
  categories.value = await listLedgerCategories({ bookId: selectedBookId.value })
}

async function reloadCategoriesAndSummary() {
  await loadCategories()
  refreshKey.value += 1
}

async function reloadAll() {
  loading.value = true
  try {
    await loadCategories()
    refreshKey.value += 1
  } catch (error) {
    message.error(error.message || '账本数据加载失败')
  } finally {
    loading.value = false
  }
}

function openEntryModal(entry = null) {
  currentEntry.value = entry
  entryModalOpen.value = true
}

function openCategoryModal(category = null) {
  currentCategory.value = category
  categoryModalOpen.value = true
}

function handleMenuAction(key) {
  if (key === 'categories') categoryDrawerOpen.value = true
  else if (key === 'newCategory') openCategoryModal()
  else if (key === 'importRecords') importRecordsOpen.value = true
  else if (key === 'importExcel') importModalOpen.value = true
  else if (key === 'exportAnalysis') {
    exportForm.scope = 'current'
    exportForm.range = [...queryRange.value].filter(Boolean)
    exportModalOpen.value = true
  }
}

function downloadFile(content, fileName, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function toCsvRows(summary, insights) {
  const rows = [
    ['模块', '名称', '值'],
    ['核心指标', '收入', summary.overview?.income || 0],
    ['核心指标', '支出', summary.overview?.expense || 0],
    ['核心指标', '结余', summary.overview?.balance || 0],
    ...((summary.byCategory || []).map((item) => ['支出分类', item.name, item.amount])),
    ...((summary.byIncomeCategory || []).map((item) => ['收入分类', item.name, item.amount])),
    ...((summary.trend || []).map((item) => ['趋势', item.label, `收入:${item.income};支出:${item.expense};结余:${item.balance}`])),
    ...((insights.insights || []).map((item) => ['生活洞察', item.icon, item.text]))
  ]
  return rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
}

async function exportAnalysis() {
  const range = exportForm.scope === 'custom' ? exportForm.range : queryRange.value
  if (exportForm.scope === 'custom' && range.length !== 2) {
    message.warning('请选择导出时间范围')
    return
  }
  exporting.value = true
  try {
    const [from, to] = range || []
    const params = {
      bookId: selectedBookId.value,
      from: from || undefined,
      to: to || undefined,
      groupBy: from && to && new Date(to) - new Date(from) <= 31 * 86400000 ? 'day' : 'month'
    }
    const [summary, insights] = await Promise.all([
      getLedgerSummary(params),
      getLedgerInsights(params)
    ])
    const stamp = new Date().toISOString().slice(0, 10)
    if (exportForm.format === 'csv') {
      downloadFile(`${String.fromCharCode(0xfeff)}${toCsvRows(summary, insights)}`, `ledger-analysis-${stamp}.csv`, 'text/csv;charset=utf-8')
    } else {
      downloadFile(JSON.stringify({ range: { from: from || '', to: to || '' }, summary, insights }, null, 2), `ledger-analysis-${stamp}.json`, 'application/json;charset=utf-8')
    }
    exportModalOpen.value = false
    message.success('图表数据已导出')
  } catch (error) {
    message.error(error.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

function confirmDeleteEntry(entry) {
  let loading = false
  Modal.confirm({
    title: '删除流水',
    content: `确定删除「${entry.category?.name || entry.categoryNameSnapshot} ${entry.amount}」吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    okButtonProps: { loading },
    async onOk() {
      loading = true
      try {
        await deleteLedgerEntry(entry.id)
        message.success('流水已删除')
        await reloadAll()
      } catch (error) {
        message.error(error.message || '删除失败')
      } finally {
        loading = false
      }
    }
  })
}

onMounted(async () => {
  loading.value = true
  try {
    await loadBooks()
    await reloadAll()
  } catch (error) {
    message.error(error.message || '账本数据加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.ledger-page {
  display: grid;
  gap: 12px;
  min-width: 0;
}

/* ── 全局覆盖 ── */
.ledger-page :deep(.ant-table-selection-column) {
  width: 48px !important;
  min-width: 48px !important;
  max-width: 48px !important;
  padding-inline: 12px !important;
  text-align: center;
}

.ledger-page :deep(.ant-table-selection-column .ant-checkbox-wrapper),
.ledger-page :deep(.ant-table-selection-column .ant-checkbox) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ledger-page :deep(.ant-table-sticky-scroll) {
  background: var(--console-surface);
}

.ledger-page :deep(.ant-table-sticky-scroll-bar) {
  background-color: color-mix(in srgb, var(--console-text-secondary, #667085) 38%, transparent);
}

.ledger-export-range {
  width: 100%;
}
</style>
