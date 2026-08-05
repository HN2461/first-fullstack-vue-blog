<template>
  <section class="announce-page">
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
      empty-text="暂无公告"
      class="announce-table"
      @selection-change="onSelectionChange"
    >
      <template #toolbar>
        <div class="announce-topbar">
          <h2 class="announce-title">公告管理</h2>
          <div class="announce-filters">
            <a-select
              v-model:value="filterLevel"
              placeholder="级别"
              class="announce-filter-select"
              allow-clear
            >
              <a-select-option value="info">功能更新</a-select-option>
              <a-select-option value="warning">重要提醒</a-select-option>
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
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <div class="announce-title-cell">
            <span class="announce-title-text">{{ record.title }}</span>
          </div>
        </template>

        <template v-else-if="column.key === 'level'">
          <a-tag :color="getLevelColor(record.level)" class="announce-level-tag">
            <span class="announce-level-dot" :style="{ background: getLevelDotColor(record.level) }" />
            {{ getLevelText(record.level) }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'isActive'">
          <a-badge
            :status="record.isActive ? 'success' : 'default'"
            :text="record.isActive ? '已上架' : '已下架'"
          />
        </template>

        <template v-else-if="column.key === 'createdAt'">
          <div class="announce-time-cell">
            <span>{{ formatDate(record.createdAt) }}</span>
          </div>
        </template>

        <template v-else-if="column.key === 'viewCount'">
          <span class="announce-view-count">
            <EyeOutlined /> {{ record.readCount || 0 }}
          </span>
        </template>

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

    <AdminAnnouncementFormModal
      :open="formModalVisible"
      :editing-id="editingId"
      :form="form"
      :submitting="submitting"
      :repushing="repushing"
      @close="closeFormModal"
      @submit="handleFormSubmit"
    />

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
        <div class="announce-detail-content">
          <AnnouncementContent :content="detailData.content" />
        </div>
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
import './styles.css'
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
import AnnouncementContent from '@/components/announcement/AnnouncementContent.vue'
import AdminAnnouncementFormModal from './AdminAnnouncementFormModal.vue'
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

const filterLevel = ref(undefined)
const filterIsActive = ref(undefined)

const filterParams = computed(() => ({
  level: filterLevel.value,
  isActive: filterIsActive.value
}))

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

const detailModalVisible = ref(false)
const detailData = ref(null)

const levelMap = {
  info: { text: '功能更新', color: 'blue', dot: '#1677ff' },
  warning: { text: '重要提醒', color: 'orange', dot: '#fa8c16' },
  error: { text: '紧急高危', color: 'red', dot: '#f5222d' }
}

function getLevelText(level) {
  return levelMap[level]?.text || '功能更新'
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

const columns = [
  { title: '公告标题', key: 'title', dataIndex: 'title', ellipsis: true },
  { title: '级别', key: 'level', width: 110, align: 'center' },
  { title: '状态', key: 'isActive', width: 90, align: 'center' },
  { title: '发布时间', key: 'createdAt', width: 170 },
  { title: '已读', key: 'viewCount', width: 80, align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center', fixed: 'right' }
]

async function fetchAnnouncements(params) {
  const result = await listAdminAnnouncements(params)
  return { items: result.items || [], total: result.total || 0 }
}

function resetFilters() {
  filterLevel.value = undefined
  filterIsActive.value = undefined
}

function onSelectionChange(keys) {
  selectedRowKeys.value = keys
}

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
    if (form.autoPopup) {
      window.dispatchEvent(new CustomEvent('announcement-popup-refresh'))
    }
  } finally {
    submitting.value = false
    repushing.value = false
  }
}

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
