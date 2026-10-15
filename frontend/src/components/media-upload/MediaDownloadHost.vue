<template><MediaDownloadIndicator v-if="authStore.isLoggedIn" /></template>

<script setup>
import { watch } from 'vue'
import { notification } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { useMediaDownloadStore } from '@/stores/mediaDownload'
import MediaDownloadIndicator from './MediaDownloadIndicator.vue'

const authStore = useAuthStore()
const store = useMediaDownloadStore()

watch(() => authStore.user?.id, (id) => { if (!id) store.clearAll() })
watch(() => store.queuedVersion, () => {
  if (store.running && store.currentTask) {
    notification.info({
      key: `media-download-start-${store.queuedVersion}`,
      message: '下载已开始',
      description: `${store.currentTask.label}，右上角图标可查看实时状态；如果暂时没有百分比，仍在等待服务器返回数据。`,
      duration: 3
    })
  }
})

watch(() => store.completedVersion, () => {
  if (!store.running && store.lastCompletedStatus === 'error') {
    notification.error({ key: 'media-download-result', message: '资源下载失败', description: '点击右上角下载图标查看失败任务。', duration: 5 })
  }
})
</script>
