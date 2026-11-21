<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    :source-key="mode"
    :example="example"
    :input-label="mode === 'encode' ? '输入文本' : '输入摩斯电码'"
    :input-placeholder="mode === 'encode' ? '支持英文字母、数字和常见标点；空白分隔单词' : '空格分隔字符，/ 分隔单词'"
    run-label="翻译"
    @run="run"
    @clear="clear"
  >
    <template #options>
      <a-radio-group v-model:value="mode" size="small">
        <a-radio-button value="encode">文本 → 摩斯</a-radio-button>
        <a-radio-button value="decode">摩斯 → 文本</a-radio-button>
      </a-radio-group>
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { computed, ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { translateMorse } from '../logic/textTools'

const mode = ref('encode')
const input = ref('')
const output = ref('')
const error = ref('')
const example = computed(() => mode.value === 'encode' ? 'HELLO WORLD' : '.... . .-.. .-.. --- / .-- --- .-. .-.. -..')

function run() {
  error.value = ''
  try {
    output.value = translateMorse(input.value, mode.value)
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
