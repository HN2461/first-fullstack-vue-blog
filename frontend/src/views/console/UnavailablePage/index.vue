<template>
  <section class="enterprise-page unavailable-page">
    <div class="unavailable-panel">
      <div class="unavailable-code">404</div>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
      <div class="unavailable-actions">
        <a-button type="primary" @click="router.push('/console')">返回工作台</a-button>
        <a-button @click="router.back()">返回上一页</a-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const title = computed(() => route.meta?.pendingPage ? '该菜单页面暂未开发' : '当前页面不存在')
const description = computed(() => route.meta?.pendingPage ? '暂无内容' : '请检查访问地址，或返回工作台继续操作。')
</script>

<style scoped>
.unavailable-page {
  min-height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  display: grid;
  place-items: center;
}

.unavailable-panel {
  width: min(520px, 100%);
  display: grid;
  justify-items: center;
  gap: 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 42px 28px;
  text-align: center;
  background: var(--console-surface);
}

.unavailable-code {
  color: var(--console-primary-strong);
  font-size: 40px;
  font-weight: 750;
  line-height: 1;
}

.unavailable-panel h1 {
  margin: 0;
  color: var(--console-text);
  font-size: 22px;
}

.unavailable-panel p {
  margin: 0;
  color: var(--console-text-secondary);
  line-height: 1.7;
}

.unavailable-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.unavailable-actions :deep(.ant-btn) {
  min-height: 44px;
}
</style>
