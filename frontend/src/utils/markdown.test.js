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

  it('removes embedded HTML formatting tags from toc labels and keeps anchor slugs aligned', () => {
    const content = [
      '# <font style="color:rgb(38,38,38);">一、TypeScript 简介</font>',
      '',
      '## <font style="color:rgb(38,38,38);">1️⃣</font><font style="color:rgb(38,38,38);">今非昔比的 JavaScript</font>'
    ].join('\n')

    const toc = extractTOC(content)
    const html = renderMarkdown(content)

    expect(toc).toEqual([
      { level: 1, text: '一、TypeScript 简介', slug: '一typescript-简介' },
      { level: 2, text: '1️⃣今非昔比的 JavaScript', slug: '1今非昔比的-javascript' }
    ])
    expect(html).toContain('id="一typescript-简介"')
    expect(html).toContain('id="1今非昔比的-javascript"')
  })

  it('removes Yuque font wrappers from inline code while preserving code text', () => {
    const html = renderMarkdown([
      '> 联合类型中的 `<font style="color:rgb(38,38,38);"> | </font>` 管道符。',
      '',
      '`abstract class 类名 { <font style="background-color:#FBDE28;">abstract 抽象方法</font> }`',
      '',
      '`**<u>语雀强调文本</u>**`',
      '',
      '字面量标签 `<u>` 应保留。'
    ].join('\n'))

    expect(html).toContain('<code> | </code>')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<code>abstract class 类名 { abstract 抽象方法 }</code>')
    expect(html).toContain('<code>**语雀强调文本**</code>')
    expect(html).toContain('字面量标签 <code>&lt;u&gt;</code> 应保留。')
    expect(html).not.toContain('<code> &lt;font')
    expect(html).not.toContain('abstract 抽象方法&lt;/font&gt;')
  })

  it('renders Yuque info, tips and legacy color containers as formatted callouts', () => {
    const html = renderMarkdown([
      ':::info',
      '浏览器不能直接运行 **TypeScript** 代码。',
      ':::',
      '',
      ':::tips',
      '- 先编译为 JavaScript。',
      '- 再交给浏览器执行。',
      ':::',
      '',
      ':::color4 额外提示',
      '注意保留文档正文。',
      ':::'
    ].join('\n'))

    expect(html).toContain('class="markdown-container markdown-container--info"')
    expect(html).toContain('class="markdown-container markdown-container--tips"')
    expect(html).toContain('class="markdown-container markdown-container--color4"')
    expect(html).toContain('<strong>TypeScript</strong>')
    expect(html).toContain('<ul>')
    expect(html).toContain('<p class="markdown-container__title">额外提示</p>')
    expect(html).not.toContain(':::info')
    expect(html).not.toContain(':::tips')
    expect(html).not.toContain(':::color4')
  })

  it('keeps nested containers and fenced colon markers intact', () => {
    const html = renderMarkdown([
      ':::warning 外层提醒',
      '外层文字。',
      '',
      ':::info',
      '内层说明。',
      ':::',
      '',
      '```text',
      ':::info',
      '```',
      ':::'
    ].join('\n'))

    expect(html).toContain('markdown-container--warning')
    expect(html).toContain('markdown-container--info')
    expect(html).toContain('class="code-block__code language-text">:::info')
    expect(html).not.toContain('<p>:::warning')
  })

  it('keeps duplicate heading anchors aligned with markdown-it-anchor', () => {
    const content = [
      '## 规范回答（可直接复述）',
      '',
      '### 先说结论',
      '',
      '## 规范回答（可直接复述）',
      '',
      '### 先说结论',
      '',
      '## 规范回答（可直接复述）-1'
    ].join('\n')

    const toc = extractTOC(content)
    const html = renderMarkdown(content)

    expect(toc.map((item) => item.slug)).toEqual([
      '规范回答可直接复述',
      '先说结论',
      '规范回答可直接复述-1',
      '先说结论-1',
      '规范回答可直接复述-1-1'
    ])
    expect(html.match(/<h[1-6][^>]*id="[^"]+"/g)).toEqual([
      '<h2 id="规范回答可直接复述"',
      '<h3 id="先说结论"',
      '<h2 id="规范回答可直接复述-1"',
      '<h3 id="先说结论-1"',
      '<h2 id="规范回答可直接复述-1-1"'
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

  it('removes executable html while keeping safe legacy formatting', () => {
    const html = renderMarkdown([
      '<meta http-equiv="refresh" content="1;url=https://www.jd.com/" />',
      '<script>window.location.href = "https://www.jd.com/"</script>',
      '<iframe src="https://www.jd.com/"></iframe>',
      '<font style="color:#FF0000;" onclick="location.href=\'https://www.jd.com/\'">红色重点</font>',
      '<a href="javascript:location.href=\'https://www.jd.com/\'">危险链接</a>',
      '<a href="https://www.jd.com/">普通链接</a>'
    ].join('\n'))

    expect(html).not.toContain('http-equiv')
    expect(html).not.toContain('<meta')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('onclick')
    expect(html).not.toContain('javascript:')
    expect(html).toContain('<font style="color:#FF0000;">红色重点</font>')
    expect(html).toContain('href="https://www.jd.com/"')
  })

  it('omits the referrer for external images protected by referer ACL', () => {
    const html = renderMarkdown('![语雀截图](https://cdn.nlark.com/yuque/example.png)')

    expect(html).toContain('src="https://cdn.nlark.com/yuque/example.png"')
    expect(html).toContain('referrerpolicy="no-referrer"')
  })
})
