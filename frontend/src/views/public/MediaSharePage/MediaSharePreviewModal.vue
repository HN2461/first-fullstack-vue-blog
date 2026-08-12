<template>
  <a-modal
    :open="open"
    :footer="null"
    centered
    width="min(1180px, calc(100vw - 32px))"
    :body-style="{ height: 'min(76vh, 760px)', overflow: 'hidden', padding: 0 }"
    @cancel="emit('update:open', false)"
  >
    <template #title>
      <div class="share-preview__title"><span>{{ item?.originalName || '资源预览' }}</span><a-tag v-if="item" :bordered="false">{{ previewLabel }}</a-tag></div>
    </template>

    <div v-if="item" class="share-preview-workspace">
      <main class="share-preview-workspace__canvas">
        <div class="share-preview-workspace__toolbar">
          <span>{{ formatFileSize(item.size) }}</span>
          <div class="share-preview-workspace__commands">
            <template v-if="item.previewType === 'image'">
              <a-tooltip title="缩小图片"><a-button type="text" aria-label="缩小图片" :disabled="scale <= 0.25" @click="changeScale(-0.15)"><template #icon><ZoomOutOutlined /></template></a-button></a-tooltip>
              <span class="share-preview-workspace__scale">{{ Math.round(scale * 100) }}%</span>
              <a-tooltip title="放大图片"><a-button type="text" aria-label="放大图片" :disabled="scale >= 4" @click="changeScale(0.15)"><template #icon><ZoomInOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="适应视图"><a-button type="text" aria-label="图片适应视图" @click="resetImage"><template #icon><CompressOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="向左旋转"><a-button type="text" aria-label="向左旋转图片" @click="rotation = (rotation + 270) % 360"><template #icon><RotateLeftOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="向右旋转"><a-button type="text" aria-label="向右旋转图片" @click="rotation = (rotation + 90) % 360"><template #icon><RotateRightOutlined /></template></a-button></a-tooltip>
            </template>
            <a-tooltip title="新页面打开"><a-button type="text" aria-label="新页面打开资源" :href="previewUrl" target="_blank" rel="noopener noreferrer"><template #icon><ExportOutlined /></template></a-button></a-tooltip>
            <a-tooltip title="下载资源"><a-button type="text" aria-label="下载资源" :disabled="downloadDisabled" @click="emit('download')"><template #icon><DownloadOutlined /></template></a-button></a-tooltip>
          </div>
        </div>

        <section class="share-preview-workspace__stage" :class="`is-${item.previewType}`">
          <div
            v-if="item.previewType === 'image' && !imageError"
            class="share-preview-workspace__image-viewport"
            :class="{ 'is-draggable': scale > 1, 'is-dragging': dragging }"
            @wheel.prevent="handleWheel"
            @pointerdown="startDrag"
            @pointermove="moveDrag"
            @pointerup="stopDrag"
            @pointercancel="stopDrag"
            @dblclick="toggleImageZoom"
          >
            <img :src="previewUrl" :alt="item.originalName" draggable="false" :style="imageStyle" @error="imageError = true">
          </div>
          <PreviewFallback v-else-if="item.previewType === 'image'" title="图片预览不可用" text="文件可能已被移除，或当前浏览器无法解析该图片。" />
          <video v-else-if="item.previewType === 'video'" :src="previewUrl" controls preload="metadata">您的浏览器不支持视频播放</video>
          <div v-else-if="item.previewType === 'audio'" class="share-preview-workspace__audio"><CustomerServiceOutlined /><strong>{{ item.originalName }}</strong><audio :src="previewUrl" controls preload="metadata">您的浏览器不支持音频播放</audio></div>
          <template v-else-if="item.previewType === 'pdf'">
            <a-spin v-if="frameLoading && !frameError" class="share-preview-workspace__loading" tip="正在准备预览" />
            <iframe v-if="!frameError" :key="frameKey" :src="previewUrl" :title="item.originalName" @load="frameLoading = false" @error="handleFrameError" />
            <PreviewFallback v-else title="PDF 预览不可用" text="当前环境无法完成内嵌预览，可重试或下载后查看。"><a-button @click="retryFrame"><template #icon><ReloadOutlined /></template>重试预览</a-button></PreviewFallback>
          </template>
          <template v-else-if="item.previewType === 'text'">
            <a-spin v-if="textLoading" tip="加载内容中" />
            <PreviewFallback v-else-if="textError" title="文本预览失败" :text="textError"><a-button @click="loadText"><template #icon><ReloadOutlined /></template>重新加载</a-button></PreviewFallback>
            <pre v-else><code>{{ textContent }}</code></pre>
          </template>
          <PreviewFallback v-else title="暂不支持在线预览" text="可下载文件后使用本地应用查看。" />
        </section>
      </main>

      <aside class="share-preview-inspector">
        <section><h3>文件信息</h3><dl><div><dt>文件名称</dt><dd>{{ item.originalName }}</dd></div><div><dt>文件类型</dt><dd>{{ item.mimeType || '未知' }}</dd></div><div><dt>文件大小</dt><dd>{{ formatFileSize(item.size) }}</dd></div><div><dt>预览类型</dt><dd>{{ previewLabel }}</dd></div></dl></section>
        <section class="share-preview-inspector__security"><SafetyCertificateOutlined /><div><strong>受控访问</strong><span>预览和下载均通过分享权限校验，不会公开资源的原始存储地址。</span></div></section>
      </aside>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, defineComponent, h, onUnmounted, ref, watch } from 'vue'
