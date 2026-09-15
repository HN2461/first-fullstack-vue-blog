<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar">
      <a-radio-group v-model:value="mode" size="small">
        <a-radio-button value="encode">编码</a-radio-button>
        <a-radio-button value="decode">解码</a-radio-button>
      </a-radio-group>
      <div class="tool-panel__actions"><a-button size="small" @click="clear">清空</a-button><a-button type="primary" size="small" @click="run">处理</a-button></div>
    </div>
    <label class="tool-field"><span>{{ mode === 'encode' ? '待编码文本' : '待解码 URL' }}</span><a-textarea v-model:value="input" :rows="9" spellcheck="false" placeholder="输入 URL 或文本" /></label>
    <label class="tool-field"><span>结果</span><a-textarea v-model:value="output" :rows="9" readonly spellcheck="false" placeholder="结果会显示在这里" /></label>
    <a-alert v-if="error" type="error" show-icon :message="error" />
  </section>
</template>

<script setup>
import { ref } from 'vue'

const mode = ref('encode')
const input = ref('')
const output = ref('')
const error = ref('')

function run() {
  error.value = ''
  try {
    output.value = mode.value === 'encode' ? encodeURIComponent(input.value) : decodeURIComponent(input.value)
  } catch {
    output.value = ''
    error.value = 'URL 编码内容无效，请检查百分号转义是否完整'
  }
}

function clear() {
  input.value = ''
  output.value = ''
  error.value = ''
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 860px; }
.tool-panel__toolbar, .tool-panel__actions { display: flex; align-items: center; gap: 8px; }
.tool-panel__toolbar { justify-content: space-between; }
.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.tool-field :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
</style>
