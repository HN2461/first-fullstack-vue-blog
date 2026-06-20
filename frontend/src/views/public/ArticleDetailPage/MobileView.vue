<template>
  <section class="mobile-reader" :class="{ 'mobile-reader--console': inConsole }">
    <div v-if="loading" class="mobile-reader__state" aria-busy="true">正在加载文章...</div>
    <div v-else-if="errorMessage" class="mobile-reader__state mobile-reader__state--error">{{ errorMessage }}</div>

    <template v-else>
      <header class="mobile-reader__topbar">
        <a-button class="mobile-reader__icon-btn" type="text" :aria-label="backLabel" @click="goBack">
          <template #icon><ArrowLeftOutlined /></template>
        </a-button>
        <strong>阅读</strong>
        <a-button
          class="mobile-reader__icon-btn"
          type="text"
          :class="{ 'is-active': favoritedByCurrentUser }"
          :disabled="!authStore.isLoggedIn"
          aria-label="收藏文章"
          @click="toggleFavorite"
        >
          <template #icon><StarOutlined /></template>
        </a-button>
      </header>

      <article class="mobile-reader__article">
        <div class="mobile-reader__kicker">
          <router-link v-if="article.category?.slug" :to="categoryPath">{{ article.category.name }}</router-link>
          <span>{{ formatDate(article.publishedAt || article.createdAt) }} 发布</span>
        </div>

        <h1>{{ article.title }}</h1>

        <div class="mobile-reader__meta">
          <span>{{ formatMetric(article.viewCount) }} 阅读</span>
          <span>{{ formatMetric(likeCount) }} 点赞</span>
          <span>{{ formatMetric(favoriteCount) }} 收藏</span>
          <span>{{ article.author?.username || '知识库作者' }}</span>
        </div>

        <div v-if="article.tags?.length" class="mobile-reader__chips">
          <router-link
            v-for="tag in article.tags"
            :key="tag.id || tag.slug || tag.name"
            :to="tagPath(tag.slug)"
          >
            #{{ tag.name }}
          </router-link>
        </div>

        <div v-if="article.resources?.length" class="mobile-reader__resources">
          <strong>关联资源</strong>
          <a
            v-for="resource in article.resources"
            :key="`${resource.url}-${resource.name}`"
            :href="resource.url"
            target="_blank"
            rel="noreferrer"
          >
            {{ resource.name }}
          </a>
        </div>

        <div class="mobile-reader__content">
          <MarkdownRenderer
            :content="article.contentMarkdown"
            :asset-base="legacyAssetBase"
          />
        </div>
      </article>

      <a-drawer
        v-model:open="tocVisible"
        placement="bottom"
        height="58vh"
        title="文章目录"
        class="mobile-reader__drawer"
      >
        <TableOfContents v-if="toc.length" :toc="toc" @navigate="tocVisible = false" />
        <a-empty v-else description="当前文章暂无目录" />
      </a-drawer>

      <a-drawer
        v-model:open="commentDrawerVisible"
        placement="bottom"
        height="72vh"
        title="评论"
        class="mobile-reader__drawer"
      >
        <div class="mobile-reader__comment-panel">
          <form
            v-if="authStore.isLoggedIn && commentsEnabled"
            class="mobile-reader__comment-form"
            @submit.prevent="submitComment"
          >
            <a-textarea
              v-model:value.trim="commentContent"
              :rows="4"
              :maxlength="1000"
              show-count
              placeholder="写下你的评论，包含链接的评论会进入审核。"
            />
            <a-button type="primary" html-type="submit" block :loading="submittingComment">
              发表评论
            </a-button>
          </form>
          <div v-else-if="!commentsEnabled" class="mobile-reader__tip">评论功能已关闭，历史评论仍可查看。</div>
          <div v-else class="mobile-reader__tip">登录后可以发表评论。</div>

          <div v-if="commentMessage" class="mobile-reader__tip">{{ commentMessage }}</div>

          <article v-for="comment in comments" :key="comment.id" class="mobile-reader__comment">
            <div>
              <strong>{{ comment.user?.username || '读者' }}</strong>
              <span>{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p>{{ comment.content }}</p>
            <a-button type="link" size="small" @click="reportCurrentComment(comment.id)">举报</a-button>
          </article>

          <a-empty v-if="comments.length === 0" description="还没有评论" />
        </div>
      </a-drawer>

      <footer class="mobile-reader__actions" aria-label="文章操作">
        <button type="button" :class="{ 'is-active is-like': likedByCurrentUser }" @click="toggleLike">
          <LikeOutlined />
          <span>{{ formatMetric(likeCount) }}</span>
        </button>
        <button type="button" @click="openCommentDrawer">
          <MessageOutlined />
          <span>{{ formatMetric(article.commentCount) }}</span>
        </button>
        <button type="button" :disabled="!article.resources?.length" @click="downloadPrimaryResource">
          <DownloadOutlined />
          <span>下载</span>
        </button>
        <button type="button" @click="tocVisible = true">
          <UnorderedListOutlined />
          <span>目录</span>
        </button>
        <button type="button" @click="shareArticle">
          <ShareAltOutlined />
          <span>分享</span>
        </button>
      </footer>
    </template>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
  StarOutlined,
  UnorderedListOutlined
} from '@ant-design/icons-vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import TableOfContents from '@/components/TableOfContents.vue'
import { useAuthStore } from '@/stores/auth'
import { useSiteStore } from '@/stores/site'
import {
  createComment,
  favoriteArticle,
  likeArticle,
  listComments,
  reportComment,
  unfavoriteArticle,
  unlikeArticle
} from '@/services/interaction'
import { getPublicArticle } from '@/services/public'
import { extractTOC } from '@/utils/markdown'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const siteStore = useSiteStore()

