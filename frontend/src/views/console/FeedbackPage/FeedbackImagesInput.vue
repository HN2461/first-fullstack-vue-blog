<template>
  <div class="feedback-images-input">
    <div class="feedback-images-input__toolbar">
      <a-upload
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        :show-upload-list="false"
        :before-upload="selectImage"
        :disabled="disabled || modelValue.length >= 5"
      >
        <a-button :disabled="disabled || modelValue.length >= 5"><PictureOutlined />添加图片</a-button>
      </a-upload>
      <span>最多 5 张，每张 5MB；可在文字框中粘贴截图</span>
    </div>
    <div v-if="modelValue.length" class="feedback-images-input__list">
      <div v-for="image in modelValue" :key="image.uid" class="feedback-images-input__item">
        <a-image :src="image.url" :width="80" :height="64" :alt="image.file.name || '截图预览'" />
        <a-tooltip title="移除图片"
          ><a-button type="text" size="small" danger :disabled="disabled" aria-label="移除图片" @click="remove(image.uid)"
            ><DeleteOutlined /></a-button
        ></a-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { message } from 'ant-design-vue'
import { DeleteOutlined, PictureOutlined } from '@ant-design/icons-vue'

const props = defineProps({ modelValue: { type: Array, default: () => [] }, disabled: Boolean })
const emit = defineEmits(['update:modelValue'])
const urls = new Map()
// 同一批多选会同步触发 beforeUpload，保留本地队列避免受控 prop 尚未更新而覆盖先选图片。
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
  if (props.disabled) return false
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    message.warning('请选择 PNG、JPG、WEBP 或 GIF 图片')
    return false
  }
  if (!file.size || file.size > 5 * 1024 * 1024) {
    message.warning('单张图片不能超过 5MB')
    return false
  }
  if (selection.length >= 5) {
    message.warning('每次最多添加 5 张图片')
    return false
  }
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const url = URL.createObjectURL(file)
  urls.set(uid, url)
  selection = [...selection, { uid, file, url }]
  emit('update:modelValue', selection)
  return false
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

function remove(uid) {
  selection = selection.filter((image) => image.uid !== uid)
  emit('update:modelValue', selection)
}

onBeforeUnmount(() => {
  for (const url of urls.values()) URL.revokeObjectURL(url)
})
defineExpose({ handlePaste })
</script>

<style scoped>
.feedback-images-input__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.feedback-images-input__toolbar > span {
  font-size: 12px;
  color: var(--console-text-secondary);
}
.feedback-images-input__list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}
.feedback-images-input__item {
  display: flex;
  align-items: start;
  gap: 2px;
}
.feedback-images-input__item :deep(img) {
  object-fit: cover;
  border-radius: 4px;
}
</style>
