<template>
  <section class="media-cloud">
    <!-- 一级工具栏只保留页面识别和全局命令，避免与查询条件互相挤压。 -->
    <div class="media-cloud__topbar">
      <div class="media-cloud__identity">
        <h2 class="media-cloud__title">媒体资产</h2>
      </div>
      <div class="media-cloud__actions">
        <a-tooltip v-if="authStore.isSuperAdmin" title="扫描未登记资源">
          <a-button class="media-cloud__header-icon" aria-label="扫描未登记资源" @click="inventoryModalVisible = true">
            <template #icon><SearchOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="上传限制">
          <a-button class="media-cloud__header-icon" aria-label="上传限制" @click="openUploadSettings">
            <template #icon><SettingOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="媒体回收站">
          <a-button class="media-cloud__header-icon" aria-label="媒体回收站" @click="openTrashModal">
            <template #icon><RestOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="管理资源分类">
          <a-button class="media-cloud__header-icon" aria-label="管理资源分类" @click="categoryModalVisible = true">
            <template #icon><FolderOpenOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip v-if="canManageMediaShares" title="管理资源分享">
          <a-button class="media-cloud__header-icon" aria-label="管理资源分享" @click="router.push('/console/manage/media-shares')">
            <template #icon><ShareAltOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-button type="primary" @click="uploadModalVisible = true">
          <template #icon><InboxOutlined /></template>
          上传资源
        </a-button>
      </div>
    </div>

    <!-- 查询、类型统计和批量操作属于同一工作层，选中前不展示无效命令。 -->
    <div class="media-cloud__list-toolbar">
      <div class="media-cloud__filters">
        <a-input-search
          v-model:value="keyword"
          allow-clear
          placeholder="搜索文件名或分类"
          style="width: 260px"
          size="middle"
          @search="refreshTable"
        />
        <a-select
          v-model:value="filterCategory"
          allow-clear
          show-search
          placeholder="分类筛选"
          style="width: 150px"
          size="middle"
          :options="filterCategoryOptions"
          :filter-option="filterSelectOption"
        />
        <a-select
          v-model:value="filterFileClass"
          allow-clear
          show-search
          option-filter-prop="label"
          placeholder="类型"
          style="width: 110px"
          size="middle"
          :options="fileClassOptions"
        />
        <a-select
          v-model:value="filterUsageStatus"
          allow-clear
          show-search
          option-filter-prop="label"
          placeholder="引用状态"
          style="width: 130px"
          size="middle"
          :options="usageStatusOptions"
        />
      </div>
      <div class="media-cloud__type-filter">
        <button
          v-for="item in summaryCards"
          :key="item.key"
          class="media-type-chip"
          :class="{ 'is-active': filterFileClass === item.value }"
          @click="toggleFileClassFilter(item.value)"
        >
          {{ item.label }}
          <b>{{ item.count }}</b>
        </button>
      </div>
      <div v-if="selectedMediaKeys.length > 0" class="media-batch-actions">
        <span class="media-batch-actions__count">已选择 {{ selectedMediaKeys.length }} 个</span>
        <a-button
          v-if="canManageMediaShares"
          size="small"
          :disabled="selectedMediaKeys.length === 0"
          @click="clearMediaSelection"
        >
          取消选择
        </a-button>
        <a-button
          size="small"
          :disabled="selectedMediaKeys.length === 0"
          @click="openBatchCategoryMove"
        >
          <template #icon><SwapOutlined /></template>
          迁移分类
        </a-button>
        <a-button
          size="small"
          :disabled="selectedMediaKeys.length === 0"
          @click="shareCreateVisible = true"
        >
          <template #icon><ShareAltOutlined /></template>
          创建分享
        </a-button>
        <a-button
          size="small"
          danger
          :disabled="selectedMediaKeys.length === 0"
          @click="handleBatchDelete"
        >
          <template #icon><DeleteOutlined /></template>
          批量移入回收站
        </a-button>
      </div>
    </div>

    <!-- 表格主体 -->
    <div class="media-cloud__body">
      <BlogTable
        ref="tableRef"
        :api-fn="loadMedia"
        :columns="columns"
        :params="tableParams"
        :auto-load="true"
        :page-size="16"
        :page-sizes="['16', '32', '64']"
        :scroll="{ x: 920 }"
        :row-selection="mediaRowSelection"
        empty-text="暂无符合条件的媒体资源"
        height="auto"
        @selection-change="handleMediaSelectionChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 文件信息：缩略图 + 文件名 -->
          <template v-if="column.key === 'asset'">
            <div class="media-file">
              <div class="media-file__thumb" :class="`is-${record.fileClass || 'other'}`">
                <img v-if="record.kind === 'image'" :src="record.url" :alt="record.originalName" loading="lazy">
                <span v-else class="media-file__ext">{{ getFileBadge(record) }}</span>
              </div>
              <div class="media-file__info">
                <div class="media-file__name" :title="record.originalName">{{ record.originalName }}</div>
                <a-typography-text
                  :content="record.url"
                  :copyable="{ text: record.url, tooltips: ['复制地址', '已复制'] }"
                  class="media-file__url"
                >
                  {{ record.url }}
                </a-typography-text>
              </div>
            </div>
          </template>

          <!-- 类型标签 -->
          <template v-else-if="column.key === 'fileClass'">
            <a-tag :bordered="false" :color="getFileClassColor(record.fileClass)" class="media-type-tag">
              {{ getFileClassLabel(record.fileClass) }}
            </a-tag>
          </template>

          <!-- 文件大小 -->
          <template v-else-if="column.key === 'size'">
            <span class="media-size">{{ formatFileSize(record.size) }}</span>
          </template>

          <!-- 分类 -->
          <template v-else-if="column.key === 'category'">
            <span class="media-category-label">{{ record.category || '未分类' }}</span>
          </template>

          <!-- 引用状态 -->
          <template v-else-if="column.key === 'usage'">
            <a-button
              type="link"
              size="small"
              class="media-usage-link"
              @click="openReferenceModal(record)"
            >
              <a-badge
                :status="record.usage?.referenceCount > 0 ? 'success' : 'warning'"
                :text="`${record.usage?.usageStatusLabel || '待扫描'} · ${record.usage?.referenceCount || 0}`"
              />
            </a-button>
          </template>

          <!-- 上传时间 -->
          <template v-else-if="column.key === 'createdAt'">
            <span class="media-time">{{ formatDate(record.createdAt) }}</span>
          </template>

          <!-- 操作按钮 -->
          <template v-else-if="column.key === 'action'">
            <a-space :size="4">
              <a-tooltip title="预览">
                <a-button type="text" size="small" class="media-action-btn media-action-btn--view" aria-label="预览媒体" @click="handleView(record)">
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="重命名">
                <a-button type="text" size="small" class="media-action-btn media-action-btn--rename" aria-label="重命名媒体" @click="handleRename(record)">
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="调整分类">
                <a-button type="text" size="small" class="media-action-btn media-action-btn--move" aria-label="调整资源分类" @click="openSingleCategoryMove(record)">
                  <template #icon><SwapOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="查看引用">
                <a-button type="text" size="small" class="media-action-btn media-action-btn--refs" aria-label="查看媒体引用" @click="openReferenceModal(record)">
                  <template #icon><LinkOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="移入回收站">
                <a-button type="text" size="small" danger class="media-action-btn media-action-btn--delete" aria-label="移入回收站" @click="handleDelete(record)">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </BlogTable>
    </div>

    <MediaUploadModal
      ref="uploadModalRef"
      v-model:open="uploadModalVisible"
      :rules="uploadRules"
      :category-options="filterCategoryOptions"
      @uploaded="handleUploadCompleted"
    />

    <MediaUploadSettingsModal
      v-model:open="settingsModalVisible"
      :value="settingsDraft"
      :submitting="settingsSaving"
      @submit="saveUploadSettings"
    />

    <MediaTrashModal
      v-model:open="trashModalVisible"
      @changed="handleTrashChanged"
    />

    <MediaRenameModal
      v-model:open="renameModalVisible"
      :record="renameRecord"
      :submitting="renameSubmitting"
      @submit="submitRename"
    />

    <MediaCategoryMoveModal
      v-model:open="categoryMoveModalVisible"
      :record="categoryMoveRecord"
      :selected-count="categoryMoveIds.length"
      :categories="categoryMoveOptions"
      :submitting="categoryMoveSubmitting"
      @submit="submitCategoryMove"
    />

    <MediaReferenceModal
      v-model:open="referenceModalVisible"
      :record="referenceRecord"
    />

    <MediaInventoryModal
      v-model:open="inventoryModalVisible"
      @changed="handleInventoryChanged"
    />

    <MediaPreviewModal v-model:open="previewVisible" :record="previewRecord" />

    <MediaShareCreateModal
      v-model:open="shareCreateVisible"
      :media-ids="selectedMediaKeys"
      @created="handleShareCreated"
    />

    <a-modal
      v-model:open="categoryModalVisible"
      :footer="null"
      width="900px"
      centered
      :body-style="{ maxHeight: '72vh', overflow: 'hidden', paddingBottom: '16px' }"
    >
      <template #title>
        <div class="media-category-modal__title">
          <span>资源分类</span>
          <a-tooltip title="查看分类规则">
            <a-button type="text" size="small" aria-label="查看资源分类说明" @click="openMediaGuide('category')">
              <template #icon><QuestionCircleOutlined /></template>
            </a-button>
          </a-tooltip>
        </div>
      </template>

      <div class="media-category-panel">
        <aside class="media-category-panel__list-wrap">
          <div class="media-category-panel__list-header">
            <strong>已有分类</strong>
            <span>{{ categories.length }} 个</span>
          </div>
          <div v-if="categories.length === 0" class="media-category-panel__empty">暂无资源分类</div>
          <div v-else class="media-category-panel__list">
            <article
              v-for="item in categories"
              :key="item.id || item.name"
              class="media-category-item"
              :class="{
                'is-active': editingCategoryId === item.id,
                'is-system': item.system
              }"
            >
              <div class="media-category-item__info">
                <div class="media-category-item__title">
                  <strong>{{ item.name }}</strong>
                  <a-tag v-if="item.system" :bordered="false" color="blue">系统</a-tag>
                  <a-tag v-else-if="!item.id" :bordered="false" color="orange">待归档</a-tag>
                </div>
                <p>{{ item.description || '未填写分类说明' }}</p>
                <span>{{ item.count || 0 }} 个资源</span>
              </div>
              <a-space v-if="canEditCategory(item)" :size="2" class="media-category-item__actions">
                <a-tooltip title="编辑分类">
                  <a-button
                    type="text"
                    size="small"
                    :aria-label="`编辑分类 ${item.name}`"
                    @click="editCategory(item)"
                  >
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="删除分类">
                  <a-button
                    type="text"
                    size="small"
                    danger
                    :aria-label="`删除分类 ${item.name}`"
                    @click="removeCategory(item)"
                  >
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-tooltip>
              </a-space>
            </article>
          </div>
        </aside>

        <section class="media-category-panel__form">
          <div class="media-category-panel__form-header">
            <div>
              <strong>{{ editingCategoryId ? '编辑自定义分类' : '新建自定义分类' }}</strong>
              <span>系统分类由业务链路维护，不能修改或删除。</span>
            </div>
            <a-button v-if="editingCategoryId" type="text" size="small" @click="resetCategoryDraft">取消编辑</a-button>
          </div>
          <a-form layout="vertical">
            <a-form-item label="分类名称">
              <a-input v-model:value="categoryDraft.name" placeholder="例如 项目截图 / 课程资料 / 接口示例" />
            </a-form-item>
            <a-form-item label="分类描述">
              <a-textarea v-model:value="categoryDraft.description" :rows="2" placeholder="可选，说明这个分类存放什么资源" />
            </a-form-item>
            <div class="media-category-panel__actions">
              <a-button type="primary" :loading="categorySubmitting" @click="submitCategory">
                {{ editingCategoryId ? '保存分类' : '新建分类' }}
              </a-button>
            </div>
          </a-form>
        </section>
      </div>
    </a-modal>

    <MediaGuideModal v-model:open="mediaGuideVisible" :topic="mediaGuideTopic" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  InboxOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  SettingOutlined,
  RestOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  SwapOutlined,
  FolderOpenOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import MediaTrashModal from './MediaTrashModal.vue'