const loading = ref(false)
const errorMessage = ref('')
const tocVisible = ref(false)
const commentDrawerVisible = ref(false)
const comments = ref([])
const commentContent = ref('')
const commentMessage = ref('')
const submittingComment = ref(false)
const likeCount = ref(0)
const favoriteCount = ref(0)
const likedByCurrentUser = ref(false)
const favoritedByCurrentUser = ref(false)
const article = ref({
  id: '',
  title: '',
  contentMarkdown: '',
  resources: [],
  tags: [],
  category: null,
  author: null,
  likeCount: 0,
  favoriteCount: 0,
  commentCount: 0,
  viewCount: 0,
  publishedAt: '',
  createdAt: '',
  source: '',
  sourcePath: '',
  likedByCurrentUser: false,
  favoritedByCurrentUser: false
})

const inConsole = computed(() => route.path.startsWith('/console'))
const backLabel = computed(() => (inConsole.value ? '返回知识库文章列表' : '返回首页'))
const commentsEnabled = computed(() => siteStore.profile.commentEnabled !== false)
const toc = computed(() => extractTOC(article.value.contentMarkdown).filter((item) => item.level >= 1 && item.level <= 4))
const categoryPath = computed(() => {
  const slug = article.value.category?.slug
  if (!slug) return inConsole.value ? '/console/articles' : '/articles'
  return inConsole.value ? `/console/categories/${slug}` : `/categories/${slug}`
})
const legacyAssetBase = computed(() => {
  if (article.value.source !== 'legacy-notes' || !article.value.sourcePath) return ''
  const directory = article.value.sourcePath.split('/').slice(0, -1).map(encodeURIComponent).join('/')
  return directory ? `/legacy-notes/${directory}` : '/legacy-notes'
})

function tagPath(slug) {
  return inConsole.value ? `/console/tags/${slug}` : `/tags/${slug}`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : ''
}

