import { Article } from '#modules/content/models/Article.js'
import { Setting } from '#modules/settings/models/Setting.js'
import { User } from '#modules/user/models/User.js'

function normalizeUrl(value) {
  const text = String(value || '').trim()
  if (!text) return ''

  try {
    const decoded = decodeURI(text)
    return decoded
  } catch {
    return text
  }
}

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getUrlVariants(url) {
  const normalized = normalizeUrl(url)
  const variants = new Set([normalized])

  try {
    variants.add(encodeURI(normalized))
  } catch {
    // ignore malformed urls; the normalized value is still useful for exact checks.
  }

  return [...variants].filter(Boolean)
}

function includesUrl(value, url) {
  const text = String(value || '')
  if (!text || !url) return false
  return getUrlVariants(url).some((variant) => text.includes(variant))
}

function getReferenceLabel(type) {
  const labels = {
    articleContent: '文章正文',
    articleCover: '文章封面',
    articleResource: '文章关联资源',
    userAvatar: '用户头像',
    setting: '系统设置'
  }
  return labels[type] || '其他引用'
}

function buildArticleReference(article, type) {
  return {
    type,
    typeLabel: getReferenceLabel(type),
    ownerId: article._id.toString(),
    ownerTitle: article.title,
    ownerSubtitle: article.slug,
    routePath: `/console/manage/articles/${article._id.toString()}`,
    status: article.status || '',
    updatedAt: article.updatedAt
  }
}

function buildUserReference(user) {
  return {
    type: 'userAvatar',
    typeLabel: getReferenceLabel('userAvatar'),
    ownerId: user._id.toString(),
    ownerTitle: user.username,
    ownerSubtitle: user.email,
    routePath: '/console/manage/users',
    status: user.status || '',
    updatedAt: user.updatedAt
  }
}

function collectSettingReferences(setting, url) {
  const valueText = JSON.stringify(setting.value ?? '')
  if (!includesUrl(valueText, url)) return []

  return [{
    type: 'setting',
    typeLabel: getReferenceLabel('setting'),
    ownerId: setting._id.toString(),
    ownerTitle: setting.key,
    ownerSubtitle: setting.group || 'system',
    routePath: '/console/manage/settings',
    status: '',
    updatedAt: setting.updatedAt
  }]
}

export function summarizeMediaReferences(references = []) {
  const typeOrder = ['articleContent', 'articleCover', 'articleResource', 'userAvatar', 'setting']
  const countByType = Object.fromEntries(typeOrder.map((type) => [type, 0]))

  references.forEach((item) => {
    countByType[item.type] = (countByType[item.type] || 0) + 1
  })

  const usageStatus = references.length > 0 ? 'referenced' : 'unreferenced'
  return {
    usageStatus,
    usageStatusLabel: usageStatus === 'referenced' ? '已引用' : '疑似未引用',
    referenceCount: references.length,
    countByType
  }
}

export async function findMediaReferences(media) {
  const url = normalizeUrl(media?.url)
  if (!url) {
    return []
  }

  const urlVariants = getUrlVariants(url)
  const escapedVariants = urlVariants.map(escapeRegex)
  if (escapedVariants.length === 0) {
    return []
  }
  const urlRegex = new RegExp(escapedVariants.join('|'))

  const [articles, users, settings] = await Promise.all([
    Article.find({
      deletedAt: null,
      $or: [
        { contentMarkdown: urlRegex },
        { cover: { $in: urlVariants } },
        { 'resources.url': { $in: urlVariants } },
        media?._id ? { 'resources.mediaId': media._id } : null
      ].filter(Boolean)
    }).select('title slug status contentMarkdown cover resources updatedAt').lean(),
    User.find({ avatar: { $in: urlVariants } }).select('username email avatar status updatedAt').lean(),
    Setting.find({}).select('key value group updatedAt').lean()
  ])

  const references = []

  articles.forEach((article) => {
    if (includesUrl(article.contentMarkdown, url)) {
      references.push(buildArticleReference(article, 'articleContent'))
    }

    if (urlVariants.includes(normalizeUrl(article.cover))) {
      references.push(buildArticleReference(article, 'articleCover'))
    }

    const hasResourceUrl = (article.resources || []).some((resource) =>
      urlVariants.includes(normalizeUrl(resource?.url)) ||
      (media?._id && String(resource?.mediaId || '') === media._id.toString())
    )
    if (hasResourceUrl) {
      references.push(buildArticleReference(article, 'articleResource'))
    }
  })

  users.forEach((user) => references.push(buildUserReference(user)))
  settings.forEach((setting) => references.push(...collectSettingReferences(setting, url)))

  return references
}

export async function attachMediaReferenceSummaries(mediaItems = []) {
  return Promise.all(mediaItems.map(async (media) => {
    const references = await findMediaReferences(media)
    return {
      ...media.toSafeJSON(),
      usage: summarizeMediaReferences(references)
    }
  }))
}

export async function getMediaReferenceDetail(media) {
  const references = await findMediaReferences(media)
  return {
    media: media.toSafeJSON(),
    references,
    summary: summarizeMediaReferences(references)
  }
}
