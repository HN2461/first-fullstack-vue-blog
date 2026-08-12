import { describe, expect, it, vi } from 'vitest'
import {
  createTransferTracker,
  formatRemainingTime,
  formatTransferSize,
  formatTransferSpeed
} from './transferProgress'

describe('transfer progress', () => {
  it('formats large sizes, speeds and remaining time', () => {
    expect(formatTransferSize(1024 ** 3)).toBe('1.00 GB')
    expect(formatTransferSpeed(2 * 1024 ** 2)).toBe('2.0 MB/s')
    expect(formatRemainingTime(61)).toBe('约 2 分钟')
  })

  it('reports percent and a stable remaining estimate', () => {
    const now = vi.spyOn(performance, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1000)
    const updates = []
    const update = createTransferTracker((value) => updates.push(value))

    update(50, 100)

    expect(updates[0].percent).toBe(50)
    expect(updates[0].speed).toBe(50)
    expect(updates[0].remainingSeconds).toBe(1)
    now.mockRestore()
  })
})
