<template>
  <div class="vault-access">
    <a-tag v-if="active && unlocked" class="vault-access__remaining" :bordered="false" color="green">
      {{ remainingLabel }}
    </a-tag>
    <a-tooltip :title="active && unlocked ? '结束密码箱验证' : '打开密码箱'">
      <a-button
        size="small"
        :aria-label="active && unlocked ? '结束密码箱验证' : '打开密码箱'"
        @click="active && unlocked ? lock() : enter()"
      >
        <template #icon><LockOutlined /></template>
        <span class="vault-access__label">{{ active && unlocked ? '锁定' : '密码箱' }}</span>
      </a-button>
    </a-tooltip>
    <a-modal
      :open="visible"
      :title="configured ? '解锁密码箱' : '设置密码箱密码'"
      centered
      width="min(440px, calc(100vw - 32px))"
      wrap-class-name="business-modal"
      :confirm-loading="submitting"
      :body-style="{ maxHeight: 'calc(100dvh - 190px)', overflow: 'auto' }"
      @ok="submit"
      @cancel="close"
    >
      <a-alert v-if="error" :message="error" type="error" show-icon class="vault-access__error" />
      <a-form layout="vertical" @submit.prevent="submit">
        <a-form-item label="密码">
          <a-input-password v-model:value="password" autocomplete="current-password" @press-enter="submit" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { LockOutlined } from '@ant-design/icons-vue'
import {
  getAdminMediaVaultStatus,
  lockAdminMediaVault,
  setupAdminMediaVault,
  unlockAdminMediaVault
} from '@/services/admin'

defineProps({ active: Boolean })
const emit = defineEmits(['entered', 'state-change'])
const visible = ref(false)
const configured = ref(false)
const unlocked = ref(false)
const expiresAt = ref(0)
const now = ref(Date.now())
const password = ref('')
const error = ref('')
const submitting = ref(false)
let disposed = false
let revision = 0
let timer
const remainingLabel = computed(() => {
  const seconds = Math.max(0, Math.ceil((expiresAt.value - now.value) / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
})
function apply(status = {}) {
  if (disposed) return
  configured.value = status.configured === true
  unlocked.value = status.unlocked === true && new Date(status.expiresAt).getTime() > Date.now()
  expiresAt.value = new Date(status.expiresAt || 0).getTime()
  emit('state-change', { ...status, unlocked: unlocked.value })
}
async function enter() {
  const current = ++revision
  try {
    const status = await getAdminMediaVaultStatus()
    if (disposed || current !== revision) return
    apply(status)
    if (unlocked.value) emit('entered')
    else {
      error.value = ''
      password.value = ''
      visible.value = true
    }
  } catch (reason) {
    message.error(reason.message || '密码箱状态加载失败')
  }
}
function close() {
  revision += 1
  visible.value = false
  password.value = ''
  error.value = ''
}
async function submit() {
  if (submitting.value) return
  if (!password.value || (!configured.value && (password.value.length < 8 || password.value.length > 72))) {
    error.value = configured.value ? '请输入密码' : '请设置 8–72 位密码'
    return
  }
  submitting.value = true
  const current = ++revision
  try {
    const status = configured.value
      ? await unlockAdminMediaVault(password.value)
      : await setupAdminMediaVault(password.value)
    if (disposed || current !== revision) return
    apply(status)
    close()
    if (unlocked.value) emit('entered')
  } catch (reason) {
    if (!disposed && current === revision) error.value = reason.message || '验证失败'
  } finally {
    submitting.value = false
  }
}
async function lock() {
  revision += 1
  try {
    await lockAdminMediaVault()
    apply({ configured: configured.value })
    message.success('密码箱已锁定')
  } catch (reason) {
    message.error(reason.message || '锁定失败')
  }
}
onMounted(() => {
  const current = ++revision
  // 刷新页面时也同步既有会话的到期时间，避免只在手动进入密码箱后才开始隐藏倒计时。
  getAdminMediaVaultStatus()
    .then((status) => {
      if (!disposed && current === revision) apply(status)
    })
    .catch(() => {
      if (!disposed && current === revision) apply({ configured: configured.value })
    })
  timer = window.setInterval(() => {
    now.value = Date.now()
    // 到期先撤下当前账号的内容，再由后续请求重新确认，不能把旧内容留在页面。
    if (unlocked.value && now.value >= expiresAt.value) {
      revision += 1
      apply({ configured: configured.value })
    }
  }, 1000)
})
onBeforeUnmount(() => {
  disposed = true
  revision += 1
  window.clearInterval(timer)
  password.value = ''
})
defineExpose({ enter })
</script>

<style scoped>
.vault-access {
  display: flex;
  align-items: center;
  gap: 4px;
}
.vault-access__error {
  margin-bottom: 12px;
}
.vault-access__remaining {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 640px) {
  .vault-access__label {
    display: none;
  }
}
</style>
