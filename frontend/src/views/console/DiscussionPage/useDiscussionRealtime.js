import { onBeforeUnmount } from 'vue'
import {
  joinDiscussionRoom,
  reconnectDiscussionSocket,
  subscribeDiscussionSocketStatus,
  subscribeDiscussionSocket
} from '@/services/discussionSocket'

export function useDiscussionRealtime(options) {
  let unsubscribeSocket = null
  let unsubscribeStatus = null

  async function handleSocketMessageCreated(payload = {}) {
    const isOwnMessage = payload.message?.senderId === options.currentUserId()
    const isPageHidden = document.visibilityState !== 'visible'

    if (payload.threadId === options.activeThreadId()) {
      options.upsertMessage(payload.message)
      if (!isPageHidden) {
        await options.markRead(payload.threadId)
      }
    } else if (!isOwnMessage) {
      options.startTitleFlash('收到新讨论')
    }

    if (isPageHidden && !isOwnMessage) {
      options.startTitleFlash('收到新讨论')
    }
    await options.loadThreads()
    if (options.isStorageOpen()) await options.loadStorage()
  }

  async function handleSocketMessageRevoked(payload = {}) {
    if (payload.threadId === options.activeThreadId()) {
      options.upsertMessage(payload.message)
    }
    await options.loadThreads()
    if (options.isStorageOpen()) await options.loadStorage()
  }

  async function handleSocketHistoryPurged(payload = {}) {
    if (!payload.threadId || payload.threadId === options.activeThreadId() || payload.scope === 'all') {
      options.clearMessages()
      await options.loadMessages()
    }
    await options.loadThreads()
    if (options.isStorageOpen()) await options.loadStorage()
  }

  async function handleSocketMessageDeleted(payload = {}) {
    if (payload.threadId === options.activeThreadId()) {
      options.removeMessage(payload.messageId)
    }
    await options.loadThreads()
    if (options.isStorageOpen()) await options.loadStorage()
  }

  async function handleSocketThreadCreated() {
    await options.loadThreads()
    options.startTitleFlash('新增讨论')
  }

  function setupSocket() {
    unsubscribeSocket = subscribeDiscussionSocket({
      'discussion:thread-created': handleSocketThreadCreated,
      'discussion:message-created': handleSocketMessageCreated,
      'discussion:message-revoked': handleSocketMessageRevoked,
      'discussion:message-deleted': handleSocketMessageDeleted,
      'discussion:history-purged': handleSocketHistoryPurged
    })

    const threadId = options.activeThreadId()
    if (threadId) {
      joinDiscussionRoom(threadId)
    }

    unsubscribeStatus = subscribeDiscussionSocketStatus((status) => {
      options.setSocketStatus?.(status)
    })
  }

  onBeforeUnmount(() => {
    unsubscribeSocket?.()
    unsubscribeStatus?.()
  })

  return {
    setupSocket,
    reconnectSocket: reconnectDiscussionSocket
  }
}
