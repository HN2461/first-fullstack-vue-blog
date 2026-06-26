<template>
  <a-modal
    v-model:open="open"
    title="导出账本流水"
    :width="760"
    :confirm-loading="exporting"
    ok-text="导出 Excel"
    cancel-text="取消"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    destroy-on-close
    @ok="handleExport"
  >
    <a-form layout="vertical" class="ledger-export-form">
      <a-form-item label="数据范围">
        <a-radio-group v-model:value="form.scope" class="ledger-export-scope">
          <a-radio-button value="filtered">当前筛选结果</a-radio-button>
          <a-radio-button value="selected" :disabled="!selectedKeys.length">已选流水</a-radio-button>
          <a-radio-button value="book">当前账本全部</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="导出模板">
        <div class="ledger-export-presets">
          <button
            v-for="preset in LEDGER_EXPORT_PRESETS"
            :key="preset.key"
            type="button"
            :class="['ledger-export-preset', { active: form.preset === preset.key }]"
            @click="applyPreset(preset.key)"
          >
            <strong>{{ preset.name }}</strong>
            <span>{{ preset.description }}</span>
          </button>
        </div>
      </a-form-item>

      <a-form-item label="导出字段">
        <div class="ledger-export-column-actions">
          <a-button size="small" @click="selectAllColumns">全选</a-button>
          <a-button size="small" @click="resetColumns">重置</a-button>
        </div>
        <div class="ledger-export-columns">
          <div
            v-for="(key, index) in form.columnKeys"
            :key="key"
            class="ledger-export-column"
          >
            <a-checkbox
              :checked="true"
              @change="toggleColumn(key, $event.target.checked)"
            >
              {{ getColumnTitle(key) }}
            </a-checkbox>
            <div class="ledger-export-column__actions">
              <a-tooltip title="上移">
                <a-button size="small" :disabled="index === 0" @click="moveColumn(index, -1)">↑</a-button>
              </a-tooltip>
              <a-tooltip title="下移">
                <a-button size="small" :disabled="index === form.columnKeys.length - 1" @click="moveColumn(index, 1)">↓</a-button>
              </a-tooltip>
            </div>
          </div>
          <a-popover trigger="click" placement="bottomLeft" :overlay-style="{ width: '240px' }">
            <template #content>
              <div class="ledger-export-add-list">
                <a-checkbox
                  v-for="column in hiddenColumns"
                  :key="column.key"
                  @change="toggleColumn(column.key, $event.target.checked)"
                >
                  {{ column.title }}
                </a-checkbox>
                <a-empty v-if="!hiddenColumns.length" description="字段已全部显示" :image-style="{ height: '40px' }" />
              </div>
            </template>
            <a-button block>添加隐藏字段</a-button>
          </a-popover>
        </div>
      </a-form-item>

      <a-form-item label="表格样式">
        <div class="ledger-export-style-grid">
          <a-checkbox v-model:checked="form.options.freezeHeader">冻结表头</a-checkbox>
          <a-checkbox v-model:checked="form.options.autoFilter">自动筛选</a-checkbox>
          <a-checkbox v-model:checked="form.options.zebra">斑马纹</a-checkbox>
          <a-checkbox v-model:checked="form.options.colorAmount">金额颜色</a-checkbox>
          <a-checkbox v-model:checked="form.options.summaryRow">追加汇总行</a-checkbox>
          <a-checkbox v-model:checked="form.options.includeMeta">导出说明行</a-checkbox>
        </div>
      </a-form-item>

      <a-alert
        type="info"
        show-icon
        :message="previewText"
      />
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { buildLedgerEntriesWorkbook } from './ledgerExcelBuilder'
import { LEDGER_EXPORT_COLUMNS, LEDGER_EXPORT_PRESETS, getDefaultExportColumnKeys } from './ledgerExportColumns'
import { listLedgerEntries } from '@/services/ledger'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  bookName: { type: String, default: '' },
  selectedKeys: { type: Array, default: () => [] }
})

const open = defineModel('open', {
  type: Boolean,
  default: false
})

const exporting = defineModel('exporting', {
  type: Boolean,
  default: false
})

const form = reactive({
  scope: 'filtered',
  preset: 'standard',
  columnKeys: getDefaultExportColumnKeys(),
  options: { ...LEDGER_EXPORT_PRESETS[0].options }
})

const columnMap = computed(() => new Map(LEDGER_EXPORT_COLUMNS.map((column) => [column.key, column])))
const hiddenColumns = computed(() => LEDGER_EXPORT_COLUMNS.filter((column) => !form.columnKeys.includes(column.key)))
const previewText = computed(() => {
  const scopeText = form.scope === 'selected'
    ? `已选择 ${props.selectedKeys.length} 条流水`
    : form.scope === 'book'
      ? '导出当前账本全部流水'
      : '导出当前筛选条件下的全部流水'
  return `${scopeText}，共 ${form.columnKeys.length} 个字段，生成带样式的 .xlsx 文件。`
})

