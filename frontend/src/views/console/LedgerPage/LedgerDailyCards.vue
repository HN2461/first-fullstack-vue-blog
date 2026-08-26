<template>
  <div class="ledger-daily-cards">
    <div v-if="!items.length" class="ledger-cards-empty">
      <a-empty description="暂无记录" />
    </div>
    <div v-else class="ledger-cards-grid">
      <div v-for="day in items" :key="day.date" class="ledger-day-card">
        <div class="ledger-day-card__header">
          <strong class="ledger-day-card__date">{{ day.date }}</strong>
          <span class="ledger-day-card__weekday">{{ weekdayOf(day.date) }}</span>
          <span class="ledger-day-card__totals">
            <span class="ledger-day-expense">-{{ formatMoney(day.expense) }}</span>
            <span v-if="day.income" class="ledger-day-income">+{{ formatMoney(day.income) }}</span>
          </span>
        </div>

        <!-- 分类标签 -->
        <div v-if="hasAmounts(day)" class="ledger-day-card__categories">
          <span
            v-for="cat in categoryList(day)"
            :key="cat.id"
            class="ledger-day-cat-tag"
            :style="{ borderColor: cat.color, color: cat.color }"
          >
            <LedgerTextTooltip
              v-if="cat.note"
              :text="`${cat.name} ${formatMoney(cat.amount)}`"
              :tooltip-text="cat.note"
              text-class="ledger-day-cat-tag__text"
            />
            <span v-else class="ledger-day-cat-tag__text">{{ cat.name }} {{ formatMoney(cat.amount) }}</span>
            <span v-if="cat.note" class="ledger-day-cat-tag__marker" />
          </span>
        </div>

        <!-- 当日备注 -->
        <p v-if="day.dailyNote" class="ledger-day-card__note">
          <LedgerTextTooltip :text="day.dailyNote" text-class="ledger-day-card__note-text" />
        </p>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="ledger-cards-pagination">
      <a-pagination
        v-model:current="currentPage"
        :page-size="pageSize"
        :total="total"
        size="small"
        show-less-items
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formatMoney } from './ledgerChartOptions'
import LedgerTextTooltip from './LedgerTextTooltip.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 31 }
})

const emit = defineEmits(['page-change'])

const currentPage = ref(1)

const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function weekdayOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return weekdayNames[d.getDay()] || ''
}

function hasAmounts(day) {
  return day.categoryAmounts && Object.values(day.categoryAmounts).some((v) => v > 0)
}

function categoryList(day) {
  const amounts = day.categoryAmounts || {}
  const notes = day.categoryNotes || {}
  return props.categories
    .filter((cat) => amounts[cat.id] > 0)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color || '#1677ff',
      amount: amounts[cat.id],
      note: notes[cat.id] || ''
    }))
}

function handlePageChange(page) {
  emit('page-change', page)
}

watch(() => props.items, () => {
  // 数据变化时保持当前页
})
</script>

<style scoped>
.ledger-daily-cards {
  min-width: 0;
}

.ledger-cards-empty {
  padding: 40px 0;
}

.ledger-cards-grid {
  display: grid;
  /* min() prevents the card's desktop minimum from forcing horizontal overflow on narrow devices. */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: 12px;
}

.ledger-day-card {
  min-width: 0;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  padding: 14px 16px;
  transition: border-color 0.2s;
}

.ledger-day-card:hover {
  border-color: var(--console-primary, #1677ff);
}

.ledger-day-card__header {
  display: flex;
  align-items: baseline;
  min-width: 0;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.ledger-day-card__date {
  font-size: 14px;
  color: var(--console-text);
}

.ledger-day-card__weekday {
  font-size: 12px;
  color: var(--console-text-secondary);
}

.ledger-day-card__totals {
  margin-left: auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
}

.ledger-day-expense {
  color: var(--color-error, #dc2626);
}

.ledger-day-income {
  color: var(--color-success, #16a34a);
}

.ledger-day-card__categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.ledger-day-cat-tag {
  min-width: 0;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 12px;
  background: transparent;
  gap: 4px;
}

.ledger-day-cat-tag__marker {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.8;
  flex-shrink: 0;
}

.ledger-day-cat-tag__text {
  display: inline-block;
  min-width: 0;
  max-width: min(180px, 100%);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.ledger-day-card__note {
  min-width: 0;
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--console-text-secondary);
  line-height: 1.5;
}

:deep(.ledger-day-card__note-text) {
  display: block;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
}

.ledger-cards-pagination {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

@media (max-width: 760px), (pointer: coarse) and (max-width: 1024px) {
  .ledger-cards-grid {
    grid-template-columns: 1fr;
  }

  .ledger-day-card {
    padding: 12px;
  }

  .ledger-day-card__totals {
    width: 100%;
    margin-left: 0;
    gap: 8px;
  }
}
</style>
