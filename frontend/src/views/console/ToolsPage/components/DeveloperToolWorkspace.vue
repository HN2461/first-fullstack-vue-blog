<template>
  <section class="developer-tool-workspace">
    <div class="developer-tool-workspace__toolbar"><slot name="toolbar" /></div>
    <div :class="['developer-tool-workspace__panes', { 'developer-tool-workspace__panes--result': resultOnly }]">
      <div v-show="!resultOnly" class="developer-tool-workspace__pane">
        <slot name="input">
          <ToolCodeEditor ref="inputEditor" :model-value="input" :label="inputLabel" :placeholder="inputPlaceholder" :language="inputLanguage" :wrap="wrap" :indent="indent" :diagnostic="diagnostic" @update:model-value="emit('update:input', $event)" @limit="emit('error', $event)" @scroll="syncFrom('input')" @execute="emit('execute')" />
        </slot>
      </div>
      <div class="developer-tool-workspace__pane">
        <ToolCodeEditor ref="outputEditor" :model-value="output" :label="outputLabel" :placeholder="outputPlaceholder" :language="outputLanguage" readonly :wrap="wrap" :indent="indent" @scroll="syncFrom('output')" @execute="emit('execute')" />
      </div>
    </div>
    <div v-if="error || status" :class="['developer-tool-workspace__status', { 'developer-tool-workspace__status--error': error }]" :role="error ? 'alert' : 'status'">
      <span>{{ error || status }}</span>
      <a-button v-if="error && diagnostic" type="link" size="small" @click="inputEditor?.reveal(diagnostic.offset)">定位输入</a-button>
    </div>
  </section>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import ToolCodeEditor from './ToolCodeEditor.vue'

const props = defineProps({
  input: { type: String, default: '' }, output: { type: String, default: '' },
  inputLabel: { type: String, default: '输入内容' }, outputLabel: { type: String, default: '处理结果' },
  inputPlaceholder: { type: String, default: '在左侧输入或载入文件' }, outputPlaceholder: { type: String, default: '右侧显示处理结果' },
  inputLanguage: { type: String, default: 'text' }, outputLanguage: { type: String, default: 'text' },
  wrap: { type: Boolean, default: true }, indent: { type: String, default: '2' },
  diagnostic: { type: Object, default: null }, error: { type: String, default: '' }, status: { type: String, default: '' },
  resultOnly: { type: Boolean, default: false }, syncScroll: { type: Boolean, default: false }
})
const emit = defineEmits(['update:input', 'error', 'execute'])
const inputEditor = ref(null)
const outputEditor = ref(null)
let lastSync = 0

function syncFrom(pane) {
  if (!props.syncScroll || performance.now() - lastSync < 30) return
  const source = pane === 'input' ? inputEditor.value : outputEditor.value
  const target = pane === 'input' ? outputEditor.value : inputEditor.value
  const scroll = source?.getScroll()
  if (!scroll || scroll.maximum <= 0) return
  lastSync = performance.now()
  target?.setScrollRatio(scroll.top / scroll.maximum)
}

watch(() => props.resultOnly, () => nextTick(() => {
  inputEditor.value?.measure()
  outputEditor.value?.measure()
}))
defineExpose({ inputEditor, outputEditor })
</script>

<style scoped>
.developer-tool-workspace { display: flex; flex: 1; flex-direction: column; container-type: inline-size; width: 100%; height: 100%; min-width: 0; min-height: 0; gap: 8px; }
.developer-tool-workspace__toolbar { display: flex; align-items: center; flex: 0 0 auto; flex-wrap: wrap; gap: 8px; min-height: 32px; }
.developer-tool-workspace__panes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: minmax(160px, 1fr); flex: 1; min-width: 0; min-height: 0; gap: 12px; overflow: auto; }
.developer-tool-workspace__pane { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.developer-tool-workspace__panes--result { grid-template-columns: minmax(0, 1fr); }
.developer-tool-workspace__status { display: flex; align-items: flex-start; flex: 0 0 auto; gap: 8px; max-height: 48px; overflow-y: auto; color: var(--console-text-secondary); font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
.developer-tool-workspace__status--error { color: var(--ant-color-error, #ff4d4f); }
@container (max-width: 640px) {
  .developer-tool-workspace__panes { grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(2, minmax(160px, 1fr)); }
  .developer-tool-workspace__panes--result { grid-template-rows: minmax(160px, 1fr); }
}
</style>
