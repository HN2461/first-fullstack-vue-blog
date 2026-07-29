import archiver from 'archiver'
import request from 'supertest'
import { once } from 'node:events'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Media } from '#modules/media/models/Media.js'
import { User } from '#modules/user/models/User.js'
import { createCategory } from '#modules/content/services/category.service.js'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function buildDocxBuffer(text) {
  const archive = archiver('zip', { store: true })
  const chunks = []
  archive.on('data', (chunk) => chunks.push(chunk))
  const ended = once(archive, 'end')

  archive.append(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`, { name: '[Content_Types].xml' })
  archive.append(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`, { name: '_rels/.rels' })
  archive.append(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p><w:sectPr/></w:body>
</w:document>`, { name: 'word/document.xml' })

  await archive.finalize()
  await ended
  return Buffer.concat(chunks)
}

describe('document article import', () => {
  let admin
  let token
  let category

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    admin = await User.create({
      username: 'document-admin',
      email: `document-${Date.now()}@example.com`,
      passwordHash: 'hashed-password',
      role: USER_ROLES.SUPER_ADMIN
    })
    token = signAccessToken(admin)
    category = await createCategory({ name: '文档资料', slug: 'documents' })
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('imports DOCX as a searchable and publishable document article', async () => {
    const app = createApp()
    const docx = await buildDocxBuffer('季度复盘文档包含预算调整和项目交付总结')
    const importResponse = await request(app)
      .post('/api/admin/articles/import/document')
      .set('Authorization', `Bearer ${token}`)
      .field('title', '季度项目复盘')
      .field('category', category.id)
      .field('tags', '[]')
      .attach('file', docx, {
        filename: 'quarter-review.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      .expect(201)

    const imported = importResponse.body.data.article
    expect(imported).toMatchObject({
      title: '季度项目复盘',
      contentMode: 'document',
      status: 'draft'
    })
    expect(imported.document.originalUrl).toMatch(/^\/uploads\//)
    expect(imported.document.conversionStatus).toBe('ready')
    expect(imported.wordCount).toBeGreaterThan(0)
    expect(await Media.countDocuments()).toBeGreaterThanOrEqual(1)

    await request(app)
      .post(`/api/admin/articles/${imported.id}/publish`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const detailResponse = await request(app)
      .get(`/api/public/articles/${imported.slug}`)
      .expect(200)
    expect(detailResponse.body.data.document.originalName).toBe('quarter-review.docx')

    const searchResponse = await request(app)
      .get('/api/public/search')
      .query({ q: '预算调整' })
      .expect(200)
    expect(searchResponse.body.data.items.map((item) => item.slug)).toContain(imported.slug)

    const exportResponse = await request(app)
      .get('/api/admin/articles/export/markdown')
      .query({ scope: 'published' })
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => callback(null, Buffer.concat(chunks)))
      })
      .expect(200)
    const exportText = exportResponse.body.toString('utf8')
    expect(exportText).toContain('metadata.json')
    expect(exportText).toContain('quarter-review.docx')
    expect(exportText).toContain('"contentMode": "document"')

    const stored = await Article.findById(imported.id).lean()
    expect(stored.document.extractedText).toContain('项目交付总结')
  })

  it('rejects legacy DOC files before creating media records', async () => {
    const app = createApp()
    const response = await request(app)
      .post('/api/admin/articles/import/document')
      .set('Authorization', `Bearer ${token}`)
      .field('category', category.id)
      .field('tags', '[]')
      .attach('file', Buffer.from('legacy-doc'), {
        filename: 'legacy.doc',
        contentType: 'application/msword'
      })
      .expect(400)

    expect(response.body.code).toBe('DOCUMENT_FORMAT_UNSUPPORTED')
    expect(await Media.countDocuments()).toBe(0)
  })
})
