<template>
  <section class="bookmark-page">
    <BookmarkWorkspaceTabs
      v-model:mode="pageMode"
      :workspaces="workspaces"
      :active-id="activeWorkspaceId"
      @select="selectWorkspace"
      @create="openWorkspaceModal()"
      @action="handleWorkspaceAction"
    />

    <BookmarkManager
      v-if="activeWorkspace && pageMode === 'manage'"
      ref="managerRef"
      :workspace-id="activeWorkspace.id"
      @import="openImportModal"
      @export="handleExport"
      @changed="loadWorkspaces"
    />

    <BookmarkComparisonPanel
      v-else-if="workspaces.length >= 2 && pageMode === 'compare'"
      :workspaces="workspaces"
      :default-primary-id="primaryWorkspace?.id || activeWorkspaceId"
      @changed="loadWorkspaces"
    />

    <div v-else class="bookmark-page__empty">
      <a-empty :description="emptyDescription">
        <a-button type="primary" @click="openWorkspaceModal()">
          <template #icon><PlusOutlined /></template>
          新建并导入书签库
        </a-button>
      </a-empty>
    </div>

    <BookmarkWorkspaceModal
      v-model:open="workspaceModalOpen"
      :workspace="editingWorkspace"
      :submitting="submitting"
      @submit="submitWorkspace"
    />

    <BookmarkImportModal
      v-model:open="importModalOpen"
      :type="importType"
      :workspace="activeWorkspace"
      :submitting="submitting"
      @submit="submitImport"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import BookmarkComparisonPanel from './BookmarkComparisonPanel.vue'
import BookmarkImportModal from './BookmarkImportModal.vue'
import BookmarkManager from './BookmarkManager.vue'
import BookmarkWorkspaceModal from './BookmarkWorkspaceModal.vue'
import BookmarkWorkspaceTabs from './BookmarkWorkspaceTabs.vue'
import { downloadBlob } from './bookmarkUtils'
import {
  clearBookmarkWorkspace,
  createBookmarkWorkspace,
  deleteBookmarkWorkspace,
  exportAllBookmarkJson,
  exportBookmarkHtml,
  exportBookmarkJson,
  importBookmarkHtml,
  importBookmarkJson,
  listBookmarkWorkspaces,
  updateBookmarkWorkspace
} from '@/services/bookmark'

const workspaces = ref([])
const activeWorkspaceId = ref('')
const pageMode = ref('manage')
const workspaceModalOpen = ref(false)
const importModalOpen = ref(false)
const editingWorkspace = ref(null)
const importType = ref('html')
const submitting = ref(false)
const managerRef = ref(null)

const activeWorkspace = computed(() => workspaces.value.find((item) => item.id === activeWorkspaceId.value))
const primaryWorkspace = computed(() => workspaces.value.find((item) => item.isPrimary))
const emptyDescription = computed(() => pageMode.value === 'compare'
  ? '至少需要两个独立书签库才能进行主辅对比'
  : '还没有书签库，请先导入 Chrome、Edge 或 Firefox 书签')

async function loadWorkspaces(preferredId = activeWorkspaceId.value) {
  try {
    workspaces.value = await listBookmarkWorkspaces()
    const next = workspaces.value.find((item) => item.id === preferredId)
      || workspaces.value.find((item) => item.isPrimary)
      || workspaces.value[0]
    activeWorkspaceId.value = next?.id || ''
  } catch (error) {
    message.error(error.message || '书签库加载失败')
  }
}

function selectWorkspace(id) {
  activeWorkspaceId.value = id
}

function openWorkspaceModal(workspace = null) {
  editingWorkspace.value = workspace
  workspaceModalOpen.value = true
}

