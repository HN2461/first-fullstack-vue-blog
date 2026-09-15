<template>
  <section class="tool-panel">
    <label class="tool-field"><span>标题或文本</span><a-textarea v-model:value="input" :rows="8" spellcheck="false" placeholder="输入英文标题或短文本" /></label>
    <div class="tool-panel__toolbar"><a-checkbox v-model:checked="removeStopwords">移除常见连接词</a-checkbox><a-button size="small" type="primary" @click="run">生成 Slug</a-button></div>
    <label class="tool-field"><span>Slug</span><a-input v-model:value="output" readonly /></label>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const input = ref('')
const output = ref('')
const removeStopwords = ref(true)
function run() {
  const stopwords = new Set(['a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'for'])
  output.value = input.value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter((word) => word && (!removeStopwords.value || !stopwords.has(word))).join('-').replace(/-+/g, '-')
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 760px; }.tool-panel__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; }.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }.tool-field :deep(input) { font: 13px 'Cascadia Code', Consolas, monospace; }
</style>
