<template>
  <a-modal
    :open="open"
    title="扫描未登记资源"
    width="860px"
    centered
    :footer="null"
    :body-style="{ maxHeight: '72vh', overflowY: 'auto' }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <div class="media-inventory">
      <div class="media-inventory__toolbar">
        <a-input-search
          v-model:value="keyword"
          allow-clear
          placeholder="搜索路径或文件名"
          style="width: 240px"
          @search="reload"
        />
        <a-select
          v-model:value="fileClass"
          allow-clear
          show-search
          placeholder="类型"
          style="width: 132px"
          :options="fileClassOptions"
          option-filter-prop="label"
          @change="reload"
        />
        <a-checkbox v-model:checked="suspectOnly" @change="reload">
          只看疑似测试资源
        </a-checkbox>
        <a-button :loading="loading" @click="reload">
          <template #icon><ReloadOutlined /></template>
          重新扫描
        </a-button>
      </div>

      <div class="media-inventory__summary">
        <span>未登记 {{ pageState.total }} 个</span>
        <span>合计 {{ formatFileSize(totalSize) }}</span>
        <span class="media-inventory__path">{{ uploadRoot || '上传目录' }}</span>
      </div>

      <div v-if="selectedRowKeys.length > 0" class="media-inventory__batch">
        <span>已选择 {{ selectedRowKeys.length }} 个资源</span>
        <a-space>
          <a-button size="small" @click="clearSelection">取消选择</a-button>
          <a-button type="primary" size="small" :loading="registering" @click="registerSelected">
            登记选中
          </a-button>
        </a-space>
      </div>

      <a-table
        row-key="id"
        size="middle"
        :columns="columns"
        :data-source="items"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        :scroll="{ x: 780, y: 360 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'asset'">
            <div class="inventory-file">
              <div class="inventory-file__thumb" :class="`is-${record.fileClass || 'other'}`">
                <img v-if="record.kind === 'image'" :src="record.url" :alt="record.originalName" loading="lazy">
                <span v-else>{{ getFileBadge(record) }}</span>
              </div>
              <div class="inventory-file__info">
                <div class="inventory-file__name">
                  <strong :title="record.originalName">{{ record.originalName }}</strong>
                  <a-tag v-if="record.suspectedTest" :bordered="false" color="red">
                    疑似测试
                  </a-tag>
                </div>
                <span :title="record.relativePath">{{ record.relativePath }}</span>
                <em v-if="record.suspectedTestReason">{{ record.suspectedTestReason }}</em>
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

          <template v-else-if="column.key === 'mtime'">
            {{ formatDate(record.mtime) }}
          </template>
        </template>
      </a-table>

      <div class="media-inventory__footer">
        <a-button @click="emit('update:open', false)">关闭</a-button>
        <a-popconfirm
          title="将删除所有疑似测试且未登记的上传文件，此操作不可恢复。"
          ok-text="确认清空"
          cancel-text="取消"
          ok-type="danger"
          @confirm="clearSuspected"
        >
          <a-button danger :disabled="suspectedCount === 0" :loading="clearing">
            清空疑似测试资源
          </a-button>
        </a-popconfirm>
        <a-popconfirm
          title="将当前筛选下的全部未登记文件纳入媒体库？"
          ok-text="登记全部"
          cancel-text="取消"
          @confirm="registerAll"
        >
          <a-button type="primary" :disabled="pageState.total === 0" :loading="registering">
            登记当前全部
          </a-button>
        </a-popconfirm>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { clearSuspectedUntrackedAdminMedia, listUnregisteredAdminMedia, registerUntrackedAdminMedia } from '@/services/admin'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'changed'])

const loading = ref(false)
const registering = ref(false)
const clearing = ref(false)
const keyword = ref('')
const fileClass = ref(undefined)
const suspectOnly = ref(false)
const items = ref([])
const selectedRowKeys = ref([])
const totalSize = ref(0)
const uploadRoot = ref('')
const pageState = ref({
  current: 1,
  pageSize: 20,
  total: 0
})

const suspectedCount = computed(() => items.value.filter((item) => item.suspectedTest).length)

const fileClassOptions = [
  { label: '图片', value: 'image' },
  { label: '代码', value: 'code' },
  { label: '文档', value: 'document' },
  { label: '压缩包', value: 'archive' },
  { label: '其他', value: 'other' }
]

const columns = [
  { title: '文件', key: 'asset', width: 360, fixed: 'left' },
  { title: '类型', key: 'fileClass', width: 96, align: 'center' },
  { title: '大小', key: 'size', width: 96, align: 'right' },
  { title: '更新时间', key: 'mtime', width: 170, align: 'center' }
]

