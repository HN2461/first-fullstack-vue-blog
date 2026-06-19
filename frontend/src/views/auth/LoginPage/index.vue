<template>
  <div class="login-page" :class="pageClasses">
    <!-- 设置按钮 -->
    <AuthSettings
      v-model:theme="theme"
      v-model:lang="lang"
      v-model:layout="layout"
    />

    <!-- 左侧品牌展示 - 居中模式隐藏 -->
    <div v-if="layout !== 'center'" class="login-left">
      <div class="left-bg">
        <div class="bg-glow glow-1"></div>
        <div class="bg-glow glow-2"></div>
        <div class="bg-glow glow-3"></div>
        <div class="bg-circle c1"></div>
        <div class="bg-circle c2"></div>
        <div class="bg-circle c3"></div>
        <div class="bg-circle c4"></div>
        <div class="bg-dot" v-for="i in 12" :key="i" :class="'d' + i"></div>
        <div class="bg-line line-1"></div>
        <div class="bg-line line-2"></div>
        <div class="bg-line line-3"></div>
      </div>

      <div class="brand-logo">
        <img class="logo-icon" src="/favicon.svg" alt="" aria-hidden="true">
        <div class="logo-text">
          <h3>{{ lang === 'zh' ? '知识库' : 'Knowledge' }}</h3>
          <p>Knowledge OS</p>
        </div>
      </div>

      <div class="left-content">
        <div class="hero-text">
          <h1>
            <span class="line">{{ lang === 'zh' ? '面向长期维护的' : 'Long-term' }}</span>
            <span class="line highlight">{{ lang === 'zh' ? '个人技术知识库' : 'Personal Tech' }}</span>
            <span class="line">{{ lang === 'zh' ? '后台管理系统' : 'Knowledge Base' }}</span>
          </h1>
          <p class="hero-desc">
            {{ lang === 'zh' ? '统一管理文章、媒体、评论与站点配置，高效构建个人知识体系。' : 'Manage articles, media, comments and site settings efficiently.' }}
          </p>
        </div>

        <div class="features">
          <div class="feature-item" v-for="(item, i) in featureItems" :key="i">
            <div class="feature-icon">
              <component :is="item.icon" />
            </div>
            <div class="feature-body">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <div class="stats">
          <div class="stat-item">
            <span class="stat-num">1000+</span>
            <span class="stat-label">{{ lang === 'zh' ? '文章' : 'Articles' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">50+</span>
            <span class="stat-label">{{ lang === 'zh' ? '分类' : 'Categories' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">99%</span>
            <span class="stat-label">{{ lang === 'zh' ? '可用性' : 'Uptime' }}</span>
          </div>
        </div>
      </div>

      <div class="left-footer">
        <p>© 2026 Knowledge OS</p>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-right" :class="{ 'full-width': layout === 'center' }">
      <div class="login-form-wrapper">
        <div class="form-header">
          <h2>{{ lang === 'zh' ? '欢迎回来' : 'Welcome Back' }}</h2>
          <p>{{ lang === 'zh' ? '登录您的账户以继续' : 'Sign in to your account' }}</p>
        </div>

        <a-form :model="form" @finish="handleSubmit" layout="vertical" class="login-form">
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

          <a-form-item class="captcha-item">
            <SlideCaptcha ref="slideCaptchaRef" @success="onCaptchaSuccess" />
          </a-form-item>

          <div class="form-options">
            <label class="remember-label" @click="form.remember = !form.remember">
              <span class="checkbox" :class="{ checked: form.remember }">
                <span v-if="form.remember" class="check-icon">✓</span>
              </span>
              <span>{{ lang === 'zh' ? '记住账号' : 'Remember me' }}</span>
            </label>
            <button type="button" class="forgot-link" @click="openForgotPasswordModal">
              {{ lang === 'zh' ? '忘记密码？' : 'Forgot password?' }}
            </button>
          </div>

          <a-button type="primary" html-type="submit" size="large" block :loading="submitting" :disabled="!captchaVerified" class="login-btn">
            {{ lang === 'zh' ? '登录' : 'Sign In' }}
          </a-button>

          <p class="security-note">
            {{ lang === 'zh' ? '密码会在浏览器内完成一次性加密后提交，并通过安全会话 Cookie 保持登录。' : 'Password is encrypted in the browser before submission and the session is kept by a secure cookie.' }}
          </p>
        </a-form>

        <a-modal
          v-model:open="forgotPasswordVisible"
          :title="lang === 'zh' ? '重置密码' : 'Reset password'"
          :confirm-loading="resettingPassword"
          :ok-text="lang === 'zh' ? '确认重置' : 'Reset'"
          :cancel-text="lang === 'zh' ? '取消' : 'Cancel'"
          :width="440"
          :destroy-on-close="true"
          @ok="submitForgotPassword"
        >
          <a-alert
            class="reset-tip"
            type="info"
            show-icon
            :message="lang === 'zh' ? '忘记密码流程无需输入旧密码。' : 'Old password is not required for this flow.'"
            :description="lang === 'zh' ? '请输入注册邮箱与新密码，重置成功后可直接使用新密码登录。' : 'Enter your registered email and a new password, then sign in with it.'"
          />
          <a-form
            ref="forgotPasswordFormRef"
            :model="forgotPasswordForm"
            :rules="forgotPasswordRules"
            layout="vertical"
            class="reset-form"
            @finish="handleResetPassword"
          >
            <a-form-item :label="lang === 'zh' ? '注册邮箱' : 'Email'" name="email">
              <a-input v-model:value.trim="forgotPasswordForm.email" :placeholder="lang === 'zh' ? '请输入注册邮箱' : 'Registered email'" size="large" allow-clear>
                <template #prefix><MailOutlined /></template>
              </a-input>
            </a-form-item>
            <a-form-item :label="lang === 'zh' ? '新密码' : 'New password'" name="newPassword">
              <a-input-password v-model:value="forgotPasswordForm.newPassword" :placeholder="lang === 'zh' ? '至少 8 个字符' : 'At least 8 characters'" size="large" autocomplete="new-password">
                <template #prefix><LockOutlined /></template>
              </a-input-password>
            </a-form-item>
            <a-form-item :label="lang === 'zh' ? '确认新密码' : 'Confirm password'" name="confirmPassword">
              <a-input-password v-model:value="forgotPasswordForm.confirmPassword" :placeholder="lang === 'zh' ? '请再次输入新密码' : 'Enter the new password again'" size="large" autocomplete="new-password" @keyup.enter="submitForgotPassword">
                <template #prefix><LockOutlined /></template>
              </a-input-password>
            </a-form-item>
          </a-form>
        </a-modal>

        <div class="other-login">
          <div class="divider">
            <span>{{ lang === 'zh' ? '其他登录方式' : 'Other ways' }}</span>
          </div>
          <div class="social-btns">
            <div class="social-btn" title="QQ" style="color: #12B7F5"><QqOutlined /></div>
            <div class="social-btn" title="微信/WeChat" style="color: #07C160"><WechatOutlined /></div>
            <div class="social-btn github-btn" title="GitHub"><GithubOutlined /></div>
          </div>
        </div>

        <div class="form-footer">
          <span>{{ lang === 'zh' ? '还没有账号？' : "Don't have an account?" }}</span>
          <router-link to="/register">{{ lang === 'zh' ? '立即注册' : 'Sign Up' }}</router-link>
        </div>

        <div class="back-home">
          <router-link to="/">
            <HomeOutlined />
            <span>{{ lang === 'zh' ? '返回首页' : 'Back to Home' }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  MailOutlined, LockOutlined, QqOutlined, WechatOutlined, GithubOutlined, HomeOutlined,
  FileTextOutlined, AuditOutlined, PictureOutlined, SettingOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import SlideCaptcha from '@/components/SlideCaptcha.vue'
import AuthSettings from '@/components/AuthSettings.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 设置状态
const theme = ref(localStorage.getItem('auth-theme') || 'dark')
const lang = ref(localStorage.getItem('auth-lang') || 'zh')
const layout = ref(localStorage.getItem('auth-layout') || 'right')

watch(theme, (v) => localStorage.setItem('auth-theme', v))
watch(lang, (v) => localStorage.setItem('auth-lang', v))
watch(layout, (v) => localStorage.setItem('auth-layout', v))

// 计算页面类名
const pageClasses = computed(() => [
  `theme-${theme.value}`,
  `layout-${layout.value}`
])

const form = reactive({ email: '', password: '', remember: false })
const forgotPasswordForm = reactive({ email: '', newPassword: '', confirmPassword: '' })
const submitting = ref(false)
const resettingPassword = ref(false)
const forgotPasswordVisible = ref(false)
const captchaVerified = ref(false)
const slideCaptchaRef = ref(null)
const forgotPasswordFormRef = ref(null)

const emailRules = computed(() => [
  { required: true, message: lang.value === 'zh' ? '请输入邮箱地址' : 'Email is required' },
  { type: 'email', message: lang.value === 'zh' ? '请输入有效的邮箱格式' : 'Invalid email format' }
])

const passwordRules = computed(() => [
  { required: true, message: lang.value === 'zh' ? '请输入密码' : 'Password is required' },
  { min: 8, message: lang.value === 'zh' ? '密码至少8个字符' : 'At least 8 characters' }
])

const forgotPasswordRules = computed(() => ({
  email: [
    { required: true, message: lang.value === 'zh' ? '请输入注册邮箱' : 'Email is required' },
    { type: 'email', message: lang.value === 'zh' ? '请输入有效的邮箱格式' : 'Invalid email format' }
  ],
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

const featureItems = computed(() => [
  { icon: FileTextOutlined, title: lang.value === 'zh' ? '内容发布' : 'Content', desc: lang.value === 'zh' ? '文章管理与发布' : 'Article management' },
  { icon: AuditOutlined, title: lang.value === 'zh' ? '评论审核' : 'Comments', desc: lang.value === 'zh' ? '互动内容管理' : 'Interaction management' },
  { icon: PictureOutlined, title: lang.value === 'zh' ? '媒体资产' : 'Media', desc: lang.value === 'zh' ? '图片文件管理' : 'File management' },
  { icon: SettingOutlined, title: lang.value === 'zh' ? '站点运营' : 'Settings', desc: lang.value === 'zh' ? '配置数据分析' : 'Configuration' }
])

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
    // Ant Design Vue 会在表单项内展示具体校验信息。
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
.login-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  transition: all 0.3s;
  background-color: var(--right-bg);
}

/* ========== 主题变量 ========== */
.login-page.theme-dark {
  --left-bg: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%);
  --right-bg: #0d1117;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --border-color: rgba(255, 255, 255, 0.1);
  --input-bg: #161b22;
  --input-border: #30363d;
  --input-text: #e6edf3;
  --input-placeholder: #484f58;
}

.login-page.theme-light {
  --left-bg: linear-gradient(135deg, #f0f2f5 0%, #e8ecf0 100%);
  --right-bg: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --input-bg: #f8f9fa;
  --input-border: #d0d0d0;
  --input-text: #1a1a1a;
  --input-placeholder: #b0b0b0;
}

/* ========== 布局模式 ========== */
.login-page.layout-right {
  flex-direction: row;
}

.login-page.layout-right .login-left {
  width: 70%;
}

.login-page.layout-right .login-right {
  width: 30%;
}

.login-page.layout-left {
  flex-direction: row-reverse;
}

.login-page.layout-left .login-left {
  width: 70%;
}

.login-page.layout-left .login-right {
  width: 30%;
}

.login-page.layout-center {
  justify-content: center;
  align-items: center;
}

.login-page.layout-center .login-right {
  width: 100%;
  max-width: 480px;
}

/* ========== 左侧卡片 ========== */
.login-left {
  height: 100%;
  background: var(--left-bg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 80px 60px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.left-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
}

.glow-1 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(22, 119, 255, 0.4), transparent);
  top: -100px;
  right: -100px;
  animation: glow-pulse 4s ease-in-out infinite;
}

.glow-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.35), transparent);
  bottom: -50px;
  left: -50px;
  animation: glow-pulse 5s ease-in-out infinite 1s;
}

.glow-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent);
  top: 50%;
  left: 50%;
  animation: glow-pulse 6s ease-in-out infinite 2s;
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.3); opacity: 0.8; }
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.15);
}

