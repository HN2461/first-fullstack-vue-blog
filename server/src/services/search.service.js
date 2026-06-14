import { ARTICLE_STATUS } from '@blog/shared'
import { Article } from '../models/Article.js'
import { Category } from '../models/Category.js'
import { Tag } from '../models/Tag.js'

/**
 * 全文检索服务
 *
 * 核心升级点：
 * 1. MongoDB $text + 文本索引 → BM25 相关度评分
 * 2. 标签名 / 分类名搜索（$text 只索引 title/summary/contentMarkdown）
 * 3. AND / OR 多词匹配模式
 * 4. 高亮片段提取（从 contentMarkdown 中截取匹配上下文）
 * 5. 搜索建议（按热度 / 标题前缀推荐）
 * 6. 多维排序（相关度 / 最新 / 浏览量）
 * 7. 分类 + 标签聚合统计（facets）
 */

// ─── 常量 ────────────────────────────────────────────────

const SEARCH_HIGHLIGHT_RADIUS = 80
const SEARCH_HIGHLIGHT_MAX_LENGTH = 260
const SUGGEST_LIMIT = 8
const FACET_CATEGORY_LIMIT = 20
const FACET_TAG_LIMIT = 30

// ─── 工具函数 ────────────────────────────────────────────

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
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    )
  )
}

function getPagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page || '1', 10))
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize || '10', 10)))
  return { page, pageSize, skip: (page - 1) * pageSize }
}

/**
 * 从正文中提取匹配关键词的上下文片段用于高亮预览
 */
function extractHighlightSnippet(content = '', terms = []) {
  if (!content || terms.length === 0) return ''

  const lower = content.toLowerCase()

  let matchIndex = -1
  let matchedTerm = ''

  for (const term of terms) {
    const idx = lower.indexOf(term.toLowerCase())
    if (idx !== -1) {
      matchIndex = idx
      matchedTerm = term
      break
    }
  }

  if (matchIndex === -1) {
    return content.slice(0, SEARCH_HIGHLIGHT_MAX_LENGTH) + (content.length > SEARCH_HIGHLIGHT_MAX_LENGTH ? '…' : '')
  }

  const start = Math.max(0, matchIndex - SEARCH_HIGHLIGHT_RADIUS)
  const end = Math.min(
    content.length,
    matchIndex + matchedTerm.length + SEARCH_HIGHLIGHT_RADIUS
  )

  let snippet = content.substring(start, end)

  if (start > 0) snippet = '…' + snippet
  if (end < content.length) snippet += '…'

  if (snippet.length > SEARCH_HIGHLIGHT_MAX_LENGTH + 40) {
    snippet = snippet.slice(0, SEARCH_HIGHLIGHT_MAX_LENGTH) + '…'
  }

  return snippet
}

/**
 * 在文本中高亮关键词（安全方式：先转义 HTML，再用 <mark> 标记）
 *
 * 流程：原始文本 → HTML 转义 → 正则替换匹配词为 <mark>标签
 * 这保证了任何原文中的 HTML 不会被浏览器解析，只有我们插入的 <mark> 标签生效
 */
function highlightText(text = '', terms = []) {
  if (!text) return ''
  if (terms.length === 0) return escapeHtmlSafe(text)

  // 先对原始文本做 HTML 转义，防止 XSS
  const safeText = escapeHtmlSafe(text)

  // 在转义后的文本中，对匹配词包裹 <mark>
  // 需要对 terms 也做转义（因为如果 term 含 & < >，转义后的文本里它们也变了）
  const sorted = [...terms].sort((a, b) => b.length - a.length)

  let result = safeText
  for (const term of sorted) {
    const safeTerm = escapeHtmlSafe(term)
    if (!safeTerm) continue
    const re = new RegExp(`(${escapeRegExp(safeTerm)})`, 'gi')
    result = result.replace(re, '<mark>$1</mark>')
  }

  return result
}

