<template>
  <a-modal
    :open="open"
    :footer="null"
    centered
    :wrap-class-name="modalWrapClass"
    width="min(1380px, calc(100vw - 48px))"
    :body-style="{ height: 'min(80vh, 820px)', overflow: 'hidden', padding: 0 }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <template #title>
      <div class="media-preview-modal__title">
        <span class="media-preview-modal__file-name" :title="record?.originalName || '资源预览'">{{ record?.originalName || '资源预览' }}</span>
        <a-tag v-if="record" :bordered="false" :color="fileTypeColor">{{ previewTypeLabel }}</a-tag>
      </div>
    </template>

    <div v-if="record" class="media-preview-workspace" :class="{ 'is-inspector-hidden': !inspectorVisible }">
      <main class="media-preview-workspace__canvas">
        <div class="media-preview-workspace__toolbar" role="toolbar" aria-label="资源预览操作">
          <div class="media-preview-workspace__summary">
            <span>{{ formatFileSize(record.size) }}</span>
            <span>{{ record.category || '未分类' }}</span>
          </div>
          <div class="media-preview-workspace__commands">
            <template v-if="previewType === 'image'">
              <a-tooltip title="缩小图片"><a-button type="text" aria-label="缩小图片" :disabled="imageScale <= 0.25" @click="changeImageScale(-0.15)"><template #icon><ZoomOutOutlined /></template></a-button></a-tooltip>
              <a-dropdown :trigger="['click']" placement="bottomRight">
                <a-button type="text" class="media-preview-workspace__zoom-trigger" aria-label="选择图片缩放比例">
                  <span class="media-preview-workspace__zoom">{{ Math.round(imageScale * 100) }}%</span>
                </a-button>
                <template #overlay>
                  <a-menu @click="selectImageScale">
                    <a-menu-item key="fit">适应窗口</a-menu-item>
                    <a-menu-item key="0.5">50%</a-menu-item>
                    <a-menu-item key="0.75">75%</a-menu-item>
                    <a-menu-item key="1">100%</a-menu-item>
                    <a-menu-item key="1.5">150%</a-menu-item>
                    <a-menu-item key="2">200%</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <a-tooltip title="放大图片"><a-button type="text" aria-label="放大图片" :disabled="imageScale >= 4" @click="changeImageScale(0.15)"><template #icon><ZoomInOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="适应视图"><a-button type="text" aria-label="图片适应视图" @click="resetImageViewport"><template #icon><CompressOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="原始尺寸"><a-button type="text" aria-label="查看图片原始尺寸" @click="showImageOriginalSize"><template #icon><ColumnWidthOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="向左旋转"><a-button type="text" aria-label="向左旋转图片" @click="rotateImage(-90)"><template #icon><RotateLeftOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="向右旋转"><a-button type="text" aria-label="向右旋转图片" @click="rotateImage(90)"><template #icon><RotateRightOutlined /></template></a-button></a-tooltip>
              <span class="media-preview-workspace__command-divider" aria-hidden="true" />
            </template>
            <a-tooltip v-if="canCopyPreviewContent" title="复制预览内容"><a-button type="text" aria-label="复制预览内容" :disabled="textLoading || Boolean(textError)" @click="copyPreviewContent"><template #icon><CopyOutlined /></template></a-button></a-tooltip>
            <a-tooltip title="重新加载预览"><a-button type="text" aria-label="重新加载预览" :loading="previewRefreshing" @click="refreshPreview"><template #icon><ReloadOutlined /></template></a-button></a-tooltip>
            <a-tooltip :title="fullscreen ? '退出全屏' : '全屏预览'"><a-button type="text" :aria-label="fullscreen ? '退出全屏预览' : '全屏预览'" @click="toggleFullscreen"><template #icon><FullscreenExitOutlined v-if="fullscreen" /><FullscreenOutlined v-else /></template></a-button></a-tooltip>
            <span v-if="previewType !== 'image' && (previewType === 'text' || previewType === 'markdown' || previewType === 'html')" class="media-preview-workspace__content-count">{{ formatCharacterCount(textContent.length) }}</span>
            <span class="media-preview-workspace__command-divider" aria-hidden="true" />
            <a-tooltip title="新页面打开"><a-button type="text" aria-label="新页面打开资源" :href="previewOpenUrl" target="_blank" rel="noopener noreferrer"><template #icon><ExportOutlined /></template></a-button></a-tooltip>
            <a-tooltip title="下载资源"><a-button type="text" aria-label="下载资源" :href="previewOpenUrl" download><template #icon><DownloadOutlined /></template></a-button></a-tooltip>
            <a-tooltip :title="inspectorVisible ? '隐藏资源信息' : '显示资源信息'"><a-button class="media-preview-workspace__info-trigger" type="text" :aria-label="inspectorVisible ? '隐藏资源信息' : '显示资源信息'" @click="toggleInspector"><template #icon><InfoCircleOutlined /></template></a-button></a-tooltip>
          </div>
        </div>

        <section :key="previewRenderKey" class="media-preview-workspace__stage" :class="`is-${previewType}`">
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
              <a-spin v-if="imageLoading" class="media-preview-workspace__image-loading" tip="正在加载图片" />
              <img
                :key="imageKey"
                ref="imageElementRef"
                :src="record.url"
                :alt="record.originalName"
                class="media-preview-workspace__image"
                :style="{ transform: `translate3d(${imagePosition.x}px, ${imagePosition.y}px, 0) scale(${imageScale}) rotate(${imageRotation}deg)` }"
                draggable="false"
                @load="handleImageLoad"
                @error="handleImageError"
              >
            </div>
            <div v-else class="media-preview-workspace__fallback">
              <strong>图片预览不可用</strong>
              <p>文件可能已被移动、删除或当前浏览器无法解析此图片。</p>
              <div class="media-preview-workspace__fallback-actions">
                <a-button size="small" @click="retryImage"><template #icon><ReloadOutlined /></template>重新加载</a-button>
              </div>
            </div>
          </template>

          <video v-else-if="previewType === 'video'" ref="mediaElementRef" :src="record.url" controls preload="metadata" class="media-preview-workspace__media-player">您的浏览器不支持视频播放</video>

          <div v-else-if="previewType === 'audio'" class="media-preview-workspace__audio">
            <CustomerServiceOutlined class="media-preview-workspace__audio-icon" />
            <span class="media-preview-workspace__media-type">音频文件</span>
            <strong>{{ record.originalName }}</strong>
            <audio ref="mediaElementRef" :src="record.url" controls preload="metadata" class="media-preview-workspace__media-player">您的浏览器不支持音频播放</audio>
          </div>

          <template v-else-if="previewType === 'docx'">
            <MediaDocxPreview :open="open" :url="previewOpenUrl" />
          </template>

          <template v-else-if="previewType === 'pdf'">
            <a-spin v-if="frameLoading && !viewerError" class="media-preview-workspace__frame-loading" tip="正在准备预览" />
            <iframe v-if="!viewerError" :key="viewerKey" :src="previewOpenUrl" class="media-preview-workspace__frame" @load="handleFrameLoad" @error="handleFrameError" />
            <div v-else class="media-preview-workspace__fallback">
              <strong>PDF 预览不可用</strong>
              <p>当前浏览器无法完成内嵌 PDF 预览，可重试或下载后查看。</p>
              <div class="media-preview-workspace__fallback-actions">
                <a-button @click="retryViewer"><template #icon><ReloadOutlined /></template>重试预览</a-button>
              </div>
            </div>
          </template>

          <template v-else-if="previewType === 'html'">
            <a-spin v-if="textLoading" tip="加载页面中" />
            <div v-else-if="textError" class="media-preview-workspace__fallback">
              <strong>HTML 预览失败</strong>
              <p>{{ textError }}</p>
              <a-button size="small" @click="loadTextPreview(record)">重新加载</a-button>
            </div>
            <iframe
              v-else
              :srcdoc="htmlPreviewContent"
              class="media-preview-workspace__frame"
              sandbox=""
              referrerpolicy="no-referrer"
              title="HTML 文件预览"
            />
          </template>

          <template v-else-if="previewType === 'spreadsheet'">
            <MediaSpreadsheetPreview :open="open" :url="previewOpenUrl" :file-name="record.originalName" />
          </template>

          <template v-else-if="previewType === 'presentation'">
            <MediaPptxPreview :open="open" :url="previewOpenUrl" />
          </template>

          <template v-else-if="previewType === 'markdown'">
            <a-spin v-if="textLoading" tip="正在解析 Markdown" />
            <div v-else-if="textError" class="media-preview-workspace__fallback">
              <strong>Markdown 预览失败</strong>
              <p>{{ textError }}</p>
              <a-button size="small" @click="loadTextPreview(record)">重新加载</a-button>
            </div>
            <MediaMarkdownPreview v-else :content="textContent" :asset-base="markdownAssetBase" />
          </template>

          <template v-else-if="previewType === 'text'">
            <a-spin v-if="textLoading" tip="加载内容中" />
            <div v-else-if="textError" class="media-preview-workspace__fallback">
              <strong>文本预览失败</strong>
              <p>{{ textError }}</p>
              <a-button size="small" @click="loadTextPreview(record)">重新加载</a-button>
            </div>
            <pre v-else class="media-preview-workspace__code"><code>{{ textContent }}</code></pre>
          </template>

          <div v-else-if="previewType === 'unsupported-office'" class="media-preview-workspace__fallback">
            <FileUnknownOutlined class="media-preview-workspace__fallback-icon" />
            <strong>暂不支持本地预览</strong>
            <p>旧式 Office 文件或复杂演示文稿无法在浏览器中稳定还原，请使用下载或新页面打开。</p>
            <div class="media-preview-workspace__fallback-actions">
              <a-button type="primary" :href="previewOpenUrl" download><template #icon><DownloadOutlined /></template>下载文件</a-button>
            </div>
          </div>

          <div v-else class="media-preview-workspace__fallback">
            <FileZipOutlined v-if="record.fileClass === 'archive'" class="media-preview-workspace__fallback-icon" />
            <FileUnknownOutlined v-else class="media-preview-workspace__fallback-icon" />
            <strong>暂不支持在线预览</strong><p>可下载文件后使用本地应用查看。</p>
            <div class="media-preview-workspace__fallback-actions">
              <a-button type="primary" :href="previewOpenUrl" download><template #icon><DownloadOutlined /></template>下载文件</a-button>
            </div>
          </div>
        </section>
      </main>

      <button v-if="mobileInfoOpen" type="button" class="media-preview-inspector-backdrop" aria-label="关闭资源信息" @click="mobileInfoOpen = false" />
      <aside class="media-preview-inspector" :class="{ 'is-mobile-open': mobileInfoOpen }">
        <header class="media-preview-inspector__mobile-header">
          <strong>资源信息</strong>
          <a-button type="text" aria-label="关闭资源信息" @click="mobileInfoOpen = false">
            <template #icon><CloseOutlined /></template>
          </a-button>
        </header>
        <section class="media-preview-inspector__section">
          <h3>资源信息</h3>
          <dl class="media-preview-inspector__list">
            <div><dt>文件类型</dt><dd>{{ fileTypeDescription }}</dd></div>
            <div v-if="previewType === 'image' && imageNaturalSize"><dt>图片尺寸</dt><dd>{{ imageNaturalSize.width }} × {{ imageNaturalSize.height }} px</dd></div>
            <div><dt>资源分类</dt><dd>{{ record.category || '未分类' }}</dd></div>
            <div><dt>文件大小</dt><dd>{{ formatFileSize(record.size) }}</dd></div>
            <div><dt>上传时间</dt><dd>{{ formatDate(record.createdAt) }}</dd></div>
          </dl>
        </section>
        <section class="media-preview-inspector__section">
          <h3>访问地址</h3>
          <div class="media-preview-inspector__url">
            <code :title="previewOpenUrl">{{ previewDisplayUrl }}</code>
            <a-tooltip :title="copied ? '已复制访问地址' : '复制访问地址'"><a-button type="text" :aria-label="copied ? '已复制访问地址' : '复制访问地址'" @click="copyUrl"><template #icon><CheckOutlined v-if="copied" /><CopyOutlined v-else /></template></a-button></a-tooltip>
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
import { CheckOutlined, CloseOutlined, ColumnWidthOutlined, CompressOutlined, CopyOutlined, CustomerServiceOutlined, DownloadOutlined, ExportOutlined, FileUnknownOutlined, FileZipOutlined, FullscreenExitOutlined, FullscreenOutlined, InfoCircleOutlined, LinkOutlined, ReloadOutlined, RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons-vue'
import MediaDocxPreview from './MediaDocxPreview.vue'
import MediaMarkdownPreview from './MediaMarkdownPreview.vue'
import MediaPptxPreview from './MediaPptxPreview.vue'
import MediaSpreadsheetPreview from './MediaSpreadsheetPreview.vue'

const props = defineProps({ open: { type: Boolean, default: false }, record: { type: Object, default: null } })
const emit = defineEmits(['update:open'])
const imageScale = ref(1)
const imagePosition = ref({ x: 0, y: 0 })
const imageRotation = ref(0)
const imageDragging = ref(false)
const imageLoadError = ref(false)
const imageLoading = ref(false)
const imageKey = ref(0)
const imageElementRef = ref(null)
const imageNaturalSize = ref(null)
const mediaElementRef = ref(null)
const fullscreen = ref(false)
const previewRefreshing = ref(false)
const previewRenderKey = ref(0)
const textContent = ref('')
const textLoading = ref(false)
const textError = ref('')
const viewerKey = ref(0)
const frameLoading = ref(false)
const viewerError = ref(false)
const mobileInfoOpen = ref(false)
const inspectorVisible = ref(true)
const copied = ref(false)
const canCopyPreviewContent = computed(() => ['text', 'markdown', 'html'].includes(previewType.value))
const modalWrapClass = computed(() => fullscreen.value ? 'media-preview-modal is-fullscreen' : 'media-preview-modal')
let copiedTimer = null
let viewerFallbackTimer = null
let textRequestId = 0
let imagePointerId = null
let imagePointerStart = null
const imagePointers = new Map()
let imagePinchStart = null

const previewType = computed(() => getPreviewType(props.record))
const previewOpenUrl = computed(() => props.record?.url ? new URL(props.record.url, window.location.origin).href : '')
const markdownAssetBase = computed(() => {
  try {
    const pathname = new URL(previewOpenUrl.value).pathname
    return pathname.slice(0, pathname.lastIndexOf('/'))
  } catch {
    return ''
  }
})
const previewTypeLabel = computed(() => ({ image: '图片', video: '视频', audio: '音频', pdf: 'PDF', docx: 'Word', spreadsheet: '表格', presentation: 'PPTX', markdown: 'Markdown', html: 'HTML', text: '文本', 'unsupported-office': 'Office 文件', other: '文件' }[previewType.value]))
const fileTypeDescription = computed(() => {
  const labels = { image: '图片', video: '视频', audio: '音频', pdf: 'PDF 文档', docx: 'Word 文档', spreadsheet: '表格', presentation: '演示文稿', markdown: 'Markdown 文档', html: 'HTML 页面', text: '文本文件', 'unsupported-office': 'Office 文件', other: '其他文件' }
  const label = labels[previewType.value] || '未知文件'
  return props.record?.mimeType ? `${label}（${props.record.mimeType}）` : label
})
const previewDisplayUrl = computed(() => {
  try {
    return new URL(previewOpenUrl.value).pathname
  } catch {
    return props.record?.url || '-'
  }
})
const fileTypeColor = computed(() => ({ image: 'blue', video: 'purple', audio: 'cyan', pdf: 'red', docx: 'blue', spreadsheet: 'green', presentation: 'orange', markdown: 'geekblue', html: 'cyan', text: 'geekblue', 'unsupported-office': 'default', other: 'default' }[previewType.value]))
const htmlPreviewContent = computed(() => {
  const content = String(textContent.value || '')
  if (/<\s*html[\s>]/i.test(content)) return content
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${content}</body></html>`
})

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
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') return 'docx'
  if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || ['xlsx', 'csv', 'tsv', 'tab'].includes(ext)) return 'spreadsheet'
  if (mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || ext === 'pptx') return 'presentation'
  if (['doc', 'xls', 'ppt'].includes(ext)) return 'unsupported-office'
  if (mime === 'text/markdown' || ['md', 'markdown', 'mdown', 'mkdn'].includes(ext)) return 'markdown'
  if (['text/html', 'application/xhtml+xml'].includes(mime) || ['html', 'htm', 'xhtml'].includes(ext)) return 'html'
  if (mime.startsWith('text/') || ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'mts', 'cts', 'vue', 'svelte', 'astro', 'json', 'map', 'yml', 'yaml', 'xml', 'html', 'xhtml', 'css', 'scss', 'less', 'txt', 'log', 'mdx', 'sh', 'bat', 'ps1', 'py', 'java', 'go', 'rb', 'php', 'sql', 'graphql', 'gql', 'proto', 'c', 'cpp', 'h', 'cs', 'kt', 'swift', 'rs', 'dart', 'ex', 'exs', 'pl', 'r', 'asm', 'ini', 'conf', 'properties', 'toml', 'env', 'lock', 'diff', 'patch', 'gitignore', 'editorconfig', 'npmrc', 'prettierrc', 'eslintrc', 'dockerfile', 'code-profile'].includes(ext)) return 'text'
  return 'other'
}

function initializePreview() {
  resetPreview()
  if (previewType.value === 'pdf') startFramePreview()
  if (['html', 'markdown', 'text'].includes(previewType.value)) loadTextPreview(props.record)
}

function resetPreview() {
  clearViewerFallbackTimer()
  textRequestId += 1
  resetImageViewport()
  imageLoadError.value = false
  imageLoading.value = previewType.value === 'image'
  imageKey.value += 1
  imageNaturalSize.value = null
  textContent.value = ''
  textLoading.value = false
  textError.value = ''
  frameLoading.value = false
  viewerError.value = false
  mobileInfoOpen.value = false
  inspectorVisible.value = true
  fullscreen.value = false
  previewRefreshing.value = false
  copied.value = false
  if (copiedTimer) clearTimeout(copiedTimer)
}

function toggleInspector() {
  if (window.matchMedia('(max-width: 820px)').matches) {
    mobileInfoOpen.value = true
    return
  }
  if (fullscreen.value) {
    fullscreen.value = false
    inspectorVisible.value = true
    return
  }
  inspectorVisible.value = !inspectorVisible.value
}

function refreshPreview() {
  previewRefreshing.value = true
  if (previewType.value === 'image') {
    retryImage()
  } else if (previewType.value === 'pdf') {
    startFramePreview()
  } else if (['html', 'markdown', 'text'].includes(previewType.value)) {
    loadTextPreview(props.record)
  } else if (['video', 'audio'].includes(previewType.value)) {
    const media = mediaElementRef.value
    if (media) {
      media.currentTime = 0
      media.load()
    }
  } else {
    previewRenderKey.value += 1
  }

  window.setTimeout(() => { previewRefreshing.value = false }, 500)
}

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value
}

async function copyPreviewContent() {
  try {
    await navigator.clipboard.writeText(textContent.value)
    message.success('预览内容已复制')
  } catch {
    message.error('复制失败，请检查浏览器剪贴板权限')
  }
}

function formatCharacterCount(count = 0) {
  return `${Number(count).toLocaleString('zh-CN')} 字符`
}

function startFramePreview() {
  viewerKey.value += 1
  frameLoading.value = true
  viewerError.value = false
  clearViewerFallbackTimer()
  if (previewType.value === 'pdf') {
    viewerFallbackTimer = setTimeout(() => {
      if (props.open && previewType.value === 'pdf' && frameLoading.value) {
        frameLoading.value = false
        viewerError.value = true
      }
    }, 12000)
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
  textError.value = ''
  try {
    const response = await fetch(record.url, { credentials: 'include' })
    if (!response.ok) throw new Error(`无法加载文件内容（HTTP ${response.status}）`)
    const content = await response.text()
    if (requestId === textRequestId) textContent.value = content
  } catch (error) {
    if (requestId === textRequestId) textError.value = error?.message || '加载文件内容失败，请新页面打开或下载后查看。'
  } finally {
    if (requestId === textRequestId) textLoading.value = false
  }
}

function changeImageScale(delta) {
  const nextScale = clampImageScale(imageScale.value + delta)
  imageScale.value = nextScale
  if (nextScale <= 1) imagePosition.value = { x: 0, y: 0 }
}

function selectImageScale({ key }) {
  if (key === 'fit') {
    resetImageViewport()
    return
  }
  imageScale.value = clampImageScale(Number(key))
  if (imageScale.value <= 1) imagePosition.value = { x: 0, y: 0 }
}

function showImageOriginalSize() {
  const image = imageElementRef.value
  if (!image?.naturalWidth || !image.clientWidth) return
  imageScale.value = clampImageScale(image.naturalWidth / image.clientWidth)
  imagePosition.value = { x: 0, y: 0 }
}

function clampImageScale(value) {
  return Math.min(4, Math.max(0.25, Number(value.toFixed(2))))
}

function resetImageViewport() {
  imageScale.value = 1
  imagePosition.value = { x: 0, y: 0 }
  imageRotation.value = 0
  imageDragging.value = false
  imagePointerId = null
  imagePointerStart = null
  imagePointers.clear()
  imagePinchStart = null
}

function rotateImage(degrees) {
  imageRotation.value = (imageRotation.value + degrees + 360) % 360
}

function handleImageWheel(event) {
  changeImageScale(event.deltaY < 0 ? 0.12 : -0.12)
}

function handleImagePointerDown(event) {
  const isTouchPointer = event.pointerType === 'touch' || event.pointerType === 'pen'
  if (!isTouchPointer && (imageScale.value <= 1 || event.button !== 0)) return

  imagePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  event.currentTarget.setPointerCapture?.(event.pointerId)

  if (isTouchPointer && imagePointers.size >= 2) {
    const [first, second] = Array.from(imagePointers.values()).slice(0, 2)
    imagePinchStart = {
      distance: pointerDistance(first, second),
      midpoint: pointerMidpoint(first, second),
      scale: imageScale.value,
      offsetX: imagePosition.value.x,
      offsetY: imagePosition.value.y
    }
    imagePointerId = null
    imagePointerStart = null
    imageDragging.value = true
    return
  }

  if (isTouchPointer && imageScale.value <= 1) return
  imagePointerId = event.pointerId
  imagePointerStart = { x: event.clientX, y: event.clientY, offsetX: imagePosition.value.x, offsetY: imagePosition.value.y }
  imageDragging.value = true
}

function handleImagePointerMove(event) {
  if (imagePointers.has(event.pointerId)) imagePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (imagePinchStart && imagePointers.size >= 2) {
    const [first, second] = Array.from(imagePointers.values()).slice(0, 2)
    const nextScale = clampImageScale(imagePinchStart.scale * pointerDistance(first, second) / imagePinchStart.distance)
    imageScale.value = nextScale
    if (nextScale <= 1) {
      imagePosition.value = { x: 0, y: 0 }
      return
    }
    const midpoint = pointerMidpoint(first, second)
    imagePosition.value = {
      x: imagePinchStart.offsetX + midpoint.x - imagePinchStart.midpoint.x,
      y: imagePinchStart.offsetY + midpoint.y - imagePinchStart.midpoint.y
    }
    return
  }

  if (!imageDragging.value || event.pointerId !== imagePointerId || !imagePointerStart) return
  imagePosition.value = {
    x: imagePointerStart.offsetX + event.clientX - imagePointerStart.x,
    y: imagePointerStart.offsetY + event.clientY - imagePointerStart.y
  }
}

function handleImagePointerEnd(event) {
  const wasTracked = imagePointers.has(event.pointerId)
  if (!wasTracked && event.pointerId !== imagePointerId) return
  imagePointers.delete(event.pointerId)
  if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture?.(event.pointerId)

  if (imagePinchStart) {
    imagePinchStart = null
    const remainingPointer = Array.from(imagePointers.entries())[0]
    if (remainingPointer && imageScale.value > 1) {
      imagePointerId = remainingPointer[0]
      imagePointerStart = {
        x: remainingPointer[1].x,
        y: remainingPointer[1].y,
        offsetX: imagePosition.value.x,
        offsetY: imagePosition.value.y
      }
      imageDragging.value = true
    } else {
      imagePointerId = null
      imagePointerStart = null
      imageDragging.value = false
    }
    return
  }

  if (event.pointerId !== imagePointerId) return
  imageDragging.value = false
  imagePointerId = null
  imagePointerStart = null
}

function pointerDistance(first, second) {
  return Math.max(1, Math.hypot(second.x - first.x, second.y - first.y))
}

function pointerMidpoint(first, second) {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
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
  imageLoading.value = false
  imageNaturalSize.value = { width: imageElementRef.value?.naturalWidth || 0, height: imageElementRef.value?.naturalHeight || 0 }
}

function handleImageError() {
  imageLoading.value = false
  imageLoadError.value = true
}

function retryImage() {
  imageLoadError.value = false
  imageLoading.value = true
  imageKey.value += 1
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
    copied.value = true
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => { copied.value = false }, 1800)
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

onUnmounted(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
  resetPreview()
})
</script>

<style src="./MediaPreviewModal.css" scoped></style>
