<template>
  <div class="resource-share-page">
    <header class="resource-share-header">
      <div class="resource-share-brand">
        <span><CloudDownloadOutlined /></span>
        <div><strong>资源分享</strong><small>安全文件交付</small></div>
      </div>
      <a-tooltip :title="appStore.isDark ? '切换浅色模式' : '切换深色模式'">
        <a-button type="text" class="resource-share-theme" aria-label="切换页面主题" @click="appStore.toggleTheme()">
          <template #icon><Moon v-if="!appStore.isDark" :size="17" /><Sun v-else :size="17" /></template>
        </a-button>
      </a-tooltip>
    </header>

    <main class="resource-share-main">
      <div v-if="loading" class="resource-share-state"><a-spin size="large" /><span>正在读取资源包</span></div>

      <section v-else-if="errorState" class="resource-share-error">
        <a-result :status="errorState.status" :title="errorState.title" :sub-title="errorState.description">
          <template #extra><a-button v-if="errorState.retry" type="primary" @click="loadShare">重新加载</a-button></template>
        </a-result>
      </section>

      <section v-else-if="share && !share.unlocked" class="resource-share-gate">
        <div class="resource-share-gate__icon"><LockOutlined /></div>
        <span class="resource-share-gate__label">提取码访问</span>
        <h1>{{ share.name }}</h1>
        <p>{{ share.description || '该资源包受到提取码保护，请输入分享者提供的 4 位数字提取码。' }}</p>
        <a-input
          :value="passwordCode"
          class="resource-share-code"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="4"
          placeholder="请输入 4 位提取码"
          @update:value="setPasswordCode"
          @press-enter="verifyPassword"
        />
        <a-button type="primary" size="large" block :loading="verifying" :disabled="passwordCode.length !== 4" @click="verifyPassword">
          验证并打开资源包
        </a-button>
        <a-alert v-if="passwordError" type="error" show-icon :message="passwordError" />
        <div class="resource-share-gate__meta"><span>{{ expiryLabel }}</span><span>{{ accessLimitLabel }}</span></div>
      </section>

      <section v-else-if="share" class="resource-share-sheet">
        <div class="resource-share-sheet__heading">
          <div class="resource-share-sheet__title">
            <span class="resource-share-sheet__eyebrow"><SafetyCertificateOutlined /> 已通过访问校验</span>
            <h1>{{ share.name }}</h1>
            <p v-if="share.description">{{ share.description }}</p>
          </div>
          <a-button type="primary" size="large" :loading="downloadState.active" @click="downloadArchive">
            <template #icon><DownloadOutlined /></template>
            下载全部
          </a-button>
        </div>

        <dl class="resource-share-facts">
          <div><dt>文件数量</dt><dd>{{ share.items.length }} 个</dd></div>
          <div><dt>资源包体积</dt><dd>{{ formatFileSize(totalSize) }}</dd></div>
          <div><dt>有效期至</dt><dd>{{ expiryLabel }}</dd></div>
          <div><dt>访问额度</dt><dd>{{ accessLimitLabel }}</dd></div>
        </dl>

        <div class="resource-share-security">
          <SafetyCertificateOutlined />
          <span>所有文件均通过分享权限校验提供，原始存储地址不会公开。</span>
        </div>

        <div class="resource-share-files">
          <div class="resource-share-files__head">
            <div><strong>资源清单</strong><span>选择文件可在线预览或单独下载</span></div>
            <span>共 {{ share.items.length }} 个</span>
          </div>
          <article v-for="item in share.items" :key="item.entryId" class="resource-share-file">
            <button
              v-if="item.previewType === 'image' && !failedThumbnails.has(item.entryId)"
              type="button"
              class="resource-share-file__thumbnail"
              :aria-label="`预览 ${item.originalName}`"
              @click="openPreview(item)"
            >
              <img :src="getPreviewUrl(item)" :alt="item.originalName" loading="lazy" @error="markThumbnailFailed(item.entryId)">
            </button>
            <div v-else class="resource-share-file__icon"><component :is="fileIcon(item)" /></div>
            <div class="resource-share-file__info">
              <button v-if="item.previewType !== 'other'" type="button" :title="item.originalName" @click="openPreview(item)">{{ item.originalName }}</button>
              <strong v-else :title="item.originalName">{{ item.originalName }}</strong>
              <span>{{ fileTypeLabel(item) }} · {{ formatFileSize(item.size) }}</span>
            </div>
            <div class="resource-share-file__actions">
              <a-tooltip v-if="item.previewType !== 'other'" title="预览资源">
                <a-button type="text" :aria-label="`预览 ${item.originalName}`" @click="openPreview(item)">
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="下载资源">
                <a-button type="text" :aria-label="`下载 ${item.originalName}`" :disabled="downloadState.active" @click="downloadItem(item)">
                  <template #icon><DownloadOutlined /></template>
                </a-button>
              </a-tooltip>
            </div>
          </article>
        </div>
        <TransferProgressPanel
          v-if="downloadState.visible"
          class="resource-share-transfer"
          :title="downloadState.title"
          :subtitle="downloadState.subtitle"
          :loaded="downloadState.loaded"
          :total="downloadState.total"
          :percent="downloadState.percent"
          :speed="downloadState.speed"
          :remaining-seconds="downloadState.remainingSeconds"
          :status="downloadState.status"
        >
          <template #actions>
            <span v-if="downloadState.status === 'browser'" class="resource-share-transfer__hint">进度请在浏览器下载面板查看</span>
            <a-button v-if="downloadState.active" size="small" @click="cancelDownload">取消下载</a-button>
            <a-button v-else size="small" @click="resetDownloadState">关闭</a-button>
          </template>
        </TransferProgressPanel>
      </section>
    </main>

    <footer class="resource-share-footer">资源分享页面 · 无需登录账号</footer>

    <MediaSharePreviewModal
      v-model:open="previewVisible"
      :item="previewItem"
      :preview-url="previewItem ? getPreviewUrl(previewItem) : ''"
      :download-url="previewItem ? getDownloadUrl(previewItem) : ''"
      :download-disabled="downloadState.active"
      @download="downloadItem(previewItem)"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  CloudDownloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SoundOutlined,
  VideoCameraOutlined
} from '@ant-design/icons-vue'
import { Moon, Sun } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import {
  claimPublicMediaShare,
  getPublicMediaShare,
  getPublicMediaShareArchiveUrl,
  getPublicMediaShareContentUrl,
  verifyPublicMediaShare
} from '@/services/mediaShare'
import MediaSharePreviewModal from './MediaSharePreviewModal.vue'
import TransferProgressPanel from '@/components/TransferProgressPanel.vue'
import { downloadWithProgress } from '@/utils/downloadWithProgress'
import './media-share-page.css'

