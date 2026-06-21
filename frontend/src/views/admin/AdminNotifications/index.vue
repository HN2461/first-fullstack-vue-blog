<template>
  <section class="announce-page">
    <!-- 精简顶栏：标题 + 筛选 + 操作，一行搞定 -->
    <div class="announce-topbar">
      <h2 class="announce-title">公告管理</h2>
      <div class="announce-filters">
        <a-select
          v-model:value="filterLevel"
          placeholder="级别"
          class="announce-filter-select"
          allow-clear
        >
          <a-select-option value="info">普通提示</a-select-option>
          <a-select-option value="warning">重要警告</a-select-option>
          <a-select-option value="error">紧急高危</a-select-option>
        </a-select>
        <a-select
          v-model:value="filterIsActive"
          placeholder="状态"
          class="announce-filter-select"
          allow-clear
        >
          <a-select-option value="true">已上架</a-select-option>
          <a-select-option value="false">已下架</a-select-option>
        </a-select>
        <a-button size="small" class="announce-reset-btn" @click="resetFilters">
          <template #icon><ClearOutlined /></template>
          重置
        </a-button>
      </div>
      <a-button type="primary" class="announce-add-btn" @click="openCreateModal">
        <template #icon><PlusOutlined /></template>
        发布公告
      </a-button>
    </div>

    <!-- 批量操作栏：选中后内嵌在表格头部区域 -->
    <Transition name="batch-fade">
      <div v-if="selectedRowKeys.length > 0" class="announce-batch-bar">
        <span class="batch-hint">已选 <strong>{{ selectedRowKeys.length }}</strong> 项</span>
        <div class="batch-actions">
          <a-tooltip title="批量上架">
            <a-button type="text" size="small" class="batch-btn batch-btn--up" @click="handleBatchToggle(true)">
              <template #icon><PlayCircleOutlined /></template> 上架
            </a-button>
          </a-tooltip>
          <a-tooltip title="批量下架">
            <a-button type="text" size="small" class="batch-btn batch-btn--down" @click="handleBatchToggle(false)">
              <template #icon><StopOutlined /></template> 下架
            </a-button>
          </a-tooltip>
          <a-divider type="vertical" class="batch-divider" />
          <a-tooltip title="批量删除">
            <a-button type="text" size="small" class="batch-btn batch-btn--del" @click="handleBatchDelete">
              <template #icon><DeleteOutlined /></template> 删除
            </a-button>
          </a-tooltip>
          <a-button type="text" size="small" class="batch-btn batch-btn--close" @click="tableRef?.clearSelection()">取消</a-button>
        </div>
      </div>
    </Transition>

    <!-- 表格区：绝对主角 -->
    <BlogTable
      ref="tableRef"
      :api-fn="fetchAnnouncements"
      :columns="columns"
      :params="filterParams"
      :row-selection="true"
      :auto-load="true"
      :page-size="15"
      :page-sizes="['10', '15', '20', '50']"
      :show-column-setting="true"
      class="announce-table"
      @selection-change="onSelectionChange"
    >

      <template #bodyCell="{ column, record }">
        <!-- 标题列 -->
        <template v-if="column.key === 'title'">
          <div class="announce-title-cell">
            <span class="announce-title-text">{{ record.title }}</span>
          </div>
        </template>

        <!-- 级别列 -->
        <template v-else-if="column.key === 'level'">
          <a-tag :color="getLevelColor(record.level)" class="announce-level-tag">
            <span class="announce-level-dot" :style="{ background: getLevelDotColor(record.level) }" />
            {{ getLevelText(record.level) }}
          </a-tag>
        </template>

        <!-- 状态列 -->
        <template v-else-if="column.key === 'isActive'">
          <a-badge
            :status="record.isActive ? 'success' : 'default'"
            :text="record.isActive ? '已上架' : '已下架'"
          />
        </template>

        <!-- 时间列 -->
        <template v-else-if="column.key === 'createdAt'">
          <div class="announce-time-cell">
            <span>{{ formatDate(record.createdAt) }}</span>
          </div>
        </template>

        <!-- 已读人数列 -->
        <template v-else-if="column.key === 'viewCount'">
          <span class="announce-view-count">
            <EyeOutlined /> {{ record.readCount || 0 }}
          </span>
        </template>

        <!-- 操作列 -->
        <template v-else-if="column.key === 'action'">
          <div class="announce-actions">
            <a-tooltip title="详情">
              <a-button type="text" class="action-btn action-detail" @click="openDetailModal(record)">
                <template #icon><EyeOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="编辑">
              <a-button type="text" class="action-btn action-edit" @click="openEditModal(record)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip :title="record.isActive ? '下架' : '上架'">
              <a-button type="text" class="action-btn" :class="record.isActive ? 'action-disable' : 'action-enable'" @click="handleToggleActive(record)">
                <template #icon>
                  <StopOutlined v-if="record.isActive" />
                  <PlayCircleOutlined v-else />
                </template>
              </a-button>
            </a-tooltip>
            <a-divider type="vertical" class="action-divider" />
            <a-tooltip title="删除">
              <a-button type="text" class="action-btn action-delete" @click="handleDelete(record)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-tooltip>
          </div>
        </template>
      </template>
    </BlogTable>

    <!-- 新建 / 编辑弹窗 -->
    <a-modal
      v-model:open="formModalVisible"
      :title="editingId ? '编辑公告' : '发布公告'"
      :confirm-loading="submitting"
      width="680px"
      :mask-closable="false"
      centered
      class="announce-form-modal"
      @cancel="closeFormModal"
    >
      <template #footer>
        <a-button @click="closeFormModal">取消</a-button>
        <a-button :loading="submitting" @click="handleFormSubmit()">
          {{ editingId ? '保存修改' : '发布公告' }}
        </a-button>
        <a-button
          v-if="editingId"
          type="primary"
          :loading="repushing"
          @click="handleFormSubmit({ repush: true })"
        >
          保存并重新推送
        </a-button>
      </template>
      <a-form layout="vertical" class="announce-form">
        <a-form-item label="公告标题" required>
          <a-input
            v-model:value="form.title"
            placeholder="请输入公告标题"
            :maxlength="120"
            show-count
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="公告级别">
              <a-select v-model:value="form.level">
                <a-select-option value="info">
                  <span style="color: #1677ff">●</span> 普通提示
                </a-select-option>
                <a-select-option value="warning">
                  <span style="color: #fa8c16">●</span> 重要警告
                </a-select-option>
                <a-select-option value="error">
                  <span style="color: #f5222d">●</span> 紧急高危
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="上下架状态">
              <a-switch
                v-model:checked="form.isActive"
                checked-children="上架"
                un-checked-children="下架"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="公告内容" required>
          <a-textarea
            v-model:value="form.content"
            placeholder="请输入公告内容"
            :rows="8"
            :maxlength="10000"
            show-count
          />
        </a-form-item>

        <a-form-item label="关联链接">
          <a-input
            v-model:value="form.link"
            placeholder="可选，点击公告后跳转的链接"
          />
        </a-form-item>

        <a-form-item label="弹窗推送">
          <a-switch
            v-model:checked="form.autoPopup"
            checked-children="开启"
            un-checked-children="关闭"
          />
          <div class="announce-form-hint">开启后，公告发布时将对所有在线用户弹窗提醒（仅首次）</div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="detailData?.title || '公告详情'"
      :footer="null"
      width="640px"
      centered
      class="announce-detail-modal"
    >
      <template v-if="detailData">
        <div class="announce-detail-meta">
          <a-tag :color="getLevelColor(detailData.level)">
            {{ getLevelText(detailData.level) }}
          </a-tag>
          <a-badge
            :status="detailData.isActive ? 'success' : 'default'"
            :text="detailData.isActive ? '已上架' : '已下架'"
          />
          <span class="announce-detail-time">
            <ClockCircleOutlined /> 发布于 {{ formatDate(detailData.createdAt) }}
          </span>
          <span class="announce-detail-views">
            <EyeOutlined /> {{ detailData.readCount || 0 }} 人已读
          </span>
        </div>
        <a-divider style="margin: 16px 0" />
        <div class="announce-detail-content">{{ detailData.content }}</div>
        <div v-if="detailData.link" class="announce-detail-link">
          <LinkOutlined /> <a :href="detailData.link" target="_blank">{{ detailData.link }}</a>
        </div>
        <div v-if="detailData.autoPopup" class="announce-detail-popup-badge">
          <a-tag color="purple">弹窗推送已开启</a-tag>
        </div>
      </template>
    </a-modal>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {
  ClockCircleOutlined,
  ClearOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LinkOutlined,
  PlusOutlined,
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  batchDeleteAnnouncements,
  batchToggleAnnouncement,
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminAnnouncement,
  listAdminAnnouncements,
  updateAdminAnnouncement
} from '@/services/admin'
import { useAdminActions, useUnsavedChanges } from '@/composables/useAdminUi'

