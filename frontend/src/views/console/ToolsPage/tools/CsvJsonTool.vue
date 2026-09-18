<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><a-checkbox v-model:checked="parseNumbers">自动识别数字</a-checkbox><a-button type="primary" size="small" @click="run">转换</a-button></div>
    <div class="tool-split"><label class="tool-field"><span>CSV / TSV</span><a-textarea v-model:value="input" :rows="13" spellcheck="false" placeholder="name,age\n小明,18" /></label><label class="tool-field"><span>JSON</span><a-textarea v-model:value="output" :rows="13" readonly spellcheck="false" /></label></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
  </section>
</template>
<script setup>
import { ref } from 'vue'
const input = ref('')
const output = ref('')
const error = ref('')
const parseNumbers = ref(true)
function run() {
  error.value = ''
  try {
    const rows = input.value.trim().split(/\r?\n/).map((line) => line.split(/\t|,/).map((item) => item.trim()))
    const headers = rows.shift() || []
    output.value = JSON.stringify(rows.map((row) => Object.fromEntries(headers.map((key, index) => {
      const value = row[index] ?? ''
      return [key, parseNumbers.value && value !== '' && !Number.isNaN(Number(value)) ? Number(value) : value]
    }))), null, 2)
  } catch {
    output.value = ''
    error.value = '无法解析表格文本'
  }
}
</script>
<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 900px; }.tool-panel__toolbar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }.tool-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }.tool-field :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
@media (max-width: 700px) { .tool-split { grid-template-columns: 1fr; } }
</style>
