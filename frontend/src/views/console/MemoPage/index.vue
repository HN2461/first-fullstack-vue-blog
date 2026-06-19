<template>
  <section class="memo-page">
    <header class="memo-page-head">
      <div>
        <p class="enterprise-page-kicker">MEMO FLOW</p>
        <h1>备忘录</h1>
        <p>把临时灵感、待落地计划和研究线索先稳稳接住，再按优先级慢慢整理。</p>
      </div>
      <div class="memo-head-side">
        <div class="memo-stats" aria-label="备忘录统计">
          <div>
            <span>{{ stats.open }}</span>
            <small>待推进</small>
          </div>
          <div>
            <span>{{ stats.pinned }}</span>
            <small>已置顶</small>
          </div>
          <div>
            <span>{{ stats.dueSoon }}</span>
            <small>近期待办</small>
          </div>
        </div>
        <a-button type="primary" @click="openCreateModal">
          <template #icon><PlusOutlined /></template>
          新增备忘
        </a-button>
      </div>
    </header>

    <section class="memo-toolbar">
      <a-input-search
        v-model:value="filters.keyword"
        class="memo-search"
        placeholder="搜索标题、内容或标签"
        allow-clear
        @search="refreshMemos"
        @change="handleFilterInput"
      />
      <a-segmented v-model:value="filters.status" :options="statusFilterOptions" @change="refreshMemos" />
      <a-select
        v-model:value="filters.type"
        class="memo-filter-select"
        :options="typeFilterOptions"
        @change="refreshMemos"
      />
      <a-select
        v-model:value="filters.priority"
        class="memo-filter-select"
        :options="priorityFilterOptions"
        @change="refreshMemos"
      />
      <a-tooltip title="刷新">
        <a-button class="memo-icon-button" @click="refreshMemos">
          <template #icon><ReloadOutlined /></template>
        </a-button>
      </a-tooltip>
    </section>

    <a-alert v-if="errorMessage" class="memo-alert" type="error" show-icon :message="errorMessage" />

    <a-spin :spinning="loading">
      <div v-if="memos.length > 0" class="memo-list">
        <article
          v-for="memo in memos"
          :key="memo.id"
          :class="['memo-item', `memo-item--${memo.priority}`, { 'memo-item--done': memo.status === 'completed' }]"
        >
          <div class="memo-item-marker" aria-hidden="true"></div>
          <div class="memo-item-main">
            <div class="memo-item-title-row">
              <a-tag class="memo-type-tag" :color="getTypeMeta(memo.type).color">{{ getTypeMeta(memo.type).label }}</a-tag>
              <h2>{{ memo.title }}</h2>
              <a-tag v-if="memo.status === 'completed'" color="success">已完成</a-tag>
              <a-tag v-else-if="memo.status === 'archived'">已归档</a-tag>
            </div>
            <p>{{ memo.content }}</p>
            <div class="memo-item-meta">
              <span>{{ formatTime(memo.updatedAt) }}</span>
              <span v-if="memo.dueAt">计划：{{ formatDate(memo.dueAt) }}</span>
              <a-tag v-for="tag in memo.tags" :key="tag" class="memo-mini-tag">{{ tag }}</a-tag>
            </div>
          </div>
          <div class="memo-item-actions">
            <a-tooltip :title="memo.isPinned ? '取消置顶' : '置顶'">
              <a-button class="memo-icon-button" :class="{ active: memo.isPinned }" @click="togglePinned(memo)">
                <template #icon><PushpinOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip :title="memo.status === 'completed' ? '重新打开' : '标记完成'">
              <a-button class="memo-icon-button" @click="toggleCompleted(memo)">
                <template #icon><CheckOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="归档">
              <a-button class="memo-icon-button" :disabled="memo.status === 'archived'" @click="archiveMemo(memo)">
                <template #icon><InboxOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="编辑">
              <a-button class="memo-icon-button" @click="openEditModal(memo)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-button class="memo-icon-button memo-icon-button--danger" @click="confirmDelete(memo)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-tooltip>
          </div>
        </article>
      </div>

      <a-empty v-else class="memo-empty" description="暂无备忘">
        <a-button type="primary" @click="openCreateModal">立即记录</a-button>
      </a-empty>
    </a-spin>

    <div v-if="pagination.total > pagination.pageSize" class="memo-pagination">
      <a-pagination
        v-model:current="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        show-less-items
        @change="refreshMemos"
      />
    </div>

    <a-modal
      v-model:open="createVisible"
      title="新增备忘"
      :width="640"
      :confirm-loading="submitting"
      :destroy-on-close="true"
      ok-text="保存"
      cancel-text="取消"
      @ok="submitCreateMemo"
      @cancel="closeCreateModal"
    >
      <div class="memo-modal-body">
        <a-form layout="vertical">
          <a-form-item label="标题">
            <a-input v-model:value.trim="createForm.title" :maxlength="80" placeholder="可选标题" />
          </a-form-item>
          <a-form-item label="内容" required>
            <a-textarea
              v-model:value="createForm.content"
              :auto-size="{ minRows: 5, maxRows: 10 }"
              :maxlength="5000"
              show-count
              placeholder="记录一个灵感、问题、计划或稍后要处理的线索"
              @keydown.ctrl.enter.prevent="submitCreateMemo"
              @keydown.meta.enter.prevent="submitCreateMemo"
            />
          </a-form-item>
          <div class="memo-modal-grid">
            <a-form-item label="类型">
              <a-select v-model:value="createForm.type" :options="typeOptions" />
            </a-form-item>
            <a-form-item label="优先级">
              <a-select v-model:value="createForm.priority" :options="priorityOptions" />
            </a-form-item>
            <a-form-item label="计划日期">
              <a-input v-model:value.trim="createForm.dueAt" type="date" />
            </a-form-item>
            <a-form-item label="标签">
              <a-input v-model:value="createForm.tagsText" placeholder="标签，用逗号分隔" :maxlength="120" />
            </a-form-item>
          </div>
          <a-checkbox v-model:checked="createForm.isPinned">置顶这条备忘</a-checkbox>
        </a-form>
      </div>
    </a-modal>

    <a-modal
      v-model:open="editVisible"
      title="编辑备忘"
      :width="640"
      :confirm-loading="submitting"
      :destroy-on-close="true"
      ok-text="保存"
      cancel-text="取消"
      @ok="submitEditMemo"
      @cancel="closeEditModal"
    >
      <div class="memo-modal-body">
        <a-form layout="vertical">
          <a-form-item label="标题">
            <a-input v-model:value.trim="editForm.title" :maxlength="80" placeholder="可选标题" />
          </a-form-item>
          <a-form-item label="内容" required>
            <a-textarea v-model:value="editForm.content" :auto-size="{ minRows: 5, maxRows: 10 }" :maxlength="5000" show-count />
          </a-form-item>
          <div class="memo-modal-grid">
            <a-form-item label="类型">
              <a-select v-model:value="editForm.type" :options="typeOptions" />
            </a-form-item>
            <a-form-item label="优先级">
              <a-select v-model:value="editForm.priority" :options="priorityOptions" />
            </a-form-item>
            <a-form-item label="状态">
              <a-select v-model:value="editForm.status" :options="statusOptions" />
            </a-form-item>
            <a-form-item label="计划日期">
              <a-input v-model:value.trim="editForm.dueAt" type="date" />
            </a-form-item>
          </div>
          <a-form-item label="标签">
            <a-input v-model:value="editForm.tagsText" placeholder="标签，用逗号分隔" :maxlength="120" />
          </a-form-item>
          <a-checkbox v-model:checked="editForm.isPinned">置顶这条备忘</a-checkbox>
        </a-form>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  PushpinOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { createMemo, deleteMemo, getMemoStats, listMemos, updateMemo } from '@/services/memo'

