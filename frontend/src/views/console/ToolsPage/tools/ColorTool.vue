<template>
  <section class="tool-panel color-tool">
    <div class="color-preview" :style="{ background: color }"><code>{{ color || '输入颜色' }}</code></div>
    <div class="tool-panel__toolbar"><a-input v-model:value="input" size="small" placeholder="#1677ff / rgb(22,119,255)" /><a-button size="small" type="primary" @click="convert">转换</a-button></div>
    <div class="color-results"><div v-for="item in results" :key="item.label"><span>{{ item.label }}</span><code>{{ item.value }}</code></div></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
  </section>
</template>

<script setup>
import { ref } from 'vue'

const input = ref('#1677ff')
const color = ref('#1677ff')
const error = ref('')
const results = ref([{ label: 'HEX', value: '#1677ff' }, { label: 'RGB', value: 'rgb(22, 119, 255)' }, { label: 'HSL', value: 'hsl(214, 100%, 54%)' }])

function convert() {
  error.value = ''
  const value = input.value.trim()
  let match = value.match(/^#?([\da-f]{3}|[\da-f]{6})$/i)
  if (!match) match = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (!match) {
    error.value = '请输入 HEX 或 RGB 颜色值'
    return
  }
  const rgb = match[1].length <= 3 && !value.toLowerCase().startsWith('rgb') ? match[1].split('').map((item) => parseInt(item + item, 16)) : match.slice(1, 4).map(Number)
  const [r, g, b] = rgb
  if ([r, g, b].some((item) => Number.isNaN(item) || item > 255)) {
    error.value = '颜色值超出范围'
    return
  }
  const hex = `#${rgb.map((item) => item.toString(16).padStart(2, '0')).join('')}`
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const light = (max + min) / 2
  const delta = max - min
  let hue = 0
  let saturation = 0
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * light - 1))
    if (max === r / 255) hue = 60 * (((g - b) / 255 / delta) % 6)
    else if (max === g / 255) hue = 60 * ((b - r) / 255 / delta + 2)
    else hue = 60 * ((r - g) / 255 / delta + 4)
  }
  if (hue < 0) hue += 360
  color.value = hex
  results.value = [{ label: 'HEX', value: hex }, { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` }, { label: 'HSL', value: `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(light * 100)}%)` }]
}
</script>

<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 700px; }.tool-panel__toolbar { display: flex; gap: 8px; }.tool-panel__toolbar :deep(.ant-input) { font: 13px 'Cascadia Code', Consolas, monospace; }.color-preview { display: grid; min-height: 100px; place-items: center; border-radius: 8px; }.color-preview code { padding: 5px 8px; border-radius: 4px; color: #fff; background: rgba(0, 0, 0, .35); }.color-results { display: grid; gap: 8px; }.color-results div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 12px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 6px; }.color-results span { color: var(--console-text-secondary, #667085); font-size: 12px; }.color-results code { font: 13px 'Cascadia Code', Consolas, monospace; }
</style>
