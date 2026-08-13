import { afterEach, describe, expect, it } from 'vitest'
import {
  acquireMediaUpload,
  assertMediaUploadTotalSize,
  getActiveMediaUploadCount,
  getMediaUploadCapacity
} from '#modules/media/services/mediaUploadGuard.service.js'

const releases = []

afterEach(() => {
  while (releases.length > 0) {
    releases.pop()()
  }
  expect(getActiveMediaUploadCount()).toBe(0)
})

describe('media upload guard', () => {
  it('rejects file totals above the configured request limit', () => {
    const { maxTotalBytes } = getMediaUploadCapacity()
    expect(() => assertMediaUploadTotalSize([
      { size: maxTotalBytes },
      { size: 1 }
    ])).toThrowError(expect.objectContaining({
      statusCode: 413,
      code: 'MEDIA_UPLOAD_TOTAL_LIMIT'
    }))
  })

  it('occupies upload slots before asynchronous storage checks complete', async () => {
    const { maxConcurrent } = getMediaUploadCapacity()
    const attempts = await Promise.allSettled(
      Array.from({ length: maxConcurrent + 1 }, () => acquireMediaUpload(1024))
    )
    const fulfilled = attempts.filter((item) => item.status === 'fulfilled')
    const rejected = attempts.filter((item) => item.status === 'rejected')
    fulfilled.forEach((item) => releases.push(item.value))

    expect(fulfilled).toHaveLength(maxConcurrent)
    expect(rejected).toHaveLength(1)
    expect(rejected[0].reason).toMatchObject({
      statusCode: 429,
      code: 'MEDIA_UPLOAD_CONCURRENCY_LIMIT'
    })
    expect(getActiveMediaUploadCount()).toBe(maxConcurrent)
  })

  it('requires a declared content length before accepting an upload', async () => {
    await expect(acquireMediaUpload()).rejects.toMatchObject({
      statusCode: 411,
      code: 'MEDIA_UPLOAD_LENGTH_REQUIRED'
    })
    expect(getActiveMediaUploadCount()).toBe(0)
  })
})
