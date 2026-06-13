import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getPopupAnnouncements,
  getUnreadCount,
  markAllAnnouncementsRead,
  markAnnouncementRead
} from '@/services/public'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const popupAnnouncements = ref([])
  const loading = ref(false)

  const hasUnread = computed(() => unreadCount.value > 0)

  async function fetchUnreadCount() {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      unreadCount.value = 0
      return
    }

    try {
      const result = await getUnreadCount()
      unreadCount.value = result.count || 0
    } catch {
      unreadCount.value = 0
    }
  }

  async function fetchPopupAnnouncements() {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      popupAnnouncements.value = []
      return
    }

    try {
      const result = await getPopupAnnouncements()
      popupAnnouncements.value = result.items || []
    } catch {
      popupAnnouncements.value = []
    }
  }

  async function markRead(announcementId) {
    try {
      await markAnnouncementRead(announcementId)
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      popupAnnouncements.value = popupAnnouncements.value.filter(
        item => item.id !== announcementId
      )
    } catch {
      // 静默失败
    }
  }

  async function markAllRead() {
    try {
      await markAllAnnouncementsRead()
      unreadCount.value = 0
      popupAnnouncements.value = []
    } catch {
      // 静默失败
    }
  }

  function reset() {
    unreadCount.value = 0
    popupAnnouncements.value = []
  }

  return {
    unreadCount,
    popupAnnouncements,
    loading,
    hasUnread,
    fetchUnreadCount,
    fetchPopupAnnouncements,
    markRead,
    markAllRead,
    reset
  }
})
