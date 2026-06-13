import { createPinia } from 'pinia'
import { createApp } from 'vue'
import {
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Layout,
  List,
  Dropdown,
  Menu,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload
} from 'ant-design-vue'
import App from './App.vue'
import { router } from './router'
import { useAuthStore } from './stores/auth'
import 'ant-design-vue/dist/reset.css'
import './styles/index.css'
import './styles/console.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
const antComponents = [
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Layout,
  List,
  Dropdown,
  Menu,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload
]

antComponents.forEach((component) => {
  app.use(component)
})

const authStore = useAuthStore()
authStore.restoreSession().finally(() => {
  app.mount('#app')
})
