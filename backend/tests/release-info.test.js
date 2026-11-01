import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { getReleaseInfo, normalizeReleaseInfo } from '#modules/dashboard/services/releaseInfo.service.js'

let tempDirectory = ''

afterEach(async () => {
  if (tempDirectory) {
    await fs.rm(tempDirectory, { recursive: true, force: true })
    tempDirectory = ''
  }
})

describe('release info', () => {
  it('normalizes valid release metadata for display', () => {
    expect(normalizeReleaseInfo({
      lastSuccessfulReleaseAt: '2026-11-01T13:35:00.000Z',
      target: 'frontend',
      releaseId: '20261101-213500'
    })).toEqual({
      lastSuccessfulReleaseAt: '2026-11-01T13:35:00.000Z',
      target: 'frontend',
      releaseId: '20261101-213500'
    })
  })

  it('returns empty values for invalid metadata', () => {
    expect(normalizeReleaseInfo({
      lastSuccessfulReleaseAt: 'not-a-date',
      target: 'unknown',
      releaseId: 'invalid'
    })).toEqual({
      lastSuccessfulReleaseAt: null,
      target: null,
      releaseId: null
    })
  })

  it('reads a release metadata file without requiring a database', async () => {
    tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'release-info-'))
    const filePath = path.join(tempDirectory, 'release-meta.json')
    await fs.writeFile(filePath, JSON.stringify({
      lastSuccessfulReleaseAt: '2026-11-01T13:35:00.000Z',
      target: 'full',
      releaseId: '20261101-213500'
    }))

    await expect(getReleaseInfo(filePath)).resolves.toEqual({
      lastSuccessfulReleaseAt: '2026-11-01T13:35:00.000Z',
      target: 'full',
      releaseId: '20261101-213500'
    })
  })

  it('returns an empty record when no successful release has been recorded', async () => {
    await expect(getReleaseInfo(path.join(os.tmpdir(), 'missing-release-meta.json'))).resolves.toEqual({
      lastSuccessfulReleaseAt: null,
      target: null,
      releaseId: null
    })
  })
})
