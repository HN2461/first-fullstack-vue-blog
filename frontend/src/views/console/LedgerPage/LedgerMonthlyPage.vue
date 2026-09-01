<template>
  <section class="ledger-monthly-page">
    <div class="ledger-monthly-header">
      <div class="ledger-monthly-header__title">
        <CalendarOutlined />
        <strong>月表格</strong>
      </div>
      <div class="ledger-monthly-stats">
        <div class="ledger-monthly-stat">
          <span>支出</span>
          <strong class="amount-expense">{{ formatMoney(monthTotals.expense) }}</strong>
        </div>
        <div class="ledger-monthly-stat">
          <span>收入</span>
          <strong class="amount-income">{{ formatMoney(monthTotals.income) }}</strong>
        </div>
        <div class="ledger-monthly-stat">
          <span>结余</span>
          <strong :class="monthTotals.balance >= 0 ? 'amount-income' : 'amount-expense'">
            {{ formatMoney(monthTotals.balance) }}
          </strong>
        </div>
        <div class="ledger-monthly-stat ledger-monthly-stat--plain">
          <span>记录</span>
          <strong>{{ recordedDays }} / {{ daysInSelectedMonth }} 天</strong>
        </div>
      </div>
      <div class="ledger-monthly-header__controls">
        <a-tooltip title="上一个月">
          <a-button type="text" shape="circle" aria-label="上一个月" @click="shiftMonth(-1)">
            <template #icon><LeftOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-select
          :value="bookId"
          class="ledger-inline-book-select"
          :options="[{ label: '全部账本', value: 'all' }, ...bookOptions]"
          show-search
          option-filter-prop="label"
          @change="$emit('update-book-id', $event)"
        />
        <a-date-picker
          v-model:value="selectedMonth"
          picker="month"
          format="YYYY年MM月"
          value-format="YYYY-MM"
          :allow-clear="false"
          aria-label="选择月份"
        />
        <a-tooltip title="下一个月">
          <a-button type="text" shape="circle" aria-label="下一个月" @click="shiftMonth(1)">
            <template #icon><RightOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-button v-if="selectedMonth !== currentMonth" type="link" @click="selectedMonth = currentMonth">
          回到本月
        </a-button>
      </div>
    </div>

    <BlogTable
      v-if="!appStore.isMobile"
      ref="tableRef"
      :api-fn="loadMonth"
      :columns="columns"
      :params="params"
      :row-key="'date'"
      :scroll="{ x: tableWidth }"
      height="auto"
      hide-pagination
      show-column-setting
      striped
      column-border
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'date'">
          <div class="ledger-monthly-date">
            <strong>{{ record.date.slice(5) }}</strong>
            <small>{{ weekdayOf(record.date) }}</small>
          </div>
        </template>
        <template v-else-if="column.key?.startsWith('category:')">
          <LedgerTextTooltip
            v-if="getCategoryNote(record, column.categoryId)"
            :text="formatOptionalMoney(record.categoryAmounts?.[column.categoryId])"
            :tooltip-text="getCategoryNote(record, column.categoryId)"
            :text-class="['ledger-category-amount', amountClass(column.categoryType)]"
          />
          <span v-else :class="['ledger-category-amount', amountClass(column.categoryType)]">
            {{ formatOptionalMoney(record.categoryAmounts?.[column.categoryId]) }}
          </span>
        </template>
        <template v-else-if="['expense', 'income', 'balance'].includes(column.key)">
          <strong :class="column.key === 'income' || (column.key === 'balance' && record.balance >= 0) ? 'amount-income' : 'amount-expense'">
            {{ formatMoney(record[column.key]) }}
          </strong>
        </template>
        <template v-else-if="column.key === 'dailyNote'">
          <LedgerTextTooltip
            v-if="record.dailyNote"
            :text="record.dailyNote"
            text-class="ledger-monthly-note"
          />
          <span v-else class="ledger-monthly-empty">-</span>
        </template>
      </template>
    </BlogTable>

    <section v-else class="ledger-monthly-card-panel">
      <LedgerDailyCards
        :items="monthRows"
        :categories="displayCategories"
        :total="monthRows.length"
        :page-size="daysInSelectedMonth"
      />
    </section>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { getLedgerDaily } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'
