<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar">
      <a-radio-group v-model:value="mode" size="small">
        <a-radio-button value="format">格式化</a-radio-button>
        <a-radio-button value="minify">压缩</a-radio-button>
      </a-radio-group>
      <div class="tool-panel__actions">
        <a-button size="small" @click="loadExample">示例</a-button>
        <a-button size="small" @click="clear">清空</a-button>
        <a-button size="small" type="primary" @click="run">处理</a-button>
      </div>
    </div>
    <div class="tool-split">
      <label class="tool-field"><span>输入 JSON</span><a-textarea v-model:value="input" :rows="15" spellcheck="false" placeholder="粘贴 JSON 文本" /></label>
      <label class="tool-field"><span>处理结果</span><a-textarea v-model:value="output" :rows="15" readonly spellcheck="false" :status="error ? 'error' : undefined" placeholder="结果会显示在这里" /></label>
    </div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <a-alert v-else-if="output" type="success" show-icon message="JSON 校验通过" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'

const input = ref('')
const output = ref('')
const error = ref('')
const mode = ref('format')

function run() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) {
    error.value = '请输入 JSON 文本'
    return
  }
  try {
    const parsed = JSON.parse(input.value)
    output.value = mode.value === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2)
  } catch (cause) {
    error.value = `JSON 无法解析：${cause.message}`
  }
}

function loadExample() {
  input.value = JSON.stringify({ name: 'tools', enabled: true, items: [1, 2, 3] }, null, 2)
  run()
}

function clear() {
  input.value = ''
  output.value = ''
  error.value = ''
  message.info('已清空 JSON 工具')
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; }
.tool-panel__toolbar, .tool-panel__actions { display: flex; align-items: center; gap: 8px; }
.tool-panel__toolbar { justify-content: space-between; }
.tool-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.tool-field :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
@media (max-width: 700px) { .tool-split { grid-template-columns: 1fr; } }
</style>
