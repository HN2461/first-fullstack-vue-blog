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
      <AnnouncementDropdownPanel
        :announcements="announcementList"
        :loading="loading"
        :has-unread="notificationStore.hasUnread"
        :can-manage="canManageNotifications"
        :get-level-text="getLevelText"
        :get-level-color="getLevelColor"
        :format-time-ago="formatTimeAgo"
        :get-snippet="getSnippet"
        @select="handleItemClick"
        @mark-all-read="handleMarkAllRead"
        @view-all="handleViewAll"
        @manage="handleManageAnnouncements"
      />
    </template>
  </a-dropdown>

  <AnnouncementDetailModal
    v-model:open="detailVisible"
    :announcement="detailData"
    :get-level-text="getLevelText"
    :get-level-color="getLevelColor"
    :format-date="formatDate"
  />
  <AnnouncementTimelineModal
    v-model:open="timelineVisible"
    :announcements="timelineList"
    :loading="timelineLoading"
    :has-unread="notificationStore.hasUnread"
    :get-level-text="getLevelText"
    :get-level-color="getLevelColor"
    :format-date="formatDate"
    :get-snippet="getSnippet"
    @select="handleTimelineItemClick"
    @mark-all-read="handleMarkAllRead"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BellOutlined } from '@ant-design/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { listPublicAnnouncements } from '@/services/public'
import AnnouncementDetailModal from '@/components/announcement/AnnouncementDetailModal.vue'
import AnnouncementDropdownPanel from '@/components/announcement/AnnouncementDropdownPanel.vue'
import AnnouncementTimelineModal from '@/components/announcement/AnnouncementTimelineModal.vue'

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const dropdownVisible = ref(false)
const loading = ref(false)
const announcementList = ref([])
const detailVisible = ref(false)
const detailData = ref(null)
const timelineVisible = ref(false)
const timelineLoading = ref(false)
const timelineList = ref([])
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

function getSnippet(text, maxLength = 60) {
  if (!text) return ''
  const normalized = text.replace(/\n/g, ' ')
  const snippet = normalized.slice(0, maxLength)
  return normalized.length > maxLength ? snippet + '…' : snippet
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

async function loadTimelineList() {
  timelineLoading.value = true
  try {
    const result = await listPublicAnnouncements({ pageSize: 50 })
    timelineList.value = result.items || []
  } catch {
    timelineList.value = []
  } finally {
    timelineLoading.value = false
  }
}

function handleItemClick(item) {
  markLocalAnnouncementRead(item)
  dropdownVisible.value = false
  detailData.value = item
  detailVisible.value = true
}

function handleTimelineItemClick(item) {
  markLocalAnnouncementRead(item)
  detailData.value = item
  detailVisible.value = true
}

function markLocalAnnouncementRead(item) {
  if (item.isRead) return
  notificationStore.markRead(item.id)
  item.isRead = true
  const dropdownItem = announcementList.value.find((record) => record.id === item.id)
  if (dropdownItem) dropdownItem.isRead = true
  const timelineItem = timelineList.value.find((record) => record.id === item.id)
  if (timelineItem) timelineItem.isRead = true
}

async function handleMarkAllRead() {
  await notificationStore.markAllRead()
  announcementList.value.forEach(item => { item.isRead = true })
  timelineList.value.forEach(item => { item.isRead = true })
}

function handleViewAll() {
  dropdownVisible.value = false
  timelineVisible.value = true
  loadTimelineList()
}

function handleManageAnnouncements() {
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
</style>
