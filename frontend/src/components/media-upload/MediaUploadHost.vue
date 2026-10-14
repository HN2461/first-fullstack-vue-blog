<template>
  <MediaUploadModal v-if="authStore.isLoggedIn" />
</template>

<script setup>
import { watch } from 'vue'
import { notification } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { useMediaUploadStore } from '@/stores/mediaUpload'
import MediaUploadModal from '@/views/admin/AdminMedia/MediaUploadModal.vue'

const authStore = useAuthStore()
const store = useMediaUploadStore()

watch(() => [authStore.user?.id || '', authStore.token || ''], ([id], [previousId, previousToken] = []) => {
  if (store.ownerId && store.ownerId !== id) {
    notification.destroy('media-upload-result')
    // 账号状态清空后 token 也会同步移除，使用本次变更前的 token 确保退出登录时仍能删除服务器临时会话。
    store.resetForUser({ accessToken: previousToken || '' })
  }
})

watch(() => store.running, (running, wasRunning) => {
  if (running || !wasRunning || !store.ownerId || store.ownerId !== authStore.user?.id) return
  if (store.state === 'success') {
    notification.success({ key: 'media-upload-result', message: '资源上传完成', description: `${store.successCount} 个文件已上传到「${store.categoryName}」`, onClick: () => store.open() })
  } else if (store.state === 'error') {
    notification.warning({ key: 'media-upload-result', message: store.statusText, description: `已完成 ${store.successCount} 个，${store.remainingCount} 个未完成。点击查看并重试。`, onClick: () => store.open(), duration: 0 })
  }
})

// 页面内路由切换不受影响；关闭或刷新标签页会失去浏览器里的源文件引用。
watch(() => store.running, (running, _previous, onCleanup) => {
  if (!running) return
  const warnBeforeUnload = (event) => {
    event.preventDefault()
    event.returnValue = ''
  }
  window.addEventListener('beforeunload', warnBeforeUnload)
  onCleanup(() => window.removeEventListener('beforeunload', warnBeforeUnload))
})
</script>
