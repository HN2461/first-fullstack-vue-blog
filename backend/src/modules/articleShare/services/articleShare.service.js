import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { ARTICLE_STATUS } from '#constants/domain'
import { env } from '#config/env'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { getDirectoryArticleSort } from '#modules/content/services/articleOrder.service.js'
import { ArticleSharePackage } from '../models/ArticleSharePackage.js'
import {
  assertArticleSharePasswordAttemptAllowed,
  clearArticleSharePasswordFailures,
  createArticleShareSession,
  findValidArticleShareSession,
  invalidateArticleShareSessions,
  recordArticleSharePasswordFailure
} from './articleShareSecurity.service.js'

const COOKIE_SESSION_REQUIRED = true

function shareError(message, statusCode, code) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function getStatus(share, now = new Date()) {
  if (share.status === 'revoked') return 'revoked'
  if (share.expiresAt && share.expiresAt <= now) return 'expired'
  return 'active'
}

function assertUsable(share, allowExpiredSession = false) {
  const status = getStatus(share)
  if (status === 'revoked') throw shareError('共享阅读链接已被撤销', 410, 'ARTICLE_SHARE_REVOKED')
  if (status === 'expired' && !allowExpiredSession) throw shareError('共享阅读链接已过期', 410, 'ARTICLE_SHARE_EXPIRED')
}

function normalizeExpiresAt(value) {
  if (value === null || value === undefined || value === '') return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime()) || date <= new Date()) {
    throw shareError('分享有效期必须是未来时间', 400, 'ARTICLE_SHARE_EXPIRES_INVALID')
  }
  return date
}

function serializeAdmin(share, includeCode = false) {
  return {
    id: share._id.toString(),
    publicId: share.publicId,
    sharePath: `/s/${share.publicId}`,
    title: share.title,
    description: share.description || '',
    scopeType: share.scopeType,
    sourceArticle: share.sourceArticle?.toString?.() || share.sourceArticle || null,
    sourceCategory: share.sourceCategory?.toString?.() || share.sourceCategory || null,
    includeDescendants: share.includeDescendants === true,
    mode: share.mode,
    status: getStatus(share),
    expiresAt: share.expiresAt,
    entryCount: share.entries.length,
    accessCount: share.accessCount,
    viewCount: share.viewCount,
    entries: share.entries.map((entry) => ({ articleId: entry.article.toString(), title: entry.title, slug: entry.slug })),
    ...(includeCode ? { extractionCode: share.passwordCipher ? decryptShareCode(share.passwordCipher) : null } : {}),
    createdAt: share.createdAt,
    updatedAt: share.updatedAt,
    revokedAt: share.revokedAt
  }
}

function serializePublic(share, unlocked, article = null) {
  return {
    publicId: share.publicId,
    title: share.title,
    description: share.description || '',
    scopeType: share.scopeType,
    mode: share.mode,
    unlocked,
    expiresAt: share.expiresAt,
    status: getStatus(share),
    entryCount: share.entries.length,
    entries: unlocked ? share.entries.map((entry) => ({
      articleId: entry.article.toString(),
      title: entry.title,
      slug: entry.slug
    })) : [],
    article: article ? serializeSharedArticle(article) : null
  }
}

function serializeSharedArticle(article) {
  // 匿名分享只提供阅读所需正文，不把站内附件/原始文档地址变成绕过分享权限的下载入口。
  const safe = article.toSafeJSON({ includeResources: false })
  if (article.contentMode === 'document') {
    return {
      ...safe,
      contentMode: 'markdown',
      contentMarkdown: article.document?.extractedText || '该文档暂未生成可公开的文本预览。',
      document: null
    }
  }
  return safe
}

function encryptShareCode(code) {
  const key = crypto.createHash('sha256').update(`article-share:${env.mediaShareEncryptionKey}`).digest()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()])
  return ['v1', iv, cipher.getAuthTag(), encrypted].map((item) => Buffer.isBuffer(item) ? item.toString('base64url') : item).join('.')
}

function decryptShareCode(payload) {
  const [version, ivValue, authTagValue, encryptedValue] = String(payload || '').split('.')
  if (version !== 'v1' || !ivValue || !authTagValue || !encryptedValue) return ''
  try {
    const key = crypto.createHash('sha256').update(`article-share:${env.mediaShareEncryptionKey}`).digest()
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivValue, 'base64url'))
    decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'))
    return Buffer.concat([decipher.update(Buffer.from(encryptedValue, 'base64url')), decipher.final()]).toString('utf8')
  } catch {
    return ''
  }
}

