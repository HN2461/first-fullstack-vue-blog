<template>
  <section :class="inConsole ? 'enterprise-page' : 'section-panel'">
    <div :class="inConsole ? 'enterprise-page-header' : 'admin-page-head'">
      <div>
        <p :class="inConsole ? 'enterprise-page-kicker' : 'eyebrow'">SEARCH</p>
        <h2>全文检索</h2>
        <p v-if="inConsole">按标题、摘要、正文和标签名检索知识库内容，支持多词组合与相关度排序。</p>
      </div>
    </div>

    <!-- ── 搜索框 ── -->
    <a-card v-if="inConsole" class="enterprise-filter-card" :bordered="false">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <a-input
            ref="searchInputRef"
            v-model:value.trim="query"
            style="flex: 1; max-width: 480px"
            placeholder="输入关键词，空格分隔多词…"
            allow-clear
            @input="onInputChange"
            @pressEnter="runSearch"
          >
            <template #prefix>
              <SearchOutlined style="color: rgba(0,0,0,0.25)" />
            </template>
          </a-input>

          <!-- 搜索建议下拉（相对于 search-input-wrapper 定位） -->
          <div v-if="showSuggestions && suggestions.length > 0" class="suggest-dropdown">
            <div
              v-for="item in suggestions"
              :key="item.slug"
              class="suggest-item"
              @mousedown.prevent="applySuggestion(item)"
            >
              <SearchOutlined style="color: rgba(0,0,0,0.35); margin-right: 8px" />
              <span class="suggest-title">{{ item.title }}</span>
              <a-tag v-if="item.category" size="small" style="margin-left: auto">{{ item.category.name }}</a-tag>
            </div>
          </div>
        </div>

        <a-button type="primary" :loading="loading" @click="runSearch">搜索</a-button>

        <!-- 多词匹配模式 -->
        <div v-if="hasMultipleWords" class="match-mode-group">
          <a-radio-group v-model:value="matchMode" size="small" button-style="solid" @change="onModeChange">
            <a-radio-button value="AND">全部包含</a-radio-button>
            <a-radio-button value="OR">任意包含</a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </a-card>

    <form v-else class="inline-form" @submit.prevent="runSearch">
      <div class="public-search-row">
        <input
          ref="searchInputRef"
          v-model.trim="query"
          placeholder="输入关键词，空格分隔多词…"
          @input="onInputChange"
        >
        <button class="primary-button" type="submit">搜索</button>
        <div v-if="hasMultipleWords" class="match-mode-public">
          <button
            type="button"
            :class="['mode-toggle', { active: matchMode === 'AND' }]"
            @click="matchMode = 'AND'; runSearch()"
          >全部</button>
          <button
            type="button"
            :class="['mode-toggle', { active: matchMode === 'OR' }]"
            @click="matchMode = 'OR'; runSearch()"
          >任意</button>
        </div>
      </div>
    </form>

    <!-- ── 结果面板 ── -->
    <a-card v-if="inConsole" class="enterprise-table-card" :bordered="false">
      <template #title>
        <div class="table-title">
          <strong>搜索结果</strong>
          <span v-if="!searched">输入关键词后开始检索</span>
          <span v-else-if="!loading">
            共 <strong>{{ total }}</strong> 条结果
            <template v-if="tookMs > 0"> · 耗时 {{ tookMs }}ms</template>
            <template v-if="searchTerms.length > 0"> · {{ searchTerms.join(' + ') }}</template>
          </span>
        </div>
      </template>

      <template #extra>
        <!-- 排序选择 -->
        <a-radio-group v-if="searched && total > 0" v-model:value="sortBy" size="small" @change="onSortChange">
          <a-radio-button value="relevance">相关度</a-radio-button>
          <a-radio-button value="date">最新</a-radio-button>
          <a-radio-button value="views">浏览量</a-radio-button>
        </a-radio-group>
      </template>

      <a-spin :spinning="loading">
        <p v-if="errorMessage" class="status-text is-error padded-status">{{ errorMessage }}</p>

        <template v-else-if="searched && total > 0">
          <!-- 分类 + 标签 Facet 筛选 -->
          <div v-if="facets.categories.length > 1 || facets.tags.length > 0" class="facet-bar">
            <div v-if="facets.categories.length > 1" class="facet-group">
              <span class="facet-label">分类：</span>
              <a-tag
                :color="!activeCategory ? 'blue' : ''"
                style="cursor: pointer"
                @click="activeCategory = ''"
              >全部</a-tag>
              <a-tag
                v-for="cat in facets.categories"
                :key="cat.slug"
                :color="activeCategory === cat.slug ? 'blue' : ''"
                style="cursor: pointer"
                @click="activeCategory = activeCategory === cat.slug ? '' : cat.slug"
              >{{ cat.name }} ({{ cat.count }})</a-tag>
            </div>
            <div v-if="facets.tags.length > 0" class="facet-group">
              <span class="facet-label">标签：</span>
              <a-tag
                v-for="t in facets.tags"
                :key="t.slug"
                :color="activeTag === t.slug ? 'green' : ''"
                style="cursor: pointer"
                @click="activeTag = activeTag === t.slug ? '' : t.slug"
              >{{ t.name }} ({{ t.count }})</a-tag>
            </div>
          </div>

          <!-- 结果列表 -->
          <div class="search-result-list">
            <router-link
              v-for="article in pagedItems"
              :key="article.id"
              class="search-result-item"
              :to="articlePath(article.slug)"
            >
              <div class="result-item-head">
                <a-tag v-if="article.category" size="small">{{ article.category.name || '未分类' }}</a-tag>
                <span class="result-item-meta">
                  {{ formatDate(article.publishedAt || article.createdAt) }}
                  · {{ article.wordCount || 0 }} 字
                  · {{ article.readingMinutes || 1 }} 分钟
                  <template v-if="article.viewCount > 0"> · {{ article.viewCount }} 浏览</template>
                </span>
                <span v-if="article.relevanceScore > 0" class="result-item-score">
                  相关度 {{ article.relevanceScore }}
                </span>
              </div>
              <h3 class="result-item-title" v-html="article.highlightedTitle || article.title"></h3>
              <p class="result-item-summary" v-html="article.highlightedSummary || article.summary"></p>
              <p v-if="article.snippet" class="result-item-snippet">{{ article.snippet }}</p>
              <div class="result-item-footer">
                <div class="result-item-tags">
                  <a-tag
                    v-for="t in (article.tags || []).slice(0, 5)"
                    :key="t.id || t.slug"
                    size="small"
                  >{{ t.name }}</a-tag>
                </div>
                <span class="result-item-author" v-if="article.author">
                  {{ article.author.username }}
                </span>
              </div>
            </router-link>
          </div>

          <!-- 分页 -->
          <div class="search-pagination" v-if="totalPages > 1">
            <a-pagination
              v-model:current="currentPage"
              :total="total"
              :page-size="pageSize"
              :show-size-changer="true"
              :page-size-options="['10', '20', '50']"
              size="small"
              show-quick-jumper
              @change="onPageChange"
            />
          </div>
        </template>

        <!-- 无结果 -->
        <a-empty v-else-if="searched && total === 0" description="没有找到相关文章">
          <template #description>
            <p>没有找到"{{ query }}"相关文章</p>
            <p style="color: rgba(0,0,0,0.45); font-size: 13px">试试更短的关键词，或切换匹配模式为"任意包含"</p>
          </template>
        </a-empty>
      </a-spin>
    </a-card>

    <!-- ── 公共页面结果 ── -->
    <template v-else>
      <p v-if="loading" class="status-text">正在搜索...</p>
      <p v-else-if="errorMessage" class="status-text is-error">{{ errorMessage }}</p>

      <div v-if="!loading && !errorMessage && searched && total > 0" class="article-list">
        <div class="public-result-meta">
          共 {{ total }} 条结果
          <template v-if="tookMs > 0"> · {{ tookMs }}ms</template>
          <div class="public-sort-btns">
            <button :class="['sort-btn', { active: sortBy === 'relevance' }]" @click="sortBy = 'relevance'; runSearch()">相关度</button>
            <button :class="['sort-btn', { active: sortBy === 'date' }]" @click="sortBy = 'date'; runSearch()">最新</button>
            <button :class="['sort-btn', { active: sortBy === 'views' }]" @click="sortBy = 'views'; runSearch()">浏览量</button>
          </div>
        </div>

        <router-link
          v-for="article in pagedItems"
          :key="article.id"
          class="article-row"
          :to="articlePath(article.slug)"
        >
          <div>
            <span>{{ article.category?.name || '未分类' }}</span>
            <h3 v-html="article.highlightedTitle || article.title"></h3>
            <p v-html="article.highlightedSummary || article.summary || '这篇文章还没有摘要。'"></p>
          </div>
          <small>{{ article.readingMinutes }} 分钟</small>
        </router-link>

        <div v-if="totalPages > 1" class="public-pagination">
          <button :disabled="currentPage <= 1" @click="currentPage--; runSearch()">上一页</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button :disabled="currentPage >= totalPages" @click="currentPage++; runSearch()">下一页</button>
        </div>
      </div>

      <p v-else-if="searched && total === 0" class="status-text">没有找到相关文章。</p>
    </template>

    <!-- ── 搜索历史 ── -->
    <a-card
      v-if="inConsole && !searched && searchHistory.length > 0"
      class="enterprise-filter-card"
      :bordered="false"
      style="margin-top: 12px"
    >
      <template #title>
        <div class="table-title">
          <strong>最近搜索</strong>
          <a-button type="link" size="small" danger @click="clearHistory">清空</a-button>
        </div>
      </template>
      <div class="history-tags">
        <a-tag
          v-for="(item, idx) in searchHistory"
          :key="idx"
          style="cursor: pointer; margin-bottom: 4px"
          @click="applyHistory(item)"
        >{{ item }}</a-tag>
      </div>
    </a-card>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getSearchSuggestions, searchPublicArticles } from '@/services/public'

