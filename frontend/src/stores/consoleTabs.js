import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { buildConsoleTabKey, createConsoleTab, isRestorableConsoleRoute } from '@/utils/consoleTabs'

const STORAGE_PREFIX = 'console-tabs:v1'

function storageKey(userId) {
  return `${STORAGE_PREFIX}:${userId || 'anonymous'}`
}

function readStoredTabs(userId) {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey(userId)) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export const useConsoleTabsStore = defineStore('consoleTabs', () => {
  const tabs = ref([])
  const initializedUserId = ref('')
  const maximized = ref(false)
  const generations = reactive({})
  const scrollPositions = reactive({})
  const dirtyKeys = reactive(new Set())

  const hasTabs = computed(() => tabs.value.length > 0)

  function persist() {
    if (!initializedUserId.value) return
    try {
      sessionStorage.setItem(storageKey(initializedUserId.value), JSON.stringify(tabs.value))
    } catch {
      // 会话存储不可用时退化为仅内存标签，不影响控制台导航。
    }
  }

  function addRoute(route, rootMenus = [], options = {}) {
    if (!route?.path?.startsWith('/console') || !route.name) return null
    const nextTab = createConsoleTab(route, rootMenus, options)
    const index = tabs.value.findIndex((tab) => tab.key === nextTab.key)

    if (index >= 0) {
      tabs.value[index] = {
        ...tabs.value[index],
        ...nextTab,
        affix: tabs.value[index].affix || nextTab.affix
      }
    } else {
      tabs.value.push(nextTab)
    }
    persist()
    return nextTab
  }

  function initialize({ userId, router, canAccessPath, rootMenus, homePath }) {
    if (!userId) return
    if (initializedUserId.value !== userId) {
      tabs.value = readStoredTabs(userId).filter((tab) => {
        const resolved = router.resolve(tab.fullPath || tab.path || '')
        return isRestorableConsoleRoute(resolved, canAccessPath)
      })
      initializedUserId.value = userId
    }

    const resolvedHome = router.resolve(homePath)
    if (isRestorableConsoleRoute(resolvedHome, canAccessPath)) {
      addRoute(resolvedHome, rootMenus, { affix: true })
      const homeIndex = tabs.value.findIndex((tab) => tab.key === buildConsoleTabKey(resolvedHome))
      if (homeIndex > 0) {
        const [homeTab] = tabs.value.splice(homeIndex, 1)
        tabs.value.unshift(homeTab)
      }
    }
    persist()
  }

  function getByRoute(route) {
    const key = buildConsoleTabKey(route)
    return tabs.value.find((tab) => tab.key === key) || null
  }

  function getGeneration(key) {
    return generations[key] || 0
  }

  function invalidate(key) {
    generations[key] = getGeneration(key) + 1
    dirtyKeys.delete(key)
  }

  function remove(key) {
    const index = tabs.value.findIndex((tab) => tab.key === key)
    if (index < 0 || tabs.value[index].affix) return false
    tabs.value.splice(index, 1)
    invalidate(key)
    delete scrollPositions[key]
    persist()
    return true
  }

  function removeMany(keys = []) {
    const targets = new Set(keys)
    tabs.value
      .filter((tab) => targets.has(tab.key) && !tab.affix)
      .forEach((tab) => invalidate(tab.key))
    tabs.value = tabs.value.filter((tab) => tab.affix || !targets.has(tab.key))
    keys.forEach((key) => delete scrollPositions[key])
    persist()
  }

  function updateTitle(key, title) {
    const tab = tabs.value.find((item) => item.key === key)
    if (!tab || !String(title || '').trim()) return
    tab.title = String(title).trim()
    persist()
  }

  function syncMenuPolicies(router, rootMenus = []) {
    tabs.value = tabs.value.map((tab) => {
      const route = router.resolve(tab.fullPath)
      const refreshed = createConsoleTab(route, rootMenus, { affix: tab.affix })
      return { ...tab, ...refreshed, title: tab.title, affix: tab.affix }
    })
    persist()
  }

  function setDirty(route, dirty) {
    const key = buildConsoleTabKey(route)
    if (dirty) dirtyKeys.add(key)
    else dirtyKeys.delete(key)
  }

  function isDirty(key) {
    return dirtyKeys.has(key)
  }

  function saveScroll(key, scrollTop) {
    if (!key) return
    scrollPositions[key] = Number(scrollTop || 0)
  }

  function getScroll(key) {
    return scrollPositions[key] || 0
  }

  function clear(options = {}) {
    const userId = initializedUserId.value
    tabs.value = []
    maximized.value = false
    dirtyKeys.clear()
    Object.keys(generations).forEach((key) => delete generations[key])
    Object.keys(scrollPositions).forEach((key) => delete scrollPositions[key])
    if (options.removeStored !== false && userId) {
      sessionStorage.removeItem(storageKey(userId))
    }
    if (options.resetUser !== false) initializedUserId.value = ''
  }

  return {
    tabs,
    hasTabs,
    maximized,
    initialize,
    addRoute,
    getByRoute,
    getGeneration,
    invalidate,
    remove,
    removeMany,
    updateTitle,
    syncMenuPolicies,
    setDirty,
    isDirty,
    saveScroll,
    getScroll,
    clear
  }
})
