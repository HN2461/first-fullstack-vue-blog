import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import mammoth from 'mammoth'
import { env } from '#config/env'
import { ARTICLE_STATUS } from '#constants/domain'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { Media } from '#modules/media/models/Media.js'
import { createMediaFromFile, getUploadSubdir } from '#modules/media/services/media.service.js'
import { buildSafeStoredFilename, decodeUploadFilename } from '#utils/uploadFilename.js'
import { createArticle } from './article.service.js'

const execFileAsync = promisify(execFile)
const DOCUMENT_MEDIA_CATEGORY = '文章原始文档'
const DOCUMENT_PREVIEW_CATEGORY = '文章阅读版'
const CONVERSION_TIMEOUT_MS = 120000

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function normalizeText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function getDocumentTitle(fileName) {
  return (normalizeText(path.basename(fileName, path.extname(fileName))) || '未命名文档').slice(0, 120)
}

function buildSummary(extractedText) {
  const text = normalizeText(extractedText)
  if (!text) return 'Word 文档资料'
  return text.length > 180 ? `${text.slice(0, 180)}...` : text
}

async function assertReferencesExist(input) {
  if (input.category) {
    const categoryExists = await Category.exists({ _id: input.category })
    if (!categoryExists) {
      throw createHttpError(404, 'CATEGORY_NOT_FOUND', '所选分类不存在')
    }
  }

  if (input.tags?.length) {
    const tagCount = await Tag.countDocuments({ _id: { $in: input.tags } })
    if (tagCount !== new Set(input.tags).size) {
      throw createHttpError(404, 'TAG_NOT_FOUND', '部分标签不存在')
    }
  }
}

function getOfficeConverterCandidates() {
  const candidates = [env.officeConverterPath]
  if (process.platform === 'win32') {
    candidates.push(
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe'
    )
  }
  candidates.push('soffice')
  return [...new Set(candidates.map((item) => String(item || '').trim()).filter(Boolean))]
}

async function runOfficeConversion(sourcePath, outputDir) {
  let lastError = null

  for (const executable of getOfficeConverterCandidates()) {
    try {
      await execFileAsync(executable, [
        '--headless',
        '--convert-to',
        'pdf',
        '--outdir',
        outputDir,
        sourcePath
      ], {
        timeout: CONVERSION_TIMEOUT_MS,
        windowsHide: true,
        maxBuffer: 1024 * 1024
      })
      const files = await fs.readdir(outputDir)
      const pdfName = files.find((item) => path.extname(item).toLowerCase() === '.pdf')
      if (pdfName) return path.join(outputDir, pdfName)
    } catch (error) {
      lastError = error
    }
  }

  if (lastError?.killed) {
    return { error: 'Word 转 PDF 超时，已改用 DOCX 只读模式' }
  }
  return { error: '服务器暂未提供 Word 转 PDF 环境，已改用 DOCX 只读模式' }
}

async function createPdfPreview(sourceFile, originalName, user) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-doc-'))

  try {
    const conversionResult = await runOfficeConversion(sourceFile.path, tempDir)
    if (!conversionResult || typeof conversionResult !== 'string') {
      return {
        media: null,
        message: conversionResult?.error || '未生成 PDF 阅读版'
      }
    }

    const uploadDir = getUploadSubdir()
    await fs.mkdir(uploadDir, { recursive: true })
    const previewOriginalName = `${path.basename(originalName, path.extname(originalName))}-阅读版.pdf`
    const filename = `${Date.now()}-${buildSafeStoredFilename(previewOriginalName)}`
    const destination = path.join(uploadDir, filename)
    await fs.copyFile(conversionResult, destination)
    const stats = await fs.stat(destination)
    const media = await createMediaFromFile({
      path: destination,
      filename,
      originalname: previewOriginalName,
      mimetype: 'application/pdf',
      size: stats.size
    }, user, { category: DOCUMENT_PREVIEW_CATEGORY })

    return { media, message: '' }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

async function cleanupMedia(mediaItems = []) {
  for (const item of mediaItems.filter(Boolean)) {
    const media = await Media.findById(item.id)
    if (!media) continue
    await fs.unlink(media.storagePath).catch((error) => {
      if (error.code !== 'ENOENT') throw error
    })
    await Media.deleteOne({ _id: media._id })
  }
}

export async function importDocumentArticle(file, input, user) {
  if (!file?.path) {
    throw createHttpError(400, 'DOCUMENT_FILE_REQUIRED', '请选择要导入的 Word 文档')
  }

  const originalName = decodeUploadFilename(file.originalname || '')
  if (path.extname(originalName).toLowerCase() !== '.docx') {
    throw createHttpError(400, 'DOCUMENT_FORMAT_UNSUPPORTED', '当前文档型文章仅支持 .docx 文件')
  }

  await assertReferencesExist(input)
  const extracted = await mammoth.extractRawText({ path: file.path })
  const extractedText = normalizeText(extracted.value)
  const createdMedia = []

  try {
    const originalMedia = await createMediaFromFile(file, user, { category: DOCUMENT_MEDIA_CATEGORY })
    createdMedia.push(originalMedia)
    const previewResult = await createPdfPreview(file, originalName, user)
    if (previewResult.media) createdMedia.push(previewResult.media)

    const article = await createArticle({
      title: normalizeText(input.title) || getDocumentTitle(originalName),
      summary: normalizeText(input.summary) || buildSummary(extractedText),
      contentMode: 'document',
      contentMarkdown: '',
      document: {
        originalMediaId: originalMedia.id,
        originalName,
        originalUrl: originalMedia.url,
        mimeType: originalMedia.mimeType,
        previewMediaId: previewResult.media?.id || null,
        previewUrl: previewResult.media?.url || '',
        previewMimeType: previewResult.media?.mimeType || '',
        extractedText,
        conversionStatus: 'ready',
        conversionMessage: previewResult.message,
        convertedAt: new Date()
      },
      category: input.category || null,
      tags: input.tags || [],
      status: ARTICLE_STATUS.DRAFT,
      sourcePath: originalName,
      importedAt: new Date()
    }, user)

    return {
      article,
      readerMode: previewResult.media ? 'pdf' : 'docx',
      conversionMessage: previewResult.message
    }
  } catch (error) {
    await cleanupMedia(createdMedia)
    throw error
  }
}