const route = useRoute()

// ── 状态 ──
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

// 搜索建议
const suggestions = ref([])
const showSuggestions = ref(false)
let suggestTimeout = null

// 搜索历史
const HISTORY_KEY = 'blog-search-history'
const HISTORY_LIMIT = 10
const searchHistory = ref([])

// 结果数据
const result = ref({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  facets: { categories: [], tags: [] },
  tookMs: 0,
  terms: []
})

const inConsole = computed(() => route.path.startsWith('/console'))

const hasMultipleWords = computed(() => {
  const terms = splitTerms(query.value)
  return terms.length > 1
})

const total = computed(() => result.value.total || 0)
const tookMs = computed(() => result.value.tookMs || 0)
const searchTerms = computed(() => result.value.terms || [])
const facets = computed(() => result.value.facets || { categories: [], tags: [] })

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const pagedItems = computed(() => {
  return result.value.items || []
})

// ── 方法 ──

function splitTerms(raw = '') {
  return Array.from(
    new Set(
      String(raw || '')
        .trim()
        .split(/[\s,，、|]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    )
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function articlePath(slug) {
  return inConsole.value ? `/console/articles/${slug}` : `/articles/${slug}`
}

async function runSearch() {
  if (!query.value) {
    result.value = { items: [], total: 0, page: 1, pageSize: 10, facets: { categories: [], tags: [] }, tookMs: 0, terms: [] }
    searched.value = false
    return
  }

  loading.value = true
  searched.value = true
  errorMessage.value = ''
  showSuggestions.value = false

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

// 输入时搜索建议 + 防抖搜索
function onInputChange() {
  // 搜索建议
  if (suggestTimeout) clearTimeout(suggestTimeout)
  if (query.value.length >= 1) {
    suggestTimeout = setTimeout(async () => {
      try {
        const res = await getSearchSuggestions({ q: query.value })
        suggestions.value = res.items || []
        showSuggestions.value = suggestions.value.length > 0
      } catch {
        suggestions.value = []
      }
    }, 200)
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
}

function applySuggestion(item) {
  query.value = item.title
  showSuggestions.value = false
  suggestions.value = []
  currentPage.value = 1
  runSearch()
}

function onModeChange() {
  currentPage.value = 1
  runSearch()
}

function onSortChange() {
  currentPage.value = 1
  runSearch()
}

function onPageChange(page, size) {
  currentPage.value = page
  pageSize.value = size
  runSearch()
}

// 点击外部关闭建议
function onDocumentClick(e) {
  if (showSuggestions.value) {
    showSuggestions.value = false
  }
}

// ── 搜索历史 ──

function loadHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    searchHistory.value = data ? JSON.parse(data) : []
  } catch {
    searchHistory.value = []
  }
}

function saveHistory(q) {
  const trimmed = q.trim()
  if (trimmed.length <= 1) return
  const list = [trimmed, ...searchHistory.value.filter((item) => item !== trimmed)]
  searchHistory.value = list.slice(0, HISTORY_LIMIT)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
}

function clearHistory() {
  searchHistory.value = []
  localStorage.removeItem(HISTORY_KEY)
}

function applyHistory(item) {
  query.value = item
  currentPage.value = 1
  runSearch()
}

// ── 生命周期 ──

onMounted(async () => {
  loadHistory()
  document.addEventListener('click', onDocumentClick)

  // 从 URL 读取初始搜索词
  const urlQuery = route.query.q || ''
  if (urlQuery) {
    query.value = urlQuery
    await runSearch()
  }

  nextTick(() => {
    searchInputRef.value?.focus?.()
  })
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  if (suggestTimeout) clearTimeout(suggestTimeout)
})

// 监听筛选条件变化 → 重新搜索
watch([activeCategory, activeTag], () => {
  if (searched.value) {
    currentPage.value = 1
    runSearch()
  }
})
</script>

<style scoped>
/* ── 搜索栏 ── */
.search-bar {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 480px;
  min-width: 200px;
}

.match-mode-group {
  flex-shrink: 0;
}

/* ── 搜索建议下拉 ── */
.suggest-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 100;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.suggest-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.suggest-item:hover {
  background: rgba(22, 119, 255, 0.06);
}

.suggest-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

/* ── Facet 筛选 ── */
.facet-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.facet-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.facet-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
  margin-right: 4px;
  white-space: nowrap;
}

/* ── 搜索结果列表 ── */
.search-result-list {
  display: grid;
  gap: 12px;
}

.search-result-item {
  display: block;
  padding: 16px 20px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  background: #fafafa;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.search-result-item:hover {
  border-color: rgba(22, 119, 255, 0.35);
  background: #fff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.06);
}

.result-item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.result-item-meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.result-item-score {
  margin-left: auto;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.3);
  font-family: 'JetBrains Mono', monospace;
}

.result-item-title {
  margin: 8px 0 6px;
  font-size: 17px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  line-height: 1.5;
}

.result-item-title :deep(mark) {
  padding: 0 2px;
  border-radius: 3px;
  background: rgba(250, 173, 20, 0.25);
  color: inherit;
}

.result-item-summary {
  margin: 0 0 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.55);
  line-height: 1.7;
}

