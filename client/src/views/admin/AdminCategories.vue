<template>
  <section class="taxonomy-page">
    <!-- 精简顶栏：标题 + 统计 + 操作，一行搞定不抢戏 -->
    <div class="taxonomy-topbar">
      <h2 class="taxonomy-title">分类体系</h2>
      <div class="taxonomy-stats-inline">
        <span class="stat-chip">共 <strong>{{ totalCount }}</strong> 个</span>
        <span class="stat-chip stat-chip--active">启用 <strong>{{ activeCount }}</strong></span>
        <span class="stat-chip stat-chip--system">系统 <strong>{{ systemCount }}</strong></span>
      </div>
      <a-button type="primary" class="taxonomy-add-btn" @click="openModal()">
        <template #icon><PlusOutlined /></template>
        新增分类
      </a-button>
    </div>

    <!-- 表格区：绝对主角 -->
    <div class="taxonomy-table-card">
      <div class="taxonomy-table-header">
        <div class="taxonomy-table-actions">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索分类名称"
            class="taxonomy-search"
            @search="handleSearch"
          />
        </div>
      </div>

      <BlogTable
        ref="tableRef"
        :api-fn="loadCategories"
        :columns="columns"
        :auto-load="true"
        :page-size="15"
        :page-sizes="['10', '15', '20', '50']"
        :show-column-setting="true"
        :params="tableParams"
        class="taxonomy-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="taxonomy-name-cell">
              <span class="taxonomy-name">{{ record.name }}</span>
              <span v-if="record.slug" class="taxonomy-slug">/{{ record.slug }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'sortOrder'">
            <span class="taxonomy-sort">{{ record.sortOrder }}</span>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            <span class="taxonomy-time">{{ formatDate(record.createdAt) }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <div class="taxonomy-status">
              <span
                class="status-dot"
                :class="record.status === 'active' ? 'status-dot--active' : 'status-dot--inactive'"
              />
              <span class="status-text">{{ record.status === 'active' ? '启用' : '禁用' }}</span>
              <a-tag v-if="record.isSystem" class="system-tag">系统</a-tag>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="taxonomy-actions">
              <a-tooltip title="编辑">
                <a-button
                  type="text"
                  class="action-btn action-edit"
                  :disabled="record.isSystem"
                  @click="openModal(record)"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip :title="record.status === 'active' ? '禁用' : '启用'">
                <a-button
                  type="text"
                  class="action-btn"
                  :class="record.status === 'active' ? 'action-disable' : 'action-enable'"
                  :disabled="record.isSystem"
                  @click="handleToggleStatus(record)"
                >
                  <template #icon>
                    <StopOutlined v-if="record.status === 'active'" />
                    <PlayCircleOutlined v-else />
                  </template>
                </a-button>
              </a-tooltip>
              <a-divider type="vertical" class="action-divider" />
              <a-tooltip title="删除">
                <a-button
                  type="text"
                  class="action-btn action-delete"
                  :disabled="record.isSystem"
                  @click="handleDelete(record)"
                >
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-tooltip>
            </div>
          </template>
        </template>
      </BlogTable>
    </div>

    <!-- 弹窗新增/编辑 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingId ? '编辑分类' : '新增分类'"
      :confirm-loading="submitting"
      :width="520"
      :destroy-on-close="true"
      ok-text="确认"
      cancel-text="取消"
      class="taxonomy-modal"
      @ok="handleModalSubmit"
      @cancel="closeModal"
    >
      <a-form
        ref="formRef"
        layout="vertical"
        :model="form"
        class="taxonomy-form"
      >
        <a-form-item label="分类名称" name="name" :rules="[{ required: true, message: '请输入分类名称' }]">
          <a-input v-model:value.trim="form.name" placeholder="例如 Node.js" class="taxonomy-input" />
        </a-form-item>
        <a-form-item label="Slug" name="slug">
          <a-input v-model:value.trim="form.slug" placeholder="留空自动生成，例如 node-js" class="taxonomy-input">
            <template #prefix>/</template>
          </a-input>
        </a-form-item>
        <a-form-item label="排序" name="sortOrder">
          <a-input-number v-model:value="form.sortOrder" :min="0" :max="9999" class="taxonomy-input-number" placeholder="数值越小越靠前" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="form.status" class="taxonomy-radio-group">
            <a-radio value="active">
              <span class="radio-label">
                <span class="status-dot status-dot--active" />
                启用
              </span>
            </a-radio>
            <a-radio value="hidden">
              <span class="radio-label">
                <span class="status-dot status-dot--inactive" />
                禁用
              </span>
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { createAdminCategory, deleteAdminCategory, listAdminCategories, updateAdminCategory } from '@/services/admin'
import { useAdminActions, useUnsavedChanges } from '@/composables/useAdminUi'

const tableRef = ref(null)
const modalVisible = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const rowActionKey = ref('')
const searchKeyword = ref('')
const categoriesData = ref([])

const { runAction, confirmAction } = useAdminActions()

const form = reactive({
  name: '',
  slug: '',
  sortOrder: 0,
  status: 'active'
})

const { isDirty, markClean, pauseTracking } = useUnsavedChanges({
  getSnapshot: () => ({ ...form }),
  enabled: () => modalVisible.value && !submitting.value,
  title: '关闭分类编辑？',
  content: '当前分类表单还有未保存修改，关闭后将丢失本次输入。',
  okText: '仍然关闭'
})

const columns = [
  { title: '分类名称', dataIndex: 'name', key: 'name', ellipsis: true, width: 280 },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80, align: 'center' },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '状态', key: 'status', width: 140, align: 'center' },
  { title: '操作', key: 'action', width: 160, align: 'center' }
]

