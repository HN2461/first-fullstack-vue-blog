<template>
  <a-modal
    :open="open"
    :footer="null"
    centered
    wrap-class-name="media-preview-modal"
    width="min(1180px, calc(100vw - 32px))"
    :body-style="{ height: 'min(76vh, 760px)', overflow: 'hidden', padding: 0 }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <template #title>
      <div class="media-preview-modal__title">
        <span class="media-preview-modal__file-name">{{ record?.originalName || '资源预览' }}</span>
        <a-tag v-if="record" :bordered="false" :color="fileTypeColor">{{ previewTypeLabel }}</a-tag>
      </div>
    </template>

    <div v-if="record" class="media-preview-workspace">
      <main class="media-preview-workspace__canvas">
        <div class="media-preview-workspace__toolbar">
          <div class="media-preview-workspace__summary">
            <span>{{ formatFileSize(record.size) }}</span>
            <span>{{ record.category || '未分类' }}</span>
          </div>
          <div class="media-preview-workspace__commands">
            <template v-if="previewType === 'image'">
              <a-tooltip title="缩小图片"><a-button type="text" aria-label="缩小图片" :disabled="imageScale <= 0.25" @click="changeImageScale(-0.15)"><template #icon><ZoomOutOutlined /></template></a-button></a-tooltip>
              <span class="media-preview-workspace__zoom">{{ Math.round(imageScale * 100) }}%</span>
              <a-tooltip title="放大图片"><a-button type="text" aria-label="放大图片" :disabled="imageScale >= 4" @click="changeImageScale(0.15)"><template #icon><ZoomInOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="适应视图"><a-button type="text" aria-label="图片适应视图" @click="resetImageViewport"><template #icon><CompressOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="向左旋转"><a-button type="text" aria-label="向左旋转图片" @click="rotateImage(-90)"><template #icon><RotateLeftOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="向右旋转"><a-button type="text" aria-label="向右旋转图片" @click="rotateImage(90)"><template #icon><RotateRightOutlined /></template></a-button></a-tooltip>
            </template>
            <a-tooltip title="新页面打开"><a-button type="text" aria-label="新页面打开资源" :href="previewOpenUrl" target="_blank" rel="noopener noreferrer"><template #icon><ExportOutlined /></template></a-button></a-tooltip>
            <a-tooltip title="下载资源"><a-button type="text" aria-label="下载资源" :href="previewOpenUrl" download><template #icon><DownloadOutlined /></template></a-button></a-tooltip>
          </div>
        </div>

        <section class="media-preview-workspace__stage" :class="`is-${previewType}`">
          <template v-if="previewType === 'image'">
            <div
              v-if="!imageLoadError"
              class="media-preview-workspace__image-viewport"
              :class="{ 'is-dragging': imageDragging, 'is-draggable': imageScale > 1 }"
              @wheel.prevent="handleImageWheel"
              @pointerdown="handleImagePointerDown"
              @pointermove="handleImagePointerMove"
              @pointerup="handleImagePointerEnd"
              @pointercancel="handleImagePointerEnd"
              @dblclick="handleImageDoubleClick"
            >
              <img
                :src="record.url"
                :alt="record.originalName"
                class="media-preview-workspace__image"
                :style="{ transform: `translate3d(${imagePosition.x}px, ${imagePosition.y}px, 0) scale(${imageScale}) rotate(${imageRotation}deg)` }"
                draggable="false"
                @load="handleImageLoad"
                @error="handleImageError"
              >
            </div>
            <div v-else class="media-preview-workspace__fallback"><strong>图片预览不可用</strong><p>文件可能已被移动、删除或当前浏览器无法解析此图片。</p></div>
          </template>

          <video v-else-if="previewType === 'video'" :src="record.url" controls preload="metadata" class="media-preview-workspace__media-player">您的浏览器不支持视频播放</video>

          <div v-else-if="previewType === 'audio'" class="media-preview-workspace__audio">
            <CustomerServiceOutlined class="media-preview-workspace__audio-icon" />
            <strong>{{ record.originalName }}</strong>
            <audio :src="record.url" controls preload="metadata" class="media-preview-workspace__media-player">您的浏览器不支持音频播放</audio>
          </div>

          <template v-else-if="previewType === 'pdf' || previewType === 'office'">
            <a-spin v-if="frameLoading && !viewerError" class="media-preview-workspace__frame-loading" tip="正在准备预览" />
            <iframe v-if="!viewerError" :key="viewerKey" :src="previewType === 'office' ? officeViewerUrl : previewOpenUrl" class="media-preview-workspace__frame" @load="handleFrameLoad" @error="handleFrameError" />
            <div v-else class="media-preview-workspace__fallback">
              <strong>{{ previewType === 'office' ? '文档在线预览不可用' : 'PDF 预览不可用' }}</strong>
              <p>{{ previewFailureMessage }}</p>
              <div v-if="previewType === 'pdf' || officePreviewAvailable" class="media-preview-workspace__fallback-actions">
                <a-button @click="retryViewer"><template #icon><ReloadOutlined /></template>重试预览</a-button>
              </div>
            </div>
          </template>

          <a-spin v-else-if="previewType === 'text'" :spinning="textLoading" tip="加载内容中"><pre class="media-preview-workspace__code"><code>{{ textContent }}</code></pre></a-spin>

          <div v-else class="media-preview-workspace__fallback">
            <FileZipOutlined v-if="record.fileClass === 'archive'" class="media-preview-workspace__fallback-icon" />
            <FileUnknownOutlined v-else class="media-preview-workspace__fallback-icon" />
            <strong>暂不支持在线预览</strong><p>可下载文件后使用本地应用查看。</p>
          </div>
        </section>
      </main>

      <aside class="media-preview-inspector">
        <section class="media-preview-inspector__section">
          <h3>资源信息</h3>
          <dl class="media-preview-inspector__list">
            <div><dt>文件类型</dt><dd>{{ record.mimeType || '未知' }}</dd></div>
            <div><dt>资源分类</dt><dd>{{ record.category || '未分类' }}</dd></div>
            <div><dt>文件大小</dt><dd>{{ formatFileSize(record.size) }}</dd></div>
            <div><dt>上传时间</dt><dd>{{ formatDate(record.createdAt) }}</dd></div>
          </dl>
        </section>
        <section class="media-preview-inspector__section">
          <h3>访问地址</h3>
          <div class="media-preview-inspector__url">
            <code>{{ record.url }}</code>
            <a-tooltip title="复制访问地址"><a-button type="text" aria-label="复制访问地址" @click="copyUrl"><template #icon><CopyOutlined /></template></a-button></a-tooltip>
          </div>
        </section>
        <section class="media-preview-inspector__section media-preview-inspector__hint"><LinkOutlined /><span>预览和下载不会变更资源文件、访问地址或引用关系。</span></section>
      </aside>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { CompressOutlined, CopyOutlined, CustomerServiceOutlined, DownloadOutlined, ExportOutlined, FileUnknownOutlined, FileZipOutlined, LinkOutlined, ReloadOutlined, RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons-vue'

const props = defineProps({ open: { type: Boolean, default: false }, record: { type: Object, default: null } })
const emit = defineEmits(['update:open'])
const imageScale = ref(1)
const imagePosition = ref({ x: 0, y: 0 })
const imageRotation = ref(0)
const imageDragging = ref(false)
const imageLoadError = ref(false)
const textContent = ref('')
const textLoading = ref(false)
const viewerKey = ref(0)
const frameLoading = ref(false)
const viewerError = ref(false)
let viewerFallbackTimer = null
let textRequestId = 0
let imagePointerId = null
let imagePointerStart = null

const previewType = computed(() => getPreviewType(props.record))
const previewOpenUrl = computed(() => props.record?.url ? new URL(props.record.url, window.location.origin).href : '')
const officeViewerUrl = computed(() => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewOpenUrl.value)}`)
const officePreviewAvailable = computed(() => isPublicPreviewUrl(previewOpenUrl.value))
const previewTypeLabel = computed(() => ({ image: '图片', video: '视频', audio: '音频', pdf: 'PDF', office: '文档', text: '文本', other: '文件' }[previewType.value]))
const fileTypeColor = computed(() => ({ image: 'blue', video: 'purple', audio: 'cyan', pdf: 'red', office: 'green', text: 'geekblue', other: 'default' }[previewType.value]))
const previewFailureMessage = computed(() => previewType.value === 'office' && !officePreviewAvailable.value
  ? '当前地址为本地、内网或 IP 地址，Office Viewer 无法从公网读取文件。请新页面打开或下载后查看。'
  : '当前环境无法完成内嵌预览。可重试，或在新页面打开、下载后继续查看。')

watch(() => [props.open, props.record], ([visible]) => {
  if (visible && props.record) initializePreview()
  if (!visible) resetPreview()
}, { immediate: true })

function getPreviewType(record) {
  const mime = String(record?.mimeType || '').toLowerCase()
  const ext = String(record?.originalName || '').split('.').pop().toLowerCase()
  if (mime.startsWith('image/') || record?.fileClass === 'image') return 'image'
  if (mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) return 'audio'
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(ext)) return 'office'
  if (mime.startsWith('text/') || ['js', 'jsx', 'ts', 'tsx', 'vue', 'json', 'yml', 'yaml', 'xml', 'html', 'css', 'scss', 'less', 'md', 'txt', 'sh', 'bat', 'ps1', 'py', 'java', 'go', 'rb', 'php', 'sql', 'c', 'cpp', 'h', 'cs', 'kt', 'swift', 'rs', 'ini', 'conf', 'env', 'gitignore', 'editorconfig'].includes(ext)) return 'text'
  return 'other'
}

function initializePreview() {
  resetPreview()
  if (previewType.value === 'pdf') startFramePreview()
  if (previewType.value === 'office') officePreviewAvailable.value ? startFramePreview() : viewerError.value = true
  if (previewType.value === 'text') loadTextPreview(props.record)
}

function resetPreview() {
  clearViewerFallbackTimer()
  textRequestId += 1
  resetImageViewport()
  imageLoadError.value = false
  textContent.value = ''
  textLoading.value = false
  frameLoading.value = false
  viewerError.value = false
}

function startFramePreview() {
  viewerKey.value += 1
  frameLoading.value = true
  viewerError.value = false
  clearViewerFallbackTimer()
  if (previewType.value === 'office') {
    viewerFallbackTimer = setTimeout(() => {
      if (props.open && previewType.value === 'office' && frameLoading.value) {
        frameLoading.value = false
        viewerError.value = true
      }
    }, 9000)
  }
}

function clearViewerFallbackTimer() {
  if (viewerFallbackTimer) {
    clearTimeout(viewerFallbackTimer)
    viewerFallbackTimer = null
  }
}

async function loadTextPreview(record) {
  const requestId = ++textRequestId
  textLoading.value = true
  try {
    const response = await fetch(record.url)
    if (!response.ok) {
      textContent.value = `无法加载文件内容（HTTP ${response.status}）`
      return
    }
    const content = await response.text()
    if (requestId === textRequestId) textContent.value = content
  } catch {
    if (requestId === textRequestId) textContent.value = '加载文件内容失败，请新页面打开或下载后查看。'
  } finally {
    if (requestId === textRequestId) textLoading.value = false
  }
}

function changeImageScale(delta) {
  imageScale.value = Math.min(4, Math.max(0.25, Number((imageScale.value + delta).toFixed(2))))
}

function resetImageViewport() {
  imageScale.value = 1
  imagePosition.value = { x: 0, y: 0 }
  imageRotation.value = 0
  imageDragging.value = false
  imagePointerId = null
  imagePointerStart = null
}

function rotateImage(degrees) {
  imageRotation.value = (imageRotation.value + degrees + 360) % 360
}

function handleImageWheel(event) {
  changeImageScale(event.deltaY < 0 ? 0.12 : -0.12)
}

function handleImagePointerDown(event) {
  if (imageScale.value <= 1 || event.button !== 0) return
  imagePointerId = event.pointerId
  imagePointerStart = { x: event.clientX, y: event.clientY, offsetX: imagePosition.value.x, offsetY: imagePosition.value.y }
  imageDragging.value = true
  event.currentTarget.setPointerCapture(event.pointerId)
}

function handleImagePointerMove(event) {
  if (!imageDragging.value || event.pointerId !== imagePointerId || !imagePointerStart) return
  imagePosition.value = {
    x: imagePointerStart.offsetX + event.clientX - imagePointerStart.x,
    y: imagePointerStart.offsetY + event.clientY - imagePointerStart.y
  }
}

function handleImagePointerEnd(event) {
  if (event.pointerId !== imagePointerId) return
  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  imageDragging.value = false
  imagePointerId = null
  imagePointerStart = null
}

function handleImageDoubleClick() {
  if (imageScale.value === 1) {
    imageScale.value = 1.8
    return
  }
  resetImageViewport()
}

function handleImageLoad() {
  imageLoadError.value = false
}

function handleImageError() {
  imageLoadError.value = true
}

function handleFrameLoad() {
  clearViewerFallbackTimer()
  frameLoading.value = false
}

function handleFrameError() {
  clearViewerFallbackTimer()
  frameLoading.value = false
  viewerError.value = true
}

function retryViewer() {
  startFramePreview()
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(previewOpenUrl.value)
    message.success('访问地址已复制')
  } catch {
    message.error('复制失败，请手动复制地址')
  }
}

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  if (size >= 1024) return `${Math.round(size / 1024)} KB`
  return `${size || 0} B`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}

function isPublicPreviewUrl(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    return ['http:', 'https:'].includes(url.protocol) && !['localhost', '127.0.0.1', '::1'].includes(host) && !/^10\./.test(host) && !/^192\.168\./.test(host) && !/^172\.(1[6-9]|2\d|3[01])\./.test(host) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(host)
  } catch {
    return false
  }
}

onUnmounted(resetPreview)
</script>

<style src="./MediaPreviewModal.css" scoped></style>
