<template>
  <div class="media-spreadsheet-preview">
    <div v-if="loading" class="media-spreadsheet-preview__state">
      <a-spin tip="正在读取表格" />
    </div>
    <div v-else-if="errorMessage" class="media-spreadsheet-preview__state media-spreadsheet-preview__state--error">
      <strong>表格暂时无法预览</strong>
      <p>{{ errorMessage }}</p>
      <a-button size="small" @click="loadWorkbook">重新加载</a-button>
    </div>
    <template v-else>
      <div class="media-spreadsheet-preview__toolbar">
        <div class="media-spreadsheet-preview__sheets" role="tablist" aria-label="工作表">
          <button
            v-for="sheet in sheets"
            :key="sheet.name"
            type="button"
            class="media-spreadsheet-preview__sheet"
            :class="{ 'is-active': sheet.name === activeSheetName }"
            role="tab"
            :aria-selected="sheet.name === activeSheetName"
            @click="activeSheetName = sheet.name"
          >
            {{ sheet.name }}
          </button>
        </div>
        <span class="media-spreadsheet-preview__hint">{{ activeSheet?.rows.length || 0 }} 行 · {{ activeSheet?.columnCount || 0 }} 列</span>
      </div>
      <div v-if="activeSheet" class="media-spreadsheet-preview__table-wrap">
        <table class="media-spreadsheet-preview__table">
          <tbody>
            <tr v-for="row in activeSheet.rows" :key="row.number">
              <th scope="row">{{ row.number }}</th>
              <td v-for="column in activeSheet.columnCount" :key="`${row.number}-${column}`">
                {{ row.values[column - 1] ?? '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <a-empty v-else description="当前表格没有可展示的内容" />
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const MAX_ROWS = 1000
const MAX_COLUMNS = 80

// 预览只承担快速浏览，限制单次解析规模，避免超大工作簿拖慢弹框交互。

const props = defineProps({
  open: { type: Boolean, default: false },
  url: { type: String, default: '' },
  fileName: { type: String, default: '' }
})

const sheets = ref([])
const activeSheetName = ref('')
const loading = ref(false)
const errorMessage = ref('')
let requestVersion = 0
let abortController = null

const activeSheet = computed(() => sheets.value.find((sheet) => sheet.name === activeSheetName.value) || sheets.value[0] || null)

watch(() => [props.open, props.url, props.fileName], ([open]) => {
  if (open) loadWorkbook()
  else cancelLoad()
}, { immediate: true })

async function loadWorkbook() {
  const currentVersion = ++requestVersion
  abortController?.abort()
  abortController = new AbortController()
  loading.value = true
  errorMessage.value = ''
  sheets.value = []
  activeSheetName.value = ''

  try {
    const response = await fetch(props.url, { credentials: 'include', signal: abortController.signal })
    if (!response.ok) throw new Error(`文件请求失败（HTTP ${response.status}）`)
    const buffer = await response.arrayBuffer()
    if (currentVersion !== requestVersion) return

    if (/\.(csv|tsv|tab)$/i.test(props.fileName)) {
      const source = new TextDecoder().decode(buffer)
      const delimiter = /\.(tsv|tab)$/i.test(props.fileName) ? '\t' : detectCsvDelimiter(source)
      sheets.value = [buildSheet(/\.(tsv|tab)$/i.test(props.fileName) ? 'TSV' : 'CSV', parseCsv(source, delimiter))]
    } else {
      const module = await import('exceljs')
      const ExcelJS = module.default || module
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      sheets.value = workbook.worksheets.map((worksheet) => buildSheet(worksheet.name, readWorksheet(worksheet)))
    }
    activeSheetName.value = sheets.value[0]?.name || ''
  } catch (error) {
    if (error?.name !== 'AbortError' && currentVersion === requestVersion) {
      errorMessage.value = error?.message || '表格解析失败，请下载后查看。'
    }
  } finally {
    if (currentVersion === requestVersion) loading.value = false
  }
}

function readWorksheet(worksheet) {
  const rows = []
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    if (rows.length >= MAX_ROWS) return
    rows.push({
      number: row.number,
      values: row.values.slice(1, MAX_COLUMNS + 1).map(normalizeCellValue)
    })
  })
  return rows
}

function buildSheet(name, rows) {
  const columnCount = Math.min(MAX_COLUMNS, Math.max(0, ...rows.map((row) => row.values.length)))
  return {
    name,
    rows,
    columnCount
  }
}

function normalizeCellValue(value) {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toLocaleString('zh-CN')
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) return value.richText.map((item) => item.text || '').join('')
    if ('result' in value) return normalizeCellValue(value.result)
    if ('text' in value) return String(value.text || '')
    return JSON.stringify(value)
  }
  return String(value)
}

function detectCsvDelimiter(source) {
  const firstLine = String(source || '').replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0]
  const candidates = [',', ';', '\t', '|']
  return candidates.reduce((best, delimiter) => {
    const count = firstLine.split(delimiter).length - 1
    return count > best.count ? { delimiter, count } : best
  }, { delimiter: ',', count: 0 }).delimiter
}

function parseCsv(source, delimiter = ',') {
  source = String(source || '').replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === delimiter && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      if (rows.length < MAX_ROWS) rows.push({ number: rows.length + 1, values: row.slice(0, MAX_COLUMNS) })
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell)
    if (rows.length < MAX_ROWS) rows.push({ number: rows.length + 1, values: row.slice(0, MAX_COLUMNS) })
  }
  return rows
}

function cancelLoad() {
  requestVersion += 1
  abortController?.abort()
  abortController = null
  loading.value = false
  sheets.value = []
  activeSheetName.value = ''
}

onBeforeUnmount(cancelLoad)
</script>

<style scoped>
.media-spreadsheet-preview {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--console-surface);
}

.media-spreadsheet-preview__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 42px;
  padding: 0 12px;
  border-bottom: 1px solid var(--console-border);
}

.media-spreadsheet-preview__sheets {
  display: flex;
  min-width: 0;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.media-spreadsheet-preview__sheet {
  flex: 0 0 auto;
  min-height: 28px;
  padding: 3px 10px;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--console-text-secondary);
  background: transparent;
  cursor: pointer;
  font-size: 12px;
}

.media-spreadsheet-preview__sheet.is-active {
  border-bottom-color: var(--console-primary-strong);
  color: var(--console-primary-strong);
  font-weight: 600;
}

.media-spreadsheet-preview__hint {
  flex: 0 0 auto;
  color: var(--console-text-tertiary, var(--console-text-secondary));
  font-size: 12px;
}

.media-spreadsheet-preview__table-wrap {
  min-height: 0;
  flex: 1;
  overflow: auto;
}

.media-spreadsheet-preview__table {
  min-width: 100%;
  border-collapse: collapse;
  color: var(--console-text);
  font-size: 12px;
  white-space: nowrap;
}

.media-spreadsheet-preview__table th,
.media-spreadsheet-preview__table td {
  min-width: 96px;
  max-width: 360px;
  padding: 7px 10px;
  border-right: 1px solid var(--console-border);
  border-bottom: 1px solid var(--console-border);
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
}

.media-spreadsheet-preview__table th {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 42px;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  font-weight: 600;
  text-align: right;
}

.media-spreadsheet-preview__table tr:nth-child(even) td {
  background: var(--console-surface-muted);
}

.media-spreadsheet-preview__state {
  display: grid;
  flex: 1;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 32px;
  color: var(--console-text-secondary);
  text-align: center;
}

.media-spreadsheet-preview__state p {
  max-width: 440px;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}
</style>
