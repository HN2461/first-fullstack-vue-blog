<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    :source-key="`${mode}:${scope}`"
    :example="example"
    :input-label="mode === 'encode' ? '待编码文本' : '待解码 URL'"
    input-placeholder="输入 URL 或文本"
    @run="run"
    @clear="clear"
  >
    <template #options>
      <a-radio-group v-model:value="mode" size="small">
        <a-radio-button value="encode">编码</a-radio-button>
        <a-radio-button value="decode">解码</a-radio-button>
      </a-radio-group>
      <a-select v-model:value="scope" size="small" show-search option-filter-prop="label" :options="scopeOptions" aria-label="URL 处理范围" style="width: 160px" />
      <a-tooltip title="URI 组件会编码 /?&= 等结构符；完整 URI 保留结构符。这里不处理表单编码，加号 + 不转换为空格。"><span tabindex="0" aria-label="URL 编解码范围说明">范围说明</span></a-tooltip>
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { computed, ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { convertUrlEncoding } from '../logic/urlEncoding'

const mode = ref('encode')
const scope = ref('component')
const scopeOptions = [{ value: 'component', label: 'URI 组件（参数值）' }, { value: 'uri', label: '完整 URI' }]
const input = ref('')
const output = ref('')
const error = ref('')

const example = computed(() => {
  if (scope.value === 'uri') return mode.value === 'encode' ? 'https://example.com/知识库?q=Vue 3' : 'https://example.com/%E7%9F%A5%E8%AF%86%E5%BA%93?q=Vue%203'
  return mode.value === 'encode' ? '知识库 & 工具箱' : '%E7%9F%A5%E8%AF%86%E5%BA%93%20%26%20%E5%B7%A5%E5%85%B7%E7%AE%B1'
})

function run() {
  error.value = ''
  try {
    output.value = convertUrlEncoding(input.value, mode.value, scope.value)
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
