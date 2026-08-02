import { QuestionCategory } from '#modules/questionBank/models/QuestionCategory.js'
import { assertObjectId, createQuestionBankError } from './questionBank.utils.js'

function buildCategoryTree(items) {
  const nodes = new Map(items.map((item) => [item.id, { ...item, children: [] }]))
  const roots = []

  for (const item of nodes.values()) {
    if (item.parentId && nodes.has(item.parentId)) {
      nodes.get(item.parentId).children.push(item)
    } else {
      roots.push(item)
    }
  }

  return roots
}

export async function listQuestionCategories(options = {}) {
  const query = options.includeDisabled ? {} : { enabled: true }
  const categories = await QuestionCategory.find(query).sort({ level: 1, sortOrder: 1, name: 1 })
  const items = categories.map((item) => item.toSafeJSON())
  return { items, tree: buildCategoryTree(items) }
}

export async function createQuestionCategory(input) {
  let parent = null
  if (input.parentId) {
    assertObjectId(input.parentId, 'QUESTION_CATEGORY_NOT_FOUND', '上级分类不存在')
    parent = await QuestionCategory.findById(input.parentId)
    if (!parent) throw createQuestionBankError(404, 'QUESTION_CATEGORY_NOT_FOUND', '上级分类不存在')
    if (parent.level >= 12) throw createQuestionBankError(400, 'QUESTION_CATEGORY_LEVEL_LIMIT', '题库分类最多支持 12 层')
  }

  const category = await QuestionCategory.create({
    key: input.key,
    name: input.name,
    parentId: parent?._id || null,
    ancestors: parent ? [...parent.ancestors, parent._id] : [],
    pathNames: parent ? [...parent.pathNames, input.name] : [input.name],
    level: parent ? parent.level + 1 : 1,
    sortOrder: input.sortOrder || 0,
    enabled: input.enabled !== false
  })
  return category.toSafeJSON()
}

export async function updateQuestionCategory(id, input) {
  assertObjectId(id, 'QUESTION_CATEGORY_NOT_FOUND', '题库分类不存在')
  const category = await QuestionCategory.findById(id)
  if (!category) throw createQuestionBankError(404, 'QUESTION_CATEGORY_NOT_FOUND', '题库分类不存在')

  if (input.name !== undefined && input.name !== category.name) {
    category.name = input.name
    category.pathNames = [...category.pathNames.slice(0, -1), input.name]
    const descendants = await QuestionCategory.find({ ancestors: category._id })
    for (const descendant of descendants) {
      const index = descendant.ancestors.findIndex((ancestorId) => ancestorId.equals(category._id))
      descendant.pathNames[index] = input.name
      await descendant.save()
    }
  }
  if (input.sortOrder !== undefined) category.sortOrder = input.sortOrder
  if (input.enabled !== undefined) category.enabled = input.enabled
  await category.save()
  return category.toSafeJSON()
}

export async function resolveCategoryScope(categoryId) {
  if (!categoryId) return []
  assertObjectId(categoryId, 'QUESTION_CATEGORY_NOT_FOUND', '题库分类不存在')
  const category = await QuestionCategory.findById(categoryId)
  if (!category) throw createQuestionBankError(404, 'QUESTION_CATEGORY_NOT_FOUND', '题库分类不存在')
  const descendants = await QuestionCategory.find({ ancestors: category._id }).select('_id')
  return [category._id, ...descendants.map((item) => item._id)]
}
