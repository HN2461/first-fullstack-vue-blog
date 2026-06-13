<template>
  <section class="enterprise-login">
    <div class="login-product-panel">
      <div class="login-brand">
        <span>K</span>
        <div>
          <strong>Knowledge OS</strong>
          <small>Enterprise Knowledge Workspace</small>
        </div>
      </div>
      <h1>创建知识库访问账号</h1>
      <p>注册后可进入知识库系统阅读文章、参与评论、点赞与收藏。管理员能力仍由后台角色权限控制。</p>
      <a-row :gutter="[12, 12]" class="login-capabilities">
        <a-col :span="12"><a-card size="small">知识阅读</a-card></a-col>
        <a-col :span="12"><a-card size="small">评论互动</a-card></a-col>
        <a-col :span="12"><a-card size="small">内容收藏</a-card></a-col>
        <a-col :span="12"><a-card size="small">账号中心</a-card></a-col>
      </a-row>
    </div>

    <a-card class="login-card" :bordered="false">
      <a-typography-title :level="3">注册账号</a-typography-title>
      <a-typography-paragraph type="secondary">
        创建普通读者身份。后台管理权限由管理员在用户管理中维护。
      </a-typography-paragraph>
      <a-alert v-if="errorMessage" class="login-alert" type="error" show-icon :message="errorMessage" />
      <a-form layout="vertical" :model="form" @finish="handleSubmit">
        <a-form-item label="昵称" name="username" :rules="[{ required: true, message: '请输入昵称' }]">
          <a-input v-model:value.trim="form.username" autocomplete="nickname" placeholder="你的昵称" size="large" />
        </a-form-item>
        <a-form-item label="邮箱" name="email" :rules="[{ required: true, message: '请输入邮箱' }]">
          <a-input v-model:value.trim="form.email" autocomplete="email" placeholder="name@example.com" size="large" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" autocomplete="new-password" placeholder="至少 8 位" size="large" />
        </a-form-item>
        <a-button block type="primary" html-type="submit" size="large" :loading="submitting">
          创建账号
        </a-button>
      </a-form>
      <div class="login-card-footer">
        <router-link to="/login">已有账号，去登录</router-link>
        <router-link to="/">返回前台</router-link>
      </div>
    </a-card>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  username: '',
  email: '',
  password: ''
})

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    await authStore.register(form)
    await router.push('/console')
  } catch (error) {
    errorMessage.value = error.message || '注册失败'
  } finally {
    submitting.value = false
  }
}
</script>
