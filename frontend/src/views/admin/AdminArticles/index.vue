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
      :scroll="{ x: 1120 }"
      row-selection
      @selection-change="handleSelectionChange"
    >
      <template #toolbar>
        <BatchActionBar :count="selectedArticleIds.length" @clear="clearSelection">
          <a-button size="small" type="primary" @click="openBatchMetaDrawer">批量设置</a-button>
          <a-dropdown>
            <a-button size="small">
              批量状态 <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu @click="({ key }) => handleBatchStatus(key)">
                <a-menu-item key="published">发布</a-menu-item>
                <a-menu-item key="archived">下架</a-menu-item>
                <a-menu-item key="draft">草稿</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-button size="small" danger @click="handleBatchDelete">批量删除</a-button>
        </BatchActionBar>
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
        <a-cascader
          v-model:value="filterCategoryPath"
          :options="categoryTreeOptions"
          :loading="categoryLoading"
          placeholder="分类筛选"
          style="width: 220px"
          allow-clear
          change-on-select
          show-search
        />
        <a-button @click="resetFilters">重置</a-button>
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

        <template v-else-if="column.key === 'updatedAt'">
          <div class="time-cell">
            <span>{{ formatDate(record.updatedAt) }}</span>
            <span class="time-ago">最近编辑</span>
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

    <ArticleBatchMetaDrawer
      v-model:open="batchMetaVisible"
      :selected-count="selectedArticleIds.length"
      :category-options="categoryTreeOptions"
      :tag-options="tagOptions"
      :cover-media-items="coverMediaItems"
      :cover-media-loading="coverMediaLoading"
      :submitting="batchMetaSubmitting"
      :result="batchMetaResult"
      @submit="handleBatchMetaSubmit"
      @clear-result="clearBatchMetaResult"
      @load-cover-media="loadCoverMedia"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  CheckCircleOutlined,
  DownOutlined,
  MoreOutlined,
  MinusCircleOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import ArticleBatchMetaDrawer from './ArticleBatchMetaDrawer.vue'
import {
  listAdminArticles,
  listAllAdminCategories
} from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'
import { useAdminArticleActions } from './useAdminArticleActions'
import { useArticleBatchMeta } from './useArticleBatchMeta'
import {
  buildCategoryOptions,
  formatArticleTime,
  formatDate,
  formatMetric,
  formatTagSummary,
  getStatusLabel
} from './articleListUtils'
import './styles.css'

const tableRef = ref(null)
const router = useRouter()
const categories = ref([])
const searchKeyword = ref('')
const debouncedKeyword = ref('')
const filterStatus = ref('all')
const filterCategoryPath = ref([])
const categoryLoading = ref(false)
const selectedArticleIds = ref([])
const { runAction, confirmAction } = useAdminActions()
const {
  handleAction,
  handleBatchDelete,
  handleBatchStatus,
  openReader
} = useAdminArticleActions({
  selectedArticleIds,
  tableRef,
  router,
  clearSelection,
  runAction,
  confirmAction
})
const {
  batchMetaResult,
  batchMetaSubmitting,
  batchMetaVisible,
  clearBatchMetaResult,
  coverMediaItems,
  coverMediaLoading,
  handleBatchMetaSubmit,
  loadCoverMedia,
  loadTags,
  openBatchMetaDrawer,
  tagOptions
} = useArticleBatchMeta({
  selectedArticleIds,
  tableRef,
  runAction
})

// 筛选参数：变化时 BlogTable 自动重新加载
const filterParams = computed(() => ({
  status: filterStatus.value === 'all' ? undefined : filterStatus.value,
  category: selectedCategoryId.value,
  keyword: debouncedKeyword.value || undefined
}))
const selectedCategoryId = computed(() => {
  const path = Array.isArray(filterCategoryPath.value) ? filterCategoryPath.value : []
  return path.length ? path[path.length - 1] : undefined
})
const categoryTreeOptions = computed(() => buildCategoryOptions(categories.value))

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
    title: '最近编辑',
    key: 'updatedAt',
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
  debouncedKeyword.value = searchKeyword.value.trim()
}
function handleSearchChange() {
  // 输入变化时防抖 300ms，filterParams 变化会触发 BlogTable 自动重载
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedKeyword.value = searchKeyword.value.trim()
  }, 300)
}

function resetFilters() {
  clearTimeout(searchTimer)
  searchKeyword.value = ''
  debouncedKeyword.value = ''
  filterStatus.value = 'all'
  filterCategoryPath.value = []
  clearSelection()
}

function handleSelectionChange(keys) {
  selectedArticleIds.value = keys || []
}

function clearSelection() {
  selectedArticleIds.value = []
  tableRef.value?.clearSelection?.()
}

// 初始化
onMounted(() => {
  loadCategories()
  loadTags()
})
</script>
