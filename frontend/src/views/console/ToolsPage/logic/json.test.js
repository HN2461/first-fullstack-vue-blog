import { describe, expect, it } from 'vitest'
import { MAX_JSON_LENGTH, processJson } from './json'

describe('JSON developer tool', () => {
  it('formats and minifies without rounding identifiers, decimals, exponents or negative zero', () => {
    const input = '{"id":9007199254740993,"decimal":0.123456789012345678901,"exp":1E+999,"zero":-0}'
    const pretty = processJson({ input }).output
    for (const literal of ['9007199254740993', '0.123456789012345678901', '1E+999', '-0']) expect(pretty).toContain(literal)
    expect(processJson({ input: pretty, operation: 'minify' }).output).toBe(input)
  })

  it.each(['null', 'true', 'false', '0', '"你好😀"', '[]', '{}'])('accepts a valid primitive or container %s', (input) => {
    expect(processJson({ input, operation: 'validate' }).output).toBe(input)
  })

  it.each(['{"x":1,}', '{/*comment*/"x":1}', '[1,]', 'undefined', 'NaN', 'Infinity', '01', '{x:1}', '{} {}', '"line\nline"'])('rejects nonstandard JSON %s', (input) => {
    expect(() => processJson({ input })).toThrow()
  })

  it('identifies the line and column while preserving the source', () => {
    const input = '{\n  "name":\n}'
    try { processJson({ input }) } catch (error) {
      expect(error.line).toBe(3)
      expect(error.column).toBe(1)
      expect(error.message).toContain('第 3 行')
    }
    expect(input).toBe('{\n  "name":\n}')
  })

  it('sorts object keys recursively while preserving array order and number text', () => {
    const output = processJson({ input: '{"z":[{"b":2,"a":9007199254740993}],"a":-0}', operation: 'sort' }).output
    expect(output.indexOf('"a"')).toBeLessThan(output.indexOf('"z"'))
    expect(output).toContain('"a": 9007199254740993')
    expect(output).toContain('"a": -0')
  })

  it('allows sorting just the root object', () => {
    const output = processJson({ input: '{"z":{"z":1,"a":2},"a":0}', operation: 'sort', recursive: false }).output
    expect(output.indexOf('"a": 0')).toBeLessThan(output.indexOf('"z": {'))
    expect(output.indexOf('"z": 1')).toBeLessThan(output.indexOf('"a": 2'))
  })

  it('warns about duplicate decoded keys and never silently deletes them', () => {
    const result = processJson({ input: '{"a":1,"\\u0061":2}' })
    expect(result.stats.duplicateKeys).toBe(1)
    expect(result.message).toContain('重复键')
    expect(result.output).toContain('"a": 1')
    expect(result.output).toContain('"\\u0061": 2')
  })

  it('supports tab and four-space indentation', () => {
    expect(processJson({ input: '{"a":1}', indent: 'tab' }).output).toContain('\n\t"a"')
    expect(processJson({ input: '{"a":1}', indent: '4' }).output).toContain('\n    "a"')
  })

  it('escapes and unescapes arbitrary string content reversibly', () => {
    const input = 'line\n"你好😀"\\path'
    const escaped = processJson({ input, operation: 'escape' }).output
    expect(processJson({ input: escaped, operation: 'unescape' }).output).toBe(input)
    expect(() => processJson({ input: '{}', operation: 'unescape' })).toThrow('JSON 字符串')
  })

  it('converts Unicode in strings without touching numeric lexemes', () => {
    const input = '{"字":"你好😀","id":9007199254740993}'
    const encoded = processJson({ input, operation: 'unicode-encode' }).output
    expect(encoded).toContain('\\u5b57')
    expect(encoded).toContain('\\ud83d\\ude00')
    const decoded = processJson({ input: encoded, operation: 'unicode-decode' }).output
    expect(decoded).toContain('你好😀')
    expect(decoded).toContain('9007199254740993')
  })

  it('implements JSON Pointer escaping, empty keys, arrays and URI fragments', () => {
    const input = '{"a/b":{"~key":[9007199254740993]},"":false,"字":"好"}'
    expect(processJson({ input, operation: 'extract', pointer: '/a~1b/~0key/0' }).output).toBe('9007199254740993')
    expect(processJson({ input, operation: 'extract', pointer: '/' }).output).toBe('false')
    expect(processJson({ input, operation: 'extract', pointer: '#/%E5%AD%97' }).output).toBe('"好"')
    expect(processJson({ input, operation: 'extract', pointer: '' }).stats.properties).toBe(4)
  })

  it.each(['/a/01', '/a/-', '/a/99', '/a~2', 'a', '#/%zz'])('rejects invalid or absent Pointer %s', (pointer) => {
    expect(() => processJson({ input: '{"a":[1]}', operation: 'extract', pointer })).toThrow()
  })

  it('refuses ambiguous duplicate-key Pointer and treats prototype names as JSON keys', () => {
    expect(() => processJson({ input: '{"a":1,"a":2}', operation: 'extract', pointer: '/a' })).toThrow('重复')
    expect(processJson({ input: '{"__proto__":{"polluted":1}}', operation: 'extract', pointer: '/__proto__/polluted' }).output).toBe('1')
    expect({}.polluted).toBeUndefined()
  })

  it('bounds depth and length before processing', () => {
    expect(() => processJson({ input: '['.repeat(257) + '0' + ']'.repeat(257) })).toThrow('256')
    expect(() => processJson({ input: ' '.repeat(MAX_JSON_LENGTH + 1) })).toThrow('2 Mi')
  })

  it('preserves escaped surrogate code units but refuses lossy UTF-8 text conversion', () => {
    expect(processJson({ input: '"\\ud800"' }).output).toBe('"\\ud800"')
    expect(() => processJson({ input: '"\\ud800"', operation: 'unescape' })).toThrow('Unicode')
    expect(() => processJson({ input: '"\ud800"' })).toThrow('Unicode')
  })

  it('limits dense token streams before constructing a very large syntax tree', () => {
    expect(() => processJson({ input: '[' + '0,'.repeat(250001) + '0]' })).toThrow('50 万')
  })

  it('rejects oversized indentation expansion before allocating the formatted output', () => {
    const input = '['.repeat(256) + Array(10000).fill('0').join(',') + ']'.repeat(256)
    expect(() => processJson({ input, indent: '4' })).toThrow('8 Mi')
    expect(processJson({ input, operation: 'minify' }).output).toBe(input)
  })
})