async function submitWorkspace(payload) {
  submitting.value = true
  try {
    let workspace
    if (editingWorkspace.value?.id) {
      workspace = await updateBookmarkWorkspace(editingWorkspace.value.id, payload)
      message.success('书签库已更新')
    } else {
      workspace = await createBookmarkWorkspace(payload)
      message.success('书签库已创建，请导入浏览器书签文件')
    }
    workspaceModalOpen.value = false
    await loadWorkspaces(workspace.id)
    if (!editingWorkspace.value?.id) openImportModal('html')
  } catch (error) {
    message.error(error.message || '书签库保存失败')
  } finally {
    submitting.value = false
  }
}

async function handleWorkspaceAction(key, workspace) {
  activeWorkspaceId.value = workspace.id
  if (key === 'edit') {
    openWorkspaceModal(workspace)
    return
  }
  if (key === 'primary') {
    try {
      await updateBookmarkWorkspace(workspace.id, { isPrimary: true })
      message.success(`「${workspace.name}」已设为主书签库`)
      await loadWorkspaces(workspace.id)
    } catch (error) {
      message.error(error.message || '主书签库设置失败')
    }
    return
  }
  if (key === 'import') {
    openImportModal('html')
    return
  }
  if (key === 'clear') confirmClearWorkspace(workspace)
  if (key === 'delete') confirmDeleteWorkspace(workspace)
}

function confirmClearWorkspace(workspace) {
  Modal.confirm({
    title: `清空「${workspace.name}」`,
    content: `将删除 ${workspace.folderCount || 0} 个文件夹和 ${workspace.bookmarkCount || 0} 条书签，书签库 Tab 会保留，其他书签库不受影响。`,
    okText: '清空内容',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await clearBookmarkWorkspace(workspace.id)
      message.success('当前书签库内容已清空')
      await loadWorkspaces(workspace.id)
      await managerRef.value?.reloadAll?.()
    }
  })
}

function confirmDeleteWorkspace(workspace) {
  Modal.confirm({
    title: `删除「${workspace.name}」`,
    content: `将永久删除该 Tab、${workspace.folderCount || 0} 个文件夹和 ${workspace.bookmarkCount || 0} 条书签，其他书签库不受影响。`,
    okText: '删除书签库',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteBookmarkWorkspace(workspace.id)
      message.success('书签库已删除')
      await loadWorkspaces('')
    }
  })
}

function openImportModal(type = 'html') {
  if (!activeWorkspace.value) {
    message.info('请先创建书签库')
    return
  }
  importType.value = type
  importModalOpen.value = true
}

async function submitImport({ file, mode }) {
  submitting.value = true
  try {
    const result = importType.value === 'json'
      ? await importBookmarkJson(activeWorkspaceId.value, file, mode)
      : await importBookmarkHtml(activeWorkspaceId.value, file, mode)
    message.success(`导入完成：新增 ${result.inserted || 0}，更新 ${result.updated || 0}`)
    importModalOpen.value = false
    await loadWorkspaces(activeWorkspaceId.value)
    await managerRef.value?.reloadAll?.()
  } catch (error) {
    message.error(error.message || '导入失败')
  } finally {
    submitting.value = false
  }
}

async function handleExport(type) {
  try {
    const stamp = new Date().toISOString().slice(0, 10)
    if (type === 'json-all') {
      downloadBlob(await exportAllBookmarkJson(), `bookmarks-all-${stamp}.json`)
    } else if (type === 'json') {
      downloadBlob(await exportBookmarkJson(activeWorkspaceId.value), `${activeWorkspace.value.name}-${stamp}.json`)
    } else {
      downloadBlob(await exportBookmarkHtml(activeWorkspaceId.value), `${activeWorkspace.value.name}-${stamp}.html`)
    }
    await loadWorkspaces(activeWorkspaceId.value)
  } catch (error) {
    message.error(error.message || '导出失败')
  }
}

onMounted(loadWorkspaces)
</script>

<style scoped>
.bookmark-page {
  display: grid;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.bookmark-page__empty {
  display: grid;
  place-items: center;
  min-height: 420px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}
</style>
