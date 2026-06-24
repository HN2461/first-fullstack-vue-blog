import { LedgerCategory } from '#modules/ledger/models/LedgerCategory.js'
import { createError, normalizeAliases, slugifyName, toObjectId } from './ledger.utils.js'
import { ensureDefaultBook, findOwnedBook } from './ledgerBook.service.js'

async function findOwnedCategory(categoryId, userId, bookId) {
  const id = toObjectId(categoryId, 'LEDGER_CATEGORY_NOT_FOUND', '分类不存在')
  const query = { _id: id, userId }
  if (bookId) query.bookId = bookId
  const category = await LedgerCategory.findOne(query)
  if (!category) {
    throw createError(404, 'LEDGER_CATEGORY_NOT_FOUND', '分类不存在')
  }
  return category
}

export { findOwnedCategory }

export async function getCategoryMap(userId, bookId) {
  const categories = await LedgerCategory.find({ userId, bookId, archived: false }).sort({ sortOrder: 1, createdAt: 1 })
  const byName = new Map()
  const byId = new Map()

  for (const category of categories) {
    byId.set(category._id.toString(), category)
    byName.set(category.name.trim().toLowerCase(), category)
    for (const alias of category.aliases || []) {
      byName.set(alias.trim().toLowerCase(), category)
    }
  }

  return { categories, byName, byId }
}

export async function getOrCreateCategoryByName(userId, bookId, name, type) {
  const key = String(name).trim().toLowerCase()
  const map = await getCategoryMap(userId, bookId)
  const matched = map.byName.get(key)
  if (matched && matched.type === type) return matched

  const sortOrder = type === 'income' ? 300 : 100
  const category = await LedgerCategory.create({
    userId,
    bookId,
    name: String(name).trim(),
    code: slugifyName(`${type}-${name}`),
    type,
    aliases: [String(name).trim()],
    sortOrder
  })
  return category
}

export async function listLedgerCategories(userId, options = {}) {
  const book = options.bookId ? await findOwnedBook(options.bookId, userId) : await ensureDefaultBook(userId)
  // ensureDefaultBook 内部已调用 seedDefaultCategories
  const categories = await LedgerCategory.find({ userId, bookId: book._id }).sort({ type: 1, sortOrder: 1, createdAt: 1 })
  return categories.map((category) => category.toSafeJSON())
}

export async function createLedgerCategory(userId, input) {
  const book = await findOwnedBook(input.bookId, userId)
  const category = await LedgerCategory.create({
    ...input,
    userId,
    bookId: book._id,
    code: slugifyName(`${input.type}-${input.name}`),
    aliases: normalizeAliases([input.name, ...(input.aliases || [])])
  })
  return category.toSafeJSON()
}

export async function updateLedgerCategory(userId, id, input) {
  const category = await findOwnedCategory(id, userId)
  Object.assign(category, {
    ...input,
    aliases: input.aliases ? normalizeAliases(input.aliases) : category.aliases
  })
  if (input.name !== undefined) {
    category.code = slugifyName(`${category.type}-${input.name}`)
    category.aliases = normalizeAliases([input.name, ...(category.aliases || [])])
  }
  await category.save()
  return category.toSafeJSON()
}
