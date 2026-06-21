<template>
  <section class="rbac-page enterprise-page">
    <header class="enterprise-page-header">
      <div>
        <h1>角色管理</h1>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="refreshRoles">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-tooltip :title="authStore.isSuperAdmin ? '新增角色' : '仅超级管理员可新增角色'">
          <a-button type="primary" :disabled="!authStore.isSuperAdmin" @click="openCreate">
            <template #icon><PlusOutlined /></template>
            新增角色
          </a-button>
        </a-tooltip>
      </div>
    </header>

    <BlogTable
      ref="tableRef"
      class="role-table"
      :api-fn="loadRoleTable"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
      :show-column-setting="true"
      :height="'100%'"
      :row-selection="rowSelection"
    >
      <template #toolbar>
        <BatchActionBar :count="selectedRoleIds.length" @clear="clearSelection">
          <a-button size="small" :disabled="!authStore.isSuperAdmin" @click="openBatchPermission">
            <template #icon><SafetyOutlined /></template>
            批量调整菜单权限
          </a-button>
          <a-popconfirm title="确认批量删除选中角色？" ok-text="删除" cancel-text="取消" @confirm="removeSelectedRoles">
            <a-button size="small" danger :disabled="!authStore.isSuperAdmin">
              <template #icon><DeleteOutlined /></template>
              批量删除
            </a-button>
          </a-popconfirm>
        </BatchActionBar>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索角色名称或编码..."
          style="width: 240px"
          allow-clear
          @search="handleSearch"
          @change="handleSearchChange"
        />
        <a-select v-model:value="filterStatus" placeholder="状态筛选" style="width: 128px">
          <a-select-option value="all">全部状态</a-select-option>
          <a-select-option value="active">启用</a-select-option>
          <a-select-option value="disabled">禁用</a-select-option>
        </a-select>
        <a-select v-model:value="filterType" placeholder="类型筛选" style="width: 140px">
          <a-select-option value="all">全部类型</a-select-option>
          <a-select-option value="builtin">内置角色</a-select-option>
          <a-select-option value="custom">自定义角色</a-select-option>
        </a-select>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <div class="rbac-title-cell">
            <strong>{{ record.name }}</strong>
            <small>{{ record.code }}</small>
          </div>
        </template>
        <template v-else-if="column.key === 'builtin'">
          <a-tag v-if="record.isSuperAdmin" color="red" :bordered="false">超级管理员</a-tag>
          <a-tag v-else-if="record.isBuiltin" color="blue" :bordered="false">内置角色</a-tag>
          <a-tag v-else :bordered="false">自定义</a-tag>
        </template>
        <template v-else-if="column.key === 'menus'">
          <span>{{ record.menuIds?.length || 0 }} 个菜单</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 'active' ? 'green' : 'red'" :bordered="false">
            {{ record.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-tooltip title="编辑角色">
              <a-button type="text" size="small" :disabled="!authStore.isSuperAdmin || record.isSuperAdmin" @click="openEdit(record)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-popconfirm
              title="确认删除该角色？"
              ok-text="删除"
              cancel-text="取消"
              :disabled="!canDeleteRole(record)"
              @confirm="removeRole(record)"
            >
            <a-tooltip :title="getDeleteTooltip(record)">
              <a-button type="text" size="small" danger :disabled="!canDeleteRole(record)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-tooltip>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </BlogTable>

    <a-modal
      v-model:open="formVisible"
      :title="editingRole ? '编辑角色' : '新增角色'"
      ok-text="保存"
      cancel-text="取消"
      :width="760"
      :confirm-loading="saving"
      :destroy-on-close="true"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
      @ok="submitRole"
    >
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="rbac-form">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="角色名称" name="name">
              <a-input v-model:value="form.name" placeholder="例如：内容运营" :maxlength="40" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色编码" name="code">
              <a-input
                v-model:value="form.code"
                placeholder="content-operator"
                :maxlength="60"
                :disabled="!!editingRole?.isBuiltin"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-segmented
                v-model:value="form.status"
                :options="[
                  { label: '启用', value: 'active' },
                  { label: '禁用', value: 'disabled' }
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序" name="sortOrder">
              <a-input-number v-model:value="form.sortOrder" :min="0" :max="9999" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="角色说明" name="description">
          <a-textarea v-model:value="form.description" :rows="3" :maxlength="240" show-count />
        </a-form-item>
        <a-form-item label="菜单权限" name="menuIds">
          <div class="permission-picker">
            <div class="permission-picker-toolbar">
              <a-input-search v-model:value="permissionKeyword" placeholder="搜索菜单名称或编码" allow-clear />
              <a-space size="small">
                <a-button size="small" @click="expandAllPermissionMenus">展开</a-button>
                <a-button size="small" @click="collapseAllPermissionMenus">收起</a-button>
              </a-space>
            </div>
            <div class="permission-picker-summary">
              已选 {{ form.menuIds.length }} 项，系统菜单用于控制内置入口是否展示
            </div>
            <div class="permission-panel">
              <a-tree
                v-model:checkedKeys="form.menuIds"
                v-model:expandedKeys="permissionExpandedKeys"
                checkable
                block-node
                :auto-expand-parent="permissionAutoExpandParent"
                :tree-data="filteredPermissionTree"
                :field-names="{ title: 'name', key: 'id', children: 'children' }"
                @expand="handlePermissionExpand"
              >
                <template #title="node">
                  <div class="permission-tree-node">
                    <span class="permission-tree-title">{{ node.name }}</span>
                    <a-tag v-if="node.type === 'system'" color="blue" :bordered="false">系统</a-tag>
                    <small v-if="node.routePath">{{ node.routePath }}</small>
                  </div>
                </template>
              </a-tree>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="permissionVisible"
      title="批量调整菜单权限"
      ok-text="保存授权"
      cancel-text="取消"
      :confirm-loading="savingPermission"
      :width="720"
      :destroy-on-close="true"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
      @ok="submitBatchPermission"
    >
      <a-alert
        type="info"
        show-icon
        :message="`将为 ${selectedRoleIds.length} 个角色覆盖菜单权限`"
        description="该操作会用当前勾选结果替换选中角色原有菜单权限。"
        class="permission-alert"
      />
      <div class="permission-picker">
        <div class="permission-picker-toolbar">
          <a-input-search v-model:value="permissionKeyword" placeholder="搜索菜单名称或编码" allow-clear />
          <a-space size="small">
            <a-button size="small" @click="expandAllPermissionMenus">展开</a-button>
            <a-button size="small" @click="collapseAllPermissionMenus">收起</a-button>
          </a-space>
        </div>
        <div class="permission-picker-summary">
          已选 {{ permissionForm.menuIds.length }} 项，将覆盖选中角色原有权限
        </div>
        <div class="permission-panel permission-panel--modal">
        <a-tree
          v-model:checkedKeys="permissionForm.menuIds"
          v-model:expandedKeys="permissionExpandedKeys"
          checkable
          block-node
          :auto-expand-parent="permissionAutoExpandParent"
          :tree-data="filteredPermissionTree"
          :field-names="{ title: 'name', key: 'id', children: 'children' }"
          @expand="handlePermissionExpand"
        >
          <template #title="node">
            <div class="permission-tree-node">
              <span class="permission-tree-title">{{ node.name }}</span>
              <a-tag v-if="node.type === 'system'" color="blue" :bordered="false">系统</a-tag>
              <small v-if="node.routePath">{{ node.routePath }}</small>
            </div>
          </template>
        </a-tree>
        </div>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SafetyOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import { useAuthStore } from '@/stores/auth'
import {
  batchDeleteRbacRoles,
  batchUpdateRbacRoleMenus,
  createRbacRole,
  deleteRbacRole,
  listRbacRolePermissionMenus,
  listRbacRoles,
  updateRbacRole
} from '@/services/admin'

const authStore = useAuthStore()
const permissionTree = ref([])
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const permissionVisible = ref(false)
const savingPermission = ref(false)
const editingRole = ref(null)
const formRef = ref(null)
const tableRef = ref(null)
const selectedRoleIds = ref([])
const searchKeyword = ref('')
const debouncedKeyword = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const permissionKeyword = ref('')
const permissionExpandedKeys = ref([])
const permissionAutoExpandParent = ref(true)

const form = reactive({
  name: '',
  code: '',
  description: '',
  menuIds: [],
  status: 'active',
  sortOrder: 0
})
const permissionForm = reactive({ menuIds: [] })
const filterParams = computed(() => ({
  keyword: debouncedKeyword.value,
  status: filterStatus.value,
  type: filterType.value
}))

const rules = {
  name: [
    { required: true, message: '请输入角色名称' },
    { min: 2, max: 40, message: '角色名称需为 2-40 个字符' }
  ],
  code: [
    { required: true, message: '请输入角色编码' },
    { pattern: /^[a-z][a-z0-9-]{1,59}$/, message: '仅支持小写字母、数字和连字符' }
  ],
  status: [{ required: true, message: '请选择角色状态' }]
}

const columns = [
  { title: '角色', key: 'name', width: 240 },
  { title: '类型', key: 'builtin', width: 140, align: 'center' },
  { title: '菜单权限', key: 'menus', width: 120, align: 'center' },
  { title: '使用人数', dataIndex: 'userCount', key: 'userCount', width: 110, align: 'center' },
  { title: '状态', key: 'status', width: 100, align: 'center' },
  { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' }
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRoleIds.value,
  getCheckboxProps: (record) => ({
    disabled: record.isBuiltin
  }),
  onChange: (keys) => {
    selectedRoleIds.value = keys
  }
}))
const permissionFlatMenus = computed(() => flattenMenus(permissionTree.value))
const filteredPermissionTree = computed(() => {
  const keyword = permissionKeyword.value.trim().toLowerCase()
  if (!keyword) return permissionTree.value

  const matchNode = (node) => {
    const haystack = `${node.name || ''} ${node.code || ''} ${node.routePath || ''}`.toLowerCase()
    const children = (node.children || []).map(matchNode).filter(Boolean)
    if (haystack.includes(keyword) || children.length) {
      return {
        ...node,
        children
      }
    }
    return null
  }

  return permissionTree.value.map(matchNode).filter(Boolean)
})

function flattenMenus(items = []) {
  return items.flatMap((item) => [
    item,
    ...flattenMenus(item.children || [])
  ])
}

function expandAllPermissionMenus() {
  permissionExpandedKeys.value = permissionFlatMenus.value.map((item) => item.id)
  permissionAutoExpandParent.value = true
}

function collapseAllPermissionMenus() {
  permissionExpandedKeys.value = []
  permissionAutoExpandParent.value = false
}

function handlePermissionExpand(keys) {
  permissionExpandedKeys.value = keys
  permissionAutoExpandParent.value = false
}

function clearSelection() {
  selectedRoleIds.value = []
  tableRef.value?.clearSelection?.()
}

function resetForm(record = null) {
  editingRole.value = record
  form.name = record?.name || ''
  form.code = record?.code || ''
  form.description = record?.description || ''
  form.menuIds = [...(record?.menuIds || [])]
  form.status = record?.status || 'active'
  form.sortOrder = record?.sortOrder || 0
}

function openCreate() {
  if (!authStore.isSuperAdmin) {
    message.warning('仅超级管理员可新增角色')
    return
  }
  resetForm()
  formVisible.value = true
}

function openEdit(record) {
  if (!authStore.isSuperAdmin) {
    message.warning('仅超级管理员可编辑角色')
    return
  }
  resetForm(record)
  formVisible.value = true
}

async function loadRoleTable(params = {}) {
  if (!permissionTree.value.length) {
    await loadPermissionTree()
  }
  return listRbacRoles(params)
}

async function loadPermissionTree() {
  loading.value = true
  try {
    const menuResult = await listRbacRolePermissionMenus()
    permissionTree.value = menuResult.tree || []
    if (!permissionExpandedKeys.value.length) {
      expandAllPermissionMenus()
    }
  } catch (error) {
    message.error(getRoleErrorMessage(error, '菜单权限加载失败'))
  } finally {
    loading.value = false
  }
}

async function refreshRoles() {
  await loadPermissionTree()
  await tableRef.value?.refresh?.()
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

async function submitRole() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toLowerCase(),
      description: form.description.trim(),
      menuIds: form.menuIds,
      status: form.status,
      sortOrder: form.sortOrder
    }

    if (editingRole.value) {
      if (editingRole.value.isBuiltin) {
        delete payload.code
      }
      await updateRbacRole(editingRole.value.id, payload)
      message.success('角色已更新')
    } else {
      await createRbacRole(payload)
      message.success('角色已创建')
    }

    formVisible.value = false
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(getRoleErrorMessage(error, '保存失败'))
  } finally {
    saving.value = false
  }
}

