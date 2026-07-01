import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  disconnectDiscussionSocket,
  reconnectDiscussionSocket,
  subscribeDiscussionSocket
} from '@/services/discussionSocket'
import { useAuthStore } from '@/stores/auth'
import { useTitleFlash } from '@/composables/useTitleFlash'

const messages = ref([])
const unreadCount = computed(() => messages.value.length)
let unsubscribeSocket = null
let subscriberCount = 0
let activeAuthStore = null
let activeTitleFlash = null
let activeRoute = null
let stopAuthWatch = null

function getSnippet(text, maxLength = 80) {
  if (!text) return ''
  const normalized = text.replace(/\n/g, ' ')
  const snippet = normalized.slice(0, maxLength)
  return normalized.length > maxLength ? snippet + '…' : snippet
}

function getMessagePreview(messageData = {}) {
  if (messageData.content) return getSnippet(messageData.content)
  const attachment = messageData.attachments?.[0]
  if (!attachment) return '收到一条新讨论'
  if (attachment.mimeType?.startsWith('image/')) return '收到一张图片'
  return `收到附件：${attachment.originalName || '未命名文件'}`
}

function pushMessage(payload = {}) {
  const messageData = payload.message || {}
  if (!messageData.id || messageData.senderId === activeAuthStore?.user?.id) return
  const threadId = payload.threadId || messageData.threadId
  const isViewingThread = activeRoute?.path === '/console/discussions' &&
    String(activeRoute?.query?.threadId || '') === String(threadId || '') &&
    document.visibilityState === 'visible'
  if (isViewingThread) return

  const nextItem = {
    id: messageData.id,
    threadId,
    title: messageData.senderName || messageData.senderEmail || '项目讨论',
    content: getMessagePreview(messageData),
    createdAt: messageData.createdAt || new Date().toISOString()
  }

  messages.value = [
    nextItem,
    ...messages.value.filter((item) => item.id !== nextItem.id)
  ].slice(0, 20)
  activeTitleFlash?.('收到新消息')
}

function pushPurgeNotice(payload = {}) {
  const title = payload.scope === 'all' ? '讨论历史已统一清理' : '当前讨论历史已清理'
  messages.value = [{
    id: `purged-${payload.threadId || 'all'}-${Date.now()}`,
    threadId: payload.threadId || '',
    title,
    content: '因服务器存储清理，部分讨论历史已不可查看。',
    createdAt: new Date().toISOString()
  }, ...messages.value].slice(0, 20)
}

function setupSocket() {
  if (unsubscribeSocket ||
    !activeAuthStore?.isLoggedIn ||
    !activeAuthStore.canAccessPath('/console/discussions')) return

  unsubscribeSocket = subscribeDiscussionSocket({
    'discussion:message-created': pushMessage,
    'discussion:history-purged': pushPurgeNotice
  })
  reconnectDiscussionSocket()
}

function teardownSocket() {
  clearMessages()
  unsubscribeSocket?.()
  unsubscribeSocket = null
  disconnectDiscussionSocket()
}

function clearMessages() {
  messages.value = []
}

export function useDiscussionNotifications() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const { startTitleFlash } = useTitleFlash()
  activeAuthStore = authStore
  activeTitleFlash = startTitleFlash
  activeRoute = route
  subscriberCount += 1

  if (!stopAuthWatch) {
    stopAuthWatch = watch(() => ({
      logged: authStore.isLoggedIn,
      canDiscuss: authStore.canAccessPath('/console/discussions')
    }), ({ logged, canDiscuss }) => {
      if (logged && canDiscuss) {
        setupSocket()
        return
      }
      teardownSocket()
    }, { immediate: true })
  }

  function openMessage(item) {
    router.push({
      path: '/console/discussions',
      query: item?.threadId ? { threadId: item.threadId } : {}
    })
  }

  function openDiscussions() {
    router.push('/console/discussions')
  }

  onUnmounted(() => {
    subscriberCount = Math.max(0, subscriberCount - 1)
    if (subscriberCount > 0) return
    stopAuthWatch?.()
    stopAuthWatch = null
    teardownSocket()
  })

  return {
    messages,
    unreadCount,
    clearMessages,
    openMessage,
    openDiscussions,
    setupSocket
  }
}
