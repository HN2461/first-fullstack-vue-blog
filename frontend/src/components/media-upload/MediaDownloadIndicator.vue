<template>
  <a-popover v-if="store.hasHistory" placement="bottomRight" trigger="click">
    <template #content>
      <div class="media-download-indicator__panel">
        <TransferProgressPanel
          :title="store.currentTask?.label || store.statusText"
          :subtitle="`${store.queuedCount ? `${store.queuedCount} 个排队中 · ` : ''}${store.errorCount ? `${store.errorCount} 个失败` : '下载任务'}`"
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
import { CheckOutlined, DownloadOutlined, ExclamationOutlined } from '@ant-design/icons-vue'
import TransferProgressPanel from '@/components/TransferProgressPanel.vue'
import { useMediaDownloadStore } from '@/stores/mediaDownload'

const store = useMediaDownloadStore()
</script>

<style scoped>
.media-download-indicator :deep(.ant-progress-text) { color: var(--console-primary); font-size: 13px; }
.media-download-indicator__panel { display: grid; width: min(320px, calc(100vw - 60px)); gap: 10px; }
.media-download-indicator__actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
