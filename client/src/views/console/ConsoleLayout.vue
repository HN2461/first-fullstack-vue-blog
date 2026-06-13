<template>
  <a-layout class="enterprise-admin-shell">
    <a-layout-header class="enterprise-topnav">
      <button class="enterprise-topnav-brand" type="button" @click="router.push('/console/articles')">
        <span>K</span>
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
        <a-tooltip v-if="authStore.isAdmin" title="新建文章">
          <a-button class="enterprise-icon-action" type="primary" @click="router.push('/console/manage/articles/new')">
            <template #icon><PlusOutlined /></template>
          </a-button>
        </a-tooltip>
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
            <a-avatar class="enterprise-avatar">{{ userInitial }}</a-avatar>
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
        class="enterprise-sider"
        collapsible
        :trigger="null"
      >
        <div class="enterprise-sider-head">
          <div v-if="!siderCollapsed">
            <strong>{{ primarySection === 'management' ? '后台管理' : '文章分类' }}</strong>
          </div>
          <strong v-else>{{ primarySection === 'management' ? '管' : '知' }}</strong>
        </div>

        <a-menu
          v-model:openKeys="openKeys"
          :class="['enterprise-menu', `enterprise-menu--${primarySection}`]"
          mode="inline"
          :theme="menuTheme"
          :inline-collapsed="siderCollapsed"
          :selected-keys="selectedKeys"
          @click="handleSecondaryClick"
        >
          <template v-if="primarySection === 'knowledge'">
            <template v-for="category in categoryTree" :key="`category-node:${category.slug}`">
              <ConsoleCategoryMenu :category="category" />
            </template>
            <a-menu-item v-if="categoryTree.length === 0" key="/console/articles" disabled>
              暂无分类
            </a-menu-item>
          </template>

          <template v-else>
            <a-menu-item class="enterprise-dashboard-item" key="/console">
              <template #icon><DashboardOutlined /></template>
              管理工作台
            </a-menu-item>
            <a-sub-menu key="contentRoot">
              <template #icon><FileTextOutlined /></template>
              <template #title>内容资产</template>
              <a-menu-item key="/console/manage/articles">文章管理</a-menu-item>
              <a-menu-item key="/console/manage/categories">分类体系</a-menu-item>
              <a-menu-item key="/console/manage/tags">标签体系</a-menu-item>
              <a-menu-item key="/console/manage/media">媒体资产</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="governanceRoot">
              <template #icon><SettingOutlined /></template>
              <template #title>运营治理</template>
              <a-menu-item key="/console/manage/comments">评论审核</a-menu-item>
              <a-menu-item key="/console/manage/users">用户管理</a-menu-item>
              <a-menu-item key="/console/manage/notifications">公告管理</a-menu-item>
              <a-menu-item key="/console/manage/settings">系统设置</a-menu-item>
            </a-sub-menu>
          </template>
        </a-menu>

        <div class="enterprise-sider-footer">
          <button class="enterprise-sider-collapse" type="button" @click="siderCollapsed = !siderCollapsed">
            <MenuFoldOutlined v-if="!siderCollapsed" />
            <MenuUnfoldOutlined v-else />
            <span v-if="!siderCollapsed">收起菜单</span>
          </button>
        </div>
      </a-layout-sider>

      <a-layout class="enterprise-main-layout">
        <a-layout-content class="enterprise-content">
          <div class="enterprise-content-inner">
            <router-view />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BookOutlined,
  ControlOutlined,
  DashboardOutlined,
  DownOutlined,
  FileTextOutlined,
  FolderOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { Menu } from 'ant-design-vue'
import { Moon, Sun } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { listPublicArticles, listPublicCategories } from '@/services/public'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const categories = ref([])
const articles = ref([])
const siderCollapsed = ref(false)
const openKeys = ref([])

const menuTheme = computed(() => appStore.isDark ? 'dark' : 'light')
const AMenuItem = Menu.Item
const ASubMenu = Menu.SubMenu
const primarySection = computed(() => {
  if (route.path.includes('/console/manage') || route.path === '/console') {
    return authStore.isAdmin ? 'management' : 'knowledge'
  }

  return 'knowledge'
})
const selectedKeys = computed(() => {
  if (route.path.includes('/console/manage/articles')) return ['/console/manage/articles']
  if (route.path.includes('/console/articles/')) return [route.path]
  if (route.path.includes('/console/categories/')) return [route.path]
  return [route.path]
})
const userInitial = computed(() => {
  return (authStore.user?.username || authStore.user?.email || 'U').slice(0, 1).toUpperCase()
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

function handleProfileAction({ key }) {
  if (key === 'profile') {
    router.push('/console/profile')
    return
  }

  authStore.logout()
  router.push('/')
}

function resolveOpenKeys(path) {
  if (primarySection.value === 'management') {
    if (path === '/console') {
      return []
    }

    if (path.includes('/manage/articles') || path.includes('/manage/categories') || path.includes('/manage/tags') || path.includes('/manage/media')) {
      return ['contentRoot']
    }

    if (path.includes('/manage/comments') || path.includes('/manage/users') || path.includes('/manage/notifications') || path.includes('/manage/settings')) {
      return ['governanceRoot']
    }

    return []
  }

  if (path.includes('/console/categories/')) {
    const slug = path.split('/').at(-1)
    return resolveCategoryOpenKeys(slug)
  }

  if (path.includes('/console/articles/')) {
    const article = articles.value.find((item) => `/console/articles/${item.slug}` === path)
    return article?.category?.slug
      ? resolveCategoryOpenKeys(article.category.slug)
      : []
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

async function loadKnowledgeMenu() {
  try {
    const [categoryList, articleResult] = await Promise.all([
      listPublicCategories(),
      listPublicArticles({ pageSize: 500 })
    ])
    categories.value = categoryList
    articles.value = articleResult.items || []
    openKeys.value = resolveOpenKeys(route.path)
  } catch {
    categories.value = []
    articles.value = []
  }
}

watch(() => route.path, (path) => {
  if (!siderCollapsed.value) {
    openKeys.value = resolveOpenKeys(path)
  }
})

watch(() => authStore.isAdmin, () => {
  if (!authStore.isAdmin && route.path.includes('/console/manage')) {
    router.push('/console/articles')
  }
})

onMounted(loadKnowledgeMenu)
</script>
