import archiver from 'archiver'
import { once } from 'node:events'
import { ARTICLE_STATUS } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'

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

function buildExportSlug(article, strategy, exportedAt = new Date()) {
  if (strategy === 'keep') {
    return article.slug
  }

  return `${article.slug}-revision-${formatDateCompact(exportedAt)}`
}

function buildFrontMatter(article, options = {}) {
  const exportedAt = options.exportedAt || new Date()
  const categoryName = article.category?.name || ''
  const tags = normalizeArray(article.tags)
    .map((tag) => tag?.name)
    .filter(Boolean)
  const lines = [
    '---',
    `title: ${escapeYamlString(article.title)}`,
    `slug: ${escapeYamlString(buildExportSlug(article, options.slugStrategy, exportedAt))}`,
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
  lines.push(`sortOrder: ${Number(article.sortOrder) || 0}`)
  lines.push(`cover: ${escapeYamlString(article.cover || '')}`)
  lines.push(`originalId: ${escapeYamlString(article._id.toString())}`)
  lines.push(`originalSlug: ${escapeYamlString(article.slug)}`)
  lines.push(`originalStatus: ${escapeYamlString(article.status)}`)
  lines.push(`exportedAt: ${escapeYamlString(exportedAt.toISOString())}`)
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

async function appendArchiveEntry(archive, entry) {
  const completed = once(archive, 'entry')
  archive.append(entry.data, {
    name: entry.name,
    date: entry.date || new Date()
  })
  await completed
}

function buildManifestArticle(article, fileName, categoryPathMap, options) {
  const categoryId = article.category?._id?.toString?.() || ''
  const categoryPath = categoryPathMap.get(categoryId) || []

  return {
    originalId: article._id.toString(),
    originalSlug: article.slug,
    exportedSlug: buildExportSlug(article, options.slugStrategy, options.exportedAt),
    title: article.title,
    status: article.status,
    categoryPath,
    tags: normalizeArray(article.tags).map((tag) => tag?.name).filter(Boolean),
    sortOrder: Number(article.sortOrder) || 0,
    sourcePath: article.sourcePath || '',
    publishedAt: article.publishedAt || null,
    updatedAt: article.updatedAt || null,
    fileName
  }
}

function buildExportReadme(input, total, exportedAt) {
  const scopeLabels = {
    published: '已发布',
    draft: '草稿',
    archived: '已下架',
    all: '全部未删除文章'
  }

  return [
    '# 文章 Markdown 导出说明',
    '',
    `- 导出时间：${exportedAt.toISOString()}`,
    `- 导出范围：${scopeLabels[input.scope || 'published']}`,
    `- 文章数量：${total}`,
    `- slug 策略：${input.slugStrategy === 'keep' ? '保留原 slug' : '追加 revision 日期'}`,
    '- 每篇文章是一个 Markdown 文件，顶部 Front Matter 与现有文章导入页面兼容。',
    '- 文件会按文章分类路径放入对应目录；选择上级分类时，会导出该分类及其所有子分类文章。',
    '- manifest.json 记录本次实际导出的文章总数和逐篇清单，可用于核对全量导出是否完整。',
    '- originalId、originalSlug、originalStatus 和 exportedAt 仅用于人工参考，不参与自动覆盖更新。',
    '- 修改后可在“文章导入”页面重新导入，再手动调整分类、标签、目录迁移和旧文清理。',
    ''
  ].join('\n')
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
  const exportedAt = new Date()
  const [total, categoryPathMap] = await Promise.all([
    Article.countDocuments(query),
    buildCategoryPathMap()
  ])

  if (total === 0) {
    throw createHttpError(404, 'ARTICLE_EXPORT_EMPTY', '没有可导出的文章')
  }

  return {
    filename: `articles-markdown-${formatDateCompact()}.zip`,
    total,
    async writeTo(writable) {
      const archive = archiver('zip', { store: true })
      const usedNames = new Set()
      const manifestArticles = []

      archive.on('warning', (error) => {
        if (error.code !== 'ENOENT') {
          archive.emit('error', error)
        }
      })
      archive.on('error', (error) => writable.destroy(error))
      archive.pipe(writable)

      try {
        const cursor = Article.find(query)
          .select('_id title slug summary contentMarkdown cover category tags status sortOrder sourcePath publishedAt createdAt updatedAt')
          .populate('category', 'name')
          .populate('tags', 'name')
          .sort({ publishedAt: -1, updatedAt: -1, createdAt: -1 })
          .lean()
          .cursor()

        for await (const article of cursor) {
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

          await appendArchiveEntry(archive, {
            name: fileName,
            data: buildArticleMarkdown(article, { slugStrategy, exportedAt }),
            date: article.updatedAt || article.createdAt || exportedAt
          })
          manifestArticles.push(buildManifestArticle(article, fileName, categoryPathMap, {
            slugStrategy,
            exportedAt
          }))
        }

        const manifest = {
          formatVersion: 1,
          exportedAt: exportedAt.toISOString(),
          scope: input.scope || 'published',
          slugStrategy,
          filters: {
            categoryId: input.categoryId || null,
            keyword: input.keyword || ''
          },
          total: manifestArticles.length,
          articles: manifestArticles
        }
        await appendArchiveEntry(archive, {
          name: 'manifest.json',
          data: `${JSON.stringify(manifest, null, 2)}\n`,
          date: exportedAt
        })
        await appendArchiveEntry(archive, {
          name: 'README.md',
          data: buildExportReadme({ ...input, slugStrategy }, manifestArticles.length, exportedAt),
          date: exportedAt
        })

        const outputFinished = once(writable, 'finish')
        await archive.finalize()
        await outputFinished
      } catch (error) {
        archive.abort()
        throw error
      }
    }
  }
}

export function buildArticleExportHeaders(filename) {
  return {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  }
}
