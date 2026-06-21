import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { buildDocumentTitle } from '@/utils/siteProfile'
import { isKnownConsolePath } from '@/utils/consoleRoutes'

const HomePage = () => import('@/views/public/HomePage/index.vue')
const ArticleListPage = () => import('@/views/public/ArticleListPage/index.vue')
const ArticleDetailPage = () => import('@/views/public/ArticleDetailPage/index.vue')
const SearchPage = () => import('@/views/public/SearchPage/index.vue')
const LoginPage = () => import('@/views/auth/LoginPage/index.vue')
const RegisterPage = () => import('@/views/auth/RegisterPage/index.vue')
const PublicLayout = () => import('@/views/public/PublicLayout/index.vue')
const ConsoleLayout = () => import('@/views/console/ConsoleLayout/index.vue')
const AdminArticles = () => import('@/views/admin/AdminArticles/index.vue')
const AdminArticleImport = () => import('@/views/admin/AdminArticleImport/index.vue')
const AdminArticleEditor = () => import('@/views/admin/AdminArticleEditor/index.vue')
const AdminCategories = () => import('@/views/admin/AdminCategories/index.vue')
const AdminMigration = () => import('@/views/admin/AdminMigration/index.vue')
const AdminTags = () => import('@/views/admin/AdminTags/index.vue')
const AdminComments = () => import('@/views/admin/AdminComments/index.vue')
const AdminUsers = () => import('@/views/admin/AdminUsers/index.vue')
const AdminRoles = () => import('@/views/admin/AdminRoles/index.vue')
const AdminMenus = () => import('@/views/admin/AdminMenus/index.vue')
const AdminApprovals = () => import('@/views/admin/AdminApprovals/index.vue')
const AdminStats = () => import('@/views/admin/AdminStats/index.vue')
const AdminMonitor = () => import('@/views/admin/AdminMonitor/index.vue')
const AdminMedia = () => import('@/views/admin/AdminMedia/index.vue')
const AdminNotifications = () => import('@/views/admin/AdminNotifications/index.vue')
const AdminProjectTimeline = () => import('@/views/admin/AdminProjectTimeline/index.vue')
const AdminSettings = () => import('@/views/admin/AdminSettings/index.vue')
const AdminTrash = () => import('@/views/admin/AdminTrash/index.vue')
const MemoPage = () => import('@/views/console/MemoPage/index.vue')
const ProfilePage = () => import('@/views/console/ProfilePage/index.vue')
const UnavailablePage = () => import('@/views/console/UnavailablePage/index.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: HomePage,
          meta: { title: '首页' }
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage,
      meta: { title: '注册' }
    },
    {
      path: '/console',
      component: ConsoleLayout,
      meta: {
        title: '知识库',
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'AdminStats',
          component: AdminStats,
          meta: { title: '知识库首页', requiresAuth: true }
        },
        {
          path: 'articles',
          name: 'ConsoleArticles',
          component: ArticleListPage,
          meta: { title: '全部文章', requiresAuth: true }
        },
        {
          path: 'articles/:slug',
          name: 'ConsoleArticleDetail',
          redirect: (to) => `/console/article-directory/articles/${to.params.slug}`,
          meta: { title: '文章详情', requiresAuth: true }
        },
        {
          path: 'article-directory',
          name: 'ConsoleArticleDirectory',
          component: ArticleListPage,
          meta: { title: '文章目录', requiresAuth: true }
        },
        {
          path: 'article-directory/articles/:slug',
          name: 'ConsoleDirectoryArticleDetail',
          component: ArticleDetailPage,
          meta: { title: '文章详情', requiresAuth: true }
        },
        {
          path: 'article-directory/categories/:category',
          name: 'ConsoleDirectoryCategoryArticles',
          component: ArticleListPage,
          meta: { title: '分类文章', requiresAuth: true }
        },
        {
          path: 'article-directory/tags/:tag',
          name: 'ConsoleDirectoryTagArticles',
          component: ArticleListPage,
          meta: { title: '标签文章', requiresAuth: true }
        },
        {
          path: 'categories/:category',
          name: 'ConsoleCategoryArticles',
          component: ArticleListPage,
          meta: { title: '分类文章', requiresAuth: true }
        },
        {
          path: 'tags/:tag',
          name: 'ConsoleTagArticles',
          component: ArticleListPage,
          meta: { title: '标签文章', requiresAuth: true }
        },
        {
          path: 'search',
          name: 'ConsoleSearch',
          component: SearchPage,
          meta: { title: '全文检索', requiresAuth: true }
        },
        {
          path: 'memos',
          name: 'ConsoleMemos',
          component: MemoPage,
          meta: { title: '备忘录', requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'ConsoleProfile',
          component: ProfilePage,
          meta: { title: '个人信息', requiresAuth: true }
        },
        {
          path: 'unavailable',
          name: 'ConsoleUnavailable',
          component: UnavailablePage,
          meta: { title: '页面暂未开发', requiresAuth: true, pendingPage: true }
        },
        {
          path: 'manage/articles/import',
          name: 'AdminArticleImport',
          component: AdminArticleImport,
          meta: { title: '文章导入', requiresAdmin: true }
        },
        {
          path: 'write',
          name: 'AdminWriter',
          component: AdminArticleEditor,
          meta: { title: '新建文章', requiresAdmin: true }
        },
        {
          path: 'manage/articles/new',
          name: 'AdminArticleNew',
          component: AdminArticleEditor,
          meta: { title: '新建文章', requiresAdmin: true }
        },
        {
          path: 'manage/articles/:id([a-f\\d]{24})',
          name: 'AdminArticleEdit',
          component: AdminArticleEditor,
          meta: { title: '编辑文章', requiresAdmin: true }
        },
        {
          path: 'manage/articles',
          name: 'AdminArticles',
          component: AdminArticles,
          meta: { title: '文章管理', requiresAdmin: true }
        },
        {
          path: 'manage/categories',
          name: 'AdminCategories',
          component: AdminCategories,
          meta: { title: '分类管理', requiresAdmin: true }
        },
        {
          path: 'manage/migration',
          name: 'AdminMigration',
          component: AdminMigration,
          meta: { title: '迁移配置', requiresAdmin: true }
        },
        {
          path: 'manage/tags',
          name: 'AdminTags',
          component: AdminTags,
          meta: { title: '标签管理', requiresAdmin: true }
        },
        {
          path: 'manage/comments',
          name: 'AdminComments',
          component: AdminComments,
          meta: { title: '评论审核', requiresAdmin: true }
        },
        {
          path: 'manage/users',
          name: 'AdminUsers',
          component: AdminUsers,
          meta: { title: '用户管理', requiresAdmin: true }
        },
        {
          path: 'manage/roles',
          name: 'AdminRoles',
          component: AdminRoles,
          meta: { title: '角色管理', requiresAdmin: true }
        },
        {
          path: 'manage/menus',
          name: 'AdminMenus',
          component: AdminMenus,
          meta: { title: '菜单管理', requiresAdmin: true }
        },
        {
          path: 'manage/approvals',
          name: 'AdminApprovals',
          component: AdminApprovals,
          meta: { title: '权限审批', requiresAdmin: true }
        },
        {
          path: 'manage/media',
          name: 'AdminMedia',
          component: AdminMedia,
          meta: { title: '媒体库', requiresAdmin: true }
        },
        {
          path: 'manage/notifications',
          name: 'AdminNotifications',
          component: AdminNotifications,
          meta: { title: '公告管理', requiresAdmin: true }
        },
        {
          path: 'manage/settings',
          name: 'AdminSettings',
          component: AdminSettings,
          meta: { title: '系统设置', requiresAdmin: true }
        },
        {
          path: 'manage/monitor',
          name: 'AdminMonitor',
          component: AdminMonitor,
          meta: { title: '服务监控', requiresAdmin: true }
        },
        {
          path: 'manage/project-timeline',
          name: 'AdminProjectTimeline',
          component: AdminProjectTimeline,
          meta: { title: '项目记录台账', requiresAdmin: true }
        },
        {
          path: 'manage/trash',
          name: 'AdminTrash',
          component: AdminTrash,
          meta: { title: '回收站', requiresAdmin: true }
        }
      ]
    },
    {
      path: '/admin',
      redirect: '/console'
    },
    {
      path: '/admin/:pathMatch(.*)*',
      redirect: (to) => `/console/manage/${to.params.pathMatch || ''}`
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: UnavailablePage,
      meta: { title: '当前页面不存在' }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

function getConsoleTargetForLegacyPath(to) {
  if (to.path === '/articles') {
    return { name: 'ConsoleArticles', query: to.query, hash: to.hash }
  }

  const articleMatch = to.path.match(/^\/articles\/([^/]+)$/)
  if (articleMatch) {
    return {
      name: 'ConsoleArticleDetail',
      params: { slug: decodeURIComponent(articleMatch[1]) },
      query: to.query,
      hash: to.hash
    }
  }

  const categoryMatch = to.path.match(/^\/categories\/([^/]+)$/)
  if (categoryMatch) {
    return {
      name: 'ConsoleCategoryArticles',
      params: { category: decodeURIComponent(categoryMatch[1]) },
      query: to.query,
      hash: to.hash
    }
  }

  const tagMatch = to.path.match(/^\/tags\/([^/]+)$/)
  if (tagMatch) {
    return {
      name: 'ConsoleTagArticles',
      params: { tag: decodeURIComponent(tagMatch[1]) },
      query: to.query,
      hash: to.hash
    }
  }

  if (to.path === '/search') {
    return { name: 'ConsoleSearch', query: to.query, hash: to.hash }
  }

  return null
}

function flattenMenus(items = []) {
  return items.flatMap((item) => [
    item,
    ...flattenMenus(item.children || [])
  ])
}

function findPendingMenuTarget(path, authStore) {
  if (!authStore.isLoggedIn || !path.startsWith('/console')) return null
  if (isKnownConsolePath(path)) return null

  return flattenMenus(authStore.rootMenus || []).find((menu) => {
    if (!menu.routePath || menu.routePath === '/console') return false
    return path === menu.routePath || path.startsWith(`${menu.routePath}/`)
  }) || null
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.ready) {
    await authStore.restoreSession()
  }

  const consoleTarget = getConsoleTargetForLegacyPath(to)
  if (consoleTarget) {
    if (authStore.isLoggedIn) {
      return consoleTarget
    }

    return {
      name: 'Login',
      query: { redirect: router.resolve(consoleTarget).fullPath }
    }
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }

  if (to.path === '/console' && authStore.isLoggedIn && !authStore.isAdmin) {
    return { name: 'ConsoleArticles' }
  }

  const pendingMenuTarget = findPendingMenuTarget(to.path, authStore)
  if (pendingMenuTarget && to.name !== 'ConsoleUnavailable') {
    return {
      name: 'ConsoleUnavailable',
      query: { from: to.fullPath, menu: pendingMenuTarget.code || pendingMenuTarget.id || '' }
    }
  }

  if (to.path === '/console' && authStore.isLoggedIn && !authStore.canAccessPath('/console')) {
    return { name: 'ConsoleUnavailable' }
  }

  if (to.meta.requiresAdmin && !authStore.canAccessPath(to.path)) {
    return authStore.isLoggedIn
      ? { name: 'ConsoleUnavailable' }
      : {
          name: 'Login',
          query: { redirect: to.fullPath }
        }
  }

  return true
})

router.afterEach((to) => {
  document.title = buildDocumentTitle(to.meta.title)
})