const pagination = computed(() => ({
  current: pageState.value.current,
  pageSize: pageState.value.pageSize,
  total: pageState.value.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total) => `共 ${total} 个`
}))

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  preserveSelectedRowKeys: true,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  }
}))

watch(
  () => props.open,
  (visible) => {
    if (visible) {
      reload()
    } else {
      clearSelection()
    }
  }
)

async function reload() {
  pageState.value.current = 1
  await loadItems()
}

async function loadItems() {
  loading.value = true
  try {
    const result = await listUnregisteredAdminMedia({
      page: pageState.value.current,
      pageSize: pageState.value.pageSize,
      keyword: keyword.value || undefined,
      fileClass: fileClass.value || undefined,
      suspectOnly: suspectOnly.value || undefined
    })
    items.value = result.items
    pageState.value.total = result.total
    totalSize.value = result.totalSize || 0
    uploadRoot.value = result.uploadRoot || ''
  } catch (error) {
    message.error(error.message || '未登记资源扫描失败')
  } finally {
    loading.value = false
  }
}

function handleTableChange(nextPagination) {
  pageState.value.current = nextPagination.current || 1
  pageState.value.pageSize = nextPagination.pageSize || 20
  loadItems()
}

function clearSelection() {
  selectedRowKeys.value = []
}

function getSelectedItems() {
  const selectedSet = new Set(selectedRowKeys.value)
  return items.value.filter((item) => selectedSet.has(item.id))
}

async function registerSelected() {
  const selectedItems = getSelectedItems()
  if (selectedItems.length === 0) {
    message.warning('请选择要登记的资源')
    return
  }

  await registerResources({
    mode: 'selected',
    items: selectedItems.map((item) => ({ relativePath: item.relativePath }))
  })
}

async function registerAll() {
  await registerResources({
    mode: 'all',
    keyword: keyword.value || undefined,
    fileClass: fileClass.value || undefined,
    suspectOnly: suspectOnly.value || undefined
  })
}

async function registerResources(payload) {
  registering.value = true
  try {
    const result = await registerUntrackedAdminMedia(payload)
    message.success(`已登记 ${result.createdCount} 个资源`)
    clearSelection()
    emit('changed')
    await loadItems()
  } catch (error) {
    message.error(error.message || '资源登记失败')
  } finally {
    registering.value = false
  }
}

async function clearSuspected() {
  clearing.value = true
  try {
    const result = await clearSuspectedUntrackedAdminMedia({
      keyword: keyword.value || undefined,
      fileClass: fileClass.value || undefined
    })
    message.success(`已清理 ${result.deletedCount} 个疑似测试资源`)
    clearSelection()
    emit('changed')
    await reload()
  } catch (error) {
    message.error(error.message || '疑似测试资源清理失败')
  } finally {
    clearing.value = false
  }
}

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  return `${size} B`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}

function getFileBadge(record) {
  return record.originalName?.split('.').at(-1)?.toUpperCase() || 'FILE'
}

function getFileClassLabel(value) {
  return fileClassOptions.find((item) => item.value === value)?.label || '其他'
}

function getFileClassColor(value) {
  const map = {
    image: 'blue',
    code: 'geekblue',
    document: 'green',
    archive: 'orange',
    other: 'default'
  }
  return map[value] || 'default'
}
</script>

<style scoped>
.media-inventory {
  display: grid;
  gap: 12px;
}

.media-inventory__toolbar,
.media-inventory__batch,
.media-inventory__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.media-inventory__toolbar {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.media-inventory__summary {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.media-inventory__path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.media-inventory__batch {
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.media-inventory__footer {
  justify-content: flex-end;
  padding-top: 2px;
}

.inventory-file {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.inventory-file__thumb {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
}

.inventory-file__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inventory-file__thumb.is-image {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #2563eb;
}

.inventory-file__thumb.is-code {
  border-color: #c7d2fe;
  background: #eef2ff;
  color: #4f46e5;
}

.inventory-file__thumb.is-document {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #16a34a;
}

.inventory-file__thumb.is-archive {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #ea580c;
}

.inventory-file__info {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.inventory-file__name,
.inventory-file__info strong,
.inventory-file__info span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inventory-file__name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.inventory-file__info strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
}

.inventory-file__info span,
.inventory-file__info em {
  color: var(--text-secondary);
  font-size: 12px;
}

.inventory-file__info em {
  font-style: normal;
  color: #dc2626;
}
</style>
