import { Media } from '#modules/media/models/Media.js'
import { assertMediaCategoryExists } from './mediaCategory.service.js'

export const ARTICLE_CONTENT_CATEGORY = '文章正文图片'
export const ARTICLE_CONTENT_TEMP_CATEGORY = '文章正文临时图片'

function normalizeUploadedMediaUrl(value) {
  const raw = String(value || '').trim().replace(/^<|>$/g, '')
  if (!raw) return []

  try {
    const parsed = new URL(raw, 'http://local.invalid')
    if (!parsed.pathname.startsWith('/uploads/')) return []

    const candidates = new Set([parsed.pathname])
    try {
      candidates.add(decodeURI(parsed.pathname))
    } catch {
      // URL 包含不完整转义时保留原始路径，避免保存文章被异常图片地址阻断。
    }
    return [...candidates]
  } catch {
    return []
  }
}

/**
 * 提取 Markdown 与 HTML 图片语法中的本项目上传地址。
 * 外链图片不会进入媒体绑定流程，避免误修改不属于当前系统的资源。
 */
export function extractArticleContentMediaUrls(contentMarkdown = '') {
  const content = String(contentMarkdown || '')
  const urls = new Set()
  const markdownImagePattern = /!\[[^\]]*]\(\s*(?:<([^>]+)>|([^\s)]+))/g
  const htmlImagePattern = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi

  for (const match of content.matchAll(markdownImagePattern)) {
    normalizeUploadedMediaUrl(match[1] || match[2]).forEach((url) => urls.add(url))
  }

  for (const match of content.matchAll(htmlImagePattern)) {
    normalizeUploadedMediaUrl(match[1] || match[2] || match[3]).forEach((url) => urls.add(url))
  }

  return [...urls]
}

/**
 * 将文章正文实际引用的临时图片转为正式正文图片，并维护图片的主文章绑定。
 * Media.article 只记录首次或当前主绑定；图片被多篇文章复用时，完整引用关系仍由引用扫描服务判定。
 */
export async function syncArticleContentMediaBindings(article) {
  const articleId = article?._id || article?.id
  if (!articleId) return { referenced: 0, promoted: 0, bound: 0, released: 0 }

  const urls = article?.contentMode === 'document'
    ? []
    : extractArticleContentMediaUrls(article?.contentMarkdown)

  const releaseResult = await Media.updateMany({
    article: articleId,
    kind: 'image',
    category: { $in: [ARTICLE_CONTENT_CATEGORY, ARTICLE_CONTENT_TEMP_CATEGORY] },
    ...(urls.length > 0 ? { url: { $nin: urls } } : {})
  }, {
    $set: { article: null }
  })

  if (urls.length === 0) {
    return {
      referenced: 0,
      promoted: 0,
      bound: 0,
      released: releaseResult.modifiedCount
    }
  }

  const category = await assertMediaCategoryExists(ARTICLE_CONTENT_CATEGORY, null)
  const promotedResult = await Media.updateMany({
    url: { $in: urls },
    kind: 'image',
    deletedAt: null,
    category: ARTICLE_CONTENT_TEMP_CATEGORY
  }, {
    $set: {
      category: category.name,
      categoryId: category._id
    }
  })
  const boundResult = await Media.updateMany({
    url: { $in: urls },
    kind: 'image',
    deletedAt: null,
    $or: [
      { article: null },
      { article: { $exists: false } },
      { article: articleId }
    ]
  }, {
    $set: { article: articleId }
  })

  return {
    referenced: urls.length,
    promoted: promotedResult.modifiedCount,
    bound: boundResult.modifiedCount,
    released: releaseResult.modifiedCount
  }
}

export async function releaseArticleContentMediaBindings(articleId) {
  if (!articleId) return { released: 0 }

  const result = await Media.updateMany({
    article: articleId,
    kind: 'image',
    category: { $in: [ARTICLE_CONTENT_CATEGORY, ARTICLE_CONTENT_TEMP_CATEGORY] }
  }, {
    $set: { article: null }
  })

  return { released: result.modifiedCount }
}
