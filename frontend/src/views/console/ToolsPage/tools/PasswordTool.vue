<template>
  <section class="tool-panel password-tool">
    <div class="password-options">
      <label class="tool-field"><span>长度</span><a-input-number v-model:value="length" :min="8" :max="128" /></label>
      <label class="tool-field"><span>字符集</span><a-checkbox v-model:checked="includeUpper">大写</a-checkbox><a-checkbox v-model:checked="includeLower">小写</a-checkbox><a-checkbox v-model:checked="includeNumber">数字</a-checkbox><a-checkbox v-model:checked="includeSymbol">符号</a-checkbox></label>
    </div>
    <div class="password-output"><code>{{ password || '点击生成一个随机密码' }}</code><a-button type="primary" @click="generate">生成</a-button></div>
    <a-alert type="info" show-icon message="生成过程使用浏览器 Web Crypto；结果不会上传服务器。" />
  </section>
</template>

<script setup>
import { ref } from 'vue'

const length = ref(20)
const includeUpper = ref(true)
const includeLower = ref(true)
const includeNumber = ref(true)
const includeSymbol = ref(true)
const password = ref('')

function generate() {
  let chars = ''
  if (includeUpper.value) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  if (includeLower.value) chars += 'abcdefghijkmnopqrstuvwxyz'
  if (includeNumber.value) chars += '23456789'
  if (includeSymbol.value) chars += '!@#$%^&*_-+=?'
  if (!chars) { password.value = ''; return }
  const values = new Uint32Array(length.value)
  crypto.getRandomValues(values)
  password.value = Array.from(values, (value) => chars[value % chars.length]).join('')
}

generate()
</script>

<style scoped>
.tool-panel { display: grid; gap: 18px; max-width: 860px; }
.password-options { display: grid; grid-template-columns: 140px 1fr; gap: 24px; align-items: start; }
.tool-field { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.tool-field > span { width: 100%; }
.password-output { display: flex; align-items: center; gap: 10px; min-height: 58px; padding: 9px 10px 9px 14px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 6px; background: var(--console-surface-muted, #f8fafc); }
.password-output code { flex: 1; overflow-wrap: anywhere; color: var(--console-text, #1f2937); font: 15px/1.5 'Cascadia Code', Consolas, monospace; }
@media (max-width: 600px) { .password-options { grid-template-columns: 1fr; gap: 14px; } }
</style>
