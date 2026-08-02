import { Question } from '#modules/questionBank/models/Question.js'
import { QuestionCategory } from '#modules/questionBank/models/QuestionCategory.js'
import { resolveCategoryScope } from './questionCategory.service.js'
import {
  assertObjectId,
  createQuestionBankError,
  escapeRegExp,
  resolvePaging,
  uniqueStrings
} from './questionBank.utils.js'

export async function buildQuestionQuery(filters = {}, options = {}) {
  const query = {}
  if (options.readyOnly) query.status = 'ready'
  else if (filters.status) query.status = filters.status
  else query.status = { $ne: 'archived' }

  if (filters.categoryId) query.categoryId = { $in: await resolveCategoryScope(filters.categoryId) }
  if (filters.categoryIds?.length) {
    const scopes = await Promise.all(filters.categoryIds.map((categoryId) => resolveCategoryScope(categoryId)))
    query.categoryId = { $in: scopes.flat() }
  }
  if (filters.type) query.type = Array.isArray(filters.type) ? { $in: filters.type } : filters.type
  if (filters.types?.length) query.type = { $in: filters.types }
  if (filters.difficulty) query.difficulty = filters.difficulty
  if (filters.difficulties?.length) query.difficulty = { $in: filters.difficulties }
  if (filters.tag) query.tags = filters.tag
  if (filters.tags?.length) query.tags = { $all: filters.tags }
  if (filters.ids?.length) query._id = { $in: filters.ids }

  const keyword = String(filters.keyword || '').trim()
  if (keyword) {
    const regex = new RegExp(escapeRegExp(keyword), 'i')
    query.$or = [{ code: regex }, { stem: regex }, { explanation: regex }, { tags: regex }]
  }
  return query
}

export async function listQuestions(filters = {}) {
  const paging = resolvePaging(filters, 20)
  const query = await buildQuestionQuery(filters)
  const [items, total] = await Promise.all([
    Question.find(query)
      .populate('categoryId')
      .sort({ updatedAt: -1 })
      .skip(paging.skip)
      .limit(paging.pageSize),
    Question.countDocuments(query)
  ])
  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page: paging.page,
    pageSize: paging.pageSize
  }
}

export async function getQuestion(id) {
  assertObjectId(id, 'QUESTION_NOT_FOUND', '题目不存在')
  const question = await Question.findById(id).populate('categoryId')
  if (!question) throw createQuestionBankError(404, 'QUESTION_NOT_FOUND', '题目不存在')
  return question.toSafeJSON({ includeAnswer: true })
}

async function assertCategory(categoryId) {
  assertObjectId(categoryId, 'QUESTION_CATEGORY_NOT_FOUND', '题库分类不存在')
  const category = await QuestionCategory.findOne({ _id: categoryId, enabled: true })
  if (!category) throw createQuestionBankError(404, 'QUESTION_CATEGORY_NOT_FOUND', '题库分类不存在')
  return category
}

function normalizeQuestionInput(input) {
  return {
    ...input,
    tags: uniqueStrings(input.tags || [], 12),
    answerKeys: uniqueStrings(input.answerKeys || [], 20),
    options: (input.options || []).map((option) => ({
      id: String(option.id).trim(),
      content: String(option.content).trim()
    }))
  }
}

function validateQuestionDefinition(input) {
  const optionIds = input.options.map((item) => item.id)
  if (new Set(optionIds).size !== optionIds.length) {
    throw createQuestionBankError(400, 'QUESTION_OPTION_DUPLICATED', '题目选项编号不能重复')
  }
  if (['single_choice', 'multiple_choice'].includes(input.type)) {
    if (input.options.length < 2) {
      throw createQuestionBankError(400, 'QUESTION_OPTIONS_REQUIRED', '选择题至少需要两个选项')
    }
    if (!input.answerKeys.length || input.answerKeys.some((key) => !optionIds.includes(key))) {
      throw createQuestionBankError(400, 'QUESTION_ANSWER_INVALID', '选择题答案必须对应已有选项')
    }
    if (input.type === 'single_choice' && input.answerKeys.length !== 1) {
      throw createQuestionBankError(400, 'QUESTION_ANSWER_INVALID', '单选题只能设置一个正确答案')
    }
  }
  if (input.type === 'true_false' && (input.answerKeys.length !== 1 || !['true', 'false'].includes(input.answerKeys[0]))) {
    throw createQuestionBankError(400, 'QUESTION_ANSWER_INVALID', '判断题答案必须是 true 或 false')
  }
  if (input.type === 'short_answer' && !input.answerKeys.length) {
    throw createQuestionBankError(400, 'QUESTION_ANSWER_REQUIRED', '简答题至少需要一个参考答案')
  }
}

export async function createQuestion(input, userId) {
  await assertCategory(input.categoryId)
  const normalized = normalizeQuestionInput(input)
  validateQuestionDefinition(normalized)
  const question = await Question.create({
    ...normalized,
    code: normalized.code || `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source: normalized.source || 'manual',
    createdBy: userId
  })
  await question.populate('categoryId')
  return question.toSafeJSON({ includeAnswer: true })
}

export async function updateQuestion(id, input) {
  assertObjectId(id, 'QUESTION_NOT_FOUND', '题目不存在')
  const question = await Question.findById(id)
  if (!question) throw createQuestionBankError(404, 'QUESTION_NOT_FOUND', '题目不存在')
  if (input.categoryId) await assertCategory(input.categoryId)

  const normalized = normalizeQuestionInput({
    ...question.toObject(),
    ...input,
    tags: input.tags ?? question.tags,
    answerKeys: input.answerKeys ?? question.answerKeys,
    options: input.options ?? question.options
  })
  validateQuestionDefinition(normalized)
  const fields = ['categoryId', 'type', 'stem', 'options', 'answerKeys', 'explanation', 'difficulty', 'tags', 'status', 'defaultScore']
  for (const field of fields) {
    if (input[field] !== undefined) question[field] = normalized[field]
  }
  question.version += 1
  await question.save()
  await question.populate('categoryId')
  return question.toSafeJSON({ includeAnswer: true })
}

export async function archiveQuestion(id) {
  assertObjectId(id, 'QUESTION_NOT_FOUND', '题目不存在')
  const question = await Question.findById(id)
  if (!question) throw createQuestionBankError(404, 'QUESTION_NOT_FOUND', '题目不存在')
  question.status = 'archived'
  question.version += 1
  await question.save()
  return { id: question._id.toString(), archived: true }
}
