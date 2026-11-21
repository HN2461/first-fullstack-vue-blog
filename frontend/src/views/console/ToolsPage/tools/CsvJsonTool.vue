<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    :source-key="parseNumbers"
    :example="example"
    input-label="CSV / TSV"
    input-placeholder="输入逗号或 Tab 分隔的表头和数据"
    output-label="JSON"
    run-label="转换"
    @run="run"
    @clear="clear"
  >
    <template #options>
      <a-checkbox v-model:checked="parseNumbers">安全识别数字</a-checkbox>
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { tableToObjects } from '../logic/delimitedText'

const input = ref('')
const output = ref('')
const error = ref('')
const parseNumbers = ref(false)
const example = 'name,id,note\n小明,00123,"支持逗号,和双引号"\n小红,9007199254740993,"第一行\n第二行"'

function run() {
  error.value = ''
  try {
    output.value = JSON.stringify(tableToObjects(input.value, parseNumbers.value), null, 2)
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
