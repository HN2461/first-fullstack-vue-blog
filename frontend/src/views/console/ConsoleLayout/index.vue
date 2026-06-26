<template>
  <a-layout class="enterprise-admin-shell">
    <a-layout-header class="enterprise-topnav">
      <a-tooltip v-if="appStore.isMobile" title="打开菜单">
        <button class="enterprise-mobile-menu-button" type="button" aria-label="打开控制台菜单" @click="mobileMenuOpen = true">
          <MenuOutlined />
        </button>
      </a-tooltip>

      <button class="enterprise-topnav-brand" type="button" @click="router.push('/console/articles')">
        <img class="enterprise-brand-icon" src="/favicon.svg" alt="" aria-hidden="true">
        <div>
          <strong>Knowledge OS</strong>
          <small>{{ siteStore.siteTitle }}</small>
        </div>
      </button>

      <a-menu
        class="enterprise-primary-menu"
        mode="horizontal"
        :theme="menuTheme"
        :selected-keys="[primarySection]"
        @click="handlePrimaryClick"
      >
        <a-menu-item v-for="menu in availableRootMenus" :key="menu.id">
          <template #icon>
            <component :is="iconMap[menu.icon] || MenuOutlined" />
          </template>
          {{ menu.name }}
        </a-menu-item>
      </a-menu>

      <div class="enterprise-topnav-actions">
        <a-dropdown v-if="appStore.isMobile" trigger="click">
          <a-button class="enterprise-icon-action enterprise-root-switch" @click.prevent>
            <template #icon><SwapOutlined /></template>
          </a-button>
          <template #overlay>
            <a-menu class="enterprise-root-switch-menu" :selected-keys="[primarySection]" @click="handlePrimaryClick">
              <a-menu-item v-for="menu in availableRootMenus" :key="menu.id">
                <template #icon>
                  <component :is="iconMap[menu.icon] || MenuOutlined" />
                </template>
                {{ menu.name }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
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
        <span id="festival-countdown-action" class="enterprise-topnav-action-slot"></span>
        <a-tooltip v-if="createActions.length" title="新建内容">
          <a-button class="enterprise-icon-action" @click="createModalVisible = true">
            <template #icon><SquarePen :size="16" /></template>
          </a-button>
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
              <small>{{ userRoleLabel }}</small>
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
                <a-menu-item key="refresh-menu">
                  <template #icon><SyncOutlined /></template>
                  刷新菜单
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
          <ConsoleMenuContent />
        </a-menu>

      </a-layout-sider>

      <a-drawer
        v-model:open="mobileMenuOpen"
        class="enterprise-mobile-drawer"
        placement="left"
        width="300"
        :title="sectionTitle"
      >
        <div class="enterprise-mobile-root-tabs" role="tablist" aria-label="一级菜单切换">
          <button
            v-for="menu in availableRootMenus"
            :key="`mobile-root-${menu.id}`"
            type="button"
            :class="{ active: primarySection === menu.id }"
            @click="switchRootMenu(menu.id)"
          >
            <component :is="iconMap[menu.icon] || MenuOutlined" />
            <span>{{ menu.name }}</span>
          </button>
        </div>

        <a-menu
          :open-keys="openKeys"
          :class="['enterprise-menu', `enterprise-menu--${primarySection}`]"
          mode="inline"
          :theme="menuTheme"
          :selected-keys="selectedKeys"
          @openChange="handleMenuOpenChange"
          @click="handleMobileSecondaryClick"
        >
          <ConsoleMenuContent />
        </a-menu>
      </a-drawer>

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
  <FestivalEffectHost />

  <a-modal
    v-model:open="createModalVisible"
    title="新建内容"
    centered
    :footer="null"
    width="420px"
    wrap-class-name="enterprise-create-modal"
  >
    <div class="enterprise-create-panel">
      <button
        v-for="item in createActions"
        :key="item.key"
        class="enterprise-create-option"
        type="button"
        @click="handleCreateAction(item.key)"
      >
        <span class="enterprise-create-option__icon">
          <component :is="item.icon" />
        </span>
        <span>
          <strong>{{ item.label }}</strong>
          <small>{{ item.description }}</small>
        </span>
      </button>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, defineComponent, h, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
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
  BarChartOutlined,
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
  ImportOutlined,
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
  SyncOutlined,
  TableOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  UserOutlined,
  WalletOutlined
} from '@ant-design/icons-vue'
import NotificationBell from '@/components/NotificationBell.vue'
import AnnouncementPopup from '@/components/AnnouncementPopup.vue'
import FestivalEffectHost from '@/components/festival/FestivalEffectHost.vue'
import { Menu, message } from 'ant-design-vue'
import { Moon, SquarePen, Sun } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useSiteStore } from '@/stores/site'
import { getKnowledgeMenu, listPublicArticles } from '@/services/public'
import { isKnowledgeConsolePath } from '@/utils/consoleRoutes'
import { openMenuRoute } from '@/utils/menuNavigation'
import { isRoutePathMatched } from '@/utils/routeMatch'

