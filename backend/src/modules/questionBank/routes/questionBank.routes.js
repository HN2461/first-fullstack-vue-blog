import { Router } from 'express'
import { requireAnyMenuAccess, requireAuth } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import {
  createQuestionCategory,
  listQuestionCategories,
  updateQuestionCategory
} from '#modules/questionBank/services/questionCategory.service.js'
import {
  archiveQuestion,
  createQuestion,
  getQuestion,
  listQuestions,
  updateQuestion
} from '#modules/questionBank/services/question.service.js'
import {
  archiveQuestionPaper,
  createQuestionPaper,
  getQuestionPaper,
  listQuestionPapers,
  updateQuestionPaper
} from '#modules/questionBank/services/questionPaper.service.js'
import {
  assessAttemptQuestion,
  getQuestionAttempt,
  listQuestionAttempts,
  saveAttemptAnswer,
  startPaperAttempt,
  startQuickAttempt,
  submitAttempt
} from '#modules/questionBank/services/questionAttempt.service.js'
import {
  listQuestionProgress,
  setQuestionFavorite
} from '#modules/questionBank/services/questionProgress.service.js'
import { getQuestionBankOverview } from '#modules/questionBank/services/questionOverview.service.js'
import {
  answerSaveSchema,
  attemptQuerySchema,
  attemptSubmitSchema,
  favoriteSchema,
  paperCreateSchema,
  paperQuerySchema,
  paperUpdateSchema,
  progressQuerySchema,
  questionCategoryCreateSchema,
  questionCategoryUpdateSchema,
  questionCreateSchema,
  questionQuerySchema,
  questionUpdateSchema,
  quickAttemptSchema,
  selfAssessmentSchema,
  parseBody
} from '#modules/questionBank/validators/questionBank.validator.js'

export const questionBankRouter = Router()

const modulePaths = [
  '/console/question-bank/overview',
  '/console/question-bank/questions',
  '/console/question-bank/papers',
  '/console/question-bank/practice',
  '/console/question-bank/review',
  '/console/question-bank/attempts'
]
const canAccessModule = requireAnyMenuAccess(modulePaths)
const canManageQuestions = requireAnyMenuAccess(['/console/question-bank/questions'])
const canManagePapers = requireAnyMenuAccess(['/console/question-bank/papers'])
const canPractice = requireAnyMenuAccess(['/console/question-bank/practice', '/console/question-bank/review'])
const canReview = requireAnyMenuAccess(['/console/question-bank/review'])
const canViewAttempts = requireAnyMenuAccess([
  '/console/question-bank/attempts',
  '/console/question-bank/practice',
  '/console/question-bank/papers',
  '/console/question-bank/review'
])

questionBankRouter.use(requireAuth)

questionBankRouter.get('/overview', canAccessModule, asyncHandler(async (req, res) => {
  res.json(ok(await getQuestionBankOverview(req.user._id)))
}))

questionBankRouter.get('/categories', canAccessModule, asyncHandler(async (req, res) => {
  res.json(ok(await listQuestionCategories({ includeDisabled: req.query.includeDisabled === 'true' })))
}))

questionBankRouter.post('/categories', canManageQuestions, asyncHandler(async (req, res) => {
  const input = parseBody(questionCategoryCreateSchema, req.body)
  res.status(201).json(ok(await createQuestionCategory(input), '题库分类已创建'))
}))

questionBankRouter.patch('/categories/:id', canManageQuestions, asyncHandler(async (req, res) => {
  const input = parseBody(questionCategoryUpdateSchema, req.body)
  res.json(ok(await updateQuestionCategory(req.params.id, input), '题库分类已更新'))
}))

questionBankRouter.get('/questions', requireAnyMenuAccess([
  '/console/question-bank/questions',
  '/console/question-bank/papers'
]), asyncHandler(async (req, res) => {
  const input = parseBody(questionQuerySchema, req.query)
  res.json(ok(await listQuestions(input)))
}))

questionBankRouter.get('/questions/:id', requireAnyMenuAccess([
  '/console/question-bank/questions',
  '/console/question-bank/papers'
]), asyncHandler(async (req, res) => {
  res.json(ok(await getQuestion(req.params.id)))
}))