const tableRef = ref(null)
const selectedRowKeys = ref([])
const detailLoading = ref(false)
const rowActionKey = ref('')
const { runAction, warn, confirmAction } = useAdminActions()

// 筛选
const filterLevel = ref(undefined)
const filterIsActive = ref(undefined)

const filterParams = computed(() => ({
  level: filterLevel.value,
  isActive: filterIsActive.value
}))

// 表单弹窗
const formModalVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const repushing = ref(false)
const form = reactive({
  title: '',
  content: '',
  link: '',
  level: 'info',
  isActive: true,
  autoPopup: false
})
const { isDirty: formDirty, markClean: markFormClean, pauseTracking: pauseFormTracking } = useUnsavedChanges({
  getSnapshot: () => ({
    title: form.title,
    content: form.content,
    link: form.link,
    level: form.level,
    isActive: form.isActive,
    autoPopup: form.autoPopup
  }),
  enabled: () => formModalVisible.value && !submitting.value && !repushing.value,
  title: '关闭公告编辑？',
  content: '公告表单还有未保存修改，关闭后将丢失当前输入。',
  okText: '仍然关闭'
})

// 详情弹窗
const detailModalVisible = ref(false)
const detailData = ref(null)

// 级别映射
const levelMap = {
  info: { text: '普通提示', color: 'blue', dot: '#1677ff' },
  warning: { text: '重要警告', color: 'orange', dot: '#fa8c16' },
  error: { text: '紧急高危', color: 'red', dot: '#f5222d' }
}

