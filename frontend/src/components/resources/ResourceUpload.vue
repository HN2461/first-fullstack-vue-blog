<template>
  <div class="resource-upload" @paste="handlePaste">
    <a-upload :show-upload-list="false" :multiple="multiple" :accept="accept" :disabled="disabled || uploading" :before-upload="beforeUpload">
      <slot :uploading="uploading"><a-button :loading="uploading" :disabled="disabled">{{ buttonText }}</a-button></slot>
    </a-upload>
    <div v-if="uploading" class="resource-upload__progress">
      <a-progress :percent="percent" size="small" />
      <small>{{ formatTransferSize(progress.loaded) }} / {{ formatTransferSize(progress.total) }} · {{ formatTransferSpeed(progress.speed) }} · 剩余{{ formatRemainingTime(progress.remainingSeconds) }}</small>
      <a-button size="small" @click="cancelUpload">取消上传</a-button>
    </div>
    <div v-if="showList" class="resource-upload__files">
      <div v-for="item in modelValue" :key="item.mediaId || item.id" class="resource-upload__file">
        <span>{{ item.originalName }}</span>
        <a-tooltip title="移除此处选择"><a-button type="text" size="small" aria-label="移除文件" @click="remove(item)">×</a-button></a-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { message, Upload } from 'ant-design-vue'
import { uploadResource } from '@/services/resources'
import { createTransferTracker, formatTransferSize, formatTransferSpeed, formatRemainingTime } from '@/utils/transferProgress'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  scene: { type: String, required: true },
  targetId: { type: String, default: '' },
  multiple: { type: Boolean, default: false },
  maxCount: { type: Number, default: 1 },
  accept: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  showList: { type: Boolean, default: true },
  buttonText: { type: String, default: '上传文件' }
})
const emit = defineEmits(['update:modelValue', 'uploaded', 'error'])
const uploading = ref(false)
const percent = ref(0)
const progress = ref({ loaded: 0, total: 0, speed: 0, remainingSeconds: 0 })
let controller
let queue = Promise.resolve()
let disposed = false
let batchRevision = 0

function beforeUpload(file) {
  // 同一批文件顺序上传，防止各请求覆盖同一个表单值。
  const revision = batchRevision
  queue = queue.then(() => revision === batchRevision ? send(file) : undefined)
  return Upload.LIST_IGNORE
}

function cancelUpload() {
  // 取消当前选择的整批文件，避免取消一个后队列自动继续上传下一个。
  batchRevision += 1
  controller?.abort()
}

async function send(file) {
  if (props.disabled || disposed) return
  if (props.multiple && props.modelValue.length >= props.maxCount) return message.warning(`最多选择 ${props.maxCount} 个文件`)
  controller = new AbortController()
  uploading.value = true
  percent.value = 0
  progress.value = { loaded: 0, total: file.size, speed: 0, remainingSeconds: 0 }
  const track = createTransferTracker((value) => { progress.value = value })
  try {
    const result = await uploadResource(file, {
      scene: props.scene, targetId: props.targetId, signal: controller.signal,
      onProgress: (event) => {
        track(event.loaded, event.total || file.size)
        percent.value = Math.min(99, progress.value.percent || 0)
      }
    })
    percent.value = 100
    emit('update:modelValue', props.multiple ? [...props.modelValue, result] : [result])
    emit('uploaded', result)
    await nextTick()
  } catch (error) {
    if (!controller.signal.aborted) {
      message.error(error.message || '文件上传失败')
      emit('error', error)
    }
  } finally {
    uploading.value = false
  }
}

function remove(item) {
  emit('update:modelValue', props.modelValue.filter((entry) => entry !== item))
}

function handlePaste(event) {
  if (props.disabled || uploading.value) return
  const files = [...(event.clipboardData?.files || [])]
  if (!files.length) return
  event.preventDefault()
  for (const file of props.multiple ? files : files.slice(0, 1)) beforeUpload(file)
}

onBeforeUnmount(() => {
  disposed = true
  cancelUpload()
})
</script>

<style scoped>
.resource-upload { min-width: 0; }
.resource-upload__files { display: grid; gap: 4px; margin-top: 8px; }
.resource-upload__file { display: flex; align-items: center; gap: 8px; }
.resource-upload__file span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
