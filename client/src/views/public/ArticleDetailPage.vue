<template>
  <article :class="inConsole ? 'console-article-detail' : 'article-detail'">
    <p v-if="loading" class="status-text">正在加载文章...</p>
    <p v-else-if="errorMessage" class="status-text is-error">{{ errorMessage }}</p>

    <template v-else>
      <header :class="inConsole ? 'enterprise-page-header' : 'article-detail-head'">
        <router-link :class="inConsole ? 'enterprise-page-kicker' : 'eyebrow'" :to="categoryPath">
          {{ article.category?.name || '未分类' }}
        </router-link>
        <div>
          <h1>{{ article.title }}</h1>
          <p>{{ article.summary }}</p>
          <div class="article-meta">
            <span>{{ article.readingMinutes }} 分钟阅读</span>
            <span>{{ formatDate(article.publishedAt) }}</span>
            <span>{{ article.likeCount }} 赞</span>
            <span>{{ article.favoriteCount }} 收藏</span>
            <router-link
            v-for="tag in article.tags"
            :key="tag.id || tag"
            :to="tagPath(tag.slug)"
          >
            #{{ tag.name }}
          </router-link>
          </div>
        </div>
      </header>

      <div v-if="article.cover" class="article-cover-hero">
        <img :src="article.cover" :alt="article.title">
      </div>

      <section v-if="article.resources?.length" class="article-resource-panel">
        <div class="article-resource-panel__head">
          <h3>关联资源</h3>
          <span>{{ article.resources.length }} 项</span>
        </div>
        <div class="article-resource-list">
          <a
            v-for="resource in article.resources"
            :key="`${resource.url}-${resource.name}`"
            class="article-resource-item"
            :href="resource.url"
            target="_blank"
            rel="noreferrer"
          >
            <div>
              <strong>{{ resource.name }}</strong>
              <p v-if="resource.description">{{ resource.description }}</p>
              <span>{{ resource.kind === 'image' ? '图片资源' : '附件资源' }}</span>
            </div>
            <span class="article-resource-item__action">
              {{ resource.kind === 'image' ? '查看' : '下载' }}
            </span>
          </a>
        </div>
      </section>

      <div class="article-actions">
        <button class="icon-button" type="button" :disabled="!authStore.isLoggedIn" @click="likeCurrentArticle">
          点赞
        </button>
        <button class="icon-button" type="button" :disabled="!authStore.isLoggedIn" @click="favoriteCurrentArticle">
          收藏
        </button>
        <router-link v-if="!authStore.isLoggedIn" to="/login">登录后参与互动</router-link>
      </div>

      <div :class="inConsole ? 'console-reader-card' : ''">
        <MarkdownRenderer :content="article.contentMarkdown" :asset-base="legacyAssetBase" />
      </div>

      <section class="comment-section">
        <div class="admin-page-head">
          <div>
            <p class="eyebrow">评论</p>
            <h2>读者讨论</h2>
          </div>
        </div>

        <form v-if="authStore.isLoggedIn" class="comment-form" @submit.prevent="submitComment">
          <textarea v-model.trim="commentContent" rows="4" placeholder="写下你的想法，包含链接的评论会进入审核。"></textarea>
          <button class="primary-button" type="submit" :disabled="submittingComment">
            {{ submittingComment ? '提交中...' : '发表评论' }}
          </button>
        </form>
        <p v-else class="status-text">登录后可以发表评论。</p>
        <p v-if="commentMessage" class="status-text">{{ commentMessage }}</p>

        <div class="comment-list">
          <article v-for="comment in comments" :key="comment.id" class="comment-item">
            <strong>{{ comment.user?.username || '读者' }}</strong>
            <p>{{ comment.content }}</p>
            <button class="text-button" type="button" @click="reportCurrentComment(comment.id)">举报</button>
          </article>
          <p v-if="comments.length === 0" class="status-text">还没有评论。</p>
        </div>
      </section>
    </template>
  </article>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createComment, favoriteArticle, likeArticle, listComments, reportComment } from '@/services/interaction'
