<template>
  <div class="articles-page">
    <BlogTable
      ref="tableRef"
      :api-fn="fetchArticles"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
      :show-column-setting="true"
      :height="'100%'"
      :scroll="{ x: 960 }"
    >
      <template #toolbar>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索文章标题..."
          style="width: 240px"
          allow-clear
          @search="handleSearch"
          @change="handleSearchChange"
        />
        <a-select
          v-model:value="filterStatus"
          placeholder="状态筛选"
          style="width: 120px"
          allow-clear
        >
          <a-select-option value="all">全部状态</a-select-option>
          <a-select-option value="published">已发布</a-select-option>
          <a-select-option value="draft">草稿</a-select-option>
          <a-select-option value="archived">已下架</a-select-option>
        </a-select>
        <a-select
          v-model:value="filterCategory"
          placeholder="分类筛选"
          style="width: 140px"
          allow-clear
        >
          <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</a-select-option>
        </a-select>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'cover'">
          <div class="article-cover-cell">
            <img
              v-if="record.cover"
              :src="record.cover"
              :alt="record.title"
              class="article-cover-image"
            >
            <div v-else class="article-cover-placeholder">封面</div>
          </div>
        </template>

        <template v-else-if="column.key === 'title'">
          <div class="article-title-cell">
            <button
              type="button"
              class="article-title"
              @click="$router.push(`/console/manage/articles/${record.id}`)"
            >
              {{ record.title }}
            </button>
            <span class="article-summary">{{ record.summary || '暂无摘要，发布时可补充内容概览。' }}</span>
            <div class="article-meta-line">
              <a-tag :bordered="false" color="processing">{{ getStatusLabel(record.status) }}</a-tag>
              <span>{{ record.category?.name || '未分类' }}</span>
              <span v-if="record.tags?.length">{{ formatTagSummary(record.tags) }}</span>
            </div>
          </div>
        </template>

        <template v-else-if="column.key === 'publishedAt'">
          <div class="time-cell">
            <span>{{ formatArticleTime(record) }}</span>
            <span class="time-ago" :title="record.status === 'published' ? '发布时间' : '最近更新时间'">
              {{ record.status === 'published' ? '已发布' : '待发布' }}
            </span>
          </div>
        </template>

        <template v-else-if="column.key === 'viewCount'">
          <span class="metric-cell">{{ formatMetric(record.viewCount) }}</span>
        </template>

        <template v-else-if="column.key === 'likeCount'">
          <span class="metric-cell">{{ formatMetric(record.likeCount) }}</span>
        </template>

        <template v-else-if="column.key === 'commentCount'">
          <span class="metric-cell">{{ formatMetric(record.commentCount) }}</span>
        </template>

        <template v-else-if="column.key === 'favoriteCount'">
          <span class="metric-cell">{{ formatMetric(record.favoriteCount) }}</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-button type="link" size="small" @click="$router.push(`/console/manage/articles/${record.id}`)">
              编辑
            </a-button>
            <a-button type="link" size="small" @click="openReader(record)">阅读</a-button>
            <a-dropdown>
              <a-button type="text" size="small">
                <MoreOutlined />
              </a-button>
              <template #overlay>
                <a-menu @click="({ key }) => handleAction(key, record)">
                  <a-menu-item key="publish" v-if="record.status === 'draft'">
                    <CheckCircleOutlined /> 发布
                  </a-menu-item>
                  <a-menu-item key="archive" v-if="record.status === 'published'">
                    <MinusCircleOutlined /> 下架
                  </a-menu-item>
                  <a-menu-item key="draft" v-if="record.status === 'archived'">
                    <EditOutlined /> 转为草稿
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" danger>
                    <DeleteOutlined /> 删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </template>
    </BlogTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CheckCircleOutlined,
  MoreOutlined,
  MinusCircleOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  listAdminArticles,
  deleteAdminArticle,
  publishAdminArticle,
  updateAdminArticleStatus,
  listAllAdminCategories
} from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const tableRef = ref(null)
const categories = ref([])
const searchKeyword = ref('')
const filterStatus = ref('all')
const filterCategory = ref(undefined)
const categoryLoading = ref(false)
const actionLoadingKey = ref('')
const { runAction, confirmAction } = useAdminActions()

// 筛选参数：变化时 BlogTable 自动重新加载
const filterParams = computed(() => ({
  status: filterStatus.value === 'all' ? undefined : filterStatus.value,
  category: filterCategory.value,
  keyword: searchKeyword.value || undefined
}))

const columns = [
  {
    title: '封面',
    key: 'cover',
    width: 100
  },
  {
    title: '标题',
    key: 'title',
    dataIndex: 'title',
    width: 320,
    ellipsis: true
  },
  {
    title: '发布时间',
    key: 'publishedAt',
    width: 156
  },
  {
    title: '阅读量',
    key: 'viewCount',
    width: 80,
    align: 'center'
  },
  {
    title: '点赞数',
    key: 'likeCount',
    width: 80,
    align: 'center'
  },
  {
    title: '评论数',
    key: 'commentCount',
    width: 80,
    align: 'center'
  },
  {
    title: '收藏数',
    key: 'favoriteCount',
    width: 80,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 140,
    fixed: 'right'
  }
]

