<template>
  <section class="tool-panel">
    <div class="ratio-row"><label>原 A <a-input-number v-model:value="a" :min="0" /></label><label>原 B <a-input-number v-model:value="b" :min="0" /></label><label>新 A <a-input-number v-model:value="newA" :min="0" /></label><a-button type="primary" @click="convert">换算</a-button></div>
    <div class="ratio-result">按 {{ a }} : {{ b }} 缩放后，B = <strong>{{ result }}</strong></div>
  </section>
</template>
<script setup>
import { ref } from 'vue'
const a = ref(16)
const b = ref(9)
const newA = ref(1920)
const result = ref('1080.00')
function convert() { result.value = a.value ? (newA.value * b.value / a.value).toFixed(2) : '—' }
</script>
<style scoped>
.tool-panel { display: grid; gap: 18px; max-width: 850px; }.ratio-row { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; }.ratio-row label { display: grid; gap: 6px; color: var(--console-text-secondary, #667085); font-size: 12px; }.ratio-result { padding: 24px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 8px; color: var(--console-text-secondary, #667085); background: var(--console-surface-muted, #f8fafc); }.ratio-result strong { color: var(--console-primary, #1677ff); font-size: 26px; }
</style>