.c1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -150px;
  animation: spin 25s linear infinite;
  border-style: dashed;
  border-color: rgba(22, 119, 255, 0.2);
}

.c2 {
  width: 380px;
  height: 380px;
  bottom: -100px;
  left: -100px;
  animation: spin 20s linear infinite reverse;
  border-color: rgba(22, 119, 255, 0.2);
}

.c3 {
  width: 220px;
  height: 220px;
  top: 45%;
  right: 20%;
  animation: spin 18s linear infinite;
  border-width: 3px;
  border-style: dotted;
  border-color: rgba(99, 102, 241, 0.2);
}

.c4 {
  width: 180px;
  height: 180px;
  top: 10%;
  left: 15%;
  animation: spin 12s linear infinite reverse;
  border-color: rgba(99, 102, 241, 0.2);
  border-style: dashed;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.bg-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(22, 119, 255, 0.3);
}

.d1 { top: 10%; left: 5%; animation: float-1 8s ease-in-out infinite; }
.d2 { top: 25%; left: 20%; animation: float-2 7s ease-in-out infinite 0.5s; }
.d3 { top: 40%; left: 8%; animation: float-3 9s ease-in-out infinite 1s; }
.d4 { top: 15%; right: 10%; animation: float-1 6s ease-in-out infinite 1.5s; }
.d5 { top: 35%; right: 20%; animation: float-2 8s ease-in-out infinite 2s; }
.d6 { top: 55%; left: 15%; animation: float-3 7s ease-in-out infinite 0.5s; }
.d7 { top: 70%; left: 25%; animation: float-1 9s ease-in-out infinite 1s; }
.d8 { top: 65%; right: 15%; animation: float-2 6s ease-in-out infinite 2.5s; }
.d9 { bottom: 20%; left: 10%; animation: float-3 8s ease-in-out infinite 1.5s; }
.d10 { bottom: 15%; right: 25%; animation: float-1 7s ease-in-out infinite 3s; }
.d11 { top: 80%; left: 40%; animation: float-2 9s ease-in-out infinite 0.5s; }
.d12 { top: 50%; right: 8%; animation: float-3 6s ease-in-out infinite 2s; }

