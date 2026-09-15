<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar">
      <a-radio-group v-model:value="unit" size="small">
        <a-radio-button value="seconds">秒</a-radio-button>
        <a-radio-button value="milliseconds">毫秒</a-radio-button>
      </a-radio-group>
      <div class="tool-panel__actions"><a-button size="small" @click="useNow">当前时间</a-button><a-button size="small" @click="clear">清空</a-button><a-button type="primary" size="small" @click="convert">转换</a-button></div>
    </div>
    <div class="timestamp-inputs">
      <label class="tool-field"><span>日期时间</span><a-input v-model:value="dateText" placeholder="YYYY-MM-DD HH:mm:ss" /></label>
      <label class="tool-field"><span>时间戳</span><a-input v-model:value="timestamp" placeholder="输入数字时间戳" /></label>
    </div>
    <div v-if="error" class="timestamp-error">{{ error }}</div>
    <div v-else class="timestamp-result">
      <div><span>本地时间</span><strong>{{ result.local }}</strong></div>
      <div><span>ISO 时间</span><strong>{{ result.iso }}</strong></div>
      <div><span>时间戳（秒）</span><strong>{{ result.seconds }}</strong></div>
      <div><span>时间戳（毫秒）</span><strong>{{ result.milliseconds }}</strong></div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const unit = ref('seconds')
const dateText = ref('')
const timestamp = ref('')
const error = ref('')
const result = ref({ local: '-', iso: '-', seconds: '-', milliseconds: '-' })

function formatLocal(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function convert() {
  error.value = ''
  let date
  if (timestamp.value.trim()) {
    const numeric = Number(timestamp.value.trim())
    if (!Number.isFinite(numeric)) { error.value = '时间戳必须是数字'; return }
    date = new Date(unit.value === 'seconds' ? numeric * 1000 : numeric)
  } else if (dateText.value.trim()) {
    date = new Date(dateText.value.trim().replace(' ', 'T'))
  } else {
    error.value = '请输入日期时间或时间戳'
    return
  }
  if (Number.isNaN(date.getTime())) { error.value = '无法识别输入的日期时间'; return }
  result.value = { local: formatLocal(date), iso: date.toISOString(), seconds: Math.floor(date.getTime() / 1000), milliseconds: date.getTime() }
}

function useNow() {
  dateText.value = formatLocal(new Date())
  timestamp.value = ''
  convert()
}

function clear() {
  dateText.value = ''
  timestamp.value = ''
  error.value = ''
  result.value = { local: '-', iso: '-', seconds: '-', milliseconds: '-' }
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 860px; }
.tool-panel__toolbar, .tool-panel__actions { display: flex; align-items: center; gap: 8px; }
.tool-panel__toolbar { justify-content: space-between; }
.timestamp-inputs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.timestamp-result { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 6px; overflow: hidden; }
.timestamp-result div { display: grid; gap: 5px; padding: 14px; background: var(--console-surface-muted, #f8fafc); }
.timestamp-result span { color: var(--console-text-secondary, #667085); font-size: 12px; }
.timestamp-result strong { overflow-wrap: anywhere; font: 13px/1.5 'Cascadia Code', Consolas, monospace; }
.timestamp-error { padding: 12px; border: 1px solid #fbc4c4; border-radius: 6px; color: #c45656; background: #fef0f0; }
@media (max-width: 600px) { .timestamp-inputs, .timestamp-result { grid-template-columns: 1fr; } }
</style>
