<template>
  <Teleport to="body" :disabled="!tabsStore.maximized">
    <a-layout
      :class="[
        'enterprise-main-layout',
        {
          'enterprise-main-layout--tabs': tabsEnabled,
          'enterprise-main-layout--maximized': tabsStore.maximized
        }
      ]"
    >
      <ConsoleTabsBar v-if="tabsEnabled" />
      <main
        ref="contentRef"
        :class="['enterprise-content', { 'enterprise-content--immersive': immersive }]"
      >
        <div :class="['enterprise-content-inner', { 'enterprise-content-inner--immersive': immersive }]">
          <router-view v-slot="{ Component, route: viewRoute }">
            <keep-alive :max="10">
              <component
                :is="Component"
                v-if="Component && isRouteCached(viewRoute)"
                :key="getViewKey(viewRoute)"
              />
            </keep-alive>
            <component
              :is="Component"
              v-if="Component && !isRouteCached(viewRoute)"
              :key="getViewKey(viewRoute)"
            />
          </router-view>
        </div>
      </main>

      <a-tooltip v-if="tabsStore.maximized" title="退出最大化">
        <button class="console-workspace-exit" type="button" aria-label="退出最大化" @click="tabsStore.maximized = false">
          <Minimize2 :size="18" />
        </button>
      </a-tooltip>
    </a-layout>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Minimize2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useConsoleTabsStore } from '@/stores/consoleTabs'
import { buildConsoleTabKey } from '@/utils/consoleTabs'
import ConsoleTabsBar from './ConsoleTabsBar.vue'

defineProps({
  immersive: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const tabsStore = useConsoleTabsStore()
const contentRef = ref(null)

const tabsEnabled = computed(() => Boolean(authStore.user?.consoleTabsEnabled))
const homePath = computed(() => authStore.canAccessPath('/console') ? '/console' : '/console/articles')

function initializeTabs() {
  if (!tabsEnabled.value || !authStore.user?.id) return
  tabsStore.initialize({
    userId: authStore.user.id,
    router,
    canAccessPath: authStore.canAccessPath,
    rootMenus: authStore.rootMenus,
    homePath: homePath.value
  })
  tabsStore.addRoute(route, authStore.rootMenus)
}

function isRouteCached(viewRoute) {
  if (!tabsEnabled.value) return false
  return Boolean(tabsStore.getByRoute(viewRoute)?.pageCacheEnabled)
}

function getViewKey(viewRoute) {
  if (!tabsEnabled.value) return String(viewRoute.name || viewRoute.path)
  const key = buildConsoleTabKey(viewRoute)
  return `${key}:${tabsStore.getGeneration(key)}`
}

function getRouteKey(fullPath) {
  if (!fullPath) return ''
  return buildConsoleTabKey(router.resolve(fullPath))
}

function handleEscape(event) {
  if (event.key === 'Escape' && tabsStore.maximized) {
    tabsStore.maximized = false
  }
}

watch(
  () => [tabsEnabled.value, authStore.user?.id],
  ([enabled]) => {
    if (enabled) initializeTabs()
    else tabsStore.clear()
  },
  { immediate: true }
)

watch(
  () => route.fullPath,
  async (fullPath, previousFullPath) => {
    if (!tabsEnabled.value) return
    const previousKey = getRouteKey(previousFullPath)
    if (previousKey) tabsStore.saveScroll(previousKey, contentRef.value?.scrollTop || 0)

    tabsStore.addRoute(route, authStore.rootMenus)
    await nextTick()
    contentRef.value?.scrollTo({ top: tabsStore.getScroll(getRouteKey(fullPath)), behavior: 'auto' })
  }
)

watch(
  () => authStore.rootMenus,
  (menus) => {
    if (tabsEnabled.value) tabsStore.syncMenuPolicies(router, menus)
  },
  { deep: true }
)

watch(
  () => tabsStore.maximized,
  (maximized) => document.body.classList.toggle('console-workspace-maximized', maximized),
  { immediate: true }
)

onMounted(() => window.addEventListener('keydown', handleEscape))

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  document.body.classList.remove('console-workspace-maximized')
})
</script>

<style scoped>
.enterprise-main-layout--tabs {
  --console-workspace-top-offset: calc(var(--console-header-height) + var(--console-tabs-height, 48px));
  --console-content-viewport-height: calc(100vh - var(--console-header-height) - var(--console-tabs-height, 48px));
  --console-page-available-height: calc(var(--console-content-viewport-height) - var(--console-content-padding) * 2);
}

.enterprise-main-layout--maximized {
  --console-workspace-top-offset: 0px;
  --console-content-viewport-height: 100vh;
  --console-page-available-height: calc(100vh - var(--console-content-padding) * 2);
  position: fixed;
  inset: 0;
  z-index: 1200;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  flex: none;
  background: var(--console-bg);
}

.enterprise-main-layout--maximized .console-tabs-bar {
  display: none;
}

.enterprise-main-layout--maximized .enterprise-content {
  min-height: 0;
  flex: 1;
  height: 100vh;
}

:global(body.console-workspace-maximized) {
  overflow: hidden;
}

.console-workspace-exit {
  position: fixed;
  top: 12px;
  right: 18px;
  z-index: 1201;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  color: var(--console-menu-text);
  background: var(--console-surface);
  box-shadow: 0 4px 12px rgba(16, 24, 40, 0.12);
  cursor: pointer;
}

.console-workspace-exit:hover,
.console-workspace-exit:focus-visible {
  color: var(--console-primary-strong);
  border-color: var(--console-primary);
}

@media (max-width: 767px) {
  .enterprise-main-layout--tabs {
    --console-workspace-top-offset: var(--console-header-height);
    --console-content-viewport-height: calc(100vh - var(--console-header-height));
    --console-page-available-height: calc(var(--console-content-viewport-height) - var(--console-content-padding) * 2);
  }
}
</style>
