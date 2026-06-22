<template>
  <section :class="inConsole ? 'enterprise-page csdn-search' : 'section-panel csdn-search csdn-search--public'">
    <div ref="searchInputWrapperRef" class="csdn-search__command">
      <a-input
        ref="searchInputRef"
        v-model:value.trim="query"
        size="large"
        placeholder="搜索文章标题、摘要、正文"
        allow-clear
        @focus="handleInputFocus"
        @input="onInputChange"
        @keydown="handleSearchKeydown"
        @pressEnter="submitSearch({ applyActive: true })"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
        <template #suffix>
          <a-button type="link" class="csdn-search__submit" @click="submitSearch">搜索</a-button>
        </template>
      </a-input>

      <div v-if="showDropdown && dropdownItems.length > 0" class="csdn-search__dropdown">
        <div class="csdn-search__dropdown-head">
          <strong>{{ query ? '搜索建议' : '最近搜索' }}</strong>
          <a-button v-if="!query && searchHistory.length > 0" type="link" size="small" danger @click="clearHistory">清空</a-button>
        </div>

        <button
          v-for="(item, index) in dropdownItems"
          :key="item.slug || item.title || item"
          type="button"
          :class="['csdn-search__dropdown-item', { 'is-active': index === activeDropdownIndex }]"
          :aria-selected="index === activeDropdownIndex"
          @mousedown.prevent="applyDropdownItem(item)"
        >
          <SearchOutlined />
          <span>{{ typeof item === 'string' ? item : item.title }}</span>
          <small v-if="typeof item !== 'string' && item.category">{{ item.category.name }}</small>
        </button>
      </div>
    </div>

    <div v-if="searched" class="csdn-search__resultbar">
      <span>共 {{ total }} 条结果</span>
      <span v-if="tookMs > 0">{{ tookMs }}ms</span>
      <span v-if="activeCategory">分类筛选中</span>
      <span v-if="activeTag">标签筛选中</span>
    </div>

    <div v-if="searched && (facets.categories.length || facets.tags.length)" class="csdn-search__facet-strip">
      <div v-if="facets.categories.length" class="csdn-search__facet-row">
        <strong>分类</strong>
        <button
          type="button"
          :class="['csdn-search__facet-chip', { 'is-active': !activeCategory }]"
          @click="toggleCategory('')"
        >
          全部
        </button>
        <button
          v-for="item in facets.categories"
          :key="item.slug"
          type="button"
          :class="['csdn-search__facet-chip', { 'is-active': activeCategory === item.slug }]"
          @click="toggleCategory(item.slug)"
        >
          {{ item.name }}
        </button>
      </div>

      <div v-if="facets.tags.length" class="csdn-search__facet-row">
        <strong>标签</strong>
        <button
          type="button"
          :class="['csdn-search__facet-chip', { 'is-active': !activeTag }]"
          @click="toggleTag('')"
        >
          全部
        </button>
        <button
          v-for="item in facets.tags"
          :key="item.slug"
          type="button"
          :class="['csdn-search__facet-chip', { 'is-active': activeTag === item.slug }]"
          @click="toggleTag(item.slug)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>

    <div class="csdn-search__list">
      <div v-if="errorMessage" class="csdn-search__state csdn-search__state--error">{{ errorMessage }}</div>
      <div v-else-if="loading" class="csdn-search__state">正在检索文章...</div>
      <div v-else-if="!searched" class="csdn-search__state">输入关键词后开始检索。</div>
      <a-empty v-else-if="searched && total === 0" description="没有找到相关文章">
        <template #description>
          <p>没有找到与 “{{ query }}” 相关的文章</p>
        </template>
      </a-empty>

      <template v-else>
        <router-link
          v-for="article in result.items"
          :key="article.id"
          :class="['csdn-search__item', { 'csdn-search__item--plain': !article.cover }]"
          :to="articlePath(article.slug)"
        >
          <div v-if="article.cover" class="csdn-search__thumb">
            <img :src="article.cover" :alt="article.title">
          </div>

          <div class="csdn-search__body">
            <h3 class="csdn-search__title" v-html="article.highlightedTitle || article.title"></h3>
            <p
              class="csdn-search__snippet"
              v-html="article.highlightedSnippet || article.snippet || article.highlightedSummary || article.summary || '这篇文章还没有摘要。'"
            ></p>

            <div class="csdn-search__meta-row">
              <span class="csdn-search__category">{{ article.category?.name || '未分类' }}</span>
              <span>{{ formatDate(article.publishedAt || article.createdAt) }}</span>
              <span>{{ article.viewCount || 0 }} 浏览</span>
              <span>{{ article.readingMinutes || 1 }} 分钟</span>
              <span>相关度 {{ article.relevanceScore }}</span>
            </div>
          </div>
        </router-link>
      </template>
    </div>

    <div class="csdn-search__pagination" v-if="searched && totalPages > 1">
      <a-pagination
        v-model:current="currentPage"
        :page-size="pageSize"
        :total="total"
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getSearchSuggestions, searchPublicArticles } from '@/services/public'

