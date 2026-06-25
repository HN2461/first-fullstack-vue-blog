<template>
  <a-modal
    :open="open"
    title="媒体回收站"
    :footer="null"
    width="820px"
    centered
    :body-style="{ maxHeight: '72vh', overflow: 'hidden', paddingBottom: '16px' }"
    @update:open="emit('update:open', $event)"
    @cancel="handleCancel"
  >
    <div class="media-trash">
      <BlogTable
        ref="tableRef"
        :api-fn="loadTrash"
        :columns="columns"
        :auto-load="open"
        :page-size="10"
        :page-sizes="['10', '20', '50']"
        :scroll="{ x: 720 }"
        :row-selection="trashRowSelection"
        height="520px"
        empty-text="回收站暂无媒体资源"
        @selection-change="handleSelectionChange"
      >
        <template #toolbar>
          <div class="media-trash__toolbar">
            <span>
              普通删除的资源会保留在回收站，彻底删除后会同步移除服务器磁盘文件。
              <b v-if="selectedTrashKeys.length">已选择 {{ selectedTrashKeys.length }} 个</b>
            </span>
            <a-space>
              <a-button
                size="small"
                :disabled="selectedTrashKeys.length === 0"
                @click="handleBatchRestoreTrash"
              >
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
              <strong :title="record.originalName">{{ record.originalName }}</strong>
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
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue'
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

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'changed'])

const tableRef = ref(null)
const selectedTrashKeys = ref([])
const trashTotal = ref(0)
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

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
    selectedTrashKeys.value = []
    tableRef.value?.reload?.()
  }
)

async function loadTrash(params = {}) {
  const result = await runAction(() => listTrashMedia(params), {
    errorMessage: '回收站加载失败'
  })
  trashTotal.value = result.total || 0
  selectedTrashKeys.value = selectedTrashKeys.value.filter((id) =>
    (result.items || []).some((item) => item.id === id)
  )
  return result
}

function handleSelectionChange(keys) {
  selectedTrashKeys.value = keys
}

function handleCancel() {
  selectedTrashKeys.value = []
  emit('update:open', false)
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
  min-height: 520px;
}

.media-trash__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  color: #64748b;
  font-size: 13px;
}

.media-trash__toolbar > span {
  min-width: 240px;
  flex: 1;
  line-height: 1.6;
}

.media-trash__toolbar b {
  margin-left: 8px;
  color: #2563eb;
  font-weight: 600;
}

.media-trash-file {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.media-trash-file strong {
  overflow: hidden;
  color: #1e293b;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-trash-file span {
  color: #94a3b8;
  font-size: 12px;
}

.media-time {
  color: #64748b;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

:deep(.dark-theme) .media-trash__toolbar {
  color: var(--console-text-secondary);
}

:deep(.dark-theme) .media-trash__toolbar b {
  color: var(--console-primary-strong);
}

:deep(.dark-theme) .media-trash-file strong {
  color: var(--console-text);
}

:deep(.dark-theme) .media-trash-file span,
:deep(.dark-theme) .media-time {
  color: var(--console-text-secondary) !important;
}

@media (max-width: 768px) {
  .media-trash__toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
