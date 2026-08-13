import fs from 'node:fs'
import path from 'node:path'
import multer, { MulterError } from 'multer'
import { getMediaFileExtension, isMediaExtensionAllowed, normalizeAllowedMediaExtensions } from '#modules/media/constants/mediaUpload.constants.js'
import { createMediaFromFiles, getUploadSubdir } from '#modules/media/services/media.service.js'
import { acquireMediaUpload, assertMediaUploadTotalSize, cleanupMediaUploadPaths } from '#modules/media/services/mediaUploadGuard.service.js'
import { getSettings } from '#modules/settings/services/setting.service.js'
import { ok } from '#utils/apiResponse.js'
import { buildSafeStoredFilename } from '#utils/uploadFilename.js'

const ABSOLUTE_MAX_MEDIA_FILES = 20
const ABSOLUTE_MAX_MEDIA_FILE_SIZE_MB = 1024

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const uploadDir = req.mediaUploadDir || getUploadSubdir()
    req.mediaUploadDir = uploadDir
    fs.mkdirSync(uploadDir, { recursive: true })
    callback(null, uploadDir)
  },
  filename(req, file, callback) {
    const safeName = buildSafeStoredFilename(file.originalname)
    const filename = `${Date.now()}-${safeName}`
    req.mediaUploadPaths ||= []
    req.mediaUploadPaths.push(path.join(req.mediaUploadDir, filename))
    callback(null, filename)
  }
})

const mediaUpload = multer({
  storage,
  limits: {
    fileSize: ABSOLUTE_MAX_MEDIA_FILE_SIZE_MB * 1024 * 1024
  }
})

function createUploadError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function getUploadedFiles(req) {
  return [
    ...(req.files?.files || []),
    ...(req.files?.file || [])
  ]
}

async function getMediaUploadRules() {
  const settings = await getSettings()
  return {
    maxFiles: Number(settings.mediaMaxFilesPerUpload) || 5,
    maxFileSizeMB: Number(settings.mediaMaxFileSizeMB) || 20,
    allowedExtensions: normalizeAllowedMediaExtensions(settings.mediaAllowedExtensions)
  }
}

function normalizeMulterError(error) {
  if (!(error instanceof MulterError)) return error

  error.statusCode = 400
  error.code = error.code || 'UPLOAD_ERROR'
  if (error.code === 'LIMIT_FILE_SIZE') {
    error.message = `文件大小不能超过 ${ABSOLUTE_MAX_MEDIA_FILE_SIZE_MB}MB`
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = `单次最多上传 ${ABSOLUTE_MAX_MEDIA_FILES} 个文件`
  }
  return error
}

async function validateMediaFiles(files) {
  if (files.length === 0) {
    throw createUploadError(400, 'FILE_REQUIRED', '请选择要上传的文件')
  }

  assertMediaUploadTotalSize(files)
  const rules = await getMediaUploadRules()
  if (files.length > rules.maxFiles) {
    throw createUploadError(400, 'MEDIA_UPLOAD_COUNT_LIMIT', `单次最多上传 ${rules.maxFiles} 个文件`)
  }

  if (files.some((file) => file.size > rules.maxFileSizeMB * 1024 * 1024)) {
    throw createUploadError(400, 'MEDIA_UPLOAD_SIZE_LIMIT', `单文件大小不能超过 ${rules.maxFileSizeMB}MB`)
  }

  const unsupported = files.find((file) => !isMediaExtensionAllowed(file.originalname, rules.allowedExtensions))
  if (unsupported) {
    const extension = getMediaFileExtension(unsupported.originalname) || '无扩展名'
    throw createUploadError(400, 'MEDIA_UPLOAD_EXTENSION_NOT_ALLOWED', `当前上传限制不支持 ${extension} 文件`)
  }
}

export function handleMediaUpload(req, res, next) {
  let releaseUpload = null
  let completed = false
  let aborted = false
  let finishPromise = null

  const finishUpload = ({ cleanup = false } = {}) => {
    if (finishPromise) return finishPromise
    finishPromise = (async () => {
      try {
        if (cleanup) await cleanupMediaUploadPaths(req.mediaUploadPaths || [])
      } finally {
        releaseUpload?.()
        releaseUpload = null
      }
    })()
    return finishPromise
  }

  req.once('aborted', () => {
    aborted = true
    if (!completed) finishUpload({ cleanup: true }).catch(() => {})
  })

  acquireMediaUpload(req.headers['content-length'])
    .then((release) => {
      if (aborted) {
        release()
        return
      }
      releaseUpload = release
      mediaUpload.fields([
        { name: 'files', maxCount: ABSOLUTE_MAX_MEDIA_FILES },
        { name: 'file', maxCount: 1 }
      ])(req, res, async (error) => {
        if (aborted) {
          await finishUpload({ cleanup: true }).catch(() => {})
          return
        }
        if (error) {
          await finishUpload({ cleanup: true }).catch(() => {})
          next(normalizeMulterError(error))
          return
        }

        try {
          const files = getUploadedFiles(req)
          await validateMediaFiles(files)
          const result = await createMediaFromFiles(files, req.user, {
            category: req.body?.category,
            categoryId: req.body?.categoryId
          })
          completed = true
          await finishUpload()
          res.status(201).json(ok(result.total === 1 ? result.items[0] : result, `已上传 ${result.total} 个文件`))
        } catch (handlerError) {
          await finishUpload({ cleanup: true }).catch(() => {})
          next(handlerError)
        }
      })
    })
    .catch(next)
}
