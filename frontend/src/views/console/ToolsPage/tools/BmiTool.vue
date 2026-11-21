<template>
  <section class="tool-panel bmi-tool">
    <div class="bmi-toolbar"><span>成人 BMI 参考</span><div class="bmi-actions"><a-button size="small" :disabled="!result || stale" @click="copyToolResult(`BMI：${result.bmi}（${result.level}）`, 'BMI 结果')">复制结果</a-button><a-button type="primary" size="small" @click="calculate">计算 BMI</a-button></div></div>
    <div class="bmi-fields"><label for="tool-bmi-height"><span>身高（cm）</span><a-input id="tool-bmi-height" v-model:value="height" inputmode="decimal" @press-enter="calculate" /></label><label for="tool-bmi-weight"><span>体重（kg）</span><a-input id="tool-bmi-weight" v-model:value="weight" inputmode="decimal" @press-enter="calculate" /></label></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div v-if="result" class="bmi-result"><span>BMI</span><strong>{{ result.bmi }}</strong><span>{{ result.level }}</span></div>
    <div class="bmi-note" role="status">{{ stale ? '身高或体重已修改，请重新计算。' : '中国成人参考分界为 18.5 / 24 / 28；分类使用未舍入的 BMI，显示保留一位小数。' }}</div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { calculateBmi } from '../logic/calculationTools'
import { copyToolResult } from '../utils/copyToolResult'
const height = ref('175')
const weight = ref('65')
const result = ref(null)
const source = ref('')
const error = ref('')
const sourceKey = computed(() => JSON.stringify([height.value, weight.value]))
const stale = computed(() => Boolean(result.value && source.value !== sourceKey.value))
function calculate() {
  error.value = ''
  try {
    result.value = calculateBmi(height.value, weight.value)
    source.value = sourceKey.value
  } catch (cause) {
    result.value = null
    error.value = cause.message
  }
}
calculate()
</script>
<style scoped>
.bmi-tool { display: flex; flex: 1; flex-direction: column; gap: 14px; min-width: 0; min-height: 0; overflow: auto; }.bmi-toolbar, .bmi-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }.bmi-toolbar { justify-content: space-between; color: var(--console-text-secondary); font-size: 12px; }.bmi-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.bmi-fields label { display: grid; gap: 7px; color: var(--console-text-secondary); font-size: 12px; }.bmi-result { display: flex; align-items: baseline; gap: 14px; padding: 16px; border: 1px solid var(--console-border); border-radius: 6px; }.bmi-result > span, .bmi-note { color: var(--console-text-secondary); font-size: 12px; }.bmi-result strong { min-width: 0; overflow-wrap: anywhere; font-size: 30px; font-weight: 500; }.bmi-note { line-height: 1.7; }
@media (max-width: 600px) { .bmi-fields { grid-template-columns: 1fr; } }
</style>
