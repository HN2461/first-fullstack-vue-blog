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
    writeNote('网络/编码说明.md', '# 编码说明\n\n这里说明乱码产生的原因，但正文本身不是乱码。')
    writeNote('我的总结/JS/辅助资料/10_字符串.md', '# 字符串\n\n`toWellFormed()` 会把孤立代理项替换成 `U+FFFD`，也就是 `�`。')
    writeNote('Vue/目录.md', '# 目录')
    writeNote('AI工具/AI工具知识库总导航.md', '# 总导航')

    const audit = analyzeLegacyNotes(tempDir)

    expect(audit.totalMarkdown).toBe(5)
    expect(audit.migratableCount).toBe(4)
    expect(audit.skipped).toEqual([
      expect.objectContaining({
        relPath: 'Vue/目录.md',
        reason: '目录导航文件'
      })
    ])
    expect(audit.withFrontmatter).toBe(0)
    expect(audit.withoutFrontmatter).toBe(4)
    expect(audit.suspiciousEncoding).toEqual([])
  })

  it('repairs documented corrupt replacement characters during migration', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacy-notes-'))
    writeNote('项目复用技术/WebSocket/09-WebSocket与AI流式传输深度解析_SSE对比_实现方案与最佳实践.md', [
      '# WebSocket 与 AI 流式传输',
      '',
      'AI生成的token可能���序到达（极少情况），解决方案：',
      '',
      'AI流式传输��「首字节时间」（TTFB）很重要：'
    ].join('\n'))

    const [file] = scanLegacyNotes(tempDir).files
    const record = buildLegacyArticleRecord(file, tempDir)

    expect(record.contentMarkdown).toContain('AI生成的token可能乱序到达')
    expect(record.contentMarkdown).toContain('AI流式传输的「首字节时间」')
    expect(record.contentMarkdown).not.toContain('���')
    expect(record.contentMarkdown).not.toContain('��「')
  })
})
