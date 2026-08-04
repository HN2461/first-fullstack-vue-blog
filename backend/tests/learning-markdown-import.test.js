import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { previewMarkdownArticleImport } from '#modules/content/services/articleImport.service.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))
const learningRoots = [
  path.join(repositoryRoot, 'output', '线上文章', '后端技术', '数据库', 'MySQL'),
  path.join(repositoryRoot, 'output', '未导入线上', 'Redis')
]

function collectMarkdownFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name)

    if (entry.isDirectory()) {
      return collectMarkdownFiles(target)
    }

    if (!entry.isFile() || !/\.md$/i.test(entry.name)) {
      return []
    }

    const buffer = fs.readFileSync(target)
    return [{
      originalname: entry.name,
      buffer,
      size: buffer.length
    }]
  })
}

describe('database learning markdown import compatibility', () => {
  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('previews every MySQL and Redis article without metadata or slug errors', async () => {
    const files = learningRoots.flatMap(collectMarkdownFiles)
    const preview = await previewMarkdownArticleImport(files)
    const slugs = preview.items.map((item) => item.slug)
    const warnings = preview.items.flatMap((item) => item.warnings || [])

    expect(files.length).toBeGreaterThanOrEqual(20)
    expect(preview.errorCount).toBe(0)
    expect(preview.duplicateCount).toBe(0)
    expect(warnings.every((warning) => /^(分类「.+」不存在|标签不存在：.+)$/.test(warning))).toBe(true)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(preview.items.every((item) => item.canImport)).toBe(true)
    expect(preview.items.every((item) => item.contentMarkdown.startsWith('# '))).toBe(true)
    expect(preview.items.every((item) => item.summary.length <= 300)).toBe(true)
  })
})
