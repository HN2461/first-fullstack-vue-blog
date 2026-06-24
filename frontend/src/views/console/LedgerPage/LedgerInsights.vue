<template>
  <section v-if="insights.length" class="ledger-insights">
    <div class="ledger-insights__head">
      <span>生活洞察</span>
      <a-tooltip title="基于当前范围内的支出记录计算：星期消费、工作日/周末差异、餐饮占比、最近 7 天变化和最高消费日。">
        <InfoCircleOutlined class="ledger-insights__info" />
      </a-tooltip>
      <small>基于最近 {{ dayCount }} 天数据</small>
    </div>
    <div class="ledger-insights__grid">
      <div v-for="(item, idx) in insights" :key="idx" class="ledger-insight-card">
        <span class="ledger-insight-icon">{{ item.icon }}</span>
        <span class="ledger-insight-text">{{ item.text }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { InfoCircleOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const insights = computed(() => props.data?.insights || [])
const dayCount = computed(() => {
  const { from, to } = props.data || {}
  if (!from || !to) return 30
  return Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1)
})
</script>

<style scoped>
.ledger-insights {
  border: 1px solid var(--console-border);
  border-left: 3px solid var(--console-primary, #1677ff);
  border-radius: 8px;
  background: var(--console-surface);
  padding: 14px;
}

.ledger-insights__head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.ledger-insights__head span {
  color: var(--console-text);
  font-weight: 650;
  font-size: 14px;
}

.ledger-insights__info {
  color: var(--console-text-secondary);
  font-size: 13px;
  cursor: help;
}

.ledger-insights__head small {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-insights__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
}

.ledger-insight-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: color-mix(in srgb, var(--console-surface) 60%, transparent);
  transition: border-color 0.2s;
}

.ledger-insight-card:hover {
  border-color: var(--console-primary, #1677ff);
}

.ledger-insight-icon {
  font-size: 18px;
  line-height: 1.4;
  flex-shrink: 0;
}

.ledger-insight-text {
  font-size: 13px;
  color: var(--console-text);
  line-height: 1.5;
}
</style>
