<template>
  <section class="rbac-page enterprise-page">
    <header class="enterprise-page-header">
      <div>
        <h1>角色管理</h1>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="tableRef?.refresh?.()">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新增角色
        </a-button>
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
          <a-button size="small" @click="openBatchPermission">
            <template #icon><SafetyOutlined /></template>
            批量调整菜单权限
          </a-button>
          <a-popconfirm title="确认批量删除选中角色？" ok-text="删除" cancel-text="取消" @confirm="removeSelectedRoles">
            <a-button size="small" danger>
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
              <a-button type="text" size="small" :disabled="record.isSuperAdmin" @click="openEdit(record)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-popconfirm
              title="确认删除该角色？"
              ok-text="删除"
              cancel-text="取消"
              :disabled="record.isBuiltin"
              @confirm="removeRole(record)"
            >
              <a-tooltip title="删除角色">
                <a-button type="text" size="small" danger :disabled="record.isBuiltin">
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
          <div class="permission-panel">
            <a-tree
              v-model:checkedKeys="form.menuIds"
              checkable
              default-expand-all
              :tree-data="permissionTree"
              :field-names="{ title: 'name', key: 'id', children: 'children' }"
            />
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
      <div class="permission-panel permission-panel--modal">
        <a-tree
          v-model:checkedKeys="permissionForm.menuIds"
          checkable
          default-expand-all
          :tree-data="permissionTree"
          :field-names="{ title: 'name', key: 'id', children: 'children' }"
        />
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
import {
  batchDeleteRbacRoles,
  batchUpdateRbacRoleMenus,
  createRbacRole,
  deleteRbacRole,
  listRbacMenus,
  listRbacRoles,
  updateRbacRole
} from '@/services/admin'

const roles = ref([])
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
  name: [{ required: true, message: '请输入角色名称' }],
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
  resetForm()
  formVisible.value = true
}

function openEdit(record) {
  resetForm(record)
  formVisible.value = true
}

function filterRoles(items = []) {
  const keyword = debouncedKeyword.value.trim().toLowerCase()
  return items.filter((role) => {
    const matchedKeyword = !keyword ||
      role.name?.toLowerCase().includes(keyword) ||
      role.code?.toLowerCase().includes(keyword) ||
      role.description?.toLowerCase().includes(keyword)
    const matchedStatus = filterStatus.value === 'all' || role.status === filterStatus.value
    const matchedType = filterType.value === 'all' ||
      (filterType.value === 'builtin' ? role.isBuiltin : !role.isBuiltin)

    return matchedKeyword && matchedStatus && matchedType
  })
}

async function loadRoleTable(params = {}) {
  if (!roles.value.length || !permissionTree.value.length) {
    await loadRoles()
  }
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const filtered = filterRoles(roles.value)
  const start = (page - 1) * pageSize
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length
  }
}

async function loadRoles() {
  loading.value = true
  try {
    const [roleItems, menuResult] = await Promise.all([listRbacRoles(), listRbacMenus()])
    roles.value = roleItems || []
    permissionTree.value = menuResult.tree || []
  } catch (error) {
    message.error(error.message || '角色列表加载失败')
  } finally {
    loading.value = false
  }
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
      name: form.name,
      code: form.code,
      description: form.description,
      menuIds: form.menuIds,
      status: form.status,
      sortOrder: form.sortOrder
    }

    if (editingRole.value) {
      await updateRbacRole(editingRole.value.id, payload)
      message.success('角色已更新')
    } else {
      await createRbacRole(payload)
      message.success('角色已创建')
    }

    formVisible.value = false
    await loadRoles()
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function removeRole(record) {
  try {
    await deleteRbacRole(record.id)
    message.success('角色已删除')
    await loadRoles()
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
}

function openBatchPermission() {
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
    await loadRoles()
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(error.message || '批量授权失败')
  } finally {
    savingPermission.value = false
  }
}

async function removeSelectedRoles() {
  if (!selectedRoleIds.value.length) {
    message.warning('请先选择自定义角色')
    return
  }
  try {
    await batchDeleteRbacRoles(selectedRoleIds.value)
    message.success('角色已批量删除')
    clearSelection()
    await loadRoles()
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(error.message || '批量删除失败')
  }
}

onMounted(loadRoles)
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
  max-height: 300px;
  overflow: auto;
  padding: 10px 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface-muted);
  scrollbar-width: thin;
}

.permission-panel--modal {
  max-height: 360px;
}

.permission-alert {
  margin-bottom: 14px;
}

@media (max-width: 900px) {
  .rbac-page {
    height: auto;
  }
}
</style>
