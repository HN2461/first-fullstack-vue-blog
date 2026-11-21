<template>
  <section class="tool-panel password-tool">
    <div class="password-toolbar">
      <div class="password-length">
        <label for="tool-password-length">密码长度</label>
        <a-input-number id="tool-password-length" v-model:value="length" :min="8" :max="128" size="small" />
      </div>
      <a-button type="primary" size="small" @click="generate">生成密码</a-button>
    </div>
    <div class="password-body">
      <div class="password-options" role="group" aria-label="密码字符集">
        <span>字符集</span>
        <a-checkbox v-model:checked="includeUpper">大写</a-checkbox>
        <a-checkbox v-model:checked="includeLower">小写</a-checkbox>
        <a-checkbox v-model:checked="includeNumber">数字</a-checkbox>
        <a-checkbox v-model:checked="includeSymbol">符号</a-checkbox>
      </div>
      <a-alert v-if="error" type="error" show-icon :message="error" />
      <div class="password-result-head">
        <span>生成结果 <small v-if="password">{{ password.length }} 位</small></span>
        <a-tooltip title="复制密码">
          <a-button type="text" size="small" :disabled="!password || resultStale" aria-label="复制密码" @click="copyToolResult(password, '密码')">
            <template #icon><Copy :size="14" /></template>
          </a-button>
        </a-tooltip>
      </div>
      <pre class="password-output">{{ password || '选择字符集后生成密码' }}</pre>
      <div class="password-note" role="status">{{ resultStale ? '参数已修改，请重新生成密码。' : '每种所选字符至少出现一次；使用 Web Crypto 无偏抽样并打乱顺序，结果不上传服务器。' }}</div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Copy } from '@lucide/vue'
import { copyToolResult } from '../utils/copyToolResult'
import { generatePassword } from '../logic/randomTools'

const length = ref(20)
const includeUpper = ref(true)
const includeLower = ref(true)
const includeNumber = ref(true)
const includeSymbol = ref(true)
const password = ref('')
const error = ref('')
const generatedSource = ref('')
const sourceKey = computed(() => JSON.stringify([length.value, includeUpper.value, includeLower.value, includeNumber.value, includeSymbol.value]))
const resultStale = computed(() => Boolean(password.value && generatedSource.value !== sourceKey.value))

function generate() {
  error.value = ''
  try {
    password.value = generatePassword({ length: length.value, includeUpper: includeUpper.value, includeLower: includeLower.value, includeNumber: includeNumber.value, includeSymbol: includeSymbol.value })
    generatedSource.value = sourceKey.value
  } catch (cause) {
    password.value = ''
    generatedSource.value = ''
    error.value = cause.message
  }
}

generate()
</script>

<style scoped>
.password-tool { display: flex; flex: 1; flex-direction: column; gap: 14px; min-width: 0; min-height: 0; overflow: hidden; }
.password-toolbar, .password-length, .password-options, .password-result-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.password-toolbar { justify-content: space-between; flex: 0 0 auto; }
.password-length, .password-options { color: var(--console-text-secondary); font-size: 12px; }
.password-length :deep(.ant-input-number) { width: 100px; }
.password-options { gap: 10px 14px; }
.password-options :deep(.ant-checkbox-wrapper) { margin-inline-start: 0; }
.password-body { display: grid; align-content: start; gap: 12px; min-height: 0; overflow: auto; }
.password-result-head { justify-content: space-between; color: var(--console-text-secondary); font-size: 12px; }
.password-result-head small { margin-left: 6px; color: var(--console-text-tertiary); }
.password-output { max-height: 180px; min-height: 60px; margin: 0; padding: 14px; overflow: auto; overflow-wrap: anywhere; border: 1px solid var(--console-border); border-radius: 6px; color: var(--console-text); background: var(--console-surface-muted); font: 15px/1.6 'Cascadia Code', Consolas, monospace; white-space: pre-wrap; }
.password-note { color: var(--console-text-secondary); font-size: 12px; }
</style>
