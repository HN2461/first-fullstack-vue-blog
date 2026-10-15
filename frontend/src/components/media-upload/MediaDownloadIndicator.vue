<template>
  <a-popover v-if="store.hasHistory" v-model:open="open" placement="bottomRight" trigger="click">
    <template #content>
      <div class="media-download-indicator__panel">
        <div class="media-download-indicator__heading">
          <strong>下载任务</strong>
          <span v-if="store.running">{{ store.queuedCount }} 个排队中</span>
          <span v-else>{{ store.tasks.length }} 条记录</span>
        </div>
        <a-alert v-if="notice" :type="notice.type" :message="notice.message" :description="notice.description" show-icon role="status" />
        <TransferProgressPanel
          :title="store.currentTask?.label || store.latestTask?.label || store.statusText"
          :subtitle="downloadSubtitle"
          v-bind="store.progress"
          :status="store.running ? 'active' : store.state"
          :status-text="store.statusText"
        />
        <ul class="media-download-indicator__tasks" aria-label="下载任务列表">
          <li v-for="task in store.tasks" :key="task.id" :data-status="task.status">
            <div class="media-download-indicator__task-info">
              <span :title="task.fileName">{{ task.fileName }}</span>
              <span :class="`media-download-indicator__state--${task.status}`">{{ DOWNLOAD_STATE_LABELS[task.status] }}</span>
              <span v-if="task.error" class="media-download-indicator__state--error">{{ task.error }}</span>
            </div>
            <a-button v-if="['queued', 'downloading', 'cancelling'].includes(task.status)" danger type="link" size="small" :disabled="task.status === 'cancelling'" :aria-label="`${task.status === 'queued' ? '取消排队' : '终止下载'}：${task.fileName}`" @click="store.cancelTask(task.id)">
              {{ task.status === 'queued' ? '取消排队' : '终止' }}
            </a-button>
          </li>
        </ul>
        <div class="media-download-indicator__actions">
          <a-button v-if="store.successCount || store.errorCount || store.cancelledCount" size="small" @click="store.clearCompleted">清除结束记录</a-button>
          <a-button v-if="store.running" danger size="small" @click="store.cancelAll">终止全部</a-button>
        </div>
      </div>
    </template>
    <a-tooltip :title="`资源下载：${store.statusText}${store.running && store.progress.total ? ` ${store.progress.percent}%` : ''}，点击查看`">
      <a-button class="enterprise-icon-action media-download-indicator" :class="{ 'media-download-indicator--waiting': store.running && !store.progress.total }" :aria-label="`资源下载：${store.statusText}`">
        <a-progress type="circle" :size="32" :stroke-width="7" :percent="circlePercent" :status="store.state === 'error' ? 'exception' : store.state === 'success' ? 'success' : 'normal'">
          <template #format>
            <span v-if="store.running && store.progress.total" class="media-download-indicator__percent">{{ store.progress.percent }}%</span>
            <CheckOutlined v-else-if="store.state === 'success'" />
            <ExclamationOutlined v-else-if="store.state === 'error'" />
            <StopOutlined v-else-if="store.state === 'cancelled'" />
            <DownloadOutlined v-else />
          </template>
        </a-progress>
      </a-button>
    </a-tooltip>
  </a-popover>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { CheckOutlined, DownloadOutlined, ExclamationOutlined, StopOutlined } from '@ant-design/icons-vue'
import TransferProgressPanel from '@/components/TransferProgressPanel.vue'
import { DOWNLOAD_STATE_LABELS, useMediaDownloadStore } from '@/stores/mediaDownload'

const store = useMediaDownloadStore()
const open = ref(false)
const notice = ref(null)
let noticeTimer
// 点击下载与重复点击都在同一入口反馈；用户主动收起后不因完成而抢占工作区。
watch(() => store.feedback, (value) => {
  clearTimeout(noticeTimer)
  notice.value = value
  if (value?.type === 'info' || value?.message.includes('请勿重复点击')) open.value = true
  noticeTimer = setTimeout(() => { notice.value = null }, 2000)
})
watch(() => store.hasHistory, (value) => { if (!value) open.value = false })
onBeforeUnmount(() => clearTimeout(noticeTimer))

const circlePercent = computed(() => store.running && !store.progress.total ? 25 : store.state === 'success' ? 100 : store.progress.percent)
const downloadSubtitle = computed(() => {
  if (store.running) return store.progress.loaded ? '关闭面板后继续下载' : '已触发，正在等待服务器响应'
  if (store.state === 'success') return '已触发浏览器保存，保存结果请查看浏览器下载列表'
  if (store.state === 'cancelled') return '已停止接收，不会保存未完成文件'
  return '失败详情见下方任务记录'
})
</script>

<style scoped>
.media-download-indicator :deep(.ant-progress-text) { color: var(--console-primary); font-size: 13px; }
.media-download-indicator__percent { font-size: 10px; }
.media-download-indicator--waiting :deep(.ant-progress-circle) { animation: media-download-waiting 1.2s linear infinite; }
.media-download-indicator__panel { display: grid; width: min(360px, calc(100vw - 48px)); max-height: min(68vh, calc(100dvh - 140px)); overflow-y: auto; gap: 10px; }
.media-download-indicator__heading { display: flex; justify-content: space-between; gap: 10px; }
.media-download-indicator__heading span { color: var(--console-text-secondary, #667085); font-size: 12px; }
.media-download-indicator__tasks { padding: 0; margin: 0; list-style: none; }
.media-download-indicator__tasks li { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--console-border, #d9d9d9); }
.media-download-indicator__task-info { display: grid; min-width: 0; gap: 2px; }
.media-download-indicator__task-info span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.media-download-indicator__task-info span:not(:first-child) { font-size: 12px; overflow-wrap: anywhere; color: var(--console-text-secondary, #667085); }
.media-download-indicator__task-info .media-download-indicator__state--success { color: var(--console-success, #52c41a); }
.media-download-indicator__task-info .media-download-indicator__state--error { color: var(--console-danger, #ff4d4f); }
.media-download-indicator__tasks :deep(.ant-btn) { flex: none; }
.media-download-indicator__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
@keyframes media-download-waiting { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .media-download-indicator--waiting :deep(.ant-progress-circle) { animation: none; } }
</style>
