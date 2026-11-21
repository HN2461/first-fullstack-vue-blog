<template>
  <section class="tool-panel date-diff-tool">
    <div class="date-diff-toolbar"><a-checkbox v-model:checked="inclusive">包含首尾两天</a-checkbox><div class="date-diff-actions"><a-button size="small" :disabled="result === null || stale" @click="copyToolResult(resultText, '日期间隔')">复制结果</a-button><a-button type="primary" size="small" @click="calculate">计算间隔</a-button></div></div>
    <div class="date-diff-fields"><label for="tool-date-start"><span>开始日期</span><a-input id="tool-date-start" v-model:value="start" type="date" /></label><label for="tool-date-end"><span>结束日期</span><a-input id="tool-date-end" v-model:value="end" type="date" /></label></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div v-if="result !== null" class="date-diff-result"><span>日历间隔</span><strong>{{ result }}</strong><span>天</span><small>{{ source.inclusive ? '包含首尾两天' : '相同日期为 0 天' }}</small></div>
    <div class="date-diff-note" role="status">{{ stale ? '日期或计数方式已修改，请重新计算。' : '按日历日期计算绝对间隔，允许日期倒序；不受时区夏令时的一天 23 / 25 小时影响。' }}</div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { addCalendarDays, calculateDateDifference, localCalendarDate } from '../logic/dateTimeTools'
import { copyToolResult } from '../utils/copyToolResult'
const start = ref(localCalendarDate())
const end = ref(addCalendarDays(start.value, 30))
const inclusive = ref(false)
const result = ref(null)
const error = ref('')
const source = ref(null)
const stale = computed(() => Boolean(source.value && (source.value.start !== start.value || source.value.end !== end.value || source.value.inclusive !== inclusive.value)))
const resultText = computed(() => source.value ? `${source.value.start} 至 ${source.value.end}\n${source.value.inclusive ? '包含首尾两天' : '日历间隔'}：${result.value} 天` : '')
function calculate() {
  error.value = ''
  try {
    result.value = calculateDateDifference(start.value, end.value, inclusive.value)
    source.value = { start: start.value, end: end.value, inclusive: inclusive.value }
  } catch (cause) {
    result.value = null
    source.value = null
    error.value = cause.message
  }
}
calculate()
</script>
<style scoped>
.date-diff-tool { display: flex; flex: 1; flex-direction: column; gap: 14px; min-width: 0; min-height: 0; overflow: auto; }.date-diff-toolbar, .date-diff-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }.date-diff-toolbar { justify-content: space-between; }.date-diff-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.date-diff-fields label { display: grid; gap: 7px; color: var(--console-text-secondary); font-size: 12px; }.date-diff-result { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; padding: 16px; border: 1px solid var(--console-border); border-radius: 6px; }.date-diff-result > span, .date-diff-result small, .date-diff-note { color: var(--console-text-secondary); font-size: 12px; }.date-diff-result strong { font-size: 30px; font-weight: 500; }.date-diff-note { line-height: 1.7; }
@media (max-width: 600px) { .date-diff-fields { grid-template-columns: 1fr; } }
</style>
