import { ResumeExportRecord } from '#modules/resume/models/ResumeExportRecord.js'
import { findOwnedResume } from './resume.service.js'
import { assertObjectId, createResumeError, formatCompactDate, safeFilename } from './resume.utils.js'
import { buildResumeMarkdown } from './resumeExportContent.js'
import { buildResumeDocx } from './resumeDocxExport.js'
import { buildResumePdf } from './resumePdfExport.js'

const FORMAT_META = {
  markdown: { ext: 'md', contentType: 'text/markdown; charset=utf-8' },
  pdf: { ext: 'pdf', contentType: 'application/pdf' },
  word: {
    ext: 'docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
}

async function buildExportFile(resume, format, templateKey) {
  if (format === 'word') return buildResumeDocx(resume, templateKey)
  if (format === 'pdf') return buildResumePdf(resume, templateKey)
  return Buffer.from(buildResumeMarkdown(resume), 'utf8')
}

export async function createResumeExport(userId, input) {
  const resume = await findOwnedResume(input.resumeId, userId)
  const format = input.format
  const meta = FORMAT_META[format]
  const templateKey = input.templateKey || resume.templateKey || 'classic'
  const fileData = await buildExportFile(resume.toSafeJSON(), format, templateKey)
  const filename = `${safeFilename(resume.title)}-${formatCompactDate()}.${meta.ext}`

  const record = await ResumeExportRecord.create({
    ownerId: userId,
    resumeId: resume._id,
    resumeTitle: resume.title,
    format,
    templateKey,
    filename,
    contentType: meta.contentType,
    fileData,
    fileSize: fileData.length
  })

  return record.toSafeJSON()
}

export async function listResumeExports(userId, filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 10))
  const query = { ownerId: userId }
  if (filters.resumeId) query.resumeId = filters.resumeId
  if (filters.format && filters.format !== 'all') query.format = filters.format

  const [items, total] = await Promise.all([
    ResumeExportRecord.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ResumeExportRecord.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function getResumeExportFile(id, userId) {
  assertObjectId(id, 'RESUME_EXPORT_NOT_FOUND', '导出记录不存在')
  const record = await ResumeExportRecord.findOne({ _id: id, ownerId: userId })
  if (!record) {
    throw createResumeError(404, 'RESUME_EXPORT_NOT_FOUND', '导出记录不存在')
  }

  return {
    ...record.toSafeJSON(),
    fileData: record.fileData
  }
}
