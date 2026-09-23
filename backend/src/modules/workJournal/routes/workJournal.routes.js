import archiver from 'archiver'
import multer, { MulterError } from 'multer'
import { Router } from 'express'
import { requireAnyMenuAccess, requireAuth } from '#middlewares/auth.js'
import {
  addWorkEvidence,
  createEmployment,
  createWorkReport,
  createWorkLog,
  deleteEmployment,
  deleteWorkEvidence,
  deleteWorkLog,
  deleteWorkReport,
  findOwnedWorkLog,
  getWorkEvidence,
  getWorkJournalExport,
  getWorkReport,
  listEmployments,
  getWorkLog,
  getWorkJournalMediaContent,
  listWorkReports,
  listWorkLogs,
  permanentlyDeleteWorkLog,
  restoreWorkLog,
  updateEmployment,
  updateWorkReport,
  updateWorkLog
} from '#modules/workJournal/services/workJournal.service.js'
import { employmentCreateSchema, employmentUpdateSchema, parseWorkJournalPayload, workLogCreateSchema, workLogUpdateSchema, workReportCreateSchema, workReportUpdateSchema } from '#modules/workJournal/validators/workJournal.validator.js'
import { decodeUploadFilename } from '#utils/uploadFilename.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'

export const workJournalRouter = Router()

const evidenceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 }
})

function handleEvidenceUpload(req, res, next) {
  evidenceUpload.single('file')(req, res, (error) => {
    if (error instanceof MulterError) {
      error.statusCode = 400
      error.code = error.code || 'WORK_EVIDENCE_UPLOAD_ERROR'
      if (error.code === 'LIMIT_FILE_SIZE') error.message = '单张图片不能超过 15MB'
    }
    next(error)
  })
}

function sanitizeFilename(value) {
  return String(value || 'work-journal')
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[. -]+$/g, '')
    .slice(0, 100) || 'work-journal'
}

function buildLogMarkdown(log) {
  const sections = [`# ${log.workDate} ${log.title}`, '', `状态：${log.status === 'final' ? '定稿' : '草稿'} · 版本 ${log.version}`]
  if (log.summary) sections.push('', `> ${log.summary}`)
  if (log.accomplishments) sections.push('', '## 今日完成', '', log.accomplishments)
  if (log.blockers) sections.push('', '## 阻塞与风险', '', log.blockers)
  if (log.nextPlan) sections.push('', '## 后续计划', '', log.nextPlan)
  if (log.contentMarkdown) sections.push('', '## 工作记录', '', log.contentMarkdown)
  sections.push('', `创建时间：${log.createdAt}`, `更新时间：${log.updatedAt}`)
  if (log.finalizedAt) sections.push(`定稿时间：${log.finalizedAt}`)
  sections.push('', '凭证文件按归档路径保存；SHA-256 摘要见随附 manifest.json。', '')
  return sections.join('\n')
}

workJournalRouter.use(requireAuth)
workJournalRouter.use(requireAnyMenuAccess([
  '/console/work-journal/daily',
  '/console/work-journal/weekly',
  '/console/work-journal/monthly',
  '/console/work-journal/employments',
  '/console/work-journal/trash',
  '/console/manage/media'
]))

const requireDailyAccess = requireAnyMenuAccess(['/console/work-journal/daily'])
const requireReportAccess = requireAnyMenuAccess(['/console/work-journal/weekly', '/console/work-journal/monthly'])
const requireEmploymentAccess = requireAnyMenuAccess(['/console/work-journal/employments'])
const requireTrashAccess = requireAnyMenuAccess(['/console/work-journal/trash'])
const requireEvidenceReadAccess = requireAnyMenuAccess([
  '/console/work-journal/daily',
  '/console/work-journal/trash',
  '/console/manage/media'
])

workJournalRouter.get('/employments', requireAnyMenuAccess([
  '/console/work-journal/daily',
  '/console/work-journal/weekly',
  '/console/work-journal/monthly',
  '/console/work-journal/employments',
  '/console/work-journal/trash',
  '/console/manage/media'
]), asyncHandler(async (req, res) => {
  res.json(ok(await listEmployments(req.user._id)))
}))

