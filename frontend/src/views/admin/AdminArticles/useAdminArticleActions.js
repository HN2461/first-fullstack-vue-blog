import { ref } from 'vue'
import {
  batchDeleteAdminArticles,
  batchUpdateAdminArticleStatus,
  deleteAdminArticle,
  publishAdminArticle,
  updateAdminArticleStatus
} from '@/services/admin'

export function useAdminArticleActions({ selectedArticleIds, tableRef, router, clearSelection, runAction, confirmAction }) {
  const actionLoadingKey = ref('')

  function refreshTable() {
    tableRef.value?.refresh()
  }

  function handleBatchStatus(status) {
    if (selectedArticleIds.value.length === 0) return

    const labelMap = {
      published: '发布',
      archived: '下架',
      draft: '转为草稿'
    }

    confirmAction({
      title: `确认批量${labelMap[status] || '更新状态'}`,
      content: `将 ${selectedArticleIds.value.length} 篇文章${labelMap[status] || '更新状态'}，不会修改文章正文内容。`,
      okText: '确认',
      async onOk() {
        await runAction(() => batchUpdateAdminArticleStatus(selectedArticleIds.value, status), {
          successMessage: '文章状态已批量更新',
          errorMessage: '批量更新失败',
          onSuccess: () => {
            clearSelection()
            refreshTable()
          }
        })
      }
    }).catch(() => {})
  }

  function handleBatchDelete() {
    if (selectedArticleIds.value.length === 0) return

    confirmAction({
      title: '确认批量删除',
      content: `将 ${selectedArticleIds.value.length} 篇文章移入回收站，不会删除或改写文章正文。`,
      okText: '确认删除',
      okType: 'danger',
      async onOk() {
        await runAction(() => batchDeleteAdminArticles(selectedArticleIds.value), {
          successMessage: '文章已批量移入回收站',
          errorMessage: '批量删除失败',
          onSuccess: () => {
            clearSelection()
            refreshTable()
          }
        })
      }
    }).catch(() => {})
  }

  function openReader(record) {
    if (record.slug) {
      router.push(`/console/article-directory/articles/${record.slug}`)
      return
    }

    if (record.id) {
      router.push(`/console/manage/articles/${record.id}`)
    }
  }

  async function handleAction(key, record) {
    if (actionLoadingKey.value) {
      return
    }

    switch (key) {
      case 'publish':
        await handlePublish(record.id)
        break
      case 'archive':
        await handleArchive(record.id)
        break
      case 'draft':
        await handleToDraft(record.id)
        break
      case 'delete':
        handleDelete(record)
        break
    }
  }

  async function handlePublish(id) {
    actionLoadingKey.value = `publish:${id}`
    try {
      await runAction(() => publishAdminArticle(id), {
        successMessage: '文章已发布',
        errorMessage: '发布失败',
        onSuccess: refreshTable
      })
    } finally {
      actionLoadingKey.value = ''
    }
  }

  async function handleArchive(id) {
    actionLoadingKey.value = `archive:${id}`
    try {
      await runAction(() => updateAdminArticleStatus(id, 'archived'), {
        successMessage: '文章已下架',
        errorMessage: '下架失败',
        onSuccess: refreshTable
      })
    } finally {
      actionLoadingKey.value = ''
    }
  }

  async function handleToDraft(id) {
    actionLoadingKey.value = `draft:${id}`
    try {
      await runAction(() => updateAdminArticleStatus(id, 'draft'), {
        successMessage: '已转为草稿',
        errorMessage: '转草稿失败',
        onSuccess: refreshTable
      })
    } finally {
      actionLoadingKey.value = ''
    }
  }

  function handleDelete(record) {
    confirmAction({
      title: '确认删除',
      content: `确定要删除文章「${record.title}」吗？删除后将进入删除流程且前台不可再访问。`,
      okText: '确认删除',
      okType: 'danger',
      async onOk() {
        actionLoadingKey.value = `delete:${record.id}`
        try {
          await runAction(() => deleteAdminArticle(record.id), {
            successMessage: '文章已删除',
            errorMessage: '删除失败',
            onSuccess: refreshTable
          })
        } finally {
          actionLoadingKey.value = ''
        }
      }
    }).catch(() => {})
  }

  return {
    handleAction,
    handleBatchDelete,
    handleBatchStatus,
    openReader
  }
}
