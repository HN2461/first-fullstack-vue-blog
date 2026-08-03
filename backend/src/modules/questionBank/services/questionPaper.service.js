import { Question } from '#modules/questionBank/models/Question.js'
import { QuestionCategory } from '#modules/questionBank/models/QuestionCategory.js'
import { QuestionPaper } from '#modules/questionBank/models/QuestionPaper.js'
import {
  assertObjectId,
  createQuestionBankError,
  escapeRegExp,
  resolvePaging,
  uniqueStrings
} from './questionBank.utils.js'

async function validatePaperReferences(input) {
  const questionIds = [...new Set(input.questionIds || [])]
  const categoryIds = [...new Set(input.filters?.categoryIds || [])]

  if (input.mode === 'fixed') {
    if (!questionIds.length) {
      throw createQuestionBankError(400, 'PAPER_QUESTIONS_REQUIRED', '固定试卷至少选择一道题目')
    }
    const count = await Question.countDocuments({ _id: { $in: questionIds }, status: 'ready' })
    if (count !== questionIds.length) {
      throw createQuestionBankError(400, 'PAPER_QUESTION_UNAVAILABLE', '固定试卷包含不存在或未就绪的题目')
    }
  }

  if (categoryIds.length) {
    const count = await QuestionCategory.countDocuments({ _id: { $in: categoryIds }, enabled: true })
    if (count !== categoryIds.length) {
      throw createQuestionBankError(400, 'QUESTION_CATEGORY_NOT_FOUND', '抽题分类包含不存在或停用的分类')
    }
  }
}

function normalizePaperInput(input) {
  return {
    ...input,
    questionIds: [...new Set(input.questionIds || [])],
    filters: {
      categoryIds: [...new Set(input.filters?.categoryIds || [])],
      tags: uniqueStrings(input.filters?.tags || [], 12),
      types: [...new Set(input.filters?.types || [])],
      difficulties: [...new Set(input.filters?.difficulties || [])]
    }
  }
}

export async function listQuestionPapers(filters = {}) {
  const paging = resolvePaging(filters, 10)
  const query = { status: filters.status || { $ne: 'archived' } }
  const keyword = String(filters.keyword || '').trim()
  if (keyword) {
    const regex = new RegExp(escapeRegExp(keyword), 'i')
    query.$or = [{ title: regex }, { description: regex }]
  }
  if (filters.mode) query.mode = filters.mode

  const [items, total] = await Promise.all([
    QuestionPaper.find(query).sort({ updatedAt: -1 }).skip(paging.skip).limit(paging.pageSize),
    QuestionPaper.countDocuments(query)
  ])
  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page: paging.page,
    pageSize: paging.pageSize
  }
}

export async function getQuestionPaper(id) {
  assertObjectId(id, 'QUESTION_PAPER_NOT_FOUND', '试卷不存在')
  const paper = await QuestionPaper.findById(id)
  if (!paper) throw createQuestionBankError(404, 'QUESTION_PAPER_NOT_FOUND', '试卷不存在')
  return paper.toSafeJSON()
}

export async function createQuestionPaper(input, userId) {
  const normalized = normalizePaperInput(input)
  await validatePaperReferences(normalized)
  const paper = await QuestionPaper.create({
    ...normalized,
    questionCount: normalized.mode === 'fixed' ? normalized.questionIds.length : normalized.questionCount,
    createdBy: userId
  })
  return paper.toSafeJSON()
}

export async function updateQuestionPaper(id, input) {
  assertObjectId(id, 'QUESTION_PAPER_NOT_FOUND', '试卷不存在')
  const paper = await QuestionPaper.findById(id)
  if (!paper) throw createQuestionBankError(404, 'QUESTION_PAPER_NOT_FOUND', '试卷不存在')
  if ((paper.source || '').startsWith('builtin-')) {
    throw createQuestionBankError(409, 'BUILTIN_PAPER_READONLY', '内置试卷由题库数据统一维护，不能直接编辑')
  }

  const normalized = normalizePaperInput({
    ...paper.toObject(),
    ...input,
    questionIds: input.questionIds ?? paper.questionIds.map((item) => item.toString()),
    filters: input.filters ?? paper.filters?.toObject?.() ?? paper.filters
  })
  await validatePaperReferences(normalized)

  const fields = ['title', 'description', 'mode', 'questionIds', 'filters', 'questionCount', 'durationMinutes', 'passScore', 'shuffleQuestions', 'status']
  for (const field of fields) {
    if (input[field] !== undefined) paper[field] = normalized[field]
  }
  if (paper.mode === 'fixed') paper.questionCount = paper.questionIds.length
  await paper.save()
  return paper.toSafeJSON()
}

export async function archiveQuestionPaper(id) {
  assertObjectId(id, 'QUESTION_PAPER_NOT_FOUND', '试卷不存在')
  const paper = await QuestionPaper.findById(id)
  if (!paper) throw createQuestionBankError(404, 'QUESTION_PAPER_NOT_FOUND', '试卷不存在')
  if ((paper.source || '').startsWith('builtin-')) {
    throw createQuestionBankError(409, 'BUILTIN_PAPER_READONLY', '内置试卷由题库数据统一维护，不能归档')
  }
  paper.status = 'archived'
  await paper.save()
  return { id: paper._id.toString(), archived: true }
}
