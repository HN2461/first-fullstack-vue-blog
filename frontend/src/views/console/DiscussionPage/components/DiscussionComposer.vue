<template>
  <footer class="discussion-composer">
    <div class="discussion-composer__note">
      每位用户仅保留最近 {{ config.messageLimitPerUser || 300 }} 条消息；单文件最大 {{ config.attachmentMaxFileSizeMB || 5 }}MB。
    </div>
    <div class="discussion-composer__input">
      <div class="discussion-composer__box">
        <div v-if="pendingFile" class="discussion-composer__preview">
          <template v-if="isPendingImage">
            <img :src="pendingPreviewUrl" alt="待发送图片">
          </template>
          <template v-else>
            <PaperClipOutlined />
            <span>{{ pendingFile.name }}</span>
            <small>{{ formatSize(pendingFile.size) }}</small>
          </template>
          <a-button size="small" type="text" :disabled="submitting" @click="clearPendingFile">移除</a-button>
        </div>
        <a-textarea
          v-model:value="content"
          :maxlength="config.messageMaxLength || 2000"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          :disabled="submitting"
          placeholder="提交讨论内容，或直接粘贴截图"
          @keydown.enter.exact.prevent="submit"
          @paste="handlePaste"
        />
      </div>
      <input ref="fileInputRef" class="discussion-composer__file-input" type="file" :disabled="submitting" @change="handleFileChange">
      <a-tooltip title="上传附件">
        <a-button :disabled="submitting" @click="fileInputRef?.click()">
          <template #icon><PaperClipOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-tooltip title="发送">
        <a-button type="primary" :loading="submitting" :disabled="!content.trim() && !pendingFile" @click="submit">
          <template #icon><SendOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>
  </footer>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { message } from 'ant-design-vue'
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])
const content = ref('')
const pendingFile = ref(null)
const pendingPreviewUrl = ref('')
const fileInputRef = ref(null)
let sendSnapshot = null

const isPendingImage = computed(() => pendingFile.value?.type?.startsWith('image/'))

function validateFile(file) {
  const maxSize = (Number(props.config.attachmentMaxFileSizeMB) || 5) * 1024 * 1024
  if (file.size > maxSize) {
    message.warning(`单文件大小不能超过 ${props.config.attachmentMaxFileSizeMB || 5}MB`)
    return false
  }
  return true
}

function setPendingFile(file) {
  if (!file || !validateFile(file)) return
  clearPreviewUrl()
  pendingFile.value = file
  if (file.type.startsWith('image/')) {
    pendingPreviewUrl.value = URL.createObjectURL(file)
  }
}

function handleFileChange(event) {
  setPendingFile(event.target.files?.[0])
  event.target.value = ''
}

function handlePaste(event) {
  const files = Array.from(event.clipboardData?.files || [])
  const image = files.find((file) => file.type.startsWith('image/'))
  if (!image) return
  event.preventDefault()
  setPendingFile(image)
}

function submit() {
  const text = content.value.trim()
  if (!text && !pendingFile.value) return
  sendSnapshot = {
    content: text,
    file: pendingFile.value
  }
  emit('send', sendSnapshot)
}

function resetAfterSent(payload) {
  if (payload && sendSnapshot && payload !== sendSnapshot) return
  content.value = ''
  clearPendingFile()
  sendSnapshot = null
}

function clearPreviewUrl() {
  if (pendingPreviewUrl.value) {
    URL.revokeObjectURL(pendingPreviewUrl.value)
    pendingPreviewUrl.value = ''
  }
}

function clearPendingFile() {
  pendingFile.value = null
  clearPreviewUrl()
}

function formatSize(size = 0) {
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

onBeforeUnmount(clearPreviewUrl)

defineExpose({
  resetAfterSent
})
</script>
