<template>
  <main class="article-share-public">
    <header class="article-share-public__topbar">
      <router-link class="article-share-public__brand" to="/">
        <img src="/favicon.svg" alt="" aria-hidden="true">
        <span>Knowledge OS</span>
      </router-link>
      <div class="article-share-public__top-actions">
        <a-button type="text" @click="openMainSite"><template #icon><ExternalLink :size="16" /></template><span>进入知识库</span></a-button>
      </div>
    </header>

    <section v-if="loading" class="article-share-public__state"><a-spin size="large" /><span>正在准备共享阅读</span></section>
    <section v-else-if="errorMessage" class="article-share-public__state article-share-public__state--error"><AlertCircle :size="22" /><strong>{{ errorMessage }}</strong><a-button @click="loadShare">重新加载</a-button></section>

    <section v-else-if="share && !share.unlocked" class="article-share-public__gate">
      <div class="article-share-public__gate-icon"><LockKeyhole :size="24" /></div>
      <span class="article-share-public__eyebrow">受控共享阅读</span>
      <h1>{{ share.title }}</h1>
      <p>{{ share.description || '这是一份受控的文章分享，获得链接即可阅读。' }}</p>
      <template v-if="share.mode === 'password'">
        <a-input v-model:value="passwordCode" size="large" maxlength="4" inputmode="numeric" placeholder="请输入 4 位提取码" @press-enter="verifyPassword" />
        <a-button type="primary" size="large" block :loading="verifying" :disabled="passwordCode.length !== 4" @click="verifyPassword">验证并开始阅读</a-button>
        <a-alert v-if="passwordError" type="error" show-icon :message="passwordError" />
      </template>
      <a-button v-else type="primary" size="large" @click="claimShare">开始阅读</a-button>
      <div class="article-share-public__gate-meta"><span>{{ share.entryCount }} 篇文章</span><span>{{ share.expiresAt ? `有效至 ${formatDate(share.expiresAt)}` : '永久有效' }}</span></div>
    </section>

    <template v-else-if="share">
      <div class="article-share-public__shell">
        <aside class="article-share-public__sidebar">
          <div class="article-share-public__sidebar-heading"><span>共享目录</span><b>{{ share.entryCount }} 篇</b></div>
          <nav aria-label="共享文章目录">
            <button v-for="entry in share.entries" :key="entry.articleId" type="button" :class="{ 'is-active': entry.slug === currentSlug }" @click="selectArticle(entry.slug)">{{ entry.title }}</button>
          </nav>
        </aside>
        <article class="article-share-public__reader">
          <div class="article-share-public__reader-head">
            <div><span class="article-share-public__eyebrow">共享阅读</span><h1>{{ share.title }}</h1><p v-if="share.description">{{ share.description }}</p></div>
            <a-button type="text" aria-label="复制共享阅读链接" @click="copyUrl"><template #icon><Copy :size="17" /></template><span>复制链接</span></a-button>
          </div>
          <div v-if="articleLoading" class="article-share-public__article-state"><a-spin /><span>正在加载文章</span></div>
          <section v-else-if="article" class="article-share-public__article">
            <header class="article-share-public__article-meta"><span>{{ article.category?.name || '知识库文章' }}</span><span>{{ formatDate(article.publishedAt || article.createdAt) }} 发布</span><span>{{ article.readingMinutes || 1 }} 分钟阅读</span></header>
            <h2>{{ article.title }}</h2>
            <p v-if="article.summary" class="article-share-public__summary">{{ article.summary }}</p>
            <div class="article-share-public__content"><ArticleContentRenderer :article="article" /></div>
            <footer class="article-share-public__article-footer"><span>内容来自 Knowledge OS 共享阅读</span><a-button type="link" @click="openMainSite">登录后在知识库中继续操作 <ArrowUpRight :size="15" /></a-button></footer>
          </section>
        </article>
      </div>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { AlertCircle, ArrowUpRight, Copy, ExternalLink, LockKeyhole } from 'lucide-vue-next'
import ArticleContentRenderer from '@/components/ArticleContentRenderer.vue'
import { useAuthStore } from '@/stores/auth'
import { claimPublicArticleShare, getPublicArticleShare, getPublicSharedArticle, verifyPublicArticleShare } from '@/services/articleShare'
import './article-share-page.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const publicId = computed(() => String(route.params.publicId || ''))
const share = ref(null)
const article = ref(null)
const loading = ref(true)
const articleLoading = ref(false)
const errorMessage = ref('')
const passwordCode = ref('')
const passwordError = ref('')
const verifying = ref(false)
const currentSlug = ref('')

function formatDate(value) { return value ? new Date(value).toLocaleString('zh-CN') : '' }
function openMainSite() {
  const target = article.value?.slug
    ? `/console/article-directory/articles/${encodeURIComponent(article.value.slug)}`
    : '/console'
  if (authStore.isLoggedIn) {
    router.push(target)
    return
  }
  router.push({ path: '/login', query: { redirect: target } })
}
function copyUrl() { navigator.clipboard.writeText(window.location.href).then(() => message.success('共享阅读链接已复制')).catch(() => message.error('复制失败，请手动复制')) }

async function loadShare() {
  loading.value = true
  errorMessage.value = ''
  try {
    share.value = await getPublicArticleShare(publicId.value)
    if (share.value?.unlocked) {
      currentSlug.value = currentSlug.value || share.value.entries?.[0]?.slug || ''
      await loadArticle(currentSlug.value)
    }
  } catch (error) { errorMessage.value = error.message || '共享阅读链接加载失败' } finally { loading.value = false }
}

async function claimShare() {
  try { share.value = await claimPublicArticleShare(publicId.value); currentSlug.value = share.value.entries?.[0]?.slug || ''; await loadArticle(currentSlug.value) } catch (error) { errorMessage.value = error.message || '共享阅读授权失败' }
}

async function verifyPassword() {
  if (passwordCode.value.length !== 4 || verifying.value) return
  verifying.value = true
  passwordError.value = ''
  try { share.value = await verifyPublicArticleShare(publicId.value, passwordCode.value); currentSlug.value = share.value.entries?.[0]?.slug || ''; await loadArticle(currentSlug.value) } catch (error) { passwordError.value = error.message || '提取码验证失败' } finally { verifying.value = false }
}

async function loadArticle(slug) {
  if (!slug) return
  articleLoading.value = true
  try {
    const result = await getPublicSharedArticle(publicId.value, slug)
    article.value = result.article
  } catch (error) { message.error(error.message || '文章加载失败') } finally { articleLoading.value = false }
}

function selectArticle(slug) { currentSlug.value = slug; loadArticle(slug) }
watch(publicId, loadShare, { immediate: true })
let robotsMeta
onMounted(() => {
  robotsMeta = document.createElement('meta')
  robotsMeta.name = 'robots'
  robotsMeta.content = 'noindex, nofollow'
  robotsMeta.dataset.articleShare = 'true'
  document.head.appendChild(robotsMeta)
})
onUnmounted(() => robotsMeta?.remove())
</script>
