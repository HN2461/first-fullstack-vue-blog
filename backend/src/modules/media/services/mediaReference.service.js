import { Article } from '#modules/content/models/Article.js'
import { Setting } from '#modules/settings/models/Setting.js'
import { User } from '#modules/user/models/User.js'
import {
  countMediaShareReferencesByMediaIds,
  findMediaShareReferences
} from '#modules/mediaShare/services/mediaShareReference.service.js'
import { WorkLog } from '#modules/workJournal/models/WorkLog.js'

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
    articleDocument: '文章原始文档',
    articleDocumentPreview: '文章阅读版',
    userAvatar: '用户头像',
    setting: '系统设置',
    resourceShare: '资源分享',
    workJournalEvidence: '工作日记图片凭证'
  }
  return labels[type] || '其他引用'
}

const referenceTypeOrder = [
  'articleContent',
  'articleCover',
  'articleResource',
  'articleDocument',
  'articleDocumentPreview',
  'userAvatar',
  'setting',
  'resourceShare',
  'workJournalEvidence'
]

function createReferenceCountMap(mediaItems = []) {
  return new Map(mediaItems.map((media) => [media._id.toString(), Object.fromEntries(
    referenceTypeOrder.map((type) => [type, 0])
  )]))
}

function getMatchedMediaIds(value, urlToMediaIds) {
  const normalized = normalizeUrl(value)
  if (!normalized) return []
  return urlToMediaIds.get(normalized) || []
}

function addReferenceCount(counts, mediaId, type) {
  const mediaCounts = counts.get(mediaId)
  if (mediaCounts) mediaCounts[type] = (mediaCounts[type] || 0) + 1
}

function summarizeReferenceCounts(countByType) {
  const referenceCount = Object.values(countByType).reduce((sum, count) => sum + count, 0)
  const usageStatus = referenceCount > 0 ? 'referenced' : 'unreferenced'
  return {
    usageStatus,
    usageStatusLabel: usageStatus === 'referenced' ? '已引用' : '疑似未引用',
    referenceCount,
    countByType
  }
}

