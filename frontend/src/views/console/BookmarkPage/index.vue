<template>
  <section class="bookmark-page">
    <BookmarkToolbar
      v-model:keyword="filters.keyword"
      @typing="handleKeywordInput"
      @search="refreshBookmarks(1)"
      @reload="reloadAll"
      @add-folder="openFolderModal()"
      @add-bookmark="openBookmarkModal()"
      @import="openImportModal"
      @export="handleExport"
    />

    <div class="bookmark-workspace">
      <BookmarkFolderTree
        :tree-data="folderTree"
        :selected-key="selectedKey"
        :drop-target-key="bookmarkDropTargetKey"
        :bookmark-dragging="!!draggingBookmarkId"
        @select="selectFolder"
        @add="openFolderModal()"
        @edit="openFolderModalById"
        @remove="confirmDeleteFolderById"
        @move="moveFolder"
        @bookmark-drag-over="handleBookmarkDragOver"
        @bookmark-drag-leave="handleBookmarkDragLeave"
        @bookmark-drop="moveDraggingBookmarkToFolder"
      />

      <BookmarkList
        :bookmarks="bookmarks"
        :loading="loading"
        :title="listTitle"
        :total="pagination.total"
        :page="pagination.page"
        :page-size="pagination.pageSize"
        :selected-ids="selectedBookmarkIds"
        :selected-count="selectedBookmarkIds.length"
        :all-selected="allVisibleSelected"
        :has-partial-selected="hasPartialVisibleSelected"
        @edit="openBookmarkModal"
        @remove="confirmDeleteBookmark"
        @page-change="refreshBookmarks"
        @drag-start="handleBookmarkDragStart"
        @drag-end="clearBookmarkDragging"
        @drop="dropBookmark"
        @toggle-select="toggleBookmarkSelection"
        @toggle-all="toggleAllVisibleBookmarks"
        @move-selected="openMoveModal"
      />
    </div>

    <BookmarkEditModal
      v-model:open="editModalOpen"
      :mode="editMode"
      :item="editingItem"
      :folders="flatFolders"
      :submitting="submitting"
      @submit="submitEdit"
    />

    <BookmarkImportModal
      v-model:open="importModalOpen"
      :type="importType"
      :submitting="submitting"
      @submit="submitImport"
    />

    <BookmarkMoveModal
      v-model:open="moveModalOpen"
      :folders="flatFolders"
      :count="selectedBookmarkIds.length"
      :submitting="submitting"
      @submit="moveSelectedBookmarks"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import BookmarkEditModal from './BookmarkEditModal.vue'
import BookmarkFolderTree from './BookmarkFolderTree.vue'
import BookmarkImportModal from './BookmarkImportModal.vue'
import BookmarkList from './BookmarkList.vue'
import BookmarkMoveModal from './BookmarkMoveModal.vue'
import BookmarkToolbar from './BookmarkToolbar.vue'
import { buildFolderTree, downloadBlob, flattenFolders } from './bookmarkUtils'
import {
  createBookmark,
  createBookmarkFolder,
  deleteBookmark,
  deleteBookmarkFolder,
  exportBookmarkHtml,
  exportBookmarkJson,
  importBookmarkHtml,
  importBookmarkJson,
  listBookmarkFolders,
  listBookmarks,
  moveBookmarks,
  reorderBookmarkFolders,
  reorderBookmarks,
  updateBookmark,
  updateBookmarkFolder
} from '@/services/bookmark'

const loading = ref(false)
const submitting = ref(false)
const folders = ref([])
const bookmarks = ref([])
const selectedKey = ref('all')
const editModalOpen = ref(false)
const importModalOpen = ref(false)
const moveModalOpen = ref(false)
const editMode = ref('bookmark')
const importType = ref('html')
const editingItem = ref(null)
const draggingBookmarkId = ref('')
const bookmarkDropTargetKey = ref('')
const selectedBookmarkIds = ref([])
let keywordTimer = null

const filters = reactive({
  keyword: ''
})
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const folderTree = computed(() => buildFolderTree(folders.value))
const flatFolders = computed(() => flattenFolders(folderTree.value))
const selectedFolder = computed(() => flatFolders.value.find((folder) => folder.id === selectedKey.value))
const listTitle = computed(() => {
  if (filters.keyword.trim()) return '搜索结果'
  if (selectedKey.value === 'toolbar') return '书签栏'
  if (selectedKey.value === 'all') return '全部书签'
  return selectedFolder.value?.name || '书签'
})
const visibleBookmarkIds = computed(() => bookmarks.value.map((bookmark) => bookmark.id))
const allVisibleSelected = computed(() => {
  return visibleBookmarkIds.value.length > 0 && visibleBookmarkIds.value.every((id) => selectedBookmarkIds.value.includes(id))
})
const hasPartialVisibleSelected = computed(() => {
  return visibleBookmarkIds.value.some((id) => selectedBookmarkIds.value.includes(id)) && !allVisibleSelected.value
})

