<template>
  <section class="discussion-page">
    <DiscussionList
      :threads="threads"
      :active-id="activeThreadId"
      :loading="threadLoading"
      @select="selectThread"
      @create="createVisible = true"
    />

    <div class="discussion-page__main">
      <template v-if="activeThread">
        <DiscussionConnectionStatus
          :status="socketStatus"
          @reconnect="reconnectSocket"
        />
        <DiscussionMessagePanel
          :thread="activeThread"
          :messages="messages"
          :current-user-id="authStore.user?.id || ''"
          :loading="messageLoading"
          :revoke-window-seconds="config.revokeWindowSeconds || 120"
          @refresh="loadMessages"
          @hide="hideLocalMessage"
          @revoke="revokeMessage"
          @more="openMoreDrawer"
        />
        <DiscussionComposer
          ref="composerRef"
          :config="config"
          :submitting="submitting"
          @send="sendMessage"
        />
      </template>
      <div v-else class="discussion-page__empty">
        <MessageOutlined />
        <strong>选择或新建一个讨论</strong>
        <span>讨论记录用于临时协作，不建议存放长期资料。</span>
      </div>
    </div>

    <DiscussionMembers :members="activeThread?.members || []" />

    <DiscussionCreateModal
      v-model:open="createVisible"
      :users="availableUsers"
      :config="config"
      :submitting="createSubmitting"
      @search-users="loadUsers"
      @submit="submitCreateThread"
    />

    <DiscussionMoreDrawer
      v-model:open="moreDrawerOpen"
      :storage="storage"
      :limit-bytes="threadStorageLimitBytes"
      :clearing="clearingView"
      :purging="purgingThread"
      :purging-all="purgingAll"
      @clear-my-view="confirmClearMyView"
      @purge-thread="confirmPurgeThread"
      @purge-all="confirmPurgeAll"
    />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { MessageOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import './styles.css'
import {
  createDiscussionMessage,
  createDiscussionThread,
  getDiscussionConfig,
  hideDiscussionMessage,
  listDiscussionMessages,
  listDiscussionThreads,
  listDiscussionUsers,
  markDiscussionRead,
  revokeDiscussionMessage,
  uploadDiscussionAttachment
} from '@/services/discussion'
import {
  joinDiscussionRoom
} from '@/services/discussionSocket'
import DiscussionComposer from './components/DiscussionComposer.vue'
import DiscussionConnectionStatus from './components/DiscussionConnectionStatus.vue'
import DiscussionCreateModal from './components/DiscussionCreateModal.vue'
import DiscussionList from './components/DiscussionList.vue'
import DiscussionMembers from './components/DiscussionMembers.vue'
import DiscussionMessagePanel from './components/DiscussionMessagePanel.vue'
import DiscussionMoreDrawer from './components/DiscussionMoreDrawer.vue'
import { useDiscussionStorageActions } from './useDiscussionStorageActions'
import { useDiscussionRealtime } from './useDiscussionRealtime'
import { useTitleFlash } from '@/composables/useTitleFlash'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const config = ref({})
const threads = ref([])
const messages = ref([])
const availableUsers = ref([])
const activeThreadId = ref('')
const threadLoading = ref(false)
const messageLoading = ref(false)
const submitting = ref(false)
const createSubmitting = ref(false)
const createVisible = ref(false)
const composerRef = ref(null)
const socketStatus = ref({
  connected: false,
  connecting: false,
  reconnecting: false,
  manualReconnectRequired: false,
  lastError: '',
  lastReason: '',
  reconnectAttempt: 0
})
let userSearchTimer = null
const { startTitleFlash } = useTitleFlash()

const activeThread = computed(() => {
  return threads.value.find((thread) => thread.id === activeThreadId.value) || null
})

const threadStorageLimitBytes = computed(() => {
  return (Number(config.value.threadStorageSoftLimitMB) || 50) * 1024 * 1024
})

const {
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
} = useDiscussionStorageActions(
  () => activeThreadId.value,
  {
    afterClear: async () => {
      messages.value = []
      await loadThreads({ silent: true })
    },
    afterPurge: async () => {
      messages.value = []
      await loadThreads({ silent: true })
    }
  }
)

const { setupSocket, reconnectSocket } = useDiscussionRealtime({
  activeThreadId: () => activeThreadId.value,
  currentUserId: () => authStore.user?.id,
  isStorageOpen: () => moreDrawerOpen.value,
  upsertMessage,
  removeMessage,
  clearMessages,
  loadMessages,
  loadThreads: () => loadThreads({ silent: true }),
  loadStorage,
  markRead: markDiscussionRead,
  startTitleFlash,
  setSocketStatus: (status) => {
    socketStatus.value = status
  }
})

async function loadConfig() {
  config.value = await getDiscussionConfig()
}

async function loadThreads(options = {}) {
  threadLoading.value = options.silent !== true
  try {
    const result = await listDiscussionThreads()
    threads.value = result?.items || []
    const queryThreadId = String(route.query.threadId || '')
    if (!activeThreadId.value && queryThreadId && threads.value.some((item) => item.id === queryThreadId)) {
      activeThreadId.value = queryThreadId
    }
    if (!activeThreadId.value && threads.value.length) {
      activeThreadId.value = threads.value[0].id
    }
  } catch (error) {
    message.error(error.message || '讨论列表加载失败')
  } finally {
    threadLoading.value = false
  }
}

async function loadMessages() {
  if (!activeThreadId.value) return
  messageLoading.value = true
  try {
    const result = await listDiscussionMessages(activeThreadId.value)
    messages.value = result?.items || []
    await markDiscussionRead(activeThreadId.value)
    await loadThreads({ silent: true })
  } catch (error) {
    message.error(error.message || '讨论内容加载失败')
  } finally {
    messageLoading.value = false
  }
}

function selectThread(id) {
  activeThreadId.value = id
  joinDiscussionRoom(id)
  router.replace({ path: route.path, query: { ...route.query, threadId: id } })
}

async function sendMessage(payload) {
  if (!activeThreadId.value || submitting.value) return
  submitting.value = true
  try {
    let attachment = null
    if (payload?.file) {
      attachment = await uploadDiscussionAttachment(activeThreadId.value, payload.file)
    }
    const content = payload?.content || ''
    const sentMessage = await createDiscussionMessage(activeThreadId.value, {
      content,
      ...(attachment ? { attachment } : {})
    })
    upsertMessage(sentMessage)
    composerRef.value?.resetAfterSent(payload)
    await markDiscussionRead(activeThreadId.value)
    await loadThreads({ silent: true })
    if (moreDrawerOpen.value) await loadStorage()
  } catch (error) {
    message.error(error.message || '发送失败')
  } finally {
    submitting.value = false
  }
}

async function hideLocalMessage(item) {
  if (!activeThreadId.value || !item?.id) return
  try {
    await hideDiscussionMessage(activeThreadId.value, item.id)
    messages.value = messages.value.filter((messageItem) => messageItem.id !== item.id)
    await loadThreads({ silent: true })
    message.success('已从当前记录移除')
  } catch (error) {
    message.error(error.message || '移除失败')
  }
}

async function revokeMessage(item) {
  if (!activeThreadId.value || !item?.id) return
  try {
    const revoked = await revokeDiscussionMessage(activeThreadId.value, item.id)
    upsertMessage(revoked)
    await loadThreads({ silent: true })
    message.success('讨论内容已撤销')
  } catch (error) {
    message.error(error.message || '撤销失败')
  }
}

function upsertMessage(nextMessage) {
  if (!nextMessage?.id) return
  const index = messages.value.findIndex((item) => item.id === nextMessage.id)
  if (index >= 0) {
    messages.value.splice(index, 1, nextMessage)
    return
  }
  messages.value.push(nextMessage)
}

function removeMessage(messageId) {
  messages.value = messages.value.filter((item) => item.id !== messageId)
}

function clearMessages() {
  messages.value = []
}

async function loadUsers(keyword = '') {
  clearTimeout(userSearchTimer)
  userSearchTimer = setTimeout(async () => {
    try {
      availableUsers.value = await listDiscussionUsers({ keyword }) || []
    } catch (error) {
      message.error(error.message || '成员列表加载失败')
    }
  }, keyword ? 260 : 0)
}

async function submitCreateThread(payload) {
  createSubmitting.value = true
  try {
    const thread = await createDiscussionThread(payload)
    createVisible.value = false
    await loadThreads({ silent: true })
    selectThread(thread.id)
    await loadMessages()
    message.success('讨论已创建')
  } catch (error) {
    message.error(error.message || '创建失败')
  } finally {
    createSubmitting.value = false
  }
}

watch(activeThreadId, async (id) => {
  if (!id) {
    messages.value = []
    resetStorage()
    return
  }
  await loadMessages()
  if (moreDrawerOpen.value) await loadStorage()
})

onMounted(async () => {
  await loadConfig()
  await loadThreads()
  if (activeThreadId.value) {
    await loadMessages()
  }
  setupSocket()
})

onBeforeUnmount(() => {
  clearTimeout(userSearchTimer)
})
</script>