const route = useRoute()
const appStore = useAppStore()
const loading = ref(true)
const verifying = ref(false)
const share = ref(null)
const requestError = ref(null)
const passwordCode = ref('')
const passwordError = ref('')
const previewVisible = ref(false)
const previewItem = ref(null)
const failedThumbnails = ref(new Set())
const downloadState = ref(createEmptyDownloadState())
let downloadAbortController = null
const publicId = computed(() => String(route.params.publicId || ''))
const totalSize = computed(() => share.value?.items?.reduce((sum, item) => sum + item.size, 0) || 0)
const archiveUrl = computed(() => getPublicMediaShareArchiveUrl(publicId.value))
const expiryLabel = computed(() => share.value?.expiresAt ? formatDate(share.value.expiresAt) : '永久有效')
const accessLimitLabel = computed(() => share.value?.maxAccessCount === null
  ? '不限制访问人数'
  : `剩余 ${share.value?.remainingAccessCount ?? 0} / ${share.value.maxAccessCount} 人`)
const errorState = computed(() => {
  if (!requestError.value) return null
  const states = {
    SHARE_NOT_FOUND: { status: '404', title: '分享链接不存在', description: '请确认链接是否完整，或联系分享者重新获取。' },
    SHARE_REVOKED: { status: 'warning', title: '分享已被撤销', description: '分享者已停止该资源包的访问。' },
    SHARE_EXPIRED: { status: 'warning', title: '分享已过期', description: '该资源包已经超过有效期。' },
    SHARE_ACCESS_EXHAUSTED: { status: 'warning', title: '访问名额已用完', description: '该资源包已达到最大访问人数。' }
  }
  return states[requestError.value.code] || {
    status: 'error',
    title: '资源包加载失败',
    description: requestError.value.message || '网络异常，请稍后再试。',
    retry: true
  }
})

