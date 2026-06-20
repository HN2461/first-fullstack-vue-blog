import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = ref(localStorage.getItem('blog-theme') || 'light')
  const viewportWidth = ref(typeof window === 'undefined' ? 1024 : window.innerWidth)

  const isDark = computed(() => theme.value === 'dark')
  const isMobile = computed(() => viewportWidth.value < 768)

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  function applyTheme() {
    document.documentElement.classList.toggle('dark-theme', isDark.value)
  }

  function setTheme(nextTheme, options = {}) {
    const { persist = true } = options
    theme.value = nextTheme === 'dark' ? 'dark' : 'light'
    if (persist) {
      localStorage.setItem('blog-theme', theme.value)
    }
    applyTheme()
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
    viewportWidth,
    isDark,
    isMobile,
    setTheme,
    toggleTheme,
    applyTheme,
    initResponsive,
    syncViewport
  }
})
