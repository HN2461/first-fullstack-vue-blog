<template>
  <a-dropdown
    v-model:open="dropdownVisible"
    :trigger="['click']"
    overlay-class-name="announce-bell-dropdown"
    placement="bottomRight"
  >
    <a-badge
      :count="notificationStore.unreadCount"
      :overflow-count="99"
      size="small"
      class="announce-bell-badge"
    >
      <a-button class="enterprise-icon-action announce-bell-btn" type="text">
        <template #icon><BellOutlined /></template>
      </a-button>
    </a-badge>
    <template #overlay>
      <div class="announce-bell-panel">
        <div class="announce-bell-header">
          <strong>公告通知</strong>
          <a-button
            v-if="notificationStore.hasUnread"
            type="link"
            size="small"
            @click="handleMarkAllRead"
          >
            全部已读
          </a-button>
        </div>
        <div class="announce-bell-body">
          <template v-if="loading">
            <div class="announce-bell-loading">
              <a-spin size="small" />
            </div>
          </template>
          <template v-else-if="announcementList.length === 0">
            <a-empty description="暂无公告" :image-style="{ height: '40px' }" />
          </template>
          <template v-else>
            <div
              v-for="item in announcementList"
              :key="item.id"
              :class="['announce-bell-item', { 'announce-bell-item--unread': !item.isRead }]"
              @click="handleItemClick(item)"
            >
              <div class="announce-bell-item-dot">
                <span v-if="!item.isRead" class="announce-bell-unread-dot" />
              </div>
              <div class="announce-bell-item-body">
                <div class="announce-bell-item-top">
                  <a-tag
                    :color="getLevelColor(item.level)"
                    size="small"
                    class="announce-bell-level-tag"
                  >
                    {{ getLevelText(item.level) }}
                  </a-tag>
                  <span class="announce-bell-item-time">{{ formatTimeAgo(item.createdAt) }}</span>
                </div>
                <div class="announce-bell-item-title">{{ item.title }}</div>
                <div class="announce-bell-item-snippet">{{ getSnippet(item.content) }}</div>
              </div>
            </div>
          </template>
        </div>
        <div v-if="announcementList.length > 0 && canManageNotifications" class="announce-bell-footer">
          <a-button type="link" size="small" block @click="handleViewAll">
            查看全部公告
          </a-button>
        </div>
      </div>
    </template>
  </a-dropdown>

  <!-- 详情弹窗 -->
  <a-modal
    v-model:open="detailVisible"
    :title="detailData?.title"
    :footer="null"
    width="560px"
    centered
    class="announce-bell-detail-modal"
  >
    <template v-if="detailData">
      <div class="announce-bell-detail-meta">
        <a-tag :color="getLevelColor(detailData.level)">{{ getLevelText(detailData.level) }}</a-tag>
        <span>{{ formatDate(detailData.createdAt) }}</span>
      </div>
      <a-divider style="margin: 14px 0" />
      <div class="announce-bell-detail-content">{{ detailData.content }}</div>
      <div v-if="detailData.link" style="margin-top: 12px; font-size: 13px">
        <LinkOutlined /> <a :href="detailData.link" target="_blank">{{ detailData.link }}</a>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BellOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { listPublicAnnouncements } from '@/services/public'

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const dropdownVisible = ref(false)
const loading = ref(false)
const announcementList = ref([])
const detailVisible = ref(false)
const detailData = ref(null)
const canManageNotifications = computed(() => authStore.canAccessPath('/console/manage/notifications'))

let pollTimer = null

const levelMap = {
  info: { text: '提示', color: 'blue' },
  warning: { text: '警告', color: 'orange' },
  error: { text: '紧急', color: 'red' }
}

function getLevelText(level) {
  return levelMap[level]?.text || '提示'
}

function getLevelColor(level) {
  return levelMap[level]?.color || 'blue'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return formatDate(dateStr)
}

function getSnippet(text) {
  if (!text) return ''
  const snippet = text.replace(/\n/g, ' ').slice(0, 60)
  return text.length > 60 ? snippet + '…' : snippet
}