function getLevelText(level) {
  return levelMap[level]?.text || '普通提示'
}

function getLevelColor(level) {
  return levelMap[level]?.color || 'blue'
}

function getLevelDotColor(level) {
  return levelMap[level]?.dot || '#1677ff'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 表格列
const columns = [
  { title: '公告标题', key: 'title', dataIndex: 'title', ellipsis: true },
  { title: '级别', key: 'level', width: 110, align: 'center' },
  { title: '状态', key: 'isActive', width: 90, align: 'center' },
  { title: '发布时间', key: 'createdAt', width: 170 },
  { title: '已读', key: 'viewCount', width: 80, align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center', fixed: 'right' }
]

// 数据加载（适配 BlogTable 的 apiFn 格式）
async function fetchAnnouncements(params) {
  const result = await listAdminAnnouncements(params)
  return { items: result.items || [], total: result.total || 0 }
}

// 筛选重置
function resetFilters() {
  filterLevel.value = undefined
  filterIsActive.value = undefined
}

// 行选择
function onSelectionChange(keys) {
  selectedRowKeys.value = keys
}

// 新建弹窗
function openCreateModal() {
  editingId.value = null
  form.title = ''
  form.content = ''
  form.link = ''
  form.level = 'info'
  form.isActive = true
  form.autoPopup = false
  formModalVisible.value = true
  markFormClean()
}

// 编辑弹窗
function openEditModal(record) {
  editingId.value = record.id
  form.title = record.title
  form.content = record.content
  form.link = record.link || ''
  form.level = record.level || 'info'
  form.isActive = record.isActive !== false
  form.autoPopup = record.autoPopup || false
  formModalVisible.value = true
  markFormClean()
}

function closeFormModal() {
  if (formDirty.value) {
    confirmAction({
      title: '关闭公告编辑？',
      content: '当前公告还有未保存修改，关闭后将丢失当前输入。',
      okText: '仍然关闭',
      async onOk() {
        pauseFormTracking()
        formModalVisible.value = false
      }
    }).catch(() => {})
    return
  }

  pauseFormTracking()
  formModalVisible.value = false
}

// 提交表单
async function handleFormSubmit({ repush = false } = {}) {
  if (!form.title.trim()) {
    warn('请输入公告标题')
    return
  }
  if (!form.content.trim()) {
    warn('请输入公告内容')
    return
  }

  submitting.value = !repush
  repushing.value = repush
  try {
    const payload = repush
      ? { ...form, isActive: true, repush: true }
      : form

    await runAction(() => (
      editingId.value
        ? updateAdminAnnouncement(editingId.value, payload)
        : createAdminAnnouncement(payload)
    ), {
      successMessage: repush ? '公告已保存并重新推送' : (editingId.value ? '公告已更新' : '公告已发布'),
      errorMessage: '操作失败'
    })
    markFormClean()
    pauseFormTracking()
    formModalVisible.value = false
    tableRef.value?.refresh()
  } finally {
    submitting.value = false
    repushing.value = false
  }
}

// 详情弹窗
async function openDetailModal(record) {
  detailLoading.value = true
  try {
    const detail = await runAction(() => getAdminAnnouncement(record.id), {
      errorMessage: '获取详情失败'
    })
    detailData.value = detail
    detailModalVisible.value = true
  } finally {
    detailLoading.value = false
  }
}

// 上架 / 下架
async function handleToggleActive(record) {
  rowActionKey.value = `toggle:${record.id}`
  try {
    await runAction(() => updateAdminAnnouncement(record.id, { isActive: !record.isActive }), {
      successMessage: record.isActive ? '已下架' : '已上架',
      errorMessage: '操作失败',
      onSuccess: () => tableRef.value?.refresh()
    })
  } finally {
    rowActionKey.value = ''
  }
}

// 删除
function handleDelete(record) {
  confirmAction({
    title: '确认删除',
    content: `确定要删除公告「${record.title}」吗？删除后不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    async onOk() {
      rowActionKey.value = `delete:${record.id}`
      try {
        await runAction(() => deleteAdminAnnouncement(record.id), {
          successMessage: '公告已删除',
          errorMessage: '删除失败',
          onSuccess: () => tableRef.value?.refresh()
        })
      } finally {
        rowActionKey.value = ''
      }
    }
  }).catch(() => {})
}

// 批量操作
async function handleBatchToggle(isActive) {
  confirmAction({
    title: isActive ? '批量上架' : '批量下架',
    content: `确定要${isActive ? '上架' : '下架'} ${selectedRowKeys.value.length} 条公告吗？`,
    okText: '确认',
    async onOk() {
      await runAction(() => batchToggleAnnouncement(selectedRowKeys.value, isActive), {
        successMessage: `已${isActive ? '上架' : '下架'}所选公告`,
        errorMessage: '操作失败',
        onSuccess: () => {
          selectedRowKeys.value = []
          tableRef.value?.clearSelection()
          tableRef.value?.refresh()
        }
      })
    }
  }).catch(() => {})
}

function handleBatchDelete() {
  confirmAction({
    title: '批量删除',
    content: `确定要删除 ${selectedRowKeys.value.length} 条公告吗？删除后不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    async onOk() {
      await runAction(() => batchDeleteAnnouncements(selectedRowKeys.value), {
        successMessage: '已删除所选公告',
        errorMessage: '删除失败',
        onSuccess: () => {
          selectedRowKeys.value = []
          tableRef.value?.clearSelection()
          tableRef.value?.refresh()
        }
      })
    }
  }).catch(() => {})
}
</script>

<style scoped>
/* ===== 页面容器：表格是绝对主角 ===== */
.announce-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  overflow: hidden;
}

/* ===== 精简顶栏：一行搞定 ===== */
.announce-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
  flex-shrink: 0;
}

