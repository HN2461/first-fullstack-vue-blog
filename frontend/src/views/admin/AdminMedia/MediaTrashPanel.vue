<template>
  <div class="media-trash">
    <a-alert v-if="loadError" :message="loadError" type="error" show-icon>
      <template #action><a-button size="small" @click="refreshTrash">重试</a-button></template>
    </a-alert>
    <BlogTable
      ref="tableRef"
      :api-fn="loadTrash"
      :columns="columns"
      :auto-load="true"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
      :scroll="{ x: 720 }"
      :row-selection="trashRowSelection"
      height="100%"
      :empty-text="loadError ? '加载失败，请重试' : '回收站暂无媒体资源'"
      @selection-change="handleSelectionChange"
    >
      <template #toolbar>
        <div class="media-trash__toolbar">
          <div class="media-trash__context">
            <div>
              <strong>回收站资源</strong>
              <a-tooltip title="移入回收站保留文件；彻底删除会移除原件，仍受业务使用关系保护。">
                <QuestionCircleOutlined aria-label="回收站删除规则" />
              </a-tooltip>
            </div>
            <a-tag v-if="selectedTrashKeys.length" :bordered="false" color="blue">
              已选择 {{ selectedTrashKeys.length }} 个
            </a-tag>
          </div>
          <a-space wrap size="small">
            <a-button size="small" :disabled="selectedTrashKeys.length === 0" @click="handleBatchRestoreTrash">
              <template #icon><ReloadOutlined /></template>
              批量恢复
            </a-button>
            <a-button
              size="small"
              danger
              :disabled="selectedTrashKeys.length === 0"
              @click="handleBatchPermanentDelete"
            >
              <template #icon><DeleteOutlined /></template>
              批量彻底删除
            </a-button>
            <a-button size="small" danger :disabled="trashTotal === 0" @click="handleEmptyTrash">
              <template #icon><DeleteOutlined /></template>
              清空回收站
            </a-button>
          </a-space>
        </div>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'asset'">
          <div class="media-trash-file">
            <strong>{{ record.originalName }}</strong>
            <span>{{ record.category || '未分类' }} · {{ formatFileSize(record.size) }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'deletedAt'">
          <span class="media-time">{{ formatDate(record.deletedAt) }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-button type="link" size="small" @click="handleRestoreTrash(record)">
              <template #icon><ReloadOutlined /></template>
              恢复
            </a-button>
            <a-button type="link" size="small" danger @click="handlePermanentDelete(record)">
              <template #icon><DeleteOutlined /></template>
              彻底删除
            </a-button>
          </a-space>
        </template>
      </template>
    </BlogTable>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { DeleteOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  batchPermanentDeleteAdminMedia,
  batchRestoreAdminMedia,
  emptyMediaTrash,
  listTrashMedia,
  permanentDeleteAdminMedia,
  restoreAdminMedia
} from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const emit = defineEmits(['changed'])

const tableRef = ref(null)
const selectedTrashKeys = ref([])
const trashTotal = ref(0)
const loadError = ref('')
const { runAction, confirmAction } = useAdminActions()

const columns = [
  {
    title: '文件',
    key: 'asset',
    width: 300,
    fixed: 'left'
  },
  {
    title: '删除时间',
    key: 'deletedAt',
    width: 180,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    align: 'center',
    fixed: 'right'
  }
]

const trashRowSelection = computed(() => ({
  fixed: true,
  selectedRowKeys: selectedTrashKeys.value
}))

async function loadTrash(params = {}) {
  loadError.value = ''
  try {
    const result = await listTrashMedia(params)
    trashTotal.value = result.total || 0
    selectedTrashKeys.value = []
    return result
  } catch (reason) {
    loadError.value = reason.message || '回收站加载失败'
    trashTotal.value = 0
    selectedTrashKeys.value = []
    return { items: [], total: 0 }
  }
}

function handleSelectionChange(keys) {
  selectedTrashKeys.value = keys
}

function refreshTrash(resetPage = false) {
  if (resetPage) {
    tableRef.value?.reload?.()
    return
  }
  tableRef.value?.refresh?.()
}

function notifyChanged(resetPage = false) {
  emit('changed')
  refreshTrash(resetPage)
}

function handleRestoreTrash(record) {
  confirmAction({
    title: '恢复媒体文件',
    content: `确认恢复「${record.originalName}」到媒体库？`,
    okText: '恢复',
    async onOk() {
      await runAction(() => restoreAdminMedia(record.id), {
        successMessage: '媒体文件已恢复',
        errorMessage: '恢复失败',
        onSuccess: () => {
          selectedTrashKeys.value = selectedTrashKeys.value.filter((id) => id !== record.id)
          notifyChanged()
        }
      })
    }
  }).catch(() => {})
}

function handlePermanentDelete(record) {
  confirmAction({
    title: '彻底删除媒体文件',
    content: `彻底删除「${record.originalName}」会同步删除数据库记录和服务器磁盘文件，无法恢复。`,
    okText: '彻底删除',
    okType: 'danger',
    async onOk() {
      await runAction(() => permanentDeleteAdminMedia(record.id), {
        successMessage: '媒体文件已彻底删除',
        errorMessage: '彻底删除失败',
        onSuccess: () => {
          selectedTrashKeys.value = selectedTrashKeys.value.filter((id) => id !== record.id)
          notifyChanged()
        }
      })
    }
  }).catch(() => {})
}

function handleBatchRestoreTrash() {
  const ids = [...selectedTrashKeys.value]
  if (!ids.length) return

  confirmAction({
    title: '批量恢复媒体文件',
    content: `确认恢复选中的 ${ids.length} 个媒体文件到媒体库？`,
    okText: '批量恢复',
    async onOk() {
      await runAction(() => batchRestoreAdminMedia(ids), {
        successMessage: `已恢复 ${ids.length} 个媒体文件`,
        errorMessage: '批量恢复失败',
        onSuccess: () => {
          selectedTrashKeys.value = []
          notifyChanged(true)
        }
      })
    }
  }).catch(() => {})
}

function handleBatchPermanentDelete() {
  const ids = [...selectedTrashKeys.value]
  if (!ids.length) return

  confirmAction({
    title: '批量彻底删除媒体文件',
    content: `彻底删除选中的 ${ids.length} 个媒体文件会同步删除数据库记录和服务器磁盘文件，无法恢复。`,
    okText: '批量彻底删除',
    okType: 'danger',
    async onOk() {
      await runAction(() => batchPermanentDeleteAdminMedia(ids), {
        successMessage: `已彻底删除 ${ids.length} 个媒体文件`,
        errorMessage: '批量彻底删除失败',
        onSuccess: () => {
          selectedTrashKeys.value = []
          notifyChanged(true)
        }
      })
    }
  }).catch(() => {})
}

function handleEmptyTrash() {
  confirmAction({
    title: '清空媒体回收站',
    content: '清空后会批量删除回收站内媒体的数据库记录和服务器磁盘文件，无法恢复。',
    okText: '清空回收站',
    okType: 'danger',
    async onOk() {
      await runAction(() => emptyMediaTrash(), {
        successMessage: '媒体回收站已清空',
        errorMessage: '清空回收站失败',
        onSuccess: () => {
          selectedTrashKeys.value = []
          notifyChanged(true)
        }
      })
    }
  }).catch(() => {})
}

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }
  return `${Math.ceil(size / 1024)} KB`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}
</script>

<style scoped>
.media-trash {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  flex: 1;
  gap: 8px;
}

.media-trash > :deep(.blog-table) {
  flex: 1 1 0;
  min-height: 0;
}
@media (max-width: 900px) {
  .media-trash {
    overflow: auto;
  }
  .media-trash > :deep(.blog-table) {
    flex: 1 0 auto;
  }
}

.media-trash__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  color: var(--text-secondary);
}

.media-trash__context {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.media-trash__context > div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.media-trash__context strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
}

.media-trash__context span {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.media-trash-file {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.media-trash-file strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-trash-file span {
  color: var(--text-secondary);
  font-size: 12px;
}

.media-time {
  color: var(--text-secondary);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .media-trash__toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .media-trash__context {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
