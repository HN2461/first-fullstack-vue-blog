<template>
  <a-modal
    :open="open"
    :title="title"
    :footer="null"
    width="600px"
    destroy-on-close
    @cancel="$emit('update:open', false)"
  >
    <a-spin :spinning="loading">
      <div v-if="!loading && !entries.length" class="weekday-empty">
        这几天没有消费记录
      </div>
      <div v-else class="weekday-entries">
        <div v-for="day in groupedDays" :key="day.date" class="weekday-day-group">
          <div class="weekday-day-header">
            <span class="weekday-day-label">{{ day.label }}</span>
            <span class="weekday-day-total">合计 {{ formatMoney(day.total) }}</span>
          </div>
          <div v-for="entry in day.entries" :key="entry.id" class="weekday-entry">
            <span class="weekday-entry-category" :style="{ background: entry.category?.color || '#ccc' }">
              {{ entry.category?.name || entry.categoryNameSnapshot }}
            </span>
            <span class="weekday-entry-note">{{ entry.note || '-' }}</span>
            <span class="weekday-entry-amount">{{ formatMoney(entry.amount) }}</span>
          </div>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { listLedgerEntries } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'

const props = defineProps({
  open: { type: Boolean, default: false },
  bookId: { type: String, default: '' },
  weekday: { type: String, default: '' },
  from: { type: String, default: '' },
  to: { type: String, default: '' }
})

const emit = defineEmits(['update:open'])

const loading = ref(false)
const entries = ref([])

const weekdayIndex = { '周日': 0, '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6 }

const title = computed(() => `${props.weekday}的消费明细`)

function formatLocalDay(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (num) => String(num).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 计算范围内该星期几的所有日期 */
const targetDates = computed(() => {
  if (!props.from || !props.to || !props.weekday) return []
  const target = weekdayIndex[props.weekday]
  if (target === undefined) return []
  const dates = []
  const d = new Date(props.from)
  const end = new Date(props.to)
  while (d <= end) {
    if (d.getDay() === target) {
      dates.push(formatLocalDay(d))
    }
    d.setDate(d.getDate() + 1)
  }
  return dates
})

/** 按日期分组 */
const groupedDays = computed(() => {
  const map = new Map()
  for (const entry of entries.value) {
    const date = formatLocalDay(entry.occurredAt)
    if (!map.has(date)) map.set(date, { date, entries: [], total: 0 })
    const g = map.get(date)
    g.entries.push(entry)
    g.total += Number(entry.amount) || 0
  }
  return [...map.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((g) => {
      const d = new Date(g.date)
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      g.label = `${g.date} ${weekdays[d.getDay()]}`
      return g
    })
})

async function loadEntries() {
  if (!targetDates.value.length) return
  loading.value = true
  try {
    // 后端单页最多 100 条，星期详情需要翻页拉完当前范围，避免高频记账时漏数据。
    const pageSize = 100
    let page = 1
    let total = 0
    const all = []
    do {
      const result = await listLedgerEntries({
        bookId: props.bookId,
        from: props.from,
        to: props.to,
        type: 'expense',
        page,
        pageSize
      })
      all.push(...(result?.items || []))
      total = result?.total || all.length
      page += 1
    } while (all.length < total)
    const targetSet = new Set(targetDates.value)
    entries.value = all.filter((e) => {
      const date = formatLocalDay(e.occurredAt)
      return targetSet.has(date)
    })
  } catch (err) {
    console.error('WeekdayDetailModal loadEntries error:', err)
    entries.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.open, (val) => {
  if (val) {
    entries.value = []
    // 等待 props 更新后再加载，确保 from/to 已同步到子组件
    nextTick(() => loadEntries())
  }
})
</script>

<style scoped>
.weekday-empty {
  text-align: center; padding: 32px; color: var(--console-text-secondary); font-size: 13px;
}
.weekday-entries { display: grid; gap: 12px; max-height: 400px; overflow-y: auto; }
.weekday-day-group { border: 1px solid var(--console-border); border-radius: 6px; overflow: hidden; }
.weekday-day-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; background: color-mix(in srgb, var(--console-surface) 80%, var(--console-border));
  font-size: 12px;
}
.weekday-day-label { font-weight: 600; color: var(--console-text); }
.weekday-day-total { color: var(--console-text-secondary); }
.weekday-entry {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px;
  padding: 8px 12px; border-top: 1px solid var(--console-border); font-size: 12px;
}
.weekday-entry-category {
  padding: 1px 8px; border-radius: 4px; color: #fff; font-size: 11px; white-space: nowrap;
}
.weekday-entry-note { color: var(--console-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.weekday-entry-amount { font-weight: 600; color: var(--console-text); white-space: nowrap; }
</style>
