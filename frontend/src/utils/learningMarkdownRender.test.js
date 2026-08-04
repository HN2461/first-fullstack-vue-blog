import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url))
const learningRoots = [
  path.join(repositoryRoot, 'output', '线上文章', '后端技术', '数据库', 'MySQL'),
  path.join(repositoryRoot, 'output', '未导入线上', 'Redis')
]

function collectMarkdownPaths(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name)

    if (entry.isDirectory()) {
      return collectMarkdownPaths(target)
    }

    return entry.isFile() && /\.md$/i.test(entry.name) ? [target] : []
  })
}

function stripFrontMatter(content) {
  return String(content).replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)+/, '')
}

describe('database learning markdown rendering', () => {
  it('renders every MySQL and Redis article as standalone online content', () => {
    const files = learningRoots.flatMap(collectMarkdownPaths)

    expect(files.length).toBeGreaterThanOrEqual(20)

    files.forEach((file) => {
      const content = stripFrontMatter(fs.readFileSync(file, 'utf8'))
      const html = renderMarkdown(content)

      expect(content, file).toMatch(/^#\s+.+/)
      expect(html, file).toContain('<h1')
      expect(html, file).not.toMatch(/href="(?:\.\.?\/|[^"#]*\.(?:md|sql|redis|js))(?:[#"])/i)
      expect(html, file).not.toContain('undefined')
    })
  })
})

