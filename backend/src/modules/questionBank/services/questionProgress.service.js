import { Question } from '#modules/questionBank/models/Question.js'
import { QuestionProgress } from '#modules/questionBank/models/QuestionProgress.js'
import { assertObjectId, createQuestionBankError, resolvePaging } from './questionBank.utils.js'

const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]

function resolveNextReviewAt(masteryLevel, correct) {
  const days = correct ? REVIEW_INTERVAL_DAYS[masteryLevel] || 30 : 0
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

export async function recordQuestionProgress(userId, questionId, correct) {
  let progress = await QuestionProgress.findOne({ userId, questionId })
  if (!progress) progress = new QuestionProgress({ userId, questionId })

  progress.attempts += 1
  progress.lastCorrect = correct
  progress.lastAttemptAt = new Date()
  if (correct) {
    progress.correctCount += 1
    progress.masteryLevel = Math.min(5, progress.masteryLevel + 1)
  } else {
    progress.wrongCount += 1
    progress.masteryLevel = Math.max(0, progress.masteryLevel - 2)
  }
  progress.nextReviewAt = resolveNextReviewAt(progress.masteryLevel, correct)
  await progress.save()
  return progress
}

function serializeProgress(item) {
  const question = item.questionId
  if (!question || !question._id) return null
  return {
    id: item._id.toString(),
    questionId: question._id.toString(),
    question: question.toSafeJSON(),
    attempts: item.attempts,
    correctCount: item.correctCount,
    wrongCount: item.wrongCount,
    accuracy: item.attempts ? Math.round((item.correctCount / item.attempts) * 100) : 0,
    masteryLevel: item.masteryLevel,
    lastCorrect: item.lastCorrect,
    isFavorite: item.isFavorite,
    nextReviewAt: item.nextReviewAt,
    lastAttemptAt: item.lastAttemptAt
  }
}

export async function listQuestionProgress(userId, filters = {}) {
  const paging = resolvePaging(filters, 20)
  const query = { userId }
  if (filters.scope === 'favorite') query.isFavorite = true
  else if (filters.scope === 'due') query.nextReviewAt = { $lte: new Date() }
  else query.lastCorrect = false

  // 归档题目不再进入复习队列，分页总数必须与当前可见记录保持一致。
  const readyQuestionIds = await Question.distinct('_id', { status: 'ready' })
  query.questionId = { $in: readyQuestionIds }

  const [records, total] = await Promise.all([
    QuestionProgress.find(query)
      .populate({ path: 'questionId', populate: { path: 'categoryId' } })
      .sort({ nextReviewAt: 1, updatedAt: -1 })
      .skip(paging.skip)
      .limit(paging.pageSize),
    QuestionProgress.countDocuments(query)
  ])
  const items = records.map(serializeProgress).filter(Boolean)
  return { items, total, page: paging.page, pageSize: paging.pageSize }
}

export async function setQuestionFavorite(userId, questionId, isFavorite) {
  assertObjectId(questionId, 'QUESTION_NOT_FOUND', '题目不存在')
  const question = await Question.findOne({ _id: questionId, status: 'ready' })
  if (!question) throw createQuestionBankError(404, 'QUESTION_NOT_FOUND', '题目不存在')
  const progress = await QuestionProgress.findOneAndUpdate(
    { userId, questionId },
    { $set: { isFavorite }, $setOnInsert: { attempts: 0, correctCount: 0, wrongCount: 0, masteryLevel: 0 } },
    { upsert: true, new: true }
  )
  return { questionId: questionId.toString(), isFavorite: progress.isFavorite }
}

export async function getReviewQuestionIds(userId, scope = 'wrong') {
  const query = { userId }
  if (scope === 'favorite') query.isFavorite = true
  else if (scope === 'due') query.nextReviewAt = { $lte: new Date() }
  else query.lastCorrect = false
  const records = await QuestionProgress.find(query).sort({ nextReviewAt: 1 }).select('questionId')
  return records.map((item) => item.questionId)
}