async function resolveEntries(input) {
  if (input.scopeType === 'article') {
    const article = await Article.findOne({ _id: input.articleId, status: ARTICLE_STATUS.PUBLISHED, deletedAt: null }).select('_id title slug category sortOrder')
    if (!article) throw shareError('文章不存在、未发布或已删除', 404, 'ARTICLE_SHARE_ARTICLE_NOT_FOUND')
    return { title: input.title || article.title, sourceArticle: article._id, sourceCategory: article.category, entries: [{ article: article._id, title: article.title, slug: article.slug, category: article.category, sortOrder: article.sortOrder || 0 }] }
  }

  const category = await Category.findOne({ _id: input.categoryId, status: 'active', isSystem: { $ne: true } })
  if (!category) throw shareError('分类不存在或不可分享', 404, 'ARTICLE_SHARE_CATEGORY_NOT_FOUND')

  const categoryIds = [category._id]
  if (input.includeDescendants) {
    const categories = await Category.find({ status: 'active', isSystem: { $ne: true } }).select('_id parent').lean()
    const pending = [category._id.toString()]
    const seen = new Set(pending)
    while (pending.length) {
      const current = pending.shift()
      for (const item of categories) {
        if (item.parent?.toString() === current && !seen.has(item._id.toString())) {
          seen.add(item._id.toString())
          pending.push(item._id.toString())
          categoryIds.push(item._id)
        }
      }
    }
  }

  const articles = await Article.find({ category: { $in: categoryIds }, status: ARTICLE_STATUS.PUBLISHED, deletedAt: null })
    .select('_id title slug category sortOrder')
    .sort(getDirectoryArticleSort())
  if (!articles.length) throw shareError('当前分类没有可分享的已发布文章', 400, 'ARTICLE_SHARE_EMPTY_CATEGORY')
  return {
    title: input.title || category.name,
    sourceCategory: category._id,
    entries: articles.map((article) => ({ article: article._id, title: article.title, slug: article.slug, category: article.category, sortOrder: article.sortOrder || 0 }))
  }
}

export async function createArticleShare(input, actor) {
  const resolved = await resolveEntries(input)
  const password = input.mode === 'password' ? String(crypto.randomInt(0, 10000)).padStart(4, '0') : ''
  const share = await ArticleSharePackage.create({
    publicId: crypto.randomBytes(18).toString('base64url'),
    title: resolved.title,
    description: input.description || '',
    scopeType: input.scopeType,
    sourceArticle: resolved.sourceArticle || null,
    sourceCategory: resolved.sourceCategory || null,
    includeDescendants: input.includeDescendants,
    entries: resolved.entries,
    mode: input.mode,
    passwordHash: password ? await bcrypt.hash(password, 10) : '',
    passwordCipher: password ? encryptShareCode(password) : '',
    expiresAt: normalizeExpiresAt(input.expiresAt),
    createdBy: actor._id
  })
  return { ...serializeAdmin(share), extractionCode: password || null }
}

