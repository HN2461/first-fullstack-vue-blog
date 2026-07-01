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
            <a-avatar :src="item.senderAvatar || ''">{{ getInitial(getSenderName(item)) }}</a-avatar>
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
                      <img v-if="attachment.mimeType?.startsWith('image/')" :src="attachment.url" :alt="attachment.originalName">
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

    <a-modal
      :open="!!previewAttachment"
      :title="previewAttachment?.originalName || '附件预览'"
      :footer="null"
      :width="previewModalWidth"
      centered
      :destroy-on-close="true"
      :body-style="previewModalBodyStyle"
      wrap-class-name="discussion-attachment-modal"
      @cancel="closeAttachmentPreview"
    >
      <div v-if="previewAttachment" class="discussion-attachment-preview">
        <div class="discussion-attachment-preview__toolbar">
          <div class="discussion-attachment-preview__toolbar-text">
            <strong>{{ getAttachmentTypeLabel(previewAttachment) }}</strong>
            <span>{{ formatSize(previewAttachment.size) }}</span>
          </div>
          <a-space :size="8">
            <a-radio-group
              v-if="previewAttachmentType === 'image'"
              v-model:value="previewImageMode"
              button-style="solid"
              size="small"
            >
              <a-radio-button value="actual">原始尺寸</a-radio-button>
              <a-radio-button value="fit">适应窗口</a-radio-button>
            </a-radio-group>
            <a-button :href="getAttachmentOpenUrl(previewAttachment)" target="_blank" rel="noopener noreferrer">
              新页面打开
            </a-button>
            <a-button :href="getAttachmentOpenUrl(previewAttachment)" download target="_blank" rel="noopener noreferrer">
              下载
            </a-button>
          </a-space>
        </div>
        <div
          v-if="previewAttachmentType === 'image'"
          :class="[
            'discussion-attachment-preview__image',
            `discussion-attachment-preview__image--${previewImageMode}`
          ]"
        >
          <img :src="previewAttachment.url" :alt="previewAttachment.originalName">
        </div>
        <div v-else-if="previewAttachmentType === 'video'" class="discussion-attachment-preview__video">
          <video :src="previewAttachment.url" controls preload="metadata" class="discussion-attachment-preview__player">
            您的浏览器不支持视频播放
          </video>
        </div>
        <div v-else-if="previewAttachmentType === 'audio'" class="discussion-attachment-preview__audio">
          <PaperClipOutlined />
          <strong>{{ previewAttachment.originalName }}</strong>
          <audio :src="previewAttachment.url" controls preload="metadata" class="discussion-attachment-preview__player">
            您的浏览器不支持音频播放
          </audio>
        </div>
        <div v-else-if="previewAttachmentType === 'pdf'" class="discussion-attachment-preview__frame">
          <iframe :src="getAttachmentOpenUrl(previewAttachment)" title="PDF 预览" />
        </div>
        <div v-else-if="previewAttachmentType === 'office'" class="discussion-attachment-preview__frame">
          <iframe
            v-if="officePreviewAvailable && !officeLoadError"
            :key="officeViewerKey"
            :src="officeViewerUrl"
            title="文档预览"
            @load="onOfficeViewerLoad"
            @error="onOfficeViewerError"
          />
          <div v-else class="discussion-attachment-preview__file">
            <PaperClipOutlined />
            <strong>{{ previewAttachment.originalName }}</strong>
            <span>{{ officePreviewTip }}</span>
            <small>{{ formatSize(previewAttachment.size) }}</small>
            <a-button v-if="officePreviewAvailable" :loading="officeRetrying" @click="retryOfficeViewer">
              重试预览
            </a-button>
          </div>
        </div>
        <div v-else-if="previewAttachmentType === 'text'" class="discussion-attachment-preview__text">
          <a-spin :spinning="textLoading" tip="加载内容中...">
            <pre><code>{{ textContent }}</code></pre>
          </a-spin>
        </div>
        <div v-else class="discussion-attachment-preview__file">
          <PaperClipOutlined />
          <strong>{{ previewAttachment.originalName }}</strong>
          <span>{{ previewAttachment.mimeType }}</span>
          <small>{{ formatSize(previewAttachment.size) }}</small>
          <p>此文件类型暂不支持在线预览，请在新页面打开或下载后查看。</p>
        </div>
      </div>
    </a-modal>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { MessageOutlined, MoreOutlined, PaperClipOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import {
  canUseOfficeOnlinePreview,
  getAttachmentOpenUrl,
  getAttachmentPreviewType,
  getAttachmentTypeLabel
} from '../utils/attachmentPreview'

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
const previewImageMode = ref('actual')
const textContent = ref('')
const textLoading = ref(false)
const officeLoadError = ref(false)
const officeRetrying = ref(false)
const officeViewerKey = ref(0)
let officeFallbackTimer = null

const showSenderName = computed(() => props.thread?.type === 'group')
const previewAttachmentType = computed(() => previewAttachment.value ? getAttachmentPreviewType(previewAttachment.value) : 'other')
const previewModalWidth = computed(() => {
  if (previewAttachmentType.value === 'image') return 'min(96vw, 1200px)'
  if (['video', 'pdf', 'office', 'text'].includes(previewAttachmentType.value)) return 'min(92vw, 900px)'
  return '560px'
})
const previewModalBodyStyle = computed(() => {
  if (['image', 'video', 'pdf', 'office', 'text'].includes(previewAttachmentType.value)) {
    return { maxHeight: '78vh', overflow: 'hidden' }
  }
  return { maxHeight: '78vh', overflowY: 'auto' }
})
const officeViewerUrl = computed(() => {
  if (!previewAttachment.value?.url) return ''
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(getAttachmentOpenUrl(previewAttachment.value))}`
})
const officePreviewAvailable = computed(() => {
  const openUrl = getAttachmentOpenUrl(previewAttachment.value || {})
  return canUseOfficeOnlinePreview(openUrl)
})
const officePreviewTip = computed(() => {
  if (officePreviewAvailable.value) {
    return '在线文档预览暂不可用，可能是预览服务无法读取该文件。'
  }
  return '当前文件地址是本地、内网或 IP 地址，Office 在线预览服务无法访问。'
})

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

function clearOfficeFallbackTimer() {
  if (officeFallbackTimer) {
    clearTimeout(officeFallbackTimer)
    officeFallbackTimer = null
  }
}

function armOfficeFallbackTimer() {
  clearOfficeFallbackTimer()
  officeFallbackTimer = setTimeout(() => {
    if (previewAttachment.value && previewAttachmentType.value === 'office') {
      officeLoadError.value = true
    }
  }, 8000)
}

async function loadTextAttachment(attachment) {
  textContent.value = ''
  textLoading.value = true
  try {
    const response = await fetch(attachment.url)
    textContent.value = response.ok ? await response.text() : `无法加载文件内容（HTTP ${response.status}）`
  } catch {
    textContent.value = '加载文件内容失败，请尝试下载后查看'
  } finally {
    textLoading.value = false
  }
}

async function openAttachmentPreview(attachment) {
  previewAttachment.value = attachment
  previewImageMode.value = attachment?.mimeType?.startsWith('image/') ? 'actual' : 'fit'
  textContent.value = ''
  officeLoadError.value = false
  officeRetrying.value = false
  clearOfficeFallbackTimer()

  const previewType = getAttachmentPreviewType(attachment)
  if (previewType === 'text') {
    await loadTextAttachment(attachment)
  }
  if (previewType === 'office') {
    if (officePreviewAvailable.value) {
      officeViewerKey.value += 1
      armOfficeFallbackTimer()
    } else {
      officeLoadError.value = true
    }
  }
}

function closeAttachmentPreview() {
  previewAttachment.value = null
  previewImageMode.value = 'actual'
  textContent.value = ''
  officeLoadError.value = false
  officeRetrying.value = false
  clearOfficeFallbackTimer()
}

function onOfficeViewerLoad() {
  clearOfficeFallbackTimer()
}

function onOfficeViewerError() {
  clearOfficeFallbackTimer()
  officeLoadError.value = true
}

function retryOfficeViewer() {
  officeRetrying.value = true
  officeLoadError.value = false
  officeViewerKey.value += 1
  armOfficeFallbackTimer()
  setTimeout(() => {
    officeRetrying.value = false
  }, 2000)
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

onBeforeUnmount(() => {
  clearOfficeFallbackTimer()
})
</script>
