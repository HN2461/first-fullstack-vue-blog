<template>
  <section :class="inConsole ? 'enterprise-page' : 'section-panel'">
    <div :class="inConsole ? 'enterprise-page-header' : 'admin-page-head'">
      <div>
        <p :class="inConsole ? 'enterprise-page-kicker' : 'eyebrow'">SEARCH</p>
        <h2>检索文章</h2>
        <p v-if="inConsole">在知识库范围内按标题、摘要和正文检索内容。</p>
      </div>
    </div>

    <a-card v-if="inConsole" class="enterprise-filter-card" :bordered="false">
      <a-space :size="12">
        <a-input v-model:value.trim="query" style="width: 360px" placeholder="输入关键词" @pressEnter="runSearch" />
        <a-button type="primary" @click="runSearch">搜索</a-button>
      </a-space>
    </a-card>

    <form v-else class="inline-form" @submit.prevent="runSearch">
      <input v-model.trim="query" placeholder="输入关键词">
      <button class="primary-button" type="submit">搜索</button>
    </form>

    <a-card v-if="inConsole" class="enterprise-table-card" :bordered="false">
      <template #title>
        <div class="table-title">
          <strong>搜索结果</strong>
          <span>{{ searched ? `共 ${result.total} 条结果` : '输入关键词后开始检索' }}</span>
        </div>
      </template>
      <p v-if="loading" class="status-text padded-status">正在搜索...</p>
      <p v-else-if="errorMessage" class="status-text is-error padded-status">{{ errorMessage }}</p>
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
          <small>{{ article.readingMinutes }} 分钟</small>
        </router-link>
        <a-empty v-if="searched && result.items.length === 0" description="没有找到相关文章" />
      </div>
    </a-card>

    <template v-else>
      <p v-if="loading" class="status-text">正在搜索...</p>
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
      <p v-if="searched && result.items.length === 0" class="status-text">没有找到相关文章。</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { searchPublicArticles } from '@/services/public'

const route = useRoute()
const query = ref('')
const searched = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const result = ref({
  items: [],
  total: 0
})
const inConsole = computed(() => route.path.startsWith('/console'))

function articlePath(slug) {
  return inConsole.value ? `/console/articles/${slug}` : `/articles/${slug}`
}

async function runSearch() {
  loading.value = true
  searched.value = true
  errorMessage.value = ''

  try {
    result.value = await searchPublicArticles({ q: query.value })
  } catch (error) {
    errorMessage.value = error.message || '搜索失败'
  } finally {
    loading.value = false
  }
}
</script>
