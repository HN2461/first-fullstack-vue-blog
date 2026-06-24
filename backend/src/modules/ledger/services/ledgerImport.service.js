import crypto from 'node:crypto'
import * as XLSX from 'xlsx'
import { LedgerCategory } from '#modules/ledger/models/LedgerCategory.js'
import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { LedgerImportBatch } from '#modules/ledger/models/LedgerImportBatch.js'
import { createError, formatDay, parseAmount, startOfDay, toObjectId } from './ledger.utils.js'
import { seedDefaultCategories } from './ledgerBook.service.js'
import { findOwnedBook } from './ledgerBook.service.js'
import { getCategoryMap, getOrCreateCategoryByName } from './ledgerCategory.service.js'

const DERIVED_COLUMNS = new Set(['当日吃饭总支出', '当日总支出', '当日逆差'])
const NOTE_COLUMN = '当日备注'
const DATE_COLUMN = '日期'
const TEMPLATE_TYPE = 'yuque_monthly_ledger_v1'

function parseExcelDate(value) {
  if (value instanceof Date) return startOfDay(value)
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return null
    return startOfDay(new Date(parsed.y, parsed.m - 1, parsed.d))
  }

  const text = String(value || '').trim()
  if (!text) return null
  const normalized = text.replace(/[年月.]/g, '/').replace(/日/g, '')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : startOfDay(date)
}

function readCellComment(sheet, rowIndex, columnIndex) {
  const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })
  const comments = sheet[address]?.c || []
  return comments
    .map((comment) => String(comment.t || comment.h || '').replace(/<br\s*\/?>/gi, '\n').trim())
    .filter(Boolean)
    .join('\n')
    .slice(0, 500)
}

function classifyExcelColumn(header, categoryMap) {
  const name = String(header || '').trim()
  if (!name || name === DATE_COLUMN || name === NOTE_COLUMN || DERIVED_COLUMNS.has(name)) return null
  const existing = categoryMap.byName.get(name.toLowerCase())
  if (existing) return { name, type: existing.type, category: existing }

  if (['工资', '奖金', '其他收入'].includes(name)) {
    return { name, type: 'income', category: null }
  }

  return { name, type: 'expense', category: null }
}

async function getExistingEntryKeySet(userId, bookId) {
  const entries = await LedgerEntry.find({ userId, bookId })
    .select('occurredAt type categoryId')
    .lean()

  return new Set(entries.map((entry) => {
    return `${formatDay(entry.occurredAt)}:${entry.type}:${entry.categoryId.toString()}`
  }))
}

async function parseYuqueWorkbook(buffer, userId, bookId) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const categoryMap = await getCategoryMap(userId, bookId)
  const existingEntryKeys = await getExistingEntryKeySet(userId, bookId)
  const previewItems = []
  const errors = []
  let skipped = 0
  let sheetCount = 0

  for (const sheetName of workbook.SheetNames) {
    if (sheetName.trim() === '模版') {
      skipped += 1
      continue
    }

    if (!/\d{4}年\d{1,2}月份收支明细/.test(sheetName)) {
      skipped += 1
      continue
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: ''
    })
    const headerRowIndex = rows.findIndex((row) => String(row?.[0] || '').trim() === DATE_COLUMN)
    if (headerRowIndex < 0) {
      errors.push({ sheetName, row: 0, message: '未找到日期表头行' })
      continue
    }

    sheetCount += 1
    const headers = rows[headerRowIndex].map((item) => String(item || '').trim())
    const columns = headers.map((header, index) => ({
      header,
      index,
      ...classifyExcelColumn(header, categoryMap)
    })).filter((item) => item.name && item.type)
    const noteIndex = headers.findIndex((header) => header === NOTE_COLUMN)

    for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] || []
      const occurredAt = parseExcelDate(row[0])
      if (!occurredAt) {
        if (row.some((cell) => String(cell || '').trim())) {
          errors.push({ sheetName, row: rowIndex + 1, message: '日期格式不正确' })
        }
        continue
      }

      const dailyNote = noteIndex >= 0 ? String(row[noteIndex] || '').trim() : ''
      for (const column of columns) {
        const amount = parseAmount(row[column.index])
        if (amount === null || amount === 0) {
          skipped += 1
          continue
        }

        if (amount < 0) {
          errors.push({ sheetName, row: rowIndex + 1, column: column.header, message: '金额不能为负数' })
          continue
        }

        const category = column.category || await getOrCreateCategoryByName(userId, bookId, column.name, column.type)
        if (!column.category) {
          column.category = category
          categoryMap.byName.set(category.name.toLowerCase(), category)
          categoryMap.byId.set(category._id.toString(), category)
        }

        const sourceKey = `${formatDay(occurredAt)}:${column.type}:${category._id.toString()}`
        const note = readCellComment(sheet, rowIndex, column.index)
        previewItems.push({
          action: existingEntryKeys.has(sourceKey) ? 'update' : 'insert',
          sheetName,
          rowNumber: rowIndex + 1,
          sourceKey,
          occurredAt,
          type: column.type,
          categoryId: category._id.toString(),
          categoryName: category.name,
          amount,
          note,
          dailyNote,
          raw: {
            date: row[0],
            header: column.header,
            value: row[column.index],
            cellNote: note,
            dailyNote
          }
        })
      }
    }
  }

  return { previewItems, errors, skipped, sheetCount }
}

