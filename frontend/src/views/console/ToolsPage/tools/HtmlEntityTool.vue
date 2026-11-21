<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :source-key="mode"
    :example="example"
    :input-label="mode === 'encode' ? '输入 HTML 文本' : '输入 HTML 实体'"
    input-placeholder="输入待编码或解码的文本"
    @run="run"
    @clear="clear"
  >
    <template #options>
      <a-radio-group v-model:value="mode" size="small">
        <a-radio-button value="encode">编码</a-radio-button>
        <a-radio-button value="decode">解码</a-radio-button>
      </a-radio-group>
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { computed, ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { convertHtmlEntities } from '../logic/htmlEntities'

const mode = ref('encode')
const input = ref('')
const output = ref('')

const example = computed(() => mode.value === 'encode' ? '<p>知识库 & 工具箱</p>' : '&lt;p&gt;知识库 &amp; 工具箱&lt;/p&gt;')

function run() {
  output.value = convertHtmlEntities(input.value, mode.value)
}

function clear() {
  output.value = ''
}
</script>
