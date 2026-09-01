<template>
  <article class="ledger-search-group">
    <header class="ledger-search-group__date">
      <strong>{{ formatDate(group.occurredAt) }}</strong>
      <span>{{ weekdayText }}</span>
      <small>{{ group.entries.length }} 笔流水</small>
    </header>

    <div class="ledger-search-group__content">
      <section v-if="dailyNotes.length" class="ledger-search-group__daily-note">
        <div class="ledger-search-group__section-label">
          <CalendarOutlined />
          <span>当日备注</span>
        </div>
        <div class="ledger-search-group__daily-note-list">
          <LedgerTextTooltip
            v-for="note in dailyNotes"
            :key="note"
            :text="note"
            text-class="ledger-search-group__full-text"
            search-mode
            :search-keyword="keyword"
          />
        </div>
      </section>

      <div class="ledger-search-group__entries">
        <div v-for="entry in group.entries" :key="entry.id" class="ledger-search-entry">
          <div class="ledger-search-entry__category">
            <a-tag :color="entry.category?.color || 'blue'" :bordered="false">
              {{ entry.category?.name || entry.categoryNameSnapshot || '-' }}
            </a-tag>
            <a-tag v-if="entry.book?.name" color="cyan" :bordered="false">{{ entry.book.name }}</a-tag>
            <span>{{ entry.type === 'income' ? '收入' : '支出' }}</span>
          </div>

          <strong :class="entry.type === 'income' ? 'amount-income' : 'amount-expense'">
            {{ formatMoney(entry.amount) }}
          </strong>

          <div class="ledger-search-entry__detail">
            <LedgerTextTooltip
              v-if="entry.note"
              :text="entry.note"
              text-class="ledger-search-group__full-text"
              search-mode
              :search-keyword="keyword"
            />
            <span v-else class="ledger-search-entry__empty-note">无单笔备注</span>
            <div v-if="entry.tags?.length" class="ledger-search-entry__tags">
              <a-tag v-for="tag in entry.tags" :key="tag" :bordered="false">{{ tag }}</a-tag>
            </div>
          </div>

          <div class="ledger-search-entry__actions">
            <a-tooltip title="编辑流水">
              <a-button type="text" aria-label="编辑流水" @click="$emit('edit', entry)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="删除流水">
              <a-button type="text" danger aria-label="删除流水" @click="$emit('delete', entry)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { CalendarOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import { formatMoney } from './ledgerChartOptions'
import { formatDate } from './ledgerUtils'
import LedgerTextTooltip from './LedgerTextTooltip.vue'

const props = defineProps({
  group: { type: Object, required: true },
  keyword: { type: String, default: '' }
})

defineEmits(['edit', 'delete'])

const dailyNotes = computed(() => [
  ...new Set(props.group.entries.map((entry) => String(entry.dailyNote || '').trim()).filter(Boolean))
])

const weekdayText = computed(() => {
  const date = new Date(props.group.occurredAt)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(date)
})
</script>

<style scoped>
.ledger-search-group {
  display: grid;
  grid-template-columns: 124px minmax(0, 1fr);
  min-width: 0;
  background: var(--console-surface, #fff);
}

.ledger-search-group__date {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 18px 16px;
  border-right: 1px solid var(--console-border, #f0f0f0);
  background: var(--console-surface-muted, #fafafa);
}

.ledger-search-group__date strong {
  color: var(--console-text);
  font-size: 15px;
  line-height: 1.4;
}

.ledger-search-group__date span,
.ledger-search-group__date small {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-search-group__content {
  min-width: 0;
}

.ledger-search-group__daily-note {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 8px 14px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--console-border, #f0f0f0);
  background: color-mix(in srgb, var(--console-primary, #1677ff) 5%, var(--console-surface, #fff));
}

.ledger-search-group__section-label {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
  padding-top: 2px;
  color: var(--console-primary, #1677ff);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.ledger-search-group__daily-note-list {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.ledger-search-group__entries {
  display: grid;
}

.ledger-search-entry {
  display: grid;
  grid-template-columns: 118px 110px minmax(220px, 1fr) 80px;
  align-items: start;
  min-width: 0;
  padding: 12px 12px 12px 16px;
  border-bottom: 1px solid var(--console-border, #f0f0f0);
}

.ledger-search-entry:last-child {
  border-bottom: 0;
}

.ledger-search-entry:hover {
  background: var(--console-surface-hover, rgba(0, 0, 0, 0.02));
}

.ledger-search-entry__category {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ledger-search-entry__category > span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-search-entry > strong {
  padding-top: 3px;
  font-variant-numeric: tabular-nums;
}

.ledger-search-entry__detail {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 1px 18px 1px 0;
}

.ledger-search-entry__empty-note {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-search-entry__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ledger-search-entry__actions {
  display: flex;
  justify-content: flex-end;
}

.ledger-search-group :deep(.ledger-search-group__full-text) {
  color: var(--console-text);
  font-size: 13px;
}

.amount-income {
  color: var(--color-success, #16a34a);
}

.amount-expense {
  color: var(--color-error, #dc2626);
}

@media (max-width: 760px) {
  .ledger-search-group {
    grid-template-columns: 1fr;
  }

  .ledger-search-group__date {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    border-right: 0;
    border-bottom: 1px solid var(--console-border, #f0f0f0);
  }

  .ledger-search-group__date small {
    margin-left: auto;
  }

  .ledger-search-group__daily-note {
    grid-template-columns: 1fr;
    padding: 12px 14px;
  }

  .ledger-search-entry {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 12px;
    padding: 12px 14px;
  }

  .ledger-search-entry__detail {
    grid-column: 1 / -1;
    grid-row: 2;
    padding-right: 0;
  }

  .ledger-search-entry__actions {
    grid-column: 1 / -1;
    grid-row: 3;
    justify-content: flex-start;
  }
}
</style>