import {
  CompressOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  ExportOutlined,
  ReloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SafetyCertificateOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons-vue'

const PreviewFallback = defineComponent({
  props: { title: String, text: String },
  setup(props, { slots }) {
    return () => h('div', { class: 'share-preview-workspace__fallback' }, [h('strong', props.title), h('p', props.text), slots.default?.()])
  }
})
const props = defineProps({ open: { type: Boolean, default: false }, item: { type: Object, default: null }, previewUrl: { type: String, default: '' }, downloadUrl: { type: String, default: '' }, downloadDisabled: { type: Boolean, default: false } })
const emit = defineEmits(['update:open', 'download'])
const scale = ref(1)
const rotation = ref(0)
const position = ref({ x: 0, y: 0 })
const dragging = ref(false)
const imageError = ref(false)
const frameLoading = ref(false)
const frameError = ref(false)
const frameKey = ref(0)
const textContent = ref('')
const textLoading = ref(false)
const textError = ref('')
let pointerId = null
let pointerStart = null
let textRequestId = 0

const previewLabel = computed(() => ({ image: '图片', video: '视频', audio: '音频', pdf: 'PDF', text: '文本' }[props.item?.previewType] || '文件'))
const imageStyle = computed(() => ({ transform: `translate3d(${position.value.x}px, ${position.value.y}px, 0) scale(${scale.value}) rotate(${rotation.value}deg)` }))

watch(() => [props.open, props.item?.entryId], ([visible]) => {
  resetPreview()
  if (!visible || !props.item) return
  if (props.item.previewType === 'pdf') retryFrame()
  if (props.item.previewType === 'text') loadText()
}, { immediate: true })

function resetPreview() {
  textRequestId += 1
  resetImage()
  imageError.value = false
  frameLoading.value = false
  frameError.value = false
  textContent.value = ''
  textLoading.value = false
  textError.value = ''
}

function resetImage() {
  scale.value = 1
  rotation.value = 0
  position.value = { x: 0, y: 0 }
  dragging.value = false
  pointerId = null
  pointerStart = null
}

function changeScale(delta) {
  scale.value = Math.min(4, Math.max(0.25, Number((scale.value + delta).toFixed(2))))
  if (scale.value <= 1) position.value = { x: 0, y: 0 }
}

function handleWheel(event) {
  changeScale(event.deltaY < 0 ? 0.15 : -0.15)
}

function toggleImageZoom() {
  if (scale.value === 1) scale.value = 1.8
  else resetImage()
}

function startDrag(event) {
  if (scale.value <= 1 || event.button !== 0) return
  pointerId = event.pointerId
  pointerStart = { x: event.clientX, y: event.clientY, offsetX: position.value.x, offsetY: position.value.y }
  dragging.value = true
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function moveDrag(event) {
  if (!dragging.value || event.pointerId !== pointerId || !pointerStart) return
  position.value = { x: pointerStart.offsetX + event.clientX - pointerStart.x, y: pointerStart.offsetY + event.clientY - pointerStart.y }
}

function stopDrag(event) {
  if (event.pointerId !== pointerId) return
  if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture?.(event.pointerId)
  dragging.value = false
  pointerId = null
  pointerStart = null
}

function retryFrame() {
  frameKey.value += 1
  frameLoading.value = true
  frameError.value = false
}

function handleFrameError() {
  frameLoading.value = false
  frameError.value = true
}

async function loadText() {
  const requestId = ++textRequestId
  textLoading.value = true
  textError.value = ''
  try {
    const response = await fetch(props.previewUrl, { credentials: 'include' })
    if (!response.ok) throw new Error(`请求失败：${response.status}`)
    const content = await response.text()
    if (requestId === textRequestId) textContent.value = content
  } catch (error) {
    if (requestId === textRequestId) textError.value = error.message || '无法读取文本内容'
  } finally {
    if (requestId === textRequestId) textLoading.value = false
  }
}

function formatFileSize(size = 0) {
  if (size >= 1024 ** 3) return `${(size / 1024 ** 3).toFixed(2)} GB`
  if (size >= 1024 ** 2) return `${(size / 1024 ** 2).toFixed(1)} MB`
  if (size >= 1024) return `${Math.round(size / 1024)} KB`
  return `${size} B`
}

onUnmounted(resetPreview)
</script>

<style scoped>
.share-preview__title { display: flex; align-items: center; gap: 9px; min-width: 0; }
.share-preview__title > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.share-preview-workspace { display: grid; grid-template-columns: minmax(0, 1fr) 270px; height: 100%; min-height: 0; color: var(--share-text, var(--console-text)); background: var(--share-surface, var(--console-surface)); }
.share-preview-workspace__canvas { display: grid; grid-template-rows: 46px minmax(0, 1fr); min-width: 0; min-height: 0; border-right: 1px solid var(--share-border, var(--console-border)); }
.share-preview-workspace__toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-bottom: 1px solid var(--share-border, var(--console-border)); color: var(--share-text-secondary, var(--console-text-secondary)); font-size: 12px; }
.share-preview-workspace__commands { display: flex; align-items: center; }
.share-preview-workspace__scale { width: 44px; text-align: center; }
.share-preview-workspace__stage { position: relative; display: flex; align-items: center; justify-content: center; min-height: 0; overflow: hidden; background: var(--share-surface-muted, var(--console-surface-muted)); }
.share-preview-workspace__stage.is-image, .share-preview-workspace__stage.is-video { background: #152033; }
.share-preview-workspace__image-viewport { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 24px; overflow: hidden; touch-action: none; }
.share-preview-workspace__image-viewport.is-draggable { cursor: grab; }
.share-preview-workspace__image-viewport.is-dragging { cursor: grabbing; }
.share-preview-workspace__image-viewport img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; transform-origin: center; user-select: none; pointer-events: none; transition: transform 120ms ease; }
.share-preview-workspace__image-viewport.is-dragging img { transition: none; }
.share-preview-workspace__stage video { width: min(92%, 900px); max-height: 92%; }
.share-preview-workspace__audio { display: grid; justify-items: center; gap: 18px; width: min(460px, 86%); color: var(--share-text, var(--console-text)); }
.share-preview-workspace__audio > .anticon { color: var(--share-primary, var(--console-primary-strong)); font-size: 52px; }
.share-preview-workspace__audio strong { max-width: 100%; overflow-wrap: anywhere; text-align: center; }
.share-preview-workspace__audio audio { width: 100%; }
.share-preview-workspace__stage iframe { width: 100%; height: 100%; border: 0; background: #fff; }
.share-preview-workspace__stage pre { width: 100%; height: 100%; margin: 0; padding: 20px; overflow: auto; color: #dce7f7; background: #172033; font: 13px/1.7 'Cascadia Code', Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; scrollbar-width: none; }
.share-preview-workspace__stage pre::-webkit-scrollbar { display: none; }
.share-preview-workspace__loading { position: absolute; z-index: 1; }
.share-preview-workspace__fallback { display: grid; justify-items: center; gap: 10px; max-width: 430px; padding: 28px; color: var(--share-text, var(--console-text)); text-align: center; }
.share-preview-workspace__fallback p { margin: 0; color: var(--share-text-secondary, var(--console-text-secondary)); line-height: 1.7; }
.share-preview-inspector { min-width: 0; overflow-y: auto; padding: 18px; scrollbar-width: none; }
.share-preview-inspector::-webkit-scrollbar { display: none; }
.share-preview-inspector section + section { margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--share-border, var(--console-border)); }
.share-preview-inspector h3 { margin: 0 0 14px; color: var(--share-text, var(--console-text)); font-size: 13px; }
.share-preview-inspector dl { display: grid; gap: 13px; margin: 0; }
.share-preview-inspector dl div { display: grid; gap: 3px; }
.share-preview-inspector dt { color: var(--share-text-secondary, var(--console-text-tertiary)); font-size: 12px; }
.share-preview-inspector dd { margin: 0; overflow-wrap: anywhere; color: var(--share-text, var(--console-text-secondary)); }
.share-preview-inspector__security { display: flex; align-items: flex-start; gap: 9px; }
.share-preview-inspector__security > .anticon { margin-top: 2px; color: #067647; }
.share-preview-inspector__security div { display: grid; gap: 5px; }
.share-preview-inspector__security strong { color: var(--share-text, var(--console-text)); font-size: 13px; }
.share-preview-inspector__security span { color: var(--share-text-secondary, var(--console-text-secondary)); font-size: 12px; line-height: 1.65; }
@media (max-width: 820px) { .share-preview-workspace { grid-template-columns: 1fr; grid-template-rows: minmax(360px, 55vh) auto; overflow-y: auto; scrollbar-width: none; } .share-preview-workspace::-webkit-scrollbar { display: none; } .share-preview-workspace__canvas { border-right: 0; border-bottom: 1px solid var(--share-border, var(--console-border)); } .share-preview-inspector { overflow: visible; } }
@media (max-width: 480px) { .share-preview-workspace__toolbar { padding: 0 7px; } .share-preview-workspace__commands :deep(.ant-btn) { padding: 0 6px; } .share-preview-inspector { padding: 14px; } }
</style>
