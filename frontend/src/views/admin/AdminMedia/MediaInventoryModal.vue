<template>
  <a-modal
    :open="open"
    width="960px"
    centered
    :footer="null"
    :body-style="{ maxHeight: '72vh', overflow: 'hidden' }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <template #title>
      <div class="media-inventory__modal-title">
        <span>扫描未登记资源</span>
        <a-tooltip title="查看扫描规则">
          <a-button type="text" size="small" aria-label="查看扫描未登记资源说明" @click="guideVisible = true">
            <template #icon><QuestionCircleOutlined /></template>
          </a-button>
        </a-tooltip>
      </div>
    </template>

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
        <span>可登记 {{ pageState.registerableCount }} 个</span>
        <span>受保护 {{ pageState.protectedCount }} 个</span>
        <span>合计 {{ formatFileSize(totalSize) }}</span>
        <span class="media-inventory__path">扫描范围：上传存储目录</span>
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

      <MediaInventoryList
        :items="items"
        :loading="loading"
        :selected-keys="selectedRowKeys"
        @selection-change="handleSelectionChange"
        @select-all="handleSelectAll"
        @open-detail="openDetail"
      />

      <a-pagination
        class="media-inventory__pagination"
        :current="pageState.current"
        :page-size="pageState.pageSize"
        :total="pageState.total"
        :show-total="(total) => `共 ${total} 个`"
        show-size-changer
        :page-size-options="['10', '20', '50', '100']"
        @change="handlePageChange"
      />

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
          <a-button type="primary" :disabled="pageState.registerableCount === 0" :loading="registering">
            登记当前全部
          </a-button>
        </a-popconfirm>
      </div>
    </div>

  </a-modal>

  <MediaInventoryDetailModal v-model:open="detailVisible" :record="detailRecord" />
  <MediaGuideModal v-model:open="guideVisible" topic="inventory" />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { clearSuspectedUntrackedAdminMedia, listUnregisteredAdminMedia, registerUntrackedAdminMedia } from '@/services/admin'
import MediaInventoryDetailModal from './MediaInventoryDetailModal.vue'
import MediaGuideModal from './MediaGuideModal.vue'
import MediaInventoryList from './MediaInventoryList.vue'

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
const detailVisible = ref(false)
const detailRecord = ref(null)
const guideVisible = ref(false)
const pageState = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  registerableCount: 0,
  protectedCount: 0
})

const suspectedCount = computed(() => items.value.filter((item) => item.suspectedTest).length)

const fileClassOptions = [
  { label: '图片', value: 'image' },
  { label: '代码', value: 'code' },
  { label: '文档', value: 'document' },
  { label: '压缩包', value: 'archive' },
  { label: '其他', value: 'other' }
]

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
    pageState.value.registerableCount = result.registerableCount || 0
    pageState.value.protectedCount = result.protectedCount || 0
    totalSize.value = result.totalSize || 0
  } catch (error) {
    message.error(error.message || '未登记资源扫描失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page, pageSize) {
  pageState.value.current = page || 1
  pageState.value.pageSize = pageSize || 20
  loadItems()
}

function handleSelectionChange({ id, checked }) {
  const nextKeys = new Set(selectedRowKeys.value)
  if (checked) {
    nextKeys.add(id)
  } else {
    nextKeys.delete(id)
  }
  selectedRowKeys.value = [...nextKeys]
}

function handleSelectAll(checked) {
  const selectableIds = items.value
    .filter((item) => item.source?.registerable !== false)
    .map((item) => item.id)
  const nextKeys = new Set(selectedRowKeys.value)
  selectableIds.forEach((id) => {
    if (checked) {
      nextKeys.add(id)
    } else {
      nextKeys.delete(id)
    }
  })
  selectedRowKeys.value = [...nextKeys]
}

function clearSelection() {
  selectedRowKeys.value = []
}

function openDetail(record) {
  detailRecord.value = record
  detailVisible.value = true
}

function getSelectedItems() {
  const selectedSet = new Set(selectedRowKeys.value)
  return items.value.filter((item) => (
    selectedSet.has(item.id) && item.source?.registerable !== false
  ))
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
    if (result.skippedCount > 0) {
      message.info(`另有 ${result.skippedCount} 个资源未登记，请查看业务专用目录或已登记提示`)
    }
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

</script>

<style scoped>
.media-inventory {
  display: grid;
  gap: 12px;
  max-height: min(62vh, 620px);
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: none;
}

.media-inventory::-webkit-scrollbar {
  display: none;
}

.media-inventory__modal-title {
  display: flex;
  align-items: center;
  gap: 2px;
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

.media-inventory__pagination {
  justify-self: end;
}
</style>
