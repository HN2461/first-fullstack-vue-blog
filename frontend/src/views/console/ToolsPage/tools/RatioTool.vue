<template>
  <section class="tool-panel ratio-tool">
    <div class="ratio-toolbar"><span>按原 A : B，换算新 A 对应的新 B</span><div class="ratio-actions"><a-button size="small" :disabled="!result || stale" @click="copyToolResult(result, '新 B')">复制结果</a-button><a-button type="primary" size="small" @click="convert">换算</a-button></div></div>
    <div class="ratio-fields"><label for="tool-ratio-a"><span>原 A（大于 0）</span><a-input id="tool-ratio-a" v-model:value="a" inputmode="decimal" @press-enter="convert" /></label><label for="tool-ratio-b"><span>原 B（非负）</span><a-input id="tool-ratio-b" v-model:value="b" inputmode="decimal" @press-enter="convert" /></label><label for="tool-ratio-new-a"><span>新 A（非负）</span><a-input id="tool-ratio-new-a" v-model:value="newA" inputmode="decimal" @press-enter="convert" /></label></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div v-if="result" class="ratio-result"><span>新 B</span><strong>{{ result }}</strong><small>本次比例 {{ source.a }} : {{ source.b }}，新 A 为 {{ source.newA }}</small></div>
    <div class="ratio-note" role="status">{{ stale ? '输入已修改，请重新换算。' : '新 B = 新 A × 原 B ÷ 原 A；保留两位小数，原 A 为零时不执行。' }}</div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { calculateRatio } from '../logic/calculationTools'
import { copyToolResult } from '../utils/copyToolResult'
const a = ref('16')
const b = ref('9')
const newA = ref('1920')
const result = ref('')
const error = ref('')
const source = ref(null)
const stale = computed(() => Boolean(source.value && (source.value.a !== a.value || source.value.b !== b.value || source.value.newA !== newA.value)))
function convert() {
  error.value = ''
  try {
    result.value = calculateRatio(a.value, b.value, newA.value)
    source.value = { a: a.value, b: b.value, newA: newA.value }
  } catch (cause) {
    result.value = ''
    source.value = null
    error.value = cause.message
  }
}
convert()
</script>
<style scoped>
.ratio-tool { display: flex; flex: 1; flex-direction: column; gap: 14px; min-width: 0; min-height: 0; overflow: auto; }.ratio-toolbar, .ratio-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }.ratio-toolbar { justify-content: space-between; color: var(--console-text-secondary); font-size: 12px; }.ratio-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }.ratio-fields label { display: grid; gap: 7px; color: var(--console-text-secondary); font-size: 12px; }.ratio-result { display: grid; gap: 8px; padding: 16px; border: 1px solid var(--console-border); border-radius: 6px; }.ratio-result > span, .ratio-result small, .ratio-note { color: var(--console-text-secondary); font-size: 12px; }.ratio-result strong { min-width: 0; overflow-wrap: anywhere; font-size: 26px; font-weight: 500; }
@media (max-width: 600px) { .ratio-fields { grid-template-columns: 1fr; } }
</style>
