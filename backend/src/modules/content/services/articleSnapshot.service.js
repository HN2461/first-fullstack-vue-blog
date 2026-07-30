import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const NAVIGATION_NAMES = new Set(['readme.md', 'index.md', '目录.md'])
const REPOSITORY_CATEGORY_ALIASES = Object.freeze([
  {
    repositoryPrefix: ['AI工具'],
    onlinePrefix: ['AI相关', 'AI工具']
  }
])

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/')
}

function contentHash(value) {
  return crypto.createHash('sha256').update(String(value || '').trim()).digest('hex')
}

function normalizeComparableText(value) {
  return String(value || '')
    .replace(/\s+/g, '')
    .replace(/[\p{P}\p{S}]/gu, '')
}

function buildShingles(value, size = 7) {
  const text = normalizeComparableText(value)
  const shingles = new Set()
  for (let index = 0; index <= text.length - size; index += 1) {
    shingles.add(text.slice(index, index + size))
  }
  return shingles
}

function calculateContentSimilarity(left, right) {
  const leftSet = buildShingles(left)
  const rightSet = buildShingles(right)
  if (leftSet.size === 0 && rightSet.size === 0) return 1
  const smaller = leftSet.size < rightSet.size ? leftSet : rightSet
  const larger = leftSet.size < rightSet.size ? rightSet : leftSet
  let matches = 0
  smaller.forEach((value) => {
    if (larger.has(value)) matches += 1
  })
  return Number((2 * matches / (leftSet.size + rightSet.size)).toFixed(3))
}

function addLookup(map, key, item) {
  if (!key) return
  if (!map.has(key)) map.set(key, [])
  map.get(key).push(item)
}

function readMarkdown(fullPath) {
  const raw = fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, '')
  const parsed = matter(raw)
  return {
    raw,
    data: parsed.data || {},
    contentMarkdown: String(parsed.content || '').trim()
  }
}

function findDocumentFile(metadataPath, metadata) {
  const directory = path.dirname(metadataPath)
  const files = fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== 'metadata.json')
  const exact = files.find((entry) => entry.name === metadata.originalName)
  const docx = exact || files.find((entry) => path.extname(entry.name).toLowerCase() === '.docx')
  if (!docx) {
    throw new Error(`文档型文章缺少 DOCX 原件: ${normalizePath(metadataPath)}`)
  }
  return path.join(directory, docx.name)
}

export function readArticleExportSnapshot(exportRoot) {
  const manifestPath = path.join(exportRoot, 'manifest.json')
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`找不到文章导出清单: ${manifestPath}`)
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''))
  if (!Array.isArray(manifest.articles) || manifest.total !== manifest.articles.length) {
    throw new Error('manifest.json 的文章数量与 articles 清单不一致')
  }

  const seenIds = new Set()
  const seenSlugs = new Set()
  const records = manifest.articles.map((item) => {
    if (seenIds.has(item.originalId)) throw new Error(`导出清单存在重复 originalId: ${item.originalId}`)
    if (seenSlugs.has(item.originalSlug)) throw new Error(`导出清单存在重复 originalSlug: ${item.originalSlug}`)
    seenIds.add(item.originalId)
    seenSlugs.add(item.originalSlug)

    const fullPath = path.join(exportRoot, ...normalizePath(item.fileName).split('/'))
    if (!fs.existsSync(fullPath)) {
      throw new Error(`导出文件不存在: ${normalizePath(item.fileName)}`)
    }

    if (item.contentMode === 'document') {
      const metadata = JSON.parse(fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, ''))
      if (metadata.originalId !== item.originalId || metadata.originalSlug !== item.originalSlug) {
        throw new Error(`文档元数据与 manifest 不一致: ${normalizePath(item.fileName)}`)
      }
      return {
        ...item,
        metadata,
        sourceFile: findDocumentFile(fullPath, metadata)
      }
    }

    const markdown = readMarkdown(fullPath)
    if (markdown.data.originalId !== item.originalId || markdown.data.originalSlug !== item.originalSlug) {
      throw new Error(`Markdown Front Matter 与 manifest 不一致: ${normalizePath(item.fileName)}`)
    }
    return {
      ...item,
      ...markdown,
      bodyHash: contentHash(markdown.contentMarkdown),
      sourceFile: fullPath
    }
  })

  return { manifest, records }
}

function walkMarkdown(rootDir, excludedRoot, currentDir = rootDir, result = []) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const fullPath = path.join(currentDir, entry.name)
    if (excludedRoot && fullPath.startsWith(excludedRoot)) continue
    if (entry.isDirectory()) {
      walkMarkdown(rootDir, excludedRoot, fullPath, result)
    } else if (
      /\.md$/i.test(entry.name) &&
      !NAVIGATION_NAMES.has(entry.name.toLowerCase()) &&
      !/^article-sync-analysis-\d{8}\.md$/i.test(entry.name)
    ) {
      result.push(fullPath)
    }
  }
  return result
}

