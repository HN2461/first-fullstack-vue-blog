<template>
  <a-modal :open="open" :title="resource?.originalName || resource?.name || '文件预览'" :footer="null" width="min(900px, 90vw)" centered wrap-class-name="business-modal" @cancel="$emit('update:open', false)">
    <div class="resource-preview">
      <a-spin v-if="loading" />
      <a-alert v-else-if="error" :message="error" type="error" />
      <img v-else-if="isImage && url" :src="url" :alt="resource?.originalName" />
      <iframe v-else-if="isPdf && url" :src="url" title="PDF 预览" sandbox="allow-same-origin" />
      <video v-else-if="isVideo && url" :src="url" controls preload="metadata" />
      <audio v-else-if="isAudio && url" :src="url" controls preload="metadata" />
      <MediaDocxPreview v-else-if="isDocx && url" :open="open" :url="url" />
      <MediaSpreadsheetPreview v-else-if="isSpreadsheet && url" :open="open" :url="url" :file-name="resource?.originalName || ''" />
      <MediaPptxPreview v-else-if="isPptx && url" :open="open" :url="url" />
      <pre v-else-if="text">{{ text }}</pre>
      <a-empty v-else description="此文件可下载后查看" />
      <div class="resource-preview__actions"><a-button :disabled="!resource" @click="download">下载文件</a-button></div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch, defineAsyncComponent } from 'vue'
import { message } from 'ant-design-vue'
import { useResourceUrl } from '@/composables/useResourceUrl'
import { readResourceBlob, downloadResource } from '@/services/resources'

const props = defineProps({ open: Boolean, resource: { type: Object, default: null } })
const MediaDocxPreview = defineAsyncComponent(() => import('@/views/admin/AdminMedia/MediaDocxPreview.vue'))
const MediaSpreadsheetPreview = defineAsyncComponent(() => import('@/views/admin/AdminMedia/MediaSpreadsheetPreview.vue'))
const MediaPptxPreview = defineAsyncComponent(() => import('@/views/admin/AdminMedia/MediaPptxPreview.vue'))
defineEmits(['update:open'])
const { url, error, loading } = useResourceUrl(() => props.open ? props.resource?.url || '' : '')
const isImage = computed(() => /^image\/(jpeg|png|gif|webp|avif)$/.test(props.resource?.mimeType || ''))
const isPdf = computed(() => props.resource?.mimeType === 'application/pdf')
const isVideo = computed(() => props.resource?.mimeType?.startsWith('video/'))
const isAudio = computed(() => props.resource?.mimeType?.startsWith('audio/'))
const isDocx = computed(() => /\.docx$/i.test(props.resource?.originalName || ''))
const isSpreadsheet = computed(() => /\.(xlsx?|csv)$/i.test(props.resource?.originalName || ''))
const isPptx = computed(() => /\.pptx$/i.test(props.resource?.originalName || ''))
const text = ref('')
let version = 0
watch(() => [props.open, props.resource], async () => {
  const current = ++version
  text.value = ''
  if (!props.open || !props.resource?.url || !/^(text\/|application\/json)/.test(props.resource.mimeType || '') || props.resource.size > 2 * 1024 * 1024) return
  try {
    const blob = await readResourceBlob(props.resource.url)
    const content = await blob.text()
    if (current === version) text.value = content
  } catch {
    if (current === version) text.value = '文件读取失败，请重新打开或下载查看'
  }
}, { immediate: true })
async function download() {
  try { await downloadResource(props.resource) } catch (error) { message.error(error.message || '下载失败') }
}
</script>

<style scoped>
.resource-preview { max-height: min(68vh, 720px); overflow: auto; }
.resource-preview img { display: block; max-width: 100%; max-height: 55vh; object-fit: contain; margin: auto; }
.resource-preview iframe { width: 100%; height: 52vh; border: 0; }
.resource-preview video { width: 100%; max-height: 52vh; }
.resource-preview audio { width: 100%; }
.resource-preview pre { max-height: 52vh; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
.resource-preview__actions { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
