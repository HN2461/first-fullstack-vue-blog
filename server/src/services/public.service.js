import { ARTICLE_STATUS } from '@blog/shared'
import { Article } from '../models/Article.js'
import { Category } from '../models/Category.js'
import { Reaction } from '../models/Reaction.js'
import { Tag } from '../models/Tag.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function getPagination(query) {
  const page = Math.max(1, Number.parseInt(query.page || '1', 10))
  const pageSize = Math.min(500, Math.max(1, Number.parseInt(query.pageSize || '10', 10)))
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize
  }
}

function createPublishedQuery(filters = {}) {
  const query = {
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null
  }

  if (filters.search) {
    query.$or = [
      { title: new RegExp(filters.search, 'i') },
      { summary: new RegExp(filters.search, 'i') },
      { contentMarkdown: new RegExp(filters.search, 'i') }
    ]
  }

  return query
}

async function resolveCategoryId(slug) {
  if (!slug) return null
  const category = await Category.findOne({ slug })
  return category?._id || '__missing__'
}

async function resolveCategoryAndDescendantIds(slug) {
  const rootId = await resolveCategoryId(slug)

  if (!rootId || rootId === '__missing__') {
    return rootId
  }

  const categories = await Category.find({ status: 'active' }).select('_id parent')
  const pending = [rootId.toString()]
  const resolved = new Set(pending)

  while (pending.length > 0) {
    const current = pending.shift()
    categories.forEach((category) => {
      const parentId = category.parent?.toString()
      const categoryId = category._id.toString()

      if (parentId === current && !resolved.has(categoryId)) {
        resolved.add(categoryId)
        pending.push(categoryId)
      }
    })
  }

  return [...resolved]
}

async function resolveTagId(slug) {
  if (!slug) return null
  const tag = await Tag.findOne({ slug })
  return tag?._id || '__missing__'
}

export async function listPublicArticles(rawQuery = {}) {
  const pagination = getPagination(rawQuery)
  const query = createPublishedQuery({ search: rawQuery.q || rawQuery.search || '' })
  const categoryIds = await resolveCategoryAndDescendantIds(rawQuery.category)
  const tagId = await resolveTagId(rawQuery.tag)

  if (categoryIds === '__missing__' || tagId === '__missing__') {
    return {
      items: [],
      total: 0,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
  }

  if (categoryIds) {
    query.category = Array.isArray(categoryIds) ? { $in: categoryIds } : categoryIds
  }

  if (tagId) {
    query.tags = tagId
  }

  const [items, total] = await Promise.all([
    Article.find(query)
      .populate('category')
      .populate('tags')
      .populate('createdBy', 'username avatar role')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.pageSize),
    Article.countDocuments(query)
  ])

  return {
    items: items.map((article) => article.toSafeJSON()),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize
  }
}

export async function getPublicArticleBySlug(slug, currentUserId = null) {
  const article = await Article.findOne({
    slug,
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null
  })
    .populate('category')
    .populate('tags')
    .populate('createdBy', 'username avatar role')

  if (!article) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  article.viewCount += 1
  await article.save()

  const payload = article.toSafeJSON()

  if (!currentUserId) {
    return {
      ...payload,
      likedByCurrentUser: false,
      favoritedByCurrentUser: false
    }
  }

  const reactions = await Reaction.find({
    user: currentUserId,
    targetType: 'article',
    targetId: article._id,
    type: { $in: ['like', 'favorite'] }
  }).select('type')

  const reactionTypes = new Set(reactions.map((item) => item.type))

  return {
    ...payload,
    likedByCurrentUser: reactionTypes.has('like'),
    favoritedByCurrentUser: reactionTypes.has('favorite')
  }
}

export async function getPublicHomeData() {
  const [articleCount, categories, tags, recentArticles, recommendedArticles] = await Promise.all([
    Article.countDocuments({
      status: ARTICLE_STATUS.PUBLISHED,
      deletedAt: null
    }),
    Category.find({ status: 'active' }).sort({ sortOrder: 1, createdAt: -1 }),
    Tag.find().sort({ articleCount: -1, createdAt: -1 }),
    Article.find({
      status: ARTICLE_STATUS.PUBLISHED,
      deletedAt: null
    })
      .populate('category')
      .populate('tags')
      .populate('createdBy', 'username avatar role')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5),
    Article.find({
      status: ARTICLE_STATUS.PUBLISHED,
      deletedAt: null,
      isRecommended: true
    })
      .populate('category')
      .populate('tags')
      .populate('createdBy', 'username avatar role')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(4)
  ])

  return {
    stats: {
      articleCount,
      categoryCount: categories.length,
      tagCount: tags.length
    },
    categories: categories.map((category) => category.toSafeJSON()),
    tags: tags.map((tag) => tag.toSafeJSON()),
    recentArticles: recentArticles.map((article) => article.toSafeJSON()),
    recommendedArticles: recommendedArticles.map((article) => article.toSafeJSON())
  }
}
