import { afterEach, describe, expect, it } from 'vitest'
import { clearQueuedEffects, EFFECT_PRIORITIES, enqueueEffect } from './effectQueue'

afterEach(() => {
  clearQueuedEffects()
})

describe('effect queue', () => {
  it('plays blocking effects one at a time', async () => {
    const events = []
    let finishWelcome
    let finishFestival

    const welcome = enqueueEffect({
      id: 'welcome',
      priority: EFFECT_PRIORITIES.siteWelcome,
      start: (finish) => {
        events.push('welcome:start')
        finishWelcome = finish
        return () => events.push('welcome:stop')
      }
    })
    const festival = enqueueEffect({
      id: 'festival',
      priority: EFFECT_PRIORITIES.majorFestival,
      start: (finish) => {
        events.push('festival:start')
        finishFestival = finish
        return () => events.push('festival:stop')
      }
    })

    expect(events).toEqual(['welcome:start'])
    finishWelcome()
    expect(events).toEqual(['welcome:start', 'welcome:stop', 'festival:start'])
    finishFestival()
    await Promise.all([welcome, festival])
  })

  it('starts a newly queued birthday before an older low-priority festival', async () => {
    const events = []
    let finishBirthday

    const welcome = enqueueEffect({
      id: 'welcome',
      priority: EFFECT_PRIORITIES.siteWelcome,
      start: () => () => events.push('welcome:stop')
    })
    const festival = enqueueEffect({
      id: 'festival',
      priority: EFFECT_PRIORITIES.majorFestival,
      start: (finish) => {
        events.push('festival:start')
        finish()
      }
    })
    const birthday = enqueueEffect({
      id: 'birthday',
      priority: EFFECT_PRIORITIES.birthday,
      start: (finish) => {
        events.push('birthday:start')
        finishBirthday = finish
        return () => events.push('birthday:stop')
      }
    })

    expect(events).toEqual(['welcome:stop', 'birthday:start'])
    finishBirthday()
    await Promise.all([welcome, festival, birthday])
    expect(events).toEqual([
      'welcome:stop',
      'birthday:start',
      'birthday:stop',
      'festival:start'
    ])
  })
})
