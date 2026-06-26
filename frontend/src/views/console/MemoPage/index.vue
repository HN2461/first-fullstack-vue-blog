<template>
  <section class="memo-page">
    <!-- 指标卡片 -->
    <div class="memo-metrics">
      <div class="memo-metric">
        <div class="memo-metric__icon memo-metric__icon--blue">
          <ClockCircleOutlined />
        </div>
        <div class="memo-metric__body">
          <span class="memo-metric__label">待推进</span>
          <strong class="memo-metric__value">{{ stats.open }}</strong>
        </div>
      </div>
      <div class="memo-metric">
        <div class="memo-metric__icon memo-metric__icon--purple">
          <PushpinOutlined />
        </div>
        <div class="memo-metric__body">
          <span class="memo-metric__label">已置顶</span>
          <strong class="memo-metric__value">{{ stats.pinned }}</strong>
        </div>
      </div>
      <div class="memo-metric">
        <div class="memo-metric__icon memo-metric__icon--amber">
          <AlertOutlined />
        </div>
        <div class="memo-metric__body">
          <span class="memo-metric__label">近期待办</span>
          <strong class="memo-metric__value">{{ stats.dueSoon }}</strong>
        </div>
      </div>
      <div class="memo-metric">
        <div class="memo-metric__icon memo-metric__icon--green">
          <CheckCircleOutlined />
        </div>
        <div class="memo-metric__body">
          <span class="memo-metric__label">已完成</span>
          <strong class="memo-metric__value">{{ stats.completed }}</strong>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="memo-toolbar">
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
        placeholder="类型"
        allow-clear
        @change="refreshMemos"
      />
      <a-select
        v-model:value="filters.priority"
        class="memo-filter-select"
        :options="priorityFilterOptions"
        placeholder="优先级"
        allow-clear
        @change="refreshMemos"
      />
      <a-tooltip title="刷新">
        <a-button class="memo-icon-btn" @click="refreshMemos">
          <template #icon><ReloadOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-button type="primary" @click="openCreateModal">
        <template #icon><PlusOutlined /></template>
        新增备忘
      </a-button>
    </div>

    <a-alert v-if="errorMessage" class="memo-alert" type="error" show-icon :message="errorMessage" />

    <!-- 备忘列表 -->
    <a-spin :spinning="loading">
      <div v-if="memos.length > 0" class="memo-list">
        <article
          v-for="memo in memos"
          :key="memo.id"
          :class="[
            'memo-card',
            `memo-card--${memo.priority}`,
            { 'memo-card--done': memo.status === 'completed', 'memo-card--archived': memo.status === 'archived' }
          ]"
        >
          <div class="memo-card__marker" aria-hidden="true"></div>
          <div class="memo-card__body">
            <div class="memo-card__head">
              <div class="memo-card__title-row">
                <a-tag class="memo-card__type" :color="getTypeMeta(memo.type).color" :bordered="false">
                  {{ getTypeMeta(memo.type).label }}
                </a-tag>
                <h3 class="memo-card__title">{{ memo.title }}</h3>
              </div>
              <div class="memo-card__badges">
                <span v-if="memo.isPinned" class="memo-badge memo-badge--pinned">
                  <PushpinOutlined /> 置顶
                </span>
                <span v-if="memo.status === 'completed'" class="memo-badge memo-badge--done">
                  <CheckCircleOutlined /> 已完成
                </span>
                <span v-else-if="memo.status === 'archived'" class="memo-badge memo-badge--archived">
                  <InboxOutlined /> 已归档
                </span>
                <span v-if="memo.dueAt && memo.status === 'open'" class="memo-badge memo-badge--due">
                  <CalendarOutlined /> {{ formatDate(memo.dueAt) }}
                </span>
              </div>
            </div>
            <button type="button" class="memo-card__preview" @click="openDetailModal(memo)">
              {{ memo.content }}
            </button>
            <div class="memo-card__foot">
              <div class="memo-card__meta">
                <span class="memo-card__time">
                  <ClockCircleOutlined /> {{ formatTime(memo.updatedAt) }}
                </span>
                <a-tag v-for="tag in memo.tags" :key="tag" class="memo-card__tag" :bordered="false">{{ tag }}</a-tag>
              </div>
              <div class="memo-card__actions">
                <a-tooltip title="查看详情">
                  <a-button size="small" @click="openDetailModal(memo)">
                    <template #icon><EyeOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="memo.isPinned ? '取消置顶' : '置顶'">
                  <a-button size="small" :class="{ 'memo-icon-btn--active': memo.isPinned }" @click="togglePinned(memo)">
                    <template #icon><PushpinOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="memo.status === 'completed' ? '重新打开' : '标记完成'">
                  <a-button size="small" @click="toggleCompleted(memo)">
                    <template #icon><CheckOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="memo.status === 'archived' ? '取消归档' : '归档'">
                  <a-button size="small" @click="toggleArchive(memo)">
                    <template #icon><InboxOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="编辑">
                  <a-button size="small" @click="openEditModal(memo)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="删除">
                  <a-button size="small" danger @click="confirmDelete(memo)">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-tooltip>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="memo-empty">
        <InboxOutlined class="memo-empty__icon" />
        <p class="memo-empty__text">暂无备忘录</p>
        <p class="memo-empty__hint">记录灵感、计划、待办事项，让想法不丢失</p>
        <a-button type="primary" @click="openCreateModal">
          <template #icon><PlusOutlined /></template>
          新建备忘
        </a-button>
      </div>
    </a-spin>

    <!-- 分页 -->
    <div v-if="pagination.total > pagination.pageSize" class="memo-pagination">
      <a-pagination
        v-model:current="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        show-less-items
        @change="refreshMemos"
      />
    </div>

    <!-- 新增弹窗 -->
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
            <a-input v-model:value.trim="createForm.title" :maxlength="80" placeholder="给备忘起个名字（可选）" />
          </a-form-item>
          <a-form-item label="内容" required>
            <a-textarea
              v-model:value="createForm.content"
              :auto-size="{ minRows: 6, maxRows: 12 }"
              :maxlength="5000"
              show-count
              placeholder="记录灵感、问题、计划或待处理的线索..."
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
              <a-input v-model:value="createForm.tagsText" placeholder="多个标签用逗号分隔" :maxlength="120" />
            </a-form-item>
          </div>
          <a-checkbox v-model:checked="createForm.isPinned">置顶这条备忘</a-checkbox>
        </a-form>
      </div>
    </a-modal>

    <!-- 编辑弹窗 -->
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
            <a-input v-model:value.trim="editForm.title" :maxlength="80" placeholder="给备忘起个名字（可选）" />
          </a-form-item>
          <a-form-item label="内容" required>
            <a-textarea v-model:value="editForm.content" :auto-size="{ minRows: 6, maxRows: 12 }" :maxlength="5000" show-count />
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
            <a-input v-model:value="editForm.tagsText" placeholder="多个标签用逗号分隔" :maxlength="120" />
          </a-form-item>
          <a-checkbox v-model:checked="editForm.isPinned">置顶这条备忘</a-checkbox>
        </a-form>
      </div>
    </a-modal>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      :title="detailMemo?.title || '备忘详情'"
      :width="720"
      :footer="null"
      class="memo-detail-modal"
      destroy-on-close
    >
      <div v-if="detailMemo" class="memo-detail">
        <div class="memo-detail__badges">
          <a-tag :color="getTypeMeta(detailMemo.type).color" :bordered="false">
            {{ getTypeMeta(detailMemo.type).label }}
          </a-tag>
          <a-tag :color="getPriorityMeta(detailMemo.priority).color">{{ getPriorityMeta(detailMemo.priority).label }}</a-tag>
          <a-tag v-if="detailMemo.status === 'completed'" color="success">已完成</a-tag>
          <a-tag v-else-if="detailMemo.status === 'archived'">已归档</a-tag>
          <a-tag v-if="detailMemo.isPinned" color="blue" :bordered="false">置顶</a-tag>
        </div>
        <div class="memo-detail__content">{{ detailMemo.content }}</div>
        <div class="memo-detail__meta">
          <span><ClockCircleOutlined /> 更新于 {{ formatTime(detailMemo.updatedAt) }}</span>
          <span v-if="detailMemo.createdAt"><FormOutlined /> 创建于 {{ formatTime(detailMemo.createdAt) }}</span>
          <span v-if="detailMemo.dueAt"><CalendarOutlined /> 计划 {{ formatDate(detailMemo.dueAt) }}</span>
        </div>
        <div v-if="detailMemo.tags?.length" class="memo-detail__tags">
          <a-tag v-for="tag in detailMemo.tags" :key="tag" :bordered="false">{{ tag }}</a-tag>
        </div>
        <div class="memo-detail__footer">
          <a-button @click="openEditFromDetail">
            <template #icon><EditOutlined /></template>
            编辑
          </a-button>
          <a-button @click="togglePinned(detailMemo)">
            <template #icon><PushpinOutlined /></template>
            {{ detailMemo.isPinned ? '取消置顶' : '置顶' }}
          </a-button>
          <a-button @click="toggleCompleted(detailMemo)">
            <template #icon><CheckOutlined /></template>
            {{ detailMemo.status === 'completed' ? '重新打开' : '标记完成' }}
          </a-button>
          <a-button @click="toggleArchive(detailMemo)">
            <template #icon><InboxOutlined /></template>
            {{ detailMemo.status === 'archived' ? '取消归档' : '归档' }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  AlertOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FormOutlined,
  InboxOutlined,
  PlusOutlined,
  PushpinOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { createMemo, deleteMemo, getMemoStats, listMemos, updateMemo } from '@/services/memo'

const route = useRoute()
const router = useRouter()
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
const detailVisible = ref(false)
const detailMemo = ref(null)
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

function getPriorityMeta(priority) {
  const map = {
    low: { label: '低优先级', color: 'default' },
    medium: { label: '中优先级', color: 'processing' },
    high: { label: '高优先级', color: 'warning' }
  }
  return map[priority] || map.medium
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

function openDetailModal(memo) {
  detailMemo.value = memo
  detailVisible.value = true
}

function closeDetailModal() {
  detailVisible.value = false
  detailMemo.value = null
}

function openEditFromDetail() {
  if (!detailMemo.value) return
  openEditModal(detailMemo.value)
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
    closeDetailModal()
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

function toggleArchive(memo) {
  if (memo.status === 'archived') {
    patchMemo(memo, { status: 'open' }, '已取消归档')
  } else {
    patchMemo(memo, { status: 'archived', isPinned: false }, '已归档')
  }
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
  if (route.query.create === '1') {
    openCreateModal()
    router.replace({ path: route.path, query: { ...route.query, create: undefined } })
  }
})

watch(
  () => route.query.create,
  (value) => {
    if (value === '1') {
      openCreateModal()
      router.replace({ path: route.path, query: { ...route.query, create: undefined } })
    }
  }
)
</script>

<style scoped>
.memo-page {
  width: 100%;
  min-width: 0;
  display: grid;
  gap: 16px;
}

/* ── 指标卡片 ── */
.memo-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.memo-metric {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.memo-metric:hover {
  border-color: var(--console-border-strong);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.memo-metric__icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 18px;
  flex-shrink: 0;
}

.memo-metric__icon--blue {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.memo-metric__icon--purple {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.memo-metric__icon--amber {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.memo-metric__icon--green {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.memo-metric__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.memo-metric__label {
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.memo-metric__value {
  color: var(--console-text);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

/* ── 工具栏 ── */
.memo-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  flex-wrap: wrap;
}

.memo-search {
  width: 240px;
  flex-shrink: 0;
}

.memo-filter-select {
  width: 130px;
  flex-shrink: 0;
}

.memo-toolbar :deep(.ant-input),
.memo-toolbar :deep(.ant-input-affix-wrapper),
.memo-toolbar :deep(.ant-select-selector) {
  border-radius: 6px;
}

.memo-toolbar :deep(.ant-segmented) {
  border-radius: 6px;
}

.memo-icon-btn--active {
  color: var(--console-primary) !important;
  border-color: var(--console-primary) !important;
}

.memo-alert {
  border-radius: 8px;
}

/* ── 备忘卡片列表 ── */
.memo-list {
  display: grid;
  gap: 8px;
}

.memo-card {
  position: relative;
  display: grid;
  grid-template-columns: 5px 1fr;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.memo-card:hover {
  border-color: var(--console-border-strong);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.memo-card--done {
  opacity: 0.7;
}

.memo-card--archived {
  opacity: 0.55;
}

.memo-card__marker {
  width: 5px;
  min-height: 100%;
  background: #52c41a;
}

.memo-card--medium .memo-card__marker {
  background: #1677ff;
}

.memo-card--high .memo-card__marker {
  background: #fa8c16;
}

.memo-card__body {
  min-width: 0;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.memo-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.memo-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.memo-card__type {
  flex-shrink: 0;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
}

.memo-card__title {
  min-width: 0;
  margin: 0;
  color: var(--console-text);
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memo-card--done .memo-card__title {
  text-decoration: line-through;
  text-decoration-color: var(--console-text-secondary);
}

.memo-card__badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.memo-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
}

.memo-badge--pinned {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.memo-badge--done {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}

.memo-badge--archived {
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
}

.memo-badge--due {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}

.memo-card__preview {
  display: -webkit-box;
  width: 100%;
  max-height: 44px;
  overflow: hidden;
  border: 0;
  padding: 0;
  margin: 0;
  color: var(--console-text-secondary);
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  line-height: 1.6;
  text-align: left;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  transition: color 0.15s;
}

.memo-card__preview:hover {
  color: var(--console-text);
}

.memo-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.memo-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.memo-card__time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--console-text-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.memo-card__tag {
  flex-shrink: 0;
  margin-inline-end: 0;
  border-radius: 4px;
  font-size: 12px;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
}

.memo-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}

.memo-card:hover .memo-card__actions {
  opacity: 1;
}

/* ── 空状态 ── */
.memo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.memo-empty__icon {
  font-size: 48px;
  color: var(--console-text-secondary);
  opacity: 0.3;
}

.memo-empty__text {
  margin: 0;
  color: var(--console-text);
  font-size: 16px;
  font-weight: 600;
}

.memo-empty__hint {
  margin: 0;
  color: var(--console-text-secondary);
  font-size: 13px;
}

/* ── 分页 ── */
.memo-pagination {
  display: flex;
  justify-content: flex-end;
}

/* ── 弹窗表单 ── */
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

/* ── 详情弹窗 ── */
.memo-detail {
  display: grid;
  gap: 16px;
}

.memo-detail__badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.memo-detail__content {
  max-height: min(48vh, 480px);
  overflow-y: auto;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 16px 18px;
  color: var(--console-text);
  background: var(--console-surface-muted);
  font-size: 14px;
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.memo-detail__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  color: var(--console-text-secondary);
  font-size: 13px;
}

.memo-detail__meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.memo-detail__tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.memo-detail__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--console-border);
}

.memo-detail-modal :deep(.ant-modal-body) {
  max-height: 76vh;
  overflow: hidden;
}

/* ── 响应式 ── */
@media (max-width: 1200px) {
  .memo-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .memo-toolbar {
    flex-wrap: wrap;
  }

  .memo-search {
    width: 100%;
    flex: 1 1 100%;
  }

  .memo-filter-select {
    flex: 1 1 calc(50% - 5px);
    min-width: 0;
  }

  .memo-toolbar :deep(.ant-segmented) {
    width: 100%;
    overflow-x: auto;
  }

  .memo-card__actions {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .memo-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .memo-metric {
    padding: 12px 14px;
    gap: 10px;
  }

  .memo-metric__icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .memo-metric__value {
    font-size: 20px;
  }

  .memo-toolbar > .ant-btn-primary {
    width: 100%;
  }

  .memo-card__head,
  .memo-card__foot {
    align-items: flex-start;
    flex-direction: column;
  }

  .memo-card__badges,
  .memo-card__actions {
    width: 100%;
  }

  .memo-card__actions {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .memo-card__actions :deep(.ant-btn) {
    width: 100%;
  }

  .memo-modal-grid {
    grid-template-columns: 1fr;
  }

  .memo-detail__footer {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .memo-detail__footer :deep(.ant-btn) {
    width: 100%;
  }
}
</style>
