<template>
  <section class="taxonomy-page">
    <!-- 精简头部 -->
    <div class="taxonomy-page-head">
      <h2>分类管理</h2>
      <a-button type="primary" @click="openModal()">
        <template #icon><PlusOutlined /></template>
        新增分类
      </a-button>
    </div>

    <!-- 表格区 -->
    <BlogTable
      ref="tableRef"
      :api-fn="loadCategories"
      :columns="columns"
      :auto-load="true"
      :page-size="15"
      :page-sizes="['10', '15', '20', '50']"
      :show-column-setting="true"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <span class="taxonomy-name">{{ record.name }}</span>
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
            <a-popconfirm title="确定删除此分类？" @confirm="handleDelete(record.id)">
              <a-button type="link" size="small" danger class="action-delete">删除</a-button>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </BlogTable>

    <!-- 弹窗新增/编辑 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingId ? '编辑分类' : '新增分类'"
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
        <a-form-item label="分类名称" name="name" :rules="[{ required: true, message: '请输入分类名称' }]">
          <a-input v-model:value.trim="form.name" placeholder="例如 Node.js" />
        </a-form-item>
        <a-form-item label="Slug" name="slug" :rules="[{ required: true, message: '请输入 slug' }]">
          <a-input v-model:value.trim="form.slug" placeholder="例如 node-js" />
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
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { createAdminCategory, deleteAdminCategory, listAdminCategories, updateAdminCategory } from '@/services/admin'

const tableRef = ref(null)
const modalVisible = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const form = reactive({
  name: '',
  slug: '',
  sortOrder: 0,
  status: 'active'
})

const columns = [
  { title: '分类名称', dataIndex: 'name', key: 'name', ellipsis: true },
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
async function loadCategories(params) {
  return await listAdminCategories(params)
}

function openModal(record) {
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
}

function closeModal() {
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
    if (editingId.value) {
      await updateAdminCategory(editingId.value, {
        name: form.name,
        slug: form.slug,
        sortOrder: form.sortOrder,
        status: form.status
      })
      message.success('分类已更新')
    } else {
      await createAdminCategory({
        name: form.name,
        slug: form.slug,
        sortOrder: form.sortOrder,
        status: form.status
      })
      message.success('分类已创建')
    }
    closeModal()
    tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleToggleStatus(record) {
  const newStatus = record.status === 'active' ? 'hidden' : 'active'
  try {
    await updateAdminCategory(record.id, { status: newStatus })
    message.success(newStatus === 'active' ? '已启用' : '已禁用')
    tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '操作失败')
  }
}

async function handleDelete(id) {
  try {
    await deleteAdminCategory(id)
    message.success('分类已删除')
    tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
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
.taxonomy-name {
  font-weight: 500;
  color: var(--console-text);
  font-size: 13px;
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
</style>
