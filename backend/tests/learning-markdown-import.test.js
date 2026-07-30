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
const offlineArticleRoot = path.join(repositoryRoot, 'output', '未导入线上')
const learningRoots = [
  path.join(offlineArticleRoot, 'MySQL'),
  path.join(offlineArticleRoot, 'Redis')
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

    expect(files.length).toBeGreaterThanOrEqual(40)
    expect(preview.errorCount).toBe(0)
    expect(preview.duplicateCount).toBe(0)
    expect(preview.warningCount).toBe(0)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(preview.items.every((item) => item.canImport)).toBe(true)
    expect(preview.items.every((item) => item.contentMarkdown.startsWith('# '))).toBe(true)
    expect(preview.items.every((item) => item.summary.length <= 300)).toBe(true)
  })
})
