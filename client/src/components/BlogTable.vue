<!--
 * 通用数据表格组件
 * 基于 Ant Design Vue 的 a-table 封装，统一服务端分页
 *
 * 基本用法:
 * <BlogTable :api-fn="listAdminArticles" :columns="columns">
 *   <template #bodyCell="{ column, record }">...</template>
 * </BlogTable>
 *
 * 带筛选参数:
 * <BlogTable :api-fn="listAdminArticles" :columns="columns" :params="{ status: 'published' }" />
-->
<template>
  <div
    ref="rootRef"
    class="blog-table"
    :class="{ 'blog-table--stretch': isStretchLayout }"
    :style="rootStyle"
  >
    <!-- 工具栏 -->
    <div class="blog-table__toolbar" v-if="!bare && ($slots.toolbar || showColumnSetting)">
      <div class="blog-table__toolbar-left">
        <slot name="toolbar" />
      </div>
      <div class="blog-table__toolbar-right">
        <slot name="toolbarRight" />
        <!-- 刷新按钮 -->
        <a-tooltip title="刷新">
          <a-button class="blog-table__icon-btn" @click="refresh" :loading="loading">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <!-- 列设置 -->
        <a-popover
          v-if="showColumnSetting"
          placement="bottomRight"
          trigger="click"
          :overlay-style="{ width: '220px' }"
        >
          <template #content>
            <div class="blog-table__column-setting">
              <div class="blog-table__column-setting-header">
                <span>列显示设置</span>
                <a-button type="link" size="small" @click="resetColumns">重置</a-button>
              </div>
              <div class="blog-table__column-setting-list">
                <div
                  v-for="col in columnSettings"
                  :key="col.key"
                  class="blog-table__column-setting-item"
                >
                  <a-checkbox
                    :checked="!col.hidden"
                    @change="(e) => toggleColumn(col.key, e.target.checked)"
                  >
                    {{ col.title }}
                  </a-checkbox>
                </div>
              </div>
            </div>
          </template>
          <a-tooltip title="列设置">
            <a-button class="blog-table__icon-btn">
              <template #icon><SettingOutlined /></template>
            </a-button>
          </a-tooltip>
        </a-popover>
      </div>
    </div>

    <!-- 表格区域 -->
    <div
      class="blog-table__body"
      :class="{ 'blog-table__body--stretch': isStretchLayout }"
      :style="bodyStyle"
    >
      <a-table
        ref="tableRef"
        :row-key="rowKey"
        :columns="visibleColumns"
        :data-source="tableData"
        :loading="loading"
        :pagination="false"
        :scroll="effectiveScroll"
        :row-selection="effectiveRowSelection"
        v-bind="tableAttrs"
        @change="handleTableChange"
      >
        <!-- 透传所有插槽 -->
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData || {}" />
        </template>

        <!-- 空状态 -->
        <template #empty>
          <slot name="empty">
            <a-empty :description="emptyText" />
          </slot>
        </template>
      </a-table>
    </div>

    <!-- 分页栏 -->
    <div class="blog-table__pagination" v-if="!bare && !hidePagination && total > 0">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="currentPageSize"
        :total="total"
        :show-size-changer="showSizeChanger"
        :show-quick-jumper="showQuickJumper"
        :page-size-options="pageSizeOptions"
        :show-total="(t) => `共 ${t} 条`"
        size="small"
        @change="handlePageChange"
        @showSizeChange="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, useAttrs, nextTick } from 'vue'
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons-vue'
import tableConfig from '@/config/table'
import { normalizeTableResponse } from '@/utils/tableData'

const props = defineProps({
  // 数据请求函数，返回 { items, total, page, pageSize }
  apiFn: { type: Function, default: null },
  // 列定义（Ant Design Vue 格式）
  columns: { type: Array, required: true },
  // 额外请求参数（变更时自动重新加载）
  params: { type: Object, default: () => ({}) },
  // 行唯一标识
  rowKey: { type: String, default: 'id' },
  // 每页条数
  pageSize: { type: Number, default: tableConfig.pageSize },
  // 可选每页条数
  pageSizes: { type: Array, default: () => tableConfig.pageSizes },
  // 表格滚动区域 { x, y }
  scroll: { type: Object, default: undefined },
  // 行选择配置，true 使用默认，对象则透传
  rowSelection: { type: [Boolean, Object], default: false },
  // 挂载时自动加载数据
  autoLoad: { type: Boolean, default: true },
  // 隐藏分页
  hidePagination: { type: Boolean, default: false },
  // 是否显示列设置按钮
  showColumnSetting: { type: Boolean, default: false },
  // 表格高度，auto 时自适应
  height: { type: [String, Number], default: 'auto' },
  // 空状态文本
  emptyText: { type: String, default: tableConfig.emptyText },
  // 裸模式：不显示外层边框/背景/分页（适合嵌入 card 等容器）
  bare: { type: Boolean, default: false }
})

