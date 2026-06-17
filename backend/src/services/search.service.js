import { ARTICLE_STATUS } from '#constants/domain'
import { Article } from '../models/Article.js'
import { Category } from '../models/Category.js'
import { Tag } from '../models/Tag.js'

const SEARCH_HIGHLIGHT_RADIUS = 90
const SEARCH_HIGHLIGHT_MAX_LENGTH = 280
const SUGGEST_LIMIT = 8
const FACET_CATEGORY_LIMIT = 20
const FACET_TAG_LIMIT = 30

const SEARCH_FIELD_LABELS = {
  title: '标题',
  summary: '摘要',
  content: '正文',
  category: '分类',
  tags: '标签',
  slug: '标识'
}

const SEARCH_FIELD_WEIGHTS = {
  title: 18,
  summary: 11,
  content: 5,
  category: 10,
  tags: 9,
  slug: 6
}

function escapeRegExp(str = '') {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeQuery(raw = '') {
  return String(raw || '').trim()
}

function splitTerms(raw = '') {
  const query = normalizeQuery(raw)
  if (!query) return []

  return Array.from(
    new Set(
      query
        .split(/[\s,，、|]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

function normalizeSearchText(raw = '') {
  return String(raw || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function stripMarkdown(raw = '') {
  return String(raw || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1 ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ')
    .replace(/^>\s+/gm, '')
    .replace(/[#*_~>-]+/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getPagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page || '1', 10))
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize || '10', 10)))

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize
  }
}

function escapeHtmlSafe(str = '') {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightText(text = '', terms = []) {
  if (!text) return ''

  const safeText = escapeHtmlSafe(text)
  if (!terms.length) return safeText

  const sortedTerms = [...terms].sort((left, right) => right.length - left.length)
  let result = safeText

  sortedTerms.forEach((term) => {
    const safeTerm = escapeHtmlSafe(term)
    if (!safeTerm) return
    const regex = new RegExp(`(${escapeRegExp(safeTerm)})`, 'gi')
    result = result.replace(regex, '<mark>$1</mark>')
  })

  return result
}

function extractHighlightSnippet(content = '', terms = []) {
  if (!content) return ''

  if (!terms.length) {
    return content.slice(0, SEARCH_HIGHLIGHT_MAX_LENGTH) + (content.length > SEARCH_HIGHLIGHT_MAX_LENGTH ? '…' : '')
  }

  const lowerContent = content.toLowerCase()
  let matchIndex = -1
  let matchedTerm = ''

  for (const term of terms) {
    const index = lowerContent.indexOf(term.toLowerCase())
    if (index !== -1) {
      matchIndex = index
      matchedTerm = term
      break
    }
  }

  if (matchIndex === -1) {
    return content.slice(0, SEARCH_HIGHLIGHT_MAX_LENGTH) + (content.length > SEARCH_HIGHLIGHT_MAX_LENGTH ? '…' : '')
  }

  const start = Math.max(0, matchIndex - SEARCH_HIGHLIGHT_RADIUS)
  const end = Math.min(content.length, matchIndex + matchedTerm.length + SEARCH_HIGHLIGHT_RADIUS)
  let snippet = content.slice(start, end)

  if (start > 0) snippet = '…' + snippet
  if (end < content.length) snippet += '…'

  if (snippet.length > SEARCH_HIGHLIGHT_MAX_LENGTH + 40) {
    snippet = snippet.slice(0, SEARCH_HIGHLIGHT_MAX_LENGTH) + '…'
  }

  return snippet
}

function createFieldMatchMap(context, term) {
  return {
    title: context.title.includes(term),
    summary: context.summary.includes(term),
    content: context.content.includes(term),
    category: context.category.includes(term),
    tags: context.tags.some((item) => item.includes(term)),
    slug: context.slug.includes(term)
  }
}

function getRecencyBoost(article) {
  const publishedValue = article.publishedAt || article.createdAt
  if (!publishedValue) return 0

  const publishedAt = new Date(publishedValue)
  if (Number.isNaN(publishedAt.getTime())) return 0

  const diffDays = (Date.now() - publishedAt.getTime()) / (24 * 60 * 60 * 1000)
  if (diffDays <= 7) return 4.5
  if (diffDays <= 30) return 3
  if (diffDays <= 90) return 1.8
  if (diffDays <= 180) return 1
  return 0
}

function buildSearchContext(article) {
  const plainContent = stripMarkdown(article.contentMarkdown || '')
  const tagNames = Array.isArray(article.tags)
    ? article.tags
      .map((tag) => tag?.name || '')
      .filter(Boolean)
    : []

  return {
    title: normalizeSearchText(article.title),
    summary: normalizeSearchText(article.summary),
    content: normalizeSearchText(plainContent),
    category: normalizeSearchText(article.category?.name || ''),
    tags: tagNames.map((name) => normalizeSearchText(name)),
    slug: normalizeSearchText(article.slug),
    plainContent
  }
}

function evaluateArticle(article, context, query, terms, mode, textScores = new Map()) {
  const normalizedQuery = normalizeSearchText(query)
  const normalizedTerms = terms.map((term) => ({
    raw: term,
    normalized: normalizeSearchText(term)
  }))
  const matchedFields = new Set()
  const matchedFieldKeys = new Set()
  const matchedTerms = []
  const termMatches = []
  let score = 0

  if (normalizedQuery) {
    if (context.title.includes(normalizedQuery)) {
      score += 28
      matchedFields.add(SEARCH_FIELD_LABELS.title)
      matchedFieldKeys.add('title')
    }
    if (context.summary.includes(normalizedQuery)) {
      score += 18
      matchedFields.add(SEARCH_FIELD_LABELS.summary)
      matchedFieldKeys.add('summary')
    }
    if (context.category.includes(normalizedQuery) || context.tags.some((item) => item.includes(normalizedQuery))) {
      score += 12
    }
    if (context.content.includes(normalizedQuery)) {
      score += 10
      matchedFields.add(SEARCH_FIELD_LABELS.content)
      matchedFieldKeys.add('content')
    }
  }

  normalizedTerms.forEach(({ raw, normalized }) => {
    const fieldMatches = createFieldMatchMap(context, normalized)
    const activeFields = Object.entries(fieldMatches).filter(([, matched]) => matched)

    if (!activeFields.length) return

    matchedTerms.push(raw)
    termMatches.push({
      term: raw,
      fields: activeFields.map(([field]) => SEARCH_FIELD_LABELS[field])
    })

    activeFields.forEach(([field]) => {
      matchedFields.add(SEARCH_FIELD_LABELS[field])
      matchedFieldKeys.add(field)
      score += SEARCH_FIELD_WEIGHTS[field]
    })

    if (context.title.startsWith(normalized)) {
      score += 4
    }
  })

  const coverage = terms.length ? matchedTerms.length / terms.length : 0
  const matchesMode = mode === 'AND'
    ? matchedTerms.length === normalizedTerms.length
    : matchedTerms.length > 0

  if (!matchesMode) {
    return null
  }

  const articleId = article._id.toString()
  const textScore = textScores.get(articleId) || 0
  score += textScore * 7
  score += coverage * 16
  score += getRecencyBoost(article)
  score += Math.log10((article.viewCount || 0) + 1) * 1.6

  if (article.isRecommended) {
    score += 2
  }

  const snippetSource = article.summary || context.plainContent || article.title
  const snippet = extractHighlightSnippet(snippetSource, terms)

  return {
    score: Math.round(score * 100) / 100,
    coverage: Math.round(coverage * 100),
    matchedFields: Array.from(matchedFields),
    matchedFieldKeys: Array.from(matchedFieldKeys),
    matchedTerms,
    termMatches,
    snippet,
    highlightedSnippet: highlightText(snippet, terms)
  }
}

function sortSearchItems(items, sort) {
  const result = [...items]

  if (sort === 'date') {
    return result.sort((left, right) => {
      const rightDate = new Date(right.publishedAt || right.createdAt).getTime()
      const leftDate = new Date(left.publishedAt || left.createdAt).getTime()
      if (rightDate !== leftDate) return rightDate - leftDate
      return right.relevanceScore - left.relevanceScore
    })
  }

  if (sort === 'views') {
    return result.sort((left, right) => {
      if ((right.viewCount || 0) !== (left.viewCount || 0)) {
        return (right.viewCount || 0) - (left.viewCount || 0)
      }
      return right.relevanceScore - left.relevanceScore
    })
  }

  return result.sort((left, right) => {
    if (right.relevanceScore !== left.relevanceScore) {
      return right.relevanceScore - left.relevanceScore
    }
    if (right.matchCoverage !== left.matchCoverage) {
      return right.matchCoverage - left.matchCoverage
    }
    return new Date(right.publishedAt || right.createdAt) - new Date(left.publishedAt || left.createdAt)
  })
}

function buildFacetsFromItems(items = []) {
  const categoryMap = new Map()
  const tagMap = new Map()

  items.forEach((item) => {
    if (item.category?.slug) {
      const key = item.category.slug
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          name: item.category.name,
          slug: item.category.slug,
          count: 0
        })
      }
      categoryMap.get(key).count += 1
    }

    if (Array.isArray(item.tags)) {
      item.tags.forEach((tag) => {
        if (!tag?.slug) return
        if (!tagMap.has(tag.slug)) {
          tagMap.set(tag.slug, {
            name: tag.name,
            slug: tag.slug,
            count: 0
          })
        }
        tagMap.get(tag.slug).count += 1
      })
    }
  })

  return {
    categories: Array.from(categoryMap.values())
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'zh-Hans-CN'))
      .slice(0, FACET_CATEGORY_LIMIT),
    tags: Array.from(tagMap.values())
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'zh-Hans-CN'))
      .slice(0, FACET_TAG_LIMIT)
  }
}

