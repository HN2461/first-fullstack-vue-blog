import { Question } from '#modules/questionBank/models/Question.js'
import { QuestionAttempt } from '#modules/questionBank/models/QuestionAttempt.js'
import { QuestionPaper } from '#modules/questionBank/models/QuestionPaper.js'
import { buildQuestionQuery } from './question.service.js'
import { getReviewQuestionIds, recordQuestionProgress } from './questionProgress.service.js'
import {
  areAnswersCorrect,
  assertObjectId,
  createQuestionBankError,
  normalizeAnswerKeys,
  resolvePaging,
  shuffleItems
} from './questionBank.utils.js'

function snapshotQuestion(question) {
  const category = question.categoryId
  return {
    questionId: question._id,
    code: question.code,
    version: question.version,
    categoryId: category._id,
    categoryName: (category.pathNames || [category.name]).join(' / '),
    type: question.type,
    stem: question.stem,
    options: question.options.map((option) => ({ id: option.id, content: option.content })),
    answerKeys: question.answerKeys,
    explanation: question.explanation,
    difficulty: question.difficulty,
    tags: question.tags
  }
}

function serializeAttempt(attempt) {
  const includeResults = attempt.status === 'submitted'
  const draftMap = new Map((attempt.draftAnswers || []).map((item) => [item.questionId.toString(), item.answerKeys || []]))
  const resultMap = new Map((attempt.answers || []).map((item) => [item.questionId.toString(), item]))
  return {
    id: attempt._id.toString(),
    paperId: attempt.paperId?.toString?.() || null,
    mode: attempt.mode,
    title: attempt.title,
    status: attempt.status,
    durationMinutes: attempt.durationMinutes,
    passScore: attempt.passScore,
    totalScore: attempt.totalScore,
    correctCount: attempt.correctCount,
    questionCount: attempt.questions.length,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    createdAt: attempt.createdAt,
    questions: attempt.questions.map((question, index) => {
      const id = question.questionId.toString()
      const result = resultMap.get(id)
      const item = {
        index: index + 1,
        questionId: id,
        code: question.code,
        version: question.version,
        categoryId: question.categoryId.toString(),
        categoryName: question.categoryName,
        type: question.type,
        stem: question.stem,
        options: question.options || [],
        difficulty: question.difficulty,
        tags: question.tags || [],
        submittedAnswer: result?.answerKeys || draftMap.get(id) || []
      }
      if (includeResults) {
        item.answerKeys = question.answerKeys || []
        item.explanation = question.explanation || ''
        item.correct = result?.correct || false
        item.score = result?.score || 0
      }
      return item
    })
  }
}

async function findOwnedAttempt(id, userId) {
  assertObjectId(id, 'QUESTION_ATTEMPT_NOT_FOUND', '答题记录不存在')
  const attempt = await QuestionAttempt.findOne({ _id: id, userId })
  if (!attempt) throw createQuestionBankError(404, 'QUESTION_ATTEMPT_NOT_FOUND', '答题记录不存在')
  return attempt
}

async function loadReadyQuestions(query, options = {}) {
  let questions = await Question.find(query).populate('categoryId')
  questions = questions.filter((item) => item.categoryId?.enabled !== false)
  if (options.orderIds?.length) {
    const map = new Map(questions.map((item) => [item._id.toString(), item]))
    questions = options.orderIds.map((id) => map.get(id.toString())).filter(Boolean)
  }
  if (options.shuffle) questions = shuffleItems(questions)
  return questions
}

async function createAttempt(userId, config, questions) {
  if (!questions.length) {
    throw createQuestionBankError(400, 'QUESTION_POOL_EMPTY', '当前条件下没有可用题目')
  }
  const attempt = await QuestionAttempt.create({
    userId,
    paperId: config.paperId || null,
    mode: config.mode,
    title: config.title,
    durationMinutes: config.durationMinutes || 0,
    passScore: config.passScore ?? 60,
    questions: questions.map(snapshotQuestion),
    startedAt: new Date()
  })
  return serializeAttempt(attempt)
}

export async function startQuickAttempt(userId, input) {
  let reviewIds = []
  if (input.reviewScope) {
    reviewIds = await getReviewQuestionIds(userId, input.reviewScope)
    if (!reviewIds.length) {
      throw createQuestionBankError(400, 'REVIEW_POOL_EMPTY', '当前没有符合条件的复习题目')
    }
  }
  const ids = input.questionIds?.length ? input.questionIds : reviewIds
  const query = await buildQuestionQuery({
    categoryId: input.categoryId,
    tags: input.tags,
    types: input.types,
    difficulties: input.difficulties,
    ids
  }, { readyOnly: true })
  let questions = await loadReadyQuestions(query, { shuffle: true })
  const desiredCount = Math.max(1, Number(input.count) || 20)
  if (!input.reviewScope && questions.length < desiredCount) {
    throw createQuestionBankError(400, 'QUESTION_POOL_INSUFFICIENT', `当前条件只有 ${questions.length} 道题，无法抽取 ${desiredCount} 道`)
  }
  questions = questions.slice(0, Math.min(desiredCount, questions.length))
  const mode = input.mode || (input.reviewScope ? 'review' : 'practice')
  const title = input.title || (mode === 'review' ? '错题复习' : '快速练习')
  return createAttempt(userId, {
    mode,
    title,
    durationMinutes: input.durationMinutes || 0,
    passScore: input.passScore ?? 60
  }, questions)
}

