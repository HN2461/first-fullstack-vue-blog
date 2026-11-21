<template>
  <section class="tool-panel coin-tool">
    <div class="coin-toolbar"><div class="coin-options"><label for="tool-coin-count">抛掷次数（1–10000）</label><a-input-number id="tool-coin-count" v-model:value="count" :min="1" :max="10000" size="small" /></div><div class="coin-actions"><a-button size="small" :disabled="!result" @click="copyToolResult(resultText, '统计结果')">复制结果</a-button><a-button type="primary" size="small" @click="run">开始统计</a-button></div></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div class="coin-result-head">{{ result ? `本次实际抛掷 ${result.total} 次` : '等待统计' }}<span v-if="result && count !== result.total">参数已修改，当前显示上次结果</span></div>
    <div v-if="result" class="coin-stats"><div><span>正面</span><strong>{{ result.heads }}</strong><small>{{ headRate }}%</small></div><div><span>反面</span><strong>{{ result.tails }}</strong><small>{{ tailRate }}%</small></div></div>
    <div class="coin-note">比例始终按本次实际次数计算，保留一位小数；不累加上次统计。</div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { simulateCoins } from '../logic/randomTools'
import { copyToolResult } from '../utils/copyToolResult'
const count = ref(100)
const result = ref(null)
const error = ref('')
const headRate = computed(() => result.value ? (result.value.heads / result.value.total * 100).toFixed(1) : '0.0')
const tailRate = computed(() => result.value ? (result.value.tails / result.value.total * 100).toFixed(1) : '0.0')
const resultText = computed(() => result.value ? `抛掷次数：${result.value.total}\n正面：${result.value.heads}（${headRate.value}%）\n反面：${result.value.tails}（${tailRate.value}%）` : '')
function run() {
  error.value = ''
  try {
    result.value = simulateCoins(count.value)
  } catch (cause) {
    error.value = cause.message
    result.value = null
  }
}
run()
</script>
<style scoped>
.coin-tool { display: flex; flex: 1; flex-direction: column; gap: 14px; min-height: 0; min-width: 0; overflow: auto; }
.coin-toolbar, .coin-options, .coin-actions, .coin-result-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 0 0 auto; }
.coin-toolbar { justify-content: space-between; }.coin-options, .coin-result-head, .coin-note { color: var(--console-text-secondary); font-size: 12px; }.coin-result-head { justify-content: space-between; }
.coin-options :deep(.ant-input-number) { width: 116px; }.coin-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }.coin-stats > div { display: grid; gap: 7px; padding: 16px; border: 1px solid var(--console-border); border-radius: 6px; }.coin-stats span, .coin-stats small { color: var(--console-text-secondary); font-size: 12px; }.coin-stats strong { font-size: 28px; font-weight: 500; }.coin-note { flex: 0 0 auto; }
</style>
