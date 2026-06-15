<template>
  <section class="taxonomy-page">
    <!-- 精简头部 -->
    <div class="taxonomy-page-head">
      <h2>标签管理</h2>
      <a-button type="primary" @click="openModal()">
        <template #icon><PlusOutlined /></template>
        新增标签
      </a-button>
    </div>

    <!-- 表格区 -->
    <BlogTable
      ref="tableRef"
      :api-fn="loadTags"
      :columns="columns"
      :auto-load="true"
      :page-size="15"
      :page-sizes="['10', '15', '20', '50']"
      :show-column-setting="true"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <a-tag :color="record.color || '#1677ff'" class="taxonomy-tag-badge">{{ record.name }}</a-tag>
        </template>
        <template v-else-if="column.key === 'sortOrder'">
          <span class="taxonomy-sort">{{ record.sortOrder }}</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          <span class="taxonomy-time">{{ formatDate(record.createdAt) }}</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 'active' ? 'success' : 'default'">
            {{ record.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="taxonomy-actions">
            <a-button type="link" size="small" class="action-edit" @click="openModal(record)">编辑</a-button>
            <a-button
              type="link"
              size="small"
              :class="record.status === 'active' ? 'action-disable' : 'action-enable'"
              @click="handleToggleStatus(record)"
            >
              {{ record.status === 'active' ? '禁用' : '启用' }}
            </a-button>
            <a-button type="link" size="small" danger class="action-delete" @click="handleDelete(record)">删除</a-button>
          </div>
        </template>
      </template>
    </BlogTable>

    <!-- 弹窗新增/编辑 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingId ? '编辑标签' : '新增标签'"
      :confirm-loading="submitting"
      :width="520"
      :destroy-on-close="true"
      ok-text="确认"
      cancel-text="取消"
      @ok="handleModalSubmit"
      @cancel="closeModal"
    >
      <a-form
        ref="formRef"
        layout="vertical"
        :model="form"
        class="taxonomy-form"
      >
        <a-form-item label="标签名称" name="name" :rules="[{ required: true, message: '请输入标签名称' }]">
          <a-input v-model:value.trim="form.name" placeholder="例如 Express" />
        </a-form-item>
        <a-form-item label="Slug" name="slug">
          <a-input v-model:value.trim="form.slug" placeholder="留空则自动生成" />
        </a-form-item>
        <a-form-item label="标签颜色" name="color">
          <a-input v-model:value.trim="form.color" placeholder="#1677ff">
            <template #addonAfter>
              <span class="color-preview" :style="{ background: form.color || '#1677ff' }"></span>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="排序" name="sortOrder">
          <a-input-number v-model:value="form.sortOrder" :min="0" :max="9999" style="width: 100%" placeholder="数值越小越靠前" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="hidden">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { createAdminTag, deleteAdminTag, listAdminTags, updateAdminTag } from '@/services/admin'
import { useAdminActions, useUnsavedChanges } from '@/composables/useAdminUi'

const tableRef = ref(null)
const modalVisible = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const rowActionKey = ref('')
const { runAction, confirmAction } = useAdminActions()

const form = reactive({
  name: '',
  slug: '',
  color: '#1677ff',
  sortOrder: 0,
  status: 'active'
})
const { isDirty, markClean, pauseTracking } = useUnsavedChanges({
  getSnapshot: () => ({ ...form }),
  enabled: () => modalVisible.value && !submitting.value,
  title: '关闭标签编辑？',
  content: '当前标签表单还有未保存修改，关闭后将丢失本次输入。',
  okText: '仍然关闭'
})

const columns = [
  { title: '标签', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80, align: 'center' },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '状态', key: 'status', width: 80, align: 'center' },
  { title: '操作', key: 'action', width: 180, align: 'center' }
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 作为 apiFn 传给 BlogTable（返回数组，前端分页）
async function loadTags(params) {
  return await listAdminTags(params)
}

function openModal(record) {
  if (record) {
    editingId.value = record.id
    form.name = record.name
    form.slug = record.slug
    form.color = record.color || '#1677ff'
    form.sortOrder = record.sortOrder ?? 0
    form.status = record.status || 'active'
  } else {
    editingId.value = null
    form.name = ''
    form.slug = ''
    form.color = '#1677ff'
    form.sortOrder = 0
    form.status = 'active'
  }
  modalVisible.value = true
  markClean()
}

function closeModal() {
  if (isDirty.value) {
    confirmAction({
      title: '关闭标签编辑？',
      content: '当前标签表单还有未保存修改，关闭后将丢失本次输入。',
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
      color: form.color,
      sortOrder: form.sortOrder,
      status: form.status
    }
    if (form.slug.trim()) {
      payload.slug = form.slug.trim()
    }

    await runAction(() => (
      editingId.value
        ? updateAdminTag(editingId.value, payload)
        : createAdminTag(payload)
    ), {
      successMessage: editingId.value ? '标签已更新' : '标签已创建',
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
  const newStatus = record.status === 'active' ? 'hidden' : 'active'
  rowActionKey.value = `status:${record.id}`
  try {
    await runAction(() => updateAdminTag(record.id, { status: newStatus }), {
      successMessage: newStatus === 'active' ? '已启用' : '已禁用',
      errorMessage: '操作失败',
      onSuccess: () => tableRef.value?.refresh()
    })
  } finally {
    rowActionKey.value = ''
  }
}

function handleDelete(record) {
  confirmAction({
    title: '确定删除此标签？',
    content: `标签「${record.name}」删除后，相关文章将失去该标签关联。`,
    okText: '确认删除',
    okType: 'danger',
    async onOk() {
      rowActionKey.value = `delete:${record.id}`
      try {
        await runAction(() => deleteAdminTag(record.id), {
          successMessage: '标签已删除',
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
/* ── 页面：flex纵向铺满 ── */
.taxonomy-page {
  width: 100%;
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

/* ── 头部栏 ── */
.taxonomy-page-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 8px;
}

.taxonomy-page-head h2 {
  margin: 0;
  font-size: 18px;
  line-height: 24px;
  color: var(--console-text);
  font-weight: 650;
}

/* ── 单元格内容 ── */
.taxonomy-tag-badge {
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  padding: 1px 8px;
}

.taxonomy-sort {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  padding: 0 5px;
}

.taxonomy-time {
  font-size: 13px;
  color: var(--console-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* ── 操作按钮 ── */
.taxonomy-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.taxonomy-actions .ant-btn-link {
  padding: 0 5px;
  height: 24px;
  border-radius: 3px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.taxonomy-actions .action-edit { color: var(--console-primary-strong); }
.taxonomy-actions .action-edit:hover { background: var(--console-primary-soft); }
.taxonomy-actions .action-enable { color: #52c41a; }
.taxonomy-actions .action-enable:hover { background: rgba(82, 196, 26, 0.08); }
.taxonomy-actions .action-disable { color: #faad14; }
.taxonomy-actions .action-disable:hover { background: rgba(250, 173, 20, 0.08); }
.taxonomy-actions .action-delete { color: #ff4d4f; }
.taxonomy-actions .action-delete:hover { background: rgba(255, 77, 79, 0.08); }

/* ── 弹窗表单 ── */
.taxonomy-form {
  padding: 8px 4px 0;
}

.taxonomy-form :deep(.ant-form-item-label > label) {
  font-weight: 500;
}

.color-preview {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  vertical-align: middle;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