const route = useRoute()
const router = useRouter()

const query = ref('')
const searched = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const matchMode = ref('AND')
const sortBy = ref('relevance')
const currentPage = ref(1)
const pageSize = ref(10)
const activeCategory = ref('')
const activeTag = ref('')

const searchInputRef = ref(null)
const searchInputWrapperRef = ref(null)
const suggestions = ref([])
const showDropdown = ref(false)
const activeDropdownIndex = ref(-1)
let suggestTimeout = null

const HISTORY_KEY = 'blog-search-history'
const HISTORY_LIMIT = 10
const searchHistory = ref([])

const result = ref({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  facets: { categories: [], tags: [] },
  tookMs: 0,
  terms: [],
  meta: {}
})

const inConsole = computed(() => route.path.startsWith('/console'))
const total = computed(() => result.value.total || 0)
const tookMs = computed(() => result.value.tookMs || 0)
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
const facets = computed(() => result.value.facets || { categories: [], tags: [] })
const dropdownItems = computed(() => {
  if (query.value) return suggestions.value
  return searchHistory.value
})

function resetDropdownIndex() {
  activeDropdownIndex.value = dropdownItems.value.length > 0 ? 0 : -1
}

function articlePath(slug) {
  return inConsole.value ? `/console/article-directory/articles/${slug}` : `/articles/${slug}`
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function syncRouteQuery() {
  const nextQuery = { ...route.query }

  if (query.value) nextQuery.q = query.value
  else delete nextQuery.q

  if (nextQuery.q === route.query.q) return

  await router.replace({ query: nextQuery })
}

async function runSearch({ resetPage = false } = {}) {
  if (resetPage) currentPage.value = 1

  if (!query.value) {
    result.value = {
      items: [],
      total: 0,
      page: 1,
      pageSize: pageSize.value,
      facets: { categories: [], tags: [] },
      tookMs: 0,
      terms: [],
      meta: {}
    }
    searched.value = false
    errorMessage.value = ''
    await syncRouteQuery()
    return
  }

  loading.value = true
  searched.value = true
  errorMessage.value = ''
  showDropdown.value = false
  await syncRouteQuery()

  try {
    const params = {
      q: query.value,
      mode: matchMode.value,
      sort: sortBy.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }

    if (activeCategory.value) params.category = activeCategory.value
    if (activeTag.value) params.tag = activeTag.value

    result.value = await searchPublicArticles(params)
    saveHistory(query.value)
  } catch (error) {
    errorMessage.value = error.message || '搜索失败'
  } finally {
    loading.value = false
  }
}

function submitSearch({ applyActive = false } = {}) {
  if (applyActive && showDropdown.value && activeDropdownIndex.value >= 0) {
    const item = dropdownItems.value[activeDropdownIndex.value]
    if (item) {
      applyDropdownItem(item)
      return
    }
  }

  runSearch({ resetPage: true })
}

function handleInputFocus() {
  showDropdown.value = dropdownItems.value.length > 0
  resetDropdownIndex()
}

function onInputChange() {
  if (suggestTimeout) clearTimeout(suggestTimeout)

  if (!query.value) {
    suggestions.value = []
    showDropdown.value = searchHistory.value.length > 0
    resetDropdownIndex()
    return
  }

  suggestTimeout = setTimeout(async () => {
    try {
      const response = await getSearchSuggestions({ q: query.value })
      suggestions.value = response.items || []
      showDropdown.value = suggestions.value.length > 0
      resetDropdownIndex()
    } catch {
      suggestions.value = []
      showDropdown.value = false
      activeDropdownIndex.value = -1
    }
  }, 180)
}

function handleSearchKeydown(event) {
  if (event.key === 'Escape' && showDropdown.value) {
    event.preventDefault()
    showDropdown.value = false
    activeDropdownIndex.value = -1
    return
  }

  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) {
    return
  }

  if (!dropdownItems.value.length) {
    return
  }

  event.preventDefault()

  if (!showDropdown.value) {
    showDropdown.value = true
    resetDropdownIndex()
    return
  }

  const lastIndex = dropdownItems.value.length - 1
  const offset = event.key === 'ArrowDown' ? 1 : -1
  const current = activeDropdownIndex.value < 0 ? (offset > 0 ? -1 : 0) : activeDropdownIndex.value
  activeDropdownIndex.value = (current + offset + dropdownItems.value.length) % dropdownItems.value.length

  nextTick(() => {
    const activeEl = searchInputWrapperRef.value?.querySelector('.csdn-search__dropdown-item.is-active')
    activeEl?.scrollIntoView?.({ block: 'nearest' })
  })
}

