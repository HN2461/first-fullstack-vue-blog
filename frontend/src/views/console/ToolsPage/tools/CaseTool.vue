<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><a-select v-model:value="mode" size="small" style="width: 160px"><a-select-option value="upper">全部大写</a-select-option><a-select-option value="lower">全部小写</a-select-option><a-select-option value="title">标题格式</a-select-option><a-select-option value="camel">camelCase</a-select-option><a-select-option value="snake">snake_case</a-select-option><a-select-option value="kebab">kebab-case</a-select-option></a-select><a-button size="small" type="primary" @click="run">转换</a-button></div>
    <div class="tool-split"><label class="tool-field"><span>输入文本</span><a-textarea v-model:value="input" :rows="10" spellcheck="false" /></label><label class="tool-field"><span>转换结果</span><a-textarea v-model:value="output" :rows="10" readonly spellcheck="false" /></label></div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const mode = ref('upper')
const input = ref('')
const output = ref('')

function words() { return input.value.trim().split(/[\s_\-]+/).filter(Boolean) }
function run() {
  const list = words()
  if (mode.value === 'upper') output.value = input.value.toUpperCase()
  if (mode.value === 'lower') output.value = input.value.toLowerCase()
  if (mode.value === 'title') output.value = list.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
  if (mode.value === 'camel') output.value = list.map((word, index) => index ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()).join('')
  if (mode.value === 'snake') output.value = list.map((word) => word.toLowerCase()).join('_')
  if (mode.value === 'kebab') output.value = list.map((word) => word.toLowerCase()).join('-')
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 900px; }.tool-panel__toolbar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }.tool-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }.tool-field :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
@media (max-width: 700px) { .tool-split { grid-template-columns: 1fr; } }
</style>
