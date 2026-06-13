<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">CONTENT ASSETS</p>
        <h2>文章管理</h2>
        <p>维护草稿、已发布文章和知识库文档，统一管理内容生命周期。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="loadArticles">刷新</a-button>
        <a-button type="primary" @click="$router.push('/console/manage/articles/new')">新建文章</a-button>
      </div>
    </div>

    <a-card class="enterprise-filter-card" :bordered="false">
      <a-space :size="12" wrap>
        <span class="filter-label">视图</span>
        <a-radio-group v-model:value="statusFilter" button-style="solid">
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button value="published">已发布</a-radio-button>
          <a-radio-button value="draft">草稿</a-radio-button>
          <a-radio-button value="archived">已下架</a-radio-button>
        </a-radio-group>
      </a-space>
    </a-card>

    <a-card class="enterprise-table-card" :bordered="false">
      <template #title>
        <div class="table-title">
          <strong>内容列表</strong>
          <span>共 {{ filteredArticles.length }} 篇文章</span>
        </div>
      </template>

      <a-alert v-if="errorMessage" type="error" show-icon :message="errorMessage" />
      <a-table
        v-else
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data-source="filteredArticles"
        :pagination="{ pageSize: 10, showSizeChanger: false }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <a-typography-text strong>{{ record.title }}</a-typography-text>
            <div class="table-summary">{{ record.summary || '暂无摘要' }}</div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'category'">
            {{ record.category?.name || '未分类' }}
          </template>
          <template v-else-if="column.key === 'updatedAt'">
            {{ formatDate(record.updatedAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="$router.push(`/console/manage/articles/${record.id}`)">编辑</a-button>
              <a-popconfirm title="确定删除此文章？删除后不可恢复。" @confirm="handleDelete(record.id)">
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { deleteAdminArticle, listAdminArticles } from '@/services/admin'

const loading = ref(false)
const errorMessage = ref('')
const articles = ref([])
const statusFilter = ref('all')
const filteredArticles = computed(() => {
  if (statusFilter.value === 'all') return articles.value
  return articles.value.filter((item) => item.status === statusFilter.value)
})
const columns = [
  {
    title: '标题',
    key: 'title',
    dataIndex: 'title'
  },
  {
    title: '状态',
    key: 'status',
    width: 110
  },
  {
    title: '分类',
    key: 'category',
    width: 150
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 190
  },
  {
    title: '操作',
    key: 'action',
    width: 90
  }
]

function getStatusLabel(status) {
  return status === 'published' ? '已发布' : status === 'archived' ? '已下架' : '草稿'
}

function getStatusColor(status) {
  if (status === 'published') return 'green'
  if (status === 'archived') return 'default'
  return 'gold'
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-'
}

async function loadArticles() {
  loading.value = true
  errorMessage.value = ''

  try {
    articles.value = await listAdminArticles()
  } catch (error) {
    errorMessage.value = error.message || '文章加载失败'
  } finally {
    loading.value = false
  }
}

async function handleDelete(id) {
  try {
    await deleteAdminArticle(id)
    message.success('文章已删除')
    await loadArticles()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
}

onMounted(loadArticles)
</script>