async function getMediaReferenceCounts(mediaItems = []) {
  const counts = createReferenceCountMap(mediaItems)
  if (mediaItems.length === 0) return counts

  const mediaIds = mediaItems.map((media) => media._id)
  const urlToMediaIds = new Map()
  const urlVariants = new Set()
  for (const media of mediaItems) {
    for (const variant of getUrlVariants(media.url)) {
      urlVariants.add(variant)
      const matches = urlToMediaIds.get(variant) || []
      matches.push(media._id.toString())
      urlToMediaIds.set(variant, matches)
    }
  }

  const allUrlVariants = [...urlVariants]
  const contentRegex = allUrlVariants.length > 0
    ? new RegExp(allUrlVariants.map(escapeRegex).join('|'))
    : null
  const articleConditions = []
  if (contentRegex) {
    articleConditions.push(
      { contentMarkdown: contentRegex },
      { cover: { $in: allUrlVariants } },
      { 'resources.url': { $in: allUrlVariants } },
      { 'document.originalUrl': { $in: allUrlVariants } },
      { 'document.previewUrl': { $in: allUrlVariants } }
    )
  }
  articleConditions.push(
    { 'resources.mediaId': { $in: mediaIds } },
    { 'document.originalMediaId': { $in: mediaIds } },
    { 'document.previewMediaId': { $in: mediaIds } }
  )

  const [articles, users, settings, shareCounts, workJournalLogs] = await Promise.all([
    Article.find({ deletedAt: null, $or: articleConditions })
      .select('title slug status contentMarkdown cover resources document updatedAt')
      .lean(),
    allUrlVariants.length > 0
      ? User.find({ avatar: { $in: allUrlVariants } }).select('avatar').lean()
      : [],
    allUrlVariants.length > 0
      ? Setting.find({}).select('key value').lean()
      : [],
    countMediaShareReferencesByMediaIds(mediaIds),
    WorkLog.find({ 'evidence.mediaId': { $in: mediaIds } })
      .select('evidence.mediaId')
      .lean()
  ])

  for (const article of articles) {
    for (const media of mediaItems) {
      const mediaId = media._id.toString()
      if (includesUrl(article.contentMarkdown, media.url)) {
        addReferenceCount(counts, mediaId, 'articleContent')
      }
      if (getMatchedMediaIds(article.cover, urlToMediaIds).includes(mediaId)) {
        addReferenceCount(counts, mediaId, 'articleCover')
      }
      if ((article.resources || []).some((resource) => (
        getMatchedMediaIds(resource?.url, urlToMediaIds).includes(mediaId) ||
        String(resource?.mediaId || '') === mediaId
      ))) {
        addReferenceCount(counts, mediaId, 'articleResource')
      }
      if (
        getMatchedMediaIds(article.document?.originalUrl, urlToMediaIds).includes(mediaId) ||
        String(article.document?.originalMediaId || '') === mediaId
      ) {
        addReferenceCount(counts, mediaId, 'articleDocument')
      }
      if (
        getMatchedMediaIds(article.document?.previewUrl, urlToMediaIds).includes(mediaId) ||
        String(article.document?.previewMediaId || '') === mediaId
      ) {
        addReferenceCount(counts, mediaId, 'articleDocumentPreview')
      }
    }
  }

  for (const user of users) {
    for (const mediaId of getMatchedMediaIds(user.avatar, urlToMediaIds)) {
      addReferenceCount(counts, mediaId, 'userAvatar')
    }
  }

  for (const setting of settings) {
    const valueText = JSON.stringify(setting.value ?? '')
    for (const media of mediaItems) {
      if (includesUrl(valueText, media.url)) {
        addReferenceCount(counts, media._id.toString(), 'setting')
      }
    }
  }

  for (const [mediaId, count] of shareCounts) {
    const mediaCounts = counts.get(mediaId)
    if (mediaCounts) mediaCounts.resourceShare = count
  }

  for (const log of workJournalLogs) {
    const referencedIds = new Set((log.evidence || []).map((item) => item.mediaId?.toString?.()).filter(Boolean))
    for (const mediaId of referencedIds) {
      addReferenceCount(counts, mediaId, 'workJournalEvidence')
    }
  }

  return counts
}

function buildArticleReference(article, type) {
  return {
    type,
    typeLabel: getReferenceLabel(type),
    ownerId: article._id.toString(),
    ownerTitle: article.title,
    ownerSubtitle: article.slug,
    routePath: `/console/manage/articles/${article._id.toString()}/read`,
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
    routeQuery: {
      userId: user._id.toString(),
      keyword: user.username
    },
    status: user.status || '',
    updatedAt: user.updatedAt
  }
}

function buildSettingReference(setting, url) {
  const valueText = JSON.stringify(setting.value ?? '')
  if (!includesUrl(valueText, url)) return null

  const key = String(setting.key || '')
  const sectionByKey = {
    accountRecovery: 'recovery',
    commentEnabled: 'experience',
    defaultTheme: 'experience',
    siteEntranceEffect: 'experience',
    siteTitle: 'site',
    siteDescription: 'site',
    authorName: 'site',
    systemVersion: 'site'
  }
  const section = sectionByKey[key] || ''
  const routeQuery = section ? { section, settingKey: key } : {}

  return {
    type: 'setting',
    typeLabel: getReferenceLabel('setting'),
    ownerId: setting._id.toString(),
    ownerTitle: key,
    ownerSubtitle: setting.group || 'system',
    routePath: section ? '/console/manage/settings' : '',
    routeQuery,
    status: '',
    updatedAt: setting.updatedAt
  }
}

function collectSettingReferences(setting, url) {
  const reference = buildSettingReference(setting, url)
  return reference ? [reference] : []
}

export function summarizeMediaReferences(references = []) {
  const countByType = Object.fromEntries(referenceTypeOrder.map((type) => [type, 0]))

  references.forEach((item) => {
    countByType[item.type] = (countByType[item.type] || 0) + 1
  })

  return summarizeReferenceCounts(countByType)
}

