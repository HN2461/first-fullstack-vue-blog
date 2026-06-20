import crypto from 'node:crypto'
import path from 'node:path'
import matter from 'gray-matter'
import { ARTICLE_STATUS } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { buildArticleSlug, createArticle } from './article.service.js'
import { decodeUploadFilename } from '#utils/uploadFilename.js'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_IMPORT_FILES = 20
const MAX_MARKDOWN_FILE_SIZE = 1024 * 1024

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeSlug(value) {
  return normalizeText(value).toLowerCase()
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[,，\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function stripMarkdown(markdown) {
  return String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]*\)/g, '$1')
    .replace(/[#>*_\-[\]()`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractFirstHeading(markdown) {
  const match = String(markdown || '').match(/^#\s+(.+)$/m)
  return match ? normalizeText(match[1].replace(/#+$/, '')) : ''
}

function getTitleFromFilename(filename) {
  const parsed = path.parse(filename || '')
  return normalizeText(parsed.name).replace(/[-_]+/g, ' ')
}

function buildSummary(markdown) {
  const plainText = stripMarkdown(markdown)
  return plainText.slice(0, 300)
}

function createHash(content) {
  return crypto.createHash('sha256').update(String(content || '')).digest('hex')
}

function isMarkdownFilename(filename) {
  return /\.(md|markdown)$/i.test(filename || '')
}

function getOriginalFilename(file) {
  return decodeUploadFilename(file.originalname || '')
}

async function getLookupMaps() {
  const [categories, tags] = await Promise.all([
    Category.find({ status: 'active' }),
    Tag.find({ status: 'active' })
  ])

  const categoryMap = new Map()
  const tagMap = new Map()

  categories.forEach((category) => {
    categoryMap.set(category.name, category)
    categoryMap.set(category.slug, category)
  })

  tags.forEach((tag) => {
    tagMap.set(tag.name, tag)
    tagMap.set(tag.slug, tag)
  })

  return { categoryMap, tagMap }
}

function resolveCategory(categoryName, categoryMap) {
  const name = normalizeText(categoryName)
  if (!name) {
    return {
      categoryName: '',
      categoryId: null,
      categoryMatched: true
    }
  }

  const category = categoryMap.get(name) || categoryMap.get(normalizeSlug(name))
  return {
    categoryName: name,
    categoryId: category?._id?.toString?.() || null,
    categoryMatched: Boolean(category)
  }
}

function resolveTags(tagNames, tagMap) {
  const resolved = []
  const missing = []

  normalizeArray(tagNames).forEach((name) => {
    const tag = tagMap.get(name) || tagMap.get(normalizeSlug(name))
    if (tag) {
      resolved.push({
        id: tag._id.toString(),
        name: tag.name
      })
      return
    }

    missing.push(name)
  })

  return { resolved, missing }
}

function parseMarkdownContent(fileName, rawMarkdown, lookupMaps) {
  const parsed = matter(rawMarkdown)
  const data = parsed.data || {}
  const contentMarkdown = normalizeText(parsed.content)
  const title = normalizeText(data.title) || extractFirstHeading(contentMarkdown) || getTitleFromFilename(fileName)
  const slug = normalizeSlug(data.slug) || buildArticleSlug(title)
  const summary = normalizeText(data.summary) || buildSummary(contentMarkdown)
  const categoryResult = resolveCategory(data.category, lookupMaps.categoryMap)
  const tagResult = resolveTags(data.tags, lookupMaps.tagMap)

  const errors = []
  const warnings = []

  if (!title) {
    errors.push('无法识别文章标题')
  } else if (title.length > 120) {
    errors.push('文章标题不能超过 120 个字符')
  }

  if (!contentMarkdown) {
    errors.push('正文内容不能为空')
  }

  if (!SLUG_PATTERN.test(slug)) {
    errors.push('文章 slug 只能包含小写字母、数字和短横线')
  }

  if (summary.length > 300) {
    errors.push('文章摘要不能超过 300 个字符')
  }

  if (!categoryResult.categoryMatched) {
    warnings.push(`分类「${categoryResult.categoryName}」不存在`)
  }

  if (tagResult.missing.length > 0) {
    warnings.push(`标签不存在：${tagResult.missing.join('、')}`)
  }

  return {
    fileName,
    title,
    slug,
    summary,
    contentMarkdown,
    categoryName: categoryResult.categoryName,
    categoryId: categoryResult.categoryId,
    categoryMatched: categoryResult.categoryMatched,
    tagNames: [...tagResult.resolved.map((tag) => tag.name), ...tagResult.missing],
    tagIds: tagResult.resolved.map((tag) => tag.id),
    missingTags: tagResult.missing,
    status: ARTICLE_STATUS.DRAFT,
    sourceHash: createHash(rawMarkdown),
    errors,
    warnings
  }
}

function buildPreviewStatus(item, duplicate) {
  if (item.errors.length > 0) {
    return {
      importStatus: 'error',
      importStatusLabel: '有错误',
      canImport: false
    }
  }

  if (duplicate) {
    return {
      importStatus: 'duplicate',
      importStatusLabel: '疑似重复',
      canImport: false
    }
  }

  if (item.warnings.length > 0) {
    return {
      importStatus: 'warning',
      importStatusLabel: '需要确认',
      canImport: false
    }
  }

  return {
    importStatus: 'ready',
    importStatusLabel: '可导入',
    canImport: true
  }
}

async function buildPreviewItems(files) {
  const lookupMaps = await getLookupMaps()
  const parsedItems = files.map((file, index) => {
    const fileName = getOriginalFilename(file)
    const rawMarkdown = file.buffer.toString('utf8')

    if (!isMarkdownFilename(fileName)) {
      return {
        key: `${index}:${fileName}`,
        fileName,
        title: '',
        slug: '',
        summary: '',
        contentMarkdown: '',
        categoryName: '',
        categoryId: null,
        categoryMatched: true,
        tagNames: [],
        tagIds: [],
        missingTags: [],
        status: ARTICLE_STATUS.DRAFT,
        sourceHash: createHash(rawMarkdown),
        errors: ['仅支持 .md 或 .markdown 文件'],
        warnings: []
      }
    }

    return {
      key: `${index}:${fileName}`,
      ...parseMarkdownContent(fileName, rawMarkdown, lookupMaps)
    }
  })

  const slugs = parsedItems.map((item) => item.slug).filter(Boolean)
  const duplicatedSlugs = new Set()
  const seenSlugs = new Set()

  slugs.forEach((slug) => {
    if (seenSlugs.has(slug)) {
      duplicatedSlugs.add(slug)
      return
    }
    seenSlugs.add(slug)
  })

  const existingArticles = slugs.length
    ? await Article.find({ slug: { $in: slugs }, deletedAt: null }).select('title slug')
    : []
  const existingMap = new Map(existingArticles.map((article) => [article.slug, article]))

  return parsedItems.map((item, index) => {
    const existingArticle = existingMap.get(item.slug)
    const errors = [...item.errors]
    const warnings = [...item.warnings]

    if (duplicatedSlugs.has(item.slug)) {
      errors.push('本次上传中存在重复 slug')
    }

    if (existingArticle) {
      warnings.push(`slug 已存在：${existingArticle.title}`)
    }

    const status = buildPreviewStatus({ ...item, errors, warnings }, Boolean(existingArticle))

    return {
      ...item,
      key: item.key || `${index}:${item.fileName}`,
      errors,
      warnings,
      duplicateArticle: existingArticle
        ? {
            id: existingArticle._id.toString(),
            title: existingArticle.title,
            slug: existingArticle.slug
          }
        : null,
      ...status
    }
  })
}

export function buildArticleImportTemplate() {
  return `---
title: Vue 3 响应式系统学习笔记
slug: vue3-reactivity-notes
summary: 记录 Vue 3 响应式系统的核心概念、依赖收集和触发更新流程。
category: 前端
tags:
  - Vue
  - 响应式
status: draft
cover:
---

# Vue 3 响应式系统学习笔记

> 给 AI 的要求：
> 1. 保留并维护最上方 Front Matter，不要删除 --- 分隔线。
> 2. 不要修改字段名；可以根据正文内容补全 title、slug、summary、category、tags。
> 3. 正文必须使用 Markdown，代码块请标注语言。
> 4. status 固定写 draft，导入后我会在知识库后台确认发布。
> 5. category 和 tags 使用系统里已有的中文名称；不确定时留空或保留待我手动调整。

## 字段说明

- title：文章标题，必填，最多 120 个字符。
- slug：文章访问标识，只能使用小写字母、数字和短横线；不填时系统会自动生成。
- summary：文章摘要，最多 300 个字符；不填时系统会从正文自动截取。
- category：分类名称，应匹配知识库已有分类。
- tags：标签名称列表，应匹配知识库已有标签。
- status：固定使用 draft。
- cover：封面图片地址，可留空。

## 背景

说明为什么要记录这篇文章、解决什么问题、适合什么场景。

## 核心概念

用分点或小节解释关键概念，必要时加入代码示例。

## 实践步骤

1. 写清楚操作步骤。
2. 标注容易出错的地方。
3. 给出验证方式。

## 常见问题

### 问题一

说明现象、原因和处理方式。

## 总结

用几句话总结本文的关键结论和后续延伸方向。
`
}

export async function previewMarkdownArticleImport(files = []) {
  if (!Array.isArray(files) || files.length === 0) {
    throw createHttpError(400, 'IMPORT_FILES_REQUIRED', '请选择要导入的 Markdown 文件')
  }

  if (files.length > MAX_IMPORT_FILES) {
    throw createHttpError(400, 'IMPORT_FILE_COUNT_LIMIT', `单次最多导入 ${MAX_IMPORT_FILES} 个 Markdown 文件`)
  }

  const oversized = files.find((file) => file.size > MAX_MARKDOWN_FILE_SIZE)
  if (oversized) {
    throw createHttpError(400, 'IMPORT_FILE_SIZE_LIMIT', '单个 Markdown 文件不能超过 1MB')
  }

  const items = await buildPreviewItems(files)
  return {
    items,
    total: items.length,
    readyCount: items.filter((item) => item.importStatus === 'ready').length,
    warningCount: items.filter((item) => item.importStatus === 'warning').length,
    duplicateCount: items.filter((item) => item.importStatus === 'duplicate').length,
    errorCount: items.filter((item) => item.importStatus === 'error').length
  }
}

export async function commitMarkdownArticleImport(input = {}, user) {
  const items = Array.isArray(input.items) ? input.items : []
  const duplicateStrategy = input.options?.duplicateStrategy || 'skip'

  if (!items.length) {
    throw createHttpError(400, 'IMPORT_ITEMS_REQUIRED', '请选择要导入的文章')
  }

  if (duplicateStrategy !== 'skip') {
    throw createHttpError(400, 'IMPORT_DUPLICATE_STRATEGY_UNSUPPORTED', '第一版仅支持跳过重复文章')
  }

  const resultItems = []
  let successCount = 0
  let skippedCount = 0
  let failedCount = 0

  for (const item of items) {
    const fileName = normalizeText(item.fileName)
    const title = normalizeText(item.title)
    const slug = normalizeSlug(item.slug)
    const contentMarkdown = normalizeText(item.contentMarkdown)

    try {
      if (!item.canImport || item.importStatus !== 'ready') {
        skippedCount += 1
        resultItems.push({
          fileName,
          title,
          slug,
          status: 'skipped',
          reason: '该文章预览状态不可导入'
        })
        continue
      }

      if (!title || !contentMarkdown) {
        throw createHttpError(400, 'IMPORT_ARTICLE_INVALID', '标题和正文不能为空')
      }

      const existing = await Article.exists({ slug, deletedAt: null })
      if (existing) {
        skippedCount += 1
        resultItems.push({
          fileName,
          title,
          slug,
          status: 'skipped',
          reason: 'slug 已存在'
        })
        continue
      }

      const article = await createArticle({
        title,
        slug,
        summary: normalizeText(item.summary),
        contentMarkdown,
        cover: normalizeText(item.cover),
        category: item.categoryId || null,
        tags: Array.isArray(item.tagIds) ? item.tagIds : [],
        status: ARTICLE_STATUS.DRAFT,
        source: 'manual',
        sourcePath: fileName,
        sourceHash: normalizeText(item.sourceHash) || createHash(contentMarkdown),
        importedAt: new Date()
      }, user)

      successCount += 1
      resultItems.push({
        fileName,
        title,
        slug,
        status: 'success',
        reason: '',
        articleId: article.id
      })
    } catch (error) {
      failedCount += 1
      resultItems.push({
        fileName,
        title,
        slug,
        status: 'failed',
        reason: error.message || '导入失败'
      })
    }
  }

  return {
    total: items.length,
    successCount,
    skippedCount,
    failedCount,
    items: resultItems
  }
}
