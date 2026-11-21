<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    :source-key="mode"
    :example="example"
    :input-label="mode === 'decode' ? 'URL 或查询串' : '每行一个 key=value'"
    :input-placeholder="mode === 'decode' ? '粘贴 URL 或 ?key=value 查询串' : '每行输入 key=value，同名参数可重复，值两端空格会保留'"
    :output-label="mode === 'decode' ? '有序查询参数 JSON' : '查询串'"
    @run="run"
    @clear="clear"
  >
    <template #options>
      <a-radio-group v-model:value="mode" size="small">
        <a-radio-button value="decode">解析 URL</a-radio-button>
        <a-radio-button value="encode">生成查询串</a-radio-button>
      </a-radio-group>
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { computed, ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { generateQuery, parseQuery } from '../logic/queryString'

const mode = ref('decode')
const input = ref('')
const output = ref('')
const error = ref('')
const example = computed(() => mode.value === 'decode' ? 'https://example.com/search?q=Vue%203&page=1' : 'q=Vue 3\npage=1')

function run() {
  error.value = ''
  try {
    // 有序键值列表保留重复参数及值中的换行，避免对象覆盖或显示成新的参数行。
    output.value = mode.value === 'decode' ? JSON.stringify(parseQuery(input.value), null, 2) : generateQuery(input.value)
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
