<template>
  <section class="tool-panel">
    <div class="regex-controls">
      <a-input v-model:value="pattern" addon-before="/" addon-after="/" placeholder="输入正则表达式" @input="run" />
      <a-input v-model:value="flags" class="regex-flags" maxlength="6" placeholder="gim" @input="run" />
    </div>
    <label class="tool-field"><span>测试文本</span><a-textarea v-model:value="text" :rows="9" spellcheck="false" placeholder="输入要匹配的文本" @input="run" /></label>
    <div class="regex-result-head"><span>匹配结果</span><a-tag :color="matches.length ? 'green' : 'default'">{{ matches.length }} 处匹配</a-tag></div>
    <div v-if="error" class="regex-error">{{ error }}</div>
    <div v-else-if="matches.length" class="regex-matches">
      <div v-for="(match, index) in matches" :key="`${match.index}-${index}`" class="regex-match">
        <span class="regex-match__index">{{ index + 1 }}</span><code>{{ match.value }}</code><small>位置 {{ match.index }}</small>
      </div>
    </div>
    <a-empty v-else description="暂无匹配结果" :image-style="{ height: '42px' }" />
  </section>
</template>

<script setup>
import { ref } from 'vue'

const pattern = ref('')
const flags = ref('g')
const text = ref('')
const matches = ref([])
const error = ref('')

function run() {
  error.value = ''
  matches.value = []
  if (!pattern.value || !text.value) return
  try {
    const regex = new RegExp(pattern.value, flags.value)
    if (regex.global) {
      matches.value = [...text.value.matchAll(regex)].map((item) => ({ value: item[0], index: item.index, groups: item.slice(1) }))
    } else {
      const item = regex.exec(text.value)
      if (item) matches.value = [{ value: item[0], index: item.index, groups: item.slice(1) }]
    }
  } catch (cause) {
    error.value = `正则表达式无效：${cause.message}`
  }
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 860px; }
.regex-controls { display: grid; grid-template-columns: minmax(0, 1fr) 90px; gap: 8px; }
.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.regex-result-head { display: flex; align-items: center; justify-content: space-between; color: var(--console-text-secondary, #667085); font-size: 12px; }
.regex-error { padding: 12px; border: 1px solid #fbc4c4; border-radius: 6px; color: #c45656; background: #fef0f0; font-size: 13px; }
.regex-matches { display: grid; gap: 7px; }
.regex-match { display: flex; align-items: center; gap: 10px; min-height: 38px; padding: 0 10px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 6px; }
.regex-match__index { width: 20px; color: var(--console-text-tertiary, #98a2b3); font-size: 12px; }
.regex-match code { flex: 1; overflow-wrap: anywhere; color: var(--console-primary, #1677ff); }
.regex-match small { color: var(--console-text-tertiary, #98a2b3); }
@media (max-width: 540px) { .regex-controls { grid-template-columns: 1fr; } }
</style>
