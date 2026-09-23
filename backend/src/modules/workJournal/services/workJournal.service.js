import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'
import { Employment } from '#modules/workJournal/models/Employment.js'
import { WorkLog } from '#modules/workJournal/models/WorkLog.js'
import { WorkReport } from '#modules/workJournal/models/WorkReport.js'
import { resolvePrivateWorkJournalPath, resolvePrivateWorkJournalRoot as getPrivateWorkJournalRoot } from '#modules/workJournal/utils/workEvidenceStorage.js'
import { Media } from '#modules/media/models/Media.js'
import { assertMediaCategoryExists, ensureDefaultMediaCategory } from '#modules/media/services/mediaCategory.service.js'
import { permanentlyDeleteWorkJournalMedia } from '#modules/media/services/media.service.js'
import { decodeUploadFilename } from '#utils/uploadFilename.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'

const MAX_REVISIONS = 20
const MIME_EXTENSIONS = Object.freeze({
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
})

function createError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function toId(value) {
  return value?._id?.toString?.() || value?.toString?.() || ''
}

function assertObjectId(id, code, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw createError(404, code, message)
}

function assertDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw createError(400, 'INVALID_WORK_DATE', '日期不正确')
  }
  return value
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function resolvePrivateWorkJournalRoot() {
  return getPrivateWorkJournalRoot()
}

function resolvePrivateWorkJournalUploadPath(storagePath) {
  const root = path.resolve(resolveUploadRoot(), 'work-journal')
  const target = path.resolve(storagePath)
  const relative = path.relative(root, target)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw createError(404, 'WORK_EVIDENCE_NOT_FOUND', '凭证不存在')
  }
  return target
}

export async function findOwnedEmployment(id, userId) {
  assertObjectId(id, 'EMPLOYMENT_NOT_FOUND', '工作经历不存在')
  const employment = await Employment.findOne({ _id: id, createdBy: userId })
  if (!employment) throw createError(404, 'EMPLOYMENT_NOT_FOUND', '工作经历不存在')
  return employment
}

export async function findOwnedWorkLog(id, userId, options = {}) {
  assertObjectId(id, 'WORK_LOG_NOT_FOUND', '工作日记不存在')
  const query = { _id: id, createdBy: userId }
  if (!options.includeDeleted) query.deletedAt = null
  const log = await WorkLog.findOne(query)
  if (!log) throw createError(404, 'WORK_LOG_NOT_FOUND', '工作日记不存在')
  return log
}

export async function listEmployments(userId) {
  const items = await Employment.find({ createdBy: userId }).sort({ startedOn: -1, createdAt: -1 })
  return items.map((item) => item.toSafeJSON())
}

export async function createEmployment(userId, input) {
  assertDate(input.startedOn)
  if (input.endedOn) {
    assertDate(input.endedOn)
    if (input.endedOn < input.startedOn) throw createError(400, 'EMPLOYMENT_DATE_ORDER_INVALID', '离职日期不能早于入职日期')
  }
  const employment = await Employment.create({ ...input, createdBy: userId })
  return employment.toSafeJSON()
}

export async function updateEmployment(id, userId, input) {
  const employment = await findOwnedEmployment(id, userId)
  const startedOn = input.startedOn ?? employment.startedOn
  const endedOn = input.endedOn ?? employment.endedOn
  assertDate(startedOn)
  if (endedOn) {
    assertDate(endedOn)
    if (endedOn < startedOn) throw createError(400, 'EMPLOYMENT_DATE_ORDER_INVALID', '离职日期不能早于入职日期')
  }
  Object.assign(employment, input)
  await employment.save()
  return employment.toSafeJSON()
}