const KNOWLEDGE_MENU_CACHE_TTL = 60 * 1000
const ARTICLE_DIRECTORY_PATH = '/console/article-directory'
const knowledgeMenuCache = {
  categories: [],
  articles: [],
  loadedAt: 0
}

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const siteStore = useSiteStore()
const categories = ref([])
const articles = ref([])
const siderCollapsed = ref(false)
const siderFullLabels = ref(false)
const mobileMenuOpen = ref(false)
const createModalVisible = ref(false)
const openKeys = ref([])
const clickedMenuKey = ref('')
const preferredRootId = ref('')
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
  BarChartOutlined,
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
  ImportOutlined,
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
  UserOutlined,
  WalletOutlined
}
const isWriterRoute = computed(() => route.path === '/console/write' || route.path.startsWith('/console/manage/articles/'))
const isArticleDetailRoute = computed(() => isArticleContentPath(route.path))
const isImmersiveRoute = computed(() => isWriterRoute.value || isArticleDetailRoute.value)
const availableRootMenus = computed(() => {
  return (authStore.rootMenus || []).filter((menu) => menu.enabled !== false && !menu.hidden)
})
const unavailableMenu = computed(() => {
  if (route.name !== 'ConsoleUnavailable') return null
  const queryMenuKey = String(route.query.menu || clickedMenuKey.value || '')
  return findMenuByIdentity(availableRootMenus.value, queryMenuKey)
})
const primarySection = computed(() => {
  if (unavailableMenu.value) {
    return findRootMenuIdByChild(availableRootMenus.value, unavailableMenu.value.id) || unavailableMenu.value.id
  }

  const preferredRoot = availableRootMenus.value.find((root) => root.id === preferredRootId.value)
  if (preferredRoot && canRootHandlePath(preferredRoot, route.path)) {
    return preferredRoot.id
  }

  const routeRoot = availableRootMenus.value.find((root) => {
    return isRootRouteMatched(root, route.path)
  })

  if (routeRoot) return routeRoot.id

  if (isKnowledgeConsolePath(route.path)) {
    return findKnowledgeDirectoryRootMenuId() || findKnowledgeRootMenuId() || availableRootMenus.value[0]?.id || ''
  }

  return routeRoot?.id || availableRootMenus.value[0]?.id || ''
})
const currentRootMenu = computed(() => {
  return availableRootMenus.value.find((menu) => menu.id === primarySection.value) || availableRootMenus.value[0]
})
const currentRootChildren = computed(() => {
  if (isKnowledgeDirectoryMenu(currentRootMenu.value)) {
    return [currentRootMenu.value]
  }

  return (currentRootMenu.value?.children || []).filter((menu) => menu.enabled !== false && !menu.hidden)
})
const currentRootHasKnowledgeDirectory = computed(() => {
  return hasKnowledgeDirectoryMount(currentRootMenu.value)
})
const hasAnyKnowledgeDirectory = computed(() => {
  return availableRootMenus.value.some(hasKnowledgeDirectoryMount)
})
const selectedKeys = computed(() => {
  if (unavailableMenu.value) {
    return [resolveActiveMenuKey(unavailableMenu.value)]
  }

  if (shouldPreferKnowledgeDirectoryState(route.path)) {
    return [route.path]
  }

  const matched = findManagementRouteState(currentRootChildren.value, route.path)
  if (matched?.selectedKey) return [matched.selectedKey]
  if (isArticleContentPath(route.path)) return [route.path]
  if (isArticleCategoryPath(route.path)) return [route.path]
  if (isArticleTagPath(route.path)) return [route.path]
  return [route.path]
})
const userInitial = computed(() => {
  return (authStore.user?.username || authStore.user?.email || 'U').slice(0, 1).toUpperCase()
})
const userRoleLabel = computed(() => {
  if (authStore.user?.isSuperAdmin || authStore.user?.role === 'super_admin') return '超级管理员'
  return authStore.isAdmin ? '管理员' : '普通用户'
})
const sectionTitle = computed(() => currentRootMenu.value?.name || '控制台')
const uncategorizedArticles = computed(() => {
  return articles.value
    .filter((article) => !article.category?.id || article.category?.isSystem || article.category?.slug === 'uncategorized')
    .sort((left, right) => new Date(right.publishedAt || right.createdAt) - new Date(left.publishedAt || left.createdAt))
})
const hasKnowledgeMenuData = computed(() => categoryTree.value.length > 0 || uncategorizedArticles.value.length > 0)
const effectiveOpenKeys = computed(() => (siderCollapsed.value ? [] : openKeys.value))
const createActions = computed(() => {
  const actions = []
  if (authStore.canAccessPath('/console/manage/articles/new')) {
    actions.push({
      key: 'article',
      label: '新建文章',
      description: '进入文章编辑器创建知识库内容',
      routePath: '/console/manage/articles/new',
      icon: FileTextOutlined
    })
  }
  if (authStore.canAccessPath('/console/manage/media')) {
    actions.push({
      key: 'media',
      label: '上传媒体资产',
      description: '进入媒体库上传图片、文档或附件',
      routePath: '/console/manage/media',
      icon: PictureOutlined
    })
  }
  if (authStore.canAccessPath('/console/memos')) {
    actions.push({
      key: 'memo',
      label: '新建备忘录',
      description: '记录临时想法、待办事项和工作线索',
      routePath: '/console/memos?create=1',
      icon: FormOutlined
    })
  }
  return actions
})
const ConsoleDynamicMenu = defineComponent({
  name: 'ConsoleDynamicMenu',
  props: {
    menu: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    return () => renderDynamicMenuNodes(props.menu)
  }
})

