<template>
  <div class="transfer-progress" :class="`transfer-progress--${status}`">
    <div class="transfer-progress__heading">
      <div>
        <strong>{{ title }}</strong>
        <span v-if="subtitle">{{ subtitle }}</span>
      </div>
      <span class="transfer-progress__state">{{ stateLabel }}</span>
    </div>
    <a-progress
      v-if="hasTotal"
      :percent="displayPercent"
      :status="progressStatus"
      :show-info="hasTotal"
      :stroke-width="7"
    />
    <div v-else class="transfer-progress__indeterminate" aria-label="传输进行中"><span /></div>
    <div class="transfer-progress__meta">
      <span>{{ sizeLabel }}</span>
      <span>{{ speedLabel }}</span>
      <span v-if="remainingLabel">剩余 {{ remainingLabel }}</span>
    </div>
    <div v-if="$slots.actions" class="transfer-progress__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatRemainingTime, formatTransferSize, formatTransferSpeed } from '@/utils/transferProgress'

const props = defineProps({
  title: { type: String, default: '正在传输' },
  subtitle: { type: String, default: '' },
  loaded: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  percent: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  remainingSeconds: { type: Number, default: 0 },
  status: { type: String, default: 'active' }
})

const hasTotal = computed(() => props.total > 0)
const displayPercent = computed(() => hasTotal.value ? Math.max(0, Math.min(100, props.percent)) : 100)
const progressStatus = computed(() => {
  if (props.status === 'error') return 'exception'
  if (props.status === 'success') return 'success'
  return 'active'
})
const stateLabel = computed(() => ({
  active: '传输中',
  success: '已完成',
  error: '失败',
  cancelled: '已取消',
  browser: '浏览器下载'
}[props.status] || '传输中'))
const sizeLabel = computed(() => hasTotal.value
  ? `${formatTransferSize(props.loaded)} / ${formatTransferSize(props.total)}`
  : `已传输 ${formatTransferSize(props.loaded)}`)
const speedLabel = computed(() => formatTransferSpeed(props.speed))
const remainingLabel = computed(() => hasTotal.value && props.status === 'active'
  ? formatRemainingTime(props.remainingSeconds)
  : '')
</script>

<style scoped>
.transfer-progress {
  padding: 14px 16px;
  border: 1px solid var(--share-border, var(--console-border, #d9d9d9));
  border-radius: 8px;
  color: var(--share-text, var(--console-text, #101828));
  background: var(--share-surface-muted, var(--console-surface-muted, #fafafa));
}

.transfer-progress__heading,
.transfer-progress__meta,
.transfer-progress__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.transfer-progress__heading { margin-bottom: 10px; }
.transfer-progress__heading > div { min-width: 0; }
.transfer-progress__heading strong,
.transfer-progress__heading span { display: block; }
.transfer-progress__heading strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.transfer-progress__heading span,
.transfer-progress__meta,
.transfer-progress__state { color: var(--share-text-secondary, var(--console-text-secondary, #667085)); font-size: 12px; }
.transfer-progress__state { flex: none; }
.transfer-progress__meta { flex-wrap: wrap; margin-top: 8px; justify-content: flex-start; }
.transfer-progress__actions { margin-top: 10px; justify-content: flex-end; }

.transfer-progress--error { border-color: #ff7875; }
.transfer-progress--success { border-color: #52c41a; }

.transfer-progress :deep(.ant-progress-inner) {
  background: var(--share-border, var(--console-border, #e5e7eb));
}

.transfer-progress :deep(.ant-progress-text) {
  color: var(--share-text-secondary, var(--console-text-secondary, #667085));
}

.transfer-progress__indeterminate {
  height: 7px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--share-border, var(--console-border, #e5e7eb));
}

.transfer-progress__indeterminate span {
  display: block;
  width: 38%;
  height: 100%;
  border-radius: inherit;
  background: var(--share-primary, var(--console-primary-strong, #1677ff));
  animation: transfer-progress-slide 1.2s ease-in-out infinite;
}

@keyframes transfer-progress-slide {
  from { transform: translateX(-110%); }
  to { transform: translateX(290%); }
}

@media (max-width: 520px) {
  .transfer-progress__meta { gap: 6px 12px; }
}
</style>
