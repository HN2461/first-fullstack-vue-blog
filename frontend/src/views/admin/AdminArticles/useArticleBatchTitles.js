import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  batchUpdateAdminArticleTitles,
  previewAdminArticleTitles
} from '@/services/admin'

function createTitleRow(item) {
  return {
    id: item.id,
    oldTitle: item.title || '',
    nextTitle: item.title || '',
    slug: item.slug || '',
    articleStatus: item.status || '',
    available: item.available !== false,
    messages: Array.isArray(item.messages) ? item.messages : []
  }
}

export function useArticleBatchTitles({ selectedArticleIds, tableRef, runAction }) {
  const batchTitleVisible = ref(false)
  const batchTitleLoading = ref(false)
  const batchTitleSubmitting = ref(false)
  const batchTitleRows = ref([])
  const batchTitleResult = ref(null)

  async function loadTitlePreview() {
    if (selectedArticleIds.value.length === 0) {
      batchTitleRows.value = []
      return
    }

    batchTitleLoading.value = true
    try {
      const result = await runAction(() => previewAdminArticleTitles(selectedArticleIds.value), {
        errorMessage: '标题预览加载失败'
      })
      batchTitleRows.value = (result.items || []).map(createTitleRow)
    } catch {
      batchTitleRows.value = []
    } finally {
      batchTitleLoading.value = false
    }
  }

  async function openBatchTitleModal() {
    if (selectedArticleIds.value.length === 0) {
      return
    }

    batchTitleVisible.value = true
    batchTitleResult.value = null
    await loadTitlePreview()
  }

  function updateBatchTitle(id, value) {
    batchTitleRows.value = batchTitleRows.value.map((row) => (
      row.id === id
        ? { ...row, nextTitle: value }
        : row
    ))
  }

  function replaceBatchTitles({ findText, replaceText }) {
    let changed = 0
    batchTitleRows.value = batchTitleRows.value.map((row) => {
      if (!row.available || !String(row.nextTitle || '').includes(findText)) {
        return row
      }

      changed += 1
      return {
        ...row,
        nextTitle: String(row.nextTitle || '').split(findText).join(replaceText)
      }
    })

    if (changed === 0) {
      message.warning('当前标题中没有匹配内容')
    }
  }

  function removeBatchTitlePrefix(prefix) {
    let changed = 0
    batchTitleRows.value = batchTitleRows.value.map((row) => {
      const currentTitle = String(row.nextTitle || '')
      if (!row.available || !currentTitle.startsWith(prefix)) {
        return row
      }

      changed += 1
      return {
        ...row,
        nextTitle: currentTitle.slice(prefix.length).trimStart()
      }
    })

    if (changed === 0) {
      message.warning('当前标题中没有匹配的开头前缀')
    }
  }

  function resetBatchTitles() {
    batchTitleRows.value = batchTitleRows.value.map((row) => ({
      ...row,
      nextTitle: row.oldTitle
    }))
    batchTitleResult.value = null
  }

  function syncUpdatedRows(result) {
    const updatedMap = new Map(
      (result.items || [])
        .filter((item) => item.status === 'updated')
        .map((item) => [item.id, item.newTitle])
    )

    if (updatedMap.size === 0) {
      return
    }

    batchTitleRows.value = batchTitleRows.value.map((row) => {
      if (!updatedMap.has(row.id)) {
        return row
      }

      const title = updatedMap.get(row.id)
      return {
        ...row,
        oldTitle: title,
        nextTitle: title
      }
    })
  }

  async function handleBatchTitleSubmit(items) {
    batchTitleSubmitting.value = true
    try {
      const result = await runAction(() => batchUpdateAdminArticleTitles(items), {
        successMessage: '文章标题已批量更新',
        errorMessage: '批量改标题失败'
      })

      batchTitleResult.value = result
      syncUpdatedRows(result)
      await tableRef.value?.refresh?.()
    } finally {
      batchTitleSubmitting.value = false
    }
  }

  return {
    batchTitleLoading,
    batchTitleResult,
    batchTitleRows,
    batchTitleSubmitting,
    batchTitleVisible,
    handleBatchTitleSubmit,
    openBatchTitleModal,
    removeBatchTitlePrefix,
    replaceBatchTitles,
    resetBatchTitles,
    updateBatchTitle
  }
}
