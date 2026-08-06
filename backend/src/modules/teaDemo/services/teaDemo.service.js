import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { env } from '#config/env'
import {
  TEA_DEMO_CATEGORIES,
  TEA_DEMO_DEFAULT_PRODUCT_SPECS,
  TEA_DEMO_PRODUCT_STATUS,
  TEA_DEMO_ROLE_PERMISSIONS,
  TEA_DEMO_ROLES
} from '#modules/teaDemo/constants/teaDemo.constants.js'
import { TeaDemoProduct } from '#modules/teaDemo/models/TeaDemoProduct.js'
import { TeaDemoUser } from '#modules/teaDemo/models/TeaDemoUser.js'
import { decryptTeaDemoCredential, issueTeaDemoCredentialChallenge } from '#modules/teaDemo/utils/teaDemoSecurity.js'
import { signTeaDemoAccessToken } from '#modules/teaDemo/utils/teaDemoToken.js'
import { ensureTeaDemoSeed } from '#modules/teaDemo/services/teaDemoSeed.service.js'
import {
  parseBody,
  teaDemoLoginCredentialSchema,
  teaDemoRegisterCredentialSchema
} from '#modules/teaDemo/validators/teaDemo.validator.js'

const MAX_FAILED_LOGIN_COUNT = 5
const LOGIN_LOCK_MS = 15 * 60 * 1000
const PUBLIC_STATUS = [TEA_DEMO_PRODUCT_STATUS.ON_SALE, TEA_DEMO_PRODUCT_STATUS.SOLD_OUT]

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function assertValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, 'INVALID_ID', '商品 ID 不正确')
  }
}

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseBoolean(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') return true
  if (value === false || value === 'false' || value === 0 || value === '0') return false
  return undefined
}

function isLocked(user) {
  return user.lockedUntil && user.lockedUntil.getTime() > Date.now()
}

function normalizeIdentifier(value = '') {
  return value.trim().toLowerCase()
}

function resolveStringField(input, field, fallback = '') {
  if (Object.hasOwn(input, field)) {
    return String(input[field] ?? '').trim()
  }
  return String(fallback ?? '').trim()
}

function normalizeProductSpecs(input = {}) {
  const defaultSpecs = structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS)

  const sizes = Array.isArray(input.sizes) && input.sizes.length
    ? input.sizes.map((item) => ({
        code: String(item.code || '').trim(),
        name: String(item.name || '').trim(),
        nameEn: String(item.nameEn || '').trim(),
        extraPrice: Number.isFinite(Number(item.extraPrice)) ? Number(item.extraPrice) : 0
      })).filter((item) => item.code && item.name)
    : defaultSpecs.sizes

  const sweetness = Array.isArray(input.sweetness) && input.sweetness.length
    ? input.sweetness.map((item) => ({
        code: String(item.code || '').trim(),
        name: String(item.name || '').trim(),
        nameEn: String(item.nameEn || '').trim()
      })).filter((item) => item.code && item.name)
    : defaultSpecs.sweetness

  const toppings = Array.isArray(input.toppings) && input.toppings.length
    ? input.toppings.map((item) => ({
        code: String(item.code || '').trim(),
        name: String(item.name || '').trim(),
        nameEn: String(item.nameEn || '').trim(),
        price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0
      })).filter((item) => item.code && item.name)
    : defaultSpecs.toppings

  return { sizes, sweetness, toppings }
}

function normalizeProductDraft(input = {}, existing = null) {
  const name = resolveStringField(input, 'name', existing?.name)
  const description = resolveStringField(input, 'description', existing?.description)
  const imageUrl = Object.hasOwn(input, 'imageUrl')
    ? resolveStringField(input, 'imageUrl')
    : Object.hasOwn(input, 'image')
      ? resolveStringField(input, 'image')
      : resolveStringField(existing || {}, 'imageUrl', existing?.image || '/images/logo.webp')
  const image = imageUrl || '/images/logo.webp'

  return {
    name,
    nameEn: resolveStringField(input, 'nameEn', existing?.nameEn || name),
    description,
    descriptionEn: resolveStringField(input, 'descriptionEn', existing?.descriptionEn || description),
    price: Number.isFinite(Number(input.price)) ? Number(input.price) : Number(existing?.price || 0),
    categoryCode: String(input.categoryCode || existing?.categoryCode || 'fruit').trim(),
    image,
    imageUrl,
    bannerImages: Array.isArray(input.bannerImages)
      ? input.bannerImages.map((item) => String(item).trim()).filter(Boolean)
      : [...(existing?.bannerImages || [])],
    isNew: typeof input.isNew === 'boolean' ? input.isNew : !!existing?.isNew,
    isHot: typeof input.isHot === 'boolean' ? input.isHot : !!existing?.isHot,
    status: String(input.status || existing?.status || TEA_DEMO_PRODUCT_STATUS.ON_SALE).trim(),
    stock: Number.isFinite(Number(input.stock)) ? Number(input.stock) : Number(existing?.stock ?? 999),
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : Number(existing?.sortOrder || 0),
    specs: input.specs ? normalizeProductSpecs(input.specs) : (existing?.specs || structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS))
  }
}