import { getPublicArticle } from '@/services/public'

const MarkdownRenderer = defineAsyncComponent(() => import('@/components/MarkdownRenderer.vue'))

const route = useRoute()
const authStore = useAuthStore()
const inConsole = computed(() => route.path.startsWith('/console'))
const categoryPath = computed(() => {
  const slug = article.value.category?.slug
  if (!slug) return inConsole.value ? '/console/articles' : '/articles'
  return inConsole.value ? `/console/categories/${slug}` : `/categories/${slug}`
})
function tagPath(slug) {
  return inConsole.value ? `/console/tags/${slug}` : `/tags/${slug}`
}
const legacyAssetBase = computed(() => {
  if (article.value.source !== 'legacy-notes' || !article.value.sourcePath) return ''
  const directory = article.value.sourcePath.split('/').slice(0, -1).map(encodeURIComponent).join('/')
  return directory ? `/legacy-notes/${directory}` : '/legacy-notes'
})
const loading = ref(false)
const errorMessage = ref('')
const commentContent = ref('')
const commentMessage = ref('')
const submittingComment = ref(false)
const comments = ref([])
const article = ref({
  id: '',
  title: '',
  summary: '',
  contentMarkdown: '',
  cover: '',
  resources: [],
  category: null,
  tags: []
})

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : ''
}

async function loadComments() {
  if (!article.value.id) return
  comments.value = await listComments(article.value.id)
}

async function loadArticle() {
  loading.value = true
  errorMessage.value = ''

  try {
    article.value = await getPublicArticle(route.params.slug)
    await loadComments()
  } catch (error) {
    errorMessage.value = error.message || '文章加载失败'
  } finally {
    loading.value = false
  }
}

async function likeCurrentArticle() {
  article.value = await likeArticle(article.value.id)
}

async function favoriteCurrentArticle() {
  article.value = await favoriteArticle(article.value.id)
}

async function submitComment() {
  if (!commentContent.value) return

  submittingComment.value = true
  commentMessage.value = ''

  try {
    const comment = await createComment({
      articleId: article.value.id,
      content: commentContent.value
    })
    commentContent.value = ''
    commentMessage.value = comment.status === 'pending'
      ? '评论已提交审核'
      : '评论已发布'
    await loadComments()
  } catch (error) {
    commentMessage.value = error.message || '评论提交失败'
  } finally {
    submittingComment.value = false
  }
}

async function reportCurrentComment(id) {
  await reportComment(id)
  commentMessage.value = '举报已提交，评论将进入审核'
  await loadComments()
}

onMounted(loadArticle)
watch(() => route.params.slug, loadArticle)
</script>

<style scoped>
.article-cover-hero {
  margin-bottom: 20px;
  overflow: hidden;
  border-radius: 10px;
  background: #f5f5f5;
}

.article-cover-hero img {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  display: block;
}

.article-resource-panel {
  margin: 0 0 20px;
  padding: 16px 18px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  background: #fff;
}

.article-resource-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.article-resource-panel__head h3 {
  margin: 0;
  font-size: 16px;
  color: #1f1f1f;
}

.article-resource-panel__head span {
  font-size: 12px;
  color: #8c8c8c;
}

.article-resource-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.article-resource-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fafafa;
  color: inherit;
  text-decoration: none;
  transition: background 0.2s ease;
}

.article-resource-item:hover {
  background: #f0f5ff;
}

.article-resource-item strong {
  display: block;
  margin-bottom: 4px;
  color: #1f1f1f;
}

.article-resource-item p {
  margin: 0 0 4px;
  font-size: 13px;
  color: #595959;
}

.article-resource-item span {
  font-size: 12px;
  color: #8c8c8c;
}

.article-resource-item__action {
  flex-shrink: 0;
  color: #1677ff !important;
  font-weight: 500;
}
</style>
