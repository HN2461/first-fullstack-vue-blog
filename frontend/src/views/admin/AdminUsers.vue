<template>
  <div class="users-page">
    <BlogTable
      ref="tableRef"
      :api-fn="loadUsers"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
      :show-column-setting="true"
      :height="'100%'"
      row-selection
      @selection-change="handleSelectionChange"
    >
      <template #toolbar>
        <BatchActionBar :count="selectedUserIds.length" @clear="clearSelection">
          <a-dropdown>
            <a-button size="small">
              批量状态 <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu @click="({ key }) => handleBatchStatus(key)">
                <a-menu-item key="active">恢复正常</a-menu-item>
                <a-menu-item key="muted">禁言</a-menu-item>
                <a-menu-item key="disabled" danger>禁用账号</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </BatchActionBar>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索用户名或邮箱..."
          style="width: 220px"
          allow-clear
          @search="handleSearch"
          @change="handleSearchChange"
        />
        <a-select
          v-model:value="filterRole"
          placeholder="角色筛选"
          style="width: 120px"
          allow-clear
        >
          <a-select-option value="all">全部角色</a-select-option>
          <a-select-option value="admin">管理员</a-select-option>
          <a-select-option value="user">普通用户</a-select-option>
        </a-select>
        <a-select
          v-model:value="filterStatus"
          placeholder="状态筛选"
          style="width: 120px"
          allow-clear
        >
          <a-select-option value="all">全部状态</a-select-option>
          <a-select-option value="active">正常</a-select-option>
          <a-select-option value="muted">禁言</a-select-option>
          <a-select-option value="disabled">禁用</a-select-option>
        </a-select>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'user'">
          <div class="user-info-cell">
            <div class="user-avatar">
              <img v-if="record.avatar" :src="record.avatar" :alt="record.username" class="avatar-img">
              <span v-else class="avatar-placeholder">{{ (record.username || '').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="user-detail">
              <span class="user-name">{{ record.username }}</span>
              <span class="user-email">{{ record.email }}</span>
            </div>
          </div>
        </template>

        <template v-else-if="column.key === 'role'">
          <a-tag :color="record.role === 'admin' ? 'blue' : 'default'" :bordered="false">
            {{ record.role === 'admin' ? '管理员' : '普通用户' }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'profile'">
          <div class="profile-cell">
            <span class="profile-bio">{{ record.bio || '未填写简介' }}</span>
            <span class="profile-meta">
              {{ record.location || '未填写所在地' }}
              <template v-if="record.website">
                ·
                <a :href="record.website" target="_blank" rel="noreferrer">个人网站</a>
              </template>
            </span>
          </div>
        </template>

        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)" :bordered="false">
            {{ getStatusLabel(record.status) }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'createdAt'">
          <span class="time-text">{{ formatDate(record.createdAt) }}</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-dropdown>
              <a-button type="text" size="small" class="action-more-btn">
                操作 <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu @click="({ key }) => handleAction(key, record)">
                  <a-menu-item key="active" v-if="record.status !== 'active'">
                    <CheckCircleOutlined /> 恢复正常
                  </a-menu-item>
                  <a-menu-item key="muted" v-if="record.status !== 'muted'">
                    <StopOutlined /> 禁言
                  </a-menu-item>
                  <a-menu-item key="disabled" v-if="record.status !== 'disabled'" danger>
                    <CloseCircleOutlined /> 禁用账号
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </template>
    </BlogTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CheckCircleOutlined,
  StopOutlined,
  CloseCircleOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import { batchUpdateAdminUserStatus, listAdminUsers, updateAdminUserStatus } from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const tableRef = ref(null)
const searchKeyword = ref('')
const debouncedKeyword = ref('')  // 防抖后的搜索关键词，用于实际请求
const filterRole = ref('all')
const filterStatus = ref('all')
const actionLoadingKey = ref('')
const selectedUserIds = ref([])
const { runAction, confirmAction } = useAdminActions()

// 筛选参数：变化时 BlogTable 自动重新加载（使用防抖后的 keyword）
const filterParams = computed(() => ({
  keyword: debouncedKeyword.value || undefined,
  role: filterRole.value === 'all' ? undefined : filterRole.value,
  status: filterStatus.value === 'all' ? undefined : filterStatus.value
}))

const columns = [
  {
    title: '用户',
    key: 'user',
    dataIndex: 'username',
    width: 280
  },
  {
    title: '角色',
    key: 'role',
    width: 100,
    align: 'center'
  },
  {
    title: '资料',
    key: 'profile',
    dataIndex: 'bio',
    width: 240
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    align: 'center'
  },
  {
    title: '注册时间',
    key: 'createdAt',
    width: 170,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 90,
    align: 'center'
  }
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

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载用户列表（适配 BlogTable 的 apiFn 格式）
async function loadUsers(params) {
  const result = await listAdminUsers(params)
  return { items: result.items || [], total: result.total || 0 }
}

// 搜索防抖：输入时延迟 300ms 再触发实际请求
let searchTimer = null
function handleSearch() {
  // 点击搜索按钮时立即执行
  clearTimeout(searchTimer)
  debouncedKeyword.value = searchKeyword.value.trim()
}
function handleSearchChange() {
  // 输入变化时防抖 300ms
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedKeyword.value = searchKeyword.value.trim()
  }, 300)
}

function handleSelectionChange(keys) {
  selectedUserIds.value = keys || []
}

function clearSelection() {
  selectedUserIds.value = []
  tableRef.value?.clearSelection?.()
}

function handleBatchStatus(status) {
  if (selectedUserIds.value.length === 0) return

  const actionMap = {
    active: { label: '恢复正常', okType: 'primary' },
    muted: { label: '禁言', okType: 'warning' },
    disabled: { label: '禁用账号', okType: 'danger' }
  }
  const action = actionMap[status]
  if (!action) return

  confirmAction({
    title: `确认批量${action.label}`,
    content: `将 ${selectedUserIds.value.length} 个用户批量${action.label}。`,
    okText: `确认${action.label}`,
    okType: action.okType,
    async onOk() {
      await runAction(() => batchUpdateAdminUserStatus(selectedUserIds.value, status), {
        successMessage: '用户状态已批量更新',
        errorMessage: '批量操作失败',
        onSuccess: () => {
          clearSelection()
          tableRef.value?.refresh()
        }
      })
    }
  }).catch(() => {})
}

async function handleAction(key, record) {
  const actionMap = {
    active: { label: '恢复正常', okType: 'primary' },
    muted: { label: '禁言', okType: 'warning' },
    disabled: { label: '禁用账号', okType: 'danger' }
  }
  const action = actionMap[key]
  if (!action) return

  if (actionLoadingKey.value) return

  confirmAction({
    title: `确认${action.label}`,
    content: `确定要将用户「${record.username}」${action.label}吗？`,
    okText: `确认${action.label}`,
    okType: action.okType,
    async onOk() {
      actionLoadingKey.value = `${key}:${record.id}`
      try {
        await runAction(() => updateAdminUserStatus(record.id, key), {
          successMessage: `已将用户${action.label}`,
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
.users-page {
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
}

/* 用户信息单元格 */
.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.user-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f5ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-placeholder {
  font-size: 14px;
  font-weight: 600;
  color: #1677ff;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-cell {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.profile-bio,
.profile-meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-bio {
  color: #1f2937;
  font-size: 13px;
}

.profile-meta {
  color: #8c8c8c;
  font-size: 12px;
}

.profile-meta a {
  color: #1677ff;
}

/* 时间 */
.time-text {
  font-size: 13px;
  color: #525252;
  white-space: nowrap;
}

/* 操作按钮 */
.action-more-btn {
  font-size: 12px;
  color: #1677ff;
}
</style>
