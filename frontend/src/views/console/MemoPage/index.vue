<template>
  <section class="memo-page">
    <BlogTable
      ref="tableRef"
      class="memo-table"
      :api-fn="loadTableData"
      :columns="columns"
      :params="requestParams"
      :scroll="{ x: 1284 }"
      :page-size="12"
      :show-column-setting="true"
      row-key="id"
      empty-text="暂无个人记录"
    >
      <template #toolbar>
        <div class="memo-toolbar">
          <div class="memo-toolbar__top">
            <div class="memo-toolbar__identity">
              <h1>个人记录</h1>
              <a-tooltip title="查看个人记录说明">
                <a-button type="text" aria-label="查看个人记录说明" @click="helpOpen = true">
                  <template #icon><CircleHelp :size="16" /></template>
                </a-button>
              </a-tooltip>
              <a-segmented v-model:value="activeView" :options="viewOptions" @change="handleViewChange" />
            </div>
            <div class="memo-toolbar__actions">
              <a-button @click="openCreateRecord('capture')">
                <template #icon><Plus :size="15" /></template>
                快速记录
              </a-button>
              <a-button type="primary" @click="openCreateRecord('reference')">
                <template #icon><FilePlus2 :size="15" /></template>
                添加资料
              </a-button>
            </div>
          </div>

          <div class="memo-toolbar__filters">
            <a-input
              v-model:value="keywordInput"
              class="memo-filter-keyword"
              allow-clear
              :placeholder="activeView === 'library' ? '搜索资料名称、非敏感字段或标签' : '搜索记录、资料名称、非敏感字段或标签'"
              @change="scheduleTextFilters"
              @press-enter="applyTextFilters"
            >
              <template #prefix><Search :size="15" /></template>
            </a-input>

            <a-select
              v-if="activeView === 'all' || activeView === 'inbox'"
              v-model:value="filters.status"
              class="memo-filter-select"
              :options="statusOptions"
              allow-clear
              show-search
              option-filter-prop="label"
              placeholder="记录状态"
            />
            <a-select
              v-if="activeView === 'all' || activeView === 'inbox'"
              v-model:value="filters.type"
              class="memo-filter-select"
              :options="typeOptions"
              allow-clear
              show-search
              option-filter-prop="label"
              placeholder="记录类型"
            />
            <a-select
              v-if="activeView === 'all' || activeView === 'inbox'"
              v-model:value="filters.priority"
              class="memo-filter-select"
              :options="priorityOptions"
              allow-clear
              show-search
              option-filter-prop="label"
              placeholder="优先级"
            />
            <a-input
              v-if="activeView === 'all' || activeView === 'library'"
              v-model:value="categoryInput"
              class="memo-filter-category"
              allow-clear
              placeholder="资料分类"
              @change="scheduleTextFilters"
              @press-enter="applyTextFilters"
            />
            <a-button v-if="hasActiveFilters" type="link" class="memo-filter-reset" @click="resetFilters">
              清除筛选
            </a-button>
          </div>
          <a-alert v-if="errorMessage" class="memo-request-error" type="error" show-icon :message="errorMessage">
            <template #action>
              <a-button size="small" @click="tableRef?.reload()">重试</a-button>
            </template>
          </a-alert>
        </div>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <div class="memo-record-title-cell">
            <button type="button" class="memo-record-title" @click="openDetails(record)">
              <Pin v-if="record.isPinned" class="memo-record-title__pin" :size="14" aria-label="已置顶" />
              <span>{{ record.title }}</span>
            </button>
            <span v-if="getRecordPreview(record)" class="memo-record-subtitle">{{ getRecordPreview(record) }}</span>
          </div>
        </template>

        <template v-else-if="column.key === 'kind'">
          <a-tag :color="record.kind === 'reference' ? 'cyan' : 'blue'" :bordered="false">
            {{ record.kind === 'reference' ? '资料' : '收集箱' }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'category'">
          <span class="memo-table-muted">{{ record.category || '未分类' }}</span>
        </template>

        <template v-else-if="column.key === 'summary'">
          <template v-if="record.kind === 'reference'">
            <span class="memo-reference-summary">
              {{ record.fieldCount }} 个字段
              <span v-if="record.sensitiveFieldCount">· {{ record.sensitiveFieldCount }} 项敏感</span>
            </span>
          </template>
          <div v-else class="memo-record-summary">{{ record.summary || '暂无内容' }}</div>
        </template>

        <template v-else-if="column.key === 'status'">
          <div v-if="record.kind === 'capture'" class="memo-status-cell">
            <a-tag :color="getStatusMeta(record.status).color" :bordered="false">
              {{ getStatusMeta(record.status).label }}
            </a-tag>
            <span :class="['memo-priority', `memo-priority--${record.priority}`]">
              {{ getPriorityLabel(record.priority) }}
            </span>
          </div>
          <span v-else class="memo-table-muted">结构化资料</span>
        </template>

        <template v-else-if="column.key === 'updatedAt'">
          <span class="memo-table-time">{{ formatTime(record.updatedAt) }}</span>
        </template>

        <template v-else-if="column.key === 'actions'">
          <div class="memo-row-actions">
            <a-tooltip title="查看详情">
              <a-button type="text" size="small" :aria-label="`查看${record.title}`" @click="openDetails(record)">
                <template #icon><Eye :size="15" /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="编辑记录">
              <a-button type="text" size="small" :loading="loadingEditId === record.id" :aria-label="`编辑${record.title}`" @click="openEditRecord(record)">
                <template #icon><Pencil :size="15" /></template>
              </a-button>
            </a-tooltip>
            <a-dropdown trigger="click" placement="bottomRight">
              <a-tooltip title="更多操作">
                <a-button type="text" size="small" :aria-label="`${record.title}更多操作`">
                  <template #icon><MoreHorizontal :size="16" /></template>
                </a-button>
              </a-tooltip>
              <template #overlay>
                <a-menu @click="({ key }) => handleRecordMenuAction(key, record)">
                  <a-menu-item key="pin">
                    <Pin :size="14" /> {{ record.isPinned ? '取消置顶' : '置顶' }}
                  </a-menu-item>
                  <a-menu-item v-if="record.kind !== 'reference'" key="complete">
                    <Check :size="14" /> {{ record.status === 'completed' ? '重新打开' : '标记完成' }}
                  </a-menu-item>
                  <a-menu-item key="archive">
                    <Archive :size="14" /> {{ record.status === 'archived' ? '取消归档' : '归档' }}
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" danger>
                    <Trash2 :size="14" /> 删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </template>

      <template #empty>
        <div v-if="errorMessage" class="memo-table-empty">
          <Inbox :size="24" />
          <strong>记录加载失败</strong>
          <span>{{ errorMessage }}</span>
          <a-button @click="tableRef?.reload()">重试</a-button>
        </div>
        <div v-else-if="tableLoaded" class="memo-table-empty">
          <Inbox :size="24" />
          <strong>{{ hasActiveFilters ? '没有匹配的记录' : getEmptyTitle() }}</strong>
          <span>{{ hasActiveFilters ? '调整搜索词或清除筛选条件后重试。' : getEmptyDescription() }}</span>
          <a-button v-if="hasActiveFilters" @click="resetFilters">清除筛选</a-button>
          <a-button v-else type="primary" @click="openCreateRecord(activeView === 'library' ? 'reference' : 'capture')">
            <template #icon><Plus :size="15" /></template>
            {{ activeView === 'library' ? '添加资料' : '快速记录' }}
          </a-button>
        </div>
        <span v-else class="memo-table-loading">正在读取个人记录…</span>
      </template>
    </BlogTable>

    <MemoRecordEditor
      v-model:open="editorOpen"
      :record="editingRecord"
      :initial-kind="editorKind"
      :saving="saving"
      @save="saveRecord"
    />

    <MemoRecordDetails
      ref="detailsRef"
      :open="detailsOpen"
      :record="activeRecord"
      @close="detailsOpen = false"
      @edit="openEditFromDetails"
      @action="handleDetailsAction"
    />

    <a-modal
      :open="helpOpen"
      title="个人记录使用说明"
      :footer="null"
      :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
      wrap-class-name="memo-help-dialog"
      @update:open="helpOpen = $event"
    >
      <dl class="memo-help-list">
        <div>
          <dt>收集箱</dt>
          <dd>记录灵感、问题和待处理线索，可设置优先级、计划日期，并在完成后归档。</dd>
        </div>
        <div>
          <dt>资料库</dt>
          <dd>按字段保存经常查阅的个人资料，可自定义字段、类型和分类。</dd>
        </div>
        <div>
          <dt>敏感信息</dt>
          <dd>电话、证件号码、地址等字段加密保存。详情默认隐藏内容，点击眼睛图标后才读取单个字段。</dd>
        </div>
        <div>
          <dt>归档与删除</dt>
          <dd>归档记录仍可在“已归档”中找回；删除会永久移除记录及其加密字段。</dd>
        </div>
      </dl>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  Archive,
  Check,
  CircleHelp,
  Eye,
  FilePlus2,
  Inbox,
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2
} from 'lucide-vue-next'
import BlogTable from '@/components/BlogTable.vue'
import { createMemo, deleteMemo, getMemo, listMemos, updateMemo } from '@/services/memo'
import MemoRecordDetails from './MemoRecordDetails.vue'
import MemoRecordEditor from './MemoRecordEditor.vue'

