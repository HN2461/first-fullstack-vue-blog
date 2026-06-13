<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">ACCOUNT</p>
        <h2>个人信息</h2>
        <p>查看当前登录账号、权限身份和系统访问状态。</p>
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card class="profile-summary-card" :bordered="false">
          <a-avatar class="profile-avatar" :size="72">{{ userInitial }}</a-avatar>
          <h3>{{ authStore.user?.username || '用户' }}</h3>
          <p>{{ authStore.user?.email || '未绑定邮箱' }}</p>
          <a-tag :color="authStore.isAdmin ? 'blue' : 'default'">
            {{ authStore.isAdmin ? '管理员' : '普通用户' }}
          </a-tag>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="16">
        <a-card title="账号资料" :bordered="false">
          <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="12">
              <div class="profile-field">
                <span>用户名</span>
                <strong>{{ authStore.user?.username || '-' }}</strong>
              </div>
            </a-col>
            <a-col :xs="24" :sm="12">
              <div class="profile-field">
                <span>邮箱</span>
                <strong>{{ authStore.user?.email || '-' }}</strong>
              </div>
            </a-col>
            <a-col :xs="24" :sm="12">
              <div class="profile-field">
                <span>角色</span>
                <strong>{{ authStore.isAdmin ? '管理员' : '普通用户' }}</strong>
              </div>
            </a-col>
            <a-col :xs="24" :sm="12">
              <div class="profile-field">
                <span>账号状态</span>
                <strong>{{ statusLabel }}</strong>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <a-card class="enterprise-section" title="安全与偏好" :bordered="false">
          <a-list :data-source="securityItems">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.description" />
                <a-tag>{{ item.status }}</a-tag>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const userInitial = computed(() => {
  return (authStore.user?.username || authStore.user?.email || 'U').slice(0, 1).toUpperCase()
})
const statusLabel = computed(() => {
  if (authStore.user?.status === 'active') return '正常'
  if (authStore.user?.status === 'muted') return '禁言'
  if (authStore.user?.status === 'disabled') return '禁用'
  return authStore.user?.status || '正常'
})
const securityItems = [
  {
    title: '登录身份',
    description: '当前使用 JWT 登录态访问控制台。',
    status: '已启用'
  },
  {
    title: '资料编辑',
    description: '用于维护账号昵称、头像和公开资料。',
    status: '规划中'
  },
  {
    title: '密码安全',
    description: '用于维护密码策略、登录记录和安全提醒。',
    status: '规划中'
  }
]
</script>
