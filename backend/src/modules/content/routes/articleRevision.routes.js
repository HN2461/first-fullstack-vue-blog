import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '#utils/asyncHandler.js'
import { ok } from '#utils/apiResponse.js'
import { articleSchema, parseBody } from '../validators/content.validator.js'
import { getArticleEditor, getArticleRevision, listArticleRevisions, saveArticleEdit } from '../services/articleRevision.service.js'

export const articleRevisionRouter = Router()
const idSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, '文章编号不正确') })
const editSchema = z.object({
  token: z.string().regex(/^[a-f\d]{64}$/, '请重新读取文章编辑状态'),
  content: articleSchema,
  acknowledgeBase: z.boolean().optional().default(false)
})
const historyPageSchema = z.object({ before: z.coerce.number().int().positive().optional() })
const revisionSchema = z.object({ number: z.coerce.number().int().positive() })

articleRevisionRouter.param('id', (req, _res, next) => {
  parseBody(idSchema, req.params)
  next()
})
articleRevisionRouter.get('/:id/editor', asyncHandler(async (req, res) => {
  res.json(ok(await getArticleEditor(req.params.id)))
}))
for (const action of ['draft', 'publish']) {
  articleRevisionRouter.put('/:id/editor/' + action, asyncHandler(async (req, res) => {
    const { token, content, acknowledgeBase } = parseBody(editSchema, req.body)
    res.json(ok(await saveArticleEdit(req.params.id, token, content, req.user, action === 'publish', acknowledgeBase)))
  }))
}
articleRevisionRouter.get('/:id/revisions', asyncHandler(async (req, res) => {
  const { before } = parseBody(historyPageSchema, req.query)
  res.json(ok(await listArticleRevisions(req.params.id, before)))
}))
articleRevisionRouter.get('/:id/revisions/:number', asyncHandler(async (req, res) => {
  const { number } = parseBody(revisionSchema, req.params)
  res.json(ok(await getArticleRevision(req.params.id, number)))
}))