questionBankRouter.post('/questions', canManageQuestions, asyncHandler(async (req, res) => {
  const input = parseBody(questionCreateSchema, req.body)
  res.status(201).json(ok(await createQuestion(input, req.user._id), '题目已创建'))
}))

questionBankRouter.patch('/questions/:id', canManageQuestions, asyncHandler(async (req, res) => {
  const input = parseBody(questionUpdateSchema, req.body)
  res.json(ok(await updateQuestion(req.params.id, input), '题目已更新'))
}))

questionBankRouter.delete('/questions/:id', canManageQuestions, asyncHandler(async (req, res) => {
  res.json(ok(await archiveQuestion(req.params.id), '题目已归档'))
}))

questionBankRouter.get('/papers', canManagePapers, asyncHandler(async (req, res) => {
  const input = parseBody(paperQuerySchema, req.query)
  res.json(ok(await listQuestionPapers(input)))
}))

questionBankRouter.get('/papers/:id', canManagePapers, asyncHandler(async (req, res) => {
  res.json(ok(await getQuestionPaper(req.params.id)))
}))

questionBankRouter.post('/papers', canManagePapers, asyncHandler(async (req, res) => {
  const input = parseBody(paperCreateSchema, req.body)
  res.status(201).json(ok(await createQuestionPaper(input, req.user._id), '试卷已创建'))
}))

questionBankRouter.patch('/papers/:id', canManagePapers, asyncHandler(async (req, res) => {
  const input = parseBody(paperUpdateSchema, req.body)
  res.json(ok(await updateQuestionPaper(req.params.id, input), '试卷已更新'))
}))

questionBankRouter.delete('/papers/:id', canManagePapers, asyncHandler(async (req, res) => {
  res.json(ok(await archiveQuestionPaper(req.params.id), '试卷已归档'))
}))

questionBankRouter.post('/papers/:id/start', canManagePapers, asyncHandler(async (req, res) => {
  res.status(201).json(ok(await startPaperAttempt(req.user._id, req.params.id), '考试已开始'))
}))

questionBankRouter.post('/attempts/quick', canPractice, asyncHandler(async (req, res) => {
  const input = parseBody(quickAttemptSchema, req.body)
  res.status(201).json(ok(await startQuickAttempt(req.user._id, input), '练习已开始'))
}))

questionBankRouter.get('/attempts', canViewAttempts, asyncHandler(async (req, res) => {
  const input = parseBody(attemptQuerySchema, req.query)
  res.json(ok(await listQuestionAttempts(req.user._id, input)))
}))

questionBankRouter.get('/attempts/:id', canViewAttempts, asyncHandler(async (req, res) => {
  res.json(ok(await getQuestionAttempt(req.params.id, req.user._id)))
}))

questionBankRouter.patch('/attempts/:id/answer', canViewAttempts, asyncHandler(async (req, res) => {
  const input = parseBody(answerSaveSchema, req.body)
  res.json(ok(await saveAttemptAnswer(req.params.id, req.user._id, input), '答案已保存'))
}))

questionBankRouter.post('/attempts/:id/submit', canViewAttempts, asyncHandler(async (req, res) => {
  const input = parseBody(attemptSubmitSchema, req.body)
  res.json(ok(await submitAttempt(req.params.id, req.user._id, input), '答题已提交'))
}))

questionBankRouter.patch('/attempts/:id/self-assessment', canViewAttempts, asyncHandler(async (req, res) => {
  const input = parseBody(selfAssessmentSchema, req.body)
  res.json(ok(await assessAttemptQuestion(req.params.id, req.user._id, input), '自评结果已保存'))
}))

questionBankRouter.get('/progress', canReview, asyncHandler(async (req, res) => {
  const input = parseBody(progressQuerySchema, req.query)
  res.json(ok(await listQuestionProgress(req.user._id, input)))
}))

questionBankRouter.patch('/progress/:questionId/favorite', canReview, asyncHandler(async (req, res) => {
  const input = parseBody(favoriteSchema, req.body)
  res.json(ok(await setQuestionFavorite(req.user._id, req.params.questionId, input.isFavorite), '收藏状态已更新'))
}))
