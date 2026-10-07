import { describe, expect, it } from 'vitest'
import { getFestivalHistory, getFestivalSchedule, getParticleItems } from './festivalCalendar'

describe('festival calendar birthday schedule', () => {
  it('keeps a later birthday when the full upcoming schedule is requested', () => {
    const schedule = getFestivalSchedule('2026-07-19', Number.POSITIVE_INFINITY, {
      birthday: '2002-10-13',
      birthdayCalendar: 'lunar'
    })

    expect(schedule.some((item) => item.key === 'birthday-lunar')).toBe(true)
  })

  it('keeps an earlier birthday when the full history is requested', () => {
    const history = getFestivalHistory('2026-07-19', Number.POSITIVE_INFINITY, {
      birthday: '2002-01-01',
      birthdayCalendar: 'solar'
    })

    expect(history.some((item) => item.key === 'birthday-solar')).toBe(true)
  })

  it('uses a denser full-width particle field on desktop and a lighter mobile field', () => {
    const schedule = getFestivalSchedule('2026-02-17', Number.POSITIVE_INFINITY)
    const springFestival = schedule.find((item) => item.key === 'spring-festival')

    expect(springFestival.atmosphere.theme).toBe('lantern')
    expect(getParticleItems(springFestival, false)).toHaveLength(Math.max(10, Math.round(springFestival.atmosphere.particleCount * 1.25)))
    expect(getParticleItems(springFestival, true)).toHaveLength(Math.max(5, Math.round(springFestival.atmosphere.particleCount * 0.55)))
    expect(Number.parseFloat(getParticleItems(springFestival, false)[0].left)).toBeGreaterThanOrEqual(4)
    expect(Number.parseFloat(getParticleItems(springFestival, false).at(-1).left)).toBeLessThanOrEqual(96)
  })
})