// 状态相关
function getStatusLabel(status) {
  const map = { published: '已发布', draft: '草稿', archived: '已下架' }
  return map[status] || '草稿'
}

function getStatusBadge(status) {
  const map = { published: 'success', draft: 'warning', archived: 'default' }
  return map[status] || 'warning'
}

// 时间格式化
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

function formatArticleTime(record) {
  if (record.publishedAt) {
    return formatDate(record.publishedAt)
  }
  return formatDate(record.updatedAt)
}

function formatMetric(value) {
  return Number(value) || 0
}

function formatTagSummary(tags = []) {
  if (!tags.length) {
    return ''
  }

  const names = tags.map((tag) => tag.name).filter(Boolean)
  if (names.length <= 2) {
    return names.join(' / ')
  }

  return `${names.slice(0, 2).join(' / ')} 等 ${names.length} 个标签`
}

async function fetchArticles(params) {
  const result = await listAdminArticles(params)
  return { items: result.items || [], total: result.total || 0 }
}

async function loadCategories() {
  categoryLoading.value = true
  try {
    categories.value = await listAllAdminCategories()
  } catch (error) {
    console.error('分类加载失败:', error)
  } finally {
    categoryLoading.value = false
  }
}

// 搜索防抖：输入时延迟 300ms 再触发实际请求
let searchTimer = null
function handleSearch() {
  // 点击搜索按钮时立即执行
  clearTimeout(searchTimer)
}
function handleSearchChange() {
  // 输入变化时防抖 300ms，filterParams 变化会触发 BlogTable 自动重载
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    // 防抖结束后不需要额外操作，filterParams computed 会自动响应 searchKeyword 变化
  }, 300)
}

function openReader(record) {
  if (record.slug) {
    window.open(`/articles/${record.slug}`, '_blank', 'noopener')
    return
  }

  if (record.id) {
    window.open(`/console/manage/articles/${record.id}`, '_blank', 'noopener')
  }
}

// 操作处理
async function handleAction(key, record) {
  if (actionLoadingKey.value) {
    return
  }

  switch (key) {
    case 'publish':
      await handlePublish(record.id)
      break
    case 'archive':
      await handleArchive(record.id)
      break
    case 'draft':
      await handleToDraft(record.id)
      break
    case 'delete':
      handleDelete(record)
      break
  }
}

async function handlePublish(id) {
  actionLoadingKey.value = `publish:${id}`
  try {
    await runAction(() => publishAdminArticle(id), {
      successMessage: '文章已发布',
      errorMessage: '发布失败',
      onSuccess: () => tableRef.value?.refresh()
    })
  } finally {
    actionLoadingKey.value = ''
  }
}

async function handleArchive(id) {
  actionLoadingKey.value = `archive:${id}`
  try {
    await runAction(() => updateAdminArticleStatus(id, 'archived'), {
      successMessage: '文章已下架',
      errorMessage: '下架失败',
      onSuccess: () => tableRef.value?.refresh()
    })
  } finally {
    actionLoadingKey.value = ''
  }
}

async function handleToDraft(id) {
  actionLoadingKey.value = `draft:${id}`
  try {
    await runAction(() => updateAdminArticleStatus(id, 'draft'), {
      successMessage: '已转为草稿',
      errorMessage: '转草稿失败',
      onSuccess: () => tableRef.value?.refresh()
    })
  } finally {
    actionLoadingKey.value = ''
  }
}

function handleDelete(record) {
  confirmAction({
    title: '确认删除',
    content: `确定要删除文章「${record.title}」吗？删除后将进入删除流程且前台不可再访问。`,
    okText: '确认删除',
    okType: 'danger',
    async onOk() {
      actionLoadingKey.value = `delete:${record.id}`
      try {
        await runAction(() => deleteAdminArticle(record.id), {
          successMessage: '文章已删除',
          errorMessage: '删除失败',
          onSuccess: () => tableRef.value?.refresh()
        })
      } finally {
        actionLoadingKey.value = ''
      }
    }
  }).catch(() => {})
}

// 初始化
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.articles-page {
  max-width: 1400px;
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
}

.article-cover-cell {
  width: 72px;
  height: 48px;
  overflow: hidden;
  border-radius: 6px;
  background: #f5f7fa;
  flex-shrink: 0;
}

.article-cover-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.article-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bfbfbf;
  font-size: 12px;
}

.article-title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}

.article-title {
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  transition: color 0.2s;
}

.article-title:hover {
  color: #1677ff;
}

.article-summary {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  word-break: break-all;
}

.article-meta-line {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
  overflow: hidden;
}

.article-meta-line span:not(:first-child) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.metric-cell {
  display: inline-flex;
  min-width: 36px;
  justify-content: center;
  font-size: 13px;
  color: #525252;
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

/* 辅助样式 */
.text-muted {
  color: #bfbfbf;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .articles-page {
    max-width: 100%;
  }
}
</style>
