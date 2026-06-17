import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ASCII_FALLBACK_PREFIX = 'legacy'
const NAVIGATION_FILE_NAMES = new Set(['目录.md', 'README.md', 'readme.md', 'index.md', 'Index.md'])
const KNOWN_CONTENT_REPAIRS = {
  '项目复用技术/WebSocket/09-WebSocket与AI流式传输深度解析_SSE对比_实现方案与最佳实践.md': [
    ['AI生成的token可能���序到达', 'AI生成的token可能乱序到达'],
    ['AI流式传输��「首字节时间」', 'AI流式传输的「首字节时间」']
  ]
}
const EXPECTED_REPLACEMENT_CHAR_PATHS = new Set([
  '我的总结/JS/辅助资料/10_字符串.md'
])

export function shortHash(input, length = 8) {
  return crypto.createHash('sha256').update(String(input)).digest('hex').slice(0, length)
}

export function contentHash(content) {
  return crypto.createHash('sha256').update(String(content || '')).digest('hex')
}

export function normalizeRelPath(value) {
  return String(value || '').split(path.sep).join('/')
}

function sanitizeMenuName(value) {
  return String(value || '')
    .replace(/\u0000/g, '')
    .replace(/<\/?script\b[^>]*>/gi, '')
    .replace(/<\/?style\b[^>]*>/gi, '')
    .replace(/<\/?iframe\b[^>]*>/gi, '')
    .replace(/<\/?object\b[^>]*>/gi, '')
    .replace(/<\/?embed\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function cleanTitleFromFilename(filename) {
  let title = sanitizeMenuName(String(filename || '').replace(/\.md$/i, ''))

  title = title
    .replace(/[_\-]\d{4}[-_]?\d{0,2}[-_]?\d{0,2}\s*$/, '')
    .trim()

  return title || String(filename || '').replace(/\.md$/i, '')
}

export function cleanDirectoryName(dirname) {
  return sanitizeMenuName(dirname)
}

function pickString(frontmatter, fields) {
  for (const field of fields) {
    const value = frontmatter[field]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
    if (Array.isArray(value) && value.length > 0) {
      const first = value.find((item) => String(item || '').trim())
      if (first) return String(first).trim()
    }
  }

  return ''
}

function pickDate(frontmatter, fileStat) {
  const value = pickString(frontmatter, ['date', 'created', 'createdAt', 'publishDate', 'updated', '日期'])
  if (value) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }

  return fileStat.mtime
}

function getFrontmatterTags(frontmatter) {
  const tagFields = ['tags', 'tag', 'keywords', 'keyword', '标签', '关键词', '关键字']
  const rawTags = []

  for (const field of tagFields) {
    const value = frontmatter[field]
    if (Array.isArray(value)) {
      rawTags.push(...value)
    } else if (typeof value === 'string' && value.trim()) {
      rawTags.push(...value.split(/[、，,]/))
    }
  }

  return [...new Set(rawTags.map((tag) => String(tag || '').replace(/^#+/, '').trim()).filter(Boolean))]
}

function asciiSlugPart(value) {
  const ascii = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return ascii
}

export function generateAsciiSlug(parts, fallbackInput, maxLength = 90) {
  const normalized = parts
    .flatMap((part) => String(part || '').split('/'))
    .map(asciiSlugPart)
    .filter(Boolean)
    .join('-')
    .replace(/-+/g, '-')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '')

  const hash = shortHash(fallbackInput, 8)
  const fallback = `${ASCII_FALLBACK_PREFIX}-${hash}`
  const base = normalized || fallback
  const trimmed = base
    .slice(0, Math.max(1, maxLength - hash.length - 1))
    .replace(/^-+|-+$/g, '')

  return `${trimmed || ASCII_FALLBACK_PREFIX}-${hash}`
}

export function calculateWordCount(content) {
  const cleaned = String(content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_\-[\]()`]/g, ' ')
    .trim()

  if (!cleaned) return 0

  const chineseChars = cleaned.match(/[\u4e00-\u9fa5]/g)?.length || 0
  const latinWords = cleaned
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  return chineseChars + latinWords
}

export function calculateReadingMinutes(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 400))
}

export function scanLegacyNotes(rootDir, relativePath = '') {
  const files = []
  const skipped = []
  let totalMarkdown = 0

  if (!fs.existsSync(rootDir)) {
    return { files, skipped, totalMarkdown }
  }

  const entries = fs.readdirSync(path.join(rootDir, relativePath), { withFileTypes: true })

  for (const entry of entries) {
    const relPath = normalizeRelPath(relativePath ? `${relativePath}/${entry.name}` : entry.name)
    const fullPath = path.join(rootDir, relPath)

    if (entry.isDirectory()) {
      if (entry.name.toLowerCase() === 'images') {
        skipped.push({ relPath, reason: '图片资源目录' })
        continue
      }

      const child = scanLegacyNotes(rootDir, relPath)
      files.push(...child.files)
      skipped.push(...child.skipped)
      totalMarkdown += child.totalMarkdown
      continue
    }

    if (!entry.name.toLowerCase().endsWith('.md')) continue
    totalMarkdown++

    if (NAVIGATION_FILE_NAMES.has(entry.name)) {
      skipped.push({ relPath, reason: '目录导航文件' })
      continue
    }

    const stat = fs.statSync(fullPath)
    files.push({ fullPath, relPath, filename: entry.name, stat })
  }

  return { files, skipped, totalMarkdown }
}

export function buildLegacyArticleRecord(file, notesRoot) {
  const rawContent = fs.readFileSync(file.fullPath, 'utf8')
  const sanitizedContent = rawContent.replace(/\u0000/g, '')
  let parsed = { data: {}, content: sanitizedContent }

  try {
    parsed = matter(sanitizedContent)
  } catch {
    parsed = { data: {}, content: sanitizedContent }
  }

  const frontmatter = parsed.data || {}
  const relPath = normalizeRelPath(path.relative(notesRoot, file.fullPath) || file.relPath)
  let contentMarkdown = parsed.content || sanitizedContent
  const repairs = KNOWN_CONTENT_REPAIRS[relPath] || []
  for (const [brokenText, fixedText] of repairs) {
    contentMarkdown = contentMarkdown.split(brokenText).join(fixedText)
  }
  const rawSegments = path.dirname(relPath).split('/').filter(Boolean)
  const categoryPath = rawSegments.length > 0
    ? rawSegments.map(cleanDirectoryName).filter(Boolean)
    : ['默认分类']
  const title = pickString(frontmatter, ['title', '标题']) || cleanTitleFromFilename(file.filename)
  const frontmatterCategory = pickString(frontmatter, ['category', 'categories', '分类'])
  const finalCategoryPath = frontmatterCategory
    ? [frontmatterCategory, ...categoryPath.slice(1)]
    : categoryPath
  const frontmatterTags = getFrontmatterTags(frontmatter)
  const tags = frontmatterTags.length > 0 ? frontmatterTags : []
  const summary = pickString(frontmatter, ['description', 'summary', 'excerpt', '摘要'])
  const date = pickDate(frontmatter, file.stat)
  const wordCount = calculateWordCount(contentMarkdown)

  return {
    title,
    slug: generateAsciiSlug([...finalCategoryPath, cleanTitleFromFilename(file.filename)], relPath),
    summary,
    contentMarkdown,
    categoryPath: finalCategoryPath,
    tags,
    legacyDate: date,
    source: 'legacy-notes',
    sourcePath: relPath,
    sourceHash: contentHash(sanitizedContent),
    wordCount,
    readingMinutes: calculateReadingMinutes(wordCount),
    hasFrontmatter: Object.keys(frontmatter).length > 0
  }
}

export function analyzeLegacyNotes(notesRoot) {
  const scan = scanLegacyNotes(notesRoot)
  const records = scan.files.map((file) => buildLegacyArticleRecord(file, notesRoot))
  const suspiciousEncoding = records
    .filter((record) => {
      if (EXPECTED_REPLACEMENT_CHAR_PATHS.has(record.sourcePath)) {
        return /鍥/.test(record.contentMarkdown)
      }

      return /�|鍥/.test(record.contentMarkdown)
    })
    .map((record) => record.sourcePath)

  return {
    totalMarkdown: scan.totalMarkdown,
    migratableCount: scan.files.length,
    skipped: scan.skipped,
    withFrontmatter: records.filter((record) => record.hasFrontmatter).length,
    withoutFrontmatter: records.filter((record) => !record.hasFrontmatter).length,
    suspiciousEncoding,
    records
  }
}
