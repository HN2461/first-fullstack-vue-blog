import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  disconnectDiscussionSocket,
  subscribeDiscussionSocket
} from '@/services/discussionSocket'
import { useAuthStore } from '@/stores/auth'
import { useTitleFlash } from '@/composables/useTitleFlash'

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

export function useDiscussionNotifications() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { startTitleFlash } = useTitleFlash()
  const messages = ref([])
  let unsubscribeSocket = null

  const unreadCount = computed(() => messages.value.length)

  function pushMessage(payload = {}) {
    const messageData = payload.message || {}
    if (!messageData.id || messageData.senderId === authStore.user?.id) return

    const nextItem = {
      id: messageData.id,
      threadId: payload.threadId || messageData.threadId,
      title: messageData.senderName || messageData.senderEmail || '项目讨论',
      content: getMessagePreview(messageData),
      createdAt: messageData.createdAt || new Date().toISOString()
    }

    messages.value = [
      nextItem,
      ...messages.value.filter((item) => item.id !== nextItem.id)
    ].slice(0, 20)
    startTitleFlash('收到新消息')
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
    if (unsubscribeSocket || !authStore.isLoggedIn || !authStore.canAccessPath('/console/discussions')) return
    unsubscribeSocket = subscribeDiscussionSocket({
      'discussion:message-created': pushMessage,
      'discussion:history-purged': pushPurgeNotice
    })
  }

  function clearMessages() {
    messages.value = []
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

  watch(() => authStore.isLoggedIn, (logged) => {
    if (logged) {
      setupSocket()
      return
    }
    clearMessages()
    unsubscribeSocket?.()
    unsubscribeSocket = null
    disconnectDiscussionSocket()
  }, { immediate: true })

  onUnmounted(() => {
    unsubscribeSocket?.()
    unsubscribeSocket = null
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
