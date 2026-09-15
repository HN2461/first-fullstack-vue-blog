<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><a-input v-model:value="input" size="small" placeholder="输入整数" /><a-select v-model:value="fromBase" size="small" style="width: 130px"><a-select-option :value="2">二进制</a-select-option><a-select-option :value="10">十进制</a-select-option><a-select-option :value="16">十六进制</a-select-option></a-select><a-button size="small" type="primary" @click="convert">转换</a-button></div>
    <div class="base-grid"><div v-for="item in results" :key="item.label"><span>{{ item.label }}</span><code>{{ item.value }}</code></div></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
  </section>
</template>

<script setup>
import { ref } from 'vue'

const input = ref('255')
const fromBase = ref(10)
const error = ref('')
const results = ref([{ label: '二进制', value: '11111111' }, { label: '十进制', value: '255' }, { label: '十六进制', value: 'FF' }])

function convert() {
  error.value = ''
  const value = Number.parseInt(input.value.trim(), fromBase.value)
  if (Number.isNaN(value)) {
    error.value = '请输入当前进制下的有效整数'
    return
  }
  results.value = [{ label: '二进制', value: value.toString(2) }, { label: '十进制', value: value.toString(10) }, { label: '十六进制', value: value.toString(16).toUpperCase() }]
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 760px; }.tool-panel__toolbar { display: flex; gap: 8px; }.tool-panel__toolbar :deep(.ant-input) { font: 13px 'Cascadia Code', Consolas, monospace; }.base-grid { display: grid; gap: 8px; }.base-grid div { display: flex; justify-content: space-between; padding: 12px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 6px; background: var(--console-surface-muted, #f8fafc); }.base-grid span { color: var(--console-text-secondary, #667085); font-size: 12px; }.base-grid code { font: 14px 'Cascadia Code', Consolas, monospace; }
</style>