const route = useRoute()
const router = useRouter()
const tableRef = ref(null)
const detailsRef = ref(null)
const activeView = ref('all')
const keywordInput = ref('')
const categoryInput = ref('')
const searchKeyword = ref('')
const searchCategory = ref('')
const editorOpen = ref(false)
const editorKind = ref('capture')
const editingRecord = ref(null)
const activeRecord = ref(null)
const detailsOpen = ref(false)
const helpOpen = ref(false)
const saving = ref(false)
const loadingEditId = ref('')
const errorMessage = ref('')
const tableLoaded = ref(false)
const filters = reactive({ status: undefined, type: undefined, priority: undefined })
let textFilterTimer = null
let editRequestToken = 0

const viewOptions = [
  { label: '全部', value: 'all' },
  { label: '收集箱', value: 'inbox' },
  { label: '资料库', value: 'library' },
  { label: '已归档', value: 'archived' }
]
const statusOptions = [
  { label: '待推进', value: 'open' },
  { label: '已完成', value: 'completed' }
]
const typeOptions = [
  { label: '灵感', value: 'idea' },
  { label: '计划', value: 'plan' },
  { label: '研究', value: 'study' },
  { label: '工作', value: 'work' }
]
const priorityOptions = [
  { label: '低优先级', value: 'low' },
  { label: '中优先级', value: 'medium' },
  { label: '高优先级', value: 'high' }
]
const columns = [
  { title: '标题', key: 'title', dataIndex: 'title', width: 300 },
  { title: '记录类型', key: 'kind', dataIndex: 'kind', width: 110 },
  { title: '分类', key: 'category', dataIndex: 'category', width: 140 },
  { title: '内容摘要', key: 'summary', dataIndex: 'summary', width: 300 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 150 },
  { title: '最近更新', key: 'updatedAt', dataIndex: 'updatedAt', width: 160 },
  { title: '操作', key: 'actions', width: 124, fixed: 'right' }
]

