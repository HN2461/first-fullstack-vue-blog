<template>
  <section class="tool-panel timestamp-tool">
    <div class="timestamp-toolbar">
      <a-radio-group v-model:value="direction" size="small" aria-label="转换方向">
        <a-radio-button value="date">日期 → 时间戳</a-radio-button>
        <a-radio-button value="timestamp">时间戳 → 日期</a-radio-button>
      </a-radio-group>
      <div class="timestamp-actions">
        <a-button size="small" @click="useNow">当前时间</a-button>
        <a-popconfirm title="清空输入和转换结果？" @confirm="clear">
          <a-button size="small" :disabled="!dateText && !timestamp && !lastSource">清空</a-button>
        </a-popconfirm>
        <a-button type="primary" size="small" @click="convert">转换</a-button>
      </div>
    </div>
    <div class="timestamp-source">
      <label v-if="direction === 'date'" class="timestamp-field" for="tool-timestamp-date">
        <span>日期时间（未附时区时按本地）</span>
        <a-input id="tool-timestamp-date" v-model:value="dateText" placeholder="YYYY-MM-DD HH:mm:ss" @press-enter="convert" />
      </label>
      <template v-else>
        <label class="timestamp-field timestamp-field--grow" for="tool-timestamp-value">
          <span>时间戳</span>
          <a-input id="tool-timestamp-value" v-model:value="timestamp" placeholder="输入数字时间戳" @press-enter="convert" />
        </label>
        <div class="timestamp-field">
          <span>输入单位</span>
          <a-radio-group v-model:value="unit" aria-label="时间戳输入单位">
            <a-radio-button value="seconds">秒</a-radio-button>
            <a-radio-button value="milliseconds">毫秒</a-radio-button>
          </a-radio-group>
        </div>
      </template>
    </div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div class="timestamp-results" aria-label="转换结果">
      <div v-for="item in resultItems" :key="item.key" class="timestamp-result-row">
        <span>{{ item.label }}</span>
        <code>{{ item.value }}</code>
        <a-tooltip :title="`复制${item.label}`">
          <a-button type="text" size="small" :disabled="!lastSource || resultStale || Boolean(error)" :aria-label="`复制${item.label}`" @click="copyToolResult(item.value, item.label)">
            <template #icon><Copy :size="14" /></template>
          </a-button>
        </a-tooltip>
      </div>
    </div>
    <div class="timestamp-note" role="status">{{ resultStale ? '输入已修改，请重新转换。' : `本地时区：${localTimeZone}；ISO 使用 UTC。秒最多三位小数，毫秒为整数。` }}</div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Copy } from '@lucide/vue'
import { copyToolResult } from '../utils/copyToolResult'
import { formatLocalDateTime, parseDateTime, timestampMilliseconds, timestampResult } from '../logic/dateTimeTools'

const direction = ref('date')
const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '浏览器本地时区'
const unit = ref('seconds')
const dateText = ref('')
const timestamp = ref('')
const error = ref('')
const result = ref({ local: '-', iso: '-', seconds: '-', milliseconds: '-' })
const lastSource = ref('')
const sourceKey = computed(() => JSON.stringify(direction.value === 'date'
  ? [direction.value, dateText.value]
  : [direction.value, timestamp.value, unit.value]))
const resultStale = computed(() => Boolean(lastSource.value && lastSource.value !== sourceKey.value))
const resultItems = computed(() => [
  { key: 'local', label: '本地时间', value: result.value.local },
  { key: 'iso', label: 'ISO 时间', value: result.value.iso },
  { key: 'seconds', label: '时间戳（秒）', value: result.value.seconds },
  { key: 'milliseconds', label: '时间戳（毫秒）', value: result.value.milliseconds }
])

function convert() {
  error.value = ''
  // 只读取当前方向的输入，防止隐藏的旧时间戳覆盖用户刚修改的日期。
  try {
    const milliseconds = direction.value === 'timestamp'
      ? timestampMilliseconds(timestamp.value, unit.value)
      : parseDateTime(dateText.value)
    result.value = timestampResult(milliseconds)
    lastSource.value = sourceKey.value
  } catch (cause) {
    result.value = { local: '-', iso: '-', seconds: '-', milliseconds: '-' }
    lastSource.value = ''
    error.value = cause.message
  }
}

function useNow() {
  const now = new Date()
  if (direction.value === 'date') dateText.value = formatLocalDateTime(now)
  else timestamp.value = timestampResult(now.getTime())[unit.value]
  convert()
}

function clear() {
  dateText.value = ''
  timestamp.value = ''
  error.value = ''
  lastSource.value = ''
  result.value = { local: '-', iso: '-', seconds: '-', milliseconds: '-' }
}

watch(direction, () => { error.value = '' })
</script>

<style scoped>
.timestamp-tool { display: flex; flex: 1; flex-direction: column; gap: 14px; min-width: 0; min-height: 0; overflow: hidden; }
.timestamp-toolbar, .timestamp-actions, .timestamp-source { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 0 0 auto; }
.timestamp-toolbar { justify-content: space-between; }
.timestamp-source { align-items: flex-end; gap: 12px; }
.timestamp-field { display: grid; gap: 7px; min-width: 0; color: var(--console-text-secondary); font-size: 12px; }
.timestamp-field--grow { flex: 1; }
.timestamp-source > .timestamp-field:only-child { width: min(100%, 480px); }
.timestamp-results { min-height: 0; flex: 0 1 auto; overflow: auto; border: 1px solid var(--console-border); border-radius: 6px; }
.timestamp-result-row { display: grid; grid-template-columns: 120px minmax(0, 1fr) 28px; align-items: center; gap: 12px; min-height: 48px; padding: 8px 12px; }
.timestamp-result-row + .timestamp-result-row { border-top: 1px solid var(--console-border); }
.timestamp-result-row > span { color: var(--console-text-secondary); font-size: 12px; }
.timestamp-result-row code { overflow-wrap: anywhere; color: var(--console-text); font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
.timestamp-note { flex: 0 0 auto; color: var(--console-text-secondary); font-size: 12px; }
.timestamp-tool > :deep(.ant-alert) { flex: 0 0 auto; }
@media (max-width: 600px) {
  .timestamp-toolbar { align-items: flex-start; }
  .timestamp-source { align-items: stretch; }
  .timestamp-field--grow { flex-basis: 100%; }
  .timestamp-result-row { grid-template-columns: minmax(0, 1fr) 28px; gap: 4px 8px; }
  .timestamp-result-row > span { grid-column: 1; }
  .timestamp-result-row code { grid-column: 1; }
  .timestamp-result-row :deep(.ant-tooltip-disabled-compatible-wrapper), .timestamp-result-row > :deep(.ant-btn) { grid-column: 2; grid-row: 1 / span 2; }
}
</style>
