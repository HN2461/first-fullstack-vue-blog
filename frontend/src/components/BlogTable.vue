<!--
 * 通用数据表格组件
 * 基于 Ant Design Vue 的 a-table 封装，统一服务端分页、滚动和列设置。
 *
 * 推荐结构：
 * 1. 默认 auto 模式会撑满页面剩余可视高度，分页栏贴合表格底部；
 * 2. 表格容器固定高度，超量数据只在表格主体内部滚动，页面外层不随行数拉伸；
 * 3. columns 使用 Ant Design Vue 的列配置，宽表建议设置 scroll="{ x: 1000 }" 或给列设置 width；
 * 4. toolbar 插槽放搜索、筛选、新增等页面级操作；底部会统一放分页、刷新和列设置；
 * 5. 通过 ref 可调用 refresh() 刷新当前页、reload() 回到第一页重载、clearSelection() 清空选择。
 * 6. 需要固定列时，在 columns 内设置 fixed: 'left' / 'right'，并给 BlogTable 设置 scroll="{ x: 1000 }"；
 * 7. 需要列宽时，在 columns 内设置 width；需要竖向分界线时设置 column-border；需要斑马行时设置 striped。
 *
 * 基本用法:
 * <BlogTable :api-fn="listAdminArticles" :columns="columns">
 *   <template #bodyCell="{ column, record }">...</template>
 * </BlogTable>
 *
 * 带筛选参数:
 * <BlogTable :api-fn="listAdminArticles" :columns="columns" :params="{ status: 'published' }" />
 *
 * 固定高度:
 * <BlogTable :api-fn="loadList" :columns="columns" height="600px" />
 *
 * 固定列/列宽/分界线:
 * const columns = [
 *   { title: '标题', dataIndex: 'title', key: 'title', width: 260, fixed: 'left' },
 *   { title: '操作', key: 'action', width: 160, fixed: 'right' }
 * ]
 * <BlogTable :columns="columns" :scroll="{ x: 1000 }" column-border striped />
-->
<template>
  <div
    ref="rootRef"
    class="blog-table"
    :class="rootClass"
    :style="rootStyle"
  >
    <!-- 顶部工具栏：只放搜索、筛选、批量操作等页面业务控件 -->
    <div class="blog-table__toolbar" v-if="!bare && $slots.toolbar">
      <div class="blog-table__toolbar-left">
        <slot name="toolbar" />
      </div>
    </div>

    <!-- 表格区域 -->
    <div
      ref="bodyRef"
      class="blog-table__body"
      :class="bodyClass"
      :style="bodyStyle"
    >
      <a-table
        ref="tableRef"
        :row-key="rowKey"
        :columns="effectiveColumns"
        :data-source="tableData"
        :loading="loading"
        :pagination="false"
        :scroll="effectiveScroll"
        :row-selection="effectiveRowSelection"
        :bordered="bordered"
        :row-class-name="mergedRowClassName"
        v-bind="tableAttrs"
        @change="handleTableChange"
      >
        <!-- 透传表格插槽，过滤掉组件自身使用的 toolbar / empty 等插槽 -->
        <template v-for="(_, name) in tableSlots" #[name]="slotData">
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

    <!-- 底部分页工具栏：分页居中，刷新和列设置固定在右侧 -->
    <div class="blog-table__footer" v-if="showFooter">
      <div class="blog-table__footer-side" />
      <div class="blog-table__pagination">
        <a-pagination
          v-if="showPagination"
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
      <div class="blog-table__footer-actions">
        <slot name="toolbarRight" />
        <a-tooltip title="刷新表格">
          <a-button class="blog-table__icon-btn" @click="refresh" :loading="loading" aria-label="刷新表格">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-popover
          v-if="showColumnSetting"
          placement="topRight"
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
          <a-tooltip title="列显示设置">
            <a-button class="blog-table__icon-btn" aria-label="列显示设置">
              <template #icon><SettingOutlined /></template>
            </a-button>
          </a-tooltip>
        </a-popover>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, useAttrs, useSlots, nextTick } from 'vue'
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
  // 显示完整单元格边框，适合强数据录入/对账类表格
  bordered: { type: Boolean, default: false },
  // 显示列之间的竖向分界线，适合列很多、需要横向对齐阅读的表格
  columnBorder: { type: Boolean, default: false },
  // 显示轻量斑马行，适合长列表快速扫读
  striped: { type: Boolean, default: false },
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
const slots = useSlots()
const rootRef = ref(null)
const bodyRef = ref(null)
const tableRef = ref(null)
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const currentPageSize = ref(props.pageSize)
const selectedRowKeys = ref([])
const selectedRows = ref([])
const internalSlotNames = new Set(['toolbar', 'toolbarRight', 'empty'])

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

