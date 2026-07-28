import { PassThrough } from 'node:stream'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ARTICLE_STATUS, USER_ROLES } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import '#modules/content/models/Tag.js'
import { exportArticlesAsMarkdownZip } from '#modules/content/services/articleExport.service.js'
import { User } from '#modules/user/models/User.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function collectExportBuffer(exportJob) {
  const output = new PassThrough()
  const chunks = []
  output.on('data', (chunk) => chunks.push(chunk))
  await exportJob.writeTo(output)
  return Buffer.concat(chunks)
}

describe('article full markdown export', () => {
  let admin

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    admin = await User.create({
      username: 'export-admin',
      email: 'export-admin@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.SUPER_ADMIN
    })
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('exports every matching article when the result exceeds 200 records', async () => {
    const now = new Date()
    const articles = Array.from({ length: 205 }, (_, index) => {
      const sequence = String(index + 1).padStart(3, '0')
      return {
        title: `全量导出文章-${sequence}`,
        slug: `full-export-article-${sequence}`,
        summary: `第 ${sequence} 篇文章`,
        contentMarkdown: `# 全量导出文章-${sequence}\n\n正文。`,
        status: index % 3 === 0
          ? ARTICLE_STATUS.DRAFT
          : index % 3 === 1
            ? ARTICLE_STATUS.PUBLISHED
            : ARTICLE_STATUS.ARCHIVED,
        createdBy: admin._id,
        updatedBy: admin._id,
        publishedAt: now
      }
    })
    await Article.insertMany(articles)

    const exportJob = await exportArticlesAsMarkdownZip({
      scope: 'all',
      slugStrategy: 'keep'
    })
    const zipBuffer = await collectExportBuffer(exportJob)
    const zipText = zipBuffer.toString('utf8')

    expect(exportJob.total).toBe(205)
    expect(zipText).toContain('全量导出文章-001.md')
    expect(zipText).toContain('全量导出文章-205.md')
    expect(zipText).toContain('"total": 205')
    expect(zipText).toContain('manifest.json')
    expect(zipText).toContain('README.md')
  })
})