@keyframes float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  25% { transform: translate(25px, -40px) scale(1.3); opacity: 1; }
  50% { transform: translate(-15px, -65px) scale(1.6); opacity: 0.7; }
  75% { transform: translate(20px, -30px) scale(1.2); opacity: 1; }
}

@keyframes float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
  33% { transform: translate(-30px, -50px) scale(1.4); opacity: 1; }
  66% { transform: translate(20px, -75px) scale(1.5); opacity: 0.8; }
}

@keyframes float-3 {
  0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.7; }
  50% { transform: translate(35px, -55px) scale(1.7); opacity: 1; }
}

.bg-line {
  position: absolute;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(22, 119, 255, 0.6), rgba(99, 102, 241, 0.4), transparent);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(22, 119, 255, 0.3);
}

.line-1 {
  width: 350px;
  top: 30%;
  left: -50px;
  transform: rotate(-15deg);
  animation: line-flow 4s ease-in-out infinite;
}

.line-2 {
  width: 300px;
  bottom: 40%;
  right: -30px;
  transform: rotate(20deg);
  animation: line-flow 5s ease-in-out infinite 1s;
}

.line-3 {
  width: 250px;
  top: 60%;
  left: 30%;
  transform: rotate(-10deg);
  animation: line-flow 6s ease-in-out infinite 2s;
}

