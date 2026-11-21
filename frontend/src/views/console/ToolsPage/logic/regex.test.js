import { describe, expect, it } from 'vitest'
import { executeRegex, MAX_REGEX_MATCHES, MAX_REGEX_TEXT_LENGTH, validateRegexInput } from './regex'

describe('正则执行与输入边界', () => {
  it('遵循全局、首次、大小写和捕获组语义', () => {
    const input = { pattern: '(?<letter>a)(b)?', flags: 'gi', text: 'Ab a' }
    expect(executeRegex(input).matches).toEqual([
      { value: 'Ab', index: 0, groups: ['A', 'b'], namedGroups: { letter: 'A' } },
      { value: 'a', index: 3, groups: ['a', undefined], namedGroups: { letter: 'a' } }
    ])
    expect(executeRegex({ ...input, flags: 'i' }).matches).toHaveLength(1)
    expect(executeRegex({ pattern: '.', flags: 'gs', text: 'a\nb' }).matches).toHaveLength(3)
  })
  it('正确推进空匹配和 Unicode 代理对，包括空输入', () => {
    expect(executeRegex({ pattern: '(?:)', flags: 'gu', text: '😀' }).matches.map(({ index }) => index)).toEqual([0, 2])
    expect(executeRegex({ pattern: '', flags: 'g', text: '' }).matches).toHaveLength(1)
    expect(executeRegex({ pattern: '^', flags: 'gm', text: 'a\nb' }).matches.map(({ index }) => index)).toEqual([0, 2])
  })
  it('严格拒绝重复标志、未知标志、u/v冲突、无效表达式与超大文本', () => {
    for (const flags of ['gg', 'z', 'g i', 'uv']) expect(() => validateRegexInput('a', flags, '')).toThrow()
    expect(() => executeRegex({ pattern: '[', flags: 'g', text: '' })).toThrow('表达式无效')
    expect(() => validateRegexInput('a', 'g', 'a'.repeat(MAX_REGEX_TEXT_LENGTH + 1))).toThrow('最多')
  })
  it('匹配数量有硬上限，只在确有后续匹配时标记截断', () => {
    const exact = executeRegex({ pattern: 'a', flags: 'g', text: 'a'.repeat(MAX_REGEX_MATCHES) })
    expect(exact.matches).toHaveLength(MAX_REGEX_MATCHES)
    expect(exact.truncated).toBe(false)
    const more = executeRegex({ pattern: 'a', flags: 'g', text: 'a'.repeat(MAX_REGEX_MATCHES + 1) })
    expect(more.matches).toHaveLength(MAX_REGEX_MATCHES)
    expect(more.truncated).toBe(true)
  })
})