watch(open, (visible) => {
  if (visible && form.scope === 'selected' && !props.selectedKeys.length) {
    form.scope = 'filtered'
  }
})

function getColumnTitle(key) {
  return columnMap.value.get(key)?.title || key
}

function applyPreset(key) {
  const preset = LEDGER_EXPORT_PRESETS.find((item) => item.key === key)
  if (!preset) return
  form.preset = key
  form.columnKeys = [...preset.columns]
  form.options = { ...preset.options }
}

function selectAllColumns() {
  form.preset = 'custom'
  form.columnKeys = LEDGER_EXPORT_COLUMNS.map((column) => column.key)
}

function resetColumns() {
  applyPreset(form.preset === 'custom' ? 'standard' : form.preset)
}

function toggleColumn(key, checked) {
  form.preset = 'custom'
  if (checked && !form.columnKeys.includes(key)) {
    form.columnKeys.push(key)
  } else if (!checked) {
    form.columnKeys = form.columnKeys.filter((item) => item !== key)
  }
}

function moveColumn(index, offset) {
  const nextIndex = index + offset
  if (nextIndex < 0 || nextIndex >= form.columnKeys.length) return
  const next = [...form.columnKeys]
  const [item] = next.splice(index, 1)
  next.splice(nextIndex, 0, item)
  form.columnKeys = next
  form.preset = 'custom'
}

function getRequestParams() {
  const params = { ...props.params }
  if (form.scope === 'book') {
    delete params.from
    delete params.to
    delete params.type
    delete params.categoryId
    delete params.keyword
    delete params.tags
    delete params.sortField
    delete params.sortOrder
  }
  return params
}

async function fetchAllEntries() {
  const baseParams = getRequestParams()
  const pageSize = 100
  let page = 1
  let total = 0
  const items = []
  do {
    const result = await listLedgerEntries({ ...baseParams, page, pageSize })
    const rows = result.items || []
    items.push(...rows)
    total = result.total || items.length
    page += 1
    if (items.length > 10000) {
      throw new Error('单次导出最多支持 10000 条流水，请缩小筛选范围')
    }
  } while (items.length < total)

  if (form.scope === 'selected') {
    const selectedSet = new Set(props.selectedKeys)
    return items.filter((item) => selectedSet.has(item.id))
  }
  return items
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function getRangeText() {
  const from = props.params.from || ''
  const to = props.params.to || ''
  if (form.scope === 'book') return '当前账本全部'
  if (from && to) return `${from} 至 ${to}`
  return '全部日期'
}

async function handleExport() {
  if (!form.columnKeys.length) {
    message.warning('请至少选择一个导出字段')
    return
  }
  if (form.scope === 'selected' && !props.selectedKeys.length) {
    message.warning('请先选择要导出的流水')
    return
  }

  exporting.value = true
  try {
    const entries = await fetchAllEntries()
    if (!entries.length) {
      message.warning('没有可导出的流水')
      return
    }
    const blob = await buildLedgerEntriesWorkbook(entries, {
      columnKeys: form.columnKeys,
      options: form.options,
      metadata: {
        title: '账本流水导出',
        bookName: props.bookName,
        rangeText: getRangeText()
      }
    })
    const stamp = new Date().toISOString().slice(0, 10)
    downloadBlob(blob, `ledger-entries-${stamp}.xlsx`)
    open.value = false
    message.success(`已导出 ${entries.length} 条流水`)
  } catch (error) {
    message.error(error.message || '导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.ledger-export-form {
  display: grid;
  gap: 2px;
}

.ledger-export-scope {
  display: flex;
  flex-wrap: wrap;
}

.ledger-export-presets {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.ledger-export-preset {
  display: grid;
  gap: 4px;
  min-height: 74px;
  padding: 10px 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  color: var(--console-text);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease;
}

.ledger-export-preset strong {
  font-size: 14px;
}

.ledger-export-preset span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.ledger-export-preset.active {
  border-color: var(--console-primary);
  background: color-mix(in srgb, var(--console-primary, #1677ff) 8%, var(--console-surface));
}

.ledger-export-column-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.ledger-export-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.ledger-export-column {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 36px;
  padding: 6px 8px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.ledger-export-column__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.ledger-export-add-list {
  display: grid;
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
}

.ledger-export-style-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 12px;
}

@media (max-width: 760px) {
  .ledger-export-presets,
  .ledger-export-columns,
  .ledger-export-style-grid {
    grid-template-columns: 1fr;
  }

  .ledger-export-scope :deep(.ant-radio-button-wrapper) {
    flex: 1;
    text-align: center;
  }
}
</style>