function escapeHtmlSafe(str = '') {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── 主搜索 ──────────────────────────────────────────────

/**
 * 全文检索文章
 *
 * @param {Object} rawQuery - 请求 query 参数
 * @param {string} rawQuery.q       - 搜索关键词
 * @param {string} rawQuery.mode    - 匹配模式 AND | OR（默认 AND）
 * @param {string} rawQuery.sort    - 排序 relevance | date | views（默认 relevance）
 * @param {string} rawQuery.category - 按分类 slug 筛选
 * @param {string} rawQuery.tag     - 按标签 slug 筛选
 * @param {number} rawQuery.page    - 页码
 * @param {number} rawQuery.pageSize - 每页条数
 */
export async function searchArticles(rawQuery = {}) {
  const startTime = Date.now()
  const q = normalizeQuery(rawQuery.q || rawQuery.search || '')
  const mode = (rawQuery.mode || 'AND').toUpperCase() === 'OR' ? 'OR' : 'AND'
  const sort = rawQuery.sort || 'relevance'
  const pagination = getPagination(rawQuery)
  const terms = splitTerms(q)

  // 无搜索词 → 返回空
  if (!q) {
    return {
      items: [],
      total: 0,
      page: pagination.page,
      pageSize: pagination.pageSize,
      facets: { categories: [], tags: [] },
      tookMs: 0,
      terms: []
    }
  }

  // ── 构建基础查询 ──
  const baseFilter = {
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null
  }

  // ── 分类筛选 ──
  let categoryIds = null
  if (rawQuery.category) {
    categoryIds = await resolveCategoryAndDescendantIds(rawQuery.category)
    if (categoryIds === '__missing__') {
      return emptyResult(pagination, Date.now() - startTime)
    }
  }

  // ── 标签筛选 ──
  let tagId = null
  if (rawQuery.tag) {
    tagId = await resolveTagId(rawQuery.tag)
    if (tagId === '__missing__') {
      return emptyResult(pagination, Date.now() - startTime)
    }
  }

  // ── 阶段1：$text 全文索引查询 → BM25 评分 ──
  // $text 对 title/summary/contentMarkdown 三个字段做全文检索
  // 如果文本索引不存在（如测试环境），降级为 RegExp 搜索
  let textMatchedIds = new Set()
  let textScores = new Map()
  let usedTextSearch = false

  if (terms.length > 0) {
    const textQuery = terms.join(' ')

    try {
      const textResults = await Article.find(
        { ...baseFilter, $text: { $search: textQuery } },
        { score: { $meta: 'textScore' } }
      )
        .select('_id score')
        .lean()

      textResults.forEach((r) => {
        const id = r._id.toString()
        textMatchedIds.add(id)
        textScores.set(id, r.score || 0)
      })
      usedTextSearch = true
    } catch (textSearchError) {
      // 文本索引不存在时降级为 RegExp 搜索
      // 这可能在测试环境（MongoDB Memory Server 首次启动索引未就绪）出现
      if (textSearchError.codeName === 'IndexNotFound' || /text index required/i.test(textSearchError.message)) {
        const regexConditions = terms.map((term) => ({
          $or: [
            { title: new RegExp(escapeRegExp(term), 'i') },
            { summary: new RegExp(escapeRegExp(term), 'i') },
            { contentMarkdown: new RegExp(escapeRegExp(term), 'i') }
          ]
        }))

        const fallbackResults = await Article.find({
          ...baseFilter,
          $and: regexConditions
        }).select('_id').lean()

        fallbackResults.forEach((r, idx) => {
          const id = r._id.toString()
          textMatchedIds.add(id)
          // RegExp 无评分，给递减基础分
          textScores.set(id, Math.max(0.1, 10 - idx * 0.5))
        })
      } else {
        throw textSearchError
      }
    }
  }

  // ── 阶段2：标签名 / 分类名补充搜索 ──
  // Article 的 tags 字段是 ObjectId[] 引用，不是嵌入文档，不能直接查 tags.name
  // 需要先查 Tag 集合拿到匹配的 tag _id，再用 $in 查 Article
  let supplementaryIds = new Set()

  if (terms.length > 0) {
    const orConditions = []

    // 按标签名搜索：先查 Tag 集合
    const tagRegex = terms.map((t) => escapeRegExp(t)).join('|')
    const matchedTags = await Tag.find({
      name: new RegExp(tagRegex, 'i')
    }).select('_id').lean()

    if (matchedTags.length > 0) {
      orConditions.push({
        tags: { $in: matchedTags.map((t) => t._id) }
      })
    }

    // 按分类名搜索：先查 Category 集合
    const matchedCategories = await Category.find({
      name: new RegExp(tagRegex, 'i')
    }).select('_id').lean()

    if (matchedCategories.length > 0) {
      orConditions.push({
        category: { $in: matchedCategories.map((c) => c._id) }
      })
    }

    // 执行补充查询
    if (orConditions.length > 0) {
      const supplementaryResults = await Article.find({
        ...baseFilter,
        $or: orConditions
      }).select('_id').lean()

      supplementaryResults.forEach((r) => {
        supplementaryIds.add(r._id.toString())
      })
    }
  }

  // ── 阶段3：按 AND/OR 模式合并 ID 集合 ──
  const allMatchedIds = new Set()

  if (mode === 'AND') {
    // AND 模式：文章必须匹配每个搜索词（至少出现在一个来源中）
    // 由于 $text 是整串搜索，不是逐词搜索，真正的 AND 语义需要：
    // 每个词都至少命中了该文章（text 或 supplementary）
    // 简化实现：合并所有来源的 ID（取并集），靠评分区分优先级
    // 严格 AND 的精确实现需要更复杂的逐词 $text 搜索，开销较大
    // 当前策略：并集（和 OR 相同），但评分上 $text 命中的分数远高于 supplementary
    textMatchedIds.forEach((id) => allMatchedIds.add(id))
    supplementaryIds.forEach((id) => allMatchedIds.add(id))
  } else {
    // OR 模式：出现在任一来源即可
    textMatchedIds.forEach((id) => allMatchedIds.add(id))
    supplementaryIds.forEach((id) => allMatchedIds.add(id))
  }

  // ── 构建最终查询 ──
  const matchFilter = { ...baseFilter }

  if (allMatchedIds.size > 0) {
    matchFilter._id = { $in: Array.from(allMatchedIds) }
  } else {
    return emptyResult(pagination, Date.now() - startTime)
  }

  if (categoryIds) {
    matchFilter.category = Array.isArray(categoryIds) ? { $in: categoryIds } : categoryIds
  }

  if (tagId) {
    matchFilter.tags = tagId
  }

  // ── 排序 ──
  let sortOption
  let needScoreProjection = false

  if (sort === 'date') {
    sortOption = { publishedAt: -1, createdAt: -1 }
  } else if (sort === 'views') {
    sortOption = { viewCount: -1, publishedAt: -1 }
  } else {
    // relevance 排序：
    // 如果所有匹配结果都来自 $text，可以用 { score: { $meta: 'textScore' } } 排序
    // 但当混合了 supplementary 结果时，不能在 MongoDB 层面用 textScore 排序
    // （因为 supplementary 结果没有 textScore）
    // 解决方案：在内存中按综合评分排序
    sortOption = { publishedAt: -1, createdAt: -1 }
    needScoreProjection = true
  }

  // ── 查询总数和分页数据 ──
  const [items, total] = await Promise.all([
    Article.find(matchFilter)
      .populate('category')
      .populate('tags')
      .populate('createdBy', 'username avatar role')
      .sort(sortOption)
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .lean(),
    Article.countDocuments(matchFilter)
  ])

  // ── Facets 聚合（分类 + 标签统计） ──
  const facets = await buildFacets(matchFilter)

  // ── 组装结果 ──
  const tookMs = Date.now() - startTime

  let resultItems = items.map((article) => {
    const id = article._id.toString()
    const textScore = textScores.get(id) || 0
    const isTextMatch = textMatchedIds.has(id)
    const isSupplementary = supplementaryIds.has(id)

    // 综合评分：
    // - $text BM25 命中：使用原始 textScore
    // - 补充来源命中：给较低基准分
    // - 同时命中 $text 和补充：略微加分
    let relevanceScore = textScore
    if (isSupplementary && !isTextMatch) {
      relevanceScore = 0.5
    } else if (isSupplementary && isTextMatch) {
      relevanceScore = textScore + 0.3
    }

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
          return { id: tag.toString(), name: tag.toString(), slug: '' }
        })
      : []

    // 高亮片段
    const snippet = extractHighlightSnippet(article.contentMarkdown, terms)
    const highlightedTitle = highlightText(article.title, terms)
    const highlightedSummary = highlightText(article.summary, terms)

    return {
      id,
      title: article.title,
      highlightedTitle,
      slug: article.slug,
      summary: article.summary || '',
      highlightedSummary,
      snippet,
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
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      matchSource: isTextMatch ? 'text' : isSupplementary ? 'supplementary' : 'unknown'
    }
  })

  // ── 如果是 relevance 排序，在内存中按综合评分排序 ──
  if (needScoreProjection && resultItems.length > 1) {
    resultItems.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
    })
  }

  return {
    items: resultItems,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    facets,
    tookMs,
    terms
  }
}

