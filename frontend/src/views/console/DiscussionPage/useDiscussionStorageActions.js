import { ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  clearDiscussionThreadForMe,
  getDiscussionStorage,
  purgeAllDiscussionMessages,
  purgeDiscussionThread
} from '@/services/discussion'

export function useDiscussionStorageActions(getThreadId, callbacks = {}) {
  const moreDrawerOpen = ref(false)
  const storage = ref(null)
  const clearingView = ref(false)
  const purgingThread = ref(false)
  const purgingAll = ref(false)

  async function loadStorage() {
    const threadId = getThreadId()
    if (!threadId) return
    try {
      storage.value = await getDiscussionStorage(threadId)
    } catch (error) {
      message.error(error.message || '存储统计加载失败')
    }
  }

  async function openMoreDrawer() {
    moreDrawerOpen.value = true
    await loadStorage()
  }

  function resetStorage() {
    storage.value = null
  }

  function confirmClearMyView() {
    Modal.confirm({
      title: '清除我的当前会话记录',
      content: '该操作只会让你不再看到当前会话已有记录，不会删除服务器文件，也不会影响其他成员。',
      okText: '清除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        clearingView.value = true
        try {
          await clearDiscussionThreadForMe(getThreadId())
          await callbacks.afterClear?.()
          await loadStorage()
          message.success('当前会话记录已从你的视图清除')
        } catch (error) {
          message.error(error.message || '清除失败')
        } finally {
          clearingView.value = false
        }
      }
    })
  }

  function confirmPurgeThread() {
    Modal.confirm({
      title: '清理当前会话服务器记录',
      content: '该操作会删除当前会话消息和附件文件，所有成员都将无法继续查看这些历史内容，并收到清理通知。',
      okText: '清理',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        purgingThread.value = true
        try {
          await purgeDiscussionThread(getThreadId())
          await callbacks.afterPurge?.()
          await loadStorage()
          message.success('当前会话服务器记录已清理')
        } catch (error) {
          message.error(error.message || '清理失败')
        } finally {
          purgingThread.value = false
        }
      }
    })
  }

  function confirmPurgeAll() {
    Modal.confirm({
      title: '清理全部讨论历史',
      content: '该操作会删除全部讨论消息和附件文件，所有成员都将无法继续查看历史内容，并收到服务器空间清理通知。',
      okText: '全部清理',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        purgingAll.value = true
        try {
          await purgeAllDiscussionMessages()
          await callbacks.afterPurge?.()
          await loadStorage()
          message.success('全部讨论历史已清理')
        } catch (error) {
          message.error(error.message || '清理失败')
        } finally {
          purgingAll.value = false
        }
      }
    })
  }

  return {
    moreDrawerOpen,
    storage,
    clearingView,
    purgingThread,
    purgingAll,
    loadStorage,
    openMoreDrawer,
    resetStorage,
    confirmClearMyView,
    confirmPurgeThread,
    confirmPurgeAll
  }
}
