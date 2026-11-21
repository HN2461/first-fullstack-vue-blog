<template>
  <section class="tool-panel text-stats-tool">
    <div class="text-stats-toolbar">
      <a-tooltip title="最多处理 100,000 个 UTF-16 字符；停止输入 150 毫秒后统计。字符按 Unicode 码点、字素按组合字符统计，词语按中文分词。CRLF 视为一次换行，末尾换行增加一行。"><span tabindex="0">统计口径与限制</span></a-tooltip>
      <div class="text-stats-actions">
        <a-popconfirm title="清空统计文本？" @confirm="input = ''"><a-button size="small" :disabled="!input">清空</a-button></a-popconfirm>
        <a-button size="small" :disabled="!input || pending || Boolean(error)" @click="copyToolResult(statsText, '统计结果')">复制统计</a-button>
      </div>
    </div>
    <div class="text-stats-workspace">
      <div class="text-stats-input">
        <a-textarea id="tool-text-stats-input" v-model:value="input" aria-label="统计文本" :status="error ? 'error' : undefined" spellcheck="false" placeholder="输入或粘贴文本；最多 100,000 字符，停止输入后更新统计" />
      </div>
      <section class="text-stats-result" aria-label="文本统计结果">
        <div v-if="pending || error" class="text-stats-feedback" :role="error ? 'alert' : 'status'">{{ error || '等待输入结束后更新统计…' }}</div>
        <dl v-else class="text-stats-values">
          <div v-for="item in stats" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value.toLocaleString() }}</dd></div>
        </dl>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onActivated, onBeforeUnmount, onDeactivated, ref, watch } from 'vue'
import { copyToolResult } from '../utils/copyToolResult'
import { getTextStats } from '../logic/textTools'
import { assertToolText, MAX_STATS_TEXT_LENGTH } from '../logic/textLimits'

const input = ref('')
const stats = ref(getTextStats(''))
const pending = ref(false)
const error = ref('')
let timer = null
const statsText = computed(() => stats.value.map((item) => `${item.label}：${item.value}`).join('\n'))

function scheduleStats() {
  clearTimeout(timer)
  timer = null
  error.value = ''
  try {
    assertToolText(input.value, MAX_STATS_TEXT_LENGTH)
  } catch (cause) {
    pending.value = false
    error.value = cause.message
    return
  }
  if (!input.value) {
    pending.value = false
    stats.value = getTextStats('')
    return
  }
  pending.value = true
  const source = input.value
  timer = setTimeout(() => {
    timer = null
    try {
      stats.value = getTextStats(source)
    } catch (cause) {
      error.value = cause.message
    }
    pending.value = false
  }, 150)
}

function cancelPendingStats() {
  clearTimeout(timer)
  timer = null
}

watch(input, scheduleStats, { flush: 'sync' })
onDeactivated(cancelPendingStats)
onBeforeUnmount(cancelPendingStats)
onActivated(() => { if (pending.value) scheduleStats() })
</script>

<style scoped>
.text-stats-tool { container-type: inline-size; display: flex; flex: 1; flex-direction: column; gap: 12px; min-width: 0; min-height: 0; overflow: hidden; }
.text-stats-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; flex: 0 0 auto; color: var(--console-text-secondary); font-size: 12px; }
.text-stats-actions { display: flex; align-items: center; gap: 8px; }
.text-stats-workspace { display: grid; grid-template-columns: minmax(0, 1fr) 280px; grid-template-rows: minmax(0, 1fr); gap: 16px; flex: 1; min-height: 0; }
.text-stats-input, .text-stats-result { display: flex; flex-direction: column; gap: 8px; min-width: 0; min-height: 0; }
.text-stats-input > label, .text-stats-result-head { display: flex; align-items: center; justify-content: space-between; flex: 0 0 auto; min-height: 28px; color: var(--console-text-secondary); font-size: 12px; }
.text-stats-input :deep(textarea) { flex: 1; height: 100%; min-height: 0; resize: none; font: 13px/1.65 'Cascadia Code', Consolas, monospace; }
.text-stats-values { min-height: 0; margin: 0; overflow: auto; border: 1px solid var(--console-border); border-radius: 6px; }
.text-stats-feedback { padding: 16px 12px; color: var(--console-text-secondary); font-size: 13px; }
.text-stats-feedback[role='alert'] { color: var(--ant-color-error, #f56c6c); }
.text-stats-values > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 48px; padding: 10px 12px; }
.text-stats-values > div + div { border-top: 1px solid var(--console-border); }
.text-stats-values dt { color: var(--console-text-secondary); font-size: 12px; }
.text-stats-values dd { min-width: 0; margin: 0; overflow-wrap: anywhere; color: var(--console-text); font-size: 18px; font-weight: 500; }
@container (max-width: 680px) {
  .text-stats-workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; }
  .text-stats-values { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .text-stats-values > div { flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; min-height: 60px; padding: 8px; }
  .text-stats-values > div + div { border-top: 0; }
}
@media (max-width: 760px) {
  .text-stats-workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; gap: 10px; }
  .text-stats-values { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .text-stats-values > div { flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; min-height: 60px; padding: 8px; }
  .text-stats-values > div + div { border-top: 0; }
}
</style>