function formatMetric(value = 0) {
  const count = Number(value) || 0
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`
  return `${count}`
}

function goBack() {
  const fallback = inConsole.value ? '/console/articles' : '/'
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push(fallback)
}

async function loadComments() {
  if (!article.value.id) return
  comments.value = await listComments(article.value.id)
}

async function loadArticle() {
  loading.value = true
  errorMessage.value = ''
  tocVisible.value = false

  try {
    const result = await getPublicArticle(route.params.slug)
    article.value = result
    likeCount.value = Number(result.likeCount) || 0
    favoriteCount.value = Number(result.favoriteCount) || 0
    likedByCurrentUser.value = !!result.likedByCurrentUser
    favoritedByCurrentUser.value = !!result.favoritedByCurrentUser
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'auto' })
    if (commentDrawerVisible.value) {
      await loadComments()
    }
  } catch (error) {
    errorMessage.value = error.message || '文章加载失败'
  } finally {
    loading.value = false
  }
}

async function toggleLike() {
  if (!authStore.isLoggedIn) {
    message.info('请先登录后再点赞')
    return
  }

  const result = likedByCurrentUser.value
    ? await unlikeArticle(article.value.id)
    : await likeArticle(article.value.id)

  likeCount.value = Number(result.likeCount) || 0
  favoriteCount.value = Number(result.favoriteCount) || favoriteCount.value
  likedByCurrentUser.value = !!result.likedByCurrentUser
  favoritedByCurrentUser.value = !!result.favoritedByCurrentUser
}

async function toggleFavorite() {
  if (!authStore.isLoggedIn) {
    message.info('请先登录后再收藏')
    return
  }

  const result = favoritedByCurrentUser.value
    ? await unfavoriteArticle(article.value.id)
    : await favoriteArticle(article.value.id)

  likeCount.value = Number(result.likeCount) || likeCount.value
  favoriteCount.value = Number(result.favoriteCount) || 0
  likedByCurrentUser.value = !!result.likedByCurrentUser
  favoritedByCurrentUser.value = !!result.favoritedByCurrentUser
}

function downloadPrimaryResource() {
  const resource = article.value.resources?.[0]
  if (!resource?.url) {
    message.info('当前文章没有可下载资源')
    return
  }
  window.open(resource.url, '_blank', 'noopener,noreferrer')
}

async function openCommentDrawer() {
  commentDrawerVisible.value = true
  await loadComments()
}

async function submitComment() {
  if (!commentContent.value) return
  if (!commentsEnabled.value) {
    commentMessage.value = '评论功能已关闭'
    return
  }

  submittingComment.value = true
  commentMessage.value = ''

  try {
    const comment = await createComment({
      articleId: article.value.id,
      content: commentContent.value
    })
    commentContent.value = ''
    commentMessage.value = comment.status === 'pending' ? '评论已提交审核' : '评论已发布'
    await Promise.all([loadArticle(), loadComments()])
  } catch (error) {
    commentMessage.value = error.message || '评论提交失败'
  } finally {
    submittingComment.value = false
  }
}

async function reportCurrentComment(id) {
  await reportComment(id)
  commentMessage.value = '举报已提交，评论将进入审核'
  await Promise.all([loadArticle(), loadComments()])
}

async function shareArticle() {
  const payload = {
    title: article.value.title,
    text: article.value.title,
    url: window.location.href
  }

  try {
    if (navigator.share) {
      await navigator.share(payload)
      return
    }
    await navigator.clipboard.writeText(window.location.href)
    message.success('文章链接已复制')
  } catch {
    message.info('已取消分享')
  }
}

onMounted(() => {
  siteStore.loadProfile().catch(() => {})
  loadArticle()
})

watch(() => route.params.slug, loadArticle)
</script>

<style scoped>
.mobile-reader {
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--text-primary);
  background: var(--bg-primary);
}

.mobile-reader__state {
  padding: 28px 16px;
  color: var(--text-secondary);
}

.mobile-reader__state--error {
  color: var(--danger-color);
}

.mobile-reader__topbar {
  position: sticky;
  top: 0;
  z-index: 35;
  height: 56px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border-bottom: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-elevated) 96%, transparent);
  backdrop-filter: blur(12px);
}

.mobile-reader__topbar strong {
  overflow: hidden;
  color: var(--text-primary);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-reader__icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 8px;
}

.mobile-reader__icon-btn.is-active {
  color: #b7791f;
}

.mobile-reader__article {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 18px max(16px, env(safe-area-inset-left)) calc(92px + env(safe-area-inset-bottom));
}

.mobile-reader__kicker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin-bottom: 14px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.55;
}

.mobile-reader__kicker a {
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 9%, transparent);
}

.mobile-reader__article h1 {
  margin: 0 0 14px;
  color: var(--text-primary);
  font-size: 30px;
  line-height: 1.22;
  letter-spacing: 0;
  overflow-wrap: anywhere;
}

.mobile-reader__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.mobile-reader__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.mobile-reader__chips a {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--primary-color) 18%, var(--border-color));
  border-radius: 999px;
  color: var(--primary-color);
  background: var(--bg-elevated);
}

.mobile-reader__resources {
  display: grid;
  gap: 8px;
  margin-top: 18px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-elevated);
}

.mobile-reader__resources strong {
  font-size: 13px;
}

.mobile-reader__resources a {
  min-height: 32px;
  color: var(--primary-color);
  overflow-wrap: anywhere;
}

.mobile-reader__content {
  margin-top: 24px;
  font-size: 18px;
  line-height: 1.9;
}

.mobile-reader__content :deep(.markdown-body) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.mobile-reader__content :deep(.markdown-body p) {
  margin-bottom: 20px;
}

.mobile-reader__content :deep(.markdown-body h1) {
  font-size: 1.7em;
}

.mobile-reader__content :deep(.markdown-body h2) {
  font-size: 1.38em;
}

.mobile-reader__content :deep(.markdown-body h3) {
  font-size: 1.18em;
}

.mobile-reader__content :deep(.markdown-body img),
.mobile-reader__content :deep(.markdown-body video),
.mobile-reader__content :deep(.markdown-body iframe) {
  max-width: 100%;
  height: auto;
}

.mobile-reader__content :deep(.markdown-body iframe) {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.mobile-reader__content :deep(.code-block) {
  margin-right: -2px;
  margin-left: -2px;
}

.mobile-reader__content :deep(.code-block__content) {
  font-size: 0.82em;
}

.mobile-reader__content :deep(.code-block__viewport) {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-reader__content :deep(table) {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-reader__actions {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 2px;
  padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-elevated) 96%, transparent);
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(12px);
}

.mobile-reader__actions button {
  min-width: 0;
  min-height: 50px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 0;
  border-radius: 8px;
  color: var(--text-secondary);
  background: transparent;
  font-size: 12px;
}

.mobile-reader__actions button:disabled {
  opacity: 0.42;
}

.mobile-reader__actions button.is-active,
.mobile-reader__actions button:hover {
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
}

.mobile-reader__actions button.is-like {
  color: #f5222d;
}

.mobile-reader__drawer :deep(.ant-drawer-content) {
  border-radius: 12px 12px 0 0;
  background: var(--bg-elevated);
}

.mobile-reader__drawer :deep(.ant-drawer-body) {
  overflow-x: hidden;
  padding: 14px;
}

.mobile-reader__comment-panel {
  display: grid;
  gap: 14px;
}

.mobile-reader__comment-form {
  display: grid;
  gap: 10px;
}

.mobile-reader__tip {
  color: var(--text-secondary);
  line-height: 1.7;
}

.mobile-reader__comment {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.mobile-reader__comment div {
  display: grid;
  gap: 2px;
}

.mobile-reader__comment strong {
  color: var(--text-primary);
}

.mobile-reader__comment span {
  color: var(--text-muted);
  font-size: 12px;
}

.mobile-reader__comment p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.8;
  overflow-wrap: anywhere;
}

:global(.public-main:has(.mobile-reader)),
:global(.enterprise-content:has(.mobile-reader)) {
  padding: 0 !important;
}

:global(.enterprise-content-inner:has(.mobile-reader)) {
  min-height: auto !important;
}

@media (orientation: landscape) and (max-height: 520px) {
  .mobile-reader__actions {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .mobile-reader__actions button {
    min-height: 44px;
    flex-direction: row;
  }
}
</style>
