<template>
  <section class="tools-page">
    <div class="tools-workspace">
      <aside class="tools-sidebar" aria-label="工具分类">
        <div class="tools-sidebar__label">工具分类</div>
        <button
          v-for="category in TOOL_CATEGORIES"
          :key="category.key"
          type="button"
          :class="['tools-category', { active: selectedCategory === category.key }]"
          @click="selectCategory(category.key)"
        >
          <span>{{ category.label }}</span>
          <small>{{ countByCategory(category.key) }}</small>
        </button>

      </aside>

      <main class="tools-content">
        <template v-if="activeTool">
          <div class="tools-content__head">
            <div>
              <div class="tools-breadcrumb">{{ getCategoryByKey(activeTool.category).label }}</div>
              <h2>{{ activeTool.name }}</h2>
            </div>
            <div class="tools-content__actions">
              <a-tooltip :title="isFavorite(activeTool.key) ? '取消收藏' : '收藏工具'">
                <a-button type="text" shape="circle" :aria-label="isFavorite(activeTool.key) ? '取消收藏' : '收藏工具'" @click="toggleFavorite(activeTool.key)">
                  <template #icon><Star :size="17" :fill="isFavorite(activeTool.key) ? 'currentColor' : 'none'" /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="返回工具箱首页">
                <a-button type="text" shape="circle" aria-label="返回工具箱首页" @click="router.push('/console/tools')">
                  <template #icon><LayoutGrid :size="17" /></template>
                </a-button>
              </a-tooltip>
            </div>
          </div>
          <div class="tools-tool-surface">
            <component :is="activeTool.component" />
          </div>
        </template>

        <template v-else>
          <div class="tools-overview">
            <div class="tools-overview__section-head">
              <h2>{{ getCategoryByKey(selectedCategory).label }}</h2>
              <span>{{ filteredTools.length }} 项</span>
            </div>
            <div class="tools-grid">
              <button v-for="tool in filteredTools" :key="tool.key" type="button" class="tools-card" @click="openTool(tool)">
                <span class="tools-card__icon"><component :is="tool.icon" :size="20" /></span>
                <span class="tools-card__body">
                  <strong>{{ tool.name }}</strong>
                  <small>{{ tool.description }}</small>
                </span>
                <Star v-if="isFavorite(tool.key)" class="tools-card__favorite" :size="15" fill="currentColor" />
              </button>
            </div>
          </div>
        </template>
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayoutGrid, Star } from 'lucide-vue-next'
import { TOOL_CATALOG, TOOL_CATEGORIES, getCategoryByKey, getToolByKey } from './toolCatalog'
import './tools.css'

const route = useRoute()
const router = useRouter()
const selectedCategory = ref('all')
const favoriteKeys = ref(readStorage('tools:favorites'))
const recentKeys = ref(readStorage('tools:recent'))

const activeTool = computed(() => getToolByKey(route.params.toolKey))

const filteredTools = computed(() => {
  return TOOL_CATALOG
    .filter((tool) => selectedCategory.value === 'all' || tool.category === selectedCategory.value)
})

function readStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 本地存储不可用时，工具仍然可以正常使用。
  }
}

function isFavorite(key) {
  return favoriteKeys.value.includes(key)
}

function toggleFavorite(key) {
  const next = isFavorite(key)
    ? favoriteKeys.value.filter((item) => item !== key)
    : [...favoriteKeys.value, key]
  favoriteKeys.value = next
  persist('tools:favorites', next)
}

function countByCategory(key) {
  if (key === 'all') return TOOL_CATALOG.length
  return TOOL_CATALOG.filter((tool) => tool.category === key).length
}

function selectCategory(key) {
  selectedCategory.value = key
  if (activeTool.value && (key === 'all' || activeTool.value.category !== key)) router.push('/console/tools')
}

function openTool(tool) {
  const nextRecent = [tool.key, ...recentKeys.value.filter((key) => key !== tool.key)].slice(0, 8)
  recentKeys.value = nextRecent
  persist('tools:recent', nextRecent)
  router.push(`/console/tools/${tool.key}`)
}

watch(() => route.params.toolKey, (key) => {
  if (key && !getToolByKey(key)) router.replace('/console/tools')
  if (activeTool.value) selectedCategory.value = activeTool.value.category
})

onMounted(() => {
  if (activeTool.value) selectedCategory.value = activeTool.value.category
})
</script>