.result-item-summary :deep(mark) {
  padding: 0 2px;
  border-radius: 3px;
  background: rgba(250, 173, 20, 0.25);
  color: inherit;
}

.result-item-snippet {
  margin: 0 0 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  line-height: 1.7;
  max-height: 3.4em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.result-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.result-item-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.result-item-author {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.35);
}

/* ── 分页 ── */
.search-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* ── 搜索历史 ── */
.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* ── 公共页面样式 ── */
.public-search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.public-search-row input {
  flex: 1;
  min-width: 200px;
}

.match-mode-public {
  display: flex;
  gap: 4px;
}

.mode-toggle {
  padding: 6px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle.active {
  border-color: #1677ff;
  color: #1677ff;
  background: rgba(22, 119, 255, 0.06);
}

.public-result-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
}

.public-sort-btns {
  display: flex;
  gap: 4px;
}

.public-sort-btns .sort-btn {
  padding: 3px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.public-sort-btns .sort-btn.active {
  border-color: #1677ff;
  color: #1677ff;
  background: rgba(22, 119, 255, 0.06);
}

.public-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.public-pagination button {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.public-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── 通用 ── */
.status-text {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.status-text.is-error {
  color: #ff4d4f;
}

.padded-status {
  padding: 24px 0;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title strong {
  font-size: 15px;
}

.table-title span {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: normal;
}

/* ── 深色主题适配 ── */
:deep(.ant-card) .search-result-item {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.ant-card) .search-result-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(22, 119, 255, 0.35);
}

:deep(.ant-card) .suggest-dropdown {
  background: #1f1f1f;
  border-color: rgba(255, 255, 255, 0.12);
}

:deep(.ant-card) .suggest-item:hover {
  background: rgba(22, 119, 255, 0.12);
}
</style>