import MediaRenameModal from './MediaRenameModal.vue'
import MediaCategoryMoveModal from './MediaCategoryMoveModal.vue'
import MediaPreviewModal from './MediaPreviewModal.vue'
import MediaReferenceModal from './MediaReferenceModal.vue'
import MediaInventoryModal from './MediaInventoryModal.vue'
import MediaUploadSettingsModal from './MediaUploadSettingsModal.vue'
import MediaUploadModal from './MediaUploadModal.vue'
import MediaGuideModal from './MediaGuideModal.vue'
import MediaShareCreateModal from './MediaShareCreateModal.vue'
import {
  DEFAULT_MEDIA_ALLOWED_EXTENSIONS,
  normalizeAllowedMediaExtensions
} from './mediaUploadConfig'
import {
  createAdminMediaCategory,
  deleteAdminMedia,
  deleteAdminMediaCategory,
  getAdminMediaDeleteRisk,
  getAdminSettings,
  listAdminMedia,
  listAdminMediaCategories,
  batchDeleteAdminMedia,
  batchMoveAdminMediaCategory,
  moveAdminMediaCategory,
  renameAdminMedia,
  updateAdminMediaCategory,
  updateAdminSettings
} from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'
import { useAuthStore } from '@/stores/auth'
import { getMovableMediaCategories } from './mediaCategoryOptions'

