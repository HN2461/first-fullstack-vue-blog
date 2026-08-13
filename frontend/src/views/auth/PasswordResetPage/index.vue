<template>
  <main class="password-reset-page" :class="`theme-${theme}`">
    <AuthSettings v-model:theme="theme" v-model:lang="lang" v-model:layout="layout" />
    <section class="password-reset-panel">
      <router-link to="/" class="password-reset-brand">
        <img src="/favicon.svg" alt="" aria-hidden="true">
        <span>{{ siteStore.siteTitle }}</span>
      </router-link>

      <div v-if="loading" class="password-reset-state"><a-spin size="large" /><span>正在校验重置链接...</span></div>

      <template v-else-if="status === 'active'">
        <div class="password-reset-head">
          <div class="password-reset-icon"><KeyRound :size="24" /></div>
          <h1>设置新密码</h1>
          <p>账号 {{ linkInfo.maskedEmail }}，链接有效至 {{ formatDate(linkInfo.expiresAt) }}</p>
        </div>

        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" @finish="submitReset">
          <a-form-item label="新密码" name="newPassword">
            <a-input-password v-model:value="form.newPassword" size="large" autocomplete="new-password" placeholder="8-72 个字符" />
          </a-form-item>
          <a-form-item label="确认新密码" name="confirmPassword">
            <a-input-password v-model:value="form.confirmPassword" size="large" autocomplete="new-password" placeholder="再次输入新密码" />
          </a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="submitting">确认修改密码</a-button>
        </a-form>
        <p class="password-reset-note"><ShieldCheck :size="15" />修改成功后，该账号的其他登录会话会自动退出。</p>
      </template>

      <template v-else>
        <a-result status="warning" title="重置链接不可用" :sub-title="errorMessage">
          <template #extra><a-button type="primary" @click="router.replace('/login')">返回登录页</a-button></template>
        </a-result>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { KeyRound, ShieldCheck } from 'lucide-vue-next'
import AuthSettings from '@/components/AuthSettings.vue'
import { consumePasswordResetLink, inspectPasswordResetLink } from '@/services/http'
import { useSiteStore } from '@/stores/site'

const router = useRouter()
const siteStore = useSiteStore()
const theme = ref(localStorage.getItem('auth-theme') || 'dark')
const lang = ref(localStorage.getItem('auth-lang') || 'zh')
const layout = ref(localStorage.getItem('auth-layout') || 'right')
const token = ref('')
const loading = ref(true)
const submitting = ref(false)
const status = ref('invalid')
const errorMessage = ref('链接可能已过期、已使用或已被管理员撤销，请重新联系管理员。')
const linkInfo = reactive({ maskedEmail: '', expiresAt: '' })
const form = reactive({ newPassword: '', confirmPassword: '' })
const formRef = ref(null)
const rules = computed(() => ({
  newPassword: [{ required: true, message: '请输入新密码' }, { min: 8, max: 72, message: '密码长度需为 8-72 个字符' }],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    { validator: async (_rule, value) => { if (value && value !== form.newPassword) throw new Error('两次输入的新密码不一致') } }
  ]
}))

function readAndClearToken() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  token.value = params.get('token') || ''
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
}

function formatDate(value) { return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '--' }
function statusMessage(value) {
  return ({
    used: '该链接已经使用，不能再次修改密码。',
    revoked: '该链接已被管理员撤销，请重新联系管理员。',
    expired: '该链接已经过期，请重新联系管理员获取新链接。'
  })[value] || errorMessage.value
}

async function inspectLink() {
  if (!token.value) { loading.value = false; return }
  try {
    const result = await inspectPasswordResetLink(token.value)
    status.value = result.status || 'invalid'
    if (status.value === 'active') Object.assign(linkInfo, result)
    else errorMessage.value = statusMessage(status.value)
  } catch (error) {
    errorMessage.value = error.message || errorMessage.value
  } finally {
    loading.value = false
  }
}

async function submitReset() {
  submitting.value = true
  try {
    await consumePasswordResetLink(token.value, form)
    message.success('密码已更新，请使用新密码登录')
    token.value = ''
    await router.replace('/login')
  } catch (error) {
    if (error.code === 'PASSWORD_RESET_LINK_INVALID') status.value = 'invalid'
    message.error(error.message || '密码修改失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => { readAndClearToken(); await siteStore.loadProfile(); await inspectLink() })
</script>

<style scoped>
.password-reset-page { --reset-bg: #f4f7fb; --reset-panel: #fff; --reset-text: #172033; --reset-muted: #64748b; min-height: 100vh; display: grid; place-items: center; padding: 72px 20px 32px; background: var(--reset-bg); color: var(--reset-text); }
.password-reset-page.theme-dark { --reset-bg: #101722; --reset-panel: #182231; --reset-text: #f1f5f9; --reset-muted: #94a3b8; }
.password-reset-panel { width: min(100%, 480px); padding: 30px; border: 1px solid rgba(127, 127, 127, 0.22); border-radius: 8px; background: var(--reset-panel); box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12); }
.password-reset-brand { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px; color: var(--reset-text); font-weight: 700; }
.password-reset-brand img { width: 32px; height: 32px; }
.password-reset-head { text-align: center; margin-bottom: 24px; }
.password-reset-head h1 { margin: 12px 0 6px; color: var(--reset-text); font-size: 24px; }
.password-reset-head p, .password-reset-note { color: var(--reset-muted); font-size: 13px; line-height: 1.7; }
.password-reset-icon { display: grid; place-items: center; width: 48px; height: 48px; margin: auto; border-radius: 8px; background: rgba(22, 119, 255, 0.12); color: #1677ff; }
.password-reset-state { min-height: 260px; display: grid; place-content: center; justify-items: center; gap: 16px; color: var(--reset-muted); }
.password-reset-note { display: flex; justify-content: center; align-items: center; gap: 6px; margin: 16px 0 0; }
:deep(.ant-form-item-label > label), :deep(.ant-result-title) { color: var(--reset-text); }
:deep(.ant-result-subtitle) { color: var(--reset-muted); }
@media (max-width: 520px) { .password-reset-page { align-items: start; padding-inline: 12px; } .password-reset-panel { padding: 24px 18px; } }
</style>
