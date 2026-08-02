import { z } from 'zod'
import {
  QUESTION_DIFFICULTIES,
  QUESTION_STATUSES,
  QUESTION_TYPES
} from '#modules/questionBank/models/Question.js'
import {
  QUESTION_PAPER_MODES,
  QUESTION_PAPER_STATUSES
} from '#modules/questionBank/models/QuestionPaper.js'
import { QUESTION_ATTEMPT_MODES } from '#modules/questionBank/models/QuestionAttempt.js'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, '数据 id 不正确')
const tagSchema = z.string().trim().min(1, '标签不能为空').max(30, '单个标签不能超过 30 个字符')

export const questionCategoryCreateSchema = z.object({
  key: z.string().trim().min(2, '分类编码至少 2 个字符').max(100).regex(/^[a-z0-9.-]+$/, '分类编码只能包含小写字母、数字、点和横线'),
  name: z.string().trim().min(1, '分类名称不能为空').max(60),
  parentId: objectIdSchema.nullish(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  enabled: z.boolean().optional().default(true)
}).strict('存在不支持的分类字段')

export const questionCategoryUpdateSchema = questionCategoryCreateSchema
  .pick({ name: true, sortOrder: true, enabled: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, '请提供需要更新的分类字段')

const questionOptionSchema = z.object({
  id: z.string().trim().min(1, '选项编号不能为空').max(20),
  content: z.string().trim().min(1, '选项内容不能为空').max(3000)
}).strict('存在不支持的选项字段')

export const questionCreateSchema = z.object({
  code: z.string().trim().min(2).max(120).regex(/^[a-z0-9.-]+$/, '题目编码只能包含小写字母、数字、点和横线').optional(),
  categoryId: objectIdSchema,
  type: z.enum(QUESTION_TYPES),
  stem: z.string().trim().min(1, '题干不能为空').max(12000),
  options: z.array(questionOptionSchema).max(12).optional().default([]),
  answerKeys: z.array(z.union([z.string(), z.boolean(), z.number()]).transform(String)).max(20),
  explanation: z.string().trim().max(12000).optional().default(''),
  difficulty: z.enum(QUESTION_DIFFICULTIES).optional().default('medium'),
  tags: z.array(tagSchema).max(12).optional().default([]),
  status: z.enum(QUESTION_STATUSES).optional().default('ready'),
  source: z.string().trim().max(120).optional(),
  defaultScore: z.coerce.number().int().min(1).max(100).optional().default(1)
}).strict('存在不支持的题目字段')

export const questionUpdateSchema = questionCreateSchema
  .omit({ code: true, source: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, '请提供需要更新的题目字段')

export const questionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  keyword: z.string().trim().max(100).optional(),
  categoryId: objectIdSchema.optional(),
  type: z.enum(QUESTION_TYPES).optional(),
  difficulty: z.enum(QUESTION_DIFFICULTIES).optional(),
  tag: z.string().trim().max(30).optional(),
  status: z.enum(QUESTION_STATUSES).optional()
}).strict('存在不支持的题目查询字段')

const paperFiltersSchema = z.object({
  categoryIds: z.array(objectIdSchema).max(20).optional().default([]),
  tags: z.array(tagSchema).max(12).optional().default([]),
  types: z.array(z.enum(QUESTION_TYPES)).max(QUESTION_TYPES.length).optional().default([]),
  difficulties: z.array(z.enum(QUESTION_DIFFICULTIES)).max(QUESTION_DIFFICULTIES.length).optional().default([])
}).strict('存在不支持的抽题规则字段')

export const paperCreateSchema = z.object({
  title: z.string().trim().min(1, '试卷名称不能为空').max(120),
  description: z.string().trim().max(1000).optional().default(''),
  mode: z.enum(QUESTION_PAPER_MODES).optional().default('random'),
  questionIds: z.array(objectIdSchema).max(200).optional().default([]),
  filters: paperFiltersSchema.optional().default({}),
  questionCount: z.coerce.number().int().min(1).max(200).optional().default(20),
  durationMinutes: z.coerce.number().int().min(1).max(480).optional().default(30),
  passScore: z.coerce.number().min(0).max(100).optional().default(60),
  shuffleQuestions: z.boolean().optional().default(true),
  status: z.enum(QUESTION_PAPER_STATUSES).optional().default('ready')
}).strict('存在不支持的试卷字段')

export const paperUpdateSchema = paperCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, '请提供需要更新的试卷字段')

export const paperQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  keyword: z.string().trim().max(100).optional(),
  mode: z.enum(QUESTION_PAPER_MODES).optional(),
  status: z.enum(QUESTION_PAPER_STATUSES).optional()
}).strict('存在不支持的试卷查询字段')

export const quickAttemptSchema = z.object({
  mode: z.enum(QUESTION_ATTEMPT_MODES).optional(),
  title: z.string().trim().max(160).optional(),
  count: z.coerce.number().int().min(1).max(100).optional().default(20),
  categoryId: objectIdSchema.optional(),
  tags: z.array(tagSchema).max(12).optional().default([]),
  types: z.array(z.enum(QUESTION_TYPES)).max(QUESTION_TYPES.length).optional().default([]),
  difficulties: z.array(z.enum(QUESTION_DIFFICULTIES)).max(QUESTION_DIFFICULTIES.length).optional().default([]),
  questionIds: z.array(objectIdSchema).max(100).optional().default([]),
  reviewScope: z.enum(['wrong', 'due', 'favorite']).optional(),
  durationMinutes: z.coerce.number().int().min(0).max(480).optional().default(0),
  passScore: z.coerce.number().min(0).max(100).optional().default(60)
}).strict('存在不支持的练习参数')

export const answerSaveSchema = z.object({
  questionId: objectIdSchema,
  answerKeys: z.array(z.union([z.string(), z.boolean(), z.number()]).transform(String)).max(20).optional().default([])
}).strict('存在不支持的答案字段')

export const attemptSubmitSchema = z.object({
  answers: z.array(answerSaveSchema).max(200).optional().default([])
}).strict('存在不支持的交卷字段')

export const attemptQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  mode: z.enum(QUESTION_ATTEMPT_MODES).optional(),
  status: z.enum(['in_progress', 'submitted', 'expired']).optional()
}).strict('存在不支持的作答记录查询字段')

export const progressQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  scope: z.enum(['wrong', 'due', 'favorite']).optional().default('wrong')
}).strict('存在不支持的错题查询字段')

export const favoriteSchema = z.object({
  isFavorite: z.boolean()
}).strict('存在不支持的收藏字段')

export function parseBody(schema, value) {
  const result = schema.safeParse(value)
  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || '参数不正确')
    error.statusCode = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }
  return result.data
}
