<template>
  <section :class="inConsole ? 'doc-reader doc-reader--console' : 'doc-reader'">
    <div v-if="loading" class="doc-reader__state">正在加载文章...</div>
    <div v-else-if="errorMessage" class="doc-reader__state doc-reader__state--error">{{ errorMessage }}</div>

    <template v-else>
      <article class="doc-reader__sheet">
        <div class="doc-reader__scroll">
          <header class="doc-reader__header">
            <h1>{{ article.title }}</h1>

            <div class="doc-reader__meta">
              <span>{{ formatDate(article.publishedAt || article.createdAt) }} 发布</span>
              <i />
              <span>{{ formatMetric(article.viewCount) }} 阅读</span>
              <i />
              <span>{{ formatMetric(article.likeCount) }} 点赞</span>
              <i />
              <span>{{ formatMetric(article.favoriteCount) }} 收藏</span>
              <i />
              <span>作者：{{ article.author?.username || '知识库作者' }}</span>
            </div>

            <div v-if="article.tags?.length" class="doc-reader__info-row">
              <span class="doc-reader__label">标签：</span>
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
              <span class="doc-reader__label">关联资源：</span>
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

          <div class="doc-reader__content">
            <MarkdownRenderer :content="article.contentMarkdown" :asset-base="legacyAssetBase" />
          </div>
        </div>

        <footer class="doc-reader__footer">
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

            <a-button
              type="text"
              class="doc-reader__action"
              @click="openCommentDrawer"
            >
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
                  <a-menu-item @click="reportArticle">
                    举报
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </footer>
      </article>

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

          <form v-if="authStore.isLoggedIn" class="doc-reader__comment-form" @submit.prevent="submitComment">
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
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
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
import { useAuthStore } from '@/stores/auth'
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

const MarkdownRenderer = defineAsyncComponent(() => import('@/components/MarkdownRenderer.vue'))

const route = useRoute()
const authStore = useAuthStore()

const inConsole = computed(() => route.path.startsWith('/console'))
const legacyAssetBase = computed(() => {
  if (article.value.source !== 'legacy-notes' || !article.value.sourcePath) return ''
  const directory = article.value.sourcePath.split('/').slice(0, -1).map(encodeURIComponent).join('/')
  return directory ? `/legacy-notes/${directory}` : '/legacy-notes'
})
const authorInitial = computed(() => (article.value.author?.username || '知').slice(0, 1).toUpperCase())

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
const article = ref({
  id: '',
  title: '',
  contentMarkdown: '',
  resources: [],
  tags: [],
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

async function loadComments() {
  if (!article.value.id) return
  comments.value = await listComments(article.value.id)
}

async function loadArticle() {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getPublicArticle(route.params.slug)
    article.value = result
    likeCount.value = Number(result.likeCount) || 0
    favoriteCount.value = Number(result.favoriteCount) || 0
    likedByCurrentUser.value = !!result.likedByCurrentUser
    favoritedByCurrentUser.value = !!result.favoritedByCurrentUser
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

onMounted(loadArticle)
watch(() => route.params.slug, loadArticle)
</script>

<style scoped>
.doc-reader {
  min-height: 100vh;
  padding: 28px 20px 0;
  background: #f3f4f6;
}

.doc-reader--console {
  padding-top: 0;
  background: transparent;
}

.doc-reader__state {
  max-width: 920px;
  margin: 0 auto;
  color: #667085;
}

.doc-reader__state--error {
  color: #cf1322;
}

.doc-reader__sheet {
  position: relative;
  width: min(100%, 1080px);
  margin: 0 auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
  overflow: visible;
}

.doc-reader__scroll {
  min-height: auto;
  overflow: visible;
}

.doc-reader__header {
  display: grid;
  gap: 10px;
  padding: 36px 64px 18px;
  border-bottom: 1px solid #eef2f7;
}

.doc-reader__header h1 {
  margin: 0;
  color: #101828;
  font-size: 38px;
  line-height: 1.24;
}

.doc-reader__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  color: #667085;
  font-size: 13px;
  line-height: 1.7;
}

.doc-reader__info-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #475467;
  font-size: 14px;
  line-height: 1.7;
}

.doc-reader__label {
  color: #475467;
  white-space: nowrap;
  font-weight: 600;
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
  color: #1668dc;
  line-height: 1.7;
}

.doc-reader__meta i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #cbd5e1;
}

.doc-reader__content {
  padding: 28px 64px 112px;
}

.doc-reader__content :deep(.markdown-body) {
  color: #1f2937;
  font-size: 17px;
  line-height: 2;
}

.doc-reader__content :deep(.markdown-body h1),
.doc-reader__content :deep(.markdown-body h2),
.doc-reader__content :deep(.markdown-body h3) {
  color: #101828;
}

.doc-reader__content :deep(.markdown-body p),
.doc-reader__content :deep(.markdown-body li) {
  color: #344054;
}

.doc-reader__footer {
  position: sticky;
  left: 0;
  bottom: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-height: 76px;
  padding: 0 18px 0 20px;
  border-top: 1px solid #eef2f7;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  box-shadow: 0 -8px 28px rgba(15, 23, 42, 0.08);
}

:global(.public-main:has(.doc-reader)) {
  padding-bottom: 0 !important;
}

:global(.enterprise-content:has(.doc-reader)) {
  padding-bottom: 0 !important;
}

:global(.enterprise-content-inner:has(.doc-reader)) {
  min-height: auto !important;
}

.doc-reader__author {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.doc-reader__author-avatar {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  color: #1668dc;
  background: #e6f4ff;
  font-weight: 700;
  flex-shrink: 0;
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
  color: #101828;
  font-size: 15px;
  line-height: 1.2;
}

.doc-reader__author-meta span {
  color: #98a2b3;
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
  color: #667085;
  border-radius: 4px;
}

.doc-reader__action:hover {
  color: #1668dc;
  background: rgba(22, 104, 220, 0.06);
}

.doc-reader__action.is-active.is-like {
  color: #f5222d;
}

.doc-reader__action.is-active.is-favorite {
  color: #faad14;
}

.doc-reader__action--more {
  min-width: 40px;
  padding: 0 8px;
}

.doc-reader__action :deep(.anticon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
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
  color: #101828;
}

.doc-reader__comment-head span,
.doc-reader__comment-tip,
.doc-reader__comment-message {
  color: #667085;
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
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background: #fafcff;
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
  color: #101828;
}

.doc-reader__comment-user span {
  color: #98a2b3;
  font-size: 12px;
}

.doc-reader__comment-item p {
  margin: 0;
  color: #344054;
  line-height: 1.8;
}

.doc-reader__comment-empty {
  padding: 18px 0;
  color: #98a2b3;
  text-align: center;
}

@media (max-width: 900px) {
  .doc-reader {
    padding: 16px 12px 0;
  }

  .doc-reader__sheet {
    min-height: auto;
  }

  .doc-reader__header {
    padding: 24px 24px 16px;
  }

  .doc-reader__header h1 {
    font-size: 28px;
  }

  .doc-reader__meta i {
    display: none;
  }

  .doc-reader__info-row {
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
  }

  .doc-reader__content {
    padding: 20px 24px 108px;
  }

  .doc-reader__footer {
    grid-template-columns: 1fr;
    min-height: 88px;
    width: 100%;
    padding: 10px 14px;
  }

  .doc-reader__actions {
    justify-content: space-between;
    flex-wrap: nowrap;
    overflow-x: auto;
  }
}
</style>
