<template>
  <a-modal
    :open="open"
    title="上传限制"
    :confirm-loading="submitting"
    ok-text="保存限制"
    cancel-text="取消"
    centered
    width="640px"
    :body-style="{ maxHeight: '72vh', overflowY: 'auto' }"
    @update:open="emit('update:open', $event)"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-alert
      class="media-upload-settings__alert"
      type="warning"
      show-icon
      message="线上 Nginx 的 client_max_body_size 需要不小于这里的容量，否则大文件会在进入后端前返回 413。"
    />

    <a-form layout="vertical">
      <a-form-item label="单次最大上传文件数量">
        <a-input-number
          v-model:value="draft.mediaMaxFilesPerUpload"
          :min="1"
          :max="20"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="单文件上传最大容量（MB）">
        <a-input-number
          v-model:value="draft.mediaMaxFileSizeMB"
          :min="1"
          :max="200"
          style="width: 100%"
        />
        <div class="media-upload-settings__note">
          当前应用层最高 200MB；部署模板将网关上限预留为 220MB，适配 multipart 上传开销。
        </div>
      </a-form-item>

      <a-form-item label="允许上传的文件扩展名">
        <div class="media-upload-settings__toolbar">
          <a-button size="small" @click="selectAllExtensions">全选</a-button>
          <a-button size="small" @click="selectCoreExtensions">仅常用资源</a-button>
        </div>

        <div class="media-upload-settings__groups">
          <section
            v-for="group in MEDIA_EXTENSION_GROUPS"
            :key="group.key"
            class="media-upload-settings__group"
          >
            <div class="media-upload-settings__group-title">
              <span>{{ group.label }}</span>
              <a-checkbox
                :checked="isGroupSelected(group)"
                :indeterminate="isGroupIndeterminate(group)"
                @change="toggleGroup(group, $event.target.checked)"
              >
                整组
              </a-checkbox>
            </div>
            <div class="media-upload-settings__extension-list">
              <a-checkbox
                v-for="extension in group.extensions"
                :key="extension"
                :checked="draft.mediaAllowedExtensions.includes(extension)"
                @change="toggleExtension(extension, $event.target.checked)"
              >
                {{ extension }}
              </a-checkbox>
            </div>
          </section>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, watch } from 'vue'
import {
  DEFAULT_MEDIA_ALLOWED_EXTENSIONS,
  MEDIA_EXTENSION_GROUPS,
  normalizeAllowedMediaExtensions
} from './mediaUploadConfig'

const CORE_EXTENSION_GROUPS = new Set(['image', 'document', 'code', 'archive', 'media'])

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  value: {
    type: Object,
    required: true
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'submit'])

const draft = reactive({
  mediaMaxFilesPerUpload: 5,
  mediaMaxFileSizeMB: 20,
  mediaAllowedExtensions: [...DEFAULT_MEDIA_ALLOWED_EXTENSIONS]
})

watch(
  () => [props.open, props.value],
  ([visible]) => {
    if (!visible) return
    draft.mediaMaxFilesPerUpload = Number(props.value?.mediaMaxFilesPerUpload) || 5
    draft.mediaMaxFileSizeMB = Number(props.value?.mediaMaxFileSizeMB) || 20
    draft.mediaAllowedExtensions = normalizeAllowedMediaExtensions(props.value?.mediaAllowedExtensions)
  },
  { immediate: true }
)

function isGroupSelected(group) {
  return group.extensions.every((extension) => draft.mediaAllowedExtensions.includes(extension))
}

function isGroupIndeterminate(group) {
  const count = group.extensions.filter((extension) => draft.mediaAllowedExtensions.includes(extension)).length
  return count > 0 && count < group.extensions.length
}

function toggleGroup(group, checked) {
  const next = new Set(draft.mediaAllowedExtensions)
  group.extensions.forEach((extension) => {
    if (checked) {
      next.add(extension)
      return
    }
    next.delete(extension)
  })
  draft.mediaAllowedExtensions = [...next]
}

function toggleExtension(extension, checked) {
  const next = new Set(draft.mediaAllowedExtensions)
  if (checked) {
    next.add(extension)
  } else {
    next.delete(extension)
  }
  draft.mediaAllowedExtensions = [...next]
}

function selectAllExtensions() {
  draft.mediaAllowedExtensions = [...DEFAULT_MEDIA_ALLOWED_EXTENSIONS]
}

function selectCoreExtensions() {
  draft.mediaAllowedExtensions = MEDIA_EXTENSION_GROUPS
    .filter((group) => CORE_EXTENSION_GROUPS.has(group.key))
    .flatMap((group) => group.extensions)
}

function handleCancel() {
  emit('update:open', false)
}

function handleSubmit() {
  emit('submit', {
    mediaMaxFilesPerUpload: Number(draft.mediaMaxFilesPerUpload),
    mediaMaxFileSizeMB: Number(draft.mediaMaxFileSizeMB),
    mediaAllowedExtensions: normalizeAllowedMediaExtensions(draft.mediaAllowedExtensions)
  })
}
</script>

<style scoped>
.media-upload-settings__alert {
  margin-bottom: 16px;
}

.media-upload-settings__note {
  margin-top: 8px;
  color: var(--text-tertiary, #8c8c8c);
  font-size: 12px;
  line-height: 1.6;
}

.media-upload-settings__toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.media-upload-settings__groups {
  display: grid;
  gap: 12px;
}

.media-upload-settings__group {
  border: 1px solid var(--border-color, #f0f0f0);
  border-radius: 8px;
  padding: 12px;
  background: var(--bg-container, #fff);
}

.media-upload-settings__group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  font-weight: 600;
}

.media-upload-settings__extension-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
}

.media-upload-settings__extension-list :deep(.ant-checkbox-wrapper) {
  margin-inline-start: 0;
}
</style>
