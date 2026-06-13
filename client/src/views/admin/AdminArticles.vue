<template>
  <div class="articles-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>文章管理</h2>
        <span class="header-desc">管理所有文章的发布、编辑和删除</span>
      </div>
      <div class="header-right">
        <a-button @click="loadArticles">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="$router.push('/console/manage/articles/new')">
          <template #icon><PlusOutlined /></template>
          新建文章
        </a-button>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-bar">
      <div class="filter-left">
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
          @change="handleFilter"
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
          @change="handleFilter"
        >
          <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</a-select-option>
        </a-select>
      </div>
      <div class="filter-right">
        <span class="total-text">共 {{ pagination.total }} 篇文章</span>
      </div>
    </div>

    <!-- 文章表格 -->
    <div class="table-wrapper">
      <a-table
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data-source="articles"
        :pagination="pagination"
        @change="handleTableChange"
      >
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
              <span>{{ formatDate(record.updatedAt) }}</span>
              <span class="time-ago">{{ formatTimeAgo(record.updatedAt) }}</span>
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
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  LikeOutlined,
  DownOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import {
  listAdminArticles,
  deleteAdminArticle,
  publishAdminArticle,
  updateAdminArticle,
  listAdminCategories
} from '@/services/admin'

// 状态
const loading = ref(false)
const articles = ref([])
const categories = ref([])
const searchKeyword = ref('')
const filterStatus = ref('all')
const filterCategory = ref(undefined)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
})

// 表格列定义
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
    title: '更新时间',
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
  return map[status] || '草稿'  // 默认显示草稿
}

function getStatusBadge(status) {
  const map = { published: 'success', draft: 'warning', archived: 'default' }
  return map[status] || 'warning'  // 默认显示警告色（草稿）
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

// 加载数据
async function loadArticles() {
  loading.value = true
  try {
    const result = await listAdminArticles({
      status: filterStatus.value === 'all' ? undefined : filterStatus.value,
      category: filterCategory.value,
      keyword: searchKeyword.value,
      page: pagination.current,
      pageSize: pagination.pageSize
    })

    articles.value = result.items || []
    pagination.total = result.total || 0
  } catch (error) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await listAdminCategories()
  } catch (error) {
    console.error('分类加载失败:', error)
  }
}

// 搜索
function handleSearch() {
  pagination.current = 1
  loadArticles()
}

let searchTimer = null
function handleSearchChange() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.current = 1
    loadArticles()
  }, 300)
}

// 筛选
function handleFilter() {
  pagination.current = 1
  loadArticles()
}

// 表格变化（分页、排序）
function handleTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadArticles()
}

// 操作处理
async function handleAction(key, record) {
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
  try {
    await publishAdminArticle(id)
    message.success('文章已发布')
    loadArticles()
  } catch (error) {
    message.error(error.message || '发布失败')
  }
}

async function handleArchive(id) {
  try {
    await updateAdminArticle(id, { status: 'archived' })
    message.success('文章已下架')
    loadArticles()
  } catch (error) {
    message.error(error.message || '操作失败')
  }
}

async function handleToDraft(id) {
  try {
    await updateAdminArticle(id, { status: 'draft' })
    message.success('已转为草稿')
    loadArticles()
  } catch (error) {
    message.error(error.message || '操作失败')
  }
}

function handleDelete(record) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除文章「${record.title}」吗？删除后不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteAdminArticle(record.id)
        message.success('文章已删除')
        loadArticles()
      } catch (error) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

// 初始化
onMounted(() => {
  loadCategories()
  loadArticles()
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

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

.filter-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.total-text {
  font-size: 13px;
  color: #8c8c8c;
}

/* 表格 */
.table-wrapper {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.table-wrapper :deep(.ant-table) {
  border-radius: 8px;
}

.table-wrapper :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  font-size: 13px;
  color: #666;
}

.table-wrapper :deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f7fa;
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

  .filter-left {
    width: 100%;
    flex-wrap: wrap;
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
