<template>
  <section class="media-cloud">
    <!-- 顶栏：标题 + 上传 + 筛选，一行搞定 -->
    <div class="media-cloud__topbar">
      <h2 class="media-cloud__title">媒体资产</h2>
      <div class="media-cloud__filters">
        <a-input-search
          v-model:value="keyword"
          allow-clear
          placeholder="搜索文件名或分类"
          style="width: 220px"
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
          placeholder="类型"
          style="width: 110px"
          size="middle"
          :options="fileClassOptions"
        />
      </div>
      <div class="media-cloud__actions">
        <a-button size="middle" @click="categoryModalVisible = true">管理分类</a-button>
        <a-button type="primary" size="middle" @click="uploadModalVisible = true">
          <template #icon><InboxOutlined /></template>
          上传资源
        </a-button>
      </div>
    </div>

    <!-- 类型快捷筛选条 -->
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
        height="auto"
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

          <!-- 上传时间 -->
          <template v-else-if="column.key === 'createdAt'">
            <span class="media-time">{{ formatDate(record.createdAt) }}</span>
          </template>

          <!-- 操作按钮 -->
          <template v-else-if="column.key === 'action'">
            <a-space :size="4">
              <a-tooltip title="预览">
                <a-button type="text" size="small" class="media-action-btn media-action-btn--view" @click="handleView(record)">
                  <template #icon><EyeOutlined /></template>
                  查看
                </a-button>
              </a-tooltip>
              <a-popconfirm
                title="确定删除该资源？"
                ok-text="删除"
                cancel-text="取消"
                ok-type="danger"
                @confirm="handleDelete(record)"
              >
                <a-button type="text" size="small" danger class="media-action-btn media-action-btn--delete">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </BlogTable>
    </div>

    <a-modal
      v-model:open="uploadModalVisible"
      title="上传资源"
      :confirm-loading="uploading"
      ok-text="上传到媒体库"
      cancel-text="取消"
      centered
      width="520px"
      @ok="uploadFile"
      @cancel="resetUploadDraft"
    >
      <a-alert v-if="errorMessage" class="media-cloud__alert" type="error" show-icon :message="errorMessage" />
      <a-form layout="vertical">
        <a-form-item label="资源分类">
          <a-select
            v-model:value="uploadCategory"
            show-search
            allow-clear
            placeholder="选择资源分类"
            :options="filterCategoryOptions"
            :filter-option="filterSelectOption"
          />
        </a-form-item>
        <a-form-item label="选择文件">
          <a-upload-dragger
            :before-upload="beforeUpload"
            :show-upload-list="false"
            accept="image/*,.pdf,.txt,.md,.zip,.rar,.7z,.json,.js,.ts,.vue,.java,.py,.sql,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv"
          >
            <p class="ant-upload-drag-icon"><InboxOutlined /></p>
            <p class="ant-upload-text">拖拽文件到这里，或点击选择本地资源</p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
      <div v-if="file" class="media-cloud__file-chip">
        <strong>{{ file.name }}</strong>
        <span>{{ Math.ceil((file.size || 0) / 1024) }} KB</span>
      </div>
    </a-modal>

    <!-- 媒体预览弹窗 -->
    <a-modal
      v-model:open="previewVisible"
      :title="previewRecord?.originalName || '预览'"
      :footer="null"
      :width="previewModalWidth"
      centered
      :destroy-on-close="true"
      @cancel="closePreview"
    >
      <div class="media-preview">
        <!-- 图片预览 -->
        <div v-if="previewType === 'image'" class="media-preview__image">
          <img :src="previewRecord.url" :alt="previewRecord.originalName" />
        </div>

        <!-- 视频预览 -->
        <div v-else-if="previewType === 'video'" class="media-preview__video">
          <video
            :src="previewRecord.url"
            controls
            preload="metadata"
            class="media-preview__player"
          >您的浏览器不支持视频播放</video>
        </div>

        <!-- 音频预览 -->
        <div v-else-if="previewType === 'audio'" class="media-preview__audio">
          <div class="media-preview__audio-icon">
            <CustomerServiceOutlined style="font-size: 48px; color: #8b5cf6" />
          </div>
          <h3>{{ previewRecord.originalName }}</h3>
          <audio :src="previewRecord.url" controls preload="metadata" class="media-preview__player">
            您的浏览器不支持音频播放
          </audio>
        </div>

        <!-- PDF 预览 -->
        <div v-else-if="previewType === 'pdf'" class="media-preview__pdf">
          <iframe :src="previewRecord.url" class="media-preview__iframe" />
        </div>

        <!-- Office 文档预览（doc/docx/xls/xlsx/ppt/pptx/csv） -->
        <div v-else-if="previewType === 'office'" class="media-preview__office">
          <!-- Office Viewer 加载失败时降级到下载卡片 -->
          <template v-if="!officeLoadError">
            <iframe :src="officeViewerUrl" class="media-preview__iframe" @error="onOfficeViewerError" />
          </template>
          <div v-else class="media-preview__fallback">
            <div class="media-preview__file-card">
              <FileWordOutlined style="font-size: 48px; color: #2563eb" />
              <h3>{{ previewRecord?.originalName }}</h3>
              <p>在线预览暂不可用（可能文件不在公网可访问地址）</p>
              <div class="media-preview__file-meta">
                <span>类型：{{ previewRecord?.mimeType || '未知' }}</span>
                <span>大小：{{ formatFileSize(previewRecord?.size) }}</span>
              </div>
              <a-space :size="8">
                <a-button type="primary" :href="previewRecord?.url" download target="_blank">
                  <template #icon><DownloadOutlined /></template>
                  下载文件
                </a-button>
                <a-button @click="retryOfficeViewer" :loading="officeRetrying">
                  重试预览
                </a-button>
              </a-space>
            </div>
          </div>
        </div>

        <!-- 文本/代码预览 -->
        <div v-else-if="previewType === 'text'" class="media-preview__text">
          <a-spin :spinning="textLoading" tip="加载内容中…">
            <pre class="media-preview__code"><code>{{ textContent }}</code></pre>
          </a-spin>
        </div>

        <!-- 不可预览类型：文件信息卡片 -->
        <div v-else class="media-preview__fallback">
          <div class="media-preview__file-card">
            <div class="media-preview__file-icon">
              <FileZipOutlined v-if="previewRecord?.fileClass === 'archive'" style="font-size: 48px; color: #f97316" />
              <FileUnknownOutlined v-else style="font-size: 48px; color: #94a3b8" />
            </div>
            <h3>{{ previewRecord?.originalName }}</h3>
            <p>此文件类型暂不支持在线预览</p>
            <div class="media-preview__file-meta">
              <span>类型：{{ previewRecord?.mimeType || '未知' }}</span>
              <span>大小：{{ formatFileSize(previewRecord?.size) }}</span>
            </div>
            <a-button type="primary" :href="previewRecord?.url" download target="_blank">
              <template #icon><DownloadOutlined /></template>
              下载文件
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:open="categoryModalVisible"
      title="资源分类"
      :footer="null"
      width="560px"
      centered
    >
      <div class="media-category-panel">
        <!-- 固定表单区 -->
        <div class="media-category-panel__form">
          <a-form layout="vertical">
            <a-form-item label="分类名称">
              <a-input v-model:value="categoryDraft.name" placeholder="例如 项目截图 / 课程资料 / 接口示例" />
            </a-form-item>
            <a-form-item label="分类描述">
              <a-textarea v-model:value="categoryDraft.description" :rows="2" placeholder="可选，说明这个分类存放什么资源" />
            </a-form-item>
            <div class="media-category-panel__actions">
              <a-button v-if="editingCategoryId" @click="resetCategoryDraft">取消编辑</a-button>
              <a-button type="primary" :loading="categorySubmitting" @click="submitCategory">
                {{ editingCategoryId ? '保存分类' : '新建分类' }}
              </a-button>
            </div>
          </a-form>
        </div>

        <!-- 可滚动列表区 -->
        <div class="media-category-panel__list-wrap">
          <div v-if="categories.length === 0" class="media-category-panel__empty">暂无自定义分类</div>
          <div v-else class="media-category-panel__list">
            <div
              v-for="item in categories"
              :key="item.id"
              class="media-category-item"
            >
              <div class="media-category-item__info">
                <strong>{{ item.name }}</strong>
                <span>{{ item.count || 0 }} 个资源</span>
              </div>
              <a-space size="small">
                <a-tooltip :title="isSystemCategory(item.name) ? '系统分类不支持编辑' : ''">
                  <a-button
                    type="link"
                    size="small"
                    :disabled="isSystemCategory(item.name)"
                    @click="editCategory(item)"
                  >编辑</a-button>
                </a-tooltip>
                <a-tooltip :title="isSystemCategory(item.name) ? '系统分类不能删除' : ''">
                  <a-button
                    type="link"
                    size="small"
                    danger
                    :disabled="isSystemCategory(item.name)"
                    @click="removeCategory(item)"
                  >删除</a-button>
                </a-tooltip>
              </a-space>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  InboxOutlined,
  EyeOutlined,
  DeleteOutlined,
  CustomerServiceOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  FileWordOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  createAdminMediaCategory,
  deleteAdminMedia,
  deleteAdminMediaCategory,
  listAdminMedia,
  listAdminMediaCategories,
  updateAdminMediaCategory,
  uploadAdminMedia
} from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const tableRef = ref(null)
const file = ref(null)
const errorMessage = ref('')
const uploading = ref(false)
const uploadCategory = ref('默认素材')
const categories = ref([])
const keyword = ref('')
const filterCategory = ref(undefined)
const filterFileClass = ref(undefined)
const uploadModalVisible = ref(false)
const categoryModalVisible = ref(false)
const categorySubmitting = ref(false)
const editingCategoryId = ref('')
const actionLoadingKey = ref('')
const categoryDraft = ref({
  name: '',
  description: ''
})
const { runAction, confirmAction } = useAdminActions()