@keyframes line-flow {
  0% { transform: translateX(-100%) rotate(-15deg); opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateX(250%) rotate(-15deg); opacity: 0; }
}

.brand-logo {
  position: absolute;
  top: 30px;
  left: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.logo-icon {
  width: 44px;
  height: 44px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 4px 10px rgba(74, 46, 21, 0.26));
}

.logo-text h3 {
  color: #fff;
  font-size: 18px;
  margin: 0;
  font-weight: 700;
}

.logo-text p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin: 2px 0 0;
}

.left-content {
  position: relative;
  z-index: 2;
  max-width: 640px;
}

.hero-text {
  margin-bottom: 48px;
}

.hero-text h1 {
  margin: 0 0 20px;
}

.hero-text .line {
  display: block;
  color: #fff;
  font-size: 44px;
  font-weight: 700;
  line-height: 1.3;
  animation: slide-up 0.6s ease-out both;
}

.hero-text .line:nth-child(2) { animation-delay: 0.1s; }
.hero-text .line:nth-child(3) { animation-delay: 0.2s; }

.hero-text .highlight {
  background: linear-gradient(90deg, #4096ff, #69b1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  line-height: 1.7;
  margin: 0;
}

.features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 48px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  width: 42px;
  height: 42px;
  background: rgba(22, 119, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #69b1ff;
  flex-shrink: 0;
}

.feature-body h4 {
  color: #fff;
  font-size: 14px;
  margin: 0 0 3px;
  font-weight: 600;
}

.feature-body p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  margin: 0;
}