const tableRef = ref(null)
const router = useRouter()
const uploadModalRef = ref(null)
const errorMessage = ref('')
const categories = ref([])
const keyword = ref('')
const filterCategory = ref(undefined)
const filterFileClass = ref(undefined)
const filterUsageStatus = ref(undefined)
const uploadModalVisible = ref(false)
const categoryModalVisible = ref(false)
const categorySubmitting = ref(false)
const editingCategoryId = ref('')
const actionLoadingKey = ref('')
const settingsModalVisible = ref(false)
const settingsSaving = ref(false)
const renameModalVisible = ref(false)
const renameSubmitting = ref(false)
const renameRecord = ref(null)
const categoryMoveModalVisible = ref(false)
const categoryMoveSubmitting = ref(false)
const categoryMoveRecord = ref(null)
const categoryMoveIds = ref([])
const referenceModalVisible = ref(false)
const referenceRecord = ref(null)
const inventoryModalVisible = ref(false)
const mediaGuideVisible = ref(false)
const mediaGuideTopic = ref('inventory')
const shareCreateVisible = ref(false)
const uploadRules = ref({
  maxFiles: 5,
  maxFileSizeMB: 20,
  allowedExtensions: [...DEFAULT_MEDIA_ALLOWED_EXTENSIONS]
})
const settingsDraft = ref({
  mediaMaxFilesPerUpload: 5,
  mediaMaxFileSizeMB: 20,
  mediaAllowedExtensions: [...DEFAULT_MEDIA_ALLOWED_EXTENSIONS]
})
const trashModalVisible = ref(false)
const selectedMediaKeys = ref([])
const selectedMediaRecords = ref([])
const categoryDraft = ref({
  name: '',
  description: ''
})
const { runAction, confirmAction } = useAdminActions()
const authStore = useAuthStore()
const canManageMediaShares = computed(() => authStore.canAccessPath('/console/manage/media-shares'))

const fileClassOptions = [
  { label: '图片', value: 'image' },
  { label: '代码', value: 'code' },
  { label: '文档', value: 'document' },
  { label: '压缩包/安装包', value: 'archive' },
  { label: '其他', value: 'other' }
]

const usageStatusOptions = [
  { label: '已引用', value: 'referenced' },
  { label: '疑似未引用', value: 'unreferenced' }
]