const typeOptions = [
  { label: '灵感', value: 'idea', color: 'blue' },
  { label: '计划', value: 'plan', color: 'cyan' },
  { label: '研究', value: 'study', color: 'geekblue' },
  { label: '工作', value: 'work', color: 'gold' }
]
const statusOptions = [
  { label: '待推进', value: 'open' },
  { label: '已完成', value: 'completed' },
  { label: '已归档', value: 'archived' }
]
const priorityOptions = [
  { label: '低优先级', value: 'low' },
  { label: '中优先级', value: 'medium' },
  { label: '高优先级', value: 'high' }
]
const statusFilterOptions = [
  { label: '全部', value: '' },
  ...statusOptions
]
const typeFilterOptions = [
  { label: '全部类型', value: '' },
  ...typeOptions
]
const priorityFilterOptions = [
  { label: '全部优先级', value: '' },
  ...priorityOptions
]

const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const memos = ref([])
const createVisible = ref(false)
const editVisible = ref(false)
const editingId = ref('')
let filterTimer = null

const stats = reactive({
  open: 0,
  completed: 0,
  archived: 0,
  pinned: 0,
  dueSoon: 0,
  total: 0
})
const pagination = reactive({
  page: 1,
  pageSize: 12,
  total: 0
})
const filters = reactive({
  keyword: '',
  status: '',
  type: '',
  priority: ''
})
const createForm = reactive({
  title: '',
  content: '',
  type: 'idea',
  priority: 'medium',
  dueAt: '',
  tagsText: '',
  isPinned: false
})
const editForm = reactive({
  title: '',
  content: '',
  type: 'idea',
  status: 'open',
  priority: 'medium',
  dueAt: '',
  tagsText: '',
  isPinned: false
})

