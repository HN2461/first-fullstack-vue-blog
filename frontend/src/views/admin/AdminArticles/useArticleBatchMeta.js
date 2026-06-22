import { computed, ref } from 'vue'
import {
  batchUpdateAdminArticleMeta,
  listAdminMedia,
  listAllAdminTags
} from '@/services/admin'

export function useArticleBatchMeta({ selectedArticleIds, tableRef, runAction }) {
  const tags = ref([])
  const tagLoading = ref(false)
  const batchMetaVisible = ref(false)
  const batchMetaSubmitting = ref(false)
  const batchMetaResult = ref(null)
  const coverMediaItems = ref([])
  const coverMediaLoading = ref(false)

  const tagOptions = computed(() => tags.value.map((tag) => ({
    value: tag.id,
    label: tag.name
  })))

  async function loadTags() {
    tagLoading.value = true
    try {
      tags.value = await listAllAdminTags()
    } catch (error) {
      console.error('标签加载失败:', error)
    } finally {
      tagLoading.value = false
    }
  }

  async function loadCoverMedia(keyword = '') {
    coverMediaLoading.value = true
    try {
      const result = await listAdminMedia({
        page: 1,
        pageSize: 24,
        fileClass: 'image',
        keyword: keyword || undefined
      })
      coverMediaItems.value = result.items || []
    } catch (error) {
      console.error('封面资源加载失败:', error)
    } finally {
      coverMediaLoading.value = false
    }
  }

  function openBatchMetaDrawer() {
    if (selectedArticleIds.value.length === 0) {
      return
    }

    batchMetaVisible.value = true
    if (tags.value.length === 0 && !tagLoading.value) {
      loadTags()
    }
    if (coverMediaItems.value.length === 0 && !coverMediaLoading.value) {
      loadCoverMedia()
    }
  }

  async function handleBatchMetaSubmit(payload) {
    batchMetaSubmitting.value = true
    try {
      const result = await runAction(() => batchUpdateAdminArticleMeta({
        ids: selectedArticleIds.value,
        ...payload
      }), {
        successMessage: '文章批量设置已执行',
        errorMessage: '批量设置失败'
      })

      batchMetaResult.value = result
      await tableRef.value?.refresh?.()
    } finally {
      batchMetaSubmitting.value = false
    }
  }

  function clearBatchMetaResult() {
    batchMetaResult.value = null
  }

  return {
    batchMetaResult,
    batchMetaSubmitting,
    batchMetaVisible,
    clearBatchMetaResult,
    coverMediaItems,
    coverMediaLoading,
    handleBatchMetaSubmit,
    loadCoverMedia,
    loadTags,
    openBatchMetaDrawer,
    tagOptions
  }
}