const tableParams = computed(() => ({
  keyword: searchKeyword.value
}))

// 统计数据
const totalCount = computed(() => categoriesData.value.length)
const activeCount = computed(() => categoriesData.value.filter(c => c.status === 'active').length)
const systemCount = computed(() => categoriesData.value.filter(c => c.isSystem).length)

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 作为 apiFn 传给 BlogTable（返回数组，前端分页）
async function loadCategories(params) {
  const res = await listAdminCategories(params)
  categoriesData.value = res.items || []
  return res
}

function handleSearch() {
  tableRef.value?.reload()
}

function openModal(record) {
  if (record?.isSystem) {
    return
  }
  if (record) {
    editingId.value = record.id
    form.name = record.name
    form.slug = record.slug
    form.sortOrder = record.sortOrder ?? 0
    form.status = record.status || 'active'
  } else {
    editingId.value = null
    form.name = ''
    form.slug = ''
    form.sortOrder = 0
    form.status = 'active'
  }
  modalVisible.value = true
  markClean()
}

function closeModal() {
  if (isDirty.value) {
    confirmAction({
      title: '关闭分类编辑？',
      content: '当前分类表单还有未保存修改，关闭后将丢失本次输入。',
      okText: '仍然关闭',
      async onOk() {
        pauseTracking()
        modalVisible.value = false
        editingId.value = null
      }
    }).catch(() => {})
    return
  }

  pauseTracking()
  modalVisible.value = false
  editingId.value = null
}

async function handleModalSubmit() {
  try {
    await formRef.value?.validateFields()
  } catch {
    return
  }

  submitting.value = true
  try {
    const payload = {
      name: form.name,
      sortOrder: form.sortOrder,
      status: form.status
    }

    if (String(form.slug || '').trim()) {
      payload.slug = form.slug
    }

    await runAction(() => (
      editingId.value
        ? updateAdminCategory(editingId.value, payload)
        : createAdminCategory(payload)
    ), {
      successMessage: editingId.value ? '分类已更新' : '分类已创建',
      errorMessage: '操作失败'
    })
    markClean()
    pauseTracking()
    modalVisible.value = false
    editingId.value = null
    tableRef.value?.refresh()
  } finally {
    submitting.value = false
  }
}

async function handleToggleStatus(record) {
  if (record.isSystem) {
    return
  }
  const newStatus = record.status === 'active' ? 'hidden' : 'active'
  rowActionKey.value = `status:${record.id}`
  try {
    await runAction(() => updateAdminCategory(record.id, { status: newStatus }), {
      successMessage: newStatus === 'active' ? '已启用' : '已禁用',
      errorMessage: '操作失败',
      onSuccess: () => tableRef.value?.refresh()
    })
  } finally {
    rowActionKey.value = ''
  }
}

function handleDelete(record) {
  if (record.isSystem) {
    return
  }
  confirmAction({
    title: '确定删除此分类？',
    content: `分类「${record.name}」删除后，相关文章将失去该分类关联。`,
    okText: '确认删除',
    okType: 'danger',
    async onOk() {
      rowActionKey.value = `delete:${record.id}`
      try {
        await runAction(() => deleteAdminCategory(record.id), {
          successMessage: '分类已删除',
          errorMessage: '删除失败',
          onSuccess: () => tableRef.value?.refresh()
        })
      } finally {
        rowActionKey.value = ''
      }
    }
  }).catch(() => {})
}
</script>

<style scoped>
/* ===== 页面容器：表格是绝对主角 ===== */
.taxonomy-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  overflow: hidden;
}

/* ===== 精简顶栏：一行搞定，不抢戏 ===== */
.taxonomy-topbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 4px 0;
  flex-shrink: 0;
}

.taxonomy-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--console-text);
  white-space: nowrap;
  line-height: 32px;
}

/* 内联统计：弱化为小 chip，不抢表格风头 */
.taxonomy-stats-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  font-size: 12px;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  border-radius: 12px;
  white-space: nowrap;
  line-height: 20px;
}