workJournalRouter.post('/employments', requireEmploymentAccess, asyncHandler(async (req, res) => {
  const input = parseWorkJournalPayload(employmentCreateSchema, req.body)
  res.status(201).json(ok(await createEmployment(req.user._id, input), '工作经历已创建'))
}))

workJournalRouter.patch('/employments/:id', requireEmploymentAccess, asyncHandler(async (req, res) => {
  const input = parseWorkJournalPayload(employmentUpdateSchema, req.body)
  res.json(ok(await updateEmployment(req.params.id, req.user._id, input), '工作经历已更新'))
}))

workJournalRouter.delete('/employments/:id', requireEmploymentAccess, asyncHandler(async (req, res) => {
  res.json(ok(await deleteEmployment(req.params.id, req.user._id), '工作经历及其日记、汇总和凭证已删除'))
}))

workJournalRouter.get('/reports', requireDailyAccess, asyncHandler(async (req, res) => {
  res.json(ok(await getWorkReport(req.user._id, {
    employmentId: String(req.query.employmentId || ''),
    period: String(req.query.period || ''),
    date: String(req.query.date || '')
  })))
}))

workJournalRouter.get('/saved-reports', requireReportAccess, asyncHandler(async (req, res) => {
  res.json(ok(await listWorkReports(req.user._id, req.query)))
}))

workJournalRouter.post('/saved-reports', requireReportAccess, asyncHandler(async (req, res) => {
  const input = parseWorkJournalPayload(workReportCreateSchema, req.body)
  res.status(201).json(ok(await createWorkReport(req.user._id, input), '周期汇总已保存'))
}))

workJournalRouter.patch('/saved-reports/:id', requireReportAccess, asyncHandler(async (req, res) => {
  const input = parseWorkJournalPayload(workReportUpdateSchema, req.body)
  res.json(ok(await updateWorkReport(req.params.id, req.user._id, input), '周期汇总已更新'))
}))

workJournalRouter.delete('/saved-reports/:id', requireReportAccess, asyncHandler(async (req, res) => {
  res.json(ok(await deleteWorkReport(req.params.id, req.user._id), '周期汇总已删除'))
}))

workJournalRouter.get('/export', requireDailyAccess, asyncHandler(async (req, res) => {
  const data = await getWorkJournalExport(req.user._id, {
    employmentId: String(req.query.employmentId || ''),
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
    keyword: req.query.keyword ? String(req.query.keyword) : undefined
  })
  const baseName = sanitizeFilename(`${data.employment.company}-工作日记-${req.query.from || '全部'}-${req.query.to || ''}`)
  const fallback = baseName.replace(/[^\x20-\x7e]/g, '_')
  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${fallback}.zip"; filename*=UTF-8''${encodeURIComponent(`${baseName}.zip`)}`)
  res.setHeader('Cache-Control', 'private, no-store')
  const archive = archiver('zip', { zlib: { level: 6 } })
  archive.on('error', (error) => res.destroy(error))
  archive.pipe(res)
  const manifest = []
  for (const { log, evidence } of data.logs) {
    const base = `${log.workDate}/${sanitizeFilename(log.title)}`
    archive.append(buildLogMarkdown(log), { name: `${base}.md` })
    for (const item of evidence) {
      const archivePath = `${base}/凭证/${item.archiveName}`
      archive.file(item.filePath, { name: archivePath })
      manifest.push({ workDate: log.workDate, title: log.title, file: archivePath, originalName: item.originalName, sha256: item.sha256 })
    }
  }
  archive.append(JSON.stringify({ exportedAt: new Date().toISOString(), company: data.employment.company, records: data.logs.length, evidence: manifest }, null, 2), { name: 'manifest.json' })
  await archive.finalize()
}))

workJournalRouter.get('/logs', requireDailyAccess, asyncHandler(async (req, res) => {
  res.json(ok(await listWorkLogs(req.user._id, req.query)))
}))

