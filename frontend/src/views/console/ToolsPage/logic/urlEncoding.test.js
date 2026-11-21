import { describe, expect, it } from 'vitest'
import { convertUrlEncoding } from './urlEncoding'
import { MAX_TOOL_TEXT_LENGTH } from './textLimits'

describe('URL 编解码范围', () => {
  it('在主线程转换前拒绝超过 1 Mi 字符的输入', () => {
    expect(() => convertUrlEncoding('a'.repeat(MAX_TOOL_TEXT_LENGTH + 1), 'encode')).toThrow('1,048,576')
    expect(() => convertUrlEncoding('a'.repeat(MAX_TOOL_TEXT_LENGTH + 1), 'decode')).toThrow('1,048,576')
  })
  it('区分完整 URI 结构与 URI 组件', () => {
    const source = 'https://example.com/中文?q=a&b=1'
    expect(convertUrlEncoding(source, 'encode', 'uri')).toBe('https://example.com/%E4%B8%AD%E6%96%87?q=a&b=1')
    expect(convertUrlEncoding('/a?b=c&d=1', 'encode')).toBe('%2Fa%3Fb%3Dc%26d%3D1')
    expect(convertUrlEncoding('%2F%3F%26%3D', 'decode', 'uri')).toBe('%2F%3F%26%3D')
    expect(convertUrlEncoding('%2F%3F%26%3D', 'decode', 'component')).toBe('/?&=')
  })
  it('不混淆加号、空格和表单编码', () => {
    expect(convertUrlEncoding('a+b c', 'encode')).toBe('a%2Bb%20c')
    expect(convertUrlEncoding('a+b%20c', 'decode')).toBe('a+b c')
    expect(convertUrlEncoding(convertUrlEncoding('😀 中文 + %', 'encode'), 'decode')).toBe('😀 中文 + %')
  })
  it.each(['%', '%2', '%ZZ', '%C0%AF', '%ED%A0%80', '%E4%B8'])('拒绝不完整或非法 UTF-8 转义 %s', (source) => {
    expect(() => convertUrlEncoding(source, 'decode')).toThrow('解码失败')
  })
  it('拒绝孤立 Unicode 代理项以及未知模式', () => {
    expect(() => convertUrlEncoding('\ud800', 'encode')).toThrow('代理项')
    expect(() => convertUrlEncoding('a', 'other')).toThrow('模式')
    expect(convertUrlEncoding('', 'decode')).toBe('')
  })
})