const requestParams = computed(() => ({
  keyword: searchKeyword.value || undefined,
  category: searchCategory.value || undefined,
  kind: activeView.value === 'inbox' ? 'capture' : activeView.value === 'library' ? 'reference' : undefined,
  status: activeView.value === 'archived' ? 'archived' : filters.status || 'active',
  type: activeView.value === 'all' || activeView.value === 'inbox' ? filters.type : undefined,
  priority: activeView.value === 'all' || activeView.value === 'inbox' ? filters.priority : undefined
}))

const hasActiveFilters = computed(() => Boolean(
  searchKeyword.value || searchCategory.value || filters.status || filters.type || filters.priority
))

function scheduleTextFilters() {
  clearTimeout(textFilterTimer)
  textFilterTimer = setTimeout(applyTextFilters, 300)
}

function applyTextFilters() {
  clearTimeout(textFilterTimer)
  searchKeyword.value = keywordInput.value.trim()
  searchCategory.value = categoryInput.value.trim()
}

function resetFilters() {
  clearTimeout(textFilterTimer)
  keywordInput.value = ''
  categoryInput.value = ''
  searchKeyword.value = ''
  searchCategory.value = ''
  filters.status = undefined
  filters.type = undefined
  filters.priority = undefined
}

function handleViewChange() {
  filters.status = undefined
  filters.type = undefined
  filters.priority = undefined
  categoryInput.value = ''
  searchCategory.value = ''
}

async function loadTableData(params) {
  errorMessage.value = ''
  try {
    const result = await listMemos(params)
    tableLoaded.value = true
    return result
  } catch (error) {
    errorMessage.value = error.message || '记录加载失败'
    tableLoaded.value = true
    return { items: [], total: 0 }
  }
}

function getRecordPreview(record) {
  return record.tags?.length ? `标签：${record.tags.join('、')}` : ''
}

function getEmptyTitle() {
  if (activeView.value === 'library') return '资料库还是空的'
  if (activeView.value === 'archived') return '暂无已归档记录'
  if (activeView.value === 'inbox') return '收集箱还是空的'
  return '暂无个人记录'
}