const effectiveColumns = computed(() => {
  if (!isMobileFluidLayout.value) return visibleColumns.value

  // 移动端空间有限，固定列会遮挡横向滚动内容；窄屏统一退回普通列，让用户自然左右滑动查看。
  return visibleColumns.value.map((col) => {
    if (!col.fixed) return col
    const { fixed: _fixed, ...rest } = col
    return rest
  })
})

const hasConfiguredFixedColumn = computed(() => visibleColumns.value.some((col) => Boolean(col.fixed)))
const hasFixedColumn = computed(() => effectiveColumns.value.some((col) => Boolean(col.fixed)))

const tableSlots = computed(() => {
  return Object.fromEntries(
    Object.entries(slots).filter(([name]) => !internalSlotNames.has(name))
  )
})

const rootClass = computed(() => ({
  'blog-table--stretch': isStretchLayout.value && !isMobileFluidLayout.value,
  'blog-table--bordered': props.bordered,
  'blog-table--column-border': props.columnBorder,
  'blog-table--striped': props.striped
}))

const bodyClass = computed(() => ({
  'blog-table__body--stretch': isStretchLayout.value && !isMobileFluidLayout.value,
  'blog-table__body--fixed-scroll': Boolean(effectiveScroll.value?.y)
}))

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
    scheduleCalcLayout()
  } catch (error) {
    tableData.value = []
    total.value = 0
    scheduleCalcLayout()
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

  const preserveSelectedRowKeys = base.preserveSelectedRowKeys ?? true

  return {
    preserveSelectedRowKeys,
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

// 首屏先给一个保守的滚动高度，避免表格在首次数据渲染时先把页面撑开，
// 等 ResizeObserver / nextTick 计算完成后再收敛到真实高度。
// 这里不能用视口兜底值，因为控制台内容区本身是独立滚动容器，视口值会让高度在滚动时抖动。
const autoRootHeight = ref(320)
const autoScrollY = ref(240)
const stretchScrollY = ref(240)
const isNarrowViewport = ref(false)
let tableResizeObserver = null
let layoutFrameId = 0
let fixedColumnFrameId = 0

const showSizeChanger = computed(() => props.pageSizes.length > 0)
const showQuickJumper = computed(() => total.value > currentPageSize.value)
const pageSizeOptions = computed(() => props.pageSizes.map(String))
const showPagination = computed(() => !props.hidePagination && total.value > 0)
const showFooterActions = computed(() => Boolean(slots.toolbarRight) || props.showColumnSetting || Boolean(props.apiFn))
const showFooter = computed(() => !props.bare && (showPagination.value || showFooterActions.value))

function calcScrollY() {
  if (!rootRef.value) return
  const rect = rootRef.value.getBoundingClientRect()
  const container = rootRef.value.closest('.enterprise-content') || rootRef.value.parentElement
  const containerRect = container?.getBoundingClientRect?.()
  const bottomGap = 16
  const availableHeight = containerRect
    ? containerRect.bottom - rect.top - bottomGap
    : window.innerHeight - rect.top - bottomGap
  autoRootHeight.value = Math.max(availableHeight, 320)
  autoScrollY.value = Math.max(autoRootHeight.value - getBodyReservedHeight() - getTableHeaderHeight(), 200)
}

function calcStretchScrollY() {
  if (!bodyRef.value) return
  stretchScrollY.value = Math.max(bodyRef.value.clientHeight - getTableHeaderHeight(), 200)
}

function calcLayout() {
  if (isMobileFluidLayout.value) {
    syncScrollbarGutter()
    return
  }

  if (props.height === 'auto') {
    calcScrollY()
    syncScrollbarGutter()
    return
  }

  if (isStretchLayout.value) {
    calcStretchScrollY()
  }

  syncScrollbarGutter()
}

function scheduleCalcLayout() {
  if (layoutFrameId) {
    cancelAnimationFrame(layoutFrameId)
  }

  layoutFrameId = requestAnimationFrame(() => {
    layoutFrameId = 0
    nextTick(calcLayout)
  })
}

function syncScrollbarGutter() {
  const root = bodyRef.value
  if (!root) return

  const body = root.querySelector('.ant-table-body')
  const headerScrollbarCell = root.querySelector('.ant-table-thead .ant-table-cell-scrollbar')
  const headerScrollbarCol = root.querySelector('.ant-table-header colgroup col:last-child')
  if (!body) return

  const scrollbarWidth = Math.max(body.offsetWidth - body.clientWidth, 0)
  root.style.setProperty('--blog-table-scrollbar-size', `${scrollbarWidth}px`)

  if (headerScrollbarCell) {
    const width = `${scrollbarWidth}px`
    headerScrollbarCell.style.width = width
    headerScrollbarCell.style.minWidth = width
    headerScrollbarCell.style.maxWidth = width
    headerScrollbarCell.style.flex = `0 0 ${width}`
    headerScrollbarCell.style.padding = '0'
  }

  if (headerScrollbarCol) {
    const width = `${scrollbarWidth}px`
    headerScrollbarCol.setAttribute('width', width)
    headerScrollbarCol.style.width = width
    headerScrollbarCol.style.minWidth = width
    headerScrollbarCol.style.maxWidth = width
  }

  syncRightFixedHeaderOffsets(root, scrollbarWidth)
  scheduleRightFixedHeaderSync(root, scrollbarWidth)
}

function syncRightFixedHeaderOffsets(root, scrollbarWidth) {
  const scrollbarCell = root.querySelector('.ant-table-thead .ant-table-cell-scrollbar')
  const dataRow = Array.from(root.querySelectorAll('.ant-table-tbody tr'))
    .find((row) => !row.classList.contains('ant-table-measure-row') && row.querySelector('td.ant-table-cell'))
  if (!scrollbarCell || !dataRow) return

  const visualScrollbarWidth = scrollbarCell.getBoundingClientRect().width
  const delta = visualScrollbarWidth - scrollbarWidth
  const headers = Array.from(root.querySelectorAll('.ant-table-thead > tr > th'))
  const cells = Array.from(dataRow.querySelectorAll('td'))
  const rightFixedHeaders = headers.filter((cell) => (
    cell.classList.contains('ant-table-cell-fix-right') && !cell.classList.contains('ant-table-cell-scrollbar')
  ))

  rightFixedHeaders.forEach((cell) => {
    if (!cell.dataset.blogTableOriginalRight) {
      cell.dataset.blogTableOriginalRight = cell.style.right || window.getComputedStyle(cell).right || '0px'
    }

    const originalRight = Number.parseFloat(cell.dataset.blogTableOriginalRight)
    if (!Number.isFinite(originalRight)) return

    // Ant Design Vue sometimes reserves a wider header scrollbar gutter than the body actually has.
    // Fixed-right header cells must use the body gutter, otherwise the operation column splits by a few pixels.
    const expectedRight = Math.max(0, originalRight - delta)
    cell.style.setProperty('right', `${expectedRight}px`, 'important')

    const columnIndex = headers.indexOf(cell)
    const bodyCell = cells[columnIndex]
    if (!bodyCell) return

    const headerRect = cell.getBoundingClientRect()
    const bodyRect = bodyCell.getBoundingClientRect()
    const visualDelta = headerRect.left - bodyRect.left
    if (Math.abs(visualDelta) > 0.5) {
      cell.style.setProperty('right', `${Math.max(0, expectedRight + visualDelta)}px`, 'important')
    }
  })
}

function scheduleRightFixedHeaderSync(root, scrollbarWidth) {
  if (fixedColumnFrameId) {
    cancelAnimationFrame(fixedColumnFrameId)
  }

  fixedColumnFrameId = requestAnimationFrame(() => {
    fixedColumnFrameId = requestAnimationFrame(() => {
      fixedColumnFrameId = 0
      syncRightFixedHeaderOffsets(root, scrollbarWidth)
    })
  })
}

function getBodyReservedHeight() {
  if (!rootRef.value) return 0
  const toolbarHeight = rootRef.value.querySelector('.blog-table__toolbar')?.offsetHeight || 0
  const footerHeight = rootRef.value.querySelector('.blog-table__footer')?.offsetHeight || 48
  const borderHeight = 2
  return toolbarHeight + (showFooter.value ? footerHeight : 0) + borderHeight
}

function getTableHeaderHeight() {
  return bodyRef.value?.querySelector('.ant-table-thead')?.getBoundingClientRect().height || 48
}

const effectiveScroll = computed(() => {
  const scroll = { ...(props.scroll || {}) }

  if (!scroll.x && (hasFixedColumn.value || (isMobileFluidLayout.value && hasConfiguredFixedColumn.value))) {
    // 固定列依赖横向滚动容器，兜底避免使用方忘记配置 scroll.x 后固定列失效。
    scroll.x = 'max-content'
  }

  if (isMobileFluidLayout.value) {
    delete scroll.y
  }

  if (!scroll.y && !isMobileFluidLayout.value) {
    if (props.height === 'auto') {
      scroll.y = autoScrollY.value || undefined
    } else if (isStretchLayout.value) {
      scroll.y = stretchScrollY.value || undefined
    }
  }

  if (!scroll.x && !scroll.y) return undefined
  return scroll
})

const rootStyle = computed(() => {
  const style = {}
  if (isMobileFluidLayout.value) {
    style.height = 'auto'
  } else if (props.height === 'auto') {
    style.height = `${autoRootHeight.value}px`
  } else if (props.height) {
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
  if (isMobileFluidLayout.value) {
    style.flex = '0 0 auto'
    style.minHeight = '0'
    style.overflow = 'visible'
  } else {
    style.flex = '1 1 0'
    style.minHeight = 0
    style.overflow = 'hidden'
  }
  if (effectiveScroll.value?.y) {
    style['--blog-table-scroll-y'] = `${effectiveScroll.value.y}px`
  }
  if (props.bare) {
    style.borderRadius = '0'
  }
  return style
})

const isStretchLayout = computed(() => props.height && props.height !== 'auto')
const isMobileFluidLayout = computed(() => isNarrowViewport.value)

function updateViewportState() {
  isNarrowViewport.value = window.innerWidth <= 900
}

function mergedRowClassName(record, index) {
  const attrRowClassName = attrs.rowClassName
  const classNames = []

  if (props.striped && index % 2 === 1) {
    classNames.push('blog-table-row--striped')
  }

  if (typeof attrRowClassName === 'function') {
    classNames.push(attrRowClassName(record, index))
  } else if (typeof attrRowClassName === 'string') {
    classNames.push(attrRowClassName)
  }

  return classNames.filter(Boolean).join(' ')
}

const tableAttrs = computed(() => {
  // 过滤掉不应传递给 a-table 的属性
  const {
    class: _c,
    style: _s,
    params: _p,
    apiFn: _a,
    dataSource: _d,
    bordered: _b,
    rowClassName: _r,
    ...rest
  } = attrs
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

watch(
  () => [showFooter.value, total.value, props.height],
  scheduleCalcLayout
)

watch(
  () => [effectiveScroll.value?.x, effectiveScroll.value?.y, effectiveColumns.value.length, tableData.value.length],
  scheduleCalcLayout
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
  updateViewportState()
  nextTick(scheduleCalcLayout)
  window.addEventListener('resize', handleWindowResize)
  if (typeof ResizeObserver !== 'undefined') {
    tableResizeObserver = new ResizeObserver(scheduleCalcLayout)
    if (rootRef.value) {
      tableResizeObserver.observe(rootRef.value)
    }
    if (bodyRef.value) {
      tableResizeObserver.observe(bodyRef.value)
    }
  }

  if (props.autoLoad && props.apiFn) {
    loadData()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
  tableResizeObserver?.disconnect()
  tableResizeObserver = null
  if (layoutFrameId) {
    cancelAnimationFrame(layoutFrameId)
    layoutFrameId = 0
  }
  if (fixedColumnFrameId) {
    cancelAnimationFrame(fixedColumnFrameId)
    fixedColumnFrameId = 0
  }
})

function handleWindowResize() {
  updateViewportState()
  scheduleCalcLayout()
}

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
  display: flex;
  flex-direction: column;
  background: var(--console-surface, #fff);
  border: 1px solid var(--console-border, #f0f0f0);
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
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
  flex: 0 0 auto;
}

.blog-table__toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
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
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

.blog-table__body--stretch {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

.blog-table__body :deep(.ant-table-wrapper),
.blog-table__body :deep(.ant-spin-nested-loading),
.blog-table__body :deep(.ant-spin-container),
.blog-table__body :deep(.ant-table),
.blog-table__body :deep(.ant-table-content),
.blog-table__body :deep(.ant-table-container) {
  height: 100%;
  min-height: 0;
}

.blog-table__body--stretch :deep(.ant-table-wrapper),
.blog-table__body--stretch :deep(.ant-spin-nested-loading),
.blog-table__body--stretch :deep(.ant-spin-container),
.blog-table__body--stretch :deep(.ant-table),
.blog-table__body--stretch :deep(.ant-table-content),
.blog-table__body--stretch :deep(.ant-table-container) {
  height: 100%;
  min-height: 0;
}

.blog-table__body :deep(.ant-table-container) {
  min-width: 0;
}

.blog-table__body :deep(.ant-table-header),
.blog-table__body :deep(.ant-table-body),
.blog-table__body :deep(.ant-table-sticky-scroll) {
  scroll-behavior: auto !important;
}

.blog-table__body :deep(.ant-table-header) {
  overflow-x: hidden !important;
}

.blog-table__body :deep(.ant-table-body) {
  scrollbar-width: thin;
  overscroll-behavior: contain;
  contain: paint;
}

.blog-table__body :deep(.ant-table),
.blog-table__body :deep(.ant-table-container),
.blog-table__body :deep(.ant-table-content),
.blog-table__body :deep(.ant-table-body),
.blog-table__body :deep(.ant-table-tbody > tr > td) {
  color: var(--console-text, #101828);
  background: var(--console-surface, #fff);
  border-color: var(--console-border, #f0f0f0);
}

.blog-table__body :deep(.ant-table-cell) {
  position: relative;
  overflow: hidden;
  background-clip: padding-box;
  contain: paint;
}

.blog-table__body :deep(.ant-table-thead > tr > th > *),
.blog-table__body :deep(.ant-table-tbody > tr > td > *) {
  max-width: 100%;
}

/* 固定列：body 单元格 */
.blog-table__body :deep(.ant-table-tbody > tr > td.ant-table-cell-fix-left),
.blog-table__body :deep(.ant-table-tbody > tr > td.ant-table-cell-fix-right) {
  background: var(--console-surface, #fff);
  border-color: var(--console-border, #f0f0f0);
  z-index: 4;
  isolation: isolate;
  clip-path: inset(0);
}

/* 固定列：表头单元格 — 必须和普通 th 背景一致，否则滚动时视觉错位 */
.blog-table__body :deep(.ant-table-thead > tr > th.ant-table-cell-fix-left),
.blog-table__body :deep(.ant-table-thead > tr > th.ant-table-cell-fix-right) {
  background: var(--console-surface-muted, #fafafa);
  border-color: var(--console-border, #f0f0f0);
  z-index: 5;
  isolation: isolate;
  clip-path: inset(0);
}

/* 修复 th ::after 伪元素底边对齐 */
.blog-table__body :deep(.ant-table-thead > tr > th.ant-table-cell-fix-left-last::after),
.blog-table__body :deep(.ant-table-thead > tr > th.ant-table-cell-fix-right-first::after) {
  bottom: 0;
}

.blog-table__body :deep(.ant-table-tbody > tr > td.ant-table-cell-fix-left::before),
.blog-table__body :deep(.ant-table-tbody > tr > td.ant-table-cell-fix-right::before),
.blog-table__body :deep(.ant-table-thead > tr > th.ant-table-cell-fix-left::before),
.blog-table__body :deep(.ant-table-thead > tr > th.ant-table-cell-fix-right::before) {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  z-index: 0;
  pointer-events: none;
}

.blog-table__body :deep(.ant-table-tbody > tr > td.ant-table-cell-fix-left > *),
.blog-table__body :deep(.ant-table-tbody > tr > td.ant-table-cell-fix-right > *),
.blog-table__body :deep(.ant-table-thead > tr > th.ant-table-cell-fix-left > *),
.blog-table__body :deep(.ant-table-thead > tr > th.ant-table-cell-fix-right > *) {
  position: relative;
  z-index: 1;
}

.blog-table__body--fixed-scroll :deep(.ant-table-body) {
  height: var(--blog-table-scroll-y);
  max-height: var(--blog-table-scroll-y) !important;
}

.blog-table__body :deep(.ant-table-placeholder) {
  height: 100%;
  color: var(--console-text-secondary, #8c8c8c);
  background: var(--console-surface, #fff);
}

.blog-table__body :deep(.ant-table-thead > tr > th) {
  color: var(--console-text-secondary, #8c8c8c);
  background: var(--console-surface-muted, #fafafa);
  font-weight: 650;
  font-size: 13px;
  padding: 10px 14px;
  box-sizing: border-box;
}

.blog-table__body :deep(.ant-table-tbody > tr > td) {
  padding: 10px 14px;
  vertical-align: middle;
  transition: background 0.2s ease;
  box-sizing: border-box;
}

.blog-table__body :deep(.ant-table-tbody > tr.ant-table-row-selected > td) {
  background: color-mix(in srgb, var(--console-primary, #1677ff) 12%, var(--console-surface, #fff) 88%);
}

.blog-table__body :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--console-surface-hover, #f5f7fa);
}

.blog-table--striped .blog-table__body :deep(.blog-table-row--striped > td) {
  background: color-mix(in srgb, var(--console-surface-muted, #fafafa) 84%, var(--console-surface, #fff) 16%);
}

.blog-table--striped .blog-table__body :deep(.blog-table-row--striped:hover > td) {
  background: var(--console-surface-hover, #f5f7fa);
}

.blog-table--column-border .blog-table__body :deep(.ant-table-thead > tr > th:not(:last-child)),
.blog-table--column-border .blog-table__body :deep(.ant-table-tbody > tr > td:not(:last-child)) {
  border-inline-end: 1px solid var(--console-border, #f0f0f0);
}

.blog-table--column-border .blog-table__body :deep(.ant-table-cell-fix-left-last::after),
.blog-table--column-border .blog-table__body :deep(.ant-table-cell-fix-right-first::after) {
  box-shadow: inset 10px 0 8px -8px color-mix(in srgb, var(--console-bg, #0f172a) 46%, transparent);
}

/* 固定列选中行/悬浮行背景同步 */
.blog-table__body :deep(.ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-left),
.blog-table__body :deep(.ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-right) {
  background: color-mix(in srgb, var(--console-primary, #1677ff) 12%, var(--console-surface, #fff) 88%);
}

.blog-table__body :deep(.ant-table-tbody > tr:hover > td.ant-table-cell-fix-left),
.blog-table__body :deep(.ant-table-tbody > tr:hover > td.ant-table-cell-fix-right) {
  background: var(--console-surface-hover, #f5f7fa);
}

.blog-table--striped .blog-table__body :deep(.blog-table-row--striped > td.ant-table-cell-fix-left),
.blog-table--striped .blog-table__body :deep(.blog-table-row--striped > td.ant-table-cell-fix-right) {
  background: color-mix(in srgb, var(--console-surface-muted, #fafafa) 84%, var(--console-surface, #fff) 16%);
}

.blog-table--bordered {
  border-color: var(--console-border-strong, var(--console-border, #d9d9d9));
}

.blog-table__body :deep(.ant-table-pagination) {
  display: none !important;
}

/* 底部分页工具栏 */
.blog-table__footer {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: minmax(96px, 1fr) auto minmax(96px, 1fr);
  align-items: center;
  gap: 12px;
  margin-top: auto;
  min-height: 52px;
  padding: 8px 16px;
  border-top: 1px solid var(--console-border, #f0f0f0);
  background: var(--console-surface, #fff);
}

.blog-table__footer-side {
  min-width: 0;
}

.blog-table__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.blog-table__footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  min-width: 0;
}

.blog-table__pagination :deep(.ant-pagination) {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  row-gap: 6px;
}

.blog-table__pagination :deep(.ant-pagination-total-text) {
  color: var(--console-text-secondary, #8c8c8c);
}

.blog-table__pagination :deep(.ant-pagination-options) {
  margin-inline-start: 8px;
}

/* 列设置面板 */
.blog-table__column-setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  margin-bottom: 8px;
  color: var(--console-text, #101828);
  border-bottom: 1px solid var(--console-border, #f0f0f0);
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
  color: var(--console-text, #101828);
}

@media (max-width: 900px) {
  .blog-table {
    min-height: 0;
  }

  .blog-table__body {
    min-height: 0;
    overflow: visible;
  }

  .blog-table__body :deep(.ant-table-wrapper),
  .blog-table__body :deep(.ant-spin-nested-loading),
  .blog-table__body :deep(.ant-spin-container),
  .blog-table__body :deep(.ant-table),
  .blog-table__body :deep(.ant-table-content),
  .blog-table__body :deep(.ant-table-container) {
    height: auto;
    min-height: 0;
  }

  .blog-table__body--fixed-scroll :deep(.ant-table-body) {
    height: auto;
    max-height: none !important;
  }

  .blog-table__body :deep(.ant-table-body) {
    overflow-y: visible !important;
  }

  .blog-table__body :deep(.ant-table-cell) {
    contain: none;
  }

  .blog-table__footer {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .blog-table__footer-side {
    display: none;
  }

  .blog-table__pagination {
    order: 1;
  }

  .blog-table__footer-actions {
    order: 2;
    justify-content: center;
  }
}
</style>
