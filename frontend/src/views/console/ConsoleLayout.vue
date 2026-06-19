<template>
  <a-layout class="enterprise-admin-shell">
    <a-layout-header class="enterprise-topnav">
      <button class="enterprise-topnav-brand" type="button" @click="router.push('/console/articles')">
        <img class="enterprise-brand-icon" src="/favicon.svg" alt="" aria-hidden="true">
        <div>
          <strong>Knowledge OS</strong>
          <small>企业级个人知识库系统</small>
        </div>
      </button>

      <a-menu
        class="enterprise-primary-menu"
        mode="horizontal"
        :theme="menuTheme"
        :selected-keys="[primarySection]"
        @click="handlePrimaryClick"
      >
        <a-menu-item key="knowledge">
          <template #icon><BookOutlined /></template>
          知识库
        </a-menu-item>
        <a-menu-item v-if="authStore.isAdmin" key="management">
          <template #icon><ControlOutlined /></template>
          后台管理
        </a-menu-item>
      </a-menu>

      <div class="enterprise-topnav-actions">
        <a-tooltip title="门户首页">
          <a-button class="enterprise-icon-action" @click="router.push('/')">
            <template #icon><HomeOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="全文检索">
          <a-button class="enterprise-icon-action" @click="router.push('/console/search')">
            <template #icon><SearchOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip v-if="authStore.isAdmin" title="新建内容">
          <a-dropdown :trigger="['click', 'hover']">
            <a-button class="enterprise-icon-action" @click.prevent>
              <template #icon><SquarePen :size="16" /></template>
            </a-button>
            <template #overlay>
              <a-menu class="enterprise-create-menu" @click="handleCreateAction">
                <a-menu-item key="article">
                  <template #icon><FileTextOutlined /></template>
                  新建文章
                </a-menu-item>
                <a-menu-item key="media">
                  <template #icon><PictureOutlined /></template>
                  上传媒体资产
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-tooltip>
        <NotificationBell />
        <a-tooltip :title="appStore.isDark ? '切换浅色模式' : '切换深色模式'">
          <a-button class="enterprise-icon-action" @click="appStore.toggleTheme">
            <template #icon>
              <Sun v-if="appStore.isDark" :size="16" />
              <Moon v-else :size="16" />
            </template>
          </a-button>
        </a-tooltip>

          <a-dropdown :trigger="['hover']">
            <button class="enterprise-profile-button" type="button">
              <a-avatar class="enterprise-avatar" :src="authStore.user?.avatar || ''">{{ userInitial }}</a-avatar>
            <span>
              <strong>{{ authStore.user?.username || '用户' }}</strong>
              <small>{{ authStore.isAdmin ? '管理员' : '普通用户' }}</small>
            </span>
            <DownOutlined />
          </button>
          <template #overlay>
            <a-menu @click="handleProfileAction">
              <a-menu-item key="profile">
                <template #icon><UserOutlined /></template>
                个人信息
              </a-menu-item>
              <a-menu-item key="logout" danger>
                <template #icon><LogoutOutlined /></template>
                退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>

    <a-layout class="enterprise-console-body">
      <a-layout-sider
        v-model:collapsed="siderCollapsed"
        width="280"
        :collapsed-width="72"
        :class="['enterprise-sider', { 'enterprise-sider--full-labels': siderFullLabels }]"
        collapsible
        :trigger="null"
      >
        <div class="enterprise-sider-head">
          <button
            class="enterprise-sider-head-action"
            type="button"
            :aria-label="siderCollapsed ? '展开菜单' : '收起菜单'"
            :title="siderCollapsed ? '展开菜单' : '收起菜单'"
            @click="siderCollapsed = !siderCollapsed"
          >
            <MenuUnfoldOutlined v-if="siderCollapsed" />
            <MenuFoldOutlined v-else />
          </button>
          <strong v-if="!siderCollapsed" :title="sectionTitle">{{ sectionTitle }}</strong>

          <a-dropdown v-if="!siderCollapsed" :trigger="['click']">
            <button
              class="enterprise-sider-head-action"
              type="button"
              aria-label="打开菜单操作"
              @click.prevent
            >
              <MoreOutlined />
            </button>
            <template #overlay>
              <a-menu class="enterprise-sider-actions" @click="handleSiderAction">
                <a-menu-item key="toggle-labels">
                  <template #icon>
                    <ExpandOutlined v-if="!siderFullLabels" />
                    <CompressOutlined v-else />
                  </template>
                  <span>{{ siderFullLabels ? '恢复单行名称' : '展开完整名称' }}</span>
                </a-menu-item>
                <a-menu-item key="reset-current">
                  <template #icon><AimOutlined /></template>
                  定位当前菜单
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>

        <a-menu
          :open-keys="effectiveOpenKeys"
          :class="['enterprise-menu', `enterprise-menu--${primarySection}`]"
          mode="inline"
          :theme="menuTheme"
          :inline-collapsed="siderCollapsed"
          :selected-keys="selectedKeys"
          @openChange="handleMenuOpenChange"
          @click="handleSecondaryClick"
        >
          <template v-if="primarySection === 'knowledge'">
            <a-menu-item key="/console/articles">
              <template #icon><FileTextOutlined /></template>
              全部文章
            </a-menu-item>
            <a-menu-item key="/console/memos">
              <template #icon><BulbOutlined /></template>
              备忘录
            </a-menu-item>
            <template v-for="category in categoryTree" :key="`category-node:${category.slug}`">
              <ConsoleCategoryMenu :category="category" />
            </template>
            <a-sub-menu v-if="uncategorizedArticles.length > 0" key="category:__uncategorized">
              <template #icon><FolderOutlined /></template>
              <template #title>默认分类</template>
              <a-menu-item
                v-for="article in uncategorizedArticles"
                :key="`/console/articles/${article.slug}`"
              >
                {{ article.title }}
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item v-if="knowledgeMenuLoading && !hasKnowledgeMenuData" key="knowledge-menu-loading" disabled>
              正在同步目录...
            </a-menu-item>
            <a-menu-item v-else-if="knowledgeMenuError && !hasKnowledgeMenuData" key="knowledge-menu-error" disabled>
              目录加载失败
            </a-menu-item>
            <a-menu-item v-else-if="knowledgeMenuLoaded && categoryTree.length === 0" key="/console/articles" disabled>
              暂无分类
            </a-menu-item>
          </template>

          <template v-else>
            <template v-for="menu in visibleManagementMenus" :key="menu.id">
              <ConsoleDynamicMenu :menu="menu" />
            </template>
            <a-menu-item v-if="visibleManagementMenus.length === 0" key="management-empty" disabled>
              暂无可访问后台菜单
            </a-menu-item>
          </template>
        </a-menu>

      </a-layout-sider>

      <a-layout class="enterprise-main-layout">
        <a-layout-content :class="['enterprise-content', { 'enterprise-content--immersive': isImmersiveRoute }]">
          <div :class="['enterprise-content-inner', { 'enterprise-content-inner--immersive': isImmersiveRoute }]">
            <router-view />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
  <AnnouncementPopup />
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AimOutlined,
  ApiOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  BookOutlined,
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudOutlined,
  CodeOutlined,
  CommentOutlined,
  CompressOutlined,
  ControlOutlined,
  CustomerServiceOutlined,
  AuditOutlined,
  BellOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DesktopOutlined,
  DownOutlined,
  ExperimentOutlined,
  ExpandOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  FireOutlined,
  FolderOutlined,
  FormOutlined,
  GlobalOutlined,
  HddOutlined,
  HeartOutlined,
  HomeOutlined,
  InboxOutlined,
  KeyOutlined,
  LayoutOutlined,
  LinkOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  MonitorOutlined,
  MoreOutlined,
  NotificationOutlined,
  PictureOutlined,
  ProfileOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  RocketOutlined,
  SearchOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShareAltOutlined,
  ShopOutlined,
  StarOutlined,
  SwapOutlined,
  TableOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import NotificationBell from '@/components/NotificationBell.vue'