const emit = defineEmits(['data-change', 'selection-change'])

const attrs = useAttrs()
const rootRef = ref(null)
const tableRef = ref(null)
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const currentPageSize = ref(props.pageSize)
const selectedRowKeys = ref([])
const selectedRows = ref([])

// ──── 列设置 ────
const STORAGE_KEY = 'blog-table-columns'

function getStorageKey() {
  const path = window.location?.pathname || ''
  return `${STORAGE_KEY}:${path}`
}

const columnSettings = ref(
  props.columns.map((col) => ({
    key: col.key || col.dataIndex,
    title: col.title,
    hidden: false
  }))
)

function initColumnSettings() {
  try {
    const saved = localStorage.getItem(getStorageKey())
    if (saved) {
      const hiddenKeys = JSON.parse(saved)
      columnSettings.value = columnSettings.value.map((col) => ({
        ...col,
        hidden: hiddenKeys.includes(col.key)
      }))
    }
  } catch {
    // 忽略解析错误
  }
}

function toggleColumn(key, visible) {
  const col = columnSettings.value.find((c) => c.key === key)
  if (col) {
    col.hidden = !visible
    saveColumnSettings()
  }
}

function saveColumnSettings() {
  const hiddenKeys = columnSettings.value.filter((c) => c.hidden).map((c) => c.key)
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(hiddenKeys))
  } catch {
    // 忽略存储错误
  }
}

function resetColumns() {
  columnSettings.value = props.columns.map((col) => ({
    key: col.key || col.dataIndex,
    title: col.title,
    hidden: false
  }))
  saveColumnSettings()
}

const visibleColumns = computed(() => {
  const hiddenKeys = new Set(columnSettings.value.filter((c) => c.hidden).map((c) => c.key))
  return props.columns.filter((col) => {
    const key = col.key || col.dataIndex
    return !hiddenKeys.has(key)
  })
})

// ──── 数据加载 ────

async function loadData() {
  if (!props.apiFn) return

  loading.value = true
  try {
    const reqParams = {
      ...props.params,
      page: currentPage.value,
      pageSize: currentPageSize.value
    }

    const res = await props.apiFn(reqParams)
    const normalized = normalizeTableResponse(res)

    tableData.value = normalized.items
    total.value = normalized.total

    emit('data-change', { items: tableData.value, total: total.value, raw: normalized.raw })
  } catch (error) {
    tableData.value = []
    total.value = 0
    throw error
  } finally {
    loading.value = false
  }
}

// 外部调用：重载（替换参数，回到第 1 页）
function reload(newParams) {
  currentPage.value = 1
  if (newParams) {
    Object.assign(props.params, newParams)
  }
  return loadData()
}

// 外部调用：刷新当前页
function refresh() {
  return loadData()
}

// 外部调用：获取当前数据
function getData() {
  return tableData.value
}

// 外部调用：获取选中行
function getSelectedKeys() {
  return selectedRowKeys.value
}

function getSelectedRows() {
  return selectedRows.value
}

// 外部调用：清空选择
function clearSelection() {
  selectedRowKeys.value = []
  selectedRows.value = []
  emit('selection-change', [], [])
}

// ──── 事件处理 ────

function handleTableChange(pagination, filters, sorter) {
  attrs.onChange?.(pagination, filters, sorter)
}

function handlePageChange(page) {
  currentPage.value = page
  loadData()
}

function handleSizeChange(_page, size) {
  currentPageSize.value = size
  currentPage.value = 1
  loadData()
}

// 行选择处理
const effectiveRowSelection = computed(() => {
  if (!props.rowSelection) return undefined

  const base =
    typeof props.rowSelection === 'object' ? props.rowSelection : {}

  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys, rows) => {
      selectedRowKeys.value = keys
      selectedRows.value = rows
      emit('selection-change', keys, rows)
      base.onChange?.(keys, rows)
    },
    ...base
  }
})

// ──── 样式计算 ────

const autoScrollY = ref(0)