function applyDropdownItem(item) {
  if (typeof item === 'string') {
    query.value = item
  } else {
    query.value = item.title
  }
  showDropdown.value = false
  activeDropdownIndex.value = -1
  submitSearch()
}

function handlePageChange(page, size) {
  currentPage.value = page
  pageSize.value = size
  runSearch()
}

function toggleCategory(slug) {
  activeCategory.value = activeCategory.value === slug ? '' : slug
}

function toggleTag(slug) {
  activeTag.value = activeTag.value === slug ? '' : slug
}

function onDocumentClick(event) {
  if (!searchInputWrapperRef.value?.contains(event.target)) {
    showDropdown.value = false
    activeDropdownIndex.value = -1
  }
}

function loadHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    searchHistory.value = data ? JSON.parse(data) : []
  } catch {
    searchHistory.value = []
  }
}

function saveHistory(value) {
  const text = String(value || '').trim()
  if (text.length <= 1) return
  searchHistory.value = [text, ...searchHistory.value.filter((item) => item !== text)].slice(0, HISTORY_LIMIT)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
}

function clearHistory() {
  searchHistory.value = []
  localStorage.removeItem(HISTORY_KEY)
  showDropdown.value = false
  activeDropdownIndex.value = -1
}

watch([activeCategory, activeTag], () => {
  if (searched.value && query.value) {
    runSearch({ resetPage: true })
  }
})

watch(() => route.query.q, async (nextValue) => {
  const nextQuery = String(nextValue || '')
  if (nextQuery === query.value) return

  query.value = nextQuery
  if (nextQuery) {
    await runSearch({ resetPage: true })
    return
  }

  searched.value = false
  result.value = {
    items: [],
    total: 0,
    page: 1,
    pageSize: pageSize.value,
    facets: { categories: [], tags: [] },
    tookMs: 0,
    terms: [],
    meta: {}
  }
})

onMounted(async () => {
  loadHistory()
  document.addEventListener('click', onDocumentClick)

  const initialQuery = String(route.query.q || '')
  if (initialQuery) {
    query.value = initialQuery
    await runSearch({ resetPage: true })
  }

  nextTick(() => {
    searchInputRef.value?.focus?.()
  })
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  if (suggestTimeout) clearTimeout(suggestTimeout)
})
</script>

<style scoped>
.csdn-search {
  gap: 0;
  min-width: 0;
  min-height: 100%;
  align-content: start;
  overflow-x: clip;
  overflow-y: visible;
}

.enterprise-page.csdn-search {
  min-height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
}

.csdn-search__command {
  position: relative;
  min-width: 0;
  padding: 0 0 14px;
}

