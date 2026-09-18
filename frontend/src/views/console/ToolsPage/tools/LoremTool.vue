<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><a-select v-model:value="kind" size="small" style="width: 130px"><a-select-option value="zh">中文</a-select-option><a-select-option value="en">English</a-select-option><a-select-option value="code">代码占位</a-select-option></a-select><a-input-number v-model:value="count" :min="1" :max="100" size="small" addon-before="数量" /><a-button type="primary" size="small" @click="generate">生成</a-button></div>
    <a-textarea v-model:value="output" :rows="14" readonly spellcheck="false" />
  </section>
</template>
<script setup>
import { ref } from 'vue'
const kind = ref('zh')
const count = ref(3)
const output = ref('')
const zh = '风起时，旧地图上的河流仍在发光。我们把问题拆成小块，再把灵感放回日常的缝隙里。'
const en = 'Curiosity turns small experiments into useful tools, one quiet iteration at a time.'
const code = 'const tinyIdea = () => ({ playful: true, useful: true })'
function generate() {
  const source = kind.value === 'zh' ? zh : kind.value === 'en' ? en : code
  output.value = Array.from({ length: count.value }, (_, index) => `${index + 1}. ${source}`).join('\n')
}
generate()
</script>
<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 900px; }.tool-panel__toolbar { display: flex; flex-wrap: wrap; gap: 8px; }.tool-panel :deep(textarea) { font: 13px/1.8 'Cascadia Code', Consolas, monospace; }
</style>
