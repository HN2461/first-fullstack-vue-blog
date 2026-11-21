import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { addCalendarDays, calculateDateDifference, formatStopwatch, localCalendarDate, parseCalendarDate, parseDateTime, stopwatchElapsed, timestampMilliseconds, timestampResult } from './dateTimeTools'

describe('工具箱日历与精确时间戳', () => {
  it('严格公历校验，不归一化不存在的日期', () => {
    expect(parseCalendarDate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 })
    for (const date of ['', '2023-02-29', '2024-02-30', '2024-13-01', '0000-01-01', '2024-1-01']) expect(() => parseCalendarDate(date)).toThrow()
    expect(addCalendarDays('2024-02-28', 2)).toBe('2024-03-01')
    expect(calculateDateDifference('2024-03-01', '2024-02-28')).toBe(2)
    expect(calculateDateDifference('2024-03-01', '2024-03-01', true)).toBe(1)
    const morning = new Date(2026, 10, 20, 0, 30)
    expect(localCalendarDate(morning)).toBe('2026-11-20')
  })

  it('显式时区、早期年份和毫秒输入保持准确', () => {
    expect(parseDateTime('1970-01-01T00:00:00Z')).toBe(0)
    expect(parseDateTime('1970-01-01 08:00:00+08:00')).toBe(0)
    expect(timestampResult(parseDateTime('0001-01-01T00:00:00Z')).iso).toBe('0001-01-01T00:00:00.000Z')
    expect(parseDateTime('1970-01-01T00:00:00.001Z')).toBe(1)
    for (const value of ['2024-02-30 00:00:00', '2024-01-01 24:00:00', '2024-01-01 12:60:00', '2024-01-01T00:00:00+25:00']) expect(() => parseDateTime(value)).toThrow()
  })

  it('秒毫秒、epoch 和负小数秒可以精确往返，不静默取整', () => {
    expect(timestampMilliseconds('0', 'seconds')).toBe(0)
    expect(timestampMilliseconds('-0.001', 'seconds')).toBe(-1)
    expect(timestampMilliseconds('-1', 'milliseconds')).toBe(-1)
    expect(timestampResult(-1)).toMatchObject({ seconds: '-0.001', milliseconds: '-1', iso: '1969-12-31T23:59:59.999Z' })
    expect(timestampResult(1001).seconds).toBe('1.001')
    expect(timestampResult(timestampMilliseconds('8640000000000000', 'milliseconds')).iso).toBe('+275760-09-13T00:00:00.000Z')
    for (const [value, unit] of [['', 'seconds'], ['1.0001', 'seconds'], ['1.2', 'milliseconds'], ['1e3', 'seconds'], ['8640000000000001', 'milliseconds'], ['0', 'minutes']]) expect(() => timestampMilliseconds(value, unit)).toThrow()
  })

  it('在存在夏令时的实际时区中按日历算天，并拒绝不存在的当地时间', () => {
    const moduleUrl = new URL('./dateTimeTools.js', import.meta.url).href
    const script = [
      'const m = await import(' + JSON.stringify(moduleUrl) + ')',
      'let gapRejected = false',
      'try { m.parseDateTime("2024-03-10 02:30:00") } catch { gapRejected = true }',
      'console.log(JSON.stringify([m.calculateDateDifference("2024-03-09", "2024-03-11"), gapRejected]))'
    ].join('\n')
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', script], { env: { ...process.env, TZ: 'America/New_York' }, encoding: 'utf8' })
    expect(JSON.parse(output.trim())).toEqual([2, true])
  })

  it('秒表按单调时钟真实经过时间累加，支持暂停后续计与小时格式', () => {
    expect(stopwatchElapsed(0, 100, 1100)).toBe(1000)
    expect(stopwatchElapsed(1000, 5000, 7000)).toBe(3000)
    expect(formatStopwatch(3600000 + 61020)).toBe('01:01:01.02')
    expect(formatStopwatch(0)).toBe('00:00.00')
    expect(() => stopwatchElapsed(0, 100, 99)).toThrow()
    expect(() => formatStopwatch(Infinity)).toThrow()
  })
})