export async function deleteEmployment(id, userId) {
  const employment = await findOwnedEmployment(id, userId)
  const logs = await WorkLog.find({ employment: employment._id, createdBy: userId }).select('evidence.storedName evidence.mediaId')
  const reportCount = await WorkReport.countDocuments({ employment: employment._id, createdBy: userId })

  await WorkLog.deleteMany({ employment: employment._id, createdBy: userId })
  await WorkReport.deleteMany({ employment: employment._id, createdBy: userId })
  await employment.deleteOne()

  for (const log of logs) {
    for (const evidence of log.evidence || []) {
      if (evidence.mediaId) {
        await permanentlyDeleteWorkJournalMedia(evidence.mediaId, { _id: userId })
      } else if (evidence.storedName) {
        const filePath = resolveEvidencePath(evidence.storedName)
        await fs.promises.unlink(filePath).catch(() => {})
      }
    }
  }

  return { id: employment._id.toString(), deletedLogs: logs.length, deletedReports: reportCount }
}

function buildWorkLogQuery(userId, filters = {}) {
  const query = {
    createdBy: userId,
    deletedAt: filters.trash === true || filters.trash === 'true' ? { $ne: null } : null
  }
  if (filters.employmentId) query.employment = filters.employmentId
  if (filters.status && ['draft', 'final'].includes(filters.status)) query.status = filters.status
  if (filters.from) query.workDate = { ...query.workDate, $gte: assertDate(filters.from) }
  if (filters.to) query.workDate = { ...query.workDate, $lte: assertDate(filters.to) }
  if (filters.from && filters.to && filters.from > filters.to) {
    throw createError(400, 'WORK_DATE_RANGE_INVALID', '结束日期不能早于开始日期')
  }

  const keyword = String(filters.keyword || '').trim()
  if (keyword) {
    const regex = new RegExp(escapeRegExp(keyword), 'i')
    query.$or = ['title', 'summary', 'accomplishments', 'blockers', 'nextPlan', 'contentMarkdown']
      .map((field) => ({ [field]: regex }))
  }
  return query
}

export async function listWorkLogs(userId, filters = {}) {
  if (filters.employmentId) await findOwnedEmployment(filters.employmentId, userId)
  const query = buildWorkLogQuery(userId, filters)
  const page = Math.max(1, parseInt(filters.page, 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize, 10) || 30))
  const [items, total] = await Promise.all([
    WorkLog.find(query).sort({ workDate: -1, updatedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
    WorkLog.countDocuments(query)
  ])
  return { items: items.map((item) => item.toSafeJSON()), total, page, pageSize }
}

export async function getWorkLog(id, userId) {
  const log = await findOwnedWorkLog(id, userId, { includeDeleted: true })
  return log.toSafeJSON()
}

export async function createWorkLog(userId, input) {
  await findOwnedEmployment(input.employmentId, userId)
  assertDate(input.workDate)
  const status = input.status || 'draft'
  if (status === 'final' && !input.summary?.trim() && !input.accomplishments?.trim() && !input.contentMarkdown?.trim()) {
    throw createError(400, 'WORK_LOG_FINAL_CONTENT_REQUIRED', '请先补充工作内容，再定稿')
  }
  try {
    const log = await WorkLog.create({
      ...input,
      employment: input.employmentId,
      status,
      finalizedAt: status === 'final' ? new Date() : null,
      createdBy: userId
    })
    return log.toSafeJSON()
  } catch (error) {
    if (error?.code === 11000) throw createError(409, 'WORK_LOG_DATE_EXISTS', '该工作经历在这一天已有日记')
    throw error
  }
}

function captureRevision(log) {
  if (log.status !== 'final') return
  log.revisions.push({
    version: log.version,
    title: log.title,
    summary: log.summary,
    accomplishments: log.accomplishments,
    blockers: log.blockers,
    nextPlan: log.nextPlan,
    contentMarkdown: log.contentMarkdown,
    status: log.status,
    finalizedAt: log.finalizedAt,
    capturedAt: new Date()
  })
  if (log.revisions.length > MAX_REVISIONS) log.revisions.splice(0, log.revisions.length - MAX_REVISIONS)
}

export async function updateWorkLog(id, userId, input) {
  const log = await findOwnedWorkLog(id, userId)
  const changesContent = Object.keys(input).some((field) => field !== 'status')
  const wasFinal = log.status === 'final'
  if (input.status === 'final') {
    const finalContent = {
      title: input.title ?? log.title,
      summary: input.summary ?? log.summary,
      accomplishments: input.accomplishments ?? log.accomplishments,
      contentMarkdown: input.contentMarkdown ?? log.contentMarkdown
    }
    if (!finalContent.summary?.trim() && !finalContent.accomplishments?.trim() && !finalContent.contentMarkdown?.trim()) {
      throw createError(400, 'WORK_LOG_FINAL_CONTENT_REQUIRED', '请先补充工作内容，再定稿')
    }
  }
  if (wasFinal && (changesContent || input.status === 'draft')) {
    captureRevision(log)
  }
  if (changesContent && (wasFinal || log.revisions.length > 0)) {
    log.version += 1
  }
  for (const [key, value] of Object.entries(input)) {
    if (key === 'status') continue
    log[key] = value
  }
  if (input.status === 'final' && log.status !== 'final') {
    log.finalizedAt = new Date()
  } else if (input.status === 'draft') {
    log.finalizedAt = null
  } else if (input.status === 'final' && log.status === 'final' && changesContent) {
    log.finalizedAt = new Date()
  }
  if (input.status) log.status = input.status
  await log.save()
  return log.toSafeJSON()
}

function detectImageMime(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6))) return 'image/gif'
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  return ''
}

