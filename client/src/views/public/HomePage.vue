<template>
  <section class="portal-hero">
    <div class="portal-hero-content">
      <a-tag color="blue">企业级个人知识库</a-tag>
      <h1>{{ siteStore.siteTitle }}</h1>
      <p>
        {{ siteStore.siteDescription }}
      </p>
      <a-space>
        <a-button type="primary" size="large" @click="$router.push('/login')">进入知识库系统</a-button>
      </a-space>
    </div>
    <div class="portal-overview-card">
      <span>Knowledge Operations</span>
      <strong>{{ home.stats.articleCount }}</strong>
      <small>已沉淀文章</small>
      <div class="portal-metrics">
        <div>
          <b>{{ home.stats.categoryCount }}</b>
          <em>分类</em>
        </div>
        <div>
          <b>{{ home.stats.tagCount }}</b>
          <em>标签</em>
        </div>
      </div>
    </div>
  </section>

  <section class="portal-section">
    <div class="portal-section-head">
      <div>
        <span>LATEST</span>
        <h2>最近发布</h2>
      </div>
      <a-button @click="$router.push('/articles')">全部文章</a-button>
    </div>
    <a-row :gutter="[16, 16]">
      <a-col v-for="article in home.recentArticles" :key="article.id" :xs="24" :lg="8">
        <a-card
          :bordered="false"
          class="portal-article-card"
          hoverable
          @click="$router.push(`/articles/${article.slug}`)"
        >
          <a-tag>{{ article.category?.name || '未分类' }}</a-tag>
          <h3>{{ article.title }}</h3>
          <p>{{ article.summary || '这篇文章还没有摘要。' }}</p>
          <span>{{ article.readingMinutes }} 分钟阅读</span>
        </a-card>
      </a-col>
    </a-row>
    <a-empty v-if="!loading && home.recentArticles.length === 0" description="后台发布文章后会展示在这里" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getPublicHome } from '@/services/public'
import { useSiteStore } from '@/stores/site'

const loading = ref(false)
const errorMessage = ref('')
const siteStore = useSiteStore()
const home = ref({
  stats: {
    articleCount: 0,
    categoryCount: 0,
    tagCount: 0
  },
  recentArticles: []
})

async function loadHome() {
  loading.value = true
  errorMessage.value = ''

  try {
    home.value = await getPublicHome()
  } catch (error) {
    errorMessage.value = error.message || '首页加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  siteStore.loadProfile()
  loadHome()
})
</script>
