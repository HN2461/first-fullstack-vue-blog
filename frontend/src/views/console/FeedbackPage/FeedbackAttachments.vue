<template>
  <a-image-preview-group
    ><div v-if="attachments.length" class="feedback-attachments" aria-label="反馈截图">
      <div v-for="attachment in attachments" :key="attachment.id" class="feedback-attachments__item">
        <a-image v-if="images[attachment.id]" :src="images[attachment.id]" :alt="attachment.name" :width="144" :height="96" />
        <a-button v-else-if="errors[attachment.id]" class="feedback-attachments__retry" @click="load(attachment)"
          >图片加载失败<br />点击重试</a-button
        >
        <div v-else class="feedback-attachments__loading"><a-spin size="small" /></div>
        <span :title="attachment.name">{{ attachment.name }}</span>
      </div>
    </div></a-image-preview-group
  >
</template>

<script setup>
import { onBeforeUnmount, reactive, watch } from 'vue'
import { getFeedbackImage } from '@/services/feedback'

const props = defineProps({ attachments: { type: Array, default: () => [] } })
const images = reactive({})
const errors = reactive({})
let controller = new AbortController()

async function load(attachment) {
  const signal = controller.signal
  delete errors[attachment.id]
  try {
    const blob = await getFeedbackImage(attachment.id, signal)
    if (signal.aborted) return
    images[attachment.id] = URL.createObjectURL(blob)
  } catch {
    if (!signal.aborted) errors[attachment.id] = true
  }
}

function clear() {
  controller.abort()
  controller = new AbortController()
  Object.values(images).forEach((url) => URL.revokeObjectURL(url))
  Object.keys(images).forEach((key) => delete images[key])
  Object.keys(errors).forEach((key) => delete errors[key])
}

watch(
  () => props.attachments.map((item) => item.id).join(','),
  () => {
    clear()
    props.attachments.forEach(load)
  },
  { immediate: true }
)
onBeforeUnmount(clear)
</script>

<style scoped>
.feedback-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}
.feedback-attachments__item {
  display: grid;
  gap: 4px;
  width: 144px;
}
.feedback-attachments__item :deep(img) {
  object-fit: contain;
  background: var(--console-surface-muted);
  border: 1px solid var(--console-border);
  border-radius: 4px;
}
.feedback-attachments__item > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--console-text-secondary);
}
.feedback-attachments__loading,
.feedback-attachments__retry {
  width: 144px;
  height: 96px;
  display: grid;
  place-content: center;
  background: var(--console-surface-muted);
  font-size: 12px;
}
</style>
