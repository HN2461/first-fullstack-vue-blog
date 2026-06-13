<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">GOVERNANCE</p>
        <h2>评论审核</h2>
        <p>统一处理读者评论的展示、驳回和隐藏状态，后续可扩展举报、敏感词、人工复核等治理能力。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="loadComments">刷新</a-button>
      </div>
    </div>

    <a-card class="enterprise-filter-card" :bordered="false">
      <a-space :size="12">
        <span class="filter-label">状态</span>
        <a-select v-model:value="status" style="width: 160px" @change="loadComments">
          <a-select-option value="">全部评论</a-select-option>
          <a-select-option value="pending">待审核</a-select-option>
          <a-select-option value="visible">已展示</a-select-option>
          <a-select-option value="rejected">已驳回</a-select-option>
          <a-select-option value="hidden">已隐藏</a-select-option>
        </a-select>
      </a-space>
    </a-card>

    <a-card class="enterprise-table-card" :bordered="false">
      <template #title>
        <div class="table-title">
          <strong>审核队列</strong>
          <span>共 {{ comments.length }} 条记录</span>
        </div>
      </template>

      <a-alert v-if="errorMessage" type="error" show-icon :message="errorMessage" />
      <a-table
        v-else
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data-source="comments"
        :pagination="{ pageSize: 10, showSizeChanger: false }"
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
            <a-space>
              <a-button size="small" type="primary" @click="review(record.id, 'approve')">通过</a-button>
              <a-button size="small" @click="review(record.id, 'reject')">驳回</a-button>
              <a-button size="small" danger @click="review(record.id, 'hide')">隐藏</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
      <a-empty v-if="comments.length === 0 && !errorMessage && !loading" description="暂无评论" />
    </a-card>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { listAdminComments, reviewAdminComment } from '@/services/admin'

const status = ref('pending')
const comments = ref([])
const loading = ref(false)
const errorMessage = ref('')
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

async function loadComments() {
  loading.value = true
  errorMessage.value = ''

  try {
    comments.value = await listAdminComments(status.value)
  } catch (error) {
    errorMessage.value = error.message || '评论加载失败'
  } finally {
    loading.value = false
  }
}

async function review(id, action) {
  await reviewAdminComment(id, action)
  await loadComments()
}

onMounted(loadComments)
</script>
