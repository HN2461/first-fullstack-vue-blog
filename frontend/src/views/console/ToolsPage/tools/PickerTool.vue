<template>
  <section class="tool-panel picker-tool">
    <div class="picker-toolbar">
      <span>每行填写一个候选项</span>
      <div class="picker-actions">
        <a-button size="small" @click="loadExample">示例</a-button>
        <a-popconfirm title="清空候选项和选择结果？" @confirm="clear">
          <a-button size="small" :disabled="!itemsText && !result">清空</a-button>
        </a-popconfirm>
        <a-button type="primary" size="small" @click="pick">随机选择</a-button>
      </div>
    </div>
    <div class="picker-workspace">
      <div class="picker-panel">
        <div class="picker-panel-head"><label for="tool-picker-items">候选项</label><small>{{ candidateCount }} 项</small></div>
        <a-textarea id="tool-picker-items" v-model:value="itemsText" spellcheck="false" placeholder="每行一个候选项" />
      </div>
      <section class="picker-panel" aria-label="随机选择结果">
        <div class="picker-panel-head">
          <span>本次选择</span>
          <a-tooltip title="复制选择结果">
            <a-button type="text" size="small" :disabled="!result || resultStale" aria-label="复制选择结果" @click="copyToolResult(result, '选择结果')">
              <template #icon><Copy :size="14" /></template>
            </a-button>
          </a-tooltip>
        </div>
        <div class="picker-result-body">
          <div class="picker-result">
            <template v-if="result"><strong>{{ result }}</strong></template>
            <template v-else><Shuffle :size="28" aria-hidden="true" /><span>等待选择</span><small>填写候选项后，点击“随机选择”。</small></template>
          </div>
        </div>
      </section>
    </div>
    <div class="picker-note" :class="{ 'picker-note--error': error }" :role="error ? 'alert' : 'status'">{{ error || (resultStale ? '候选项已修改，请重新选择。' : '空行会忽略，选择结果在当前页面生成。') }}</div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Copy, Shuffle } from '@lucide/vue'
import { copyToolResult } from '../utils/copyToolResult'
import { chooseItem } from '../logic/randomTools'

const itemsText = ref('')
const result = ref('')
const error = ref('')
const selectedSource = ref('')
const candidateCount = computed(() => itemsText.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).length)
const resultStale = computed(() => Boolean(result.value && selectedSource.value !== itemsText.value))

function pick() {
  error.value = ''
  try {
    result.value = chooseItem(itemsText.value).value
    selectedSource.value = itemsText.value
  } catch (cause) {
    result.value = ''
    selectedSource.value = ''
    error.value = cause.message
  }
}

function loadExample() {
  itemsText.value = '番茄炒蛋\n咖喱鸡\n牛肉面\n寿司'
  result.value = ''
  error.value = ''
  selectedSource.value = ''
}

function clear() {
  itemsText.value = ''
  result.value = ''
  error.value = ''
  selectedSource.value = ''
}
</script>

<style scoped>
.picker-tool { container-type: inline-size; display: flex; flex: 1; flex-direction: column; gap: 12px; min-width: 0; min-height: 0; overflow: hidden; }
.picker-toolbar, .picker-actions, .picker-panel-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.picker-toolbar { justify-content: space-between; flex: 0 0 auto; color: var(--console-text-secondary); font-size: 12px; }
.picker-workspace { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: minmax(0, 1fr); gap: 12px; flex: 1; min-height: 0; }
.picker-panel { display: flex; flex-direction: column; gap: 8px; min-width: 0; min-height: 0; }
.picker-panel-head { justify-content: space-between; flex: 0 0 auto; min-height: 28px; color: var(--console-text-secondary); font-size: 12px; }
.picker-panel-head small { font-size: 11px; }
.picker-panel :deep(textarea) { flex: 1; height: 100%; min-height: 0; resize: none; font: 13px/1.65 'Cascadia Code', Consolas, monospace; }
.picker-result-body { display: flex; flex: 1; flex-direction: column; min-height: 0; overflow: auto; border: 1px solid var(--console-border); border-radius: 6px; }
.picker-result { display: flex; flex: 0 0 auto; flex-direction: column; align-items: center; gap: 12px; margin: auto 0; padding: 20px; color: var(--console-text-secondary); text-align: center; }
.picker-result strong { width: 100%; overflow-wrap: anywhere; color: var(--console-text); font-size: 22px; font-weight: 500; line-height: 1.5; white-space: pre-wrap; }
.picker-result > span { color: var(--console-text); font-size: 14px; }
.picker-result small { font-size: 12px; }
.picker-note { flex: 0 0 auto; max-height: 42px; overflow: auto; color: var(--console-text-secondary); font-size: 12px; }
.picker-note--error { color: var(--ant-color-error, #ff4d4f); }
@container (max-width: 680px) { .picker-workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) { .picker-workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 8px; } }
</style>
