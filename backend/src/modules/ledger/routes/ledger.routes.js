import multer from 'multer'
import { Router } from 'express'
import { MulterError } from 'multer'
import { requireAnyMenuAccess, requireAuth } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import {
  createLedgerBook,
  listLedgerBooks,
  updateLedgerBook
} from '#modules/ledger/services/ledgerBook.service.js'
import {
  createLedgerCategory,
  listLedgerCategories,
  updateLedgerCategory
} from '#modules/ledger/services/ledgerCategory.service.js'
import {
  batchUpdateLedgerEntries,
  createLedgerEntry,
  deleteLedgerEntry,
  listLedgerEntries,
  updateLedgerEntry
} from '#modules/ledger/services/ledgerEntry.service.js'
import {
  getLedgerDailyMatrix,
  getLedgerInsights,
  getLedgerSummary
} from '#modules/ledger/services/ledgerSummary.service.js'
import {
  commitLedgerImport,
  listLedgerImports,
  previewLedgerImport
} from '#modules/ledger/services/ledgerImport.service.js'
import {
  createLedgerMoment,
  deleteLedgerMoment,
  listLedgerMoments,
  updateLedgerMoment
} from '#modules/ledger/services/ledgerMoment.service.js'
import {
  ledgerBookCreateSchema,
  ledgerBookUpdateSchema,
  ledgerCategoryCreateSchema,
  ledgerCategoryUpdateSchema,
  ledgerDailyQuerySchema,
  ledgerEntryBatchUpdateSchema,
  ledgerEntryCreateSchema,
  ledgerEntryQuerySchema,
  ledgerEntryUpdateSchema,
  ledgerImportPreviewSchema,
  ledgerImportQuerySchema,
  ledgerInsightsQuerySchema,
  ledgerMomentCreateSchema,
  ledgerMomentQuerySchema,
  ledgerMomentUpdateSchema,
  ledgerSummaryQuerySchema,
  parseBody
} from '#modules/ledger/validators/ledger.validator.js'

export const ledgerRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1
  }
})

function handleImportUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (error instanceof MulterError) {
      error.statusCode = 400
      error.code = error.code || 'LEDGER_IMPORT_UPLOAD_ERROR'
      if (error.code === 'LIMIT_FILE_SIZE') {
        error.message = 'Excel 文件不能超过 8MB'
      } else if (error.code === 'LIMIT_UNEXPECTED_FILE' || error.code === 'LIMIT_FILE_COUNT') {
        error.message = '单次只能上传 1 个 Excel 文件'
      }
    }
    next(error)
  })
}

const canAccessLedger = requireAnyMenuAccess([
  '/console/ledger/overview',
  '/console/ledger/entries',
  '/console/ledger/daily',
  '/console/ledger/moments'
])
const canAccessLedgerOverview = requireAnyMenuAccess(['/console/ledger/overview'])
const canAccessLedgerEntries = requireAnyMenuAccess(['/console/ledger/entries', '/console/ledger/daily'])
const canAccessLedgerCategories = requireAnyMenuAccess(['/console/ledger/overview'])
const canAccessLedgerImports = requireAnyMenuAccess(['/console/ledger/overview'])
const canAccessLedgerDaily = requireAnyMenuAccess(['/console/ledger/daily'])
const canAccessLedgerMoments = requireAnyMenuAccess(['/console/ledger/moments'])

ledgerRouter.use(requireAuth)

ledgerRouter.get('/books', canAccessLedger, asyncHandler(async (req, res) => {
  res.json(ok(await listLedgerBooks(req.user._id, req.query)))
}))

ledgerRouter.post('/books', canAccessLedgerEntries, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerBookCreateSchema, req.body)
  res.status(201).json(ok(await createLedgerBook(req.user._id, input), '账本已创建'))
}))

ledgerRouter.patch('/books/:id', canAccessLedgerEntries, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerBookUpdateSchema, req.body)
  res.json(ok(await updateLedgerBook(req.user._id, req.params.id, input), '账本已更新'))
}))

