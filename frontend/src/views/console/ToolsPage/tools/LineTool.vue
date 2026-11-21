<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    :source-key="mode"
    :example="example"
    input-label="输入文本"
    input-placeholder="每行输入一条文本"
    @run="run"
    @clear="clear"
  >
    <template #options>
      <a-select v-model:value="mode" size="small" show-search option-filter-prop="label" :options="modes" aria-label="文本行操作" style="width: 140px" />
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { processTextLines } from '../logic/textTools'

const mode = ref('sort')
const input = ref('')
const output = ref('')
const error = ref('')
const example = 'Vue\nNode.js\nVue\n\n MongoDB '
const modes = [
  { value: 'sort', label: '升序排序' },
  { value: 'reverse', label: '反转顺序' },
  { value: 'unique', label: '去重' },
  { value: 'trim', label: '修剪并移除空行' }
]

function run() {
  error.value = ''
  try {
    output.value = processTextLines(input.value, mode.value)
  } catch (cause) {
    output.value = ''
    error.value = cause.message
  }
}

function clear() {
  output.value = ''
  error.value = ''
}
</script>
