<template>
  <section
    :class="[
      'doc-reader',
      {
        'doc-reader--console': inConsole,
        'doc-reader--immersive': isImmersiveReading
      }
    ]"
  >
    <div v-if="loading" class="doc-reader__state">正在加载文章...</div>
    <div v-else-if="errorMessage" class="doc-reader__state doc-reader__state--error">{{ errorMessage }}</div>

    <template v-else>
      <div
        ref="readerScrollRef"
        class="doc-reader__scroll"
        data-reading-scroll-container="true"
      >
        <div class="doc-reader__layout">
          <article class="doc-reader__article">
            <header class="doc-reader__header">
              <div class="doc-reader__kicker">
                <router-link v-if="article.category?.slug" class="doc-reader__category" :to="categoryPath">
                  {{ article.category.name }}
                </router-link>
                <span>{{ formatDate(article.publishedAt || article.createdAt) }} 发布</span>
              </div>

              <h1>{{ article.title }}</h1>

              <div class="doc-reader__meta">
                <span>{{ formatMetric(article.viewCount) }} 阅读</span>
                <span>{{ formatMetric(likeCount) }} 点赞</span>
                <span>{{ formatMetric(favoriteCount) }} 收藏</span>
                <span>作者：{{ article.author?.username || '知识库作者' }}</span>
              </div>

              <div v-if="article.tags?.length" class="doc-reader__info-row">
                <span class="doc-reader__label">标签</span>
                <div class="doc-reader__tags">
                  <router-link
                    v-for="tag in article.tags"
                    :key="tag.id || tag.slug || tag"
                    class="doc-reader__tag"
                    :to="tagPath(tag.slug)"
                  >
                    #{{ tag.name }}
                  </router-link>
                </div>
              </div>

              <div v-if="article.resources?.length" class="doc-reader__info-row">
                <span class="doc-reader__label">关联资源</span>
                <div class="doc-reader__resources">
                  <a
                    v-for="resource in article.resources"
                    :key="`${resource.url}-${resource.name}`"
                    class="doc-reader__resource"
                    :href="resource.url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {{ resource.name }}
                  </a>
                </div>
              </div>
            </header>

            <div class="doc-reader__content" :style="{ fontSize: `${fontSize}px` }">
              <MarkdownRenderer
                :content="article.contentMarkdown"
                :asset-base="legacyAssetBase"
                :code-wrap="isImmersiveReading"
              />
            </div>
          </article>
        </div>
      </div>

      <aside
        v-if="toc.length && !isImmersiveReading"
        class="doc-reader__toc-widget"
        :class="{ 'is-open': isTocOpen }"
      >
        <button
          class="doc-reader__toc-trigger"
          type="button"
          :title="isTocOpen ? '收起目录' : '展开目录'"
          :aria-label="isTocOpen ? '收起文章目录' : '展开文章目录'"
          :aria-expanded="String(isTocOpen)"
          @click="isTocOpen = !isTocOpen"
        >
          <ListTree v-if="!isTocOpen" :size="18" />
          <X v-else :size="18" />
        </button>

        <Transition name="toc-panel">
          <div v-if="isTocOpen" class="doc-reader__toc-panel">
            <TableOfContents :toc="toc" @navigate="isTocOpen = false" />
          </div>
        </Transition>
      </aside>

      <footer v-if="!isImmersiveReading" class="doc-reader__footer">
        <div class="doc-reader__author">
          <div class="doc-reader__author-avatar">
            <img v-if="article.author?.avatar" :src="article.author.avatar" :alt="article.author?.username || '作者头像'">
            <span v-else>{{ authorInitial }}</span>
          </div>
          <div class="doc-reader__author-meta">
            <strong>{{ article.author?.username || '知识库作者' }}</strong>
            <span>创作者</span>
          </div>
        </div>

        <div class="doc-reader__actions">
          <a-button
            type="text"
            :class="['doc-reader__action', { 'is-active is-like': likedByCurrentUser }]"
            :disabled="!authStore.isLoggedIn"
            @click="toggleLike"
          >
            <template #icon><LikeOutlined /></template>
            <span>{{ formatMetric(likeCount) }}</span>
          </a-button>

          <a-button
            type="text"
            class="doc-reader__action"
            :disabled="!article.resources?.length"
            @click="downloadPrimaryResource"
          >
            <template #icon><DownloadOutlined /></template>
            <span>下载</span>
          </a-button>

          <a-button
            type="text"
            :class="['doc-reader__action', { 'is-active is-favorite': favoritedByCurrentUser }]"
            :disabled="!authStore.isLoggedIn"
            @click="toggleFavorite"
          >
            <template #icon><StarOutlined /></template>
            <span>{{ formatMetric(favoriteCount) }}</span>
          </a-button>

          <a-button type="text" class="doc-reader__action" @click="openCommentDrawer">
            <template #icon><MessageOutlined /></template>
            <span>{{ formatMetric(article.commentCount) }}</span>
          </a-button>

          <a-button type="text" class="doc-reader__action" @click="shareArticle">
            <template #icon><ShareAltOutlined /></template>
            <span>分享</span>
          </a-button>

          <a-dropdown trigger="click">
            <a-button type="text" class="doc-reader__action doc-reader__action--more">
              <template #icon><EllipsisOutlined /></template>
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="reportArticle">举报</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </footer>

      <ReadingToolbar
        :immersive-mode="isImmersiveReading"
        :default-bottom="isImmersiveReading ? 24 : 108"
        @font-size-change="handleFontSizeChange"
        @toggle-immersive="toggleImmersiveReading"
      />

      <a-drawer
        v-model:open="commentDrawerVisible"
        placement="right"
        width="420"
        class="doc-reader__drawer"
        title="评论"
      >
        <div class="doc-reader__comment-panel">
          <div class="doc-reader__comment-head">
            <strong>{{ article.title }}</strong>
            <span>{{ comments.length }} 条评论</span>
          </div>

          <form v-if="authStore.isLoggedIn && commentsEnabled" class="doc-reader__comment-form" @submit.prevent="submitComment">
            <a-textarea
              v-model:value.trim="commentContent"
              :rows="5"
              :maxlength="1000"
              show-count
              placeholder="写下你的评论，包含链接的评论会进入审核。"
            />
            <a-button type="primary" html-type="submit" :loading="submittingComment">
              发表评论
            </a-button>
          </form>
          <div v-else-if="!commentsEnabled" class="doc-reader__comment-tip">评论功能已关闭，历史评论仍可查看。</div>
          <div v-else class="doc-reader__comment-tip">登录后可以发表评论。</div>

          <div v-if="commentMessage" class="doc-reader__comment-message">{{ commentMessage }}</div>

          <div class="doc-reader__comment-list">
            <article v-for="comment in comments" :key="comment.id" class="doc-reader__comment-item">
              <div class="doc-reader__comment-item-head">
                <div class="doc-reader__comment-user">
                  <a-avatar :size="36" :src="comment.user?.avatar">
                    {{ (comment.user?.username || '读者').slice(0, 1).toUpperCase() }}
                  </a-avatar>
                  <div>
                    <strong>{{ comment.user?.username || '读者' }}</strong>
                    <span>{{ formatDate(comment.createdAt) }}</span>
                  </div>
                </div>
                <a-button type="link" size="small" @click="reportCurrentComment(comment.id)">举报</a-button>
              </div>
              <p>{{ comment.content }}</p>
            </article>

            <div v-if="comments.length === 0" class="doc-reader__comment-empty">还没有评论。</div>
          </div>
        </div>
      </a-drawer>
    </template>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  DownloadOutlined,
  EllipsisOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import { ListTree, X } from 'lucide-vue-next'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import ReadingToolbar from '@/components/ReadingToolbar.vue'
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
const authStore = useAuthStore()
const siteStore = useSiteStore()
const readerScrollRef = ref(null)

