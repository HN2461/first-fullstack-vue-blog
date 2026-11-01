import { describe, expect, it } from 'vitest'
import { formatReleaseInfo } from './releaseInfo'

describe('formatReleaseInfo', () => {
  it('formats UTC publish time as China local time and names the release target', () => {
    expect(formatReleaseInfo({
      lastSuccessfulReleaseAt: '2026-11-01T13:35:00.000Z',
      target: 'full'
    })).toBe('2026/11/01 21:35（完整发布）')
  })

  it('shows an explicit empty state when no successful release is recorded', () => {
    expect(formatReleaseInfo(null)).toBe('尚未记录')
    expect(formatReleaseInfo({ lastSuccessfulReleaseAt: 'invalid' })).toBe('尚未记录')
  })
})
