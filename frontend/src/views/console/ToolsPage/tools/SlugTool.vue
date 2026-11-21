<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    :source-key="removeStopwords"
    :example="example"
    input-label="标题或文本"
    input-placeholder="输入中文、英文标题或短文本，中文会保留"
    output-label="Slug"
    run-label="生成 Slug"
    @run="run"
    @clear="clear"
  >
    <template #options>
      <a-checkbox v-model:checked="removeStopwords">移除常见连接词</a-checkbox>
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { createSlug } from '../logic/textTools'

const input = ref('')
const output = ref('')
const error = ref('')
const removeStopwords = ref(false)
const example = 'Vue 3 中文指南：A Guide to Node.js'

function run() {
  error.value = ''
  try {
    output.value = createSlug(input.value, removeStopwords.value)
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
