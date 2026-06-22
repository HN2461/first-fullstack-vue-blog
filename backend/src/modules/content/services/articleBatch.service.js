import { ARTICLE_STATUS } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { adjustCategoryArticleCount, getPublishBlockers } from './article.service.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function uniqueStrings(values = []) {
  return Array.from(new Set(values.map((value) => String(value)).filter(Boolean)))
}

async function resolveBatchMetaReferences(input) {
  const refs = {
    category: null,
    tags: []
  }

  if (input.category?.enabled && input.category.mode !== 'clear') {
    refs.category = await Category.findById(input.category.value)
    if (!refs.category) {
      throw createHttpError(404, 'CATEGORY_NOT_FOUND', '目标分类不存在')
    }
  }

  if (input.tags?.enabled && input.tags.mode !== 'clear') {
    const tagIds = uniqueStrings(input.tags.value)
    const tags = await Tag.find({ _id: { $in: tagIds } })
    if (tags.length !== tagIds.length) {
      throw createHttpError(404, 'TAG_NOT_FOUND', '部分标签不存在')
    }
    refs.tags = tags.map((tag) => tag._id)
  }

  return refs
}

function applyCategoryMeta(article, input, refs) {
  if (!input.category?.enabled) {
    return false
  }

  const previousCategoryId = article.category ? String(article.category) : ''
  let nextCategoryId = previousCategoryId

  if (input.category.mode === 'clear') {
    nextCategoryId = ''
  } else if (input.category.mode === 'overwrite') {
    nextCategoryId = String(refs.category._id)
  } else if (input.category.mode === 'fillEmpty' && !previousCategoryId) {
    nextCategoryId = String(refs.category._id)
  }

  if (previousCategoryId === nextCategoryId) {
    return false
  }

  article.category = nextCategoryId || null
  return true
}

function applyTagsMeta(article, input, refs) {
  if (!input.tags?.enabled) {
    return false
  }

  const previousTags = uniqueStrings(article.tags || [])
  let nextTags = previousTags
  const targetTags = uniqueStrings(refs.tags)

  if (input.tags.mode === 'clear') {
    nextTags = []
  } else if (input.tags.mode === 'replace') {
    nextTags = targetTags
  } else if (input.tags.mode === 'append') {
    nextTags = uniqueStrings([...previousTags, ...targetTags])
  } else if (input.tags.mode === 'remove') {
    const removeSet = new Set(targetTags)
    nextTags = previousTags.filter((tagId) => !removeSet.has(tagId))
  }

  if (previousTags.join('|') === nextTags.join('|')) {
    return false
  }

  article.tags = nextTags
  return true
}

function applyCoverMeta(article, input) {
  if (!input.cover?.enabled) {
    return false
  }

  const previousCover = String(article.cover || '')
  let nextCover = previousCover

  if (input.cover.mode === 'clear') {
    nextCover = ''
  } else if (input.cover.mode === 'overwrite') {
    nextCover = input.cover.value || ''
  } else if (input.cover.mode === 'fillEmpty' && !previousCover) {
    nextCover = input.cover.value || ''
  }

  if (previousCover === nextCover) {
    return false
  }

  article.cover = nextCover
  return true
}

function applyStatusMeta(article, input, itemResult) {
  if (!input.status?.enabled) {
    return false
  }

  const nextStatus = input.status.value
  if (nextStatus === ARTICLE_STATUS.PUBLISHED) {
    const blockers = getPublishBlockers(article)
    if (blockers.length > 0) {
      itemResult.messages.push(...blockers)
      return false
    }
  }

  if (article.status === nextStatus) {
    if (nextStatus === ARTICLE_STATUS.PUBLISHED) {
      itemResult.published = true
    }
    return false
  }

  article.status = nextStatus
  if (nextStatus === ARTICLE_STATUS.PUBLISHED) {
    article.publishedAt = article.publishedAt || new Date()
    itemResult.published = true
  }
  return true
}

function snapshotArticleMeta(article) {
  return {
    category: article.category || null,
    cover: article.cover || '',
    tags: [...(article.tags || [])],
    status: article.status,
    publishedAt: article.publishedAt || null
  }
}

function restoreArticleMeta(article, snapshot) {
  article.category = snapshot.category
  article.cover = snapshot.cover
  article.tags = snapshot.tags
  article.status = snapshot.status
  article.publishedAt = snapshot.publishedAt
}

async function adjustTagArticleCounts(previousTags, nextTags) {
  const previousSet = new Set(previousTags)
  const nextSet = new Set(nextTags)
  const removed = previousTags.filter((tagId) => !nextSet.has(tagId))
  const added = nextTags.filter((tagId) => !previousSet.has(tagId))

  if (removed.length) {
    await Tag.updateMany({ _id: { $in: removed } }, { $inc: { articleCount: -1 } })
  }

  if (added.length) {
    await Tag.updateMany({ _id: { $in: added } }, { $inc: { articleCount: 1 } })
  }
}

export async function batchUpdateArticleMeta(ids, input, user) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createHttpError(400, 'ARTICLE_IDS_REQUIRED', '请选择要操作的文章')
  }

  const refs = await resolveBatchMetaReferences(input)
  const articles = await Article.find({
    _id: { $in: ids },
    deletedAt: null
  })

  const articleMap = new Map(articles.map((article) => [String(article._id), article]))
  const items = []
  let updatedCount = 0
  let publishedCount = 0
  let skippedCount = 0

  for (const id of ids) {
    const article = articleMap.get(String(id))
    const itemResult = {
      id: String(id),
      title: article?.title || '',
      status: 'skipped',
      published: false,
      messages: []
    }

    if (!article) {
      itemResult.messages.push('文章不存在或已删除')
      skippedCount += 1
      items.push(itemResult)
      continue
    }

    const previousCategoryId = article.category ? String(article.category) : ''
    const previousTagIds = uniqueStrings(article.tags || [])
    const snapshot = snapshotArticleMeta(article)
    let changed = false

    changed = applyCategoryMeta(article, input, refs) || changed
    changed = applyTagsMeta(article, input, refs) || changed
    changed = applyCoverMeta(article, input) || changed
    changed = applyStatusMeta(article, input, itemResult) || changed

    const finalBlockers = article.status === ARTICLE_STATUS.PUBLISHED ? getPublishBlockers(article) : []
    if (finalBlockers.length > 0) {
      restoreArticleMeta(article, snapshot)
      itemResult.messages.push(...finalBlockers)
      skippedCount += 1
      items.push(itemResult)
      continue
    }

    if (changed) {
      article.updatedBy = user._id
      await article.save()

      const nextCategoryId = article.category ? String(article.category) : ''
      const nextTagIds = uniqueStrings(article.tags || [])
      if (previousCategoryId !== nextCategoryId) {
        if (previousCategoryId) {
          await adjustCategoryArticleCount(previousCategoryId, -1)
        }
        if (nextCategoryId) {
          await adjustCategoryArticleCount(nextCategoryId, 1)
        }
      }
      await adjustTagArticleCounts(previousTagIds, nextTagIds)

      itemResult.status = 'updated'
      updatedCount += 1
      if (itemResult.published) {
        publishedCount += 1
      }
    } else if (itemResult.messages.length > 0) {
      skippedCount += 1
    } else {
      itemResult.status = 'unchanged'
    }

    items.push(itemResult)
  }

  return {
    total: ids.length,
    updatedCount,
    publishedCount,
    skippedCount,
    items
  }
}
