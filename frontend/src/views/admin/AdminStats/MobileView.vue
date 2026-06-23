<template>
  <div class="workbench">
    <a-alert
      v-if="loadError"
      class="workbench-alert"
      type="warning"
      show-icon
      :message="loadError"
    >
      <template #action>
        <a-button size="small" type="link" @click="loadData">重试</a-button>
      </template>
    </a-alert>

    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1>{{ greeting }}，{{ authStore.user?.username || '管理员' }}</h1>
          <p>{{ todayFormatted }}</p>
        </div>
        <div class="welcome-actions">
          <a-button v-if="canCreateArticle" type="primary" :loading="loading" @click="$router.push('/console/manage/articles/new')">
            <template #icon><PlusOutlined /></template>
            新建文章
          </a-button>
          <a-button @click="$router.push('/console/articles')">
            <template #icon><BookOutlined /></template>
            知识库
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <template v-if="loading && !hasLoaded">
        <a-skeleton
          v-for="item in 6"
          :key="`stat-skeleton-${item}`"
          class="stat-card stat-card-skeleton"
          active
          :paragraph="{ rows: 1, width: '72%' }"
        />
      </template>
      <template v-else>
        <div class="stat-card" v-for="item in statCards" :key="item.label">
          <div class="stat-icon" :style="{ background: item.iconBg }">
            <component :is="item.icon" :style="{ color: item.iconColor }" />
          </div>
          <div class="stat-body">
            <span class="stat-label">{{ item.label }}</span>
            <span class="stat-value">{{ item.value }}</span>
          </div>
          <div class="stat-trend" v-if="item.trend !== null">
            <span :class="['trend-num', item.trend >= 0 ? 'up' : 'down']">
              {{ item.trend >= 0 ? '+' : '' }}{{ item.trend }}%
            </span>
          </div>
        </div>
      </template>
    </div>

    <div class="root-menu-section">
      <div class="section-header">
        <h3>一级菜单</h3>
        <span>{{ rootMenuCards.length }} 个入口</span>
      </div>
      <div class="root-menu-grid">
        <button
          v-for="item in rootMenuCards"
          :key="item.id"
          class="root-menu-card"
          type="button"
          @click="openRootMenu(item)"
        >
          <span class="root-menu-icon" :style="{ background: item.bg, color: item.color }">
            <component :is="item.icon" />
          </span>
          <strong>{{ item.name }}</strong>
          <small>{{ item.childrenCount }} 个菜单</small>
        </button>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="main-content">
      <!-- 左侧 -->
      <div class="content-left">
        <!-- 待办事项 -->
        <div class="content-card">
          <div class="card-header">
            <h3>待办事项</h3>
            <a-tag color="red" v-if="totalPending > 0">{{ totalPending }}</a-tag>
          </div>
          <a-skeleton v-if="loading && !hasLoaded" active :paragraph="{ rows: 3 }" />
          <div v-else class="todo-list">
            <button class="todo-item" v-for="item in todoItems" :key="item.label" type="button" @click="$router.push(item.route)">
              <div class="todo-icon" :style="{ background: item.color }">
                <component :is="item.icon" />
              </div>
              <div class="todo-info">
                <span class="todo-label">{{ item.label }}</span>
                <span class="todo-desc">{{ item.desc }}</span>
              </div>
              <span class="todo-count">{{ item.count }}</span>
            </button>
          </div>
        </div>

        <!-- 最近发布 -->
        <div class="content-card">
          <div class="card-header">
            <h3>最近发布</h3>
            <a-button v-if="canManageArticles" type="link" size="small" @click="$router.push('/console/manage/articles')">全部</a-button>
          </div>
          <a-skeleton v-if="loading && !hasLoaded" active :paragraph="{ rows: 5 }" />
          <div v-else class="recent-list">
            <div class="recent-item" v-for="item in recentArticles" :key="item.id">
              <div class="recent-info">
                <span class="recent-title">{{ item.title }}</span>
                <span class="recent-meta">
                  <a-tag size="small" :color="item.status === 'published' ? 'green' : 'gold'">
                    {{ item.status === 'published' ? '已发布' : '草稿' }}
                  </a-tag>
                  <span>{{ formatDate(item.updatedAt) }}</span>
                </span>
              </div>
            </div>
            <a-empty v-if="recentArticles.length === 0" description="暂无文章" :image-style="{ height: '40px' }" />
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="content-right">
        <!-- 快捷操作 -->
        <div class="content-card">
          <div class="card-header">
            <h3>快捷操作</h3>
            <a-button type="link" size="small" @click="openQuickConfig">全部</a-button>
          </div>
          <div
            class="quick-carousel"
            @pointerdown="handleQuickPointerDown"
            @pointermove="handleQuickPointerMove"
            @pointerup="handleQuickPointerUp"
            @pointercancel="handleQuickPointerCancel"
          >
            <div
              class="quick-track"
              :style="quickTrackStyle"
              @transitionend="handleQuickTransitionEnd"
            >
              <div
                v-for="(page, pageIndex) in carouselQuickActionPages"
                :key="`quick-page-${pageIndex}`"
                class="quick-page"
              >
                <button
                  class="quick-item"
                  v-for="item in page"
                  :key="item.route"
                  type="button"
                  @click.stop="handleQuickActionClick(item.route)"
                >
                  <div class="quick-icon" :style="{ background: item.bg, color: item.color }">
                    <component :is="item.icon" />
                  </div>
                  <span>{{ item.label }}</span>
                </button>
                <div
                  v-for="placeholder in 12 - page.length"
                  :key="`quick-placeholder-${pageIndex}-${placeholder}`"
                  class="quick-placeholder"
                  aria-hidden="true"
                ></div>
              </div>
            </div>
            <div v-if="selectedQuickActions.length === 0" class="quick-empty">
              <a-empty
                description="暂无快捷操作"
                :image-style="{ height: '40px' }"
              />
            </div>
          </div>
          <div v-if="selectedQuickActionPages.length > 1" class="quick-dots" aria-label="快捷操作分页">
            <button
              v-for="(_, index) in selectedQuickActionPages"
              :key="`quick-dot-${index}`"
              :class="{ active: index === quickPageIndex }"
              type="button"
              :aria-label="`第 ${index + 1} 页`"
              @click="goQuickPage(index)"
            ></button>
          </div>
        </div>

        <!-- 系统公告 -->
        <div class="content-card">
          <div class="card-header">
            <h3>系统公告</h3>
            <a-button v-if="canManageNotifications" type="link" size="small" @click="$router.push('/console/manage/notifications')">管理</a-button>
          </div>
          <a-skeleton v-if="loading && !hasLoaded" active :paragraph="{ rows: 3 }" />
          <div v-else class="notice-list">
            <div class="notice-item" v-for="item in announcements" :key="item.id">
              <a-tag :color="getLevelColor(item.level)" size="small">{{ getLevelText(item.level) }}</a-tag>
              <span class="notice-title">{{ item.title }}</span>
            </div>
            <a-empty v-if="announcements.length === 0" description="暂无公告" :image-style="{ height: '40px' }" />
          </div>
        </div>

        <!-- 系统信息 -->
        <div class="content-card">
          <div class="card-header">
            <h3>系统信息</h3>
          </div>
          <a-skeleton v-if="loading && !hasLoaded" active :paragraph="{ rows: 4 }" />
          <div v-else class="sys-info">
            <div class="info-row">
              <span class="info-key">站点</span>
              <span class="info-val">{{ settings.siteTitle || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-key">作者</span>
              <span class="info-val">{{ settings.authorName || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-key">文章</span>
              <span class="info-val">{{ stats.articleCount || 0 }} 篇</span>
            </div>
            <div class="info-row">
              <span class="info-key">用户</span>
              <span class="info-val">{{ stats.userCount || 0 }} 人</span>
            </div>
            <div class="info-row">
              <span class="info-key">版本</span>
              <span class="info-val">{{ settings.systemVersion || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <a-modal
      v-model:open="quickConfigOpen"
      class="quick-config-modal"
      title="快捷操作配置"
      width="760px"
      :body-style="{ maxHeight: '62vh', overflow: 'hidden' }"
      :footer="null"
    >
      <div class="quick-config">
        <section class="quick-config__pane">
          <header>
            <strong>首页展示</strong>
            <span>{{ quickSaving ? '同步中' : `${draftQuickRoutes.length} 项` }}</span>
          </header>
          <div
            class="quick-config__list quick-config__list--selected"
            @dragover.prevent
            @drop="handleDropToSelected"
          >
            <button
              v-for="(item, index) in draftQuickActions"
              :key="item.route"
              class="quick-config__item"
              type="button"
              draggable="true"
              @dragstart="handleDraftDragStart(index)"
              @dragover.prevent
              @drop="handleDraftDrop(index)"
            >
              <component :is="item.icon" />
              <span>{{ item.label }}</span>
            </button>
            <a-empty
              v-if="draftQuickActions.length === 0"
              description="请选择右侧菜单"
              :image-style="{ height: '40px' }"
            />
          </div>
        </section>

        <section class="quick-config__pane">
          <header>
            <strong>可用菜单</strong>
            <span>{{ unselectedQuickActions.length }} 项</span>
          </header>
          <div
            class="quick-config__list quick-config__list--available"
            @dragover.prevent
            @drop="handleDropToAvailable"
          >
            <div class="quick-config__checks">
              <div
                v-for="item in unselectedQuickActions"
                :key="item.route"
                class="quick-config__check"
                draggable="true"
                @dragstart="handleAvailableDragStart(item.route)"
              >
                <component :is="item.icon" />
                <span>{{ item.label }}</span>
              </div>
              <a-empty
                v-if="unselectedQuickActions.length === 0"
                description="所有可用菜单均已添加"
                :image-style="{ height: '40px' }"
              />
            </div>
          </div>
        </section>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { openMenuRoute } from '@/utils/menuNavigation'
import {
  PlusOutlined, BookOutlined,
  FileTextOutlined, FileDoneOutlined, EditOutlined,
  TeamOutlined, CommentOutlined, PictureOutlined,
  TagOutlined, FolderOutlined, BellOutlined, ToolOutlined, ApiOutlined,
  DashboardOutlined, SafetyOutlined, MenuOutlined, DeleteOutlined, SwapOutlined,
  MonitorOutlined, SettingOutlined, SearchOutlined, BulbOutlined, ControlOutlined,
  WalletOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { updateQuickActions } from '@/services/http'
import {
  getAdminStats,
  getAdminSettings,
  listRecentAdminAnnouncements,
  listRecentAdminArticles
} from '@/services/admin'

const authStore = useAuthStore()
const router = useRouter()
const stats = ref({})
const recentArticles = ref([])
const announcements = ref([])
const settings = ref({})
const loading = ref(false)
const hasLoaded = ref(false)
const loadError = ref('')
const quickConfigOpen = ref(false)
const quickSaving = ref(false)
const quickRoutes = ref([])
const draftQuickRoutes = ref([])
const draftDragIndex = ref(-1)
const quickDragPayload = ref(null)
const quickPageIndex = ref(0)
const quickSlideIndex = ref(0)
const quickPointerStartX = ref(0)
const quickPointerDeltaX = ref(0)
const quickPointerDragging = ref(false)
const quickPointerMoved = ref(false)
const quickTransitionEnabled = ref(true)
const suppressNextQuickClick = ref(false)
let quickAutoTimer = null
let quickResetFrame = 0
const QUICK_CLICK_MOVE_LIMIT = 6
const QUICK_PAGE_MOVE_LIMIT = 48

const quickIconMap = {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  SwapOutlined,
  TagOutlined,
  PictureOutlined,
  CommentOutlined,
  TeamOutlined,
  SafetyOutlined,
  MenuOutlined,
  BellOutlined,
  ToolOutlined,
  ApiOutlined,
  MonitorOutlined,
  SettingOutlined,
  SearchOutlined,
  BulbOutlined,
  BookOutlined,
  ControlOutlined,
  WalletOutlined,
  DeleteOutlined,
  UserOutlined: TeamOutlined
}

const quickPalette = [
  ['#e6f7ff', '#1890ff'],
  ['#f6ffed', '#52c41a'],
  ['#fff7e6', '#faad14'],
  ['#fff1f0', '#f5222d'],
  ['#f9f0ff', '#722ed1'],
  ['#e6fffb', '#13c2c2'],
  ['#fff0f6', '#eb2f96'],
  ['#f5f5f5', '#666']
]

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 17) return '下午好'
  if (h < 22) return '晚上好'
  return '夜深了'
})

const todayFormatted = computed(() => {
  const d = new Date()
  const w = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${w[d.getDay()]}`
})

const statCards = computed(() => [
  { label: '文章', value: stats.value.articleCount || 0, icon: FileTextOutlined, iconBg: '#e6f7ff', iconColor: '#1890ff', trend: stats.value.articleTrend ?? null },
  { label: '已发布', value: stats.value.publishedCount || 0, icon: FileDoneOutlined, iconBg: '#f6ffed', iconColor: '#52c41a', trend: stats.value.publishedTrend ?? null },
  { label: '草稿', value: stats.value.draftCount || 0, icon: EditOutlined, iconBg: '#fff7e6', iconColor: '#faad14', trend: null },
  { label: '用户', value: stats.value.userCount || 0, icon: TeamOutlined, iconBg: '#f9f0ff', iconColor: '#722ed1', trend: stats.value.userTrend ?? null },
  { label: '待审评论', value: stats.value.pendingCommentCount || 0, icon: CommentOutlined, iconBg: '#fff1f0', iconColor: '#f5222d', trend: null },
  { label: '媒体', value: stats.value.mediaCount || 0, icon: PictureOutlined, iconBg: '#e6fffb', iconColor: '#13c2c2', trend: null }
])

const canCreateArticle = computed(() => authStore.canAccessPath('/console/manage/articles/new'))
const canManageArticles = computed(() => authStore.canAccessPath('/console/manage/articles'))
const canManageComments = computed(() => authStore.canAccessPath('/console/manage/comments'))
const canManageMedia = computed(() => authStore.canAccessPath('/console/manage/media'))
const canManageNotifications = computed(() => authStore.canAccessPath('/console/manage/notifications'))

const todoItems = computed(() => [
  { label: '草稿文章', desc: '待发布确认', count: stats.value.draftCount || 0, icon: EditOutlined, color: '#faad14', route: '/console/manage/articles', visible: canManageArticles.value },
  { label: '待审评论', desc: '待审核公开', count: stats.value.pendingCommentCount || 0, icon: CommentOutlined, color: '#f5222d', route: '/console/manage/comments', visible: canManageComments.value },
  { label: '媒体文件', desc: '已上传文件', count: stats.value.mediaCount || 0, icon: PictureOutlined, color: '#1890ff', route: '/console/manage/media', visible: canManageMedia.value }
].filter((item) => item.visible))
const totalPending = computed(() => todoItems.value.reduce((sum, item) => sum + Number(item.count || 0), 0))

const rootMenuCards = computed(() => {
  return (authStore.rootMenus || [])
    .filter((item) => item.enabled !== false && !item.hidden)
    .map((item, index) => {
      const [bg, color] = quickPalette[index % quickPalette.length]
      return {
        ...item,
        icon: quickIconMap[item.icon] || MenuOutlined,
        bg,
        color,
        childrenCount: (item.children || []).filter((child) => child.enabled !== false && !child.hidden).length
      }
    })
})

const availableQuickActions = computed(() => {
  const flat = flattenRootMenus(authStore.rootMenus || [])
    .filter((item) => item.routePath && item.routePath !== '/console')
  return flat.map((item, index) => {
    const [bg, color] = quickPalette[index % quickPalette.length]
    return {
      label: item.name,
      icon: quickIconMap[item.icon] || FileTextOutlined,
      bg,
      color,
      route: item.routePath,
      openMode: item.openMode || 'current'
    }
  })
})

const selectedQuickActions = computed(() => {
  const map = new Map(availableQuickActions.value.map((item) => [item.route, item]))
  return quickRoutes.value.map((route) => map.get(route)).filter(Boolean)
})

const selectedQuickActionPages = computed(() => chunkItems(selectedQuickActions.value, 12))

const carouselQuickActionPages = computed(() => {
  const pages = selectedQuickActionPages.value
  return pages.length > 1 ? [...pages, pages[0]] : pages
})

const quickTrackStyle = computed(() => {
  const pageOffset = quickSlideIndex.value * -100
  return {
    transform: `translateX(calc(${pageOffset}% + ${quickPointerDeltaX.value}px))`,
    transition: quickPointerDragging.value || !quickTransitionEnabled.value ? 'none' : 'transform 0.32s ease'
  }
})

const draftQuickActions = computed(() => {
  const map = new Map(availableQuickActions.value.map((item) => [item.route, item]))
  return draftQuickRoutes.value.map((route) => map.get(route)).filter(Boolean)
})

const unselectedQuickActions = computed(() => {
  const selectedRoutes = new Set(draftQuickRoutes.value)
  return availableQuickActions.value.filter((item) => !selectedRoutes.has(item.route))
})

function chunkItems(items, size) {
  const result = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

function flattenMenus(items = []) {
  const result = []
  for (const item of items) {
    const children = (item.children || []).filter((child) => child.enabled !== false && !child.hidden)
    if (children.length > 0) {
      result.push(...flattenMenus(children))
      continue
    }
    if (item.enabled !== false && !item.hidden && item.routePath) {
      result.push(item)
    }
  }
  return result
}

function flattenRootMenus(roots = []) {
  return roots.flatMap((root) => flattenMenus(root.children || []))
}

function openRootMenu(item) {
  const isKnowledgeRoot = item.code === 'knowledge.root'
  const target = isKnowledgeRoot
    ? item.routePath || '/console/articles'
    : flattenMenus(item.children || []).find((menu) => menu.routePath)?.routePath || item.routePath || '/console'
  const targetMenu = isKnowledgeRoot
    ? { routePath: target, openMode: 'current' }
    : flattenMenus(item.children || []).find((menu) => menu.routePath === target) || item
  openMenuRoute(router, targetMenu, target)
}

function loadQuickRoutes() {
  const availableRoutes = availableQuickActions.value.map((item) => item.route)

  const saved = authStore.user?.quickActions || []
  quickRoutes.value = Array.isArray(saved) && saved.length
    ? saved.filter((route) => availableRoutes.includes(route))
    : availableRoutes.slice(0, 8)
}

function handleQuickActionClick(route) {
  if (suppressNextQuickClick.value) {
    suppressNextQuickClick.value = false
    return
  }
  openMenuRoute(router, { routePath: route, openMode: selectedQuickActions.value.find((item) => item.route === route)?.openMode || 'current' }, route)
}

function resetQuickPointerState() {
  quickPointerDeltaX.value = 0
  quickPointerDragging.value = false
  quickPointerMoved.value = false
}

function handleQuickPointerDown(event) {
  if (selectedQuickActionPages.value.length <= 1) return
  if (event.target?.closest?.('.quick-item')) return

  stopQuickAutoPlay()
  quickPointerStartX.value = event.clientX
  quickPointerDeltaX.value = 0
  quickPointerDragging.value = true
  quickPointerMoved.value = false
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function handleQuickPointerMove(event) {
  if (!quickPointerDragging.value) return

  const delta = event.clientX - quickPointerStartX.value
  quickPointerDeltaX.value = delta
  if (Math.abs(delta) > QUICK_CLICK_MOVE_LIMIT) {
    quickPointerMoved.value = true
  }
}

function handleQuickPointerUp(event) {
  if (!quickPointerDragging.value) return

  const delta = quickPointerDeltaX.value
  const hasDragged = Math.abs(delta) > QUICK_CLICK_MOVE_LIMIT
  suppressNextQuickClick.value = hasDragged
  if (Math.abs(delta) >= QUICK_PAGE_MOVE_LIMIT) {
    moveQuickPage(delta < 0 ? 1 : -1, false)
  }

  event.currentTarget.releasePointerCapture?.(event.pointerId)
  resetQuickPointerState()
  startQuickAutoPlay()
  if (hasDragged) {
    window.setTimeout(() => {
      suppressNextQuickClick.value = false
    }, 120)
  }
}

function handleQuickPointerCancel() {
  suppressNextQuickClick.value = quickPointerMoved.value
  resetQuickPointerState()
  startQuickAutoPlay()
  window.setTimeout(() => {
    suppressNextQuickClick.value = false
  }, 120)
}

function stopQuickAutoPlay() {
  if (!quickAutoTimer) return

  window.clearInterval(quickAutoTimer)
  quickAutoTimer = null
}

function startQuickAutoPlay() {
  stopQuickAutoPlay()
  if (selectedQuickActionPages.value.length <= 1) return

  quickAutoTimer = window.setInterval(() => {
    moveQuickPage(1, true)
  }, 4000)
}

function moveQuickPage(step, loop) {
  const pageCount = selectedQuickActionPages.value.length
  if (pageCount <= 1) return

  quickTransitionEnabled.value = true
  const nextIndex = quickPageIndex.value + step
  if (nextIndex >= pageCount) {
    if (!loop) return
    quickSlideIndex.value = pageCount
    quickPageIndex.value = 0
    return
  }
  if (nextIndex < 0) return

  quickSlideIndex.value = nextIndex
  quickPageIndex.value = nextIndex
}

function goQuickPage(index) {
  stopQuickAutoPlay()
  quickTransitionEnabled.value = true
  quickPageIndex.value = index
  quickSlideIndex.value = index
  startQuickAutoPlay()
}

function handleQuickTransitionEnd(event) {
  if (event.propertyName !== 'transform') return
  const pageCount = selectedQuickActionPages.value.length
  if (pageCount <= 1 || quickSlideIndex.value !== pageCount) return

  if (quickResetFrame) {
    window.cancelAnimationFrame(quickResetFrame)
  }
  quickTransitionEnabled.value = false
  quickSlideIndex.value = 0

  quickResetFrame = window.requestAnimationFrame(() => {
    quickResetFrame = window.requestAnimationFrame(() => {
      quickTransitionEnabled.value = true
      quickResetFrame = 0
    })
  })
}

function openQuickConfig() {
  draftQuickRoutes.value = [...quickRoutes.value]
  quickConfigOpen.value = true
}

async function saveQuickConfig(nextRoutes = draftQuickRoutes.value) {
  quickSaving.value = true
  try {
    const savedRoutes = await updateQuickActions([...nextRoutes])
    quickRoutes.value = savedRoutes
    draftQuickRoutes.value = [...savedRoutes]
    authStore.user = {
      ...authStore.user,
      quickActions: savedRoutes
    }
  } finally {
    quickSaving.value = false
  }
}

function moveItem(items, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items
  const next = [...items]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

function handleDraftDragStart(index) {
  draftDragIndex.value = index
  quickDragPayload.value = {
    source: 'selected',
    route: draftQuickRoutes.value[index],
    index
  }
}

async function handleDraftDrop(index) {
  draftQuickRoutes.value = moveItem(draftQuickRoutes.value, draftDragIndex.value, index)
  draftDragIndex.value = -1
  await saveQuickConfig(draftQuickRoutes.value)
}

function handleAvailableDragStart(route) {
  quickDragPayload.value = {
    source: 'available',
    route
  }
}

async function handleDropToSelected() {
  const payload = quickDragPayload.value
  if (!payload?.route) return

  if (payload.source === 'available' && !draftQuickRoutes.value.includes(payload.route)) {
    draftQuickRoutes.value = [...draftQuickRoutes.value, payload.route]
    await saveQuickConfig(draftQuickRoutes.value)
  }

  quickDragPayload.value = null
}

async function handleDropToAvailable() {
  const payload = quickDragPayload.value
  if (payload?.source !== 'selected' || !payload.route) return

  draftQuickRoutes.value = draftQuickRoutes.value.filter((route) => route !== payload.route)
  await saveQuickConfig(draftQuickRoutes.value)
  quickDragPayload.value = null
  draftDragIndex.value = -1
}

function getLevelColor(level) {
  return { info: 'blue', success: 'green', warning: 'orange', error: 'red' }[level] || 'blue'
}

function getLevelText(level) {
  return { info: '普通', success: '成功', warning: '警告', error: '紧急' }[level] || '普通'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

async function loadData() {
  loading.value = true
  loadError.value = ''

  try {
    const [s, a, n, st] = await Promise.all([
      authStore.canAccessPath('/console') ? getAdminStats() : Promise.resolve({}),
      canManageArticles.value ? listRecentAdminArticles(5) : Promise.resolve([]),
      canManageNotifications.value ? listRecentAdminAnnouncements(5) : Promise.resolve([]),
      authStore.canAccessPath('/console/manage/settings') ? getAdminSettings() : Promise.resolve({})
    ])
    stats.value = s || {}
    recentArticles.value = a || []
    announcements.value = n || []
    settings.value = st || {}
    hasLoaded.value = true
  } catch (e) {
    loadError.value = e?.message || '工作台数据加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  startQuickAutoPlay()
})

onBeforeUnmount(stopQuickAutoPlay)

watch(availableQuickActions, loadQuickRoutes, { immediate: true })

watch(selectedQuickActionPages, (pages) => {
  if (quickPageIndex.value > pages.length - 1) {
    quickPageIndex.value = Math.max(pages.length - 1, 0)
  }
  quickSlideIndex.value = quickPageIndex.value
  startQuickAutoPlay()
})
</script>

<style scoped>
.workbench {
  max-width: 1400px;
  margin: 0 auto;
}

.workbench-alert {
  margin-bottom: 16px;
}

/* 欢迎区 */
.welcome-section {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 22px 28px;
  margin-bottom: 20px;
  background: var(--console-surface);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h1 {
  color: var(--console-text);
  font-size: 22px;
  margin: 0 0 4px;
  font-weight: 600;
}

.welcome-text p {
  color: var(--console-text-secondary);
  font-size: 13px;
  margin: 0;
}

.welcome-actions {
  display: flex;
  gap: 10px;
}

.welcome-actions .ant-btn {
  border-radius: 8px;
  height: 36px;
}

.welcome-actions .ant-btn-default {
  border-color: var(--console-border-strong);
  color: var(--console-text);
  background: var(--console-surface);
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.root-menu-section {
  margin-bottom: 20px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 18px;
  background: var(--console-surface);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-header h3 {
  margin: 0;
  color: var(--console-text);
  font-size: 15px;
  font-weight: 600;
}

.section-header span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.root-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.root-menu-card {
  min-width: 0;
  min-height: 84px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  grid-template-rows: 22px 18px;
  align-content: center;
  column-gap: 12px;
  row-gap: 2px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 14px;
  color: inherit;
  text-align: left;
  background: var(--console-surface-muted);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.root-menu-card:hover,
.root-menu-card:focus {
  border-color: var(--console-border-strong);
  background: var(--console-surface-hover);
  outline: none;
}

.root-menu-icon {
  grid-row: 1 / span 2;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
}

.root-menu-card strong,
.root-menu-card small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.root-menu-card strong {
  color: var(--console-text);
  font-size: 14px;
  line-height: 22px;
}

.root-menu-card small {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 18px;
}

.stat-card {
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.stat-card:hover {
  border-color: var(--console-border-strong);
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.06);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-body {
  flex: 1;
  min-width: 0;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--console-text-secondary);
  margin-bottom: 2px;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: var(--console-text);
  line-height: 1.2;
}

.stat-trend {
  flex-shrink: 0;
}

.trend-num {
  font-size: 12px;
  font-weight: 600;
}

.trend-num.up { color: #52c41a; }
.trend-num.down { color: #f5222d; }

/* 主内容 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
}

.content-card {
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--console-text);
}

/* 待办 */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  border: 1px solid transparent;
  padding: 12px;
  color: inherit;
  text-align: left;
  background: var(--console-surface-muted);
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}

.todo-item:hover,
.todo-item:focus {
  border-color: var(--console-border-strong);
  background: var(--console-surface-hover);
  outline: none;
}

.todo-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
  flex-shrink: 0;
}

.todo-info {
  flex: 1;
  min-width: 0;
}

.todo-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--console-text);
}

.todo-desc {
  font-size: 12px;
  color: var(--console-text-secondary);
}

.todo-count {
  font-size: 18px;
  font-weight: 600;
  color: var(--console-text);
  flex-shrink: 0;
}

/* 最近发布 */
.recent-list {
  max-height: 280px;
  overflow-y: auto;
}

.recent-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--console-border);
}

.recent-item:last-child { border-bottom: none; }

.recent-title {
  display: block;
  font-size: 13px;
  color: var(--console-text);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--console-text-secondary);
}

/* 快捷操作 */
.quick-carousel {
  position: relative;
  min-height: 304px;
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
}

.quick-track {
  display: flex;
  width: 100%;
  will-change: transform;
}

.quick-page {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(3, 82px);
  row-gap: 26px;
  column-gap: 0;
  flex: 0 0 100%;
  min-width: 100%;
  padding: 18px 0 34px;
}

.quick-item,
.quick-placeholder {
  justify-self: center;
  width: 68px;
  min-height: 82px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  padding: 12px 4px;
  border-radius: 8px;
  color: inherit;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.quick-item:hover,
.quick-item:focus {
  border-color: var(--console-border);
  background: var(--console-surface-hover);
  outline: none;
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.quick-item span {
  font-size: 12px;
  line-height: 18px;
  color: var(--console-menu-text);
  max-width: 78px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 16px;
  margin-top: -12px;
}

.quick-dots button {
  border: 0;
  width: 7px;
  height: 7px;
  padding: 0;
  border-radius: 999px;
  background: var(--console-border-strong);
  cursor: pointer;
  transition: width 0.2s, background 0.2s;
}

.quick-dots button.active {
  width: 18px;
  background: var(--console-text-secondary);
}

.quick-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.quick-config {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 360px;
}

.quick-config__pane {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  min-width: 0;
  overflow: hidden;
}

.quick-config__pane header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  padding: 0 14px;
  border-bottom: 1px solid var(--console-border);
  color: var(--console-text);
}

.quick-config__pane header span {
  font-size: 12px;
  color: var(--console-text-secondary);
}

.quick-config__list {
  height: 316px;
  overflow-y: auto;
  padding: 10px;
}

.quick-config__list--selected,
.quick-config__list--available {
  outline: 1px dashed transparent;
  outline-offset: -6px;
  transition: outline-color 0.2s, background 0.2s;
}

.quick-config__list--selected:hover,
.quick-config__list--available:hover {
  outline-color: var(--console-border-strong);
  background: var(--console-surface-muted);
}

.quick-config__item,
.quick-config__check {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  min-height: 36px;
  border-radius: 8px;
  padding: 0 10px;
  color: var(--console-text);
}

.quick-config__item {
  border: 1px solid transparent;
  background: transparent;
  cursor: grab;
}

.quick-config__item:hover,
.quick-config__item:focus {
  border-color: var(--console-border-strong);
  background: var(--console-surface-hover);
  outline: none;
}

.quick-config__checks {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.quick-config__check {
  margin-inline-start: 0;
  cursor: grab;
  border: 1px solid transparent;
  background: transparent;
}

.quick-config__check:hover {
  border-color: var(--console-border-strong);
  background: var(--console-surface-hover);
}

.quick-config__item span,
.quick-config__check > span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 公告 */
.notice-list {
  max-height: 200px;
  overflow-y: auto;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--console-border);
}

.notice-item:last-child { border-bottom: none; }

.notice-title {
  flex: 1;
  font-size: 13px;
  color: var(--console-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 系统信息 */
.sys-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-key {
  font-size: 13px;
  color: var(--console-text-secondary);
}

.info-val {
  font-size: 13px;
  color: var(--console-text);
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
  .main-content { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .welcome-content { flex-direction: column; gap: 12px; text-align: center; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .root-menu-section { padding: 14px; }
  .root-menu-grid { grid-template-columns: 1fr; }
  .root-menu-card { min-height: 76px; }
  .quick-config { grid-template-columns: 1fr; }
  .quick-config__list { height: 220px; }
}
</style>