function resolveEvidencePath(storedName) {
  return resolvePrivateWorkJournalPath(storedName)
}

export async function addWorkEvidence(logId, userId, file) {
  const log = await findOwnedWorkLog(logId, userId)
  if (!file?.buffer?.length) throw createError(400, 'WORK_EVIDENCE_REQUIRED', '请选择要上传的图片')
  if (log.evidence.length >= 20) throw createError(400, 'WORK_EVIDENCE_COUNT_LIMIT', '一篇工作日记最多添加 20 张图片')

  const mimeType = detectImageMime(file.buffer)
  const originalName = decodeUploadFilename(file.originalname).slice(0, 180)
  const extension = path.extname(originalName).toLowerCase()
  if (!mimeType || !MIME_EXTENSIONS[mimeType]?.includes(extension) || (file.mimetype && file.mimetype !== mimeType)) {
    throw createError(400, 'WORK_EVIDENCE_TYPE_INVALID', '凭证仅支持真实格式匹配的 JPG、PNG、GIF 或 WEBP 图片')
  }

  await ensureDefaultMediaCategory()
  const category = await assertMediaCategoryExists('工作日志', userId)
  const root = path.join(resolveUploadRoot(), 'work-journal')
  const date = new Date()
  const uploadDirectory = path.join(root, String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, '0'))
  await fs.promises.mkdir(uploadDirectory, { recursive: true })
  const storedName = `${crypto.randomUUID()}${extension}`
  const filePath = path.join(uploadDirectory, storedName)
  const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex')
  await fs.promises.writeFile(filePath, file.buffer, { flag: 'wx', mode: 0o600 })
  const mediaId = new mongoose.Types.ObjectId()
  const evidence = {
    originalName,
    storedName: '',
    mediaId,
    mimeType,
    size: file.size,
    sha256,
    uploadedAt: new Date()
  }
  log.evidence.push(evidence)
  const savedEvidence = log.evidence[log.evidence.length - 1]
  const media = new Media({
    _id: mediaId,
    filename: storedName,
    originalName,
    mimeType,
    size: file.size,
    url: `/api/work-journal/media-content/${mediaId}`,
    storagePath: filePath.replace(/\\/g, '/'),
    kind: 'image',
    category: category.name,
    categoryId: category._id,
    fileClass: 'image',
    accessScope: 'private',
    sha256,
    workJournalLog: log._id,
    uploader: userId
  })
  media.workJournalEvidence = savedEvidence._id
  try {
    await media.save()
    await log.save()
  } catch (error) {
    await Media.deleteOne({ _id: media._id }).catch(() => {})
    log.evidence.pull(savedEvidence._id)
    await fs.promises.unlink(filePath).catch(() => {})
    throw error
  }
  return {
    id: savedEvidence._id.toString(),
    mediaId: media._id.toString(),
    originalName: savedEvidence.originalName,
    mimeType: savedEvidence.mimeType,
    size: savedEvidence.size,
    sha256: savedEvidence.sha256,
    uploadedAt: savedEvidence.uploadedAt
  }
}

