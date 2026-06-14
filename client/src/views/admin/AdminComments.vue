<template>
  <section class="comment-review-page">
    <!-- 精简顶栏 -->
    <div class="comment-topbar">
      <h2 class="comment-title">评论审核</h2>
      <div class="comment-filters">
        <span class="filter-label">状态</span>
        <a-select v-model:value="status" class="status-select">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="pending">待审核</a-select-option>
          <a-select-option value="visible">已展示</a-select-option>
          <a-select-option value="rejected">已驳回</a-select-option>
          <a-select-option value="hidden">已隐藏</a-select-option>
        </a-select>
      </div>
    </div>

    <!-- 表格区：绝对主角 -->
    <BlogTable
      ref="tableRef"
      :api-fn="fetchComments"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="15"
      :page-sizes="['10', '15', '20', '50']"
      :show-column-setting="true"
      class="comment-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'content'">
          <p class="comment-content">{{ record.content }}</p>
          <div class="table-summary">文章：{{ record.article?.title || '未知文章' }}</div>
        </template>
        <template v-else-if="column.key === 'user'">
          <a-typography-text strong>{{ record.user?.username || '未知用户' }}</a-typography-text>
          <div class="table-summary">{{ record.user?.email || '无邮箱信息' }}</div>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
        </template>
        <template v-else-if="column.key === 'risk'">
          <a-space wrap>
            <a-tag v-if="!record.riskReasons?.length">正常</a-tag>
            <a-tag v-for="reason in record.riskReasons" v-else :key="reason" color="red">{{ reason }}</a-tag>
          </a-space>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="comment-actions">
            <a-tooltip title="通过">
              <a-button type="text" class="action-btn action-approve" @click="review(record.id, 'approve')">
                <template #icon><CheckCircleOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="驳回">
              <a-button type="text" class="action-btn action-reject" @click="review(record.id, 'reject')">
                <template #icon><CloseCircleOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-divider type="vertical" class="action-divider" />
            <a-tooltip title="隐藏">
              <a-button type="text" class="action-btn action-hide" @click="review(record.id, 'hide')">
                <template #icon><EyeInvisibleOutlined /></template>
              </a-button>
            </a-tooltip>
          </div>
        </template>
      </template>
    </BlogTable>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listAdminComments, reviewAdminComment } from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const tableRef = ref(null)
const status = ref('pending')
const actionLoadingKey = ref('')
const { runAction, confirmAction } = useAdminActions()

// 筛选参数：status 变化时 BlogTable 自动重新加载
const filterParams = computed(() => ({ status: status.value }))

const columns = [
  { title: '评论内容', key: 'content', dataIndex: 'content' },
  { title: '用户', key: 'user', width: 180 },
  { title: '状态', key: 'status', width: 100 },
  { title: '风险', key: 'risk', width: 160 },
  { title: '提交时间', key: 'createdAt', width: 170 },
  { title: '操作', key: 'action', width: 140, align: 'center' }
]

function getStatusColor(value) {
  if (value === 'visible') return 'green'
  if (value === 'pending') return 'gold'
  if (value === 'rejected') return 'red'
  return 'default'
}

function getStatusLabel(value) {
  if (value === 'visible') return '已展示'
  if (value === 'pending') return '待审核'
  if (value === 'rejected') return '已驳回'
  if (value === 'hidden') return '已隐藏'
  return value || '-'
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-'
}

// 适配 BlogTable 的 apiFn 格式
async function fetchComments(params) {
  return await listAdminComments(params)
}

async function review(id, action) {
  const actionLabelMap = {
    approve: '通过',
    reject: '驳回',
    hide: '隐藏'
  }

  if (actionLoadingKey.value) {
    return
  }

  await confirmAction({
    title: `确认${actionLabelMap[action]}评论`,
    content: `执行后，评论状态将更新为“${actionLabelMap[action]}”结果。`,
    okText: `确认${actionLabelMap[action]}`,
    okType: action === 'hide' ? 'danger' : 'primary',
    async onOk() {
      actionLoadingKey.value = `${action}:${id}`
      try {
        await runAction(() => reviewAdminComment(id, action), {
          successMessage: '评论状态已更新',
          errorMessage: '操作失败',
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
/* ===== 页面容器：表格是绝对主角 ===== */
.comment-review-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  overflow: hidden;
}

/* ===== 精简顶栏：一行搞定 ===== */
.comment-topbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 4px 0;
  flex-shrink: 0;
}

.comment-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--console-text);
  white-space: nowrap;
  line-height: 32px;
}

.comment-filters {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  color: var(--console-text-secondary);
  white-space: nowrap;
  font-weight: 500;
}

.status-select {
  width: 140px;
  border-radius: 6px;
}

/* ===== 表格区域 ===== */
.comment-table {
  flex: 1 1 0;
  min-height: 0;
}

.comment-table :deep(.blog-table) {
  border: 1px solid var(--console-border);
  border-radius: 12px;
  overflow: hidden;
}

/* ===== 单元格内容 ===== */
.comment-content {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--console-text);
  max-width: 400px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.table-summary {
  font-size: 12px;
  color: var(--console-text-secondary);
  margin-top: 4px;
}

/* ===== 操作按钮：图标风格，与分类页统一 ===== */
.comment-actions {
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

.action-approve {
  color: var(--console-primary-strong);
}

.action-approve:hover:not(:disabled) {
  background: var(--console-primary-soft);
}

.action-reject {
  color: #faad14;
}

.action-reject:hover:not(:disabled) {
  background: rgba(250, 173, 20, 0.1);
}

.action-hide {
  color: #ff4d4f;
}

.action-hide:hover:not(:disabled) {
  background: rgba(255, 77, 79, 0.1);
}

.action-divider {
  margin: 0 4px;
  height: 16px;
  background: var(--console-border);
}

/* ===== 状态标签优化 ===== */
.comment-table :deep(.ant-tag) {
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* ===== 表格行细节 ===== */
.comment-table :deep(.ant-table-thead > tr > th) {
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

.comment-table :deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  vertical-align: top;
  border-bottom: 1px solid var(--console-border-light, #f0f0f0);
  transition: background 0.15s ease;
}

.comment-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--console-surface-hover, #fafafa);
}

/* ===== 用户单元格 ===== */
.comment-table :deep(.ant-typography) {
  font-size: 13px;
  color: var(--console-text);
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .comment-topbar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .comment-content {
    max-width: 200px;
  -webkit-line-clamp: 2;
  }
}
</style>
