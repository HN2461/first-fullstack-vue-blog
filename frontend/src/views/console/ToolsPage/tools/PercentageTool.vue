<template>
  <section class="tool-panel math-tool">
    <div class="math-row"><label>原价 <a-input-number v-model:value="original" :min="0" /></label><label>折扣 % <a-input-number v-model:value="discount" :min="0" :max="100" /></label><a-button type="primary" @click="calculate">计算</a-button></div>
    <div class="math-result"><span>折后价格</span><strong>{{ result.price }}</strong><span>节省金额</span><strong>{{ result.saved }}</strong></div>
  </section>
</template>
<script setup>
import { reactive, ref } from 'vue'
const original = ref(100)
const discount = ref(20)
const result = reactive({ price: '80.00', saved: '20.00' })
function calculate() {
  result.price = (original.value * (1 - discount.value / 100)).toFixed(2)
  result.saved = (original.value - Number(result.price)).toFixed(2)
}
</script>
<style scoped>
.tool-panel { display: grid; gap: 18px; max-width: 760px; }.math-row { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; }.math-row label { display: grid; gap: 6px; color: var(--console-text-secondary, #667085); font-size: 12px; }.math-result { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 8px; overflow: hidden; }.math-result span, .math-result strong { padding: 14px; background: var(--console-surface-muted, #f8fafc); }.math-result span { color: var(--console-text-secondary, #667085); font-size: 12px; }.math-result strong { color: var(--console-primary, #1677ff); font-size: 20px; }
</style>
