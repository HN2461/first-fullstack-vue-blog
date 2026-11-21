<template>
  <ToolTextWorkspace
    v-model:input="input"
    :output="output"
    :error="error"
    example="#1677ff80"
    input-label="输入颜色"
    input-placeholder="#1677ff / #1677ff80 / rgb(22 119 255 / 50%) / hsl(215 100% 54%)"
    output-label="颜色转换结果"
    run-label="转换"
    @run="convert"
    @clear="clear"
  >
    <template #options>
      <span class="color-tool__formats">HEX / RGB / HSL</span>
      <a-tooltip v-if="color" :title="`上次转换颜色：${color}`">
        <span class="color-tool__swatch" :style="{ backgroundColor: color }" role="img" :aria-label="`上次转换颜色：${color}`" />
      </a-tooltip>
    </template>
  </ToolTextWorkspace>
</template>

<script setup>
import { ref } from 'vue'
import ToolTextWorkspace from '../components/ToolTextWorkspace.vue'
import { convertColor } from '../logic/colorConversion'

const input = ref('#1677ff')
const output = ref('')
const color = ref('')
const error = ref('')

function convert() {
  error.value = ''
  try {
    const result = convertColor(input.value)
    color.value = result.hex
    output.value = `HEX  ${result.hex}\nRGB  ${result.rgb}\nHSL  ${result.hsl}`
  } catch (cause) {
    output.value = ''
    color.value = ''
    error.value = cause.message
  }
}

function clear() {
  output.value = ''
  color.value = ''
  error.value = ''
}
</script>

<style scoped>
.color-tool__formats { color: var(--console-text-secondary); font-size: 12px; }
.color-tool__swatch { display: inline-block; width: 24px; height: 24px; border: 1px solid var(--console-border); border-radius: 4px; }
</style>