export async function previewLedgerImport(userId, input, file) {
  if (!file?.buffer) {
    throw createError(400, 'LEDGER_IMPORT_FILE_REQUIRED', '请上传 Excel 文件')
  }
  if (!/\.xlsx?$/i.test(file.originalname || '')) {
    throw createError(400, 'LEDGER_IMPORT_FILE_TYPE_INVALID', '仅支持 xlsx/xls 文件')
  }

  const book = await findOwnedBook(input.bookId, userId)
  await seedDefaultCategories(userId, book._id)
  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex')
  const parsed = await parseYuqueWorkbook(file.buffer, userId, book._id)
  const inserted = parsed.previewItems.filter((item) => item.action === 'insert').length
  const updated = parsed.previewItems.filter((item) => item.action === 'update').length
  const batch = await LedgerImportBatch.create({
    userId,
    bookId: book._id,
    filename: file.originalname || 'ledger.xlsx',
    fileHash,
    templateType: TEMPLATE_TYPE,
    status: 'previewed',
    stats: {
      inserted,
      updated,
      skipped: parsed.skipped,
      errors: parsed.errors.length,
      sheets: parsed.sheetCount,
      records: parsed.previewItems.length
    },
    previewItems: parsed.previewItems,
    errorItems: parsed.errors
  })

  return batch.toSafeJSON({ includePreview: true })
}

export async function commitLedgerImport(userId, id) {
  const batchId = toObjectId(id, 'LEDGER_IMPORT_NOT_FOUND', '导入批次不存在')
  const batch = await LedgerImportBatch.findOne({ _id: batchId, userId })
  if (!batch) {
    throw createError(404, 'LEDGER_IMPORT_NOT_FOUND', '导入批次不存在')
  }
  if (batch.status === 'committed') {
    return batch.toSafeJSON({ includePreview: true })
  }

  await findOwnedBook(batch.bookId, userId)
  const categoryIds = [...new Set((batch.previewItems || []).map((item) => item.categoryId?.toString()).filter(Boolean))]
  const categories = await LedgerCategory.find({
    _id: { $in: categoryIds },
    userId,
    bookId: batch.bookId
  })
  const categoryMap = new Map(categories.map((category) => [category._id.toString(), category]))
  if (categoryMap.size !== categoryIds.length) {
    throw createError(404, 'LEDGER_CATEGORY_NOT_FOUND', '分类不存在')
  }

  const operations = []

  for (const item of batch.previewItems || []) {
    const category = categoryMap.get(item.categoryId?.toString())
    const occurredAt = startOfDay(item.occurredAt)
    const payload = {
      userId,
      bookId: batch.bookId,
      occurredAt,
      type: item.type,
      categoryId: category._id,
      categoryNameSnapshot: category.name,
      amount: item.amount,
      note: item.note || '',
      dailyNote: item.dailyNote || '',
      source: 'excel_import',
      sourceKey: item.sourceKey,
      importBatchId: batch._id,
      raw: item.raw || null
    }
    operations.push({
      updateOne: {
        filter: {
          userId,
          bookId: batch.bookId,
          occurredAt,
          type: item.type,
          categoryId: category._id
        },
        update: { $set: payload },
        upsert: true
      }
    })
  }

  let inserted = 0
  let updated = 0
  if (operations.length) {
    const result = await LedgerEntry.bulkWrite(operations, { ordered: false })
    inserted = result.upsertedCount || 0
    updated = (result.modifiedCount || 0) + (result.matchedCount || 0) - inserted
  }

  batch.status = 'committed'
  batch.stats.inserted = inserted
  batch.stats.updated = updated
  batch.committedAt = new Date()
  await batch.save()

  return batch.toSafeJSON({ includePreview: true })
}

export async function listLedgerImports(userId, options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = { userId }
  if (options.bookId) {
    await findOwnedBook(options.bookId, userId)
    query.bookId = options.bookId
  }
  const skip = (page - 1) * pageSize
  const [items, total] = await Promise.all([
    LedgerImportBatch.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    LedgerImportBatch.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}
