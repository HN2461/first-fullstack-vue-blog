<template>
  <section class="media-browser">
    <a-alert v-if="error" type="error" :message="error" show-icon>
      <template #action><a-button size="small" @click="refresh">重试</a-button></template>
    </a-alert>
    <BlogTable
      v-if="layout === 'list'"
      :key="requestKey"
      ref="tableRef"
      :api-fn="loadTable"
      :columns="columns"
      :row-selection="rowSelection"
      :scroll="{ x: 1080 }"
      :page-size="16"
      :page-sizes="['16', '32', '64']"
      height="100%"
      show-column-setting
      @data-change="handleData"
    >
      <template #toolbar>
        <MediaBrowseToolbar
          v-bind="toolbarProps"
          @update:filters="setFilters"
          @update:layout="$emit('update:layout', $event)"
        />
      </template>
      <template #empty>
        <span v-if="loading">正在加载资源…</span>
        <a-empty v-else :description="emptyText">
          <a-button v-if="hasFilters" size="small" @click="resetFilters">清除筛选</a-button>
        </a-empty>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'asset'">
          <div class="media-browser__file">
            <img
              v-if="record.kind === 'image' && !masked(record)"
              :src="getMediaThumbnailUrl(record)"
              :alt="record.originalName"
              loading="lazy"
              @error="hideFailedThumbnail"
            />
            <LockOutlined v-else-if="masked(record)" />
            <FileOutlined v-else />
            <div>
              <a-button
                type="link"
                size="small"
                :disabled="masked(record)"
                :title="record.originalName"
                @click="$emit('detail', record)"
              >
                {{ masked(record) ? '密码箱文件' : record.originalName }}
              </a-button>
              <small>{{ masked(record) ? '解锁密码箱后查看' : formatMediaSize(record.size) }}</small>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'category'">{{ masked(record) ? '密码箱' : record.category }}</template>
        <template v-else-if="column.key === 'source'">
          <div class="media-browser__facts">
            <span>{{ masked(record) ? '密码保护' : sceneLabel(record.scene) }}</span>
            <small>{{ masked(record) ? '已隐藏' : lifecycleLabel(record.lifecycleStatus) }}</small>
          </div>
        </template>
        <template v-else-if="column.key === 'usage'">
          <a-button v-if="!masked(record)" type="link" size="small" @click="$emit('references', record)">
            {{ record.usage?.referenceCount ? `${record.usage.referenceCount} 处使用` : '暂未查到' }}
          </a-button>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'uploader'">
          {{ masked(record) ? '—' : record.uploader?.username || '—' }}
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ masked(record) ? '—' : formatDate(record.createdAt) }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-tag v-if="masked(record)" :bordered="false">已隐藏</a-tag>
          <MediaRowActions
            v-else
            :record="record"
            @view="$emit('view', record)"
            @download="$emit('download', record)"
            @rename="$emit('rename', record)"
            @move="$emit('move', record)"
            @references="$emit('references', record)"
            @delete="$emit('delete', record)"
          />
        </template>
      </template>
    </BlogTable>
    <template v-else>
      <MediaBrowseToolbar
        v-bind="toolbarProps"
        @update:filters="setFilters"
        @update:layout="$emit('update:layout', $event)"
      >
        <a-tooltip title="刷新资源">
          <a-button type="text" size="small" aria-label="刷新资源" :loading="loading" @click="refresh">
            <ReloadOutlined />
          </a-button>
        </a-tooltip>
      </MediaBrowseToolbar>
      <MediaFileGrid
        :items="items"
        :loading="loading"
        :total="total"
        :page="page"
        :page-size="pageSize"
        :selected-keys="selectedKeys"
        :vault-details-visible="vaultUnlocked"
        :empty-text="emptyText"
        @page-change="changePage"
        @selection-change="select"
        @view="$emit('view', $event)"
        @download="$emit('download', $event)"
        @rename="$emit('rename', $event)"
        @move="$emit('move', $event)"
        @references="$emit('references', $event)"
        @delete="$emit('delete', $event)"
        @reveal-vault="$emit('vault')"
      >
        <template #empty-action>
          <a-button v-if="hasFilters" size="small" @click="resetFilters">清除筛选</a-button>
        </template>
      </MediaFileGrid>
    </template>
    <div v-if="selectedRecords.length" class="media-browser__selection">
      <MediaBatchActions
        :count="selectedRecords.length"
        :can-manage-shares="canShare"
        :move-disabled="moveBlocked"
        :delete-disabled="deleteBlocked"
        @download="$emit('batch-download')"
        @move="$emit('batch-move')"
        @share="$emit('batch-share')"
        @delete="$emit('batch-delete')"
        @clear="clearSelection"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { FileOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import MediaBrowseToolbar from './MediaBrowseToolbar.vue'
import MediaFileGrid from './MediaFileGrid.vue'
import MediaRowActions from './MediaRowActions.vue'
import MediaBatchActions from './MediaBatchActions.vue'
import { useMediaBrowser } from './useMediaBrowser'
import {
  formatMediaSize,
  getMediaActionRestrictions,
  resourceLifecycleOptions,
  resourceSceneOptions
} from './mediaWorkspace'
import { getMediaThumbnailUrl, hideFailedThumbnail } from './mediaThumbnailUrl'

const props = defineProps({
  workspace: String,
  layout: String,
  categories: { type: Array, default: () => [] },
  initialFilters: { type: Object, default: () => ({}) },
  selectedRecords: { type: Array, default: () => [] },
  canShare: Boolean,
  vaultUnlocked: Boolean
})
const emit = defineEmits([
  'update:layout',
  'filters-change',
  'selection-change',
  'view',
  'detail',
  'references',
  'download',
  'rename',
  'move',
  'delete',
  'batch-download',
  'batch-move',
  'batch-share',
  'batch-delete',
  'vault'
])
const tableRef = ref(null)
const { filters, items, total, page, pageSize, loading, error, requestKey, loadTable, loadGrid } =
  useMediaBrowser(props)
const toolbarProps = computed(() => ({
  filters: filters.value,
  categories: props.categories,
  layout: props.layout,
  workspace: props.workspace
}))
const selectedKeys = computed(() => props.selectedRecords.map((item) => item.id))
const rowSelection = computed(() => ({
  fixed: true,
  preserveSelectedRowKeys: false,
  selectedRowKeys: selectedKeys.value,
  getCheckboxProps: (record) => ({ disabled: masked(record) }),
  onChange: select
}))
const moveBlocked = computed(() => props.selectedRecords.some((item) => getMediaActionRestrictions(item).moveReason))
const deleteBlocked = computed(() =>
  props.selectedRecords.some((item) => getMediaActionRestrictions(item).deleteReason)
)
const hasFilters = computed(() => Object.values(filters.value).some(Boolean))
const emptyText = computed(() =>
  error.value
    ? '加载失败，请重试'
    : hasFilters.value
      ? '没有匹配的资源，请调整筛选条件'
      : props.workspace === 'business'
        ? '还没有业务资源，上传并保存业务文件后会在这里显示'
        : '暂无资源，可通过右上角上传或到业务页面添加'
)
const columns = [
  { title: '文件', key: 'asset', width: 260, fixed: 'left' },
  { title: '分类', key: 'category', width: 130, ellipsis: true },
  { title: '来源 / 保留', key: 'source', width: 155 },
  { title: '使用位置', key: 'usage', width: 120 },
  { title: '上传人', key: 'uploader', width: 110, ellipsis: true },
  { title: '上传时间', key: 'createdAt', width: 165 },
  { title: '操作', key: 'actions', width: 92, fixed: 'right' }
]
function masked(record) {
  return record.accessScope === 'vault' && !props.vaultUnlocked
}
function sceneLabel(value) {
  return resourceSceneOptions.find((item) => item.value === value)?.label || '历史素材'
}
function lifecycleLabel(value) {
  return resourceLifecycleOptions.find((item) => item.value === value)?.label || '长期保留'
}
function formatDate(value) {
  return value
    ? new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'
}
function select(keys, rows) {
  emit(
    'selection-change',
    rows.filter((item) => !masked(item))
  )
}
function clearSelection() {
  emit('selection-change', [])
}
function setFilters(value) {
  clearSelection()
  filters.value = value
  page.value = 1
  emit('filters-change', value)
}
function resetFilters() {
  setFilters({ keyword: '', categoryId: '', fileClass: '', usageStatus: '', scene: '', lifecycleStatus: '' })
}
function handleData() {
  clearSelection()
}
function changePage(value) {
  page.value = value.page
  pageSize.value = value.pageSize
  clearSelection()
  loadGrid()
}
function refresh() {
  clearSelection()
  if (props.layout === 'list') return tableRef.value?.refresh()
  return loadGrid()
}
defineExpose({ refresh, clearSelection, filters })
</script>

<style scoped>
.media-browser {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  container-type: inline-size;
}
.media-browser > :deep(.blog-table) {
  flex: 1 1 0;
  min-height: 0;
}
.media-browser__file {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.media-browser__file > img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex: 0 0 36px;
  border-radius: 4px;
  background: var(--console-surface-muted);
}
.media-browser__file > div,
.media-browser__facts {
  display: grid;
  min-width: 0;
  gap: 2px;
}
.media-browser__file :deep(.ant-btn) {
  height: auto;
  text-align: left;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.media-browser small {
  color: var(--console-text-secondary);
  font-size: 12px;
}
.media-browser__selection {
  flex-shrink: 0;
  padding: 6px 0 0;
  border-top: 1px solid var(--console-border);
}
.media-browser :deep(.blog-table__toolbar) {
  padding: 8px;
}
.media-browser :deep(.ant-table-tbody > tr > td) {
  padding-top: 8px;
  padding-bottom: 8px;
}
@container (max-width: 650px) {
  .media-browser :deep(.media-batch-actions) {
    justify-content: flex-start;
    gap: 6px;
  }
}
@media (max-width: 900px) {
  .media-browser {
    overflow-y: auto;
  }
  .media-browser > :deep(.blog-table) {
    flex: 1 0 auto;
  }
}
</style>
