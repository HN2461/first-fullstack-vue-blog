<template>
  <section class="ledger-daily-page">
    <BlogTable
      v-if="viewMode === 'matrix'"
      ref="tableRef"
      :api-fn="loadDaily"
      :columns="columns"
      :params="params"
      :page-size="50"
      :page-sizes="['31', '50', '100']"
      :scroll="{ x: tableWidth }"
      height="auto"
      show-column-setting
      striped
      column-border
    >
      <template #toolbar>
        <span class="ledger-table-title">日表格</span>
        <span class="ledger-toolbar-spacer" />
        <a-tooltip title="切换日表格展示方式">
          <a-radio-group v-model:value="viewMode" size="small" button-style="solid">
            <a-radio-button value="matrix">
              <TableOutlined />
            </a-radio-button>
            <a-radio-button value="cards">
              <AppstoreOutlined />
            </a-radio-button>
          </a-radio-group>
        </a-tooltip>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'date'">
          <strong class="ledger-daily-date">{{ record.date }}</strong>
        </template>
        <template v-else-if="column.key?.startsWith('category:')">
          <a-tooltip v-if="getCategoryNote(record, column.categoryId)" :title="getCategoryNote(record, column.categoryId)">
            <span :class="[amountClass(column.categoryType), 'ledger-amount-with-note']">
              {{ formatOptionalMoney(record.categoryAmounts?.[column.categoryId]) }}
            </span>
          </a-tooltip>
          <span v-else :class="amountClass(column.categoryType)">
            {{ formatOptionalMoney(record.categoryAmounts?.[column.categoryId]) }}
          </span>
        </template>
        <template v-else-if="['expense', 'income', 'balance'].includes(column.key)">
          <strong :class="column.key === 'income' || (column.key === 'balance' && record.balance >= 0) ? 'amount-income' : 'amount-expense'">
            {{ formatMoney(record[column.key]) }}
          </strong>
        </template>
        <template v-else-if="column.key === 'dailyNote'">
          <span class="ledger-daily-note">{{ record.dailyNote || '-' }}</span>
        </template>
      </template>
    </BlogTable>

    <section v-else class="ledger-daily-card-panel">
      <div class="ledger-daily-card-panel__head">
        <span class="ledger-table-title">日表格</span>
        <span class="ledger-toolbar-spacer" />
        <a-tooltip title="切换日表格展示方式">
          <a-radio-group v-model:value="viewMode" size="small" button-style="solid">
            <a-radio-button value="matrix">
              <TableOutlined />
            </a-radio-button>
            <a-radio-button value="cards">
              <AppstoreOutlined />
            </a-radio-button>
          </a-radio-group>
        </a-tooltip>
      </div>
      <LedgerDailyCards
        :items="cardItems"
        :categories="categories"
        :total="cardTotal"
        :page-size="cardPageSize"
        @page-change="handleCardPageChange"
      />
    </section>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { AppstoreOutlined, TableOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { getLedgerDaily } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'
import LedgerDailyCards from './LedgerDailyCards.vue'

const props = defineProps({
  bookId: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  range: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

const tableRef = ref(null)
const viewMode = ref('matrix')

// 卡片视图分页状态
const allCardItems = ref([])
const cardPage = ref(1)
const cardPageSize = ref(31)

const visibleCategories = computed(() => props.categories.filter((item) => !item.archived))
const columns = computed(() => [
  { title: '日期', key: 'date', width: 130, align: 'center', fixed: 'left' },
  ...visibleCategories.value.map((item) => ({
    title: item.name,
    key: `category:${item.id}`,
    categoryId: item.id,
    categoryType: item.type,
    width: 110,
    align: 'center'
  })),
  { title: '支出合计', key: 'expense', width: 120, align: 'center' },
  { title: '收入合计', key: 'income', width: 120, align: 'center' },
  { title: '结余', key: 'balance', width: 120, align: 'center' },
  { title: '当日备注', key: 'dailyNote', width: 340, align: 'center', fixed: 'right' }
])
const tableWidth = computed(() => Math.max(1200, 600 + visibleCategories.value.length * 110))
const params = computed(() => ({
  bookId: props.bookId || undefined,
  from: props.range?.[0] || undefined,
  to: props.range?.[1] || undefined
}))

// 卡片分页数据
const cardTotal = computed(() => allCardItems.value.length)
const cardItems = computed(() => {
  const start = (cardPage.value - 1) * cardPageSize.value
  return allCardItems.value.slice(start, start + cardPageSize.value)
})

async function loadDaily() {
  if (!props.bookId) {
    return { items: [], total: 0, page: 1, pageSize: 50 }
  }
  const result = await getLedgerDaily(params.value)
  const items = [...(result.items || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  return {
    items,
    total: items.length,
    page: 1,
    pageSize: items.length || 50
  }
}

async function loadCardData() {
  if (!props.bookId) {
    allCardItems.value = []
    return
  }
  const result = await getLedgerDaily(params.value)
  allCardItems.value = [...(result.items || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  cardPage.value = 1
}

function handleCardPageChange(page) {
  cardPage.value = page
}

function formatOptionalMoney(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount === 0) return '-'
  return formatMoney(amount)
}

function amountClass(type) {
  return type === 'income' ? 'amount-income' : 'amount-expense'
}

function getCategoryNote(record, categoryId) {
  return record.categoryNotes?.[categoryId] || ''
}

watch(
  () => [props.bookId, props.range?.[0], props.range?.[1], props.refreshKey],
  () => {
    if (viewMode.value === 'matrix') {
      tableRef.value?.reload?.()
    } else {
      loadCardData()
    }
  }
)

watch(viewMode, (mode) => {
  if (mode === 'cards') loadCardData()
})
</script>

<style scoped>
.ledger-daily-page {
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

.ledger-daily-card-panel {
  min-width: 0;
  display: grid;
  gap: 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  padding: 10px;
}

.ledger-daily-card-panel__head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ledger-daily-date {
  display: inline-flex;
  justify-content: center;
  width: 100%;
}

.ledger-daily-note {
  display: inline-block;
  max-width: 310px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.amount-income {
  color: var(--color-success, #16a34a);
}

.amount-expense {
  color: var(--color-error, #dc2626);
}

.ledger-amount-with-note {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-right: 10px;
  padding-top: 4px;
  font-weight: 600;
}

.ledger-amount-with-note::after {
  content: '';
  position: absolute;
  top: -1px;
  right: 0;
  width: 0;
  height: 0;
  border-top: 8px solid var(--color-error, #dc2626);
  border-left: 8px solid transparent;
  opacity: 0.82;
  pointer-events: none;
}
</style>