const categoryOptions = computed(() => {
  return categories.value
    .filter((item) => item.id)
    .map((item) => ({
    label: `${item.name}${item.count ? ` (${item.count})` : ''}`,
    value: item.id,
    name: item.name
  }))
})

const filterCategoryOptions = computed(() => categories.value.map((item) => ({
  label: `${item.name}${item.count ? ` (${item.count})` : ''}`,
  value: item.id || item.name
})))

const categoryMoveOptions = computed(() => {
  const records = categoryMoveRecord.value ? [categoryMoveRecord.value] : selectedMediaRecords.value
  return getMovableMediaCategories(categories.value, records, authStore.user?.id)
})

const tableParams = computed(() => ({
  keyword: keyword.value || undefined,
  categoryId: /^[a-f\d]{24}$/i.test(filterCategory.value || '') ? filterCategory.value : undefined,
  category: /^[a-f\d]{24}$/i.test(filterCategory.value || '') ? undefined : filterCategory.value,
  fileClass: filterFileClass.value || undefined,
  usageStatus: filterUsageStatus.value || undefined
}))

const columns = [
  {
    title: '文件信息',
    key: 'asset',
    width: 320,
    fixed: 'left'
  },
  { title: '类型', key: 'fileClass', width: 90, align: 'center' },
  { title: '大小', key: 'size', width: 95, align: 'right' },
  { title: '分类', key: 'category', width: 120, align: 'center' },
  { title: '引用状态', key: 'usage', width: 140, align: 'center' },
  { title: '上传时间', key: 'createdAt', width: 170, align: 'center' },
  { title: '操作', key: 'action', width: 180, align: 'center', fixed: 'right' }
]

const mediaRowSelection = computed(() => ({
  fixed: true,
  selectedRowKeys: selectedMediaKeys.value,
  onChange: (keys, rows) => {
    selectedMediaKeys.value = keys
    selectedMediaRecords.value = rows
  }
}))

const summaryCards = computed(() => {
  const countMap = Object.fromEntries(fileClassOptions.map((item) => [item.value, 0]))
  categories.value.forEach(() => {})
  return fileClassOptions.map((item) => ({
    key: item.value,
    label: item.label,
    value: item.value,
    count: mediaStats.value[item.value] || 0
  }))
})

const mediaStats = ref({
  image: 0,
  code: 0,
  document: 0,
  archive: 0,
  other: 0
})

function filterSelectOption(input, option) {
  const keyword = String(input || '').trim().toLowerCase()
  if (!keyword) return true
  const label = String(option?.label || '').toLowerCase()
  return label.includes(keyword)
}

function refreshTable() {
  tableRef.value?.refresh()
}

async function handleInventoryChanged() {
  await loadCategories()
  refreshTable()
}

function handleMediaSelectionChange(keys) {
  selectedMediaKeys.value = keys
}

function clearMediaSelection() {
  selectedMediaKeys.value = []
  selectedMediaRecords.value = []
  tableRef.value?.clearSelection()
}

function handleShareCreated() {
  clearMediaSelection()
}

function toggleFileClassFilter(value) {
  filterFileClass.value = filterFileClass.value === value ? undefined : value
}

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }
  return `${Math.ceil(size / 1024)} KB`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}

function getFileBadge(record) {
  return record.originalName?.split('.').at(-1)?.toUpperCase() || 'FILE'
}

function getFileClassLabel(fileClass) {
  return fileClassOptions.find((item) => item.value === fileClass)?.label || '其他'
}

function getFileClassColor(fileClass) {
  const map = {
    image: 'blue',
    code: 'geekblue',
    document: 'green',
    archive: 'orange',
    other: 'default'
  }
  return map[fileClass] || 'default'
}

