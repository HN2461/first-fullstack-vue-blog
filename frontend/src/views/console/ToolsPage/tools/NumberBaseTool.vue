<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    :source-key="fromBase"
    :example="example"
    input-label="输入整数"
    input-placeholder="输入完整整数，可使用正负号及对应进制的前缀"
    output-label="进制转换结果"
    run-label="转换"
    @run="convert"
    @clear="clear"
  >
    <template #options>
      <a-select v-model:value="fromBase" size="small" show-search option-filter-prop="label" :options="baseOptions" aria-label="来源进制" style="width: 130px" />
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { computed, ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { convertInteger } from '../logic/numberBase'

const input = ref('255')
const fromBase = ref(10)
const output = ref('')
const error = ref('')
const baseOptions = [{ value: 2, label: '二进制' }, { value: 8, label: '八进制' }, { value: 10, label: '十进制' }, { value: 16, label: '十六进制' }]
const example = computed(() => ({ 2: '11111111', 8: '377', 10: '9007199254740993', 16: 'FF' })[fromBase.value])

function convert() {
  error.value = ''
  try {
    const result = convertInteger(input.value, fromBase.value)
    output.value = `二进制    ${result.binary}\n八进制    ${result.octal}\n十进制    ${result.decimal}\n十六进制  ${result.hex}`
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