export async function getWorkEvidence(logId, evidenceId, userId, options = {}) {
  const log = await findOwnedWorkLog(logId, userId, { includeDeleted: options.includeDeleted })
  const evidence = log.evidence.id(evidenceId)
  if (!evidence) throw createError(404, 'WORK_EVIDENCE_NOT_FOUND', '凭证不存在')
  if (evidence.mediaId) {
    const media = await Media.findOne({ _id: evidence.mediaId, uploader: userId })
    if (!media) throw createError(404, 'WORK_EVIDENCE_NOT_FOUND', '凭证不存在')
    const filePath = path.resolve(media.storagePath)
    resolvePrivateWorkJournalUploadPath(filePath)
    const contents = await fs.promises.readFile(filePath).catch(() => null)
    if (!contents) throw createError(404, 'WORK_EVIDENCE_FILE_MISSING', '凭证文件不存在')
    if (crypto.createHash('sha256').update(contents).digest('hex') !== evidence.sha256) {
      throw createError(409, 'WORK_EVIDENCE_INTEGRITY_FAILED', `凭证「${evidence.originalName}」完整性校验失败`)
    }
    return { filePath, contents, evidence: evidence.toObject() }
  }

  const filePath = resolveEvidencePath(evidence.storedName)
  const contents = await fs.promises.readFile(filePath).catch(() => null)
  if (!contents) throw createError(404, 'WORK_EVIDENCE_FILE_MISSING', '凭证文件不存在')
  if (crypto.createHash('sha256').update(contents).digest('hex') !== evidence.sha256) {
    throw createError(409, 'WORK_EVIDENCE_INTEGRITY_FAILED', `凭证「${evidence.originalName}」完整性校验失败`)
  }
  return { filePath, contents, evidence: evidence.toObject() }
}

export async function getWorkJournalMediaContent(mediaId, actor, options = {}) {
  assertObjectId(mediaId, 'MEDIA_NOT_FOUND', '媒体文件不存在')
  const media = await Media.findById(mediaId)
  if (!media || media.deletedAt || media.accessScope !== 'private' || media.category !== '工作日志') {
    throw createError(404, 'MEDIA_NOT_FOUND', '媒体文件不存在')
  }
  const actorId = toId(actor)
  if (!options.canManageAll && media.uploader.toString() !== actorId) {
    throw createError(404, 'MEDIA_NOT_FOUND', '媒体文件不存在')
  }
  const filePath = path.resolve(media.storagePath)
  resolvePrivateWorkJournalUploadPath(filePath)
  const contents = await fs.promises.readFile(filePath).catch(() => null)
  if (!contents) throw createError(404, 'MEDIA_FILE_MISSING', '媒体文件不存在')
  if (media.sha256 && crypto.createHash('sha256').update(contents).digest('hex') !== media.sha256) {
    throw createError(409, 'WORK_EVIDENCE_INTEGRITY_FAILED', `凭证「${media.originalName}」完整性校验失败`)
  }
  return { contents, media }
}

export async function deleteWorkEvidence(logId, evidenceId, userId, options = {}) {
  const log = await findOwnedWorkLog(logId, userId, { includeDeleted: options.includeDeleted })
  const evidence = log.evidence.id(evidenceId)
  if (!evidence) throw createError(404, 'WORK_EVIDENCE_NOT_FOUND', '凭证不存在')
  log.evidence.pull(evidenceId)
  await log.save()
  if (evidence.mediaId) {
    await permanentlyDeleteWorkJournalMedia(evidence.mediaId, { _id: userId })
  } else if (evidence.storedName) {
    const filePath = resolveEvidencePath(evidence.storedName)
    await fs.promises.unlink(filePath).catch(() => {})
  }
  return { deleted: true }
}