async function loadMedia(params) {
  const result = await listAdminMedia(params)
  const statsSource = await listAdminMedia({
    page: 1,
    pageSize: 200,
    keyword: keyword.value || undefined,
    categoryId: /^[a-f\d]{24}$/i.test(filterCategory.value || '') ? filterCategory.value : undefined,
    category: /^[a-f\d]{24}$/i.test(filterCategory.value || '') ? undefined : filterCategory.value,
    usageStatus: filterUsageStatus.value || undefined
  })
  mediaStats.value = statsSource.items.reduce((acc, item) => {
    const key = item.fileClass || 'other'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, { image: 0, code: 0, document: 0, archive: 0, other: 0 })
  return result
}

async function loadCategories() {
  categories.value = await listAdminMediaCategories()
}

async function loadUploadRules() {
  const settings = await getAdminSettings()
  uploadRules.value = {
    maxFiles: Number(settings.mediaMaxFilesPerUpload) || 5,
    maxFileSizeMB: Number(settings.mediaMaxFileSizeMB) || 20,
    allowedExtensions: normalizeAllowedMediaExtensions(settings.mediaAllowedExtensions)
  }
  settingsDraft.value = {
    mediaMaxFilesPerUpload: uploadRules.value.maxFiles,
    mediaMaxFileSizeMB: uploadRules.value.maxFileSizeMB,
    mediaAllowedExtensions: uploadRules.value.allowedExtensions
  }
}

function openUploadSettings() {
  settingsDraft.value = {
    mediaMaxFilesPerUpload: uploadRules.value.maxFiles,
    mediaMaxFileSizeMB: uploadRules.value.maxFileSizeMB,
    mediaAllowedExtensions: uploadRules.value.allowedExtensions
  }
  settingsModalVisible.value = true
}

async function saveUploadSettings(payload) {
  settingsSaving.value = true
  try {
    const nextSettings = await runAction(() => updateAdminSettings({
      mediaMaxFilesPerUpload: Number(payload.mediaMaxFilesPerUpload),
      mediaMaxFileSizeMB: Number(payload.mediaMaxFileSizeMB),
      mediaAllowedExtensions: normalizeAllowedMediaExtensions(payload.mediaAllowedExtensions)
    }), {
      successMessage: '上传限制已保存',
      errorMessage: '上传限制保存失败'
    })

    uploadRules.value = {
      maxFiles: Number(nextSettings.mediaMaxFilesPerUpload) || 5,
      maxFileSizeMB: Number(nextSettings.mediaMaxFileSizeMB) || 20,
      allowedExtensions: normalizeAllowedMediaExtensions(nextSettings.mediaAllowedExtensions)
    }
    settingsDraft.value = {
      mediaMaxFilesPerUpload: uploadRules.value.maxFiles,
      mediaMaxFileSizeMB: uploadRules.value.maxFileSizeMB,
      mediaAllowedExtensions: uploadRules.value.allowedExtensions
    }
    settingsModalVisible.value = false
    uploadModalRef.value?.reset()
  } finally {
    settingsSaving.value = false
  }
}

async function handleUploadCompleted() {
  await loadCategories()
  tableRef.value?.refresh()
}

const previewVisible = ref(false)
const previewRecord = ref(null)

function handleView(record) {
  previewRecord.value = record
  previewVisible.value = true
}

function handleDelete(record) {
  confirmMediaDelete([record.id], {
    title: '移入回收站',
    getContent: (risk) => buildDeleteRiskContent(risk, `文件「${record.originalName}」会从媒体库列表移除，数据库记录和服务器文件会保留，可在回收站恢复或彻底删除。`),
    okText: '移入回收站',
    okType: 'danger',
    async onOk() {
      actionLoadingKey.value = `delete:${record.id}`
      try {
        await runAction(() => deleteAdminMedia(record.id), {
          successMessage: '文件已移入回收站',
          errorMessage: '删除失败',
          onSuccess: async () => {
            await loadCategories()
            tableRef.value?.refresh()
          }
        })
      } finally {
        actionLoadingKey.value = ''
      }
    }
  }).catch(() => {})
}

function handleRename(record) {
  renameRecord.value = record
  renameModalVisible.value = true
}

function openSingleCategoryMove(record) {
  categoryMoveRecord.value = record
  categoryMoveIds.value = []
  categoryMoveModalVisible.value = true
}

function openBatchCategoryMove() {
  categoryMoveRecord.value = null
  categoryMoveIds.value = [...selectedMediaKeys.value]
  categoryMoveModalVisible.value = true
}

async function submitCategoryMove(target) {
  if (!target?.id || !target?.name) {
    return
  }

  const record = categoryMoveRecord.value
  const ids = [...categoryMoveIds.value]
  if (!record && ids.length === 0) {
    return
  }

  categoryMoveSubmitting.value = true
  try {
    await runAction(
      () => record
        ? moveAdminMediaCategory(record.id, target)
        : batchMoveAdminMediaCategory(ids, target),
      {
        successMessage: record
          ? `已将资源迁移至「${target.name}」`
          : `已将 ${ids.length} 个资源迁移至「${target.name}」`,
        errorMessage: '资源分类迁移失败',
        onSuccess: async () => {
          categoryMoveModalVisible.value = false
          categoryMoveRecord.value = null
          categoryMoveIds.value = []
          clearMediaSelection()
          await loadCategories()
          tableRef.value?.refresh()
        }
      }
    )
  } finally {
    categoryMoveSubmitting.value = false
  }
}

async function submitRename(nextName) {
  if (!renameRecord.value) return

  const value = String(nextName || '').trim()
  if (!value) {
    errorMessage.value = '请输入资源名称'
    return
  }

  renameSubmitting.value = true
  try {
    await runAction(() => renameAdminMedia(renameRecord.value.id, { originalName: value }), {
      successMessage: '资源名称已更新',
      errorMessage: '资源重命名失败',
      onSuccess: async () => {
        renameModalVisible.value = false
        renameRecord.value = null
        await loadCategories()
        tableRef.value?.refresh()
      }
    })
  } finally {
    renameSubmitting.value = false
  }
}

function handleBatchDelete() {
  const ids = [...selectedMediaKeys.value]
  if (!ids.length) return

  confirmMediaDelete(ids, {
    title: '批量移入回收站',
    getContent: (risk) => buildDeleteRiskContent(risk, `确认将选中的 ${ids.length} 个媒体资源移入回收站？数据库记录和服务器文件会保留，可在回收站恢复或彻底删除。`),
    okText: '批量移入回收站',
    okType: 'danger',
    async onOk() {
      await runAction(() => batchDeleteAdminMedia(ids), {
        successMessage: `已移入回收站 ${ids.length} 个媒体文件`,
        errorMessage: '批量删除失败',
        onSuccess: async () => {
          clearMediaSelection()
          await loadCategories()
          tableRef.value?.refresh()
        }
      })
    }
  }).catch(() => {})
}

async function confirmMediaDelete(ids, options) {
  let risk = null
  try {
    risk = await getAdminMediaDeleteRisk(ids)
  } catch {
    risk = null
  }

  return confirmAction({
    title: options.title,
    content: options.getContent?.(risk) || options.content,
    okText: options.okText,
    okType: options.okType,
    onOk: options.onOk
  })
}

function buildDeleteRiskContent(risk, fallback) {
  if (!risk || risk.referencedCount === 0) {
    return fallback
  }

  const samples = risk.items
    .filter((item) => item.referenceCount > 0)
    .slice(0, 3)
    .map((item) => `「${item.media.originalName}」${item.referenceCount} 处引用`)
    .join('；')

  return `${fallback}\n\n检测到 ${risk.referencedCount} 个资源仍被文章、用户头像或系统设置引用：${samples}。删除后相关页面可能出现图片或附件失效，请确认后再继续。`
}

function openReferenceModal(record) {
  referenceRecord.value = record
  referenceModalVisible.value = true
}

function openTrashModal() {
  trashModalVisible.value = true
}

function openMediaGuide(topic) {
  mediaGuideTopic.value = topic
  mediaGuideVisible.value = true
}

async function handleTrashChanged() {
  await loadCategories()
  tableRef.value?.refresh()
}

function resetCategoryDraft() {
  editingCategoryId.value = ''
  categoryDraft.value = {
    name: '',
    description: ''
  }
}

function canEditCategory(item) {
  return Boolean(item?.id) && !item.system
}

function editCategory(item) {
  if (!canEditCategory(item)) {
    errorMessage.value = '系统资源分类不支持编辑'
    return
  }

  editingCategoryId.value = item.id
  categoryDraft.value = {
    name: item.name,
    description: item.description || ''
  }
}

async function submitCategory() {
  if (!String(categoryDraft.value.name || '').trim()) {
    errorMessage.value = '请输入资源分类名称'
    return
  }

  categorySubmitting.value = true
  errorMessage.value = ''
  try {
    if (editingCategoryId.value) {
      await updateAdminMediaCategory(editingCategoryId.value, categoryDraft.value)
    } else {
      await createAdminMediaCategory(categoryDraft.value)
    }
    resetCategoryDraft()
    await loadCategories()
  } catch (error) {
    errorMessage.value = error.message || '分类保存失败'
  } finally {
    categorySubmitting.value = false
  }
}

function removeCategory(item) {
  confirmAction({
    title: '删除资源分类',
    content: `确认删除分类「${item.name}」？该分类下资源会自动归入默认素材。`,
    okText: '确认删除',
    okType: 'danger',
    async onOk() {
      await runAction(() => deleteAdminMediaCategory(item.id), {
        successMessage: '分类已删除',
        errorMessage: '分类删除失败',
        onSuccess: async () => {
          resetCategoryDraft()
          await loadCategories()
          tableRef.value?.refresh()
        }
      })
    }
  }).catch(() => {})
}

onMounted(async () => {
  try {
    await Promise.all([
      loadCategories(),
      loadUploadRules()
    ])
  } catch (error) {
    errorMessage.value = error.message || '媒体页初始化失败'
  }
})
</script>

<style scoped>
/* ===== 页面容器：表格是绝对主角 ===== */
.media-cloud {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: var(--console-page-available-height);
}

/* ===== 顶层命令：页面身份在左，全局命令在右 ===== */
.media-cloud__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 0 2px 8px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--console-border);
}

