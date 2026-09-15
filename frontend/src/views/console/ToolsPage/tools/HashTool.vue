<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><a-select v-model:value="algorithm" size="small" style="width: 140px"><a-select-option value="SHA-256">SHA-256</a-select-option><a-select-option value="SHA-1">SHA-1</a-select-option><a-select-option value="SHA-384">SHA-384</a-select-option><a-select-option value="SHA-512">SHA-512</a-select-option></a-select><a-button size="small" type="primary" @click="run">计算</a-button></div>
    <label class="tool-field"><span>输入文本</span><a-textarea v-model:value="input" :rows="8" spellcheck="false" placeholder="输入需要计算摘要的文本" /></label>
    <label class="tool-field"><span>摘要结果</span><a-input v-model:value="output" readonly placeholder="结果会显示在这里" /></label>
    <a-alert v-if="error" type="error" show-icon :message="error" />
  </section>
</template>

<script setup>
import { ref } from 'vue'

const algorithm = ref('SHA-256')
const input = ref('')
const output = ref('')
const error = ref('')

async function run() {
  error.value = ''
  output.value = ''
  try {
    const buffer = await crypto.subtle.digest(algorithm.value, new TextEncoder().encode(input.value))
    output.value = Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    error.value = '当前浏览器不支持摘要计算'
  }
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 860px; }
.tool-panel__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.tool-field :deep(input) { font: 13px 'Cascadia Code', Consolas, monospace; }
</style>