import LedgerDailyCards from './LedgerDailyCards.vue'
import LedgerTextTooltip from './LedgerTextTooltip.vue'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  bookId: { type: String, default: '' },
  bookOptions: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

defineEmits(['update-book-id'])

const appStore = useAppStore()
const tableRef = ref(null)
const monthRows = ref([])
const now = new Date()
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const selectedMonth = ref(currentMonth)
const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const visibleCategories = computed(() => (props.bookId === 'all' ? [] : props.categories.filter((item) => !item.archived)))
const displayCategories = computed(() => visibleCategories.value)
const monthRange = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return [`${selectedMonth.value}-01`, `${selectedMonth.value}-${String(lastDay).padStart(2, '0')}`]
})
const daysInSelectedMonth = computed(() => new Date(Number(selectedMonth.value.slice(0, 4)), Number(selectedMonth.value.slice(5, 7)), 0).getDate())
const monthLabel = computed(() => `${selectedMonth.value.replace('-', '年')}月`)
const params = computed(() => ({
  bookId: props.bookId || undefined,
  from: monthRange.value[0],
  to: monthRange.value[1],
  refreshKey: props.refreshKey
}))
const recordedDays = computed(() => monthRows.value.filter((item) => item.entries?.length).length)
const monthTotals = computed(() => monthRows.value.reduce((totals, item) => ({
  expense: totals.expense + Number(item.expense || 0),
  income: totals.income + Number(item.income || 0),
  balance: totals.balance + Number(item.balance || 0)
}), { expense: 0, income: 0, balance: 0 }))
const columns = computed(() => [
  { title: '日期', key: 'date', width: 100, align: 'center', fixed: 'left' },
  ...visibleCategories.value.map((item) => ({
    title: item.name,
    key: `category:${item.id}`,
    categoryId: item.id,
    categoryType: item.type,
    width: 110,
    align: 'center',
    customCell: (record) => ({ class: getCategoryNote(record, item.id) ? 'ledger-category-note-cell' : '' })
  })),
  { title: '支出合计', key: 'expense', width: 120, align: 'center' },
  { title: '收入合计', key: 'income', width: 120, align: 'center' },
  { title: '结余', key: 'balance', width: 120, align: 'center' },
  { title: '当日备注', key: 'dailyNote', width: 360, align: 'center', fixed: 'right' }
])
const tableWidth = computed(() => Math.max(1200, 570 + visibleCategories.value.length * 110))

function createEmptyDay(date) {
  return { date, expense: 0, income: 0, balance: 0, dailyNote: '', categoryAmounts: {}, categoryNotes: {}, entries: [] }
}

function buildMonthRows(items = []) {
  const itemMap = new Map(items.map((item) => [item.date, item]))
  return Array.from({ length: daysInSelectedMonth.value }, (_, index) => {
    const date = `${selectedMonth.value}-${String(index + 1).padStart(2, '0')}`
    return itemMap.get(date) || createEmptyDay(date)
  })
}

async function loadMonth() {
  if (!props.bookId) {
    monthRows.value = []
    return { items: [], total: 0, page: 1, pageSize: daysInSelectedMonth.value }
  }
  const result = await getLedgerDaily(params.value)
  monthRows.value = buildMonthRows(result.items || [])
  return { items: monthRows.value, total: monthRows.value.length, page: 1, pageSize: monthRows.value.length }
}

watch(
  [() => props.bookId, selectedMonth, () => props.refreshKey, () => appStore.isMobile],
  () => {
    if (appStore.isMobile) loadMonth()
  },
  { immediate: true }
)