.media-cloud__identity {
  display: flex;
  align-items: center;
  min-width: 0;
}

.media-cloud__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--console-text);
  white-space: nowrap;
  line-height: 36px;
}

.media-cloud__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.media-cloud__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.media-cloud__header-icon {
  width: 32px;
  min-width: 32px;
  padding: 0;
}

/* ===== 查询状态带：读取顺序为搜索 -> 条件 -> 类型 -> 选中操作 ===== */
.media-cloud__list-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 8px 2px;
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}

.media-cloud__type-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding-left: 10px;
  border-left: 1px solid var(--console-border);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.media-cloud__type-filter::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.media-type-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 3px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  user-select: none;
}

.media-type-chip:hover {
  border-color: var(--console-border-strong);
  color: var(--console-text);
  background: var(--console-surface-hover);
}

.media-type-chip.is-active {
  border-color: color-mix(in srgb, var(--console-primary) 32%, var(--console-border));
  background: var(--console-primary-soft);
  color: var(--console-primary-strong);
  font-weight: 500;
}

.media-type-chip b {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.media-batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding-left: 12px;
  border-left: 1px solid var(--console-border);
  flex-shrink: 0;
}

.media-batch-actions__count {
  color: #64748b;
  font-size: 13px;
  text-align: right;
  white-space: nowrap;
}

/* ===== 表格主体：占据剩余全部空间 ===== */
.media-cloud__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* 关键：允许 flex 子元素收缩 */
  overflow: hidden; /* 强制裁剪，防止内容撑开 */
}

/* ===== 表格行：文件信息 ===== */
.media-file {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.media-file__thumb {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  background: var(--console-surface-muted);
  border: 1px solid var(--console-border);
  position: relative;
}

.media-file__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 5px;
}

.media-file__ext {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #64748b;
}

