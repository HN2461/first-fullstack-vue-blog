<template>
  <section class="tool-panel">
    <label class="tool-field"><span>文本</span><a-textarea v-model:value="input" :rows="12" spellcheck="false" placeholder="输入或粘贴文本，统计会实时更新" /></label>
    <div class="stats-grid"><div v-for="item in stats" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div></div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const input = ref('')
const stats = computed(() => [
  { label: '字符数', value: input.value.length },
  { label: '非空白字符', value: input.value.replace(/\s/g, '').length },
  { label: '单词数', value: input.value.trim() ? input.value.trim().split(/\s+/).length : 0 },
  { label: '行数', value: input.value ? input.value.split(/\r?\n/).length : 0 },
  { label: 'UTF-8 字节', value: new TextEncoder().encode(input.value).length }
])
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 860px; }
.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.stats-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.stats-grid div { display: grid; gap: 5px; padding: 12px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 6px; background: var(--console-surface-muted, #f8fafc); }
.stats-grid span { color: var(--console-text-secondary, #667085); font-size: 12px; }.stats-grid strong { font-size: 20px; }
@media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
