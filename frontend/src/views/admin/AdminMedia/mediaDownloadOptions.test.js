import { describe, expect, it } from 'vitest'
import {
  buildMediaDownloadNames,
  buildSingleMediaDownloadName,
  createDefaultArchiveName,
  normalizeArchiveName
} from './mediaDownloadOptions'

const records = [
  { filename: '178100-source-image.png', originalName: '项目:首页截图.jpg' },
  { filename: '178101-source-document.docx', originalName: '项目 首页截图.docx' },
  { filename: '178102-source-image.png', originalName: '项目:首页截图.png' }
]

describe('media download naming options', () => {
  it('uses media library names while preserving actual file extensions and avoiding duplicates', () => {
    expect(buildMediaDownloadNames(records, { namingMode: 'original' })).toEqual([
      '项目-首页截图.png',
      '项目 首页截图.docx',
      '项目-首页截图-2.png'
    ])
    expect(buildSingleMediaDownloadName(records[0])).toBe('项目-首页截图.png')
  })

  it('supports custom prefix and sequence-only naming', () => {
    expect(buildMediaDownloadNames(records, {
      namingMode: 'prefix',
      prefix: '课程资料/截图'
    })).toEqual([
      '课程资料-截图-01.png',
      '课程资料-截图-02.docx',
      '课程资料-截图-03.png'
    ])

    expect(buildMediaDownloadNames(records, { namingMode: 'sequence' })).toEqual([
      '01.png',
      '02.docx',
      '03.png'
    ])
  })

  it('normalizes custom archive names and provides a dated default', () => {
    const date = new Date('2026-08-15T20:35:00+08:00')
    expect(createDefaultArchiveName(date)).toBe('媒体资源-20260815-2035')
    expect(normalizeArchiveName('项目/资料.zip', date)).toBe('项目-资料.zip')
    expect(normalizeArchiveName('', date)).toBe('媒体资源-20260815-2035.zip')
  })
})
