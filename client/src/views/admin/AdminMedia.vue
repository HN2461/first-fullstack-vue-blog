<template>
  <section class="media-cloud">
    <div class="media-cloud__panel">
      <div class="media-cloud__upload">
        <div class="media-cloud__upload-head">
          <h2>上传资源</h2>
          <a-button type="primary" ghost @click="uploadModalVisible = true">上传资源</a-button>
        </div>
        <div class="media-cloud__rules">
          <span>支持格式：图片、代码、文档、压缩包等常见资源</span>
          <span>单文件上限：5MB</span>
        </div>
      </div>

      <div class="media-cloud__library">
        <div class="media-cloud__toolbar">
          <a-input-search
            v-model:value="keyword"
            allow-clear
            placeholder="搜索文件名或分类"
            style="width: 280px"
            @search="refreshTable"
          />
          <a-select
            v-model:value="filterCategory"
            allow-clear
            show-search
            placeholder="分类筛选"
            style="width: 180px"
            :options="filterCategoryOptions"
            :filter-option="filterSelectOption"
          />
          <a-select
            v-model:value="filterFileClass"
            allow-clear
            placeholder="资源类型"
            style="width: 160px"
            :options="fileClassOptions"
          />
          <a-button @click="categoryModalVisible = true">管理分类</a-button>
        </div>

        <div class="media-cloud__summary">
          <div
            v-for="item in summaryCards"
            :key="item.key"
            class="media-cloud__summary-card"
            :class="{ 'is-active': filterFileClass === item.value }"
            @click="toggleFileClassFilter(item.value)"
          >
            <strong>{{ item.label }}</strong>
            <span>{{ item.count }}</span>
          </div>
        </div>

        <BlogTable
          ref="tableRef"
          :api-fn="loadMedia"
          :columns="columns"
          :params="tableParams"
          :auto-load="true"
          :page-size="12"
          :page-sizes="['12', '24', '48']"
          :bare="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'asset'">
              <div class="media-item">
                <div class="media-item__thumb" :class="`is-${record.fileClass || 'other'}`">
                  <img v-if="record.kind === 'image'" :src="record.url" :alt="record.originalName">
                  <span v-else>{{ getFileBadge(record) }}</span>
                </div>
                <div class="media-item__meta">
                  <strong>{{ record.originalName }}</strong>
                  <span>{{ record.category || '未分类' }}</span>
                </div>
              </div>
            </template>

            <template v-else-if="column.key === 'fileClass'">
              <a-tag :bordered="false" :color="getFileClassColor(record.fileClass)">
                {{ getFileClassLabel(record.fileClass) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'size'">
              {{ formatFileSize(record.size) }}
            </template>

            <template v-else-if="column.key === 'url'">
              <a-typography-text copyable>{{ record.url }}</a-typography-text>
            </template>

            <template v-else-if="column.key === 'createdAt'">
              {{ formatDate(record.createdAt) }}
            </template>

            <template v-else-if="column.key === 'action'">
              <a-space size="small">
                <a-button type="link" size="small" @click="window.open(record.url, '_blank', 'noopener')">
                  查看
                </a-button>
                <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </template>
        </BlogTable>
      </div>
    </div>

    <a-modal
      v-model:open="uploadModalVisible"
      title="上传资源"
      :confirm-loading="uploading"
      ok-text="上传到媒体库"
      cancel-text="取消"
      centered
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
import { InboxOutlined } from '@ant-design/icons-vue'
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
  { title: '资源', key: 'asset', width: '34%' },
  { title: '类型', key: 'fileClass', width: 110 },
  { title: '大小', key: 'size', width: 110 },
  { title: '访问地址', key: 'url' },
  { title: '上传时间', key: 'createdAt', width: 168 },
  { title: '操作', key: 'action', width: 120 }
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
.media-cloud {
  display: grid;
}

.media-cloud__panel {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
}

.media-cloud__upload,
.media-cloud__library {
  border: 1px solid #eef1f5;
  border-radius: 12px;
  background: #ffffff;
}

.media-cloud__upload {
  padding: 18px;
}

.media-cloud__upload-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.media-cloud__upload-head h2 {
  margin: 0;
  font-size: 18px;
  color: #1f1f1f;
}

.media-cloud__alert {
  margin-bottom: 16px;
}

.media-cloud__rules {
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: #667085;
}

.media-cloud__file-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f6f8fb;
}

.media-cloud__file-chip strong {
  font-size: 13px;
  color: #1f1f1f;
}

.media-cloud__file-chip span {
  font-size: 12px;
  color: #8c8c8c;
}

.media-cloud__upload-button {
  margin-top: 16px;
}

.media-cloud__library {
  padding: 18px;
}

.media-cloud__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}

.media-cloud__summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.media-cloud__summary-card {
  padding: 14px 16px;
  border: 1px solid #eef1f5;
  border-radius: 12px;
  background: #fafcff;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.media-cloud__summary-card:hover,
.media-cloud__summary-card.is-active {
  border-color: #1677ff;
  background: #f0f6ff;
  transform: translateY(-1px);
}

.media-cloud__summary-card strong,
.media-cloud__summary-card span {
  display: block;
}

.media-cloud__summary-card strong {
  margin-bottom: 6px;
  font-size: 13px;
  color: #1f1f1f;
}

.media-cloud__summary-card span {
  font-size: 20px;
  font-weight: 600;
  color: #1677ff;
}

.media-item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.media-item__thumb {
  width: 64px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;
  background: #f6f8fb;
  color: #1677ff;
  font-size: 12px;
  font-weight: 700;
}

.media-item__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-item__thumb.is-code {
  background: #eef4ff;
}

.media-item__thumb.is-document {
  background: #edf9f1;
  color: #389e0d;
}

.media-item__thumb.is-archive {
  background: #fff7e8;
  color: #d46b08;
}

.media-item__meta {
  min-width: 0;
}

.media-item__meta strong,
.media-item__meta span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-item__meta strong {
  margin-bottom: 4px;
  font-size: 14px;
  color: #1f1f1f;
}

.media-item__meta span {
  font-size: 12px;
  color: #8c8c8c;
}

.media-category-panel {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 20px;
}

.media-category-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.media-category-panel__list {
  display: grid;
  gap: 12px;
}

.media-category-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #eef1f5;
  border-radius: 12px;
  background: #fafcff;
}

.media-category-item strong {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: #1f1f1f;
}

.media-category-item p {
  margin: 0 0 4px;
  font-size: 12px;
  color: #667085;
}

.media-category-item span {
  font-size: 12px;
  color: #98a2b3;
}

@media (max-width: 1180px) {
  .media-cloud__panel {
    grid-template-columns: 1fr;
  }

  .media-cloud__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .media-category-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .media-cloud__summary {
    grid-template-columns: 1fr;
  }
}
</style>