import AnnouncementPopup from '@/components/AnnouncementPopup.vue'
import { Menu } from 'ant-design-vue'
import { Moon, SquarePen, Sun } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { getKnowledgeMenu, listPublicArticles } from '@/services/public'

const KNOWLEDGE_MENU_CACHE_TTL = 60 * 1000
const knowledgeMenuCache = {
  categories: [],
  articles: [],
  loadedAt: 0
}

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const categories = ref([])
const articles = ref([])
const siderCollapsed = ref(false)
const siderFullLabels = ref(false)
const openKeys = ref([])
const knowledgeMenuLoaded = ref(knowledgeMenuCache.loadedAt > 0)
const knowledgeMenuLoading = ref(false)
const knowledgeMenuError = ref('')
let knowledgeMenuRequestId = 0
if (knowledgeMenuLoaded.value) {
  categories.value = knowledgeMenuCache.categories
  articles.value = knowledgeMenuCache.articles
}

const menuTheme = computed(() => appStore.isDark ? 'dark' : 'light')
const AMenuItem = Menu.Item
const ASubMenu = Menu.SubMenu
const iconMap = {
  ApiOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudOutlined,
  CodeOutlined,
  CommentOutlined,
  ControlOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DesktopOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  FireOutlined,
  FolderOutlined,
  FormOutlined,
  GlobalOutlined,
  HddOutlined,
  HeartOutlined,
  HomeOutlined,
  InboxOutlined,
  KeyOutlined,
  LayoutOutlined,
  LinkOutlined,
  LockOutlined,
  MailOutlined,
  MenuOutlined,
  MessageOutlined,
  MonitorOutlined,
  NotificationOutlined,
  PictureOutlined,
  ProfileOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  RocketOutlined,
  SearchOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShareAltOutlined,
  ShopOutlined,
  StarOutlined,
  SwapOutlined,
  TableOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  UserOutlined
}
const isWriterRoute = computed(() => route.path === '/console/write' || route.path.includes('/console/manage/articles/'))
const isArticleDetailRoute = computed(() => route.path.includes('/console/articles/'))
const isImmersiveRoute = computed(() => isWriterRoute.value || isArticleDetailRoute.value)
const primarySection = computed(() => {
  if (route.path.includes('/console/manage') || route.path === '/console') {
    return authStore.isAdmin ? 'management' : 'knowledge'
  }

  return 'knowledge'
})
const selectedKeys = computed(() => {
  if (primarySection.value === 'management') {
    const matched = findManagementRouteState(visibleManagementMenus.value, route.path)
    return [matched?.selectedKey || route.path]
  }

  if (route.path === '/console/manage/articles') return ['/console/manage/articles']
  if (route.path.includes('/console/articles/')) return [route.path]
  if (route.path.includes('/console/categories/')) return [route.path]
  if (route.path.includes('/console/tags/')) return [route.path]
  return [route.path]
})
const userInitial = computed(() => {
  return (authStore.user?.username || authStore.user?.email || 'U').slice(0, 1).toUpperCase()
})
const sectionTitle = computed(() => (primarySection.value === 'management' ? '后台管理' : '文章分类'))
const uncategorizedArticles = computed(() => {
  return articles.value
    .filter((article) => !article.category?.id || article.category?.isSystem || article.category?.slug === 'uncategorized')
    .sort((left, right) => new Date(right.publishedAt || right.createdAt) - new Date(left.publishedAt || left.createdAt))
})
const hasKnowledgeMenuData = computed(() => categoryTree.value.length > 0 || uncategorizedArticles.value.length > 0)
const visibleManagementMenus = computed(() => {
  return (authStore.managementMenus || []).filter((menu) => menu.enabled !== false && !menu.hidden)
})
const effectiveOpenKeys = computed(() => (siderCollapsed.value ? [] : openKeys.value))
const ConsoleDynamicMenu = defineComponent({
  name: 'ConsoleDynamicMenu',
  props: {
    menu: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    return () => {
      const iconComponent = iconMap[props.menu.icon] || MenuOutlined
      const children = (props.menu.children || []).filter((item) => item.enabled !== false && !item.hidden)
      const nodeKey = getManagementMenuKey(props.menu)

      if (children.length > 0) {
        return h(
          ASubMenu,
          { key: nodeKey },
          {
            icon: () => h(iconComponent),
            title: () => props.menu.name,
            default: () => children.map((child) => h(ConsoleDynamicMenu, {
              key: getManagementMenuKey(child),
              menu: child
            }))
          }
        )
      }

      return h(
        AMenuItem,
        { key: props.menu.routePath },
        {
          icon: () => h(iconComponent),
          default: () => props.menu.name
        }
      )
    }
  }
})
const ConsoleCategoryMenu = defineComponent({
  name: 'ConsoleCategoryMenu',
  props: {
    category: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    return () => h(
      ASubMenu,
      { key: `category:${props.category.slug}` },
      {
        icon: () => h(FolderOutlined),
        title: () => props.category.name,
        default: () => [
          ...props.category.children.map((child) => h(ConsoleCategoryMenu, {
            key: `category-node:${child.slug}`,
            category: child
          })),
          ...props.category.articles.map((article) => h(AMenuItem, {
            key: `/console/articles/${article.slug}`
          }, () => article.title))
        ]
      }
    )
  }
})
const categoryTree = computed(() => {
  const categoryMap = new Map(categories.value.map((category) => [
    category.id,
    {
      ...category,
      children: [],
      articles: articles.value.filter((article) => article.category?.id === category.id)
    }
  ]))
  const roots = []

  categoryMap.forEach((category) => {
    const parent = category.parent ? categoryMap.get(category.parent) : null

    if (parent) {
      parent.children.push(category)
      return
    }

    roots.push(category)
  })

  const sortTree = (items) => {
    return items
      .sort((left, right) => {
        const sortValue = (left.sortOrder || 0) - (right.sortOrder || 0)
        return sortValue || left.name.localeCompare(right.name, 'zh-Hans-CN')
      })
      .map((item) => ({
        ...item,
        children: sortTree(item.children),
        articles: item.articles.sort((left, right) => {
          return new Date(right.publishedAt || right.createdAt) - new Date(left.publishedAt || left.createdAt)
        })
      }))
  }

  return sortTree(roots)
})

