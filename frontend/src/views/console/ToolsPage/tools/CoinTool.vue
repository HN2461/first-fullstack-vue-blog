<template>
  <section class="tool-panel coin-tool">
    <div class="tool-panel__toolbar"><a-input-number v-model:value="count" :min="1" :max="10000" size="small" addon-before="次数" /><a-button type="primary" size="small" @click="run">开始统计</a-button></div>
    <div class="coin-stats"><div><span>正面</span><strong>{{ heads }}</strong><small>{{ headRate }}%</small></div><div><span>反面</span><strong>{{ tails }}</strong><small>{{ tailRate }}%</small></div></div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
const count = ref(100)
const heads = ref(0)
const tails = ref(0)
const headRate = computed(() => count.value ? (heads.value / count.value * 100).toFixed(1) : '0.0')
const tailRate = computed(() => count.value ? (tails.value / count.value * 100).toFixed(1) : '0.0')
function run() {
  heads.value = 0
  tails.value = 0
  const values = crypto.getRandomValues(new Uint32Array(count.value))
  values.forEach((value) => value % 2 ? heads.value++ : tails.value++)
}
run()
</script>
<style scoped>
.tool-panel { display: grid; gap: 18px; max-width: 700px; }.tool-panel__toolbar { display: flex; gap: 8px; }.coin-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }.coin-stats div { display: grid; gap: 7px; padding: 18px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 8px; background: var(--console-surface-muted, #f8fafc); }.coin-stats span, .coin-stats small { color: var(--console-text-secondary, #667085); font-size: 12px; }.coin-stats strong { font-size: 28px; }
</style>