async function loadAnnouncementList() {
  loading.value = true
  try {
    const result = await listPublicAnnouncements({ pageSize: 10 })
    announcementList.value = result.items || []
  } catch {
    announcementList.value = []
  } finally {
    loading.value = false
  }
}

function handleItemClick(item) {
  if (!item.isRead) {
    notificationStore.markRead(item.id)
    item.isRead = true
  }
  dropdownVisible.value = false
  detailData.value = item
  detailVisible.value = true
}

async function handleMarkAllRead() {
  await notificationStore.markAllRead()
  announcementList.value.forEach(item => { item.isRead = true })
}

function handleViewAll() {
  dropdownVisible.value = false
  router.push('/console/manage/notifications')
}

// 下拉面板展开时刷新列表
watch(dropdownVisible, (visible) => {
  if (visible && authStore.isLoggedIn) {
    loadAnnouncementList()
  }
})

// 登录状态变化时刷新未读数
watch(() => authStore.isLoggedIn, (logged) => {
  if (logged) {
    notificationStore.fetchUnreadCount()
  } else {
    notificationStore.reset()
  }
})

onMounted(() => {
  if (authStore.isLoggedIn) {
    notificationStore.fetchUnreadCount()
    notificationStore.fetchPopupAnnouncements()
  }
  // 每60秒轮询未读数
  pollTimer = setInterval(() => {
    if (authStore.isLoggedIn) {
      notificationStore.fetchUnreadCount()
    }
  }, 60000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style>
/* 注意：dropdown overlay 挂载在 body 下，不用 scoped */
.announce-bell-dropdown .ant-dropdown-content {
  padding: 0;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}
</style>

<style scoped>
.announce-bell-btn {
  border: 0 !important;
  box-shadow: none !important;
}

.announce-bell-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.announce-bell-badge :deep(.ant-badge-count) {
  top: 5px;
  right: 5px;
  transform: translate(50%, -50%);
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  border-radius: 8px;
  font-size: 11px;
  line-height: 16px;
  box-shadow: none;
}

.announce-bell-panel {
  width: 380px;
  max-height: 460px;
  display: flex;
  flex-direction: column;
  background: var(--console-surface, #fff);
  color: var(--console-text, #101828);
  border-radius: 10px;
  overflow: hidden;
}

.announce-bell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--console-border, #e5e7eb);
}

.announce-bell-header strong {
  font-size: 15px;
  font-weight: 600;
}

.announce-bell-body {
  flex: 1;
  overflow-y: auto;
  max-height: 340px;
  padding: 4px 0;
}

.announce-bell-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.announce-bell-item {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.announce-bell-item:hover {
  background: var(--console-surface-hover, #f2f6fc);
}

.announce-bell-item--unread {
  background: var(--console-primary-soft, #eaf2ff);
}

.announce-bell-item--unread:hover {
  background: var(--console-surface-hover, #f2f6fc);
}

.announce-bell-item-dot {
  flex: 0 0 8px;
  padding-top: 6px;
}

.announce-bell-unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: block;
  background: var(--console-primary, #1668dc);
}

.announce-bell-item-body {
  flex: 1;
  min-width: 0;
}

.announce-bell-item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.announce-bell-level-tag {
  font-size: 11px !important;
  padding: 0 5px !important;
  line-height: 18px !important;
  border: 0 !important;
}

.announce-bell-item-time {
  font-size: 11px;
  color: var(--console-text-secondary, #667085);
}

.announce-bell-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--console-text, #101828);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

.announce-bell-item-snippet {
  font-size: 12px;
  color: var(--console-text-secondary, #667085);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.announce-bell-footer {
  padding: 8px 12px;
  border-top: 1px solid var(--console-border, #e5e7eb);
  text-align: center;
}

/* 详情弹窗 */
.announce-bell-detail-modal :deep(.ant-modal-body) {
  padding: 24px 28px;
}

.announce-bell-detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--console-text-secondary, #667085);
}

.announce-bell-detail-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.8;
  color: var(--console-text, #101828);
}
</style>