function handlePrimaryClick({ key }) {
  if (key === 'knowledge') {
    router.push('/console/articles')
    return
  }

  router.push('/console')
}

function handleSecondaryClick({ key }) {
  if (!key || String(key).includes(':') || key === route.path) return
  router.push(key)
}

async function handleProfileAction({ key }) {
  if (key === 'profile') {
    router.push('/console/profile')
    return
  }

  await authStore.logout()
  router.push('/')
}

function handleCreateAction({ key }) {
  if (key === 'article') {
    router.push('/console/manage/articles/new')
    return
  }

  if (key === 'media') {
    router.push('/console/manage/media')
  }
}

function handleSiderAction({ key }) {
  if (key === 'toggle-labels') {
    siderFullLabels.value = !siderFullLabels.value
    return
  }

  if (key === 'reset-current') {
    openKeys.value = resolveOpenKeys(route.path)
  }
}

function handleMenuOpenChange(nextKeys) {
  if (siderCollapsed.value) return
  openKeys.value = [...nextKeys]
}

function getManagementMenuKey(menu) {
  return menu?.id || menu?.code || menu?.routePath
}

function findManagementRouteState(items = [], path, ancestors = []) {
  let matched = null

  for (const item of items) {
    const itemKey = getManagementMenuKey(item)
    const children = (item.children || []).filter((child) => child.enabled !== false && !child.hidden)

    if (children.length > 0) {
      const childMatched = findManagementRouteState(children, path, [...ancestors, itemKey])
      if (childMatched && (!matched || childMatched.matchLength > matched.matchLength)) {
        matched = childMatched
      }
    }

    const routePath = item.routePath || ''
    const isLeaf = children.length === 0
    const isMatchedLeaf = isLeaf && routePath && (path === routePath || path.startsWith(`${routePath}/`))
    if (isMatchedLeaf) {
      const candidate = {
        selectedKey: routePath,
        openKeys: ancestors,
        matchLength: routePath.length
      }
      if (!matched || candidate.matchLength > matched.matchLength) {
        matched = candidate
      }
    }
  }

  return matched
}

