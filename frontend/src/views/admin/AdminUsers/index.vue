<template>
  <section class="users-page enterprise-page">
    <header class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">ACCOUNT DIRECTORY</p>
        <h1>用户管理</h1>
        <p>统一维护账号状态、角色分配和密码重置，支持多选后的批量处理。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="tableRef?.refresh?.()">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreateUser">
          <template #icon><UserAddOutlined /></template>
          新增用户
        </a-button>
      </div>
    </header>

    <BlogTable
      ref="tableRef"
      class="users-table"
      :api-fn="loadUsers"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
      :show-column-setting="true"
      :height="'100%'"
      :row-selection="rowSelection"
      @selection-change="handleSelectionChange"
    >
      <template #toolbar>
        <BatchActionBar :count="selectedUserIds.length" @clear="clearSelection">
          <a-dropdown>
            <a-button size="small">
              <template #icon><PoweroffOutlined /></template>
              批量状态 <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu @click="({ key }) => handleBatchStatus(key)">
                <a-menu-item key="active">启用账号</a-menu-item>
                <a-menu-item key="muted">禁言</a-menu-item>
                <a-menu-item key="disabled" danger>禁用账号</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-button size="small" @click="openRoleModal()">
            <template #icon><TeamOutlined /></template>
            批量修改角色
          </a-button>
          <a-button size="small" danger @click="openResetPasswordModal()">
            <template #icon><KeyOutlined /></template>
            批量重置密码
          </a-button>
          <a-popconfirm
            title="确认删除选中用户？"
            ok-text="删除"
            cancel-text="取消"
            @confirm="removeSelectedUsers"
          >
            <a-button size="small" danger>
              <template #icon><DeleteOutlined /></template>
              批量删除
            </a-button>
          </a-popconfirm>
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
          style="width: 160px"
          allow-clear
        >
          <a-select-option value="all">全部角色</a-select-option>
          <a-select-option v-for="role in roles" :key="role.code" :value="role.code">
            {{ role.name }}
          </a-select-option>
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
              <span v-if="record.remarkName" class="user-remark">{{ record.remarkName }}</span>
              <span class="user-email">{{ record.email }}</span>
            </div>
          </div>
        </template>

        <template v-else-if="column.key === 'roles'">
          <a-space wrap size="small">
            <a-tag
              v-for="role in record.roles || []"
              :key="role.id || role.code"
              :color="role.isSuperAdmin ? 'red' : 'blue'"
              :bordered="false"
            >
              {{ role.name || role.code }}
            </a-tag>
            <a-tag v-if="!record.roles?.length" :bordered="false">未分配</a-tag>
          </a-space>
        </template>

        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)" :bordered="false">
            {{ getStatusLabel(record.status) }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'permission'">
          <a-tag :color="getRequestColor(record.permissionRequestStatus)" :bordered="false">
            {{ getRequestLabel(record.permissionRequestStatus) }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'createdAt'">
          <span class="time-text">{{ formatDate(record.createdAt) }}</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <span v-if="record.isSuperAdmin" class="protected-action-text">系统保留</span>
          <a-dropdown v-else>
            <a-button type="text" size="small" class="action-more-btn">
              <MoreOutlined />
            </a-button>
            <template #overlay>
              <a-menu @click="({ key }) => handleAction(key, record)">
                <a-menu-item key="remark">设置备注</a-menu-item>
                <a-menu-item key="roles">修改角色</a-menu-item>
                <a-menu-item key="reset-password">重置密码</a-menu-item>
                <a-menu-divider />
                <a-menu-item v-if="record.status !== 'active'" key="active">启用账号</a-menu-item>
                <a-menu-item v-if="record.status !== 'muted'" key="muted">禁言</a-menu-item>
                <a-menu-item v-if="record.status !== 'disabled'" key="disabled" danger>禁用账号</a-menu-item>
                <a-menu-divider />
                <a-menu-item key="delete" danger>删除用户</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </BlogTable>

    <a-modal
      v-model:open="createUserVisible"
      title="新增用户"
      ok-text="创建账号"
      cancel-text="取消"
      :confirm-loading="creatingUser"
      :destroy-on-close="true"
      :width="720"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
      @ok="submitCreateUser"
    >
      <a-form ref="createUserFormRef" :model="createUserForm" :rules="createUserRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="昵称" name="username">
              <a-input v-model:value="createUserForm.username" :maxlength="32" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="createUserForm.email" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="初始密码" name="password">
              <a-input-password v-model:value="createUserForm.password" autocomplete="new-password" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="账号状态" name="status">
              <a-select v-model:value="createUserForm.status">
                <a-select-option value="active">正常</a-select-option>
                <a-select-option value="muted">禁言</a-select-option>
                <a-select-option value="disabled">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="用户备注" name="remarkName">
          <a-input v-model:value="createUserForm.remarkName" placeholder="例如：老客户、同事、测试账号" :maxlength="60" allow-clear />
        </a-form-item>
        <a-form-item label="绑定角色" name="roleIds">
          <a-select v-model:value="createUserForm.roleIds" mode="multiple" placeholder="不选择时默认绑定访客角色">
            <a-select-option v-for="role in assignableRoles" :key="role.id" :value="role.id">
              {{ role.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="remarkVisible"
      title="设置用户备注"
      ok-text="保存备注"
      cancel-text="取消"
      :confirm-loading="savingRemark"
      :destroy-on-close="true"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
      @ok="submitRemark"
    >
      <a-form layout="vertical">
        <a-form-item label="目标用户">
          <a-input :value="remarkRecord?.email || ''" disabled />
        </a-form-item>
        <a-form-item label="用户备注">
          <a-input v-model:value="remarkForm.remarkName" placeholder="仅后台用户管理可见" :maxlength="60" allow-clear />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="roleModalVisible"
      title="修改用户角色"
      ok-text="保存角色"
      cancel-text="取消"
      :confirm-loading="savingRoles"
      :destroy-on-close="true"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
      @ok="submitRoles"
    >
      <a-form layout="vertical">
        <a-form-item label="目标用户">
          <a-input :value="roleTargetLabel" disabled />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select v-model:value="roleForm.roleIds" mode="multiple" placeholder="请选择角色">
            <a-select-option
              v-for="role in assignableRoles"
              :key="role.id"
              :value="role.id"
            >
              {{ role.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="resetPasswordVisible"
      title="重置用户密码"
      ok-text="确认重置"
      cancel-text="取消"
      :confirm-loading="resettingPassword"
      :destroy-on-close="true"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
      @ok="submitResetPassword"
    >
      <a-alert
        type="warning"
        show-icon
        message="该操作会使目标用户当前登录态失效"
        class="reset-alert"
      />
      <a-form layout="vertical">
        <a-form-item label="目标用户">
          <a-input :value="resetTargetLabel" disabled />
        </a-form-item>
        <a-form-item label="新密码" required>
          <a-input-password v-model:value="resetPasswordForm.newPassword" autocomplete="new-password" />
        </a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  DeleteOutlined,
  DownOutlined,
  KeyOutlined,
  MoreOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserAddOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import {
  batchDeleteAdminUsers,
  batchResetAdminUserPasswords,
  batchUpdateAdminUserRoles,
  batchUpdateAdminUserStatus,
  createAdminUser,
  deleteAdminUser,
  listAllRbacRoles,
  listAdminUsers,
  updateAdminUserRemark,
  updateAdminUserRoles,
  updateAdminUserStatus
} from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const tableRef = ref(null)
const searchKeyword = ref('')
const debouncedKeyword = ref('')
const filterRole = ref('all')
const filterStatus = ref('all')
const selectedUserIds = ref([])
const selectedRows = ref([])
const roles = ref([])
const roleModalVisible = ref(false)
const createUserVisible = ref(false)
const creatingUser = ref(false)
const savingRoles = ref(false)
const roleRecord = ref(null)
const resetPasswordVisible = ref(false)
const resettingPassword = ref(false)
const resetRecord = ref(null)
const remarkVisible = ref(false)
const savingRemark = ref(false)
const remarkRecord = ref(null)
const createUserFormRef = ref(null)
const { runAction, confirmAction } = useAdminActions()

const roleForm = reactive({ roleIds: [] })
const remarkForm = reactive({ remarkName: '' })
const resetPasswordForm = reactive({ newPassword: '' })
const createUserForm = reactive({
  username: '',
  email: '',
  password: '',
  remarkName: '',
  roleIds: [],
  status: 'active'
})
const createUserRules = {
  username: [
    { required: true, message: '请输入昵称' },
    { min: 2, max: 32, message: '昵称长度需为 2-32 个字符' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' }
  ],
  password: [
    { required: true, message: '请输入初始密码' },
    { min: 8, max: 72, message: '密码长度需为 8-72 个字符' }
  ]
}

const assignableRoles = computed(() => roles.value.filter((role) => !role.isSuperAdmin))
const filterParams = computed(() => ({
  keyword: debouncedKeyword.value || undefined,
  role: filterRole.value === 'all' ? undefined : filterRole.value,
  status: filterStatus.value === 'all' ? undefined : filterStatus.value
}))
const roleTargetLabel = computed(() => roleRecord.value ? roleRecord.value.email : `已选 ${selectedUserIds.value.length} 个用户`)
const resetTargetLabel = computed(() => resetRecord.value ? resetRecord.value.email : `已选 ${selectedUserIds.value.length} 个用户`)

const columns = [
  { title: '用户', key: 'user', dataIndex: 'username', width: 280 },
  { title: '角色', key: 'roles', width: 240 },
  { title: '状态', key: 'status', width: 90, align: 'center' },
  { title: '权限申请', key: 'permission', width: 110, align: 'center' },
  { title: '注册时间', key: 'createdAt', width: 170, align: 'center' },
  { title: '操作', key: 'action', width: 100, align: 'center' }
]
const rowSelection = computed(() => ({
  getCheckboxProps: (record) => ({
    disabled: record.isSuperAdmin
  })
}))

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

function getRequestLabel(status) {
  if (status === 'pending') return '待审批'
  if (status === 'approved') return '已通过'
  if (status === 'rejected') return '已驳回'
  return '无申请'
}

function getRequestColor(status) {
  if (status === 'pending') return 'gold'
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  return 'default'
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

async function loadUsers(params) {
  const result = await listAdminUsers(params)
  return { items: result.items || [], total: result.total || 0 }
}

let searchTimer = null
function handleSearch() {
  clearTimeout(searchTimer)
  debouncedKeyword.value = searchKeyword.value.trim()
}

function handleSearchChange() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedKeyword.value = searchKeyword.value.trim()
  }, 300)
}

function handleSelectionChange(keys, rows) {
  selectedUserIds.value = keys || []
  selectedRows.value = rows || []
}

function clearSelection() {
  selectedUserIds.value = []
  selectedRows.value = []
  tableRef.value?.clearSelection?.()
}

function ensureSelected() {
  if (selectedUserIds.value.length > 0) return true
  message.warning('请先选择用户')
  return false
}

function handleBatchStatus(status) {
  if (!ensureSelected()) return
  confirmStatus(status, selectedUserIds.value, () => {
    clearSelection()
    tableRef.value?.refresh()
  })
}

function confirmStatus(status, ids, onSuccess) {
  const actionMap = {
    active: { label: '启用账号', okType: 'primary' },
    muted: { label: '禁言', okType: 'warning' },
    disabled: { label: '禁用账号', okType: 'danger' }
  }
  const action = actionMap[status]
  if (!action) return

  confirmAction({
    title: `确认${action.label}`,
    content: `将 ${ids.length} 个用户${action.label}。`,
    okText: `确认${action.label}`,
    okType: action.okType,
    async onOk() {
      await runAction(
        () => ids.length === 1 ? updateAdminUserStatus(ids[0], status) : batchUpdateAdminUserStatus(ids, status),
        {
          successMessage: '用户状态已更新',
          errorMessage: '操作失败',
          onSuccess
        }
      )
    }
  }).catch(() => {})
}

function openRoleModal(record = null) {
  if (record?.isSuperAdmin) {
    message.warning('超级管理员账号不支持修改角色')
    return
  }
  if (!record && !ensureSelected()) return
  roleRecord.value = record
  roleForm.roleIds = record
    ? (record.roles || []).map((role) => role.id).filter((id) => assignableRoles.value.some((item) => item.id === id))
    : []
  roleModalVisible.value = true
}

function openCreateUser() {
  createUserForm.username = ''
  createUserForm.email = ''
  createUserForm.password = ''
  createUserForm.remarkName = ''
  createUserForm.roleIds = []
  createUserForm.status = 'active'
  createUserVisible.value = true
}

async function submitCreateUser() {
  try {
    await createUserFormRef.value?.validate()
  } catch {
    return
  }

  creatingUser.value = true
  try {
    await createAdminUser({ ...createUserForm })
    message.success('用户已创建')
    createUserVisible.value = false
    tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '用户创建失败')
  } finally {
    creatingUser.value = false
  }
}

function openRemarkModal(record) {
  remarkRecord.value = record
  remarkForm.remarkName = record?.remarkName || ''
  remarkVisible.value = true
}

async function submitRemark() {
  if (!remarkRecord.value) return

  savingRemark.value = true
  try {
    await updateAdminUserRemark(remarkRecord.value.id, remarkForm.remarkName.trim())
    message.success('用户备注已更新')
    remarkVisible.value = false
    tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '用户备注保存失败')
  } finally {
    savingRemark.value = false
  }
}

async function submitRoles() {
  if (!roleForm.roleIds.length) {
    message.warning('请选择至少一个角色')
    return
  }

  savingRoles.value = true
  try {
    if (roleRecord.value) {
      await updateAdminUserRoles(roleRecord.value.id, roleForm.roleIds)
    } else {
      await batchUpdateAdminUserRoles(selectedUserIds.value, roleForm.roleIds)
      clearSelection()
    }
    message.success('用户角色已更新')
    roleModalVisible.value = false
    tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '角色保存失败')
  } finally {
    savingRoles.value = false
  }
}

function openResetPasswordModal(record = null) {
  if (record?.isSuperAdmin) {
    message.warning('超级管理员账号不支持重置密码')
    return
  }
  if (!record && !ensureSelected()) return
  resetRecord.value = record
  resetPasswordForm.newPassword = ''
  resetPasswordVisible.value = true
}

async function submitResetPassword() {
  const password = resetPasswordForm.newPassword
  if (!password || password.length < 8 || password.length > 72) {
    message.warning('新密码长度需为 8-72 个字符')
    return
  }

  resettingPassword.value = true
  try {
    const ids = resetRecord.value ? [resetRecord.value.id] : selectedUserIds.value
    await batchResetAdminUserPasswords(ids, password)
    message.success('用户密码已重置')
    resetPasswordVisible.value = false
    if (!resetRecord.value) clearSelection()
    tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '密码重置失败')
  } finally {
    resettingPassword.value = false
  }
}

async function removeUser(record) {
  if (!record || record.isSuperAdmin) {
    message.warning('超级管理员账号不支持删除')
    return
  }

  await confirmAction({
    title: '确认删除用户',
    content: `确定要删除用户「${record.username}」吗？该操作不可撤销。`,
    okText: '删除用户',
    okType: 'danger',
    async onOk() {
      await runAction(
        () => deleteAdminUser(record.id),
        {
          successMessage: '用户已删除',
          errorMessage: '删除失败',
          onSuccess: () => tableRef.value?.refresh()
        }
      )
    }
  }).catch(() => {})
}

async function removeSelectedUsers() {
  if (!ensureSelected()) return

  await confirmAction({
    title: '确认批量删除用户',
    content: `确定要删除选中的 ${selectedUserIds.value.length} 个用户吗？该操作不可撤销。`,
    okText: '批量删除',
    okType: 'danger',
    async onOk() {
      await runAction(
        () => batchDeleteAdminUsers(selectedUserIds.value),
        {
          successMessage: '用户已批量删除',
          errorMessage: '批量删除失败',
          onSuccess: () => {
            clearSelection()
            tableRef.value?.refresh()
          }
        }
      )
    }
  }).catch(() => {})
}

function handleAction(key, record) {
  if (key === 'roles') {
    openRoleModal(record)
    return
  }
  if (key === 'remark') {
    openRemarkModal(record)
    return
  }
  if (key === 'reset-password') {
    openResetPasswordModal(record)
    return
  }
  if (key === 'delete') {
    removeUser(record)
    return
  }
  confirmStatus(key, [record.id], () => tableRef.value?.refresh())
}

async function loadRoles() {
  try {
    roles.value = await listAllRbacRoles()
  } catch (error) {
    message.error(error.message || '角色列表加载失败')
  }
}

onMounted(loadRoles)
</script>

<style scoped>
.users-page {
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
}

.users-table {
  min-height: 0;
}

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
  background: #f3ead9;
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
  color: #7b4a1d;
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
  font-weight: 600;
  color: var(--console-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email,
.user-remark,
.time-text {
  font-size: 12px;
  color: var(--console-text-secondary);
  white-space: nowrap;
}

.user-remark {
  color: var(--console-primary);
}

.action-more-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--console-primary);
}

.protected-action-text {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.reset-alert {
  margin-bottom: 16px;
}

@media (max-width: 900px) {
  .users-page {
    height: auto;
  }
}
</style>
