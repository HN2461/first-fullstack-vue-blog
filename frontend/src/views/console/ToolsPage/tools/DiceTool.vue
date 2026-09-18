<template>
  <section class="tool-panel dice-tool">
    <div class="tool-panel__toolbar"><a-input-number v-model:value="sides" :min="2" :max="100" size="small" addon-before="面数" /><a-input-number v-model:value="count" :min="1" :max="20" size="small" addon-before="数量" /><a-button type="primary" size="small" @click="roll">掷骰子</a-button><a-button size="small" @click="flip">抛硬币</a-button></div>
    <div class="dice-result"><strong>{{ result || '准备好了吗？' }}</strong><span v-if="results.length">{{ results.join('、') }}</span></div>
  </section>
</template>
<script setup>
import { ref } from 'vue'
const sides = ref(6)
const count = ref(1)
const result = ref('')
const results = ref([])
function random(max) { return crypto.getRandomValues(new Uint32Array(1))[0] % max + 1 }
function roll() {
  results.value = Array.from({ length: count.value }, () => random(sides.value))
  result.value = `总点数 ${results.value.reduce((a, b) => a + b, 0)}`
}

function flip() {
  results.value = [crypto.getRandomValues(new Uint32Array(1))[0] % 2 ? '正面' : '反面']
  result.value = results.value[0]
}
</script>
<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 760px; }.tool-panel__toolbar { display: flex; flex-wrap: wrap; gap: 8px; }.dice-result { display: grid; gap: 10px; min-height: 140px; place-content: center; padding: 20px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 8px; background: var(--console-surface-muted, #f8fafc); text-align: center; }.dice-result strong { color: var(--console-primary, #1677ff); font-size: 30px; }.dice-result span { color: var(--console-text-secondary, #667085); font: 16px 'Cascadia Code', Consolas, monospace; }
</style>
