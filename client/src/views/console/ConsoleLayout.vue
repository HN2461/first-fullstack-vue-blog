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
            <strong>{{ primarySection === 'management' ? '后台管理' : '知识库' }}</strong>
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
            <a-sub-menu key="knowledgeRoot">
              <template #icon><BookOutlined /></template>
              <template #title>知识库</template>
              <a-menu-item key="/console/articles">
                <template #icon><UnorderedListOutlined /></template>
                全部文章
              </a-menu-item>
              <a-menu-item key="/console/search">
                <template #icon><SearchOutlined /></template>
                全文检索
              </a-menu-item>
              <a-menu-item key="/console/profile">
                <template #icon><UserOutlined /></template>
                个人中心
              </a-menu-item>
              <a-sub-menu key="categoryRoot">
                <template #icon><FolderOutlined /></template>
                <template #title>文章分类</template>
                <a-sub-menu
                  v-for="category in categoryTree"
                  :key="`category:${category.slug}`"
                >
                  <template #icon><FolderOutlined /></template>
                  <template #title>{{ category.name }}</template>
                  <a-menu-item :key="`/console/categories/${category.slug}`">
                    分类首页
                  </a-menu-item>
                  <a-menu-item
                    v-for="article in category.articles"
                    :key="`/console/articles/${article.slug}`"
                  >
                    {{ article.title }}
                  </a-menu-item>
                </a-sub-menu>
                <a-menu-item v-if="categoryTree.length === 0" key="/console/articles" disabled>
                  暂无分类
                </a-menu-item>
              </a-sub-menu>
            </a-sub-menu>
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
import { computed, onMounted, ref, watch } from 'vue'
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
  UnorderedListOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
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
const openKeys = ref(['knowledgeRoot', 'categoryRoot'])

const menuTheme = computed(() => appStore.isDark ? 'dark' : 'light')
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
const categoryTree = computed(() => {
  return categories.value.map((category) => ({
    ...category,
    articles: articles.value.filter((article) => article.category?.slug === category.slug)
  }))
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
    return ['knowledgeRoot', 'categoryRoot', `category:${slug}`]
  }

  if (path.includes('/console/articles/')) {
    const article = articles.value.find((item) => `/console/articles/${item.slug}` === path)
    return article?.category?.slug
      ? ['knowledgeRoot', 'categoryRoot', `category:${article.category.slug}`]
      : ['knowledgeRoot', 'categoryRoot']
  }

  return ['knowledgeRoot']
}

async function loadKnowledgeMenu() {
  try {
    const [categoryList, articleResult] = await Promise.all([
      listPublicCategories(),
      listPublicArticles({ pageSize: 30 })
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
