<template>
  <main class="mobile-auth" :class="`theme-${theme}`">
    <AuthSettings
      v-model:theme="theme"
      v-model:lang="lang"
      v-model:layout="layout"
    />

    <section class="mobile-auth__panel">
      <router-link class="mobile-auth__brand" to="/">
        <img src="/favicon.svg" alt="" aria-hidden="true">
        <span>Knowledge OS</span>
      </router-link>

      <div class="mobile-auth__head">
        <h1>{{ lang === 'zh' ? '欢迎回来' : 'Welcome Back' }}</h1>
        <p>{{ lang === 'zh' ? '登录您的账户以继续' : 'Sign in to your account' }}</p>
      </div>

      <a-form :model="form" layout="vertical" class="mobile-auth__form" @finish="handleSubmit">
        <a-form-item name="email" :rules="emailRules">
          <a-input v-model:value.trim="form.email" :placeholder="lang === 'zh' ? '请输入邮箱地址' : 'Email address'" size="large" allow-clear>
            <template #prefix><MailOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" :rules="passwordRules">
          <a-input-password v-model:value="form.password" :placeholder="lang === 'zh' ? '请输入密码' : 'Password'" size="large" autocomplete="current-password" @keyup.enter="handleSubmit">
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item class="mobile-auth__captcha">
          <SlideCaptcha ref="slideCaptchaRef" @success="onCaptchaSuccess" />
        </a-form-item>

        <div class="mobile-auth__options">
          <a-checkbox v-model:checked="form.remember">{{ lang === 'zh' ? '记住账号' : 'Remember me' }}</a-checkbox>
          <button type="button" @click="openForgotPasswordModal">
            {{ lang === 'zh' ? '忘记密码？' : 'Forgot password?' }}
          </button>
        </div>

        <a-button type="primary" html-type="submit" size="large" block :loading="submitting" :disabled="!captchaVerified">
          {{ lang === 'zh' ? '登录' : 'Sign In' }}
        </a-button>

        <p class="mobile-auth__note">
          {{ lang === 'zh' ? '密码会在浏览器内完成一次性加密后提交。' : 'Password is encrypted before submission.' }}
        </p>
      </a-form>

      <div class="mobile-auth__links">
        <router-link to="/register">{{ lang === 'zh' ? '立即注册' : 'Sign Up' }}</router-link>
        <router-link to="/">{{ lang === 'zh' ? '返回首页' : 'Back to Home' }}</router-link>
      </div>
    </section>

    <a-modal
      v-model:open="forgotPasswordVisible"
      :title="lang === 'zh' ? '重置密码' : 'Reset password'"
      :confirm-loading="resettingPassword"
      :ok-text="lang === 'zh' ? '确认重置' : 'Reset'"
      :cancel-text="lang === 'zh' ? '取消' : 'Cancel'"
      :width="420"
      :destroy-on-close="true"
      @ok="submitForgotPassword"
    >
      <a-alert
        class="mobile-auth__reset-tip"
        type="info"
        show-icon
        :message="lang === 'zh' ? '请输入注册邮箱与新密码。' : 'Enter your email and new password.'"
      />
      <a-form
        ref="forgotPasswordFormRef"
        :model="forgotPasswordForm"
        :rules="forgotPasswordRules"
        layout="vertical"
        class="mobile-auth__reset-form"
        @finish="handleResetPassword"
      >
        <a-form-item :label="lang === 'zh' ? '注册邮箱' : 'Email'" name="email">
          <a-input v-model:value.trim="forgotPasswordForm.email" size="large" allow-clear>
            <template #prefix><MailOutlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item :label="lang === 'zh' ? '新密码' : 'New password'" name="newPassword">
          <a-input-password v-model:value="forgotPasswordForm.newPassword" size="large" autocomplete="new-password">
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item :label="lang === 'zh' ? '确认新密码' : 'Confirm password'" name="confirmPassword">
          <a-input-password v-model:value="forgotPasswordForm.confirmPassword" size="large" autocomplete="new-password" @keyup.enter="submitForgotPassword">
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>
      </a-form>
    </a-modal>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { LockOutlined, MailOutlined } from '@ant-design/icons-vue'
import AuthSettings from '@/components/AuthSettings.vue'
import SlideCaptcha from '@/components/SlideCaptcha.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const theme = ref(localStorage.getItem('auth-theme') || 'dark')
const lang = ref(localStorage.getItem('auth-lang') || 'zh')
const layout = ref(localStorage.getItem('auth-layout') || 'right')
const form = reactive({ email: '', password: '', remember: false })
const forgotPasswordForm = reactive({ email: '', newPassword: '', confirmPassword: '' })
const submitting = ref(false)
const resettingPassword = ref(false)
const forgotPasswordVisible = ref(false)
const captchaVerified = ref(false)
const slideCaptchaRef = ref(null)
const forgotPasswordFormRef = ref(null)

watch(theme, (value) => localStorage.setItem('auth-theme', value))
watch(lang, (value) => localStorage.setItem('auth-lang', value))
watch(layout, (value) => localStorage.setItem('auth-layout', value))