function getEmptyDescription() {
  if (activeView.value === 'library') return '把经常需要查阅的信息整理成字段资料。'
  if (activeView.value === 'archived') return '完成或暂时不需要的记录可以归档保存。'
  if (activeView.value === 'inbox') return '随手保存灵感、问题和下一步线索。'
  return '用收集箱记录想法，或将长期信息整理进资料库。'
}

function getStatusMeta(status) {
  const values = {
    open: { label: '待推进', color: 'processing' },
    completed: { label: '已完成', color: 'success' },
    archived: { label: '已归档', color: 'default' }
  }
  return values[status] || values.open
}

function getPriorityLabel(priority) {
  return {
    low: '低',
    medium: '中',
    high: '高'
  }[priority] || '中'
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

function openCreateRecord(kind) {
  editRequestToken += 1
  loadingEditId.value = ''
  editingRecord.value = null
  editorKind.value = kind
  editorOpen.value = true
}

async function openEditRecord(record) {
  if (!record?.id) return

  const requestToken = ++editRequestToken
  loadingEditId.value = record.id

  try {
    const detail = Array.isArray(record.fields) && typeof record.content === 'string'
      ? record
      : await getMemo(record.id)

    if (requestToken !== editRequestToken) return
    editingRecord.value = detail
    editorKind.value = detail.kind || 'capture'
    editorOpen.value = true
  } catch (error) {
    if (requestToken === editRequestToken) message.error(error.message || '读取记录失败')
  } finally {
    if (requestToken === editRequestToken) loadingEditId.value = ''
  }
}

function openDetails(record) {
  activeRecord.value = record
  detailsOpen.value = true
}

function closeDetails() {
  detailsOpen.value = false
  activeRecord.value = null
}

function openEditFromDetails(record) {
  detailsOpen.value = false
  activeRecord.value = null
  openEditRecord(record)
}

async function saveRecord(payload) {
  saving.value = true
  try {
    if (editingRecord.value?.id) {
      await updateMemo(editingRecord.value.id, payload)
      message.success('记录已更新')
    } else {
      await createMemo(payload)
      message.success(payload.kind === 'reference' ? '资料已保存' : '记录已保存')
    }
    editorOpen.value = false
    editingRecord.value = null
    await tableRef.value?.reload()
  } catch (error) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function handleRecordMenuAction(action, record) {
  if (action === 'delete') {
    confirmDelete(record)
    return
  }
  applyRecordAction(action, record)
}

function handleDetailsAction({ action, record }) {
  applyRecordAction(action, record)
}

async function applyRecordAction(action, record) {
  if (!record?.id) return
  let payload = {}
  let successText = ''

  if (action === 'pin') {
    payload = { isPinned: !record.isPinned }
    successText = payload.isPinned ? '已置顶' : '已取消置顶'
  } else if (action === 'complete') {
    payload = { status: record.status === 'completed' ? 'open' : 'completed' }
    successText = payload.status === 'completed' ? '已标记完成' : '已重新打开'
  } else if (action === 'archive') {
    const restoring = record.status === 'archived'
    payload = restoring ? { status: 'open' } : { status: 'archived', isPinned: false }
    successText = restoring ? '已取消归档' : '已归档'
  }

  try {
    await updateMemo(record.id, payload)
    message.success(successText)
    await tableRef.value?.reload()
    if (detailsOpen.value) await detailsRef.value?.loadDetail()
  } catch (error) {
    message.error(error.message || '操作失败')
  }
}

function confirmDelete(record) {
  Modal.confirm({
    title: '删除个人记录',
    content: `确定永久删除“${record.title}”吗？该记录及其中加密的资料字段都会被删除。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteMemo(record.id)
        if (activeRecord.value?.id === record.id) closeDetails()
        message.success('记录已删除')
        await tableRef.value?.reload()
      } catch (error) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

onMounted(() => {
  if (route.query.create === '1') {
    openCreateRecord('capture')
    router.replace({ path: route.path, query: { ...route.query, create: undefined } })
  }
})

watch(
  () => route.query.create,
  (value) => {
    if (value === '1') {
      openCreateRecord('capture')
      router.replace({ path: route.path, query: { ...route.query, create: undefined } })
    }
  }
)

onBeforeUnmount(() => clearTimeout(textFilterTimer))
</script>

<style scoped>
.memo-page {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}

.memo-table {
  width: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
}

.memo-toolbar {
  display: grid;
  width: 100%;
  gap: 12px;
}

.memo-toolbar__top,
.memo-toolbar__identity,
.memo-toolbar__actions,
.memo-toolbar__filters {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.memo-toolbar__top {
  justify-content: space-between;
  gap: 16px;
}

.memo-toolbar__identity {
  flex-wrap: wrap;
}

.memo-toolbar__identity h1 {
  margin: 0 2px 0 0;
  color: var(--console-text);
  font-size: 18px;
  font-weight: 600;
  line-height: 32px;
}

.memo-toolbar__actions {
  flex: 0 0 auto;
}

.memo-toolbar__filters {
  flex-wrap: wrap;
}

.memo-filter-keyword {
  width: min(300px, 100%);
}

.memo-filter-select {
  width: 132px;
}

.memo-filter-category {
  width: 160px;
}

.memo-filter-reset {
  padding-inline: 6px;
}

.memo-request-error {
  margin-top: 2px;
}

.memo-record-title-cell {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.memo-record-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  border: 0;
  padding: 0;
  overflow: hidden;
  color: var(--console-text);
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 550;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memo-record-title:hover {
  color: var(--console-primary);
}

.memo-record-title > span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.memo-record-title__pin {
  flex: 0 0 auto;
  color: var(--console-primary);
}

.memo-record-subtitle,
.memo-record-summary,
.memo-reference-summary {
  display: -webkit-box;
  overflow: hidden;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.55;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.memo-record-summary {
  max-width: 280px;
}

.memo-reference-summary {
  display: block;
  white-space: nowrap;
}

.memo-status-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.memo-status-cell :deep(.ant-tag) {
  margin: 0;
}

.memo-priority {
  font-size: 12px;
}

.memo-priority--high {
  color: #d4380d;
}

.memo-priority--medium {
  color: var(--console-text-secondary);
}

.memo-priority--low {
  color: #237804;
}

.memo-table-muted,
.memo-table-time {
  color: var(--console-text-secondary);
  font-size: 13px;
  white-space: nowrap;
}

.memo-row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1px;
}

.memo-row-actions :deep(.ant-btn) {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--console-text-secondary);
}

.memo-row-actions :deep(.ant-btn:hover) {
  color: var(--console-primary);
  background: var(--console-surface-hover);
}

.memo-table-empty {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  padding: 28px 18px;
  color: var(--console-text-secondary);
}

.memo-table-empty > svg {
  color: var(--console-text-tertiary);
}

.memo-table-empty strong {
  color: var(--console-text);
  font-size: 14px;
  font-weight: 600;
}

.memo-table-empty span {
  max-width: 420px;
  font-size: 13px;
  line-height: 1.65;
  text-align: center;
}

.memo-table-loading {
  display: block;
  padding: 48px 12px;
  color: var(--console-text-secondary);
  font-size: 13px;
  text-align: center;
}

.memo-help-list {
  display: grid;
  gap: 16px;
  margin: 0;
}

.memo-help-list > div {
  display: grid;
  gap: 4px;
}

.memo-help-list dt {
  color: var(--console-text);
  font-size: 14px;
  font-weight: 600;
}

.memo-help-list dd {
  margin: 0;
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

:deep(.memo-table .blog-table__toolbar) {
  padding: 12px 16px;
}

:global(.memo-help-dialog .ant-modal) {
  top: 24px;
  padding-bottom: 48px;
}

:deep(.memo-row-actions .ant-dropdown-menu-item > svg) {
  margin-inline-end: 8px;
  vertical-align: -2px;
}

@media (max-width: 900px) {
  .memo-page {
    height: auto;
  }

  .memo-table {
    flex: 0 0 auto;
  }

  .memo-toolbar__top {
    align-items: flex-start;
    flex-direction: column;
  }

  .memo-toolbar__identity {
    width: 100%;
  }

  .memo-toolbar__actions {
    width: 100%;
  }

  .memo-toolbar__actions :deep(.ant-btn) {
    flex: 1 1 0;
  }

  .memo-filter-keyword,
  .memo-filter-category {
    width: 100%;
    flex: 1 1 100%;
  }

  .memo-filter-select {
    flex: 1 1 calc(33.333% - 8px);
    min-width: 110px;
  }
}

@media (max-width: 640px) {
  .memo-toolbar__identity {
    align-items: center;
  }

  .memo-toolbar__identity h1 {
    flex: 0 0 auto;
    font-size: 17px;
  }

  .memo-toolbar__identity :deep(.ant-segmented) {
    width: 100%;
    overflow-x: auto;
  }

  .memo-toolbar__filters {
    align-items: stretch;
  }

  .memo-filter-select {
    flex: 1 1 calc(50% - 8px);
  }

  .memo-filter-reset {
    min-height: 32px;
  }

  :global(.memo-help-dialog .ant-modal) {
    top: 12px;
    padding-bottom: 32px;
  }
}
</style>