/* 亮色模式左侧内容文字 */
.theme-light .hero-text .line {
  color: #1a1a1a;
}

.theme-light .hero-text .highlight {
  background: linear-gradient(90deg, #1677ff, #4096ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.theme-light .hero-desc {
  color: #666;
}

.theme-light .logo-text h3 {
  color: #1a1a1a;
}

.theme-light .logo-text p {
  color: #999;
}

.theme-light .feature-item {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

.theme-light .feature-item:hover {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.12);
}

.theme-light .feature-body h4 {
  color: #1a1a1a;
}

.theme-light .feature-body p {
  color: #999;
}

.theme-light .feature-icon {
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
}

.theme-light .stat-num {
  color: #1a1a1a;
}

.theme-light .stat-label {
  color: #999;
}

.theme-light .left-footer {
  color: rgba(0, 0, 0, 0.3);
}

.stats {
  display: flex;
  gap: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-num {
  color: #fff;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  margin-top: 6px;
}

.left-footer {
  position: absolute;
  bottom: 24px;
  left: 80px;
  color: rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

/* ========== 右侧卡片 ========== */
.login-right {
  height: 100%;
  background: var(--right-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  transition: all 0.3s;
}

.login-right.full-width {
  width: 100%;
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px;
}

.form-header {
  margin-bottom: 32px;
}

.form-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.form-header p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

/* 输入框布局样式 - 背景色由全局 auth-inputs.css 控制 */
:deep(.ant-input-affix-wrapper) {
  border-radius: 10px;
  padding: 10px 14px;
}

:deep(.ant-input-prefix) {
  margin-right: 10px;
}

.captcha-item {
  margin-bottom: 16px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  user-select: none;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--input-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox.checked {
  background: #1677ff;
  border-color: #1677ff;
}

.check-icon {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

.forgot-link {
  padding: 0;
  border: 0;
  color: #1677ff;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  font: inherit;
}

.forgot-link:hover {
  color: #4096ff;
}

.reset-tip {
  margin-bottom: 18px;
}

.reset-form {
  max-height: min(58vh, 420px);
  overflow-y: auto;
  padding-right: 2px;
}

.login-btn {
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  border: none;
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(22, 119, 255, 0.4);
}

.login-btn:disabled {
  background: #d9d9d9;
  box-shadow: none;
}

.security-note {
  margin: 12px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.other-login {
  margin-bottom: 28px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  padding: 0 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

.social-btns {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* GitHub 图标适配 */
.github-btn {
  color: #e8e8e8;
}

.theme-light .github-btn {
  color: #333;
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.form-footer a {
  color: #1677ff;
  font-weight: 600;
  margin-left: 4px;
}

/* 返回首页 */
.back-home {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.back-home a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.3s;
}

.back-home a:hover {
  color: #1677ff;
}

@media (max-width: 768px) {
  .login-page {
    flex-direction: column !important;
  }

  .login-left {
    width: 100% !important;
    height: auto;
    padding: 60px 24px 40px;
  }

  .login-right {
    width: 100% !important;
    padding: 30px 20px;
  }

  .hero-text .line {
    font-size: 28px;
  }

  .features, .stats {
    display: none;
  }
}
</style>