function resolveOpenKeys(path) {
  if (primarySection.value === 'management') {
    return findManagementRouteState(visibleManagementMenus.value, path)?.openKeys || []
  }

  if (path.includes('/console/categories/')) {
    const slug = path.split('/').at(-1)
    return resolveCategoryOpenKeys(slug)
  }

  if (path.includes('/console/articles/')) {
    const article = articles.value.find((item) => `/console/articles/${item.slug}` === path)
    if (!article) return []
    if (!article.category?.slug || article.category?.isSystem || article.category?.slug === 'uncategorized') return ['category:__uncategorized']
    return resolveCategoryOpenKeys(article.category.slug)
  }

  return []
}

function resolveCategoryOpenKeys(slug) {
  const categoryBySlug = new Map(categories.value.map((category) => [category.slug, category]))
  const categoryById = new Map(categories.value.map((category) => [category.id, category]))
  const current = categoryBySlug.get(slug)

  if (!current) return [`category:${slug}`]

  const keys = []
  let pointer = current

  while (pointer) {
    keys.unshift(`category:${pointer.slug}`)
    pointer = pointer.parent ? categoryById.get(pointer.parent) : null
  }

  return keys
}

function isKnowledgeMenuCacheFresh() {
  return knowledgeMenuCache.loadedAt > 0 && Date.now() - knowledgeMenuCache.loadedAt < KNOWLEDGE_MENU_CACHE_TTL
}