function readRepositoryArticle(fullPath, repositoryRoot) {
  const markdown = readMarkdown(fullPath)
  const firstHeading = markdown.contentMarkdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || ''
  const slug = String(markdown.data.originalSlug || markdown.data.slug || '')
    .trim()
    .replace(/-revision-\d{8}$/i, '')
  return {
    repositoryPath: normalizePath(path.relative(repositoryRoot, fullPath)),
    repositoryCategoryPath: normalizePath(path.dirname(path.relative(repositoryRoot, fullPath)))
      .split('/')
      .filter((item) => item && item !== '.'),
    title: String(markdown.data.title || firstHeading || '').trim(),
    slug,
    originalId: String(markdown.data.originalId || '').trim(),
    originalSlug: String(markdown.data.originalSlug || '').trim(),
    exportedAt: String(markdown.data.exportedAt || '').trim(),
    frontMatterCategory: String(markdown.data.category || '').trim(),
    bodyHash: contentHash(markdown.contentMarkdown),
    contentMarkdown: markdown.contentMarkdown
  }
}

function mapOnlineCategoryToRepository(categoryPath) {
  const alias = REPOSITORY_CATEGORY_ALIASES.find((item) => {
    return item.onlinePrefix.every((segment, index) => categoryPath[index] === segment)
  })
  if (!alias) return categoryPath
  return [...alias.repositoryPrefix, ...categoryPath.slice(alias.onlinePrefix.length)]
}

function uniqueMatch(candidates) {
  return candidates?.length === 1 ? candidates[0] : null
}

export function analyzeArticleRepository(snapshot, repositoryRoot, exportRoot) {
  const onlineMarkdown = snapshot.records.filter((item) => item.contentMode === 'markdown')
  const bySlug = new Map()
  const byTitle = new Map()
  const byHash = new Map()
  onlineMarkdown.forEach((item) => {
    addLookup(bySlug, item.originalSlug, item)
    addLookup(byTitle, item.title, item)
    addLookup(byHash, item.bodyHash, item)
  })

  const repositoryArticles = walkMarkdown(repositoryRoot, exportRoot)
    .map((file) => readRepositoryArticle(file, repositoryRoot))
  const matchedOnlineIds = new Set()
  const matched = []
  const repositoryOnly = []

  for (const item of repositoryArticles) {
    let online = uniqueMatch(bySlug.get(item.slug))
    let matchMethod = online ? 'slug' : ''
    if (!online) {
      online = uniqueMatch(byHash.get(item.bodyHash))
      matchMethod = online ? 'content' : ''
    }
    if (!online && item.title) {
      online = uniqueMatch(byTitle.get(item.title))
      matchMethod = online ? 'title' : ''
    }
    if (!online) {
      const { contentMarkdown, ...repositoryItem } = item
      repositoryOnly.push({
        ...repositoryItem,
        originStatus: item.originalId || item.originalSlug || item.exportedAt
          ? 'previous-export'
          : 'local-new'
      })
      continue
    }

    matchedOnlineIds.add(online.originalId)
    const onlineCategoryPath = online.categoryPath || []
    const repositoryCategoryPath = mapOnlineCategoryToRepository(onlineCategoryPath)
    const sameDirectory = item.repositoryCategoryPath.join('/') === repositoryCategoryPath.join('/')
    const sameFrontMatterCategory = !item.frontMatterCategory ||
      item.frontMatterCategory === String(onlineCategoryPath.at(-1) || '')
    const contentStatus = item.bodyHash === online.bodyHash ? 'same' : 'locally-modified'
    const localLength = normalizeComparableText(item.contentMarkdown).length
    const onlineLength = normalizeComparableText(online.contentMarkdown).length
    const { contentMarkdown, ...repositoryItem } = item
    matched.push({
      ...repositoryItem,
      originalId: online.originalId,
      originalSlug: online.originalSlug,
      onlineTitle: online.title,
      onlineFile: normalizePath(online.fileName),
      onlineCategoryPath,
      expectedRepositoryCategoryPath: repositoryCategoryPath,
      matchMethod,
      contentStatus,
      contentSimilarity: contentStatus === 'same'
        ? 1
        : calculateContentSimilarity(contentMarkdown, online.contentMarkdown),
      lengthRatio: Number((localLength / Math.max(1, onlineLength)).toFixed(2)),
      categoryStatus: sameDirectory && sameFrontMatterCategory ? 'same' : 'update-recommended'
    })
  }

  const onlineOnly = snapshot.records
    .filter((item) => !matchedOnlineIds.has(item.originalId))
    .map((item) => ({
      originalId: item.originalId,
      originalSlug: item.originalSlug,
      title: item.title,
      contentMode: item.contentMode,
      categoryPath: item.categoryPath,
      onlineFile: normalizePath(item.fileName)
    }))
  const matchedByOnlineId = new Map()
  matched.forEach((item) => addLookup(matchedByOnlineId, item.originalId, item))
  const duplicateRepositoryMatches = [...matchedByOnlineId.values()]
    .filter((items) => items.length > 1)
    .map((items) => ({
      originalId: items[0].originalId,
      originalSlug: items[0].originalSlug,
      onlineTitle: items[0].onlineTitle,
      repositoryFiles: items.map((item) => item.repositoryPath)
    }))
  const locallyModified = matched.filter((item) => item.contentStatus === 'locally-modified')

  return {
    generatedAt: new Date().toISOString(),
    export: {
      exportedAt: snapshot.manifest.exportedAt,
      total: snapshot.manifest.total
    },
    repositoryCategoryAliases: REPOSITORY_CATEGORY_ALIASES,
    summary: {
      repositoryMarkdown: repositoryArticles.length,
      matched: matched.length,
      uniqueOnlineMatched: matchedOnlineIds.size,
      duplicateRepositoryFiles: duplicateRepositoryMatches.reduce((sum, item) => sum + item.repositoryFiles.length - 1, 0),
      sameContent: matched.filter((item) => item.contentStatus === 'same').length,
      locallyModified: locallyModified.length,
      majorRefactor: locallyModified.filter((item) => item.contentSimilarity < 0.5).length,
      mediumRefactor: locallyModified.filter((item) => item.contentSimilarity >= 0.5 && item.contentSimilarity < 0.8).length,
      closeRevision: locallyModified.filter((item) => item.contentSimilarity >= 0.8).length,
      categoryUpdateRecommended: matched.filter((item) => item.categoryStatus === 'update-recommended').length,
      repositoryOnly: repositoryOnly.length,
      previousExportOnly: repositoryOnly.filter((item) => item.originStatus === 'previous-export').length,
      localNew: repositoryOnly.filter((item) => item.originStatus === 'local-new').length,
      onlineOnly: onlineOnly.length
    },
    matched,
    duplicateRepositoryMatches,
    repositoryOnly,
    onlineOnly
  }
}