function getTypeMeta(type) {
  return typeOptions.find((item) => item.value === type) || typeOptions[0]
}

function parseTags(text) {
  const seen = new Set()
  return String(text || '')
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 8)
}

function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function buildPayload(form) {
  return {
    title: form.title.trim(),
    content: form.content.trim(),
    type: form.type,
    status: form.status,
    priority: form.priority,
    tags: parseTags(form.tagsText),
    dueAt: form.dueAt || null,
    isPinned: form.isPinned === true
  }
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return toDateInputValue(value)
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

async function refreshStats() {
  const data = await getMemoStats()
  Object.assign(stats, {
    open: data?.open || 0,
    completed: data?.completed || 0,
    archived: data?.archived || 0,
    pinned: data?.pinned || 0,
    dueSoon: data?.dueSoon || 0,
    total: data?.total || 0
  })
}

async function refreshMemos(page = pagination.page) {
  loading.value = true
  errorMessage.value = ''

  try {
    pagination.page = typeof page === 'number' ? page : pagination.page
    const result = await listMemos({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword.trim() || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
      priority: filters.priority || undefined
    })

    memos.value = result.items
    pagination.total = result.total
    pagination.page = result.page
    pagination.pageSize = result.pageSize
    await refreshStats()
  } catch (error) {
    errorMessage.value = error.message || '备忘录加载失败'
  } finally {
    loading.value = false
  }
}

function handleFilterInput() {
  clearTimeout(filterTimer)
  filterTimer = setTimeout(() => {
    pagination.page = 1
    refreshMemos(1)
  }, 300)
}

function resetCreateForm() {
  createForm.title = ''
  createForm.content = ''
  createForm.type = 'idea'
  createForm.priority = 'medium'
  createForm.dueAt = ''
  createForm.tagsText = ''
  createForm.isPinned = false
}

function openCreateModal() {
  resetCreateForm()
  createVisible.value = true
}

function closeCreateModal() {
  createVisible.value = false
}

async function submitCreateMemo() {
  if (!createForm.content.trim()) {
    message.warning('先写一点内容再保存')
    return
  }

  submitting.value = true
  try {
    await createMemo(buildPayload({ ...createForm, status: 'open' }))
    message.success('备忘录已保存')
    closeCreateModal()
    pagination.page = 1
    await refreshMemos(1)
  } catch (error) {
    message.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

function openEditModal(memo) {
  editingId.value = memo.id
  editForm.title = memo.title || ''
  editForm.content = memo.content || ''
  editForm.type = memo.type || 'idea'
  editForm.status = memo.status || 'open'
  editForm.priority = memo.priority || 'medium'
  editForm.dueAt = toDateInputValue(memo.dueAt)
  editForm.tagsText = (memo.tags || []).join('，')
  editForm.isPinned = memo.isPinned === true
  editVisible.value = true
}

function closeEditModal() {
  editVisible.value = false
  editingId.value = ''
}

async function submitEditMemo() {
  if (!editForm.content.trim()) {
    message.warning('备忘内容不能为空')
    return
  }

  submitting.value = true
  try {
    await updateMemo(editingId.value, buildPayload(editForm))
    message.success('备忘录已更新')
    closeEditModal()
    await refreshMemos()
  } catch (error) {
    message.error(error.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

async function patchMemo(memo, payload, successMessage) {
  try {
    await updateMemo(memo.id, payload)
    message.success(successMessage)
    await refreshMemos()
  } catch (error) {
    message.error(error.message || '操作失败')
  }
}

function togglePinned(memo) {
  patchMemo(memo, { isPinned: !memo.isPinned }, memo.isPinned ? '已取消置顶' : '已置顶')
}

function toggleCompleted(memo) {
  const status = memo.status === 'completed' ? 'open' : 'completed'
  patchMemo(memo, { status }, status === 'completed' ? '已标记完成' : '已重新打开')
}

function archiveMemo(memo) {
  patchMemo(memo, { status: 'archived', isPinned: false }, '已归档')
}

function confirmDelete(memo) {
  Modal.confirm({
    title: '删除备忘录',
    content: `确定删除「${memo.title}」吗？删除后无法恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteMemo(memo.id)
        message.success('备忘录已删除')
        await refreshMemos()
      } catch (error) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

onMounted(() => {
  refreshMemos(1)
})
</script>

<style scoped>
.memo-page {
  width: 100%;
  min-width: 0;
  display: grid;
  gap: 14px;
}

.memo-page-head,
.memo-toolbar {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.memo-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 18px;
}

.memo-page-head h1 {
  margin: 0;
  color: var(--console-text);
  font-size: 20px;
  line-height: 28px;
}

.memo-page-head p:last-child {
  max-width: 760px;
  margin: 4px 0 0;
  color: var(--console-text-secondary);
  line-height: 1.65;
}

.memo-head-side {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.memo-stats {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 86px);
  gap: 8px;
}

.memo-stats div {
  min-height: 58px;
  display: grid;
  align-content: center;
  justify-items: center;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: var(--console-surface-muted);
}

.memo-stats span {
  color: var(--console-text);
  font-size: 20px;
  font-weight: 700;
  line-height: 24px;
}

.memo-stats small {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.memo-toolbar :deep(.ant-input),
.memo-toolbar :deep(.ant-input-affix-wrapper),
.memo-toolbar :deep(.ant-select-selector) {
  border-radius: 6px;
}

.memo-select,
.memo-filter-select {
  width: 100%;
}

.memo-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) max-content 150px 150px 40px;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.memo-search {
  min-width: 0;
}

.memo-icon-button {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--console-menu-text);
}

.memo-icon-button.active,
.memo-icon-button:hover {
  color: var(--console-primary-strong);
  border-color: var(--console-primary-strong);
}

.memo-icon-button--danger:hover {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.memo-alert {
  border-radius: 8px;
}

.memo-list {
  display: grid;
  gap: 10px;
}

.memo-item {
  position: relative;
  min-height: 112px;
  display: grid;
  grid-template-columns: 5px minmax(0, 1fr) max-content;
  gap: 14px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 14px 14px 14px 0;
  background: var(--console-surface);
  transition: border-color 0.2s, background 0.2s;
}

.memo-item:hover {
  border-color: var(--console-border-strong);
  background: var(--console-surface-hover);
}

.memo-item--done .memo-item-main h2,
.memo-item--done .memo-item-main p {
  opacity: 0.72;
}

.memo-item-marker {
  width: 5px;
  height: 100%;
  border-radius: 0 999px 999px 0;
  background: #52c41a;
}

.memo-item--medium .memo-item-marker {
  background: #1677ff;
}

.memo-item--high .memo-item-marker {
  background: #fa8c16;
}

.memo-item-main {
  min-width: 0;
}

.memo-item-title-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.memo-item h2 {
  min-width: 0;
  overflow: hidden;
  margin: 0;
  color: var(--console-text);
  font-size: 16px;
  font-weight: 650;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memo-item p {
  display: -webkit-box;
  overflow: hidden;
  margin: 8px 0 0;
  color: var(--console-text-secondary);
  line-height: 1.7;
  white-space: pre-wrap;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.memo-item-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.memo-type-tag,
.memo-mini-tag {
  flex: 0 0 auto;
  margin-inline-end: 0;
  border-radius: 4px;
}

.memo-mini-tag {
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  border-color: var(--console-border);
}

.memo-item-actions {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.memo-empty {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 56px 0;
  background: var(--console-surface);
}

.memo-pagination {
  display: flex;
  justify-content: flex-end;
}

.memo-modal-body {
  max-height: min(68vh, 640px);
  overflow-y: auto;
  padding-right: 4px;
}

.memo-modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 12px;
}

@media (max-width: 1200px) {
  .memo-page-head {
    grid-template-columns: 1fr;
  }

  .memo-page-head {
    display: grid;
  }

  .memo-head-side {
    align-items: stretch;
    flex-direction: column;
  }

  .memo-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .memo-toolbar {
    grid-template-columns: minmax(220px, 1fr) 220px 150px 150px 40px;
  }
}
</style>
