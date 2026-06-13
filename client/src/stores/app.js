import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = ref(localStorage.getItem('blog-theme') || 'light')

  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    theme.value = isDark.value ? 'light' : 'dark'
    localStorage.setItem('blog-theme', theme.value)
    document.documentElement.classList.toggle('dark-theme', isDark.value)
  }

  function applyTheme() {
    document.documentElement.classList.toggle('dark-theme', isDark.value)
  }

  return {
    theme,
    isDark,
    toggleTheme,
    applyTheme
  }
})