function markdownTableRows(items, mapper, limit = 200) {
  return items.slice(0, limit).map(mapper)
}

export function buildRepositoryAnalysisMarkdown(report) {
  const modified = report.matched.filter((item) => item.contentStatus === 'locally-modified')
  const categoryUpdates = report.matched.filter((item) => item.categoryStatus === 'update-recommended')
  const lines = [
    '# 文章快照与 output 仓库对比报告',
    '',
    `- 生成时间：${report.generatedAt}`,
    `- 线上导出时间：${report.export.exportedAt}`,
    `- 线上文章：${report.export.total} 篇`,
    `- output 可识别正文：${report.summary.repositoryMarkdown} 篇`,
    `- 与线上匹配：${report.summary.matched} 篇`,
    `- 匹配到的唯一线上文章：${report.summary.uniqueOnlineMatched} 篇`,
    `- 仓库重复来源文件：${report.summary.duplicateRepositoryFiles} 篇`,
    `- 本地正文有修改：${report.summary.locallyModified} 篇`,
    `- 接近重写（相似度低于 50%）：${report.summary.majorRefactor} 篇`,
    `- 中等调整（相似度 50%–80%）：${report.summary.mediumRefactor} 篇`,
    `- 轻量增补（相似度不低于 80%）：${report.summary.closeRevision} 篇`,
    `- 建议按线上分类调整：${report.summary.categoryUpdateRecommended} 篇`,
    `- 仅在 output：${report.summary.repositoryOnly} 篇`,
    `- 以前导出但当前线上未匹配：${report.summary.previousExportOnly} 篇`,
    `- 本地真正新增：${report.summary.localNew} 篇`,
    `- 仅在线上：${report.summary.onlineOnly} 篇`,
    '',
    '## 本地修改过的线上文章',
    '',
    '| output 文件 | 相似度 | 长度比例 | 线上分类 |',
    '| --- | ---: | ---: | --- |',
    ...markdownTableRows(modified, (item) => `| ${item.repositoryPath} | ${(item.contentSimilarity * 100).toFixed(1)}% | ${(item.lengthRatio * 100).toFixed(0)}% | ${item.onlineCategoryPath.join(' / ') || '未分类'} |`),
    '',
    '## output 新增、线上未匹配文章',
    '',
    '| output 文件 | 来源判断 | Front Matter 分类 |',
    '| --- | --- | --- |',
    ...markdownTableRows(report.repositoryOnly, (item) => `| ${item.repositoryPath} | ${item.originStatus === 'previous-export' ? '以前线上导出' : '本地新增'} | ${item.frontMatterCategory || '未填写'} |`),
    '',
    '## 仓库重复来源文件',
    '',
    ...report.duplicateRepositoryMatches.flatMap((item) => [
      `### ${item.onlineTitle}`,
      '',
      ...item.repositoryFiles.map((file) => `- ${file}`),
      ''
    ]),
    '## 建议更新分类的已匹配文章',
    '',
    '| output 文件 | 线上分类 |',
    '| --- | --- |',
    ...markdownTableRows(categoryUpdates, (item) => `| ${item.repositoryPath} | ${item.onlineCategoryPath.join(' / ') || '未分类'} |`),
    '',
    '> 完整明细请查看同名 JSON 文件；Markdown 表格每组最多展示 200 条。',
    ''
  ]
  return lines.join('\n')
}
