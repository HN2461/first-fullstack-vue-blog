<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><a-radio-group v-model:value="mode" size="small"><a-radio-button value="decode">解析 URL</a-radio-button><a-radio-button value="encode">生成 URL</a-radio-button></a-radio-group><a-button size="small" type="primary" @click="run">处理</a-button></div>
    <div class="tool-split"><label class="tool-field"><span>{{ mode === 'decode' ? 'URL 或查询串' : '每行一个 key=value' }}</span><a-textarea v-model:value="input" :rows="11" spellcheck="false" /></label><label class="tool-field"><span>结果</span><a-textarea v-model:value="output" :rows="11" readonly spellcheck="false" /></label></div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const mode = ref('decode')
const input = ref('')
const output = ref('')
function run() {
  if (mode.value === 'decode') {
    const query = input.value.includes('?') ? input.value.split('?')[1].split('#')[0] : input.value.replace(/^\?/, '')
    output.value = [...new URLSearchParams(query)].map(([key, value]) => `${key} = ${value}`).join('\n')
  } else {
    const params = new URLSearchParams()
    input.value.split(/\r?\n/).forEach((line) => {
      const index = line.indexOf('=')
      if (index > -1) params.set(line.slice(0, index).trim(), line.slice(index + 1).trim())
    })
    output.value = params.toString()
  }
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 900px; }.tool-panel__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; }.tool-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }.tool-field :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
@media (max-width: 700px) { .tool-split { grid-template-columns: 1fr; } }
</style>