function formatArticlePayload(article, evaluation) {
  const category = article.category && typeof article.category === 'object' && article.category.name
    ? (article.category.toSafeJSON ? article.category.toSafeJSON() : article.category)
    : null
  const author = article.createdBy && typeof article.createdBy === 'object' && article.createdBy.username
    ? {
        id: article.createdBy._id?.toString?.() || article.createdBy.id,
        username: article.createdBy.username,
        avatar: article.createdBy.avatar || '',
        role: article.createdBy.role || 'user'
      }
    : null
  const tags = Array.isArray(article.tags)
    ? article.tags.map((tag) => {
      if (tag && typeof tag === 'object' && tag.name) {
        return tag.toSafeJSON ? tag.toSafeJSON() : tag
      }
      return { id: tag?.toString?.() || String(tag), name: String(tag), slug: '' }
    })
    : []

  return {
    id: article._id.toString(),
    title: article.title,
    highlightedTitle: highlightText(article.title, evaluation.matchedTerms),
    slug: article.slug,
    summary: article.summary || '',
    highlightedSummary: highlightText(article.summary || '', evaluation.matchedTerms),
    snippet: evaluation.snippet,
    highlightedSnippet: evaluation.highlightedSnippet,
    cover: article.cover || '',
    author,
    category,
    tags,
    status: article.status,
    isRecommended: article.isRecommended || false,
    viewCount: article.viewCount || 0,
    likeCount: article.likeCount || 0,
    favoriteCount: article.favoriteCount || 0,
    commentCount: article.commentCount || 0,
    wordCount: article.wordCount || 0,
    readingMinutes: article.readingMinutes || 1,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    relevanceScore: evaluation.score,
    matchCoverage: evaluation.coverage,
    matchedFields: evaluation.matchedFields,
    matchedFieldKeys: evaluation.matchedFieldKeys,
    matchedTerms: evaluation.matchedTerms,
    termMatches: evaluation.termMatches
  }
}

