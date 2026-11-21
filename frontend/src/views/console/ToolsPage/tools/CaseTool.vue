<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    :source-key="mode"
    :example="example"
    input-label="输入文本"
    input-placeholder="输入需要转换格式的文本"
    run-label="转换"
    @run="run"
    @clear="clear"
  >
    <template #options>
      <a-select v-model:value="mode" size="small" show-search option-filter-prop="label" :options="modes" aria-label="文本格式" style="width: 160px" />
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { convertTextCase } from '../logic/textTools'

const mode = ref('upper')
const input = ref('')
const output = ref('')
const error = ref('')

const example = 'HTTPServer helloWorld Vue3Component'
const modes = [
  { value: 'upper', label: '全部大写' },
  { value: 'lower', label: '全部小写' },
  { value: 'title', label: '标题格式' },
  { value: 'camel', label: 'camelCase' },
  { value: 'pascal', label: 'PascalCase' },
  { value: 'snake', label: 'snake_case' },
  { value: 'kebab', label: 'kebab-case' }
]

function run() {
  error.value = ''
  try {
    output.value = convertTextCase(input.value, mode.value)
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
