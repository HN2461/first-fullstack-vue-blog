<template>
  <a-spin :spinning="loading">
    <div class="ledger-moments-timeline">
      <a-empty v-if="!items.length && !loading" description="暂无重要记录" class="ledger-timeline-empty" />

      <ol v-else class="ledger-timeline-list">
        <li
          v-for="item in items"
          :key="item.id"
          :class="['ledger-timeline-item', { 'is-pinned': item.pinned }]"
        >
          <time class="ledger-timeline-date" :datetime="formatMomentDate(item)">
            <strong>{{ dateParts(item).primary }}</strong>
            <span>{{ dateParts(item).year }}</span>
            <small>{{ dateParts(item).weekday }}</small>
          </time>

          <span class="ledger-timeline-rail" aria-hidden="true">
            <i />
          </span>

          <article
            class="ledger-timeline-entry"
            @click="$emit('view', item)"
          >
            <header class="ledger-timeline-entry__header">
              <div class="ledger-timeline-entry__title">
                <a-tag v-if="item.pinned" color="gold" :bordered="false">置顶</a-tag>
                <LedgerTextTooltip
                  :text="item.title"
                  text-class="ledger-timeline-entry__title-text"
                  search-mode
                  :search-keyword="keyword"
                />
              </div>
              <strong v-if="item.amount" class="ledger-timeline-entry__amount">
                {{ formatMoney(item.amount) }}
              </strong>
              <div class="ledger-timeline-entry__actions" @click.stop>
                <a-tooltip title="查看详情">
                  <a-button type="text" size="small" aria-label="查看详情" @click="$emit('view', item)">
                    <template #icon><EyeOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="编辑记录">
                  <a-button type="text" size="small" aria-label="编辑记录" @click="$emit('edit', item)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="删除记录">
                  <a-button type="text" size="small" danger aria-label="删除记录" @click="$emit('delete', item)">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-tooltip>
              </div>
            </header>

            <div class="ledger-timeline-entry__meta">
              <a-tag :bordered="false">{{ scopeLabel(item.scope) }}</a-tag>
              <span v-if="momentCategoryText(item)">
                <FolderOutlined />
                {{ momentCategoryText(item) }}
              </span>
              <span v-if="item.mood">
                <SmileOutlined />
                {{ item.mood }}
              </span>
              <a-tag v-for="tag in item.tags || []" :key="tag" :bordered="false">{{ tag }}</a-tag>
            </div>

            <LedgerTextTooltip
              v-if="item.content"
              :text="item.content"
              text-class="ledger-timeline-entry__content"
              search-mode
              :search-keyword="keyword"
            />
            <span v-else class="ledger-timeline-entry__empty">暂无正文</span>
          </article>
        </li>
      </ol>

      <div v-if="total > pageSize" class="ledger-timeline-pagination">
        <a-pagination
          :current="page"
          :page-size="pageSize"
          :total="total"
          size="small"
          show-less-items
          @change="$emit('page-change', $event)"
        />
      </div>
    </div>
  </a-spin>
</template>

<script setup>
import { DeleteOutlined, EditOutlined, EyeOutlined, FolderOutlined, SmileOutlined } from '@ant-design/icons-vue'
import { formatMoney } from './ledgerChartOptions'
import { formatMomentDate, formatMomentDateParts, momentCategoryText, scopeLabel } from './ledgerMomentUtils'
import LedgerTextTooltip from './LedgerTextTooltip.vue'

defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  keyword: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})

defineEmits(['view', 'edit', 'delete', 'page-change'])

function dateParts(item) {
  return formatMomentDateParts(item)
}
</script>

<style scoped>
.ledger-moments-timeline {
  min-width: 0;
}

.ledger-timeline-empty {
  padding: 64px 0;
}

.ledger-timeline-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ledger-timeline-item {
  display: grid;
  grid-template-columns: 94px 28px minmax(0, 1fr);
  min-width: 0;
}

.ledger-timeline-date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  padding: 20px 8px 20px 14px;
  color: var(--console-text);
  font-style: normal;
}

.ledger-timeline-date strong {
  font-size: 16px;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}

.ledger-timeline-date span,
.ledger-timeline-date small {
  color: var(--console-text-secondary);
  font-size: 11px;
}

.ledger-timeline-rail {
  position: relative;
  display: flex;
  justify-content: center;
}

.ledger-timeline-rail::before {
  position: absolute;
  inset-block: 0;
  width: 1px;
  background: var(--console-border);
  content: '';
}

.ledger-timeline-item:first-child .ledger-timeline-rail::before {
  top: 28px;
}

.ledger-timeline-item:last-child .ledger-timeline-rail::before {
  bottom: calc(100% - 29px);
}

.ledger-timeline-rail i {
  z-index: 1;
  width: 9px;
  height: 9px;
  margin-top: 27px;
  border: 2px solid var(--console-surface);
  border-radius: 50%;
  background: var(--console-primary, #1677ff);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--console-primary, #1677ff) 30%, transparent);
}

.ledger-timeline-item.is-pinned .ledger-timeline-rail i {
  background: #d4a017;
}

.ledger-timeline-entry {
  min-width: 0;
  padding: 18px 16px 18px 4px;
  border-bottom: 1px solid var(--console-border);
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.ledger-timeline-entry:hover,
.ledger-timeline-entry:focus-visible {
  background: var(--console-surface-hover, rgba(0, 0, 0, 0.02));
  outline: none;
}

.ledger-timeline-entry__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: start;
  gap: 10px 18px;
}

.ledger-timeline-entry__title {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  min-width: 0;
}

.ledger-timeline-entry :deep(.ledger-timeline-entry__title-text) {
  color: var(--console-text);
  font-size: 15px;
  font-weight: 650;
  line-height: 1.55;
}

.ledger-timeline-entry__amount {
  padding-top: 2px;
  color: var(--console-primary, #1677ff);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ledger-timeline-entry__actions {
  display: flex;
  margin-top: -4px;
}

.ledger-timeline-entry__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin: 7px 0 9px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-timeline-entry__meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ledger-timeline-entry :deep(.ledger-timeline-entry__content) {
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 1.75;
}

.ledger-timeline-entry__empty {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-timeline-pagination {
  display: flex;
  justify-content: center;
  padding: 18px;
  border-top: 1px solid var(--console-border);
}

@media (max-width: 640px) {
  .ledger-timeline-item {
    grid-template-columns: 1fr;
  }

  .ledger-timeline-date {
    flex-direction: row;
    align-items: baseline;
    justify-content: flex-start;
    gap: 7px;
    padding: 14px 14px 0;
  }

  .ledger-timeline-rail {
    display: none;
  }

  .ledger-timeline-entry {
    margin: 0 14px;
    padding: 10px 0 16px;
  }

  .ledger-timeline-entry__header {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }

  .ledger-timeline-entry__actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
</style>
