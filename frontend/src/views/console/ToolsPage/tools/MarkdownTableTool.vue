<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><span class="tool-hint">输入：Tab 分隔的表头和数据</span><a-button type="primary" size="small" @click="run">生成表格</a-button></div>
    <div class="tool-split"><label class="tool-field"><span>TSV / CSV</span><a-textarea v-model:value="input" :rows="12" spellcheck="false" placeholder="姓名\t年龄\n小明\t18" /></label><label class="tool-field"><span>Markdown</span><a-textarea v-model:value="output" :rows="12" readonly spellcheck="false" /></label></div>
  </section>
</template>
<script setup>
import { ref } from 'vue'
const input = ref('')
const output = ref('')
function run() {
  const rows = input.value.trim().split(/\r?\n/).map((row) => row.split(/\t|,/).map((cell) => cell.trim()))
  if (!rows.length || !rows[0].length) {
    output.value = ''
    return
  }
  const width = rows[0].length
  const normalized = rows.map((row) => Array.from({ length: width }, (_, index) => row[index] || ''))
  output.value = [`| ${normalized[0].join(' | ')} |`, `| ${normalized[0].map(() => '---').join(' | ')} |`, ...normalized.slice(1).map((row) => `| ${row.join(' | ')} |`)].join('\n')
}
</script>
<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 900px; }.tool-panel__toolbar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }.tool-hint { color: var(--console-text-secondary, #667085); font-size: 12px; }.tool-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }.tool-field :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
@media (max-width: 700px) { .tool-split { grid-template-columns: 1fr; } }
</style>
