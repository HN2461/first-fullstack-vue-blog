<template>
  <div class="ledger-moments-timeline">
    <div v-if="!items.length" class="ledger-timeline-empty">
      <a-empty description="暂无重要记录" />
    </div>
    <a-timeline v-else>
      <a-timeline-item
        v-for="item in items"
        :key="item.id"
        :color="item.pinned ? 'gold' : 'blue'"
      >
        <div class="ledger-timeline-card">
          <div class="ledger-timeline-header">
            <span class="ledger-timeline-date">{{ formatDate(item.occurredAt) }}</span>
            <a-tag v-if="item.pinned" color="gold" :bordered="false" size="small">置顶</a-tag>
            <a-tag :bordered="false" size="small">{{ scopeLabel(item.scope) }}</a-tag>
          </div>

          <div class="ledger-timeline-title">
            <strong>{{ item.title }}</strong>
            <span v-if="item.amount" class="ledger-timeline-amount">{{ formatMoney(item.amount) }}</span>
          </div>

          <div v-if="item.mood || (item.tags && item.tags.length)" class="ledger-timeline-meta">
            <span v-if="item.mood" class="ledger-timeline-mood">{{ item.mood }}</span>
            <a-tag v-for="tag in item.tags || []" :key="tag" :bordered="false" size="small" class="ledger-timeline-tag">
              {{ tag }}
            </a-tag>
          </div>

          <p v-if="item.content" class="ledger-timeline-content">{{ item.content }}</p>

          <div class="ledger-timeline-actions">
            <a-button type="text" size="small" @click="$emit('view', item)">
              <template #icon><EyeOutlined /></template>
              查看
            </a-button>
            <a-button type="text" size="small" @click="$emit('edit', item)">
              <template #icon><EditOutlined /></template>
              编辑
            </a-button>
            <a-button type="text" size="small" danger @click="$emit('delete', item)">
              <template #icon><DeleteOutlined /></template>
              删除
            </a-button>
          </div>
        </div>
      </a-timeline-item>
    </a-timeline>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="ledger-timeline-pagination">
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
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons-vue'
import { formatMoney } from './ledgerChartOptions'
import { formatDate } from './ledgerUtils'

const props = defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 20 }
})

const emit = defineEmits(['view', 'edit', 'delete', 'page-change'])

const currentPage = ref(1)

const scopeOptions = {
  day: '某一天',
  month: '某个月',
  year: '某一年'
}

function scopeLabel(scope) {
  return scopeOptions[scope] || '某一天'
}

function handlePageChange(page) {
  emit('page-change', page)
}

watch(() => props.items, () => {
  // 数据变化时保持当前页
})
</script>

<style scoped>
.ledger-moments-timeline {
  min-width: 0;
}

.ledger-timeline-empty {
  padding: 40px 0;
}

.ledger-timeline-card {
  padding: 12px 16px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  transition: border-color 0.2s;
}

.ledger-timeline-card:hover {
  border-color: var(--console-primary, #1677ff);
}

.ledger-timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.ledger-timeline-date {
  font-size: 12px;
  color: var(--console-text-secondary);
}

.ledger-timeline-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
}

.ledger-timeline-title strong {
  font-size: 15px;
  color: var(--console-text);
}

.ledger-timeline-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-error, #dc2626);
}

.ledger-timeline-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.ledger-timeline-mood {
  font-size: 13px;
  color: var(--console-text-secondary);
}

.ledger-timeline-tag {
  font-size: 11px;
}

.ledger-timeline-content {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--console-text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.ledger-timeline-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--console-border);
}

.ledger-timeline-pagination {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
</style>