export async function startPaperAttempt(userId, paperId) {
  assertObjectId(paperId, 'QUESTION_PAPER_NOT_FOUND', '试卷不存在')
  const paper = await QuestionPaper.findOne({ _id: paperId, status: 'ready' })
  if (!paper) throw createQuestionBankError(404, 'QUESTION_PAPER_NOT_FOUND', '试卷不存在或尚未就绪')

  let questions
  if (paper.mode === 'fixed') {
    questions = await loadReadyQuestions(
      { _id: { $in: paper.questionIds }, status: 'ready' },
      { orderIds: paper.questionIds, shuffle: paper.shuffleQuestions }
    )
    if (questions.length !== paper.questionIds.length) {
      throw createQuestionBankError(400, 'PAPER_QUESTION_UNAVAILABLE', '试卷中有题目已停用，请先维护试卷')
    }
  } else {
    const query = await buildQuestionQuery({
      categoryIds: paper.filters?.categoryIds || [],
      tags: paper.filters?.tags || [],
      types: paper.filters?.types || [],
      difficulties: paper.filters?.difficulties || []
    }, { readyOnly: true })
    const candidates = await loadReadyQuestions(query, { shuffle: true })
    if (candidates.length < paper.questionCount) {
      throw createQuestionBankError(400, 'QUESTION_POOL_INSUFFICIENT', `试卷规则需要 ${paper.questionCount} 道题，当前只有 ${candidates.length} 道可用题目`)
    }
    questions = candidates.slice(0, paper.questionCount)
  }

  return createAttempt(userId, {
    paperId: paper._id,
    mode: 'exam',
    title: paper.title,
    durationMinutes: paper.durationMinutes,
    passScore: paper.passScore
  }, questions)
}

export async function saveAttemptAnswer(id, userId, input) {
  const attempt = await findOwnedAttempt(id, userId)
  if (attempt.status !== 'in_progress') {
    throw createQuestionBankError(409, 'QUESTION_ATTEMPT_SUBMITTED', '答题记录已经提交，不能继续修改')
  }
  const questionId = String(input.questionId)
  if (!attempt.questions.some((item) => item.questionId.toString() === questionId)) {
    throw createQuestionBankError(400, 'ATTEMPT_QUESTION_NOT_FOUND', '当前答题记录中不存在该题目')
  }
  const answerKeys = normalizeAnswerKeys(input.answerKeys)
  const existing = attempt.draftAnswers.find((item) => item.questionId.toString() === questionId)
  if (existing) {
    existing.answerKeys = answerKeys
    existing.updatedAt = new Date()
  } else {
    attempt.draftAnswers.push({ questionId, answerKeys, updatedAt: new Date() })
  }
  await attempt.save()
  return { questionId, answerKeys, savedAt: new Date() }
}

export async function submitAttempt(id, userId, input = {}) {
  const attempt = await findOwnedAttempt(id, userId)
  if (attempt.status !== 'in_progress') return serializeAttempt(attempt)

  for (const answer of input.answers || []) {
    const existing = attempt.draftAnswers.find((item) => item.questionId.toString() === String(answer.questionId))
    if (existing) existing.answerKeys = normalizeAnswerKeys(answer.answerKeys)
    else attempt.draftAnswers.push({ questionId: answer.questionId, answerKeys: normalizeAnswerKeys(answer.answerKeys) })
  }

  const draftMap = new Map(attempt.draftAnswers.map((item) => [item.questionId.toString(), item.answerKeys || []]))
  let correctCount = 0
  attempt.answers = attempt.questions.map((question) => {
    const submitted = draftMap.get(question.questionId.toString()) || []
    const correct = areAnswersCorrect(question.type, submitted, question.answerKeys)
    if (correct) correctCount += 1
    return { questionId: question.questionId, answerKeys: submitted, correct, score: correct ? 1 : 0 }
  })
  attempt.correctCount = correctCount
  attempt.totalScore = Math.round((correctCount / attempt.questions.length) * 10000) / 100
  attempt.status = 'submitted'
  attempt.submittedAt = new Date()
  await attempt.save()

  for (const answer of attempt.answers) {
    await recordQuestionProgress(userId, answer.questionId, answer.correct)
  }
  return serializeAttempt(attempt)
}

export async function getQuestionAttempt(id, userId) {
  return serializeAttempt(await findOwnedAttempt(id, userId))
}

export async function listQuestionAttempts(userId, filters = {}) {
  const paging = resolvePaging(filters, 10)
  const query = { userId }
  if (filters.mode) query.mode = filters.mode
  if (filters.status) query.status = filters.status
  const [items, total] = await Promise.all([
    QuestionAttempt.find(query).sort({ createdAt: -1 }).skip(paging.skip).limit(paging.pageSize),
    QuestionAttempt.countDocuments(query)
  ])
  return {
    items: items.map((item) => {
      const data = serializeAttempt(item)
      delete data.questions
      return data
    }),
    total,
    page: paging.page,
    pageSize: paging.pageSize
  }
}
