<template>
  <main class="discussion-message-panel">
    <div class="discussion-message-panel__head">
      <div>
        <strong>{{ thread?.title || '项目讨论' }}</strong>
        <small>{{ thread?.type === 'group' ? '小组讨论' : '双人讨论' }}</small>
      </div>
      <div class="discussion-message-panel__actions">
        <a-tooltip title="刷新内容">
          <a-button :loading="loading" @click="$emit('refresh')">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="更多">
          <a-button @click="$emit('more')">
            <template #icon><MoreOutlined /></template>
          </a-button>
        </a-tooltip>
      </div>
    </div>

    <a-spin :spinning="loading">
      <div ref="messageBodyRef" class="discussion-message-panel__body">
        <div v-if="messages.length" class="discussion-message-panel__stream">
          <article
            v-for="item in messages"
            :key="item.id"
            :class="['discussion-message', { mine: item.senderId === currentUserId }]"
          >
            <a-avatar :src="getUserAvatar({ avatar: item.senderAvatar, gender: item.senderGender })">{{ getInitial(getSenderName(item)) }}</a-avatar>
            <div class="discussion-message__stack">
              <div v-if="showSenderName" class="discussion-message__sender">
                {{ getSenderName(item) }}
              </div>
              <div class="discussion-message__content">
                <div class="discussion-message__meta">
                  <time>{{ formatTime(item.createdAt) }}</time>
                </div>
                <p v-if="item.revokedAt" class="discussion-message__revoked">内容已撤销</p>
                <template v-else>
                  <p v-if="item.content">{{ item.content }}</p>
                  <div v-if="item.attachments?.length" class="discussion-message__attachments">
                    <button
                      v-for="attachment in item.attachments"
                      :key="attachment.url"
                      :class="['discussion-attachment', { image: attachment.mimeType?.startsWith('image/') }]"
                      type="button"
                      @click="openAttachmentPreview(attachment)"
                    >
                      <ResourceImage v-if="attachment.mimeType?.startsWith('image/')" :src="attachment.url" :alt="attachment.originalName" />
                      <span v-else><PaperClipOutlined /> {{ attachment.originalName }}</span>
                      <small v-if="!attachment.mimeType?.startsWith('image/')">{{ formatSize(attachment.size) }}</small>
                    </button>
                  </div>
                </template>
                <a-dropdown v-if="item.senderId === currentUserId" :trigger="['click']">
                  <button class="discussion-message__more" type="button" aria-label="消息操作" @click.prevent>
                    <MoreOutlined />
                  </button>
                  <template #overlay>
                    <a-menu @click="(payload) => handleMessageAction(payload.key, item)">
                      <a-menu-item v-if="canRevoke(item)" key="revoke">撤销</a-menu-item>
                      <a-menu-item key="hide">仅删除本地记录</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="discussion-message-panel__empty">
          <MessageOutlined />
          <span>暂无讨论内容</span>
        </div>
      </div>
    </a-spin>

    <ResourcePreview :open="!!previewAttachment" :resource="previewAttachment" @update:open="closeAttachmentPreview" />
  </main>
</template>

<script setup>
import ResourceImage from '@/components/resources/ResourceImage.vue'
import ResourcePreview from '@/components/resources/ResourcePreview.vue'
import { computed, nextTick, ref, watch } from 'vue'
import { MessageOutlined, MoreOutlined, PaperClipOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getUserAvatar } from '@/utils/avatar'


const props = defineProps({
  thread: {
    type: Object,
    default: null
  },
  messages: {
    type: Array,
    default: () => []
  },
  currentUserId: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  revokeWindowSeconds: {
    type: Number,
    default: 120
  }
})

const emit = defineEmits(['refresh', 'hide', 'revoke', 'more'])

const messageBodyRef = ref(null)
const previewAttachment = ref(null)
const showSenderName = computed(() => props.thread?.type === 'group')

function getInitial(value = '') {
  return (value || 'U').slice(0, 1).toUpperCase()
}

function getSenderName(item = {}) {
  return item.senderName || item.senderEmail || '成员'
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (num) => String(num).padStart(2, '0')
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatSize(size = 0) {
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

function openAttachmentPreview(attachment) {
  previewAttachment.value = attachment
}

function closeAttachmentPreview() {
  previewAttachment.value = null
}

function canRevoke(item) {
  if (item.revokedAt) return false
  const createdAt = new Date(item.createdAt).getTime()
  return Number.isFinite(createdAt) && Date.now() - createdAt <= props.revokeWindowSeconds * 1000
}

function handleMessageAction(key, item) {
  if (key === 'revoke') {
    emit('revoke', item)
    return
  }
  if (key === 'hide') {
    emit('hide', item)
  }
}

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (messageBodyRef.value) {
      messageBodyRef.value.scrollTop = messageBodyRef.value.scrollHeight
    }
  }
)

</script>
