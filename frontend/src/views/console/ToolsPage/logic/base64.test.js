import { describe, expect, it } from 'vitest'
import { decodeBase64Bytes, encodeBase64Bytes, MAX_BASE64_BYTES, processBase64 } from './base64'

describe('Base64 developer tool', () => {
  it.each([['', ''], ['f', 'Zg=='], ['fo', 'Zm8='], ['foo', 'Zm9v'], ['foob', 'Zm9vYg=='], ['fooba', 'Zm9vYmE='], ['foobar', 'Zm9vYmFy']])('matches RFC 4648 vector %s', (input, encoded) => {
    expect(processBase64({ input }).output).toBe(encoded)
    expect(processBase64({ input: encoded, operation: 'decode' }).output).toBe(input)
  })

  it('roundtrips UTF-8 including emoji, combining marks, NUL and an actual BOM character', () => {
    const input = '\uFEFF你好😀e\u0301\0\r\n'
    const encoded = processBase64({ input }).output
    expect(processBase64({ input: encoded, operation: 'decode' }).output).toBe(input)
  })

  it('roundtrips every byte using both alphabets without padding', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, index) => index)
    for (const urlSafe of [false, true]) {
      const encoded = encodeBase64Bytes(bytes, { urlSafe, padding: false })
      expect(decodeBase64Bytes(encoded).bytes).toEqual(bytes)
    }
    expect(encodeBase64Bytes(new Uint8Array([251, 255, 239]), { urlSafe: true })).toBe('-__v')
  })

  it('ignores ASCII whitespace only when requested', () => {
    expect(processBase64({ input: ' Z m\n9v\t', operation: 'decode' }).output).toBe('foo')
    expect(() => decodeBase64Bytes(' Zm9v', { ignoreWhitespace: false })).toThrow()
    expect(() => decodeBase64Bytes('Zm9v\u00a0')).toThrow()
  })

  it('accepts the maximum decoded size with MIME line wrapping', () => {
    const bytes = new Uint8Array(MAX_BASE64_BYTES).fill(65)
    const encoded = encodeBase64Bytes(bytes).match(/.{1,76}/g).join('\r\n')
    const decoded = decodeBase64Bytes(encoded, { ignoreWhitespace: true }).bytes
    expect(decoded.byteLength).toBe(bytes.byteLength)
    expect(Buffer.compare(Buffer.from(decoded), Buffer.from(bytes))).toBe(0)
  })

  it.each(['A', 'A===', '=AAA', 'Zg=', 'Zg===', 'Zm=8', 'Zm8===', 'AA@@', 'AB==', 'Zm9=', '+_=='])('rejects corrupted input %s', (input) => {
    expect(() => decodeBase64Bytes(input)).toThrow()
  })

  it('checks explicit alphabet settings', () => {
    expect(() => decodeBase64Bytes('-__v', { alphabet: 'standard' })).toThrow('字母表')
    expect(() => decodeBase64Bytes('+//v', { alphabet: 'url' })).toThrow('字母表')
    expect(() => decodeBase64Bytes('Zm9v', { alphabet: 'unknown' })).toThrow()
  })

  it('distinguishes valid binary data from malformed Base64 or UTF-8', () => {
    const result = processBase64({ input: '/wA=', operation: 'decode', alphabet: 'auto' })
    expect(result.binary).toBe(true)
    expect(result.output).toBe('FF 00')
    expect(result.bytes).toEqual(new Uint8Array([255, 0]))
    expect(() => processBase64({ input: '/wA=', operation: 'decode', outputFormat: 'text' })).toThrow('非 UTF-8')
  })

  it('preserves complete binary download bytes while explicitly limiting preview', () => {
    const bytes = new Uint8Array(65537).fill(255)
    const encoded = encodeBase64Bytes(bytes)
    const result = processBase64({ input: encoded, operation: 'decode' })
    expect(result.truncated).toBe(true)
    expect(result.bytes).toEqual(bytes)
    expect(result.output.split(' ')).toHaveLength(65536)
    expect(result.message).toContain('下载完整原件')
  })

  it('supports Base64 Data URLs without rendering their content', () => {
    const encoded = processBase64({ input: '你好', asDataUrl: true, mimeType: 'text/plain' }).output
    expect(encoded).toMatch(/^data:text\/plain;base64,/)
    const decoded = processBase64({ input: encoded, operation: 'decode' })
    expect(decoded.output).toBe('你好')
    expect(decoded.mimeType).toBe('text/plain')
    expect(() => decodeBase64Bytes('data:text/plain,hello')).toThrow('base64')
    expect(() => processBase64({ input: 'x', asDataUrl: true, alphabet: 'url' })).toThrow('标准')
    expect(() => decodeBase64Bytes('data:text/plain;base64;x=y,Zm9v')).toThrow('结尾')
    expect(() => decodeBase64Bytes('data:application/octet-stream;base64,-__v')).toThrow('标准')
    expect(() => decodeBase64Bytes('data:text/plain;base64;base64,Zm9v')).toThrow('参数')
    expect(processBase64({ input: 'data:text/plain;charset=utf-8;base64,Zm9v', operation: 'decode' }).output).toBe('foo')
  })

  it.each(['\ud800', '\udc00', 'a\ud800b'])('rejects broken Unicode instead of replacing it %s', (input) => {
    expect(() => processBase64({ input })).toThrow('Unicode')
  })

  it('limits byte input and rejects unknown operations', () => {
    expect(() => processBase64({ bytes: new Uint8Array(MAX_BASE64_BYTES + 1) })).toThrow('2 MiB')
    expect(() => processBase64({ input: '你好'.repeat(MAX_BASE64_BYTES / 2) })).toThrow('2 MiB')
    expect(() => processBase64({ operation: 'unknown' })).toThrow()
  })
})
