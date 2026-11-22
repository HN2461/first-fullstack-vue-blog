<template>
  <section class="tool-panel jwt-tool">
    <div class="jwt-toolbar">
      <a-tooltip title="仅解码三段式 JWT，不验证签名、发行者或可信性。时间状态仅根据未验证的载荷声明和当前设备时间计算。"><span class="jwt-hint" tabindex="0">仅解码，不验签</span></a-tooltip>
      <div class="jwt-actions">
        <a-popconfirm title="清空 JWT 和解码结果？" @confirm="clear">
          <a-button size="small" :disabled="!input && !header && !payload">清空</a-button>
        </a-popconfirm>
        <a-button size="small" type="primary" @click="decode">解码</a-button>
        <a-button size="small" :disabled="!header || resultStale" @click="copyToolResult(header, 'Header')">复制 Header</a-button>
        <a-button size="small" :disabled="!payload || resultStale" @click="copyToolResult(payload, 'Payload')">复制 Payload</a-button>
      </div>
    </div>
    <div class="jwt-input"><a-textarea id="tool-jwt-input" v-model:value="input" aria-label="JWT 原文" spellcheck="false" placeholder="粘贴 Header.Payload.Signature 三段式 JWT" /></div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div class="jwt-grid">
      <section v-for="part in parts" :key="part.key" class="jwt-result">
        <div class="jwt-editor-area">
          <a-textarea :id="`tool-jwt-${part.key}`" :value="part.value" :aria-label="part.label" readonly spellcheck="false" :placeholder="part.label" />
        </div>
      </section>
    </div>
    <div v-if="claims.length && !resultStale" class="jwt-claims" aria-label="未验证时间声明">
      <span v-for="claim in claims" :key="claim.key" :class="{ 'jwt-claim-warning': claim.state !== 'normal' }">{{ claim.label }}（{{ claim.key }}）：{{ claim.text }}</span>
    </div>
    <div class="jwt-note" role="status">{{ resultStale ? '输入已修改，请重新解码。' : unsecured ? 'alg 为 none：此令牌未签名。内容和时间声明均未验证。' : 'Header 与 Payload 仅供检查；未验证签名或可信性。' }}</div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { copyToolResult } from '../utils/copyToolResult'
import { decodeJwt, getJwtTimeClaims } from '../logic/jwt'

const input = ref('')
const header = ref('')
const payload = ref('')
const error = ref('')
const decodedPayload = ref(null)
const unsecured = ref(false)
const now = ref(Date.now())
const clock = setInterval(() => { now.value = Date.now() }, 1000)
onBeforeUnmount(() => clearInterval(clock))
const decodedInput = ref('')
const resultStale = computed(() => Boolean((header.value || payload.value) && decodedInput.value !== input.value))
const parts = computed(() => [
  { key: 'header', label: 'Header', value: header.value },
  { key: 'payload', label: 'Payload', value: payload.value }
])
const claims = computed(() => getJwtTimeClaims(decodedPayload.value, now.value))

function decode() {
  error.value = ''
  try {
    const result = decodeJwt(input.value)
    // 展示原始数字 token 格式化后的文本，元数据对象仅用于未验证时间声明。
    header.value = result.headerText
    payload.value = result.payloadText
    decodedPayload.value = result.payload
    unsecured.value = result.unsecured
    decodedInput.value = input.value
  } catch (cause) {
    header.value = ''
    payload.value = ''
    decodedInput.value = ''
    decodedPayload.value = null
    unsecured.value = false
    error.value = cause.message || 'JWT 解码失败'
  }
}

function clear() {
  input.value = ''
  header.value = ''
  payload.value = ''
  error.value = ''
  decodedInput.value = ''
  decodedPayload.value = null
  unsecured.value = false
}
</script>

<style scoped>
.jwt-tool { display: flex; flex: 1; flex-direction: column; gap: 12px; min-width: 0; min-height: 0; overflow: hidden; }
.jwt-toolbar, .jwt-actions, .jwt-result-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex: 0 0 auto; }
.jwt-toolbar { flex-wrap: wrap; }
.jwt-hint, .jwt-note { color: var(--console-text-secondary); font-size: 12px; }
.jwt-input { display: flex; flex: 0 0 auto; flex-direction: column; gap: 7px; min-height: 0; color: var(--console-text-secondary); font-size: 12px; }
.jwt-input :deep(textarea) { height: clamp(64px, 12vh, 104px); min-height: 0; resize: none; }
.jwt-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: minmax(0, 1fr); gap: 12px; flex: 1; min-height: 0; }
.jwt-result { display: flex; flex-direction: column; gap: 7px; min-width: 0; min-height: 0; }
.jwt-result-head { min-height: 28px; color: var(--console-text-secondary); font-size: 12px; }
.jwt-editor-area { flex: 1; min-height: 0; }
.jwt-editor-area :deep(textarea) { width: 100%; height: 100%; min-height: 0; resize: none; }
.jwt-tool :deep(textarea) { font: 13px/1.6 'Cascadia Code', Consolas, monospace; }
.jwt-note, .jwt-tool > :deep(.ant-alert) { flex: 0 0 auto; }
.jwt-claims { display: flex; flex: 0 0 auto; flex-wrap: wrap; gap: 5px 16px; max-height: 58px; overflow: auto; color: var(--console-text-secondary); font-size: 12px; }
.jwt-claim-warning { color: var(--ant-color-warning-text, #ad6800); }
:global(.dark-theme) .jwt-claim-warning { color: #ffb65d; }
@media (max-width: 700px) {
  .jwt-actions { min-width: 0; max-width: 100%; flex-wrap: wrap; justify-content: flex-start; }
  .jwt-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .jwt-input :deep(textarea) { height: 64px; }
}
</style>