function shiftMonth(offset) {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const next = new Date(year, month - 1 + offset, 1)
  selectedMonth.value = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

function weekdayOf(dateStr) {
  return weekdayNames[new Date(`${dateStr}T00:00:00`).getDay()] || ''
}

function formatOptionalMoney(value) {
  const amount = Number(value)
  return Number.isFinite(amount) && amount !== 0 ? formatMoney(amount) : '-'
}

function amountClass(type) {
  return type === 'income' ? 'amount-income' : 'amount-expense'
}

function getCategoryNote(record, categoryId) {
  return record.categoryNotes?.[categoryId] || ''
}
</script>

<style scoped>
.ledger-monthly-page { min-width: 0; display: grid; gap: 8px; }
.ledger-monthly-header {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 5px 10px;
  background: var(--console-surface);
}
.ledger-monthly-header { justify-content: space-between; flex-wrap: wrap; }
.ledger-monthly-header__title,
.ledger-monthly-header__controls { display: flex; align-items: center; gap: 8px; }
.ledger-monthly-header__title { color: var(--console-text-secondary); }
.ledger-monthly-header__title strong { color: var(--console-text); font-size: 15px; }
.ledger-monthly-header__controls { flex-shrink: 0; }
.ledger-monthly-stats { display: flex; align-items: center; gap: 0; min-width: 0; flex: 1; }
.ledger-monthly-stat { display: flex; align-items: baseline; gap: 6px; min-width: 0; padding: 0 12px; border-right: 1px solid var(--console-border); }
.ledger-monthly-stat:first-child { padding-left: 0; }
.ledger-monthly-stat:last-child { border-right: 0; padding-right: 0; }
.ledger-monthly-stat span { color: var(--console-text-secondary); font-size: 11px; }
.ledger-monthly-stat strong { font-size: 14px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.ledger-monthly-stat--plain strong { color: var(--console-text); }
.ledger-table-title { color: var(--console-text); font-size: 13px; font-weight: 600; white-space: nowrap; }
.ledger-toolbar-spacer { flex: 1; }
.ledger-monthly-toolbar-note { color: var(--console-text-secondary); font-size: 12px; }
.ledger-monthly-card-panel {
  min-width: 0;
  display: grid;
  gap: 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 10px;
  background: var(--console-surface);
}
.ledger-monthly-card-panel__head {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
  flex-wrap: wrap;
}

.ledger-inline-book-select {
  width: 138px;
  flex: 0 0 auto;
}
.ledger-monthly-date { display: grid; gap: 2px; justify-items: center; }
.ledger-monthly-date strong { color: var(--console-text); font-variant-numeric: tabular-nums; }
.ledger-monthly-date small { color: var(--console-text-secondary); font-size: 11px; }
.ledger-category-amount { display: inline-block; max-width: 100%; font-weight: 600; }
.ledger-monthly-note { display: inline-block; max-width: 330px; color: var(--console-text-secondary); font-size: 12px; white-space: normal; text-align: left; line-height: 1.5; }
.ledger-monthly-empty { color: var(--console-text-secondary); }
.amount-income { color: var(--color-success, #16a34a); }
.amount-expense { color: var(--color-error, #dc2626); }
:deep(.ledger-category-note-cell) { position: relative; }
:deep(.ledger-category-note-cell)::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 0; border-top: 9px solid var(--color-warning, #f59e0b); border-left: 9px solid transparent; pointer-events: none; }
@media (max-width: 760px) {
  .ledger-monthly-header { align-items: flex-start; }
  .ledger-monthly-stats { order: 3; flex-basis: 100%; overflow-x: auto; padding: 4px 0 2px; border-top: 1px solid var(--console-border); }
  .ledger-monthly-stat { flex: 1 0 auto; }
}

@media (pointer: coarse) and (max-width: 1024px) {
  .ledger-monthly-header {
    align-items: stretch;
    padding: 8px;
  }

  .ledger-monthly-header__title,
  .ledger-monthly-header__controls {
    min-width: 0;
  }

  .ledger-monthly-header__controls {
    width: 100%;
    justify-content: space-between;
  }

  .ledger-monthly-header__controls .ant-picker {
    min-width: 0;
    flex: 1;
  }

  .ledger-monthly-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    width: 100%;
    padding: 8px 0 0;
    border-top: 1px solid var(--console-border);
  }

  .ledger-monthly-stat,
  .ledger-monthly-stat:first-child,
  .ledger-monthly-stat:last-child {
    min-width: 0;
    justify-content: space-between;
    padding: 6px 8px;
    border: 1px solid var(--console-border);
    border-radius: 6px;
    background: var(--console-surface-muted);
  }

  .ledger-monthly-stat strong {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ledger-monthly-card-panel__head .ledger-monthly-toolbar-note {
    margin-left: auto;
  }
}
</style>
