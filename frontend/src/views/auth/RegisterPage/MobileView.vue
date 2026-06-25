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
        <h1>{{ lang === 'zh' ? '创建账号' : 'Create Account' }}</h1>
        <p>{{ lang === 'zh' ? '填写以下信息完成注册' : 'Fill in the form to register' }}</p>
      </div>

      <a-form :model="form" layout="vertical" class="mobile-auth__form" @finish="handleSubmit">
        <a-form-item name="username" :rules="usernameRules">
          <a-input v-model:value.trim="form.username" :placeholder="lang === 'zh' ? '请输入昵称' : 'Username'" size="large" allow-clear>
            <template #prefix><UserOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item name="email" :rules="emailRules">
          <a-input v-model:value.trim="form.email" :placeholder="lang === 'zh' ? '请输入邮箱地址' : 'Email address'" size="large" allow-clear>
            <template #prefix><MailOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" :rules="passwordRules">
          <a-input-password v-model:value="form.password" :placeholder="lang === 'zh' ? '请输入密码（至少8位）' : 'Password (8+ chars)'" size="large" autocomplete="new-password">
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item class="mobile-auth__apply">
          <a-checkbox v-model:checked="form.applyAdmin">
            {{ lang === 'zh' ? '注册时申请管理员权限' : 'Apply for admin access' }}
          </a-checkbox>
        </a-form-item>

        <a-form-item v-if="form.applyAdmin" name="permissionRequestReason" :rules="permissionReasonRules">
          <a-textarea
            v-model:value="form.permissionRequestReason"
            :rows="4"
            :maxlength="500"
            show-count
            :placeholder="lang === 'zh' ? '请说明申请用途，例如内容运营、数据管理或系统维护' : 'Describe why you need admin access'"
          />
        </a-form-item>

        <a-alert v-if="errorMessage" :message="errorMessage" type="error" show-icon closable class="mobile-auth__alert" @close="errorMessage = ''" />

        <a-button type="primary" html-type="submit" size="large" block :loading="submitting">
          {{ lang === 'zh' ? '注册' : 'Sign Up' }}
        </a-button>

        <p class="mobile-auth__note">
          {{ lang === 'zh' ? '注册密码会在浏览器内完成一次性加密后提交。' : 'Password is encrypted before submission.' }}
        </p>
      </a-form>

      <div class="mobile-auth__links">
        <router-link to="/login">{{ lang === 'zh' ? '立即登录' : 'Sign In' }}</router-link>
        <router-link to="/">{{ lang === 'zh' ? '返回首页' : 'Back to Home' }}</router-link>
      </div>

      <SiteBeianLinks tone="auth-card" show-copyright />
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons-vue'
import AuthSettings from '@/components/AuthSettings.vue'
import SiteBeianLinks from '@/components/SiteBeianLinks.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const theme = ref(localStorage.getItem('auth-theme') || 'dark')
const lang = ref(localStorage.getItem('auth-lang') || 'zh')
const layout = ref(localStorage.getItem('auth-layout') || 'right')
const form = reactive({ username: '', email: '', password: '', applyAdmin: false, permissionRequestReason: '' })
const submitting = ref(false)
const errorMessage = ref('')

watch(theme, (value) => localStorage.setItem('auth-theme', value))
watch(lang, (value) => localStorage.setItem('auth-lang', value))
watch(layout, (value) => localStorage.setItem('auth-layout', value))

const usernameRules = computed(() => [
  { required: true, message: lang.value === 'zh' ? '请输入昵称' : 'Username is required' },
  { min: 2, max: 32, message: lang.value === 'zh' ? '昵称长度2-32个字符' : '2-32 characters' }
])

const emailRules = computed(() => [
  { required: true, message: lang.value === 'zh' ? '请输入邮箱地址' : 'Email is required' },
  { type: 'email', message: lang.value === 'zh' ? '请输入有效的邮箱格式' : 'Invalid email format' }
])

const passwordRules = computed(() => [
  { required: true, message: lang.value === 'zh' ? '请输入密码' : 'Password is required' },
  { min: 8, message: lang.value === 'zh' ? '密码至少8个字符' : 'At least 8 characters' },
  { max: 72, message: lang.value === 'zh' ? '密码不能超过72个字符' : 'No more than 72 characters' }
])

const permissionReasonRules = computed(() => [
  { required: true, message: lang.value === 'zh' ? '请填写申请说明' : 'Application reason is required' },
  { max: 500, message: lang.value === 'zh' ? '申请说明不能超过500个字符' : 'No more than 500 characters' }
])

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password,
      permissionRequestReason: form.applyAdmin ? form.permissionRequestReason : ''
    })
    message.success(lang.value === 'zh' ? '注册成功，正在跳转...' : 'Registration successful!')
    await router.push('/console')
  } catch (error) {
    errorMessage.value = error.message || (lang.value === 'zh' ? '注册失败' : 'Registration failed')
  } finally {
    submitting.value = false
  }
}
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

.mobile-auth__form :deep(.ant-input-affix-wrapper),
.mobile-auth__form :deep(.ant-btn) {
  min-height: 44px;
}

.mobile-auth__form :deep(textarea.ant-input) {
  min-height: 104px;
}

.mobile-auth__apply {
  margin-bottom: 14px;
}

.mobile-auth__alert {
  margin-bottom: 16px;
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
</style>
