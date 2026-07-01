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
  exportBookmarksAsHtml,
  exportBookmarksAsJson,
  importBookmarksFromHtml,
  importBookmarksFromJson,
  listBookmarkFolders,
  listBookmarks,
  moveBookmarks,
  reorderBookmarkFolders,
  reorderBookmarks,
  updateBookmark,
  updateBookmarkFolder
} from '#modules/bookmark/services/bookmark.service.js'
import {
  bookmarkCreateSchema,
  bookmarkFolderCreateSchema,
  bookmarkFolderReorderSchema,
  bookmarkFolderUpdateSchema,
  bookmarkMoveSchema,
  bookmarkQuerySchema,
  bookmarkReorderSchema,
  bookmarkUpdateSchema,
  parseBody
} from '#modules/bookmark/validators/bookmark.validator.js'

export const bookmarkRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024,
    files: 1
  }
})

function handleBookmarkUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (error instanceof MulterError) {
      error.statusCode = 400
      error.code = error.code || 'BOOKMARK_IMPORT_UPLOAD_ERROR'
      error.message = error.code === 'LIMIT_FILE_SIZE'
        ? '书签文件不能超过 12MB'
        : '单次只能上传 1 个书签文件'
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

bookmarkRouter.get('/folders', asyncHandler(async (req, res) => {
  res.json(ok(await listBookmarkFolders(req.user._id)))
}))

bookmarkRouter.post('/folders', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkFolderCreateSchema, req.body)
  res.status(201).json(ok(await createBookmarkFolder(req.user._id, input), '文件夹已创建'))
}))

bookmarkRouter.patch('/folders/reorder', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkFolderReorderSchema, req.body)
  res.json(ok(await reorderBookmarkFolders(req.user._id, input), '文件夹排序已更新'))
}))

bookmarkRouter.patch('/folders/:id', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkFolderUpdateSchema, req.body)
  res.json(ok(await updateBookmarkFolder(req.user._id, req.params.id, input), '文件夹已更新'))
}))

bookmarkRouter.delete('/folders/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteBookmarkFolder(req.user._id, req.params.id), '文件夹已删除'))
}))

bookmarkRouter.get('/bookmarks', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkQuerySchema, req.query)
  res.json(ok(await listBookmarks(req.user._id, input)))
}))

bookmarkRouter.post('/bookmarks', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkCreateSchema, req.body)
  res.status(201).json(ok(await createBookmark(req.user._id, input), '书签已创建'))
}))

bookmarkRouter.patch('/bookmarks/reorder', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkReorderSchema, req.body)
  res.json(ok(await reorderBookmarks(req.user._id, input), '书签排序已更新'))
}))

bookmarkRouter.patch('/bookmarks/move', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkMoveSchema, req.body)
  res.json(ok(await moveBookmarks(req.user._id, input), '书签已移动'))
}))

bookmarkRouter.patch('/bookmarks/:id', asyncHandler(async (req, res) => {
  const input = parseBody(bookmarkUpdateSchema, req.body)
  res.json(ok(await updateBookmark(req.user._id, req.params.id, input), '书签已更新'))
}))

bookmarkRouter.delete('/bookmarks/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteBookmark(req.user._id, req.params.id), '书签已删除'))
}))

bookmarkRouter.post('/imports/html', handleBookmarkUpload, asyncHandler(async (req, res) => {
  res.json(ok(await importBookmarksFromHtml(req.user._id, req.file), '书签 HTML 已合并'))
}))

bookmarkRouter.post('/imports/json', handleBookmarkUpload, asyncHandler(async (req, res) => {
  res.json(ok(await importBookmarksFromJson(req.user._id, req.file), '书签 JSON 已恢复'))
}))

bookmarkRouter.get('/exports/html', asyncHandler(async (req, res) => {
  setDownloadHeaders(res, 'bookmarks.html', 'text/html; charset=utf-8')
  res.send(await exportBookmarksAsHtml(req.user._id))
}))

bookmarkRouter.get('/exports/json', asyncHandler(async (req, res) => {
  setDownloadHeaders(res, 'bookmarks-backup.json', 'application/json; charset=utf-8')
  res.send(JSON.stringify(await exportBookmarksAsJson(req.user._id), null, 2))
}))
