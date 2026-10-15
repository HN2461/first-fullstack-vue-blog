<template></template>

<script setup>
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMediaDownloadStore } from '@/stores/mediaDownload'

const authStore = useAuthStore()
const store = useMediaDownloadStore()

watch(() => authStore.user?.id, async (id, previousId) => {
  if (!id || (previousId && previousId !== id)) {
    // 退出或切换账号要同时终止网络任务，不能仅隐藏仍在下载的界面。
    await store.cancelAll()
    store.clearAll()
  }
})
</script>
