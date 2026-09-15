<template>
  <section class="tool-panel">
    <label class="tool-field"><span>JWT</span><a-textarea v-model:value="input" :rows="5" spellcheck="false" placeholder="粘贴 eyJ... 格式的 JWT" /></label>
    <div class="tool-panel__actions"><a-button size="small" type="primary" @click="decode">解码</a-button><a-button size="small" @click="clear">清空</a-button></div>
    <div class="jwt-grid"><label class="tool-field"><span>Header</span><a-textarea v-model:value="header" :rows="10" readonly spellcheck="false" /></label><label class="tool-field"><span>Payload</span><a-textarea v-model:value="payload" :rows="10" readonly spellcheck="false" /></label></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <a-alert v-else type="warning" show-icon message="仅解码内容，不验证签名或可信性" />
  </section>
</template>

<script setup>
import { ref } from 'vue'

const input = ref('')
const header = ref('')
const payload = ref('')
const error = ref('')

function parsePart(value) {
  const text = decodeURIComponent(escape(atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4))))
  return JSON.stringify(JSON.parse(text), null, 2)
}

function decode() {
  error.value = ''
  try {
    const parts = input.value.trim().split('.')
    if (parts.length !== 3) throw new Error('JWT 必须包含三段内容')
    header.value = parsePart(parts[0])
    payload.value = parsePart(parts[1])
  } catch (cause) {
    header.value = ''
    payload.value = ''
    error.value = cause.message || 'JWT 解码失败'
  }
}

function clear() {
  input.value = ''
  header.value = ''
  payload.value = ''
  error.value = ''
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 14px; max-width: 900px; }
.tool-panel__actions { display: flex; gap: 8px; }
.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.tool-field :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
.jwt-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
@media (max-width: 700px) { .jwt-grid { grid-template-columns: 1fr; } }
</style>