function buildUserPayload(user) {
  return user.toSafeJSON({
    permissions: [...(TEA_DEMO_ROLE_PERMISSIONS[user.role] || TEA_DEMO_ROLE_PERMISSIONS[TEA_DEMO_ROLES.USER])]
  })
}

function findProductCategory(categoryCode) {
  return TEA_DEMO_CATEGORIES.find((category) => category.code === categoryCode) || TEA_DEMO_CATEGORIES[1]
}

export function getTeaDemoCategories() {
  return TEA_DEMO_CATEGORIES
}

export function issueTeaDemoChallenge(purpose) {
  return issueTeaDemoCredentialChallenge(purpose)
}

export async function registerTeaDemoUser(encryptedCredential) {
  await ensureTeaDemoSeed()
  const decrypted = decryptTeaDemoCredential(encryptedCredential, 'register')
  const credential = parseBody(teaDemoRegisterCredentialSchema, decrypted)
  const username = normalizeIdentifier(credential.username)
  const email = normalizeIdentifier(credential.email)
  const password = credential.password
  const nickname = String(credential.nickname || username || '演示用户').trim()
  const avatar = String(credential.avatar || '/images/default-avatar.png').trim()

  const usernameExists = await TeaDemoUser.exists({ username })
  if (usernameExists) {
    throw createHttpError(409, 'USERNAME_EXISTS', '用户名已存在')
  }

  const emailExists = await TeaDemoUser.exists({ email })
  if (emailExists) {
    throw createHttpError(409, 'EMAIL_EXISTS', '邮箱已存在')
  }

  let user
  try {
    user = await TeaDemoUser.create({
      username,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      nickname,
      avatar,
      role: TEA_DEMO_ROLES.USER
    })
  } catch (error) {
    if (error?.code !== 11000) throw error
    if (error?.keyPattern?.email) {
      throw createHttpError(409, 'EMAIL_EXISTS', '邮箱已存在')
    }
    throw createHttpError(409, 'USERNAME_EXISTS', '用户名已存在')
  }

  return buildUserPayload(user)
}

export async function loginTeaDemoUser(encryptedCredential) {
  await ensureTeaDemoSeed()
  const decrypted = decryptTeaDemoCredential(encryptedCredential, 'login')
  const credential = parseBody(teaDemoLoginCredentialSchema, decrypted)
  const identifier = normalizeIdentifier(credential.identifier)
  const password = credential.password

  const user = await TeaDemoUser.findOne({
    $or: [
      { username: identifier },
      { email: identifier }
    ]
  })

  if (!user) {
    throw createHttpError(401, 'INVALID_CREDENTIALS', '账号或密码不正确')
  }

  if (user.status === 'disabled') {
    throw createHttpError(403, 'USER_DISABLED', '账号已被禁用')
  }

  if (isLocked(user)) {
    throw createHttpError(423, 'ACCOUNT_LOCKED', '登录失败次数过多，请稍后再试')
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) {
    user.failedLoginCount = (user.failedLoginCount || 0) + 1
    if (user.failedLoginCount >= MAX_FAILED_LOGIN_COUNT) {
      user.lockedUntil = new Date(Date.now() + LOGIN_LOCK_MS)
    }
    await user.save()
    throw createHttpError(401, 'INVALID_CREDENTIALS', '账号或密码不正确')
  }

  user.failedLoginCount = 0
  user.lockedUntil = null
  user.lastLoginAt = new Date()
  await user.save()

  return {
    token: signTeaDemoAccessToken(user),
    tokenType: 'Bearer',
    expiresIn: env.teaDemoJwtExpiresIn,
    user: buildUserPayload(user)
  }
}

export async function refreshTeaDemoToken(user) {
  await ensureTeaDemoSeed()
  if (!user || user.status === 'disabled') {
    throw createHttpError(401, 'UNAUTHORIZED', '登录状态已失效')
  }

  return {
    token: signTeaDemoAccessToken(user),
    tokenType: 'Bearer',
    expiresIn: env.teaDemoJwtExpiresIn
  }
}

export async function logoutTeaDemoUser(user) {
  if (!user) {
    throw createHttpError(401, 'UNAUTHORIZED', '请先登录')
  }

  user.tokenVersion = (user.tokenVersion || 0) + 1
  await user.save()
  return null
}

export async function getTeaDemoMe(user) {
  await ensureTeaDemoSeed()
  if (!user) {
    throw createHttpError(401, 'UNAUTHORIZED', '请先登录')
  }
  return buildUserPayload(user)
}