function renderDynamicMenuNodes(menu) {
  const iconComponent = iconMap[menu.icon] || MenuOutlined
  const children = (menu.children || []).filter((item) => item.enabled !== false && !item.hidden)
  const nodeKey = getManagementMenuKey(menu)

  if (isKnowledgeDirectoryMenu(menu)) {
    if (shouldRenderKnowledgeDirectoryInline(menu)) {
      return renderKnowledgeDirectoryContentNodes()
    }

    return [h(ConsoleArticleDirectoryMenu, {
      key: nodeKey,
      menu,
      nodeKey,
      inline: false
    })]
  }

  if (children.length > 0) {
    return [h(
      ASubMenu,
      { key: nodeKey },
      {
        icon: () => h(iconComponent),
        title: () => menu.name,
        default: () => children.flatMap((child) => renderDynamicMenuNodes(child))
      }
    )]
  }

  return [h(
    AMenuItem,
    { key: nodeKey },
    {
      icon: () => h(iconComponent),
      default: () => menu.name
    }
  )]
}

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
            key: `${ARTICLE_DIRECTORY_PATH}/articles/${article.slug}`
          }, () => article.title))
        ]
      }
    )
  }
})
const ConsoleArticleDirectoryMenu = defineComponent({
  name: 'ConsoleArticleDirectoryMenu',
  props: {
    menu: {
      type: Object,
      required: true
    },
    nodeKey: {
      type: String,
      required: true
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    return () => {
      const nodes = renderKnowledgeDirectoryContentNodes()

      if (props.inline) {
        return nodes
      }

      return h(
        ASubMenu,
        { key: props.nodeKey },
        {
          icon: () => h(iconMap[props.menu.icon] || FolderOutlined),
          title: () => props.menu.name,
          default: () => nodes
        }
      )
    }
  }
})

function renderKnowledgeDirectoryContentNodes() {
  const nodes = []

  if (knowledgeMenuLoading.value && !hasKnowledgeMenuData.value) {
    nodes.push(h(AMenuItem, { key: 'loading:knowledge', disabled: true }, () => '目录加载中'))
  } else if (knowledgeMenuError.value && !hasKnowledgeMenuData.value) {
    nodes.push(h(AMenuItem, { key: 'error:knowledge', disabled: true }, () => knowledgeMenuError.value))
  } else {
    nodes.push(...categoryTree.value.map((category) => h(ConsoleCategoryMenu, {
      key: `category-node:${category.slug}`,
      category
    })))

    if (uncategorizedArticles.value.length) {
      nodes.push(h(
        ASubMenu,
        { key: 'category:__uncategorized' },
        {
          icon: () => h(InboxOutlined),
          title: () => '未分类',
          default: () => uncategorizedArticles.value.map((article) => h(AMenuItem, {
            key: `${ARTICLE_DIRECTORY_PATH}/articles/${article.slug}`
          }, () => article.title))
        }
      ))
    }

    if (!hasKnowledgeMenuData.value && knowledgeMenuLoaded.value) {
      nodes.push(h(AMenuItem, { key: 'empty:knowledge', disabled: true }, () => '暂无文章目录'))
    }
  }

  return nodes
}

const ConsoleMenuContent = defineComponent({
  name: 'ConsoleMenuContent',
  setup() {
    return () => {
      const nodes = currentRootChildren.value
      if (!nodes.length) {
        return h(AMenuItem, { key: `empty:${primarySection.value}`, disabled: true }, () => '暂无菜单')
      }

      return nodes.flatMap((menu) => renderDynamicMenuNodes(menu))
    }
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
  switchRootMenu(key)
}

function handleSecondaryClick({ key }) {
  if (!key || String(key).startsWith('empty:') || String(key).startsWith('loading:') || String(key).startsWith('error:')) return

  if (String(key).includes(':') || key === route.path) return

  const menu = findMenuByIdentity(currentRootChildren.value, key)
  if (menu) {
    clickedMenuKey.value = getManagementMenuKey(menu)
    const targetPath = menu.routePath || ''
    if (targetPath && isImplementedConsoleRoutePath(targetPath)) {
      openMenuRoute(router, menu, targetPath)
      return
    }
    const childTarget = findFirstMenuRoute(menu.children || [])
    if (childTarget) {
      const targetMenu = flattenRenderableMenus(menu.children || []).find((item) => item.routePath === childTarget)
      openMenuRoute(router, targetMenu, childTarget)
      return
    }
    router.push({ name: 'ConsoleUnavailable', query: { menu: menu.code || menu.id || clickedMenuKey.value } })
    return
  }

  router.push(key)
}

function handleMobileSecondaryClick(payload) {
  handleSecondaryClick(payload)
  if (!String(payload.key || '').includes(':')) {
    mobileMenuOpen.value = false
  }
}

async function handleProfileAction({ key }) {
  if (key === 'profile') {
    router.push('/console/profile')
    return
  }

  await authStore.logout()
  router.push('/')
}

function handleCreateAction(key) {
  const action = createActions.value.find((item) => item.key === key)
  if (action) {
    createModalVisible.value = false
    router.push(action.routePath)
  }
}

function handleSiderAction({ key }) {
  if (key === 'toggle-labels') {
    siderFullLabels.value = !siderFullLabels.value
    return
  }

  if (key === 'refresh-menu') {
    refreshMenus()
  }
}

async function refreshMenus() {
  try {
    await authStore.refreshCurrentUser()
    await nextTick()
    if (hasAnyKnowledgeDirectory.value) {
      await loadKnowledgeMenu({ force: true })
    }
    openKeys.value = resolveOpenKeys(route.path)
    message.success('菜单已刷新')
  } catch (error) {
    message.error(error.message || '菜单刷新失败')
  }
}

function switchRootMenu(rootId) {
  const root = availableRootMenus.value.find((menu) => menu.id === rootId)
  if (!root) return

  preferredRootId.value = root.id

  if (isKnowledgeDirectoryMenu(root)) {
    openKnowledgeDirectoryEntry()
    return
  }

  const target = findFirstMenuRoute(root.children || [])
  if (target) {
    const targetMenu = flattenRenderableMenus(root.children || []).find((item) => item.routePath === target)
    openMenuRoute(router, targetMenu, target)
    return
  }

  if (isImplementedConsoleRoutePath(root.routePath)) {
    openMenuRoute(router, root, root.routePath)
    return
  }

  if (hasKnowledgeDirectoryMount(root)) {
    openKnowledgeDirectoryEntry()
    return
  }

  router.push({ name: 'ConsoleUnavailable', query: { menu: root.code || root.id || '' } })
}

function handleMenuOpenChange(nextKeys) {
  if (siderCollapsed.value) return
  openKeys.value = [...nextKeys]
}

function getManagementMenuKey(menu) {
  return menu?.id || menu?.code || menu?.routePath
}

function resolveActiveMenuKey(menu) {
  if (!menu) return ''
  if (menu.activeMenuCode) {
    const activeMenu = findMenuByIdentity(availableRootMenus.value, menu.activeMenuCode)
    if (activeMenu) {
      return getManagementMenuKey(activeMenu)
    }
  }
  return getManagementMenuKey(menu)
}

function compareMenuOrder(left, right) {
  return (left.sortOrder || 0) - (right.sortOrder || 0) || String(left.name || '').localeCompare(String(right.name || ''), 'zh-Hans-CN')
}

function isRouteMatched(path, routePath) {
  return !!routePath && isRoutePathMatched(path, routePath)
}

function isKnowledgeRootMenu(menu) {
  return menu?.code === 'knowledge.root'
}

function isKnowledgeDirectoryMenu(menu) {
  return menu?.code === 'knowledge.directory'
}

function hasKnowledgeDirectoryMount(menu) {
  if (!menu || menu.enabled === false || menu.hidden) return false
  return isKnowledgeDirectoryMenu(menu) || flattenRenderableMenus(menu.children || []).some(isKnowledgeDirectoryMenu)
}

function isRootRouteMatched(root, path) {
  const rootRouteMatched = root.routePath && path === root.routePath
  const childRouteMatched = flattenRenderableMenus(root.children || [])
    .some((item) => isRouteMatched(path, item.routePath))
  return rootRouteMatched || childRouteMatched
}

function canRootHandlePath(root, path) {
  if (isRootRouteMatched(root, path)) return true
  return isKnowledgeConsolePath(path) && (isKnowledgeRootMenu(root) || hasKnowledgeDirectoryMount(root))
}

function isKnowledgeDirectoryContentPath(path) {
  return path === ARTICLE_DIRECTORY_PATH ||
    path.startsWith(`${ARTICLE_DIRECTORY_PATH}/articles/`) ||
    path.startsWith(`${ARTICLE_DIRECTORY_PATH}/categories/`) ||
    path.startsWith(`${ARTICLE_DIRECTORY_PATH}/tags/`)
}

function shouldPreferKnowledgeDirectoryState(path) {
  return currentRootHasKnowledgeDirectory.value && isKnowledgeDirectoryContentPath(path)
}

function openKnowledgeDirectoryEntry() {
  if (route.path === ARTICLE_DIRECTORY_PATH) {
    openKeys.value = resolveOpenKeys(route.path)
    return
  }

  router.push(ARTICLE_DIRECTORY_PATH)
}

function findKnowledgeRootMenu() {
  return findMenuByIdentity(availableRootMenus.value, 'knowledge.root')
}

function findKnowledgeRootMenuId() {
  const knowledgeMenu = findKnowledgeRootMenu()
  return knowledgeMenu ? findRootMenuIdByChild(availableRootMenus.value, knowledgeMenu.id) || knowledgeMenu.id : ''
}

function findKnowledgeDirectoryRootMenuId() {
  const directory = findMenuByIdentity(availableRootMenus.value, 'knowledge.directory')
  return directory ? findRootMenuIdByChild(availableRootMenus.value, directory.id) || directory.id : ''
}

function flattenRenderableMenus(items = []) {
  const result = []
  for (const item of items) {
    if (item.enabled === false || item.hidden) continue
    result.push(item)
    result.push(...flattenRenderableMenus(item.children || []))
  }
  return result
}

function findFirstMenuRoute(items = []) {
  for (const item of items) {
    if (item.enabled === false || item.hidden) continue
    if (isImplementedConsoleRoutePath(item.routePath)) return item.routePath
    const nested = findFirstMenuRoute(item.children || [])
    if (nested) return nested
  }
  return ''
}

function isImplementedConsoleRoutePath(routePath = '') {
  if (!routePath) return false
  const matched = router.resolve(routePath).matched
  return matched.some((record) => record.name && record.name !== 'NotFound' && record.name !== 'ConsoleUnavailable')
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
    const isMatchedLeaf = isLeaf && isRouteMatched(path, routePath)
    if (isMatchedLeaf) {
      const candidate = {
        selectedKey: resolveActiveMenuKey(item),
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
  if (unavailableMenu.value) {
    return resolveManagementMenuOpenKeys(currentRootChildren.value, getManagementMenuKey(unavailableMenu.value))
  }

  if (shouldPreferKnowledgeDirectoryState(path)) {
    const directoryOpenKeys = resolveKnowledgeDirectoryOpenKeys(path)
    if (directoryOpenKeys.length) {
      return directoryOpenKeys
    }
  }

  const matched = findManagementRouteState(currentRootChildren.value, path)
  if (matched) {
    return mergeOpenKeys(matched.openKeys, resolveAutoKnowledgeDirectoryOpenKeys())
  }

  const directoryOpenKeys = resolveKnowledgeDirectoryOpenKeys(path)
  if (directoryOpenKeys.length) {
    return directoryOpenKeys
  }

  return []
}

function findMenuByIdentity(items = [], identity = '') {
  if (!identity) return null
  const target = String(identity)

  for (const item of items) {
    const candidates = [item.id, item.code, item.routePath, getManagementMenuKey(item)]
      .filter(Boolean)
      .map(String)
    if (candidates.includes(target)) {
      return item
    }
    const child = findMenuByIdentity(item.children || [], target)
    if (child) return child
  }

  return null
}

function findRootMenuIdByChild(roots = [], childId = '') {
  for (const root of roots) {
    if (root.id === childId) return root.id
    if (findMenuByIdentity(root.children || [], childId)) return root.id
  }
  return ''
}

function resolveManagementMenuOpenKeys(items = [], targetKey = '', ancestors = []) {
  for (const item of items) {
    const itemKey = getManagementMenuKey(item)
    const children = (item.children || []).filter((child) => child.enabled !== false && !child.hidden)
    if (itemKey === targetKey) {
      return [...ancestors]
    }
    const matched = resolveManagementMenuOpenKeys(children, targetKey, [...ancestors, itemKey])
    if (matched.length) {
      return matched
    }
  }

  return []
}

function findKnowledgeDirectoryKey(items = []) {
  return resolveKnowledgeDirectoryMenuOpenChain(items).at(-1) || ''
}

function resolveKnowledgeDirectoryOpenKeys(path) {
  const directoryOpenChain = resolveKnowledgeDirectoryMenuOpenChain(currentRootChildren.value)
  const directoryKey = directoryOpenChain.at(-1)
  if (!directoryKey) return []
  const renderedInline = shouldRenderKnowledgeDirectoryInline()
  const visibleDirectoryChain = renderedInline ? directoryOpenChain.slice(0, -1) : directoryOpenChain

  if (path === ARTICLE_DIRECTORY_PATH) {
    return visibleDirectoryChain
  }

  if (isArticleCategoryPath(path)) {
    const slug = path.split('/').at(-1)
    return mergeOpenKeys(visibleDirectoryChain, resolveCategoryOpenKeys(slug))
  }

  if (isArticleContentPath(path)) {
    const article = articles.value.find((item) => {
      return `/console/articles/${item.slug}` === path || `${ARTICLE_DIRECTORY_PATH}/articles/${item.slug}` === path
    })
    if (!article) return visibleDirectoryChain
    if (!article.category?.slug || article.category?.isSystem || article.category?.slug === 'uncategorized') {
      return mergeOpenKeys(visibleDirectoryChain, ['category:__uncategorized'])
    }
    return mergeOpenKeys(visibleDirectoryChain, resolveCategoryOpenKeys(article.category.slug))
  }

  return []
}

function isArticleContentPath(path) {
  return path.startsWith('/console/articles/') || path.startsWith(`${ARTICLE_DIRECTORY_PATH}/articles/`)
}

function isArticleCategoryPath(path) {
  return path.startsWith('/console/categories/') || path.startsWith(`${ARTICLE_DIRECTORY_PATH}/categories/`)
}

function isArticleTagPath(path) {
  return path.startsWith('/console/tags/') || path.startsWith(`${ARTICLE_DIRECTORY_PATH}/tags/`)
}

function findKnowledgeDirectoryMenu(items = []) {
  return flattenRenderableMenus(items).find(isKnowledgeDirectoryMenu) || null
}

function resolveKnowledgeDirectoryMenuOpenChain(items = [], ancestors = []) {
  for (const item of items) {
    if (item.enabled === false || item.hidden) continue
    const itemKey = getManagementMenuKey(item)
    if (isKnowledgeDirectoryMenu(item)) {
      return [...ancestors, itemKey]
    }
    const children = (item.children || []).filter((child) => child.enabled !== false && !child.hidden)
    const matched = resolveKnowledgeDirectoryMenuOpenChain(children, [...ancestors, itemKey])
    if (matched.length) return matched
  }
  return []
}

function shouldRenderKnowledgeDirectoryInline(menu = null) {
  if (isKnowledgeDirectoryMenu(currentRootMenu.value)) return true
  const directory = menu && isKnowledgeDirectoryMenu(menu) ? menu : findKnowledgeDirectoryMenu(currentRootChildren.value)
  return directory?.directoryAutoExpandWhenNested !== false
}

function resolveAutoKnowledgeDirectoryOpenKeys() {
  if (!currentRootHasKnowledgeDirectory.value || !shouldRenderKnowledgeDirectoryInline()) return []
  return resolveKnowledgeDirectoryMenuOpenChain(currentRootChildren.value).slice(0, -1)
}

function mergeOpenKeys(...groups) {
  return [...new Set(groups.flat().filter(Boolean))]
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

watch(() => [route.path, route.query.menu], ([path]) => {
  if (route.name !== 'ConsoleUnavailable') {
    clickedMenuKey.value = ''
  }

  const preferredRoot = availableRootMenus.value.find((root) => root.id === preferredRootId.value)
  if (preferredRoot && !canRootHandlePath(preferredRoot, path)) {
    preferredRootId.value = ''
  }
  openKeys.value = resolveOpenKeys(path)
})

watch(currentRootHasKnowledgeDirectory, async (hasDirectory) => {
  if (!hasDirectory || knowledgeMenuLoaded.value) {
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
  siteStore.loadProfile()
  if (appStore.isMobile) {
    siderCollapsed.value = true
  }
  if (currentRootHasKnowledgeDirectory.value && !knowledgeMenuLoaded.value) {
    loadKnowledgeMenu()
  }
})

watch(() => appStore.isMobile, (isMobile) => {
  if (isMobile) {
    siderCollapsed.value = true
    mobileMenuOpen.value = false
  }
}, { immediate: true })
</script>
