import { useRoute } from 'vue-router'
import { useConsoleTabsStore } from '@/stores/consoleTabs'
import { buildConsoleTabKey } from '@/utils/consoleTabs'

export function useConsoleTabTitle() {
  const route = useRoute()
  const tabsStore = useConsoleTabsStore()

  function updateConsoleTabTitle(title) {
    if (!route.path.startsWith('/console')) return
    tabsStore.updateTitle(buildConsoleTabKey(route), title)
  }

  return { updateConsoleTabTitle }
}
