<template>
  <section class="tool-panel hash-tool">
    <div class="hash-toolbar">
      <div class="hash-options">
        <label for="tool-hash-algorithm">算法</label>
        <a-select id="tool-hash-algorithm" v-model:value="algorithm" size="small" show-search option-filter-prop="label" :options="algorithmOptions" aria-label="摘要算法" />
      </div>
      <div class="hash-actions">
        <a-popconfirm title="清空文本和摘要结果？" @confirm="clear">
          <a-button size="small" :disabled="loading || (!input && !output)">清空</a-button>
        </a-popconfirm>
        <a-button size="small" type="primary" :loading="loading" @click="run">计算摘要</a-button>
        <a-button size="small" :disabled="!output || resultStale || loading" @click="copyToolResult(output, '摘要')">复制摘要</a-button>
      </div>
    </div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div class="hash-input-area">
      <div class="hash-editor">
        <a-textarea id="tool-hash-input" v-model:value="input" aria-label="摘要原文" spellcheck="false" placeholder="输入需要计算摘要的文本；空文本也可计算" />
      </div>
    </div>
    <div class="hash-output-area">
      <a-textarea id="tool-hash-output" :value="output" :rows="3" :aria-label="`${processedSource?.algorithm || algorithm} 摘要`" readonly spellcheck="false" placeholder="摘要结果" />
    </div>
    <div class="hash-note" role="status">{{ resultStale ? '文本或算法已修改，请重新计算。' : '摘要在当前浏览器中计算。' }}</div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onDeactivated, ref, watch } from 'vue'
import { copyToolResult } from '../utils/copyToolResult'
import { createHashRunner, HASH_ALGORITHMS } from '../logic/hash'

const algorithmOptions = HASH_ALGORITHMS.map((value) => ({ value, label: value }))
const runner = createHashRunner()
let requestId = 0
const algorithm = ref('SHA-256')
const input = ref('')
const output = ref('')
const error = ref('')
const loading = ref(false)
const processedSource = ref(null)
const resultStale = computed(() => Boolean(output.value && (
  processedSource.value?.input !== input.value || processedSource.value?.algorithm !== algorithm.value
)))

async function run() {
  if (loading.value) return
  error.value = ''
  output.value = ''
  loading.value = true
  // 保留本次计算的参数快照，输入变化时不会把旧摘要当作新文本的结果。
  const source = { input: input.value, algorithm: algorithm.value }
  const request = ++requestId
  try {
    const result = await runner.run(source.input, source.algorithm)
    if (result === null || request !== requestId) return
    output.value = result
    processedSource.value = source
  } catch (cause) {
    if (request !== requestId) return
    processedSource.value = null
    error.value = cause.message
  } finally {
    if (request === requestId) loading.value = false
  }
}

function clear() {
  invalidate()
  input.value = ''
  output.value = ''
  error.value = ''
  processedSource.value = null
}

function invalidate() {
  requestId += 1
  runner.cancel()
  loading.value = false
  error.value = ''
}

watch([input, algorithm], invalidate, { flush: 'sync' })
onDeactivated(invalidate)
onBeforeUnmount(invalidate)
</script>

<style scoped>
.hash-tool { display: flex; flex: 1; flex-direction: column; gap: 12px; min-width: 0; min-height: 0; overflow: hidden; }
.hash-toolbar, .hash-options, .hash-actions, .hash-output-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 0 0 auto; }
.hash-toolbar, .hash-output-head { justify-content: space-between; }
.hash-options { color: var(--console-text-secondary); font-size: 12px; }
.hash-options :deep(.ant-select) { width: 140px; }
.hash-input-area { display: flex; flex: 1; flex-direction: column; gap: 7px; min-height: 0; }
.hash-input-area > label, .hash-output-head > label { color: var(--console-text-secondary); font-size: 12px; }
.hash-output-head > label > span { margin-left: 6px; color: var(--console-text-tertiary); }
.hash-editor { flex: 1; min-height: 0; }
.hash-editor :deep(textarea) { height: 100%; min-height: 0; resize: none; }
.hash-output-area { display: grid; gap: 7px; flex: 0 0 auto; }
.hash-output-area :deep(textarea) { resize: none; }
.hash-tool :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
.hash-note { flex: 0 0 auto; color: var(--console-text-secondary); font-size: 12px; }
.hash-tool > :deep(.ant-alert) { flex: 0 0 auto; }
</style>
