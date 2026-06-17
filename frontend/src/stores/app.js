import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = ref(localStorage.getItem('blog-theme') || 'light')

  const isDark = computed(() => theme.value === 'dark')

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

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    applyTheme
  }
})
