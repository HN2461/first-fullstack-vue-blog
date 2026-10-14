<template>
  <a-popover v-if="store.hasHistory && store.ownerId === authStore.user?.id && authStore.canAccessPath('/console/manage/media')" placement="bottomRight" trigger="click">
    <template #content>
      <div class="media-upload-indicator__panel">
        <TransferProgressPanel
          :title="store.statusText"
          :subtitle="`${store.categoryName} · 已完成 ${store.successCount}/${store.tasks.length}`"
          v-bind="store.progress"
          :status="store.state"
          :status-text="store.statusText"
        />
        <span v-if="store.currentTask" class="media-upload-indicator__filename">{{ store.currentTask.file.name }}</span>
        <div class="media-upload-indicator__actions">
          <a-button v-if="store.running" size="small" @click="store.pause">暂停</a-button>
          <a-button v-else-if="store.remainingCount" size="small" :disabled="store.clearing" @click="store.start">继续上传</a-button>
          <a-button v-else size="small" :loading="store.clearing" @click="store.clear">清除记录</a-button>
          <a-button type="primary" size="small" @click="store.open()">查看详情</a-button>
        </div>
      </div>
    </template>
    <a-tooltip :title="`资源上传：${store.statusText}${store.running ? ` ${store.progress.percent}%` : ''}，点击查看`">
      <a-button class="enterprise-icon-action media-upload-indicator" :aria-label="`资源上传：${store.statusText}，${store.progress.percent}%`" @click="handleIndicatorClick">
        <a-progress type="circle" :size="30" :stroke-width="7" :percent="store.progress.percent" :status="store.state === 'error' ? 'exception' : store.state === 'success' ? 'success' : 'normal'">
          <template #format>
            <CheckOutlined v-if="store.state === 'success'" />
            <ExclamationOutlined v-else-if="store.state === 'error'" />
            <PauseOutlined v-else-if="store.state === 'paused'" />
            <UploadOutlined v-else />
          </template>
        </a-progress>
      </a-button>
    </a-tooltip>
  </a-popover>
</template>

<script setup>
import { CheckOutlined, ExclamationOutlined, PauseOutlined, UploadOutlined } from '@ant-design/icons-vue'
import TransferProgressPanel from '@/components/TransferProgressPanel.vue'
import { useAuthStore } from '@/stores/auth'
import { useMediaUploadStore } from '@/stores/mediaUpload'

const authStore = useAuthStore()
const store = useMediaUploadStore()

function handleIndicatorClick() {
  if (!store.running && store.state === 'success') {
    // 成功任务已被用户查看，清除右上角的防误关提醒；失败任务保留以便重试。
    store.clear()
  } else {
    store.open()
  }
}
</script>

<style scoped>
.media-upload-indicator :deep(.ant-progress-text) { font-size: 13px; color: var(--console-primary); }
.media-upload-indicator__panel { width: min(310px, calc(100vw - 60px)); display: grid; gap: 10px; }
.media-upload-indicator__filename { max-width: 100%; color: var(--console-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.media-upload-indicator__actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
</style>
