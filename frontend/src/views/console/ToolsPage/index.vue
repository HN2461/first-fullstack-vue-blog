<template>
  <a-config-provider :theme="toolPopupTheme">
  <section :class="['tools-page', { 'tools-page--focused': tabsStore.maximized }]">
    <div class="tools-workspace">
      <main class="tools-content">
        <header class="tools-content__head">
          <div class="tools-content__title">
            <h2 v-if="activeTool">
              <a-tooltip title="切换工具（Ctrl / ⌘ + K）">
                <button type="button" class="tools-switcher" aria-label="查找和切换工具" aria-keyshortcuts="Control+K Meta+K" @click="openToolPicker">
                  <component :is="activeTool.icon" :size="20" class="tools-content__icon" />
                  <span>{{ activeTool.name }}</span><ChevronDown :size="15" />
                </button>
              </a-tooltip>
            </h2>
            <h2 v-else>工具箱</h2>
          </div>
          <div v-if="!activeTool" class="tools-directory-filters">
            <a-input v-model:value="searchQuery" allow-clear placeholder="搜索工具名称或用途" aria-label="搜索工具"><template #prefix><Search :size="15" /></template></a-input>
            <a-select v-model:value="selectedCategory" :options="categoryOptions" show-search option-filter-prop="label" aria-label="筛选工具分类" />
            <div class="tools-directory-views" aria-label="工具范围">
              <button v-for="view in directoryViews" :key="view.key" type="button" :class="{ active: selectedView === view.key }" :aria-pressed="selectedView === view.key" @click="selectedView = view.key">{{ view.label }}</button>
            </div>
          </div>
          <div class="tools-content__actions">
            <span v-if="!activeTool" class="tools-content__count">{{ filteredTools.length }} 项</span>
            <a-tooltip v-if="activeTool" :title="isFavorite(activeTool.key) ? '取消收藏' : '收藏工具'"><a-button type="text" shape="circle" :aria-label="isFavorite(activeTool.key) ? '取消收藏' : '收藏工具'" @click="toggleFavorite(activeTool.key)"><template #icon><Star :size="17" :fill="isFavorite(activeTool.key) ? 'currentColor' : 'none'" /></template></a-button></a-tooltip>
            <a-tooltip :title="tabsStore.maximized ? '退出专注模式' : '专注模式'">
              <a-button type="text" shape="circle" :aria-label="tabsStore.maximized ? '退出专注模式' : '专注模式'" @click="tabsStore.maximized = !tabsStore.maximized"><template #icon><component :is="tabsStore.maximized ? Minimize2 : Maximize2" :size="17" /></template></a-button>
            </a-tooltip>
            <a-popover trigger="click" placement="bottomRight" :title="activeTool ? `${activeTool.name}使用说明` : '工具箱使用说明'">
              <template #content>
                <div class="tools-help">
                  <p>{{ activeTool?.description || '按名称、用途或分类查找工具，也可以查看收藏和最近使用。' }}</p>
                  <p>点击当前工具名称，或按 Ctrl / ⌘ + K，打开工具切换面板。专注模式可扩大当前工作区。</p>
                  <p>直接切换普通工具时暂留最近 8 项的当前输入，密码与 JWT 除外。需要留存的结果请复制后保存。</p>
                </div>
              </template>
              <a-tooltip title="查看使用说明"><a-button type="text" shape="circle" aria-label="查看使用说明"><template #icon><CircleHelp :size="17" /></template></a-button></a-tooltip>
            </a-popover>
            <a-tooltip v-if="activeTool" title="返回工具目录"><a-button type="text" shape="circle" aria-label="返回工具目录" @click="showOverview"><template #icon><LayoutGrid :size="17" /></template></a-button></a-tooltip>
          </div>
        </header>
        <div v-show="activeTool" class="tools-tool-surface">
          <KeepAlive :key="userId" :max="8"><component :is="activeTool.component" v-if="activeTool && !sensitiveTool" :key="activeTool.key" /></KeepAlive>
          <component :is="activeTool.component" v-if="activeTool && sensitiveTool" :key="`${userId}:${activeTool.key}`" />
        </div>
        <div v-if="!activeTool" class="tools-overview">
          <div v-if="filteredTools.length" class="tools-grid">
            <article v-for="tool in filteredTools" :key="tool.key" class="tools-card">
              <button type="button" class="tools-card__open" @click="openTool(tool)">
                <span class="tools-card__icon"><component :is="tool.icon" :size="20" /></span>
                <span class="tools-card__body"><strong>{{ tool.name }}</strong><small>{{ tool.description }}</small></span>
              </button>
              <a-tooltip :title="isFavorite(tool.key) ? '取消收藏' : '收藏工具'"><button type="button" :class="['tools-card__favorite', { saved: isFavorite(tool.key) }]" :aria-label="`${isFavorite(tool.key) ? '取消收藏' : '收藏'}${tool.name}`" @click="toggleFavorite(tool.key)"><Star :size="15" :fill="isFavorite(tool.key) ? 'currentColor' : 'none'" /></button></a-tooltip>
            </article>
          </div>
          <div v-else class="tools-empty" role="status">
            <component :is="emptyIcon" :size="32" aria-hidden="true" /><strong>{{ emptyTitle }}</strong><p>{{ emptyDescription }}</p>
            <a-button v-if="hasFilters" @click="resetFilters">清除筛选</a-button>
            <a-button v-else-if="selectedView !== 'all'" @click="selectedView = 'all'">查看全部工具</a-button>
          </div>
        </div>
      </main>
    </div>
    <a-modal v-model:open="toolPickerOpen" title="查找和切换工具" :centered="false" :footer="null" :width="680" :style="{ maxWidth: 'calc(100vw - 32px)' }" :body-style="{ height: 'min(60vh, 520px)', padding: 0, overflow: 'hidden' }" destroy-on-close>
      <ToolNavigator v-bind="navigatorProps" @update:query="searchQuery = $event" @update:category="selectedCategory = $event" @update:view="selectedView = $event" @open="openTool" @favorite="toggleFavorite" @overview="showOverview" @reset="resetFilters" />
    </a-modal>
  </section>
  </a-config-provider>
