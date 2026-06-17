import { describe, expect, it } from 'vitest'
import { normalizeTableResponse } from './tableData'

describe('normalizeTableResponse', () => {
  it('supports standard items and total response', () => {
    const result = normalizeTableResponse({
      items: [{ id: 1 }, { id: 2 }],
      total: 12
    })

    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(12)
  })

  it('supports legacy list-shaped response', () => {
    const result = normalizeTableResponse({
      list: [{ id: 1 }],
      count: 8
    })

    expect(result.items).toEqual([{ id: 1 }])
    expect(result.total).toBe(8)
  })

  it('supports nested data response', () => {
    const result = normalizeTableResponse({
      data: {
        rows: [{ id: 3 }, { id: 4 }],
        totalCount: 99
      }
    })

    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(99)
  })

  it('falls back to array length when total is missing', () => {
    const result = normalizeTableResponse([{ id: 1 }, { id: 2 }, { id: 3 }])

    expect(result.items).toHaveLength(3)
    expect(result.total).toBe(3)
  })
})
