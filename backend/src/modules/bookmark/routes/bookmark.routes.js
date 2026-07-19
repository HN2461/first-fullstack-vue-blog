import multer, { MulterError } from 'multer'
import { Router } from 'express'
import { requireAuth, requireMenuAccess } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import {
  createBookmark,
  createBookmarkFolder,
  deleteBookmark,
  deleteBookmarkFolder,
  listBookmarkFolders,
  listBookmarks,
  moveBookmarks,
  reorderBookmarkFolders,
  reorderBookmarks,
  updateBookmark,
  updateBookmarkFolder
} from '../services/bookmark.service.js'
import {
  clearBookmarkWorkspace,
  createBookmarkWorkspace,
  deleteBookmarkWorkspace,
  listBookmarkWorkspaces,
  reorderBookmarkWorkspaces,
  updateBookmarkWorkspace
} from '../services/bookmarkWorkspace.service.js'
import {
  exportAllBookmarksAsJson,
  exportBookmarksAsHtml,
  exportBookmarksAsJson,
  importBookmarksFromHtml,
  importBookmarksFromJson
} from '../services/bookmarkImportExport.service.js'
import { compareBookmarkWorkspaces, copyComparisonBookmarks } from '../services/bookmarkComparison.service.js'
import {
  bookmarkComparisonCopySchema,
  bookmarkComparisonQuerySchema,
  bookmarkCreateSchema,
  bookmarkFolderCreateSchema,
  bookmarkFolderReorderSchema,
  bookmarkFolderUpdateSchema,
  bookmarkImportSchema,
  bookmarkMoveSchema,
  bookmarkQuerySchema,
  bookmarkReorderSchema,
  bookmarkUpdateSchema,
  bookmarkWorkspaceCreateSchema,
  bookmarkWorkspaceReorderSchema,
  bookmarkWorkspaceUpdateSchema,
  parseBody
} from '../validators/bookmark.validator.js'

export const bookmarkRouter = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 1 }
})

function handleBookmarkUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (error instanceof MulterError) {
      error.statusCode = 400
      error.code = error.code || 'BOOKMARK_IMPORT_UPLOAD_ERROR'
      error.message = error.code === 'LIMIT_FILE_SIZE' ? '书签文件不能超过 12MB' : '单次只能上传 1 个书签文件'
    }
    next(error)
  })
}

function setDownloadHeaders(res, filename, contentType) {
  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
}

bookmarkRouter.use(requireAuth)
bookmarkRouter.use(requireMenuAccess('/console/bookmarks'))

bookmarkRouter.get('/workspaces', asyncHandler(async (req, res) => {
  res.json(ok(await listBookmarkWorkspaces(req.user._id)))
}))

bookmarkRouter.post('/workspaces', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkWorkspaceCreateSchema, req.body)
  res.status(201).json(ok(await createBookmarkWorkspace(req.user._id, input), '书签库已创建'))
}))

bookmarkRouter.patch('/workspaces/reorder', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkWorkspaceReorderSchema, req.body)
  res.json(ok(await reorderBookmarkWorkspaces(req.user._id, input.ids), '书签库排序已更新'))
}))

bookmarkRouter.patch('/workspaces/:workspaceId', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkWorkspaceUpdateSchema, req.body)
  res.json(ok(await updateBookmarkWorkspace(req.user._id, req.params.workspaceId, input), '书签库已更新'))
}))

bookmarkRouter.delete('/workspaces/:workspaceId/content', asyncHandler(async (req, res) => {
  res.json(ok(await clearBookmarkWorkspace(req.user._id, req.params.workspaceId), '书签库内容已清空'))
}))

bookmarkRouter.delete('/workspaces/:workspaceId', asyncHandler(async (req, res) => {
  res.json(ok(await deleteBookmarkWorkspace(req.user._id, req.params.workspaceId), '书签库已删除'))
}))

bookmarkRouter.get('/workspaces/:workspaceId/folders', asyncHandler(async (req, res) => {
  res.json(ok(await listBookmarkFolders(req.user._id, req.params.workspaceId)))
}))

