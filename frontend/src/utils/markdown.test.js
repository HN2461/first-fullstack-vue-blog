import { describe, expect, it } from 'vitest'
import { extractTOC, renderMarkdown } from './markdown'
import { getCodeLanguageLabel, normalizeCodeLanguage } from './markdownCodeBlocks'

describe('markdown rendering', () => {
  it('renders heading anchors, toc entries and enhanced code block chrome', () => {
    const content = [
      '# 标题',
      '',
      '## 安装步骤',
      '',
      '```js',
      "console.log('hi')",
      "console.log('there')",
      '```',
      '',
      '```vue',
      '<template><div>{{ msg }}</div></template>',
      "<script setup>const msg = 'ok'</script>",
      '```',
      '',
      '```mermaid',
      'graph TD',
      '  A-->B',
      '```'
    ].join('\n')

    const html = renderMarkdown(content)

    expect(extractTOC(content)).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: 2, text: '安装步骤', slug: '安装步骤' })
    ]))
    expect(html).toContain('id="安装步骤"')
    expect(html).toContain('code-block__language">JavaScript')
    expect(html).toContain('共 2 行')
    expect(html).toContain('code-block__gutter')
    expect(html).toContain('code-block__language">Vue')
    expect(html).toContain('mermaid-diagram')
  })

  it('strips embedded toc markers from rendered article content', () => {
    const html = renderMarkdown([
      '# 标题',
      '',
      '[[toc]]',
      '',
      '## 正文'
    ].join('\n'))

    expect(html).not.toContain('[[toc]]')
    expect(html).not.toContain('table-of-contents')
    expect(extractTOC('[[toc]]\n\n## 正文')).toEqual([
      expect.objectContaining({ text: '正文', slug: '正文' })
    ])
  })

  it('normalizes common legacy fence language aliases', () => {
    expect(normalizeCodeLanguage('c++ {1,3}')).toBe('cpp')
    expect(normalizeCodeLanguage('c#')).toBe('csharp')
    expect(normalizeCodeLanguage('shell-session')).toBe('bash')
    expect(normalizeCodeLanguage('cmd')).toBe('dos')
    expect(normalizeCodeLanguage('docker-compose')).toBe('yaml')
    expect(normalizeCodeLanguage('.env')).toBe('properties')
    expect(getCodeLanguageLabel('cpp')).toBe('C++')
    expect(getCodeLanguageLabel('dos')).toBe('Batch')
  })

  it('renders additional infrastructure code block languages', () => {
    const html = renderMarkdown([
      '```nginx',
      'server { listen 80; }',
      '```',
      '',
      '```dockerfile',
      'FROM node:20',
      '```',
      '',
      '```cmd',
      'dir',
      '```'
    ].join('\n'))

    expect(html).toContain('code-block__language">Nginx')
    expect(html).toContain('language-nginx')
    expect(html).toContain('code-block__language">Dockerfile')
    expect(html).toContain('language-dockerfile')
    expect(html).toContain('code-block__language">Batch')
    expect(html).toContain('language-dos')
  })
})
