<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">IDENTITY</p>
        <h2>用户管理</h2>
        <p>查看注册用户、角色和账号状态，维护控制台访问权限与账号秩序。</p>
      </div>
    </div>

    <a-alert v-if="errorMessage" type="error" show-icon :message="errorMessage" style="margin-bottom: 12px" />

    <BlogTable
      ref="tableRef"
      :api-fn="loadUsers"
      :columns="columns"
      :auto-load="true"
      :hide-pagination="false"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
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
    </BlogTable>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import BlogTable from '@/components/BlogTable.vue'
import { listAdminUsers, updateAdminUserStatus } from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const tableRef = ref(null)
const errorMessage = ref('')
const actionLoadingKey = ref('')
const { runAction, confirmAction } = useAdminActions()

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

// BlogTable 的 apiFn：返回 { items, total } 格式
async function loadUsers(params) {
  errorMessage.value = ''
  try {
    return await listAdminUsers(params)
  } catch (error) {
    errorMessage.value = error.message || '用户加载失败'
    return { items: [], total: 0 }
  }
}

async function setStatus(id, status) {
  const statusLabelMap = {
    active: '正常',
    muted: '禁言',
    disabled: '禁用'
  }

  if (actionLoadingKey.value) {
    return
  }

  confirmAction({
    title: `确认调整用户状态`,
    content: `确定要将该用户状态调整为“${statusLabelMap[status]}”吗？`,
    okText: '确认调整',
    okType: status === 'disabled' ? 'danger' : 'primary',
    async onOk() {
      actionLoadingKey.value = `${status}:${id}`
      try {
        await runAction(() => updateAdminUserStatus(id, status), {
          successMessage: '状态已更新',
          errorMessage: '操作失败',
          onSuccess: () => tableRef.value?.refresh()
        })
      } finally {
        actionLoadingKey.value = ''
      }
    }
  }).catch(() => {})
}
</script>

<style scoped>
.enterprise-page-header {
  margin-bottom: 16px;
}

.enterprise-page-kicker {
  font-size: 11px;
  letter-spacing: 2px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.enterprise-page-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #1a1a1a;
}

.enterprise-page-header p {
  font-size: 13px;
  color: #8c8c8c;
  margin: 0;
}

.table-summary {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}
</style>
