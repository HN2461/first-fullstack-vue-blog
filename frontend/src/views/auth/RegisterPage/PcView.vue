<template>
  <div class="register-page" :class="[`theme-${theme}`, `layout-${layout}`]">
    <!-- 设置按钮 -->
    <AuthSettings
      v-model:theme="theme"
      v-model:lang="lang"
      v-model:layout="layout"
    />

    <!-- 左侧品牌展示 -->
    <div v-if="layout !== 'center'" class="register-left">
      <!-- 动态背景 -->
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

      <!-- Logo -->
      <div class="brand-logo">
        <img class="logo-icon" src="/favicon.svg" alt="" aria-hidden="true">
        <div class="logo-text">
          <h3>{{ lang === 'zh' ? '知识库' : 'Knowledge' }}</h3>
          <p>Knowledge OS</p>
        </div>
      </div>

      <!-- 主内容 -->
      <div class="left-content">
        <div class="hero-text">
          <h1>
            <span class="line">{{ lang === 'zh' ? '创建您的' : 'Create Your' }}</span>
            <span class="line highlight">{{ lang === 'zh' ? '知识库账号' : 'Account' }}</span>
            <span class="line">{{ lang === 'zh' ? '开启学习之旅' : 'Start Learning' }}</span>
          </h1>
          <p class="hero-desc">
            {{ lang === 'zh' ? '注册后可阅读文章、参与评论、收藏内容，构建属于您的知识体系。' : 'Register to read articles, comment, and build your knowledge base.' }}
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
        <SiteBeianLinks tone="auth" show-copyright />
      </div>
    </div>

    <!-- 右侧注册区域 -->
    <div class="register-right">
      <div class="register-form-wrapper">
        <div class="form-header">
          <h2>{{ lang === 'zh' ? '创建账号' : 'Create Account' }}</h2>
          <p>{{ lang === 'zh' ? '填写以下信息完成注册' : 'Fill in the form to register' }}</p>
        </div>

        <a-form :model="form" @finish="handleSubmit" layout="vertical" class="register-form">
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

          <a-form-item class="permission-apply-item">
            <a-checkbox v-model:checked="form.applyAdmin">
              {{ lang === 'zh' ? '注册时申请管理员权限' : 'Apply for admin access' }}
            </a-checkbox>
          </a-form-item>

          <a-form-item v-if="form.applyAdmin" name="permissionRequestReason" :rules="permissionReasonRules">
            <a-textarea
              v-model:value="form.permissionRequestReason"
              :rows="3"
              :maxlength="500"
              show-count
              :placeholder="lang === 'zh' ? '请说明申请用途，例如内容运营、数据管理或系统维护' : 'Describe why you need admin access'"
            />
          </a-form-item>

          <a-alert v-if="errorMessage" :message="errorMessage" type="error" show-icon closable class="error-alert" @close="errorMessage = ''" />

          <a-button type="primary" html-type="submit" size="large" block :loading="submitting" class="register-btn">
            {{ lang === 'zh' ? '注册' : 'Sign Up' }}
          </a-button>

          <p class="security-note">
            {{ lang === 'zh' ? '注册密码会在浏览器内完成一次性加密后提交，服务端仅保存不可逆哈希。' : 'Password is encrypted in the browser before submission and only an irreversible hash is stored.' }}
          </p>
        </a-form>

        <div class="form-footer">
          <span>{{ lang === 'zh' ? '已有账号？' : 'Already have an account?' }}</span>
          <router-link to="/login">{{ lang === 'zh' ? '立即登录' : 'Sign In' }}</router-link>
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
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined, MailOutlined, LockOutlined, HomeOutlined,
  ReadOutlined, CommentOutlined, StarOutlined, SafetyOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import AuthSettings from '@/components/AuthSettings.vue'
import SiteBeianLinks from '@/components/SiteBeianLinks.vue'

const router = useRouter()
const authStore = useAuthStore()

// 设置状态
const theme = ref(localStorage.getItem('auth-theme') || 'dark')
const lang = ref(localStorage.getItem('auth-lang') || 'zh')
const layout = ref(localStorage.getItem('auth-layout') || 'right')

watch(theme, (v) => localStorage.setItem('auth-theme', v))
watch(lang, (v) => localStorage.setItem('auth-lang', v))
watch(layout, (v) => localStorage.setItem('auth-layout', v))

const form = reactive({ username: '', email: '', password: '', applyAdmin: false, permissionRequestReason: '' })
const submitting = ref(false)
const errorMessage = ref('')

// 动态验证规则
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

const featureItems = computed(() => [
  { icon: ReadOutlined, title: lang.value === 'zh' ? '知识阅读' : 'Reading', desc: lang.value === 'zh' ? '浏览技术文章' : 'Browse articles' },
  { icon: CommentOutlined, title: lang.value === 'zh' ? '评论互动' : 'Comments', desc: lang.value === 'zh' ? '参与讨论交流' : 'Join discussions' },
  { icon: StarOutlined, title: lang.value === 'zh' ? '内容收藏' : 'Favorites', desc: lang.value === 'zh' ? '收藏优质内容' : 'Save content' },
  { icon: SafetyOutlined, title: lang.value === 'zh' ? '账号安全' : 'Security', desc: lang.value === 'zh' ? '数据安全保障' : 'Data protection' }
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
.register-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  transition: all 0.3s;
  background-color: var(--right-bg);
}

/* 主题变量 */
.register-page.theme-dark {
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

.register-page.theme-light {
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

/* 布局模式 */
.register-page.layout-right {
  flex-direction: row;
}

.register-page.layout-right .register-left {
  width: 70%;
}

.register-page.layout-right .register-right {
  width: 30%;
}

.register-page.layout-left {
  flex-direction: row-reverse;
}

.register-page.layout-left .register-left {
  width: 70%;
}

.register-page.layout-left .register-right {
  width: 30%;
}

.register-page.layout-center {
  justify-content: center;
  align-items: center;
}

.register-page.layout-center .register-right {
  width: 100%;
  max-width: 480px;
}

.register-left {
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

/* 光晕效果 */
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

/* 旋转圆圈 */
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

/* 浮动粒子 */
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

/* 流动线条 */
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

/* Logo */
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

/* 右侧 */
.register-right {
  height: 100%;
  background: var(--right-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  transition: all 0.3s;
}

.register-form-wrapper {
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

.register-form {
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

.error-alert {
  margin-bottom: 16px;
  border-radius: 8px;
}

.register-btn {
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  border: none;
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.3);
}

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(22, 119, 255, 0.4);
}

.security-note {
  margin: 12px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
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
  .register-page {
    flex-direction: column;
  }

  .register-left {
    width: 100% !important;
    height: auto;
    padding: 60px 24px 40px;
  }

  .register-right {
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