watch(publicId, loadShare, { immediate: true })

async function loadShare() {
  loading.value = true
  requestError.value = null
  passwordError.value = ''
  share.value = null
  failedThumbnails.value = new Set()
  try {
    let result = await getPublicMediaShare(publicId.value)
    if (result.mode === 'public' && !result.unlocked) {
      result = await claimPublicMediaShare(publicId.value)
    }
    share.value = result
  } catch (error) {
    requestError.value = error
  } finally {
    loading.value = false
  }
}

function setPasswordCode(value) {
  passwordCode.value = String(value || '').replace(/\D/g, '').slice(0, 4)
  passwordError.value = ''
}

async function verifyPassword() {
  if (passwordCode.value.length !== 4 || verifying.value) return
  verifying.value = true
  passwordError.value = ''
  try {
    share.value = await verifyPublicMediaShare(publicId.value, passwordCode.value)
  } catch (error) {
    passwordError.value = error.code === 'SHARE_PASSWORD_RATE_LIMITED'
      ? '尝试次数过多，请稍后再试。'
      : (error.message || '提取码验证失败')
  } finally {
    verifying.value = false
  }
}

function openPreview(item) {
  previewItem.value = item
  previewVisible.value = true
}

function markThumbnailFailed(entryId) {
  failedThumbnails.value = new Set([...failedThumbnails.value, entryId])
}

function getPreviewUrl(item) {
  return getPublicMediaShareContentUrl(publicId.value, item.entryId)
}

function getDownloadUrl(item) {
  return getPublicMediaShareContentUrl(publicId.value, item.entryId, 'attachment')
}

function createEmptyDownloadState() {
  return { visible: false, active: false, title: '', subtitle: '', loaded: 0, total: 0, percent: 0, speed: 0, remainingSeconds: 0, status: 'active' }
}

function resetDownloadState() {
  if (downloadState.value.active) return
  downloadState.value = createEmptyDownloadState()
}

function cancelDownload() {
  downloadAbortController?.abort()
}

async function runDownload({ url, filename, title, subtitle, expectedSize = 0 }) {
  if (downloadState.value.active) return
  downloadAbortController = new AbortController()
  downloadState.value = { ...createEmptyDownloadState(), visible: true, active: true, title, subtitle }
  try {
    const result = await downloadWithProgress(url, {
      filename,
      expectedSize,
      signal: downloadAbortController.signal,
      onProgress: (progress) => {
        downloadState.value = { ...downloadState.value, ...progress, active: progress.status === 'active' }
      }
    })
    downloadState.value = { ...downloadState.value, active: false, status: result.method === 'browser' ? 'browser' : 'success' }
  } catch (error) {
    const cancelled = error.name === 'AbortError'
    downloadState.value = { ...downloadState.value, active: false, status: cancelled ? 'cancelled' : 'error', subtitle: cancelled ? '下载已取消' : (error.message || '下载失败') }
  } finally {
    downloadAbortController = null
  }
}

function downloadItem(item) {
  if (!item) return
  return runDownload({
    url: getDownloadUrl(item),
    filename: item.originalName,
    title: `下载 ${item.originalName}`,
    subtitle: formatFileSize(item.size),
    expectedSize: item.size || 0
  })
}

function downloadArchive() {
  return runDownload({
    url: archiveUrl.value,
    filename: `${share.value?.name || 'resource-package'}.zip`,
    title: '下载全部资源',
    subtitle: `${share.value?.items?.length || 0} 个文件 · 原始体积 ${formatFileSize(totalSize.value)}`
  })
}

function fileIcon(item) {
  return ({ image: FileImageOutlined, video: VideoCameraOutlined, audio: SoundOutlined, pdf: FilePdfOutlined, text: FileTextOutlined }[item.previewType] || FileOutlined)
}

function fileTypeLabel(item) {
  return ({ image: '图片', video: '视频', audio: '音频', pdf: 'PDF', text: '文本' }[item.previewType] || item.mimeType || '文件')
}

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024 * 1024) return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  if (size >= 1024) return `${Math.round(size / 1024)} KB`
  return `${size} B`
}

function formatDate(value) {
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}
</script>