export async function deleteWorkLog(id, userId) {
  const log = await findOwnedWorkLog(id, userId)
  log.deletedAt = new Date()
  await log.save()
  await Media.updateMany(
    { _id: { $in: log.evidence.map((item) => item.mediaId).filter(Boolean) }, uploader: userId, deletedAt: null },
    { $set: { deletedAt: log.deletedAt, deletedBy: userId } }
  )
  return { id: log._id.toString(), deleted: true, deletedAt: log.deletedAt }
}

export async function permanentlyDeleteWorkLog(id, userId) {
  const log = await findOwnedWorkLog(id, userId, { includeDeleted: true })
  for (const item of log.evidence || []) {
    if (item.mediaId) {
      await permanentlyDeleteWorkJournalMedia(item.mediaId, { _id: userId })
    } else if (item.storedName) {
      const filePath = resolveEvidencePath(item.storedName)
      await fs.promises.unlink(filePath).catch(() => {})
    }
  }
  await log.deleteOne()
  return { id: log._id.toString(), deleted: true, permanent: true }
}

export async function restoreWorkLog(id, userId) {
  const log = await findOwnedWorkLog(id, userId, { includeDeleted: true })
  if (!log.deletedAt) return log.toSafeJSON()
  log.deletedAt = null
  await log.save()
  await Media.updateMany(
    { _id: { $in: log.evidence.map((item) => item.mediaId).filter(Boolean) }, uploader: userId, deletedAt: { $ne: null } },
    { $set: { deletedAt: null, deletedBy: null } }
  )
  return log.toSafeJSON()
}

function shiftDate(value, days) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function getReportRange(period, anchorDate) {
  assertDate(anchorDate)
  if (period === 'month') {
    const monthStart = `${anchorDate.slice(0, 7)}-01`
    const [year, month] = anchorDate.split('-').map(Number)
    return { from: monthStart, to: new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10) }
  }
  if (period !== 'week') throw createError(400, 'WORK_REPORT_PERIOD_INVALID', '汇总周期仅支持周或月')
  const weekday = new Date(`${anchorDate}T00:00:00.000Z`).getUTCDay()
  const offsetFromMonday = (weekday + 6) % 7
  const from = shiftDate(anchorDate, -offsetFromMonday)
  return { from, to: shiftDate(from, 6) }
}

export async function getWorkReport(userId, filters = {}) {
  await findOwnedEmployment(filters.employmentId, userId)
  const { from, to } = getReportRange(filters.period, filters.date)
  const logs = await WorkLog.find({ createdBy: userId, employment: filters.employmentId, deletedAt: null, workDate: { $gte: from, $lte: to } })
    .sort({ workDate: 1 })
  return {
    period: filters.period,
    from,
    to,
    employmentId: filters.employmentId,
    items: logs.map((item) => item.toSafeJSON())
  }
}

function renderWorkReport(period, range, logs) {
  const lines = [
    `# ${period === 'week' ? '周报' : '月报'}草稿`,
    '',
    `${range.from} 至 ${range.to}`,
    ''
  ]

  logs.forEach((log) => {
    lines.push(`## ${log.workDate} · ${log.title}`, '')
    if (log.summary) lines.push(`> ${log.summary}`, '')
    if (log.accomplishments) lines.push('### 今日完成', '', log.accomplishments, '')
    if (log.blockers) lines.push('### 阻塞与风险', '', log.blockers, '')
    if (log.nextPlan) lines.push('### 后续计划', '', log.nextPlan, '')
    if (log.contentMarkdown) lines.push('### 补充记录', '', log.contentMarkdown, '')
  })

  return lines.join('\n')
}

function workReportTitle(period, range) {
  return `${period === 'week' ? '周报' : '月报'} ${range.from} 至 ${range.to}`
}

async function findOwnedWorkReport(id, userId) {
  assertObjectId(id, 'WORK_REPORT_NOT_FOUND', '汇总记录不存在')
  const report = await WorkReport.findOne({ _id: id, createdBy: userId }).populate('employment', 'company position')
  if (!report) throw createError(404, 'WORK_REPORT_NOT_FOUND', '汇总记录不存在')
  return report
}

