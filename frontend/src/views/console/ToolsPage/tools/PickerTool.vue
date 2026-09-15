<template>
  <section class="tool-panel picker-tool">
    <label class="tool-field"><span>候选项</span><a-textarea v-model:value="itemsText" :rows="10" placeholder="每行一个候选项" /></label>
    <div class="picker-actions"><a-button size="small" @click="loadExample">填入示例</a-button><a-button size="small" @click="clear">清空</a-button><a-button type="primary" @click="pick">随机选择</a-button></div>
    <div class="picker-result" :class="{ active: result }"><span>本次选择</span><strong>{{ result || '等待选择' }}</strong></div>
    <a-alert v-if="error" type="warning" show-icon :message="error" />
  </section>
</template>

<script setup>
import { ref } from 'vue'

const itemsText = ref('')
const result = ref('')
const error = ref('')

function pick() {
  error.value = ''
  const items = itemsText.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
  if (!items.length) { error.value = '请先输入至少一个候选项'; result.value = ''; return }
  const index = crypto.getRandomValues(new Uint32Array(1))[0] % items.length
  result.value = items[index]
}

function loadExample() {
  itemsText.value = '番茄炒蛋\n咖喱鸡\n牛肉面\n寿司'
  result.value = ''
  error.value = ''
}

function clear() {
  itemsText.value = ''
  result.value = ''
  error.value = ''
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 860px; }
.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.picker-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.picker-result { display: grid; gap: 8px; min-height: 130px; place-content: center; padding: 20px; border: 1px dashed var(--console-border, #cbd5e1); border-radius: 8px; color: var(--console-text-secondary, #667085); background: var(--console-surface-muted, #f8fafc); text-align: center; }
.picker-result.active { border-style: solid; border-color: var(--console-primary, #1677ff); background: var(--console-primary-soft, #f5f9ff); }
.picker-result span { font-size: 12px; }
.picker-result strong { color: var(--console-primary, #1677ff); font-size: 26px; line-height: 1.3; }
</style>
