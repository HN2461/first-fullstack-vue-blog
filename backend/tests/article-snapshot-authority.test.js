import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { readArticleExportSnapshot } from '#modules/content/services/articleSnapshot.service.js'

const fixtureRoot = path.resolve('tests/.tmp/article-snapshot-authority')

afterEach(() => {
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
})

describe('article snapshot authority fields', () => {
  it('uses editable Front Matter while preserving manifest identity', () => {
    fs.mkdirSync(path.join(fixtureRoot, 'AI相关', 'AI工具'), { recursive: true })
    const article = {
      originalId: '6a6b691f4bf50146e9b95e6c',
      originalSlug: 'stable-slug',
      title: '旧标题',
      contentMode: 'markdown',
      status: 'draft',
      categoryPath: ['旧分类'],
      tags: ['旧标签'],
      sortOrder: 90,
      fileName: 'AI相关/AI工具/文章.md'
    }
    fs.writeFileSync(path.join(fixtureRoot, 'manifest.json'), JSON.stringify({
      formatVersion: 3,
      exportedAt: '2026-07-30T00:00:00.000Z',
      total: 1,
      articles: [article]
    }), 'utf8')
    fs.writeFileSync(path.join(fixtureRoot, ...article.fileName.split('/')), `---
title: "新标题"
status: "published"
categoryPath:
  - "AI相关"
  - "AI工具"
tags:
  - "Codex"
sortOrder: 20
originalId: "${article.originalId}"
originalSlug: "${article.originalSlug}"
publishedAt: "2026-07-30T01:00:00.000Z"
updatedAt: "2026-07-30T02:00:00.000Z"
---
# 新标题
`, 'utf8')

    const snapshot = readArticleExportSnapshot(fixtureRoot)
    expect(snapshot.records[0]).toMatchObject({
      originalId: article.originalId,
      originalSlug: article.originalSlug,
      title: '新标题',
      status: 'published',
      categoryPath: ['AI相关', 'AI工具'],
      tags: ['Codex'],
      sortOrder: 20,
      publishedAt: '2026-07-30T01:00:00.000Z',
      updatedAt: '2026-07-30T02:00:00.000Z'
    })
  })
})
