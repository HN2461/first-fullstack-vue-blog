<template>
  <div class="register-page">
    <!-- 左侧 70% 品牌展示 -->
    <div class="register-left">
      <!-- 动态背景 -->
      <div class="left-bg">
        <!-- 光晕效果 -->
        <div class="bg-glow glow-1"></div>
        <div class="bg-glow glow-2"></div>
        <div class="bg-glow glow-3"></div>
        <!-- 旋转圆圈 -->
        <div class="bg-circle c1"></div>
        <div class="bg-circle c2"></div>
        <div class="bg-circle c3"></div>
        <div class="bg-circle c4"></div>
        <!-- 浮动粒子 -->
        <div class="bg-dot" v-for="i in 12" :key="i" :class="'d' + i"></div>
        <!-- 流动线条 -->
        <div class="bg-line line-1"></div>
        <div class="bg-line line-2"></div>
        <div class="bg-line line-3"></div>
      </div>

      <!-- Logo - 紧贴左上角 -->
      <div class="brand-logo">
        <div class="logo-icon">K</div>
        <div class="logo-text">
          <h3>知识库</h3>
          <p>Knowledge OS</p>
        </div>
      </div>

      <!-- 主内容 -->
      <div class="left-content">
        <!-- 标题区域 -->
        <div class="hero-text">
          <h1>
            <span class="line">创建您的</span>
            <span class="line highlight">知识库账号</span>
            <span class="line">开启学习之旅</span>
          </h1>
          <p class="hero-desc">
            注册后可阅读文章、参与评论、收藏内容，构建属于您的知识体系。
          </p>
        </div>

        <!-- 功能卡片 -->
        <div class="features">
          <div class="feature-item" v-for="(item, i) in features" :key="i">
            <div class="feature-icon">
              <component :is="item.icon" />
            </div>
            <div class="feature-body">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 统计数据 -->
        <div class="stats">
          <div class="stat-item">
            <span class="stat-num">1000+</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">50+</span>
            <span class="stat-label">分类</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">99%</span>
            <span class="stat-label">可用性</span>
          </div>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="left-footer">
        <p>© 2024 Knowledge OS</p>
      </div>
    </div>

    <!-- 右侧 30% 注册区域 -->
    <div class="register-right">
      <div class="register-form-wrapper">
        <!-- 头部 -->
        <div class="form-header">
          <h2>创建账号</h2>
          <p>填写以下信息完成注册</p>
        </div>

        <!-- 注册表单 -->
        <a-form
          :model="form"
          @finish="handleSubmit"
          layout="vertical"
          class="register-form"
        >
          <a-form-item
            name="username"
            :rules="[
              { required: true, message: '请输入昵称' },
              { min: 2, max: 32, message: '昵称长度2-32个字符' }
            ]"
          >
            <a-input
              v-model:value.trim="form.username"
              placeholder="请输入昵称"
              size="large"
              allow-clear
            >
              <template #prefix><UserOutlined /></template>
            </a-input>
          </a-form-item>

          <a-form-item
            name="email"
            :rules="[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱格式' }
            ]"
          >
            <a-input
              v-model:value.trim="form.email"
              placeholder="请输入邮箱地址"
              size="large"
              allow-clear
            >
              <template #prefix><MailOutlined /></template>
            </a-input>
          </a-form-item>

          <a-form-item
            name="password"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8个字符' }
            ]"
          >
            <a-input-password
              v-model:value="form.password"
              placeholder="请输入密码（至少8位）"
              size="large"
            >
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>

          <!-- 错误提示 -->
          <a-alert
            v-if="errorMessage"
            :message="errorMessage"
            type="error"
            show-icon
            closable
            class="error-alert"
            @close="errorMessage = ''"
          />

          <!-- 注册按钮 -->
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="submitting"
            class="register-btn"
          >
            注册
          </a-button>
        </a-form>

        <!-- 登录入口 -->
        <div class="form-footer">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ReadOutlined,
  CommentOutlined,
  StarOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const submitting = ref(false)
const errorMessage = ref('')

const features = [
  { icon: ReadOutlined, title: '知识阅读', desc: '浏览技术文章' },
  { icon: CommentOutlined, title: '评论互动', desc: '参与讨论交流' },
  { icon: StarOutlined, title: '内容收藏', desc: '收藏优质内容' },
  { icon: SafetyOutlined, title: '账号安全', desc: '数据安全保障' }
]

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    await authStore.register(form)
    message.success('注册成功，正在跳转...')
    await router.push('/console')
  } catch (error) {
    errorMessage.value = error.message || '注册失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 全局布局 */
.register-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* ========== 左侧 70% ========== */
.register-left {
  width: 70%;
  height: 100%;
  background: linear-gradient(135deg, #0a1628 0%, #132743 50%, #1a3a5c 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 80px 60px;
  position: relative;
  overflow: hidden;
}

/* 动态背景 */
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

/* Logo - 紧贴左上角 */
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
  background: linear-gradient(135deg, #1677ff, #4096ff);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.4);
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

/* 左侧内容 */
.left-content {
  position: relative;
  z-index: 2;
  max-width: 640px;
}

/* 标题区域 */
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

/* 功能卡片 */
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
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fade-in 0.5s ease-out both;
}

.feature-item:nth-child(1) { animation-delay: 0.1s; }
.feature-item:nth-child(2) { animation-delay: 0.2s; }
.feature-item:nth-child(3) { animation-delay: 0.3s; }
.feature-item:nth-child(4) { animation-delay: 0.4s; }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
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
  transition: all 0.3s;
}

.feature-item:hover .feature-icon {
  background: rgba(22, 119, 255, 0.3);
  transform: scale(1.1);
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

/* 统计数据 */
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

/* 底部版权 */
.left-footer {
  position: absolute;
  bottom: 24px;
  left: 80px;
  color: rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

/* ========== 右侧 30% ========== */
.register-right {
  width: 30%;
  height: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.register-form-wrapper {
  width: 100%;
  max-width: 340px;
  animation: fade-in 0.5s ease-out;
}

/* 表单头部 */
.form-header {
  margin-bottom: 32px;
}

.form-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.form-header p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

/* 表单样式 */
.register-form {
  margin-bottom: 24px;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 10px;
  padding: 10px 14px;
}

:deep(.ant-input-prefix) {
  color: #bfbfbf;
  margin-right: 10px;
}

.error-alert {
  margin-bottom: 16px;
  border-radius: 8px;
}

/* 注册按钮 */
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

/* 底部登录入口 */
.form-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.form-footer a {
  color: #1677ff;
  font-weight: 600;
  margin-left: 4px;
}

/* ========== 响应式 ========== */
@media (max-width: 1024px) {
  .register-left {
    padding: 60px 50px;
  }

  .brand-logo {
    top: 24px;
    left: 24px;
  }

  .hero-text .line {
    font-size: 34px;
  }

  .features {
    grid-template-columns: 1fr;
  }

  .stats {
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .register-page {
    flex-direction: column;
  }

  .register-left {
    width: 100%;
    height: auto;
    padding: 80px 24px 40px;
  }

  .brand-logo {
    top: 20px;
    left: 20px;
  }

  .hero-text .line {
    font-size: 26px;
  }

  .hero-desc {
    font-size: 13px;
  }

  .features {
    display: none;
  }

  .stats {
    display: none;
  }

  .left-footer {
    position: static;
    margin-top: 24px;
  }

  .register-right {
    width: 100%;
    padding: 30px 20px;
  }
}
</style>
