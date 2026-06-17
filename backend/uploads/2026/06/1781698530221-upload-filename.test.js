import { describe, expect, it } from 'vitest'
import { buildSafeStoredFilename, decodeUploadFilename } from '../src/utils/uploadFilename.js'

describe('upload filename utils', () => {
  it('keeps regular ascii filenames unchanged', () => {
    expect(decodeUploadFilename('hello-world.txt')).toBe('hello-world.txt')
    expect(buildSafeStoredFilename('hello-world.txt')).toBe('hello-world.txt')
  })

  it('repairs mojibake chinese filenames from multipart uploads', () => {
    const mojibake = 'è®¾è®¡ä¸ªäººåå®¢å¾æ .png'
    expect(decodeUploadFilename(mojibake)).toBe('设计个人博客图标.png')
    expect(buildSafeStoredFilename(mojibake)).toBe('设计个人博客图标.png')
  })

  it('preserves already-correct unicode filenames', () => {
    expect(decodeUploadFilename('封面图.png')).toBe('封面图.png')
    expect(buildSafeStoredFilename('封面图.png')).toBe('封面图.png')
  })
})
