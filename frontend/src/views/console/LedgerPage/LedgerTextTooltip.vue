<template>
  <a-tooltip
    v-if="hasTooltip"
    :title="tooltipTitle"
    :overlay-class-name="overlayClass"
    :overlay-inner-style="overlayInnerStyle"
    placement="top"
  >
    <span :class="['ledger-text-tooltip', textClass]">{{ text }}</span>
  </a-tooltip>
  <span v-else :class="['ledger-text-tooltip', mutedClass]">-</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  tooltipText: { type: String, default: '' },
  textClass: { type: [String, Array, Object], default: '' },
  mutedClass: { type: [String, Array, Object], default: '' },
  overlayClass: { type: String, default: 'ledger-text-tooltip-popover' },
  maxWidth: { type: Number, default: 360 }
})

const tooltipTitle = computed(() => props.tooltipText || props.text)
const hasTooltip = computed(() => tooltipTitle.value.trim().length > 0)
const overlayInnerStyle = computed(() => ({
  maxWidth: `${props.maxWidth}px`
}))
</script>

<style scoped>
.ledger-text-tooltip {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.ledger-note-cell {
  max-width: 100%;
}

.ledger-muted,
.ledger-daily-note {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-daily-note {
  max-width: 310px;
}

.ledger-category-amount {
  font-weight: 600;
}

.ledger-day-cat-tag__text {
  max-width: 180px;
}

.ledger-day-card__note-text {
  width: 100%;
}

.amount-income {
  color: var(--color-success, #16a34a);
}

.amount-expense {
  color: var(--color-error, #dc2626);
}

:global(.ledger-text-tooltip-popover) {
  max-width: min(360px, calc(100vw - 32px));
}

:global(.ledger-text-tooltip-popover .ant-tooltip-inner) {
  padding: 8px 10px;
  border-radius: 6px;
  line-height: 1.6;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.16);
}
</style>