const loading = ref(false)
const errorMessage = ref('')
const commentDrawerVisible = ref(false)
const comments = ref([])
const commentContent = ref('')
const commentMessage = ref('')
const submittingComment = ref(false)
const likeCount = ref(0)
const favoriteCount = ref(0)
const likedByCurrentUser = ref(false)
const favoritedByCurrentUser = ref(false)
const fontSize = ref(17)
const isImmersiveReading = ref(false)
const isTocOpen = ref(false)

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
const commentsEnabled = computed(() => siteStore.profile.commentEnabled !== false)
const toc = computed(() => extractTOC(article.value.contentMarkdown).filter((item) => item.level >= 1 && item.level <= 4))
const authorInitial = computed(() => (article.value.author?.username || '知').slice(0, 1).toUpperCase())
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
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}w`
  }
  return `${count}`
}

function syncImmersiveBodyClass() {
  document.body.classList.toggle('reader-immersive-active', isImmersiveReading.value)
}

function handleFontSizeChange(nextSize) {
  fontSize.value = nextSize
}

function toggleImmersiveReading() {
  isImmersiveReading.value = !isImmersiveReading.value
  if (isImmersiveReading.value) {
    isTocOpen.value = false
  }
  nextTick(() => {
    readerScrollRef.value?.scrollTo({
      top: readerScrollRef.value.scrollTop,
      behavior: 'auto'
    })
  })
}

async function loadComments() {
  if (!article.value.id) return
  comments.value = await listComments(article.value.id)
}

async function loadArticle() {
  loading.value = true
  errorMessage.value = ''
  isImmersiveReading.value = false
  isTocOpen.value = false

  try {
    const result = await getPublicArticle(route.params.slug)
    article.value = result
    likeCount.value = Number(result.likeCount) || 0
    favoriteCount.value = Number(result.favoriteCount) || 0
    likedByCurrentUser.value = !!result.likedByCurrentUser
    favoritedByCurrentUser.value = !!result.favoritedByCurrentUser
    await nextTick()
    readerScrollRef.value?.scrollTo({ top: 0 })
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
    commentMessage.value = comment.status === 'pending'
      ? '评论已提交审核'
      : '评论已发布'
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

function reportArticle() {
  message.info('文章举报入口已预留，后续可直接接入正式表单流程。')
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

onUnmounted(() => {
  document.body.classList.remove('reader-immersive-active')
})

watch(() => route.params.slug, loadArticle)
watch(isImmersiveReading, syncImmersiveBodyClass)
</script>

<style scoped>
.doc-reader {
  min-height: 100vh;
  background: var(--bg-primary);
}

.doc-reader--console {
  min-height: 100%;
}

.doc-reader__state {
  max-width: 920px;
  margin: 0 auto;
  padding: 28px 20px;
  color: var(--text-secondary);
}

.doc-reader__state--error {
  color: var(--danger-color);
}

.doc-reader__scroll {
  height: calc(100vh - 72px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 20px 108px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.doc-reader--console .doc-reader__scroll {
  height: calc(100vh - var(--console-header-height, 64px));
}

.doc-reader__scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.doc-reader__layout {
  display: block;
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: 0 16px;
}

.doc-reader__article {
  width: 100%;
  max-width: min(100%, 92ch);
  min-width: 0;
  margin: 0 auto;
}

.doc-reader__header {
  margin-bottom: 28px;
  padding-bottom: 22px;
  border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 14%, transparent);
}

.doc-reader__kicker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
}

.doc-reader__category {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 9%, transparent);
}

.doc-reader__header h1 {
  margin: 0 0 16px;
  color: var(--text-primary);
  font-size: 34px;
  line-height: 1.18;
  font-weight: 750;
  letter-spacing: 0;
}

.doc-reader__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-bottom: 16px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.doc-reader__info-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.doc-reader__label {
  color: var(--text-primary);
  font-weight: 700;
  white-space: nowrap;
}

.doc-reader__tags,
.doc-reader__resources {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  min-width: 0;
}

.doc-reader__tag,
.doc-reader__resource {
  color: var(--primary-color);
  line-height: 1.7;
}

.doc-reader__content {
  padding-bottom: 40px;
  transition: font-size 0.2s ease;
}

.doc-reader__content :deep(.markdown-body) {
  color: var(--text-primary);
}

.doc-reader__footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 76px;
  padding: 0 22px;
  border-top: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-elevated) 96%, transparent);
  box-shadow: 0 -8px 28px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
}

.doc-reader--console .doc-reader__footer {
  left: var(--console-sider-width, 280px);
}

:global(.enterprise-console-body:has(.enterprise-sider.ant-layout-sider-collapsed) .doc-reader--console .doc-reader__footer) {
  left: var(--console-sider-collapsed-width, 72px);
}

.doc-reader__author {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.doc-reader__author-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  overflow: hidden;
  border-radius: 50%;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, var(--bg-elevated));
  font-weight: 700;
}

.doc-reader__author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.doc-reader__author-meta {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.doc-reader__author-meta strong {
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.2;
}

.doc-reader__author-meta span {
  color: var(--text-muted);
  font-size: 12px;
}

.doc-reader__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}

.doc-reader__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 64px;
  height: 40px;
  padding: 0 12px;
  border-radius: 6px;
  color: var(--text-secondary);
}

.doc-reader__action:hover {
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 7%, transparent);
}

.doc-reader__action.is-active.is-like {
  color: #f5222d;
}

.doc-reader__action.is-active.is-favorite {
  color: #b7791f;
}

.doc-reader__action--more {
  min-width: 40px;
  padding: 0 8px;
}

.doc-reader__drawer :deep(.ant-drawer-body) {
  padding: 20px;
}

.doc-reader__comment-panel {
  display: grid;
  gap: 18px;
}

.doc-reader__comment-head {
  display: grid;
  gap: 6px;
}

.doc-reader__comment-head strong {
  color: var(--text-primary);
}

.doc-reader__comment-head span,
.doc-reader__comment-tip,
.doc-reader__comment-message {
  color: var(--text-secondary);
  font-size: 13px;
}

.doc-reader__comment-form {
  display: grid;
  gap: 12px;
}

.doc-reader__comment-list {
  display: grid;
  gap: 12px;
}

.doc-reader__comment-item {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.doc-reader__comment-item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.doc-reader__comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.doc-reader__comment-user strong {
  display: block;
  color: var(--text-primary);
}

.doc-reader__comment-user span {
  color: var(--text-muted);
  font-size: 12px;
}

.doc-reader__comment-item p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.8;
}

.doc-reader__comment-empty {
  padding: 18px 0;
  color: var(--text-muted);
  text-align: center;
}

.doc-reader--immersive .doc-reader__scroll {
  height: 100vh;
  padding-bottom: 48px;
}

.doc-reader--immersive .doc-reader__layout {
  max-width: 1040px;
}

.doc-reader__toc-widget {
  position: fixed;
  top: 112px;
  right: 24px;
  z-index: 38;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 8px;
  pointer-events: none;
}

.doc-reader--console .doc-reader__toc-widget {
  top: calc(var(--console-header-height, 64px) + 24px);
}

.doc-reader__toc-trigger {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  background: color-mix(in srgb, var(--bg-elevated) 96%, transparent);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(10px);
  cursor: pointer;
  pointer-events: auto;
  transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.doc-reader__toc-trigger:hover {
  color: var(--primary-color);
  border-color: color-mix(in srgb, var(--primary-color) 40%, var(--border-color));
  background: color-mix(in srgb, var(--primary-color) 7%, var(--bg-elevated));
  transform: translateY(-1px);
}

.doc-reader__toc-panel {
  width: min(252px, calc(100vw - 84px));
  max-height: min(68vh, 560px);
  pointer-events: auto;
}

.toc-panel-enter-active,
.toc-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.toc-panel-enter-from,
.toc-panel-leave-to {
  opacity: 0;
  transform: translateX(8px) scale(0.98);
}

:global(.public-main:has(.doc-reader)) {
  padding: 0 !important;
}

:global(.enterprise-content:has(.doc-reader)) {
  padding: 0 !important;
}

:global(.enterprise-content-inner:has(.doc-reader)) {
  min-height: auto !important;
}

:global(body.reader-immersive-active .public-header),
:global(body.reader-immersive-active .enterprise-topnav),
:global(body.reader-immersive-active .enterprise-sider) {
  display: none !important;
}

:global(body.reader-immersive-active .enterprise-console-body),
:global(body.reader-immersive-active .enterprise-main-layout),
:global(body.reader-immersive-active .enterprise-content) {
  height: 100vh !important;
  min-height: 100vh !important;
}

:global(body.reader-immersive-active .enterprise-content) {
  padding: 0 !important;
}

:global(body.reader-immersive-active .enterprise-content-inner) {
  min-height: 100vh !important;
}

@media (max-width: 1080px) {
  .doc-reader__layout {
    max-width: 920px;
  }
}

@media (max-width: 768px) {
  .doc-reader__scroll {
    height: auto;
    min-height: calc(100vh - 72px);
    overflow: visible;
    padding: 18px 14px 112px;
  }

  .doc-reader--console .doc-reader__scroll {
    height: auto;
    min-height: calc(100vh - var(--console-header-height, 64px));
  }

  .doc-reader__layout {
    padding: 0;
  }

  .doc-reader__toc-widget,
  .doc-reader--console .doc-reader__toc-widget {
    top: 84px;
    right: 14px;
  }

  .doc-reader__toc-trigger {
    width: 40px;
    height: 40px;
  }

  .doc-reader__header {
    margin-bottom: 24px;
    padding-bottom: 18px;
  }

  .doc-reader__header h1 {
    font-size: 28px;
  }

  .doc-reader__info-row {
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
  }

  .doc-reader__footer {
    left: 0;
    grid-template-columns: 1fr;
    min-height: 88px;
    padding: 10px 14px;
  }

  .doc-reader__actions {
    justify-content: space-between;
    flex-wrap: nowrap;
    overflow-x: auto;
  }
}
</style>
