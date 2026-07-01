<template>
  <a-modal
    v-model:open="visible"
    title="系统公告"
    :footer="null"
    width="520px"
    centered
    class="announce-popup-modal"
    :mask-closable="true"
    @cancel="handleClose"
  >
    <template v-if="currentAnnouncement">
      <div class="announce-popup-meta">
        <a-tag :color="getLevelColor(currentAnnouncement.level)">
          {{ getLevelText(currentAnnouncement.level) }}
        </a-tag>
        <span class="announce-popup-time">{{ formatDate(currentAnnouncement.createdAt) }}</span>
      </div>
      <h3 class="announce-popup-title">{{ currentAnnouncement.title }}</h3>
      <div class="announce-popup-content">{{ currentAnnouncement.content }}</div>
      <div v-if="currentAnnouncement.link" class="announce-popup-link">
        <LinkOutlined /> <a :href="currentAnnouncement.link" target="_blank">{{ currentAnnouncement.link }}</a>
      </div>
    </template>
    <div class="announce-popup-actions">
      <a-button type="primary" block @click="handleClose">我知道了</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { LinkOutlined } from '@ant-design/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const visible = ref(false)
const currentAnnouncement = ref(null)
const queue = ref([])

let pollTimer = null
let firstCheckTimer = null
const POPUP_POLL_INTERVAL = 600000

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

function getTodayKey() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getShownStorageKey() {
  return `announcement-popup-shown:${authStore.user?.id || 'guest'}:${getTodayKey()}`
}

function getShownIds() {
  try {
    return JSON.parse(localStorage.getItem(getShownStorageKey()) || '[]')
  } catch {
    return []
  }
}

function markShown(id) {
  const ids = [...new Set([...getShownIds(), id])].slice(-80)
  localStorage.setItem(getShownStorageKey(), JSON.stringify(ids))
}

async function checkPopupAnnouncements() {
  if (!authStore.isLoggedIn || visible.value) return

  try {
    await notificationStore.fetchPopupAnnouncements()
    const shownIds = new Set(getShownIds())
    const popups = notificationStore.popupAnnouncements.filter((item) => !shownIds.has(item.id))

    if (popups.length > 0) {
      queue.value = [...popups]
      showNext()
    }
  } catch {
    // 静默失败
  }
}

function showNext() {
  if (queue.value.length === 0) {
    visible.value = false
    currentAnnouncement.value = null
    return
  }

  currentAnnouncement.value = queue.value.shift()
  markShown(currentAnnouncement.value.id)
  visible.value = true
}

async function handleClose() {
  if (currentAnnouncement.value) {
    await notificationStore.markRead(currentAnnouncement.value.id)
  }

  if (queue.value.length > 0) {
    showNext()
  } else {
    visible.value = false
    currentAnnouncement.value = null
  }
}

onMounted(() => {
  // 公告属于正式通知，但自动弹出仍应低打扰；当天已弹过的公告由通知中心承接后续查看。
  firstCheckTimer = setTimeout(checkPopupAnnouncements, 5000)

  pollTimer = setInterval(checkPopupAnnouncements, POPUP_POLL_INTERVAL)
})

onUnmounted(() => {
  if (firstCheckTimer) clearTimeout(firstCheckTimer)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.announce-popup-modal :deep(.ant-modal-body) {
  padding: 24px 28px;
}

.announce-popup-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.announce-popup-time {
  font-size: 13px;
  color: var(--console-text-secondary, #667085);
}

.announce-popup-title {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 600;
  color: var(--console-text, #101828);
  line-height: 1.5;
}

.announce-popup-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.8;
  color: var(--console-text, #101828);
  max-height: 300px;
  overflow-y: auto;
}

.announce-popup-link {
  margin-top: 14px;
  font-size: 13px;
  color: var(--console-text-secondary, #667085);
  display: flex;
  align-items: center;
  gap: 4px;
}

.announce-popup-actions {
  margin-top: 24px;
}
</style>
