<template>
  <section class="portal-hero">
    <div class="portal-hero-content">
      <a-tag color="blue">企业级个人知识库</a-tag>
      <h1>把技术文章、项目经验和知识资产沉淀成一套可运营的系统</h1>
      <p>
        面向长期维护的个人技术博客门户，公开展示文章与专题；登录后进入知识库系统，管理员可继续进行内容发布、评论审核、媒体管理和站点配置。
      </p>
      <a-space>
        <a-button type="primary" size="large" @click="$router.push('/login')">进入知识库系统</a-button>
        <a-button size="large" @click="$router.push('/articles')">浏览公开文章</a-button>
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
        <span>CAPABILITIES</span>
        <h2>从博客展示到知识库运营</h2>
      </div>
    </div>
    <a-row :gutter="[16, 16]">
      <a-col v-for="item in capabilityItems" :key="item.title" :xs="24" :md="12" :xl="6">
        <a-card :bordered="false" class="portal-capability-card">
          <component :is="item.icon" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </a-card>
      </a-col>
    </a-row>
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
        <a-card hoverable :bordered="false" class="portal-article-card" @click="$router.push(`/articles/${article.slug}`)">
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
import {
  AppstoreOutlined,
  AuditOutlined,
  DatabaseOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import { getPublicHome } from '@/services/public'

const loading = ref(false)
const errorMessage = ref('')
const home = ref({
  stats: {
    articleCount: 0,
    categoryCount: 0,
    tagCount: 0
  },
  categories: [],
  tags: [],
  recentArticles: [],
  recommendedArticles: []
})
const capabilityItems = [
  {
    title: '内容沉淀',
    description: '以 Markdown 文章为核心，形成可分类、可检索、可持续维护的知识资产。',
    icon: FileTextOutlined
  },
  {
    title: '知识组织',
    description: '通过分类、标签和搜索，把零散文章组织成长期可用的知识库结构。',
    icon: AppstoreOutlined
  },
  {
    title: '运营管理',
    description: '管理员可管理文章、评论、媒体、公告和站点信息，保持内容体系健康。',
    icon: AuditOutlined
  },
  {
    title: '数据驱动',
    description: '所有内容进入 MongoDB，不再依赖静态文件，后续迁移和扩展更可控。',
    icon: DatabaseOutlined
  }
]

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
  loadHome()
})
</script>