async function loadKnowledgeMenu({ force = false } = {}) {
  if (knowledgeMenuLoading.value) {
    return
  }

  if (!force && isKnowledgeMenuCacheFresh()) {
    categories.value = knowledgeMenuCache.categories
    articles.value = knowledgeMenuCache.articles
    knowledgeMenuLoaded.value = true
    knowledgeMenuError.value = ''
    if (!siderCollapsed.value) {
      openKeys.value = resolveOpenKeys(route.path)
    }
    return
  }

  const requestId = ++knowledgeMenuRequestId
  knowledgeMenuLoading.value = true
  knowledgeMenuError.value = ''

  try {
    const menuResult = await getKnowledgeMenu()

    if (requestId !== knowledgeMenuRequestId) {
      return
    }

    const nextCategories = menuResult.categories || []
    const nextArticles = menuResult.articles || []
    categories.value = nextCategories
    articles.value = nextArticles
    knowledgeMenuCache.categories = nextCategories
    knowledgeMenuCache.articles = nextArticles
    knowledgeMenuCache.loadedAt = Date.now()
    knowledgeMenuLoaded.value = true
    openKeys.value = resolveOpenKeys(route.path)
  } catch (error) {
    if (requestId !== knowledgeMenuRequestId) {
      return
    }

    knowledgeMenuError.value = error.message || '知识库目录加载失败'
    // 保留上一次成功加载的目录，避免接口抖动时左侧菜单清空闪烁。
    if (!hasKnowledgeMenuData.value && knowledgeMenuCache.loadedAt > 0) {
      categories.value = knowledgeMenuCache.categories
      articles.value = knowledgeMenuCache.articles
      knowledgeMenuLoaded.value = true
    }
  } finally {
    if (requestId === knowledgeMenuRequestId) {
      knowledgeMenuLoading.value = false
    }
  }
}

watch(() => route.path, (path) => {
  if (!siderCollapsed.value) {
    openKeys.value = resolveOpenKeys(path)
  }
})

watch(primarySection, async (section) => {
  if (section !== 'knowledge' || knowledgeMenuLoaded.value) {
    return
  }

  await loadKnowledgeMenu()
}, { immediate: true })

watch(() => authStore.isAdmin, () => {
  if (!authStore.isAdmin && route.path.includes('/console/manage')) {
    router.push('/console/articles')
  }
})

onMounted(() => {
  if (primarySection.value === 'knowledge' && !knowledgeMenuLoaded.value) {
    loadKnowledgeMenu()
  }
})
</script>
