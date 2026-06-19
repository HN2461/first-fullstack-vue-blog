<template>
  <section :class="inConsole ? 'enterprise-page csdn-index' : 'section-panel csdn-index csdn-index--public'">
    <header class="csdn-index__head">
      <h2>{{ pageTitle }}</h2>
      <div class="csdn-index__count">
        <span v-if="loading && hasArticles" class="csdn-index__syncing">正在同步</span>
        <span>{{ result.total }} 篇文章</span>
        <span>{{ pageSize }} 条/页</span>
      </div>
    </header>

    <div class="csdn-index__list">
      <p v-if="loading && !hasArticles" class="csdn-index__state">正在加载文章...</p>
      <p v-else-if="errorMessage" class="csdn-index__state csdn-index__state--error">{{ errorMessage }}</p>

      <template v-else>
        <router-link
          v-for="article in result.items"
          :key="article.id"
          :class="['csdn-index__item', { 'csdn-index__item--plain': !article.cover }]"
          :to="articlePath(article.slug)"
        >
          <div v-if="article.cover" class="csdn-index__thumb">
            <img :src="article.cover" :alt="article.title">
          </div>

          <div class="csdn-index__body">
            <h3>{{ article.title }}</h3>
            <p>{{ article.summary || '这篇文章还没有摘要。' }}</p>

            <div class="csdn-index__meta">
              <span class="csdn-index__category">{{ article.category?.name || '未分类' }}</span>
              <span>{{ formatDate(article.publishedAt || article.createdAt) }}</span>
              <span>{{ article.viewCount || 0 }} 浏览</span>
              <span>{{ article.readingMinutes || 1 }} 分钟</span>
              <span>{{ article.author?.username || '知识库作者' }}</span>
            </div>
          </div>
        </router-link>

        <a-empty v-if="result.items.length === 0" description="暂无符合条件的文章">
          <template #description>
            <p>当前条件下没有文章</p>
          </template>
        </a-empty>
      </template>
    </div>

    <div class="csdn-index__pagination" v-if="!loading && !errorMessage && result.total > result.pageSize">
      <a-pagination
        v-model:current="currentPage"
        :page-size="pageSize"
        :total="result.total"
        :page-size-options="['10', '20', '30']"
        :show-size-changer="true"
        show-quick-jumper
        size="small"
        @change="handlePageChange"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listPublicArticles } from '@/services/public'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const result = ref({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10
})
let articleRequestId = 0

const inConsole = computed(() => route.path.startsWith('/console'))
const hasArticles = computed(() => result.value.items.length > 0)
const pageTitle = computed(() => {
  if (route.params.category) return `分类 / ${decodeURIComponent(route.params.category)}`
  if (route.params.tag) {
    return `标签 / ${decodeURIComponent(route.params.tag)}`
  }
  return '全部文章'
})

function articlePath(slug) {
  return inConsole.value ? `/console/articles/${slug}` : `/articles/${slug}`
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function syncPageQuery() {
  const nextQuery = { ...route.query }

  if (currentPage.value > 1) nextQuery.page = String(currentPage.value)
  else delete nextQuery.page

  if (pageSize.value !== 10) nextQuery.pageSize = String(pageSize.value)
  else delete nextQuery.pageSize

  await router.replace({ query: nextQuery })
}

async function loadArticles() {
  const requestId = ++articleRequestId
  loading.value = true
  errorMessage.value = ''

  try {
    const nextResult = await listPublicArticles({
      category: route.params.category,
      tag: route.params.tag,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    if (requestId !== articleRequestId) return
    result.value = nextResult
  } catch (error) {
    if (requestId !== articleRequestId) return
    errorMessage.value = error.message || '文章加载失败'
  } finally {
    if (requestId === articleRequestId) {
      loading.value = false
    }
  }
}

async function refreshFromRoute() {
  currentPage.value = Math.max(1, Number.parseInt(route.query.page || '1', 10))
  pageSize.value = Math.max(1, Number.parseInt(route.query.pageSize || '10', 10))
  await loadArticles()
}

async function handlePageChange(page, size) {
  currentPage.value = page
  pageSize.value = size
  await syncPageQuery()
}

watch(() => route.fullPath, refreshFromRoute)

onMounted(async () => {
  await refreshFromRoute()
})
</script>

<style scoped>
.csdn-index {
  gap: 0;
}

.csdn-index__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 0 0 12px;
  border-bottom: 1px solid var(--border-color);
}

.csdn-index__head h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.csdn-index__count {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  color: var(--text-muted);
  font-size: 13px;
}

.csdn-index__syncing {
  padding: 2px 8px;
  border-radius: 999px;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 9%, transparent);
}

.csdn-index__list {
  margin-top: 4px;
}

:deep(.csdn-index__item) {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  color: inherit;
}

:deep(.csdn-index__item:hover h3) {
  color: var(--primary-color);
}

:deep(.csdn-index__item--plain) {
  grid-template-columns: minmax(0, 1fr);
}

:deep(.csdn-index__item--plain .csdn-index__body) {
  max-width: 100%;
}

.csdn-index__thumb {
  width: 132px;
  height: 84px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--bg-secondary);
}

.csdn-index__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.csdn-index__body {
  min-width: 0;
}

.csdn-index__body h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 19px;
  line-height: 1.35;
  transition: color 0.18s ease;
}

.csdn-index__body p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.csdn-index__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.csdn-index__category {
  color: #e65a4f;
}

.csdn-index__state {
  margin: 0;
  padding: 20px 0;
  color: var(--text-secondary);
}

.csdn-index__state--error {
  color: #ff4d4f;
}

.csdn-index__pagination {
  display: flex;
  justify-content: center;
  padding-top: 14px;
}

@media (max-width: 960px) {
  .csdn-index__head {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 720px) {
  :deep(.csdn-index__item) {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 12px;
    padding: 16px 0;
  }

  :deep(.csdn-index__item--plain) {
    grid-template-columns: minmax(0, 1fr);
  }

  .csdn-index__thumb {
    width: 96px;
    height: 64px;
  }

  .csdn-index__body h3 {
    font-size: 17px;
  }

  .csdn-index__body p {
    font-size: 14px;
    -webkit-line-clamp: 2;
  }
}
</style>
