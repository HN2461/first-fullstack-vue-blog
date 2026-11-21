<template>
  <section class="tool-panel percentage-tool">
    <div class="percentage-toolbar"><a-radio-group v-model:value="mode" size="small" aria-label="百分比计算方式"><a-radio-button value="discount">折扣</a-radio-button><a-radio-button value="share">占比</a-radio-button><a-radio-button value="growth">增长率</a-radio-button></a-radio-group><div class="percentage-actions"><a-button size="small" :disabled="!result || stale" @click="copyToolResult(resultText)">复制结果</a-button><a-button type="primary" size="small" @click="calculate">计算</a-button></div></div>
    <div class="percentage-fields"><label for="tool-percent-first"><span>{{ labels[0] }}</span><a-input id="tool-percent-first" v-model:value="first" inputmode="decimal" @press-enter="calculate" /></label><label for="tool-percent-second"><span>{{ labels[1] }}</span><a-input id="tool-percent-second" v-model:value="second" inputmode="decimal" @press-enter="calculate" /></label></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div v-if="result" class="percentage-result"><div v-for="item in resultItems" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div></div>
    <div class="percentage-note" role="status">{{ stale ? '输入或方式已修改，请重新计算。' : formula }}</div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { calculateDiscount, calculateGrowth, calculateShare } from '../logic/calculationTools'
import { copyToolResult } from '../utils/copyToolResult'
const mode = ref('discount')
const first = ref('100')
const second = ref('20')
const result = ref(null)
const error = ref('')
const lastKey = ref('')
const sourceKey = computed(() => JSON.stringify([mode.value, first.value, second.value]))
const stale = computed(() => Boolean(result.value && lastKey.value !== sourceKey.value))
const labels = computed(() => mode.value === 'discount' ? ['原价（最多两位小数）', '优惠比例（%，20 表示八折）'] : mode.value === 'share' ? ['部分数量', '总量（必须大于 0）'] : ['原值（必须大于 0）', '现值'])
const formula = computed(() => mode.value === 'discount' ? '折后价 = 原价 ×（1 − 优惠比例）；金额按分四舍五入，节省金额由原价减去折后价。' : mode.value === 'share' ? '占比 = 部分 ÷ 总量 × 100%，允许超过 100%，结果保留两位小数。' : '增长率 =（现值 − 原值）÷ 原值 × 100%；原值为零或负数时不适用此口径，结果保留两位小数。')
const resultItems = computed(() => !result.value ? [] : result.value.mode === 'discount' ? [{ label: '折后价格', value: result.value.price }, { label: '节省金额', value: result.value.saved }] : [{ label: result.value.mode === 'share' ? '占比' : '增长率', value: result.value.percent + '%' }])
const resultText = computed(() => resultItems.value.map((item) => `${item.label}：${item.value}`).join('\n'))
function calculate() {
  error.value = ''
  try {
    result.value = mode.value === 'discount' ? { mode: mode.value, ...calculateDiscount(first.value, second.value) } : { mode: mode.value, percent: mode.value === 'share' ? calculateShare(first.value, second.value) : calculateGrowth(first.value, second.value) }
    lastKey.value = sourceKey.value
  } catch (cause) {
    result.value = null
    error.value = cause.message
  }
}
calculate()
</script>
<style scoped>
.percentage-tool { display: flex; flex: 1; flex-direction: column; gap: 14px; min-width: 0; min-height: 0; overflow: auto; }
.percentage-toolbar, .percentage-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }.percentage-toolbar { justify-content: space-between; flex: 0 0 auto; }.percentage-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.percentage-fields label { display: grid; gap: 7px; color: var(--console-text-secondary); font-size: 12px; }.percentage-result { border: 1px solid var(--console-border); border-radius: 6px; }.percentage-result > div { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px; }.percentage-result > div + div { border-top: 1px solid var(--console-border); }.percentage-result span, .percentage-note { color: var(--console-text-secondary); font-size: 12px; }.percentage-result strong { min-width: 0; overflow-wrap: anywhere; font-size: 24px; font-weight: 500; }.percentage-note { line-height: 1.7; }
@media (max-width: 600px) { .percentage-fields { grid-template-columns: 1fr; } }
</style>
