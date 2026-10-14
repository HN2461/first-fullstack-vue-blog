<template>
  <a-modal
    :open="store.modalOpen"
    title="上传资源"
    width="680px"
    wrap-class-name="media-upload-modal-wrap"
    :mask-closable="false"
    :body-style="{ overflow: 'hidden', maxHeight: 'calc(100dvh - 200px)' }"
    @cancel="store.modalOpen = false"
  >
    <div class="media-upload-modal">
      <div class="media-upload-modal__destination">
        <label for="media-upload-category">上传到</label>
        <a-select
          id="media-upload-category"
          :value="store.categoryId"
          :options="store.categoryOptions"
          :disabled="store.started || store.clearing"
          show-search
          option-filter-prop="label"
          placeholder="选择资源分类"
          @change="store.updateCategory"
        />
        <a-tooltip title="查看上传与下载说明">
          <a-button type="text" size="small" aria-label="查看上传与下载说明" @click="helpOpen = true">
            <template #icon><QuestionCircleOutlined /></template>
          </a-button>
        </a-tooltip>
      </div>

      <a-upload-dragger
        v-if="!store.started"
        class="media-upload-modal__dropzone"
        multiple
        :before-upload="beforeUpload"
        :show-upload-list="false"
        :accept="uploadAccept"
        :disabled="store.clearing"
      >
        <div class="media-upload-modal__dropzone-content">
          <InboxOutlined />
          <div><strong>拖拽文件，或点击选择</strong><span>最多 {{ store.rules.maxFiles }} 个 · 单文件不超过 {{ store.rules.maxFileSizeMB }}MB</span></div>
        </div>
      </a-upload-dragger>

      <TransferProgressPanel
        v-if="store.started"
        :title="store.currentTask ? `正在上传：${store.currentTask.file.name}` : store.statusText"
        :subtitle="progressSubtitle"
        v-bind="store.progress"
        :status="store.state"
        :status-text="store.statusText"
      />

      <a-alert v-if="store.errorMessage" type="error" show-icon :message="store.errorMessage" />

      <div class="media-upload-modal__queue-heading">
        <span>文件清单 <strong>{{ store.tasks.length }}</strong><small>{{ formatTransferSize(store.totalSize) }}</small></span>
        <a-button v-if="store.tasks.length && !store.started" type="link" size="small" :disabled="store.clearing" @click="store.clear">清空</a-button>
        <span v-else-if="store.started" class="media-upload-modal__summary">已完成 {{ store.successCount }} / {{ store.tasks.length }}</span>
      </div>

      <div class="media-upload-modal__files" tabindex="0" aria-label="上传文件清单">
        <div v-if="!store.tasks.length" class="media-upload-modal__empty">选择文件后，可在这里确认清单再开始上传</div>
        <div v-for="task in store.tasks" :key="task.id" class="media-upload-modal__file">
          <FileOutlined class="media-upload-modal__file-icon" />
          <div class="media-upload-modal__file-info">
            <a-tooltip :title="task.file.name"><strong>{{ task.file.name }}</strong></a-tooltip>
            <span>{{ formatTransferSize(task.file.size) }}<template v-if="task.loaded && task.status !== 'success'"> · 已传 {{ formatTransferSize(task.loaded) }}</template></span>
            <span v-if="task.error" class="media-upload-modal__file-error">{{ task.error }}</span>
            <span v-else-if="task.note">{{ task.note }}</span>
          </div>
          <a-tag v-if="store.started" :color="tagColor(task.status)">{{ UPLOAD_STATE_LABELS[task.status] }}</a-tag>
          <a-tooltip v-if="!store.running && task.status !== 'success'" title="移除此文件">
            <a-button type="text" size="small" :disabled="store.clearing" :aria-label="`移除 ${task.file.name}`" @click="store.removeFile(task.id)">
              <template #icon><CloseOutlined /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="media-upload-modal__footer">
        <span class="media-upload-modal__footer-hint">{{ store.running ? '关闭弹窗后继续上传，可从右上角查看进度' : store.started ? '已完成文件已入库，失败文件可单独继续' : `确认后上传到「${store.categoryName}」` }}</span>
        <div class="media-upload-modal__footer-actions">
          <a-popconfirm v-if="store.started && store.remainingCount" title="取消未完成的上传？已入库资源会保留。" @confirm="store.cancel">
            <a-button danger :disabled="store.clearing">取消上传</a-button>
          </a-popconfirm>
          <a-button v-if="store.running" @click="store.pause">暂停</a-button>
          <a-button v-if="store.running" type="primary" @click="store.modalOpen = false">后台上传</a-button>
          <template v-else>
            <a-button @click="store.modalOpen = false">{{ store.state === 'success' ? '完成' : '关闭' }}</a-button>
            <a-button v-if="store.started && !store.remainingCount" type="primary" :loading="store.clearing" @click="store.clear">继续添加文件</a-button>
            <a-button v-else type="primary" :disabled="!store.tasks.length || !store.remainingCount || store.clearing" @click="store.start">
              {{ store.started ? '继续未完成文件' : `开始上传${store.tasks.length ? `（${store.tasks.length}）` : ''}` }}
            </a-button>
          </template>
        </div>
      </div>
    </template>
  </a-modal>
  <MediaGuideModal v-model:open="helpOpen" topic="upload" />
</template>

