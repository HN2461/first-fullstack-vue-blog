import { Resume } from '#modules/resume/models/Resume.js'
import { getResourcePath, getResourceAliases } from './resourceIdentity.service.js'
import { Article } from '#modules/content/models/Article.js'
import { Setting } from '#modules/settings/models/Setting.js'
import { User } from '#modules/user/models/User.js'
import {
  countMediaShareReferencesByMediaIds,
  findMediaShareReferences
} from '#modules/mediaShare/services/mediaShareReference.service.js'
import { WorkLog } from '#modules/workJournal/models/WorkLog.js'
import { getIndexedResourceReferences, getIndexedResourceReferenceMap, mergeResourceReferences, filterIndexedResourceReferences } from './resourceReferenceIndex.service.js'

function normalizeUrl(value) {
  const text = String(value || '').trim()
  if (!text) return ''

  try {
    const decoded = decodeURI(getResourcePath(text) || text)
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

function getMediaUrlVariants(media) {
  return [...new Set(getResourceAliases(media).flatMap(getUrlVariants))]
}

function getAddressRegex(variants) {
  // 历史字段既可能保存相对路径，也可能保存带域名及查询参数的完整网址。
  return new RegExp(`^(?:https?:\\/\\/[^/]+)?(?:${variants.map(escapeRegex).join('|')})(?:[?#].*)?$`)
}

function includesMediaUrl(value, media) {
  return getMediaUrlVariants(media).some((url) => includesUrl(value, url))
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
    resumePhoto: '简历照片',
    setting: '系统设置',
    resourceShare: '资源分享',
    workJournalEvidence: '工作日记图片凭证',
    feedbackAttachment: '意见反馈图片'
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
  'resumePhoto',
  'setting',
  'resourceShare',
  'workJournalEvidence',
  'feedbackAttachment'
]

function createReferenceCountMap(mediaItems = []) {
  return new Map(mediaItems.map((media) => [media._id.toString(), {
    countByType: Object.fromEntries(referenceTypeOrder.map((type) => [type, 0])),
    keys: new Set()
  }]))
}

function getMatchedMediaIds(value, urlToMediaIds) {
  const normalized = normalizeUrl(value)
  if (!normalized) return []
  return urlToMediaIds.get(normalized) || []
}

function addReferenceCount(counts, mediaId, type, ownerId) {
  const entry = counts.get(mediaId)
  if (!entry) return
  const key = `${type}:${ownerId}`
  if (entry.keys.has(key)) return
  entry.keys.add(key)
  entry.countByType[type] = (entry.countByType[type] || 0) + 1
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
    for (const variant of getMediaUrlVariants(media)) {
      urlVariants.add(variant)
      const matches = urlToMediaIds.get(variant) || []
      matches.push(media._id.toString())
      urlToMediaIds.set(variant, matches)
    }
  }

  const allUrlVariants = [...urlVariants]
  const addressRegex = allUrlVariants.length ? getAddressRegex(allUrlVariants) : null
  const contentRegex = allUrlVariants.length > 0
    ? new RegExp(allUrlVariants.map(escapeRegex).join('|'))
    : null
  const articleConditions = []
  if (contentRegex) {
    articleConditions.push(
      { contentMarkdown: contentRegex },
      { cover: addressRegex },
      { 'resources.url': addressRegex },
      { 'document.originalUrl': addressRegex },
      { 'document.previewUrl': addressRegex }
    )
  }
  articleConditions.push(
    { 'resources.mediaId': { $in: mediaIds } },
    { 'document.originalMediaId': { $in: mediaIds } },
    { 'document.previewMediaId': { $in: mediaIds } }
  )

  const [articles, users, settings, shareCounts, workJournalLogs, resumes] = await Promise.all([
    Article.find({ $or: articleConditions })
      .select('title slug status contentMarkdown cover resources document deletedAt updatedAt')
      .lean(),
    allUrlVariants.length > 0
      ? User.find({ $or: [{ avatar: addressRegex }, { avatarMediaId: { $in: mediaIds } }] }).select('avatar avatarMediaId').lean()
      : [],
    allUrlVariants.length > 0
      ? Setting.find({}).select('key value').lean()
      : [],
    countMediaShareReferencesByMediaIds(mediaIds),
    WorkLog.find({ 'evidence.mediaId': { $in: mediaIds } })
      .select('evidence.mediaId')
      .lean(),
    Resume.find({ $or: [
      ...(addressRegex ? [{ 'sections.profile.photoUrl': addressRegex }] : []),
      { 'sections.profile.photoMediaId': { $in: [...mediaIds, ...mediaIds.map(String)] } }
    ] }).select('sections.profile.photoUrl sections.profile.photoMediaId').lean()
  ])

  for (const article of articles) {
    for (const media of mediaItems) {
      const mediaId = media._id.toString()
      if (includesMediaUrl(article.contentMarkdown, media)) {
        addReferenceCount(counts, mediaId, 'articleContent', article._id)
      }
      if (getMatchedMediaIds(article.cover, urlToMediaIds).includes(mediaId)) {
        addReferenceCount(counts, mediaId, 'articleCover', article._id)
      }
      if ((article.resources || []).some((resource) => (
        getMatchedMediaIds(resource?.url, urlToMediaIds).includes(mediaId) ||
        String(resource?.mediaId || '') === mediaId
      ))) {
        addReferenceCount(counts, mediaId, 'articleResource', article._id)
      }
      if (
        getMatchedMediaIds(article.document?.originalUrl, urlToMediaIds).includes(mediaId) ||
        String(article.document?.originalMediaId || '') === mediaId
      ) {
        addReferenceCount(counts, mediaId, 'articleDocument', article._id)
      }
      if (
        getMatchedMediaIds(article.document?.previewUrl, urlToMediaIds).includes(mediaId) ||
        String(article.document?.previewMediaId || '') === mediaId
      ) {
        addReferenceCount(counts, mediaId, 'articleDocumentPreview', article._id)
      }
    }
  }

  for (const user of users) {
    for (const mediaId of new Set([...getMatchedMediaIds(user.avatar, urlToMediaIds), String(user.avatarMediaId || '')].filter(Boolean))) {
      addReferenceCount(counts, mediaId, 'userAvatar', user._id)
    }
  }

  for (const resume of resumes) {
    const profile = resume.sections?.profile || {}
    for (const mediaId of new Set([...getMatchedMediaIds(profile.photoUrl, urlToMediaIds), String(profile.photoMediaId || '')].filter(Boolean))) {
      addReferenceCount(counts, mediaId, 'resumePhoto', resume._id)
    }
  }

  for (const setting of settings) {
    const valueText = JSON.stringify(setting.value ?? '')
    for (const media of mediaItems) {
      if (includesMediaUrl(valueText, media)) {
        addReferenceCount(counts, media._id.toString(), 'setting', setting._id)
      }
    }
  }

  for (const [mediaId, count] of shareCounts) {
    const mediaCounts = counts.get(mediaId)
    if (mediaCounts) mediaCounts.countByType.resourceShare = count
  }

  for (const log of workJournalLogs) {
    const referencedIds = new Set((log.evidence || []).map((item) => item.mediaId?.toString?.()).filter(Boolean))
    for (const mediaId of referencedIds) {
      addReferenceCount(counts, mediaId, 'workJournalEvidence', log._id)
    }
  }

  for (const media of mediaItems) {
    if (media.feedback) addReferenceCount(counts, media._id.toString(), 'feedbackAttachment', media.feedback)
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
    routePath: article.deletedAt ? '/console/manage/trash' : `/console/manage/articles/${article._id.toString()}/read`,
    status: article.deletedAt ? 'trash' : article.status || '',
    updatedAt: article.updatedAt
  }
}

function buildResumeReference(resume) {
  return {
    type: 'resumePhoto', typeLabel: '简历照片', ownerId: String(resume._id),
    ownerTitle: resume.title, ownerSubtitle: '', ownerUserId: String(resume.ownerId),
    routePath: '/console/resumes/editor', routeQuery: { id: String(resume._id) },
    status: '', updatedAt: resume.updatedAt
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
  return mergeResourceReferences(await findLegacyMediaReferences(media), await getIndexedResourceReferences(media?._id))
}

async function findLegacyMediaReferences(media) {
  // 反馈关闭后仍保留沟通凭证；资源管理不能将其当成未引用图片删除。
  if (media?.feedback) {
    return [{
      type: 'feedbackAttachment', typeLabel: '意见反馈图片',
      ownerId: String(media.feedback), ownerTitle: '意见反馈', ownerSubtitle: '',
      routePath: '/console/manage/feedback', routeQuery: { id: String(media.feedback) },
      status: '', updatedAt: media.updatedAt
    }]
  }
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

  const urlVariants = getMediaUrlVariants(media)
  const escapedVariants = urlVariants.map(escapeRegex)
  if (escapedVariants.length === 0) {
    return []
  }
  const urlRegex = new RegExp(escapedVariants.join('|'))
  const addressRegex = getAddressRegex(urlVariants)

  const [articles, users, settings, shares, workJournalLogs, resumes] = await Promise.all([
    Article.find({
      $or: [
        { contentMarkdown: urlRegex },
        { cover: addressRegex },
        { 'resources.url': addressRegex },
        media?._id ? { 'resources.mediaId': media._id } : null,
        { 'document.originalUrl': addressRegex },
        { 'document.previewUrl': addressRegex },
        media?._id ? { 'document.originalMediaId': media._id } : null,
        media?._id ? { 'document.previewMediaId': media._id } : null
      ].filter(Boolean)
    }).select('title slug status contentMarkdown cover resources document deletedAt updatedAt').lean(),
    User.find({ $or: [{ avatar: addressRegex }, ...(media?._id ? [{ avatarMediaId: media._id }] : [])] }).select('username email avatar status updatedAt').lean(),
    Setting.find({}).select('key value group updatedAt').lean(),
    shareReferencesPromise,
    media?._id
      ? WorkLog.find({ 'evidence.mediaId': media._id }).select('title workDate deletedAt createdBy updatedAt').lean()
      : [],
    Resume.find({ $or: [
      { 'sections.profile.photoUrl': addressRegex },
      ...(media?._id ? [{ 'sections.profile.photoMediaId': { $in: [media._id, String(media._id)] } }] : [])
    ] }).select('title ownerId updatedAt').lean()
  ])

  const references = []

  articles.forEach((article) => {
    if (includesMediaUrl(article.contentMarkdown, media)) {
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
  resumes.forEach((resume) => references.push(buildResumeReference(resume)))
  settings.forEach((setting) => {
    const reference = urlVariants.map((variant) => buildSettingReference(setting, variant)).find(Boolean)
    if (reference) references.push(reference)
  })
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
  const indexed = await getIndexedResourceReferenceMap(mediaItems.map((media) => media._id))
  return mediaItems.map((media) => {
    const scanned = counts.get(String(media._id))
    const countByType = { ...scanned.countByType }
    const remaining = filterIndexedResourceReferences(indexed.get(String(media._id)) || [], scanned.keys)
    for (const reference of remaining) countByType[reference.type] = (countByType[reference.type] || 0) + 1
    return { ...media.toSafeJSON(), usage: summarizeReferenceCounts(countByType) }
  })
}

export async function getMediaReferenceDetail(media) {
  const references = await findMediaReferences(media)
  return {
    media: media.toSafeJSON(),
    references,
    summary: summarizeMediaReferences(references)
  }
}
