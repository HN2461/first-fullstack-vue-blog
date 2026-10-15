<template>
  <div v-if="store.running" class="media-download-indicator__floating" role="status" aria-live="polite">
    <div class="media-download-indicator__floating-title">
      <DownloadOutlined />
      <span>{{ store.latestTask?.label || '资源下载' }}</span>
      <strong>{{ store.progress.total ? `${store.progress.percent}%` : '进行中' }}</strong>
    </div>
    <a-progress v-if="store.progress.total" :percent="store.progress.percent" :show-info="false" :stroke-width="6" />
    <div v-else class="media-download-indicator__floating-indeterminate"><span /></div>
    <div class="media-download-indicator__floating-meta">
      <span v-if="store.currentTask && store.latestTask?.id !== store.currentTask.id">当前下载：{{ store.currentTask.label }}</span>
      <span v-else>已触发，正在接收数据</span>
      <span v-if="store.queuedCount">{{ store.queuedCount }} 个排队中</span>
    </div>
  </div>
  <a-popover v-if="store.hasHistory" placement="bottomRight" trigger="click">
    <template #content>
      <div class="media-download-indicator__panel">
        <TransferProgressPanel
          :title="store.latestTask?.label || store.statusText"
          :subtitle="downloadSubtitle"
          v-bind="store.progress"
          :status="store.running ? 'active' : store.state"
          :status-text="store.statusText"
        />
        <div class="media-download-indicator__actions">
          <a-button v-if="!store.running && store.successCount" size="small" @click="store.clearCompleted">清除已完成</a-button>
          <a-button v-if="!store.running && store.hasHistory" size="small" @click="store.clearAll">清除记录</a-button>
        </div>
      </div>
    </template>
    <a-tooltip :title="`资源下载：${store.statusText}${store.running ? ` ${store.progress.percent}%` : ''}，点击查看`">
      <a-button class="enterprise-icon-action media-download-indicator" :aria-label="`资源下载：${store.statusText}`">
        <a-progress type="circle" :size="30" :stroke-width="7" :percent="store.running ? store.progress.percent : store.state === 'success' ? 100 : store.progress.percent" :status="store.state === 'error' ? 'exception' : store.state === 'success' ? 'success' : 'normal'">
          <template #format>
            <CheckOutlined v-if="store.state === 'success' && !store.running" />
            <ExclamationOutlined v-else-if="store.state === 'error'" />
            <DownloadOutlined v-else />
          </template>
        </a-progress>
      </a-button>
    </a-tooltip>
  </a-popover>
</template>

<script setup>
import { computed } from 'vue'
import { CheckOutlined, DownloadOutlined, ExclamationOutlined } from '@ant-design/icons-vue'
import TransferProgressPanel from '@/components/TransferProgressPanel.vue'
import { useMediaDownloadStore } from '@/stores/mediaDownload'

const store = useMediaDownloadStore()
const downloadSubtitle = computed(() => {
  const activeLabel = store.currentTask?.label || '下载任务'
  const latestIsQueued = store.latestTask && store.latestTask.id !== store.currentTask?.id
  const waiting = store.running && !store.progress.loaded ? '已触发，正在等待服务器响应' : ''
  const queue = store.queuedCount ? `${store.queuedCount} 个排队中` : ''
  const failure = store.errorCount ? `${store.errorCount} 个失败` : ''
  return [waiting, latestIsQueued ? `当前下载：${activeLabel}` : '', queue, failure].filter(Boolean).join(' · ') || '下载任务'
})
</script>

<style scoped>
.media-download-indicator :deep(.ant-progress-text) { color: var(--console-primary); font-size: 13px; }
.media-download-indicator__panel { display: grid; width: min(320px, calc(100vw - 60px)); gap: 10px; }
.media-download-indicator__actions { display: flex; justify-content: flex-end; gap: 8px; }
.media-download-indicator__floating {
  position: fixed;
  z-index: 1000;
  top: 72px;
  right: 20px;
  width: min(330px, calc(100vw - 40px));
  padding: 10px 12px;
  border: 1px solid var(--console-border, #d9d9d9);
  border-radius: 8px;
  background: var(--console-surface, #fff);
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.14);
}
.media-download-indicator__floating-title,
.media-download-indicator__floating-meta { display: flex; align-items: center; gap: 8px; min-width: 0; }
.media-download-indicator__floating-title span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.media-download-indicator__floating-title strong { color: var(--console-primary, #1677ff); font-size: 12px; }
.media-download-indicator__floating :deep(.ant-progress) { margin: 7px 0 0; }
.media-download-indicator__floating-meta { justify-content: space-between; margin-top: 5px; color: var(--console-text-secondary, #667085); font-size: 12px; }
.media-download-indicator__floating-meta span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.media-download-indicator__floating-indeterminate { height: 6px; margin-top: 7px; overflow: hidden; border-radius: 4px; background: var(--console-border, #e5e7eb); }
.media-download-indicator__floating-indeterminate span { display: block; width: 38%; height: 100%; border-radius: inherit; background: var(--console-primary, #1677ff); animation: media-download-slide 1.2s ease-in-out infinite; }
@keyframes media-download-slide { from { transform: translateX(-110%); } to { transform: translateX(290%); } }
@media (max-width: 520px) { .media-download-indicator__floating { top: 64px; right: 12px; width: calc(100vw - 24px); } }
</style>
