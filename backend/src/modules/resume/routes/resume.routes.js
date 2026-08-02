import { Router } from 'express'
import { requireAnyMenuAccess, requireAuth, requireMenuAccess } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import {
  createResume,
  deleteResume,
  duplicateResume,
  findOwnedResume,
  getResume,
  listResumes,
  updateResume
} from '#modules/resume/services/resume.service.js'
import { handleResumePhotoUpload, saveResumePhoto } from '#modules/resume/services/resumePhoto.service.js'
import {
  addInterviewLink,
  createInterview,
  deleteInterview,
  getInterview,
  listInterviews,
  removeInterviewLink,
  updateInterview
} from '#modules/resume/services/resumeInterview.service.js'
import { getResumeTemplate, listResumeTemplates } from '#modules/resume/services/resumeTemplate.service.js'
import { createResumeExport, getResumeExportFile, listResumeExports } from '#modules/resume/services/resumeExport.service.js'
import { getResumeMaterial, listResumeMaterials } from '#modules/resume/services/resumeMaterial.service.js'
import {
  exportCreateSchema,
  exportQuerySchema,
  interviewCreateSchema,
  interviewLinkSchema,
  interviewQuerySchema,
  interviewUpdateSchema,
  materialQuerySchema,
  parseBody,
  resumeCreateSchema,
  resumeQuerySchema,
  resumeUpdateSchema
} from '#modules/resume/validators/resume.validator.js'

export const resumeRouter = Router()
export const resumeInterviewRouter = Router()
export const resumeMaterialRouter = Router()
export const resumeTemplateRouter = Router()
export const resumeExportRouter = Router()

resumeRouter.use(requireAuth)
resumeRouter.use(requireMenuAccess('/console/resumes'))

resumeRouter.get('/', asyncHandler(async (req, res) => {
  const input = parseBody(resumeQuerySchema, req.query)
  res.json(ok(await listResumes(req.user._id, input)))
}))

resumeRouter.post('/', asyncHandler(async (req, res) => {
  const input = parseBody(resumeCreateSchema, req.body)
  res.status(201).json(ok(await createResume(req.user._id, input), '简历已创建'))
}))

resumeRouter.post(
  '/:id/photo',
  asyncHandler(async (req, res, next) => {
    // 先校验归属再接收文件，避免越权请求在上传目录留下孤儿文件。
    await findOwnedResume(req.params.id, req.user._id)
    next()
  }),
  handleResumePhotoUpload,
  asyncHandler(async (req, res) => {
    res.json(ok(await saveResumePhoto(req.params.id, req.user._id, req.file), '证件照已更新'))
  })
)

resumeRouter.get('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await getResume(req.params.id, req.user._id)))
}))

resumeRouter.patch('/:id', asyncHandler(async (req, res) => {
  const input = parseBody(resumeUpdateSchema, req.body)
  res.json(ok(await updateResume(req.params.id, req.user._id, input), '简历已保存'))
}))

resumeRouter.post('/:id/duplicate', asyncHandler(async (req, res) => {
  res.status(201).json(ok(await duplicateResume(req.params.id, req.user._id), '简历副本已创建'))
}))

resumeRouter.delete('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteResume(req.params.id, req.user._id), '简历已删除'))
}))

resumeInterviewRouter.use(requireAuth)
resumeInterviewRouter.use(requireMenuAccess('/console/resume-interviews'))

resumeInterviewRouter.get('/', asyncHandler(async (req, res) => {
  const input = parseBody(interviewQuerySchema, req.query)
  res.json(ok(await listInterviews(req.user._id, input)))
}))

resumeInterviewRouter.post('/', asyncHandler(async (req, res) => {
  const input = parseBody(interviewCreateSchema, req.body)
  res.status(201).json(ok(await createInterview(req.user._id, input), '面试问答已创建'))
}))

resumeInterviewRouter.get('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await getInterview(req.params.id, req.user._id)))
}))

resumeInterviewRouter.patch('/:id', asyncHandler(async (req, res) => {
  const input = parseBody(interviewUpdateSchema, req.body)
  res.json(ok(await updateInterview(req.params.id, req.user._id, input), '面试问答已更新'))
}))

resumeInterviewRouter.post('/:id/links', asyncHandler(async (req, res) => {
  const input = parseBody(interviewLinkSchema, req.body)
  res.json(ok(await addInterviewLink(req.params.id, req.user._id, input), '关联已添加'))
}))

resumeInterviewRouter.delete('/:id/links', asyncHandler(async (req, res) => {
  const input = parseBody(interviewLinkSchema, req.body)
  res.json(ok(await removeInterviewLink(req.params.id, req.user._id, input), '关联已移除'))
}))

resumeInterviewRouter.delete('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteInterview(req.params.id, req.user._id), '面试问答已删除'))
}))

resumeMaterialRouter.use(requireAuth)
resumeMaterialRouter.use(requireMenuAccess('/console/resume-interviews'))

resumeMaterialRouter.get('/', asyncHandler(async (req, res) => {
  const input = parseBody(materialQuerySchema, req.query)
  res.json(ok(await listResumeMaterials(req.user._id, input)))
}))

resumeMaterialRouter.get('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await getResumeMaterial(req.params.id, req.user._id)))
}))

resumeTemplateRouter.use(requireAuth)
resumeTemplateRouter.use(requireAnyMenuAccess(['/console/resume-templates', '/console/resumes']))

resumeTemplateRouter.get('/', asyncHandler(async (req, res) => {
  res.json(ok(await listResumeTemplates(req.user._id)))
}))

resumeTemplateRouter.get('/:key', asyncHandler(async (req, res) => {
  res.json(ok(await getResumeTemplate(req.params.key, req.user._id)))
}))

resumeExportRouter.use(requireAuth)
resumeExportRouter.use(requireAnyMenuAccess(['/console/resume-exports', '/console/resumes']))

resumeExportRouter.get('/', asyncHandler(async (req, res) => {
  const input = parseBody(exportQuerySchema, req.query)
  res.json(ok(await listResumeExports(req.user._id, input)))
}))

resumeExportRouter.post('/', asyncHandler(async (req, res) => {
  const input = parseBody(exportCreateSchema, req.body)
  res.status(201).json(ok(await createResumeExport(req.user._id, input), '简历导出已生成'))
}))

resumeExportRouter.get('/:id/download', asyncHandler(async (req, res) => {
  const record = await getResumeExportFile(req.params.id, req.user._id)
  const fallbackFilename = record.filename.replace(/[^\x20-\x7e]/g, '_')
  res.setHeader('Content-Type', record.contentType)
  res.setHeader('Content-Length', record.fileSize)
  res.setHeader('Content-Disposition', `attachment; filename="${fallbackFilename}"; filename*=UTF-8''${encodeURIComponent(record.filename)}`)
  res.send(record.fileData)
}))