export async function findMediaReferences(media) {
  const url = normalizeUrl(media?.url)
  const shareReferencesPromise = findMediaShareReferences(media?._id)
  if (!url) {
    const [shares, workJournalLogs] = await Promise.all([
      shareReferencesPromise,
      media?._id
        ? WorkLog.find({ 'evidence.mediaId': media._id }).select('title workDate deletedAt createdBy updatedAt').lean()
        : []
    ])
    return [
      ...shares,
      ...workJournalLogs.map((log) => ({
        type: 'workJournalEvidence',
        typeLabel: getReferenceLabel('workJournalEvidence'),
        ownerId: log._id.toString(),
        ownerTitle: log.title,
        ownerSubtitle: log.workDate,
        ownerUserId: log.createdBy?.toString?.() || '',
        routePath: log.deletedAt ? '/console/work-journal/trash' : '/console/work-journal/daily',
        routeQuery: { logId: log._id.toString() },
        status: log.deletedAt ? 'trash' : '',
        updatedAt: log.updatedAt
      }))
    ]
  }

  const urlVariants = getUrlVariants(url)
  const escapedVariants = urlVariants.map(escapeRegex)
  if (escapedVariants.length === 0) {
    return []
  }
  const urlRegex = new RegExp(escapedVariants.join('|'))

  const [articles, users, settings, shares, workJournalLogs] = await Promise.all([
    Article.find({
      deletedAt: null,
      $or: [
        { contentMarkdown: urlRegex },
        { cover: { $in: urlVariants } },
        { 'resources.url': { $in: urlVariants } },
        media?._id ? { 'resources.mediaId': media._id } : null,
        { 'document.originalUrl': { $in: urlVariants } },
        { 'document.previewUrl': { $in: urlVariants } },
        media?._id ? { 'document.originalMediaId': media._id } : null,
        media?._id ? { 'document.previewMediaId': media._id } : null
      ].filter(Boolean)
    }).select('title slug status contentMarkdown cover resources document updatedAt').lean(),
    User.find({ avatar: { $in: urlVariants } }).select('username email avatar status updatedAt').lean(),
    Setting.find({}).select('key value group updatedAt').lean(),
    shareReferencesPromise,
    media?._id
      ? WorkLog.find({ 'evidence.mediaId': media._id }).select('title workDate deletedAt createdBy updatedAt').lean()
      : []
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

    if (
      urlVariants.includes(normalizeUrl(article.document?.originalUrl)) ||
      (media?._id && String(article.document?.originalMediaId || '') === media._id.toString())
    ) {
      references.push(buildArticleReference(article, 'articleDocument'))
    }

    if (
      urlVariants.includes(normalizeUrl(article.document?.previewUrl)) ||
      (media?._id && String(article.document?.previewMediaId || '') === media._id.toString())
    ) {
      references.push(buildArticleReference(article, 'articleDocumentPreview'))
    }
  })

  users.forEach((user) => references.push(buildUserReference(user)))
  settings.forEach((setting) => references.push(...collectSettingReferences(setting, url)))
  references.push(...shares)
  workJournalLogs.forEach((log) => references.push({
    type: 'workJournalEvidence',
    typeLabel: getReferenceLabel('workJournalEvidence'),
    ownerId: log._id.toString(),
    ownerTitle: log.title,
    ownerSubtitle: log.workDate,
    ownerUserId: log.createdBy?.toString?.() || '',
    routePath: log.deletedAt ? '/console/work-journal/trash' : '/console/work-journal/daily',
    routeQuery: { logId: log._id.toString() },
    status: log.deletedAt ? 'trash' : '',
    updatedAt: log.updatedAt
  }))

  return references
}

export async function attachMediaReferenceSummaries(mediaItems = []) {
  const counts = await getMediaReferenceCounts(mediaItems)
  return mediaItems.map((media) => ({
    ...media.toSafeJSON(),
    usage: summarizeReferenceCounts(counts.get(media._id.toString()))
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