async function loadFolders() {
  folders.value = await listBookmarkFolders()
}

function buildBookmarkParams(page = pagination.page) {
  const keyword = filters.keyword.trim()
  const params = {
    page,
    pageSize: pagination.pageSize,
    keyword: keyword || undefined
  }

  if (!keyword) {
    if (selectedKey.value === 'toolbar') params.folderId = ''
    else if (selectedKey.value !== 'all') params.folderId = selectedKey.value
  }

  return params
}

async function refreshBookmarks(page = pagination.page) {
  loading.value = true
  try {
    const result = await listBookmarks(buildBookmarkParams(page))
    bookmarks.value = result.items
    selectedBookmarkIds.value = selectedBookmarkIds.value.filter((id) => result.items.some((item) => item.id === id))
    pagination.total = result.total
    pagination.page = result.page
    pagination.pageSize = result.pageSize
  } catch (error) {
    message.error(error.message || '书签加载失败')
  } finally {
    loading.value = false
  }
}

async function reloadAll() {
  await loadFolders()
  await refreshBookmarks(pagination.page)
}

function handleKeywordInput() {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(() => refreshBookmarks(1), 300)
}

function selectFolder(key) {
  selectedKey.value = key
  selectedBookmarkIds.value = []
  pagination.page = 1
  refreshBookmarks(1)
}

function openFolderModal(folder = null) {
  editMode.value = 'folder'
  editingItem.value = folder
  editModalOpen.value = true
}

function openFolderModalById(id) {
  const folder = flatFolders.value.find((item) => item.id === id)
  if (folder) openFolderModal(folder)
}

function openBookmarkModal(bookmark = null) {
  editMode.value = 'bookmark'
  editingItem.value = bookmark || {
    folderId: selectedKey.value && !['all', 'toolbar'].includes(selectedKey.value) ? selectedKey.value : null
  }
  editModalOpen.value = true
}

