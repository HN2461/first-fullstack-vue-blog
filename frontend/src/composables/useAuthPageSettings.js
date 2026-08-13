import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'

export function useAuthPageSettings() {
  const appStore = useAppStore()
  const lang = ref(localStorage.getItem('auth-lang') || 'zh')
  const layout = ref(localStorage.getItem('auth-layout') || 'right')
  const theme = computed({
    get: () => appStore.theme,
    set: (value) => appStore.setAnonymousThemeOverride(value)
  })

  watch(lang, (value) => localStorage.setItem('auth-lang', value))
  watch(layout, (value) => localStorage.setItem('auth-layout', value))

  return {
    theme,
    lang,
    layout
  }
}