export async function listWorkReports(userId, filters = {}) {
  const query = { createdBy: userId }
  if (filters.employmentId) {
    await findOwnedEmployment(filters.employmentId, userId)
    query.employment = filters.employmentId
  }
  if (['week', 'month'].includes(filters.period)) query.period = filters.period
  if (['draft', 'final'].includes(filters.status)) query.status = filters.status

  const keyword = String(filters.keyword || '').trim()
  if (keyword) query.title = new RegExp(escapeRegExp(keyword), 'i')
  const page = Math.max(1, parseInt(filters.page, 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize, 10) || 30))
  const [items, total] = await Promise.all([
    WorkReport.find(query)
      .populate('employment', 'company position')
      .sort({ fromDate: -1, updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    WorkReport.countDocuments(query)
  ])
  return { items: items.map((item) => item.toSafeJSON()), total, page, pageSize }
}

export async function createWorkReport(userId, input) {
  await findOwnedEmployment(input.employmentId, userId)
  const range = getReportRange(input.period, input.date)
  const logs = await WorkLog.find({
    createdBy: userId,
    employment: input.employmentId,
    deletedAt: null,
    workDate: { $gte: range.from, $lte: range.to }
  }).sort({ workDate: 1 })
  if (!logs.length && !input.contentMarkdown?.trim()) {
    throw createError(400, 'WORK_REPORT_SOURCE_REQUIRED', '所选周期没有日报记录，请添加日报后再生成汇总')
  }

  try {
    const report = await WorkReport.create({
      employment: input.employmentId,
      period: input.period,
      fromDate: range.from,
      toDate: range.to,
      title: input.title?.trim() || workReportTitle(input.period, range),
      contentMarkdown: input.contentMarkdown ?? renderWorkReport(input.period, range, logs),
      sourceLogIds: logs.map((log) => log._id),
      status: 'draft',
      createdBy: userId
    })
    await report.populate('employment', 'company position')
    return report.toSafeJSON()
  } catch (error) {
    if (error?.code === 11000) throw createError(409, 'WORK_REPORT_EXISTS', '该周期已有汇总记录，请从列表中编辑现有报告')
    throw error
  }
}

export async function updateWorkReport(id, userId, input) {
  const report = await findOwnedWorkReport(id, userId)
  if (input.status === 'final' && !(input.contentMarkdown ?? report.contentMarkdown).trim()) {
    throw createError(400, 'WORK_REPORT_FINAL_CONTENT_REQUIRED', '请先填写汇总内容，再定稿')
  }
  if (input.title !== undefined) report.title = input.title
  if (input.contentMarkdown !== undefined) report.contentMarkdown = input.contentMarkdown
  if (input.status !== undefined) {
    report.status = input.status
    report.finalizedAt = input.status === 'final' ? new Date() : null
  }
  await report.save()
  return report.toSafeJSON()
}

export async function deleteWorkReport(id, userId) {
  const report = await findOwnedWorkReport(id, userId)
  await report.deleteOne()
  return { id: report._id.toString(), deleted: true }
}

export async function getWorkJournalExport(userId, filters = {}) {
  const employment = await findOwnedEmployment(filters.employmentId, userId)
  const query = buildWorkLogQuery(userId, filters)
  const count = await WorkLog.countDocuments(query)
  if (count > 1000) throw createError(400, 'WORK_EXPORT_LIMIT', '單次最多匯出 1000 篇日記，請縮小日期範圍')
  const logs = await WorkLog.find(query).sort({ workDate: 1, createdAt: 1 })
  const exportLogs = await Promise.all(logs.map(async (log) => ({
    log: log.toSafeJSON(),
    evidence: await Promise.all(log.evidence.map(async (item) => {
      const { filePath, contents } = await getWorkEvidence(log._id, item._id, userId)
        .catch(() => ({ filePath: '', contents: null }))
      if (!contents) {
        throw createError(409, 'WORK_EVIDENCE_INTEGRITY_FAILED', `凭证「${item.originalName}」缺失或完整性校验失败`)
      }
      return {
        filePath,
        archiveName: `${item._id}-${path.basename(item.originalName)}`,
        sha256: item.sha256,
        originalName: item.originalName
      }
    }))
  })))
  return {
    employment,
    logs: exportLogs
  }
}