export async function listTeaDemoProducts(query = {}, options = {}) {
  await ensureTeaDemoSeed()

  const adminView = !!options.admin
  const page = Math.max(1, parseNumber(query.page, 1))
  const pageSize = Math.min(100, Math.max(1, parseNumber(query.pageSize, 12)))
  const keyword = String(query.keyword || '').trim()
  const categoryCode = String(query.categoryCode || query.category || '').trim()
  const status = String(query.status || '').trim()
  const isHot = parseBoolean(query.isHot)
  const isNew = parseBoolean(query.isNew)

  const filter = {}

  if (!adminView) {
    filter.status = { $in: PUBLIC_STATUS }
  } else if (status) {
    filter.status = status
  }

  if (categoryCode && categoryCode !== 'all') {
    filter.categoryCode = categoryCode
  }

  if (typeof isHot === 'boolean') {
    filter.isHot = isHot
  }

  if (typeof isNew === 'boolean') {
    filter.isNew = isNew
  }

  if (keyword) {
    const escapedKeyword = escapeRegExp(keyword)
    filter.$or = [
      { name: new RegExp(escapedKeyword, 'i') },
      { nameEn: new RegExp(escapedKeyword, 'i') },
      { description: new RegExp(escapedKeyword, 'i') },
      { descriptionEn: new RegExp(escapedKeyword, 'i') }
    ]
  }

  const [total, items] = await Promise.all([
    TeaDemoProduct.countDocuments(filter),
    TeaDemoProduct.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
  ])

  return {
    list: items.map((item) => item.toListJSON()),
    total,
    page,
    pageSize
  }
}

export async function getTeaDemoProductById(id, options = {}) {
  await ensureTeaDemoSeed()
  assertValidObjectId(id)
  const adminView = !!options.admin
  const product = await TeaDemoProduct.findById(id)

  if (!product) {
    throw createHttpError(404, 'PRODUCT_NOT_FOUND', '商品不存在')
  }

  if (!adminView && !PUBLIC_STATUS.includes(product.status)) {
    throw createHttpError(404, 'PRODUCT_NOT_FOUND', '商品不存在')
  }

  return product.toDetailJSON()
}

export async function createTeaDemoProduct(input) {
  await ensureTeaDemoSeed()
  const draft = normalizeProductDraft(input)
  const category = findProductCategory(draft.categoryCode)

  const product = await TeaDemoProduct.create({
    ...draft,
    categoryCode: category.code,
    image: draft.image || '/images/logo.webp',
    imageUrl: draft.imageUrl || draft.image || '/images/logo.webp',
    bannerImages: draft.bannerImages.length ? draft.bannerImages : [draft.imageUrl || draft.image || '/images/logo.webp'],
    specs: draft.specs || structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS)
  })

  return product.toDetailJSON()
}

export async function updateTeaDemoProduct(id, input) {
  await ensureTeaDemoSeed()
  assertValidObjectId(id)
  const product = await TeaDemoProduct.findById(id)
  if (!product) {
    throw createHttpError(404, 'PRODUCT_NOT_FOUND', '商品不存在')
  }

  const draft = normalizeProductDraft(input, product)
  const category = findProductCategory(draft.categoryCode)

  product.name = draft.name
  product.nameEn = draft.nameEn
  product.description = draft.description
  product.descriptionEn = draft.descriptionEn
  product.price = draft.price
  product.categoryCode = category.code
  product.image = draft.image
  product.imageUrl = draft.imageUrl
  product.bannerImages = draft.bannerImages.length ? draft.bannerImages : [draft.imageUrl || draft.image || '/images/logo.webp']
  product.isNew = draft.isNew
  product.isHot = draft.isHot
  product.status = draft.status
  product.stock = draft.stock
  product.sortOrder = draft.sortOrder
  product.specs = draft.specs || structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS)

  await product.save()
  return product.toDetailJSON()
}

export async function updateTeaDemoProductStatus(id, status) {
  await ensureTeaDemoSeed()
  assertValidObjectId(id)
  const product = await TeaDemoProduct.findById(id)
  if (!product) {
    throw createHttpError(404, 'PRODUCT_NOT_FOUND', '商品不存在')
  }

  if (!Object.values(TEA_DEMO_PRODUCT_STATUS).includes(status)) {
    throw createHttpError(400, 'INVALID_PRODUCT_STATUS', '商品状态不正确')
  }

  product.status = status
  await product.save()
  return product.toDetailJSON()
}

export async function deleteTeaDemoProduct(id) {
  await ensureTeaDemoSeed()
  assertValidObjectId(id)
  const result = await TeaDemoProduct.deleteOne({ _id: id })

  if (!result.deletedCount) {
    throw createHttpError(404, 'PRODUCT_NOT_FOUND', '商品不存在')
  }

  return {
    deleted: true
  }
}

export async function listTeaDemoAdminProducts(query = {}) {
  return listTeaDemoProducts(query, { admin: true })
}
