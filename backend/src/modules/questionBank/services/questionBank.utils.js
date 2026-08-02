import mongoose from 'mongoose'

export function createQuestionBankError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export function assertObjectId(value, code = 'RESOURCE_NOT_FOUND', message = '数据不存在') {
  if (!mongoose.isValidObjectId(value)) {
    throw createQuestionBankError(404, code, message)
  }
}

export function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function uniqueStrings(values = [], limit = 20) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].slice(0, limit)
}

export function normalizeAnswerKeys(value) {
  const values = Array.isArray(value) ? value : [value]
  return values
    .filter((item) => item !== undefined && item !== null)
    .map((item) => String(item).trim())
    .filter(Boolean)
}

function normalizeShortAnswer(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('zh-CN')
    .replace(/\s+/g, ' ')
}

export function areAnswersCorrect(type, submitted = [], expected = []) {
  const submittedKeys = normalizeAnswerKeys(submitted)
  const expectedKeys = normalizeAnswerKeys(expected)

  if (type === 'short_answer') {
    if (submittedKeys.length !== 1) return false
    const answer = normalizeShortAnswer(submittedKeys[0])
    return expectedKeys.some((item) => normalizeShortAnswer(item) === answer)
  }

  const left = [...submittedKeys].sort()
  const right = [...expectedKeys].sort()
  return left.length === right.length && left.every((item, index) => item === right[index])
}

export function shuffleItems(items = []) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

export function resolvePaging(filters = {}, defaultPageSize = 10) {
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(200, Math.max(1, Number(filters.pageSize) || defaultPageSize))
  return { page, pageSize, skip: (page - 1) * pageSize }
}
