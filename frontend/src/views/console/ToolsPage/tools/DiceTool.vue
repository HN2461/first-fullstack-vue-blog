<template>
  <section class="tool-panel dice-tool">
    <div class="dice-toolbar">
      <div class="dice-options">
        <div class="dice-field">
          <label for="tool-dice-sides">面数（2–100）</label>
          <a-input-number id="tool-dice-sides" v-model:value="sides" :min="2" :max="100" size="small" />
        </div>
        <div class="dice-field">
          <label for="tool-dice-count">数量（1–20）</label>
          <a-input-number id="tool-dice-count" v-model:value="count" :min="1" :max="20" size="small" />
        </div>
      </div>
      <div class="dice-actions"><a-button size="small" @click="flip">抛硬币</a-button><a-button type="primary" size="small" @click="roll">掷骰子</a-button></div>
    </div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div class="dice-result-head"><span>{{ result ? result.kind === 'dice' ? `${result.sides} 面骰子 · ${result.count} 颗` : '抛硬币 · 1 次' : '本次结果' }}</span><a-button size="small" :disabled="!result" @click="copyToolResult(resultText)">复制结果</a-button></div>
    <div class="dice-result">
      <template v-if="result?.kind === 'dice'"><div class="dice-values"><code v-for="(value, index) in result.values" :key="index">{{ value }}</code></div><p>总点数 <strong>{{ result.total }}</strong></p></template>
      <strong v-else-if="result">{{ result.face }}</strong>
      <span v-else>设置面数和数量后，点击掷骰子。</span>
    </div>
    <div class="dice-note">每次结果按本次参数单独生成；使用 Web Crypto 无偏抽样。</div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { rollDice, simulateCoins } from '../logic/randomTools'
import { copyToolResult } from '../utils/copyToolResult'
const sides = ref(6)
const count = ref(1)
const result = ref(null)
const error = ref('')
const resultText = computed(() => !result.value ? '' : result.value.kind === 'coin' ? result.value.face : `${result.value.sides} 面骰子 × ${result.value.count}：${result.value.values.join('、')}\n总点数：${result.value.total}`)
function roll() {
  error.value = ''
  try {
    result.value = { kind: 'dice', ...rollDice({ sides: sides.value, count: count.value }) }
  } catch (cause) {
    error.value = cause.message
    result.value = null
  }
}
function flip() {
  error.value = ''
  try {
    result.value = { kind: 'coin', face: simulateCoins(1).heads ? '正面' : '反面' }
  } catch (cause) {
    error.value = cause.message
    result.value = null
  }
}
</script>
<style scoped>
.dice-tool { display: flex; flex: 1; flex-direction: column; gap: 12px; min-height: 0; min-width: 0; overflow: hidden; }
.dice-toolbar, .dice-options, .dice-actions, .dice-result-head, .dice-field { display: flex; align-items: center; gap: 8px; }
.dice-toolbar, .dice-options, .dice-actions, .dice-result-head { flex: 0 0 auto; flex-wrap: wrap; max-width: 100%; }
.dice-toolbar, .dice-result-head { justify-content: space-between; }
.dice-options, .dice-result-head, .dice-note { color: var(--console-text-secondary); font-size: 12px; }
.dice-options :deep(.ant-input-number) { width: 88px; }
.dice-result { min-height: 0; overflow: auto; padding: 16px; border: 1px solid var(--console-border); border-radius: 6px; }
.dice-values { display: flex; flex-wrap: wrap; gap: 8px; }
.dice-values code { display: inline-flex; align-items: center; justify-content: center; min-width: 40px; min-height: 40px; padding: 6px; border: 1px solid var(--console-border); border-radius: 6px; font-size: 18px; }
.dice-result p { margin: 16px 0 0; }.dice-result strong { font-size: 24px; font-weight: 500; }.dice-note { flex: 0 0 auto; }
.dice-tool > :deep(.ant-alert) { flex: 0 0 auto; }
</style>
