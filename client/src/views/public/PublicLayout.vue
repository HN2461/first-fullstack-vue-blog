<template>
  <div class="public-site">
    <header class="public-header">
      <router-link class="public-brand" to="/">
        <span>K</span>
        <div>
          <strong>Knowledge OS</strong>
          <small>Personal Tech Knowledge Base</small>
        </div>
      </router-link>

      <nav class="public-nav">
        <router-link to="/articles">文章</router-link>
        <router-link to="/search">检索</router-link>
        <router-link v-if="authStore.isLoggedIn" class="public-console-link" to="/console">进入知识库</router-link>
        <router-link v-else class="public-console-link" to="/login">登录 / 注册</router-link>
      </nav>
    </header>

    <main class="public-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