</template>

<script setup>
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDown, CircleHelp, History, LayoutGrid, Maximize2, Minimize2, Search, Star } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useConsoleTabsStore } from '@/stores/consoleTabs'
import ToolNavigator from './components/ToolNavigator.vue'
import { TOOL_CATALOG, TOOL_CATEGORIES, getToolByKey } from './toolCatalog'
import { queryTools, readToolPreferences, saveToolPreferences } from './toolNavigation'
import './tools.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const tabsStore = useConsoleTabsStore()
// 专注工作区位于 1200 层，工具浮层须统一高于它，避免逐个弹框补 z-index。
const toolPopupTheme = { token: { zIndexPopupBase: 1400 } }
const userId = computed(() => String(authStore.user?.id || ''))
const selectedCategory = ref('all')
const selectedView = ref('all')
const searchQuery = ref('')
const favoriteKeys = ref([])
const recentKeys = ref([])
const toolPickerOpen = ref(false)
const workspaceActive = ref(true)
const categoryOptions = TOOL_CATEGORIES.map(({ key, label }) => ({ value: key, label }))
const directoryViews = [{ key: 'all', label: '全部' }, { key: 'favorites', label: '收藏' }, { key: 'recent', label: '最近' }]
const activeTool = computed(() => getToolByKey(route.params.toolKey))
const sensitiveTool = computed(() => ['password', 'jwt'].includes(activeTool.value?.key))
const filteredTools = computed(() => queryTools(TOOL_CATALOG, {
  query: searchQuery.value, category: selectedCategory.value, view: selectedView.value,
  favoriteKeys: favoriteKeys.value, recentKeys: recentKeys.value
}))
const navigatorProps = computed(() => ({ tools: filteredTools.value, query: searchQuery.value, category: selectedCategory.value, view: selectedView.value, activeKey: activeTool.value?.key || '', favoriteKeys: favoriteKeys.value }))
const hasFilters = computed(() => Boolean(searchQuery.value.trim()) || selectedCategory.value !== 'all')
const emptyIcon = computed(() => hasFilters.value ? Search : selectedView.value === 'favorites' ? Star : History)
const emptyTitle = computed(() => hasFilters.value ? '没有匹配的工具' : selectedView.value === 'favorites' ? '还没有收藏工具' : '还没有最近使用的工具')
const emptyDescription = computed(() => hasFilters.value ? '换一个名称、缩写或用途，或清除当前筛选。' : selectedView.value === 'favorites' ? '点击工具旁的星标，将常用工具放在这里。' : '打开工具后，可以从这里快速回到最近的任务。')

function getStorage() { try { return window.localStorage } catch { return null } }
function persistPreferences() { saveToolPreferences(getStorage(), userId.value, { favoriteKeys: favoriteKeys.value, recentKeys: recentKeys.value }) }
function isFavorite(key) { return favoriteKeys.value.includes(key) }
function toggleFavorite(key) {
  favoriteKeys.value = isFavorite(key) ? favoriteKeys.value.filter((item) => item !== key) : [...favoriteKeys.value, key]
  persistPreferences()
}
function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
}
function openTool(tool) {
  toolPickerOpen.value = false
  if (activeTool.value?.key !== tool.key) router.push(`/console/tools/${tool.key}`)
}
function showOverview() {
  toolPickerOpen.value = false
  router.push('/console/tools')
}

function openToolPicker() {
  resetFilters()
  selectedView.value = 'all'
  toolPickerOpen.value = true
}

function handleToolShortcut(event) {
  if (!workspaceActive.value || !route.path.startsWith('/console/tools') || event.isComposing || event.altKey) return
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openToolPicker()
  }
}

onMounted(() => window.addEventListener('keydown', handleToolShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', handleToolShortcut))
onActivated(() => { workspaceActive.value = true })
onDeactivated(() => {
  // 菜单启用页面缓存时，隐藏实例不能继续响应快捷键或显示工具选择弹窗。
  workspaceActive.value = false
  toolPickerOpen.value = false
})

watch(userId, (id) => {
  const preferences = readToolPreferences(getStorage(), id, TOOL_CATALOG.map((tool) => tool.key))
  favoriteKeys.value = preferences.favoriteKeys
  recentKeys.value = preferences.recentKeys
  resetFilters()
  selectedView.value = 'all'
  toolPickerOpen.value = false
}, { immediate: true })
watch(() => [userId.value, route.params.toolKey], ([id, key]) => {
  if (key && !getToolByKey(key)) {
    router.replace('/console/tools')
    return
  }
  if (!id || !key) return
  // 直接链接与浏览器历史进入也记录最近工具，只保存工具标识。
  recentKeys.value = [key, ...recentKeys.value.filter((item) => item !== key)].slice(0, 8)
  persistPreferences()
}, { immediate: true })
</script>
