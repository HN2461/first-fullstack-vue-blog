<template>
  <section class="ledger-daily-page">
    <BlogTable
      ref="tableRef"
      :api-fn="loadDaily"
      :columns="columns"
      :params="params"
      :page-size="50"
      :page-sizes="['31', '50', '100']"
      :scroll="{ x: tableWidth }"
      height="620px"
      show-column-setting
      striped
      column-border
    >
      <template #toolbar>
        <a-space wrap>
          <a-tag color="blue" :bordered="false">按天查看</a-tag>
          <span class="ledger-daily-tip">分类金额列保留原 Excel 习惯，单元格备注会在悬浮时展示。</span>
        </a-space>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'date'">
          <strong class="ledger-daily-date">{{ record.date }}</strong>
        </template>
        <template v-else-if="column.key?.startsWith('category:')">
          <a-tooltip v-if="getCategoryNote(record, column.categoryId)" :title="getCategoryNote(record, column.categoryId)">
            <span :class="amountClass(column.categoryType)">
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
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BlogTable from '@/components/BlogTable.vue'
import { getLedgerDaily } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'

const props = defineProps({
  bookId: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  range: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

const tableRef = ref(null)

const visibleCategories = computed(() => props.categories.filter((item) => !item.archived))
const columns = computed(() => [
  { title: '日期', key: 'date', width: 130, align: 'center' },
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
  { title: '当日备注', key: 'dailyNote', width: 340, align: 'center' }
])
const tableWidth = computed(() => Math.max(1200, 600 + visibleCategories.value.length * 110))
const params = computed(() => ({
  bookId: props.bookId || undefined,
  from: props.range?.[0] || undefined,
  to: props.range?.[1] || undefined
}))

async function loadDaily() {
  if (!props.bookId) {
    return { items: [], total: 0, page: 1, pageSize: 50 }
  }
  const result = await getLedgerDaily(params.value)
  return {
    items: result.items || [],
    total: result.items?.length || 0,
    page: 1,
    pageSize: result.items?.length || 50
  }
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
  () => tableRef.value?.reload?.()
)
</script>

<style scoped>
.ledger-daily-page {
  min-width: 0;
}

.ledger-daily-tip,
.ledger-daily-note {
  color: var(--console-text-secondary);
  font-size: 12px;
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
}

.amount-income {
  color: #16a34a;
}

.amount-expense {
  color: #dc2626;
}
</style>