export async function listArticleShares({ actor, page = 1, pageSize = 20, keyword, status, scopeType } = {}) {
  const currentPage = Math.max(1, Number(page) || 1)
  const limit = Math.min(100, Math.max(1, Number(pageSize) || 20))
  const query = { createdBy: actor._id }
  if (status) query.status = status
  if (scopeType) query.scopeType = scopeType
  if (keyword) query.$or = [{ title: new RegExp(String(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }, { description: new RegExp(String(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }]
  const [items, total] = await Promise.all([
    ArticleSharePackage.find(query).sort({ updatedAt: -1 }).skip((currentPage - 1) * limit).limit(limit),
    ArticleSharePackage.countDocuments(query)
  ])
  return { items: items.map((item) => serializeAdmin(item)), total, page: currentPage, pageSize: limit }
}

export async function getArticleShareDetail(id, actor) {
  const share = await ArticleSharePackage.findOne({ _id: id, createdBy: actor._id }).select('+passwordCipher')
  if (!share) throw shareError('共享阅读链接不存在', 404, 'ARTICLE_SHARE_NOT_FOUND')
  return serializeAdmin(share, true)
}

export async function updateArticleShare(id, input, actor) {
  const share = await ArticleSharePackage.findOne({ _id: id, createdBy: actor._id })
  if (!share) throw shareError('共享阅读链接不存在', 404, 'ARTICLE_SHARE_NOT_FOUND')
  if (input.title !== undefined) share.title = input.title
  if (input.description !== undefined) share.description = input.description
  if (input.expiresAt !== undefined) share.expiresAt = normalizeExpiresAt(input.expiresAt)
  await share.save()
  return serializeAdmin(share)
}

export async function revokeArticleShare(id, actor) {
  const share = await ArticleSharePackage.findOne({ _id: id, createdBy: actor._id })
  if (!share) throw shareError('共享阅读链接不存在', 404, 'ARTICLE_SHARE_NOT_FOUND')
  share.status = 'revoked'
  share.revokedAt = new Date()
  share.revokedBy = actor._id
  share.accessVersion += 1
  await share.save()
  await invalidateArticleShareSessions(share._id)
  return serializeAdmin(share)
}

export async function getPublicArticleShare(publicId, req) {
  const share = await ArticleSharePackage.findOne({ publicId })
  if (!share) throw shareError('共享阅读链接不存在', 404, 'ARTICLE_SHARE_NOT_FOUND')
  const session = await findValidArticleShareSession(share, req)
  assertUsable(share, Boolean(session))
  await ArticleSharePackage.updateOne({ _id: share._id }, { $inc: { viewCount: 1 }, $set: { lastAccessAt: new Date() } })
  if (!session) return serializePublic(share, false)
  return serializePublic(share, true, await getSharedArticle(share, req.params.articleSlug || share.entries[0].slug))
}

async function getPublicWithSession(publicId, req) {
  const share = await ArticleSharePackage.findOne({ publicId })
  if (!share) throw shareError('共享阅读链接不存在', 404, 'ARTICLE_SHARE_NOT_FOUND')
  const session = await findValidArticleShareSession(share, req)
  assertUsable(share, Boolean(session))
  return { share, session }
}

async function establishAccess(share, mode, req, res) {
  const current = await findValidArticleShareSession(share, req)
  if (current) return { share, session: current }
  const updated = await ArticleSharePackage.findOneAndUpdate({ _id: share._id, status: 'active', $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }, { $inc: { accessCount: 1 }, $set: { lastAccessAt: new Date() } }, { new: true })
  if (!updated) throw shareError('共享阅读链接已过期或被撤销', 410, 'ARTICLE_SHARE_UNAVAILABLE')
  return { share: updated, session: await createArticleShareSession(updated, mode, req, res) }
}

export async function claimPublicArticleShare(publicId, req, res) {
  const { share } = await getPublicWithSession(publicId, req)
  if (share.mode !== 'public') throw shareError('该共享阅读链接需要提取码', 400, 'ARTICLE_SHARE_PASSWORD_REQUIRED')
  const result = await establishAccess(share, 'public', req, res)
  return serializePublic(result.share, true, await getSharedArticle(result.share, result.share.entries[0].slug))
}

export async function verifyPublicArticleShare(publicId, code, req, res) {
  const share = await ArticleSharePackage.findOne({ publicId }).select('+passwordHash')
  if (!share) throw shareError('共享阅读链接不存在', 404, 'ARTICLE_SHARE_NOT_FOUND')
  const existing = await findValidArticleShareSession(share, req)
  assertUsable(share, Boolean(existing))
  if (existing) return serializePublic(share, true, await getSharedArticle(share, share.entries[0].slug))
  await assertArticleSharePasswordAttemptAllowed(share, req)
  if (share.mode !== 'password' || !(await bcrypt.compare(code, share.passwordHash))) {
    await recordArticleSharePasswordFailure(share, req)
    throw shareError('提取码不正确', 400, 'ARTICLE_SHARE_PASSWORD_INVALID')
  }
  await clearArticleSharePasswordFailures(share, req)
  const result = await establishAccess(share, 'password', req, res)
  return serializePublic(result.share, true, await getSharedArticle(result.share, result.share.entries[0].slug))
}

async function getSharedArticle(share, slug) {
  const entry = share.entries.find((item) => item.slug === slug)
  if (!entry) throw shareError('文章不在当前共享范围内', 404, 'ARTICLE_SHARE_ARTICLE_NOT_INCLUDED')
  const article = await Article.findOne({ _id: entry.article, status: ARTICLE_STATUS.PUBLISHED, deletedAt: null }).populate('category').populate('tags').populate('createdBy', 'username avatar gender role')
  if (!article) throw shareError('文章已下架或删除', 410, 'ARTICLE_SHARE_ARTICLE_UNAVAILABLE')
  return article
}

export async function getPublicSharedArticle(publicId, slug, req) {
  const { share, session } = await getPublicWithSession(publicId, req)
  if (!session || !COOKIE_SESSION_REQUIRED) throw shareError('请先获取共享阅读权限', 403, 'ARTICLE_SHARE_ACCESS_REQUIRED')
  return serializePublic(share, true, await getSharedArticle(share, slug))
}
