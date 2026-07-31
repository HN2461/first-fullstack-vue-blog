<template>
  <a-tooltip
    v-if="hasTooltip"
    :title="tooltipTitle"
    :overlay-class-name="overlayClass"
    :overlay-inner-style="overlayInnerStyle"
    placement="top"
  >
    <span :class="baseClass">{{ text }}</span>
  </a-tooltip>
  <span v-else-if="hasText" :class="baseClass">
    <template v-if="searchMode">
      <template v-for="segment in highlightSegments" :key="segment.key">
        <mark v-if="segment.highlight" class="ledger-text-tooltip__mark">{{ segment.text }}</mark>
        <span v-else>{{ segment.text }}</span>
      </template>
    </template>
    <template v-else>
      {{ text }}
    </template>
  </span>
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
  maxWidth: { type: Number, default: 360 },
  searchMode: { type: Boolean, default: false },
  searchKeyword: { type: String, default: '' }
})

const tooltipTitle = computed(() => props.tooltipText || props.text)
const hasTooltip = computed(() => !props.searchMode && tooltipTitle.value.trim().length > 0)
const hasText = computed(() => String(props.text || '').trim().length > 0)
const overlayInnerStyle = computed(() => ({
  maxWidth: `${props.maxWidth}px`
}))

const baseClass = computed(() => [
  'ledger-text-tooltip',
  props.textClass,
  {
    'ledger-text-tooltip--expanded': props.searchMode
  }
])

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const highlightSegments = computed(() => {
  const text = String(props.text || '')
  const keyword = String(props.searchKeyword || '').trim()
  if (!text) return []
  if (!props.searchMode || !keyword) {
    return [{ key: 'plain', text, highlight: false }]
  }

  const pattern = new RegExp(escapeRegExp(keyword), 'ig')
  const segments = []
  let lastIndex = 0
  let index = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        key: `plain-${index += 1}`,
        text: text.slice(lastIndex, match.index),
        highlight: false
      })
    }

    segments.push({
      key: `hit-${index += 1}`,
      text: match[0],
      highlight: true
    })
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push({
      key: `tail-${index += 1}`,
      text: text.slice(lastIndex),
      highlight: false
    })
  }

  return segments.length ? segments : [{ key: 'plain', text, highlight: false }]
})
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

.ledger-text-tooltip--expanded {
  display: inline-block;
  width: 100%;
  max-width: 100%;
  overflow: visible;
  text-overflow: clip;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.55;
  text-align: left;
  vertical-align: top;
}

.ledger-text-tooltip__mark {
  padding: 0 2px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--console-primary, #1677ff) 18%, transparent);
  color: inherit;
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