bookmarkRouter.post('/workspaces/:workspaceId/folders', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkFolderCreateSchema, req.body)
  res.status(201).json(ok(await createBookmarkFolder(req.user._id, req.params.workspaceId, input), '文件夹已创建'))
}))

bookmarkRouter.patch('/workspaces/:workspaceId/folders/reorder', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkFolderReorderSchema, req.body)
  res.json(ok(await reorderBookmarkFolders(req.user._id, req.params.workspaceId, input), '文件夹排序已更新'))
}))

bookmarkRouter.patch('/workspaces/:workspaceId/folders/:id', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkFolderUpdateSchema, req.body)
  res.json(ok(await updateBookmarkFolder(req.user._id, req.params.workspaceId, req.params.id, input), '文件夹已更新'))
}))

bookmarkRouter.delete('/workspaces/:workspaceId/folders/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteBookmarkFolder(req.user._id, req.params.workspaceId, req.params.id), '文件夹已删除'))
}))

bookmarkRouter.get('/workspaces/:workspaceId/bookmarks', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkQuerySchema, req.query)
  res.json(ok(await listBookmarks(req.user._id, req.params.workspaceId, input)))
}))

bookmarkRouter.post('/workspaces/:workspaceId/bookmarks', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkCreateSchema, req.body)
  res.status(201).json(ok(await createBookmark(req.user._id, req.params.workspaceId, input), '书签已创建'))
}))

bookmarkRouter.patch('/workspaces/:workspaceId/bookmarks/reorder', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkReorderSchema, req.body)
  res.json(ok(await reorderBookmarks(req.user._id, req.params.workspaceId, input), '书签排序已更新'))
}))

bookmarkRouter.patch('/workspaces/:workspaceId/bookmarks/move', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkMoveSchema, req.body)
  res.json(ok(await moveBookmarks(req.user._id, req.params.workspaceId, input), '书签已移动'))
}))

bookmarkRouter.patch('/workspaces/:workspaceId/bookmarks/:id', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkUpdateSchema, req.body)
  res.json(ok(await updateBookmark(req.user._id, req.params.workspaceId, req.params.id, input), '书签已更新'))
}))

bookmarkRouter.delete('/workspaces/:workspaceId/bookmarks/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteBookmark(req.user._id, req.params.workspaceId, req.params.id), '书签已删除'))
}))

bookmarkRouter.post('/workspaces/:workspaceId/imports/html', handleBookmarkUpload, asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkImportSchema, req.body)
  res.json(ok(await importBookmarksFromHtml(req.user._id, req.params.workspaceId, req.file, input.mode), '书签 HTML 已导入'))
}))

bookmarkRouter.post('/workspaces/:workspaceId/imports/json', handleBookmarkUpload, asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkImportSchema, req.body)
  res.json(ok(await importBookmarksFromJson(req.user._id, req.params.workspaceId, req.file, input.mode), '书签 JSON 已导入'))
}))

bookmarkRouter.get('/workspaces/:workspaceId/exports/html', asyncHandler(async (req, res) => {
  setDownloadHeaders(res, 'bookmarks.html', 'text/html; charset=utf-8')
  res.send(await exportBookmarksAsHtml(req.user._id, req.params.workspaceId))
}))

bookmarkRouter.get('/workspaces/:workspaceId/exports/json', asyncHandler(async (req, res) => {
  setDownloadHeaders(res, 'bookmarks-workspace.json', 'application/json; charset=utf-8')
  res.send(JSON.stringify(await exportBookmarksAsJson(req.user._id, req.params.workspaceId), null, 2))
}))

bookmarkRouter.get('/exports/json/all', asyncHandler(async (req, res) => {
  setDownloadHeaders(res, 'bookmarks-all-workspaces.json', 'application/json; charset=utf-8')
  res.send(JSON.stringify(await exportAllBookmarksAsJson(req.user._id), null, 2))
}))

bookmarkRouter.get('/comparisons', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkComparisonQuerySchema, req.query)
  res.json(ok(await compareBookmarkWorkspaces(req.user._id, input)))
}))

bookmarkRouter.post('/comparisons/copy', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkComparisonCopySchema, req.body)
  res.json(ok(await copyComparisonBookmarks(req.user._id, input), '书签已添加到目标书签库'))
}))
