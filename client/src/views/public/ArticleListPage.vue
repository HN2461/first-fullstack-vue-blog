<template>
  <section :class="inConsole ? 'enterprise-page' : 'section-panel'">
    <div :class="inConsole ? 'enterprise-page-header' : 'admin-page-head'">
      <div>
        <p :class="inConsole ? 'enterprise-page-kicker' : 'eyebrow'">{{ pageEyebrow }}</p>
        <h2>文章列表</h2>
        <p v-if="inConsole">按分类浏览知识库文章，点击任意条目可在控制台工作区内阅读全文。</p>
      </div>
      <router-link :class="inConsole ? 'ant-btn ant-btn-default' : 'icon-button'" :to="searchPath">搜索</router-link>
    </div>

    <a-card v-if="inConsole" class="enterprise-table-card" :bordered="false">
      <template #title>
        <div class="table-title">
          <strong>{{ route.params.category ? '分类文章' : '全部文章' }}</strong>
          <span>共 {{ result.total }} 篇</span>
        </div>
      </template>
      <p v-if="loading" class="status-text">正在加载文章...</p>
      <p v-else-if="errorMessage" class="status-text is-error">{{ errorMessage }}</p>
      <div v-else class="console-article-list">
        <router-link
          v-for="article in result.items"
          :key="article.id"
          class="console-article-row"
          :to="articlePath(article.slug)"
        >
          <div>
            <a-tag>{{ article.category?.name || '未分类' }}</a-tag>
            <h3>{{ article.title }}</h3>
            <p>{{ article.summary || '这篇文章还没有摘要。' }}</p>
          </div>
          <span>{{ article.readingMinutes }} 分钟</span>
        </router-link>
        <a-empty v-if="result.items.length === 0" description="暂无已发布文章" />
      </div>
    </a-card>

    <template v-else>
      <p v-if="loading" class="status-text">正在加载文章...</p>
      <p v-else-if="errorMessage" class="status-text is-error">{{ errorMessage }}</p>
    </template>

    <div v-if="!inConsole && !loading && !errorMessage" class="article-list">
      <router-link
        v-for="article in result.items"
        :key="article.id"
        class="article-row"
        :to="articlePath(article.slug)"
      >
        <div>
          <span>{{ article.category?.name || '未分类' }}</span>
          <h3>{{ article.title }}</h3>
          <p>{{ article.summary || '这篇文章还没有摘要。' }}</p>
        </div>
        <small>{{ article.readingMinutes }} 分钟</small>
      </router-link>
      <p v-if="result.items.length === 0" class="status-text">暂无已发布文章。</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { listPublicArticles } from '@/services/public'

const route = useRoute()
const loading = ref(false)
const errorMessage = ref('')
const result = ref({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10
})

const pageEyebrow = computed(() => {
  if (route.params.category) return `分类 / ${route.params.category}`
  if (route.params.tag) return `标签 / ${route.params.tag}`
  return '全部文章'
})
const inConsole = computed(() => route.path.startsWith('/console'))
const searchPath = computed(() => inConsole.value ? '/console/search' : '/search')

function articlePath(slug) {
  return inConsole.value ? `/console/articles/${slug}` : `/articles/${slug}`
}

async function loadArticles() {
  loading.value = true
  errorMessage.value = ''

  try {
    result.value = await listPublicArticles({
      category: route.params.category,
      tag: route.params.tag
    })
  } catch (error) {
    errorMessage.value = error.message || '文章加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadArticles)
watch(() => route.fullPath, loadArticles)
</script>