.stat-chip strong {
  color: var(--console-text);
  font-weight: 600;
}

.stat-chip--active strong {
  color: #52c41a;
}

.stat-chip--system strong {
  color: #faad14;
}

.taxonomy-add-btn {
  flex-shrink: 0;
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
}

/* ── 表格卡片 ── */
.taxonomy-table-card {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.04);
  overflow: hidden;
  min-height: 0;
}

.taxonomy-table-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 16px;
  border-bottom: 1px solid var(--console-border);
  background: var(--console-surface-muted);
}

.taxonomy-table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.taxonomy-search {
  width: 240px;
}

.taxonomy-search :deep(.ant-input) {
  border-radius: 8px;
}

.taxonomy-table {
  flex: 1 1 0;
  min-height: 0;
}

.taxonomy-table :deep(.blog-table) {
  border: none;
  border-radius: 0;
}

.taxonomy-table :deep(.blog-table__toolbar) {
  display: none;
}

.taxonomy-table :deep(.blog-table__body) {
  padding: 0;
}

.taxonomy-table :deep(.ant-table) {
  font-size: 13px;
}

.taxonomy-table :deep(.ant-table-thead > tr > th) {
  height: 48px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--console-text-secondary);
  background: var(--console-surface);
  border-bottom: 1px solid var(--console-border);
}

.taxonomy-table :deep(.ant-table-tbody > tr > td) {
  padding: 14px 16px;
  border-bottom: 1px solid var(--console-border);
  transition: all 0.2s ease;
}

.taxonomy-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--console-surface-hover);
}

.taxonomy-table :deep(.ant-table-tbody > tr:last-child > td) {
  border-bottom: none;
}

.taxonomy-table :deep(.blog-table__pagination) {
  padding: 12px 20px;
  border-top: 1px solid var(--console-border);
  background: var(--console-surface-muted);
}

/* ── 单元格内容 ── */
.taxonomy-name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.taxonomy-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--console-text);
}

.taxonomy-slug {
  font-size: 12px;
  color: var(--console-text-secondary);
  font-family: 'SF Mono', Monaco, monospace;
}

.taxonomy-sort {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  border: 1px solid var(--console-border);
}

.taxonomy-time {
  font-size: 13px;
  color: var(--console-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* ── 状态指示器 ── */
.taxonomy-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot--active {
  background: #52c41a;
  box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.15);
}

.status-dot--inactive {
  background: var(--console-text-secondary);
  opacity: 0.5;
}

.status-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--console-text);
}

.system-tag {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 0 8px;
  height: 20px;
  line-height: 18px;
  border-radius: 4px;
  border: 1px solid #ffd666;
  background: #fffbe6;
  color: #d48806;
}

/* ── 操作按钮 ── */
.taxonomy-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: var(--console-surface-hover);
  transform: scale(1.05);
}

.action-edit {
  color: var(--console-primary-strong);
}

.action-edit:hover:not(:disabled) {
  background: var(--console-primary-soft);
}

.action-enable {
  color: #52c41a;
}

.action-enable:hover:not(:disabled) {
  background: rgba(82, 196, 26, 0.1);
}

.action-disable {
  color: #faad14;
}

.action-disable:hover:not(:disabled) {
  background: rgba(250, 173, 20, 0.1);
}

.action-delete {
  color: #ff4d4f;
}

.action-delete:hover:not(:disabled) {
  background: rgba(255, 77, 79, 0.1);
}

.action-divider {
  margin: 0 4px;
  height: 16px;
  background: var(--console-border);
}

/* ── 弹窗样式 ── */
.taxonomy-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.taxonomy-modal :deep(.ant-modal-header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--console-border);
  background: var(--console-surface);
}

.taxonomy-modal :deep(.ant-modal-title) {
  font-size: 17px;
  font-weight: 600;
  color: var(--console-text);
}

.taxonomy-modal :deep(.ant-modal-body) {
  padding: 24px;
  background: var(--console-surface);
}

.taxonomy-modal :deep(.ant-modal-footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--console-border);
  background: var(--console-surface-muted);
}

.taxonomy-form :deep(.ant-form-item-label > label) {
  font-weight: 500;
  font-size: 14px;
  color: var(--console-text);
}

.taxonomy-input,
.taxonomy-input-number {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.taxonomy-input:hover,
.taxonomy-input-number:hover {
  border-color: var(--console-primary-strong);
}

.taxonomy-input:focus,
.taxonomy-input-number:focus {
  border-color: var(--console-primary-strong);
  box-shadow: 0 0 0 3px var(--console-primary-soft);
}

.taxonomy-radio-group {
  display: flex;
  gap: 24px;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* ── 响应式适配 ── */
@media (max-width: 768px) {
  .taxonomy-topbar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .taxonomy-stats-inline {
    order: 3;
    flex-basis: 100%;
  }

  .taxonomy-search {
    width: 100%;
  }
}
</style>