.announce-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--console-text);
  white-space: nowrap;
  line-height: 32px;
}

.announce-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.announce-filter-select {
  width: 120px;
  border-radius: 6px;
}

.announce-reset-btn {
  border-radius: 6px;
}

.announce-add-btn {
  flex-shrink: 0;
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
}

/* ===== 表格区域 ===== */
.announce-table {
  flex: 1 1 0;
  min-height: 0;
}

.announce-table :deep(.blog-table) {
  border: 1px solid var(--console-border);
  border-radius: 12px;
  overflow: hidden;
}

/* ===== 批量操作栏：轻量嵌入风格 ===== */
.announce-batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 8px 16px;
  background: var(--console-surface-muted, #fafafa);
  border-bottom: 1px solid var(--console-border, #f0f0f0);
  font-size: 13px;
}

.batch-hint {
  color: var(--console-text-secondary);
  font-size: 13px;
}

.batch-hint strong {
  color: var(--console-primary-strong);
  font-weight: 600;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.batch-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 5px;
  color: var(--console-text-secondary);
  transition: all 0.15s ease;
}

.batch-btn:hover:not(:disabled) {
  background: var(--console-surface-hover);
  color: var(--console-text);
}

.batch-btn--up {
  color: #52c41a;
}

.batch-btn--up:hover:not(:disabled) {
  background: rgba(82, 196, 26, 0.08);
}

.batch-btn--down {
  color: #faad14;
}

.batch-btn--down:hover:not(:disabled) {
  background: rgba(250, 173, 20, 0.08);
}

.batch-btn--del {
  color: #ff4d4f;
}

.batch-btn--del:hover:not(:disabled) {
  background: rgba(255, 77, 79, 0.08);
}

.batch-btn--close {
  margin-left: 4px;
  color: var(--console-text-tertiary, #999);
}

.batch-divider {
  margin: 0 6px;
  height: 14px;
  background: var(--console-border-light, #e8e8e8);
}

/* 过渡动画 */
.batch-fade-enter-active,
.batch-fade-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.batch-fade-enter-from,
.batch-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ===== 操作按钮：图标风格 ===== */
.announce-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
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

.action-detail {
  color: var(--console-text-secondary);
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

/* ===== 单元格内容 ===== */
.announce-title-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.announce-title-text {
  font-weight: 600;
  font-size: 14px;
  color: var(--console-text);
  line-height: 1.5;
}

/* 级别标签 */
.announce-level-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
}

.announce-level-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

/* 时间 */
.announce-time-cell {
  font-size: 13px;
  color: var(--console-text-secondary);
}

/* 阅读量 */
.announce-view-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--console-text-secondary);
}

/* 表单弹窗 */
.announce-form-modal :deep(.ant-modal-body) {
  padding: 24px 28px;
}

.announce-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

.announce-form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--console-text-secondary);
  line-height: 1.6;
}

/* 详情弹窗 */
.announce-detail-modal :deep(.ant-modal-body) {
  padding: 24px 28px;
}

.announce-detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.announce-detail-time,
.announce-detail-views {
  font-size: 13px;
  color: var(--console-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.announce-detail-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.8;
  color: var(--console-text);
}

.announce-detail-link {
  margin-top: 16px;
  font-size: 13px;
  color: var(--console-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.announce-detail-popup-badge {
  margin-top: 12px;
}

/* ===== 表格行细节 ===== */
.announce-table :deep(.ant-table-thead > tr > th) {
  height: 46px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  border-bottom: 1px solid var(--console-border);
}

.announce-table :deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  vertical-align: top;
  border-bottom: 1px solid var(--console-border-light, #f0f0f0);
  transition: background 0.15s ease;
}

.announce-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--console-surface-hover, #fafafa);
}

.announce-table :deep(.ant-tag) {
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .announce-topbar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .announce-filters {
    order: 3;
    flex-basis: 100%;
  }
}
</style>