async function resolveCategoryAndDescendantIds(slug) {
  if (!slug) return null
  const category = await Category.findOne({ slug, isSystem: { $ne: true } })
  if (!category) return '__missing__'

  const rootId = category._id
  const categories = await Category.find({ status: 'active', isSystem: { $ne: true } }).select('_id parent')
  const pending = [rootId.toString()]
  const resolved = new Set(pending)

  while (pending.length > 0) {
    const current = pending.shift()
    categories.forEach((item) => {
      const parentId = item.parent?.toString()
      const categoryId = item._id.toString()
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

function emptyResult(pagination, query = '', mode = 'AND', sort = 'relevance', tookMs = 0) {
  return {
    items: [],
    total: 0,
    page: pagination.page,
    pageSize: pagination.pageSize,
    facets: { categories: [], tags: [] },
    tookMs,
    terms: splitTerms(query),
    meta: {
      query,
      mode,
      sort,
      candidateCount: 0,
      filteredCount: 0,
      usedTextSearch: false
    }
  }
}

export async function searchArticles(rawQuery = {}) {
  const startTime = Date.now()
  const query = normalizeQuery(rawQuery.q || rawQuery.search || '')
  const mode = (rawQuery.mode || 'AND').toUpperCase() === 'OR' ? 'OR' : 'AND'
  const sort = ['relevance', 'date', 'views'].includes(rawQuery.sort) ? rawQuery.sort : 'relevance'
  const pagination = getPagination(rawQuery)
  const terms = splitTerms(query)

  if (!query || !terms.length) {
    return emptyResult(pagination, query, mode, sort)
  }

  const baseFilter = {
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null
  }

  const categoryIds = await resolveCategoryAndDescendantIds(rawQuery.category)
  if (categoryIds === '__missing__') {
    return emptyResult(pagination, query, mode, sort, Date.now() - startTime)
  }

  const tagId = await resolveTagId(rawQuery.tag)
  if (tagId === '__missing__') {
    return emptyResult(pagination, query, mode, sort, Date.now() - startTime)
  }

  if (categoryIds) {
    baseFilter.category = Array.isArray(categoryIds) ? { $in: categoryIds } : categoryIds
  }

  if (tagId) {
    baseFilter.tags = tagId
  }

  const unionPattern = new RegExp(terms.map((item) => escapeRegExp(item)).join('|'), 'i')
  const [matchedTags, matchedCategories] = await Promise.all([
    Tag.find({ name: unionPattern }).select('_id').lean(),
    Category.find({ name: unionPattern, isSystem: { $ne: true } }).select('_id').lean()
  ])

  let usedTextSearch = false
  const candidateIds = new Set()
  const textScores = new Map()

  try {
    const textResults = await Article.find(
      { ...baseFilter, $text: { $search: terms.join(' ') } },
      { score: { $meta: 'textScore' } }
    )
      .select('_id score')
      .lean()

    textResults.forEach((item) => {
      const id = item._id.toString()
      candidateIds.add(id)
      textScores.set(id, item.score || 0)
    })
    usedTextSearch = true
  } catch (error) {
    if (error.codeName !== 'IndexNotFound' && !/text index required/i.test(error.message)) {
      throw error
    }
  }

  const regexTermClauses = terms.map((term) => ({
    $or: [
      { title: new RegExp(escapeRegExp(term), 'i') },
      { summary: new RegExp(escapeRegExp(term), 'i') },
      { contentMarkdown: new RegExp(escapeRegExp(term), 'i') },
      { slug: new RegExp(escapeRegExp(term), 'i') }
    ]
  }))

  const supplementaryClauses = [
    ...regexTermClauses,
    ...(matchedTags.length ? [{ tags: { $in: matchedTags.map((item) => item._id) } }] : []),
    ...(matchedCategories.length ? [{ category: { $in: matchedCategories.map((item) => item._id) } }] : [])
  ]

  if (supplementaryClauses.length) {
    const supplementaryResults = await Article.find({
      ...baseFilter,
      $or: supplementaryClauses
    })
      .select('_id')
      .lean()

    supplementaryResults.forEach((item) => {
      candidateIds.add(item._id.toString())
      if (!textScores.has(item._id.toString())) {
        textScores.set(item._id.toString(), 0)
      }
    })
  }

  if (!candidateIds.size) {
    return emptyResult(pagination, query, mode, sort, Date.now() - startTime)
  }

  const candidateArticles = await Article.find({
    ...baseFilter,
    _id: { $in: Array.from(candidateIds) }
  })
    .populate('category')
    .populate('tags')
    .populate('createdBy', 'username avatar role')
    .lean()

  const evaluatedItems = candidateArticles
    .map((article) => {
      const context = buildSearchContext(article)
      const evaluation = evaluateArticle(article, context, query, terms, mode, textScores)
      if (!evaluation) return null
      return formatArticlePayload(article, evaluation)
    })
    .filter(Boolean)

  if (!evaluatedItems.length) {
    return emptyResult(pagination, query, mode, sort, Date.now() - startTime)
  }

  const sortedItems = sortSearchItems(evaluatedItems, sort)
  const facets = buildFacetsFromItems(sortedItems)
  const pagedItems = sortedItems.slice(pagination.skip, pagination.skip + pagination.pageSize)
  const tookMs = Date.now() - startTime

  return {
    items: pagedItems,
    total: sortedItems.length,
    page: pagination.page,
    pageSize: pagination.pageSize,
    facets,
    tookMs,
    terms,
    meta: {
      query,
      mode,
      sort,
      candidateCount: candidateIds.size,
      filteredCount: sortedItems.length,
      usedTextSearch
    }
  }
}

export async function getSearchSuggestions(rawQuery = {}) {
  const query = normalizeQuery(rawQuery.q || '')
  const terms = splitTerms(query)

  if (!terms.length) {
    return { items: [] }
  }

  const items = await Article.find({
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null,
    $or: terms.map((term) => ({ title: new RegExp(escapeRegExp(term), 'i') }))
  })
    .select('title slug category viewCount publishedAt')
    .populate('category', 'name slug')
    .lean()

  const normalizedTerms = terms.map((term) => normalizeSearchText(term))
  const normalizedQuery = normalizeSearchText(query)

  const ranked = items
    .map((item) => {
      const title = normalizeSearchText(item.title)
      let score = 0

      normalizedTerms.forEach((term) => {
        if (title.includes(term)) {
          score += 10
        }
      })

      if (title.startsWith(normalizedQuery)) {
        score += 12
      }

      if (title.includes(normalizedQuery)) {
        score += 8
      }

      score += Math.log10((item.viewCount || 0) + 1) * 1.5

      return {
        ...item,
        score
      }
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      return new Date(right.publishedAt || 0) - new Date(left.publishedAt || 0)
    })
    .slice(0, SUGGEST_LIMIT)

  return {
    items: ranked.map((item) => ({
      title: item.title,
      slug: item.slug,
      category: item.category && typeof item.category === 'object'
        ? { name: item.category.name, slug: item.category.slug }
        : null
    }))
  }
}