async function removeRole(record) {
  if (!authStore.isSuperAdmin) {
    message.warning('仅超级管理员可删除角色')
    return
  }
  try {
    await deleteRbacRole(record.id)
    message.success('角色已删除')
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(getRoleErrorMessage(error, '删除失败'))
  }
}

function openBatchPermission() {
  if (!authStore.isSuperAdmin) {
    message.warning('仅超级管理员可调整菜单权限')
    return
  }
  if (!selectedRoleIds.value.length) {
    message.warning('请先选择自定义角色')
    return
  }
  permissionForm.menuIds = []
  permissionVisible.value = true
}

async function submitBatchPermission() {
  savingPermission.value = true
  try {
    await batchUpdateRbacRoleMenus(selectedRoleIds.value, permissionForm.menuIds)
    message.success('角色菜单权限已批量更新')
    permissionVisible.value = false
    clearSelection()
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(getRoleErrorMessage(error, '批量授权失败'))
  } finally {
    savingPermission.value = false
  }
}

async function removeSelectedRoles() {
  if (!authStore.isSuperAdmin) {
    message.warning('仅超级管理员可批量删除角色')
    return
  }
  if (!selectedRoleIds.value.length) {
    message.warning('请先选择自定义角色')
    return
  }
  try {
    await batchDeleteRbacRoles(selectedRoleIds.value)
    message.success('角色已批量删除')
    clearSelection()
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(getRoleErrorMessage(error, '批量删除失败'))
  }
}