workJournalRouter.get('/media-content/:mediaId', requireAnyMenuAccess([
  '/console/work-journal/daily',
  '/console/work-journal/trash',
  '/console/manage/media'
]), asyncHandler(async (req, res) => {
  const result = await getWorkJournalMediaContent(req.params.mediaId, req.user, {
  canManageAll: Boolean(req.rbacUser?.isSuperAdmin || req.rbacUser?.role === 'super_admin' || req.user.role === 'super_admin')
  })
  res.setHeader('Content-Type', result.media.mimeType)
  res.setHeader('Content-Length', result.contents.length)
  const fallbackName = pathSafeName(result.media.originalName).replace(/[^\x20-\x7e]/g, '_')
  res.setHeader('Content-Disposition', `inline; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(result.media.originalName)}`)
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(result.contents)
}))

workJournalRouter.get('/logs/:id', requireAnyMenuAccess([
  '/console/work-journal/daily',
  '/console/work-journal/trash'
]), asyncHandler(async (req, res) => {
  res.json(ok(await getWorkLog(req.params.id, req.user._id)))
}))

workJournalRouter.get('/trash', requireTrashAccess, asyncHandler(async (req, res) => {
  res.json(ok(await listWorkLogs(req.user._id, { ...req.query, trash: true })))
}))

workJournalRouter.post('/logs', requireDailyAccess, asyncHandler(async (req, res) => {
  const input = parseWorkJournalPayload(workLogCreateSchema, req.body)
  res.status(201).json(ok(await createWorkLog(req.user._id, input), '工作日记已保存为草稿'))
}))

workJournalRouter.post('/logs/:id/evidence', requireDailyAccess, asyncHandler(async (req, res, next) => {
  await findOwnedWorkLog(req.params.id, req.user._id)
  next()
}), handleEvidenceUpload, asyncHandler(async (req, res) => {
  res.status(201).json(ok(await addWorkEvidence(req.params.id, req.user._id, req.file), '图片凭证已添加'))
}))

workJournalRouter.get('/logs/:id/evidence/:evidenceId', requireEvidenceReadAccess, asyncHandler(async (req, res) => {
  const { contents, evidence } = await getWorkEvidence(req.params.id, req.params.evidenceId, req.user._id, { includeDeleted: true })
  const fallback = pathSafeName(evidence.originalName).replace(/[^\x20-\x7e]/g, '_')
  res.setHeader('Content-Type', evidence.mimeType)
  res.setHeader('Content-Length', contents.length)
  res.setHeader('Content-Disposition', `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(evidence.originalName)}`)
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(contents)
}))

workJournalRouter.delete('/logs/:id/evidence/:evidenceId', requireAnyMenuAccess([
  '/console/work-journal/daily'
]), asyncHandler(async (req, res) => {
  res.json(ok(await deleteWorkEvidence(req.params.id, req.params.evidenceId, req.user._id, { includeDeleted: true }), '凭证已删除'))
}))

workJournalRouter.patch('/logs/:id', requireDailyAccess, asyncHandler(async (req, res) => {
  const input = parseWorkJournalPayload(workLogUpdateSchema, req.body)
  res.json(ok(await updateWorkLog(req.params.id, req.user._id, input), '工作日记已更新'))
}))

workJournalRouter.delete('/logs/:id/permanent', requireTrashAccess, asyncHandler(async (req, res) => {
  res.json(ok(await permanentlyDeleteWorkLog(req.params.id, req.user._id), '工作日记及图片凭证已永久删除'))
}))

workJournalRouter.delete('/logs/:id', requireDailyAccess, asyncHandler(async (req, res) => {
  res.json(ok(await deleteWorkLog(req.params.id, req.user._id), '工作日记已移入回收站'))
}))

workJournalRouter.post('/logs/:id/restore', requireTrashAccess, asyncHandler(async (req, res) => {
  res.json(ok(await restoreWorkLog(req.params.id, req.user._id), '工作日记已恢复'))
}))

function pathSafeName(value) {
  return decodeUploadFilename(value).replace(/[\r\n"\\/]+/g, '_').slice(0, 180) || 'evidence'
}
