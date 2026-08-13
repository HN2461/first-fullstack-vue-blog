<template>
  <a-modal
    :open="open"
    class="media-upload-modal"
    title="上传资源"
    :confirm-loading="uploading"
    :closable="!uploading"
    :keyboard="!uploading"
    :mask-closable="false"
    :cancel-button-props="{ disabled: uploading }"
    ok-text="上传到媒体库"
    cancel-text="取消"
    centered
    width="520px"
    :body-style="{ maxHeight: '70vh', overflow: 'hidden' }"
    @ok="uploadFiles"
    @cancel="handleCancel"
  >
    <div class="media-upload-modal__scroll">
      <a-alert v-if="errorMessage" class="media-upload-modal__alert" type="error" show-icon :message="errorMessage" />
      <div class="media-upload-modal__context">
        <div>
          <strong>上传规则</strong>
          <span>单次最多 {{ rules.maxFiles }} 个文件，单文件最大 {{ rules.maxFileSizeMB }}MB</span>
        </div>
        <a-tag :bordered="false" color="blue">媒体库</a-tag>
      </div>
      <a-form layout="vertical">
        <a-form-item label="资源分类">
          <a-select
            v-model:value="uploadCategory"
            show-search
            allow-clear
            placeholder="选择资源分类"
            :options="categoryOptions"
            :filter-option="filterSelectOption"
            :disabled="uploading"
          />
        </a-form-item>
        <a-form-item label="选择文件">
          <a-upload-dragger
            multiple
            :before-upload="beforeUpload"
            :show-upload-list="false"
            :accept="uploadAccept"
            :disabled="uploading"
          >
            <p class="ant-upload-drag-icon"><InboxOutlined /></p>
            <p class="ant-upload-text">拖拽文件到这里，或点击选择本地资源</p>
            <p class="ant-upload-hint">
              单次最多 {{ rules.maxFiles }} 个文件，单文件最大 {{ rules.maxFileSizeMB }}MB
            </p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
      <div v-if="files.length" class="media-upload-modal__file-list">
        <div class="media-upload-modal__file-list-header">
          <strong>待上传 {{ files.length }} 个</strong>
          <a-button type="link" size="small" :disabled="uploading" @click="reset">清空</a-button>
        </div>
        <div v-for="(item, index) in files" :key="`${item.name}-${item.size}-${index}`" class="media-upload-modal__file-chip">
          <strong>{{ item.name }}</strong>
          <span>{{ formatTransferSize(item.size) }}</span>
          <a-button type="text" size="small" danger :disabled="uploading" @click="removeSelectedFile(index)">移除</a-button>
        </div>
      </div>
      <TransferProgressPanel
        v-if="uploading || uploadProgress.status !== 'active'"
        title="上传到媒体库"
        :subtitle="`${files.length} 个文件 · ${formatTransferSize(selectedTotalSize)}`"
        :loaded="uploadProgress.loaded"
        :total="uploadProgress.total"
        :percent="uploadProgress.percent"
        :speed="uploadProgress.speed"
        :remaining-seconds="uploadProgress.remainingSeconds"
        :status="uploadProgress.status"
      >
        <template #actions>
          <a-button v-if="uploading" size="small" @click="cancelUpload">取消上传</a-button>
        </template>
      </TransferProgressPanel>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import TransferProgressPanel from '@/components/TransferProgressPanel.vue'
import { uploadAdminMedia } from '@/services/admin'
import { createTransferTracker, formatTransferSize } from '@/utils/transferProgress'
import {
  buildMediaUploadAccept,
  getMediaFileExtension,
  isMediaFileExtensionAllowed
} from './mediaUploadConfig'