function canDeleteRole(record) {
  return authStore.isSuperAdmin && !record.isBuiltin && Number(record.userCount || 0) === 0
}

function getDeleteTooltip(record) {
  if (!authStore.isSuperAdmin) return '仅超级管理员可删除角色'
  if (record.isBuiltin) return '内置角色不可删除'
  if (Number(record.userCount || 0) > 0) return '已有用户使用，不能删除'
  return '删除角色'
}

function getRoleErrorMessage(error, fallback) {
  const messages = {
    MENU_PERMISSION_REQUIRED: '缺少角色管理所需权限，无法加载授权菜单',
    SUPER_ADMIN_REQUIRED: '仅超级管理员可执行该操作',
    ROLE_CODE_EXISTS: '角色编码已存在，请更换后重试',
    ROLE_IN_USE: '该角色已被用户使用，请先在用户管理中移除角色',
    SUPER_ROLE_PROTECTED: '超级管理员角色受保护，不允许修改',
    BUILTIN_ROLE_PROTECTED: '内置角色不允许删除',
    BUILTIN_ROLE_CODE_PROTECTED: '内置角色编码不允许修改',
    MENU_NOT_FOUND: '包含不存在的菜单权限，请刷新后重试',
    TARGET_ROLE_DISABLED: '目标角色已禁用，无法继续操作'
  }

  return messages[error?.code] || error?.message || fallback
}

