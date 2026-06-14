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
        :bare="true"
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
              <a-tooltip title="在新窗口查看">
                <a-button type="text" size="small" class="media-action-btn media-action-btn--view" @click="window.open(record.url, '_blank', 'noopener')">
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

    <a-modal
      v-model:open="categoryModalVisible"
      title="资源分类"
      :footer="null"
      width="720px"
      centered
    >
      <div class="media-category-panel">
        <div class="media-category-panel__form">
          <a-form layout="vertical">
            <a-form-item label="分类名称">
              <a-input v-model:value="categoryDraft.name" placeholder="例如 项目截图 / 课程资料 / 接口示例" />
            </a-form-item>
            <a-form-item label="分类描述">
              <a-textarea v-model:value="categoryDraft.description" :rows="3" placeholder="可选，说明这个分类存放什么资源" />
            </a-form-item>
            <div class="media-category-panel__actions">
              <a-button v-if="editingCategoryId" @click="resetCategoryDraft">取消编辑</a-button>
              <a-button type="primary" :loading="categorySubmitting" @click="submitCategory">
                {{ editingCategoryId ? '保存分类' : '新建分类' }}
              </a-button>
            </div>
          </a-form>
        </div>

        <div class="media-category-panel__list">
          <div
            v-for="item in categories"
            :key="item.id"
            class="media-category-item"
          >
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ item.description || '暂无分类描述' }}</p>
              <span>{{ item.count || 0 }} 个资源</span>
            </div>
            <a-space size="small">
              <a-button type="link" size="small" @click="editCategory(item)">编辑</a-button>
              <a-button
                type="link"
                size="small"
                danger
                :disabled="['默认素材', '文章封面'].includes(item.name)"
                @click="removeCategory(item)"
              >
                删除
              </a-button>
            </a-space>
          </div>
        </div>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { InboxOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue'
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

function editCategory(item) {
  if (['默认素材', '文章封面'].includes(item.name)) {
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
  overflow: hidden;
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
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
}

.media-category-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}

.media-category-panel__list {
  display: grid;
  gap: 16px;
}

.media-category-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 1px 3px 0 rgb(16 24 40 / 0.1);
  transition: all 0.2s ease;
}

.media-category-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgb(16 24 40 / 0.1);
  transform: translateY(-1px);
}

.media-category-item strong {
  display: block;
  margin-bottom: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.media-category-item p {
  margin: 0 0 6px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.media-category-item span {
  font-size: 13px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
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

  .media-category-panel {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .media-category-item {
    padding: 14px 16px;
    gap: 12px;
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
