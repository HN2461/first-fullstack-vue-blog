<template>
  <div class="workbench">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1>{{ greeting }}，{{ authStore.user?.username || '管理员' }}</h1>
          <p>{{ todayFormatted }}</p>
        </div>
        <div class="welcome-actions">
          <a-button type="primary" @click="$router.push('/console/manage/articles/new')">
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
          <div class="todo-list">
            <div class="todo-item" v-for="item in todoItems" :key="item.label" @click="$router.push(item.route)">
              <div class="todo-icon" :style="{ background: item.color }">
                <component :is="item.icon" />
              </div>
              <div class="todo-info">
                <span class="todo-label">{{ item.label }}</span>
                <span class="todo-desc">{{ item.desc }}</span>
              </div>
              <span class="todo-count">{{ item.count }}</span>
            </div>
          </div>
        </div>

        <!-- 最近发布 -->
        <div class="content-card">
          <div class="card-header">
            <h3>最近发布</h3>
            <a-button type="link" size="small" @click="$router.push('/console/manage/articles')">全部</a-button>
          </div>
          <div class="recent-list">
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
          </div>
          <div class="quick-grid">
            <div class="quick-item" v-for="item in quickActions" :key="item.label" @click="$router.push(item.route)">
              <div class="quick-icon" :style="{ background: item.bg, color: item.color }">
                <component :is="item.icon" />
              </div>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>

        <!-- 系统公告 -->
        <div class="content-card">
          <div class="card-header">
            <h3>系统公告</h3>
            <a-button type="link" size="small" @click="$router.push('/console/manage/notifications')">管理</a-button>
          </div>
          <div class="notice-list">
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
          <div class="sys-info">
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  PlusOutlined, BookOutlined,
  FileTextOutlined, FileDoneOutlined, EditOutlined,
  TeamOutlined, CommentOutlined, PictureOutlined,
  TagOutlined, FolderOutlined, BellOutlined, ToolOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { getAdminStats, listAdminArticles, listAdminAnnouncements, getAdminSettings } from '@/services/admin'

const authStore = useAuthStore()
const stats = ref({})
const recentArticles = ref([])
const announcements = ref([])
const settings = ref({})

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

const totalPending = computed(() => (stats.value.draftCount || 0) + (stats.value.pendingCommentCount || 0))

const todoItems = computed(() => [
  { label: '草稿文章', desc: '待发布确认', count: stats.value.draftCount || 0, icon: EditOutlined, color: '#faad14', route: '/console/manage/articles' },
  { label: '待审评论', desc: '待审核公开', count: stats.value.pendingCommentCount || 0, icon: CommentOutlined, color: '#f5222d', route: '/console/manage/comments' },
  { label: '媒体文件', desc: '已上传文件', count: stats.value.mediaCount || 0, icon: PictureOutlined, color: '#1890ff', route: '/console/manage/media' }
])

const quickActions = [
  { label: '文章', icon: FileTextOutlined, bg: '#e6f7ff', color: '#1890ff', route: '/console/manage/articles' },
  { label: '分类', icon: FolderOutlined, bg: '#f6ffed', color: '#52c41a', route: '/console/manage/categories' },
  { label: '标签', icon: TagOutlined, bg: '#fff7e6', color: '#faad14', route: '/console/manage/tags' },
  { label: '评论', icon: CommentOutlined, bg: '#fff1f0', color: '#f5222d', route: '/console/manage/comments' },
  { label: '用户', icon: TeamOutlined, bg: '#f9f0ff', color: '#722ed1', route: '/console/manage/users' },
  { label: '媒体', icon: PictureOutlined, bg: '#e6fffb', color: '#13c2c2', route: '/console/manage/media' },
  { label: '公告', icon: BellOutlined, bg: '#fff0f6', color: '#eb2f96', route: '/console/manage/notifications' },
  { label: '设置', icon: ToolOutlined, bg: '#f5f5f5', color: '#666', route: '/console/manage/settings' }
]

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
  try {
    const [s, a, n, st] = await Promise.all([
      getAdminStats(),
      listAdminArticles(),
      listAdminAnnouncements(),
      getAdminSettings()
    ])
    stats.value = s || {}
    recentArticles.value = (a || []).slice(0, 5)
    announcements.value = (n || []).slice(0, 5)
    settings.value = st || {}
  } catch (e) {
    console.error('工作台加载失败:', e)
  }
}

onMounted(loadData)
</script>

<style scoped>
.workbench {
  max-width: 1400px;
  margin: 0 auto;
}

/* 欢迎区 */
.welcome-section {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  border-radius: 10px;
  padding: 24px 32px;
  margin-bottom: 20px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h1 {
  color: #fff;
  font-size: 22px;
  margin: 0 0 4px;
  font-weight: 600;
}

.welcome-text p {
  color: rgba(255, 255, 255, 0.8);
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
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
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
  color: #8c8c8c;
  margin-bottom: 2px;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
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
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
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
  color: #1a1a1a;
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
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.todo-item:hover { background: #f0f0f0; }

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
  color: #1a1a1a;
}

.todo-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.todo-count {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  flex-shrink: 0;
}

/* 最近发布 */
.recent-list {
  max-height: 280px;
  overflow-y: auto;
}

.recent-item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.recent-item:last-child { border-bottom: none; }

.recent-title {
  display: block;
  font-size: 13px;
  color: #1a1a1a;
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
  color: #8c8c8c;
}

/* 快捷操作 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.quick-item:hover { background: #fafafa; }

.quick-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.quick-item span {
  font-size: 11px;
  color: #666;
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
  border-bottom: 1px solid #f5f5f5;
}

.notice-item:last-child { border-bottom: none; }

.notice-title {
  flex: 1;
  font-size: 13px;
  color: #333;
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
  color: #8c8c8c;
}

.info-val {
  font-size: 13px;
  color: #1a1a1a;
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
  .quick-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
