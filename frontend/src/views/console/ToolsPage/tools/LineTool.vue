<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><a-select v-model:value="mode" size="small" style="width: 130px"><a-select-option value="sort">升序排序</a-select-option><a-select-option value="reverse">反转顺序</a-select-option><a-select-option value="unique">去重</a-select-option><a-select-option value="trim">清理空行</a-select-option></a-select><a-button size="small" type="primary" @click="run">处理</a-button></div>
    <div class="tool-split"><label class="tool-field"><span>输入文本</span><a-textarea v-model:value="input" :rows="12" spellcheck="false" /></label><label class="tool-field"><span>处理结果</span><a-textarea v-model:value="output" :rows="12" readonly spellcheck="false" /></label></div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const mode = ref('sort')
const input = ref('')
const output = ref('')
function run() {
  let lines = input.value.split(/\r?\n/)
  if (mode.value === 'sort') lines = lines.filter(Boolean).sort((a, b) => a.localeCompare(b, 'zh-CN'))
  if (mode.value === 'reverse') lines.reverse()
  if (mode.value === 'unique') lines = [...new Set(lines)]
  if (mode.value === 'trim') lines = lines.map((line) => line.trim()).filter(Boolean)
  output.value = lines.join('\n')
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 900px; }.tool-panel__toolbar { display: flex; justify-content: space-between; gap: 8px; }.tool-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }.tool-field :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
@media (max-width: 700px) { .tool-split { grid-template-columns: 1fr; } }
</style>
