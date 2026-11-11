<template>
  <section class="media-workspace">
    <div class="media-workspace__header">
      <div class="media-workspace__identity">
        <strong>资源管理</strong>
        <a-tooltip title="查看资源管理说明">
          <a-button type="text" size="small" aria-label="查看资源管理说明" @click="guideVisible = true">
            <QuestionCircleOutlined />
          </a-button>
        </a-tooltip>
        <a-tooltip :title="storageTooltip">
          <a-button
            type="text"
            size="small"
            class="media-workspace__storage"
            aria-label="刷新资源存储占用"
            :loading="storageLoading"
            @click="loadStorage(true)"
          >
            <DatabaseOutlined />
            <span>{{ storage ? formatMediaSize(storage.totalBytes) : '存储' }}</span>
          </a-button>
        </a-tooltip>
      </div>
      <div class="media-workspace__actions">
        <MediaVaultAccess
          ref="vaultRef"
          :active="workspace === 'vault'"
          @entered="enterVault"
          @state-change="handleVaultState"
        />
        <MediaHeaderActions
          :super-admin="auth.isSuperAdmin"
          :can-manage-shares="canManageShares"
          :show-upload="['library', 'all', 'vault'].includes(workspace)"
          @upload="openUpload"
          @categories="categoryVisible = true"
          @settings="openSettings"
          @inventory="inventoryVisible = true"
          @thumbnail-cache="cacheVisible = true"
          @shares="router.push('/console/manage/media-shares')"
        />
      </div>
    </div>
    <a-tabs
      :active-key="workspace === 'vault' ? '' : workspace"
      size="small"
      :animated="false"
      class="media-workspace__navigation"
      @change="changeWorkspace"
    >
      <a-tab-pane v-for="tab in mediaWorkspaces" :key="tab.key" :tab="tab.label" />
      <template v-if="workspace === 'vault'" #rightExtra>
        <a-tag :bordered="false">
          <LockOutlined />
          我的密码箱
        </a-tag>
      </template>
    </a-tabs>
    <a-alert v-if="error" type="error" :message="error" show-icon closable @close="error = ''">
      <template #action><a-button size="small" @click="reloadMetadata">重试</a-button></template>
    </a-alert>
    <div v-if="initializing" class="media-workspace__state"><a-spin tip="正在准备资源工作区" /></div>
    <MediaTrashPanel v-else-if="workspace === 'trash'" @changed="refreshResources" />
    <div v-else-if="workspace === 'vault' && !vaultUnlocked" class="media-workspace__state">
      <LockOutlined />
      <strong>密码箱已锁定</strong>
      <a-button @click="vaultRef?.enter()">验证后查看</a-button>
    </div>
    <MediaAssetBrowser
      v-else
      :key="workspace + ':' + navigationVersion"
      ref="browserRef"
      :workspace="workspace"
      :layout="layout"
      :categories="categories"
      :initial-filters="initialFilters"
      :selected-records="selectedRecords"
      :can-share="canShareSelection"
      :vault-unlocked="vaultUnlocked"
      @update:layout="changeLayout"
      @filters-change="syncFilters"
      @selection-change="selectedRecords = $event"
      @view="openPreview"
      @detail="openDetail"
      @references="openDetail($event, 'usage')"
      @download="downloadSingleMedia"
      @rename="openRename"
      @move="openMove"
      @delete="deleteOne"
      @batch-download="openBatchDownload"
      @batch-move="openBatchMove"
      @batch-delete="deleteSelected"
      @batch-share="shareVisible = true"
      @vault="vaultRef?.enter()"
    />

    <MediaCategoryManager v-model:open="categoryVisible" :categories="categories" @changed="refreshResources" />
    <MediaUploadSettingsModal
      v-model:open="settingsVisible"
      :value="settingsDraft"
      :submitting="settingsSaving"
      @submit="saveSettings"
    />
    <MediaRenameModal
      v-model:open="renameVisible"
      :record="renameRecord"
      :submitting="renameSubmitting"
      @submit="submitRename"
    />
    <MediaCategoryMoveModal
      v-model:open="moveVisible"
      :record="moveRecord"
      :selected-count="moveIds.length"
      :categories="moveOptions"
      :submitting="moveSubmitting"
      @submit="submitMove"
    />
    <MediaDownloadModal
      v-model:open="downloadModalVisible"
      :records="selectedRecords"
      :submitting="downloadSubmitting"
      @submit="submitBatchDownload"
    />
    <MediaShareCreateModal
      v-model:open="shareVisible"
      :media-ids="selectedRecords.map((item) => item.id)"
      @created="clearSelection"
    />
    <MediaDetailDrawer
      v-model:open="detailVisible"
      :record="detailRecord"
      :initial-tab="detailTab"
      @preview="openPreview"
      @download="downloadSingleMedia"
      @rename="openRename"
      @move="openMove"
      @delete="deleteOne"
    />
    <MediaPreviewModal v-model:open="previewVisible" :record="previewRecord" @download="downloadSingleMedia" />
    <MediaInventoryModal
      v-if="auth.isSuperAdmin && inventoryVisible"
      v-model:open="inventoryVisible"
      @changed="refreshResources"
    />
    <MediaThumbnailCacheModal
      v-if="auth.isSuperAdmin && cacheVisible"
      v-model:open="cacheVisible"
      @changed="loadStorage(true)"
    />
    <MediaGuideModal v-model:open="guideVisible" topic="overview" />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { DatabaseOutlined, LockOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import MediaAssetBrowser from './MediaAssetBrowser.vue'
import MediaHeaderActions from './MediaHeaderActions.vue'
import MediaCategoryManager from './MediaCategoryManager.vue'
import MediaVaultAccess from './MediaVaultAccess.vue'
import MediaDetailDrawer from './MediaDetailDrawer.vue'
import MediaTrashPanel from './MediaTrashPanel.vue'
import MediaRenameModal from './MediaRenameModal.vue'
import MediaCategoryMoveModal from './MediaCategoryMoveModal.vue'
import MediaDownloadModal from './MediaDownloadModal.vue'
import MediaPreviewModal from './MediaPreviewModal.vue'
import MediaShareCreateModal from './MediaShareCreateModal.vue'
import MediaInventoryModal from './MediaInventoryModal.vue'
import MediaThumbnailCacheModal from './MediaThumbnailCacheModal.vue'
import MediaUploadSettingsModal from './MediaUploadSettingsModal.vue'
import MediaGuideModal from './MediaGuideModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useMediaUploadStore } from '@/stores/mediaUpload'
import { useAdminActions } from '@/composables/useAdminUi'
import { useMediaDownloads } from './useMediaDownloads'
import { getMovableMediaCategories } from './mediaCategoryOptions'
import { DEFAULT_MEDIA_ALLOWED_EXTENSIONS, normalizeAllowedMediaExtensions } from './mediaUploadConfig'
import { mediaWorkspaces, resolveMediaWorkspace, getMediaActionRestrictions, formatMediaSize } from './mediaWorkspace'
import {
  listAdminMediaCategories,
  getAdminMediaStorageUsage,
  getAdminSettings,
  updateAdminSettings,
  renameAdminMedia,
  moveAdminMediaCategory,
  batchMoveAdminMediaCategory,
  deleteAdminMedia,
  batchDeleteAdminMedia,
  getAdminMediaDeleteRisk
} from '@/services/admin'

const auth = useAuthStore()
const uploadStore = useMediaUploadStore()
const route = useRoute()
const router = useRouter()
const { confirmAction } = useAdminActions()
const workspace = ref(resolveMediaWorkspace(route.query))
const layout = ref(route.query.view === 'folders' || route.query.view === 'grid' ? 'folders' : 'list')
const navigationVersion = ref(0)
const initialFilters = ref(readFilters(route.query))
const browserRef = ref(null)
const vaultRef = ref(null)
const selectedRecords = ref([])
const categories = ref([])
const initializing = ref(true)
const error = ref('')
const storage = ref(null)
const storageLoading = ref(false)
const vaultUnlocked = ref(false)
const vaultCategoryId = ref('')
const categoryVisible = ref(false)
const settingsVisible = ref(false)
const settingsSaving = ref(false)
const inventoryVisible = ref(false)
const cacheVisible = ref(false)
const guideVisible = ref(false)
const shareVisible = ref(false)
const renameVisible = ref(false)
const renameRecord = ref(null)
const renameSubmitting = ref(false)
const moveVisible = ref(false)
const moveRecord = ref(null)
const moveIds = ref([])
const moveSubmitting = ref(false)
const detailVisible = ref(false)
const detailRecord = ref(null)
const detailTab = ref('info')
const previewVisible = ref(false)
const previewRecord = ref(null)
const uploadRules = ref({ maxFiles: 5, maxFileSizeMB: 20, allowedExtensions: [...DEFAULT_MEDIA_ALLOWED_EXTENSIONS] })
const settingsDraft = ref({})
let disposed = false
let categoryRequest = 0
let storageRequest = 0
const canManageShares = computed(() => auth.canAccessPath('/console/manage/media-shares'))
const canShareSelection = computed(
  () => canManageShares.value && selectedRecords.value.every((item) => item.accessScope === 'public')
)
const moveOptions = computed(() =>
  getMovableMediaCategories(
    categories.value,
    moveRecord.value ? [moveRecord.value] : selectedRecords.value,
    auth.user?.id
  )
)
const storageTooltip = computed(() =>
  storage.value
    ? `服务器文件占用，含原件及缓存，共 ${storage.value.fileCount} 个文件。点击刷新；详情见设置与维护中的缩略图缓存。`
    : '统计服务器上传文件占用，点击重试'
)
const { downloadModalVisible, downloadSubmitting, downloadSingleMedia, openBatchDownload, submitBatchDownload } =
  useMediaDownloads({ selectedMediaRecords: selectedRecords, clearSelection })

function readFilters(query) {
  return {
    keyword: String(query.keyword || ''),
    categoryId: String(query.categoryId || query.category || ''),
    fileClass: String(query.fileClass || ''),
    scene: String(query.scene || ''),
    lifecycleStatus: String(query.lifecycleStatus || ''),
    usageStatus: String(query.usageStatus || '')
  }
}
function writeRoute() {
  const query = { ...route.query, tab: workspace.value, view: layout.value === 'folders' ? 'grid' : 'list' }
  delete query.category
  for (const [key, value] of Object.entries(initialFilters.value)) {
    if (value) query[key] = value
    else delete query[key]
  }
  router.replace({ query }).catch(() => {})
}
function changeWorkspace(value) {
  if (workspace.value === value) return
  clearSelection()
  detailVisible.value = false
  previewVisible.value = false
  workspace.value = value
  initialFilters.value = readFilters({})
  writeRoute()
}
function changeLayout(value) {
  clearSelection()
  layout.value = value
  writeRoute()
}
function syncFilters(value) {
  initialFilters.value = { ...value }
  writeRoute()
}
function clearSelection() {
  selectedRecords.value = []
}
function enterVault() {
  changeWorkspace('vault')
}
function handleVaultState(status) {
  vaultUnlocked.value = status.unlocked === true
  vaultCategoryId.value = status.categoryId || ''
  // 锁定或到期立即卸下业务内容与预览，不能只在下一次请求时才隐藏。
  clearSelection()
  if (!vaultUnlocked.value) {
    detailVisible.value = false
    previewVisible.value = false
    detailRecord.value = null
    previewRecord.value = null
    renameVisible.value = false
    moveVisible.value = false
    downloadModalVisible.value = false
    shareVisible.value = false
    renameRecord.value = null
    moveRecord.value = null
    moveIds.value = []
  }
  navigationVersion.value += 1
}
watch(
  () => route.fullPath,
  () => {
    const nextWorkspace = resolveMediaWorkspace(route.query)
    const nextFilters = readFilters(route.query)
    const nextLayout = ['folders', 'grid'].includes(route.query.view) ? 'folders' : 'list'
    if (
      nextWorkspace === workspace.value &&
      JSON.stringify(nextFilters) === JSON.stringify(initialFilters.value) &&
      nextLayout === layout.value
    )
      return
    clearSelection()
    detailVisible.value = false
    previewVisible.value = false
    workspace.value = nextWorkspace
    initialFilters.value = nextFilters
    layout.value = nextLayout
    navigationVersion.value += 1
  }
)
async function loadCategories() {
  const current = ++categoryRequest
  const result = await listAdminMediaCategories({ scope: auth.isSuperAdmin ? 'all' : undefined })
  if (!disposed && current === categoryRequest) categories.value = result
}
async function loadStorage(force = false) {
  const current = ++storageRequest
  storageLoading.value = true
  try {
    const result = await getAdminMediaStorageUsage({ refresh: force })
    if (!disposed && current === storageRequest) storage.value = result
  } catch {
    if (!disposed && current === storageRequest) storage.value = null
  } finally {
    if (!disposed && current === storageRequest) storageLoading.value = false
  }
}
async function reloadMetadata() {
  error.value = ''
  try {
    await loadCategories()
  } catch (reason) {
    error.value = reason.message || '分类加载失败'
  }
}
async function refreshResources() {
  clearSelection()
  detailVisible.value = false
  await Promise.all([reloadMetadata(), loadStorage(true)])
  browserRef.value?.refresh()
}
function rulesFrom(settings) {
  return {
    maxFiles: Number(settings.mediaMaxFilesPerUpload) || 5,
    maxFileSizeMB: Number(settings.mediaMaxFileSizeMB) || 20,
    allowedExtensions: normalizeAllowedMediaExtensions(settings.mediaAllowedExtensions)
  }
}
function settingsFromRules() {
  return {
    mediaMaxFilesPerUpload: uploadRules.value.maxFiles,
    mediaMaxFileSizeMB: uploadRules.value.maxFileSizeMB,
    mediaAllowedExtensions: [...uploadRules.value.allowedExtensions]
  }
}
function openSettings() {
  settingsDraft.value = settingsFromRules()
  settingsVisible.value = true
}
async function saveSettings(value) {
  settingsSaving.value = true
  try {
    const next = await updateAdminSettings({
      mediaMaxFilesPerUpload: Number(value.mediaMaxFilesPerUpload),
      mediaMaxFileSizeMB: Number(value.mediaMaxFileSizeMB),
      mediaAllowedExtensions: normalizeAllowedMediaExtensions(value.mediaAllowedExtensions)
    })
    uploadRules.value = rulesFrom(next)
    if (!uploadStore.started) uploadStore.rules = { ...uploadRules.value }
    settingsVisible.value = false
    message.success('上传限制已保存')
  } catch (reason) {
    message.error(reason.message || '上传限制保存失败')
  } finally {
    settingsSaving.value = false
  }
}
function openUpload() {
  if (workspace.value === 'vault' && !vaultUnlocked.value) return vaultRef.value?.enter()
  const protectedNames = new Set(['用户头像', '简历照片', '讨论附件', '工作日志', '意见反馈', '文章正文临时图片'])
  const available = categories.value.filter(
    (item) =>
      item.id &&
      !item.virtual &&
      (item.system || String(item.owner || '') === String(auth.user?.id || '')) &&
      (workspace.value === 'vault'
        ? item.accessMode === 'vault'
        : item.accessMode !== 'vault' && !protectedNames.has(item.name))
  )
  const preferred = workspace.value === 'vault' ? vaultCategoryId.value : initialFilters.value.categoryId
  const categoryId =
    available.find((item) => item.id === preferred)?.id ||
    available.find((item) => item.name === '默认素材')?.id ||
    available[0]?.id
  uploadStore.open({
    ownerId: auth.user?.id,
    rules: uploadRules.value,
    categoryId,
    categoryOptions: available.map((item) => ({ value: item.id, name: item.name, label: item.name }))
  })
}
function openPreview(record) {
  detailVisible.value = false
  previewRecord.value = record
  previewVisible.value = true
}
function openDetail(record, tab = 'info') {
  detailRecord.value = record
  detailTab.value = tab
  detailVisible.value = true
}
function openRename(record) {
  renameRecord.value = record
  renameVisible.value = true
}
async function submitRename(name) {
  if (!name?.trim()) return message.warning('请输入资源名称')
  renameSubmitting.value = true
  try {
    await renameAdminMedia(renameRecord.value.id, { originalName: name })
    renameVisible.value = false
    await refreshResources()
    message.success('名称已保存')
  } catch (reason) {
    message.error(reason.message || '重命名失败')
  } finally {
    renameSubmitting.value = false
  }
}
function openMove(record) {
  const reason = getMediaActionRestrictions(record).moveReason
  if (reason) return message.info(reason)
  moveRecord.value = record
  moveIds.value = []
  moveVisible.value = true
}
function openBatchMove() {
  if (selectedRecords.value.some((item) => getMediaActionRestrictions(item).moveReason))
    return message.info('部分文件由所属业务维护，请分别处理')
  moveRecord.value = null
  moveIds.value = selectedRecords.value.map((item) => item.id)
  moveVisible.value = true
}
async function submitMove(target) {
  moveSubmitting.value = true
  try {
    if (moveRecord.value) await moveAdminMediaCategory(moveRecord.value.id, target)
    else await batchMoveAdminMediaCategory(moveIds.value, target)
    moveVisible.value = false
    await refreshResources()
    message.success('分类已调整')
  } catch (reason) {
    message.error(reason.message || '分类调整失败')
  } finally {
    moveSubmitting.value = false
  }
}
function deleteOne(record) {
  confirmDelete([record.id])
}
function deleteSelected() {
  confirmDelete(selectedRecords.value.map((item) => item.id))
}
async function confirmDelete(ids) {
  if (!ids.length) return
  let risk
  try {
    risk = await getAdminMediaDeleteRisk(ids)
  } catch (reason) {
    message.error(reason.message || '无法确认资源使用情况，请重试')
    return
  }
  if (risk.referencedCount > 0) {
    message.warning('选中的文件仍有使用位置，请先在所属业务中移除或替换')
    return
  }
  if (risk.items.length !== ids.length) {
    message.warning('部分资源已不可用，请刷新列表后重试')
    return
  }
  confirmAction({
    title: ids.length > 1 ? '批量移入回收站' : '移入回收站',
    content: `将 ${ids.length} 份资源移入回收站，原文件保留，可在回收站恢复。服务器会再次检查使用关系。`,
    okText: '移入回收站',
    okType: 'danger',
    async onOk() {
      try {
        if (ids.length === 1) await deleteAdminMedia(ids[0])
        else await batchDeleteAdminMedia(ids)
        await refreshResources()
        message.success('已移入回收站')
      } catch (reason) {
        message.error(reason.message || '删除失败')
        throw reason
      }
    }
  }).catch(() => {})
}
watch(
  () => uploadStore.completedVersion,
  () => {
    if (uploadStore.ownerId === auth.user?.id) refreshResources()
  }
)
onMounted(async () => {
  try {
    await Promise.all([
      reloadMetadata(),
      loadStorage(),
      getAdminSettings().then((settings) => {
        if (!disposed) uploadRules.value = rulesFrom(settings)
      })
    ])
  } catch (reason) {
    error.value = reason.message || '资源工作区初始化失败'
  } finally {
    if (!disposed) initializing.value = false
  }
})
onBeforeUnmount(() => {
  disposed = true
  categoryRequest += 1
  storageRequest += 1
})
</script>

<style scoped>
.media-workspace {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: var(--console-page-available-height);
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  container-type: inline-size;
}
.media-workspace__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex: 0 0 auto;
  min-height: 32px;
}
.media-workspace__identity,
.media-workspace__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.media-workspace__identity > strong {
  font-size: 16px;
  white-space: nowrap;
  color: var(--console-text);
}
.media-workspace__storage {
  color: var(--console-text-secondary);
  font-size: 12px;
}
.media-workspace__actions {
  flex-shrink: 0;
}
.media-workspace__navigation {
  flex: 0 0 auto;
  min-width: 0;
}
.media-workspace__navigation :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
.media-workspace__navigation :deep(.ant-tabs-content-holder) {
  display: none;
}
.media-workspace__navigation :deep(.ant-tabs-tab) {
  padding: 8px 0;
}
.media-workspace__state {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 14px;
  color: var(--console-text-secondary);
}
@container (max-width: 620px) {
  .media-workspace__storage span {
    display: none;
  }
  .media-workspace__identity > strong {
    font-size: 14px;
  }
}
@media (max-height: 760px) {
  .media-workspace {
    gap: 4px;
  }
  .media-workspace__navigation :deep(.ant-tabs-tab) {
    padding-top: 5px;
    padding-bottom: 5px;
  }
}
</style>