<script setup>
import { computed, ref } from 'vue'
import { CloseOutlined, FileOutlined, InboxOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import TransferProgressPanel from '@/components/TransferProgressPanel.vue'
import { UPLOAD_STATE_LABELS, useMediaUploadStore } from '@/stores/mediaUpload'
import { formatTransferSize } from '@/utils/transferProgress'
import { buildMediaUploadAccept, getMediaFileExtension, isMediaFileExtensionAllowed } from './mediaUploadConfig'
import MediaGuideModal from './MediaGuideModal.vue'

const store = useMediaUploadStore()
const helpOpen = ref(false)
const uploadAccept = computed(() => buildMediaUploadAccept(store.rules.allowedExtensions))
const progressSubtitle = computed(() => `${store.categoryName} · 已完成 ${store.successCount}/${store.tasks.length}${store.failedCount ? ` · ${store.failedCount} 个失败` : ''}`)

function beforeUpload(file) {
  if (store.tasks.length >= store.rules.maxFiles) store.errorMessage = `单次最多选择 ${store.rules.maxFiles} 个文件`
  else if (file.size > store.rules.maxFileSizeMB * 1024 * 1024) store.errorMessage = `单文件大小不能超过 ${store.rules.maxFileSizeMB}MB`
  else if (!isMediaFileExtensionAllowed(file.name, store.rules.allowedExtensions)) store.errorMessage = `当前上传限制不支持 ${getMediaFileExtension(file.name) || '无扩展名'} 文件`
  else store.addFile(file)
  return false
}

function tagColor(status) {
  if (status === 'success') return 'success'
  if (status === 'error') return 'error'
  if (status === 'paused' || status === 'retrying') return 'warning'
  if (['uploading', 'preparing', 'confirming'].includes(status)) return 'processing'
  return undefined
}
</script>

<style>
.media-upload-modal-wrap .ant-modal { top: 32px; max-width: calc(100vw - 32px); padding-bottom: 48px; }
.media-upload-modal-wrap .ant-modal-body { padding-top: 16px; }
@media (max-width: 600px) {
  .media-upload-modal-wrap .ant-modal { top: 16px; padding-bottom: 32px; }
}
</style>

<style scoped>
.media-upload-modal { display: flex; flex-direction: column; gap: 14px; max-height: min(62vh, calc(100dvh - 240px)); min-height: 0; overflow: hidden; }
.media-upload-modal__destination { display: flex; align-items: center; gap: 12px; flex: none; }
.media-upload-modal__destination label { color: var(--console-text); white-space: nowrap; }
.media-upload-modal__destination :deep(.ant-select) { flex: 1; min-width: 0; }
.media-upload-modal__destination > .anticon { color: var(--console-text-secondary); }
.media-upload-modal__dropzone { flex: none; }
.media-upload-modal__dropzone :deep(.ant-upload-drag) { border-radius: 6px; background: var(--console-surface-muted); }
.media-upload-modal__dropzone-content { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 5px 12px; }
.media-upload-modal__dropzone-content > .anticon { color: var(--console-primary); font-size: 30px; }
.media-upload-modal__dropzone-content > div { display: grid; gap: 4px; text-align: left; }
.media-upload-modal__dropzone-content strong { color: var(--console-text); font-size: 14px; font-weight: 500; }
.media-upload-modal__dropzone-content span { color: var(--console-text-secondary); font-size: 12px; }
.media-upload-modal :deep(.transfer-progress) { flex: none; }
.media-upload-modal__queue-heading { display: flex; flex: none; align-items: center; justify-content: space-between; gap: 8px; color: var(--console-text); font-size: 13px; }
.media-upload-modal__queue-heading strong { margin-left: 6px; }
.media-upload-modal__queue-heading small { margin-left: 12px; color: var(--console-text-secondary); }
.media-upload-modal__summary { color: var(--console-text-secondary); font-size: 12px; }
.media-upload-modal__files { min-height: 44px; max-height: 280px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; border-block: 1px solid var(--console-border); }
.media-upload-modal__file { display: flex; align-items: center; gap: 10px; padding: 12px 2px; border-bottom: 1px solid var(--console-border); }
.media-upload-modal__file:last-child { border-bottom: 0; }
.media-upload-modal__file-icon { color: var(--console-text-secondary); font-size: 20px; }
.media-upload-modal__file-info { display: grid; gap: 3px; flex: 1; min-width: 0; }
.media-upload-modal__file-info strong { overflow: hidden; color: var(--console-text); font-size: 13px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.media-upload-modal__file-info span { color: var(--console-text-secondary); font-size: 12px; overflow-wrap: anywhere; }
.media-upload-modal__file-info .media-upload-modal__file-error { color: var(--ant-color-error, #f56c6c); }
.media-upload-modal__file :deep(.ant-tag) { margin: 0; flex: none; }
.media-upload-modal__empty { padding: 24px 12px; color: var(--console-text-secondary); text-align: center; font-size: 13px; }
.media-upload-modal__footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; }
.media-upload-modal__footer-hint { max-width: 200px; color: var(--console-text-secondary); font-size: 12px; }
.media-upload-modal__footer-actions { display: flex; flex: none; align-items: center; gap: 8px; }
.media-upload-modal__footer-actions :deep(.ant-btn + .ant-btn) { margin: 0; }
@media (max-width: 600px) {
  .media-upload-modal { max-height: calc(100dvh - 300px); gap: 10px; }
  .media-upload-modal__footer { align-items: stretch; flex-direction: column; gap: 8px; }
  .media-upload-modal__footer-hint { max-width: none; }
  .media-upload-modal__footer-actions { justify-content: flex-end; flex-wrap: wrap; }
}
@media (max-height: 600px) {
  /* 极矮视口使用单一内容滚动区，进度置顶吸附，避免固定区域挤掉整个文件清单。 */
  .media-upload-modal { display: block; overflow-y: auto; overscroll-behavior: contain; }
  .media-upload-modal > * { margin-bottom: 12px; }
  .media-upload-modal :deep(.transfer-progress) { position: sticky; top: 0; z-index: 1; }
  .media-upload-modal__files { max-height: none; overflow: visible; margin-bottom: 0; }
}
</style>
