<template>
  <div class="public-site">
    <header class="public-header">
      <router-link class="public-brand" to="/">
        <img class="public-brand-icon" src="/favicon.svg" alt="" aria-hidden="true">
        <div>
          <strong>{{ siteStore.siteTitle }}</strong>
          <small>{{ siteStore.profile.authorName || 'Knowledge OS' }}</small>
        </div>
      </router-link>

      <nav class="public-nav">
        <router-link v-if="authStore.isLoggedIn" class="public-console-link" to="/console">进入知识库</router-link>
        <router-link v-else class="public-console-link" to="/login">登录 / 注册</router-link>
      </nav>
    </header>

    <main class="public-main">
      <router-view />
    </main>

    <footer class="public-footer">
      <SiteBeianLinks show-copyright />
    </footer>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useSiteStore } from '@/stores/site'
import { buildDocumentTitle } from '@/utils/siteProfile'
import SiteBeianLinks from '@/components/SiteBeianLinks.vue'

const authStore = useAuthStore()
const appStore = useAppStore()
const siteStore = useSiteStore()
const route = useRoute()

onMounted(async () => {
  const profile = await siteStore.loadProfile()
  if (!localStorage.getItem('blog-theme') && profile.defaultTheme) {
    appStore.setTheme(profile.defaultTheme, { persist: false })
  }
})

watch(
  () => [route.meta.title, siteStore.siteTitle],
  ([routeTitle, siteTitle]) => {
    document.title = buildDocumentTitle(routeTitle, siteTitle)
  },
  { immediate: true }
)
</script>
