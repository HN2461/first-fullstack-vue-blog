<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">IDENTITY</p>
        <h2>用户管理</h2>
        <p>查看注册用户、角色和账号状态，维护控制台访问权限与账号秩序。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="loadUsers">刷新</a-button>
      </div>
    </div>

    <a-card class="enterprise-table-card" :bordered="false">
      <template #title>
        <div class="table-title">
          <strong>用户列表</strong>
          <span>共 {{ users.length }} 个账号</span>
        </div>
      </template>
      <a-alert v-if="errorMessage" type="error" show-icon :message="errorMessage" />
      <a-table
        v-else
        row-key="id"
        :columns="columns"
        :data-source="users"
        :pagination="{ pageSize: 10, showSizeChanger: false }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <a-typography-text strong>{{ record.username }}</a-typography-text>
            <div class="table-summary">{{ record.email }}</div>
          </template>
          <template v-else-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'blue' : 'default'">
              {{ record.role === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button size="small" @click="setStatus(record.id, 'active')">正常</a-button>
              <a-button size="small" @click="setStatus(record.id, 'muted')">禁言</a-button>
              <a-button size="small" danger @click="setStatus(record.id, 'disabled')">禁用</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { listAdminUsers, updateAdminUserStatus } from '@/services/admin'

const users = ref([])
const errorMessage = ref('')
const columns = [
  { title: '用户', key: 'user', dataIndex: 'username' },
  { title: '角色', key: 'role', width: 110 },
  { title: '状态', key: 'status', width: 120 },
  { title: '操作', key: 'action', width: 220 }
]

function getStatusColor(status) {
  if (status === 'active') return 'green'
  if (status === 'muted') return 'gold'
  return 'red'
}

function getStatusLabel(status) {
  if (status === 'active') return '正常'
  if (status === 'muted') return '禁言'
  if (status === 'disabled') return '禁用'
  return status || '-'
}

async function loadUsers() {
  errorMessage.value = ''

  try {
    users.value = await listAdminUsers()
  } catch (error) {
    errorMessage.value = error.message || '用户加载失败'
  }
}

async function setStatus(id, status) {
  await updateAdminUserStatus(id, status)
  await loadUsers()
}

onMounted(loadUsers)
</script>
