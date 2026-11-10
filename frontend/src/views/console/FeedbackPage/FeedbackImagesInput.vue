<template>
  <div class="feedback-images-input" :class="{ 'is-compact': compact }">
    <input
      ref="fileInput"
      class="feedback-images-input__native"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      multiple
      hidden
      tabindex="-1"
      aria-hidden="true"
      @change="selectFiles"
    />
    <div class="feedback-images-input__toolbar">
      <a-button :size="compact ? 'small' : 'middle'" :disabled="disabled || modelValue.length >= 5" @click="fileInput?.click()"
        ><PictureOutlined />{{ compact ? '添加截图' : '选择图片' }}</a-button
      >
      <span>{{ compact ? modelValue.length + ' / 5 张' : '支持选择、拖入或粘贴截图，最多 5 张，每张 5MB' }}</span>
    </div>
    <div v-if="modelValue.length" class="feedback-images-input__list">
      <div v-for="image in modelValue" :key="image.uid" class="feedback-images-input__item">
        <a-image :src="image.url" :width="compact ? 64 : 96" :height="compact ? 48 : 72" :alt="image.file.name || '截图预览'" />
        <a-tooltip title="移除图片"
          ><a-button
            class="feedback-images-input__remove"
            type="text"
            size="small"
            danger
            :disabled="disabled"
            :aria-label="'移除图片 ' + (image.file.name || '截图')"
            @click="remove(image.uid)"
            ><CloseOutlined /></a-button
        ></a-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { CloseOutlined, PictureOutlined } from '@ant-design/icons-vue'

const props = defineProps({ modelValue: { type: Array, default: () => [] }, disabled: Boolean, compact: Boolean })
const emit = defineEmits(['update:modelValue'])
const fileInput = ref(null)
const urls = new Map()
// 原生多选和剪贴板均批量进入同一队列，避免受控 prop 尚未刷新时覆盖前一张图片。
let selection = [...props.modelValue]
watch(
  () => props.modelValue,
  (images) => {
    selection = [...images]
    const active = new Set(images.map((image) => image.uid))
    for (const [uid, url] of urls) {
      if (!active.has(uid)) {
        URL.revokeObjectURL(url)
        urls.delete(uid)
      }
    }
  }
)

function selectImage(file) {
  if (props.disabled) return
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    message.warning('请选择 PNG、JPG、WEBP 或 GIF 图片')
    return
  }
  if (!file.size || file.size > 5 * 1024 * 1024) {
    message.warning('单张图片不能超过 5MB')
    return
  }
  if (selection.length >= 5) {
    message.warning('每次最多添加 5 张图片')
    return
  }
  const uid = Date.now() + '-' + Math.random().toString(36).slice(2)
  const url = URL.createObjectURL(file)
  urls.set(uid, url)
  selection = [...selection, { uid, file, url }]
  emit('update:modelValue', selection)
}
function selectFiles(event) {
  Array.from(event.target.files || []).forEach(selectImage)
  event.target.value = ''
}
function handlePaste(event) {
  const images = [...(event.clipboardData?.items || [])].filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
  if (!images.length || props.disabled) return
  event.preventDefault()
  images.forEach((item) => {
    const file = item.getAsFile()
    if (file) selectImage(file)
  })
}
function handleDrop(event) {
  if (props.disabled || !event.dataTransfer?.files?.length) return
  event.preventDefault()
  Array.from(event.dataTransfer.files).forEach(selectImage)
}
function remove(uid) {
  selection = selection.filter((image) => image.uid !== uid)
  emit('update:modelValue', selection)
}
onBeforeUnmount(() => {
  for (const url of urls.values()) URL.revokeObjectURL(url)
})
defineExpose({ handlePaste, handleDrop })
</script>

<style scoped>
.feedback-images-input {
  min-width: 0;
  font-size: 12px;
  line-height: 20px;
}
.feedback-images-input__native {
  display: none;
}
.feedback-images-input__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 12px;
}
.feedback-images-input__toolbar > span {
  font-size: 12px;
  color: var(--console-text-secondary);
}
.feedback-images-input__list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 182px;
  overflow-y: auto;
  padding: 10px 0 4px;
}
.feedback-images-input__item {
  position: relative;
  flex-shrink: 0;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  overflow: hidden;
}
.feedback-images-input__item :deep(img) {
  display: block;
  object-fit: cover;
}
.feedback-images-input__remove {
  position: absolute;
  right: 0;
  top: 0;
  width: 22px;
  min-width: 22px;
  height: 22px;
  padding: 0;
  background: var(--console-surface) !important;
  border-radius: 0 0 0 4px;
}
.is-compact .feedback-images-input__list {
  max-height: 72px;
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>
