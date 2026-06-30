import { ARTICLE_STATUS } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { createZip } from '#utils/zipArchive.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function formatDateCompact(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}

function escapeYamlString(value) {
  return JSON.stringify(String(value ?? ''))
}

function sanitizeFilename(value, fallback = 'article') {
  const name = String(value || fallback)
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')

  return (name || fallback).slice(0, 120)
}

function sanitizePathSegment(value, fallback = '未分类') {
  return sanitizeFilename(value, fallback) || fallback
}

function buildExportSlug(article, strategy) {
  if (strategy === 'keep') {
    return article.slug
  }

  return `${article.slug}-revision-${formatDateCompact()}`
}

function buildFrontMatter(article, options = {}) {
  const categoryName = article.category?.name || ''
  const tags = normalizeArray(article.tags)
    .map((tag) => tag?.name)
    .filter(Boolean)
  const lines = [
    '---',
    `title: ${escapeYamlString(article.title)}`,
    `slug: ${escapeYamlString(buildExportSlug(article, options.slugStrategy))}`,
    `summary: ${escapeYamlString(article.summary || '')}`,
    `category: ${escapeYamlString(categoryName)}`
  ]

  if (tags.length > 0) {
    lines.push('tags:')
    tags.forEach((tag) => {
      lines.push(`  - ${escapeYamlString(tag)}`)
    })
  } else {
    lines.push('tags: []')
  }

  lines.push(`status: ${escapeYamlString(ARTICLE_STATUS.DRAFT)}`)
  lines.push(`cover: ${escapeYamlString(article.cover || '')}`)
  lines.push(`originalId: ${escapeYamlString(article._id.toString())}`)
  lines.push(`originalSlug: ${escapeYamlString(article.slug)}`)
  lines.push(`exportedAt: ${escapeYamlString(new Date().toISOString())}`)
  lines.push('---')
  lines.push('')

  return lines.join('\n')
}

function buildArticleMarkdown(article, options = {}) {
  const content = String(article.contentMarkdown || '').replace(/^\uFEFF/, '')
  return `${buildFrontMatter(article, options)}${content.trim()}\n`
}

async function collectCategoryBranchIds(categoryId) {
  const categories = await Category.find({}, '_id parent').lean()
  const childMap = new Map()

  for (const category of categories) {
    const parentId = category.parent ? String(category.parent) : null
    if (!childMap.has(parentId)) {
      childMap.set(parentId, [])
    }
    childMap.get(parentId).push(String(category._id))
  }

  const resolved = new Set([String(categoryId)])
  const queue = [String(categoryId)]

  while (queue.length > 0) {
    const current = queue.shift()
    const children = childMap.get(current) || []
    for (const childId of children) {
      if (resolved.has(childId)) continue
      resolved.add(childId)
      queue.push(childId)
    }
  }

  return [...resolved]
}

async function buildCategoryPathMap() {
  const categories = await Category.find({}, 'name parent sortOrder').lean()
  const categoryMap = new Map(categories.map((category) => [String(category._id), category]))
  const pathMap = new Map()

  function resolvePath(categoryId, seen = new Set()) {
    const id = String(categoryId || '')
    if (!id || seen.has(id)) return []
    if (pathMap.has(id)) return pathMap.get(id)
    const category = categoryMap.get(id)
    if (!category) return []

    seen.add(id)
    const parentPath = category.parent ? resolvePath(category.parent, seen) : []
    const currentPath = [...parentPath, category.name].filter(Boolean)
    pathMap.set(id, currentPath)
    return currentPath
  }

  categories.forEach((category) => resolvePath(category._id))
  return pathMap
}

function buildArticleEntryName(article, categoryPathMap) {
  const articleCategoryId = article.category?._id?.toString?.() || article.category?.toString?.() || ''
  const categoryPath = categoryPathMap.get(articleCategoryId) || []
  const folderPath = categoryPath.map((name) => sanitizePathSegment(name)).join('/')
  const baseName = sanitizeFilename(article.title, article.slug)
  return folderPath ? `${folderPath}/${baseName}.md` : `${baseName}.md`
}

async function buildArticleQuery(input = {}) {
  const query = { deletedAt: null }
  const scope = input.scope || 'published'

  if (Array.isArray(input.ids) && input.ids.length > 0) {
    query._id = { $in: input.ids }
  }

  if (scope === 'published') {
    query.status = ARTICLE_STATUS.PUBLISHED
  } else if (scope === 'draft') {
    query.status = ARTICLE_STATUS.DRAFT
  } else if (scope === 'archived') {
    query.status = ARTICLE_STATUS.ARCHIVED
  }

  if (input.categoryId) {
    query.category = { $in: await collectCategoryBranchIds(input.categoryId) }
  }

  if (input.keyword) {
    query.$or = [
      { title: { $regex: input.keyword, $options: 'i' } },
      { summary: { $regex: input.keyword, $options: 'i' } }
    ]
  }

  return query
}

export async function exportArticlesAsMarkdownZip(input = {}) {
  const query = await buildArticleQuery(input)
  const slugStrategy = input.slugStrategy === 'keep' ? 'keep' : 'revision'
  const [articles, categoryPathMap] = await Promise.all([
    Article.find(query)
      .populate('category')
      .populate('tags')
      .sort({ publishedAt: -1, updatedAt: -1, createdAt: -1 })
      .limit(200),
    buildCategoryPathMap()
  ])

  if (articles.length === 0) {
    throw createHttpError(404, 'ARTICLE_EXPORT_EMPTY', '没有可导出的文章')
  }

  const usedNames = new Set()
  const entries = articles.map((article) => {
    const entryName = buildArticleEntryName(article, categoryPathMap)
    const extensionIndex = entryName.lastIndexOf('.md')
    const baseName = extensionIndex >= 0 ? entryName.slice(0, extensionIndex) : entryName
    let fileName = entryName
    let suffix = 2
    while (usedNames.has(fileName)) {
      fileName = `${baseName}-${suffix}.md`
      suffix += 1
    }
    usedNames.add(fileName)

    return {
      name: fileName,
      data: buildArticleMarkdown(article, { slugStrategy }),
      date: article.updatedAt || article.createdAt || new Date()
    }
  })

  const readme = [
    '# 文章 Markdown 导出说明',
    '',
    `- 导出时间：${new Date().toISOString()}`,
    `- 文章数量：${articles.length}`,
    '- 每篇文章是一个 Markdown 文件，顶部 Front Matter 与现有文章导入页面兼容。',
    '- 文件会按文章分类路径放入对应目录；选择上级分类时，会导出该分类及其所有子分类文章。',
    '- 默认导出的 slug 会追加 revision 日期，避免重新导入时与旧文章 slug 冲突。',
    '- originalId 和 originalSlug 仅用于人工参考，不参与自动覆盖更新。',
    '- 修改后可在“文章导入”页面重新导入，再手动调整分类、标签、目录迁移和旧文清理。',
    ''
  ].join('\n')

  return {
    buffer: createZip([{ name: 'README.md', data: readme }, ...entries]),
    filename: `articles-markdown-${formatDateCompact()}.zip`,
    total: articles.length
  }
}

export function buildArticleExportHeaders(filename) {
  return {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  }
}