.csdn-search__submit {
  padding-inline: 0;
}

.csdn-search__dropdown {
  position: absolute;
  top: calc(100% - 2px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: min(360px, calc(100vh - 180px));
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-elevated);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.1);
}

.csdn-search__dropdown-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px 6px;
}

.csdn-search__dropdown-head strong {
  font-size: 13px;
}

.csdn-search__dropdown-item {
  width: 100%;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  border: none;
  color: var(--text-primary);
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.csdn-search__dropdown-item:hover {
  background: color-mix(in srgb, var(--primary-color) 6%, transparent);
}

.csdn-search__dropdown-item.is-active {
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
}

.enterprise-page .csdn-search__dropdown {
  border-color: var(--console-border);
  background: var(--console-surface);
}

.enterprise-page .csdn-search__dropdown-item {
  color: var(--console-text);
}

.enterprise-page .csdn-search__dropdown-item:hover,
.enterprise-page .csdn-search__dropdown-item.is-active {
  color: var(--console-primary-strong);
  background: var(--console-surface-hover);
}

.enterprise-page .csdn-search__dropdown-item small {
  color: var(--console-text-secondary);
}

.csdn-search__dropdown-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.csdn-search__dropdown-item small {
  color: var(--text-muted);
}

.csdn-search__resultbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 0 0 10px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 13px;
  min-width: 0;
}

.csdn-search__facet-strip {
  min-width: 0;
  max-width: 100%;
  overflow-x: clip;
  overflow-y: visible;
  padding: 8px 0 6px;
  border-bottom: 1px solid var(--border-color);
}

.csdn-search__facet-row {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  margin-bottom: 6px;
  padding-bottom: 2px;
  white-space: nowrap;
  scrollbar-width: thin;
}

.csdn-search__facet-row:last-child {
  margin-bottom: 0;
}

.csdn-search__facet-row strong {
  position: sticky;
  left: 0;
  flex: 0 0 auto;
  padding-right: 4px;
  background: var(--bg-elevated);
  font-size: 13px;
}

.csdn-search__facet-chip {
  flex: 0 0 auto;
  border: none;
  padding: 0;
  color: var(--text-secondary);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
}

.csdn-search__facet-chip.is-active,
.csdn-search__facet-chip:hover {
  color: var(--primary-color);
}

.csdn-search__list {
  min-width: 0;
  margin-top: 2px;
}

:deep(.csdn-search__item) {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  color: inherit;
}

:deep(.csdn-search__item:hover .csdn-search__title) {
  color: var(--primary-color);
}

:deep(.csdn-search__item--plain) {
  grid-template-columns: minmax(0, 1fr);
}

.csdn-search__thumb {
  width: 118px;
  height: 74px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--bg-secondary);
}

.csdn-search__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.csdn-search__body {
  min-width: 0;
}

.csdn-search__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 19px;
  line-height: 1.35;
  transition: color 0.18s ease;
}

.csdn-search__snippet {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.65;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.csdn-search__snippet {
  color: var(--text-muted);
  -webkit-line-clamp: 2;
}

.csdn-search__title :deep(mark),
.csdn-search__snippet :deep(mark) {
  padding: 0 2px;
  color: inherit;
  background: rgba(250, 173, 20, 0.32);
}

.csdn-search__meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.csdn-search__category {
  color: #e65a4f;
}

.csdn-search__state {
  padding: 20px 0;
  color: var(--text-secondary);
}

.csdn-search__state--error {
  color: #ff4d4f;
}

.csdn-search__pagination {
  display: flex;
  justify-content: center;
  padding-top: 14px;
}

@media (max-width: 960px) {
  .csdn-search__resultbar {
    align-items: flex-start;
  }
}

@media (max-width: 720px) {
  :deep(.csdn-search__item) {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 12px;
    padding: 16px 0;
  }

  :deep(.csdn-search__item--plain) {
    grid-template-columns: minmax(0, 1fr);
  }

  .csdn-search__thumb {
    width: 96px;
    height: 64px;
  }

  .csdn-search__title {
    font-size: 17px;
  }

  .csdn-search__snippet {
    font-size: 14px;
  }
}
</style>
