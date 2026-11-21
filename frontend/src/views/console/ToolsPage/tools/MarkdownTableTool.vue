<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    :example="example"
    input-label="TSV / CSV"
    input-placeholder="输入 Tab 或逗号分隔的表头和数据"
    output-label="Markdown"
    run-label="生成表格"
    @run="run"
    @clear="clear"
  />
</template>

<script setup>
import { ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { tableToMarkdown } from '../logic/delimitedText'

const input = ref('')
const output = ref('')
const error = ref('')
const example = '姓名\t年龄\n小明\t18\n小红\t20'

function run() {
  error.value = ''
  try {
    output.value = tableToMarkdown(input.value)
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
