<template>
  <section class="enterprise-login">
    <div class="login-product-panel">
      <div class="login-brand">
        <span>K</span>
        <div>
          <strong>Knowledge OS</strong>
          <small>Personal Knowledge Operations</small>
        </div>
      </div>
      <h1>面向长期维护的个人技术知识库后台</h1>
      <p>统一管理文章库、媒体资产、评论审核、站点配置和技术知识文档。</p>
      <a-row :gutter="[12, 12]" class="login-capabilities">
        <a-col :span="12"><a-card size="small">内容发布</a-card></a-col>
        <a-col :span="12"><a-card size="small">评论审核</a-card></a-col>
        <a-col :span="12"><a-card size="small">媒体资产</a-card></a-col>
        <a-col :span="12"><a-card size="small">站点运营</a-card></a-col>
      </a-row>
    </div>

    <a-card class="login-card" :bordered="false">
      <a-typography-title :level="3">登录控制台</a-typography-title>
      <a-typography-paragraph type="secondary">
        使用管理员账号进入后台。生产环境请更换强密码和 JWT 密钥。
      </a-typography-paragraph>
      <a-alert v-if="errorMessage" class="login-alert" type="error" show-icon :message="errorMessage" />
      <a-form layout="vertical" :model="form" @finish="handleSubmit">
        <a-form-item label="邮箱" name="email" :rules="[{ required: true, message: '请输入邮箱' }]">
          <a-input v-model:value.trim="form.email" autocomplete="email" placeholder="admin@example.com" size="large" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" autocomplete="current-password" placeholder="请输入密码" size="large" />
        </a-form-item>
        <a-button block type="primary" html-type="submit" size="large" :loading="submitting">
          登录控制台
        </a-button>
      </a-form>
      <div class="login-card-footer">
        <router-link to="/register">注册普通账号</router-link>
        <router-link to="/">返回前台</router-link>
      </div>
    </a-card>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  email: '',
  password: ''
})

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    await authStore.login(form)
    await router.push(route.query.redirect || '/console')
  } catch (error) {
    errorMessage.value = error.message || '登录失败'
  } finally {
    submitting.value = false
  }
}
</script>
