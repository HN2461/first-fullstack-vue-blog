<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">GOVERNANCE</p>
        <h2>评论审核</h2>
        <p>统一处理读者评论的展示、驳回和隐藏状态，保持知识库互动区清晰可控。</p>
      </div>
    </div>

    <BlogTable
      ref="tableRef"
      :api-fn="fetchComments"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
    >
      <template #toolbar>
        <a-space :size="12">
          <span class="filter-label">状态</span>
          <a-select v-model:value="status" style="width: 160px">
            <a-select-option value="">全部评论</a-select-option>
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="visible">已展示</a-select-option>
            <a-select-option value="rejected">已驳回</a-select-option>
            <a-select-option value="hidden">已隐藏</a-select-option>
          </a-select>
        </a-space>
      </template>

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
          <a-space>
            <a-button size="small" type="primary" @click="review(record.id, 'approve')">通过</a-button>
            <a-button size="small" @click="review(record.id, 'reject')">驳回</a-button>
            <a-button size="small" danger @click="review(record.id, 'hide')">隐藏</a-button>
          </a-space>
        </template>
      </template>
    </BlogTable>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
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
  { title: '用户', key: 'user', width: 190 },
  { title: '状态', key: 'status', width: 110 },
  { title: '风险', key: 'risk', width: 190 },
  { title: '提交时间', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 220 }
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
.enterprise-page-header {
  margin-bottom: 16px;
}

.enterprise-page-kicker {
  font-size: 11px;
  letter-spacing: 2px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.enterprise-page-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #1a1a1a;
}

.enterprise-page-header p {
  font-size: 13px;
  color: #8c8c8c;
  margin: 0;
}

.filter-label {
  font-size: 13px;
  color: #666;
}

.comment-content {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

.table-summary {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}
</style>
