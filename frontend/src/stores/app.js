import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { updateThemePreference } from '@/services/http'
import { useAuthStore } from '@/stores/auth'
import {
  normalizeTheme,
  normalizeThemePreference,
  resolveTheme,
  THEME_VALUES
} from '@/utils/themePreference'

const AUTH_THEME_OVERRIDE_KEY = 'blog-auth-theme-override'
export const useAppStore = defineStore('app', () => {
  const theme = ref('light')
  const siteDefaultTheme = ref('light')
  const userThemePreference = ref('default')
  const authThemeOverride = ref(sessionStorage.getItem(AUTH_THEME_OVERRIDE_KEY) || '')
  const viewportWidth = ref(typeof window === 'undefined' ? 1024 : window.innerWidth)

  const isDark = computed(() => theme.value === 'dark')
  const isMobile = computed(() => viewportWidth.value < 768)

  function applyTheme() {
    document.documentElement.classList.toggle('dark-theme', isDark.value)
    document.documentElement.style.colorScheme = theme.value
  }

  function refreshTheme(isLoggedIn = useAuthStore().isLoggedIn) {
    theme.value = resolveTheme({
      isLoggedIn,
      userPreference: userThemePreference.value,
      authOverride: authThemeOverride.value,
      siteDefaultTheme: siteDefaultTheme.value
    })
    applyTheme()
  }

  function initializeTheme({ defaultTheme, user } = {}) {
    // 旧版两套长期主题会破坏站点默认和账号偏好的优先级，初始化后不再使用。
    localStorage.removeItem('blog-theme')
    localStorage.removeItem('auth-theme')
    siteDefaultTheme.value = normalizeTheme(defaultTheme)
    userThemePreference.value = normalizeThemePreference(user?.themePreference)
    if (user?.id) {
      clearAuthThemeOverride()
    }
    refreshTheme(Boolean(user?.id))
  }

  function setSiteDefaultTheme(value) {
    siteDefaultTheme.value = normalizeTheme(value)
    refreshTheme()
  }

  function syncUserThemePreference(user) {
    userThemePreference.value = normalizeThemePreference(user?.themePreference)
    if (user?.id) {
      clearAuthThemeOverride()
    }
    refreshTheme(Boolean(user?.id))
  }

  function setAnonymousThemeOverride(value) {
    const nextTheme = normalizeTheme(value, siteDefaultTheme.value)
    authThemeOverride.value = nextTheme
    sessionStorage.setItem(AUTH_THEME_OVERRIDE_KEY, nextTheme)
    refreshTheme(false)
  }

  function clearAuthThemeOverride() {
    authThemeOverride.value = ''
    sessionStorage.removeItem(AUTH_THEME_OVERRIDE_KEY)
  }

  function resetToSiteDefault() {
    userThemePreference.value = 'default'
    clearAuthThemeOverride()
    refreshTheme(false)
  }

  async function toggleTheme() {
    const nextTheme = isDark.value ? 'light' : 'dark'
    const authStore = useAuthStore()

    if (!authStore.isLoggedIn) {
      setAnonymousThemeOverride(nextTheme)
      return nextTheme
    }

    const previousPreference = userThemePreference.value
    theme.value = nextTheme
    userThemePreference.value = nextTheme
    applyTheme()

    try {
      const user = await updateThemePreference(nextTheme)
      authStore.user = { ...authStore.user, ...user }
      userThemePreference.value = normalizeThemePreference(user.themePreference)
      refreshTheme(true)
      return nextTheme
    } catch (error) {
      userThemePreference.value = previousPreference
      refreshTheme(true)
      throw error
    }
  }

  async function setUserThemePreference(value) {
    const preference = normalizeThemePreference(value)
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return null

    const user = await updateThemePreference(preference)
    authStore.user = { ...authStore.user, ...user }
    userThemePreference.value = normalizeThemePreference(user.themePreference)
    refreshTheme(true)
    return user
  }

  function syncViewport() {
    if (typeof window === 'undefined') return
    viewportWidth.value = window.innerWidth
    document.documentElement.dataset.device = isMobile.value ? 'mobile' : 'desktop'
  }

  function initResponsive() {
    syncViewport()
    if (typeof window === 'undefined') return
    window.removeEventListener('resize', syncViewport)
    window.addEventListener('resize', syncViewport, { passive: true })
  }

  return {
    theme,
    siteDefaultTheme,
    userThemePreference,
    viewportWidth,
    isDark,
    isMobile,
    initializeTheme,
    setSiteDefaultTheme,
    syncUserThemePreference,
    setAnonymousThemeOverride,
    resetToSiteDefault,
    setUserThemePreference,
    toggleTheme,
    applyTheme,
    initResponsive,
    syncViewport
  }
})
