import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import Antd from 'ant-design-vue'
import App from './App.vue'
import { router } from './router'
import { useAuthStore } from './stores/auth'
import { useAppStore } from './stores/app'
import { useSiteStore } from './stores/site'
import { setAuthExpiredHandler } from './services/http'
import { getAuthExpiredRedirect } from './utils/authRedirect'
import 'ant-design-vue/dist/reset.css'
import './styles/index.css'
import './styles/console.css'
import './styles/console-dark.css'
import './styles/console-light.css'
import './styles/admin-workspaces.css'
import './styles/article-reader-light.css'
import './styles/public-theme.css'
import './styles/auth-inputs.css'

dayjs.locale('zh-cn')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)

const authStore = useAuthStore()
const appStore = useAppStore()
const siteStore = useSiteStore()
let authExpiryRedirectPending = false

setAuthExpiredHandler(() => {
  const redirect = getAuthExpiredRedirect(router.currentRoute.value)
  authStore.clearSession({ clearEntranceAutoPlay: true })
  if (redirect && !authExpiryRedirectPending) {
    authExpiryRedirectPending = true
    message.warning('登录状态已失效，请重新登录')
    return router.replace(redirect).finally(() => {
      authExpiryRedirectPending = false
    })
  }
})

Promise.allSettled([
  authStore.restoreSession(),
  siteStore.loadProfile()
]).then(() => {
  appStore.initializeTheme({
    defaultTheme: siteStore.profile.defaultTheme,
    user: authStore.user
  })
  app.mount('#app')
})
