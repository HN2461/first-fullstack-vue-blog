<template>
  <section class="tool-panel">
    <div class="tool-panel__toolbar"><a-radio-group v-model:value="mode" size="small"><a-radio-button value="encode">文本 → 摩斯</a-radio-button><a-radio-button value="decode">摩斯 → 文本</a-radio-button></a-radio-group><a-button type="primary" size="small" @click="run">翻译</a-button></div>
    <div class="tool-split"><label class="tool-field"><span>输入</span><a-textarea v-model:value="input" :rows="10" spellcheck="false" /></label><label class="tool-field"><span>结果</span><a-textarea v-model:value="output" :rows="10" readonly spellcheck="false" /></label></div>
  </section>
</template>
<script setup>
import { ref } from 'vue'
const mode = ref('encode')
const input = ref('')
const output = ref('')
const map = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.' }
const reverse = Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]))
function run() { output.value = mode.value === 'encode' ? input.value.toUpperCase().split('').map((char) => char === ' ' ? '/' : map[char] || char).join(' ') : input.value.trim().split(/\s+/).map((part) => part === '/' ? ' ' : reverse[part] || part).join('') }
</script>
<style scoped>
.tool-panel { display: grid; gap: 16px; max-width: 900px; }.tool-panel__toolbar { display: flex; justify-content: space-between; gap: 8px; }.tool-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.tool-field { display: grid; gap: 7px; color: var(--console-text-secondary, #667085); font-size: 12px; }.tool-field :deep(textarea) { font: 14px/1.8 'Cascadia Code', Consolas, monospace; }
@media (max-width: 700px) { .tool-split { grid-template-columns: 1fr; } }
</style>