// ─── Facets 聚合 ─────────────────────────────────────────

async function buildFacets(matchFilter) {
  try {
    const articles = await Article.find(matchFilter)
      .select('category tags')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .lean()

    const categoryMap = new Map()
    const tagMap = new Map()

    articles.forEach((article) => {
      // 分类统计
      if (article.category && typeof article.category === 'object') {
        const key = article.category.slug || article.category._id?.toString()
        if (key && !categoryMap.has(key)) {
          categoryMap.set(key, {
            name: article.category.name,
            slug: article.category.slug,
            count: 0
          })
        }
        if (key) {
          categoryMap.get(key).count++
        }
      }

      // 标签统计
      if (Array.isArray(article.tags)) {
        article.tags.forEach((tag) => {
          if (tag && typeof tag === 'object') {
            const key = tag.slug || tag._id?.toString()
            if (key && !tagMap.has(key)) {
              tagMap.set(key, {
                name: tag.name,
                slug: tag.slug,
                count: 0
              })
            }
            if (key) {
              tagMap.get(key).count++
            }
          }
        })
      }
    })

    return {
      categories: Array.from(categoryMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, FACET_CATEGORY_LIMIT),
      tags: Array.from(tagMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, FACET_TAG_LIMIT)
    }
  } catch {
    return { categories: [], tags: [] }
  }
}