const fileClassOptions = [
  { label: '图片', value: 'image' },
  { label: '代码', value: 'code' },
  { label: '文档', value: 'document' },
  { label: '压缩包', value: 'archive' },
  { label: '其他', value: 'other' }
]

const categoryOptions = computed(() => {
  const baseOptions = categories.value.map((item) => ({
    label: `${item.name}${item.count ? ` (${item.count})` : ''}`,
    value: item.name
  }))

  if (!baseOptions.find((item) => item.value === '默认素材')) {
    baseOptions.unshift({ label: '默认素材', value: '默认素材' })
  }

  return baseOptions
})

const filterCategoryOptions = computed(() => categories.value.map((item) => ({
  label: `${item.name}${item.count ? ` (${item.count})` : ''}`,
  value: item.name
})))

const tableParams = computed(() => ({
  keyword: keyword.value || undefined,
  category: filterCategory.value || undefined,
  fileClass: filterFileClass.value || undefined
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
  { title: '上传时间', key: 'createdAt', width: 170, align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center', fixed: 'right' }
]

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

function beforeUpload(nextFile) {
  file.value = nextFile
  return false
}

function resetUploadDraft() {
  file.value = null
  errorMessage.value = ''
}

function refreshTable() {
  tableRef.value?.refresh()
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
  const statsSource = await listAdminMedia({ page: 1, pageSize: 200, keyword: keyword.value || undefined, category: filterCategory.value || undefined })
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

async function uploadFile() {
  if (!file.value) {
    errorMessage.value = '请选择要上传的资源文件'
    return
  }
  errorMessage.value = ''
  uploading.value = true
  try {
    await runAction(() => uploadAdminMedia(file.value, { category: uploadCategory.value || '默认素材' }), {
      successMessage: '上传成功',
      errorMessage: '上传失败'
    })
    resetUploadDraft()
    uploadModalVisible.value = false
    await loadCategories()
    tableRef.value?.refresh()
  } catch (error) {
    errorMessage.value = error.message || '上传失败'
  } finally {
    uploading.value = false
  }
}

const previewVisible = ref(false)
const previewRecord = ref(null)
const textContent = ref('')
const textLoading = ref(false)
const officeLoadError = ref(false)
const officeRetrying = ref(false)

/**
 * 判断预览类型：image / video / audio / pdf / text / other
 */
function getPreviewType(record) {
  const mime = (record.mimeType || '').toLowerCase()
  const ext = (record.originalName || '').split('.').pop().toLowerCase()

  if (mime.startsWith('image/') || record.fileClass === 'image') return 'image'
  if (mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) return 'audio'
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'

  const officeExtensions = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'])
  if (officeExtensions.has(ext)) return 'office'

  const textExtensions = new Set([
    'js', 'jsx', 'ts', 'tsx', 'vue', 'json', 'yml', 'yaml', 'xml',
    'html', 'css', 'scss', 'less', 'md', 'txt', 'sh', 'bat', 'ps1',
    'py', 'java', 'go', 'rb', 'php', 'sql', 'c', 'cpp', 'h', 'cs',
    'kt', 'swift', 'rs', 'ini', 'conf', 'env', 'gitignore', 'editorconfig'
  ])
  if (mime.startsWith('text/') || textExtensions.has(ext)) return 'text'

  return 'other'
}

const previewType = computed(() => previewRecord.value ? getPreviewType(previewRecord.value) : 'other')

const previewModalWidth = computed(() => {
  if (previewType.value === 'video') return '800px'
  if (previewType.value === 'pdf' || previewType.value === 'office') return '900px'
  if (previewType.value === 'image') return '800px'
  return '640px'
})

const officeViewerUrl = computed(() => {
  if (!previewRecord.value?.url) return ''
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + previewRecord.value.url)}`
})

async function handleView(record) {
  previewRecord.value = record
  previewVisible.value = true
  officeLoadError.value = false

  if (getPreviewType(record) === 'text') {
    textContent.value = ''
    textLoading.value = true
    try {
      const response = await fetch(record.url)
      if (response.ok) {
        textContent.value = await response.text()
      } else {
        textContent.value = `无法加载文件内容（HTTP ${response.status}）`
      }
    } catch {
      textContent.value = '加载文件内容失败，请尝试下载后查看'
    } finally {
      textLoading.value = false
    }
  }
}

function closePreview() {
  previewVisible.value = false
  textContent.value = ''
  officeLoadError.value = false
}

function onOfficeViewerError() {
  officeLoadError.value = true
}

function retryOfficeViewer() {
  officeRetrying.value = true
  officeLoadError.value = false
  setTimeout(() => {
    officeRetrying.value = false
  }, 2000)
}

function handleDelete(record) {
  confirmAction({
    title: '确定删除此文件？',
    content: `文件「${record.originalName}」删除后将无法继续在文章或公告中引用。`,
    okText: '确认删除',
    okType: 'danger',
    async onOk() {
      actionLoadingKey.value = `delete:${record.id}`
      try {
        await runAction(() => deleteAdminMedia(record.id), {
          successMessage: '文件已删除',
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

function resetCategoryDraft() {
  editingCategoryId.value = ''
  categoryDraft.value = {
    name: '',
    description: ''
  }
}

function isSystemCategory(name) {
  return ['默认素材', '文章封面'].includes(name)
}

function editCategory(item) {
  if (isSystemCategory(item.name)) {
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

onMounted(loadCategories)
</script>

<style scoped>
/* ===== 页面容器：表格是绝对主角 ===== */
.media-cloud {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - 72px); /* 让表格撑满屏幕 */
}

/* ===== 顶栏：一行搞定，不抢戏 ===== */
.media-cloud__topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 4px 4px;
  flex-shrink: 0;
}

.media-cloud__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  line-height: 32px;
}

.media-cloud__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.media-cloud__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* ===== 类型快捷筛选条：极简 chip 风格 ===== */
.media-cloud__type-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 4px;
  flex-shrink: 0;
  overflow-x: auto;
}

.media-type-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #ffffff;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  user-select: none;
}

.media-type-chip:hover {
  border-color: #94a3b8;
  color: #334155;
  background: #f8fafc;
}

.media-type-chip.is-active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.media-type-chip b {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ===== 表格主体：占据剩余全部空间 ===== */
.media-cloud__body {
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
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  position: relative;
}

.media-file__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 9px;
}

.media-file__ext {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #64748b;
}

/* 文件类型缩略图色彩 */
.media-file__thumb.is-image {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #bfdbfe;
}
.media-file__thumb.is-image .media-file__ext { color: #2563eb; }

.media-file__thumb.is-code {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #bbf7d0;
}
.media-file__thumb.is-code .media-file__ext { color: #16a34a; }

.media-file__thumb.is-document {
  background: linear-gradient(135deg, #fefce8, #fef9c3);
  border-color: #fde68a;
}
.media-file__thumb.is-document .media-file__ext { color: #ca8a04; }

.media-file__thumb.is-archive {
  background: linear-gradient(135deg, #fff1f2, #ffe4e6);
  border-color: #fecdd3;
}
.media-file__thumb.is-archive .media-file__ext { color: #e11d48; }

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

/* ===== 时间 ===== */
.media-time {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ===== 操作按钮 ===== */
.media-action-btn {
  font-size: 13px !important;
  border-radius: 6px !important;
  transition: all 0.15s ease !important;
}

.media-action-btn--view {
  color: #3b82f6 !important;
}

.media-action-btn--view:hover {
  background: #eff6ff !important;
  color: #2563eb !important;
}

.media-action-btn--delete:hover {
  background: #fef2f2 !important;
}

/* ===== 表格区域深度样式覆盖 ===== */

.media-category-panel {
  display: flex;
  flex-direction: column;
}

.media-category-panel__form {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.media-category-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

/* 列表区域：固定最大高度，内部滚动 */
.media-category-panel__list-wrap {
  max-height: 360px;
  overflow-y: auto;
  overflow-x: hidden;
}

.media-category-panel__empty {
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  padding: 32px 0;
}

.media-category-panel__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 精简的分类条目：紧凑行式 */
.media-category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: #f8fafc;
  transition: all 0.15s ease;
}

.media-category-item:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.media-category-item__info {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.media-category-item strong {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-category-item span {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ===== 媒体预览弹窗 ===== */
.media-preview {
  min-height: 200px;
}

.media-preview__image {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 70vh;
  overflow: auto;
}

.media-preview__image img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  object-fit: contain;
}

.media-preview__video {
  display: flex;
  justify-content: center;
  align-items: center;
}

.media-preview__player {
  width: 100%;
  border-radius: 8px;
  outline: none;
}

.media-preview__audio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 20px;
}

.media-preview__audio h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  word-break: break-all;
  text-align: center;
}

.media-preview__audio-icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-preview__pdf,
.media-preview__office {
  height: 75vh;
}

.media-preview__iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}

.media-preview__text {
  max-height: 70vh;
  overflow: auto;
}

.media-preview__code {
  background: #1e293b;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  min-height: 200px;
  max-height: 70vh;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

.media-preview__fallback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}

.media-preview__file-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  text-align: center;
}

.media-preview__file-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  word-break: break-all;
}

.media-preview__file-card p {
  margin: 0;
  font-size: 14px;
  color: #94a3b8;
}

.media-preview__file-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
}

.media-preview__file-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .media-cloud {
    height: calc(100vh - 64px);
  }

  .media-cloud__topbar {
    flex-wrap: wrap;
    gap: 10px;
  }

  .media-cloud__title {
    font-size: 16px;
  }

  .media-cloud__filters {
    order: 3;
    flex-basis: 100%;
    flex-wrap: wrap;
  }

  .media-cloud__filters :deep(.ant-input-search),
  .media-cloud__filters :deep(.ant-select) {
    width: 100% !important;
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
