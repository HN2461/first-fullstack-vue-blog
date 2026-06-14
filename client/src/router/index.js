import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { buildDocumentTitle } from '@/utils/siteProfile'

const HomePage = () => import('@/views/public/HomePage.vue')
const ArticleListPage = () => import('@/views/public/ArticleListPage.vue')
const ArticleDetailPage = () => import('@/views/public/ArticleDetailPage.vue')
const SearchPage = () => import('@/views/public/SearchPage.vue')
const LoginPage = () => import('@/views/auth/LoginPage.vue')
const RegisterPage = () => import('@/views/auth/RegisterPage.vue')
const PublicLayout = () => import('@/views/public/PublicLayout.vue')
const ConsoleLayout = () => import('@/views/console/ConsoleLayout.vue')
const AdminArticles = () => import('@/views/admin/AdminArticles.vue')
const AdminArticleEditor = () => import('@/views/admin/AdminArticleEditor.vue')
const AdminCategories = () => import('@/views/admin/AdminCategories.vue')
const AdminTags = () => import('@/views/admin/AdminTags.vue')
const AdminComments = () => import('@/views/admin/AdminComments.vue')
const AdminUsers = () => import('@/views/admin/AdminUsers.vue')
const AdminStats = () => import('@/views/admin/AdminStats.vue')
const AdminMedia = () => import('@/views/admin/AdminMedia.vue')
const AdminNotifications = () => import('@/views/admin/AdminNotifications.vue')
const AdminSettings = () => import('@/views/admin/AdminSettings.vue')
const AdminTrash = () => import('@/views/admin/AdminTrash.vue')
const ProfilePage = () => import('@/views/console/ProfilePage.vue')

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
        },
        {
          path: 'articles',
          name: 'Articles',
          component: ArticleListPage,
          meta: { title: '文章' }
        },
        {
          path: 'articles/:slug',
          name: 'ArticleDetail',
          component: ArticleDetailPage,
          meta: { title: '文章详情' }
        },
        {
          path: 'categories/:category',
          name: 'CategoryArticles',
          component: ArticleListPage,
          meta: { title: '分类文章' }
        },
        {
          path: 'tags/:tag',
          name: 'TagArticles',
          component: ArticleListPage,
          meta: { title: '标签文章' }
        },
        {
          path: 'search',
          name: 'Search',
          component: SearchPage,
          meta: { title: '搜索' }
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
          component: ArticleDetailPage,
          meta: { title: '文章详情', requiresAuth: true }
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
          path: 'profile',
          name: 'ConsoleProfile',
          component: ProfilePage,
          meta: { title: '个人信息', requiresAuth: true }
        },
        {
          path: 'manage/articles',
          name: 'AdminArticles',
          component: AdminArticles,
          meta: { title: '文章管理', requiresAdmin: true }
        },
        {
          path: 'manage/articles/new',
          name: 'AdminArticleNew',
          component: AdminArticleEditor,
          meta: { title: '新建文章', requiresAdmin: true }
        },
        {
          path: 'manage/articles/:id',
          name: 'AdminArticleEdit',
          component: AdminArticleEditor,
          meta: { title: '编辑文章', requiresAdmin: true }
        },
        {
          path: 'manage/categories',
          name: 'AdminCategories',
          component: AdminCategories,
          meta: { title: '分类管理', requiresAdmin: true }
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
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.ready) {
    await authStore.restoreSession()
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

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return authStore.isLoggedIn
      ? { name: 'ConsoleArticles' }
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
