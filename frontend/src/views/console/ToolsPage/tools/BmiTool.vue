<template>
  <section class="tool-panel bmi-tool">
    <div class="bmi-row"><label>身高 cm <a-input-number v-model:value="height" :min="50" :max="250" /></label><label>体重 kg <a-input-number v-model:value="weight" :min="2" :max="400" /></label><a-button type="primary" @click="calculate">计算 BMI</a-button></div>
    <div class="bmi-result"><strong>{{ bmi }}</strong><span>{{ level }}</span></div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
const height = ref(175)
const weight = ref(65)
const bmi = computed(() => (weight.value / ((height.value / 100) ** 2)).toFixed(1))
const level = computed(() => Number(bmi.value) < 18.5 ? '偏低' : Number(bmi.value) < 24 ? '正常' : Number(bmi.value) < 28 ? '偏高' : '较高')
function calculate() { /* computed values update immediately; button keeps the interaction explicit */ }
</script>
<style scoped>
.tool-panel { display: grid; gap: 18px; max-width: 760px; }.bmi-row { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; }.bmi-row label { display: grid; gap: 6px; color: var(--console-text-secondary, #667085); font-size: 12px; }.bmi-result { display: grid; gap: 8px; min-height: 140px; place-content: center; border-radius: 8px; color: var(--console-primary, #1677ff); background: var(--console-primary-soft, #eaf3ff); text-align: center; }.bmi-result strong { font-size: 44px; }.bmi-result span { color: var(--console-text-secondary, #667085); }
</style>
