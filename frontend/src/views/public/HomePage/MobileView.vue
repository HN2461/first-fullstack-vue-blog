<template>
  <main class="mobile-home">
    <section class="mobile-home__intro">
      <a-tag color="blue">知识库</a-tag>
      <h1>{{ siteStore.siteTitle }}</h1>
      <p>{{ siteStore.siteDescription }}</p>
      <div class="mobile-home__actions">
        <a-button type="primary" size="large" block @click="router.push(knowledgeEntryPath)">进入知识库系统</a-button>
        <a-button size="large" block @click="filterVisible = true">分类与统计</a-button>
      </div>
    </section>

    <section class="mobile-home__section">
      <div class="mobile-home__section-head">
        <div>
          <span>LATEST</span>
          <h2>最近发布</h2>
        </div>
      </div>

      <div class="mobile-home__list">
        <article
          v-for="article in visibleRecentArticles"
          :key="article.id"
          class="mobile-home__card"
          @click="router.push(`/articles/${article.slug}`)"
        >
          <img v-if="article.cover" :src="article.cover" :alt="article.title">
          <div>
            <a-tag>{{ article.category?.name || '未分类' }}</a-tag>
            <h3>{{ article.title }}</h3>
            <p>{{ article.summary || '这篇文章还没有摘要。' }}</p>
            <span>{{ article.readingMinutes }} 分钟阅读</span>
          </div>
        </article>
      </div>

      <a-empty v-if="!loading && home.recentArticles.length === 0" description="后台发布文章后会展示在这里" />

      <a-pagination
        v-if="home.recentArticles.length > pageSize"
        v-model:current="currentPage"
        class="mobile-home__pagination"
        simple
        :page-size="pageSize"
        :total="home.recentArticles.length"
      />
    </section>

    <section v-if="!loading && home.recommendedArticles.length > 0" class="mobile-home__section">
      <div class="mobile-home__section-head">
        <div>
          <span>RECOMMENDED</span>
          <h2>推荐文章</h2>
        </div>
      </div>

      <div class="mobile-home__list">
        <article
          v-for="article in home.recommendedArticles"
          :key="article.id"
          class="mobile-home__card mobile-home__card--compact"
          @click="router.push(`/articles/${article.slug}`)"
        >
          <img v-if="article.cover" :src="article.cover" :alt="article.title">
          <div>
            <a-tag color="gold">推荐</a-tag>
            <h3>{{ article.title }}</h3>
            <p>{{ article.summary || '这篇文章还没有摘要。' }}</p>
          </div>
        </article>
      </div>
    </section>

    <a-drawer v-model:open="filterVisible" placement="bottom" height="48vh" title="分类与站点统计">
      <div class="mobile-home__stats">
        <div>
          <strong>{{ home.stats.articleCount }}</strong>
          <span>文章</span>
        </div>
        <div>
          <strong>{{ home.stats.categoryCount }}</strong>
          <span>分类</span>
        </div>
        <div>
          <strong>{{ home.stats.tagCount }}</strong>
          <span>标签</span>
        </div>
      </div>
      <p class="mobile-home__drawer-note">移动端保留快速浏览入口，完整检索与管理能力可登录后在控制台使用。</p>
    </a-drawer>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPublicHome } from '@/services/public'
import { useSiteStore } from '@/stores/site'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const siteStore = useSiteStore()
const authStore = useAuthStore()
const loading = ref(false)
const errorMessage = ref('')
const filterVisible = ref(false)
const currentPage = ref(1)
const pageSize = 5
const home = ref({
  stats: {
    articleCount: 0,
    categoryCount: 0,
    tagCount: 0
  },
  recentArticles: [],
  recommendedArticles: []
})

const visibleRecentArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return home.value.recentArticles.slice(start, start + pageSize)
})
const knowledgeEntryPath = computed(() => (authStore.isLoggedIn ? '/console' : '/login?redirect=/console'))

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

<style scoped>
.mobile-home {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  padding: 18px 0 34px;
  color: var(--text-primary);
  background: #f5f7fb;
}

.mobile-home,
.mobile-home * {
  min-width: 0;
  max-width: 100%;
}

.mobile-home__intro,
.mobile-home__section {
  margin: 0 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #ffffff;
}

.mobile-home__intro h1 {
  margin: 14px 0 10px;
  color: #101828;
  font-size: 30px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.mobile-home__intro p {
  margin: 0;
  color: #475467;
  font-size: 16px;
  line-height: 1.75;
}

.mobile-home__actions {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.mobile-home__actions :deep(.ant-btn) {
  min-height: 44px;
}

.mobile-home__section-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.mobile-home__section-head span {
  color: #1677ff;
  font-size: 12px;
  font-weight: 800;
}

.mobile-home__section-head h2 {
  margin: 4px 0 0;
  color: #101828;
  font-size: 22px;
}

.mobile-home__list {
  display: grid;
  gap: 12px;
}

.mobile-home__card {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef0f4;
  cursor: pointer;
}

.mobile-home__card:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.mobile-home__card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f5f9;
}

.mobile-home__card--compact {
  grid-template-columns: minmax(88px, 112px) minmax(0, 1fr);
  align-items: start;
}

.mobile-home__card--compact img {
  aspect-ratio: 1 / 1;
}

.mobile-home__card h3 {
  margin: 10px 0 6px;
  color: #1f2329;
  font-size: 19px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.mobile-home__card p {
  margin: 0 0 8px;
  color: #667085;
  font-size: 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.mobile-home__card span {
  color: #667085;
  font-size: 13px;
}

.mobile-home__pagination {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.mobile-home__pagination :deep(.ant-pagination-simple-pager input),
.mobile-home__pagination :deep(.ant-pagination-prev),
.mobile-home__pagination :deep(.ant-pagination-next) {
  min-width: 44px;
  min-height: 44px;
}

.mobile-home__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.mobile-home__stats div {
  display: grid;
  gap: 4px;
  min-height: 86px;
  align-content: center;
  border: 1px solid #d9e7ff;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  background: #f8fbff;
}

.mobile-home__stats strong {
  color: #0958d9;
  font-size: 26px;
  line-height: 1;
}

.mobile-home__stats span,
.mobile-home__drawer-note {
  color: #667085;
}

.mobile-home__drawer-note {
  margin: 16px 0 0;
  line-height: 1.7;
}

:global(.public-main:has(.mobile-home)) {
  padding: 0 !important;
}

@media (orientation: landscape) and (max-height: 520px) {
  .mobile-home__intro {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 12px;
  }

  .mobile-home__actions {
    align-self: end;
  }
}
</style>
