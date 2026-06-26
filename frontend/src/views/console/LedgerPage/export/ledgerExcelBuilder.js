import { LEDGER_EXPORT_COLUMNS } from './ledgerExportColumns'

const HEADER_FILL = 'FFEAF2FF'
const HEADER_FONT = 'FF1D4ED8'
const BORDER_COLOR = 'FFD9E2EC'
const ZEBRA_FILL = 'FFF8FAFC'
const META_FILL = 'FFF3F6FA'
const INCOME_FONT = 'FF15803D'
const EXPENSE_FONT = 'FFB91C1C'

const helpers = {
  formatDate(value) {
    const date = toDate(value)
    if (!date) return ''
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  },
  formatDateTime(value) {
    const date = toDate(value)
    if (!date) return ''
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  },
  formatWeekday(value) {
    const date = toDate(value)
    if (!date) return ''
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function toDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getColumns(keys) {
  const map = new Map(LEDGER_EXPORT_COLUMNS.map((column) => [column.key, column]))
  return keys.map((key) => map.get(key)).filter(Boolean)
}

function normalizeColor(color = '') {
  const value = String(color).replace('#', '').trim()
  if (value.length === 3) {
    return value.split('').map((char) => `${char}${char}`).join('').toUpperCase()
  }
  return /^[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : ''
}

function makeCellValue(record, column) {
  return column.formatter ? column.formatter(record, helpers) : record[column.key]
}

function applyBorder(cell) {
  cell.border = {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } }
  }
}

function styleHeader(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: HEADER_FONT } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    applyBorder(cell)
  })
}

function styleMetaRow(row) {
  row.eachCell((cell) => {
    cell.font = { color: { argb: 'FF475467' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: META_FILL } }
    cell.alignment = { vertical: 'middle' }
    applyBorder(cell)
  })
}

function styleDataRow(row, record, columns, options) {
  row.eachCell((cell, index) => {
    const column = columns[index - 1]
    cell.alignment = {
      vertical: 'middle',
      horizontal: column?.align || 'left',
      wrapText: Boolean(column?.wrap)
    }
    applyBorder(cell)
    if (options.zebra && row.number % 2 === 0) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_FILL } }
    }
    if (column?.type === 'money') {
      cell.numFmt = '¥#,##0.00;[Red]-¥#,##0.00'
      if (options.colorAmount) {
        cell.font = {
          bold: true,
          color: { argb: record.type === 'income' ? INCOME_FONT : EXPENSE_FONT }
        }
      }
    }
    if (column?.key === 'category') {
      const color = normalizeColor(record.category?.color)
      if (color) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `18${color}` } }
      }
    }
  })
}

function addMetaRows(sheet, metadata, columnCount) {
  const titleRow = sheet.addRow([metadata.title || '账本流水导出'])
  titleRow.height = 24
  const titleCell = titleRow.getCell(1)
  titleCell.font = { bold: true, size: 15, color: { argb: 'FF101828' } }
  titleCell.alignment = { vertical: 'middle' }
  if (columnCount > 1) sheet.mergeCells(titleRow.number, 1, titleRow.number, columnCount)

  const metaText = [
    metadata.bookName ? `账本：${metadata.bookName}` : '',
    metadata.rangeText ? `范围：${metadata.rangeText}` : '',
    `导出时间：${helpers.formatDateTime(new Date())}`
  ].filter(Boolean).join('    ')
  const metaRow = sheet.addRow([metaText])
  if (columnCount > 1) sheet.mergeCells(metaRow.number, 1, metaRow.number, columnCount)
  styleMetaRow(metaRow)
  sheet.addRow([])
}

function addSummaryRow(sheet, entries, columns) {
  const income = entries
    .filter((record) => record.type === 'income')
    .reduce((sum, record) => sum + Number(record.amount || 0), 0)
  const expense = entries
    .filter((record) => record.type === 'expense')
    .reduce((sum, record) => sum + Number(record.amount || 0), 0)
  const summary = columns.map((column, index) => {
    if (index === 0) return '合计'
    if (column.key === 'amount') return income + expense
    if (column.key === 'signedAmount') return income - expense
    if (column.key === 'note') return `收入 ${income.toFixed(2)} / 支出 ${expense.toFixed(2)} / 结余 ${(income - expense).toFixed(2)}`
    return ''
  })
  const row = sheet.addRow(summary)
  row.eachCell((cell, index) => {
    const column = columns[index - 1]
    cell.font = { bold: true, color: { argb: 'FF101828' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: META_FILL } }
    cell.alignment = { vertical: 'middle', horizontal: column?.align || 'left' }
    if (column?.type === 'money') cell.numFmt = '¥#,##0.00;[Red]-¥#,##0.00'
    applyBorder(cell)
  })
}

export async function buildLedgerEntriesWorkbook(entries, config) {
  const ExcelJS = await import('exceljs').then((module) => module.default || module)
  const columns = getColumns(config.columnKeys)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'personal-fullstack-blog'
  workbook.created = new Date()
  workbook.modified = new Date()

  const sheet = workbook.addWorksheet('流水明细', {
    views: config.options.freezeHeader ? [{ state: 'frozen', ySplit: config.options.includeMeta ? 4 : 1 }] : []
  })

  if (config.options.includeMeta) {
    addMetaRows(sheet, config.metadata || {}, columns.length)
  }

  sheet.columns = columns.map((column) => ({
    key: column.key,
    width: column.width,
    style: { alignment: { vertical: 'middle', horizontal: column.align || 'left' } }
  }))

  const headerRow = sheet.addRow(columns.map((column) => column.title))
  styleHeader(headerRow)

  entries.forEach((record) => {
    const row = sheet.addRow(columns.map((column) => makeCellValue(record, column)))
    styleDataRow(row, record, columns, config.options)
  })

  if (config.options.summaryRow && entries.length) {
    addSummaryRow(sheet, entries, columns)
  }

  if (config.options.autoFilter) {
    const headerRowNumber = config.options.includeMeta ? 4 : 1
    sheet.autoFilter = {
      from: { row: headerRowNumber, column: 1 },
      to: { row: headerRowNumber, column: columns.length }
    }
  }

  sheet.eachRow((row) => {
    row.height = Math.max(row.height || 0, 22)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}