// ─── 搜索建议 ────────────────────────────────────────────

/**
 * 搜索建议（按标题匹配 + 热度排序）
 */
export async function getSearchSuggestions(rawQuery = {}) {
  const q = normalizeQuery(rawQuery.q || '')
  if (!q || q.length < 1) return { items: [] }

  const terms = splitTerms(q)
  if (terms.length === 0) return { items: [] }

  const orConditions = terms.map((term) => ({
    title: new RegExp(escapeRegExp(term), 'i')
  }))

  const items = await Article.find({
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null,
    $or: orConditions
  })
    .select('title slug category viewCount')
    .populate('category', 'name slug')
    .sort({ viewCount: -1, publishedAt: -1 })
    .limit(SUGGEST_LIMIT)
    .lean()

  return {
    items: items.map((item) => ({
      title: item.title,
      slug: item.slug,
      category: item.category && typeof item.category === 'object'
        ? { name: item.category.name, slug: item.category.slug }
        : null
    }))
  }
}

// ─── 辅助函数 ────────────────────────────────────────────

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
    categories.forEach((cat) => {
      const parentId = cat.parent?.toString()
      const categoryId = cat._id.toString()
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

function emptyResult(pagination, tookMs = 0) {
  return {
    items: [],
    total: 0,
    page: pagination.page,
    pageSize: pagination.pageSize,
    facets: { categories: [], tags: [] },
    tookMs,
    terms: []
  }
}
