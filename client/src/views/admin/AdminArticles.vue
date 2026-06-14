<template>
  <div class="articles-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>文章管理</h2>
        <span class="header-desc">管理所有文章的发布、编辑和删除</span>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="$router.push('/console/write')">
          <template #icon><PlusOutlined /></template>
          新建文章
        </a-button>
      </div>
    </div>

    <!-- 文章表格 -->
    <BlogTable
      ref="tableRef"
      :api-fn="fetchArticles"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
      :show-column-setting="true"
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
        <!-- 标题列 -->
        <template v-if="column.key === 'title'">
          <div class="article-title-cell">
            <span class="article-title" @click="$router.push(`/console/manage/articles/${record.id}`)">
              {{ record.title }}
            </span>
            <span class="article-summary">{{ record.summary || '暂无摘要' }}</span>
          </div>
        </template>

        <!-- 分类列 -->
        <template v-else-if="column.key === 'category'">
          <a-tag v-if="record.category?.name">{{ record.category.name }}</a-tag>
          <span v-else class="text-muted">未分类</span>
        </template>

        <!-- 标签列 -->
        <template v-else-if="column.key === 'tags'">
          <template v-if="record.tags?.length">
            <a-tag v-for="tag in record.tags.slice(0, 2)" :key="tag.id" :color="tag.color || 'blue'">
              {{ tag.name }}
            </a-tag>
            <a-tooltip v-if="record.tags.length > 2">
              <template #title>
                <span v-for="tag in record.tags" :key="tag.id">{{ tag.name }} </span>
              </template>
              <a-tag>+{{ record.tags.length - 2 }}</a-tag>
            </a-tooltip>
          </template>
          <span v-else class="text-muted">无标签</span>
        </template>

        <!-- 状态列 -->
        <template v-else-if="column.key === 'status'">
          <a-badge :status="getStatusBadge(record.status)" :text="getStatusLabel(record.status)" />
        </template>

        <!-- 数据列 -->
        <template v-else-if="column.key === 'stats'">
          <div class="stats-cell">
            <span title="阅读量"><EyeOutlined /> {{ record.viewCount || 0 }}</span>
            <span title="点赞数"><LikeOutlined /> {{ record.likeCount || 0 }}</span>
          </div>
        </template>

        <!-- 时间列 -->
        <template v-else-if="column.key === 'updatedAt'">
          <div class="time-cell">
            <span>{{ formatArticleTime(record) }}</span>
            <span class="time-ago" :title="record.source === 'legacy-notes' ? '写作时间' : '更新时间'">
              {{ record.source === 'legacy-notes' ? '迁移文章' : formatTimeAgo(record.updatedAt) }}
            </span>
          </div>
        </template>

        <!-- 操作列 -->
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="$router.push(`/console/manage/articles/${record.id}`)">
              编辑
            </a-button>
            <a-dropdown>
              <a-button type="link" size="small">
                更多 <DownOutlined />
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
  PlusOutlined,
  EyeOutlined,
  LikeOutlined,
  DownOutlined,
  CheckCircleOutlined,
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
    title: '文章标题',
    key: 'title',
    dataIndex: 'title',
    width: '30%',
    ellipsis: true
  },
  {
    title: '分类',
    key: 'category',
    width: 100
  },
  {
    title: '标签',
    key: 'tags',
    width: 150
  },
  {
    title: '发布状态',
    key: 'status',
    width: 100
  },
  {
    title: '数据',
    key: 'stats',
    width: 120
  },
  {
    title: '时间',
    key: 'updatedAt',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
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
  if (record.source === 'legacy-notes' && record.publishedAt) {
    return formatDate(record.publishedAt)
  }
  return formatDate(record.updatedAt)
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

// 数据加载（适配 BlogTable 的 apiFn 格式）
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

// 搜索防抖
let searchTimer = null
function handleSearch() {
  // 直接搜索时，filterParams 变化会触发 BlogTable 自动重载
}
function handleSearchChange() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    // 防抖：filterParams 通过 computed 自动更新，BlogTable watch 会处理
  }, 300)
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
}

/* 页面头部 */
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

.header-right {
  display: flex;
  gap: 10px;
}

/* 文章标题单元格 */
.article-title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.article-title {
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

/* 数据单元格 */
.stats-cell {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #666;
}

.stats-cell span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 时间单元格 */
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

/* 响应式 */
@media (max-width: 1200px) {
  .filter-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
