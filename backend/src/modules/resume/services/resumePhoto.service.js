import fs from 'node:fs'
import path from 'node:path'
import multer, { MulterError } from 'multer'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import { findOwnedResume } from './resume.service.js'

const PHOTO_DIR_NAME = 'resumes'
const photoDir = path.join(resolveUploadRoot(), PHOTO_DIR_NAME)
fs.mkdirSync(photoDir, { recursive: true })

const extensionByMimeType = {
  'image/jpeg': '.jpg'
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => callback(null, photoDir),
    filename: (req, file, callback) => {
      callback(null, `${req.params.id}-${Date.now()}${extensionByMimeType[file.mimetype] || '.jpg'}`)
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (extensionByMimeType[file.mimetype]) {
      callback(null, true)
      return
    }
    const error = new Error('为保证 PDF 和 Word 导出一致，证件照仅支持 JPG 格式')
    error.statusCode = 400
    error.code = 'INVALID_RESUME_PHOTO_TYPE'
    callback(error)
  }
})

export function handleResumePhotoUpload(req, res, next) {
  upload.single('photo')(req, res, (error) => {
    if (error instanceof MulterError) {
      error.statusCode = 400
      if (error.code === 'LIMIT_FILE_SIZE') error.message = '证件照大小不能超过 5MB'
    }
    next(error)
  })
}

export async function saveResumePhoto(resumeId, userId, file) {
  if (!file) {
    const error = new Error('请选择要上传的证件照')
    error.statusCode = 400
    error.code = 'RESUME_PHOTO_REQUIRED'
    throw error
  }

  const resume = await findOwnedResume(resumeId, userId)
  const oldPhotoUrl = String(resume.sections?.profile?.photoUrl || '')
  resume.sections = {
    ...(resume.sections || {}),
    profile: {
      ...(resume.sections?.profile || {}),
      photoUrl: `/uploads/${PHOTO_DIR_NAME}/${file.filename}`
    }
  }
  resume.version = (resume.version || 1) + 1
  resume.markModified('sections')
  await resume.save()

  // 只清理简历专属目录中的旧文件，站内媒体地址和外部图片绝不联动删除。
  const prefix = `/uploads/${PHOTO_DIR_NAME}/`
  if (oldPhotoUrl.startsWith(prefix) && oldPhotoUrl !== resume.sections.profile.photoUrl) {
    const oldFilename = path.basename(oldPhotoUrl)
    await fs.promises.unlink(path.join(photoDir, oldFilename)).catch(() => {})
  }

  return resume.toSafeJSON()
}
