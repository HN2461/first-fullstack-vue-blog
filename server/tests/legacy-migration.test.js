import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  analyzeLegacyNotes,
  buildLegacyArticleRecord,
  scanLegacyNotes
} from '../src/services/legacyMigration.service.js'

let tempDir = ''

function writeNote(relPath, content) {
  const fullPath = path.join(tempDir, relPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
  return fullPath
}

describe('legacy migration parser', () => {
  afterEach(() => {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true })
      tempDir = ''
    }
  })

  it('builds stable metadata without changing markdown body', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacy-notes-'))
    const fullPath = writeNote('AI工具/01_AI编辑器流/Cursor/第1篇_Cursor上手.md', [
      '---',
      'title: Cursor 上手',
      'date: 2026-04-14',
      'tags:',
      '  - Cursor',
      '  - AI编辑器',
      'description: Cursor 使用笔记',
      '---',
      '# Cursor 上手',
      '',
      '![截图](./images/cursor.png)',
      '',
      '正文保持原样。'
    ].join('\n'))

    const [file] = scanLegacyNotes(tempDir).files
    const record = buildLegacyArticleRecord(file, tempDir)

    expect(file.fullPath).toBe(fullPath)
    expect(record.title).toBe('Cursor 上手')
    expect(record.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    expect(record.slug).toContain('ai')
    expect(record.slug).toMatch(/[a-f0-9]{8}$/)
    expect(record.categoryPath).toEqual(['AI工具', 'AI编辑器流', 'Cursor'])
    expect(record.tags).toEqual(['Cursor', 'AI编辑器'])
    expect(record.summary).toBe('Cursor 使用笔记')
    expect(record.sourcePath).toBe('AI工具/01_AI编辑器流/Cursor/第1篇_Cursor上手.md')
    expect(record.sourceHash).toHaveLength(64)
    expect(record.contentMarkdown).toBe('# Cursor 上手\n\n![截图](./images/cursor.png)\n\n正文保持原样。')
  })

  it('audits skipped navigation files and plain markdown files', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacy-notes-'))
    writeNote('Vue/vue3/第1篇_vue3初相识.md', '# Vue3\n\n正文')
    writeNote('Vue/目录.md', '# 目录')
    writeNote('AI工具/AI工具知识库总导航.md', '# 总导航')

    const audit = analyzeLegacyNotes(tempDir)

    expect(audit.totalMarkdown).toBe(3)
    expect(audit.migratableCount).toBe(2)
    expect(audit.skipped).toEqual([
      expect.objectContaining({
        relPath: 'Vue/目录.md',
        reason: '目录导航文件'
      })
    ])
    expect(audit.withFrontmatter).toBe(0)
    expect(audit.withoutFrontmatter).toBe(2)
  })
})