ledgerRouter.get('/categories', canAccessLedger, asyncHandler(async (req, res) => {
  res.json(ok(await listLedgerCategories(req.user._id, req.query)))
}))

ledgerRouter.post('/categories', canAccessLedgerCategories, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerCategoryCreateSchema, req.body)
  res.status(201).json(ok(await createLedgerCategory(req.user._id, input), '分类已创建'))
}))

ledgerRouter.patch('/categories/:id', canAccessLedgerCategories, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerCategoryUpdateSchema, req.body)
  res.json(ok(await updateLedgerCategory(req.user._id, req.params.id, input), '分类已更新'))
}))

ledgerRouter.get('/entries', canAccessLedgerEntries, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerEntryQuerySchema, req.query)
  res.json(ok(await listLedgerEntries(req.user._id, input)))
}))

ledgerRouter.post('/entries', canAccessLedgerEntries, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerEntryCreateSchema, req.body)
  res.status(201).json(ok(await createLedgerEntry(req.user._id, input), '流水已创建'))
}))

ledgerRouter.patch('/entries/batch', canAccessLedgerEntries, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerEntryBatchUpdateSchema, req.body)
  res.json(ok(await batchUpdateLedgerEntries(req.user._id, input), '流水已批量更新'))
}))

ledgerRouter.patch('/entries/:id', canAccessLedgerEntries, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerEntryUpdateSchema, req.body)
  res.json(ok(await updateLedgerEntry(req.user._id, req.params.id, input), '流水已更新'))
}))

ledgerRouter.delete('/entries/:id', canAccessLedgerEntries, asyncHandler(async (req, res) => {
  res.json(ok(await deleteLedgerEntry(req.user._id, req.params.id), '流水已删除'))
}))

ledgerRouter.get('/summary', canAccessLedgerOverview, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerSummaryQuerySchema, req.query)
  res.json(ok(await getLedgerSummary(req.user._id, input)))
}))

ledgerRouter.get('/insights', canAccessLedgerOverview, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerInsightsQuerySchema, req.query)
  res.json(ok(await getLedgerInsights(req.user._id, input)))
}))

ledgerRouter.get('/daily', canAccessLedgerDaily, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerDailyQuerySchema, req.query)
  res.json(ok(await getLedgerDailyMatrix(req.user._id, input)))
}))

ledgerRouter.get('/imports', canAccessLedgerImports, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerImportQuerySchema, req.query)
  res.json(ok(await listLedgerImports(req.user._id, input)))
}))

ledgerRouter.post('/imports/preview', canAccessLedgerImports, handleImportUpload, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerImportPreviewSchema, req.body)
  res.json(ok(await previewLedgerImport(req.user._id, input, req.file), 'Excel 解析完成'))
}))

ledgerRouter.post('/imports/:id/commit', canAccessLedgerImports, asyncHandler(async (req, res) => {
  res.json(ok(await commitLedgerImport(req.user._id, req.params.id), '账本导入已合并'))
}))

ledgerRouter.get('/moments', canAccessLedgerMoments, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerMomentQuerySchema, req.query)
  res.json(ok(await listLedgerMoments(req.user._id, input)))
}))

ledgerRouter.post('/moments', canAccessLedgerMoments, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerMomentCreateSchema, req.body)
  res.status(201).json(ok(await createLedgerMoment(req.user._id, input), '重要记录已创建'))
}))

ledgerRouter.patch('/moments/:id', canAccessLedgerMoments, asyncHandler(async (req, res) => {
  const input = parseBody(ledgerMomentUpdateSchema, req.body)
  res.json(ok(await updateLedgerMoment(req.user._id, req.params.id, input), '重要记录已更新'))
}))

ledgerRouter.delete('/moments/:id', canAccessLedgerMoments, asyncHandler(async (req, res) => {
  res.json(ok(await deleteLedgerMoment(req.user._id, req.params.id), '重要记录已删除'))
}))
