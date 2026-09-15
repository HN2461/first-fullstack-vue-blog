<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><a-radio-group v-model:value="mode" size="small"><a-radio-button value="encode">编码</a-radio-button><a-radio-button value="decode">解码</a-radio-button></a-radio-group><div class="tool-panel__actions"><a-button size="small" type="primary" @click="run">处理</a-button><a-button size="small" @click="clear">清空</a-button></div></div>
    <div class="tool-split"><label class="tool-field"><span>输入文本</span><a-textarea v-model:value="input" :rows="10" spellcheck="false" placeholder="输入 HTML 文本" /></label><label class="tool-field"><span>处理结果</span><a-textarea v-model:value="output" :rows="10" readonly spellcheck="false" /></label></div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const mode = ref('encode')
const input = ref('')
const output = ref('')

function run() {
  if (mode.value === 'encode') {
    const node = document.createElement('textarea')
    node.textContent = input.value
    output.value = node.innerHTML
  } else {
    const node = document.createElement('textarea')
    node.innerHTML = input.value
    output.value = node.value
  }
}

function clear() {
  input.value = ''
  output.value = ''
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 900px; }
.tool-panel__toolbar, .tool-panel__actions { display: flex; align-items: center; gap: 8px; }
.tool-panel__toolbar { justify-content: space-between; }
.tool-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.tool-field :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
@media (max-width: 700px) { .tool-split { grid-template-columns: 1fr; } }
</style>
