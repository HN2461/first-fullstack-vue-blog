import { createPinia } from 'pinia'
import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import { router } from './router'
import { useAuthStore } from './stores/auth'
import 'ant-design-vue/dist/reset.css'
import './styles/index.css'
import './styles/console.css'
import './styles/auth-inputs.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)

const authStore = useAuthStore()
authStore.restoreSession().finally(() => {
  app.mount('#app')
})