onMounted(loadPermissionTree)
</script>

<style scoped>
.rbac-page {
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
}

.role-table {
  min-height: 0;
}

.rbac-title-cell {
  display: grid;
  gap: 3px;
}

.rbac-title-cell small {
  color: var(--console-text-secondary);
}

.permission-panel {
  max-height: 340px;
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  scrollbar-width: thin;
}

.permission-panel--modal {
  max-height: 430px;
}

.permission-alert {
  margin-bottom: 14px;
}

.permission-picker {
  display: grid;
  gap: 10px;
}

.permission-picker-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.permission-picker-summary {
  padding: 7px 10px;
  border-radius: 6px;
  background: var(--console-surface-muted);
  color: var(--console-text-secondary);
  font-size: 12px;
}

.permission-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  width: 100%;
}

.permission-tree-title {
  font-weight: 600;
  color: var(--console-text-primary);
}

.permission-tree-node small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--console-text-secondary);
}

.permission-panel :deep(.ant-tree-node-content-wrapper) {
  min-width: 0;
  border-radius: 6px;
}

.permission-panel :deep(.ant-tree-node-content-wrapper:hover) {
  background: color-mix(in srgb, var(--console-primary, #1677ff) 6%, transparent);
}

.permission-panel :deep(.ant-tree-checkbox) {
  margin-block-start: 5px;
}

@media (max-width: 900px) {
  .rbac-page {
    height: auto;
  }
}
</style>