async function submitEdit(payload) {
  submitting.value = true
  try {
    if (editMode.value === 'folder') {
      if (editingItem.value?.id) await updateBookmarkFolder(editingItem.value.id, payload)
      else await createBookmarkFolder(payload)
      message.success(editingItem.value?.id ? '文件夹已更新' : '文件夹已创建')
      editModalOpen.value = false
      await loadFolders()
    } else {
      if (editingItem.value?.id) await updateBookmark(editingItem.value.id, payload)
      else await createBookmark(payload)
      message.success(editingItem.value?.id ? '书签已更新' : '书签已创建')
      editModalOpen.value = false
      await refreshBookmarks(editingItem.value?.id ? pagination.page : 1)
    }
  } catch (error) {
    message.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

function confirmDeleteBookmark(bookmark) {
  Modal.confirm({
    title: '删除书签',
    content: `确定删除「${bookmark.title}」吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteBookmark(bookmark.id)
      message.success('书签已删除')
      await refreshBookmarks()
    }
  })
}

function confirmDeleteFolderById(id) {
  const folder = flatFolders.value.find((item) => item.id === id)
  if (!folder) return
  Modal.confirm({
    title: '删除文件夹',
    content: `确定删除「${folder.name}」及其中的子文件夹和书签吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteBookmarkFolder(folder.id)
      message.success('文件夹已删除')
      if (selectedKey.value === folder.id) selectedKey.value = 'all'
      await reloadAll()
    }
  })
}

function getSiblingFolderIds(parentId) {
  return flatFolders.value
    .filter((folder) => (folder.parentId || null) === (parentId || null))
    .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
    .map((folder) => folder.id)
}

async function moveFolder({ id, parentId, targetId, dropPosition, dropToGap }) {
  try {
    await updateBookmarkFolder(id, { parentId })
    const siblingIds = getSiblingFolderIds(parentId).filter((folderId) => folderId !== id)
    if (dropToGap && targetId) {
      const targetIndex = siblingIds.indexOf(targetId)
      const insertIndex = dropPosition < 0 ? targetIndex : targetIndex + 1
      siblingIds.splice(Math.max(0, insertIndex), 0, id)
    } else {
      siblingIds.push(id)
    }
    await reorderBookmarkFolders({ parentId, ids: siblingIds })
    message.success('文件夹位置已更新')
    await loadFolders()
  } catch (error) {
    message.error(error.message || '移动失败')
  }
}

function toggleBookmarkSelection(id, checked) {
  if (checked) {
    selectedBookmarkIds.value = [...new Set([...selectedBookmarkIds.value, id])]
    return
  }
  selectedBookmarkIds.value = selectedBookmarkIds.value.filter((item) => item !== id)
}

function toggleAllVisibleBookmarks(checked) {
  if (checked) {
    selectedBookmarkIds.value = [...new Set([...selectedBookmarkIds.value, ...visibleBookmarkIds.value])]
    return
  }
  selectedBookmarkIds.value = selectedBookmarkIds.value.filter((id) => !visibleBookmarkIds.value.includes(id))
}

function handleBookmarkDragStart(id) {
  draggingBookmarkId.value = id
  if (!selectedBookmarkIds.value.includes(id)) selectedBookmarkIds.value = [id]
}

function handleBookmarkDragOver(folderId) {
  if (!draggingBookmarkId.value) return
  bookmarkDropTargetKey.value = folderId || 'toolbar'
}

function handleBookmarkDragLeave() {
  bookmarkDropTargetKey.value = ''
}

function clearBookmarkDragging() {
  draggingBookmarkId.value = ''
  bookmarkDropTargetKey.value = ''
}

async function moveBookmarkIds(ids, folderId) {
  if (!ids.length) return
  await moveBookmarks({ ids, folderId })
  selectedBookmarkIds.value = []
  await reloadAll()
}

async function moveDraggingBookmarkToFolder(folderId) {
  if (!draggingBookmarkId.value) return
  try {
    const ids = selectedBookmarkIds.value.includes(draggingBookmarkId.value)
      ? selectedBookmarkIds.value
      : [draggingBookmarkId.value]
    await moveBookmarkIds(ids, folderId)
    message.success(folderId ? '书签已移动到目标文件夹' : '书签已移动到书签栏')
  } catch (error) {
    message.error(error.message || '移动失败')
  } finally {
    clearBookmarkDragging()
  }
}

function openMoveModal() {
  if (!selectedBookmarkIds.value.length) {
    message.info('请选择要移动的书签')
    return
  }
  moveModalOpen.value = true
}

async function moveSelectedBookmarks(folderId) {
  submitting.value = true
  try {
    await moveBookmarkIds(selectedBookmarkIds.value, folderId)
    message.success('书签已移动')
    moveModalOpen.value = false
  } catch (error) {
    message.error(error.message || '移动失败')
  } finally {
    submitting.value = false
  }
}

async function dropBookmark(targetId) {
  if (!draggingBookmarkId.value || draggingBookmarkId.value === targetId) return
  if (filters.keyword.trim() || selectedKey.value === 'all') {
    message.info('请进入具体文件夹后再拖拽排序')
    clearBookmarkDragging()
    return
  }

  const ids = bookmarks.value.map((item) => item.id)
  const fromIndex = ids.indexOf(draggingBookmarkId.value)
  const toIndex = ids.indexOf(targetId)
  if (fromIndex < 0 || toIndex < 0) return
  ids.splice(toIndex, 0, ids.splice(fromIndex, 1)[0])

  try {
    await reorderBookmarks({
      folderId: selectedKey.value === 'toolbar' ? null : selectedKey.value,
      ids
    })
    await refreshBookmarks()
  } catch (error) {
    message.error(error.message || '排序失败')
  } finally {
    clearBookmarkDragging()
  }
}

function openImportModal(type) {
  importType.value = type
  importModalOpen.value = true
}

async function submitImport(file) {
  submitting.value = true
  try {
    const result = importType.value === 'json'
      ? await importBookmarkJson(file)
      : await importBookmarkHtml(file)
    message.success(`导入完成：新增 ${result.inserted || 0}，更新 ${result.updated || 0}`)
    importModalOpen.value = false
    await reloadAll()
  } catch (error) {
    message.error(error.message || '导入失败')
  } finally {
    submitting.value = false
  }
}

async function handleExport(type) {
  try {
    const stamp = new Date().toISOString().slice(0, 10)
    if (type === 'json') {
      downloadBlob(await exportBookmarkJson(), `bookmarks-backup-${stamp}.json`)
      return
    }
    downloadBlob(await exportBookmarkHtml(), `bookmarks-${stamp}.html`)
  } catch (error) {
    message.error(error.message || '导出失败')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await reloadAll()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bookmark-page {
  width: 100%;
  min-width: 0;
  display: grid;
  gap: 12px;
}

.bookmark-workspace {
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

@media (max-width: 980px) {
  .bookmark-workspace {
    grid-template-columns: 1fr;
  }
}
</style>