const props = defineProps({
  open: { type: Boolean, default: false },
  rules: {
    type: Object,
    default: () => ({ maxFiles: 5, maxFileSizeMB: 20, allowedExtensions: [] })
  },
  categoryOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:open', 'uploaded'])
const files = ref([])
const errorMessage = ref('')
const uploading = ref(false)
const uploadCategory = ref(undefined)
const uploadProgress = ref(createEmptyProgress())
let uploadAbortController = null

const uploadAccept = computed(() => buildMediaUploadAccept(props.rules.allowedExtensions))
const selectedTotalSize = computed(() => files.value.reduce((sum, file) => sum + (file.size || 0), 0))

function createEmptyProgress() {
  return { loaded: 0, total: 0, percent: 0, speed: 0, remainingSeconds: 0, status: 'active' }
}

function filterSelectOption(input, option) {
  const keyword = String(input || '').trim().toLowerCase()
  return !keyword || String(option?.label || '').toLowerCase().includes(keyword)
}

function beforeUpload(nextFile) {
  if (files.value.length >= props.rules.maxFiles) {
    errorMessage.value = `单次最多选择 ${props.rules.maxFiles} 个文件`
    return false
  }
  if ((nextFile.size || 0) > props.rules.maxFileSizeMB * 1024 * 1024) {
    errorMessage.value = `单文件大小不能超过 ${props.rules.maxFileSizeMB}MB`
    return false
  }
  if (!isMediaFileExtensionAllowed(nextFile.name, props.rules.allowedExtensions)) {
    errorMessage.value = `当前上传限制不支持 ${getMediaFileExtension(nextFile.name) || '无扩展名'} 文件`
    return false
  }
  errorMessage.value = ''
  files.value.push(nextFile)
  return false
}

function removeSelectedFile(index) {
  files.value.splice(index, 1)
}

function reset() {
  if (uploading.value) return
  files.value = []
  errorMessage.value = ''
  uploadProgress.value = createEmptyProgress()
}

function handleCancel() {
  reset()
  emit('update:open', false)
}

function cancelUpload() {
  uploadAbortController?.abort()
}

async function uploadFiles() {
  if (files.value.length === 0) {
    errorMessage.value = '请选择要上传的资源文件'
    return
  }

  const uploadCount = files.value.length
  errorMessage.value = ''
  uploading.value = true
  uploadAbortController = new AbortController()
  uploadProgress.value = { ...createEmptyProgress(), total: selectedTotalSize.value }
  const updateProgress = createTransferTracker((next) => {
    uploadProgress.value = { ...next, status: 'active' }
  })

  try {
    const selectedCategory = props.categoryOptions.find((item) => item.value === uploadCategory.value)
    await uploadAdminMedia(files.value, {
      category: selectedCategory?.name || '默认素材',
      categoryId: selectedCategory?.value,
      signal: uploadAbortController.signal,
      onUploadProgress: (event) => updateProgress(event.loaded, event.total || uploadProgress.value.total)
    })
    message.success(`已上传 ${uploadCount} 个资源`)
    uploadProgress.value = { ...uploadProgress.value, loaded: uploadProgress.value.total, percent: 100, status: 'success' }
    resetAfterSuccess()
    emit('update:open', false)
    emit('uploaded')
  } catch (error) {
    if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      errorMessage.value = '上传已取消'
      uploadProgress.value = { ...uploadProgress.value, status: 'cancelled' }
    } else {
      errorMessage.value = error.message || '上传失败'
      uploadProgress.value = { ...uploadProgress.value, status: 'error' }
      message.error(errorMessage.value)
    }
  } finally {
    uploading.value = false
    uploadAbortController = null
  }
}

function resetAfterSuccess() {
  files.value = []
  errorMessage.value = ''
  uploadProgress.value = createEmptyProgress()
}

function ensureDefaultCategory() {
  if (props.categoryOptions.some((item) => item.value === uploadCategory.value)) return
  uploadCategory.value = props.categoryOptions.find((item) => item.name === '默认素材')?.value
}

watch(() => props.categoryOptions, ensureDefaultCategory, { immediate: true, deep: true })

defineExpose({ reset })
</script>

<style scoped>
.media-upload-modal__scroll { max-height: min(60vh, 520px); overflow-y: auto; padding-right: 2px; scrollbar-width: none; }
.media-upload-modal__scroll::-webkit-scrollbar { display: none; }
.media-upload-modal__alert { margin-bottom: 12px; }
.media-upload-modal__context { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; padding: 12px 14px; border: 1px solid var(--console-border); border-radius: 8px; background: var(--console-surface-muted); }
.media-upload-modal__context > div { display: grid; gap: 3px; min-width: 0; }
.media-upload-modal__context strong { color: var(--console-text); font-size: 14px; font-weight: 600; }
.media-upload-modal__context span { color: var(--console-text-secondary); font-size: 12px; line-height: 1.6; }
.media-upload-modal__file-list { display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; padding-top: 4px; }
.media-upload-modal__file-list-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 2px; }
.media-upload-modal__file-list-header strong { color: var(--console-text); font-size: 13px; font-weight: 600; }
.media-upload-modal__file-chip { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid var(--console-border); border-radius: 8px; background: var(--console-surface-muted); }
.media-upload-modal__file-chip strong { flex: 1; min-width: 0; overflow: hidden; color: var(--console-text); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.media-upload-modal__file-chip span { color: var(--console-text-secondary); font-size: 12px; white-space: nowrap; }
</style>