function calcScrollY() {
  if (!rootRef.value) return
  const rect = rootRef.value.getBoundingClientRect()
  const viewportH = window.innerHeight
  const topOffset = rect.top
  const bottomReserved = props.hidePagination ? 16 : 64
  autoScrollY.value = Math.max(viewportH - topOffset - bottomReserved, 200)
}

const effectiveScroll = computed(() => {
  const scroll = { ...props.scroll }

  if (!scroll.y && props.height === 'auto') {
    scroll.y = autoScrollY.value || undefined
  } else if (props.height && props.height !== 'auto') {
    scroll.y = typeof props.height === 'number' ? props.height : undefined
  }

  if (!scroll.x && !scroll.y) return undefined
  return scroll
})

const rootStyle = computed(() => {
  const style = {}
  if (props.height && props.height !== 'auto') {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  if (props.bare) {
    style.border = 'none'
    style.background = 'transparent'
    style.borderRadius = '0'
  }
  return style
})

const bodyStyle = computed(() => {
  const style = {}
  if (isStretchLayout.value) {
    style.flex = '1 1 0'
    style.minHeight = 0
    style.overflow = 'hidden'
  }
  if (props.bare) {
    style.borderRadius = '0'
  }
  return style
})

const isStretchLayout = computed(() => props.height && props.height !== 'auto')

const tableAttrs = computed(() => {
  // 过滤掉不应传递给 a-table 的属性
  const { class: _c, style: _s, params: _p, apiFn: _a, dataSource: _d, ...rest } = attrs
  return rest
})

// ──── 监听 ────

// params 变化时重新加载
watch(
  () => props.params,
  () => {
    currentPage.value = 1
    loadData()
  },
  { deep: true }
)

// 列定义变化时同步列设置
watch(
  () => props.columns,
  () => {
    columnSettings.value = props.columns.map((col) => ({
      key: col.key || col.dataIndex,
      title: col.title,
      hidden: false
    }))
    initColumnSettings()
  },
  { immediate: true }
)

// ──── 生命周期 ────

onMounted(() => {
  if (props.height === 'auto') {
    nextTick(calcScrollY)
    window.addEventListener('resize', calcScrollY)
  }

  if (props.autoLoad && props.apiFn) {
    loadData()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', calcScrollY)
})

defineExpose({
  reload,
  refresh,
  getData,
  getSelectedKeys,
  getSelectedRows,
  clearSelection,
  loadData
})
</script>

<style scoped>
.blog-table {
  display: block;
  background: var(--console-surface, #fff);
  border: 1px solid var(--console-border, #f0f0f0);
  border-radius: 8px;
  overflow: hidden;
}

.blog-table--stretch {
  display: flex;
  flex-direction: column;
}

/* 工具栏 */
.blog-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--console-border, #f0f0f0);
  gap: 12px;
  flex-wrap: wrap;
}

.blog-table__toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.blog-table__toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.blog-table__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--console-text-secondary, #8c8c8c);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.blog-table__icon-btn:hover {
  background: var(--console-surface-hover, #f5f5f5);
  color: var(--console-text, #333);
}

/* 表格主体 */
.blog-table__body {
  min-height: 1px;
}

.blog-table__body--stretch {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

.blog-table__body--stretch :deep(.ant-table-wrapper) {
  height: 100%;
}

.blog-table__body :deep(.ant-table-thead > tr > th) {
  color: var(--console-text-secondary, #8c8c8c);
  background: var(--console-surface-muted, #fafafa);
  font-weight: 650;
  font-size: 13px;
  padding: 10px 14px;
}

.blog-table__body :deep(.ant-table-tbody > tr > td) {
  padding: 10px 14px;
  vertical-align: middle;
  transition: background 0.2s ease;
}

.blog-table__body :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--console-surface-hover, #f5f7fa);
}

.blog-table__body :deep(.ant-table-pagination) {
  display: none !important;
}

/* 分页栏 */
.blog-table__pagination {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 16px;
  border-top: 1px solid var(--console-border, #f0f0f0);
  background: var(--console-surface, #fff);
}

/* 列设置面板 */
.blog-table__column-setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
  font-size: 13px;
}

.blog-table__column-setting-list {
  max-height: 300px;
  overflow-y: auto;
}

.blog-table__column-setting-item {
  padding: 4px 0;
}

.blog-table__column-setting-item :deep(.ant-checkbox-wrapper) {
  font-size: 13px;
}
</style>
