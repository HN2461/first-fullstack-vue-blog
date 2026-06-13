<template>
  <div class="trash-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>回收站</h2>
        <span class="header-desc">已删除的文章，可恢复或彻底删除</span>
      </div>
      <div class="header-right">
        <a-button @click="loadTrash">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button
          v-if="articles.length > 0"
          danger
          @click="confirmEmptyTrash"
        >
          <template #icon><DeleteOutlined /></template>
          清空回收站
        </a-button>
      </div>
    </div>

    <!-- 提示信息 -->
    <a-alert
      message="回收站说明"
      description="回收站中的文章不会在前台显示。您可以恢复文章使其重新发布，或彻底删除（此操作不可恢复）。"
      type="info"
      show-icon
      style="margin-bottom: 16px"
    />

    <!-- 文章表格 -->
    <div class="table-wrapper">
      <a-table
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data-source="articles"
        :pagination="{ pageSize: 10, showSizeChanger: false }"
      >
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
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  ReloadOutlined,
  UndoOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { listTrashArticles, restoreArticle, permanentDeleteArticle, emptyTrash } from '@/services/admin'

const loading = ref(false)
const articles = ref([])

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

// 加载回收站
async function loadTrash() {
  loading.value = true
  try {
    articles.value = await listTrashArticles()
  } catch (error) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 恢复文章
async function handleRestore(record) {
  try {
    await restoreArticle(record.id)
    message.success(`文章「${record.title}」已恢复`)
    loadTrash()
  } catch (error) {
    message.error(error.message || '恢复失败')
  }
}

// 彻底删除（用 Modal.confirm 替代 a-popconfirm）
function confirmPermanentDelete(record) {
  Modal.confirm({
    title: '彻底删除',
    content: `确定要彻底删除文章「${record.title}」吗？此操作不可恢复！`,
    okText: '彻底删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await permanentDeleteArticle(record.id)
        message.success('文章已彻底删除')
        loadTrash()
      } catch (error) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

// 清空回收站（用 Modal.confirm 替代 a-popconfirm）
function confirmEmptyTrash() {
  Modal.confirm({
    title: '清空回收站',
    content: '确定要清空回收站吗？所有文章将被永久删除，此操作不可恢复！',
    okText: '确认清空',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        const result = await emptyTrash()
        message.success(`已清空 ${result.deletedCount || 0} 条记录`)
        loadTrash()
      } catch (error) {
        message.error(error.message || '清空失败')
      }
    }
  })
}

onMounted(loadTrash)
</script>

<style scoped>
.trash-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #1a1a1a;
}

.header-desc {
  font-size: 13px;
  color: #8c8c8c;
}

.table-wrapper {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
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