const emailRules = computed(() => [
  { required: true, message: lang.value === 'zh' ? '请输入邮箱地址' : 'Email is required' },
  { type: 'email', message: lang.value === 'zh' ? '请输入有效的邮箱格式' : 'Invalid email format' }
])

const passwordRules = computed(() => [
  { required: true, message: lang.value === 'zh' ? '请输入密码' : 'Password is required' },
  { min: 8, message: lang.value === 'zh' ? '密码至少8个字符' : 'At least 8 characters' }
])

const forgotPasswordRules = computed(() => ({
  email: emailRules.value,
  newPassword: [
    { required: true, message: lang.value === 'zh' ? '请输入新密码' : 'New password is required' },
    { min: 8, message: lang.value === 'zh' ? '新密码至少需要 8 个字符' : 'At least 8 characters' },
    { max: 72, message: lang.value === 'zh' ? '新密码不能超过 72 个字符' : 'No more than 72 characters' }
  ],
  confirmPassword: [
    { required: true, message: lang.value === 'zh' ? '请确认新密码' : 'Please confirm the new password' },
    {
      validator: async (_rule, value) => {
        if (value && value !== forgotPasswordForm.newPassword) {
          throw new Error(lang.value === 'zh' ? '两次输入的新密码不一致' : 'Passwords do not match')
        }
      }
    }
  ]
}))

function onCaptchaSuccess() {
  captchaVerified.value = true
}

function openForgotPasswordModal() {
  forgotPasswordForm.email = form.email || localStorage.getItem('blog-remembered-email') || ''
  forgotPasswordForm.newPassword = ''
  forgotPasswordForm.confirmPassword = ''
  forgotPasswordVisible.value = true
}

async function submitForgotPassword() {
  try {
    await forgotPasswordFormRef.value?.validate()
    await handleResetPassword()
  } catch {
    // Ant Design Vue 会展示具体校验信息。
  }
}

async function handleResetPassword() {
  resettingPassword.value = true
  try {
    await authStore.resetPassword({ ...forgotPasswordForm })
    form.email = forgotPasswordForm.email
    form.password = ''
    forgotPasswordVisible.value = false
    message.success(lang.value === 'zh' ? '密码重置成功，请使用新密码登录' : 'Password reset successfully')
  } catch (error) {
    message.error(error.message || (lang.value === 'zh' ? '密码重置失败' : 'Password reset failed'))
  } finally {
    resettingPassword.value = false
  }
}

async function handleSubmit() {
  if (!captchaVerified.value) {
    message.warning(lang.value === 'zh' ? '请先完成滑块验证' : 'Please complete the captcha')
    return
  }

  submitting.value = true
  try {
    await authStore.login({ email: form.email, password: form.password })
    if (form.remember) {
      localStorage.setItem('blog-remembered-email', form.email)
    } else {
      localStorage.removeItem('blog-remembered-email')
    }
    message.success(lang.value === 'zh' ? '登录成功，正在跳转...' : 'Login successful!')
    await router.push(route.query.redirect || '/console')
  } catch (error) {
    message.error(error.message || (lang.value === 'zh' ? '登录失败' : 'Login failed'))
    slideCaptchaRef.value?.reset()
    captchaVerified.value = false
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  const rememberedEmail = localStorage.getItem('blog-remembered-email')
  if (rememberedEmail) {
    form.email = rememberedEmail
    form.remember = true
  }
})
</script>

<style scoped>
.mobile-auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  padding: 22px 16px;
  background: var(--right-bg);
}

.mobile-auth.theme-dark {
  --right-bg: #0d1117;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --border-color: rgba(255, 255, 255, 0.12);
  --panel-bg: #161b22;
}

.mobile-auth.theme-light {
  --right-bg: #f5f7fb;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --panel-bg: #ffffff;
}

.mobile-auth__panel {
  width: min(100%, 420px);
  display: grid;
  gap: 22px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 22px 18px;
  background: var(--panel-bg);
}

.mobile-auth__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  font-weight: 700;
}

.mobile-auth__brand img {
  width: 38px;
  height: 38px;
}

.mobile-auth__head h1 {
  margin: 0 0 8px;
  color: var(--text-primary);
  font-size: 28px;
  line-height: 1.2;
}

.mobile-auth__head p,
.mobile-auth__note {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.7;
}

.mobile-auth__form {
  display: grid;
}

.mobile-auth__form :deep(.ant-input-affix-wrapper),
.mobile-auth__form :deep(.ant-btn) {
  min-height: 44px;
}

.mobile-auth__captcha {
  overflow-x: auto;
}

.mobile-auth__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.mobile-auth__options button {
  min-height: 44px;
  border: 0;
  padding: 0;
  color: #1677ff;
  background: transparent;
}

.mobile-auth__links {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.mobile-auth__links a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  color: #1677ff;
  font-weight: 600;
}

.mobile-auth__reset-tip {
  margin-bottom: 16px;
}

.mobile-auth__reset-form {
  max-height: min(62vh, 430px);
  overflow-y: auto;
}
</style>
