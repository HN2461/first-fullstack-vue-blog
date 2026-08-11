<template>
  <a-modal
    :open="open"
    :footer="null"
    centered
    width="min(1120px, calc(100vw - 32px))"
    :body-style="{ height: 'min(76vh, 760px)', overflow: 'hidden', padding: 0 }"
    @cancel="emit('update:open', false)"
  >
    <template #title>
      <div class="share-preview__title">
        <span>{{ item?.originalName || '资源预览' }}</span>
        <a-tag v-if="item" :bordered="false">{{ previewLabel }}</a-tag>
      </div>
    </template>

    <div v-if="item" class="share-preview">
      <div class="share-preview__toolbar">
        <span>{{ formatFileSize(item.size) }}</span>
        <div class="share-preview__commands">
          <template v-if="item.previewType === 'image'">
            <a-tooltip title="缩小">
              <a-button type="text" aria-label="缩小图片" :disabled="scale <= 0.25" @click="changeScale(-0.15)">
                <template #icon><ZoomOutOutlined /></template>
              </a-button>
            </a-tooltip>
            <span class="share-preview__scale">{{ Math.round(scale * 100) }}%</span>
            <a-tooltip title="放大">
              <a-button type="text" aria-label="放大图片" :disabled="scale >= 4" @click="changeScale(0.15)">
                <template #icon><ZoomInOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="适应窗口">
              <a-button type="text" aria-label="图片适应窗口" @click="resetImage">
                <template #icon><CompressOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="向左旋转">
              <a-button type="text" aria-label="向左旋转图片" @click="rotation -= 90">
                <template #icon><RotateLeftOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="向右旋转">
              <a-button type="text" aria-label="向右旋转图片" @click="rotation += 90">
                <template #icon><RotateRightOutlined /></template>
              </a-button>
            </a-tooltip>
          </template>
          <a-tooltip title="下载资源">
            <a-button type="text" aria-label="下载资源" :href="downloadUrl">
              <template #icon><DownloadOutlined /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <div
        class="share-preview__stage"
        :class="[`is-${item.previewType}`, { 'is-dragging': dragging }]"
        @wheel.prevent="handleWheel"
        @pointerdown="startDrag"
        @pointermove="moveDrag"
        @pointerup="stopDrag"
        @pointercancel="stopDrag"
      >
        <img
          v-if="item.previewType === 'image'"
          :src="previewUrl"
          :alt="item.originalName"
          draggable="false"
          :style="imageStyle"
        >
        <video v-else-if="item.previewType === 'video'" :src="previewUrl" controls preload="metadata" />
        <audio v-else-if="item.previewType === 'audio'" :src="previewUrl" controls preload="metadata" />
        <iframe v-else-if="item.previewType === 'pdf'" :src="previewUrl" :title="item.originalName" />
        <a-spin v-else-if="item.previewType === 'text' && textLoading" />
        <a-result v-else-if="item.previewType === 'text' && textError" status="error" title="文本预览失败" :sub-title="textError" />
        <pre v-else-if="item.previewType === 'text'">{{ textContent }}</pre>
        <a-empty v-else description="该文件类型暂不支持在线预览" />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  CompressOutlined,
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
  previewUrl: { type: String, default: '' },
  downloadUrl: { type: String, default: '' }
})
const emit = defineEmits(['update:open'])
const scale = ref(1)
const rotation = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
const textContent = ref('')
const textLoading = ref(false)
const textError = ref('')

const previewLabel = computed(() => ({
  image: '图片',
  video: '视频',
  audio: '音频',
  pdf: 'PDF',
  text: '文本'
}[props.item?.previewType] || '文件'))
const imageStyle = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value}) rotate(${rotation.value}deg)`
}))

watch(() => [props.open, props.item?.entryId], async ([visible]) => {
  resetImage()
  textContent.value = ''
  textError.value = ''
  if (!visible || props.item?.previewType !== 'text' || !props.previewUrl) return

  textLoading.value = true
  try {
    const response = await fetch(props.previewUrl, { credentials: 'include' })
    if (!response.ok) throw new Error(`请求失败：${response.status}`)
    textContent.value = await response.text()
  } catch (error) {
    textError.value = error.message || '无法读取文本内容'
  } finally {
    textLoading.value = false
  }
})

function resetImage() {
  scale.value = 1
  rotation.value = 0
  offsetX.value = 0
  offsetY.value = 0
  dragging.value = false
}

function changeScale(delta) {
  scale.value = Math.min(4, Math.max(0.25, Number((scale.value + delta).toFixed(2))))
  if (scale.value <= 1) {
    offsetX.value = 0
    offsetY.value = 0
  }
}

function handleWheel(event) {
  if (props.item?.previewType !== 'image') return
  changeScale(event.deltaY < 0 ? 0.15 : -0.15)
}

function startDrag(event) {
  if (props.item?.previewType !== 'image' || scale.value <= 1) return
  dragging.value = true
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    offsetX: offsetX.value,
    offsetY: offsetY.value
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function moveDrag(event) {
  if (!dragging.value) return
  offsetX.value = dragStart.value.offsetX + event.clientX - dragStart.value.x
  offsetY.value = dragStart.value.offsetY + event.clientY - dragStart.value.y
}

function stopDrag() {
  dragging.value = false
}

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024 * 1024) return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  if (size >= 1024) return `${Math.round(size / 1024)} KB`
  return `${size} B`
}
</script>

<style scoped>
.share-preview { display: grid; grid-template-rows: 48px minmax(0, 1fr); height: 100%; }
.share-preview__title { display: flex; align-items: center; gap: 10px; min-width: 0; }
.share-preview__title > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.share-preview__toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0 14px; border-bottom: 1px solid var(--console-border); color: var(--console-text-secondary); font-size: 12px; }
.share-preview__commands { display: flex; align-items: center; }
.share-preview__scale { width: 48px; text-align: center; }
.share-preview__stage { min-height: 0; display: grid; place-items: center; overflow: hidden; background: var(--console-bg); }
.share-preview__stage.is-image { cursor: default; touch-action: none; }
.share-preview__stage.is-image:has(img) { cursor: grab; }
.share-preview__stage.is-dragging { cursor: grabbing; }
.share-preview__stage img { max-width: 88%; max-height: 88%; object-fit: contain; transform-origin: center; user-select: none; transition: transform 120ms ease; }
.share-preview__stage.is-dragging img { transition: none; }
.share-preview__stage video { width: min(920px, 92%); max-height: 90%; background: #000; }
.share-preview__stage audio { width: min(640px, 84%); }
.share-preview__stage iframe { width: 100%; height: 100%; border: 0; background: #fff; }
.share-preview__stage pre { width: 100%; height: 100%; overflow: auto; margin: 0; padding: 22px; color: var(--console-text); background: var(--console-surface); font: 13px/1.7 'Cascadia Code', Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; scrollbar-width: none; }
.share-preview__stage pre::-webkit-scrollbar { display: none; }
</style>