/* 文件类型缩略图色彩 */
.media-file__thumb.is-image {
  background: color-mix(in srgb, var(--console-primary) 10%, var(--console-surface-muted));
  border-color: color-mix(in srgb, var(--console-primary) 28%, var(--console-border));
}
.media-file__thumb.is-image .media-file__ext { color: var(--console-primary-strong); }

.media-file__thumb.is-code {
  background: color-mix(in srgb, #52c41a 10%, var(--console-surface-muted));
  border-color: color-mix(in srgb, #52c41a 30%, var(--console-border));
}
.media-file__thumb.is-code .media-file__ext { color: #389e0d; }

.media-file__thumb.is-document {
  background: color-mix(in srgb, #faad14 12%, var(--console-surface-muted));
  border-color: color-mix(in srgb, #faad14 30%, var(--console-border));
}
.media-file__thumb.is-document .media-file__ext { color: #d48806; }

.media-file__thumb.is-archive {
  background: color-mix(in srgb, #ff4d4f 10%, var(--console-surface-muted));
  border-color: color-mix(in srgb, #ff4d4f 28%, var(--console-border));
}
.media-file__thumb.is-archive .media-file__ext { color: #cf1322; }

.media-file__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.media-file__name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
}

.media-file__url {
  font-size: 12px !important;
  color: #94a3b8 !important;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

/* ===== 类型标签 ===== */
.media-type-tag {
  font-size: 12px !important;
  line-height: 1 !important;
  padding-inline: 8px !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
}

/* ===== 文件大小 ===== */
.media-size {
  font-size: 13px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ===== 分类标签 ===== */
.media-category-label {
  font-size: 13px;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 10px;
  border-radius: 6px;
  white-space: nowrap;
  display: inline-block;
}

.media-usage-link {
  height: auto !important;
  padding: 0 !important;
  white-space: nowrap;
}

.media-usage-link :deep(.ant-badge-status-text) {
  color: #475569;
  font-size: 12px;
}

/* ===== 时间 ===== */
.media-time {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ===== 操作按钮 ===== */
.media-action-btn {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  padding: 0 !important;
  font-size: 13px !important;
  border-radius: 6px !important;
  transition: all 0.15s ease !important;
}

.media-action-btn--view {
  color: #3b82f6 !important;
}

.media-action-btn--rename {
  color: #d48806 !important;
}

.media-action-btn--move {
  color: var(--console-primary-strong) !important;
}

.media-action-btn--refs {
  color: #0f766e !important;
}

.media-action-btn--view:hover {
  background: #eff6ff !important;
  color: #2563eb !important;
}

.media-action-btn--rename:hover {
  background: var(--console-primary-soft) !important;
  color: var(--console-primary-strong) !important;
}

.media-action-btn--move:hover {
  background: var(--console-primary-soft) !important;
  color: var(--console-primary-strong) !important;
}

.media-action-btn--refs:hover {
  color: #0d9488 !important;
  background: #ecfdf5 !important;
}

.media-action-btn--delete:hover {
  background: #fef2f2 !important;
}

/* ===== 表格区域深度样式覆盖 ===== */

.media-category-panel {
  height: min(58vh, 520px);
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(300px, 0.9fr) minmax(0, 1.1fr);
  overflow: hidden;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.media-category-panel__form {
  min-width: 0;
  overflow-y: auto;
  padding: 20px;
  background: var(--console-surface);
  scrollbar-width: none;
}

.media-category-panel__form::-webkit-scrollbar,
.media-category-panel__list-wrap::-webkit-scrollbar {
  display: none;
}

.media-category-panel__form-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
  margin-bottom: 18px;
}

.media-category-panel__form-header strong,
.media-category-panel__list-header strong {
  display: block;
  color: var(--console-text);
  font-size: 15px;
}

.media-category-panel__form-header span {
  display: block;
  margin-top: 4px;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.media-category-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.media-category-panel__list-wrap {
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--console-border);
  padding: 10px;
  background: var(--console-surface-muted);
  scrollbar-width: none;
}

.media-category-panel__list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 6px 12px;
}

.media-category-panel__list-header span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.media-category-panel__empty {
  text-align: center;
  color: var(--console-text-secondary);
  font-size: 13px;
  padding: 32px 0;
}

.media-category-panel__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.media-category-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 11px;
  border-radius: 8px;
  border: 1px solid var(--console-border);
  background: var(--console-surface);
  transition: all 0.15s ease;
}

.media-category-item:hover,
.media-category-item.is-active {
  border-color: var(--console-primary-strong);
  background: var(--console-surface-hover);
}

.media-category-item__info {
  display: grid;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.media-category-item__title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.media-category-item strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--console-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-category-item p,
.media-category-item span {
  margin: 0;
  font-size: 12px;
  color: var(--console-text-secondary);
  line-height: 1.5;
}

.media-category-item p {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.media-category-item__actions {
  flex: 0 0 auto;
}

.media-category-modal__title {
  display: flex;
  align-items: center;
  gap: 2px;
}

:deep(.dark-theme) .media-cloud__toolbar,
:deep(.dark-theme) .media-cloud__filters,
:deep(.dark-theme) .media-cloud__actions {
  color: var(--console-text-secondary);
}

:deep(.dark-theme) .media-cloud__list-toolbar {
  border-color: var(--console-border);
}

:deep(.dark-theme) .media-cloud__topbar,
:deep(.dark-theme) .media-cloud__type-filter,
:deep(.dark-theme) .media-batch-actions {
  border-color: var(--console-border);
}

:deep(.dark-theme) .media-batch-actions__count {
  color: var(--console-text-secondary);
}

:deep(.dark-theme) .media-type-chip {
  color: var(--console-menu-text);
  border-color: transparent;
  background: transparent;
}

:deep(.dark-theme) .media-type-chip:hover {
  color: var(--console-primary-strong);
  border-color: var(--console-primary-strong);
  background: var(--console-surface-hover);
}

:deep(.dark-theme) .media-type-chip.is-active {
  color: var(--console-primary-strong);
  border-color: var(--console-primary-strong);
  background: var(--console-primary-soft);
}

:deep(.dark-theme) .media-file__thumb,
:deep(.dark-theme) .media-category-label,
:deep(.dark-theme) .media-cloud__file-chip,
:deep(.dark-theme) .media-category-item {
  color: var(--console-menu-text);
  border-color: var(--console-border);
  background: var(--console-surface-muted);
}

:deep(.dark-theme) .media-category-item:hover {
  border-color: var(--console-border-strong);
  background: var(--console-surface-hover);
}

:deep(.dark-theme) .media-file__name,
:deep(.dark-theme) .media-cloud__title,
:deep(.dark-theme) .media-category-item strong {
  color: var(--console-text);
}

:deep(.dark-theme) .media-file__url,
:deep(.dark-theme) .media-size,
:deep(.dark-theme) .media-time,
:deep(.dark-theme) .media-usage-link :deep(.ant-badge-status-text),
:deep(.dark-theme) .media-category-item span,
:deep(.dark-theme) .media-category-panel__empty {
  color: var(--console-text-secondary) !important;
}

:deep(.dark-theme) .media-file__thumb.is-image,
:deep(.dark-theme) .media-file__thumb.is-code,
:deep(.dark-theme) .media-file__thumb.is-document,
:deep(.dark-theme) .media-file__thumb.is-archive {
  border-color: var(--console-border);
  background: color-mix(in srgb, var(--console-primary) 10%, var(--console-surface-muted));
}

:deep(.dark-theme) .media-action-btn--view:hover,
:deep(.dark-theme) .media-action-btn--delete:hover {
  background: var(--console-surface-hover) !important;
}

:deep(.dark-theme) .media-category-panel__form {
  border-bottom-color: var(--console-border);
}

/* ===== 响应式 ===== */
@media (max-width: 1280px) {
  .media-cloud__list-toolbar {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .media-cloud__type-filter {
    flex-basis: 100%;
    order: 3;
    padding-left: 0;
    border-left: 0;
  }
}

@media (max-width: 768px) {
  .media-cloud {
    height: auto;
    min-height: 0;
  }

  .media-cloud__topbar {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 10px;
  }

  .media-cloud__title {
    font-size: 16px;
  }

  .media-cloud__filters {
    flex-basis: 100%;
    flex-wrap: wrap;
  }

  .media-cloud__actions {
    margin-left: auto;
  }

  .media-cloud__body {
    overflow: visible;
  }

  .media-cloud__filters :deep(.ant-input-search),
  .media-cloud__filters :deep(.ant-select) {
    width: 100% !important;
  }

  .media-cloud__list-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .media-cloud__type-filter {
    flex-basis: auto;
    width: 100%;
    padding-top: 8px;
    border-top: 1px solid var(--console-border);
  }

  .media-batch-actions {
    width: 100%;
    margin-left: 0;
    padding-top: 8px;
    padding-left: 0;
    border-top: 1px solid var(--console-border);
    border-left: 0;
  }

  .media-type-chip {
    padding: 3px 10px;
    font-size: 12px;
  }

  .media-file {
    gap: 10px;
  }

  .media-file__thumb {
    width: 44px;
    height: 44px;
    border-radius: 8px;
  }

  .media-file__name {
    font-size: 13px;
  }

  .media-file__url {
    max-width: 140px;
    font-size: 11px !important;
  }

  .media-category-panel__list-wrap {
    max-height: 280px;
  }

  .media-category-panel {
    height: min(62vh, 640px);
    grid-template-rows: minmax(180px, 0.8fr) minmax(0, 1fr);
    grid-template-columns: 1fr;
  }

  .media-category-panel__list-wrap {
    border-right: 0;
    border-bottom: 1px solid var(--console-border);
  }

  .media-category-panel__form {
    padding: 16px;
  }

  .media-category-item {
    padding: 8px 10px;
  }
}

@media (max-width: 480px) {
  .media-cloud__title {
    font-size: 15px;
  }

  .media-cloud__actions {
    gap: 6px;
  }

  .media-cloud__header-icon {
    width: 28px;
    min-width: 28px;
  }

  .media-cloud__actions :deep(.ant-btn-primary) {
    padding-inline: 10px;
  }

  .media-type-chip {
    padding: 2px 8px;
    font-size: 11px;
  }

  .media-file {
    gap: 8px;
  }

  .media-file__thumb {
    width: 38px;
    height: 38px;
    border-radius: 6px;
  }

  .media-file__ext {
    font-size: 9px;
  }

  .media-file__name {
    font-size: 12px;
  }

  .media-file__url {
    max-width: 100px;
    font-size: 10px !important;
  }

  .media-category-item {
    flex-direction: column;
    gap: 6px;
    padding: 12px;
  }

  .media-category-panel__actions {
    flex-direction: column;
  }
}
</style>
