<template>
  <div class="trash-page">
    <BlogTable
      ref="tableRef"
      :api-fn="loadTrash"
      :columns="columns"
      :auto-load="true"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
      row-selection
      @selection-change="handleSelectionChange"
    >
      <template #toolbar>
        <a-tooltip title="回收站中的文章不会在前台显示，可恢复或彻底删除。">
          <a-button shape="circle">
            <template #icon><QuestionCircleOutlined /></template>
          </a-button>
        </a-tooltip>
        <BatchActionBar :count="selectedTrashIds.length" @clear="clearSelection">
          <a-button size="small" @click="handleBatchRestore">批量恢复</a-button>
          <a-button size="small" danger @click="confirmBatchPermanentDelete">批量彻底删除</a-button>
        </BatchActionBar>
        <a-button
          v-if="tableRef?.getData()?.length > 0"
          danger
          @click="confirmEmptyTrash"
        >
          <template #icon><DeleteOutlined /></template>
          清空回收站
        </a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <!-- 标题列 -->
        <template v-if="column.key === 'title'">
          <div class="article-title-cell">
            <span class="article-title">{{ record.title }}</span>
            <span class="article-summary">{{ record.summary || '暂无摘要' }}</span>
          </div>
        </template>

        <!-- 分类列 -->
        <template v-else-if="column.key === 'category'">
          <a-tag v-if="record.category?.name">{{ record.category.name }}</a-tag>
          <span v-else class="text-muted">未分类</span>
        </template>

        <!-- 删除时间列 -->
        <template v-else-if="column.key === 'deletedAt'">
          <div class="time-cell">
            <span>{{ formatDate(record.deletedAt) }}</span>
            <span class="time-ago">{{ formatTimeAgo(record.deletedAt) }}</span>
          </div>
        </template>

        <!-- 操作列 -->
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleRestore(record)">
              <template #icon><UndoOutlined /></template>
              恢复
            </a-button>
            <a-button type="link" size="small" danger @click="confirmPermanentDelete(record)">
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
import { ref } from 'vue'
import {
  UndoOutlined,
  DeleteOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import {
  batchPermanentDeleteArticles,
  batchRestoreArticles,
  listTrashArticles,
  restoreArticle,
  permanentDeleteArticle,
  emptyTrash
} from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const tableRef = ref(null)
const actionLoadingKey = ref('')
const selectedTrashIds = ref([])
const { runAction, confirmAction } = useAdminActions()

const columns = [
  {
    title: '文章标题',
    key: 'title',
    dataIndex: 'title',
    width: '35%'
  },
  {
    title: '分类',
    key: 'category',
    width: 120
  },
  {
    title: '原状态',
    key: 'status',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => {
      const map = { published: '已发布', draft: '草稿', archived: '已下架' }
      return map[text] || text
    }
  },
  {
    title: '删除时间',
    key: 'deletedAt',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 180
  }
]

// 格式化时间
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

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return ''
}

// 加载回收站（作为 apiFn 传给 BlogTable）
async function loadTrash(params) {
  return await listTrashArticles(params)
}

function handleSelectionChange(keys) {
  selectedTrashIds.value = keys || []
}

function clearSelection() {
  selectedTrashIds.value = []
  tableRef.value?.clearSelection?.()
}

// 恢复文章
async function handleRestore(record) {
  actionLoadingKey.value = `restore:${record.id}`
  try {
    await runAction(() => restoreArticle(record.id), {
      successMessage: `文章「${record.title}」已恢复`,
      errorMessage: '恢复失败',
      onSuccess: () => tableRef.value?.refresh()
    })
  } finally {
    actionLoadingKey.value = ''
  }
}

// 彻底删除
function confirmPermanentDelete(record) {
  confirmAction({
    title: '彻底删除',
    content: `确定要彻底删除文章「${record.title}」吗？此操作不可恢复！`,
    okText: '彻底删除',
    okType: 'danger',
    async onOk() {
      actionLoadingKey.value = `permanent:${record.id}`
      try {
        await runAction(() => permanentDeleteArticle(record.id), {
          successMessage: '文章已彻底删除',
          errorMessage: '删除失败',
          onSuccess: () => tableRef.value?.refresh()
        })
      } finally {
        actionLoadingKey.value = ''
      }
    }
  }).catch(() => {})
}

function handleBatchRestore() {
  if (selectedTrashIds.value.length === 0) return

  confirmAction({
    title: '批量恢复文章',
    content: `确定恢复选中的 ${selectedTrashIds.value.length} 篇文章吗？`,
    okText: '恢复',
    async onOk() {
      const ids = [...selectedTrashIds.value]
      await runAction(() => batchRestoreArticles(ids), {
        successMessage: '文章已批量恢复',
        errorMessage: '批量恢复失败',
        onSuccess: () => {
          clearSelection()
          tableRef.value?.refresh()
        }
      })
    }
  }).catch(() => {})
}

function confirmBatchPermanentDelete() {
  if (selectedTrashIds.value.length === 0) return

  confirmAction({
    title: '批量彻底删除',
    content: `确定彻底删除选中的 ${selectedTrashIds.value.length} 篇文章吗？此操作不可恢复。`,
    okText: '彻底删除',
    okType: 'danger',
    async onOk() {
      const ids = [...selectedTrashIds.value]
      await runAction(() => batchPermanentDeleteArticles(ids), {
        successMessage: '文章已批量彻底删除',
        errorMessage: '批量彻底删除失败',
        onSuccess: () => {
          clearSelection()
          tableRef.value?.refresh()
        }
      })
    }
  }).catch(() => {})
}

// 清空回收站
function confirmEmptyTrash() {
  confirmAction({
    title: '清空回收站',
    content: '确定要清空回收站吗？所有文章将被永久删除，此操作不可恢复！',
    okText: '确认清空',
    okType: 'danger',
    async onOk() {
      actionLoadingKey.value = 'empty-trash'
      try {
        const result = await runAction(() => emptyTrash(), {
          errorMessage: '清空失败'
        })
        await runAction(() => Promise.resolve(result), {
          successMessage: `已清空 ${result.deletedCount || 0} 条记录`,
          onSuccess: () => tableRef.value?.refresh()
        })
      } finally {
        actionLoadingKey.value = ''
      }
    }
  }).catch(() => {})
}
</script>

<style scoped>
.trash-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  overflow: hidden;
}

.article-title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.article-title {
  font-weight: 500;
  color: #1a1a1a;
}

.article-summary {
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.time-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-cell span:first-child {
  font-size: 13px;
  color: #333;
}

.time-ago {
  font-size: 11px;
  color: #bfbfbf;
}

.text-muted {
  color: #bfbfbf;
  font-size: 13px;
}
</style>
