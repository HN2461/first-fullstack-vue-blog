<template>
  <section class="tool-panel lorem-tool">
    <div class="lorem-toolbar">
      <div class="lorem-options">
        <label for="tool-lorem-kind">文本类型</label>
        <a-select id="tool-lorem-kind" v-model:value="kind" size="small" :options="kindOptions" show-search option-filter-prop="label" aria-label="占位文本类型" />
        <label for="tool-lorem-count">{{ kind === 'code' ? '行数' : '段数' }}</label>
        <a-input-number id="tool-lorem-count" v-model:value="count" :min="1" :max="100" size="small" />
      </div>
      <div class="lorem-result-actions">
        <small>{{ Array.from(output).length.toLocaleString() }} 字符</small>
        <a-button type="primary" size="small" @click="generate">生成文本</a-button>
        <a-button size="small" :disabled="!output || resultStale || Boolean(error)" @click="copyToolResult(output)">复制结果</a-button>
      </div>
    </div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div class="lorem-output">
      <a-textarea id="tool-lorem-output" :value="output" aria-label="生成的占位文本" readonly spellcheck="false" placeholder="选择文本类型和数量后生成" />
    </div>
    <div class="lorem-note" role="status">{{ resultStale ? '选项已修改，请重新生成文本。' : '选择文本类型和数量，生成可复制的占位文本。' }}</div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { copyToolResult } from '../utils/copyToolResult'
import { generatePlaceholder } from '../logic/textTools'

const kindOptions = [{ value: 'zh', label: '中文' }, { value: 'en', label: 'English' }, { value: 'code', label: '代码占位' }]
const kind = ref('zh')
const count = ref(3)
const output = ref('')
const error = ref('')
const generatedSource = ref('')
const sourceKey = computed(() => JSON.stringify([kind.value, count.value]))
const resultStale = computed(() => Boolean(output.value && sourceKey.value !== generatedSource.value))
function generate() {
  error.value = ''
  try {
    output.value = generatePlaceholder(kind.value, count.value)
    generatedSource.value = sourceKey.value
  } catch (cause) {
    output.value = ''
    generatedSource.value = ''
    error.value = cause.message
  }
}

generate()
</script>

<style scoped>
.lorem-tool { display: flex; flex: 1; flex-direction: column; gap: 12px; min-width: 0; min-height: 0; overflow: hidden; }
.lorem-toolbar, .lorem-options, .lorem-output-head, .lorem-result-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.lorem-toolbar { justify-content: space-between; flex: 0 0 auto; }
.lorem-options { color: var(--console-text-secondary); font-size: 12px; }
.lorem-options :deep(.ant-select) { width: 130px; }
.lorem-options :deep(.ant-input-number) { width: 90px; }
.lorem-output { display: flex; flex: 1; flex-direction: column; gap: 8px; min-height: 0; }
.lorem-output-head { justify-content: space-between; flex: 0 0 auto; min-height: 28px; color: var(--console-text-secondary); font-size: 12px; }
.lorem-result-actions small { font-size: 11px; }
.lorem-output :deep(textarea) { flex: 1; height: 100%; min-height: 0; resize: none; font: 13px/1.8 'Cascadia Code', Consolas, monospace; }
.lorem-note { flex: 0 0 auto; max-height: 42px; overflow: auto; color: var(--console-text-secondary); font-size: 12px; }
</style>
