<template>
  <section class="tool-panel">
    <div class="date-row"><label>开始日期 <a-input v-model:value="start" type="date" /></label><label>结束日期 <a-input v-model:value="end" type="date" /></label><a-button type="primary" @click="calculate">计算</a-button></div>
    <div class="date-result">相差 <strong>{{ days }}</strong> 天</div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
const iso = (date) => date.toISOString().slice(0, 10)
const today = new Date()
const start = ref(iso(today))
const endDate = new Date(today)
endDate.setDate(today.getDate() + 30)
const end = ref(iso(endDate))
const days = computed(() => Math.round(Math.abs((new Date(`${end.value}T00:00:00`) - new Date(`${start.value}T00:00:00`)) / 86400000)))
function calculate() { /* computed value updates from the date inputs */ }
</script>
<style scoped>
.tool-panel { display: grid; gap: 18px; max-width: 800px; }.date-row { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; }.date-row label { display: grid; gap: 6px; color: var(--console-text-secondary, #667085); font-size: 12px; }.date-result { padding: 28px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 8px; background: var(--console-surface-muted, #f8fafc); text-align: center; }.date-result strong { margin: 0 5px; color: var(--console-primary, #1677ff); font-size: 38px; }
</style>
